import { parseStringPromise } from 'xml2js';
import * as fs from 'fs';
import * as path from 'path';

/**
 * IMDAS Import Service
 * Importiert Daten aus IMDAS XML/CSV Exports
 */
export class IMDASImporter {
  private strapi: any;

  constructor(strapi: any) {
    this.strapi = strapi;
  }

  /**
   * Hauptimport-Funktion
   */
  async importFromFile(filePath: string, format: 'xml' | 'csv' | 'lido' = 'xml') {
    try {
      switch (format) {
        case 'xml':
          return await this.importXML(filePath);
        case 'csv':
          return await this.importCSV(filePath);
        case 'lido':
          return await this.importLIDO(filePath);
        default:
          throw new Error(`Format ${format} nicht unterstützt`);
      }
    } catch (error) {
      console.error('IMDAS Import Fehler:', error);
      throw error;
    }
  }

  /**
   * XML Import (Haupt-Format)
   */
  async importXML(filePath: string) {
    const xmlContent = fs.readFileSync(filePath, 'utf-8');
    const result = await parseStringPromise(xmlContent);
    
    const objekte = result.objektsammlung?.objekt || [];
    const importResults = {
      success: 0,
      failed: 0,
      skipped: 0,
      errors: []
    };

    for (const objekt of objekte) {
      try {
        // Prüfen ob bereits existiert
        const inventarnummer = this.getValue(objekt.inventarnummer);
        const existing = await this.strapi.db.query('api::exponat.exponat').findOne({
          where: { inventarnummer }
        });

        if (existing) {
          importResults.skipped++;
          continue;
        }

        // Mapping der Felder
        const exponatData = this.mapIMDASToExponat(objekt);
        
        // Bilder verarbeiten
        const bildPfade = await this.processImages(objekt.abbildungen);
        if (bildPfade.length > 0) {
          exponatData.hauptbild = bildPfade[0];
          exponatData.bilder = bildPfade;
        }

        // Exponat erstellen
        await this.strapi.entityService.create('api::exponat.exponat', {
          data: exponatData
        });

        importResults.success++;
      } catch (error) {
        importResults.failed++;
        importResults.errors.push({
          inventarnummer: objekt.inventarnummer?.[0],
          error: error.message
        });
      }
    }

    return importResults;
  }

  /**
   * CSV Import (Alternative)
   */
  async importCSV(filePath: string) {
    const csvContent = fs.readFileSync(filePath, 'utf-8');
    const lines = csvContent.split('\n');
    const headers = lines[0].split(';').map(h => h.trim());
    
    const importResults = {
      success: 0,
      failed: 0,
      skipped: 0,
      errors: []
    };

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(';').map(v => v.trim());
      const objekt = {};
      
      headers.forEach((header, index) => {
        objekt[header] = values[index];
      });

      try {
        const exponatData = this.mapCSVToExponat(objekt);
        
        await this.strapi.entityService.create('api::exponat.exponat', {
          data: exponatData
        });
        
        importResults.success++;
      } catch (error) {
        importResults.failed++;
        importResults.errors.push({
          line: i + 1,
          error: error.message
        });
      }
    }

