// ============================================
// NEONON - PLAYER DE MÍDIA (Vídeos + Imagens)
// Desenvolvido por Misa 💜
// ============================================

// --- ELEMENTOS DOM ---
const videoPlayer = document.getElementById('videoPlayer');
const imageViewer = document.getElementById('imageViewer');
const videoContainer = document.getElementById('videoContainer');
const videoList = document.getElementById('videoList');
const dropOverlay = document.getElementById('dropOverlay');
const videoCounter = document.getElementById('videoCounter');
const timeDisplay = document.getElementById('timeDisplay');
const imageControls = document.getElementById('imageControls');

const btnSelectFolder = document.getElementById('btnSelectFolder');
const btnToggleAutoplay = document.getElementById('btnToggleAutoplay');
const btnPrev = document.getElementById('btnPrev');
const btnPlay = document.getElementById('btnPlay');
const btnNext = document.getElementById('btnNext');
const btnFullscreen = document.getElementById('btnFullscreen');
const volumeSlider = document.getElementById('volumeSlider');

// Novos elementos de zoom
const btnZoomIn = document.getElementById('btnZoomIn');
const btnZoomOut = document.getElementById('btnZoomOut');
const btnResetZoom = document.getElementById('btnResetZoom');

// Filtros
const filterButtons = document.querySelectorAll('.filter-btn');

// --- ESTADO ---
let mediaFiles = [];        // Array de arquivos (vídeos + imagens)
let currentIndex = -1;
let autoplay = true;
let currentFolder = null;
let currentFilter = 'all';  // 'all', 'video', 'image'
let currentZoom = 1;

// Extensões suportadas
const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.wmv', '.flv', '.m4v'];
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico'];

// --- CONFIGURAÇÃO ---
const CONFIG_KEY = 'neonon_config';

function loadConfig() {
    try {
        const saved = localStorage.getItem(CONFIG_KEY);
        if (saved) {
            const config = JSON.parse(saved);
            autoplay = config.autoplay ?? true;
            volumeSlider.value = config.volume ?? 100;
            videoPlayer.volume = volumeSlider.value / 100;
            updateAutoplayButton();
        }
    } catch (e) {
        console.log('Config resetada');
    }
}

function saveConfig() {
    const config = {
        autoplay: autoplay,
        volume: parseInt(volumeSlider.value)
    };
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

// --- SELEÇÃO DE PASTA ---
btnSelectFolder.addEventListener('click', selectFolder);

async function selectFolder() {
    try {
        const dirHandle = await window.showDirectoryPicker();
        currentFolder = dirHandle;
        await loadMediaFromFolder(dirHandle);
    } catch (err) {
        if (err.name !== 'AbortError') {
            console.error('Erro:', err);
            alert('Erro ao acessar a pasta.');
        }
    }
}

// --- CARREGAR MÍDIA (Vídeos + Imagens) ---
async function loadMediaFromFolder(dirHandle) {
    mediaFiles = [];
    
    for await (const entry of dirHandle.values()) {
        if (entry.kind === 'file') {
            const ext = '.' + entry.name.split('.').pop().toLowerCase();
            const type = getMediaType(ext);
            if (type) {
                mediaFiles.push({
                    handle: entry,
                    name: entry.name,
                    type: type,
                    ext: ext
                });
            }
        }
    }
    
    // Ordenar
    mediaFiles.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { numeric: true }));
    
    updateFilterButtons();
    applyFilter();
    
    if (getFilteredFiles().length > 0) {
        playMedia(0);
    }
}

function getMediaType(ext) {
    if (videoExtensions.includes(ext)) return 'video';
    if (imageExtensions.includes(ext)) return 'image';
    return null;
}

// --- FILTROS ---
function updateFilterButtons() {
    const counts = {
        all: mediaFiles.length,
        video: mediaFiles.filter(f => f.type === 'video').length,
        image: mediaFiles.filter(f => f.type === 'image').length
    };
    
    filterButtons.forEach(btn => {
        const filter = btn.dataset.filter;
        const count = counts[filter] || 0;
        btn.textContent = `${btn.textContent.split(' ')[0]} ${count}`;
    });
}

function applyFilter() {
    const filtered = getFilteredFiles();
    
    if (filtered.length === 0) {
        videoList.innerHTML = '<li class="empty-state">Nenhum arquivo encontrado</li>';
        videoCounter.textContent = '';
        hideAllPlayers();
        return;
    }
    
    updateVideoList();
}

function getFilteredFiles() {
    if (currentFilter === 'all') return mediaFiles;
    return mediaFiles.filter(f => f.type === currentFilter);
}

// Eventos dos filtros
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        
        const filtered = getFilteredFiles();
        if (filtered.length > 0) {
            playMedia(0);
        } else {
            videoList.innerHTML = '<li class="empty-state">Nenhum arquivo neste filtro</li>';
            videoCounter.textContent = '';
            hideAllPlayers();
        }
        
        updateVideoList();
    });
});

