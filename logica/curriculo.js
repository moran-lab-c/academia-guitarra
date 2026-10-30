// El recorrido del currículo aprobado (V3.1): Nivel → Tramo → Lección → Paso. Sabe dónde está el alumno, qué hace
// «Continuar», cuánto lleva y qué toca repasar. Lógica pura: los datos salen de contenido/curriculo/clasica.json y el
// progreso, de estado.curriculo:
//   { nivel, posicion: id del paso, pasos: { id: { e: 'hecho'|'practica', t: día } }, repasos: { id: { n, prox } }, seguidos }
import { dia } from './fechas.js';

// Los días que pasan hasta volver a ver lo aprendido [Decisión, los mismos que el dominio]. El alumno solo ve «Para repasar».
export const INTERVALOS = [3, 7, 21, 45, 90];
export const MAX_REPASOS_SEGUIDOS = 2;

// Los tipos de paso que se tocan: terminan con «Lo he aprendido» o «Sigo practicando». Los demás, con «Continuar».
const DE_PRACTICA = new Set(['Ejercicio', 'Obra', 'Lectura', 'Primera vista', 'Ritmo', 'Solfeo', 'Progresión', 'Acordes', 'Aplicación', 'Cómo se hace',
  'Técnica', 'Repaso', 'Comprobación del tramo', 'Digitación', '◇', 'Obra conocida', 'Nota']);
export const esDePractica = paso => DE_PRACTICA.has(paso.tipo);
// Lo que vuelve después como repaso: lo que se toca de verdad y tiene nombre.
const seRepasa = paso => (paso.tipo === 'Obra' && paso.obra) || (paso.tipo === 'Ejercicio' && paso.ejercicios?.length);

// El índice de los datos: los pasos en orden y por id.
export function indexarCurriculo(datos) {
  const pasos = [], porId = new Map(), lecciones = new Map();
  for (const nivel of datos.niveles) for (const tramo of nivel.tramos) for (const leccion of tramo.lecciones) {
    lecciones.set(leccion.id, { nivel, tramo, leccion });
    leccion.pasos.forEach((paso, i) => {
      const e = { paso, leccion, tramo, nivel, indice: pasos.length, enLeccion: i };
      pasos.push(e);
      porId.set(paso.id, e);
    });
  }
  return { ...datos, pasos, porId, lecciones, obraPorId: new Map(datos.obras.map(o => [o.id, o])) };
}

export const progresoVacio = () => ({ nivel: 1, posicion: null, pasos: {}, repasos: {}, seguidos: 0 });
const de = cur => cur ?? progresoVacio();
const pasado = (cur, id) => !!de(cur).pasos?.[id];

const delNivel = (ind, n) => ind.pasos.filter(e => e.nivel.numero === n);

// El nivel en el que está: el que dijo por última vez o el primero.
export const nivelActual = (ind, cur) => ind.niveles.find(n => n.numero === de(cur).nivel) ?? ind.niveles[0];

// El primer paso sin hacer de un nivel a partir de un punto; si no queda ninguno detrás, vuelve al principio del nivel.
function siguienteSinHacer(ind, cur, n, desde = -1) {
  const pasos = delNivel(ind, n);
  return pasos.find(e => e.indice > desde && !pasado(cur, e.paso.id)) ?? pasos.find(e => !pasado(cur, e.paso.id)) ?? null;
}

// Lo que toca repasar hoy, lo más antiguo primero.
export function paraRepasar(ind, cur, hoy = dia(new Date())) {
  return Object.entries(de(cur).repasos ?? {})
    .filter(([id, r]) => r.prox <= hoy && ind.porId.has(id))
    .sort((a, b) => a[1].prox.localeCompare(b[1].prox) || ind.porId.get(a[0]).indice - ind.porId.get(b[0]).indice)
    .map(([id]) => ind.porId.get(id));
}

// Qué hace el botón principal. Devuelve { accion: 'paso'|'repaso'|'siguiente-nivel'|'fin', entrada, etiqueta, nivel }.
export function continuar(ind, curso, hoy = dia(new Date())) {
  const cur = de(curso);
  const nivel = nivelActual(ind, cur);
  const pos = cur.posicion ? ind.porId.get(cur.posicion) : null;
  // A mitad: el paso exacto donde lo dejó.
  if (pos && pos.nivel.numero === nivel.numero && !pasado(cur, pos.paso.id)) return { accion: 'paso', entrada: pos, etiqueta: 'Continuar', nivel };
  const proximo = siguienteSinHacer(ind, cur, nivel.numero, pos && pos.nivel.numero === nivel.numero ? pos.indice : -1);
  // Los repasos se intercalan entre lecciones, nunca a mitad de una, y como mucho dos seguidos.
  const entreLecciones = !proximo || proximo.enLeccion === 0;
  if (entreLecciones && (cur.seguidos ?? 0) < MAX_REPASOS_SEGUIDOS) {
    const [repaso] = paraRepasar(ind, cur, hoy);
    if (repaso) return { accion: 'repaso', entrada: repaso, etiqueta: 'Continuar', nivel };
  }
  if (proximo) {
    const empezado = delNivel(ind, nivel.numero).some(e => pasado(cur, e.paso.id));
    return { accion: 'paso', entrada: proximo, etiqueta: empezado ? 'Continuar' : 'Comenzar', nivel };
  }
  const otro = ind.niveles.find(n => n.numero === nivel.numero + 1);
  return otro ? { accion: 'siguiente-nivel', entrada: null, etiqueta: `Empezar el nivel ${otro.numero}`, nivel, otro } : { accion: 'fin', entrada: null, etiqueta: null, nivel };
}

