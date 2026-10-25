// El curso y su ruta (lámina P2-Curso): dónde está, qué ha hecho, qué viene, qué áreas trabaja el curso, sus obras y
// la obra final. Todo paso se puede abrir; «recomendado» significa que la app ya lo propone. Ver logica/ruta.js.
import { h } from '../nucleo/dom.js';
import { ctx } from '../nucleo/almacen.js';
import { enlace } from '../nucleo/rutas.js';
import { relacionesPaso } from '../../logica/ruta.js';
import { mapaRuta } from '../componentes/ruta.js';
import { momentoEntrada } from '../componentes/titulo.js';
import { chipEstado, colorArea, leyendaEstados, NOMBRE_AREA } from '../componentes/marcas.js';
import { plural } from '../componentes/comunes.js';

const NOMBRE_PROGRAMA = { clasica: 'Programa clásico', flamenca: 'Programa flamenco' };
const PAPEL = { final: '★ Obra final', lectura: 'Para leer', aplicacion: 'Aplicación', obra: 'Obra del tramo' };
const dos = n => String(n).padStart(2, '0');

export const programaElegido = c => {
  const p = c.estado.preferencias || {};
  return (p.programaPrincipal ?? p.rutaPrincipal ?? 'clasica') === 'flamenca' ? 'flamenca' : 'clasica';
};

export default function curso({ id } = {}) {
  const c = ctx();
  const actualPrograma = programaElegido(c);
  const cur = id ? c.cat.porId.get(id) : c.cursoActual(actualPrograma);
  if (!cur || cur.tipo !== 'curso') return h('p', { class: 'suave' }, 'Este curso no existe.');
  const programa = cur.programa;
  const cursos = c.cat.cursos.filter(x => x.programa === programa);
  const esActual = c.cursoActual(programa)?.id === cur.id;
  const r = c.ruta(cur.id);
  const actual = r.tramos.flatMap(t => t.pasos).find(p => p.id === r.actual) ?? null;
  const etiqueta = `${NOMBRE_PROGRAMA[programa].toUpperCase()} · CURSO ${dos(cur.numero)} DE ${dos(cursos.length)}`;

  return h('div', { class: 'pantalla-curso' },
    esActual && entrada(cur, r, etiqueta),
    h('header', { class: 'cabecera' },
      h('div', { class: 'pila-s' },
        h('div', { class: 'rotulo' }, etiqueta, !esActual && ' · ', !esActual && h('span', { class: 'ocre' }, cur.numero < (c.cursoActual(programa)?.numero ?? 1) ? 'YA PASADO' : 'TODAVÍA NO')),
        h('h1', { class: 'display display-g' }, cur.nombre),
        h('p', { class: 'lead suave', style: 'max-width:46em' }, cur.salto, ' Todas las áreas, con su peso.')),
      r.tramos.length > 0 && h('div', { class: 'pila-s', style: 'align-items:flex-end' },
        h('div', { class: 'fila', style: 'align-items:baseline' }, h('span', { class: 'display display-m' }, r.progreso.hechos),
          h('span', { class: 'suave' }, `de ${plural(r.progreso.total, 'paso')}${actual ? ` · tramo ${tramoDe(r, actual.id)?.orden} de ${r.tramos.length}` : ''}`)),
        h('div', { class: 'barra-trozos', style: 'width:320px', 'aria-label': 'Avance por tramos' },
          r.tramos.map(t => h('span', { style: `flex:${Math.max(1, t.total)}` }, h('i', { style: `width:${t.total ? Math.round((t.hechos / t.total) * 100) : 0}%` })))),
        actual && h('a', { class: 'btn btn-papel', href: actual.href }, `Seguir: ${actual.titulo}`, flecha()))),

    h('nav', { class: 'fila', 'aria-label': `Cursos del ${NOMBRE_PROGRAMA[programa].toLowerCase()}`, style: 'margin:4px 0 8px' },
      cursos.map(x => h('a', { class: 'pildora', href: enlace('/curso', x.id), 'aria-current': x.id === cur.id ? 'page' : null }, `${dos(x.numero)} · ${x.nombre}`))),

    r.tramos.length
      ? h('section', { class: 'tarjeta tarjeta-ruta', 'aria-label': 'La ruta del curso' }, mapaRuta(r, { animar: true, clave: `ruta-${cur.id}` }), leyendaEstados())
      : h('section', { class: 'tarjeta' },
        h('div', { class: 'rotulo' }, 'RUTA EN PREPARACIÓN'),
        h('p', null, `La ruta de este curso se escribe en la Fase 3, con su contenido real. Lo que se sabe ya: ${cur.salto}`),
        cur.hito && h('p', { class: 'suave' }, `Hito: ${cur.hito}`)),

    r.tramos.length > 0 && h('section', { class: 'rejilla-3', style: 'margin-top:16px' },
      tarjetaAhora(c, r, actual), tarjetaAreas(r), tarjetaObras(r)));
}

