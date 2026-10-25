# Revisión QA · Fase 2 de la academia de guitarra (25/10/2026)

Revisión técnica de la app en `C:\Users\david\The Cave\08 - Guitarra\Academia\app`, sin tocar ningún archivo de la app ni de la vault. Todo lo que se cita se ha ejecutado; los scripts y sus salidas están en `C:\Users\david\AppData\Local\Temp\claude\C--Users-david-The-Cave\28417131-5bcb-4823-81c5-5d994703b937\scratchpad\revision\` (en adelante, `revision\`). Leídos enteros: `Plan de la academia.md`, `Arquitectura de la academia.md`, todo `logica/`, `servidor/`, `pruebas/`, `contenido/rutas`, `cursos/clasica.json`, las competencias y *Lágrima*/Sor, y `web/nucleo/almacen.js`.

**En una frase:** las 64 pruebas pasan y lo que comprueban está bien comprobado, pero la arquitectura nueva tiene huecos que las pruebas no ven: el estado de los pasos de aplicación, la elección de «la obra del tramo», la lectura que sí frena, las comprobaciones que nunca llegan, el salto a un curso vacío y la obra final sin requisitos. Ninguno pierde datos; la migración y la persistencia funcionan.

---

## 1. Pruebas: número real, pasadas y fallidas

| | |
|---|---|
| Total | **64** (53 de la Fase 1 + 10 de `ruta.test.js` + 1 de `servidor.test.js`) |
| Pasan | **64** |
| Fallan | **0** (también con `TZ=UTC`) |
| Duración | ≈ 0,53-0,61 s |

Por archivo (cuenta de `test(` en cada uno, que cuadra con la Arquitectura): catálogo 3 · dominio 13 · niveles 4 · notación 9 · planificador 11 · recomendador 4 · ruta 10 · servidor 10.

Salida real de `node --test` en `app/` (guardada en `revision\salida-node-test.txt`; los dos `Error:` son los 500 esperados de las dos pruebas de datos estropeados, no fallos):

```
✔ el contenido real no tiene errores (24.9938ms)
✔ detecta ids repetidos, referencias rotas, rutas mezcladas, círculos y datos sin naturaleza (20.37ms)
✔ las migraciones se aplican en orden y no se aceptan datos de una versión futura (0.9959ms)
✔ lo que no se ha tocado está pendiente; empezado sin cumplir, en progreso (3.576ms)
✔ un acierto es «completado», no «dominado», aunque pasen 14 días (0.524ms)
✔ tres aciertos en frío y espaciados lo dan por dominado (0.5677ms)
✔ una comprobación demasiado pronto no suma (1.2373ms)
✔ practicar en caliente o con ayuda no prueba que se retenga (0.4462ms)
✔ un fallo en frío baja la solidez; si estaba dominado, pasa a «necesita repaso» (0.7003ms)
✔ un «casi» no suma ni resta, pero adelanta la comprobación (0.3022ms)
✔ lo dominado sin comprobar el doble de su intervalo pasa a «necesita repaso» (0.3618ms)
✔ cuenta la calidad en sus aspectos, no solo el tempo (0.4726ms)
✔ los números del criterio se ajustan, y el tempo solo obliga si se dice (0.5377ms)
✔ practicar una sección no da por completada la obra entera (0.328ms)
✔ en las tandas que corrige la app, solo la primera del día cuenta en frío (0.516ms)
✔ el diagnóstico convalida y dos comprobaciones lo confirman, sin volver a estudiarlo (0.3831ms)
✔ sin práctica, todos los niveles están a 0 (44.1563ms)
✔ un nivel se alcanza con todo su núcleo hecho y el 80 % dominado (37.8984ms)
✔ una estimación del diagnóstico vale hasta que una comprobación la desmiente (44.1832ms)
✔ un área floja no baja la etapa: la marcan la técnica y el repertorio (12.5623ms)
✔ caso A: un ejercicio de técnica se enseña en tablatura (y la partitura está si se quiere) (2.5608ms)
✔ caso B: con las dos, se puede elegir y la elección se respeta (0.3006ms)
✔ caso C: un fragmento difícil de leer puede ir en tablatura aunque la obra se recomiende en partitura (0.2742ms)
✔ caso D: al mejorar la lectura cambia la recomendación, no lo que se puede ver (0.4644ms)
✔ no es una regla fija de nivel: pesan el propósito, si ya la toca, la dificultad, el profesor y la preferencia (0.3178ms)
✔ lo que no hay (o está por hacer) no se ofrece, y se dice (0.41ms)
✔ el aviso «tu técnica permite esta obra, pero tu lectura…» no quita la partitura (0.2494ms)
✔ los pasajes que ya puede leer, si tienen partitura, entran como lectura (0.2218ms)
✔ la notación propia se valida: cuerda, traste y duración de cada nota (0.3389ms)
✔ cuadra los minutos pedidos, con bloques de 5 o más y las pausas (34.9349ms)
✔ el encargo del profesor va primero y le quita el sitio a lo automático (58.2953ms)
✔ lo que toca comprobar en frío va al principio, antes de practicarlo (19.7657ms)
✔ las rutas no se mezclan; con las dos, cada una en sus bloques (15.6264ms)
✔ un área que va por detrás de la técnica recibe más tiempo (30.7694ms)
✔ el desfase se cuenta en niveles: lectura 1,4 con técnica 2 va un nivel por detrás (11.5486ms)
✔ lo que el diagnóstico estima se confirma, no se vuelve a estudiar (11.2207ms)
✔ cada bloque dice por qué está, y avisa de lo que aún no tiene contenido (108.7484ms)
✔ el formato que pide el profesor manda, y la otra opción sigue a mano (10.198ms)
✔ la lectura se trabaja también sobre pasajes de sus obras (10.4263ms)
✔ es determinista y reparte sin perder minutos (9.7945ms)
✔ estudiable ahora, cerca o demasiado difícil, con lo que falta (49.0606ms)
✔ explica por qué conviene: lo que desarrolla coincide con sus puntos de trabajo (16.2195ms)
✔ una obra en preparación convierte sus requisitos en puntos de trabajo (14.6337ms)
✔ no recomienda lo que ya estudia ni lo aparcado, y una obra difícil no desaparece del catálogo (13.1933ms)
✔ el modelo representa programas, cursos, rutas, tramos, pasos, obras, secciones y la obra final (22.8175ms)
✔ el validador exige una ruta coherente y una obra final que no la rompa (16.2588ms)
✔ la ruta empieza en el primer paso; todo se ve, pero solo se recomienda lo que toca (14.0683ms)
✔ al hacer el tramo 1 se abre el 2; su cierre se comprueba en frío días después (31.0909ms)
✔ una lectura más baja no frena: el tramo siguiente se abre y la tablatura sigue disponible (18.0255ms)
✔ ruta ↔ obra: el paso dice qué obras prepara y la obra, qué necesita, qué tiene y dónde se trabaja (32.6989ms)
✔ una obra que necesita algo flojo genera un refuerzo justo antes, y la sesión lo incluye (14.9785ms)
✔ una obra que ya conocía no se reinicia: se comprueba con una pasada y queda aprendida (33.0721ms)
✔ «¿Qué hago hoy?»: profesor, comprobaciones críticas cortas, la ruta y su obra; lo demás espera (22.2337ms)
✔ la migración del esquema 1 al 2 cambia «ruta» por «programa» sin perder nada (0.7463ms)
✔ crea los datos la primera vez y sirve el catálogo sin errores (58.5704ms)
✔ guarda el estado y avisa si otra ventana lo cambió antes (no pisa nada) (22.0018ms)
✔ el historial solo crece, por meses, y no duplica un evento reenviado (25.5125ms)
✔ los datos sobreviven a cerrar y volver a abrir el servidor (13.0554ms)
✔ exportar, cambiar e importar devuelve exactamente lo exportado, y aparta lo anterior sin borrarlo (15.0512ms)
✔ hace la copia del día y la del mes, y se puede restaurar una copia (7.5192ms)
✔ guarda adjuntos con un nombre seguro (4.5806ms)
✔ solo responde a esta dirección, solo escribe con su cabecera y solo sirve sus carpetas (7.8631ms)
Error: estado.json no se puede leer (Expected property name or '}' in JSON at position 2 (line 1 column 3)). No se ha tocado; restaura una copia desde Ajustes.
    at Object.leerEstado (file:///C:/Users/david/The%20Cave/08%20-%20Guitarra/Academia/app/servidor/almacen.js:57:28)
    ...
✔ si estado.json se estropea, no se toca y se avisa (7.2677ms)
Error: Los datos no se han podido pasar al esquema 2 (El archivo tiene errores: Evento viejo: ayuda desconocida «partitura»). No se han tocado; hay copia en copias/antes-de-migrar-1-a-2.json.gz.
    at Object.leerEstado (file:///C:/Users/david/The%20Cave/08%20-%20Guitarra/Academia/app/servidor/almacen.js:57:28)
    ...
✔ si la migración de los datos falla, arranca, avisa y no toca nada (10.055ms)
ℹ tests 64
ℹ suites 0
ℹ pass 64
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 532.9966
```

### Pruebas de mutación (¿detectan las pruebas una regla rota?)
Sobre una copia de la app (`revision\mutantes\app`, restaurada e idéntica al original al acabar), se rompe una regla cada vez y se pasa `node --test` (`revision\mutantes.mjs`):

| Regla rota a propósito | ¿La detectan? |
|---|---|
| La lectura frena los tramos | Sí |
| El cierre del tramo no espera a la comprobación en frío | Sí |
| No se inserta ningún refuerzo / el planificador ignora los refuerzos | Sí / Sí |
| Se ignora que ya conocía la obra | Sí |
| Se ignora `requiere` · el paso actual es el último | Sí · Sí |
| La obra de la sesión es la última del tramo y no la primera | Sí, pero por casualidad (solo la prueba de obra conocida, porque el tramo 1 tiene una sola obra) |
| Lo vencido de fuera de la ruta también es crítico | Sí |
| No migra · migra sin copia previa | Sí · Sí |
| **Se añade lectura aunque ya entre un paso de lectura** | **No** |
| **Un encargo ya hecho hoy vuelve a salir** | **No** |
| **Sin tope de minutos para comprobaciones (4 → 40)** | **No** (las pruebas solo tienen una comprobación vencida, de 2 min) |
| **La obra final nunca se da por hecha** | **No** |
| Pesos muy distintos (paso 5, obra 80) | No, y está bien: los pesos son decisión suya y no deben estar fijados en las pruebas |

---

## 2. Cobertura relevante, por área

| Área | Bien cubierto | Sin cubrir o mal cubierto |
|---|---|---|
| **Modelo** (Programa → Curso → Tramo → Paso → Obra) | Índices y relaciones (`tramoDe`, `pasosDe`, `pasosCon`, `finalDe`), secciones, que los programas no se mezclan; el validador (paso sin tramo, sección inexistente, círculos, obra final que pide algo no trabajado, falta de preparación, curso sin obra final) | `obraEje` del tramo no lo usa nada salvo el validador (H-02). El validador no exige `area` en un paso de obra con `papel: lectura` (H-03) |
| **Ruta: estados, apertura, cierre** | Primer paso actual, recomendado/próximo/futuro, enlaces en todos los pasos, apertura del tramo 2 al completar el 1, cierre con solidez 2 en frío | Estado de los pasos de **aplicación y preparación** (H-01); tramo elegido a mano (`focos.tramo`); tramo «dominado»; obra final «recomendado»/«hecho» (mutante no detectado); paso actual cuando ya no queda nada recomendado (H-05) |
| **`requiere`** | Paso 7 espera al 1 | `requiere` entre tramos (13 → 2); refuerzo insertado antes de un paso que aún no cumple su `requiere` (H-08) |
| **Ruta ↔ obra** | `relacionesPaso`, `necesidades` (situación y dónde se trabaja), `obraEnRutas`, lectura «no frena» como dato | Que la obra que entra en la sesión sea la obra eje (H-02) |
| **Obras** | Conocida → pasada de comprobación → aprendida; sección ≠ obra entera; refuerzo antes de la obra | Conocida que **falla** la pasada (H-07); conocida parcial (H-18); obra final y sus requisitos (H-06); **la vuelta a la obra tras el refuerzo** (H-10): ninguna prueba la recorre |
| **Lectura** | Un paso de lectura con área no frena; la tablatura nunca se quita; refuerzo de lectura ante una obra para leer; lectura sobre su repertorio | La obra para leer (Sor) sí frena (H-03); una sola lectura al día (mutante no detectado; H-02, H-09) |
| **«¿Qué hago hoy?»** | Cuadre de minutos (solo un escenario: sin práctica, con *Lágrima* en estudio, programa clásico), encargo primero y sin partir, comprobaciones al principio, programas separados, desfase en niveles, diagnóstico, porqués, formato del profesor, determinismo (mismo objeto) | Tope de 4/6 min con muchas vencidas; encargo hecho hoy; escenarios con progreso (tramo 2, fallos, conocida, «los dos») a 20-90 min; lo vencido fuera de la ruta (H-04); determinismo con contextos distintos (lo he probado: sí es determinista) |
| **Migración** | Lógica 1 → 2 (`migrar`); fallo en el servidor: estado intacto y copia creada | **Migración que sale bien en el servidor** (la he probado: bien, M1); en el fallo no se comprueba el historial ni que se bloqueen las escrituras (H-16) |
| **Persistencia** | Reinicio, conflicto de versiones, historial sin duplicados, exportar/importar, copias, restaurar, adjuntos, host y cabecera | Lo nuevo de la Fase 2 (`conocida`, `focos.tramo`, formatos por sección, ajustes, encargo con formato) tras reiniciar: lo he probado (P1) y funciona |
| **Interfaz** | — | Sin pruebas automáticas (solo la revisión manual del 25/10) |

---

## 3. Regresiones

- **De las 53 pruebas de la Fase 1, ninguna regresión detectable.** Las 53 pasan, sus títulos coinciden con lo que afirman y el reparto por área cuadra con la Arquitectura (dominio 13, niveles 4, notación 9, planificador 11, recomendador 4, catálogo 3, servidor 9). Sin git no se pueden comparar las versiones; quedan restos del nombre viejo, solo cosméticos: el título «un área floja no baja **la etapa**», «las **rutas** no se mezclan», «**rutas** mezcladas» y la obra de prueba de `notacion.test.js:9` con `ruta: 'clasica'`.
- **Reglas del Plan que el código ya no cumple** (no las cubría ninguna prueba, así que no salta nada):
  1. Plan 7, regla 7: «Lo que está a punto de olvidarse (más del 80 % de su intervalo sin comprobar) **entra en las sesiones**». Hoy nunca entra (H-04).
  2. Plan 7, tabla de números (`Plan de la academia.md:338`): «15 % para comprobaciones, **tope del 25 % por área**». El 15 % lo sustituyó, con su aprobación, el tope de 4/6 minutos (la tabla está desfasada); el tope del 25 % por área no está en el código (H-11).
  3. «Dos bloques de lectura el mismo día» se corrigió en la Fase 2 para un programa, pero vuelve con «los dos» (H-09).

---

## 4. Riesgos técnicos

| Riesgo | Detalle |
|---|---|
| Pruebas atadas al contenido real | Casi todas usan el catálogo real (7 y 6 cursos, tramos 1-6, ids de pasos, *Lágrima* «cerca», `ids[0] === Lágrima`). En la Fase 3, al añadir contenido, fallarán pruebas sin que la lógica esté mal. Conviene un catálogo de prueba para la lógica y dejar el real para «el contenido no tiene errores» |
| Pruebas del servidor encadenadas | Comparten servidor y carpeta: dependen del orden (rev 1 → 2, 3 → 4 eventos) y del reloj del sistema (`new Date()`, copia `dia-DD`). Un fallo arrastra a las siguientes; pasarlas a medianoche podría dar un falso fallo |
| Pruebas que mutan el contexto | «El desfase se cuenta en niveles» cambia `ctx.niveles` después de crear el contexto; «la lectura se trabaja también sobre pasajes» cambia las secciones de *Lágrima* del catálogo ya indexado (la ruta ya calculada usa las viejas). Pasan, pero prueban un estado mezclado |
| El planificador depende de huecos de contenido | Con los tramos 3-5 y el curso 2 en borrador, un alumno constante se queda sin ruta en 2-3 semanas (H-05) |
| Datos de revisión compartidos | `datos-revision-avanzado` lo está usando otra sesión (tenía un evento nuevo de las 10:34). Para que esta revisión sea reproducible, uso una copia congelada con sus 14 eventos originales: `revision\datos-avanzado-congelado` |
| Fechas | Comprobado: el cambio de hora del 25/10/2026 no rompe `diasEntre` ni `sumarDias`; las pruebas pasan igual en UTC |

---

## 5. Hallazgos

Gravedad: **crítico** (pierde datos o deja la app inservible: ninguno) · **importante** · **menor**. Clase: **(a)** bug o regresión, se puede corregir ya · **(b)** regla discutible, la decide David. Reproducción: `node <script>` desde `revision\`.

### H-01 · Los pasos de aplicación y de preparación se dan por hechos (o «en repaso») sin tocar su obra · importante · (a)
- **Qué:** el estado de un paso que no es de obra sale solo de lo que **trabaja**, no de lo que **contiene**. El paso 18 (`paso:c1.t2.07`, «La media cejilla dentro de *Lágrima*», contiene `Lágrima#B`) trabaja lo mismo que el 13 (media cejilla), así que es su espejo: «hecho» en cuanto se hace la media cejilla y «repaso» en cuanto falla en frío, aunque la parte B no se haya tocado nunca (la pantalla del paso dice «Toca reforzarlo»). Lo mismo con el paso 9 respecto al 7, y con el 21 («Preparar la obra final»), que queda hecho practicando «pieza sin parar» con cualquier obra.
- **Dónde:** `logica/ruta.js:40` (`claves = … : paso.trabaja`). Contradice la Arquitectura («Estado de un paso: sale del dominio de lo que contiene (lo que trabaja **y sus obras o secciones**)»).
- **Lo que preguntaba (paso 18 y la posición del refuerzo):** es un **bug**, no una regla. El refuerzo cae entre el 18 y el 19 por la misma causa: `insertarRefuerzos` (`ruta.js:156`) salta los pasos «hechos» y «repaso» cuenta como hecho. Si el 18 tuviera su estado real (pendiente), el refuerzo iría antes del 18… y **también** antes del 19 (H-08). Hay que corregir los dos a la vez.
- **Reproducción:** `node hallazgos.mjs` (H1, H1b) y `node h18.mjs`:
  ```
  paso 13: hecho · paso 18: hecho · dominio de Lágrima#B: pendiente
  paso 9 (aplicación de la A) sin haber tocado nunca la A: hecho · Lágrima#A: pendiente
  T2 abierto: 12:actual 13:repaso … 17:recomendado 18:repaso R:recomendado[tec.media-cejilla] 19:recomendado 20:proximo
  H18 paso 21: hecho · Lágrima entera: pendiente
  ```
- **Matiz que decide él:** qué cuenta como «hecha» una aplicación. Si se exige la sección completada, la aplicación y la obra se completarían a la vez; alternativas: un registro de práctica con la sección como fragmento, o del paso (`paso` en el evento).

### H-02 · «La obra de tu tramo» es la primera obra del tramo (Sor, para leer), no la obra eje (*Lágrima* B) · importante · (a)
- **Qué:** el bloque de obra de la sesión coge el primer paso de obra recomendado en el orden del tramo. En el tramo 2 es Sor (paso 17, `papel: lectura`), no *Lágrima* B (paso 19, la `obraEje`). Consecuencias, en los escenarios S2 y S3 a 30-120 min: *Lágrima* B **no entra en ninguna sesión mientras Sor no esté completado** (con su lectura, eso puede tardar), Sor recibe el peso de obra (35) y su texto dice «Es la obra de tu tramo»; la pasada final es de un estudio de lectura; y la lectura del día se triplica (refuerzo de lectura + Sor + pasada de Sor: **28-35 min de 51-74**), porque la regla «si un paso de lectura ya entra, no se añade otra» solo mira los pasos de habilidad. En el «alumno perfecto», *Lágrima* B solo aparece al día siguiente de completar Sor.
- **Dónde:** `logica/planificador.js:151` (`enRuta.find(p => p.tipo === 'obra' …)`) y `:162` (comprobación de lectura); `obraEje` se calcula en `ruta.js:91` y no lo usa nadie.
- **Reproducción:** `node hallazgos.mjs` (H3, H3b):
  ```
  obraEje del tramo 2: obra:tarrega.lagrima#B
  60′: obra obra:sor.op60-1 «Es la obra de tu tramo.» + pasada obra:sor.op60-1 … · ¿Lágrima B? false
  60′ lectura: paso(8) + obra(13) + pasada(7) = 28 min
  S2 60′ lectura: refuerzo(9) + obra(13) + pasada(7) = 29 de 51 min útiles
  ```
- **Corrección propuesta:** la obra del tramo es su `obraEje` (o la primera obra sin `papel: lectura`); la obra para leer entra como **la** lectura del día.

### H-03 · La obra para leer (Sor) sí frena el tramo 2 y puede ser el «Ahora» · importante · (a)
- **Qué:** «los pasos de lectura no frenan» se decide por `p.area === 'lectura'`, y el paso 17 no tiene `area` (solo `papel: lectura`). Resultado: con todo el tramo 2 hecho menos Sor, el tramo no queda completo, su cierre se queda en «próximo» y Sor pasa a ser el paso **actual** (en la vista sale como «repertorio»).
- **Dónde:** `logica/ruta.js:69` (`frena`) y `:118` (`principales`); `ruta.js:134` le pone área «repertorio»; contenido `contenido/rutas/clasica-c1.json:31`.
- **Reproducción:** `node hallazgos3.mjs` (H14):
  ```
  paso 17: area = undefined · papel = lectura
  sin Sor  → T2 completo: false · estado del 17: actual · cierre 20: proximo
  con Sor  → T2 completo: true · cierre 20: recomendado
  sin el 14 (lectura con área) → T2 completo: true
  ```
- **Corrección:** tratar `papel: 'lectura'` como lectura en `frena` y en el sitio actual (y que el validador lo exija o lo deduzca).

### H-04 · Lo vencido fuera de la ruta no se comprueba nunca; el aviso «espera a otro día» no se cumple · importante · (a)
- **Qué:** solo es «crítico» lo vencido de la ruta del **curso actual** (y las obras en estudio). Todo lo demás va a `demas` y no entra ningún día, ni con 120 minutos libres; «a punto de olvidarse» tampoco entra nunca, ni siendo de la ruta. El aviso «N repasos esperan a otro día» se repite para siempre. Y al cambiar de curso (H-05), todo lo del curso anterior deja de comprobarse: en la simulación, de 4 a 23 repasos «esperando» y 0 comprobaciones al día durante semanas.
- **Dónde:** `logica/planificador.js:381-383` y el aviso en `:105-106`. Contradice el Plan 7, regla 7.
- **Reproducción:** `node hallazgos2.mjs` (H9, H10):
  ```
  2027-06-01: estado=completado urgencia=38.4 · ¿en comprobaciones? false · avisos: 1 repaso espera a otro día
  sonido clásico (de la ruta) urgencia=0.86 dominado · ¿en comprobaciones? false
  ```
- **Lo que decide él:** cuántas (para que no parezca un examen constante). Lo que es un bug es que no entren **nunca**: por ejemplo, cuando no hay críticas, o una o dos por semana.

### H-05 · Por niveles salta al curso 2 (en borrador, sin tramos): ruta vacía, sin obra y sin comprobaciones · importante · (b)
- **Qué:** con técnica 1 y repertorio 1, el curso actual pasa al 2 aunque el curso 1 no esté terminado (los tramos 3-5 están en borrador, el cierre no se abre y la obra final no está preparada). El curso 2 no tiene tramos: la ruta queda vacía, no hay paso actual, no hay obra (nada es «estudiable») ni comprobaciones, y la sesión son 2-3 áreas sueltas (a 120′: **un bloque de 50 min de cejilla completa**). En el «alumno perfecto» (todo sale bien a la primera), pasa el 9/11 (desde el fallo de media cejilla), el 12/11 (alumno nuevo a 60′) y el 18/11 (a 20′). La cadena: el 08/11 la propia app propone «Obra: *Lágrima*» (entera) como sugerencia; una pasada leyendo la completa (H-06); con *Lágrima* y Sor completadas, repertorio 1 → curso 2. Antes de eso, del 27/10 al 08/11 (13 días) tampoco hay paso actual (todo hecho a la espera de los cierres).
- **Dónde:** `logica/ruta.js:230-234` (`cursoActual` no mira si el curso tiene ruta) y `logica/niveles.js` (`resumenPrograma`). Es la regla documentada («el mayor entre el que marcan la técnica y el repertorio y el siguiente al último terminado»), por eso es (b).
- **Reproducción:** `node simular.mjs fallo 30 60` (y `PLANES=1` para ver cada sesión) y `node hallazgos2.mjs` (H10):
  ```
  2026-11-08 curso=1 … obra=tarrega.lagrima · …
  2026-11-09 curso=2 actual=- tramos= final=undefined · frío=0 · obra=- · ref=[] · 5 repasos esperan a otro día
  2026-11-23 curso=2 … frío=0 … · 17 repasos esperan a otro día
  curso actual: curso:c2 · borrador: true · tramos del curso 2: 0 · curso 1 terminado: false · obra final del curso 1: hecho
  120′: calentamiento(5) · area(50) tec.cejilla-completa · pausa(5) · area(35) esc.arpegio-pima · pausa(5) · area(20) rit.figuras-basicas
  ```
- **A decidir:** si los niveles pueden llevarle a un curso sin ruta y si el curso 1 debe cerrarse (obra final) antes de pasar. Con el contenido de hoy, es lo que le pasaría a un alumno constante en pocas semanas.

### H-06 · La obra final cuenta como hecha con una pasada leyendo, sin memoria ni grabación · importante · (a)
- **Qué:** `finalDelCurso` da la obra final por «hecha» con el primer «ok» de la obra entera, aunque sea leyendo la partitura. Los requisitos (`memoria`, `grabacion`) solo se muestran. La dimensión `memoria` ya existe y el dominio ya sabe que «leyendo no es de memoria»; la grabación es de la Fase 5.
- **Dónde:** `logica/ruta.js:190` (`hecha = estaHecho(ctx.estadoDe(obra.id))`).
- **Reproducción:** `node hallazgos2.mjs` (H11):
  ```
  Lágrima: completado · final.estado: hecho · requisitos: memoria, grabacion · progreso: {"hechos":1,"total":22}
  ```

### H-07 · Obra conocida: si la pasada de comprobación falla, no sale ningún refuerzo · importante · (a) en lo que promete la documentación, (b) en cómo hacerlo
- **Qué:** la Arquitectura y el Plan 3.1 dicen «si falla algo, salen los refuerzos / la ruta dice qué reforzar». Con la pasada en frío de la A mal (limpieza y sonido), la obra pasa a «empezada», el bloque vuelve a ser «Obra» normal (19 + 11 min a 60′) y no hay ningún refuerzo: las competencias que pide (sonido clásico, melodía) siguen «por consolidar», porque un fallo de la obra no se traslada a ellas.
- **Dónde:** `logica/ruta.js:150-179` (los refuerzos solo miran el dominio de las competencias).
- **Reproducción:** `node hallazgos.mjs` (H5):
  ```
  paso 10: actual · conocida: false · refuerzos en la ruta: ninguno
  necesidades de la A: comp:tec.sonido-clasico=por-consolidar, comp:tec.melodia-acompanada=por-consolidar
  ```
- **A decidir:** cómo se pasa de «falló el sonido en la obra» a «refuerza el sonido clásico» (por aspectos, o preguntándole qué falló).

### H-08 · El mismo refuerzo aparece dos veces en la ruta · importante · (a)
- **Qué:** si una competencia que piden dos pasos pendientes del mismo tramo falla en frío, se inserta un refuerzo antes de cada uno. Ejemplo: falla la melodía acompañada; la pide *Lágrima* B, que contienen el 18 y el 19 → dos «Refuerzo: melodía» en el mapa. El de antes del 18 sale «recomendado» aunque el 18 está «próximo» (espera al 13). El planificador no lo duplica en la sesión (por `reservados`), pero el mapa sí.
- **Dónde:** `logica/ruta.js:155-177` (sin quitar repetidos entre pasos).
- **Reproducción:** `node hallazgos.mjs` (H2):
  ```
  refuerzo:paso:c1.t2.07:comp:tec.melodia-acompanada (antes del 18)
  refuerzo:paso:c1.t2.08:comp:tec.melodia-acompanada (antes del 19)
  ```

### H-09 · «Los dos»: dos bloques de lectura, y lectura de pentagrama dentro del flamenco · menor · (a) la duplicación, (b) el flamenco
- **Qué:** cada programa añade su propia lectura (la lectura es «común»), así que con «los dos» hay dos bloques de lectura (60′ y 90′, alumno nuevo y S3). Además, con el programa flamenco a solas, a partir de 30′ entra un bloque de pentagrama (`lec.notas-1pos-*`), aunque su reparto (`REPARTO.flamenca`) no tiene lectura y el Plan 5 dice «su lectura es la tablatura y el cifrado; el pentagrama, opcional».
- **Dónde:** `logica/planificador.js:162-163` (por programa) y `:40` (`PROGRAMAS_DE.flamenca` incluye `comun`).
- **Reproducción:** `node hallazgos.mjs` (H4):
  ```
  ambas 60′ lectura: clasica:comp:lec.notas-1pos-agudas(5), flamenca:comp:lec.notas-1pos-graves(5)
  flamenca 60′: … · area(9) lec.notas-1pos-agudas
  ```

### H-10 · La vuelta a la obra después del refuerzo · importante · (b), con una parte (a) que es H-02
Lo que preguntaba, comprobado:
- **Si el refuerzo sale bien en frío** (media cejilla OK el 27/10, tres días después del fallo): **sí desaparece**, el 13 y el 18 vuelven a «hecho» y el 19 (*Lágrima* B) vuelve a «recomendado» en la ruta. **Pero en la sesión no vuelve** mientras Sor esté pendiente (H-02).
- **También desaparece si la obra se completa en caliente**: tocar la B una vez leyendo la deja «hecha», el paso de obra ya no pide refuerzo y la media cejilla sigue fallada en frío (el 13 sigue en «repaso», y el planificador no propone pasos en repaso). En el «alumno perfecto» ocurre al día siguiente: refuerzo y obra el mismo día, y al otro el refuerzo ya no está.
- **Un «OK» en frío al día siguiente del fallo** (demasiado pronto para sumar solidez) también lo quita.
- **La comprobación de lo que falló no tiene prioridad:** le toca el 27/10, pero va detrás de las vencidas del tramo 1 (más antiguas) y en la simulación no llega hasta el 30/10.
- **Dónde:** `logica/ruta.js:16` (`situacion`: refuerzo = necesita repaso o último frío «no») y `:156`; `planificador.js:390` (orden por urgencia).
- **Reproducción:** `node hallazgos2.mjs` (H12) y `node simular.mjs fallo 30 60`:
  ```
  tras tocar la B una vez, leyendo: refuerzos=comp:lec.notas-1pos-agudas · media cejilla=completado (último frío: no) · paso 13=repaso
  tras frío OK el 27: refuerzos=comp:lec.notas-1pos-agudas · paso 13=hecho · paso 18=hecho · paso 19=recomendado
  frío OK al día siguiente del fallo: solidez=1 · refuerzo de media cejilla=false
  27/10 (le toca): comprobaciones de hoy = comp:arm.i-iv-v7-i, comp:esc.mi-mayor-1pos; urgencia media cejilla=1
  ```

### H-11 · Reparto rígido: un área o la lectura se comen la sesión cuando la ruta tiene poco · importante · (b)
- **Qué:** sin tope por área y con la lectura a peso fijo (12, sin el ajuste por el déficit de la semana que sí tienen las demás áreas), cuando la ruta tiene pocos candidatos la lectura absorbe el tiempo: en el «alumno perfecto», del 27/10 al 07/11, **lectura 34 %** (base del curso: 14 %), **repertorio 0 %** durante 12 días (base: 34 %) y bloques de lectura de 19-24 min cada día; con la obra conocida (S5) a 90′, 24 min de lectura; en el curso 2, técnica 46 % y un bloque de 50 min a 120′. El Plan 7 dice «tope del 25 % por área» y no está en el código (la tabla y el código no coinciden: una de las dos hay que cambiarla).
- **Dónde:** `logica/planificador.js:118` (`repartir` sin tope), `:163` (peso de lectura), `:404` (la lectura fuera del déficit).
- **Reproducción:** `node reparto.mjs` y `node escenarios.mjs`:
  ```
  2026-10-27 → 2026-11-07: lectura 222 min 34 % · técnica 18 % · armonía 13 % · oído 12 % · comprobaciones 7 % · (repertorio: 0)
  bloque más largo: 24 min (2026-11-03, Lectura: Leer las notas de las cuerdas 4-6 en primera posición)
  ```
- **Dato para su decisión sobre los pesos:** son los pesos más la falta de tope los que producen estos bloques; los pesos solos, con una ruta llena, dan sesiones razonables (S1 y S2).

### H-12 · Obra conocida: la pasada de comprobación dura 9-15 min y a 20′ la sesión es solo comprobar · menor · (b)
- **Qué:** la pasada de comprobación de la parte A (≈ 1-2 min de música) recibe 13 min a 20′, 9 a 30′, 12 a 60′ y 15 a 90′ (peso 8, pero se queda con lo que sobra). A 20′, comprobaciones (4) + pasada de comprobación (13) = el 100 % de la sesión útil son comprobaciones. La prueba de `ruta.test.js:158` (`<= 10`) pasa en su escenario, pero no en uno con comprobaciones vencidas.
- **Reproducción:** `node hallazgos.mjs` (H6).

### H-13 · La obra de cada tramo se recomienda desde el primer día · menor · (b)
- **Qué:** los pasos 10 (*Lágrima* A) y 19 (*Lágrima* B) no tienen `requiere`, así que un alumno nuevo recibe *Lágrima* A desde el primer día, con más minutos que el paso actual (20′: paso 7 y obra 10), antes que la aplicación (9) e incluso antes del sonido clásico que pide; y *Lágrima* B se recomienda con la media cejilla sin empezar. El ciclo del Plan 3.1 («… ejercicio → aplicación → obra») sugiere que la obra espere a su aplicación.
- **Dónde:** `contenido/rutas/clasica-c1.json:17` y `:33`.
- **Reproducción:** `node hallazgos.mjs` (H7).

### H-14 · Comprobaciones del cierre del tramo: dato para su decisión · menor · (b)
- **Qué:** con el tramo 1 hecho, hay 12 comprobaciones vencidas; entran 2 al día (3 con 90′) y la de la obra (4 min) va siempre la última (empate de urgencia → orden alfabético, `obra:` después de `comp:`). El cierre del tramo 1 tarda unos 6 días de comprobaciones, con el aviso «10 repasos esperan a otro día» cada día. En minutos no es un examen constante (en la simulación, el **7 %** del tiempo útil), pero el aviso diario sí puede sonar a «deberes pendientes».
- **Reproducción:** `node hallazgos.mjs` (H8) y `node reparto.mjs`.

### H-15 · Probar un paso de un tramo posterior mueve el «Ahora» · menor · (b)
- **Qué:** con el tramo 1 en el paso 2, una sola tanda (fallada) de homónimos (paso 12, tramo 2) abre el tramo 2 y el «Ahora» salta al 12, porque el sitio actual prefiere «lo recomendado que ya está empezado». Puede pasar con un encargo del profesor de algo del tramo siguiente.
- **Dónde:** `logica/ruta.js:88` (abierto si `empezado`) y `:119`.
- **Reproducción:** `node h15b.mjs`:
  ```
  T1: abierto · T2: abierto · actual: paso:c1.t2.01
  ```

### H-16 · Con la migración fallida, se sigue pudiendo escribir en el historial, y el historial en memoria queda medio migrado · menor · (a)
- **Qué:** la migración que falla deja `estado.json` y el historial del disco intactos (bien), pero: `POST /api/eventos` responde 200 y **añade una línea** al historial viejo (`anadirEventos` no mira `errorEstado`); y `migrar` cambia los eventos en memoria (son los mismos objetos de la caché), así que `GET /api/eventos` devuelve la sesión ya con `programa` aunque el disco diga `ruta`. Desde la interfaz es poco probable (si falla `/api/estado`, `cargar()` no llega a enviar pendientes), pero una ventana abierta de antes del reinicio sí podría escribir.
- **Dónde:** `servidor/almacen.js:104` (`anadirEventos`) y `:133` (`eventos: paquete.eventos` sin copiar).
- **Reproducción:** `node servidor-revision.mjs` (M2):
  ```
  MAL GET /api/eventos devuelve el historial sin tocar en memoria (sesión v2: ruta=undefined, programa=clasica)
  MAL POST /api/eventos con la migración fallida: 200 y el historial ha cambiado (se ha añadido una línea)
  ```

### H-17 · «Los dos» con 10 minutos no cuadra (7 de 10) · menor · (a)
- **Qué:** la parte flamenca (3 min) no tiene bloques y sus minutos se pierden. 10 no está entre las duraciones de la interfaz (20-120), así que hoy no se ve. En el barrido de 10 a 150 min en todos los escenarios (232 planes), es el único descuadre, y el planificador es determinista también con contextos distintos y los eventos al revés.
- **Dónde:** `logica/planificador.js:121` (`resto` solo si hay bloques).
- **Reproducción:** `node hallazgos3.mjs` (H17).

### H-18 · Conocida «parcial» (solo la A): la obra entera y la obra final salen como «la conoces» · menor · (a)
- **Reproducción:** `node h18.mjs` → `estadoObra: conocida · final.conocida: true · paso 10 conocida: true · paso 19 conocida: false`. Causa: `conocida(ctx, obraId)` sin sección devuelve la marca parcial (`ruta.js:33`).

### H-19 · El refuerzo de lectura elige lo ya hecho o lo aún no aprendido · menor · (b)
- **Qué:** el refuerzo de lectura antes de Sor escoge la primera competencia de lectura no dominada que no esté pendiente en el tramo: en S2 es «notas agudas», ya completada y con su comprobación en frío vencida (se practica en caliente antes de comprobarla); en H-15, una que nunca se ha estudiado (paso 3, aún pendiente en el tramo 1), y se llama «Refuerzo».
- **Dónde:** `logica/ruta.js:164-165`.

### H-20 · Documentación desfasada · menor · (a)
- `Plan de la academia.md:338`: «15 % para comprobaciones» (hoy son 4/6 min) y «tope del 25 % por área» (no está en el código; ver H-11).
- Títulos de pruebas con el nombre viejo (sección 3).

### Lo que funciona y se ha comprobado
Validador del contenido; reglas de dominio; visible ≠ recomendado (todos los pasos con enlace; recomendado/próximo/futuro); `requiere`; cierre del tramo con solidez 2 en frío; una lectura de habilidad atrasada no frena; la tablatura nunca se quita; el tramo de cierre no se abre a mano; determinismo; cuadre de minutos de 15 a 150; el cambio de hora del 25/10; **migración 1 → 2 en el servidor** (M1: convierte todo, la copia `antes-de-migrar` guarda los originales tal cual, el historial original queda apartado byte a byte y al reiniciar no repite); **migración fallida** (estado e historial intactos, sin apartar nada, no deja guardar el estado); **persistencia de lo nuevo** (P1: conocida parcial con secciones, tramo elegido, formatos por sección, ajustes del profesor, encargo con formato y una comprobación de sección, iguales tras reiniciar; una `conocida` inventada se rechaza con 400).

---

## 6. Planes de «¿Qué hago hoy?» por escenario y duración

Hoy = 25/10/2026, programa clásico salvo S6. `frío` = comprobaciones en frío; `FL` = parte flamenca. La última columna la rellena el script (`revision\tabla.mjs`; lectura = bloques de lectura más la obra para leer). Escenarios en `revision\escenarios-datos.mjs`; S3b es la copia congelada de `datos-revision-avanzado`.

| Escenario | Min | Bloques (minutos) | Avisos automáticos |
|---|---|---|---|
| S1 alumno nuevo | 20 | cal 3 · paso 7 (tec.sonido-clasico) · obra 10 (Lágrima A) | — |
| S1 alumno nuevo | 30 | cal 3 · paso 9 (tec.sonido-clasico) · paso 5 (tec.presion-minima) · obra 13 (Lágrima A) | — |
| S1 alumno nuevo | 60 | cal 5 · paso 14 (tec.sonido-clasico) · paso 9 (tec.presion-minima) · paso 6 (teo.tono-semitono) · área 6 (lec.notas-1pos-agudas) · obra 13 (Lágrima A) · pasada 7 (Lágrima A) | — |
| S1 alumno nuevo | 90 | cal 5 · paso 19 (tec.sonido-clasico) · paso 11 (tec.presion-minima) · paso 8 (teo.tono-semitono) · paso 8 (esc.mi-mayor-1pos) · pausa 5 · área 8 (lec.notas-1pos-agudas) · obra 17 (Lágrima A) · pasada 9 (Lágrima A) | — |
| S2 tramo 1 hecho (14/10), comprobaciones vencidas | 20 | cal 3 · frío 4 (arm.i-iv-v7-i, esc.mi-mayor-1pos) · paso 13 (arm.tono-homonimo) | — |
| S2 tramo 1 hecho (14/10), comprobaciones vencidas | 30 | cal 3 · frío 4 (arm.i-iv-v7-i, esc.mi-mayor-1pos) · paso 9 (arm.tono-homonimo) · obra 14 (Sor 60/1) | la «obra del tramo» es Sor (lectura); lectura 14 min |
| S2 tramo 1 hecho (14/10), comprobaciones vencidas | 60 | cal 5 · frío 4 (arm.i-iv-v7-i, esc.mi-mayor-1pos) · paso 14 (arm.tono-homonimo) · paso 8 (tec.media-cejilla) · refuerzo 9 (lec.notas-1pos-agudas) · obra 13 (Sor 60/1) · pasada 7 (Sor 60/1) | la «obra del tramo» es Sor (lectura); lectura 29 min |
| S2 tramo 1 hecho (14/10), comprobaciones vencidas | 90 | cal 5 · frío 6 (arm.i-iv-v7-i, esc.mi-mayor-1pos, lec.notas-1pos-agudas) · paso 19 (arm.tono-homonimo) · paso 12 (tec.media-cejilla) · paso 8 (dia.notas-1pos) · pausa 5 · área 8 (lec.notas-1pos-graves) · obra 18 (Sor 60/1) · pasada 9 (Sor 60/1) | la «obra del tramo» es Sor (lectura); lectura 35 min |
| S3 fallo en frío de media cejilla (24/10) | 20 | cal 3 · frío 4 (arm.i-iv-v7-i, esc.mi-mayor-1pos) · paso 13 (arm.tono-homonimo) | — |
| S3 fallo en frío de media cejilla (24/10) | 30 | cal 3 · frío 4 (arm.i-iv-v7-i, esc.mi-mayor-1pos) · paso 9 (arm.tono-homonimo) · obra 14 (Sor 60/1) | la «obra del tramo» es Sor (lectura); lectura 14 min |
| S3 fallo en frío de media cejilla (24/10) | 60 | cal 5 · frío 4 (arm.i-iv-v7-i, esc.mi-mayor-1pos) · paso 14 (arm.tono-homonimo) · paso 8 (lec.notas-1pos-graves) · refuerzo 9 (tec.media-cejilla) · obra 13 (Sor 60/1) · pasada 7 (Sor 60/1) | la «obra del tramo» es Sor (lectura); lectura 28 min |
| S3 fallo en frío de media cejilla (24/10) | 90 | cal 5 · frío 6 (arm.i-iv-v7-i, esc.mi-mayor-1pos, lec.notas-1pos-agudas) · paso 18 (arm.tono-homonimo) · paso 10 (lec.notas-1pos-graves) · paso 8 (dia.notas-1pos) · pausa 5 · refuerzo 13 (tec.media-cejilla) · obra 16 (Sor 60/1) · pasada 9 (Sor 60/1) | la «obra del tramo» es Sor (lectura); lectura 35 min |
| S3b datos-revision-avanzado (S3 + encargo 15) | 20 | cal 3 · encargo 17 (Lágrima) | sin paso ni obra de la ruta |
| S3b datos-revision-avanzado (S3 + encargo 15) | 30 | cal 3 · frío 4 (arm.i-iv-v7-i, esc.mi-mayor-1pos) · encargo 15 (Lágrima) · paso 8 (arm.tono-homonimo) | — |
| S3b datos-revision-avanzado (S3 + encargo 15) | 60 | cal 5 · frío 4 (arm.i-iv-v7-i, esc.mi-mayor-1pos) · encargo 15 (Lágrima) · paso 11 (arm.tono-homonimo) · refuerzo 8 (tec.media-cejilla) · obra 11 (Sor 60/1) · pasada 6 (Sor 60/1) | la «obra del tramo» es Sor (lectura) |
| S3b datos-revision-avanzado (S3 + encargo 15) | 90 | cal 5 · frío 6 (arm.i-iv-v7-i, esc.mi-mayor-1pos, lec.notas-1pos-agudas) · encargo 15 (Lágrima) · paso 16 (arm.tono-homonimo) · paso 9 (lec.notas-1pos-graves) · pausa 5 · refuerzo 11 (tec.media-cejilla) · obra 15 (Sor 60/1) · pasada 8 (Sor 60/1) | la «obra del tramo» es Sor (lectura); lectura 32 min |
| S4 encargo largo (40 min de Sor) sobre S3 | 20 | cal 3 · encargo 17 (Sor 60/1) | sin paso ni obra de la ruta |
| S4 encargo largo (40 min de Sor) sobre S3 | 30 | cal 3 · encargo 27 (Sor 60/1) | sin paso ni obra de la ruta |
| S4 encargo largo (40 min de Sor) sobre S3 | 60 | cal 5 · frío 4 (arm.i-iv-v7-i, esc.mi-mayor-1pos) · encargo 40 (Sor 60/1) · paso 5 (arm.tono-homonimo) · obra 6 (Lágrima B) | — |
| S4 encargo largo (40 min de Sor) sobre S3 | 90 | cal 5 · frío 6 (arm.i-iv-v7-i, esc.mi-mayor-1pos, lec.notas-1pos-agudas) · encargo 40 (Sor 60/1) · pausa 5 · paso 10 (arm.tono-homonimo) · paso 5 (lec.notas-1pos-graves) · refuerzo 6 (tec.media-cejilla) · obra 13 (Lágrima B) | — |
| S5 obra conocida (Lágrima entera), tramo 1 sin la A | 20 | cal 3 · frío 4 (arm.i-iv-v7-i, esc.mi-mayor-1pos) · pasada-comprobación 13 (Lágrima A) | repasos 17/17 min |
| S5 obra conocida (Lágrima entera), tramo 1 sin la A | 30 | cal 3 · frío 4 (arm.i-iv-v7-i, esc.mi-mayor-1pos) · área 14 (lec.notas-1pos-agudas) · pasada-comprobación 9 (Lágrima A) | lectura 14 min |
| S5 obra conocida (Lágrima entera), tramo 1 sin la A | 60 | cal 5 · frío 4 (arm.i-iv-v7-i, esc.mi-mayor-1pos) · área 13 (tec.melodia-acompanada) · área 8 (esc.arpegio-pima) · área 18 (lec.notas-1pos-agudas) · pasada-comprobación 12 (Lágrima A) | lectura 18 min |
| S5 obra conocida (Lágrima entera), tramo 1 sin la A | 90 | cal 5 · frío 6 (arm.i-iv-v7-i, esc.mi-mayor-1pos, lec.notas-1pos-agudas) · área 16 (tec.melodia-acompanada) · área 11 (esc.arpegio-pima) · área 24 (lec.notas-1pos-graves) · pausa 5 · área 8 (oid.mayor-menor) · pasada-comprobación 15 (Lágrima A) | — |
| S6 los dos programas (S3) | 20 | cal 3 · frío 4 (arm.i-iv-v7-i, esc.mi-mayor-1pos) · paso 6 (arm.tono-homonimo) · FL paso 7 (fl.compas-12) | — |
| S6 los dos programas (S3) | 30 | cal 3 · frío 4 (arm.i-iv-v7-i, esc.mi-mayor-1pos) · paso 13 (arm.tono-homonimo) · FL paso 5 (fl.compas-12) · FL paso 5 (fl.rasgueo-cuatro) | — |
| S6 los dos programas (S3) | 60 | cal 5 · frío 4 (arm.i-iv-v7-i, esc.mi-mayor-1pos) · paso 10 (arm.tono-homonimo) · refuerzo 6 (tec.media-cejilla) · obra 14 (Sor 60/1) · FL paso 6 (fl.compas-12) · FL paso 5 (fl.rasgueo-cuatro) · FL paso 5 (fl.picado) · FL área 5 (lec.notas-1pos-graves) | la «obra del tramo» es Sor (lectura); lectura 19 min |
| S6 los dos programas (S3) | 90 | cal 5 · frío 4 (arm.i-iv-v7-i, esc.mi-mayor-1pos) · paso 13 (arm.tono-homonimo) · paso 7 (lec.notas-1pos-graves) · refuerzo 8 (tec.media-cejilla) · obra 11 (Sor 60/1) · pausa 5 · pasada 6 (Sor 60/1) · FL paso 10 (fl.compas-12) · FL paso 6 (fl.rasgueo-cuatro) · FL paso 5 (fl.picado) · FL paso 5 (fla.cadencia-andaluza) · FL área 5 (lec.notas-1pos-agudas) | 2 bloques de lectura; la «obra del tramo» es Sor (lectura); lectura 29 min |
| S6b los dos programas, alumno nuevo | 20 | cal 3 · paso 5 (tec.sonido-clasico) · obra 5 (Lágrima A) · FL paso 7 (fl.compas-12) | — |
| S6b los dos programas, alumno nuevo | 30 | cal 3 · paso 7 (tec.sonido-clasico) · obra 10 (Lágrima A) · FL paso 5 (fl.compas-12) · FL paso 5 (fl.rasgueo-cuatro) | — |
| S6b los dos programas, alumno nuevo | 60 | cal 5 · paso 10 (tec.sonido-clasico) · paso 5 (tec.presion-minima) · área 5 (lec.notas-1pos-agudas) · obra 14 (Lágrima A) · FL paso 6 (fl.compas-12) · FL paso 5 (fl.rasgueo-cuatro) · FL paso 5 (fl.picado) · FL área 5 (lec.notas-1pos-graves) | 2 bloques de lectura |
| S6b los dos programas, alumno nuevo | 90 | cal 5 · paso 13 (tec.sonido-clasico) · paso 8 (tec.presion-minima) · paso 5 (teo.tono-semitono) · área 5 (lec.notas-1pos-agudas) · obra 12 (Lágrima A) · pausa 5 · pasada 6 (Lágrima A) · FL paso 10 (fl.compas-12) · FL paso 6 (fl.rasgueo-cuatro) · FL paso 5 (fl.picado) · FL paso 5 (fla.cadencia-andaluza) · FL área 5 (lec.notas-1pos-graves) | 2 bloques de lectura |

**Lectura de la tabla, escenario a escenario:**
- **S1 (nuevo):** razonable; la obra se lleva más tiempo que el paso actual desde el primer día (H-13, pesos suyos).
- **S2 y S3 (tramo 1 hecho, con o sin fallo):** las comprobaciones caben y no se comen la sesión; el problema es la obra: Sor en lugar de *Lágrima* B y la lectura repetida (H-02). En S3, el refuerzo de media cejilla solo entra con 60′ o más.
- **S3b (encargo de 15):** a 20′ la sesión es el encargo (la regla aprobada); de 30′ en adelante todo cuadra.
- **S4 (encargo de 40):** a 20 y 30′ la sesión es solo el encargo (aprobado); a 60′ quedan bloques de 5 y 6 min, al límite.
- **S5 (obra conocida):** a 20′ todo es comprobar (H-12); sin pasos de ruta (el tramo 1 espera a la pasada), el resto son áreas y la lectura crece hasta 24 min (H-11).
- **S6 y S6b (los dos):** cuadran, pero con dos lecturas (H-09); en «los dos», la parte clásica de 20′ se queda en un paso de 6 min.
- **Ningún plan descuadra los minutos ni hace bloques de menos de 5** (salvo calentamiento 3 y comprobación 2, que son así a propósito).

**Simulación de días seguidos** (`revision\simular.mjs`, salidas `sim-*.txt`): el «alumno perfecto» que hace cada día la sesión propuesta y le sale todo bien. Desde el fallo de media cejilla (60′/día): la ruta avanza, los cierres de los tramos 1 y 2 se completan el 01/11 y el 04/11, del 27/10 al 08/11 no hay paso actual ni obra, y el 09/11 salta al curso 2 vacío (H-05) y se acaban las comprobaciones (H-04).

---

## 7. Pruebas que convendría añadir

| Prueba | Qué comprobaría |
|---|---|
| El estado de una aplicación depende de su sección | El paso 18 sigue pendiente con la media cejilla hecha y la B sin tocar; «repaso» solo si se ha trabajado (H-01) |
| Un refuerzo por competencia y tramo | Falla la melodía con el 18 y el 19 pendientes → un solo refuerzo, antes del primero que lo necesita (H-08) |
| La obra de la sesión es la obra eje del tramo | En el tramo 2, el bloque de obra es *Lágrima* B; Sor entra como la lectura del día (H-02) |
| Una sola lectura al día | Contando pasos de lectura, refuerzos de lectura, obras para leer y «los dos» (mutante no detectado; H-02, H-09) |
| Una obra para leer no frena ni marca el «Ahora» | Tramo 2 completo sin Sor; el actual no es Sor (H-03) |
| Lo vencido fuera de la ruta acaba entrando | Que el aviso «espera a otro día» sea verdad en N días (H-04) |
| El tope de comprobaciones con muchas vencidas | 12 vencidas → 4 min (6 con 90′) y siempre sitio para la ruta (mutante no detectado) |
| Un encargo hecho hoy no vuelve a salir | Con un evento de ese encargo hoy, no hay bloque de encargo (mutante no detectado) |
| La obra final y sus requisitos | Una pasada leyendo no la cierra; de memoria, sí (H-06, mutante no detectado) |
| La vuelta a la obra | Fallo → refuerzo → frío OK días después → el refuerzo desaparece y la obra vuelve **a la sesión** (H-10) |
| Obra conocida que falla | La pasada en frío mal genera lo que él decida (refuerzo o aviso) (H-07) |
| Curso actual con cursos en borrador | Lo que se decida en H-05; como mínimo, que la ruta nunca quede vacía sin avisar |
| Tramo elegido a mano | `focos.tramo` abre el tramo; el de cierre no se puede elegir |
| Barrido del planificador | Minutos que cuadran y bloques ≥ 5 en los seis escenarios de esta revisión, también con «los dos» |
| Determinismo de verdad | Dos contextos construidos por separado (y con los eventos en otro orden) dan la misma sesión |
| Servidor: migración que sale bien | Copia con los originales, historial apartado byte a byte, no repite al reiniciar (M1) |
| Servidor: migración fallida sin escrituras | Ni `PUT /api/estado` ni `POST /api/eventos` tocan nada; el historial queda igual (H-16) |
| Prueba de humo de varios días | El «alumno perfecto» de 30 días: siempre hay paso actual u obra si hay contenido, y las comprobaciones no desaparecen |
| Catálogo de prueba para la lógica | Que añadir contenido en la Fase 3 no rompa pruebas de reglas |

---

## 8. Scripts usados

Todos en `C:\Users\david\AppData\Local\Temp\claude\C--Users-david-The-Cave\28417131-5bcb-4823-81c5-5d994703b937\scratchpad\revision\`; se ejecutan con `node <script>` desde esa carpeta e importan la app por su ruta absoluta, sin modificarla.

| Script | Para qué | Salida guardada |
|---|---|---|
| `comun.mjs` | Utilidades (contexto, eventos, tramo 1, fallo en frío, análisis de un plan) | — |
| `escenarios-datos.mjs` | Los ocho escenarios (S1-S6b) | — |
| `escenarios.mjs` | Ruta y plan de cada escenario a 20/30/60/90′ (`--detalle` para títulos y para qué) | `escenarios-salida.txt` |
| `tabla.mjs` | La tabla de la sección 6 | `tabla.md` |
| `hallazgos.mjs`, `hallazgos2.mjs`, `hallazgos3.mjs`, `h15b.mjs`, `h18.mjs` | Reproducción de H-01 a H-19 | `hallazgos-salida.txt` |
| `simular.mjs` | «Alumno perfecto» día a día (`node simular.mjs fallo|nuevo|conocida [días] [minutos]`; `PLANES=1` enseña cada sesión) | `sim-fallo-60.txt`, `sim-fallo-60-planes.txt`, `sim-nuevo-60.txt`, `sim-nuevo-20.txt` y los `sim-*.json` |
| `reparto.mjs` | Minutos reales por área en un tramo de días de la simulación | `reparto-salida.txt` |
| `servidor-revision.mjs` | Servidor de verdad con `crearServidor` en un puerto libre y carpetas propias (`servidor-migra-bien`, `servidor-migra-mal`, `servidor-persistencia`): M1, M2 y P1 | `servidor-salida.txt` |
| `mutantes.mjs` | Pruebas de mutación sobre la copia `mutantes\app` (restaurada al acabar) | sección 1 |
| `datos-avanzado-congelado\` | Copia de `datos-revision-avanzado` con sus 14 eventos originales | — |
| `salida-node-test.txt` | La salida real de `node --test` | — |

No se ha tocado `C:\Users\david\The Cave\08 - Guitarra\Academia\datos`, ni el servidor del puerto 7421, ni ningún archivo de la app o de la vault: al acabar, la app es idéntica a la copia hecha antes de las mutaciones, salvo `app/.git` y `app/.gitignore`, que aparecieron durante la revisión creados por otra sesión (un solo commit, «Academia de guitarra: Fase 2», sin versiones anteriores, así que no cambia lo dicho sobre regresiones). `recorte.py`, `zoom\` y `ui-finish-gate.md` de esta carpeta tampoco son de esta revisión.
