// Un paso de la ruta (lámina P3-Nodo): qué es, lo que vas a hacer, cuándo está bien, de hecho a dominado, para qué
// sirve (qué obras prepara y qué abre después), en qué se apoya y cómo vas. Se puede abrir aunque no esté recomendado.
import { h } from '../nucleo/dom.js';
import { ctx } from '../nucleo/almacen.js';
import { enlace, repintar } from '../nucleo/rutas.js';
import { relacionesPaso, necesidades } from '../../logica/ruta.js';
import { criterioDe, textoCriterio } from '../../logica/dominio.js';
import { DIMENSIONES } from '../../logica/esquema.js';
import { separar, nombreDe } from '../../logica/catalogo.js';
import { formularioRegistro } from '../componentes/registro.js';
import { glifoEstado, iconoArea, chipEstado, NOMBRE_AREA, colorArea } from '../componentes/marcas.js';
import { fecha } from '../componentes/comunes.js';

const NOMBRE_ESTADO = { dominado: 'Dominado', hecho: 'Hecho', repaso: 'Toca reforzarlo', actual: 'Ahora', recomendado: 'Recomendado', proximo: 'Próximo', futuro: 'Más adelante' };
const SITUACION = { 'la-tienes': ['Ya la tienes', 'neutro'], 'por-consolidar': ['Por consolidar', 'neutro'], refuerzo: ['Necesita refuerzo', 'refuerzo'], falta: ['Te falta', 'repaso'], estimada: ['Por confirmar', 'neutro'] };
// Nombre corto de cada aspecto para «Cómo vas» («Continuidad bien», no «Sin bien»).
const CORTO = { precision: 'Notas', ritmo: 'Ritmo', continuidad: 'Continuidad', limpieza: 'Limpieza', control: 'Control', sonido: 'Sonido', dinamica: 'Dinámica', articulacion: 'Articulación', fraseo: 'Fraseo', memoria: 'Memoria' };
let abierto = null; // { comp, modo }

export default function paso({ id }) {
  const c = ctx();
  const rel = relacionesPaso(c, id);
  if (!rel) return h('p', { class: 'suave' }, 'Este paso no existe.');
  const { paso: p, tramo, curso } = rel;
  const r = c.ruta(curso.id);
  const vista = r.tramos.flatMap(t => t.pasos).find(x => x.id === p.id);
  const area = vista?.area ?? p.area;
  const estadoRuta = vista?.estado ?? 'futuro';
  const total = r.tramos.reduce((s, t) => s + t.total, 0);
  const comp = rel.comps.find(x => x.estado !== 'dominado') ?? rel.comps[0];
  const ejercicio = rel.contenido.map(x => x.item).find(x => x?.tipo === 'ejercicio') ?? (comp ? (c.cat.ejerciciosDe.get(comp.comp) || [])[0] : null);
  const obraClave = rel.contenido.find(x => x.item?.tipo === 'obra');
  const practicar = ejercicio ? enlace('/ejercicio', ejercicio.id) : obraClave ? enlace('/obra', obraClave.item.id) : comp ? enlace('/competencia', comp.comp) : null;

  return h('div', { class: 'pantalla-paso' },
    h('div', { class: 'fila-entre' },
      h('a', { href: enlace('/curso', curso.id), class: 'suave' }, '← ', `Curso ${String(curso.numero).padStart(2, '0')} · Tramo ${tramo.orden}, ${tramo.titulo.toLowerCase()}`),
      vecinos(r, p)),
    h('header', { class: 'cabecera' },
      h('div', { class: 'pila-s' },
        h('div', { class: 'rotulo' }, h('span', { class: estadoRuta === 'actual' ? 'rotulo-verde' : estadoRuta === 'repaso' ? 'rotulo-ocre' : '' }, (NOMBRE_ESTADO[estadoRuta] ?? '').toUpperCase()),
          ` · PASO ${vista?.numero ?? '?'} DE ${total}`, area && ' · ', area && h('span', { style: `color:${colorArea(area)}` }, (NOMBRE_AREA[area] ?? area).toUpperCase())),
        h('h1', { class: 'display display-g' }, p.titulo),
        p.objetivo && h('p', { class: 'lead suave', style: 'max-width:44em' }, p.objetivo),
        vista?.detalle && h('p', { class: 'ocre' }, vista.detalle)),
      h('div', { class: 'fila' },
        practicar && h('a', { class: 'btn btn-papel btn-grande', href: practicar }, 'Practicar este paso'),
        obraClave && h('a', { class: 'btn btn-borde', href: enlace('/obra', obraClave.item.id) }, 'Ir a ', h('span', { class: 'titulo-obra' }, obraClave.item.titulo)))),
    !['actual', 'recomendado', 'hecho', 'dominado', 'repaso'].includes(estadoRuta) && h('div', { class: 'aviso' },
      'Este paso todavía no es el que te toca: puedes verlo y practicarlo, pero la ruta te propone antes lo anterior.'),
    h('div', { class: 'con-lateral' },
      h('section', { class: 'pila' },
        loQueVasAHacer(c, rel, p),
        p.clase === 'evaluacion' ? evaluacion(c, tramo) : rel.comps.length > 0 && cuandoEstaBien(c, rel),
        rel.comps.length > 0 && deHechoADominado(rel)),
      h('aside', { class: 'pila' },
        paraQueSirve(c, rel),
        (rel.requisitos.length > 0 || rel.pasosAntes.length > 0) && seApoyaEn(c, rel),
        rel.comps.length > 0 && comoVas(c, rel))));
}

