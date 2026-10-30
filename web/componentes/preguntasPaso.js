// Unas pocas preguntas dentro de un paso: se contestan, se ve si está bien y ya. Sin nota que se guarde y sin bloquear nada.
import { h } from '../nucleo/dom.js';
import { repintar } from '../nucleo/rutas.js';
import { preguntasDelPaso } from '../../logica/preguntasPaso.js';
import { notacionSuelta } from './partitura.js';
import { tocar } from './sonido.js';

// Lo que lleva contestado, solo mientras está en esta pantalla.
let sesion = { id: null, ronda: 0, respuestas: [] };

export function bloquePreguntas(pasoId, n = 5) {
  if (sesion.id !== pasoId) sesion = { id: pasoId, ronda: 0, respuestas: [] };
  const lista = preguntasDelPaso(pasoId, n, `${pasoId}#${sesion.ronda}`);
  if (!lista?.length) return null;
  const i = sesion.respuestas.length;
  if (i >= lista.length) {
    const bien = sesion.respuestas.filter(Boolean).length;
    return h('div', { class: 'preguntas tarjeta-s pila-s' },
      h('p', null, h('strong', null, `${bien} de ${lista.length}`), bien === lista.length ? '. Perfecto.' : '.'),
      h('button', { type: 'button', class: 'btn btn-borde', onclick: () => { sesion = { id: pasoId, ronda: sesion.ronda + 1, respuestas: [] }; repintar(); } }, 'Otra tanda'));
  }
  const q = lista[i];
  const contestar = (boton, k) => {
    const ok = k === q.correcta;
    boton.closest('.preguntas').querySelectorAll('.preguntas__opcion').forEach((b, n) => {
      b.disabled = true;
      if (n === q.correcta) b.classList.add('es-correcta');
      else if (n === k) b.classList.add('es-fallo');
    });
    sesion.respuestas.push(ok);
    setTimeout(repintar, ok ? 600 : 1500);
  };
  return h('div', { class: 'preguntas tarjeta-s pila-s' },
    h('div', { class: 'rotulo' }, `PREGUNTA ${i + 1} DE ${lista.length}`),
    h('p', null, q.enunciado),
    q.notacion && h('div', { class: 'atril atril--pequeno' }, notacionSuelta(q.notacion, 'partitura', q.enunciado)),
    q.audio && h('button', { type: 'button', class: 'btn btn-borde', onclick: () => tocar(q.audio.secuencia, { duracion: q.audio.duracion }) }, '♪ Escuchar'),
    h('div', { class: 'fila' }, q.opciones.map((o, k) => h('button', { type: 'button', class: 'btn btn-borde preguntas__opcion', onclick: ev => contestar(ev.currentTarget, k) }, o))));
}
