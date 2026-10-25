// Obras (lámina P7): primero las de tu curso, con su papel en la ruta y lo que piden; luego lo que conviene ahora, el
// catálogo con filtros y añadir obras propias o del profesor. La lectura que pide una obra se dice, pero no la cierra.
import { h, valores } from '../nucleo/dom.js';
import { ctx, cambiar } from '../nucleo/almacen.js';
import { repintar, enlace } from '../nucleo/rutas.js';
import { recomendar, viabilidad } from '../../logica/recomendador.js';
import { necesidades, estadoObra } from '../../logica/ruta.js';
import { CLASES_OBRA } from '../../logica/validarCatalogo.js';
import { NOMBRE_MARCA, NOMBRE_VIABILIDAD } from '../componentes/comunes.js';
import { chipEstado } from '../componentes/marcas.js';
import { programaElegido } from './curso.js';

const PAPEL = { final: '★ Obra final', lectura: 'Para leer', aplicacion: 'Aplicación', obra: 'Obra del tramo' };
const filtro = { programa: null, marca: '', viabilidad: '' };
let anadiendo = false;

export default function repertorio() {
  const c = ctx();
  const programa = filtro.programa ?? programaElegido(c);
  const ruta = c.rutaActual(programa);
  const delCurso = new Set((ruta?.obras || []).map(x => x.obra.id));
  const obras = c.cat.obras.filter(o => o.programa === programa)
    .map(o => ({ o, v: viabilidad(o, c) }))
    .filter(({ o, v }) => (!filtro.marca || c.marca(o.id) === filtro.marca) && (!filtro.viabilidad || v.clase === filtro.viabilidad));
  const sel = (clave, opciones) => h('select', { onchange: e => { filtro[clave] = e.target.value; repintar(); } },
    opciones.map(([v, t]) => h('option', { value: v, selected: filtro[clave] === v }, t)));
  const conviene = recomendar(c, { programa, limite: 6 }).filter(r => !delCurso.has(r.obra.id) && r.viabilidad.clase !== 'demasiado-dificil').slice(0, 3);

  return h('div', { class: 'pantalla-obras pila' },
    h('header', { class: 'cabecera' },
      h('div', { class: 'pila-s' },
        h('div', { class: 'rotulo' }, programa === 'flamenca' ? 'PROGRAMA FLAMENCO' : 'PROGRAMA CLÁSICO', ruta && ` · CURSO ${String(ruta.curso.numero).padStart(2, '0')}`),
        h('h1', { class: 'display display-g' }, 'Obras')),
      h('div', { class: 'segmentado', role: 'group', 'aria-label': 'Programa' },
        [['clasica', 'Clásico'], ['flamenca', 'Flamenco']].map(([v, t]) => h('button', { type: 'button', 'aria-pressed': String(v === programa), onclick: () => { filtro.programa = v; repintar(); } }, t)))),

    h('section', { class: 'pila-s' },
      h('div', { class: 'rotulo' }, 'LAS DE TU CURSO'),
      ruta?.obras.length ? h('div', { class: 'rejilla-3' }, ruta.obras.map(x => tarjetaObra(c, x))) : h('p', { class: 'suave' }, 'Las obras de este curso llegan con su ruta.')),

    conviene.length > 0 && h('section', { class: 'pila-s' },
      h('div', { class: 'rotulo' }, 'TE CONVIENE AHORA, FUERA DE LA RUTA'),
      h('div', { class: 'rejilla-3' }, conviene.map(r => h('a', { class: 'tarjeta tarjeta-enlace pila-s', href: enlace('/obra', r.obra.id) },
        h('span', { class: 'titulo-obra' }, r.obra.titulo), h('span', { class: 'pequeno suave' }, `${r.obra.compositor} · ${NOMBRE_VIABILIDAD[r.viabilidad.clase]}`),
        h('ul', { class: 'motivos pequeno' }, r.razones.slice(0, 2).map(t => h('li', null, t))))))),

    h('section', { class: 'pila-s' },
      h('div', { class: 'fila-entre' }, h('span', { class: 'rotulo' }, 'CATÁLOGO'),
        h('div', { class: 'fila' },
          sel('marca', [['', 'Cualquier marca'], ...Object.entries(NOMBRE_MARCA)]),
          sel('viabilidad', [['', 'Cualquier dificultad'], ...Object.entries(NOMBRE_VIABILIDAD)]),
          h('button', { class: 'btn btn-borde', onclick: () => { anadiendo = !anadiendo; repintar(); } }, 'Añadir una obra'))),
      anadiendo && formularioObra(programa),
      h('table', null,
        h('tr', null, h('th', null, 'Obra'), h('th', null, 'Compositor'), h('th', null, 'Curso'), h('th', null, 'Ahora'), h('th', null, 'Tu marca'), h('th', null, 'Estado')),
        obras.map(({ o, v }) => h('tr', null,
          h('td', null, h('a', { href: enlace('/obra', o.id), class: 'titulo-obra' }, o.titulo), o.origen && o.origen !== 'catalogo' ? h('span', { class: 'suave' }, o.origen === 'profesor' ? ' (del profesor)' : ' (tuya)') : '', delCurso.has(o.id) ? h('span', { class: 'suave' }, ' · en tu curso') : ''),
          h('td', null, o.compositor), h('td', null, o.nivel?.curso ?? '—'),
          h('td', null, NOMBRE_VIABILIDAD[v.clase]), h('td', null, NOMBRE_MARCA[c.marca(o.id)] ?? '—'), h('td', null, estadoObra(c, o.id).texto)))),
      !obras.length && h('p', { class: 'suave' }, 'Nada con estos filtros.')));
}

