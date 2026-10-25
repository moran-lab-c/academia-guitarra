// «Hoy» (lámina P1-Hoy): la pantalla de inicio. Elige el tiempo, la app arma la sesión con el orden aprobado (profesor,
// comprobaciones críticas, la ruta, lo que la obra necesita, los puntos flojos y el resto) y cada bloque dice para qué es.
// A la derecha, dónde está en su ruta y cómo se ha hecho la sesión.
import { h } from '../nucleo/dom.js';
import { repintar, enlace, ir } from '../nucleo/rutas.js';
import { ctx, datos, registrar, cambiar } from '../nucleo/almacen.js';
import { planificar, DURACIONES, PROPOSITO } from '../../logica/planificador.js';
import { formatoPara } from '../../logica/recomendador.js';
import { separar } from '../../logica/catalogo.js';
import { formularioRegistro } from '../componentes/registro.js';
import { selectorFormato } from '../componentes/notacion.js';
import { tituloCinetico } from '../componentes/titulo.js';
import { miniRuta } from '../componentes/ruta.js';
import { chipEstado, colorArea, NOMBRE_AREA } from '../componentes/marcas.js';
import { enlaceItem, fecha, plural } from '../componentes/comunes.js';

// La sesión en curso vive aquí (no en la pantalla), para que no se pierda al volver a dibujar. El programa sale siempre
// de la preferencia (carril, Obras, Progreso y este selector la cambian): si cambia, la sesión se rehace.
const sesion = { plan: null, id: null, abierto: null, hechos: new Set(), terminada: false, detalle: null };
const ETIQUETA = { encargo: ['Encargo', 'encargo'], comprobacion: ['Repaso en frío', 'neutro'], refuerzo: ['Refuerzo', 'refuerzo'], paso: ['Ruta', 'neutro'], obra: ['Obra', 'neutro'], pasada: ['Repertorio', 'neutro'], libre: ['Opcional', 'neutro'] };
const dos = n => String(n).padStart(2, '0');

export default function hoy({ min } = {}) {
  const c = ctx(), d = datos();
  const prefs = d.estado.preferencias || {};
  const minutos = Number(min) || prefs.minutosHabituales || 60;
  const programa = prefs.programaPrincipal ?? prefs.rutaPrincipal ?? 'clasica';
  if (!sesion.plan || sesion.plan.minutos !== minutos || sesion.plan.programa !== programa) nuevaSesion(c, minutos, programa);
  const p = sesion.plan;
  const progPrincipal = programa === 'flamenca' ? 'flamenca' : 'clasica';
  const curso = c.cursoActual(progPrincipal);
  const ruta = c.rutaActual(progPrincipal);
  const tramo = ruta?.tramos.find(t => t.pasos.some(x => x.id === ruta.actual));
  const hoyTexto = new Date(`${c.hoy}T12:00:00`).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase();
  let reloj = 0;

  return h('div', { class: 'pantalla-hoy con-lateral' },
    h('section', { class: 'pila' },
      h('div', { class: 'cabecera' },
        tituloCinetico({ etiqueta: `${hoyTexto}${curso ? ` · CURSO ${dos(curso.numero)}` : ''}${tramo ? ` · TRAMO ${tramo.orden}` : ''}`, lineas: [`Hoy, ${minutos < 120 ? `${minutos} minutos` : '2 horas'}`], clave: `hoy-${c.hoy}` }),
        h('div', { class: 'pila-s', style: 'align-items:flex-end' },
          h('div', { class: 'segmentado', role: 'group', 'aria-label': 'Tiempo disponible' },
            DURACIONES.map(m => h('button', { type: 'button', 'aria-pressed': String(m === minutos), onclick: () => ir('/hoy', String(m)) }, m < 120 ? String(m) : '2 h'))),
          h('select', { 'aria-label': 'Programa', onchange: e => { const v = e.target.value; cambiar(x => { (x.preferencias ??= {}).programaPrincipal = v; }); } },
            [['clasica', 'Programa clásico'], ['flamenca', 'Programa flamenco'], ['ambas', 'Los dos, en bloques separados']].map(([v, t]) => h('option', { value: v, selected: programa === v }, t))))),
      p.avisos.map(a => h('div', { class: 'aviso' }, a)),
      h('ol', { class: 'lista-limpia pila-s', 'aria-label': 'Bloques de la sesión' }, p.bloques.map(b => {
        const desde = reloj; reloj += b.minutos;
        return bloque(c, b, desde);
      })),
      h('div', { class: 'fila', style: 'margin-top:8px' },
        sesion.terminada ? h('p', null, 'Sesión terminada y guardada en el diario.') : h('button', { class: 'btn btn-papel btn-grande', onclick: terminar }, 'Terminar la sesión'),
        reparto(p))),
    h('aside', { class: 'pila' },
      ruta && h('a', { class: 'tarjeta tarjeta-enlace pila-s', href: enlace('/curso', ruta.curso.id) },
        h('span', { class: 'rotulo' }, 'DÓNDE ESTÁS'),
        h('span', { class: 'display display-m' }, `Curso ${dos(ruta.curso.numero)} · ${ruta.curso.nombre}`),
        miniRuta(ruta),
        ruta.continuidad && h('span', { class: 'pequeno ocre' }, ruta.continuidad.motivo === 'cierres'
          ? 'Lo de la ruta está hecho: faltan las comprobaciones en frío de los cierres.'
          : 'Has terminado lo disponible; lo siguiente está en preparación. Mientras, consolidar.'),
        h('span', { class: 'suave' }, tramo ? `Tramo ${tramo.orden}, ${tramo.titulo.toLowerCase()}.` : '', ruta.final ? h('span', null, ' Al final del curso, ★ ', h('span', { class: 'titulo-obra' }, ruta.final.titulo.replace(', completa', '')), ` completa, ${ruta.final.detalle ?? ''}.`) : '')),
      comoSeHaHecho(p),
      encargos(c),
      ruta && siguientes(ruta)));
}

