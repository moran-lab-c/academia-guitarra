// Un paso del currículo: cada uno usa lo que necesita su contenido (texto, notación, acordes, preguntas, una obra…), sin
// plantilla. Abajo, Atrás y el botón del paso. La misma pantalla sirve para los repasos que intercala «Continuar».
import { h } from '../nucleo/dom.js';
import { datos, curriculo, cambiar, ctx } from '../nucleo/almacen.js';
import { enlace } from '../nucleo/rutas.js';
import { abrir, marcar, responderRepaso, esDePractica, progresoVacio } from '../../logica/curriculo.js';
import { acordesDe } from '../../logica/acordes.js';
import { PREGUNTAS } from '../../logica/preguntasPaso.js';
import { formatoPara } from '../../logica/recomendador.js';
import { tempoDe } from '../../logica/metronomo.js';
import { PROPOSITO } from '../../logica/planificador.js';
import { selectorFormato } from '../componentes/notacion.js';
import { barraMetronomo, estadoMetronomo } from '../componentes/metronomo.js';
import { diagramas } from '../componentes/acorde.js';
import { bloquePreguntas } from '../componentes/preguntasPaso.js';
import { bloquesDelPaso } from '../componentes/bloques.js';
import { textoRico } from '../componentes/texto.js';
import { irAContinuar } from './nivel.js';

// Los mensajes del guía: hoy un recuadro sobrio; mañana se cambia por un personaje sin tocar los datos.
const GUIA = new Set(['Consejo del profesor', '¿Sabías que…?', 'Esto te sirve para…', 'Fíjate en…']);
const ETIQUETA = { 'Comprobación del tramo': 'De principio a fin', '◇': 'Esto ya lo sabes', Nota: '', Técnica: 'Técnica', 'Obra conocida': 'Obra' };

export default function aprender({ id }, { repaso = false } = {}) {
  const ind = curriculo();
  const e = ind.porId.get(id);
  if (!e) return h('p', { class: 'suave' }, 'Este paso no existe.');
  const { paso, leccion, tramo, nivel, enLeccion } = e;
  const cur = datos().estado.curriculo ?? progresoVacio();
  // Desde aquí sigue «Continuar» (también si ha vuelto atrás a mirar algo). No en un repaso: no le mueve de donde iba.
  if (!repaso && cur.posicion !== id) queueMicrotask(() => { cambiar(est => { abrir((est.curriculo ??= progresoVacio()), e); }); });

  const anterior = enLeccion > 0 ? leccion.pasos[enLeccion - 1] : null;
  const estado = cur.pasos?.[id]?.e;
  const acciones = repaso ? botonesRepaso(e) : botonesPaso(e, estado);

  return h('div', { class: 'pantalla-paso' },
    h('div', { class: 'fila-entre' },
      h('a', { href: enlace('/curso', nivel.id), class: 'suave' }, `← ${nivel.nombre}`),
      h('span', { class: 'rotulo' }, `TRAMO ${tramo.numero}`)),
    h('header', { class: 'paso-cabecera' },
      h('p', { class: 'suave pequeno' }, textoRico(tramo.titulo)),
      h('h1', { class: 'display display-m' }, leccion.titulo),
      !repaso && h('p', { class: 'pasos-puntos', role: 'list', 'aria-label': `Paso ${enLeccion + 1} de ${leccion.pasos.length}` },
        leccion.pasos.map((p, i) => h('a', { role: 'listitem', href: enlace('/aprender', p.id), class: `paso-punto${i === enLeccion ? ' paso-punto--ahora' : ''}${cur.pasos?.[p.id] ? ' paso-punto--hecho' : ''}`, 'aria-label': `Paso ${i + 1}`, 'aria-current': i === enLeccion ? 'step' : null })))),
    h('article', { class: 'paso-cuerpo pila' },
      repaso && h('p', { class: 'rotulo rotulo-verde' }, 'UN REPASO · SIN CALENTAR'),
      contenido(e, ind, repaso),
      paso.porVerificar && h('p', { class: 'pequeno ocre' }, `Por verificar: ${paso.porVerificar}.`),
      paso.edicion && h('p', { class: 'pequeno suave' }, 'Esta obra se toca con una edición publicada: aquí está la lección, no la partitura.'),
      paso.apoyo && h('p', { class: 'pequeno suave' }, `Te ayudará tener antes: ${paso.apoyo.replace(/^necesita /, '')}.`)),
    h('footer', { class: 'paso-pie' },
      anterior ? h('a', { class: 'btn btn-fantasma', href: enlace('/aprender', anterior.id) }, '← Atrás') : h('span'),
      h('div', { class: 'fila' }, acciones)));
}

