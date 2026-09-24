// ==========================================
// MÓDULO: DASHBOARD_INCIDENCIAS
// ==========================================

var ORIGEN_TIENDA = {
  "Málaga":   "LM Málaga",
  "Marbella": "LM Marbella",
  "Mijas":    "LM Mijas",
  "Granada":  "LM Granada"
};

var NOMBRES_INCIDENCIA = {
  "EAN ERRONEO":             "Ean erróneo",
  "SOBRANTE":                "Sobrante",
  "FALTANTE":                "Faltante",
  "PALETIZACION INCORRECTA": "Paletización incorrecta",
  "REF. ANULADA":            "Ref. anulada",
  "PEDIDO ANULADO":          "Pedido anulado",
  "ROTO":                    "Roto",
  "EMBALAJE MAL ESTADO":     "Embalaje en mal estado",
  "NO HA LLEGADO PEDIDO":    "No ha llegado el pedido",
  "NO CONTROLABLE (48)":     "No controlable (código 48)"
};

var DIAS_SEMANA = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];

function formatearIncidencia(tipo) {
  return NOMBRES_INCIDENCIA[tipo] || tipo;
}

// ==========================================
// ESTILOS DASHBOARD (correos)
// ==========================================
function dashEstilos() {
  return '<style>' +
    '*{margin:0;padding:0;box-sizing:border-box}' +
    '.wrap{max-width:740px;margin:0 auto;background:#0a0b10;border-radius:14px;overflow:hidden;font-family:Arial,sans-serif}' +
    '.hdr{background:#0a0b10;padding:28px 36px 20px;border-bottom:1px solid rgba(245,166,35,.12)}' +
    '.hdr-top{display:flex;align-items:center;gap:14px;margin-bottom:10px}' +
    '.hdr-logo{height:34px}' +
    '.hdr-div{width:1px;height:34px;background:rgba(245,166,35,.2);flex-shrink:0}' +
    '.hdr-txt h1{color:#f5a623;font-size:18px;font-weight:700;line-height:1.2}' +
    '.hdr-txt p{color:#7a8299;font-size:12px;margin-top:2px}' +
    '.hdr-meta{display:flex;gap:14px;flex-wrap:wrap}' +
    '.hdr-meta span{font-size:11px;color:#3d4560;letter-spacing:.4px}' +
    '.hdr-meta strong{color:#7a8299}' +
    '.body{background:#111520;padding:28px 36px}' +
    '.intro{border-left:3px solid #f5a623;padding:15px 18px;background:rgba(245,166,35,.04);border-radius:0 10px 10px 0;margin-bottom:24px;color:#c0c6d8;font-size:13.5px;line-height:1.85}' +
    '.intro strong{color:#f5a623}' +
    '.sem{display:flex;align-items:center;gap:11px;padding:12px 16px;border-radius:10px;margin-bottom:22px;border:1px solid}' +
    '.sem.v{background:rgba(46,204,113,.06);border-color:rgba(46,204,113,.2)}' +
    '.sem.r{background:rgba(231,76,60,.06);border-color:rgba(231,76,60,.2)}' +
    '.sem.a{background:rgba(243,156,18,.06);border-color:rgba(243,156,18,.2)}' +
    '.sem .dot{width:9px;height:9px;border-radius:50%;flex-shrink:0}' +
    '.sem.v .dot{background:#2ecc71;box-shadow:0 0 6px #2ecc71}' +
    '.sem.r .dot{background:#e74c3c;box-shadow:0 0 6px #e74c3c}' +
    '.sem.a .dot{background:#f39c12;box-shadow:0 0 6px #f39c12}' +
    '.sem.v p{color:#2ecc71;font-size:13px;font-weight:600}' +
    '.sem.r p{color:#e74c3c;font-size:13px;font-weight:600}' +
    '.sem.a p{color:#f39c12;font-size:13px;font-weight:600}' +
    '.kg{display:table;width:100%;border-spacing:10px;border-collapse:separate;margin-bottom:24px}' +
    '.kr{display:table-row}' +
    '.kpi{display:table-cell;background:#181d2c;border:1px solid rgba(245,166,35,.12);border-radius:11px;padding:16px 12px;text-align:center}' +
    '.kv{font-size:26px;font-weight:700;line-height:1;margin-bottom:5px}' +
    '.kl{font-size:10px;color:#7a8299;letter-spacing:.7px;text-transform:uppercase}' +
    '.ac{color:#f5a623}.gr{color:#2ecc71}.rd{color:#e74c3c}.wh{color:#f0f2f8}' +
    '.hl{background:#181d2c;border:1px solid rgba(245,166,35,.12);border-radius:11px;padding:14px 18px;display:flex;align-items:center;gap:12px;margin-bottom:24px}' +
    '.hl-ic{font-size:22px}' +
    '.hl-lb{font-size:10px;color:#7a8299;letter-spacing:.7px;text-transform:uppercase;margin-bottom:3px}' +
    '.hl-vl{font-size:16px;font-weight:700;color:#f5a623}' +
    '.hl-vl span{color:#7a8299;font-size:12px;font-weight:400}' +
    '.sec{font-size:11px;font-weight:700;color:#f5a623;letter-spacing:.8px;text-transform:uppercase;margin:0 0 11px;display:flex;align-items:center;gap:8px}' +
    '.sec:after{content:"";flex:1;height:1px;background:rgba(245,166,35,.12)}' +
    '.top3{display:table;width:100%;border-spacing:10px;border-collapse:separate;margin-bottom:24px}' +
    '.t3r{display:table-row}' +
    '.t3c{display:table-cell;background:#181d2c;border:1px solid rgba(245,166,35,.12);border-radius:11px;padding:14px 10px;text-align:center;width:33%}' +
    '.t3c .med{font-size:22px;margin-bottom:6px}' +
    '.t3c .nm{font-size:12px;font-weight:600;color:#f0f2f8;margin-bottom:4px;line-height:1.3}' +
    '.t3c .num{font-size:20px;font-weight:700;color:#f5a623}' +
    '.t3c .pct{font-size:11px;color:#7a8299;margin-top:2px}' +
    'table.t{width:100%;border-collapse:collapse;font-size:13px;margin-bottom:24px}' +
    'table.t thead tr{background:#0a0b10}' +
    'table.t thead th{color:#f5a623;padding:9px 12px;text-align:center;font-weight:600;font-size:10px;letter-spacing:.5px;text-transform:uppercase;border-bottom:1px solid rgba(245,166,35,.12)}' +
    'table.t thead th:first-child{text-align:left}' +
    'table.t tbody tr{border-bottom:1px solid rgba(255,255,255,.04)}' +
    'table.t tbody tr:nth-child(odd){background:#1a2035}' +
    'table.t tbody tr:nth-child(even){background:#141928}' +
    'table.t tbody td{padding:9px 12px;color:#f0f2f8;text-align:center}' +
    'table.t tbody td:first-child{text-align:left;color:#c0c6d8}' +
    '.tot{background:#0a0b10!important;border-top:1px solid rgba(245,166,35,.12)!important}' +
    '.tot td{font-weight:700;color:#f5a623!important}' +
    '.ac2{color:#f5a623;font-weight:600}.gr2{color:#2ecc71;font-weight:600}.rd2{color:#e74c3c;font-weight:600}' +
    '.rk{color:#f5a623;font-weight:700}.prom{color:#f5a623;font-weight:700}' +
    'table.evo{width:100%;border-collapse:collapse;font-size:13px;margin-bottom:24px}' +
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
    '.prueba{color:#e74c3c;font-size:11px;margin-top:4px}' +
    '</style>';
}

