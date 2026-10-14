// ==========================================
// MÓDULO: CONFIGURACION (Config global)
// ==========================================

var MODO_PRUEBA   = false;
var CORREO_PRUEBA = "pedro.gil@ext.leroymerlin.es";

var LOGO_URL = "https://drive.google.com/uc?export=view&id=1gLmvgxjskQeajriLzpWH1ag-h387vJ_o";

var COLORES_TIENDA = {
  "GRANADA":  "#ffe599",
  "MALAGA":   "#d9ead3",
  "MARBELLA": "#c9daf8",
  "MIJAS":    "#e4d0ff"
};

var CODIGOS_REVISION = {
  "MARBELLA": "014",
  "MALAGA":   "036",
  "MIJAS":    "279"
};

// ==========================================
// UBICACIONES TRANSITORIAS — Torija / Valencia / Antequera
// ==========================================
// "De plataforma" (con transporte): valor EXACTO de la ubicación. Si aparece,
// se avisa al equipo como posible retraso en el apartado "Arrastres" del
// correo semanal — aviso inmediato, sin memoria de semana anterior.
var UBICACIONES_TRANSITORIAS_PLATAFORMA = ["TOR", "VALEN", "ANTEQ"];

// "Sin transporte, directo a tienda": prefijo de origen + día + código de
// tienda (ej. "VL014" = Valencia + Lunes + Marbella). V=Valencia, T=Torija,
// A=Antequera. Días: L,M,X,J,V. Se combinan con CODIGOS_REVISION al vuelo.
var PREFIJOS_ORIGEN_TIENDA = ["VL","VM","VX","VJ","VV","TL","TM","TX","TJ","TV","AL","AM","AX","AJ","AV"];

// De esos prefijos, los de Miércoles/Jueves (X/J) se excluyen la primera
// semana que aparecen — solo se informan a la tienda si el mismo pedido ya
// estaba en esa misma ubicación la semana anterior (memoria en la hoja
// SNAPSHOT_UBICAR_TIENDAS). Mismo criterio de 24h que usa el equipo para X/J.
var PREFIJOS_ORIGEN_TIENDA_EXCLUIR_XJ = ["VX","VJ","TX","TJ","AX","AJ"];

// ==========================================
// UBICACIONES DE PLATAFORMA — regla automática (ya no depende solo de DIRECCIONES)
// ==========================================
// Una ubicación es de plataforma si cumple CUALQUIERA de estas:
//   1. Es solo numérica (ej. 24000, 1412)
//   2. Empieza por X (ej. X234A, X, X1)
//   3. Es una etiqueta de día (L,M,X,J,V,S y variantes: LUNE, MART, MARTE, MIER, JUEV, VIER, SAB...)
//   4. Está escrita en la pestaña DIRECCIONES (sigue valiendo para casos especiales, ej. 1412A, VJ279)
// Las transitorias (TOR / VALEN / ANTEQ) NO son plataforma: se avisan aparte como "Arrastres".

// Retraso DIRECTO: siempre cuenta como retraso.
var ETIQUETAS_RETRASO_DIRECTO = [
  "L","L1","L2","L3","LUNE",
  "M","M1","M2","M3","MART","MARTE",
  "V","V1","V2","V3","VIER",
  "S","SAB","SABA"
];
// Retraso CONDICIONAL (X/J): solo cuenta si el pedido ya estaba ahí la semana anterior.
var ETIQUETAS_RETRASO_CONDICIONAL = [
  "X","X1","X2","X3","MIER","MIÉR",
  "J","J1","J2","J3","JUEV"
];

