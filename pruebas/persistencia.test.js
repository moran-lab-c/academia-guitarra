// Fase 2.1, punto 11: una importación (o migración) es atómica para él, y con los datos en error no se escribe nada.
// Cada prueba usa su propia carpeta temporal y su propio servidor (nunca sus datos).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { crearServidor } from '../servidor/servidor.js';
import { mes } from '../logica/fechas.js';
import { ESQUEMA } from '../logica/esquema.js';

const CAB = { 'Content-Type': 'application/json', 'x-academia': '1' };
const evento = (id, t = new Date().toISOString()) => ({ id, t, tipo: 'practica', item: 'obra:tarrega.lagrima', min: 10, pasadas: 1, calidad: { precision: 'bien' } });

async function conServidor(dir, opciones, fn) {
  const { servidor } = crearServidor({ datos: dir, ...opciones });
  await new Promise(ok => servidor.listen(0, '127.0.0.1', ok));
  const base = `http://127.0.0.1:${servidor.address().port}`;
  const pedir = (ruta, op = {}) => fetch(base + ruta, { ...op, headers: { ...CAB, ...op.headers } });
  try { return await fn(pedir); } finally { await new Promise(ok => servidor.close(ok)); }
}
const carpeta = () => fs.mkdtempSync(path.join(os.tmpdir(), 'academia-persistencia-'));
const leerTodo = dir => Object.fromEntries(fs.readdirSync(path.join(dir, 'historial')).map(f => [f, fs.readFileSync(path.join(dir, 'historial', f), 'utf8')]));