function dashHtmlHdr(icono, titulo, subtitulo, meta) {
  return '<div class="hdr">' +
    '<div class="hdr-top">' +
    '<img src="' + LOGO_URL + '" class="hdr-logo" alt="TAISA Logistics">' +
    '<div class="hdr-div"></div>' +
    '<div class="hdr-txt"><h1>' + icono + ' ' + titulo + '</h1><p>' + subtitulo + '</p>' +
    (DASHBOARD_CONFIG.MODO_PRUEBA ? '<p class="prueba">⚠️ MODO PRUEBA</p>' : '') +
    '</div></div>' +
    '<div class="hdr-meta">' + meta + '</div>' +
    '</div>';
}

function dashHtmlFtr() {
  return '<div class="ftr">' +
    '<p>Generado automáticamente el ' + formatearFechaDash(new Date()) + ' — TAISA Logistics · Sistema de Incidencias Leroy Merlin</p>' +
    '<span class="bdg">' + (DASHBOARD_CONFIG.MODO_PRUEBA ? 'PRUEBA' : 'PRODUCCIÓN') + '</span>' +
    '</div>';
}

function dashKpi(val, lbl, cls) {
  return '<td class="kpi"><div class="kv ' + cls + '">' + val + '</div><div class="kl">' + lbl + '</div></td>';
}

// ==========================================
// FUNCIONES PRINCIPALES
// ==========================================
function ejecutarDashboardDiario() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ayerObj = new Date();
  ayerObj.setDate(ayerObj.getDate() - 1);
  var ayer = formatearFechaDash(ayerObj);
  var datosAyer = dashExtraerPorFecha(ayer);
  var hoy = new Date();
  var mesActual = hoy.getMonth();
  var anyoActual = hoy.getFullYear();
  var datosAcumulado = dashExtraerPorMes(anyoActual, mesActual);
  var pedidosAcumulado = pedidosExtraerPorMes(anyoActual, mesActual);

  var metricasAyer = null;
  if (datosAyer && datosAyer.length > 0) {
    metricasAyer = dashCalcularMetricas(datosAyer, ss, ayer);
    dashGuardarHistorial(ss, ayer, metricasAyer);
  }
  var metricasAcumulado = datosAcumulado.length > 0
    ? dashCalcularMetricas(datosAcumulado, ss, formatearFechaDash(hoy))
    : null;

  dashActualizarVista(ss, ayer, metricasAyer, metricasAcumulado, pedidosAcumulado, NOMBRES_MESES_COMPLETOS[mesActual], anyoActual);
}

function ejecutarManualHoy() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hoy = new Date();
  var hoyStr = formatearFechaDash(hoy);
  var datosHoy = dashExtraerPorFecha(hoyStr);
  var mesActual = hoy.getMonth();
  var anyoActual = hoy.getFullYear();
  var datosAcumulado = dashExtraerPorMes(anyoActual, mesActual);
  var pedidosAcumulado = pedidosExtraerPorMes(anyoActual, mesActual);

  var metricasHoy = null;
  if (datosHoy && datosHoy.length > 0) {
    metricasHoy = dashCalcularMetricas(datosHoy, ss, hoyStr);
    dashGuardarHistorial(ss, hoyStr, metricasHoy);
  }
  var metricasAcumulado = datosAcumulado.length > 0
    ? dashCalcularMetricas(datosAcumulado, ss, hoyStr)
    : null;

  dashActualizarVista(ss, hoyStr, metricasHoy, metricasAcumulado, pedidosAcumulado, NOMBRES_MESES_COMPLETOS[mesActual], anyoActual);
  SpreadsheetApp.getUi().alert("✅ Dashboard actualizado para: " + hoyStr);
}

// ==========================================
// EXTRACCIÓN INCIDENCIAS
// ==========================================
function dashEsDevolusion(fila) {
  var val = (fila[DASHBOARD_CONFIG.COL_TIPO_DOC] || "").toString().trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  return val === "devolucion";
}

function dashExtraerPorFecha(fecha) {
  try {
    var hoja = SpreadsheetApp.openById(DASHBOARD_CONFIG.ID_HOJA_FUENTE)
      .getSheetByName(DASHBOARD_CONFIG.NOMBRE_HOJA_DATOS);
    return hoja.getDataRange().getValues().slice(1).filter(function(fila) {
      if (dashEsDevolusion(fila)) return false;
      return formatearFechaDash(new Date(fila[DASHBOARD_CONFIG.COL_FECHA])) === fecha;
    });
  } catch(e) { Logger.log("Error: " + e.message); return []; }
}

function dashExtraerPorMes(anyo, mes) {
  try {
    var hoja = SpreadsheetApp.openById(DASHBOARD_CONFIG.ID_HOJA_FUENTE)
      .getSheetByName(DASHBOARD_CONFIG.NOMBRE_HOJA_DATOS);
    return hoja.getDataRange().getValues().slice(1).filter(function(fila) {
      if (dashEsDevolusion(fila)) return false;
      var f = new Date(fila[DASHBOARD_CONFIG.COL_FECHA]);
      return f.getFullYear() === anyo && f.getMonth() === mes;
    });
  } catch(e) { Logger.log("Error mes: " + e.message); return []; }
}

// ==========================================
// EXTRACCIÓN PEDIDOS
// ==========================================
function pedidosExtraerPorMes(anyo, mes) {
  try {
    var nombreHoja = NOMBRES_MESES_COMPLETOS[mes] + " " + anyo;
    var ss = SpreadsheetApp.openById(DASHBOARD_CONFIG.ID_HOJA_OPERACIONES);
    var hoja = ss.getSheetByName(nombreHoja);
    if (!hoja) { Logger.log("Hoja no encontrada: " + nombreHoja); return {}; }
    var datos = hoja.getDataRange().getValues().slice(2);
    var pedidosPorTienda = {};
    datos.forEach(function(fila) {
      var tipo   = (fila[DASHBOARD_CONFIG.COL_OP_TIPO]   || "").toString().trim();
      var origen = (fila[DASHBOARD_CONFIG.COL_OP_ORIGEN] || "").toString().trim();
      var nPed   = parseFloat(fila[DASHBOARD_CONFIG.COL_OP_PEDIDOS]) || 0;
      if (tipo !== "Recepción") return;
      var tiendaMatch = null;
      Object.entries(ORIGEN_TIENDA).forEach(function(entry) {
        if (origen === entry[1]) tiendaMatch = entry[0];
      });
      if (!tiendaMatch) return;
      pedidosPorTienda[tiendaMatch] = (pedidosPorTienda[tiendaMatch] || 0) + nPed;
    });
    return pedidosPorTienda;
  } catch(e) { Logger.log("Error pedidos: " + e.message); return {}; }
}

// ==========================================
// ANÁLISIS POR DÍA DE SEMANA
// ==========================================
function calcularDistribucionDias(filas) {
  var porDia = {0:0,1:0,2:0,3:0,4:0,5:0,6:0};
  filas.forEach(function(fila) {
    var f = new Date(fila[DASHBOARD_CONFIG.COL_FECHA]);
    if (!isNaN(f)) porDia[f.getDay()] = (porDia[f.getDay()]||0) + 1;
  });
  return porDia;
}

function diaCritico(porDia) {
  var maxDia=0, maxVal=0;
  Object.entries(porDia).forEach(function(e) {
    if (e[1]>maxVal) { maxVal=e[1]; maxDia=parseInt(e[0]); }
  });
  return { dia: DIAS_SEMANA[maxDia], valor: maxVal };
}

