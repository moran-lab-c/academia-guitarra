// La ruta de cada curso: el camino de tramos y pasos, con el estado de cada paso, el sitio actual, los refuerzos que
// hacen falta antes de una obra y las relaciones en los dos sentidos (este paso prepara estas obras; esta obra
// necesita estas habilidades). Todo se calcula: no se guarda nada aparte del historial. Ver «Propuesta B+ y cursos».
//
// Estados de un paso en la ruta: dominado · hecho · repaso (hecho, pero toca reforzarlo) · actual · recomendado
// (desbloqueado: la app ya lo propone) · proximo · futuro. Ningún paso se bloquea: todos se pueden abrir.
import { estaHecho, criterioDe, valorarIntento, intentosPorItem, estadoDominio } from './dominio.js';
import { separar, pideDe, seccionDe, nombreDe } from './catalogo.js';
import { decimal } from './notacion.js';

const ORDEN_SITUACION = ['refuerzo', 'falta', 'estimada', 'por-consolidar', 'la-tienes'];

// Cómo está una competencia respecto a lo que la pide: la tienes (dominada), por consolidar (hecha o empezada),
// refuerzo (necesita repaso o falló en frío la última vez), estimada (el diagnóstico la da por sabida) o falta.
export function situacion(ctx, compId) {
  const est = ctx.estadoDe(compId);
  if (est === 'necesita-repaso' || ctx.dom.get(compId)?.ultimoFrio?.res === 'no') return 'refuerzo';
  if (est === 'dominado') return 'la-tienes';
  if (est === 'completado' || est === 'en-progreso') return 'por-consolidar';
  return estimada(ctx, compId) ? 'estimada' : 'falta';
}

// Sin practicar, pero el diagnóstico estimó su área por encima de su nivel: se confirma, no se vuelve a estudiar.
export function estimada(ctx, compId) {
  const c = ctx.cat.porId.get(compId);
  const n = c && ctx.niveles[c.area];
  return !!(n?.estimado && c.nivel <= n.nivel && ctx.estadoDe(compId) === 'pendiente');
}

// La obra (o una sección suya) que él ya sabía tocar antes de la academia: { nivel } o null.
export function conocida(ctx, obraId, seccion = null) {
  const k = ctx.estado.obras?.[obraId]?.conocida;
  if (!k) return null;
  if (k.nivel !== 'parcial' || !seccion) return k;
  return (k.secciones || []).includes(seccion) ? k : null;
}

// Las obras (o secciones) que contiene un paso.
const obrasDe = (ctx, paso) => (paso.contenido || []).filter(x => ctx.cat.porId.get(separar(x)[0])?.tipo === 'obra');
// Pasos que llevan una competencia a una obra (aplicación) o preparan una obra (preparación). Decisión de David
// (Fase 2.1): se separan tres cosas que antes iban juntas:
//   realizado   se ha trabajado la aplicación (evidencia de ese pasaje): basta para dar el paso por hecho;
//   aprendido   la competencia que aplica está adquirida (completada);
//   consolidado / dominado   lo dicen después las comprobaciones en frío de esa competencia.
// Trabajar el pasaje no significa dominarlo, y si la competencia falla después, el paso pasa a «repaso» y sale refuerzo.
// La preparación de la obra final es más que una aplicación (reúne el curso): además de su evidencia, pide su competencia.
const CON_OBRA = new Set(['aplicacion', 'preparacion']);
// Evidencia de haber trabajado una obra o sección: algún intento registrado de ella (o de la obra entera, que la
// contiene), o una práctica registrada para ese paso concreto.
const trabajada = (ctx, clave) => ctx.dom.has(clave) || (separar(clave)[1] != null && ctx.dom.has(separar(clave)[0]));
export const aplicacionTrabajada = (ctx, paso) => obrasDe(ctx, paso).every(k => trabajada(ctx, k)) || !!ctx.pasosPracticados?.has(paso.id);

// El estado de lo que contiene un paso, juntando sus competencias u obras.
export function estadoPaso(ctx, paso) {
  if (paso.clase === 'evaluacion') return estadoEvaluacion(ctx, paso);
  const claves = paso.clase === 'obra' ? obrasDe(ctx, paso) : paso.trabaja || [];
  if (!claves.length) return { estado: 'pendiente', claves };
  const estados = claves.map(k => ctx.estadoDe(k));
  const conocidaObra = paso.clase === 'obra' && claves.every(k => conocida(ctx, ...separar(k)));
  const porConfirmar = paso.clase !== 'obra' && claves.every(k => estimada(ctx, k));
  let estado = 'pendiente';
  if (claves.some(k => situacion(ctx, k) === 'refuerzo') && estados.every(estaHecho)) estado = 'repaso';
  else if (estados.every(e => e === 'dominado')) estado = 'dominado';
  else if (estados.every(estaHecho)) estado = 'hecho';
  else if (estados.some(e => e !== 'pendiente')) estado = 'en-curso';
  let faltaObra = false, etapas = null;
  if (CON_OBRA.has(paso.clase) && obrasDe(ctx, paso).length) {
    const solidez = k => ctx.dom.get(k)?.solidez ?? 0;
    etapas = {
      realizado: aplicacionTrabajada(ctx, paso), aprendido: estados.every(estaHecho),
      consolidado: estados.every(estaHecho) && claves.every(k => solidez(k) >= 2), dominado: estados.every(e => e === 'dominado'),
    };
    // Sin evidencia de la obra no está hecha (ni en repaso), aunque la competencia esté aprendida. Con evidencia, está
    // hecha (realizada) aunque la competencia aún no lo esté; en repaso si la competencia ha fallado después.
    if (!etapas.realizado) { faltaObra = etapas.aprendido; estado = 'pendiente'; }
    else if (paso.clase === 'preparacion' && !etapas.aprendido) estado = estados.some(e => e !== 'pendiente') || etapas.realizado ? 'en-curso' : 'pendiente';
    else estado = claves.some(k => situacion(ctx, k) === 'refuerzo') ? 'repaso' : etapas.dominado ? 'dominado' : 'hecho';
  }
  return { estado, claves, conocida: conocidaObra && estado === 'pendiente', porConfirmar, faltaObra, etapas };
}

