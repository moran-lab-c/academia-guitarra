// Evaluación inicial: «Mi punto de partida» (por dónde empezar, áreas fuertes y flojas, posibles lagunas) y el perfil
// por áreas, con un módulo por área que se hace cuando él quiera y se repite cuando toque reevaluar. Lo que ya consta por
// su progreso no se pregunta. La lógica está en logica/evaluacion.js y las preguntas en logica/preguntas.js. Nada de lo
// que sale aquí bloquea la ruta: recomienda.
import { h, valores } from '../nucleo/dom.js';
import { ctx, registrar } from '../nucleo/almacen.js';
import { repintar, enlace } from '../nucleo/rutas.js';
import { modulos, siguiente, resultadoModulo, resultadoPreguntas, resultadoEjecucion, eventoModulo, eventoRepertorio, perfil, puntoDePartida, obrasConocidas, comoSePrueba, nivelInicial, HIPOTESIS, PREGUNTAS, ERRORES_CORTE, AREAS_DE_OBRAS } from '../../logica/evaluacion.js';
import { preguntas } from '../../logica/preguntas.js';
import { criterioDe, textoCriterio } from '../../logica/dominio.js';
import { DIMENSIONES } from '../../logica/esquema.js';
import { dondeSeTrabaja } from '../../logica/ruta.js';
import { nombreDe } from '../../logica/catalogo.js';
import { tempoDe } from '../../logica/metronomo.js';
import { programaElegido } from './curso.js';
import { elegirPrograma } from './repertorio.js';
import { fecha, plural, NOMBRE_PROGRAMA } from '../componentes/comunes.js';
import { chipEstado } from '../componentes/marcas.js';
import { notacionSuelta } from '../componentes/partitura.js';
import { barraMetronomo } from '../componentes/metronomo.js';
import { formularioRegistro } from '../componentes/registro.js';
import { tocar } from '../componentes/sonido.js';

// El módulo abierto; se conserva al repintar y al ir a otra pantalla y volver: { area, hipotesis, respuestas, tanda, hecho }.
let mod = null;
let obraAbierta = null;

const NOMBRE_CONFIANZA = { alta: 'Confianza alta', media: 'Confianza media', baja: 'Confianza baja' };
const NOMBRE_FUENTE = { evaluacion: 'De la evaluación', progreso: 'De tu progreso', 'sin-datos': 'Sin evaluar' };
const NOMBRE_COMO = { app: 'corrige la app', autoevaluada: 'autoevaluada con su criterio', repertorio: 'con las obras que ya tocas' };
const NOMBRE_RESULTADO = { ok: 'superada', casi: 'cerca', no: 'todavía no' };
const lista = items => items.map(x => x.nombre).join(', ');

export default function evaluaciones() {
  const c = ctx();
  const programa = programaElegido(c);
  return h('div', { class: 'pantalla-evaluacion pila' },
    h('header', { class: 'cabecera' },
      h('div', { class: 'pila-s' },
        h('div', { class: 'rotulo' }, `EVALUACIÓN INICIAL · PROGRAMA ${NOMBRE_PROGRAMA[programa].toUpperCase()}`),
        h('h1', { class: 'display display-g' }, 'Mi punto de partida'),
        h('p', { class: 'suave', style: 'max-width:48em' }, 'Cada área se evalúa por separado y cuando quieras; lo que ya consta por tu progreso no se vuelve a preguntar. El resultado es un perfil por áreas, no una nota, y nada queda bloqueado: solo te recomienda por dónde empezar.')),
      !mod && h('div', { class: 'segmentado', role: 'group', 'aria-label': 'Programa' },
        [['clasica', 'Clásico'], ['flamenca', 'Flamenco']].map(([v, t]) => h('button', { type: 'button', 'aria-pressed': String(v === programa), onclick: () => elegirPrograma(v) }, t)))),
    mod ? panelModulo(c) : [puntoPartida(c, programa), perfilAreas(c, programa), comoFunciona()]);
}