// ==========================================
// SEMÁFORO DE TENDENCIA
// ==========================================
function interpretarTendencia(resumenMeses, tienda, anyoMes, mesAnterior) {
  var mesesConsecutivos=0, tendencia=null;
  for (var i=0; i<3; i++) {
    var m1=mesAnterior-i, a1=anyoMes, m2=mesAnterior-i-1, a2=anyoMes;
    if (m1<0){m1+=12;a1--;} if (m2<0){m2+=12;a2--;}
    var c1=a1+"-"+String(m1+1).padStart(2,"0");
    var c2=a2+"-"+String(m2+1).padStart(2,"0");
    var v1=tienda?(resumenMeses[c1]&&resumenMeses[c1].porTienda[tienda]?resumenMeses[c1].porTienda[tienda]:null):(resumenMeses[c1]?resumenMeses[c1].total:null);
    var v2=tienda?(resumenMeses[c2]&&resumenMeses[c2].porTienda[tienda]?resumenMeses[c2].porTienda[tienda]:null):(resumenMeses[c2]?resumenMeses[c2].total:null);
    if (v1===null||v2===null) break;
    var dir=v1>v2?"sube":v1<v2?"baja":"igual";
    if (i===0) tendencia=dir;
    if (dir===tendencia) mesesConsecutivos++;
    else break;
  }
  if (mesesConsecutivos>=3&&tendencia==="sube") return {emoji:"🔴",texto:"Atención: tendencia al alza 3 meses consecutivos",color:"#e74c3c"};
  if (mesesConsecutivos>=3&&tendencia==="baja") return {emoji:"🟢",texto:"Excelente: mejora sostenida 3 meses consecutivos",color:"#27ae60"};
  if (tendencia==="sube") return {emoji:"🟡",texto:"Ha subido respecto al mes anterior",color:"#f5a623"};
  if (tendencia==="baja") return {emoji:"🟢",texto:"Ha mejorado respecto al mes anterior",color:"#27ae60"};
  return {emoji:"⚪",texto:"Sin variación respecto al mes anterior",color:"#ecf0f1"};
}

// ==========================================
// NORMALIZACIÓN DE TIENDAS
// ==========================================
function dashNormalizarTienda(nombre) {
  if (!nombre) return "Sin tienda";
  var n=nombre.toString().trim().normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
  if (n.includes("malaga"))   return "Málaga";
  if (n.includes("marbella")) return "Marbella";
  if (n.includes("mijas"))    return "Mijas";
  if (n.includes("granada"))  return "Granada";
  return nombre.toString().trim();
}

// ==========================================
// MÉTRICAS
// ==========================================
function dashCalcularMetricas(datos, ss, fecha) {
  var totalRegistros=datos.length, porTienda={}, porIncidencia={}, pctIncidencia={};
  datos.forEach(function(fila) {
    var tienda=dashNormalizarTienda(fila[DASHBOARD_CONFIG.COL_TIENDA]);
    porTienda[tienda]=(porTienda[tienda]||0)+1;
    var inc=fila[DASHBOARD_CONFIG.COL_INCIDENCIA]||"Sin tipo";
    porIncidencia[inc]=(porIncidencia[inc]||0)+1;
  });
  Object.keys(porIncidencia).forEach(function(k) {
    pctIncidencia[k]=((porIncidencia[k]/totalRegistros)*100).toFixed(1)+"%";
  });
  var comparativa=dashComparativaMes(ss,fecha,totalRegistros);
  return {fecha:fecha,totalRegistros:totalRegistros,porTienda:porTienda,
    porIncidencia:porIncidencia,pctIncidencia:pctIncidencia,comparativa:comparativa};
}

function dashComparativaMes(ss, fechaStr, totalHoy) {
  try {
    var hH=ss.getSheetByName(DASHBOARD_CONFIG.NOMBRE_HOJA_HISTORIAL);
    if (!hH) return null;
    var datos=hH.getDataRange().getValues();
    if (datos.length<2) return null;
    var fechaObj=new Date(fechaStr.split("/").reverse().join("-"));
    // Fecha "mismo día, mes anterior" a prueba de desbordamiento: si el mes
    // anterior tiene menos días que fechaObj.getDate() (p.ej. 31/05 -> abril
    // solo tiene 30), setMonth() sin más desbordaba de vuelta al mes de
    // fechaObj (31/05 -> 01/05 en vez de caer en abril). Se calcula el mes
    // anterior empezando en el día 1 y se recorta al último día real de ese
    // mes si hace falta.
    var mesAnt=new Date(fechaObj.getFullYear(), fechaObj.getMonth()-1, 1);
    var ultimoDiaMesAnt=new Date(mesAnt.getFullYear(), mesAnt.getMonth()+1, 0).getDate();
    mesAnt.setDate(Math.min(fechaObj.getDate(), ultimoDiaMesAnt));
    var fRef=formatearFechaDash(mesAnt);
    var filaAnt=datos.slice(1).find(function(f){return f[0]===fRef;});
    if (!filaAnt) return {mensaje:"Sin datos del mes anterior aún"};
    var totalAnt=filaAnt[1], dif=totalHoy-totalAnt;
    var pct=((dif/totalAnt)*100).toFixed(1);
    return {fechaRef:fRef,totalRef:totalAnt,diferencia:dif,pct:pct+"%",
      tendencia:dif>=0?"▲ SUBE":"▼ BAJA"};
  } catch(e) { return null; }
}

// ==========================================
// HISTORIAL
// ==========================================
function dashGuardarHistorial(ss, fecha, metricas) {
  var hH=ss.getSheetByName(DASHBOARD_CONFIG.NOMBRE_HOJA_HISTORIAL);
  if (!hH) {
    hH=ss.insertSheet(DASHBOARD_CONFIG.NOMBRE_HOJA_HISTORIAL);
    hH.appendRow(["Fecha","Total","Tiendas (JSON)","Incidencias (JSON)","% Incidencias (JSON)"]);
    hH.getRange(1,1,1,5).setFontWeight("bold").setBackground("#1a1a2e").setFontColor("#ffffff");
  }
  var datos=hH.getDataRange().getValues();
  if (datos.slice(1).some(function(f){return f[0]===fecha;})) return;
  hH.appendRow([fecha,metricas.totalRegistros,JSON.stringify(metricas.porTienda),
    JSON.stringify(metricas.porIncidencia),JSON.stringify(metricas.pctIncidencia)]);
}

function dashResumenMensualHistorial(ss) {
  var hH=ss.getSheetByName(DASHBOARD_CONFIG.NOMBRE_HOJA_HISTORIAL);
  if (!hH) return {};
  var porMes={};
  hH.getDataRange().getValues().slice(1).forEach(function(fila) {
    var partes=fila[0].toString().split("/");
    if (partes.length<3) return;
    var clave=partes[2]+"-"+partes[1];
    if (!porMes[clave]) porMes[clave]={total:0,porTienda:{},porIncidencia:{}};
    porMes[clave].total+=fila[1];
    var pt=JSON.parse(fila[2]||"{}"), pi=JSON.parse(fila[3]||"{}");
    Object.entries(pt).forEach(function(e){porMes[clave].porTienda[e[0]]=(porMes[clave].porTienda[e[0]]||0)+e[1];});
    Object.entries(pi).forEach(function(e){porMes[clave].porIncidencia[e[0]]=(porMes[clave].porIncidencia[e[0]]||0)+e[1];});
  });
  return porMes;
}