// El cierre de un tramo se hace solo: cuando todo lo del tramo se ha comprobado en frío días después (solidez 2 o más).
function estadoEvaluacion(ctx, paso) {
  const tramo = ctx.cat.tramoDe.get(paso.id);
  const claves = clavesDelTramo(ctx, tramo);
  if (!claves.length) return { estado: 'pendiente', claves };
  const solidez = k => ctx.dom.get(k)?.solidez ?? 0;
  const estado = claves.every(k => solidez(k) >= 3) ? 'dominado' : claves.every(k => solidez(k) >= 2) ? 'hecho' : 'pendiente';
  return { estado, claves };
}

// Lo que se comprueba en el cierre: lo que frena el tramo (la lectura no, salvo que el tramo la exija).
const clavesDelTramo = (ctx, tramo) => [...new Set((tramo?.pasos || []).map(id => ctx.cat.porId.get(id)).filter(p => p && frena(p, tramo))
  .flatMap(p => (p.clase === 'obra' ? obrasDe(ctx, p) : p.trabaja || [])))];

const HECHO = new Set(['hecho', 'dominado', 'repaso']);
// La lectura avanza a su ritmo: sus pasos (de habilidad o una obra para leer) se recomiendan, pero no frenan la ruta ni el
// curso (decisión del 25/10/2026). Si un tramo necesita de verdad una lectura, lo declara en sus datos: «exige».
export const esLectura = p => p.area === 'lectura' || p.papel === 'lectura';
const frena = (p, tramo) => p.clase !== 'evaluacion' && ((tramo?.exige || []).includes(p.id) || (p.nucleo !== false && !esLectura(p)));
// Un curso tiene ruta cuando al menos un tramo tiene pasos (un curso en borrador puede no tener ninguno).
export const tieneRuta = (ctx, cursoId) => (ctx.cat.tramosDe.get(cursoId) || []).some(t => t.pasos?.length);