    return importResults;
  }

  /**
   * LIDO Import (Museum Standard)
   */
  async importLIDO(filePath: string) {
    const xmlContent = fs.readFileSync(filePath, 'utf-8');
    const result = await parseStringPromise(xmlContent);
    
    // LIDO hat eine andere Struktur
    const lidoRecords = result['lido:lidoWrap']?.['lido:lido'] || [];
    const importResults = {
      success: 0,
      failed: 0,
      skipped: 0,
      errors: []
    };

    for (const record of lidoRecords) {
      try {
        const exponatData = this.mapLIDOToExponat(record);
        
        await this.strapi.entityService.create('api::exponat.exponat', {
          data: exponatData
        });
        
        importResults.success++;
      } catch (error) {
        importResults.failed++;
        importResults.errors.push({
          recordID: record['lido:lidoRecID']?.[0],
          error: error.message
        });
      }
    }

    return importResults;
  }

  /**
   * IMDAS XML zu Exponat Mapping
   */
  private mapIMDASToExponat(objekt: any) {
    return {
      inventarnummer: this.getValue(objekt.inventarnummer),
      titel: this.getValue(objekt.objektbezeichnung) || this.getValue(objekt.titel),
      untertitel: this.getValue(objekt.titel),
      kurzbeschreibung: this.getValue(objekt.beschreibung?.kurz) || 
                        this.getValue(objekt.objektbezeichnung),
      beschreibung: this.getValue(objekt.beschreibung?.lang),
      
      // Datierung
      jahr_von: this.parseYear(objekt.datierung?.von),
      jahr_bis: this.parseYear(objekt.datierung?.bis),
      epoche: this.mapEpoche(objekt.datierung),
      
      // Material & Maße
      material: this.getValue(objekt.material),
      masse: this.formatMeasurements(objekt.masse),
      
      // Herkunft
      entstehungsort: this.getValue(objekt.herstellung?.ort),
      kuenstler: this.getValue(objekt.kuenstler?.name),
      
      // Standort
      standort: this.getValue(objekt.standort?.aktuell),
      leihgeber: this.getValue(objekt.leihgeber),
      
      // Tags & Metadata
      tags: this.extractTags(objekt.schlagworte),
      metadaten: {
        imdas_id: this.getValue(objekt.id),
        import_date: new Date().toISOString(),
        original_data: objekt
      },
      
      // Highlight wenn besondere Kategorie
      ist_highlight: this.checkIfHighlight(objekt)
    };
  }

  /**
   * CSV zu Exponat Mapping
   */
  private mapCSVToExponat(row: any) {
    return {
      inventarnummer: row['Inventarnummer'] || row['Inv.Nr.'],
      titel: row['Objektbezeichnung'] || row['Titel'],
      kurzbeschreibung: row['Kurzbeschreibung'] || row['Objektbezeichnung'],
      beschreibung: row['Beschreibung'] || row['Langtext'],
      jahr_von: this.parseYear(row['Datierung von'] || row['Jahr von']),
      jahr_bis: this.parseYear(row['Datierung bis'] || row['Jahr bis']),
      material: row['Material'],
      entstehungsort: row['Herstellungsort'] || row['Ort'],
      kuenstler: row['Künstler'] || row['Hersteller'],
      standort: row['Standort'],
      tags: (row['Schlagworte'] || '').split(',').map(t => t.trim()).filter(Boolean)
    };
  }

  /**
   * LIDO zu Exponat Mapping
   */
  private mapLIDOToExponat(record: any) {
    const descriptiveMetadata = record['lido:descriptiveMetadata']?.[0];
    const administrativeMetadata = record['lido:administrativeMetadata']?.[0];
    
    return {
      inventarnummer: this.getLIDOValue(administrativeMetadata, 'lido:recordWrap.lido:recordID'),
      titel: this.getLIDOValue(descriptiveMetadata, 'lido:objectIdentificationWrap.lido:titleWrap.lido:titleSet.lido:appellationValue'),
      kurzbeschreibung: this.getLIDOValue(descriptiveMetadata, 'lido:objectIdentificationWrap.lido:objectDescriptionWrap.lido:objectDescriptionSet.lido:descriptiveNoteValue'),
      // ... weitere LIDO Mappings
    };
  }

  /**
   * Hilfsfunktionen
   */
  private getValue(field: any): string | null {
    if (!field) return null;
    if (Array.isArray(field)) return field[0];
    if (typeof field === 'object') return field._ || field.value || null;
    return field;
  }

  private parseYear(yearStr: any): number | null {
    const year = this.getValue(yearStr);
    if (!year) return null;
    
    const parsed = parseInt(year.toString().replace(/[^\d-]/g, ''));
    return isNaN(parsed) ? null : parsed;
  }

  private mapEpoche(datierung: any): string | null {
    const von = this.parseYear(datierung?.von);
    const bis = this.parseYear(datierung?.bis);
    const freitext = this.getValue(datierung?.freitext)?.toLowerCase();
    
    if (freitext) {
      if (freitext.includes('steinzeit') || freitext.includes('prähistor')) return 'Vorgeschichte';
      if (freitext.includes('antik') || freitext.includes('röm') || freitext.includes('griech')) return 'Antike';
      if (freitext.includes('mittelalter')) return 'Mittelalter';
      if (freitext.includes('neuzeit') || freitext.includes('barock') || freitext.includes('renaissance')) return 'Neuzeit';
      if (freitext.includes('modern') || freitext.includes('20. jh') || freitext.includes('19. jh')) return 'Moderne';
      if (freitext.includes('zeitgenössisch') || freitext.includes('21. jh')) return 'Zeitgenössisch';
    }
    
    // Nach Jahren
    if (von) {
      if (von < -3000) return 'Vorgeschichte';
      if (von < 500) return 'Antike';
      if (von < 1500) return 'Mittelalter';
      if (von < 1900) return 'Neuzeit';
      if (von < 2000) return 'Moderne';
      return 'Zeitgenössisch';
    }
    
    return null;
  }

  private formatMeasurements(masse: any): string | null {
    if (!masse) return null;
    
    const parts = [];
    if (masse.hoehe) parts.push(`H: ${this.getValue(masse.hoehe)}${masse.hoehe.einheit || 'cm'}`);
    if (masse.breite) parts.push(`B: ${this.getValue(masse.breite)}${masse.breite.einheit || 'cm'}`);
    if (masse.tiefe) parts.push(`T: ${this.getValue(masse.tiefe)}${masse.tiefe.einheit || 'cm'}`);
    if (masse.gewicht) parts.push(`${this.getValue(masse.gewicht)}${masse.gewicht.einheit || 'g'}`);
    
    return parts.join(', ') || null;
  }

  private extractTags(schlagworte: any): string[] {
    if (!schlagworte) return [];
    
    const tags = [];
    if (schlagworte.schlagwort) {
      const schlagwortArray = Array.isArray(schlagworte.schlagwort) 
        ? schlagworte.schlagwort 
        : [schlagworte.schlagwort];
      
      schlagwortArray.forEach(sw => {
        const value = this.getValue(sw);
        if (value) tags.push(value);
      });
    }
    
    return tags;
  }

  private checkIfHighlight(objekt: any): boolean {
    const kategorie = this.getValue(objekt.kategorie)?.toLowerCase();
    const bedeutung = this.getValue(objekt.bedeutung)?.toLowerCase();
    
    return kategorie === 'highlight' || 
           bedeutung === 'hoch' || 
           objekt.ausstellung?.includes('dauer');
  }

  private async processImages(abbildungen: any): Promise<any[]> {
    if (!abbildungen?.abbildung) return [];
    
    const bilder = Array.isArray(abbildungen.abbildung) 
      ? abbildungen.abbildung 
      : [abbildungen.abbildung];
    
    const processedImages = [];
    
    for (const bild of bilder) {
      const dateiname = this.getValue(bild.dateiname || bild);
      if (dateiname) {
        // Hier würde die Bild-Verarbeitung stattfinden
        // Z.B. aus IMDAS-Bildarchiv kopieren
        processedImages.push({
          filename: dateiname,
          type: this.getValue(bild.typ) || 'Hauptansicht'
        });
      }
    }
    
    return processedImages;
  }

  private getLIDOValue(obj: any, path: string): any {
    const parts = path.split('.');
    let current = obj;
    
    for (const part of parts) {
      if (!current) return null;
      current = current[part];
      if (Array.isArray(current)) current = current[0];
    }
    
    return this.getValue(current);
  }
}