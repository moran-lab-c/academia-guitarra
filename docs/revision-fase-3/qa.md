# Revisión QA · Fase 3 de la academia de guitarra (25/10/2026)

Revisión técnica independiente de la Fase 3: rama `revision-fase-2`, código de `216e34d`. Los commits posteriores, `8a1f491` y `60d91a7`, solo tocan documentación. No se ha modificado ningún archivo de `web/`, `logica/`, `servidor/`, `contenido/` ni `pruebas/`.

**Dónde está lo ejecutado.** Todo lo que se cita aquí se ha ejecutado. Los scripts y sus salidas están en `/tmp/claude-0/-home-user-academia-guitarra/251a8dc2-8c5d-5a28-9c75-8fcc48ad11ea/scratchpad/rev-qa/`, en adelante `rev-qa/`. Es una carpeta temporal de la sesión: si se borra, los scripts se pueden rehacer a partir de las reproducciones de este informe.

**Método.**
- **Lectura.** He leído enteros `docs/PLAN-FASE-3.md`, los archivos de `logica/` nuevos o tocados, `web/componentes/{partitura,notacion,metronomo,sonido,registro}.js`, `web/vistas/evaluaciones.js`, las diferencias de `obra.js`, `paso.js`, `ejercicio.js`, `profesor.js` y `hoy.js`, los 14 archivos de `contenido/notacion/`, las competencias y los ejercicios nuevos, `clasica-c1.json` y la *Españoleta*. También las pruebas nuevas y las antiguas que cambiaron.
- **Pruebas y mutantes.** `npm test` en tres husos horarios, y 28 mutantes en una copia (`rev-qa/copia/`, restaurada e idéntica al acabar).
- **Casos límite.** Scripts en Node que importan el código del repositorio (solo lectura).
- **Servidor.** El mío, con datos temporales: `ACADEMIA_PUERTO=8812 ACADEMIA_DATOS=rev-qa/datos`, parado al acabar.
- **Interfaz.** Playwright con Chromium, contra ese mismo servidor.
- **Exportaciones antiguas.** Construidas con el código de la Fase 2 (`b919978`, extraído con `git archive` a `rev-qa/fase2/`).

**En una frase:** la Fase 3 es sólida. Las 147 pruebas pasan, en Madrid también. No se pierde ni se bloquea nada. Las exportaciones antiguas se importan igual. La notación y las preguntas que he comprobado a mano son correctas. Quedan cuatro huecos importantes:
1. El metrónomo no recibe el compás del contenido.
2. La evaluación de técnica puede estimar un nivel 6 saltándose niveles sin contenido.
3. La evidencia en contra de una obra se pierde si después otra da evidencia favorable.
4. La grafía de la sensible en las tonalidades menores con bemoles está mal (latente: hoy ningún archivo usa esas tonalidades).

---

## 1. Pruebas

| | `npm test` | `TZ=Europe/Madrid npm test` | `TZ=UTC npm test` |
|---|---|---|---|
| Total | **147** | **147** | **147** |
| Pasan | **147** | **147** | **147** |
| Fallan | **0** | **0** | **0** |
| Duración | ≈ 1,6 s | ≈ 1,7 s | ≈ 1,6 s |

**Pruebas por archivo** (contadas con `node --test` archivo a archivo):

| Archivo | Pruebas |
|---|---|
| catálogo | 3 |
| contenido | 6 |
| dominio | 13 |
| evaluación | 8 |
| fase-2-1 | 30 |
| integración | 4 |
| metrónomo | 5 |
| niveles | 4 |
| notación | 9 |
| partitura | 8 |
| persistencia | 6 |
| planificador | 11 |
| recomendador | 4 |
| revisión | 16 (generadas en un bucle) |
| ruta | 10 |
| servidor | 10 |

Las salidas completas están en `rev-qa/salida-node-test*.txt`.

**Pruebas antiguas que han cambiado.** He revisado sus diferencias con `b919978`. Siguen comprobando lo mismo:
- `entidadesHastaTramo2` vacía los tramos 3-5 para las pruebas de la ruta en espera.
- `comp:esc.arpegio-pima` se sustituye por `comp:tec.tremolo-lento` como «fuera de la ruta», porque el arpegio p-i-m-a ahora está en el tramo 3.
- La notación de `notacion.test.js` se completa hasta llenar el compás, porque ahora se exige que esté lleno.

