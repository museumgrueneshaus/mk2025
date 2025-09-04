// Admin Portal JavaScript
const API_URL = 'http://localhost:1337/api';

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Admin Portal geladen');
    loadDashboard();
    setupEventListeners();
});

// Dashboard laden
async function loadDashboard() {
    try {
        // Stats laden
        const exponateRes = await fetch(`${API_URL}/exponate`);
        const playlistsRes = await fetch(`${API_URL}/playlists`);
        
        if (exponateRes.ok) {
            const exponateData = await exponateRes.json();
            document.getElementById('stat-exponate').textContent = exponateData.data?.length || 0;
            
            // Highlights zählen - Strapi v5 hat keine attributes mehr
            const highlights = exponateData.data?.filter(e => e.ist_highlight).length || 0;
            document.getElementById('stat-highlights').textContent = highlights;
        } else {
            console.error('Fehler beim Laden der Exponate:', exponateRes.status);
            document.getElementById('stat-exponate').textContent = '?';
            document.getElementById('stat-highlights').textContent = '?';
        }
        
        if (playlistsRes.ok) {
            const playlistsData = await playlistsRes.json();
            document.getElementById('stat-playlists').textContent = playlistsData.data?.length || 0;
        } else {
            console.error('Fehler beim Laden der Playlists:', playlistsRes.status);
            document.getElementById('stat-playlists').textContent = '?';
        }
        
        // Aktivitätslog aktualisieren
        addActivity('Dashboard geladen', 'success');
        
    } catch (error) {
        console.error('Fehler beim Laden:', error);
        addActivity('Fehler beim Laden der Daten: ' + error.message, 'error');
        // Zeige Fehler in Stats
        document.getElementById('stat-exponate').textContent = '?';
        document.getElementById('stat-highlights').textContent = '?';
        document.getElementById('stat-playlists').textContent = '?';
    }
}

// Event Listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.currentTarget.getAttribute('onclick').match(/showSection\('(.+)'\)/)[1];
            showSection(section);
        });
    });
    
    // Drag & Drop für Import
    const dropZone = document.getElementById('drop-zone');
    if (dropZone) {
        dropZone.addEventListener('click', () => {
            document.getElementById('file-input').click();
        });
        
        dropZone.addEventListener('dragover', handleDragOver);
        dropZone.addEventListener('dragleave', handleDragLeave);
        dropZone.addEventListener('drop', handleDrop);
    }
    
    // File Input
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }
    
    // Exponat Form
    const exponatForm = document.getElementById('exponat-form');
    if (exponatForm) {
        exponatForm.addEventListener('submit', handleExponatSubmit);
    }
    
    // Bilder Input
    const bilderInput = document.getElementById('bilder-input');
    if (bilderInput) {
        bilderInput.addEventListener('change', handleBilderSelect);
    }
}

// Section Navigation
function showSection(sectionName) {
    // Alle Sections verstecken
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Gewählte Section zeigen
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }
    
    // Nav Buttons updaten
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('bg-blue-100', 'text-blue-900');
    });
    event.target.classList.add('bg-blue-100', 'text-blue-900');
    
    // Section-spezifische Aktionen
    if (sectionName === 'exponate') {
        loadExponate();
    } else if (sectionName === 'playlists') {
        loadPlaylists();
    }
}

