# Netlify Deployment Setup

## 🚀 Quick Deploy

### 1. Netlify Account erstellen
- Gehen Sie zu https://app.netlify.com/signup
- Melden Sie sich mit GitHub an

### 2. Neues Projekt von GitHub
1. Klicken Sie auf **"Import from Git"**
2. Wählen Sie **GitHub**
3. Wählen Sie **museumgrueneshaus/mk2025**

### 3. Build-Einstellungen

Netlify sollte diese automatisch erkennen, aber prüfen Sie:

- **Base directory**: `museum-kiosk`
- **Build command**: `npm run build`
- **Publish directory**: `museum-kiosk/dist`
- **Node version**: `18` (wird automatisch erkannt)

### 4. Deployment

Klicken Sie auf **"Deploy"** - Das erste Deployment dauert 2-3 Minuten.

## 🔧 Konfiguration

### Domain anpassen

1. Gehen Sie zu **Site Configuration → Domain management**
2. **Option A**: Netlify Subdomain
   - Klicken Sie auf **"Change site name"**
   - Wählen Sie z.B. `museum-grunes-haus`
   - URL wird: `https://museum-grunes-haus.netlify.app`

3. **Option B**: Custom Domain
   - Klicken Sie auf **"Add custom domain"**
   - Geben Sie ein: `kiosk.museum-gruenes-haus.de`
   - Folgen Sie den DNS-Anweisungen

### Environment Variables (optional)

Falls Sie API-Keys oder andere Secrets brauchen:

1. **Site configuration → Environment variables**
2. **Add variable**:
   - Key: `VITE_API_URL`
   - Value: `https://api.example.com`

## 📱 Viewer URLs

Nach dem Deployment sind die Kiosks erreichbar unter:

- `https://[ihre-site].netlify.app/viewer/pi_01`
- `https://[ihre-site].netlify.app/viewer/pi_02`
- `https://[ihre-site].netlify.app/viewer/pi_03`
- etc.

Admin-Panel:
- `https://[ihre-site].netlify.app/admin`

## 🔄 Continuous Deployment

**Automatisches Deployment bei jedem Git Push:**

1. Jede Änderung im `main` Branch
2. Wird automatisch deployed
3. In 1-2 Minuten live

**Preview Deployments:**
- Pull Requests bekommen eigene Preview-URLs
- Format: `deploy-preview-1--[ihre-site].netlify.app`

## 📊 Features

### Analytics (kostenlos)

1. Gehen Sie zu **Analytics**
2. Sehen Sie:
   - Pageviews
   - Unique Visitors
   - Top Pages
   - Bandbreite

### Forms (optional)

Wenn Sie Kontaktformulare haben:
```html
<form name="contact" method="POST" data-netlify="true">
  <input type="text" name="name" />
  <button type="submit">Send</button>
</form>
```

### Functions (optional)

Serverless Functions in `netlify/functions/`:
```javascript
// netlify/functions/hello.js
exports.handler = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello!" })
  };
};
```

## 🛠️ Troubleshooting

### Build Failed

**Problem**: `npm run build` schlägt fehl

**Lösung**:
1. Prüfen Sie Build Logs
2. Lokal testen: 
   ```bash
   cd museum-kiosk
   npm install
   npm run build
   ```

### 404 Errors

**Problem**: Viewer-Routes zeigen 404

**Lösung**: 
- `_redirects` Datei ist bereits konfiguriert
- Sollte automatisch funktionieren

### Langsame Ladezeiten

**Lösung**:
1. Bilder optimieren (WebP statt JPG)
2. Lazy Loading aktivieren
3. CDN Cache nutzen (automatisch)

## 📈 Kosten

### Free Tier (ausreichend für Museums)
- **100 GB** Bandwidth/Monat
- **300** Build-Minuten/Monat
- **Unlimited** Sites
- **Auto SSL**

Für ein Museum mit 10 Kiosks:
- ~50 GB Traffic/Monat
- ~100 Build-Minuten
- **Kostet: 0€**

### Pro Plan (19$/Monat) - Falls benötigt
- **1 TB** Bandwidth
- **Unlimited** Build-Minuten
- **Analytics Pro**
- **Password Protection**

## 🔐 Sicherheit

### Password Protection (Pro Feature)

Für private Previews:
1. **Site configuration → Access control**
2. **Enable password protection**
3. Setzen Sie Passwort

### Headers

Bereits konfiguriert in `netlify.toml`:
- Cache-Control
- Security Headers

## 📝 Deployment Checklist

- [ ] GitHub Repository verbunden
- [ ] Build Settings korrekt
- [ ] Erster Deploy erfolgreich
- [ ] Custom Domain (optional)
- [ ] Raspberry Pis konfiguriert mit Netlify URL
- [ ] Test aller Viewer-Routes
- [ ] Analytics aktiviert

## 🎉 Fertig!

Ihre Museum Kiosk App ist jetzt live auf Netlify!

**Nächste Schritte:**
1. Raspberry Pi Images bauen
2. Kiosk-IDs vergeben (pi_01, pi_02, etc.)
3. Museum-Deployment!