// La ruta de un curso, lista para dibujar y para planificar.
export function rutaDelCurso(ctx, cursoId) {
  const curso = ctx.cat.porId.get(cursoId);
  if (!curso || curso.tipo !== 'curso') return null;
  const tramos = ctx.cat.tramosDe.get(curso.id) || [];
  const elegido = ctx.estado.focos?.tramo?.[curso.programa];
  const L = ctx.niveles.lectura?.efectivo ?? 0;
  let numero = 0, anteriorHecho = true, abiertoVisto = false, siguienteMarcado = false;
  const hechosIds = new Set();
  const res = { curso, tramos: [], actual: null, final: null, siguienteCurso: null, progreso: { hechos: 0, total: 0 } };

  for (const t of tramos) {
    const pasos = (t.pasos || []).map(id => ctx.cat.porId.get(id)).filter(Boolean);
    const base = pasos.map(p => ({ p, e: estadoPaso(ctx, p) }));
    const sinEvaluar = base.filter(x => frena(x.p, t));
    const vacio = !pasos.length;
    const empezado = base.some(x => x.e.estado !== 'pendiente');
    const abierto = !vacio && (anteriorHecho || elegido === t.id || empezado) && !(t.cierre && !anteriorHecho);
    const hecho = !vacio && base.every(x => HECHO.has(x.e.estado));
    const completo = !vacio && sinEvaluar.every(x => HECHO.has(x.e.estado)); // lo que frena la ruta, hecho
    const tramo = { id: t.id, orden: t.orden, titulo: t.titulo, objetivos: t.objetivos || [], obraEje: t.obraEje ?? null, borrador: !!t.borrador || vacio,
      cierre: !!t.cierre, estado: hecho ? 'hecho' : abierto ? 'abierto' : 'por-llegar', alcanzado: abierto, completo, hechos: 0, total: pasos.length, pasos: [] };
    const esSiguiente = !abierto && !siguienteMarcado && abiertoVisto;
    for (const { p, e } of base) {
      numero++;
      let estado;
      if (HECHO.has(e.estado)) estado = e.estado;
      else if (!abierto) estado = esSiguiente ? 'proximo' : 'futuro';
      else if (p.clase === 'evaluacion') estado = sinEvaluar.every(x => HECHO.has(x.e.estado)) ? 'recomendado' : 'proximo';
      else if ((p.requiere || []).every(id => hechosIds.has(id) || HECHO.has(estadoPaso(ctx, ctx.cat.porId.get(id) || {}).estado))) estado = 'recomendado';
      else estado = 'proximo';
      if (HECHO.has(e.estado)) { hechosIds.add(p.id); tramo.hechos++; }
      tramo.pasos.push(vistaPaso(ctx, p, e, estado, numero));
    }
    if (abierto) abiertoVisto = true;
    if (esSiguiente) siguienteMarcado = true;
    anteriorHecho = anteriorHecho && completo && !t.borrador; // un tramo sin contenido todavía no deja pasar al cierre
    res.tramos.push(tramo);
    res.progreso.hechos += tramo.hechos;
    res.progreso.total += tramo.total;
  }

  insertarRefuerzos(ctx, res, L);

  // El sitio actual: lo recomendado que ya está empezado; si no, lo primero recomendado (lo que el diagnóstico da por
  // sabido se confirma en frío y no cuenta como sitio actual).
  const recomendados = res.tramos.flatMap(t => t.pasos).filter(p => p.estado === 'recomendado' && !p.insertado && !p.porConfirmar && p.tipo !== 'evaluacion');
  // La lectura (pasos de lectura y obras para leer) sigue recomendada, pero no marca el sitio: tampoco cuando es lo único
  // que queda (entonces no hay «Ahora» y la ruta dice que lo demás está hecho).
  const principales = recomendados.filter(p => !esLectura(p));
  const actual = principales.find(p => p.enCurso) ?? principales[0] ?? null;
  if (actual) { actual.estado = 'actual'; res.actual = actual.id; }

  res.final = finalDelCurso(ctx, curso, res);
  if (res.final) { res.progreso.total++; if (res.final.estado === 'hecho') res.progreso.hechos++; }
  const siguiente = ctx.cat.cursos.find(c => c.programa === curso.programa && c.numero === curso.numero + 1);
  res.siguienteCurso = siguiente ? { id: siguiente.id, numero: siguiente.numero, nombre: siguiente.nombre, enPreparacion: !tieneRuta(ctx, siguiente.id) } : null;
  res.terminado = !!res.final && res.final.estado === 'hecho' && res.tramos.every(t => t.completo);
  res.continuidad = continuidad(res);
  res.areas = areasDelCurso(ctx, res);
  res.obras = obrasDelCurso(ctx, curso, res);
  return res;
}

// Cuando no queda nada que recomendar en la ruta (y el curso no está terminado, o lo está y el siguiente no tiene ruta),
// por qué: se esperan las comprobaciones de un cierre, o lo que queda está en preparación. La sesión sigue con
// consolidación (comprobaciones, refuerzos y repertorio) y la pantalla lo dice. null si hay algo que hacer en la ruta.
function continuidad(res) {
  const quedan = res.tramos.flatMap(t => t.pasos).some(p => ['actual', 'recomendado'].includes(p.estado) && p.tipo !== 'evaluacion' && !esLectura(p) && !p.insertado);
  if (quedan || (res.final && res.final.estado === 'recomendado')) return null;
  const tramos = res.tramos.filter(t => t.borrador).map(t => ({ orden: t.orden, titulo: t.titulo }));
  const cierres = res.tramos.filter(t => t.estado === 'abierto').flatMap(t => t.pasos).filter(p => p.tipo === 'evaluacion' && !HECHO.has(p.estado));
  const siguiente = res.siguienteCurso?.enPreparacion ? res.siguienteCurso : null;
  if (!cierres.length && !tramos.length && !siguiente) return null;
  return { motivo: cierres.length ? 'cierres' : 'en-preparacion', cierres: cierres.map(p => p.id), tramosEnPreparacion: tramos, siguienteCurso: siguiente };
}

function vistaPaso(ctx, p, e, estado, numero) {
  const obraClave = (p.contenido || []).find(x => ctx.cat.porId.get(separar(x)[0])?.tipo === 'obra') ?? null;
  // Una obra para leer cuenta como lectura (color, mapa y planificador); las demás obras, como repertorio.
  const area = p.area ?? ctx.cat.porId.get((p.trabaja || [])[0])?.area ?? (p.papel === 'lectura' ? 'lectura' : p.clase === 'obra' ? (p.programa === 'flamenca' ? 'fl-toque' : 'repertorio') : null);
  const fallo = p.clase === 'obra' && obraClave && estado !== 'hecho' && estado !== 'dominado' ? falloEnFrio(ctx, obraClave) : null;
  const encargo = (ctx.estado.tareasProfesor || []).some(t => t.estado !== 'hecha' && t.estado !== 'cancelada' && (!t.hasta || t.hasta >= ctx.hoy)
    && t.item && ((p.trabaja || []).includes(t.item) || (p.contenido || []).some(x => separar(x)[0] === t.item)));
  let detalle = null;
  if (e.conocida) detalle = 'La conoces: se comprueba, no se aprende de cero';
  else if (fallo) detalle = textoFallo(fallo);
  else if (e.faltaObra) detalle = `La técnica ya está; falta aplicarla en ${tituloClave(ctx, obraClave)}`;
  else if (e.porConfirmar) detalle = 'El diagnóstico lo da por sabido: se confirma en frío';
  else if (estado === 'repaso') detalle = 'Toca reforzarlo';
  return {
    id: p.id, numero, tipo: p.clase, papel: p.papel ?? null, area, titulo: p.titulo, objetivo: p.objetivo ?? null, detalle, estado,
    enCurso: e.estado === 'en-curso', encargo, conocida: !!e.conocida, porConfirmar: !!e.porConfirmar, faltaObra: !!e.faltaObra, etapas: e.etapas ?? null, recuperar: fallo, insertado: false,
    obra: obraClave, claves: e.claves, href: `#/paso/${encodeURIComponent(p.id)}`,
  };
}

