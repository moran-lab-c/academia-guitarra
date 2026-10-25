// Guarda los datos de David en disco (carpeta datos/ de la academia):
//   estado.json            perfil, preferencias, encargos, objetivos, marcas de obras, obras propias (se reescribe entero)
//   historial/AAAA-MM.jsonl cada práctica, comprobación, sesión y nota, una por línea (solo se añade, nunca se reescribe)
//   copias/                copias comprimidas: dia-DD (31 huecos que se reutilizan), mes-AAAA-MM (una por mes) y las de antes de importar
//   adjuntos/              archivos que suba (PDF, imágenes, audio)
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { ESQUEMA, FORMATO_EXPORTACION, estadoInicial, validarEstado, validarEvento, validarExportacion } from '../logica/esquema.js';
import { migrar } from '../logica/migraciones.js';
import { dia, diasEntre, mes } from '../logica/fechas.js';

export class ErrorUsuario extends Error {}
// Escribir ahora pondría datos nuevos sobre unos cuya integridad no está garantizada (p. ej., tras una migración fallida).
export class ErrorBloqueado extends Error {}

// opciones.alPaso(nombre): solo para las pruebas; se llama antes de cada paso del cambio de una importación.
export function crearAlmacen(dir, { alPaso = () => {} } = {}) {
  const r = { estado: path.join(dir, 'estado.json'), historial: path.join(dir, 'historial'), copias: path.join(dir, 'copias'), adjuntos: path.join(dir, 'adjuntos') };
  // Una importación (o migración) se prepara al lado y se cambia con renombrados; el diario dice por dónde iba.
  const imp = { diario: path.join(dir, 'importando.json'), historial: path.join(dir, 'historial.nuevo'), estado: `${r.estado}.nuevo` };
  fs.mkdirSync(dir, { recursive: true });
  recuperarImportacion(); // antes de crear carpetas: si se cortó a medias, primero se deja todo como estaba
  for (const d of [r.historial, r.copias, r.adjuntos]) fs.mkdirSync(d, { recursive: true });

  let doc = null;          // { rev, estado }
  let errorEstado = null;  // si estado.json no se puede leer, no se toca hasta restaurar una copia
  let mtimeEstado = 0;
  const archivos = new Map(); // nombre → { mtime, lista }
  let ids = new Set();

  cargarEstado();
  cargarHistorial();
  migrarSiHace();
  copiaDiaria();

  function cargarEstado() {
    if (!fs.existsSync(r.estado)) {
      doc = { rev: 1, estado: estadoInicial() };
      escribir(r.estado, JSON.stringify(doc, null, 1));
    } else {
      try {
        const leido = JSON.parse(fs.readFileSync(r.estado, 'utf8'));
        doc = { rev: leido.rev ?? 1, estado: leido.estado ?? leido };
        errorEstado = null;
      } catch (e) {
        errorEstado = `estado.json no se puede leer (${e.message}). No se ha tocado; restaura una copia desde Ajustes.`;
      }
    }
    mtimeEstado = mtime(r.estado);
  }

  // Si alguien (Claude, a mano) cambia el archivo, se recarga y sube la versión: la app se entera y no lo pisa.
  function refrescarEstado() {
    const m = mtime(r.estado);
    if (m === mtimeEstado) return;
    const antes = doc?.rev ?? 0;
    cargarEstado();
    if (doc) doc.rev = Math.max(doc.rev, antes) + 1;
  }

  function leerEstado() {
    refrescarEstado();
    if (errorEstado) throw new Error(errorEstado);
    return doc;
  }

  function guardarEstado(rev, estado) {
    refrescarEstado();
    if (errorEstado) throw new Error(errorEstado);
    if (rev !== doc.rev) return { conflicto: true, ...doc };
    const err = validarEstado(estado);
    if (err.length) throw new ErrorUsuario(err.join(' · '));
    doc = { rev: doc.rev + 1, estado };
    escribir(r.estado, JSON.stringify(doc, null, 1));
    mtimeEstado = mtime(r.estado);
    copiaDiaria();
    return { rev: doc.rev };
  }

  function cargarHistorial() {
    for (const f of fs.readdirSync(r.historial)) if (/^\d{4}-\d{2}\.jsonl$/.test(f)) cargarArchivo(f);
    ids = new Set([...archivos.values()].flatMap(a => a.lista.map(ev => ev.id)));
  }

  function cargarArchivo(f) {
    const p = path.join(r.historial, f);
    const lista = [];
    for (const linea of fs.readFileSync(p, 'utf8').split('\n')) {
      if (!linea.trim()) continue;
      try { lista.push(JSON.parse(linea)); } catch { console.error(`Línea ilegible en ${f}; se ignora.`); } // p. ej., cortada por un apagón
    }
    archivos.set(f, { mtime: mtime(p), lista });
  }

  function refrescarHistorial() {
    let cambio = false;
    for (const f of fs.readdirSync(r.historial)) {
      if (!/^\d{4}-\d{2}\.jsonl$/.test(f)) continue;
      if (archivos.get(f)?.mtime !== mtime(path.join(r.historial, f))) { cargarArchivo(f); cambio = true; }
    }
    if (cambio) ids = new Set([...archivos.values()].flatMap(a => a.lista.map(ev => ev.id)));
  }

  function leerEventos() {
    refrescarHistorial();
    return [...archivos.values()].flatMap(a => a.lista).sort((a, b) => a.t.localeCompare(b.t));
  }

  // Añade eventos nuevos; los repetidos (mismo id, p. ej. un reenvío tras perder la conexión) se ignoran.
  // Con los datos en error (estado ilegible o migración fallida) no se escribe nada: la app los guarda en el navegador y
  // los vuelve a enviar cuando los datos estén bien.
  function anadirEventos(lista) {
    if (errorEstado) throw new ErrorBloqueado(`No se guarda nada mientras los datos tengan un problema: ${errorEstado}`);
    if (!Array.isArray(lista)) throw new ErrorUsuario('Se esperaba una lista de eventos');
    refrescarHistorial();
    const nuevos = [];
    for (const ev of lista) {
      const err = validarEvento(ev);
      if (err.length) throw new ErrorUsuario(err.join(' · '));
      if (!ids.has(ev.id)) { nuevos.push(ev); ids.add(ev.id); }
    }
    const porMes = new Map();
    for (const ev of nuevos) (porMes.get(mes(ev.t)) ?? porMes.set(mes(ev.t), []).get(mes(ev.t))).push(ev);
    for (const [m, evs] of porMes) {
      const f = `${m}.jsonl`, p = path.join(r.historial, f);
      fs.appendFileSync(p, evs.map(ev => JSON.stringify(ev) + '\n').join(''));
      const a = archivos.get(f) ?? { lista: [] };
      archivos.set(f, { mtime: mtime(p), lista: [...a.lista, ...evs] });
    }
    if (nuevos.length) copiaDiaria();
    return { anadidos: nuevos.length };
  }

  function exportar() {
    if (errorEstado) throw new Error(errorEstado);
    return { formato: FORMATO_EXPORTACION, esquema: ESQUEMA, exportado: new Date().toISOString(), estado: doc.estado, eventos: leerEventos() };
  }

  function importar(paquete, { simular = false } = {}) {
    const err = validarExportacion(paquete);
    if (err.length) throw new ErrorUsuario(err.join(' · '));
    const datos = migrar(structuredClone({ estado: paquete.estado, eventos: paquete.eventos })); // una migración a medias no toca lo que hay en memoria
    const errores = [...validarEstado(datos.estado), ...datos.eventos.flatMap(validarEvento)];
    if (errores.length) throw new ErrorUsuario(`El archivo tiene errores: ${errores.slice(0, 5).join(' · ')}`);
    const fechas = datos.eventos.map(ev => ev.t).sort();
    const resumen = {
      exportado: paquete.exportado ?? null, eventos: datos.eventos.length,
      sesiones: datos.eventos.filter(ev => ev.tipo === 'sesion').length,
      desde: fechas[0] ?? null, hasta: fechas.at(-1) ?? null,
    };
    if (simular) return resumen;
    const sello = new Date().toISOString().replace(/[:.]/g, '-');
    if (!errorEstado) hacerCopia(`antes-de-importar-${sello}`);
    // Atómica para él: 1) se prepara todo al lado (historial.nuevo, estado.json.nuevo) sin tocar nada; 2) se cambia con
    // tres renombrados. Si algo falla, se deshace y todo sigue como estaba; si se corta la luz, se deshace al arrancar.
    // El historial anterior no se borra: queda apartado en copias/.
    const apartado = path.join(r.copias, `historial-antes-de-importar-${sello}`);
    const nuevoDoc = { rev: (doc?.rev ?? 0) + 1, estado: datos.estado };
    fs.rmSync(imp.historial, { recursive: true, force: true });
    escribirDiario({ fase: 'preparando', apartado: path.basename(apartado) });
    try {
      fs.mkdirSync(imp.historial);
      const porMes = new Map();
      for (const ev of datos.eventos) (porMes.get(mes(ev.t)) ?? porMes.set(mes(ev.t), []).get(mes(ev.t))).push(ev);
      for (const [m, evs] of porMes) escribir(path.join(imp.historial, `${m}.jsonl`), evs.map(ev => JSON.stringify(ev) + '\n').join(''));
      escribir(imp.estado, JSON.stringify(nuevoDoc, null, 1));
      escribirDiario({ fase: 'cambiando', apartado: path.basename(apartado) });
      alPaso('apartar');
      fs.renameSync(r.historial, apartado);
      alPaso('historial');
      fs.renameSync(imp.historial, r.historial);
      alPaso('estado');
      fs.renameSync(imp.estado, r.estado);
    } catch (e) {
      recuperarImportacion();
      throw new Error(`No se ha podido importar (${e.message}). No se ha cambiado nada: todo sigue como estaba.`);
    }
    fs.rmSync(imp.diario, { force: true });
    doc = nuevoDoc;
    errorEstado = null;
    mtimeEstado = mtime(r.estado);
    archivos.clear();
    cargarHistorial();
    return resumen;
  }

  function escribirDiario(d) { escribir(imp.diario, JSON.stringify(d)); }

  // Deja las cosas como estaban si una importación quedó a medias (por un error o por un corte). Si ya había terminado
  // el último renombrado, se queda lo nuevo. Nada se borra: lo que sobra va a copias/.
  function recuperarImportacion() {
    if (!fs.existsSync(imp.diario)) return;
    let d = null;
    try { d = JSON.parse(fs.readFileSync(imp.diario, 'utf8')); } catch { d = null; }
    const terminada = d?.fase === 'cambiando' && !fs.existsSync(imp.estado);
    const apartado = d?.apartado ? path.join(r.copias, path.basename(d.apartado)) : null;
    if (!terminada && apartado && fs.existsSync(apartado)) {
      if (fs.existsSync(r.historial)) fs.renameSync(r.historial, `${apartado}-sin-terminar`); // el nuevo, si ya estaba en su sitio
      fs.renameSync(apartado, r.historial);
    }
    if (!terminada) fs.rmSync(imp.estado, { force: true });
    if (fs.existsSync(imp.historial)) {
      fs.mkdirSync(r.copias, { recursive: true });
      fs.renameSync(imp.historial, path.join(r.copias, `historial-sin-importar-${Date.now()}`));
    }
    fs.rmSync(imp.diario, { force: true });
  }

  function migrarSiHace() {
    if (errorEstado || (doc.estado.esquema ?? 1) >= ESQUEMA) return;
    const copia = hacerCopia(`antes-de-migrar-${doc.estado.esquema ?? 1}-a-${ESQUEMA}`);
    // Si algo antiguo no pasa la validación, la academia arranca igual y avisa; los datos no se tocan.
    try { importar({ ...exportar(), esquema: doc.estado.esquema ?? 1 }); } catch (e) {
      errorEstado = `Los datos no se han podido pasar al esquema ${ESQUEMA} (${e.message}). No se han tocado; hay copia en copias/${copia}.`;
    }
  }

  function hacerCopia(nombre) {
    const archivo = `${nombre}.json.gz`;
    escribir(path.join(r.copias, archivo), zlib.gzipSync(JSON.stringify(exportar())));
    return archivo;
  }

  // Una vez al día (en la primera escritura o al arrancar): el hueco del día del mes y el del mes.
  function copiaDiaria() {
    if (errorEstado) return;
    const hoy = dia(new Date());
    const marca = path.join(r.copias, '.ultima');
    if (leerTexto(marca) === hoy) return;
    hacerCopia(`dia-${hoy.slice(8)}`);
    hacerCopia(`mes-${hoy.slice(0, 7)}`);
    fs.writeFileSync(marca, hoy);
    copiaExterna(hoy);
  }

  // Copia fuera de la vault (p. ej., a OneDrive). Apagada mientras preferencias.copiaExterna sea null.
  function copiaExterna(hoy) {
    const ce = doc.estado.preferencias?.copiaExterna;
    if (!ce?.carpeta) return;
    const marca = path.join(r.copias, '.ultima-externa');
    const ultima = leerTexto(marca);
    if (ultima && diasEntre(ultima, hoy) < (ce.cadaDias ?? 7)) return;
    try {
      fs.mkdirSync(ce.carpeta, { recursive: true });
      fs.copyFileSync(path.join(r.copias, `mes-${hoy.slice(0, 7)}.json.gz`), path.join(ce.carpeta, `academia-guitarra-${hoy.slice(0, 7)}.json.gz`));
      fs.writeFileSync(marca, hoy);
    } catch (e) { console.error(`No se pudo hacer la copia externa: ${e.message}`); }
  }

  function listarCopias() {
    return fs.readdirSync(r.copias).filter(f => f.endsWith('.json.gz')).map(f => {
      const s = fs.statSync(path.join(r.copias, f));
      return { archivo: f, bytes: s.size, fecha: s.mtime.toISOString() };
    }).sort((a, b) => b.fecha.localeCompare(a.fecha));
  }

  function leerCopia(archivo) {
    if (!/^[\w.-]+\.json\.gz$/.test(archivo)) throw new ErrorUsuario('Nombre de copia no válido');
    const p = path.join(r.copias, archivo);
    if (!fs.existsSync(p)) throw new ErrorUsuario('No existe esa copia');
    return JSON.parse(zlib.gunzipSync(fs.readFileSync(p)).toString('utf8'));
  }

  function guardarAdjunto(nombre, contenido) {
    const limpio = String(nombre || 'archivo').normalize('NFC').replace(/[^\p{L}\p{N}._ -]/gu, '_').replace(/^\.+/, '').slice(0, 100) || 'archivo';
    let archivo = `${dia(new Date())}_${limpio}`;
    for (let i = 2; fs.existsSync(path.join(r.adjuntos, archivo)); i++) archivo = `${dia(new Date())}_${i}_${limpio}`;
    fs.writeFileSync(path.join(r.adjuntos, archivo), contenido);
    return { archivo, url: `/adjuntos/${encodeURIComponent(archivo)}` };
  }

  function rutaAdjunto(archivo) {
    const p = path.resolve(r.adjuntos, archivo);
    return p.startsWith(path.resolve(r.adjuntos) + path.sep) ? p : null;
  }

  return { dir, leerEstado, guardarEstado, leerEventos, anadirEventos, exportar, importar, hacerCopia, listarCopias, leerCopia, guardarAdjunto, rutaAdjunto };
}

function mtime(p) {
  try { return fs.statSync(p).mtimeMs; } catch { return 0; }
}

function leerTexto(p) {
  try { return fs.readFileSync(p, 'utf8').trim(); } catch { return null; }
}

// Escribe en un temporal y lo renombra: si se va la luz a mitad, el archivo bueno sigue entero.
// En Windows el antivirus puede tener el archivo abierto un instante: se reintenta.
function escribir(p, datos) {
  const tmp = `${p}.tmp`;
  fs.writeFileSync(tmp, datos);
  for (let i = 0; ; i++) {
    try { return fs.renameSync(tmp, p); } catch (e) {
      if (i >= 5 || !['EPERM', 'EBUSY', 'EACCES'].includes(e.code)) throw e;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 50 * (i + 1));
    }
  }
}
