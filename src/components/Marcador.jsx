import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { etiquetas } from '../ui/etiquetas';
import { variantesLista, variantesItemLista, NumeroAnimado } from '../ui/animaciones.jsx';

const coloresAvatar = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];

/**
 * Componente del marcador global.
 * Muestra el estado de todos los jugadores en la columna izquierda.
 *
 * @param {Object} estado - Estado actual de la partida.
 * @param {Function} dispatch - Función para despachar acciones al reducer.
 */
function Marcador({ estado, dispatch }) {
  const { jugadores } = estado.estado_partida;

  // Nombre del jugador que está confirmando su salida (evita retiros por un toque accidental)
  const [confirmandoSalida, setConfirmandoSalida] = useState(null);

  // Nombre del jugador cuyo castigo se está viendo en detalle
  const [detalleNombre, setDetalleNombre] = useState(null);

  // Escape cierra el detalle del castigo
  useEffect(() => {
    if (!detalleNombre) return;
    const alPulsar = (e) => {
      if (e.key === 'Escape') setDetalleNombre(null);
    };
    window.addEventListener('keydown', alPulsar);
    return () => window.removeEventListener('keydown', alPulsar);
  }, [detalleNombre]);

  // El nivel de cada barra se calcula respecto al jugador que más ha acumulado
  const maxLiquido = Math.max(1, ...jugadores.map(j => j.liquido_acumulado || 0));

  const manejarRetiro = (indice) => {
    const jugador = jugadores[indice];
    if (jugador.retirado || jugador.descalificado) return;

    const nuevosJugadores = [...jugadores];
    nuevosJugadores[indice] = {
      ...jugador,
      retirado: true
    };

    const estaVivo = (j) => !j.descalificado && !j.retirado;
    const jugadoresActivos = nuevosJugadores.filter(estaVivo);
    const indiceTurno = estado.estado_partida.indice_turno;

    let nuevoIndiceTurno = indiceTurno;
    let nuevoJugadorActivo = estado.estado_partida.jugador_activo;
    let nuevoJuez = estado.estado_partida.juez;

    if (jugadoresActivos.length > 0) {
      // Si se retira quien tenía el turno, pasa al siguiente jugador VIVO
      // buscando sobre la lista completa (así el índice coincide con `jugadores`)
      if (nuevoJugadorActivo === jugador.nombre) {
        for (let paso = 1; paso <= nuevosJugadores.length; paso++) {
          const candidato = (indiceTurno + paso) % nuevosJugadores.length;
          if (estaVivo(nuevosJugadores[candidato])) {
            nuevoIndiceTurno = candidato;
            nuevoJugadorActivo = nuevosJugadores[candidato].nombre;
            break;
          }
        }
      }

      // El juez es siempre el siguiente jugador vivo después del que tiene el turno
      const posicionActivo = jugadoresActivos.findIndex(j => j.nombre === nuevoJugadorActivo);
      const indiceJuez = (posicionActivo + 1) % jugadoresActivos.length;
      nuevoJuez = jugadoresActivos[indiceJuez]?.nombre || null;
    }

    dispatch({
      tipo: 'RETIRAR_JUGADOR',
      jugadores: nuevosJugadores,
      indiceTurno: nuevoIndiceTurno,
      jugadorActivo: nuevoJugadorActivo,
      juez: nuevoJuez
    });

    setConfirmandoSalida(null);
  };

  const obtenerEstadoTexto = (jugador) => {
    if (jugador.descalificado) return etiquetas.juego.estadoDescalificado;
    if (jugador.retirado) return etiquetas.juego.estadoRetirado;
    return etiquetas.juego.estadoActivo;
  };

  const obtenerEstadoColor = (jugador) => {
    if (jugador.descalificado) return 'text-peligro';
    if (jugador.retirado) return 'text-neutro';
    return 'text-activo';
  };

  // Se usa la posición del jugador (no la letra) para que dos nombres que
  // empiezan igual no terminen con el mismo color
  const obtenerColorAvatar = (indice) => coloresAvatar[indice % coloresAvatar.length];

  const esJugadorActivo = (jugador) => {
    return jugador.nombre === estado.estado_partida.jugador_activo && !jugador.descalificado && !jugador.retirado;
  };

  const esJuez = (jugador) => {
    return jugador.nombre === estado.estado_partida.juez && !jugador.descalificado && !jugador.retirado;
  };

  // Si el jugador ya no tiene castigos (terminaron), el detalle se cierra solo
  const jugadorDetalle = jugadores.find(
    j => j.nombre === detalleNombre && j.castigos_activos.length > 0
  );
  const indiceDetalle = jugadores.findIndex(j => j.nombre === detalleNombre);

  return (
    <div className="panel-cristal rounded-3xl p-3 h-full flex flex-col overflow-hidden">
      <h2 className="text-center fuente-juego text-texto text-base md:text-lg mb-3 flex-shrink-0">
        Jugadores
      </h2>

      <motion.div
        className="space-y-2.5 flex-1 overflow-y-auto pr-1"
        initial="oculto"
        animate="visible"
        variants={variantesLista}
      >
        <AnimatePresence>
          {jugadores.map((jugador, indice) => {
            const activo = esJugadorActivo(jugador);
            const fueraDeJuego = jugador.descalificado || jugador.retirado;
            const porcentaje = Math.min(100, ((jugador.liquido_acumulado || 0) / maxLiquido) * 100);
            const tieneCastigos = jugador.castigos_activos.length > 0;
            const claseAvatar = `w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white fuente-juego text-lg md:text-xl ring-2 ring-white/20 ${
              fueraDeJuego ? 'grayscale' : ''
            }`;

            return (
              <motion.div
                key={jugador.nombre}
                initial="oculto"
                animate="visible"
                exit={{ opacity: 0, x: -50 }}
                variants={variantesItemLista}
                transition={{ delay: indice * 0.1 }}
                className={`relative rounded-2xl p-3 border-2 flex items-center gap-3 bg-white/5 ${
                  jugador.descalificado ? 'border-peligro opacity-60' :
                  jugador.retirado ? 'border-neutro opacity-50' :
                  activo ? 'border-activo jugador-activo-glow bg-activo/10' :
                  'border-white/10'
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {tieneCastigos ? (
                    <button
                      type="button"
                      onClick={() => setDetalleNombre(jugador.nombre)}
                      title="Ver castigo"
                      aria-label={`Ver los castigos de ${jugador.nombre}`}
                      className={`${claseAvatar} cursor-pointer hover:scale-105 transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-peligro`}
                      style={{ backgroundColor: obtenerColorAvatar(indice) }}
                    >
                      {jugador.nombre.charAt(0).toUpperCase()}
                    </button>
                  ) : (
                    <div
                      className={claseAvatar}
                      style={{ backgroundColor: obtenerColorAvatar(indice) }}
                    >
                      {jugador.nombre.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Insignia: cuántos castigos tiene. Avisa que el avatar se puede tocar */}
                  {tieneCastigos && (
                    <span
                      className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-peligro text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-[#0B1120] pointer-events-none"
                      aria-hidden="true"
                    >
                      {jugador.castigos_activos.length}
                    </span>
                  )}

                  {activo && (
                    <motion.div
                      className="absolute -inset-1 rounded-full border-2 border-activo"
                      animate={{ scale: [1, 1.15, 1], opacity: [1, 0.4, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}

                  {jugador.descalificado && (
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                    >
                      <svg className="w-7 h-7 text-peligro drop-shadow" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                  )}
                </div>

                {/* Datos */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center gap-2 mb-1">
                    <h3
                      className={`font-condensada font-bold uppercase truncate text-sm md:text-base ${
                        fueraDeJuego ? 'text-neutro line-through' : 'text-texto'
                      }`}
                    >
                      {jugador.nombre}
                    </h3>
                    <span className={`text-[11px] font-condensada font-bold uppercase ${obtenerEstadoColor(jugador)} flex-shrink-0`}>
                      {obtenerEstadoTexto(jugador)}
                    </span>
                  </div>

                  {esJuez(jugador) && (
                    <span className="inline-flex items-center gap-1 mb-1 px-2 py-0.5 rounded-full bg-yellow-400/15 border border-yellow-400/40 text-yellow-300 text-[10px] font-condensada font-bold uppercase">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 3v18m-7-4l-2-6h4l-2 6zm14 0l-2-6h4l-2 6zM5 7h14M9 21h6" />
                      </svg>
                      Juez
                    </span>
                  )}

                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1" title="Segundos acumulados">
                      <svg className="w-3.5 h-3.5 text-accion" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path d="M5 3h10l-1 4H6L5 3zm1 5h8l-.8 8.1A2 2 0 0111.2 18H8.8a2 2 0 01-2-1.9L6 8z" />
                      </svg>
                      <span className="text-texto font-condensada font-bold">
                        <NumeroAnimado valor={jugador.liquido_acumulado} />s
                      </span>
                    </div>

                    <div className="flex items-center gap-1" title="Comodines disponibles">
                      <motion.svg
                        className="w-3.5 h-3.5 text-accion"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                        animate={jugador.comodines > 0 && !fueraDeJuego ? { rotate: [0, 8, -8, 0] } : {}}
                        transition={{ duration: 0.6, repeat: jugador.comodines > 0 && !fueraDeJuego ? Infinity : 0, repeatDelay: 2 }}
                      >
                        <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
                      </motion.svg>
                      <span className="text-texto font-condensada font-bold">
                        <NumeroAnimado valor={jugador.comodines} />
                      </span>
                    </div>

                    {jugador.puntos_negativos > 0 && (
                      <motion.div
                        className="flex items-center gap-1 text-peligro font-condensada font-bold"
                        title="Puntos negativos"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <span>!</span>
                        <NumeroAnimado valor={jugador.puntos_negativos} />
                      </motion.div>
                    )}
                  </div>

                  {/* Nivel de trago acumulado respecto al resto */}
                  <div className="mt-1.5 h-1.5 rounded-full bg-black/30 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${porcentaje}%` }}
                      transition={{ type: 'spring', stiffness: 80, damping: 18 }}
                    />
                  </div>

                  {/* En la fila solo se ve cuántas rondas faltan; el texto completo
                      se abre al tocar el avatar o la etiqueta */}
                  {tieneCastigos && (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {jugador.castigos_activos.map((castigo, i) => (
                        <button
                          key={`${castigo.id ?? 'castigo'}-${i}`}
                          type="button"
                          onClick={() => setDetalleNombre(jugador.nombre)}
                          title="Toca para ver el castigo completo"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-peligro/15 border border-peligro/50 text-red-200 text-[11px] font-condensada font-bold hover:bg-peligro/30 transition-colors cursor-pointer"
                        >
                          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {castigo.rondas_restantes === 1 ? 'Última ronda' : `${castigo.rondas_restantes} rondas`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Salir con confirmación de dos pasos */}
                {!fueraDeJuego && (
                  confirmandoSalida === jugador.nombre ? (
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      <button
                        onClick={() => manejarRetiro(indice)}
                        className="px-2 py-1 rounded-md bg-peligro text-white text-[11px] font-condensada font-bold uppercase cursor-pointer"
                      >
                        Sí, salir
                      </button>
                      <button
                        onClick={() => setConfirmandoSalida(null)}
                        className="px-2 py-1 rounded-md bg-white/10 text-textoSecundario text-[11px] font-condensada font-bold uppercase cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmandoSalida(jugador.nombre)}
                      title={`Retirar a ${jugador.nombre}`}
                      className="flex-shrink-0 text-textoSecundario hover:text-peligro text-xs font-condensada font-bold uppercase transition-colors cursor-pointer"
                    >
                      Salir
                    </button>
                  )
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Detalle del castigo. Va en un portal porque el panel del marcador
          tiene scroll y overflow oculto, y recortaría una ventana flotante. */}
      {jugadorDetalle && createPortal(
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setDetalleNombre(null)}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Castigos de ${jugadorDetalle.nombre}`}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl p-[2px]"
            style={{
              background: 'linear-gradient(135deg, #EF4444, #F97316)',
              boxShadow: '0 20px 60px rgba(239, 68, 68, 0.4)'
            }}
          >
            <div className="rounded-[22px] bg-[#0F172A] p-5 space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white fuente-juego text-xl ring-2 ring-white/20 flex-shrink-0"
                  style={{ backgroundColor: obtenerColorAvatar(indiceDetalle) }}
                >
                  {jugadorDetalle.nombre.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-condensada font-bold text-textoSecundario">
                    {jugadorDetalle.castigos_activos.length === 1 ? 'Castigo de' : 'Castigos de'}
                  </p>
                  <p className="fuente-juego text-xl text-white truncate">{jugadorDetalle.nombre}</p>
                </div>
              </div>

              <div className="space-y-3">
                {jugadorDetalle.castigos_activos.map((castigo, i) => (
                  <div
                    key={`${castigo.id ?? 'castigo'}-${i}`}
                    className="rounded-2xl bg-peligro/10 border border-peligro/40 border-l-4 border-l-peligro p-4 space-y-2"
                  >
                    <p className="text-base md:text-lg leading-snug text-white break-words">
                      {castigo.texto}
                    </p>
                    <div className="flex items-center gap-2 text-sm font-condensada font-bold text-red-200">
                      <span className="flex gap-1" aria-hidden="true">
                        {Array.from({ length: Math.min(castigo.rondas_restantes, 6) }).map((_, p) => (
                          <span key={p} className="w-2 h-2 rounded-full bg-peligro" />
                        ))}
                      </span>
                      {castigo.rondas_restantes === 1
                        ? 'Última ronda'
                        : `Quedan ${castigo.rondas_restantes} rondas`}
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setDetalleNombre(null)}
                className="boton-juego boton-comodin w-full text-white font-condensada py-3 text-base cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </motion.div>
        </motion.div>,
        document.body
      )}
    </div>
  );
}

export default Marcador;