import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cargarArchivo, cargarEjemplos } from '../data/carga';
import { etiquetas } from '../ui/etiquetas';
import ModalReglas from './ModalReglas';

// Mismos colores que usa el Marcador, para que cada jugador conserve su color en toda la app
const coloresAvatar = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];

/**
 * Ficha para subir uno de los tres archivos de datos.
 * Toda la tarjeta es clicable (label), y muestra el nombre del archivo y el conteo.
 */
function FichaArchivo({ titulo, genero, cantidad, archivo, errores, onChange }) {
  const cargado = cantidad > 0;
  return (
    <label
      className={`block p-4 rounded-2xl border-2 border-dashed cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-accion ${
        cargado
          ? 'bg-activo/10 border-activo/60'
          : errores.length > 0
            ? 'bg-peligro/10 border-peligro/60'
            : 'bg-white/5 border-white/15 hover:border-accion'
      }`}
    >
      <div className="flex justify-between items-center mb-1">
        <span className="font-condensada font-bold text-sm md:text-base text-texto">{titulo}</span>
        {cargado && (
          <span className="text-xs font-bold text-activo">
            {cantidad} {genero === 'f' ? 'cargadas' : 'cargados'}
          </span>
        )}
      </div>
      <p className="text-xs text-textoSecundario truncate">
        {archivo ? archivo.name : 'Toca para elegir un archivo .csv o .xlsx'}
      </p>
      <input
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={onChange}
        className="sr-only"
      />
      {errores.length > 0 && (
        <p className="mt-2 text-peligro text-[11px] leading-tight">{errores[0]}</p>
      )}
    </label>
  );
}