function vecinos(r, p) {
  const todos = r.tramos.flatMap(t => t.pasos).filter(x => !x.insertado);
  const i = todos.findIndex(x => x.id === p.id);
  const enlaceVecino = x => x && h('a', { href: x.href, class: 'fila pequeno suave', style: 'gap:6px' }, glifoEstado(x.estado, { tam: 12 }), `${x.numero} · ${x.titulo}`);
  return h('nav', { class: 'fila pequeno', 'aria-label': 'Pasos vecinos' }, enlaceVecino(todos[i - 1]), i > 0 && h('span', { class: 'linea', style: 'width:24px' }),
    h('span', { class: 'fila', style: 'gap:6px;font-weight:600' }, glifoEstado(todos[i]?.estado ?? 'futuro', { tam: 14 }), `${todos[i]?.numero ?? ''} · ${p.titulo}`),
    i < todos.length - 1 && h('span', { class: 'linea', style: 'width:24px' }), enlaceVecino(todos[i + 1]));
}

function loQueVasAHacer(c, rel, p) {
  const filas = [];
  let n = 0;
  for (const x of rel.contenido) {
    if (!x.item) continue;
    n++;
    if (x.item.tipo === 'ejercicio') filas.push(fila(n, `Ejercicio · ${x.item.titulo}`, x.item.objetivo, enlace('/ejercicio', x.item.id), x.item.notacion ? 'Con notación' : 'Sin notación'));
    else if (x.item.tipo === 'obra') {
      const sec = x.seccion ? x.item.secciones?.find(s => s.id === x.seccion) : null;
      filas.push(fila(n, h('span', null, p.clase === 'aplicacion' ? 'Aplicación · ' : 'Obra · ', h('span', { class: 'titulo-obra' }, x.item.titulo), sec ? `, ${sec.titulo.charAt(0).toLowerCase()}${sec.titulo.slice(1)}` : ''),
        p.clase === 'aplicacion' ? 'Solo ese pasaje, lento, hasta que suene como en el ejercicio.' : x.item.objetivos?.[0] ?? null, enlace('/obra', x.item.id), null));
    } else filas.push(fila(n, nombreDe(x.item), null, null, null));
  }
  for (const k of rel.comps) {
    if (rel.contenido.some(x => x.item?.trabaja?.includes(k.comp))) continue;
    n++;
    filas.push(fila(n, `Competencia · ${nombreDe(k.item)}`, k.item?.descripcion ?? null, enlace('/competencia', k.comp), null));
  }
  if (!filas.length) filas.push(h('p', { class: 'suave' }, 'Este paso no lleva ejercicios propios: se comprueba con lo trabajado en el tramo.'));
  return h('div', { class: 'tarjeta pila-s' },
    h('div', { class: 'rotulo' }, 'LO QUE VAS A HACER'),
    h('ol', { class: 'lista-limpia pila-s' }, filas),
    !rel.contenido.some(x => x.item?.tipo === 'ejercicio' || x.item?.tipo === 'leccion') && p.clase === 'habilidad'
      && h('p', { class: 'pequeno suave' }, 'Las lecciones y ejercicios propios de este paso llegan con el contenido (Fase 3); mientras, practica la competencia con su criterio.'));
}

