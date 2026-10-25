// El metrónomo de la práctica: una barra compacta (pulso visible, BPM, ±1 y ±5, iniciar, pausar y detener, compás) que
// sigue sonando aunque la pantalla se repinte. El sonido es de Web Audio, programado un poco por delante para que el pulso
// no dependa de lo ocupado que esté el navegador. La lógica (límites, estados, compás, de dónde sale el tempo) está en
// logica/metronomo.js; el tempo que se usa pasa al registro como dato de progreso, no como nota.
import { h } from '../nucleo/dom.js';
import { crearMetronomo, iniciar, pausar, detener, cambiarBpm, fijarBpm, fijarCompas, avanzar, textoTempo, PASOS, BPM_MIN, BPM_MAX } from '../../logica/metronomo.js';

const COMPASES = ['2/4', '3/4', '4/4', '6/8'];
const motor = { m: crearMetronomo(), clave: null, usadoCon: new Map(), audio: null, siguiente: 0, temporizador: null };

// El tempo con el que ha practicado una cosa en esta sesión (para proponerlo al registrar), o null.
export const tempoUsado = clave => motor.usadoCon.get(clave) ?? null;
export const estadoMetronomo = () => ({ ...motor.m, clave: motor.clave });

function sonar(cuando, acento) {
  const a = motor.audio;
  const osc = a.createOscillator(), vol = a.createGain();
  osc.frequency.value = acento ? 1500 : 1000;
  vol.gain.setValueAtTime(0.0001, cuando);
  vol.gain.exponentialRampToValueAtTime(acento ? 0.5 : 0.3, cuando + 0.002);
  vol.gain.exponentialRampToValueAtTime(0.0001, cuando + 0.05);
  osc.connect(vol).connect(a.destination);
  osc.start(cuando); osc.stop(cuando + 0.06);
}

function marcar(pulso, acento) {
  for (const barra of document.querySelectorAll('.metronomo')) {
    barra.querySelectorAll('.metronomo__pulso').forEach((p, i) => { p.classList.toggle('activo', i === pulso); p.classList.toggle('fuerte', i === pulso && acento); });
  }
}

function programar() {
  while (motor.siguiente < motor.audio.currentTime + 0.12) {
    const { metronomo, pulso, acento } = avanzar(motor.m);
    motor.m = metronomo;
    sonar(motor.siguiente, acento);
    const espera = Math.max(0, (motor.siguiente - motor.audio.currentTime) * 1000);
    setTimeout(() => motor.m.estado === 'sonando' && marcar(pulso, acento), espera);
    motor.siguiente += 60 / motor.m.bpm;
  }
}

function arrancar() {
  motor.audio ??= new (window.AudioContext || window.webkitAudioContext)();
  motor.audio.resume?.();
  motor.m = iniciar(motor.m);
  motor.siguiente = motor.audio.currentTime + 0.06;
  clearInterval(motor.temporizador);
  motor.temporizador = setInterval(programar, 25);
  programar();
  if (motor.clave) motor.usadoCon.set(motor.clave, motor.m.bpm);
}
function parar(conDetener) {
  clearInterval(motor.temporizador);
  motor.temporizador = null;
  motor.m = conDetener ? detener(motor.m) : pausar(motor.m);
  marcar(-1, false);
}

// Refresca las barras que haya en pantalla sin repintar toda la vista.
function refrescar() {
  for (const barra of document.querySelectorAll('.metronomo')) {
    barra.dataset.estado = motor.m.estado;
    barra.querySelector('.metronomo__cifra').textContent = motor.m.bpm;
    const boton = barra.querySelector('.metronomo__marcha');
    boton.textContent = motor.m.estado === 'sonando' ? 'Pausa' : motor.m.estado === 'pausado' ? 'Seguir' : 'Empezar';
    boton.setAttribute('aria-pressed', String(motor.m.estado === 'sonando'));
    const pulsos = barra.querySelector('.metronomo__pulsos');
    if (pulsos.children.length !== motor.m.pulsos) pulsos.replaceChildren(...puntos());
    const sel = barra.querySelector('select');
    if (sel) sel.value = motor.m.compas;
  }
  if (motor.m.estado === 'sonando' && motor.clave) motor.usadoCon.set(motor.clave, motor.m.bpm);
  proponerTempo();
}
// El campo «Tempo» del registro de esta misma práctica recoge el tempo usado, salvo que él ya haya escrito otro.
function proponerTempo() {
  const t = motor.clave && motor.usadoCon.get(motor.clave);
  if (!t) return;
  for (const input of document.querySelectorAll(`input[data-tempo-de="${CSS.escape(motor.clave)}"][data-auto="1"]`)) input.value = t;
}
const puntos = () => Array.from({ length: motor.m.pulsos }, (_, i) => h('span', { class: `metronomo__pulso${motor.m.acentos.includes(i + 1) ? ' metronomo__pulso--acento' : ''}`, 'aria-hidden': 'true' }));

