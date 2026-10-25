// «¿Qué hago hoy?». Determinista: con los mismos datos, la misma sesión.
// Qué entra, por este orden (decisión de David del 25/10/2026, con las correcciones de la Fase 2.1):
//   1. los encargos del profesor, con sus minutos;
//   2. las comprobaciones en frío, de una sola cola con prioridad (ver colaDeRepasos), 2-4 minutos al principio
//      (6 con 90 o más); lo que no cabe sigue en la cola para otro día y nada queda relegado para siempre;
//   3. el objetivo actual de la ruta: el paso en el que está y la obra eje de su tramo (una obra para leer no la sustituye);
//   4. lo que esa obra necesita y está flojo (los refuerzos de la ruta, uno por necesidad);
//   5. los puntos flojos: una sola lectura al día (la de la ruta si la hay; recibe más tiempo si va por detrás, sin frenar nada);
//   6. el resto de la práctica del curso; un área principal que lleva días sin aparecer sube de prioridad (sin pasar
//      por delante del profesor, la ruta ni los refuerzos).
// Si la ruta no tiene nada que proponer (cierres pendientes o lo que queda está en preparación), la sesión consolida:
// comprobaciones, refuerzos y repertorio que ya toca. Después se reparte el tiempo y cada bloque dice para qué es.
import { diasEntre } from './fechas.js';
import { estaHecho, textoCriterio } from './dominio.js';
import { pasajesDeLectura } from './notacion.js';
import { recomendar, formatoPara } from './recomendador.js';
import { areaDe, nombreDe, separar, seccionDe } from './catalogo.js';
import { relacionesPaso, estimada, esLectura } from './ruta.js';

export const DURACIONES = [20, 30, 45, 60, 90, 120];
export const MIN_BLOQUE = 5;
const BLOQUES = [[20, 3], [30, 4], [45, 5], [60, 6], [90, 7], [120, 8]];
export const numBloques = min => (BLOQUES.find(([m]) => min <= m) ?? [0, 9])[1];

// Reparto base del resto de la práctica, en porcentaje, por bandas de curso [Decisión]: más repertorio cuanto más avanzado.
const REPARTO = {
  clasica: [
    [2, { tecnica: 14, escalas: 10, repertorio: 34, lectura: 14, ritmo: 6, teoria: 5, armonia: 5, oido: 7, diapason: 5 }],
    [4, { tecnica: 14, escalas: 9, repertorio: 40, lectura: 12, ritmo: 5, teoria: 5, armonia: 5, oido: 6, diapason: 4 }],
    [7, { tecnica: 12, escalas: 8, repertorio: 48, lectura: 10, ritmo: 4, teoria: 4, armonia: 5, oido: 6, diapason: 3 }],
  ],
  flamenca: [[6, { 'fl-tecnica': 25, 'fl-compas': 20, 'fl-toque': 35, 'fl-acompanamiento': 10, 'fl-armonia': 5, oido: 5 }]],
};
// Orden dentro de la sesión: calentar, comprobar en frío, el encargo, el paso de la ruta, las áreas, el refuerzo justo
// antes de la obra que lo necesita, la obra y una pasada para acabar tocando música.
const ORDEN = ['calentamiento', 'comprobacion', 'encargo', 'paso', 'tecnica', 'fl-tecnica', 'escalas', 'fl-compas', 'lectura', 'ritmo',
  'diapason', 'teoria', 'armonia', 'fl-armonia', 'oido', 'refuerzo', 'obra', 'repertorio', 'fl-toque', 'fl-acompanamiento', 'pasada'];
const OBRAS_AREA = { repertorio: 'clasica', 'fl-toque': 'flamenca' };
// Para qué es cada bloque: decide qué formato se recomienda (no cuál se permite).
export const PROPOSITO = { lectura: 'lectura', tecnica: 'tecnica', escalas: 'tecnica', 'fl-tecnica': 'tecnica', repertorio: 'repertorio', 'fl-toque': 'repertorio' };
const PRINCIPALES = new Set(['tecnica', 'repertorio', 'fl-tecnica', 'fl-toque']);
const PROGRAMAS_DE = { clasica: ['clasica', 'comun'], flamenca: ['flamenca', 'comun'] };
// Peso de cada candidato en el reparto del tiempo [Decisión, ajustable].
const PESO = { paso: 25, siguiente: 15, obra: 35, refuerzo: 18, lectura: 12, estudio: 25 };
const TOPE_FRIO = minutos => (minutos >= 90 ? 6 : 4); // minutos para comprobaciones en frío (aprobado: 2-4, 6 con 90 o más)
// Áreas principales de cada programa: si llevan días sin aparecer, suben de prioridad (punto 9 de la Fase 2.1).
const IMPORTANTES = new Set(['tecnica', 'repertorio', 'fl-tecnica', 'fl-toque']);
const LECTURA_DEL_DIA = 'lectura-del-dia'; // clave compartida: una sola lectura por sesión, también con «los dos»

export function planificar(ctx, { minutos, programa = 'clasica' }) {
  minutos = Math.max(10, Math.round(minutos));
  const pausas = minutos >= 90 ? Math.floor(minutos / 50) : 0; // 5 minutos cada 50
  const usados = new Set(); // lo que ya está en la sesión, para no repetirlo
  const frio = { quedan: TOPE_FRIO(minutos) }; // el tope de comprobaciones es de la sesión entera, también con «los dos»
  let partes;
  if (programa === 'ambas') {
    const clasica = Math.round(minutos * (ctx.estado.preferencias?.repartoAmbas ?? 0.65));
    partes = [
      planPrograma(ctx, clasica, 'clasica', { calentar: true, pausas, usados, frio }),
      planPrograma(ctx, minutos - clasica, 'flamenca', { calentar: false, pausas: 0, usados, frio }),
    ];
  } else {
    partes = [planPrograma(ctx, minutos, programa, { calentar: true, pausas, usados, frio })];
  }
  const bloques = conPausas(partes.flatMap(p => p.bloques), pausas, minutos);
  bloques.forEach((b, i) => { b.id = `b${i + 1}`; });
  // Lo que había para hoy y no ha cabido (para no decir «no hay» cuando lo que pasa es que no entra).
  const noCaben = {};
  for (const p of partes) for (const [k, v] of Object.entries(p.noCaben)) noCaben[k] = (noCaben[k] ?? 0) + v;
  // La cola de comprobaciones, una sola vez aunque haya dos programas (lo común está en las dos).
  const esperan = [...new Map(partes.flatMap(p => p.esperan).filter(x => !usados.has(x.id)).map(x => [x.id, x])).values()];
  const vencidas = esperan.filter(x => x.vencida);
  noCaben.comprobaciones = vencidas.length;
  const avisos = partes.flatMap(p => p.avisos);
  if (esperan.length) {
    const vieja = Math.max(0, ...vencidas.map(x => x.diasVencida));
    const desde = vencidas.length ? (vieja ? `; la más antigua venció hace ${vieja} ${vieja === 1 ? 'día' : 'días'}` : '; vencen hoy') : '';
    avisos.unshift(`${esperan.length === 1 ? '1 comprobación sigue' : `${esperan.length} comprobaciones siguen`} en la cola${desde}. Entran por prioridad en las próximas sesiones.`);
  }
  return { minutos, programa, bloques, avisos, noCaben, total: bloques.reduce((s, b) => s + b.minutos, 0) };
}

