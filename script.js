// ============================================
// NEONON - PLAYER DE MÍDIA PROFISSIONAL
// Cada elemento neon tem sua PRÓPRIA COR!
// Todas mudam simultaneamente!
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
const btnReset = document.getElementById('btnReset');
const volumeSlider = document.getElementById('volumeSlider');

// --- ELEMENTOS PARA CORES INDEPENDENTES ---
const logoNeon = document.querySelector('.logo');
const logoOn = document.querySelector('.logo .accent');
const dropIcon = document.querySelector('.drop-icon');
const volumeIcon = document.querySelector('.volume-icon');
const allNeonBtns = document.querySelectorAll('.btn-neon');
const autoplayBtn = document.getElementById('btnToggleAutoplay');
const prevBtn = document.getElementById('btnPrev');
const nextBtn = document.getElementById('btnNext');
const fullscreenBtn = document.getElementById('btnFullscreen');

// --- PALETA DE CORES NEON (RGB) ---
const paletaNeon = [
    { r: 0, g: 255, b: 136, name: 'Verde' },      // #00ff88
    { r: 255, g: 204, b: 0, name: 'Amarelo' },     // #ffcc00
    { r: 255, g: 51, b: 102, name: 'Vermelho' },   // #ff3366
    { r: 0, g: 136, b: 255, name: 'Azul' },        // #0088ff
    { r: 255, g: 102, b: 204, name: 'Rosa' },      // #ff66cc
    { r: 170, g: 68, b: 255, name: 'Roxo' },       // #aa44ff
    { r: 0, g: 255, b: 255, name: 'Ciano' },       // #00ffff
    { r: 255, g: 128, b: 0, name: 'Laranja' }      // #ff8000
];

// Cada elemento começa com um índice DIFERENTE para cores diferentes!
let colorIndex = {
    logoNeon: 0,
    logoOn: 1,
    dropIcon: 2,
    volumeIcon: 3,
    timeDisplay: 4,
    autoplayBtn: 5,
    navBtns: 6,
    neonBtns: 7,
    playBtn: 0,
    activeItem: 2
};

let colorInterval = null;

// --- FUNÇÕES DE COR ---
function rgbToString(r, g, b) {
    return `rgb(${r}, ${g}, ${b})`;
}

function getGlow(r, g, b) {
    return `0 0 10px rgba(${r}, ${g}, ${b}, 0.5)`;
}

// --- APLICA CORES INDEPENDENTES PARA CADA ELEMENTO ---
function applyAllColors() {
    // 1. Logo "Neon"
    const neonColor = paletaNeon[colorIndex.logoNeon % paletaNeon.length];
    if (logoNeon) {
        logoNeon.style.color = rgbToString(neonColor.r, neonColor.g, neonColor.b);
        logoNeon.style.textShadow = getGlow(neonColor.r, neonColor.g, neonColor.b);
    }
    
    // 2. Logo "On"
    const onColor = paletaNeon[colorIndex.logoOn % paletaNeon.length];
    if (logoOn) {
        logoOn.style.color = rgbToString(onColor.r, onColor.g, onColor.b);
        logoOn.style.textShadow = getGlow(onColor.r, onColor.g, onColor.b);
    }
    
    // 3. Ícone Drop
    const dropColor = paletaNeon[colorIndex.dropIcon % paletaNeon.length];
    if (dropIcon) {
        dropIcon.style.color = rgbToString(dropColor.r, dropColor.g, dropColor.b);
        dropIcon.style.textShadow = getGlow(dropColor.r, dropColor.g, dropColor.b);
    }
    
    // 4. Ícone Volume
    const volumeColor = paletaNeon[colorIndex.volumeIcon % paletaNeon.length];
    if (volumeIcon) {
        volumeIcon.style.color = rgbToString(volumeColor.r, volumeColor.g, volumeColor.b);
    }
    
    // 5. Display Tempo
    const timeColor = paletaNeon[colorIndex.timeDisplay % paletaNeon.length];
    if (timeDisplay) {
        timeDisplay.style.color = rgbToString(timeColor.r, timeColor.g, timeColor.b);
        timeDisplay.style.textShadow = getGlow(timeColor.r, timeColor.g, timeColor.b);
    }
    
    // 6. Botão Autoplay
    const autoplayColor = paletaNeon[colorIndex.autoplayBtn % paletaNeon.length];
    if (autoplayBtn) {
        autoplayBtn.style.color = rgbToString(autoplayColor.r, autoplayColor.g, autoplayColor.b);
        autoplayBtn.style.textShadow = getGlow(autoplayColor.r, autoplayColor.g, autoplayColor.b);
        autoplayBtn.style.borderColor = rgbToString(autoplayColor.r, autoplayColor.g, autoplayColor.b);
    }
    
    // 7. Botões Navegação (Anterior, Próximo, Tela Cheia)
    const navColor = paletaNeon[colorIndex.navBtns % paletaNeon.length];
    if (prevBtn) {
        prevBtn.style.color = rgbToString(navColor.r, navColor.g, navColor.b);
        prevBtn.style.borderColor = rgbToString(navColor.r, navColor.g, navColor.b);
    }
    if (nextBtn) {
        nextBtn.style.color = rgbToString(navColor.r, navColor.g, navColor.b);
        nextBtn.style.borderColor = rgbToString(navColor.r, navColor.g, navColor.b);
    }
    if (fullscreenBtn) {
        fullscreenBtn.style.color = rgbToString(navColor.r, navColor.g, navColor.b);
        fullscreenBtn.style.borderColor = rgbToString(navColor.r, navColor.g, navColor.b);
    }
    
    // 8. Botões Neon (Selecionar Pasta)
    const btnColor = paletaNeon[colorIndex.neonBtns % paletaNeon.length];
    allNeonBtns.forEach(btn => {
        btn.style.color = rgbToString(btnColor.r, btnColor.g, btnColor.b);
        btn.style.borderColor = rgbToString(btnColor.r, btnColor.g, btnColor.b);
    });
    
    // 9. Botão Play (cor diferente!)
    const playColor = paletaNeon[colorIndex.playBtn % paletaNeon.length];
    if (btnPlay) {
        btnPlay.style.color = rgbToString(playColor.r, playColor.g, playColor.b);
        btnPlay.style.borderColor = rgbToString(playColor.r, playColor.g, playColor.b);
        btnPlay.style.textShadow = getGlow(playColor.r, playColor.g, playColor.b);
    }
    
    // 10. Slider do Volume
    const sliderColor = paletaNeon[(colorIndex.volumeIcon + 2) % paletaNeon.length];
    let style = document.getElementById('dynamic-thumb-style');
    if (style) style.remove();
    style = document.createElement('style');
    style.id = 'dynamic-thumb-style';
    style.textContent = `input[type="range"]::-webkit-slider-thumb { 
        background: ${rgbToString(sliderColor.r, sliderColor.g, sliderColor.b)}; 
        box-shadow: 0 0 8px ${rgbToString(sliderColor.r, sliderColor.g, sliderColor.b)};
        transition: all 0.2s ease;
    }`;
    document.head.appendChild(style);
    
    // 11. Itens ativos na lista
    const activeColor = paletaNeon[colorIndex.activeItem % paletaNeon.length];
    const activeListItems = document.querySelectorAll('.video-list li.active');
    activeListItems.forEach(item => {
        item.style.color = rgbToString(activeColor.r, activeColor.g, activeColor.b);
        item.style.borderLeftColor = rgbToString(activeColor.r, activeColor.g, activeColor.b);
        item.style.textShadow = getGlow(activeColor.r, activeColor.g, activeColor.b);
    });
}