const fila = (n, titulo, detalle, href, derecha) => h('li', { class: 'fila', style: 'gap:14px;align-items:flex-start;padding:8px 0;border-bottom:1px solid var(--borde-suave)' },
  h('span', { class: 'dato suave' }, String(n).padStart(2, '0')),
  h('div', { style: 'flex:1' }, href ? h('a', { href, style: 'font-weight:600' }, titulo) : h('strong', null, titulo), detalle && h('div', { class: 'pequeno suave' }, detalle)),
  derecha && h('span', { class: 'pequeno suave' }, derecha));

function cuandoEstaBien(c, rel) {
  return h('div', { class: 'tarjeta pila-s' },
    h('div', { class: 'fila-entre' }, h('span', { class: 'rotulo' }, 'CUÁNDO ESTÁ BIEN'), h('a', { href: enlace('/competencia', rel.comps[0].comp), class: 'pequeno suave' }, 'Ajustar el criterio')),
    rel.comps.map(k => {
      const crit = criterioDe(k.item, c.estado.ajustes?.[k.comp]);
      return h('div', { class: 'pila-s' },
        rel.comps.length > 1 && h('strong', null, nombreDe(k.item)),
        crit.tipo === 'conocimiento' ? null : h('div', { class: 'rejilla-3' }, crit.dimensiones.map(d => h('div', { class: 'tarjeta-s' }, h('strong', null, DIMENSIONES[d])))),
        h('p', { class: 'pequeno suave' }, textoCriterio(k.item, c.estado.ajustes?.[k.comp]) + '.'));
    }),
    h('p', { class: 'pequeno suave' }, 'Completado al primer acierto; dominado con tres aciertos en frío, sin ayuda y con días de por medio.'));
}

function deHechoADominado(rel) {
  const s = Math.min(...rel.comps.map(k => k.dom?.solidez ?? 0));
  const pasos = [['Hecho', 'el primer acierto', 1], ['En frío, +3 días', 'sin calentar, sin ayuda', 2], ['En frío, +7 días', 'el tercer acierto', 3], ['Dominado', 'repasos a 21, 45, 90 y 180 días', 3]];
  return h('div', { class: 'tarjeta pila-s' },
    h('div', { class: 'rotulo' }, 'DE HECHO A DOMINADO'),
    h('div', { class: 'rejilla-4', style: 'text-align:center' }, pasos.map(([t, d, n], i) => h('div', { class: 'pila-s', style: 'align-items:center' },
      glifoEstado(i === 3 ? (s >= 3 ? 'dominado' : 'por-llegar') : s >= n ? 'hecho' : 'disponible', { tam: 22 }),
      h('strong', { class: 'pequeno' }, t), h('span', { class: 'pequeno suave' }, d)))),
    h('p', { class: 'pequeno suave' }, 'Un fallo en frío lo devuelve a repaso, y la ruta pone un refuerzo antes de la obra que lo necesite.'));
}

function evaluacion(c, tramo) {
  const claves = [...new Set((tramo.pasos || []).map(id => c.cat.porId.get(id)).filter(x => x && x.clase !== 'evaluacion')
    .flatMap(x => (x.clase === 'obra' ? (x.contenido || []).filter(k => c.cat.porId.get(separar(k)[0])?.tipo === 'obra') : x.trabaja || [])))];
  return h('div', { class: 'tarjeta pila-s' },
    h('div', { class: 'rotulo' }, 'CÓMO SE CIERRA ESTE TRAMO'),
    h('p', { class: 'suave' }, 'Sin examen aparte: el tramo queda cerrado cuando todo lo que se trabajó en él sale bien en frío, días después (solidez 2 de 3 o más).'),
    h('ul', { class: 'lista-limpia pila-s' }, claves.map(k => {
      const [id, s] = separar(k);
      const item = c.cat.porId.get(id);
      const solidez = c.dom.get(k)?.solidez ?? 0;
      return h('li', { class: 'fila-entre' }, h('span', null, nombreDe(item), s ? ` (${item.secciones?.find(x => x.id === s)?.titulo ?? s})` : ''),
        chipEstado(`solidez ${Math.min(solidez, 3)} de 3`, solidez >= 2 ? 'neutro' : 'repaso'));
    })));
}