function planPrograma(ctx, minutos, programa, { calentar, pausas, usados, frio }) {
  const bloques = [], avisos = [];
  const noCaben = { encargos: 0, comprobaciones: 0, paso: 0, refuerzos: 0, flojos: 0 };
  let libre = minutos - pausas * 5;
  let huecos = numBloques(minutos);

  if (calentar) {
    const m = minutos <= 30 ? 3 : 5;
    bloques.push({ tipo: 'calentamiento', area: programa === 'flamenca' ? 'fl-tecnica' : 'tecnica', programa, minutos: m, titulo: 'Calentamiento',
      paraQue: 'Manos a punto, sin tocar nada de lo que vayas a comprobar en frío.',
      motivos: ['Manos a punto antes de exigirles nada; nada de lo que vayas a comprobar en frío.'] });
    libre -= m; huecos--;
  }

  // 1. Encargos del profesor: primero y con sus minutos.
  for (const t of encargosActivos(ctx, programa)) {
    if (libre < MIN_BLOQUE) { avisos.push(`No cabe el encargo «${tituloEncargo(ctx, t)}»: elige más tiempo o hazlo otro rato.`); noCaben.encargos++; continue; }
    const m = Math.min(t.minutos || 15, libre);
    bloques.push(bloqueEncargo(ctx, t, m, programa));
    if (t.item) { usados.add(t.item); usados.add(separar(t.item)[0]); }
    libre -= m; huecos--;
  }

  // 2. Comprobaciones en frío: una sola cola, por prioridad; entra lo que cabe en el tope sin dejar la ruta sin sitio.
  const cola = colaDeRepasos(ctx, programa).filter(x => !usados.has(x.id));
  const tope = Math.min(frio.quedan, libre - MIN_BLOQUE); // los repasos no se comen una sesión corta
  const items = [];
  let gastado = 0;
  for (const x of cola) {
    if (gastado + x.minutos > tope) continue;
    items.push({ id: x.id, nombre: x.nombre, minutos: x.minutos, motivo: x.motivo, prioridad: x.prioridad, criterio: textoCriterio(x.item, ctx.estado.ajustes?.[x.id]) });
    usados.add(x.id);
    gastado += x.minutos;
  }
  frio.quedan -= gastado;
  if (items.length) {
    bloques.push({ tipo: 'comprobacion', area: 'comprobacion', programa, minutos: gastado, titulo: 'Comprobaciones en frío', items,
      paraQue: 'Saber si lo aprendido se ha quedado: así se decide qué está dominado y qué necesita repaso.',
      motivos: ['Tócalo antes de practicarlo hoy, sin calentar ese pasaje y sin ayuda: así se sabe si se ha quedado.',
        'Entran por prioridad: lo que más riesgo tiene de olvidarse, lo de tu tramo y tus obras, lo que falló la última vez y lo que más lleva esperando.'] });
    libre -= gastado; huecos--;
  }
  // Lo que no cabe sigue en la cola (cada día sube un poco por antigüedad); el aviso, con cuánto y desde cuándo, lo da
  // planificar() una sola vez para toda la sesión.
  const esperan = cola.filter(x => !usados.has(x.id));

  // 3-6. Lo demás, por prioridad; entra lo que quepa y el tiempo se reparte por pesos.
  const candidatos = candidatosSesion(ctx, programa, usados, avisos);
  const k = Math.max(0, Math.min(huecos, Math.floor(libre / MIN_BLOQUE)));
  const elegidos = [];
  for (const c of candidatos) {
    if (c.claves.some(x => usados.has(x))) continue;
    if (elegidos.length >= k) { // había sitio para esto en la sesión, pero no tiempo
      if (c.tipo === 'paso' && c.prioridad === 1) noCaben.paso++;
      else if (c.tipo === 'refuerzo') noCaben.refuerzos++;
      else if (c.tipo === 'area' && c.desfase >= 1) noCaben.flojos++;
      continue;
    }
    c.claves.forEach(x => usados.add(x));
    elegidos.push(c);
  }
  const minutosPor = repartir(libre, elegidos.map(c => c.peso));
  elegidos.forEach((c, i) => bloques.push(c.crear(minutosPor[i])));
  const resto = minutos - pausas * 5 - bloques.reduce((s, b) => s + b.minutos, 0);
  if (resto > 0 && bloques.length) bloques.at(-1).minutos += resto; // por si no ha entrado nada más

  // La obra en dos: trabajo y, al final, una pasada (estudio intercalado). Un encargo no se parte.
  const obra = bloques.find(b => b.tipo === 'obra' && b.modo !== 'comprobacion' && b.minutos >= 15);
  if (obra && minutos >= 45) {
    const pasada = Math.max(MIN_BLOQUE, Math.round(obra.minutos * 0.35));
    obra.minutos -= pasada;
    bloques.push({ ...obra, tipo: 'pasada', minutos: pasada, titulo: `Pasada: ${obra.nombre}`,
      paraQue: 'Acabar tocando música: una pasada entera, aunque haya fallos.', motivos: ['Una pasada entera al final, para acabar tocando música.'] });
  }
  return { bloques: ordenar(bloques), avisos, noCaben, esperan };
}

