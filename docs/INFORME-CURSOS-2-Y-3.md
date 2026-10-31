---
status: active
project: personal
type: log
created: 2026-10-31
---
# Cursos 2 y 3

Pendiente de su revisión. El currículo V3.1 no se ha tocado.

## Construido
| | Curso 2 | Curso 3 |
|---|---|---|
| Tramos | 13 | 10 |
| Pasos | 160 | 132 |
| Pantallas | 191 | 144 |
| Escenas de mástil | 30 | 9 |
| Bloques de ejercicio | 49 | 31 |
| Audios de escucha | 60 | 40 |
| Comprobaciones | 61 | 48 |
| Avisos «por verificar» | 17 | 15 |

Novedades en la base: tresillos dibujados y a su tiempo, armónicos naturales, armónicos octavados, glissando, silencios ocultos, sin hueco tras una anacrusa, muestras de audio 38 y 39 (6.ª en Re), 21 acordes nuevos con cejilla y cuatriadas, y `herramientas/ly-a-notacion.py` reescrita (LilyPond a notación, con digitación calculada).

## Obras
| Obra | Estado | Fuente |
|---|---|---|
| *Romance* | Entera, 32 c. | Mutopia, según manuscrito |
| Carcassi op. 60 n.º 7 | Entera | Mutopia |
| Sor op. 35 n.º 8 | Entera | Mutopia, Simrock. Una nota corregida en el c. 2 (octava) |
| Sor op. 44 n.º 2 | Entera | Mutopia |
| Giuliani op. 51 n.º 10 | Entera | Mutopia, Richault |
| Petzold, *Minueto* | Entera | MIDI de edición en IMSLP |
| Tárrega, *Preludio 1* | Entera; armónicos finales escritos pisados | MIDI de edición en IMSLP |
| Aguado, *Contradanza* | Entera, a ojo | Richault. Cc. 13, 29 y 37-39 dudosos; numeración «n.º 5» deducida |
| Dowland, *Willoughby* | 32 c., 1.ª guitarra de un dúo, a ojo | IMSLP. No es la versión a solo de laúd |
| Giuliani, *Sonatina* op. 71 | **Parcial: 9 c.**, a ojo | Mechetti. Resto, enlazado |
| Coste op. 38 n.º 1 | **Parcial: 13 c.**, a ojo | Reedición alemana. Resto, enlazado |
| Brouwer VII | Sin transcribir: derechos | Método, escucha y ostinato propio |
| Sor op. 35 n.º 22 | Entera; tres voces en dos | Mutopia |
| *Adelita* | Entera; voces en dos, apoyaturas sin dibujar | Mutopia, Boije |
| Bach, *Bourrée* | Entera | MIDI de edición en IMSLP |
| Sanz, *Canarios* | **96 c.** del MIDI | MIDI de edición en IMSLP |
| Milán, *Pavana III* | Entera, a ojo; c. 30 repartido | Nesyba (CC BY-NC-SA) |
| Dowland, *Winter's Jump* | Entera, a ojo | Edson Lopes |
| Narváez, *Canción del Emperador* | Entera; tres voces en dos | MIDI de edición en IMSLP |
| Giuliani op. 50 n.º 17 | Entera | Mutopia |
| Mertz, *Nocturno* | **Parcial: 4 c.**, a ojo | IMSLP. Resto, enlazado |
| Giuliani op. 100 n.º 12 | **Parcial: 8 c.**, a ojo; bajos dudosos | Gitarrefreund. Resto, enlazado |
| Lauro, *Vals* n.º 2 | Sin transcribir: derechos | Método, escucha y ejercicio propio |

Los totales de compases de las obras parciales son aproximados. La digitación y la mano derecha son propuesta de la academia salvo los dedos de la fuente: las calcula un programa y **nadie las ha probado con la mano**.

## Pruebas
215 de 215, también con `TZ=Europe/Madrid`. Validador de contenido: 0 errores en 292 pasos. Continuar recorre los dos cursos en orden hasta el nivel siguiente, y la prueba de botones sale correcta.

## Navegador
Con datos temporales, los 23 tramos, 335 pantallas: sin errores de consola, red ni imágenes rotas al final. Se encontró y corrigió:
- silencios en `escuchar` que pedían una nota inexistente (Tramos 2.4 y 2.7);
- una pista sin etiquetas que rompía el Tramo 2.12;
- dos ejercicios del Curso 1 pisados por nombres iguales (restaurados);
- preguntas sin explicación previa (5 pasos);
- rótulo de tempo encima de las plicas (quitado de las obras).

Animaciones: nueve escenas comprobadas en movimiento, midiendo el cuadro a lo largo del tiempo. Revisión visual: una muestra de seis pantallas, no todas.

## Limitaciones
- Nadie ha oído las obras para detectar errores; el audio es de muestras, no una interpretación.
- La repetición y el *Da Capo* se dicen, pero el audio no los hace, salvo en lo escrito.
- La app dibuja dos voces; tres planos se reparten.
- El texto de los Cursos 2 y 3 es más breve que el del 1 en comprobaciones y cierres.
- Los ejercicios de Carlevaro están reescritos y su numeración sigue por cotejar.