// ==========================================
// DASHBOARD VISUAL
// ==========================================
function dashActualizarVista(ss, fecha, metricasAyer, metricasAcumulado, pedidosAcumulado, nombreMes, anyo) {
  var hDash=ss.getSheetByName(DASHBOARD_CONFIG.NOMBRE_HOJA_DASHBOARD);
  if (!hDash) hDash=ss.insertSheet(DASHBOARD_CONFIG.NOMBRE_HOJA_DASHBOARD);
  hDash.clearContents(); hDash.clearFormats();
  hDash.getCharts().forEach(function(c){hDash.removeChart(c);});

  var AO="#1a1a2e",AM="#16213e",AA="#0f3460";
  var BL="#ffffff",AM2="#f5a623",VE="#27ae60",RO="#e74c3c",GR="#ecf0f1";

  for (var c=1;c<=8;c++) hDash.setColumnWidth(c,150);

  hDash.getRange("A1:H1").merge()
    .setValue("📊 DASHBOARD DE INCIDENCIAS - LEROY MERLIN")
    .setBackground(AO).setFontColor(AM2).setFontSize(16).setFontWeight("bold").setHorizontalAlignment("center");
  hDash.getRange("A2:H2").merge()
    .setValue("Actualizado: "+formatearFechaDash(new Date())+(DASHBOARD_CONFIG.MODO_PRUEBA?"  |  ⚠️ MODO PRUEBA":""))
    .setBackground(AM).setFontColor(GR).setFontSize(10).setHorizontalAlignment("center");

  var fila=4;

  // ── SECCIÓN 1: DATOS DE AYER ──
  hDash.getRange(fila,1,1,8).merge()
    .setValue("📅 DATOS DE AYER — "+fecha)
    .setBackground(AA).setFontColor(BL).setFontSize(12).setFontWeight("bold").setHorizontalAlignment("center");
  fila++;

  if (!metricasAyer||metricasAyer.totalRegistros===0) {
    hDash.getRange(fila,1,1,8).merge()
      .setValue("Sin incidencias registradas ayer")
      .setBackground(AM).setFontColor(GR).setFontSize(11).setHorizontalAlignment("center");
    fila+=2;
  } else {
    hDash.getRange(fila,1,3,2).merge().setValue("📋 TOTAL\nINCIDENCIAS\n"+metricasAyer.totalRegistros)
      .setBackground(AM).setFontColor(BL).setFontSize(13).setFontWeight("bold")
      .setHorizontalAlignment("center").setVerticalAlignment("middle").setWrap(true);
    hDash.getRange(fila,3,3,2).merge().setValue("🏪 TIENDAS CON\nINCIDENCIAS\n"+Object.keys(metricasAyer.porTienda).length)
      .setBackground(AM).setFontColor(BL).setFontSize(13).setFontWeight("bold")
      .setHorizontalAlignment("center").setVerticalAlignment("middle").setWrap(true);
    hDash.getRange(fila,5,3,2).merge().setValue("⚠️ TIPOS DE\nINCIDENCIA\n"+Object.keys(metricasAyer.porIncidencia).length)
      .setBackground(AM).setFontColor(BL).setFontSize(13).setFontWeight("bold")
      .setHorizontalAlignment("center").setVerticalAlignment("middle").setWrap(true);

    var kpi4txt="📈 VS MES\nANTERIOR\nSin datos", kpi4bg=AM;
    if (metricasAyer.comparativa&&metricasAyer.comparativa.pct) {
      kpi4txt="📈 VS MES\nANTERIOR\n"+metricasAyer.comparativa.tendencia+" "+metricasAyer.comparativa.pct;
      kpi4bg=metricasAyer.comparativa.diferencia>=0?"#3a1a1a":"#1a3a2a"; // >=0 = sube (peor) = rojo; <0 = baja (mejor) = verde
    }
    hDash.getRange(fila,7,3,2).merge().setValue(kpi4txt).setBackground(kpi4bg).setFontColor(BL)
      .setFontSize(13).setFontWeight("bold").setHorizontalAlignment("center").setVerticalAlignment("middle").setWrap(true);
    fila+=4;

    var tiendasAyer=Object.entries(metricasAyer.porTienda).sort(function(a,b){return b[1]-a[1];});
    var incAyer=Object.entries(metricasAyer.porIncidencia).sort(function(a,b){return b[1]-a[1];});

    hDash.getRange(fila,1,1,4).merge().setValue("🏪 POR TIENDA")
      .setBackground(AA).setFontColor(BL).setFontSize(11).setFontWeight("bold").setHorizontalAlignment("center");
    hDash.getRange(fila,5,1,4).merge().setValue("⚠️ TIPOS DE INCIDENCIA")
      .setBackground(AA).setFontColor(BL).setFontSize(11).setFontWeight("bold").setHorizontalAlignment("center");
    fila++;

    ["Tienda","Nº","%"].forEach(function(h,i){
      hDash.getRange(fila,i+1).setValue(h).setFontWeight("bold").setBackground(AM).setFontColor(AM2);
    });
    ["Tipo","Nº","%"].forEach(function(h,i){
      hDash.getRange(fila,5+i).setValue(h).setFontWeight("bold").setBackground(AM).setFontColor(AM2);
    });
    fila++;

    var maxFilas=Math.max(tiendasAyer.length,incAyer.length);
    for (var i=0;i<maxFilas;i++) {
      var bg=i%2===0?"#1e2a3a":"#162030";
      if (tiendasAyer[i]) {
        var t=tiendasAyer[i][0],n=tiendasAyer[i][1];
        var pct=((n/metricasAyer.totalRegistros)*100).toFixed(1)+"%";
        hDash.getRange(fila+i,1).setValue(t).setBackground(bg).setFontColor(BL);
        hDash.getRange(fila+i,2).setValue(n).setBackground(bg).setFontColor(BL).setHorizontalAlignment("center");
        hDash.getRange(fila+i,3).setValue(pct).setBackground(bg).setFontColor(AM2).setHorizontalAlignment("center");
      }
      if (incAyer[i]) {
        var ti=incAyer[i][0],ni=incAyer[i][1];
        var pcti=((ni/metricasAyer.totalRegistros)*100).toFixed(1)+"%";
        hDash.getRange(fila+i,5).setValue(formatearIncidencia(ti)).setBackground(bg).setFontColor(BL);
        hDash.getRange(fila+i,6).setValue(ni).setBackground(bg).setFontColor(BL).setHorizontalAlignment("center");
        hDash.getRange(fila+i,7).setValue(pcti).setBackground(bg).setFontColor(AM2).setHorizontalAlignment("center");
      }
    }
    fila+=maxFilas+2;

    var fG=fila-maxFilas-2;
    hDash.getRange(fG,9).setValue("Tipo");
    hDash.getRange(fG,10).setValue("Cantidad");
    incAyer.forEach(function(entry,i){
      hDash.getRange(fG+1+i,9).setValue(formatearIncidencia(entry[0]));
      hDash.getRange(fG+1+i,10).setValue(entry[1]);
    });
    var chartAyer=hDash.newChart()
      .setChartType(Charts.ChartType.PIE)
      .addRange(hDash.getRange(fG,9,incAyer.length+1,2))
      .setOption("title","Ayer — Tipos de incidencia")
      .setOption("pieHole",0.5)
      .setOption("backgroundColor","#16213e")
      .setOption("titleTextStyle",{color:"#ffffff",fontSize:11})
      .setOption("legend",{textStyle:{color:"#ffffff"}})
      .setPosition(fG,1,0,0).build();
    hDash.insertChart(chartAyer);
  }

  // ── SECCIÓN 2: ACUMULADO MES EN CURSO ──
  fila++;
  hDash.getRange(fila,1,1,8).merge()
    .setValue("📊 ACUMULADO "+nombreMes.toUpperCase()+" "+anyo+" (hasta hoy)")
    .setBackground("#0a2040").setFontColor(AM2).setFontSize(12).setFontWeight("bold").setHorizontalAlignment("center");
  fila++;

  if (!metricasAcumulado||metricasAcumulado.totalRegistros===0) {
    hDash.getRange(fila,1,1,8).merge()
      .setValue("Sin datos acumulados para este mes aún")
      .setBackground(AM).setFontColor(GR).setFontSize(11).setHorizontalAlignment("center");
    fila+=2;
  } else {
    var totalAcum=metricasAcumulado.totalRegistros;
    var totalPedAcum=Object.values(pedidosAcumulado).reduce(function(s,v){return s+v;},0);
    var ratioAcum=totalPedAcum>0?((totalAcum/totalPedAcum)*100).toFixed(2)+"%":"S/D";
    var pctSinAcum=totalPedAcum>0?(((totalPedAcum-totalAcum)/totalPedAcum)*100).toFixed(1)+"%":"S/D";

    hDash.getRange(fila,1,3,2).merge().setValue("📋 INCIDENCIAS\nACUMULADAS\n"+totalAcum)
      .setBackground(AM).setFontColor(BL).setFontSize(13).setFontWeight("bold")
      .setHorizontalAlignment("center").setVerticalAlignment("middle").setWrap(true);
    hDash.getRange(fila,3,3,2).merge().setValue("📦 PEDIDOS\nRECEPCIONADOS\n"+totalPedAcum.toLocaleString('es-ES'))
      .setBackground(AM).setFontColor(BL).setFontSize(13).setFontWeight("bold")
      .setHorizontalAlignment("center").setVerticalAlignment("middle").setWrap(true);
    hDash.getRange(fila,5,3,2).merge().setValue("✅ SIN\nINCIDENCIA\n"+pctSinAcum)
      .setBackground(AM).setFontColor(VE).setFontSize(13).setFontWeight("bold")
      .setHorizontalAlignment("center").setVerticalAlignment("middle").setWrap(true);
    hDash.getRange(fila,7,3,2).merge().setValue("⚠️ RATIO\nINC./PED.\n"+ratioAcum)
      .setBackground(AM)
      .setFontColor(totalPedAcum>0&&(totalAcum/totalPedAcum)>0.05?RO:VE)
      .setFontSize(13).setFontWeight("bold")
      .setHorizontalAlignment("center").setVerticalAlignment("middle").setWrap(true);
    fila+=4;

    var tiendasAcum=Object.entries(metricasAcumulado.porTienda).sort(function(a,b){return b[1]-a[1];});
    var incAcum=Object.entries(metricasAcumulado.porIncidencia).sort(function(a,b){return b[1]-a[1];});

    hDash.getRange(fila,1,1,4).merge().setValue("🏪 RANKING TIENDAS ACUMULADO")
      .setBackground(AA).setFontColor(BL).setFontSize(11).setFontWeight("bold").setHorizontalAlignment("center");
    hDash.getRange(fila,5,1,4).merge().setValue("⚠️ TOP INCIDENCIAS ACUMULADO")
      .setBackground(AA).setFontColor(BL).setFontSize(11).setFontWeight("bold").setHorizontalAlignment("center");
    fila++;

    ["Tienda","Pedidos","Inc.","%Inc./Ped."].forEach(function(h,i){
      hDash.getRange(fila,i+1).setValue(h).setFontWeight("bold").setBackground(AM).setFontColor(AM2);
    });
    ["Tipo","Nº","%"].forEach(function(h,i){
      hDash.getRange(fila,5+i).setValue(h).setFontWeight("bold").setBackground(AM).setFontColor(AM2);
    });
    fila++;

    var maxFilasAcum=Math.max(tiendasAcum.length,incAcum.length);
    for (var j=0;j<maxFilasAcum;j++) {
      var bgA=j%2===0?"#1e2a3a":"#162030";
      if (tiendasAcum[j]) {
        var tA=tiendasAcum[j][0],nA=tiendasAcum[j][1];
        var pA=pedidosAcumulado[tA]||0;
        var rA=pA>0?((nA/pA)*100).toFixed(2)+"%":"-";
        var rC=pA>0&&(nA/pA)>0.05?RO:VE;
        hDash.getRange(fila+j,1).setValue(tA).setBackground(bgA).setFontColor(BL);
        hDash.getRange(fila+j,2).setValue(pA.toLocaleString('es-ES')).setBackground(bgA).setFontColor(BL).setHorizontalAlignment("center");
        hDash.getRange(fila+j,3).setValue(nA).setBackground(bgA).setFontColor(BL).setHorizontalAlignment("center");
        hDash.getRange(fila+j,4).setValue(rA).setBackground(bgA).setFontColor(rC).setHorizontalAlignment("center");
      }
      if (incAcum[j]) {
        var tiA=incAcum[j][0],niA=incAcum[j][1];
        var pciA=((niA/totalAcum)*100).toFixed(1)+"%";
        hDash.getRange(fila+j,5).setValue(formatearIncidencia(tiA)).setBackground(bgA).setFontColor(BL);
        hDash.getRange(fila+j,6).setValue(niA).setBackground(bgA).setFontColor(BL).setHorizontalAlignment("center");
        hDash.getRange(fila+j,7).setValue(pciA).setBackground(bgA).setFontColor(AM2).setHorizontalAlignment("center");
      }
    }
    fila+=maxFilasAcum+2;

    hDash.getRange(fila,1,1,8).merge().setValue("📅 HISTORIAL RECIENTE (últimos 10 días)")
      .setBackground(AA).setFontColor(BL).setFontSize(11).setFontWeight("bold").setHorizontalAlignment("center");
    ["Fecha","Total","Tienda Top","Incidencia Top","% Top","Tendencia"].forEach(function(h,i){
      hDash.getRange(fila+1,i+1).setValue(h).setFontWeight("bold").setBackground(AM).setFontColor(AM2);
    });
    fila+=2;

    var hHist=ss.getSheetByName(DASHBOARD_CONFIG.NOMBRE_HOJA_HISTORIAL);
    if (hHist) {
      var histArr=hHist.getDataRange().getValues().slice(1).reverse().slice(0,10);
      histArr.forEach(function(filaH,i) {
        var fD=fila+i, bgH=i%2===0?"#1e2a3a":"#162030";
        var pT=JSON.parse(filaH[2]||"{}"), pI=JSON.parse(filaH[3]||"{}");
        var tT=Object.entries(pT).sort(function(a,b){return b[1]-a[1];})[0];
        var tI=Object.entries(pI).sort(function(a,b){return b[1]-a[1];})[0];
        var pctI=tI?((tI[1]/filaH[1])*100).toFixed(1)+"%":"-";
        var tend="-";
        if (i<histArr.length-1) {
          var dif=filaH[1]-histArr[i+1][1];
          tend=dif>0?"▲ +"+dif:dif<0?"▼ "+dif:"= Igual";
        }
        hDash.getRange(fD,1).setValue(filaH[0]).setBackground(bgH).setFontColor(BL);
        hDash.getRange(fD,2).setValue(filaH[1]).setBackground(bgH).setFontColor(BL).setHorizontalAlignment("center");
        hDash.getRange(fD,3).setValue(tT?tT[0]:"-").setBackground(bgH).setFontColor(BL);
        hDash.getRange(fD,4).setValue(tI?formatearIncidencia(tI[0]):"-").setBackground(bgH).setFontColor(BL);
        hDash.getRange(fD,5).setValue(pctI).setBackground(bgH).setFontColor(AM2).setHorizontalAlignment("center");
        var colT=tend.startsWith("▲")?RO:tend.startsWith("▼")?VE:BL; // ▲ sube (peor) = rojo; ▼ baja (mejor) = verde
        hDash.getRange(fD,6).setValue(tend).setBackground(bgH).setFontColor(colT).setHorizontalAlignment("center");
      });
    }
  }
  hDash.setTabColor(AA);
}

