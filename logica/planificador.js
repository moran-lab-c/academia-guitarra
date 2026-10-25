// «¿Qué hago hoy?». Determinista: con los mismos datos, la misma sesión.
// Qué entra, por este orden (decisión de David del 25/10/2026, con las correcciones de la Fase 2.1):
//   1. los encargos del profesor, con sus minutos;
//   2. las comprobaciones en frío, de una sola cola con jerarquía y puntuación (ver colaDeRepasos), 2-4 minutos al
//      principio (6 con 90 o más); lo que no cabe sigue en la cola para otro día y nada queda relegado para siempre;
//   3. el objetivo actual de la ruta: el paso en el que está y la obra eje de su tramo (una obra para leer no la sustituye);
//   4. lo que esa obra necesita (los refuerzos de la ruta, uno por necesidad, y la vuelta a la obra que falló en frío);
//   5. la lectura, solo si hace falta (necesidadLectura), con el mejor recurso disponible; una sola por sesión;
//   6. el resto de la práctica del curso; un área que pasa su margen de días sin aparecer sube de prioridad (sin pasar
//      por delante del profesor, las comprobaciones, la ruta ni los refuerzos).
// Si la ruta espera (cierres pendientes o lo que queda está en preparación): comprobaciones, necesidades y reparaciones,
// repertorio activo del curso, consolidación, lectura si hace falta y cobertura. Después se reparte el tiempo y cada
// bloque dice para qué es.
import { diasEntre } from './fechas.js';
import { estaHecho, textoCriterio } from './dominio.js';
import { pasajesDeLectura } from './notacion.js';
import { recomendar, formatoPara } from './recomendador.js';
import { areaDe, nombreDe, separar, seccionDe, pideDe } from './catalogo.js';
import { relacionesPaso, estimada, esLectura, nivelLecturaTrabajo } from './ruta.js';

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
  const candidatos = candidatosSesion(ctx, programa, usados, avisos, new Set(items.map(x => x.id)));
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

