/**
 * Pruebas 2-5 (seccion 8): Acciones del turno.
 * 2. Aceptar y confirmar 'Cumplio' suma trago_segundos y actividades_cumplidas.
 * 3. Negarse suma trago_segundos, punto negativo y crea un castigo activo.
 * 4. Comodin 'salvar' no suma segundos; comodin 'cambiar' usa su propio trago.
 * 5. Con comodines == 0 la opcion de comodin no se puede ejecutar.
 */

import { describe, it, expect } from 'vitest'
import { crearEstadoInicial, iniciarPartida } from '../src/logic/turnos.js'
import {
  aceptarReto,
  confirmarCumplimiento,
  usarComodin,
  negarse,
} from '../src/logic/reto.js'

/**
 * Crea un estado de prueba con 3 jugadores y 3 rondas, con el turno iniciado.
 */
function crearEstadoPrueba() {
  const configuracion = {
    nombres_jugadores: ['Ana', 'Bruno', 'Carla'],
    rondas_totales: 3,
  }
  const estado = crearEstadoInicial(configuracion, {})
  return iniciarPartida(estado)
}

describe('Prueba 2: Aceptar y confirmar Cumplio', () => {
  it('suma trago_segundos al liquido_acumulado', () => {
    const estado = crearEstadoPrueba()
    const actividad = { id: '1', texto: 'Di un trabalenguas', trago_segundos: 5 }

    aceptarReto(estado, actividad)
    confirmarCumplimiento(estado)

    const jugador = estado.jugadores[0]
    expect(jugador.liquido_acumulado).toBe(5)
  })

  it('incrementa actividades_cumplidas en 1', () => {
    const estado = crearEstadoPrueba()
    const actividad = { id: '1', texto: 'Di un trabalenguas', trago_segundos: 5 }

    aceptarReto(estado, actividad)
    confirmarCumplimiento(estado)

    const jugador = estado.jugadores[0]
    expect(jugador.actividades_cumplidas).toBe(1)
  })

  it('registra la actividad en el historial', () => {
    const estado = crearEstadoPrueba()
    const actividad = { id: '1', texto: 'Di un trabalenguas', trago_segundos: 5 }

    aceptarReto(estado, actividad)
    confirmarCumplimiento(estado)

    expect(estado.historial.length).toBe(1)
    expect(estado.historial[0].tipo).toBe('actividad_cumplida')
    expect(estado.historial[0].trago_segundos).toBe(5)
  })
})

describe('Prueba 3: Negarse suma trago, punto negativo y castigo activo', () => {
  it('suma trago_segundos al liquido_acumulado aunque se niegue', () => {
    const estado = crearEstadoPrueba()
    estado.turno.actividad = { id: '1', texto: 'Di un trabalenguas', trago_segundos: 5 }

    const castigo = { id: 'c1', texto: 'Habla con acento', duracion_rondas: 2 }
    negarse(estado, castigo)

    const jugador = estado.jugadores[0]
    expect(jugador.liquido_acumulado).toBe(5)
  })

  it('incrementa puntos_negativos en 1', () => {
    const estado = crearEstadoPrueba()
    estado.turno.actividad = { id: '1', texto: 'Di un trabalenguas', trago_segundos: 5 }

    const castigo = { id: 'c1', texto: 'Habla con acento', duracion_rondas: 2 }
    negarse(estado, castigo)

    const jugador = estado.jugadores[0]
    expect(jugador.puntos_negativos).toBe(1)
  })

  it('crea un castigo activo con las rondas_restantes correctas', () => {
    const estado = crearEstadoPrueba()
    estado.turno.actividad = { id: '1', texto: 'Di un trabalenguas', trago_segundos: 5 }

    const castigo = { id: 'c1', texto: 'Habla con acento', duracion_rondas: 2 }
    negarse(estado, castigo)

    const jugador = estado.jugadores[0]
    expect(jugador.castigos_activos.length).toBe(1)
    expect(jugador.castigos_activos[0].rondas_restantes).toBe(2)
    expect(jugador.castigos_activos[0].texto).toBe('Habla con acento')
  })
})

describe('Prueba 4: Comodin salvar no suma; comodin cambiar usa su propio trago', () => {
  it('comodin salvar no suma segundos al liquido_acumulado', () => {
    const estado = crearEstadoPrueba()
    estado.turno.actividad = { id: '1', texto: 'Di un trabalenguas', trago_segundos: 5 }

    const comodin = { id: 'w1', texto: 'Te salvaste', efecto: 'salvar' }
    const resultado = usarComodin(estado, comodin)

    const jugador = resultado.estado.jugadores[0]
    expect(jugador.liquido_acumulado).toBe(0)
    expect(resultado.efecto).toBe('salvar')
    expect(jugador.comodines).toBe(1)
  })

  it('comodin cambiar sustituye la actividad con su propio trago_segundos', () => {
    const estado = crearEstadoPrueba()
    estado.turno.actividad = { id: '1', texto: 'Di un trabalenguas', trago_segundos: 5 }

    const comodin = { id: 'w2', texto: 'Reto suave', efecto: 'cambiar', trago_segundos: 2 }
    const resultado = usarComodin(estado, comodin)

    expect(resultado.efecto).toBe('cambiar')
    expect(resultado.estado.turno.actividad.trago_segundos).toBe(2)
    expect(resultado.estado.turno.actividad.texto).toBe('Reto suave')
    expect(resultado.estado.turno.origen).toBe('comodin_cambiar')

    confirmarCumplimiento(resultado.estado)

    const jugador = resultado.estado.jugadores[0]
    expect(jugador.liquido_acumulado).toBe(2)
    expect(jugador.actividades_cumplidas).toBe(1)
  })
})

describe('Prueba 5: Con comodines == 0 no se puede usar comodin', () => {
  it('lanza error si el jugador no tiene comodines', () => {
    const estado = crearEstadoPrueba()
    estado.jugadores[0].comodines = 0
    estado.turno.actividad = { id: '1', texto: 'Di un trabalenguas', trago_segundos: 5 }

    const comodin = { id: 'w1', texto: 'Te salvaste', efecto: 'salvar' }

    expect(() => usarComodin(estado, comodin)).toThrow(
      'El jugador no tiene comodines disponibles'
    )
  })

  it('no modifica el estado si el comodin falla', () => {
    const estado = crearEstadoPrueba()
    estado.jugadores[0].comodines = 0
    estado.turno.actividad = { id: '1', texto: 'Di un trabalenguas', trago_segundos: 5 }

    const comodin = { id: 'w1', texto: 'Te salvaste', efecto: 'salvar' }

    try {
      usarComodin(estado, comodin)
    } catch {
      /* Se espera el error */
    }

    expect(estado.jugadores[0].comodines).toBe(0)
    expect(estado.jugadores[0].liquido_acumulado).toBe(0)
  })
})
