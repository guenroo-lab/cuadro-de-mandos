# CLAUDE.md — Sistema TAISA / Leroy Merlin Málaga

> Contexto maestro del proyecto. Léelo entero antes de tocar nada.

---

## Qué es esto

Suite de **Google Apps Script** que automatiza la operativa logística de la **Plataforma Leroy Merlin Málaga** (operada por TAISA). Vive dentro de un único Google Sheet, organizada en módulos `.gs` independientes. Cubre dos grandes sistemas:

1. **Gestión de Inventario / Pedido Cliente** — auditoría semanal de ubicaciones, detección de retrasos, correos a equipo/responsables/tiendas, e informes mensuales de ocupación.
2. **Dashboard de Incidencias** — panel diario y correos mensuales de incidencias de Pedido Cliente, cruzando incidencias contra pedidos recepcionados.

El usuario (Pedro) es Head of Logistics Operations, **no programador**. Se considera "visionario de necesidades operativas". Construye todo iterando con la IA. Quiere soluciones completas listas para pegar, no fragmentos.

---

## Cómo trabajar en este proyecto (MUY IMPORTANTE)

- **Español siempre.** Tono directo, sin rodeos, sin preámbulos ni resúmenes de cierre largos.
- **Arquitectura modular.** Un archivo `.gs` por funcionalidad. NUNCA metas todo en uno. Si se modifica algo, no debe romper lo que ya funciona.
- **Entregar archivos completos listos para pegar**, no fragmentos sueltos (salvo que se pida un cambio de una línea muy concreto).
- **Un solo `onOpen`** en todo el proyecto (está en `Configuracion.gs`). Google solo ejecuta uno; si hay dos, el segundo se ignora.
- **Variables globales compartidas** entre módulos: como Apps Script comparte el ámbito global entre todos los `.gs`, las variables de `Configuracion.gs` (correos, colores, `MODO_PRUEBA`...) son visibles desde cualquier módulo. No las redeclares.
- Para arreglar un bug, pedir el `.gs` afectado + el log exacto del error de ejecución de Apps Script.
- **Diseño corporativo TAISA** en todos los correos (ver más abajo). Es obligatorio y consistente.

---

## MODO_PRUEBA — interruptor de seguridad

En `Configuracion.gs`:
```javascript
var MODO_PRUEBA   = false;   // true = todo llega solo a Pedro
var CORREO_PRUEBA = "pedro.gil@ext.leroymerlin.es";
```
Con `true`, TODOS los correos (los 4 del jueves + dashboard + PC Total) se redirigen solo a `CORREO_PRUEBA` con `[PRUEBA]` en el asunto. `DASHBOARD_CONFIG.MODO_PRUEBA` y `EMAIL_PRUEBA` heredan de los globales. Dejar siempre en `false` tras probar. Los triggers respetan el valor en el momento de dispararse.

---

## Estructura de módulos (archivos en /src)

