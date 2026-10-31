// El ritmo, animado: los tiempos del compás como una regla, y cada nota como una barra que ocupa lo que dura. Se enciende mientras
// suena, para ver por qué una blanca «llena» dos golpes o por qué una hemiolia cambia los acentos.
import { h } from '../nucleo/dom.js';
import { escenaRitmo } from '../../logica/guitarra.js';
import { controlCuadros } from './cuadros.js';

const SVG = 'http://www.w3.org/2000/svg';
const s = (tag, attrs = {}, ...hijos) => {
  const el = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null) el.setAttribute(k, v);
  el.append(...hijos);
  return el;
};
const ANCHO = 760, X0 = 20, FILA = 74;

export function ritmo(spec, clave) {
  const e = escenaRitmo(spec);
  const compases = Math.round(e.largo / e.tiempos);
  const paso = (ANCHO - X0 * 2) / e.largo;
  const svg = s('svg', { viewBox: `0 0 ${ANCHO} ${FILA + 34}`, class: 'ritmo__svg', role: 'img', 'aria-label': spec.titulo ?? 'Ritmo' });
  for (let t = 0; t <= e.largo; t++) {
    const fuerte = t % e.tiempos === 0;
    svg.append(s('line', { x1: X0 + t * paso, x2: X0 + t * paso, y1: 18, y2: FILA + 6, class: fuerte ? 'ritmo__fuerte' : 'ritmo__tiempo' }));
    if (t < e.largo) svg.append(s('text', { x: X0 + t * paso + 3, y: 13, class: 'ritmo__num' }, String((t % e.tiempos) + 1)));
  }
  const barras = e.lista.map(f => {
    const x = X0 + f.t * paso;
    const barra = s('rect', { x: x + 2, y: 26, width: f.d * paso - 4, height: FILA - 34, rx: 5, class: `ritmo__barra${f.fuerte ? ' es-fuerte' : ''}` });
    svg.append(barra, s('text', { x: x + f.d * paso / 2, y: FILA - 12, 'text-anchor': 'middle', class: 'ritmo__nombre' }, f.etiqueta ?? ''));
    return barra;
  });
  svg.append(s('text', { x: X0, y: FILA + 28, class: 'ritmo__num' }, `${compases} ${compases === 1 ? 'compás' : 'compases'} de ${e.tiempos} tiempos`));
  const ctl = controlCuadros({ cuadros: e.cuadros, clave, pintar: (q, i) => barras.forEach((b, k) => {
    b.classList.toggle('es-oida', k < q.encendidas);
    b.classList.toggle('es-ahora', k === q.encendidas - 1 && i < e.cuadros.length - 1);
  }) });
  const nodo = h('figure', { class: 'mastil' }, spec.titulo && h('figcaption', { class: 'rotulo mastil__titulo' }, spec.titulo), svg, ctl.leyenda, ctl.controles);
  ctl.montar(nodo);
  return nodo;
}
