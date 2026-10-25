# Informe de la Fase 2.1: cierre con las decisiones definitivas

Rama `revision-fase-2`, sin fusionar en `main`. Fecha: 25/10/2026.

Este informe sustituye al de la primera ronda de la Fase 2.1 (commit 6e05f48). Recoge sus decisiones definitivas (1 a 7) y los puntos 8 a 13 de su último mensaje.

No he cambiado la arquitectura, no he añadido contenido y no he empezado la Fase 3: ni VexFlow, ni metrónomo, ni cursos nuevos, ni evaluación inicial completa.

Sus datos reales no están en el repositorio y no los he tocado. Todo se ha probado con carpetas temporales (`ACADEMIA_DATOS`) y puertos de prueba (`ACADEMIA_PUERTO`).

---

## A. Decisiones aplicadas

### D1. Aplicación: realizada, aprendida y consolidada son cosas distintas

- **Realizada.** Basta con haber trabajado el pasaje para que la aplicación esté realizada. Cuenta cualquier intento registrado de esa sección o de la obra entera, o una práctica registrada desde el paso. Con eso, el paso queda hecho.
- **Aprendida.** La competencia que aplica está completada.
- **Consolidada y dominada.** Lo dicen las comprobaciones en frío de esa competencia.
- **Trabajar no es dominar.** Si la competencia falla después en frío, el paso vuelve a repaso y sale su refuerzo.
- **La preparación de la obra final** pide además la obra entera y su competencia (`int.pieza-sin-parar`). Así, practicar *Lágrima* entera no da por cerrado el tramo de cierre.
- **En la pantalla del paso** aparece una línea con las tres etapas, por ejemplo: «○ Aplicación sin trabajar todavía · ✓ competencia aprendida · ○ consolidada».
- **Código:** `logica/ruta.js` (`estadoPaso` con `etapas`, `aplicacionTrabajada`) y `web/vistas/paso.js`.

### D2. Lectura por necesidad, con Sor como uno de los recursos

- **Sin umbral de «medio nivel».** Se usa la misma regla que en las demás áreas: el nivel que se trabaja es el alcanzado + 1. Sor pide lectura 1, que es el nivel que trabaja, así que antes de Sor no se inventa ningún refuerzo de lectura.
- **La obra principal es la obra eje (Lágrima B).** Sor nunca la sustituye, en ninguna duración.
- **Primero se mira si hoy hace falta lectura** (`necesidadLectura`). Hace falta en cualquiera de estos casos:
  - va por detrás de su técnica y su repertorio;
  - la obra para leer de su tramo pide más de la que tiene;
  - esa semana lleva menos lectura de la que le toca;
  - lleva más días sin aparecer que su margen.
- **Si hace falta, se busca el mejor recurso**, por este orden:
  1. lo que la ruta trae de lectura, en su orden (por ejemplo, las notas de las cuerdas 4-6 antes de Sor);
  2. el refuerzo de lectura, si la obra para leer pide más que el nivel que trabaja;
  3. Sor, si su lectura todavía aporta algo y no duplica lo anterior;
  4. la lectura de su nivel o los pasajes de sus obras.
- **Si no hace falta, no entra nada de lectura**: Sor no aparece solo porque exista.
- **Una sola actividad de lectura por sesión**, también con «Los dos». Va antes si la lectura va por detrás.
- **Código:** `logica/planificador.js` (`necesidadLectura`, `aportaObraLectura`, `LECTURA_DEL_DIA`) y `logica/ruta.js` (`nivelLecturaTrabajo`).

### D3. Cola de comprobaciones con jerarquía mínima

- **Primero manda la jerarquía:**
  1. lo que necesita ahora la obra que está trabajando: lo que pide la obra eje del tramo abierto, mientras no esté hecha, y lo que tiene un refuerzo abierto;
  2. la ruta y la obra activa (también lo que el diagnóstico da por sabido);
  3. lo que falló en su última comprobación;
  4. lo demás vencido;
  5. lo que solo está a punto de olvidarse.