/**
 * Componente de configuración inicial.
 * Permite cargar archivos de datos, configurar jugadores y rondas.
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

  /**
   * Devuelve la lista de cosas que faltan para poder iniciar.
   * Si está vacía, el formulario es válido. Sirve también para decirle
   * a la persona POR QUÉ el botón está deshabilitado.
   */
  const obtenerPendientes = () => {
    const pendientes = [];
    const nombresLimpios = nombresJugadores.map(n => n.trim());

    const vacios = nombresLimpios.filter(n => n === '').length;
    if (vacios > 0) {
      pendientes.push(vacios === 1 ? 'Falta 1 nombre de jugador' : `Faltan ${vacios} nombres de jugadores`);
    }

    // Se comparan sin distinguir mayúsculas: "Ana" y "ana" confundirían al marcador
    const llenos = nombresLimpios.filter(n => n !== '').map(n => n.toLowerCase());
    if (new Set(llenos).size !== llenos.length) {
      pendientes.push('Hay nombres repetidos');
    }

    if (cargandoEjemplos) {
      pendientes.push('Cargando los datos de ejemplo');
    } else {
      const faltantes = [];
      if (datosValidados.actividades.length === 0) faltantes.push('actividades');
      if (datosValidados.comodines.length === 0) faltantes.push('comodines');
      if (datosValidados.castigos.length === 0) faltantes.push('castigos');
      if (faltantes.length > 0) {
        pendientes.push(`Faltan datos de ${faltantes.join(', ')}`);
      }
    }

    return pendientes;
  };

  const pendientes = obtenerPendientes();
  const validarFormulario = () => pendientes.length === 0;

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

  const hayErrorEjemplos = modoDatos === 'ejemplos' && !cargandoEjemplos && erroresValidacion.actividades.length > 0;

  return (
    <div className="min-h-screen text-texto py-6 md:py-10 px-3 md:px-4 flex items-center justify-center">
      <div className="max-w-[95vw] md:max-w-4xl w-full panel-cristal rounded-3xl p-4 md:p-6 lg:p-10 space-y-6 md:space-y-8">

        {/* Cabecera: el título es el elemento memorable de esta pantalla */}
        <div className="text-center space-y-3 pb-2 relative">
          <motion.h1
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 140, damping: 14 }}
            className="fuente-juego texto-fuego text-4xl md:text-6xl lg:text-7xl leading-none"
          >
            El menos pedo
          </motion.h1>
          <p className="text-textoSecundario text-sm md:text-base max-w-xl mx-auto">
            Elige quién juega, cuántas rondas y de dónde salen los retos. Juega con responsabilidad: nadie tiene que beber más de lo que quiera.
          </p>
          <button
            onClick={() => setMostrarReglas(true)}
            className="inline-flex items-center gap-1.5 text-xs md:text-sm font-condensada font-bold text-slate-200 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full border border-white/15 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 text-accion" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Ver las reglas
          </button>
        </div>

        {/* Parámetros generales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 bg-black/20 p-4 md:p-6 rounded-2xl border border-white/10">
          <div>
            <label htmlFor="rango-jugadores" className="block text-sm font-condensada text-textoSecundario font-bold mb-2">
              Jugadores (de 2 a 12)
            </label>
            <div className="flex items-center gap-4">
              <input
                id="rango-jugadores"
                type="range"
                min="2"
                max="12"
                value={totalJugadores}
                onChange={(e) => manejarCambioJugadores(e.target.value)}
                className="w-full accent-accion h-2 cursor-pointer"
              />
              <span className="fuente-juego text-3xl text-white w-12 text-center">
                {totalJugadores}
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="rango-rondas" className="block text-sm font-condensada text-textoSecundario font-bold mb-2">
              Rondas (de 1 a 50)
            </label>
            <div className="flex items-center gap-4">
              <input
                id="rango-rondas"
                type="range"
                min="1"
                max="50"
                value={rondasTotales}
                onChange={(e) => setRondasTotales(parseInt(e.target.value) || 1)}
                className="w-full accent-accion h-2 cursor-pointer"
              />
              <span className="fuente-juego text-3xl text-white w-12 text-center">
                {rondasTotales}
              </span>
            </div>
          </div>
        </div>

        {/* Nombres de los jugadores */}
        <section className="space-y-3">
          <div className="flex items-baseline justify-between gap-3 flex-wrap">
            <h2 className="fuente-juego text-lg md:text-xl text-texto">Quién juega</h2>
            <span className="text-xs md:text-sm text-textoSecundario">
              Cada nombre debe ser distinto
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
            {nombresJugadores.map((nombre, indice) => (
              <div key={indice} className="relative">
                <span
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-white fuente-juego text-xs ring-2 ring-white/20"
                  style={{ backgroundColor: coloresAvatar[indice % coloresAvatar.length] }}
                  aria-hidden="true"
                >
                  {nombre.trim() ? nombre.trim().charAt(0).toUpperCase() : indice + 1}
                </span>
                <input
                  type="text"
                  aria-label={`Nombre del jugador ${indice + 1}`}
                  placeholder={`Jugador ${indice + 1}`}
                  value={nombre}
                  maxLength={20}
                  onChange={(e) => manejarCambioNombre(indice, e.target.value)}
                  className="w-full bg-black/25 border border-white/15 rounded-xl pl-11 pr-3 py-2.5 text-sm md:text-base text-texto focus:border-accion focus:ring-2 focus:ring-accion/40 outline-none transition-all placeholder:text-slate-500"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Fuente de datos */}
        <section className="space-y-3">
          <h2 className="fuente-juego text-lg md:text-xl text-texto">De dónde salen los retos</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              {
                id: 'ejemplos',
                titulo: 'Usar ejemplos',
                detalle: 'Retos, comodines y castigos ya incluidos',
                icono: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
              },
              {
                id: 'archivos',
                titulo: 'Subir mis archivos',
                detalle: 'Tres archivos .csv o .xlsx propios',
                icono: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
              }
            ].map(opcion => {
              const seleccionada = modoDatos === opcion.id;
              return (
                <button
                  key={opcion.id}
                  onClick={() => setModoDatos(opcion.id)}
                  aria-pressed={seleccionada}
                  className={`p-4 rounded-2xl border-2 transition-all text-left cursor-pointer ${
                    seleccionada
                      ? 'bg-accion/15 border-accion shadow-[0_0_24px_rgba(59,130,246,0.3)]'
                      : 'bg-white/5 border-white/10 hover:border-accion/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      seleccionada ? 'bg-accion' : 'bg-slate-700'
                    }`}>
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={opcion.icono} />
                      </svg>
                    </div>
                    <div>
                      <div className="font-condensada font-bold text-base text-texto">{opcion.titulo}</div>
                      <div className="text-xs text-textoSecundario">{opcion.detalle}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {cargandoEjemplos && modoDatos === 'ejemplos' && (
            <div className="text-center py-3">
              <div className="inline-flex items-center gap-2 text-accion font-condensada font-bold text-sm">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Cargando ejemplos…
              </div>
            </div>
          )}

          {/* Antes, si los ejemplos fallaban no se mostraba ningún aviso */}
          {hayErrorEjemplos && (
            <div role="alert" className="bg-peligro/10 border border-peligro/50 rounded-2xl p-4 flex items-center justify-between gap-3 flex-wrap">
              <p className="text-sm text-peligro">
                No se pudieron cargar los ejemplos: {erroresValidacion.actividades[0]}
              </p>
              <button
                onClick={cargarDatosEjemplo}
                className="px-3 py-1.5 rounded-lg bg-peligro text-white text-sm font-condensada font-bold cursor-pointer"
              >
                Reintentar
              </button>
            </div>
          )}

          {modoDatos === 'ejemplos' && !cargandoEjemplos && datosValidados.actividades.length > 0 && (
            <div className="bg-activo/10 border border-activo/40 rounded-2xl p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  { n: datosValidados.actividades.length, t: 'Actividades' },
                  { n: datosValidados.comodines.length, t: 'Comodines' },
                  { n: datosValidados.castigos.length, t: 'Castigos' }
                ].map(dato => (
                  <div key={dato.t}>
                    <div className="fuente-juego text-2xl text-white">{dato.n}</div>
                    <div className="text-xs text-textoSecundario">{dato.t}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {modoDatos === 'archivos' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 pt-1">
              <FichaArchivo
                titulo="Actividades"
                genero="f"
                cantidad={datosValidados.actividades.length}
                archivo={archivos.actividades}
                errores={erroresValidacion.actividades}
                onChange={(e) => manejarCargaArchivo('actividades', e)}
              />
              <FichaArchivo
                titulo="Comodines"
                genero="m"
                cantidad={datosValidados.comodines.length}
                archivo={archivos.comodines}
                errores={erroresValidacion.comodines}
                onChange={(e) => manejarCargaArchivo('comodines', e)}
              />
              <FichaArchivo
                titulo="Castigos"
                genero="m"
                cantidad={datosValidados.castigos.length}
                archivo={archivos.castigos}
                errores={erroresValidacion.castigos}
                onChange={(e) => manejarCargaArchivo('castigos', e)}
              />
            </div>
          )}
        </section>

        {/* Botón de inicio, con el motivo visible cuando está deshabilitado */}
        <div className="pt-2 space-y-3">
          <button
            onClick={manejarIniciar}
            disabled={!validarFormulario()}
            className={`w-full py-4 px-6 text-lg md:text-xl font-condensada ${
              validarFormulario()
                ? 'boton-juego boton-aceptar text-white cursor-pointer'
                : 'boton-juego bg-slate-700/60 border-slate-800 text-slate-400 cursor-not-allowed'
            }`}
          >
            Iniciar partida
          </button>

          {pendientes.length > 0 && (
            <p className="text-center text-sm text-textoSecundario" aria-live="polite">
              {pendientes.join(' · ')}
            </p>
          )}
        </div>
      </div>

      {/* Modal de Reglas del Juego */}
      <ModalReglas abierto={mostrarReglas} alCerrar={() => setMostrarReglas(false)} />
    </div>
  );
}

export default Configuracion;