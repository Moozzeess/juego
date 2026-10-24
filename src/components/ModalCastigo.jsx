import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';

// Mismos colores que usan el Marcador, la Configuración y el Cierre
const coloresAvatar = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];

const textosMotivo = {
  negarse: 'se negó al reto',
  no_cumplio: 'no cumplió el reto'
};

/**
 * Modal de castigos. Tiene dos usos:
 *
 * 1) AVISO: aparece cuando un jugador recibe un castigo (porque se negó al reto
 *    o porque el juez dijo que no lo cumplió).
 *    datos = { jugador, indice, motivo: 'negarse' | 'no_cumplio',
 *              castigo: { texto, duracion_rondas }, actividad?, segundos? }
 *
 * 2) CONSULTA: el jugador vuelve a leer los castigos que tiene activos.
 *    datos = { modo: 'consulta', jugador, indice,
 *              castigos: [{ texto, rondas_restantes }] }
 *
 * Se cierra con el botón, tocando fuera de la ventana o con Escape.
 *
 * @param {Object|null} datos - Información a mostrar, o null si no hay nada que mostrar.
 * @param {Function} alCerrar - Se llama cuando la persona cierra el modal.
 */
function ModalCastigo({ datos, alCerrar }) {
  // Escape cierra el modal
  useEffect(() => {
    if (!datos) return;
    const alPulsar = (e) => {
      if (e.key === 'Escape') alCerrar();
    };
    window.addEventListener('keydown', alPulsar);
    return () => window.removeEventListener('keydown', alPulsar);
  }, [datos, alCerrar]);

  if (!datos) return null;

  const esConsulta = datos.modo === 'consulta';
  const { jugador, indice = 0, motivo, actividad, segundos } = datos;

  // Se normalizan los dos casos a una misma lista: { texto, rondas }
  const lista = esConsulta
    ? datos.castigos.map(c => ({ texto: c.texto, rondas: c.rondas_restantes }))
    : [{ texto: datos.castigo.texto, rondas: datos.castigo.duracion_rondas }];

  const textoRondas = (rondas) => {
    if (!rondas || rondas <= 0) return null;
    if (esConsulta) return rondas === 1 ? 'Última ronda' : `Quedan ${rondas} rondas`;
    return rondas === 1 ? 'Dura 1 ronda' : `Dura ${rondas} rondas`;
  };

  // Va en un portal: los paneles del juego tienen efecto de cristal y recortes
  // que harían que una ventana "fixed" quedara atrapada dentro de ellos.
  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={alCerrar}
    >
      <motion.div
        role={esConsulta ? 'dialog' : 'alertdialog'}
        aria-modal="true"
        aria-labelledby="titulo-castigo"
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 16 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl p-[3px]"
        style={{
          background: 'linear-gradient(135deg, #EF4444, #F97316, #FACC15)',
          boxShadow: '0 24px 70px rgba(239, 68, 68, 0.5)'
        }}
      >
        <div className="rounded-[22px] bg-[#0F172A] p-6 space-y-5 max-h-[85vh] overflow-y-auto text-center">

          {/* Quién y por qué */}
          <div className="space-y-2">
            <div className={`${esConsulta ? '' : 'animar-sacudida'} inline-flex w-14 h-14 rounded-full bg-peligro/20 border-2 border-peligro items-center justify-center`}>
              <svg className="w-7 h-7 text-peligro" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>

            <h2 id="titulo-castigo" className="fuente-juego texto-fuego text-3xl md:text-4xl leading-none">
              {esConsulta
                ? (lista.length === 1 ? 'Tu castigo' : 'Tus castigos')
                : '¡Castigo!'}
            </h2>

            <p className="text-textoSecundario text-sm md:text-base flex items-center justify-center gap-2 flex-wrap">
              <span
                className="w-6 h-6 rounded-full inline-flex items-center justify-center text-white fuente-juego text-xs ring-2 ring-white/20"
                style={{ backgroundColor: coloresAvatar[indice % coloresAvatar.length] }}
                aria-hidden="true"
              >
                {jugador.charAt(0).toUpperCase()}
              </span>
              <span>
                <strong className="text-white font-condensada uppercase">{jugador}</strong>
                {esConsulta
                  ? ' lo tiene activo'
                  : ` ${textosMotivo[motivo] ?? 'recibe un castigo'}`}
              </span>
            </p>

            {!esConsulta && actividad && (
              <p className="text-xs text-textoSecundario/80">Reto: {actividad}</p>
            )}
          </div>

          {/* Los castigos */}
          <div className="space-y-3">
            {lista.map((item, i) => {
              const rondas = textoRondas(item.rondas);
              return (
                <div
                  key={i}
                  className="rounded-2xl bg-peligro/10 border border-peligro/40 border-l-4 border-l-peligro p-4 space-y-3"
                >
                  <p className="text-lg md:text-xl leading-snug text-white break-words">
                    {item.texto}
                  </p>

                  {rondas && (
                    <div className="flex items-center justify-center gap-2 text-sm font-condensada font-bold text-red-200">
                      <span className="flex gap-1" aria-hidden="true">
                        {Array.from({ length: Math.min(item.rondas, 6) }).map((_, p) => (
                          <span key={p} className="w-2 h-2 rounded-full bg-peligro" />
                        ))}
                      </span>
                      {rondas}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!esConsulta && segundos > 0 && (
            <p className="text-sm text-textoSecundario">
              Además se suman <strong className="text-white">{segundos}s</strong> a su marcador.
            </p>
          )}

          <button
            type="button"
            autoFocus
            onClick={alCerrar}
            className="boton-juego boton-comodin w-full text-white font-condensada py-3.5 text-base md:text-lg cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}

export default ModalCastigo;