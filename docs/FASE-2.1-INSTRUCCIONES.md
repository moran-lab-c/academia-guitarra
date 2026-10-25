# Fase 2.1 — instrucciones de David (25/10/2026)

Contexto para la sesión en la nube: la revisión local de la Fase 2 ya está hecha. Sus informes completos están en esta rama:
- `docs/revision-fase-2/ui-finish-gate.md`: UI Finish-Gate, PASS CON OBSERVACIONES, problemas I-1 a I-9 y M-1 a M-27.
- `docs/revision-fase-2/qa.md`: QA. 64 pruebas, todas en verde. Hallazgos H-01 a H-20, con su reproducción en `docs/revision-fase-2/scripts/`.
- `docs/Plan de la academia.md` y `docs/Arquitectura de la academia.md`: lo aprobado.

Sus datos reales no están en el repositorio y no se tocan nunca. Respuestas en español de España y de usted.

Lo que sigue es el mensaje de David, tal cual:

---

He revisado tu informe de la revisión formal de la Fase 2.
El resultado general me parece bueno y quiero conservar la arquitectura actual. Sin embargo, antes de pasar a la Fase 3 quiero hacer una Fase 2.1 de corrección, centrada exclusivamente en los problemas de lógica pedagógica y persistencia que has detectado.
NO hagas un rediseño general.
NO cambies la arquitectura aprobada.
NO empieces la Fase 3.
NO añadas funcionalidades nuevas que no estén relacionadas con estas correcciones.
Quiero que corrijas primero los problemas claros y que dejes como decisiones explícitas los que requieren criterio pedagógico.

1. CORRECCIONES OBLIGATORIAS
1.1. Paso de aplicación
Un paso de aplicación NO puede aparecer como "hecho", "repaso" o equivalente simplemente porque la competencia asociada esté dominada.
Para que un paso de aplicación pueda considerarse realizado debe existir evidencia de que la aplicación correspondiente se ha trabajado.
En particular:
* si el paso es "aplicar X en una obra";
* y la obra nunca se ha tocado;
* el paso no puede darse por hecho.
La competencia puede estar aprendida, pero eso no equivale a haber realizado la aplicación.
Añade una prueba que falle si el paso de aplicación se marca como hecho sin haber trabajado la obra/aplicación correspondiente.

2. REFUERZOS DUPLICADOS
Una misma necesidad pedagógica no debe generar dos refuerzos idénticos dentro del mismo tramo o sesión simplemente porque aparezca tanto en una aplicación como en una obra.
Deduplica los refuerzos por competencia/necesidad real, manteniendo la información de qué contenidos los originaron.
Quiero que:
* un mismo problema pueda tener varios orígenes;
* pero no se muestre dos veces como dos ejercicios idénticos sin necesidad.
Añade una prueba específica para este caso.

3. OBRA DEL TRAMO VS. OBRA DE LECTURA
Este es uno de los puntos más importantes.
Ahora mismo Sor puede entrar en la sesión como obra del tramo mientras Lágrima B queda fuera.
Eso no es correcto.
La obra principal del tramo debe seguir siendo la obra que el diseño del tramo ha establecido.
Si Sor es una obra de apoyo para lectura:
* puede generar una necesidad;
* puede generar un refuerzo;
* puede aparecer como trabajo complementario;
* puede aparecer en lectura;
pero NO debe sustituir automáticamente a la obra principal del tramo.
Por tanto:
Lágrima B debe seguir siendo la obra principal del tramo correspondiente.
Sor no debe desplazarla.
Añade tests que comprueben específicamente:
* tramo con Lágrima B + Sor;
* Sor pendiente;
* Lágrima B pendiente;
* Lágrima B debe seguir entrando como obra principal;
* Sor puede entrar como apoyo cuando corresponda.

4. LECTURA NO DEBE BLOQUEAR EL TRAMO
Mantengo la decisión pedagógica de que la lectura puede quedar por detrás de otras áreas.
Una obra de lectura no debe bloquear automáticamente el cierre del tramo si el resto de competencias del tramo están consolidadas.
Por tanto:
* Sor puede producir refuerzo de lectura;
* puede aparecer en sesiones;
* puede influir en recomendaciones;
* pero no debe convertirse automáticamente en una barrera para avanzar de tramo simplemente por ser una obra de lectura.
Si existe una razón pedagógica concreta para que una lectura sea requisito de un tramo, debe estar declarada explícitamente en los datos del tramo, no surgir como efecto colateral del algoritmo.
Añade una prueba.

