// Tipografía cinética de B+: SOLO para momentos con intención (entrar a un curso, presentar una obra, empezar la sesión,
// un logro). Las letras suben por su máscara una vez; nunca mientras se practica. Con «reducir movimiento» no se anima nada.
import { h } from '../nucleo/dom.js';
import { segmentosSuaves } from './marcas.js';

// Las claves ya mostradas: la pantalla se redibuja entera con cada cambio de datos y la animación no debe repetirse,
// ni al recargar la página. Se guardan en este navegador (las últimas MAX_VISTAS) y, si no hay almacenamiento local,
// al menos en memoria. Se anota cuando la animación arranca de verdad (no al crear el elemento), así un redibujado
// inmediato no se la come.
const CLAVE_VISTAS = 'academia.animacionesVistas';
const MAX_VISTAS = 200;
const vistas = new Set(leerVistas());
const abiertos = new Set();
export const yaMostrado = clave => vistas.has(clave);
export function marcarMostrado(clave) {
  if (vistas.has(clave)) return;
  vistas.add(clave);
  try { localStorage.setItem(CLAVE_VISTAS, JSON.stringify([...vistas].slice(-MAX_VISTAS))); } catch { /* sin almacenamiento: queda en memoria */ }
}
function leerVistas() {
  try { const v = JSON.parse(localStorage.getItem(CLAVE_VISTAS)); return Array.isArray(v) ? v : []; } catch { return []; }
}
const reducido = () => globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Palabras con sus letras sueltas (cada una sube con su retraso). Devuelve [nodos, retraso de la última letra].
function letras(texto, inicio, paso) {
  let n = 0;
  const nodos = texto.split(' ').flatMap((pal, i) => [
    i > 0 && ' ',
    h('span', { class: 'tc-pal' }, [...pal].map(c => h('span', { class: 'tc-l', style: `--d:${Math.round(inicio + n++ * paso)}ms` }, c))),
  ]);
  return [nodos, inicio + Math.max(0, n - 1) * paso];
}

function svgDesde(texto) {
  const t = document.createElement('template');
  t.innerHTML = texto;
  return t.content.firstElementChild;
}
const flecha = () => svgDesde('<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>');

const trozos = lineas => (Array.isArray(lineas) ? lineas : [lineas]).filter(Boolean).map(String);

// h1 en Archivo Black. lineas: texto o lista de líneas; nivel: 1-6 (la etiqueta del encabezado).
// clave: la animación solo ocurre la primera vez que se muestra esa clave (sin clave, siempre).
export function tituloCinetico({ etiqueta, lineas, clave, nivel = 1 } = {}) {
  const l = trozos(lineas);
  const anima = !reducido() && !(clave && vistas.has(clave));
  let t = 200;
  const cuerpo = l.map(linea => {
    const [nodos, fin] = letras(linea, t, 34);
    t = fin + 70;
    return h('span', { class: 'tc-linea' }, nodos);
  });
  return h('header', {
    class: `titulo-cinetico${anima ? ' tc--anima' : ''}`,
    onanimationstart: () => { if (clave) marcarMostrado(clave); },
  },
  etiqueta && h('div', { class: 'tc-etiqueta', style: '--d:80ms' }, etiqueta),
  h(`h${Math.min(6, Math.max(1, nivel))}`, { class: 'tc-titulo', 'aria-label': l.join(' ') }, h('span', { 'aria-hidden': 'true' }, cuerpo)));
}