// Los candidatos de la sesión, de más a menos prioritario. Escala de prioridades (menor = antes):
//   1 paso actual · 2 obra principal (la obra eje) · 3,xx refuerzos (lo que necesita la obra) · 3,4 tope de la cobertura
//   · 3,5 reparación · 3,6 repertorio activo (si no hay obra principal) · 3,7 lectura atrasada · 4 segundo paso
//   · 5 lectura ligada a la ruta · 6 dosis de lectura y obras en estudio · 7 obra recomendada y demás pasos · 8 resto de áreas.
// Un paso de lectura nunca es el paso actual ni el segundo paso: lo elige la lectura (5), con su prioridad y su peso.
// Mientras la ruta espera (decisión 7): refuerzos 3,xx · repertorio activo del curso 4 · consolidación 4,5
//   · tope de la cobertura 4,9 · lectura 5.
function candidatosSesion(ctx, programa, usados, avisos, comprobados = new Set()) {
  const lista = [];
  const reservados = new Set(usados); // lo que ya tiene un candidato, para que cada área elija otra cosa
  const anadir = c => { [...c.claves, ...(c.reserva || [])].forEach(x => reservados.add(x)); lista.push(c); };
  const libreDe = c => c && !c.claves.some(x => reservados.has(x));
  const ruta = ctx.rutaActual(programa);
  const ref = ctx.resumen[programa]?.referencia ?? 0;
  const abiertos = ruta ? ruta.tramos.filter(t => t.estado === 'abierto') : [];
  const pasos = abiertos.flatMap(t => t.pasos);
  const tramoDe = new Map(abiertos.flatMap(t => t.pasos.map(p => [p.id, t])));
  const enRuta = pasos.filter(p => ['actual', 'recomendado'].includes(p.estado));
  const espera = !!ruta?.continuidad;
  const sinAparecer = diasSinAparecer(ctx);

  // 3. El objetivo actual de la ruta: su paso actual (y otro paso abierto si hay tiempo) y la obra eje del tramo.
  const deTrabajo = enRuta.filter(p => ['habilidad', 'aplicacion', 'preparacion'].includes(p.tipo) && !p.porConfirmar && !p.insertado)
    .sort((a, b) => (b.estado === 'actual') - (a.estado === 'actual'));
  const instrumentales = deTrabajo.filter(p => !esLectura(p));
  instrumentales.slice(0, 2).forEach((p, i) => {
    const c = candidatoPaso(ctx, p, programa, ref, i === 0);
    if (c) anadir({ ...c, prioridad: i === 0 ? 1 : 4, peso: i === 0 ? PESO.paso : PESO.siguiente });
  });
  // La obra principal es la obra eje del tramo (o, si ya está hecha, la siguiente obra de la ruta que no sea para leer).
  // Una obra para leer (Sor) nunca la sustituye: solo puede entrar como recurso de lectura (5).
  const obrasRuta = enRuta.filter(p => p.tipo === 'obra' && !usados.has(separar(p.obra)[0]));
  const principales = obrasRuta.filter(p => !esLectura(p));
  const pasoObra = principales.find(p => tramoDe.get(p.id)?.obraEje === p.obra) ?? principales[0] ?? null;
  if (pasoObra) anadir({ ...candidatoObraRuta(ctx, pasoObra, programa, ruta), prioridad: 2 });

  // 4. Lo que necesitan las obras (necesidades y reparaciones): un candidato por necesidad (la ruta ya los ha unido),
  // todos por delante de la cobertura de áreas; el refuerzo de lectura va con la lectura.
  pasos.filter(p => p.insertado && p.estado === 'recomendado' && !p.porLectura).forEach((p, i) => {
    const c = candidatoRefuerzo(ctx, p, programa, ref);
    if (libreDe(c)) anadir({ ...c, prioridad: 3 + i / 100, peso: PESO.refuerzo });
  });
  // Y la vuelta a una obra (o sección) ya aprendida cuya comprobación en frío ha fallado: recuperar lo que falló o, si no
  // consta qué, una revisión general. Puede convivir con la obra principal aunque sea otra parte de la misma obra.
  pasos.filter(p => p.tipo === 'obra' && p.estado === 'repaso' && p.recuperar && !esLectura(p)).forEach((p, i) => {
    const c = { ...candidatoObraRuta(ctx, p, programa, ruta), claves: [p.obra, `reparar:${p.obra}`] };
    if (libreDe(c)) anadir({ ...c, prioridad: 3.5 + i / 100 });
  });

  // Mientras la ruta espera: el repertorio activo del curso (lo que aún no está aprendido, con la obra final delante) y la
  // consolidación de lo aprendido, antes que la lectura y la cobertura. Una obra para leer no es repertorio por defecto.
  // Sin ruta en espera, solo si no hay ninguna obra en la sesión.
  if (!pasoObra) {
    const { activo, consolidacion } = candidatosRepertorio(ctx, programa, reservados, ruta, comprobados);
    if (activo) anadir({ ...activo, prioridad: espera ? 4 : 3.6 });
    if (libreDe(consolidacion)) anadir({ ...consolidacion, prioridad: espera ? 4.5 : 7.5 });
  }

  // 5. Lectura: primero se mira si hay una necesidad de lectura hoy; si la hay, se busca el mejor recurso; si no, nada.
  // Una sola actividad de lectura por sesión (también con «los dos»).
  const pasoLectura = obrasRuta.find(esLectura) ?? null;
  const nec = necesidadLectura(ctx, programa, ref, pasoLectura, sinAparecer);
  const yaHayLectura = lista.some(c => c.claves.includes(LECTURA_DEL_DIA));
  if (nec.hay && !yaHayLectura) {
    const pesoLectura = PESO.lectura * (1 + 0.25 * Math.min(4, nec.desfase)) * factorSemana(ctx, programa, 'lectura');
    const refLectura = pasos.find(p => p.insertado && p.porLectura && p.estado === 'recomendado') ?? null;
    // La ruta manda el orden: si antes de la obra para leer queda un paso de lectura (p. ej., las notas de las cuerdas
    // 4-6 antes de Sor), va ese (lo elige la lectura del área, que prefiere lo de su ruta y sus pasajes).
    const lecturaAntes = pasoLectura && pasos.slice(0, pasos.indexOf(pasoLectura)).some(p => esLectura(p) && p.tipo !== 'obra' && !p.insertado && ['actual', 'recomendado', 'proximo'].includes(p.estado));
    const recurso = [
      refLectura && conClave(candidatoRefuerzo(ctx, refLectura, programa, ref), LECTURA_DEL_DIA, true), // preparar una obra para leer que aún no está a su nivel
      pasoLectura && !lecturaAntes && aportaObraLectura(ctx, pasoLectura) && candidatoObraLectura(ctx, pasoLectura, programa, ref), // Sor, si su lectura aporta algo
      conClave(candidatoArea(ctx, 'lectura', programa, ref, reservados), LECTURA_DEL_DIA, false), // la lectura de su nivel: su ruta o pasajes de sus obras
    ].find(libreDe);
    if (recurso) {
      const prioridad = espera ? 5 : nec.desfase >= 1 ? 3.7 : recurso.deRuta ? 5 : 6;
      const crear = recurso.crear;
      anadir({ ...recurso, prioridad, peso: pesoLectura, crear: m => { const b = crear(m); b.motivos = [...b.motivos, `Hoy hace falta lectura: ${nec.motivo}.`]; return b; } });
    }
  }

  // 6. El resto: obras que está estudiando fuera de la ruta y las demás áreas del curso.
  for (const o of ctx.cat.obras.filter(x => x.programa === programa && ctx.marca(x.id) === 'en-estudio')) {
    if (usados.has(o.id) || reservados.has(`obra-base:${o.id}`) || (pasoObra && separar(pasoObra.obra)[0] === o.id)) continue;
    anadir({ ...candidatoObraEstudio(ctx, o, programa), prioridad: 6 });
  }
  if (!pasoObra && !lista.some(c => c.tipo === 'obra')) {
    const r = recomendar(ctx, { programa, limite: 1 }).find(x => x.viabilidad.clase === 'estudiable');
    if (r && !usados.has(r.obra.id)) anadir({ ...candidatoObraEstudio(ctx, r.obra, programa, ['No tienes ninguna obra en estudio; te propongo esta.', ...r.razones.slice(0, 2)]), prioridad: 7 });
  }
  // Los demás pasos abiertos de la ruta, en su orden, antes que cualquier otra cosa del área (la lectura ya tiene su sitio).
  instrumentales.slice(2).forEach((p, i) => {
    const c = candidatoPaso(ctx, p, programa, ref, false);
    if (libreDe(c)) anadir({ ...c, prioridad: 7 + i / 100, peso: PESO.siguiente * 0.8 });
  });
  for (const a of restoAreas(ctx, programa, avisos)) {
    const c = candidatoArea(ctx, a.area, programa, ref, reservados);
    if (c) anadir({ ...c, prioridad: 8 + a.orden / 100, peso: a.peso });
  }

  // Cobertura (decisión 4): cada área del reparto del curso tiene un margen de días sin aparecer según su peso
  // (margenDias). Pasado el margen, cada día de más sube un punto la prioridad de su mejor candidato (para que entre; su
  // tiempo sigue saliendo del reparto), sin pasar nunca de 3,4 (4,9 mientras la ruta espera): no adelanta al profesor, a
  // las comprobaciones, al objetivo de la ruta, a lo que necesita la obra ni al repertorio activo. Un área olvidada de
  // verdad sí llega a pasar por delante de la lectura (3,7 o 5), para que una lectura atrasada no la deje fuera semanas.
  // Si el área ya entra hoy por algo prioritario, no sube nada.
  const tope = espera ? 4.9 : 3.4;
  const margenes = margenDias(ctx, programa);
  const cubiertas = new Set(lista.filter(c => c.prioridad <= tope).map(c => c.area));
  for (const c of [...lista].sort((a, b) => a.prioridad - b.prioridad)) {
    if (!(c.area in margenes) || cubiertas.has(c.area) || c.prioridad <= tope) continue;
    const exceso = sinAparecer(c.area) - margenes[c.area];
    if (exceso < 1) continue;
    cubiertas.add(c.area);
    c.prioridad = Math.max(tope, Math.min(c.prioridad, 8 - exceso));
    c.exceso = exceso; // a igual prioridad, entra antes lo que más tiempo lleva olvidado
    const d = sinAparecer(c.area);
    const crear = c.crear;
    c.crear = minutos => { const b = crear(minutos); b.motivos = [...b.motivos, `${nombreArea(ctx, c.area)} lleva ${d} ${d === 1 ? 'día' : 'días'} sin aparecer (su margen es de ${margenes[c.area]}): sube de prioridad para no quedarse olvidada.`]; return b; };
  }

  // Si la ruta no tiene nada que proponer, se dice por qué y la sesión consolida.
  if (espera) avisos.push(textoContinuidad(ruta, ctx.resumen[programa]?.enPreparacion));
  else if (ctx.resumen[programa]?.enPreparacion) avisos.push(`Tus niveles ya apuntan al curso ${ctx.resumen[programa].enPreparacion.numero}, que está en preparación: sigues con la ruta del curso ${ruta?.curso.numero ?? ''}.`);
  return lista.sort((a, b) => a.prioridad - b.prioridad || (b.exceso ?? 0) - (a.exceso ?? 0));
}

