import { etiquetas } from '../ui/etiquetas';
import { obtenerBurlaAleatoria } from '../ui/burlas';

/**
 * Componente del modal de cierre de la partida.
 * Muestra el podio con diseño de pedestales de honor, sección de ridiculización,
 * reto del vaso completo y estadísticas finales detalladas.
 * 
 * @param {Object} estado - Estado actual de la partida.
 * @param {Function} dispatch - Función para despachar acciones al reducer.
 */
function ModalCierre({ estado, dispatch }) {
  const { jugadores, resultado_final } = estado.estado_partida;
  
  const jugadoresNoDescalificados = jugadores.filter(j => !j.descalificado && !j.retirado);
  const jugadoresOrdenados = [...jugadoresNoDescalificados].sort((a, b) => 
    a.liquido_acumulado - b.liquido_acumulado
  );

  const jugadoresCastigados = jugadores.filter(j => j.puntos_negativos > 0);
  const jugadoresDescalificados = jugadores.filter(j => j.descalificado);
  const jugadoresSinBeber = jugadores.filter(j => j.liquido_acumulado === 0);

  const jugadoresRetoFinal = [
    ...new Set([
      ...jugadoresCastigados,
      ...jugadoresDescalificados,
      ...jugadoresSinBeber
    ])
  ];

  const obtenerTextoMotivo = (jugador) => {
    if (jugador.motivo_descalificacion === 'negarse_castigo') {
      return etiquetas.cierre.motivoDescalificacionNegacion;
    }
    if (jugador.motivo_descalificacion === 'sin_actividades_cumplidas') {
      return etiquetas.cierre.motivoDescalificacionSinActividades;
    }
    return '';
  };

  // Reorganizar los 3 primeros para el pedestal: [2º Lugar (izq), 1º Lugar (centro), 3º Lugar (der)]
  const primero = jugadoresOrdenados[0];
  const segundo = jugadoresOrdenados[1];
  const tercero = jugadoresOrdenados[2];

  return (
    <div className="fixed inset-0 bg-fondo/95 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-superficie rounded-2xl p-6 md:p-10 max-w-4xl w-full my-8 shadow-2xl border border-slate-700/60 space-y-8">
        
        {/* Cabecera del Cierre */}
        <div className="text-center space-y-2 border-b border-neutro/40 pb-6">
          <span className="text-xs font-condensada uppercase tracking-widest text-activo font-bold bg-activo/10 px-3 py-1 rounded-full border border-activo/30">
            Fin de la Partida
          </span>
          <h2 className="text-4xl md:text-5xl font-condensada font-bold uppercase tracking-wide text-texto">
            {etiquetas.cierre.titulo}
          </h2>
        </div>

        {/* Podio con Pedestales */}
        {!resultado_final?.esSinGanador && jugadoresOrdenados.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-center font-condensada font-bold uppercase tracking-wider text-xl text-accion">
              PODIO DE HONOR: «EL MENOS HIDRATADO»
            </h3>

            <div className="flex justify-center items-end gap-3 md:gap-6 pt-10 pb-4">
              {/* 2º Lugar */}
              {segundo && (
                <div className="flex-1 max-w-[180px] flex flex-col items-center">
                  <div className="mb-2 text-center">
                    <span className="text-xs font-condensada font-bold uppercase text-slate-400 block">
                      2º LUGAR
                    </span>
                    <span className="font-condensada font-bold uppercase text-lg text-texto block truncate max-w-[140px]">
                      {segundo.nombre}
                    </span>
                    <span className="text-xs font-condensada font-bold text-slate-300">
                      {segundo.liquido_acumulado}s acumulados
                    </span>
                  </div>
                  <div className="w-full h-32 bg-slate-700/80 rounded-t-xl border-t-4 border-slate-400 flex items-center justify-center shadow-lg">
                    <span className="text-4xl font-condensada font-bold text-slate-300">2</span>
                  </div>
                </div>
              )}

              {/* 1º Lugar - Campeón */}
              {primero && (
                <div className="flex-1 max-w-[210px] flex flex-col items-center">
                  <div className="mb-2 text-center">
                    <span className="text-xs font-condensada font-bold uppercase text-activo bg-activo/20 px-2.5 py-0.5 rounded-full inline-block mb-1 border border-activo/40">
                      CAMPEÓN
                    </span>
                    <span className="font-condensada font-bold uppercase text-2xl text-texto block truncate max-w-[170px]">
                      {primero.nombre}
                    </span>
                    <span className="text-sm font-condensada font-bold text-activo">
                      {primero.liquido_acumulado}s acumulados
                    </span>
                  </div>
                  <div className="w-full h-44 bg-activo/20 rounded-t-2xl border-t-4 border-activo flex flex-col items-center justify-center shadow-xl shadow-activo/20 border-x border-activo/30">
                    <span className="text-6xl font-condensada font-bold text-activo">1</span>
                    <span className="text-[11px] font-condensada font-bold uppercase tracking-wider text-white mt-1">
                      EL MENOS HIDRATADO
                    </span>
                  </div>
                </div>
              )}

              {/* 3º Lugar */}
              {tercero && (
                <div className="flex-1 max-w-[180px] flex flex-col items-center">
                  <div className="mb-2 text-center">
                    <span className="text-xs font-condensada font-bold uppercase text-amber-500 block">
                      3º LUGAR
                    </span>
                    <span className="font-condensada font-bold uppercase text-lg text-texto block truncate max-w-[140px]">
                      {tercero.nombre}
                    </span>
                    <span className="text-xs font-condensada font-bold text-slate-300">
                      {tercero.liquido_acumulado}s acumulados
                    </span>
                  </div>
                  <div className="w-full h-24 bg-slate-800 rounded-t-xl border-t-4 border-amber-600 flex items-center justify-center shadow-lg">
                    <span className="text-4xl font-condensada font-bold text-amber-500">3</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {resultado_final?.esSinGanador && (
          <div className="p-6 bg-peligro/10 border border-peligro/40 rounded-xl text-center space-y-2">
            <h3 className="text-2xl font-condensada font-bold uppercase text-peligro">
              {etiquetas.cierre.sinGanador}
            </h3>
            <p className="text-sm text-textoSecundario">
              Todos los participantes fueron descalificados o se retiraron de la partida.
            </p>
          </div>
        )}

        {/* Sección de Ridiculización */}
        {(jugadoresCastigados.length > 0 || jugadoresDescalificados.length > 0) && (
          <div className="space-y-4">
            <h3 className="font-condensada font-bold uppercase tracking-wider text-xl text-peligro text-center">
              ZONA DE RIDICULIZACIÓN
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jugadoresCastigados.map((jugador, indice) => (
                <div key={`castigo-${indice}`} className="bg-fondo/80 border border-peligro/50 rounded-xl p-4 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-condensada font-bold text-lg uppercase text-texto">
                      {jugador.nombre}
                    </span>
                    <span className="text-xs font-condensada font-bold uppercase bg-peligro/20 text-peligro px-2 py-0.5 rounded">
                      {jugador.puntos_negativos} negativas
                    </span>
                  </div>
                  <p className="text-textoSecundario text-xs italic">
                    "{obtenerBurlaAleatoria()}"
                  </p>
                </div>
              ))}
              {jugadoresDescalificados.map((jugador, indice) => (
                <div key={`descalificado-${indice}`} className="bg-fondo/80 border border-peligro rounded-xl p-4 space-y-1 opacity-80">
                  <div className="flex justify-between items-center">
                    <span className="font-condensada font-bold text-lg uppercase text-slate-400 line-through">
                      {jugador.nombre}
                    </span>
                    <span className="text-xs font-condensada font-bold uppercase bg-peligro text-white px-2 py-0.5 rounded">
                      DESCALIFICADO
                    </span>
                  </div>
                  <p className="text-peligro text-xs font-semibold">
                    {obtenerTextoMotivo(jugador)}
                  </p>
                  <p className="text-textoSecundario text-xs italic">
                    "{obtenerBurlaAleatoria()}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reto Final: Vaso Completo */}
        {jugadoresRetoFinal.length > 0 && (
          <div className="p-6 bg-fondo/80 border border-accion/40 rounded-xl text-center space-y-3">
            <h3 className="font-condensada font-bold uppercase tracking-wider text-xl text-accion">
              RETO FINAL: VASO COMPLETO
            </h3>
            <p className="text-sm text-textoSecundario max-w-lg mx-auto">
              {etiquetas.cierre.mensajeRetoFinal}
            </p>
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              {jugadoresRetoFinal.map((jugador, indice) => (
                <span key={indice} className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-condensada font-bold uppercase text-texto">
                  {jugador.nombre}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tabla de Estadísticas */}
        <div className="space-y-3">
          <h3 className="font-condensada font-bold uppercase tracking-wider text-lg text-texto">
            Estadísticas Finales de la Partida
          </h3>
          <div className="overflow-x-auto rounded-xl border border-neutro/40">
            <table className="w-full text-xs text-left bg-fondo/50">
              <thead className="bg-slate-800/80 text-textoSecundario font-condensada uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Jugador</th>
                  <th className="py-2.5 px-4 text-right">Líquido Acumulado</th>
                  <th className="py-2.5 px-4 text-right">Comodines Restantes</th>
                  <th className="py-2.5 px-4 text-right">Retos Cumplidos</th>
                  <th className="py-2.5 px-4 text-right">Puntos Negativos</th>
                  <th className="py-2.5 px-4 text-center">Estado Final</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutro/20">
                {jugadores.map((jugador, indice) => (
                  <tr key={indice} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-4 font-bold text-texto font-condensada uppercase text-sm">
                      {jugador.nombre}
                    </td>
                    <td className="py-2.5 px-4 text-right font-condensada font-bold text-texto">
                      {jugador.liquido_acumulado}s
                    </td>
                    <td className="py-2.5 px-4 text-right font-condensada text-textoSecundario">
                      {jugador.comodines}
                    </td>
                    <td className="py-2.5 px-4 text-right font-condensada text-textoSecundario">
                      {jugador.actividades_cumplidas}
                    </td>
                    <td className="py-2.5 px-4 text-right font-condensada font-bold text-peligro">
                      {jugador.puntos_negativos}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      {jugador.descalificado ? (
                        <span className="text-[11px] font-condensada font-bold uppercase text-peligro bg-peligro/10 px-2 py-0.5 rounded border border-peligro/30">
                          {etiquetas.juego.estadoDescalificado}
                        </span>
                      ) : jugador.retirado ? (
                        <span className="text-[11px] font-condensada font-bold uppercase text-neutro bg-slate-700/40 px-2 py-0.5 rounded">
                          {etiquetas.juego.estadoRetirado}
                        </span>
                      ) : (
                        <span className="text-[11px] font-condensada font-bold uppercase text-activo bg-activo/10 px-2 py-0.5 rounded border border-activo/30">
                          {etiquetas.juego.estadoActivo}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Acciones Finales */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-neutro/40">
          <button
            onClick={() => dispatch({ tipo: 'REINICIAR_MISMA_CONFIGURACION' })}
            className="flex-1 bg-activo hover:bg-activoOscuro text-white font-condensada font-bold py-3.5 px-6 rounded-xl border-b-4 border-activoOscuro transition-colors duration-200 uppercase tracking-wider text-base"
          >
            {etiquetas.cierre.reiniciarMisma}
          </button>
          <button
            onClick={() => dispatch({ tipo: 'NUEVA_CONFIGURACION' })}
            className="flex-1 bg-accion hover:bg-accionOscuro text-white font-condensada font-bold py-3.5 px-6 rounded-xl border-b-4 border-accionOscuro transition-colors duration-200 uppercase tracking-wider text-base"
          >
            {etiquetas.cierre.nuevaConfiguracion}
          </button>
        </div>

      </div>
    </div>
  );
}

export default ModalCierre;
