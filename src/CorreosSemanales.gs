// ==========================================
// MÓDULO: CORREOS SEMANALES
// ==========================================

// ==========================================
// CORREO 1 — RETRASOS EQUIPO
// ==========================================
function enviarCorreoRetrasos() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName("RETRASOS_EQUIPO");
  if (!hoja || hoja.getLastRow() < 2) return;
  var datos = hoja.getDataRange().getValues();
  var numSemana = getWeekNumber(new Date());

  var totalLineas = 0;
  var numTiendas = new Set();
  var totalArrastres = 0;
  var numTiendasArrastre = new Set();
  var bloqueActual = ""; // "RETRASOS" | "ARRASTRES" | ""
  datos.forEach(function(f) {
    var celda = f[0].toString();
    if (celda.includes("RETRASOS:")) {
      numTiendas.add(celda.replace("RETRASOS: ","").trim());
      bloqueActual = "RETRASOS";
    } else if (celda.includes("ARRASTRES:")) {
      numTiendasArrastre.add(celda.replace("ARRASTRES: ","").trim());
      bloqueActual = "ARRASTRES";
    } else if (celda !== "" && !celda.includes("Ubicación")) {
      // Fila vacía NO resetea bloqueActual: la propia fila de cabecera de
      // columnas de cada bloque suele traer col A en blanco (título del
      // Excel mergeado en otra celda), y confundirla con el separador entre
      // bloques dejaba bloqueActual="" antes de contar ninguna línea real.
      if (bloqueActual === "RETRASOS") totalLineas++;
      else if (bloqueActual === "ARRASTRES") totalArrastres++;
    }
  });

  var sWrap = 'width:100%;max-width:900px;margin:0 auto;font-family:Arial,sans-serif;background:#0a0b10;border-radius:12px;overflow:hidden;';
  var sHdr  = 'background:#0a0b10;padding:24px 32px 18px;border-bottom:2px solid #f5a623;';
  var sLogo = 'height:32px;vertical-align:middle;';
  var sDivH = 'display:inline-block;width:1px;height:32px;background:rgba(245,166,35,.4);margin:0 14px;vertical-align:middle;';
  var sH1   = 'color:#f5a623;font-size:18px;font-weight:700;margin:0;display:inline;vertical-align:middle;';
  var sSub  = 'color:#7a8299;font-size:12px;margin:6px 0 0;';
  var sMeta = 'color:#3d4560;font-size:11px;margin:4px 0 0;';
  var sBody = 'background:#111520;padding:26px 32px;';
  var sIntro= 'border-left:3px solid #f5a623;padding:13px 16px;background:rgba(245,166,35,.05);border-radius:0 8px 8px 0;margin-bottom:22px;color:#c0c6d8;font-size:13px;line-height:1.8;';
  var sKpiW = 'width:100%;border-collapse:separate;border-spacing:8px;margin-bottom:22px;';
  var sKpi  = 'background:#181d2c;border:1px solid rgba(245,166,35,.15);border-radius:10px;padding:14px 10px;text-align:center;width:33%;';
  var sKvRd = 'font-size:24px;font-weight:700;color:#e74c3c;margin-bottom:4px;';
  var sKvAc = 'font-size:24px;font-weight:700;color:#f5a623;margin-bottom:4px;';
  var sKvWh = 'font-size:24px;font-weight:700;color:#f0f2f8;margin-bottom:4px;';
  var sKl   = 'font-size:10px;color:#7a8299;text-transform:uppercase;letter-spacing:.6px;';
  var sSec  = 'font-size:11px;font-weight:700;color:#f5a623;text-transform:uppercase;letter-spacing:.8px;border-bottom:1px solid rgba(245,166,35,.15);padding-bottom:6px;margin-bottom:10px;';
  var sTbl  = 'width:100%;border-collapse:collapse;font-size:12px;margin-bottom:22px;';
  var sThL  = 'background:#0a0b10;color:#f5a623;padding:8px 10px;text-align:left;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.4px;border-bottom:1px solid rgba(245,166,35,.2);';
  var sTh   = 'background:#0a0b10;color:#f5a623;padding:8px 10px;text-align:center;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.4px;border-bottom:1px solid rgba(245,166,35,.2);';
  var sFtr  = 'background:#0a0b10;padding:12px 32px;border-top:1px solid rgba(245,166,35,.12);overflow:hidden;';
  var sFtrP = 'font-size:11px;color:#3d4560;';
  var sBdg  = 'font-size:10px;padding:2px 8px;border-radius:10px;background:rgba(245,166,35,.1);color:#b87a1a;border:1px solid rgba(245,166,35,.2);float:right;';

  var tablaHtml = '<table style="' + sTbl + '"><thead><tr>' +
    '<th style="' + sThL + '">Tienda</th>' +
    '<th style="' + sTh + '">Ubicación</th>' +
    '<th style="' + sTh + '">Pedido</th>' +
    '<th style="' + sTh + '">Secc.</th>' +
    '<th style="' + sThL + '">Descripción</th>' +
    '<th style="' + sTh + '">Fecha</th>' +
    '</tr></thead><tbody>';

  var tiendaActual = "";
  var rowIdx = 0;
  var enBloqueRetrasos = false;
  datos.forEach(function(f) {
    var celda = f[0].toString();
    if (celda.includes("RETRASOS:")) {
      tiendaActual = formatNombreTienda(celda.replace("RETRASOS: ","").trim());
      rowIdx = 0;
      enBloqueRetrasos = true;
    } else if (celda.includes("ARRASTRES:")) {
      enBloqueRetrasos = false; // este bloque se pinta en la tabla de Arrastres, no aquí
    } else if (celda !== "" && enBloqueRetrasos && !celda.includes("Ubicación")) {
      var bg = rowIdx%2===0 ? '#1a2035' : '#141928';
      var tdL = 'padding:7px 10px;color:#c0c6d8;text-align:left;border-bottom:1px solid rgba(255,255,255,.04);background:'+bg+';';
      var tdC = 'padding:7px 10px;color:#f0f2f8;text-align:center;border-bottom:1px solid rgba(255,255,255,.04);background:'+bg+';';
      var fecha = (f[11] instanceof Date) ? formatearFechaCorta(f[11]) : (f[11] || "");
      tablaHtml += '<tr>' +
        '<td style="'+tdL+'"><strong>'+tiendaActual+'</strong></td>' +
        '<td style="'+tdC+'">'+f[0]+'</td>' +
        '<td style="'+tdC+'">'+f[1]+'</td>' +
        '<td style="'+tdC+'">'+f[2]+'</td>' +
        '<td style="'+tdL+'">'+f[5]+'</td>' +
        '<td style="'+tdC+'">'+fecha+'</td>' +
        '</tr>';
      rowIdx++;
    }
  });
  tablaHtml += '</tbody></table>';

  // Tabla de "Arrastres" — ubicaciones transitorias de plataforma
  // (TOR/VALEN/ANTEQ). Aviso inmediato cada semana, sin memoria: es un
  // apartado aparte del de "Líneas en atraso" porque son POSIBLES retrasos,
  // no confirmados.
  var tablaArrastresHtml = '<table style="' + sTbl + '"><thead><tr>' +
    '<th style="' + sThL + '">Tienda</th>' +
    '<th style="' + sTh + '">Ubicación</th>' +
    '<th style="' + sTh + '">Pedido</th>' +
    '<th style="' + sTh + '">Secc.</th>' +
    '<th style="' + sThL + '">Descripción</th>' +
    '<th style="' + sTh + '">Fecha</th>' +
    '</tr></thead><tbody>';

  var tiendaArrastreActual = "";
  var rowIdxArrastre = 0;
  var enBloqueArrastres = false;
  datos.forEach(function(f) {
    var celda = f[0].toString();
    if (celda.includes("ARRASTRES:")) {
      tiendaArrastreActual = formatNombreTienda(celda.replace("ARRASTRES: ","").trim());
      rowIdxArrastre = 0;
      enBloqueArrastres = true;
    } else if (celda.includes("RETRASOS:")) {
      enBloqueArrastres = false;
    } else if (celda !== "" && enBloqueArrastres && !celda.includes("Ubicación")) {
      var bgA = rowIdxArrastre%2===0 ? '#1a2035' : '#141928';
      var tdLA = 'padding:7px 10px;color:#c0c6d8;text-align:left;border-bottom:1px solid rgba(255,255,255,.04);background:'+bgA+';';
      var tdCA = 'padding:7px 10px;color:#f0f2f8;text-align:center;border-bottom:1px solid rgba(255,255,255,.04);background:'+bgA+';';
      var fechaA = (f[11] instanceof Date) ? formatearFechaCorta(f[11]) : (f[11] || "");
      tablaArrastresHtml += '<tr>' +
        '<td style="'+tdLA+'"><strong>'+tiendaArrastreActual+'</strong></td>' +
        '<td style="'+tdCA+'">'+f[0]+'</td>' +
        '<td style="'+tdCA+'">'+f[1]+'</td>' +
        '<td style="'+tdCA+'">'+f[2]+'</td>' +
        '<td style="'+tdLA+'">'+f[5]+'</td>' +
        '<td style="'+tdCA+'">'+fechaA+'</td>' +
        '</tr>';
      rowIdxArrastre++;
    }
  });
  tablaArrastresHtml += '</tbody></table>';

  var seccionArrastres = totalArrastres > 0 ?
    '<p style="'+sSec+'">🚧 Arrastres — posibles retrasos en ubicaciones transitorias de plataforma, Torija/Valencia/Antequera ('+totalArrastres+' línea'+(totalArrastres===1?'':'s')+' · '+numTiendasArrastre.size+' tienda'+(numTiendasArrastre.size===1?'':'s')+')</p>' +
    tablaArrastresHtml : '';

  var html = '<div style="'+sWrap+'">' +
    '<div style="'+sHdr+'">' +
    '<img src="'+LOGO_URL+'" style="'+sLogo+'" alt="TAISA">' +
    '<span style="'+sDivH+'"></span>' +
    '<span style="'+sH1+'">⚠️ Revisión líneas por ubicar — Semana '+numSemana+'</span>' +
    '<p style="'+sSub+'">Plataforma Leroy Merlin Málaga</p>' +
    '<p style="'+sMeta+'">Semana '+numSemana+' &nbsp;·&nbsp; '+formatearFechaCorta(new Date())+(MODO_PRUEBA?' &nbsp;·&nbsp; ⚠️ MODO PRUEBA':'')+'</p>' +
    '</div>' +
    '<div style="'+sBody+'">' +
    '<div style="'+sIntro+'">¡Hola equipo! Por favor, en cuanto podáis, dadle un vistazo prioritario a las líneas en atraso. El objetivo es ubicarlas y gestionarlas cuanto antes. ¡Gracias!</div>' +
    '<table style="'+sKpiW+'"><tr>' +
    '<td style="'+sKpi+'"><div style="'+sKvRd+'">'+totalLineas+'</div><div style="'+sKl+'">Líneas en atraso</div></td>' +
    '<td style="'+sKpi+'"><div style="'+sKvAc+'">'+numTiendas.size+'</div><div style="'+sKl+'">Tiendas afectadas</div></td>' +
    '<td style="'+sKpi+'"><div style="'+sKvWh+'">'+numSemana+'</div><div style="'+sKl+'">Semana actual</div></td>' +
    '</tr></table>' +
    '<p style="'+sSec+'">⚠️ Líneas en atraso por tienda</p>' +
    tablaHtml +
    seccionArrastres +
    '</div>' +
    '<div style="'+sFtr+'">' +
    '<span style="'+sBdg+'">'+(MODO_PRUEBA?'PRUEBA':'PRODUCCIÓN')+'</span>' +
    '<p style="'+sFtrP+'">Generado automáticamente el '+formatearFechaCorta(new Date())+' — TAISA Logistics · Plataforma Leroy Merlin Málaga</p>' +
    '</div></div>';

  MailApp.sendEmail({
    to: MODO_PRUEBA ? CORREO_PRUEBA : CC_COMUN,
    subject: (MODO_PRUEBA ? "[PRUEBA] " : "") + "⚠️ Revisión líneas por ubicar — Semana " + numSemana,
    htmlBody: html
  });
  SpreadsheetApp.getUi().alert("🚀 Correo de retrasos enviado.");
}

