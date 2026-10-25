// Las marcas pequeñas de B+: iconos de área (SVG de trazo, 18 px, currentColor), el círculo de estado de cada paso,
// fichas de texto (chips) y los nombres cortos de las áreas. Todo el aspecto vive en estilos/componentes.css.
import { h } from '../nucleo/dom.js';

export const NOMBRE_AREA = {
  tecnica: 'Técnica', escalas: 'Escalas y arpegios', repertorio: 'Repertorio', interpretacion: 'Interpretación',
  lectura: 'Lectura', ritmo: 'Ritmo', teoria: 'Teoría', armonia: 'Armonía', oido: 'Oído', diapason: 'Mástil',
  'fl-compas': 'Compás', 'fl-tecnica': 'Técnica flamenca', 'fl-toque': 'Toque', 'fl-acompanamiento': 'Acompañamiento', 'fl-armonia': 'Armonía flamenca',
};

// Color apagado de un área (para marcas pequeñas: el punto, el rótulo). Las flamencas comparten el suyo.
export const colorArea = area => (area ? `var(--a-${String(area).startsWith('fl-') ? 'flamenco' : area}, var(--texto-3))` : 'var(--texto-3)');

// Glifos de la lámina (viewBox 18×18). Los de técnica, armonía, oído, lectura, mástil, ritmo, obra, aplicación,
// evaluación, preparación y estrella son los de P2-Curso; escalas, teoría e interpretación siguen su mismo trazo.
const T = 'fill="none" stroke="currentColor" stroke-width="1.6"';
const GLIFOS = {
  tecnica: `<g ${T}><path d="M2 6h14M2 9h14M2 12h14"/></g><circle cx="9" cy="9" r="2.3" fill="currentColor"/>`,
  armonia: `<g fill="currentColor"><circle cx="9" cy="3.8" r="1.9"/><circle cx="9" cy="9" r="1.9"/><circle cx="9" cy="14.2" r="1.9"/></g>`,
  oido: `<g ${T}><path d="M5.5 14.5c.5 1.7 3.8 1.6 4.2-.6.3-1.8 3.5-2.6 3.5-6.4a4.6 4.6 0 0 0-9.2 0"/><path d="M7.4 7.6a1.6 1.6 0 0 1 3.2 0"/></g>`,
  lectura: `<g ${T}><path d="M11 3v9"/><path d="M11 3c2 .6 3.4 1.8 3.4 3.8"/></g><ellipse cx="8" cy="12.6" rx="3" ry="2.2" fill="currentColor"/>`,
  diapason: `<g ${T}><path d="M2 6h14M2 12h14M6 3v12M12 3v12"/></g>`,
  ritmo: `<g ${T}><path d="M6 16 9 2.5 12 16Z"/><path d="M9 11.5 13.5 5"/></g>`,
  escalas: `<g ${T} stroke-linejoin="round"><path d="M2 15h3.5v-3.2H9V8.6h3.5V5.4H16"/></g>`,
  teoria: `<g ${T} stroke-linejoin="round"><path d="M9 4.6C7.2 3.4 4.8 3.2 2.5 3.8v10.4c2.3-.6 4.7-.4 6.5.8 1.8-1.2 4.2-1.4 6.5-.8V3.8C13.2 3.2 10.8 3.4 9 4.6ZM9 4.6V15"/></g>`,
  interpretacion: `<g ${T} stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 9 15.5 4.6M2.5 9l13 4.4"/></g>`,
  obra: `<g fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 6h12M3 9h12M3 12h12"/><path d="M11.6 3.6v7.6"/></g><ellipse cx="9.6" cy="11.6" rx="2.2" ry="1.6" fill="currentColor"/>`,
  aplicacion: `<g ${T}><path d="M6 3H3v12h3M12 3h3v12h-3"/><path d="M7 9h4"/></g>`,
  evaluacion: `<g ${T}><circle cx="9" cy="9" r="6.5"/><path d="M6 9.2l2.2 2.2L12.3 7"/></g>`,
  preparacion: `<g ${T}><circle cx="9" cy="9" r="6.5"/><circle cx="9" cy="9" r="3"/></g>`,
  estrella: `<g fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"><path d="M9 2.2l2 4.3 4.7.6-3.4 3.2.9 4.7L9 12.7l-4.2 2.3.9-4.7L2.3 7.1 7 6.5z"/></g>`,
};
// Quién usa qué glifo: las áreas sin glifo propio toman el de su parecido.
const ALIAS = {
  repertorio: 'obra', 'fl-toque': 'obra', 'fl-tecnica': 'tecnica', 'fl-compas': 'ritmo', 'fl-acompanamiento': 'armonia', 'fl-armonia': 'armonia',
  refuerzo: 'lectura', final: 'estrella',
};

