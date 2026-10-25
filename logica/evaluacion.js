// La evaluación inicial (Fase 3D): por módulos, uno por área, que se pueden hacer por separado y repetir cuando toque
// reevaluar. No obliga a demostrar desde cero lo que ya consta: se salta lo que su progreso ya prueba y empieza en su
// hipótesis (lo que diga él, la estimación vigente o lo ya hecho); sube si supera un nivel y baja si falla el de partida.
//
// Cómo se prueba cada competencia:
//   app           preguntas que corrige la app (lectura, diapasón, teoría, armonía, oído; logica/preguntas.js);
//   autoevaluada  la ejecución con su criterio, en frío y sin ayuda, valorando cada aspecto (como cualquier comprobación);
//                 si es de conocimiento y la app todavía no sabe preguntarlo, él dice si lo sabe explicar sin mirar;
//   repertorio    una pasada de una obra que ya sabía tocar, con su rúbrica. Deja evidencia en las competencias concretas
//                 que esa obra pide, solo en los aspectos que la pasada deja ver; no las convalida: quedan por confirmar.
//
// Se guarda como el evento «diagnostico» de siempre: niveles (la estimación de cada área) y pruebas (las superadas
// cuentan como primer acierto en frío, como hasta ahora), y además modulo, confianza, hipotesis y evidencias.
// El perfil (nivel, confianza, evidencia, fecha y cuándo reevaluar) y el punto de partida se calculan; nada bloquea.
import { criterioDe, valorarIntento, estaHecho } from './dominio.js';
import { pideDe, separar, nombreDe, seccionDe } from './catalogo.js';
import { tieneGenerador } from './preguntas.js';
import { dia, sumarDias, diasEntre } from './fechas.js';
import { TIPOS_PRUEBA, CONFIANZAS, EVIDENCIAS } from './esquema.js';

export { TIPOS_PRUEBA, CONFIANZAS, EVIDENCIAS };

export const PREGUNTAS = 10;     // por competencia en la evaluación; las comprobaciones de después usan su criterio entero
export const ERRORES_CORTE = 3;  // con tres fallos ya no llega al criterio: se pasa a lo siguiente
// Cuándo volver a evaluar un área estimada, según la confianza (antes, si una comprobación en frío la desmiente).
export const REEVALUAR_DIAS = { alta: 90, media: 45, baja: 21 };
export const AREAS_DE_OBRAS = { repertorio: 'clasica', 'fl-toque': 'flamenca' }; // se evalúan con sus obras conocidas
// Lo que él cree antes de empezar un módulo (la hipótesis): solo decide por dónde se empieza.
export const HIPOTESIS = [[0, 'No lo he trabajado'], [1, 'Lo básico'], [2, 'Bastante'], [3, 'Mucho']];

const competenciasDe = (ctx, area) => ctx.cat.competencias.filter(c => c.area === area && c.nucleo !== false).sort((a, b) => a.nivel - b.nivel || a.id.localeCompare(b.id));
const nivelesCon = (ctx, area) => [...new Set(competenciasDe(ctx, area).map(c => c.nivel))].sort((a, b) => a - b);
const hecha = (ctx, id) => estaHecho(ctx.estadoDe(id));
// Lo que su progreso ya prueba (hecho o dominado; o hecho y para repasar): no se vuelve a preguntar.
export const observada = (ctx, id) => !['pendiente', 'en-progreso'].includes(ctx.estadoDe(id));

export function comoSePrueba(comp) {
  const c = criterioDe(comp);
  return c.tipo === 'conocimiento' && tieneGenerador(comp.id) ? 'app' : 'autoevaluada';
}

// Las obras que ya sabía tocar de un programa (o de los dos), con las partes que se comprueban.
export function obrasConocidas(ctx, programa = null) {
  return Object.entries(ctx.estado.obras || {}).filter(([, o]) => o.conocida).map(([id, o]) => ({ obra: ctx.cat.porId.get(id), conocida: o.conocida }))
    .filter(x => x.obra && (!programa || x.obra.programa === programa))
    .map(x => {
      const partes = x.conocida.nivel === 'parcial' && x.conocida.secciones?.length ? x.conocida.secciones : [null];
      const claves = partes.map(s => (s ? `${x.obra.id}#${s}` : x.obra.id));
      const comprobadaK = k => ctx.eventos.some(ev => ev.tipo === 'practica' && ev.item === x.obra.id && (ev.seccion ?? null) === separar(k)[1] && !ev.fragmento
        && (ev.modo === 'comprobacion' || ev.enFrio === true));
      return { ...x, claves, comprobada: claves.every(comprobadaK) };
    });
}

