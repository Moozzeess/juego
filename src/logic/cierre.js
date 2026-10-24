/**
 * Modulo de cierre de partida.
 * Implementa el ranking final, podio, ridiculizacion, reto del vaso completo final
 * y la tabla de estadisticas. Seccion 3.9 del documento de reglas.
 *
 * @module cierre
 */

import { estaActivo } from './turnos.js'
import { evaluarDescalificacionPorInactividad, debeBeberVasoCompleto } from './descalificacion.js'
import { iniciarDesempate } from './desempate.js'
import { rngPorDefecto } from './aleatorio.js'

/**
 * Genera el ranking de jugadores ordenados por liquido_acumulado ascendente.
 * Solo incluye jugadores no descalificados y no retirados.
 * El menor puntaje gana (seccion 3.9, punto 2).
 *
 * @param {Array<Object>} jugadores - Arreglo de jugadores de la partida.
 * @returns {Array<Object>} Jugadores elegibles ordenados por liquido_acumulado ascendente.
 */
function generarRanking(jugadores) {
  return jugadores
    .filter((jugador) => estaActivo(jugador))
    .sort((a, b) => a.liquido_acumulado - b.liquido_acumulado)
}

/**
 * Obtiene los tres mejores puntajes para el podio.
 * El primer lugar recibe el titulo 'EL MENOS PEDO'.
 *
 * @param {Array<Object>} ranking - Ranking ya ordenado por liquido_acumulado.
 * @returns {Array<Object>} Arreglo con hasta 3 jugadores del podio,
 *   cada uno con su posicion y titulo.
 */
function generarPodio(ranking) {
  const titulos = ['EL MENOS PEDO', 'Segundo lugar', 'Tercer lugar']

  return ranking.slice(0, 3).map((jugador, indice) => ({
    posicion: indice + 1,
    titulo: titulos[indice],
    nombre: jugador.nombre,
    liquido_acumulado: jugador.liquido_acumulado,
  }))
}

/**
 * Genera la lista de jugadores que deben ser ridiculizados en el cierre.
 * Incluye jugadores con puntos_negativos > 0 y los descalificados (no retirados).
 *
 * @param {Array<Object>} jugadores - Arreglo de jugadores de la partida.
 * @returns {Array<Object>} Jugadores a ridiculizar con su motivo.
 */
function generarRidiculizacion(jugadores) {
  const ridiculizados = []

  for (const jugador of jugadores) {
    if (jugador.retirado) continue

    if (jugador.descalificado) {
      ridiculizados.push({
        nombre: jugador.nombre,
        motivo: jugador.motivo_descalificacion,
        puntos_negativos: jugador.puntos_negativos,
        tipo: 'descalificado',
      })
    } else if (jugador.puntos_negativos > 0) {
      ridiculizados.push({
        nombre: jugador.nombre,
        motivo: 'puntos_negativos',
        puntos_negativos: jugador.puntos_negativos,
        tipo: 'castigado',
      })
    }
  }

  return ridiculizados
}

/**
 * Genera la lista de jugadores que deben beber el vaso completo final.
 * Segun la seccion 3.9 punto 6: jugadores con puntos_negativos > 0,
 * descalificados y quienes no bebieron nada (liquido_acumulado == 0).
 * Los retirados quedan excluidos (seccion 3.1 punto 3).
 *
 * @param {Array<Object>} jugadores - Arreglo de jugadores de la partida.
 * @returns {Array<Object>} Jugadores que deben beber con su motivo.
 */
function generarRetoVasoCompleto(jugadores) {
  const jugadoresVaso = []

  for (const jugador of jugadores) {
    if (!debeBeberVasoCompleto(jugador)) continue

    const motivos = []
    if (jugador.descalificado) motivos.push('descalificado')
    if (jugador.puntos_negativos > 0) motivos.push('puntos_negativos')
    if (jugador.liquido_acumulado === 0 && !jugador.descalificado) {
      motivos.push('no_bebio_nada')
    }

    jugadoresVaso.push({
      nombre: jugador.nombre,
      motivos,
    })
  }

  return jugadoresVaso
}

/**
 * Genera la tabla completa de estadisticas finales para todos los jugadores.
 *
 * @param {Array<Object>} jugadores - Arreglo de jugadores de la partida.
 * @returns {Array<Object>} Estadisticas de cada jugador.
 */