function contenido(e, ind, repaso) {
  const { paso } = e;
  // Un paso enriquecido enseña sus bloques; en un repaso, sin calentar, basta su versión corta.
  const def = !repaso && ind.enriquecido?.[paso.id];
  if (def) {
    const etiqueta = def.etiqueta ?? ETIQUETA[paso.tipo] ?? paso.tipo;
    return [etiqueta && h('div', { class: 'rotulo' }, etiqueta), bloquesDelPaso(def, paso.id, ind)];
  }
  const c = ctx();
  const obra = paso.obra ? ind.obraPorId.get(paso.obra) : null;
  const ficha = obra?.ficha ? c.cat.porId.get(obra.ficha) : null;
  const ejercicios = (paso.ejercicios ?? []).map(k => ind.ejercicios[k]).filter(Boolean);
  const items = (paso.notacion ?? []).map(x => c.cat.porId.get(x)).filter(Boolean);
  const principal = items[0] ?? null;
  const etiqueta = ETIQUETA[paso.tipo] ?? paso.tipo;
  const texto = paso.texto || (PREGUNTAS[paso.id] ? 'Unas preguntas sobre lo que acabas de ver.' : 'Compruébalo tú: si te sale, sigue.');
  const cuerpo = [
    h('p', { class: `paso-texto${GUIA.has(paso.tipo) ? ' paso-texto--guia' : ''}` }, textoRico(texto)),
    paso.lista && h('ul', null, paso.lista.map(x => h('li', null, textoRico(x)))),
  ];
  return [
    GUIA.has(paso.tipo)
      ? h('aside', { class: 'guia' }, h('div', { class: 'rotulo guia__tipo' }, paso.tipo), cuerpo)
      : [etiqueta && h('div', { class: 'rotulo' }, etiqueta), cuerpo],
    ejercicios.map(f => fichaEjercicio(f)),
    diagramas(acordesDe(paso)),
    items.map(item => h('div', { class: 'pila-s' }, items.length > 1 && h('strong', null, item.titulo), selectorFormato(item, formatoPara(item, c, { proposito: PROPOSITO[item.area] }), item.id))),
    !items.length && obra && h('div', { class: 'pila-s' },
      ficha?.notacion?.fuente && selectorFormato(ficha, formatoPara(ficha, c, {}), ficha.id),
      h('a', { class: 'obra-enlace', href: enlace('/obras', obra.id) }, h('span', { class: 'titulo-obra' }, obra.titulo), obra.compositor ? ` · ${obra.compositor}` : '', ' →')),
    (paso.recursos ?? []).includes('metronomo') && h('details', { class: 'paso-metronomo', open: estadoMetronomo().estado === 'sonando' || null }, h('summary', null, 'Metrónomo'),
      barraMetronomo({ clave: principal?.id ?? paso.id, tempo: tempoDe(c, principal?.id ?? paso.id, { contenido: principal }) })),
    bloquePreguntas(paso.id),
  ];
}

function fichaEjercicio(f) {
  if (!f.instrucciones && !f.bien && !f.errores) return null;
  return h('div', { class: 'tarjeta tarjeta-s pila-s ficha' },
    f.instrucciones && h('p', null, textoRico(f.instrucciones)),
    f.errores && h('p', { class: 'pequeno suave' }, 'Cuidado con: ', textoRico(f.errores)),
    f.bien && h('p', { class: 'pequeno' }, h('strong', null, 'Está bien cuando '), textoRico(f.bien)),
    f.porVerificar && h('p', { class: 'pequeno ocre' }, `Por verificar: ${f.porVerificar}`));
}

function botonesPaso(e, estado) {
  const hecho = resultado => () => {
    cambiar(est => { marcar((est.curriculo ??= progresoVacio()), e, resultado); });
    irAContinuar();
  };
  if (!esDePractica(e.paso)) return [h('button', { type: 'button', class: 'btn btn-papel btn-grande', onclick: hecho('hecho') }, 'Continuar ▶')];
  const ya = e.paso.tipo === '◇';
  return [
    h('button', { type: 'button', class: 'btn btn-borde', 'aria-pressed': estado === 'practica' ? 'true' : null, onclick: hecho('practica') }, ya ? 'Prefiero trabajarlo' : 'Sigo practicando'),
    h('button', { type: 'button', class: 'btn btn-papel btn-grande', onclick: hecho('hecho') }, ya ? 'Ya lo sé ▶' : 'Lo he aprendido ▶'),
  ];
}

function botonesRepaso(e) {
  const responder = r => () => {
    cambiar(est => { responderRepaso((est.curriculo ??= progresoVacio()), e, r); });
    irAContinuar();
  };
  return [
    h('button', { type: 'button', class: 'btn btn-borde', onclick: responder('no') }, 'No salió'),
    h('button', { type: 'button', class: 'btn btn-borde', onclick: responder('regular') }, 'Regular'),
    h('button', { type: 'button', class: 'btn btn-papel btn-grande', onclick: responder('bien') }, 'Bien ▶'),
  ];
}

export const repasar = params => aprender(params, { repaso: true });
