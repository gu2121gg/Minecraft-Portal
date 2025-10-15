// Módulo de Gerenciamento de Vídeos
class VideoManager {
    constructor() {
        this.currentVideoIndex = 0;
        this.loadedVideos = new Set();
        this.loadingVideos = new Set();
        this.connectionQuality = 'high';
        this.autoSwitchInterval = null;
        
        this.initElements();
        this.detectConnectionQuality();
        this.initEventListeners();
    }
    
    initElements() {
        this.mainVideos = document.querySelectorAll('.main-video');
        this.prevBtn = document.getElementById('prev-video');
        this.nextBtn = document.getElementById('next-video');
        this.videoCounter = document.getElementById('video-counter');
        this.videoLoadingIndicator = document.getElementById('video-loading');
        this.totalVideos = this.mainVideos.length;
    }
    
    detectConnectionQuality() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            const effectiveType = connection.effectiveType;
            
            if (effectiveType === 'slow-2g' || effectiveType === '2g') {
                this.connectionQuality = CONFIG.CONNECTION_QUALITY.LOW;
            } else if (effectiveType === '3g') {
                this.connectionQuality = CONFIG.CONNECTION_QUALITY.MEDIUM;
            } else {
                this.connectionQuality = CONFIG.CONNECTION_QUALITY.HIGH;
            }
            
            Utils.log('info', `Qualidade de conexão: ${this.connectionQuality} (${effectiveType})`);
            
            // Listener para mudanças na conexão
            connection.addEventListener('change', () => {
                this.detectConnectionQuality();
            });
        }
    }
    
    initEventListeners() {
        this.nextBtn.addEventListener('click', () => this.nextVideo());
        this.prevBtn.addEventListener('click', () => this.prevVideo());
        
        // Controle por teclado
        document.addEventListener('keydown', (e) => {
            const mainContent = document.getElementById('main-content');
            if (mainContent && mainContent.classList.contains('show')) {
                if (e.key === 'ArrowRight') {
                    this.nextVideo();
                } else if (e.key === 'ArrowLeft') {
                    this.prevVideo();
                }
            }
        });
    }
    
    async loadFirstVideo() {
        const firstVideo = this.mainVideos[0];
        
        return new Promise((resolve) => {
            const onLoaded = () => {
                this.loadedVideos.add(0);
                Utils.log('info', 'Primeiro vídeo carregado');
                resolve();
            };
            
            firstVideo.addEventListener('loadeddata', onLoaded, { once: true });
            firstVideo.load();
            
            if (firstVideo.readyState >= 3) {
                onLoaded();
            }
            
            // Timeout
            setTimeout(resolve, CONFIG.LOADING.VIDEO_TIMEOUT_HIGH);
        });
    }
    
    async loadVideoLazy(videoIndex, showIndicator = false) {
        if (this.loadedVideos.has(videoIndex) || this.loadingVideos.has(videoIndex)) {
            return Promise.resolve();
        }
        
        this.loadingVideos.add(videoIndex);
        const video = this.mainVideos[videoIndex];
        const source = video.querySelector('source');
        
        // Mostrar indicador se necessário
        if (showIndicator && !this.loadedVideos.has(videoIndex)) {
            this.videoLoadingIndicator.classList.remove('hidden');
        }
        
        return new Promise((resolve) => {
            // Otimizar preload baseado na conexão
            if (this.connectionQuality === CONFIG.CONNECTION_QUALITY.LOW) {
                video.preload = 'metadata';
            } else if (this.connectionQuality === CONFIG.CONNECTION_QUALITY.MEDIUM) {
                video.preload = 'metadata';
            } else {
                video.preload = 'auto';
            }
            
            // Carregar vídeo
            if (source.dataset.src && !source.src) {
                source.src = source.dataset.src;
                video.load();
            }
            
            const onLoaded = () => {
                this.loadedVideos.add(videoIndex);
                this.loadingVideos.delete(videoIndex);
                this.videoLoadingIndicator.classList.add('hidden');
                Utils.log('info', `Vídeo ${videoIndex + 1} carregado`);
                resolve();
            };
            
            const eventType = this.connectionQuality === CONFIG.CONNECTION_QUALITY.LOW ? 'loadstart' : 'loadeddata';
            video.addEventListener(eventType, onLoaded, { once: true });
            
            // Timeout adaptativo
            const timeout = this.connectionQuality === CONFIG.CONNECTION_QUALITY.LOW ? 
                CONFIG.LOADING.VIDEO_TIMEOUT_LOW : 
                this.connectionQuality === CONFIG.CONNECTION_QUALITY.MEDIUM ? 
                CONFIG.LOADING.VIDEO_TIMEOUT_MEDIUM : 
                CONFIG.LOADING.VIDEO_TIMEOUT_HIGH;
            
            setTimeout(() => {
                if (!this.loadedVideos.has(videoIndex)) {
                    onLoaded();
                }
            }, timeout);
        });
    }
    
    preloadNextVideo() {
        const nextIndex = (this.currentVideoIndex + 1) % this.totalVideos;
        this.loadVideoLazy(nextIndex);
    }
    
    async switchVideo(newIndex) {
        if (newIndex < 0 || newIndex >= this.totalVideos) return;
        
        // Desabilitar botões
        this.prevBtn.disabled = true;
        this.nextBtn.disabled = true;
        
        // Carregar vídeo se necessário
        const needsLoading = !this.loadedVideos.has(newIndex) && !this.loadingVideos.has(newIndex);
        if (needsLoading) {
            await this.loadVideoLazy(newIndex, true);
        }
        
        // Trocar vídeo ativo
        this.mainVideos[this.currentVideoIndex].classList.remove('active');
        this.currentVideoIndex = newIndex;
        this.mainVideos[this.currentVideoIndex].classList.add('active');
        
        // Atualizar contador
        this.videoCounter.textContent = `${this.currentVideoIndex + 1} / ${this.totalVideos}`;
        
        // Reproduzir
        this.playCurrentVideo();
        
        // Reabilitar botões
        this.prevBtn.disabled = false;
        this.nextBtn.disabled = false;
        
        // Pré-carregar próximo
        setTimeout(() => this.preloadNextVideo(), CONFIG.LOADING.PRELOAD_DELAY);
    }
    
    playCurrentVideo() {
        this.mainVideos[this.currentVideoIndex].play().catch((error) => {
            Utils.log('warn', 'Autoplay bloqueado:', error);
        });
    }
    
    nextVideo() {
        const nextIndex = (this.currentVideoIndex + 1) % this.totalVideos;
        this.switchVideo(nextIndex);
    }
    
    prevVideo() {
        const prevIndex = (this.currentVideoIndex - 1 + this.totalVideos) % this.totalVideos;
        this.switchVideo(prevIndex);
    }
    
    startAutoSwitch() {
        if (this.autoSwitchInterval) {
            clearInterval(this.autoSwitchInterval);
        }
        
        this.autoSwitchInterval = setInterval(() => {
            this.nextVideo();
        }, CONFIG.ANIMATION.VIDEO_AUTO_SWITCH);
    }
    
    stopAutoSwitch() {
        if (this.autoSwitchInterval) {
            clearInterval(this.autoSwitchInterval);
            this.autoSwitchInterval = null;
        }
    }
    
    pauseAll() {
        this.mainVideos.forEach(video => video.pause());
    }
    
    muteAll() {
        this.mainVideos.forEach(video => video.muted = true);
    }
    
    unmuteAll() {
        this.mainVideos.forEach(video => video.muted = false);
    }
}

// Exportar
window.VideoManager = VideoManager;
