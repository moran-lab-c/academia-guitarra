// La ruta de un curso como camino serpenteante (lámina P2-Curso de B+) y su versión mínima para «Dónde estás».
// Se mide el ancho disponible y se reparte el camino en filas (la primera de izquierda a derecha, la siguiente de derecha
// a izquierda…): funciona igual a 1000 que a 1600 px. Lo hecho se comprime en puntos, el tramo abierto va a tamaño
// completo con las etiquetas alternando arriba y abajo, los siguientes más pequeños y discontinuos, los borradores como
// ficha y al final la medalla de la obra final y una pista del curso siguiente. Los estilos están en estilos/componentes.css.
import { h } from '../nucleo/dom.js';
import { iconoArea, glifoEstado, colorArea, NOMBRE_AREA, segmentosSuaves } from './marcas.js';
import { yaMostrado, marcarMostrado } from './titulo.js';
import { plural } from './comunes.js';

const SEPARACION = 8;       // entre el nodo y su etiqueta
const MARGEN = 84;          // de los centros a los bordes (cabe media etiqueta)
const AMPLITUD = 20;        // cuánto serpentea el camino
const FORMAS = {            // paso: lo que ocupa a lo largo del camino · d: diámetro del nodo
  punto: { paso: 28, pasoObra: 32, d: 20, dObra: 24 },
  nodo: { paso: 78, pasoObra: 84, d: 40, dObra: 44 },
  menudo: { paso: 50, pasoObra: 56, d: 26, dObra: 30 },
  ficha: { paso: 128, d: 40 },
  medalla: { paso: 180, d: 76 },
  pista: { paso: 196, d: 34 },
};
const TEXTO_ESTADO = {
  dominado: 'dominado', hecho: 'hecho', repaso: 'necesita repaso', actual: 'ahora', recomendado: 'recomendado', proximo: 'disponible', futuro: 'por llegar',
};
const reducido = () => globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const ENTERO = n => Math.round(n);

// ---------------------------------------------------------------- Datos → lista de elementos a lo largo del camino
function elementos(ruta) {
  const lista = [];
  for (const [ti, tramo] of ruta.tramos.entries()) {
    const ficha = tramo.borrador || (!tramo.pasos?.length && tramo.estado === 'por-llegar');
    if (ficha) { lista.push({ forma: 'ficha', tramo, ti, primero: true }); continue; }
    const forma = tramo.estado === 'hecho' ? 'punto' : tramo.estado === 'abierto' ? 'nodo' : 'menudo';
    tramo.pasos.forEach((paso, i) => lista.push({ forma, tramo, ti, paso, primero: i === 0 }));
  }
  if (ruta.final) lista.push({ forma: 'medalla', final: ruta.final, ti: -1 });
  if (ruta.siguienteCurso) lista.push({ forma: 'pista', siguiente: ruta.siguienteCurso, ti: -1 });
  for (const it of lista) {
    const F = FORMAS[it.forma];
    it.obra = it.paso?.tipo === 'obra';
    it.a = it.obra ? F.pasoObra : F.paso;
    it.d = it.obra ? F.dObra : F.d;
  }
  return lista;
}

// ---------------------------------------------------------------- Etiquetas: qué dicen, cuánto miden y a qué lado van
const nombre = a => (NOMBRE_AREA[a] ?? '').toUpperCase();
function kicker(p) {
  const rep = p.area === 'repertorio' || p.area === 'fl-toque';
  let texto, color = colorArea(p.area);
  if (p.insertado || p.tipo === 'refuerzo') { texto = 'REFUERZO'; color = 'var(--ocre)'; }
  else if (p.tipo === 'obra') { texto = 'OBRA' + (p.area && !rep ? ` · ${nombre(p.area)}` : ''); color = colorArea(p.area ?? 'repertorio'); }
  else if (p.tipo === 'aplicacion') { texto = 'APLICACIÓN'; color = colorArea(p.area ?? 'repertorio'); }
  else if (p.tipo === 'evaluacion') { texto = 'EVALUACIÓN'; color = 'var(--texto-3)'; }
  else if (p.tipo === 'preparacion') { texto = 'PREPARACIÓN'; color = 'var(--texto-3)'; }
  else texto = nombre(p.area) || 'PASO';
  return { texto, color };
}

