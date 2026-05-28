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

const btnSelectFolder = document.getElementById('btnSelectFolder');
const btnToggleAutoplay = document.getElementById('btnToggleAutoplay');
const btnPrev = document.getElementById('btnPrev');
const btnPlay = document.getElementById('btnPlay');
const btnNext = document.getElementById('btnNext');
const btnFullscreen = document.getElementById('btnFullscreen');
const volumeSlider = document.getElementById('volumeSlider');

// --- ESTADO DA APLICAÇÃO ---
let mediaFiles = [];
let currentIndex = -1;
let autoplay = true;
let currentFolder = null;

// Extensões suportadas
const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.wmv', '.flv', '.m4v'];
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.ico'];

// --- CONFIGURAÇÃO PERSISTENTE ---
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
        console.log('Config resetada para padrões.');
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
            console.error('Erro ao selecionar pasta:', err);
            alert('Erro ao acessar a pasta. Verifique as permissões.');
        }
    }
}

// --- CARREGAR ARQUIVOS (Vídeos + Imagens) ---
async function loadMediaFromFolder(dirHandle) {
    mediaFiles = [];
    
    for await (const entry of dirHandle.values()) {
        if (entry.kind === 'file') {
            const ext = '.' + entry.name.split('.').pop().toLowerCase();
            if (videoExtensions.includes(ext) || imageExtensions.includes(ext)) {
                mediaFiles.push(entry);
            }
        }
    }
    
    mediaFiles.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { numeric: true }));
    
    updateMediaList();
    
    if (mediaFiles.length > 0) {
        playMedia(0);
    }
}

function updateMediaList() {
    videoList.innerHTML = '';
    
    if (mediaFiles.length === 0) {
        videoList.innerHTML = '<li class="empty-state">Nenhum arquivo encontrado</li>';
        videoCounter.textContent = '';
        return;
    }
    
    mediaFiles.forEach((file, index) => {
        const li = document.createElement('li');
        const ext = '.' + file.name.split('.').pop().toLowerCase();
        const isImage = imageExtensions.includes(ext);
        const icon = isImage ? '🖼️ ' : '🎬 ';
        li.innerHTML = icon + file.name;
        
        li.addEventListener('click', () => playMedia(index));
        if (index === currentIndex) li.classList.add('active');
        videoList.appendChild(li);
    });
    
    videoCounter.textContent = `${mediaFiles.length} arquivo${mediaFiles.length !== 1 ? 's' : ''}`;
}

// --- PLAYBACK (Vídeo ou Imagem) ---
async function playMedia(index) {
    if (index < 0 || index >= mediaFiles.length) return;
    
    currentIndex = index;
    const file = mediaFiles[index];
    
    try {
        const fileData = await file.getFile();
        const url = URL.createObjectURL(fileData);
        
        // Limpa URLs anteriores
        if (videoPlayer.src) URL.revokeObjectURL(videoPlayer.src);
        if (imageViewer.src) URL.revokeObjectURL(imageViewer.src);
        
        const ext = '.' + file.name.split('.').pop().toLowerCase();
        const isImage = imageExtensions.includes(ext);
        
        if (isImage) {
            // Modo Imagem
            imageViewer.src = url;
            imageViewer.style.display = 'block';
            videoPlayer.style.display = 'none';
            videoPlayer.pause();
            timeDisplay.textContent = `🖼️ ${file.name}`;
            btnPlay.innerHTML = '🖼️';
        } else {
            // Modo Vídeo
            videoPlayer.src = url;
            videoPlayer.style.display = 'block';
            imageViewer.style.display = 'none';
            videoPlayer.load();
            videoPlayer.play();
            updatePlayButton();
        }
        
        videoContainer.classList.add('has-video');
        dropOverlay.style.display = 'none';
        
        updateMediaList();
        highlightCurrentInList();
        
    } catch (err) {
        console.error('Erro ao carregar arquivo:', err);
        alert('Erro ao carregar o arquivo');
    }
}

