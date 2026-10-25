// Dibuja la notación propia de la app con VexFlow: pentagrama (clave de sol con el 8 debajo, como se escribe la
// guitarra), tablatura o las dos unidas. Todo lo musical sale de logica/partitura.js (alturas, alteraciones, tablatura,
// digitación…); aquí solo se pasa a VexFlow. Si la notación no se puede cargar o está mal, se dice y no se dibuja nada.
// VexFlow (web/vendor/vexflow) se carga la primera vez que hace falta; el dibujo se guarda para que repintar la
// pantalla no lo haga parpadear.
import { h } from '../nucleo/dom.js';
import { prepararNotacion, sistemas } from '../../logica/partitura.js';

const ALTO = { partitura: 125, tablatura: 125, ambas: 215 }; // alto de cada línea, con sitio para plicas y anotaciones
const ART = { staccato: 'a.', acento: 'a>', tenuto: 'a-' };
const cacheJSON = new Map();   // fuente → Promise<json>
const cacheSVG = new Map();    // clave de dibujo → { html, alto, avisos }
let vexflow = null;

export function cargarVexFlow() {
  vexflow ??= new Promise((resolver, rechazar) => {
    if (window.VexFlow) return resolver(window.VexFlow);
    const s = document.createElement('script');
    s.src = '/web/vendor/vexflow/vexflow-bravura.js';
    s.onload = () => (window.VexFlow ? resolver(window.VexFlow) : rechazar(new Error('VexFlow no se ha cargado')));
    s.onerror = () => rechazar(new Error('No se ha podido cargar VexFlow'));
    document.head.append(s);
  }).then(async VF => { await document.fonts.load('30px Bravura').catch(() => {}); return VF; });
  return vexflow;
}

const cargarJSON = fuente => {
  if (!cacheJSON.has(fuente)) {
    cacheJSON.set(fuente, fetch(`/contenido/${fuente}`).then(r => { if (!r.ok) throw new Error(`No se encuentra ${fuente}`); return r.json(); }));
    cacheJSON.get(fuente).catch(() => cacheJSON.delete(fuente)); // un fallo de red no se queda guardado
  }
  return cacheJSON.get(fuente);
};

// La notación de una obra, ejercicio, sección o fragmento: la fuente y, si va recortada, sus compases.
export function fuenteDe(item, parte = null) {
  const n = { ...(item?.notacion || {}), ...(parte?.notacion || {}) };
  if (!n.fuente) return null;
  // Un fragmento sin notación propia recorta la de su obra por sus compases.
  const compases = parte?.notacion?.compases ?? (parte?.notacion?.fuente ? null : parte?.compases ?? null) ?? item?.notacion?.compases ?? null;
  return { fuente: n.fuente, compases };
}

// El nodo que va en el atril. vista: 'partitura' | 'tablatura' | 'ambas'.
export function notacionDibujada(item, parte, vista) {
  const src = fuenteDe(item, parte);
  if (!src) return h('p', { class: 'partitura__estado' }, 'Este contenido no tiene notación propia en la app.');
  const contenedor = h('div', { class: 'partitura', 'data-vista': vista, 'aria-label': `${vista === 'ambas' ? 'Partitura y tablatura' : vista === 'partitura' ? 'Partitura' : 'Tablatura'} de ${item.titulo ?? item.nombre ?? ''}`, role: 'img' });
  const pintar = ancho => {
    const clave = `${src.fuente}|${src.compases?.join('-') ?? ''}|${vista}|${ancho}`;
    const hecho = cacheSVG.get(clave);
    if (hecho) return mostrar(contenedor, hecho);
    contenedor.replaceChildren(h('p', { class: 'partitura__estado' }, 'Dibujando…'));
    Promise.all([cargarVexFlow(), cargarJSON(src.fuente)])
      .then(([VF, json]) => {
        const plan = prepararNotacion(json, { compases: src.compases });
        const r = plan.ok ? dibujar(VF, plan, vista, ancho) : { error: plan.avisos[0], errores: plan.errores };
        if (plan.ok) cacheSVG.set(clave, r);
        mostrar(contenedor, r);
      })
      .catch(e => mostrar(contenedor, { error: `No se ha podido dibujar la notación (${e.message}). No se muestra nada en su lugar.` }));
  };
  // El ancho se mide cuando el nodo ya está en la página.
  requestAnimationFrame(() => pintar(Math.max(280, Math.floor(contenedor.clientWidth || 720))));
  return contenedor;
}

