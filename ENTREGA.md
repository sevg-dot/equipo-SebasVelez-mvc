# Entrega · Laboratorio MVC · Notas del semestre

**Equipo:** Equipo 6 SebasVelez 
**Integrantes:** Sebastian Velez Guarin, Dilan Rojas Carmona, María Stefany Useche Ospina
**Repositorio:** https://github.com/sevg-dot/equipo-SebasVelez-mvc
> Completa este archivo a medida que avanzas (cada sección dice en qué parte de la guía se llena).
> Escribe con tus palabras: las respuestas copiadas de la guía o de otro equipo no cuentan.

---

## 1. Mapa de responsabilidades (Parte 1)

Clasifica cada fragmento de `espagueti.html`: **M** (Modelo), **V** (Vista), **C** (Controlador) o **Mezcla**
(en ese caso, escribe qué roles se mezclan). En "¿Por qué?" justifica en una frase.

1. var n = document.getElementById('nombre').value.trim();
Rol: Mezcla (Vista y Controlador). Va a la pantalla a leer lo que el usuario escribió (eso es de la Vista) y lo limpia de espacios, dentro de la función que reacciona al clic (eso es del Controlador).

2. if (isNaN(p) || p < 1 || p > 100) { err.textContent = '...'; return; }
Rol: Mezcla (Modelo y Vista). La regla de que el peso esté entre 1 y 100 es del Modelo, pero el mensaje de error se escribe directo en la pantalla (Vista), todo en la misma línea.

3. if (total + p > 100) { err.textContent = '...'; return; }
Rol: Mezcla (Modelo y Vista). Pasa lo mismo que en el anterior: la regla de que los pesos no sumen más de 100 es del Modelo, y el mensaje en pantalla es de la Vista.

4. evals.push({ id: sig++, nombre: n, peso: p, nota: nota });
Rol: Modelo. Es crear la evaluación y añadirla a la lista de datos con su número de id. Los datos y su manejo son del Modelo.

5. localStorage.setItem('notas.v1', JSON.stringify(evals));
Rol: Modelo. Guardar los datos es responsabilidad del Modelo (a través de un almacén). Aquí está suelto dentro de una función cualquiera, y eso es justo lo que hay que arreglar.

6. document.getElementById('nombre').value = '';
Rol: Vista. Vaciar un campo del formulario es solo presentación, no toca datos ni reglas.

7. '<input ... onchange="ponerNota(' + e.id + ', this.value)">'
Rol: Mezcla (Vista y Controlador). En el mismo texto se dibuja el campo de nota (Vista) y se le conecta la orden que se ejecuta al cambiarlo (Controlador).

8. nec = Math.ceil(nec * 100 - 1e-9) / 100;
Rol: Modelo. Es el cálculo de la nota que necesita el estudiante, redondeada hacia arriba. Eso es una regla de negocio.

9. if (acum + 1e-9 >= 3.0) { txt = '¡Aprobado! ...'; cls = 'ok'; }
Rol: Mezcla (Modelo y Vista). Decidir si aprobó con 3.0 es del Modelo, pero la misma línea elige el texto y el color que se muestran, y eso es de la Vista.

10. document.getElementById('tabla').innerHTML = filas;
Rol: Vista. Es dibujar la tabla en la página, nada más.

11. function borrar(id) { ...splice...; localStorage.setItem(...); pintar(); }
Rol: Mezcla (Modelo, Vista y Controlador). Es la función que responde al clic (Controlador), quita la evaluación y guarda los datos (Modelo) y vuelve a dibujar la pantalla (Vista).

12. (e.peso * e.nota / 100).toFixed(2)
Rol: Mezcla (Modelo y Vista). Calcular cuánto aporta cada nota (peso por nota entre 100) es del Modelo, y mostrarlo con dos decimales (toFixed(2)) es de la Vista.

## 2. Olores del espagueti (Parte 1)

Lista **al menos 5** problemas de diseño de `espagueti.html`. Para cada uno, escribe qué consecuencia tiene
cuando el proyecto crece y en qué pieza de MVC viviría la solución.