// ¿Hace falta lectura hoy? Sí si va por detrás de su técnica y su repertorio; si la obra para leer de su tramo pide más
// lectura de la que tiene; si esta semana lleva menos lectura de la que le toca en el reparto (sin historia todavía, una
// dosis diaria); o si lleva más días sin aparecer que su margen. Si no, está cubierta y no entra nada de lectura.
function necesidadLectura(ctx, programa, ref, pasoLectura, sinAparecer) {
  const L = ctx.niveles.lectura?.efectivo ?? 0;
  const d = desfase(ctx, 'lectura', ref).niveles;
  const obra = pasoLectura && ctx.cat.porId.get(separar(pasoLectura.obra)[0]);
  const pide = obra ? (seccionDe(obra, separar(pasoLectura.obra)[1])?.lecturaNecesaria ?? obra.lecturaNecesaria?.nivel ?? null) : null;
  const semana = semanaDe(ctx, programa, 'lectura');
  const margen = margenDias(ctx, programa).lectura;
  if (d >= 1) return { hay: true, desfase: d, motivo: 'va por detrás de tu técnica y tu repertorio' };
  if (pide != null && L < pide) return { hay: true, desfase: d, motivo: `la obra para leer de tu tramo pide lectura ${String(pide).replace('.', ',')} y la tuya es ${String(Math.round(L * 10) / 10).replace('.', ',')}` };
  if (semana && semana.conHistoria && semana.real < semana.objetivo) return { hay: true, desfase: d, motivo: 'esta semana lleva menos lectura de la que le toca' };
  if (semana && !semana.conHistoria) return { hay: true, desfase: d, motivo: 'un poco cada día' };
  if (margen != null && sinAparecer('lectura') > margen) return { hay: true, desfase: d, motivo: 'lleva días sin aparecer' };
  return { hay: false, desfase: d };
}