// El momento de entrada a pantalla completa (P8-Entrada). Se monta solo en document.body, así un redibujado de la
// pantalla no lo quita ni lo duplica; devuelve un fragmento vacío (se puede poner tal cual dentro de una vista).
// Datos: etiqueta (arriba a la izquierda), derecha (arriba a la derecha, p. ej. «01 / 07»), sobretitulo («CURSO 01»,
// en letra menor), titulo (texto o líneas, el grande), subtitulo, pie (bajo el botón), accion { texto, href?, onclick? },
// ruta (la misma de mapaRuta; opcional: dibuja el camino del curso abajo) y clave (una sola vez por clave; sin ella, siempre).
// Se cierra con Escape, con un clic fuera del botón o con el propio botón.
export function momentoEntrada({ etiqueta, derecha, sobretitulo, titulo, subtitulo, pie, accion, ruta, clave } = {}) {
  const vacio = document.createDocumentFragment();
  if (clave && (vistas.has(clave) || abiertos.has(clave))) return vacio;
  if (clave) { marcarMostrado(clave); abiertos.add(clave); }
  const anima = !reducido();
  const id = `entrada-${Math.random().toString(36).slice(2, 8)}`;
  const l = trozos(titulo);

  let t = 200;
  const sobre = sobretitulo && letras(String(sobretitulo).toUpperCase(), t, 30);
  if (sobre) t = sobre[1] + 140;
  const cuerpo = l.map(linea => {
    const [nodos, fin] = letras(linea.toUpperCase(), t, 40);
    t = fin + 40;
    return h('span', { class: 'tc-linea' }, nodos);
  });
  const finTitulo = t;
  const retraso = ms => `--d:${Math.round(ms)}ms`;

  const camino = ruta?.tramos?.length && caminoDecorativo(ruta, finTitulo + 640);
  const tBoton = (camino ? camino.fin : finTitulo + 800) + 200;

  const boton = accion && h(accion.href ? 'a' : 'button', {
    class: 'entrada__boton', href: accion.href, type: accion.href ? null : 'button',
    onclick: e => { accion.onclick?.(e); cerrar(); },
  }, accion.texto, flecha());

  const previo = document.activeElement;
  const el = h('div', {
    class: `entrada${anima ? ' tc--anima' : ''}`, role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': id,
    onclick: e => { if (!e.target.closest('.entrada__boton')) cerrar(); },
  },
  h('div', { class: 'entrada__sup' },
    etiqueta && h('span', { class: 'entrada__etiqueta tc-aparece', style: retraso(80) }, etiqueta),
    derecha && h('span', { class: 'entrada__etiqueta tc-aparece', style: retraso(160) }, derecha)),
  h('div', { class: 'entrada__centro' },
    sobre && h('div', { class: 'entrada__sobre', 'aria-hidden': 'true' }, h('span', { class: 'tc-linea' }, sobre[0])),
    h('h1', { class: 'entrada__titulo tc-titulo', id, 'aria-label': [sobretitulo, ...l].filter(Boolean).join(' ') }, h('span', { 'aria-hidden': 'true' }, cuerpo)),
    h('span', { class: 'entrada__marca tc-marca', 'aria-hidden': 'true', style: retraso(finTitulo + 190) })),
  h('div', { class: 'entrada__inferior' },
    subtitulo && h('p', { class: 'entrada__subtitulo tc-aparece', style: retraso(finTitulo + 390) }, subtitulo),
    boton && h('div', { class: 'entrada__accion tc-aparece', style: retraso(tBoton) }, boton, pie && h('span', { class: 'entrada__pie' }, pie))),
  camino && camino.el);

  const alTecla = e => { if (e.key === 'Escape') cerrar(); };
  let cerrado = false;
  function cerrar() {
    if (cerrado) return;
    cerrado = true;
    document.removeEventListener('keydown', alTecla);
    if (clave) abiertos.delete(clave);
    document.body.style.overflow = overflowPrevio;
    el.classList.add('entrada--sale');
    setTimeout(() => { el.remove(); if (previo?.isConnected) previo.focus?.({ preventScroll: true }); }, anima ? 240 : 0);
  }
  const overflowPrevio = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  document.addEventListener('keydown', alTecla);
  document.body.append(el);
  (boton || el).focus?.({ preventScroll: true });
  return vacio;
}

// Camino abajo de la entrada: un punto verde (el principio), un círculo por tramo (con su título) y la estrella del final.
// ponytail: la curva usa coordenadas relativas y se estira con el ancho; si hace falta fidelidad exacta, medir como mapaRuta.
function caminoDecorativo(ruta, inicio) {
  const n = ruta.tramos.length;
  const fin = ruta.final ? n + 1 : n; // el último punto: la estrella de la obra final, solo si el curso la tiene
  const AN = 1000, AL = 64, paso = 180;
  const pts = Array.from({ length: fin + 1 }, (_, i) => [6 + (i / fin) * (AN - 12), 28 + Math.sin(i * 1.9 + 0.6) * 9]);
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${AN} ${AL}`);
  svg.setAttribute('preserveAspectRatio', 'none');
  const p = document.createElementNS(NS, 'path');
  p.setAttribute('d', `M${pts[0][0]} ${pts[0][1]}${segmentosSuaves(pts).join('')}`);
  svg.append(p);

  const en = (i, extra, cuando) => `left:${(pts[i][0] / AN) * 100}%;top:${24 + pts[i][1] + extra}px;--d:${Math.round(inicio + cuando)}ms`;
  const puntos = pts.map((_, i) => h('span', {
    class: `entrada__punto tc-punto${i === 0 ? ' entrada__punto--ahora' : ruta.final && i === fin ? ' entrada__punto--fin' : ''}`, style: en(i, 0, 250 + i * paso),
  }, ruta.final && i === fin && '★'));
  const rotulos = ruta.tramos.map((tr, i) => h('span', { class: 'entrada__rotulo tc-aparece', style: en(i + 1, 16, 400 + (i + 1) * paso) }, tr.titulo));
  if (ruta.final) rotulos.push(h('span', { class: 'entrada__rotulo entrada__rotulo--final tc-aparece', style: en(n + 1, 18, 550 + (n + 1) * paso) },
    h('b', null, 'OBRA FINAL'), h('i', null, ruta.final.titulo)));
  return {
    fin: inicio + 250 + fin * paso + 420,
    el: h('div', { class: 'entrada__camino', 'aria-hidden': 'true' }, h('div', { class: 'entrada__trazo tc-trazo', style: `--d:${Math.round(inicio)}ms` }, svg), puntos, rotulos),
  };
}
