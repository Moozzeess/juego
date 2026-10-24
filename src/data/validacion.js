/**
 * Modulo de carga y validacion de archivos CSV y XLSX.
 * Implementa la validacion descrita en la seccion 3.2 del documento de reglas.
 * Soporta archivos .csv (UTF-8, via PapaParse) y .xlsx (primera hoja, via SheetJS).
 *
 * @module validacion
 */

/**
 * Mapeo de columnas alternativas a nombres internos del sistema.
 * Permite aceptar archivos con diferentes nombres de columnas.
 */
const MAPEO_COLUMNAS = {
  actividades: {
    id: ['id', 'ID', 'Id'],
    texto: ['Actividad', 'actividad', 'Nombre', 'nombre', 'texto'],
    descripcion: ['Descripcion', 'descripcion', 'Detalle', 'detalle'],
    categoria: ['Categoria', 'categoria', 'Tipo', 'tipo'],
    participantes: ['Participantes', 'participantes'],
    trago_segundos: ['trago_segundos', 'Trago_Segundos', 'segundos', 'duracion'],
    minijuego: ['minijuego', 'Minijuego', 'juego', 'Juego']
  },
  comodines: {
    id: ['id', 'ID', 'Id'],
    nombre: ['Nombre', 'nombre'],
    texto: ['Descripcion_Efecto', 'descripcion_efecto', 'texto', 'Efecto_Descripcion'],
    efecto: ['efecto', 'Efecto', 'tipo', 'Tipo'],
    trago_segundos: ['trago_segundos', 'Trago_Segundos', 'segundos', 'duracion']
  },
  castigos: {
    id: ['id', 'ID', 'Id'],
    nombre: ['Nombre', 'nombre'],
    texto: ['Descripcion_Penitencia', 'descripcion_penitencia', 'texto', 'Penitencia', 'penitencia'],
    duracion_rondas: ['duracion_rondas', 'Duracion_Rondas', 'rondas', 'duracion']
  }
}

/**
 * Columnas obligatorias por tipo de archivo segun la seccion 3.2.
 */
const COLUMNAS_OBLIGATORIAS = {
  actividades: ['id', 'texto'],
  comodines: ['id', 'texto'],
  castigos: ['id', 'texto'],
}

/**
 * Normaliza los nombres de columnas del archivo a los nombres internos del sistema.
 *
 * @param {string[]} encabezados - Nombres de las columnas encontradas en el archivo.
 * @param {string} tipoArchivo - 'actividades', 'comodines' o 'castigos'.
 * @returns {Object} Objeto con mapeo de nombre archivo -> nombre interno.
 */
function normalizarColumnas(encabezados, tipoArchivo) {
  const mapeo = MAPEO_COLUMNAS[tipoArchivo]
  if (!mapeo) {
    return {}
  }

  const resultado = {}
  const encabezadosUsados = new Set()
  
  for (const [nombreInterno, alternativas] of Object.entries(mapeo)) {
    for (const encabezado of encabezados) {
      if (!encabezadosUsados.has(encabezado) && alternativas.includes(encabezado)) {
        resultado[encabezado] = nombreInterno
        encabezadosUsados.add(encabezado)
        break
      }
    }
  }
  
  return resultado
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

  const mapeoColumnas = normalizarColumnas(encabezados, tipoArchivo)
  const nombresInternosEncontrados = Object.values(mapeoColumnas)
  
  const faltantes = obligatorias.filter((col) => {
    if (nombresInternosEncontrados.includes(col)) {
      return false
    }
    // Si falta texto en comodines o castigos, pero existe 'nombre', es valido
    if (col === 'texto' && nombresInternosEncontrados.includes('nombre')) {
      return false
    }
    return true
  })

  return {
    valido: faltantes.length === 0,
    faltantes,
  }
}

/**
 * Genera un valor aleatorio de trago en segundos entre 3 y 15.
 *
 * @returns {number} Valor aleatorio de segundos.
 */
function generarTragoSegundosAleatorio() {
  return Math.floor(Math.random() * 13) + 3 // Entre 3 y 15 segundos
}

/**
 * Genera un efecto aleatorio para comodines: 'salvar' o 'cambiar'.
 *
 * @returns {string} 'salvar' o 'cambiar'.
 */
function generarEfectoAleatorio() {
  return Math.random() < 0.5 ? 'salvar' : 'cambiar'
}

/**
 * Genera una duracion aleatoria de rondas entre 1 y 5.
 *
 * @returns {number} Valor aleatorio de rondas.
 */
function generarDuracionRondasAleatoria() {
  return Math.floor(Math.random() * 5) + 1 // Entre 1 y 5 rondas
}

/**
 * Transforma una fila usando el mapeo de columnas.
 *
 * @param {Object} fila - Objeto con las propiedades originales.
 * @param {Object} mapeoColumnas - Mapeo de nombre archivo -> nombre interno.
 * @returns {Object} Fila con nombres de columnas normalizados.
 */
