// Notas y acordes para las preguntas de oído: un sonido sencillo de Web Audio (onda triangular que se apaga como una
// cuerda pulsada). No graba ni escucha nada.
let audio = null;

function nota(midi, cuando, duracion) {
  const osc = audio.createOscillator(), vol = audio.createGain();
  osc.type = 'triangle';
  osc.frequency.value = 440 * 2 ** ((midi - 69) / 12);
  vol.gain.setValueAtTime(0.0001, cuando);
  vol.gain.exponentialRampToValueAtTime(0.25, cuando + 0.01);
  vol.gain.exponentialRampToValueAtTime(0.0001, cuando + duracion * 1.6);
  osc.connect(vol).connect(audio.destination);
  osc.start(cuando);
  osc.stop(cuando + duracion * 1.6 + 0.05);
}

// secuencia: [[midi, …], …], cada elemento suena a la vez (un acorde) o, con arpegiado, nota a nota de grave a agudo.
export function tocar(secuencia, { duracion = 0.8, arpegiado = false } = {}) {
  audio ??= new (window.AudioContext || window.webkitAudioContext)();
  audio.resume?.();
  let t = audio.currentTime + 0.05;
  for (const grupo of secuencia) {
    grupo.forEach((midi, i) => nota(midi, t + (arpegiado ? i * 0.14 : 0), duracion));
    t += duracion + (arpegiado ? 0.14 * (grupo.length - 1) : 0);
  }
}
