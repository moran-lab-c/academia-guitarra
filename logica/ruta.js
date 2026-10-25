// La ruta de cada curso: el camino de tramos y pasos, con el estado de cada paso, el sitio actual, los refuerzos que
// hacen falta antes de una obra y las relaciones en los dos sentidos (este paso prepara estas obras; esta obra
// necesita estas habilidades). Todo se calcula: no se guarda nada aparte del historial. Ver «Propuesta B+ y cursos».
//
// Estados de un paso en la ruta: dominado · hecho · repaso (hecho, pero toca reforzarlo) · actual · recomendado
// (desbloqueado: la app ya lo propone) · proximo · futuro. Ningún paso se bloquea: todos se pueden abrir.
import { estaHecho } from './dominio.js';
import { separar, pideDe, seccionDe, nombreDe } from './catalogo.js';

const ORDEN_SITUACION = ['refuerzo', 'falta', 'estimada', 'por-consolidar', 'la-tienes'];

// Cómo está una competencia respecto a lo que la pide: la tienes (dominada), por consolidar (hecha o empezada),
// refuerzo (necesita repaso o falló en frío la última vez), estimada (el diagnóstico la da por sabida) o falta.
export function situacion(ctx, compId) {
  const est = ctx.estadoDe(compId);
  if (est === 'necesita-repaso' || ctx.dom.get(compId)?.ultimoFrio?.res === 'no') return 'refuerzo';
  if (est === 'dominado') return 'la-tienes';
  if (est === 'completado' || est === 'en-progreso') return 'por-consolidar';
  return estimada(ctx, compId) ? 'estimada' : 'falta';
}

// Sin practicar, pero el diagnóstico estimó su área por encima de su nivel: se confirma, no se vuelve a estudiar.
export function estimada(ctx, compId) {
  const c = ctx.cat.porId.get(compId);
  const n = c && ctx.niveles[c.area];
  return !!(n?.estimado && c.nivel <= n.nivel && ctx.estadoDe(compId) === 'pendiente');
}

// La obra (o una sección suya) que él ya sabía tocar antes de la academia: { nivel } o null.
export function conocida(ctx, obraId, seccion = null) {
  const k = ctx.estado.obras?.[obraId]?.conocida;
  if (!k) return null;
  if (k.nivel !== 'parcial' || !seccion) return k;
  return (k.secciones || []).includes(seccion) ? k : null;
}

// El estado de lo que contiene un paso, juntando sus competencias u obras.
export function estadoPaso(ctx, paso) {
  if (paso.clase === 'evaluacion') return estadoEvaluacion(ctx, paso);
  const claves = paso.clase === 'obra' ? (paso.contenido || []).filter(x => ctx.cat.porId.get(separar(x)[0])?.tipo === 'obra') : paso.trabaja || [];
  if (!claves.length) return { estado: 'pendiente', claves };
  const estados = claves.map(k => ctx.estadoDe(k));
  const conocidaObra = paso.clase === 'obra' && claves.every(k => conocida(ctx, ...separar(k)));
  const porConfirmar = paso.clase !== 'obra' && claves.every(k => estimada(ctx, k));
  let estado = 'pendiente';
  if (claves.some(k => situacion(ctx, k) === 'refuerzo') && estados.every(estaHecho)) estado = 'repaso';
  else if (estados.every(e => e === 'dominado')) estado = 'dominado';
  else if (estados.every(estaHecho)) estado = 'hecho';
  else if (estados.some(e => e !== 'pendiente')) estado = 'en-curso';
  return { estado, claves, conocida: conocidaObra && estado === 'pendiente', porConfirmar };
}

// El cierre de un tramo se hace solo: cuando todo lo del tramo se ha comprobado en frío días después (solidez 2 o más).
function estadoEvaluacion(ctx, paso) {
  const tramo = ctx.cat.tramoDe.get(paso.id);
  const claves = clavesDelTramo(ctx, tramo);
  if (!claves.length) return { estado: 'pendiente', claves };
  const solidez = k => ctx.dom.get(k)?.solidez ?? 0;
  const estado = claves.every(k => solidez(k) >= 3) ? 'dominado' : claves.every(k => solidez(k) >= 2) ? 'hecho' : 'pendiente';
  return { estado, claves };
}

