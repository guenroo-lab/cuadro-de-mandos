// ==========================================
// MÓDULO: GENERAR MENSUAL
// ==========================================

function generarResumenMensualPlataforma() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var tiendas = ["MARBELLA", "MALAGA", "GRANADA", "MIJAS"];
  var hojaD = ss.getSheetByName("DIRECCIONES");
  var hojaR = ss.getSheetByName("RESUMEN_PEDIDO_MESES") || ss.insertSheet("RESUMEN_PEDIDO_MESES");

  var hoyReal = new Date(); hoyReal.setHours(0,0,0,0); // fecha real de hoy, para medir DÍAS de demora
  var hoy = new Date(); hoy.setHours(0,0,0,0);
  hoy.setDate(hoy.getDate() - 1); // margen: solo cuenta retraso a partir de anteayer (umbral, no usar para medir demora)

  hojaR.clear();

  ss.getSheets().forEach(h => { if(h.getName().startsWith("DATA_RET_")) ss.deleteSheet(h); });

  var setP = new Set(hojaD.getRange("A:A").getValues().flat().filter(String).map(d => d.toString().trim().toUpperCase()));
  var filaA = 1;

  tiendas.forEach(function(nT) {
    var hT = ss.getSheetByName(nT);
    if (!hT) return;
    var data = hT.getDataRange().getValues();
    if (data.length < 2) return;

    var s = { p: new Set(), pR: new Set(), u: new Set(), dT: 0, dR: 0, sumD: 0, lR: 0 };
    var mSec = {}; var mMes = {};
    var pedidosRetrasoList = [];

    for (var i = 1; i < data.length; i++) {
      var f = data[i]; var d = f[0].toString().trim().toUpperCase();
      if (setP.has(d)) {
        var id = f[1], sec = f[2] || "S/N", imp = parseFloat(f[9])||0, fec = f[11];
        if (fec instanceof Date && !isNaN(fec)) {
          var cM = Utilities.formatDate(fec, ss.getSpreadsheetTimeZone(), "yyyy-MM");
          mMes[cM] = MESES_ES[fec.getMonth()] + " " + fec.getFullYear();
          s.p.add(id); s.u.add(d); s.dT += imp;
          if (fec < hoy) {
            s.pR.add(id); s.lR++; s.dR += imp;
            s.sumD += Math.floor((hoyReal - fec) / 86400000);
            pedidosRetrasoList.push(f);
          }
          if (!mSec[sec]) mSec[sec] = {};
          mSec[sec][cM] = (mSec[sec][cM] || 0) + imp;
        }
      }
    }

    if (s.p.size > 0) {
      hojaR.getRange(filaA, 1).setValue("TIENDA: " + nT).setBackground(COLORES_TIENDA[nT]).setFontWeight("bold");
      filaA++;
      hojaR.getRange(filaA, 1, 1, 6).setValues([["TOTAL PEDIDOS:", s.p.size, "UBICACIONES:", s.u.size, "VALOR TOTAL:", Math.round(s.dT)]]).setBackground("#f9f9f9");
      hojaR.getRange(filaA, 6).setNumberFormat("#,##0"); // FIX Mijas: evita que el valor se interprete como fecha
      filaA++;
      hojaR.getRange(filaA, 1, 1, 6).setValues([["🔴 RETRASO (PED):", s.pR.size, "VALOR RETRASO:", Math.round(s.dR), "% CRITICIDAD:", (s.pR.size/s.p.size)]]).setBackground("#fff2cc");
      hojaR.getRange(filaA, 4).setNumberFormat("#,##0"); // FIX: mismo motivo para VALOR RETRASO
      hojaR.getRange(filaA, 6).setNumberFormat("0%");
      filaA++;
      var prom = s.lR > 0 ? (s.sumD / s.lR) : 0;
      hojaR.getRange(filaA, 1, 1, 4).setValues([["LINEAS AFECTADAS:", s.lR, "DEMORA MEDIA:", Math.round(prom) + " días"]]).setFontColor("#990000").setFontWeight("bold");
      filaA += 2;

      var cMOrden = Object.keys(mMes).sort();
      hojaR.getRange(filaA, 1).setValue("SECCIÓN").setBackground("#444").setFontColor("white");
      cMOrden.forEach((c, idx) => {
        hojaR.getRange(filaA, idx + 2).setValue(mMes[c]).setBackground("#444").setFontColor("white");
      });
      hojaR.getRange(filaA, cMOrden.length + 2).setValue("TOTAL SECC.").setBackground("#444").setFontColor("white");

      var lS = Object.keys(mSec).sort((a,b) => a.toString().localeCompare(b, undefined, {numeric:true}));
      var fT = lS.map(sc => {
        var row = [sc]; var t = 0;
        cMOrden.forEach(c => { var v = Math.round(mSec[sc][c])||0; row.push(v); t += v; });
        row.push(t); return row;
      });

      hojaR.getRange(filaA + 1, 1, fT.length, cMOrden.length + 2).setValues(fT);
      var fSum = ["TOTAL MES"]; var tG = 0;
      cMOrden.forEach((c, idx) => { var sum = fT.reduce((acc, row) => acc + row[idx+1], 0); fSum.push(sum); tG += sum; });
      fSum.push(tG);
      hojaR.getRange(filaA + fT.length + 1, 1, 1, fSum.length).setValues([fSum]).setBackground("#d9d9d9").setFontWeight("bold");
      hojaR.getRange(filaA + 1, 2, fT.length + 1, cMOrden.length + 1).setNumberFormat("#,##0€");
      filaA += fT.length + 3;

      if (pedidosRetrasoList.length > 0) {
        var hRet = ss.insertSheet("DATA_RET_" + nT);
        hRet.getRange(1, 1, 1, 6).setValues([["UBICACIÓN","PEDIDO","SECCIÓN","CÓD. SAP","DESCRIPCIÓN","FECHA"]]);
        var filasParaImprimir = pedidosRetrasoList.map(p => [p[0], p[1], p[2], p[4], p[5], p[11]]);
        filasParaImprimir.sort((a, b) => a[5] - b[5]);
        hRet.getRange(2, 1, filasParaImprimir.length, 6).setValues(filasParaImprimir);
        hRet.hideSheet();
      }
    }
  });

  hojaR.autoResizeColumns(1, 20);
  SpreadsheetApp.getUi().alert("✅ Resumen Mensual generado y detalles ocultos.");
}
