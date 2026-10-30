// El contenido enriquecido de un paso es una lista de bloques: el contenido decide cuáles y en qué orden, sin plantilla.
// Aquí están los tipos que existen y lo que se comprueba de cada uno; los dibuja web/componentes/bloques.js.
//   texto {md} · concepto {titulo, md} · pasos {titulo, items} · lista {titulo, items} · errores {items:[{error, arreglo}]}
//   bien {items}: cómo saber que está bien · reaparece {items:[{paso, texto}]} · resumen {md} · guia {tipo, md}
//   mastil {escena} · acordes {nombres} · anatomia {acorde, clave} · tabla {cabecera, filas} · actividadMastil {cuerda, trastes, clave, enunciado, final}
//   notacion {fuente, titulo, principal, motivo, compases, bpm, notas:[md]} · escuchar {items:[{etiqueta, notas|acordes, arpegiado}]}
//   pista {fuente, compases, bpm, etiquetas} · metronomo {clave, bpm} · preguntas {n} · obra {id, md}
import { ACORDES } from './acordes.js';
import { validarEscena } from './guitarra.js';

export const TIPOS_BLOQUE = ['texto', 'concepto', 'pasos', 'lista', 'errores', 'bien', 'reaparece', 'resumen', 'guia', 'mastil', 'acordes', 'anatomia', 'tabla',
  'actividadMastil', 'notacion', 'escuchar', 'pista', 'metronomo', 'preguntas', 'obra'];

// Las referencias a compases que no estén en la notación del paso son un error: la explicación señalaría al vacío.
const COMPAS = /\{c:(\d+)(?:-(\d+))?\}/g;
const textosDe = b => [b.md, b.titulo, b.enunciado, b.final, ...(b.items ?? []).flatMap(x => (typeof x === 'string' ? [x] : [x.error, x.arreglo, x.texto])), ...(b.notas ?? []).filter(x => typeof x === 'string')].filter(Boolean);

export function validarPaso(id, def, { pasos, obras, notaciones, preguntas }) {
  const err = [];
  if (!pasos.has(id)) err.push(`${id}: ese paso no existe`);
  if (!Array.isArray(def.bloques) || !def.bloques.length) return [...err, `${id}: sin bloques`];
  const fuentes = def.bloques.filter(b => b.tipo === 'notacion').map(b => b.fuente);
  def.bloques.forEach((b, i) => {
    const donde = `${id}, bloque ${i + 1} (${b.tipo})`;
    if (!TIPOS_BLOQUE.includes(b.tipo)) return err.push(`${donde}: tipo desconocido`);
    if (b.tipo === 'mastil') err.push(...validarEscena(b.escena).map(e => `${donde}: ${e}`));
    if (b.tipo === 'acordes') for (const n of b.nombres) if (!ACORDES[n]) err.push(`${donde}: acorde ${n}`);
    if (b.tipo === 'anatomia' && !ACORDES[b.acorde]) err.push(`${donde}: acorde ${b.acorde}`);
    if ((b.tipo === 'notacion' || b.tipo === 'pista') && !notaciones.has(b.fuente)) err.push(`${donde}: no existe ${b.fuente}`);
    if (b.tipo === 'reaparece') for (const x of b.items) if (!pasos.has(x.paso)) err.push(`${donde}: no existe el paso ${x.paso}`);
    if (b.tipo === 'obra' && !obras.has(b.id)) err.push(`${donde}: no existe la obra ${b.id}`);
    if (b.tipo === 'preguntas' && !preguntas.has(id)) err.push(`${donde}: este paso no tiene preguntas calculadas`);
    if (b.tipo === 'actividadMastil' && !(b.trastes?.length && b.cuerda >= 1 && b.cuerda <= 6)) err.push(`${donde}: faltan la cuerda o los trastes`);
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
