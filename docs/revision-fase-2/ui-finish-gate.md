# UI Finish-Gate · Academia de guitarra · Fase 2

Revisión del 25/10/2026. Solo lectura: no se ha tocado ningún archivo de la app ni de la vault. Servidores usados: 7431 (prueba con progreso) y 7432 (prueba vacío). El 7421 (datos reales) no se ha abierto. En el 7431 se ha registrado un bloque «Ahora» de prueba (Mayor y menor homónimos, 9/10) y se cambió el programa del carril a Flamenco y de vuelta a Clásico; además el selector de notación del ejercicio de la escala se cambió y se devolvió a la recomendada.

Método: lectura completa de `web/` (inicio, núcleo, 8 componentes, 14 vistas y las 3 hojas de estilo) y de los apartados indicados del plan y de la arquitectura; capturas a 1440 y 1024 px en los dos servidores; pruebas en el navegador integrado (selector de programa, abrir bloques, registrar, selector de notación) y comprobación de estilos calculados.

**Lente del producto.** Un alumno adulto que estudia solo con su profesor semanal abre la app para saber qué tocar ahora mismo y por qué, y para ver dónde está en el curso. Lo primero que tiene que encontrar es **el paso «Ahora» y el bloque de hoy**; la acción principal, **practicar y registrar**. Se repite a diario: Hoy → bloque → registro. Raro pero delicado: cambiar de programa, entender qué falla en una obra y qué notación usar.

---

## Estado general: **PASS CON OBSERVACIONES**

La Fase 2 es una base sólida: el sistema visual B+ está aplicado con disciplina (ningún color suelto en las vistas, todos salen de variables), la jerarquía Programa → Curso → Tramo → Paso se lee, el mapa de la ruta es específico de este producto y no un panel genérico, los pasos futuros se ven y se abren sin bloqueo, la obra y el paso se enlazan en los dos sentidos y «Hoy» con 20 y 30 minutos da sesiones realistas. No hay nada que rompa datos ni que bloquee el estudio.

No es un PASS limpio porque hay **ocho fallos importantes** de clase (a), todos pequeños de corregir, que hacen que la app diga cosas contradictorias en las pantallas principales: el selector de programa no manda en Hoy, «Dónde estás» enseña el tramo equivocado, el panel «Cómo se ha hecho esta sesión» afirma cosas falsas cuando algo no cabe, y la notación promete una tablatura que no existe. Conviene cerrarlos antes de construir encima (notación real, metrónomo, diagnóstico).

---

## Problemas críticos

Ninguno.

---

## Problemas importantes

**I-1. El selector Clásico | Flamenco del carril no cambia «Hoy».** (a)
- Dónde: Hoy (`#/`, `#/hoy/N`). `web/vistas/hoy.js:26` y `:65`: `nuevaSesion` guarda `programa` en `sesion`, y la línea 26 da prioridad a `sesion.programa` sobre la preferencia, así que tras el primer dibujado el carril ya no cuenta.
- Comprobado en el navegador: carril en Flamenco, Hoy sigue con la sesión clásica, el desplegable dice «Programa clásico» y «Dónde estás» muestra el curso clásico. Solo se arregla recargando.
- Por qué importa: es la pantalla diaria y el carril dice una cosa y la pantalla otra.

**I-2. Obras y Progreso tienen su propio Clásico | Flamenco que, una vez pulsado, deja de seguir al carril.** (a, con una pequeña decisión b)
- Dónde: `web/vistas/repertorio.js:14` y `:35` (`filtro.programa`), `web/vistas/progreso.js:12` y `:32` (`elegido`). Comprobado: pulsar «Clásico» en Progreso con el carril en Flamenco → al volver, Progreso sigue en Clásico y el carril en Flamenco.
- Además hay tres selectores de programa distintos (carril, segmentado de Obras/Progreso y desplegable de Hoy, que añade «los dos»). Lo aprobado es el selector bajo el logo. Lo directo es que los locales sigan al carril (o que lo cambien). Si se quieren conservar, la decisión es de David.
- También: abrir un curso del otro programa por dirección (`#/curso/curso%3Af1`) deja el carril en «Clásico» mientras se ve el curso flamenco (captura `g-curso-f1b.png`).

