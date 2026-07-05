// ============================================
// NOVAS FUNCIONALIDADES PROFISSIONAIS
// ============================================

// --- NOVOS ELEMENTOS ---
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const progressHandle = document.getElementById('progressHandle');
const btnSpeed = document.getElementById('btnSpeed');
const btnPip = document.getElementById('btnPip');
const searchInput = document.getElementById('searchInput');

// --- ESTADO DE VELOCIDADE ---
let playbackSpeed = 1;
const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

// --- FUNÇÃO PARA GERAR MINIATURA ---
async function generateThumbnail(file, index) {
    try {
        const fileData = await file.getFile();
        const url = URL.createObjectURL(fileData);
        const ext = '.' + file.name.split('.').pop().toLowerCase();
        const isImage = imageExtensions.includes(ext);
        
        if (isImage) {
            return `<img src="${url}" class="thumbnail" loading="lazy">`;
        } else {
            // Para vídeos, usar canvas para capturar frame
            return new Promise((resolve) => {
                const video = document.createElement('video');
                video.src = url;
                video.muted = true;
                video.crossOrigin = 'anonymous';
                
                video.addEventListener('loadeddata', () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = 80;
                    canvas.height = 45;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    resolve(`<img src="${canvas.toDataURL()}" class="thumbnail" loading="lazy">`);
                    URL.revokeObjectURL(url);
                });
                
                video.load();
            });
        }
    } catch (e) {
        return `<div class="thumbnail" style="display:flex;align-items:center;justify-content:center;font-size:20px;">🎬</div>`;
    }
}

// --- ATUALIZAR LISTA COM MINIATURAS ---
async function updateMediaList() {
    videoList.innerHTML = '';
    if (mediaFiles.length === 0) {
        videoList.innerHTML = '<li class="empty-state">Nenhum arquivo encontrado</li>';
        videoCounter.textContent = '';
        return;
    }
    
    const searchTerm = searchInput.value.toLowerCase();
    const filteredFiles = mediaFiles.filter((file, index) => {
        return file.name.toLowerCase().includes(searchTerm);
    });
    
    if (filteredFiles.length === 0) {
        videoList.innerHTML = '<li class="empty-state">Nenhum arquivo encontrado</li>';
        videoCounter.textContent = `${mediaFiles.length} arquivo${mediaFiles.length !== 1 ? 's' : ''}`;
        return;
    }
    
    for (let i = 0; i < filteredFiles.length; i++) {
        const file = filteredFiles[i];
        const originalIndex = mediaFiles.indexOf(file);
        const li = document.createElement('li');
        
        const ext = '.' + file.name.split('.').pop().toLowerCase();
        const isImage = imageExtensions.includes(ext);
        const icon = isImage ? '🖼️' : '🎬';
        
        // Gerar miniatura
        const thumbnailHTML = await generateThumbnail(file, originalIndex);
        
        li.innerHTML = `
            ${thumbnailHTML}
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-duration">${isImage ? 'Imagem' : 'Vídeo'}</div>
            </div>
        `;
        
        li.addEventListener('click', () => playMedia(originalIndex));
        if (originalIndex === currentIndex) li.classList.add('active');
        videoList.appendChild(li);
    }
    
    videoCounter.textContent = `${mediaFiles.length} arquivo${mediaFiles.length !== 1 ? 's' : ''}`;
}

// --- BARRA DE PROGRESSO ---
let isDragging = false;

function updateProgress() {
    if (videoPlayer.duration && !isDragging) {
        const percent = (videoPlayer.currentTime / videoPlayer.duration) * 100;
        progressFill.style.width = `${percent}%`;
        progressHandle.style.left = `${percent}%`;
    }
}

videoPlayer.addEventListener('timeupdate', updateProgress);

// Clique na barra de progresso
progressBar.addEventListener('click', (e) => {
    const rect = progressBar.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    videoPlayer.currentTime = x * videoPlayer.duration;
    updateProgress();
});

// Arrastar na barra de progresso
progressBar.addEventListener('mousedown', (e) => {
    isDragging = true;
    updateProgressOnDrag(e);
});

document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        updateProgressOnDrag(e);
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});

function updateProgressOnDrag(e) {
    const rect = progressBar.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    progressFill.style.width = `${x * 100}%`;
    progressHandle.style.left = `${x * 100}%`;
    if (videoPlayer.duration) {
        videoPlayer.currentTime = x * videoPlayer.duration;
    }
}

