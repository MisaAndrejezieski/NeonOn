// ============================================
// NEONON - PLAYER DE MÍDIA (Vídeos + Imagens)
// CORES NEON AUTOMÁTICAS - Desenvolvido por Misa 💜
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

// --- ELEMENTOS QUE TERÃO CORES MUDANDO ---
const logoAccent = document.querySelector('.logo .accent');
const dropIcon = document.querySelector('.drop-icon');
const allButtons = document.querySelectorAll('.btn-icon, .btn-neon, .btn-play');
const volumeIcon = document.querySelector('.volume-icon');
const rangeThumb = document.querySelector('input[type="range"]');
const activeItems = document.querySelectorAll('.video-list li.active');

// --- ESTADO ---
let mediaFiles = [];
let currentIndex = -1;
let autoplay = true;
let currentFolder = null;
let colorInterval = null;
let currentColorIndex = 0;

// --- CORES NEON (RGB para aplicar em tudo) ---
const neonColors = [
    { name: 'Verde', main: '#00ff88', secondary: '#00ccff', accent: '#cc66ff', glow: '0 0 10px rgba(0, 255, 136, 0.5)' },
    { name: 'Amarelo', main: '#ffcc00', secondary: '#ffaa00', accent: '#ff8800', glow: '0 0 10px rgba(255, 204, 0, 0.5)' },
    { name: 'Vermelho', main: '#ff3366', secondary: '#ff0044', accent: '#cc0033', glow: '0 0 10px rgba(255, 51, 102, 0.5)' },
    { name: 'Azul', main: '#0088ff', secondary: '#0066ff', accent: '#0044cc', glow: '0 0 10px rgba(0, 136, 255, 0.5)' },
    { name: 'Rosa', main: '#ff66cc', secondary: '#ff44bb', accent: '#cc2299', glow: '0 0 10px rgba(255, 102, 204, 0.5)' },
    { name: 'Roxo', main: '#aa44ff', secondary: '#8822ff', accent: '#6600cc', glow: '0 0 10px rgba(170, 68, 255, 0.5)' }
];

// --- FUNÇÃO QUE MUDA TODAS AS CORES ---
function applyColor(index) {
    const color = neonColors[index % neonColors.length];
    
    // 1. Logo "On"
    if (logoAccent) {
        logoAccent.style.color = color.main;
        logoAccent.style.textShadow = color.glow;
    }
    
    // 2. Ícone do drop
    if (dropIcon) {
        dropIcon.style.color = color.main;
        dropIcon.style.textShadow = color.glow;
    }
    
    // 3. Botão Play
    if (btnPlay) {
        btnPlay.style.color = color.main;
        btnPlay.style.borderColor = color.main;
        btnPlay.style.textShadow = color.glow;
    }
    
    // 4. Botão Autoplay
    if (btnToggleAutoplay && autoplay) {
        btnToggleAutoplay.style.color = color.main;
        btnToggleAutoplay.style.textShadow = color.glow;
        btnToggleAutoplay.style.borderColor = color.main;
    }
    
    // 5. Botões neon em geral
    const neonBtns = document.querySelectorAll('.btn-neon');
    neonBtns.forEach(btn => {
        btn.style.color = color.main;
        btn.style.borderColor = color.main;
    });
    
    // 6. Botões ícone no hover (estilo inline para garantir)
    const iconBtns = document.querySelectorAll('.btn-icon');
    iconBtns.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.style.color = color.main;
            btn.style.borderColor = color.main;
            btn.style.boxShadow = color.glow;
        });
        btn.addEventListener('mouseleave', () => {
            if (btn !== btnPlay && btn !== btnToggleAutoplay) {
                btn.style.color = '#8888aa';
                btn.style.borderColor = 'rgba(0, 255, 136, 0.3)';
                btn.style.boxShadow = 'none';
            }
        });
    });
    
    // 7. Volume ícone
    if (volumeIcon) {
        volumeIcon.style.color = color.accent;
    }
    
    // 8. Slider thumb
    const style = document.createElement('style');
    style.id = 'dynamic-thumb-style';
    const oldStyle = document.getElementById('dynamic-thumb-style');
    if (oldStyle) oldStyle.remove();
    style.textContent = `input[type="range"]::-webkit-slider-thumb { background: ${color.accent}; box-shadow: 0 0 8px ${color.accent}; }`;
    document.head.appendChild(style);
    
    // 9. Time display
    if (timeDisplay) {
        timeDisplay.style.color = color.main;
    }
    
    // 10. Itens ativos na lista
    const activeListItems = document.querySelectorAll('.video-list li.active');
    activeListItems.forEach(item => {
        item.style.color = color.main;
        item.style.borderLeftColor = color.main;
        item.style.textShadow = color.glow;
    });
    
    // 11. Título da sidebar (hover dos botões)
    console.log(`🌈 Cor atual: ${color.name} Neon`);
}

