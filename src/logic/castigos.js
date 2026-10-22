/**
 * Modulo de castigos activos y contadores de rondas.
 * Gestiona la asignacion de castigos, el decremento de contadores al cierre de ronda,
 * la liberacion de castigos vencidos y la descalificacion por negarse a cumplirlos.
 *
 * @module castigos
 */

/**
 * Agrega un castigo activo a un jugador.
 * El castigo se suma a los existentes sin reiniciarlos (seccion 3.6, punto 5).
 *
 * @param {Object} jugador - Objeto del jugador (se modifica directamente).
 * @param {Object} castigo - Castigo seleccionado del archivo de datos.
 * @param {string|number} castigo.id - Identificador del castigo.
 * @param {string} castigo.texto - Descripcion del castigo.
 * @param {number} castigo.duracion_rondas - Rondas de duracion (0 = inmediato).
 * @returns {Object} Objeto del castigo activo con rondas_restantes asignado.
 */
function agregarCastigo(jugador, castigo) {
  const castigoActivo = {
    id: castigo.id,
    texto: castigo.texto,
    rondas_restantes: castigo.duracion_rondas,
  }
  jugador.castigos_activos.push(castigoActivo)
  return castigoActivo
}

/**
 * Determina si un castigo es de cumplimiento inmediato (duracion 0).
 *
 * @param {Object} castigo - Castigo del archivo de datos.
 * @returns {boolean} true si el castigo tiene duracion_rondas igual a 0.
 */
function esCastigoInmediato(castigo) {
  return castigo.duracion_rondas === 0
}

/**
 * Procesa los castigos de todos los jugadores al cerrar una ronda.
 * Decrementa rondas_restantes en 1 para cada castigo activo.
 * Los castigos que llegan a 0 se liberan y se registran en el historial.
 * Modifica el estado directamente (se espera que ya sea una copia).
 *
 * @param {Object} estado - Estado de la partida (copia mutable).
 */
function procesarCastigosFinRonda(estado) {
  const { jugadores, historial } = estado

  for (const jugador of jugadores) {
    if (jugador.descalificado || jugador.retirado) continue

    const castigosVigentes = []

    for (const castigo of jugador.castigos_activos) {
      castigo.rondas_restantes -= 1

      if (castigo.rondas_restantes <= 0) {
        historial.push({
          tipo: 'castigo_liberado',
          jugador: jugador.nombre,
          castigo: castigo.texto,
          ronda: estado.ronda_actual,
        })
      } else {
        castigosVigentes.push(castigo)
      }
    }

    jugador.castigos_activos = castigosVigentes
  }
}

/**
 * Descalifica a un jugador por negarse a cumplir un castigo.
 * Segun la seccion 3.7, el jugador sale del orden de turnos de inmediato.
 *
 * @param {Object} jugador - Objeto del jugador a descalificar (se modifica directamente).
 */
function descalificarPorCastigo(jugador) {
  jugador.descalificado = true
  jugador.motivo_descalificacion = 'negarse_castigo'
}

export {
  agregarCastigo,
  esCastigoInmediato,
  procesarCastigosFinRonda,
  descalificarPorCastigo,
}