const tituloClave = (ctx, clave) => {
  const [id, s] = separar(clave);
  const obra = ctx.cat.porId.get(id);
  return `${obra?.titulo ?? id}${s ? `, ${minuscula(seccionDe(obra, s)?.titulo) ?? s}` : ''}`;
};
const NOMBRE_ASPECTO = {
  precision: 'las notas', ritmo: 'el ritmo', continuidad: 'la continuidad', limpieza: 'la limpieza', control: 'el control', sonido: 'el sonido',
  dinamica: 'la dinámica', articulacion: 'la articulación', fraseo: 'el fraseo', memoria: 'la memoria',
};

// Una obra (o sección) cuya última comprobación en frío ha fallado (resultado «no»), sea nueva, aprendida, consolidada o
// conocida de antes (decisión de David, Fase 2.1). Dice qué aspectos fallaron (los marcados «mal»; si no hay, los
// marcados «con fallos») y qué competencias de las que pide los trabajan (las que miran esos aspectos en su criterio).
// No inventa diagnósticos: si no consta qué aspecto falló, o ninguna competencia lo trabaja, lo dice (indeterminado) y
// no propone un refuerzo concreto. null si no hay comprobación en frío o la última no falló. No reinicia la obra.
export function falloEnFrio(ctx, clave) {
  const [id, seccion] = separar(clave);
  const obra = ctx.cat.porId.get(id);
  const ultimo = ctx.eventos.filter(ev => ev.tipo === 'practica' && ev.item === id && (ev.seccion ?? null) === seccion && !ev.fragmento
    && (ev.modo === 'comprobacion' || ev.enFrio === true)).sort((a, b) => a.t.localeCompare(b.t)).at(-1);
  if (!ultimo || !obra) return null;
  const crit = criterioDe(obra, ctx.estado.ajustes?.[clave] ?? ctx.estado.ajustes?.[id]);
  if (valorarIntento({ ...ultimo, enFrio: true }, crit) !== 'no') return null;
  const marcado = d => ultimo.calidad?.[d];
  const mal = crit.dimensiones.filter(d => marcado(d) === 'mal');
  const aspectos = mal.length ? mal : crit.dimensiones.filter(d => marcado(d) === 'fallos');
  const comps = pideDe(obra, seccion).map(c => ({ c, n: criterioDe(ctx.cat.porId.get(c)).dimensiones.filter(d => aspectos.includes(d)).length }))
    .filter(x => x.n > 0).sort((a, b) => b.n - a.n).map(x => x.c);
  const indeterminado = !aspectos.length ? 'aspecto' : !comps.length ? 'competencia' : null;
  return { aspectos, comps, indeterminado, conocida: !!conocida(ctx, id, seccion), fecha: ultimo.t.slice(0, 10) };
}

const textoAspectos = f => f.aspectos.map(d => NOMBRE_ASPECTO[d] ?? d).join(', ');
function textoFallo(f) {
  if (f.indeterminado === 'aspecto') return 'La comprobación en frío falló, pero no consta en qué aspecto: repásala entera valorando cada aspecto para saber qué reforzar';
  if (f.indeterminado === 'competencia') return `La comprobación en frío falló en ${textoAspectos(f)}; ninguna competencia de la ruta lo trabaja todavía: revísalo en la propia obra`;
  return f.conocida ? `La conocías; la comprobación falló en ${textoAspectos(f)}: se recupera, no se aprende de cero` : `La comprobación en frío falló en ${textoAspectos(f)}: se refuerza eso y se vuelve a la obra`;
}