// Lo que dice la etiqueta de un paso: { kick:[nodos], titulo, obra, lineas:[{texto, ocre}] }.
function textoDe(it) {
  const p = it.paso;
  const k = kicker(p);
  const actual = p.estado === 'actual';
  const lineas = [];
  if (p.detalle) lineas.push({ texto: p.detalle, ocre: p.insertado || p.tipo === 'refuerzo' });
  else if (p.enCurso && !actual) lineas.push({ texto: 'en curso' });
  if (p.encargo) lineas.push({ texto: 'encargo de clase', ocre: true });
  if (p.conocida) lineas.push({ texto: 'la conoces · comprobar', suave: true });
  return {
    kick: [actual && h('span', { class: 'paso__ahora' }, 'AHORA'), actual && ' · ', h('span', { style: `color:${k.color}` }, k.texto)],
    titulo: p.titulo, obra: it.obra, lineas,
  };
}

// Altura aproximada (en px) de una etiqueta, para reservar sitio a cada fila. El CSS recorta con el mismo límite de líneas.
function altura(t, ancho) {
  const lin = (txt, px) => Math.ceil((txt.length * px * 1.06) / Math.max(40, ancho - 4));
  const tit = Math.min(3, lin(t.titulo, t.obra ? 6.6 : 6.4)) * (t.obra ? 17.5 : 15.6);
  const det = t.lineas.reduce((s, l) => s + Math.min(2, lin(l.texto, 5.6)) * 14.3, 0);
  return ENTERO(13 + 2 + tit + (det ? 2 + det : 0));
}

