/**
 * Pruebas 6-8 (seccion 8): Castigos.
 * 6. Al cerrar ronda los contadores bajan en 1 y se liberan al llegar a 0.
 * 7. Un jugador puede tener varios castigos activos con contadores independientes.
 * 8. Negarse a cumplir un castigo descalifica de inmediato y saca del orden.
 */

import { describe, it, expect } from 'vitest'
import { crearEstadoInicial, iniciarPartida, contarJugadoresActivos } from '../src/logic/turnos.js'
import { procesarCastigosFinRonda, agregarCastigo, descalificarPorCastigo } from '../src/logic/castigos.js'
import { descalificarPorNegarCastigoActivo } from '../src/logic/descalificacion.js'

/**
 * Crea un estado de prueba con 3 jugadores y 3 rondas.
 */
function crearEstadoPrueba() {
  const configuracion = {
    nombres_jugadores: ['Ana', 'Bruno', 'Carla'],
    rondas_totales: 3,
  }
  const estado = crearEstadoInicial(configuracion, {})
  return iniciarPartida(estado)
}

describe('Prueba 6: Contadores de castigos bajan al cerrar ronda y se liberan al llegar a 0', () => {
  it('decrementa rondas_restantes en 1 al cerrar la ronda', () => {
    const estado = crearEstadoPrueba()

    agregarCastigo(estado.jugadores[0], {
      id: 'c1',
      texto: 'Habla con acento',
      duracion_rondas: 3,
    })

    procesarCastigosFinRonda(estado)

    expect(estado.jugadores[0].castigos_activos[0].rondas_restantes).toBe(2)
  })

  it('libera el castigo cuando rondas_restantes llega a 0', () => {
    const estado = crearEstadoPrueba()

    agregarCastigo(estado.jugadores[0], {
      id: 'c1',
      texto: 'Habla con acento',
      duracion_rondas: 1,
    })

    procesarCastigosFinRonda(estado)

    expect(estado.jugadores[0].castigos_activos.length).toBe(0)
  })

  it('registra el castigo liberado en el historial', () => {
    const estado = crearEstadoPrueba()

    agregarCastigo(estado.jugadores[0], {
      id: 'c1',
      texto: 'Habla con acento',
      duracion_rondas: 1,
    })

    procesarCastigosFinRonda(estado)

    const registro = estado.historial.find((h) => h.tipo === 'castigo_liberado')
    expect(registro).toBeDefined()
    expect(registro.jugador).toBe('Ana')
    expect(registro.castigo).toBe('Habla con acento')
  })
})

describe('Prueba 7: Varios castigos activos con contadores independientes', () => {
  it('un jugador puede tener multiples castigos con contadores separados', () => {
    const estado = crearEstadoPrueba()

    agregarCastigo(estado.jugadores[0], {
      id: 'c1',
      texto: 'Habla con acento',
      duracion_rondas: 3,
    })

    agregarCastigo(estado.jugadores[0], {
      id: 'c2',
      texto: 'No digas la letra A',
      duracion_rondas: 1,
    })

    expect(estado.jugadores[0].castigos_activos.length).toBe(2)

    procesarCastigosFinRonda(estado)

    expect(estado.jugadores[0].castigos_activos.length).toBe(1)
    expect(estado.jugadores[0].castigos_activos[0].texto).toBe('Habla con acento')
    expect(estado.jugadores[0].castigos_activos[0].rondas_restantes).toBe(2)
  })

  it('un castigo nuevo se suma sin reiniciar los existentes', () => {
    const estado = crearEstadoPrueba()

    agregarCastigo(estado.jugadores[0], {
      id: 'c1',
      texto: 'Habla con acento',
      duracion_rondas: 3,
    })

    procesarCastigosFinRonda(estado)
    expect(estado.jugadores[0].castigos_activos[0].rondas_restantes).toBe(2)

    agregarCastigo(estado.jugadores[0], {
      id: 'c2',
      texto: 'No digas la letra A',
      duracion_rondas: 4,
    })

    expect(estado.jugadores[0].castigos_activos.length).toBe(2)
    expect(estado.jugadores[0].castigos_activos[0].rondas_restantes).toBe(2)
    expect(estado.jugadores[0].castigos_activos[1].rondas_restantes).toBe(4)
  })
})

describe('Prueba 8: Negarse a castigo descalifica y saca del orden', () => {
  it('descalifica al jugador con motivo negarse_castigo', () => {
    const estado = crearEstadoPrueba()

    agregarCastigo(estado.jugadores[1], {
      id: 'c1',
      texto: 'Habla con acento',
      duracion_rondas: 3,
    })

    descalificarPorNegarCastigoActivo(estado, 1)

    expect(estado.jugadores[1].descalificado).toBe(true)
    expect(estado.jugadores[1].motivo_descalificacion).toBe('negarse_castigo')
  })

  it('el jugador descalificado sale del orden de turnos', () => {
    const estado = crearEstadoPrueba()

    descalificarPorNegarCastigoActivo(estado, 1)

    expect(contarJugadoresActivos(estado.jugadores)).toBe(2)
    const activos = estado.jugadores
      .filter((j) => !j.descalificado && !j.retirado)
      .map((j) => j.nombre)
    expect(activos).toEqual(['Ana', 'Carla'])
  })

  it('registra la descalificacion en el historial', () => {
    const estado = crearEstadoPrueba()

    descalificarPorNegarCastigoActivo(estado, 1)

    const registro = estado.historial.find((h) => h.tipo === 'descalificacion')
    expect(registro).toBeDefined()
    expect(registro.jugador).toBe('Bruno')
    expect(registro.motivo).toBe('negarse_castigo')
  })
})
