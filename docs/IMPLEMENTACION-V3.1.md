---
status: active
project: personal
type: plan
created: 2026-10-30
---
# Implementación del currículo V3.1

Qué se ha construido sobre las Fases 1-3 y qué falta. La fuente de verdad del contenido es `docs/curriculo/`, congelada el 30/10/2026.

## Plan técnico (fases)
| Fase | Qué | Estado |
|---|---|---|
| A | Auditoría técnica: 157 pruebas en verde; servidor, guardado, notación, metrónomo y preguntas sirven tal cual | Hecha |
| B | Mapeo: `herramientas/generar-curriculo.mjs` convierte `docs/curriculo/` en `contenido/curriculo/clasica.json` | Hecha |
| C | Navegación: Curso · Obras · Progreso · Ajustes; la portada es Curso | Hecha |
| D | Nivel → Tramo → Lección → Paso (`web/vistas/nivel.js`, `aprender.js`) | Hecha |
| E | Progreso y Continuar (`logica/curriculo.js`, `estado.curriculo`, sin cambio de esquema) | Hecha |
| F | Los 988 pasos de V3.1 en la app, con su texto tal cual | Hecha |
| G | Obras: biblioteca y página sencilla (`web/vistas/obras.js`), con 121 obras clasificadas | Hecha |
| H | Notación: 18 ejercicios enlazados con Partitura, Tab o Ambas; diagramas de acordes | Hecha con lo que hay; falta transcribir |
| I | Preguntas calculadas en los pasos (`logica/preguntasPaso.js`), con las listas del apartado 9.6 del maestro | Parcial |
| J | Pulido: entrada cinética, B+ | Primera pasada |
| K | Pruebas (178) y recorrido en el navegador con datos temporales | Hecha |

## Qué se reutiliza y qué queda por dentro
- **Tal cual:** servidor, guardado, copias, `almacen.js`, VexFlow y `partitura.js`, selector de notación, metrónomo, generadores de preguntas, sonido, tokens B+, atril y entrada cinética.
- **Sin enlace en el carril, funcionando y con sus pruebas:** Hoy, Diario, Profesor, planificador, dominio, ruta antigua, Biblioteca, evaluación inicial (desde Ajustes) y el detalle de Progreso (`#/progreso-detalle`).
- **Programa flamenco:** intacto; el selector del carril lleva a sus pantallas de siempre.

## Cómo funciona
- **Regenerar los datos:** `node herramientas/generar-curriculo.mjs`. Una prueba falla si `contenido/curriculo/clasica.json` no coincide con los documentos. Al generar se quita lo que no es para el alumno (etiquetas de naturaleza, calibración con otros sistemas, códigos de ejercicio) y el trato pasa a «tú».
- **Progreso:** `estado.curriculo` = `{ nivel, posicion, pasos: { id: { e: 'hecho'|'practica', t } }, repasos: { id: { n, prox } }, seguidos }`. Es un campo opcional: los datos antiguos siguen valiendo.
- **Continuar:**
  - la primera vez, el primer paso;
  - a mitad de lección, el paso exacto;
  - después, el siguiente sin hacer;
  - entre lecciones, como mucho dos repasos seguidos;
  - al acabar, el nivel siguiente.
- **Repasos:** lo que se aprende con nombre (obra o ejercicio) vuelve a los 3, 7, 21, 45 y 90 días **[Decisión]**. «Bien · Regular · No salió».
- **Acordes:** `logica/acordes.js`. Se dibujan solo los que nombra el paso; una prueba comprueba las notas de cada forma.

## Lo que falta, y por qué no está
| Qué | Estado |
|---|---|
| **Partituras de las obras** | Ninguna obra tiene aún notación propia en la app. *Lágrima* necesita la edición de Alier (IMSLP pide verificación de persona: la descarga David) |
| **Notación de los ejercicios nuevos** | Solo los 18 de la Fase 3 la tienen. Los demás muestran su ficha |
| **Audio** | Los pasos de escucha no traen audio ni enlace todavía |
| **Preguntas** | 40 pasos las tienen; en los demás con ✎ se ve el texto y él se comprueba solo. No se inventan |
| **Por verificar** | Todo sigue marcado hasta comprobarlo con la partitura |
| **Copia de la vault** | Actualizada el 30/10/2026: `08 - Guitarra/Academia/app` sigue la rama `revision-fase-2`; se pone al día con `git pull` |
