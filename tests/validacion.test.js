/**
 * Prueba 13 (seccion 8): La validacion rechaza archivos sin columnas obligatorias
 * y omite filas invalidas con su motivo.
 */

import { describe, it, expect } from 'vitest'
import {
  validarColumnas,
  validarFilas,
  validarArchivo,
} from '../src/data/validacion.js'

describe('Prueba 13: Validacion de archivos', () => {
  describe('Validacion de columnas', () => {
    it('rechaza archivo de actividades sin columnas obligatorias', () => {
      const encabezados = ['id', 'texto']
      const resultado = validarColumnas(encabezados, 'actividades')

      expect(resultado.valido).toBe(false)
      expect(resultado.faltantes).toContain('trago_segundos')
    })

    it('rechaza archivo de comodines sin la columna efecto', () => {
      const encabezados = ['id', 'texto']
      const resultado = validarColumnas(encabezados, 'comodines')

      expect(resultado.valido).toBe(false)
      expect(resultado.faltantes).toContain('efecto')
    })

    it('rechaza archivo de castigos sin columnas obligatorias', () => {
      const encabezados = ['nombre']
      const resultado = validarColumnas(encabezados, 'castigos')

      expect(resultado.valido).toBe(false)
      expect(resultado.faltantes).toContain('id')
      expect(resultado.faltantes).toContain('texto')
      expect(resultado.faltantes).toContain('duracion_rondas')
    })

    it('acepta archivo con todas las columnas obligatorias', () => {
      const encabezados = ['id', 'texto', 'trago_segundos']
      const resultado = validarColumnas(encabezados, 'actividades')

      expect(resultado.valido).toBe(true)
      expect(resultado.faltantes).toEqual([])
    })
  })

  describe('Validacion de filas', () => {
    it('omite filas con trago_segundos invalido e informa el motivo', () => {
      const filas = [
        { id: '1', texto: 'Actividad valida', trago_segundos: '5' },
        { id: '2', texto: 'Actividad invalida', trago_segundos: '-1' },
        { id: '3', texto: 'Otra invalida', trago_segundos: 'abc' },
        { id: '4', texto: 'Otra valida', trago_segundos: '3' },
      ]

      const resultado = validarFilas(filas, 'actividades')

      expect(resultado.datos.length).toBe(2)
      expect(resultado.errores.length).toBe(2)
      expect(resultado.errores[0]).toContain('Fila 3')
      expect(resultado.errores[1]).toContain('Fila 4')
    })

    it('omite filas con texto vacio', () => {
      const filas = [
        { id: '1', texto: '', trago_segundos: '5' },
        { id: '2', texto: 'Actividad ok', trago_segundos: '3' },
      ]

      const resultado = validarFilas(filas, 'actividades')

      expect(resultado.datos.length).toBe(1)
      expect(resultado.errores.length).toBe(1)
    })

    it('valida comodines con efecto invalido', () => {
      const filas = [
        { id: '1', texto: 'Te salvaste', efecto: 'salvar' },
        { id: '2', texto: 'Efecto raro', efecto: 'volar' },
      ]

      const resultado = validarFilas(filas, 'comodines')

      expect(resultado.datos.length).toBe(1)
      expect(resultado.errores.length).toBe(1)
      expect(resultado.errores[0]).toContain("'efecto'")
    })

    it('castigos con duracion_rondas vacia se interpretan como 0', () => {
      const filas = [
        { id: '1', texto: 'Castigo rapido', duracion_rondas: '' },
      ]

      const resultado = validarFilas(filas, 'castigos')

      expect(resultado.datos.length).toBe(1)
      expect(resultado.datos[0].duracion_rondas).toBe(0)
    })
  })

  describe('Validacion de archivo completo', () => {
    it('rechaza archivo sin columnas y reporta las faltantes', () => {
      const filas = [{ nombre: 'algo' }]

      const resultado = validarArchivo(filas, 'actividades')

      expect(resultado.valido).toBe(false)
      expect(resultado.columnasFaltantes.length).toBeGreaterThan(0)
    })

    it('rechaza archivo vacio', () => {
      const resultado = validarArchivo([], 'actividades')

      expect(resultado.valido).toBe(false)
      expect(resultado.errores.length).toBeGreaterThan(0)
    })

    it('acepta archivo valido con filas correctas', () => {
      const filas = [
        { id: '1', texto: 'Actividad 1', trago_segundos: '5' },
        { id: '2', texto: 'Actividad 2', trago_segundos: '3' },
      ]

      const resultado = validarArchivo(filas, 'actividades')

      expect(resultado.valido).toBe(true)
      expect(resultado.datos.length).toBe(2)
      expect(resultado.errores.length).toBe(0)
    })

    it('un archivo sin ninguna fila valida no es valido', () => {
      const filas = [
        { id: '1', texto: '', trago_segundos: '5' },
        { id: '2', texto: 'Ok', trago_segundos: '-1' },
      ]

      const resultado = validarArchivo(filas, 'actividades')

      expect(resultado.valido).toBe(false)
    })
  })
})
