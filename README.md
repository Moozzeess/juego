# EL MENOS HIDRATADO

Juego de consumo responsable con actividades, comodines y castigos. El objetivo es beber la menor cantidad de líquido posible.

## Estructura del proyecto

```
juego/
├── src/
│   ├── components/          # Componentes de React
│   │   ├── Advertencia.jsx      # Pantalla de advertencia +18
│   │   ├── Configuracion.jsx    # Configuración inicial y carga de archivos
│   │   ├── Partida.jsx          # Layout principal de tres columnas
│   │   ├── Marcador.jsx         # Marcador global con estado de jugadores
│   │   ├── AreaAccion.jsx       # Área central con actividad y botones
│   │   ├── RelojTrago.jsx       # Reloj de cuenta regresiva visual
│   │   ├── PanelJuez.jsx        # Panel de confirmación del juez
│   │   ├── PanelApoyo.jsx       # Panel con historial y base de datos
│   │   ├── Desempate.jsx        # Mini-juegos de desempate
│   │   └── ModalCierre.jsx      # Modal de cierre con podio y estadísticas
│   ├── data/                # Carga y validación de datos
│   │   └── validacion.js        # Validación de archivos CSV/XLSX
│   ├── logic/               # Lógica del juego en JavaScript puro
│   │   ├── turnos.js            # Orden de turnos y cierre de ronda
│   │   ├── reto.js              # Acciones: aceptar, comodín, negarse
│   │   ├── castigos.js          # Gestión de castigos activos
│   │   ├── descalificacion.js   # Reglas de descalificación
│   │   ├── cierre.js            # Ranking, podio y cierre
│   │   ├── desempate.js         # Mini-juegos de desempate
│   │   └── aleatorio.js          # Selección aleatoria sin repetición
│   ├── ui/                  # Textos fijos de la interfaz
│   │   ├── etiquetas.js         # Etiquetas en español
│   │   └── burlas.js            # Burlas para ridiculización
│   ├── App.jsx              # Componente principal con useReducer
│   ├── main.jsx             # Entry point de React
│   └── index.css            # Estilos globales con Tailwind
├── public/
│   └── ejemplos/            # Archivos de ejemplo para desarrollo
│       ├── actividades_ejemplo.csv
│       ├── comodines_ejemplo.csv
│       └── castigos_ejemplo.csv
├── tests/                  # Pruebas de Vitest para la lógica
│   ├── turnos.test.js
│   ├── reto.test.js
│   ├── castigos.test.js
│   ├── cierre.test.js
│   ├── casoslimite.test.js
│   └── validacion.test.js
├── AGENTS.md               # Especificaciones completas del juego
├── vite.config.js          # Configuración de Vite
├── tailwind.config.js      # Configuración de Tailwind CSS
├── postcss.config.js       # Configuración de PostCSS
├── index.html              # Entry point HTML
├── package.json            # Dependencias y scripts
└── README.md               # Este archivo
```

## Stack tecnológico

- **Interfaz:** React 18 con componentes funcionales y `useReducer`
- **Estilos:** Tailwind CSS 3
- **Lenguaje:** JavaScript (sin TypeScript)
- **Empaquetado:** Vite
- **Lectura de archivos:** PapaParse (CSV) y SheetJS (XLSX)
- **Pruebas:** Vitest

## Comandos

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Ejecutar pruebas
npm test

# Build de producción
npm run build

# Preview de producción
npm run preview
```

## Reglas del juego

Ver el archivo `AGENTS.md` para las reglas completas y detalladas.

### Resumen

1. **Consumo responsable:** Advertencia +18 al iniciar. El líquido puede ser cualquier bebida.
2. **Carga de datos:** Los usuarios suben archivos CSV/XLSX con actividades, comodines y castigos.
3. **Configuración:** 2-12 jugadores, 1-50 rondas, nombres únicos.
4. **Turnos:** Orden fijo J1..JN. Cada jugador elige: aceptar, usar comodín o negarse.
5. **Puntaje:** `liquido_acumulado` en segundos. Gana el menor.
6. **Castigos:** Se asignan al negarse. Tienen duración en rondas.
7. **Descalificación:** Por negarse a un castigo o por 0 actividades cumplidas.
8. **Cierre:** Podio, ridiculización, reto final (vaso completo) y tabla de estadísticas.
9. **Desempate:** Mini-juegos aleatorios si hay empate en el primer lugar.

## Formato de archivos

### Actividades (CSV/XLSX)
Columnas obligatorias: `id`, `texto`, `trago_segundos`
- `trago_segundos`: entero mayor que 0

### Comodines (CSV/XLSX)
Columnas obligatorias: `id`, `texto`, `efecto`, `trago_segundos`
- `efecto`: `salvar` o `cambiar`
- `trago_segundos`: entero mayor o igual que 0 (solo para `cambiar`)

### Castigos (CSV/XLSX)
Columnas obligatorias: `id`, `texto`, `duracion_rondas`
- `duracion_rondas`: entero mayor o igual que 0 (vacío equivale a 0)

## Desarrollo

La lógica del juego está completamente separada de la interfaz en `src/logic/`. Los componentes en `src/components/` solo muestran estado y despachan acciones al reducer en `App.jsx`.

Los textos de la interfaz están centralizados en `src/ui/etiquetas.js` en español.

## Pruebas

Las pruebas cubren la lógica del juego en `tests/`. Ejecutar con `npm test`.

## Licencia

ISC
