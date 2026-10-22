/**
 * Modulo de acciones del turno (reto).
 * Implementa las tres opciones del jugador: aceptar, usar comodin y negarse.
 * Tambien gestiona la confirmacion del juez.
 *
 * @module reto
 */

import { agregarCastigo, esCastigoInmediato, descalificarPorCastigo } from './castigos.js'
import { crearSelectorAleatorio } from './aleatorio.js'

/**
 * Procesa la accion de aceptar el reto (Opcion 1, seccion 3.5).
 * Transiciona el turno al paso 'en_curso', esperando confirmacion del juez.
 *
 * @param {Object} estado - Estado de la partida (copia mutable).
 * @param {Object} actividad - Actividad seleccionada al azar.
 * @returns {Object} Estado actualizado con el turno en paso 'en_curso'.
 */
function aceptarReto(estado, actividad) {
  estado.turno.paso = 'en_curso'
  estado.turno.actividad = actividad
  estado.turno.origen = 'actividad'
  return estado
}

/**
 * Procesa la confirmacion del juez cuando el jugador cumplio la actividad.
 * Suma trago_segundos al liquido_acumulado e incrementa actividades_cumplidas.
 *
 * @param {Object} estado - Estado de la partida (copia mutable).
 * @returns {Object} Estado con el puntaje actualizado y turno en paso 'eleccion'.
 */
function confirmarCumplimiento(estado) {
  const jugador = estado.jugadores[estado.indice_turno]
  const tragoSegundos = estado.turno.actividad.trago_segundos

  jugador.liquido_acumulado += tragoSegundos
  jugador.actividades_cumplidas += 1

  estado.historial.push({
    tipo: 'actividad_cumplida',
    jugador: jugador.nombre,
    actividad: estado.turno.actividad.texto,
    trago_segundos: tragoSegundos,
    origen: estado.turno.origen,
    ronda: estado.ronda_actual,
  })

  estado.turno.paso = 'eleccion'
  return estado
}

/**
 * Procesa la confirmacion del juez cuando el jugador NO cumplio la actividad.
 * Se trata como una negativa (Opcion 3): suma trago, punto negativo y castigo.
 *
 * @param {Object} estado - Estado de la partida (copia mutable).
 * @param {Object} castigo - Castigo seleccionado al azar del archivo de datos.
 * @returns {Object} Estado actualizado con penalizacion aplicada.
 */
function confirmarIncumplimiento(estado, castigo) {
  return negarse(estado, castigo)
}

/**
 * Procesa la accion de usar un comodin (Opcion 2, seccion 3.5).
 *
 * Si el comodin es de tipo 'salvar': el jugador se salva, no suma segundos, el turno termina.
 * Si el comodin es de tipo 'cambiar': sustituye la actividad y espera confirmacion del juez.
 *
 * @param {Object} estado - Estado de la partida (copia mutable).
 * @param {Object} comodin - Comodin seleccionado al azar.
 * @param {string} comodin.efecto - 'salvar' o 'cambiar'.
 * @param {string} comodin.texto - Texto que sustituye la actividad (en caso de 'cambiar').
 * @param {number} [comodin.trago_segundos] - Segundos de trago del comodin (solo para 'cambiar').
 * @returns {{ estado: Object, efecto: string }} Estado actualizado y tipo de efecto aplicado.
 * @throws {Error} Si el jugador no tiene comodines disponibles.
 */
function usarComodin(estado, comodin) {
  const jugador = estado.jugadores[estado.indice_turno]

  if (jugador.comodines <= 0) {
    throw new Error('El jugador no tiene comodines disponibles')
  }

  jugador.comodines -= 1

  if (comodin.efecto === 'salvar') {
    estado.historial.push({
      tipo: 'comodin_salvar',
      jugador: jugador.nombre,
      comodin: comodin.texto,
      ronda: estado.ronda_actual,
    })

    estado.turno.paso = 'eleccion'
    return { estado, efecto: 'salvar' }
  }

  if (comodin.efecto === 'cambiar') {
    estado.turno.actividad = {
      id: comodin.id,
      texto: comodin.texto,
      trago_segundos: comodin.trago_segundos || 0,
    }
    estado.turno.origen = 'comodin_cambiar'
    estado.turno.paso = 'en_curso'

    return { estado, efecto: 'cambiar' }
  }

  throw new Error(`Efecto de comodin no reconocido: ${comodin.efecto}`)
}

/**
 * Procesa la accion de negarse a beber o hacer la actividad (Opcion 3, seccion 3.5).
 * Suma el trago de la actividad, incrementa puntos_negativos y asigna un castigo.
 *
 * Si el castigo es inmediato (duracion_rondas = 0), se espera confirmacion del juez.
 * Si el castigo tiene duracion, se agrega a castigos_activos.
 *
 * @param {Object} estado - Estado de la partida (copia mutable).
 * @param {Object} castigo - Castigo seleccionado al azar del archivo de datos.
 * @returns {Object} Estado actualizado con penalizacion y castigo aplicados.
 */
function negarse(estado, castigo) {
  const jugador = estado.jugadores[estado.indice_turno]
  const tragoSegundos = estado.turno.actividad.trago_segundos

  jugador.liquido_acumulado += tragoSegundos
  jugador.puntos_negativos += 1

  agregarCastigo(jugador, castigo)

  estado.historial.push({
    tipo: 'negativa',
    jugador: jugador.nombre,
    actividad: estado.turno.actividad.texto,
    trago_segundos: tragoSegundos,
    castigo: castigo.texto,
    castigo_inmediato: esCastigoInmediato(castigo),
    ronda: estado.ronda_actual,
  })

  if (esCastigoInmediato(castigo)) {
    estado.turno.paso = 'confirmacion'
    estado.turno.castigo_inmediato = castigo
  } else {
    estado.turno.paso = 'eleccion'
  }

  return estado
}

/**
 * Procesa la confirmacion del juez sobre un castigo inmediato.
 * Si el jugador no cumplio el castigo inmediato, queda descalificado.
 *
 * @param {Object} estado - Estado de la partida (copia mutable).
 * @param {boolean} cumplio - true si el jugador cumplio el castigo inmediato.
 * @returns {Object} Estado actualizado. Si no cumplio, el jugador esta descalificado.
 */
function confirmarCastigoInmediato(estado, cumplio) {
  const jugador = estado.jugadores[estado.indice_turno]

  if (!cumplio) {
    descalificarPorCastigo(jugador)

    estado.historial.push({
      tipo: 'descalificacion',
      jugador: jugador.nombre,
      motivo: 'negarse_castigo',
      ronda: estado.ronda_actual,
    })
  } else {
    const castigosActivos = jugador.castigos_activos
    const ultimoCastigo = castigosActivos[castigosActivos.length - 1]
    if (ultimoCastigo && ultimoCastigo.rondas_restantes === 0) {
      castigosActivos.pop()
    }

    estado.historial.push({
      tipo: 'castigo_inmediato_cumplido',
      jugador: jugador.nombre,
      castigo: estado.turno.castigo_inmediato?.texto,
      ronda: estado.ronda_actual,
    })
  }

  estado.turno.paso = 'eleccion'
  delete estado.turno.castigo_inmediato
  return estado
}

export {
  aceptarReto,
  confirmarCumplimiento,
  confirmarIncumplimiento,
  usarComodin,
  negarse,
  confirmarCastigoInmediato,
}
