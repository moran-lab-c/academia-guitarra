# Revisión formal de la Fase 2

Rama `revision-fase-2`, sin fusionar en `main`. Fecha: 25/10/2026.

Esta revisión se ha limitado a corregir fallos claros. Todo lo pedagógico y los detalles visuales que le corresponden a usted están en el apartado C, sin tocar.

---

## A. UI Finish-Gate

**Estado general:** PASS CON OBSERVACIONES (el resultado de partida). Los 9 problemas importantes y los 9 menores están corregidos. He comprobado las pantallas en el navegador con el servidor sobre una carpeta temporal (Hoy, Curso, Paso, Obra, Obras, Progreso, Biblioteca, Diario, Profesor y Ajustes): no hay errores de consola ni avisos de «Algo ha fallado al dibujar».

### Problemas críticos

Ninguno.

### Problemas importantes (corregidos)

| | Problema | Corrección |
|---|---|---|
| I-1 | El selector Clásico \| Flamenco del carril no cambiaba «Hoy». | Hoy toma siempre el programa de `preferencias.programaPrincipal`. Su propio selector también guarda la preferencia con `cambiar()`. Si la preferencia cambia, la sesión se rehace. Además, el carril compara con la preferencia guardada, así que con «Los dos» guardado, pulsar «Clásico» también la cambia. |
| I-2 | Los segmentados de Obras y Progreso llevaban estado propio. | Los dos usan `elegirPrograma()`, que cambia la preferencia con `cambiar()`. Ahora hay una sola fuente para el carril, Hoy, Obras, Progreso, Curso y Biblioteca. |
| I-3 | `miniRuta` cogía el primer tramo abierto. | Coge el tramo que contiene `ruta.actual`. Solo si no hay paso actual coge el primero abierto. |
| I-4 | «Cómo se ha hecho» decía «nada urgente» o «nada flojo» cuando lo que pasaba era que no cabía. | El planificador devuelve `noCaben` (encargos, comprobaciones, paso, refuerzos y puntos flojos). El panel distingue «hay X, pero hoy no cabe» de «no hay». «Resto» solo menciona la pasada si la hay y separa la obra del tramo de la obra en estudio. La franja de comprobaciones da sus minutos reales. Los avisos ya no llaman «no urgentes» a las comprobaciones críticas que no caben. |
| I-5 | Se recomendaba la tablatura cuando está «por hacer». | La nueva función `textoTablatura()` dice lo que hay de verdad: en la app, fuera de ella, por hacer o nada. Corregidos `avisoTecnicaLectura` (`logica/notacion.js`), «la tablatura sigue a un toque» (`obra.js`) y «Se toca con tablatura mientras tanto» (`repertorio.js`). |
| I-6 | Faltaba el estilo de `.barra-trozos > span > i`. | Añadidos el trozo (`span`, con fondo) y su relleno (`i`). La barra de avance del curso ya se ve. |
| I-7 | `.pildora[aria-current]` no se resaltaba. | El selector vale para cualquier `aria-current` salvo `false`, así que funciona con `page` y con `step`. |
| I-8 | Faltaba la leyenda bajo el mapa del curso. | `leyendaEstados()` lleva los nombres aprobados (Ahora, Recomendado, Próximo, Más adelante, Hecho, Dominado, Repaso, Refuerzo y ★ Obra final) y va dentro de la tarjeta de la ruta. |
| I-9 | Los bloques de Hoy no se veían abribles. | Cada bloque tiene un chevron que gira al abrirse y un fondo visible al pasar por encima (también en el bloque «Ahora» y en los refuerzos con borde). |

### Problemas menores (corregidos)

- **Fichas con doble borde.** `.chip` queda solo en `componentes.css`. Las variantes de la demo (`.chip-ocre` y demás) usan `border-color`.
- **El «0» en los tramos en borrador.** La ficha sale vacía y su texto accesible dice «sin pasos todavía».
- **`--ruta-fondo`.** Ahora es igual al fondo de `.tarjeta-ruta` (`--sup-1`). Los sellos y anillos de la ruta ya no dejan un halo del color del fondo de la página.
- **Plurales.** Nueva función `plural()`: «1 paso», «1 hecha», «1 dominada», «1 tramo», «1 bloque» y «1 nivel por detrás». En las tarjetas de Obras: «1 ya la tienes», «1 te falta».
- **Decimales.** Todos con coma mediante `decimal()`: lectura, nivel que pide la obra, dificultad y los mensajes de partitura y tablatura.
- **«parte b».** Ahora dice «parte B»: se pone en minúscula solo la primera letra.
- **«Sin bien».** «Cómo vas» usa nombres cortos para cada aspecto («Continuidad bien»).
- **Animar una sola vez.** El título de Hoy y el dibujo del mapa se recuerdan en `localStorage` (clave `academia.animacionesVistas`, las últimas 200), dentro de `web/componentes/titulo.js`. Si no hay almacenamiento local, se recuerdan en memoria.
- **La ★ de un curso sin obra final.** El camino de la entrada solo dibuja la estrella si el curso tiene obra final. El curso 1 de flamenco no la tiene.

