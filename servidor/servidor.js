// Servidor de la academia: sirve la app y guarda los datos en la carpeta datos/ (ver almacen.js).
// Solo escucha en 127.0.0.1, así que únicamente se ve desde este ordenador. Sin dependencias.
// Uso: node servidor/servidor.js [--abrir]   (--abrir: abre la app en una ventana de Brave)
// Variables: ACADEMIA_PUERTO (7421) y ACADEMIA_DATOS (../datos), para las pruebas.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { crearAlmacen, ErrorUsuario, ErrorBloqueado } from './almacen.js';
import { cargarContenido, cargarCurriculo } from './catalogo.js';
import { ESQUEMA } from '../logica/esquema.js';
import { dia } from '../logica/fechas.js';

const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.md': 'text/markdown; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webmanifest': 'application/manifest+json', '.pdf': 'application/pdf',
  '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg', '.webm': 'audio/webm', '.m4a': 'audio/mp4', '.txt': 'text/plain; charset=utf-8',
};
// Lo único que se sirve tal cual; de contenido/, los textos largos (.md) y la notación (contenido/notacion/*.json):
// el resto de los datos va por /api/catalogo.
const ESTATICOS = { web: null, logica: ['.js'], contenido: ['.md', '.json'] };
const MB = 1024 * 1024;

export function crearServidor({ datos, alPaso }) {
  const almacen = crearAlmacen(datos, { alPaso });
  const servidor = http.createServer(async (req, res) => {
    try {
      // Solo peticiones dirigidas a esta dirección (evita que una web ajena llegue por DNS rebinding).
      const puerto = servidor.address().port;
      if (![`127.0.0.1:${puerto}`, `localhost:${puerto}`].includes(req.headers.host)) return fin(res, 403);
      const url = new URL(req.url, `http://127.0.0.1:${puerto}`);
      if (url.pathname.startsWith('/api/')) {
        // La cabecera propia obliga al navegador a pedir permiso antes de una escritura desde otra web, y aquí nunca se da.
        if (req.method !== 'GET' && req.headers['x-academia'] !== '1') return fin(res, 403);
        return await api(req, res, url, almacen);
      }
      if (url.pathname.startsWith('/adjuntos/') && req.method === 'GET') return servir(res, almacen.rutaAdjunto(decodeURIComponent(url.pathname.slice(10))));
      if (req.method !== 'GET') return fin(res, 405);
      return servirEstatico(res, decodeURIComponent(url.pathname));
    } catch (e) {
      const codigo = e instanceof ErrorUsuario ? 400 : e instanceof ErrorBloqueado ? 503 : 500;
      if (codigo === 500) console.error(e);
      json(res, codigo, { error: e.message });
    }
  });
  return { servidor, almacen };
}

async function api(req, res, url, almacen) {
  const clave = `${req.method} ${url.pathname}`;
  switch (clave) {
    case 'GET /api/salud': return json(res, 200, { ok: true, esquema: ESQUEMA, datos: almacen.dir });
    case 'GET /api/catalogo': return json(res, 200, cargarContenido(path.join(APP, 'contenido')));
    case 'GET /api/curriculo': return json(res, 200, cargarCurriculo(path.join(APP, 'contenido')));
    case 'GET /api/estado': return json(res, 200, almacen.leerEstado());
    case 'PUT /api/estado': {
      const { rev, estado } = await cuerpoJSON(req);
      const r = almacen.guardarEstado(rev, estado);
      return r.conflicto ? json(res, 409, { rev: r.rev, estado: r.estado }) : json(res, 200, r);
    }
    case 'GET /api/eventos': return json(res, 200, { eventos: almacen.leerEventos() });
    case 'POST /api/eventos': return json(res, 200, almacen.anadirEventos((await cuerpoJSON(req)).eventos));
    case 'GET /api/exportar': {
      res.setHeader('Content-Disposition', `attachment; filename="academia-guitarra-${dia(new Date())}.json"`);
      return json(res, 200, almacen.exportar());
    }
    case 'POST /api/importar': return json(res, 200, almacen.importar(await cuerpoJSON(req, 50 * MB), { simular: url.searchParams.has('simular') }));
    case 'GET /api/copias': return json(res, 200, { copias: almacen.listarCopias() });
    case 'POST /api/copias': return json(res, 200, { archivo: almacen.hacerCopia(`manual-${new Date().toISOString().replace(/[:.]/g, '-')}`) });
    case 'POST /api/copias/restaurar': {
      const { archivo, simular } = await cuerpoJSON(req);
      return json(res, 200, almacen.importar(almacen.leerCopia(archivo), { simular: !!simular }));
    }
    case 'POST /api/adjuntos': {
      const nombre = decodeURIComponent(req.headers['x-nombre'] || 'archivo');
      return json(res, 200, almacen.guardarAdjunto(nombre, await cuerpo(req, 200 * MB)));
    }
  }
  return json(res, 404, { error: 'No existe' });
}

