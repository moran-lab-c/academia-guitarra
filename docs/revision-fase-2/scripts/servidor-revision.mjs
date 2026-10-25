// Servidor de verdad sobre carpetas de esta revisión (nunca los datos reales ni el puerto 7421): migración que sale
// bien y que falla, y persistencia de lo nuevo de la Fase 2. Uso: node servidor-revision.mjs
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
const { crearServidor } = await import('file:///C:/Users/david/The%20Cave/08%20-%20Guitarra/Academia/app/servidor/servidor.js');

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const CAB = { 'Content-Type': 'application/json', 'x-academia': '1' };
let servidor, base;
const arrancar = dir => new Promise(ok => { ({ servidor } = crearServidor({ datos: dir })); servidor.listen(0, '127.0.0.1', () => { base = `http://127.0.0.1:${servidor.address().port}`; ok(); }); });
const parar = () => new Promise(ok => servidor.close(ok));
const pedir = (r, op = {}) => fetch(base + r, { ...op, headers: { ...CAB, ...op.headers } });
const json = async (r, op) => { const x = await pedir(r, op); return { status: x.status, ...(await x.json()) }; };
const carpeta = nombre => { const d = path.join(AQUI, nombre); fs.rmSync(d, { recursive: true, force: true }); fs.mkdirSync(path.join(d, 'historial'), { recursive: true }); return d; };
const ok = (cond, texto) => console.log(`  ${cond ? 'OK ' : 'MAL'} ${texto}`);
const errores = console.error; console.error = () => {}; // el servidor escribe en stderr el error 500 esperado

const ESTADO_V1 = { rev: 7, estado: { esquema: 1, perfil: { nombre: 'David' }, preferencias: { rutaPrincipal: 'flamenca' }, obras: { 'obra:tarrega.lagrima': { marca: 'en-estudio' } },
  tareasProfesor: [{ id: 't', item: 'comp:tec.sonido-clasico', ruta: 'clasica' }], objetivos: [], focos: { unidad: { clasica: 'unidad:c1.u2' } },
  contenidoPropio: { obras: [{ id: 'obra:propia.x', ruta: 'clasica', clase: 'obra', titulo: 'X', compositor: 'Y', nivel: { etapa: 2 } }], ejercicios: [] } } };
const HIST_V1 = [
  { id: 'v1', t: '2026-10-10T17:00:00.000Z', tipo: 'practica', item: 'obra:tarrega.lagrima', min: 10, pasadas: 1, calidad: { precision: 'bien' } },
  { id: 'v2', t: '2026-10-10T18:00:00.000Z', tipo: 'sesion', ruta: 'clasica', minutos: 30, bloques: [] },
].map(e => JSON.stringify(e)).join('\n') + '\n';

console.log('\n### M1 · Migración 1 → 2 al arrancar, con datos válidos');
{
  const dir = carpeta('servidor-migra-bien');
  fs.writeFileSync(path.join(dir, 'estado.json'), JSON.stringify(ESTADO_V1));
  fs.writeFileSync(path.join(dir, 'historial', '2026-10.jsonl'), HIST_V1);
  await arrancar(dir);
  const { estado, rev } = await json('/api/estado');
  ok(estado.esquema === 2 && estado.preferencias.programaPrincipal === 'flamenca' && !('rutaPrincipal' in estado.preferencias), `estado convertido (esquema ${estado.esquema}, programaPrincipal ${estado.preferencias.programaPrincipal}, rev ${rev})`);
  ok(estado.tareasProfesor[0].programa === 'clasica' && estado.focos.tramo.clasica === 'tramo:c1.t2' && estado.contenidoPropio.obras[0].nivel.curso === 2, 'encargo, tramo elegido y obra propia convertidos');
  ok(estado.perfil.nombre === 'David' && estado.obras['obra:tarrega.lagrima'].marca === 'en-estudio', 'nada se pierde (perfil, marcas)');
  const { eventos } = await json('/api/eventos');
  ok(eventos.length === 2 && eventos[1].programa === 'clasica' && !('ruta' in eventos[1]), 'historial convertido (sesión con «programa»)');
  const copias = fs.readdirSync(path.join(dir, 'copias'));
  const copia = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(dir, 'copias', 'antes-de-migrar-1-a-2.json.gz'))));
  ok(copia.estado.esquema === 1 && copia.estado.preferencias.rutaPrincipal === 'flamenca' && copia.eventos[1].ruta === 'clasica', 'la copia antes-de-migrar guarda los datos originales tal cual');
  const apartado = copias.find(f => f.startsWith('historial-antes-de-importar-'));
  ok(apartado && fs.readFileSync(path.join(dir, 'copias', apartado, '2026-10.jsonl'), 'utf8') === HIST_V1, 'el historial original queda apartado, byte a byte');
  await parar(); await arrancar(dir);
  const otra = await json('/api/estado');
  ok(otra.estado.esquema === 2 && otra.rev === rev && fs.readdirSync(path.join(dir, 'copias')).filter(f => f.startsWith('historial-antes-')).length === 1, 'al reiniciar no vuelve a migrar ni a apartar nada');
  await parar();
}