// Las etiquetas de día admiten CUALQUIER número detrás de la letra (L1, L2, L12, M3, X7, J4...):
// letra + dígitos, además de los nombres completos de las listas de arriba.
function esEtiquetaRetrasoDirecto_(dir) {
  return ETIQUETAS_RETRASO_DIRECTO.indexOf(dir) !== -1 || /^[LMVS]\d+$/.test(dir);
}
function esEtiquetaRetrasoCondicional_(dir) {
  return ETIQUETAS_RETRASO_CONDICIONAL.indexOf(dir) !== -1 || /^[XJ]\d+$/.test(dir);
}
function esEtiquetaDia_(dir) {
  return esEtiquetaRetrasoDirecto_(dir) || esEtiquetaRetrasoCondicional_(dir);
}

// Lee la pestaña DIRECCIONES (complemento manual). Si no existe, devuelve un set vacío.
function cargarDireccionesExtra_(ss) {
  var hoja = ss.getSheetByName("DIRECCIONES");
  if (!hoja) return new Set();
  return new Set(hoja.getRange("A:A").getValues().flat().filter(String)
    .map(function(d){ return d.toString().trim().toUpperCase(); }));
}

// ¿Esta ubicación (ya en mayúsculas y sin espacios) es de plataforma?
function esUbicacionPlataforma_(dir, setExtra) {
  if (!dir) return false;
  if (/^\d+$/.test(dir)) return true;
  if (dir.charAt(0) === "X") return true;
  if (esEtiquetaDia_(dir)) return true;
  return setExtra.has(dir);
}

var MESES_ES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
var NOMBRES_MESES_COMPLETOS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio",
                               "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

// ==========================================
// CORREOS — INVENTARIO
// ==========================================
var CC_COMUN = MODO_PRUEBA ? "" : [
  "jose-manuel.lachambre@leroymerlin.es",
  "jose-antonio.alcaide@ext.leroymerlin.es",
  "maria-auxiliadora.garcia@ext.leroymerlin.es",
  "pedidocliente.alm-malaga@leroymerlin.es",
  "david.delcampo@ext.leroymerlin.es",
  "sebastian.gelvis@ext.leroymerlin.es",
  "daniel.arrastio@ext.leroymerlin.es",
  "francisco-javier.camara@ext.leroymerlin.es"
].join(", ");

var DESTINATARIOS_TIENDAS = {
  "MARBELLA": {
    to: MODO_PRUEBA ? CORREO_PRUEBA : "pedcliente.marbella@leroymerlin.es, miguel-angel.gonzalez5@leroymerlin.es, jose-maria.marandino@leroymerlin.es, logistica.marbella@leroymerlin.es",
    cc: CC_COMUN
  },
  "MALAGA": {
    to: MODO_PRUEBA ? CORREO_PRUEBA : "adolfo.garcia@leroymerlin.es, javier.navarro@leroymerlin.es, pedcliente.malaga@leroymerlin.es, logistica.malaga@leroymerlin.es, carla.pianelli@leroymerlin.es",
    cc: CC_COMUN
  },
  "MIJAS": {
    to: MODO_PRUEBA ? CORREO_PRUEBA : "salvador.gonzalez2@leroymerlin.es, pedcliente.mijas@leroymerlin.es, logistica.mijas@leroymerlin.es",
    cc: CC_COMUN
  }
};

// ==========================================
// CORREOS — RESUMEN MENSUAL
// ==========================================
var DESTINATARIOS_MENSUAL = {
  "MARBELLA": MODO_PRUEBA ? CORREO_PRUEBA : [
    "pedcliente.marbella@leroymerlin.es",
    "miguel-angel.gonzalez5@leroymerlin.es",
    "jose-maria.marandino@leroymerlin.es",
    "logistica.marbella@leroymerlin.es",
    "comitedireccion.marbella@leroymerlin.es",
    "francisco-damian.sedeno@leroymerlin.es",
    "david.jimenez2@leroymerlin.es",
    "francisco.alvarez2@leroymerlin.es"
  ].join(", "),
  "MALAGA": MODO_PRUEBA ? CORREO_PRUEBA : [
    "adolfo.garcia@leroymerlin.es",
    "javier.navarro@leroymerlin.es",
    "pedcliente.malaga@leroymerlin.es",
    "logistica.malaga@leroymerlin.es",
    "carla.pianelli@leroymerlin.es",
    "fernando.ortega@leroymerlin.es",
    "carlos-javier.quesada@leroymerlin.es",
    "comitedireccion.malaga@leroymerlin.es"
  ].join(", "),
  "MIJAS": MODO_PRUEBA ? CORREO_PRUEBA : [
    "salvador.gonzalez2@leroymerlin.es",
    "pedcliente.mijas@leroymerlin.es",
    "logistica.mijas@leroymerlin.es",
    "hector.andres@leroymerlin.es",
    "david.jimenez2@leroymerlin.es",
    "comitedireccion.mijas@leroymerlin.es"
  ].join(", "),
  "GRANADA": MODO_PRUEBA ? CORREO_PRUEBA : [
    "pedro.lopez2@leroymerlin.es",
    "liliana.garcia@leroymerlin.es",
    "macarena.jimenez@leroymerlin.es"
  ].join(", ")
};

