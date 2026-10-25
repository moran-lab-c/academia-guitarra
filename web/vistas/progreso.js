// Progreso (lámina P6): por programa, los cursos (hechos, el actual, los que vienen), cada área con su nivel propio y
// si va por detrás, hecho frente a dominado, los minutos de la semana y lo que está a punto de olvidarse.
import { h } from '../nucleo/dom.js';
import { ctx } from '../nucleo/almacen.js';
import { enlace } from '../nucleo/rutas.js';
import { estadoEtiqueta, enlaceItem, nivelArea, fecha, plural, NOMBRE_PROGRAMA } from '../componentes/comunes.js';
import { colorArea } from '../componentes/marcas.js';
import { diasEntre } from '../../logica/fechas.js';
import { programaElegido } from './curso.js';
import { elegirPrograma } from './repertorio.js';

const dos = n => String(n).padStart(2, '0');

export default function progreso() {
  const c = ctx();
  const programa = programaElegido(c);
  const actual = c.cursoActual(programa);
  const cursos = c.cat.cursos.filter(x => x.programa === programa);
  const ref = c.resumen[programa]?.referencia ?? 0;
  const areas = c.cat.areas.filter(a => a.programa === programa || a.programa === 'comun');
  const pronto = [...c.dom].filter(([, x]) => x.proxima && diasEntre(c.hoy, x.proxima) <= 3)
    .map(([id, x]) => [c.cat.porId.get(id.split('#')[0]), x, id]).filter(([item]) => item && [programa, 'comun'].includes(item.programa))
    .sort((a, b) => a[1].proxima.localeCompare(b[1].proxima));

  return h('div', { class: 'pantalla-progreso pila' },
    h('header', { class: 'cabecera' },
      h('div', { class: 'pila-s' },
        h('div', { class: 'rotulo' }, `PROGRAMA ${NOMBRE_PROGRAMA[programa].toUpperCase()}${actual ? ` · CURSO ${dos(actual.numero)} DE ${dos(cursos.length)}` : ''}`),
        h('h1', { class: 'display display-g' }, 'Progreso'),
        h('p', { class: 'suave', style: 'max-width:46em' }, 'Hecho: lo has completado. Dominado: lo has vuelto a tocar en frío, sin ayuda y con días de por medio (tres aciertos espaciados). Cada área tiene su propio nivel: una floja no te baja de curso.'),
        h('a', { href: '#/evaluaciones', class: 'pequeno' }, 'Mi punto de partida: evaluación inicial por áreas →')),
      h('div', { class: 'segmentado', role: 'group', 'aria-label': 'Programa' },
        [['clasica', 'Clásico'], ['flamenca', 'Flamenco']].map(([v, t]) => h('button', { type: 'button', 'aria-pressed': String(v === programa), onclick: () => elegirPrograma(v) }, t)))),

    h('section', { class: 'tarjeta pila-s' },
      h('div', { class: 'rotulo' }, 'CURSOS'),
      h('ol', { class: 'lista-limpia fila', style: 'gap:8px' }, cursos.map(x => {
        const r = c.ruta(x.id);
        const estado = r.terminado ? '✓ terminado' : x.id === actual?.id ? `● ${r.progreso.hechos} de ${plural(r.progreso.total, 'paso')}` : x.borrador ? '○ en preparación' : '○ por llegar';
        return h('li', null, h('a', { class: 'pildora', href: enlace('/curso', x.id), 'aria-current': x.id === actual?.id ? 'step' : null },
          `${dos(x.numero)} · ${x.nombre}`, h('span', { class: 'pequeno suave' }, ` · ${estado}`)));
      }))),

    h('section', { class: 'rejilla-3' }, areas.map(a => {
      const n = c.niveles[a.id];
      const hechos = (n?.conteo.completado ?? 0) + (n?.conteo.dominado ?? 0) + (n?.conteo['necesita-repaso'] ?? 0);
      const detras = !['tecnica', 'repertorio', 'fl-tecnica', 'fl-toque'].includes(a.id) && n && !n.sinContenido && ref - n.nivel >= 1;
      return h('div', { class: 'tarjeta pila-s', style: `--c:${colorArea(a.id)}` },
        h('div', { class: 'fila-entre' }, h('a', { class: 'fila', style: 'gap:8px', href: a.id === 'repertorio' || a.id === 'fl-toque' ? '#/repertorio' : enlace('/area', a.id) }, h('i', { class: 'punto' }), h('strong', null, a.nombre)),
          detras && h('span', { class: 'ocre pequeno' }, `${plural(ref - n.nivel, 'nivel', 'niveles')} por detrás`)),
        nivelArea(n),
        n && !n.sinContenido && h('span', { class: 'pequeno suave' }, `${plural(hechos, 'hecha')} de ${n.total} · ${plural(n.conteo.dominado ?? 0, 'dominada')}${n.conteo['necesita-repaso'] ? ` · ${n.conteo['necesita-repaso']} para repasar` : ''}`),
        h('span', { class: 'pequeno suave' }, `Esta semana: ${c.minutos7d[a.id] ?? 0} min`));
    })),

    h('section', { class: 'tarjeta pila-s' },
      h('div', { class: 'rotulo' }, 'A PUNTO DE OLVIDARSE'),
      pronto.length ? h('ul', { class: 'lista-limpia pila-s' }, pronto.slice(0, 10).map(([item, x, id]) => h('li', { class: 'fila-entre' },
        h('span', null, enlaceItem(item), id.includes('#') ? ` (${id.split('#')[1]})` : ''),
        h('span', { class: 'pequeno suave' }, x.proxima <= c.hoy ? 'toca comprobarlo ya' : `comprobar el ${fecha(x.proxima)}`))))
        : h('p', { class: 'suave' }, 'Nada que comprobar en los próximos tres días.')),

    h('details', null, h('summary', null, 'Todo lo empezado, con su solidez'),
      h('table', null,
        h('tr', null, h('th', null, 'Qué'), h('th', null, 'Estado'), h('th', null, 'Solidez'), h('th', null, 'Próxima comprobación'), h('th', null, 'Última práctica')),
        [...c.dom].map(([id, x]) => [c.cat.porId.get(id.split('#')[0]), x, id]).filter(([item]) => item)
          .sort((a, b) => (a[1].proxima ?? '9').localeCompare(b[1].proxima ?? '9'))
          .map(([item, x, id]) => h('tr', null, h('td', null, enlaceItem(item), id.includes('#') ? ` (${id.split('#')[1]})` : ''), h('td', null, estadoEtiqueta(x.estado)),
            h('td', null, x.solidez ? `${Math.min(x.solidez, 3)} de 3${x.solidez > 3 ? ` (+${x.solidez - 3})` : ''}` : '—'),
            h('td', null, x.proxima ? fecha(x.proxima) : '—'), h('td', null, fecha(x.ultimaPractica)))))));
}