// ==========================================
// INFORMES MENSUALES
// ==========================================
function enviarInformesMensuales() {
  var ahora=new Date();
  var mesAnterior=ahora.getMonth()===0?11:ahora.getMonth()-1;
  var anyoMes=ahora.getMonth()===0?ahora.getFullYear()-1:ahora.getFullYear();
  var nombreMes=NOMBRES_MESES_COMPLETOS[mesAnterior];

  var datos=dashExtraerPorMes(anyoMes,mesAnterior);
  if (!datos||datos.length===0) {
    SpreadsheetApp.getUi().alert("No hay datos para "+nombreMes+" "+anyoMes);
    return;
  }

  var ss=SpreadsheetApp.getActiveSpreadsheet();
  var resumenMeses=dashResumenMensualHistorial(ss);
  var pedidosMes=pedidosExtraerPorMes(anyoMes,mesAnterior);

  var porTienda={};
  datos.forEach(function(fila) {
    var tienda=dashNormalizarTienda(fila[DASHBOARD_CONFIG.COL_TIENDA]);
    if (!porTienda[tienda]) porTienda[tienda]=[];
    porTienda[tienda].push(fila);
  });

  var totalGlobal=datos.length, incGlobal={};
  datos.forEach(function(fila) {
    var inc=fila[DASHBOARD_CONFIG.COL_INCIDENCIA]||"Sin tipo";
    incGlobal[inc]=(incGlobal[inc]||0)+1;
  });

  var comparativaMeses=dashGenerarComparativa(resumenMeses,anyoMes,mesAnterior);
  var distDiasGlobal=calcularDistribucionDias(datos);
  var tendenciaGlobal=interpretarTendencia(resumenMeses,null,anyoMes,mesAnterior);

  var htmlGlobal=dashHtmlGlobal(nombreMes,anyoMes,totalGlobal,porTienda,incGlobal,comparativaMeses,pedidosMes,distDiasGlobal,tendenciaGlobal);
  MailApp.sendEmail({
    to: DASHBOARD_CONFIG.MODO_PRUEBA?DASHBOARD_CONFIG.EMAIL_PRUEBA:EMAILS_DASHBOARD.GLOBAL,
    cc: CC_DASHBOARD,
    subject: (DASHBOARD_CONFIG.MODO_PRUEBA?"[PRUEBA] ":"")+"📊 Informe Global Incidencias Pedido Cliente — "+nombreMes+" "+anyoMes,
    htmlBody: htmlGlobal
  });

  var tiendaEmailMap={
    "Málaga":EMAILS_DASHBOARD.MALAGA,"Marbella":EMAILS_DASHBOARD.MARBELLA,
    "Mijas":EMAILS_DASHBOARD.MIJAS,"Granada":EMAILS_DASHBOARD.GRANADA
  };

  Object.entries(porTienda).forEach(function(entry) {
    var tienda=entry[0], filasTienda=entry[1];
    var emailTienda=tiendaEmailMap[tienda];
    if (!emailTienda) return;
    var pedidosTienda=pedidosMes[tienda]||0;
    var distDiasTienda=calcularDistribucionDias(filasTienda);
    var tendenciaTienda=interpretarTendencia(resumenMeses,tienda,anyoMes,mesAnterior);
    var htmlTienda=dashHtmlTienda(tienda,nombreMes,anyoMes,filasTienda,resumenMeses,anyoMes,mesAnterior,pedidosTienda,distDiasTienda,tendenciaTienda);
    MailApp.sendEmail({
      to: DASHBOARD_CONFIG.MODO_PRUEBA?DASHBOARD_CONFIG.EMAIL_PRUEBA:emailTienda,
      cc: CC_DASHBOARD,
      subject: (DASHBOARD_CONFIG.MODO_PRUEBA?"[PRUEBA] ":"")+"📋 Incidencias Pedido Cliente "+tienda+" — "+nombreMes+" "+anyoMes,
      htmlBody: htmlTienda
    });
  });

  var msg=DASHBOARD_CONFIG.MODO_PRUEBA
    ?"✅ Emails de prueba enviados a "+DASHBOARD_CONFIG.EMAIL_PRUEBA
    :"✅ Informes enviados para "+nombreMes+" "+anyoMes;
  SpreadsheetApp.getUi().alert(msg);
}

