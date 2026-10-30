// El mástil animado: dibuja cualquier escena de logica/guitarra.js (acorde, escala, arpegio, cambio, distancias…). No es una
// imagen por acorde: el mismo componente recibe cuadros y, de uno a otro, cada marca viaja, aparece o se va. La 1.ª cuerda va
// arriba, igual que en la tablatura. Respeta «reducir movimiento»: enseña el último cuadro y se avanza a mano.
import { h } from '../nucleo/dom.js';
import { escena, midiEn } from '../../logica/guitarra.js';
import { tocar } from './sonido.js';

const SVG = 'http://www.w3.org/2000/svg';
const s = (tag, attrs = {}, ...hijos) => {
  const el = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null) el.setAttribute(k, v);
  el.append(...hijos);
  return el;
};
const ANCHO = 760, PASO_Y = 30, X0 = 86, BOCA = 150;
const PUNTOS = new Set([3, 5, 7, 9, 12, 15]);
const sinMovimiento = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Lo que se recuerda de cada mástil mientras se está en la pantalla: las repintadas no reinician la animación.
const estados = new Map();

function geometria(e) {
  const [a, b] = e.trastes;
  const primero = Math.max(a, 1), n = b - primero + 1;
  const Y0 = e.cuadros.some(q => q.arcos?.length) ? 74 : 26; // arriba, sitio solo si hay arcos
  const pasoX = (ANCHO - X0 - 24 - (e.boca ? BOCA : 0)) / n;
  return {
    primero, n, pasoX, Y0,
    xT: t => (t === 0 ? X0 - 18 : X0 + (t - primero + 0.5) * pasoX),
    xF: i => X0 + i * pasoX,
    y: c => Y0 + (c - 1) * PASO_Y,
    fin: X0 + n * pasoX,
  };
}

function madera(e, g) {
  const alto = 5 * PASO_Y, { Y0 } = g;
  const grupo = s('g', { class: 'mastil__madera' });
  grupo.append(s('rect', { x: X0, y: Y0 - 12, width: g.fin - X0, height: alto + 24, rx: 3, class: 'mastil__diapason' }));
  for (let t = g.primero; t < g.primero + g.n; t++) {
    if (PUNTOS.has(t)) grupo.append(s('circle', { cx: g.xT(t), cy: Y0 + alto / 2, r: 4, class: 'mastil__punto' }));
    grupo.append(s('text', { x: g.xT(t), y: Y0 + alto + 30, class: 'mastil__numero', 'text-anchor': 'middle' }, String(t)));
  }
  return grupo;
}

function trazos(e, g) {
  const alto = 5 * PASO_Y, { Y0 } = g;
  const grupo = s('g', { class: 'mastil__trazos' });
  for (let i = 0; i <= g.n; i++) grupo.append(s('line', { x1: g.xF(i), x2: g.xF(i), y1: Y0 - 12, y2: Y0 + alto + 12, class: i === 0 && g.primero === 1 ? 'mastil__ceja' : 'mastil__traste', pathLength: 1 }));
  for (let c = 1; c <= 6; c++) {
    grupo.append(s('line', { x1: X0 - 4, x2: e.boca ? ANCHO - 16 : g.fin, y1: g.y(c), y2: g.y(c), class: `mastil__cuerda mastil__cuerda--${c}`, 'data-c': c, pathLength: 1 }));
    grupo.append(s('text', { x: 10, y: g.y(c) + 4, class: 'mastil__nombre' }, `${c}.ª`));
  }
  return grupo;
}

function pintarMarca(m, g) {
  const el = s('g', { class: `mastil__marca${m.rol ? ` mastil__marca--${m.rol}` : ''}`, 'data-k': m.k });
  el.style.transform = `translate(${g.xT(m.t)}px, ${g.y(m.c)}px)`;
  rellenarMarca(el, m);
  if (!m.mudo) {
    el.style.cursor = 'pointer';
    el.addEventListener('click', () => tocar([[midiEn(m.c, m.t)]], { duracion: 0.9 }));
  }
  return el;
}

