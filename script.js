const videoPlayer = document.getElementById('videoPlayer');
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

let videos = [];
let currentIndex = -1;
let autoplay = true;
let currentFolder = null;

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

btnSelectFolder.addEventListener('click', selectFolder);

async function selectFolder() {
    try {
        const dirHandle = await window.showDirectoryPicker();
        currentFolder = dirHandle;
        await loadVideosFromFolder(dirHandle);
    } catch (err) {
        if (err.name !== 'AbortError') {
            console.error('Erro ao selecionar pasta:', err);
            alert('Erro ao acessar a pasta. Verifique as permissões.');
        }
    }
}

async function loadVideosFromFolder(dirHandle) {
    videos = [];
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.wmv', '.flv', '.m4v'];
    
    for await (const entry of dirHandle.values()) {
        if (entry.kind === 'file') {
            const ext = '.' + entry.name.split('.').pop().toLowerCase();
            if (videoExtensions.includes(ext)) {
                videos.push(entry);
            }
        }
    }
    
    videos.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { numeric: true }));
    
    updateVideoList();
    
    if (videos.length > 0) {
        playVideo(0);
    }
}

function updateVideoList() {
    videoList.innerHTML = '';
    
    if (videos.length === 0) {
        videoList.innerHTML = '<li class="empty-state">Nenhum vídeo encontrado</li>';
        videoCounter.textContent = '';
        return;
    }
    
    videos.forEach((file, index) => {
        const li = document.createElement('li');
        li.textContent = file.name;
        li.addEventListener('click', () => playVideo(index));
        if (index === currentIndex) li.classList.add('active');
        videoList.appendChild(li);
    });
    
    videoCounter.textContent = `${videos.length} vídeo${videos.length > 1 ? 's' : ''}`;
}

async function playVideo(index) {
    if (index < 0 || index >= videos.length) return;
    
    currentIndex = index;
    const file = videos[index];
    
    try {
        const fileData = await file.getFile();
        const url = URL.createObjectURL(fileData);
        
        if (videoPlayer.src) {
            URL.revokeObjectURL(videoPlayer.src);
        }
        
        videoPlayer.src = url;
        videoPlayer.load();
        videoPlayer.style.display = 'block';
        videoContainer.classList.add('has-video');
        dropOverlay.style.display = 'none';
        
        updateVideoList();
        highlightCurrentInList();
        
        videoPlayer.play();
        updatePlayButton();
        
        videoPlayer.addEventListener('loadedmetadata', () => {
            videoPlayer.style.maxWidth = '100%';
            videoPlayer.style.maxHeight = '100%';
        }, { once: true });
        
    } catch (err) {
        console.error('Erro ao carregar vídeo:', err);
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

btnPlay.addEventListener('click', togglePlay);
videoPlayer.addEventListener('click', togglePlay);

function togglePlay() {
    if (videoPlayer.paused) {
        videoPlayer.play();
    } else {
        videoPlayer.pause();
    }
    updatePlayButton();
}

function updatePlayButton() {
    if (videoPlayer.paused) {
        btnPlay.innerHTML = '&#9654;';
    } else {
        btnPlay.innerHTML = '&#10074;&#10074;';
    }
}

btnPrev.addEventListener('click', playPrevious);
btnNext.addEventListener('click', playNext);

function playPrevious() {
    if (videos.length === 0) return;
    const newIndex = currentIndex > 0 ? currentIndex - 1 : videos.length - 1;
    playVideo(newIndex);
}

function playNext() {
    if (videos.length === 0) return;
    const newIndex = currentIndex < videos.length - 1 ? currentIndex + 1 : 0;
    playVideo(newIndex);
}

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
    if (autoplay && videos.length > 1) {
        playNext();
    } else {
        updatePlayButton();
    }
});

volumeSlider.addEventListener('input', () => {
    videoPlayer.volume = volumeSlider.value / 100;
    saveConfig();
});

videoPlayer.addEventListener('timeupdate', updateTimeDisplay);

function updateTimeDisplay() {
    const current = formatTime(videoPlayer.currentTime);
    const duration = formatTime(videoPlayer.duration);
    timeDisplay.textContent = `${current} / ${duration}`;
}

function formatTime(seconds) {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

btnFullscreen.addEventListener('click', toggleFullscreen);

function toggleFullscreen() {
    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else {
        videoContainer.requestFullscreen();
    }
}

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
            if (entry.kind === 'directory') {
                currentFolder = entry;
                await loadVideosFromFolder(entry);
                return;
            }
        }
    }
    
    const files = [...e.dataTransfer.files].filter(f => f.type.startsWith('video/'));
    if (files.length > 0) {
        alert('Para melhor experiência, arraste uma pasta inteira com vídeos.');
    }
});

document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    
    switch(e.key) {
        case ' ':
            e.preventDefault();
            togglePlay();
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

window.addEventListener('resize', () => {
    if (videoPlayer.src && !videoPlayer.paused) {
        videoPlayer.style.maxWidth = '100%';
        videoPlayer.style.maxHeight = '100%';
    }
});

loadConfig();
updateAutoplayButton();
updatePlayButton();
updateTimeDisplay();

console.log('%cNeonOn %cready',
    'color: #00ff88; font-size: 16px; text-shadow: 0 0 10px rgba(0,255,136,0.5);',
    'color: #e0e0e0;');
console.log('%cSelecione uma pasta para começar.',
    'color: #8888aa; font-style: italic;');