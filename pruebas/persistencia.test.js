// Fase 2.1, persistencia: una migración o importación es atómica para él, con los datos en error no se escribe nada y,
// tras reiniciar, todo vuelve a un estado coherente. Cada prueba usa su propia carpeta temporal y su propio servidor
// (nunca sus datos). Los cinco casos que pidió, uno por prueba, más el corte de luz a mitad de una importación.
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
const sinRestos = dir => !fs.existsSync(path.join(dir, 'importando.json')) && !fs.existsSync(path.join(dir, 'historial.nuevo')) && !fs.existsSync(path.join(dir, 'estado.json.nuevo'));

// Datos del esquema 1 con un evento antiguo que no pasa la validación del esquema 2 (la migración falla).
function datosQueNoMigran(dir) {
  fs.mkdirSync(path.join(dir, 'historial'), { recursive: true });
  const estado = JSON.stringify({ rev: 1, estado: { esquema: 1, perfil: {}, preferencias: { rutaPrincipal: 'clasica' }, obras: {}, tareasProfesor: [], objetivos: [], focos: {}, contenidoPropio: { obras: [], ejercicios: [] } } });
  fs.writeFileSync(path.join(dir, 'estado.json'), estado);
  const historial = path.join(dir, 'historial', `${mes(new Date().toISOString())}.jsonl`);
  const sesionVieja = { id: 'sesion-vieja', t: new Date().toISOString(), tipo: 'sesion', ruta: 'clasica', minutosPlan: 30, bloques: [] };
  const lineas = JSON.stringify(sesionVieja) + '\n' + JSON.stringify({ ...evento('viejo'), ayuda: 'partitura' }) + '\n';
  fs.writeFileSync(historial, lineas);
  return { estado, historial, lineas };
}

