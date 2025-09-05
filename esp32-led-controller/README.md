# ESP32 LED Controller für Museum Kiosk-System

## Übersicht
Dieser ESP32-Mikrocontroller steuert einen WS2812B LED-Strip über MQTT-Befehle. Er empfängt Nachrichten vom HiveMQ Cloud Broker und setzt die LEDs entsprechend.

## Hardware-Anforderungen
- ESP32 Development Board
- WS2812B LED-Strip (150 LEDs)
- 5V Netzteil (mind. 10A für 150 LEDs)
- Level-Shifter (3.3V → 5V) optional aber empfohlen
- Widerstände und Kondensatoren für Stabilität

## Verkabelung
```
ESP32 Pin 5  → Data-In des LED-Strips
ESP32 GND    → GND des LED-Strips
5V Netzteil  → VCC des LED-Strips
ESP32 GND    → GND des Netzteils (gemeinsame Masse)
```

## Konfiguration
Bearbeiten Sie `src/main.cpp` und passen Sie folgende Werte an:

```cpp
// WLAN-Konfiguration
const char* ssid = "IHR_WIFI_NAME";
const char* password = "IHR_WIFI_PASSWORT";

// MQTT-Konfiguration
const char* mqtt_server = "IHR_BROKER.hivemq.cloud";
const char* mqtt_user = "IHR_MQTT_BENUTZER";
const char* mqtt_password = "IHR_MQTT_PASSWORT";
```

## MQTT-Protokoll

### Topic
- Subscribe: `museum/ledstrip/set`
- Status: `museum/ledstrip/status`
- Heartbeat: `museum/ledstrip/heartbeat`

### Payload-Format
```
start-end;hexcolor;brightness
```

Beispiele:
- `10-19;#FFD700;200` - LEDs 10-19 in Gold mit Helligkeit 200
- `0-49;#FF0000;100` - LEDs 0-49 in Rot mit Helligkeit 100
- `100-149;#0000FF;255` - LEDs 100-149 in Blau mit voller Helligkeit

## Installation mit PlatformIO

1. PlatformIO installieren (VS Code Extension oder CLI)
2. Projekt öffnen
3. Konfiguration anpassen
4. Upload zum ESP32:
```bash
pio run -t upload
```

## Fehlerbehandlung
- Bei ungültiger Payload werden alle LEDs ausgeschaltet
- Automatische Reconnection bei WLAN/MQTT-Verbindungsverlust
- Heartbeat alle 30 Sekunden zur Überwachung
- Serielle Ausgabe zur Fehlerdiagnose (115200 Baud)

## Sicherheitshinweise
- Verwenden Sie ein ausreichend dimensioniertes Netzteil
- Fügen Sie einen 1000µF Kondensator am Netzteil hinzu
- Verwenden Sie einen 470Ω Widerstand zwischen ESP32 und LED-Data
- Trennen Sie niemals die Stromversorgung während eines Updates