// ==========================================
// CORREOS — DASHBOARD INCIDENCIAS
// ==========================================
var DASHBOARD_CONFIG = {
  ID_HOJA_FUENTE:        "1AWfwBTcYxqqJQEnDjjir_LshBaMFTDGNu3LSSbNJEd8",
  ID_HOJA_OPERACIONES:   "1HIYNp2SSpXbIvwfRpFcHI7y4rqZqcrEUu8d-_4WTpeY",
  NOMBRE_HOJA_DATOS:     "Incidencias",
  NOMBRE_HOJA_DASHBOARD: "DASHBOARD",
  NOMBRE_HOJA_HISTORIAL: "HISTORIAL",
  COL_FECHA:      0,
  COL_TIENDA:     1,
  COL_TIPO_DOC:   2,
  COL_INCIDENCIA: 7,
  COL_OP_FECHA:    0,
  COL_OP_TIPO:     1,
  COL_OP_ORIGEN:   2,
  COL_OP_PEDIDOS:  29,
  MODO_PRUEBA:    MODO_PRUEBA,
  EMAIL_PRUEBA:   CORREO_PRUEBA
};

var EMAILS_DASHBOARD = {
  GLOBAL: MODO_PRUEBA ? CORREO_PRUEBA : [
    "jose-manuel.lachambre@leroymerlin.es",
    "jose-antonio.alcaide@ext.leroymerlin.es",
    "pedidocliente.alm-malaga@leroymerlin.es",
    "david.delcampo@ext.leroymerlin.es",
    "sebastian.gelvis@ext.leroymerlin.es",
    "daniel.arrastio@ext.leroymerlin.es",
    "francisco-javier.camara@ext.leroymerlin.es"
  ].join(", "),
  MALAGA: MODO_PRUEBA ? CORREO_PRUEBA : [
    "adolfo.garcia@leroymerlin.es",
    "javier.navarro@leroymerlin.es",
    "pedcliente.malaga@leroymerlin.es",
    "logistica.malaga@leroymerlin.es",
    "carla.pianelli@leroymerlin.es"
  ].join(", "),
  MARBELLA: MODO_PRUEBA ? CORREO_PRUEBA : [
    "pedcliente.marbella@leroymerlin.es",
    "miguel-angel.gonzalez5@leroymerlin.es",
    "jose-maria.marandino@leroymerlin.es",
    "logistica.marbella@leroymerlin.es"
  ].join(", "),
  MIJAS: MODO_PRUEBA ? CORREO_PRUEBA : [
    "salvador.gonzalez2@leroymerlin.es",
    "pedcliente.mijas@leroymerlin.es",
    "logistica.mijas@leroymerlin.es"
  ].join(", "),
  GRANADA: MODO_PRUEBA ? CORREO_PRUEBA : [
    "pedro.lopez2@leroymerlin.es",
    "liliana.garcia@leroymerlin.es",
    "macarena.jimenez@leroymerlin.es"
  ].join(", ")
};

