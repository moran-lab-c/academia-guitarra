// La construcción de un acorde sobre el fondo oscuro: del espacio vacío al diagrama completo, línea a línea, y luego cada dedo
// con su color. No es una imagen por acorde: todo sale de logica/acordes.js. Al final se puede oír entero o nota a nota.
import { h } from '../nucleo/dom.js';
import { escena, midiEn, ordinal } from '../../logica/guitarra.js';
import { ACORDES, ventana } from '../../logica/acordes.js';
import { tocar } from './sonido.js';
import { controlCuadros } from './cuadros.js';

const SVG = 'http://www.w3.org/2000/svg';
const s = (tag, attrs = {}, ...hijos) => {
  const el = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null) el.setAttribute(k, v);
  el.append(...hijos);
  return el;
};
const X0 = 58, Y0 = 62, PX = 36, PY = 50;

export function diagramaAnimado(spec, clave) {
  const e = escena(spec);
  const a = ACORDES[spec.acorde];
  const { desde, trastes } = ventana(a);
  const xC = c => X0 + (6 - c) * PX;
  const yT = t => Y0 + (t - desde + 0.5) * PY;
  const abajo = Y0 + trastes * PY;
  const svg = s('svg', { viewBox: `0 0 ${X0 + 5 * PX + 30} ${abajo + 62}`, class: 'diagrama__svg', role: 'img', 'aria-label': `Construcción del acorde de ${spec.acorde}` });
  // Trastes, de arriba abajo, y después cuerdas, de la 6.ª a la 1.ª. Cada una se dibuja con su retraso.
  const lineasT = [], lineasC = [];
  for (let i = 0; i <= trastes; i++) {
    const l = s('line', { x1: X0, x2: X0 + 5 * PX, y1: Y0 + i * PY, y2: Y0 + i * PY, class: i === 0 && desde === 1 ? 'diagrama__cejuela' : 'diagrama__traste', pathLength: 1 });
    l.style.transitionDelay = `${i * 110}ms`;
    lineasT.push(l); svg.append(l);
    if (i < trastes) { const n = s('text', { x: X0 - 22, y: Y0 + (i + 0.5) * PY + 4, class: 'diagrama__numero', 'text-anchor': 'middle' }, String(desde + i)); lineasT.push(n); svg.append(n); }
  }
  for (let c = 6; c >= 1; c--) {
    const l = s('line', { x1: xC(c), x2: xC(c), y1: Y0, y2: abajo, class: 'diagrama__cuerda', pathLength: 1, 'stroke-width': 1 + (c - 1) * 0.28 });
    l.style.transitionDelay = `${(6 - c) * 110}ms`;
    lineasC.push(l); svg.append(l);
    const n = s('text', { x: xC(c), y: 16, class: 'diagrama__nombre', 'text-anchor': 'middle' }, `${c}.ª`);
    lineasC.push(n); svg.append(n);
  }
  const capaMarcas = s('g');
  const capaNotas = s('g');
  svg.append(capaMarcas, capaNotas);

  const pintar = q => {
    lineasT.forEach(x => x.classList.toggle('es-visible', q.base >= 1));
    lineasC.forEach(x => x.classList.toggle('es-visible', q.base >= 2));
    const nuevas = new Set((q.marcas ?? []).map(m => m.k));
    for (const el of [...capaMarcas.children]) if (!nuevas.has(el.dataset.k)) el.remove();
    for (const m of q.marcas ?? []) {
      if (capaMarcas.querySelector(`[data-k="${m.k}"]`)) continue;
      const g = s('g', { 'data-k': m.k, class: 'diagrama__marca' });
      if (m.mudo) g.append(s('text', { x: xC(m.c), y: Y0 - 12, 'text-anchor': 'middle', class: 'diagrama__mudo' }, '×'));
      else if (m.aire) g.append(s('circle', { cx: xC(m.c), cy: Y0 - 17, r: 8, class: 'diagrama__aire' }));
      else {
        g.append(s('circle', { cx: xC(m.c), cy: yT(m.t), r: 14, class: `diagrama__dedo acorde__dedo--${m.dedo}` }));
        g.append(s('text', { x: xC(m.c), y: yT(m.t) + 5, 'text-anchor': 'middle', class: 'diagrama__num' }, String(m.dedo)));
      }
      if (!m.mudo) { g.style.cursor = 'pointer'; g.addEventListener('click', () => tocar([[midiEn(m.c, m.t)]], { duracion: 1 })); }
      capaMarcas.append(g);
    }
    capaNotas.replaceChildren();
    if (q.final) for (let c = 1; c <= 6; c++) {
      const m = q.marcas.find(x => x.c === c);
      capaNotas.append(s('text', { x: xC(c), y: abajo + 24, 'text-anchor': 'middle', class: m?.mudo ? 'diagrama__nota diagrama__nota--muda' : 'diagrama__nota' }, m?.mudo ? '—' : m?.nota ?? ''));
    }
    if (q.cejilla) {
      const { traste, desde: d, hasta } = q.cejilla;
      capaNotas.append(s('rect', { x: xC(d) - 12, y: yT(traste) - 12, width: xC(hasta) - xC(d) + 24, height: 24, rx: 12, class: 'acorde__cejilla diagrama__cejilla' }));
    }
  };
  const sonidos = ACORDES[spec.acorde].cuerdas.flatMap((t, i) => (t === null ? [] : [midiEn(6 - i, t)]));
  const ctl = controlCuadros({ cuadros: e.cuadros, clave, pintar });
  const leyendaCuerdas = h('p', { class: 'pequeno suave' }, 'Toca un dedo o una cuerda al aire para oír esa nota.');
  void ordinal;
  const nodo = h('figure', { class: 'diagrama' },
    h('div', { class: 'diagrama__grafico' }, svg),
    h('div', { class: 'diagrama__lado' },
      h('figcaption', { class: 'diagrama__titulo' }, spec.titulo ?? `El acorde de ${spec.acorde}`),
      ctl.leyenda,
      h('div', { class: 'fila diagrama__oir' },
        h('button', { type: 'button', class: 'btn btn-papel', onclick: () => tocar([sonidos], { duracion: 1.8 }) }, `♪ ${spec.acorde}`),
        h('button', { type: 'button', class: 'btn btn-borde', onclick: () => tocar([sonidos], { duracion: 1.2, arpegiado: true }) }, '♪ Nota a nota')),
      leyendaCuerdas,
      ctl.controles));
  ctl.montar(nodo);
  return nodo;
}
