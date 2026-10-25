// Partitura | Tablatura: las dos siempre que existan, a cualquier nivel. La app marca cuál recomienda y por qué;
// él cambia cuando quiere (la elección se recuerda por obra, ejercicio o sección).
import { h } from '../nucleo/dom.js';
import { cambiar } from '../nucleo/almacen.js';
import { formatos } from '../../logica/notacion.js';

const NOMBRE = { partitura: 'Partitura', tablatura: 'Tablatura' };

// rec: resultado de recomendarFormato / formatoPara. clave: id de la obra o ejercicio, u «obra#sección».
export function selectorFormato(item, rec, clave = item.id, seccion = null, { compacto = false } = {}) {
  if (!rec?.disponibles?.length) return h('p', { class: 'suave' }, rec?.motivo ?? 'Sin notación.');
  const f = formatos(item, seccion);
  const boton = fmt => {
    const est = f[fmt];
    const usable = est === 'app' || est === 'externa';
    const extra = est === 'externa' ? ' (fuera de la app)' : est === 'pendiente' ? ' (por hacer)' : !est ? ' (no hay)' : '';
    return h('button', {
      type: 'button', disabled: !usable, 'aria-pressed': String(rec.mostrar === fmt),
      onclick: () => cambiar(e => { e.formatos = { ...(e.formatos || {}), [clave]: fmt }; }),
    }, NOMBRE[fmt], rec.recomendado === fmt ? ' ★' : '', extra);
  };
  return h('div', { class: 'notacion' },
    h('div', { class: 'notacion__barra' },
      h('div', { class: 'segmentado', role: 'group', 'aria-label': 'Ver en' }, boton('partitura'), boton('tablatura')),
      rec.elegidoPorTi && h('button', { type: 'button', class: 'notacion__volver', onclick: () => cambiar(e => { if (e.formatos) delete e.formatos[clave]; }) }, 'Volver a la recomendada')),
    h('p', { class: 'suave notacion__motivo' }, `★ Recomendada: ${rec.motivo}`),
    !compacto && rec.mostrar && h('div', { class: 'atril' },
      f[rec.mostrar] === 'externa'
        ? `${NOMBRE[rec.mostrar]} fuera de la app${item.notacion?.donde ? `: ${item.notacion.donde}` : ''}.`
        : `Aquí se dibujará la ${rec.mostrar}: las dos salen de la misma notación, así que siempre se puede cambiar de una a otra.`));
}