var CC_DASHBOARD = MODO_PRUEBA ? "" : [
  "jose-manuel.lachambre@leroymerlin.es",
  "jose-antonio.alcaide@ext.leroymerlin.es",
  "pedidocliente.alm-malaga@leroymerlin.es",
  "david.delcampo@ext.leroymerlin.es",
  "sebastian.gelvis@ext.leroymerlin.es",
  "daniel.arrastio@ext.leroymerlin.es",
  "francisco-javier.camara@ext.leroymerlin.es"
].join(", ");

// ==========================================
// ESTILOS BASE — compartidos por todos los correos
// ==========================================
function htmlEstilosBase() {
  return '<style>' +
    '*{margin:0;padding:0;box-sizing:border-box}' +
    'body{font-family:Arial,sans-serif;background:#060608}' +
    '.wrap{max-width:740px;margin:0 auto;background:#0a0b10;border-radius:14px;overflow:hidden}' +
    '.hdr{background:#0a0b10;padding:28px 36px 20px;border-bottom:1px solid rgba(245,166,35,.12)}' +
    '.hdr-top{display:flex;align-items:center;gap:14px;margin-bottom:10px}' +
    '.hdr-logo{height:36px}' +
    '.hdr-div{width:1px;height:36px;background:rgba(245,166,35,.2);flex-shrink:0}' +
    '.hdr-txt h1{color:#f5a623;font-size:18px;font-weight:700;line-height:1.2}' +
    '.hdr-txt p{color:#7a8299;font-size:12px;margin-top:2px}' +
    '.hdr-meta{display:flex;gap:14px;flex-wrap:wrap}' +
    '.hdr-meta span{font-size:11px;color:#3d4560;letter-spacing:.4px}' +
    '.hdr-meta strong{color:#7a8299}' +
    '.body{background:#111520;padding:28px 36px}' +
    '.intro{border-left:3px solid #f5a623;padding:15px 18px;background:rgba(245,166,35,.04);border-radius:0 10px 10px 0;margin-bottom:26px;color:#c0c6d8;font-size:13.5px;line-height:1.85}' +
    '.intro strong{color:#f5a623;font-weight:600}' +
    '.sem{display:flex;align-items:center;gap:11px;padding:12px 16px;border-radius:10px;margin-bottom:24px;border:1px solid}' +
    '.sem.v{background:rgba(46,204,113,.06);border-color:rgba(46,204,113,.2)}' +
    '.sem.r{background:rgba(231,76,60,.06);border-color:rgba(231,76,60,.2)}' +
    '.sem.a{background:rgba(243,156,18,.06);border-color:rgba(243,156,18,.2)}' +
    '.sem .dot{width:9px;height:9px;border-radius:50%;flex-shrink:0}' +
    '.sem.v .dot{background:#2ecc71;box-shadow:0 0 7px #2ecc71}' +
    '.sem.r .dot{background:#e74c3c;box-shadow:0 0 7px #e74c3c}' +
    '.sem.a .dot{background:#f39c12;box-shadow:0 0 7px #f39c12}' +
    '.sem.v p{color:#2ecc71;font-size:13px;font-weight:600}' +
    '.sem.r p{color:#e74c3c;font-size:13px;font-weight:600}' +
    '.sem.a p{color:#f39c12;font-size:13px;font-weight:600}' +
    '.kg{display:table;width:100%;border-spacing:10px;border-collapse:separate;margin-bottom:26px}' +
    '.kr{display:table-row}' +
    '.kpi{display:table-cell;background:#181d2c;border:1px solid rgba(245,166,35,.12);border-radius:11px;padding:16px 12px;text-align:center;width:25%}' +
    '.kv{font-size:26px;font-weight:700;line-height:1;margin-bottom:5px}' +
    '.kl{font-size:10px;color:#7a8299;letter-spacing:.7px;text-transform:uppercase}' +
    '.ac{color:#f5a623}.gr{color:#2ecc71}.rd{color:#e74c3c}.wh{color:#f0f2f8}' +
    '.hl{background:#181d2c;border:1px solid rgba(245,166,35,.12);border-radius:11px;padding:15px 18px;display:flex;align-items:center;gap:13px;margin-bottom:26px}' +
    '.hl-ic{font-size:24px}' +
    '.hl-lb{font-size:10px;color:#7a8299;letter-spacing:.7px;text-transform:uppercase;margin-bottom:3px}' +
    '.hl-vl{font-size:16px;font-weight:700;color:#f5a623}' +
    '.hl-vl span{color:#7a8299;font-size:12px;font-weight:400}' +
    '.sec{font-size:11px;font-weight:700;color:#f5a623;letter-spacing:.8px;text-transform:uppercase;margin:0 0 11px;display:flex;align-items:center;gap:8px}' +
    '.sec:after{content:"";flex:1;height:1px;background:rgba(245,166,35,.12)}' +
    '.top3{display:table;width:100%;border-spacing:10px;border-collapse:separate;margin-bottom:26px}' +
    '.t3r{display:table-row}' +
    '.t3c{display:table-cell;background:#181d2c;border:1px solid rgba(245,166,35,.12);border-radius:11px;padding:15px 10px;text-align:center;width:33%}' +
    '.t3c .med{font-size:22px;margin-bottom:6px}' +
    '.t3c .nm{font-size:12px;font-weight:600;color:#f0f2f8;margin-bottom:5px;line-height:1.3}' +
    '.t3c .num{font-size:20px;font-weight:700;color:#f5a623}' +
    '.t3c .pct{font-size:11px;color:#7a8299;margin-top:2px}' +
    'table.t{width:100%;border-collapse:collapse;font-size:13px;margin-bottom:26px}' +
    'table.t thead tr{background:#0a0b10}' +
    'table.t thead th{color:#f5a623;padding:9px 12px;text-align:center;font-weight:600;font-size:10px;letter-spacing:.5px;text-transform:uppercase;border-bottom:1px solid rgba(245,166,35,.12)}' +
    'table.t thead th:first-child{text-align:left}' +
    'table.t tbody tr{border-bottom:1px solid rgba(255,255,255,.04)}' +
    'table.t tbody tr:nth-child(odd){background:#1a2035}' +
    'table.t tbody tr:nth-child(even){background:#141928}' +
    'table.t tbody td{padding:9px 12px;color:#f0f2f8;text-align:center}' +
    'table.t tbody td:first-child{text-align:left;color:#c0c6d8}' +
    'table.t .tot{background:#0a0b10!important;border-top:1px solid rgba(245,166,35,.12)}' +
    'table.t .tot td{font-weight:700;color:#f5a623}' +
    '.ac2{color:#f5a623;font-weight:600}.gr2{color:#2ecc71;font-weight:600}.rd2{color:#e74c3c;font-weight:600}' +
    '.rk{color:#f5a623;font-weight:700}.prom{color:#f5a623;font-weight:700}' +
    'table.evo{width:100%;border-collapse:collapse;font-size:13px;margin-bottom:26px}' +
    'table.evo thead tr{background:#0a0b10}' +
    'table.evo thead th{color:#f5a623;padding:9px 12px;font-size:10px;letter-spacing:.5px;text-transform:uppercase;font-weight:600;border-bottom:1px solid rgba(245,166,35,.12)}' +
    'table.evo tbody tr{border-bottom:1px solid rgba(255,255,255,.04)}' +
    'table.evo tbody tr:nth-child(odd){background:#1a2035}' +
    'table.evo tbody tr:nth-child(even){background:#141928}' +
    'table.evo tbody td{padding:9px 12px;color:#f0f2f8}' +
    '.vu{color:#e74c3c;font-weight:600}.vd{color:#2ecc71;font-weight:600}' +
    '.bar{height:8px;border-radius:4px;display:inline-block;vertical-align:middle}' +
    '.ftr{background:#0a0b10;padding:14px 36px;border-top:1px solid rgba(245,166,35,.12);display:flex;justify-content:space-between;align-items:center}' +
    '.ftr p{font-size:11px;color:#3d4560}' +
    '.bdg{font-size:10px;padding:3px 10px;border-radius:20px;background:rgba(245,166,35,.08);color:#b87a1a;border:1px solid rgba(245,166,35,.12);letter-spacing:.3px}' +
    '</style>';
}

