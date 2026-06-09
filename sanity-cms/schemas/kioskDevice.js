// schemas/kioskDevice.js
import { KioskPreviewLink } from '../components/KioskPreviewLink.jsx'

export default {
  name: 'kioskDevice',
  title: 'Kiosk Device',
  type: 'document',
  // ── Tabs ──────────────────────────────────────────────────────────────────
  groups: [
    { name: 'geraet',     title: 'Gerät',              default: true },
    { name: 'ausstellung', title: 'Ausstellung' },
    { name: 'system',     title: 'System (IT)', description: 'Nur für Administratoren' },
  ],

  fields: [

    // ── TAB: GERÄT ─────────────────────────────────────────────────────────
    {
      name: 'vorschau_link',
      title: 'Vorschau',
      type: 'string',
      group: 'geraet',
      readOnly: true,
      components: { input: KioskPreviewLink },
      description: ' '
    },
    {
      name: 'kioskId',
      title: 'Kiosk-ID',
      type: 'string',
      group: 'geraet',
      description: 'Eindeutige Kennung dieses Geräts (z.B. RPI_01, KIOSK_EINGANG). Muss exakt mit der Konfiguration auf dem Raspberry Pi übereinstimmen.',
      validation: Rule => Rule.required().error('Kiosk-ID ist erforderlich.')
    },
    {
      name: 'hostname',
      title: 'Hostname',
      type: 'string',
      group: 'geraet',
      description: 'Netzwerkname des Raspberry Pi (z.B. rpi01). Wird zur automatischen Identifikation im Netzwerk verwendet.',
      validation: Rule => Rule.required().error('Hostname ist erforderlich.')
    },
    {
      name: 'location',
      title: 'Standort',
      type: 'string',
      group: 'geraet',
      description: 'Standort des Geräts im Museum (z.B. "Eingang Haupthalle", "Raum 3 – Mittelalter"). Nur für interne Übersicht.'
    },
    {
      name: 'notes',
      title: 'Interne Notizen',
      type: 'text',
      group: 'geraet',
      description: 'Interne Notizen zu diesem Gerät (z.B. bekannte Probleme, Wartungshinweise, Standortwechsel-Historie).'
    },

    // ── TAB: AUSSTELLUNG ───────────────────────────────────────────────────
    {
      name: 'modus',
      title: 'Anzeigemodus',
      type: 'string',
      group: 'ausstellung',
      options: {
        list: [
          {title: 'Ausstellung', value: 'ausstellung'},
          {title: 'Malspiel', value: 'malspiel'},
        ],
        layout: 'radio'
      },
      initialValue: 'ausstellung',
      description: 'Was soll dieser Kiosk anzeigen?'
    },
    {
      name: 'ausstellung',
      title: 'Aktive Ausstellung',
      type: 'reference',
      group: 'ausstellung',
      to: [{type: 'ausstellung'}],
      hidden: ({parent}) => parent?.modus === 'malspiel',
      description: 'Die Ausstellung, die auf diesem Kiosk angezeigt wird.',
      validation: Rule => Rule.custom((val, ctx) => {
        if (ctx.parent?.modus !== 'malspiel' && !val) return 'Bitte eine Ausstellung auswählen.'
        return true
      })
    },
    {
      name: 'malspiel',
      title: 'Malspiel',
      type: 'reference',
      group: 'ausstellung',
      to: [{type: 'malspiel'}],
      hidden: ({parent}) => parent?.modus !== 'malspiel',
      description: 'Das Malspiel das auf diesem Kiosk angezeigt wird.',
      validation: Rule => Rule.custom((val, ctx) => {
        if (ctx.parent?.modus === 'malspiel' && !val) return 'Bitte ein Malspiel auswählen.'
        return true
      })
    },
    {
      name: 'kioskUrl',
      title: 'Kiosk-URL (optional überschreiben)',
      type: 'url',
      group: 'ausstellung',
      description: 'Normalerweise leer lassen – wird automatisch anhand der Ausstellung und des Templates gesetzt. Nur überschreiben wenn eine individuelle URL benötigt wird.',
      initialValue: undefined
    },

    // ── TAB: SYSTEM (IT) ───────────────────────────────────────────────────
    {
      name: 'macAddress',
      title: 'MAC-Adresse',
      type: 'string',
      group: 'system',
      description: 'Letzte 6 Zeichen der MAC-Adresse des Geräts (zur eindeutigen Hardware-Identifikation)'
    },
    {
      name: 'wlanNetworks',
      title: 'WLAN-Netzwerke',
      type: 'array',
      group: 'system',
      hidden: ({currentUser}) => !currentUser?.roles?.some(r => r.name === 'administrator'),
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'ssid',
              title: 'Netzwerkname (SSID)',
              type: 'string',
              validation: Rule => Rule.required().error('SSID ist erforderlich.')
            },
            {
              name: 'password',
              title: 'Passwort',
              type: 'string',
              validation: Rule => Rule.required().error('Passwort ist erforderlich.')
            },
            {
              name: 'priority',
              title: 'Priorität',
              type: 'number',
              description: 'Höhere Zahl = bevorzugt. Bei mehreren Netzwerken wird das mit der höchsten Priorität zuerst verwendet.',
              initialValue: 10
            },
            {
              name: 'description',
              title: 'Beschreibung',
              type: 'string',
              description: 'Kurze Bezeichnung, z.B. "Museum-WLAN", "Backup-Hotspot"'
            }
          ],
          preview: {
            select: {
              ssid: 'ssid',
              priority: 'priority',
              description: 'description'
            },
            prepare({ssid, priority, description}) {
              return {
                title: ssid,
                subtitle: `Priorität: ${priority}${description ? ' – ' + description : ''}`
              }
            }
          }
        }
      ],
      description: 'WLAN-Zugangsdaten für dieses Gerät. Wird bei der nächsten Verbindung des Pi automatisch konfiguriert.'
    },
    {
      name: 'status',
      title: 'Gerätestatus (automatisch)',
      type: 'object',
      group: 'system',
      description: 'Wird automatisch vom Raspberry Pi via Heartbeat aktualisiert – nicht manuell bearbeiten.',
      hidden: ({currentUser}) => !currentUser?.roles?.some(r => r.name === 'administrator'),
      fields: [
        {
          name: 'online',
          title: 'Online',
          type: 'boolean',
          initialValue: false,
          description: 'Wird automatisch gesetzt – true wenn Heartbeat innerhalb der letzten 2 Minuten empfangen'
        },
        {
          name: 'lastSeen',
          title: 'Zuletzt gesehen',
          type: 'datetime',
          description: 'Zeitpunkt des letzten empfangenen Heartbeat-Signals'
        },
        {
          name: 'ipAddress',
          title: 'IP-Adresse',
          type: 'string',
          description: 'Aktuelle IP-Adresse im Netzwerk (wird automatisch aktualisiert)'
        },
        {
          name: 'uptimeSeconds',
          title: 'Laufzeit (Sekunden)',
          type: 'number',
          description: 'Betriebszeit seit dem letzten Neustart des Raspberry Pi'
        },
        {
          name: 'chromiumRunning',
          title: 'Chromium läuft',
          type: 'boolean',
          description: 'Gibt an ob der Kiosk-Browser aktuell aktiv ist'
        }
      ]
    },
    {
      name: 'setupInfo',
      title: 'Setup-Informationen',
      type: 'object',
      group: 'system',
      hidden: ({currentUser}) => !currentUser?.roles?.some(r => r.name === 'administrator'),
      fields: [
        {
          name: 'setupDate',
          title: 'Einrichtungsdatum',
          type: 'datetime',
          description: 'Datum und Uhrzeit der initialen Einrichtung dieses Geräts'
        },
        {
          name: 'setupVersion',
          title: 'Setup-Version',
          type: 'string',
          description: 'Version des verwendeten Setup-Skripts'
        },
        {
          name: 'osVersion',
          title: 'Betriebssystem-Version',
          type: 'string',
          description: 'Version des installierten Betriebssystems auf dem Raspberry Pi'
        }
      ]
    }
  ],

  // ── Preview ────────────────────────────────────────────────────────────────
  preview: {
    select: {
      kioskId: 'kioskId',
      hostname: 'hostname',
      location: 'location',
      online: 'status.online',
      lastSeen: 'status.lastSeen',
      ausstellungTitel: 'ausstellung.titel'
    },
    prepare({kioskId, hostname, location, online, lastSeen, ausstellungTitel}) {
      const status = online ? '🟢 Online' : '🔴 Offline';
      const lastSeenStr = lastSeen ? new Date(lastSeen).toLocaleString('de-DE') : 'Nie';
      const ausstellungInfo = ausstellungTitel ? ` | 🎨 ${ausstellungTitel}` : ' | ⚠️ Keine Ausstellung';

      return {
        title: `${kioskId} (${hostname})`,
        subtitle: `${location || 'Kein Standort'} – ${status}${ausstellungInfo}`,
        description: `Zuletzt gesehen: ${lastSeenStr}`
      }
    }
  }
}