---

## 2. Mutaciones: ¿detectan las pruebas una regla rota?

Script: `rev-qa/scripts/mutantes.mjs`. Salida: `rev-qa/mutantes-salida.txt`. En cada caso se rompe una regla en la copia, se pasa `node --test` y se restaura el archivo.

| # | Regla rota a propósito | ¿Se detecta? |
|---|---|---|
| M1 | Las alturas se escriben como suenan (sin la octava de más) | Sí (3 pruebas) |
| M2 | Las alteraciones se recorren voz por voz y no en orden temporal | Sí |
| M3 | No se escribe el becuadro tras una nota alterada en el compás | Sí |
| M4 | El recorte de un fragmento empieza un compás tarde | Sí (6) |
| M5 | No se comprueba que cada voz llene su compás | Sí |
| M6 | El ajuste del profesor pasa por delante del encargo | Sí (2) |
| M7 | Tope del metrónomo en 300 en vez de 240 | Sí |
| M8 | El 6/8 se cuenta en seis | Sí |
| M9 | El tempo pesa en el dominio aunque no sea obligatorio | Sí (2) |
| M10 | Una prueba del diagnóstico cuenta aunque no sea «ok» | Sí |
| M11 | La evidencia favorable de una obra no hace «estimada» la competencia | Sí |
| M12 | Una pasada con «fallos» cuenta como evidencia favorable | Sí |
| M13 | La evaluación vuelve a preguntar lo que ya consta | Sí |
| M14 | La evaluación no baja si falla el nivel de partida | Sí |
| M15 | Confianza siempre «alta» | Sí (3) |
| M16 | **Un diagnóstico antiguo sin confianza sale con «alta» y no con la más prudente** | **No** |
| M17 | El diagnóstico no valida sus campos nuevos | Sí |
| M18 | **Armonía: la respuesta del IV es el iii** | **No** |
| M19 | Intervalos: la 6.ª mayor con 8 semitonos | Sí |
| M20 | Tope de la cobertura otra vez en 3,4 | Sí (2) |
| M21 | No se valida que la sección de un fragmento exista | Sí |
| M22 | «vistas» no limita lo que se ofrece | Sí |
| M23 | Tempo del encargo sin validar en el estado | Sí |
| M24 | Lectura: se dibuja la nota de la cuerda de al lado | Sí |
| M25 | **Tono homónimo: la respuesta es el relativo menor** | **No** |
| M26 | **Cadencia andaluza: el reposo es La menor** | **No** |
| M27 | **Reparto en líneas: todo en una sola línea, comprimido** | **No** |
| M28 | **Evidencias: manda la más antigua y no la última** | **No** |

**Se detectan 22 de 28.** Las seis que no se detectan son huecos de las pruebas, no fallos de hoy. Las respuestas de M18, M25 y M26 las he comprobado a mano y son correctas (sección 6). Ver Q-19.

---

## 3. Estado general: **PASS CON OBSERVACIONES**

- **Ningún crítico.** No hay pérdida de datos ni nada que deje la app inservible.
- **Las garantías se mantienen:**
  - **Persistencia:** `servidor/almacen.js` no ha cambiado y el esquema sigue en 2.
  - **Eventos antiguos:** siguen siendo válidos.
  - **Importación:** las exportaciones antiguas de esquema 1 y 2 se importan, e ida y vuelta da lo mismo.
  - **Ruta:** nada se bloquea en ella.
  - **Tempo:** no decide el dominio salvo `obligatorio` (pero ver Q-9: un tempo no numérico enviado por la API lo burla).
  - **Lectura:** no frena la ruta.
- **Información musical:** el contenido verificado es correcto y lo dudoso va como `porVerificar`.
- **Observaciones:** 4 importantes y 16 menores.

---

## 4. Hallazgos

**Gravedad:**
- **crítico:** pierde datos o deja la app inservible. No hay ninguno.
- **importante.**
- **menor.**

