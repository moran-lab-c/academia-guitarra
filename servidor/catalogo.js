// Lee el contenido (app/contenido/**/*.json) y lo valida. Añadir contenido = añadir un archivo.
import fs from 'node:fs';
import path from 'node:path';
import { tipoDe } from '../logica/catalogo.js';
import { validarCatalogo } from '../logica/validarCatalogo.js';
import { validarPartitura } from '../logica/notacion.js';

export function cargarContenido(dir) {
  const entidades = [], errores = [];
  for (const archivo of listar(dir)) {
    const rel = path.relative(dir, archivo).replaceAll('\\', '/');
    if (rel.startsWith('notacion/')) continue; // la notación se carga aparte, al abrir cada obra o ejercicio
    let datos;
    try { datos = JSON.parse(fs.readFileSync(archivo, 'utf8')); } catch (e) { errores.push(`${rel}: no es JSON válido (${e.message})`); continue; }
    const tipo = rel === 'areas.json' ? () => 'area' : e => tipoDe(e.id);
    for (const e of Array.isArray(datos) ? datos : [datos]) entidades.push({ ...e, tipo: tipo(e), archivo: rel });
  }
  errores.push(...validarCatalogo(entidades));
  // Cada notación propia tiene que existir y estar bien escrita.
  for (const e of entidades) for (const n of [e.notacion, ...(e.secciones || []).map(s => s.notacion)]) {
    if (!n?.fuente) continue;
    const p = path.join(dir, n.fuente);
    if (!/^notacion\/[\w.-]+\.json$/.test(n.fuente) || !fs.existsSync(p)) { errores.push(`${e.id}: no existe ${n.fuente}`); continue; }
    try { errores.push(...validarPartitura(JSON.parse(fs.readFileSync(p, 'utf8')), n.fuente)); } catch (x) { errores.push(`${n.fuente}: no es JSON válido (${x.message})`); }
  }
  return { entidades, errores };
}

function listar(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? listar(p) : e.name.endsWith('.json') ? [p] : [];
  }).sort();
}