// ==========================================
// CORREO 2 — RESUMEN SEMANAL
// ==========================================
function enviarCorreoResumenSemanal() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName("RESUMEN_SEMANAL");
  if (!hoja) return;
  var numSemana = getWeekNumber(new Date());
  var datos = hoja.getDataRange().getValues();

  var tP=0, tL=0, tU=0, tE=0;
  datos.forEach(function(f) {
    if (f[0]==="TOTAL") { tP+=Number(f[1])||0; tL+=Number(f[2])||0; tU+=Number(f[3])||0; tE+=Number(f[4])||0; }
    if (f[6]==="TOTAL") { tP+=Number(f[7])||0; tL+=Number(f[8])||0; tU+=Number(f[9])||0; tE+=Number(f[10])||0; }
  });

  var coloresT = {"MARBELLA":"#c9daf8","MALAGA":"#d9ead3","GRANADA":"#ffe599","MIJAS":"#e4d0ff"};

  var sWrap = 'width:100%;max-width:900px;margin:0 auto;font-family:Arial,sans-serif;background:#0a0b10;border-radius:12px;overflow:hidden;';
  var sHdr  = 'background:#0a0b10;padding:24px 32px 18px;border-bottom:2px solid #f5a623;';
  var sLogo = 'height:32px;vertical-align:middle;';
  var sDivH = 'display:inline-block;width:1px;height:32px;background:rgba(245,166,35,.4);margin:0 14px;vertical-align:middle;';
  var sH1   = 'color:#f5a623;font-size:18px;font-weight:700;margin:0;display:inline;vertical-align:middle;';
  var sSub  = 'color:#7a8299;font-size:12px;margin:6px 0 0;';
  var sMeta = 'color:#3d4560;font-size:11px;margin:4px 0 0;';
  var sBody = 'background:#111520;padding:26px 32px;';
  var sIntro= 'border-left:3px solid #f5a623;padding:13px 16px;background:rgba(245,166,35,.05);border-radius:0 8px 8px 0;margin-bottom:22px;color:#c0c6d8;font-size:13px;line-height:1.8;';
  var sKpiW = 'width:100%;border-collapse:separate;border-spacing:8px;margin-bottom:22px;';
  var sKpi  = 'background:#181d2c;border:1px solid rgba(245,166,35,.15);border-radius:10px;padding:14px 10px;text-align:center;width:25%;';
  var sKvAc = 'font-size:24px;font-weight:700;color:#f5a623;margin-bottom:4px;';
  var sKvWh = 'font-size:24px;font-weight:700;color:#f0f2f8;margin-bottom:4px;';
  var sKl   = 'font-size:10px;color:#7a8299;text-transform:uppercase;letter-spacing:.6px;';
  var sSec  = 'font-size:11px;font-weight:700;color:#f5a623;text-transform:uppercase;letter-spacing:.8px;border-bottom:1px solid rgba(245,166,35,.15);padding-bottom:6px;margin-bottom:10px;';
  var sTbl  = 'width:100%;border-collapse:collapse;font-size:12px;margin-bottom:22px;';
  var sThL  = 'background:#0a0b10;color:#f5a623;padding:8px 10px;text-align:left;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.4px;border-bottom:1px solid rgba(245,166,35,.2);';
  var sTh   = 'background:#0a0b10;color:#f5a623;padding:8px 10px;text-align:center;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.4px;border-bottom:1px solid rgba(245,166,35,.2);';
  var sFtr  = 'background:#0a0b10;padding:12px 32px;border-top:1px solid rgba(245,166,35,.12);overflow:hidden;';
  var sFtrP = 'font-size:11px;color:#3d4560;';
  var sBdg  = 'font-size:10px;padding:2px 8px;border-radius:10px;background:rgba(245,166,35,.1);color:#b87a1a;border:1px solid rgba(245,166,35,.2);float:right;';

  function buildBloque(datos, colBase) {
    var html = '';
    var tiendaNombre = '';
    var tiendaColor = '#f5a623';
    var enTienda = false;
    var filasTabla = [];

    datos.forEach(function(f) {
      var celda = f[colBase];
      if (celda && celda.toString().startsWith("TIENDA:")) {
        if (enTienda && filasTabla.length > 0) {
          html += renderBloque(tiendaNombre, tiendaColor, filasTabla, colBase);
          filasTabla = [];
        }
        tiendaNombre = celda.toString().replace("TIENDA: ","").trim();
        tiendaColor = coloresT[tiendaNombre] || "#f5a623";
        enTienda = true;
      } else if (enTienda && celda !== "") {
        filasTabla.push(f);
      }
    });

    if (enTienda && filasTabla.length > 0) {
      html += renderBloque(tiendaNombre, tiendaColor, filasTabla, colBase);
    }
    return html;
  }

  function renderBloque(nombre, color, filas, col) {
    var html = '<p style="font-size:13px;font-weight:700;color:'+color+';margin:16px 0 6px;border-left:3px solid '+color+';padding-left:8px;">🏪 '+formatNombreTienda(nombre)+'</p>';
    html += '<table style="'+sTbl+'"><thead><tr>' +
      '<th style="'+sThL+'">Sección</th>' +
      '<th style="'+sTh+'">Pedidos</th>' +
      '<th style="'+sTh+'">Líneas</th>' +
      '<th style="'+sTh+'">Ubic.</th>' +
      '<th style="'+sTh+'">Total €</th>' +
      '</tr></thead><tbody>';
    var rowIdx = 0;
    filas.forEach(function(f) {
      var bg = rowIdx%2===0 ? '#1a2035' : '#141928';
      var tdL = 'padding:7px 10px;color:#c0c6d8;text-align:left;border-bottom:1px solid rgba(255,255,255,.04);background:'+bg+';';
      var tdC = 'padding:7px 10px;color:#f0f2f8;text-align:center;border-bottom:1px solid rgba(255,255,255,.04);background:'+bg+';';
      var tdAc= 'padding:7px 10px;color:#f5a623;font-weight:600;text-align:center;border-bottom:1px solid rgba(255,255,255,.04);background:'+bg+';';
      var tdTL= 'padding:7px 10px;color:#f5a623;font-weight:700;text-align:left;border-top:2px solid rgba(245,166,35,.3);background:#0a0b10;';
      var tdTC= 'padding:7px 10px;color:#f5a623;font-weight:700;text-align:center;border-top:2px solid rgba(245,166,35,.3);background:#0a0b10;';
      if (f[col]==="TOTAL" || f[col]==="Total") {
        html += '<tr>' +
          '<td style="'+tdTL+'">Total</td>' +
          '<td style="'+tdTC+'">'+(f[col+1]||0)+'</td>' +
          '<td style="'+tdTC+'">'+(f[col+2]||0)+'</td>' +
          '<td style="'+tdTC+'">'+(f[col+3]||0)+'</td>' +
          '<td style="'+tdTC+'">'+Math.round(f[col+4]||0).toLocaleString('es-ES')+'€</td>' +
          '</tr>';
      } else if (f[col] !== "" && f[col] !== "SECC") {
        html += '<tr>' +
          '<td style="'+tdL+'">'+f[col]+'</td>' +
          '<td style="'+tdC+'">'+(f[col+1]||0)+'</td>' +
          '<td style="'+tdC+'">'+(f[col+2]||0)+'</td>' +
          '<td style="'+tdC+'">'+(f[col+3]||0)+'</td>' +
          '<td style="'+tdAc+'">'+Math.round(f[col+4]||0).toLocaleString('es-ES')+'€</td>' +
          '</tr>';
        rowIdx++;
      }
    });
    html += '</tbody></table>';
    return html;
  }

  var tablaIzq = buildBloque(datos, 0);
  var tablaDer = buildBloque(datos, 6);

  var html = '<div style="'+sWrap+'">' +
    '<div style="'+sHdr+'">' +
    '<img src="'+LOGO_URL+'" style="'+sLogo+'" alt="TAISA">' +
    '<span style="'+sDivH+'"></span>' +
    '<span style="'+sH1+'">📊 PC Total — Semana '+numSemana+'</span>' +
    '<p style="'+sSub+'">Resumen de ocupación semanal · Plataforma Leroy Merlin Málaga</p>' +
    '<p style="'+sMeta+'">Semana '+numSemana+' &nbsp;·&nbsp; '+formatearFechaCorta(new Date())+(MODO_PRUEBA?' &nbsp;·&nbsp; ⚠️ MODO PRUEBA':'')+'</p>' +
    '</div>' +
    '<div style="'+sBody+'">' +
    '<div style="'+sIntro+'">Hola,<br><br>Te paso el dato de ocupación de esta semana.</div>' +
    '<table style="'+sKpiW+'"><tr>' +
    '<td style="'+sKpi+'"><div style="'+sKvAc+'">'+tP.toLocaleString('es-ES')+'</div><div style="'+sKl+'">Pedidos totales</div></td>' +
    '<td style="'+sKpi+'"><div style="'+sKvWh+'">'+tL.toLocaleString('es-ES')+'</div><div style="'+sKl+'">Líneas totales</div></td>' +
    '<td style="'+sKpi+'"><div style="'+sKvWh+'">'+tU.toLocaleString('es-ES')+'</div><div style="'+sKl+'">Ubicaciones</div></td>' +
    '<td style="'+sKpi+'"><div style="'+sKvAc+'">'+Math.round(tE).toLocaleString('es-ES')+'€</div><div style="'+sKl+'">Valor total</div></td>' +
    '</tr></table>' +
    '<p style="'+sSec+'">🏪 Resumen por tienda y sección</p>' +
    tablaIzq +
    tablaDer +
    '</div>' +
    '<div style="'+sFtr+'">' +
    '<span style="'+sBdg+'">'+(MODO_PRUEBA?'PRUEBA':'PRODUCCIÓN')+'</span>' +
    '<p style="'+sFtrP+'">Generado automáticamente el '+formatearFechaCorta(new Date())+' — TAISA Logistics · Plataforma Leroy Merlin Málaga</p>' +
    '</div></div>';

  MailApp.sendEmail({
    to: MODO_PRUEBA ? CORREO_PRUEBA : "jose-manuel.lachambre@leroymerlin.es",
    cc: MODO_PRUEBA ? "" : CC_COMUN,
    subject: (MODO_PRUEBA ? "[PRUEBA] " : "") + "📊 PC Total — Semana " + numSemana,
    htmlBody: html
  });
  SpreadsheetApp.getUi().alert("🚀 Resumen semanal enviado.");
}