// El SVG de un área o de un tipo de paso (obra, aplicacion, evaluacion, preparacion, estrella). tam: lado en px.
export function iconoArea(area, tam = 18) {
  const clave = GLIFOS[area] ? area : ALIAS[area] ?? 'evaluacion';
  const t = document.createElement('template');
  t.innerHTML = `<svg class="icono" width="${tam}" height="${tam}" viewBox="0 0 18 18" aria-hidden="true" focusable="false">${GLIFOS[clave]}</svg>`;
  return t.content.firstElementChild;
}

// Los estados de la leyenda de la lámina y los nombres de la ruta se pueden pedir con cualquiera de los dos.
const ESTADO = {
  'por-llegar': 'por-llegar', futuro: 'por-llegar', disponible: 'disponible', proximo: 'disponible', recomendado: 'recomendado',
  ahora: 'ahora', actual: 'ahora', hecho: 'hecho', dominado: 'dominado', repaso: 'repaso', refuerzo: 'refuerzo',
};
export const NOMBRE_GLIFO = {
  'por-llegar': 'Por llegar', disponible: 'Disponible', ahora: 'Ahora', hecho: 'Hecho', dominado: 'Dominado', repaso: 'Repaso', refuerzo: 'Refuerzo',
};

// El círculo de estado (como en la leyenda de Main.dc.html). opciones: { tam = 34, obra = false (cuadrado redondeado), icono = null (nodo), etiqueta = null }.
export function glifoEstado(estado, { tam = 34, obra = false, icono = null, etiqueta = null } = {}) {
  const e = ESTADO[estado] ?? 'por-llegar';
  return h('span', {
    class: `glifo glifo--${e}${obra ? ' glifo--obra' : ''}`, style: `--g:${tam}px`,
    ...(etiqueta ? { role: 'img', 'aria-label': etiqueta } : { 'aria-hidden': 'true' }),
  }, icono, e === 'ahora' && h('i', { class: 'glifo__punto' }));
}

export function leyendaEstados() {
  return h('div', { class: 'leyenda-estados', role: 'list' }, ['hecho', 'dominado', 'ahora', 'disponible', 'por-llegar', 'repaso', 'refuerzo']
    .map(e => h('span', { class: 'leyenda-estados__item', role: 'listitem' }, glifoEstado(e, { tam: 12 }), NOMBRE_GLIFO[e])));
}

// Ficha de texto: tipo 'neutro' (con borde), 'ahora' (verde), 'encargo' (ocre sólido), 'repaso' (ocre con borde), 'refuerzo' (ocre discontinuo).
export const chipEstado = (texto, tipo = 'neutro') => h('span', { class: `chip chip--${tipo}` }, texto);

// Ficha de un área: punto de su color + nombre corto.
export const chipArea = area => h('span', { class: 'chip chip--area' }, h('i', { class: 'chip__punto', style: `background:${colorArea(area)}` }), NOMBRE_AREA[area] ?? area ?? '');

// Curva suave que pasa por todos los puntos [x, y] (Catmull-Rom → Bézier): un trozo «C…» por cada tramo entre puntos.
export function segmentosSuaves(p, t = 1 / 6) {
  const r = n => Math.round(n * 10) / 10;
  return p.slice(0, -1).map((_, i) => {
    const p0 = p[i - 1] ?? p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] ?? p2;
    return `C${r(p1[0] + (p2[0] - p0[0]) * t)} ${r(p1[1] + (p2[1] - p0[1]) * t)} ${r(p2[0] - (p3[0] - p1[0]) * t)} ${r(p2[1] - (p3[1] - p1[1]) * t)} ${r(p2[0])} ${r(p2[1])}`;
  });
}
