// Los bloques de un paso enriquecido (logica/bloques.js). Cada paso usa solo los que necesita; un tipo nuevo se añade aquí sin
// tocar la pantalla del paso. La guía («guia») es un recuadro hoy; mañana puede ser un personaje sin cambiar el contenido.
import { h } from '../nucleo/dom.js';
import { ctx } from '../nucleo/almacen.js';
import { enlace } from '../nucleo/rutas.js';
import { formatoPara } from '../../logica/recomendador.js';
import { tempoDe } from '../../logica/metronomo.js';
import { anatomiaAcorde, escalaMayor, eventosDeAcordes, eventosDeNotacion, midiEn, ordinal } from '../../logica/guitarra.js';
import { ACORDES } from '../../logica/acordes.js';
import { textoRico } from './texto.js';
import { mastil } from './mastil.js';
import { diagramas } from './acorde.js';
import { selectorFormato } from './notacion.js';
import { senalarCompases, notacionSuelta } from './partitura.js';
import { barraMetronomo, estadoMetronomo } from './metronomo.js';
import { bloquePreguntas } from './preguntasPaso.js';
import { tocar, reproducir, pararReproduccion, sonandoAhora } from './sonido.js';
import { elige, ordenar, completar, localizar, bien } from './actividades.js';

// El texto con sus {c:7-8}: un botón que señala esos compases en la notación del paso.
function md(texto, raiz) {
  const nodos = [];
  let i = 0;
  for (const m of texto.matchAll(/\{c:(\d+)(?:-(\d+))?\}/g)) {
    nodos.push(...textoRico(texto.slice(i, m.index)));
    const d = Number(m[1]), a = Number(m[2] ?? m[1]);
    nodos.push(h('button', { type: 'button', class: 'compas-enlace', onclick: () => senalar(raiz, d, a) }, d === a ? `compás ${d}` : `compases ${d}-${a}`));
    i = m.index + m[0].length;
  }
  nodos.push(...textoRico(texto.slice(i)));
  return nodos;
}

