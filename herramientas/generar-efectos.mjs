// Genera los sonidos de la interfaz (web/sonidos/interfaz/*.wav), el juego «Tráiler» que eligió el 02/11/2026: nada musical,
// solo aire, golpes y eco que acompañan a la tipografía cinética. Solo hay que volver a ejecutarlo si se cambia el sonido.
// Uso: node herramientas/generar-efectos.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DESTINO = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'web', 'sonidos', 'interfaz');
const SR = 44100;
let semilla = 20261102;
const azar = () => { semilla ^= semilla << 13; semilla ^= semilla >>> 17; semilla ^= semilla << 5; return (semilla >>> 0) / 2147483648 - 1; };
const vacio = dur => new Float64Array(Math.ceil(dur * SR));
const ruido = dur => vacio(dur).map(azar);

// Filtro de segundo orden con la frecuencia cambiando en el tiempo (f: segundos → Hz).
function filtro(x, tipo, f, q = 0.8) {
  const y = new Float64Array(x.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let n = 0; n < x.length; n++) {
    const w = (2 * Math.PI * Math.min(f(n / SR), SR * 0.45)) / SR, a = Math.sin(w) / (2 * q), c = Math.cos(w), a0 = 1 + a;
    const [b0, b1, b2] = tipo === 'paso-banda' ? [a, 0, -a] : tipo === 'graves' ? [(1 - c) / 2, 1 - c, (1 - c) / 2] : [(1 + c) / 2, -1 - c, (1 + c) / 2];
    y[n] = (b0 * x[n] + b1 * x1 + b2 * x2 + 2 * c * y1 - (1 - a) * y2) / a0;
    x2 = x1; x1 = x[n]; y2 = y1; y1 = y[n];
  }
  return y;
}
const fijo = v => () => v;
const barre = (de, a, dur) => t => de * (a / de) ** Math.min(1, t / dur);

// Un roce seco y corto.
const tic = ({ f = 2000, q = 1.5, dec = 0.012 } = {}) => {
  const x = filtro(ruido(dec * 7), 'paso-banda', fijo(f), q);
  return x.map((v, n) => v * Math.exp(-n / SR / dec));
};
// Un golpe con cuerpo: una masa cuyo tono cae en milisegundos, de modo que no se oye como una nota.
const golpe = ({ de = 160, a = 60, caida = 0.03, dec = 0.1 } = {}) => {
  let fase = 0;
  return vacio(dec * 7).map((_, n) => {
    const t = n / SR;
    fase += (2 * Math.PI * (a + (de - a) * Math.exp(-t / caida))) / SR;
    return Math.sin(fase) * Math.min(1, t / 0.001) * Math.exp(-t / dec);
  });
};
// Aire que pasa. forma > 1: el máximo llega hacia el final.
const barrido = ({ dur = 0.2, de = 1500, a = 5000, q = 1, forma = 1 } = {}) => {
  const x = filtro(ruido(dur), 'paso-banda', barre(de, a, dur), q);
  return x.map((v, n) => v * Math.sin(Math.PI * (n / x.length) ** forma) ** 2);
};
const cola = ({ dur = 0.8, f = 500, dec = 0.25 } = {}) => filtro(ruido(dur), 'graves', fijo(f)).map((v, n) => v * Math.exp(-n / SR / dec));
// Un zumbido que resbala sin detenerse en ninguna altura, así que no se oye como una nota.
const zip = ({ de = 800, a = 3500, dur = 0.08, ruidoso = 0.35, crece = 0 } = {}) => {
  let fase = 0;
  return vacio(dur).map((_, n) => {
    const t = n / SR;
    fase += (2 * Math.PI * de * (a / de) ** (t / dur)) / SR;
    return (Math.sin(fase) + ruidoso * azar()) * Math.max(0, Math.sin(Math.PI * t / dur)) ** 0.7 * (t / dur) ** crece;
  });
};

// Capas: [sonido, segundo en que entra, volumen, pan]. Pan de -1 (izquierda) a 1 (derecha), fijo o cambiando con el tiempo.
function mezcla(...capas) {
  const largo = Math.ceil((Math.max(...capas.map(([s, t = 0]) => t + s.length / SR)) + 0.01) * SR);
  const l = new Float64Array(largo), r = new Float64Array(largo);
  for (const [s, t = 0, g = 1, pan = 0] of capas) {
    const inicio = Math.round(t * SR);
    s.forEach((v, n) => {
      const a = ((typeof pan === 'function' ? pan(n / SR) : pan) + 1) * Math.PI / 4;
      l[inicio + n] += v * g * Math.cos(a) * Math.SQRT2;
      r[inicio + n] += v * g * Math.sin(a) * Math.SQRT2;
    });
  }
  return { l, r };
}
const cruza = (de, a, dur) => t => de + (a - de) * Math.min(1, t / dur);
const pegada = (f = 2400, cuerpo = 170, dec = 0.05) => {
  const a = tic({ f, q: 0.9, dec: 0.01 }), b = golpe({ de: cuerpo * 2.2, a: cuerpo, caida: 0.012, dec });
  return b.map((v, n) => v + (a[n] ?? 0) * 1.1);
};
const rebotes = (s, t, retardo, n, g = 0.5, cae = 0.55) => Array.from({ length: n }, (_, i) => [s, t + retardo * (i + 1), g * cae ** i, i % 2 ? 0.7 : -0.7]);

