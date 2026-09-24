// ==========================================
// MÓDULO: UTILIDADES
// ==========================================

function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function limpiarHojasTiendas() {
  var ui = SpreadsheetApp.getUi();
  if (ui.alert('⚠️ ATENCIÓN', '¿Borrar datos de todas las tiendas?', ui.ButtonSet.YES_NO) == ui.Button.YES) {
    ["MARBELLA","MALAGA","GRANADA","MIJAS"].forEach(n => {
      var h = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(n);
      if (h && h.getLastRow() > 1) h.getRange(2, 1, h.getLastRow()-1, h.getLastColumn()).clearContent();
    });
    SpreadsheetApp.getUi().alert("✅ Datos de tiendas limpiados.");
  }
}
