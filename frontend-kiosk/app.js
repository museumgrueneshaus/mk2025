// Konfiguration
const API_BASE_URL = 'https://kiosk-backend-lmij.onrender.com/api'; // Render.com Backend
const MQTT_BROKER_URL = 'wss://478ecbad737943fba16f5c7c4900d7cb.s1.eu.hivemq.cloud:8884/mqtt'; // HiveMQ WebSocket URL
const MQTT_USERNAME = 'museumgrueneshaus';
const MQTT_PASSWORD = 'moKqog-waqpaf-bejwi1';

// Globale Variablen
let currentKiosk = null;
let mqttClient = null;
let currentMode = null;

/**
 * Denkprozess für die Initialisierungs-Logik:
 * 1. MAC-Adresse aus URL-Parameter extrahieren
 * 2. Kiosk-Konfiguration vom Backend abrufen
 * 3. Modus aus der Konfiguration bestimmen
 * 4. Entsprechende Player-Funktion aufrufen
 * 5. Bei Fehler: Error-Screen anzeigen
 */

// Initialisierung beim Laden der Seite
async function init() {
    try {
        // Schritt 1: MAC-Adresse aus URL lesen
        const urlParams = new URLSearchParams(window.location.search);
        const macAddress = urlParams.get('mac');
        
        if (!macAddress) {
            throw new Error('Keine MAC-Adresse in der URL gefunden');
        }
        
        console.log('MAC-Adresse:', macAddress);
        
        // Schritt 2: Kiosk-Konfiguration abrufen
        const response = await fetch(`${API_BASE_URL}/kiosks?filters[macAdresse][$eq]=${macAddress}&populate=*`);
        
        if (!response.ok) {
            throw new Error('Fehler beim Abrufen der Kiosk-Konfiguration');
        }
        
        const data = await response.json();
        
        if (!data.data || data.data.length === 0) {
            throw new Error('Kein Kiosk mit dieser MAC-Adresse gefunden');
        }
        
        currentKiosk = data.data[0];
        console.log('Kiosk-Konfiguration:', currentKiosk);
        
        // Schritt 3: Modus bestimmen
        currentMode = currentKiosk.modus;
        console.log('Modus:', currentMode);
        
        // Loading-Screen ausblenden
        hideAllContainers();
        
        // Schritt 4: Entsprechenden Modus starten
        switch (currentMode) {
            case 'Explorer':
                await startExplorer(currentKiosk);
                break;
            case 'Slideshow':
                await startSlideshow(currentKiosk);
                break;
            case 'Website':
                await startWebsite(currentKiosk);
                break;
            case 'VideoPlayer':
                await startVideoPlayer(currentKiosk);
                break;
            case 'Buch':
                await startBuch(currentKiosk);
                break;
            default:
                throw new Error(`Unbekannter Modus: ${currentMode}`);
        }
        
    } catch (error) {
        console.error('Initialisierungsfehler:', error);
        showError(error.message);
    }
}

// Hilfsfunktion: Alle Container ausblenden
function hideAllContainers() {
    document.querySelectorAll('.container').forEach(container => {
        container.classList.remove('active');
    });
}

// Hilfsfunktion: Container anzeigen
function showContainer(containerId) {
    hideAllContainers();
    document.getElementById(containerId).classList.add('active');
}

// Error-Anzeige
function showError(message) {
    document.getElementById('error-text').textContent = message;
    showContainer('error');
}

// MQTT-Verbindung herstellen (nur für Explorer-Modus)
async function connectMQTT() {
    return new Promise((resolve, reject) => {
        mqttClient = mqtt.connect(MQTT_BROKER_URL, {
            username: MQTT_USERNAME,
            password: MQTT_PASSWORD,
            clientId: 'kiosk-' + Math.random().toString(16).substr(2, 8)
        });
        
        mqttClient.on('connect', () => {
            console.log('MQTT verbunden');
            resolve();
        });
        
        mqttClient.on('error', (error) => {
            console.error('MQTT-Fehler:', error);
            reject(error);
        });
    });
}