// ── «Mi punto de partida» ──────────────────────────────────────────────────────────────────────────────────────────
function puntoPartida(c, programa) {
  const pp = puntoDePartida(c, programa);
  const nombreArea = id => c.cat.porId.get(id)?.nombre ?? id;
  const chips = (ids, tipo) => ids.map(id => chipEstado(nombreArea(id), tipo));
  return h('section', { class: 'tarjeta pila-s' },
    h('div', { class: 'rotulo' }, 'POR DÓNDE EMPEZAR'),
    pp.empezar
      ? h('p', null, h('a', { href: pp.empezar.href }, pp.empezar.titulo), pp.empezar.tramo ? h('span', { class: 'suave' }, ` · ${pp.curso ? `curso ${pp.curso.numero}, ` : ''}tramo ${pp.empezar.tramo}: ${pp.empezar.tramoTitulo}`) : '')
      : h('p', { class: 'suave' }, 'La ruta no tiene ahora un paso nuevo que recomendar: sigue con lo que proponga «Hoy».'),
    (pp.fuertes.length > 0 || pp.flojas.length > 0) && h('div', { class: 'fila', style: 'gap:8px;flex-wrap:wrap' },
      pp.fuertes.length > 0 && h('span', { class: 'pequeno suave' }, 'Fuertes:'), ...chips(pp.fuertes, 'neutro'),
      pp.flojas.length > 0 && h('span', { class: 'pequeno suave' }, 'Van por detrás:'), ...chips(pp.flojas, 'repaso')),
    pp.lagunas.length > 0 && h('p', null, h('strong', null, 'Posibles lagunas: '), pp.lagunas.map((x, i) => [i ? ', ' : '', h('a', { href: enlace('/competencia', x.item) }, x.nombre)]), '.'),
    pp.porConfirmar.length > 0 && h('p', { class: 'suave' }, `Se dan por sabidas y se confirmarán en frío, sin volver a estudiarlas: ${lista(pp.porConfirmar)}.`),
    pp.reevaluar.length > 0 && h('p', { class: 'ocre' }, `Toca reevaluar: ${pp.reevaluar.map(nombreArea).join(', ')}.`),
    pp.sinEvaluar.length > 0 && h('p', { class: 'pequeno suave' }, `Sin evaluar todavía: ${pp.sinEvaluar.map(nombreArea).join(', ')}. No hace falta hacerlo todo: lo que no evalúes empieza desde el principio de su área.`),
    h('p', { class: 'pequeno suave' }, pp.aviso));
}

// ── Perfil por áreas ───────────────────────────────────────────────────────────────────────────────────────────────
function perfilAreas(c, programa) {
  const mods = new Map(modulos(c, programa).map(m => [m.area, m]));
  return h('section', { class: 'pila-s' },
    h('div', { class: 'rotulo' }, 'PERFIL POR ÁREAS'),
    h('div', { class: 'rejilla-3' }, perfil(c, programa).map(f => {
      const m = mods.get(f.area);
      const pruebas = f.evidencias.filter(x => ['app', 'autoevaluada'].includes(x.tipo)).length;
      const deObras = f.evidencias.filter(x => x.tipo === 'repertorio').length;
      const progreso = f.evidencias.filter(x => x.tipo === 'progreso').length;
      const sinNada = m.sinContenido || (m.deObras && !m.total);
      return h('div', { class: 'tarjeta pila-s', style: `--c:var(--a-${f.area.startsWith('fl-') ? 'flamenco' : f.area}, var(--texto-3))` },
        h('div', { class: 'fila-entre' }, h('span', { class: 'fila', style: 'gap:8px' }, h('i', { class: 'punto' }), h('strong', null, f.nombre)),
          f.confianza && chipEstado(NOMBRE_CONFIANZA[f.confianza], f.confianza === 'baja' ? 'repaso' : 'neutro')),
        f.sinContenido ? h('span', { class: 'suave' }, 'Sin contenido todavía')
          : h('div', null, h('strong', null, `Nivel ${f.nivel}`), h('span', { class: 'suave' }, f.estimado ? ' · estimado, por confirmar' : ''), h('span', { class: 'pequeno suave' }, ` · ${NOMBRE_FUENTE[f.fuente]}${f.fecha ? `, ${fecha(f.fecha)}` : ''}`)),
        (pruebas || deObras || progreso) > 0 && h('span', { class: 'pequeno suave' }, [pruebas && plural(pruebas, 'prueba'), progreso && `${progreso} por tu progreso`, deObras && `${deObras} de tus obras`].filter(Boolean).join(' · ')),
        f.reevaluar && h('span', { class: `pequeno ${f.reevaluar.vencida ? 'ocre' : 'suave'}` }, f.reevaluar.vencida ? `Toca reevaluar. ${f.reevaluar.motivo}` : `Reevaluar hacia el ${fecha(f.reevaluar.fecha)}`),
        f.lagunas.length > 0 && h('span', { class: 'pequeno ocre' }, `Posible laguna: ${f.lagunas.map(id => nombreDe(c.cat.porId.get(id))).join(', ')}`),
        !f.sinContenido && h('span', { class: 'pequeno suave' }, m.deObras ? `Se evalúa ${NOMBRE_COMO.repertorio}${m.total ? ` (${plural(m.total, 'obra')})` : ''}.` : `Se evalúa: ${m.como.map(x => NOMBRE_COMO[x]).join(' y ')}${m.yaConsta ? `; ${m.yaConsta} ya ${m.yaConsta === 1 ? 'consta' : 'constan'} por tu progreso y no se ${m.yaConsta === 1 ? 'pregunta' : 'preguntan'}` : ''}.`),
        m.deObras && !m.total && h('span', { class: 'pequeno suave' }, 'Marca en su ficha las obras que ya sabes tocar y vuelve aquí.'),
        !sinNada && h('div', null, h('button', { type: 'button', class: f.fuente === 'sin-datos' ? 'btn-papel' : 'btn-borde', onclick: () => abrir(f.area) }, f.fuente === 'sin-datos' || !m.ultima ? 'Evaluar' : 'Repetir')));
    })));
}