const EFECTOS = {
  clic: [0.32, () => mezcla([golpe({ de: 480, a: 125, caida: 0.007, dec: 0.016 })], [tic({ f: 3300, q: 0.8, dec: 0.004 }), 0, 0.5])],
  avance: [0.45, () => mezcla([barrido({ dur: 0.2, de: 350, a: 3800, q: 0.8, forma: 1.5 }), 0, 1, cruza(-0.5, 0.5, 0.2)], [golpe({ de: 130, a: 62, caida: 0.024, dec: 0.05 }), 0.13, 0.9])],
  acierto: [0.58, () => mezcla([barrido({ dur: 0.07, de: 1300, a: 7000, q: 1, forma: 1.5 }), 0, 0.65], [pegada(3900, 150, 0.06), 0.06, 1], ...rebotes(pegada(3900, 230, 0.02), 0.06, 0.09, 2, 0.4))],
  fallo: [0.5, () => mezcla([filtro(ruido(0.26), 'graves', barre(800, 110, 0.26), 2).map((v, n) => v * Math.exp(-n / SR / 0.075)), 0, 1], [golpe({ de: 92, a: 40, caida: 0.05, dec: 0.1 })])],
  paso: [0.66, () => mezcla([barrido({ dur: 0.1, de: 500, a: 5200, q: 0.8, forma: 2 }), 0, 0.7], [pegada(2900, 62, 0.13), 0.1, 1.15], [cola({ dur: 0.3, f: 3800, dec: 0.045 }), 0.1, 0.25])],
  leccion: [0.78, () => mezcla([barrido({ dur: 0.19, de: 280, a: 6200, q: 0.8, forma: 2.3 }), 0, 0.9, cruza(-0.4, 0.4, 0.19)], [pegada(2700, 50, 0.2), 0.2, 1.2], ...rebotes(pegada(2800, 110, 0.04), 0.2, 0.15, 2, 0.4), [cola({ dur: 0.6, f: 3000, dec: 0.09 }), 0.2, 0.25])],
  tramo: [0.88, () => mezcla([barrido({ dur: 0.35, de: 130, a: 8500, q: 0.7, forma: 2.8 }), 0, 1], [pegada(2500, 42, 0.32), 0.38, 1.3], ...rebotes(pegada(2500, 80, 0.07), 0.38, 0.19, 3, 0.48), [cola({ dur: 1.1, f: 2600, dec: 0.17 }), 0.38, 0.32])],
  // Un instante de silencio justo antes del golpe: es lo que da la sensación de tensión.
  nivel: [0.96, () => mezcla([barrido({ dur: 0.82, de: 70, a: 10000, q: 0.7, forma: 3.4 }), 0, 1.1, t => 0.5 * Math.sin(t * 7)], [zip({ de: 60, a: 700, dur: 0.82, ruidoso: 0.3, crece: 3 }), 0, 0.38], [pegada(2300, 34, 0.55), 0.88, 1.4], ...rebotes(pegada(2200, 62, 0.14), 0.88, 0.24, 5, 0.55, 0.66), [cola({ dur: 2.2, f: 2400, dec: 0.38 }), 0.88, 0.42, t => 0.6 * Math.sin(t * 5)])],
};

// Un corte de graves inaudibles, saturación suave para que tenga pegada, el volumen de cada efecto y un final sin chasquido.
function acabar({ l, r }, pico) {
  const [a, b] = [l, r].map(c => filtro(c, 'agudos', fijo(32), 0.7));
  let max = 0;
  for (let n = 0; n < a.length; n++) max = Math.max(max, Math.abs(a[n]), Math.abs(b[n]));
  const fin = Math.round(SR * 0.004), x = new Float64Array(a.length * 2);
  const satura = v => Math.tanh((v / max) * 2.4) / Math.tanh(2.4);
  for (let n = 0; n < a.length; n++) {
    const f = pico * Math.min(1, (a.length - 1 - n) / fin);
    x[2 * n] = satura(a[n]) * f;
    x[2 * n + 1] = satura(b[n]) * f;
  }
  return x;
}

function wav(x) {
  const b = Buffer.alloc(44 + x.length * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + x.length * 2, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(2, 22);
  b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * 4, 28); b.writeUInt16LE(4, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(x.length * 2, 40);
  x.forEach((v, n) => b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v)) * 32767), 44 + n * 2));
  return b;
}

fs.mkdirSync(DESTINO, { recursive: true });
for (const [nombre, [pico, hacer]] of Object.entries(EFECTOS)) {
  const x = acabar(hacer(), pico);
  if (x.some(Number.isNaN)) throw new Error(`${nombre}: el sonido ha salido mal`);
  fs.writeFileSync(path.join(DESTINO, `${nombre}.wav`), wav(x));
  console.log(nombre.padEnd(8), `${(x.length / 2 / SR).toFixed(3)} s`, `${Math.round(x.length * 2 / 1024)} KB`);
}