function paraQueSirve(c, rel) {
  // Lo que se abre después: competencias de cursos siguientes que piden lo que este paso trabaja.
  const trabaja = new Set(rel.paso.trabaja || []);
  const abre = c.cat.competencias.filter(x => (x.requiere || []).some(r => trabaja.has(r)));
  const lejanas = c.cat.obras.filter(o => o.programa === rel.paso.programa && abre.some(a => (o.pide || []).includes(a.id)));
  return h('div', { class: 'tarjeta pila-s' },
    h('div', { class: 'rotulo' }, 'PARA QUÉ SIRVE'),
    rel.prepara.length ? h('ul', { class: 'lista-limpia pila-s' }, rel.prepara.map(x => {
      const n = necesidades(c, x.obra, x.seccion);
      return h('li', { class: 'fila', style: 'gap:10px' }, iconoArea('repertorio', 16),
        h('div', null, h('a', { href: enlace('/obra', x.obra), class: 'titulo-obra' }, x.titulo), x.seccionTitulo ? `, ${x.seccionTitulo[0].toLowerCase()}${x.seccionTitulo.slice(1)}` : '',
          h('div', { class: 'pequeno suave' }, n ? `${n.resumen.laTienes} de ${n.pide.length} habilidades ya las tienes` : '')));
    })) : h('p', { class: 'suave' }, 'Prepara el resto del curso.'),
    abre.length > 0 && h('div', { class: 'pila-s' }, h('span', { class: 'pequeno suave' }, 'Y abre después:'),
      abre.map(a => h('a', { href: enlace('/competencia', a.id), class: 'fila', style: 'gap:8px' }, iconoArea(a.area, 14), a.nombre)),
      lejanas.map(o => h('a', { href: enlace('/obra', o.id), class: 'fila', style: 'gap:8px' }, iconoArea('estrella', 14), h('span', { class: 'titulo-obra' }, o.titulo)))));
}

function seApoyaEn(c, rel) {
  const cubiertas = new Set(rel.pasosAntes.flatMap(x => c.cat.porId.get(x.paso)?.trabaja || [])); // lo que ya dice un paso anterior no se repite
  return h('div', { class: 'tarjeta pila-s' },
    h('div', { class: 'rotulo' }, 'SE APOYA EN'),
    [...rel.pasosAntes.map(x => h('a', { href: x.href, class: 'fila', style: 'gap:10px' }, glifoEstado(['hecho', 'dominado', 'repaso'].includes(x.estado) ? x.estado : 'disponible', { tam: 12 }), x.titulo, h('span', { class: 'pequeno suave' }, ` · ${x.estado === 'pendiente' ? 'sin hacer' : x.estado}`))),
      ...rel.requisitos.filter(x => !cubiertas.has(x.comp)).map(x => h('a', { href: enlace('/competencia', x.comp), class: 'fila', style: 'gap:10px' },
        glifoEstado(x.estado === 'dominado' ? 'dominado' : ['completado', 'necesita-repaso'].includes(x.estado) ? 'hecho' : 'disponible', { tam: 12 }), x.nombre))]);
}

function comoVas(c, rel) {
  const eventos = c.eventos.filter(e => rel.comps.some(k => k.comp === e.item) && e.tipo === 'practica').slice(-3).reverse();
  return h('div', { class: 'tarjeta pila-s', style: 'flex:1' },
    h('div', { class: 'rotulo' }, 'CÓMO VAS'),
    rel.comps.map(k => h('div', { class: 'fila-entre' }, h('span', null, nombreDe(k.item)),
      chipEstado(SITUACION[k.situacion]?.[0] ?? k.estado, SITUACION[k.situacion]?.[1] ?? 'neutro'))),
    eventos.length > 0 && h('ul', { class: 'lista-limpia pila-s pequeno' }, eventos.map(e => h('li', { class: 'fila-entre' },
      h('span', { class: 'suave' }, fecha(e.t), e.modo === 'comprobacion' ? ' · en frío' : ''),
      h('span', null, Object.entries(e.calidad || {}).map(([d, v]) => `${CORTO[d] ?? DIMENSIONES[d] ?? d} ${v === 'bien' ? 'bien' : v === 'fallos' ? 'con fallos' : 'mal'}`).join(' · ') || (e.tanda ? `${e.tanda[0]}/${e.tanda[1]}` : ''))))),
    h('div', { class: 'fila' },
      h('button', { class: 'btn btn-borde', onclick: () => { abierto = { comp: rel.comps[0].comp, modo: 'trabajo' }; repintar(); } }, 'Registrar práctica'),
      h('button', { class: 'btn btn-borde', onclick: () => { abierto = { comp: rel.comps[0].comp, modo: 'comprobacion' }; repintar(); } }, 'Comprobación en frío')),
    abierto && rel.comps.some(k => k.comp === abierto.comp) && formularioRegistro(c.cat.porId.get(abierto.comp), { modo: abierto.modo, paso: rel.paso.id }, () => { abierto = null; repintar(); }));
}
