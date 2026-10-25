// Una área (técnica, lectura, teoría…): su nivel, sus competencias por nivel y sus ejercicios.
import { h } from '../nucleo/dom.js';
import { ctx } from '../nucleo/almacen.js';
import { estadoEtiqueta, enlaceItem, nivelArea, programaEtiqueta, tarjeta } from '../componentes/comunes.js';

export default function area({ area }) {
  const c = ctx();
  const a = c.cat.porId.get(area);
  if (!a || a.tipo !== 'area') return h('p', null, 'Área desconocida.');
  const comps = c.cat.competencias.filter(x => x.area === area);
  const niveles = [...new Set(comps.map(x => x.nivel))].sort((x, y) => x - y);
  const ejercicios = c.cat.ejercicios.filter(e => e.area === area);
  return h('div', null,
    h('h1', null, a.nombre, ' ', programaEtiqueta(a.programa)),
    h('p', { class: 'suave' }, a.descripcion),
    tarjeta(nivelArea(c.niveles[area])),
    !comps.length && h('p', { class: 'suave' }, 'Todavía sin contenido: llega en la Fase 3, curso a curso.'),
    niveles.map(n => h('div', null, h('h2', null, `Nivel ${n}`),
      h('ul', null, comps.filter(x => x.nivel === n).map(x => h('li', null, enlaceItem(x), ' ', estadoEtiqueta(c.estadoDe(x.id))))))),
    ejercicios.length > 0 && h('div', null, h('h2', null, 'Ejercicios'),
      ejercicios.map(e => tarjeta(h('strong', null, e.titulo), h('p', null, e.objetivo), h('ol', null, (e.instrucciones || []).map(i => h('li', null, i)))))));
}