// ==========================================
// CORREO 3 — REVISIÓN A TIENDAS
// ==========================================
function enviarCorreoRevisionTienda() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName("Revision_tienda");
  if (!hoja) return;
  var numSemana = getWeekNumber(new Date());
  var datos = hoja.getDataRange().getValues();
  var tiendas = ["MARBELLA","MALAGA","MIJAS"];

  var sWrap = 'width:100%;max-width:900px;margin:0 auto;font-family:Arial,sans-serif;background:#0a0b10;border-radius:12px;overflow:hidden;';
  var sHdr  = 'background:#0a0b10;padding:24px 32px 18px;border-bottom:2px solid #f5a623;';
  var sLogo = 'height:32px;vertical-align:middle;';
  var sDivH = 'display:inline-block;width:1px;height:32px;background:rgba(245,166,35,.4);margin:0 14px;vertical-align:middle;';
  var sH1   = 'color:#f5a623;font-size:18px;font-weight:700;margin:0;display:inline;vertical-align:middle;';
  var sSub  = 'color:#7a8299;font-size:12px;margin:6px 0 0;';
  var sMeta = 'color:#3d4560;font-size:11px;margin:4px 0 0;';
  var sBody = 'background:#111520;padding:26px 32px;';
  var sIntro= 'border-left:3px solid #f5a623;padding:13px 16px;background:rgba(245,166,35,.05);border-radius:0 8px 8px 0;margin-bottom:22px;color:#c0c6d8;font-size:13px;line-height:1.8;';
  var sKpiW = 'width:100%;border-collapse:separate;border-spacing:8px;margin-bottom:22px;';
  var sKpi  = 'background:#181d2c;border:1px solid rgba(245,166,35,.15);border-radius:10px;padding:14px 10px;text-align:center;width:33%;';
  var sKvRd = 'font-size:24px;font-weight:700;color:#e74c3c;margin-bottom:4px;';
  var sKvAc = 'font-size:24px;font-weight:700;color:#f5a623;margin-bottom:4px;';
  var sKvWh = 'font-size:24px;font-weight:700;color:#f0f2f8;margin-bottom:4px;';
  var sKl   = 'font-size:10px;color:#7a8299;text-transform:uppercase;letter-spacing:.6px;';
  var sSec  = 'font-size:11px;font-weight:700;color:#f5a623;text-transform:uppercase;letter-spacing:.8px;border-bottom:1px solid rgba(245,166,35,.15);padding-bottom:6px;margin-bottom:10px;';
  var sTbl  = 'width:100%;border-collapse:collapse;font-size:12px;margin-bottom:22px;';
  var sThL  = 'background:#0a0b10;color:#f5a623;padding:8px 10px;text-align:left;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.4px;border-bottom:1px solid rgba(245,166,35,.2);';
  var sTh   = 'background:#0a0b10;color:#f5a623;padding:8px 10px;text-align:center;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.4px;border-bottom:1px solid rgba(245,166,35,.2);';
  var sFtr  = 'background:#0a0b10;padding:12px 32px;border-top:1px solid rgba(245,166,35,.12);overflow:hidden;';
  var sFtrP = 'font-size:11px;color:#3d4560;';
  var sBdg  = 'font-size:10px;padding:2px 8px;border-radius:10px;background:rgba(245,166,35,.1);color:#b87a1a;border:1px solid rgba(245,166,35,.2);float:right;';

  // Columnas fijas a mostrar en el correo (según estructura de datos documentada
  // en CLAUDE.md). ANTES se decidía qué columnas pintar mirando si la fila de
  // cabecera del Excel importado (datos[0] de cada tienda) tenía texto en esa
  // posición (cab[idx] !== ""); si esa fila venía casi en blanco (p.ej. un
  // título de informe en una sola celda, sin cabecera real por columna), el
  // correo acababa mostrando una sola columna suelta y filas en blanco. Fijar
  // las columnas por índice hace el correo independiente del contenido variable
  // del Excel de cada semana.
  var COLUMNAS_REVISION = [
    { idx: 0,  label: "Ubicación" },
    { idx: 1,  label: "Pedido" },
    { idx: 2,  label: "Sección" },
    { idx: 4,  label: "Código SAP" },
    { idx: 5,  label: "Descripción" },
    { idx: 9,  label: "Importe €" },
    { idx: 11, label: "Fecha" }
  ];

  // Bloques reconocidos en la hoja Revision_tienda, para saber dónde termina
  // uno y empieza el siguiente (los dos tipos de cabecera cortan un bloque).
  var MARCADORES_BLOQUE = ["REVISIÓN POR UBICAR:", "ARRASTRE UBICAR:"];

  tiendas.forEach(function(nT) {
    var lineas = [];
    var lineasDestacadas = [];
    var enc = "";

    for (var i=0; i<datos.length; i++) {
      var celda0 = datos[i][0].toString();
      if (celda0.includes("REVISIÓN POR UBICAR: " + nT)) {
        enc = "NORMAL"; i++; continue; // salta la fila de cabecera del bloque
      }
      if (celda0.includes("ARRASTRE UBICAR: " + nT)) {
        enc = "DESTACADA"; i++; continue;
      }
      if (enc) {
        if (celda0 === "" || MARCADORES_BLOQUE.some(function(m){ return celda0.includes(m); })) {
          enc = "";
        } else if (enc === "NORMAL") {
          lineas.push(datos[i]);
        } else if (enc === "DESTACADA") {
          lineasDestacadas.push(datos[i]);
        }
      }
    }

    if (lineas.length === 0 && lineasDestacadas.length === 0) return;

    var nombreTienda = formatNombreTienda(nT);
    var todasLasLineas = lineas.concat(lineasDestacadas);
    var pedidosUnicos = new Set(todasLasLineas.map(function(l){ return l[1]; })).size;

    var tablaHtml = '<table style="'+sTbl+'"><thead><tr>';
    COLUMNAS_REVISION.forEach(function(col) {
      tablaHtml += '<th style="'+sThL+'">'+col.label+'</th>';
    });
    tablaHtml += '<th style="'+sTh+'"></th>';
    tablaHtml += '</tr></thead><tbody>';

    function renderFilaRevision(f, i, destacada) {
      var bg = destacada ? (i%2===0 ? '#3a1a1a' : '#2e1414') : (i%2===0 ? '#1a2035' : '#141928');
      var tdL = 'padding:7px 10px;color:#c0c6d8;text-align:left;border-bottom:1px solid rgba(255,255,255,.04);background:'+bg+';';
      var tdC = 'padding:7px 10px;color:#f0f2f8;text-align:center;border-bottom:1px solid rgba(255,255,255,.04);background:'+bg+';';
      tablaHtml += '<tr>';
      COLUMNAS_REVISION.forEach(function(col) {
        var c = f[col.idx];
        var val = (c instanceof Date) ? formatearFechaCorta(c)
          : (typeof c === 'number' && col.idx === 9) ? Math.round(c)+'€'
          : (c === '' || c === null || c === undefined) ? '—' : c;
        tablaHtml += '<td style="'+(col.idx===0||col.idx===4||col.idx===5?tdL:tdC)+'">'+val+'</td>';
      });
      tablaHtml += '<td style="'+tdC+'">'+(destacada ? '<span style="background:#e74c3c;color:#fff;font-size:9px;font-weight:700;padding:2px 6px;border-radius:8px;white-space:nowrap;">⏳ YA ESTABA</span>' : '')+'</td>';
      tablaHtml += '</tr>';
    }

    lineas.forEach(function(f, i) { renderFilaRevision(f, i, false); });
    lineasDestacadas.forEach(function(f, i) { renderFilaRevision(f, i, true); });
    tablaHtml += '</tbody></table>';

    var html = '<div style="'+sWrap+'">' +
      '<div style="'+sHdr+'">' +
      '<img src="'+LOGO_URL+'" style="'+sLogo+'" alt="TAISA">' +
      '<span style="'+sDivH+'"></span>' +
      '<span style="'+sH1+'">🏘️ Revisión líneas sin ubicar — '+nombreTienda+'</span>' +
      '<p style="'+sSub+'">Semana '+numSemana+' · Plataforma Leroy Merlin Málaga</p>' +
      '<p style="'+sMeta+'">Semana '+numSemana+' &nbsp;·&nbsp; '+formatearFechaCorta(new Date())+(MODO_PRUEBA?' &nbsp;·&nbsp; ⚠️ MODO PRUEBA':'')+'</p>' +
      '</div>' +
      '<div style="'+sBody+'">' +
      '<div style="'+sIntro+'">Hola,<br><br>' +
      'Estas son las líneas que tenéis <strong style="color:#f5a623">pendientes de ubicar</strong> de los pedidos cliente enviados desde la Plataforma de Málaga, Origen Torija, Valencia y Antequera.<br><br>' +
      'Por favor, gestionad estas líneas lo antes posible para no generar retrasos.' +
      (lineasDestacadas.length > 0 ? ' Las marcadas <strong style="color:#e74c3c">⏳ YA ESTABA</strong> ya aparecían la semana pasada en la misma ubicación — priorizadlas.' : '') +
      ' Gracias y un saludo.</div>' +
      '<table style="'+sKpiW+'"><tr>' +
      '<td style="'+sKpi+'"><div style="'+sKvRd+'">'+todasLasLineas.length+'</div><div style="'+sKl+'">Líneas pendientes</div></td>' +
      '<td style="'+sKpi+'"><div style="'+sKvAc+'">'+pedidosUnicos+'</div><div style="'+sKl+'">Pedidos afectados</div></td>' +
      '<td style="'+sKpi+'"><div style="'+sKvWh+'">'+numSemana+'</div><div style="'+sKl+'">Semana</div></td>' +
      '</tr></table>' +
      '<p style="'+sSec+'">📋 Líneas pendientes de ubicar</p>' +
      tablaHtml +
      '</div>' +
      '<div style="'+sFtr+'">' +
      '<span style="'+sBdg+'">'+(MODO_PRUEBA?'PRUEBA':'PRODUCCIÓN')+'</span>' +
      '<p style="'+sFtrP+'">Generado automáticamente el '+formatearFechaCorta(new Date())+' — TAISA Logistics · Plataforma Leroy Merlin Málaga</p>' +
      '</div></div>';

    MailApp.sendEmail({
      to: DESTINATARIOS_TIENDAS[nT].to,
      cc: DESTINATARIOS_TIENDAS[nT].cc,
      subject: (MODO_PRUEBA ? "[PRUEBA] " : "") + "🚚 Revisión líneas sin ubicar — " + nombreTienda + " — Semana " + numSemana,
      htmlBody: html
    });
  });

  SpreadsheetApp.getUi().alert("🚀 Correos de revisión enviados.");
}
