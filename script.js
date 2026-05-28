// ============================================
// NEONON - SCRIPT PRINCIPAL
// Gerencia: carregamento de pasta, playback,
// navegação entre vídeos, atalhos de teclado,
// drag & drop e persistência de configurações
// Produzido por: Misa
// ============================================

// --- ELEMENTOS DOM ---
// Referências para todos os elementos HTML que manipulamos
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

// --- ESTADO DA APLICAÇÃO ---
let videos = [];           // Array de FileSystemFileHandle (arquivos de vídeo)
let currentIndex = -1;     // Índice do vídeo atual (-1 = nenhum)
let autoplay = true;       // Avançar automaticamente ao terminar?
let currentFolder = null;  // FileSystemDirectoryHandle da pasta atual

// --- CONFIGURAÇÃO PERSISTENTE (localStorage) ---
const CONFIG_KEY = 'neonon_config';

/*
 * Carrega configurações salvas: autoplay e volume.
 * Se não houver config salva ou estiver corrompida, usa valores padrão.
 */
function loadConfig() {
    try {
        const saved = localStorage.getItem(CONFIG_KEY);
        if (saved) {
            const config = JSON.parse(saved);
            autoplay = config.autoplay ?? true;         // Default: ligado
            volumeSlider.value = config.volume ?? 100;  // Default: 100%
            videoPlayer.volume = volumeSlider.value / 100;
            updateAutoplayButton();  // Atualiza aparência do botão
        }
    } catch (e) {
        // Config corrompida ou inexistente — mantém defaults
        console.log('Config resetada para padrões.');
    }
}

/*
 * Salva autoplay e volume no localStorage para persistir entre sessões.
 */
function saveConfig() {
    const config = {
        autoplay: autoplay,
        volume: parseInt(volumeSlider.value)
    };
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

// --- SELEÇÃO DE PASTA ---
// Abre o seletor de pasta nativo do Windows ao clicar no botão
btnSelectFolder.addEventListener('click', selectFolder);

async function selectFolder() {
    try {
        // API File System Access: abre diálogo de seleção de pasta
        const dirHandle = await window.showDirectoryPicker();
        currentFolder = dirHandle;
        await loadVideosFromFolder(dirHandle);
    } catch (err) {
        // AbortError = usuário fechou o diálogo — ignoramos silenciosamente
        if (err.name !== 'AbortError') {
            console.error('Erro ao selecionar pasta:', err);
            alert('Erro ao acessar a pasta. Verifique as permissões.');
        }
    }
}

/*
 * Percorre todos os arquivos da pasta selecionada.
 * Filtra apenas extensões de vídeo suportadas.
 * Ordena alfabeticamente (com suporte a números naturais).
 */
async function loadVideosFromFolder(dirHandle) {
    videos = [];
    // Extensões suportadas pelo elemento <video> HTML5 + formatos comuns
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.wmv', '.flv', '.m4v'];
    
    // Itera sobre todas as entradas da pasta (arquivos e subpastas)
    for await (const entry of dirHandle.values()) {
        if (entry.kind === 'file') {
            const ext = '.' + entry.name.split('.').pop().toLowerCase();
            if (videoExtensions.includes(ext)) {
                videos.push(entry);  // Armazena o FileSystemFileHandle
            }
        }
    }
    
    // Ordena alfabeticamente com suporte a números (ex: "vídeo 2" vem antes de "vídeo 10")
    videos.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { numeric: true }));
    
    updateVideoList();
    
    // Se encontrou vídeos, inicia o primeiro automaticamente
    if (videos.length > 0) {
        playVideo(0);
    }
}

/*
 * Reconstrói a lista <ul> com os nomes dos vídeos.
 * Adiciona evento de clique em cada item para reproduzir o vídeo.
 */
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
    
    // Atualiza contador no rodapé da sidebar
    videoCounter.textContent = `${videos.length} vídeo${videos.length > 1 ? 's' : ''}`;
}

