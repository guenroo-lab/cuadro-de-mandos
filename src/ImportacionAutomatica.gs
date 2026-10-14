// ==========================================
// MÓDULO: IMPORTACION AUTOMATICA + SNAPSHOT
// ==========================================

var CARPETA_INVENTARIOS_ID = "1_1muNRzTzLrgSLyZdWtpf7GJeRqbplIG";

var ARCHIVOS_TIENDA = {
  "014": "MARBELLA",
  "036": "MALAGA",
  "043": "GRANADA",
  "279": "MIJAS"
};

// Orden fijo de procesado. Object.keys(ARCHIVOS_TIENDA) NO respeta el orden de
// declaración aquí arriba: JS reordena "279" al principio por ser una clave
// numérica canónica (verificado: Object.keys da ["279","014","036","043"]).
// Con el bucle recorriendo por este array en vez de Object.keys, el orden es
// siempre el mismo y no depende de un detalle interno del motor JS.
var CODIGOS_TIENDA_ORDEN = ["014", "036", "043", "279"];

var SNAPSHOT_HOJA = "SNAPSHOT_SEMANAL";

// Memoria SEPARADA (hoja propia) para las líneas "por ubicar" de tienda que
// se excluyen la primera semana (VX/VJ/TX/TJ/AX/AJ, ver Configuracion.gs).
// A propósito NO comparte hoja con SNAPSHOT_SEMANAL (equipo): son conceptos
// distintos y así se puede revisar cada uno por separado si hace falta.
var SNAPSHOT_UBICAR_TIENDAS_HOJA = "SNAPSHOT_UBICAR_TIENDAS";

var IMP_COL_UBICACION = 0; // A
var IMP_COL_PEDIDO    = 1; // B

var ETIQUETAS_DIA_SNAPSHOT = [
  "L","L1","L2","L3","LUNE","M","M1","M2","M3","MART","MARTE",
  "X","X1","X2","X3","MIER","MIÉR","J","J1","J2","J3","JUEV",
  "V","V1","V2","V3","VIER","S","SAB","SABA"
];

// ==========================================
// ORQUESTADOR — cada JUEVES 12:00
// ==========================================
function procesoAutomaticoJueves() {
  var log = [];
  var resImport    = _pasoAuto("1. Importar inventarios", importarInventarios);
  var resAuditoria = _pasoAuto("2. Auditoría",             ejecutarAuditoriaCompleta);
  log.push(resImport, resAuditoria);
  log.push(_pasoAuto("3. Generar resumen mensual",     generarResumenMensualPlataforma));
  log.push(_pasoAuto("4. Correo retrasos equipo",      enviarCorreoRetrasos));
  log.push(_pasoAuto("5. Correo resumen responsables", enviarCorreoResumenSemanal));
  log.push(_pasoAuto("6. Correo revisión tiendas",     enviarCorreoRevisionTienda));
  log.push(_pasoAuto("7. Correo mensual tiendas",      enviarCorreoMensualTiendas));

  // Si falló la importación o la auditoría, NO se guarda snapshot esta semana:
  // guardarlo igualmente grabaría como "estado real de hoy" unos datos parciales
  // u obsoletos, corrompiendo silenciosamente la memoria que usa la regla de
  // retraso X/J la semana que viene (ver CLAUDE.md, regla de negocio #1 y #2).
  if (resImport.indexOf("❌") === 0 || resAuditoria.indexOf("❌") === 0) {
    log.push("⏭️ 8. Guardar snapshot — OMITIDO (falló el paso 1 o 2; guardar ahora corrompería la regla X/J de la semana que viene)");
    log.push("⏭️ 9. Guardar snapshot tiendas por ubicar — OMITIDO (mismo motivo)");
  } else {
    log.push(_pasoAuto("8. Guardar snapshot", guardarSnapshotSemanal));
    log.push(_pasoAuto("9. Guardar snapshot tiendas por ubicar", guardarSnapshotTiendasUbicar));
  }

  Logger.log("📋 PROCESO JUEVES 12:00\n" + log.join("\n"));
}

function _pasoAuto(nombre, fn) {
  try {
    fn();
    return "✅ " + nombre;
  } catch (e) {
    var m = (e && e.message) ? e.message : String(e);
    if (m.indexOf("getUi") !== -1 || m.indexOf("Cannot call") !== -1) {
      return "✅ " + nombre + " (enviado)";
    }
    return "❌ " + nombre + " — " + m;
  }
}