// Exponate laden
async function loadExponate() {
    try {
        const response = await fetch(`${API_URL}/exponate?populate=*`);
        if (response.ok) {
            const data = await response.json();
            // Füge Beispielbilder hinzu falls keine vorhanden
            const exponateWithImages = (data.data || []).map((exp, index) => {
                if (!exp.hauptbild) {
                    const imageUrls = [
                        'https://images.unsplash.com/photo-1575444758702-4a6b9222336e?w=400',
                        'https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=400',
                        'https://images.unsplash.com/photo-1565711561500-49678a10a63f?w=400',
                        'https://images.unsplash.com/photo-1609102026400-3c0ca378e4c5?w=400',
                        'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
                        'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400',
                        'https://images.unsplash.com/photo-1612690669207-fed642192c40?w=400',
                        'https://images.unsplash.com/photo-1599582893720-79e5b1ee5117?w=400'
                    ];
                    exp.hauptbild = { url: imageUrls[index % imageUrls.length] };
                }
                return exp;
            });
            displayExponate(exponateWithImages);
            addActivity(`${exponateWithImages.length} Exponate geladen`, 'success');
        } else {
            console.error('API Fehler:', response.status, response.statusText);
            const grid = document.getElementById('exponate-grid');
            if (grid) {
                grid.innerHTML = `
                    <div class="col-span-full text-center py-8">
                        <div class="text-red-600 mb-4">
                            <i class="ri-error-warning-line text-4xl"></i>
                        </div>
                        <p class="text-gray-700 mb-2">Fehler beim Laden der Exponate</p>
                        <p class="text-gray-500 text-sm mb-4">Status: ${response.status}</p>
                        <button onclick="loadExponate()" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                            Erneut versuchen
                        </button>
                    </div>
                `;
            }
            showToast(`Fehler: ${response.status} ${response.statusText}`, 'error');
        }
    } catch (error) {
        console.error('Fehler beim Laden der Exponate:', error);
        const grid = document.getElementById('exponate-grid');
        if (grid) {
            grid.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <div class="text-red-600 mb-4">
                        <i class="ri-error-warning-line text-4xl"></i>
                    </div>
                    <p class="text-gray-700 mb-2">Verbindungsfehler</p>
                    <p class="text-gray-500 text-sm mb-4">${error.message}</p>
                    <button onclick="loadExponate()" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Erneut versuchen
                    </button>
                </div>
            `;
        }
        showToast('Fehler beim Laden der Exponate: ' + error.message, 'error');
    }
}

// Exponate anzeigen
function displayExponate(exponate) {
    const grid = document.getElementById('exponate-grid');
    if (!grid) return;
    
    if (exponate.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center py-8 text-gray-500">Noch keine Exponate vorhanden</div>';
        return;
    }
    
    grid.innerHTML = exponate.map(exponat => {
        // In Strapi v5 sind die Daten direkt im Objekt, nicht unter attributes
        const hauptbildUrl = exponat.hauptbild?.data?.attributes?.url || exponat.hauptbild?.url;
        
        return `
            <div class="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow">
                <div class="aspect-w-16 aspect-h-12 bg-gray-200 relative">
                    ${hauptbildUrl ? 
                        `<img src="${hauptbildUrl.startsWith('http') ? hauptbildUrl : 'http://localhost:1337' + hauptbildUrl}" alt="${exponat.titel || ''}" class="w-full h-48 object-cover">` :
                        `<div class="w-full h-48 flex items-center justify-center text-gray-400">
                            <i class="ri-image-line text-4xl"></i>
                        </div>`
                    }
                    ${exponat.ist_highlight ? '<span class="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xs font-semibold">Highlight</span>' : ''}
                </div>
                <div class="p-4">
                    <h3 class="font-semibold text-lg mb-1">${exponat.titel || 'Ohne Titel'}</h3>
                    <p class="text-sm text-gray-600 mb-2">${exponat.kurzbeschreibung || ''}</p>
                    <div class="flex justify-between items-center text-xs text-gray-500">
                        <span>${exponat.inventarnummer || ''}</span>
                        <button onclick="editExponat(${exponat.id})" class="text-blue-600 hover:text-blue-800">
                            <i class="ri-edit-line"></i> Bearbeiten
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Playlists laden
async function loadPlaylists() {
    try {
        const response = await fetch(`${API_URL}/playlists?populate=*`);
        if (response.ok) {
            const data = await response.json();
            displayPlaylists(data.data || []);
        }
    } catch (error) {
        console.error('Fehler beim Laden der Playlists:', error);
        showToast('Fehler beim Laden der Playlists', 'error');
    }
}

// Playlists anzeigen
function displayPlaylists(playlists) {
    const grid = document.getElementById('playlists-grid');
    if (!grid) return;
    
    if (playlists.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center py-8 text-gray-500">Noch keine Playlists vorhanden</div>';
        return;
    }
    
    grid.innerHTML = playlists.map(playlist => {
        // In Strapi v5 sind die Daten direkt im Objekt
        const exponateCount = playlist.exponate?.data?.length || playlist.exponate?.length || 0;
        
        return `
            <div class="bg-white rounded-lg shadow-lg p-6">
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-xl font-semibold">${playlist.name || 'Ohne Name'}</h3>
                    <span class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        ${exponateCount} Exponate
                    </span>
                </div>
                <p class="text-gray-600 mb-4">${playlist.beschreibung || 'Keine Beschreibung'}</p>
                <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-500">
                        Typ: ${playlist.type || 'manual'}
                    </span>
                    <button onclick="editPlaylist(${playlist.id})" class="text-blue-600 hover:text-blue-800">
                        <i class="ri-edit-line"></i> Bearbeiten
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Quick Actions
function quickAddExponat() {
    openExponatModal();
}

function quickImport() {
    showSection('import');
}

function quickPlaylist() {
    openPlaylistModal();
}

function quickPreview() {
    window.open('http://localhost:8081', '_blank');
}

// Modals
function openExponatModal(exponatId = null) {
    document.getElementById('exponat-modal').classList.remove('hidden');
    if (exponatId) {
        // Lade Exponat-Daten zum Bearbeiten
        loadExponatForEdit(exponatId);
    }
}

function closeExponatModal() {
    document.getElementById('exponat-modal').classList.add('hidden');
    document.getElementById('exponat-form').reset();
}

function openPlaylistModal(playlistId = null) {
    const modal = document.getElementById('playlist-modal');
    if (modal) {
        modal.classList.remove('hidden');
    } else {
        // Modal existiert noch nicht, erstelle es
        showToast('Playlist-Modal noch nicht implementiert', 'info');
    }
}

// Exponat Form Submit
async function handleExponatSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const exponatData = {
        titel: formData.get('titel'),
        kurzbeschreibung: formData.get('kurzbeschreibung'),
        inventarnummer: formData.get('inventarnummer'),
        epoche: formData.get('epoche'),
        ist_highlight: formData.get('ist_highlight') === 'on'
    };
    
    console.log('Sending data:', { data: exponatData });
    
    try {
        const response = await fetch(`${API_URL}/exponate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data: exponatData })
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('Created exponat:', result);
            showToast('Exponat erfolgreich erstellt!', 'success');
            closeExponatModal();
            loadExponate();
            loadDashboard();
        } else {
            const errorText = await response.text();
            console.error('Server error:', response.status, errorText);
            throw new Error(`Fehler ${response.status}: ${errorText}`);
        }
    } catch (error) {
        console.error('Fehler:', error);
        showToast('Fehler beim Speichern: ' + error.message, 'error');
    }
}

// File Handling
function handleFileSelect(event) {
    const files = event.target.files;
    if (files.length > 0) {
        processFiles(files);
    }
}

function handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('drag-over');
}

