/**
 * Modulo de desempate con mini-juegos.
 * Implementa la logica de desempate de la seccion 3.9.1.
 * Los mini-juegos son: cronometro de 5 segundos, ruleta con numero indicado
 * y conteo mental de 10 segundos.
 *
 * @module desempate
 */

import { rngPorDefecto } from './aleatorio.js'

/**
 * Lista de mini-juegos disponibles para desempate.
 * Cada mini-juego tiene un identificador, nombre y objetivo.
 */
const MINIJUEGOS = [
  {
    id: 'cronometro_5s',
    nombre: 'Cronometro en 5 segundos exactos',
    objetivo: 5.0,
    instrucciones: 'Detene el cronometro cuando creas que pasaron 5 segundos.',
  },
  {
    id: 'ruleta_numero',
    nombre: 'Ruleta con numero indicado',
    objetivo: null,
    instrucciones: 'Detene la ruleta lo mas cerca posible del numero indicado.',
  },
  {
    id: 'conteo_10s',
    nombre: 'Contar 10 segundos mentalmente',
    objetivo: 10.0,
    instrucciones: 'Pulsa iniciar y luego detener cuando creas que pasaron 10 segundos.',
  },
]

/**
 * Selecciona un mini-juego al azar para el desempate.
 *
 * @param {Function} [rng=rngPorDefecto] - Funcion generadora de numeros aleatorios.
 * @returns {Object} Mini-juego seleccionado con id, nombre, objetivo e instrucciones.
 */
function seleccionarMinijuego(rng = rngPorDefecto) {
  const indice = Math.floor(rng() * MINIJUEGOS.length)
  const minijuego = { ...MINIJUEGOS[indice] }

  if (minijuego.id === 'ruleta_numero') {
    minijuego.objetivo = Math.floor(rng() * 100) + 1
  }

  return minijuego
}

/**
 * Inicializa el estado de desempate entre los jugadores empatados.
 *
 * @param {Object} estado - Estado de la partida (copia mutable).
 * @param {number[]} indicesEmpatados - Indices de los jugadores empatados en primer lugar.
 * @param {Function} [rng=rngPorDefecto] - Funcion generadora de numeros aleatorios.
 * @returns {Object} Estado con la fase 'desempate' configurada.
 */
function iniciarDesempate(estado, indicesEmpatados, rng = rngPorDefecto) {
  const minijuego = seleccionarMinijuego(rng)

  estado.fase = 'desempate'
  estado.desempate = {
    intento: 1,
    minijuego,
    participantes: indicesEmpatados.map((i) => estado.jugadores[i].nombre),
    resultados: [],
  }

  return estado
}

/**
 * Registra el resultado de un participante en el mini-juego actual.
 *
 * @param {Object} estado - Estado de la partida (copia mutable).
 * @param {string} nombreJugador - Nombre del jugador que participo.
 * @param {number} valorObtenido - Valor que obtuvo el jugador en el mini-juego.
 * @returns {Object} Estado con el resultado registrado.
 */
function registrarResultadoDesempate(estado, nombreJugador, valorObtenido) {
  const { desempate } = estado
  const diferencia = Math.abs(valorObtenido - desempate.minijuego.objetivo)

  desempate.resultados.push({
    jugador: nombreJugador,
    valor: valorObtenido,
    diferencia,
    intento: desempate.intento,
  })

  return estado
}

/**
 * Evalua los resultados del intento actual de desempate.
 * Si hay un ganador claro (menor diferencia al objetivo), se declara ganador.
 * Si persiste el empate y se han agotado 3 intentos, se declaran ganadores compartidos.
 * Si persiste el empate con intentos restantes, se inicia un nuevo intento.
 *
 * @param {Object} estado - Estado de la partida (copia mutable).
 * @param {Function} [rng=rngPorDefecto] - Funcion generadora de numeros aleatorios.
 * @returns {{ estado: Object, ganadores: string[]|null, compartido: boolean }}
 *   - ganadores: nombres de los ganadores, o null si se necesita otro intento.
 *   - compartido: true si se declararon ganadores compartidos tras 3 intentos.
 */
function evaluarDesempate(estado, rng = rngPorDefecto) {
  const { desempate } = estado
  const intentoActual = desempate.intento

  const resultadosIntento = desempate.resultados.filter(
    (r) => r.intento === intentoActual
  )

  if (resultadosIntento.length < desempate.participantes.length) {
    return { estado, ganadores: null, compartido: false }
  }

  const menorDiferencia = Math.min(...resultadosIntento.map((r) => r.diferencia))
  const ganadoresIntento = resultadosIntento.filter(
    (r) => r.diferencia === menorDiferencia
  )

  if (ganadoresIntento.length === 1) {
    estado.fase = 'cierre'
    return {
      estado,
      ganadores: [ganadoresIntento[0].jugador],
      compartido: false,
    }
  }

  if (intentoActual >= 3) {
    estado.fase = 'cierre'
    return {
      estado,
      ganadores: ganadoresIntento.map((r) => r.jugador),
      compartido: true,
    }
  }

  const nuevoMinijuego = seleccionarMinijuego(rng)
  desempate.intento += 1
  desempate.minijuego = nuevoMinijuego
  desempate.participantes = ganadoresIntento.map((r) => r.jugador)

  return { estado, ganadores: null, compartido: false }
}

export {
  MINIJUEGOS,
  seleccionarMinijuego,
  iniciarDesempate,
  registrarResultadoDesempate,
  evaluarDesempate,
}
