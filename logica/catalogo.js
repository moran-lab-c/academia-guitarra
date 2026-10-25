// El catálogo: todo el contenido (programas, cursos y sus rutas, competencias, repertorio, ejercicios…) indexado
// por id y por tipo, más las relaciones que se calculan una vez al cargar (qué pasos trabajan cada competencia,
// en qué pasos aparece cada obra…). El tipo sale del prefijo del id; las áreas, del archivo contenido/areas.json.
const PREFIJOS = {
  'programa:': 'programa', 'curso:': 'curso', 'tramo:': 'tramo', 'paso:': 'paso', 'comp:': 'competencia',
  'obra:': 'obra', 'ej:': 'ejercicio', 'leccion:': 'leccion', 'diag:': 'diagnostico',
};
const PLURAL = {
  area: 'areas', programa: 'programas', curso: 'cursos', tramo: 'tramos', paso: 'pasos', competencia: 'competencias',
  obra: 'obras', ejercicio: 'ejercicios', leccion: 'lecciones', diagnostico: 'diagnosticos',
};

export function tipoDe(id) {
  if (typeof id !== 'string') return null;
  const p = Object.keys(PREFIJOS).find(k => id.startsWith(k));
  return p ? PREFIJOS[p] : null;
}

// «obra:tarrega.lagrima#B» → ['obra:tarrega.lagrima', 'B'].
export const separar = clave => { const [id, seccion = null] = String(clave).split('#'); return [id, seccion]; };

export function indexar(entidades) {
  const cat = { porId: new Map() };
  for (const plural of Object.values(PLURAL)) cat[plural] = [];
  for (const e of entidades) {
    cat.porId.set(e.id, e);
    if (PLURAL[e.tipo]) cat[PLURAL[e.tipo]].push(e);
  }
  const numCurso = id => cat.porId.get(id)?.numero ?? 0;
  cat.cursos.sort((a, b) => a.programa.localeCompare(b.programa) || a.numero - b.numero);
  cat.tramos.sort((a, b) => numCurso(a.curso) - numCurso(b.curso) || (a.orden ?? 0) - (b.orden ?? 0));
  cat.competencias.sort((a, b) => a.area.localeCompare(b.area) || a.nivel - b.nivel || a.id.localeCompare(b.id));
  cat.obras.sort((a, b) => (a.nivel?.curso ?? 99) - (b.nivel?.curso ?? 99) || a.titulo.localeCompare(b.titulo));
  relaciones(cat);
  return cat;
}

// Relaciones en los dos sentidos, calculadas a partir de lo que dice cada paso, ejercicio y obra (no se escriben dos veces).
function relaciones(cat) {
  const anadir = (mapa, clave, valor) => (mapa.get(clave) ?? mapa.set(clave, []).get(clave)).push(valor);
  cat.tramoDe = new Map();          // paso → tramo
  cat.tramosDe = new Map();         // curso → tramos en orden
  cat.pasosDe = new Map();          // competencia → pasos que la trabajan
  cat.pasosCon = new Map();         // obra (o «obra#sección») o ejercicio → pasos que la contienen
  cat.ejerciciosDe = new Map();     // competencia → ejercicios que la trabajan
  cat.finalDe = new Map();          // obra → cursos de los que es obra final
  for (const t of cat.tramos) {
    anadir(cat.tramosDe, t.curso, t);
    for (const id of t.pasos || []) cat.tramoDe.set(id, t);
  }
  for (const p of cat.pasos) {
    for (const c of p.trabaja || []) anadir(cat.pasosDe, c, p);
    for (const x of p.contenido || []) {
      anadir(cat.pasosCon, x, p);
      const [obra, seccion] = separar(x);
      if (seccion) anadir(cat.pasosCon, obra, p);
    }
  }
  for (const e of cat.ejercicios) for (const c of e.trabaja || []) anadir(cat.ejerciciosDe, c, e);
  for (const c of cat.cursos) if (c.obraFinal?.obra) anadir(cat.finalDe, c.obraFinal.obra, c);
}

// Las obras y ejercicios que añade él (o su profesor) viven en sus datos, no en el catálogo:
// así una actualización del contenido nunca los toca.
export function conPropio(entidades, estado) {
  const propio = estado?.contenidoPropio || {};
  return [
    ...entidades,
    ...(propio.obras || []).map(o => ({ origen: 'usuario', ...o, tipo: 'obra' })),
    ...(propio.ejercicios || []).map(e => ({ origen: 'usuario', ...e, tipo: 'ejercicio' })),
  ];
}

// Área a la que cuenta el tiempo de una cosa.
export function areaDe(item) {
  if (!item) return null;
  if (item.tipo === 'obra') return item.programa === 'flamenca' ? 'fl-toque' : 'repertorio';
  return item.area ?? null;
}

export const nombreDe = item => item?.nombre ?? item?.titulo ?? item?.id ?? '';

// Lo que pide una obra entera o una de sus secciones (la obra entera pide lo de todas sus partes).
export function pideDe(obra, seccion = null) {
  const secciones = seccion ? (obra.secciones || []).filter(s => s.id === seccion) : obra.secciones || [];
  return [...new Set([...(obra.pide || []), ...secciones.flatMap(s => s.pide || [])])];
}

export const seccionDe = (obra, id) => (id ? (obra?.secciones || []).find(s => s.id === id) ?? null : null);
