/**
 * Componente modal para consultar las reglas completas de «EL MENOS PEDO».
 * Diseño adaptado a pantalla completa sin scroll vertical:
 * Organizado en una cuadrícula compacta de 2x2 que aprovecha todo el espacio disponible.
 *
 * @param {boolean} abierto - Indica si el modal está visible.
 * @param {Function} alCerrar - Función callback para cerrar el modal.
 */
function ModalReglas({ abierto, alCerrar }) {
  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 lg:p-8 bg-black/90 backdrop-blur-md overflow-hidden">
      <div className="panel-cristal rounded-2xl w-full h-full max-w-[95vw] md:max-w-[90vw] lg:max-w-[85vw] max-h-[95vh] md:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Cabecera del modal compacta y de alto impacto */}
        <div className="bg-slate-800 px-4 md:px-6 lg:px-8 py-3 md:py-4 flex items-center justify-between border-b border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-accion/20 text-accion flex items-center justify-center font-bold text-xl md:text-2xl border border-accion/40">
              ?
            </span>
            <div>
              <h2 className="text-lg md:text-2xl lg:text-3xl font-condensada font-bold uppercase text-texto tracking-wider leading-none">
                REGLAS DEL JUEGO
              </h2>
              <span className="text-xs md:text-sm lg:text-base text-textoSecundario font-sans">
                «EL MENOS PEDO» - Guía completa de juego
              </span>
            </div>
          </div>
          <button
            onClick={alCerrar}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-700/60 hover:bg-slate-700 text-slate-200 hover:text-white flex items-center justify-center transition-colors text-xl md:text-2xl font-bold cursor-pointer border border-slate-600"
            aria-label="Cerrar modal de reglas"
          >
            ✕
          </button>
        </div>

        {/* Contenido sin scroll - Layout 50% izquierda / 50% derecha dividida en 3 */}
        <div className="p-3 md:p-4 lg:p-6 flex-1 font-sans text-texto overflow-hidden">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 h-full">
            
            {/* Mitad izquierda: Instrucciones (50%) */}
            <section className="bg-fondo/80 p-3 md:p-4 lg:p-5 rounded-xl border border-neutro flex flex-col overflow-hidden">
              <h3 className="font-condensada font-bold uppercase text-base md:text-lg lg:text-xl text-accion mb-2 md:mb-3 text-center">
                Cómo se juega
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 flex-1">
                {/* Columna izquierda */}
                <div className="space-y-2 md:space-y-3">
                  <div>
                    <h4 className="font-condensada font-bold uppercase text-xs md:text-sm lg:text-base text-text mb-1 text-center">
                      Rondas y turnos
                    </h4>
                    <ul className="list-disc pl-2 md:pl-3 space-y-0.5 md:space-y-1 text-xs md:text-sm lg:text-base text-textoSecundario">
                      <li>Turnos en orden: J1, J2, ... JN. Último cierra ronda.</li>
                      <li>Descalificados/retirados se saltan.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-condensada font-bold uppercase text-xs md:text-sm lg:text-base text-activo mb-1">
                      Opción 1: Aceptar reto
                    </h4>
                    <ul className="list-disc pl-2 md:pl-3 space-y-0.5 md:space-y-1 text-xs md:text-sm lg:text-base text-textoSecundario">
                      <li>Reloj cuenta regresiva (ayuda visual).</li>
                      <li>Juez (siguiente jugador) confirma:
                        <ul className="list-disc pl-2 md:pl-3 mt-0.5 md:mt-1 space-y-0.5 md:space-y-1">
                          <li><strong>Cumplió:</strong> sumas segundos.</li>
                          <li><strong>No cumplió:</strong> como negarte.</li>
                        </ul>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-condensada font-bold uppercase text-xs md:text-sm lg:text-base text-accion mb-1">
                      Opción 2: Usar comodín
                    </h4>
                    <ul className="list-disc pl-2 md:pl-3 space-y-0.5 md:space-y-1 text-xs md:text-sm lg:text-base text-textoSecundario">
                      <li>2 comodines por partida (no se recargan).</li>
                      <li>Efectos al azar:
                        <ul className="list-disc pl-2 md:pl-3 mt-0.5 md:mt-1 space-y-0.5 md:space-y-1">
                          <li><strong>Salvar:</strong> 0s, sin actividad.</li>
                          <li><strong>Cambiar:</strong> otra actividad distinta.</li>
                        </ul>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Columna derecha */}
                <div className="space-y-2 md:space-y-3">
                  <div>
                    <h4 className="font-condensada font-bold uppercase text-xs md:text-sm lg:text-base text-text mb-1 text-center">
                      Tu turno
                    </h4>
                    <ol className="list-decimal pl-2 md:pl-3 space-y-0.25 md:space-y-1 mb-1 md:mb-1 text-xs md:text-sm lg:text-base text-textoSecundario">
                      <li>App asigna actividad al azar.</li>
                      <li>Actividad indica segundos de trago.</li>
                      <li>Eliges: Aceptar, Comodín o Negarte.</li>
                    </ol>
                  </div>

                  <div>
                    <h4 className="font-condensada font-bold uppercase text-xs md:text-sm lg:text-base text-peligro mb-1">
                      Opción 3: Negarse
                    </h4>
                    <ul className="list-disc pl-2 md:pl-3 space-y-0.5 md:space-y-1 text-xs md:text-sm lg:text-base text-textoSecundario">
                      <li><strong>Segundos se suman igual</strong>.</li>
                      <li>1 punto negativo + 1 castigo.</li>
                      <li>Deuda: vaso completo al final.</li>
                      <li>No descalifica.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Mitad derecha: 3 cuadros en grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              
              {/* Cuadro 1: Castigos */}
              <section className="bg-fondo/80 p-2 md:p-3 lg:p-4 rounded-xl border border-neutro overflow-hidden">
                <h3 className="font-condensada font-bold uppercase text-xs md:text-sm lg:text-base text-accion mb-1 md:mb-2">
                  6. Castigos
                </h3>
                <ul className="list-disc pl-2 md:pl-3 space-y-0.5 md:space-y-1 text-xs md:text-sm lg:text-base text-textoSecundario">
                  <li>Retos sociales ridículos (prenda, cantar, acento).</li>
                  <li>Duran <strong>X rondas</strong>. Contador baja al cerrar ronda.</li>
                  <li>App lleva cuenta, <strong>mesa confirma</strong>.</li>
                  <li>Puedes tener varios a la vez.</li>
                  <li>0 rondas = inmediato, juez confirma.</li>
                </ul>
              </section>

              {/* Cuadro 2: Descalificación */}
              <section className="bg-fondo/80 p-2 md:p-3 lg:p-4 rounded-xl border border-neutro overflow-hidden">
                <h3 className="font-condensada font-bold uppercase text-xs md:text-sm lg:text-base text-peligro mb-1 md:mb-2">
                  7. Descalificación
                </h3>
                <div className="grid grid-cols-1 gap-1 md:gap-2">
                  <div>
                    <p className="text-xs md:text-sm lg:text-base text-textoSecundario mb-0.5 md:mb-1">
                      <strong>Casos:</strong>
                    </p>
                    <ol className="list-decimal pl-2 md:pl-3 space-y-0.5 md:space-y-1 text-xs md:text-sm lg:text-base text-textoSecundario">
                      <li>Negarse a cumplir castigo.</li>
                      <li>Terminar sin actividades cumplidas.</li>
                    </ol>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm lg:text-base text-textoSecundario mb-0.5 md:mb-1">
                      <strong>Consecuencias:</strong>
                    </p>
                    <ul className="list-disc pl-2 md:pl-3 space-y-0.5 md:space-y-1 text-xs md:text-sm lg:text-base text-textoSecundario">
                      <li>Sale de turnos inmediato.</li>
                      <li>Sin podio ni ganar.</li>
                      <li>Salón de vergüenza.</li>
                      <li>Vaso completo final.</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Cuadro 3: Ganador - ocupa ambas columnas en desktop */}
              <section className="bg-fondo/80 p-2 md:p-3 lg:p-4 rounded-xl border border-neutro md:col-span-2 overflow-hidden">
                <h3 className="font-condensada font-bold uppercase text-xs md:text-sm lg:text-base text-activo mb-1 md:mb-2">
                  8. Ganador
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                  <div>
                    <ul className="list-disc pl-2 md:pl-3 space-y-0.5 md:space-y-1 text-xs md:text-sm lg:text-base text-textoSecundario">
                      <li>Termina al acabar ronda o &lt;2 activos.</li>
                      <li><strong>Gana quien tenga menos puntos</strong>.</li>
                      <li>1 activo = gana ese. Todos fuera = sin ganador.</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm lg:text-base text-textoSecundario mb-0.5 md:mb-1">
                      <strong>Empates:</strong> mini-juego al azar:
                    </p>
                    <ul className="list-disc pl-2 md:pl-3 space-y-0.5 md:space-y-1 text-xs md:text-sm lg:text-base text-textoSecundario">
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

        {/* Pie del modal compacto */}
        <div className="bg-slate-800 px-4 md:px-6 lg:px-8 py-3 md:py-4 flex justify-between items-center border-t border-slate-700 flex-shrink-0">
          <span className="text-xs md:text-sm lg:text-base text-slate-400 font-condensada uppercase hidden sm:inline">
            El menos PEDO - Juego de consumo responsable
          </span>
          <button
            onClick={alCerrar}
            className="w-full sm:w-auto bg-accion hover:bg-accionOscuro text-white font-condensada font-bold px-6 md:px-8 py-2 md:py-2.5 rounded-xl uppercase tracking-wider text-sm md:text-base lg:text-lg border-b-4 border-accionOscuro transition-all cursor-pointer shadow-lg active:translate-y-0.5"
          >
            ENTENDIDO Y REGRESAR
          </button>
        </div>

      </div>
    </div>
  );
}

export default ModalReglas;