// Antes de una obra (o de su aplicación) que está al alcance, la ruta pide reforzar lo que esa obra necesita y está
// flojo: lo que falló en frío o necesita repaso, lo que falló en la comprobación de una obra que ya conocía, y la
// lectura si la obra es para leer y la lectura no llega. Un paso en «repaso» también cuenta (toca reforzarlo).
// Cada necesidad se refuerza una sola vez por tramo, antes del primer paso que la necesita, y guarda todos sus
// orígenes (p. ej., la aplicación y la obra de la parte B): un problema, varios motivos, un solo ejercicio.
const SIN_REFUERZO = new Set(['hecho', 'dominado']);
const MAX_REFUERZOS_POR_PASO = 2;
function insertarRefuerzos(ctx, res, L) {
  for (const tramo of res.tramos) {
    if (tramo.estado !== 'abierto') continue;
    const enTramo = new Set(tramo.pasos.filter(p => !HECHO.has(p.estado)).flatMap(p => p.claves || []));
    const nuevos = [], porComp = new Map(); // competencia → refuerzo ya insertado en este tramo
    for (const p of tramo.pasos) {
      if (!['obra', 'aplicacion'].includes(p.tipo) || SIN_REFUERZO.has(p.estado) || !p.obra) continue;
      const [obraId, seccion] = separar(p.obra);
      const obra = ctx.cat.porId.get(obraId);
      const motivoObra = tituloClave(ctx, p.obra);
      const lista = pideDe(obra, seccion).filter(c => situacion(ctx, c) === 'refuerzo')
        .map(c => ({ comp: c, porLectura: false, causa: ctx.estadoDe(c) === 'necesita-repaso' ? 'Necesita repaso' : 'Falló en frío' }))
        .map(x => ({ ...x, motivo: `${x.causa} y la pide ${motivoObra}` }));
      for (const c of p.recuperar?.comps || []) {
        if (!lista.some(x => x.comp === c)) lista.push({ comp: c, porLectura: false, motivo: `La comprobación de ${motivoObra} falló en ${textoAspectos(p.recuperar)}, y eso lo trabaja` });
      }
      // Una obra para leer que pide más que el nivel de lectura que está trabajando (el alcanzado + 1, la misma regla que
      // para cualquier área) se prepara con una competencia de lectura de su nivel que aún no tenga hecha. Sin umbrales
      // de «medio nivel»: si la obra está en su nivel de trabajo, ella misma es el recurso (ver el planificador).
      const pideLectura = (seccionDe(obra, seccion)?.lecturaNecesaria ?? obra.lecturaNecesaria?.nivel) ?? null;
      if (p.papel === 'lectura' && pideLectura != null && pideLectura > nivelLecturaTrabajo(ctx)) {
        const lectura = ctx.cat.competencias.find(c => c.area === 'lectura' && c.programa !== otroPrograma(res.curso.programa)
          && c.nivel <= nivelLecturaTrabajo(ctx) && !estaHecho(ctx.estadoDe(c.id)) && !enTramo.has(c.id));
        if (lectura) lista.push({ comp: lectura.id, porLectura: true, motivo: `Para leer ${motivoObra}: pide lectura de nivel ${decimal(pideLectura)} y ahora trabajas el ${nivelLecturaTrabajo(ctx)} (tu lectura: ${decimal(L)})` });
      }
      let nuevosAqui = 0;
      for (const r of lista) {
        const origen = { paso: p.id, tipo: p.tipo, obra: p.obra, causa: r.causa ?? null, motivo: r.motivo };
        const ya = porComp.get(r.comp);
        if (ya) { ya.origenes.push(origen); continue; } // la misma necesidad, otro origen: no se repite el ejercicio
        if (nuevosAqui >= MAX_REFUERZOS_POR_PASO) continue;
        nuevosAqui++;
        const c = ctx.cat.porId.get(r.comp);
        const paso = {
          id: `refuerzo:${p.id}:${r.comp}`, numero: null, tipo: 'refuerzo', papel: null, area: c.area, titulo: nombreDe(c), objetivo: null,
          detalle: r.motivo, estado: 'recomendado', enCurso: false, encargo: false, conocida: false, porConfirmar: false, insertado: true,
          obra: p.obra, claves: [r.comp], comp: r.comp, porLectura: r.porLectura, origenes: [origen], href: `#/competencia/${encodeURIComponent(r.comp)}`,
        };
        porComp.set(r.comp, paso);
        nuevos.push({ antes: p.id, paso });
      }
    }
    // Con varios orígenes, el texto los nombra todos: «Falló en frío y la piden la aplicación y la obra de Lágrima, parte B».
    const PAPEL = { aplicacion: 'la aplicación', obra: 'la obra' };
    for (const r of porComp.values()) if (r.origenes.length > 1) {
      const obras = [...new Set(r.origenes.map(o => tituloClave(ctx, o.obra)))].join(' y ');
      const pasos = [...new Set(r.origenes.map(o => PAPEL[o.tipo] ?? o.tipo))].join(' y ');
      const causa = r.origenes[0].causa;
      r.detalle = causa ? `${causa} y la piden ${pasos} de ${obras}` : `${r.detalle} (también la piden ${pasos} de ${obras})`;
    }
    for (const n of nuevos) tramo.pasos.splice(tramo.pasos.findIndex(p => p.id === n.antes), 0, n.paso);
  }
}

const otroPrograma = p => (p === 'clasica' ? 'flamenca' : 'clasica');
// El nivel de lectura en el que trabaja: el alcanzado + 1 (como en todas las áreas).
export const nivelLecturaTrabajo = ctx => Math.floor(ctx.niveles.lectura?.nivel ?? 0) + 1;
const minuscula = t => (t ? t[0].toLowerCase() + t.slice(1) : t); // «Parte B» → «parte B»

