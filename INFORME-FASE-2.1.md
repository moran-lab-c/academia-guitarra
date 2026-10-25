# Informe de la Fase 2.1

Rama `revision-fase-2`, sin fusionar en `main`. Fecha: 25/10/2026.

He seguido `docs/FASE-2.1-INSTRUCCIONES.md`. Para tener aquí los informes y los documentos aprobados, he traído a esta rama la rama `informes-revision`, que solo añade documentos (`docs/`). No he repetido la revisión: he partido de sus hallazgos (H-01 a H-20).

Lo que no he cambiado:
- la arquitectura (Programa → Curso → Ruta → Tramo → Paso, ruta visible completa, «desbloqueado» como recomendación, relaciones Ruta ↔ Obra, obra final por curso, tablatura y selector Partitura | Tablatura, prioridad del profesor, «¿Qué hago hoy?» y el sistema de progreso);
- el contenido de los cursos;
- VexFlow y el metrónomo.

No he empezado la Fase 3.

---

## A. Correcciones realizadas

### 1. Paso de aplicación

- **Qué cuenta como evidencia.** Un paso de aplicación (o de preparación) ya no sale «hecho» ni «repaso» solo porque su competencia esté aprendida. Hace falta una de estas dos cosas:
  - un intento registrado de su obra o sección (o de la obra entera, que la contiene);
  - una práctica registrada para ese paso. «Hoy» y la página del paso añaden el paso al evento (`paso`).
- **Qué ve usted.** Sin evidencia, el paso queda pendiente y dice «La técnica ya está; falta aplicarla en *Lágrima*, parte B».
- **El bloque de la sesión.** El de una aplicación lleva las instrucciones del paso y la notación del pasaje. Al registrarlo, la aplicación queda hecha.
- **Consecuencia.** Sin la aplicación de la parte A, el tramo 1 no se completa. «Preparar la obra final» tampoco se da por hecho practicando «pieza sin parar» con cualquier obra.
- Archivos: `logica/ruta.js`, `logica/progreso.js`, `logica/planificador.js`, `web/componentes/registro.js`, `web/vistas/hoy.js`, `web/vistas/paso.js`.

### 2. Refuerzos duplicados

- **Uno por necesidad.** Hay un solo refuerzo por competencia y tramo, insertado antes del primer paso que la necesita.
- **Con todos sus orígenes.** El refuerzo guarda de dónde viene (`origenes`). El texto los nombra todos: «Falló en frío y la piden la aplicación y la obra de *Lágrima*, parte B».
- **En la sesión**, un candidato por necesidad.
- Archivos: `logica/ruta.js`, `logica/planificador.js`.

### 3. Obra del tramo frente a obra de lectura

- **La obra principal es la obra eje del tramo** (`obraEje`). Si ya está hecha, es la siguiente obra de la ruta que no sea para leer. *Lágrima* B entra como obra principal en todas las duraciones; Sor nunca la desplaza.
- **Sor entra como apoyo, nunca como «obra del tramo»:**
  - genera su refuerzo de lectura mientras su lectura quede a más de medio nivel de la que pide;
  - cuando la lectura ya está cerca, entra como **la lectura del día** («La obra para leer de tu tramo: es la lectura de hoy»);
  - en el mapa se ve como lectura.
- **Una sola lectura por sesión**, también con «Los dos».
- Archivos: `logica/planificador.js`, `logica/ruta.js`.

### 4. La lectura no bloquea el tramo

- **No frena.** Una obra para leer (`papel: lectura`) ya no frena el tramo, no entra en lo que se comprueba en su cierre y no marca el «Ahora», ni siquiera cuando es lo único que queda.
- **Si un tramo necesita de verdad una lectura**, lo declara en sus datos: `"exige": ["paso:…"]`. El validador comprueba que esos pasos sean de ese tramo. Ningún tramo lo usa hoy.
- Archivos: `logica/ruta.js`, `logica/validarCatalogo.js`.

### 5 y 10. Repasos y comprobaciones en frío: una sola cola con prioridad

- **Qué entra en la cola** (`colaDeRepasos`):
  - lo vencido;
  - lo que está a punto de olvidarse (más del 80 % de su intervalo: era la regla 7 del Plan, que no se cumplía);
  - lo que el diagnóstico da por sabido en su ruta.
