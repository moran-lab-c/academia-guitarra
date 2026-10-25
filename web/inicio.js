// Arranque de la interfaz: carril lateral, direcciones y dibujar la pantalla cada vez que cambian los datos.
import { h } from './nucleo/dom.js';
import { ruta, actual } from './nucleo/rutas.js';
import { cargar, cambiar, datos, suscribir, vigilarConexion } from './nucleo/almacen.js';
import hoy from './vistas/hoy.js';
import curso from './vistas/curso.js';
import paso from './vistas/paso.js';
import ejercicio from './vistas/ejercicio.js';
import progreso from './vistas/progreso.js';
import area from './vistas/area.js';
import competencia from './vistas/competencia.js';
import biblioteca from './vistas/biblioteca.js';
import repertorio from './vistas/repertorio.js';
import obra from './vistas/obra.js';
import profesor from './vistas/profesor.js';
import diario from './vistas/diario.js';
import ajustes from './vistas/ajustes.js';
import evaluaciones from './vistas/evaluaciones.js';

// Iconos de trazo (20×20, currentColor). Cada entrada: [destino, texto, trazo, direcciones que lo dejan marcado].
const ICONOS = {
  hoy: '<circle cx="10" cy="10" r="7.5"/><path d="M10 6v4l3 2"/>',
  curso: '<circle cx="4" cy="15" r="2"/><circle cx="16" cy="5" r="2"/><path d="M5.5 13.5C9 11 7 8 10 7s4-.5 4.5-.8"/>',
  obras: '<path d="M8 15V4l8-2v11"/><circle cx="6" cy="15" r="2"/><circle cx="14" cy="13" r="2"/>',
  biblioteca: '<path d="M3 4h5v12H3zM10 4h3v12h-3zM14.5 4.5l2.5.6-2.6 11-2.4-.6z"/>',
  progreso: '<path d="M4 16V9M10 16V4M16 16v-5"/>',
  diario: '<path d="M5 3h10v14H5zM8 7h4M8 10h4M8 13h2"/>',
  profesor: '<circle cx="10" cy="7" r="3"/><path d="M4 17c0-3.3 2.7-5 6-5s6 1.7 6 5"/>',
  ajustes: '<path d="M4 6h12M4 14h12"/><circle cx="8" cy="6" r="2" fill="var(--carril)"/><circle cx="13" cy="14" r="2" fill="var(--carril)"/>',
};
const CARRIL = [
  ['/', 'Hoy', 'hoy', ['/', '/hoy']],
  ['/curso', 'Curso', 'curso', ['/curso', '/paso', '/ejercicio', '/competencia', '/ruta']],
  ['/repertorio', 'Obras', 'obras', ['/repertorio', '/obra']],
  ['/biblioteca', 'Biblioteca', 'biblioteca', ['/biblioteca', '/area']],
  ['/progreso', 'Progreso', 'progreso', ['/progreso']],
  ['/diario', 'Diario', 'diario', ['/diario']],
  ['/profesor', 'Profesor', 'profesor', ['/profesor']],
  ['/ajustes', 'Ajustes', 'ajustes', ['/ajustes', '/evaluaciones']],
];
const PROGRAMAS = [['clasica', 'Clásico', 'Programa clásico'], ['flamenca', 'Flamenco', 'Programa flamenco']];

// SVG en línea: h() usa createElement, así que el SVG se crea desde texto fijo (nunca con datos de fuera).
function icono(trazo) {
  const t = document.createElement('template');
  t.innerHTML = `<svg viewBox="0 0 20 20" aria-hidden="true">${trazo}</svg>`;
  return t.content.firstChild;
}

const programaActual = () => {
  const p = datos().estado?.preferencias || {};
  return (p.programaPrincipal ?? p.rutaPrincipal ?? 'clasica') === 'flamenca' ? 'flamenca' : 'clasica';
};

ruta('/', hoy);
ruta('/hoy', hoy);
ruta('/hoy/:min', hoy);
ruta('/curso', curso);
ruta('/curso/:id', curso);
ruta('/paso/:id', paso);
ruta('/obra/:id', obra);
ruta('/ejercicio/:id', ejercicio);
ruta('/competencia/:id', competencia);
ruta('/area/:area', area);
ruta('/biblioteca', biblioteca);
ruta('/repertorio', repertorio);
ruta('/progreso', progreso);
ruta('/diario', diario);
ruta('/profesor', profesor);
ruta('/ajustes', ajustes);
ruta('/evaluaciones', evaluaciones);
// La ruta antigua de cada programa ahora es el curso: se redirige.
ruta('/ruta/:ruta', () => { location.replace('#/curso'); return h('span'); });

const menu = document.getElementById('menu');
const vista = document.getElementById('vista');
let listo = false;

// El carril se construye una sola vez; en cada pintado solo cambia qué está marcado.
const enlacesCarril = CARRIL.map(([destino, texto, ic, prefijos]) => ({
  prefijos,
  el: h('a', { class: `rail-item${destino === '/ajustes' ? ' rail-fondo' : ''}`, href: '#' + destino }, icono(ICONOS[ic]), texto),
}));
const botonesPrograma = PROGRAMAS.map(([valor, texto, nombre]) => ({
  valor,
  el: h('button', { type: 'button', title: nombre, 'aria-label': nombre, onclick: () => {
    if (programaActual() !== valor) cambiar(e => { (e.preferencias ??= {}).programaPrincipal = valor; });
  } }, texto),
}));
menu.replaceChildren(
  h('a', { class: 'rail-logo', href: '#/', 'aria-label': 'Academia de guitarra, ir a Hoy' }, 'A'),
  h('div', { class: 'rail-programa', role: 'group', 'aria-label': 'Programa' }, botonesPrograma.map(b => b.el)),
  ...enlacesCarril.map(e => e.el));
document.getElementById('salto')?.addEventListener('click', e => { e.preventDefault(); vista.focus(); });

function marcarCarril(hash) {
  for (const { prefijos, el } of enlacesCarril) {
    const activo = prefijos.some(p => hash === p || (p !== '/' && hash.startsWith(p + '/')));
    if (activo) el.setAttribute('aria-current', 'page'); else el.removeAttribute('aria-current');
  }
  const prog = programaActual();
  for (const { valor, el } of botonesPrograma) el.setAttribute('aria-pressed', String(valor === prog));
}

function pintar() {
  if (!listo) return;
  document.documentElement.dataset.tema = datos().estado?.preferencias?.tema === 'claro' ? 'claro' : 'oscuro';
  const r = actual();
  marcarCarril(r?.hash ?? '');
  try {
    vista.replaceChildren(r ? r.vista(r.params) : h('p', null, 'Esta pantalla no existe.'));
  } catch (e) {
    console.error(e);
    vista.replaceChildren(h('div', { class: 'aviso error' }, `Algo ha fallado al dibujar esta pantalla: ${e.message}`));
  }
}

window.addEventListener('hashchange', () => { pintar(); window.scrollTo(0, 0); });
window.addEventListener('academia:repintar', pintar);
suscribir(pintar);
vigilarConexion(ok => {
  const aviso = document.getElementById('conexion');
  aviso.hidden = ok;
  aviso.textContent = 'Sin conexión con el servidor de la academia: los cambios esperan en el navegador y se guardarán en cuanto vuelva.';
});

cargar().then(() => { listo = true; pintar(); }).catch(e => {
  vista.replaceChildren(h('div', { class: 'aviso error' },
    h('p', null, 'No se puede hablar con el servidor de la academia.'),
    h('p', null, 'Ábrela con «Abrir academia.cmd» (en la carpeta de la academia). Detalle: ', e.message)));
});
