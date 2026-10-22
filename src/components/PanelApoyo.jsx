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
    <div className="bg-superficie rounded-lg p-4 h-full flex flex-col">
      <div className="flex border-b border-neutro mb-4">
        <button
          onClick={() => setPestanaActiva('historial')}
          className={`flex-1 py-2 px-4 font-semibold transition-colors ${
            pestanaActiva === 'historial'
              ? 'text-accion border-b-2 border-accion'
              : 'text-textoSecundario hover:text-texto'
          }`}
        >
          {etiquetas.apoyo.historial}
        </button>
        <button
          onClick={() => setPestanaActiva('baseDatos')}
          className={`flex-1 py-2 px-4 font-semibold transition-colors ${
            pestanaActiva === 'baseDatos'
              ? 'text-accion border-b-2 border-accion'
              : 'text-textoSecundario hover:text-texto'
          }`}
        >
          {etiquetas.apoyo.baseDatos}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {pestanaActiva === 'historial' && (
          <div className="space-y-2">
            {historial.length === 0 ? (
              <p className="text-textoSecundario text-center py-4">
                No hay historial aún
              </p>
            ) : (
              historial.map((evento, indice) => (
                <div key={indice} className="bg-fondo rounded p-3 text-sm">
                  <div className="font-semibold text-texto mb-1">
                    Ronda {evento.ronda} - {evento.jugador}
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
              <h4 className="font-semibold text-accion mb-2">
                {etiquetas.apoyo.actividades} ({actividades.length})
              </h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {actividades.map((actividad, i) => (
                  <div key={i} className="bg-fondo rounded p-2 text-xs text-textoSecundario">
                    {actividad.texto} ({actividad.trago_segundos}s)
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-accion mb-2">
                {etiquetas.apoyo.comodines} ({comodines.length})
              </h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {comodines.map((comodin, i) => (
                  <div key={i} className="bg-fondo rounded p-2 text-xs text-textoSecundario">
                    {comodin.texto} ({comodin.efecto})
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-accion mb-2">
                {etiquetas.apoyo.castigos} ({castigos.length})
              </h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {castigos.map((castigo, i) => (
                  <div key={i} className="bg-fondo rounded p-2 text-xs text-textoSecundario">
                    {castigo.texto} ({castigo.duracion_rondas} rondas)
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