- **Dentro de cada nivel ordena una puntuación:**
  - riesgo de olvido, hasta +2;
  - relación con la ruta: +2 si es del tramo abierto o de la obra activa, +1 si es del resto del curso;
  - +1 si falló;
  - +1 por semana vencida, hasta +4.
- **Nada queda relegado para siempre.** Cada 4 semanas vencida, una cosa sube un nivel, aunque nunca al primero. La simulación de 40 días con sesiones de 30 minutos y 20 comprobaciones pendientes lo confirma:
  - lo de la ruta entra en menos de dos semanas;
  - el arpegio, que es de fuera de la ruta, entra a los 24 días de vencer.
- **Las sesiones cortas no son un examen.**
  - El tope es de 4 minutos, o 6 en sesiones de 90 o más, para toda la sesión, también con «Los dos».
  - Siempre queda sitio para la ruta.
  - Lo que no entra se queda en la cola, con un solo aviso: «10 comprobaciones siguen en la cola; la más antigua venció hace 8 días. Entran por prioridad en las próximas sesiones.»
- **Código:** `colaDeRepasos` y `planificar` en `logica/planificador.js`.

### D4. Cobertura de todas las áreas, sin porcentajes fijos

- **Sin límite del 25 % y sin repartos idénticos.** Cada área del reparto del curso tiene un margen de días sin aparecer, según su peso (`margenDias`). En el curso 1 clásico:

  | Área | Margen |
  |---|---|
  | Repertorio | 1 día |
  | Técnica y lectura | 2 días |
  | Escalas | 3 días |
  | Ritmo y oído | 4 días |
  | Teoría, armonía y mástil | 5 días |

- **Pasado el margen**, cada día de más sube un punto la **prioridad** de su mejor candidato. No cambia su tiempo: ya no hay aumento de peso, que inflaba la lectura.
- **Nunca adelanta** al profesor, a las comprobaciones, al objetivo de la ruta ni a lo que necesita la obra. Su tope es 3,4, detrás de los refuerzos, y 5,5 mientras la ruta espera.
- **Cuenta como aparecer** cualquier práctica o tanda del área. Las comprobaciones en frío no cuentan.
- **Simulación de abandono prolongado** (20 días solo con técnica y repertorio): todas las áreas reaparecen en tres días como mucho.
- **Código:** `candidatosSesion` (bloque de cobertura), `diasSinAparecer` y `margenDias`.

### D5. Cierre del curso con la obra final «aprendida con requisitos»

- **El curso se cierra cuando la obra final sale entera y de memoria.** *Consolidada* (estable en frío días después) y *dominada* son niveles posteriores: no hacen falta para pasar de curso.
- **La grabación es evidencia opcional.**
  - Al registrar se puede marcar «La he grabado (opcional)», pero no se exige.
  - En el contenido sigue declarada (`requisitos: ["memoria", "grabacion"]`) para cuando exista la infraestructura.
  - Lo exigible está en la lógica: `REQUISITOS_EXIGIBLES = ['memoria']`.
- **Una lectura inicial no la cierra.** Solo marca la primera realización.
- **La obra final se recomienda solo cuando la ruta alcanza el tramo de cierre.**
- **Código:** `progresoFinal` y `textoRequisitos` en `logica/ruta.js`; `web/vistas/obra.js` y `web/componentes/registro.js`.

### D6. Refuerzo por aspectos para cualquier obra, sin inventar diagnósticos

