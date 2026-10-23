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

export {
  cargarArchivo,
};