// ---------------------------------------------------------------- La disposición: filas, posiciones, etiquetas, alturas
function disponer(ruta, W) {
  const items = elementos(ruta);
  const L = Math.max(300, W - 2 * MARGEN);

  // 1. Reparto en filas, en orden (la pista se pliega bajo la medalla si no cabe en la fila).
  const filas = [];
  let fila = null, s = 0;
  for (const it of items) {
    const nueva = !fila || s + (fila.at(-1).a + it.a) / 2 > L;
    if (nueva && fila && it.forma === 'pista') { it.plegada = true; items.plegada = it; continue; }
    if (nueva) { fila = []; filas.push(fila); s = 0; } else s += (fila.at(-1).a + it.a) / 2;
    it.s = s; it.fila = filas.length - 1;
    fila.push(it);
  }
  const visibles = items.filter(it => !it.plegada);

  // 2. Posición a lo largo de cada fila (estirada si casi llena, para que el giro caiga en el borde).
  filas.forEach((f, r) => {
    const largo = f.at(-1).s;
    const e = r < filas.length - 1 && largo > 0 && L / largo <= 1.25 ? L / largo : 1;
    f.forEach(it => { it.x = r % 2 === 0 ? MARGEN + it.s * e : W - MARGEN - it.s * e; });
  });

  // 3. Etiquetas: lado preferido alternando; si choca con la vecina se prueba el otro lado y, si tampoco, se omite.
  let alt = 0;
  for (const f of filas) {
    const ocupado = { arriba: [], abajo: [] };
    for (const it of f) {
      const p = it.paso;
      let pref = null, ancho = 124, t = null;
      if (it.forma === 'nodo') { t = textoDe(it); pref = alt++ % 2 ? 'arriba' : 'abajo'; }
      else if (it.forma === 'punto') {
        if (it.obra) { t = { kick: [], titulo: p.titulo, obra: true, lineas: [] }; pref = 'arriba'; }
        else if (p.estado === 'repaso') { t = { kick: [], titulo: 'repaso', obra: false, lineas: [], ocre: true }; pref = 'abajo'; }
        ancho = 116;
      } else if (it.forma === 'menudo') {
        if (it.obra) { t = { kick: [], titulo: p.titulo, obra: true, lineas: [] }; pref = 'abajo'; }
        else if (p.insertado || p.tipo === 'refuerzo') { t = { kick: [h('span', { style: 'color:var(--ocre)' }, 'REFUERZO')], titulo: p.titulo, obra: false, lineas: [] }; pref = 'abajo'; }
        ancho = 112;
      } else if (it.forma === 'ficha') {
        const obra = it.tramo.pasos?.find(x => x.tipo === 'obra');
        t = { kick: [`TRAMO ${it.tramo.orden}`], titulo: it.tramo.titulo, obra: false, ficha: true, lineas: [{ texto: obra ? obra.titulo : 'en borrador', obra: !!obra, suave: true }] };
        pref = 'abajo'; ancho = 116;
      } else if (it.forma === 'medalla') {
        const fin = it.final;
        t = { kick: ['OBRA FINAL DEL CURSO'], titulo: fin.titulo, obra: true, medalla: true, lineas: [fin.detalle && { texto: fin.detalle }, fin.conocida && { texto: 'la conoces · comprobar', suave: true }].filter(Boolean) };
        pref = 'abajo'; ancho = 160;
        if (items.plegada) t.pista = items.plegada.siguiente;
      }
      if (!t) continue;
      t.ancho = ancho;
      t.alto = altura(t, ancho) + (t.pista ? 40 : 0) + (t.medalla ? 4 : 0);
      for (const lado of [pref, pref === 'arriba' ? 'abajo' : 'arriba']) {
        const [a, b] = [it.x - ancho / 2 - 4, it.x + ancho / 2 + 4];
        if (ocupado[lado].some(([c, d]) => a < d && b > c)) continue;
        // una etiqueta pequeña no pisa a un vecino más grande: se desplaza hacia el otro lado
        const vecino = f.find(o => o !== it && o.d > it.d + 2 && a < o.x + o.d / 2 + 4 && b > o.x - o.d / 2 - 4);
        const dx = vecino ? (vecino.x > it.x ? vecino.x - vecino.d / 2 - 4 - b : vecino.x + vecino.d / 2 + 4 - a) : 0;
        ocupado[lado].push([a + dx, b + dx]);
        it.et = { ...t, lado, dx: ENTERO(dx) };
        break;
      }
    }
  }

  // 4. Alturas: cada fila reserva sitio para su cabecera (rótulos de tramo), lo que sube, lo que baja y el serpenteo.
  let y = 0;
  filas.forEach((f, r) => {
    const grupos = [];
    for (const it of f) {
      if (it.forma === 'ficha' || it.forma === 'medalla' || it.forma === 'pista') continue;
      const g = grupos.at(-1);
      if (g && g.ti === it.ti) { g.items.push(it); } else grupos.push({ ti: it.ti, tramo: it.tramo, items: [it], continuacion: !it.primero });
    }
    const nombreDe = gr => `TRAMO ${gr.tramo.orden} · ${gr.continuacion ? 'SIGUE' : String(gr.tramo.titulo).toUpperCase()}`;
    const geo = grupos.map(gr => ({ ...gr, x0: Math.max(8, Math.min(...gr.items.map(i => i.x - i.d / 2)) - 4) })).sort((a, b) => a.x0 - b.x0);
    const ult = geo.at(-1); // el último grupo, si queda pegado al borde, se retrasa a la izquierda para que su texto quepa
    if (ult && W - 16 - ult.x0 < 150 && (geo.length < 2 || W - 166 > geo.at(-2).x0 + 120)) ult.x0 = W - 166;
    geo.forEach((gr, j) => {
      gr.ancho = Math.max(70, (geo[j + 1]?.x0 ?? W - 16) - 14 - gr.x0);
      gr.lineas = nombreDe(gr).length * 8.1 > gr.ancho ? 2 : 1;
      gr.nombre = nombreDe(gr);
    });
    let sube = 0, baja = 0;
    for (const it of f) {
      const alto = it.et ? it.et.alto + SEPARACION : 0;
      sube = Math.max(sube, it.d / 2 + (it.et?.lado === 'arriba' ? alto : 0));
      baja = Math.max(baja, it.d / 2 + (it.et?.lado === 'abajo' ? alto : 0));
    }
    const cabecera = geo.length ? 14 * Math.max(...geo.map(g => g.lineas)) + 29 : 0;
    const A = AMPLITUD;
    const centro = y + cabecera + A + sube;
    f.forEach(it => { it.y = ENTERO(centro + A * Math.sin((it.x / 620) * Math.PI * 2 + r * 1.7)); });
    f.cabecera = { y, grupos: geo };
    f.centro = centro;
    y = centro + A + baja + 22;
  });
  return { items: visibles, filas, alto: ENTERO(y), plegada: items.plegada };
}

