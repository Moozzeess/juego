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
    
    // El juez confirma que el jugador cumplio, se suman los puntos
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

    // Avanzar al siguiente turno despues de la confirmacion
    manejarAvanzarTurno();
  };

  const manejarNoCumplio = () => {
    const nuevosJugadores = [...jugadores];
    const tragoSegundos = turno.actividad?.trago_segundos || 0;
    
    // El juez indica que no cumplio, se suman los puntos (deuda) y se aplica castigo
    nuevosJugadores[indice_turno] = {
      ...jugadorActivo,
      liquido_acumulado: jugadorActivo.liquido_acumulado + tragoSegundos,
      actividades_cumplidas: jugadorActivo.actividades_cumplidas,
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

    // Avanzar al siguiente turno despues de la confirmacion
    manejarAvanzarTurno();
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

      const nuevaRonda = estado.estado_partida.ronda_actual + 1;
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

    const actividades = estado.datos.actividades;
    const seleccionarActividadAleatoria = () => {
      if (actividades.length === 0) return null;
      return actividades[Math.floor(Math.random() * actividades.length)];
    };

    dispatch({
      tipo: 'AVANZAR_TURNO',
      indiceTurno: jugadores.findIndex(j => j.nombre === siguienteJugador.nombre),
      jugadorActivo: siguienteJugador.nombre,
      juez: siguienteJuez.nombre,
      actividad: seleccionarActividadAleatoria()
    });
  };

  return (
    <div className="bg-superficie rounded-lg p-6 mt-4">
      <h3 className="text-xl font-condensada font-bold text-center mb-4 text-texto uppercase">
        JUEZ: {estado.estado_partida.juez}
      </h3>
      <p className="text-textoSecundario text-center mb-4 font-condensada uppercase">
        ¿{jugadorActivo.nombre} cumplió con el reto?
      </p>
      <div className="flex gap-4">
        <button
          onClick={manejarCumplio}
          className="flex-1 bg-activo text-white font-condensada font-bold py-3 px-6 rounded-xl border-b-4 border-activoOscuro hover:bg-activoOscuro transition-colors duration-200 uppercase"
        >
          CUMPLIÓ
        </button>
        <button
          onClick={manejarNoCumplio}
          className="flex-1 bg-peligro text-white font-condensada font-bold py-3 px-6 rounded-xl border-b-4 border-peligroOscuro hover:bg-peligroOscuro transition-colors duration-200 uppercase"
        >
          NO CUMPLIÓ
        </button>
      </div>
    </div>
  );
}

export default PanelJuez;
