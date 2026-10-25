// Comprueba el contenido antes de usarlo: ids únicos, referencias que existen, programas que no se mezclan,
// requisitos sin círculos, cada dato con su naturaleza (dato, consenso, estimación…) y que la obra final de cada
// curso no rompa su ruta (todo lo que pide se trabaja antes).
import { DIMENSIONES, FORMATOS } from './esquema.js';
import { separar, pideDe } from './catalogo.js';

export const NATURALEZAS = ['dato', 'evidencia', 'consenso', 'recomendacion', 'decision', 'estimacion'];
export const CLASES_OBRA = ['obra', 'estudio', 'ejercicio', 'falseta', 'toque', 'arreglo'];
export const TIPOS_PASO = ['habilidad', 'aplicacion', 'obra', 'evaluacion', 'preparacion'];
export const REQUISITOS_FINAL = ['memoria', 'grabacion'];
const PROGRAMAS = ['clasica', 'flamenca', 'comun'];

export function validarCatalogo(entidades) {
  const err = [];
  const porId = new Map();
  for (const e of entidades) {
    if (typeof e.id !== 'string' || !e.id) { err.push(`${e.archivo ?? '?'}: entrada sin id`); continue; }
    if (porId.has(e.id)) err.push(`Id repetido: ${e.id}`);
    porId.set(e.id, e);
    if (!e.tipo) err.push(`${e.id}: prefijo de id desconocido`);
  }

  const ref = (de, id, tipo) => {
    const x = porId.get(id);
    if (!x) err.push(`${de.id}: referencia rota a ${id}`);
    else if (tipo && x.tipo !== tipo) err.push(`${de.id}: ${id} debería ser ${tipo}`);
    return x;
  };
  // Una cosa de un programa solo puede apoyarse en su programa o en lo común.
  const misma = (de, x) => {
    if (x && x.programa !== 'comun' && x.programa !== de.programa) err.push(`${de.id} (${de.programa}) no puede depender de ${x.id} (${x.programa})`);
  };
  const refs = (de, lista, tipo) => {
    if (lista == null) return;
    if (!Array.isArray(lista)) return err.push(`${de.id}: se esperaba una lista`);
    for (const id of lista) misma(de, ref(de, id, tipo));
  };
  const naturaleza = (de, campo, x) => {
    if (x == null) return;
    if (!NATURALEZAS.includes(x.naturaleza)) err.push(`${de.id}: ${campo} sin naturaleza válida (${NATURALEZAS.join(', ')})`);
  };
  // Partitura y tablatura: qué hay y, si se dice, para qué formato está pensado y por qué.
  const notacion = (de, n, donde = '') => {
    if (n == null) return;
    for (const f of FORMATOS) if (n[f] != null && ![true, false, 'externa', 'pendiente'].includes(n[f])) err.push(`${de.id}${donde}: ${f} debe ser true, false, «externa» o «pendiente»`);
    if (n.principal != null) {
      if (!FORMATOS.includes(n.principal)) err.push(`${de.id}${donde}: formato principal desconocido «${n.principal}»`);
      else if (!n.fuente && ![true, 'externa'].includes(n[n.principal])) err.push(`${de.id}${donde}: su formato principal (${n.principal}) no está disponible`);
      if (!n.motivo) err.push(`${de.id}${donde}: si tiene formato principal, debe decir el motivo pedagógico`);
    }
  };
  // Un número de un criterio (tempo) se marca como dato o decisión, y si obliga, dice de dónde sale.
  const criterio = (de, c) => {
    if (!c) return;
    for (const d of c.dimensiones || []) if (!(d in DIMENSIONES)) err.push(`${de.id}: aspecto de calidad desconocido «${d}»`);
    if (c.tempo != null) {
      if (!(c.tempo.referencia > 0)) err.push(`${de.id}: tempo sin referencia`);
      naturaleza(de, 'tempo', c.tempo);
      if (c.tempo.obligatorio && !c.tempo.fuente && !c.tempo.justificacion) err.push(`${de.id}: un tempo obligatorio debe decir de dónde sale`);
    }
  };
  // Lo que contiene un paso: un ejercicio, una lección, una competencia, una obra o una sección («obra:x#A»).
  const contenido = (de, lista) => {
    for (const clave of lista || []) {
      const [id, seccion] = separar(clave);
      const x = ref(de, id);
      if (!x) continue;
      misma(de, x);
      if (seccion && !(x.secciones || []).some(s => s.id === seccion)) err.push(`${de.id}: ${id} no tiene la sección ${seccion}`);
    }
  };

  for (const e of porId.values()) {
    if (e.tipo !== 'area' && e.tipo !== 'programa' && !PROGRAMAS.includes(e.programa)) err.push(`${e.id}: programa desconocido «${e.programa}»`);
    switch (e.tipo) {
      case 'area':
        if (!PROGRAMAS.includes(e.programa)) err.push(`${e.id}: programa desconocido «${e.programa}»`);
        if (!Number.isInteger(e.max) || e.max < 1) err.push(`${e.id}: falta su nivel máximo`);
        break;
      case 'curso':
        if (!porId.has(`programa:${e.programa}`)) err.push(`${e.id}: no existe el programa ${e.programa}`);
        if (!Number.isInteger(e.numero)) err.push(`${e.id}: falta su número`);
        if (e.obraFinal) {
          const o = ref(e, e.obraFinal.obra, 'obra');
          misma(e, o);
          if (!e.obraFinal.justificacion) err.push(`${e.id}: la obra final debe decir por qué es la obra final`);
          for (const r of e.obraFinal.requisitos || []) if (!REQUISITOS_FINAL.includes(r)) err.push(`${e.id}: requisito de obra final desconocido «${r}»`);
          naturaleza(e, 'obra final', e.obraFinal);
        } else if (!e.borrador) err.push(`${e.id}: un curso terminado necesita su obra final`);
        break;
      case 'tramo': {
        const curso = ref(e, e.curso, 'curso');
        if (curso && curso.programa !== e.programa) err.push(`${e.id}: su curso es de otro programa`);
        if (!Number.isInteger(e.orden)) err.push(`${e.id}: falta su orden`);
        refs(e, e.pasos, 'paso');
        if (e.obraEje) contenido(e, [e.obraEje]);
        break;
      }
      case 'competencia': {
        const area = porId.get(e.area);
        if (!area || area.tipo !== 'area') { err.push(`${e.id}: área desconocida «${e.area}»`); break; }
        if (area.programa !== e.programa) err.push(`${e.id}: es ${e.programa} pero su área (${area.id}) es ${area.programa}`);
        if (!Number.isInteger(e.nivel) || e.nivel < 1 || e.nivel > area.max) err.push(`${e.id}: nivel fuera de 1-${area.max}`);
        if (!e.criterio || !['ejecucion', 'conocimiento'].includes(e.criterio.tipo)) err.push(`${e.id}: criterio sin tipo (ejecucion o conocimiento)`);
        naturaleza(e, 'criterio', e.criterio);
        criterio(e, e.criterio);
        refs(e, e.requiere, 'competencia');
        for (const t of e.transfiere || []) ref(e, t.desde, 'competencia'); // lo único que puede cruzar de programa
        break;
      }
      case 'obra':
        if (!e.titulo) err.push(`${e.id}: falta el título`);
        if (!e.compositor) err.push(`${e.id}: falta el compositor (o «Anónimo», «Tradicional»)`);
        if (e.programa === 'comun') err.push(`${e.id}: una obra es clásica o flamenca`);
        if (!CLASES_OBRA.includes(e.clase)) err.push(`${e.id}: clase desconocida «${e.clase}»`);
        if (e.nivel != null) {
          if (!Number.isInteger(e.nivel.curso) || e.nivel.curso < 1) err.push(`${e.id}: nivel sin curso`);
          naturaleza(e, 'nivel', e.nivel);
          (e.nivel.referencias || []).forEach((r, i) => naturaleza(e, `referencia ${i + 1}`, r));
        }
        if (e.dificultad != null && !(e.dificultad.valor >= 1 && e.dificultad.valor <= 7)) err.push(`${e.id}: dificultad fuera de 1-7`);
        naturaleza(e, 'dificultad', e.dificultad);
        naturaleza(e, 'lecturaNecesaria', e.lecturaNecesaria);
        refs(e, e.pide, 'competencia');
        refs(e, e.desarrolla, 'competencia');
        criterio(e, e.criterio);
        notacion(e, e.notacion);
        for (const s of e.secciones || []) {
          if (!s.id) err.push(`${e.id}: una sección sin id`);
          notacion(e, s.notacion, ` (sección ${s.id})`);
          refs({ ...e, id: `${e.id}#${s.id}` }, s.pide, 'competencia');
          refs({ ...e, id: `${e.id}#${s.id}` }, s.desarrolla, 'competencia');
        }
        break;
      case 'ejercicio': {
        const area = porId.get(e.area);
        if (!area || area.tipo !== 'area') err.push(`${e.id}: área desconocida «${e.area}»`);
        else if (area.programa !== e.programa) err.push(`${e.id}: es ${e.programa} pero su área es ${area.programa}`);
        refs(e, e.trabaja, 'competencia');
        notacion(e, e.notacion);
        break;
      }
    }
  }
  validarPasos(porId, err, { refs, contenido });
  validarRutas(porId, err);
  circulos(porId, err, 'competencia');
  circulos(porId, err, 'paso');
  return err;
}

