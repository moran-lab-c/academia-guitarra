// Curso: el nivel, por dónde va y un solo botón principal. Lo demás (los tramos y sus lecciones) está para quien quiera
// mirar o volver atrás; nada se bloquea. El alumno no ve áreas, criterios ni estados internos.
import { h } from '../nucleo/dom.js';
import { datos, curriculo, cambiar } from '../nucleo/almacen.js';
import { enlace, ir } from '../nucleo/rutas.js';
import { continuar, resumenNivel, enElAtril, paraRepasar, cambiarNivel, progresoVacio } from '../../logica/curriculo.js';
import { momentoEntrada } from '../componentes/titulo.js';
import { textoRico } from '../componentes/texto.js';
import cursoAntiguo, { programaElegido } from './curso.js';
import { ctx } from '../nucleo/almacen.js';

const ETIQUETA_LECCION = { hecho: 'Hecho', practica: 'En práctica', empezada: 'Empezada', nueva: '' };

export const hrefDe = (dest) => enlace(dest.accion === 'repaso' ? '/repaso' : '/aprender', dest.entrada.paso.id);

// Ir a donde diga «Continuar».
export function irAContinuar() {
  const d = continuar(curriculo(), datos().estado.curriculo);
  if (d.entrada) ir(d.accion === 'repaso' ? '/repaso' : '/aprender', d.entrada.paso.id);
  else ir('/curso');
}

export default function nivel({ id } = {}) {
  // El programa flamenco sigue con lo suyo: este trabajo es solo del clásico.
  if (programaElegido(ctx()) === 'flamenca') return cursoAntiguo({ id });
  const ind = curriculo();
  const cur = datos().estado.curriculo ?? progresoVacio();
  const numero = id ? Number(String(id).replace('nivel:', '')) : (cur.nivel ?? 1);
  const niv = ind.niveles.find(n => n.numero === numero) ?? ind.niveles[0];
  const esActual = niv.numero === (cur.nivel ?? 1);
  const dest = continuar(ind, esActual ? cur : { ...cur, nivel: niv.numero, posicion: null });
  const r = resumenNivel(ind, cur, niv.numero);
  const encargo = (datos().estado.tareasProfesor || []).find(t => t.estado !== 'hecha' && t.estado !== 'cancelada');
  const atril = enElAtril(ind, cur);
  const repasos = paraRepasar(ind, cur).length;
  const ahora = dest.entrada;

  return h('div', { class: 'pantalla-nivel' },
    entrada(niv, r),
    h('nav', { class: 'niveles', 'aria-label': 'Niveles' }, ind.niveles.map(n => h('a', {
      class: 'pildora', href: enlace('/curso', n.id), 'aria-current': n.numero === niv.numero ? 'page' : null }, n.nombre))),
    h('header', { class: 'nivel-cabecera' },
      h('div', { class: 'pila-s' },
        h('div', { class: 'rotulo' }, `PROGRAMA CLÁSICO · NIVEL ${niv.numero} DE ${ind.niveles.length}`),
        h('h1', { class: 'display display-g' }, niv.nombre),
        ahora && h('p', { class: 'nivel-ahora' }, h('span', { class: 'suave' }, dest.accion === 'repaso' ? 'Un repaso: ' : 'Ahora: '),
          `Tramo ${ahora.tramo.numero} · `, textoRico(ahora.tramo.titulo), ' — ', ahora.leccion.titulo),
        dest.accion === 'siguiente-nivel' && h('p', { class: 'nivel-ahora' }, `Has recorrido todo el ${niv.nombre}.`),
        dest.accion === 'fin' && h('p', { class: 'nivel-ahora' }, 'Has recorrido todo el programa. El repertorio sigue en Obras.')),
      h('div', { class: 'nivel-accion' },
        encargo && h('div', { class: 'tarjeta tarjeta-encargo tarjeta-s' }, h('div', { class: 'rotulo rotulo-ocre' }, 'ENCARGO DE TU PROFESOR'), h('p', null, encargo.texto ?? encargo.detalle ?? '')),
        dest.entrada && h('a', { class: 'btn btn-papel btn-grande btn-continuar', href: hrefDe(dest), onclick: () => { if (!esActual) cambiar(e => { cambiarNivel((e.curriculo ??= progresoVacio()), niv.numero); }); } }, `${dest.etiqueta.toUpperCase()} ▶`),
        dest.accion === 'siguiente-nivel' && h('button', { type: 'button', class: 'btn btn-papel btn-grande btn-continuar', onclick: () => { cambiar(e => { cambiarNivel((e.curriculo ??= progresoVacio()), dest.otro.numero); }); ir('/curso'); } }, `${dest.etiqueta.toUpperCase()} ▶`))),
    h('div', { class: 'barra nivel-barra', role: 'progressbar', 'aria-valuenow': r.porcentaje, 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-label': 'Avance del nivel' }, h('i', { style: `width:${r.porcentaje}%` })),
    h('p', { class: 'pequeno suave' }, `${r.porcentaje} %`, (atril.length || repasos) ? ' · ' : '',
      atril.length ? h('span', null, 'En práctica: ', atril.map((e, i) => [i ? ' · ' : '', h('a', { href: enlace('/aprender', e.paso.id) }, nombreDeAtril(ind, e))])) : null,
      atril.length && repasos ? ' · ' : '',
      repasos ? `Para repasar: ${repasos}` : null),
    h('ol', { class: 'tramos lista-limpia' }, r.tramos.map(t => filaTramo(t, ahora))));
}

const nombreDeAtril = (ind, e) => (e.paso.obra ? ind.obraPorId.get(e.paso.obra)?.titulo : null) ?? ind.ejercicios[e.paso.ejercicios?.[0]]?.titulo ?? e.leccion.titulo;

function filaTramo(t, ahora) {
  const aqui = ahora?.tramo.id === t.id;
  return h('li', null, h('details', { class: `tramo${aqui ? ' tramo--ahora' : ''}`, open: aqui || null },
    h('summary', { class: 'tramo__cabecera' },
      h('span', { class: 'dato tramo__numero' }, String(t.numero).padStart(2, '0')),
      h('span', { class: 'tramo__titulo' }, textoRico(t.titulo)),
      h('span', { class: 'puntos', 'aria-hidden': 'true' }, t.lecciones.map(l => h('i', { class: `punto-leccion punto-leccion--${l.estado}` }))),
      h('span', { class: 'pequeno suave tramo__estado' }, aqui ? '← ahora' : t.hecho ? 'Hecho' : '')),
    h('ol', { class: 'lecciones lista-limpia' }, t.lecciones.map(l => h('li', null,
      h('a', { class: 'leccion-fila', href: enlace('/aprender', l.pasos[0].id), 'aria-current': ahora?.leccion.id === l.id ? 'step' : null },
        h('i', { class: `punto-leccion punto-leccion--${l.estado}` }), h('span', null, l.titulo),
        h('span', { class: 'pequeno suave empuja' }, ETIQUETA_LECCION[l.estado])))))));
}

// La entrada con tipografía cinética, la primera vez que entra en cada nivel.
function entrada(niv, r) {
  return momentoEntrada({
    etiqueta: 'PROGRAMA CLÁSICO', derecha: `${niv.numero} / 7`, titulo: niv.nombre,
    pie: `${r.tramos.length} tramos · ${r.tramos.flatMap(t => t.lecciones).length} lecciones`,
    accion: { texto: 'Entrar' }, clave: `entrada-${niv.id}`,
  });
}