// ==========================================
// IMPORTAR EXCEL → PESTAÑAS
// ==========================================
function importarInventarios() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var carpeta = DriveApp.getFolderById(CARPETA_INVENTARIOS_ID);
  var importados = [], noEncontrados = [], errores = [];

  // Try/catch POR TIENDA: si una falla (p.ej. error transitorio de Drive al
  // convertir el .xlsx), las demás se siguen intentando igual. Antes, un fallo
  // en cualquier tienda abortaba el resto del bucle sin aviso claro — y como
  // "279" (Mijas) se procesa primero en un Object.keys() normal, un fallo suyo
  // se llevaba por delante a las otras 3 tiendas en silencio.
  CODIGOS_TIENDA_ORDEN.forEach(function(codigo) {
    var nombreTienda = ARCHIVOS_TIENDA[codigo];
    try {
      var archivo = buscarArchivoPorCodigo(carpeta, codigo);
      if (!archivo) { noEncontrados.push(codigo + " (" + nombreTienda + ")"); return; }

      var valores = xlsxAValores(archivo);
      if (!valores || valores.length === 0) { noEncontrados.push(codigo + " (vacío)"); return; }

      var hoja = ss.getSheetByName(nombreTienda) || ss.insertSheet(nombreTienda);
      hoja.clearContents();
      hoja.getRange(1, 1, valores.length, valores[0].length).setValues(valores);
      importados.push(nombreTienda + " (" + valores.length + " filas)");
    } catch (e) {
      errores.push(nombreTienda + ": " + ((e && e.message) ? e.message : String(e)));
    }
  });

  var msg = "Importados: " + (importados.join(", ") || "ninguno");
  if (noEncontrados.length > 0) msg += " | NO encontrados: " + noEncontrados.join(", ");
  if (errores.length > 0) msg += " | ERRORES: " + errores.join(" / ");
  Logger.log(msg);
  // Si alguna tienda dio un error real (no solo "no encontrado"), se propaga
  // para que _pasoAuto lo marque como ❌ y procesoAutomaticoJueves no guarde
  // snapshot esta semana con datos parciales.
  if (errores.length > 0) throw new Error(msg);
  return msg;
}

// Busca el archivo más reciente cuyo nombre empieza por el código y es Excel
function buscarArchivoPorCodigo(carpeta, codigo) {
  var archivos = carpeta.getFiles();
  var candidatos = [];
  while (archivos.hasNext()) {
    var f = archivos.next();
    var nombre = f.getName().toString().trim().toLowerCase();
    if (nombre.indexOf(codigo) === 0 && nombre.indexOf(".xls") !== -1) candidatos.push(f);
  }
  if (candidatos.length === 0) return null;
  candidatos.sort(function(a, b){ return b.getLastUpdated() - a.getLastUpdated(); });
  return candidatos[0];
}

// Convierte un .xlsx a valores usando el servicio avanzado de Drive (v3)
// IMPORTANTE: requiere activar "Drive API" en Servicios del editor.
function xlsxAValores(file) {
  var blob = file.getBlob();
  var recurso = { name: "TMP_CONV_" + Date.now(), mimeType: MimeType.GOOGLE_SHEETS };
  var temp = Drive.Files.create(recurso, blob, { supportsAllDrives: true });
  var valores = [];
  try {
    valores = SpreadsheetApp.openById(temp.id).getSheets()[0].getDataRange().getValues();
  } finally {
    try { Drive.Files.remove(temp.id); } catch(e) { Logger.log("No se pudo borrar temporal: " + e.message); }
  }
  return valores;
}

// ==========================================
// SNAPSHOT SEMANAL
// ==========================================
// Clave normalizada compartida por el snapshot Y por la auditoría (regla X/J).
function claveSnap(tienda, ubicacion, pedido) {
  return String(tienda).trim().toUpperCase() + "||" +
         String(ubicacion).trim().toUpperCase() + "||" +
         String(pedido).trim().toUpperCase();
}

// Lee el snapshot de la semana anterior → objeto { clave: true }
function leerSnapshotAnterior() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName(SNAPSHOT_HOJA);
  var set = {};
  if (!hoja) return set;
  var datos = hoja.getDataRange().getValues();
  for (var i = 1; i < datos.length; i++) {
    set[claveSnap(datos[i][0], datos[i][1], datos[i][2])] = true;
  }
  return set;
}

