// ==========================================
// MÓDULO: AUDITORIA
// ==========================================

function ejecutarAuditoriaCompleta() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var tiendas = ["MARBELLA", "MALAGA", "GRANADA", "MIJAS"];
  var hojaResumen = ss.getSheetByName("RESUMEN_SEMANAL") || ss.insertSheet("RESUMEN_SEMANAL");
  var hojaRevision = ss.getSheetByName("Revision_tienda") || ss.insertSheet("Revision_tienda");
  var hojaRetrasos = ss.getSheetByName("RETRASOS_EQUIPO") || ss.insertSheet("RETRASOS_EQUIPO");

  // Plataforma = regla automática (numéricas, X..., etiquetas de día) + lo escrito en DIRECCIONES.
  var setExtra = cargarDireccionesExtra_(ss);
  var sinLista = {}; // ubicaciones de plataforma por regla que NO están en DIRECCIONES (solo informativo)
  // Retraso DIRECTO / CONDICIONAL (X/J: solo si el pedido ya estaba en esa
  // ubicación la semana anterior, según SNAPSHOT_SEMANAL): ver
  // esEtiquetaRetrasoDirecto_ / esEtiquetaRetrasoCondicional_ en Configuracion.gs
  // (aceptan L1, L2, L12... cualquier número tras la letra).
  var snapshotAnterior = leerSnapshotAnterior();
  // Memoria de líneas "por ubicar" de tienda (VX/VJ/TX/TJ/AX/AJ) de la semana
  // anterior, para saber cuáles ya llevan 2 semanas sin moverse.
  var snapshotTiendasAnterior = leerSnapshotTiendasUbicarAnterior();

  hojaResumen.clear(); hojaRevision.clear(); hojaRetrasos.clear();
  var colInicio = [1,7,1,7]; var maxFilaSuperior = 1; var filaRev = 1; var filaRet = 1;

  var datosMensuales = {};
  tiendas.forEach(function(nombre) { datosMensuales[nombre] = {}; });

  tiendas.forEach(function(nombre, index) {
    var hoja = ss.getSheetByName(nombre);
    if (!hoja) return;
    var datos = hoja.getDataRange().getValues();
    if (datos.length < 2) return;

    var cabecera = datos[0];
    var secciones = {}; var stats = { p: new Set(), u: new Set(), d: 0, l: 0 };
    var lineasRev = []; var lineasRevDestacadas = []; var lineasRet = []; var lineasArrastre = [];
    var codT = CODIGOS_REVISION[nombre] || "XXX";
    var prefijos = PREFIJOS_ORIGEN_TIENDA.map(p => p + codT);
    var prefijosExcluirXJ = PREFIJOS_ORIGEN_TIENDA_EXCLUIR_XJ.map(p => p + codT);

    for (var i = 1; i < datos.length; i++) {
      var fila = datos[i];
      var dir = fila[0].toString().trim().toUpperCase();
      var id = fila[1];

      if (prefijos.some(p => dir.startsWith(p))) {
        if (prefijosExcluirXJ.some(p => dir.startsWith(p))) {
          // VX/VJ/TX/TJ/AX/AJ: no se informa a la tienda esta semana salvo
          // que este mismo pedido YA estuviera en esta misma ubicación la
          // semana pasada (mismo margen de 24h que usa el equipo para X/J).
          if (snapshotTiendasAnterior[claveSnap(nombre, dir, id)]) {
            lineasRevDestacadas.push(fila);
          }
        } else {
          lineasRev.push(fila);
        }
      }

      // Ubicaciones transitorias de plataforma (Torija/Valencia/Antequera):
      // aviso inmediato al equipo, sin memoria de semana anterior.
      if (UBICACIONES_TRANSITORIAS_PLATAFORMA.indexOf(dir) !== -1) lineasArrastre.push(fila);

      if (esUbicacionPlataforma_(dir, setExtra)) {
        if (!setExtra.has(dir)) sinLista[dir] = (sinLista[dir] || 0) + 1;
        var sec = fila[2] || "S/N", price = parseFloat(fila[9]) || 0;
        if (!secciones[sec]) secciones[sec] = { p: new Set(), u: new Set(), d: 0, l: 0 };
        secciones[sec].p.add(id); secciones[sec].u.add(dir); secciones[sec].d += price; secciones[sec].l++;
        stats.p.add(id); stats.u.add(dir); stats.d += price; stats.l++;

        if (esEtiquetaRetrasoDirecto_(dir)) {
          lineasRet.push(fila);
        } else if (esEtiquetaRetrasoCondicional_(dir)) {
          if (snapshotAnterior[claveSnap(nombre, dir, id)]) lineasRet.push(fila);
        }
      }
    }

    Object.keys(secciones).forEach(function(sec) {
      datosMensuales[nombre][sec] = secciones[sec].u.size;
    });

    var fL = (index < 2) ? 1 : maxFilaSuperior + 2;
    var cL = colInicio[index];
    var listSec = Object.keys(secciones).sort((a,b) => a.toString().localeCompare(b, undefined, {numeric:true}));
    var cuerpo = listSec.map(s => [s, secciones[s].p.size, secciones[s].l, secciones[s].u.size, Math.round(secciones[s].d)]);

    if (cuerpo.length > 0) {
      hojaResumen.getRange(fL, cL, 1, 5).setValues([["TIENDA: " + nombre, "", "", "", ""]]).setFontWeight("bold").setBackground(COLORES_TIENDA[nombre]);
      fL++; hojaResumen.getRange(fL, cL, 1, 5).setValues([["SECC","PED","LIN","UBIC","TOTAL €"]]).setBackground("#444").setFontColor("white");
      fL++; hojaResumen.getRange(fL, cL, cuerpo.length, 5).setValues(cuerpo);
      fL += cuerpo.length;
      hojaResumen.getRange(fL, cL, 1, 5).setValues([["TOTAL", stats.p.size, stats.l, stats.u.size, Math.round(stats.d)]]).setFontWeight("bold").setBackground("#f3f3f3");
      if (index < 2 && fL > maxFilaSuperior) maxFilaSuperior = fL;
    }

    if (lineasRev.length > 0) {
      hojaRevision.getRange(filaRev, 1).setValue("REVISIÓN POR UBICAR: " + nombre).setFontWeight("bold").setBackground(COLORES_TIENDA[nombre]);
      filaRev++; hojaRevision.getRange(filaRev, 1, 1, cabecera.length).setValues([cabecera]).setBackground("#eeeeee");
      filaRev++; hojaRevision.getRange(filaRev, 1, lineasRev.length, cabecera.length).setValues(lineasRev);
      filaRev += lineasRev.length + 2;
    }

    if (lineasRevDestacadas.length > 0) {
      hojaRevision.getRange(filaRev, 1).setValue("ARRASTRE UBICAR: " + nombre).setFontWeight("bold").setBackground(COLORES_TIENDA[nombre]);
      filaRev++; hojaRevision.getRange(filaRev, 1, 1, cabecera.length).setValues([cabecera]).setBackground("#eeeeee");
      filaRev++; hojaRevision.getRange(filaRev, 1, lineasRevDestacadas.length, cabecera.length).setValues(lineasRevDestacadas);
      filaRev += lineasRevDestacadas.length + 2;
    }

    if (lineasRet.length > 0) {
      hojaRetrasos.getRange(filaRet, 1).setValue("RETRASOS: " + nombre).setFontWeight("bold").setBackground(COLORES_TIENDA[nombre]);
      filaRet++; hojaRetrasos.getRange(filaRet, 1, 1, cabecera.length).setValues([cabecera]).setBackground("#eeeeee");
      filaRet++; hojaRetrasos.getRange(filaRet, 1, lineasRet.length, cabecera.length).setValues(lineasRet);
      filaRet += lineasRet.length + 2;
    }

    if (lineasArrastre.length > 0) {
      hojaRetrasos.getRange(filaRet, 1).setValue("ARRASTRES: " + nombre).setFontWeight("bold").setBackground(COLORES_TIENDA[nombre]);
      filaRet++; hojaRetrasos.getRange(filaRet, 1, 1, cabecera.length).setValues([cabecera]).setBackground("#eeeeee");
      filaRet++; hojaRetrasos.getRange(filaRet, 1, lineasArrastre.length, cabecera.length).setValues(lineasArrastre);
      filaRet += lineasArrastre.length + 2;
    }
  });

  var nSinLista = Object.keys(sinLista).length;
  if (nSinLista > 0) Logger.log("Ubicaciones de plataforma contadas por regla y NO escritas en DIRECCIONES (" + nSinLista + "): " + Object.keys(sinLista).sort().join(", "));

  hojaResumen.getRange("E:E").setNumberFormat("#,##0€");
  hojaResumen.getRange("K:K").setNumberFormat("#,##0€");

  var hojaH = ss.getSheetByName("HISTORICO_SEMANAL") || ss.insertSheet("HISTORICO_SEMANAL");
  var resD = hojaResumen.getDataRange().getValues();
  var tP=0, tL=0, tU=0, tE=0;
  resD.forEach(f => {
    if (f[0] === "TOTAL") { tP+=Number(f[1])||0; tL+=Number(f[2])||0; tU+=Number(f[3])||0; tE+=Number(f[4])||0; }
    if (f[6] === "TOTAL") { tP+=Number(f[7])||0; tL+=Number(f[8])||0; tU+=Number(f[9])||0; tE+=Number(f[10])||0; }
  });
  hojaH.appendRow([new Date(), "Semana " + getWeekNumber(new Date()), tP, tL, tU, Math.round(tE)]);
  hojaH.getRange(hojaH.getLastRow(), 6).setNumberFormat("#,##0€");

  actualizarInformeMensualPC(ss, datosMensuales, tiendas);

  try { SpreadsheetApp.getUi().alert("✅ Auditoría e Histórico completados."); }
  catch(e) { Logger.log("Auditoría completada (ejecución automática sin UI)."); }
}

