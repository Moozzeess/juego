import { useState, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { etiquetas } from '../ui/etiquetas';
import {
  variantesTarjeta, variantesComodin, variantesCastigo,
  variantesCambioTurno, NumeroAnimado
} from '../ui/animaciones.jsx';
import RelojTrago from './RelojTrago';
import PanelJuez from './PanelJuez';
import ModalCastigo from './ModalCastigo';

const paletasCategoria = [
  ['#D946EF', '#7C3AED'],
  ['#F97316', '#DC2626'],
  ['#06B6D4', '#2563EB'],
  ['#10B981', '#0D9488'],
  ['#F59E0B', '#EA580C'],
  ['#EC4899', '#E11D48'],
];

const paletaDeCategoria = (categoria = '') => {
  const suma = [...categoria].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return paletasCategoria[suma % paletasCategoria.length];
};

const capasBaraja = [
  { rotar: 1.5, x: 5, y: 4 },
  { rotar: -2.2, x: -7, y: 7 },
  { rotar: 3, x: 8, y: 10 }
];

function CapasBaraja({ cantidad, colorA, colorB, clave }) {
  const reducir = useReducedMotion();
  if (cantidad <= 0) return null;
  const capas = capasBaraja.slice(0, cantidad).map((capa, i) => ({ ...capa, i })).reverse();
  return (
    <div className="pointer-events-none" aria-hidden="true">
      {capas.map(({ i, rotar, x, y }) => (
        <motion.div
          key={`${i}-${clave}`}
          className="absolute left-3 right-3 top-3 bottom-4 sm:left-5 sm:right-5 sm:top-4 sm:bottom-6 rounded-2xl sm:rounded-3xl p-[3px]"
          style={{
            background: `linear-gradient(135deg, ${colorA}, ${colorB})`,
            filter: `brightness(${0.78 - i * 0.12})`,
            boxShadow: '0 10px 28px rgba(0,0,0,0.4)'
          }}
          initial={reducir ? false : { opacity: 0, x: 0, y: 0, rotate: 0 }}
          animate={{ opacity: 1, x, y, rotate: rotar }}
          transition={{ type: 'spring', stiffness: 120, damping: 14, delay: reducir ? 0 : 0.25 + i * 0.08 }}
        >
          <div
            className="w-full h-full rounded-[18px] sm:rounded-[22px] bg-[#0F172A]"
            style={{ backgroundImage: 'repeating-linear-gradient(45deg,rgba(255,255,255,0.05) 0 6px,transparent 6px 14px)' }}
          />
        </motion.div>
      ))}
    </div>
  );
}

function AreaAccion({ estado, dispatch }) {
  const [animandoGiro, setAnimandoGiro] = useState(false);
  const [claveActividad, setClaveActividad] = useState(0);
  const [castigoMostrado, setCastigoMostrado] = useState(null);

  const { turno, jugadores, indice_turno, ronda_actual } = estado.estado_partida;
  const jugadorActivo = jugadores[indice_turno];
  const { actividades, comodines } = estado.datos;

  const actividadRespaldo = useMemo(
    () => actividades.length > 0
      ? actividades[Math.floor(Math.random() * actividades.length)]
      : null,
    [jugadorActivo?.nombre, ronda_actual, actividades]
  );

  const claveCarta = `${ronda_actual}-${indice_turno}-${claveActividad}`;

  if (!jugadorActivo) return null;

  const seleccionarActividadAleatoria = () => {
    if (actividades.length === 0) return null;
    return actividades[Math.floor(Math.random() * actividades.length)];
  };

  const actividadActual = turno.actividad || actividadRespaldo;
  const [colorA, colorB] = paletaDeCategoria(actividadActual?.categoria);
  const [barajaA, barajaB] = turno.paso === 'comodin_revelado'
    ? ['#3B82F6', '#22D3EE'] : [colorA, colorB];
  const cartasEnBaraja = Math.min(3, Math.max(0, actividades.length - 1));

  const manejarAceptar = () => {
    dispatch({ tipo: 'ACEPTAR_RETO', actividad: actividadActual });
  };

  const manejarComodin = () => {
    if (jugadorActivo.comodines === 0 || animandoGiro) return;
    const comodinAleatorio = comodines[Math.floor(Math.random() * comodines.length)];
    const nuevosJugadores = [...jugadores];
    nuevosJugadores[indice_turno] = { ...jugadorActivo, comodines: jugadorActivo.comodines - 1 };
    setAnimandoGiro(true);
    setClaveActividad(prev => prev + 1);
    setTimeout(() => {
      if (comodinAleatorio.efecto === 'salvar') {
        dispatch({ tipo: 'USAR_COMODIN', jugadores: nuevosJugadores, comodin: comodinAleatorio, esSalvar: true });
      } else {
        dispatch({
          tipo: 'USAR_COMODIN',
          jugadores: nuevosJugadores,
          comodin: comodinAleatorio,
          actividad: {
            id: comodinAleatorio.id,
            texto: comodinAleatorio.nombre || comodinAleatorio.texto,
            descripcion: comodinAleatorio.texto,
            trago_segundos: comodinAleatorio.trago_segundos || 0.02,
            categoria: 'Comodín de Cambio'
          },
          esSalvar: false
        });
      }
      setAnimandoGiro(false);
    }, 450);
  };

  const manejarContinuarComodinSalvar = () => {
    const nuevoHistorial = [
      ...estado.estado_partida.historial,
      { tipo: 'comodin_usado', jugador: jugadorActivo.nombre, actividad: `Usó comodín (Salvar): ${turno.comodin_activo?.nombre || 'Salvado'}`, trago_segundos: 0, ronda: ronda_actual }
    ];
    dispatch({ tipo: 'CONFIRMAR_CUMPLIMIENTO', jugadores, historial: nuevoHistorial });
    manejarAvanzarTurno();
  };

  const manejarContinuarComodinCambiar = () => {
    dispatch({ tipo: 'CONTINUAR_COMODIN', pasoSiguiente: 'eleccion' });
  };

  const manejarNegarse = () => {
    const nuevosJugadores = [...jugadores];
    const tragoSegundos = actividadActual?.trago_segundos || 0;
    nuevosJugadores[indice_turno] = {
      ...jugadorActivo,
      liquido_acumulado: jugadorActivo.liquido_acumulado + tragoSegundos,
      puntos_negativos: jugadorActivo.puntos_negativos + 1
    };
    const castigoAleatorio = estado.datos.castigos[Math.floor(Math.random() * estado.datos.castigos.length)];
    if (castigoAleatorio) {
      nuevosJugadores[indice_turno] = {
        ...nuevosJugadores[indice_turno],
        castigos_activos: [
          ...jugadorActivo.castigos_activos,
          { id: castigoAleatorio.id, texto: castigoAleatorio.texto, rondas_restantes: castigoAleatorio.duracion_rondas }
        ]
      };
      setCastigoMostrado({ jugador: jugadorActivo.nombre, indice: indice_turno, motivo: 'negarse', castigo: castigoAleatorio, actividad: actividadActual?.texto, segundos: tragoSegundos });
    }
    dispatch({ tipo: 'NEGARSE', jugadores: nuevosJugadores });
  };

  const manejarAvanzarTurno = () => {
    const jugadoresActivos = jugadores.filter(j => !j.descalificado && !j.retirado);
    if (jugadoresActivos.length < 2) {
      dispatch({ tipo: 'IR_A_CIERRE', resultado_final: { ganador: jugadoresActivos.length === 1 ? jugadoresActivos[0] : null, esSinGanador: jugadoresActivos.length === 0 } });
      return;
    }
    const indiceJugadorActual = jugadoresActivos.findIndex(j => j.nombre === jugadorActivo.nombre);
    const siguienteIndice = (indiceJugadorActual + 1) % jugadoresActivos.length;
    if (siguienteIndice === 0) {
      const jugadoresConCastigosActualizados = jugadores.map(j => ({
        ...j,
        castigos_activos: j.castigos_activos.map(c => ({ ...c, rondas_restantes: c.rondas_restantes - 1 })).filter(c => c.rondas_restantes > 0)
      }));
      const nuevaRonda = ronda_actual + 1;
      if (nuevaRonda > estado.configuracion.rondas_totales) {
        dispatch({ tipo: 'IR_A_CIERRE', resultado_final: { jugadores: jugadoresConCastigosActualizados } });
        return;
      }
      dispatch({ tipo: 'CERRAR_RONDA', rondaActual: nuevaRonda, jugadores: jugadoresConCastigosActualizados, historial: estado.estado_partida.historial });
    }
    const siguienteJugador = jugadoresActivos[siguienteIndice];
    const indiceJuez = (siguienteIndice + 1) % jugadoresActivos.length;
    const siguienteJuez = jugadoresActivos[indiceJuez];
    dispatch({ tipo: 'AVANZAR_TURNO', indiceTurno: jugadores.findIndex(j => j.nombre === siguienteJugador.nombre), jugadorActivo: siguienteJugador.nombre, juez: siguienteJuez.nombre, actividad: seleccionarActividadAleatoria() });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="panel-cristal rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 md:p-5 flex-1 min-h-0 flex flex-col gap-2 sm:gap-3 overflow-hidden">

        {/* Cabecera: nombre del jugador + castigos */}
        <div className="text-center flex-shrink-0">
          <p className="text-textoSecundario font-condensada font-bold uppercase tracking-wider text-[10px] sm:text-xs">
            Turno de
          </p>
          <motion.p
            key={jugadorActivo.nombre}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="fuente-juego text-2xl sm:text-3xl md:text-4xl leading-none text-white"
            style={{ textShadow: `0 0 28px ${colorA}aa` }}
          >
            {jugadorActivo.nombre}
          </motion.p>

          {jugadorActivo.castigos_activos.length > 0 && (
            <div className="mt-1">
              <button
                type="button"
                onClick={() => setCastigoMostrado({ modo: 'consulta', jugador: jugadorActivo.nombre, indice: indice_turno, castigos: jugadorActivo.castigos_activos })}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-peligro/15 border border-peligro/50 text-red-200 text-[10px] sm:text-xs font-condensada font-bold hover:bg-peligro/30 transition-colors cursor-pointer"
              >
                <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {jugadorActivo.castigos_activos.length === 1 ? 'Ver mi castigo' : `${jugadorActivo.castigos_activos.length} castigos`}
              </button>
            </div>
          )}
        </div>

        {/* Carta de actividad */}
        {actividadActual && (
          <div className="flex-1 min-h-0 flex flex-col items-center w-full gap-1.5 sm:gap-2">
            {/* Contenedor de la carta */}
            <div className="relative w-full max-w-xl flex-1 min-h-0 perspective-1000 px-3 sm:px-5 pt-3 sm:pt-4 pb-4 sm:pb-6">
              <CapasBaraja cantidad={cartasEnBaraja} colorA={barajaA} colorB={barajaB} clave={claveCarta} />

              <AnimatePresence mode="wait">
                {turno.paso !== 'comodin_revelado' ? (
                  <motion.div
                    key={`actividad-${claveCarta}`}
                    initial="entrada" animate="activo" exit="salida"
                    variants={variantesCambioTurno}
                    className="relative z-10 w-full h-full rounded-2xl sm:rounded-3xl p-[3px]"
                    style={{ background: `linear-gradient(135deg, ${colorA}, ${colorB})`, boxShadow: `0 16px 48px ${colorA}55` }}
                  >
                    <div className="h-full flex flex-col rounded-[18px] sm:rounded-[22px] overflow-hidden bg-tarjetaCuerpo">
                      {/* Header de la carta */}
                      <div
                        className="flex-shrink-0 px-3 sm:px-5 py-2 sm:py-3 flex items-center justify-between gap-2"
                        style={{ background: `linear-gradient(135deg, ${colorA}, ${colorB})` }}
                      >
                        <span className="text-white font-condensada font-bold uppercase tracking-wide text-xs sm:text-sm md:text-base">
                          Actividad
                        </span>
                        {actividadActual.categoria && (
                          <span className="text-[10px] sm:text-xs font-condensada font-bold uppercase px-2 sm:px-3 py-0.5 sm:py-1 bg-black/25 text-white rounded-full truncate max-w-[55%]">
                            {actividadActual.categoria}
                          </span>
                        )}
                      </div>

                      {/* Cuerpo de la carta */}
                      <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-3 sm:py-5 text-center flex flex-col space-y-2 sm:space-y-3 [&>*:first-child]:mt-auto [&>*:last-child]:mb-auto">
                        <h3 className="fuente-juego text-tarjetaTexto text-lg sm:text-xl md:text-2xl leading-tight break-words">
                          {actividadActual.texto}
                        </h3>
                        {actividadActual.descripcion && (
                          <div className="border-t border-slate-200 pt-2 sm:pt-3">
                            <p className="text-slate-800 font-sans text-sm sm:text-base md:text-lg leading-relaxed text-center">
                              {actividadActual.descripcion}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  /* Comodín revelado */
                  <motion.div
                    key={`comodin-${claveCarta}`}
                    initial="oculto" animate="revelado"
                    variants={variantesComodin}
                    className="relative z-10 w-full h-full rounded-2xl sm:rounded-3xl p-[3px]"
                    style={{ background: 'linear-gradient(135deg,#60A5FA,#2563EB,#22D3EE)', boxShadow: '0 16px 48px rgba(59,130,246,0.45)' }}
                  >
                    <div className="h-full flex flex-col rounded-[18px] sm:rounded-[22px] overflow-hidden bg-tarjetaCuerpo">
                      <div className="flex-shrink-0 bg-gradient-to-r from-blue-500 to-blue-700 px-3 sm:px-5 py-2 sm:py-3 flex items-center justify-between gap-2">
                        <span className="text-white font-condensada font-bold uppercase tracking-wide text-xs sm:text-sm flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944z" clipRule="evenodd" />
                          </svg>
                          Comodín revelado
                        </span>
                        <span className="text-[10px] sm:text-xs font-condensada font-bold uppercase px-2 sm:px-3 py-0.5 sm:py-1 bg-black/25 text-white rounded-full">
                          {turno.comodin_activo?.efecto === 'salvar' ? 'Salvarse' : 'Cambio'}
                        </span>
                      </div>
                      <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-3 sm:py-5 text-center flex flex-col space-y-2 sm:space-y-3 [&>*:first-child]:mt-auto [&>*:last-child]:mb-auto">
                        <h3 className="fuente-juego text-tarjetaTexto text-lg sm:text-xl md:text-2xl leading-tight break-words">
                          {turno.comodin_activo?.nombre || turno.comodin_activo?.texto}
                        </h3>
                        <div className="border-t border-slate-200 pt-2 sm:pt-3">
                          <p className="text-slate-700 font-sans text-sm sm:text-base leading-relaxed">
                            {turno.comodin_activo?.texto}
                          </p>
                        </div>
                        {turno.comodin_activo?.efecto === 'salvar' ? (
                          <div className="p-2.5 sm:p-3 bg-emerald-50 rounded-xl border border-emerald-300">
                            <p className="text-emerald-700 font-condensada font-bold uppercase text-xs sm:text-sm">
                              ¡Te salvas! No sumas segundos.
                            </p>
                          </div>
                        ) : (
                          <div className="p-2.5 sm:p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs sm:text-sm text-slate-700">
                            <span className="font-condensada font-bold uppercase text-accion block text-[10px] sm:text-xs mb-1">Nueva actividad</span>
                            <span className="font-semibold">{actividadActual.texto}</span>
                            <span className="block mt-1 font-condensada font-bold text-peligro">
                              Trago: <NumeroAnimado valor={actividadActual.trago_segundos} />s
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Requerimiento / reloj */}
            {turno.paso !== 'comodin_revelado' ? (
              <div className="text-center flex flex-col items-center justify-center flex-shrink-0 w-full py-1">
                <span className="text-textoSecundario font-condensada font-bold uppercase tracking-wider text-[10px] sm:text-xs mb-0.5">
                  Requerimiento
                </span>
                {turno.paso === 'en_curso' ? (
                  <RelojTrago
                    segundos={actividadActual?.trago_segundos || 0}
                    activo={true}
                    dispatch={dispatch}
                  />
                ) : (
                  <div className="flex flex-col items-center">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                    >
                      <div className="animar-latido fuente-juego texto-fuego text-xl sm:text-2xl md:text-4xl uppercase tracking-wide">
                        ¡Bebe <NumeroAnimado valor={actividadActual.trago_segundos} />s!
                      </div>
                    </motion.div>
                  </div>
                )}
              </div>
            ) : (
              /* Botón continuar comodín */
              <div className="w-full max-w-xl flex-shrink-0 px-3 sm:px-0">
                {turno.comodin_activo?.efecto === 'salvar' ? (
                  <button onClick={manejarContinuarComodinSalvar} className="boton-juego boton-aceptar w-full text-white font-condensada py-3 px-4 text-sm sm:text-base">
                    Continuar y salvar turno
                  </button>
                ) : (
                  <button onClick={manejarContinuarComodinCambiar} className="boton-juego boton-comodin w-full text-white font-condensada py-3 px-4 text-sm sm:text-base">
                    Asumir nuevo reto
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Botones de decisión + Panel Juez */}
        <div className="flex-shrink-0">
          {turno.paso === 'eleccion' && (
            <div className="flex gap-2 sm:gap-3">
              <motion.button
                onClick={manejarAceptar}
                whileHover={{ y: -2 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="boton-juego boton-aceptar flex-[1.4] text-white font-condensada py-3 sm:py-3.5 px-2 sm:px-4 text-sm sm:text-base md:text-lg cursor-pointer"
              >
                Aceptar
              </motion.button>

              <motion.button
                onClick={manejarComodin}
                disabled={jugadorActivo.comodines === 0}
                whileHover={jugadorActivo.comodines === 0 ? {} : { y: -2 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className={`flex-1 text-white font-condensada py-3 sm:py-3.5 px-2 sm:px-3 text-xs sm:text-sm md:text-base ${
                  jugadorActivo.comodines === 0
                    ? 'boton-juego bg-neutro border-slate-700 text-textoSecundario cursor-not-allowed opacity-50'
                    : 'boton-juego boton-comodin cursor-pointer'
                }`}
              >
                {jugadorActivo.comodines === 0 ? (
                  <span>Sin 🃏</span>
                ) : (
                  <>
                    <span className="block">Comodín</span>
                    <span className="block text-[10px] sm:text-[11px] font-normal normal-case opacity-90">
                      <NumeroAnimado valor={jugadorActivo.comodines} /> disp.
                    </span>
                  </>
                )}
              </motion.button>

              <motion.button
                onClick={manejarNegarse}
                whileHover={{ y: -2 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="boton-juego boton-negar flex-1 text-white font-condensada py-3 sm:py-3.5 px-2 sm:px-3 text-xs sm:text-sm md:text-base cursor-pointer"
              >
                <span className="block">Negarse</span>
                <span className="block text-[10px] sm:text-[11px] font-normal normal-case opacity-90 hidden sm:block">
                  + castigo
                </span>
              </motion.button>
            </div>
          )}

          <PanelJuez estado={estado} dispatch={dispatch} alCastigar={setCastigoMostrado} />
        </div>
      </div>

      <ModalCastigo datos={castigoMostrado} alCerrar={() => setCastigoMostrado(null)} />
    </div>
  );
}

export default AreaAccion;