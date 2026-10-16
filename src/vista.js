/**
 * VISTA · Notas del semestre                                             (PARTE 3 de la guía)
 *
 * SABE: dibujar el estado del Modelo en el DOM y avisar qué hizo el usuario (clics, formularios).
 * NO SABE: ninguna regla de negocio, ni cambiar el Modelo, ni guardar datos.
 *
 * Lee del Modelo (solo lectura) y se suscribe a sus cambios para redibujarse sola.
 * El HTML estático (formulario, tabla, resumen) ya está en index.html: aquí solo se rellena y se escucha.
 */

const ESTADOS = {
  aprobado: { clase: 'estado ok', texto: () => '¡Aprobado! Ya aseguraste la nota mínima.' },
  'en-camino': { clase: 'estado en-camino', texto: (n) => `En camino: necesitas ${n.toFixed(2)} en lo que falta.` },
  'en-riesgo': { clase: 'estado riesgo', texto: (n) => `En riesgo: necesitas ${n.toFixed(2)} en lo que falta.` },
  imposible: { clase: 'estado imposible', texto: () => 'Imposible aprobar con las notas actuales.' },
};

const redondear2 = (n) => Math.round(n * 100) / 100;

export class NotasVista {
  #modelo;
  #el;

  constructor(raiz, modelo) {
    this.#modelo = modelo;
    const ids = ['form', 'nombre', 'peso', 'nota', 'error', 'tabla', 'vacio', 'acumulado', 'pesoCalificado', 'pesoPendiente', 'necesaria', 'estado'];
    this.#el = Object.fromEntries(ids.map((id) => [id, raiz.querySelector(`#${id}`)]));
    this.#modelo.suscribir(() => this.render());
    this.render();
  }

  // ---------------------------------------------------------- 3B · Eventos que la Vista ofrece
  alAgregar(manejador) {
    this.#el.form.addEventListener('submit', (evento) => {
      evento.preventDefault();
      manejador(this.leerFormulario());
    });
  }

  alEliminar(manejador) {
    this.#el.tabla.addEventListener('click', (evento) => {
      const boton = evento.target.closest('button[data-eliminar]');
      if (boton) manejador(Number(boton.dataset.eliminar));
    });
  }

  alCalificar(manejador) {
    this.#el.tabla.addEventListener('change', (evento) => {
      const campo = evento.target.closest('input[data-nota]');
      if (campo) manejador(Number(campo.dataset.nota), campo.value);
    });
  }

  // ---------------------------------------------------------- 3C · Órdenes que la Vista obedece
  leerFormulario() {
    return { nombre: this.#el.nombre.value, peso: this.#el.peso.value, nota: this.#el.nota.value };
  }

  limpiarFormulario() {
    this.#el.nombre.value = '';
    this.#el.peso.value = '';
    this.#el.nota.value = '';
  }

  mostrarError(mensaje) {
    this.#el.error.textContent = mensaje;
  }

  limpiarError() {
    this.#el.error.textContent = '';
  }

  // ---------------------------------------------------------- 3D · Dibujar
  /** Dibuja TODO a partir del Modelo. No decide nada: solo presenta. */
  render() {
    const evaluaciones = this.#modelo.evaluaciones;
    const resumen = this.#modelo.resumen();

    // Tabla: createElement + textContent, así un nombre como "<b>hola</b>" se ve como texto.
    this.#el.tabla.replaceChildren(...evaluaciones.map((e) => this.#fila(e)));
    this.#el.vacio.hidden = evaluaciones.length !== 0;

    // Resumen
    this.#el.acumulado.textContent = resumen.acumulado.toFixed(2);
    this.#el.pesoCalificado.textContent = `${redondear2(resumen.pesoCalificado)} %`;
    this.#el.pesoPendiente.textContent = `${redondear2(resumen.pesoPendiente)} %`;
    this.#el.necesaria.textContent = resumen.notaNecesaria === null ? '—' : resumen.notaNecesaria.toFixed(2);

    const estado = ESTADOS[resumen.estado];
    this.#el.estado.textContent = estado.texto(resumen.notaNecesaria);
    this.#el.estado.className = estado.clase;
  }

  #celda(contenido) {
    const td = document.createElement('td');
    if (typeof contenido === 'string') td.textContent = contenido;
    else td.append(contenido);
    return td;
  }

  #fila(e) {
    const campoNota = document.createElement('input');
    campoNota.type = 'number';
    campoNota.step = 'any';
    campoNota.value = e.nota === null ? '' : String(e.nota);
    campoNota.dataset.nota = String(e.id);

    const botonEliminar = document.createElement('button');
    botonEliminar.textContent = 'Eliminar';
    botonEliminar.dataset.eliminar = String(e.id);

    const aporte = e.nota === null ? '—' : ((e.peso * e.nota) / 100).toFixed(2);

    const fila = document.createElement('tr');
    fila.append(this.#celda(e.nombre), this.#celda(`${e.peso} %`), this.#celda(campoNota), this.#celda(aporte), this.#celda(botonEliminar));
    return fila;
  }
}