// clave: donde se registrará la práctica (para el tempo apuntado). tempo: lo de logica/metronomo.js (tempoDe).
// compas y acentos: los del contenido, si los tiene.
export function barraMetronomo({ clave, tempo, compas = null, acentos = null }) {
  // Si no está sonando para otra cosa, se prepara con el tempo de esta: el objetivo, o el último apuntado.
  if (motor.clave !== clave && motor.m.estado !== 'sonando') {
    motor.clave = clave;
    motor.m = fijarCompas(fijarBpm(detener(motor.m), tempo?.objetivo ?? tempo?.actual ?? 60), compas ?? '4/4', acentos);
  }
  const otra = motor.clave !== clave;
  const accion = fn => () => { fn(); refrescar(); };
  const opciones = [...new Set([...(compas ? [compas] : []), ...COMPASES])];
  return h('div', { class: 'metronomo tarjeta', 'data-estado': motor.m.estado, role: 'group', 'aria-label': 'Metrónomo' },
    h('div', { class: 'fila-entre' },
      h('span', { class: 'rotulo' }, 'METRÓNOMO'),
      h('select', { 'aria-label': 'Compás', onchange: e => { motor.m = fijarCompas(motor.m, e.target.value, e.target.value === compas ? acentos : null); refrescar(); } },
        opciones.map(c => h('option', { value: c, selected: c === motor.m.compas }, c)))),
    h('div', { class: 'metronomo__fila' },
      h('button', { type: 'button', class: 'metronomo__menos', 'aria-label': `Bajar ${PASOS[1]}`, onclick: accion(() => { motor.m = cambiarBpm(motor.m, -PASOS[1]); }) }, `−${PASOS[1]}`),
      h('button', { type: 'button', 'aria-label': `Bajar ${PASOS[0]}`, onclick: accion(() => { motor.m = cambiarBpm(motor.m, -PASOS[0]); }) }, '−'),
      h('div', { class: 'metronomo__bpm' }, h('span', { class: 'metronomo__cifra display' }, motor.m.bpm), h('span', { class: 'pequeno suave' }, 'BPM')),
      h('button', { type: 'button', 'aria-label': `Subir ${PASOS[0]}`, onclick: accion(() => { motor.m = cambiarBpm(motor.m, PASOS[0]); }) }, '+'),
      h('button', { type: 'button', class: 'metronomo__mas', 'aria-label': `Subir ${PASOS[1]}`, onclick: accion(() => { motor.m = cambiarBpm(motor.m, PASOS[1]); }) }, `+${PASOS[1]}`)),
    h('div', { class: 'metronomo__pulsos', title: `Pulsos del compás (${motor.m.compas})` }, puntos()),
    h('div', { class: 'fila' },
      h('button', { type: 'button', class: 'btn btn-papel metronomo__marcha', 'aria-pressed': String(motor.m.estado === 'sonando'),
        onclick: accion(() => (motor.m.estado === 'sonando' ? parar(false) : arrancar())) }, motor.m.estado === 'sonando' ? 'Pausa' : motor.m.estado === 'pausado' ? 'Seguir' : 'Empezar'),
      h('button', { type: 'button', class: 'btn btn-borde', onclick: accion(() => parar(true)) }, 'Detener'),
      tempo?.objetivo && h('button', { type: 'button', class: 'btn-fantasma pequeno', onclick: accion(() => { motor.m = fijarBpm(motor.m, tempo.objetivo); }) }, `Al objetivo (${tempo.objetivo})`)),
    otra && h('p', { class: 'pequeno ocre', style: 'margin:0' }, 'Está sonando para otro ejercicio: detenlo para usar el tempo de este.'),
    tempo && h('p', { class: 'pequeno suave', style: 'margin:0' }, `${tempo.objetivo ? `${tempo.motivo} ` : ''}${textoTempo(tempo)}`),
    h('p', { class: 'pequeno suave', style: 'margin:0' }, `De ${BPM_MIN} a ${BPM_MAX} BPM.`));
}
