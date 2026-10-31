#!/usr/bin/env python3
"""De voces de LilyPond a la notación de la app. Solo traduce lo que hay escrito: no añade notas.
Las alturas salen de la fuente; la cuerda, el traste y el dedo, de buscar la posición más cómoda (digitación propuesta),
respetando los dedos que traiga la fuente. Uso como módulo:
  ev = voz(texto, base="c'", relativa=True)      # eventos {dur (en negras), midis, dedos, tres, liga, s}
  compases([ev1, ev2], largo=3, anacrusa=.5)     # reparte y digita; devuelve los compases de la app"""
import re

AFIN = {1: 64, 2: 59, 3: 55, 4: 50, 5: 45, 6: 40}
PC = {'c': 0, 'd': 2, 'e': 4, 'f': 5, 'g': 7, 'a': 9, 'b': 11}
ORD = 'cdefgab'
FIG = {4.0: ('1', False), 3.0: ('2', True), 2.0: ('2', False), 1.5: ('4', True), 1.0: ('4', False), 0.75: ('8', True), 0.5: ('8', False), 0.375: ('16', True), 0.25: ('16', False), 0.125: ('32', False)}
TOK = re.compile(r"\\(?:times|tuplet)\s*\d+/\d+\s*\{|\\grace\s*\{[^}]*\}|<([^<>]*)>(\d+\.*)?|\bq(\d+\.*)?|([a-g])(isis|eses|is|es)?([',]*)!?\??(\d+\.*)?(\\rest)?|([rs])(\d+\.*)?|\\[A-Za-z]+|\}|-(\d)|~|\(|\)")


def limpiar(t):
    t = re.sub(r'%\{.*?%\}', '', t, flags=re.S)
    t = re.sub(r'%.*', '', t)
    t = re.sub(r'"[^"]*"', '', t)
    t = re.sub(r'\\markup\s*\{[^}]*\}', '', t)
    t = re.sub(r"\\(override|set|once|revert|unset)\b[^\n|]*", '', t)
    t = re.sub(r'#\S+', '', t)
    return t


def voz(texto, base="c'", relativa=True, sonido=-12):
    t = limpiar(texto)
    letra, oc = base[0], 3 + base.count("'") - base.count(',')
    refer = (letra, oc)
    dur = 1.0
    tres = 0
    pila = []
    sal = []

    def altura(l, ac, marcas):
        nonlocal refer
        if relativa:
            pl, o = refer
            d = ORD.index(l) - ORD.index(pl)
            if d > 3: o -= 1
            elif d < -3: o += 1
        else:
            o = oc
        o += marcas.count("'") - marcas.count(',')
        if relativa: refer = (l, o)
        return (o + 1) * 12 + PC[l] + {'is': 1, 'es': -1, 'isis': 2, 'eses': -2, None: 0, '': 0}[ac] + sonido

    def figura(s):
        nonlocal dur
        if s:
            m = re.match(r'(\d+)(\.*)', s)
            dur = 4 / int(m[1]) * (1.5 if m[2] else 1)
        return dur

    ultimo = None
    i = 0
    abierto = False
    while i < len(t):
        m = TOK.search(t, i)
        if not m: break
        i = m.end()
        x = m[0]
        if x.startswith('\\times') or x.startswith('\\tuplet'):
            pila.append('t'); tres += 1; continue
        if x == '}':
            if pila: pila.pop(); tres -= 1
            continue
        if x.startswith('\\grace') or x.startswith('\\') and not x.startswith('\\rest'): continue
        if x == '~':
            if sal: sal[-1]['liga'] = True
            continue
        if x == '(':
            abierto = True; continue
        if x == ')':
            if len(sal) > 1 and not sal[-1].get('s'): sal[-2]['slur'] = True
            continue
        if m[11]:
            if sal and sal[-1]['midis']: sal[-1]['dedos'][-1] = int(m[11])
            continue
        if m[1] is not None:
            midis, dedos = [], []
            pri = None
            for n in re.finditer(r"([a-g])(isis|eses|is|es)?([',]*)!?\??(?:\\\d)?(?:-(\d))?", m[1]):
                midis.append(altura(n[1], n[2], n[3]))
                if pri is None: pri = refer
                dedos.append(int(n[4]) if n[4] else None)
            if pri: refer = pri
            ultimo = (midis, dedos)
            sal.append({'dur': figura(m[2]), 'midis': midis, 'dedos': dedos, 'tres': tres > 0})
            continue
        if x.startswith('q'):
            sal.append({'dur': figura(m[3]), 'midis': list(ultimo[0]), 'dedos': list(ultimo[1]), 'tres': tres > 0})
            continue
        if m[9]:
            sal.append({'dur': figura(m[10]), 'midis': [], 'dedos': [], 's': True, 'oculto': m[9] == 's', 'tres': tres > 0})
            continue
        if m[8]:  # b\rest: un silencio colocado
            altura(m[4], m[5], m[6]) if False else None
            sal.append({'dur': figura(m[7]), 'midis': [], 'dedos': [], 's': True, 'tres': tres > 0})
            continue
        mi = altura(m[4], m[5], m[6])
        ultimo = ([mi], [None])
        sal.append({'dur': figura(m[7]), 'midis': [mi], 'dedos': [None], 'tres': tres > 0})
    return sal