// Guarda el estado de ESTA semana (solo ubicaciones de día L/M/X/J/V/S)
function guardarSnapshotSemanal() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName(SNAPSHOT_HOJA) || ss.insertSheet(SNAPSHOT_HOJA);
  hoja.clearContents();
  hoja.appendRow(["Tienda", "Ubicacion", "Pedido", "FechaSnapshot"]);

  var hoyStr = Utilities.formatDate(new Date(), ss.getSpreadsheetTimeZone(), "dd/MM/yyyy");
  var diaSet = {};
  ETIQUETAS_DIA_SNAPSHOT.forEach(function(e){ diaSet[e] = true; });

  var filas = [];
  CODIGOS_TIENDA_ORDEN.forEach(function(codigo) {
    var nombreTienda = ARCHIVOS_TIENDA[codigo];
    var hT = ss.getSheetByName(nombreTienda);
    if (!hT) return;
    var data = hT.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      var ubic = (data[i][IMP_COL_UBICACION] || "").toString().trim().toUpperCase();
      var ped  = data[i][IMP_COL_PEDIDO];
      if (!ubic || !ped) continue;
      if (diaSet[ubic]) filas.push([nombreTienda, ubic, ped, hoyStr]);
    }
  });

  if (filas.length > 0) hoja.getRange(2, 1, filas.length, 4).setValues(filas);
  hoja.hideSheet();
  Logger.log("Snapshot guardado: " + filas.length + " registros.");
}

// ==========================================
// SNAPSHOT "POR UBICAR" DE TIENDA (VX/VJ/TX/TJ/AX/AJ)
// ==========================================
// Lee el snapshot de la semana anterior → objeto { clave: true }
function leerSnapshotTiendasUbicarAnterior() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName(SNAPSHOT_UBICAR_TIENDAS_HOJA);
  var set = {};
  if (!hoja) return set;
  var datos = hoja.getDataRange().getValues();
  for (var i = 1; i < datos.length; i++) {
    set[claveSnap(datos[i][0], datos[i][1], datos[i][2])] = true;
  }
  return set;
}

// Guarda el estado de ESTA semana de las líneas VX/VJ/TX/TJ/AX/AJ (por tienda,
// solo MARBELLA/MALAGA/MIJAS — Granada no tiene circuito de revisión propio).
function guardarSnapshotTiendasUbicar() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName(SNAPSHOT_UBICAR_TIENDAS_HOJA) || ss.insertSheet(SNAPSHOT_UBICAR_TIENDAS_HOJA);
  hoja.clearContents();
  hoja.appendRow(["Tienda", "Ubicacion", "Pedido", "FechaSnapshot"]);

  var hoyStr = Utilities.formatDate(new Date(), ss.getSpreadsheetTimeZone(), "dd/MM/yyyy");
  var filas = [];

  Object.keys(CODIGOS_REVISION).forEach(function(nombreTienda) {
    var hT = ss.getSheetByName(nombreTienda);
    if (!hT) return;
    var codT = CODIGOS_REVISION[nombreTienda];
    var prefijosExcluirXJ = PREFIJOS_ORIGEN_TIENDA_EXCLUIR_XJ.map(function(p){ return p + codT; });
    var data = hT.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      var ubic = (data[i][IMP_COL_UBICACION] || "").toString().trim().toUpperCase();
      var ped  = data[i][IMP_COL_PEDIDO];
      if (!ubic || !ped) continue;
      if (prefijosExcluirXJ.some(function(p){ return ubic.indexOf(p) === 0; })) {
        filas.push([nombreTienda, ubic, ped, hoyStr]);
      }
    }
  });

  if (filas.length > 0) hoja.getRange(2, 1, filas.length, 4).setValues(filas);
  hoja.hideSheet();
  Logger.log("Snapshot tiendas por ubicar guardado: " + filas.length + " registros.");
}

// ==========================================
// DIAGNÓSTICO
// ==========================================
function diagnosticarCarpeta() {
  var carpeta = DriveApp.getFolderById(CARPETA_INVENTARIOS_ID);
  var archivos = carpeta.getFiles();
  var lista = [];
  while (archivos.hasNext()) {
    var f = archivos.next();
    lista.push("• " + f.getName() + "  (" + Utilities.formatDate(f.getLastUpdated(), Session.getScriptTimeZone(), "dd/MM HH:mm") + ")");
  }
  var msg = lista.length > 0 ? lista.join("\n") : "⚠️ Carpeta vacía o sin acceso.";
  SpreadsheetApp.getUi().alert("📁 Archivos en la carpeta:\n\n" + msg);
}

// ==========================================
// INSTALAR TRIGGER (solo Jueves)
// ==========================================
function instalarTriggerJueves() {
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === "procesoAutomaticoJueves") ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger("procesoAutomaticoJueves")
    .timeBased().onWeekDay(ScriptApp.WeekDay.THURSDAY).atHour(12).create();
  SpreadsheetApp.getUi().alert(
    "✅ Automatización instalada:\n\nJUEVES 12:00 →\n" +
    "  1. Importa los 4 Excel\n  2. Ejecuta auditoría\n  3. Genera resumen mensual\n" +
    "  4. Envía los 4 correos\n  5. Guarda snapshots (equipo y tiendas por ubicar)"
  );
}

