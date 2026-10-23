# AGENTS.md - «EL MENOS HIDRATADO»

Fuente única de verdad para implementar el juego «EL MENOS HIDRATADO». Contiene las reglas, el estado, la interfaz, el sistema de diseño y las instrucciones para agentes.

**Regla para agentes:** las reglas de las secciones 3 y 4 son el contrato. Ningún agente las cambia sin actualizar antes este documento.

---

## 0. Glosario

- **Ronda:** ciclo completo en el que cada jugador activo juega una vez, en orden fijo J1, J2, ..., JN. Al terminar JN empieza la siguiente ronda con J1.
- **Turno:** la jugada de un solo jugador dentro de una ronda. «Turno» se usa en la interfaz; «ronda» en la lógica.
- **Actividad:** reto de `actividades.csv` que lleva un trago asociado en segundos.
- **Comodín:** recurso (2 por jugador) que permite salvarse de una actividad o cambiarla.
- **Castigo:** reto social «ridículo» de `castigos.csv`, con duración en rondas.
- **Juez:** jugador activo siguiente en el orden. Confirma si el jugador del turno cumplió.
- **Puntaje:** `liquido_acumulado`, en segundos. Un segundo vale un punto. Gana el menor.
- **Vaso completo final:** reto de cierre. No suma puntos.

---

## 1. Stack y comandos

| Pieza | Elección |
| --- | --- |
| Interfaz | React 18, componentes funcionales, `useReducer` para el estado de la partida |
| Estilos | Tailwind CSS 3, colores del sistema de diseño como tokens en `tailwind.config.js` |
| Lenguaje | JavaScript (sin TypeScript) |
| Empaquetado | Vite con `npm` |
| Lectura de archivos | PapaParse para `.csv` y SheetJS (`xlsx`) para `.xlsx` |
| Pruebas | Vitest, solo sobre la lógica del juego |

Comandos:

- `npm install` instala las dependencias.
- `npm run dev` abre el servidor de desarrollo.
- `npm test` ejecuta las pruebas de la lógica.
- `npm run build` genera la versión de producción.

---

## 2. Estructura de archivos

```text
src/
  logic/          reglas del juego en JS puro, sin React
    turnos.js         orden J1..JN, juez y cierre de ronda
    reto.js           acciones: aceptar, comodín, negarse, confirmación del juez
    castigos.js       castigos activos y contadores de rondas
    descalificacion.js  reglas de descalificación y retiro
    cierre.js         ranking, podio, ridiculización y vaso completo final
    desempate.js      mini-juegos de desempate
    aleatorio.js      selección aleatoria sin repetición con rng inyectable
  data/           carga y validación de .csv y .xlsx
  components/     Advertencia, Configuracion, Marcador, AreaAccion, RelojTrago,
                  PanelJuez, PanelApoyo, Minijuegos, ModalCierre
  ui/             textos fijos de la interfaz (burlas.js, etiquetas)
  App.jsx
public/ejemplos/  archivos de ejemplo para desarrollo y pruebas
tests/            pruebas de src/logic
```

---

## 3. Reglas del juego

### 3.1. Consumo responsable

1. Al abrir la app se muestra una pantalla de advertencia **+18** que hay que aceptar para continuar.
2. El «líquido» puede ser cualquier bebida, incluida el agua.
3. Cualquier jugador puede retirarse en cualquier momento con el botón **Retirarme**, sin penalización: queda fuera del orden, del ranking y de la ridiculización, y no bebe el vaso completo final.

### 3.2. Carga de datos

Las actividades, los comodines y los castigos **no se escriben en el código**. El usuario los sube como archivos `.csv` (UTF-8) o `.xlsx` (primera hoja, fila 1 con los encabezados), con **cualquier cantidad de filas** (mínimo 1 fila válida por archivo).

| Archivo | Columnas obligatorias | Reglas |
| --- | --- | --- |
| `actividades` | `id`, `texto`, `trago_segundos` | `trago_segundos` es un entero mayor que 0. El trago puede ir escrito también en el texto («3 tragos»), pero el valor que cuenta es `trago_segundos`. |
| `comodines` | `id`, `texto`, `efecto` | `efecto` es `salvar` o `cambiar`. Con `cambiar` se añade `trago_segundos` (entero mayor o igual que 0). |
| `castigos` | `id`, `texto`, `duracion_rondas` | `duracion_rondas` es un entero mayor o igual que 0. Vacío equivale a 0. |

Validación al cargar:

- Faltan columnas obligatorias: se rechaza el archivo y se indica cuáles faltan.
- Fila inválida: se omite y se informa su número de fila y el motivo.
- Un archivo sin ninguna fila válida impide iniciar la partida.
- Se admite volver a subir un archivo para reemplazar el anterior.

