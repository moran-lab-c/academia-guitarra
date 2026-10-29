// El metrónomo, sin sonido ni pantalla: límites, cambios, estados (parado, sonando, pausado), pulsos y acentos según el
// compás, de dónde sale el tempo de referencia (el profesor manda) y el tempo como señal de progreso. El sonido y la
// barra están en web/componentes/metronomo.js.
//
// El tempo es un dato de progreso: «objetivo 80, vas por 65» informa, no suspende. Solo cuenta para el dominio si el
// criterio (o su ajuste, p. ej. del profesor) lo hace obligatorio; eso lo decide dominio.js, como siempre.
import { criterioDe, claveDe } from './dominio.js';
import { separar } from './catalogo.js';

export const BPM_MIN = 30;
export const BPM_MAX = 240;
export const PASOS = [1, 5];

export const ajustarBpm = bpm => Math.min(BPM_MAX, Math.max(BPM_MIN, Math.round(Number(bpm) || BPM_MIN)));

// Cómo se cuenta un compás: pulsos, subdivisión (los compuestos van de tres en tres) y en qué pulsos va el acento.
// «acentos» del contenido (de 1 en adelante) mandan: p. ej., el compás de 12 de la soleá acentúa 3, 6, 8, 10 y 12.
export function pulsosDe(compas = '4/4', acentos = null) {
  const m = /^(\d+)\/(\d+)$/.exec(String(compas));
  let pulsos = 4, subdivision = 1;
  if (m) {
    const [num, den] = [Number(m[1]), Number(m[2])];
    // 6/8, 9/8, 12/8 se cuentan en negras con puntillo, salvo que los acentos del contenido pidan contar cada corchea
    // (el compás de 12 flamenco: 3, 6, 8, 10 y 12).
    const compuesto = den === 8 && num % 3 === 0 && num > 3 && !(Array.isArray(acentos) && acentos.some(a => a > num / 3));
    pulsos = compuesto ? num / 3 : num;
    subdivision = compuesto ? 3 : 1;
  }
  const lista = Array.isArray(acentos) && acentos.length ? acentos.filter(a => Number.isInteger(a) && a >= 1 && a <= pulsos) : [1];
  return { compas: m ? String(compas) : '4/4', pulsos, subdivision, acentos: lista };
}

// Un metrónomo como dato: cada operación devuelve uno nuevo.
export function crearMetronomo({ bpm = 60, compas = '4/4', acentos = null } = {}) {
  return { estado: 'parado', bpm: ajustarBpm(bpm), ...pulsosDe(compas, acentos), pulso: 0 };
}
export const iniciar = m => ({ ...m, estado: 'sonando' });                       // sigue desde donde se pausó
export const pausar = m => (m.estado === 'sonando' ? { ...m, estado: 'pausado' } : m);
export const detener = m => ({ ...m, estado: 'parado', pulso: 0 });              // vuelve al primer pulso
export const cambiarBpm = (m, delta) => ({ ...m, bpm: ajustarBpm(m.bpm + delta) });
export const fijarBpm = (m, bpm) => ({ ...m, bpm: ajustarBpm(bpm) });
export const fijarCompas = (m, compas, acentos = null) => ({ ...m, ...pulsosDe(compas, acentos), pulso: 0 });
// El pulso que suena ahora y si lleva acento; devuelve también el metrónomo con el pulso siguiente.
export function avanzar(m) {
  const actual = m.pulso % m.pulsos;
  return { metronomo: { ...m, pulso: (actual + 1) % m.pulsos }, pulso: actual, acento: m.acentos.includes(actual + 1) };
}
export const intervaloMs = bpm => 60000 / ajustarBpm(bpm);

// La unidad del tempo: la del criterio si la dice; si no, la negra, o la negra con puntillo en los compases compuestos
// (en 6/8, 60 es ♩.=60, no ♩=60).
export const unidadDe = (compas, unidad = null) => unidad ?? (compas && pulsosDe(compas).subdivision === 3 ? '♩.' : '♩');