**I-3. «Dónde estás» (Hoy) enseña el tramo 1 mientras el texto dice «Tramo 2» y el paso actual no aparece.** (a)
- Dónde: `web/componentes/ruta.js:354` (`miniRuta` elige el primer tramo «abierto»; con el tramo 1 pendiente de su evaluación hay dos abiertos). DOM de `g-hoy.html`: `aria-label="Tramo 1: 10 de 11 pasos hechos"`, ningún punto «ahora», y al lado el texto «Tramo 2, el cambio de modo».
- Por qué importa: es la respuesta a «dónde estoy», que es una de las preguntas que la Fase 2 tiene que contestar de un vistazo. Debe tomar el tramo que contiene `ruta.actual`.

**I-4. «Cómo se ha hecho esta sesión» confunde «no cabe hoy» con «no hace falta».** (a)
- Dónde: Hoy, `web/vistas/hoy.js:129-143`. Con 20 minutos (captura `g-hoy20.png`) el aviso dice «12 repasos esperan a otro día» y el panel dice «Repasos críticos: nada urgente que comprobar»; con 20 y 30 minutos dice «Lo que necesita la obra: nada flojo que reforzar» aunque hay un refuerzo de media cejilla que no ha cabido; «Resto y repertorio: la obra de tu tramo y una pasada para acabar» aparece aunque no haya pasada (vacío, 20 y 30); con 90 minutos dice «(2-4 min)» y el bloque dura 6 (`g-hoy90.png`).
- Por qué importa: el plan pide que el planificador no sea opaco (riesgo «Planificador opaco»). Un panel que explica las prioridades no puede negar lo que el aviso de arriba afirma. Debe decir «hay X, hoy no cabe» cuando es así.

**I-5. La notación promete una tablatura que no existe y recomienda dos cosas a la vez.** (a)
- Dónde: Obra *Estudio op. 60, n.º 1* (`g-obra-sor.png`): el aviso dice «La app te recomienda tablatura; la partitura sigue disponible» y, justo debajo, el selector marca «Partitura ★ (fuera de la app)» como recomendada y «Tablatura (por hacer)» desactivada. En *Lágrima* y en Obras: «No frena nada: la tablatura sigue a un toque» / «Se toca con tablatura mientras tanto» con la tablatura desactivada.
- Archivos: `logica/notacion.js:73` (el aviso no mira si la tablatura existe), `web/vistas/obra.js:109`, `web/vistas/repertorio.js:75`.
- Por qué importa: toca directamente lo aprobado en 3.7 (la recomendación es una, con su porqué, y la tablatura nunca se quita). Aquí no se quita, pero la pantalla dice lo contrario de lo que enseña. Con «por hacer», el texto debe decirlo («la tablatura de esta obra está por hacer»).

**I-6. La barra «Avance por tramos» de la cabecera del curso no se ve.** (a)
- Dónde: Curso, `web/vistas/curso.js:43` pinta `span > i` dentro de `.barra-trozos`, pero `web/estilos/base.css:274-275` solo da estilo a `.barra-trozos > i`. Comprobado en el DOM de `g-curso.html`: la barra existe con sus anchos (91 %, 22 %…), pero no se dibuja nada.
- Por qué importa: es la vista de avance por tramos de la cabecera, la que dice «qué he hecho» del curso entero.

**I-7. El curso actual no se marca en la fila de cursos (Curso y Progreso).** (a)
- Dónde: `web/vistas/curso.js:47` usa `aria-current="page"` y `web/vistas/progreso.js:39` usa `"step"`, pero `web/estilos/base.css:199` solo resalta `.pildora[aria-current="true"]`. Capturas `g-curso.png`, `g-curso-c2.png` y `g-progreso.png`: ninguna píldora destacada.
- Por qué importa: es la marca de «estás aquí» del nivel Curso; sin ella, en `curso:c2` solo el texto «TODAVÍA NO» dice dónde estás.