Selección aleatoria: uniforme y **sin repetir** un elemento hasta agotar la lista. Después se vuelve a barajar.

### 3.3. Configuración inicial

1. Mostrar la pantalla de configuración como vista bloqueante.
2. Pedir `total_jugadores` (de 2 a 12), un nombre por jugador (no vacío y único) y `rondas_totales` (de 1 a 50, rondas completas).
3. Exigir los tres archivos de la sección 3.2 ya cargados y válidos.
4. Registrar a cada jugador con los valores iniciales de la sección 4 y mostrar la lista con sus comodines.

### 3.4. Orden y rondas

1. Los turnos siguen el orden fijo J1, J2, ..., JN. No hay azar en el orden.
2. Los jugadores descalificados y retirados se saltan.
3. Cuando termina el turno del último jugador activo, se cierra la ronda:
   - El contador de cada castigo activo baja en 1.
   - Los castigos que llegan a 0 se liberan y se registran en el historial.
   - `ronda_actual` aumenta en 1.
4. Si `ronda_actual` supera `rondas_totales`, la partida pasa al cierre (sección 3.9).

### 3.5. Turno

1. Se elige una actividad al azar y se muestra con su `trago_segundos`.
2. El jugador activo elige una de tres opciones.

**Opción 1. Aceptar el reto**

1. Se inicia el reloj de trago (sección 3.8).
2. El jugador cumple la actividad y bebe.
3. El juez pulsa **Cumplió** o **No cumplió**:
   - **Cumplió:** `actividades_cumplidas += 1` y `liquido_acumulado += trago_segundos`.
   - **No cumplió:** se trata como una negativa (ver Opción 3).

**Opción 2. Usar comodín**

- El botón está deshabilitado (50 % de opacidad) si `comodines == 0`. Nunca se fuerza otra opción.
- Si `comodines > 0`, `comodines -= 1` y se elige un comodín al azar:
  - `salvar`: el jugador se salva de la actividad. No suma segundos.
  - `cambiar`: el texto del comodín sustituye a la actividad y usa su propio `trago_segundos`. Se resuelve como la Opción 1, con confirmación del juez.

**Opción 3. Negarse a beber o hacer la actividad**

- Negarse es **opción A**: el trago de la actividad se suma igual, `liquido_acumulado += trago_segundos`. Negarse no sirve para ganar.
- `puntos_negativos += 1`.
- Se elige un castigo al azar de `castigos` y se registra en `castigos_activos` con `rondas_restantes = duracion_rondas`.
- Si `duracion_rondas` es 0, el castigo se cumple en el momento: el juez pulsa **Cumplió** o **No cumplió**. Si no cumplió, el jugador queda descalificado.
- Negarse a una actividad **no descalifica**. Todo lo negado se acumula como deuda: el jugador bebe el vaso completo final.

### 3.6. Castigos

1. Un jugador puede tener **varios castigos activos** a la vez, cada uno con su propio contador.
2. La ficha del jugador muestra, por ejemplo: «Jugador K, te faltan 3 rondas para: [texto del castigo]».
3. La app solo registra y muestra el contador. No verifica el cumplimiento.
4. Cada castigo activo tiene el botón **Se negó a cumplirlo**, que puede pulsar cualquier otro jugador activo. Al pulsarlo, el jugador queda descalificado.
5. Un castigo nuevo se suma a los que ya existen sin reiniciarlos.

### 3.7. Descalificación

Un jugador queda descalificado cuando:

1. Se niega a cumplir un castigo (inmediato o activo), o
2. Termina la partida sin haber cumplido ninguna actividad (`actividades_cumplidas == 0`). Esta condición se evalúa al cierre.

Un jugador descalificado:

- Sale del orden de turnos de inmediato (caso 1).
- Queda fuera del podio y se ridiculiza en el cierre.
- Bebe el vaso completo final.
- Conserva sus estadísticas en la tabla final.

### 3.8. Reloj de trago

1. Es una cuenta regresiva visual de `trago_segundos` hasta 0 (por ejemplo, 5, 4, 3, 2, 1, 0).
2. Arranca al aceptar el reto y se muestra en la columna central.
3. Es solo un indicador: **no cambia el puntaje** ni bloquea ninguna acción.
4. El botón de pausa del header detiene la partida y el reloj.

### 3.9. Cierre

Al terminar la última ronda, o antes si quedan menos de 2 jugadores activos:

