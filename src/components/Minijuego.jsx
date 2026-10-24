import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * Componente de mini-juegos para actividades.
 * Muestra una vista superpuesta con el mini-juego activo durante una actividad.
 * 
 * @param {Object} actividad - Actividad actual que contiene el tipo de minijuego.
 * @param {Function} onCompletar - Función callback cuando se completa el minijuego con el resultado.
 * @param {Function} onCancelar - Función callback para cancelar el minijuego.
 */
function Minijuego({ actividad, onCompletar, onCancelar }) {
  const [cronometroActivo, setCronometroActivo] = useState(false);
  const [tiempoInicio, setTiempoInicio] = useState(0);
  const [tiempoFinal, setTiempoFinal] = useState(0);
  const [resultado, setResultado] = useState(null);
  const [numeroObjetivo, setNumeroObjetivo] = useState(0);
  const [ruletaGirando, setRuletaGirando] = useState(false);
  const [numeroRuleta, setNumeroRuleta] = useState(0);

  const miniJuegos = [
    { id: 'cronometro5', nombre: 'Cronómetro en 5 segundos exactos', objetivo: 5000 },
    { id: 'ruleta', nombre: 'Ruleta con número indicado', objetivo: 50 },
    { id: 'contar10', nombre: 'Contar 10 segundos mentalmente', objetivo: 10000 }
  ];

  const tipoMinijuego = actividad?.minijuego || null;
  const miniJuegoActual = miniJuegos.find(m => m.id === tipoMinijuego);

  useEffect(() => {
    if (miniJuegoActual?.id === 'ruleta') {
      setNumeroObjetivo(Math.floor(Math.random() * 100));
    }
  }, [miniJuegoActual]);

  const manejarInicioCronometro = () => {
    setCronometroActivo(true);
    setTiempoInicio(Date.now());
    setResultado(null);
  };

  const manejarDetenerCronometro = () => {
    setCronometroActivo(false);
    const tiempo = Date.now() - tiempoInicio;
    setTiempoFinal(tiempo);
    setResultado(tiempo);
  };

  const manejarGiroRuleta = () => {
    setRuletaGirando(true);
    let giros = 0;
    const maxGiros = 50;
    
    const intervalo = setInterval(() => {
      setNumeroRuleta(Math.floor(Math.random() * 100));
      giros++;
      
      if (giros >= maxGiros) {
        clearInterval(intervalo);
        setRuletaGirando(false);
        setResultado(numeroRuleta);
      }
    }, 50);
  };

  const manejarCompletar = () => {
    if (resultado !== null) {
      onCompletar(resultado);
    }
  };

  if (!miniJuegoActual) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-fondo bg-opacity-95 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-superficie rounded-lg p-8 max-w-2xl w-full"
      >
        <h2 className="text-3xl font-bold text-center mb-4">
          Mini-juego de la actividad
        </h2>

        <div className="bg-fondo rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold text-center mb-4">
            {miniJuegoActual.nombre}
          </h3>

          {miniJuegoActual.id === 'cronometro5' && (
            <div className="text-center">
              <p className="text-textoSecundario mb-4">
                Objetivo: 5.000s
              </p>
              {!cronometroActivo && resultado === null && (
                <button
                  onClick={manejarInicioCronometro}
                  className="bg-accion hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg"
                >
                  Iniciar
                </button>
              )}
              {cronometroActivo && (
                <button
                  onClick={manejarDetenerCronometro}
                  className="bg-peligro hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg"
                >
                  Detener
                </button>
              )}
              {resultado !== null && (
                <div className="mt-4">
                  <p className="text-2xl font-bold text-accion">
                    {resultado.toFixed(0)}ms
                  </p>
                  <p className="text-textoSecundario">
                    Diferencia: {Math.abs(resultado - miniJuegoActual.objetivo).toFixed(0)}ms
                  </p>
                </div>
              )}
            </div>
          )}

          {miniJuegoActual.id === 'ruleta' && (
            <div className="text-center">
              <p className="text-textoSecundario mb-4">
                Objetivo: {numeroObjetivo}
              </p>
              <div className="text-6xl font-bold text-accion mb-4">
                {ruletaGirando ? numeroRuleta : (resultado !== null ? resultado : '-')}
              </div>
              {!ruletaGirando && resultado === null && (
                <button
                  onClick={manejarGiroRuleta}
                  className="bg-accion hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg"
                >
                  Girar ruleta
                </button>
              )}
              {resultado !== null && (
                <div className="mt-4">
                  <p className="text-textoSecundario">
                    Diferencia: {Math.abs(resultado - numeroObjetivo)}
                  </p>
                </div>
              )}
            </div>
          )}

          {miniJuegoActual.id === 'contar10' && (
            <div className="text-center">
              <p className="text-textoSecundario mb-4">
                Objetivo: 10.000s
              </p>
              {!cronometroActivo && resultado === null && (
                <button
                  onClick={manejarInicioCronometro}
                  className="bg-accion hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg"
                >
                  Iniciar
                </button>
              )}
              {cronometroActivo && (
                <button
                  onClick={manejarDetenerCronometro}
                  className="bg-peligro hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg"
                >
                  Detener
                </button>
              )}
              {resultado !== null && (
                <div className="mt-4">
                  <p className="text-2xl font-bold text-accion">
                    {resultado.toFixed(0)}ms
                  </p>
                  <p className="text-textoSecundario">
                    Diferencia: {Math.abs(resultado - miniJuegoActual.objetivo).toFixed(0)}ms
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-4">
          {resultado !== null && (
            <button
              onClick={manejarCompletar}
              className="flex-1 bg-activo hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg"
            >
              Completar minijuego
            </button>
          )}
          <button
            onClick={onCancelar}
            className="flex-1 bg-neutro hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg"
          >
            Cancelar
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default Minijuego;