// Los candidatos de la sesión, de más a menos prioritario.
function candidatosSesion(ctx, programa, usados, avisos) {
  const lista = [];
  const reservados = new Set(usados); // lo que ya tiene un candidato, para que cada área elija otra cosa
  const anadir = c => { c.claves.forEach(x => reservados.add(x)); lista.push(c); };
  const libreDe = c => c && !c.claves.some(x => reservados.has(x));
  const ruta = ctx.rutaActual(programa);
  const ref = ctx.resumen[programa]?.referencia ?? 0;
  const abiertos = ruta ? ruta.tramos.filter(t => t.estado === 'abierto') : [];
  const pasos = abiertos.flatMap(t => t.pasos);
  const tramoDe = new Map(abiertos.flatMap(t => t.pasos.map(p => [p.id, t])));
  const enRuta = pasos.filter(p => ['actual', 'recomendado'].includes(p.estado));

  // 3. El objetivo actual de la ruta: su paso actual (y otro paso abierto si hay tiempo) y la obra eje del tramo.
  const deTrabajo = enRuta.filter(p => ['habilidad', 'aplicacion', 'preparacion'].includes(p.tipo) && !p.porConfirmar && !p.insertado)
    .sort((a, b) => (b.estado === 'actual') - (a.estado === 'actual'));
  deTrabajo.slice(0, 2).forEach((p, i) => {
    const c = candidatoPaso(ctx, p, programa, ref, i === 0);
    if (c) anadir({ ...c, prioridad: i === 0 ? 1 : 4, peso: i === 0 ? PESO.paso : PESO.siguiente });
  });
  // La obra principal es la obra eje del tramo (o, si ya está hecha, la siguiente obra de la ruta que no sea para leer).
  // Una obra para leer (Sor) no la sustituye: entra como la lectura del día (5).
  const obrasRuta = enRuta.filter(p => p.tipo === 'obra' && !usados.has(separar(p.obra)[0]));
  const principales = obrasRuta.filter(p => !esLectura(p));
  const pasoObra = principales.find(p => tramoDe.get(p.id)?.obraEje === p.obra) ?? principales[0] ?? null;
  if (pasoObra) anadir({ ...candidatoObraRuta(ctx, pasoObra, programa, ruta), prioridad: 2 });

  // 4. Lo que la obra necesita y está flojo: un candidato por necesidad (la ruta ya los ha unido); la lectura, aparte.
  pasos.filter(p => p.insertado && p.estado === 'recomendado' && !p.porLectura).forEach((p, i) => {
    const c = candidatoRefuerzo(ctx, p, programa, ref);
    if (libreDe(c)) anadir({ ...c, prioridad: i === 0 ? 3 : 5, peso: PESO.refuerzo });
  });

  // 5. Una sola lectura al día. Si un paso de lectura de la ruta ya entra, es esa. Si no: el refuerzo de lectura que pide
  // la obra para leer del tramo; si no hace falta, la propia obra para leer; si no, la lectura del curso (o sobre su
  // repertorio). Va antes si la lectura va por detrás, y su tiempo baja si esta semana ya ha tenido de sobra.
  const dLectura = desfase(ctx, 'lectura', ref);
  const pesoLectura = PESO.lectura * (1 + 0.25 * Math.min(4, dLectura.niveles)) * factorSemana(ctx, programa, 'lectura');
  const prioLectura = deRuta => (dLectura.niveles >= 1 ? 3.5 : deRuta ? 5 : 6);
  const pasoLectura = obrasRuta.find(esLectura) ?? null;
  const refLectura = pasos.find(p => p.insertado && p.porLectura && p.estado === 'recomendado') ?? null;
  // Mientras su lectura quede más de medio nivel por debajo de lo que pide la obra para leer, se prepara con el refuerzo
  // (y si hoy no puede ser, con la lectura de su nivel) en vez de leer la obra.
  const lectura = [
    refLectura ? conClave(candidatoRefuerzo(ctx, refLectura, programa, ref), LECTURA_DEL_DIA, true) : pasoLectura && candidatoObraLectura(ctx, pasoLectura, programa, ref),
    conClave(candidatoArea(ctx, 'lectura', programa, ref, reservados), LECTURA_DEL_DIA, false),
  ].find(libreDe);
  if (lectura) anadir({ ...lectura, prioridad: prioLectura(lectura.deRuta), peso: pesoLectura });

  // 6. El resto: obras que está estudiando fuera de la ruta y las demás áreas del curso.
  for (const o of ctx.cat.obras.filter(x => x.programa === programa && ctx.marca(x.id) === 'en-estudio')) {
    if (usados.has(o.id) || usados.has(`obra-base:${o.id}`) || (pasoObra && separar(pasoObra.obra)[0] === o.id)) continue;
    anadir({ ...candidatoObraEstudio(ctx, o, programa), prioridad: 6 });
  }
  if (!pasoObra && !lista.some(c => c.tipo === 'obra')) {
    const r = recomendar(ctx, { programa, limite: 1 }).find(x => x.viabilidad.clase === 'estudiable');
    if (r && !usados.has(r.obra.id)) anadir({ ...candidatoObraEstudio(ctx, r.obra, programa, ['No tienes ninguna obra en estudio; te propongo esta.', ...r.razones.slice(0, 2)]), prioridad: 7 });
  }
  // Sin obra de la ruta ni en estudio: mantener vivo lo que ya toca (repertorio aprendido que más tiempo lleva sin tocarse).
  if (!lista.some(c => c.tipo === 'obra')) {
    const m = candidatoMantenimiento(ctx, programa, reservados, ruta);
    if (m) anadir({ ...m, prioridad: 7.5 });
  }
  // Los demás pasos abiertos de la ruta, en su orden, antes que cualquier otra cosa del área (la lectura ya tiene su bloque).
  deTrabajo.slice(2).filter(p => !esLectura(p)).forEach((p, i) => {
    const c = candidatoPaso(ctx, p, programa, ref, false);
    if (libreDe(c)) anadir({ ...c, prioridad: 7 + i / 100, peso: PESO.siguiente * 0.8 });
  });
  for (const a of restoAreas(ctx, programa, avisos)) {
    const c = candidatoArea(ctx, a.area, programa, ref, reservados);
    if (c) anadir({ ...c, prioridad: 8 + a.orden / 100, peso: a.peso });
  }

  // Cobertura: un área principal que lleva días sin aparecer sube un punto de prioridad por día (hasta 4,5: detrás del
  // paso actual, la obra eje, el primer refuerzo, la lectura atrasada y el segundo paso) y algo de peso. Nunca adelanta
  // al profesor (va antes, aparte), a las comprobaciones ni a la ruta.
  // Si el área ya entra hoy por algo más prioritario (un paso, la obra, un refuerzo), no hace falta subir nada; si no,
  // solo sube su mejor candidato.
  const sinAparecer = diasSinAparecer(ctx);
  const cubiertas = new Set(lista.filter(c => c.prioridad <= 4.5).map(c => c.area));
  for (const c of [...lista].sort((a, b) => a.prioridad - b.prioridad)) {
    const d = IMPORTANTES.has(c.area) && !cubiertas.has(c.area) ? sinAparecer(c.area) : 0;
    if (d < 1) continue;
    cubiertas.add(c.area);
    c.prioridad = Math.min(c.prioridad, Math.max(4.5, 8 - d));
    c.peso *= 1 + 0.25 * Math.min(4, d);
    const crear = c.crear;
    c.crear = minutos => { const b = crear(minutos); b.motivos = [...b.motivos, `${nombreArea(ctx, c.area)} lleva ${d} ${d === 1 ? 'día' : 'días'} sin aparecer: sube de prioridad para no quedarse olvidada.`]; return b; };
  }

  // Si la ruta no tiene nada que proponer, se dice por qué y la sesión consolida.
  if (ruta?.continuidad) avisos.push(textoContinuidad(ruta, ctx.resumen[programa]?.enPreparacion));
  else if (ctx.resumen[programa]?.enPreparacion) avisos.push(`Tus niveles ya apuntan al curso ${ctx.resumen[programa].enPreparacion.numero}, que está en preparación: sigues con la ruta del curso ${ruta?.curso.numero ?? ''}.`);
  return lista.sort((a, b) => a.prioridad - b.prioridad);
}