function servirEstatico(res, ruta) {
  if (ruta === '/') ruta = '/web/index.html';
  if (ruta === '/manifest.webmanifest') ruta = '/web/manifest.webmanifest';
  const [, carpeta] = ruta.split('/');
  if (!(carpeta in ESTATICOS)) return fin(res, 404);
  const p = path.resolve(APP, '.' + ruta);
  const raiz = path.join(APP, carpeta) + path.sep;
  const permitidas = ESTATICOS[carpeta];
  if (!p.startsWith(raiz) || (permitidas && !permitidas.includes(path.extname(p)))) return fin(res, 404);
  if (carpeta === 'contenido' && path.extname(p) === '.json' && !p.startsWith(path.join(APP, 'contenido', 'notacion') + path.sep)) return fin(res, 404);
  return servir(res, p);
}

function servir(res, p) {
  if (!p || !TIPOS[path.extname(p).toLowerCase()]) return fin(res, 404);
  fs.readFile(p, (err, datos) => {
    if (err) return fin(res, 404);
    res.writeHead(200, { 'Content-Type': TIPOS[path.extname(p).toLowerCase()], 'Cache-Control': 'no-store' });
    res.end(datos);
  });
}

function cuerpo(req, limite = 5 * MB) {
  return new Promise((resolver, rechazar) => {
    const trozos = [];
    let total = 0;
    req.on('data', t => {
      total += t.length;
      if (total > limite) { rechazar(new ErrorUsuario('Demasiado grande')); req.destroy(); } else trozos.push(t);
    });
    req.on('end', () => resolver(Buffer.concat(trozos)));
    req.on('error', rechazar);
  });
}

async function cuerpoJSON(req, limite) {
  try { return JSON.parse((await cuerpo(req, limite)).toString('utf8')); } catch (e) {
    throw e instanceof ErrorUsuario ? e : new ErrorUsuario('El cuerpo no es JSON válido');
  }
}

function json(res, codigo, datos) {
  res.writeHead(codigo, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(datos));
}

function fin(res, codigo) { res.writeHead(codigo); res.end(); }

function abrirVentana(url) {
  const brave = path.join(process.env.LOCALAPPDATA || '', 'BraveSoftware', 'Brave-Browser', 'Application', 'brave.exe');
  const [orden, args] = fs.existsSync(brave) ? [brave, [`--app=${url}`]] : ['cmd', ['/c', 'start', '', url]];
  spawn(orden, args, { detached: true, stdio: 'ignore' }).unref();
}

// Arranque directo (no al importarlo desde las pruebas).
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const puerto = Number(process.env.ACADEMIA_PUERTO) || 7421;
  const datos = process.env.ACADEMIA_DATOS || path.join(APP, '..', 'datos');
  const url = `http://127.0.0.1:${puerto}/`;
  const abrir = process.argv.includes('--abrir');
  const yaEnMarcha = await fetch(url + 'api/salud', { signal: AbortSignal.timeout(800) }).then(r => r.ok, () => false);
  if (yaEnMarcha) {
    if (abrir) abrirVentana(url);
  } else {
    const { servidor } = crearServidor({ datos });
    servidor.listen(puerto, '127.0.0.1', () => {
      console.log(`Academia en ${url} · datos en ${datos}`);
      if (abrir) abrirVentana(url);
    });
  }
}