1. Datos sueltos que cualquiera puede cambiar. En el espagueti, la lista de evaluaciones (evals) y el contador de ids (sig) están sueltos, así que cualquier función puede modificarlos sin pasar por ninguna regla. Cuando el proyecto crece, es fácil que alguien los dañe sin querer y después cuesta saber quién fue. Se arregla en el Modelo, dejando los datos guardados dentro de él y cambiándolos solo con sus métodos.

2. La misma regla copiada en dos sitios. La validación de que la nota esté entre 0 y 5 se escribió tanto en agregar como en ponerNota. Si mañana cambia la regla, hay que acordarse de editar los dos lugares, y si se olvida uno, el programa se comporta distinto según desde dónde se use. Se arregla en el Modelo, dejando la regla en un solo lugar (#validarNota).

3. Números escritos a mano por todos lados. Valores como 3.0, 4.0 y 5.0 aparecen repetidos en varias líneas. Si cambia la nota mínima para aprobar, hay que buscar cada aparición y cambiarla, y con que se escape una, los resultados se contradicen. Se arregla en el Modelo, definiéndolos una sola vez como constantes (NOTA_MINIMA, NOTA_MAXIMA y UMBRAL_RIESGO).

4. El nombre del usuario metido directo en el HTML. El espagueti arma la tabla con innerHTML y mete ahí lo que el usuario escribió. Si alguien escribe código HTML como nombre, se rompe la tabla y hasta se puede colar código malicioso (inyección XSS). Se arregla en la Vista, creando los elementos con createElement y poniendo el texto con textContent, así lo que se escribe se muestra como texto y nunca se ejecuta.

5. Una función que hace tres cosas a la vez. Por ejemplo, borrar cambia los datos, los guarda y además redibuja la pantalla. Una función así es difícil de entender, de probar y de reutilizar, y si se toca una de las tres cosas se puede dañar las otras. Se arregla repartiendo el trabajo: el Controlador solo recibe lo que pidió el usuario y da la orden, y el Modelo y la Vista hacen cada uno lo suyo.

6. Guardar en localStorage desde varias funciones. La instrucción para guardar se repite en distintos lugares del código. Si se quiere guardar en otro sitio, hay que editar todas esas funciones, y además no se puede probar sin abrir un navegador. Se arregla en el Modelo, haciendo que guarde a través de un almacén intercambiable (con cargar() y guardar()), de modo que cambiar dónde se guarda no lo afecte.

## 3. El flujo de «agregar una evaluación» (Parte 6)

Dibuja (a mano y pega una foto, o con texto/Mermaid) el recorrido completo desde que el usuario presiona
**Agregar** hasta que ve la fila nueva en la tabla. Marca en cada paso **el archivo y el método** que actúa.

```text
El usuario llena el formulario y presiona “Agregar”. El formulario de index.html lanza el evento submit.

La Vista se entera. En vista.js, el método alAgregar estaba escuchando ese evento. Evita que la página se recargue y usa leerFormulario() para tomar lo que el usuario escribió (nombre, peso y nota). Todo eso es texto. La Vista no decide nada, solo se lo pasa al Controlador.

El Controlador prepara los datos. En controlador.js, el manejador que se registró en el constructor convierte los textos en números (con #aNumero y #aNota; si la nota está vacía, la vuelve null, que significa “sin nota”).

El Controlador da la orden. Con su método #intentar, le dice al Modelo: “agrega esta evaluación” (modelo.agregar(...)). El Controlador no revisa si los datos son válidos, eso no le toca.

El Modelo valida y guarda. En modelo.js, el método agregar revisa las reglas: que el nombre no esté vacío ni repetido, que el peso esté entre 1 y 100, que la nota esté entre 0 y 5 y que la suma de pesos no pase de 100. Si todo está bien, crea la evaluación con su id y la añade a la lista.

El Modelo guarda y avisa. Con el método #cambio, primero manda guardar los datos al almacén (AlmacenSesion.guardar() en almacen.js) y luego avisa a todos los que estén suscritos: “cambié” (así funciona el Observer).

Las dos vistas se redibujan solas. Al recibir el aviso, NotasVista.render() en vista.js dibuja la fila nueva y actualiza el resumen y el estado. TermometroVista.render() en termometro-vista.js actualiza la barra. Para eso le piden los datos al Modelo con resumen().

El Controlador cierra el proceso. Si todo salió bien, usa limpiarError() y limpiarFormulario() de la Vista para borrar el mensaje de error y vaciar los campos. El usuario ya ve su fila nueva.

Si algo falla. Si en el paso 5 el Modelo encuentra una regla rota, lanza un error de reglas (ErrorDeReglas). El Controlador lo atrapa en #intentar y le pide a la Vista que muestre el mensaje con mostrarError() y que se redibuje con render(). Los datos que el usuario escribió se quedan en el formulario.
```

## 4. Evidencias (Partes 2, 3, 4 y 6)

**Salida de `npm test`** (pega el final, donde dice cuántas pruebas pasan):

```text
MODELO
  ✓ A · Agregar y validar ......................... 11/11
  ✓ B · Calificar y eliminar ...................... 7/7
  ✓ C · Resumen ................................... 10/10
  ✓ D · Observador y persistencia ................. 8/8
  ✓ E · Parte 5A · Nombres únicos ................. 3/3

ARQUITECTURA
  ✓ Modelo puro ................................... 4/4
  ✓ Vista pasiva .................................. 5/5
  ✓ Controlador delgado ........................... 6/6

✓ 54 de 54 pruebas pasan.
```
PS C:\Users\pipidenanopequeño\Desktop\equipo-SebasVelez-mvc> npm test

> mvc-notas-lab@1.0.0 test
> node pruebas/ejecutar.mjs


MODELO
  ✓ A · Agregar y validar ......................... 11/11
  ✓ B · Calificar y eliminar ...................... 7/7
  ✓ C · Resumen ................................... 10/10
  ✓ D · Observador y persistencia ................. 8/8
  ✓ E · Parte 5A · Nombres únicos ................. 3/3

ARQUITECTURA
  ✓ Modelo puro ................................... 4/4
  ✓ Vista pasiva .................................. 5/5
  ✓ Controlador delgado ........................... 6/6

✓ 54 de 54 pruebas pasan.

**Salida de `npm run arquitectura`:**

```text
ARQUITECTURA
  ✓ Modelo puro ................................... 4/4
  ✓ Vista pasiva .................................. 5/5
  ✓ Controlador delgado ........................... 6/6

✓ 15 de 15 pruebas pasan.
```
PS C:\Users\pipidenanopequeño\Desktop\equipo-SebasVelez-mvc> npm run arquitectura

> mvc-notas-lab@1.0.0 arquitectura
> node pruebas/ejecutar.mjs arquitectura


ARQUITECTURA
  ✓ Modelo puro ................................... 4/4
  ✓ Vista pasiva .................................. 5/5
  ✓ Controlador delgado ........................... 6/6

✓ 15 de 15 pruebas pasan.

**Captura de pantalla** de la app con las dos vistas (la tabla/resumen y el termómetro): _(pendiente: tomar la captura de `http://localhost:3000/` con las dos vistas y pegarla aquí)_

## 5. Tres cambios, tres lugares (Parte 5)

Después de cada cambio ejecuta `git diff --stat HEAD~1` (o `git show --stat`) y pega el resultado.
La idea: **cada cambio debía tocar solo las piezas que le corresponden**.

| Cambio | Archivos que tocaste | ¿Era lo esperado? ¿Por qué? |
|---|---|---|
| 5A · Nombres únicos | `src/modelo.js` | Sí: es una regla de negocio y solo el Modelo la conoce; el error aparece en pantalla sin tocar la Vista ni el Controlador. |
| 5B · Segunda vista (termómetro) | `src/termometro-vista.js` (nuevo) y `src/main.js` | Sí: una vista nueva solo necesita suscribirse al Modelo y montarse en la raíz de composición. |
| 5C · Otro almacén | `src/almacen.js` y `src/main.js` | Sí: el Modelo solo exige `cargar()` y `guardar()`, así que cambiar dónde se guarda no lo toca. |

**`git show --stat` de cada cambio:**

```text
# 5A
 src/modelo.js | 3 +++
 1 file changed, 3 insertions(+)
 PS C:\Users\pipidenanopequeño\Desktop\equipo-SebasVelez-mvc> git show --stat --format= f6bc25f
 src/modelo.js | 3 +++
 1 file changed, 3 insertions(+)

# 5B
 src/main.js             |  5 ++++-
 src/termometro-vista.js | 43 +++++++++++++++++++++++++++++++++++++++++++
 2 files changed, 47 insertions(+), 1 deletion(-)

PS C:\Users\pipidenanopequeño\Desktop\equipo-SebasVelez-mvc> git show --stat --format= 0e88cf7
 src/main.js             |  5 ++++-
 src/termometro-vista.js | 43 +++++++++++++++++++++++++++++++++++++++++++
 2 files changed, 47 insertions(+), 1 deletion(-)

# 5C
 src/almacen.js | 21 +++++++++++++++++++++
 src/main.js    |  6 +++---
 2 files changed, 24 insertions(+), 3 deletions(-)
```
PS C:\Users\pipidenanopequeño\Desktop\equipo-SebasVelez-mvc> git show --stat --format= 14aa2c7
 src/almacen.js | 21 +++++++++++++++++++++
 src/main.js    |  6 +++---
 2 files changed, 24 insertions(+), 3 deletions(-)

## 6. Reflexión (Parte 6)

1. En la versión espagueti, ¿qué tuviste que leer o tocar para entender dónde se decide si el estudiante aprobó? ¿Y en la versión MVC?

   **Respuesta:** Para saber dónde se decide si el estudiante aprueba, en el espagueti tuve que leer casi todo el script, porque esa decisión estaba mezclada con el código que dibuja la pantalla y la nota 3.0 aparecía escrita en varios lados. En la versión MVC voy directo a resumen() en modelo.js: ahí se calcula la nota acumulada y el estado, y las notas límite están como constantes al inicio del archivo.

2. ¿Por qué el Modelo **no** debe llamar a `alert()` ni a `document`? ¿Qué pasaría con las pruebas del Modelo si lo hiciera?

   **Respuesta:** Porque alert() y document son cosas de la pantalla y del navegador, y el Modelo solo debe encargarse de los datos y las reglas. Si los usara, las pruebas no podrían correr en la terminal con Node, ya que allá no existen, y tendríamos que abrir un navegador para probar. Además, las reglas quedarían amarradas a una pantalla y no se podrían reutilizar con otra vista.

3. El Modelo avisa de sus cambios sin saber quién escucha (Observer). ¿Qué ganamos con eso frente a que el Modelo llame directamente a `vista.render()`?

   **Respuesta:** Con Observer el Modelo solo avisa “cambié” y las vistas suscritas se redibujan solas, sin que él sepa cuáles son. Eso nos permitió agregar el termómetro sin tocar el Modelo. Si el Modelo llamara directamente a vista.render(), tendría que conocer cada vista y habría que editarlo cada vez que sumáramos una nueva.

4. Elige un olor de MVC (controlador gordo, lógica en la Vista, Modelo que toca la pantalla, Modelo anémico) que te hubiera sido fácil cometer hoy. ¿Cuál y cómo lo evitaron?

   **Respuesta:** El olor que más fácil habría cometido es poner lógica en la Vista, por ejemplo calcular la nota que falta o decidir si aprobó mientras dibujo el resumen. Lo evitamos haciendo que la Vista solo le pida resumen() al Modelo y muestre lo que recibe (el texto y el color según el estado). Las pruebas de arquitectura también ayudan, porque revisan que la Vista y el Controlador no tengan reglas escritas a mano, como comparar con la nota mínima.

5. ¿Para qué tipo de aplicación **no** usarías MVC? Justifica con lo que viste en el laboratorio.

   **Respuesta:** No usaría MVC en una aplicación muy pequeña, como un script de una sola pantalla con casi ninguna regla, porque separar todo en tres piezas agrega archivos y conexiones que no compensan. En este laboratorio sí valió la pena, porque había reglas de negocio, dos vistas distintas y un almacén que podíamos cambiar sin tocar el Modelo.