// Los módulos de un programa: uno por área, con cuánto contenido tiene, cuánto se salta y cómo se prueba.
export function modulos(ctx, programa) {
  return ctx.cat.areas.filter(a => a.programa === programa || a.programa === 'comun').map(a => {
    const deObras = a.id in AREAS_DE_OBRAS;
    const comps = competenciasDe(ctx, a.id);
    const ultimo = ultimoDiagnostico(ctx, a.id);
    const conocidas = deObras ? obrasConocidas(ctx, AREAS_DE_OBRAS[a.id]) : [];
    return {
      area: a.id, nombre: a.nombre, descripcion: a.descripcion, deObras,
      total: deObras ? conocidas.length : comps.length,
      yaConsta: deObras ? conocidas.filter(x => x.comprobada).length : comps.filter(c => observada(ctx, c.id)).length,
      como: deObras ? ['repertorio'] : [...new Set(comps.map(comoSePrueba))],
      sinContenido: deObras ? false : !comps.length,
      ultima: ultimo ? dia(ultimo.t) : null,
    };
  });
}

// Por qué nivel empezar un área: lo que él cree (si es más que lo que ya prueba su progreso), si no la estimación
// vigente, si no el siguiente a lo que ya tiene. Siempre un nivel con contenido. null si el área no tiene competencias.
export function nivelInicial(ctx, area, hipotesis = null) {
  const niveles = nivelesCon(ctx, area);
  if (!niveles.length) return null;
  const n = ctx.niveles[area];
  const porProgreso = (n && !n.estimado ? n.nivel : 0) + 1;
  const deseado = hipotesis != null ? Math.max(hipotesis, porProgreso) : n?.estimado ? n.nivel : porProgreso;
  return niveles.filter(l => l <= Math.max(1, deseado)).at(-1) ?? niveles[0];
}

// Lo siguiente que probar en un módulo según lo respondido en esta evaluación: { comp, nivel } o { fin: true }.
// Sube de nivel mientras lo supere todo; si falla el nivel de partida, baja hasta uno que supere (o hasta el primero).
export function siguiente(ctx, area, respuestas = [], { hipotesis = null } = {}) {
  const niveles = nivelesCon(ctx, area);
  const inicio = nivelInicial(ctx, area, hipotesis);
  if (inicio == null) return { fin: true };
  const res = new Map(respuestas.map(r => [r.item, r.resultado]));
  const deNivel = l => competenciasDe(ctx, area).filter(c => c.nivel === l);
  const porProbar = l => deNivel(l).filter(c => !res.has(c.id) && !observada(ctx, c.id));
  const supera = l => deNivel(l).every(c => (res.has(c.id) ? res.get(c.id) === 'ok' : hecha(ctx, c.id)));
  for (let l = inicio; ;) {
    const p = porProbar(l);
    if (p.length) return { comp: p[0], nivel: l };
    if (!supera(l)) { if (l !== inicio) return { fin: true }; break; }
    const s = niveles.find(x => x > l);
    if (s == null) return { fin: true };
    l = s;
  }
  for (let b = niveles.filter(x => x < inicio).at(-1); b != null; b = niveles.filter(x => x < b).at(-1)) {
    const p = porProbar(b);
    if (p.length) return { comp: p[0], nivel: b };
    if (supera(b)) return { fin: true };
  }
  return { fin: true };
}

// El resultado de una prueba que corrige la app: con la proporción de aciertos de su criterio (y un mínimo de preguntas).
export function resultadoPreguntas(comp, aciertos, preguntas, ajuste) {
  const c = criterioDe(comp, ajuste);
  const p = preguntas ? aciertos / preguntas : 0;
  if (preguntas >= Math.min(PREGUNTAS, c.preguntas) && p >= c.aciertos) return 'ok';
  return p >= 0.75 ? 'casi' : 'no';
}
// El de una ejecución autoevaluada: el mismo que una comprobación en frío sin ayuda.
export function resultadoEjecucion(comp, { calidad, pasadas, tempo }, ajuste) {
  return valorarIntento({ calidad, pasadas, tempo, enFrio: true, ayuda: 'ninguna' }, criterioDe(comp, ajuste));
}