function handleDragLeave(event) {
    event.currentTarget.classList.remove('drag-over');
}

function handleDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        processFiles(files);
    }
}

function processFiles(files) {
    const file = files[0];
    const fileType = file.name.split('.').pop().toLowerCase();
    
    document.getElementById('import-progress').classList.remove('hidden');
    
    // Simuliere Import-Prozess
    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        document.getElementById('progress-bar').style.width = progress + '%';
        document.getElementById('progress-text').textContent = Math.floor(progress);
        
        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                document.getElementById('import-progress').classList.add('hidden');
                document.getElementById('import-results').classList.remove('hidden');
                document.getElementById('import-success').textContent = '10';
                document.getElementById('import-skipped').textContent = '2';
                document.getElementById('import-failed').textContent = '0';
            }, 500);
        }
    }, 200);
}

// Bilder Preview
function handleBilderSelect(event) {
    const files = event.target.files;
    const preview = document.getElementById('bilder-preview');
    if (!preview) return;
    
    preview.innerHTML = '';
    
    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('div');
                img.className = 'relative';
                img.innerHTML = `
                    <img src="${e.target.result}" class="w-20 h-20 object-cover rounded">
                    <button type="button" onclick="this.parentElement.remove()" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        <i class="ri-close-line"></i>
                    </button>
                `;
                preview.appendChild(img);
            };
            reader.readAsDataURL(file);
        }
    });
}

// Activity Log
function addActivity(message, type = 'info') {
    const log = document.getElementById('activity-log');
    if (!log) return;
    
    const colors = {
        success: 'bg-green-400',
        error: 'bg-red-400',
        warning: 'bg-yellow-400',
        info: 'bg-blue-400'
    };
    
    const entry = document.createElement('div');
    entry.className = 'flex items-center text-sm';
    entry.innerHTML = `
        <span class="w-2 h-2 ${colors[type]} rounded-full mr-3"></span>
        <span class="text-gray-600">${new Date().toLocaleTimeString()} - ${message}</span>
    `;
    
    // Nur die letzten 5 Einträge behalten
    if (log.children.length >= 5) {
        log.removeChild(log.firstChild);
    }
    
    log.appendChild(entry);
}

// Toast Notifications
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg mb-2`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    // Auto-remove nach 3 Sekunden
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Filter
function filterExponate() {
    const searchTerm = document.getElementById('search-exponate')?.value.toLowerCase() || '';
    const epocheFilter = document.getElementById('filter-epoche')?.value || '';
    
    // Implementiere Filter-Logik
    console.log('Filtering:', { searchTerm, epocheFilter });
    loadExponate(); // Neu laden mit Filtern
}

// Import Format Selection
function selectImportFormat(format) {
    document.querySelectorAll('.import-format-btn').forEach(btn => {
        btn.classList.remove('border-blue-500', 'bg-blue-50');
        btn.classList.add('border-gray-200');
    });
    
    event.currentTarget.classList.remove('border-gray-200');
    event.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
    
    console.log('Selected format:', format);
}

// Edit Functions (Placeholder)
function editExponat(id) {
    console.log('Edit exponat:', id);
    openExponatModal(id);
}

function editPlaylist(id) {
    console.log('Edit playlist:', id);
    openPlaylistModal(id);
}

// Export for debugging
window.adminPortal = {
    loadDashboard,
    loadExponate,
    loadPlaylists,
    showSection
};