/**
 * IMDAS Import Controller
 * Handles import of museum data from IMDAS system
 */

export default {
  /**
   * Import data from uploaded file
   */
  async import(ctx) {
    try {
      const { files } = ctx.request;
      
      if (!files || !files.file) {
        return ctx.badRequest('Keine Datei hochgeladen');
      }

      const file = Array.isArray(files.file) ? files.file[0] : files.file;
      const format = ctx.request.body.format || 'xml';
      
      // Import service aufrufen
      const importService = strapi.service('api::imdas-import.imdas-import');
      const result = await importService.importFromFile(file.path, format);

      return ctx.send({
        success: true,
        message: `Import erfolgreich: ${result.success} Objekte importiert`,
        details: result
      });
    } catch (error) {
      return ctx.badRequest('Import fehlgeschlagen: ' + error.message);
    }
  },

  /**
   * Get import status
   */
  async status(ctx) {
    const importService = strapi.service('api::imdas-import.imdas-import');
    const status = await importService.getImportStatus();
    
    return ctx.send(status);
  },

  /**
   * Preview import without saving
   */
  async preview(ctx) {
    try {
      const { files } = ctx.request;
      
      if (!files || !files.file) {
        return ctx.badRequest('Keine Datei hochgeladen');
      }

      const file = Array.isArray(files.file) ? files.file[0] : files.file;
      const format = ctx.request.body.format || 'xml';
      
      const importService = strapi.service('api::imdas-import.imdas-import');
      const preview = await importService.previewImport(file.path, format);

      return ctx.send({
        success: true,
        preview: preview.slice(0, 10), // Erste 10 Objekte
        total: preview.length
      });
    } catch (error) {
      return ctx.badRequest('Vorschau fehlgeschlagen: ' + error.message);
    }
  },

  /**
   * Map IMDAS fields to Exponat fields
   */
  async getFieldMapping(ctx) {
    return ctx.send({
      mapping: {
        'inventarnummer': 'Inventarnummer',
        'objektbezeichnung': 'Titel',
        'beschreibung.kurz': 'Kurzbeschreibung',
        'beschreibung.lang': 'Beschreibung',
        'datierung.von': 'Jahr von',
        'datierung.bis': 'Jahr bis',
        'material': 'Material',
        'masse': 'Maße',
        'herstellung.ort': 'Entstehungsort',
        'kuenstler.name': 'Künstler',
        'standort.aktuell': 'Standort',
        'schlagworte': 'Tags'
      }
    });
  }
};