**I-8. El mapa de la ruta no tiene leyenda.** (a)
- Dónde: Curso. `leyendaEstados()` existe en `web/componentes/marcas.js:100` y no se usa en ninguna vista. Hecho, dominado, ahora, recomendado (halo), disponible, por llegar, repaso (↻) y refuerzo (discontinuo ocre) solo se distinguen por el glifo; recomendado y disponible se parecen mucho (`g-curso.png`, «Notas de las cuerdas 4-6» frente a «Figuras básicas»). Además a la leyenda le falta «recomendado» y la ★ obra final.
- Por qué importa: es una de las preguntas de esta revisión («¿se distinguen bien hecho, repaso, ahora, próximo, más adelante y obra final?»). Con leyenda, sí; sin ella, depende de memorizar los glifos.

**I-9. Los bloques de Hoy no parecen abribles y el «por qué» queda escondido.** (a)
- Dónde: Hoy, `web/vistas/hoy.js:81`. El título es un `btn-fantasma` cuyo hover pinta `--sup-1` sobre una tarjeta `--sup-1` (no se nota), sin flecha ni chevron. Ahí dentro están los motivos, la notación y «Registrar este bloque». Los `details` del resto de la app sí llevan su flecha (`base.css` 285-288 de `details > summary::before`).
- Por qué importa: el plan pide que cada bloque diga para qué es y, al abrirlo, sus motivos. Si no se ve que se abre, el «por qué» y el registro, que es la acción principal, no se encuentran.

---

## Problemas menores

