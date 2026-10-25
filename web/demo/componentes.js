// Muestra de los componentes de la Fase 2 con datos de ejemplo.
// Parámetros: ?ancho=1000 (ancho del mapa en px), ?entrada=1 (abre la entrada al curso), ?solo=mapa (solo los mapas).
import { h } from '../nucleo/dom.js';
import { mapaRuta, miniRuta } from '../componentes/ruta.js';
import { iconoArea, glifoEstado, chipEstado, chipArea, leyendaEstados, NOMBRE_AREA, NOMBRE_GLIFO } from '../componentes/marcas.js';
import { atril } from '../componentes/atril.js';
import { tituloCinetico, momentoEntrada } from '../componentes/titulo.js';
import { selectorFormato } from '../componentes/notacion.js';

const q = new URLSearchParams(location.search);
const ancho = Number(q.get('ancho')) || 0;

// ---------------------------------------------------------------- Datos de ejemplo (contrato de la lógica)
const p = (numero, tipo, area, titulo, estado, extra = {}) => ({
  id: `paso:${numero}`, numero, tipo, area, titulo, detalle: null, estado, enCurso: false, encargo: false, conocida: false, insertado: false, href: `#/paso/${numero}`, ...extra,
});
const hechos = [
  p(1, 'habilidad', 'tecnica', 'Sonido clásico', 'dominado'),
  p(2, 'habilidad', 'lectura', 'Lectura, cuerdas 1-3', 'repaso'),
  p(3, 'habilidad', 'teoria', 'Tono, semitono y escala mayor', 'dominado'),
  p(4, 'habilidad', 'escalas', 'Escala de Mi mayor', 'hecho'),
  p(5, 'habilidad', 'ritmo', 'Pulso con metrónomo', 'dominado'),
  p(6, 'habilidad', 'tecnica', 'Presión justa', 'hecho'),
  p(7, 'habilidad', 'tecnica', 'Melodía por encima del acompañamiento', 'hecho'),
  p(8, 'habilidad', 'armonia', 'Armonía y oído, I-IV-V7-I', 'hecho'),
  p(9, 'obra', 'repertorio', 'Lágrima, parte A', 'hecho'),
];
const abierto = [
  p(10, 'habilidad', 'armonia', 'Mayor y menor homónimos', 'hecho'),
  p(11, 'habilidad', 'oido', 'Del mayor al menor', 'hecho'),
  p(12, 'habilidad', 'tecnica', 'Media cejilla', 'actual', { detalle: 'para la parte B de Lágrima' }),
  p(13, 'habilidad', 'tecnica', 'Cambio de posición con dedo guía', 'recomendado'),
  p(14, 'habilidad', 'lectura', 'Notas de las cuerdas 4-6', 'proximo'),
  p(15, 'habilidad', 'diapason', 'Las notas de la 1.ª posición', 'proximo'),
  p(null, 'refuerzo', 'lectura', 'Lectura, cuerdas 1-3', 'proximo', { insertado: true, detalle: 'falló en frío; la pide el estudio de Sor' }),
  p(16, 'habilidad', 'ritmo', 'Figuras básicas', 'proximo'),
  p(17, 'obra', 'lectura', 'Estudio op. 60, n.º 1', 'proximo', { enCurso: true, encargo: true }),
  p(18, 'aplicacion', 'repertorio', 'La media cejilla en Lágrima', 'futuro'),
  p(19, 'obra', 'repertorio', 'Lágrima, parte B', 'futuro', { enCurso: true, conocida: true, detalle: 'en curso · ♩ 48' }),
  p(20, 'evaluacion', null, 'Cierre del tramo 2', 'futuro'),
];
const areas3 = ['escalas', 'tecnica', 'tecnica', 'tecnica', 'lectura', 'armonia'];
const tramo3 = ['Escala de La menor', 'Arpegio p-i-m-a', 'Arpegio con cambio', 'Bajos alternos', 'Lectura con arpegio', 'Acordes de apoyo']
  .map((t, i) => p(21 + i, 'habilidad', areas3[i], t, 'futuro'))
  .concat([p(27, 'obra', 'repertorio', 'Estudio en Mi menor', 'futuro'), p(28, 'evaluacion', null, 'Cierre del tramo 3', 'futuro')]);

export const RUTA = {
  curso: { id: 'curso:1', numero: 1, nombre: 'Sonido y control', programa: 'clasico' }, actual: 'paso:12',
  tramos: [
    { id: 't1', orden: 1, titulo: 'Melodía acompañada', estado: 'hecho', borrador: false, hechos: 9, total: 9, pasos: hechos },
    { id: 't2', orden: 2, titulo: 'El cambio de modo', estado: 'abierto', borrador: false, hechos: 2, total: 12, pasos: abierto },
    { id: 't3', orden: 3, titulo: 'El arpegio clásico', estado: 'por-llegar', borrador: false, hechos: 0, total: 8, pasos: tramo3 },
    { id: 't4', orden: 4, titulo: 'Escalas y ligados', estado: 'por-llegar', borrador: true, hechos: 0, total: 8, pasos: [p(null, 'obra', 'repertorio', 'Estudio en Do', 'futuro')] },
    { id: 't5', orden: 5, titulo: 'Polifonía antigua', estado: 'por-llegar', borrador: true, hechos: 0, total: 8, pasos: [p(null, 'obra', 'repertorio', 'Españoleta', 'futuro')] },
  ],
  final: { id: 'final', titulo: 'Lágrima, completa', detalle: 'de memoria (grabada, opcional por ahora)', estado: 'futuro', conocida: false, href: '#/obra/lagrima' },
  siguienteCurso: { numero: 2, nombre: 'Cejilla y posiciones' },
};

