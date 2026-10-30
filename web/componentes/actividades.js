// Comprobaciones que no son solo opción múltiple: elegir (también de oído o en partitura), ordenar, completar, localizar en el
// diapasón y marcar lo que ya sale. Corrigen en el momento y explican; no se guarda nota ni bloquean nada.
import { h } from '../nucleo/dom.js';
import { midiEn, notaEn, ordinal } from '../../logica/guitarra.js';
import { textoRico } from './texto.js';
import { tocar } from './sonido.js';
import { notacionSuelta } from './partitura.js';

const memoria = new Map(); // lo que lleva hecho mientras no sale de la app
const estadoDe = (clave, inicial) => { if (!memoria.has(clave)) memoria.set(clave, inicial()); return memoria.get(clave); };

// replaceChildren convierte en texto lo que no es un nodo: aquí se quitan los false de las condiciones.
const poner = (raiz, ...hijos) => raiz.replaceChildren(...hijos.flat(Infinity).filter(x => x != null && x !== false));

// Un grupo vacío es un silencio.
const sonar = a => tocar(a.notas.map(n => (!n.length ? [] : Array.isArray(n[0]) ? n.map(x => midiEn(x[0], x[1])) : [midiEn(n[0], n[1])])), { duracion: a.duracion ?? 1, arpegiado: !!a.arpegiado });

export function elige(b, clave) {
  const st = estadoDe(clave, () => ({ eleccion: null }));
  const raiz = h('div', { class: 'actividad pila-s' });
  const pintar = () => {
    const hecho = st.eleccion === b.correcta;
    poner(raiz,
      h('p', { class: 'actividad__enunciado' }, textoRico(b.enunciado)),
      b.notacion && h('div', { class: 'atril atril--pequeno' }, notacionSuelta(b.notacion, 'partitura', b.enunciado, b.ancho ?? 300)),
      b.audio && h('button', { type: 'button', class: 'btn btn-borde actividad__oir', onclick: () => sonar(b.audio) }, '♪ Escuchar'),
      h('div', { class: 'fila' }, b.opciones.map((o, k) => h('button', { type: 'button', class: `btn btn-borde preguntas__opcion${st.eleccion === k ? (k === b.correcta ? ' es-correcta' : ' es-fallo') : ''}`, disabled: hecho && k !== b.correcta ? true : null, onclick: () => { st.eleccion = k; pintar(); } }, textoRico(String(o))))),
      st.eleccion != null && h('p', { class: `actividad__respuesta${hecho ? ' es-bien' : ''}`, 'aria-live': 'polite' }, hecho ? h('strong', null, 'Eso es. ') : h('strong', null, 'Todavía no. '), textoRico(hecho ? b.porque ?? '' : b.pista ?? 'Vuelve a mirarlo y prueba otra vez.')));
  };
  pintar();
  return raiz;
}

export function ordenar(b, clave) {
  const st = estadoDe(clave, () => ({ puestos: [], fallo: null }));
  const barajadas = b.barajadas ?? b.items.map((_, i) => i).reverse();
  const raiz = h('div', { class: 'actividad pila-s' });
  const pintar = () => {
    const completo = st.puestos.length === b.items.length;
    poner(raiz,
      h('p', { class: 'actividad__enunciado' }, textoRico(b.enunciado)),
      h('div', { class: 'ordenar__fila' }, b.items.map((_, i) => h('span', { class: `ordenar__hueco${st.puestos[i] != null ? ' es-lleno' : ''}` }, st.puestos[i] != null ? b.items[st.puestos[i]] : String(i + 1)))),
      !completo && h('div', { class: 'fila' }, barajadas.map(k => {
        const usado = st.puestos.includes(k);
        return h('button', { type: 'button', class: `btn btn-borde preguntas__opcion${st.fallo === k ? ' es-fallo' : ''}`, disabled: usado || null, onclick: () => {
          const toca = b.items.findIndex((x, i) => i === st.puestos.length);
          // Dos fichas iguales (dos T) valen lo mismo: se compara lo que dice, no cuál es.
          if (b.items[k] === b.items[toca]) { st.puestos.push(k); st.fallo = null; b.audio?.[k] && tocar(b.audio[k]); } else st.fallo = k;
          pintar();
        } }, b.items[k]);
      })),
      st.fallo != null && !completo && h('p', { class: 'actividad__respuesta' }, h('strong', null, 'Ahí no va. '), textoRico(b.pista ?? 'Piensa qué viene ahora.')),
      completo && h('p', { class: 'actividad__respuesta es-bien' }, h('strong', null, 'Eso es. '), textoRico(b.final ?? '')),
      st.puestos.length > 0 && h('button', { type: 'button', class: 'btn btn-fantasma actividad__otra', onclick: () => { st.puestos = []; st.fallo = null; pintar(); } }, 'Empezar de nuevo'));
  };
  pintar();
  return raiz;
}