// Abrir un paso: desde aquí sigue «Continuar».
export function abrir(cur, entrada) {
  cur.posicion = entrada.paso.id;
  cur.nivel = entrada.nivel.numero;
}

// resultado: 'hecho' (Lo he aprendido, o Continuar en un paso de leer) o 'practica' (Sigo practicando).
export function marcar(cur, entrada, resultado, hoy = dia(new Date())) {
  const id = entrada.paso.id;
  (cur.pasos ??= {})[id] = { e: resultado, t: hoy };
  cur.posicion = id;
  cur.nivel = entrada.nivel.numero;
  cur.seguidos = 0;
  if (resultado === 'hecho' && seRepasa(entrada.paso) && !cur.repasos?.[id]) (cur.repasos ??= {})[id] = { n: 0, prox: sumarDias(hoy, INTERVALOS[0]) };
}

// «Bien · Regular · No salió». Bien lo aleja, Regular lo deja igual y No salió lo vuelve a poner en práctica.
export function responderRepaso(cur, entrada, respuesta, hoy = dia(new Date())) {
  const id = entrada.paso.id;
  const r = (cur.repasos ??= {})[id] ?? { n: 0, prox: hoy };
  cur.seguidos = (cur.seguidos ?? 0) + 1;
  if (respuesta === 'bien') {
    const n = r.n + 1;
    if (n >= INTERVALOS.length) delete cur.repasos[id];
    else cur.repasos[id] = { n, prox: sumarDias(hoy, INTERVALOS[n]) };
  } else if (respuesta === 'regular') {
    cur.repasos[id] = { n: r.n, prox: sumarDias(hoy, INTERVALOS[r.n]) };
  } else {
    cur.repasos[id] = { n: 0, prox: sumarDias(hoy, INTERVALOS[0]) };
    (cur.pasos ??= {})[id] = { e: 'practica', t: hoy };
  }
}

// Empezar otro nivel a mano (sin bloquear nada: todo se puede abrir).
export function cambiarNivel(cur, n) {
  cur.nivel = n;
  cur.posicion = null;
}

// Cuánto lleva de un nivel: lo que ve el alumno y nada más.
export function resumenNivel(ind, curso, n) {
  const cur = de(curso);
  const pasos = delNivel(ind, n);
  const hechos = pasos.filter(e => cur.pasos?.[e.paso.id]?.e === 'hecho').length;
  const enPractica = pasos.filter(e => cur.pasos?.[e.paso.id]?.e === 'practica').length;
  const nivel = ind.niveles.find(x => x.numero === n);
  const estadoLeccion = l => {
    const ids = l.pasos.map(p => cur.pasos?.[p.id]?.e);
    if (ids.every(Boolean)) return ids.includes('practica') ? 'practica' : 'hecho';
    return ids.some(Boolean) ? 'empezada' : 'nueva';
  };
  const tramos = nivel.tramos.map(t => {
    const lecciones = t.lecciones.map(l => ({ ...l, estado: estadoLeccion(l) }));
    return { ...t, lecciones, hecho: lecciones.every(l => l.estado === 'hecho' || l.estado === 'practica') };
  });
  return { total: pasos.length, hechos, enPractica, porcentaje: pasos.length ? Math.round(((hechos + enPractica) / pasos.length) * 100) : 0, tramos };
}

// Las obras del nivel que están ahora en el atril (en práctica): como mucho tres, las últimas.
export function enElAtril(ind, curso, limite = 3) {
  const cur = de(curso);
  const vistas = new Set();
  const lista = [];
  for (const [id, x] of Object.entries(cur.pasos ?? {}).filter(([, x]) => x.e === 'practica').sort((a, b) => b[1].t.localeCompare(a[1].t))) {
    const e = ind.porId.get(id);
    const clave = e?.paso.obra ?? e?.paso.ejercicios?.[0];
    if (!e || !clave || vistas.has(clave)) continue;
    vistas.add(clave);
    lista.push(e);
    if (lista.length === limite) break;
    void x;
  }
  return lista;
}

// Los pasos de una obra y cuántos lleva hechos.
export function progresoObra(ind, curso, obraId) {
  const cur = de(curso);
  const pasos = ind.pasos.filter(e => e.paso.obra === obraId);
  const hechos = pasos.filter(e => cur.pasos?.[e.paso.id]).length;
  return { pasos, hechos, total: pasos.length, porcentaje: pasos.length ? Math.round((hechos / pasos.length) * 100) : 0 };
}

function sumarDias(fecha, n) {
  const [a, m, d] = fecha.split('-').map(Number);
  return dia(new Date(a, m - 1, d + n));
}

// Validación de estado.curriculo (la usa esquema.js).
export function validarCurriculo(c) {
  const err = [];
  const obj = x => x !== null && typeof x === 'object' && !Array.isArray(x);
  if (!obj(c)) return ['«curriculo» debe ser un objeto'];
  if (c.pasos != null && (!obj(c.pasos) || Object.values(c.pasos).some(x => !obj(x) || !['hecho', 'practica'].includes(x.e)))) err.push('curriculo.pasos: cada paso es hecho o practica');
  if (c.repasos != null && (!obj(c.repasos) || Object.values(c.repasos).some(x => !obj(x) || !Number.isInteger(x.n) || typeof x.prox !== 'string'))) err.push('curriculo.repasos mal formado');
  if (c.nivel != null && !Number.isInteger(c.nivel)) err.push('curriculo.nivel debe ser un número');
  return err;
}
