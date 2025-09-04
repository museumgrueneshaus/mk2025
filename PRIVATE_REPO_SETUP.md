# 🔒 Private Repository Setup

## Schritt 1: GitHub Personal Access Token erstellen

1. Gehe zu: https://github.com/settings/tokens/new
2. Konfiguration:
   - **Note:** Museum Kiosk Deployment
   - **Expiration:** 90 days (oder "No expiration")
   - **Scopes:** 
     - ✅ repo (Full control of private repositories)
     - ✅ workflow (optional)
3. **Generate token**
4. **WICHTIG:** Token kopieren (wird nur einmal angezeigt!)

## Schritt 2: Code zu privaten Repositories pushen

Mit dem Personal Access Token:

```bash
# Backend pushen
cd /Users/marcelgladbach/mk2025/kiosk-backend
git remote set-url origin https://[YOUR_TOKEN]@github.com/museumgrueneshaus/kiosk-backend.git
git push -u origin main --force

# Frontend pushen  
cd /Users/marcelgladbach/mk2025/frontend-kiosk
git remote set-url origin https://[YOUR_TOKEN]@github.com/museumgrueneshaus/kiosk-frontend.git
git push -u origin main --force
```

## Schritt 3: Render.com mit privatem Repo verbinden

### Option A: GitHub App (Empfohlen)
1. Dashboard → **New +** → **Web Service**
2. **Configure GitHub App**
3. Installiere Render GitHub App
4. Gewähre Zugriff auf `museumgrueneshaus` Organisation
5. Wähle Repositories:
   - ✅ kiosk-backend
   - ✅ kiosk-frontend

### Option B: Deploy Hook
1. Erstelle Service manuell
2. Verwende Git URL mit Token:
   ```
   https://[TOKEN]@github.com/museumgrueneshaus/kiosk-backend.git
   ```

## Schritt 4: Netlify mit privatem Repo verbinden

### Option A: GitHub OAuth (Empfohlen)
1. **Add new site** → **Import an existing project**
2. **GitHub** → Authorize Netlify
3. Gewähre Zugriff auf die Organisation
4. Wähle `kiosk-frontend` Repository

### Option B: Deploy Key
1. Repository Settings → Deploy keys
2. Add deploy key (Netlify generiert einen)
3. Verwende SSH URL in Netlify

## Alternative: GitHub Actions für Deployment

Erstelle `.github/workflows/deploy.yml` in beiden Repos:

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Render
        env:
          RENDER_API_KEY: ${{ secrets.RENDER_API_KEY }}
        run: |
          curl -X POST https://api.render.com/v1/services/[SERVICE_ID]/deploys \
            -H "Authorization: Bearer $RENDER_API_KEY"

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Netlify
        uses: netlify/actions/cli@master
        with:
          args: deploy --prod
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## Sicherheitshinweise

- ⚠️ Niemals Tokens in Code committen
- ⚠️ Token regelmäßig rotieren
- ⚠️ Minimale Berechtigungen vergeben
- ✅ Verwende GitHub Secrets für CI/CD
- ✅ Verwende Deploy Keys wo möglich