- **Vale para cualquier obra** (nueva, aprendida, consolidada o conocida). Si su última comprobación en frío falla, `falloEnFrio` toma los aspectos marcados «mal» (o, si no hay ninguno, los marcados «con fallos»). Sale el refuerzo de las competencias de la obra que trabajan esos aspectos, y la obra pasa a «recuperar», sin reiniciarse.
- **Si no consta qué aspecto falló**, no hay refuerzo concreto. Se propone una revisión general de la obra: «repásala entera valorando cada aspecto».
- **Si ninguna competencia trabaja ese aspecto**, no hay refuerzo concreto: «revísalo en la propia obra».
- **El texto distingue los dos casos:**
  - obra conocida: «La conocías; la comprobación falló en X: se recupera, no se aprende de cero»;
  - obra aprendida aquí: «La comprobación en frío falló en X: se refuerza eso y se vuelve a la obra».
- **La vuelta a la obra que falló** entra en la sesión con prioridad 3,5, detrás de los refuerzos.

### D7. Repertorio mientras la ruta espera

- **Orden de la sesión:**
  1. profesor;
  2. comprobaciones (empezando por las críticas);
  3. necesidades y reparaciones;
  4. repertorio activo del curso: lo que aún no está aprendido, con la obra final delante;
  5. consolidación de lo aprendido del curso;
  6. lectura, si hace falta;
  7. cobertura de áreas.
- **Sor no es la obra por defecto.** Las obras cuyo único papel es la lectura no cuentan como repertorio.
- **Hueco corregido en este cierre.** El día en que tocaba comprobar en frío *Lágrima* entera, la obra desaparecía de la sesión y la lectura se llevaba hasta 30 de 60 minutos. Ahora se comprueba al principio y después se trabaja, con el motivo «Ya la has comprobado en frío al principio: ahora se trabaja lo que haya salido flojo».
- **Simulación de 14 días a 60 minutos en espera:**
  - hay repertorio todos los días: 50 % del tiempo;
  - lectura: 23 %, con un máximo de 18 minutos en una sesión;
  - técnica: 12 %;
  - escalas: 8 %.

### 8. Curso 2 en preparación

- **Mantengo la solución**, sin inventar contenido:
  - `cursoActual` nunca lleva a un curso sin ruta: se queda en el último que la tiene y dice cuál viene;
  - el aviso dice qué está en preparación;
  - la sesión continúa en modo espera.

### 9. Persistencia

- **Mantengo la solución.** Las cinco situaciones que pidió tienen ahora una prueba explícita cada una (apartado E).

---

## B. Correcciones realizadas en este cierre

1. **Pruebas que afirmaban reglas antiguas.** Se han corregido para que digan lo que usted ha decidido:
   - la grabación obligatoria;
   - el umbral de medio nivel;
   - lo de fuera de la ruta antes que la ruta en la cola;
   - un refuerzo de lectura antes de Sor;
   - el tipo de bloque mientras la ruta espera.
2. **El paso de aplicación desaparecía de la sesión** el día que tocaba comprobar en frío su competencia (escenario S5). Ahora la comprobación va al principio y la aplicación después, porque son actividades distintas: la competencia aislada frente al pasaje. La aplicación no se repite con otro bloque del área.
3. **La cobertura inflaba la lectura** (26-32 minutos de 60) porque subía también su peso. Ahora solo sube la prioridad.
4. **El tramo de cierre salía «hecho»** con solo practicar *Lágrima* entera, y la obra final salía como «recomendada» antes de tiempo. Eso apagaba el modo espera. Ahora la preparación pide la competencia, y la obra final espera al tramo de cierre.
5. **Teoría, armonía y oído parecían abandonadas** porque sus tandas no contaban como aparecer. Ahora cuentan; las comprobaciones, no.
6. **Una obra en repaso con un fallo sin aspecto identificado** no entraba en la sesión. Ahora entra como revisión general.
7. **La obra final desaparecía de la sesión en espera** el día de su comprobación en frío (D7). Corregido, con su prueba: falla con el código anterior y pasa con el nuevo.
8. **El contenido del tramo de cierre decía «Lágrima entera, de memoria y grabada»**, y eso se veía en la pantalla Curso. Ahora dice «Lágrima entera y de memoria (la grabación, opcional por ahora)». El objetivo del paso de preparación dice ahora que la grabación de prueba es opcional. Son dos frases de `contenido/rutas/clasica-c1.json`: no es contenido nuevo. El mismo texto se ha cambiado en la página de demostración de componentes.
9. **La cabecera de `logica/planificador.js`** describía el orden antiguo. Ahora describe el definitivo.

