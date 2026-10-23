import { useState } from 'react';
import { etiquetas } from '../ui/etiquetas';
import Marcador from './Marcador';
import AreaAccion from './AreaAccion';
import PanelApoyo from './PanelApoyo';
import ModalReglas from './ModalReglas';

/**
 * Componente principal de la partida.
 * Muestra el layout de tres columnas con el marcador, área de acción y panel de apoyo.
 * 
 * @param {Object} estado - Estado actual de la partida.
 * @param {Function} dispatch - Función para despachar acciones al reducer.
 */
function Partida({ estado, dispatch }) {
  const [mostrarReglas, setMostrarReglas] = useState(false);
  const { ronda_actual } = estado.estado_partida;
  const rondas_totales = estado.configuracion.rondas_totales;

  return (
    <div className="h-screen w-screen flex flex-col bg-fondo overflow-hidden">
      <header className="bg-superficie border-b border-neutro px-4 py-2.5 flex-shrink-0">
        <div className="max-w-[98vw] mx-auto flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-condensada font-bold text-texto uppercase">
            {etiquetas.juego.titulo}
          </h1>
          <div className="text-textoSecundario font-condensada font-bold uppercase text-sm md:text-base">
            {etiquetas.juego.ronda} {ronda_actual} {etiquetas.juego.de} {rondas_totales}
          </div>
          <div className="flex items-center gap-2">
            {/* Botón de Reglas del Juego */}
            <button
              onClick={() => setMostrarReglas(true)}
              title="Reglas del juego"
              className="px-3 h-10 rounded-full bg-slate-700/80 hover:bg-accion text-white font-condensada font-bold text-xs uppercase flex items-center gap-1.5 transition-colors border border-slate-600"
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>Reglas</span>
            </button>

            <button className="w-10 h-10 rounded-full bg-neutro hover:bg-accion flex items-center justify-center transition-colors">
              <svg className="w-5 h-5 text-texto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
            <button className="w-10 h-10 rounded-full bg-neutro hover:bg-accion flex items-center justify-center transition-colors">
              <svg className="w-5 h-5 text-texto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-2 md:p-3 overflow-hidden">
        <div className="max-w-[98vw] mx-auto h-[calc(100vh-60px)] grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-1 h-full overflow-hidden">
            <Marcador estado={estado} dispatch={dispatch} />
          </div>
          
          <div className="md:col-span-2 h-full overflow-hidden">
            <AreaAccion estado={estado} dispatch={dispatch} />
          </div>
          
          <div className="md:col-span-1 h-full overflow-hidden">
            <PanelApoyo estado={estado} />
          </div>
        </div>
      </main>

      {/* Modal de Reglas */}
      <ModalReglas abierto={mostrarReglas} alCerrar={() => setMostrarReglas(false)} />
    </div>
  );
}

export default Partida;