function htmlHeader(icono, titulo, subtitulo, meta) {
  return '<div class="hdr">' +
    '<div class="hdr-top">' +
    '<img src="' + LOGO_URL + '" class="hdr-logo" alt="TAISA Logistics">' +
    '<div class="hdr-div"></div>' +
    '<div class="hdr-txt"><h1>' + icono + ' ' + titulo + '</h1><p>' + subtitulo + '</p></div>' +
    '</div>' +
    '<div class="hdr-meta">' + meta + '</div>' +
    '</div>';
}

function htmlFooter() {
  return '<div class="ftr">' +
    '<p>Generado automáticamente el ' + formatearFechaCorta(new Date()) + ' — TAISA Logistics · Plataforma Leroy Merlin Málaga</p>' +
    '<span class="bdg">' + (MODO_PRUEBA ? 'PRUEBA' : 'PRODUCCIÓN') + '</span>' +
    '</div>';
}

function htmlKpi(valor, label, clase) {
  return '<td class="kpi"><div class="kv ' + clase + '">' + valor + '</div><div class="kl">' + label + '</div></td>';
}

function formatearFechaCorta(d) {
  return d.getDate().toString().padStart(2,"0") + "/" +
    (d.getMonth()+1).toString().padStart(2,"0") + "/" + d.getFullYear();
}