// Explorer-Modus
async function startExplorer(kiosk) {
    showContainer('explorer');
    
    // MQTT-Verbindung herstellen
    try {
        await connectMQTT();
    } catch (error) {
        console.error('MQTT-Verbindung fehlgeschlagen:', error);
    }
    
    // Konfiguration extrahieren
    const config = kiosk.zugeordneteInhalte.find(item => 
        item.__component === 'kiosk.explorer-konfiguration'
    );
    
    if (!config) {
        showError('Explorer-Konfiguration nicht gefunden');
        return;
    }
    
    // Titel setzen
    if (config.titel) {
        document.getElementById('explorer-title').textContent = config.titel;
    }
    
    // Exponate laden
    const exponate = config.exponate || [];
    const listContainer = document.getElementById('explorer-list');
    const detailContainer = document.getElementById('explorer-detail');
    
    // Liste aufbauen
    exponate.forEach((exponat, index) => {
        const item = document.createElement('div');
        item.className = 'explorer-item';
        item.innerHTML = `
            <h3>${exponat.titel}</h3>
            <p>${exponat.jahresangabe}</p>
        `;
        
        item.addEventListener('click', () => {
            // Aktives Element markieren
            document.querySelectorAll('.explorer-item').forEach(el => 
                el.classList.remove('active')
            );
            item.classList.add('active');
            
            // Detail anzeigen
            showExponatDetail(exponat);
            
            // MQTT-Nachricht senden für LED-Steuerung
            if (exponat.ledSegment && mqttClient && mqttClient.connected) {
                sendLEDCommand(exponat.ledSegment);
            }
        });
        
        listContainer.appendChild(item);
    });
}

// Exponat-Detail anzeigen
function showExponatDetail(exponat) {
    const detailContainer = document.getElementById('explorer-detail');
    
    let mediaHTML = '';
    
    // Bilder
    if (exponat.bilder && exponat.bilder.length > 0) {
        exponat.bilder.forEach(bild => {
            const imageUrl = bild.url.startsWith('http') ? bild.url : `${API_BASE_URL.replace('/api', '')}${bild.url}`;
            mediaHTML += `<img src="${imageUrl}" alt="${exponat.titel}">`;
        });
    }
    
    // Video
    if (exponat.video) {
        const videoUrl = exponat.video.url.startsWith('http') ? exponat.video.url : `${API_BASE_URL.replace('/api', '')}${exponat.video.url}`;
        mediaHTML += `
            <video controls>
                <source src="${videoUrl}" type="video/mp4">
            </video>
        `;
    }
    
    // Audio
    if (exponat.audio) {
        const audioUrl = exponat.audio.url.startsWith('http') ? exponat.audio.url : `${API_BASE_URL.replace('/api', '')}${exponat.audio.url}`;
        mediaHTML += `
            <audio controls>
                <source src="${audioUrl}" type="audio/mpeg">
            </audio>
        `;
    }
    
    detailContainer.innerHTML = `
        <div class="detail-content">
            <h2>${exponat.titel}</h2>
            <p class="year">${exponat.jahresangabe}</p>
            <div class="description">${exponat.beschreibung || ''}</div>
            <div class="detail-media">${mediaHTML}</div>
        </div>
    `;
}

// LED-Befehl senden
async function sendLEDCommand(ledSegment) {
    try {
        // Globale Konfiguration abrufen
        const response = await fetch(`${API_BASE_URL}/konfiguration`);
        const configData = await response.json();
        const config = configData.data;
        
        const payload = `${ledSegment};${config.farbeDerLedsHex};${config.helligkeitDerLeds_0_255}`;
        
        mqttClient.publish('museum/ledstrip/set', payload);
        console.log('LED-Befehl gesendet:', payload);
    } catch (error) {
        console.error('Fehler beim Senden des LED-Befehls:', error);
    }
}