// --- AVANÇA TODAS AS CORES SIMULTANEAMENTE ---
function advanceAllColors() {
    colorIndex.logoNeon++;
    colorIndex.logoOn++;
    colorIndex.dropIcon++;
    colorIndex.volumeIcon++;
    colorIndex.timeDisplay++;
    colorIndex.autoplayBtn++;
    colorIndex.navBtns++;
    colorIndex.neonBtns++;
    colorIndex.playBtn++;
    colorIndex.activeItem++;
    
    applyAllColors();
    
    // Log no console (opcional)
    const currentColors = {
        Neon: paletaNeon[colorIndex.logoNeon % paletaNeon.length].name,
        On: paletaNeon[colorIndex.logoOn % paletaNeon.length].name,
        Play: paletaNeon[colorIndex.playBtn % paletaNeon.length].name
    };
    console.log(`🎨 Neon:${currentColors.Neon} | On:${currentColors.On} | Play:${currentColors.Play}`);
}

// --- INICIA O LOOP DE CORES ---
function startAutoColor() {
    if (colorInterval) clearInterval(colorInterval);
    colorInterval = setInterval(advanceAllColors, 2000); // Troca a cada 2 segundos
}

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
        applyAllColors(); // Reaplica cores após mudar lista
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

// --- CONTROLES ---
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
        autoplayBtn.title = 'Autoplay: Ligado';
    } else {
        autoplayBtn.style.color = '#8888aa';
        autoplayBtn.style.textShadow = 'none';
        autoplayBtn.style.borderColor = 'transparent';
        autoplayBtn.title = 'Autoplay: Desligado';
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

// --- BOTÃO RESET ---
btnReset.addEventListener('click', resetPlayer);

function resetPlayer() {
    // Confirmação antes de resetar
    if (mediaFiles.length === 0) return;
    
    if (confirm('Deseja limpar a lista e recomeçar?')) {
        // Limpa arquivos
        mediaFiles = [];
        currentIndex = -1;
        
        // Para o vídeo
        videoPlayer.pause();
        videoPlayer.src = '';
        videoPlayer.style.display = 'none';
        
        // Limpa imagem
        imageViewer.src = '';
        imageViewer.style.display = 'none';
        
        // Reseta display
        timeDisplay.textContent = '00:00 / 00:00';
        btnPlay.innerHTML = '▶';
        
        // Mostra overlay novamente
        dropOverlay.style.display = 'flex';
        videoContainer.classList.remove('has-video');
        
        // Atualiza lista
        updateMediaList();
        
        // Limpa pasta atual
        currentFolder = null;
        
        // Remove pasta salva (se tiver)
        localStorage.removeItem('neonon_last_folder');
        
        // Remove botão de volume colorido (se tiver)
        const style = document.getElementById('dynamic-thumb-style');
        if (style) style.remove();
    }
}

// --- DRAG & DROP ---
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

// --- ATALHOS DE TECLADO ---
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

// Aplica cores iniciais
applyAllColors();

// INICIA O LOOP DE CORES (cada elemento com sua própria cor!)
startAutoColor();

console.log('%c✨ NeonOn - Desenvolvido por Misa ✨', 'color: #ff66cc; font-size: 14px;');
console.log('%c🌈 CADA ELEMENTO tem sua PRÓPRIA COR neon!', 'color: #ffcc00; font-size: 12px;');
console.log('%c🎨 Neon, On, Play, Volume, Tempo... tudo com cores diferentes mudando juntas!', 'color: #00ff88; font-size: 11px;');
console.log('%c🔄 Botão RESET adicionado! Clique em ⟲ para limpar e recomeçar.', 'color: #ff3366; font-size: 11px;');