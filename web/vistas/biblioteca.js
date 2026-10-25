// Biblioteca: las áreas del programa elegido, cada una con su nivel y su puerta de entrada.
import { h } from '../nucleo/dom.js';
import { enlace } from '../nucleo/rutas.js';
import { ctx, datos } from '../nucleo/almacen.js';
import { nivelArea } from '../componentes/comunes.js';

const NOMBRE = { clasica: 'Programa clásico', flamenca: 'Programa flamenco' };

export default function biblioteca() {
  const c = ctx(), p = datos().estado.preferencias || {};
  const programa = (p.programaPrincipal ?? p.rutaPrincipal ?? 'clasica') === 'flamenca' ? 'flamenca' : 'clasica';
  const areas = c.cat.areas.filter(a => (a.programa ?? a.ruta) === programa || (a.programa ?? a.ruta) === 'comun');
  const color = a => (a.id.startsWith('fl-') ? 'flamenco' : a.id);

  return h('div', null,
    h('header', { class: 'cabecera' },
      h('div', null, h('div', { class: 'rotulo' }, `Biblioteca · ${NOMBRE[programa]}`), h('h1', null, 'Áreas de estudio'),
        h('p', { class: 'lead' }, 'Cada área con su nivel. Entra en una para ver sus competencias y ejercicios; las obras están en Obras.'))),
    h('div', { class: 'rejilla' }, areas.map(a => {
      const n = c.cat.competencias.filter(x => x.area === a.id).length;
      const destino = a.id === 'repertorio' || a.id === 'fl-toque' ? '#/repertorio' : enlace('/area', a.id);
      return h('a', { class: 'tarjeta tarjeta-enlace', href: destino, style: `--c: var(--a-${color(a)}, var(--texto-3))` },
        h('div', { class: 'fila fila-entre' },
          h('div', { class: 'fila', style: 'gap:8px' }, h('span', { class: 'punto' }, ''), h('h3', { style: 'margin:0' }, a.nombre)),
          (a.programa ?? a.ruta) === 'comun' && h('span', { class: 'chip' }, 'Común')),
        h('p', { class: 'suave pequeno', style: 'margin:8px 0 14px' }, a.descripcion),
        nivelArea(c.niveles[a.id]),
        n > 0 && h('p', { class: 'dato', style: 'margin-top:10px' }, `${n} competencias`));
    })));
}