**Clase:**
- **(a):** fallo claro, se puede corregir ya.
- **(b):** regla discutible, la decide el usuario.

**Latente:** hoy no lo dispara ningún contenido real.

Las reproducciones salen de `node rev-qa/scripts/<script>`.

### Importantes

#### Q-1 · El metrónomo no toma el compás del contenido: la hemiolia (6/8) suena en 4/4 y el compás de 12 de la soleá no se puede poner · importante · (a)

**Qué pasa.**
- El metrónomo de un ejercicio usa `e.compas`, pero ningún ejercicio tiene ese campo. El compás está en su notación, `"compas": "6/8"`, y nadie lo lee.
- Así, en `ej:rit.hemiolia` y en el paso `paso:c1.t5.04` el metrónomo arranca en **4/4, con 4 pulsos y el acento cada 4**. Sus instrucciones dicen «Metrónomo en dos por compás (una negra con puntillo por golpe)» y su criterio repite «con el metrónomo en dos por compás».
- Hay que cambiarlo a mano a 6/8 cada vez, porque al volver a entrar se pierde.
- El compás de 12 flamenco con acentos en 3, 6, 8, 10 y 12 está programado y probado en la lógica, pero no se puede usar:
  - ningún contenido da `compas` ni `acentos`;
  - el desplegable solo ofrece 2/4, 3/4, 4/4 y 6/8.

  `comp:fl.compas-12` pide «contar y palmear los 12 tiempos con los acentos en el 3, el 6…» «con el metrónomo».
- Cuando el contenido no dice el compás, se presenta 4/4 sin avisar. Pasa en la *Españoleta*, cuyo compás está `porVerificar`, y en «Preparar la obra final», con *Lágrima*, que es 3/4.

**Dónde.**
- `web/vistas/ejercicio.js:51` (`compas: e.compas ?? null`)
- `web/vistas/paso.js:117`
- `web/componentes/metronomo.js:8` (`COMPASES`) y `:90` (`compas ?? '4/4'`)
- Contenido: `contenido/ejercicios/comun.json:48`, `contenido/competencias/comun.json:377`, `contenido/competencias/flamenca.json:8`

**Reproducción** (Playwright contra 8812, `rev-qa/scripts/u1-navegador.cjs` y `u3-pantallas.cjs`; captura en `rev-qa/capturas/hemiolia.png`):
```
ej:rit.hemiolia  {"vista":"partitura", … "compasMetronomo":"4/4","pulsos":4}   ← la partitura dibujada es 6/8
/paso/paso:c1.t5.04 {"h1":"6/8 y la hemiolia","svg":1,"metro":"4/4","pulsos":4}
```

- **Esperado:** 6/8 contado en dos (`pulsosDe('6/8')` → 2 pulsos de 3).
- **Obtenido:** 4/4.

**Corrección.** Tomar el compás de la notación propia cuando el contenido no diga otro, y permitir `acentos` en la ficha (para la soleá).

#### Q-2 · La evaluación de técnica salta del nivel 2 al 6 y puede estimar «técnica 6» con los niveles 3-5 vacíos · importante · (a) la incoherencia, (b) cómo resolverla

**Qué pasa.**
- La técnica tiene competencias de nivel 1 (9), 2 (2) y 6 (1, el trémolo a tempo).
- Quien supera los niveles 1 y 2 pasa directamente a la prueba de nivel 6. Si la supera, en una autoevaluación, el módulo guarda `niveles: { tecnica: 6 }`: «un nivel sin probar por debajo de uno superado se da por sabido».
- Esto choca con `niveles.js`, que se para en el primer nivel sin contenido: «sin contenido en ese nivel: no se puede confirmar más».
- **Consecuencias:**
  - la técnica sale estimada en 6;
  - la referencia del punto de partida pasa a 6, y cualquier área evaluada queda «por detrás»;
  - en «Hoy» crece el tiempo de lectura (de 8 a 12 min en 60′).
- No cambia el curso, porque el repertorio sigue en 0.

**Dónde.** `logica/evaluacion.js:98` (`niveles.find(x => x > l)`) y `:135` (`if (!deL.length) continue;`), frente a `logica/niveles.js:33`.