1. Evaluar la descalificación por cero actividades cumplidas.
2. Ordenar a los jugadores **no descalificados y no retirados** por `liquido_acumulado` ascendente. **Gana el menor puntaje**, aunque tenga castigos.
3. **Empate en el primer lugar:** desempatar entre los empatados con un mini-juego elegido al azar (sección 3.9.1). Si tras 3 intentos persiste el empate, se declaran **ganadores compartidos**.
4. Mostrar el **podio** con los tres mejores puntajes. El primer lugar es «EL MENOS HIDRATADO».
5. Mostrar la sección de **ridiculización** con los jugadores castigados (`puntos_negativos > 0`) y los descalificados, con su motivo y una burla en tono de juego.
6. Mostrar el **reto final**: beben un vaso completo lleno todos los jugadores con `puntos_negativos > 0`, todos los descalificados y quien no bebió nada. No suma puntos.
7. Mostrar la tabla completa de estadísticas finales.
8. Ofrecer **Reiniciar con la misma configuración** y **Nueva configuración**.

#### 3.9.1. Mini-juegos de desempate

Vienen incluidos en la app y se eligen al azar. Cada participante juega en orden y gana el que quede más cerca del objetivo. Un empate en el mini-juego cuenta como un intento.

| Mini-juego | Mecánica |
| --- | --- |
| Cronómetro en 5 segundos exactos | El jugador detiene un cronómetro oculto cuando cree que pasaron 5 s. Gana el más cercano a 5.000 s. |
| Ruleta con número indicado | Se indica un número objetivo y una ruleta gira. Gana el que la detenga más cerca de ese número. |
| Contar 10 segundos mentalmente | El jugador pulsa iniciar y luego detener cuando cree que pasaron 10 s. Gana el más cercano a 10.000 s. |

### 3.10. Casos límite

- Todos descalificados o retirados: «partida sin ganador», con la tabla final y el reto final.
- Queda un solo jugador activo: la partida termina y gana ese jugador.
- Un archivo de datos se vacía o se corrompe durante la partida: no puede ocurrir, porque los datos se cargan en memoria al iniciar.

---

## 4. Estado de la partida

Los valores son iniciales. No hay datos del juego escritos en el código.

```json
{
  "configuracion": {
    "total_jugadores": null,
    "nombres_jugadores": [],
    "rondas_totales": null
  },
  "datos": {
    "actividades": [],
    "comodines": [],
    "castigos": []
  },
  "estado_partida": {
    "fase": "advertencia",
    "ronda_actual": 1,
    "indice_turno": 0,
    "jugador_activo": null,
    "juez": null,
    "turno": {
      "paso": "eleccion",
      "actividad": null,
      "origen": "actividad"
    },
    "jugadores": [
      {
        "nombre": "",
        "liquido_acumulado": 0,
        "comodines": 2,
        "actividades_cumplidas": 0,
        "puntos_negativos": 0,
        "castigos_activos": [],
        "descalificado": false,
        "motivo_descalificacion": null,
        "retirado": false
      }
    ],
    "historial": [],
    "desempate": {
      "intento": 0,
      "minijuego": null,
      "participantes": [],
      "resultados": []
    },
    "resultado_final": null
  }
}
```

Valores permitidos:

- `fase`: `advertencia`, `configuracion`, `partida`, `desempate`, `cierre`.
- `turno.paso`: `eleccion`, `en_curso`, `confirmacion`.
- `turno.origen`: `actividad`, `comodin_cambiar`.
- `motivo_descalificacion`: `negarse_castigo`, `sin_actividades_cumplidas`.
- Cada elemento de `castigos_activos`: `{ "id", "texto", "rondas_restantes" }`.

`puntos_negativos` cuenta las negativas del jugador y los castigos recibidos.

---

## 5. Interfaz de usuario

### 5.1. Layout de la partida (tres columnas)

- **Columna izquierda (25 %), marcador global:** una ficha por jugador con estado (Activo, Descalificado, Retirado), puntaje, comodines, puntos negativos y castigos activos con su contador de rondas.
- **Columna central (50 %), área de acción:** turno actual, tarjeta de actividad, reloj de trago, botones de decisión y panel del juez.
- **Columna derecha (25 %), apoyo:** pestañas con el historial cronológico y la consulta de las bases de datos cargadas (`actividades`, `comodines`, `castigos`).
- **Header fijo:** nombre del juego, «Ronda X de Y» y controles del sistema (pausa).
- **Responsive:** por debajo de 768 px se colapsa a una columna con pestañas inferiores.

### 5.2. Flujo de vistas

