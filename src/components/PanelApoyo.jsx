import { useState } from 'react';
import { etiquetas } from '../ui/etiquetas';

/**
 * Componente del panel de apoyo.
 * Muestra pestañas con el historial cronológico y la consulta de las bases de datos.
 * 
 * @param {Object} estado - Estado actual de la partida.
 */
function PanelApoyo({ estado }) {
  const [pestanaActiva, setPestanaActiva] = useState('historial');

  const { historial } = estado.estado_partida;
  const { actividades, comodines, castigos } = estado.datos;

  return (
    <div className="bg-superficie rounded-2xl p-3 h-full flex flex-col border border-neutro overflow-hidden">
      <h2 className="text-center font-condensada font-bold text-texto uppercase text-base md:text-lg mb-2 flex-shrink-0 tracking-wider">
        SOPORTE
      </h2>

      <div className="flex border-b border-neutro mb-2 flex-shrink-0">
        <button
          onClick={() => setPestanaActiva('historial')}
          className={`flex-1 py-1.5 px-3 font-condensada font-semibold text-xs md:text-sm uppercase tracking-wider transition-colors ${
            pestanaActiva === 'historial'
              ? 'text-accion border-b-2 border-accion'
              : 'text-textoSecundario hover:text-texto'
          }`}
        >
          {etiquetas.apoyo.historial}
        </button>
        <button
          onClick={() => setPestanaActiva('baseDatos')}
          className={`flex-1 py-1.5 px-3 font-condensada font-semibold text-xs md:text-sm uppercase tracking-wider transition-colors ${
            pestanaActiva === 'baseDatos'
              ? 'text-accion border-b-2 border-accion'
              : 'text-textoSecundario hover:text-texto'
          }`}
        >
          {etiquetas.apoyo.baseDatos}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        {pestanaActiva === 'historial' && (
          <div className="space-y-2">
            {historial.length === 0 ? (
              <p className="text-textoSecundario text-center py-4 font-condensada uppercase">
                No hay historial aún
              </p>
            ) : (
              historial.map((evento, indice) => (
                <div key={indice} className="bg-fondo rounded-lg p-3 text-sm">
                  <div className="font-condensada font-bold text-texto mb-1 uppercase">
                    RONDA {evento.ronda}: {evento.jugador}
                  </div>
                  <div className="text-textoSecundario">
                    {evento.tipo === 'actividad_cumplida' ? '✓' : '✗'} {evento.actividad}
                  </div>
                  <div className="text-neutro text-xs mt-1">
                    {evento.trago_segundos}s
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {pestanaActiva === 'baseDatos' && (
          <div className="space-y-4">
            <div>
              <h4 className="font-condensada font-bold text-accion mb-2 uppercase">
                {etiquetas.apoyo.actividades} ({actividades.length})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {actividades.map((actividad, i) => (
                  <div key={i} className="bg-fondo rounded-lg p-2.5 text-xs text-textoSecundario border border-neutro/30">
                    <div className="flex justify-between items-center gap-2 mb-1">
                      <span className="font-condensada font-bold text-texto uppercase text-sm">
                        {actividad.texto}
                      </span>
                      <span className="font-condensada font-bold text-peligro whitespace-nowrap">
                        {actividad.trago_segundos}s
                      </span>
                    </div>
                    {actividad.categoria && (
                      <span className="inline-block text-[10px] font-condensada uppercase px-1.5 py-0.5 bg-morado/20 text-morado rounded mb-1">
                        {actividad.categoria}
                      </span>
                    )}
                    {actividad.descripcion && (
                      <p className="text-slate-300 font-sans text-[11px] leading-snug">
                        {actividad.descripcion}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-condensada font-bold text-accion mb-2 uppercase">
                {etiquetas.apoyo.comodines} ({comodines.length})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {comodines.map((comodin, i) => (
                  <div key={i} className="bg-fondo rounded-lg p-2.5 text-xs text-textoSecundario border border-neutro/30">
                    <div className="flex justify-between items-center gap-2 mb-1">
                      <span className="font-condensada font-bold text-texto uppercase text-sm">
                        {comodin.nombre || comodin.texto}
                      </span>
                      <span className="inline-block text-[10px] font-condensada uppercase px-1.5 py-0.5 bg-accion/20 text-accion rounded font-bold">
                        {comodin.efecto}
                      </span>
                    </div>
                    {comodin.nombre && comodin.texto !== comodin.nombre && (
                      <p className="text-slate-300 font-sans text-[11px] leading-snug">
                        {comodin.texto}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-condensada font-bold text-accion mb-2 uppercase">
                {etiquetas.apoyo.castigos} ({castigos.length})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {castigos.map((castigo, i) => (
                  <div key={i} className="bg-fondo rounded-lg p-2.5 text-xs text-textoSecundario border border-neutro/30">
                    <div className="flex justify-between items-center gap-2 mb-1">
                      <span className="font-condensada font-bold text-texto uppercase text-sm">
                        {castigo.nombre || castigo.texto}
                      </span>
                      <span className="inline-block text-[10px] font-condensada uppercase px-1.5 py-0.5 bg-peligro/20 text-peligro rounded font-bold">
                        {castigo.duracion_rondas} {castigo.duracion_rondas === 1 ? 'ronda' : 'rondas'}
                      </span>
                    </div>
                    {castigo.nombre && castigo.texto !== castigo.nombre && (
                      <p className="text-slate-300 font-sans text-[11px] leading-snug">
                        {castigo.texto}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PanelApoyo;