const clavesDelTramo = (ctx, tramo) => [...new Set((tramo?.pasos || []).map(id => ctx.cat.porId.get(id)).filter(p => p && p.clase !== 'evaluacion')
  .flatMap(p => (p.clase === 'obra' ? (p.contenido || []).filter(x => ctx.cat.porId.get(separar(x)[0])?.tipo === 'obra') : p.trabaja || [])))];

const HECHO = new Set(['hecho', 'dominado', 'repaso']);
// La lectura avanza a su ritmo: sus pasos se recomiendan, pero no frenan la ruta ni el curso (decisión del 25/10/2026).
const NO_FRENAN = new Set(['lectura']);
const frena = p => p.clase !== 'evaluacion' && p.nucleo !== false && !NO_FRENAN.has(p.area);

// La ruta de un curso, lista para dibujar y para planificar.
export function rutaDelCurso(ctx, cursoId) {
  const curso = ctx.cat.porId.get(cursoId);
  if (!curso || curso.tipo !== 'curso') return null;
  const tramos = ctx.cat.tramosDe.get(curso.id) || [];
  const elegido = ctx.estado.focos?.tramo?.[curso.programa];
  const L = ctx.niveles.lectura?.efectivo ?? 0;
  let numero = 0, anteriorHecho = true, abiertoVisto = false, siguienteMarcado = false;
  const hechosIds = new Set();
  const res = { curso, tramos: [], actual: null, final: null, siguienteCurso: null, progreso: { hechos: 0, total: 0 } };

  for (const t of tramos) {
    const pasos = (t.pasos || []).map(id => ctx.cat.porId.get(id)).filter(Boolean);
    const base = pasos.map(p => ({ p, e: estadoPaso(ctx, p) }));
    const sinEvaluar = base.filter(x => frena(x.p));
    const vacio = !pasos.length;
    const empezado = base.some(x => x.e.estado !== 'pendiente');
    const abierto = !vacio && (anteriorHecho || elegido === t.id || empezado) && !(t.cierre && !anteriorHecho);
    const hecho = !vacio && base.every(x => HECHO.has(x.e.estado));
    const completo = !vacio && sinEvaluar.every(x => HECHO.has(x.e.estado)); // lo que frena la ruta, hecho
    const tramo = { id: t.id, orden: t.orden, titulo: t.titulo, objetivos: t.objetivos || [], obraEje: t.obraEje ?? null, borrador: !!t.borrador || vacio,
      cierre: !!t.cierre, estado: hecho ? 'hecho' : abierto ? 'abierto' : 'por-llegar', completo, hechos: 0, total: pasos.length, pasos: [] };
    const esSiguiente = !abierto && !siguienteMarcado && abiertoVisto;
    for (const { p, e } of base) {
      numero++;
      let estado;
      if (HECHO.has(e.estado)) estado = e.estado;
      else if (!abierto) estado = esSiguiente ? 'proximo' : 'futuro';
      else if (p.clase === 'evaluacion') estado = sinEvaluar.every(x => HECHO.has(x.e.estado)) ? 'recomendado' : 'proximo';
      else if ((p.requiere || []).every(id => hechosIds.has(id) || HECHO.has(estadoPaso(ctx, ctx.cat.porId.get(id) || {}).estado))) estado = 'recomendado';
      else estado = 'proximo';
      if (HECHO.has(e.estado)) { hechosIds.add(p.id); tramo.hechos++; }
      tramo.pasos.push(vistaPaso(ctx, p, e, estado, numero));
    }
    if (abierto) abiertoVisto = true;
    if (esSiguiente) siguienteMarcado = true;
    anteriorHecho = anteriorHecho && completo && !t.borrador; // un tramo sin contenido todavía no deja pasar al cierre
    res.tramos.push(tramo);
    res.progreso.hechos += tramo.hechos;
    res.progreso.total += tramo.total;
  }

  insertarRefuerzos(ctx, res, L);

  // El sitio actual: lo recomendado que ya está empezado; si no, lo primero recomendado (lo que el diagnóstico da por
  // sabido se confirma en frío y no cuenta como sitio actual).
  const recomendados = res.tramos.flatMap(t => t.pasos).filter(p => p.estado === 'recomendado' && !p.insertado && !p.porConfirmar && p.tipo !== 'evaluacion');
  const principales = recomendados.filter(p => !NO_FRENAN.has(p.area)); // la lectura atrasada sigue recomendada, pero no marca el sitio
  const actual = principales.find(p => p.enCurso) ?? principales[0] ?? recomendados.find(p => p.enCurso) ?? recomendados[0] ?? null;
  if (actual) { actual.estado = 'actual'; res.actual = actual.id; }

  res.final = finalDelCurso(ctx, curso, res);
  if (res.final) { res.progreso.total++; if (res.final.estado === 'hecho') res.progreso.hechos++; }
  const siguiente = ctx.cat.cursos.find(c => c.programa === curso.programa && c.numero === curso.numero + 1);
  res.siguienteCurso = siguiente ? { id: siguiente.id, numero: siguiente.numero, nombre: siguiente.nombre } : null;
  res.terminado = !!res.final && res.final.estado === 'hecho' && res.tramos.every(t => t.completo);
  res.areas = areasDelCurso(ctx, res);
  res.obras = obrasDelCurso(ctx, curso, res);
  return res;
}

