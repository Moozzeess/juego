import { etiquetas } from '../ui/etiquetas';
import { obtenerBurlaAleatoria } from '../ui/burlas';

/**
 * Componente del modal de cierre de la partida.
 * Muestra el podio, ridiculización, reto final y tabla de estadísticas.
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

  return (
    <div className="fixed inset-0 bg-fondo bg-opacity-95 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-superficie rounded-lg p-8 max-w-4xl w-full my-8">
        <h2 className="text-3xl font-bold text-center mb-8">
          {etiquetas.cierre.titulo}
        </h2>

        {!resultado_final?.esSinGanador && jugadoresOrdenados.length > 0 && (
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-center mb-4 text-accion">
              {etiquetas.cierre.podio}
            </h3>
            <div className="flex justify-center items-end gap-4">
              {jugadoresOrdenados.slice(0, 3).map((jugador, indice) => (
                <div
                  key={indice}
                  className={`bg-fondo rounded-lg p-4 text-center ${
                    indice === 0 ? 'w-48 h-56 border-4 border-activo' :
                    indice === 1 ? 'w-40 h-48 border-4 border-neutro' :
                    'w-32 h-40 border-4 border-neutro opacity-70'
                  }`}
                >
                  <div className="text-4xl font-bold text-accion mb-2">
                    {indice + 1}
                  </div>
                  <div className="font-bold text-lg mb-1">{jugador.nombre}</div>
                  <div className="text-textoSecundario">{jugador.liquido_acumulado}s</div>
                  {indice === 0 && (
                    <div className="mt-2 text-sm text-activo font-semibold">
                      {etiquetas.cierre.primerLugar}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {resultado_final?.esSinGanador && (
          <div className="mb-8 text-center">
            <h3 className="text-2xl font-bold text-peligro mb-4">
              {etiquetas.cierre.sinGanador}
            </h3>
          </div>
        )}

        {(jugadoresCastigados.length > 0 || jugadoresDescalificados.length > 0) && (
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-center mb-4 text-peligro">
              {etiquetas.cierre.ridiculizacion}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jugadoresCastigados.map((jugador, indice) => (
                <div key={`castigo-${indice}`} className="bg-fondo border-2 border-peligro rounded-lg p-4">
                  <div className="font-bold text-lg mb-2">{jugador.nombre}</div>
                  <div className="text-peligro text-sm mb-2">
                    {jugador.puntos_negativos} puntos negativos
                  </div>
                  <div className="text-textoSecundario text-sm italic">
                    "{obtenerBurlaAleatoria()}"
                  </div>
                </div>
              ))}
              {jugadoresDescalificados.map((jugador, indice) => (
                <div key={`descalificado-${indice}`} className="bg-fondo border-2 border-peligro rounded-lg p-4 opacity-70">
                  <div className="font-bold text-lg mb-2 line-through">{jugador.nombre}</div>
                  <div className="text-peligro text-sm mb-2">
                    {obtenerTextoMotivo(jugador)}
                  </div>
                  <div className="text-textoSecundario text-sm italic">
                    "{obtenerBurlaAleatoria()}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {jugadoresRetoFinal.length > 0 && (
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-center mb-4 text-accion">
              {etiquetas.cierre.retoFinal}
            </h3>
            <div className="bg-fondo rounded-lg p-6 text-center">
              <p className="text-xl mb-4">{etiquetas.cierre.mensajeRetoFinal}</p>
              <div className="space-y-2">
                {jugadoresRetoFinal.map((jugador, indice) => (
                  <div key={indice} className="text-textoSecundario">
                    {jugador.nombre}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h3 className="text-2xl font-bold text-center mb-4">
            {etiquetas.cierre.estadisticas}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutro">
                  <th className="text-left py-2 px-4">Jugador</th>
                  <th className="text-right py-2 px-4">Líquido (s)</th>
                  <th className="text-right py-2 px-4">Comodines</th>
                  <th className="text-right py-2 px-4">Actividades</th>
                  <th className="text-right py-2 px-4">Negativos</th>
                  <th className="text-left py-2 px-4">Estado</th>
                </tr>
              </thead>
              <tbody>
                {jugadores.map((jugador, indice) => (
                  <tr key={indice} className="border-b border-neutro">
                    <td className="py-2 px-4 font-semibold">{jugador.nombre}</td>
                    <td className="text-right py-2 px-4">{jugador.liquido_acumulado}</td>
                    <td className="text-right py-2 px-4">{jugador.comodines}</td>
                    <td className="text-right py-2 px-4">{jugador.actividades_cumplidas}</td>
                    <td className="text-right py-2 px-4 text-peligro">{jugador.puntos_negativos}</td>
                    <td className="py-2 px-4">
                      {jugador.descalificado ? (
                        <span className="text-peligro">{etiquetas.juego.estadoDescalificado}</span>
                      ) : jugador.retirado ? (
                        <span className="text-neutro">{etiquetas.juego.estadoRetirado}</span>
                      ) : (
                        <span className="text-activo">{etiquetas.juego.estadoActivo}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => dispatch({ tipo: 'REINICIAR_MISMA_CONFIGURACION' })}
            className="flex-1 bg-activo hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 uppercase"
          >
            {etiquetas.cierre.reiniciarMisma}
          </button>
          <button
            onClick={() => dispatch({ tipo: 'NUEVA_CONFIGURACION' })}
            className="flex-1 bg-accion hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 uppercase"
          >
            {etiquetas.cierre.nuevaConfiguracion}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalCierre;
