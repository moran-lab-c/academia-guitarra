// Partitura y tablatura (apartado 3.7 del plan). Las dos están siempre que el contenido las tenga, a cualquier nivel;
// la app solo RECOMIENDA una según el momento, y él puede cambiar cuando quiera, también fragmento a fragmento.
//
// Cada obra o ejercicio dice en «notacion» qué tiene:
//   { fuente: 'notacion/x.json',            notación propia de la app: de ella salen partitura Y tablatura
//     partitura: 'externa'|'pendiente'|false, si no hay fuente: fuera de la app (IMSLP, un libro), por hacer o no hay
//     tablatura: 'externa'|'pendiente'|false,
//     principal: 'partitura'|'tablatura'|null, el formato para el que está pensado (null: lo decide el momento)
//     motivo: '…',                           por qué ese formato principal
//     vistas: ['tablatura'],                 con notación propia: lo que necesita de verdad (por defecto, las dos)
//     compases: [9, 16] }                    con notación propia: solo ese tramo (un fragmento de su obra)
// Una sección o un fragmento pueden llevar su propia «notacion» y su «lecturaNecesaria».
// «Ambas» (pentagrama y tablatura unidos) es una forma de verlas cuando el contenido tiene las dos; no es un formato.
import { FORMATOS } from './esquema.js';
import { validarNotacion } from './partitura.js';

const OTRO = { partitura: 'tablatura', tablatura: 'partitura' };
const NOMBRE = { partitura: 'partitura', tablatura: 'tablatura' };
// Un número con un decimal y coma, como se escribe en España: 0.3 → «0,3».
export const decimal = x => String(Math.round(x * 10) / 10).replace('.', ',');
const HECHOS = ['completado', 'dominado', 'necesita-repaso'];

// Estado de cada formato: 'app' (se ve en la app), 'externa', 'pendiente' o null. Con una notación propia salen las dos
// vistas, salvo que el contenido diga que solo necesita una («vistas»): un ejercicio técnico sin pentagrama, o una
// lectura en la que la tablatura daría la respuesta.
export function formatos(item, seccion) {
  const n = { ...(item?.notacion || {}), ...(seccion?.notacion || {}) };
  if (n.fuente) {
    const vistas = Array.isArray(n.vistas) && n.vistas.length ? n.vistas : FORMATOS;
    return { partitura: vistas.includes('partitura') ? 'app' : null, tablatura: vistas.includes('tablatura') ? 'app' : null };
  }
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
  const valeElegido = cx.elegido && (disp.includes(cx.elegido) || (cx.elegido === 'ambas' && disp.length === 2 && disp.every(x => formatos(item, sec)[x] === 'app')));
  const resultado = (f, motivo) => ({
    disponibles: disp, pendientes, recomendado: f,
    alternativa: f && disp.includes(OTRO[f]) ? OTRO[f] : null,
    mostrar: valeElegido ? cx.elegido : f,
    elegidoPorTi: !!(valeElegido && cx.elegido !== f),
    motivo,
  });
  if (!item?.notacion) return resultado(null, 'No necesita notación.');
  if (!disp.length) return resultado(null, pendientes.length ? `La ${pendientes.map(x => NOMBRE[x]).join(' y la ')} está por hacer.` : 'Sin notación todavía.');
  if (disp.length === 1) {
    const n = { ...(item.notacion || {}), ...(sec?.notacion || {}) };
    if (n.fuente && n.vistas) return resultado(disp[0], n.motivo ?? `Este contenido solo necesita ${NOMBRE[disp[0]]}.`);
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
  if (hueco <= 0) return resultado('partitura', `Tu lectura (${decimal(L)}) llega a la que pide (${decimal(pide)}): intenta trabajarla desde partitura. La tablatura sigue a mano.`);
  if (laConoce && hueco <= 1) return resultado('partitura', 'Ya la tocas: leer algo que conoces es de lo mejor para la lectura. La tablatura, para lo que se te escape.');
  if (hueco <= 1) return resultado('tablatura', `Tu lectura (${decimal(L)}) está cerca de la que pide (${decimal(pide)}): tablatura para montarla, y partitura en los pasajes que puedas leer.`);
  return resultado('tablatura', `Tu lectura (${decimal(L)}) está por debajo de la que pide (${decimal(pide)}): tablatura, y la lectura sigue avanzando por su lado.`);
}

// Lo que hay de tablatura, dicho con verdad: en la app, fuera de ella, por hacer o nada.
export function textoTablatura(item, seccion) {
  return {
    app: 'La tablatura está a un toque.',
    externa: 'Hay tablatura fuera de la app.',
    pendiente: 'La tablatura está por hacer: de momento, solo partitura.',
  }[formatos(item, seccion).tablatura] ?? 'No hay tablatura.';
}

// «Tu técnica permite esta obra, pero tu lectura…». tecnica = nivel alcanzado (trabaja en el siguiente).
export function avisoTecnicaLectura(obra, tecnica, lectura) {
  const dif = obra?.dificultad?.valor, pide = obra?.lecturaNecesaria?.nivel;
  if (dif == null || pide == null || tecnica + 1 < dif || lectura >= pide) return null;
  const tab = formatos(obra).tablatura;
  const base = `Tu técnica permite esta obra, pero tu lectura (${decimal(lectura)}) todavía está por debajo de la que pide para estudiarla solo con partitura (${decimal(pide)}).`;
  if (tab === 'app') return `${base} La app te recomienda tablatura; la partitura sigue disponible.`;
  if (tab === 'externa') return `${base} La app te recomienda tablatura (la tienes fuera de la app); la partitura sigue disponible.`;
  return `${base} ${textoTablatura(obra)} No frena nada: la lectura sigue avanzando por su lado.`;
}

// Secciones que ya puede leer y que tienen partitura: entran como lectura sobre su propio repertorio.
export function pasajesDeLectura(obra, lectura) {
  return (obra?.secciones || []).filter(s => s.lecturaNecesaria != null && s.lecturaNecesaria <= lectura && disponibles(obra, s).includes('partitura'));
}

// Notación propia de la app (contenido/notacion/*.json): la valida logica/partitura.js (también la que va a dibujar).
export const validarPartitura = (p, nombre) => validarNotacion(p, nombre);
