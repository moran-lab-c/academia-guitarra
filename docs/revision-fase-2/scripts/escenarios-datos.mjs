// Los escenarios de la revisión (solo datos).
import { estadoInicial, tramo1, frioMal, hecho, LAGRIMA, leerDatos } from './comun.mjs';
import { fileURLToPath } from 'node:url';
// Copia congelada de datos-revision-avanzado (sus 14 eventos originales): la carpeta original la está usando otra sesión.
const AVANZADO = fileURLToPath(new URL('./datos-avanzado-congelado', import.meta.url));

const conEncargo = (minutos, item = LAGRIMA, extra = {}) => { const e = estadoInicial(); e.tareasProfesor.push({ id: 'enc', item, minutos, hasta: '2026-10-28', programa: 'clasica', ...extra }); return e; };
export const fallo = [...tramo1('2026-10-14'), hecho('comp:tec.media-cejilla', '2026-10-20'), frioMal('comp:tec.media-cejilla', '2026-10-24')];
const conocida = () => { const e = estadoInicial(); e.obras[LAGRIMA] = { conocida: { nivel: 'entera' } }; return e; };

export const ESCENARIOS = {
  'S1 alumno nuevo': { estado: estadoInicial(), eventos: [] },
  'S2 tramo 1 hecho (14/10), comprobaciones vencidas': { estado: estadoInicial(), eventos: tramo1('2026-10-14') },
  'S3 fallo en frío de media cejilla (24/10)': { estado: estadoInicial(), eventos: fallo },
  'S3b datos-revision-avanzado (S3 + encargo 15)': leerDatos(AVANZADO),
  'S4 encargo largo (40 min de Sor) sobre S3': { estado: conEncargo(40, 'obra:sor.op60-1'), eventos: fallo },
  'S5 obra conocida (Lágrima entera), tramo 1 sin la A': { estado: conocida(), eventos: tramo1('2026-10-20', { conA: false }) },
  'S6 los dos programas (S3)': { estado: estadoInicial(), eventos: fallo, programa: 'ambas' },
  'S6b los dos programas, alumno nuevo': { estado: estadoInicial(), eventos: [], programa: 'ambas' },
};
