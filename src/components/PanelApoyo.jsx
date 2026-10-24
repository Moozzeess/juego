import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { etiquetas } from '../ui/etiquetas';
import { variantesItemLista, variantesAparicion, NumeroAnimado } from '../ui/animaciones.jsx';

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
      <motion.h2 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center font-condensada font-bold text-texto uppercase text-base md:text-lg mb-2 flex-shrink-0 tracking-wider"
      >
        SOPORTE
      </motion.h2>

      <div className="flex border-b border-neutro mb-2 flex-shrink-0">
        <motion.button
          onClick={() => setPestanaActiva('historial')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex-1 py-1.5 px-3 font-condensada font-semibold text-xs md:text-sm uppercase tracking-wider transition-colors ${
            pestanaActiva === 'historial'
              ? 'text-accion border-b-2 border-accion'
              : 'text-textoSecundario hover:text-texto'
          }`}
        >
          {etiquetas.apoyo.historial}
        </motion.button>
        <motion.button
          onClick={() => setPestanaActiva('baseDatos')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex-1 py-1.5 px-3 font-condensada font-semibold text-xs md:text-sm uppercase tracking-wider transition-colors ${
            pestanaActiva === 'baseDatos'
              ? 'text-accion border-b-2 border-accion'
              : 'text-textoSecundario hover:text-texto'
          }`}
        >
          {etiquetas.apoyo.baseDatos}
        </motion.button>
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        <AnimatePresence mode="wait">
          {pestanaActiva === 'historial' && (
            <motion.div 
              key="historial"
              initial="oculto"
              animate="visible"
              exit={{ opacity: 0, x: -20 }}
              variants={variantesAparicion}
              className="space-y-2"
            >
              {historial.length === 0 ? (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-textoSecundario text-center py-4 font-condensada uppercase"
                >
                  No hay historial aún
                </motion.p>
              ) : (
                historial.map((evento, indice) => (
                  <motion.div 
                    key={indice} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: indice * 0.05 }}
                    className="bg-fondo rounded-lg p-3 text-sm"
                  >
                    <div className="font-condensada font-bold text-texto mb-1 uppercase">
                      RONDA <NumeroAnimado valor={evento.ronda} />: {evento.jugador}
                    </div>
                    <div className="text-textoSecundario">
                      {evento.tipo === 'actividad_cumplida' ? '✓' : '✗'} {evento.actividad}
                    </div>
                    <div className="text-neutro text-xs mt-1">
                      <NumeroAnimado valor={evento.trago_segundos} />s
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {pestanaActiva === 'baseDatos' && (
            <motion.div 
              key="baseDatos"
              initial="oculto"
              animate="visible"
              exit={{ opacity: 0, x: 20 }}
              variants={variantesAparicion}
              className="space-y-4"
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h4 className="font-condensada font-bold text-accion mb-2 uppercase">
                  {etiquetas.apoyo.actividades} (<NumeroAnimado valor={actividades.length} />)
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {actividades.slice(0, 10).map((actividad, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.02 }}
                      whileHover={{ scale: 1.02, backgroundColor: 'rgba(15, 23, 42, 0.8)' }}
                      className="bg-fondo rounded-lg p-2.5 text-xs text-textoSecundario border border-neutro/30 cursor-pointer"
                    >
                      <div className="flex justify-between items-center gap-2 mb-1">
                        <span className="font-condensada font-bold text-texto uppercase text-sm">
                          {actividad.texto}
                        </span>
                        <span className="font-condensada font-bold text-peligro whitespace-nowrap">
                          <NumeroAnimado valor={actividad.trago_segundos} />s
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
                    </motion.div>
                  ))}
                  {actividades.length > 10 && (
                    <p className="text-textoSecundario text-center text-xs">
                      ... y {actividades.length - 10} más
                    </p>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h4 className="font-condensada font-bold text-accion mb-2 uppercase">
                  {etiquetas.apoyo.comodines} (<NumeroAnimado valor={comodines.length} />)
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {comodines.slice(0, 10).map((comodin, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.02 }}
                      whileHover={{ scale: 1.02, backgroundColor: 'rgba(15, 23, 42, 0.8)' }}
                      className="bg-fondo rounded-lg p-2.5 text-xs text-textoSecundario border border-neutro/30 cursor-pointer"
                    >
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
                    </motion.div>
                  ))}
                  {comodines.length > 10 && (
                    <p className="text-textoSecundario text-center text-xs">
                      ... y {comodines.length - 10} más
                    </p>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h4 className="font-condensada font-bold text-accion mb-2 uppercase">
                  {etiquetas.apoyo.castigos} (<NumeroAnimado valor={castigos.length} />)
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {castigos.slice(0, 10).map((castigo, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.02 }}
                      whileHover={{ scale: 1.02, backgroundColor: 'rgba(15, 23, 42, 0.8)' }}
                      className="bg-fondo rounded-lg p-2.5 text-xs text-textoSecundario border border-neutro/30 cursor-pointer"
                    >
                      <div className="flex justify-between items-center gap-2 mb-1">
                        <span className="font-condensada font-bold text-texto uppercase text-sm">
                          {castigo.nombre || castigo.texto}
                        </span>
                        <span className="inline-block text-[10px] font-condensada uppercase px-1.5 py-0.5 bg-peligro/20 text-peligro rounded font-bold">
                          <NumeroAnimado valor={castigo.duracion_rondas} /> {castigo.duracion_rondas === 1 ? 'ronda' : 'rondas'}
                        </span>
                      </div>
                      {castigo.nombre && castigo.texto !== castigo.nombre && (
                        <p className="text-slate-300 font-sans text-[11px] leading-snug">
                          {castigo.texto}
                        </p>
                      )}
                    </motion.div>
                  ))}
                  {castigos.length > 10 && (
                    <p className="text-textoSecundario text-center text-xs">
                      ... y {castigos.length - 10} más
                    </p>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default PanelApoyo;