const conClave = (c, clave, deRuta) => (c ? { ...c, claves: [...c.claves, clave], deRuta } : null);

function textoContinuidad(ruta, enPreparacion) {
  const k = ruta.continuidad;
  const mientras = 'Mientras, la sesión consolida: comprobaciones, refuerzos y el repertorio que ya tocas.';
  if (k.motivo === 'cierres') return `Lo de tu ruta está hecho: faltan las comprobaciones en frío de ${k.cierres.length === 1 ? 'su cierre' : 'sus cierres'}, que entran poco a poco. ${mientras}`;
  const partes = [];
  if (k.tramosEnPreparacion.length) partes.push(`${k.tramosEnPreparacion.length === 1 ? 'el tramo' : 'los tramos'} ${k.tramosEnPreparacion.map(t => t.orden).join(', ')} del curso ${ruta.curso.numero}`);
  const sig = k.siguienteCurso ?? enPreparacion;
  if (sig) partes.push(`el curso ${sig.numero}`);
  return `Has terminado lo disponible del curso ${ruta.curso.numero}; ${partes.join(' y ')} ${partes.length > 1 || k.tramosEnPreparacion.length > 1 ? 'están' : 'está'} en preparación. ${mientras}`;
}

// Días que lleva cada área sin aparecer en su práctica (sin contar hoy). Si nunca ha aparecido, los días desde la primera
// práctica registrada; sin historial, 0 (no hay nada que se haya olvidado todavía).
function diasSinAparecer(ctx) {
  const ultima = new Map();
  let primera = null;
  for (const ev of ctx.eventos) {
    if (ev.tipo !== 'practica' || diasEntre(ev.t, ctx.hoy) < 0) continue;
    if (!primera || ev.t < primera) primera = ev.t;
    const area = ev.area ?? areaDe(ctx.cat.porId.get(separar(ev.item)[0]));
    if (area && (!ultima.has(area) || ev.t > ultima.get(area))) ultima.set(area, ev.t);
  }
  return area => {
    const desde = ultima.get(area) ?? primera;
    return desde ? Math.max(0, diasEntre(desde, ctx.hoy) - (ultima.has(area) ? 1 : 0)) : 0;
  };
}

// Un paso de la ruta: se trabaja su primera competencia sin hacer, con su ejercicio.
function candidatoPaso(ctx, p, programa, ref, esActual) {
  const comp = (p.claves || []).find(k => !estaHecho(ctx.estadoDe(k))) ?? p.claves?.[0];
  const item = comp && ctx.cat.porId.get(comp);
  if (!item) return null;
  const rel = relacionesPaso(ctx, p.id);
  // Una aplicación se hace dentro de su obra: sus instrucciones son las del paso y su notación, la de ese pasaje. Lo que
  // se registra desde el bloque lleva el paso, y eso cuenta como evidencia de haber trabajado la aplicación.
  const aplica = ['aplicacion', 'preparacion'].includes(p.tipo) && p.obra;
  const ejercicio = (rel?.contenido || []).map(x => x.item).find(x => x?.tipo === 'ejercicio') ?? (aplica ? null : (ctx.cat.ejerciciosDe.get(comp) || [])[0] ?? null);
  const [obraId, seccion] = aplica ? separar(p.obra) : [null, null];
  const obra = obraId && ctx.cat.porId.get(obraId);
  const para = paraQueDePaso(rel);
  const motivos = [esActual ? `Tu paso actual de la ruta (n.º ${p.numero}).` : `El siguiente paso abierto de la ruta (n.º ${p.numero}).`];
  if (p.faltaObra) motivos.push(`${p.detalle}: regístralo desde este bloque y la aplicación queda hecha.`);
  if (para) motivos.push(`${para}.`);
  motivos.push(...desfase(ctx, item.area, ref).motivos);
  const area = p.area ?? item.area;
  return {
    tipo: 'paso', area, claves: [comp, p.id, ...(esLectura({ area }) ? [LECTURA_DEL_DIA] : [])],
    crear: minutos => ({
      tipo: 'paso', area, programa, minutos, paso: p.id, item: comp, seccion: null, nombre: p.titulo, actual: esActual,
      titulo: `${nombreArea(ctx, area)}: ${p.titulo}`, ejercicio: ejercicio?.id ?? null,
      instrucciones: aplica ? p.objetivo ?? item.descripcion ?? null : ejercicio?.instrucciones ?? item.descripcion ?? null, criterio: textoCriterio(item, ctx.estado.ajustes?.[comp]),
      notacion: ejercicio?.notacion ? formatoPara(ejercicio, ctx, { proposito: PROPOSITO[area] }) : obra?.notacion ? formatoPara(obra, ctx, { proposito: 'repertorio', seccion: seccionDe(obra, seccion) }) : null,
      paraQue: para ?? `Paso ${p.numero} de tu ruta.`, motivos,
    }),
  };
}

