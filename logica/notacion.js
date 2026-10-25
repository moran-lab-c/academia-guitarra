// Partitura y tablatura (apartado 3.7 del plan). Las dos están siempre que el contenido las tenga, a cualquier nivel;
// la app solo RECOMIENDA una según el momento, y él puede cambiar cuando quiera, también fragmento a fragmento.
//
// Cada obra o ejercicio dice en «notacion» qué tiene:
//   { fuente: 'notacion/x.json',            notación propia de la app: de ella salen partitura Y tablatura
//     partitura: 'externa'|'pendiente'|false, si no hay fuente: fuera de la app (IMSLP, un libro), por hacer o no hay
//     tablatura: 'externa'|'pendiente'|false,
//     principal: 'partitura'|'tablatura'|null, el formato para el que está pensado (null: lo decide el momento)
//     motivo: '…' }                          por qué ese formato principal
// Una sección puede llevar su propia «notacion» y su «lecturaNecesaria».
import { FORMATOS } from './esquema.js';

const OTRO = { partitura: 'tablatura', tablatura: 'partitura' };
const NOMBRE = { partitura: 'partitura', tablatura: 'tablatura' };
const r1 = x => Math.round(x * 10) / 10;
const HECHOS = ['completado', 'dominado', 'necesita-repaso'];

// Estado de cada formato: 'app' (se ve en la app), 'externa', 'pendiente' o null.
export function formatos(item, seccion) {
  const n = { ...(item?.notacion || {}), ...(seccion?.notacion || {}) };
  if (n.fuente) return { partitura: 'app', tablatura: 'app' }; // una sola fuente, dos vistas
  const estado = v => (v === 'externa' || v === 'pendiente' ? v : v === true ? 'app' : null);
  return { partitura: estado(n.partitura), tablatura: estado(n.tablatura) };
}

export const disponibles = (item, seccion) => {
  const f = formatos(item, seccion);
  return FORMATOS.filter(x => f[x] === 'app' || f[x] === 'externa');
};

// Recomendación: formato recomendado, alternativa, lo que se muestra y por qué. Nunca quita la otra opción.
// cx: { lectura, tecnica, estadoItem, proposito ('lectura'|'tecnica'|'repertorio'|'comprobacion'), seccion, encargo, preferencia, elegido }
export function recomendarFormato(item, cx = {}) {
  const sec = cx.seccion ?? null;
  const disp = disponibles(item, sec);
  const pendientes = FORMATOS.filter(x => formatos(item, sec)[x] === 'pendiente');
  const resultado = (f, motivo) => ({
    disponibles: disp, pendientes, recomendado: f,
    alternativa: f && disp.includes(OTRO[f]) ? OTRO[f] : null,
    mostrar: cx.elegido && disp.includes(cx.elegido) ? cx.elegido : f,
    elegidoPorTi: !!(cx.elegido && disp.includes(cx.elegido) && cx.elegido !== f),
    motivo,
  });
  if (!item?.notacion) return resultado(null, 'No necesita notación.');
  if (!disp.length) return resultado(null, pendientes.length ? `La ${pendientes.map(x => NOMBRE[x]).join(' y la ')} está por hacer.` : 'Sin notación todavía.');
  if (disp.length === 1) {
    const falta = pendientes.length ? ` (la ${NOMBRE[OTRO[disp[0]]]} está por hacer)` : '';
    return resultado(disp[0], `Solo hay ${NOMBRE[disp[0]]}${falta}.`);
  }
  // Las dos disponibles: de más a menos fuerte.
  if (cx.encargo?.formato && disp.includes(cx.encargo.formato)) return resultado(cx.encargo.formato, 'Lo ha pedido tu profesor.');
  const diseno = sec?.notacion?.principal ?? item.notacion?.principal;
  if (diseno && disp.includes(diseno)) return resultado(diseno, sec?.notacion?.motivo ?? item.notacion?.motivo ?? 'Es el formato para el que está pensado.');
  if (cx.proposito === 'lectura') return resultado('partitura', 'Este bloque es para leer: partitura, con la tablatura para comprobar.');
  if (cx.proposito === 'tecnica') return resultado('tablatura', 'Aquí importa la técnica, no leer: tablatura (la partitura, si quieres ver las notas).');
  if (cx.preferencia && disp.includes(cx.preferencia)) return resultado(cx.preferencia, 'Tu preferencia de estudio.');
  const pide = sec?.lecturaNecesaria ?? item.lecturaNecesaria?.nivel ?? null;
  if (pide == null) return resultado('tablatura', 'No consta la lectura que pide: tablatura para empezar; prueba la partitura cuando quieras.');
  const L = cx.lectura ?? 0, hueco = pide - L;
  const laConoce = HECHOS.includes(cx.estadoItem);
  const exigente = item.dificultad?.valor != null && cx.tecnica != null && item.dificultad.valor > cx.tecnica + 1;
  if (hueco <= 0 && exigente) return resultado('tablatura', 'Técnicamente te exige mucho: mientras la montas, tablatura para no sumar la carga de leer; después, partitura.');
  if (hueco <= 0) return resultado('partitura', `Tu lectura (${r1(L)}) llega a la que pide (${pide}): intenta trabajarla desde partitura. La tablatura sigue a mano.`);
  if (laConoce && hueco <= 1) return resultado('partitura', 'Ya la tocas: leer algo que conoces es de lo mejor para la lectura. La tablatura, para lo que se te escape.');
  if (hueco <= 1) return resultado('tablatura', `Tu lectura (${r1(L)}) está cerca de la que pide (${pide}): tablatura para montarla, y partitura en los pasajes que puedas leer.`);
  return resultado('tablatura', `Tu lectura (${r1(L)}) está por debajo de la que pide (${pide}): tablatura, y la lectura sigue avanzando por su lado.`);
}