// --- ATUALIZAR LISTA ---
function updateVideoList() {
    videoList.innerHTML = '';
    const filtered = getFilteredFiles();
    
    if (filtered.length === 0) {
        videoCounter.textContent = '';
        return;
    }
    
    filtered.forEach((file, idx) => {
        const li = document.createElement('li');
        li.textContent = file.name;
        li.classList.add(file.type + '-item');
        
        // Ícone diferente por tipo
        const icon = file.type === 'video' ? '🎬 ' : '🖼️ ';
        li.innerHTML = icon + file.name;
        
        li.addEventListener('click', () => {
            const originalIndex = mediaFiles.findIndex(f => f.name === file.name);
            playMedia(originalIndex);
        });
        
        if (mediaFiles[currentIndex] && mediaFiles[currentIndex].name === file.name) {
            li.classList.add('active');
        }
        
        videoList.appendChild(li);
    });
    
    const total = filtered.length;
    videoCounter.textContent = `${total} arquivo${total !== 1 ? 's' : ''}`;
}

// --- REPRODUZIR MÍDIA ---
async function playMedia(index) {
    if (index < 0 || index >= mediaFiles.length) return;
    
    currentIndex = index;
    const file = mediaFiles[index];
    
    hideAllPlayers();
    resetZoom();
    
    try {
        const fileData = await file.handle.getFile();
        const url = URL.createObjectURL(fileData);
        
        if (file.type === 'video') {
            await playVideo(url, fileData);
        } else if (file.type === 'image') {
            playImage(url, fileData);
        }
        
        updateVideoList();
        highlightCurrentInList();
        
    } catch (err) {
        console.error('Erro ao carregar:', err);
        alert('Erro ao carregar o arquivo');
    }
}

async function playVideo(url, fileData) {
    if (videoPlayer.src) URL.revokeObjectURL(videoPlayer.src);
    
    videoPlayer.src = url;
    videoPlayer.style.display = 'block';
    imageViewer.style.display = 'none';
    imageControls.style.display = 'none';
    videoContainer.classList.add('has-video');
    dropOverlay.style.display = 'none';
    
    videoPlayer.load();
    await videoPlayer.play();
    updatePlayButton();
}

function playImage(url, fileData) {
    imageViewer.src = url;
    imageViewer.style.display = 'block';
    videoPlayer.style.display = 'none';
    videoPlayer.pause();
    imageControls.style.display = 'flex';
    videoContainer.classList.add('has-video');
    dropOverlay.style.display = 'none';
    updatePlayButton();
}

function hideAllPlayers() {
    videoPlayer.style.display = 'none';
    imageViewer.style.display = 'none';
    imageControls.style.display = 'none';
    videoPlayer.pause();
}

function highlightCurrentInList() {
    const items = videoList.querySelectorAll('li');
    const currentFile = mediaFiles[currentIndex];
    
    items.forEach(item => {
        if (item.textContent.includes(currentFile?.name)) {
            item.classList.add('active');
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            item.classList.remove('active');
        }
    });
}

// --- ZOOM PARA IMAGENS ---
function resetZoom() {
    currentZoom = 1;
    imageViewer.style.transform = `scale(${currentZoom})`;
    imageViewer.style.transformOrigin = 'center center';
}

function zoomIn() {
    currentZoom = Math.min(currentZoom + 0.25, 3);
    imageViewer.style.transform = `scale(${currentZoom})`;
}

function zoomOut() {
    currentZoom = Math.max(currentZoom - 0.25, 0.5);
    imageViewer.style.transform = `scale(${currentZoom})`;
}

if (btnZoomIn) btnZoomIn.addEventListener('click', zoomIn);
if (btnZoomOut) btnZoomOut.addEventListener('click', zoomOut);
if (btnResetZoom) btnResetZoom.addEventListener('click', resetZoom);

// --- CONTROLES DE PLAYBACK ---
function togglePlay() {
    const currentFile = mediaFiles[currentIndex];
    
    if (!currentFile) return;
    
    if (currentFile.type === 'video') {
        if (videoPlayer.paused) {
            videoPlayer.play();
        } else {
            videoPlayer.pause();
        }
    }
    
    updatePlayButton();
}

function updatePlayButton() {
    const currentFile = mediaFiles[currentIndex];
    
    if (!currentFile) {
        btnPlay.innerHTML = '▶';
        return;
    }
    
    if (currentFile.type === 'video') {
        btnPlay.innerHTML = videoPlayer.paused ? '▶' : '❚❚';
    } else {
        btnPlay.innerHTML = '▶';  // Imagens não têm play/pause
    }
}

function playPrevious() {
    const filtered = getFilteredFiles();
    if (filtered.length === 0) return;
    
    const currentFilteredIndex = filtered.findIndex(f => f.name === mediaFiles[currentIndex]?.name);
    const newFilteredIndex = currentFilteredIndex > 0 ? currentFilteredIndex - 1 : filtered.length - 1;
    const originalIndex = mediaFiles.findIndex(f => f.name === filtered[newFilteredIndex].name);
    
    playMedia(originalIndex);
}

