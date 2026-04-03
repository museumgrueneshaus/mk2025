import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {schemaTypes} from './schemas'
import {HilfeSeite} from './components/HilfeSeite'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || '832k5je1'
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

export default defineConfig({
  name: 'default',
  title: 'Museum Kiosk Backend',

  projectId,
  dataset,

  tools: [
    {
      name: 'hilfe',
      title: '📚 Hilfe',
      icon: () => '📚',
      component: HilfeSeite,
    },
  ],

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Museum')
          .items([

            // ── AUSSTELLUNG & EXPONATE ──────────────────────────────────
            S.listItem()
              .title('🖼️  Ausstellungen')
              .schemaType('ausstellung')
              .child(S.documentTypeList('ausstellung').title('Ausstellungen')),

            S.listItem()
              .title('🗿  Exponate')
              .schemaType('exponat')
              .child(S.documentTypeList('exponat').title('Exponate')),

            S.listItem()
              .title('🏷️  Kategorien')
              .schemaType('kategorie')
              .child(S.documentTypeList('kategorie').title('Kategorien')),

            S.divider(),

            // ── MEDIEN ─────────────────────────────────────────────────
            S.listItem()
              .title('🎬  Videos')
              .icon(() => '🎬')
              .child(
                S.documentList()
                  .title('Videos')
                  .filter('_type == "sanity.fileAsset" && mimeType match "video/*"')
                  .child((documentId) =>
                    S.document()
                      .documentId(documentId)
                      .schemaType('sanity.fileAsset')
                  )
              ),

            S.listItem()
              .title('🖼️  Bilder')
              .icon(() => '🖼️')
              .child(
                S.documentList()
                  .title('Bilder')
                  .filter('_type == "sanity.imageAsset"')
                  .child((documentId) =>
                    S.document()
                      .documentId(documentId)
                      .schemaType('sanity.imageAsset')
                  )
              ),

            S.listItem()
              .title('📄  Dokumente & PDFs')
              .icon(() => '📄')
              .child(
                S.documentList()
                  .title('Dokumente & PDFs')
                  .filter('_type == "sanity.fileAsset" && !(mimeType match "video/*")')
                  .child((documentId) =>
                    S.document()
                      .documentId(documentId)
                      .schemaType('sanity.fileAsset')
                  )
              ),

            S.divider(),

            // ── SYSTEM & EINSTELLUNGEN ─────────────────────────────────
            S.listItem()
              .title('📺  Kiosk-Geräte')
              .schemaType('kioskDevice')
              .child(S.documentTypeList('kioskDevice').title('Kiosk-Geräte')),

            S.listItem()
              .title('ℹ️  Museum Info')
              .schemaType('museumInfo')
              .child(S.documentTypeList('museumInfo').title('Museum Info')),

            S.listItem()
              .title('📁  Dokument-Vorlagen')
              .schemaType('dokumentKategorie')
              .child(S.documentTypeList('dokumentKategorie').title('Dokument-Vorlagen')),

          ]),
    }),
  ],

  schema: {
    types: schemaTypes,
  },
})
