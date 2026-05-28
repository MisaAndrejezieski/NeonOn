// ============================================
// NEONON - PLAYER DE MÍDIA (Vídeos + Imagens)
// CORES NEON COM TRANSIÇÃO SUAVE - Desenvolvido por Misa 💜
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
const volumeIcon = document.querySelector('.volume-icon');
const allNeonBtns = document.querySelectorAll('.btn-neon');
const timeDisplayElem = document.getElementById('timeDisplay');

// --- ESTADO ---
let mediaFiles = [];
let currentIndex = -1;
let autoplay = true;
let currentFolder = null;
let colorInterval = null;
let currentColorIndex = 0;

// --- CORES NEON (RGB para transição suave) ---
const neonColors = [
    { r: 0, g: 255, b: 136, name: 'Verde' },      // #00ff88
    { r: 255, g: 204, b: 0, name: 'Amarelo' },     // #ffcc00
    { r: 255, g: 51, b: 102, name: 'Vermelho' },   // #ff3366
    { r: 0, g: 136, b: 255, name: 'Azul' },        // #0088ff
    { r: 255, g: 102, b: 204, name: 'Rosa' },      // #ff66cc
    { r: 170, g: 68, b: 255, name: 'Roxo' }        // #aa44ff
];

// --- FUNÇÃO PARA CONVERTER RGB PARA STRING ---
function rgbToString(r, g, b) {
    return `rgb(${r}, ${g}, ${b})`;
}