| Archivo | Contenido |
|---|---|
| `Configuracion.gs` | Variables globales, TODOS los correos, estilos HTML base compartidos (`htmlEstilosBase`, `htmlHeader`, `htmlFooter`, `htmlKpi`), `formatearFechaCorta`, y el **`onOpen` unificado** (2 menús). |
| `Auditoria.gs` | `ejecutarAuditoriaCompleta` (auditoría semanal con **regla X/J condicional**), `actualizarInformeMensualPC`, `enviarCorreoMensualPCTotal`, `ejecutarEnvioDia24`, `formatNombreTienda`. |
| `CorreosSemanales.gs` | Los 3 correos: `enviarCorreoRetrasos`, `enviarCorreoResumenSemanal`, `enviarCorreoRevisionTienda`. |
| `GenerarMensual.gs` | `generarResumenMensualPlataforma` (resumen pedidos/retrasos por mes + hojas `DATA_RET_`). |
| `EnviarMensualCSV.gs` | `enviarCorreoMensualTiendas` (correo mensual a tiendas con adjunto CSV de retrasos). |
| `DASHBOARD.gs` | Todo el sistema de incidencias: panel visual + informes mensuales global/tienda + triggers del dashboard. (Renombrado desde `DashboardIncidencias.gs` — el archivo llevaba tiempo como `DASHBOARD` en el editor de Apps Script sin sincronizar; se alineó el nombre local el 2026-07-09.) |
| `ImportacionAutomatica.gs` | Importación de Excel desde Drive, snapshot semanal, **orquestador del jueves**, diagnóstico, trigger jueves. |
| `Utilidades.gs` | `getWeekNumber`, `limpiarHojasTiendas`. |
| `CotejoHodos.gs` | `consultarEstadoHodos(numerosPedido)` — cruza pedidos contra HODOS (Supabase `dbxlrnupiwemnarlxmcv`, tablas `public.etiquetas`/`public.cargas`) para saber si un pedido está Creado / Enviado / Enviado (camión cerrado) / **Recepcionado por tienda** / Sin registro. Usado en `enviarCorreoRevisionTienda` (columna "Estado HODOS"). Requiere propiedad de script `SUPABASE_SERVICE_KEY` (legacy JWT de service_role, NO la `sb_secret_` nueva — bloquea `UrlFetchApp`, ver gotcha en memoria). HODOS no tiene un estado explícito de "recepcionado" — se DERIVA: carga `CERRADA` + ya ha pasado `fecha_entrega`+`horario` (la hora que Pedro marca como recepción prevista) ⇒ Recepcionado por tienda; si aún no ha pasado esa hora, se queda en "Enviado (camión cerrado)". `diagnosticarCotejoHodos()` para probar la conexión a mano. |
| `appsscript.json` | Manifiesto. **Drive API v3 activada** (necesaria para convertir los .xlsx). |

---

## IDs y configuración clave

```
Sheet del Dashboard de incidencias (ID_HOJA_FUENTE):   1AWfwBTcYxqqJQEnDjjir_LshBaMFTDGNu3LSSbNJEd8
  - Pestaña de datos: "Incidencias"
Sheet de operaciones (ID_HOJA_OPERACIONES):            1HIYNp2SSpXbIvwfRpFcHI7y4rqZqcrEUu8d-_4WTpeY
  - Pestañas por mes: "Enero 2026", "Febrero 2026"...
Carpeta Drive de inventarios (CARPETA_INVENTARIOS_ID): 1_1muNRzTzLrgSLyZdWtpf7GJeRqbplIG
Logo TAISA (LOGO_URL):                                 https://drive.google.com/uc?export=view&id=1gLmvgxjskQeajriLzpWH1ag-h387vJ_o
```

### Tiendas y códigos
| Tienda | Código Excel | Color | Cód. revisión |
|---|---|---|---|
| Marbella | `014.xlsx` | `#c9daf8` (azul) | 014 |
| Málaga | `036.xlsx` | `#d9ead3` (verde) | 036 |
| Granada | `043.xlsx` | `#ffe599` (amarillo) | 279¹ |
| Mijas | `279.xlsx` | `#e4d0ff` (morado) | 279 |

¹ Granada no está en `CODIGOS_REVISION` (no tiene circuito de revisión por ubicar propio); sí está en importación, snapshot, auditoría y dashboard.

---

## Estructura de datos de las pestañas de tienda (MARBELLA/MALAGA/GRANADA/MIJAS)

