// Partitura | Tablatura | Ambas: las dos siempre que existan, a cualquier nivel. La app marca cuál recomienda y por qué;
// él cambia cuando quiere (la elección se recuerda por obra, ejercicio, sección o fragmento). «Ambas» (pentagrama y
// tablatura unidos) aparece cuando el contenido tiene las dos en la app; lo que el contenido no necesita no se fuerza.
import { h } from '../nucleo/dom.js';
import { cambiar } from '../nucleo/almacen.js';
import { formatos } from '../../logica/notacion.js';
import { notacionDibujada } from './partitura.js';

const NOMBRE = { partitura: 'Partitura', tablatura: 'Tab', ambas: 'Ambas' };
const LARGO = { partitura: 'partitura', tablatura: 'tablatura' };

// rec: resultado de recomendarFormato / formatoPara. clave: id de la obra o ejercicio, u «obra#sección».
// seccion: la sección o el fragmento (con su notación o sus compases), o null.
export function selectorFormato(item, rec, clave = item.id, seccion = null, { compacto = false } = {}) {
  if (!rec?.disponibles?.length) return h('p', { class: 'suave' }, rec?.motivo ?? 'Sin notación.');
  const f = formatos(item, seccion);
  const enApp = ['partitura', 'tablatura'].filter(x => f[x] === 'app');
  const elegir = fmt => cambiar(e => { e.formatos = { ...(e.formatos || {}), [clave]: fmt }; });
  const boton = fmt => {
    const est = f[fmt];
    const usable = est === 'app' || est === 'externa';
    // Lo que el contenido no necesita (no tiene esa vista) no se ofrece; lo que falta o está fuera, se dice.
    if (!est && f[fmt === 'partitura' ? 'tablatura' : 'partitura'] === 'app' && item.notacion?.fuente) return null;
    const extra = est === 'externa' ? ' (fuera de la app)' : est === 'pendiente' ? ' (por hacer)' : !est ? ' (no hay)' : '';
    return h('button', { type: 'button', disabled: !usable, 'aria-pressed': String(rec.mostrar === fmt), onclick: () => elegir(fmt) },
      NOMBRE[fmt], rec.recomendado === fmt ? ' ★' : '', extra);
  };
  const ambas = enApp.length === 2 && h('button', { type: 'button', 'aria-pressed': String(rec.mostrar === 'ambas'), title: 'Pentagrama y tablatura unidos', onclick: () => elegir('ambas') }, NOMBRE.ambas);
  const soloUna = enApp.length === 1 && rec.disponibles.length === 1;
  const mostrar = rec.mostrar;
  return h('div', { class: 'notacion' },
    h('div', { class: 'notacion__barra' },
      h('div', { class: 'segmentado', role: 'group', 'aria-label': 'Ver en' }, boton('partitura'), boton('tablatura'), ambas),
      rec.elegidoPorTi && h('button', { type: 'button', class: 'notacion__volver', onclick: () => cambiar(e => { if (e.formatos) delete e.formatos[clave]; }) }, 'Volver a la recomendada')),
    h('p', { class: 'suave notacion__motivo' }, soloUna ? rec.motivo : `★ Recomendada: ${rec.motivo}`),
    !compacto && mostrar && h('div', { class: 'atril' },
      mostrar === 'ambas' || f[mostrar] === 'app'
        ? notacionDibujada(item, seccion, mostrar)
        : f[mostrar] === 'externa'
          ? `${LARGO[mostrar][0].toUpperCase()}${LARGO[mostrar].slice(1)} fuera de la app${item.notacion?.donde ? `: ${item.notacion.donde}` : ''}.`
          : `La ${LARGO[mostrar]} está por hacer.`));
}