**Interfaz.** Solo cambian textos y una línea de estado, sin cambios visuales importantes:
- la línea de etapas en el paso;
- «(opcional)» en la casilla de la grabación;
- los textos de la tarjeta de la obra final: «permite cerrar el curso» y «nivel posterior»;
- la etiqueta «Repertorio» para el modo activo en «Hoy».

---

## C. Pruebas

| | |
|---|---|
| Total | **111** (antes 99) |
| Nuevas | **12**: 9 en `fase-2-1.test.js` (de 17 a 26) y 3 en `persistencia.test.js` (de 3 a 6) |
| Reescritas | las 26 de `fase-2-1.test.js` y las 6 de `persistencia.test.js`, según las decisiones definitivas |
| Corregidas porque afirmaban algo falso | 3: dos en `ruta.test.js` (refuerzo de lectura antes de Sor y orden de la cola) y una en `revision.test.js` (la coma del refuerzo de lectura, ahora con un catálogo de prueba en el que Sor pide 2,5) |
| Pasan | **111**, también con `TZ=Europe/Madrid` y `TZ=America/Los_Angeles` |
| Fallan | **0** |

### Las nuevas detectan lo que corrigen

- **Con el código de la primera ronda (6e05f48)**, fallan 14 de las 26 de `fase-2-1`. Las 12 que pasan comprueban reglas que ya estaban bien y deben seguir así:
  - el tramo 1 no se completa sin la aplicación;
  - un solo refuerzo con varios orígenes;
  - la obra eje frente a Sor;
  - Sor como recurso cuando hace falta lectura;
  - la lectura no frena, y `exige`;
  - pocas y muchas comprobaciones;
  - varios días de cola;
  - la obra conocida que falla;
  - el curso en preparación.
- **Persistencia.** Las 6 pasan con el código de 6e05f48, porque usted pidió mantener esa solución. Con el código anterior a la Fase 2.1 fallan 4 de las 6 (casos 2, 3 y 4, y el corte de luz). Los casos 1 y 5 ya funcionaban antes.

### Qué cubre cada grupo

| Archivo | Pruebas | Qué cubre |
|---|---|---|
| `fase-2-1.test.js` | 26 | **Aplicación (3):** realizada, aprendida y consolidada; el tramo y la preparación. **Refuerzos (1):** uno con varios orígenes. **Obra eje (1):** Lágrima B en 30, 45, 60, 90 y 120 minutos; Sor no la desplaza. **Lectura (5):** la ruta manda el orden; Sor como recurso; nada si está cubierta; no frena; `exige`. **Comprobaciones (5):** muchas y pocas en 20, 30, 60 y 90 minutos; jerarquía (crítica, ruta, fallo, vencida, a punto de olvidarse); ascenso cada 4 semanas y tope de antigüedad; simulación de varios días (lo de la ruta en 14 días, lo de fuera en 28, nunca por encima del tope). **Cobertura (2):** abandono prolongado de varias áreas; nunca adelanta a la ruta. **Obra final (2):** una lectura no la cierra; de memoria sí; cierra el curso sin consolidar. **Fallos en frío (3):** obra conocida; obra aprendida aquí con aspecto; sin aspecto (revisión general). **Curso en preparación (2).** **Repertorio en espera (2):** la obra final antes que la lectura y la cobertura; Sor nunca por defecto; 14 días con repertorio diario, también el de su comprobación en frío |
| `persistencia.test.js` | 6 | Los 5 casos del apartado E y el corte de luz |
| `revision.test.js` | 15 | Los hallazgos de la revisión de la Fase 2 |
| `ruta.test.js` | 10 | Modelo de ruta, validador, apertura de tramos, ruta ↔ obra, refuerzos, obras conocidas, «Hoy» y migración |
| `planificador.test.js` | 11 | Minutos, encargos, comprobaciones al principio, programas separados, desfase, notación, determinismo |
| `dominio.test.js` | 13 | Completado, solidez, frío, fallos, vencimiento, aspectos, secciones |
| `servidor.test.js` | 10 | Guardado, versiones, copias, importar y exportar, adjuntos, migración que falla |
| `notacion.test.js` | 9 | Partitura y tablatura, avisos, pasajes legibles |
| `niveles.test.js` | 4 | Niveles por núcleo y estimaciones |
| `recomendador.test.js` | 4 | Viabilidad y porqué |
| `catalogo.test.js` | 3 | Contenido real sin errores, validador, migraciones |

