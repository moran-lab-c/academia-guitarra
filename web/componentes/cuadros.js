// El reproductor de escenas por cuadros: avanzar, pausar, repetir y saltar a un cuadro. Lo usan el mástil y el diagrama de
// acordes. Recuerda dónde iba si la pantalla se repinta; arranca solo una vez, al verse; con «reducir movimiento», enseña el final.
import { h } from '../nucleo/dom.js';
import { tocar, sonidoListo } from './sonido.js';

const estados = new Map();
const sinMovimiento = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// cuadros: [{ texto, suena, arpegiado, ms }]. pintar(cuadro, i): dibuja ese cuadro. raiz: lo que tiene que estar visible para arrancar.
export function controlCuadros({ cuadros, clave, pintar, alMontar }) {
  let st = estados.get(clave);
  if (!st) {
    st = { i: sinMovimiento() ? cuadros.length - 1 : 0, sonando: false, timer: null, visto: sinMovimiento(), nodo: null, refrescar: null };
    estados.set(clave, st);
  }
  const leyenda = h('p', { class: 'cuadros__texto', 'aria-live': 'polite' });
  const boton = h('button', { type: 'button', class: 'btn btn-borde cuadros__play', onclick: () => alternar() });
  const puntos = h('div', { class: 'cuadros__puntos', role: 'group', 'aria-label': 'Cuadros de la animación' },
    cuadros.map((_, n) => h('button', { type: 'button', class: 'cuadros__p', 'aria-label': `Cuadro ${n + 1}`, onclick: () => { parar(); ira(n); } })));
  const refrescar = () => {
    const q = cuadros[st.i];
    pintar(q, st.i);
    leyenda.textContent = q.texto ?? '';
    boton.textContent = st.sonando ? '❚❚ Pausa' : st.i === cuadros.length - 1 ? '↺ Otra vez' : '▶ Seguir';
    puntos.querySelectorAll('.cuadros__p').forEach((b, n) => { b.classList.toggle('es-actual', n === st.i); b.classList.toggle('es-pasado', n < st.i); });
  };
  st.refrescar = refrescar;
  const sonar = q => { if (sonidoListo() && q.suena?.length) tocar([q.suena], { duracion: q.arpegiado ? 1.3 : 0.9, arpegiado: !!q.arpegiado }); };
  const ira = n => { st.i = n; sonar(cuadros[n]); st.refrescar(); };
  const parar = () => { clearTimeout(st.timer); st.sonando = false; st.refrescar?.(); };
  const seguir = () => {
    clearTimeout(st.timer);
    st.timer = setTimeout(() => {
      if (!st.nodo?.isConnected) { estados.delete(clave); return; } // se ha ido de la pantalla
      if (st.i >= cuadros.length - 1) { st.sonando = false; st.refrescar(); return; }
      st.i++;
      sonar(cuadros[st.i]);
      st.refrescar();
      seguir();
    }, cuadros[st.i].ms ?? 1900);
  };
  const alternar = () => {
    if (st.sonando) return parar();
    if (st.i >= cuadros.length - 1) st.i = 0;
    st.sonando = true;
    sonar(cuadros[st.i]);
    st.refrescar();
    seguir();
  };
  const controles = h('div', { class: 'cuadros__controles' },
    h('button', { type: 'button', class: 'btn btn-fantasma', 'aria-label': 'Cuadro anterior', onclick: () => { parar(); ira(Math.max(0, st.i - 1)); } }, '◀'),
    boton,
    h('button', { type: 'button', class: 'btn btn-fantasma', 'aria-label': 'Cuadro siguiente', onclick: () => { parar(); ira(Math.min(cuadros.length - 1, st.i + 1)); } }, '▶'),
    puntos);
  return {
    leyenda, controles,
    // Al montar: se engancha al nodo nuevo y, la primera vez que se ve, arranca.
    montar(nodo) {
      st.nodo = nodo;
      refrescar();
      alMontar?.();
      if (st.visto) return;
      const obs = new IntersectionObserver(([x]) => {
        if (!x.isIntersecting) return;
        obs.disconnect();
        if (st.visto) return;
        st.visto = true;
        st.sonando = true;
        st.refrescar();
        seguir();
      }, { threshold: 0.35 });
      requestAnimationFrame(() => obs.observe(nodo));
    },
  };
}
