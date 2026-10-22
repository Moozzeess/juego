import { useState, useEffect } from 'react';
import { etiquetas } from '../ui/etiquetas';

/**
 * Componente del reloj de trago.
 * Muestra una cuenta regresiva visual de trago_segundos hasta 0.
 * Es solo un indicador visual, no afecta el puntaje ni bloquea acciones.
 * 
 * @param {number} segundos - Segundos a contar.
 * @param {boolean} activo - Indica si el reloj está activo.
 */
function RelojTrago({ segundos, activo }) {
  const [tiempoRestante, setTiempoRestante] = useState(segundos);

  useEffect(() => {
    setTiempoRestante(segundos);
  }, [segundos]);

  useEffect(() => {
    if (!activo || tiempoRestante <= 0) return;

    const intervalo = setInterval(() => {
      setTiempoRestante(prev => {
        if (prev <= 1) {
          clearInterval(intervalo);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalo);
  }, [activo, tiempoRestante]);

  if (!activo) return null;

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="text-8xl font-bold text-accion mb-2">
        {tiempoRestante}
      </div>
      <div className="text-textoSecundario text-lg">
        {etiquetas.juego.segundos}
      </div>
    </div>
  );
}

export default RelojTrago;