function vistaPaso(ctx, p, e, estado, numero) {
  const obraClave = (p.contenido || []).find(x => ctx.cat.porId.get(separar(x)[0])?.tipo === 'obra') ?? null;
  const area = p.area ?? ctx.cat.porId.get((p.trabaja || [])[0])?.area ?? (p.clase === 'obra' ? (p.programa === 'flamenca' ? 'fl-toque' : 'repertorio') : null);
  const encargo = (ctx.estado.tareasProfesor || []).some(t => t.estado !== 'hecha' && t.estado !== 'cancelada' && (!t.hasta || t.hasta >= ctx.hoy)
    && t.item && ((p.trabaja || []).includes(t.item) || (p.contenido || []).some(x => separar(x)[0] === t.item)));
  let detalle = null;
  if (e.conocida) detalle = 'La conoces: se comprueba, no se aprende de cero';
  else if (e.porConfirmar) detalle = 'El diagnóstico lo da por sabido: se confirma en frío';
  else if (estado === 'repaso') detalle = 'Toca reforzarlo';
  return {
    id: p.id, numero, tipo: p.clase, papel: p.papel ?? null, area, titulo: p.titulo, objetivo: p.objetivo ?? null, detalle, estado,
    enCurso: e.estado === 'en-curso', encargo, conocida: !!e.conocida, porConfirmar: !!e.porConfirmar, insertado: false,
    obra: obraClave, claves: e.claves, href: `#/paso/${encodeURIComponent(p.id)}`,
  };
}

// Antes de una obra (o de su aplicación) que está al alcance, la ruta pide reforzar lo que esa obra necesita y está
// flojo: lo que falló en frío o necesita repaso, y la lectura si la obra es para leer y la lectura no llega.
function insertarRefuerzos(ctx, res, L) {
  for (const tramo of res.tramos) {
    if (tramo.estado !== 'abierto') continue;
    const enTramo = new Set(tramo.pasos.filter(p => !HECHO.has(p.estado)).flatMap(p => p.claves || []));
    const nuevos = [];
    for (const p of tramo.pasos) {
      if (!['obra', 'aplicacion'].includes(p.tipo) || HECHO.has(p.estado) || !p.obra) continue;
      const [obraId, seccion] = separar(p.obra);
      const obra = ctx.cat.porId.get(obraId);
      const motivoObra = `${obra.titulo}${seccion ? `, ${seccionDe(obra, seccion)?.titulo?.toLowerCase() ?? seccion}` : ''}`;
      const comps = pideDe(obra, seccion).filter(c => situacion(ctx, c) === 'refuerzo');
      const lista = comps.map(c => ({ comp: c, porLectura: false, motivo: ctx.estadoDe(c) === 'necesita-repaso' ? `Necesita repaso y la pide ${motivoObra}` : `Falló en frío y la pide ${motivoObra}` }));
      const pideLectura = (seccionDe(obra, seccion)?.lecturaNecesaria ?? obra.lecturaNecesaria?.nivel) ?? null;
      if (p.papel === 'lectura' && pideLectura != null && pideLectura - L > 0.5) {
        const lectura = ctx.cat.competencias.find(c => c.area === 'lectura' && c.programa !== otroPrograma(res.curso.programa)
          && c.nivel <= Math.floor(L) + 1 && ctx.estadoDe(c.id) !== 'dominado' && !enTramo.has(c.id));
        if (lectura) lista.push({ comp: lectura.id, porLectura: true, motivo: `Para leer ${motivoObra}: tu lectura (${redondear(L)}) está por debajo de la que pide (${pideLectura})` });
      }
      for (const r of lista.slice(0, 2)) {
        const c = ctx.cat.porId.get(r.comp);
        nuevos.push({ antes: p.id, paso: {
          id: `refuerzo:${p.id}:${r.comp}`, numero: null, tipo: 'refuerzo', papel: null, area: c.area, titulo: nombreDe(c), objetivo: null,
          detalle: r.motivo, estado: 'recomendado', enCurso: false, encargo: false, conocida: false, porConfirmar: false, insertado: true,
          obra: p.obra, claves: [r.comp], comp: r.comp, porLectura: r.porLectura, href: `#/competencia/${encodeURIComponent(r.comp)}`,
        } });
      }
    }
    for (const n of nuevos) tramo.pasos.splice(tramo.pasos.findIndex(p => p.id === n.antes), 0, n.paso);
  }
}