**Reproducción** (`e1-evaluacion.mjs`, E1/E1b, y `e2-evaluacion.mjs`):
```
E1 recorrido técnica todo ok → {"niveles":["1","2","6"],"ultimo":"6:tec.tremolo-a-tempo","nivel":6,"confianza":"media"}
E1b → tecnica {"nivel":6,"estimado":true,"efectivo":6} · ref 6
P técnica 6: 60′ … area(12) lectura …   ·   P técnica 2: 60′ … area(8) lectura …
```

**A decidir:** no estimar por encima del último nivel contiguo con contenido, o avisar de que los niveles 3-5 no se han podido comprobar.

#### Q-3 · Evidencia contradictoria de dos obras: manda la última pasada y la evidencia en contra desaparece · importante · (b)

**Qué pasa.**
- `evidenciasVigentes` guarda solo la última evidencia de cada competencia, venga de la obra que venga.
- Si *Adelita* deja «en contra» para la melodía acompañada y días después *Lágrima* deja «favorable», la laguna desaparece. La competencia pasa a «estimada» (por confirmar) y «Hoy» dice «Lágrima ya lo apunta: confírmalo».
- Dentro de un mismo evento con dos pasadas decide el orden. En la interfaz cada pasada es un evento.

**Dónde.** `logica/evaluacion.js:184-189` (línea 187: `res.set(x.item, …)`).

**Reproducción** (`e1-evaluacion.mjs` E7/E7b y `e2-evaluacion.mjs` E7c):
```
E7  a favor (20/10) y en contra (22/10) → vigente "en-contra", estimada false, laguna true
E7b en contra (20/10) y a favor (22/10) → vigente "favorable", estimada true, laguna false,
    enCola "Lágrima ya lo apunta: confírmalo, lo necesita la obra que estás trabajando."
E7c mismo evento: [Adelita mal, Lágrima bien] → favorable · [Lágrima bien, Adelita mal] → en-contra
```

**A decidir:** si una evidencia en contra se conserva (por obra, o la peor) hasta que una comprobación en frío la resuelva. El Plan no define el caso.

#### Q-4 · La sensible de las tonalidades menores con bemoles se escribe como bemol (Do♯ en Re menor → «Re♭») · importante · (a) · latente

**Qué pasa.**
- La regla «lo cromático, con bemoles en las tonalidades de bemoles» se aplica también a la sensible del menor armónico:
  - Re menor con Do♯ (2.ª cuerda, traste 2) se dibuja `db/5`;
  - Sol menor con Fa♯ sale `gb/5`;
  - Fa mayor con Fa♯ sale `gb/5`.
- Un Re♭ en Re menor es una nota inventada. Contradice «la grafía de la armadura» y «no se inventa información musical».
- Hoy ningún archivo usa armadura con bemoles (hay E, Am, C, D y G), pero Re menor es una tonalidad muy habitual en guitarra.
- Las pruebas solo comprueban tonalidades con sostenidos.

**Dónde.** `logica/partitura.js:56-58`.

**Reproducción** (`n1-notacion.mjs`, N7):
```
N7 Do# en Re menor (2.ª, traste 2) → ["db/5"]     (esperado c#/5)
N7 Fa# en Sol menor (1.ª, traste 2) → ["gb/5"]    (esperado f#/5)
N7 Sol# en La menor → ["g#/4"] · Re# en Mi menor → ["d#/4"]   (bien)
```

**Corrección mínima:** en tonalidad menor, el 6.º y el 7.º grados elevados con sostenido o becuadro.

### Menores

#### Q-5 · El validador de notación deja pasar un acorde vacío y se cae con una nota o un compás `null` · menor · (a)

- `{ d: '4', acorde: [] }` pasa `validarNotacion` y `prepararNotacion` lanza `TypeError`. En la interfaz sale «No se ha podido dibujar la notación (Cannot read properties of undefined (reading 'forEach'))», en vez de la lista de errores.
- Una nota o un compás `null` hacen que el propio validador lance. En el servidor se informa como «no es JSON válido», que es falso.
- **Dónde:** `logica/partitura.js:85-100` y `:153`; el mensaje está en `servidor/catalogo.js:24`.
- **Reproducción:** `n1-notacion.mjs`, N1 y N4.

