/**
 * Burlas para la sección de ridiculización del cierre.
 * Texto en tono de juego, sin atacar a la persona.
 */

export const burlas = [
  "¡Al menos intentaste! (o quizás no)",
  "La próxima vez bebe agua, es más seguro",
  "El alcohol no es tu mejor amigo hoy",
  "Has demostrado una resistencia... cuestionable",
  "Tu hígado envía saludos (y quejas)",
  "La vida es como una caja de bombones... tú te comiste todas",
  "Nadie dijo que fuera fácil, pero tú lo hiciste difícil",
  "Tu técnica de beber es... única",
  "Has alcanzado un nivel de hidratación... preocupante",
  "El vaso estaba lleno, tú también",
  "La próxima vez lee las reglas (si puedes)",
  "Has contribuido al entretenimiento de todos",
  "Tu rendimiento ha sido... memorable",
  "Al menos tienes historias para contar (o no)",
  "El juego es cruel, pero tú eres valiente"
];

/**
 * Obtiene una burla aleatoria.
 * @param {Function} rng - Función de generación de números aleatorios inyectable.
 * @returns {string} Burla seleccionada.
 */
export const obtenerBurlaAleatoria = (rng = Math.random) => {
  const indice = Math.floor(rng() * burlas.length);
  return burlas[indice];
};
