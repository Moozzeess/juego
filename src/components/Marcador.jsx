import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { etiquetas } from '../ui/etiquetas';
import { variantesLista, variantesItemLista, NumeroAnimado } from '../ui/animaciones.jsx';

const coloresAvatar = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];

function Marcador({ estado, dispatch }) {
  const { jugadores } = estado.estado_partida;
  const [confirmandoSalida, setConfirmandoSalida] = useState(null);
  const [detalleNombre, setDetalleNombre] = useState(null);

  useEffect(() => {
    if (!detalleNombre) return;
    const fn = (e) => { if (e.key === 'Escape') setDetalleNombre(null); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [detalleNombre]);

  const maxLiquido = Math.max(1, ...jugadores.map(j => j.liquido_acumulado || 0));

  const manejarRetiro = (indice) => {
    const jugador = jugadores[indice];
    if (jugador.retirado || jugador.descalificado) return;
    const nuevosJugadores = [...jugadores];
    nuevosJugadores[indice] = { ...jugador, retirado: true };
    const estaVivo = (j) => !j.descalificado && !j.retirado;
    const jugadoresActivos = nuevosJugadores.filter(estaVivo);
    const indiceTurno = estado.estado_partida.indice_turno;
    let nuevoIndiceTurno = indiceTurno;
    let nuevoJugadorActivo = estado.estado_partida.jugador_activo;
    let nuevoJuez = estado.estado_partida.juez;
    if (jugadoresActivos.length > 0) {
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
      const posicionActivo = jugadoresActivos.findIndex(j => j.nombre === nuevoJugadorActivo);
      const indiceJuez = (posicionActivo + 1) % jugadoresActivos.length;
      nuevoJuez = jugadoresActivos[indiceJuez]?.nombre || null;
    }
    dispatch({ tipo: 'RETIRAR_JUGADOR', jugadores: nuevosJugadores, indiceTurno: nuevoIndiceTurno, jugadorActivo: nuevoJugadorActivo, juez: nuevoJuez });
    setConfirmandoSalida(null);
  };

  const obtenerEstadoTexto = (j) => j.descalificado ? etiquetas.juego.estadoDescalificado : j.retirado ? etiquetas.juego.estadoRetirado : etiquetas.juego.estadoActivo;
  const obtenerEstadoColor = (j) => j.descalificado ? 'text-peligro' : j.retirado ? 'text-neutro' : 'text-activo';
  const obtenerColorAvatar = (i) => coloresAvatar[i % coloresAvatar.length];
  const esJugadorActivo = (j) => j.nombre === estado.estado_partida.jugador_activo && !j.descalificado && !j.retirado;
  const esJuez = (j) => j.nombre === estado.estado_partida.juez && !j.descalificado && !j.retirado;

  const jugadorDetalle = jugadores.find(j => j.nombre === detalleNombre && j.castigos_activos.length > 0);
  const indiceDetalle = jugadores.findIndex(j => j.nombre === detalleNombre);

  return (
    <div className="panel-cristal rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 h-full flex flex-col overflow-hidden">
      <h2 className="text-center fuente-juego text-texto text-sm sm:text-base md:text-lg mb-2 sm:mb-3 flex-shrink-0">
        Jugadores
      </h2>

      <motion.div
        className="space-y-1.5 sm:space-y-2 flex-1 overflow-y-auto pr-0.5"
        initial="oculto" animate="visible" variants={variantesLista}
      >
        <AnimatePresence>
          {jugadores.map((jugador, indice) => {
            const activo = esJugadorActivo(jugador);
            const fueraDeJuego = jugador.descalificado || jugador.retirado;
            const porcentaje = Math.min(100, ((jugador.liquido_acumulado || 0) / maxLiquido) * 100);
            const tieneCastigos = jugador.castigos_activos.length > 0;
            const avatarClass = `w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-white fuente-juego text-base sm:text-lg ring-2 ring-white/20 flex-shrink-0 ${fueraDeJuego ? 'grayscale' : ''}`;

            return (
              <motion.div
                key={jugador.nombre}
                initial="oculto" animate="visible" exit={{ opacity: 0, x: -50 }}
                variants={variantesItemLista} transition={{ delay: indice * 0.05 }}
                className={`relative rounded-xl sm:rounded-2xl p-2 sm:p-3 border-2 flex items-center gap-2 sm:gap-3 bg-white/5 ${
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
                      aria-label={`Ver castigos de ${jugador.nombre}`}
                      className={`${avatarClass} cursor-pointer hover:scale-105 transition-transform`}
                      style={{ backgroundColor: obtenerColorAvatar(indice) }}
                    >
                      {jugador.nombre.charAt(0).toUpperCase()}
                    </button>
                  ) : (
                    <div className={avatarClass} style={{ backgroundColor: obtenerColorAvatar(indice) }}>
                      {jugador.nombre.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {tieneCastigos && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-peligro text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-[#0B1120] pointer-events-none">
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
                    <motion.div className="absolute inset-0 flex items-center justify-center" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <svg className="w-6 h-6 sm:w-7 sm:h-7 text-peligro drop-shadow" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                  )}
                </div>

                {/* Datos del jugador */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center gap-1 mb-0.5">
                    <h3 className={`font-condensada font-bold uppercase truncate text-xs sm:text-sm md:text-base ${fueraDeJuego ? 'text-neutro line-through' : 'text-texto'}`}>
                      {jugador.nombre}
                    </h3>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {esJuez(jugador) && (
                        <span className="text-yellow-300 text-[9px] sm:text-[10px] font-condensada font-bold uppercase bg-yellow-400/15 px-1 py-0.5 rounded">
                          Juez
                        </span>
                      )}
                      <span className={`text-[9px] sm:text-[10px] font-condensada font-bold uppercase ${obtenerEstadoColor(jugador)}`}>
                        {obtenerEstadoTexto(jugador)}
                      </span>
                    </div>
                  </div>

                  {/* Stats en línea */}
                  <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs">
                    <span className="text-texto font-condensada font-bold flex items-center gap-0.5">
                      🍺 <NumeroAnimado valor={jugador.liquido_acumulado} />s
                    </span>
                    <span className="text-texto font-condensada font-bold flex items-center gap-0.5">
                      🃏 <NumeroAnimado valor={jugador.comodines} />
                    </span>
                    {jugador.puntos_negativos > 0 && (
                      <span className="text-peligro font-condensada font-bold flex items-center gap-0.5">
                        ✗ <NumeroAnimado valor={jugador.puntos_negativos} />
                      </span>
                    )}
                  </div>

                  {/* Barra de progreso */}
                  <div className="mt-1 h-1 sm:h-1.5 rounded-full bg-black/30 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${porcentaje}%` }}
                      transition={{ type: 'spring', stiffness: 80, damping: 18 }}
                    />
                  </div>

                  {/* Castigos activos */}
                  {tieneCastigos && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {jugador.castigos_activos.slice(0, 2).map((castigo, i) => (
                        <button
                          key={`${castigo.id ?? 'c'}-${i}`}
                          type="button"
                          onClick={() => setDetalleNombre(jugador.nombre)}
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-peligro/15 border border-peligro/50 text-red-200 text-[9px] sm:text-[10px] font-condensada font-bold hover:bg-peligro/30 transition-colors cursor-pointer"
                        >
                          ⚠ {castigo.rondas_restantes === 1 ? 'Última' : `${castigo.rondas_restantes}R`}
                        </button>
                      ))}
                      {jugador.castigos_activos.length > 2 && (
                        <span className="text-[9px] text-textoSecundario">+{jugador.castigos_activos.length - 2}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Botón salir */}
                {!fueraDeJuego && (
                  confirmandoSalida === jugador.nombre ? (
                    <div className="flex flex-col gap-0.5 flex-shrink-0">
                      <button onClick={() => manejarRetiro(indice)} className="px-1.5 py-1 rounded bg-peligro text-white text-[10px] font-condensada font-bold uppercase cursor-pointer">
                        Sí
                      </button>
                      <button onClick={() => setConfirmandoSalida(null)} className="px-1.5 py-1 rounded bg-white/10 text-textoSecundario text-[10px] font-condensada font-bold uppercase cursor-pointer">
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmandoSalida(jugador.nombre)}
                      className="flex-shrink-0 text-textoSecundario hover:text-peligro text-[10px] sm:text-xs font-condensada font-bold uppercase transition-colors cursor-pointer"
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

      {/* Modal detalle castigo */}
      {jugadorDetalle && createPortal(
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setDetalleNombre(null)}
        >
          <motion.div
            role="dialog" aria-modal="true"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm sm:max-w-md rounded-3xl p-[2px]"
            style={{ background: 'linear-gradient(135deg,#EF4444,#F97316)', boxShadow: '0 20px 60px rgba(239,68,68,0.4)' }}
          >
            <div className="rounded-[22px] bg-[#0F172A] p-4 sm:p-5 space-y-3 sm:space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-white fuente-juego text-xl ring-2 ring-white/20 flex-shrink-0" style={{ backgroundColor: obtenerColorAvatar(indiceDetalle) }}>
                  {jugadorDetalle.nombre.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-condensada font-bold text-textoSecundario">{jugadorDetalle.castigos_activos.length === 1 ? 'Castigo de' : 'Castigos de'}</p>
                  <p className="fuente-juego text-lg sm:text-xl text-white truncate">{jugadorDetalle.nombre}</p>
                </div>
              </div>
              <div className="space-y-2 sm:space-y-3">
                {jugadorDetalle.castigos_activos.map((castigo, i) => (
                  <div key={`${castigo.id ?? 'c'}-${i}`} className="rounded-2xl bg-peligro/10 border border-peligro/40 border-l-4 border-l-peligro p-3 sm:p-4 space-y-2">
                    <p className="text-sm sm:text-base md:text-lg leading-snug text-white break-words">{castigo.texto}</p>
                    <div className="flex items-center gap-2 text-xs font-condensada font-bold text-red-200">
                      <span className="flex gap-1" aria-hidden="true">
                        {Array.from({ length: Math.min(castigo.rondas_restantes, 6) }).map((_, p) => (
                          <span key={p} className="w-2 h-2 rounded-full bg-peligro" />
                        ))}
                      </span>
                      {castigo.rondas_restantes === 1 ? 'Última ronda' : `Quedan ${castigo.rondas_restantes} rondas`}
                    </div>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => setDetalleNombre(null)} className="boton-juego boton-comodin w-full text-white font-condensada py-3 text-sm sm:text-base cursor-pointer">
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