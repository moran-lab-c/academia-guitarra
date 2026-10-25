// El atril: la superficie de papel donde va el material musical (partitura, tablatura, ejercicio). Es lo más claro de la
// pantalla; todo lo demás se queda en grafito. contenido: cualquier nodo (la notación); nota: una línea en cursiva al pie.
import { h } from '../nucleo/dom.js';

export function atril({ titulo, subtitulo, contenido, nota } = {}) {
  return h('figure', { class: 'atril' },
    (titulo || subtitulo) && h('div', { class: 'atril__cabecera' },
      titulo && h('span', { class: 'atril__titulo' }, titulo),
      subtitulo && h('span', { class: 'atril__subtitulo' }, subtitulo)),
    h('div', { class: 'atril__contenido' }, contenido),
    nota && h('figcaption', { class: 'atril__nota' }, nota));
}
