/**
 * Modulo de carga de archivos CSV y XLSX.
 * Integra PapaParse para CSV y SheetJS para XLSX con el sistema de validacion.
 *
 * @module carga
 */

import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { validarArchivoActividades, validarArchivoComodines, validarArchivoCastigos } from './validacion.js';

/**
 * Carga un archivo CSV o XLSX y valida su contenido.
 *
 * @param {File} archivo - Archivo a cargar.
 * @param {string} tipo - 'actividades', 'comodines' o 'castigos'.
 * @returns {Promise<{ datosValidos: Array<Object>, errores: string[] }>}
 */
async function cargarArchivo(archivo, tipo) {
  return new Promise((resolve, reject) => {
    const extension = archivo.name.split('.').pop().toLowerCase();
    
    if (extension === 'csv') {
      Papa.parse(archivo, {
        header: true,
        skipEmptyLines: true,
        complete: (resultados) => {
          try {
            const resultadoValidacion = validarDatos(tipo, resultados.data);
            resolve(resultadoValidacion);
          } catch (error) {
            reject(new Error(`Error al validar datos: ${error.message}`));
          }
        },
        error: (error) => {
          reject(new Error(`Error al leer CSV: ${error.message}`));
        }
      });
    } else if (extension === 'xlsx' || extension === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const primeraHoja = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(primeraHoja);
          const resultadoValidacion = validarDatos(tipo, jsonData);
          resolve(resultadoValidacion);
        } catch (error) {
          reject(new Error(`Error al leer XLSX: ${error.message}`));
        }
      };
      reader.onerror = () => {
        reject(new Error('Error al leer el archivo'));
      };
      reader.readAsArrayBuffer(archivo);
    } else {
      reject(new Error('Formato de archivo no soportado. Use .csv, .xlsx o .xls'));
    }
  });
}

/**
 * Valida los datos parseados segun el tipo de archivo.
 *
 * @param {string} tipo - 'actividades', 'comodines' o 'castigos'.
 * @param {Array<Object>} datos - Datos parseados del archivo.
 * @returns {{ datosValidos: Array<Object>, errores: string[] }}
 */
function validarDatos(tipo, datos) {
  switch (tipo) {
    case 'actividades':
      return validarArchivoActividades(datos);
    case 'comodines':
      return validarArchivoComodines(datos);
    case 'castigos':
      return validarArchivoCastigos(datos);
    default:
      throw new Error(`Tipo de archivo desconocido: ${tipo}`);
  }
}

/**
 * Carga los archivos de ejemplo desde el directorio public/ejemplos/.
 * 
 * @returns {Promise<{ actividades: Array<Object>, comodines: Array<Object>, castigos: Array<Object> }>}
 */
async function cargarEjemplos() {
  try {
    const [actividadesResp, comodinesResp, castigosResp] = await Promise.all([
      fetch('/ejemplos/actividades.csv'),
      fetch('/ejemplos/comodines.csv'),
      fetch('/ejemplos/castigos.csv')
    ]);

    if (!actividadesResp.ok || !comodinesResp.ok || !castigosResp.ok) {
      throw new Error('Error al cargar archivos de ejemplo');
    }

    const actividadesTexto = await actividadesResp.text();
    const comodinesTexto = await comodinesResp.text();
    const castigosTexto = await castigosResp.text();

    const actividadesParseadas = Papa.parse(actividadesTexto, { header: true, skipEmptyLines: true }).data;
    const comodinesParseados = Papa.parse(comodinesTexto, { header: true, skipEmptyLines: true }).data;
    const castigosParseados = Papa.parse(castigosTexto, { header: true, skipEmptyLines: true }).data;

    const actividadesValidas = validarArchivoActividades(actividadesParseadas);
    const comodinesValidos = validarArchivoComodines(comodinesParseados);
    const castigosValidos = validarArchivoCastigos(castigosParseados);

    if (actividadesValidas.errores.length > 0 || comodinesValidos.errores.length > 0 || castigosValidos.errores.length > 0) {
      throw new Error('Error al validar archivos de ejemplo');
    }

    return {
      actividades: actividadesValidas.datosValidos,
      comodines: comodinesValidos.datosValidos,
      castigos: castigosValidos.datosValidos
    };
  } catch (error) {
    throw new Error(`Error al cargar ejemplos: ${error.message}`);
  }
}

export {
  cargarArchivo,
  cargarEjemplos,
};