function nuevaSesion(c, minutos, programa) {
  Object.assign(sesion, { plan: planificar(c, { minutos, programa }), id: crypto.randomUUID(), abierto: null, hechos: new Set(), terminada: false, detalle: null });
}

const reloj = m => `${Math.floor(m / 60)}:${dos(m % 60)}`;

function bloque(c, b, desde) {
  const item = b.item ? c.cat.porId.get(separar(b.item)[0]) : null;
  const hecho = sesion.hechos.has(b.id);
  const abierto = sesion.detalle === b.id;
  const actual = b.tipo === 'paso' && b.actual;
  const [etq, tipo] = actual ? ['Ahora', 'ahora'] : b.modo === 'comprobacion' ? ['Comprobar', 'refuerzo'] : b.modo === 'recuperar' ? ['Recuperar', 'refuerzo']
    : b.modo === 'mantenimiento' || b.modo === 'activo' ? ['Repertorio', 'neutro'] : b.tipo === 'area' ? [NOMBRE_AREA[b.area] ?? 'Área', 'neutro'] : ETIQUETA[b.tipo] ?? [null, 'neutro'];
  const nombre = item?.tipo === 'obra' ? h('span', null, h('span', { class: 'titulo-obra' }, item.titulo), b.nombre.length > item.titulo.length ? b.nombre.slice(item.titulo.length) : '') : b.titulo;
  return h('li', { class: `tarjeta bloque-sesion${actual ? ' tarjeta-ahora' : ''}${b.tipo === 'refuerzo' ? ' tarjeta-borde' : ''}${abierto ? ' bloque-sesion--abierto' : ''}`, style: hecho ? 'opacity:.55' : '' },
    h('div', { class: 'fila', style: 'gap:14px;align-items:center' },
      h('span', { class: 'dato suave', style: 'width:84px' }, `${reloj(desde)}-${reloj(desde + b.minutos)}`),
      h('i', { class: 'punto', style: `--c:${colorArea(b.area)}` }),
      h('button', { class: 'btn-fantasma bloque__abrir', 'aria-expanded': String(abierto), title: abierto ? 'Cerrar el detalle' : 'Ver el detalle', onclick: () => { sesion.detalle = abierto ? null : b.id; repintar(); } },
        h('span', { class: 'bloque__texto' },
          h('div', { style: 'font-weight:600' }, b.tipo === 'obra' || b.tipo === 'pasada' || b.tipo === 'encargo' ? nombre : b.titulo),
          h('div', { class: 'pequeno suave', style: 'font-weight:400' }, b.paraQue)),
        h('span', { class: 'bloque__chevron', 'aria-hidden': 'true' })),
      etq && chipEstado(etq, tipo),
      h('span', { class: 'display', style: 'width:36px;text-align:right' }, b.minutos)),
    abierto && h('div', { class: 'pila-s', style: 'margin-top:10px' },
      h('ul', { class: 'motivos' }, b.motivos.map(m => h('li', null, m))),
      b.instrucciones && (Array.isArray(b.instrucciones) ? h('ol', null, b.instrucciones.map(i => h('li', null, i))) : h('p', null, b.instrucciones)),
      notacionDe(c, b),
      h('div', { class: 'fila pequeno suave' }, item && ['Ficha: ', enlaceItem(item)], b.paso && [' · ', h('a', { href: enlace('/paso', b.paso) }, 'Paso de la ruta')], b.ejercicio && [' · ', h('a', { href: enlace('/ejercicio', b.ejercicio) }, 'Ejercicio')]),
      b.criterio && !b.items && h('p', { class: 'pequeno suave' }, `Criterio: ${b.criterio}`),
      b.items && b.items.map(x => h('div', { class: 'tarjeta-s pila-s' },
        h('div', { class: 'fila-entre' }, h('span', null, enlaceItem(c.cat.porId.get(separar(x.id)[0])), ` · ${x.motivo}`),
          sesion.hechos.has(x.id) ? h('span', { class: 'suave' }, 'Registrado') : h('button', { class: 'btn btn-peq', onclick: abrir(x.id) }, 'Registrar')),
        sesion.abierto === x.id && formularioRegistro(c.cat.porId.get(separar(x.id)[0]), { ...extra(b), modo: 'comprobacion', minutos: x.minutos, seccion: separar(x.id)[1] }, guardado(x.id)))),
      !b.items && !['pausa', 'calentamiento', 'libre'].includes(b.tipo) && !hecho && h('button', { class: 'btn btn-borde', onclick: abrir(b.id) }, 'Registrar este bloque'),
      !b.items && sesion.abierto === b.id && formularioRegistro(item?.tipo === 'competencia' || item?.tipo === 'obra' ? item : null, { ...extra(b), modo: b.modo === 'comprobacion' ? 'comprobacion' : 'trabajo', seccion: b.seccion }, guardado(b.id)),
      ['pausa', 'calentamiento', 'libre'].includes(b.tipo) && !hecho && h('button', { class: 'btn btn-borde', onclick: () => { sesion.hechos.add(b.id); repintar(); } }, 'Hecho')));
}

