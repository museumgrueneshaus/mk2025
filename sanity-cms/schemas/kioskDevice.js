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
      name: 'befehl',
      title: 'Befehl an das Gerät',
      type: 'string',
      group: 'geraet',
      options: {
        list: [
          { title: '🔄 Gerät neustarten (kompletter Neustart)', value: 'neustarten' },
          { title: '🌐 Browser neu starten', value: 'chromium-neustarten' },
          { title: '⬇️ Software-Update sofort holen', value: 'update-erzwingen' }
        ],
        layout: 'dropdown'
      },
      description: 'Wird innerhalb von 5 Minuten vom Gerät ausgeführt und danach automatisch zurückgesetzt. Feld einfach leer lassen, wenn nichts zu tun ist.'
    },
    {
      name: 'neu',
      title: '🆕 Neu — noch nicht eingerichtet',
      type: 'boolean',
      group: 'geraet',
      initialValue: false,
      description: 'Dieses Gerät hat sich selbst registriert. Bitte Anzeigemodus + Ausstellung/Malspiel zuweisen und diesen Haken dann entfernen.'
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
      title: 'Was zeigt dieses Gerät?',
      type: 'string',
      group: 'ausstellung',
      options: {
        list: [
          {title: '🖼 Ausstellung (Darstellung kommt aus der Ausstellung)', value: 'ausstellung'},
          {title: '🎨 Malspiel', value: 'malspiel'},
          {title: '📺 Signage (Eingangsbereich / Übersicht)', value: 'signage'},
          {title: '🌐 Website (externe Webseite)', value: 'website'},
        ],
        layout: 'radio'
      },
      initialValue: 'ausstellung',
      description: 'Ein Gerät zeigt genau ein Ding. Je nach Auswahl erscheint darunter das passende Feld.'
    },
    {
      name: 'ausstellung',
      title: 'Aktive Ausstellung',
      type: 'reference',
      group: 'ausstellung',
      to: [{type: 'ausstellung'}],
      hidden: ({parent}) => parent?.modus !== 'ausstellung' && parent?.modus != null,
      description: 'Die Ausstellung, die auf diesem Kiosk angezeigt wird. Wie sie dargestellt wird (Video, Slideshow, Explorer, Reader), legt die Ausstellung selbst fest (Tab „Kiosk-Darstellung").',
      validation: Rule => Rule.custom((val, ctx) => {
        const m = ctx.parent?.modus || 'ausstellung'
        if (m === 'ausstellung' && !val) return 'Bitte eine Ausstellung auswählen.'
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
      name: 'websiteUrl',
      title: 'Website-Adresse',
      type: 'url',
      group: 'ausstellung',
      hidden: ({parent}) => parent?.modus !== 'website',
      description: 'Die Webseite, die dieses Gerät im Vollbild anzeigt (z.B. https://museum-gruenes-haus.at).',
      validation: Rule => Rule.custom((val, ctx) => {
        if (ctx.parent?.modus === 'website' && !val) return 'Bitte eine Website-Adresse eintragen.'
        return true
      })
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
      modus: 'modus',
      ausstellungTitel: 'ausstellung.titel',
      malspielTitel: 'malspiel.titel',
      websiteUrl: 'websiteUrl',
      neu: 'neu'
    },
    prepare({kioskId, hostname, location, online, lastSeen, modus, ausstellungTitel, malspielTitel, websiteUrl, neu}) {
      const status = online ? '🟢 Online' : '🔴 Offline';
      const lastSeenStr = lastSeen ? new Date(lastSeen).toLocaleString('de-DE') : 'Nie';

      let inhalt;
      switch (modus) {
        case 'malspiel': inhalt = malspielTitel ? `🎨 ${malspielTitel}` : '⚠️ Kein Malspiel'; break;
        case 'signage':  inhalt = '📺 Signage'; break;
        case 'website':  inhalt = websiteUrl ? `🌐 ${websiteUrl}` : '⚠️ Keine URL'; break;
        default:         inhalt = ausstellungTitel ? `🖼 ${ausstellungTitel}` : '⚠️ Keine Ausstellung';
      }
      const neuPrefix = neu ? '🆕 ' : '';

      return {
        title: `${neuPrefix}${kioskId} (${hostname})`,
        subtitle: `${location || 'Kein Standort'} – ${status} | ${inhalt}`,
        description: `Zuletzt gesehen: ${lastSeenStr}`
      }
    }
  }
}
