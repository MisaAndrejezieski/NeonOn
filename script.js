// ============================================
// NEONON - PLAYER DE MÍDIA + PARALLAX
// Cores Neon Suaves + Efeito Parallax nas 4 imagens
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

// --- ELEMENTOS DAS CORES ---
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
    { r: 0, g: 255, b: 136, name: 'Verde' },
    { r: 255, g: 204, b: 0, name: 'Amarelo' },
    { r: 255, g: 51, b: 102, name: 'Vermelho' },
    { r: 0, g: 136, b: 255, name: 'Azul' },
    { r: 255, g: 102, b: 204, name: 'Rosa' },
    { r: 170, g: 68, b: 255, name: 'Roxo' }
];

let currentAppliedColor = neonColors[0];
let isAnimating = false;
let animationFrame = null;
let animationStartTime = 0;
let animationDuration = 1500;
let startColor = neonColors[0];
let targetColor = neonColors[1];

// --- FUNÇÕES DE COR ---
function rgbToString(r, g, b) {
    return `rgb(${r}, ${g}, ${b})`;
}

function getGlow(r, g, b) {
    return `0 0 10px rgba(${r}, ${g}, ${b}, 0.5)`;
}

function interpolateColor(color1, color2, progress) {
    const r = Math.round(color1.r + (color2.r - color1.r) * progress);
    const g = Math.round(color1.g + (color2.g - color1.g) * progress);
    const b = Math.round(color1.b + (color2.b - color1.b) * progress);
    return { r, g, b };
}

function applyColorInstant(r, g, b) {
    const color = rgbToString(r, g, b);
    const glow = getGlow(r, g, b);
    const accentR = Math.min(255, r + 50);
    const accentG = Math.min(255, g + 50);
    const accentB = Math.min(255, b + 50);
    const accentColor = rgbToString(accentR, accentG, accentB);
    
    if (logoAccent) {
        logoAccent.style.color = color;
        logoAccent.style.textShadow = glow;
    }
    if (dropIcon) {
        dropIcon.style.color = color;
        dropIcon.style.textShadow = glow;
    }
    if (btnPlay) {
        btnPlay.style.color = color;
        btnPlay.style.borderColor = color;
        btnPlay.style.textShadow = glow;
    }
    if (btnToggleAutoplay && autoplay) {
        btnToggleAutoplay.style.color = color;
        btnToggleAutoplay.style.textShadow = glow;
        btnToggleAutoplay.style.borderColor = color;
    }
    allNeonBtns.forEach(btn => {
        btn.style.color = color;
        btn.style.borderColor = color;
    });
    if (volumeIcon) volumeIcon.style.color = accentColor;
    
    let style = document.getElementById('dynamic-thumb-style');
    if (style) style.remove();
    style = document.createElement('style');
    style.id = 'dynamic-thumb-style';
    style.textContent = `input[type="range"]::-webkit-slider-thumb { background: ${accentColor}; box-shadow: 0 0 8px ${accentColor}; transition: all 0.3s ease; }`;
    document.head.appendChild(style);
    
    if (timeDisplayElem) timeDisplayElem.style.color = color;
    
    const activeListItems = document.querySelectorAll('.video-list li.active');
    activeListItems.forEach(item => {
        item.style.color = color;
        item.style.borderLeftColor = color;
        item.style.textShadow = glow;
    });
}

function animateColors(timestamp) {
    if (!isAnimating) return;
    const elapsed = timestamp - animationStartTime;
    let progress = Math.min(1, elapsed / animationDuration);
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    const currentColor = interpolateColor(startColor, targetColor, easeProgress);
    applyColorInstant(currentColor.r, currentColor.g, currentColor.b);
    if (progress < 1) {
        animationFrame = requestAnimationFrame(animateColors);
    } else {
        isAnimating = false;
        applyColorInstant(targetColor.r, targetColor.g, targetColor.b);
        currentAppliedColor = targetColor;
    }
}

function changeColor() {
    const nextIndex = (currentColorIndex + 1) % neonColors.length;
    const nextColor = neonColors[nextIndex];
    startColor = currentAppliedColor;
    targetColor = nextColor;
    isAnimating = true;
    animationStartTime = performance.now();
    animateColors(animationStartTime);
    currentColorIndex = nextIndex;
    currentAppliedColor = targetColor;
}

function startAutoColor() {
    if (colorInterval) clearInterval(colorInterval);
    colorInterval = setInterval(changeColor, 3000);
}

// ============================================
// PARALLAX NAS 4 IMAGENS (o que você pediu!)
// ============================================

const parallaxLayers = document.querySelectorAll('.parallax-layer');
let currentBgIndex = 0;
let bgInterval = null;

// Troca de imagem com fade
function changeBackground() {
    if (parallaxLayers.length === 0) return;
    parallaxLayers.forEach(layer => layer.classList.remove('active'));
    currentBgIndex = (currentBgIndex + 1) % parallaxLayers.length;
    parallaxLayers[currentBgIndex].classList.add('active');
}

// Inicia slideshow das imagens de fundo
function startBackgroundSlideshow() {
    if (bgInterval) clearInterval(bgInterval);
    if (parallaxLayers.length > 1) {
        bgInterval = setInterval(changeBackground, 10000); // 10 segundos
    }
}