// Una notación que no viene de un archivo del contenido (p. ej., la nota de una pregunta de lectura de la evaluación).
// Se dibuja igual, con un ancho fijo y sin caché.
export function notacionSuelta(json, vista = 'partitura', etiqueta = 'Notación', ancho = 240) {
  const contenedor = h('div', { class: 'partitura partitura--suelta', 'data-vista': vista, 'aria-label': etiqueta, role: 'img' }, h('p', { class: 'partitura__estado' }, 'Dibujando…'));
  cargarVexFlow()
    .then(VF => {
      const plan = prepararNotacion(json);
      mostrar(contenedor, plan.ok ? dibujar(VF, plan, vista, ancho) : { error: plan.avisos[0], errores: plan.errores });
    })
    .catch(e => mostrar(contenedor, { error: `No se ha podido dibujar la notación (${e.message}).` }));
  return contenedor;
}

function mostrar(contenedor, r) {
  if (r.error) {
    contenedor.replaceChildren(h('div', { class: 'partitura__estado partitura__estado--error' }, r.error,
      r.errores?.length ? h('details', null, h('summary', null, 'Qué falla'), h('ul', null, r.errores.slice(0, 8).map(e => h('li', null, e)))) : null));
    return;
  }
  const svg = document.createElement('div');
  svg.innerHTML = r.html;
  contenedor.replaceChildren(...svg.childNodes, ...r.avisos.map(a => h('p', { class: 'partitura__aviso' }, a)));
}

