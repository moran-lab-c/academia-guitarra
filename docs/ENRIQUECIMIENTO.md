---
status: active
project: personal
type: guide
created: 2026-10-30
---
# Enriquecimiento del contenido

Cómo se convierte un paso del currículo V3.1 en material de estudio completo, sin tocar el currículo congelado. El **Tramo 4 del Nivel 1** es el tramo de referencia, pendiente de su aprobación. **No se enriquece ningún otro tramo hasta que él lo apruebe.**

## Cómo está montado
- **Contenido:** `contenido/curriculo/enriquecido/*.json`, un archivo por tramo. Cada paso es una lista de bloques, sin plantilla. `docs/curriculo/` y `clasica.json` no cambian; el servidor los junta al servir `/api/curriculo`.
- **Un paso sin enriquecer** sigue mostrando su texto de siempre. **Un repaso** muestra la versión corta.
- **Bloques** (`logica/bloques.js` los valida; `web/componentes/bloques.js` los dibuja): texto, concepto, pasos, lista, errores, bien, reaparece, resumen, guia, mastil, acordes, anatomia, tabla, actividadMastil, notacion, escuchar, pista, metronomo, preguntas y obra.
- **Datos musicales:** `logica/guitarra.js` calcula notas, intervalos, funciones, duplicadas y dedos comunes. La tabla de un acorde no se escribe a mano. Lo que afirma el texto sobre un acorde se comprueba en `pruebas/enriquecido.test.js`.

## El mástil animado
`web/componentes/mastil.js` dibuja cualquier escena de `logica/guitarra.js`, sin una imagen por acorde. Una escena es una lista de cuadros, y una marca con la misma clave viaja de un cuadro al siguiente. La 1.ª cuerda va arriba, como en la tablatura.

| Tipo | Sirve para |
|---|---|
| `acorde` | Mástil vacío, cuerdas y trastes, cada dedo con su color y número, cejilla, notas, acorde completo |
| `cambio` | De un acorde a otro: los dedos viajan y el común se queda marcado |
| `recorrido` | Escalas, arpegios y digitaciones, nota a nota |
| `distancias` | Tonos, semitonos, intervalos y triadas sobre una cuerda |
| `manoDerecha` | Patrones p-i-m-a sobre un acorde fijo |
| `libre` | Lo que no es un patrón (la resolución del tritono) |

Para posiciones, desplazamientos o cejillas nuevas basta con una función más en `ESCENAS`. Con «reducir movimiento» enseña el último cuadro y se avanza a mano.

## Partitura y explicación
En un texto, `{c:7-8}` crea un botón que señala esos compases en la notación del paso. La validación falla si el compás no existe.

## Audio
Las notas de `web/sonidos/guitarra/40.mp3` a `88.mp3` salen de **FluidSynth con el banco GeneralUser GS v2.0.3** (S. Christian Collins; su licencia permite usarlo en proyectos de software), guitarra de nailon, con los ajustes de los audios de `08 - Guitarra/Audio`. Se regeneran con `node herramientas/generar-sonidos.mjs`. La app las combina en acordes, notaciones y pistas, y cada cuerda suena hasta que se vuelve a tocar. No hay ni debe haber síntesis por código.

## Reglas para escalar
- El contenido decide los bloques; la extensión no es un objetivo.
- Lo que dependa de una partitura o edición sigue *por verificar*.
- Una animación solo donde enseñe algo.
- El guía es hoy un recuadro (`guia`); el personaje queda para una fase posterior y no cambiará el contenido.
