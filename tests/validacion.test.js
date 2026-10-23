/**
 * Prueba 13 (seccion 8): La validacion acepta archivos con columnas obligatorias minimas
 * y genera aleatoriamente los valores faltantes.
 */

import { describe, it, expect } from 'vitest'
import {
  validarColumnas,
  validarFilas,
  validarArchivo,
  normalizarColumnas,
} from '../src/data/validacion.js'

describe('Prueba 13: Validacion de archivos', () => {
  describe('Validacion de columnas', () => {
    it('acepta archivo de actividades con columnas minimas (id, texto)', () => {
      const encabezados = ['id', 'texto']
      const resultado = validarColumnas(encabezados, 'actividades')

      expect(resultado.valido).toBe(true)
      expect(resultado.faltantes).toEqual([])
    })

    it('acepta archivo de comodines con columnas minimas (id, texto)', () => {
      const encabezados = ['id', 'texto']
      const resultado = validarColumnas(encabezados, 'comodines')

      expect(resultado.valido).toBe(true)
      expect(resultado.faltantes).toEqual([])
    })

    it('rechaza archivo de castigos sin columnas obligatorias', () => {
      const encabezados = ['categoria']
      const resultado = validarColumnas(encabezados, 'castigos')

      expect(resultado.valido).toBe(false)
      expect(resultado.faltantes).toContain('id')
      expect(resultado.faltantes).toContain('texto')
    })

    it('acepta archivo con todas las columnas obligatorias', () => {
      const encabezados = ['id', 'texto', 'trago_segundos']
      const resultado = validarColumnas(encabezados, 'actividades')

      expect(resultado.valido).toBe(true)
      expect(resultado.faltantes).toEqual([])
    })

    it('acepta nombres alternativos de columnas', () => {
      const encabezados = ['ID', 'Actividad']
      const resultado = validarColumnas(encabezados, 'actividades')

      expect(resultado.valido).toBe(true)
      expect(resultado.faltantes).toEqual([])
    })
  })

  describe('Normalizacion de columnas', () => {
    it('mapea nombres de columnas alternativos a nombres internos', () => {
      const encabezados = ['ID', 'Actividad', 'Descripcion']
      const mapeo = normalizarColumnas(encabezados, 'actividades')

      expect(mapeo['ID']).toBe('id')
      expect(mapeo['Actividad']).toBe('texto')
    })

    it('mapea columnas de castigos con nombres alternativos', () => {
      const encabezados = ['ID', 'Nombre', 'Descripcion_Penitencia']
      const mapeo = normalizarColumnas(encabezados, 'castigos')

      expect(mapeo['ID']).toBe('id')
      expect(mapeo['Nombre']).toBe('texto')
    })
  })

  describe('Validacion de filas', () => {
    it('genera trago_segundos aleatorio cuando falta', () => {
      const filas = [
        { id: '1', texto: 'Actividad sin trago' },
      ]

      const resultado = validarFilas(filas, 'actividades', {})

      expect(resultado.datos.length).toBe(1)
      expect(resultado.datos[0].trago_segundos).toBeGreaterThan(0)
      expect(resultado.datos[0].trago_segundos).toBeLessThanOrEqual(15)
    })

    it('omite filas con texto vacio', () => {
      const filas = [
        { id: '1', texto: '' },
        { id: '2', texto: 'Actividad ok' },
      ]

      const resultado = validarFilas(filas, 'actividades', {})

      expect(resultado.datos.length).toBe(1)
      expect(resultado.errores.length).toBe(1)
    })

    it('genera efecto aleatorio para comodines sin efecto', () => {
      const filas = [
        { id: '1', texto: 'Comodin sin efecto' },
      ]

      const resultado = validarFilas(filas, 'comodines', {})

      expect(resultado.datos.length).toBe(1)
      expect(resultado.datos[0].efecto).toMatch(/salvar|cambiar/)
    })

    it('genera duracion_rondas aleatoria cuando falta', () => {
      const filas = [
        { id: '1', texto: 'Castigo sin duracion' },
      ]

      const resultado = validarFilas(filas, 'castigos', {})

      expect(resultado.datos.length).toBe(1)
      expect(resultado.datos[0].duracion_rondas).toBeGreaterThan(0)
      expect(resultado.datos[0].duracion_rondas).toBeLessThanOrEqual(5)
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

    it('acepta archivo con columnas minimas y genera valores faltantes', () => {
      const filas = [
        { id: '1', texto: 'Actividad sin trago' },
        { id: '2', texto: 'Otra actividad' },
      ]

      const resultado = validarArchivo(filas, 'actividades')

      expect(resultado.valido).toBe(true)
      expect(resultado.datos.length).toBe(2)
      expect(resultado.datos[0].trago_segundos).toBeGreaterThan(0)
      expect(resultado.datos[1].trago_segundos).toBeGreaterThan(0)
    })

    it('un archivo sin ninguna fila valida no es valido', () => {
      const filas = [
        { id: '1', texto: '' },
        { id: '', texto: 'Ok' },
      ]

      const resultado = validarArchivo(filas, 'actividades')

      expect(resultado.valido).toBe(false)
    })
  })
})