- **Prioridad sencilla, con sus motivos:**

  | Factor | Puntos |
  |---|---|
  | Riesgo de pérdida | hasta 2 |
  | Relación | 2 si es del tramo abierto, de la obra final o de una obra que estudia; 1 si es de otro tramo del curso |
  | Falló la última vez | 1 (así se sabe si el refuerzo ha servido) |
  | Antigüedad | 1 por cada semana vencida |

- **Cuánto entra.** Por orden, lo que cabe en el tope ya aprobado (4 minutos; 6 con 90 o más). El tope es de la sesión entera, también con «Los dos», y siempre deja sitio para la ruta. No he fijado ningún número nuevo.
- **Lo que no cabe sigue en la cola.** Un solo aviso: «N comprobaciones siguen en la cola; la más antigua venció hace X días».
- **Nada queda relegado para siempre.** Lo nuevo no pasa de unos 5 puntos y lo que espera gana uno por semana. También entra lo de fuera de la ruta, que antes no entraba nunca.
- Archivos: `logica/planificador.js`, `web/vistas/hoy.js`.

### 6. Obra final

- **Los mismos niveles del modelo.** `progresoFinal` usa el modelo de siempre con el criterio de la obra más los requisitos del curso:
  - **primera realización:** la obra entera sale como pide su criterio normal (puede ser leyendo);
  - **aprendida con requisitos:** de memoria y, si se pide, grabada. **Solo esto cierra la obra final;**
  - **consolidada:** solidez 2, en frío días después;
  - **dominada.**
- **Una pasada leyendo ya no la cierra.** «De memoria» marcado mientras se lee no cuenta.
- **Registrar la obra final.** El formulario muestra «De memoria, sin mirar la partitura» y «La he grabado».
- **En la página de la obra** se ve cada etapa con su marca.
- Archivos: `logica/ruta.js`, `logica/esquema.js` (el evento admite `grabacion`), `web/componentes/registro.js`, `web/vistas/obra.js`.

### 7. Obra conocida que falla

- **Qué se detecta.** Si la comprobación en frío de una obra conocida falla, `falloConocida` identifica:
  - los aspectos que fallaron (los marcados «mal»; si no hay ninguno, los marcados «con fallos»);
  - las competencias de las que pide esa sección que miran esos aspectos. Por ejemplo, sonido o limpieza → «sonido clásico»; dinámica → «melodía acompañada».
- **Qué hace la app:**
  - pone sus refuerzos antes de la obra;
  - el paso dice «La conocías; la comprobación falló en la limpieza, el sonido: se recupera, no se aprende de cero»;
  - en «Hoy», la obra sale como «Recuperar».
- **Sin reiniciar.** La obra no vuelve a «sin empezar».
- Archivos: `logica/ruta.js`, `logica/planificador.js`, `web/vistas/hoy.js`.

### 8. Curso siguiente en borrador

- **Nunca un curso sin ruta.** `cursoActual` se queda en el último curso que tiene ruta y `resumen.enPreparacion` dice cuál viene.
- **La ruta explica qué pasa** (`continuidad`) cuando no queda nada que recomendar:
  - se esperan las comprobaciones de los cierres;
  - o lo que queda está en preparación (los tramos 3-5 y el curso 2).
- **Dónde se ve:**
  - en «Hoy», un aviso y una línea en «Dónde estás»;
  - en la tarjeta de Curso: «Lo disponible, hecho» y qué está en preparación.
- **La sesión no queda vacía:** sigue con comprobaciones, refuerzos, el repertorio que ya toca (el que más tiempo lleva sin tocarse) y lo disponible de su nivel.
- No he inventado contenido del curso 2.
- Archivos: `logica/ruta.js`, `logica/progreso.js`, `logica/planificador.js`, `web/vistas/curso.js`, `web/vistas/hoy.js`.

### 9. Reparto por áreas y el supuesto 25 %

- **Inconsistencia documental corregida en el Plan.** La tabla decía «15 % para comprobaciones» y «tope del 25 % por área»; ninguna de las dos cosas está en el código. Queda explicado y sin tope rígido.
- **Cobertura.** Un área principal (técnica o repertorio) que lleva días sin aparecer:
  - sube un punto de prioridad por día, hasta 4,5 (detrás del paso actual, la obra eje, el primer refuerzo, la lectura atrasada y el segundo paso);
  - gana un 25 % de peso por día, hasta el doble;
  - dice por qué («Repertorio lleva 5 días sin aparecer»);
  - no sube si esa área ya entra hoy por otra vía;
  - nunca adelanta al profesor, a las comprobaciones ni a la ruta.