---

## D. El planificador final

**Orden de la sesión:**
1. encargos del profesor;
2. comprobaciones en frío, con la cola del apartado D3;
3. el paso actual y la obra eje de su tramo;
4. lo que la obra necesita: refuerzos y vuelta a la obra que falló;
5. la lectura, solo si hace falta, con el mejor recurso;
6. el resto del curso, con la cobertura de áreas.

Mientras la ruta espera, el orden es el de D7. Después se reparte el tiempo por pesos, en bloques de 5 minutos o más, y cada bloque dice para qué es.

**Ejemplo 1: tramo 2, el día después de un fallo en frío de la media cejilla.** Las cifras son minutos.

| Duración | Sesión |
|---|---|
| **20′** | calentamiento 3 · comprobaciones 4 (melodía acompañada, sonido) · paso actual 13 (mayor y menor homónimos). El panel dice que el refuerzo no cabe hoy. |
| **30′** | calentamiento 3 · comprobaciones 4 · paso 9 · *Lágrima*, parte B, 14 |
| **60′** | calentamiento 5 · comprobaciones 4 · paso 14 · lectura 8 (notas de las cuerdas 4-6, el paso de la ruta) · refuerzo de la media cejilla 9 («la piden la aplicación y la obra de Lágrima, parte B») · *Lágrima* B 13 + pasada 7 |
| **90′** | calentamiento 5 · comprobaciones 6 (+ I-IV-V7-I) · paso 18 · lectura 11 · escalas 5 · pausa 5 · refuerzo 13 · *Lágrima* B 18 + pasada 9 |

En todas las duraciones:
- la obra principal es Lágrima B, en cuanto cabe;
- Sor no aparece;
- las comprobaciones no pasan de 4 minutos (6 con 90);
- aparece el aviso de las 10 que siguen en la cola.

**Ejemplo 2: lo disponible del curso hecho (la ruta espera).**

| Duración | Sesión |
|---|---|
| **20′** | calentamiento 3 · comprobaciones 4 · *Lágrima* entera (obra final, repertorio activo) 13 |
| **30′** | calentamiento 3 · comprobaciones 4 · lectura 7 · *Lágrima* 16 |
| **60′** | calentamiento 5 · comprobaciones 4 · técnica 9 · escalas 5 · lectura 12 · *Lágrima* 16 + pasada 9 |
| **90′** | calentamiento 5 · comprobaciones 6 · técnica 11 · escalas 8 · lectura 16 · pausa 5 · ritmo 5 · *Lágrima* 22 + pasada 12 |

El día que *Lágrima* toca comprobarla en frío, a 60′: calentamiento 5 · comprobación de *Lágrima* 4 · técnica 7 · escalas 5 · lectura 15 · *Lágrima* 16 + pasada 8.

**Ejemplo 3: alumno nuevo, a 20′.** Calentamiento 3 · paso 1 (sonido clásico) 7 · *Lágrima* A 10.