#### Q-6 · El validador de notación no comprueba la coherencia de ligados, ligaduras, `parcial` ni anacrusa · menor · (a)

**Lo que acepta sin aviso:**
- un ligado «h» hacia un traste más grave;
- un ligado entre cuerdas distintas;
- una ligadura entre dos notas distintas;
- `parcial.transcritos: 8` con un solo compás escrito (el aviso dice «Transcritos 8 de 16»);
- una anacrusa más larga que el compás.

**El contenido real está bien:** los 24 ligados de los 14 archivos van en la misma cuerda y en su dirección.

**Dónde:** `logica/partitura.js:95-105`.

**Reproducción:** `n1-notacion.mjs` (N2, N4) y `n2-ligaduras.mjs`.

#### Q-7 · Una ligadura sobre la barra repite la alteración en la nota ligada, y la siguiente nota igual no la lleva · menor · (a) · latente

- Sol♯ ligado del compás 1 al 2, en Do mayor: el plan da `g#/5` con `#` en la nota ligada y sin alteración en el Sol♯ siguiente.
- Es al revés de la práctica habitual. La altura es correcta, la grafía no.
- **Dónde:** `logica/partitura.js:149-158`; el estado del compás se reinicia sin mirar `tie`.
- **Reproducción:** `n2-ligaduras.mjs`.

#### Q-8 · Fragmentos: `compases` admite 0 o negativos, y un fragmento con notación propia hereda el recorte de la obra · menor · (a) · latente

Hoy ninguna obra tiene fragmentos.

- **Compases sin límite inferior.** El validador de fragmentos no exige `desde ≥ 1`, aunque para `notacion.compases` sí lo exige.
  - Con `[-3, 4]` el dibujo recorta en silencio desde el 1.
  - La ficha mostraría «COMPASES -3-4».
  - **Dónde:** `logica/validarCatalogo.js:154`.
- **Recorte heredado.** `fuenteDe` aplica `item.notacion.compases` también cuando la parte trae su propia `fuente`.
  - **Dónde:** `web/componentes/partitura.js:40`.
- **Reproducción:** `c1-catalogo.mjs`:
  ```
  C1 fragmento compases [-3, 4] → []
  F1 fuenteDe fragmento con fuente propia y obra recortada → {"fuente":"notacion/b.json","compases":[1,8]}
  ```

#### Q-9 · El tempo de una práctica no se valida, un tempo no numérico supera un tempo obligatorio y los rangos no cuadran · menor · (a)

**Tempo sin validar.**
- `validarEvento` no mira `ev.tempo`. El servidor guarda `"rápido"`, `-50` y `100000` (200 OK).
- Con el tempo obligatorio a 80 (ajuste del profesor), un intento con `tempo: "rápido"` o `"200"` da **«ok»**: las comparaciones con NaN o con texto no fallan.
- Desde la interfaz no pasa, porque el campo es numérico; sí llega por la API o por una importación.

**Rangos de tempo distintos según dónde:**

| Dónde | Rango |
|---|---|
| Notación | 20-300 |
| Encargo, en el estado | 20-300 |
| Ajuste del criterio | 20-300 |
| Campo del registro | 0-400 |
| Metrónomo | 30-240 |
| Formulario de encargos | 30-240 |

Con un encargo de 25 importado, el botón «Al objetivo (25)» pone 30.

**Dónde:**
- `logica/esquema.js:74-91`
- `logica/dominio.js:57`
- `logica/esquema.js:69`
- `logica/partitura.js:76`
- `web/componentes/criterio.js:29`
- `web/componentes/registro.js:17`
- `web/vistas/evaluaciones.js:216`

**Reproducción:** `v1-tempo-validacion.mjs` y `s1-servidor.mjs`:
```
tempo "rápido" · válido: true · resultado con tempo obligatorio 80: ok
200 práctica con tempo 100000: {"anadidos":1}
```

