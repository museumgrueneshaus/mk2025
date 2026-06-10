// components/GeraeteUebersicht.jsx
// Geräte-Dashboard: alle Kiosk-Geräte mit Live-Status (grün/rot),
// zugewiesenem Inhalt und „zuletzt gesehen". Aktualisiert sich alle 30 s.
import React, {useEffect, useState, useCallback} from 'react'
import {useClient} from 'sanity'
import {useRouter} from 'sanity/router'

const QUERY = `*[_type == "kioskDevice"] | order(kioskId asc) {
  _id, kioskId, hostname, location, modus, neu,
  "lastSeen": status.lastSeen,
  "ipAddress": status.ipAddress,
  "ausstellung": ausstellung->titel,
  "malspiel": malspiel->titel,
  websiteUrl
}`

const OFFLINE_AFTER_MS = 15 * 60 * 1000 // wie der GitHub-Monitor: 15 Minuten

function inhaltVon(d) {
  switch (d.modus) {
    case 'malspiel': return d.malspiel ? `🎨 ${d.malspiel}` : '⚠️ Kein Malspiel zugewiesen'
    case 'signage':  return '📺 Signage'
    case 'website':  return d.websiteUrl ? `🌐 ${d.websiteUrl}` : '⚠️ Keine URL'
    default:         return d.ausstellung ? `🖼 ${d.ausstellung}` : '⚠️ Keine Ausstellung zugewiesen'
  }
}

function zuletztGesehen(lastSeen) {
  if (!lastSeen) return 'noch nie'
  const diff = Date.now() - new Date(lastSeen).getTime()
  const min = Math.round(diff / 60000)
  if (min < 1) return 'gerade eben'
  if (min < 60) return `vor ${min} Min.`
  const h = Math.round(min / 60)
  if (h < 48) return `vor ${h} Std.`
  return new Date(lastSeen).toLocaleString('de-DE')
}

export function GeraeteUebersicht() {
  const client = useClient({apiVersion: '2024-01-01'})
  const router = useRouter()
  const [devices, setDevices] = useState(null)
  const [error, setError] = useState(null)

  const load = useCallback(() => {
    client.fetch(QUERY).then(setDevices).catch((e) => setError(e.message))
  }, [client])

  useEffect(() => {
    load()
    const t = setInterval(load, 30000)
    return () => clearInterval(t)
  }, [load])

  const openDoc = (id) =>
    router.navigateIntent('edit', {id: id.replace(/^drafts\./, ''), type: 'kioskDevice'})

  const wrap = {padding: '1.5rem', fontFamily: 'inherit'}
  if (error) return <div style={wrap}>⚠️ Fehler beim Laden: {error}</div>
  if (!devices) return <div style={wrap}>Lade Geräte…</div>
  if (devices.length === 0) return <div style={wrap}>Keine Geräte registriert.</div>

  const offline = devices.filter(
    (d) => !d.lastSeen || Date.now() - new Date(d.lastSeen).getTime() > OFFLINE_AFTER_MS
  ).length

  const th = {textAlign: 'left', padding: '0.5rem 0.75rem', borderBottom: '2px solid rgba(128,128,128,0.4)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.7}
  const td = {padding: '0.6rem 0.75rem', borderBottom: '1px solid rgba(128,128,128,0.2)', fontSize: '0.9rem', verticalAlign: 'top'}

  return (
    <div style={wrap}>
      <h2 style={{margin: '0 0 0.25rem'}}>Geräte-Übersicht</h2>
      <p style={{margin: '0 0 1.25rem', opacity: 0.7, fontSize: '0.9rem'}}>
        {devices.length} Gerät(e), davon{' '}
        {offline > 0 ? `🔴 ${offline} offline` : '🟢 alle online'} · aktualisiert sich automatisch ·
        Gerät anklicken zum Bearbeiten
      </p>
      <table style={{borderCollapse: 'collapse', width: '100%'}}>
        <thead>
          <tr>
            <th style={th}>Status</th>
            <th style={th}>Gerät</th>
            <th style={th}>Standort</th>
            <th style={th}>Zeigt</th>
            <th style={th}>Zuletzt gesehen</th>
            <th style={th}>IP</th>
          </tr>
        </thead>
        <tbody>
          {devices.map((d) => {
            const isOffline = !d.lastSeen || Date.now() - new Date(d.lastSeen).getTime() > OFFLINE_AFTER_MS
            return (
              <tr key={d._id} onClick={() => openDoc(d._id)} style={{cursor: 'pointer'}}>
                <td style={td}>{isOffline ? '🔴 Offline' : '🟢 Online'}</td>
                <td style={td}>
                  {d.neu ? '🆕 ' : ''}<strong>{d.kioskId}</strong>
                  <div style={{opacity: 0.6, fontSize: '0.8rem'}}>{d.hostname}</div>
                </td>
                <td style={td}>{d.location || '—'}</td>
                <td style={td}>{inhaltVon(d)}</td>
                <td style={td}>{zuletztGesehen(d.lastSeen)}</td>
                <td style={td}>{d.ipAddress || '—'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p style={{marginTop: '1rem', opacity: 0.55, fontSize: '0.8rem'}}>
        🔴 = seit über 15 Minuten kein Heartbeat. Mögliche Ursachen: Strom, WLAN, SD-Karte.
        Bei Offline-Geräten wird automatisch ein GitHub-Issue erstellt (E-Mail-Alarm).
      </p>
    </div>
  )
}
