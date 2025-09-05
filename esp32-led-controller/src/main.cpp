#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <FastLED.h>

// WLAN-Konfiguration
const char* ssid = "YOUR_WIFI_SSID";  // Muss vom Museum vor Ort konfiguriert werden
const char* password = "YOUR_WIFI_PASSWORD";  // Muss vom Museum vor Ort konfiguriert werden

// MQTT-Konfiguration (HiveMQ Cloud)
const char* mqtt_server = "478ecbad737943fba16f5c7c4900d7cb.s1.eu.hivemq.cloud";
const int mqtt_port = 8883; // TLS Port
const char* mqtt_user = "museumgrueneshaus";
const char* mqtt_password = "moKqog-waqpaf-bejwi1";
const char* mqtt_topic = "museum/ledstrip/set";

// LED-Konfiguration
#define LED_PIN     5
#define NUM_LEDS    150
#define LED_TYPE    WS2812B
#define COLOR_ORDER GRB
CRGB leds[NUM_LEDS];

// WiFi und MQTT Clients
WiFiClientSecure espClient;
PubSubClient client(espClient);

// Verbindungsstatus
unsigned long lastReconnectAttempt = 0;
const unsigned long reconnectInterval = 5000; // 5 Sekunden

// Funktion zum Parsen der HEX-Farbe
CRGB parseHexColor(String hexColor) {
  // Entferne das # Symbol falls vorhanden
  if (hexColor.startsWith("#")) {
    hexColor = hexColor.substring(1);
  }
  
  // Konvertiere Hex zu RGB
  long hexValue = strtol(hexColor.c_str(), NULL, 16);
  int r = (hexValue >> 16) & 0xFF;
  int g = (hexValue >> 8) & 0xFF;
  int b = hexValue & 0xFF;
  
  return CRGB(r, g, b);
}

// MQTT Callback-Funktion
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  // Konvertiere Payload zu String
  String message = "";
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  
  Serial.print("MQTT-Nachricht empfangen: ");
  Serial.println(message);
  
  /*
   * Denkprozess für die Payload-Verarbeitung:
   * 1. Zuerst alle LEDs ausschalten (Ausgangszustand)
   * 2. Payload in ihre drei Komponenten aufteilen (start-end;hexcolor;brightness)
   * 3. Jede Komponente validieren:
   *    - Segment: Muss zwei Zahlen mit Bindestrich enthalten
   *    - Farbe: Muss gültiger Hex-Code sein
   *    - Helligkeit: Muss Zahl zwischen 0-255 sein
   * 4. Bei Fehler: Abbrechen und Fehlermeldung ausgeben
   * 5. Bei Erfolg: LEDs im Bereich setzen und anzeigen
   */
  
  // Schritt 1: Alle LEDs ausschalten
  FastLED.clear();
  FastLED.show();
  
  // Schritt 2: Payload aufteilen
  int firstSemicolon = message.indexOf(';');
  int secondSemicolon = message.indexOf(';', firstSemicolon + 1);
  
  if (firstSemicolon == -1 || secondSemicolon == -1) {
    Serial.println("Fehler: Ungültiges Nachrichtenformat");
    return;
  }
  
  String segment = message.substring(0, firstSemicolon);
  String hexColor = message.substring(firstSemicolon + 1, secondSemicolon);
  String brightnessStr = message.substring(secondSemicolon + 1);
  
  // Schritt 3: Segment parsen
  int dashIndex = segment.indexOf('-');
  if (dashIndex == -1) {
    Serial.println("Fehler: Ungültiges Segment-Format");
    return;
  }
  
  int startLed = segment.substring(0, dashIndex).toInt();
  int endLed = segment.substring(dashIndex + 1).toInt();
  
  // Validierung der LED-Indizes
  if (startLed < 0 || endLed >= NUM_LEDS || startLed > endLed) {
    Serial.println("Fehler: LED-Indizes außerhalb des gültigen Bereichs");
    return;
  }
  
  // Farbe parsen
  CRGB color = parseHexColor(hexColor);
  
  // Helligkeit parsen
  int brightness = brightnessStr.toInt();
  if (brightness < 0 || brightness > 255) {
    Serial.println("Fehler: Helligkeit außerhalb des gültigen Bereichs (0-255)");
    return;
  }
  
  // Schritt 4: LEDs setzen
  for (int i = startLed; i <= endLed; i++) {
    leds[i] = color;
  }
  
  // Schritt 5: Helligkeit einstellen und anzeigen
  FastLED.setBrightness(brightness);
  FastLED.show();
  
  Serial.print("LEDs ");
  Serial.print(startLed);
  Serial.print("-");
  Serial.print(endLed);
  Serial.print(" gesetzt auf Farbe ");
  Serial.print(hexColor);
  Serial.print(" mit Helligkeit ");
  Serial.println(brightness);
}

// WiFi-Verbindung herstellen
void setupWiFi() {
  delay(10);
  Serial.println();
  Serial.print("Verbinde mit WiFi: ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println();
  Serial.println("WiFi verbunden");
  Serial.print("IP-Adresse: ");
  Serial.println(WiFi.localIP());
}

// MQTT-Verbindung herstellen
boolean reconnectMQTT() {
  Serial.print("Verbinde mit MQTT-Broker...");
  
  // Client-ID generieren
  String clientId = "ESP32-LED-Controller-";
  clientId += String(random(0xffff), HEX);
  
  // Verbindungsversuch mit Benutzername und Passwort
  if (client.connect(clientId.c_str(), mqtt_user, mqtt_password)) {
    Serial.println(" verbunden!");
    
    // Topic abonnieren
    client.subscribe(mqtt_topic);
    Serial.print("Abonniert: ");
    Serial.println(mqtt_topic);
    
    // Bestätigung senden
    client.publish("museum/ledstrip/status", "ESP32 LED Controller online");
    
    return true;
  } else {
    Serial.print(" fehlgeschlagen, rc=");
    Serial.print(client.state());
    Serial.println(" Neuer Versuch in 5 Sekunden...");
    return false;
  }
}

void setup() {
  // Serielle Kommunikation initialisieren
  Serial.begin(115200);
  Serial.println("ESP32 LED Controller startet...");
  
  // LED-Strip initialisieren
  FastLED.addLeds<LED_TYPE, LED_PIN, COLOR_ORDER>(leds, NUM_LEDS);
  FastLED.setBrightness(50); // Standard-Helligkeit
  
  // Alle LEDs ausschalten
  FastLED.clear();
  FastLED.show();
  
  // WiFi-Verbindung herstellen
  setupWiFi();
  
  // MQTT-Client konfigurieren
  espClient.setInsecure(); // Für HiveMQ Cloud TLS ohne Zertifikatsprüfung
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(mqttCallback);
  
  // Erste MQTT-Verbindung
  reconnectMQTT();
}

void loop() {
  // MQTT-Verbindung aufrechterhalten
  if (!client.connected()) {
    unsigned long now = millis();
    if (now - lastReconnectAttempt > reconnectInterval) {
      lastReconnectAttempt = now;
      if (reconnectMQTT()) {
        lastReconnectAttempt = 0;
      }
    }
  } else {
    // MQTT-Client loop
    client.loop();
  }
  
  // Heartbeat alle 30 Sekunden
  static unsigned long lastHeartbeat = 0;
  if (millis() - lastHeartbeat > 30000) {
    lastHeartbeat = millis();
    if (client.connected()) {
      client.publish("museum/ledstrip/heartbeat", "alive");
    }
  }
}