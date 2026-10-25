// El servidor de verdad, sobre una carpeta de datos temporal (nunca la suya).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { crearServidor } from '../servidor/servidor.js';
import { mes } from '../logica/fechas.js';
import { ESQUEMA } from '../logica/esquema.js';

let dir, servidor, base;
const CAB = { 'Content-Type': 'application/json', 'x-academia': '1' };
const pedir = (ruta, op = {}) => fetch(base + ruta, { ...op, headers: { ...CAB, ...op.headers } });
const json = async (ruta, op) => (await pedir(ruta, op)).json();
const evento = (id, t = new Date().toISOString()) => ({ id, t, tipo: 'practica', item: 'obra:tarrega.lagrima', min: 10, pasadas: 1, calidad: { precision: 'bien', fraseo: 'fallos' }, formato: 'tablatura' });

function arrancar() {
  ({ servidor } = crearServidor({ datos: dir }));
  return new Promise(ok => servidor.listen(0, '127.0.0.1', () => { base = `http://127.0.0.1:${servidor.address().port}`; ok(); }));
}
const parar = () => new Promise(ok => servidor.close(ok));

before(async () => { dir = fs.mkdtempSync(path.join(os.tmpdir(), 'academia-prueba-')); await arrancar(); });
after(async () => { await parar(); fs.rmSync(dir, { recursive: true, force: true }); });

test('crea los datos la primera vez y sirve el catálogo sin errores', async () => {
  const { rev, estado } = await json('/api/estado');
  assert.equal(rev, 1);
  assert.equal(estado.esquema, ESQUEMA);
  for (const d of ['historial', 'copias', 'adjuntos']) assert.ok(fs.existsSync(path.join(dir, d)));
  const cat = await json('/api/catalogo');
  assert.deepEqual(cat.errores, []);
  assert.ok(cat.entidades.length > 50);
});

test('guarda el estado y avisa si otra ventana lo cambió antes (no pisa nada)', async () => {
  const { estado } = await json('/api/estado');
  estado.perfil.nombre = 'David';
  const r1 = await pedir('/api/estado', { method: 'PUT', body: JSON.stringify({ rev: 1, estado }) });
  assert.equal(r1.status, 200);
  assert.equal((await r1.json()).rev, 2);
  const r2 = await pedir('/api/estado', { method: 'PUT', body: JSON.stringify({ rev: 1, estado }) });
  assert.equal(r2.status, 409);
  assert.equal((await r2.json()).rev, 2);
  // un cambio hecho a mano en el archivo también cuenta como «otra ventana»
  const disco = JSON.parse(fs.readFileSync(path.join(dir, 'estado.json'), 'utf8'));
  disco.estado.perfil.guitarra = 'Yamaha C40';
  fs.writeFileSync(path.join(dir, 'estado.json'), JSON.stringify(disco));
  const r3 = await pedir('/api/estado', { method: 'PUT', body: JSON.stringify({ rev: 2, estado }) });
  assert.equal(r3.status, 409);
  assert.equal((await r3.json()).estado.perfil.guitarra, 'Yamaha C40');
  // y un estado mal formado no se guarda
  const r4 = await pedir('/api/estado', { method: 'PUT', body: JSON.stringify({ rev: 3, estado: { esquema: 1 } }) });
  assert.equal(r4.status, 400);
});

test('el historial solo crece, por meses, y no duplica un evento reenviado', async () => {
  assert.equal((await json('/api/eventos', { method: 'POST', body: JSON.stringify({ eventos: [evento('a1'), evento('a2')] }) })).anadidos, 2);
  assert.equal((await json('/api/eventos', { method: 'POST', body: JSON.stringify({ eventos: [evento('a2'), evento('a3')] }) })).anadidos, 1);
  const lineas = fs.readFileSync(path.join(dir, 'historial', `${mes(new Date())}.jsonl`), 'utf8').trim().split('\n');
  assert.equal(lineas.length, 3);
  assert.equal((await json('/api/eventos')).eventos.length, 3);
  const malo = await pedir('/api/eventos', { method: 'POST', body: JSON.stringify({ eventos: [{ id: 'x', tipo: 'inventado', t: 'ayer' }] }) });
  assert.equal(malo.status, 400);
});

test('los datos sobreviven a cerrar y volver a abrir el servidor', async () => {
  await parar();
  await arrancar();
  assert.equal((await json('/api/eventos')).eventos.length, 3);
  assert.equal((await json('/api/estado')).estado.perfil.nombre, 'David');
});

test('exportar, cambiar e importar devuelve exactamente lo exportado, y aparta lo anterior sin borrarlo', async () => {
  const exportado = await json('/api/exportar');
  assert.equal(exportado.formato, 'academia-guitarra');
  await pedir('/api/eventos', { method: 'POST', body: JSON.stringify({ eventos: [evento('b1')] }) });
  const simulado = await json('/api/importar?simular', { method: 'POST', body: JSON.stringify(exportado) });
  assert.equal(simulado.eventos, 3);
  assert.equal((await json('/api/eventos')).eventos.length, 4); // simular no toca nada
  const r = await pedir('/api/importar', { method: 'POST', body: JSON.stringify(exportado) });
  assert.equal(r.status, 200);
  const despues = await json('/api/exportar');
  assert.deepEqual(despues.estado, exportado.estado);
  assert.deepEqual(despues.eventos, exportado.eventos);
  const copias = fs.readdirSync(path.join(dir, 'copias'));
  assert.ok(copias.some(f => f.startsWith('antes-de-importar-') && f.endsWith('.json.gz')));
  assert.ok(copias.some(f => f.startsWith('historial-antes-de-importar-')));
  const noEsDeLaApp = await pedir('/api/importar', { method: 'POST', body: JSON.stringify({ hola: 1 }) });
  assert.equal(noEsDeLaApp.status, 400);
});

