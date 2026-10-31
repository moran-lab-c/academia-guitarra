---
status: active
project: personal
type: guide
created: 2026-10-30
---
# Enriquecimiento del contenido

Cómo se convierte un paso del currículo V3.1 en material de estudio completo, sin tocar el currículo congelado. El **Tramo 4 del Nivel 1** es el tramo de referencia, aprobado el 30/10/2026 tras reescribirlo (`docs/AUDITORIA-TRAMO-4.md`): un estándar, no una plantilla. Los Cursos 1, 2 y 3 están enriquecidos; `docs/CONCEPTOS-CURSO-1.md` dice dónde se enseña cada concepto por primera vez, y `docs/INFORME-CURSO-1.md`, cómo va.

## El estándar
Primero enseñar, después mostrar, hacer, escuchar, comprobar y aplicar. No se presupone nada porque el currículo lo nombre, ni se pregunta lo que no se ha explicado. Cada concepto responde: qué es, cómo se construye, por qué, para qué, dónde está en la guitarra, cómo se toca, cómo se oye, cómo saber si va bien y dónde vuelve. Esa lista es una comprobación interna, no una plantilla en pantalla. Las pruebas no bastan: el criterio es si lo entiende alguien sin conocimientos previos.

## Cómo está montado
- **Contenido:** `contenido/curriculo/enriquecido/*.json`, un archivo por tramo. Cada paso es una lista de bloques o, si necesita ir por partes, de pantallas: se avanza con «Continuar», el único botón, que también completa el paso al final, sin cambiar los 22 pasos del currículo. Sin plantilla. `docs/curriculo/` y `clasica.json` no cambian; el servidor los junta al servir `/api/curriculo`.
- **Un paso sin enriquecer** sigue mostrando su texto de siempre. **Un repaso** muestra la versión corta.
- **Bloques** (`logica/bloques.js` los valida; `web/componentes/bloques.js` los dibuja). Para enseñar: texto, concepto, pasos, lista, tabla, grados, dedos, anatomia, errores, bien, reaparece, guia, ejercicio, obra. Para ver y oír: mastil, acordes, pentagrama, notacion, escuchar, progresion, pista, metronomo, figura (un esquema de `web/figuras/`). Para comprobar (`web/componentes/actividades.js`): elige (también de oído o en partitura), ordenar, completar, localizar, preguntas.
- **Datos musicales:** `logica/guitarra.js` calcula notas, intervalos, funciones, duplicadas y dedos comunes. La tabla de un acorde no se escribe a mano. Lo que afirma el texto sobre un acorde se comprueba en `pruebas/enriquecido.test.js`.

## El mástil y el diagrama animados
`logica/guitarra.js` describe la escena como una lista de cuadros, sin una imagen por acorde; `web/componentes/cuadros.js` es el reproductor común. Todo va sobre el fondo oscuro.

| Tipo | Dibuja | Sirve para |
|---|---|---|
| `acorde` | `diagramaAnimado.js` | Espacio vacío, trastes, cuerdas, diagrama completo, cada dedo con su color, cuerdas al aire, las que no suenan, notas y escucha |
| `cambio` | `mastil.js` | De un acorde a otro: los dedos viajan y el común se queda marcado |
| `recorrido` | `mastil.js` | Escalas, arpegios y digitaciones, nota a nota |
| `distancias` | `mastil.js` | Tonos, semitonos, intervalos y triadas sobre una cuerda |
| `manoDerecha` | `mastil.js` | Patrones p-i-m-a sobre un acorde fijo |
| `libre` | `mastil.js` | Lo que no es un patrón (la resolución del tritono) |

Para posiciones, desplazamientos o cejillas nuevas basta con una función más en `ESCENAS`. Con «reducir movimiento» enseña el último cuadro y se avanza a mano.

## Tablatura que enseña a tocar
Sobre la tablatura, una fila con el dedo de la mano izquierda, en su color. Debajo, p, i, m o a en cada nota y el pulso. Encima, el nombre del acorde. También compases numerados y barras de repetición. Los archivos de notación usan `dedo`, `mano`, `rotulo`, `conteo` y `repetir`. Una prueba exige dedo en toda nota pisada y que coincida con el diagrama. Limitación: un acorde tocado de una vez lleva su nombre, no el dedo de cada cuerda, y por eso va junto a su diagrama.

## Partitura y explicación
En un texto, `{c:7-8}` crea un botón que señala esos compases en la notación del paso. La validación falla si el compás no existe.

## Audio
Las notas de `web/sonidos/guitarra/38.mp3` a `88.mp3` salen de **FluidSynth con el banco GeneralUser GS v2.0.3** (S. Christian Collins; su licencia permite usarlo en proyectos de software), guitarra de nailon, con los ajustes de los audios de `08 - Guitarra/Audio`. Se regeneran con `node herramientas/generar-sonidos.mjs`. La app las combina en acordes, notaciones y pistas, y cada cuerda suena hasta que se vuelve a tocar. No hay ni debe haber síntesis por código.

## Reglas para escalar
- El contenido decide los bloques; la extensión no es un objetivo.
- Lo que dependa de una partitura o edición sigue *por verificar*.
- Una animación solo donde enseñe algo.
- Las obras de dominio público se transcriben a `contenido/notacion/obra-*.json`, con su fuente en el archivo. Una digitación que no sea de la fuente se dice. Lo no comprobado queda por verificar. Lo protegido no se transcribe: método, escucha y ejercicios propios.
- En IMSLP, la verificación de persona la hace él una vez en el navegador integrado; después, cada PDF se abre allí, se esperan 15 s y llega a Descargas.
- El guía es hoy un recuadro (`guia`); el personaje queda para una fase posterior y no cambiará el contenido.