#### Q-10 · El diagnóstico acepta `preguntas` sin `aciertos` y una evidencia con `fuente` vacía · menor · (a)

- `preguntas: -3` sin `aciertos` se guarda.
- `fuente: ''` se guarda, y en «Hoy» el motivo queda «  ya lo apunta: confírmalo, …».
- **Dónde:** `logica/esquema.js:107` (solo se valida `preguntas` si hay `aciertos`) y `:112`.
- **Reproducción:** `s1-servidor.mjs` y `v1-tempo-validacion.mjs`.

#### Q-11 · Metrónomo: un parón del navegador lo descompasa (un clic tarde y dos seguidos) · menor · (a)

**Qué pasa.**
- La programación mira 120 ms por delante con un temporizador de 25 ms y no tiene recuperación.
- Con una tarea larga de 1 s a 120 BPM, un clic suena 0,47 s tarde y el siguiente sale 28 ms después.
- Dibujar cuatro partituras seguidas no lo descompasa: VexFlow va sobrado.
- Lo previsible en uso real son las pestañas en segundo plano. Chrome limita los temporizadores a 1 por segundo. **No lo he podido reproducir en headless**, donde la página sigue visible.

**Dónde:** `web/componentes/metronomo.js:32-41`.

**Reproducción:** `u5-metronomo-linea.cjs`:
```
--- tarea larga 1000 ms
programado 3.060 · reloj 3.532  ← YA PASADO · separación 0.972
programado 3.560 · reloj 3.532 · separación 0.028
```

#### Q-12 · La evaluación de técnica empieza por lo último del curso y pregunta las nueve competencias del nivel 1 · menor · (b)

- Dentro de un nivel, el orden es alfabético por id. Un principiante ve primero «Alternar i-m y m-a» (tramo 4), «Dos voces» y «Destacar una nota», y «Sonido clásico» (paso 1 del tramo 1) lo último.
- Dentro de un nivel se preguntan todas aunque falle la primera. Hay 9 de técnica en el nivel 1, porque todo el curso 1 es «nivel 1».
- **Dónde:** `logica/evaluacion.js:31` y `:92-96`.
- **Reproducción:** `u2-evaluacion.cjs` → «técnica 1.ª: Alternar i-m y m-a, apoyando».
- **A decidir:** el orden de la ruta, y si se corta antes.

#### Q-13 · Al repetir un módulo cuyo contenido ya consta, el resumen dice que lo no evaluado «empieza desde el principio» · menor · (a)

- Con todo lo del área ya hecho por el progreso, el módulo termina sin preguntas.
- El resumen dice «No se ha guardado nada · lo que no evalúes empieza desde el principio de su área». Es falso: consta entero.
- **Dónde:** `web/vistas/evaluaciones.js:236` y `:242`.
- **Reproducción:** `e1-evaluacion.mjs` E5 → `segunda: {"fin":true}`, `r2: {"nivel":1,"confianza":"alta","cobertura":1}`, con `probadas: 0`.

#### Q-14 · Terminar pronto da el nivel con una sola competencia probada · menor · (b)

- Con 1 de las 4 competencias de oído de nivel 1 superada y «Terminar aquí y guardar», el área queda estimada en 1, con confianza baja. Las otras tres pasan a «se dan por sabidas: confírmalas».
- Es coherente con lo que dice el código y la confianza lo refleja, pero el resultado del nivel sale de muy poca evidencia.
- **Dónde:** `logica/evaluacion.js:133-137`.
- **Reproducción:** `e1-evaluacion.mjs` E5b → `ev1: {"oido":1}` con 2 de 4 superadas; con 1 de 4 da lo mismo.

#### Q-15 · El perfil llama «De tu progreso» a un área cuya única evidencia viene de las obras conocidas · menor · (a)

- **Dónde:** `logica/evaluacion.js:236`.
- **Reproducción:** `e1-evaluacion.mjs` E8 → `{"fuente":"progreso","confianza":"baja","nivel":0,"evid":["repertorio","repertorio","repertorio"]}`.

#### Q-16 · Flamenco: el punto de partida marca la lectura de pentagrama como «van por detrás» · menor · (b)

