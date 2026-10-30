// El contenido enriquecido de un paso es una lista de bloques: el contenido decide cuáles y en qué orden, sin plantilla.
// Aquí están los tipos que existen y lo que se comprueba de cada uno; los dibuja web/componentes/bloques.js.
//   texto {md} · concepto {titulo, md} · pasos {titulo, items} · lista {titulo, items} · errores {items:[{error, arreglo}]}
//   bien {items}: cómo saber que está bien · reaparece {items:[{paso, texto}]} · guia {tipo, md}
//   mastil {escena} · acordes {nombres} · anatomia {acorde, clave} · tabla {cabecera, filas} · grados {clave, marcar, patron} · dedos {mano}
//   notacion {fuente, titulo, principal, motivo, compases, bpms, notas:[md]} · escuchar {items:[{etiqueta, notas|acorde|acordes, arpegiado}]}
//   ejercicio {que, porque, atencion, empieza, sube} · progresion {acordes:[{n, g, papel}], bpms} · pista {fuente, compases, bpm, etiquetas}
//   metronomo {clave, bpm, abierto} · preguntas {n} · obra {id, md}
//   pentagrama {notacion, pie} · figura {src, alt, pie}: un esquema de web/figuras/ (solo si enseña lo que el texto no puede)
//   Comprobaciones: localizar {conjunto | objetivos, cuerdas, hastaTraste} · elige {opciones, correcta, porque, audio, notacion}
//   ordenar {items, barajadas} · completar {partes} · bien {items}
// Un paso es { bloques } o, si necesita ir por partes, { pantallas: [{ titulo, bloques }] }.
import { ACORDES } from './acordes.js';
import { validarEscena } from './guitarra.js';

export const TIPOS_BLOQUE = ['texto', 'concepto', 'pasos', 'lista', 'errores', 'bien', 'reaparece', 'guia', 'mastil', 'acordes', 'anatomia', 'tabla',
  'localizar', 'elige', 'ordenar', 'completar', 'grados', 'dedos', 'ejercicio', 'progresion', 'notacion', 'pentagrama', 'escuchar', 'pista', 'metronomo', 'preguntas', 'obra', 'figura'];

// Todos los bloques de un paso, sea cual sea su forma.
export const bloquesDe = def => (def.pantallas ? def.pantallas.flatMap(p => p.bloques) : def.bloques ?? []);
// Lo que comprueba si se ha entendido, para exigir que antes se haya enseñado.
export const COMPRUEBAN = new Set(['preguntas', 'elige', 'ordenar', 'completar', 'localizar']);

// Las referencias a compases que no estén en la notación del paso son un error: la explicación señalaría al vacío.
const COMPAS = /\{c:(\d+)(?:-(\d+))?\}/g;
const textosDe = b => [b.md, b.titulo, b.enunciado, b.final, b.que, b.porque, b.atencion, b.empieza, b.sube, b.pista, ...(b.items ?? []).flatMap(x => (typeof x === 'string' ? [x] : [x.error, x.arreglo, x.texto])), ...(b.notas ?? []).filter(x => typeof x === 'string')].filter(Boolean);

export function validarPaso(id, def, { pasos, obras, notaciones, preguntas }) {
  const err = [];
  if (!pasos.has(id)) err.push(`${id}: ese paso no existe`);
  const todos = bloquesDe(def);
  if (!todos.length) return [...err, `${id}: sin bloques`];
  const fuentes = todos.filter(b => b.tipo === 'notacion').map(b => b.fuente);
  todos.forEach((b, i) => {
    const donde = `${id}, bloque ${i + 1} (${b.tipo})`;
    if (!TIPOS_BLOQUE.includes(b.tipo)) return err.push(`${donde}: tipo desconocido`);
    if (b.tipo === 'mastil') err.push(...validarEscena(b.escena).map(e => `${donde}: ${e}`));
    if (b.tipo === 'acordes') for (const n of b.nombres) if (!ACORDES[n]) err.push(`${donde}: acorde ${n}`);
    if (b.tipo === 'anatomia' && !ACORDES[b.acorde]) err.push(`${donde}: acorde ${b.acorde}`);
    if ((b.tipo === 'notacion' || b.tipo === 'pista') && !notaciones.has(b.fuente)) err.push(`${donde}: no existe ${b.fuente}`);
    if (b.tipo === 'reaparece') for (const x of b.items) if (!pasos.has(x.paso)) err.push(`${donde}: no existe el paso ${x.paso}`);
    if (b.tipo === 'figura' && !b.alt) err.push(`${donde}: un esquema necesita su descripción`);
    if (b.tipo === 'obra' && !obras.has(b.id)) err.push(`${donde}: no existe la obra ${b.id}`);
    if (b.tipo === 'preguntas' && !preguntas.has(id)) err.push(`${donde}: este paso no tiene preguntas calculadas`);
    if (b.tipo === 'localizar' && !b.objetivos?.length && !b.conjunto?.length) err.push(`${donde}: sin notas que encontrar`);
    if (b.tipo === 'elige' && !(b.correcta >= 0 && b.correcta < (b.opciones?.length ?? 0))) err.push(`${donde}: la respuesta correcta no está entre las opciones`);
    if (b.tipo === 'ordenar' && !(b.items?.length > 1)) err.push(`${donde}: nada que ordenar`);
    if (b.tipo === 'completar' && !b.partes?.some(x => typeof x !== 'string' && x.opciones?.includes(x.correcta))) err.push(`${donde}: un hueco sin su respuesta`);
    if (b.tipo === 'progresion') for (const a of b.acordes ?? []) if (!ACORDES[a.n]) err.push(`${donde}: acorde ${a.n}`);
    for (const t of textosDe(b)) {
      for (const m of t.matchAll(COMPAS)) {
        const total = notaciones.get(b.tipo === 'notacion' ? b.fuente : fuentes[0])?.compases?.length ?? 0;
        if (!total) err.push(`${donde}: cita el compás ${m[1]} y el paso no tiene notación`);
        else if (Number(m[2] ?? m[1]) > total) err.push(`${donde}: cita el compás ${m[2] ?? m[1]} y la notación tiene ${total}`);
      }
    }
  });
  return err;
}
