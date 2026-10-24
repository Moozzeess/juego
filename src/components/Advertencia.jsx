import { etiquetas } from '../ui/etiquetas';

/**
 * Componente de advertencia +18.
 * Muestra una pantalla bloqueante que debe aceptarse para continuar.
 * 
 * @param {Function} dispatch - Función para despachar acciones al reducer.
 */
function Advertencia({ dispatch }) {
  const manejarAceptar = () => {
    dispatch({ tipo: 'ACEPTAR_ADVERTENCIA' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-fondo p-4">
      <div className="max-w-md w-full panel-cristal rounded-lg p-8 shadow-xl border-2 border-peligro">
        <h1 className="text-3xl font-bold text-peligro text-center mb-6">
          {etiquetas.advertencia.titulo}
        </h1>
        <p className="text-textoSecundario text-center mb-8 leading-relaxed">
          {etiquetas.advertencia.mensaje}
        </p>
        <button
          onClick={manejarAceptar}
          className="w-full bg-peligro hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 uppercase tracking-wider"
        >
          {etiquetas.advertencia.botonAceptar}
        </button>
      </div>
    </div>
  );
}

export default Advertencia;