function generarEstadisticasFinales(jugadores) {
  return jugadores.map((jugador) => ({
    nombre: jugador.nombre,
    liquido_acumulado: jugador.liquido_acumulado,
    actividades_cumplidas: jugador.actividades_cumplidas,
    comodines_restantes: jugador.comodines,
    puntos_negativos: jugador.puntos_negativos,
    descalificado: jugador.descalificado,
    motivo_descalificacion: jugador.motivo_descalificacion,
    retirado: jugador.retirado,
  }))
}

/**
 * Detecta si hay empate en el primer lugar del ranking.
 *
 * @param {Array<Object>} ranking - Ranking ya ordenado por liquido_acumulado.
 * @returns {number[]} Indices (en el ranking) de los jugadores empatados en primer lugar.
 *   Si no hay empate, retorna un arreglo con un solo indice.
 */
function detectarEmpatePrimerLugar(ranking) {
  if (ranking.length === 0) return []

  const puntajePrimero = ranking[0].liquido_acumulado
  const empatados = []

  for (let i = 0; i < ranking.length; i++) {
    if (ranking[i].liquido_acumulado === puntajePrimero) {
      empatados.push(i)
    } else {
      break
    }
  }

  return empatados
}

/**
 * Ejecuta el proceso completo de cierre de la partida.
 * 1. Evalua descalificacion por inactividad.
 * 2. Genera ranking.
 * 3. Detecta empate en primer lugar.
 * 4. Si hay empate, inicia desempate; si no, genera resultado final.
 *
 * @param {Object} estado - Estado de la partida (copia mutable).
 * @param {Function} [rng=rngPorDefecto] - Funcion generadora de numeros aleatorios.
 * @returns {Object} Estado con fase 'cierre' o 'desempate' y resultado_final configurado.
 */
function ejecutarCierre(estado, rng = rngPorDefecto) {
  evaluarDescalificacionPorInactividad(estado)

  const ranking = generarRanking(estado.jugadores)

  if (ranking.length === 0) {
    estado.fase = 'cierre'
    estado.resultado_final = {
      tipo: 'sin_ganador',
      podio: [],
      ridiculizacion: generarRidiculizacion(estado.jugadores),
      vaso_completo: generarRetoVasoCompleto(estado.jugadores),
      estadisticas: generarEstadisticasFinales(estado.jugadores),
    }
    return estado
  }

  const empatados = detectarEmpatePrimerLugar(ranking)

  if (empatados.length > 1) {
    const indicesOriginales = empatados.map((indiceRanking) => {
      const nombreEmpatado = ranking[indiceRanking].nombre
      return estado.jugadores.findIndex((j) => j.nombre === nombreEmpatado)
    })

    return iniciarDesempate(estado, indicesOriginales, rng)
  }

  estado.fase = 'cierre'
  estado.resultado_final = {
    tipo: 'ganador',
    podio: generarPodio(ranking),
    ridiculizacion: generarRidiculizacion(estado.jugadores),
    vaso_completo: generarRetoVasoCompleto(estado.jugadores),
    estadisticas: generarEstadisticasFinales(estado.jugadores),
  }

  return estado
}

/**
 * Finaliza la partida despues del desempate, ya sea con ganador unico o compartido.
 *
 * @param {Object} estado - Estado de la partida (copia mutable).
 * @param {string[]} ganadores - Nombres de los ganadores del desempate.
 * @param {boolean} compartido - true si son ganadores compartidos (empate tras 3 intentos).
 * @returns {Object} Estado con resultado_final configurado.
 */
function finalizarConDesempate(estado, ganadores, compartido) {
  const ranking = generarRanking(estado.jugadores)

  estado.fase = 'cierre'
  estado.resultado_final = {
    tipo: compartido ? 'ganadores_compartidos' : 'ganador',
    ganadores,
    podio: generarPodio(ranking),
    ridiculizacion: generarRidiculizacion(estado.jugadores),
    vaso_completo: generarRetoVasoCompleto(estado.jugadores),
    estadisticas: generarEstadisticasFinales(estado.jugadores),
  }

  return estado
}

export {
  generarRanking,
  generarPodio,
  generarRidiculizacion,
  generarRetoVasoCompleto,
  generarEstadisticasFinales,
  detectarEmpatePrimerLugar,
  ejecutarCierre,
  finalizarConDesempate,
}
