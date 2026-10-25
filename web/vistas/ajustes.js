// Ajustes y datos: dónde se guarda todo, exportar, importar, copias y preferencias.
import { h, valores } from '../nucleo/dom.js';
import { ctx, datos, cambiar, salud, importar, copias, crearCopia, restaurar, cargar } from '../nucleo/almacen.js';
import { repintar } from '../nucleo/rutas.js';
import { aviso, tarjeta, fecha } from '../componentes/comunes.js';

const pantalla = { carpeta: null, copias: null, propuesta: null, mensaje: null };

export default function ajustes() {
  const c = ctx(), d = datos();
  if (!pantalla.carpeta) salud().then(s => { pantalla.carpeta = s.datos; repintar(); }).catch(() => {});
  if (!pantalla.copias) copias().then(r => { pantalla.copias = r.copias; repintar(); }).catch(() => {});
  const p = c.estado.preferencias || {};

  const prefs = h('form', { class: 'tarjeta', onsubmit: e => {
    e.preventDefault();
    const v = valores(prefs);
    cambiar(est => {
      Object.assign(est.perfil, { nombre: v.nombre || null, guitarra: v.guitarra || null, clase: v.clase || null });
      Object.assign(est.preferencias, { minutosHabituales: v.minutos || 60, programaPrincipal: v.programa, repartoAmbas: (v.reparto ?? 65) / 100, formatoPreferido: v.formato || null });
    });
    pantalla.mensaje = 'Guardado.';
  } },
    h('div', { class: 'fila' },
      h('label', null, 'Nombre', h('input', { name: 'nombre', value: c.estado.perfil.nombre ?? '' })),
      h('label', null, 'Guitarra', h('input', { name: 'guitarra', value: c.estado.perfil.guitarra ?? '' })),
      h('label', null, 'Clase', h('input', { name: 'clase', value: c.estado.perfil.clase ?? '', placeholder: 'martes 18:00-19:00' })),
      h('label', null, 'Minutos habituales', h('input', { type: 'number', name: 'minutos', value: p.minutosHabituales ?? 60, style: 'width:6em' })),
      h('label', null, 'Programa por defecto', h('select', { name: 'programa' }, [['clasica', 'Clásico'], ['flamenca', 'Flamenco'], ['ambas', 'Los dos']].map(([v, t]) => h('option', { value: v, selected: p.programaPrincipal === v }, t)))),
      h('label', null, 'Con los dos programas, % de clásico', h('input', { type: 'number', name: 'reparto', value: Math.round((p.repartoAmbas ?? 0.65) * 100), min: 10, max: 90, style: 'width:6em' })),
      h('label', null, 'Partitura o tablatura', h('select', { name: 'formato' }, [['', 'Lo que recomiende la app en cada caso'], ['tablatura', 'Prefiero tablatura'], ['partitura', 'Prefiero partitura']].map(([v, t]) => h('option', { value: v, selected: (p.formatoPreferido ?? '') === v }, t))))),
    h('button', { class: 'principal', type: 'submit' }, 'Guardar'));

  const archivo = h('input', { type: 'file', accept: '.json,application/json', onchange: async e => {
    const f = e.target.files[0];
    if (!f) return;
    try {
      const paquete = JSON.parse(await f.text());
      pantalla.propuesta = { tipo: 'importar', paquete, resumen: await importar(paquete, true) };
    } catch (err) { pantalla.mensaje = `No se puede importar: ${err.message}`; }
    repintar();
  } });

  return h('div', null,
    h('h1', null, 'Ajustes y datos'),
    pantalla.mensaje && aviso(pantalla.mensaje),
    h('h2', null, 'Tus datos'),
    tarjeta(
      h('p', null, 'Se guardan en disco, en la vault: ', h('code', null, pantalla.carpeta ?? '…')),
      h('ul', null,
        h('li', null, h('code', null, 'estado.json'), ': perfil, preferencias, encargos, objetivos, marcas de obras y obras propias.'),
        h('li', null, h('code', null, 'historial/AAAA-MM.jsonl'), ': cada práctica, comprobación, sesión y nota (solo se añade).'),
        h('li', null, h('code', null, 'copias/'), ': una copia al día (se guardan las de los últimos 31 días) y una por mes.'),
        h('li', null, h('code', null, 'adjuntos/'), ': archivos que subas.')),
      h('p', { class: 'suave' }, 'Borrar los datos de Brave no los toca. Lo único del navegador son los cambios en espera si el servidor está apagado.')),
    h('div', { class: 'fila' },
      h('a', { href: '/api/exportar', download: '' }, h('button', { class: 'principal' }, 'Exportar mi progreso')),
      h('label', null, 'Importar mi progreso', archivo),
      h('button', { onclick: async () => { const r = await crearCopia(); pantalla.mensaje = `Copia hecha: ${r.archivo}`; pantalla.copias = null; repintar(); } }, 'Hacer una copia ahora')),
    pantalla.propuesta && confirmar(),
    h('details', { class: 'tarjeta' }, h('summary', null, `Copias (${pantalla.copias?.length ?? '…'})`),
      h('table', null, (pantalla.copias || []).map(x => h('tr', null, h('td', null, x.archivo), h('td', null, fecha(x.fecha)), h('td', null, `${Math.ceil(x.bytes / 1024)} KB`),
        h('td', null, h('button', { onclick: async () => { pantalla.propuesta = { tipo: 'restaurar', archivo: x.archivo, resumen: await restaurar(x.archivo, true) }; repintar(); } }, 'Restaurar…')))))),
    tarjeta(h('strong', null, 'Copia fuera del ordenador: '), p.copiaExterna?.carpeta ? `a ${p.copiaExterna.carpeta}, cada ${p.copiaExterna.cadaDias ?? 7} días.` : 'preparada para más adelante (apagada). Mientras, las copias son locales y manuales, más exportar e importar.'),
    h('h2', null, 'Perfil y preferencias'),
    prefs,
    d.erroresCatalogo.length > 0 && h('div', null, h('h2', null, 'Errores del contenido'), h('ul', null, d.erroresCatalogo.map(e => h('li', null, e)))));
}

function confirmar() {
  const { tipo, resumen } = pantalla.propuesta;
  return h('div', { class: 'aviso' },
    h('p', null, `${tipo === 'importar' ? 'El archivo' : 'La copia'} tiene ${resumen.eventos} registros y ${resumen.sesiones} sesiones`,
      resumen.desde ? `, del ${fecha(resumen.desde)} al ${fecha(resumen.hasta)}` : '', '. Sustituirá lo actual; antes se guarda una copia de lo que hay ahora.'),
    h('div', { class: 'fila' },
      h('button', { class: 'principal', onclick: async () => {
        const pr = pantalla.propuesta;
        try {
          if (pr.tipo === 'importar') await importar(pr.paquete, false); else await restaurar(pr.archivo, false);
          pantalla.mensaje = 'Hecho. Lo anterior quedó en copias.';
        } catch (e) { pantalla.mensaje = `No se ha podido: ${e.message}`; }
        Object.assign(pantalla, { propuesta: null, copias: null });
        await cargar();
      } }, 'Sí, sustituir'),
      h('button', { onclick: () => { pantalla.propuesta = null; repintar(); } }, 'Cancelar')));
}