### Lo que funciona

La ruta serpenteante con sus estados, la entrada al curso, las fichas de obra con su papel, la notación sobre papel, el carril y el tema oscuro B+ (el verde solo para «ahora» y el ocre para repasos, refuerzos y encargos). A 1400 px de ancho, la composición de Hoy y de Curso se corresponde con las láminas.

### Qué corregir todavía (pequeño, no bloquea)

- Con «Los dos» como preferencia, el carril marca «Clásico» como pulsado.
- Los glifos de estado que van fuera de la ruta, sobre tarjetas (por ejemplo, «De hecho a dominado» en Paso), siguen recortando con el color del fondo de la página. Es el mismo caso que `--ruta-fondo`, pero no estaba en la lista. Bastaría con `.tarjeta { --ruta-fondo: var(--sup-1) }` si a usted le parece bien.

### Qué puede esperar

Lo que le corresponde decidir a usted (apartado C) y el contenido de la Fase 3.

---

## B. QA

**Total de pruebas: 79. Pasan: 79. Fallan: 0.** Antes eran 64; he añadido 15 en `pruebas/revision.test.js` y he reforzado 2 que ya existían.

### La sospecha, clasificada

| Observación | Clasificación | Qué se ha hecho |
|---|---|---|
| Tras un fallo en frío de media cejilla, el refuerzo se insertaba **después** de la aplicación de *Lágrima* B. | **Fallo claro.** El propio código dice «antes de una obra (o de su aplicación)», pero la aplicación quedaba fuera por estar en «repaso». | Corregido: un paso en «repaso» también recibe su refuerzo. Prueba: «el refuerzo va antes de la aplicación…». |
| La misma competencia podía reforzarse dos veces en un tramo, una antes de la aplicación y otra antes de la obra, porque las dos piden lo mismo. Lo encontré al revisar. | **Fallo claro.** | Corregido: un refuerzo por competencia y tramo, antes del primer paso que la necesita. Prueba: «…no se refuerza dos veces…». |
| La aplicación de *Lágrima* B sale en «repaso» aunque nunca se ha tocado. | **Regla para usted.** Un paso de aplicación toma su estado solo de su competencia (media cejilla). En el tramo 1 la aplicación de *Lágrima* A se cierra igual, y las pruebas lo dan por bueno. | Sin cambios. Ver C-1. |
| El refuerzo de lectura antes del estudio de Sor no entra en la sesión. | **Regla para usted.** No es un error de cálculo. Hay dos causas: (a) la competencia que propone (notas de las cuerdas 1-3) está en la comprobación en frío del mismo día, y el planificador no repite en una sesión lo que ya ha entrado; (b) con 60 minutos, su prioridad (5) queda detrás del paso, la obra, el refuerzo de cejilla y el segundo paso. | Sin cambios. Ver C-2. |
| La obra de Sor dice «No pide nada que no tengas». | **Fallo claro de texto** (decía algo falso con la lectura por debajo). El contenido (`pide: []`) es cosa suya. | El texto ahora dice: «No pide ninguna habilidad de la ruta (o está sin clasificar); lo que pide es lectura, más abajo». Comprobado en el navegador. Ver C-3. |

### Cobertura

