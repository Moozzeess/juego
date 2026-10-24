import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { etiquetas } from '../ui/etiquetas';
import { obtenerBurlaAleatoria } from '../ui/burlas';

const coloresAvatar = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];

const estilosPuesto = {
  1: {
    degradado: 'linear-gradient(180deg, #FDE68A 0%, #F59E0B 55%, #B45309 100%)',
    brillo: '0 0 50px rgba(250,204,21,0.55)',
    numero: 'text-amber-950',
    altura: 'h-28 sm:h-36 md:h-48',
    retraso: 0.9
  },
  2: {
    degradado: 'linear-gradient(180deg, #E2E8F0 0%, #94A3B8 60%, #475569 100%)',
    brillo: '0 0 30px rgba(148,163,184,0.35)',
    numero: 'text-slate-800',
    altura: 'h-20 sm:h-28 md:h-36',
    retraso: 0.5
  },
  3: {
    degradado: 'linear-gradient(180deg, #FDBA74 0%, #EA580C 60%, #7C2D12 100%)',
    brillo: '0 0 30px rgba(234,88,12,0.35)',
    numero: 'text-orange-950',
    altura: 'h-16 sm:h-20 md:h-28',
    retraso: 0.2
  }
};

function Pedestal({ jugador, puesto }) {
  const estilo = estilosPuesto[puesto];
  const esCampeon = puesto === 1;
  return (
    <motion.div
      initial={{ opacity: 0, y: 70 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 110, damping: 14, delay: estilo.retraso }}
      className={`flex-1 flex flex-col items-center ${esCampeon ? 'max-w-[130px] sm:max-w-[170px] md:max-w-[230px]' : 'max-w-[100px] sm:max-w-[130px] md:max-w-[180px]'}`}
    >
      <div className="mb-1 sm:mb-2 text-center w-full">
        {esCampeon && (
          <svg className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 mx-auto mb-1 text-yellow-300 drop-shadow-[0_0_12px_rgba(250,204,21,0.8)]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 7l4.5 4L12 4l4.5 7L21 7l-2 12H5L3 7z" />
          </svg>
        )}
        <span className={`fuente-juego block truncate ${esCampeon ? 'text-base sm:text-xl md:text-3xl text-white' : 'text-sm sm:text-base md:text-xl text-texto'}`}>
          {jugador.nombre}
        </span>
        <span className={`font-condensada font-bold text-xs ${esCampeon ? 'sm:text-sm md:text-base text-yellow-300' : 'sm:text-xs md:text-sm text-slate-300'}`}>
          {jugador.liquido_acumulado}s
        </span>
      </div>
      <div
        className={`w-full ${estilo.altura} rounded-t-xl sm:rounded-t-2xl flex flex-col items-center justify-center`}
        style={{ background: estilo.degradado, boxShadow: estilo.brillo }}
      >
        <span className={`fuente-juego text-3xl sm:text-4xl md:text-6xl ${estilo.numero}`}>{puesto}</span>
        {esCampeon && (
          <span className="font-condensada font-bold text-[9px] sm:text-[11px] md:text-xs text-amber-950 mt-0.5 sm:mt-1 text-center px-1">
            El menos pedo
          </span>
        )}
      </div>
    </motion.div>
  );
}

