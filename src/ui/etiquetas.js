/**
 * Etiquetas y textos fijos de la interfaz en español.
 */

export const etiquetas = {
  advertencia: {
    titulo: "ADVERTENCIA +18",
    mensaje: "Este juego contiene consumo de alcohol. Bebe con responsabilidad. El 'líquido' puede ser cualquier bebida, incluida el agua.",
    botonAceptar: "Soy mayor de 18 años y acepto"
  },
  configuracion: {
    titulo: "Configuración de la partida",
    jugadores: "Cantidad de jugadores",
    rondas: "Cantidad de rondas",
    nombreJugador: "Nombre del jugador",
    cargarArchivos: "Cargar archivos de datos",
    actividades: "Actividades (CSV/XLSX)",
    comodines: "Comodines (CSV/XLSX)",
    castigos: "Castigos (CSV/XLSX)",
    botonIniciar: "Iniciar partida",
    errorArchivos: "Debes cargar los tres archivos para iniciar",
    errorNombres: "Todos los nombres deben ser únicos y no vacíos"
  },
  juego: {
    titulo: "EL MENOS PEDO",
    ronda: "Ronda",
    de: "de",
    pausa: "Pausar",
    continuar: "Continuar",
    retirarme: "Retirarme",
    jugadorActivo: "Turno de",
    juez: "Juez",
    aceptar: "Aceptar reto",
    comodin: "Usar comodín",
    negar: "Negarse",
    cumplio: "Cumplió",
    noCumplio: "No cumplió",
    seNegoCumplir: "Se negó a cumplirlo",
    segundos: "segundos",
    trago: "trago",
    tragos: "tragos",
    faltanRondas: "Faltan",
    rondasPara: "rondas para",
    estadoActivo: "Activo",
    estadoDescalificado: "Descalificado",
    estadoRetirado: "Retirado"
  },
  apoyo: {
    historial: "Historial",
    baseDatos: "Base de datos",
    actividades: "Actividades",
    comodines: "Comodines",
    castigos: "Castigos"
  },
  desempate: {
    titulo: "DESEMPATE",
    intento: "Intento",
    de: "de",
    cronometro5: "Cronómetro en 5 segundos exactos",
    ruleta: "Ruleta con número indicado",
    contar10: "Contar 10 segundos mentalmente",
    iniciar: "Iniciar",
    detener: "Detener",
    objetivo: "Objetivo",
    resultado: "Tu resultado",
    diferencia: "Diferencia"
  },
  cierre: {
    titulo: "FIN DE LA PARTIDA",
    podio: "PODIO",
    primerLugar: "EL MENOS PEDO",
    ridiculizacion: "RIDICULIZACIÓN",
    retoFinal: "RETO FINAL",
    mensajeRetoFinal: "Beber un vaso completo",
    estadisticas: "ESTADÍSTICAS FINALES",
    reiniciarMisma: "Reiniciar con la misma configuración",
    nuevaConfiguracion: "Nueva configuración",
    sinGanador: "Partida sin ganador",
    ganadorUnico: "¡Ganador único!",
    ganadoresCompartidos: "Ganadores compartidos",
    motivoDescalificacionNegacion: "Negarse a cumplir castigo",
    motivoDescalificacionSinActividades: "Sin actividades cumplidas"
  },
  validacion: {
    errorColumnas: "Faltan columnas obligatorias",
    errorFila: "Fila inválida",
    archivoSinFilas: "El archivo no tiene filas válidas",
    columnasActividades: "Columnas requeridas: id, texto, trago_segundos",
    columnasComodines: "Columnas requeridas: id, texto, efecto",
    columnasCastigos: "Columnas requeridas: id, texto, duracion_rondas"
  }
};