// El tempo de referencia de una cosa (obra, sección, fragmento, ejercicio o competencia) y de dónde sale, por este orden:
// el encargo activo del profesor que lo diga, el ajuste de su profesor, su propio ajuste y el contenido. También el último
// tempo apuntado, el compás, y el tempo inicial y la subida que proponga el contenido. clave: «obra:x», «obra:x#B», «ej:y»,
// «comp:z» (donde se registra). contenido: lo que se está practicando si no es la clave misma (un ejercicio registra en
// su competencia, pero su tempo y su compás son los del ejercicio). compas: el de la sección, si lo dice.
export function tempoDe(ctx, clave, { contenido = null, compas = null } = {}) {
  const [id] = separar(clave);
  const item = ctx.cat.porId.get(id);
  const fuentes = [contenido, item].filter(Boolean);
  const primero = f => fuentes.map(f).find(x => x != null) ?? null;
  const encargo = (ctx.estado.tareasProfesor || []).find(t => t.estado !== 'hecha' && t.estado !== 'cancelada' && t.tempo
    && (t.item === clave || t.item === id) && (!t.hasta || t.hasta >= ctx.hoy));
  const ajuste = ctx.estado.ajustes?.[clave] ?? ctx.estado.ajustes?.[id];
  const crit = item ? criterioDe(item, ajuste) : null;
  // Sin compás dicho, una notación propia está en 4/4 (es lo que comprueba el contenido); sin notación, no se sabe.
  const elCompas = compas ?? primero(x => x.compas) ?? (fuentes.some(x => x.notacion?.fuente) ? '4/4' : null);
  const progreso = progresoTempo(ctx, clave);
  const base = {
    unidad: unidadDe(elCompas, crit?.tempo?.unidad), compas: elCompas, acentos: primero(x => x.acentos),
    inicial: primero(x => x.tempo?.inicial), subida: primero(x => x.tempo?.subida),
    actual: progreso.ultimo, mejor: progreso.mejorValido, obligatorio: !!crit?.tempo?.obligatorio,
  };
  if (encargo) return { ...base, objetivo: encargo.tempo, fuente: 'encargo', motivo: 'Lo ha pedido tu profesor en un encargo.' };
  if (ajuste?.tempo?.referencia) {
    const delProfesor = ajuste.por === 'profesor';
    return { ...base, objetivo: ajuste.tempo.referencia, fuente: delProfesor ? 'profesor' : 'propio', motivo: delProfesor ? 'Lo ha fijado tu profesor.' : 'Lo has ajustado tú.' };
  }
  const delContenido = fuentes.map(x => x.criterio?.tempo?.referencia ?? x.tempo?.objetivo ?? null).find(Boolean) ?? null;
  if (delContenido) return { ...base, objetivo: delContenido, fuente: 'contenido', motivo: 'Tempo de referencia del contenido.' };
  return { ...base, objetivo: null, fuente: null, motivo: fuentes.map(x => x.tempo?.regla).find(Boolean) ?? 'Sin tempo de referencia: empieza donde salga limpio.' };
}

// Los tempos apuntados de una cosa, del más antiguo al más reciente, y lo que dicen: el último, el mejor de los intentos
// que salieron bien y, si hay objetivo, cuánto falta. Es una señal, no una nota.
export function progresoTempo(ctx, clave) {
  const intentos = ctx.eventos
    .filter(ev => ev.tipo === 'practica' && ev.tempo > 0 && claveDe(ev) === clave)
    .sort((a, b) => a.t.localeCompare(b.t))
    .map(ev => ({ fecha: ev.t.slice(0, 10), tempo: ev.tempo, bien: Object.values(ev.calidad || {}).length > 0 && Object.values(ev.calidad).every(v => v === 'bien') }));
  const ultimo = intentos.at(-1)?.tempo ?? null;
  const validos = intentos.filter(x => x.bien).map(x => x.tempo);
  return { intentos, ultimo, mejorValido: validos.length ? Math.max(...validos) : null };
}

export function textoTempo(t) {
  if (!t.objetivo && !t.actual) return t.motivo;
  const partes = [];
  if (t.objetivo) partes.push(`Objetivo ${t.unidad}=${t.objetivo}`);
  if (t.actual) partes.push(`último apuntado ${t.actual}`);
  if (t.mejor && t.mejor !== t.actual) partes.push(`mejor limpio ${t.mejor}`);
  if (t.objetivo && t.mejor) partes.push(`${Math.round((100 * t.mejor) / t.objetivo)} % del objetivo`);
  return `${partes.join(' · ')}. ${t.obligatorio ? 'Este tempo cuenta para dominarlo.' : 'El tempo orienta y se apunta para ver cómo sube; no decide si está bien.'}`;
}