function ModalCierre({ estado, dispatch }) {
  const { jugadores, resultado_final } = estado.estado_partida;

  const burlas = useMemo(
    () => Object.fromEntries(jugadores.map(j => [j.nombre, obtenerBurlaAleatoria()])),
    [jugadores]
  );

  const jugadoresNoDescalificados = jugadores.filter(j => !j.descalificado && !j.retirado);
  const jugadoresOrdenados = [...jugadoresNoDescalificados].sort((a, b) => a.liquido_acumulado - b.liquido_acumulado);
  const jugadoresDescalificados = jugadores.filter(j => j.descalificado);
  const jugadoresCastigados = jugadores.filter(j => j.puntos_negativos > 0 && !j.descalificado);
  const jugadoresSinBeber = jugadores.filter(j => j.liquido_acumulado === 0);
  const jugadoresRetoFinal = [...new Set([...jugadoresCastigados, ...jugadoresDescalificados, ...jugadoresSinBeber])];

  const obtenerTextoMotivo = (jugador) => {
    if (jugador.motivo_descalificacion === 'negarse_castigo') return etiquetas.cierre.motivoDescalificacionNegacion;
    if (jugador.motivo_descalificacion === 'sin_actividades_cumplidas') return etiquetas.cierre.motivoDescalificacionSinActividades;
    return '';
  };

  const primero = jugadoresOrdenados[0];
  const segundo = jugadoresOrdenados[1];
  const tercero = jugadoresOrdenados[2];

  return (
    <div className="fixed inset-0 bg-[#0B1120]/90 backdrop-blur-md flex items-start justify-center p-2 sm:p-3 md:p-4 lg:p-6 z-50 overflow-y-auto">
      <div className="panel-cristal rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-6 lg:p-10 max-w-[98vw] sm:max-w-[95vw] md:max-w-4xl w-full my-2 sm:my-4 md:my-8 space-y-4 sm:space-y-6 md:space-y-8">

        {/* Cabecera */}
        <div className="text-center space-y-0.5 sm:space-y-1">
          <p className="text-xs sm:text-sm md:text-base font-condensada font-bold text-textoSecundario">
            Fin de la partida
          </p>
          <h2 className="fuente-juego texto-fuego text-2xl sm:text-3xl md:text-5xl lg:text-6xl leading-none">
            {etiquetas.cierre.titulo}
          </h2>
        </div>

        {/* Podio */}
        {!resultado_final?.esSinGanador && jugadoresOrdenados.length > 0 && (
          <section className="space-y-1 sm:space-y-2">
            <h3 className="text-center fuente-juego text-sm sm:text-base md:text-xl text-yellow-300">
              Podio de honor
            </h3>
            <div className="flex justify-center items-end gap-1.5 sm:gap-2 md:gap-5 pt-2 sm:pt-4 md:pt-8">
              {segundo && <Pedestal jugador={segundo} puesto={2} />}
              {primero && <Pedestal jugador={primero} puesto={1} />}
              {tercero && <Pedestal jugador={tercero} puesto={3} />}
            </div>
          </section>
        )}

        {resultado_final?.esSinGanador && (
          <div className="p-3 sm:p-4 md:p-6 bg-peligro/10 border border-peligro/40 rounded-2xl text-center space-y-2">
            <h3 className="fuente-juego text-lg sm:text-xl md:text-3xl text-peligro">{etiquetas.cierre.sinGanador}</h3>
            <p className="text-xs sm:text-sm md:text-base text-textoSecundario">Todos los participantes fueron descalificados o se retiraron.</p>
          </div>
        )}

        {/* Zona de ridiculización */}
        {(jugadoresCastigados.length > 0 || jugadoresDescalificados.length > 0) && (
          <section className="space-y-2 sm:space-y-3">
            <h3 className="fuente-juego text-sm sm:text-base md:text-xl text-peligro text-center">Zona de ridiculización</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
              {jugadoresCastigados.map((jugador) => (
                <div key={`c-${jugador.nombre}`} className="bg-black/25 border border-peligro/50 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 md:p-4 space-y-1 sm:space-y-1.5">
                  <div className="flex justify-between items-center gap-2">
                    <span className="font-condensada font-bold text-sm sm:text-base md:text-xl uppercase text-texto truncate">{jugador.nombre}</span>
                    <span className="text-[10px] sm:text-xs font-condensada font-bold bg-peligro/20 text-peligro px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap">
                      {jugador.puntos_negativos} neg.
                    </span>
                  </div>
                  <p className="text-textoSecundario text-[10px] sm:text-xs md:text-sm italic">"{burlas[jugador.nombre]}"</p>
                </div>
              ))}
              {jugadoresDescalificados.map((jugador) => (
                <div key={`d-${jugador.nombre}`} className="bg-black/25 border-2 border-peligro rounded-xl sm:rounded-2xl p-2.5 sm:p-3 md:p-4 space-y-1 sm:space-y-1.5">
                  <div className="flex justify-between items-center gap-2">
                    <span className="font-condensada font-bold text-sm sm:text-base md:text-xl uppercase text-slate-400 line-through truncate">{jugador.nombre}</span>
                    <span className="text-[10px] sm:text-xs font-condensada font-bold bg-peligro text-white px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap">Desc.</span>
                  </div>
                  <p className="text-peligro text-[10px] sm:text-xs md:text-sm font-semibold">{obtenerTextoMotivo(jugador)}</p>
                  <p className="text-textoSecundario text-[10px] sm:text-xs md:text-sm italic">"{burlas[jugador.nombre]}"</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Reto final */}
        {jugadoresRetoFinal.length > 0 && (
          <section className="rounded-2xl p-[2px]" style={{ background: 'linear-gradient(135deg,#22D3EE,#3B82F6,#8B5CF6)', boxShadow: '0 12px 40px rgba(59,130,246,0.3)' }}>
            <div className="rounded-[14px] bg-[#0F172A]/95 p-3 sm:p-4 md:p-6 text-center space-y-2 sm:space-y-3">
              <h3 className="fuente-juego text-sm sm:text-base md:text-2xl text-accion">Reto final: vaso completo</h3>
              <p className="text-xs sm:text-sm md:text-base text-textoSecundario max-w-lg mx-auto">{etiquetas.cierre.mensajeRetoFinal}</p>
              <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 pt-1">
                {jugadoresRetoFinal.map((jugador) => (
                  <span key={jugador.nombre} className="px-2 sm:px-3 py-0.5 sm:py-1 bg-white/10 border border-white/15 rounded-full text-[10px] sm:text-xs md:text-sm font-condensada font-bold uppercase text-texto">
                    {jugador.nombre}
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Estadísticas */}
        <section className="space-y-2 sm:space-y-3">
          <h3 className="fuente-juego text-sm sm:text-base md:text-lg text-texto">Estadísticas finales</h3>
          <div className="overflow-x-auto rounded-xl sm:rounded-2xl border border-white/10">
            <table className="w-full text-[10px] sm:text-xs md:text-sm text-left bg-black/20 min-w-[340px]">
              <thead className="bg-white/5 text-textoSecundario font-condensada">
                <tr>
                  <th className="py-2 px-2 sm:px-3 md:px-4 font-bold">Jugador</th>
                  <th className="py-2 px-2 sm:px-3 md:px-4 font-bold text-right">Líq.</th>
                  <th className="py-2 px-2 sm:px-3 md:px-4 font-bold text-right hidden sm:table-cell">🃏</th>
                  <th className="py-2 px-2 sm:px-3 md:px-4 font-bold text-right hidden sm:table-cell">Retos</th>
                  <th className="py-2 px-2 sm:px-3 md:px-4 font-bold text-right">Neg.</th>
                  <th className="py-2 px-2 sm:px-3 md:px-4 font-bold text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {jugadores.map((jugador, indice) => (
                  <tr key={jugador.nombre} className="hover:bg-white/5 transition-colors">
                    <td className="py-2 px-2 sm:px-3 md:px-4">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: coloresAvatar[indice % coloresAvatar.length] }} />
                        <span className="font-bold text-texto font-condensada uppercase truncate max-w-[80px] sm:max-w-none">{jugador.nombre}</span>
                      </div>
                    </td>
                    <td className="py-2 px-2 sm:px-3 md:px-4 text-right font-condensada font-bold text-texto">{jugador.liquido_acumulado}s</td>
                    <td className="py-2 px-2 sm:px-3 md:px-4 text-right font-condensada text-textoSecundario hidden sm:table-cell">{jugador.comodines}</td>
                    <td className="py-2 px-2 sm:px-3 md:px-4 text-right font-condensada text-textoSecundario hidden sm:table-cell">{jugador.actividades_cumplidas}</td>
                    <td className="py-2 px-2 sm:px-3 md:px-4 text-right font-condensada font-bold text-peligro">{jugador.puntos_negativos}</td>
                    <td className="py-2 px-2 sm:px-3 md:px-4 text-center">
                      {jugador.descalificado ? (
                        <span className="text-[9px] sm:text-xs font-condensada font-bold text-peligro bg-peligro/10 px-1.5 py-0.5 rounded-full border border-peligro/30">Desc.</span>
                      ) : jugador.retirado ? (
                        <span className="text-[9px] sm:text-xs font-condensada font-bold text-neutro bg-slate-700/40 px-1.5 py-0.5 rounded-full">Ret.</span>
                      ) : (
                        <span className="text-[9px] sm:text-xs font-condensada font-bold text-activo bg-activo/10 px-1.5 py-0.5 rounded-full border border-activo/30">OK</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Acciones finales */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 pt-2 sm:pt-4 border-t border-white/10">
          <button
            onClick={() => dispatch({ tipo: 'REINICIAR_MISMA_CONFIGURACION' })}
            className="boton-juego boton-aceptar flex-1 text-white font-condensada py-3 sm:py-3.5 px-3 sm:px-4 md:px-6 text-sm sm:text-base md:text-lg cursor-pointer"
          >
            {etiquetas.cierre.reiniciarMisma}
          </button>
          <button
            onClick={() => dispatch({ tipo: 'NUEVA_CONFIGURACION' })}
            className="boton-juego boton-comodin flex-1 text-white font-condensada py-3 sm:py-3.5 px-3 sm:px-4 md:px-6 text-sm sm:text-base md:text-lg cursor-pointer"
          >
            {etiquetas.cierre.nuevaConfiguracion}
          </button>
        </div>

      </div>
    </div>
  );
}

export default ModalCierre;