// --- CONTROLE DE VELOCIDADE ---
btnSpeed.addEventListener('click', () => {
    const currentIndex = speedOptions.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speedOptions.length;
    playbackSpeed = speedOptions[nextIndex];
    videoPlayer.playbackRate = playbackSpeed;
    btnSpeed.textContent = `${playbackSpeed}x`;
    saveConfig();
});

// --- PICTURE-IN-PICTURE ---
btnPip.addEventListener('click', async () => {
    try {
        if (document.pictureInPictureElement) {
            await document.exitPictureInPicture();
        } else {
            await videoPlayer.requestPictureInPicture();
        }
    } catch (e) {
        // Fallback ou mensagem de erro
    }
});

videoPlayer.addEventListener('enterpictureinpicture', () => {
    btnPip.style.color = '#00ff88';
});

videoPlayer.addEventListener('leavepictureinpicture', () => {
    btnPip.style.color = '';
});

// --- PESQUISA ---
searchInput.addEventListener('input', updateMediaList);

// --- PERSISTÊNCIA DA ÚLTIMA PASTA ---
const LAST_FOLDER_KEY = 'neonon_last_folder';

async function saveLastFolder() {
    if (currentFolder) {
        try {
            localStorage.setItem(LAST_FOLDER_KEY, JSON.stringify({
                name: currentFolder.name,
                id: currentFolder.id
            }));
        } catch (e) {}
    }
}

async function loadLastFolder() {
    try {
        const saved = localStorage.getItem(LAST_FOLDER_KEY);
        if (saved) {
            const { name, id } = JSON.parse(saved);
            const dirs = await window.showDirectoryPicker();
            // Verificar se é a mesma pasta
            if (dirs.name === name) {
                await loadMediaFromFolder(dirs);
            }
        }
    } catch (e) {
        // Não carregar automaticamente se falhar
    }
}

// Sobrescrever loadMediaFromFolder para salvar
const originalLoadMedia = loadMediaFromFolder;
loadMediaFromFolder = async function(dirHandle) {
    await originalLoadMedia(dirHandle);
    await saveLastFolder();
};

// --- SALVAR CONFIGURAÇÃO COMPLETA ---
function saveConfig() {
    const config = { 
        autoplay: autoplay, 
        volume: parseInt(volumeSlider.value),
        speed: playbackSpeed
    };
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

function loadConfig() {
    try {
        const saved = localStorage.getItem(CONFIG_KEY);
        if (saved) {
            const config = JSON.parse(saved);
            autoplay = config.autoplay ?? true;
            volumeSlider.value = config.volume ?? 100;
            videoPlayer.volume = volumeSlider.value / 100;
            playbackSpeed = config.speed ?? 1;
            videoPlayer.playbackRate = playbackSpeed;
            btnSpeed.textContent = `${playbackSpeed}x`;
        }
    } catch (e) {}
}

// --- ATUALIZAR ATALHOS DE TECLADO ---
document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    switch(e.key) {
        case ' ': if (imageViewer.style.display !== 'block') { e.preventDefault(); togglePlay(); } break;
        case 'ArrowLeft': e.preventDefault(); btnPrev.click(); break;
        case 'ArrowRight': e.preventDefault(); btnNext.click(); break;
        case 'f': case 'F': e.preventDefault(); btnFullscreen.click(); break;
        case 'p': case 'P': e.preventDefault(); btnPip.click(); break;
        case 'ArrowUp': e.preventDefault(); volumeSlider.value = Math.min(100, parseInt(volumeSlider.value) + 5); videoPlayer.volume = volumeSlider.value / 100; saveConfig(); break;
        case 'ArrowDown': e.preventDefault(); volumeSlider.value = Math.max(0, parseInt(volumeSlider.value) - 5); videoPlayer.volume = volumeSlider.value / 100; saveConfig(); break;
        case 's': case 'S': e.preventDefault(); btnSpeed.click(); break;
    }
});

// --- INICIALIZAÇÃO COM CARREGAMENTO AUTOMÁTICO ---
loadConfig();
updateAutoplayButton();
updatePlayButton();
applyAllColors();
startAutoColor();

// Tentar carregar última pasta
if (window.showDirectoryPicker) {
    loadLastFolder();
}

console.log('%c✨ NeonOn Profissional - Desenvolvido por Misa ✨', 'color: #ff66cc; font-size: 14px;');
console.log('%c🚀 Novas funcionalidades: Barra de Progresso, Velocidade, PIP, Miniaturas, Pesquisa e Pasta Persistente!', 'color: #00ff88; font-size: 12px;');