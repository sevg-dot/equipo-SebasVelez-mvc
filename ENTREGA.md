# Entrega · Laboratorio MVC · Notas del semestre

**Equipo:** ______________________  
**Integrantes:** ______________________  
**Repositorio:** ______________________

> Completa este archivo a medida que avanzas (cada sección dice en qué parte de la guía se llena).
> Escribe con tus palabras: las respuestas copiadas de la guía o de otro equipo no cuentan.

---

## 1. Mapa de responsabilidades (Parte 1)

Clasifica cada fragmento de `espagueti.html`: **M** (Modelo), **V** (Vista), **C** (Controlador) o **Mezcla**
(en ese caso, escribe qué roles se mezclan). En "¿Por qué?" justifica en una frase.

| # | Fragmento | Rol(es) | ¿Por qué? |
|---|---|---|---|
| 1 | `var n = document.getElementById('nombre').value.trim();` | Mezcla (V y C) | Lee el valor del DOM (Vista) y lo limpia/prepara para la regla, dentro de la función que reacciona al clic (Controlador). |
| 2 | `if (isNaN(p) \|\| p < 1 \|\| p > 100) { err.textContent = 'El peso debe estar entre 1 y 100.'; return; }` | Mezcla (M y V) | La regla del peso (Modelo) y el mensaje escrito directo en la pantalla con `err.textContent` (Vista) van pegados. |
| 3 | `if (total + p > 100) { err.textContent = '...'; return; }` | Mezcla (M y V) | La regla de la suma de pesos (Modelo) y el mensaje en pantalla se resuelven en la misma línea. |
| 4 | `evals.push({ id: sig++, nombre: n, peso: p, nota: nota });` | M | Es crear y guardar el dato: el estado de las evaluaciones y su numeración son del Modelo. |
| 5 | `localStorage.setItem('notas.v1', JSON.stringify(evals));` | M | Persistir los datos es responsabilidad del Modelo (a través del almacén); aquí está regado por la función. |
| 6 | `document.getElementById('nombre').value = '';` | V | Vaciar un campo del formulario es solo presentación. |
| 7 | `'<input ... onchange="ponerNota(' + e.id + ', this.value)">'` | Mezcla (V y C) | Dibuja un `<input>` (Vista) y le amarra el evento `onchange` con la orden (Controlador) en el mismo texto. |
| 8 | `nec = Math.ceil(nec * 100 - 1e-9) / 100;` | M | Es el cálculo de la nota necesaria, una regla de negocio (redondeo hacia arriba). |
| 9 | `if (acum + 1e-9 >= 3.0) { txt = '¡Aprobado! ...'; cls = 'ok'; }` | Mezcla (M y V) | Decide si aprobó con la nota mínima 3.0 (Modelo) y a la vez elige el texto y la clase CSS (Vista). |
| 10 | `document.getElementById('tabla').innerHTML = filas;` | V | Dibujar la tabla en el DOM. |
| 11 | `function borrar(id) { ...splice...; localStorage.setItem(...); pintar(); }` | Mezcla (M, V y C) | Es el manejador del clic (C), quita la evaluación y guarda en `localStorage` (M) y repinta/limpia el error (V). |
| 12 | `(e.peso * e.nota / 100).toFixed(2)` | Mezcla (M y V) | El cálculo del aporte (peso × nota ÷ 100) es del Modelo y el formato `toFixed(2)` es de la Vista. |

## 2. Olores del espagueti (Parte 1)

Lista **al menos 5** problemas de diseño de `espagueti.html`. Para cada uno, escribe qué consecuencia tiene
cuando el proyecto crece y en qué pieza de MVC viviría la solución.

| Olor | Consecuencia | Dónde se arregla (M, V o C) |
|---|---|---|
| Variables globales (`evals`, `sig`) que cualquier función puede cambiar | Cualquier parte del código puede romper el estado sin pasar por reglas; difícil saber quién lo modificó | M (estado privado dentro de `NotasModelo`) |
| La misma regla escrita en dos funciones (la nota entre 0 y 5 está en `agregar` y en `ponerNota`) | Si cambia la regla hay que acordarse de tocar los dos lugares; uno se olvida y aparecen inconsistencias | M (un solo `#validarNota`) |
| Valores «mágicos» repetidos (3.0, 4.0, 5.0 escritos a mano en varias líneas) | Cambiar la nota mínima obliga a buscar y editar cada aparición; olvidar una da resultados contradictorios | M (constantes `NOTA_MINIMA`, `NOTA_MAXIMA`, `UMBRAL_RIESGO`) |
| HTML armado con texto (`innerHTML` con el nombre del usuario) | El nombre se interpreta como HTML: se rompe la tabla y abre la puerta a inyección de código (XSS) | V (`createElement` y `textContent`) |
| Funciones que hacen tres cosas a la vez (`borrar` cambia datos, guarda y repinta) | Son difíciles de entender, de probar y de reutilizar; un cambio en una cosa afecta a las otras | C (leer → ordenar → reaccionar), con M y V haciendo lo suyo |

## 3. El flujo de «agregar una evaluación» (Parte 6)

