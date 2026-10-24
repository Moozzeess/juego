import { motion } from 'framer-motion';
import { etiquetas } from '../ui/etiquetas';

/**
 * Componente del panel del juez.
 * Muestra botones para que el juez confirme si el jugador cumplió o no.
 * Visible solo cuando turno.paso es 'confirmacion'.
 *
 * @param {Object} estado - Estado actual de la partida.
 * @param {Function} dispatch - Función para despachar acciones al reducer.
 * @param {Function} [alCastigar] - Se llama con los datos del castigo para mostrarlo en un modal.
 */
function PanelJuez({ estado, dispatch, alCastigar }) {
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

    // Avanzar al siguiente turno con los datos ya actualizados
    manejarAvanzarTurno(nuevosJugadores, nuevoHistorial);
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

    // Avisa a AreaAccion para que muestre el castigo. El modal no vive aquí porque
    // este panel se oculta en cuanto el turno avanza.
    if (castigoAleatorio) {
      alCastigar?.({
        jugador: jugadorActivo.nombre,
        indice: indice_turno,
        motivo: 'no_cumplio',
        castigo: castigoAleatorio,
        actividad: turno.actividad?.texto,
        segundos: tragoSegundos
      });
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

    // Avanzar al siguiente turno con los datos ya actualizados
    manejarAvanzarTurno(nuevosJugadores, nuevoHistorial);
  };

  /**
   * Recibe la lista de jugadores y el historial YA actualizados.
   * Antes usaba `jugadores` e `historial` del render actual (sin los cambios
   * de este turno), por lo que CERRAR_RONDA sobrescribía el estado y
   * se perdían los segundos y el registro del último jugador de la ronda.
   */
  const manejarAvanzarTurno = (jugadoresBase, historialBase) => {
    const jugadoresActivos = jugadoresBase.filter(j => !j.descalificado && !j.retirado);

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
      const jugadoresConCastigosActualizados = jugadoresBase.map(j => ({
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
        historial: historialBase
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
      indiceTurno: jugadoresBase.findIndex(j => j.nombre === siguienteJugador.nombre),
      jugadorActivo: siguienteJugador.nombre,
      juez: siguienteJuez.nombre,
      actividad: seleccionarActividadAleatoria()
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 160, damping: 16 }}
      className="mt-4 rounded-2xl p-[2px] flex-shrink-0"
      style={{
        background: 'linear-gradient(135deg, #FACC15, #F97316)',
        boxShadow: '0 12px 40px rgba(249, 115, 22, 0.35)'
      }}
    >
      <div className="rounded-[14px] bg-[#0F172A]/95 p-4 md:p-5">
        {/* Quién juzga y qué se juzga */}
        <div className="flex items-center justify-center gap-2 mb-1">
          <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v18m-7-4l-2-6h4l-2 6zm14 0l-2-6h4l-2 6zM5 7h14M9 21h6" />
          </svg>
          <span className="text-textoSecundario font-condensada font-bold uppercase tracking-wider text-xs md:text-sm">
            Juez
          </span>
          <span className="fuente-juego text-lg md:text-xl text-yellow-400">
            {estado.estado_partida.juez}
          </span>
        </div>

        <p className="text-texto text-center mb-4 font-condensada font-bold uppercase text-base md:text-lg">
          ¿{jugadorActivo.nombre} cumplió con el reto?
        </p>

        <div className="flex gap-3">
          <motion.button
            onClick={manejarCumplio}
            whileHover={{ y: -2 }}
            className="boton-juego boton-aceptar flex-1 text-white font-condensada py-3.5 px-4 text-base md:text-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
            Cumplió
          </motion.button>

          <motion.button
            onClick={manejarNoCumplio}
            whileHover={{ y: -2 }}
            className="boton-juego boton-negar flex-1 text-white font-condensada py-3.5 px-4 text-base md:text-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 6l12 12M18 6L6 18" />
            </svg>
            No cumplió
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default PanelJuez;