def trocear(d):
    out = []
    for v in sorted(FIG, reverse=True):
        while d >= v - 1e-9:
            out.append(v); d -= v
    return out


def por_compases(ev, largo, anacrusa=0.0):
    res, cur, s = [], [], 0.0
    obj = anacrusa or largo
    for e in ev:
        cur.append(e)
        s += e['dur'] * (2 / 3 if e.get('tres') else 1)
        if s > obj + 1e-6: raise ValueError(f'compás {len(res) + 1}: pasa de {obj} negras ({s})')
        if abs(s - obj) < 1e-6:
            res.append(cur); cur, s, obj = [], 0.0, largo
    if cur: raise ValueError(f'sobran {s} negras tras el compás {len(res)}')
    return res


def opciones(midi, minc=1, maxc=6):
    return [(c, midi - AFIN[c]) for c in range(minc, maxc + 1) if 0 <= midi - AFIN[c] <= 19]


def coste_sitio(c, t, P):
    if t == 0: return 0
    if P <= t <= P + 3: return .2 * (t - P > 2) + .05 * c * 0
    return 4 + min(abs(t - P), abs(t - P - 3)) * 2


def digitar(bloques, fuerza=None):
    """bloques: lista de cortes de tiempo; cada corte, lista de notas [midi, dedo_fuente, voz]. Devuelve (posición, {(i,k): (c,t)}) por programación dinámica."""
    posiciones = list(range(1, 17))
    prev = {p: (0 if p == 1 else p * .3, None) for p in posiciones}
    hist = []
    for b in bloques:
        act, elec = {}, {}
        for P in posiciones:
            # Reparte las notas del corte en cuerdas distintas, de la más aguda a la más grave.
            mejor, sitios = 1e9, None

            def rec(k, usadas, coste, acum, ultc):
                nonlocal mejor, sitios
                if coste >= mejor: return
                if k == len(notas):
                    mejor, sitios = coste, list(acum); return
                midi, ded, _ = notas[k]
                for c, t in opciones(midi):
                    if c in usadas or c <= ultc: continue
                    g = coste_sitio(c, t, P)
                    if ded and t and t - ded + 1 != P: g += 1.5
                    if ded == 0 and t: g += 3
                    rec(k + 1, usadas | {c}, coste + g, acum + [(c, t)], c)

            notas = sorted(b, key=lambda x: -x[0])
            rec(0, frozenset(), 0, [], 0)
            if sitios is None:
                act[P] = (1e9, None); continue
            c0, q0 = min(((prev[Q][0] + (0 if Q == P else 1 + abs(Q - P) * .5), Q) for Q in posiciones))
            act[P] = (c0 + mejor, q0)
            elec[P] = {id(n): s for n, s in zip(notas, sitios)}
        hist.append((act, elec))
        prev = act
    P = min(prev, key=lambda p: prev[p][0])
    plan = [None] * len(bloques)
    for i in range(len(bloques) - 1, -1, -1):
        act, elec = hist[i]
        if P not in elec: raise ValueError(f'sin digitación posible: corte {i}: {[x[0] for x in bloques[i]]}')
        plan[i] = (P, elec[P])
        P = act[P][1] if act[P][1] else P
    return plan