// «Tu técnica permite esta obra, pero tu lectura…». tecnica = nivel alcanzado (trabaja en el siguiente).
export function avisoTecnicaLectura(obra, tecnica, lectura) {
  const dif = obra?.dificultad?.valor, pide = obra?.lecturaNecesaria?.nivel;
  if (dif == null || pide == null || tecnica + 1 < dif || lectura >= pide) return null;
  return `Tu técnica permite esta obra, pero tu lectura (${r1(lectura)}) todavía está por debajo de la que pide para estudiarla solo con partitura (${pide}). La app te recomienda tablatura; la partitura sigue disponible.`;
}

// Secciones que ya puede leer y que tienen partitura: entran como lectura sobre su propio repertorio.
export function pasajesDeLectura(obra, lectura) {
  return (obra?.secciones || []).filter(s => s.lecturaNecesaria != null && s.lecturaNecesaria <= lectura && disponibles(obra, s).includes('partitura'));
}

// Notación propia de la app (contenido/notacion/*.json). De cada nota (cuerda y traste) salen la partitura y la tablatura.
const DURACIONES = ['1', '2', '4', '8', '16', '32'];
export function validarPartitura(p, nombre = 'notación') {
  const err = [];
  if (!p || typeof p !== 'object') return [`${nombre}: no es un objeto`];
  if (!/^\d+\/\d+$/.test(p.compas ?? '')) err.push(`${nombre}: falta el compás (p. ej., «4/4»)`);
  if (!Array.isArray(p.compases) || !p.compases.length) return [...err, `${nombre}: sin compases`];
  const posicion = (x, donde) => {
    if (!(Number.isInteger(x?.c) && x.c >= 1 && x.c <= 6)) err.push(`${donde}: cuerda fuera de 1-6`);
    if (!(Number.isInteger(x?.t) && x.t >= 0 && x.t <= 24)) err.push(`${donde}: traste fuera de 0-24`);
  };
  p.compases.forEach((m, i) => (m.voces || []).forEach((voz, v) => voz.forEach((n, k) => {
    const donde = `${nombre}, compás ${i + 1}, voz ${v + 1}, nota ${k + 1}`;
    if (!DURACIONES.includes(String(n.d))) err.push(`${donde}: duración «${n.d}» (vale ${DURACIONES.join(', ')})`);
    if (n.s) return; // silencio
    if (Array.isArray(n.acorde)) n.acorde.forEach(x => posicion(x, donde)); else posicion(n, donde);
  })));
  if (p.compases.some(m => !Array.isArray(m.voces) || !m.voces.length)) err.push(`${nombre}: hay compases sin voces`);
  return err;
}