5. REPASOS VENCIDOS
Aquí NO quiero una solución simplista.
Ahora mismo existe el problema de que determinados repasos vencidos fuera de la ruta pueden esperar indefinidamente.
Pero tampoco quiero que aparezcan 16 o 17 comprobaciones en una sesión.
Necesitamos una política de acumulación.
Implementa una cola/prioridad razonable con estas propiedades:
* los repasos vencidos no desaparecen;
* no todos tienen que entrar el mismo día;
* una sesión corta no debe quedar secuestrada por repasos;
* los repasos más importantes/antiguos deben tener prioridad;
* los repasos no seleccionados permanecen pendientes para sesiones posteriores;
* debe existir una forma de evitar que un repaso quede relegado indefinidamente.
No fijes todavía una cantidad arbitraria universal si los datos actuales no permiten justificarla.
Puedes usar una prioridad basada en factores como:
* antigüedad;
* importancia de la competencia;
* relación con una obra activa;
* relación con el tramo actual;
* riesgo de pérdida;
* tiempo disponible.
Pero mantén el sistema interpretable y sencillo.
Añade tests de acumulación, incluyendo muchas comprobaciones vencidas.

6. OBRA FINAL
Una obra final no debe considerarse automáticamente conseguida con una única pasada si el propio criterio de la obra exige memoria u otros aspectos.
La obra final debe respetar los criterios definidos para ella.
Por ejemplo, si la obra final requiere:
* lectura/aprendizaje;
* continuidad;
* memoria;
* sonido;
* dinámica;
* etc.;
no puede pasar a "completada" simplemente porque una lectura inicial haya salido bien.
Distingue correctamente:
* primera realización;
* aprendida;
* consolidada;
* dominada/manejada según el modelo actual.
No inventes niveles nuevos si el modelo ya tiene equivalentes.
Añade tests para impedir que una pasada insuficiente cierre prematuramente una obra final.

7. OBRA CONOCIDA QUE FALLA
Si una obra ya estaba marcada como conocida y su comprobación en frío falla, debe poder generar necesidades/refuerzos.
No quiero que:
"obra conocida → comprobación fallida"
termine simplemente en un estado peor sin una consecuencia pedagógica.
Debe identificar qué parte/competencia ha fallado cuando sea posible y proponer el refuerzo correspondiente.
No reinicies la obra desde cero.
La filosofía sigue siendo:
no reiniciar una obra conocida, sino detectar qué necesita recuperar o mejorar.
Añade tests.

8. SALTO AL CURSO 2 EN BORRADOR
Este punto es importante.
Ahora mismo un alumno que termina correctamente el Curso 1 puede saltar al Curso 2, que está en borrador, y quedarse sin ruta.
Eso no debe ocurrir.
Hasta que el Curso 2 tenga contenido real:
* el sistema debe mostrar claramente que el siguiente curso está en preparación/borrador;
* el alumno no debe quedarse sin recomendaciones;
* debe existir una estrategia de continuidad basada en consolidación, repertorio, refuerzos, revisión y/o contenido disponible del nivel actual.
NO quiero que inventes contenido del Curso 2.
Quiero que el sistema sepa manejar correctamente el estado:
"he terminado lo disponible y el siguiente curso todavía no está publicado".
Añade un test de este escenario.

9. REPARTO POR ÁREAS Y SUPUESTO 25 %
Has detectado que el supuesto tope del 25 % por área que aparecía en el Plan realmente no existe en el planificador actual.
NO quiero que implementes un límite rígido del 25 % sin más.
Primero trata esto como una inconsistencia documental.
Mantén la distribución pedagógica adaptativa actual, siempre que no produzca resultados absurdos.
Sí quiero que revises el problema detectado:
* lectura llega al 34 %;
* repertorio puede quedarse en 0 % durante muchos días.
Eso sí es una señal de desequilibrio.
El planificador debe evitar que un área importante quede sistemáticamente olvidada, pero no mediante un reparto mecánico idéntico.
Quiero una regla de "cobertura/abandono" más inteligente:
* si un área importante lleva demasiado tiempo sin aparecer;
* debe aumentar su prioridad;
* pero sin desplazar automáticamente las prioridades del profesor, la ruta o las necesidades críticas.
Añade tests de varios días/sesiones si es necesario.

