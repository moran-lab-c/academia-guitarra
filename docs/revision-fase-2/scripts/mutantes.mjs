// Pruebas de mutación sobre una COPIA de la app (revision/mutantes/app): se rompe una regla a propósito y se mira si
// alguna prueba lo detecta. Uso: node mutantes.mjs
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const APP = path.join(path.dirname(fileURLToPath(import.meta.url)), 'mutantes', 'app');

const MUTANTES = [
  ['logica/ruta.js', "!NO_FRENAN.has(p.area)", "true", 'La lectura frena los tramos'],
  ['logica/ruta.js', "claves.every(k => solidez(k) >= 2) ? 'hecho'", "claves.every(k => solidez(k) >= 1) ? 'hecho'", 'El cierre del tramo no espera a la comprobación en frío'],
  ['logica/ruta.js', "if (!['obra', 'aplicacion'].includes(p.tipo) || HECHO.has(p.estado) || !p.obra) continue;", "continue;", 'No se inserta ningún refuerzo'],
  ['logica/ruta.js', "const k = ctx.estado.obras?.[obraId]?.conocida;", "const k = null;", 'Se ignora que ya conocía la obra'],
  ['logica/ruta.js', "else if ((p.requiere || []).every(", "else if (true || (p.requiere || []).every(", 'Se ignora «requiere» entre pasos'],
  ['logica/ruta.js', "const actual = principales.find(p => p.enCurso) ?? principales[0]", "const actual = principales.at(-1)", 'El paso actual es el último recomendado'],
  ['logica/planificador.js', "const pasoObra = enRuta.find(", "const pasoObra = [...enRuta].reverse().find(", 'La obra de la sesión es la última del tramo y no la primera'],
  ['logica/planificador.js', "const lectura = deTrabajo.slice(0, 2).some(p => p.area === 'lectura') ? null :", "const lectura =", 'Se añade lectura aunque ya entre un paso de lectura'],
  ['logica/planificador.js', "(deRuta ? criticas : demas).push(", "criticas.push(", 'Lo vencido de fuera de la ruta también es crítico'],
  ['logica/planificador.js', ".filter(t => !ctx.eventos.some(ev => ev.encargo === t.id && diasEntre(ev.t, ctx.hoy) === 0)) // ya hecho hoy", "", 'Un encargo ya hecho hoy vuelve a salir'],
  ['logica/planificador.js', "const TOPE_FRIO = minutos => (minutos >= 90 ? 6 : 4);", "const TOPE_FRIO = minutos => 40;", 'Sin tope de minutos para comprobaciones'],
  ['logica/planificador.js', "const PESO = { paso: 25, siguiente: 15, obra: 35, refuerzo: 18, lectura: 12, estudio: 25 };", "const PESO = { paso: 5, siguiente: 15, obra: 80, refuerzo: 18, lectura: 12, estudio: 25 };", 'Pesos muy distintos (decisión suya: no debería romper pruebas)'],
  ['logica/planificador.js', "if (c && !c.claves.some(x => reservados.has(x))) anadir({ ...c, prioridad: i === 0 ? 3 : 5, peso: PESO.refuerzo });", "", 'El planificador ignora los refuerzos'],
  ['servidor/almacen.js', "if (errorEstado || (doc.estado.esquema ?? 1) >= ESQUEMA) return;", "return;", 'No migra los datos viejos'],
  ['servidor/almacen.js', "const copia = hacerCopia(`antes-de-migrar-${doc.estado.esquema ?? 1}-a-${ESQUEMA}`);", "const copia = 'ninguna';", 'Migra sin copia previa'],
  ['logica/ruta.js', "const hecha = estaHecho(ctx.estadoDe(obra.id));", "const hecha = false;", 'La obra final nunca se da por hecha'],
];

const resultados = [];
for (const [archivo, buscar, poner, nombre] of MUTANTES) {
  const p = path.join(APP, archivo);
  const original = fs.readFileSync(p, 'utf8');
  if (!original.includes(buscar)) { resultados.push(`?? ${nombre}: no se encontró el texto`); continue; }
  fs.writeFileSync(p, original.replace(buscar, poner));
  let salida = '';
  try { salida = execFileSync(process.execPath, ['--test'], { cwd: APP, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }); } catch (e) { salida = (e.stdout || '') + (e.stderr || ''); }
  fs.writeFileSync(p, original);
  const fallan = salida.split('\n').filter(l => l.startsWith('✖') && !/^✖ failing tests/.test(l)).map(l => l.replace(/^✖ /, '').replace(/ \(\d.*$/, ''));
  const unicas = [...new Set(fallan)];
  resultados.push(`${unicas.length ? 'DETECTADO' : 'NO DETECTADO'} · ${nombre}${unicas.length ? ` → ${unicas.slice(0, 3).join(' | ')}${unicas.length > 3 ? ` (+${unicas.length - 3})` : ''}` : ''}`);
}
console.log(resultados.join('\n'));