function rgbaToString(r, g, b, a) {
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// --- FUNÇÃO PARA INTERPOLAR ENTRE DUAS CORES ---
function interpolateColor(color1, color2, progress) {
    // progress: 0 = totalmente color1, 1 = totalmente color2
    const r = Math.round(color1.r + (color2.r - color1.r) * progress);
    const g = Math.round(color1.g + (color2.g - color1.g) * progress);
    const b = Math.round(color1.b + (color2.b - color1.b) * progress);
    return { r, g, b };
}

// --- FUNÇÃO PARA CALCULAR O GLOW BASEADO NA COR ---
function getGlow(r, g, b) {
    return `0 0 10px rgba(${r}, ${g}, ${b}, 0.5)`;
}

// --- VARIÁVEIS PARA ANIMAÇÃO SUAVE ---
let animationStartTime = 0;
let animationDuration = 1500; // 1.5 segundos de transição
let startColor = neonColors[0];
let targetColor = neonColors[1];
let isAnimating = false;
let animationFrame = null;

// --- FUNÇÃO QUE APLICA UMA COR ESPECÍFICA (INSTANTÂNEA) ---
function applyColorInstant(r, g, b) {
    const color = rgbToString(r, g, b);
    const glow = getGlow(r, g, b);
    const accentR = Math.min(255, r + 50);
    const accentG = Math.min(255, g + 50);
    const accentB = Math.min(255, b + 50);
    const accentColor = rgbToString(accentR, accentG, accentB);
    
    // 1. Logo "On"
    if (logoAccent) {
        logoAccent.style.color = color;
        logoAccent.style.textShadow = glow;
    }
    
    // 2. Ícone do drop
    if (dropIcon) {
        dropIcon.style.color = color;
        dropIcon.style.textShadow = glow;
    }
    
    // 3. Botão Play
    if (btnPlay) {
        btnPlay.style.color = color;
        btnPlay.style.borderColor = color;
        btnPlay.style.textShadow = glow;
    }
    
    // 4. Botão Autoplay (se ligado)
    if (btnToggleAutoplay && autoplay) {
        btnToggleAutoplay.style.color = color;
        btnToggleAutoplay.style.textShadow = glow;
        btnToggleAutoplay.style.borderColor = color;
    }
    
    // 5. Botões neon
    allNeonBtns.forEach(btn => {
        btn.style.color = color;
        btn.style.borderColor = color;
    });
    
    // 6. Volume ícone
    if (volumeIcon) {
        volumeIcon.style.color = accentColor;
    }
    
    // 7. Slider thumb
    let style = document.getElementById('dynamic-thumb-style');
    if (style) style.remove();
    style = document.createElement('style');
    style.id = 'dynamic-thumb-style';
    style.textContent = `input[type="range"]::-webkit-slider-thumb { 
        background: ${accentColor}; 
        box-shadow: 0 0 8px ${accentColor};
        transition: all 0.3s ease;
    }`;
    document.head.appendChild(style);
    
    // 8. Time display
    if (timeDisplayElem) {
        timeDisplayElem.style.color = color;
    }
    
    // 9. Itens ativos na lista
    const activeListItems = document.querySelectorAll('.video-list li.active');
    activeListItems.forEach(item => {
        item.style.color = color;
        item.style.borderLeftColor = color;
        item.style.textShadow = glow;
    });
}

// --- FUNÇÃO DE ANIMAÇÃO (interpolação suave) ---
function animateColors(timestamp) {
    if (!isAnimating) return;
    
    const elapsed = timestamp - animationStartTime;
    let progress = Math.min(1, elapsed / animationDuration);
    
    // Aplica easing (acelera no início, desacelera no fim)
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    
    // Interpola entre startColor e targetColor
    const currentColor = interpolateColor(startColor, targetColor, easeProgress);
    applyColorInstant(currentColor.r, currentColor.g, currentColor.b);
    
    if (progress < 1) {
        // Continua animando
        animationFrame = requestAnimationFrame(animateColors);
    } else {
        // Animação completa
        isAnimating = false;
        if (animationFrame) cancelAnimationFrame(animationFrame);
        animationFrame = null;
        
        // Garante a cor final exata
        applyColorInstant(targetColor.r, targetColor.g, targetColor.b);
    }
}

// --- FUNÇÃO QUE INICIA A MUDANÇA SUAVE PARA A PRÓXIMA COR ---
function changeColorSmooth() {
    const nextIndex = (currentColorIndex + 1) % neonColors.length;
    const nextColor = neonColors[nextIndex];
    
    // Define a cor atual como start
    const currentElements = getCurrentAppliedColor();
    startColor = getCurrentColorFromElements();
    targetColor = nextColor;
    
    // Inicia animação
    isAnimating = true;
    animationStartTime = performance.now();
    animateColors(animationStartTime);
    
    currentColorIndex = nextIndex;
    console.log(`🌈 Transição suave para: ${nextColor.name}`);
}

// --- FUNÇÃO PARA PEGAR A COR ATUAL APLICADA (fallback) ---
function getCurrentColorFromElements() {
    if (logoAccent && logoAccent.style.color) {
        const rgb = logoAccent.style.color;
        const match = rgb.match(/\d+/g);
        if (match && match.length >= 3) {
            return {
                r: parseInt(match[0]),
                g: parseInt(match[1]),
                b: parseInt(match[2])
            };
        }
    }
    return neonColors[currentColorIndex];
}

// --- FUNÇÃO PARA OBTER COR ATUAL (implementação simples) ---
let currentAppliedColor = neonColors[0];

function getCurrentAppliedColor() {
    // Retorna a última cor aplicada
    return currentAppliedColor;
}

// --- FUNÇÃO QUE TROCA A COR (chamada pelo timer) ---
function changeColor() {
    const nextIndex = (currentColorIndex + 1) % neonColors.length;
    const nextColor = neonColors[nextIndex];
    
    // Anima suavemente do currentAppliedColor para a próxima cor
    startColor = currentAppliedColor;
    targetColor = nextColor;
    
    isAnimating = true;
    animationStartTime = performance.now();
    animateColors(animationStartTime);
    
    currentColorIndex = nextIndex;
    currentAppliedColor = targetColor;
}

// --- SOBRESCREVER applyColorInstant para atualizar currentAppliedColor ---
const originalApplyColorInstant = applyColorInstant;
applyColorInstant = function(r, g, b) {
    originalApplyColorInstant(r, g, b);
    currentAppliedColor = { r, g, b };
};

// --- INICIA O LOOP DE CORES COM TRANSIÇÃO SUAVE (a cada 3 segundos) ---
function startAutoColor() {
    if (colorInterval) clearInterval(colorInterval);
    colorInterval = setInterval(changeColor, 3000); // Troca a cada 3 segundos
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

// Aplica cor inicial
applyColorInstant(neonColors[0].r, neonColors[0].g, neonColors[0].b);
currentAppliedColor = neonColors[0];

// INICIA AS CORES COM TRANSIÇÃO SUAVE
startAutoColor();

console.log('%c✨ NeonOn - Desenvolvido por Misa ✨', 'color: #ff66cc; font-size: 14px;');
console.log('%c🌈 As cores neon mudam suavemente a cada 3 segundos!', 'color: #ffcc00; font-size: 12px;');