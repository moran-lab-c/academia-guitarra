---
status: active
project: personal
type: log
created: 2026-10-31
---
# Cierre de los Cursos 1, 2 y 3

El currículo V3.1 no se ha tocado. Este informe sustituye a las limitaciones de `INFORME-CURSOS-2-Y-3.md` donde difieran.

## Obras parciales
| Obra | Antes | Ahora | Cómo |
|---|---|---|---|
| Coste op. 38 n.º 1 | 13 c. | **44, entera** | MIDI de una tablatura de ClassTab; muestreo contra la reedición de IMSLP |
| Mertz, *Nocturno* | 4 c. | **47, entera** | MIDI de ClassTab, sobre Haslinger; quitado un calderón del MIDI (0,125 de negra) |
| Giuliani op. 100 n.º 12 | 8 c. | **46, entera** | Edición Gitarrefreund, leída con ampliación. Bajos de los c. 3, 6 y 31 decididos por armonía y dedos |
| Giuliani, *Sonatina* op. 71 | 9 c. | **21 de unos 90** | Solo hay un escaneo, con el pentagrama gastado. Corregidas notas del tema, que estaban una tercera mal |

La *Sonatina* sigue parcial. Se intentó: ClassTab (solo tiene el Rondó), Classical Guitar Shed (solo el Minueto), MidiShow (bloqueado por Cloudflare, no se esquiva) y otras ediciones de IMSLP (el mismo escaneo). Las variaciones no se inventan: se enlaza la edición y el paso lo dice.

**Hallazgo:** la primera edición y un catálogo comercial presentan este «Maestoso» como **tema con variaciones**, no como forma sonatina, que es lo que dice V3.1. No se cambia el currículo: el paso enseña la forma sonatina como modelo y avisa de la duda. **Lo decide usted o su profesor.**

## Verificación
Método nuevo: cotejo automático por secuencia de ataques entre la obra integrada y un MIDI independiente.

| Obra | Coincide | Resultado |
|---|---|---|
| Carcassi | 100 % | — |
| Bach, *Bourrée* | 98 % | — |
| Giuliani op. 51 n.º 10 | 95 % | Un bajo difiere en c. 1 y c. 19: se respeta la fuente y se avisa |
| Sor op. 44 n.º 2 | 93 % | Sin error objetivo a la vista; no revisadas una a una las 8 zonas |
| Giuliani op. 50 n.º 17 | 93 % | **Toda la obra sonaba una octava alta: corregido.** Mi♭ o Mi natural en c. 7 y 17: por verificar |
| Milán, *Pavana III* | de 76 % a 96 % | **Corregidas notas interiores y bajos** releyendo la edición |
| Dowland, *Winter's Jump* | de 65 % a 73 % | **Corregidos c. 3, 6, 7, 8, 10, 11, 12 y 23-24** contra su edición. El resto es otra edición |

Sin segunda fuente que comparar: Aguado y Dowland *Willoughby*. En Aguado se releyeron los c. 37-39 y no se pudo cotejar la otra edición porque IMSLP pidió de nuevo su verificación de persona, que hace usted. Los c. 13, 29 y 37-39 siguen por verificar, igual que «n.º 5».

## La Romanesca
V3.1 pide una *Romanesca* anónima, sin edición concreta, y no se ha encontrado una fiable. La integrada (Sor-Fortea) se conserva para dos voces, con aviso de probable falsificación de Fétis. Se añade como referencia plegada el inicio de **Mudarra, 1546**, 12 compases, donde se oye el bajo real. No se atribuye nada ni se sustituye: lo decide usted o su profesor.

## Notación
- **Apoyaturas** dibujadas: *Adelita* (4, 11, 12, 14) y Aguado (9, 13, 15), y suenan.
- **Armónicos de octava** finales de Tárrega, con su altura real y su número entre paréntesis.
- **Origen de la digitación** en cada obra: edición, mixta o propuesta, visible bajo la partitura y exigido por una prueba.
- **Tres voces:** la app sigue dibujando dos. Cada obra afectada lo dice bajo la partitura.
- **Sanz:** los adornos siguen escritos como notas, y el paso lo dice.
- **Arreglado:** Mertz no se dibujaba en la vista Tab.

## Animaciones y audio
- 39 escenas nuevas: 37 cambian de cuadro en movimiento; las otras 2 ya habían llegado al último cuadro. Sin errores de consola.
- Partitura, Tab y Ambas: los 32 archivos de obra dibujados en las tres vistas sin error.
- Audio: todas las notas tienen muestra (también Re y Re♯ graves), los adornos suenan antes de su nota y la anacrusa no deja hueco. Prueba de reproducción en una obra y botones de cada recorrido.
- **No comprobado:** sincronía percibida. Se mide el dato del tiempo, no se oye. Nadie ha oído ni tocado las obras.

## Por verificar, a propósito
Numeración de Carlevaro; «n.º 5» de Aguado; signos de la cifra de Sanz; lista de Segovia; total de la *Sonatina*; versión a solo de Willoughby (se usa la 1.ª guitarra de un dúo); digitaciones propuestas, ninguna probada con la mano.

## Derechos
Brouwer VI y VII y Lauro: nada copiado. Método, escucha y ejercicios propios. La tablatura de ClassTab se usa para notas de obras de dominio público; sus dedos no se copian. La *Pavana* de Nesyba es CC BY-NC-SA, adecuada para este uso personal y sin ánimo de lucro.

## Resultados
218 pruebas de 218, también con `TZ=Europe/Madrid`. Validador: 0 errores en 517 pasos. Recorrido con datos temporales: 37 tramos y 658 pantallas, sin errores de consola, red ni imágenes rotas. Continuar con botones, correcto, y prueba nueva de los tres cursos juntos. Del Curso 1, en el contenido solo cambian el paso de la *Romanesca* y los avisos de las obras.