- **Lectura.** Su tiempo usa ahora también el déficit de la semana, como las demás áreas. Si la ruta no propone obra, entra el repertorio que ya toca.
- **Resultado** en la simulación del «alumno perfecto» del informe de QA (27/10 al 7/11, 60 min/día):

  | Área | Antes | Ahora | Base |
  |---|---|---|---|
  | Repertorio | 0 % | 38 % | 34 % |
  | Lectura | 34 % | 23 % | 14 % |

  La lectura sigue por encima de su base porque va por detrás, que es la regla aprobada.
- Archivos: `logica/planificador.js`, `docs/Plan de la academia.md`, `docs/Arquitectura de la academia.md`.

### 11. Migración y persistencia

Corregidos los dos riesgos que quedaban (A y B). El detalle está en el apartado D.
- Archivos: `servidor/almacen.js`, `servidor/servidor.js`.

### 12. Pruebas

- **Se conservan las 79 y hay 20 nuevas.** He revisado si las anteriores siguen teniendo sentido. Tres afirmaban lo contrario de lo que usted ha pedido y se han corregido para que digan la verdad del producto:
  - `niveles.test.js` daba por bueno el salto al curso 2 en borrador;
  - `ruta.test.js` daba por bueno que lo vencido de fuera de la ruta esperase para siempre;
  - `revision.test.js` comprobaba el texto de aviso antiguo.
- **La prueba de notación de *Lágrima*** ya se corrigió en la revisión: ahora exige que se diga que la tablatura está «por hacer» y que no se recomiende. Lo he vuelto a comprobar.
- **Nombres antiguos (H-20).** Renombrados los títulos con «rutas» y «etapa», y la obra de prueba con `ruta:`.

### 13. Dos detalles visuales

- **A.** Con la preferencia «Los dos», los dos botones del carril se ven marcados y el grupo lo dice («Programa: los dos»). Pulsar uno cambia a ese programa.
- **B.** Los iconos de estado de fuera del mapa ya no recortan con el color del fondo de la página: cada tarjeta da su fondo (normal, «ahora», con borde, encargo).

### 15. *Lágrima*

- No está marcada como conocida en ningún sitio del producto. He quitado del contenido la nota «David la toca en parte (24/10/2026)», que podía leerse como tal.
- Sigue siendo la obra final candidata. La Arquitectura lo dice así.
- Las pruebas usan «*Lágrima* conocida» solo como escenario ficticio para probar el mecanismo, porque es la única obra de la ruta con secciones. Sus datos no se tocan nunca.

### Fuera de esta corrección (sin tocar)

- H-12: la duración de la pasada de comprobación.
- H-13: la obra del tramo se recomienda desde el primer día.
- H-15: probar un paso de otro tramo mueve el «Ahora».
- H-17: «Los dos» con 10 minutos.
- H-18: conocida «parcial».
- La lectura de pentagrama en las sesiones de flamenco (H-09).
- Que un encargo ya hecho hoy no vuelva a salir (no tiene prueba).

---

## B. Decisiones pedagógicas que siguen pendientes

1. **La evidencia de una aplicación.** Hoy basta con haber trabajado ese pasaje (cualquier intento registrado) o registrar desde el paso. Si prefiere exigir la sección completada, la aplicación y la obra se cerrarían a la vez.
2. **Cuándo entra Sor en la sesión.** Hoy entra cuando su lectura queda a medio nivel o menos de lo que pide; antes, solo su refuerzo de lectura. Ese refuerzo puede proponer una competencia ya completada (las notas de las cuerdas 1-3) porque la nueva ya está en el tramo (H-19).
3. **Los pesos de la cola de comprobaciones.** Riesgo hasta 2, relación 2/1, fallo +1, una semana vencida +1. Los he propuesto yo para que el sistema sea interpretable. El tope en minutos es el aprobado.
4. **La cobertura de áreas.** Hoy: +1 de prioridad por día sin aparecer (hasta 4,5) y +25 % de peso por día. Solo para técnica y repertorio; ¿también para otras áreas?
5. **El cierre del curso con la obra final:**
   - Hoy cierra con «aprendida con requisitos»: una pasada de memoria y grabada. ¿O debe exigir «consolidada», en frío días después, como los tramos?
   - La grabación, hasta la Fase 5, la declara usted («La he grabado»). ¿Basta, o la debe validar su profesor o un archivo adjunto?