// Una frase con huecos. partes: textos y { correcta, opciones }.
export function completar(b, clave) {
  const huecos = b.partes.filter(x => typeof x !== 'string');
  const st = estadoDe(clave, () => ({ r: huecos.map(() => null) }));
  const raiz = h('div', { class: 'actividad pila-s' });
  const pintar = () => {
    let k = -1;
    const todo = huecos.every((x, i) => st.r[i] === x.correcta);
    poner(raiz,
      b.enunciado && h('p', { class: 'actividad__enunciado' }, textoRico(b.enunciado)),
      h('p', { class: 'completar' }, b.partes.map(x => {
        if (typeof x === 'string') return textoRico(x);
        const i = ++k;
        const bien = st.r[i] === x.correcta;
        return h('select', { class: `completar__hueco${st.r[i] == null ? '' : bien ? ' es-correcta' : ' es-fallo'}`, 'aria-label': `Hueco ${i + 1}`, onchange: ev => { st.r[i] = ev.target.value || null; pintar(); } },
          h('option', { value: '' }, '…'), x.opciones.map(o => h('option', { value: o, selected: st.r[i] === o ? true : null }, o)));
      })),
      todo && h('p', { class: 'actividad__respuesta es-bien' }, h('strong', null, 'Eso es. '), textoRico(b.final ?? '')),
      !todo && st.r.some((v, i) => v != null && v !== huecos[i].correcta) && h('p', { class: 'actividad__respuesta' }, textoRico(b.pista ?? 'Hay algún hueco que no encaja.')));
  };
  pintar();
  return raiz;
}

// Encontrar notas en el diapasón: se pulsa, suena y se corrige en el momento.
export function localizar(b, clave) {
  const st = estadoDe(clave, () => ({ puestos: [], fallo: null }));
  const cuerdas = b.cuerdas ?? [1, 2, 3, 4, 5, 6];
  const hasta = b.hastaTraste ?? 4;
  const es = (c, t, lista) => lista.some(x => x[0] === c && x[1] === t);
  // Las notas buscadas salen del cálculo: ningún sitio correcto se queda fuera por escribirlo a mano.
  b = { ...b, objetivos: b.objetivos ?? cuerdas.flatMap(c => Array.from({ length: hasta + 1 }, (_, t) => [c, t])).filter(([c, t]) => b.conjunto.includes(notaEn(c, t, b.clave))) };
  const mensaje = h('p', { class: 'actividad__respuesta', 'aria-live': 'polite' });
  const celdas = [];
  const pintar = () => {
    for (const { c, t, el } of celdas) {
      const dentro = es(c, t, st.puestos);
      el.classList.toggle('es-correcta', dentro);
      el.classList.toggle('es-fallo', st.fallo?.[0] === c && st.fallo?.[1] === t);
      el.textContent = dentro ? notaEn(c, t, b.clave) : '';
    }
    const hecho = b.objetivos.every(x => es(x[0], x[1], st.puestos));
    mensaje.className = `actividad__respuesta${hecho ? ' es-bien' : ''}`;
    mensaje.replaceChildren(...textoRico(hecho ? `**Eso es.** ${b.final ?? ''}` : st.fallo ? `**${notaEn(st.fallo[0], st.fallo[1], b.clave)}** no está entre las que buscas. Escúchala y prueba en otro traste.` : `Llevas ${st.puestos.length} de ${b.objetivos.length}.`));
  };
  const filas = [
    h('div', { class: 'diapason__fila diapason__cabecera' }, h('span'), Array.from({ length: hasta + 1 }, (_, t) => h('span', { class: 'diapason__traste' }, t === 0 ? 'aire' : String(t)))),
    ...cuerdas.map(c => h('div', { class: 'diapason__fila' }, h('span', { class: 'diapason__cuerda' }, ordinal(c)),
      Array.from({ length: hasta + 1 }, (_, t) => {
        const el = h('button', { type: 'button', class: `diapason__celda${t === 0 ? ' diapason__celda--aire' : ''}`, 'aria-label': `${ordinal(c)} cuerda, ${t === 0 ? 'al aire' : `traste ${t}`}`, onclick: () => {
          tocar([[midiEn(c, t)]], { duracion: 0.9 });
          if (es(c, t, b.objetivos)) { if (!es(c, t, st.puestos)) st.puestos.push([c, t]); st.fallo = null; } else st.fallo = [c, t];
          pintar();
        } });
        celdas.push({ c, t, el });
        return el;
      }))),
  ];
  const raiz = h('div', { class: 'actividad pila-s' }, h('p', { class: 'actividad__enunciado' }, textoRico(b.enunciado)),
    h('div', { class: 'diapason', role: 'group', 'aria-label': 'Diapasón' }, filas), mensaje,
    h('button', { type: 'button', class: 'btn btn-fantasma actividad__otra', onclick: () => { st.puestos = []; st.fallo = null; pintar(); } }, 'Empezar de nuevo'));
  pintar();
  return raiz;
}

// «Está bien cuando»: se puede marcar lo que ya sale. Es para él, no cuenta para nada.
export function bien(b, clave, md) {
  const st = estadoDe(clave, () => new Set());
  return h('section', { class: 'bien' }, h('h2', { class: 'bien__titulo' }, b.titulo ?? 'Está bien cuando'),
    h('ul', { class: 'lista-limpia pila-s' }, b.items.map((x, i) => h('li', null, h('label', { class: 'bien__item' },
      h('input', { type: 'checkbox', checked: st.has(i) || null, onchange: ev => { if (ev.target.checked) st.add(i); else st.delete(i); } }), h('span', null, md(x)))))));
}
