# Instrucciones para eliminar datos hardcoded

## Objetivo
Toda la información dinámica del juego (actividades, comodines, castigos, burlas y mini-juegos) debe extraerse de archivos CSV/XLSX cargados por el usuario. No debe haber datos de ejemplo o hardcoded en el código.

## Estado actual

### ✅ Ya extraído de archivos
- **Actividades**: Se cargan desde `actividades.csv` (columna `Descripcion`)
- **Comodines**: Se cargan desde `comodines.csv` (columna `Descripcion_Efecto`)
- **Castigos**: Se cargan desde `castigos.csv` (columna `Descripcion_Penitencia`)

### ❌ Aún hardcoded (requiere cambios)

#### 1. Burlas de ridiculización
**Ubicación actual**: `src/ui/burlas.js`
**Problema**: Las burlas están definidas como un array hardcoded en el código.

**Solución requerida**:
1. Crear archivo `burlas.csv` con columnas:
   - `id`: Identificador único
   - `texto`: Texto de la burla

2. Actualizar `src/data/validacion.js`:
   - Agregar `burlas` a `MAPEO_COLUMNAS`
   - Agregar `burlas` a `COLUMNAS_OBLIGATORIAS`
   - Crear función `validarFilaBurla`
   - Crear función `validarArchivoBurlas`

3. Actualizar `src/data/carga.js`:
   - Agregar función para cargar burlas

4. Actualizar `src/App.jsx`:
   - Agregar `burlas` al estado inicial
   - Agregar acción `CARGAR_BURLAS`

5. Actualizar `src/components/Configuracion.jsx`:
   - Agregar input para cargar archivo de burlas
   - Validar que se cargue antes de iniciar partida

6. Actualizar `src/logic/cierre.js`:
   - Usar burlas cargadas en lugar de `obtenerBurlaAleatoria` de `burlas.js`

7. Eliminar `src/ui/burlas.js`

---

#### 2. Mini-juegos de desempate
**Ubicación actual**: `src/logic/desempate.js` (constante `MINIJUEGOS`)
**Problema**: Los mini-juegos están definidos como array hardcoded.

**Solución requerida**:
1. Crear archivo `minijuegos.csv` con columnas:
   - `id`: Identificador único (ej: `cronometro_5s`, `ruleta_numero`, `conteo_10s`)
   - `nombre`: Nombre del mini-juego
   - `objetivo`: Valor objetivo (número o null para ruleta)
   - `instrucciones`: Instrucciones para el jugador

2. Actualizar `src/data/validacion.js`:
   - Agregar `minijuegos` a `MAPEO_COLUMNAS`
   - Agregar `minijuegos` a `COLUMNAS_OBLIGATORIAS`
   - Crear función `validarFilaMinijuego`
   - Crear función `validarArchivoMinijuegos`

3. Actualizar `src/data/carga.js`:
   - Agregar función para cargar mini-juegos

4. Actualizar `src/App.jsx`:
   - Agregar `minijuegos` al estado inicial
   - Agregar acción `CARGAR_MINIJUEGOS`

5. Actualizar `src/components/Configuracion.jsx`:
   - Agregar input para cargar archivo de mini-juegos
   - Validar que se cargue antes de iniciar partida

6. Actualizar `src/logic/desempate.js`:
   - Eliminar constante `MINIJUEGOS`
   - Modificar `seleccionarMinijuego` para recibir la lista de mini-juegos como parámetro
   - Actualizar todas las funciones que usan mini-juegos

7. Actualizar `src/components/Desempate.jsx`:
   - Usar mini-juegos cargados desde `estado.datos.minijuegos`

---

## Archivos de ejemplo requeridos

### burlas.csv
```csv
id,texto
1,¡Al menos intentaste! (o quizás no)
2,La próxima vez bebe agua, es más seguro
3,El alcohol no es tu mejor amigo hoy
4,Has demostrado una resistencia... cuestionable
5,Tu hígado envía saludos (y quejas)
```

### minijuegos.csv
```csv
id,nombre,objetivo,instrucciones
cronometro_5s,Cronometro en 5 segundos exactos,5.0,Detene el cronometro cuando creas que pasaron 5 segundos.
ruleta_numero,Ruleta con numero indicado,,Detene la ruleta lo mas cerca posible del numero indicado.
conteo_10s,Contar 10 segundos mentalmente,10.0,Pulsa iniciar y luego detener cuando creas que pasaron 10 segundos.
```

---

## Orden de implementación recomendado

1. **Burlas** (más simple, solo texto)
   - Crear archivo CSV de ejemplo
   - Actualizar validación
   - Actualizar carga
   - Actualizar configuración
   - Actualizar cierre
   - Probar

2. **Mini-juegos** (más complejo, tiene lógica asociada)
   - Crear archivo CSV de ejemplo
   - Actualizar validación
   - Actualizar carga
   - Actualizar configuración
   - Actualizar lógica de desempate
   - Actualizar componente Desempate
   - Probar

---

## Verificación final

Después de implementar los cambios, verificar que:
- No existan arrays de datos en archivos `.js` (excepto `etiquetas.js` que es UI)
- Todos los datos dinámicos se carguen desde archivos CSV/XLSX
- La aplicación funcione correctamente con archivos personalizados
- Las pruebas pasen sin errores