function rellenarMarca(el, m) {
  el.replaceChildren();
  el.setAttribute('class', `mastil__marca${m.rol ? ` mastil__marca--${m.rol}` : ''}`);
  if (m.mudo) { el.append(s('text', { 'text-anchor': 'middle', y: 5, class: 'mastil__mudo' }, '×')); return; }
  el.append(s('title', {}, m.nota ?? ''));
  const clase = m.dedo ? `acorde__dedo--${m.dedo}` : m.aire ? 'mastil__aire' : 'mastil__neutra';
  el.append(s('circle', { r: 11, class: `mastil__dedo ${clase}` }));
  const dentro = m.dedo ?? m.etiq;
  if (dentro != null) el.append(s('text', { 'text-anchor': 'middle', y: 4.5, class: m.dedo ? 'mastil__num' : 'mastil__num mastil__num--tinta' }, String(dentro)));
  // El nombre, al lado y no encima: así no choca con la cuerda de arriba. Al aire va a la izquierda, fuera del diapasón.
  if (m.nota) el.append(s('text', { 'text-anchor': m.aire ? 'end' : 'start', x: m.aire ? -15 : 15, y: 4, class: 'mastil__nota' }, m.nota));
}

function pintarCuadro(raiz, e, g, q) {
  raiz.classList.toggle('mastil--sin-trazos', !q.base);
  // Las marcas: las que siguen viajan, las nuevas entran y las demás se van.
  const capa = raiz.querySelector('.mastil__marcas');
  const nuevas = new Set((q.marcas ?? []).map(m => m.k));
  for (const el of [...capa.children]) {
    if (nuevas.has(el.dataset.k) || el.classList.contains('mastil__marca--sale')) continue;
    el.classList.add('mastil__marca--sale');
    setTimeout(() => el.remove(), 260);
  }
  for (const m of q.marcas ?? []) {
    const ya = capa.querySelector(`[data-k="${m.k}"]:not(.mastil__marca--sale)`);
    if (ya) { rellenarMarca(ya, m); ya.style.transform = `translate(${g.xT(m.t)}px, ${g.y(m.c)}px)`; }
    else capa.append(pintarMarca(m, g));
  }
  // Lo demás se dibuja de nuevo en cada cuadro.
  const extra = raiz.querySelector('.mastil__extra');
  extra.replaceChildren();
  if (q.cejilla) extra.append(s('rect', { x: g.xT(q.cejilla.traste) - 9, y: g.y(q.cejilla.hasta) - 12, width: 18, height: (q.cejilla.desde - q.cejilla.hasta) * PASO_Y + 24, rx: 9, class: 'acorde__cejilla mastil__cejilla' }));
  for (const a of q.arcos ?? []) {
    const x1 = g.xT(a.de), x2 = g.xT(a.hasta), y = g.y(a.c) - 16, sube = Math.min(44, 12 + Math.abs(x2 - x1) / 10); // cuanto más lejos, más alto: dos arcos no se montan
    extra.append(s('path', { d: `M ${x1} ${y - 12} Q ${(x1 + x2) / 2} ${y - 12 - sube} ${x2} ${y - 12}`, class: 'mastil__arco', fill: 'none' }));
    extra.append(s('text', { x: (x1 + x2) / 2, y: y - 12 - sube / 2 - 5, class: 'mastil__arco-texto', 'text-anchor': 'middle' }, a.texto));
  }
  for (const f of q.flechas ?? []) {
    const x1 = g.xT(f.de[1]), y1 = g.y(f.de[0]), x2 = g.xT(f.a[1]), y2 = g.y(f.a[0]);
    const largo = Math.hypot(x2 - x1, y2 - y1) || 1, ux = (x2 - x1) / largo, uy = (y2 - y1) / largo;
    extra.append(s('line', { x1: x1 + ux * 14, y1: y1 + uy * 14, x2: x2 - ux * 16, y2: y2 - uy * 16, class: 'mastil__flecha', 'marker-end': 'url(#mastil-punta)' }));
  }
  for (const c of raiz.querySelectorAll('.mastil__cuerda')) c.classList.toggle('mastil__cuerda--pulso', Number(c.dataset.c) === q.pulso);
  for (const m of q.manos ?? []) {
    const x = g.fin + 60, y = g.y(m.c);
    extra.append(s('circle', { cx: x, cy: y, r: 12, class: `mastil__mano${q.pulso === m.c ? ' mastil__mano--pulso' : ''}` }));
    extra.append(s('text', { x, y: y + 4.5, 'text-anchor': 'middle', class: 'mastil__mano-letra' }, m.letra));
  }
}

