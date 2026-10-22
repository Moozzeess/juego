/**
 * Modulo de reglas de descalificacion y retiro.
 * Implementa las condiciones de la seccion 3.7 del documento de reglas.
 *
 * @module descalificacion
 */

import { estaActivo } from './turnos.js'

/**
 * Descalifica a un jugador por negarse a cumplir un castigo activo.
 * El jugador sale del orden de turnos de inmediato (seccion 3.7, caso 1).
 *
 * @param {Object} estado - Estado de la partida (copia mutable).
 * @param {number} indiceJugador - Indice del jugador que se niega al castigo.
 * @returns {Object} Estado con el jugador descalificado.
 */
function descalificarPorNegarCastigoActivo(estado, indiceJugador) {
  const jugador = estado.jugadores[indiceJugador]
  jugador.descalificado = true
  jugador.motivo_descalificacion = 'negarse_castigo'

  estado.historial.push({
    tipo: 'descalificacion',
    jugador: jugador.nombre,
    motivo: 'negarse_castigo',
    ronda: estado.ronda_actual,
  })

  return estado
}

/**
 * Evalua la descalificacion por cero actividades cumplidas al cierre.
 * Segun la seccion 3.7 caso 2: si un jugador activo termina con
 * actividades_cumplidas == 0, queda descalificado.
 *
 * @param {Object} estado - Estado de la partida (copia mutable).
 * @returns {Object} Estado con los jugadores sin actividades descalificados.
 */
function evaluarDescalificacionPorInactividad(estado) {
  for (const jugador of estado.jugadores) {
    if (estaActivo(jugador) && jugador.actividades_cumplidas === 0) {
      jugador.descalificado = true
      jugador.motivo_descalificacion = 'sin_actividades_cumplidas'

      estado.historial.push({
        tipo: 'descalificacion',
        jugador: jugador.nombre,
        motivo: 'sin_actividades_cumplidas',
        ronda: estado.ronda_actual,
      })
    }
  }

  return estado
}

/**
 * Verifica si un jugador debe beber el vaso completo final.
 * Segun la seccion 3.9 punto 6: beben quienes tienen puntos_negativos > 0,
 * los descalificados y quien no bebio nada (liquido_acumulado == 0).
 * Los retirados NO beben el vaso completo final (seccion 3.1 punto 3).
 *
 * @param {Object} jugador - Objeto del jugador.
 * @returns {boolean} true si el jugador debe beber el vaso completo final.
 */
function debeBeberVasoCompleto(jugador) {
  if (jugador.retirado) return false

  return (
    jugador.puntos_negativos > 0 ||
    jugador.descalificado ||
    jugador.liquido_acumulado === 0
  )
}

export {
  descalificarPorNegarCastigoActivo,
  evaluarDescalificacionPorInactividad,
  debeBeberVasoCompleto,
}
