import { useReducer } from 'react';
import Advertencia from './components/Advertencia';
import Configuracion from './components/Configuracion';
import Partida from './components/Partida';
import Desempate from './components/Desempate';
import ModalCierre from './components/ModalCierre';

/**
 * Estado inicial de la partida según AGENTS.md sección 4.
 */
const estadoInicial = {
  configuracion: {
    total_jugadores: null,
    nombres_jugadores: [],
    rondas_totales: null
  },
  datos: {
    actividades: [],
    comodines: [],
    castigos: []
  },
  estado_partida: {
    fase: 'configuracion',
    ronda_actual: 1,
    indice_turno: 0,
    jugador_activo: null,
    juez: null,
    turno: {
      paso: 'eleccion',
      actividad: null,
      origen: 'actividad'
    },
    jugadores: [],
    historial: [],
    desempate: {
      intento: 0,
      minijuego: null,
      participantes: [],
      resultados: []
    },
    resultado_final: null
  }
};

/**
 * Reducer principal de la aplicación.
 * Maneja todas las transiciones de estado del juego.
 */
function reducer(estado, accion) {
  switch (accion.tipo) {
    case 'ACEPTAR_ADVERTENCIA':
      return {
        ...estado,
        estado_partida: {
          ...estado.estado_partida,
          fase: 'configuracion'
        }
      };

    case 'CARGAR_DATOS':
      return {
        ...estado,
        datos: {
          actividades: accion.actividades || [],
          comodines: accion.comodines || [],
          castigos: accion.castigos || []
        }
      };

    case 'INICIAR_PARTIDA':
      return {
        ...estado,
        configuracion: accion.configuracion,
        estado_partida: {
          ...estado.estado_partida,
          fase: 'partida',
          jugadores: accion.jugadores,
          ronda_actual: 1,
          indice_turno: 0,
          jugador_activo: accion.jugadores[0]?.nombre || null,
          juez: accion.jugadores[1]?.nombre || null
        }
      };

    case 'AVANZAR_TURNO':
      return {
        ...estado,
        estado_partida: {
          ...estado.estado_partida,
          indice_turno: accion.indiceTurno,
          jugador_activo: accion.jugadorActivo,
          juez: accion.juez,
          turno: {
            paso: 'eleccion',
            actividad: accion.actividad,
            origen: 'actividad'
          }
        }
      };

    case 'ACEPTAR_RETO':
      return {
        ...estado,
        estado_partida: {
          ...estado.estado_partida,
          turno: {
            ...estado.estado_partida.turno,
            paso: 'en_curso'
          }
        }
      };

    case 'FINALIZAR_RELOJ':
      // El reloj solo pasa a la fase de confirmacion del juez
      // No suma puntos automaticamente; el juez decide si cumplio o no
      return {
        ...estado,
        estado_partida: {
          ...estado.estado_partida,
          turno: {
            ...estado.estado_partida.turno,
            paso: 'confirmacion'
          }
        }
      };

    case 'USAR_COMODIN':
      return {
        ...estado,
        estado_partida: {
          ...estado.estado_partida,
          jugadores: accion.jugadores,
          turno: {
            ...estado.estado_partida.turno,
            paso: 'comodin_revelado',
            actividad: accion.actividad || estado.estado_partida.turno.actividad,
            comodin_activo: accion.comodin,
            origen: accion.esSalvar ? 'comodin_salvar' : 'comodin_cambiar'
          }
        }
      };

    case 'CONTINUAR_COMODIN':
      return {
        ...estado,
        estado_partida: {
          ...estado.estado_partida,
          turno: {
            ...estado.estado_partida.turno,
            paso: accion.pasoSiguiente,
            actividad: accion.actividad || estado.estado_partida.turno.actividad
          }
        }
      };

    case 'NEGARSE':
      return {
        ...estado,
        estado_partida: {
          ...estado.estado_partida,
          jugadores: accion.jugadores,
          turno: {
            ...estado.estado_partida.turno,
            paso: 'confirmacion'
          }
        }
      };

    case 'CONFIRMAR_CUMPLIMIENTO':
      return {
        ...estado,
        estado_partida: {
          ...estado.estado_partida,
          jugadores: accion.jugadores,
          turno: {
            ...estado.estado_partida.turno,
            paso: 'eleccion'
          },
          historial: accion.historial
        }
      };

    case 'CERRAR_RONDA':
      return {
        ...estado,
        estado_partida: {
          ...estado.estado_partida,
          ronda_actual: accion.rondaActual,
          jugadores: accion.jugadores,
          historial: accion.historial
        }
      };

    case 'DESCALIFICAR_JUGADOR':
      return {
        ...estado,
        estado_partida: {
          ...estado.estado_partida,
          jugadores: accion.jugadores,
          indice_turno: accion.indiceTurno,
          jugador_activo: accion.jugadorActivo,
          juez: accion.juez
        }
      };

    case 'RETIRAR_JUGADOR':
      return {
        ...estado,
        estado_partida: {
          ...estado.estado_partida,
          jugadores: accion.jugadores,
          indice_turno: accion.indiceTurno,
          jugador_activo: accion.jugadorActivo,
          juez: accion.juez
        }
      };

    case 'INICIAR_DESEMPATE':
      return {
        ...estado,
        estado_partida: {
          ...estado.estado_partida,
          fase: 'desempate',
          desempate: {
            intento: 1,
            minijuego: accion.minijuego,
            participantes: accion.participantes,
            resultados: []
          }
        }
      };

    case 'REGISTRAR_RESULTADO_DESEMPATE':
      return {
        ...estado,
        estado_partida: {
          ...estado.estado_partida,
          desempate: {
            ...estado.estado_partida.desempate,
            resultados: accion.resultados
          }
        }
      };

    case 'SIGUIENTE_INTENTO_DESEMPATE':
      return {
        ...estado,
        estado_partida: {
          ...estado.estado_partida,
          desempate: {
            ...estado.estado_partida.desempate,
            intento: estado.estado_partida.desempate.intento + 1,
            minijuego: accion.minijuego,
            resultados: []
          }
        }
      };

    case 'FINALIZAR_DESEMPATE':
      return {
        ...estado,
        estado_partida: {
          ...estado.estado_partida,
          fase: 'cierre',
          resultado_final: accion.resultadoFinal
        }
      };

    case 'IR_A_CIERRE':
      return {
        ...estado,
        estado_partida: {
          ...estado.estado_partida,
          fase: 'cierre',
          resultado_final: accion.resultadoFinal
        }
      };

    case 'REINICIAR_MISMA_CONFIGURACION':
      return {
        ...estado,
        estado_partida: {
          ...estado.estado_partida,
          fase: 'partida',
          ronda_actual: 1,
          indice_turno: 0,
          jugador_activo: estado.configuracion.nombres_jugadores[0] || null,
          juez: estado.configuracion.nombres_jugadores[1] || null,
          turno: {
            paso: 'eleccion',
            actividad: null,
            origen: 'actividad'
          },
          jugadores: estado.configuracion.nombres_jugadores.map(nombre => ({
            nombre,
            liquido_acumulado: 0,
            comodines: 2,
            actividades_cumplidas: 0,
            puntos_negativos: 0,
            castigos_activos: [],
            descalificado: false,
            motivo_descalificacion: null,
            retirado: false
          })),
          historial: [],
          desempate: {
            intento: 0,
            minijuego: null,
            participantes: [],
            resultados: []
          },
          resultado_final: null
        }
      };

    case 'NUEVA_CONFIGURACION':
      return estadoInicial;

    default:
      return estado;
  }
}

/**
 * Componente principal de la aplicación.
 * Gestiona el estado global con useReducer y renderiza la vista correspondiente.
 */
function App() {
  const [estado, dispatch] = useReducer(reducer, estadoInicial);

  const renderizarVista = () => {
    switch (estado.estado_partida.fase) {
      case 'advertencia':
        return <Advertencia dispatch={dispatch} />;
      case 'configuracion':
        return <Configuracion dispatch={dispatch} estado={estado} />;
      case 'partida':
        return <Partida dispatch={dispatch} estado={estado} />;
      case 'desempate':
        return <Desempate dispatch={dispatch} estado={estado} />;
      case 'cierre':
        return <ModalCierre dispatch={dispatch} estado={estado} />;
      default:
        return <Advertencia dispatch={dispatch} />;
    }
  };

  return (
    <div className="min-h-screen bg-fondo text-texto">
      {renderizarVista()}
    </div>
  );
}

export default App;
