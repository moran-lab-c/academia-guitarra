// Visitar, completar y Continuar son tres cosas distintas. Reproduce el fallo real: entrar en un paso futuro, volver y pulsar
// Continuar llevaba al paso futuro. Vale para todos los niveles. Solo usa datos temporales: nunca los reales.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cargarCurriculo } from '../servidor/catalogo.js';
import { indexarCurriculo, continuar, marcar, papelDelPaso, cambiarNivel, progresoVacio, resumenNivel } from '../logica/curriculo.js';

const ind = indexarCurriculo(cargarCurriculo(fileURLToPath(new URL('../contenido/', import.meta.url))));
const HOY = '2026-11-01';
const siguiente = c => continuar(ind, c, HOY).entrada.paso.id;
const P = id => ind.porId.get(id);
// Visitar es, a propósito, no hacer nada: la app ya no escribe el progreso al entrar en un paso.
const visitar = (c, id) => papelDelPaso(ind, c, P(id));
const hechos = (c, n) => ind.pasos.slice(0, n).forEach(e => marcar(c, e, 'hecho', HOY));

test('A: en el primer paso, completarlo lleva al siguiente lógico', () => {
  const c = progresoVacio();
  assert.equal(siguiente(c), 'n1.t1.l1.p1');
  assert.equal(visitar(c, 'n1.t1.l1.p1'), 'actual');
  marcar(c, P('n1.t1.l1.p1'), 'hecho', HOY);
  assert.equal(siguiente(c), 'n1.t1.l1.p2');
});

test('B, el fallo real: entrar en un paso futuro y volver no salta a ese paso', () => {
  const c = progresoVacio();
  visitar(c, 'n1.t1.l1.p1');
  assert.equal(visitar(c, 'n1.t1.l6.p1'), 'adelantado');
  visitar(c, 'n1.t1.l1.p1');
  assert.equal(siguiente(c), 'n1.t1.l1.p1');
  marcar(c, P('n1.t1.l1.p1'), 'hecho', HOY);
  assert.equal(siguiente(c), 'n1.t1.l1.p2', 'y al completar, el siguiente de la ruta, no el visitado');
});

test('B, con datos antiguos: el campo posicion de antes no manda', () => {
  const c = { ...progresoVacio(), posicion: 'n1.t1.l6.p1' };
  assert.equal(siguiente(c), 'n1.t1.l1.p1');
});

test('C: completar, salir y volver lleva al siguiente pendiente', () => {
  const c = progresoVacio();
  marcar(c, P('n1.t1.l1.p1'), 'hecho', HOY);
  const vuelta = JSON.parse(JSON.stringify(c));
  assert.equal(siguiente(vuelta), 'n1.t1.l1.p2');
});

test('D: visitar no completa', () => {
  const c = progresoVacio();
  const antes = JSON.stringify(c);
  visitar(c, 'n1.t5.l4.p1');
  assert.equal(JSON.stringify(c), antes, 'mirar un paso no cambia el progreso');
  assert.equal(c.pasos['n1.t5.l4.p1'], undefined);
  assert.equal(resumenNivel(ind, c, 1).hechos, 0);
});

test('E: tras completar varios, mirar uno anterior no mueve la ruta', () => {
  const c = progresoVacio();
  hechos(c, 5);
  assert.equal(visitar(c, ind.pasos[1].paso.id), 'consulta');
  assert.equal(siguiente(c), ind.pasos[5].paso.id);
});

test('completar a propósito un paso adelantado no se salta los anteriores', () => {
  const c = progresoVacio();
  marcar(c, P('n1.t1.l6.p1'), 'hecho', HOY);
  assert.equal(siguiente(c), 'n1.t1.l1.p1');
  assert.equal(visitar(c, 'n1.t1.l6.p1'), 'consulta');
});

test('«Sigo practicando» completa para la ruta: avanza y no vuelve a Continuar', () => {
  const c = progresoVacio();
  marcar(c, P('n1.t1.l1.p1'), 'practica', HOY);
  assert.equal(siguiente(c), 'n1.t1.l1.p2');
});