**Simulaciones de varios días:**
- **12 días a 60′ desde el fallo de la media cejilla, con un alumno que lo hace todo bien:**

  | Área | Tiempo |
  |---|---|
  | Repertorio | 42 % |
  | Lectura | 27 % |
  | Técnica | 10 % |
  | Escalas | 7 % |
  | Comprobaciones | 7 % |
  | Ritmo | 4 % |
  | Teoría | 2 % |
  | Oído | 1 % |

  El bloque más largo es de 21 minutos.
- **Espera, cola y abandono:** las cifras están en D3, D4 y D7.

**Dos comportamientos deliberados**, que la herramienta de la revisión marca como aviso:
- El día que la competencia de una aplicación toca comprobarla en frío, se comprueba al principio y después se aplica al pasaje (escenario S5). Es lo que dice el bloque: «Tócalo antes de practicarlo hoy».
- Un encargo largo del profesor (40 minutos de Sor) ocupa entera una sesión de 20 o 30 minutos, porque el profesor manda.

---

## E. Persistencia

La solución se mantiene: no he cambiado el almacenamiento en este cierre. Estas son las cinco pruebas explícitas (`pruebas/persistencia.test.js`):

1. **Migración fallida: datos intactos.** `estado.json` y el historial quedan iguales byte a byte, en disco y en memoria. La migración trabaja sobre una copia, y antes se hace una copia previa en `copias/antes-de-migrar-…`.
2. **Migración fallida: no se escribe nada nuevo.**
   - `POST /api/eventos` responde 503 («No se guarda nada mientras los datos tengan un problema»);
   - `PUT /api/estado` sigue rechazado;
   - lo pendiente se queda en el navegador para reenviarlo después.
3. **Reinicio tras el fallo.** Todo sigue a salvo. Cuando se corrige el dato antiguo, la migración se completa entera al arrancar.
4. **Importación fallida en cualquier paso: nada a medias.**
   - Se prepara al lado (`historial.nuevo/`, `estado.json.nuevo` y el diario `importando.json`).
   - Se cambia con tres renombrados.
   - Si cualquiera falla, se deshace en el acto y responde «No se ha cambiado nada».
5. **Importación correcta: estado nuevo completo.** Lo anterior queda apartado en `copias/`, sin borrarse.

**Corte de luz a mitad de una importación.** Al arrancar se lee el diario. Si el último renombrado no llegó a hacerse, vuelve lo de antes; si se hizo, queda lo nuevo. No hacen falta pasos manuales.

**Lo que no cubre:** un disco que falle o se llene justo mientras se deshace el cambio. En ese caso el diario se queda y se reintenta en el siguiente arranque. Tampoco hay sumas de comprobación. Las dos cosas quedan fuera de esta arquitectura.

---

## F. Estado del contenido

- ***Lágrima* (Tárrega).**
  - Es la obra final candidata del curso 1, con requisitos «de memoria» (exigible) y «grabación» (opcional por ahora).
  - **No está marcada como conocida en ningún sitio del producto.** En la primera ronda se quitó la nota «David la toca en parte».
  - Tiene dos secciones (A y B). La partitura está fuera (IMSLP) y la tablatura está «por hacer», como se avisa.
  - En las pruebas, «*Lágrima* conocida» solo aparece como escenario ficticio.
- ***Lágrima*, parte B.** Es la obra eje del tramo 2, la obra principal de ese tramo.
- **Sor, op. 60 n.º 1.**
  - En el tramo 2 su papel es la lectura: no pide ninguna habilidad (`pide` vacío) y pide lectura 1 (estimada).
  - Es un recurso de lectura cuando hace falta. No frena el tramo y nunca es la obra principal ni el repertorio por defecto.
- **Curso 1.**
  - Tramos 1 y 2 completos.
  - Tramos 3, 4 y 5 en borrador: se ven en el mapa como «en borrador», sin pasos inventados.
  - Tramo de cierre con la preparación de la obra final.
