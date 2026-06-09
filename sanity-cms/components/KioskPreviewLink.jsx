// components/KioskPreviewLink.jsx
import React from 'react'
import { useFormValue } from 'sanity'

const SITE_URL = (typeof process !== 'undefined' && process.env?.SANITY_STUDIO_SITE_URL) || 'https://museumgh.netlify.app'

export function KioskPreviewLink() {
  const kioskId = useFormValue(['kioskId'])

  if (!kioskId) {
    return React.createElement('div', {
      style: { padding: '8px 0', color: '#999', fontSize: 13 }
    }, 'Vorschau-Link erscheint sobald eine Kiosk-ID gesetzt ist.')
  }

  const url = `${SITE_URL}/kiosk/?id=${encodeURIComponent(kioskId)}`

  return React.createElement('div', { style: { padding: '6px 0' } },
    React.createElement('a', {
      href: url,
      target: '_blank',
      rel: 'noopener noreferrer',
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 16px',
        background: '#2277FF',
        color: '#fff',
        borderRadius: 6,
        fontSize: 13,
        fontWeight: 600,
        textDecoration: 'none',
      }
    }, '↗ Kiosk-Vorschau öffnen'),
    React.createElement('div', {
      style: { marginTop: 6, fontSize: 11, color: '#888', fontFamily: 'monospace' }
    }, url)
  )
}