test('hace la copia del día y la del mes, y se puede restaurar una copia', async () => {
  const { copias } = await json('/api/copias');
  const hoy = new Date();
  assert.ok(copias.some(c => c.archivo === `dia-${String(hoy.getDate()).padStart(2, '0')}.json.gz`));
  assert.ok(copias.some(c => c.archivo === `mes-${mes(hoy)}.json.gz`));
  const { archivo } = await json('/api/copias', { method: 'POST' });
  const resumen = await json('/api/copias/restaurar', { method: 'POST', body: JSON.stringify({ archivo, simular: true }) });
  assert.equal(resumen.eventos, 3);
  const mal = await pedir('/api/copias/restaurar', { method: 'POST', body: JSON.stringify({ archivo: '../estado.json' }) });
  assert.equal(mal.status, 400);
});

test('guarda adjuntos con un nombre seguro', async () => {
  const r = await json('/api/adjuntos', { method: 'POST', headers: { 'x-nombre': encodeURIComponent('../Lágrima: partitura.pdf') }, body: 'PDF' });
  assert.ok(!r.archivo.includes('/') && !r.archivo.includes('..') && r.archivo.endsWith('Lágrima_ partitura.pdf'));
  assert.equal(await (await fetch(base + r.url)).text(), 'PDF');
});

test('solo responde a esta dirección, solo escribe con su cabecera y solo sirve sus carpetas', async () => {
  const sinCabecera = await fetch(base + '/api/eventos', { method: 'POST', body: '{}' });
  assert.equal(sinCabecera.status, 403);
  const otroHost = await new Promise(ok => http.get({ host: '127.0.0.1', port: servidor.address().port, path: '/api/estado', headers: { Host: 'malo.example:80' } }, ok));
  assert.equal(otroHost.statusCode, 403);
  assert.equal((await fetch(base + '/')).status, 200);
  assert.equal((await fetch(base + '/logica/fechas.js')).status, 200);
  assert.equal((await fetch(base + '/contenido/areas.json')).status, 404); // los datos van por /api/catalogo
  assert.equal((await fetch(base + '/contenido/notacion/esc-mi-mayor-1pos.json')).status, 200); // la notación, sí
  assert.equal((await fetch(base + '/servidor/almacen.js')).status, 404);
  assert.equal((await fetch(base + '/web/%2e%2e/servidor/almacen.js')).status, 404);
});

test('si estado.json se estropea, no se toca y se avisa', async () => {
  await parar();
  fs.writeFileSync(path.join(dir, 'estado.json'), '{ roto');
  await arrancar();
  const r = await pedir('/api/estado');
  assert.equal(r.status, 500);
  assert.match((await r.json()).error, /no se puede leer/);
  assert.equal(fs.readFileSync(path.join(dir, 'estado.json'), 'utf8'), '{ roto');
});

test('si la migración de los datos falla, arranca, avisa y no toca nada', async () => {
  await parar();
  const estado = JSON.stringify({ rev: 1, estado: { esquema: 1, perfil: {}, preferencias: { rutaPrincipal: 'clasica' }, obras: {}, tareasProfesor: [], objetivos: [], focos: {}, contenidoPropio: { obras: [], ejercicios: [] } } });
  fs.writeFileSync(path.join(dir, 'estado.json'), estado);
  const historial = path.join(dir, 'historial', `${mes(new Date().toISOString())}.jsonl`);
  const sesionVieja = { id: 'sesion-vieja', t: new Date().toISOString(), tipo: 'sesion', ruta: 'clasica', minutosPlan: 30, bloques: [] };
  const lineas = JSON.stringify(sesionVieja) + '\n' + JSON.stringify({ ...evento('viejo'), ayuda: 'partitura' }) + '\n';
  fs.writeFileSync(historial, lineas);
  await arrancar();
  const r = await pedir('/api/estado');
  assert.equal(r.status, 500);
  assert.match((await r.json()).error, /no se han podido pasar al esquema/);
  assert.equal(fs.readFileSync(path.join(dir, 'estado.json'), 'utf8'), estado);
  assert.equal(fs.readFileSync(historial, 'utf8'), lineas); // el historial, intacto en disco…
  const { eventos } = await json('/api/eventos');
  const s = eventos.find(e => e.id === 'sesion-vieja'); // …y en memoria: la migración a medias no cambió «ruta» por «programa»
  assert.equal(s.ruta, 'clasica');
  assert.equal(s.programa, undefined);
  assert.ok(fs.readdirSync(path.join(dir, 'copias')).some(f => f.startsWith('antes-de-migrar-1-a-')));
});