// ==========================================
// MENÚ UNIFICADO
// ==========================================
function onOpen() {
  var ui = SpreadsheetApp.getUi();

  ui.createMenu('📦 GESTIÓN INVENTARIO')
    .addItem('🧹 0. Limpiar Datos de Tiendas',              'limpiarHojasTiendas')
    .addSeparator()
    .addItem('🚀 1. Ejecutar Auditoría Jueves (+Histórico)', 'ejecutarAuditoriaCompleta')
    .addItem('⚠️ 2. Enviar Correo Retrasos Equipo',          'enviarCorreoRetrasos')
    .addSeparator()
    .addItem('📊 3. Enviar Correo Resumen (a Responsables)', 'enviarCorreoResumenSemanal')
    .addItem('🏘️ 4. Enviar Revisión a Tiendas',              'enviarCorreoRevisionTienda')
    .addSeparator()
    .addItem('📅 5. Generar Resumen Mensual Plataforma',     'generarResumenMensualPlataforma')
    .addItem('📩 6. Enviar Resumen Mensual a Tiendas',       'enviarCorreoMensualTiendas')
    .addItem('📧 7. Enviar Informe PC Total',                'enviarCorreoMensualPCTotal')
    .addSeparator()
    .addItem('⚙️ Importar inventarios AHORA',               'importarInventarios')
    .addItem('🔍 Diagnóstico carpeta Drive',                'diagnosticarCarpeta')
    .addItem('📸 Guardar snapshot manual',                  'guardarSnapshotSemanal')
    .addItem('⏰ Instalar automático Jueves 12:00',          'instalarTriggerJueves')
    .addToUi();

  ui.createMenu('📊 DASHBOARD INCIDENCIAS')
    .addItem('▶️ Actualizar Dashboard',          'ejecutarDashboardDiario')
    .addItem('🔍 Ejecutar con datos de hoy',     'ejecutarManualHoy')
    .addSeparator()
    .addItem('📅 Instalar triggers automáticos', 'instalarTriggers')
    .addItem('🗑️ Limpiar Dashboard',             'limpiarDashboard')
    .addSeparator()
    .addItem('📧 Enviar informe mensual ahora',  'enviarInformesMensuales')
    .addToUi();
}
