// Un ejercicio (lámina P5-Ejercicio): para qué está (qué paso de la ruta y qué obra prepara), la notación sobre el atril
// con su selector Partitura | Tablatura, los pasos a seguir y el registro, todo quieto mientras se practica.
import { h } from '../nucleo/dom.js';
import { ctx } from '../nucleo/almacen.js';
import { enlace, repintar } from '../nucleo/rutas.js';
import { relacionesPaso } from '../../logica/ruta.js';
import { formatoPara } from '../../logica/recomendador.js';
import { PROPOSITO } from '../../logica/planificador.js';
import { textoCriterio } from '../../logica/dominio.js';
import { nombreDe } from '../../logica/catalogo.js';
import { selectorFormato } from '../componentes/notacion.js';
import { formularioRegistro } from '../componentes/registro.js';
import { chipEstado, colorArea, NOMBRE_AREA } from '../componentes/marcas.js';
import { barraMetronomo } from '../componentes/metronomo.js';
import { tempoDe } from '../../logica/metronomo.js';

const NOMBRE_ESTADO = { pendiente: 'sin empezar', 'en-progreso': 'en curso', completado: 'hecho', dominado: 'dominado', 'necesita-repaso': 'toca reforzarlo' };
let modo = { id: null, frio: false, comp: null }; // comp: en cuál se registra, si trabaja varias

export default function ejercicio({ id }) {
  const c = ctx();
  const e = c.cat.porId.get(id);
  if (!e || e.tipo !== 'ejercicio') return h('p', { class: 'suave' }, 'Este ejercicio no existe.');
  if (modo.id !== id) modo = { id, frio: false, comp: null };
  const pasos = (c.cat.pasosCon.get(id) || []).map(p => relacionesPaso(c, p.id)).filter(Boolean);
  const comps = (e.trabaja || []).map(k => c.cat.porId.get(k)).filter(Boolean);
  // Se registra en la que él elija; si no, en la del paso de la ruta que lo usa y, si no, en la primera sin dominar.
  const delPaso = pasos.flatMap(r => r.comps.map(k => k.comp)).find(k => comps.some(x => x.id === k));
  const comp = comps.find(x => x.id === modo.comp) ?? comps.find(x => x.id === delPaso) ?? comps.find(x => c.estadoDe(x.id) !== 'dominado') ?? comps[0];
  const tempo = tempoDe(c, comp?.id ?? e.id, { contenido: e }); // con el compás del ejercicio (y su unidad: ♩. en 6/8)
  const obra = pasos.flatMap(r => r.prepara).find(x => !x.contiene);
  const donde = pasos[0];

  return h('div', { class: 'pantalla-ejercicio' },
    h('div', { class: 'fila-entre' },
      donde ? h('a', { href: enlace('/paso', donde.paso.id), class: 'suave' }, `← Paso de la ruta: ${donde.paso.titulo}`) : h('a', { href: '#/biblioteca', class: 'suave' }, '← Biblioteca'),
      h('span', { class: 'rotulo' }, 'MODO PRÁCTICA')),
    h('header', { class: 'cabecera' },
      h('div', { class: 'pila-s' },
        h('div', { class: 'rotulo' }, h('span', { style: `color:${colorArea(e.area)}` }, (NOMBRE_AREA[e.area] ?? e.area).toUpperCase()),
          donde && ` · CURSO ${String(donde.curso.numero).padStart(2, '0')}, TRAMO ${donde.tramo.orden}`,
          comp && ` · ${(NOMBRE_ESTADO[c.estadoDe(comp.id)] ?? '').toUpperCase()}`, comp && c.dom.get(comp.id)?.solidez ? `, SOLIDEZ ${Math.min(3, c.dom.get(comp.id).solidez)} DE 3` : ''),
        h('h1', { class: 'display display-g' }, e.titulo),
        h('p', { class: 'suave' }, e.objetivo, obra && ' ', obra && h('span', null, 'Para qué: lo necesitas para ', h('a', { href: enlace('/obra', obra.obra), class: 'titulo-obra' }, obra.titulo), obra.seccionTitulo ? `, ${obra.seccionTitulo[0].toLowerCase()}${obra.seccionTitulo.slice(1)}` : '', '.')))),
    h('div', { class: 'con-lateral' },
      h('section', { class: 'pila' },
        e.notacion ? selectorFormato(e, formatoPara(e, c, { proposito: PROPOSITO[e.area] }), e.id) : h('p', { class: 'suave' }, 'Este ejercicio no lleva notación: es de sensación y de escucha.'),
        (e.instrucciones || []).length > 0 && h('ol', { class: 'rejilla-3 lista-limpia' }, e.instrucciones.map((t, i) => h('li', { class: 'tarjeta-s pila-s' },
          h('span', { class: 'dato' }, String(i + 1).padStart(2, '0')), h('span', { class: 'suave' }, t)))),
        e.tempo?.regla && h('p', { class: 'pequeno suave' }, `Tempo: ${e.tempo.regla}${/se apunta/.test(e.tempo.regla) ? '' : ' El tempo se apunta para ver cómo sube; no es el criterio.'}`),
        e.nota && h('p', { class: 'pequeno suave' }, e.nota),
        (e.porVerificar || []).length > 0 && h('p', { class: 'pequeno ocre' }, `Por verificar: ${e.porVerificar.map(x => x.motivo).join(' ')}`)),
      h('aside', { class: 'pila' },
        barraMetronomo({ clave: comp?.id ?? e.id, tempo }),
        comp && h('div', { class: 'tarjeta pila-s' },
          h('div', { class: 'fila-entre' }, h('span', { class: 'rotulo' }, 'CÓMO HA SALIDO'),
            h('div', { class: 'segmentado', role: 'group', 'aria-label': 'Tipo de intento' },
              h('button', { type: 'button', 'aria-pressed': String(!modo.frio), onclick: () => { modo.frio = false; repintar(); } }, 'Práctica'),
              h('button', { type: 'button', 'aria-pressed': String(modo.frio), onclick: () => { modo.frio = true; repintar(); } }, 'En frío'))),
          comps.length > 1 && h('label', { class: 'pequeno' }, 'Se registra en ',
            h('select', { onchange: ev => { modo.comp = ev.target.value; repintar(); } }, comps.map(x => h('option', { value: x.id, selected: x.id === comp.id }, nombreDe(x))))),
          formularioRegistro(comp, { modo: modo.frio ? 'comprobacion' : 'trabajo', area: e.area, unidad: tempo.unidad }, () => repintar())),
        h('div', { class: 'tarjeta pila-s' },
          h('div', { class: 'rotulo' }, 'LO QUE TRABAJA'),
          comps.map(x => h('div', { class: 'pila-s' },
            h('div', { class: 'fila-entre' }, h('a', { href: enlace('/competencia', x.id) }, x.nombre), chipEstado(NOMBRE_ESTADO[c.estadoDe(x.id)] ?? '', c.estadoDe(x.id) === 'necesita-repaso' ? 'repaso' : 'neutro')),
            h('p', { class: 'pequeno suave' }, textoCriterio(x, c.estado.ajustes?.[x.id]))))))));
}