test('una importación que falla a medias no deja nada a medias: estado e historial siguen como estaban', async () => {
  const dir = carpeta();
  try {
    // Datos de partida: un estado guardado y dos eventos.
    await conServidor(dir, {}, async pedir => {
      const { rev, estado } = await (await pedir('/api/estado')).json();
      await pedir('/api/estado', { method: 'PUT', body: JSON.stringify({ rev, estado: { ...estado, perfil: { nombre: 'antes' } } }) });
      await pedir('/api/eventos', { method: 'POST', body: JSON.stringify({ eventos: [evento('a'), evento('b')] }) });
    });
    const estadoAntes = fs.readFileSync(path.join(dir, 'estado.json'), 'utf8');
    const historialAntes = leerTodo(dir);
    const paquete = { formato: 'academia-guitarra', esquema: ESQUEMA, estado: { ...JSON.parse(estadoAntes).estado, perfil: { nombre: 'importado' } }, eventos: [evento('x')] };
    // En cada uno de los pasos del cambio, el fallo se deshace sin pasos manuales.
    for (const paso of ['apartar', 'historial', 'estado']) {
      await conServidor(dir, { alPaso: p => { if (p === paso) throw new Error(`fallo simulado en «${p}»`); } }, async pedir => {
        const r = await pedir('/api/importar', { method: 'POST', body: JSON.stringify(paquete) });
        assert.equal(r.status, 500, paso);
        assert.match((await r.json()).error, /No se ha cambiado nada/);
        assert.equal(fs.readFileSync(path.join(dir, 'estado.json'), 'utf8'), estadoAntes, paso);
        assert.deepEqual(leerTodo(dir), historialAntes, paso);
        assert.ok(!fs.existsSync(path.join(dir, 'importando.json')) && !fs.existsSync(path.join(dir, 'historial.nuevo')) && !fs.existsSync(path.join(dir, 'estado.json.nuevo')), paso);
        // Y la app sigue funcionando con lo de antes.
        assert.equal((await (await pedir('/api/estado')).json()).estado.perfil.nombre, 'antes');
        assert.deepEqual((await (await pedir('/api/eventos')).json()).eventos.map(e => e.id).sort(), ['a', 'b']);
      });
    }
    // Sin fallos, la misma importación se aplica entera.
    await conServidor(dir, {}, async pedir => {
      assert.equal((await pedir('/api/importar', { method: 'POST', body: JSON.stringify(paquete) })).status, 200);
      assert.equal((await (await pedir('/api/estado')).json()).estado.perfil.nombre, 'importado');
      assert.deepEqual((await (await pedir('/api/eventos')).json()).eventos.map(e => e.id), ['x']);
    });
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('si se corta la luz a mitad de una importación, al arrancar vuelve lo de antes (o se queda lo nuevo si ya había terminado)', async () => {
  const dir = carpeta();
  try {
    await conServidor(dir, {}, async pedir => {
      await pedir('/api/eventos', { method: 'POST', body: JSON.stringify({ eventos: [evento('viejo')] }) });
    });
    const estadoAntes = fs.readFileSync(path.join(dir, 'estado.json'), 'utf8');
    const historialAntes = leerTodo(dir);
    // Lo que quedaría en disco si el corte llega justo después de apartar el historial: el viejo en copias/, el nuevo
    // preparado al lado, el estado nuevo sin poner y el diario en «cambiando».
    const apartado = 'historial-antes-de-importar-corte';
    fs.renameSync(path.join(dir, 'historial'), path.join(dir, 'copias', apartado));
    fs.mkdirSync(path.join(dir, 'historial.nuevo'));
    fs.writeFileSync(path.join(dir, 'historial.nuevo', `${mes(new Date().toISOString())}.jsonl`), JSON.stringify(evento('nuevo')) + '\n');
    fs.writeFileSync(path.join(dir, 'estado.json.nuevo'), '{"rev":9,"estado":{}}');
    fs.writeFileSync(path.join(dir, 'importando.json'), JSON.stringify({ fase: 'cambiando', apartado }));
    await conServidor(dir, {}, async pedir => {
      assert.equal(fs.readFileSync(path.join(dir, 'estado.json'), 'utf8'), estadoAntes);
      assert.deepEqual(leerTodo(dir), historialAntes);
      assert.deepEqual((await (await pedir('/api/eventos')).json()).eventos.map(e => e.id), ['viejo']);
      assert.ok(!fs.existsSync(path.join(dir, 'importando.json')));
      assert.ok(fs.readdirSync(path.join(dir, 'copias')).some(f => f.startsWith('historial-sin-importar-'))); // lo preparado no se borra
    });
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('con una migración fallida no se escribe nada nuevo: ni eventos ni estado, y la app los guarda para después', async () => {
  const dir = carpeta();
  try {
    fs.mkdirSync(path.join(dir, 'historial'), { recursive: true });
    const estado = JSON.stringify({ rev: 1, estado: { esquema: 1, perfil: {}, preferencias: {}, obras: {}, tareasProfesor: [], objetivos: [], focos: {}, contenidoPropio: { obras: [], ejercicios: [] } } });
    fs.writeFileSync(path.join(dir, 'estado.json'), estado);
    const historial = path.join(dir, 'historial', `${mes(new Date().toISOString())}.jsonl`);
    const lineas = JSON.stringify({ ...evento('viejo'), ayuda: 'partitura' }) + '\n'; // un dato antiguo que no valida
    fs.writeFileSync(historial, lineas);
    await conServidor(dir, {}, async pedir => {
      assert.equal((await pedir('/api/estado')).status, 500);
      const r = await pedir('/api/eventos', { method: 'POST', body: JSON.stringify({ eventos: [evento('nuevo')] }) });
      assert.equal(r.status, 503);
      assert.match((await r.json()).error, /No se guarda nada/);
      const p = await pedir('/api/estado', { method: 'PUT', body: JSON.stringify({ rev: 1, estado: JSON.parse(estado).estado }) });
      assert.equal(p.status, 500);
      assert.equal(fs.readFileSync(historial, 'utf8'), lineas);
      assert.equal(fs.readFileSync(path.join(dir, 'estado.json'), 'utf8'), estado);
    });
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