| # | Qué | Dónde | Clase |
|---|---|---|---|
| M-1 | «★ Obra final» en ficha ocre sólida, igual que «Encargo». El ocre aprobado es para repasos, refuerzos y encargos; en el mapa la obra final es una medalla blanca. Mismo elemento, dos colores, y uno coincide con el de los encargos | `curso.js:113`, `obra.js:43`, `repertorio.js:70` | a |
| M-2 | Los tramos en borrador muestran un «0» dentro del círculo discontinuo (número de pasos = 0) | Curso, `componentes/ruta.js:259` (`g-curso.png`, `v-curso.png`, zoom `revision/zoom/curso-abajo.png`) | a |
| M-3 | El mapa pinta sus fondos con `--fondo` sobre una tarjeta `--sup-1`: los círculos vacíos y la caja «DESPUÉS · CURSO 02» se ven como recuadros más oscuros. `.tarjeta-ruta` no tiene regla para fijar `--ruta-fondo` | `componentes.css:48`, `curso.js:50` | a |
| M-4 | A 1024 px la curva del giro entre filas pasa por encima de las etiquetas («La melodía de Lágrima…», «Lágrima, parte A») | Curso a 1024 (`g1024-curso.png`, zoom `revision/zoom/curso1024-giro.png`) | a |
| M-5 | Total de pasos distinto: la cabecera del curso dice «de 22 pasos» (cuenta la obra final) y el paso, «PASO 13 DE 21» | `logica/ruta.js:123` y `vistas/paso.js:27` | a (o b si la obra final debe contar como paso) |
| M-6 | Gramática: «1 pasos · por llegar», «1 tramos · 5 pasos», «1 hechas de 2» | `componentes/ruta.js:280`, `curso.js:73`, `progreso.js:51` | a |
| M-7 | Decimales mezclados: «lectura (0.3)» y «la tuya, 0.3» frente a «tienes 0,3» | `logica/notacion.js:73`, `repertorio.js:75` | a |
| M-8 | «Parte b» en minúscula en los motivos del refuerzo («la pide Lágrima, parte b») frente a «Parte B» en el resto | Hoy y mapa (texto que sale de la lógica) | a |
| M-9 | «Cómo vas» del paso abrevia cada aspecto con su primera palabra: «Sin bien», «Notas bien» | `vistas/paso.js:174` | a |
| M-10 | «Lo que esta obra trabaja» se rompe con nombres largos: el punto, el enlace y «tramo 1» en tres líneas | Obra Sor (`g-obra-sor.png`), `obra.js:87-88` (`fila-entre` con `flex-wrap`) | a |
| M-11 | Las fichas (`.chip`) se definen dos veces: `base.css:182` (borde con `box-shadow`) y `componentes.css:37` (con `border`). Resultado: borde doble en las neutras, anillo gris dentro de las ocres y una discontinua ocre «sucia» en refuerzo (comprobado con estilos calculados). Hay además dos convenciones de nombre (`chip-ahora` y `chip--ahora`) | estilos | a |
| M-12 | El estado «seleccionado» tiene tres aspectos: papel (píldoras), `--texto` (segmentados de Hoy, ejercicio, Obras) y gris `--sup-3` (Partitura/Tablatura, el más débil). En el selector de notación cuesta ver cuál se está mostrando. Hay además una regla muerta para el selector antiguo (`base.css:298-301`) | estilos | a |
| M-13 | El ancho y la duración de animaciones salen sueltos en el CSS (420, 640, 760, 1300 ms; 220 ms de la entrada) aunque la cabecera de `componentes.css` dice que todo sale de `tokens.css`; `--punteado` y los colores de error viven fuera de `tokens.css`; «Mal» en el registro usa el color del área Escalas (`componentes.css:253`) en vez de un color de error | estilos | a |
| M-14 | El título de Hoy y el dibujo del mapa se animan en cada carga de la página, no «una vez al día» ni «la primera vez» (se recuerdan solo en memoria). La entrada al curso sí se guarda en `localStorage` | `componentes/titulo.js:9`, `componentes/ruta.js:292` | a |
| M-15 | La entrada al curso dice «EMPIEZAS UN CURSO» aunque se esté a mitad (tramo 2) y su camino pone el punto verde siempre al principio; en flamenco dibuja la ★ final aunque ese curso no tiene obra final | `componentes/titulo.js:395-417`, `curso.js:62-76` | a |
| M-16 | «TODAVÍA NO» en ocre en un curso futuro: el ocre se lee como aviso y el texto puede sonar a bloqueo, cuando nada se bloquea | Curso `curso:c2` (`g-curso-c2.png`), `curso.js:36` | b |
| M-17 | Barras de nivel: «Nivel 0 · 60 % hacia el 1» con la barra llena al 8 % (se escala sobre el nivel máximo) | Progreso y Biblioteca, `componentes/comunes.js:30` | a |
| M-18 | El paso de evaluación («Cierre del tramo 1») no tiene ninguna acción y su lista de lo que se comprueba no enlaza a nada | `vistas/paso.js:124-137` | a |
| M-19 | El paso «Preparar la obra final» sale en el mapa sin título (solo un ◎ con la «P»); hay que pasar el ratón | `componentes/ruta.js:121-124` (forma «menudo» sin etiqueta) | a |
| M-20 | En una fila que va de derecha a izquierda, el rótulo del tramo queda sobre su último paso (a la izquierda), no sobre el primero | Curso, `componentes/ruta.js:161` | b (afinar el mapa en la Fase 7) |
| M-21 | La fila de cursos se parte en dos líneas a 1440 px (07 queda sola) | Curso | a |
| M-22 | Pantalla huérfana: Evaluaciones (`#/evaluaciones`) no tiene ningún enlace; solo se llega escribiendo la dirección | `inicio.js:71` | a (o b: dónde enlazarla) |
| M-23 | El número de minutos de cada bloque va sin unidad (solo con el rango horario a la izquierda) | Hoy | b |
| M-24 | Diario: «Ejercicios de la app» repetido sin decir de qué | `vistas/diario.js:33` | a |
| M-25 | Ajustes: un `button` dentro de un enlace («Exportar mi progreso»), dos elementos interactivos anidados | `vistas/ajustes.js:57` | a |
| M-26 | El componente `atril()` no se usa: el selector pinta su propio `div.atril` con una frase. El sitio del dibujo real existe, pero hay dos implementaciones del atril para elegir | `componentes/atril.js`, `componentes/notacion.js:157-160` | a |
| M-27 | Cambiar la duración en Hoy rehace la sesión y pierde los bloques registrados sin avisar | `hoy.js:42` | b |

---

## Pantallas revisadas (capturas en `…\scratchpad\capturas\`)

