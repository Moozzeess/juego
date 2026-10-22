/**
 * Pruebas 9-12 (seccion 8): Cierre de partida.
 * 9. Terminar con actividades_cumplidas == 0 descalifica al cierre.
 * 10. Gana el menor liquido_acumulado entre no descalificados.
 * 11. Empate en primer lugar activa desempate; tras 3 intentos ganadores compartidos.
 * 12. El vaso completo final lo beben quienes tienen puntos_negativos > 0,
 *     los descalificados y quien no bebio nada.
 */

import { describe, it, expect } from 'vitest'
import { crearEstadoInicial, iniciarPartida } from '../src/logic/turnos.js'
import {
  generarRanking,
  generarPodio,
  generarRetoVasoCompleto,
  detectarEmpatePrimerLugar,
  ejecutarCierre,
  finalizarConDesempate,
} from '../src/logic/cierre.js'
import { evaluarDescalificacionPorInactividad } from '../src/logic/descalificacion.js'
import {
  iniciarDesempate,
  registrarResultadoDesempate,
  evaluarDesempate,
} from '../src/logic/desempate.js'

/**
 * Crea un estado de prueba con 4 jugadores y 3 rondas, con turno iniciado.
 */
function crearEstadoPrueba() {
  const configuracion = {
    nombres_jugadores: ['Ana', 'Bruno', 'Carla', 'Diana'],
    rondas_totales: 3,
  }
  const estado = crearEstadoInicial(configuracion, {})
  return iniciarPartida(estado)
}

describe('Prueba 9: actividades_cumplidas == 0 descalifica al cierre', () => {
  it('descalifica jugadores sin actividades cumplidas al cerrar', () => {
    const estado = crearEstadoPrueba()

    estado.jugadores[0].actividades_cumplidas = 2
    estado.jugadores[0].liquido_acumulado = 10
    estado.jugadores[1].actividades_cumplidas = 0
    estado.jugadores[1].liquido_acumulado = 0
    estado.jugadores[2].actividades_cumplidas = 1
    estado.jugadores[2].liquido_acumulado = 5
    estado.jugadores[3].actividades_cumplidas = 3
    estado.jugadores[3].liquido_acumulado = 15

    evaluarDescalificacionPorInactividad(estado)

    expect(estado.jugadores[1].descalificado).toBe(true)
    expect(estado.jugadores[1].motivo_descalificacion).toBe('sin_actividades_cumplidas')
    expect(estado.jugadores[0].descalificado).toBe(false)
    expect(estado.jugadores[2].descalificado).toBe(false)
  })
})

describe('Prueba 10: Gana el menor liquido_acumulado entre no descalificados', () => {
  it('el ranking ordena por liquido_acumulado ascendente', () => {
    const estado = crearEstadoPrueba()

    estado.jugadores[0].actividades_cumplidas = 2
    estado.jugadores[0].liquido_acumulado = 10
    estado.jugadores[1].actividades_cumplidas = 1
    estado.jugadores[1].liquido_acumulado = 3
    estado.jugadores[2].actividades_cumplidas = 3
    estado.jugadores[2].liquido_acumulado = 15
    estado.jugadores[3].actividades_cumplidas = 1
    estado.jugadores[3].liquido_acumulado = 7

    const ranking = generarRanking(estado.jugadores)

    expect(ranking[0].nombre).toBe('Bruno')
    expect(ranking[0].liquido_acumulado).toBe(3)
  })

  it('excluye descalificados del ranking pero incluye jugadores con castigos', () => {
    const estado = crearEstadoPrueba()

    estado.jugadores[0].actividades_cumplidas = 2
    estado.jugadores[0].liquido_acumulado = 10
    estado.jugadores[0].puntos_negativos = 3

    estado.jugadores[1].descalificado = true
    estado.jugadores[1].liquido_acumulado = 1

    estado.jugadores[2].actividades_cumplidas = 1
    estado.jugadores[2].liquido_acumulado = 5

    estado.jugadores[3].actividades_cumplidas = 1
    estado.jugadores[3].liquido_acumulado = 20

    const ranking = generarRanking(estado.jugadores)

    expect(ranking.length).toBe(3)
    expect(ranking.find((j) => j.nombre === 'Bruno')).toBeUndefined()
    expect(ranking[0].nombre).toBe('Carla')
  })

  it('el primer lugar del podio es EL MENOS HIDRATADO', () => {
    const estado = crearEstadoPrueba()

    estado.jugadores[0].actividades_cumplidas = 2
    estado.jugadores[0].liquido_acumulado = 10
    estado.jugadores[1].actividades_cumplidas = 1
    estado.jugadores[1].liquido_acumulado = 3
    estado.jugadores[2].actividades_cumplidas = 3
    estado.jugadores[2].liquido_acumulado = 15
    estado.jugadores[3].actividades_cumplidas = 1
    estado.jugadores[3].liquido_acumulado = 7

    const ranking = generarRanking(estado.jugadores)
    const podio = generarPodio(ranking)

    expect(podio[0].titulo).toBe('EL MENOS HIDRATADO')
    expect(podio[0].nombre).toBe('Bruno')
  })
})