// Slideshow-Modus
async function startSlideshow(kiosk) {
    showContainer('slideshow');
    
    const config = kiosk.zugeordneteInhalte.find(item => 
        item.__component === 'kiosk.slideshow-konfiguration'
    );
    
    if (!config || !config.bilder || config.bilder.length === 0) {
        showError('Keine Bilder für Slideshow gefunden');
        return;
    }
    
    const images = config.bilder;
    const duration = (config.anzeigedauerProBildSekunden || 5) * 1000;
    let currentIndex = 0;
    
    const imageElement = document.getElementById('slideshow-image');
    
    function showNextImage() {
        const image = images[currentIndex];
        const imageUrl = image.url.startsWith('http') ? image.url : `${API_BASE_URL.replace('/api', '')}${image.url}`;
        imageElement.src = imageUrl;
        
        currentIndex = (currentIndex + 1) % images.length;
    }
    
    // Erste Bild anzeigen
    showNextImage();
    
    // Slideshow starten
    setInterval(showNextImage, duration);
}

// Website-Modus
async function startWebsite(kiosk) {
    showContainer('website');
    
    const config = kiosk.zugeordneteInhalte.find(item => 
        item.__component === 'kiosk.website-konfiguration'
    );
    
    if (!config || !config.url) {
        showError('Keine Website-URL konfiguriert');
        return;
    }
    
    const iframe = document.getElementById('website-iframe');
    iframe.src = config.url;
}

// VideoPlayer-Modus
async function startVideoPlayer(kiosk) {
    showContainer('videoplayer');
    
    const config = kiosk.zugeordneteInhalte.find(item => 
        item.__component === 'kiosk.videoplayer-konfiguration'
    );
    
    if (!config || !config.video) {
        showError('Kein Video konfiguriert');
        return;
    }
    
    const videoElement = document.getElementById('video-element');
    const videoUrl = config.video.url.startsWith('http') ? config.video.url : `${API_BASE_URL.replace('/api', '')}${config.video.url}`;
    
    videoElement.src = videoUrl;
    
    if (config.autoplay) {
        videoElement.autoplay = true;
        videoElement.muted = true; // Muted für Autoplay erforderlich
        videoElement.loop = true;
    }
}

// Buch-Modus
async function startBuch(kiosk) {
    showContainer('buch');
    
    const config = kiosk.zugeordneteInhalte.find(item => 
        item.__component === 'kiosk.buch-konfiguration'
    );
    
    if (!config || !config.seiten || config.seiten.length === 0) {
        showError('Keine Seiten für Buch gefunden');
        return;
    }
    
    const pages = config.seiten;
    let currentPage = 0;
    
    const pageElement = document.getElementById('buch-page');
    const thumbnailsContainer = document.getElementById('buch-thumbnails');
    const prevButton = document.getElementById('buch-prev');
    const nextButton = document.getElementById('buch-next');
    
    // Thumbnails erstellen
    pages.forEach((page, index) => {
        const thumb = document.createElement('img');
        thumb.className = 'buch-thumbnail';
        const thumbUrl = page.url.startsWith('http') ? page.url : `${API_BASE_URL.replace('/api', '')}${page.url}`;
        thumb.src = thumbUrl;
        
        thumb.addEventListener('click', () => {
            currentPage = index;
            showPage();
        });
        
        thumbnailsContainer.appendChild(thumb);
    });
    
    function showPage() {
        const page = pages[currentPage];
        const pageUrl = page.url.startsWith('http') ? page.url : `${API_BASE_URL.replace('/api', '')}${page.url}`;
        pageElement.src = pageUrl;
        
        // Thumbnail aktiv markieren
        document.querySelectorAll('.buch-thumbnail').forEach((thumb, index) => {
            thumb.classList.toggle('active', index === currentPage);
        });
        
        // Navigation-Buttons aktivieren/deaktivieren
        prevButton.disabled = currentPage === 0;
        nextButton.disabled = currentPage === pages.length - 1;
    }
    
    // Navigation
    prevButton.addEventListener('click', () => {
        if (currentPage > 0) {
            currentPage--;
            showPage();
        }
    });
    
    nextButton.addEventListener('click', () => {
        if (currentPage < pages.length - 1) {
            currentPage++;
            showPage();
        }
    });
    
    // Erste Seite anzeigen
    showPage();
}

// Starte die App beim Laden
document.addEventListener('DOMContentLoaded', init);