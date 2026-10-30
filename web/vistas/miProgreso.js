// Progreso: dónde está, cuánto lleva de cada nivel, sus obras en práctica y lo que toca repasar. Nada que interpretar.
import { h } from '../nucleo/dom.js';
import { datos, curriculo, ctx } from '../nucleo/almacen.js';
import { enlace } from '../nucleo/rutas.js';
import { continuar, resumenNivel, enElAtril, paraRepasar, progresoVacio } from '../../logica/curriculo.js';
import { textoRico } from '../componentes/texto.js';
import { programaElegido } from './curso.js';
import { hrefDe } from './nivel.js';

export default function miProgreso() {
  if (programaElegido(ctx()) === 'flamenca') return h('div', { class: 'pila' }, h('h1', { class: 'display display-g' }, 'Progreso'), h('p', { class: 'suave' }, 'El programa flamenco tendrá su propio progreso cuando se construya. Lo que ya hay está en Curso.'));
  const ind = curriculo();
  const cur = datos().estado.curriculo ?? progresoVacio();
  const dest = continuar(ind, cur);
  const atril = enElAtril(ind, cur, 6);
  const repasos = paraRepasar(ind, cur);
  return h('div', { class: 'pantalla-mi-progreso pila' },
    h('header', { class: 'cabecera' },
      h('div', { class: 'pila-s' }, h('div', { class: 'rotulo' }, 'PROGRAMA CLÁSICO'), h('h1', { class: 'display display-g' }, 'Progreso'),
        dest.entrada && h('p', { class: 'nivel-ahora' }, h('span', { class: 'suave' }, 'Estás en: '), `${dest.nivel.nombre} · Tramo ${dest.entrada.tramo.numero} · `, textoRico(dest.entrada.tramo.titulo))),
      dest.entrada && h('a', { class: 'btn btn-papel btn-grande', href: hrefDe(dest) }, `${dest.etiqueta.toUpperCase()} ▶`)),
    h('section', { class: 'pila-s' }, ind.niveles.map(n => {
      const r = resumenNivel(ind, cur, n.numero);
      return h('a', { class: 'nivel-fila', href: enlace('/curso', n.id) },
        h('strong', null, n.nombre),
        h('span', { class: 'barra' }, h('i', { style: `width:${r.porcentaje}%` })),
        h('span', { class: 'pequeno suave' }, `${r.porcentaje} %`),
        h('span', { class: 'pequeno suave nivel-fila__parecido' }, `≈ ${n.parecido}`));
    })),
    h('section', { class: 'rejilla-2' },
      h('div', { class: 'tarjeta pila-s' }, h('div', { class: 'rotulo' }, 'EN PRÁCTICA'),
        atril.length ? h('ul', { class: 'lista-limpia pila-s' }, atril.map(e => h('li', null, h('a', { href: enlace('/aprender', e.paso.id) }, e.paso.obra ? ind.obraPorId.get(e.paso.obra)?.titulo : ind.ejercicios[e.paso.ejercicios?.[0]]?.titulo ?? e.leccion.titulo))))
          : h('p', { class: 'suave' }, 'Nada de momento.')),
      h('div', { class: 'tarjeta pila-s' }, h('div', { class: 'rotulo' }, 'PARA REPASAR'),
        h('p', { class: 'suave' }, repasos.length ? `${repasos.length}. «Continuar» te los irá trayendo.` : 'Nada de momento.'))));
}