Dibuja (a mano y pega una foto, o con texto/Mermaid) el recorrido completo desde que el usuario presiona
**Agregar** hasta que ve la fila nueva en la tabla. Marca en cada paso **el archivo y el método** que actúa.

```text
1. Usuario presiona «Agregar»
      └─ index.html: <form id="form"> dispara el evento `submit`
2. src/vista.js · NotasVista.alAgregar()
      └─ evita recargar (preventDefault) y llama al manejador con NotasVista.leerFormulario()  → { nombre, peso, nota } (texto)
3. src/controlador.js · constructor → manejador de alAgregar
      └─ convierte texto a número (#aNumero / #aNota: vacío = null) y llama a #intentar(orden)
4. src/controlador.js · NotasControlador.#intentar()
      └─ ejecuta la orden: NotasModelo.agregar(...)
5. src/modelo.js · NotasModelo.agregar()
      └─ valida R1–R5 (nombre, peso, nota, suma de pesos); si falla lanza ErrorDeReglas (ver paso 9)
      └─ crea { id, nombre, peso, nota }, lo agrega y llama a #cambio()
6. src/modelo.js · NotasModelo.#cambio()
      ├─ src/almacen.js · AlmacenSesion.guardar()   (persiste)
      └─ avisa a los suscriptores (Observer)
7. Los suscriptores se redibujan solos:
      ├─ src/vista.js · NotasVista.render()           → fila nueva, resumen y estado
      └─ src/termometro-vista.js · TermometroVista.render() → barra y leyenda
8. src/controlador.js · #intentar() (camino feliz)
      └─ NotasVista.limpiarError() y NotasVista.limpiarFormulario()
9. (Camino de error) ErrorDeReglas en el paso 5
      └─ #intentar() captura el error → NotasVista.mostrarError(mensaje) y NotasVista.render(); el formulario conserva lo escrito
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

**Salida de `npm run arquitectura`:**

```text
ARQUITECTURA
  ✓ Modelo puro ................................... 4/4
  ✓ Vista pasiva .................................. 5/5
  ✓ Controlador delgado ........................... 6/6

✓ 15 de 15 pruebas pasan.
```

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

# 5B
 src/main.js             |  5 ++++-
 src/termometro-vista.js | 43 +++++++++++++++++++++++++++++++++++++++++++
 2 files changed, 47 insertions(+), 1 deletion(-)

# 5C
 src/almacen.js | 21 +++++++++++++++++++++
 src/main.js    |  6 +++---
 2 files changed, 24 insertions(+), 3 deletions(-)
```

## 6. Reflexión (Parte 6)

1. En la versión espagueti, ¿qué tuviste que leer o tocar para entender dónde se decide si el estudiante aprobó? ¿Y en la versión MVC?

   **Respuesta:** En el espagueti había que leer todo el `<script>` (`agregar`, `ponerNota` y `pintar`) para entender dónde se decide si aprueba, porque la nota 3.0 aparece escrita dentro de la pantalla y del cálculo. En la versión MVC basta abrir `resumen()` en `modelo.js`: allí está el cálculo y el estado, y las constantes están arriba del archivo.

2. ¿Por qué el Modelo **no** debe llamar a `alert()` ni a `document`? ¿Qué pasaría con las pruebas del Modelo si lo hiciera?

   **Respuesta:** Si el Modelo llamara a `alert()` o `document`, ya no podría correr sin navegador: las pruebas en la terminal fallarían (no existen `document` ni `alert` en Node) y las reglas quedarían atadas a una pantalla concreta. Al mantenerlo puro, lo probamos en milisegundos con 39 pruebas.

3. El Modelo avisa de sus cambios sin saber quién escucha (Observer). ¿Qué ganamos con eso frente a que el Modelo llame directamente a `vista.render()`?

   **Respuesta:** Con Observer el Modelo solo dice «cambié» y no sabe quién escucha. Gracias a eso pudimos agregar el termómetro sin tocar el Modelo; si este llamara a `vista.render()`, cada vista nueva exigiría editarlo y el Modelo dependería de la pantalla.

4. Elige un olor de MVC (controlador gordo, lógica en la Vista, Modelo que toca la pantalla, Modelo anémico) que te hubiera sido fácil cometer hoy. ¿Cuál y cómo lo evitaron?

   **Respuesta:** El olor que era fácil cometer era la lógica en la Vista: calcular la nota necesaria o decidir el estado al dibujar. Lo evitamos dejando que `render()` solo lea `resumen()` y presente (texto y clase CSS por estado); además, las pruebas de arquitectura detectan reglas como `> 4` escritas a mano en la Vista o el Controlador.

5. ¿Para qué tipo de aplicación **no** usarías MVC? Justifica con lo que viste en el laboratorio.

   **Respuesta:** No lo usaría en una aplicación muy pequeña o de un solo uso (un script de una pantalla), donde separar tres piezas agrega más archivos y código de conexión que beneficio, ni en una app con muy poca lógica de negocio. En este laboratorio la separación valió la pena porque había reglas, varias vistas posibles y un almacén intercambiable.