function comoFunciona() {
  return h('details', { class: 'tarjeta' },
    h('summary', null, 'Cómo funciona'),
    h('ul', { class: 'pila-s' },
      h('li', null, 'Lectura, diapasón, teoría, armonía y oído: preguntas que corrige la app. Técnica, escalas, ritmo e interpretación: lo tocas en frío y valoras cada aspecto con su criterio, como en cualquier comprobación.'),
      h('li', null, 'Empieza por donde tú digas (o por lo que ya consta), sube si lo superas y baja si no. Lo superado cuenta como un primer acierto en frío: se confirma después con las comprobaciones de siempre.'),
      h('li', null, 'Las obras que ya sabes tocar dejan evidencia solo en lo que esa obra pide y en los aspectos que una pasada deja ver; no lo convalidan: queda por confirmar.'),
      h('li', null, 'Cada área dice con qué confianza se estima y cuándo conviene repetirla; antes, si una comprobación en frío la desmiente.')));
}

// ── Un módulo ──────────────────────────────────────────────────────────────────────────────────────────────────────
function abrir(area) {
  mod = { area, hipotesis: area in AREAS_DE_OBRAS ? null : undefined, respuestas: [], tanda: null, hecho: null };
  obraAbierta = null;
  repintar();
}
function cerrar() {
  if (mod?.respuestas.length && !mod.hecho && !confirm('Lo respondido en este módulo no se guardará. ¿Salir igualmente?')) return;
  mod = null;
  repintar();
}
// Guarda lo respondido (si hay algo) y enseña el resumen. El resumen se calcula antes de guardar, con lo que había.
function terminar() {
  const c = ctx();
  mod.hecho = resultadoModulo(c, mod.area, mod.respuestas, { hipotesis: mod.hipotesis });
  if (mod.respuestas.length) registrar(eventoModulo(c, mod.area, mod.respuestas, { hipotesis: mod.hipotesis }));
  mod.tanda = null;
  repintar();
}
function responder(r) {
  mod.respuestas.push(r);
  mod.tanda = null;
  if (siguiente(ctx(), mod.area, mod.respuestas, { hipotesis: mod.hipotesis }).fin) terminar(); else repintar();
}

function panelModulo(c) {
  const area = c.cat.porId.get(mod.area);
  const cabecera = h('div', { class: 'fila-entre' },
    h('button', { type: 'button', class: 'btn-fantasma', onclick: cerrar }, '← Volver al perfil'),
    h('span', { class: 'rotulo' }, `MÓDULO · ${(area?.nombre ?? mod.area).toUpperCase()}`));
  if (mod.area in AREAS_DE_OBRAS) return h('section', { class: 'pila' }, cabecera, moduloObras(c));
  if (mod.hecho) return h('section', { class: 'pila' }, cabecera, resumen(c));
  if (mod.hipotesis === undefined) return h('section', { class: 'pila' }, cabecera, preguntaHipotesis(c, area));
  const s = siguiente(c, mod.area, mod.respuestas, { hipotesis: mod.hipotesis });
  if (s.fin) { queueMicrotask(terminar); return h('p', { class: 'suave' }, 'Guardando…'); }
  return h('section', { class: 'pila' }, cabecera,
    h('div', { class: 'fila-entre' },
      h('p', { class: 'suave' }, `Nivel ${s.nivel} · ${s.comp.nombre}${mod.respuestas.length ? ` · llevas ${plural(mod.respuestas.length, 'competencia')}` : ''}`),
      h('button', { type: 'button', class: 'btn-borde', onclick: terminar }, mod.respuestas.length ? 'Terminar aquí y guardar' : 'Terminar aquí')),
    comoSePrueba(s.comp) === 'app' ? pruebaApp(c, s.comp) : criterioDe(s.comp).tipo === 'conocimiento' ? pruebaDeclarada(s.comp) : pruebaEjecucion(c, s.comp));
}