test('1 · migración fallida: los datos anteriores quedan intactos, en disco y en memoria, con su copia previa', async () => {
  const dir = carpeta();
  try {
    const { estado, historial, lineas } = datosQueNoMigran(dir);
    await conServidor(dir, {}, async pedir => {
      const r = await pedir('/api/estado');
      assert.equal(r.status, 500);
      assert.match((await r.json()).error, /no se han podido pasar al esquema/);
      assert.equal(fs.readFileSync(path.join(dir, 'estado.json'), 'utf8'), estado);
      assert.equal(fs.readFileSync(historial, 'utf8'), lineas);
      const { eventos } = await (await pedir('/api/eventos')).json();
      assert.equal(eventos.find(e => e.id === 'sesion-vieja').ruta, 'clasica'); // en memoria, sin migrar a medias
      assert.ok(fs.readdirSync(path.join(dir, 'copias')).some(f => f.startsWith('antes-de-migrar-1-a-')));
      assert.ok(sinRestos(dir));
    });
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('2 · migración fallida: no se escribe nada nuevo (ni eventos ni estado); la app lo guarda para después', async () => {
  const dir = carpeta();
  try {
    const { estado, historial, lineas } = datosQueNoMigran(dir);
    await conServidor(dir, {}, async pedir => {
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

test('3 · al reiniciar tras el fallo, todo sigue a salvo; y cuando el dato antiguo se corrige, la migración se completa entera', async () => {
  const dir = carpeta();
  try {
    const { estado, historial, lineas } = datosQueNoMigran(dir);
    await conServidor(dir, {}, async pedir => assert.equal((await pedir('/api/estado')).status, 500));
    // Reinicio sin cambiar nada: el mismo aviso, los mismos datos, ninguna escritura.
    await conServidor(dir, {}, async pedir => {
      assert.equal((await pedir('/api/estado')).status, 500);
      assert.equal((await pedir('/api/eventos', { method: 'POST', body: JSON.stringify({ eventos: [evento('otro')] }) })).status, 503);
      assert.equal(fs.readFileSync(path.join(dir, 'estado.json'), 'utf8'), estado);
      assert.equal(fs.readFileSync(historial, 'utf8'), lineas);
      assert.ok(sinRestos(dir));
    });
    // Se corrige el dato antiguo (p. ej., restaurando una copia buena o a mano) y se reinicia: migra entero.
    fs.writeFileSync(historial, lineas.replace('"ayuda":"partitura"', '"ayuda":"notacion"'));
    await conServidor(dir, {}, async pedir => {
      const r = await pedir('/api/estado');
      assert.equal(r.status, 200);
      const { estado: nuevo } = await r.json();
      assert.equal(nuevo.esquema, ESQUEMA);
      assert.equal(nuevo.preferencias.programaPrincipal, 'clasica');
      const { eventos } = await (await pedir('/api/eventos')).json();
      const s = eventos.find(e => e.id === 'sesion-vieja');
      assert.equal(s.programa, 'clasica');
      assert.equal(s.ruta, undefined);
      assert.ok(fs.readdirSync(path.join(dir, 'copias')).some(f => f.startsWith('historial-antes-de-importar-'))); // el original, apartado
      assert.ok(sinRestos(dir));
      // Y ya se puede escribir.
      assert.equal((await pedir('/api/eventos', { method: 'POST', body: JSON.stringify({ eventos: [evento('despues')] }) })).status, 200);
    });
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('4 · importación fallida en cualquier paso del cambio: no queda nada aplicado a medias', async () => {
  const dir = carpeta();
  try {
    await conServidor(dir, {}, async pedir => {
      const { rev, estado } = await (await pedir('/api/estado')).json();
      await pedir('/api/estado', { method: 'PUT', body: JSON.stringify({ rev, estado: { ...estado, perfil: { nombre: 'antes' } } }) });
      await pedir('/api/eventos', { method: 'POST', body: JSON.stringify({ eventos: [evento('a'), evento('b')] }) });
    });
    const estadoAntes = fs.readFileSync(path.join(dir, 'estado.json'), 'utf8');
    const historialAntes = leerTodo(dir);
    const paquete = { formato: 'academia-guitarra', esquema: ESQUEMA, estado: { ...JSON.parse(estadoAntes).estado, perfil: { nombre: 'importado' } }, eventos: [evento('x')] };
    for (const paso of ['apartar', 'historial', 'estado']) {
      await conServidor(dir, { alPaso: p => { if (p === paso) throw new Error(`fallo simulado en «${p}»`); } }, async pedir => {
        const r = await pedir('/api/importar', { method: 'POST', body: JSON.stringify(paquete) });
        assert.equal(r.status, 500, paso);
        assert.match((await r.json()).error, /No se ha cambiado nada/);
        assert.equal(fs.readFileSync(path.join(dir, 'estado.json'), 'utf8'), estadoAntes, paso);
        assert.deepEqual(leerTodo(dir), historialAntes, paso);
        assert.ok(sinRestos(dir), paso);
        assert.equal((await (await pedir('/api/estado')).json()).estado.perfil.nombre, 'antes');
        assert.deepEqual((await (await pedir('/api/eventos')).json()).eventos.map(e => e.id).sort(), ['a', 'b']);
      });
    }
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('5 · importación que sale bien: el estado nuevo se aplica completo y lo anterior queda apartado, sin borrarse', async () => {
  const dir = carpeta();
  try {
    await conServidor(dir, {}, async pedir => {
      await pedir('/api/eventos', { method: 'POST', body: JSON.stringify({ eventos: [evento('a'), evento('b')] }) });
    });
    const historialAntes = leerTodo(dir);
    const revAntes = JSON.parse(fs.readFileSync(path.join(dir, 'estado.json'), 'utf8')).rev;
    const estadoNuevo = { ...JSON.parse(fs.readFileSync(path.join(dir, 'estado.json'), 'utf8')).estado, perfil: { nombre: 'importado' } };
    const paquete = { formato: 'academia-guitarra', esquema: ESQUEMA, estado: estadoNuevo, eventos: [evento('x'), evento('y')] };
    await conServidor(dir, {}, async pedir => {
      assert.equal((await pedir('/api/importar', { method: 'POST', body: JSON.stringify(paquete) })).status, 200);
      const { rev, estado } = await (await pedir('/api/estado')).json();
      assert.equal(estado.perfil.nombre, 'importado');
      assert.ok(rev > revAntes);
      assert.deepEqual((await (await pedir('/api/eventos')).json()).eventos.map(e => e.id).sort(), ['x', 'y']);
      // En disco: el historial es exactamente lo importado, y el anterior está en copias/, entero.
      const ahora = Object.values(leerTodo(dir)).join('').trim().split('\n').map(l => JSON.parse(l).id).sort();
      assert.deepEqual(ahora, ['x', 'y']);
      const apartado = fs.readdirSync(path.join(dir, 'copias')).find(f => f.startsWith('historial-antes-de-importar-'));
      assert.ok(apartado);
      assert.deepEqual(Object.fromEntries(fs.readdirSync(path.join(dir, 'copias', apartado)).map(f => [f, fs.readFileSync(path.join(dir, 'copias', apartado, f), 'utf8')])), historialAntes);
      assert.ok(sinRestos(dir));
    });
    // Y sobrevive a reiniciar.
    await conServidor(dir, {}, async pedir => assert.equal((await (await pedir('/api/estado')).json()).estado.perfil.nombre, 'importado'));
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('si se corta la luz a mitad de una importación, al arrancar vuelve lo de antes sin pasos manuales', async () => {
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
      assert.ok(sinRestos(dir));
      assert.ok(fs.readdirSync(path.join(dir, 'copias')).some(f => f.startsWith('historial-sin-importar-'))); // lo preparado no se borra
    });
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