// --- PLAYBACK DE VÍDEO ---

/*
 * Carrega e reproduz o vídeo no índice especificado.
 * Cria URL temporária a partir do FileSystemFileHandle.
 * Gerencia limpeza de URL anterior para evitar vazamento de memória.
 */
async function playVideo(index) {
    if (index < 0 || index >= videos.length) return;
    
    currentIndex = index;
    const file = videos[index];
    
    try {
        // Converte FileSystemFileHandle → File → URL blob
        const fileData = await file.getFile();
        const url = URL.createObjectURL(fileData);
        
        // Libera memória da URL anterior antes de criar nova
        if (videoPlayer.src) {
            URL.revokeObjectURL(videoPlayer.src);
        }
        
        videoPlayer.src = url;
        videoPlayer.load();
        videoPlayer.style.display = 'block';
        videoContainer.classList.add('has-video');
        dropOverlay.style.display = 'none';  // Esconde overlay de drop
        
        updateVideoList();
        highlightCurrentInList();
        
        videoPlayer.play();
        updatePlayButton();
        
        // Garante que o vídeo se ajuste ao container após carregar metadados
        videoPlayer.addEventListener('loadedmetadata', () => {
            videoPlayer.style.maxWidth = '100%';
            videoPlayer.style.maxHeight = '100%';
        }, { once: true });  // Executa uma vez e remove o listener
        
    } catch (err) {
        console.error('Erro ao carregar vídeo:', err);
    }
}

/*
 * Destaca o item atual na lista e faz scroll até ele.
 */
function highlightCurrentInList() {
    const items = videoList.querySelectorAll('li');
    items.forEach((item, i) => {
        if (i === currentIndex) {
            item.classList.add('active');
            // Scroll suave para garantir visibilidade
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            item.classList.remove('active');
        }
    });
}

// --- CONTROLES DE PLAYBACK ---

// Play/Pause: tanto o botão quanto clique no vídeo
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

// Alterna ícone entre ▶ (play) e ❚❚ (pause)
function updatePlayButton() {
    if (videoPlayer.paused) {
        btnPlay.innerHTML = '▶';
    } else {
        btnPlay.innerHTML = '❚❚';
    }
}

// Navegação: vídeo anterior e próximo (cíclicos)
btnPrev.addEventListener('click', playPrevious);
btnNext.addEventListener('click', playNext);

function playPrevious() {
    if (videos.length === 0) return;
    // Se estiver no primeiro, vai para o último (loop)
    const newIndex = currentIndex > 0 ? currentIndex - 1 : videos.length - 1;
    playVideo(newIndex);
}

function playNext() {
    if (videos.length === 0) return;
    // Se estiver no último, vai para o primeiro (loop)
    const newIndex = currentIndex < videos.length - 1 ? currentIndex + 1 : 0;
    playVideo(newIndex);
}

// --- AUTOPLAY ---
// Ativa/desativa avanço automático ao término do vídeo
btnToggleAutoplay.addEventListener('click', toggleAutoplay);

function toggleAutoplay() {
    autoplay = !autoplay;
    updateAutoplayButton();
    saveConfig();  // Persiste preferência
}

// Atualiza aparência: verde neon = ligado, cinza = desligado
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

// Quando um vídeo termina, avança automaticamente (se autoplay ativo)
videoPlayer.addEventListener('ended', () => {
    if (autoplay && videos.length > 1) {
        playNext();
    } else {
        updatePlayButton();  // Volta ícone para play
    }
});

// --- VOLUME ---
// Slider controla volume em tempo real
volumeSlider.addEventListener('input', () => {
    videoPlayer.volume = volumeSlider.value / 100;  // Converte 0-100 para 0-1
    saveConfig();  // Persiste preferência
});

// --- EXIBIÇÃO DE TEMPO ---
// Atualiza a cada frame (timeupdate dispara ~4x/segundo)
videoPlayer.addEventListener('timeupdate', updateTimeDisplay);

