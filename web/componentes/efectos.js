// Los sonidos de la interfaz: botones, aciertos y lo que se completa, a juego con la tipografía cinética. Nada musical:
// son los archivos de web/sonidos/interfaz (herramientas/generar-efectos.mjs). Se apagan en Ajustes.
import { datos } from '../nucleo/almacen.js';
import { sonarArchivo, precargarArchivos, sonoHace, sonandoAhora } from './sonido.js';
import { estadoMetronomo } from './metronomo.js';

const NOMBRES = ['clic', 'avance', 'acierto', 'fallo', 'paso', 'leccion', 'tramo', 'nivel'];
const ruta = nombre => `/web/sonidos/interfaz/${nombre}.wav`;

export function efecto(nombre) {
  if (datos()?.estado?.preferencias?.efectosSonido === false) return;
  sonarArchivo(ruta(nombre));
}

// Se cargan al primer toque para que el primer clic no llegue tarde.
document.addEventListener('pointerdown', () => precargarArchivos(NOMBRES.map(ruta)), { once: true });

// Cualquier botón o enlace suena, salvo que su acción ya haya sonado o esté sonando la música o el metrónomo.
document.addEventListener('click', ev => {
  if (!ev.target.closest?.('button, a[href], summary')) return;
  if (sonoHace() < 100 || sonandoAhora() || estadoMetronomo().estado === 'sonando') return;
  efecto('clic');
});
