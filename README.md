# Juego de Bebidas

Aplicación web de juego de bebidas con actividades, comodines, castigos y minijuegos.

## Estructura del Proyecto

```
juego/
├── public/
│   └── ejemplos/
│       ├── actividades.csv    # Archivo de ejemplo de actividades con minijuegos
│       ├── comodines.csv      # Archivo de ejemplo de comodines
│       └── castigos.csv       # Archivo de ejemplo de castigos
├── src/
│   ├── components/            # Componentes de la interfaz de usuario
│   │   ├── Advertencia.jsx   # Pantalla de advertencia inicial
│   │   ├── AreaAccion.jsx    # Área principal de acción del juego
│   │   ├── Configuracion.jsx # Pantalla de configuración de partida
│   │   ├── Desempate.jsx     # Componente de minijuegos de desempate
│   │   ├── Marcador.jsx      # Marcador de puntuación
│   │   ├── ModalCastigo.jsx  # Modal para mostrar castigos
│   │   ├── ModalCierre.jsx   # Modal de cierre de partida
│   │   ├── ModalReglas.jsx   # Modal de reglas del juego
│   │   ├── Minijuego.jsx     # Componente de minijuegos para actividades
│   │   ├── PanelApoyo.jsx    # Panel de apoyo con información
│   │   ├── PanelJuez.jsx     # Panel del juez para validar cumplimientos
│   │   ├── Partida.jsx       # Componente principal de partida
│   │   └── RelojTrago.jsx    # Reloj para contar segundos de trago
│   ├── data/                  # Módulos de carga y validación de datos
│   │   ├── carga.js          # Carga de archivos CSV y XLSX
│   │   └── validacion.js     # Validación de datos de actividades, comodines y castigos
│   ├── logic/                 # Lógica del juego
│   │   ├── aleatorio.js      # Generación de números aleatorios
│   │   ├── castigos.js       # Lógica de castigos
│   │   ├── cierre.js         # Lógica de cierre de partida
│   │   ├── descalificacion.js # Lógica de descalificación
│   │   ├── desempate.js      # Lógica de desempate con minijuegos
│   │   ├── reto.js           # Lógica de retos
│   │   └── turnos.js         # Lógica de gestión de turnos
│   ├── ui/                    # Componentes de interfaz de usuario genéricos
│   │   ├── animaciones.jsx   # Animaciones de Framer Motion
│   │   └── etiquetas.js      # Etiquetas de texto en español
│   ├── Styles/                # Estilos de la aplicación
│   ├── App.jsx               # Componente principal con reducer de estado
│   ├── index.css             # Estilos globales
│   └── main.jsx              # Punto de entrada de la aplicación
├── docs/                      # Documentación adicional
├── tests/                     # Pruebas unitarias
├── index.html                 # Archivo HTML principal
├── package.json               # Dependencias del proyecto
├── tailwind.config.js         # Configuración de Tailwind CSS
├── vite.config.js             # Configuración de Vite
└── postcss.config.js          # Configuración de PostCSS
```

## Características

- **Actividades con minijuegos**: Las actividades pueden incluir minijuegos opcionales (cronómetro de 5s, ruleta, contar 10s)
- **Desempate con minijuegos**: Sistema de desempate con 3 minijuegos diferentes
- **Comodines**: Sistema de comodines para salvarse o cambiar de actividad
- **Castigos**: Sistema de castigos con duración en rondas
- **Configuración flexible**: Carga de actividades, comodines y castigos desde archivos CSV o XLSX
- **Interfaz responsiva**: Diseño adaptable a diferentes tamaños de pantalla

## Minijuegos Disponibles

### Para Actividades
- **cronometro5**: Cronómetro de 5 segundos exactos
- **ruleta**: Ruleta con número indicado
- **contar10**: Contar 10 segundos mentalmente

### Para Desempate
- Los mismos minijuegos que para actividades, con sistema de intentos y evaluación de resultados

## Uso de Minijuegos en Actividades

Para agregar un minijuego a una actividad, incluye el campo `Minijuego` en el archivo CSV:

```csv
ID,Categoria,Actividad,Descripcion,Participantes,Minijuego
1,Humor,No Te Rias,Descripción...,2 competidores,cronometro5
```

Los valores válidos son: `cronometro5`, `ruleta`, `contar10`

## Tecnologías

- React
- Vite
- Tailwind CSS
- Framer Motion
- PapaParse (CSV)
- SheetJS (XLSX)
