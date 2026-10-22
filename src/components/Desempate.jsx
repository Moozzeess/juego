import { useState, useEffect } from 'react';
import { etiquetas } from '../ui/etiquetas';

/**
 * Componente de mini-juegos de desempate.
 * Muestra una vista superpuesta con el mini-juego activo.
 * 
 * @param {Object} estado - Estado actual de la partida.
 * @param {Function} dispatch - Función para despachar acciones al reducer.
 */
function Desempate({ estado, dispatch }) {
  const { desempate } = estado.estado_partida;
  const [cronometroActivo, setCronometroActivo] = useState(false);
  const [tiempoInicio, setTiempoInicio] = useState(0);
  const [tiempoFinal, setTiempoFinal] = useState(0);
  const [resultado, setResultado] = useState(null);
  const [numeroObjetivo, setNumeroObjetivo] = useState(0);
  const [ruletaGirando, setRuletaGirando] = useState(false);
  const [numeroRuleta, setNumeroRuleta] = useState(0);

  const miniJuegos = [
    { id: 'cronometro5', nombre: etiquetas.desempate.cronometro5, objetivo: 5000 },
    { id: 'ruleta', nombre: etiquetas.desempate.ruleta, objetivo: 50 },
    { id: 'contar10', nombre: etiquetas.desempate.contar10, objetivo: 10000 }
  ];

  const miniJuegoActual = miniJuegos.find(m => m.id === desempate.minijuego) || miniJuegos[0];

  useEffect(() => {
    if (miniJuegoActual.id === 'ruleta') {
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

  const registrarResultado = () => {
    const nuevosResultados = [
      ...desempate.resultados,
      {
        jugador: desempate.participantes[desempate.resultados.length],
        resultado: resultado,
        diferencia: Math.abs(resultado - miniJuegoActual.objetivo)
      }
    ];

    dispatch({
      tipo: 'REGISTRAR_RESULTADO_DESEMPATE',
      resultados: nuevosResultados
    });

    if (nuevosResultados.length === desempate.participantes.length) {
      if (desempate.intento < 3) {
        const siguienteMiniJuego = miniJuegos[Math.floor(Math.random() * miniJuegos.length)];
        dispatch({
          tipo: 'SIGUIENTE_INTENTO_DESEMPATE',
          minijuego: siguienteMiniJuego.id
        });
      } else {
        dispatch({
          tipo: 'FINALIZAR_DESEMPATE',
          resultadoFinal: {
            ganadores: desempate.participantes,
            esEmpate: true
          }
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-fondo bg-opacity-95 flex items-center justify-center p-4 z-50">
      <div className="bg-superficie rounded-lg p-8 max-w-2xl w-full">
        <h2 className="text-3xl font-bold text-center mb-4">
          {etiquetas.desempate.titulo}
        </h2>
        <p className="text-center text-textoSecundario mb-6">
          {etiquetas.desempate.intento} {desempate.intento} {etiquetas.desempate.de} 3
        </p>

        <div className="bg-fondo rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold text-center mb-4">
            {miniJuegoActual.nombre}
          </h3>

          {miniJuegoActual.id === 'cronometro5' && (
            <div className="text-center">
              <p className="text-textoSecundario mb-4">
                {etiquetas.desempate.objetivo}: 5.000s
              </p>
              {!cronometroActivo && resultado === null && (
                <button
                  onClick={manejarInicioCronometro}
                  className="bg-accion hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg"
                >
                  {etiquetas.desempate.iniciar}
                </button>
              )}
              {cronometroActivo && (
                <button
                  onClick={manejarDetenerCronometro}
                  className="bg-peligro hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg"
                >
                  {etiquetas.desempate.detener}
                </button>
              )}
              {resultado !== null && (
                <div className="mt-4">
                  <p className="text-2xl font-bold text-accion">
                    {resultado.toFixed(0)}ms
                  </p>
                  <p className="text-textoSecundario">
                    {etiquetas.desempate.diferencia}: {Math.abs(resultado - miniJuegoActual.objetivo).toFixed(0)}ms
                  </p>
                </div>
              )}
            </div>
          )}

          {miniJuegoActual.id === 'ruleta' && (
            <div className="text-center">
              <p className="text-textoSecundario mb-4">
                {etiquetas.desempate.objetivo}: {numeroObjetivo}
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
                    {etiquetas.desempate.diferencia}: {Math.abs(resultado - numeroObjetivo)}
                  </p>
                </div>
              )}
            </div>
          )}

          {miniJuegoActual.id === 'contar10' && (
            <div className="text-center">
              <p className="text-textoSecundario mb-4">
                {etiquetas.desempate.objetivo}: 10.000s
              </p>
              {!cronometroActivo && resultado === null && (
                <button
                  onClick={manejarInicioCronometro}
                  className="bg-accion hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg"
                >
                  {etiquetas.desempate.iniciar}
                </button>
              )}
              {cronometroActivo && (
                <button
                  onClick={manejarDetenerCronometro}
                  className="bg-peligro hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg"
                >
                  {etiquetas.desempate.detener}
                </button>
              )}
              {resultado !== null && (
                <div className="mt-4">
                  <p className="text-2xl font-bold text-accion">
                    {resultado.toFixed(0)}ms
                  </p>
                  <p className="text-textoSecundario">
                    {etiquetas.desempate.diferencia}: {Math.abs(resultado - miniJuegoActual.objetivo).toFixed(0)}ms
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {resultado !== null && desempate.resultados.length < desempate.participantes.length && (
          <button
            onClick={registrarResultado}
            className="w-full bg-activo hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg"
          >
            Registrar resultado
          </button>
        )}

        <div className="mt-6">
          <h4 className="font-semibold mb-2">Resultados:</h4>
          {desempate.resultados.map((r, i) => (
            <div key={i} className="bg-fondo rounded p-2 mb-2 text-sm">
              <span className="font-semibold">{r.jugador}</span>: {r.resultado.toFixed(0)} 
              (diferencia: {r.diferencia.toFixed(0)})
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Desempate;
