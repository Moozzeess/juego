/**
 * Modulo de gestion de turnos y rondas.
 * Controla el orden de juego J1..JN, la asignacion de juez,
 * el salto de jugadores descalificados o retirados, y el cierre de ronda.
 *
 * @module turnos
 */

import { procesarCastigosFinRonda } from './castigos.js'

/**
 * Crea el arreglo inicial de jugadores a partir de una lista de nombres.
 * Cada jugador se inicializa con los valores del estado definido en la seccion 4.
 *
 * @param {string[]} nombres - Lista de nombres de jugadores (unicos y no vacios).
 * @returns {Array<Object>} Arreglo de objetos de jugador con estado inicial.
 */
function crearJugadores(nombres) {
  return nombres.map((nombre) => ({
    nombre,
    liquido_acumulado: 0,
    comodines: 2,
    actividades_cumplidas: 0,
    puntos_negativos: 0,
    castigos_activos: [],
    descalificado: false,
    motivo_descalificacion: null,
    retirado: false,
  }))
}

/**
 * Determina si un jugador esta activo (puede jugar turnos).
 * Un jugador activo no esta descalificado ni retirado.
 *
 * @param {Object} jugador - Objeto de jugador.
 * @returns {boolean} true si el jugador esta activo.
 */
function estaActivo(jugador) {
  return !jugador.descalificado && !jugador.retirado
}

/**
 * Obtiene los indices de todos los jugadores activos.
 *
 * @param {Array<Object>} jugadores - Arreglo de jugadores.
 * @returns {number[]} Indices de jugadores activos.
 */
function obtenerIndicesActivos(jugadores) {
  return jugadores
    .map((jugador, indice) => (estaActivo(jugador) ? indice : -1))
    .filter((indice) => indice !== -1)
}

/**
 * Cuenta la cantidad de jugadores activos.
 *
 * @param {Array<Object>} jugadores - Arreglo de jugadores.
 * @returns {number} Cantidad de jugadores activos.
 */
function contarJugadoresActivos(jugadores) {
  return obtenerIndicesActivos(jugadores).length
}

/**
 * Busca el siguiente jugador activo a partir de un indice dado,
 * recorriendo el arreglo de forma circular.
 *
 * @param {Array<Object>} jugadores - Arreglo de jugadores.
 * @param {number} indiceDesde - Indice desde el cual buscar (exclusivo).
 * @returns {number} Indice del siguiente jugador activo, o -1 si no hay ninguno.
 */
function siguienteJugadorActivo(jugadores, indiceDesde) {
  const total = jugadores.length
  for (let i = 1; i <= total; i++) {
    const indice = (indiceDesde + i) % total
    if (estaActivo(jugadores[indice])) {
      return indice
    }
  }
  return -1
}

/**
 * Determina el indice del juez para un turno dado.
 * El juez es el siguiente jugador activo despues del jugador actual.
 *
 * @param {Array<Object>} jugadores - Arreglo de jugadores.
 * @param {number} indiceJugadorActual - Indice del jugador cuyo turno se esta jugando.
 * @returns {number} Indice del juez, o -1 si no hay otro jugador activo.
 */
function determinarJuez(jugadores, indiceJugadorActual) {
  return siguienteJugadorActivo(jugadores, indiceJugadorActual)
}

/**
 * Determina el siguiente turno en la partida.
 * Si el siguiente jugador activo tiene un indice menor o igual al actual
 * (dio la vuelta), se cierra la ronda primero.
 *
 * @param {Object} estado - Estado completo de la partida (estado_partida).
 * @returns {Object} Nuevo estado con el turno avanzado.
 *   Puede incluir cierre de ronda (contadores de castigo, incremento de ronda_actual).
 *   Cambia la fase a 'cierre' si se cumplen las condiciones de fin de partida.
 */
