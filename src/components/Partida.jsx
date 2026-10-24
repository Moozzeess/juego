import { useState } from 'react';
import { etiquetas } from '../ui/etiquetas';
import Marcador from './Marcador';
import AreaAccion from './AreaAccion';
import PanelApoyo from './PanelApoyo';
import ModalReglas from './ModalReglas';

/**
 * Componente principal de la partida.
 * Layout responsivo:
 * - Mobile: tabs con navegación inferior (Acción / Jugadores / Soporte)
 * - Desktop (lg+): tres columnas
 */
function Partida({ estado, dispatch }) {
  const [mostrarReglas, setMostrarReglas] = useState(false);
  const [tabActiva, setTabActiva] = useState('accion'); // 'accion' | 'jugadores' | 'soporte'
  const { ronda_actual } = estado.estado_partida;
  const rondas_totales = estado.configuracion.rondas_totales;

  // Cuántos jugadores tienen castigos activos (badge en tab)
  const jugadoresConCastigos = estado.estado_partida.jugadores.filter(
    j => j.castigos_activos.length > 0 && !j.descalificado && !j.retirado
  ).length;

  return (
    <div className="h-[100dvh] w-screen flex flex-col bg-fondo overflow-hidden">
      {/* Header compacto */}
      <header className="panel-cristal border-b border-white/10 px-3 md:px-4 py-2 flex-shrink-0 z-10">
        <div className="max-w-[98vw] mx-auto flex justify-between items-center gap-2">
          <h1 className="text-base md:text-xl lg:text-2xl font-condensada font-bold text-texto uppercase tracking-wide truncate">
            {etiquetas.juego.titulo}
          </h1>
          <div className="text-textoSecundario font-condensada font-bold uppercase text-xs md:text-sm whitespace-nowrap">
            R {ronda_actual}/{rondas_totales}
          </div>
          <button
            onClick={() => setMostrarReglas(true)}
            title="Reglas"
            className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-700/80 hover:bg-accion text-white flex items-center justify-center transition-colors border border-slate-600"
            aria-label="Ver reglas"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </button>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-1 min-h-0 overflow-hidden">

        {/* ── DESKTOP (lg+): tres columnas ── */}
        <div className="hidden lg:grid lg:grid-cols-4 gap-3 md:gap-4 h-full p-3 md:p-4 xl:p-6">
          <div className="lg:col-span-1 min-h-0 overflow-hidden">
            <Marcador estado={estado} dispatch={dispatch} />
          </div>
          <div className="lg:col-span-2 min-h-0 overflow-hidden">
            <AreaAccion estado={estado} dispatch={dispatch} />
          </div>
          <div className="lg:col-span-1 min-h-0 overflow-hidden">
            <PanelApoyo estado={estado} />
          </div>
        </div>

        {/* ── MOBILE / TABLET (<lg): una sola vista con tabs ── */}
        <div className="lg:hidden h-full flex flex-col">
          {/* Área de contenido de la tab activa */}
          <div className="flex-1 min-h-0 overflow-hidden p-2 sm:p-3">
            {tabActiva === 'accion' && (
              <AreaAccion estado={estado} dispatch={dispatch} />
            )}
            {tabActiva === 'jugadores' && (
              <Marcador estado={estado} dispatch={dispatch} />
            )}
            {tabActiva === 'soporte' && (
              <PanelApoyo estado={estado} />
            )}
          </div>

          {/* Barra de tabs inferior */}
          <nav
            className="flex-shrink-0 flex border-t border-white/10 bg-[#0F172A]/95 backdrop-blur-md"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
            aria-label="Navegación del juego"
          >
            {/* Tab: Acción (siempre la principal) */}
            <button
              onClick={() => setTabActiva('accion')}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-condensada font-bold uppercase transition-colors relative ${
                tabActiva === 'accion'
                  ? 'text-accion'
                  : 'text-textoSecundario hover:text-texto'
              }`}
              aria-current={tabActiva === 'accion' ? 'page' : undefined}
            >
              {tabActiva === 'accion' && (
                <span className="absolute top-0 left-4 right-4 h-0.5 bg-accion rounded-full" />
              )}
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Acción
            </button>

            {/* Tab: Jugadores */}
            <button
              onClick={() => setTabActiva('jugadores')}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-condensada font-bold uppercase transition-colors relative ${
                tabActiva === 'jugadores'
                  ? 'text-accion'
                  : 'text-textoSecundario hover:text-texto'
              }`}
              aria-current={tabActiva === 'jugadores' ? 'page' : undefined}
            >
              {tabActiva === 'jugadores' && (
                <span className="absolute top-0 left-4 right-4 h-0.5 bg-accion rounded-full" />
              )}
              <span className="relative">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {jugadoresConCastigos > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-peligro text-white text-[10px] font-bold flex items-center justify-center">
                    {jugadoresConCastigos}
                  </span>
                )}
              </span>
              Jugadores
            </button>

            {/* Tab: Soporte */}
            <button
              onClick={() => setTabActiva('soporte')}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-condensada font-bold uppercase transition-colors relative ${
                tabActiva === 'soporte'
                  ? 'text-accion'
                  : 'text-textoSecundario hover:text-texto'
              }`}
              aria-current={tabActiva === 'soporte' ? 'page' : undefined}
            >
              {tabActiva === 'soporte' && (
                <span className="absolute top-0 left-4 right-4 h-0.5 bg-accion rounded-full" />
              )}
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Soporte
            </button>
          </nav>
        </div>
      </main>

      <ModalReglas abierto={mostrarReglas} alCerrar={() => setMostrarReglas(false)} />
    </div>
  );
}

export default Partida;