// La obra final con sus requisitos. Su progreso usa el modelo de siempre, con el criterio de la obra más lo que pide el
// curso (p. ej., de memoria). Decisión de David (Fase 2.1):
//   primera realización: la obra entera sale como pide su criterio normal (puede ser leyendo);
//   aprendida con requisitos: hecha la preparación del tramo de cierre, una pasada válida de la obra entera, de memoria
//     y con todos sus aspectos bien → la obra final queda hecha y permite cerrar el curso. Las pasadas son las de su
//     criterio (1 por defecto) o las que ajuste el profesor: aquí no se impone ningún mínimo;
//   consolidada: solidez 2 con esos requisitos (comprobaciones en frío días después): nivel posterior, no hace falta
//     para pasar de curso;
//   dominada: el «dominado» de siempre, con esos requisitos.
// Una pasada leyendo, o antes de la preparación, no la cierra; una pasada válida no la consolida. La grabación es
// evidencia opcional («la he grabado») y no se exige hasta que forme parte de la evaluación (Fase 5): se muestra, pero
// no bloquea.
export const REQUISITOS_EXIGIBLES = ['memoria'];
// «de memoria (grabada, opcional por ahora)»: los requisitos como se leen en la ruta y en la obra.
export function textoRequisitos(requisitos = []) {
  const exigibles = requisitos.filter(r => REQUISITOS_EXIGIBLES.includes(r)).map(r => (r === 'memoria' ? 'de memoria' : r));
  const opcionales = requisitos.filter(r => !REQUISITOS_EXIGIBLES.includes(r)).map(r => (r === 'grabacion' ? 'grabada' : r));
  if (!exigibles.length && !opcionales.length) return null;
  return [exigibles.join(' y '), opcionales.length ? `(${opcionales.join(' y ')}, opcional por ahora)` : ''].filter(Boolean).join(' ');
}
export function progresoFinal(ctx, obraId, requisitos = [], { preparada = false } = {}) {
  const obra = ctx.cat.porId.get(obraId);
  const propio = ctx.estado.ajustes?.[obraId];
  const ajuste = { ...(propio || {}), ...(requisitos.includes('memoria') ? { memoria: true } : {}) };
  const crit = criterioDe(obra, ajuste);
  const eventos = ctx.eventos.filter(ev => ev.tipo === 'practica' && ev.item === obraId && !ev.seccion && !ev.fragmento);
  const intentos = intentosPorItem(eventos, ctx.cat, { [obraId]: ajuste }).get(obraId);
  const dom = estadoDominio(intentos, ctx.hoy);
  const okConRequisitos = eventos.filter(ev => valorarIntento({ ...ev, enFrio: ev.modo === 'comprobacion' || ev.enFrio === true }, crit) === 'ok');
  const cumple = {
    memoria: requisitos.includes('memoria') ? okConRequisitos.length > 0 : null,
    grabacion: requisitos.includes('grabacion') ? okConRequisitos.some(ev => ev.grabacion === true) : null,
  };
  const requisitosOk = requisitos.filter(r => REQUISITOS_EXIGIBLES.includes(r)).every(r => cumple[r] !== false);
  const aprendida = preparada && estaHecho(dom.estado) && requisitosOk;
  return {
    primera: estaHecho(ctx.estadoDe(obraId)), preparada, pasadas: crit.pasadas, ajustadoPor: propio?.pasadas != null ? (propio.por ?? 'yo') : null, aprendida, consolidada: aprendida && dom.solidez >= 2, dominada: aprendida && dom.estado === 'dominado',
    requisitos: requisitos.map(r => ({ id: r, cumplido: cumple[r], exigible: REQUISITOS_EXIGIBLES.includes(r) })), solidez: dom.solidez, estadoConRequisitos: dom.estado,
  };
}

function finalDelCurso(ctx, curso, res) {
  if (!curso.obraFinal) return null;
  const obra = ctx.cat.porId.get(curso.obraFinal.obra);
  if (!obra) return null;
  const cierre = res.tramos.find(t => t.cierre);
  const preparada = cierre ? cierre.pasos.filter(p => p.tipo === 'preparacion').every(p => HECHO.has(p.estado)) : true;
  const requisitos = curso.obraFinal.requisitos || [];
  const progreso = progresoFinal(ctx, obra.id, requisitos, { preparada });
  // Recomendada solo cuando la ruta llega al tramo de cierre (no porque sus pasos se hayan hecho antes de tiempo).
  const estado = progreso.aprendida ? 'hecho' : cierre?.alcanzado ? (preparada ? 'recomendado' : 'proximo') : 'futuro';
  return {
    id: `final:${curso.id}`, obra: obra.id, titulo: `${obra.titulo}, completa`,
    detalle: textoRequisitos(requisitos),
    requisitos, progreso, justificacion: curso.obraFinal.justificacion, estado, conocida: !!conocida(ctx, obra.id),
    href: `#/obra/${encodeURIComponent(obra.id)}`,
  };
}

function areasDelCurso(ctx, res) {
  const cuenta = new Map();
  for (const p of res.tramos.flatMap(t => t.pasos)) {
    if (p.insertado) continue;
    const areas = new Set((p.claves || []).map(k => ctx.cat.porId.get(k)?.area ?? (ctx.cat.porId.get(separar(k)[0])?.tipo === 'obra' ? 'repertorio' : null)).filter(Boolean));
    if (!areas.size && p.area) areas.add(p.area);
    for (const a of areas) cuenta.set(a, (cuenta.get(a) ?? 0) + 1);
  }
  return [...cuenta].map(([area, pasos]) => ({ area, nombre: ctx.cat.porId.get(area)?.nombre ?? area, pasos })).sort((a, b) => b.pasos - a.pasos);
}

