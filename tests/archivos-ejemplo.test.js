/**
 * Prueba de carga de archivos CSV de ejemplo.
 * Verifica que el sistema acepta los archivos con sus columnas originales
 * y genera aleatoriamente la información faltante.
 */

import { describe, it, expect } from 'vitest'
import Papa from 'papaparse'
import { validarArchivoActividades, validarArchivoComodines, validarArchivoCastigos } from '../src/data/validacion.js'

describe('Carga de archivos de ejemplo', () => {
  it('carga actividades.csv con columnas originales', () => {
    const csvContent = `ID,Categoria,Actividad,Descripcion,Participantes
1,Humor y Desafíos Físicos,No Te Rías (El Clásico del Escupitajo),Dos participantes sostienen buches de agua en la boca sin tragárselos mientras el grupo cuenta chistes o anécdotas vergonzosas. Pierde el primero en reírse o escupir.,2 competidores + 1 moderador
2,Humor y Desafíos Físicos,El Reto del Baile Balanceado,Executar pasos de baile o tendencias virales dando un sorbo de su vaso lleno en cada cambio de ritmo sin derramar el líquido.,1 a 3 bailarines`

    const resultados = Papa.parse(csvContent, { header: true })
    const resultado = validarArchivoActividades(resultados.data)

    expect(resultado.valido).toBe(true)
    expect(resultado.datosValidos.length).toBe(2)
    expect(resultado.datosValidos[0].id).toBe('1')
    expect(resultado.datosValidos[0].texto).toBe('Dos participantes sostienen buches de agua en la boca sin tragárselos mientras el grupo cuenta chistes o anécdotas vergonzosas. Pierde el primero en reírse o escupir.')
    expect(resultado.datosValidos[0].trago_segundos).toBeGreaterThan(0)
    expect(resultado.datosValidos[0].trago_segundos).toBeLessThanOrEqual(15)
  })

  it('carga comodines.csv con columnas originales', () => {
    const csvContent = `ID,Nombre,Descripcion_Efecto
C1,Escudo de Agua,Pasa la prueba o reto actual sin sufrir ningún castigo o penalización.
C2,Rebotar (Espejo),"Redirige el reto, la pregunta o la prueba al jugador situado a tu izquierda."
C3,Transferencia,Elige a un compañero voluntario para que cumpla el reto o prueba por ti.`

    const resultados = Papa.parse(csvContent, { header: true })
    const resultado = validarArchivoComodines(resultados.data)

    expect(resultado.valido).toBe(true)
    expect(resultado.datosValidos.length).toBe(3)
    expect(resultado.datosValidos[0].id).toBe('C1')
    expect(resultado.datosValidos[0].texto).toBe('Escudo de Agua')
    expect(resultado.datosValidos[0].efecto).toMatch(/salvar|cambiar/)
  })

  it('carga castigos.csv con columnas originales', () => {
    const csvContent = `ID,Nombre,Descripcion_Penitencia
K1,Pregunta Incómoda,Responder una pregunta secreta e incómoda formulada en consenso por el grupo.
K2,Nota de Voz Ridícula,Enviar un audio cantando o diciendo una frase graciosa al contacto número 3 de tus chats de WhatsApp.
K3,Baile Express,Bailar durante 30 segundos de forma exagerada una canción elegida por la mesa.`

    const resultados = Papa.parse(csvContent, { header: true })
    const resultado = validarArchivoCastigos(resultados.data)

    expect(resultado.valido).toBe(true)
    expect(resultado.datosValidos.length).toBe(3)
    expect(resultado.datosValidos[0].id).toBe('K1')
    expect(resultado.datosValidos[0].texto).toBe('Pregunta Incómoda')
    expect(resultado.datosValidos[0].duracion_rondas).toBeGreaterThan(0)
    expect(resultado.datosValidos[0].duracion_rondas).toBeLessThanOrEqual(5)
  })
})
