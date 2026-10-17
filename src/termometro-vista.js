/**
 * TERMÓMETRO · segunda Vista del mismo Modelo                              (PARTE 5B de la guía)
 *
 * Muestra una barra que se llena según el acumulado, con una línea en la nota mínima.
 * Es una Vista pasiva: lee del Modelo y se suscribe; no cambia nada ni decide reglas.
 */

import { NOTA_MINIMA, NOTA_MAXIMA } from './modelo.js';

export class TermometroVista {
  #modelo;
  #relleno;
  #leyenda;

  constructor(raiz, modelo) {
    this.#modelo = modelo;

    const barra = document.createElement('div');
    barra.className = 'termometro';
    this.#relleno = document.createElement('div');
    this.#relleno.className = 'relleno';
    const linea = document.createElement('div');
    linea.className = 'linea';
    linea.style.left = `${(NOTA_MINIMA / NOTA_MAXIMA) * 100}%`; // la línea siempre marca el mínimo
    barra.append(this.#relleno, linea);

    this.#leyenda = document.createElement('p');
    this.#leyenda.className = 'leyenda';

    raiz.replaceChildren(barra, this.#leyenda);

    this.#modelo.suscribir(() => this.render());
    this.render();
  }

  render() {
    const { acumulado } = this.#modelo.resumen();
    const porcentaje = Math.min(100, (acumulado / NOTA_MAXIMA) * 100);
    this.#relleno.style.width = `${porcentaje}%`;
    this.#leyenda.textContent =
      `${acumulado.toFixed(2)} de ${NOTA_MAXIMA.toFixed(1)} · la línea marca el mínimo para aprobar (${NOTA_MINIMA.toFixed(1)})`;
  }
}
