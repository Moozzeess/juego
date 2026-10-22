import { etiquetas } from '../ui/etiquetas';

/**
 * Componente del panel del juez.
 * Muestra botones para que el juez confirme si el jugador cumplió o no.
 * Visible solo cuando turno.paso es 'confirmacion'.
 * 
 * @param {Object} estado - Estado actual de la partida.
 * @param {Function} dispatch - Función para despachar acciones al reducer.
 */
function PanelJuez({ estado, dispatch }) {
  const { turno, jugadores, indice_turno } = estado.estado_partida;
  const jugadorActivo = jugadores[indice_turno];

  if (turno.paso !== 'confirmacion' || !jugadorActivo) return null;

  const manejarCumplio = () => {
    const nuevosJugadores = [...jugadores];
    const tragoSegundos = turno.actividad?.trago_segundos || 0;
    
    nuevosJugadores[indice_turno] = {
      ...jugadorActivo,
      liquido_acumulado: jugadorActivo.liquido_acumulado + tragoSegundos,
      actividades_cumplidas: jugadorActivo.actividades_cumplidas + 1
    };

    const nuevoHistorial = [
      ...estado.estado_partida.historial,
      {
        tipo: 'actividad_cumplida',
        jugador: jugadorActivo.nombre,
        actividad: turno.actividad?.texto || '',
        trago_segundos: tragoSegundos,
        ronda: estado.estado_partida.ronda_actual
      }
    ];

    dispatch({
      tipo: 'CONFIRMAR_CUMPLIMIENTO',
      jugadores: nuevosJugadores,
      historial: nuevoHistorial
    });
  };

  const manejarNoCumplio = () => {
    const nuevosJugadores = [...jugadores];
    const tragoSegundos = turno.actividad?.trago_segundos || 0;
    
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

    const nuevoHistorial = [
      ...estado.estado_partida.historial,
      {
        tipo: 'actividad_no_cumplida',
        jugador: jugadorActivo.nombre,
        actividad: turno.actividad?.texto || '',
        trago_segundos: tragoSegundos,
        ronda: estado.estado_partida.ronda_actual
      }
    ];

    dispatch({
      tipo: 'CONFIRMAR_CUMPLIMIENTO',
      jugadores: nuevosJugadores,
      historial: nuevoHistorial
    });
  };

  return (
    <div className="bg-superficie rounded-lg p-6 mt-4">
      <h3 className="text-xl font-bold text-center mb-4">
        {etiquetas.juego.juez}: {estado.estado_partida.juez}
      </h3>
      <p className="text-textoSecundario text-center mb-4">
        ¿{jugadorActivo.nombre} cumplió con el reto?
      </p>
      <div className="flex gap-4">
        <button
          onClick={manejarCumplio}
          className="flex-1 bg-activo hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 uppercase"
        >
          {etiquetas.juego.cumplio}
        </button>
        <button
          onClick={manejarNoCumplio}
          className="flex-1 bg-peligro hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 uppercase"
        >
          {etiquetas.juego.noCumplio}
        </button>
      </div>
    </div>
  );
}

export default PanelJuez;
