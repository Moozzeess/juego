import { etiquetas } from '../ui/etiquetas';

/**
 * Componente del marcador global.
 * Muestra el estado de todos los jugadores en la columna izquierda.
 * 
 * @param {Object} estado - Estado actual de la partida.
 * @param {Function} dispatch - Función para despachar acciones al reducer.
 */
function Marcador({ estado, dispatch }) {
  const { jugadores } = estado.estado_partida;

  const manejarRetiro = (indice) => {
    const jugador = jugadores[indice];
    if (jugador.retirado || jugador.descalificado) return;

    const nuevosJugadores = [...jugadores];
    nuevosJugadores[indice] = {
      ...jugador,
      retirado: true
    };

    const jugadoresActivos = nuevosJugadores.filter(j => !j.descalificado && !j.retirado);
    const indiceTurno = estado.estado_partida.indice_turno;
    
    let nuevoIndiceTurno = indiceTurno;
    let nuevoJugadorActivo = estado.estado_partida.jugador_activo;
    let nuevoJuez = estado.estado_partida.juez;

    if (jugadoresActivos.length > 0) {
      if (nuevoJugadorActivo === jugador.nombre) {
        const siguienteIndice = (indiceTurno + 1) % nuevosJugadores.length;
        nuevoIndiceTurno = siguienteIndice;
        nuevoJugadorActivo = jugadoresActivos[siguienteIndice]?.nombre || null;
      }
      
      const indiceJuez = (nuevoIndiceTurno + 1) % jugadoresActivos.length;
      nuevoJuez = jugadoresActivos[indiceJuez]?.nombre || null;
    }

    dispatch({
      tipo: 'RETIRAR_JUGADOR',
      jugadores: nuevosJugadores,
      indiceTurno: nuevoIndiceTurno,
      jugadorActivo: nuevoJugadorActivo,
      juez: nuevoJuez
    });
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

  return (
    <div className="bg-superficie rounded-lg p-4 h-full overflow-y-auto">
      <h2 className="text-xl font-bold mb-4 text-center">Marcador</h2>
      <div className="space-y-4">
        {jugadores.map((jugador, indice) => (
          <div
            key={indice}
            className={`bg-fondo rounded-lg p-4 border-2 ${
              jugador.descalificado ? 'border-peligro opacity-60' :
              jugador.retirado ? 'border-neutro opacity-60' :
              'border-accion'
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className={`font-bold ${jugador.descalificado ? 'line-through' : ''}`}>
                {jugador.nombre}
              </h3>
              <span className={`text-sm font-semibold ${obtenerEstadoColor(jugador)}`}>
                {obtenerEstadoTexto(jugador)}
              </span>
            </div>
            
            <div className="space-y-1 text-sm text-textoSecundario">
              <div className="flex justify-between">
                <span>Líquido:</span>
                <span className="text-texto font-semibold">{jugador.liquido_acumulado}s</span>
              </div>
              <div className="flex justify-between">
                <span>Comodines:</span>
                <span className="text-texto font-semibold">{jugador.comodines}</span>
              </div>
              <div className="flex justify-between">
                <span>Puntos negativos:</span>
                <span className="text-peligro font-semibold">{jugador.puntos_negativos}</span>
              </div>
              <div className="flex justify-between">
                <span>Actividades cumplidas:</span>
                <span className="text-activo font-semibold">{jugador.actividades_cumplidas}</span>
              </div>
            </div>

            {jugador.castigos_activos.length > 0 && (
              <div className="mt-3 space-y-2">
                {jugador.castigos_activos.map((castigo, i) => (
                  <div key={i} className="bg-superficie rounded p-2 text-xs">
                    <div className="font-semibold text-peligro mb-1">
                      {etiquetas.juego.faltanRondas} {castigo.rondas_restantes} {etiquetas.juego.rondasPara}:
                    </div>
                    <div className="text-textoSecundario">{castigo.texto}</div>
                  </div>
                ))}
              </div>
            )}

            {!jugador.descalificado && !jugador.retirado && (
              <button
                onClick={() => manejarRetiro(indice)}
                className="mt-3 w-full bg-neutro hover:bg-gray-600 text-texto text-sm py-2 px-4 rounded transition-colors duration-200"
              >
                {etiquetas.juego.retirarme}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Marcador;
