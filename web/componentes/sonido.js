// Notas, acordes y pistas con guitarra de nailon: las muestras de web/sonidos/guitarra, generadas con FluidSynth y GeneralUser GS
// (herramientas/generar-sonidos.mjs), el mismo sonido de los audios de los ejercicios. No graba ni escucha nada.
export const NOTA_MIN = 40, NOTA_MAX = 88;
const RASGUEO = 0.012; // un acorde no suena todo a la vez: de grave a agudo, como en los audios de los ejercicios
let audio = null, salida = null;
const muestras = new Map(); // midi → Promise<AudioBuffer>

const contexto = () => {
  if (!audio) {
    audio = new (window.AudioContext || window.webkitAudioContext)();
    // Un limitador a la salida: un acorde de seis cuerdas no satura.
    salida = audio.createDynamicsCompressor();
    salida.threshold.value = -6; salida.ratio.value = 8; salida.attack.value = 0.002; salida.release.value = 0.2;
    salida.connect(audio.destination);
  }
  audio.resume?.();
  return audio;
};

// El navegador solo deja sonar tras un gesto: al primer toque ya se prepara, y las escenas pueden sonar al avanzar.
if (typeof document !== 'undefined') document.addEventListener('pointerdown', () => contexto(), { once: true });
export const sonidoListo = () => audio?.state === 'running';

const muestra = midi => {
  const n = Math.min(NOTA_MAX, Math.max(NOTA_MIN, midi));
  if (!muestras.has(n)) {
    const p = fetch(`/web/sonidos/guitarra/${n}.mp3`).then(r => { if (!r.ok) throw new Error(`Falta la nota ${n}`); return r.arrayBuffer(); }).then(b => audio.decodeAudioData(b));
    p.catch(() => muestras.delete(n)); // un fallo de red no se queda guardado
    muestras.set(n, p);
  }
  return muestras.get(n);
};
const preparar = midis => Promise.all([...new Set(midis)].map(muestra));

// Suena durante «duracion» segundos y se apaga en poco tiempo, como una cuerda que se apaga con el dedo.
function nota(buffers, midi, cuando, duracion, volumen = 0.85, cents = 0) {
  const n = Math.min(NOTA_MAX, Math.max(NOTA_MIN, midi));
  const src = audio.createBufferSource(), vol = audio.createGain();
  src.buffer = buffers.get(n);
  if (cents) src.detune.value = cents;
  const fin = cuando + Math.max(0.08, Math.min(duracion, src.buffer.duration - 0.2));
  vol.gain.setValueAtTime(volumen, cuando);
  vol.gain.setValueAtTime(volumen, fin);
  vol.gain.exponentialRampToValueAtTime(0.0001, fin + 0.15);
  src.connect(vol).connect(salida);
  src.start(cuando);
  src.stop(fin + 0.2);
  return src;
}
const mapaDe = async midis => {
  const lista = [...new Set(midis.map(m => Math.min(NOTA_MAX, Math.max(NOTA_MIN, m))))];
  const b = await preparar(lista);
  return new Map(lista.map((m, i) => [m, b[i]]));
};

// secuencia: [[midi, …], …], cada elemento suena a la vez (un acorde) o, con arpegiado, nota a nota de grave a agudo.
// desafinar: cuántos cents se desvía la última nota de cada grupo (para oír los batidos).
export function tocar(secuencia, { duracion = 0.8, arpegiado = false, destacar = null, desafinar = 0 } = {}) {
  contexto();
  return mapaDe(secuencia.flat()).then(buffers => {
    let t = audio.currentTime + 0.03;
    secuencia.forEach((grupo, g) => {
      const paso = arpegiado ? 0.14 : RASGUEO;
      // destacar: los grupos que suenan más fuertes que los demás.
      const volumen = !destacar ? undefined : destacar.includes(g) ? 1 : 0.32;
      grupo.forEach((midi, i) => nota(buffers, midi, t + i * paso, duracion + (grupo.length - 1 - i) * paso + (grupo.length > 1 ? 0.5 : 0), volumen, i === grupo.length - 1 ? desafinar : 0));
      t += duracion + (arpegiado ? 0.14 * (grupo.length - 1) : 0);
    });
  }).catch(e => console.error('No se ha podido cargar el sonido:', e.message));
}

// Una sola reproducción a la vez: una notación o una pista, con aviso del compás que suena. Se para sola al cambiar de pantalla.
let actual = null;
export const sonandoAhora = () => actual?.id ?? null;
export function pararReproduccion() {
  if (!actual) return;
  clearTimeout(actual.vigia);
  actual.timers.forEach(clearTimeout);
  actual.fuentes.forEach(f => { try { f.stop(); } catch { /* ya acabó */ } });
  const fin = actual.alTerminar;
  actual = null;
  fin?.();
}

// eventos: de logica/guitarra.js ({ t, dur, midis, suena, compas }, t en negras). bucle: repetir cada «largo» negras.
export function reproducir(id, eventos, { bpm = 72, bucle = 0, largo = 0, alCompas, alTerminar } = {}) {
  pararReproduccion();
  contexto();
  const negra = 60 / bpm;
  const r = { id, timers: [], fuentes: [], alTerminar, vigia: null };
  actual = r;
  mapaDe(eventos.flatMap(e => e.midis)).then(buffers => {
    if (actual !== r) return; // lo han parado mientras cargaba
    const inicio = audio.currentTime + 0.1;
    const vuelta = n => {
      const base = inicio + n * largo * negra;
      let ultimo = -1;
      for (const ev of eventos) {
        const cuando = base + ev.t * negra;
        ev.midis.forEach((m, i) => r.fuentes.push(nota(buffers, m, cuando + i * RASGUEO, (ev.suena?.[i] ?? ev.dur) * negra)));
        if (ev.compas !== ultimo) {
          ultimo = ev.compas;
          r.timers.push(setTimeout(() => alCompas?.(ev.compas), Math.max(0, (cuando - audio.currentTime) * 1000)));
        }
      }
      r.fuentes = r.fuentes.slice(-96); // las ya acabadas no hace falta guardarlas
      if (bucle) r.timers.push(setTimeout(() => { if (actual === r) vuelta(n + 1); }, Math.max(0, (base + largo * negra - 0.3 - audio.currentTime) * 1000)));
      else r.timers.push(setTimeout(() => { if (actual === r) pararReproduccion(); }, Math.max(0, (base + largo * negra + 0.6 - audio.currentTime) * 1000)));
    };
    vuelta(0);
    // Si se va de la pantalla, se calla.
    const hash = location.hash;
    const vigilar = () => { if (actual !== r) return; if (location.hash !== hash) return pararReproduccion(); r.vigia = setTimeout(vigilar, 400); };
    vigilar();
  }).catch(e => { console.error('No se ha podido cargar el sonido:', e.message); if (actual === r) pararReproduccion(); });
}