// Sor (o cualquier obra para leer) aporta si se puede leer en su nivel de trabajo y todavía le queda algo de lectura por
// dar: su lectura no llega aún a la que pide la obra, o alguna competencia de lectura que desarrolla no está dominada.
function aportaObraLectura(ctx, p) {
  const [id, seccion] = separar(p.obra);
  const obra = ctx.cat.porId.get(id);
  const pide = seccionDe(obra, seccion)?.lecturaNecesaria ?? obra.lecturaNecesaria?.nivel ?? null;
  if (pide != null && pide > nivelLecturaTrabajo(ctx)) return false; // aún no: antes, su refuerzo de lectura
  const L = ctx.niveles.lectura?.efectivo ?? 0;
  const desarrolla = (obra.desarrolla || []).filter(c => ctx.cat.porId.get(c)?.area === 'lectura');
  return (pide != null && L < pide) || desarrolla.some(c => ctx.estadoDe(c) !== 'dominado');
}

// Margen de días sin aparecer de cada área del reparto base del curso: cuanto más peso tiene, menos puede faltar.
// margen = 100 / (porcentaje × 4 bloques de contenido de una sesión de 60 minutos), redondeado y al menos 1:
// en el curso 1 clásico, repertorio 1 día; técnica y lectura, 2; escalas, 3; ritmo y oído, 4; teoría, armonía y mástil, 5.
function margenDias(ctx, programa) {
  const base = repartoDe(ctx, programa);
  return Object.fromEntries(Object.entries(base).map(([a, pct]) => [a, Math.max(1, Math.round(100 / (pct * 4)))]));
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

// Días que lleva cada área sin aparecer en su práctica (sin contar hoy): prácticas y tandas, no las comprobaciones en
// frío (unos minutos de comprobar no son practicar el área). Si nunca ha aparecido, los días desde la primera práctica
// registrada; sin historial, 0 (no hay nada que se haya olvidado todavía).
function diasSinAparecer(ctx) {
  const ultima = new Map();
  let primera = null;
  const anotar = (area, t) => { if (area && (!ultima.has(area) || t > ultima.get(area))) ultima.set(area, t); };
  for (const ev of ctx.eventos) {
    if (!['practica', 'bateria'].includes(ev.tipo) || ev.modo === 'comprobacion' || diasEntre(ev.t, ctx.hoy) < 0) continue;
    if (!primera || ev.t < primera) primera = ev.t;
    if (ev.tipo === 'bateria') for (const id of Object.keys(ev.resultados || {})) anotar(areaDe(ctx.cat.porId.get(id)), ev.t);
    else anotar(ev.area ?? areaDe(ctx.cat.porId.get(separar(ev.item)[0])), ev.t);
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
  // Una aplicación trabaja el pasaje, no la competencia suelta: no choca con la comprobación en frío de esa competencia.
  return {
    tipo: 'paso', area, claves: [...(aplica ? [`aplicacion:${p.obra}`] : [comp]), p.id, ...(esLectura({ area }) ? [LECTURA_DEL_DIA] : [])],
    reserva: aplica ? [comp] : [], // que ningún otro bloque elija la misma competencia
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

// La obra del tramo (o la sección que toca). Si ya la conocía, una pasada de comprobación en vez de aprenderla; si su
// última comprobación en frío falló, se recupera lo que falló (sin aprenderla de cero) o, si no consta qué falló, una
// revisión general valorando cada aspecto.
function candidatoObraRuta(ctx, p, programa, ruta) {
  const [id, seccion] = separar(p.obra);
  const obra = ctx.cat.porId.get(id);
  const sec = seccionDe(obra, seccion);
  const nombre = obra.titulo + (sec ? `, ${minuscula(sec.titulo)}` : '');
  const area = programa === 'flamenca' ? 'fl-toque' : 'repertorio';
  const esFinal = ruta?.final?.obra === id;
  const base = { claves: [p.obra, `obra-base:${id}`], tipo: 'obra', area };
  if (p.recuperar) {
    const general = p.recuperar.indeterminado === 'aspecto';
    return { ...base, peso: PESO.obra, crear: minutos => ({
      tipo: 'obra', modo: 'recuperar', area, programa, minutos, paso: p.id, item: id, seccion, nombre,
      titulo: `Obra: ${nombre} (${general ? 'revisión general' : 'recuperar'})`, criterio: textoCriterio(obra, ctx.estado.ajustes?.[id]),
      notacion: formatoPara(obra, ctx, { proposito: 'repertorio', seccion: sec }),
      paraQue: general ? 'La comprobación falló sin que conste en qué: tócala entera valorando cada aspecto, para saber qué reforzar.'
        : p.recuperar.conocida ? 'La conocías: no se aprende de cero, se recupera lo que falló en la comprobación.' : 'Recuperar lo que falló en la comprobación en frío.',
      motivos: [`${p.detalle}.`, general ? 'No se inventa un diagnóstico: sin saber qué aspecto falló, no se propone un refuerzo concreto.'
        : p.recuperar.indeterminado ? 'Ninguna competencia de la ruta trabaja ese aspecto todavía: se trabaja dentro de la obra.'
          : 'Trabaja primero lo que falló (el refuerzo va antes) y después vuelve a tocarla entera; la próxima comprobación en frío dirá si ya está.'],
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

// Repertorio del curso cuando la ruta no propone obra (decisión 7). Nunca una obra para leer por defecto (esa entra por
// la lectura, si hace falta):
//   activo        lo que el curso aún no tiene aprendido: primero la obra final (si no está aprendida con sus
//                 requisitos), después las obras de la ruta en su orden; la sección que falte, o la obra entera;
//   consolidación lo ya aprendido del curso que más tiempo lleva sin tocarse, para que no se pierda.
// La comprobación en frío de hoy no saca de la sesión la obra activa: se comprueba al principio y después se trabaja
// (la consolidación, en cambio, ya la ha hecho esa pasada en frío).
function candidatosRepertorio(ctx, programa, reservados, ruta, comprobados = new Set()) {
  const area = programa === 'flamenca' ? 'fl-toque' : 'repertorio';
  const ocupada = k => reservados.has(k) && !comprobados.has(k);
  const obrasCurso = (ruta?.obras || []).filter(x => !x.papeles.every(pp => pp === 'lectura') && !reservados.has(`obra-base:${x.obra.id}`) && !ocupada(x.obra.id));
  obrasCurso.sort((a, b) => b.papeles.includes('final') - a.papeles.includes('final'));
  const ultima = k => ctx.dom.get(k)?.ultimaPractica ?? '';
  let activo = null;
  for (const x of obrasCurso) {
    const o = x.obra;
    const esFinal = x.papeles.includes('final') && ruta?.final?.obra === o.id;
    const pendiente = (o.secciones || []).map(sec => `${o.id}#${sec.id}`).find(k => !estaHecho(ctx.estadoDe(k)));
    const clave = pendiente ?? (!estaHecho(ctx.estadoDe(o.id)) || (esFinal && !ruta.final.progreso?.aprendida) ? o.id : null);
    if (clave && !ocupada(clave)) { activo = { clave, esFinal: esFinal && clave === o.id }; break; }
  }
  const aprendidas = obrasCurso.flatMap(x => [x.obra.id, ...(x.obra.secciones || []).map(sec => `${x.obra.id}#${sec.id}`)])
    .filter(k => estaHecho(ctx.estadoDe(k)) && !reservados.has(k) && (!activo || separar(k)[0] !== separar(activo.clave)[0]))
    .sort((a, b) => ultima(a).localeCompare(ultima(b)) || a.localeCompare(b));
  const crear = (clave, modo, paraQue, motivos) => {
    const [id, seccion] = separar(clave);
    const obra = ctx.cat.porId.get(id);
    const sec = seccionDe(obra, seccion);
    const nombre = obra.titulo + (sec ? `, ${minuscula(sec.titulo)}` : '');
    if (comprobados.has(clave)) motivos = [...motivos, 'Ya la has comprobado en frío al principio: ahora se trabaja lo que haya salido flojo.'];
    return {
      tipo: 'obra', area, claves: [comprobados.has(clave) ? `trabajo:${clave}` : clave, `obra-base:${id}`], peso: PESO.estudio,
      crear: minutos => ({
        tipo: 'obra', modo, area, programa, minutos, item: id, seccion, nombre, titulo: `Repertorio: ${nombre}`,
        criterio: textoCriterio(obra, ctx.estado.ajustes?.[id]), notacion: formatoPara(obra, ctx, { proposito: 'repertorio', seccion: sec }),
        paraQue, motivos,
      }),
    };
  };
  const espera = !!ruta?.continuidad;
  const textoActivo = activo?.esFinal
    ? (espera ? 'Mientras la ruta espera, la obra final del curso: unir lo aprendido y prepararla con sus requisitos.' : 'La obra final del curso: unir lo aprendido y prepararla con sus requisitos.')
    : (espera ? 'Mientras la ruta espera, repertorio del curso que aún no está aprendido.' : 'Repertorio del curso que aún no está aprendido.');
  return {
    activo: activo && crear(activo.clave, 'activo', textoActivo,
      [activo.esFinal ? 'Es la obra final del curso: queda aprendida cuando sale entera dos veces seguidas, de memoria.' : 'Repertorio activo del curso, todavía sin aprender.']),
    consolidacion: aprendidas[0] && crear(aprendidas[0], 'mantenimiento', espera ? 'Mientras la ruta espera, mantener vivo lo que ya tocas.' : 'Mantener vivo lo que ya tocas.',
      [`Ya la tocas${ultima(aprendidas[0]) ? ` y lleva ${diasEntre(ultima(aprendidas[0]), ctx.hoy)} días sin tocarse` : ''}: una pasada para consolidarla.`]),
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

// La cola de comprobaciones en frío (los repasos), decisión de David (Fase 2.1). Entra todo lo que toca comprobar: lo
// vencido, lo que está a punto de olvidarse (más del 80 % de su intervalo, Plan 7, regla 7) y lo que el diagnóstico da
// por sabido en su ruta. Primero manda una jerarquía mínima (la franja) y, dentro de cada franja, una puntuación:
//   franja 1  necesidad crítica actual: lo que pide la obra principal de su tramo o lo que tiene un refuerzo abierto;
//   franja 2  la ruta y la obra activa: lo de su curso actual, la obra final y las obras que estudia;
//   franja 3  lo que falló en su última comprobación en frío;
//   franja 4  lo demás que está vencido;
//   franja 5  lo que solo está a punto de olvidarse.
//   puntuación = riesgo de olvido (hasta 2) + relación con la ruta (+2 tramo abierto u obra activa, +1 resto del curso)
//                + 1 si falló la última vez + 1 por semana vencida (hasta 4).
// Para que nada quede relegado para siempre, cada 4 semanas vencida una cosa sube una franja (sin llegar nunca a la 1).
// Entra por orden lo que cabe en el tope de minutos; lo demás sigue en la cola. Cada cosa dice sus motivos.
const TOPE_SEMANAS = 4;
const NOMBRE_FRANJA = { 1: 'lo necesita la obra que estás trabajando', 2: 'de tu ruta', 3: 'falló la última vez', 4: 'vencida', 5: 'a punto de olvidarse' };
export function colaDeRepasos(ctx, programa) {
  const programas = PROGRAMAS_DE[programa];
  const ruta = ctx.rutaActual(programa);
  const abiertos = (ruta?.tramos || []).filter(t => t.estado === 'abierto');
  const deTramo = new Set(abiertos.flatMap(t => t.pasos.flatMap(p => p.claves || [])));
  const deCurso = new Set((ruta?.tramos || []).flatMap(t => t.pasos.flatMap(p => p.claves || [])));
  if (ruta?.final) deTramo.add(ruta.final.obra);
  for (const o of ctx.cat.obras) if (ctx.marca(o.id) === 'en-estudio') deTramo.add(o.id);
  // Lo crítico ahora: lo que pide la obra eje del tramo (y la propia obra) y lo que tiene un refuerzo abierto.
  const criticas = new Set(abiertos.flatMap(t => t.pasos).filter(p => p.insertado && p.comp).map(p => p.comp));
  for (const t of abiertos) if (t.obraEje) {
    const [id, sec] = separar(t.obraEje);
    const obra = ctx.cat.porId.get(id);
    if (obra && !estaHecho(ctx.estadoDe(t.obraEje))) for (const c of pideDe(obra, sec)) criticas.add(c);
  }
  const relacion = (id, base) => (deTramo.has(id) || deTramo.has(base) ? 2 : deCurso.has(id) || deCurso.has(base) ? 1 : 0);
  const r1 = x => Math.round(x * 10) / 10;
  const cola = [];
  const meter = (id, item, seccion, d, estimadaDiag) => {
    const base = separar(id)[0];
    const rel = relacion(id, base);
    const diasVencida = d ? Math.max(0, diasEntre(d.proxima, ctx.hoy)) : 0;
    const vencida = d ? d.urgencia >= 1 : false;
    const fallo = d?.ultimoFrio?.res === 'no';
    let franja = criticas.has(id) ? 1 : rel > 0 || estimadaDiag ? 2 : fallo ? 3 : vencida ? 4 : 5;
    const sube = franja > 2 ? Math.min(franja - 2, Math.floor(diasVencida / (7 * TOPE_SEMANAS))) : 0;
    franja -= sube;
    const puntos = estimadaDiag ? 0.5 + rel
      : Math.min(2, d.urgencia) + rel + (fallo ? 1 : 0) + Math.min(TOPE_SEMANAS, diasVencida / 7);
    const motivos = [estimadaDiag ? 'El diagnóstico lo da por sabido: confírmalo' : d.estado === 'necesita-repaso' ? 'Necesita repaso' : vencida ? 'Toca comprobarlo' : 'A punto de olvidarse'];
    if (franja === 1) motivos.push(NOMBRE_FRANJA[1]);
    else if (rel === 2) motivos.push(item.tipo === 'obra' ? 'de una obra de tu ruta' : 'de tu tramo');
    else if (rel === 1) motivos.push('de tu curso');
    if (fallo) motivos.push('falló la última vez');
    if (diasVencida) motivos.push(`vencida hace ${diasVencida} ${diasVencida === 1 ? 'día' : 'días'}`);
    if (sube) motivos.push(`lleva más de ${TOPE_SEMANAS * sube} semanas esperando: sube de prioridad`);
    cola.push({ id, item, seccion, franja, prioridad: r1(puntos), vencida, diasVencida, motivo: `${motivos.join(', ')}.` });
  };
  for (const [id, d] of ctx.dom) {
    const [base, seccion] = separar(id);
    const item = ctx.cat.porId.get(base);
    if (!item || !programas.includes(item.programa) || !d.solidez || !(d.urgencia >= 0.8)) continue;
    meter(id, item, seccion, d, false);
  }
  for (const c of ctx.cat.competencias) {
    if (programas.includes(c.programa) && deCurso.has(c.id) && estimada(ctx, c.id)) meter(c.id, c, null, null, true);
  }
  return cola.map(x => ({ ...x, minutos: x.item.tipo === 'obra' ? 4 : 2, nombre: nombreDe(x.item) + (x.seccion ? ` (${seccionDe(x.item, x.seccion)?.titulo ?? x.seccion})` : '') }))
    .sort((a, b) => a.franja - b.franja || b.prioridad - a.prioridad || a.id.localeCompare(b.id));
}

// El reparto base del curso para un programa.
const repartoDe = (ctx, programa) => (REPARTO[programa].find(([hasta]) => (ctx.cursoActual(programa)?.numero ?? 1) <= hasta) ?? REPARTO[programa].at(-1))[1];

// El déficit de la semana: lo que lleva menos minutos de los que le tocan sube y lo que va sobrado baja (de ×0,6 a ×1,5).
// También para la lectura: así no se come la sesión cuando la ruta tiene poco (en vez de un tope fijo por área).
function factorSemana(ctx, programa, area) {
  const sem = semanaDe(ctx, programa, area);
  if (!sem?.conHistoria) return 1; // con poca historia, el déficit no dice nada todavía
  return Math.max(0.6, Math.min(1.5, 1 + (0.5 * (sem.objetivo - sem.real)) / sem.objetivo));
}

// La parte de un área en los minutos de la semana frente a la que le toca en el reparto (null si no está en el reparto).
function semanaDe(ctx, programa, area) {
  const base = repartoDe(ctx, programa);
  if (!base[area]) return null;
  const total7 = Object.keys(base).reduce((s, a) => s + (ctx.minutos7d[a] ?? 0), 0);
  return { conHistoria: total7 >= 60, real: total7 ? (ctx.minutos7d[area] ?? 0) / total7 : 0, objetivo: base[area] / 100 };
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
