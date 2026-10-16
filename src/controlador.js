/**
 * CONTROLADOR · Notas del semestre                                       (PARTE 4 de la guía)
 *
 * SABE: traducir lo que hace el usuario (eventos de la Vista) en órdenes para el Modelo,
 *       y qué mostrar cuando el Modelo rechaza una orden.
 * NO SABE: HTML ni DOM (eso es de la Vista), ni las reglas del negocio (eso es del Modelo).
 *
 * Es "delgado": cada método hace tres cosas como máximo (leer → ordenar → reaccionar).
 */

import { ErrorDeReglas } from './modelo.js';

export class NotasControlador {
  #modelo;
  #vista;

  constructor(modelo, vista) {
    this.#modelo = modelo;
    this.#vista = vista;

    vista.alAgregar((datos) =>
      this.#intentar(
        () => this.#modelo.agregar({ nombre: datos.nombre, peso: this.#aNumero(datos.peso), nota: this.#aNota(datos.nota) }),
        () => this.#vista.limpiarFormulario(),
      ),
    );
    vista.alEliminar((id) => this.#intentar(() => this.#modelo.eliminar(id)));
    vista.alCalificar((id, texto) => this.#intentar(() => this.#modelo.calificar(id, this.#aNota(texto))));
  }

  /** Ejecuta una orden al Modelo y reacciona: error de reglas → mostrarlo; éxito → limpiar. */
  #intentar(orden, alTerminar) {
    try {
      orden();
    } catch (error) {
      if (!(error instanceof ErrorDeReglas)) throw error; // los errores que no son de reglas no se esconden
      this.#vista.mostrarError(error.message);
      this.#vista.render(); // deshace en pantalla lo que el usuario escribió y el Modelo no aceptó
      return;
    }
    this.#vista.limpiarError();
    alTerminar?.();
  }

  /** Texto → número (NaN si no es un número: el Modelo lo rechazará con su mensaje). */
  #aNumero(texto) {
    return parseFloat(texto);
  }

  /** Texto → nota: vacío significa «sin nota» (null). */
  #aNota(texto) {
    return String(texto).trim() === '' ? null : this.#aNumero(texto);
  }
}