- **Curso 2** (*Cejilla y posiciones*). Está en borrador, sin ruta. La app dice que está en preparación, y nunca lleva a una ruta vacía ni muestra contenido ficticio.
- **No he añadido contenido.** Los únicos cambios son las dos frases de la grabación (apartado B, punto 8).

---

## G. Documentación actualizada

- **`docs/Plan de la academia.md`:**
  - **obra final y cierre del curso:** aprendida con requisitos; consolidada y dominada son posteriores; grabación opcional;
  - **paso de aplicación:** realizada, aprendida y consolidada;
  - **fallos en frío:** para cualquier obra y sin diagnósticos inventados;
  - **la lectura no frena**, salvo `exige`;
  - **nota sobre el 25 %:** ahora habla de cobertura de todas las áreas;
  - **apartado 8 (planificador):** cola con jerarquía, obra eje, necesidades y reparaciones, lectura por necesidad, cobertura con márgenes y orden mientras la ruta espera.
- **`docs/Arquitectura de la academia.md`:**
  - **estado del paso:** con sus etapas;
  - **refuerzos:** nivel de trabajo en lugar de medio nivel;
  - **`falloEnFrio`** para cualquier obra, con los casos indeterminados;
  - **obra final:** con `REQUISITOS_EXIGIBLES`;
  - **planificador:** franjas, escala de prioridades, lectura por necesidad, cobertura y modo espera;
  - **pruebas:** 111;
  - **decisión de la Fase 2:** sin la regla del medio nivel.
- **Cabecera de `logica/planificador.js`:** el orden definitivo.
- **Este informe.**

He buscado en los dos documentos las reglas antiguas: medio nivel, grabación obligatoria, «un área principal», el 25 %, `falloConocida` y «una dosis diaria» de lectura. No queda ninguna regla que contradiga a otra.

---

## H. Veredicto

**APROBADA CON OBSERVACIONES.**

Las siete decisiones y los puntos 8 a 13 están aplicados, con sus pruebas:
- **pruebas:** las 111 en verde;
- **pantallas**, revisadas en el navegador con servidores y datos de prueba, sin errores:
  - Hoy a 20 y 60 minutos;
  - el paso de aplicación;
  - el carril con «Los dos»;
  - el curso en preparación;
  - la obra final con sus requisitos;
  - el día de espera con la comprobación de *Lágrima*.

Las observaciones son solo dos y ninguna bloquea:

1. **Los pesos del planificador** (paso 25, siguiente 15, obra 35, refuerzo 18, lectura 12, obra en estudio 25; +25 % por nivel de desfase).
   - Cuando la lectura va por detrás, se lleva entre el 23 % y el 27 % del tiempo de 60 minutos.
   - Mientras la ruta espera, va siempre «un nivel por detrás», porque lo que la subiría está en los tramos en preparación.
   - Si le parece mucho, el ajuste es un número (`PESO.lectura`), no una regla nueva.
2. **La obra final del curso 1.** *Lágrima* sigue como candidata (está marcada como `decision` en el contenido). Si la confirma, no hay que cambiar nada.

No avanzo a la Fase 3 hasta que usted revise este cierre.

---

### Archivos cambiados en este cierre

- **Lógica:** `logica/ruta.js`, `logica/planificador.js`.
- **Interfaz:** `web/vistas/hoy.js`, `web/vistas/paso.js`, `web/vistas/obra.js`, `web/componentes/registro.js`, `web/demo/componentes.js` (solo el texto).
- **Contenido:** `contenido/rutas/clasica-c1.json` (las dos frases de la grabación).
- **Pruebas:** `pruebas/fase-2-1.test.js`, `pruebas/persistencia.test.js`, `pruebas/revision.test.js`, `pruebas/ruta.test.js`.
- **Documentos:** `docs/Plan de la academia.md`, `docs/Arquitectura de la academia.md` y este informe.

### Resultado final de `node --test`

```
# tests 111
# suites 0
# pass 111
# fail 0
# cancelled 0
# skipped 0
# todo 0
```
