// Obras: la biblioteca de repertorio del currículo y la página de cada obra, con lo necesario y nada más.
import { h } from '../nucleo/dom.js';
import { datos, curriculo, ctx } from '../nucleo/almacen.js';
import { enlace, repintar } from '../nucleo/rutas.js';
import { progresoObra, progresoVacio } from '../../logica/curriculo.js';
import { formatoPara } from '../../logica/recomendador.js';
import { selectorFormato } from '../componentes/notacion.js';
import { textoRico } from '../componentes/texto.js';
import repertorioAntiguo from './repertorio.js';
import { programaElegido } from './curso.js';

const TIPO = { troncal: 'Principal', aplicacion: 'De aplicación', lectura: 'De lectura', fragmento: 'Fragmento', alternativa: 'Alternativa', conocida: 'Ya la conoces' };
const filtro = { nivel: null, tipo: null };

export default function obras() {
  if (programaElegido(ctx()) === 'flamenca') return repertorioAntiguo();
  const ind = curriculo();
  const cur = datos().estado.curriculo ?? progresoVacio();
  const lista = ind.obras.filter(o => (!filtro.nivel || o.nivel === filtro.nivel) && (!filtro.tipo || o.tipo === filtro.tipo));
  const boton = (texto, activo, onclick) => h('button', { type: 'button', 'aria-pressed': String(activo), onclick }, texto);
  return h('div', { class: 'pantalla-obras pila' },
    h('header', { class: 'cabecera' },
      h('div', { class: 'pila-s' }, h('div', { class: 'rotulo' }, 'PROGRAMA CLÁSICO'), h('h1', { class: 'display display-g' }, 'Obras'))),
    h('div', { class: 'fila' },
      h('div', { class: 'segmentado', role: 'group', 'aria-label': 'Nivel' },
        boton('Todas', !filtro.nivel, () => { filtro.nivel = null; repintar(); }),
        ind.niveles.map(n => boton(n.numero, filtro.nivel === n.numero, () => { filtro.nivel = n.numero; repintar(); }))),
      h('div', { class: 'segmentado', role: 'group', 'aria-label': 'Tipo' },
        boton('Todos', !filtro.tipo, () => { filtro.tipo = null; repintar(); }),
        ['troncal', 'aplicacion', 'lectura', 'fragmento', 'alternativa'].map(t => boton(TIPO[t], filtro.tipo === t, () => { filtro.tipo = t; repintar(); })))),
    h('ul', { class: 'obras-lista lista-limpia' }, lista.map(o => {
      const p = progresoObra(ind, cur, o.id);
      return h('li', null, h('a', { class: 'obra-fila', href: enlace('/obras', o.id) },
        h('span', { class: 'obra-fila__titulo titulo-obra' }, o.titulo),
        h('span', { class: 'suave' }, o.compositor ?? ''),
        h('span', { class: 'pequeno suave' }, `Nivel ${o.nivel}`),
        h('span', { class: 'pequeno suave' }, TIPO[o.tipo]),
        h('span', { class: 'obra-fila__avance' }, p.total ? h('span', { class: 'barra' }, h('i', { style: `width:${p.porcentaje}%` })) : null)));
    })),
    h('a', { class: 'pequeno suave', href: '#/repertorio' }, 'Añadir una obra tuya o de tu profesor'));
}

export function obra({ id }) {
  const ind = curriculo();
  const o = ind.obraPorId.get(id);
  if (!o) return h('p', { class: 'suave' }, 'Esta obra no está en el currículo.');
  const c = ctx();
  const cur = datos().estado.curriculo ?? progresoVacio();
  const ficha = o.ficha ? c.cat.porId.get(o.ficha) : null;
  const p = progresoObra(ind, cur, o.id);
  const secciones = ficha?.secciones ?? [];
  return h('div', { class: 'pantalla-obra pila' },
    h('a', { href: '#/obras', class: 'suave' }, '← Obras'),
    h('header', { class: 'cabecera' },
      h('div', { class: 'pila-s' },
        h('div', { class: 'rotulo' }, `NIVEL ${o.nivel} · ${TIPO[o.tipo].toUpperCase()}`),
        h('h1', { class: 'display display-m titulo-obra' }, o.titulo),
        o.compositor && h('p', { class: 'lead' }, o.compositor)),
      p.total > 0 && h('div', { class: 'obra-avance' }, h('span', { class: 'pequeno suave' }, `${p.porcentaje} %`), h('div', { class: 'barra' }, h('i', { style: `width:${p.porcentaje}%` })))),
    ficha?.notacion?.fuente
      ? selectorFormato(ficha, formatoPara(ficha, c, {}), ficha.id)
      : h('p', { class: 'tarjeta tarjeta-s suave' }, o.derechos === 'con-derechos'
        ? 'Esta obra se toca con una edición publicada. La app no la transcribe.'
        : 'La partitura y la tablatura están pendientes de incorporar a la app.'),
    secciones.length > 0 && h('section', { class: 'pila-s' }, h('div', { class: 'rotulo' }, 'SECCIONES'),
      h('ul', { class: 'lista-limpia pila-s' }, secciones.map(s => h('li', null, s.titulo ?? s.nombre ?? s.id)))),
    (o.tecnica || o.teoria) && h('p', { class: 'suave' }, textoRico([o.tecnica, o.teoria].filter(Boolean).join('. '))),
    o.porVerificar && h('p', { class: 'pequeno ocre' }, 'Hay datos de esta obra por verificar con la partitura.'),
    p.total > 0 && h('section', { class: 'pila-s' }, h('div', { class: 'rotulo' }, 'EN EL CURSO'),
      h('ol', { class: 'lista-limpia pila-s' }, p.pasos.map(e => h('li', null,
        h('a', { href: enlace('/aprender', e.paso.id), class: 'fila' },
          h('i', { class: `punto-leccion punto-leccion--${cur.pasos?.[e.paso.id]?.e ?? 'nueva'}` }),
          h('span', null, `Tramo ${e.tramo.numero} · `, textoRico(e.paso.texto || e.leccion.titulo))))))));
}