function paraQueDePaso(rel) {
  if (!rel) return null;
  const obra = rel.prepara.find(x => !x.contiene) ?? rel.prepara[0];
  if (!obra) return null;
  return `Lo necesitas para ${obra.seccionTitulo ? `la ${minuscula(obra.seccionTitulo)} de ` : ''}${obra.titulo}`;
}

// La obra del tramo (o la sección que toca). Si ya la conocía, una pasada de comprobación en vez de aprenderla; si la
// conocía y la comprobación falló, se recupera lo que falló (sin aprenderla de cero).
function candidatoObraRuta(ctx, p, programa, ruta) {
  const [id, seccion] = separar(p.obra);
  const obra = ctx.cat.porId.get(id);
  const sec = seccionDe(obra, seccion);
  const nombre = obra.titulo + (sec ? `, ${minuscula(sec.titulo)}` : '');
  const area = programa === 'flamenca' ? 'fl-toque' : 'repertorio';
  const esFinal = ruta?.final?.obra === id;
  const base = { claves: [p.obra, `obra-base:${id}`], tipo: 'obra', area };
  if (p.recuperar) {
    return { ...base, peso: PESO.obra, crear: minutos => ({
      tipo: 'obra', modo: 'recuperar', area, programa, minutos, paso: p.id, item: id, seccion, nombre,
      titulo: `Obra: ${nombre} (recuperar)`, criterio: textoCriterio(obra, ctx.estado.ajustes?.[id]),
      notacion: formatoPara(obra, ctx, { proposito: 'repertorio', seccion: sec }),
      paraQue: 'La conocías: no se aprende de cero, se recupera lo que falló en la comprobación.',
      motivos: [`${p.detalle}.`, 'Trabaja primero lo que falló (el refuerzo va antes) y después vuelve a tocarla entera; la próxima comprobación en frío dirá si ya está.'],
    }) };
  }
  if (p.conocida) {
    return { ...base, peso: 8, crear: minutos => ({
      tipo: 'obra', modo: 'comprobacion', area, programa, minutos, paso: p.id, item: id, seccion, nombre,
      titulo: `Pasada de comprobación: ${nombre}`, criterio: textoCriterio(obra, ctx.estado.ajustes?.[id]),
      notacion: formatoPara(obra, ctx, { proposito: 'repertorio', seccion: sec }),
      paraQue: 'La conoces de antes: no se vuelve a aprender, se comprueba.',
      motivos: ['La conoces de antes: tócala entera, sin calentarla, y valora cada aspecto. Si sale, queda aprendida; si algo falla, la ruta te dice qué reforzar.'],
    }) };
  }
  return { ...base, peso: PESO.obra, crear: minutos => ({
    tipo: 'obra', area, programa, minutos, paso: p.id, item: id, seccion, nombre, titulo: `Obra: ${nombre}`,
    criterio: textoCriterio(obra, ctx.estado.ajustes?.[id]), notacion: formatoPara(obra, ctx, { proposito: 'repertorio', seccion: sec }),
    paraQue: esFinal ? 'Es la obra de tu tramo y la obra final del curso.' : 'Es la obra de tu tramo.',
    motivos: [`La obra de tu tramo (paso ${p.numero}).${esFinal ? ' Además, es la obra final del curso.' : ''}`],
  }) };
}

function candidatoObraEstudio(ctx, o, programa, motivosExtra) {
  const area = programa === 'flamenca' ? 'fl-toque' : 'repertorio';
  const hace = ctx.dom.get(o.id)?.ultimaPractica ? diasEntre(ctx.dom.get(o.id).ultimaPractica, ctx.hoy) : null;
  const motivos = motivosExtra ?? [hace == null ? 'Obra en estudio, todavía sin registrar.' : `Obra en estudio; lleva ${hace} ${hace === 1 ? 'día' : 'días'} sin tocarse.`];
  return {
    tipo: 'obra', area, claves: [o.id, `obra-base:${o.id}`], peso: PESO.estudio,
    crear: minutos => ({
      tipo: 'obra', area, programa, minutos, item: o.id, seccion: null, nombre: o.titulo, titulo: `Obra: ${o.titulo}`, sugerencia: !!motivosExtra,
      criterio: textoCriterio(o, ctx.estado.ajustes?.[o.id]), notacion: formatoPara(o, ctx, { proposito: 'repertorio' }),
      paraQue: motivosExtra ? 'Una obra que ya puedes estudiar: no tienes ninguna en estudio.' : 'Repertorio en estudio, fuera de la ruta.', motivos,
    }),
  };
}

// La obra para leer del tramo (Sor), como la lectura del día: apoya, no sustituye a la obra eje.
function candidatoObraLectura(ctx, p, programa, ref) {
  const [id, seccion] = separar(p.obra);
  const obra = ctx.cat.porId.get(id);
  const sec = seccionDe(obra, seccion);
  const nombre = obra.titulo + (sec ? `, ${minuscula(sec.titulo)}` : '');
  return {
    tipo: 'area', area: 'lectura', claves: [p.obra, `obra-base:${id}`, LECTURA_DEL_DIA], deRuta: true, desfase: desfase(ctx, 'lectura', ref).niveles,
    crear: minutos => ({
      tipo: 'area', area: 'lectura', programa, minutos, paso: p.id, item: id, seccion, nombre, titulo: `Lectura: ${nombre}`,
      criterio: textoCriterio(obra, ctx.estado.ajustes?.[id]), notacion: formatoPara(obra, ctx, { proposito: 'lectura', seccion: sec }),
      paraQue: 'La obra para leer de tu tramo: es la lectura de hoy, sin frenar nada.',
      motivos: [`Obra para leer de tu tramo (paso ${p.numero}): apoya la lectura, no sustituye a la obra principal.`, ...desfase(ctx, 'lectura', ref).motivos],
    }),
  };
}

