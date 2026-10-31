// El fallo real de Continuar, con los botones de verdad y en un navegador: entrar en un paso futuro, volver y seguir.
// Con servidor y datos temporales; nunca los reales. Uso: node herramientas/prueba-continuar.mjs [puerto]
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';

const PUERTO = process.argv[2] ?? '8871';
const datos = fs.mkdtempSync(path.join(os.tmpdir(), 'acad-cont-'));
const srv = spawn('node', ['servidor/servidor.js'], { env: { ...process.env, ACADEMIA_PUERTO: PUERTO, ACADEMIA_DATOS: datos } });
const perfil = fs.mkdtempSync(path.join(os.tmpdir(), 'edge-cont-'));
const nav = spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', ['--headless=new', '--remote-debugging-port=9338', `--user-data-dir=${perfil}`, '--mute-audio', 'about:blank']);
const espera = ms => new Promise(r => setTimeout(r, ms));
let lista;
for (let i = 0; i < 40 && !lista; i++) { await espera(500); try { lista = await (await fetch('http://127.0.0.1:9338/json')).json(); } catch { /* aún no */ } }
const ws = new WebSocket(lista.find(t => t.type === 'page').webSocketDebuggerUrl);
await new Promise(r => { ws.onopen = r; });
let n = 0; const pend = new Map();
ws.onmessage = m => { const d = JSON.parse(m.data); if (pend.has(d.id)) { pend.get(d.id)(d.result ?? d); pend.delete(d.id); } };
const cdp = (method, params = {}) => new Promise(r => { const id = ++n; pend.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
const js = async e => (await cdp('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true })).result?.value;
const ir = async id => { await js(`location.hash='#/aprender/${id}'`); await espera(700); };
const botones = () => js(`[...document.querySelectorAll('.paso-pie .btn')].map(b=>b.textContent.trim())`);
const pulsar = async t => { await js(`[...document.querySelectorAll('.paso-pie .btn')].find(b=>b.textContent.includes('${t}')).click()`); await espera(700); };
const hash = () => js('location.hash');
const irAlFinal = async () => { for (let k = 0; k < 8; k++) { const b = await botones(); if (!b.some(x => x.includes('Siguiente'))) return; await pulsar('Siguiente'); } };
const progreso = async () => (await js(`fetch('/api/estado').then(r=>r.json())`)).estado.curriculo?.pasos ?? {};
try {
  await espera(1000);
  await cdp('Page.navigate', { url: `http://127.0.0.1:${PUERTO}/` }); await espera(2500);
  await js(`[...document.querySelectorAll('button,a')].find(b=>b.textContent.trim().startsWith('Entrar'))?.click()`); await espera(700);

  await ir('n1.t1.l6.p1');             // visita un paso futuro
  await irAlFinal();
  const adelantado = await botones();
  assert.ok(adelantado.some(x => x.includes('Continuar mi ruta')), `paso adelantado: ${adelantado}`);
  assert.deepEqual(await progreso(), {}, 'visitar no completa');
  await pulsar('Continuar mi ruta');
  assert.match(await hash(), /n1\.t1\.l1\.p1/, 'vuelve al primer pendiente');

  await irAlFinal();
  await pulsar('Continuar');           // completa el primer paso
  assert.match(await hash(), /n1\.t1\.l1\.p2/, 'sigue por el siguiente lógico, no por el visitado');
  assert.deepEqual(Object.keys(await progreso()), ['n1.t1.l1.p1']);

  await cdp('Page.reload'); await espera(2500);
  await js(`[...document.querySelectorAll('button,a')].find(b=>b.textContent.trim().startsWith('Entrar'))?.click()`); await espera(500);
  await js(`location.hash='#/curso'`); await espera(800);
  const principal = await js(`document.querySelector('.btn-continuar')?.getAttribute('href')`);
  assert.match(principal, /n1\.t1\.l1\.p2/, 'tras recargar, el mismo punto');

  await ir('n1.t1.l1.p1');             // consulta algo ya hecho
  assert.ok((await botones()).some(x => x.includes('Continuar mi ruta')));
  await pulsar('Continuar mi ruta');
  assert.match(await hash(), /n1\.t1\.l1\.p2/);
  console.log('Continuar en el navegador: todo correcto');
} finally {
  ws.close(); nav.kill(); srv.kill();
}
process.exit(0);
