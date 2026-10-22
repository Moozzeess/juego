/**
 * Modulo de carga y validacion de archivos CSV y XLSX.
 * Implementa la validacion descrita en la seccion 3.2 del documento de reglas.
 * Soporta archivos .csv (UTF-8, via PapaParse) y .xlsx (primera hoja, via SheetJS).
 *
 * @module validacion
 */

/**
 * Columnas obligatorias por tipo de archivo segun la seccion 3.2.
 */
const COLUMNAS_OBLIGATORIAS = {
  actividades: ['id', 'texto', 'trago_segundos'],
  comodines: ['id', 'texto', 'efecto'],
  castigos: ['id', 'texto', 'duracion_rondas'],
}

/**
 * Valida que un arreglo de encabezados contenga todas las columnas obligatorias.
 *
 * @param {string[]} encabezados - Nombres de las columnas encontradas.
 * @param {string} tipoArchivo - 'actividades', 'comodines' o 'castigos'.
 * @returns {{ valido: boolean, faltantes: string[] }}
 *   - valido: true si estan todas las columnas requeridas.
 *   - faltantes: arreglo con los nombres de columnas que faltan.
 */
function validarColumnas(encabezados, tipoArchivo) {
  const obligatorias = COLUMNAS_OBLIGATORIAS[tipoArchivo]
  if (!obligatorias) {
    return { valido: false, faltantes: [`Tipo de archivo desconocido: ${tipoArchivo}`] }
  }

  const encabezadosNormalizados = encabezados.map((e) => e.trim().toLowerCase())
  const faltantes = obligatorias.filter(
    (col) => !encabezadosNormalizados.includes(col)
  )

  return {
    valido: faltantes.length === 0,
    faltantes,
  }
}

/**
 * Valida una fila individual del archivo de actividades.
 *
 * @param {Object} fila - Objeto con las propiedades de la fila.
 * @param {number} numeroFila - Numero de fila en el archivo original (para reportar errores).
 * @returns {{ valida: boolean, dato: Object|null, error: string|null }}
 */
function validarFilaActividad(fila, numeroFila) {
  const id = fila.id
  const texto = fila.texto
  const tragoSegundos = parseInt(fila.trago_segundos, 10)

  if (!id && id !== 0) {
    return { valida: false, dato: null, error: `Fila ${numeroFila}: el campo 'id' esta vacio` }
  }

  if (!texto || String(texto).trim() === '') {
    return { valida: false, dato: null, error: `Fila ${numeroFila}: el campo 'texto' esta vacio` }
  }

  if (isNaN(tragoSegundos) || tragoSegundos <= 0) {
    return {
      valida: false,
      dato: null,
      error: `Fila ${numeroFila}: 'trago_segundos' debe ser un entero mayor que 0, se recibio '${fila.trago_segundos}'`,
    }
  }

  return {
    valida: true,
    dato: { id: String(id), texto: String(texto).trim(), trago_segundos: tragoSegundos },
    error: null,
  }
}

/**
 * Valida una fila individual del archivo de comodines.
 *
 * @param {Object} fila - Objeto con las propiedades de la fila.
 * @param {number} numeroFila - Numero de fila en el archivo original.
 * @returns {{ valida: boolean, dato: Object|null, error: string|null }}
 */
function validarFilaComodin(fila, numeroFila) {
  const id = fila.id
  const texto = fila.texto
  const efecto = String(fila.efecto || '').trim().toLowerCase()

  if (!id && id !== 0) {
    return { valida: false, dato: null, error: `Fila ${numeroFila}: el campo 'id' esta vacio` }
  }

  if (!texto || String(texto).trim() === '') {
    return { valida: false, dato: null, error: `Fila ${numeroFila}: el campo 'texto' esta vacio` }
  }

  if (efecto !== 'salvar' && efecto !== 'cambiar') {
    return {
      valida: false,
      dato: null,
      error: `Fila ${numeroFila}: 'efecto' debe ser 'salvar' o 'cambiar', se recibio '${fila.efecto}'`,
    }
  }

  const resultado = {
    id: String(id),
    texto: String(texto).trim(),
    efecto,
  }

  if (efecto === 'cambiar') {
    const tragoSegundos = parseInt(fila.trago_segundos, 10)
    resultado.trago_segundos = isNaN(tragoSegundos) ? 0 : Math.max(0, tragoSegundos)
  }

  return { valida: true, dato: resultado, error: null }
}