function highlightCurrentInList() {
    const items = videoList.querySelectorAll('li');
    items.forEach((item, i) => {
        if (i === currentIndex) {
            item.classList.add('active');
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            item.classList.remove('active');
        }
    });
}

// --- CONTROLES DE PLAYBACK ---
btnPlay.addEventListener('click', togglePlay);
videoPlayer.addEventListener('click', togglePlay);

function togglePlay() {
    // Se for imagem, não faz nada
    if (imageViewer.style.display === 'block') return;
    
    if (videoPlayer.paused) {
        videoPlayer.play();
    } else {
        videoPlayer.pause();
    }
    updatePlayButton();
}

function updatePlayButton() {
    if (imageViewer.style.display === 'block') {
        btnPlay.innerHTML = '🖼️';
        return;
    }
    
    if (videoPlayer.paused) {
        btnPlay.innerHTML = '▶';
    } else {
        btnPlay.innerHTML = '❚❚';
    }
}

btnPrev.addEventListener('click', playPrevious);
btnNext.addEventListener('click', playNext);

function playPrevious() {
    if (mediaFiles.length === 0) return;
    const newIndex = currentIndex > 0 ? currentIndex - 1 : mediaFiles.length - 1;
    playMedia(newIndex);
}

function playNext() {
    if (mediaFiles.length === 0) return;
    const newIndex = currentIndex < mediaFiles.length - 1 ? currentIndex + 1 : 0;
    playMedia(newIndex);
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

videoPlayer.addEventListener('ended', () => {
    if (autoplay && mediaFiles.length > 1) {
        playNext();
    } else {
        updatePlayButton();
    }
});

// --- VOLUME ---
volumeSlider.addEventListener('input', () => {
    videoPlayer.volume = volumeSlider.value / 100;
    saveConfig();
});

// --- EXIBIÇÃO DE TEMPO ---
videoPlayer.addEventListener('timeupdate', updateTimeDisplay);

function updateTimeDisplay() {
    if (imageViewer.style.display === 'block') return;
    
    const current = formatTime(videoPlayer.currentTime);
    const duration = formatTime(videoPlayer.duration);
    timeDisplay.textContent = `${current} / ${duration}`;
}

function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

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
    
    const files = [...e.dataTransfer.files].filter(f => 
        f.type.startsWith('video/') || f.type.startsWith('image/')
    );
    if (files.length > 0) {
        alert('Para melhor experiência, arraste uma pasta inteira com vídeos e imagens.');
    }
});

// --- ATALHOS DE TECLADO ---
document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    
    switch(e.key) {
        case ' ':
            if (imageViewer.style.display !== 'block') {
                e.preventDefault();
                togglePlay();
            }
            break;
        case 'ArrowLeft':
            e.preventDefault();
            playPrevious();
            break;
        case 'ArrowRight':
            e.preventDefault();
            playNext();
            break;
        case 'f':
        case 'F':
            e.preventDefault();
            toggleFullscreen();
            break;
        case 'ArrowUp':
            e.preventDefault();
            volumeSlider.value = Math.min(100, parseInt(volumeSlider.value) + 5);
            videoPlayer.volume = volumeSlider.value / 100;
            saveConfig();
            break;
        case 'ArrowDown':
            e.preventDefault();
            volumeSlider.value = Math.max(0, parseInt(volumeSlider.value) - 5);
            videoPlayer.volume = volumeSlider.value / 100;
            saveConfig();
            break;
    }
});

// --- INICIALIZAÇÃO ---
loadConfig();
updateAutoplayButton();
updatePlayButton();
updateTimeDisplay();

console.log('%cNeonOn %cReady - Vídeos + Imagens!',
    'color: #00ff88; font-size: 16px; text-shadow: 0 0 10px rgba(0,255,136,0.5);',
    'color: #e0e0e0;');
console.log('%cDesenvolvido por Misa 💜', 'color: #cc66ff; font-size: 12px; font-style: italic;');