const otroPrograma = p => (p === 'clasica' ? 'flamenca' : 'clasica');
const redondear = x => String(Math.round(x * 10) / 10).replace('.', ',');

function finalDelCurso(ctx, curso, res) {
  if (!curso.obraFinal) return null;
  const obra = ctx.cat.porId.get(curso.obraFinal.obra);
  if (!obra) return null;
  const cierre = res.tramos.find(t => t.cierre);
  const preparada = cierre ? cierre.pasos.filter(p => p.tipo === 'preparacion').every(p => HECHO.has(p.estado)) : true;
  const hecha = estaHecho(ctx.estadoDe(obra.id));
  const estado = hecha ? 'hecho' : cierre?.estado === 'abierto' || cierre?.estado === 'hecho' ? (preparada ? 'recomendado' : 'proximo') : 'futuro';
  const requisitos = curso.obraFinal.requisitos || [];
  return {
    id: `final:${curso.id}`, obra: obra.id, titulo: `${obra.titulo}, completa`,
    detalle: requisitos.length ? `de ${requisitos.map(r => (r === 'memoria' ? 'memoria' : 'grabada')).join(' y ')}`.replace('de memoria y grabada', 'de memoria y grabada').replace('de grabada', 'grabada') : null,
    requisitos, justificacion: curso.obraFinal.justificacion, estado, conocida: !!conocida(ctx, obra.id),
    href: `#/obra/${encodeURIComponent(obra.id)}`,
  };
}

function areasDelCurso(ctx, res) {
  const cuenta = new Map();
  for (const p of res.tramos.flatMap(t => t.pasos)) {
    if (p.insertado) continue;
    const areas = new Set((p.claves || []).map(k => ctx.cat.porId.get(k)?.area ?? (ctx.cat.porId.get(separar(k)[0])?.tipo === 'obra' ? 'repertorio' : null)).filter(Boolean));
    if (!areas.size && p.area) areas.add(p.area);
    for (const a of areas) cuenta.set(a, (cuenta.get(a) ?? 0) + 1);
  }
  return [...cuenta].map(([area, pasos]) => ({ area, nombre: ctx.cat.porId.get(area)?.nombre ?? area, pasos })).sort((a, b) => b.pasos - a.pasos);
}

function obrasDelCurso(ctx, curso, res) {
  const porObra = new Map();
  for (const t of res.tramos) for (const p of t.pasos) {
    if (!p.obra || p.insertado) continue;
    const [id, seccion] = separar(p.obra);
    const x = porObra.get(id) ?? porObra.set(id, { obra: ctx.cat.porId.get(id), papeles: new Set(), tramos: new Set(), secciones: new Set() }).get(id);
    x.papeles.add(p.papel ?? (p.tipo === 'aplicacion' ? 'aplicacion' : 'obra'));
    x.tramos.add(t.orden);
    if (seccion) x.secciones.add(seccion);
  }
  if (res.final) {
    const x = porObra.get(res.final.obra) ?? porObra.set(res.final.obra, { obra: ctx.cat.porId.get(res.final.obra), papeles: new Set(), tramos: new Set(), secciones: new Set() }).get(res.final.obra);
    x.papeles.add('final');
  }
  return [...porObra.values()].map(x => ({ ...x, papeles: [...x.papeles], tramos: [...x.tramos], secciones: [...x.secciones], estado: estadoObra(ctx, x.obra.id) }));
}

