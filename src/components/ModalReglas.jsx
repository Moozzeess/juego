/**
 * Componente modal para consultar las reglas completas de «EL MENOS PEDO».
 *
 * Responsividad:
 * - Mobile (<md): una columna, contenido con scroll interno, texto compacto.
 * - Tablet (md): dos columnas, scroll si hace falta.
 * - Desktop (lg+): layout completo sin scroll, igual que el original.
 *
 * @param {boolean} abierto - Indica si el modal está visible.
 * @param {Function} alCerrar - Función callback para cerrar el modal.
 */
function ModalReglas({ abierto, alCerrar }) {
  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8 bg-black/90 backdrop-blur-md">
      <div className="panel-cristal rounded-2xl w-full h-full max-w-[98vw] sm:max-w-[95vw] md:max-w-[90vw] lg:max-w-[85vw] max-h-[98vh] sm:max-h-[95vh] md:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">

        {/* Cabecera */}
        <div className="bg-slate-800 px-3 sm:px-4 md:px-6 lg:px-8 py-2.5 sm:py-3 md:py-4 flex items-center justify-between border-b border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex-shrink-0 rounded-full bg-accion/20 text-accion flex items-center justify-center font-bold text-lg sm:text-xl md:text-2xl border border-accion/40">
              ?
            </span>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg md:text-2xl lg:text-3xl font-condensada font-bold uppercase text-texto tracking-wider leading-none">
                REGLAS DEL JUEGO
              </h2>
              <span className="text-[10px] sm:text-xs md:text-sm lg:text-base text-textoSecundario font-sans hidden sm:block">
                «EL MENOS PEDO» — Guía completa
              </span>
            </div>
          </div>
          <button
            onClick={alCerrar}
            className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-slate-700/60 hover:bg-slate-700 text-slate-200 hover:text-white flex items-center justify-center transition-colors text-lg sm:text-xl md:text-2xl font-bold cursor-pointer border border-slate-600"
            aria-label="Cerrar modal de reglas"
          >
            ✕
          </button>
        </div>

        {/* Cuerpo con scroll interno en mobile, sin scroll en desktop */}
        <div className="flex-1 min-h-0 overflow-y-auto lg:overflow-hidden p-2.5 sm:p-3 md:p-4 lg:p-6 font-sans text-texto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3 md:gap-4 lg:h-full">

            {/* ── Mitad izquierda: Cómo se juega ── */}
            <section className="bg-fondo/80 p-2.5 sm:p-3 md:p-4 lg:p-5 rounded-xl border border-neutro flex flex-col">
              <h3 className="font-condensada font-bold uppercase text-sm sm:text-base md:text-lg lg:text-xl text-accion mb-2 sm:mb-2.5 md:mb-3 text-center">
                Cómo se juega
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 md:gap-4 flex-1">
                {/* Columna izquierda */}
                <div className="space-y-2 sm:space-y-2.5 md:space-y-3">
                  <div>
                    <h4 className="font-condensada font-bold uppercase text-[10px] sm:text-xs md:text-sm lg:text-base text-texto mb-1 text-center">
                      Rondas y turnos
                    </h4>
                    <ul className="list-disc pl-2.5 sm:pl-3 space-y-0.5 sm:space-y-1 text-[11px] sm:text-xs md:text-sm lg:text-base text-textoSecundario">
                      <li>Turnos en orden: J1, J2 … JN. Último cierra ronda.</li>
                      <li>Descalificados/retirados se saltan.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-condensada font-bold uppercase text-[10px] sm:text-xs md:text-sm lg:text-base text-activo mb-1">
                      Opción 1: Aceptar reto
                    </h4>
                    <ul className="list-disc pl-2.5 sm:pl-3 space-y-0.5 sm:space-y-1 text-[11px] sm:text-xs md:text-sm lg:text-base text-textoSecundario">
                      <li>Reloj cuenta regresiva (ayuda visual).</li>
                      <li>Juez confirma:
                        <ul className="list-disc pl-2.5 sm:pl-3 mt-0.5 sm:mt-1 space-y-0.5">
                          <li><strong>Cumplió:</strong> sumas segundos.</li>
                          <li><strong>No cumplió:</strong> como negarte.</li>
                        </ul>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-condensada font-bold uppercase text-[10px] sm:text-xs md:text-sm lg:text-base text-accion mb-1">
                      Opción 2: Comodín
                    </h4>
                    <ul className="list-disc pl-2.5 sm:pl-3 space-y-0.5 sm:space-y-1 text-[11px] sm:text-xs md:text-sm lg:text-base text-textoSecundario">
                      <li>2 por partida (no se recargan).</li>
                      <li>Efectos al azar:
                        <ul className="list-disc pl-2.5 sm:pl-3 mt-0.5 sm:mt-1 space-y-0.5">
                          <li><strong>Salvar:</strong> 0s, sin actividad.</li>
                          <li><strong>Cambiar:</strong> nueva actividad.</li>
                        </ul>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Columna derecha */}
                <div className="space-y-2 sm:space-y-2.5 md:space-y-3">
                  <div>
                    <h4 className="font-condensada font-bold uppercase text-[10px] sm:text-xs md:text-sm lg:text-base text-texto mb-1 text-center">
                      Tu turno
                    </h4>
                    <ol className="list-decimal pl-2.5 sm:pl-3 space-y-0.5 sm:space-y-1 text-[11px] sm:text-xs md:text-sm lg:text-base text-textoSecundario">
                      <li>App asigna actividad al azar.</li>
                      <li>Actividad indica segundos de trago.</li>
                      <li>Eliges: Aceptar, Comodín o Negarte.</li>
                    </ol>
                  </div>

                  <div>
                    <h4 className="font-condensada font-bold uppercase text-[10px] sm:text-xs md:text-sm lg:text-base text-peligro mb-1">
                      Opción 3: Negarse
                    </h4>
                    <ul className="list-disc pl-2.5 sm:pl-3 space-y-0.5 sm:space-y-1 text-[11px] sm:text-xs md:text-sm lg:text-base text-textoSecundario">
                      <li><strong>Segundos se suman igual.</strong></li>
                      <li>1 punto negativo + 1 castigo.</li>
                      <li>Deuda: vaso completo al final.</li>
                      <li>No descalifica.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* ── Mitad derecha: Castigos / Descalificación / Ganador ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 md:gap-4">

              {/* Castigos */}
              <section className="bg-fondo/80 p-2.5 sm:p-3 md:p-4 rounded-xl border border-neutro">
                <h3 className="font-condensada font-bold uppercase text-[10px] sm:text-xs md:text-sm lg:text-base text-accion mb-1.5 sm:mb-2">
                  6. Castigos
                </h3>
                <ul className="list-disc pl-2.5 sm:pl-3 space-y-0.5 sm:space-y-1 text-[11px] sm:text-xs md:text-sm lg:text-base text-textoSecundario">
                  <li>Retos sociales ridículos (prenda, cantar, acento).</li>
                  <li>Duran <strong>X rondas</strong>. Contador baja al cerrar ronda.</li>
                  <li>App lleva cuenta, <strong>mesa confirma</strong>.</li>
                  <li>Puedes tener varios a la vez.</li>
                  <li>0 rondas = inmediato, juez confirma.</li>
                </ul>
              </section>

              {/* Descalificación */}
              <section className="bg-fondo/80 p-2.5 sm:p-3 md:p-4 rounded-xl border border-neutro">
                <h3 className="font-condensada font-bold uppercase text-[10px] sm:text-xs md:text-sm lg:text-base text-peligro mb-1.5 sm:mb-2">
                  7. Descalificación
                </h3>
                <div className="space-y-1 sm:space-y-1.5">
                  <div>
                    <p className="text-[11px] sm:text-xs md:text-sm lg:text-base text-textoSecundario mb-0.5"><strong>Casos:</strong></p>
                    <ol className="list-decimal pl-2.5 sm:pl-3 space-y-0.5 text-[11px] sm:text-xs md:text-sm lg:text-base text-textoSecundario">
                      <li>Negarse a cumplir castigo.</li>
                      <li>Terminar sin actividades cumplidas.</li>
                    </ol>
                  </div>
                  <div>
                    <p className="text-[11px] sm:text-xs md:text-sm lg:text-base text-textoSecundario mb-0.5"><strong>Consecuencias:</strong></p>
                    <ul className="list-disc pl-2.5 sm:pl-3 space-y-0.5 text-[11px] sm:text-xs md:text-sm lg:text-base text-textoSecundario">
                      <li>Sale de turnos inmediato.</li>
                      <li>Sin podio ni ganar.</li>
                      <li>Salón de vergüenza.</li>
                      <li>Vaso completo final.</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Ganador — ocupa ambas columnas */}
              <section className="bg-fondo/80 p-2.5 sm:p-3 md:p-4 rounded-xl border border-neutro sm:col-span-2">
                <h3 className="font-condensada font-bold uppercase text-[10px] sm:text-xs md:text-sm lg:text-base text-activo mb-1.5 sm:mb-2">
                  8. Ganador
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <ul className="list-disc pl-2.5 sm:pl-3 space-y-0.5 sm:space-y-1 text-[11px] sm:text-xs md:text-sm lg:text-base text-textoSecundario">
                    <li>Termina al acabar ronda o &lt;2 activos.</li>
                    <li><strong>Gana quien tenga menos puntos.</strong></li>
                    <li>1 activo = gana ese. Todos fuera = sin ganador.</li>
                  </ul>
                  <div>
                    <p className="text-[11px] sm:text-xs md:text-sm lg:text-base text-textoSecundario mb-0.5 sm:mb-1">
                      <strong>Empates:</strong> mini-juego al azar:
                    </p>
                    <ul className="list-disc pl-2.5 sm:pl-3 space-y-0.5 sm:space-y-1 text-[11px] sm:text-xs md:text-sm lg:text-base text-textoSecundario">
                      <li>Cronómetro 5s exactos.</li>
                      <li>Ruleta con número indicado.</li>
                      <li>Contar 10s mentalmente.</li>
                      <li>3 intentos sin ganador = título compartido.</li>
                    </ul>
                  </div>
                </div>
              </section>

            </div>
          </div>
        </div>

        {/* Pie */}
        <div className="bg-slate-800 px-3 sm:px-4 md:px-6 lg:px-8 py-2.5 sm:py-3 md:py-4 flex justify-between items-center border-t border-slate-700 flex-shrink-0 gap-3">
          <span className="text-[10px] sm:text-xs md:text-sm lg:text-base text-slate-400 font-condensada uppercase hidden sm:inline truncate">
            El menos PEDO — Juego de consumo responsable
          </span>
          <button
            onClick={alCerrar}
            className="w-full sm:w-auto bg-accion hover:bg-accionOscuro text-white font-condensada font-bold px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 rounded-xl uppercase tracking-wider text-xs sm:text-sm md:text-base lg:text-lg border-b-4 border-accionOscuro transition-all cursor-pointer shadow-lg active:translate-y-0.5 flex-shrink-0"
          >
            ENTENDIDO Y REGRESAR
          </button>
        </div>

      </div>
    </div>
  );
}

export default ModalReglas;