// Un curso más avanzado: dos tramos hechos comprimidos, el tercero abierto y uno por llegar con pasos.
const RUTA_2 = {
  curso: { id: 'curso:3', numero: 3, nombre: 'Voces y arpegio', programa: 'clasico' }, actual: 'paso:30',
  tramos: [
    { id: 'u1', orden: 1, titulo: 'Dos voces', estado: 'hecho', borrador: false, hechos: 7, total: 7, pasos: hechos.slice(0, 6).concat([p(7, 'obra', 'repertorio', 'Adelita', 'dominado')]) },
    { id: 'u2', orden: 2, titulo: 'Arpegio en tres cuerdas', estado: 'hecho', borrador: false, hechos: 8, total: 8, pasos: hechos.slice(0, 7).concat([p(15, 'obra', 'repertorio', 'Estudio en Do', 'hecho')]) },
    { id: 'u3', orden: 3, titulo: 'Posiciones altas', estado: 'abierto', borrador: false, hechos: 1, total: 4, pasos: [
      p(28, 'habilidad', 'diapason', 'Notas en la 5.ª posición', 'hecho'), p(29, 'habilidad', 'tecnica', 'Cambio de posición largo', 'repaso'),
      p(30, 'habilidad', 'lectura', 'Lectura en 5.ª posición', 'actual'), p(31, 'obra', 'repertorio', 'Recuerdos de la Alhambra', 'proximo', { conocida: true })] },
    { id: 'u4', orden: 4, titulo: 'Tremolo', estado: 'por-llegar', borrador: false, hechos: 0, total: 3, pasos: [
      p(32, 'habilidad', 'tecnica', 'Tremolo lento', 'futuro'), p(33, 'habilidad', 'tecnica', 'Tremolo a pulso', 'futuro'), p(34, 'preparacion', null, 'Preparar la obra final', 'futuro')] },
  ],
  final: { id: 'final3', titulo: 'Recuerdos de la Alhambra', detalle: 'de memoria', estado: 'futuro', conocida: true, href: '#/obra/alhambra' },
  siguienteCurso: { numero: 4, nombre: 'Barroco y contrapunto' },
};

// ---------------------------------------------------------------- Secciones
const seccion = (titulo, ...hijos) => h('section', null, h('h2', { class: 'rotulo' }, titulo), ...hijos);
const marco = ancho ? { style: `width:${ancho}px` } : {};

const marcas = seccion('Marcas · estado de cada paso',
  h('div', { class: 'mat' }, ['por-llegar', 'disponible', 'ahora', 'hecho', 'dominado', 'repaso', 'refuerzo'].map(e => h('div', null, glifoEstado(e, { tam: 34 }), NOMBRE_GLIFO[e]))),
  h('div', { style: 'margin-top:16px' }, leyendaEstados()),
  h('div', { class: 'fila', style: 'margin-top:20px' }, chipEstado('Ahora', 'ahora'), chipEstado('Encargo', 'encargo'), chipEstado('Repaso', 'repaso'), chipEstado('Refuerzo', 'refuerzo'),
    chipEstado('Ruta'), chipEstado('Obra'), ...['tecnica', 'escalas', 'repertorio', 'lectura', 'fl-compas'].map(chipArea)));

const iconos = seccion('Marcas · iconos de área',
  h('div', { class: 'iconos' }, [...Object.keys(NOMBRE_AREA), 'obra', 'aplicacion', 'evaluacion', 'preparacion', 'estrella']
    .map(a => h('div', { style: `color:var(--a-${a.startsWith('fl-') ? 'flamenco' : a}, var(--texto))` }, iconoArea(a), h('span', null, NOMBRE_AREA[a] ?? a)))));

const mapa = seccion('Mapa de la ruta · curso 1', h('div', marco, mapaRuta(RUTA, { animar: true, clave: 'demo-ruta' })));
const mapa2 = seccion('Mapa de la ruta · curso 3 (dos tramos hechos)', h('div', marco, mapaRuta(RUTA_2)));

const mini = seccion('Mini-ruta · «Dónde estás»', h('a', { class: 'tarj', href: '#' },
  h('span', { class: 'rotulo', style: 'font:11px var(--f-dato);letter-spacing:.12em;color:var(--texto-3)' }, 'DÓNDE ESTÁS'), h('span', { class: 'titulo' }, 'Curso 01 · Sonido y control'), miniRuta(RUTA),
  h('span', { style: 'font-size:13px;color:var(--texto-2)' }, 'Tramo 2, el cambio de modo. Al final del curso, ★ Lágrima completa, de memoria.')));