test('mirar o completar un paso de otro nivel no cambia de nivel; solo lo hace empezarlo a propósito', () => {
  const c = progresoVacio();
  assert.equal(visitar(c, 'n3.t1.l1.p1'), 'adelantado');
  marcar(c, P('n3.t1.l1.p1'), 'hecho', HOY);
  assert.equal(c.nivel, 1);
  assert.equal(siguiente(c), 'n1.t1.l1.p1');
  cambiarNivel(c, 3);
  assert.equal(siguiente(c), 'n3.t1.l1.p2');
  assert.equal(visitar(c, 'n3.t1.l1.p2'), 'actual');
});

test('la pantalla por la que iba se guarda por paso y se olvida al completarlo', () => {
  const c = progresoVacio();
  c.pantallas = { 'n1.t1.l1.p1': 1, 'n1.t1.l2.p1': 1 };
  marcar(c, P('n1.t1.l1.p1'), 'hecho', HOY);
  assert.deepEqual(c.pantallas, { 'n1.t1.l2.p1': 1 });
});

test('F y G: el progreso sobrevive a cerrar y abrir, con datos temporales', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'acad-continuar-'));
  const puerto = String(8700 + Math.floor(Math.random() * 90));
  const arrancar = () => new Promise((listo, mal) => {
    const s = spawn(process.execPath, ['servidor/servidor.js'], { cwd: fileURLToPath(new URL('..', import.meta.url)), env: { ...process.env, ACADEMIA_PUERTO: puerto, ACADEMIA_DATOS: dir } });
    s.stdout.once('data', () => listo(s));
    s.once('error', mal);
  });
  const parar = s => new Promise(r => { s.once('exit', r); s.kill(); });
  const api = `http://127.0.0.1:${puerto}/api/estado`;
  let s = await arrancar();
  try {
    const salud = await (await fetch(`http://127.0.0.1:${puerto}/api/salud`)).json();
    assert.ok(JSON.stringify(salud).includes(path.basename(dir)), 'usa la carpeta temporal, no los datos reales');
    const leido = await (await fetch(api)).json();
    const c = progresoVacio();
    hechos(c, 3);
    const r = await fetch(api, { method: 'PUT', headers: { 'content-type': 'application/json', 'x-academia': '1' }, body: JSON.stringify({ ...leido, estado: { ...leido.estado, curriculo: c } }) });
    assert.ok(r.ok, `guardar: ${r.status}`);
    await parar(s);
    s = await arrancar();
    const otraVez = await (await fetch(api)).json();
    assert.equal(siguiente(otraVez.estado.curriculo), ind.pasos[3].paso.id);
    assert.equal(Object.keys(otraVez.estado.curriculo.pasos).length, 3);
  } finally {
    await parar(s);
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('Cursos 1, 2 y 3 juntos: visitar no mueve la ruta, completar sí, y Continuar es siempre el primer pendiente', () => {
  const c = progresoVacio();
  const hoy = '2026-11-01';
  const n = k => ind.pasos.filter(e => e.paso.id.startsWith(`n${k}.`));
  // Se marcan unos pasos del Curso 1: Continuar sigue en el primero que falta.
  const uno = n(1);
  for (const e of uno.slice(0, 5)) marcar(c, e, 'hecho', hoy);
  c.repasos = {};
  assert.equal(continuar(ind, c, hoy).entrada.paso.id, uno[5].paso.id);
  // Completar un paso adelantado de otro curso no adelanta la ruta ni cambia de nivel.
  const antes = JSON.stringify(c.nivel);
  marcar(c, n(3)[10], 'hecho', hoy);
  c.repasos = {};
  assert.equal(continuar(ind, c, hoy).entrada.paso.id, uno[5].paso.id);
  assert.equal(JSON.stringify(c.nivel), antes);
  // Y al completar lo que falta se pasa al paso siguiente.
  marcar(c, uno[5], 'hecho', hoy);
  c.repasos = {};
  assert.equal(continuar(ind, c, hoy).entrada.paso.id, uno[6].paso.id);
});