// El nivel que sale del módulo y con qué confianza. El nivel es el más alto que supera todo lo probado (lo suyo y lo que
// ya probaba su progreso); un nivel sin probar por debajo de uno superado se da por sabido (y queda por confirmar).
// La confianza: alta si la app lo ha corregido o lo prueba su progreso y cubre el 80 % de lo que implica ese nivel;
// media si hay ejecución autoevaluada o cubre la mitad; baja con menos.
export function resultadoModulo(ctx, area, respuestas = [], { hipotesis = null } = {}) {
  const comps = competenciasDe(ctx, area);
  const niveles = nivelesCon(ctx, area);
  const res = new Map(respuestas.map(r => [r.item, r]));
  const probada = c => res.has(c.id) || observada(ctx, c.id);
  const bien = c => (res.has(c.id) ? res.get(c.id).resultado === 'ok' : hecha(ctx, c.id));
  let nivel = 0;
  for (const l of niveles) {
    const deL = comps.filter(c => c.nivel === l && probada(c));
    if (!deL.length) continue;
    if (deL.every(bien)) nivel = l; else break;
  }
  const hasta = Math.max(nivel, niveles[0] ?? 0);
  const implicadas = comps.filter(c => c.nivel <= hasta);
  const tipoDe = c => res.get(c.id)?.tipo ?? (observada(ctx, c.id) ? 'progreso' : null);
  const cubiertas = implicadas.filter(tipoDe);
  const cobertura = implicadas.length ? cubiertas.length / implicadas.length : 0;
  const fuerte = cubiertas.length > 0 && cubiertas.every(c => ['app', 'progreso'].includes(tipoDe(c)));
  const confianza = !cubiertas.length ? 'baja' : cobertura >= 0.8 && fuerte ? 'alta' : cobertura >= 0.5 ? 'media' : 'baja';
  const frontera = comps.filter(c => res.has(c.id) && res.get(c.id).resultado !== 'ok' && c.nivel > nivel).map(c => c.id);
  const porConfirmar = comps.filter(c => c.nivel <= nivel && !probada(c)).map(c => c.id);
  return { area, nivel, confianza, cobertura: Math.round(cobertura * 100) / 100, frontera, porConfirmar, hipotesis, probadas: respuestas.length };
}

// El evento que guarda un módulo terminado.
export function eventoModulo(ctx, area, respuestas, opciones = {}) {
  const r = resultadoModulo(ctx, area, respuestas, opciones);
  const limpio = x => Object.fromEntries(Object.entries(x).filter(([, v]) => v != null));
  return {
    tipo: 'diagnostico', modulo: area, niveles: { [area]: r.nivel }, confianza: { [area]: r.confianza }, hipotesis: opciones.hipotesis ?? null,
    pruebas: respuestas.map(x => limpio({ item: x.item, resultado: x.resultado, tipo: x.tipo, aciertos: x.aciertos, preguntas: x.preguntas, calidad: x.calidad, pasadas: x.pasadas, tempo: x.tempo })),
  };
}

// La evidencia que deja una pasada de una obra conocida (o de una parte suya) en las competencias que esa parte pide.
// Solo cuentan los aspectos que la competencia mira y la pasada ha valorado: si alguno sale mal, es evidencia en contra;
// si todos salen bien, favorable; si no, dudosa. Lo que la pasada no deja ver (p. ej., el control) queda sin observar.
export function evidenciaDeObra(ctx, clave, calidad = {}) {
  const [id, seccion] = separar(clave);
  const obra = ctx.cat.porId.get(id);
  if (!obra) return [];
  const valorados = criterioDe(obra, ctx.estado.ajustes?.[clave] ?? ctx.estado.ajustes?.[id]).dimensiones.filter(d => calidad[d]); // lo que la pasada valora
  return pideDe(obra, seccion).map(compId => {
    const comp = ctx.cat.porId.get(compId);
    if (!comp) return null;
    const dims = criterioDe(comp, ctx.estado.ajustes?.[compId]).dimensiones;
    const vistos = dims.filter(d => valorados.includes(d));
    if (!vistos.length) return null;
    const notas = vistos.map(d => calidad[d]);
    const resultado = notas.includes('mal') ? 'en-contra' : notas.every(n => n === 'bien') ? 'favorable' : 'dudosa';
    return { item: compId, fuente: clave, resultado, aspectos: vistos, sinObservar: dims.filter(d => !vistos.includes(d)) };
  }).filter(Boolean);
}
export function eventoRepertorio(ctx, area, pasadas) {
  return { tipo: 'diagnostico', modulo: area, pruebas: [], evidencias: pasadas.flatMap(p => evidenciaDeObra(ctx, p.clave, p.calidad)) };
}