// Repertorio que ya toca y lleva más tiempo sin tocarse (obras o secciones aprendidas): para no perderlo cuando la ruta
// no propone obra (cierres pendientes o lo que queda en preparación).
function candidatoMantenimiento(ctx, programa, reservados, ruta) {
  const area = programa === 'flamenca' ? 'fl-toque' : 'repertorio';
  const claves = [];
  for (const o of ctx.cat.obras.filter(x => x.programa === programa)) {
    if (reservados.has(o.id) || reservados.has(`obra-base:${o.id}`)) continue;
    if (estaHecho(ctx.estadoDe(o.id))) { claves.push(o.id); continue; }
    for (const s of o.secciones || []) if (estaHecho(ctx.estadoDe(`${o.id}#${s.id}`))) claves.push(`${o.id}#${s.id}`);
  }
  const ultima = k => ctx.dom.get(k)?.ultimaPractica ?? '';
  const clave = claves.sort((a, b) => ultima(a).localeCompare(ultima(b)) || a.localeCompare(b))[0];
  if (!clave) return null;
  const [id, seccion] = separar(clave);
  const obra = ctx.cat.porId.get(id);
  const sec = seccionDe(obra, seccion);
  const nombre = obra.titulo + (sec ? `, ${minuscula(sec.titulo)}` : '');
  const hace = ultima(clave) ? diasEntre(ultima(clave), ctx.hoy) : null;
  return {
    tipo: 'obra', area, claves: [clave, `obra-base:${id}`], peso: PESO.estudio,
    crear: minutos => ({
      tipo: 'obra', modo: 'mantenimiento', area, programa, minutos, item: id, seccion, nombre, titulo: `Repertorio: ${nombre}`,
      criterio: textoCriterio(obra, ctx.estado.ajustes?.[id]), notacion: formatoPara(obra, ctx, { proposito: 'repertorio', seccion: sec }),
      paraQue: ruta?.continuidad ? 'Mientras la ruta espera, mantener vivo lo que ya tocas.' : 'Mantener vivo lo que ya tocas.',
      motivos: [`Ya la tocas${hace != null ? ` y lleva ${hace} ${hace === 1 ? 'día' : 'días'} sin tocarse` : ''}: una pasada para que no se pierda.`],
    }),
  };
}

function candidatoRefuerzo(ctx, p, programa, ref) {
  const item = ctx.cat.porId.get(p.comp);
  if (!item) return null;
  const ejercicio = (ctx.cat.ejerciciosDe.get(p.comp) || [])[0] ?? null;
  return {
    tipo: 'refuerzo', area: item.area, claves: [p.comp, ...(item.area === 'lectura' ? [LECTURA_DEL_DIA] : [])],
    crear: minutos => ({
      tipo: 'refuerzo', area: item.area, programa, minutos, item: p.comp, seccion: null, nombre: nombreDe(item),
      titulo: `Refuerzo: ${nombreDe(item)}`, ejercicio: ejercicio?.id ?? null, instrucciones: ejercicio?.instrucciones ?? item.descripcion ?? null,
      criterio: textoCriterio(item, ctx.estado.ajustes?.[p.comp]),
      notacion: ejercicio?.notacion ? formatoPara(ejercicio, ctx, { proposito: PROPOSITO[item.area] }) : null,
      paraQue: p.detalle, motivos: [`${p.detalle}.`, ...desfase(ctx, item.area, ref).motivos],
    }),
  };
}

// Un área (la lectura o el resto de la práctica): su mejor candidato, con el desfase respecto a la técnica y el repertorio.
function candidatoArea(ctx, area, programa, ref, usados) {
  const cands = candidatosDe(ctx, area, programa, usados);
  const elegido = cands[0];
  if (!elegido) return null;
  const d = desfase(ctx, area, ref);
  const clave = elegido.seccion ? `lectura:${elegido.item.id}#${elegido.seccion.id}` : elegido.item.id;
  return {
    tipo: 'area', area, claves: [clave], peso: 10, desfase: d.niveles,
    crear: minutos => {
      const { item, seccion } = elegido;
      const ejercicio = item.tipo === 'competencia' ? (ctx.cat.ejerciciosDe.get(item.id) || [])[0] ?? null : null;
      const conNotacion = item.tipo === 'competencia' ? ejercicio : item;
      const nombre = nombreDe(item) + (seccion ? ` (${seccion.titulo ?? seccion.id})` : '');
      return {
        tipo: 'area', area, programa, minutos, item: item.id, seccion: seccion?.id ?? null, nombre,
        titulo: `${nombreArea(ctx, area)}: ${nombre}`, sugerencia: false,
        ejercicio: ejercicio?.id ?? null, instrucciones: ejercicio?.instrucciones ?? item.descripcion ?? null,
        criterio: textoCriterio(item, ctx.estado.ajustes?.[item.id]),
        notacion: conNotacion?.notacion ? formatoPara(conNotacion, ctx, { proposito: PROPOSITO[area], seccion }) : null,
        paraQue: area === 'lectura' ? (seccion ? 'Lectura sobre tu propio repertorio.' : d.niveles >= 1 ? 'La lectura va por detrás: le toca más tiempo, sin frenar lo demás.' : 'Lectura diaria: un poco cada día.') : `Resto de la práctica del curso: ${nombreArea(ctx, area).toLowerCase()}.`,
        motivos: [...elegido.motivos, ...d.motivos],
      };
    },
  };
}

// Cuánto va un área por detrás de la técnica y el repertorio (en niveles enteros, como la referencia).
function desfase(ctx, area, ref) {
  const nivel = ctx.niveles[area]?.nivel ?? 0; // nivel entero, como la referencia (con decimales, 1,4 frente a 2 no contaría)
  if (PRINCIPALES.has(area) || ref - nivel < 1) return { niveles: 0, motivos: [] };
  const g = Math.min(4, ref - nivel);
  return { niveles: g, motivos: [`${nombreArea(ctx, area)} va ${Math.round(g * 10) / 10} ${g < 2 ? 'nivel' : 'niveles'} por detrás de tu técnica y tu repertorio: le toca más tiempo.`] };
}

function ordenar(bloques) {
  const pos = b => ORDEN.indexOf(b.tipo === 'area' ? b.area : b.tipo);
  return bloques.sort((a, b) => pos(a) - pos(b));
}

