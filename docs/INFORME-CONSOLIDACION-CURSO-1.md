---
status: active
project: personal
type: log
created: 2026-10-31
---
# Consolidación del Curso 1

Pendiente de su revisión. El currículo V3.1 no se ha tocado.

## 1-3. Continuar
- **Cómo estaba:** `abrir()` guardaba como `posicion` cualquier paso visitado y como `nivel` el nivel de ese paso. `continuar()` iba a `posicion` si estaba sin hacer, y si no, seguía desde ahí.
- **Por qué fallaba:** visitar y estar haciendo eran lo mismo. Entrar por error en un paso futuro lo convertía en «donde iba». Lo mismo pasaba al mirar un paso de otro nivel.
- **Cómo está:** visitar no escribe nada. Completar es lo único que avanza. Continuar es siempre el primer paso pendiente del nivel. Solo se cambia de nivel a propósito. Un paso adelantado o ya hecho ofrece «Continuar mi ruta», que no marca nada, y completar queda aparte. La pantalla por la que iba se guarda por paso. El campo `posicion` de datos antiguos se ignora.

## 4. Pruebas nuevas
`pruebas/continuar.test.js` cubre los casos A a G, datos antiguos, otro nivel y la persistencia con servidor y datos temporales. `herramientas/prueba-continuar.mjs` reproduce el fallo con los botones en un navegador. `pruebas/enriquecido.test.js` recorre los 225 pasos con Continuar.

## 5. Conceptos profundizados
Fundamental, tercera mayor y quinta justa (Tramo 1, con animación y audio); tónica y dominante (Tramo 2); octava y compás (Tramo 1). El Tramo 4 los recuerda en vez de repetirlos. Mapa en `docs/CONCEPTOS-CURSO-1.md`.

## 6-7. Animaciones
Nuevas en la base: zoom del mástil, escena `ejercicio` (zona, dedos uno a uno, secuencia con cada mano y sonido) y escena `ritmo` (duración como barras, sincronizada con el audio).

| Tramo | Paso | Animación |
|---|---|---|
| 1 | Qué es un acorde | Fundamental, 3.ª y 5.ª medidas en una cuerda |
| 2 | Figuras | Ritmo: redonda, blanca y negra |
| 2 | Preparar y soltar | p-i-m-a al aire |
| 3 | Melodía y bajo | p y m a la vez, con zoom |
| 3 | Puntillo | Ritmo |
| 5 | Dedo guía | Zoom y viaje del dedo |
| 7 | Mi menor | La sensible, con zoom |
| 9 | Escalera de cruces, cromática y trémolo | i-m, dedos que se quedan y p-a-m-i |
| 10 | Ligados con dedo fijo | Zoom y dedo fijo |
| 12 | 6/8 y hemiolia | Ritmo: acentos y agrupación |

## 8-9. Obras
Todas se ven en Partitura, Tab o Ambas, suenan, se estudian por compases y señalan lo que explican.

| Obra | Estado | Fuente | Qué falta |
|---|---|---|---|
| *Lágrima* (16 compases) | Integrada | Alier, cotejada con Mutopia | Mano derecha: propuesta de la academia. Bar 7: un círculo de cuerda dudoso |
| Sor op. 60 n.º 1 | Integrada | Mutopia, CC BY-SA | — |
| Sor op. 31 n.º 1 | Integrada | Edición en IMSLP | Transcrita a ojo: conviene cotejarla |
| Sor op. 44 n.º 1 | Integrada | 1.ª edición en IMSLP | Compases 13, 21 y 32 con lectura difícil: por verificar |
| Sor op. 31 n.º 4 | Integrada | Simrock en IMSLP | Tres planos en dos voces; voces interiores por cotejar |
| Giuliani op. 1 «Étude 3» | Integrada | Mutopia, CC BY-SA | Por verificar que sea el n.º 3 de la parte 4 |
| Tárrega, *Estudio en Do* | Integrada | Edición de J. Richter | Atribuida a Tárrega; escrita en 12/8 en vez de tresillos |
| Sanz, *Españoleta* | Integrada | Apke en IMSLP, CC BY-SA | Adornos sin dibujar; tresillo del compás 13 aproximado |
| *La Romanesca* | Parcial | Sor-Fortea, Wilkinson (IMSLP) | **Puede no ser la del currículo**: IMSLP la da como probable falsificación de Fétis y no sigue el bajo de la romanesca. Compases 12-19 y 26-28 por cotejar |
| Su *Estudio en Mi menor* | Fuera a propósito | Su PDF en la vault | No va al repositorio público: autor sin aclarar |
| Brouwer, *Estudio sencillo* VI | No integrable | — | Con derechos. Alternativa: método, escucha y ostinato propio. Hace falta su edición |
| Alternativas (Dowland, Giuliani op. 50) | Sin integrar | — | No son obligatorias |

**Limitaciones comunes:** la app dibuja dos voces, y tres planos se reparten en dos. No dibuja arrastres, armónicos, mordentes ni tresillos: se explican en el paso. Las transcripciones hechas de escaneos no tienen una segunda lectura independiente, salvo *Lágrima*.

## 10-11. Resultados
Pruebas: 211 en verde. Continuar con botones en navegador, correcto (`herramientas/prueba-continuar.mjs`). Recorrido de los 14 tramos, 323 pantallas: sin errores de consola, red ni imágenes rotas; tras el último retoque se repitieron las pruebas y la de botones, no los 14 tramos. Audio: las muestras cargan, pero nadie ha escuchado las obras transcritas para detectar errores de oído.

## 12. Preparado para el Curso 2
Continuar y sus pruebas, los componentes de animación, `herramientas/ly-a-notacion.py` para fuentes LilyPond, y el modelo de bloques.