function updateTimeDisplay() {
    const current = formatTime(videoPlayer.currentTime);
    const duration = formatTime(videoPlayer.duration);
    timeDisplay.textContent = `${current} / ${duration}`;
}

// Formata segundos para MM:SS (ex: 125s → "02:05")
function formatTime(seconds) {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// --- TELA CHEIA ---
btnFullscreen.addEventListener('click', toggleFullscreen);

function toggleFullscreen() {
    if (document.fullscreenElement) {
        document.exitFullscreen();        // Sai da tela cheia
    } else {
        videoContainer.requestFullscreen(); // Entra em tela cheia (só o container)
    }
}

// --- DRAG & DROP ---
// Permite arrastar uma pasta diretamente para o player

// dragover: previne comportamento padrão e adiciona classe visual
document.addEventListener('dragover', (e) => {
    e.preventDefault();
    document.body.classList.add('dragover');
});

// dragleave: remove classe visual quando sai da janela
document.addEventListener('dragleave', (e) => {
    e.preventDefault();
    if (e.relatedTarget === null) {
        document.body.classList.remove('dragover');
    }
});

// drop: processa a pasta solta
document.addEventListener('drop', async (e) => {
    e.preventDefault();
    document.body.classList.remove('dragover');
    
    const items = e.dataTransfer.items;
    if (!items) return;
    
    // Procura por uma pasta nos itens arrastados
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
    
    // Se arrastou arquivos soltos em vez de pasta, avisa
    const files = [...e.dataTransfer.files].filter(f => f.type.startsWith('video/'));
    if (files.length > 0) {
        alert('Para melhor experiência, arraste uma pasta inteira com vídeos.');
    }
});

// --- ATALHOS DE TECLADO ---
document.addEventListener('keydown', (e) => {
    // Ignora atalhos se o foco estiver em campo de input
    if (e.target.tagName === 'INPUT') return;
    
    switch(e.key) {
        case ' ':                // Espaço → Play/Pause
            e.preventDefault();
            togglePlay();
            break;
        case 'ArrowLeft':        // ← Vídeo anterior
            e.preventDefault();
            playPrevious();
            break;
        case 'ArrowRight':       // → Próximo vídeo
            e.preventDefault();
            playNext();
            break;
        case 'f':                // F → Tela cheia
        case 'F':
            e.preventDefault();
            toggleFullscreen();
            break;
        case 'ArrowUp':          // ↑ Aumenta volume em 5%
            e.preventDefault();
            volumeSlider.value = Math.min(100, parseInt(volumeSlider.value) + 5);
            videoPlayer.volume = volumeSlider.value / 100;
            saveConfig();
            break;
        case 'ArrowDown':        // ↓ Diminui volume em 5%
            e.preventDefault();
            volumeSlider.value = Math.max(0, parseInt(volumeSlider.value) - 5);
            videoPlayer.volume = volumeSlider.value / 100;
            saveConfig();
            break;
    }
});

// --- REDIMENSIONAMENTO DA JANELA ---
// Mantém vídeo ajustado ao container quando a janela é redimensionada
window.addEventListener('resize', () => {
    if (videoPlayer.src && !videoPlayer.paused) {
        videoPlayer.style.maxWidth = '100%';
        videoPlayer.style.maxHeight = '100%';
    }
});

// --- INICIALIZAÇÃO ---
// Carrega preferências salvas e configura estado inicial dos botões
loadConfig();
updateAutoplayButton();
updatePlayButton();
updateTimeDisplay();

// Mensagem no console com identidade visual (apenas para desenvolvedor)
console.log('%cNeonOn %cready',
    'color: #00ff88; font-size: 16px; text-shadow: 0 0 10px rgba(0,255,136,0.5);',
    'color: #e0e0e0;');
console.log('%cSelecione uma pasta para começar.',
    'color: #8888aa; font-style: italic;');