1. **Advertencia +18.**
2. **Configuración inicial:** pantalla bloqueante con jugadores, nombres, rondas y carga de archivos.
3. **Partida principal:** layout de tres columnas.
4. **Mini-juego de desempate:** vista superpuesta cuando aplica.
5. **Cierre:** modal con podio, ridiculización, reto final, tabla de estadísticas y botones de reinicio.

### 5.3. Jerarquía de componentes

```json
{
  "interfaz_usuario": {
    "vistas": {
      "advertencia": {
        "componentes": ["texto_advertencia_18", "boton_aceptar"]
      },
      "configuracion": {
        "componentes": [
          {
            "tipo": "contenedor",
            "elementos": [
              "selector_cantidad_jugadores",
              "inputs_nombre_jugadores",
              "selector_rondas_totales",
              "cargador_archivo_actividades",
              "cargador_archivo_comodines",
              "cargador_archivo_castigos",
              "reporte_validacion_archivos",
              "boton_iniciar"
            ]
          }
        ]
      },
      "partida_principal": {
        "layout": {
          "tipo": "grid_tres_columnas",
          "secciones": {
            "izquierda": {
              "componente": "panel_marcador_global",
              "elementos_hijos": [
                "tarjeta_jugador",
                "lista_castigos_activos",
                "indicador_estado_descalificado"
              ]
            },
            "centro": {
              "componente": "area_accion_principal",
              "elementos_hijos": [
                "tarjeta_actividad",
                "reloj_trago",
                "contenedor_botones_decision",
                "panel_confirmacion_juez"
              ]
            },
            "derecha": {
              "componente": "panel_apoyo_soporte",
              "elementos_hijos": [
                "pestana_historial",
                "pestana_base_datos_maestra"
              ]
            }
          }
        },
        "header": {
          "elementos": [
            "titulo_juego",
            "indicador_ronda_actual",
            "botones_control_sistema"
          ]
        }
      },
      "desempate": {
        "tipo": "vista_superpuesta",
        "componentes": ["titulo_desempate", "minijuego_activo", "tabla_resultados_intento"]
      },
      "cierre_partida": {
        "tipo": "modal_superpuesto",
        "componentes": [
          "encabezado_resultado",
          "podio_ganador",
          "seccion_ridiculizacion",
          "seccion_reto_final_vaso_completo",
          "tabla_estadisticas_finales",
          "botones_accion_final"
        ]
      }
    }
  }
}
```

---

## 6. Sistema de diseño

```json
{
  "skill_estilos_interfaz": {
    "posicionamiento_layout": {
      "estructura_principal": "Grid de tres columnas con cabecera fija y modal flotante de cierre",
      "columna_izquierda": {
        "ancho_relativo": "25%",
        "alineacion": "vertical_fija",
        "proposito": "Marcador global y estado de jugadores"
      },
      "columna_central": {
        "ancho_relativo": "50%",
        "alineacion": "centrada_foco",
        "proposito": "Acción del turno actual, reloj de trago, botones de decisión y confirmación del juez"
      },
      "columna_derecha": {
        "ancho_relativo": "25%",
        "alineacion": "vertical_colapsable",
        "proposito": "Historial de ronda y acceso a bases de datos"
      },
      "responsive": {
        "punto_de_quiebre": "768px",
        "comportamiento": "Una columna con pestañas inferiores"
      }
    },
    "jerarquia_colores": {
      "fondo_general": "#0F172A",
      "superficies_tarjetas": "#1E293B",
      "colores_estado": {
        "activo_exito": "#10B981",
        "accion_interactiva": "#3B82F6",
        "alerta_peligro": "#EF4444",
        "neutro_desactivado": "#64748B"
      },
      "texto": {
        "principal": "#F8FAFC",
        "secundario": "#94A3B8"
      }
    },
    "tipografia_y_escalas": {
      "familia_fuente": "Inter, system-ui, sans-serif",
      "escalas": {
        "h1_titulo_principal": { "tamano": "24px", "peso": "700" },
        "h2_subtitulo_seccion": { "tamano": "18px", "peso": "600" },
        "cuerpo_texto": { "tamano": "14px", "peso": "400" },
        "etiqueta_boton": { "tamano": "14px", "peso": "600", "transformacion": "mayusculas" }
      }
    },
    "esquema_central_componentes": {
      "botones_decision": {
        "orden_visual": "Horizontal de izquierda a derecha (Aceptar -> Comodín -> Negar)",
        "contraste_requerido": "Alto contraste para el estado activo, opacidad del 50% para estados deshabilitados",
        "relleno_padding": "12px 24px",
        "radio_borde": "8px"
      },
      "reloj_trago": {
        "contenido": "Número grande con la cuenta regresiva de trago_segundos hasta 0",
        "color": "accion_interactiva",
        "restriccion": "Solo visual, sin efecto en el puntaje"
      },
      "panel_confirmacion_juez": {
        "botones": "Cumplió (activo_exito) y No cumplió (alerta_peligro)",
        "visible_cuando": "turno.paso es confirmacion"
      },
      "pestanas_soporte": {
        "indicador_activo": "Borde inferior subrayado de 2px con color de acento primario",
        "transicion": "Cambio de estado instantáneo sin pérdida de scroll"
      },
      "fichas_jugadores": {
        "indicador_descalificacion": "Tachado visual con superposición de color rojo semitransparente e icono de expulsión",
        "indicador_castigo": "Insignia roja con el texto del castigo y las rondas que faltan"
      },
      "seccion_ridiculizacion": {
        "estilo": "Tarjetas con borde alerta_peligro y etiqueta de burla en tono de juego"
      }
    },
    "accesibilidad": {
      "regla": "El color #64748B sobre #1E293B (contraste cercano a 3:1) solo se usa en estados deshabilitados, nunca en texto informativo"
    }
  }
}
```