| Pantalla | 1440 px (7431, con progreso) | 1024 px | 7432 (vacío) |
|---|---|---|---|
| Entrada al curso | `g-curso-entrada.png`, `g-curso-f1.png` (flamenco) | | `v-curso-entrada.png` |
| Curso + ruta | `g-curso.png`, `g-curso-f1b.png`, `g-curso-c2.png` (borrador) | `g1024-curso.png` | `v-curso.png` |
| Hoy | `g-hoy.png` (60), `g-hoy20.png`, `g-hoy30.png`, `g-hoy60.png`, `g-hoy90.png` | `g1024-hoy.png` | `v-hoy20.png`, `v-hoy30.png`, `v-hoy60.png`, `v-hoy90.png` |
| Paso | `g-paso-t2-02.png` (repaso), `g-paso-t1-07.png` (hecho), `g-paso-t1-11.png` (evaluación), `g-paso-cierre.png` (más adelante) | `g1024-paso.png` | |
| Obra | `g-obra-lagrima.png` (obra final), `g-obra-sor.png` (para leer) | `g1024-obra.png` | `v-obra-lagrima.png` |
| Ejercicio | `g-ej-escala.png` (con notación), `g-ej-presion.png` (sin notación) | `g1024-ej.png` | |
| Obras | `g-obras.png` | `g1024-obras.png` | `v-obras.png` |
| Progreso | `g-progreso.png` | `g1024-progreso.png` | `v-progreso.png` |
| Biblioteca, Diario, Profesor, Ajustes, Evaluaciones | `g-biblioteca.png`, `g-diario.png`, `g-profesor.png`, `g-ajustes.png`, `g-evaluaciones.png` | | |