// ---------------------------------------------------------------- El camino: una curva por todos los puntos
function trazados(ruta, diseno, W) {
  const { items } = diseno;
  if (!items.length) return { hecho: '', falta: '', despues: '' };
  const pts = [], indice = [];
  items.forEach((it, i) => {
    const anterior = items[i - 1];
    if (anterior && anterior.fila !== it.fila) {
      pts.push([anterior.fila % 2 === 0 ? W - 28 : 28, (anterior.y + it.y) / 2]);
    }
    indice[i] = pts.length;
    pts.push([it.x, it.y]);
  });
  const seg = segmentosSuaves(pts);
  const tramo = (a, b) => (b > a ? `M${ENTERO(pts[a][0])} ${ENTERO(pts[a][1])}${seg.slice(a, b).join('')}` : '');

  // hasta dónde llega lo recorrido: el paso actual; si no hay, el último paso hecho
  const hecho = it => (it.paso ? ['dominado', 'hecho', 'repaso', 'actual'].includes(it.paso.estado) : it.forma === 'medalla' && it.final.estado === 'hecho');
  let k = items.findIndex(it => it.paso && it.paso.id === ruta.actual);
  if (k < 0) k = items.findLastIndex(hecho);
  const ultimo = items.findLastIndex(it => it.forma !== 'pista');
  const hayPista = items.at(-1)?.forma === 'pista';
  const desde = k >= 0 ? indice[k] : 0;
  const hasta = indice[ultimo];
  return {
    hecho: k >= 0 ? tramo(0, desde) : '',
    falta: tramo(desde, hasta),
    despues: hayPista ? tramo(hasta, indice.at(-1)) : '',
  };
}

// ---------------------------------------------------------------- Nodos y etiquetas en el DOM
const px = n => `${ENTERO(n)}px`;

function etiqueta(t) {
  return h('span', { class: `paso__et paso__et--${t.lado}${t.ocre ? ' paso__et--ocre' : ''}${t.medalla ? ' paso__et--medalla' : ''}`, style: `width:${t.ancho}px${t.dx ? `;margin-left:${t.dx}px` : ''}` },
    t.kick.length > 0 && h('span', { class: 'paso__kick' }, ...t.kick),
    h('span', { class: `paso__tit${t.obra ? ' paso__tit--obra' : ''}` }, t.titulo),
    t.lineas.map(l => h('span', { class: `paso__det${l.ocre ? ' paso__det--ocre' : ''}${l.suave ? ' paso__det--suave' : ''}${l.obra ? ' paso__det--obra' : ''}` }, l.texto)),
    t.pista && h('span', { class: 'paso__despues' }, h('span', { class: 'paso__kick' }, `DESPUÉS · CURSO ${String(t.pista.numero).padStart(2, '0')}`), h('span', null, t.pista.nombre)));
}

function textoAria(p) {
  const refuerzo = p.insertado || p.tipo === 'refuerzo';
  const base = refuerzo ? 'Refuerzo' : p.numero != null ? `Paso ${p.numero}` : 'Paso';
  return `${base}, ${p.titulo}: ${TEXTO_ESTADO[p.estado] ?? p.estado}` + (p.enCurso ? ', en curso' : '') + (p.encargo ? ', encargo de clase' : '')
    + (p.conocida ? ', la conoces: comprobar' : '') + (p.insertado ? ', propuesto por la app' : '');
}

function nodoPaso(it, i, anim) {
  const p = it.paso;
  const refuerzo = p.insertado || p.tipo === 'refuerzo';
  // un refuerzo que aún no se ha empezado se ve como la leyenda («refuerzo»); si ya está hecho o es el actual, conserva su estado
  const visual = refuerzo && ['recomendado', 'proximo', 'futuro'].includes(p.estado) ? 'refuerzo' : p.estado;
  const icono = it.forma === 'punto' ? null : iconoArea(['obra', 'aplicacion', 'evaluacion', 'preparacion'].includes(p.tipo) ? p.tipo : p.area ?? (refuerzo ? 'refuerzo' : 'evaluacion'), it.obra ? (it.forma === 'menudo' ? 15 : 20) : (it.forma === 'menudo' ? 14 : 18));
  const clases = ['paso', `paso--${it.forma}`, `paso--${p.estado}`, refuerzo && 'paso--refuerzo', p.enCurso && 'paso--en-curso', p.conocida && 'paso--conocida'].filter(Boolean).join(' ');
  return h('a', {
    class: clases, href: p.href || '#', 'aria-label': textoAria(p), title: it.forma === 'punto' ? p.titulo : null,
    'aria-current': p.estado === 'actual' ? 'step' : null,
    style: `left:${px(it.x - it.d / 2)};top:${px(it.y - it.d / 2)};width:${it.d}px;height:${it.d}px${anim ? `;--d:${anim(i)}ms` : ''}`,
  },
  h('span', { class: `glifo glifo--${visual === 'actual' ? 'ahora' : visual === 'proximo' ? 'disponible' : visual === 'futuro' ? 'por-llegar' : visual}${it.obra ? ' glifo--obra' : ''}${p.enCurso ? ' glifo--en-curso' : ''}`, style: `--g:${it.d}px`, 'aria-hidden': 'true' },
    icono, p.estado === 'actual' && h('i', { class: 'glifo__punto' })),
  p.encargo && h('i', { class: 'paso__marca paso__marca--p', title: 'Encargo del profesor', 'aria-hidden': 'true' }, 'P'),
  p.estado === 'repaso' && it.forma === 'nodo' && h('i', { class: 'paso__marca paso__marca--repaso', 'aria-hidden': 'true' }, '↻'),
  it.et && etiqueta(it.et));
}