10. COMPROBACIONES EN FRÍO
Has detectado que pueden acumularse 16–17 comprobaciones vencidas.
No quiero que eso convierta "¿Qué hago hoy?" en un examen.
Mantén la idea aprobada:
* las comprobaciones en frío existen;
* sirven para verificar consolidación;
* normalmente son breves;
* no deben dominar una sesión corta.
Pero deben convivir con la política de repasos del punto 5.
Por tanto, integra las comprobaciones en frío dentro del sistema de prioridad en vez de tratarlas como una lista independiente que pueda crecer sin límite.
Añade tests para:
* pocas comprobaciones;
* muchas comprobaciones;
* sesión de 20 minutos;
* sesión de 60 minutos;
* sesión de 90 minutos.

11. MIGRACIÓN Y PERSISTENCIA
Has detectado dos riesgos que todavía no has corregido:
A. Historial apartado durante una importación fallida
No quiero que una migración fallida deje el historial en un estado ambiguo.
La migración debe ser atómica desde el punto de vista del usuario:
* si funciona → se aplica;
* si falla → el estado anterior debe seguir siendo recuperable sin pasos manuales.
La copia previa puede conservarse, pero no debe dejar el sistema en un estado intermedio.
B. Eventos nuevos después de una migración fallida
Si el sistema sabe que la migración ha fallado y sigue ejecutándose, hay que evitar que se escriban nuevos datos sobre un estado cuya integridad no está garantizada.
Determina la solución más segura dentro de la arquitectura actual.
No hace falta rediseñar el almacenamiento entero.
Añade pruebas de ambos casos.

12. PRUEBAS
Después de las correcciones:
* ejecuta toda la batería;
* conserva las 79 pruebas actuales;
* añade las nuevas que correspondan;
* verifica que las pruebas anteriores siguen teniendo sentido;
* elimina o corrige cualquier test que esté validando una afirmación falsa.
Especialmente revisa la prueba de notación que actualmente daba por buena una frase falsa sobre la tablatura de Lágrima.
No quiero tests que pasen porque contienen una expectativa incorrecta.
Quiero que el test represente el estado real del producto.

13. DOS DETALLES VISUALES
Puedes corregir ahora estos dos detalles menores:
A. Preferencia "Los dos"
Si la preferencia es "Los dos", el carril no debería marcar visualmente solo "Clásico".
Debe representar correctamente el estado de preferencia.
B. Iconos de estado
Corrige el recorte de color de los iconos de estado que aparecen fuera del mapa.
Es un pequeño bug visual, así que sí puedes corregirlo directamente.
No hagas más cambios visuales importantes.

14. COSAS QUE NO QUIERO QUE CAMBIES AHORA
No cambies:
* Programa clásico / Programa flamenco;
* Curso → Ruta → Tramo → Paso;
* cursos integrales;
* ruta visible completa;
* "desbloqueado" como recomendación y no como bloqueo;
* relaciones bidireccionales Ruta ↔ Obra;
* obra final por curso;
* tablatura siempre disponible;
* selector Partitura | Tablatura;
* lectura sin bloqueo artificial;
* prioridad del profesor;
* concepto de "¿Qué hago hoy?";
* sistema de progreso ya aprobado.
Tampoco implementes todavía:
* VexFlow completo;
* metrónomo completo;
* nuevos cursos completos;
* nuevos grandes bloques de contenido.
Eso pertenece a la siguiente fase cuando cerremos esta revisión.

15. LÁGRIMA
Una aclaración importante:
Lágrima NO está marcada como conocida.
Debe tratarse como una obra que todavía tengo que aprender.
Por tanto, mantenla como candidata a obra final mientras revisamos si pedagógicamente es la mejor opción, pero no uses ningún estado de "ya conocida" para ella.

16. RESULTADO FINAL
Cuando termines esta corrección, NO pases a la Fase 3.
Entrégame:
A. Correcciones realizadas
Lista exacta.
B. Decisiones pedagógicas que siguen pendientes
Solo las que realmente necesiten mi aprobación.
C. Tests
* total;
* nuevos;
* pasados;
* fallidos.
D. Estado de migración/persistencia
Explica exactamente qué garantías existen después de una migración fallida.
E. Planificador
Explica de forma sencilla cómo decide ahora:
* qué comprobaciones entran;
* qué repasos entran;
* qué obra principal entra;
* qué refuerzos entran;
* cómo evita abandonar un área;
* cómo se comporta con 20/30/60/90 minutos.
F. Estado de la Fase 2
Elige:
* APROBADA
* APROBADA CON OBSERVACIONES
* NO APROBADA
Y NO avances a Fase 3 hasta que yo revise este informe.
Si alguna decisión no puede resolverse correctamente sin mi criterio, déjala explícitamente pendiente en vez de inventar una regla.
Quiero que esta corrección deje la arquitectura preparada para crecer, no que la llenemos ahora de excepciones.