Recortes y montajes en `…\scratchpad\revision\zoom\` (`curso-abajo.png`, `curso1024-giro.png`, `secundarias.png`, `w1024.png`, `vacio-hoy.png`, `pasos.png`). Pruebas en el navegador integrado: selector del carril en Hoy, Curso, Obras, Progreso y Biblioteca; bloques de Hoy abiertos y un registro; selector de notación y «Volver a la recomendada». Sin errores en la consola.

---

## Qué funciona bien (mantener)

- **Disciplina de tokens.** Ninguna vista ni componente usa un color hexadecimal suelto; el verde solo aparece en «Ahora», el punto del logo y la marca de la entrada; el grafito no llega a negro ni a blanco puro; el papel del atril es lo más claro de la pantalla. Tema claro preparado sin condicionar nada.
- **El mapa de la ruta es de este producto.** Camino serpenteante con lo hecho trazado sólido y lo que falta punteado, etiquetas por área con su color, «AHORA» en verde, repaso con ↻ ocre, refuerzos discontinuos ocre insertados justo antes de la obra que los pide con su motivo («Falló en frío y la pide *Lágrima*, parte B»), tramos en borrador como ficha, medalla de obra final y pista del curso siguiente. Se reparte bien a 1440 y a 1024.
- **Visible no es recomendado.** Todos los pasos son enlaces; el paso «más adelante» se abre y dice «puedes verlo y practicarlo, pero la ruta te propone antes lo anterior», sin candado ni botón desactivado.
- **Obra ↔ ruta en los dos sentidos.** El paso dice qué obras prepara (y qué abre después); la obra dice en qué pasos y tramos está, qué trabaja con el tramo de cada cosa, y lo que necesitas agrupado (necesitan refuerzo / no consolidadas / ya las tienes) con enlace a dónde se practica.
- **Hoy con poco tiempo es realista.** 20 minutos: 2-3 bloques; 30: 4 bloques; el encargo va primero y entero; el «Ahora» se distingue (borde claro + ficha verde); las horas acumuladas dicen cuánto dura cada cosa; 60 y 90 cuadran sus minutos con pausa a los 50. Registrar un bloque lo apaga sin rehacer la sesión.
- **El selector de notación** recuerda la elección, ofrece «Volver a la recomendada», explica el porqué con ★ y marca lo que no hay («por hacer», «fuera de la app») en vez de esconderlo.
- **Tipografía con papel claro:** Archivo Black solo en títulos y cifras, Source Serif en cursiva para obras (también dentro de los bloques de Hoy), Courier para rótulos. «Reducir movimiento» está cubierto por tres capas (tokens a 0 ms, `animation-duration` global y comprobación en JS).
- **Estados vacíos honrados:** curso en borrador («Ruta en preparación… Fase 3»), ejercicio sin notación, obra sin clasificar.

---

## Qué corregir antes de seguir

En este orden (todas de clase a, cambios pequeños):

1. **I-1 y I-2:** que el programa del carril mande en Hoy, Obras y Progreso (y que abrir un curso de otro programa lo refleje o no lo contradiga). Comprobar: carril en Flamenco → Hoy, Curso, Obras, Progreso y Biblioteca en flamenco sin recargar.
2. **I-3:** «Dónde estás» con el tramo del paso actual. Comprobar con el 7431 (dos tramos abiertos): el punto verde está en la fila.
3. **I-4:** el panel «Cómo se ha hecho» distingue «no cabe hoy» de «no hay». Comprobar en 20, 30 y 90 minutos del 7431.
4. **I-5:** los textos de lectura y el aviso técnica/lectura dicen la verdad cuando la tablatura está por hacer. Comprobar en *Estudio op. 60* y *Lágrima*.
5. **I-6, I-7:** barra por tramos visible y curso actual marcado en las píldoras.
6. **I-8, I-9:** leyenda bajo el mapa (con recomendado y ★) y una señal de que los bloques de Hoy se abren.
7. Los menores rápidos que se ven a diario: M-1 (color de la obra final), M-2 (el «0»), M-3 (fondo del mapa), M-6/M-7/M-8 (textos), M-10, M-11 (fichas con doble borde).

**PASS limpio cuando:** el selector de programa se refleja en todas las pantallas sin recargar; «Dónde estás» y el mapa marcan el mismo paso «Ahora»; ninguna pantalla dice una cosa en un sitio y la contraria en otro (sesión, notación, totales); el mapa tiene leyenda; y las capturas de Hoy (20/30/60/90), Curso, Paso, Obra y Ejercicio a 1440 y 1024 pasan sin los defectos de arriba.

---

## Qué puede esperar

- M-4 (giros del mapa a 1024 px), M-13 (tiempos y colores fuera de `tokens.css`), M-14/M-15 (memoria y texto de las animaciones), M-17 a M-21, M-24 a M-26: pulido o limpieza sin efecto en el uso diario; caben en la Fase 7 o cuando se toque cada archivo.
- Pantallas secundarias (área, competencia, diario, profesor, ajustes, evaluaciones): funcionan con el estilo B+ pero sin diseñar; documentado como pendiente. Ojo: «Practicar este paso» y «Ajustar el criterio» llevan a la competencia, que es de las sin rediseñar, así que se verá antes que las demás.
- Notación y metrónomo: el sitio del dibujo existe (atril bajo el selector, en obra y ejercicio), pero es una franja de una línea; cuando llegue el dibujo cambiará la altura. Del metrónomo no hay sitio reservado en ninguna pantalla (ni en el bloque de Hoy ni en el ejercicio): no es un defecto hoy, pero sí una decisión de colocación (ver abajo).

---

## Decisiones que debería tomar David

1. **Un selector de programa o varios.** ¿Se quitan los Clásico | Flamenco de Obras y Progreso y el desplegable de Hoy pasa a ser solo «este programa / los dos», o se mantienen como filtros locales que cambian también el carril?
2. **¿Abrir un curso del otro programa cambia el carril?** (p. ej., un enlace a `curso:f1` estando en Clásico).
3. **Dónde va el metrónomo:** dentro de cada bloque abierto de Hoy, fijo en el ejercicio junto al atril, o los dos. Y si el atril crece a tamaño de partitura cuando llegue el dibujo (ya está apuntado como pendiente que él decida si va en esta fase).
4. **Color de la obra final:** ¿blanco/papel como la medalla del mapa o ocre? El ocre aprobado es de repasos, refuerzos y encargos (M-1).
5. **¿La obra final cuenta como paso?** Para que cabecera y paso digan el mismo total (M-5).
6. **«TODAVÍA NO» / «YA PASADO»** en los cursos que no son el actual: ¿se quedan, con qué color? (M-16).
7. **Cambiar la duración a mitad de sesión:** ¿se avisa o se mantiene lo registrado? (M-27).
8. **Fuera de lo visual, para revisar en la lógica:** con *Estudio op. 60* en la sesión de 60 y 90 minutos, el refuerzo de lectura que la ruta pone antes de él no entra en la sesión (sí entra el de media cejilla antes de *Lágrima*), y la obra Sor dice «No pide nada que no tengas» aunque la ruta le inserta ese refuerzo. No lo clasifico como fallo de interfaz; conviene que el planificador y `necesidades` lo confirmen.
