/**
 * Prueba 14 (seccion 8): Todos descalificados da partida sin ganador;
 * un solo jugador activo termina la partida.
 */

import { describe, it, expect } from 'vitest'
import { crearEstadoInicial, iniciarPartida, avanzarTurno, contarJugadoresActivos } from '../src/logic/turnos.js'
import { ejecutarCierre } from '../src/logic/cierre.js'

/**
 * Crea un estado de prueba con 3 jugadores y 5 rondas.
 */
function crearEstadoPrueba() {
  const configuracion = {
    nombres_jugadores: ['Ana', 'Bruno', 'Carla'],
    rondas_totales: 5,
  }
  const estado = crearEstadoInicial(configuracion, {})
  return iniciarPartida(estado)
}

describe('Prueba 14: Casos limite de partida', () => {
  it('todos descalificados produce partida sin ganador', () => {
    const estado = crearEstadoPrueba()

    for (const jugador of estado.jugadores) {
      jugador.descalificado = true
      jugador.motivo_descalificacion = 'negarse_castigo'
    }

    const resultado = ejecutarCierre(estado)

    expect(resultado.resultado_final.tipo).toBe('sin_ganador')
    expect(resultado.resultado_final.podio.length).toBe(0)
  })

  it('todos retirados produce partida sin ganador', () => {
    const estado = crearEstadoPrueba()

    for (const jugador of estado.jugadores) {
      jugador.retirado = true
    }

    const resultado = ejecutarCierre(estado)

    expect(resultado.resultado_final.tipo).toBe('sin_ganador')
  })

  it('un solo jugador activo termina la partida al avanzar turno', () => {
    const estado = crearEstadoPrueba()

    estado.jugadores[1].descalificado = true
    estado.jugadores[2].retirado = true

    expect(contarJugadoresActivos(estado.jugadores)).toBe(1)

    estado.turno.actividad = { trago_segundos: 3, texto: 'test' }
    const nuevoEstado = avanzarTurno(estado)

    expect(nuevoEstado.fase).toBe('cierre')
  })

  it('la tabla de estadisticas incluye a todos los jugadores aunque esten descalificados', () => {
    const estado = crearEstadoPrueba()

    estado.jugadores[0].actividades_cumplidas = 2
    estado.jugadores[0].liquido_acumulado = 10
    estado.jugadores[1].descalificado = true
    estado.jugadores[1].motivo_descalificacion = 'negarse_castigo'
    estado.jugadores[2].retirado = true

    const resultado = ejecutarCierre(estado)

    expect(resultado.resultado_final.estadisticas.length).toBe(3)
    const bruno = resultado.resultado_final.estadisticas.find((e) => e.nombre === 'Bruno')
    expect(bruno.descalificado).toBe(true)
  })

  it('el vaso completo final incluye a descalificados pero no a retirados', () => {
    const estado = crearEstadoPrueba()

    estado.jugadores[0].actividades_cumplidas = 2
    estado.jugadores[0].liquido_acumulado = 10
    estado.jugadores[1].descalificado = true
    estado.jugadores[1].motivo_descalificacion = 'negarse_castigo'
    estado.jugadores[2].retirado = true

    const resultado = ejecutarCierre(estado)

    const nombresVaso = resultado.resultado_final.vaso_completo.map((j) => j.nombre)
    expect(nombresVaso).toContain('Bruno')
    expect(nombresVaso).not.toContain('Carla')
  })
})