// --- FUNÇÃO QUE TROCA A COR (chamada automaticamente) ---
function changeColor() {
    currentColorIndex++;
    applyColor(currentColorIndex);
}

// --- INICIA O LOOP DE CORES (a cada 2 segundos) ---
function startAutoColor() {
    if (colorInterval) clearInterval(colorInterval);
    colorInterval = setInterval(changeColor, 2000);
}

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
        }
    } catch (e) {}
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
            alert('Erro ao acessar a pasta.');
        }
    }
}

// --- CARREGAR ARQUIVOS ---
const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.wmv', '.flv', '.m4v'];
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.ico'];

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

// --- PLAYBACK ---
async function playMedia(index) {
    if (index < 0 || index >= mediaFiles.length) return;
    
    currentIndex = index;
    const file = mediaFiles[index];
    
    try {
        const fileData = await file.getFile();
        const url = URL.createObjectURL(fileData);
        
        if (videoPlayer.src) URL.revokeObjectURL(videoPlayer.src);
        if (imageViewer.src) URL.revokeObjectURL(imageViewer.src);
        
        const ext = '.' + file.name.split('.').pop().toLowerCase();
        const isImage = imageExtensions.includes(ext);
        
        if (isImage) {
            imageViewer.src = url;
            imageViewer.style.display = 'block';
            videoPlayer.style.display = 'none';
            videoPlayer.pause();
            timeDisplay.textContent = `🖼️ ${file.name}`;
            btnPlay.innerHTML = '🖼️';
        } else {
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

// --- CONTROLES ---
btnPlay.addEventListener('click', togglePlay);
videoPlayer.addEventListener('click', togglePlay);

function togglePlay() {
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
    btnPlay.innerHTML = videoPlayer.paused ? '▶' : '❚❚';
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
        btnToggleAutoplay.style.color = '#00ff88';
        btnToggleAutoplay.style.textShadow = '0 0 10px rgba(0, 255, 136, 0.5)';
        btnToggleAutoplay.style.borderColor = '#00ff88';
        btnToggleAutoplay.title = 'Autoplay: Ligado';
    } else {
        btnToggleAutoplay.style.color = '#8888aa';
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

// --- TEMPO ---
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
        alert('Arraste uma pasta inteira com vídeos e imagens.');
    }
});

// --- ATALHOS ---
document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    
    switch(e.key) {
        case ' ':
            if (imageViewer.style.display !== 'block') {
                e.preventDefault();
                togglePlay();
            }
            break;
        case 'ArrowLeft': e.preventDefault(); playPrevious(); break;
        case 'ArrowRight': e.preventDefault(); playNext(); break;
        case 'f': case 'F': e.preventDefault(); toggleFullscreen(); break;
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

// INICIA AS CORES AUTOMÁTICAS
applyColor(0);
startAutoColor();

console.log('%c✨ NeonOn - Desenvolvido por Misa ✨', 'color: #ff66cc; font-size: 14px;');
console.log('%c🌈 As cores neon mudam automaticamente a cada 2 segundos!', 'color: #ffcc00; font-size: 12px;');