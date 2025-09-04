# 🔧 RENDER.COM ENVIRONMENT VARIABLES - KRITISCH!

## ⚠️ SOFORT EINTRAGEN in Render.com Dashboard

### Gehen Sie zu: https://dashboard.render.com
### Service: kiosk-backend-lmij → Environment

## ERFORDERLICHE ENVIRONMENT VARIABLES:

### 1. APP_KEYS (KRITISCH - Ohne diese startet Strapi nicht!)
```
Key: APP_KEYS
Value: _4Q_2hA5_Zg8nLpB3jHcR7tY,sWbVdGfHjMnPrStVwYyZq4t7,xK9mN3pQ5rT7vB1dF3gH5jL7,aS2dF4gH6jK8lQ0wE3rT5yU7
```

### 2. Weitere Security Keys (Alle ERFORDERLICH):
```
Key: API_TOKEN_SALT
Value: x9K2mN4pQ6rT8vB0dF2gH4jL6

Key: ADMIN_JWT_SECRET  
Value: aS3dF5gH7jK9lQ1wE4rT6yU8iO0p

Key: TRANSFER_TOKEN_SALT
Value: zX2cV4bN6mQ8wE0rT2yU4iO6pL8

Key: JWT_SECRET
Value: qW3eR5tY7uI9oP0sD2fG4hJ6kL8

Key: ENCRYPTION_KEY
Value: mN4bV6cX8zL0kJ2hG4fD6sA8qW0e
```

### 3. Cloudinary (Bereits gesetzt, prüfen Sie ob vorhanden):
```
Key: CLOUDINARY_NAME
Value: dtx5nuban

Key: CLOUDINARY_KEY
Value: 484387353599576

Key: CLOUDINARY_SECRET
Value: y3xRJMDNYLnKIeIE0le0jCDClw_CFU
```

### 4. Database & Node Settings:
```
Key: NODE_ENV
Value: production

Key: DATABASE_CLIENT
Value: postgres

Key: DATABASE_SSL
Value: true

Key: DATABASE_SSL_REJECT_UNAUTHORIZED
Value: false
```

## 📝 ANLEITUNG:

1. **Login** bei Render.com
2. **Service öffnen:** kiosk-backend-lmij
3. **Environment** im linken Menü
4. **Add Environment Variable** für jede Variable oben
5. **Save Changes** klicken
6. Service wird automatisch neu deployen (~5 Minuten)

## ✅ NACH DEM SPEICHERN:

Der Service startet automatisch neu. Nach ~5 Minuten sollte das Backend unter:
- API: https://kiosk-backend-lmij.onrender.com/api
- Admin: https://kiosk-backend-lmij.onrender.com/admin

erfolgreich erreichbar sein.

## 🚨 WICHTIG:

Die APP_KEYS MÜSSEN EXAKT so eingegeben werden, wie oben angegeben (mit Kommas getrennt, OHNE Anführungszeichen in Render!).

---

**Hotfix deployed:** Der Code wurde korrigiert und gepusht.
**Ihre Aktion erforderlich:** Environment Variables in Render eintragen!