/**
 * Valida una fila individual del archivo de castigos.
 *
 * @param {Object} fila - Objeto con las propiedades de la fila.
 * @param {number} numeroFila - Numero de fila en el archivo original.
 * @returns {{ valida: boolean, dato: Object|null, error: string|null }}
 */
function validarFilaCastigo(fila, numeroFila) {
  const id = fila.id
  const texto = fila.texto
  const duracionRaw = fila.duracion_rondas

  if (!id && id !== 0) {
    return { valida: false, dato: null, error: `Fila ${numeroFila}: el campo 'id' esta vacio` }
  }

  if (!texto || String(texto).trim() === '') {
    return { valida: false, dato: null, error: `Fila ${numeroFila}: el campo 'texto' esta vacio` }
  }

  let duracionRondas = 0
  if (duracionRaw !== '' && duracionRaw !== null && duracionRaw !== undefined) {
    duracionRondas = parseInt(duracionRaw, 10)
    if (isNaN(duracionRondas) || duracionRondas < 0) {
      return {
        valida: false,
        dato: null,
        error: `Fila ${numeroFila}: 'duracion_rondas' debe ser un entero >= 0, se recibio '${duracionRaw}'`,
      }
    }
  }

  return {
    valida: true,
    dato: {
      id: String(id),
      texto: String(texto).trim(),
      duracion_rondas: duracionRondas,
    },
    error: null,
  }
}

/**
 * Valida un arreglo completo de filas parseadas segun el tipo de archivo.
 * Omite filas invalidas e informa su numero y motivo.
 *
 * @param {Array<Object>} filas - Arreglo de objetos (filas parseadas del archivo).
 * @param {string} tipoArchivo - 'actividades', 'comodines' o 'castigos'.
 * @returns {{ datos: Array<Object>, errores: string[], valido: boolean }}
 *   - datos: arreglo de filas validas transformadas.
 *   - errores: arreglo de mensajes de error de las filas invalidas.
 *   - valido: true si hay al menos una fila valida.
 */
function validarFilas(filas, tipoArchivo) {
  const validadores = {
    actividades: validarFilaActividad,
    comodines: validarFilaComodin,
    castigos: validarFilaCastigo,
  }

  const validador = validadores[tipoArchivo]
  if (!validador) {
    return { datos: [], errores: [`Tipo de archivo desconocido: ${tipoArchivo}`], valido: false }
  }

  const datos = []
  const errores = []

  for (let i = 0; i < filas.length; i++) {
    const resultado = validador(filas[i], i + 2)
    if (resultado.valida) {
      datos.push(resultado.dato)
    } else {
      errores.push(resultado.error)
    }
  }

  return {
    datos,
    errores,
    valido: datos.length > 0,
  }
}

/**
 * Valida un archivo completo: verifica columnas y luego valida cada fila.
 *
 * @param {Array<Object>} filas - Arreglo de objetos parseados (cada fila como objeto).
 * @param {string} tipoArchivo - 'actividades', 'comodines' o 'castigos'.
 * @returns {{ datos: Array<Object>, errores: string[], valido: boolean, columnasFaltantes: string[] }}
 */
function validarArchivo(filas, tipoArchivo) {
  if (!filas || filas.length === 0) {
    return {
      datos: [],
      errores: ['El archivo esta vacio o no contiene filas'],
      valido: false,
      columnasFaltantes: [],
    }
  }

  const encabezados = Object.keys(filas[0])
  const resultadoColumnas = validarColumnas(encabezados, tipoArchivo)

  if (!resultadoColumnas.valido) {
    return {
      datos: [],
      errores: [`Columnas obligatorias faltantes: ${resultadoColumnas.faltantes.join(', ')}`],
      valido: false,
      columnasFaltantes: resultadoColumnas.faltantes,
    }
  }

  const resultadoFilas = validarFilas(filas, tipoArchivo)

  return {
    datos: resultadoFilas.datos,
    errores: resultadoFilas.errores,
    valido: resultadoFilas.valido,
    columnasFaltantes: [],
  }
}

export {
  COLUMNAS_OBLIGATORIAS,
  validarColumnas,
  validarFilaActividad,
  validarFilaComodin,
  validarFilaCastigo,
  validarFilas,
  validarArchivo,
}
