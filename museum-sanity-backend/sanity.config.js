import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemas'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || '832k5je1'
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

export default defineConfig({
  name: 'default',
  title: 'Museum Kiosk Backend',

  projectId,
  dataset,

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Inhalt')
          .items([
            // Kiosk Konfiguration
            S.listItem()
              .title('Kiosk Konfiguration')
              .schemaType('kioskConfig')
              .child(S.documentTypeList('kioskConfig').title('Kiosk Konfiguration')),

            // Kiosk Devices
            S.listItem()
              .title('Kiosk Devices')
              .schemaType('kioskDevice')
              .child(S.documentTypeList('kioskDevice').title('Kiosk Devices')),

            // Exponat
            S.listItem()
              .title('Exponate')
              .schemaType('exponat')
              .child(S.documentTypeList('exponat').title('Exponate')),

            // Kategorien
            S.listItem()
              .title('Kategorien')
              .schemaType('kategorie')
              .child(S.documentTypeList('kategorie').title('Kategorien')),

            // Ausstellungen
            S.listItem()
              .title('Ausstellungen')
              .schemaType('ausstellung')
              .child(S.documentTypeList('ausstellung').title('Ausstellungen')),

            // Museum Info
            S.listItem()
              .title('Museum Info')
              .schemaType('museumInfo')
              .child(S.documentTypeList('museumInfo').title('Museum Info')),

            // Divider
            S.divider(),

            // Media Galerie - Videos
            S.listItem()
              .title('📁 Media Galerie - Videos')
              .icon(() => '🎬')
              .child(
                S.documentList()
                  .title('Video Dateien')
                  .filter('_type == "sanity.fileAsset" && mimeType match "video/*"')
                  .child((documentId) =>
                    S.document()
                      .documentId(documentId)
                      .schemaType('sanity.fileAsset')
                  )
              ),

            // Media Galerie - Bilder
            S.listItem()
              .title('📁 Media Galerie - Bilder')
              .icon(() => '🖼️')
              .child(
                S.documentList()
                  .title('Bild Dateien')
                  .filter('_type == "sanity.imageAsset"')
                  .child((documentId) =>
                    S.document()
                      .documentId(documentId)
                      .schemaType('sanity.imageAsset')
                  )
              ),

            // Media Galerie - Dokumente
            S.listItem()
              .title('📁 Media Galerie - Dokumente')
              .icon(() => '📄')
              .child(
                S.documentList()
                  .title('Dokument Dateien')
                  .filter('_type == "sanity.fileAsset" && !(mimeType match "video/*") && (mimeType match "application/*" || mimeType match "text/*")')
                  .child((documentId) =>
                    S.document()
                      .documentId(documentId)
                      .schemaType('sanity.fileAsset')
                  )
              ),

            // Media Galerie - Alle Dateien
            S.listItem()
              .title('📁 Media Galerie - Alle Dateien')
              .icon(() => '📦')
              .child(
                S.documentList()
                  .title('Alle Media Dateien')
                  .filter('_type == "sanity.fileAsset" || _type == "sanity.imageAsset"')
                  .child((documentId) =>
                    S.document()
                      .documentId(documentId)
                  )
              ),
          ]),
    }),
    visionTool()
  ],

  schema: {
    types: schemaTypes,
  },
})
