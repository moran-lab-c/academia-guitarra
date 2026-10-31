#!/usr/bin/env python3
"""De una voz de LilyPond (modo relative) a compases de la notación de la app. Solo traduce lo que hay escrito: no añade notas.
Las alturas salen de la fuente; la cuerda y el traste, de la primera posición posible o de lo que se le fuerce nota a nota.
Uso como módulo: voz(texto, base='c\\'', sonido=-12) y compases(voz, largo) ."""
import re

AFIN = {1: 64, 2: 59, 3: 55, 4: 50, 5: 45, 6: 40}
PC = {'c': 0, 'd': 2, 'e': 4, 'f': 5, 'g': 7, 'a': 9, 'b': 11}
ORD = 'cdefgab'
TOKEN = re.compile(r"<([^>]*)>|([a-gsr])(isis|eses|is|es|s(?=[\s\d.\-~()\[\]\\|])|)?([',]*)(\d+)?(\.*)|\\[A-Za-z]+(?:\s*\"[^\"]*\")?|-(\d)|~|\|")


def voz(texto, base="c'", sonido=0):
    """Devuelve [{dur (en negras), midis: [...], dedos: [...], silencio, liga}]. sonido: lo que se suma para pasar de lo escrito a lo que suena."""
    texto = re.sub(r'%.*', '', texto)
    letra, octava = base[0], 4 + base.count("'") - base.count(',') - 1
    actual = (letra, octava)
    dur_actual = 1.0
    salida = []

    def relativa(l, marcas):
        nonlocal actual
        pl, oc = actual
        d = ORD.index(l) - ORD.index(pl)
        if d > 3: oc -= 1
        elif d < -3: oc += 1
        oc += marcas.count("'") - marcas.count(',')
        actual = (l, oc)
        return oc

    def altera(s):
        return {'is': 1, 'es': -1, 'isis': 2, 'eses': -2, 's': -1, '': 0, None: 0}[s]

    i = 0
    while i < len(texto):
        m = TOKEN.match(texto, i)
        if not m:
            i += 1
            continue
        i = m.end()
        tok = m.group(0)
        if tok.startswith('\\') or tok == '|':
            continue
        if tok == '~':
            if salida: salida[-1]['liga'] = True
            continue
        if tok.startswith('-'):
            if salida and salida[-1]['midis']: salida[-1]['dedos'][-1] = int(m.group(7))
            continue
        if m.group(1) is not None:
            midis, dedos = [], []
            guardado = actual
            primero = None
            for n in re.finditer(r"([a-g])(isis|eses|is|es)?([',]*)(?:\\\d)?(?:-(\d))?", m.group(1)):
                oc = relativa(n.group(1), n.group(3))
                if primero is None: primero = actual
                midis.append((oc + 1) * 12 + PC[n.group(1)] + altera(n.group(2)) + sonido)
                dedos.append(int(n.group(4)) if n.group(4) else None)
            actual = primero or guardado  # tras un acorde, la referencia es su primera nota
            d = re.match(r'(\d+)(\.*)', texto[i:])
            if d:
                dur_actual = 4 / int(d.group(1)) * (1.5 if d.group(2) else 1)
                i += d.end()
            salida.append({'dur': dur_actual, 'midis': midis, 'dedos': dedos})
            continue
        l, ac, marcas, num, pts = m.group(2), m.group(3), m.group(4), m.group(5), m.group(6)
        if num:
            dur_actual = 4 / int(num) * (1.5 if pts else 1)
        if l in 'sr':
            salida.append({'dur': dur_actual, 'midis': [], 'dedos': [], 'silencio': True})
            continue
        oc = relativa(l, marcas)
        salida.append({'dur': dur_actual, 'midis': [(oc + 1) * 12 + PC[l] + altera(ac) + sonido], 'dedos': [None]})
    return salida


def sitio(midi, usadas=(), maxt=4):
    """La cuerda y el traste más graves de mástil (primera posición), sin repetir cuerda dentro de un acorde."""
    opciones = [(midi - a, c) for c, a in AFIN.items() if 0 <= midi - a and c not in usadas]
    dentro = [o for o in opciones if o[0] <= maxt]
    t, c = min(dentro or opciones)
    return c, t


FIG = {4.0: ('1', False), 3.0: ('2', True), 2.0: ('2', False), 1.5: ('4', True), 1.0: ('4', False), 0.75: ('8', True), 0.5: ('8', False), 0.25: ('16', False)}


def trocear(dur):
    """Una duración como figuras escribibles (para silencios y notas que no tengan una figura sola)."""
    out = []
    for v in sorted(FIG, reverse=True):
        while dur >= v - 1e-9:
            out.append(v)
            dur -= v
    return out


def a_notas(ev, mano=None):
    out = []
    for e in ev:
        fig, punt = FIG[e['dur']] if e['dur'] in FIG else (None, None)
        if e.get('silencio'):
            for v in trocear(e['dur']):
                n = {'d': FIG[v][0], 's': True}
                if FIG[v][1]: n['p'] = True
                out.append(n)
            continue
        if fig is None: raise ValueError(f"duración sin figura: {e['dur']}")
        n = {'d': fig}
        if punt: n['p'] = True
        if len(e['midis']) > 1:
            usadas = []
            ac = []
            for m in sorted(e['midis'], reverse=True):
                c, t = sitio(m, usadas)
                usadas.append(c)
                ac.append({'c': c, 't': t})
            n['acorde'] = ac
        else:
            c, t = sitio(e['midis'][0])
            n['c'], n['t'] = c, t
            if t > 0:
                n['dedo'] = e['dedos'][0] or (t if t <= 4 else ((t - 1) % 4) + 1)
        if e.get('liga'): n['tie'] = True
        n['mano'] = mano(n) if mano else ('p' if n.get('c', 6) >= 4 else 'i')
        out.append(n)
    return out


def compases(notas, largo, anacrusa=0.0):
    """Reparte notas en compases de largo negras. Una nota nunca cruza la barra (la fuente ya las escribe así)."""
    durs = {'1': 4, '2': 2, '4': 1, '8': .5, '16': .25, '32': .125}
    res, cur, s = [], [], 0.0
    obj = anacrusa or largo
    for n in notas:
        cur.append(n)
        s += durs[n['d']] * (1.5 if n.get('p') else 1)
        if s > obj + 1e-9: raise ValueError(f'compás {len(res) + 1}: pasa de {obj} negras')
        if abs(s - obj) < 1e-9:
            res.append(cur)
            cur, s, obj = [], 0.0, largo
    if cur: raise ValueError(f'sobran {s} negras al final')
    return res
