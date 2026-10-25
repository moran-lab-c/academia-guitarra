// Evaluaciones: el diagnóstico y los exámenes llegan en sus fases; aquí se dice qué habrá, sin fingir que ya está.
import { h } from '../nucleo/dom.js';
import { tarjeta } from '../componentes/comunes.js';

export default function evaluaciones() {
  return h('div', null,
    h('h1', null, 'Evaluaciones'),
    tarjeta(h('strong', null, 'Evaluación inicial (Fase 2)'),
      h('p', null, 'Mide cada área por separado, empieza en tu nivel probable y sube o baja según aciertes. Lo que superes queda convalidado y se confirma con dos comprobaciones en frío.')),
    tarjeta(h('strong', null, 'Exámenes de tramo y de curso (Fase 5)'),
      h('p', null, 'Cada prueba dice si la corrige la app, si es autoevaluada con criterios medibles, si la valora tu profesor o si va con grabación.')),
    tarjeta(h('strong', null, 'Ya funciona'),
      h('p', null, 'Las comprobaciones en frío de cada competencia y obra (desde su ficha o desde «¿Qué hago hoy?») y el paso de completado a dominado.')));
}
