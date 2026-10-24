import { useState, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { etiquetas } from '../ui/etiquetas';
import { variantesTarjeta, variantesComodin, variantesCastigo, variantesCambioTurno, NumeroAnimado } from '../ui/animaciones.jsx';
import RelojTrago from './RelojTrago';
import PanelJuez from './PanelJuez';
import ModalCastigo from './ModalCastigo';

/**
 * Paletas de degradado para las cartas. Cada categoría recibe siempre la misma
 * paleta (se calcula a partir de su nombre), así que funciona con cualquier
 * categoría nueva que agregues a tus datos sin tocar este archivo.
 */
const paletasCategoria = [
  ['#D946EF', '#7C3AED'], // fucsia → violeta
  ['#F97316', '#DC2626'], // naranja → rojo
  ['#06B6D4', '#2563EB'], // cian → azul
  ['#10B981', '#0D9488'], // verde → turquesa
  ['#F59E0B', '#EA580C'], // ámbar → naranja
  ['#EC4899', '#E11D48'], // rosa → carmesí
];

const paletaDeCategoria = (categoria = '') => {
  const suma = [...categoria].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return paletasCategoria[suma % paletasCategoria.length];
};

/**
 * Posición de cada carta de la baraja que asoma por detrás de la carta principal.
 * La primera es la más cercana; las siguientes quedan más abajo y más giradas.
 */
const capasBaraja = [
  { rotar: 1.5, x: 5, y: 4 },
  { rotar: -2.2, x: -7, y: 7 },
  { rotar: 3, x: 8, y: 10 }
];

/**
 * Cartas apiladas detrás de la actividad: son los reversos de la baraja.
 * Cada vez que cambia `clave` (nueva carta) salen de debajo de la principal
 * y se abren en abanico. Con "reducir movimiento" aparecen ya colocadas.
 *
 * @param {number} cantidad - Cuántas cartas se asoman (0 a 3).
 * @param {string} colorA - Primer color del borde.
 * @param {string} colorB - Segundo color del borde.
 * @param {number} clave - Cambia con cada carta nueva para repetir la animación.
 */
function CapasBaraja({ cantidad, colorA, colorB, clave }) {
  const reducir = useReducedMotion();
  if (cantidad <= 0) return null;

  // Se pintan de la más lejana a la más cercana para que se apilen bien
  const capas = capasBaraja.slice(0, cantidad).map((capa, i) => ({ ...capa, i })).reverse();

  return (
    <div className="pointer-events-none" aria-hidden="true">
      {capas.map(({ i, rotar, x, y }) => (
        <motion.div
          key={`${i}-${clave}`}
          className="absolute left-5 right-5 top-4 bottom-6 rounded-3xl p-[3px]"
          style={{
            background: `linear-gradient(135deg, ${colorA}, ${colorB})`,
            filter: `brightness(${0.78 - i * 0.12})`,
            boxShadow: '0 10px 28px rgba(0, 0, 0, 0.4)'
          }}
          initial={reducir ? false : { opacity: 0, x: 0, y: 0, rotate: 0 }}
          animate={{ opacity: 1, x, y, rotate: rotar }}
          transition={{ type: 'spring', stiffness: 120, damping: 14, delay: reducir ? 0 : 0.25 + i * 0.08 }}
        >
          {/* Reverso de la carta: fondo oscuro con rayado diagonal */}
          <div
            className="w-full h-full rounded-[22px] bg-[#0F172A]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0 6px, transparent 6px 14px)'
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}

/**
 * Componente del área de acción principal.
 * Muestra la actividad actual, el reloj de trago y los botones de decisión.
 *
 * @param {Object} estado - Estado actual de la partida.
 * @param {Function} dispatch - Función para despachar acciones al reducer.
 */
function AreaAccion({ estado, dispatch }) {
  // Los hooks siempre van ANTES de cualquier return condicional
  const [animandoGiro, setAnimandoGiro] = useState(false);
  const [claveActividad, setClaveActividad] = useState(0);

  // Castigo que se está mostrando en el modal (null = ninguno). Vive aquí, y no en
  // PanelJuez, porque al terminar la validación el turno avanza y PanelJuez se oculta.
  const [castigoMostrado, setCastigoMostrado] = useState(null);

  const { turno, jugadores, indice_turno, ronda_actual } = estado.estado_partida;
  const jugadorActivo = jugadores[indice_turno];
  const { actividades, comodines } = estado.datos;

  // Si el estado todavía no trae actividad, se usa una de respaldo. Se elige UNA vez
  // por turno: antes se sorteaba en cada render y la carta podía cambiar sola
  // (por ejemplo, al aceptar el reto).
  const actividadRespaldo = useMemo(
    () => (actividades.length > 0 ? actividades[Math.floor(Math.random() * actividades.length)] : null),
    [jugadorActivo?.nombre, ronda_actual, actividades]
  );

  // La carta solo se anima cuando cambia el turno (lo decide el juez) o se usa un comodín.
  // Aceptar el reto NO cambia esta clave.
  const claveCarta = `${ronda_actual}-${indice_turno}-${claveActividad}`;

  if (!jugadorActivo) return null;

  const seleccionarActividadAleatoria = () => {
    if (actividades.length === 0) return null;
    return actividades[Math.floor(Math.random() * actividades.length)];
  };

  const actividadActual = turno.actividad || actividadRespaldo;
  const [colorA, colorB] = paletaDeCategoria(actividadActual?.categoria);

  // La baraja toma el color de lo que se está mostrando (azul si es un comodín)
  const [barajaA, barajaB] = turno.paso === 'comodin_revelado'
    ? ['#3B82F6', '#22D3EE']
    : [colorA, colorB];
  // Se asoman hasta 3 cartas, según cuántas actividades hay en el mazo
  const cartasEnBaraja = Math.min(3, Math.max(0, actividades.length - 1));

  const manejarAceptar = () => {
    // La actividad se mantiene: solo cambia de paso (en curso → confirmación del juez).
    // Se envía la actividad mostrada para que el reducer la conserve en turno.actividad.
    dispatch({
      tipo: 'ACEPTAR_RETO',
      actividad: actividadActual
    });
  };

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

    if (castigoAleatorio) {
      setCastigoMostrado({
        jugador: jugadorActivo.nombre,
        indice: indice_turno,
        motivo: 'negarse',
        castigo: castigoAleatorio,
        actividad: actividadActual?.texto,
        segundos: tragoSegundos
      });
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
      <div className="panel-cristal rounded-3xl p-3 md:p-5 flex-1 min-h-0 flex flex-col gap-3 overflow-hidden">

        {/* Cabecera: el turno es el dato clave, así que el nombre va grande */}
        <div className="text-center flex-shrink-0">
          <p className="text-textoSecundario font-condensada font-bold uppercase tracking-wider text-xs md:text-sm">
            Turno de
          </p>
          <motion.p
            key={jugadorActivo.nombre}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="fuente-juego text-3xl md:text-4xl leading-none text-white"
            style={{ textShadow: `0 0 28px ${colorA}aa` }}
          >
            {jugadorActivo.nombre}
          </motion.p>

          {/* El castigo dura varias rondas: el jugador puede volver a leerlo en su turno */}
          <div className="h-8 mt-1 flex items-center justify-center">
          {jugadorActivo.castigos_activos.length > 0 && (
            <button
              type="button"
              onClick={() => setCastigoMostrado({
                modo: 'consulta',
                jugador: jugadorActivo.nombre,
                indice: indice_turno,
                castigos: jugadorActivo.castigos_activos
              })}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-peligro/15 border border-peligro/50 text-red-200 text-xs md:text-sm font-condensada font-bold hover:bg-peligro/30 transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {jugadorActivo.castigos_activos.length === 1 ? 'Ver mi castigo' : 'Ver mis castigos'}
            </button>
          )}
          </div>
        </div>

        {actividadActual && (
          <div className="flex-1 min-h-0 flex flex-col items-center justify-center w-full gap-1">
            {/* Contenedor 3D con animación de giro */}
            <div className="relative w-full max-w-xl flex-1 min-h-[11rem] max-h-[24rem] perspective-1000 px-5 pt-4 pb-6">
              <CapasBaraja
                cantidad={cartasEnBaraja}
                colorA={barajaA}
                colorB={barajaB}
                clave={claveCarta}
              />
              <AnimatePresence mode="wait">
                {turno.paso !== 'comodin_revelado' ? (
                  <motion.div
                    key={`actividad-${claveCarta}`}
                    initial="entrada"
                    animate="activo"
                    exit="salida"
                    variants={variantesCambioTurno}
                    className="relative z-10 w-full h-full rounded-3xl p-[3px]"
                    style={{
                      background: `linear-gradient(135deg, ${colorA}, ${colorB})`,
                      boxShadow: `0 20px 60px ${colorA}66`
                    }}
                  >
                    <div className="h-full flex flex-col rounded-[22px] overflow-hidden bg-tarjetaCuerpo">
                      <div
                        className="flex-shrink-0 px-5 py-3 flex items-center justify-between gap-3"
                        style={{ background: `linear-gradient(135deg, ${colorA}, ${colorB})` }}
                      >
                        <motion.span
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                          className="text-white font-condensada font-bold uppercase tracking-wider text-sm md:text-base"
                        >
                          Tarjeta de actividad
                        </motion.span>
                        {actividadActual.categoria && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-xs font-condensada font-bold uppercase tracking-wide px-3 py-1 bg-black/25 text-white rounded-full truncate max-w-[55%]"
                          >
                            {actividadActual.categoria}
                          </motion.span>
                        )}
                      </div>

                      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 text-center flex flex-col space-y-3 [&>*:first-child]:mt-auto [&>*:last-child]:mb-auto">
                        <motion.h3
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          className="fuente-juego text-tarjetaTexto text-xl md:text-2xl leading-tight break-words"
                        >
                          {actividadActual.texto}
                        </motion.h3>

                        {actividadActual.descripcion && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="border-t border-slate-200 pt-3"
                          >
                            <p className="text-slate-800 font-sans text-base md:text-xl leading-relaxed text-center font-normal">
                              {actividadActual.descripcion}
                            </p>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  /* Cara trasera: Tarjeta de Comodín Revelado */
                  <motion.div
                    key={`comodin-${claveCarta}`}
                    initial="oculto"
                    animate="revelado"
                    variants={variantesComodin}
                    className="relative z-10 w-full h-full rounded-3xl p-[3px]"
                    style={{
                      background: 'linear-gradient(135deg, #60A5FA, #2563EB, #22D3EE)',
                      boxShadow: '0 20px 60px rgba(59,130,246,0.5)'
                    }}
                  >
                    <div className="h-full flex flex-col rounded-[22px] overflow-hidden bg-tarjetaCuerpo">
                      <div className="flex-shrink-0 bg-gradient-to-r from-blue-500 to-blue-700 px-5 py-3 flex items-center justify-between gap-3">
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
                          Comodín revelado
                        </motion.span>
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5 }}
                          className="text-xs font-condensada font-bold uppercase px-3 py-1 bg-black/25 text-white rounded-full truncate max-w-[55%]"
                        >
                          {turno.comodin_activo?.efecto === 'salvar' ? 'Salvarse' : 'Cambio de reto'}
                        </motion.span>
                      </div>

                      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 text-center flex flex-col space-y-3 [&>*:first-child]:mt-auto [&>*:last-child]:mb-auto">
                        <motion.h3
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.7 }}
                          className="fuente-juego text-tarjetaTexto text-xl md:text-2xl leading-tight break-words"
                        >
                          {turno.comodin_activo?.nombre || turno.comodin_activo?.texto}
                        </motion.h3>

                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.8 }}
                          className="border-t border-slate-200 pt-3"
                        >
                          <p className="text-slate-700 font-sans text-sm md:text-base leading-relaxed text-center font-normal">
                            {turno.comodin_activo?.texto}
                          </p>
                        </motion.div>

                        {turno.comodin_activo?.efecto === 'salvar' ? (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.9 }}
                            className="p-3 bg-emerald-50 rounded-xl border border-emerald-300"
                          >
                            <p className="text-emerald-700 font-condensada font-bold uppercase text-sm md:text-base">
                              ¡Te salvas de la actividad! No sumas segundos.
                            </p>
                          </motion.div>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.9 }}
                            className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-sm text-slate-700"
                          >
                            <span className="font-condensada font-bold uppercase text-accion block text-xs mb-1">
                              Nueva actividad sustituta
                            </span>
                            <span className="font-semibold">{actividadActual.texto}</span>
                            <span className="block mt-1 font-condensada font-bold text-peligro">
                              Trago: <NumeroAnimado valor={actividadActual.trago_segundos} />s
                            </span>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Requerimiento: es lo que el jugador tiene que hacer, así que es lo más grande */}
            {turno.paso !== 'comodin_revelado' ? (
              <div className="text-center flex flex-col items-center justify-center flex-shrink-0 min-h-[8rem]">
                <span className="text-textoSecundario font-condensada font-bold uppercase tracking-wider text-xs mb-1">
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
                    <div className="my-0.5 text-accion">
                      <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
                        <path d="M12 24 A12 12 0 0 1 36 24" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 3"/>
                        <path d="M36 24 A12 12 0 0 1 12 24" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 3"/>
                        <polygon points="24,6 34,16 28,38 24,42 20,38 14,16" fill="#1E293B" stroke="#94A3B8" strokeWidth="2"/>
                        <line x1="16" y1="20" x2="32" y2="20" stroke="#EF4444" strokeWidth="2.5"/>
                        <line x1="18" y1="26" x2="30" y2="26" stroke="#3B82F6" strokeWidth="2.5"/>
                        <line x1="21" y1="32" x2="27" y2="32" stroke="#10B981" strokeWidth="2.5"/>
                        <circle cx="24" cy="5" r="2" fill="#F8FAFC"/>
                      </svg>
                    </div>

                    {/* La entrada (framer) y el latido (CSS) van en elementos distintos
                        para que sus transform no se pisen entre sí */}
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                    >
                      <div className="animar-latido fuente-juego texto-fuego text-2xl md:text-4xl uppercase tracking-wide">
                        ¡Bebe <NumeroAnimado valor={actividadActual.trago_segundos} /> segundos!
                      </div>
                    </motion.div>
                  </div>
                )}
              </div>
            ) : (
              /* Acción de confirmación tras revelar comodín */
              <div className="w-full max-w-xl flex-shrink-0 min-h-[8rem] flex flex-col justify-center">
                {turno.comodin_activo?.efecto === 'salvar' ? (
                  <button
                    onClick={manejarContinuarComodinSalvar}
                    className="boton-juego boton-aceptar w-full text-white font-condensada py-3 px-6 tracking-wider text-base"
                  >
                    Continuar y salvar turno
                  </button>
                ) : (
                  <button
                    onClick={manejarContinuarComodinCambiar}
                    className="boton-juego boton-comodin w-full text-white font-condensada py-3 px-6 tracking-wider text-base"
                  >
                    Asumir nuevo reto
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Zona inferior de altura fija: así el panel no se encoge ni crece al cambiar de paso */}
        <div className="flex-shrink-0 min-h-[9.5rem] flex flex-col justify-end">
        {/* Botones de decisión. Aceptar pesa más: es la acción principal */}
        {turno.paso === 'eleccion' && (
          <div className="flex gap-3 mt-2 flex-shrink-0">
            <motion.button
              onClick={manejarAceptar}
              whileHover={{ y: -2 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="boton-juego boton-aceptar flex-[1.4] text-white font-condensada py-3 px-4 text-base md:text-lg cursor-pointer"
            >
              Aceptar reto
            </motion.button>

            <motion.button
              onClick={manejarComodin}
              disabled={jugadorActivo.comodines === 0}
              whileHover={jugadorActivo.comodines === 0 ? {} : { y: -2 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className={`flex-1 text-white font-condensada py-3 px-3 text-sm md:text-base ${
                jugadorActivo.comodines === 0
                  ? 'boton-juego bg-neutro border-slate-700 text-textoSecundario cursor-not-allowed opacity-50'
                  : 'boton-juego boton-comodin cursor-pointer'
              }`}
            >
              {jugadorActivo.comodines === 0 ? 'Sin comodines' : (
                <>
                  <span className="block">Usar comodín</span>
                  <span className="block text-[11px] font-normal normal-case opacity-90">
                    <NumeroAnimado valor={jugadorActivo.comodines} /> disponible{jugadorActivo.comodines !== 1 ? 's' : ''}
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
              className="boton-juego boton-negar flex-1 text-white font-condensada py-3 px-3 text-sm md:text-base cursor-pointer"
            >
              <span className="block">Negarse</span>
              <span className="block text-[11px] font-normal normal-case opacity-90">
                y recibir un castigo
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