| Zona | Antes | Ahora |
|---|---|---|
| Modelo (programas, cursos, tramos, pasos, obras, secciones, obra final) | Buena | Igual |
| Ruta: visible ≠ recomendado | Débil (solo comprobaba que hubiera enlace) | Paso del cierre «futuro» y abrible; tramo elegido con `focos.tramo` |
| Ruta: apertura y cierre de tramos | Del tramo 1 al 2 | Tramos 1 y 2 hechos: el cierre sigue «por llegar» por los borradores; la obra final, «futuro» |
| Obras: nueva, conocida, final | Buena | Igual |
| Obras: refuerzo y vuelta a la obra | Débil: aceptaba el refuerzo tanto antes de la aplicación como antes de la obra | Sitio exacto, sin duplicados, texto con «parte B» |
| Lectura que no bloquea | Buena | Además: la lectura atrasada no marca el sitio actual |
| «¿Qué hago hoy?» | Sobre todo 60 minutos, y un caso de 20 | 9 escenarios × 20, 30, 45, 60, 90 y 120 minutos (inicio, tramo 2 con fallo, encargo largo, obra conocida, obra en estudio fuera de la ruta, diagnóstico, tramo 2 hecho con el cierre en borrador, flamenco y los dos) |
| Migración y persistencia | No miraba el historial ni la memoria | Una migración fallida deja intactos el historial en disco y los eventos en memoria |
| Interfaz (`web/`) | Sin pruebas automáticas | Igual: la he comprobado a mano con Playwright |

### Pruebas débiles encontradas

1. `notacion.test.js` daba por buena una frase falsa: «la app te recomienda tablatura» para *Lágrima*, que tiene la tablatura por hacer. Corregida para que exija la verdad.
2. `ruta.test.js`, «una obra que necesita algo flojo…», comprobaba que lo siguiente al refuerzo fuera algo de *Lágrima* B. Pasaba igual antes de la aplicación que antes de la obra, así que no detectaba el fallo.
3. La migración fallida solo miraba `estado.json`.
4. Ninguna prueba recorría varios tiempos de sesión.

### Regresiones

Ninguna. Para confirmar que las pruebas nuevas detectan algo, las pasé sobre el código anterior: fallan las de los refuerzos, la de lo que no cabe y la de la migración en memoria; las de la matriz de planes pasan.

### Persistencia y migración

- **Fallo claro corregido:** `importar()` clonaba el estado, pero no los eventos. Una migración que fallaba después de empezar dejaba **en memoria** los eventos ya cambiados («ruta» → «programa») aunque no se hubiera tocado el disco, y el servidor seguía sirviéndolos. Ahora clona los dos.
- **Bien:**
  - escritura atómica (temporal y renombrado, con reintentos en Windows);
  - el historial solo crece;
  - copia antes de migrar y antes de importar;
  - conflicto de revisión (409) sin pisar los datos;
  - un `estado.json` ilegible no se toca.
- **Riesgos que quedan (no los he cambiado):**
  1. Si `importar()` falla **después** de apartar el historial a `copias/`, por ejemplo con el disco lleno al escribir, el historial queda apartado aunque no perdido.
  2. Con la migración fallida, `POST /api/eventos` sigue aceptando eventos nuevos. La app no llega a enviarlos, porque no carga sin estado, pero otra herramienta podría.
  3. Lo pendiente en el navegador (`localStorage`) solo se recupera si la revisión del archivo no ha cambiado.

### Riesgos del planificador (vistos en la matriz; ninguno rompe las reglas aprobadas)

- Cuando los tramos 3-5 están en borrador, una vez hechos el 1 y el 2 la sesión no tiene ni paso ni obra: todo son bloques de área, **sin repertorio**.
- Las sesiones de flamenco no llevan ninguna obra con ningún tiempo.
- Las comprobaciones en frío se acumulan: con los tramos 1 y 2 hechos hay entre 16 y 17 vencidas, y caben 2 o 3 por sesión (tope de 4 a 6 minutos).
- La «obra del tramo» es la primera en el orden de la ruta: en el tramo 2 entra Sor y no *Lágrima* B. El refuerzo de cejilla, que se justifica por *Lágrima* B, entra sin ella.
- Con «Los dos» y 30 minutos, el flamenco queda en bloques de 5 minutos.

### Pruebas recomendables (siguientes)

- Pruebas de la interfaz en el navegador, aunque sean de humo: que cada pantalla se dibuje sin «Algo ha fallado» y que el carril cambie Hoy.
- `importar()` con un fallo de escritura simulado a mitad.
- La recuperación de lo pendiente en el navegador y el 409 con varias ventanas.
- Las rutas de flamenco, cuando tengan contenido.
- El estado «dominado» del cierre de tramo (solidez 3).

---

## C. Decisiones pendientes para usted