- Es la misma familia que H-09 de la Fase 2. El Plan 5 dice «el pentagrama, opcional» para el flamenco.
- **Dónde:** `logica/evaluacion.js:267`.
- **Reproducción:** `e4-flamenco.mjs` → `flamenco · ref 1 · fuertes [ 'fl-tecnica' ] · van por detrás [ 'lectura' ]`.

#### Q-17 · Las preguntas que corrige la app solo están en la evaluación; el comentario dice otra cosa · menor · (a) el comentario, (b) el alcance

- `logica/preguntas.js:3` dice que las usan «la evaluación inicial y las tandas de práctica».
- Solo las usa `web/vistas/evaluaciones.js:157`. En «Hoy» y en las fichas, las competencias de conocimiento siguen pidiendo teclear aciertos y preguntas (`web/componentes/registro.js:38`).
- Texto repetido, de la misma familia: `ej:tec.mordente` termina su regla con «el tempo se apunta para ver cómo sube» y la vista añade «El tempo se apunta para ver cómo sube; no es el criterio» (`contenido/ejercicios/clasica.json:478`, `web/vistas/ejercicio.js:47`).

#### Q-18 · Pocas preguntas distintas en algunas competencias y un distractor enarmónico · menor · (b)

- En una tanda de 10, `comp:arm.cadencias` y `comp:fla.cadencia-andaluza` solo tienen 4 preguntas posibles, así que se repiten. `comp:teo.tono-semitono` tiene 7.
- En «4.º grado de Sol mayor» y «5.º grado de Fa mayor» la correcta es «Do» y entre las opciones aparece «Si♯», que suena igual. Por grafía es incorrecta, pero en el nivel 1 confunde.
- **Dónde:** `logica/preguntas.js:81`, `:114-121` y `:158-161`.
- **Reproducción:** `p1-preguntas.mjs`.

#### Q-19 · Huecos de las pruebas: seis mutantes no se detectan · menor · (a)

**Qué no comprueban:**
- la confianza por defecto de un diagnóstico antiguo (M16);
- las respuestas de `arm.i-iv-v7-i`, `arm.tono-homonimo` y `fla.cadencia-andaluza` (M18, M25 y M26). La prueba solo mira que las opciones sean distintas;
- que el reparto en líneas corte de verdad (M27): meterlo todo en una línea comprimida también «cabe en el ancho»;
- el orden de las evidencias (M28, ligado a Q-3).

Ver la sección 2.

#### Q-20 · El paso de una competencia de conocimiento muestra metrónomo · menor · (b)

- «Intervalos y armaduras» (`paso:c1.t4.05`) e «Inversiones» (`paso:c1.t3.05`) llevan barra de metrónomo, que no pinta nada en teoría.
- En un paso con varias competencias, el metrónomo usa la primera. Si se registra la segunda, su campo «Tempo» no recibe el del metrónomo.
- **Dónde:** `web/vistas/paso.js:114`.
- **Reproducción:** `u3-pantallas.cjs` → `/paso/paso:c1.t4.05 {"metro":"4/4"}`.

---

## 5. Lo que está bien (comprobado)

### Notación

**Las 14 notaciones, comprobadas nota a nota:**
- **Escalas.** Do, Re, Sol (dos octavas), Mi (dos octavas), La menor en sus tres formas (la melódica baja como la natural) y la cromática de La2 a La3: notas, digitación de primera posición y orden correctos.
- **Acordes.** Mi–La–Si7–Mi (Si7 = x21202, con su digitación 2-1-3-4), Do y Sol7 en p-i-m-a y p-a-m-i, y La menor y Mi mayor con la «a» acentuada.
- **Hemiolia.** Dos negras con puntillo, seis corcheas y tres negras.
- **Dos voces.** El bajo en blanca más silencio de blanca.
- **Ligados.** Desde la cuerda al aire.
- **Mordentes.** Re–Do♯–Re, Fa♯–Mi–Fa♯, La–Sol–La y Do♯–Si–Do♯, en semicorcheas, semicorcheas y corchea.
- **Compases y ligados.** Todos los compases suman y los 24 ligados van bien.