// EFEITO PARALLAX - movimento suave com o mouse!
document.addEventListener('mousemove', (e) => {
    // Calcula posição do mouse (0 a 1)
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;
    
    // Move cada camada de forma diferente (efeito 3D)
    parallaxLayers.forEach((layer, index) => {
        // Velocidades diferentes para cada imagem
        const speedX = (index + 1) * 8;
        const speedY = (index + 1) * 5;
        
        const moveX = (mouseX - 0.5) * speedX;
        const moveY = (mouseY - 0.5) * speedY;
        
        layer.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.05)`;
    });
});

// ============================================
// CONFIGURAÇÃO
// ============================================
const CONFIG_KEY = 'neonon_config';
const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.wmv', '.flv', '.m4v'];
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.ico'];

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
    const config = { autoplay: autoplay, volume: parseInt(volumeSlider.value) };
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
        if (err.name !== 'AbortError') alert('Erro ao acessar a pasta.');
    }
}

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
    if (mediaFiles.length > 0) playMedia(0);
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
    } catch (err) { alert('Erro ao carregar o arquivo'); }
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

btnPlay.addEventListener('click', togglePlay);
videoPlayer.addEventListener('click', togglePlay);

function togglePlay() {
    if (imageViewer.style.display === 'block') return;
    if (videoPlayer.paused) videoPlayer.play();
    else videoPlayer.pause();
    updatePlayButton();
}

function updatePlayButton() {
    if (imageViewer.style.display === 'block') {
        btnPlay.innerHTML = '🖼️';
        return;
    }
    btnPlay.innerHTML = videoPlayer.paused ? '▶' : '❚❚';
}

btnPrev.addEventListener('click', () => {
    if (mediaFiles.length === 0) return;
    playMedia(currentIndex > 0 ? currentIndex - 1 : mediaFiles.length - 1);
});

btnNext.addEventListener('click', () => {
    if (mediaFiles.length === 0) return;
    playMedia(currentIndex < mediaFiles.length - 1 ? currentIndex + 1 : 0);
});

btnToggleAutoplay.addEventListener('click', () => {
    autoplay = !autoplay;
    updateAutoplayButton();
    saveConfig();
});

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
    if (autoplay && mediaFiles.length > 1) btnNext.click();
    else updatePlayButton();
});

volumeSlider.addEventListener('input', () => {
    videoPlayer.volume = volumeSlider.value / 100;
    saveConfig();
});

videoPlayer.addEventListener('timeupdate', () => {
    if (imageViewer.style.display === 'block') return;
    timeDisplay.textContent = `${formatTime(videoPlayer.currentTime)} / ${formatTime(videoPlayer.duration)}`;
});

function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return '00:00';
    return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
}

btnFullscreen.addEventListener('click', () => {
    document.fullscreenElement ? document.exitFullscreen() : videoContainer.requestFullscreen();
});

// Drag & Drop
document.addEventListener('dragover', (e) => { e.preventDefault(); document.body.classList.add('dragover'); });
document.addEventListener('dragleave', (e) => { e.preventDefault(); if (e.relatedTarget === null) document.body.classList.remove('dragover'); });
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
    const files = [...e.dataTransfer.files].filter(f => f.type.startsWith('video/') || f.type.startsWith('image/'));
    if (files.length > 0) alert('Arraste uma pasta inteira com vídeos e imagens.');
});

// Atalhos
document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    switch(e.key) {
        case ' ': if (imageViewer.style.display !== 'block') { e.preventDefault(); togglePlay(); } break;
        case 'ArrowLeft': e.preventDefault(); btnPrev.click(); break;
        case 'ArrowRight': e.preventDefault(); btnNext.click(); break;
        case 'f': case 'F': e.preventDefault(); btnFullscreen.click(); break;
        case 'ArrowUp': e.preventDefault(); volumeSlider.value = Math.min(100, parseInt(volumeSlider.value) + 5); videoPlayer.volume = volumeSlider.value / 100; saveConfig(); break;
        case 'ArrowDown': e.preventDefault(); volumeSlider.value = Math.max(0, parseInt(volumeSlider.value) - 5); videoPlayer.volume = volumeSlider.value / 100; saveConfig(); break;
    }
});

// --- INICIALIZAÇÃO ---
loadConfig();
updateAutoplayButton();
updatePlayButton();

// Aplica cor inicial
applyColorInstant(neonColors[0].r, neonColors[0].g, neonColors[0].b);
currentAppliedColor = neonColors[0];
startAutoColor();

// Fundo: ativa primeira imagem e inicia slideshow
if (parallaxLayers.length > 0) parallaxLayers[0].classList.add('active');
startBackgroundSlideshow();

console.log('%c✨ NeonOn - Desenvolvido por Misa ✨', 'color: #ff66cc; font-size: 14px;');
console.log('%c🌈 Cores neon suaves + PARALLAX nas 4 imagens!', 'color: #ffcc00; font-size: 12px;');
console.log('%c🖱️ Movimente o mouse para ver o efeito parallax!', 'color: #00ff88; font-size: 11px;');