function conPausas(bloques, pausas, minutos) {
  if (!pausas) return bloques;
  const res = [];
  let acumulado = 0, hechas = 0;
  for (const b of bloques) {
    res.push(b);
    acumulado += b.minutos;
    if (hechas < pausas && acumulado >= (minutos * (hechas + 1)) / (pausas + 1) && b !== bloques.at(-1)) {
      res.push({ tipo: 'pausa', area: 'pausa', minutos: 5, titulo: 'Pausa', paraQue: 'Descansar las manos.', motivos: ['Cinco minutos de descanso: manos sueltas, agua.'] });
      acumulado += 5; hechas++;
    }
  }
  return res;
}

// Enteros de al menos MIN_BLOQUE, proporcionales a los pesos y que suman exactamente total.
export function repartir(total, pesos) {
  if (!pesos.length) return [];
  const suma = pesos.reduce((a, b) => a + b, 0) || 1;
  const m = pesos.map(p => Math.max(MIN_BLOQUE, Math.floor((total * p) / suma)));
  const orden = pesos.map((_, i) => i).sort((a, b) => pesos[b] - pesos[a]);
  let dif = total - m.reduce((a, b) => a + b, 0);
  for (let i = 0; dif !== 0 && i < 10000; i++) {
    const j = orden[i % orden.length];
    if (dif > 0) { m[j]++; dif--; } else if (m[j] > MIN_BLOQUE) { m[j]--; dif++; }
  }
  return m;
}

function encargosActivos(ctx, programa) {
  return (ctx.estado.tareasProfesor || [])
    .filter(t => t.estado !== 'hecha' && t.estado !== 'cancelada' && (!t.hasta || t.hasta >= ctx.hoy))
    .filter(t => {
      const p = t.programa ?? ctx.cat.porId.get(separar(t.item)[0])?.programa ?? 'clasica';
      return p === programa || (programa === 'clasica' && p === 'comun');
    })
    .filter(t => !ctx.eventos.some(ev => ev.encargo === t.id && diasEntre(ev.t, ctx.hoy) === 0)) // ya hecho hoy
    .sort((a, b) => (a.hasta ?? '9999').localeCompare(b.hasta ?? '9999'));
}

const tituloEncargo = (ctx, t) => t.texto || nombreDe(ctx.cat.porId.get(separar(t.item)[0]));

function bloqueEncargo(ctx, t, minutos, programa) {
  const item = ctx.cat.porId.get(separar(t.item)[0]);
  const cuando = t.clase ? ` (encargado el ${t.clase.slice(8)}/${t.clase.slice(5, 7)})` : '';
  return {
    tipo: 'encargo', area: areaDe(item) ?? (programa === 'flamenca' ? 'fl-toque' : 'repertorio'), programa, minutos, encargo: t.id,
    item: t.item ?? null, nombre: tituloEncargo(ctx, t), titulo: `Encargo de clase: ${tituloEncargo(ctx, t)}`,
    instrucciones: t.detalle || null, criterio: item ? textoCriterio(item, ctx.estado.ajustes?.[item.id]) : null,
    notacion: item && item.tipo !== 'competencia' ? formatoPara(item, ctx, { proposito: PROPOSITO[areaDe(item)], encargo: t }) : null,
    paraQue: 'Lo ha pedido tu profesor: va antes que lo que propone la app.',
    motivos: [`Encargo de tu profesor${cuando}. Va antes que lo que propone la app.`],
  };
}

// La cola de comprobaciones en frío (los repasos). Entra todo lo que toca comprobar: lo vencido, lo que está a punto de
// olvidarse (más del 80 % de su intervalo, Plan 7, regla 7) y lo que el diagnóstico da por sabido en su ruta. Cada cosa
// tiene una prioridad sencilla, que es la suma de:
//   riesgo de pérdida   tiempo sin comprobar / su intervalo (1 = le toca hoy), hasta 2;
//   relación            +2 si es de un tramo abierto de su ruta, de la obra final o de una obra que estudia; +1 si es
//                       de otro tramo del curso actual; 0 si es de fuera (cursos anteriores, áreas sueltas);
//   lo que falló        +1 si la última comprobación en frío falló (para saber si el refuerzo ha servido);
//   antigüedad          +1 por cada semana que lleva vencida.
// Lo de hoy entra por orden de prioridad hasta el tope de minutos; lo demás sigue en la cola. Como lo nuevo nunca pasa
// de unos 5 puntos y lo que espera gana uno por semana, nada se queda relegado para siempre. Cada cosa dice sus motivos.
export function colaDeRepasos(ctx, programa) {
  const programas = PROGRAMAS_DE[programa];
  const ruta = ctx.rutaActual(programa);
  const deTramo = new Set(), deCurso = new Set();
  for (const t of ruta?.tramos || []) for (const p of t.pasos) for (const k of p.claves || []) (t.estado === 'abierto' ? deTramo : deCurso).add(k);
  if (ruta?.final) deTramo.add(ruta.final.obra);
  for (const o of ctx.cat.obras) if (ctx.marca(o.id) === 'en-estudio') deTramo.add(o.id);
  const relacion = (id, base) => (deTramo.has(id) || deTramo.has(base) ? 2 : deCurso.has(id) || deCurso.has(base) ? 1 : 0);
  const r1 = x => Math.round(x * 10) / 10;
  const cola = [];
  for (const [id, d] of ctx.dom) {
    const [base, seccion] = separar(id);
    const item = ctx.cat.porId.get(base);
    if (!item || !programas.includes(item.programa) || !d.solidez || !(d.urgencia >= 0.8)) continue;
    const rel = relacion(id, base);
    const diasVencida = Math.max(0, diasEntre(d.proxima, ctx.hoy));
    const fallo = d.ultimoFrio?.res === 'no' ? 1 : 0;
    const prioridad = r1(Math.min(2, d.urgencia) + 2 * (rel === 2) + (rel === 1) + fallo + diasVencida / 7);
    const motivos = [d.estado === 'necesita-repaso' ? 'Necesita repaso' : d.urgencia >= 1 ? 'Toca comprobarlo' : 'A punto de olvidarse'];
    if (diasVencida) motivos.push(`vencida hace ${diasVencida} ${diasVencida === 1 ? 'día' : 'días'}`);
    if (rel === 2) motivos.push(item.tipo === 'obra' ? 'de una obra de tu ruta' : 'de tu tramo');
    if (fallo) motivos.push('falló la última vez');
    cola.push({ id, item, seccion, prioridad, vencida: d.urgencia >= 1, diasVencida, motivo: `${motivos.join(', ')}.` });
  }
  for (const c of ctx.cat.competencias) {
    if (programas.includes(c.programa) && (deTramo.has(c.id) || deCurso.has(c.id)) && estimada(ctx, c.id)) {
      cola.push({ id: c.id, item: c, seccion: null, prioridad: r1(0.5 + relacion(c.id, c.id)), vencida: false, diasVencida: 0, motivo: 'El diagnóstico lo da por sabido: confírmalo.' });
    }
  }
  return cola.map(x => ({ ...x, minutos: x.item.tipo === 'obra' ? 4 : 2, nombre: nombreDe(x.item) + (x.seccion ? ` (${seccionDe(x.item, x.seccion)?.titulo ?? x.seccion})` : '') }))
    .sort((a, b) => b.prioridad - a.prioridad || a.id.localeCompare(b.id));
}