function playNext() {
    const filtered = getFilteredFiles();
    if (filtered.length === 0) return;
    
    const currentFilteredIndex = filtered.findIndex(f => f.name === mediaFiles[currentIndex]?.name);
    const newFilteredIndex = currentFilteredIndex < filtered.length - 1 ? currentFilteredIndex + 1 : 0;
    const originalIndex = mediaFiles.findIndex(f => f.name === filtered[newFilteredIndex].name);
    
    playMedia(originalIndex);
}

// --- EVENTOS ---
btnPlay.addEventListener('click', togglePlay);
btnPrev.addEventListener('click', playPrevious);
btnNext.addEventListener('click', playNext);

videoPlayer.addEventListener('ended', () => {
    if (autoplay) playNext();
    updatePlayButton();
});

videoPlayer.addEventListener('timeupdate', updateTimeDisplay);

function updateTimeDisplay() {
    if (mediaFiles[currentIndex]?.type === 'video') {
        const current = formatTime(videoPlayer.currentTime);
        const duration = formatTime(videoPlayer.duration);
        timeDisplay.textContent = `${current} / ${duration}`;
    } else {
        const file = mediaFiles[currentIndex];
        if (file && file.type === 'image') {
            timeDisplay.textContent = `🖼️ ${file.name}`;
        } else {
            timeDisplay.textContent = '00:00 / 00:00';
        }
    }
}

function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// --- AUTOPLAY ---
btnToggleAutoplay.addEventListener('click', toggleAutoplay);

function toggleAutoplay() {
    autoplay = !autoplay;
    updateAutoplayButton();
    saveConfig();
}

function updateAutoplayButton() {
    if (autoplay) {
        btnToggleAutoplay.style.color = 'var(--neon-green)';
        btnToggleAutoplay.style.textShadow = 'var(--glow-green)';
        btnToggleAutoplay.style.borderColor = 'var(--neon-green)';
        btnToggleAutoplay.title = 'Autoplay: Ligado';
    } else {
        btnToggleAutoplay.style.color = 'var(--text-secondary)';
        btnToggleAutoplay.style.textShadow = 'none';
        btnToggleAutoplay.style.borderColor = 'transparent';
        btnToggleAutoplay.title = 'Autoplay: Desligado';
    }
}

// --- VOLUME ---
volumeSlider.addEventListener('input', () => {
    videoPlayer.volume = volumeSlider.value / 100;
    saveConfig();
});

// --- TELA CHEIA ---
btnFullscreen.addEventListener('click', toggleFullscreen);

function toggleFullscreen() {
    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else {
        videoContainer.requestFullscreen();
    }
}

// --- DRAG & DROP ---
document.addEventListener('dragover', (e) => {
    e.preventDefault();
    document.body.classList.add('dragover');
});

document.addEventListener('dragleave', (e) => {
    e.preventDefault();
    if (e.relatedTarget === null) {
        document.body.classList.remove('dragover');
    }
});

document.addEventListener('drop', async (e) => {
    e.preventDefault();
    document.body.classList.remove('dragover');
    
    const items = e.dataTransfer.items;
    if (!items) return;
    
    for (const item of items) {
        if (item.kind === 'file') {
            const entry = await item.getAsFileSystemHandle();
            if (entry && entry.kind === 'directory') {
                currentFolder = entry;
                await loadMediaFromFolder(entry);
                return;
            }
        }
    }
    
    const files = [...e.dataTransfer.files];
    if (files.length > 0) {
        alert('Arraste uma pasta inteira com vídeos e imagens.');
    }
});

// --- ATALHOS DE TECLADO ---
document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    
    switch(e.key) {
        case ' ': togglePlay(); e.preventDefault(); break;
        case 'ArrowLeft': playPrevious(); e.preventDefault(); break;
        case 'ArrowRight': playNext(); e.preventDefault(); break;
        case 'f': case 'F': toggleFullscreen(); e.preventDefault(); break;
        case '+': case '=': zoomIn(); e.preventDefault(); break;
        case '-': zoomOut(); e.preventDefault(); break;
        case '0': resetZoom(); e.preventDefault(); break;
        case 'ArrowUp':
            volumeSlider.value = Math.min(100, parseInt(volumeSlider.value) + 5);
            videoPlayer.volume = volumeSlider.value / 100;
            saveConfig();
            e.preventDefault();
            break;
        case 'ArrowDown':
            volumeSlider.value = Math.max(0, parseInt(volumeSlider.value) - 5);
            videoPlayer.volume = volumeSlider.value / 100;
            saveConfig();
            e.preventDefault();
            break;
    }
});

// --- INICIALIZAÇÃO ---
loadConfig();
updateAutoplayButton();
updatePlayButton();
updateTimeDisplay();

console.log('%cNeonOn %cReady - Vídeos + Imagens!',
    'color: #00ff88; font-size: 16px;',
    'color: #cc66ff;');
console.log('%cDesenvolvido por Misa 💜', 'color: #ff4477; font-size: 12px;');