function preguntaHipotesis(c, area) {
  return h('div', { class: 'tarjeta pila-s', style: 'max-width:44em' },
    h('h2', null, `¿Cómo ves ${area?.nombre?.toLowerCase() ?? 'esta área'}?`),
    h('p', { class: 'suave' }, `Solo decide por dónde empieza: si lo superas sube y, si no, baja. ${area?.descripcion ?? ''}`),
    h('div', { class: 'fila', style: 'gap:8px;flex-wrap:wrap' }, HIPOTESIS.map(([n, t]) => h('button', { type: 'button', class: 'btn-borde',
      onclick: () => { mod.hipotesis = n; repintar(); } }, t))),
    h('p', { class: 'pequeno suave' }, `Empezaría por el nivel ${nivelInicial(c, mod.area, null)} si no dices nada.`),
    h('button', { type: 'button', class: 'btn-fantasma', onclick: () => { mod.hipotesis = null; repintar(); } }, 'Prefiero no decirlo'));
}

// Preguntas que corrige la app: una tras otra, con la corrección al momento; con tres fallos se pasa a lo siguiente.
function pruebaApp(c, comp) {
  if (mod.tanda?.comp !== comp.id) mod.tanda = { comp: comp.id, qs: preguntas(comp.id, PREGUNTAS, `${comp.id}|${Date.now()}`), i: 0, aciertos: 0, errores: 0, elegida: null, nodos: [] };
  const t = mod.tanda;
  const q = t.qs[t.i];
  const contestada = t.elegida != null;
  const acabar = () => {
    const hechas = t.i + 1;
    responder({ item: comp.id, tipo: 'app', aciertos: t.aciertos, preguntas: hechas, resultado: resultadoPreguntas(comp, t.aciertos, hechas, c.estado.ajustes?.[comp.id]) });
  };
  const avanzar = () => {
    if (t.errores >= ERRORES_CORTE || t.i + 1 >= t.qs.length) return acabar();
    t.i++; t.elegida = null;
    if (t.qs[t.i].audio) tocar(t.qs[t.i].audio.secuencia, t.qs[t.i].audio);
    repintar();
  };
  if (q.notacion) t.nodos[t.i] ??= notacionSuelta(q.notacion, 'partitura', 'Nota en el pentagrama');
  return h('div', { class: 'tarjeta pila-s', style: 'max-width:44em' },
    h('div', { class: 'fila-entre' }, h('strong', null, comp.nombre), h('span', { class: 'dato' }, `${t.i + 1} / ${t.qs.length}`)),
    h('p', { class: 'pequeno suave' }, `Para superarla: ${Math.round(criterioDe(comp, c.estado.ajustes?.[comp.id]).aciertos * 100)} % de aciertos. Con ${ERRORES_CORTE} fallos se pasa a lo siguiente.`),
    q.notacion && h('div', { class: 'atril', style: 'align-self:flex-start' }, t.nodos[t.i]),
    h('p', { class: 'display display-m' }, q.enunciado),
    q.audio && h('div', null, h('button', { type: 'button', class: 'btn-borde', onclick: () => tocar(q.audio.secuencia, q.audio) }, t.i === 0 && !contestada ? '▶ Escuchar' : '▶ Escuchar otra vez')),
    h('div', { class: 'rejilla-2', role: 'group', 'aria-label': 'Respuestas' }, q.opciones.map((o, k) => h('button', {
      type: 'button', class: 'btn-borde', 'aria-disabled': String(contestada),
      style: contestada && k === q.correcta ? 'box-shadow:inset 0 0 0 2px var(--verde)' : contestada && k === t.elegida ? 'box-shadow:inset 0 0 0 2px var(--ocre)' : null,
      onclick: () => { if (contestada) return; t.elegida = k; if (k === q.correcta) t.aciertos++; else t.errores++; repintar(); },
    }, o))),
    contestada && h('div', { class: 'fila-entre' },
      h('span', { class: t.elegida === q.correcta ? '' : 'ocre' }, t.elegida === q.correcta ? 'Correcto.' : `No: es «${q.opciones[q.correcta]}».`),
      h('button', { type: 'button', class: 'principal', onclick: avanzar }, t.errores >= ERRORES_CORTE || t.i + 1 >= t.qs.length ? 'Siguiente competencia' : 'Siguiente')));
}