// La última evidencia de repertorio de cada competencia: Map id → { resultado, fuente, fecha, aspectos, sinObservar }.
export function evidenciasVigentes(eventos) {
  const res = new Map();
  for (const ev of [...eventos].filter(e => e.tipo === 'diagnostico' && e.evidencias).sort((a, b) => a.t.localeCompare(b.t))) {
    for (const x of ev.evidencias) res.set(x.item, { ...x, fecha: dia(ev.t) });
  }
  return res;
}

function ultimoDiagnostico(ctx, area) {
  return ctx.eventos.filter(ev => ev.tipo === 'diagnostico' && (ev.modulo === area || ev.niveles?.[area] != null || (ev.evidencias && ev.modulo === area)))
    .sort((a, b) => a.t.localeCompare(b.t)).at(-1) ?? null;
}

// El perfil de un programa, por áreas (nunca un número único). Para cada área: nivel, de dónde sale (la evaluación, su
// progreso o nada todavía), la confianza, la evidencia (pruebas, progreso y repertorio), la fecha y cuándo reevaluarla.
export function perfil(ctx, programa) {
  const evidencias = ctx.evidencias ?? evidenciasVigentes(ctx.eventos);
  return ctx.cat.areas.filter(a => a.programa === programa || a.programa === 'comun').map(a => {
    const n = ctx.niveles[a.id] ?? { nivel: 0 };
    const deObras = a.id in AREAS_DE_OBRAS;
    const comps = competenciasDe(ctx, a.id);
    const diag = ultimoDiagnostico(ctx, a.id);
    const estimadoEn = diag?.niveles?.[a.id];
    const evid = [];
    for (const ev of ctx.eventos.filter(e => e.tipo === 'diagnostico')) for (const p of ev.pruebas || []) {
      const comp = ctx.cat.porId.get(p.item);
      if (comp?.area === a.id) evid.push({ tipo: p.tipo ?? 'app', item: p.item, nombre: nombreDe(comp), resultado: p.resultado, fecha: dia(ev.t) });
    }
    for (const c of comps) {
      const est = ctx.estadoDe(c.id);
      if (estaHecho(est) && !evid.some(x => x.item === c.id && x.resultado === 'ok')) evid.push({ tipo: 'progreso', item: c.id, nombre: nombreDe(c), resultado: est, fecha: ctx.dom.get(c.id)?.ultimaPractica ?? null });
      const r = evidencias.get(c.id);
      if (r) evid.push({ tipo: 'repertorio', item: c.id, nombre: nombreDe(c), resultado: r.resultado, fecha: r.fecha, fuente: r.fuente, sinObservar: r.sinObservar });
    }
    if (deObras) for (const x of obrasConocidas(ctx, AREAS_DE_OBRAS[a.id])) for (const k of x.claves) {
      const d = ctx.dom.get(k);
      if (d) evid.push({ tipo: 'repertorio', item: k, nombre: nombreClave(ctx, k), resultado: d.ultimoFrio?.res === 'no' ? 'no' : d.estado, fecha: d.ultimaPractica });
    }
    let fuente = 'sin-datos', confianza = null, fecha = null, reevaluar = null;
    if (n.estimado) {
      fuente = 'evaluacion';
      confianza = diag?.confianza?.[a.id] ?? 'baja'; // un diagnóstico antiguo, sin confianza: la más prudente
      fecha = dia(diag.t);
      const cuando = sumarDias(fecha, REEVALUAR_DIAS[confianza]);
      reevaluar = { fecha: cuando, vencida: diasEntre(cuando, ctx.hoy) >= 0, motivo: `Estimación de confianza ${confianza}: se revisa a los ${REEVALUAR_DIAS[confianza]} días o antes si una comprobación en frío la desmiente.` };
    } else if (estimadoEn != null && estimadoEn > n.nivel) {
      // La estimación ya no vale: una comprobación en frío la ha desmentido.
      fuente = 'progreso';
      fecha = dia(diag.t);
      reevaluar = { fecha: ctx.hoy, vencida: true, motivo: 'Una comprobación en frío ha fallado por debajo del nivel que estimó la evaluación: conviene repetir el módulo.' };
      confianza = n.nivel > 0 ? 'alta' : null;
    } else if (n.nivel > 0 || evid.length) {
      fuente = n.nivel > 0 || evid.some(x => x.tipo === 'progreso') ? 'progreso' : diag ? 'evaluacion' : 'progreso';
      confianza = n.nivel > 0 ? 'alta' : diag?.confianza?.[a.id] ?? (evid.length ? 'baja' : null);
      fecha = diag ? dia(diag.t) : evid.map(x => x.fecha).filter(Boolean).sort().at(-1) ?? null;
    }
    // Posibles lagunas: lo que su nivel da por sabido y se ha perdido o fallado en frío, y lo que una obra que ya sabía
    // tocar ha dejado ver que falla (sea del nivel que sea: esa obra lo pide).
    const lagunas = comps.filter(c => (c.nivel <= n.nivel && (ctx.estadoDe(c.id) === 'necesita-repaso' || ctx.dom.get(c.id)?.ultimoFrio?.res === 'no'))
      || (evidencias.get(c.id)?.resultado === 'en-contra' && !estaHecho(ctx.estadoDe(c.id)))).map(c => c.id);
    const porConfirmar = comps.filter(c => ctx.estadoDe(c.id) === 'pendiente' && ((n.estimado && c.nivel <= n.nivel) || evidencias.get(c.id)?.resultado === 'favorable')).map(c => c.id);
    return { area: a.id, nombre: a.nombre, nivel: n.nivel, max: n.max ?? a.max, estimado: !!n.estimado, sinContenido: !!n.sinContenido, fuente, confianza, fecha, reevaluar, evidencias: evid, lagunas, porConfirmar };
  });
}