// ==========================================
// DIAGNÓSTICO — investigación puntual del bug
// "Valor total Mijas disparado" (ver CLAUDE.md, bugs ya resueltos #2).
// Se mantienen como herramientas manuales por si hace falta repetir
// el diagnóstico; no las llama ningún trigger ni menú.
// ==========================================
function diagnosticarValorMijas() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName("MIJAS");
  var datos = hoja.getDataRange().getValues();
  var hojaD = ss.getSheetByName("DIRECCIONES");
  var setP = new Set(hojaD.getRange("A:A").getValues().flat().filter(String)
    .map(function(d){ return d.toString().trim().toUpperCase(); }));

  var filas = [];
  for (var i = 1; i < datos.length; i++) {
    var f = datos[i];
    var dir = f[0].toString().trim().toUpperCase();
    if (!setP.has(dir)) continue;
    var imp = parseFloat(f[9]) || 0;
    filas.push({ fila: i + 1, ubic: f[0], pedido: f[1], bruto: f[9], parseado: imp });
  }

  filas.sort(function(a, b){ return b.parseado - a.parseado; });

  var msg = "TOP 8 valores más altos en columna J (Mijas):\n";
  filas.slice(0, 8).forEach(function(r) {
    msg += "Fila " + r.fila + " | Ped: " + r.pedido +
           " | Bruto: [" + r.bruto + "] | Parseado: " + r.parseado + "\n";
  });

  var suma = filas.reduce(function(s, r){ return s + r.parseado; }, 0);
  msg += "SUMA TOTAL: " + suma.toLocaleString('es-ES');

  Logger.log(msg);
}

function diagnosticarResumenMijas() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName("MIJAS");
  var datos = hoja.getDataRange().getValues();
  var hojaD = ss.getSheetByName("DIRECCIONES");
  var setP = new Set(hojaD.getRange("A:A").getValues().flat().filter(String)
    .map(function(d){ return d.toString().trim().toUpperCase(); }));

  var sumaTotal = 0;
  var conFecha = 0, sinFecha = 0;
  var topFechas = [];

  for (var i = 1; i < datos.length; i++) {
    var f = datos[i];
    var d = f[0].toString().trim().toUpperCase();
    if (!setP.has(d)) continue;

    var imp = parseFloat(f[9]) || 0;
    var fec = f[11];

    if (fec instanceof Date && !isNaN(fec)) {
      conFecha++;
      sumaTotal += imp;
      topFechas.push({ fila: i+1, imp: imp, fec: fec });
    } else {
      sinFecha++;
    }
  }

  topFechas.sort(function(a,b){ return b.imp - a.imp; });

  var msg = "RESUMEN MENSUAL MIJAS (filtra solo filas con fecha en col L):\n";
  msg += "Filas CON fecha válida: " + conFecha + "\n";
  msg += "Filas SIN fecha (descartadas): " + sinFecha + "\n";
  msg += "SUMA dT (valor total): " + sumaTotal.toLocaleString('es-ES') + "\n\n";
  msg += "TOP 5 importes (con fecha):\n";
  topFechas.slice(0,5).forEach(function(r){
    msg += "Fila " + r.fila + " | Imp: " + r.imp + " | Fecha col L: " + r.fec + "\n";
  });

  Logger.log(msg);
}

function diagnosticarHojaResumenMijas() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName("RESUMEN_PEDIDO_MESES");
  if (!hoja) { Logger.log("No existe RESUMEN_PEDIDO_MESES. Ejecuta primero el resumen mensual."); return; }
  var datos = hoja.getDataRange().getValues();

  var msg = "Buscando bloque MIJAS en RESUMEN_PEDIDO_MESES:\n";
  for (var i = 0; i < datos.length; i++) {
    if (datos[i][0] === "TIENDA: MIJAS") {
      msg += "\n>>> Encontrado en fila " + (i+1) + "\n";
      for (var j = i; j < i + 5 && j < datos.length; j++) {
        msg += "Fila " + (j+1) + ": [" +
          datos[j][0] + "] [" + datos[j][1] + "] [" + datos[j][2] + "] [" +
          datos[j][3] + "] [" + datos[j][4] + "] [" + datos[j][5] + "]\n";
      }
      break;
    }
  }
  Logger.log(msg);
}