// Conocimiento que la app todavía no sabe preguntar: lo dice él (cuenta como autoevaluada).
function pruebaDeclarada(comp) {
  const r = resultado => responder({ item: comp.id, tipo: 'autoevaluada', resultado });
  return h('div', { class: 'tarjeta pila-s', style: 'max-width:44em' },
    h('strong', null, comp.nombre), h('p', { class: 'suave' }, comp.descripcion),
    h('p', null, '¿Lo sabes explicar sin mirar nada?'),
    h('div', { class: 'fila', style: 'gap:8px' }, h('button', { type: 'button', class: 'btn-borde', onclick: () => r('ok') }, 'Sí'), h('button', { type: 'button', class: 'btn-borde', onclick: () => r('casi') }, 'A medias'), h('button', { type: 'button', class: 'btn-borde', onclick: () => r('no') }, 'No')));
}

// Ejecución: lo toca en frío con el criterio de la competencia y valora cada aspecto (como en cualquier comprobación).
function pruebaEjecucion(c, comp) {
  const ajuste = c.estado.ajustes?.[comp.id];
  const crit = criterioDe(comp, ajuste);
  const donde = dondeSeTrabaja(c, comp.id).filter(d => d.tipo === 'ejercicio');
  const aviso = h('p', { class: 'aviso', hidden: true });
  const form = h('form', { class: 'pila-s', onsubmit: e => {
    e.preventDefault();
    const v = valores(form);
    const calidad = {};
    for (const d of crit.dimensiones) if (v[`cal_${d}`]) calidad[d] = v[`cal_${d}`];
    if (Object.keys(calidad).length < crit.dimensiones.length) { aviso.hidden = false; aviso.textContent = 'Valora cada aspecto (o pulsa «Todavía no lo sé hacer»).'; return; }
    const intento = { calidad, pasadas: v.pasadas ?? 0, tempo: v.tempo || undefined };
    responder({ item: comp.id, tipo: 'autoevaluada', ...intento, resultado: resultadoEjecucion(comp, intento, ajuste) });
  } },
    h('div', { class: 'aspectos' }, crit.dimensiones.map(d => h('div', { class: 'fila' }, h('span', null, DIMENSIONES[d]),
      ...[['bien', 'Bien'], ['fallos', 'Con fallos'], ['mal', 'Mal']].map(([v, t]) => h('label', { class: 'check' }, h('input', { type: 'radio', name: `cal_${d}`, value: v }), t))))),
    h('div', { class: 'fila' },
      h('label', null, 'Pasadas seguidas bien', h('input', { type: 'number', name: 'pasadas', min: 0, value: crit.pasadasEnFrio, style: 'width:6em' })),
      h('label', null, `Tempo (${crit.tempo?.unidad ?? '♩'}=, opcional)`, h('input', { type: 'number', name: 'tempo', min: 0, max: 400, style: 'width:6em', 'data-tempo-de': comp.id, 'data-auto': '1' }))),
    aviso,
    h('div', { class: 'fila', style: 'gap:8px' },
      h('button', { class: 'principal', type: 'submit' }, 'Guardar resultado'),
      h('button', { type: 'button', class: 'btn-borde', onclick: () => responder({ item: comp.id, tipo: 'autoevaluada', resultado: 'no' }) }, 'Todavía no lo sé hacer')));
  return h('div', { class: 'con-lateral' },
    h('div', { class: 'tarjeta pila-s' },
      h('strong', null, comp.nombre),
      comp.descripcion && h('p', { class: 'suave' }, comp.descripcion),
      h('p', null, `Criterio: ${textoCriterio(comp, ajuste)}`),
      h('p', { class: 'pequeno suave' }, 'Tócalo ahora en frío: sin calentar ese pasaje, sin mirar y sin ayuda. Si no lo has trabajado nunca, no hace falta intentarlo.'),
      donde.length > 0 && h('p', { class: 'pequeno suave' }, 'Material: ', donde.map((d, i) => [i ? ', ' : '', h('a', { href: d.href }, d.titulo)]), ' (vuelves aquí sin perder lo respondido).'),
      form),
    h('aside', { class: 'pila' }, barraMetronomo({ clave: comp.id, tempo: tempoDe(c, comp.id), compas: null })));
}