// Disparador automático mensual (día 1)
function ejecutarInformeMensualAutomatico() {
  enviarInformesMensuales();
}

// ==========================================
// COMPARATIVA MESES
// ==========================================
function dashGenerarComparativa(resumenMeses, anyo, mes) {
  var meses=[];
  for (var i=5;i>=0;i--) {
    var m=mes-i,a=anyo;
    if (m<0){m+=12;a-=1;}
    var clave=a+"-"+String(m+1).padStart(2,"0");
    var noms=["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
    meses.push({clave:clave,etiqueta:noms[m]+" "+a,total:resumenMeses[clave]?resumenMeses[clave].total:null});
  }
  return meses;
}

function dashHtmlComparativa(comparativa) {
  var validos=comparativa.filter(function(m){return m.total!==null;});
  if (validos.length<2) return "<p style='color:#aaa;font-size:12px;margin-top:8px;'>Aún no hay suficiente historial para mostrar comparativa.</p>";
  var maxVal=Math.max.apply(null,validos.map(function(m){return m.total;}));
  var html='<table class="evo"><thead><tr><th>Mes</th><th>Incidencias</th><th>Barra</th><th>vs Ant.</th></tr></thead><tbody>';
  comparativa.forEach(function(mes,i) {
    if (mes.total===null) {
      html+='<tr><td style="color:#555">'+mes.etiqueta+'</td><td colspan="3" style="color:#444;font-size:11px;text-align:center">Sin datos</td></tr>';
      return;
    }
    var barWidth=Math.round((mes.total/maxVal)*120);
    var vsAnt="-";
    for(var j=i-1;j>=0;j--){
      if(comparativa[j].total!==null){
        var dif=mes.total-comparativa[j].total;
        var pct=((dif/comparativa[j].total)*100).toFixed(1);
        if (dif===0) {
          vsAnt='<span style="color:#7a8299">= 0.0%</span>';
        } else {
          vsAnt='<span class="'+(dif>0?"vu":"vd")+'">'+(dif>0?"▲":"▼")+' '+Math.abs(pct)+'%</span>';
        }
        break;
      }
    }
    html+='<tr><td>'+mes.etiqueta+'</td>' +
      '<td style="color:#f5a623;font-weight:700;text-align:center">'+mes.total+'</td>' +
      '<td><div class="bar" style="background:#f5a623;width:'+barWidth+'px"></div></td>' +
      '<td style="text-align:center">'+vsAnt+'</td></tr>';
  });
  return html+'</tbody></table>';
}

function dashHtmlDistribucionDias(porDia, total) {
  var maxVal=Math.max.apply(null,Object.values(porDia));
  var html='<table class="t"><thead><tr><th>Día</th><th>Incidencias</th><th style="text-align:left">Distribución</th><th>%</th></tr></thead><tbody>';
  [1,2,3,4,5,6,0].forEach(function(dia,i) {
    var n=porDia[dia]||0;
    var pct=total>0?((n/total)*100).toFixed(1)+"%":"0%";
    var barWidth=maxVal>0?Math.round((n/maxVal)*120):0;
    var esCritico=n===maxVal&&n>0;
    html+='<tr><td style="color:'+(esCritico?"#f5a623":"#c0c6d8")+';font-weight:'+(esCritico?"700":"400")+'">'+DIAS_SEMANA[dia]+(esCritico?' 🔴':'')+'</td>' +
      '<td>'+n+'</td>' +
      '<td><div class="bar" style="background:'+(esCritico?"#e74c3c":"#f5a623")+';width:'+barWidth+'px"></div></td>' +
      '<td class="ac2">'+pct+'</td></tr>';
  });
  return html+'</tbody></table>';
}

// ==========================================
// HTML INFORME GLOBAL
// ==========================================
function dashHtmlGlobal(nombreMes, anyo, totalGlobal, porTienda, incGlobal, comparativaMeses, pedidosMes, distDias, tendencia) {
  var tiendasOrd=Object.entries(porTienda).sort(function(a,b){return b[1].length-a[1].length;});
  var totalPedidos=Object.values(pedidosMes).reduce(function(s,v){return s+v;},0);
  var ratioGlobal=totalPedidos>0?((totalGlobal/totalPedidos)*100).toFixed(2)+"%":"Sin datos";
  var pctSinInc=totalPedidos>0?(((totalPedidos-totalGlobal)/totalPedidos)*100).toFixed(1)+"%":"Sin datos";
  var diaCrit=diaCritico(distDias);
  var top3inc=Object.entries(incGlobal).sort(function(a,b){return b[1]-a[1];}).slice(0,3);
  var semCls=tendencia.color==="#e74c3c"?"r":tendencia.color==="#27ae60"?"v":"a";

  var html='<!DOCTYPE html><html><head>'+dashEstilos()+'</head><body><div class="wrap">'+
    dashHtmlHdr("📊","Informe Global — Pedido Cliente",
      "Plataforma Leroy Merlin Málaga",
      '<span><strong>'+nombreMes+' '+anyo+'</strong></span><span> · </span>'+
      '<span>Generado el <strong>'+formatearFechaDash(new Date())+'</strong></span><span> · </span>'+
      '<span>4 tiendas</span>')+
    '<div class="body">'+
    '<div class="intro">Buenos días,<br><br>'+
    'Os adjunto el informe global de incidencias de la operativa <strong>Pedido Cliente</strong>, '+
    'correspondiente al mes de <strong>'+nombreMes+' '+anyo+'</strong>, '+
    'recogidas en la <strong>Plataforma Leroy Merlin Málaga</strong>.<br><br>'+
    'Este informe recoge las incidencias detectadas en los pedidos enviados desde las tiendas a la plataforma, '+
    'así como los pedidos recepcionados durante el mes.<br><br>Un saludo.</div>'+
    '<div class="sem '+semCls+'"><div class="dot"></div><p>'+tendencia.texto+'</p></div>'+
    '<table class="kg"><tr class="kr">'+
    dashKpi(totalGlobal,"Total incidencias","ac")+
    dashKpi(totalPedidos.toLocaleString('es-ES'),"Total pedidos","wh")+
    dashKpi(ratioGlobal,"% Inc. / Pedidos","rd")+
    dashKpi(pctSinInc,"% Sin incidencia","gr")+
    '</tr></table>'+
    '<div class="hl"><div class="hl-ic">📅</div><div>'+
    '<div class="hl-lb">Día con más incidencias</div>'+
    '<div class="hl-vl">'+diaCrit.dia+' <span>('+diaCrit.valor+' incidencias este mes)</span></div>'+
    '</div></div>'+
    '<div class="sec">🏆 Top 3 incidencias del mes</div>'+
    '<table class="top3"><tr class="t3r">';

  top3inc.forEach(function(entry,i){
    var medallas=["🥇","🥈","🥉"];
    var pct=((entry[1]/totalGlobal)*100).toFixed(1)+"%";
    html+='<td class="t3c"><div class="med">'+medallas[i]+'</div>'+
      '<div class="nm">'+formatearIncidencia(entry[0])+'</div>'+
      '<div class="num">'+entry[1]+'</div><div class="pct">'+pct+'</div></td>';
  });

  html+='</tr></table>'+
    '<div class="sec">🏪 Ranking por tienda</div>'+
    '<table class="t"><thead><tr>'+
    '<th>#</th><th>Tienda</th><th>Pedidos</th><th>Inc.</th><th>% Sin inc.</th><th>% Inc./Ped.</th><th>Tipo más frecuente</th>'+
    '</tr></thead><tbody>';

  tiendasOrd.forEach(function(entry,i){
    var tienda=entry[0],filas=entry[1],total=filas.length;
    var peds=pedidosMes[tienda]||0;
    var ratio=peds>0?((total/peds)*100).toFixed(2)+"%":"-";
    var pctSinT=peds>0?(((peds-total)/peds)*100).toFixed(1)+"%":"-";
    var incT={};
    filas.forEach(function(f){var t=f[DASHBOARD_CONFIG.COL_INCIDENCIA]||"Sin tipo";incT[t]=(incT[t]||0)+1;});
    var topInc=Object.entries(incT).sort(function(a,b){return b[1]-a[1];})[0];
    var rColor=(peds>0&&(total/peds)>0.05)?"rd2":"gr2";
    html+='<tr><td class="rk">#'+(i+1)+'</td><td><strong>'+tienda+'</strong></td>'+
      '<td>'+peds.toLocaleString('es-ES')+'</td><td>'+total+'</td>'+
      '<td class="gr2">'+pctSinT+'</td><td class="'+rColor+'">'+ratio+'</td>'+
      '<td>'+(topInc?formatearIncidencia(topInc[0]):"-")+'</td></tr>';
  });

  html+='</tbody></table>'+
    '<div class="sec">📅 Distribución por día de la semana</div>'+
    dashHtmlDistribucionDias(distDias,totalGlobal)+
    '<div class="sec">⚠️ Tipos de incidencia global</div>'+
    '<table class="t"><thead><tr><th>Tipo</th><th>Total</th><th>%</th></tr></thead><tbody>';

  Object.entries(incGlobal).sort(function(a,b){return b[1]-a[1];}).forEach(function(entry){
    html+='<tr><td>'+formatearIncidencia(entry[0])+'</td><td>'+entry[1]+'</td>'+
      '<td class="ac2">'+((entry[1]/totalGlobal)*100).toFixed(1)+"%</td></tr>";
  });

  html+='</tbody></table>'+
    '<div class="sec">📈 Evolución últimos 6 meses</div>'+
    dashHtmlComparativa(comparativaMeses)+
    '</div>'+dashHtmlFtr()+'</div></body></html>';

  return html;
}

// ==========================================
// HTML INFORME POR TIENDA
// ==========================================
function dashHtmlTienda(tienda, nombreMes, anyo, filas, resumenMeses, anyoMes, mesAnterior, pedidosTienda, distDias, tendencia) {
  var totalTienda=filas.length, incTienda={};
  filas.forEach(function(f){
    var t=f[DASHBOARD_CONFIG.COL_INCIDENCIA]||"Sin tipo";
    incTienda[t]=(incTienda[t]||0)+1;
  });
  var incOrd=Object.entries(incTienda).sort(function(a,b){return b[1]-a[1];});
  var top3=incOrd.slice(0,3);
  var diasMes=new Date(anyoMes,mesAnterior+1,0).getDate();
  var mediaDiaria=(totalTienda/diasMes).toFixed(1);
  var ratioPct=pedidosTienda>0?((totalTienda/pedidosTienda)*100).toFixed(2)+"%":"Sin datos";
  var ratioColor=(pedidosTienda>0&&(totalTienda/pedidosTienda)>0.05)?"rd":"gr";
  var pctSinInc=pedidosTienda>0?(((pedidosTienda-totalTienda)/pedidosTienda)*100).toFixed(1)+"%":"Sin datos";
  var diaCrit=diaCritico(distDias);

  var mesAntIdx=mesAnterior===0?11:mesAnterior-1;
  var anyoAnt=mesAnterior===0?anyoMes-1:anyoMes;
  var claveAnt=anyoAnt+"-"+String(mesAntIdx+1).padStart(2,"0");
  var totalMesAnt=resumenMeses[claveAnt]&&resumenMeses[claveAnt].porTienda[tienda]?resumenMeses[claveAnt].porTienda[tienda]:null;
  var vsAntTexto="-", vsAntCls="wh";
  if (totalMesAnt!==null) {
    var difAnt=totalTienda-totalMesAnt;
    var pctAnt=((difAnt/totalMesAnt)*100).toFixed(1);
    if (difAnt===0) {
      vsAntTexto="= Igual (0% vs mes ant.)";
      vsAntCls="wh";
    } else {
      vsAntTexto=(difAnt>0?"▲ +":"▼ ")+difAnt+" ("+Math.abs(pctAnt)+"% vs mes ant.)";
      vsAntCls=difAnt>0?"rd":"gr";
    }
  }

  var compMesesTienda=[];
  for(var i=5;i>=0;i--){
    var m=mesAnterior-i,a=anyoMes;
    if(m<0){m+=12;a--;}
    var clave=a+"-"+String(m+1).padStart(2,"0");
    var noms=["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
    var tot=resumenMeses[clave]&&resumenMeses[clave].porTienda[tienda]?resumenMeses[clave].porTienda[tienda]:null;
    compMesesTienda.push({etiqueta:noms[m]+" "+a,total:tot});
  }

  var semCls=tendencia.color==="#e74c3c"?"r":tendencia.color==="#27ae60"?"v":"a";
  var medallas=["🥇","🥈","🥉"];

  var html='<!DOCTYPE html><html><head>'+dashEstilos()+'</head><body><div class="wrap">'+
    dashHtmlHdr("📋","Informe Incidencias — Pedido Cliente",
      "Tienda "+tienda+" · "+nombreMes+" "+anyo,
      '<span><strong>'+nombreMes+' '+anyo+'</strong></span><span> · </span>'+
      '<span>Generado el <strong>'+formatearFechaDash(new Date())+'</strong></span>')+
    '<div class="body">'+
    '<div class="intro">Buenos días,<br><br>'+
    'Os adjunto el informe de incidencias de la operativa <strong>Pedido Cliente</strong>, '+
    'correspondiente al mes de <strong>'+nombreMes+' '+anyo+'</strong>, '+
    'detectadas en la <strong>Plataforma Leroy Merlin Málaga</strong>.<br><br>'+
    'Este informe recoge las incidencias en los pedidos enviados desde vuestra tienda a la plataforma. '+
    'Os animamos a revisar los tipos más frecuentes y trabajar conjuntamente en su reducción.<br><br>Un saludo.</div>'+
    '<div class="sem '+semCls+'"><div class="dot"></div><p>'+tendencia.texto+'</p></div>'+
    '<table class="kg"><tr class="kr">'+
    dashKpi(totalTienda,"Incidencias","ac")+
    dashKpi(pedidosTienda.toLocaleString('es-ES'),"Pedidos recepcionados","wh")+
    dashKpi(pctSinInc,"% Sin incidencia","gr")+
    dashKpi(ratioPct,"% Inc. / Pedidos",ratioColor)+
    '</tr></table>'+
    '<table class="kg"><tr class="kr">'+
    dashKpi(mediaDiaria,"Media diaria","ac")+
    dashKpi('<span style="font-size:14px;font-weight:700" class="'+vsAntCls+'">'+vsAntTexto+'</span>',"VS mes anterior","wh")+
    dashKpi(diaCrit.dia,"Día más crítico ("+diaCrit.valor+" inc.)","ac")+
    '</tr></table>'+
    '<div class="sec">🏆 Top 3 incidencias del mes</div>'+
    '<table class="top3"><tr class="t3r">';

  top3.forEach(function(entry,i){
    var pct=((entry[1]/totalTienda)*100).toFixed(1)+"%";
    html+='<td class="t3c"><div class="med">'+medallas[i]+'</div>'+
      '<div class="nm">'+formatearIncidencia(entry[0])+'</div>'+
      '<div class="num">'+entry[1]+'</div><div class="pct">'+pct+'</div></td>';
  });

  html+='</tr></table>'+
    '<div class="sec">📅 Distribución por día de la semana</div>'+
    dashHtmlDistribucionDias(distDias,totalTienda)+
    '<div class="sec">⚠️ Detalle por tipo de incidencia</div>'+
    '<table class="t"><thead><tr><th>Tipo</th><th>Total</th><th>%</th></tr></thead><tbody>';

  incOrd.forEach(function(entry){
    html+='<tr><td>'+formatearIncidencia(entry[0])+'</td><td>'+entry[1]+'</td>'+
      '<td class="ac2">'+((entry[1]/totalTienda)*100).toFixed(1)+"%</td></tr>";
  });

  html+='</tbody></table>'+
    '<div class="sec">📈 Tu evolución últimos 6 meses</div>'+
    dashHtmlComparativa(compMesesTienda)+
    '</div>'+dashHtmlFtr()+'</div></body></html>';

  return html;
}

// ==========================================
// LIMPIAR DASHBOARD
// ==========================================
function limpiarDashboard() {
  var ss=SpreadsheetApp.getActiveSpreadsheet();
  var hDash=ss.getSheetByName(DASHBOARD_CONFIG.NOMBRE_HOJA_DASHBOARD);
  if (hDash) {
    hDash.clearContents(); hDash.clearFormats();
    hDash.getCharts().forEach(function(c){hDash.removeChart(c);});
    SpreadsheetApp.getUi().alert("🗑️ Dashboard limpiado.");
  }
}

// ==========================================
// TRIGGERS DASHBOARD
// ==========================================
function instalarTriggers() {
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (["ejecutarDashboardDiario","ejecutarInformeMensualAutomatico","ejecutarEnvioDia24"]
        .indexOf(t.getHandlerFunction()) !== -1)
      ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger("ejecutarDashboardDiario").timeBased().atHour(6).everyDays(1).create();
  ScriptApp.newTrigger("ejecutarInformeMensualAutomatico").timeBased().onMonthDay(1).atHour(10).create();
  ScriptApp.newTrigger("ejecutarEnvioDia24").timeBased().atHour(9).everyDays(1).create();
  SpreadsheetApp.getUi().alert("✅ Triggers instalados:\n- Dashboard diario: 6 AM\n- Informe mensual incidencias: día 1 a las 10 AM\n- Informe PC Total: día 24 a las 9 AM");
}

// ==========================================
// UTILIDADES
// ==========================================
function formatearFechaDash(fecha) {
  if (!fecha||isNaN(fecha)) return "";
  var d=fecha.getDate().toString().padStart(2,"0");
  var m=(fecha.getMonth()+1).toString().padStart(2,"0");
  return d+"/"+m+"/"+fecha.getFullYear();
}
