import { useState, useEffect } from 'react';
import { cargarArchivo, cargarEjemplos } from '../data/carga';
import { etiquetas } from '../ui/etiquetas';
import ModalReglas from './ModalReglas';

/**
 * Componente de configuración inicial.
 * Permite cargar archivos de datos, configurar jugadores y rondas
 * con un diseño profesional y acorde al sistema de diseño visual.
 * 
 * @param {Function} dispatch - Función para despachar acciones al reducer.
 * @param {Object} estado - Estado actual de la aplicación.
 */
function Configuracion({ dispatch, estado }) {
  const [mostrarReglas, setMostrarReglas] = useState(false);
  const [totalJugadores, setTotalJugadores] = useState(2);
  const [nombresJugadores, setNombresJugadores] = useState(['', '']);
  const [rondasTotales, setRondasTotales] = useState(5);
  const [modoDatos, setModoDatos] = useState('ejemplos');
  const [cargandoEjemplos, setCargandoEjemplos] = useState(false);
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

  useEffect(() => {
    if (modoDatos === 'ejemplos') {
      cargarDatosEjemplo();
    } else {
      setDatosValidados({ actividades: [], comodines: [], castigos: [] });
      setArchivos({ actividades: null, comodines: null, castigos: null });
      setErroresValidacion({ actividades: [], comodines: [], castigos: [] });
    }
  }, [modoDatos]);

  const cargarDatosEjemplo = async () => {
    setCargandoEjemplos(true);
    try {
      const ejemplos = await cargarEjemplos();
      setDatosValidados({
        actividades: ejemplos.actividades,
        comodines: ejemplos.comodines,
        castigos: ejemplos.castigos
      });
      setErroresValidacion({ actividades: [], comodines: [], castigos: [] });
    } catch (error) {
      setErroresValidacion({
        actividades: [error.message],
        comodines: [error.message],
        castigos: [error.message]
      });
    } finally {
      setCargandoEjemplos(false);
    }
  };

  const manejarCambioJugadores = (valor) => {
    const cantidad = Math.max(2, Math.min(12, parseInt(valor) || 2));
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
    try {
      const resultado = await cargarArchivo(archivo, tipo);
      setDatosValidados(prev => ({
        ...prev,
        [tipo]: resultado.datosValidos
      }));
      setErroresValidacion(prev => ({
        ...prev,
        [tipo]: resultado.errores || []
      }));
    } catch (error) {
      setErroresValidacion(prev => ({
        ...prev,
        [tipo]: [error.message]
      }));
    }
  };

  const manejarCargaArchivo = (tipo, evento) => {
    const archivo = evento.target.files[0];
    if (archivo) {
      setArchivos(prev => ({
        ...prev,
        [tipo]: archivo
      }));
      procesarArchivo(tipo, archivo);
    }
  };

  const validarFormulario = () => {
    const nombresLimpios = nombresJugadores.map(n => n.trim());
    const nombresUnicos = new Set(nombresLimpios.filter(n => n !== ''));
    const nombresValidos = nombresLimpios.every(n => n !== '') && nombresUnicos.size === nombresJugadores.length;
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
      nombre: nombre.trim(),
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
        nombres_jugadores: nombresJugadores.map(n => n.trim()),
        rondas_totales: rondasTotales
      },
      jugadores
    });
  };

  return (
    <div className="min-h-screen bg-fondo text-texto py-6 md:py-10 px-3 md:px-4 flex items-center justify-center">
      <div className="max-w-[95vw] md:max-w-4xl w-full bg-superficie rounded-2xl p-4 md:p-6 lg:p-10 shadow-2xl border border-neutro/50 space-y-4 md:space-y-6 lg:space-y-8">
        
        {/* Cabecera del juego */}
        <div className="text-center space-y-2 border-b border-neutro/40 pb-4 md:pb-6 relative">
          <div className="flex justify-center items-center gap-2 flex-wrap">
            <span className="text-[10px] md:text-xs lg:text-sm font-condensada uppercase tracking-widest text-accion font-bold bg-accion/10 px-2 md:px-3 py-1 rounded-full border border-accion/30">
              Juego de Mesa y Consumo Responsable
            </span>
            <button
              onClick={() => setMostrarReglas(true)}
              className="text-[10px] md:text-xs lg:text-sm font-condensada font-bold uppercase tracking-wider text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 md:px-3 py-1 rounded-full border border-slate-600 transition-colors flex items-center gap-1"
            >
              <svg className="w-3 h-3 md:w-3.5 md:h-3.5 text-accion" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Reglas del juego
            </button>
          </div>
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-condensada font-bold uppercase tracking-wide text-texto">
            EL MENOS HIDRATADO
          </h1>
          <p className="text-textoSecundario text-xs md:text-sm lg:text-base max-w-xl mx-auto">
            Configura la partida, asigna los participantes y sube los bancos de datos de actividades, comodines y castigos.
          </p>
        </div>

        {/* Sección 1: Parámetros Generales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 bg-fondo/60 p-4 md:p-6 rounded-xl border border-neutro/30">
          <div>
            <label className="block text-[10px] md:text-xs lg:text-sm font-condensada uppercase tracking-wider text-textoSecundario font-bold mb-2">
              Cantidad de Jugadores (2 - 12)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="2"
                max="12"
                value={totalJugadores}
                onChange={(e) => manejarCambioJugadores(e.target.value)}
                className="w-full accent-accion h-2 bg-slate-700 rounded-lg cursor-pointer"
              />
              <span className="font-condensada font-bold text-xl md:text-2xl lg:text-3xl text-accion w-8 text-right">
                {totalJugadores}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-[10px] md:text-xs lg:text-sm font-condensada uppercase tracking-wider text-textoSecundario font-bold mb-2">
              Rondas Totales de Juego (1 - 50)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="50"
                value={rondasTotales}
                onChange={(e) => setRondasTotales(parseInt(e.target.value) || 1)}
                className="w-full accent-accion h-2 bg-slate-700 rounded-lg cursor-pointer"
              />
              <span className="font-condensada font-bold text-xl md:text-2xl lg:text-3xl text-accion w-8 text-right">
                {rondasTotales}
              </span>
            </div>
          </div>
        </div>

        {/* Sección 2: Nombres de los Jugadores */}
        <div className="space-y-3 md:space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base md:text-lg lg:text-xl font-condensada font-bold uppercase tracking-wider text-texto">
              Nombres de los Jugadores
            </h2>
            <span className="text-[10px] md:text-xs lg:text-sm text-textoSecundario">
              Deben ser únicos y no vacíos
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 max-h-48 md:max-h-56 overflow-y-auto pr-1">
            {nombresJugadores.map((nombre, indice) => (
              <div key={indice} className="relative">
                <span className="absolute left-3 top-2 md:top-2.5 text-[10px] md:text-xs font-condensada font-bold text-accion">
                  J{indice + 1}
                </span>
                <input
                  type="text"
                  placeholder={`Jugador ${indice + 1}`}
                  value={nombre}
                  onChange={(e) => manejarCambioNombre(indice, e.target.value)}
                  className="w-full bg-fondo border border-neutro/50 rounded-xl pl-9 pr-3 py-2 text-xs md:text-sm text-texto focus:border-accion focus:ring-1 focus:ring-accion outline-none transition-all placeholder:text-slate-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Sección 3: Selección de Fuente de Datos */}
        <div className="space-y-3 md:space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base md:text-lg lg:text-xl font-condensada font-bold uppercase tracking-wider text-texto">
              Fuente de Datos
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={() => setModoDatos('ejemplos')}
              className={`p-4 rounded-xl border-2 transition-all ${
                modoDatos === 'ejemplos'
                  ? 'bg-activo/20 border-activo text-texto'
                  : 'bg-fondo border-neutro/50 text-textoSecundario hover:border-accion'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  modoDatos === 'ejemplos' ? 'bg-accion' : 'bg-slate-700'
                }`}>
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="font-condensada font-bold text-sm md:text-base uppercase">
                    Usar Ejemplos
                  </div>
                  <div className="text-[10px] md:text-xs text-textoSecundario">
                    Cargar datos predefinidos
                  </div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setModoDatos('archivos')}
              className={`p-4 rounded-xl border-2 transition-all ${
                modoDatos === 'archivos'
                  ? 'bg-activo/20 border-accion text-texto'
                  : 'bg-fondo border-neutro/50 text-textoSecundario hover:border-accion'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  modoDatos === 'archivos' ? 'bg-accion' : 'bg-slate-700'
                }`}>
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="font-condensada font-bold text-sm md:text-base uppercase">
                    Archivos Propios
                  </div>
                  <div className="text-[10px] md:text-xs text-textoSecundario">
                    Subir archivos .csv o .xlsx
                  </div>
                </div>
              </div>
            </button>
          </div>

          {cargandoEjemplos && modoDatos === 'ejemplos' && (
            <div className="text-center py-4">
              <div className="inline-flex items-center gap-2 text-accion font-condensada font-bold text-sm">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Cargando ejemplos...
              </div>
            </div>
          )}

          {modoDatos === 'ejemplos' && !cargandoEjemplos && datosValidados.actividades.length > 0 && (
            <div className="bg-activo/10 border border-activo/50 rounded-xl p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="font-condensada font-bold text-accion text-lg">
                    {datosValidados.actividades.length}
                  </div>
                  <div className="text-[10px] md:text-xs text-textoSecundario uppercase">
                    Actividades
                  </div>
                </div>
                <div>
                  <div className="font-condensada font-bold text-accion text-lg">
                    {datosValidados.comodines.length}
                  </div>
                  <div className="text-[10px] md:text-xs text-textoSecundario uppercase">
                    Comodines
                  </div>
                </div>
                <div>
                  <div className="font-condensada font-bold text-accion text-lg">
                    {datosValidados.castigos.length}
                  </div>
                  <div className="text-[10px] md:text-xs text-textoSecundario uppercase">
                    Castigos
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sección 4: Carga de Archivos de Datos (solo si modoDatos === 'archivos') */}
        {modoDatos === 'archivos' && (
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base md:text-lg lg:text-xl font-condensada font-bold uppercase tracking-wider text-texto">
                Archivos de Datos (.csv, .xlsx)
              </h2>
              <span className="text-[10px] md:text-xs lg:text-sm text-textoSecundario">
                Sube los 3 archivos para habilitar la partida
              </span>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {/* Actividades */}
            <div className={`p-3 md:p-4 rounded-xl border transition-all ${
              datosValidados.actividades.length > 0 
                ? 'bg-activo/10 border-activo/50' 
                : 'bg-fondo border-neutro/50 hover:border-accion'
            }`}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-condensada font-bold uppercase text-xs md:text-sm text-texto">
                  Actividades
                </span>
                {datosValidados.actividades.length > 0 && (
                  <span className="text-[10px] md:text-xs font-bold text-activo uppercase">
                    {datosValidados.actividades.length} cargadas
                  </span>
                )}
              </div>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => manejarCargaArchivo('actividades', e)}
                className="w-full text-[10px] md:text-xs text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-700 file:text-white hover:file:bg-slate-600 cursor-pointer"
              />
              {erroresValidacion.actividades.length > 0 && (
                <p className="mt-2 text-peligro text-[10px] md:text-[11px] leading-tight">
                  {erroresValidacion.actividades[0]}
                </p>
              )}
            </div>

            {/* Comodines */}
            <div className={`p-3 md:p-4 rounded-xl border transition-all ${
              datosValidados.comodines.length > 0 
                ? 'bg-activo/10 border-accion/50' 
                : 'bg-fondo border-neutro/50 hover:border-accion'
            }`}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-condensada font-bold uppercase text-xs md:text-sm text-texto">
                  Comodines
                </span>
                {datosValidados.comodines.length > 0 && (
                  <span className="text-[10px] md:text-xs font-bold text-activo uppercase">
                    {datosValidados.comodines.length} cargados
                  </span>
                )}
              </div>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => manejarCargaArchivo('comodines', e)}
                className="w-full text-[10px] md:text-xs text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-700 file:text-white hover:file:bg-slate-600 cursor-pointer"
              />
              {erroresValidacion.comodines.length > 0 && (
                <p className="mt-2 text-peligro text-[10px] md:text-[11px] leading-tight">
                  {erroresValidacion.comodines[0]}
                </p>
              )}
            </div>

            {/* Castigos */}
            <div className={`p-3 md:p-4 rounded-xl border transition-all ${
              datosValidados.castigos.length > 0 
                ? 'bg-activo/10 border-accion/50' 
                : 'bg-fondo border-neutro/50 hover:border-accion'
            }`}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-condensada font-bold uppercase text-xs md:text-sm text-texto">
                  Castigos
                </span>
                {datosValidados.castigos.length > 0 && (
                  <span className="text-[10px] md:text-xs font-bold text-activo uppercase">
                    {datosValidados.castigos.length} cargados
                  </span>
                )}
              </div>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => manejarCargaArchivo('castigos', e)}
                className="w-full text-[10px] md:text-xs text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-700 file:text-white hover:file:bg-slate-600 cursor-pointer"
              />
              {erroresValidacion.castigos.length > 0 && (
                <p className="mt-2 text-peligro text-[10px] md:text-[11px] leading-tight">
                  {erroresValidacion.castigos[0]}
                </p>
              )}
            </div>
          </div>
          </div>
        )}

        {/* Botón de Inicio */}
        <div className="pt-2">
          <button
            onClick={manejarIniciar}
            disabled={!validarFormulario()}
            className={`w-full py-3 md:py-4 px-4 md:px-6 rounded-xl font-condensada font-bold uppercase tracking-wider text-sm md:text-base lg:text-lg border-b-4 transition-all duration-200 ${
              validarFormulario()
                ? 'bg-activo hover:bg-activoOscuro border-activoOscuro text-white shadow-lg shadow-activo/20 cursor-pointer active:translate-y-1'
                : 'bg-neutro/40 text-slate-500 border-neutro/40 cursor-not-allowed opacity-60'
            }`}
          >
            INICIAR PARTIDA
          </button>
        </div>

      </div>

      {/* Modal de Reglas del Juego */}
      <ModalReglas abierto={mostrarReglas} alCerrar={() => setMostrarReglas(false)} />
    </div>
  );
}

export default Configuracion;