console.log('\n### M2 · Migración que falla (un evento viejo no pasa la validación)');
{
  const dir = carpeta('servidor-migra-mal');
  const malo = HIST_V1 + JSON.stringify({ id: 'v3', t: '2026-10-11T17:00:00.000Z', tipo: 'practica', item: 'obra:tarrega.lagrima', ayuda: 'partitura' }) + '\n';
  const est = JSON.stringify(ESTADO_V1);
  fs.writeFileSync(path.join(dir, 'estado.json'), est);
  fs.writeFileSync(path.join(dir, 'historial', '2026-10.jsonl'), malo);
  await arrancar(dir);
  const r = await json('/api/estado');
  ok(r.status === 500 && /no se han podido pasar/.test(r.error), `avisa (${r.status})`);
  ok(fs.readFileSync(path.join(dir, 'estado.json'), 'utf8') === est, 'estado.json intacto');
  ok(fs.readFileSync(path.join(dir, 'historial', '2026-10.jsonl'), 'utf8') === malo, 'historial intacto');
  ok(!fs.readdirSync(path.join(dir, 'copias')).some(f => f.startsWith('historial-antes-')), 'no aparta el historial');
  const put = await pedir('/api/estado', { method: 'PUT', body: JSON.stringify({ rev: 7, estado: { ...ESTADO_V1.estado, esquema: 2 } }) });
  ok(put.status === 500, `no deja guardar el estado (${put.status})`);
  const { eventos } = await json('/api/eventos');
  ok(eventos.find(e => e.id === 'v2').ruta === 'clasica', `GET /api/eventos devuelve el historial sin tocar en memoria (sesión v2: ruta=${eventos.find(e => e.id === 'v2').ruta}, programa=${eventos.find(e => e.id === 'v2').programa})`);
  const post = await pedir('/api/eventos', { method: 'POST', body: JSON.stringify({ eventos: [{ id: 'nuevo', t: '2026-10-25T10:00:00.000Z', tipo: 'nota', texto: 'hola' }] }) });
  const tras = fs.readFileSync(path.join(dir, 'historial', '2026-10.jsonl'), 'utf8');
  ok(tras === malo, `POST /api/eventos con la migración fallida: ${post.status} y el historial ${tras === malo ? 'sigue intacto' : 'ha cambiado (se ha añadido una línea)'}`);
  await parar();
}

console.log('\n### P1 · Lo nuevo de la Fase 2 sobrevive a reiniciar el servidor');
{
  const dir = carpeta('servidor-persistencia');
  await arrancar(dir);
  const { estado, rev } = await json('/api/estado');
  estado.obras['obra:tarrega.lagrima'] = { marca: 'en-estudio', conocida: { nivel: 'parcial', secciones: ['A'], fecha: '2026-10-25' } };
  estado.focos = { tramo: { clasica: 'tramo:c1.t2' } };
  estado.formatos = { 'obra:tarrega.lagrima#A': 'partitura', 'ej:esc.mi-mayor-1pos': 'tablatura' };
  estado.ajustes = { 'comp:esc.mi-mayor-1pos': { tempo: { referencia: 72, obligatorio: true }, por: 'profesor', motivo: 'esta semana' } };
  estado.tareasProfesor = [{ id: 'e1', item: 'obra:tarrega.lagrima', minutos: 15, hasta: '2026-10-27', programa: 'clasica', formato: 'partitura', estado: 'pendiente' }];
  const put = await json('/api/estado', { method: 'PUT', body: JSON.stringify({ rev, estado }) });
  const ev = { id: 'p1', t: '2026-10-25T10:00:00.000Z', tipo: 'practica', item: 'obra:tarrega.lagrima', seccion: 'A', modo: 'comprobacion', enFrio: true, min: 3, pasadas: 1, calidad: { precision: 'bien', fraseo: 'fallos' }, formato: 'partitura', encargo: 'e1' };
  await json('/api/eventos', { method: 'POST', body: JSON.stringify({ eventos: [ev] }) });
  await parar(); await arrancar(dir);
  const des = await json('/api/estado');
  ok(put.status === 200 && JSON.stringify(des.estado) === JSON.stringify(estado), 'conocida (parcial, con secciones), tramo elegido, formatos por sección, ajustes y encargo con formato: iguales tras reiniciar');
  ok(JSON.stringify((await json('/api/eventos')).eventos[0]) === JSON.stringify(ev), 'una comprobación de sección con encargo: igual tras reiniciar');
  const malo = structuredClone(estado); malo.obras['obra:tarrega.lagrima'].conocida = { nivel: 'casi' };
  ok((await pedir('/api/estado', { method: 'PUT', body: JSON.stringify({ rev: des.rev, estado: malo }) })).status === 400, '«conocida» con un nivel inventado se rechaza (400)');
  await parar();
}
console.error = errores;