// Cada paso: una clase conocida (habilidad, aplicación, obra, evaluación o preparación), lo que trabaja y lo que
// contiene, y en exactamente un tramo.
function validarPasos(porId, err, { refs, contenido }) {
  const enTramo = new Map();
  for (const t of porId.values()) if (t.tipo === 'tramo') for (const id of t.pasos || []) {
    if (enTramo.has(id)) err.push(`${id}: está en dos tramos (${enTramo.get(id)} y ${t.id})`);
    enTramo.set(id, t.id);
  }
  for (const p of porId.values()) {
    if (p.tipo !== 'paso') continue;
    if (!TIPOS_PASO.includes(p.clase)) err.push(`${p.id}: clase de paso desconocida «${p.clase}» (${TIPOS_PASO.join(', ')})`);
    if (!p.titulo) err.push(`${p.id}: falta el título`);
    if (p.area != null && porId.get(p.area)?.tipo !== 'area') err.push(`${p.id}: área desconocida «${p.area}»`);
    refs(p, p.trabaja, 'competencia');
    contenido(p, p.contenido);
    refs(p, p.requiere, 'paso');
    if (!enTramo.has(p.id)) err.push(`${p.id}: no está en ningún tramo`);
    if (['habilidad', 'aplicacion', 'preparacion'].includes(p.clase) && !(p.trabaja || []).length) err.push(`${p.id}: un paso de ${p.clase} debe decir qué trabaja`);
    if (p.clase === 'obra' && !(p.contenido || []).some(x => porId.get(separar(x)[0])?.tipo === 'obra')) err.push(`${p.id}: un paso de obra debe contener una obra`);
  }
}