const abrir = clave => () => { sesion.abierto = sesion.abierto === clave ? null : clave; repintar(); };
const guardado = clave => () => { sesion.hechos.add(clave); sesion.abierto = null; repintar(); };
const extra = b => ({ area: b.area, minutos: b.minutos, encargo: b.encargo, sesion: sesion.id, idLibre: b.encargo ? `encargo:${b.encargo}` : null, paso: b.paso ?? null });

// La recomendación se recalcula al dibujar, para que el selector refleje lo que acaba de elegir.
function notacionDe(c, b) {
  const item = b.ejercicio ? c.cat.porId.get(b.ejercicio) : b.item ? c.cat.porId.get(separar(b.item)[0]) : null;
  if (!item?.notacion) return null;
  const seccion = b.seccion ? (item.secciones || []).find(s => s.id === b.seccion) : null;
  const encargo = b.encargo ? c.estado.tareasProfesor.find(t => t.id === b.encargo) : null;
  const rec = formatoPara(item, c, { proposito: b.tipo === 'encargo' ? undefined : PROPOSITO[b.area], seccion, encargo });
  return selectorFormato(item, rec, seccion ? `${item.id}#${seccion.id}` : item.id, seccion, { compacto: true });
}

function reparto(p) {
  const por = new Map();
  for (const b of p.bloques) if (!['pausa', 'calentamiento', 'comprobacion', 'libre'].includes(b.tipo)) {
    const a = ['repertorio', 'fl-toque'].includes(b.area) ? 'repertorio' : b.area;
    por.set(a, (por.get(a) ?? 0) + b.minutos);
  }
  const lista = [...por].sort((a, b) => b[1] - a[1]);
  return h('div', { class: 'pila-s', style: 'flex:1' },
    h('div', { class: 'fila', style: 'gap:2px;height:8px;border-radius:4px;overflow:hidden', 'aria-label': 'Reparto de hoy por áreas' },
      lista.map(([a, m]) => h('span', { style: `flex:${m};height:8px;background:${colorArea(a)}` }))),
    h('span', { class: 'pequeno suave' }, lista.map(([a, m]) => `${NOMBRE_AREA[a] ?? a} ${m}`).join(' · '), ' min'));
}