// ==========================================
// INFORME MENSUAL PC TOTAL — hoja acumulada
// ==========================================
// Ventana MÓVIL de las últimas 4 semanas — YA NO se vacía al cambiar de mes
// (antes lo hacía vía marcador en Z1; el usuario pidió ver siempre las
// últimas 4 semanas aunque el mes acabe de empezar). Columnas FIJAS: 2-5 son
// las 4 semanas (de más antigua a más reciente, con hueco "" si aún no hay
// 4 acumuladas), columna 6 es "Promedio". Cuando entra una semana nueva y ya
// había 4, se descarta la más antigua (desplaza los datos de esa fila 1
// columna a la izquierda) y la nueva entra en la posición 5.
function actualizarInformeMensualPC(ss, datosMensuales, tiendas) {
  var hojaI = ss.getSheetByName("INFORME_MENSUAL_PC_TOTAL") || ss.insertSheet("INFORME_MENSUAL_PC_TOTAL");

  var semanaActual = getWeekNumber(new Date());
  var etiquetaSemana = "Semana " + semanaActual;
  var NUM_SEMANAS_VENTANA = 4;
  var COL_SEMANA_1 = 2;
  var COL_PROMEDIO = COL_SEMANA_1 + NUM_SEMANAS_VENTANA; // 6

  // Z1 se deja como referencia informativa de la última ejecución (texto
  // plano, sin usarse ya para decidir si vaciar la hoja).
  hojaI.getRange("Z1").setNumberFormat("@").setValue("Actualizado: " + etiquetaSemana);

  var filaBase = 1;

  tiendas.forEach(function(nombre) {
    var ubics = datosMensuales[nombre];
    var secciones = Object.keys(ubics).sort(function(a,b){
      return a.toString().localeCompare(b, undefined, {numeric:true});
    });
    if (secciones.length === 0) { filaBase += 2; return; }

    var colorT = COLORES_TIENDA[nombre] || "#eeeeee";

    hojaI.getRange(filaBase, 1).setValue(nombre)
      .setBackground(colorT).setFontWeight("bold").setFontSize(12);

    var filaCab = filaBase + 1;
    var cabecera = hojaI.getRange(filaCab, 1, 1, COL_PROMEDIO).getValues()[0];

    // Detecta el layout ANTERIOR (columna "Promedio" variable, justo tras la
    // última semana existente) para migrarlo UNA VEZ al layout fijo nuevo.
    // Sin esto, la primera ejecución tras este cambio confundiría el texto
    // "Promedio" con una 5ª semana y perdería el promedio ya calculado.
    var colPromedioAntiguo = -1;
    for (var pc = 1; pc < COL_PROMEDIO - 1; pc++) {
      if (cabecera[pc] === "Promedio") { colPromedioAntiguo = pc + 1; break; }
    }

    var seccionesExistentes = {};
    var filaCheck = filaCab + 1;
    while (filaCheck < filaCab + 100) {
      var valCheck = hojaI.getRange(filaCheck, 1).getValue();
      if (valCheck === "" || valCheck === "Total") break;
      seccionesExistentes[valCheck.toString()] = filaCheck;
      filaCheck++;
    }

    secciones.forEach(function(sec) {
      if (!seccionesExistentes[sec.toString()]) {
        hojaI.getRange(filaCheck, 1).setValue(sec);
        seccionesExistentes[sec.toString()] = filaCheck;
        filaCheck++;
      }
    });

    var filaTot = filaCheck;
    var filasBloque = Object.keys(seccionesExistentes).map(function(sec){ return seccionesExistentes[sec]; });
    filasBloque.push(filaTot); // el Total también se desplaza junto con las secciones

    if (colPromedioAntiguo !== -1 && colPromedioAntiguo !== COL_PROMEDIO) {
      filasBloque.forEach(function(fila) {
        var valorProm = hojaI.getRange(fila, colPromedioAntiguo).getValue();
        hojaI.getRange(fila, colPromedioAntiguo).setValue("");
        hojaI.getRange(fila, COL_PROMEDIO).setValue(valorProm);
      });
      hojaI.getRange(filaCab, colPromedioAntiguo).setValue("");
      cabecera[colPromedioAntiguo - 1] = ""; // para que no cuente como semana al leer abajo
    }

    // Semanas ya presentes en las columnas fijas 2..5, de más antigua a más
    // reciente ("" = hueco todavía sin usar).
    var semanasVentana = [];
    for (var w = 0; w < NUM_SEMANAS_VENTANA; w++) {
      semanasVentana.push(cabecera[COL_SEMANA_1 - 1 + w] || "");
    }

    var idxSemanaActual = semanasVentana.indexOf(etiquetaSemana);
    if (idxSemanaActual === -1) {
      var idxHueco = semanasVentana.indexOf("");
      if (idxHueco !== -1) {
        // Hueco libre (bloque nuevo, o todavía con menos de 4 semanas).
        idxSemanaActual = idxHueco;
      } else {
        // Ventana llena: desplazar 1 a la izquierda (se pierde la más
        // antigua) y la nueva semana entra en la última posición.
        filasBloque.forEach(function(fila) {
          var valoresActuales = hojaI.getRange(fila, COL_SEMANA_1, 1, NUM_SEMANAS_VENTANA).getValues()[0];
          var desplazados = valoresActuales.slice(1);
          desplazados.push("");
          hojaI.getRange(fila, COL_SEMANA_1, 1, NUM_SEMANAS_VENTANA).setValues([desplazados]);
        });
        semanasVentana = semanasVentana.slice(1).concat([""]);
        idxSemanaActual = NUM_SEMANAS_VENTANA - 1;
      }
      semanasVentana[idxSemanaActual] = etiquetaSemana;
    }
    var colSemanaActual = COL_SEMANA_1 + idxSemanaActual;

    hojaI.getRange(filaCab, 1).setValue("Sección")
      .setBackground("#444444").setFontColor("white").setFontWeight("bold");
    for (var w2 = 0; w2 < NUM_SEMANAS_VENTANA; w2++) {
      hojaI.getRange(filaCab, COL_SEMANA_1 + w2).setValue(semanasVentana[w2])
        .setBackground("#444444").setFontColor("white").setFontWeight("bold");
    }
    hojaI.getRange(filaCab, COL_PROMEDIO).setValue("Promedio")
      .setBackground("#444444").setFontColor("white").setFontWeight("bold");

    var totalUbic = 0;
    Object.keys(seccionesExistentes).forEach(function(sec) {
      var fila = seccionesExistentes[sec];
      var val = ubics[sec] || 0;
      hojaI.getRange(fila, colSemanaActual).setValue(val);
      totalUbic += val;
    });

    hojaI.getRange(filaTot, 1).setValue("Total").setFontWeight("bold").setBackground("#f3f3f3");
    hojaI.getRange(filaTot, colSemanaActual).setValue(totalUbic).setFontWeight("bold").setBackground("#f3f3f3");

    function promedioDeFila(fila) {
      var vals = [];
      for (var w3 = 0; w3 < NUM_SEMANAS_VENTANA; w3++) {
        if (semanasVentana[w3] === "") continue;
        var v = hojaI.getRange(fila, COL_SEMANA_1 + w3).getValue();
        if (v !== "" && v !== null && !isNaN(v)) vals.push(Number(v));
      }
      return vals.length > 0 ? Math.round(vals.reduce(function(a,b){return a+b;},0) / vals.length) : 0;
    }

    Object.keys(seccionesExistentes).forEach(function(sec) {
      var fila = seccionesExistentes[sec];
      hojaI.getRange(fila, COL_PROMEDIO).setValue(promedioDeFila(fila)).setBackground("#fff9e6");
    });
    hojaI.getRange(filaTot, COL_PROMEDIO).setValue(promedioDeFila(filaTot)).setFontWeight("bold").setBackground("#fff9e6");

    filaBase = filaTot + 3;
  });

  hojaI.hideColumns(26);
  hojaI.autoResizeColumns(1, 10);
}

