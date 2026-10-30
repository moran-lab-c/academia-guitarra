// Los datos en el navegador y su sincronización con el servidor. Lo importante vive en disco (carpeta datos/);
// aquí solo hay una copia de trabajo y, si el servidor no responde, lo pendiente de guardar.
import { indexar, conPropio } from '../../logica/catalogo.js';
import { contexto } from '../../logica/progreso.js';
import { indexarCurriculo } from '../../logica/curriculo.js';

const CAB = { 'Content-Type': 'application/json', 'x-academia': '1' };
const EVENTOS_PENDIENTES = 'academia.eventosPendientes';
const ESTADO_PENDIENTE = 'academia.estadoPendiente';

const d = { indice: null, entidades: [], erroresCatalogo: [], cat: null, estado: null, rev: 0, eventos: [], conectado: true, aviso: null };
const oyentes = new Set();
let ctxCache = null, pendientes = [], guardando = false, alCambiarConexion = () => {};

export const datos = () => d;
export const suscribir = fn => oyentes.add(fn);
export const vigilarConexion = fn => { alCambiarConexion = fn; };
export const curriculo = () => d.indice;
export const ctx = () => (ctxCache ??= contexto(d.cat, d.estado, d.eventos));
function avisar() { ctxCache = null; for (const fn of oyentes) fn(); }

async function api(ruta, op = {}) {
  const r = await fetch('/api' + ruta, { ...op, headers: { ...CAB, ...op.headers } });
  const cuerpo = await r.json().catch(() => ({}));
  if (!r.ok && r.status !== 409) throw new Error(cuerpo.error || `Error ${r.status}`);
  return { status: r.status, ...cuerpo };
}

export async function cargar() {
  const [cat, est, ev, cur] = await Promise.all([api('/catalogo'), api('/estado'), api('/eventos'), api('/curriculo')]);
  d.indice = indexarCurriculo(cur);
  Object.assign(d, { entidades: cat.entidades, erroresCatalogo: cat.errores, estado: est.estado, rev: est.rev, eventos: ev.eventos });
  rehacerCatalogo();
  recuperarPendientes();
  avisar();
}

const rehacerCatalogo = () => { d.cat = indexar(conPropio(d.entidades, d.estado)); };

function conexion(ok) {
  if (d.conectado !== ok) { d.conectado = ok; alCambiarConexion(ok); }
}

// Cambia el estado (perfil, encargos, marcas, obras propias…) y lo guarda en disco.
export function cambiar(fn) {
  fn(d.estado);
  pendientes.push(fn);
  rehacerCatalogo();
  avisar();
  guardar();
}

async function guardar() {
  if (guardando) return;
  guardando = true;
  try {
    while (pendientes.length) {
      const n = pendientes.length;
      const r = await api('/estado', { method: 'PUT', body: JSON.stringify({ rev: d.rev, estado: d.estado }) });
      if (r.status === 409) {
        // Otra ventana (o Claude) lo cambió antes: se parte de lo del archivo y se repiten encima mis cambios.
        d.estado = r.estado; d.rev = r.rev;
        for (const fn of pendientes) fn(d.estado);
        rehacerCatalogo();
        avisar();
        continue;
      }
      d.rev = r.rev;
      pendientes.splice(0, n);
    }
    borrarLocal(ESTADO_PENDIENTE);
    conexion(true);
  } catch {
    guardarLocal(ESTADO_PENDIENTE, { rev: d.rev, estado: d.estado });
    conexion(false);
    setTimeout(guardar, 5000);
  } finally {
    guardando = false;
  }
}

// Añade un evento al historial (práctica, sesión, nota…). Si el servidor no responde, espera en el navegador.
export function registrar(ev) {
  const completo = { id: crypto.randomUUID(), t: new Date().toISOString(), ...ev };
  d.eventos.push(completo);
  guardarLocal(EVENTOS_PENDIENTES, [...leerLocal(EVENTOS_PENDIENTES, []), completo]);
  avisar();
  enviarEventos();
  return completo;
}

async function enviarEventos() {
  const cola = leerLocal(EVENTOS_PENDIENTES, []);
  if (!cola.length) return;
  try {
    await api('/eventos', { method: 'POST', body: JSON.stringify({ eventos: cola }) });
    const enviados = new Set(cola.map(e => e.id));
    guardarLocal(EVENTOS_PENDIENTES, leerLocal(EVENTOS_PENDIENTES, []).filter(e => !enviados.has(e.id)));
    conexion(true);
  } catch {
    conexion(false);
    setTimeout(enviarEventos, 5000);
  }
}

// Lo que no llegó al servidor la última vez (se cerró la app con el servidor apagado).
function recuperarPendientes() {
  const cola = leerLocal(EVENTOS_PENDIENTES, []);
  const ids = new Set(d.eventos.map(e => e.id));
  for (const e of cola) if (!ids.has(e.id)) d.eventos.push(e);
  if (cola.length) enviarEventos();
  const est = leerLocal(ESTADO_PENDIENTE, null);
  if (!est) return;
  if (est.rev === d.rev) { d.estado = est.estado; rehacerCatalogo(); pendientes.push(() => {}); guardar(); }
  else { borrarLocal(ESTADO_PENDIENTE); d.aviso = 'Había cambios sin guardar de una sesión anterior, pero el archivo cambió después: se queda lo del archivo.'; }
}

// Datos y copias.
export const salud = () => api('/salud');
export const importar = (paquete, simular) => api(`/importar${simular ? '?simular' : ''}`, { method: 'POST', body: JSON.stringify(paquete) });
export const copias = () => api('/copias');
export const crearCopia = () => api('/copias', { method: 'POST' });
export const restaurar = (archivo, simular) => api('/copias/restaurar', { method: 'POST', body: JSON.stringify({ archivo, simular }) });

function leerLocal(clave, defecto) {
  try { return JSON.parse(localStorage.getItem(clave)) ?? defecto; } catch { return defecto; }
}
function guardarLocal(clave, valor) {
  try { localStorage.setItem(clave, JSON.stringify(valor)); } catch { /* sin almacenamiento local: se reintenta igual */ }
}
function borrarLocal(clave) {
  try { localStorage.removeItem(clave); } catch { /* nada */ }
}