// El curso que toca: el que marcan sus niveles o, si ya terminó la ruta de ese, el siguiente.
export function cursoActual(ctx, programa, porNiveles = 1) {
  const cursos = ctx.cat.cursos.filter(c => c.programa === programa);
  let numero = porNiveles;
  for (const c of cursos) if (c.numero >= numero && (ctx.ruta ? ctx.ruta(c.id) : rutaDelCurso(ctx, c.id))?.terminado) numero = c.numero + 1;
  return cursos.find(c => c.numero === Math.min(numero, cursos.length)) ?? null;
}

// Dónde se trabaja una competencia: pasos de la ruta y ejercicios.
export function dondeSeTrabaja(ctx, compId) {
  return [
    ...(ctx.cat.pasosDe.get(compId) || []).map(p => {
      const tramo = ctx.cat.tramoDe.get(p.id), curso = tramo && ctx.cat.porId.get(tramo.curso);
      return { tipo: 'paso', id: p.id, titulo: p.titulo, tramo: tramo?.orden ?? null, curso: curso?.numero ?? null, href: `#/paso/${encodeURIComponent(p.id)}` };
    }),
    ...(ctx.cat.ejerciciosDe.get(compId) || []).map(e => ({ tipo: 'ejercicio', id: e.id, titulo: e.titulo, href: `#/ejercicio/${encodeURIComponent(e.id)}` })),
  ];
}

// Desde una obra (o una sección): lo que trabaja y lo que necesita, con dónde se trabaja cada cosa.
export function necesidades(ctx, obraId, seccion = null) {
  const obra = ctx.cat.porId.get(obraId);
  if (!obra) return null;
  const sec = seccionDe(obra, seccion);
  const fila = c => ({ comp: c, nombre: nombreDe(ctx.cat.porId.get(c)), estado: ctx.estadoDe(c), situacion: situacion(ctx, c), donde: dondeSeTrabaja(ctx, c) });
  const pide = pideDe(obra, seccion).map(fila).sort((a, b) => ORDEN_SITUACION.indexOf(a.situacion) - ORDEN_SITUACION.indexOf(b.situacion));
  const desarrolla = [...new Set([...(obra.desarrolla || []), ...(sec ? sec.desarrolla || [] : (obra.secciones || []).flatMap(s => s.desarrolla || []))])].map(fila);
  const cuenta = s => pide.filter(x => x.situacion === s).length;
  const lecturaPide = sec?.lecturaNecesaria ?? obra.lecturaNecesaria?.nivel ?? null;
  return {
    obra, seccion: sec, pide, desarrolla,
    resumen: { laTienes: cuenta('la-tienes'), porConsolidar: cuenta('por-consolidar'), refuerzo: cuenta('refuerzo'), falta: cuenta('falta'), estimada: cuenta('estimada') },
    lectura: lecturaPide == null ? null : { pide: lecturaPide, tienes: ctx.niveles.lectura?.efectivo ?? 0, frena: false },
  };
}

// Dónde aparece una obra en las rutas, y de qué curso es la obra final.
export function obraEnRutas(ctx, obraId) {
  const pasos = (ctx.cat.pasosCon.get(obraId) || []).map(p => {
    const tramo = ctx.cat.tramoDe.get(p.id), curso = tramo && ctx.cat.porId.get(tramo.curso);
    const clave = (p.contenido || []).find(x => separar(x)[0] === obraId);
    return { paso: p.id, titulo: p.titulo, clase: p.clase, papel: p.papel ?? null, seccion: clave ? separar(clave)[1] : null, tramo: tramo?.orden ?? null, tramoTitulo: tramo?.titulo ?? null, curso: curso?.numero ?? null, cursoId: curso?.id ?? null, href: `#/paso/${encodeURIComponent(p.id)}` };
  });
  const finalDe = (ctx.cat.finalDe.get(obraId) || []).map(c => ({ curso: c.id, numero: c.numero, nombre: c.nombre, justificacion: c.obraFinal.justificacion, requisitos: c.obraFinal.requisitos || [] }));
  return { pasos, finalDe };
}