function obrasDelCurso(ctx, curso, res) {
  const porObra = new Map();
  for (const t of res.tramos) for (const p of t.pasos) {
    if (!p.obra || p.insertado) continue;
    const [id, seccion] = separar(p.obra);
    const x = porObra.get(id) ?? porObra.set(id, { obra: ctx.cat.porId.get(id), papeles: new Set(), tramos: new Set(), secciones: new Set() }).get(id);
    x.papeles.add(p.papel ?? (p.tipo === 'aplicacion' ? 'aplicacion' : 'obra'));
    x.tramos.add(t.orden);
    if (seccion) x.secciones.add(seccion);
  }
  if (res.final) {
    const x = porObra.get(res.final.obra) ?? porObra.set(res.final.obra, { obra: ctx.cat.porId.get(res.final.obra), papeles: new Set(), tramos: new Set(), secciones: new Set() }).get(res.final.obra);
    x.papeles.add('final');
  }
  return [...porObra.values()].map(x => ({ ...x, papeles: [...x.papeles], tramos: [...x.tramos], secciones: [...x.secciones], estado: estadoObra(ctx, x.obra.id) }));
}

// El curso que piden los niveles o, si ya terminó la ruta de ese, el siguiente (puede no tener ruta todavía).
export function cursoPedido(ctx, programa, porNiveles = 1) {
  const cursos = ctx.cat.cursos.filter(c => c.programa === programa);
  let numero = porNiveles;
  for (const c of cursos) if (c.numero >= numero && tieneRuta(ctx, c.id) && (ctx.ruta ? ctx.ruta(c.id) : rutaDelCurso(ctx, c.id))?.terminado) numero = c.numero + 1;
  return numero;
}

// El curso que toca: el pedido, pero nunca uno sin ruta (en preparación): ahí se quedaría sin recomendaciones. Se queda
// en el último curso con ruta, que sigue con consolidación hasta que el siguiente se publique (Fase 2.1, punto 8).
export function cursoActual(ctx, programa, porNiveles = 1) {
  const cursos = ctx.cat.cursos.filter(c => c.programa === programa);
  const numero = Math.min(cursoPedido(ctx, programa, porNiveles), cursos.length);
  return cursos.filter(c => c.numero <= numero && tieneRuta(ctx, c.id)).at(-1) ?? cursos.find(c => c.numero === numero) ?? null;
}

// Dónde se trabaja una competencia: pasos de la ruta y ejercicios.
export function dondeSeTrabaja(ctx, compId) {
  return [
    ...(ctx.cat.pasosDe.get(compId) || []).map(p => {
      const tramo = ctx.cat.tramoDe.get(p.id), curso = tramo && ctx.cat.porId.get(tramo.curso);
      return { tipo: 'paso', id: p.id, titulo: p.titulo, tramo: tramo?.orden ?? null, curso: curso?.numero ?? null, href: `#/paso/${encodeURIComponent(p.id)}` };
    }),
    ...(ctx.cat.ejerciciosDe.get(compId) || []).map(e => ({ tipo: 'ejercicio', id: e.id, titulo: e.titulo, href: `#/ejercicio/${encodeURIComponent(e.id)}` })),
  ];
}

// Desde una obra (o una sección): lo que trabaja y lo que necesita, con dónde se trabaja cada cosa.
export function necesidades(ctx, obraId, seccion = null) {
  const obra = ctx.cat.porId.get(obraId);
  if (!obra) return null;
  const sec = seccionDe(obra, seccion);
  const fila = c => ({ comp: c, nombre: nombreDe(ctx.cat.porId.get(c)), estado: ctx.estadoDe(c), situacion: situacion(ctx, c), donde: dondeSeTrabaja(ctx, c) });
  const pide = pideDe(obra, seccion).map(fila).sort((a, b) => ORDEN_SITUACION.indexOf(a.situacion) - ORDEN_SITUACION.indexOf(b.situacion));
  const desarrolla = [...new Set([...(obra.desarrolla || []), ...(sec ? sec.desarrolla || [] : (obra.secciones || []).flatMap(s => s.desarrolla || []))])].map(fila);
  const cuenta = s => pide.filter(x => x.situacion === s).length;
  const lecturaPide = sec?.lecturaNecesaria ?? obra.lecturaNecesaria?.nivel ?? null;
  return {
    obra, seccion: sec, pide, desarrolla,
    resumen: { laTienes: cuenta('la-tienes'), porConsolidar: cuenta('por-consolidar'), refuerzo: cuenta('refuerzo'), falta: cuenta('falta'), estimada: cuenta('estimada') },
    lectura: lecturaPide == null ? null : { pide: lecturaPide, tienes: ctx.niveles.lectura?.efectivo ?? 0, frena: false },
  };
}