6. **Las obras que fallan en frío.** El paso de aspectos a competencias se aplica solo a las obras conocidas, como pidió. ¿Lo extiendo a cualquier obra que falle una comprobación en frío?
7. **El repertorio mientras la ruta espera.** Entra la obra o sección ya aprendida que más tiempo lleva sin tocarse. Puede ser Sor (obra para leer) o, si ya la ha tocado entera, *Lágrima* completa, que es la obra final cuya preparación está en el tramo de cierre. ¿Le parece bien, o prefiere excluir alguna de las dos?
8. **Lo que ya estaba pendiente.** La obra final del curso 1 (*Lágrima* como candidata) y los pesos del planificador.

---

## C. Pruebas

| | |
|---|---|
| Total | **99** |
| Nuevas | **20**: 17 en `pruebas/fase-2-1.test.js` y 3 en `pruebas/persistencia.test.js` |
| Pasan | **99** (también con `TZ=Europe/Madrid`, el día del cambio de hora) |
| Fallan | **0** |

- **Las nuevas detectan lo que corrigen.** Sobre el código anterior a la Fase 2.1 fallan 16 de las 17 de `fase-2-1.test.js` y las 3 de persistencia. La que pasa es «con pocas comprobaciones, entran todas», que ya funcionaba y debe seguir funcionando.
- **Cobertura nueva:**
  - **aplicación:** con evidencia y sin ella, y con el fallo en frío de la competencia;
  - **refuerzos:** uno, con dos orígenes;
  - **obra eje frente a Sor:** de 30 a 120 minutos, con Sor como apoyo cuando corresponde;
  - **lectura que no frena**, y `exige`;
  - **cola de comprobaciones:**
    - pocas y muchas, con 20, 30, 60 y 90 minutos;
    - prioridades;
    - simulación de 21 días: todo lo que estaba vencido entra en 14 días como mucho, también lo de fuera de la ruta;
  - **obra final:** leyendo, de memoria sin grabar, completa y consolidada;
  - **obra conocida que falla:** sonido y limpieza, y dinámica;
  - **curso en preparación**, y la ruta terminada con 20 a 90 minutos;
  - **cobertura**, con una simulación de 14 días:
    - nunca más de 2 días seguidos sin repertorio;
    - repertorio al menos el 20 %;
    - lectura como mucho el 30 %;
  - **importación atómica** en cada paso del cambio, recuperación tras un corte y escrituras bloqueadas.

---

## D. Estado de la migración y la persistencia

### Después de una migración fallida

1. `estado.json` y el historial del disco quedan **intactos, byte a byte**. Hay copia previa en `copias/antes-de-migrar-…`.
2. **En memoria tampoco cambia nada.** La migración trabaja sobre una copia, así que lo que sirve el servidor es lo que hay en el disco.
3. **No se escribe nada nuevo:**
   - `POST /api/eventos` responde 503 («No se guarda nada mientras los datos tengan un problema»);
   - `PUT /api/estado` sigue rechazado.

   Lo que la app tuviera pendiente se queda en el navegador y se reenvía cuando los datos estén bien.
4. **Lo que sigue permitido:** leer, exportar la copia, restaurar una copia o importar un archivo válido. Esa es la vía de arreglo, y es atómica.

### Importación (y migración, que va por el mismo camino)

1. **Se prepara al lado, sin tocar nada:** `historial.nuevo/`, `estado.json.nuevo` y un diario `importando.json`.
2. **Se cambia con tres renombrados:** se aparta el historial a `copias/`, se pone el nuevo y se pone el estado nuevo.
3. **Si algo falla en cualquier paso**, se deshace en el acto. Todo queda como estaba y la app sigue funcionando con lo de antes. No hace falta ningún paso manual.
4. **Si se corta la luz a mitad,** al arrancar el servidor lee el diario:
   - si el último renombrado no llegó a hacerse, vuelve lo de antes;
   - si ya se había hecho, se queda lo nuevo.

   No queda ningún estado intermedio.
5. **Nada se borra.** Lo apartado y lo preparado que sobre va a `copias/`.

### Lo que no cubre

Un disco que falle de verdad o se llene a la vez que se intenta deshacer: entonces el diario se queda y se reintenta al siguiente arranque. Tampoco hay sumas de comprobación de los archivos. Las dos cosas quedan fuera de esta arquitectura y no las he añadido.