const tramoDe = (r, pasoId) => r.tramos.find(t => t.pasos.some(p => p.id === pasoId));
const flecha = () => { const t = document.createElement('template'); t.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>'; return t.content.firstElementChild; };

// La entrada al curso con tipografía cinética: solo la primera vez que entra en este curso (se recuerda en este navegador).
function entrada(cur, r, etiqueta) {
  const clave = `entrada-${cur.id}`;
  let vistos = [];
  try { vistos = JSON.parse(localStorage.getItem('academia.entradas')) ?? []; } catch { vistos = []; }
  if (vistos.includes(clave)) return null;
  try { localStorage.setItem('academia.entradas', JSON.stringify([...vistos, clave])); } catch { /* sin almacenamiento: se verá otra vez */ }
  return momentoEntrada({
    etiqueta: `${etiqueta.split(' · ')[0]} · EMPIEZAS UN CURSO`, derecha: etiqueta.split(' · ')[1]?.replace('CURSO ', '').replace(' DE ', ' / '),
    sobretitulo: `Curso ${dos(cur.numero)}`, titulo: cur.nombre.toUpperCase().split(' ').length > 2 ? partir(cur.nombre.toUpperCase()) : cur.nombre.toUpperCase(),
    subtitulo: cur.salto, pie: `${plural(r.tramos.length, 'tramo')} · ${plural(r.progreso.total, 'paso')} · todas las áreas`,
    accion: { texto: 'Ver la ruta del curso' }, ruta: r, clave,
  });
}
// «SONIDO Y CONTROL» → ['SONIDO', 'Y CONTROL'], para que el título grande quepa en dos líneas.
const partir = t => { const p = t.split(' '); const m = Math.ceil(p.length / 2) - (p.length > 2 && p[1].length <= 2 ? 1 : 0); return [p.slice(0, m).join(' '), p.slice(m).join(' ')]; };

function tarjetaAhora(c, r, actual) {
  if (!actual) {
    return h('div', { class: 'tarjeta pila-s' }, h('div', { class: 'rotulo' }, r.terminado ? 'CURSO TERMINADO' : 'SIN PASO RECOMENDADO'),
      h('p', { class: 'suave' }, r.terminado ? 'Has cerrado este curso con su obra final.' : 'Lo que queda está por llegar o en preparación.'));
  }
  const rel = relacionesPaso(c, actual.id);
  const obra = rel?.prepara.find(x => !x.contiene) ?? rel?.prepara[0];
  return h('div', { class: 'tarjeta tarjeta-ahora pila-s' },
    h('div', { class: 'rotulo' }, h('span', { class: 'rotulo-verde' }, 'AHORA'), ` · PASO ${actual.numero} · ${(NOMBRE_AREA[actual.area] ?? '').toUpperCase()}`),
    h('div', { class: 'display display-m' }, actual.titulo),
    h('p', { class: 'suave' }, [actual.objetivo, obra && `Lo necesitas para ${obra.seccionTitulo ? `la ${obra.seccionTitulo.charAt(0).toLowerCase()}${obra.seccionTitulo.slice(1)} de ` : ''}${obra.titulo}.`].filter(Boolean).join(' ')),
    h('div', { class: 'fila empuja' },
      h('a', { class: 'btn btn-papel', href: actual.href }, 'Abrir el paso'),
      obra && h('a', { class: 'btn btn-borde', href: enlace('/obra', obra.obra) }, 'Ver ', h('span', { class: 'titulo-obra' }, obra.titulo))));
}

function tarjetaAreas(r) {
  const max = Math.max(1, ...r.areas.map(a => a.pasos));
  return h('div', { class: 'tarjeta pila-s' },
    h('div', { class: 'fila-entre' }, h('span', { class: 'rotulo' }, 'ESTE CURSO TRABAJA'), h('span', { class: 'pequeno suave' }, 'pasos por área')),
    h('div', { class: 'pila-s' }, r.areas.map(a => h('div', { class: 'fila', style: 'gap:10px' },
      h('span', { style: 'width:150px', class: 'pequeno' }, NOMBRE_AREA[a.area] ?? a.nombre),
      h('div', { class: 'barra', style: `flex:1; --c:${colorArea(a.area)}` }, h('i', { style: `width:${Math.round((a.pasos / max) * 100)}%` })),
      h('span', { class: 'pequeno', style: 'width:20px;text-align:right' }, a.pasos)))),
    h('p', { class: 'pequeno suave' }, 'Todas las áreas en cada curso, con distinto peso.'));
}

function tarjetaObras(r) {
  return h('div', { class: 'tarjeta pila-s' },
    h('span', { class: 'rotulo' }, 'OBRAS DEL CURSO'),
    r.obras.length ? h('ul', { class: 'lista-limpia pila-s' }, r.obras.map(x => h('li', { class: 'fila-entre' },
      h('a', { href: enlace('/obra', x.obra.id), class: 'titulo-obra' }, x.obra.titulo),
      h('span', { class: 'fila', style: 'gap:6px' },
        x.papeles.map(p => chipEstado(PAPEL[p] ?? p, p === 'final' ? 'encargo' : 'neutro')),
        h('span', { class: 'pequeno suave' }, x.estado.texto)))))
      : h('p', { class: 'suave' }, 'Las obras de este curso llegan con su ruta.'));
}