// Dónde aparece una obra en las rutas, y de qué curso es la obra final.
export function obraEnRutas(ctx, obraId) {
  const pasos = (ctx.cat.pasosCon.get(obraId) || []).map(p => {
    const tramo = ctx.cat.tramoDe.get(p.id), curso = tramo && ctx.cat.porId.get(tramo.curso);
    const clave = (p.contenido || []).find(x => separar(x)[0] === obraId);
    return { paso: p.id, titulo: p.titulo, clase: p.clase, papel: p.papel ?? null, seccion: clave ? separar(clave)[1] : null, tramo: tramo?.orden ?? null, tramoTitulo: tramo?.titulo ?? null, curso: curso?.numero ?? null, cursoId: curso?.id ?? null, href: `#/paso/${encodeURIComponent(p.id)}` };
  });
  const finalDe = (ctx.cat.finalDe.get(obraId) || []).map(c => ({ curso: c.id, obra: obraId, numero: c.numero, nombre: c.nombre, justificacion: c.obraFinal.justificacion, requisitos: c.obraFinal.requisitos || [] }));
  return { pasos, finalDe };
}

// Desde un paso: lo que contiene, en qué se apoya y qué obras prepara.
export function relacionesPaso(ctx, pasoId) {
  const p = ctx.cat.porId.get(pasoId);
  if (!p || p.tipo !== 'paso') return null;
  const tramo = ctx.cat.tramoDe.get(p.id);
  const curso = tramo && ctx.cat.porId.get(tramo.curso);
  const trabaja = new Set(p.trabaja || []);
  const prepara = [];
  for (const o of ctx.cat.obras) {
    if (o.programa !== p.programa) continue;
    const partes = [null, ...(o.secciones || []).map(s => s.id)];
    for (const s of partes) {
      if (s === null && (o.secciones || []).length) continue; // con secciones, se dice qué parte
      if (pideDe(o, s).some(c => trabaja.has(c))) prepara.push({ obra: o.id, titulo: o.titulo, seccion: s, seccionTitulo: seccionDe(o, s)?.titulo ?? null });
    }
  }
  for (const x of p.contenido || []) {
    const [id, s] = separar(x);
    if (ctx.cat.porId.get(id)?.tipo === 'obra' && !prepara.some(y => y.obra === id && y.seccion === s)) prepara.push({ obra: id, titulo: ctx.cat.porId.get(id).titulo, seccion: s, seccionTitulo: seccionDe(ctx.cat.porId.get(id), s)?.titulo ?? null, contiene: true });
  }
  const requisitos = [...new Set((p.trabaja || []).flatMap(c => ctx.cat.porId.get(c)?.requiere || []))].map(c => ({ comp: c, nombre: nombreDe(ctx.cat.porId.get(c)), estado: ctx.estadoDe(c), donde: dondeSeTrabaja(ctx, c) }));
  const pasosAntes = (p.requiere || []).map(id => ({ paso: id, titulo: ctx.cat.porId.get(id)?.titulo, estado: estadoPaso(ctx, ctx.cat.porId.get(id)).estado, href: `#/paso/${encodeURIComponent(id)}` }));
  const orden = tramo ? tramo.pasos : [];
  const i = orden.indexOf(p.id);
  return {
    paso: p, tramo, curso, estado: estadoPaso(ctx, p), prepara, requisitos, pasosAntes,
    anterior: i > 0 ? ctx.cat.porId.get(orden[i - 1]) : null, siguiente: i >= 0 && i < orden.length - 1 ? ctx.cat.porId.get(orden[i + 1]) : null,
    contenido: (p.contenido || []).map(x => { const [id, s] = separar(x); return { clave: x, item: ctx.cat.porId.get(id), seccion: s }; }),
    comps: (p.trabaja || []).map(c => ({ comp: c, item: ctx.cat.porId.get(c), estado: ctx.estadoDe(c), situacion: situacion(ctx, c), dom: ctx.dom.get(c) ?? null })),
  };
}

// El estado de una obra en su repertorio, sin reiniciar lo que ya sabía: sin empezar, empezada, aprendida, dominada,
// conocida (la sabía de antes y falta comprobarla), en repaso; y si es obra de evaluación (obra final de un curso).
export const NOMBRE_ESTADO_OBRA = {
  'sin-empezar': 'Sin empezar', empezada: 'Empezada', aprendida: 'Aprendida', dominada: 'Dominada',
  conocida: 'La conoces: por comprobar', 'en-repaso': 'En repaso',
};
export function estadoObra(ctx, obraId) {
  const est = ctx.estadoDe(obraId);
  const obra = ctx.cat.porId.get(obraId);
  const secciones = (obra?.secciones || []).map(s => ({ id: s.id, titulo: s.titulo, estado: ctx.estadoDe(`${obraId}#${s.id}`), conocida: !!conocida(ctx, obraId, s.id) }));
  const k = conocida(ctx, obraId);
  let clave = { dominado: 'dominada', completado: 'aprendida', 'necesita-repaso': 'en-repaso', 'en-progreso': 'empezada' }[est] ?? null;
  if (!clave) clave = secciones.some(s => s.estado !== 'pendiente') ? 'empezada' : k ? 'conocida' : 'sin-empezar';
  const final = ctx.cat.finalDe.get(obraId) || [];
  return { clave, texto: NOMBRE_ESTADO_OBRA[clave], conocida: k?.nivel ?? null, dominadaAntes: k?.nivel === 'dominada', secciones, deEvaluacion: final.length > 0 && !!k, finalDe: final.map(c => c.id) };
}