function senalar(raiz, d, a) {
  const p = raiz.el?.querySelector('.partitura');
  if (!p) return;
  senalarCompases(p, d, a);
  p.closest('.atril')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

const cargadas = new Map();
const cargar = fuente => {
  if (!cargadas.has(fuente)) cargadas.set(fuente, fetch(`/contenido/${fuente}`).then(r => r.json()));
  return cargadas.get(fuente);
};

function notacion(b, pasoId, raiz) {
  const c = ctx();
  const item = { id: `${pasoId}:${b.fuente}`, titulo: b.titulo, programa: 'clasica', notacion: { fuente: b.fuente, compases: b.compases, principal: b.principal, motivo: b.motivo } };
  const bpms = b.bpms ?? [b.bpm ?? 72];
  const botones = bpms.map((bpm, k) => {
    const clave = `sonar:${item.id}:${bpm}`;
    const etiqueta = `♪ ${bpms.length > 1 ? (k === 0 ? 'Lento, ' : 'A tempo, ') : ''}♩=${bpm}`;
    const boton = h('button', { type: 'button', class: 'btn btn-borde', onclick: () => {
      if (sonandoAhora() === clave) return pararReproduccion();
      cargar(b.fuente).then(json => {
        const { eventos, largo } = eventosDeNotacion(json, { compases: b.compases, seco: b.seco });
        const nodoAqui = boton.closest('.bloque-notacion')?.querySelector('.partitura');
        boton.textContent = '■ Parar';
        reproducir(clave, eventos, { bpm, largo,
          alCompas: n => { if (nodoAqui) senalarCompases(nodoAqui, n); },
          alTerminar: () => { boton.textContent = etiqueta; if (nodoAqui) senalarCompases(nodoAqui, null); } });
      });
    } }, sonandoAhora() === clave ? '■ Parar' : etiqueta);
    return boton;
  });
  const cuerpo = () => [
    selectorFormato(item, formatoPara(item, c, {}), item.id),
    b.leyenda !== false && h('p', { class: 'pequeno suave bloque-leyenda' }, b.detalle ? `${b.detalle} · ` : '', 'Sobre la tablatura, el dedo de la mano izquierda, en su color. Debajo, p, i, m o a: la mano derecha.'),
    h('div', { class: 'fila' }, botones),
    b.notas?.length && h('ul', { class: 'bloque-notas' }, b.notas.map(x => h('li', null, md(x, raiz)))),
  ];
  if (b.plegado) {
    // Plegado, no se dibuja hasta que se abre: la notación se mide al estar a la vista.
    const abierto = plegados.has(item.id);
    const d = h('details', { class: 'bloque-notacion bloque-plegado', open: abierto || null, ontoggle: () => {
      if (d.open) { plegados.add(item.id); if (!d.querySelector('.notacion')) d.append(...cuerpo().filter(Boolean)); } else plegados.delete(item.id);
    } }, h('summary', null, b.titulo));
    if (abierto) d.append(...cuerpo().filter(Boolean));
    return d;
  }
  return h('div', { class: 'bloque-notacion pila-s' },
    b.titulo && h('strong', null, b.titulo),
    cuerpo());
}

const plegados = new Set();
function anatomia(b) {
  const an = anatomiaAcorde(b.acorde, b.clave);
  return h('div', { class: 'anatomia' },
    h('div', { class: 'anatomia__notas' }, an.notas.map(n => h('span', { class: 'anatomia__nota' }, h('strong', null, n.nota), h('span', { class: 'pequeno suave' }, n.funcion)))),
    h('table', { class: 'anatomia__tabla' },
      h('thead', null, h('tr', null, ['Cuerda', 'Traste', 'Dedo', 'Nota', 'Qué es'].map(x => h('th', { scope: 'col' }, x)))),
      h('tbody', null, an.cuerdas.map(x => h('tr', { class: x.suena ? null : 'anatomia__muda' },
        h('td', null, ordinal(x.cuerda)),
        h('td', null, !x.suena ? '×' : x.aire ? 'al aire' : String(x.traste)),
        h('td', null, x.suena && x.dedo ? h('i', { class: `anatomia__dedo acorde__dedo--${x.dedo}` }, String(x.dedo)) : '—'),
        h('td', null, x.suena ? x.nota : 'no suena'),
        h('td', { class: 'suave' }, x.suena ? x.funcion : ''))))),
    an.duplicadas.length > 0 && h('p', { class: 'pequeno suave' }, `Se repiten: ${an.duplicadas.map(n => `${n.nota} (${n.veces} veces)`).join(', ')}.`));
}

function escuchar(b) {
  return h('div', { class: 'escuchar fila' }, b.items.map(x => h('button', { type: 'button', class: 'btn btn-borde', onclick: () => {
    const sec = x.acorde
      ? [ACORDES[x.acorde].cuerdas.flatMap((t, i) => (t === null ? [] : [midiEn(6 - i, t)]))]
      : x.acordes ? x.acordes.map(n => ACORDES[n].cuerdas.flatMap((t, i) => (t === null ? [] : [midiEn(6 - i, t)])))
        : x.notas.map(n => (Array.isArray(n[0]) ? n.map(y => midiEn(y[0], y[1])) : [midiEn(n[0], n[1])]));
    tocar(sec, { duracion: x.duracion ?? (x.acorde ? 1.6 : 0.9), arpegiado: !!x.arpegiado, destacar: x.destacar });
  } }, `♪ ${x.etiqueta}`)));
}

// La escala en fila, con sus grados. marcar: posiciones 1, 2, 3… (no grados), para poder apilar terceras más allá de la octava.
function grados(b) {
  const lista = escalaMayor(b.clave, b.largo ?? 8);
  const marcadas = new Set(b.marcar ?? []);
  const sel = lista.filter(n => marcadas.has(n.posicion));
  return h('div', { class: 'grados-bloque pila-s' }, b.titulo && h('div', { class: 'rotulo' }, b.titulo),
    h('div', { class: 'grados' }, lista.map((n, i) => [
      h('button', { type: 'button', class: `grado${marcadas.has(n.posicion) ? ' es-marcado' : ''}`, onclick: () => tocar([[n.midi]], { duracion: 1 }) }, h('small', null, String(n.grado)), h('strong', null, n.nota)),
      b.patron && i < lista.length - 1 && h('span', { class: `grado__dist${n.grado === 3 || n.grado === 7 ? ' es-semitono' : ''}` }, n.grado === 3 || n.grado === 7 ? 'S' : 'T'),
    ])),
    h('div', { class: 'fila' },
      h('button', { type: 'button', class: 'btn btn-borde', onclick: () => tocar(lista.map(n => [n.midi]), { duracion: 0.55 }) }, '♪ Escala'),
      sel.length > 0 && h('button', { type: 'button', class: 'btn btn-borde', onclick: () => tocar(sel.map(n => [n.midi]), { duracion: 0.8 }) }, `♪ ${b.nombre ?? 'Las marcadas'}, una a una`),
      sel.length > 0 && h('button', { type: 'button', class: 'btn btn-borde', onclick: () => tocar([sel.map(n => n.midi)], { duracion: 2 }) }, `♪ ${b.nombre ?? 'Las marcadas'}, juntas`)));
}

// Los dedos de cada mano y su nombre: lo que hace falta para leer cualquier digitación.
const IZQUIERDA = [[1, 'índice'], [2, 'medio'], [3, 'anular'], [4, 'meñique']];
const DERECHA = [['p', 'pulgar', 'los bajos: 6.ª, 5.ª y 4.ª'], ['i', 'índice', '3.ª cuerda'], ['m', 'medio', '2.ª cuerda'], ['a', 'anular', '1.ª cuerda']];
const dedos = b => h('div', { class: 'dedos' },
  b.mano !== 'derecha' && h('div', { class: 'dedos__mano' }, h('div', { class: 'rotulo' }, 'Mano izquierda: pisa. Se escribe con números'),
    h('ul', { class: 'lista-limpia pila-s' }, IZQUIERDA.map(([n, nombre]) => h('li', { class: 'fila' }, h('i', { class: `anatomia__dedo acorde__dedo--${n}` }, String(n)), nombre)))),
  b.mano !== 'izquierda' && h('div', { class: 'dedos__mano' }, h('div', { class: 'rotulo' }, 'Mano derecha: pulsa. Se escribe con letras'),
    h('ul', { class: 'lista-limpia pila-s' }, DERECHA.map(([l, nombre, donde]) => h('li', { class: 'fila' }, h('i', { class: 'dedos__letra' }, l), h('span', null, nombre, h('span', { class: 'suave pequeno' }, ` · ${donde}`)))))));

// Antes de un ejercicio: qué, por qué, cómo y hasta dónde.
function ejercicio(b, x) {
  const fila = (nombre, texto) => texto && h('div', { class: 'ficha-ejercicio__fila' }, h('dt', null, nombre), h('dd', null, md(texto, x.raiz)));
  return h('dl', { class: 'ficha-ejercicio' }, fila('Qué practicas', b.que), fila('Por qué', b.porque), fila('Atención a', b.atencion), fila('Empieza a', b.empieza), fila('Sube cuando', b.sube));
}

// Una progresión que se oye mientras se encienden sus acordes.
function progresion(b, x) {
  const nombres = b.acordes.map(a => a.n);
  const tarjetas = b.acordes.map(a => h('div', { class: 'progresion__acorde' }, a.g && h('small', null, a.g), h('strong', null, a.n), a.papel && h('span', { class: 'pequeno suave' }, a.papel)));
  const encender = i => tarjetas.forEach((el, k) => el.classList.toggle('es-actual', k === i));
  const botones = (b.bpms ?? [72]).map((bpm, k, l) => {
    const clave = `prog:${x.pasoId}:${nombres.join()}:${bpm}`;
    const etiqueta = `♪ ${l.length > 1 ? (k === 0 ? 'Lento' : 'A tempo') : 'Escuchar'}`;
    const boton = h('button', { type: 'button', class: k === 0 ? 'btn btn-papel' : 'btn btn-borde', onclick: () => {
      if (sonandoAhora() === clave) return pararReproduccion();
      const { eventos, largo } = eventosDeAcordes(nombres, { tiempos: b.tiempos ?? 4 });
      boton.textContent = '■ Parar';
      reproducir(clave, eventos, { bpm, largo, alCompas: n => encender(n - 1), alTerminar: () => { boton.textContent = etiqueta; encender(-1); } });
    } }, etiqueta);
    return boton;
  });
  return h('div', { class: 'progresion pila-s' }, h('div', { class: 'progresion__fila' }, tarjetas), h('div', { class: 'fila' }, botones));
}

const pistas = new Map();
function pista(b, pasoId) {
  const clave = `pista:${pasoId}`;
  const st = pistas.get(clave) ?? { bpm: b.bpm ?? 72 };
  pistas.set(clave, st);
  const indicador = h('div', { class: 'pista__acordes' }, b.etiquetas.map((x, i) => h('span', { class: 'pista__acorde', 'data-i': i }, x)));
  const encender = i => indicador.querySelectorAll('.pista__acorde').forEach((el, k) => el.classList.toggle('es-actual', k === i));
  const lectura = h('span', { class: 'pista__bpm' }, `♩ = ${st.bpm}`);
  const arrancar = () => cargar(b.fuente).then(json => {
    const { eventos, largo } = eventosDeNotacion(json, { compases: b.compases });
    boton.textContent = '■ Parar la pista';
    const primero = eventos[0].compas;
    reproducir(clave, eventos, { bpm: st.bpm, largo, bucle: 1, alCompas: n => encender(n - primero),
      alTerminar: () => { boton.textContent = '▶ Tocar la pista'; encender(-1); } });
  });
  const boton = h('button', { type: 'button', class: 'btn btn-papel', onclick: () => (sonandoAhora() === clave ? pararReproduccion() : arrancar()) }, sonandoAhora() === clave ? '■ Parar la pista' : '▶ Tocar la pista');
  const cambiarBpm = d => { st.bpm = Math.min(120, Math.max(48, st.bpm + d)); lectura.textContent = `♩ = ${st.bpm}`; if (sonandoAhora() === clave) arrancar(); };
  return h('div', { class: 'pista tarjeta-s pila-s' }, indicador,
    h('div', { class: 'fila' }, boton, h('button', { type: 'button', class: 'btn btn-fantasma', 'aria-label': 'Más lento', onclick: () => cambiarBpm(-4) }, '−'), lectura, h('button', { type: 'button', class: 'btn btn-fantasma', 'aria-label': 'Más rápido', onclick: () => cambiarBpm(4) }, '+')),
    h('p', { class: 'pequeno suave' }, 'Una base para tocar encima, en bucle, hasta que la pares.'));
}

const RENDER = {
  texto: (b, x) => h('p', { class: 'paso-texto' }, md(b.md, x.raiz)),
  concepto: (b, x) => h('section', { class: 'concepto' }, b.titulo && h('h2', { class: 'concepto__titulo' }, b.titulo), h('p', null, md(b.md, x.raiz))),
  pasos: (b, x) => h('section', { class: 'pila-s' }, b.titulo && h('h2', { class: 'bloque-titulo' }, b.titulo), h('ol', { class: 'bloque-pasos' }, b.items.map(i => h('li', null, md(i, x.raiz))))),
  lista: (b, x) => h('section', { class: 'pila-s' }, b.titulo && h('h2', { class: 'bloque-titulo' }, b.titulo), h('ul', { class: 'bloque-lista' }, b.items.map(i => h('li', null, md(i, x.raiz))))),
  errores: (b, x) => h('section', { class: 'pila-s' }, h('h2', { class: 'bloque-titulo' }, b.titulo ?? 'Lo que suele fallar'), h('dl', { class: 'errores' }, b.items.map(i => h('div', null, h('dt', null, md(i.error, x.raiz)), h('dd', null, md(i.arreglo, x.raiz)))))),
  bien: (b, x, i) => bien(b, `${x.pasoId}#${x.parte}#${i}`, y => md(y, x.raiz)),
  reaparece: (b, x) => h('section', { class: 'reaparece' }, h('h2', { class: 'rotulo' }, 'Volverás a verlo'), h('ul', { class: 'lista-limpia pila-s' }, b.items.map(i => h('li', null, h('a', { href: enlace('/aprender', i.paso) }, textoRico(x.tramoDe(i.paso))), ': ', md(i.texto, x.raiz))))),
  guia: (b, x) => h('aside', { class: 'guia' }, h('div', { class: 'rotulo guia__tipo' }, b.tipoGuia ?? 'Consejo del profesor'), h('p', { class: 'paso-texto paso-texto--guia' }, md(b.md, x.raiz))),
  mastil: (b, x, i) => mastil(b.escena, `${x.pasoId}#${x.parte}#${i}`),
  acordes: b => diagramas(b.nombres),
  anatomia,
  tabla: b => h('table', { class: 'anatomia__tabla' }, h('thead', null, h('tr', null, b.cabecera.map(c => h('th', { scope: 'col' }, c)))), h('tbody', null, b.filas.map(f => h('tr', null, f.map(c => h('td', null, textoRico(String(c)))))))),
  pentagrama: b => h('figure', { class: 'pentagrama' }, h('div', { class: 'atril atril--pequeno' }, notacionSuelta(b.notacion, 'partitura', b.pie ?? 'Pentagrama', b.ancho ?? 300)), b.pie && h('figcaption', { class: 'pequeno suave' }, b.pie)),
  localizar: (b, x, i) => localizar(b, `${x.pasoId}#${x.parte}#${i}`),
  elige: (b, x, i) => elige(b, `${x.pasoId}#${x.parte}#${i}`),
  ordenar: (b, x, i) => ordenar(b, `${x.pasoId}#${x.parte}#${i}`),
  completar: (b, x, i) => completar(b, `${x.pasoId}#${x.parte}#${i}`),
  grados,
  dedos,
  ejercicio,
  progresion,
  notacion: (b, x) => notacion(b, x.pasoId, x.raiz),
  escuchar,
  pista: (b, x) => pista(b, x.pasoId),
  metronomo: (b, x) => { const c = ctx(); return h('details', { class: 'paso-metronomo', open: b.abierto || estadoMetronomo().estado === 'sonando' || null }, h('summary', null, 'Metrónomo'), barraMetronomo({ clave: b.clave ?? x.pasoId, tempo: { ...tempoDe(c, b.clave ?? x.pasoId, {}), ...(b.bpm ? { inicial: b.bpm } : {}) } })); },
  preguntas: (b, x) => bloquePreguntas(x.pasoId, b.n ?? 5),
  obra: (b, x) => { const o = x.ind.obraPorId.get(b.id); return h('div', { class: 'pila-s' }, b.md && h('p', null, md(b.md, x.raiz)), h('a', { class: 'obra-enlace', href: enlace('/obras', o.id) }, h('span', { class: 'titulo-obra' }, o.titulo), o.compositor ? ` · ${o.compositor}` : '', ' →')); },
};

// La lista de nodos del paso. raiz.el se rellena al final para que los enlaces a compases encuentren su notación.
export function bloquesDelPaso(bloques, pasoId, ind, parte = 0) {
  const raiz = { el: null };
  const x = { pasoId, ind, raiz, parte, tramoDe: id => { const e = ind.porId.get(id); return `Tramo ${e.tramo.numero}, ${e.leccion.titulo}`; } };
  const nodo = h('div', { class: 'bloques pila' }, bloques.map((b, i) => RENDER[b.tipo]?.(b, x, i)));
  raiz.el = nodo;
  return nodo;
}
