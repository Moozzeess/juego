import { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { validarArchivoActividades, validarArchivoComodines, validarArchivoCastigos } from '../data/validacion';
import { etiquetas } from '../ui/etiquetas';

/**
 * Componente de configuración inicial.
 * Permite cargar archivos de datos, configurar jugadores y rondas.
 * 
 * @param {Function} dispatch - Función para despachar acciones al reducer.
 * @param {Object} estado - Estado actual de la aplicación.
 */
function Configuracion({ dispatch, estado }) {
  const [totalJugadores, setTotalJugadores] = useState(2);
  const [nombresJugadores, setNombresJugadores] = useState(['', '']);
  const [rondasTotales, setRondasTotales] = useState(5);
  const [archivos, setArchivos] = useState({
    actividades: null,
    comodines: null,
    castigos: null
  });
  const [datosValidados, setDatosValidados] = useState({
    actividades: [],
    comodines: [],
    castigos: []
  });
  const [erroresValidacion, setErroresValidacion] = useState({
    actividades: [],
    comodines: [],
    castigos: []
  });

  const manejarCambioJugadores = (valor) => {
    const cantidad = parseInt(valor);
    setTotalJugadores(cantidad);
    if (cantidad > nombresJugadores.length) {
      setNombresJugadores([...nombresJugadores, ...Array(cantidad - nombresJugadores.length).fill('')]);
    } else {
      setNombresJugadores(nombresJugadores.slice(0, cantidad));
    }
  };

  const manejarCambioNombre = (indice, valor) => {
    const nuevosNombres = [...nombresJugadores];
    nuevosNombres[indice] = valor;
    setNombresJugadores(nuevosNombres);
  };

  const procesarArchivo = async (tipo, archivo) => {
    const extension = archivo.name.split('.').pop().toLowerCase();
    
    if (extension === 'csv') {
      Papa.parse(archivo, {
        header: true,
        complete: (resultados) => {
          validarYGuardarDatos(tipo, resultados.data);
        },
        error: (error) => {
          setErroresValidacion({
            ...erroresValidacion,
            [tipo]: [`Error al leer CSV: ${error.message}`]
          });
        }
      });
    } else if (extension === 'xlsx' || extension === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const primeraHoja = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(primeraHoja);
        validarYGuardarDatos(tipo, jsonData);
      };
      reader.readAsArrayBuffer(archivo);
    }
  };

  const validarYGuardarDatos = (tipo, datos) => {
    let resultado;
    switch (tipo) {
      case 'actividades':
        resultado = validarArchivoActividades(datos);
        break;
      case 'comodines':
        resultado = validarArchivoComodines(datos);
        break;
      case 'castigos':
        resultado = validarArchivoCastigos(datos);
        break;
    }

    setDatosValidados({
      ...datosValidados,
      [tipo]: resultado.datosValidos
    });
    setErroresValidacion({
      ...erroresValidacion,
      [tipo]: resultado.errores
    });
  };

  const manejarCargaArchivo = (tipo, evento) => {
    const archivo = evento.target.files[0];
    if (archivo) {
      setArchivos({
        ...archivos,
        [tipo]: archivo
      });
      procesarArchivo(tipo, archivo);
    }
  };

  const validarFormulario = () => {
    const nombresUnicos = new Set(nombresJugadores.filter(n => n.trim() !== ''));
    const nombresValidos = nombresJugadores.every(n => n.trim() !== '') && nombresUnicos.size === nombresJugadores.length;
    const archivosCargados = datosValidados.actividades.length > 0 && 
                            datosValidados.comodines.length > 0 && 
                            datosValidados.castigos.length > 0;
    
    return nombresValidos && archivosCargados;
  };

  const manejarIniciar = () => {
    if (!validarFormulario()) {
      return;
    }

    const jugadores = nombresJugadores.map(nombre => ({
      nombre,
      liquido_acumulado: 0,
      comodines: 2,
      actividades_cumplidas: 0,
      puntos_negativos: 0,
      castigos_activos: [],
      descalificado: false,
      motivo_descalificacion: null,
      retirado: false
    }));

    dispatch({
      tipo: 'CARGAR_DATOS',
      actividades: datosValidados.actividades,
      comodines: datosValidados.comodines,
      castigos: datosValidados.castigos
    });

    dispatch({
      tipo: 'INICIAR_PARTIDA',
      configuracion: {
        total_jugadores: totalJugadores,
        nombres_jugadores: nombresJugadores,
        rondas_totales: rondasTotales
      },
      jugadores
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-fondo p-4">
      <div className="max-w-4xl w-full bg-superficie rounded-lg p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-center mb-8">
          {etiquetas.configuracion.titulo}
        </h1>

        <div className="mb-8">
          <label className="block text-textoSecundario mb-2">
            {etiquetas.configuracion.jugadores}
          </label>
          <input
            type="number"
            min="2"
            max="12"
            value={totalJugadores}
            onChange={(e) => manejarCambioJugadores(e.target.value)}
            className="w-full bg-fondo border border-neutro rounded-lg px-4 py-2 text-texto focus:border-accion focus:outline-none"
          />
        </div>

        <div className="mb-8 space-y-4">
          {nombresJugadores.map((nombre, indice) => (
            <div key={indice}>
              <label className="block text-textoSecundario mb-2">
                {etiquetas.configuracion.nombreJugador} {indice + 1}
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => manejarCambioNombre(indice, e.target.value)}
                className="w-full bg-fondo border border-neutro rounded-lg px-4 py-2 text-texto focus:border-accion focus:outline-none"
              />
            </div>
          ))}
        </div>

        <div className="mb-8">
          <label className="block text-textoSecundario mb-2">
            {etiquetas.configuracion.rondas}
          </label>
          <input
            type="number"
            min="1"
            max="50"
            value={rondasTotales}
            onChange={(e) => setRondasTotales(parseInt(e.target.value))}
            className="w-full bg-fondo border border-neutro rounded-lg px-4 py-2 text-texto focus:border-accion focus:outline-none"
          />
        </div>

        <div className="mb-8 space-y-4">
          <h2 className="text-xl font-semibold mb-4">
            {etiquetas.configuracion.cargarArchivos}
          </h2>

          <div>
            <label className="block text-textoSecundario mb-2">
              {etiquetas.configuracion.actividades}
            </label>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => manejarCargaArchivo('actividades', e)}
              className="w-full bg-fondo border border-neutro rounded-lg px-4 py-2 text-texto focus:border-accion focus:outline-none"
            />
            {erroresValidacion.actividades.length > 0 && (
              <div className="mt-2 text-peligro text-sm">
                {erroresValidacion.actividades.map((error, i) => (
                  <div key={i}>{error}</div>
                ))}
              </div>
            )}
            {datosValidados.actividades.length > 0 && (
              <div className="mt-2 text-activo text-sm">
                {datosValidados.actividades.length} actividades válidas cargadas
              </div>
            )}
          </div>

          <div>
            <label className="block text-textoSecundario mb-2">
              {etiquetas.configuracion.comodines}
            </label>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => manejarCargaArchivo('comodines', e)}
              className="w-full bg-fondo border border-neutro rounded-lg px-4 py-2 text-texto focus:border-accion focus:outline-none"
            />
            {erroresValidacion.comodines.length > 0 && (
              <div className="mt-2 text-peligro text-sm">
                {erroresValidacion.comodines.map((error, i) => (
                  <div key={i}>{error}</div>
                ))}
              </div>
            )}
            {datosValidados.comodines.length > 0 && (
              <div className="mt-2 text-activo text-sm">
                {datosValidados.comodines.length} comodines válidos cargados
              </div>
            )}
          </div>

          <div>
            <label className="block text-textoSecundario mb-2">
              {etiquetas.configuracion.castigos}
            </label>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => manejarCargaArchivo('castigos', e)}
              className="w-full bg-fondo border border-neutro rounded-lg px-4 py-2 text-texto focus:border-accion focus:outline-none"
            />
            {erroresValidacion.castigos.length > 0 && (
              <div className="mt-2 text-peligro text-sm">
                {erroresValidacion.castigos.map((error, i) => (
                  <div key={i}>{error}</div>
                ))}
              </div>
            )}
            {datosValidados.castigos.length > 0 && (
              <div className="mt-2 text-activo text-sm">
                {datosValidados.castigos.length} castigos válidos cargados
              </div>
            )}
          </div>
        </div>

        <button
          onClick={manejarIniciar}
          disabled={!validarFormulario()}
          className={`w-full font-bold py-3 px-6 rounded-lg transition-colors duration-200 uppercase tracking-wider ${
            validarFormulario()
              ? 'bg-activo hover:bg-green-600 text-white'
              : 'bg-neutro text-textoSecundario cursor-not-allowed opacity-50'
          }`}
        >
          {etiquetas.configuracion.botonIniciar}
        </button>
      </div>
    </div>
  );
}

export default Configuracion;
