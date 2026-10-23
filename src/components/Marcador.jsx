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

  const obtenerColorAvatar = (nombre) => {
    const colores = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];
    const indice = nombre.charCodeAt(0) % colores.length;
    return colores[indice];
  };

  const esJugadorActivo = (jugador) => {
    return jugador.nombre === estado.estado_partida.jugador_activo && !jugador.descalificado && !jugador.retirado;
  };

  return (
    <div className="bg-superficie rounded-2xl p-3 h-full flex flex-col border border-neutro overflow-hidden">
      <h2 className="text-center font-condensada font-bold text-texto uppercase text-base md:text-lg mb-2 flex-shrink-0 tracking-wider">
        ESTADO DE JUGADORES
      </h2>
      <div className="space-y-2 flex-1 overflow-y-auto pr-1">
        {jugadores.map((jugador, indice) => (
          <div
            key={indice}
            className={`bg-fondo rounded-xl p-2.5 border-2 flex items-center gap-3 ${
              jugador.descalificado ? 'border-peligro opacity-60' :
              jugador.retirado ? 'border-neutro opacity-60' :
              esJugadorActivo(jugador) ? 'border-activo shadow-[0_0_16px_rgba(16,185,129,0.4)]' :
              'border-neutro'
            }`}
          >
            <div className="relative flex-shrink-0">
              <div 
                className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white font-bold text-base md:text-lg"
                style={{ backgroundColor: obtenerColorAvatar(jugador.nombre) }}
              >
                {jugador.nombre.charAt(0).toUpperCase()}
              </div>
              {esJugadorActivo(jugador) && (
                <div className="absolute inset-0 rounded-full border-2 border-activo animate-pulse"></div>
              )}
              {jugador.descalificado && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-6 h-6 text-peligro" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <h3 className={`font-condensada font-bold uppercase truncate text-sm md:text-base ${jugador.descalificado ? 'text-neutro' : 'text-texto'}`}>
                  {jugador.nombre}
                </h3>
                <span className={`text-[11px] font-condensada font-bold uppercase ${obtenerEstadoColor(jugador)} flex-shrink-0 ml-1`}>
                  {obtenerEstadoTexto(jugador)}
                </span>
              </div>
              
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-accion" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.5 17a4.5 4.5 0 01-1.44-8.765 4 4 0 018.302-3.046 3.5 3.5 0 014.504 4.272A4 4 0 0115 17H5.5zm3.75-2.75a.75.75 0 001.5 0V9.66l1.95 2.1a.75.75 0 101.1-1.02l-3.25-3.5a.75.75 0 00-1.1 0l-3.25 3.5a.75.75 0 101.1 1.02l1.95-2.1v4.59z" clipRule="evenodd" />
                  </svg>
                  <span className="text-texto font-condensada font-bold">{jugador.liquido_acumulado}s</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-accion" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
                  </svg>
                  <span className="text-texto font-condensada font-bold">
                    {jugador.comodines}
                  </span>
                </div>
                {jugador.puntos_negativos > 0 && (
                  <div className="flex items-center gap-1 text-peligro font-condensada font-bold">
                    <span>!</span>
                    <span>{jugador.puntos_negativos}</span>
                  </div>
                )}
              </div>

              {jugador.castigos_activos.length > 0 && (
                <div className="mt-1 space-y-0.5">
                  {jugador.castigos_activos.slice(0, 1).map((castigo, i) => (
                    <div key={i} className="bg-peligro bg-opacity-20 rounded px-1.5 py-0.5 text-[10px] truncate">
                      <span className="text-peligro font-condensada font-bold">
                        {castigo.rondas_restantes}r: {castigo.texto}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => manejarRetiro(indice)}
              title="Retirarme"
              className="text-textoSecundario hover:text-peligro text-xs font-condensada font-bold uppercase transition-colors"
            >
              Salir
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Marcador;
