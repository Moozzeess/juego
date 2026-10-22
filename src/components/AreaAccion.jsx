import { etiquetas } from '../ui/etiquetas';
import RelojTrago from './RelojTrago';
import PanelJuez from './PanelJuez';

/**
 * Componente del área de acción principal.
 * Muestra la actividad actual, el reloj de trago y los botones de decisión.
 * 
 * @param {Object} estado - Estado actual de la partida.
 * @param {Function} dispatch - Función para despachar acciones al reducer.
 */
function AreaAccion({ estado, dispatch }) {
  const { turno, jugadores, indice_turno, ronda_actual, juez } = estado.estado_partida;
  const jugadorActivo = jugadores[indice_turno];
  const { actividades, comodines } = estado.datos;

  if (!jugadorActivo) return null;

  const seleccionarActividadAleatoria = () => {
    if (actividades.length === 0) return null;
    return actividades[Math.floor(Math.random() * actividades.length)];
  };

  const actividadActual = turno.actividad || seleccionarActividadAleatoria();

  const manejarAceptar = () => {
    dispatch({
      tipo: 'ACEPTAR_RETO'
    });
  };

  const manejarComodin = () => {
    if (jugadorActivo.comodines === 0) return;

    const comodinAleatorio = comodines[Math.floor(Math.random() * comodines.length)];
    const nuevosJugadores = [...jugadores];
    
    nuevosJugadores[indice_turno] = {
      ...jugadorActivo,
      comodines: jugadorActivo.comodines - 1
    };

    if (comodinAleatorio.efecto === 'salvar') {
      dispatch({
        tipo: 'USAR_COMODIN',
        jugadores: nuevosJugadores,
        esSalvar: true
      });
    } else {
      dispatch({
        tipo: 'USAR_COMODIN',
        jugadores: nuevosJugadores,
        actividad: {
          texto: comodinAleatorio.texto,
          trago_segundos: comodinAleatorio.trago_segundos || 0
        },
        esSalvar: false
      });
    }
  };

  const manejarNegarse = () => {
    const nuevosJugadores = [...jugadores];
    const tragoSegundos = actividadActual?.trago_segundos || 0;
    
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

    dispatch({
      tipo: 'NEGARSE',
      jugadores: nuevosJugadores
    });
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

      const nuevaRonda = ronda_actual + 1;
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

    dispatch({
      tipo: 'AVANZAR_TURNO',
      indiceTurno: jugadores.findIndex(j => j.nombre === siguienteJugador.nombre),
      jugadorActivo: siguienteJugador.nombre,
      juez: siguienteJuez.nombre,
      actividad: seleccionarActividadAleatoria()
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-superficie rounded-lg p-6 flex-1 flex flex-col">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-accion mb-2">
            {etiquetas.juego.jugadorActivo}: {jugadorActivo.nombre}
          </h2>
          <p className="text-textoSecundario">
            {etiquetas.juego.juez}: {juez}
          </p>
        </div>

        {actividadActual && (
          <div className="bg-fondo rounded-lg p-6 mb-4 flex-1 flex flex-col items-center justify-center">
            <h3 className="text-xl font-semibold text-center mb-4">
              {actividadActual.texto}
            </h3>
            <div className="text-4xl font-bold text-accion mb-2">
              {actividadActual.trago_segundos}s
            </div>
          </div>
        )}

        {turno.paso === 'eleccion' && (
          <div className="flex gap-4 mt-4">
            <button
              onClick={manejarAceptar}
              className="flex-1 bg-activo hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 uppercase"
            >
              {etiquetas.juego.aceptar}
            </button>
            <button
              onClick={manejarComodin}
              disabled={jugadorActivo.comodines === 0}
              className={`flex-1 font-bold py-3 px-6 rounded-lg transition-colors duration-200 uppercase ${
                jugadorActivo.comodines === 0
                  ? 'bg-neutro text-textoSecundario cursor-not-allowed opacity-50'
                  : 'bg-accion hover:bg-blue-600 text-white'
              }`}
            >
              {etiquetas.juego.comodin} ({jugadorActivo.comodines})
            </button>
            <button
              onClick={manejarNegarse}
              className="flex-1 bg-peligro hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 uppercase"
            >
              {etiquetas.juego.negar}
            </button>
          </div>
        )}

        {turno.paso === 'en_curso' && (
          <RelojTrago 
            segundos={actividadActual?.trago_segundos || 0} 
            activo={true} 
          />
        )}

        <PanelJuez estado={estado} dispatch={dispatch} />

        {turno.paso === 'eleccion' && (
          <button
            onClick={manejarAvanzarTurno}
            className="mt-4 w-full bg-neutro hover:bg-gray-600 text-texto font-bold py-3 px-6 rounded-lg transition-colors duration-200 uppercase"
          >
            Siguiente turno
          </button>
        )}
      </div>
    </div>
  );
}

export default AreaAccion;
