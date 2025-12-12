// Sanity Schema für Kiosk Devices
// Speichere das in: museum-sanity-backend/schemas/kioskDevice.js

export default {
  name: 'kioskDevice',
  title: 'Kiosk Device',
  type: 'document',
  icon: () => '📺',
  fields: [
    {
      name: 'kioskId',
      title: 'Kiosk ID',
      type: 'string',
      description: 'z.B. RPI_01, RPI_02',
      validation: Rule => Rule.required()
    },
    {
      name: 'hostname',
      title: 'Hostname',
      type: 'string',
      description: 'z.B. rpi01',
      validation: Rule => Rule.required()
    },
    {
      name: 'macAddress',
      title: 'MAC Adresse',
      type: 'string',
      description: 'Letzte 6 Zeichen der MAC'
    },
    {
      name: 'location',
      title: 'Standort',
      type: 'string',
      description: 'z.B. Museum Reutte - Hauptausstellung'
    },
    {
      name: 'ausstellung',
      title: '🎨 Aktive Ausstellung',
      type: 'reference',
      to: [{type: 'ausstellung'}],
      description: 'Welche Ausstellung soll auf diesem Kiosk angezeigt werden?',
      validation: Rule => Rule.required()
    },
    {
      name: 'kioskUrl',
      title: 'Kiosk URL (Optional)',
      type: 'url',
      description: 'Überschreibt die automatische URL basierend auf Ausstellung. Normalerweise leer lassen.',
      initialValue: undefined
    },
    {
      name: 'wlanNetworks',
      title: 'WLAN Netzwerke',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'ssid',
              title: 'SSID',
              type: 'string',
              validation: Rule => Rule.required()
            },
            {
              name: 'password',
              title: 'Passwort',
              type: 'string',
              validation: Rule => Rule.required()
            },
            {
              name: 'priority',
              title: 'Priorität',
              type: 'number',
              description: 'Höhere Zahl = bevorzugt',
              initialValue: 10
            },
            {
              name: 'description',
              title: 'Beschreibung',
              type: 'string',
              description: 'z.B. museum, home, hotspot'
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
                subtitle: `Priorität: ${priority} - ${description || ''}`
              }
            }
          }
        }
      ]
    },
    {
      name: 'status',
      title: 'Status',
      type: 'object',
      fields: [
        {
          name: 'online',
          title: 'Online',
          type: 'boolean',
          initialValue: false
        },
        {
          name: 'lastSeen',
          title: 'Zuletzt gesehen',
          type: 'datetime'
        },
        {
          name: 'ipAddress',
          title: 'IP Adresse',
          type: 'string'
        },
        {
          name: 'uptimeSeconds',
          title: 'Uptime (Sekunden)',
          type: 'number'
        },
        {
          name: 'chromiumRunning',
          title: 'Chromium läuft',
          type: 'boolean'
        }
      ]
    },
    {
      name: 'setupInfo',
      title: 'Setup Info',
      type: 'object',
      fields: [
        {
          name: 'setupDate',
          title: 'Setup Datum',
          type: 'datetime'
        },
        {
          name: 'setupVersion',
          title: 'Setup Version',
          type: 'string'
        },
        {
          name: 'osVersion',
          title: 'OS Version',
          type: 'string'
        }
      ]
    },
    {
      name: 'notes',
      title: 'Notizen',
      type: 'text',
      description: 'Interne Notizen zum Device'
    }
  ],
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
        subtitle: `${location || 'Kein Standort'} - ${status}${ausstellungInfo}`,
        description: `Zuletzt: ${lastSeenStr}`
      }
    }
  }
}