function nodoFicha(it, i, anim) {
  const t = it.tramo;
  return h('span', {
    class: 'paso paso--ficha', role: 'img', 'aria-label': `Tramo ${t.orden}, ${t.titulo}, ${t.total ? plural(t.total, 'paso') : 'sin pasos todavía'}: en borrador`,
    style: `left:${px(it.x - it.d / 2)};top:${px(it.y - it.d / 2)};width:${it.d}px;height:${it.d}px${anim ? `;--d:${anim(i)}ms` : ''}`,
  }, h('span', { class: 'glifo glifo--por-llegar glifo--ficha', style: `--g:${it.d}px`, 'aria-hidden': 'true' }, t.total || null), it.et && etiqueta(it.et)); // sin pasos, sin «0»
}

function nodoMedalla(it, i, anim) {
  const f = it.final;
  return h('a', {
    class: `paso paso--medalla paso--medalla-${f.estado}`, href: f.href || '#', 'aria-label': `Obra final del curso: ${f.titulo}${f.estado === 'hecho' ? ', hecha' : ''}${f.conocida ? ', la conoces: comprobar' : ''}`,
    style: `left:${px(it.x - it.d / 2)};top:${px(it.y - it.d / 2)};width:${it.d}px;height:${it.d}px${anim ? `;--d:${anim(i)}ms` : ''}`,
  }, h('span', { class: 'medalla', style: `--g:${it.d}px` }, h('span', { class: 'medalla__int' }, iconoArea('estrella', 28))), it.et && etiqueta(it.et));
}

function nodoPista(it, i, anim) {
  return h('div', {
    class: 'paso paso--pista', style: `left:${px(it.x - it.a / 2)};top:${px(it.y - it.d / 2)};width:${it.a}px;height:${it.d}px${anim ? `;--d:${anim(i)}ms` : ''}`,
  }, h('span', { class: 'paso__kick' }, `DESPUÉS · CURSO ${String(it.siguiente.numero).padStart(2, '0')}`), h('span', { class: 'paso__tit' }, it.siguiente.nombre));
}

// Rótulos de tramo sobre su grupo de pasos: «TRAMO 2 · EL CAMBIO DE MODO» y «2 de 12 · en curso».
function rotulos(filas) {
  return filas.flatMap(f => f.cabecera.grupos.map(gr => {
    const t = gr.tramo;
    const estado = t.estado === 'hecho' ? `${t.hechos} de ${t.total} · hecho` : t.estado === 'abierto' ? `${t.hechos} de ${t.total} · en curso` : `${plural(t.total, 'paso')} · por llegar`;
    return h('div', { class: `ruta__tramo ruta__tramo--${t.estado}`, style: `left:${px(gr.x0)};top:${px(f.cabecera.y)};max-width:${px(gr.ancho)}` },
      h('span', { class: 'ruta__tramo-nombre' }, gr.nombre), h('span', { class: 'ruta__tramo-estado' }, estado));
  }));
}