describe('Prueba 11: Empate en primer lugar y desempate', () => {
  it('detecta empate cuando dos jugadores tienen el mismo menor puntaje', () => {
    const estado = crearEstadoPrueba()

    estado.jugadores[0].actividades_cumplidas = 1
    estado.jugadores[0].liquido_acumulado = 5
    estado.jugadores[1].actividades_cumplidas = 1
    estado.jugadores[1].liquido_acumulado = 5
    estado.jugadores[2].actividades_cumplidas = 1
    estado.jugadores[2].liquido_acumulado = 10
    estado.jugadores[3].actividades_cumplidas = 1
    estado.jugadores[3].liquido_acumulado = 15

    const ranking = generarRanking(estado.jugadores)
    const empatados = detectarEmpatePrimerLugar(ranking)

    expect(empatados.length).toBe(2)
  })

  it('ejecutarCierre inicia desempate cuando hay empate en primer lugar', () => {
    const estado = crearEstadoPrueba()

    estado.jugadores[0].actividades_cumplidas = 1
    estado.jugadores[0].liquido_acumulado = 5
    estado.jugadores[1].actividades_cumplidas = 1
    estado.jugadores[1].liquido_acumulado = 5
    estado.jugadores[2].actividades_cumplidas = 1
    estado.jugadores[2].liquido_acumulado = 10
    estado.jugadores[3].actividades_cumplidas = 1
    estado.jugadores[3].liquido_acumulado = 15

    const rngFija = () => 0.1
    const resultado = ejecutarCierre(estado, rngFija)

    expect(resultado.fase).toBe('desempate')
    expect(resultado.desempate.participantes.length).toBe(2)
    expect(resultado.desempate.intento).toBe(1)
  })

  it('tras 3 intentos de empate se declaran ganadores compartidos', () => {
    const estado = crearEstadoPrueba()

    estado.jugadores[0].actividades_cumplidas = 1
    estado.jugadores[0].liquido_acumulado = 5
    estado.jugadores[1].actividades_cumplidas = 1
    estado.jugadores[1].liquido_acumulado = 5
    estado.jugadores[2].actividades_cumplidas = 1
    estado.jugadores[2].liquido_acumulado = 10
    estado.jugadores[3].actividades_cumplidas = 1
    estado.jugadores[3].liquido_acumulado = 15

    const rngFija = () => 0.5
    iniciarDesempate(estado, [0, 1], rngFija)

    registrarResultadoDesempate(estado, 'Ana', 7.5)
    registrarResultadoDesempate(estado, 'Bruno', 7.5)
    let resultado = evaluarDesempate(estado, rngFija)
    expect(resultado.ganadores).toBeNull()

    registrarResultadoDesempate(estado, 'Ana', 7.5)
    registrarResultadoDesempate(estado, 'Bruno', 7.5)
    resultado = evaluarDesempate(estado, rngFija)
    expect(resultado.ganadores).toBeNull()

    registrarResultadoDesempate(estado, 'Ana', 7.5)
    registrarResultadoDesempate(estado, 'Bruno', 7.5)
    resultado = evaluarDesempate(estado, rngFija)

    expect(resultado.compartido).toBe(true)
    expect(resultado.ganadores).toContain('Ana')
    expect(resultado.ganadores).toContain('Bruno')
  })

  it('un ganador claro en el desempate termina el proceso', () => {
    const estado = crearEstadoPrueba()

    estado.jugadores[0].actividades_cumplidas = 1
    estado.jugadores[0].liquido_acumulado = 5
    estado.jugadores[1].actividades_cumplidas = 1
    estado.jugadores[1].liquido_acumulado = 5
    estado.jugadores[2].actividades_cumplidas = 1
    estado.jugadores[2].liquido_acumulado = 10
    estado.jugadores[3].actividades_cumplidas = 1
    estado.jugadores[3].liquido_acumulado = 15

    const rngFija = () => 0.5
    iniciarDesempate(estado, [0, 1], rngFija)

    registrarResultadoDesempate(estado, 'Ana', 5.1)
    registrarResultadoDesempate(estado, 'Bruno', 7.0)

    const resultado = evaluarDesempate(estado, rngFija)

    expect(resultado.compartido).toBe(false)
    expect(resultado.ganadores).toEqual(['Ana'])
    expect(resultado.estado.fase).toBe('cierre')
  })
})

