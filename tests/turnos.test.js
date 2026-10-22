/**
 * Prueba 1 (seccion 8): El orden de turnos es J1..JN, salta descalificados
 * y retirados, y reinicia con J1 al cerrar la ronda.
 */

import { describe, it, expect } from 'vitest'
import {
  crearJugadores,
  obtenerIndicesActivos,
  siguienteJugadorActivo,
  determinarJuez,
  avanzarTurno,
  iniciarPartida,
  crearEstadoInicial,
} from '../src/logic/turnos.js'

describe('Prueba 1: Orden de turnos, salto de inactivos y cierre de ronda', () => {
  /**
   * Crea un estado de partida basico con 3 jugadores y 3 rondas.
   */
  function crearEstadoBase() {
    const configuracion = {
      nombres_jugadores: ['Ana', 'Bruno', 'Carla'],
      rondas_totales: 3,
    }
    return crearEstadoInicial(configuracion, {})
  }

  it('el orden de turnos sigue J1, J2, J3 de forma secuencial', () => {
    const estado = crearEstadoBase()
    const estadoInicial = iniciarPartida(estado)

    expect(estadoInicial.jugador_activo).toBe('Ana')
    expect(estadoInicial.indice_turno).toBe(0)
  })

  it('el juez es el siguiente jugador activo despues del actual', () => {
    const estado = crearEstadoBase()
    const estadoInicial = iniciarPartida(estado)

    expect(estadoInicial.juez).toBe('Bruno')
  })

  it('salta jugadores descalificados en el orden', () => {
    const estado = crearEstadoBase()
    const estadoInicial = iniciarPartida(estado)
    estadoInicial.jugadores[1].descalificado = true
    estadoInicial.jugadores[1].motivo_descalificacion = 'negarse_castigo'

    const activos = obtenerIndicesActivos(estadoInicial.jugadores)
    expect(activos).toEqual([0, 2])

    const siguiente = siguienteJugadorActivo(estadoInicial.jugadores, 0)
    expect(siguiente).toBe(2)
  })

  it('salta jugadores retirados en el orden', () => {
    const estado = crearEstadoBase()
    const estadoInicial = iniciarPartida(estado)
    estadoInicial.jugadores[1].retirado = true

    const siguiente = siguienteJugadorActivo(estadoInicial.jugadores, 0)
    expect(siguiente).toBe(2)
  })

  it('reinicia con J1 al cerrar la ronda y avanza ronda_actual', () => {
    const estado = crearEstadoBase()
    let estadoActual = iniciarPartida(estado)
    expect(estadoActual.jugador_activo).toBe('Ana')
    expect(estadoActual.ronda_actual).toBe(1)

    estadoActual.turno.actividad = { trago_segundos: 3, texto: 'test' }
    estadoActual = avanzarTurno(estadoActual)
    expect(estadoActual.jugador_activo).toBe('Bruno')

    estadoActual.turno.actividad = { trago_segundos: 3, texto: 'test' }
    estadoActual = avanzarTurno(estadoActual)
    expect(estadoActual.jugador_activo).toBe('Carla')

    estadoActual.turno.actividad = { trago_segundos: 3, texto: 'test' }
    estadoActual = avanzarTurno(estadoActual)
    expect(estadoActual.jugador_activo).toBe('Ana')
    expect(estadoActual.ronda_actual).toBe(2)
  })

  it('pasa a fase cierre cuando ronda_actual supera rondas_totales', () => {
    const configuracion = {
      nombres_jugadores: ['Ana', 'Bruno'],
      rondas_totales: 1,
    }
    let estado = crearEstadoInicial(configuracion, {})
    estado = iniciarPartida(estado)

    estado.turno.actividad = { trago_segundos: 3, texto: 'test' }
    estado = avanzarTurno(estado)
    expect(estado.jugador_activo).toBe('Bruno')

    estado.turno.actividad = { trago_segundos: 3, texto: 'test' }
    estado = avanzarTurno(estado)
    expect(estado.fase).toBe('cierre')
  })
})