// ---------------------------------------------------------------- Lo público
// ruta: el contrato de la lógica. opciones: { animar = false, clave }.
// animar: el trazo se dibuja una vez al montar y los nodos aparecen en secuencia (nada con «reducir movimiento»);
// clave (opcional): con ella solo ocurre la primera vez que se muestra esa clave en esta carga de la página.
export function mapaRuta(ruta, { animar = false, clave } = {}) {
  const raiz = h('nav', { class: 'ruta', 'aria-label': `Ruta del curso ${ruta.curso?.numero ?? ''}: ${ruta.curso?.nombre ?? ''}`.trim() });
  let ancho = 0, quedaAnimar = animar && !reducido() && !(clave && yaMostrado(clave));

  function dibujar(W) {
    const diseno = disponer(ruta, W);
    const { items } = diseno;
    const tr = trazados(ruta, diseno, W);
    const anim = quedaAnimar ? i => ENTERO(260 + Math.min(1500, (i / Math.max(1, items.length)) * 1500)) : null;

    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'ruta__svg');
    svg.setAttribute('width', W);
    svg.setAttribute('height', diseno.alto);
    svg.setAttribute('viewBox', `0 0 ${W} ${diseno.alto}`);
    svg.setAttribute('aria-hidden', 'true');
    const camino = (d, clase) => {
      if (!d) return null;
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('d', d);
      p.setAttribute('class', `ruta__camino ${clase}`);
      svg.append(p);
      return p;
    };
    const pHecho = camino(tr.hecho, 'ruta__camino--hecho');
    const pFalta = camino(tr.falta, 'ruta__camino--falta');
    const pDespues = camino(tr.despues, 'ruta__camino--despues');

    const nodos = items.map((it, i) => (it.forma === 'ficha' ? nodoFicha(it, i, anim)
      : it.forma === 'medalla' ? nodoMedalla(it, i, anim)
        : it.forma === 'pista' ? nodoPista(it, i, anim)
          : nodoPaso(it, i, anim)));
    raiz.style.height = px(diseno.alto);
    raiz.classList.toggle('ruta--anima', !!anim);
    raiz.replaceChildren(svg, ...rotulos(diseno.filas), ...nodos);

    if (anim) {
      quedaAnimar = false;
      if (clave) marcarMostrado(clave);
      const duracion = 1500;
      if (pHecho && pHecho.animate) {
        const largo = pHecho.getTotalLength();
        pHecho.style.strokeDasharray = largo;
        pHecho.animate([{ strokeDashoffset: largo }, { strokeDashoffset: 0 }], { duration: duracion, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'backwards', delay: 200 });
      }
      for (const p of [pFalta, pDespues]) p?.animate?.([{ opacity: 0 }, { opacity: 1 }], { duration: 700, delay: 200 + duracion * 0.6, fill: 'backwards' });
    }
  }

  if (globalThis.ResizeObserver) {
    new ResizeObserver(([e]) => {
      const W = ENTERO(e.contentRect.width);
      if (W < 240 || Math.abs(W - ancho) < 4) return;
      ancho = W;
      dibujar(W);
    }).observe(raiz);
  } else dibujar(1200);
  return raiz;
}

// «Dónde estás»: una fila de puntos con el tramo actual (hechos llenos, el actual con su punto verde, obras cuadradas) y,
// al final, el punto discontinuo de la obra final.
export function miniRuta(ruta) {
  // El tramo del paso actual (puede haber varios abiertos); si no hay paso actual, el primero abierto.
  const t = ruta.tramos.find(x => x.pasos?.some(p => p.id === ruta.actual)) ?? ruta.tramos.find(x => x.estado === 'abierto')
    ?? ruta.tramos.find(x => x.estado === 'por-llegar' && x.pasos?.length) ?? ruta.tramos.at(-1);
  const pasos = t?.pasos ?? [];
  const clase = p => {
    if (p.id === ruta.actual || p.estado === 'actual') return 'ahora';
    if (p.insertado || p.tipo === 'refuerzo') return p.estado === 'hecho' || p.estado === 'dominado' ? 'hecho' : 'refuerzo';
    if (p.estado === 'dominado') return 'hecho';
    return { hecho: 'hecho', repaso: 'repaso', futuro: 'futuro' }[p.estado] ?? 'disponible';
  };
  const actual = pasos.find(p => p.id === ruta.actual || p.estado === 'actual');
  return h('span', {
    class: 'mini-ruta', role: 'img',
    'aria-label': t ? `Tramo ${t.orden}: ${t.hechos} de ${plural(t.total, 'paso')} hechos${actual ? `, ahora el paso ${actual.numero ?? ''}: ${actual.titulo}` : ''}` : 'Sin tramo abierto',
  },
  pasos.map(p => h('i', { class: `mini mini--${clase(p)}${p.tipo === 'obra' ? ' mini--obra' : ''}` }, clase(p) === 'ahora' && h('b', { class: 'mini__punto' }))),
  ruta.final && h('i', { class: 'mini mini--fin' }));
}
