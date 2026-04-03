// components/QrCodeInput.jsx
// Shows a scannable QR code + URL in the Exponat "Verwaltung" tab.
// Set SANITY_STUDIO_SITE_URL in .env to your Netlify URL.

import React from 'react'
import { useFormValue } from 'sanity'

const SITE_URL = (typeof process !== 'undefined' && process.env?.SANITY_STUDIO_SITE_URL) || ''

export function QrCodeInput() {
  const rawId = useFormValue(['_id'])

  if (!rawId) {
    return React.createElement('div', {
      style: {
        padding: '12px 16px',
        background: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: 6,
        fontSize: 13,
        color: '#6b7280'
      }
    }, '💾 Dokument zuerst speichern – danach wird der QR-Code hier angezeigt.')
  }

  // Strip "drafts." prefix for unpublished documents
  const id      = rawId.replace(/^drafts\./, '')
  const pageUrl = `${SITE_URL}/exponat/${id}`
  const qrSrc   = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pageUrl)}&margin=10&color=000000&bgcolor=ffffff`

  return React.createElement('div', {
    style: { padding: '4px 0 16px' }
  },

    // Heading
    React.createElement('p', {
      style: {
        fontSize: 13,
        fontWeight: 600,
        color: '#111827',
        margin: '0 0 12px 0'
      }
    }, 'QR-Code zum Ausdrucken'),

    // QR code card
    React.createElement('div', {
      style: {
        display: 'inline-block',
        padding: 12,
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        marginBottom: 12
      }
    },
      // Clickable QR image
      React.createElement('a', {
        href: pageUrl,
        target: '_blank',
        rel: 'noreferrer',
        title: 'Seite im Browser öffnen'
      },
        React.createElement('img', {
          src: qrSrc,
          alt: 'QR-Code für dieses Exponat',
          width: 200,
          height: 200,
          style: { display: 'block' }
        })
      )
    ),

    // URL display
    React.createElement('p', {
      style: {
        fontSize: 11,
        color: '#6b7280',
        wordBreak: 'break-all',
        fontFamily: 'monospace',
        background: '#f3f4f6',
        padding: '6px 8px',
        borderRadius: 4,
        margin: '0 0 10px 0'
      }
    }, pageUrl),

    // Open page button
    React.createElement('a', {
      href: pageUrl,
      target: '_blank',
      rel: 'noreferrer',
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 12,
        color: '#ffffff',
        background: '#3b82f6',
        padding: '6px 12px',
        borderRadius: 5,
        textDecoration: 'none',
        fontWeight: 500,
        marginBottom: 12
      }
    }, '↗ Besucherseite öffnen'),

    // Tip text
    React.createElement('p', {
      style: {
        fontSize: 12,
        color: '#6b7280',
        background: '#f0fdf4',
        border: '1px solid #bbf7d0',
        borderRadius: 5,
        padding: '8px 10px',
        margin: '0'
      }
    }, '💡 Tipp: Rechtsklick auf den QR-Code → "Als Bild speichern" zum Ausdrucken'),

    // Warning if SITE_URL is not configured
    !SITE_URL && React.createElement('p', {
      style: {
        fontSize: 12,
        color: '#b91c1c',
        background: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: 5,
        padding: '8px 10px',
        margin: '10px 0 0 0'
      }
    }, '⚠️ SANITY_STUDIO_SITE_URL ist nicht gesetzt. Bitte in der .env-Datei eintragen (z.B. https://museum.netlify.app).')
  )
}