1. **El estado de los pasos de aplicación.** Hoy se calcula solo con su competencia, así que una aplicación nunca tocada aparece como «hecha» o «repaso» si la competencia lo está. Propuesta posible: que cuente también la sección de la obra. Esto cambiaría también el cierre del tramo 1.
2. **El refuerzo de lectura en la sesión.**
   - ¿Debe entrar aunque esa competencia ya tenga su comprobación en frío hoy?
   - ¿Con qué prioridad frente a la obra?
   - Ahora mismo propone repetir una competencia ya completada (cuerdas 1-3), porque la nueva (cuerdas 4-6) ya está en el tramo.
3. **El contenido de la obra de Sor.** ¿Debe declarar en «pide» las competencias de lectura? El texto ya no dice nada falso.
4. **La obra del tramo en la sesión.** ¿La primera según la ruta (Sor) o la obra eje del tramo (*Lágrima* B)? ¿Y el refuerzo, solo junto a su obra?
5. **Las sesiones sin repertorio** cuando la ruta se para en tramos en borrador: ¿que entre la obra final o una obra estudiable, o se espera al contenido de la Fase 3?
6. **La cantidad de comprobaciones en frío** por sesión frente a la cola que se acumula.
7. Lo que ya estaba pendiente:
   - la obra final del curso 1;
   - los pesos del planificador;
   - la animación de Hoy (ahora, una vez al día, porque la clave lleva la fecha);
   - el sitio del Profesor;
   - los colores de error;
   - cómo se ven los tramos en borrador (ahora, un círculo discontinuo vacío).
8. **Cambiar de programa rehace la sesión de Hoy.** Se pierden las marcas de «hecho» de los bloques que no se han registrado; lo registrado ya está en el diario. ¿Le parece bien así?

Partitura, tablatura en pantalla y metrónomo siguen como están aprobados para el MVP. No se ha añadido ninguna función grande ni se ha empezado la Fase 3.

---

## D. Veredicto

**APROBADA CON CORRECCIONES MENORES.**

Los 9 problemas importantes y los menores de la UI Finish-Gate están corregidos. Los fallos claros de lógica y persistencia también, cada uno con su prueba, y las 79 pruebas pasan. Quedan dos detalles visuales pequeños (apartado A) y las decisiones del apartado C, que no bloquean la fase.

---

## E. Archivos cambiados

- `logica/notacion.js`: `decimal()` y `textoTablatura()`; `avisoTecnicaLectura` dice la verdad sobre la tablatura.
- `logica/ruta.js`: refuerzos antes de la aplicación en «repaso» y sin duplicados; «parte B»; decimales con coma.
- `logica/planificador.js`: `noCaben`; avisos que separan «no cabe» de «no es urgente», con plurales.
- `servidor/almacen.js`: una migración fallida no cambia los eventos en memoria.
- `web/inicio.js`: el carril compara con la preferencia guardada.
- `web/vistas/hoy.js`: una sola fuente de programa; panel «Cómo se ha hecho»; bloques abribles.
- `web/vistas/repertorio.js`: segmentado con `elegirPrograma()`; tablatura, decimales y plurales.
- `web/vistas/progreso.js`: segmentado con `elegirPrograma()`; plurales.
- `web/vistas/obra.js`: textos de tablatura y lectura; Sor ya no dice «No pide nada»; decimales.
- `web/vistas/curso.js`: leyenda bajo el mapa; plurales.
- `web/vistas/paso.js`: «Cómo vas» con nombres cortos.
- `web/componentes/ruta.js`: `miniRuta` con el tramo actual; fichas en borrador sin «0»; plurales.
- `web/componentes/marcas.js`: `leyendaEstados()` con los nombres aprobados.
- `web/componentes/titulo.js`: animaciones recordadas en `localStorage`; la ★ solo con obra final.
- `web/componentes/comunes.js`: `plural()`.
- `web/estilos/base.css`: `.chip` fuera; `.barra-trozos > span > i`; `.pildora[aria-current]`.
- `web/estilos/componentes.css`: `--ruta-fondo` en `.tarjeta-ruta`; leyenda; bloques de Hoy.
- `pruebas/notacion.test.js`: la prueba del aviso exige la verdad sobre la tablatura.
- `pruebas/servidor.test.js`: la migración fallida deja intactos el historial y la memoria.
- `pruebas/revision.test.js` (nuevo): 15 pruebas.
- `REVISION-FASE-2.md` (este informe).

---

## F. Resultado final de `node --test`

```
1..79
# tests 79
# suites 0
# pass 79
# fail 0
# cancelled 0
# skipped 0
# todo 0
```