// Las prioridades que han entrado hoy, en su orden. Distingue «no hay» de «hay, pero hoy no cabe».
function comoSeHaHecho(p) {
  const hay = t => p.bloques.some(b => b.tipo === t);
  const de = t => p.bloques.find(b => b.tipo === t);
  const nc = p.noCaben ?? {};
  const noCabe = (n, uno, varios) => (n === 1 ? `hay ${uno}, pero hoy no cabe.` : `hay ${n} ${varios}, pero hoy no caben.`);
  const yMas = (n, uno, varios) => (n ? ` ${n === 1 ? `1 ${uno} más no cabe hoy` : `${n} ${varios} más no caben hoy`}.` : '');
  const obra = de('obra');
  const lista = [
    ['Profesor', hay('encargo') ? `su encargo entra primero, con sus minutos.${yMas(nc.encargos, 'encargo', 'encargos')}` : nc.encargos ? noCabe(nc.encargos, 'un encargo', 'encargos') : 'hoy no hay encargos pendientes.'],
    ['Comprobaciones en frío', hay('comprobacion') ? `las de más prioridad, en frío y al principio (${plural(de('comprobacion').minutos, 'minuto')}).${yMas(nc.comprobaciones, 'comprobación vencida', 'comprobaciones vencidas')} Lo que no entra sigue en la cola.`
      : nc.comprobaciones ? noCabe(nc.comprobaciones, 'una comprobación vencida', 'comprobaciones vencidas') : 'nada que comprobar hoy.'],
    ['Tu sitio en la ruta', hay('paso') ? 'el paso en el que estás y, si cabe, el siguiente.' : nc.paso ? noCabe(1, 'un paso recomendado') : 'ahora no hay ningún paso recomendado.'],
    ['Lo que necesita la obra', hay('refuerzo') ? `un refuerzo justo antes de tocarla.${yMas(nc.refuerzos, 'refuerzo', 'refuerzos')}` : nc.refuerzos ? noCabe(nc.refuerzos, 'algo flojo que reforzar', 'cosas flojas que reforzar') : 'nada flojo que reforzar.'],
    ['Puntos flojos', p.bloques.some(b => b.motivos?.some(m => /por detrás/.test(m))) ? 'el área que va por detrás recibe más tiempo, sin frenar nada.' : nc.flojos ? noCabe(nc.flojos, 'un área por detrás', 'áreas por detrás') : 'ningún área va por detrás.'],
    ['Resto y repertorio', obra ? `${obra.modo === 'mantenimiento' ? 'repertorio que ya tocas, para que no se pierda' : obra.modo === 'activo' ? 'repertorio del curso que aún no está aprendido' : obra.modo === 'recuperar' ? 'recuperar lo que falló en una obra' : obra.paso ? 'la obra de tu tramo' : 'tu obra en estudio'}${hay('pasada') ? ' y una pasada para acabar' : ''}.` : 'lo que queda del curso.'],
    ['Tiempo', `${p.minutos} minutos en ${plural(p.bloques.length, 'bloque')}${hay('libre') ? `; ${plural(de('libre').minutos, 'minuto')} de tiempo disponible, opcional: no hay nada más que toque hoy` : ''}.`],
  ];
  return h('div', { class: 'tarjeta pila-s' },
    h('div', { class: 'rotulo' }, 'CÓMO SE HA HECHO ESTA SESIÓN'),
    h('ol', { class: 'lista-limpia pila-s pequeno' }, lista.map(([t, d], i) => h('li', { style: 'display:grid;grid-template-columns:14px 1fr;gap:8px' },
      h('span', { class: 'dato suave' }, i + 1), h('span', null, h('strong', null, `${t}: `), h('span', { class: 'suave' }, d))))));
}

function encargos(c) {
  const activos = (c.estado.tareasProfesor || []).filter(t => t.estado !== 'hecha' && t.estado !== 'cancelada' && (!t.hasta || t.hasta >= c.hoy));
  if (!activos.length) return null;
  return h('div', { class: 'tarjeta tarjeta-encargo pila-s' },
    h('div', { class: 'rotulo rotulo-ocre' }, 'ENCARGO DE CLASE'),
    activos.map(t => h('div', null, t.texto || enlaceItem(c.cat.porId.get(separar(t.item)[0])), t.hasta ? h('span', { class: 'pequeno suave' }, ` · hasta el ${fecha(t.hasta)}`) : '', t.detalle ? h('div', { class: 'pequeno suave' }, t.detalle) : '')));
}

function siguientes(ruta) {
  const lista = ruta.tramos.flatMap(t => t.pasos).filter(p => ['recomendado', 'proximo'].includes(p.estado) && !p.insertado).slice(0, 3);
  const despues = ruta.tramos.find(t => t.estado === 'por-llegar');
  return h('div', { class: 'tarjeta pila-s' },
    h('div', { class: 'rotulo' }, 'LO SIGUIENTE EN TU RUTA'),
    lista.map(p => h('a', { href: p.href, class: 'fila', style: 'gap:10px' }, h('i', { class: 'punto', style: `--c:${colorArea(p.area)}` }), `${p.numero} · ${p.titulo}`)),
    despues && h('span', { class: 'pequeno suave' }, `Después: tramo ${despues.orden} · ${despues.titulo}`));
}

function terminar() {
  const p = sesion.plan;
  registrar({ tipo: 'sesion', programa: p.programa, minutosPlan: p.minutos, sesion: sesion.id, bloques: p.bloques.map(b => ({ tipo: b.tipo, area: b.area, item: b.item ?? null, paso: b.paso ?? null, minutos: b.minutos, hecho: sesion.hechos.has(b.id) })) });
  sesion.terminada = true;
  repintar();
}