function avanzarTurno(estado) {
  const nuevoEstado = clonarEstado(estado)
  const { jugadores } = nuevoEstado
  const indiceActual = nuevoEstado.indice_turno

  const indicesActivos = obtenerIndicesActivos(jugadores)

  if (indicesActivos.length < 2) {
    nuevoEstado.fase = 'cierre'
    return nuevoEstado
  }

  const siguienteIndice = siguienteJugadorActivo(jugadores, indiceActual)

  if (siguienteIndice === -1) {
    nuevoEstado.fase = 'cierre'
    return nuevoEstado
  }

  const cierraRonda = siguienteIndice <= indiceActual

  if (cierraRonda) {
    procesarCastigosFinRonda(nuevoEstado)
    nuevoEstado.ronda_actual += 1

    if (nuevoEstado.ronda_actual > nuevoEstado.rondas_totales) {
      nuevoEstado.fase = 'cierre'
      return nuevoEstado
    }
  }

  nuevoEstado.indice_turno = siguienteIndice
  nuevoEstado.jugador_activo = jugadores[siguienteIndice].nombre
  nuevoEstado.juez = jugadores[determinarJuez(jugadores, siguienteIndice)].nombre
  nuevoEstado.turno = {
    paso: 'eleccion',
    actividad: null,
    origen: 'actividad',
  }

  return nuevoEstado
}

/**
 * Inicializa el primer turno de la partida.
 * Asigna el jugador activo y el juez segun el orden J1..JN.
 *
 * @param {Object} estado - Estado de la partida con jugadores ya creados.
 * @returns {Object} Estado con el primer turno configurado.
 */
function iniciarPartida(estado) {
  const nuevoEstado = clonarEstado(estado)
  const { jugadores } = nuevoEstado
  const primerActivo = obtenerIndicesActivos(jugadores)[0]

  if (primerActivo === undefined) {
    nuevoEstado.fase = 'cierre'
    return nuevoEstado
  }

  nuevoEstado.indice_turno = primerActivo
  nuevoEstado.jugador_activo = jugadores[primerActivo].nombre
  nuevoEstado.juez = jugadores[determinarJuez(jugadores, primerActivo)].nombre
  nuevoEstado.fase = 'partida'
  nuevoEstado.ronda_actual = 1
  nuevoEstado.turno = {
    paso: 'eleccion',
    actividad: null,
    origen: 'actividad',
  }

  return nuevoEstado
}

/**
 * Retira a un jugador de la partida voluntariamente.
 * El jugador queda fuera del orden, del ranking y de la ridiculizacion,
 * y no bebe el vaso completo final.
 *
 * @param {Object} estado - Estado de la partida.
 * @param {number} indiceJugador - Indice del jugador que se retira.
 * @returns {Object} Nuevo estado con el jugador marcado como retirado.
 */
function retirarJugador(estado, indiceJugador) {
  const nuevoEstado = clonarEstado(estado)
  nuevoEstado.jugadores[indiceJugador].retirado = true

  if (contarJugadoresActivos(nuevoEstado.jugadores) < 2) {
    nuevoEstado.fase = 'cierre'
  }

  return nuevoEstado
}

/**
 * Crea una copia profunda del estado para garantizar inmutabilidad.
 *
 * @param {Object} estado - Estado a clonar.
 * @returns {Object} Copia profunda del estado.
 */
function clonarEstado(estado) {
  return JSON.parse(JSON.stringify(estado))
}

/**
 * Crea el estado inicial de la partida con la configuracion dada.
 *
 * @param {Object} configuracion - Objeto con total_jugadores, nombres_jugadores, rondas_totales.
 * @param {Object} datos - Objeto con actividades, comodines y castigos cargados.
 * @returns {Object} Estado inicial completo de la partida (estado_partida).
 */
function crearEstadoInicial(configuracion, datos) {
  return {
    fase: 'partida',
    ronda_actual: 1,
    rondas_totales: configuracion.rondas_totales,
    indice_turno: 0,
    jugador_activo: null,
    juez: null,
    turno: {
      paso: 'eleccion',
      actividad: null,
      origen: 'actividad',
    },
    jugadores: crearJugadores(configuracion.nombres_jugadores),
    historial: [],
    desempate: {
      intento: 0,
      minijuego: null,
      participantes: [],
      resultados: [],
    },
    resultado_final: null,
  }
}

export {
  crearJugadores,
  estaActivo,
  obtenerIndicesActivos,
  contarJugadoresActivos,
  siguienteJugadorActivo,
  determinarJuez,
  avanzarTurno,
  iniciarPartida,
  retirarJugador,
  clonarEstado,
  crearEstadoInicial,
}
