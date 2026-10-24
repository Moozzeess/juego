/**
 * Sistema de animaciones reutilizables usando framer-motion.
 * Define variantes y transiciones consistentes para toda la aplicación.
 *
 * @module animaciones
 */

import { motion } from 'framer-motion';

/**
 * Variantes para animación de entrada de tarjeta (flip card).
 * Simula el efecto de voltear una carta.
 */
export const variantesTarjeta = {
  oculto: {
    rotateY: -90,
    opacity: 0,
    scale: 0.8
  },
  visible: {
    rotateY: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  salir: {
    rotateY: 90,
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

/**
 * Variantes para animación de aparición suave (fade in).
 */
export const variantesAparicion = {
  oculto: {
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut'
    }
  }
};

/**
 * Variantes para animación de deslizamiento (slide in).
 */
export const variantesDeslizamiento = {
  oculto: {
    x: -50,
    opacity: 0
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

/**
 * Variantes para animación de escala (scale).
 */
export const variantesEscala = {
  oculto: {
    scale: 0,
    opacity: 0
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  }
};

/**
 * Variantes para animación de pulso (pulse).
 */
export const variantesPulso = {
  reposo: {
    scale: 1
  },
  activo: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

/**
 * Variantes para animación de rebote (bounce).
 */
export const variantesRebote = {
  oculto: {
    y: -100,
    opacity: 0
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20
    }
  }
};

/**
 * Variantes para animación de giro (spin).
 */
export const variantesGiro = {
  oculto: {
    rotate: -180,
    opacity: 0
  },
  visible: {
    rotate: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

/**
 * Variantes para animación de temblor (shake).
 */
export const variantesTemblor = {
  reposo: {
    x: 0
  },
  temblor: {
    x: [0, -10, 10, -10, 10, 0],
    transition: {
      duration: 0.5
    }
  }
};

/**
 * Variantes para animación de contador (count up).
 */
export const variantesContador = {
  oculto: {
    scale: 0.5,
    opacity: 0
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: 'easeOut'
    }
  }
};

/**
 * Componente de tarjeta animada.
 * Envuelve contenido con animación de flip card.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {React.ReactNode} props.children - Contenido de la tarjeta.
 * @param {boolean} props.activo - Indica si la tarjeta está activa.
 * @param {string} props.className - Clases CSS adicionales.
 */
export function TarjetaAnimada({ children, activo = true, className = '' }) {
  return (
    <motion.div
      initial="oculto"
      animate={activo ? 'visible' : 'oculto'}
      exit="salir"
      variants={variantesTarjeta}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Componente de contenedor with animación de aparición.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {React.ReactNode} props.children - Contenido del contenedor.
 * @param {number} props.retraso - Retraso en segundos antes de la animación.
 * @param {string} props.className - Clases CSS adicionales.
 */
export function ContenedorAparicion({ children, retraso = 0, className = '' }) {
  return (
    <motion.div
      initial="oculto"
      animate="visible"
      variants={variantesAparicion}
      transition={{ delay: retraso }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Componente de icono animado con pulso.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {React.ReactNode} props.children - Icono a animar.
 * @param {boolean} props.animar - Indica si debe animarse.
 * @param {string} props.className - Clases CSS adicionales.
 */
export function IconoAnimado({ children, animar = false, className = '' }) {
  return (
    <motion.div
      animate={animar ? 'activo' : 'reposo'}
      variants={variantesPulso}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Componente de número animado (contador).
 *
 * @param {Object} props - Propiedades del componente.
 * @param {number} props.valor - Valor a mostrar.
 * @param {string} props.className - Clases CSS adicionales.
 */
export function NumeroAnimado({ valor, className = '' }) {
  return (
    <motion.span
      key={valor}
      initial="oculto"
      animate="visible"
      variants={variantesContador}
      className={className}
    >
      {valor}
    </motion.span>
  );
}

/**
 * Variantes para animación de lista (stagger).
 */
export const variantesLista = {
  oculto: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

/**
 * Variantes para items de lista.
 */
export const variantesItemLista = {
  oculto: {
    opacity: 0,
    x: -20
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3
    }
  }
};

/**
 * Variantes para animación de cambio de turno.
 */
export const variantesCambioTurno = {
  entrada: {
    scale: 0.8,
    opacity: 0,
    rotateY: -90
  },
  activo: {
    scale: 1,
    opacity: 1,
    rotateY: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  salida: {
    scale: 0.8,
    opacity: 0,
    rotateY: 90,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

/**
 * Variantes para animación de comodín revelado.
 */
export const variantesComodin = {
  oculto: {
    rotateY: -180,
    scale: 0.5,
    opacity: 0
  },
  revelado: {
    rotateY: 0,
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

/**
 * Variantes para animación de castigo recibido.
 */
export const variantesCastigo = {
  oculto: {
    scale: 0,
    rotate: -45,
    opacity: 0
  },
  visible: {
    scale: 1,
    rotate: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 15
    }
  }
};

/**
 * Variantes para animación de reloj/cuenta regresива.
 */
export const variantesReloj = {
  tic: {
    scale: 1,
    opacity: 1
  },
  tac: {
    scale: 1.1,
    opacity: 0.8,
    transition: {
      duration: 0.1
    }
  }
};

/**
 * Variantes para animación de jugador activo.
 */
export const variantesJugadorActivo = {
  inactivo: {
    scale: 1,
    borderColor: 'rgba(148, 163, 184, 0.5)',
    boxShadow: '0 0 0 rgba(16, 185, 129, 0)'
  },
  activo: {
    scale: 1.02,
    borderColor: 'rgba(16, 185, 129, 1)',
    boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  },
  descalificado: {
    scale: 0.95,
    opacity: 0.6,
    borderColor: 'rgba(239, 68, 68, 0.5)',
    boxShadow: '0 0 0 rgba(239, 68, 68, 0)',
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  },
  visible: {
    scale: 1,
    opacity: 1,
    borderColor: 'rgba(148, 163, 184, 0.5)',
    boxShadow: '0 0 0 rgba(16, 185, 129, 0)',
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  }
};

/**
 * Variantes para animación de descalificación.
 */
export const variantesDescalificacion = {
  normal: {
    opacity: 1,
    scale: 1
  },
  descalificado: {
    opacity: 0.5,
    scale: 0.95,
    filter: 'grayscale(100%)',
    transition: {
      duration: 0.5
    }
  }
};

export default {
  variantesTarjeta,
  variantesAparicion,
  variantesDeslizamiento,
  variantesEscala,
  variantesPulso,
  variantesRebote,
  variantesGiro,
  variantesTemblor,
  variantesContador,
  TarjetaAnimada,
  ContenedorAparicion,
  IconoAnimado,
  NumeroAnimado,
  variantesLista,
  variantesItemLista,
  variantesCambioTurno,
  variantesComodin,
  variantesCastigo,
  variantesReloj,
  variantesJugadorActivo,
  variantesDescalificacion
};
