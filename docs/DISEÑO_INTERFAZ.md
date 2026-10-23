# DISENO_INTERFAZ.md - Referencia visual de la partida

Especificación de la interfaz de la vista **Partida principal** de «EL MENOS HIDRATADO», basada en la imagen `docs/referencia-interfaz.png`.

Este archivo complementa a `AGENTS.md` (sección 5, interfaz, y sección 6, sistema de diseño). **Si algo de este archivo o de la imagen contradice a `AGENTS.md`, mandan las reglas de `AGENTS.md`.** Las diferencias conocidas están en la sección 7.

---

## 1. Cómo usar esta referencia

1. Abrir `docs/referencia-interfaz.png` y reproducir su **composición, jerarquía, colores y estilo**.
2. Los nombres, segundos, textos y números de la imagen son ejemplos. Todo dato real sale del estado de la partida (sección 4 de `AGENTS.md`), nunca del código.
3. Los elementos que exige `AGENTS.md` y no aparecen en la imagen están descritos aquí como **añadidos** y deben respetar el mismo estilo.
4. Construir primero el módulo `src/design` (sección 6.1 de `AGENTS.md`) y después los componentes de esta vista.

---

## 2. Composición general

- Tres paneles con esquinas redondeadas (16 px), fondo de superficie y borde de 1 px en tono pizarra, separados por 16 px.
- Anchos: 25 % (jugadores), 50 % (acción) y 25 % (soporte).
- Cada panel lleva un título centrado en mayúsculas.
- Por debajo de 768 px la vista colapsa a una columna (sección 9).

### Header

| Zona | Contenido |
| --- | --- |
| Izquierda | «EL MENOS HIDRATADO», título en mayúsculas, negrita |
| Centro | «RONDA X DE Y», en mayúsculas y negrita |
| Derecha | Dos botones circulares de 40 px con icono: **pausa** y **reloj** |

---

## 3. Columna izquierda: «ESTADO DE JUGADORES»

Una ficha por jugador, en orden J1..JN, con desplazamiento vertical si no caben.

### Anatomía de la ficha

- Tarjeta horizontal con radio de 12 px, fondo de superficie y borde de 2 px.
- **Avatar** circular de 56 px a la izquierda.
- **Nombre** en mayúsculas y negrita.
- **Etiqueta de estado** alineada a la derecha del nombre: `ACTIVO` en verde.
- **Fila de datos** bajo el nombre:
  - Icono de gota y el puntaje en segundos, por ejemplo `45s` (`liquido_acumulado`).
  - Icono de escudo y los comodines, por ejemplo `1 Comodín` o `2 Comodines` (singular y plural correctos).

### Estados

| Estado | Apariencia |
| --- | --- |
| Jugador del turno | Borde verde con brillo suave y un anillo de progreso verde alrededor del avatar. Es el único con anillo |
| Activo sin turno | Borde neutro. La etiqueta sigue siendo `ACTIVO` |
| Descalificado | Ficha atenuada, nombre en gris, avatar con una X roja grande encima, etiqueta `DESCALIFICADO` en rojo e icono de dos tarjetas rojas a la derecha |
| Retirado | Ficha neutra y atenuada con la etiqueta `RETIRADO` en gris |

### Avatares

No hay fotos. El avatar es un círculo con la inicial del nombre sobre un color determinístico tomado de una paleta fija, o un icono ilustrado generado a partir del nombre.

### Añadidos requeridos por `AGENTS.md`

- **Castigos activos:** bajo la fila de datos, una insignia roja por castigo con el texto «Te faltan N rondas: [castigo]». Si hay más de uno, se muestra el primero y un «+N más» que expande la lista.
- **Puntos negativos:** icono de alerta y el número, visible solo cuando `puntos_negativos > 0`.
- **Menú de la ficha (⋯):** con **Retirarme** y, por cada castigo activo, **Se negó a cumplirlo** (lo puede pulsar cualquier otro jugador activo).

---

## 4. Columna central: «ÁREA DE ACCIÓN»

De arriba abajo:

