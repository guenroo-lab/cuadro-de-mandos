# Sistema TAISA / Leroy Merlin Málaga — Apps Script

Suite de Google Apps Script para la Plataforma Leroy Merlin Málaga (TAISA).
**Empieza leyendo `CLAUDE.md`** — tiene todo el contexto, reglas de negocio, IDs y calendario de triggers.

## Estructura
```
.
├── CLAUDE.md              ← LEER PRIMERO (contexto completo del proyecto)
├── README.md
├── .clasp.json.ejemplo    ← renombrar a .clasp.json y poner el scriptId
└── src/
    ├── appsscript.json            (manifiesto, Drive API v3)
    ├── Configuracion.gs           (config, correos, estilos, onOpen)
    ├── Auditoria.gs               (auditoría semanal + informe PC total)
    ├── CorreosSemanales.gs        (3 correos: retrasos, resumen, revisión)
    ├── GenerarMensual.gs          (resumen mensual pedidos/retrasos)
    ├── EnviarMensualCSV.gs        (correo mensual a tiendas + CSV)
    ├── DashboardIncidencias.gs    (dashboard + informes mensuales incidencias)
    ├── ImportacionAutomatica.gs   (importar Excel + snapshot + orquestador jueves)
    └── Utilidades.gs              (getWeekNumber, limpiarHojasTiendas)
```

## Conectar con Apps Script (clasp)
```bash
npm install -g @google/clasp
clasp login
cp .clasp.json.ejemplo .clasp.json   # y pega tu scriptId
clasp pull   # baja lo que haya en el Sheet
clasp push   # sube tus cambios
```
El `scriptId` está en: Apps Script → Configuración del proyecto → ID de secuencia de comandos.

## Puesta en marcha
Ver checklist al final de `CLAUDE.md`.