function resumen(c) {
  const r = mod.hecho;
  const nombres = ids => ids.map(id => nombreDe(c.cat.porId.get(id))).join(', ');
  return h('div', { class: 'tarjeta pila-s', style: 'max-width:48em' },
    h('h2', null, r.probadas ? `Nivel ${r.nivel} · ${NOMBRE_CONFIANZA[r.confianza].toLowerCase()}` : 'No se ha guardado nada'),
    r.probadas > 0 && h('ul', { class: 'lista-limpia pila-s' }, mod.respuestas.map(x => h('li', { class: 'fila-entre' },
      h('span', null, nombreDe(c.cat.porId.get(x.item))),
      h('span', { class: 'pequeno suave' }, `${NOMBRE_RESULTADO[x.resultado]}${x.preguntas ? ` · ${x.aciertos} de ${x.preguntas}` : ''}`)))),
    r.frontera.length > 0 && h('p', null, `Por aquí sigue esta área: ${nombres(r.frontera)}.`),
    r.porConfirmar.length > 0 && h('p', { class: 'suave' }, `Se dan por sabidas y se confirmarán en frío: ${nombres(r.porConfirmar)}.`),
    !r.probadas && h('p', { class: 'suave' }, 'Puedes volver cuando quieras: lo que no evalúes empieza desde el principio de su área.'),
    r.probadas > 0 && h('p', { class: 'pequeno suave' }, 'Lo superado cuenta como primer acierto en frío. Nada queda bloqueado.'),
    h('button', { type: 'button', class: 'principal', onclick: () => { mod = null; repintar(); } }, 'Volver al perfil'));
}

// Repertorio: una pasada de comprobación de cada obra que ya sabía tocar, con su rúbrica (el registro de siempre).
function moduloObras(c) {
  const conocidas = obrasConocidas(c, AREAS_DE_OBRAS[mod.area]);
  if (!conocidas.length) return h('div', { class: 'tarjeta pila-s', style: 'max-width:44em' },
    h('p', null, 'No has marcado ninguna obra como «ya la sé tocar».'),
    h('p', { class: 'suave' }, 'Márcalo en la ficha de la obra (Obras) y vuelve aquí: una pasada con su rúbrica deja evidencia en lo que esa obra pide, sin convalidarlo.'),
    h('a', { href: '#/repertorio' }, 'Ir a Obras'));
  return h('div', { class: 'pila' },
    h('p', { class: 'suave', style: 'max-width:48em' }, 'Tócala una vez, en frío, y valora cada aspecto. No se aprende de cero: si algo sale mal, se refuerza eso y se vuelve a la obra. Lo que deja ver la pasada cuenta como evidencia de las competencias que la obra pide (por confirmar, no convalidadas).'),
    conocidas.map(x => h('div', { class: 'tarjeta pila-s' },
      h('div', { class: 'fila-entre' }, h('a', { href: enlace('/obra', x.obra.id), class: 'titulo-obra' }, x.obra.titulo),
        chipEstado(x.comprobada ? 'comprobada' : 'por comprobar', x.comprobada ? 'neutro' : 'refuerzo')),
      x.claves.map(k => {
        const seccion = k.includes('#') ? k.split('#')[1] : null;
        const abierta = obraAbierta === k;
        return h('div', { class: 'pila-s' },
          !abierta && h('button', { type: 'button', class: 'btn-borde', onclick: () => { obraAbierta = k; repintar(); } }, `Pasada de comprobación${seccion ? ` (${x.obra.secciones?.find(s => s.id === seccion)?.titulo ?? seccion})` : ''}`),
          abierta && formularioRegistro(x.obra, { modo: 'comprobacion', seccion, area: mod.area }, ev => {
            const clave = ev.seccion ? `${ev.item}#${ev.seccion}` : ev.item;
            registrar(eventoRepertorio(ctx(), mod.area, [{ clave, calidad: ev.calidad }]));
            obraAbierta = null;
          }));
      }))));
}