---

## E. Cómo decide ahora el planificador

### Comprobaciones

Una sola cola con prioridad: riesgo + relación con su ruta + si falló la última vez + antigüedad. Entran por orden hasta 4 minutos (6 con 90 o más): 2 min cada competencia, 4 cada obra. Lo demás sigue en la cola y gana un punto por semana, así que nada se queda esperando para siempre.

### Repasos

Son esas mismas comprobaciones: lo vencido, lo que está a punto de olvidarse y lo que el diagnóstico da por sabido. No hay una lista aparte que crezca sin límite.

### Obra principal

La obra eje del tramo abierto (*Lágrima* B en el tramo 2). Si ya está hecha, la siguiente obra de la ruta que no sea para leer. Si la conocía, una pasada de comprobación; si esa pasada falló, «Recuperar». Si la ruta no propone obra, el repertorio que ya toca y más tiempo lleva sin tocarse.

### Refuerzos

Uno por necesidad, justo antes del primer paso que la pide, con todos sus orígenes:
- lo que falló en frío o necesita repaso;
- lo que falló en la comprobación de una obra conocida.

El primero va justo detrás de la ruta. El refuerzo de lectura cuenta como la lectura del día.

### Cómo evita abandonar un área

- Una sola lectura al día, con el déficit de la semana.
- Las demás áreas rotan por el reparto base del curso, el desfase, el déficit de la semana y los puntos flojos.
- Técnica y repertorio suben de prioridad cada día que no aparecen, sin pasar por delante del profesor, las comprobaciones ni la ruta.

### Por duraciones

Escenario: fallo en frío de media cejilla, tramo 2 abierto. Los números entre paréntesis son minutos.

| Min | Sesión |
|---|---|
| 20 | Calentamiento (3) · comprobaciones (4) · paso actual (13). Lo demás no cabe y el panel lo dice («hay algo flojo que reforzar, pero hoy no cabe»). |
| 30 | Calentamiento (3) · comprobaciones (4) · paso actual (9) · *Lágrima* B (14). |
| 60 | Calentamiento (5) · comprobaciones (4) · paso actual (14) · paso de lectura de la ruta (8) · refuerzo de media cejilla (9) · *Lágrima* B (13) + pasada (7). |
| 90 | Calentamiento · comprobaciones (6) · tres pasos · pausa · refuerzo (13) · *Lágrima* B (16) + pasada (9). |

- **Un encargo del profesor** va siempre primero. Con 20-30 minutos y un encargo largo, la sesión es el encargo (lo aprobado).
- **Con todo lo disponible hecho** (curso 2 en preparación):

  | Min | Sesión |
  |---|---|
  | 20 | Calentamiento · comprobaciones (4) · repertorio que ya toca (13) |
  | 60 | Comprobaciones · técnica · escalas · lectura · repertorio con pasada |

---

## F. Estado de la Fase 2

**APROBADA CON OBSERVACIONES.**

Las 15 instrucciones de la Fase 2.1 están hechas, con sus pruebas. Hay 99 pruebas en verde y las pantallas están revisadas en el navegador, con un servidor y datos de prueba en una carpeta temporal y sin errores.

Las observaciones son las decisiones del apartado B, que necesitan su criterio y que no he resuelto con reglas inventadas.

No avanzo a la Fase 3 hasta que usted revise este informe.

---

### Archivos cambiados en la Fase 2.1

`logica/ruta.js`, `logica/planificador.js`, `logica/progreso.js`, `logica/validarCatalogo.js`, `logica/esquema.js`, `servidor/almacen.js`, `servidor/servidor.js`, `web/inicio.js`, `web/vistas/hoy.js`, `web/vistas/curso.js`, `web/vistas/obra.js`, `web/vistas/paso.js`, `web/componentes/registro.js`, `web/estilos/componentes.css`, `contenido/repertorio/clasica/tarrega-lagrima.json` (solo la nota), `docs/Plan de la academia.md`, `docs/Arquitectura de la academia.md`, las pruebas (`catalogo`, `niveles`, `notacion`, `planificador`, `revision`, `ruta`, y las nuevas `fase-2-1` y `persistencia`) y este informe.

### Resultado final de `node --test`

```
1..99
# tests 99
# suites 0
# pass 99
# fail 0
# cancelled 0
# skipped 0
# todo 0
```