// Una obra del curso: su papel, cómo va y lo que pide (con la lectura como dato, nunca como cierre).
function tarjetaObra(c, x) {
  const n = necesidades(c, x.obra.id);
  const r = n?.resumen ?? {};
  const partes = [[r.laTienes, 'ya las tienes'], [r.falta, 'te faltan (las trabaja la ruta)'], [r.refuerzo, 'necesitan refuerzo'], [r.porConsolidar, 'todavía no consolidadas'], [r.estimada, 'por confirmar']]
    .filter(([k], i) => i === 0 || k).map(([k, t]) => `${k} ${t}`);
  return h('a', { class: `tarjeta tarjeta-enlace pila-s${x.papeles.includes('final') ? ' tarjeta-borde' : ''}`, href: enlace('/obra', x.obra.id) },
    h('div', { class: 'fila', style: 'gap:6px' }, x.papeles.map(p => chipEstado(PAPEL[p] ?? p, p === 'final' ? 'encargo' : 'neutro'))),
    h('span', { class: 'titulo-obra', style: 'font-size:22px' }, x.obra.titulo),
    h('span', { class: 'pequeno suave' }, `${x.obra.compositor} · tramo${x.tramos.length > 1 ? 's' : ''} ${x.tramos.join(', ')}`),
    h('span', null, x.estado.texto),
    n && h('span', { class: 'pequeno suave' }, n.pide.length ? `Pide ${n.pide.length}: ${partes.join(', ')}.` : 'Lo que pide, por clasificar.'),
    n?.lectura && h('span', { class: 'pequeno suave' }, `Lectura que pide: nivel ${n.lectura.pide}; la tuya, ${n.lectura.tienes}. ${n.lectura.pide > n.lectura.tienes ? 'Se toca con tablatura mientras tanto.' : ''}`));
}

// Las obras que añade él o su profesor van a sus datos, no al catálogo; se pueden clasificar después.
function formularioObra(programa) {
  const campo = (t, control) => h('label', null, t, control);
  const form = h('form', { class: 'tarjeta', onsubmit: e => {
    e.preventDefault();
    const v = valores(form);
    if (!v.titulo.trim() || !v.compositor.trim()) return;
    const id = `obra:propia.${slug(v.compositor)}-${slug(v.titulo)}-${Date.now().toString(36)}`;
    cambiar(est => {
      est.contenidoPropio.obras.push({ id, programa: v.programa, clase: v.clase, compositor: v.compositor.trim(), titulo: v.titulo.trim(), origen: v.origen, nivel: null, nota: v.nota || null, creada: new Date().toISOString() });
      est.obras[id] = { marca: v.marca || null };
    });
    anadiendo = false;
  } },
    h('div', { class: 'fila' },
      campo('Título', h('input', { name: 'titulo', required: true })),
      campo('Compositor (o «Anónimo», «Tradicional»)', h('input', { name: 'compositor', required: true })),
      campo('Programa', h('select', { name: 'programa' }, h('option', { value: 'clasica', selected: programa === 'clasica' }, 'Clásico'), h('option', { value: 'flamenca', selected: programa === 'flamenca' }, 'Flamenco'))),
      campo('Clase', h('select', { name: 'clase' }, CLASES_OBRA.map(x => h('option', { value: x }, x)))),
      campo('La propone', h('select', { name: 'origen' }, h('option', { value: 'usuario' }, 'Yo'), h('option', { value: 'profesor' }, 'Mi profesor'))),
      campo('Marca', h('select', { name: 'marca' }, h('option', { value: '' }, '—'), Object.entries(NOMBRE_MARCA).map(([k, t]) => h('option', { value: k }, t))))),
    h('label', { style: 'display:flex' }, 'Nota', h('textarea', { name: 'nota' })),
    h('p', { class: 'suave' }, 'Queda sin clasificar: el curso, lo que pide y lo que desarrolla se añaden después, con su fuente.'),
    h('button', { class: 'principal', type: 'submit' }, 'Añadir'));
  return form;
}

const slug = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30);