// La ruta de cada curso: tramos de su curso, y la obra final cubierta por lo que se trabaja antes (en ese curso o en uno
// anterior del mismo programa), con un paso de preparación antes.
function validarRutas(porId, err) {
  const cursos = [...porId.values()].filter(x => x.tipo === 'curso');
  const tramosDe = c => [...porId.values()].filter(t => t.tipo === 'tramo' && t.curso === c.id);
  const trabajadoHasta = c => {
    const s = new Set();
    for (const d of cursos) if (d.programa === c.programa && d.numero <= c.numero) {
      for (const t of tramosDe(d)) for (const id of t.pasos || []) for (const comp of porId.get(id)?.trabaja || []) s.add(comp);
    }
    return s;
  };
  for (const c of cursos) {
    const obra = porId.get(c.obraFinal?.obra);
    if (!obra || obra.tipo !== 'obra') continue;
    const trabajado = trabajadoHasta(c);
    for (const comp of pideDe(obra)) if (!trabajado.has(comp)) err.push(`${c.id}: la obra final pide ${comp} y ningún paso de la ruta lo trabaja antes`);
    const pasos = tramosDe(c).flatMap(t => t.pasos || []).map(id => porId.get(id)).filter(Boolean);
    if (!pasos.some(p => p.clase === 'preparacion')) err.push(`${c.id}: falta un paso de preparación de la obra final`);
  }
}

// Requisitos en círculo (A pide B y B pide A) harían imposible empezar.
function circulos(porId, err, tipo) {
  const color = new Map();
  const visitar = (id, camino) => {
    if (color.get(id) === 2) return;
    if (color.get(id) === 1) return err.push(`Requisitos en círculo: ${[...camino, id].join(' → ')}`);
    color.set(id, 1);
    for (const r of porId.get(id)?.requiere || []) if (porId.has(r)) visitar(r, [...camino, id]);
    color.set(id, 2);
  };
  for (const e of porId.values()) if (e.tipo === tipo) visitar(e.id, []);
}