**Las competencias y los ejercicios nuevos dicen lo correcto:**
- Re3 → Re4 con Fa♯ (4.ª, traste 4) y Do♯ (2.ª, traste 2).
- Fa♯ de Sol mayor en la 4.ª (traste 4) y en la 1.ª (traste 2).
- Armaduras hasta dos alteraciones.
- Triadas de Do mayor.
- Cadencias.
- Inversiones («Do con Mi en el bajo: primera inversión»).

Lo dudoso va como `porVerificar`: la edición, el compás y la tonalidad de la *Españoleta*, el estilo del mordente y la obra eje de los tramos 3 y 4.

**Las reglas del plan de dibujo funcionan:**
- escrita una octava arriba;
- alteraciones en orden temporal entre las dos voces y por octava;
- becuadro;
- 12/8, 5/4 y 7/16 llenos se aceptan;
- 4/0, 0/4 y 3/3 se rechazan;
- fragmentos fuera de rango («no está transcrito») y parcialmente fuera (con aviso).

**En el navegador:**
- Los 14 ejercicios se dibujan con VexFlow sin errores de consola.
- «Ambas» aparece solo cuando hay las dos vistas, y se recuerda.
- En el móvil (390 px) no hay desplazamiento horizontal: el SVG mide 318 px.

### Preguntas

- He comprobado 2 600 preguntas contra tablas escritas a mano: diapasón (17 de 17 posiciones), escala mayor, IV y V7, homónimo, cadencia andaluza, triadas de Do, armaduras, inversiones e intervalos, más el oído de 3.ª, 5.ª y 8.ª, mayor o menor y conclusivo o suspensivo. **0 errores.**
- La nota que se dibuja en la pregunta de lectura es la de la respuesta.

### Metrónomo

- **Límites y estados.** Se queda en 30-240, con ±1 y ±5. NaN, nulo o texto dan 30, e Infinity da 240. Los estados (parado, sonando, pausado) y la pausa que sigue en el mismo pulso funcionan.
- **Compases.** 6/8, 9/8 y 12/8 compuestos; el 12 con acentos flamencos en la lógica.
- **Tempo de referencia.** Prioridad encargo > profesor > propio > contenido; encargo hecho o caducado, fuera; «hasta» igual a hoy, vale.
- **Dominio.** El tempo solo obliga si es `obligatorio`.
- **En el navegador.** El tempo usado pasa al campo «Tempo» del registro, y el metrónomo sigue sonando entre pantallas con el aviso «Está sonando para otro ejercicio».

### Evaluación

- **Recorrido.** Es adaptativo, no repite lo que ya consta y baja si falla el nivel de partida.
- **Lo fallado.** No queda «en curso» (cambio de `dominio.js`). Un diagnóstico antiguo sigue siendo válido, sale con confianza baja y pide reevaluar a los 21 días.
- **Contenido escaso.**
  - Las áreas sin contenido no tienen botón.
  - El repertorio sin obras conocidas explica qué hacer.
  - «Terminar aquí» sin respuestas no guarda nada.
  - Salir con respuestas pide confirmación y no guarda.
- **Validación.** El evento se valida: nivel 2,5 o «2», confianza «muy alta», resultado «superada», aciertos mayores que preguntas, tipo «oral», evidencia «buena», aspecto «velocidad», módulo numérico e hipótesis 9 se rechazan con 400.

### Persistencia e importación

- Una exportación de esquema 2 hecha con la Fase 2 (formatos por sección, ajuste del profesor, encargo con formato, conocida parcial, tramo elegido, sesión, nota, evaluación y diagnóstico antiguo) **se importa**.
- Una de esquema 1 (`rutaPrincipal`, `ruta` en encargos y sesiones) **se migra**.
- En las dos, exportar → importar → exportar da exactamente lo mismo.
- Script: `s2-exportacion-antigua.mjs`.

### Ruta

- Los tramos 3-5 se abren tras el 2.
- Ningún paso queda bloqueado (`requiere` solo marca «próximo»).
- No hay pasos de lectura nuevos que frenen.
- El cierre del curso espera a los tres tramos.
- Los tramos sin obra eje lo avisan en «Ahora».
