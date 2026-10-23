/**
 * Componente modal para consultar las reglas completas de «EL MENOS HIDRATADO».
 * Diseño adaptado a pantalla completa sin scroll vertical:
 * Organizado en una cuadrícula compacta de 2x2 que aprovecha todo el espacio disponible.
 *
 * @param {boolean} abierto - Indica si el modal está visible.
 * @param {Function} alCerrar - Función callback para cerrar el modal.
 */
function ModalReglas({ abierto, alCerrar }) {
  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-black/90 backdrop-blur-md overflow-hidden">
      <div className="bg-superficie border border-slate-700/80 rounded-2xl w-full h-full max-w-[96vw] max-h-[96vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Cabecera del modal compacta y de alto impacto */}
        <div className="bg-slate-800 px-6 py-3 flex items-center justify-between border-b border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-full bg-accion/20 text-accion flex items-center justify-center font-bold text-xl border border-accion/40">
              ?
            </span>
            <div>
              <h2 className="text-xl md:text-3xl font-condensada font-bold uppercase text-texto tracking-wider leading-none">
                REGLAS DEL JUEGO
              </h2>
              <span className="text-xs md:text-sm text-textoSecundario font-sans">
                «EL MENOS HIDRATADO» - Guía completa de juego
              </span>
            </div>
          </div>
          <button
            onClick={alCerrar}
            className="w-10 h-10 rounded-full bg-slate-700/60 hover:bg-slate-700 text-slate-200 hover:text-white flex items-center justify-center transition-colors text-xl font-bold cursor-pointer border border-slate-600"
            aria-label="Cerrar modal de reglas"
          >
            ✕
          </button>
        </div>

        {/* Contenido en cuadrícula 2x2 sin scroll (distribución completa) */}
        <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 grid-rows-2 gap-4 flex-1 overflow-hidden font-sans">
          
          {/* Bloque 1: Objetivo y Consumo Responsable */}
          <section className="bg-fondo/80 p-4 md:p-5 rounded-xl border border-slate-700/60 flex flex-col justify-between overflow-hidden">
            <div>
              <h3 className="font-condensada font-bold uppercase text-lg md:text-2xl text-activo flex items-center gap-2 mb-2">
                <span>01.</span> Objetivo y Consumo Responsable
              </h3>
              <p className="text-xs md:text-sm lg:text-base text-slate-200 leading-snug">
                El objetivo es acumular la <strong>menor cantidad de líquido</strong> (medido en segundos). Quien termine con menos segundos es el ganador.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-700/50">
              <div className="p-2.5 bg-slate-800/80 rounded-lg">
                <span className="font-condensada font-bold uppercase text-xs text-activo block">
                  Bebidas libres
                </span>
                <span className="text-[11px] md:text-xs text-slate-300 leading-tight block">
                  Cualquier líquido (agua, jugo o refresco).
                </span>
              </div>
              <div className="p-2.5 bg-slate-800/80 rounded-lg">
                <span className="font-condensada font-bold uppercase text-xs text-activo block">
                  Retirarme
                </span>
                <span className="text-[11px] md:text-xs text-slate-300 leading-tight block">
                  Cualquiera puede retirarse sin penalización.
                </span>
              </div>
            </div>
          </section>

          {/* Bloque 2: Dinámica del Turno */}
          <section className="bg-fondo/80 p-4 md:p-5 rounded-xl border border-slate-700/60 flex flex-col justify-between overflow-hidden">
            <div>
              <h3 className="font-condensada font-bold uppercase text-lg md:text-2xl text-accion flex items-center gap-2 mb-1">
                <span>02.</span> Dinámica del Turno (Orden J1...JN)
              </h3>
              <p className="text-xs md:text-sm lg:text-base text-slate-200 leading-snug mb-2">
                El jugador activo recibe un reto y elige obligatoriamente una de 3 opciones:
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-800/90 p-2 rounded-lg border-t-2 border-activo text-center">
                <span className="font-condensada font-bold uppercase text-xs text-activo block mb-0.5">
                  Aceptar Reto
                </span>
                <span className="text-[10px] md:text-xs text-slate-300 leading-tight block">
                  Cumple con el reloj. El juez confirma si cumplió o no.
                </span>
              </div>

              <div className="bg-slate-800/90 p-2 rounded-lg border-t-2 border-accion text-center">
                <span className="font-condensada font-bold uppercase text-xs text-accion block mb-0.5">
                  Usar Comodín
                </span>
                <span className="text-[10px] md:text-xs text-slate-300 leading-tight block">
                  Gira en 3D: Salvarse (0s) o Cambiar por otro reto.
                </span>
              </div>

              <div className="bg-slate-800/90 p-2 rounded-lg border-t-2 border-peligro text-center">
                <span className="font-condensada font-bold uppercase text-xs text-peligro block mb-0.5">
                  Negarse
                </span>
                <span className="text-[10px] md:text-xs text-slate-300 leading-tight block">
                  Suma segundos igual, 1 punto negativo y 1 castigo.
                </span>
              </div>
            </div>
          </section>

          {/* Bloque 3: Comodines y Castigos Activos */}
          <section className="bg-fondo/80 p-4 md:p-5 rounded-xl border border-slate-700/60 flex flex-col justify-between overflow-hidden">
            <div>
              <h3 className="font-condensada font-bold uppercase text-lg md:text-2xl text-amber-400 flex items-center gap-2 mb-2">
                <span>03.</span> Comodines y Castigos
              </h3>
              <p className="text-xs md:text-sm lg:text-base text-slate-200 leading-snug">
                Gestión de recursos especiales y penalizaciones activas durante la partida:
              </p>
            </div>

            <div className="space-y-2 mt-2">
              <div className="p-2 bg-slate-800/70 rounded-lg flex items-center justify-between">
                <div>
                  <span className="font-condensada font-bold uppercase text-xs text-amber-300 block">
                    2 Comodines iniciales por jugador
                  </span>
                  <span className="text-[11px] md:text-xs text-slate-300">
                    Al llegar a 0 se deshabilita al 50% de opacidad.
                  </span>
                </div>
              </div>

              <div className="p-2 bg-slate-800/70 rounded-lg flex items-center justify-between">
                <div>
                  <span className="font-condensada font-bold uppercase text-xs text-amber-300 block">
                    Contador de rondas de castigos
                  </span>
                  <span className="text-[11px] md:text-xs text-slate-300">
                    Disminuye en 1 al cerrar cada ronda hasta quedar liberado.
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Bloque 4: Descalificación y Cierre */}
          <section className="bg-fondo/80 p-4 md:p-5 rounded-xl border border-slate-700/60 flex flex-col justify-between overflow-hidden">
            <div>
              <h3 className="font-condensada font-bold uppercase text-lg md:text-2xl text-peligro flex items-center gap-2 mb-2">
                <span>04.</span> Descalificación y Reto Final
              </h3>
              <p className="text-xs md:text-sm lg:text-base text-slate-200 leading-snug">
                Condiciones de expulsión y ceremonia de cierre:
              </p>
            </div>

            <ul className="list-disc pl-4 space-y-1.5 text-[11px] md:text-xs lg:text-sm text-slate-300">
              <li>
                <strong>Negarse a un castigo:</strong> Pulsar <em>«Se negó a cumplirlo»</em> descalifica al jugador de inmediato.
              </li>
              <li>
                <strong>Cero actividades cumplidas:</strong> Descalifica al jugador al momento de cerrar la partida.
              </li>
              <li>
                <strong>Reto del Vaso Completo:</strong> Beben un vaso lleno quienes tengan puntos negativos o hayan sido descalificados.
              </li>
            </ul>
          </section>

        </div>

        {/* Pie del modal compacto */}
        <div className="bg-slate-800 px-6 py-3 flex justify-between items-center border-t border-slate-700 flex-shrink-0">
          <span className="text-xs text-slate-400 font-condensada uppercase hidden sm:inline">
            El menos hidratado - Juego de consumo responsable
          </span>
          <button
            onClick={alCerrar}
            className="w-full sm:w-auto bg-accion hover:bg-accionOscuro text-white font-condensada font-bold px-8 py-2.5 rounded-xl uppercase tracking-wider text-base md:text-lg border-b-4 border-accionOscuro transition-all cursor-pointer shadow-lg active:translate-y-0.5"
          >
            ENTENDIDO Y REGRESAR
          </button>
        </div>

      </div>
    </div>
  );
}

export default ModalReglas;