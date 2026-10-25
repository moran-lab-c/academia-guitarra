// Ficha de una competencia: qué es, para qué, criterio, requisitos, ejercicios, estado y registro.
import { h } from '../nucleo/dom.js';
import { ctx } from '../nucleo/almacen.js';
import { repintar } from '../nucleo/rutas.js';
import { formularioRegistro } from '../componentes/registro.js';
import { bloqueCriterio } from '../componentes/criterio.js';
import { selectorFormato } from '../componentes/notacion.js';
import { formatoPara } from '../../logica/recomendador.js';
import { PROPOSITO } from '../../logica/planificador.js';
import { estadoEtiqueta, enlaceItem, programaEtiqueta, fecha, tarjeta } from '../componentes/comunes.js';
import { dondeSeTrabaja } from '../../logica/ruta.js';

let abierto = null; // { id, modo }

export default function competencia({ id }) {
  const c = ctx();
  const x = c.cat.porId.get(id);
  if (!x || x.tipo !== 'competencia') return h('p', null, 'No existe.');
  const d = c.dom.get(id);
  const ejercicios = c.cat.ejercicios.filter(e => e.trabaja?.includes(id));
  const intentos = c.eventos.filter(e => e.item === id).slice(-10).reverse();
  return h('div', null,
    h('h1', null, x.nombre),
    h('p', null, programaEtiqueta(x.programa), ' ', c.cat.porId.get(x.area)?.nombre, ` · nivel ${x.nivel}`, ' ', estadoEtiqueta(c.estadoDe(id))),
    (() => { const pasos = dondeSeTrabaja(c, id).filter(d => d.tipo === 'paso'); return pasos.length > 0 && h('p', { class: 'suave' }, 'En la ruta: ', pasos.map((d, i) => [i ? ' · ' : '', h('a', { href: d.href }, `curso ${String(d.curso).padStart(2, '0')}, tramo ${d.tramo}: ${d.titulo}`)])); })(),
    d?.solidez > 0 && h('p', { class: 'suave' }, `Solidez ${Math.min(d.solidez, 3)} de 3 · próxima comprobación en frío: ${fecha(d.proxima)}`),
    h('p', null, x.descripcion),
    x.proposito && h('p', null, h('strong', null, 'Para qué: '), x.proposito),
    x.erroresComunes?.length > 0 && h('div', null, h('strong', null, 'Errores frecuentes'), h('ul', null, x.erroresComunes.map(e => h('li', null, e)))),
    x.requiere?.length > 0 && h('div', null, h('strong', null, 'Necesita antes'), h('ul', null, x.requiere.map(r => h('li', null, enlaceItem(c.cat.porId.get(r)), ' ', estadoEtiqueta(c.estadoDe(r)))))),
    x.transfiere?.length > 0 && h('div', null, h('strong', null, 'Lo que te trae el flamenco'),
      h('ul', null, x.transfiere.map(t => h('li', null, enlaceItem(c.cat.porId.get(t.desde)), ` (${estadoTexto(c, t.desde)}): ${t.nota}`)))),
    ejercicios.map(e => tarjeta(h('strong', null, e.titulo), h('p', null, e.objetivo), h('ol', null, (e.instrucciones || []).map(i => h('li', null, i))),
      e.notacion && selectorFormato(e, formatoPara(e, c, { proposito: PROPOSITO[e.area] }), e.id))),
    h('h2', null, 'Dominio'),
    bloqueCriterio(x),
    h('div', { class: 'fila' },
      h('button', { onclick: () => { abierto = { id, modo: 'trabajo' }; repintar(); } }, 'Registrar práctica'),
      h('button', { onclick: () => { abierto = { id, modo: 'comprobacion' }; repintar(); } }, 'Comprobación en frío')),
    abierto?.id === id && formularioRegistro(x, { modo: abierto.modo }, () => { abierto = null; repintar(); }),
    intentos.length > 0 && h('div', null, h('h2', null, 'Últimos intentos'),
      h('ul', null, intentos.map(e => h('li', null, `${fecha(e.t)} · ${e.modo === 'comprobacion' ? 'en frío' : 'práctica'}`,
        e.tempo ? ` · ♩=${e.tempo}` : '', e.limpias != null ? ` · ${e.limpias} limpias` : '', e.tanda ? ` · ${e.tanda[0]}/${e.tanda[1]}` : '', e.nota ? ` · ${e.nota}` : '')))));
}

const estadoTexto = (c, id) => ({ pendiente: 'sin empezar', 'en-progreso': 'en progreso', completado: 'completado', dominado: 'dominado', 'necesita-repaso': 'necesita repaso' }[c.estadoDe(id)]);