describe('Prueba 12: Vaso completo final', () => {
  it('quienes tienen puntos_negativos > 0 beben el vaso completo', () => {
    const estado = crearEstadoPrueba()

    estado.jugadores[0].actividades_cumplidas = 2
    estado.jugadores[0].liquido_acumulado = 10
    estado.jugadores[0].puntos_negativos = 2

    estado.jugadores[1].actividades_cumplidas = 1
    estado.jugadores[1].liquido_acumulado = 5
    estado.jugadores[1].puntos_negativos = 0

    estado.jugadores[2].actividades_cumplidas = 1
    estado.jugadores[2].liquido_acumulado = 8
    estado.jugadores[2].puntos_negativos = 0

    estado.jugadores[3].actividades_cumplidas = 1
    estado.jugadores[3].liquido_acumulado = 12
    estado.jugadores[3].puntos_negativos = 0

    const vaso = generarRetoVasoCompleto(estado.jugadores)
    const nombres = vaso.map((j) => j.nombre)

    expect(nombres).toContain('Ana')
    expect(nombres).not.toContain('Bruno')
  })

  it('los descalificados beben el vaso completo', () => {
    const estado = crearEstadoPrueba()

    estado.jugadores[0].actividades_cumplidas = 2
    estado.jugadores[0].liquido_acumulado = 10
    estado.jugadores[1].descalificado = true
    estado.jugadores[1].liquido_acumulado = 5
    estado.jugadores[2].actividades_cumplidas = 1
    estado.jugadores[2].liquido_acumulado = 8
    estado.jugadores[3].actividades_cumplidas = 1
    estado.jugadores[3].liquido_acumulado = 12

    const vaso = generarRetoVasoCompleto(estado.jugadores)
    const nombres = vaso.map((j) => j.nombre)

    expect(nombres).toContain('Bruno')
  })

  it('quien no bebio nada (liquido_acumulado == 0) bebe el vaso completo', () => {
    const estado = crearEstadoPrueba()

    estado.jugadores[0].actividades_cumplidas = 2
    estado.jugadores[0].liquido_acumulado = 10
    estado.jugadores[1].actividades_cumplidas = 1
    estado.jugadores[1].liquido_acumulado = 5
    estado.jugadores[2].actividades_cumplidas = 1
    estado.jugadores[2].liquido_acumulado = 0
    estado.jugadores[3].actividades_cumplidas = 1
    estado.jugadores[3].liquido_acumulado = 12

    const vaso = generarRetoVasoCompleto(estado.jugadores)
    const nombres = vaso.map((j) => j.nombre)

    expect(nombres).toContain('Carla')
  })

  it('los retirados NO beben el vaso completo', () => {
    const estado = crearEstadoPrueba()

    estado.jugadores[0].actividades_cumplidas = 2
    estado.jugadores[0].liquido_acumulado = 10
    estado.jugadores[1].retirado = true
    estado.jugadores[1].puntos_negativos = 5
    estado.jugadores[2].actividades_cumplidas = 1
    estado.jugadores[2].liquido_acumulado = 8
    estado.jugadores[3].actividades_cumplidas = 1
    estado.jugadores[3].liquido_acumulado = 12

    const vaso = generarRetoVasoCompleto(estado.jugadores)
    const nombres = vaso.map((j) => j.nombre)

    expect(nombres).not.toContain('Bruno')
  })
})