function transformarFila(fila, mapeoColumnas) {
  const transformada = {}
  
  for (const [nombreOriginal, valor] of Object.entries(fila)) {
    const nombreInterno = mapeoColumnas[nombreOriginal]
    if (nombreInterno) {
      transformada[nombreInterno] = valor
    } else {
      transformada[nombreOriginal] = valor
    }
  }
  
  return transformada
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
  const descripcion = fila.descripcion ? String(fila.descripcion).trim() : ''
  const categoria = fila.categoria ? String(fila.categoria).trim() : ''
  const participantes = fila.participantes ? String(fila.participantes).trim() : ''
  const minijuego = fila.minijuego ? String(fila.minijuego).trim() : ''
  let tragoSegundos = fila.trago_segundos ? parseInt(fila.trago_segundos, 10) : null

  if (!id && id !== 0) {
    return { valida: false, dato: null, error: `Fila ${numeroFila}: el campo 'id' esta vacio` }
  }

  if (!texto || String(texto).trim() === '') {
    return { valida: false, dato: null, error: `Fila ${numeroFila}: el campo 'texto' esta vacio` }
  }

  // Si no hay trago_segundos, generar aleatoriamente
  if (isNaN(tragoSegundos) || tragoSegundos <= 0) {
    tragoSegundos = generarTragoSegundosAleatorio()
  }

  const dato = {
    id: String(id),
    texto: String(texto).trim(),
    trago_segundos: tragoSegundos
  }

  if (descripcion) {
    dato.descripcion = descripcion
  }
  if (categoria) {
    dato.categoria = categoria
  }
  if (participantes) {
    dato.participantes = participantes
  }
  if (minijuego) {
    dato.minijuego = minijuego
  }

  return {
    valida: true,
    dato,
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
  const texto = fila.texto || fila.nombre
  const nombre = fila.nombre ? String(fila.nombre).trim() : ''
  let efecto = fila.efecto ? String(fila.efecto).trim().toLowerCase() : null

  if (!id && id !== 0) {
    return { valida: false, dato: null, error: `Fila ${numeroFila}: el campo 'id' esta vacio` }
  }

  if (!texto || String(texto).trim() === '') {
    return { valida: false, dato: null, error: `Fila ${numeroFila}: el campo 'texto' esta vacio` }
  }

  // Si no hay efecto o no es valido, generar aleatoriamente
  if (!efecto || (efecto !== 'salvar' && efecto !== 'cambiar')) {
    efecto = generarEfectoAleatorio()
  }

  const resultado = {
    id: String(id),
    nombre: nombre || String(texto).trim(),
    texto: String(texto).trim(),
    efecto,
  }

  if (efecto === 'cambiar') {
    const tragoSegundos = fila.trago_segundos ? parseInt(fila.trago_segundos, 10) : null
    resultado.trago_segundos = isNaN(tragoSegundos) ? generarTragoSegundosAleatorio() : Math.max(0, tragoSegundos)
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
  const texto = fila.texto || fila.nombre
  const nombre = fila.nombre ? String(fila.nombre).trim() : ''
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
      duracionRondas = generarDuracionRondasAleatoria()
    }
  } else {
    // Si no hay duracion_rondas, generar aleatoriamente
    duracionRondas = generarDuracionRondasAleatoria()
  }

  return {
    valida: true,
    dato: {
      id: String(id),
      nombre: nombre || String(texto).trim(),
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
 * @param {Object} mapeoColumnas - Mapeo de nombre archivo -> nombre interno.
 * @returns {{ datos: Array<Object>, errores: string[], valido: boolean }}
 *   - datos: arreglo de filas validas transformadas.
 *   - errores: arreglo de mensajes de error de las filas invalidas.
 *   - valido: true si hay al menos una fila valida.
 */
function validarFilas(filas, tipoArchivo, mapeoColumnas) {
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
    const filaTransformada = transformarFila(filas[i], mapeoColumnas)
    const resultado = validador(filaTransformada, i + 2)
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

  const mapeoColumnas = normalizarColumnas(encabezados, tipoArchivo)
  const resultadoFilas = validarFilas(filas, tipoArchivo, mapeoColumnas)

  return {
    datos: resultadoFilas.datos,
    errores: resultadoFilas.errores,
    valido: resultadoFilas.valido,
    columnasFaltantes: [],
  }
}

/**
 * Funciones de conveniencia para validar cada tipo de archivo.
 * Envuelven a validarArchivo con el tipo predefinido.
 */

/**
 * Valida un archivo de actividades.
 * @param {Array<Object>} filas - Arreglo de objetos parseados.
 * @returns {{ datosValidos: Array<Object>, errores: string[] }}
 */
function validarArchivoActividades(filas) {
  const resultado = validarArchivo(filas, 'actividades');
  return {
    datosValidos: resultado.datos,
    errores: resultado.errores,
    valido: resultado.valido
  };
}

/**
 * Valida un archivo de comodines.
 * @param {Array<Object>} filas - Arreglo de objetos parseados.
 * @returns {{ datosValidos: Array<Object>, errores: string[], valido: boolean }}
 */
function validarArchivoComodines(filas) {
  const resultado = validarArchivo(filas, 'comodines');
  return {
    datosValidos: resultado.datos,
    errores: resultado.errores,
    valido: resultado.valido
  };
}

/**
 * Valida un archivo de castigos.
 * @param {Array<Object>} filas - Arreglo de objetos parseados.
 * @returns {{ datosValidos: Array<Object>, errores: string[], valido: boolean }}
 */
function validarArchivoCastigos(filas) {
  const resultado = validarArchivo(filas, 'castigos');
  return {
    datosValidos: resultado.datos,
    errores: resultado.errores,
    valido: resultado.valido
  };
}

export {
  MAPEO_COLUMNAS,
  COLUMNAS_OBLIGATORIAS,
  normalizarColumnas,
  generarTragoSegundosAleatorio,
  generarEfectoAleatorio,
  generarDuracionRondasAleatoria,
  transformarFila,
  validarColumnas,
  validarFilaActividad,
  validarFilaComodin,
  validarFilaCastigo,
  validarFilas,
  validarArchivo,
  validarArchivoActividades,
  validarArchivoComodines,
  validarArchivoCastigos,
}