// ==========================================
// ENVÍO CORREO MENSUAL PC TOTAL
// ==========================================
function enviarCorreoMensualPCTotal() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaI = ss.getSheetByName("INFORME_MENSUAL_PC_TOTAL");
  if (!hojaI) {
    try { SpreadsheetApp.getUi().alert("❌ No existe la hoja INFORME_MENSUAL_PC_TOTAL. Ejecuta primero la auditoría."); }
    catch(e) { Logger.log("❌ No existe la hoja INFORME_MENSUAL_PC_TOTAL (ejecución automática sin UI)."); }
    return;
  }

  var tiendas = ["MARBELLA","MALAGA","GRANADA","MIJAS"];
  var mesActual = new Date().getMonth();
  var anyoActual = new Date().getFullYear();
  var nombreMes = NOMBRES_MESES_COMPLETOS[mesActual];
  var numSemana = getWeekNumber(new Date());
  var datos = hojaI.getDataRange().getValues();
  if (datos.length < 2) {
    try { SpreadsheetApp.getUi().alert("❌ Sin datos en INFORME_MENSUAL_PC_TOTAL"); }
    catch(e) { Logger.log("❌ Sin datos en INFORME_MENSUAL_PC_TOTAL (ejecución automática sin UI)."); }
    return;
  }

  var kpiSemanas=0, kpiUltSemana=0, kpiPromedio=0, tiendasConDatos=0;

  var sWrap  = 'width:100%;max-width:900px;margin:0 auto;font-family:Arial,sans-serif;background:#0a0b10;border-radius:12px;overflow:hidden;';
  var sHdr   = 'background:#0a0b10;padding:24px 32px 18px;border-bottom:2px solid #f5a623;';
  var sLogo  = 'height:32px;vertical-align:middle;';
  var sDivH  = 'display:inline-block;width:1px;height:32px;background:rgba(245,166,35,.4);margin:0 14px;vertical-align:middle;';
  var sH1    = 'color:#f5a623;font-size:18px;font-weight:700;margin:0;display:inline;vertical-align:middle;';
  var sSub   = 'color:#7a8299;font-size:12px;margin:6px 0 0;';
  var sMeta  = 'color:#3d4560;font-size:11px;margin:4px 0 0;';
  var sBody  = 'background:#111520;padding:26px 32px;';
  var sIntro = 'border-left:3px solid #f5a623;padding:13px 16px;background:rgba(245,166,35,.05);border-radius:0 8px 8px 0;margin-bottom:22px;color:#c0c6d8;font-size:13px;line-height:1.8;';
  var sKpiW  = 'width:100%;border-collapse:separate;border-spacing:8px;margin-bottom:22px;';
  var sKpi   = 'background:#181d2c;border:1px solid rgba(245,166,35,.15);border-radius:10px;padding:14px 10px;text-align:center;width:25%;';
  var sKvAc  = 'font-size:24px;font-weight:700;color:#f5a623;margin-bottom:4px;';
  var sKvWh  = 'font-size:24px;font-weight:700;color:#f0f2f8;margin-bottom:4px;';
  var sKl    = 'font-size:10px;color:#7a8299;text-transform:uppercase;letter-spacing:.6px;';
  var sTiH   = 'font-size:13px;font-weight:700;padding:14px 0 6px;border-left:3px solid ';
  // Tablas de datos EN CLARO (no en el tema oscuro del resto del correo): al
  // copiar y pegar en Excel, un fondo oscuro con texto blanco suele pegarse
  // ilegible o con relleno negro. Fondo blanco/gris claro y texto negro pega
  // limpio, fila por fila, listo para trabajar en Excel.
  var sTbl   = 'width:100%;border-collapse:collapse;font-size:12px;margin-bottom:22px;background:#ffffff;';
  var sTh    = 'background:#e8e8e8;color:#111;padding:6px 10px;text-align:center;font-size:11px;font-weight:700;border:1px solid #cccccc;';
  var sThL   = 'background:#e8e8e8;color:#111;padding:6px 10px;text-align:left;font-size:11px;font-weight:700;border:1px solid #cccccc;';
  var sFtr   = 'background:#0a0b10;padding:12px 32px;border-top:1px solid rgba(245,166,35,.12);overflow:hidden;';
  var sFtrP  = 'font-size:11px;color:#3d4560;';
  var sBdg   = 'font-size:10px;padding:2px 8px;border-radius:10px;background:rgba(245,166,35,.1);color:#b87a1a;border:1px solid rgba(245,166,35,.2);float:right;';

  // Mismas columnas fijas que escribe actualizarInformeMensualPC: 2-5 son las
  // 4 semanas de la ventana móvil (puede haber huecos "" si aún no hay 4
  // acumuladas), columna 6 es el Promedio.
  var COL_SEMANA_1 = 2, NUM_SEMANAS_VENTANA = 4, COL_PROMEDIO = 6;

  var cuerpoTiendas = "";

  tiendas.forEach(function(nombre) {
    var filaInicio = -1;
    for (var i=0; i<datos.length; i++) {
      if (datos[i][0] === nombre) { filaInicio = i; break; }
    }
    if (filaInicio === -1) return;

    var filaCab = filaInicio + 1;
    var cabecera = datos[filaCab];
    var colsSemana = [];
    for (var w = 0; w < NUM_SEMANAS_VENTANA; w++) {
      var col = COL_SEMANA_1 + w;
      // Defensivo: si se envía manualmente ("Enviar informe mensual ahora")
      // antes de que la auditoría del jueves haya migrado el layout antiguo,
      // que no confunda el texto "Promedio" con una semana más.
      if (cabecera[col - 1] !== "" && cabecera[col - 1] !== "Promedio") colsSemana.push(col);
    }
    if (colsSemana.length === 0) return;
    kpiSemanas = Math.max(kpiSemanas, colsSemana.length);
    var colProm = COL_PROMEDIO;

    var nombreTienda = formatNombreTienda(nombre);
    var colorTienda = COLORES_TIENDA[nombre] || "#f5a623";

    cuerpoTiendas += '<p style="' + sTiH + colorTienda + ';padding-left:10px;color:' + colorTienda + '">🏪 ' + nombreTienda + '</p>';
    cuerpoTiendas += '<table border="1" cellpadding="4" cellspacing="0" style="' + sTbl + '"><thead><tr><th style="' + sThL + '">Sección</th>';
    colsSemana.forEach(function(c){ cuerpoTiendas += '<th style="' + sTh + '">' + cabecera[c - 1] + '</th>'; });
    cuerpoTiendas += '<th style="' + sTh + '">Promedio</th>';
    cuerpoTiendas += '</tr></thead><tbody>';

    var filaD = filaCab + 1;
    var totalPorSemana = {}, totalPromT = 0;
    colsSemana.forEach(function(c){ totalPorSemana[c] = 0; });
    var rowIdx = 0;

    while (filaD < datos.length && datos[filaD][0] !== "" && datos[filaD][0] !== nombre) {
      var fila = datos[filaD];
      var esTotalFila = fila[0] === "Total";
      var bg = esTotalFila ? '#e0e0e0' : '#ffffff';
      var tdL = 'padding:6px 10px;text-align:left;border:1px solid #dddddd;background:'+bg+';color:#111;font-weight:'+(esTotalFila?'700':'400')+';';
      var tdC = 'padding:6px 10px;text-align:center;border:1px solid #dddddd;background:'+bg+';color:#111;font-weight:'+(esTotalFila?'700':'400')+';';
      var tdP = 'padding:6px 10px;text-align:center;border:1px solid #dddddd;background:'+(esTotalFila?'#e0e0e0':'#fff2cc')+';color:#111;font-weight:700;';

      cuerpoTiendas += '<tr><td style="' + tdL + '">' + fila[0] + '</td>';
      colsSemana.forEach(function(c) {
        var val = fila[c - 1] !== "" ? Math.round(Number(fila[c - 1])) : 0;
        if (!esTotalFila) totalPorSemana[c] += val;
        cuerpoTiendas += '<td style="' + tdC + '">' + val + '</td>';
      });
      var valProm = fila[colProm - 1] !== "" ? Math.round(Number(fila[colProm - 1])) : 0;
      if (esTotalFila) totalPromT = valProm;
      cuerpoTiendas += '<td style="' + tdP + '">' + valProm + '</td>';
      cuerpoTiendas += '</tr>';
      filaD++;
      if (!esTotalFila) rowIdx++;
      if (esTotalFila) break;
    }
    cuerpoTiendas += '</tbody></table>';

    var ultCol = colsSemana[colsSemana.length-1];
    kpiUltSemana += totalPorSemana[ultCol] || 0;
    kpiPromedio += totalPromT;
    tiendasConDatos++;
  });

  var html = '<div style="' + sWrap + '">' +
    '<div style="' + sHdr + '">' +
    '<img src="' + LOGO_URL + '" style="' + sLogo + '" alt="TAISA">' +
    '<span style="' + sDivH + '"></span>' +
    '<span style="' + sH1 + '">📈 Informe Mensual PC Total — ' + nombreMes + ' ' + anyoActual + '</span>' +
    '<p style="' + sSub + '">Ocupación semanal por sección y tienda · Plataforma Leroy Merlin Málaga</p>' +
    '<p style="' + sMeta + '">' + nombreMes + ' ' + anyoActual + ' &nbsp;·&nbsp; Generado el ' + formatearFechaCorta(new Date()) + (MODO_PRUEBA?' &nbsp;·&nbsp; ⚠️ MODO PRUEBA':'') + '</p>' +
    '</div>' +
    '<div style="' + sBody + '">' +
    '<div style="' + sIntro + '">Hola equipo,<br><br>' +
    'Os adjunto el <strong style="color:#f5a623">informe mensual de ocupación PC Total</strong> correspondiente a <strong style="color:#f5a623">' + nombreMes + ' ' + anyoActual + '</strong>.<br><br>' +
    'El informe recoge las ubicaciones ocupadas por sección en cada tienda durante las semanas del mes, con el promedio acumulado.</div>' +
    '<table style="' + sKpiW + '"><tr>' +
    '<td style="' + sKpi + '"><div style="' + sKvAc + '">' + kpiSemanas + '</div><div style="' + sKl + '">Semanas</div></td>' +
    '<td style="' + sKpi + '"><div style="' + sKvWh + '">4</div><div style="' + sKl + '">Tiendas</div></td>' +
    '<td style="' + sKpi + '"><div style="' + sKvAc + '">' + kpiUltSemana.toLocaleString('es-ES') + '</div><div style="' + sKl + '">Ubic. última sem.</div></td>' +
    '<td style="' + sKpi + '"><div style="' + sKvWh + '">' + Math.round(kpiPromedio/(tiendasConDatos||1)).toLocaleString('es-ES') + '</div><div style="' + sKl + '">Promedio mensual</div></td>' +
    '</tr></table>' +
    cuerpoTiendas +
    '</div>' +
    '<div style="' + sFtr + '">' +
    '<span style="' + sBdg + '">' + (MODO_PRUEBA?'PRUEBA':'PRODUCCIÓN') + '</span>' +
    '<p style="' + sFtrP + '">Generado automáticamente el ' + formatearFechaCorta(new Date()) + ' — TAISA Logistics · Plataforma Leroy Merlin Málaga</p>' +
    '</div></div>';

  MailApp.sendEmail({
    to: MODO_PRUEBA ? CORREO_PRUEBA : CC_COMUN,
    subject: (MODO_PRUEBA ? "[PRUEBA] " : "") + "📈 Informe Mensual PC Total — " + nombreMes + " " + anyoActual + " — Semana " + numSemana,
    htmlBody: html
  });

  try { SpreadsheetApp.getUi().alert("🚀 Informe PC Total enviado."); }
  catch(e) { Logger.log("Informe PC Total enviado (ejecución automática sin UI)."); }
}

// ==========================================
// TRIGGER DÍA 24
// ==========================================
function ejecutarEnvioDia24() {
  if (new Date().getDate() === 24) {
    enviarCorreoMensualPCTotal();
  }
}

// ==========================================
// UTILIDAD
// ==========================================
function formatNombreTienda(nombre) {
  var mapa = {"MALAGA":"Málaga","MARBELLA":"Marbella","MIJAS":"Mijas","GRANADA":"Granada"};
  return mapa[nombre.toUpperCase()] || nombre;
}