Volcado directo de los Excel. Columnas usadas por el código (índice 0-based):
- **Col A (0)** = Ubicación / dirección (ej. `X`, `J2`, `VL036...`, `TOR`, `ANTEQ`, ubicación de plataforma — ver reglas de negocio #7 y #8)
- **Col B (1)** = Pedido (ID)
- **Col C (2)** = Sección
- **Col E (4)** = Código SAP
- **Col F (5)** = Descripción
- **Col J (9)** = Importe €
- **Col L (11)** = Fecha

`DIRECCIONES` = pestaña con ubicaciones EXTRA que cuentan como "plataforma" (col A). Desde 2026-10-14 ya no es la única fuente: ver regla #9.

---

## Reglas de negocio críticas

### 1. Regla de retrasos X/J condicional (lo más delicado)
En `ejecutarAuditoriaCompleta`:
- **Retraso DIRECTO** (siempre cuenta): ubicaciones L, M, V, S y variantes (`L1..L3`, `LUNE`, `M1..M3`, `MART`, `V1..V3`, `VIER`, `S`, `SABA`).
- **Retraso CONDICIONAL** (X y J = Miércoles/Jueves): `X, X1..X3, MIER, MIÉR, J, J1..J3, JUEV`. **Solo cuenta como retraso si ese pedido ya estaba en esa misma ubicación la semana anterior** (se comprueba contra `SNAPSHOT_SEMANAL` vía `leerSnapshotAnterior()` + `claveSnap(tienda, ubicacion, pedido)`).
- **Semana 1**: no existe snapshot → ningún X/J cuenta como retraso (correcto). Al final del proceso se guarda el snapshot para la semana siguiente.

### 2. Snapshot semanal
`guardarSnapshotSemanal()` guarda en la hoja oculta `SNAPSHOT_SEMANAL` qué pedido estaba en qué ubicación de día (L/M/X/J/V/S) esta semana. Es la memoria que permite la regla X/J. La clave es `claveSnap()` (definida en `ImportacionAutomatica.gs`, usada también por `Auditoria.gs`).

### 3. Filtro "Devolución" (dashboard incidencias)
En el dashboard, la **columna C** del Sheet de incidencias: si vale "Devolución" (con o sin tilde), la fila NO se cuenta como incidencia (`dashEsDevolusion`).

### 4. Margen anteayer (resumen mensual)
`generarResumenMensualPlataforma` cuenta retraso solo a partir de **anteayer** (`hoy.setDate(hoy.getDate() - 1)`), para dar un día de margen.

### 5. Normalización de tiendas
`dashNormalizarTienda` / `normalizarTienda`: "Malaga", "Málaga 1", "Málaga 2" → **"Málaga"**. Igual para Marbella/Mijas/Granada. Quita tildes para comparar.

### 6. Ratio incidencias / pedidos (dashboard)
El dashboard cruza incidencias (Sheet incidencias) contra pedidos recepcionados (Sheet operaciones, filas `tipo === "Recepción"`, mapeadas por `ORIGEN_TIENDA`: "LM Málaga" → "Málaga", etc.). Umbral de alerta: ratio > 5% se pinta en rojo.

### 7. Ubicaciones transitorias de plataforma — TOR / VALEN / ANTEQ (2026-08-31)
Origen de la mercancía: Torija, Valencia y Antequera envían pedidos a la plataforma de Málaga antes de repartirlos a tienda. Dos formas de aparecer en la columna A (ubicación):
- **"De plataforma" (con transporte)**: valor EXACTO `TOR`, `VALEN` o `ANTEQ` (constante `UBICACIONES_TRANSITORIAS_PLATAFORMA` en `Configuracion.gs`). Si aparece, se avisa al **equipo** de inmediato (sin memoria de semana anterior) en el apartado **"🚧 Arrastres"** del correo semanal de retrasos (`enviarCorreoRetrasos`), separado de la tabla normal de retrasos porque es un *posible* retraso, no confirmado. En `ejecutarAuditoriaCompleta` estas líneas se escriben en `RETRASOS_EQUIPO` bajo la cabecera `"ARRASTRES: <tienda>"`.
- **"Sin transporte, directo a tienda"**: prefijo `[origen][día][código tienda]` — origen `V`=Valencia, `T`=Torija, `A`=Antequera; día `L,M,X,J,V`; código de `CODIGOS_REVISION`. Constante `PREFIJOS_ORIGEN_TIENDA` en `Configuracion.gs` (incluye ya Antequera: `AL,AM,AX,AJ,AV`). Van al correo de tienda "líneas pendientes de ubicar" (`enviarCorreoRevisionTienda`).

### 8. Memoria "por ubicar" de tienda — VX/VJ/TX/TJ/AX/AJ (2026-08-31)
Igual que la regla X/J del equipo (#1), pero para el lado tienda: los prefijos de Miércoles/Jueves (`PREFIJOS_ORIGEN_TIENDA_EXCLUIR_XJ` = `VX,VJ,TX,TJ,AX,AJ` + código tienda) se **excluyen** del correo de "líneas pendientes de ubicar" la primera semana que aparecen (24h de margen para gestionarlos). Si el mismo pedido sigue en la misma ubicación la semana siguiente, se incluye **destacado** (fila roja + badge "⏳ YA ESTABA") en el mismo correo de esa tienda.
- Memoria en hoja **propia y separada** `SNAPSHOT_UBICAR_TIENDAS` (NO comparte hoja con `SNAPSHOT_SEMANAL` del equipo) — `leerSnapshotTiendasUbicarAnterior()` / `guardarSnapshotTiendasUbicar()` en `ImportacionAutomatica.gs`.
- En `ejecutarAuditoriaCompleta`, estas líneas destacadas se escriben en `Revision_tienda` bajo la cabecera `"ARRASTRE UBICAR: <tienda>"` (distinta de `"REVISIÓN POR UBICAR: <tienda>"`).
- El guardado del snapshot (paso 9 del jueves) se omite si falló la importación o la auditoría, igual que el snapshot del equipo (paso 8).

### 9. Qué es "ubicación de plataforma" — regla automática (2026-10-14)
Antes solo contaba lo escrito en `DIRECCIONES` (lista manual que se quedaba corta: ubicaciones nuevas como 24000, 25148 o X234A no sumaban y los totales salían más bajos que los reales). Ahora `esUbicacionPlataforma_(dir, setExtra)` (en `Configuracion.gs`) da `true` si la ubicación: (1) es solo numérica, (2) empieza por X, (3) es etiqueta de día (`ETIQUETAS_RETRASO_DIRECTO` L,M,V,S y variantes LUNE/MART/MARTE/VIER/SAB/SABA + `ETIQUETAS_RETRASO_CONDICIONAL` X,J y variantes MIER/MIÉR/JUEV), o (4) está en `DIRECCIONES` (casos especiales: `1412A`, `VJ279`...). Lo usan `ejecutarAuditoriaCompleta` y `generarResumenMensualPlataforma`.
- Las etiquetas de día viven SOLO en `Configuracion.gs` (la regla de retraso X/J de la #1 no cambia): `esEtiquetaRetrasoDirecto_` (L,M,V,S + variantes), `esEtiquetaRetrasoCondicional_` (X,J + variantes) y `esEtiquetaDia_` (ambas, usada también por el snapshot). Aceptan **letra + cualquier número** (L1, L2, L12, X7, J4...) además de los nombres (LUNE, MART, MARTE, MIER, JUEV, VIER, SAB, SABA).
- TOR / VALEN / ANTEQ (regla #7) NO son plataforma: siguen yendo aparte a "Arrastres".
- La auditoría deja en el log (`Logger.log`) las ubicaciones contadas por regla que no están en `DIRECCIONES`.

---

## Correos: quién recibe qué

### Inventario (los 4 del jueves)
- **Retrasos equipo** (`enviarCorreoRetrasos`) → `CC_COMUN` (equipo interno). Incluye el apartado "🚧 Arrastres" (ver regla #7) cuando hay ubicaciones TOR/VALEN/ANTEQ esa semana.
- **Resumen responsables** (`enviarCorreoResumenSemanal`) → jose-manuel.lachambre + CC `CC_COMUN`.
- **Revisión a tiendas** (`enviarCorreoRevisionTienda`) → `DESTINATARIOS_TIENDAS[tienda].to` + CC `CC_COMUN`. Solo MARBELLA/MALAGA/MIJAS (Granada no tiene revisión por ubicar). Puede incluir líneas destacadas "⏳ YA ESTABA" (ver regla #8).
- **Mensual a tiendas** (`enviarCorreoMensualTiendas`) → `DESTINATARIOS_MENSUAL[tienda]` + CC `CC_COMUN` + adjunto CSV de retrasos.

### Dashboard incidencias
- **Informe global** (`enviarInformesMensuales`) → `EMAILS_DASHBOARD.GLOBAL` + CC `CC_DASHBOARD`.
- **Informe por tienda** → `EMAILS_DASHBOARD[TIENDA]` (solo sus incidencias) + CC `CC_DASHBOARD`.
- El informe de tienda **NO** muestra % sobre total red ni ranking (no es equitativo: las tiendas tienen volúmenes distintos). En su lugar: total, media diaria, vs mes anterior, día crítico, top 3, evolución 6 meses.
- En el texto del informe siempre se dice **"Plataforma Leroy Merlin Málaga"** (la plataforma de Pedro), nunca "Plataforma de {tienda}".
- Asuntos llevan "Pedido Cliente": `📊 Informe Global Incidencias Pedido Cliente — Mes Año` y `📋 Incidencias Pedido Cliente {Tienda} — Mes Año`.

---

## Calendario de triggers automáticos

| Cuándo | Función | Qué hace | Lo instala |
|---|---|---|---|
| **Jueves 12:00** | `procesoAutomaticoJueves` | Importa 4 Excel → auditoría → genera resumen mensual → envía los 4 correos → guarda snapshots (equipo + tiendas por ubicar) | `instalarTriggerJueves` |
| **Día 1, 10:00** | `ejecutarInformeMensualAutomatico` | Informe mensual de incidencias (global + por tienda) | `instalarTriggers` (menú Dashboard) |
| **Día 24, 9:00** | `ejecutarEnvioDia24` | Informe PC Total (chequea internamente que sea día 24) | `instalarTriggers` |
| **Diario 6:00** | `ejecutarDashboardDiario` | Refresca el panel visual DASHBOARD (no envía correo) | `instalarTriggers` |

**Hay que ejecutar DOS instaladores** (una vez cada uno): `instalarTriggerJueves` y `instalarTriggers`.

El orquestador del jueves usa `_pasoAuto()`: ejecuta cada paso capturando errores. Los correos terminan con un `alert` de UI que falla bajo trigger, pero el correo ya se envió → se registra como OK (no es error real).

---

## Sistema de diseño TAISA (correos HTML)

Obligatorio y consistente en todos los correos. Dos familias de estilos:
- Inventario: estilos inline + helpers `htmlEstilosBase/htmlHeader/htmlFooter/htmlKpi` en `Configuracion.gs`.
- Dashboard: `dashEstilos/dashHtmlHdr/dashHtmlFtr/dashKpi` en `DashboardIncidencias.gs`.

Paleta:
- Fondo principal `#0a0b10` / cuerpo `#111520` / tarjetas `#181d2c`
- Acento corporativo (naranja/dorado) `#f5a623`
- Verde OK `#2ecc71` · Rojo alerta `#e74c3c` · Ámbar `#f39c12`
- Texto claro `#f0f2f8` / secundario `#7a8299`
- Cabecera con logo TAISA + divisor + título + meta. Footer con fecha + badge PRODUCCIÓN/PRUEBA.
- Semáforo de tendencia (`.sem.v/.r/.a`), KPIs en tabla (`.kg/.kpi`), top-3 con medallas 🥇🥈🥉, tablas con filas alternas, barras de evolución.

Nota: el dashboard VISUAL (hoja DASHBOARD dentro del Sheet) usa otra paleta (azules `#1a1a2e/#16213e/#0f3460` + dorado `#f5a623`), con gráfico de rosca (PIE + pieHole 0.5). No confundir con los correos.

---

## Hojas que genera el sistema (dentro del Sheet de inventario)

- `RESUMEN_SEMANAL`, `Revision_tienda`, `RETRASOS_EQUIPO` — las regenera la auditoría.
- `HISTORICO_SEMANAL` — acumulado semanal (append).
- `INFORME_MENSUAL_PC_TOTAL` — ocupación por sección/semana, **ventana móvil de las últimas 4 semanas** (2026-08-31: ya NO se limpia al cambiar de mes — antes sí, ahora se mantiene siempre 4 semanas aunque crucen de mes). Columnas FIJAS por tienda: 2-5 = las 4 semanas (más antigua→más reciente, "" = hueco), 6 = Promedio. Al entrar una 5ª semana se descarta la más antigua (desplaza 1 col a la izquierda). Z1 ya no controla nada, solo es un texto informativo de la última actualización. `actualizarInformeMensualPC` (Auditoria.gs) incluye una migración automática de una sola vez desde el layout antiguo (Promedio en columna variable) — no tocar esa parte sin entender el porqué.
- `RESUMEN_PEDIDO_MESES` + `DATA_RET_{TIENDA}` (ocultas) — resumen mensual de pedidos/retrasos.
- `SNAPSHOT_SEMANAL` (oculta) — memoria para la regla X/J del equipo.
- `SNAPSHOT_UBICAR_TIENDAS` (oculta) — memoria separada para la regla X/J del lado tienda (VX/VJ/TX/TJ/AX/AJ, ver regla de negocio #8).
- En el Sheet de incidencias: `DASHBOARD` (panel visual) e `HISTORIAL` (acumulado diario en JSON).

---

## Bugs ya resueltos (no reintroducir)

1. **`Drive is not defined`** → activar Drive API v3 en Servicios (ya está en `appsscript.json`).
2. **Valor total Mijas disparado** (salía como fecha año 2315): la celda "VALOR TOTAL" heredaba formato fecha. Fix: `setNumberFormat("#,##0")` tras escribir, en `generarResumenMensualPlataforma`. Si vuelve a pasar, borrar la hoja `RESUMEN_PEDIDO_MESES` entera y regenerar (clear() no quita formato heredado).
3. **`.setNumRows is not a function`** en gráficos: el rango ya define tamaño; no usar `.setNumRows()/.setNumColumns()`.
4. **`Cannot call SpreadsheetApp.getUi()`**: pasa al ejecutar bajo trigger o con el Excel abierto. En funciones de diagnóstico usar `Logger.log`. En el orquestador ya está manejado por `_pasoAuto`.
5. **Correo "Revisión líneas sin ubicar" con columnas incompletas / filas en blanco** (2026-07-09): `enviarCorreoRevisionTienda` decidía qué columnas pintar mirando si la fila de cabecera del Excel importado tenía texto en esa posición; si esa fila venía casi en blanco, el correo mostraba una sola columna suelta. Fix: columnas fijas por índice (`COLUMNAS_REVISION` en `CorreosSemanales.gs`), independientes del contenido del Excel de cada semana.
6. **Marcador de mes (Z1) de `INFORME_MENSUAL_PC_TOTAL` autoconvertido a fecha**: mismo patrón que el bug #2 de Mijas. Podía borrar el informe acumulado cada jueves en vez de solo al cambiar de mes. Fix: `setNumberFormat("@")` sobre Z1 antes de escribir, y comparación normalizada a `String()`.
7. **Importación de un Excel se cancelaba para las otras 3 tiendas**: `Object.keys(ARCHIVOS_TIENDA)` reordena `"279"` (Mijas) al principio (JS reordena claves numéricas canónicas); un fallo en su conversión abortaba el resto del bucle. Fix: recorrer `CODIGOS_TIENDA_ORDEN` (orden fijo) con try/catch por tienda en `importarInventarios` y `guardarSnapshotSemanal`.
8. **Snapshot semanal corrompiéndose si fallaba la importación/auditoría**: `guardarSnapshotSemanal` se ejecutaba siempre, aunque el paso 1 o 2 hubiesen fallado, grabando datos parciales como "estado de esta semana" y rompiendo la regla X/J la semana siguiente. Fix: `procesoAutomaticoJueves` omite el paso 8 si el 1 o el 2 devolvieron `❌`.
9. **Correo de retrasos (`enviarCorreoRetrasos`) con columnas Descripción/Fecha cruzadas**: usaba `f[4]`/`f[5]` en vez de `f[5]`/`f[11]`. También el nombre de tienda solo aparecía en la 1ª línea de cada bloque (se reseteaba tras cada fila). Ambos corregidos.
10. **"Demora media" del resumen mensual con 1 día menos de lo real**: `generarResumenMensualPlataforma` reutilizaba la variable `hoy` ya desplazada para el margen de "anteayer" también para medir la magnitud del retraso. Fix: variable `hoyReal` separada para ese cálculo.
11. **Colores de tendencia invertidos en el panel de incidencias** (`DASHBOARD.gs`): el KPI "vs mes anterior" del panel diario y la columna de tendencia de "Historial reciente" pintaban verde cuando empeoraba y rojo cuando mejoraba. Corregido para seguir la convención del proyecto (verde OK / rojo alerta).
12. **`dashComparativaMes` calculaba mal el "mes anterior" los días 31 de marzo/mayo/julio/octubre/diciembre**: `setMonth()` sin fijar antes el día desbordaba de vuelta al mes de origen. Fix: se fija el mes anterior empezando en día 1 y se recorta al último día real de ese mes.
13. **Evolución 6 meses / KPI de tienda mostraban flecha de bajada en verde cuando no había cambio** (mismo total que el mes de referencia): añadida rama explícita para diferencia = 0 en `dashHtmlComparativa` y `dashHtmlTienda`.
14. **KPI "Promedio mensual" del correo PC Total dividía siempre entre 4 tiendas**, aunque alguna no tuviera datos ese mes. Fix: divide entre `tiendasConDatos` (contador real de tiendas con bloque ese mes) en `enviarCorreoMensualPCTotal`.

---

## Cómo desplegar con clasp (local ↔ Apps Script)

Pedro trabaja en Apps Script web. Para sincronizar con local/Claude Code:

```bash
npm install -g @google/clasp
clasp login
# En el editor de Apps Script: Configuración del proyecto → copiar "ID de secuencia de comandos"
# Crear .clasp.json (ver .clasp.json.ejemplo) con ese scriptId y "rootDir": "src"
clasp pull   # baja el código actual del Sheet a /src
# ...editar archivos en /src...
clasp push   # sube los cambios al Sheet
```

`.clasp.json.ejemplo` incluido. Sustituir `PEGA_AQUI_TU_SCRIPT_ID`. El `scriptId` se saca de Apps Script → Configuración del proyecto → ID de secuencia de comandos.

> Importante: tras `clasp push`, recargar el Sheet para que aparezcan los menús (`onOpen`). Los triggers se instalan ejecutando los instaladores, no se crean solos al hacer push.

---

## Puesta en marcha rápida (checklist)

1. `clasp push` (o pegar manualmente los `.gs` en el editor).
2. Activar Drive API v3 (ya en manifiesto; si se pega a mano, Servicios + → Drive API).
3. Subir un Excel de prueba a la carpeta → ejecutar `diagnosticarCarpeta` → confirmar que lo ve.
4. `importarInventarios` → comprobar que se rellena la pestaña de tienda.
5. `MODO_PRUEBA = true` → ejecutar `procesoAutomaticoJueves` → verificar que los 4 correos llegan solo a Pedro.
6. `MODO_PRUEBA = false` → ejecutar `instalarTriggerJueves` + `instalarTriggers`.

---

## Glosario operativo

- **PC / Pedido Cliente**: operativa de pedidos de cliente que pasan por la plataforma hacia las tiendas.
- **Plataforma**: la plataforma logística de Málaga (TAISA) que sirve a las 4 tiendas.
- **Ubicación de día (L/M/X/J/V/S)**: indica el día comprometido. Si un pedido sigue en una ubicación de día pasada (o X/J ya estaba la semana previa), es retraso.
- **Líneas por ubicar / revisión**: pedidos con prefijos `VL/VM/VX/VJ/VV/TL/TM/TX/TJ/TV` + código de tienda (origen Torija "T" y Valencia "V"), pendientes de ubicar en tienda.
