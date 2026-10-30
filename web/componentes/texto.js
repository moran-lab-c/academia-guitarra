// El texto de un paso, con su **negrita** y su *cursiva*. Crea nodos, nunca HTML.
import { h } from '../nucleo/dom.js';

export function textoRico(texto) {
  const nodos = [];
  const re = /\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*/g;
  let i = 0, m;
  while ((m = re.exec(texto))) {
    if (m.index > i) nodos.push(texto.slice(i, m.index));
    if (m[1]) nodos.push(h('strong', null, h('em', { class: 'titulo-obra' }, m[1])));
    else if (m[2]) nodos.push(h('strong', null, textoRico(m[2])));
    else nodos.push(h('em', { class: 'titulo-obra' }, m[3]));
    i = re.lastIndex;
  }
  if (i < texto.length) nodos.push(texto.slice(i));
  return nodos;
}