1. **Título** «ÁREA DE ACCIÓN».
2. **Turno actual:** «TURNO ACTUAL:» en gris y el nombre del jugador en azul de acento.
3. **Tarjeta de actividad:** cabecera morada con «TARJETA DE ACTIVIDAD» en blanco, y cuerpo claro con el texto de la actividad centrado, en mayúsculas y negrita, sobre color oscuro.
4. **Requerimiento:** la etiqueta «REQUERIMIENTO», una ilustración de un trompo multicolor con flechas circulares y, debajo, el texto grande en rojo «¡BEBE 7 SEGUNDOS!». El valor es `trago_segundos` de la actividad.
5. **Botones de decisión:** tres botones del mismo ancho en una fila.

### Botones de decisión

Los tres tienen texto en mayúsculas y negrita, radio de 10 px y un borde inferior de 4 px en un tono más oscuro que da efecto de relieve.

| Botón | Color | Texto |
| --- | --- | --- |
| Aceptar | Verde | `ACEPTAR RETO` |
| Comodín | Azul | `USAR COMODÍN` y, en una segunda línea, `(N DISPONIBLE/S)`. Sin comodines queda deshabilitado al 50 % con `SIN COMODINES` |
| Negarse | Rojo | `NEGARSE Y ASUMIR CASTIGO` y, en una segunda línea con icono de advertencia, `(RECIBIRÁS UN CASTIGO)` |

### Estados de esta zona

| Paso del turno (`turno.paso`) | Qué se muestra |
| --- | --- |
| `eleccion` | Tarjeta de actividad, requerimiento con el trompo y los tres botones |
| `en_curso` | El texto del requerimiento se sustituye por la cuenta regresiva grande (7, 6, 5, ..., 0). Es solo visual. El trompo se detiene |
| `confirmacion` | Los tres botones se sustituyen por el **panel del juez** |

### Añadidos requeridos por `AGENTS.md`

- **Panel del juez:** título «JUEZ: [nombre]» y dos botones del mismo estilo, `CUMPLIÓ` en verde y `NO CUMPLIÓ` en rojo.
- **Resultado de comodín:** tarjeta con cabecera azul «COMODÍN» y el texto del efecto. Si el efecto es `cambiar`, muestra la actividad sustituta con su trago.
- **Castigo inmediato:** tarjeta con cabecera roja «CASTIGO» y el panel del juez debajo.

---

## 5. Columna derecha: «SOPORTE»

### Historial de ronda

- Lista de filas con radio de 8 px y un fondo apenas más claro que el panel.
- Formato de cada fila: `RONDA N: NOMBRE acción`, por ejemplo «RONDA 6: PEDRO usó comodín».
- Las entradas nuevas aparecen arriba con una entrada suave.

### Base de datos

- Tres pestañas con icono y etiqueta debajo: **ACTIVIDADES** (icono de lista), **COMODINES** (icono de cartas azul) y **CASTIGOS** (icono rojo).
- La pestaña activa lleva un subrayado de 2 px en el color de acento.
- Debajo de las pestañas se lista lo cargado desde los archivos, con un buscador.
- El cambio de pestaña es instantáneo y conserva el desplazamiento.

---

## 6. Sistema visual extraído de la imagen

### Colores

| Uso | Valor |
| --- | --- |
| Fondo general | `#0F172A` |
| Superficies y tarjetas | `#1E293B` |
| Verde (activo, éxito) | `#10B981`, borde inferior `#059669` |
| Azul (acento interactivo, nombre del turno) | `#3B82F6`, borde inferior `#2563EB` |
| Rojo (peligro, castigo, requerimiento) | `#EF4444`, borde inferior `#DC2626` |
| Morado (cabecera de la tarjeta de actividad) | `#7C3AED` |
| Cuerpo de la tarjeta de actividad | `#F8FAFC` con texto `#0F172A` |
| Texto principal y secundario | `#F8FAFC` y `#94A3B8` |
| Neutro deshabilitado | `#64748B`, solo en estados deshabilitados |

El morado y los tonos de borde inferior son tokens nuevos: se agregan a `tailwind.config.js`.

### Tipografía

- Títulos, nombres, números grandes y botones: fuente condensada, negrita y mayúsculas. Pila sin instalar nada: `'Barlow Condensed', 'Roboto Condensed', 'Arial Narrow', sans-serif`.
- Cuerpo y listas: Inter, con la escala de la sección 6 de `AGENTS.md`.

### Forma y profundidad