def compases(voces, largo, anacrusa=0.0, mano=None, rotulos=None, dedo_libre=True):
    """voces: listas de eventos, ya sin repeticiones. Reparte, digita y escribe. La mano derecha se propone: p en los bajos; i-m-a arriba."""
    porv = [por_compases(v, largo, anacrusa) for v in voces]
    n = len(porv[0])
    assert all(len(p) == n for p in porv), [len(p) for p in porv]
    out = []
    # Todos los ataques, en orden de tiempo, para digitar juntas las notas que suenan a la vez.
    cortes = {}
    for k, pv in enumerate(porv):
        for i, ev in enumerate(pv):
            t = 0.0
            for e in ev:
                if e['midis']:
                    if not e.get('ata'):
                        cortes.setdefault((i, round(t, 4)), []).append(e)
                t += e['dur'] * (2 / 3 if e.get('tres') else 1)
    orden = sorted(cortes)
    bloques = []
    mapa = {}
    for clave in orden:
        lista = []
        for e in cortes[clave]:
            for j, mi in enumerate(e['midis']):
                x = [mi, e['dedos'][j] if j < len(e['dedos']) else None, e]
                lista.append(x)
                mapa[id(x)] = (e, j)
        # Unísonos entre voces: se quedan en una sola nota dibujada por voz, pero necesitan cuerdas distintas; si no caben, se toca una.
        vistas, unicas = set(), []
        for x in lista:
            if x[0] in vistas:
                x[2].setdefault('dup', []).append(x[0]); continue
            vistas.add(x[0]); unicas.append(x)
        bloques.append(unicas)
    plan = digitar(bloques)
    sitio = {}
    for b, (P, el) in zip(bloques, plan):
        for x in b:
            c, t = el[id(x)]
            e, j = mapa[id(x)]
            e.setdefault('sitios', {})[j] = (c, t)
            e['P'] = P
            sitio[x[0], id(b)] = (c, t)
        for e in {id(x[2]): x[2] for x in b}.values():
            pass
    for b in bloques:
        pass
    # Las notas duplicadas (unísono entre voces) toman el sitio de la que suena.
    for clave, b in zip(orden, bloques):
        por_midi = {x[0]: x for x in b}
        for e in cortes[clave]:
            for j, mi in enumerate(e['midis']):
                if j not in e.get('sitios', {}):
                    x = por_midi[mi]
                    e2, j2 = mapa[id(x)]
                    e.setdefault('sitios', {})[j] = e2['sitios'][j2]
                    e['P'] = e2['P']
    for i in range(n):
        vs = []
        for k, pv in enumerate(porv):
            lista = []
            for idx, e in enumerate(pv[i]):
                if e['midis']:
                    fig = FIG.get(round(e['dur'], 4))
                    if not fig: raise ValueError(f"duración sin figura: {e['dur']}")
                    x = {'d': fig[0]}
                    if fig[1]: x['p'] = True
                    if e.get('tres'): x['tres'] = True
                    P = e.get('P', 1)
                    ded = lambda t, f: 0 if t == 0 else (f if f else max(1, min(4, t - P + 1)))
                    if len(e['midis']) > 1:
                        ac = [{'c': e['sitios'][j][0], 't': e['sitios'][j][1]} for j in range(len(e['midis']))]
                        ac.sort(key=lambda z: z['c'])
                        x['acorde'] = ac
                        x['dedos'] = [ded(a['t'], None) for a in ac]
                        x['mano'] = 'p' if min(a['c'] for a in ac) >= 4 else 'p'
                    else:
                        c, t = e['sitios'][0]
                        x['c'], x['t'] = c, t
                        if t: x['dedo'] = ded(t, e['dedos'][0])
                        x['mano'] = (mano(c, k, i, idx) if mano else ('p' if c >= 4 or k == 1 else 'i'))
                    if e.get('liga'): x['tie'] = True
                    lista.append(x)
                else:
                    for v in trocear_tres(e):
                        lista.append(v)
            vs.append(lista)
        # Ligados: dos notas unidas por arco en la misma cuerda.
        out.append({'voces': vs})
    aplicar_ligados(porv, out)
    return out


def trocear_tres(e):
    if e.get('tres'):
        f = FIG[round(e['dur'], 4)]
        return [{'d': f[0], 's': True, 'tres': True}]
    o = []
    for v in trocear(e['dur']):
        s = {'d': FIG[v][0], 's': True}
        if e.get('oculto'): s['oculto'] = True
        if FIG[v][1]: s['p'] = True
        o.append(s)
    return o


def aplicar_ligados(porv, out):
    for k, pv in enumerate(porv):
        for i, ev in enumerate(pv):
            notas = out[i]['voces'][k]
            if len(notas) != len(ev): continue
            for j, e in enumerate(ev):
                if not e.get('slur') or j + 1 >= len(notas): continue
                a, b = notas[j], notas[j + 1]
                if a.get('c') and a.get('c') == b.get('c') and a['t'] != b['t']:
                    a['lig'] = 'h' if b['t'] > a['t'] else 'p'
                    b.pop('mano', None)


def alternar(cs, voz=0, dedos=('i', 'm')):
    """Melodía de una sola línea: i-m alternos en las cuerdas agudas."""
    u = 0
    for m in cs:
        for n in m['voces'][voz]:
            if n.get('mano') and n.get('c', 6) <= 3:
                n['mano'] = dedos[u % len(dedos)]; u += 1


def rellenar_silencios(ev, total):
    """Quita duraciones de relleno: útil para voces con saltos."""
    return ev