// El reparto base del curso para un programa.
const repartoDe = (ctx, programa) => (REPARTO[programa].find(([hasta]) => (ctx.cursoActual(programa)?.numero ?? 1) <= hasta) ?? REPARTO[programa].at(-1))[1];

// El déficit de la semana: lo que lleva menos minutos de los que le tocan sube y lo que va sobrado baja (de ×0,6 a ×1,5).
// También para la lectura: así no se come la sesión cuando la ruta tiene poco (en vez de un tope fijo por área).
function factorSemana(ctx, programa, area) {
  const base = repartoDe(ctx, programa);
  const total7 = Object.keys(base).reduce((s, a) => s + (ctx.minutos7d[a] ?? 0), 0);
  if (!base[area] || total7 < 60) return 1; // con poca historia, el déficit no dice nada todavía
  const real = (ctx.minutos7d[area] ?? 0) / total7, objetivo = base[area] / 100;
  return Math.max(0.6, Math.min(1.5, 1 + (0.5 * (objetivo - real)) / objetivo));
}

// Las áreas del resto de la práctica, por peso; avisa de las que aún no tienen contenido.
function restoAreas(ctx, programa, avisos) {
  const base = repartoDe(ctx, programa);
  const sinContenido = [];
  const lista = [];
  for (const [area, pct] of Object.entries(base)) {
    if (OBRAS_AREA[area]) continue; // las obras van por su lado
    if (!ctx.cat.competencias.some(c => c.area === area)) { sinContenido.push(nombreArea(ctx, area)); continue; }
    if (area === 'lectura') continue; // la lectura tiene su propio sitio en la sesión
    let f = factorSemana(ctx, programa, area);
    if (ctx.areasFlojas.has(area)) f *= 1.2;
    lista.push({ area, peso: pct * f * 0.6 });
  }
  if (sinContenido.length) avisos.push(`Todavía sin contenido: ${sinContenido.join(', ')}. Su tiempo se reparte entre las demás.`);
  return lista.sort((a, b) => b.peso - a.peso || a.area.localeCompare(b.area)).map((x, orden) => ({ ...x, orden }));
}

const nombreArea = (ctx, area) => ctx.cat.porId.get(area)?.nombre ?? area;
const minuscula = t => (t ? t[0].toLowerCase() + t.slice(1) : t); // «Parte A» → «parte A»

// Qué se puede trabajar hoy en un área, con su puntuación y sus motivos.
function candidatosDe(ctx, area, programa, usados) {
  const nivelArea = Math.floor(ctx.niveles[area]?.nivel ?? 0);
  const estimado = ctx.niveles[area]?.estimado;
  const lista = [];
  if (area === 'lectura') { // lectura sobre su propio repertorio: pasajes de sus obras en estudio que ya puede leer
    const L = ctx.niveles.lectura?.efectivo ?? 0;
    for (const o of ctx.cat.obras.filter(x => PROGRAMAS_DE[programa].includes(x.programa) && ctx.marca(x.id) === 'en-estudio')) {
      if (usados.has(o.id)) continue; // si es un encargo, no se repite
      for (const s of pasajesDeLectura(o, L + 0.5)) {
        if (usados.has(`lectura:${o.id}#${s.id}`)) continue;
        lista.push({ item: o, seccion: s, puntos: 2.5, motivos: [`Lectura sobre tu repertorio: ${s.titulo ?? `la sección ${s.id}`} de ${o.titulo} está a tu nivel de lectura.`] });
      }
    }
  }
  for (const c of ctx.cat.competencias) {
    if (c.area !== area || !PROGRAMAS_DE[programa].includes(c.programa) || usados.has(c.id)) continue;
    const est = ctx.estadoDe(c.id);
    if (est === 'dominado' || (estimado && c.nivel <= nivelArea && est === 'pendiente')) continue; // lo estimado se confirma, no se estudia
    if (!(c.requiere || []).every(id => estaHecho(ctx.estadoDe(id)))) continue;
    if (c.nivel > nivelArea + 1) continue; // se trabaja en el nivel del área, no en el del curso
    const motivos = [];
    let puntos = 0;
    const foco = ctx.focos.get(c.id);
    if (foco === 'ruta') { puntos += 2; motivos.push('Está en el tramo abierto de tu ruta.'); }
    if (foco === 'flojo') { puntos += 2; motivos.push('Falló en su última comprobación.'); }
    if (foco === 'objetivo') { puntos += 1.5; motivos.push('Lo necesitas para una obra en preparación.'); }
    if (foco === 'futuro') { puntos += 0.5; motivos.push('Lo pide uno de tus objetivos futuros.'); }
    if (est === 'en-progreso') { puntos += 1; motivos.push('Ya lo tienes empezado.'); }
    if (est === 'completado' || est === 'necesita-repaso') puntos -= 0.5; // hecho: sigue en repasos, no hace falta estudiarlo
    const ayer = ctx.dom.get(c.id)?.ultimaPractica;
    if (ayer && diasEntre(ayer, ctx.hoy) === 1) puntos -= 0.5; // variar
    if (!motivos.length) motivos.push(`Es lo siguiente de ${nombreArea(ctx, area).toLowerCase()} en tu nivel (${nivelArea + 1}).`);
    lista.push({ item: c, puntos, motivos });
  }
  return lista.sort((a, b) => b.puntos - a.puntos || (a.item.nivel ?? 0) - (b.item.nivel ?? 0) || a.item.id.localeCompare(b.item.id));
}