// Desde un paso: lo que contiene, en qué se apoya y qué obras prepara.
export function relacionesPaso(ctx, pasoId) {
  const p = ctx.cat.porId.get(pasoId);
  if (!p || p.tipo !== 'paso') return null;
  const tramo = ctx.cat.tramoDe.get(p.id);
  const curso = tramo && ctx.cat.porId.get(tramo.curso);
  const trabaja = new Set(p.trabaja || []);
  const prepara = [];
  for (const o of ctx.cat.obras) {
    if (o.programa !== p.programa) continue;
    const partes = [null, ...(o.secciones || []).map(s => s.id)];
    for (const s of partes) {
      if (s === null && (o.secciones || []).length) continue; // con secciones, se dice qué parte
      if (pideDe(o, s).some(c => trabaja.has(c))) prepara.push({ obra: o.id, titulo: o.titulo, seccion: s, seccionTitulo: seccionDe(o, s)?.titulo ?? null });
    }
  }
  for (const x of p.contenido || []) {
    const [id, s] = separar(x);
    if (ctx.cat.porId.get(id)?.tipo === 'obra' && !prepara.some(y => y.obra === id && y.seccion === s)) prepara.push({ obra: id, titulo: ctx.cat.porId.get(id).titulo, seccion: s, seccionTitulo: seccionDe(ctx.cat.porId.get(id), s)?.titulo ?? null, contiene: true });
  }
  const requisitos = [...new Set((p.trabaja || []).flatMap(c => ctx.cat.porId.get(c)?.requiere || []))].map(c => ({ comp: c, nombre: nombreDe(ctx.cat.porId.get(c)), estado: ctx.estadoDe(c), donde: dondeSeTrabaja(ctx, c) }));
  const pasosAntes = (p.requiere || []).map(id => ({ paso: id, titulo: ctx.cat.porId.get(id)?.titulo, estado: estadoPaso(ctx, ctx.cat.porId.get(id)).estado, href: `#/paso/${encodeURIComponent(id)}` }));
  const orden = tramo ? tramo.pasos : [];
  const i = orden.indexOf(p.id);
  return {
    paso: p, tramo, curso, estado: estadoPaso(ctx, p), prepara, requisitos, pasosAntes,
    anterior: i > 0 ? ctx.cat.porId.get(orden[i - 1]) : null, siguiente: i >= 0 && i < orden.length - 1 ? ctx.cat.porId.get(orden[i + 1]) : null,
    contenido: (p.contenido || []).map(x => { const [id, s] = separar(x); return { clave: x, item: ctx.cat.porId.get(id), seccion: s }; }),
    comps: (p.trabaja || []).map(c => ({ comp: c, item: ctx.cat.porId.get(c), estado: ctx.estadoDe(c), situacion: situacion(ctx, c), dom: ctx.dom.get(c) ?? null })),
  };
}

// El estado de una obra en su repertorio, sin reiniciar lo que ya sabía: sin empezar, empezada, aprendida, dominada,
// conocida (la sabía de antes y falta comprobarla), en repaso; y si es obra de evaluación (obra final de un curso).
export const NOMBRE_ESTADO_OBRA = {
  'sin-empezar': 'Sin empezar', empezada: 'Empezada', aprendida: 'Aprendida', dominada: 'Dominada',
  conocida: 'La conoces: por comprobar', 'en-repaso': 'En repaso',
};
export function estadoObra(ctx, obraId) {
  const est = ctx.estadoDe(obraId);
  const obra = ctx.cat.porId.get(obraId);
  const secciones = (obra?.secciones || []).map(s => ({ id: s.id, titulo: s.titulo, estado: ctx.estadoDe(`${obraId}#${s.id}`), conocida: !!conocida(ctx, obraId, s.id) }));
  const k = conocida(ctx, obraId);
  let clave = { dominado: 'dominada', completado: 'aprendida', 'necesita-repaso': 'en-repaso', 'en-progreso': 'empezada' }[est] ?? null;
  if (!clave) clave = secciones.some(s => s.estado !== 'pendiente') ? 'empezada' : k ? 'conocida' : 'sin-empezar';
  const final = ctx.cat.finalDe.get(obraId) || [];
  return { clave, texto: NOMBRE_ESTADO_OBRA[clave], conocida: k?.nivel ?? null, dominadaAntes: k?.nivel === 'dominada', secciones, deEvaluacion: final.length > 0 && !!k, finalDe: final.map(c => c.id) };
}