function montar(raizSvg, e, g) {
  raizSvg.append(
    s('defs', {}, s('marker', { id: 'mastil-punta', viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, s('path', { d: 'M 0 0 L 10 5 L 0 10 z', class: 'mastil__punta' }))),
    madera(e, g), trazos(e, g),
    s('g', { class: 'mastil__extra' }),
    s('g', { class: 'mastil__marcas' }));
}

// clave: única por paso y bloque. spec: la descripción de la escena (contenido del paso).
export function mastil(spec, clave) {
  const e = escena(spec);
  if (!e) return null;
  const g = geometria(e);
  let st = estados.get(clave);
  if (!st) {
    st = { i: sinMovimiento() ? e.cuadros.length - 1 : 0, sonando: false, sonido: false, timer: null, visto: sinMovimiento(), pintar: null };
    estados.set(clave, st);
  }
  const svg = s('svg', { viewBox: `0 0 ${ANCHO} ${g.Y0 + 5 * PASO_Y + 40}`, class: 'mastil__svg', role: 'img', 'aria-label': spec.titulo ?? 'Mástil de la guitarra' });
  montar(svg, e, g);
  const leyenda = h('p', { class: 'mastil__texto', 'aria-live': 'polite' });
  const botonPlay = h('button', { type: 'button', class: 'btn btn-borde mastil__play', onclick: () => alternar() });
  const puntos = h('div', { class: 'mastil__puntos', role: 'group', 'aria-label': 'Cuadros' }, e.cuadros.map((_, n) => h('button', { type: 'button', class: 'mastil__p', 'aria-label': `Cuadro ${n + 1}`, onclick: () => { st.sonido = true; parar(); ira(n); } })));
  const nodo = h('figure', { class: 'mastil' }, spec.titulo && h('figcaption', { class: 'rotulo mastil__titulo' }, spec.titulo), svg, leyenda,
    h('div', { class: 'mastil__controles' },
      h('button', { type: 'button', class: 'btn btn-fantasma', 'aria-label': 'Cuadro anterior', onclick: () => { st.sonido = true; parar(); ira(Math.max(0, st.i - 1)); } }, '◀'),
      botonPlay,
      h('button', { type: 'button', class: 'btn btn-fantasma', 'aria-label': 'Cuadro siguiente', onclick: () => { st.sonido = true; parar(); ira(Math.min(e.cuadros.length - 1, st.i + 1)); } }, '▶'),
      puntos));

  const pintar = () => {
    const q = e.cuadros[st.i];
    pintarCuadro(svg, e, g, q);
    leyenda.textContent = q.texto ?? '';
    botonPlay.textContent = st.sonando ? '❚❚ Pausa' : st.i === e.cuadros.length - 1 ? '↺ Otra vez' : '▶ Seguir';
    puntos.querySelectorAll('.mastil__p').forEach((b, n) => { b.classList.toggle('es-actual', n === st.i); b.classList.toggle('es-pasado', n < st.i); });
  };
  st.pintar = pintar;
  const sonar = q => { if (st.sonido && q.suena?.length) tocar([q.suena], { duracion: q.arpegiado ? 1.2 : 0.8, arpegiado: !!q.arpegiado }); };
  const ira = n => { st.i = n; sonar(e.cuadros[n]); st.pintar(); };
  const parar = () => { clearTimeout(st.timer); st.sonando = false; st.pintar?.(); };
  const siguiente = () => {
    if (!document.contains(nodoActual.el)) { clearTimeout(st.timer); estados.delete(clave); return; }
    const q = e.cuadros[st.i];
    st.timer = setTimeout(() => {
      if (!document.contains(nodoActual.el)) { estados.delete(clave); return; }
      if (st.i >= e.cuadros.length - 1) { st.sonando = false; st.pintar(); return; }
      st.i++;
      sonar(e.cuadros[st.i]);
      st.pintar();
      siguiente();
    }, q.ms ?? 1900);
  };
  const alternar = () => {
    st.sonido = true;
    if (st.sonando) return parar();
    if (st.i >= e.cuadros.length - 1) st.i = 0;
    st.sonando = true;
    sonar(e.cuadros[st.i]);
    st.pintar();
    siguiente();
  };
  st.alternar = alternar;
  // Las repintadas cambian el nodo, no la escena: el temporizador mira siempre el último.
  const nodoActual = (st.nodo ??= { el: nodo });
  nodoActual.el = nodo;
  pintar();
  if (!st.visto) {
    // Arranca sola una vez, sin sonido, cuando se ve en pantalla.
    const obs = new IntersectionObserver(([x]) => {
      if (!x.isIntersecting) return;
      obs.disconnect();
      if (st.visto) return;
      st.visto = true;
      st.sonando = true;
      st.pintar();
      siguiente();
    }, { threshold: 0.4 });
    requestAnimationFrame(() => obs.observe(svg));
  }
  return nodo;
}
