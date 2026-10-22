import { etiquetas } from '../ui/etiquetas';
import Marcador from './Marcador';
import AreaAccion from './AreaAccion';
import PanelApoyo from './PanelApoyo';

/**
 * Componente principal de la partida.
 * Muestra el layout de tres columnas con el marcador, área de acción y panel de apoyo.
 * 
 * @param {Object} estado - Estado actual de la partida.
 * @param {Function} dispatch - Función para despachar acciones al reducer.
 */
function Partida({ estado, dispatch }) {
  const { ronda_actual } = estado.estado_partida;
  const rondas_totales = estado.configuracion.rondas_totales;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-superficie border-b border-neutro px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-accion">
            {etiquetas.juego.titulo}
          </h1>
          <div className="text-textoSecundario">
            {etiquetas.juego.ronda} {ronda_actual} {etiquetas.juego.de} {rondas_totales}
          </div>
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="max-w-7xl mx-auto h-[calc(100vh-120px)] grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <Marcador estado={estado} dispatch={dispatch} />
          </div>
          
          <div className="md:col-span-2">
            <AreaAccion estado={estado} dispatch={dispatch} />
          </div>
          
          <div className="md:col-span-1">
            <PanelApoyo estado={estado} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default Partida;
