// Diagrama clásico de acorde: cuerdas y trastes, 0 al aire, × no se toca, cejilla como barra, número de dedo dentro de cada
// punto y un color por dedo (la cejilla, en el color del dedo 1). El número va siempre: no depende solo del color.
import { h } from '../nucleo/dom.js';
import { ACORDES, ventana } from '../../logica/acordes.js';

const SVG = 'http://www.w3.org/2000/svg';
const s = (tag, attrs, ...hijos) => {
  const el = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  el.append(...hijos);
  return el;
};

export function diagramaAcorde(nombre) {
  const a = ACORDES[nombre];
  if (!a) return null;
  const { desde, trastes } = ventana(a);
  const ANCHO = 104, ALTO = 28 * trastes + 30, X0 = 18, Y0 = 22, PASO_X = 15, PASO_Y = 28;
  const xDe = i => X0 + i * PASO_X; // i: 0 = 6.ª cuerda … 5 = 1.ª
  const yDe = t => Y0 + (t - desde + 0.5) * PASO_Y;
  const svg = s('svg', { viewBox: `0 0 ${ANCHO} ${ALTO}`, class: 'acorde__svg', role: 'img', 'aria-label': `Acorde de ${nombre}` });
  for (let i = 0; i <= trastes; i++) svg.append(s('line', { x1: X0, x2: xDe(5), y1: Y0 + i * PASO_Y, y2: Y0 + i * PASO_Y, class: i === 0 && desde === 1 ? 'acorde__ceja' : 'acorde__traste' }));
  for (let i = 0; i < 6; i++) svg.append(s('line', { x1: xDe(i), x2: xDe(i), y1: Y0, y2: Y0 + trastes * PASO_Y, class: 'acorde__cuerda' }));
  if (desde > 1) svg.append(s('text', { x: X0 - 7, y: yDe(desde) + 4, class: 'acorde__desde', 'text-anchor': 'end' }, String(desde)));
  a.cuerdas.forEach((t, i) => {
    if (t === null) svg.append(s('text', { x: xDe(i), y: Y0 - 7, class: 'acorde__marca', 'text-anchor': 'middle' }, '×'));
    else if (t === 0) svg.append(s('text', { x: xDe(i), y: Y0 - 7, class: 'acorde__marca', 'text-anchor': 'middle' }, '0'));
  });
  if (a.cejilla) {
    const { traste, desde: c1, hasta: c2 } = a.cejilla;
    svg.append(s('rect', { x: xDe(6 - c1) - 7, y: yDe(traste) - 7, width: xDe(6 - c2) - xDe(6 - c1) + 14, height: 14, rx: 7, class: 'acorde__cejilla' }));
  }
  a.cuerdas.forEach((t, i) => {
    if (!t) return;
    const dedo = a.dedos[i];
    const enCejilla = a.cejilla && t === a.cejilla.traste && dedo === a.cejilla.dedo;
    if (!enCejilla) svg.append(s('circle', { cx: xDe(i), cy: yDe(t), r: 7, class: `acorde__dedo acorde__dedo--${dedo}` }));
    svg.append(s('text', { x: xDe(i), y: yDe(t) + 3.5, class: 'acorde__num', 'text-anchor': 'middle' }, String(dedo)));
  });
  return h('figure', { class: 'acorde' }, h('figcaption', { class: 'acorde__nombre' }, nombre), svg);
}

export const diagramas = nombres => (nombres.length ? h('div', { class: 'acordes' }, nombres.map(diagramaAcorde)) : null);
