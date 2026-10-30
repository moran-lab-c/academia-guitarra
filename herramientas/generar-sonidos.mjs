// Genera las notas de guitarra de la app (web/sonidos/guitarra/NN.mp3, del Mi grave al Mi agudo de la 1.ª cuerda en el traste 24)
// con FluidSynth y el banco GeneralUser GS, la guitarra de nailon de los audios de 08 - Guitarra/Audio y con sus mismos ajustes.
// La app combina estas notas para tocar cualquier acorde, notación o pista. Solo hay que volver a ejecutarlo si se cambia el sonido.
// Uso: node herramientas/generar-sonidos.mjs [carpeta de fluidsynth]
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const CARPETA = process.argv[2] ?? path.join(RAIZ, '..', '08 - Guitarra', 'Tablaturas', 'fluidsynth');
const FLUIDSYNTH = path.join(CARPETA, 'fluidsynth-v2.6.1-win10-x64-cpp11', 'bin', 'fluidsynth.exe');
const BANCO = path.join(CARPETA, 'GeneralUser-GS.sf2');
const DESTINO = path.join(RAIZ, 'web', 'sonidos', 'guitarra');
const NAILON = 24, TPQ = 480, DESDE = 40, HASTA = 88, VEL = 95, BPM = 60, TIEMPOS = 3;
const temporal = path.join(os.tmpdir(), 'academia-nota');

const vlq = n => { const b = [n & 0x7f]; while ((n >>= 7)) b.unshift((n & 0x7f) | 0x80); return b; };
function midi(nota) {
  const us = Math.round(60e6 / BPM), dur = TIEMPOS * TPQ;
  const d = [0, 0xff, 0x51, 3, us >> 16, (us >> 8) & 0xff, us & 0xff, 0, 0xc0, NAILON, 0, 0x90, nota, VEL, ...vlq(dur), 0x80, nota, 0, ...vlq(TPQ / 2), 0xff, 0x2f, 0];
  const largo = Buffer.alloc(4);
  largo.writeUInt32BE(d.length);
  return Buffer.concat([Buffer.from([0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 0, 0, 1, TPQ >> 8, TPQ & 0xff]), Buffer.from('MTrk'), largo, Buffer.from(d)]);
}
const ejecutar = (cmd, args) => { const r = spawnSync(cmd, args, { encoding: 'utf8' }); if (r.status || r.error) throw new Error(`${cmd}: ${r.stderr || r.error}`); };

fs.mkdirSync(DESTINO, { recursive: true });
// Una sola ganancia para todas, la de la nota más fuerte: así se conserva el equilibrio natural entre graves y agudos.
let pico = 1;
for (let n = DESDE; n <= HASTA; n++) {
  fs.writeFileSync(`${temporal}.mid`, midi(n));
  ejecutar(FLUIDSYNTH, ['-ni', '-q', '-r', '44100', '-g', '0.8', '-F', `${temporal}-${n}.wav`, BANCO, `${temporal}.mid`]);
  const w = fs.readFileSync(`${temporal}-${n}.wav`);
  for (let k = w.indexOf('data') + 8; k + 1 < w.length; k += 2) pico = Math.max(pico, Math.abs(w.readInt16LE(k)));
}
const ganancia = 20 * Math.log10((32767 * 0.79) / pico);
for (let n = DESDE; n <= HASTA; n++) {
  ejecutar('ffmpeg', ['-y', '-loglevel', 'error', '-i', `${temporal}-${n}.wav`, '-af', `volume=${ganancia.toFixed(2)}dB`, '-codec:a', 'libmp3lame', '-qscale:a', '4', path.join(DESTINO, `${n}.mp3`)]);
  fs.rmSync(`${temporal}-${n}.wav`);
}
console.log(`${HASTA - DESDE + 1} notas en ${DESTINO}, ganancia ${ganancia.toFixed(2)} dB`);