---

## 7. Convenciones para agentes

- La lógica vive en `src/logic` como funciones puras. Los componentes solo muestran estado y despachan acciones al reducer.
- Los textos de la interfaz van en español. Los campos del estado conservan los nombres de la sección 4.
- Los textos de burla de la ridiculización viven en `src/ui/burlas.js`, son de tono juguetón y no atacan a la persona.
- No hay actividades, comodines ni castigos escritos en el código. Los archivos de `public/ejemplos/` son solo para desarrollo y pruebas.
- Toda aleatoriedad pasa por una función `rng` inyectable, para poder probar la lógica con resultados fijos.
- Los botones deshabilitados se muestran al 50 % de opacidad. Un comodín sin existencias nunca fuerza otra opción.
- Los colores y la tipografía salen de los tokens de la sección 6, no de valores sueltos.

---

## 8. Pruebas mínimas

Cada punto se cubre con pruebas de Vitest en `tests/`:

1. El orden de turnos es J1..JN, salta descalificados y retirados, y reinicia con J1 al cerrar la ronda.
2. Aceptar y confirmar «Cumplió» suma `trago_segundos` y `actividades_cumplidas`.
3. Negarse suma igual `trago_segundos`, suma un punto negativo y crea un castigo activo.
4. Un comodín `salvar` no suma segundos y un comodín `cambiar` usa su propio trago.
5. Con `comodines == 0` la opción de comodín no se puede ejecutar.
6. Al cerrar cada ronda los contadores de castigos bajan en 1 y se liberan al llegar a 0.
7. Un jugador puede tener varios castigos activos con contadores independientes.
8. Negarse a cumplir un castigo descalifica de inmediato y saca al jugador del orden.
9. Terminar con `actividades_cumplidas == 0` descalifica al cierre.
10. Gana el menor `liquido_acumulado` entre no descalificados, aunque tenga castigos.
11. Un empate en el primer lugar activa el desempate y tras 3 intentos declara ganadores compartidos.
12. El vaso completo final lo beben quienes tienen `puntos_negativos > 0`, los descalificados y quien no bebió nada.
13. La validación rechaza archivos sin columnas obligatorias y omite filas inválidas con su motivo.
14. Todos descalificados da «partida sin ganador»; un solo jugador activo termina la partida.

---

## 9. Límites

- No agregar dependencias sin aprobación.
- No cambiar las columnas esperadas de los archivos sin actualizar la sección 3.2 y la validación.
- No guardar datos de los jugadores fuera de la memoria de la sesión.
- No omitir la advertencia +18 ni el botón **Retirarme**.
- No modificar las reglas de las secciones 3 y 4 sin actualizar antes este documento.

---

## 10. Supuestos por confirmar

Decisiones que tomé para cerrar huecos que no se habían definido de forma explícita:

1. Un comodín `cambiar` usa su texto como actividad sustituta, con su propio `trago_segundos`.
2. Las actividades, los comodines y los castigos no se repiten hasta agotar la lista.
3. Un castigo con `duracion_rondas` igual a 0 se cumple en el momento y negarse a cumplirlo descalifica.
4. El contador de un castigo baja al cerrar cada ronda, incluida aquella en la que se recibió.
5. Límites de validación: de 2 a 12 jugadores, de 1 a 50 rondas, nombres únicos y no vacíos.
6. La partida termina antes si queda un solo jugador activo, y el reinicio ofrece misma configuración o nueva configuración.
7. Existe el botón **Retirarme** y el estado `retirado`.