// Plan de dibujo → SVG con VexFlow. Devuelve el SVG como texto, para guardarlo.
export function dibujar(VF, plan, vista, ancho) {
  const { Renderer, Stave, TabStave, StaveNote, TabNote, GhostNote, Voice, Formatter, Beam, Accidental, Dot, Annotation, FretHandFinger,
    Articulation, StaveTie, TabTie, StaveConnector, Curve, Modifier } = VF;
  const lineas = sistemas(plan, ancho - 2, vista);
  const conPartitura = vista !== 'tablatura', conTab = vista !== 'partitura';
  // Lo que va encima de la primera nota (posición y, con dos voces, mano derecha o dinámica): el tempo va por encima.
  const m0 = plan.compases[0];
  const textoEncima = (m0.pos ? 1 : 0) + (m0.voces.length > 1 ? ['mano', 'din'].filter(k => m0.voces[0][0]?.[k]).length : 0);
  const margenArriba = plan.tempo && conPartitura ? 30 + 16 * textoEncima : 0;
  const altoLinea = ALTO[vista] + 40;
  // Se dibuja en la página (oculto) para poder medir lo que ocupa de verdad: plicas, líneas adicionales y anotaciones.
  const div = document.createElement('div');
  div.style.cssText = 'position:absolute;left:-10000px;top:0;visibility:hidden';
  document.body.append(div);
  const renderer = new Renderer(div, Renderer.Backends.SVG);
  renderer.resize(ancho, lineas.length * altoLinea + 90 + margenArriba);
  const ctx = renderer.getContext();
  const enlaces = []; // ligados y ligaduras: se dibujan cuando ya están todas las notas de la línea
  lineas.forEach((linea, l) => {
    const y = 40 + margenArriba + l * altoLinea;
    const notasLinea = [];
    for (const c of linea.compases) {
      const m = plan.compases[c.indice];
      const stave = conPartitura ? new Stave(c.x, y, c.ancho) : null;
      const tab = conTab ? new TabStave(c.x, conPartitura ? y + 95 : y, c.ancho) : null;
      if (c.primero) {
        stave?.addClef('treble', 'default', '8vb').addKeySignature(plan.armadura);
        tab?.addClef('tab');
        if (l === 0 && plan.compasVisible) (stave ?? tab).addTimeSignature(`${plan.compas.num}/${plan.compas.den}`);
        if (l === 0 && plan.tempo && stave) stave.setTempo({ duration: plan.tempo.figura ?? '4', bpm: plan.tempo.bpm }, -10 - 16 * textoEncima);
      }
      stave?.setContext(ctx).draw();
      tab?.setContext(ctx).draw();
      if (c.primero && stave && tab) new StaveConnector(stave, tab).setType('singleLeft').setContext(ctx).draw();
      const dosVoces = m.voces.length > 1;
      const vocesP = [], vocesT = [], notasP = [], notasT = [];
      m.voces.forEach((voz, v) => {
        const plica = !dosVoces ? undefined : v === 0 ? 1 : -1; // con dos voces, melodía arriba y bajo abajo
        const listaP = [], listaT = [];
        voz.forEach((n, k) => {
          const dur = n.duracion + (n.silencio ? 'r' : '');
          if (conPartitura) {
            const sn = new StaveNote({ keys: n.silencio ? [dosVoces ? (v === 0 ? 'e/5' : 'f/4') : 'b/4'] : n.claves, duration: dur, dots: n.puntillo ? 1 : 0, clef: 'treble', ...(plica ? { stemDirection: plica } : { autoStem: true }) });
            if (n.puntillo) Dot.buildAndAttach([sn], { all: true });
            for (const a of n.alteraciones) sn.addModifier(new Accidental(a.tipo), a.indice);
            if (n.dedo != null) sn.addModifier(new FretHandFinger(String(n.dedo)).setPosition(Modifier.Position.LEFT), 0);
            // Con dos voces, lo de la melodía va arriba y lo del bajo abajo, para que no choquen.
            const lado = dosVoces && v === 0 ? Annotation.VerticalJustify.TOP : Annotation.VerticalJustify.BOTTOM;
            if (n.mano && !conTab) sn.addModifier(new Annotation(n.mano).setFont('Academico', 11, 'normal', 'italic').setVerticalJustification(lado), 0);
            for (const a of n.art) sn.addModifier(new Articulation(ART[a]).setPosition(v === 1 ? Modifier.Position.BELOW : Modifier.Position.ABOVE), 0);
            if (n.din) sn.addModifier(new Annotation(n.din).setFont('Academico', 13, 'bold', 'italic').setVerticalJustification(lado), 0);
            if (k === 0 && v === 0 && m.pos) sn.addModifier(new Annotation(m.pos).setFont('Academico', 12, 'bold').setVerticalJustification(Annotation.VerticalJustify.TOP), 0);
            listaP.push(sn);
          }
          if (conTab) {
            const tn = n.silencio ? new GhostNote({ duration: n.duracion, dots: n.puntillo ? 1 : 0 })
              : new TabNote({ positions: n.tab.map(x => ({ str: x.cuerda, fret: x.traste })), duration: n.duracion, dots: n.puntillo ? 1 : 0 }, !conPartitura);
            if (!conPartitura && !n.silencio) tn.setStemDirection(-1); // en la tablatura sola, el ritmo va debajo
            if (!n.silencio && n.mano) tn.addModifier(new Annotation(n.mano).setFont('Academico', 11, 'normal', 'italic').setVerticalJustification(Annotation.VerticalJustify.BOTTOM), 0);
            if (!n.silencio && !conPartitura && k === 0 && v === 0 && m.pos) tn.addModifier(new Annotation(m.pos).setFont('Academico', 12, 'bold').setVerticalJustification(Annotation.VerticalJustify.TOP), 0);
            listaT.push(tn);
          }
          notasLinea.push({ n, sn: listaP.at(-1) ?? null, tn: listaT.at(-1) ?? null, v, compas: c.indice });
        });
        const hacerVoz = lista => new Voice({ numBeats: plan.compas.num, beatValue: plan.compas.den }).setMode(Voice.Mode.SOFT).addTickables(lista);
        if (conPartitura) { vocesP.push(hacerVoz(listaP)); notasP.push({ lista: listaP, plica }); }
        if (conTab) { vocesT.push(hacerVoz(listaT)); notasT.push({ lista: listaT, plica }); }
      });
      const fmt = new Formatter();
      if (vocesP.length) fmt.joinVoices(vocesP);
      if (vocesT.length) fmt.joinVoices(vocesT);
      const disponible = c.ancho - (c.primero ? c.cabecera : 0) - 24;
      fmt.format([...vocesP, ...vocesT], Math.max(40, disponible));
      const vigas = [
        ...notasP.flatMap(({ lista, plica }) => Beam.generateBeams(lista.filter(x => !x.isRest()), { maintainStemDirections: !!plica, ...(plica ? { stemDirection: plica } : {}) })),
        ...(!conPartitura ? notasT.flatMap(({ lista }) => Beam.generateBeams(lista.filter(x => x instanceof TabNote), { stemDirection: -1, maintainStemDirections: true })) : []),
      ];
      vocesP.forEach(v => v.draw(ctx, stave));
      vocesT.forEach(v => v.draw(ctx, tab));
      vigas.forEach(b => b.setContext(ctx).draw());
    }
    // Ligados (h, p) y ligaduras con la nota siguiente de la misma voz, si está en la misma línea.
    notasLinea.forEach((x, i) => {
      if (!x.n.lig && !x.n.tie) return;
      const sig = notasLinea.slice(i + 1).find(y => y.v === x.v && !y.n.silencio);
      if (!sig) return;
      enlaces.push({ x, sig });
    });
    for (const { x, sig } of enlaces.splice(0)) {
      const indices = { firstIndexes: [0], lastIndexes: [0] };
      if (x.sn && sig.sn) {
        if (x.n.tie) new StaveTie({ firstNote: x.sn, lastNote: sig.sn, ...indices }).setContext(ctx).draw();
        else new Curve(x.sn, sig.sn, { cps: [{ x: 0, y: 8 }, { x: 0, y: 8 }] }).setContext(ctx).draw();
      }
      if (x.tn && sig.tn) {
        const notas = { firstNote: x.tn, lastNote: sig.tn, ...indices };
        (x.n.lig === 'h' ? TabTie.createHammeron(notas) : x.n.lig === 'p' ? TabTie.createPulloff(notas) : new TabTie(notas)).setContext(ctx).draw();
      }
    }
  });
  // El alto justo: lo que se ha dibujado, con un margen (nada se corta, ni sobra papel).
  const svg = div.querySelector('svg');
  // La caja de lo que se ve, por los trazos (líneas, plicas, barras, líneas adicionales): los textos de la fuente musical
  // declaran cajas mucho más altas que el glifo. Con un margen para digitaciones, dinámicas y posiciones.
  let y0 = Infinity, y1 = 0;
  for (const el of svg.querySelectorAll('path, line')) {
    const r = el.getBBox();
    if (!r.width && !r.height) continue;
    y0 = Math.min(y0, r.y); y1 = Math.max(y1, r.y + r.height);
  }
  if (!Number.isFinite(y0)) { y0 = 0; y1 = lineas.length * altoLinea; }
  // Encima del pentagrama puede ir el tempo, la posición y, con dos voces, la mano derecha y la dinámica de la melodía.
  const conTextoArriba = plan.tempo || plan.compases.some(m => m.pos || (m.voces.length > 1 && m.voces[0].some(n => n.mano || n.din)));
  const arriba = Math.max(0, Math.floor(y0 - Math.max(conTextoArriba ? 52 : 18, margenArriba + 34)));
  const alto = Math.ceil(y1 + 22) - arriba;
  svg.setAttribute('height', alto);
  svg.setAttribute('viewBox', `0 ${arriba} ${ancho} ${alto}`);
  svg.setAttribute('width', ancho);
  svg.removeAttribute('style'); // VexFlow deja el tamaño del lienzo en «style», que mandaría sobre el alto justo
  const html = div.innerHTML;
  div.remove();
  return { html, alto, avisos: plan.avisos };
}
