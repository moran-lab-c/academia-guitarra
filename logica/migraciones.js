// Pasos entre versiones del formato de datos: MIGRACIONES[n] convierte { estado, eventos } de la versión n a la n + 1.
// Antes de aplicar ninguna, el servidor guarda una copia.
import { ESQUEMA } from './esquema.js';

const renombrar = (o, de, a) => {
  if (o && typeof o === 'object' && de in o) { if (!(a in o)) o[a] = o[de]; delete o[de]; }
  return o;
};

export const MIGRACIONES = {
  // 1 → 2: lo que se llamaba «ruta» (clásica o flamenca) pasa a ser el «programa»; las unidades, los tramos de la ruta
  // de cada curso; y en las obras propias, la etapa de su nivel pasa a ser el curso.
  1: ({ estado, eventos }) => {
    renombrar(estado.preferencias, 'rutaPrincipal', 'programaPrincipal');
    for (const t of estado.tareasProfesor || []) renombrar(t, 'ruta', 'programa');
    const unidad = estado.focos?.unidad;
    if (unidad) {
      estado.focos.tramo = Object.fromEntries(Object.entries(unidad).map(([p, id]) => [p, String(id).replace(/^unidad:(\w+)\.u(\d+)$/, 'tramo:$1.t$2')]));
      delete estado.focos.unidad;
    }
    for (const lista of [estado.contenidoPropio?.obras, estado.contenidoPropio?.ejercicios]) {
      for (const x of lista || []) { renombrar(x, 'ruta', 'programa'); renombrar(x.nivel, 'etapa', 'curso'); }
    }
    for (const ev of eventos) if (ev.tipo === 'sesion') renombrar(ev, 'ruta', 'programa');
    return { estado, eventos };
  },
};

export function migrar(datos, migraciones = MIGRACIONES, objetivo = ESQUEMA) {
  let v = datos.estado?.esquema ?? 1;
  if (v > objetivo) throw new Error(`Los datos son de una versión más nueva (${v}) que la app (${objetivo}).`);
  while (v < objetivo) {
    const paso = migraciones[v];
    if (!paso) throw new Error(`Falta el paso de la versión ${v} a la ${v + 1}.`);
    datos = paso(datos);
    v++;
    datos.estado.esquema = v;
  }
  return datos;
}
