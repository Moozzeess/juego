import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { etiquetas } from '../ui/etiquetas';
import { variantesTarjeta, variantesComodin, variantesCastigo, variantesCambioTurno, NumeroAnimado } from '../ui/animaciones.jsx';
import RelojTrago from './RelojTrago';
import PanelJuez from './PanelJuez';

/**
 * Componente del área de acción principal.
 * Muestra la actividad actual, el reloj de trago y los botones de decisión.
 * 
 * @param {Object} estado - Estado actual de la partida.
 * @param {Function} dispatch - Función para despachar acciones al reducer.
 */
function AreaAccion({ estado, dispatch }) {
  const { turno, jugadores, indice_turno, ronda_actual, juez } = estado.estado_partida;
  const jugadorActivo = jugadores[indice_turno];
  const { actividades, comodines } = estado.datos;

  if (!jugadorActivo) return null;

  const seleccionarActividadAleatoria = () => {
    if (actividades.length === 0) return null;
    return actividades[Math.floor(Math.random() * actividades.length)];
  };

  const actividadActual = turno.actividad || seleccionarActividadAleatoria();

  const manejarAceptar = () => {
    setClaveActividad(prev => prev + 1);
    dispatch({
      tipo: 'ACEPTAR_RETO'
    });
  };

  const [animandoGiro, setAnimandoGiro] = useState(false);
  const [claveActividad, setClaveActividad] = useState(0);

  const manejarComodin = () => {
    if (jugadorActivo.comodines === 0 || animandoGiro) return;

    const comodinAleatorio = comodines[Math.floor(Math.random() * comodines.length)];
    const nuevosJugadores = [...jugadores];
    
    nuevosJugadores[indice_turno] = {
      ...jugadorActivo,
      comodines: jugadorActivo.comodines - 1
    };

    setAnimandoGiro(true);
    setClaveActividad(prev => prev + 1);

    setTimeout(() => {
      if (comodinAleatorio.efecto === 'salvar') {
        dispatch({
          tipo: 'USAR_COMODIN',
          jugadores: nuevosJugadores,
          comodin: comodinAleatorio,
          esSalvar: true
        });
      } else {
        dispatch({
          tipo: 'USAR_COMODIN',
          jugadores: nuevosJugadores,
          comodin: comodinAleatorio,
          actividad: {
            id: comodinAleatorio.id,
            texto: comodinAleatorio.nombre || comodinAleatorio.texto,
            descripcion: comodinAleatorio.texto,
            trago_segundos: comodinAleatorio.trago_segundos || 0,
            categoria: 'Comodín de Cambio'
          },
          esSalvar: false
        });
      }
      setAnimandoGiro(false);
    }, 450);
  };

  const manejarContinuarComodinSalvar = () => {
    // Si el comodín es salvar, el jugador se salvó: se registra y se avanza
    const nuevoHistorial = [
      ...estado.estado_partida.historial,
      {
        tipo: 'comodin_usado',
        jugador: jugadorActivo.nombre,
        actividad: `Usó comodín (Salvar): ${turno.comodin_activo?.nombre || 'Salvado'}`,
        trago_segundos: 0,
        ronda: ronda_actual
      }
    ];

    dispatch({
      tipo: 'CONFIRMAR_CUMPLIMIENTO',
      jugadores,
      historial: nuevoHistorial
    });

    manejarAvanzarTurno();
  };

  const manejarContinuarComodinCambiar = () => {
    // Continúa con la nueva actividad sustituta generada por el comodín
    dispatch({
      tipo: 'CONTINUAR_COMODIN',
      pasoSiguiente: 'eleccion'
    });
  };

  const manejarNegarse = () => {
    const nuevosJugadores = [...jugadores];
    const tragoSegundos = actividadActual?.trago_segundos || 0;
    
    nuevosJugadores[indice_turno] = {
      ...jugadorActivo,
      liquido_acumulado: jugadorActivo.liquido_acumulado + tragoSegundos,
      puntos_negativos: jugadorActivo.puntos_negativos + 1
    };

    const castigoAleatorio = estado.datos.castigos[
      Math.floor(Math.random() * estado.datos.castigos.length)
    ];

    if (castigoAleatorio) {
      nuevosJugadores[indice_turno] = {
        ...nuevosJugadores[indice_turno],
        castigos_activos: [
          ...jugadorActivo.castigos_activos,
          {
            id: castigoAleatorio.id,
            texto: castigoAleatorio.texto,
            rondas_restantes: castigoAleatorio.duracion_rondas
          }
        ]
      };
    }

    dispatch({
      tipo: 'NEGARSE',
      jugadores: nuevosJugadores
    });
  };

  const manejarAvanzarTurno = () => {
    const jugadoresActivos = jugadores.filter(j => !j.descalificado && !j.retirado);
    
    if (jugadoresActivos.length < 2) {
      dispatch({
        tipo: 'IR_A_CIERRE',
        resultado_final: {
          ganador: jugadoresActivos.length === 1 ? jugadoresActivos[0] : null,
          esSinGanador: jugadoresActivos.length === 0
        }
      });
      return;
    }

    const indiceJugadorActual = jugadoresActivos.findIndex(j => j.nombre === jugadorActivo.nombre);
    const siguienteIndice = (indiceJugadorActual + 1) % jugadoresActivos.length;
    
    if (siguienteIndice === 0) {
      const jugadoresConCastigosActualizados = jugadores.map(j => ({
        ...j,
        castigos_activos: j.castigos_activos
          .map(c => ({
            ...c,
            rondas_restantes: c.rondas_restantes - 1
          }))
          .filter(c => c.rondas_restantes > 0)
      }));

      const nuevaRonda = ronda_actual + 1;
      const rondasTotales = estado.configuracion.rondas_totales;

      if (nuevaRonda > rondasTotales) {
        dispatch({
          tipo: 'IR_A_CIERRE',
          resultado_final: {
            jugadores: jugadoresConCastigosActualizados
          }
        });
        return;
      }

      dispatch({
        tipo: 'CERRAR_RONDA',
        rondaActual: nuevaRonda,
        jugadores: jugadoresConCastigosActualizados,
        historial: estado.estado_partida.historial
      });
    }

    const siguienteJugador = jugadoresActivos[siguienteIndice];
    const indiceJuez = (siguienteIndice + 1) % jugadoresActivos.length;
    const siguienteJuez = jugadoresActivos[indiceJuez];

    dispatch({
      tipo: 'AVANZAR_TURNO',
      indiceTurno: jugadores.findIndex(j => j.nombre === siguienteJugador.nombre),
      jugadorActivo: siguienteJugador.nombre,
      juez: siguienteJuez.nombre,
      actividad: seleccionarActividadAleatoria()
    });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="bg-superficie rounded-2xl p-3 md:p-4 flex-1 flex flex-col justify-between border border-neutro overflow-hidden">
        
        {/* Cabecera del panel de acción */}
        <div className="text-center flex-shrink-0">
          <h2 className="font-condensada font-bold text-texto uppercase text-base md:text-lg tracking-wider mb-1">
            ÁREA DE ACCIÓN
          </h2>
          <div>
            <span className="text-textoSecundario font-condensada uppercase text-xs md:text-sm">
              TURNO ACTUAL:
            </span>
            <span className="text-accion font-condensada font-bold uppercase text-sm md:text-base ml-2">
              {jugadorActivo.nombre}
            </span>
          </div>
        </div>

        {actividadActual && (
          <div className="my-auto flex flex-col items-center justify-center overflow-hidden w-full">
            {/* Contenedor 3D con animacion de giro */}
            <div className="w-full max-w-xl perspective-1000">
              <AnimatePresence mode="wait">
                {turno.paso !== 'comodin_revelado' ? (
                  <motion.div
                    key={`actividad-${claveActividad}`}
                    initial="entrada"
                    animate="activo"
                    exit="salida"
                    variants={variantesCambioTurno}
                    className="w-full rounded-2xl overflow-hidden shadow-lg border border-slate-1 bg-superficie"
                  >
                    <div className="bg-morado px-10 py-5 flex items-center justify-between">
                      <motion.span 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-texto font-condensada font-bold uppercase tracking-wider text-sm md:text-base"
                      >
                        TARJETA DE ACTIVIDAD
                      </motion.span>
                      {actividadActual.categoria && (
                        <motion.span 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 }}
                          className="text-xs font-condensada font-bold uppercase tracking-wide px-2.5 py-0.5 bg-white/20 text-white rounded-full"
                        >
                          {actividadActual.categoria}
                        </motion.span>
                      )}
                    </div>

                    <div className="bg-tarjetaCuerpo px-11 py-3 text-center space-y-2">
                      <motion.h3 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-tarjetaTexto font-condensada font-bold uppercase text-xl md:text-2xl leading-snug break-words"
                      >
                        {actividadActual.texto}
                      </motion.h3>

                      {actividadActual.descripcion && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                          className="border-t border-slate-100 pt-6"
                        >
                          <p className="text-slate-800 font-sans text-bg md:text-xl leading-relaxed text-center font-normal">
                            {actividadActual.descripcion}
                          </p>
                        </motion.div>
                      )}
                      
                    </div>
                  </motion.div>
                ) : (
                  /* Cara trasera: Tarjeta de Comodín Revelado */
                  <motion.div
                    key={`comodin-${claveActividad}`}
                    initial="oculto"
                    animate="revelado"
                    variants={variantesComodin}
                    className="w-full rounded-2xl overflow-hidden shadow-2xl border border-accion/60 bg-superficie"
                  >
                    <div className="bg-accion px-5 py-2.5 flex items-center justify-between">
                      <motion.span 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-white font-condensada font-bold uppercase tracking-wider text-sm md:text-base flex items-center gap-2"
                      >
                        <motion.svg 
                          initial={{ rotate: -180, opacity: 0 }}
                          animate={{ rotate: 0, opacity: 1 }}
                          transition={{ delay: 0.4, duration: 0.5 }}
                          className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"
                        >
                          <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944z" clipRule="evenodd" />
                        </motion.svg>
                        COMODÍN REVELADO
                      </motion.span>
                      <motion.span 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-xs font-condensada font-bold uppercase px-2.5 py-0.5 bg-white/20 text-white rounded-full"
                      >
                        {turno.comodin_activo?.efecto === 'salvar' ? 'SALVARSE' : 'CAMBIO DE RETO'}
                      </motion.span>
                    </div>

                    <div className="bg-tarjetaCuerpo px-5 py-4 text-center space-y-2">
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="inline-block px-2.5 py-0.5 bg-blue-100 text-accion font-condensada font-bold uppercase text-[11px] rounded-full"
                      >
                        Efecto aplicado
                      </motion.div>

                      <motion.h3 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7 }}
                        className="text-tarjetaTexto font-condensada font-bold uppercase text-xl md:text-2xl leading-snug break-words"
                      >
                        {turno.comodin_activo?.nombre || turno.comodin_activo?.texto}
                      </motion.h3>

                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="border-t border-slate-300 pt-2"
                      >
                        <p className="text-slate-700 font-sans text-xs md:text-sm leading-relaxed text-center font-normal">
                          {turno.comodin_activo?.texto}
                        </p>
                      </motion.div>

                      {turno.comodin_activo?.efecto === 'salvar' ? (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.9 }}
                          className="p-2 bg-activo/10 rounded-xl border border-activo/30"
                        >
                          <p className="text-activo font-condensada font-bold uppercase text-xs md:text-sm">
                            ¡Te salvas de la actividad! No sumas segundos.
                          </p>
                        </motion.div>
                      ) : (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.9 }}
                          className="p-2 bg-accion/10 rounded-xl border border-accion/30 text-[11px] text-slate-700"
                        >
                          <span className="font-condensada font-bold uppercase text-accion block text-xs mb-0.5">
                            Nueva actividad sustituta:
                          </span>
                          <span className="font-semibold">{actividadActual.texto}</span>
                          <span className="block mt-0.5 font-condensada font-bold text-peligro">
                            Trago: <NumeroAnimado valor={actividadActual.trago_segundos} />s
                          </span>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Seccion de Requerimiento y Trompo con trago en segundos */}
            {turno.paso !== 'comodin_revelado' ? (
              <div className="mt-3 text-center flex flex-col items-center flex-shrink-0">
                <span className="text-textoSecundario font-condensada font-bold uppercase tracking-wider text-xs mb-1">
                  REQUERIMIENTO
                </span>

                {turno.paso === 'en_curso' ? (
                  <RelojTrago 
                    segundos={actividadActual?.trago_segundos || 0} 
                    activo={true}
                    dispatch={dispatch}
                  />
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="my-0.5 text-accion">
                      <svg className="w-9 h-9" viewBox="0 0 48 48" fill="none">
                        <path d="M12 24 A12 12 0 0 1 36 24" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 3"/>
                        <path d="M36 24 A12 12 0 0 1 12 24" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 3"/>
                        <polygon points="24,6 34,16 28,38 24,42 20,38 14,16" fill="#1E293B" stroke="#94A3B8" strokeWidth="2"/>
                        <line x1="16" y1="20" x2="32" y2="20" stroke="#EF4444" strokeWidth="2.5"/>
                        <line x1="18" y1="26" x2="30" y2="26" stroke="#3B82F6" strokeWidth="2.5"/>
                        <line x1="21" y1="32" x2="27" y2="32" stroke="#10B981" strokeWidth="2.5"/>
                        <circle cx="24" cy="5" r="2" fill="#F8FAFC"/>
                      </svg>
                    </div>

                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                      className="text-3xl md:text-4xl font-bold text-peligro font-condensada uppercase tracking-wide"
                    >
                      ¡BEBE <NumeroAnimado valor={actividadActual.trago_segundos} /> SEGUNDOS!
                    </motion.div>
                  </div>
                )}
              </div>
            ) : (
              /* Accion de confirmacion tras revelar comodin */
              <div className="mt-3 w-full max-w-xl flex-shrink-0">
                {turno.comodin_activo?.efecto === 'salvar' ? (
                  <button
                    onClick={manejarContinuarComodinSalvar}
                    className="w-full bg-activo hover:bg-activoOscuro text-white font-condensada font-bold py-3 px-6 rounded-xl border-b-4 border-activoOscuro transition-colors duration-200 uppercase tracking-wider text-base"
                  >
                    CONTINUAR Y SALVAR TURNO
                  </button>
                ) : (
                  <button
                    onClick={manejarContinuarComodinCambiar}
                    className="w-full bg-accion hover:bg-accionOscuro text-white font-condensada font-bold py-3 px-6 rounded-xl border-b-4 border-accionOscuro transition-colors duration-200 uppercase tracking-wider text-base"
                  >
                    ASUMIR NUEVO RETO CAMBIADO
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Botones de decisión fijos al pie sin overflow */}
        {turno.paso === 'eleccion' && (
          <div className="flex gap-3 mt-2 flex-shrink-0">
            <motion.button
              onClick={manejarAceptar}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 bg-activo text-white font-condensada font-bold py-2.5 px-4 rounded-xl border-b-4 border-activoOscuro hover:bg-activoOscuro transition-colors duration-200 uppercase text-sm md:text-base cursor-pointer"
 initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <motion.span
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ACEPTAR RETO
              </motion.span>
            </motion.button>
            <motion.button
              onClick={manejarComodin}
              disabled={jugadorActivo.comodines === 0}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={`flex-1 font-condensada font-bold py-2.5 px-4 rounded-xl border-b-4 transition-colors duration-200 uppercase text-sm md:text-base ${
                jugadorActivo.comodines === 0
                  ? 'bg-neutro text-textoSecundario cursor-not-allowed opacity-50 border-neutro'
                  : 'bg-accion text-white border-accionOscuro hover:bg-accionOscuro cursor-pointer'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              {jugadorActivo.comodines === 0 ? 'SIN COMODINES' : (
                <>
                  <motion.span
                    animate={{ rotate: jugadorActivo.comodines > 0 ? [0, 5, -5, 0] : 0 }}
                    transition={{ duration: 0.5, repeat: jugadorActivo.comodines > 0 ? Infinity : 0 }}
                  >
                    USAR COMODÍN
                  </motion.span>
                  <span className="block text-[11px] font-normal">
                    (<NumeroAnimado valor={jugadorActivo.comodines} /> DISPONIBLE{jugadorActivo.comodines !== 1 ? 'S' : ''})
                  </span>
                </>
              )}
            </motion.button>
            <motion.button
              onClick={manejarNegarse}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 bg-peligro text-white font-condensada font-bold py-2.5 px-4 rounded-xl border-b-4 border-peligroOscuro hover:bg-peligroOscuro transition-colors duration-200 uppercase text-sm md:text-base cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              NEGARSE Y ASUMIR CASTIGO
              <span className="block text-[11px] font-normal flex items-center justify-center gap-1">
                <motion.svg 
                  className="w-3.5 h-3.5" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                  animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </motion.svg>
                (RECIBIRÁS UN CASTIGO)
              </span>
            </motion.button>
          </div>
        )}

        <PanelJuez estado={estado} dispatch={dispatch} />
      </div>
    </div>
  );
}

export default AreaAccion;