- Radios: paneles 16 px, fichas 12 px, botones 10 px, filas 8 px. Espaciado en múltiplos de 4 px.
- Botones con relieve: `border-b-4` en el tono oscuro del color.
- Ficha del turno: borde verde de 2 px y brillo `0 0 16px` verde con 40 % de opacidad.
- Iconos como SVG propios en `src/design/iconos.jsx`: gota, escudo, pausa, reloj, lista, cartas, advertencia, X y tarjetas rojas.

---

## 7. Diferencias entre la imagen y las reglas (mandan las reglas)

| # | La imagen muestra | La regla dice | Resolución |
| --- | --- | --- | --- |
| 1 | Botón rojo con «(TE DESCALIFICARÁ)» | Negarse no descalifica: da un castigo, suma el trago y deja la deuda del vaso completo | Texto «(RECIBIRÁS UN CASTIGO)» |
| 2 | Un trompo que parece determinar el requerimiento | No hay pirinola: el trago sale de `trago_segundos` de la actividad | El trompo es solo adorno animado al revelar el requerimiento |
| 3 | Avatares ilustrados como personas | No hay fotos ni imágenes de los jugadores | Avatar con inicial y color |
| 4 | Historial: «JUAN se negó y fue descalificado» | Solo se descalifica por negarse a cumplir un castigo o por terminar con cero actividades cumplidas | Texto «JUAN se negó a cumplir un castigo y fue descalificado» |
| 5 | No hay castigos activos, puntos negativos, juez ni botón de retiro | Son parte de las reglas | Añadidos de las secciones 3 y 4 de este archivo |
| 6 | Dos botones en el header: pausa y reloj | `AGENTS.md` solo define la pausa | Ver pendientes |

---

## 8. Animaciones de esta vista

Usan el catálogo de la sección 6.2 de `AGENTS.md`. Aplicación a esta pantalla:

- **Cambio de turno:** la ficha activa se resalta y la tarjeta de actividad entra con desvanecimiento y desplazamiento hacia arriba.
- **Requerimiento:** el trompo gira al revelar el valor y se detiene al aceptar.
- **Cuenta regresiva:** pulso de escala por segundo y cambio de color en 0.
- **Puntaje de la ficha:** el número se anima y aparece un «+N s» flotante.
- **Negarse o «No cumplió»:** sacudida horizontal breve y tinte rojo.
- **Descalificación:** la X roja se dibuja y la ficha se atenúa.
- **Historial:** la fila nueva entra desde arriba.

Con `prefers-reduced-motion` activo, todo se reduce a cambios instantáneos.

---

## 9. Responsive (menos de 768 px)

- El header se compacta: título, ronda y los dos botones en dos filas.
- Una sola columna con una barra de pestañas inferior: **Jugadores**, **Acción** (por defecto) y **Soporte**.
- Los tres botones de decisión se apilan en vertical, a ancho completo y con al menos 44 px de alto, fijos en la parte baja de la pestaña Acción.
- Las fichas se muestran en una lista de una columna con la misma anatomía.

---

## 10. Criterios de aceptación visual

1. La composición coincide con la imagen en 1280 px: header, tres columnas 25/50/25 y paneles con título.
2. La ficha del turno es la única con borde verde y anillo de progreso.
3. Una ficha descalificada se ve atenuada, con X roja, etiqueta roja e icono de tarjetas.
4. Los botones de decisión tienen relieve, el mismo ancho y el orden Aceptar, Comodín, Negarse.
5. El botón de comodín se deshabilita al 50 % cuando no quedan comodines.
6. El texto del botón rojo dice «(RECIBIRÁS UN CASTIGO)».
7. Durante `en_curso` se ve la cuenta regresiva y durante `confirmacion` el panel del juez.
8. El historial y las pestañas de base de datos funcionan sin perder el desplazamiento.
9. En 375 px la vista es de una sola columna con pestañas inferiores y botones de al menos 44 px.
10. Con `prefers-reduced-motion` no hay desplazamientos ni confeti.

---

## 11. Pendientes por confirmar

1. **Fuente condensada:** instalar un paquete de fuentes cuenta como dependencia nueva y requiere aprobación. Mientras tanto se usa la pila de respaldo.
2. **Botón de reloj del header:** propongo que muestre el tiempo transcurrido de la partida, solo como dato informativo. ¿Cumple otra función?
3. **Morado de la tarjeta de actividad:** propongo `#7C3AED`. Se puede ajustar al tono exacto de la imagen.