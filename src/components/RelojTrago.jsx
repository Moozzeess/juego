import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { etiquetas } from '../ui/etiquetas';
import { variantesReloj, NumeroAnimado } from '../ui/animaciones.jsx';

/**
 * Componente del reloj de trago.
 * Muestra una cuenta regresiva visual de trago_segundos hasta 0.
 * Al finalizar, despacha una accion para pasar a la fase de confirmacion del juez.
 * 
 * @param {number} segundos - Segundos a contar.
 * @param {boolean} activo - Indica si el reloj está activo.
 * @param {Function} dispatch - Funcion para despachar acciones al reducer.
 */
function RelojTrago({ segundos, activo, dispatch }) {
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
          // Al llegar a 0, despachar accion para pasar a confirmacion
          dispatch({
            tipo: 'FINALIZAR_RELOJ'
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalo);
  }, [activo, tiempoRestante, dispatch]);

  if (!activo) return null;

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={tiempoRestante}
          initial="tic"
          animate="tac"
          variants={variantesReloj}
          className="text-8xl font-bold text-accion mb-2"
        >
          <NumeroAnimado valor={tiempoRestante} />
        </motion.div>
      </AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-textoSecundario text-lg"
      >
        {etiquetas.juego.segundos}
      </motion.div>
    </div>
  );
}

export default RelojTrago;
