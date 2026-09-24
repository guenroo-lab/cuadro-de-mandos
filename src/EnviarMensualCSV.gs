// ==========================================
// MÓDULO: ENVIAR MENSUAL CSV
// ==========================================

function enviarCorreoMensualTiendas() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaResumen = ss.getSheetByName("RESUMEN_PEDIDO_MESES");
  if (!hojaResumen) return;

  var numSemana = getWeekNumber(new Date());
  var datosR = hojaResumen.getDataRange().getValues();
  var tiendas = ["MARBELLA","MALAGA","GRANADA","MIJAS"];

  tiendas.forEach(function(nT) {
    var hRet = ss.getSheetByName("DATA_RET_" + nT);
    var filasRet = hRet ? hRet.getDataRange().getValues().slice(1) : [];
    var nombreTienda = formatNombreTienda(nT);

    var tPed=0, ubi=0, vTot=0, rPed=0, vRet=0, crit="0%", linA=0, demM="-";
    var tablaHtml = "";
    var encontrado = false;

    for (var j=0; j<datosR.length; j++) {
      if (datosR[j][0] === "TIENDA: " + nT) {
        encontrado = true;
        tPed  = datosR[j+1][1];
        ubi   = datosR[j+1][3];
        vTot  = Math.round(datosR[j+1][5]);
        rPed  = datosR[j+2][1];
        vRet  = Math.round(datosR[j+2][3]);
        crit  = Math.round((datosR[j+2][5]||0)*100) + "%";
        linA  = datosR[j+3][1];
        demM  = datosR[j+3][3];

        // Tabla meses
        var fT = j + 5;
        tablaHtml = '<table class="t"><thead><tr>';
        datosR[fT].forEach(function(c) {
          if (c !== "") {
            var txt = (c instanceof Date) ? (MESES_ES[c.getMonth()]+" "+c.getFullYear()) : c;
            tablaHtml += '<th>' + txt + '</th>';
          }
        });
        tablaHtml += '</tr></thead><tbody>';
        fT++;
        while (fT < datosR.length && datosR[fT][0] !== "" && !datosR[fT][0].toString().includes("TIENDA:")) {
          var esTotal = datosR[fT][0] === "TOTAL MES";
          tablaHtml += '<tr' + (esTotal?' class="tot"':'') + '>';
          datosR[fT].forEach(function(c,idx) {
            if (c !== "" || idx === 0) {
              var txt = (typeof c==='number' && idx>0) ? Math.round(c).toLocaleString('es-ES')+"€" : c;
              tablaHtml += '<td>' + txt + '</td>';
            }
          });
          tablaHtml += '</tr>';
          if (esTotal) break;
          fT++;
        }
        tablaHtml += '</tbody></table>';
        break;
      }
    }

    if (!encontrado) return;

    var html = '<!DOCTYPE html><html><head>' + htmlEstilosBase() + '</head><body><div class="wrap">' +
      htmlHeader("📅",
        "Resumen Ocupación y Gestión Retrasos — " + nombreTienda,
        "Semana " + numSemana + " · Plataforma Leroy Merlin Málaga",
        '<span>Semana <strong>' + numSemana + '</strong></span><span> · </span>' +
        '<span>Generado el <strong>' + formatearFechaCorta(new Date()) + '</strong></span>') +
      '<div class="body">' +
      '<div class="intro">Hola ' + nombreTienda + ',<br><br>' +
      'Os escribo para informar sobre el estado actual de los pedidos ubicados en la plataforma. ' +
      'Los pedidos y líneas en retraso requieren <strong>gestión inmediata</strong> para recuperar el control del flujo operativo.</div>' +

      '<table class="kg"><tr class="kr">' +
      htmlKpi(tPed, "Total pedidos", "ac") +
      htmlKpi(ubi, "Ubicaciones", "wh") +
      htmlKpi(vTot.toLocaleString('es-ES')+"€", "Valor total", "ac") +
      htmlKpi(crit, "% Criticidad", "rd") +
      '</tr></table>' +

      '<table class="kg"><tr class="kr">' +
      htmlKpi(rPed, "Pedidos en retraso", "rd") +
      htmlKpi(vRet.toLocaleString('es-ES')+"€", "Valor en retraso", "rd") +
      htmlKpi(demM, "Demora media", "rd") +
      '</tr></table>' +

      '<div class="sec">📊 Desglose por sección y mes</div>' +
      tablaHtml +
      '</div>' + htmlFooter() + '</div></body></html>';

    // Adjunto CSV retrasos
    var archivos = [];
    if (filasRet.length > 0) {
      var csvHeader = "Ubicacion;Pedido;Seccion;Cod SAP;Descripcion;Fecha\r\n";
      var csvBody = filasRet.map(function(p) {
        return [p[0],p[1],p[2],p[3],p[4],
          Utilities.formatDate(new Date(p[5]), ss.getSpreadsheetTimeZone(), "dd/MM/yyyy")
        ].join(";");
      }).join("\r\n");
      archivos.push({
        fileName: "Detalle_Retrasos_" + nT + ".csv",
        content: csvHeader + csvBody,
        mimeType: "text/csv"
      });
    }

    MailApp.sendEmail({
      to: MODO_PRUEBA ? CORREO_PRUEBA : DESTINATARIOS_MENSUAL[nT],
      cc: MODO_PRUEBA ? "" : CC_COMUN,
      subject: (MODO_PRUEBA ? "[PRUEBA] " : "") +
        "📈 Resumen Ocupación y Gestión Retrasos — " + nombreTienda + " — Semana " + numSemana,
      htmlBody: html,
      attachments: archivos
    });
  });

  SpreadsheetApp.getUi().alert("🚀 Correos mensuales enviados.");
}