const nombreClave = (ctx, k) => {
  const [id, s] = separar(k);
  const obra = ctx.cat.porId.get(id);
  return `${obra?.titulo ?? id}${s ? `, ${seccionDe(obra, s)?.titulo ?? s}` : ''}`;
};
const NUCLEO = { clasica: ['tecnica', 'repertorio'], flamenca: ['fl-tecnica', 'fl-toque'] };

// «Mi punto de partida»: por dónde empezar en la ruta, qué áreas van fuertes y cuáles flojas respecto a su referencia
// (las de núcleo marcan el curso; las demás, una floja no lo baja), las posibles lagunas y qué falta por evaluar.
// Es una recomendación: no cierra ni bloquea nada.
export function puntoDePartida(ctx, programa) {
  const filas = perfil(ctx, programa);
  const ref = ctx.resumen?.[programa]?.referencia ?? Math.max(...NUCLEO[programa].map(a => ctx.niveles[a]?.nivel ?? 0));
  const ruta = ctx.rutaActual?.(programa) ?? null;
  const paso = ruta?.actual ? ruta.tramos.flatMap(t => t.pasos).find(p => p.id === ruta.actual) : null;
  const tramo = paso ? ruta.tramos.find(t => t.pasos.some(p => p.id === paso.id)) : null;
  const conDatos = filas.filter(f => !f.sinContenido && f.fuente !== 'sin-datos');
  const fuertes = conDatos.filter(f => f.nivel >= 1 && f.nivel >= ref).map(f => f.area);
  const flojas = conDatos.filter(f => !NUCLEO[programa].includes(f.area) && ref - f.nivel >= 1).map(f => f.area);
  const lagunas = filas.flatMap(f => f.lagunas.map(id => ({ area: f.area, item: id, nombre: nombreDe(ctx.cat.porId.get(id)) })));
  const porConfirmar = filas.flatMap(f => f.porConfirmar.map(id => ({ area: f.area, item: id, nombre: nombreDe(ctx.cat.porId.get(id)) })));
  return {
    programa, curso: ctx.cursoActual?.(programa) ?? null, referencia: ref,
    empezar: paso ? { paso: paso.id, titulo: paso.titulo, href: paso.href, tramo: tramo?.orden ?? null, tramoTitulo: tramo?.titulo ?? null } : null,
    fuertes, flojas, lagunas, porConfirmar,
    sinEvaluar: filas.filter(f => !f.sinContenido && f.fuente === 'sin-datos').map(f => f.area),
    reevaluar: filas.filter(f => f.reevaluar?.vencida).map(f => f.area),
    aviso: 'Es una recomendación: todos los pasos siguen abiertos y puedes empezar por donde quieras.',
  };
}