const tablatura = `<svg viewBox="0 0 900 110" width="100%" role="img" aria-label="Tablatura de muestra">${[16, 29, 42, 55, 68, 81].map(y => `<line x1="8" x2="892" y1="${y}" y2="${y}" stroke="#1D1D1B"/>`).join('')}
  <g font-family="Archivo, sans-serif" font-size="17" font-weight="700" text-anchor="middle"><text x="24" y="36">T</text><text x="24" y="57">A</text><text x="24" y="78">B</text></g>
  <g font-family="Archivo, sans-serif" font-size="14" font-weight="600" text-anchor="middle">${[['0', 86, 76], ['2', 86, 123], ['4', 86, 170], ['0', 73, 218], ['2', 73, 265], ['4', 73, 312], ['1', 60, 360], ['2', 60, 407]]
    .map(([n, y, x]) => `<rect x="${x - 7}" y="${y - 13}" width="14" height="16" fill="#F6F5F1"/><text x="${x}" y="${y}">${n}</text>`).join('')}</g></svg>`;
const papel = h('div');
papel.innerHTML = tablatura;
const atriles = seccion('Atril', h('div', { style: 'max-width:880px' }, atril({
  titulo: 'Escala de Mi mayor', subtitulo: 'dos octavas · 1.ª posición · 4/4', contenido: papel.firstElementChild,
  nota: 'apoyando, i–m alternando · un dedo por traste · el siguiente dedo ya preparado en su cuerda',
})));

const entrada = () => momentoEntrada({
  etiqueta: 'Programa clásico · empiezas un curso', derecha: '01 / 07', sobretitulo: 'Curso 01', titulo: ['Sonido', 'y control'],
  subtitulo: 'Del sonido de tablatura al sonido clásico: la melodía por encima del acompañamiento.',
  pie: '5 tramos · 45 pasos · todas las áreas', accion: { texto: 'Ver la ruta del curso', href: '#/curso/1' }, ruta: RUTA,
});
const titulos = seccion('Título cinético (solo anima la primera vez de su clave)',
  tituloCinetico({ etiqueta: 'Programa clásico · curso 01 de 07', lineas: ['Sonido y control'], clave: 'demo-titulo' }),
  h('div', { class: 'barra', style: 'margin-top:16px' }, h('button', { id: 'ver-entrada', onclick: entrada }, 'Ver la entrada al curso'),
    h('span', { class: 'aviso', style: 'margin-left:12px' }, 'Escape o clic fuera del botón para cerrar. Con clave se vería una sola vez.')));

const item = { id: 'ej:escala-mi', notacion: { fuente: 'notacion/x.json' } };
const rec = { disponibles: ['partitura', 'tablatura'], recomendado: 'tablatura', mostrar: 'tablatura', motivo: 'es técnica; la partitura, para ver qué notas son.', elegidoPorTi: true };
const selector = seccion('Selector Partitura | Tablatura', h('div', { style: 'max-width:760px' }, selectorFormato(item, rec, item.id)),
  h('div', { style: 'max-width:760px;margin-top:12px' }, selectorFormato({ id: 'x', notacion: { partitura: 'externa', tablatura: 'pendiente' } },
    { ...rec, disponibles: ['partitura'], recomendado: 'partitura', mostrar: 'partitura', elegidoPorTi: false, motivo: 'solo la partitura está en una edición externa.' }, 'x')));

// Mismo marcado que produce registro.js (el formulario real): aspectos con radios bien / con fallos / mal.
const aspecto = (nombre, marcado) => h('div', { class: 'fila' }, h('span', { style: 'min-width:16em' }, nombre),
  ...[['bien', 'Bien'], ['fallos', 'Con fallos'], ['mal', 'Mal']].map(([v, t]) => h('label', { class: 'check' }, h('input', { type: 'radio', name: `cal_${nombre}`, value: v, checked: v === marcado }), t)));
const registro = seccion('Registro · «Cómo ha salido»', h('form', { class: 'tarjeta', style: 'max-width:400px;background:var(--sup-1);border-radius:16px;padding:16px 18px;display:flex;flex-direction:column;gap:10px', onsubmit: e => e.preventDefault() },
  h('div', { class: 'fila', style: 'justify-content:space-between' }, h('strong', null, 'Cómo ha salido'), h('button', { type: 'button' }, 'Todo bien')),
  h('div', { class: 'aspectos' }, aspecto('Notas', 'bien'), aspecto('Ritmo', 'bien'), aspecto('Limpieza', 'fallos'), aspecto('Control', 'mal')),
  h('label', null, 'Minutos', h('input', { type: 'number', value: 12, style: 'width:6em' })),
  h('button', { class: 'principal', type: 'submit' }, 'Guardar y seguir')));

const todo = q.get('solo') === 'mapa' ? [mapa, mapa2] : [marcas, iconos, mapa, mapa2, mini, atriles, titulos, selector, registro];
document.getElementById('muestra').append(...todo);
if (q.get('entrada')) entrada();
