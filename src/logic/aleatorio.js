/**
 * Modulo de seleccion aleatoria sin repeticion.
 * Usa el patron Fisher-Yates para barajar y un indice circular
 * que garantiza agotar la lista antes de repetir.
 *
 * @module aleatorio
 */

/**
 * Generador de numeros aleatorios por defecto.
 * Devuelve un valor en el rango [0, 1).
 *
 * @returns {number} Valor aleatorio entre 0 (inclusivo) y 1 (exclusivo).
 */
const rngPorDefecto = () => Math.random()

/**
 * Baraja un arreglo in-place usando el algoritmo Fisher-Yates.
 *
 * @param {Array} arreglo - Arreglo a barajar. Se modifica directamente.
 * @param {Function} rng - Funcion que devuelve un numero en [0, 1).
 * @returns {Array} El mismo arreglo, ya barajado.
 */
function barajar(arreglo, rng) {
  for (let i = arreglo.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    const temporal = arreglo[i]
    arreglo[i] = arreglo[j]
    arreglo[j] = temporal
  }
  return arreglo
}

/**
 * Crea un selector aleatorio sin repeticion para una lista de elementos.
 * Baraja la lista y recorre secuencialmente. Al agotar todos los elementos,
 * vuelve a barajar y reinicia el indice.
 *
 * @param {Array} elementos - Lista original de elementos (no se modifica).
 * @param {Function} [rng=rngPorDefecto] - Funcion generadora de numeros aleatorios inyectable.
 * @returns {{ siguiente: Function, reiniciar: Function }}
 *   - siguiente(): devuelve el proximo elemento sin repetir.
 *   - reiniciar(): vuelve a barajar y reinicia el indice.
 * @throws {Error} Si la lista de elementos esta vacia.
 */
function crearSelectorAleatorio(elementos, rng = rngPorDefecto) {
  if (!elementos || elementos.length === 0) {
    throw new Error('La lista de elementos no puede estar vacia')
  }

  let copia = [...elementos]
  let indice = 0
  barajar(copia, rng)

  return {
    /**
     * Devuelve el siguiente elemento sin repetir.
     * Al agotar la lista, baraja de nuevo y reinicia.
     *
     * @returns {*} Elemento seleccionado.
     */
    siguiente() {
      if (indice >= copia.length) {
        copia = [...elementos]
        barajar(copia, rng)
        indice = 0
      }
      const elemento = copia[indice]
      indice++
      return elemento
    },

    /**
     * Reinicia el selector: baraja de nuevo y vuelve al inicio.
     */
    reiniciar() {
      copia = [...elementos]
      barajar(copia, rng)
      indice = 0
    },
  }
}

export { crearSelectorAleatorio, barajar, rngPorDefecto }
