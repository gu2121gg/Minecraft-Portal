// Script principal - integração de todos os módulos
document.addEventListener('DOMContentLoaded', function() {
    Utils.log('info', 'Aplicação iniciando...');
    
    // Elementos do DOM
    const loadingScreen = document.getElementById('loading-screen');
    const loginScreen = document.getElementById('login-screen');
    const mainContent = document.getElementById('main-content');
    const progressFill = document.querySelector('.progress-fill');
    const progressPercentage = document.querySelector('.progress-percentage');
    const loadingVideo = document.getElementById('loading-video');
    const loginVideo = document.getElementById('login-video');
    
    // Variáveis de controle
    let progress = 0;
    let loadingComplete = false;
    let resourcesLoaded = {
        dom: false,
        loadingVideo: false,
        firstMainVideo: false,
        css: false,
        fonts: false
    };
    
    // Gerenciadores
    let authManager;
    let videoManager;
    let portalManager;
    let dataManager;
    
    // Função para atualizar progresso
    function updateProgress(percent) {
        progressFill.style.width = percent + '%';
        progressPercentage.textContent = Math.floor(percent) + '%';
    }
    
    // Função para completar carregamento
    function completeLoading() {
        loadingScreen.classList.add('fade-out');
        
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            loginScreen.classList.add('show');
            
            loginVideo.play().catch(error => {
                Utils.log('warn', 'Autoplay do vídeo de login bloqueado:', error);
            });
        }, CONFIG.ANIMATION.FADE_OUT);
    }
    
    // Rastreamento de carregamento
    function trackRealLoading() {
        let totalResources = Object.keys(resourcesLoaded).length;
        let loadedCount = 0;

        function updateRealProgress() {
            loadedCount = Object.values(resourcesLoaded).filter(Boolean).length;
            progress = (loadedCount / totalResources) * 100;
            updateProgress(progress);

            if (progress >= 100 && !loadingComplete) {
                loadingComplete = true;
                setTimeout(() => {
                    completeLoading();
                }, CONFIG.ANIMATION.TRANSITION);
            }
        }

        resourcesLoaded.dom = true;
        updateRealProgress();

        return updateRealProgress;
    }
    
    // Pré-carregar vídeos
    function preloadVideos(updateProgressCallback) {
        // Vídeo de loading
        loadingVideo.addEventListener('loadeddata', function() {
            resourcesLoaded.loadingVideo = true;
            updateProgressCallback();
        }, { once: true });

        loadingVideo.addEventListener('canplaythrough', function() {
            if (!resourcesLoaded.loadingVideo) {
                resourcesLoaded.loadingVideo = true;
                updateProgressCallback();
            }
        }, { once: true });

        // Primeiro vídeo principal
        if (videoManager) {
            videoManager.loadFirstVideo().then(() => {
                resourcesLoaded.firstMainVideo = true;
                updateProgressCallback();
            });
        }

        loadingVideo.load();
        
        if (loadingVideo.readyState >= 3) {
            resourcesLoaded.loadingVideo = true;
            updateProgressCallback();
        }
    }
    
    // Verificar estilos e fontes
    function checkStylesAndFonts(updateProgressCallback) {
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            resourcesLoaded.css = true;
            updateProgressCallback();
        }

        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(function() {
                resourcesLoaded.fonts = true;
                updateProgressCallback();
            });
        } else {
            setTimeout(() => {
                resourcesLoaded.fonts = true;
                updateProgressCallback();
            }, 100);
        }
    }
    
    // Garantir autoplay
    function ensureAutoplay() {
        loadingVideo.play().catch(function(error) {
            Utils.log('warn', 'Autoplay do vídeo de carregamento bloqueado:', error);
        });
    }
    
    // Inicializar gerenciadores
    function initializeManagers() {
        try {
            // Gerenciador de dados
            dataManager = new DataManager();
            window.dataManager = dataManager;
            
            // Gerenciador de vídeo
            videoManager = new VideoManager();
            window.videoManager = videoManager;
            
            // Gerenciador de portal
            portalManager = new PortalManager();
            window.portalManager = portalManager;
            
            // Gerenciador de autenticação
            authManager = new AuthManager();
            window.authManager = authManager;
            
            // Gerenciador de skins
            const skinManager = new SkinManager();
            window.skinManager = skinManager;
            
            // Reinicializar ícones após carregar todos os gerenciadores
            setTimeout(() => {
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                    Utils.log('info', 'Ícones Lucide reinicializados');
                }
            }, 500);
            
            Utils.log('info', 'Gerenciadores inicializados com sucesso');
            
        } catch (error) {
            Utils.log('error', 'Erro ao inicializar gerenciadores:', error);
        }
    }
    
    // Configurar menu do usuário
    function setupUserMenu() {
        const logoutBtn = document.getElementById('logout-btn');
        const userMenuBtn = document.getElementById('user-menu-btn');
        const userDisplayName = document.getElementById('user-display-name');
        const userDisplayEmail = document.getElementById('user-display-email');
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (authManager) {
                    authManager.logout();
                }
            });
        }
        
        // Atualizar informações do usuário
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                if (userDisplayName) {
                    userDisplayName.textContent = user.displayName || 'Usuário';
                }
                if (userDisplayEmail) {
                    userDisplayEmail.textContent = user.email;
                }
            }
        });
    }
    
    // Inicialização principal
    function initialize() {
        Utils.log('info', 'Iniciando carregamento...');
        
        // Inicializar gerenciadores
        initializeManagers();
        
        // Configurar menu
        setupUserMenu();
        
        // Rastreamento de carregamento
        const updateProgressCallback = trackRealLoading();
        
        // Garantir autoplay
        ensureAutoplay();
        
        // Verificar estilos
        checkStylesAndFonts(updateProgressCallback);
        
        // Pré-carregar vídeos
        preloadVideos(updateProgressCallback);
        
        // Fallback de segurança
        const connectionQuality = videoManager ? videoManager.connectionQuality : 'high';
        const fallbackTime = connectionQuality === 'low' ? CONFIG.LOADING.FALLBACK_LOW : 
                            connectionQuality === 'medium' ? CONFIG.LOADING.FALLBACK_MEDIUM : 
                            CONFIG.LOADING.FALLBACK_HIGH;
        
        setTimeout(() => {
            if (!loadingComplete) {
                Object.keys(resourcesLoaded).forEach(key => {
                    resourcesLoaded[key] = true;
                });
                updateProgressCallback();
            }
        }, fallbackTime);
    }
    
    // Pular carregamento com clique
    document.addEventListener('click', function skipLoading() {
        if (!loadingComplete) {
            progress = 100;
            updateProgress(100);
            setTimeout(completeLoading, CONFIG.ANIMATION.TRANSITION);
            loadingComplete = true;
        }
    }, { once: true });
    
    // Pular carregamento com ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && !loadingComplete) {
            progress = 100;
            updateProgress(100);
            setTimeout(completeLoading, CONFIG.ANIMATION.TRANSITION);
            loadingComplete = true;
        }
    });
    
    // Inicializar ícones Lucide
    function initLucideIcons() {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
            Utils.log('info', 'Ícones Lucide inicializados');
        }
    }
    
    // Observador para reinicializar ícones quando necessário
    const observer = new MutationObserver((mutations) => {
        let shouldReinitialize = false;
        
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && node.querySelector('[data-lucide]')) {
                        shouldReinitialize = true;
                    }
                });
            }
        });
        
        if (shouldReinitialize) {
            initLucideIcons();
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Callbacks do Firebase Auth
    window.onUserLoggedIn = (user) => {
        Utils.log('info', 'Usuário autenticado:', user.email);
        
        // Auto-login: se já está autenticado, pular para o portal
        const loginScreen = document.getElementById('login-screen');
        const loadingScreen = document.getElementById('loading-screen');
        
        if (loginScreen && !loginScreen.classList.contains('hidden')) {
            Utils.log('info', 'Auto-login detectado, entrando no portal...');
            Utils.showNotification(`Bem-vindo de volta, ${user.displayName || user.email}!`, 'success');
            
            setTimeout(() => {
                loginScreen.classList.remove('show');
                loginScreen.classList.add('hidden');
                
                if (window.portalManager) {
                    window.portalManager.show();
                }
            }, 1000);
        }
        
        // Analytics
        if (window.analytics) {
            window.analytics.logEvent('login', { method: 'email' });
        }
    };
    
    window.onUserLoggedOut = () => {
        Utils.log('info', 'Usuário deslogado');
        
        // Analytics
        if (window.analytics) {
            window.analytics.logEvent('logout');
        }
    };
    
    // Detecção de online/offline
    window.addEventListener('online', () => {
        Utils.showNotification('Conexão restaurada!', 'success');
        
        // Recarregar dados
        if (dataManager) {
            dataManager.invalidateCache();
        }
        if (portalManager) {
            portalManager.loadData();
        }
    });
    
    window.addEventListener('offline', () => {
        Utils.showNotification('Você está offline. Algumas funcionalidades podem estar limitadas.', 'warning');
    });
    
    // Detectar visibilidade da página
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // Página oculta - pausar vídeos
            if (videoManager) {
                videoManager.pauseAll();
            }
        } else {
            // Página visível - retomar vídeo atual
            if (videoManager && mainContent.classList.contains('show')) {
                videoManager.playCurrentVideo();
            }
            
            // Resetar timeout de sessão
            if (authManager) {
                authManager.resetSessionTimeout();
            }
        }
    });
    
    // Performance monitoring
    if (window.performance && window.performance.measure) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = window.performance.timing;
                const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
                const connectTime = perfData.responseEnd - perfData.requestStart;
                const renderTime = perfData.domComplete - perfData.domLoading;
                
                Utils.log('info', 'Performance Metrics:', {
                    pageLoadTime: `${pageLoadTime}ms`,
                    connectTime: `${connectTime}ms`,
                    renderTime: `${renderTime}ms`
                });
                
                // Analytics
                if (window.analytics) {
                    window.analytics.logEvent('performance', {
                        page_load_time: pageLoadTime,
                        connect_time: connectTime,
                        render_time: renderTime
                    });
                }
            }, 0);
        });
    }
    
    // Error handling global
    window.addEventListener('error', (event) => {
        Utils.log('error', 'Erro global:', {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
        });
        
        // Em produção, enviar para serviço de monitoramento
        if (!CONFIG.IS_DEV && window.analytics) {
            window.analytics.logEvent('exception', {
                description: event.message,
                fatal: false
            });
        }
    });
    
    window.addEventListener('unhandledrejection', (event) => {
        Utils.log('error', 'Promise rejeitada:', event.reason);
        
        if (!CONFIG.IS_DEV && window.analytics) {
            window.analytics.logEvent('exception', {
                description: event.reason.toString(),
                fatal: false
            });
        }
    });
    
    // Iniciar aplicação
    initialize();
    
    // Inicializar ícones após um delay
    setTimeout(() => {
        initLucideIcons();
    }, 500);
    
    Utils.log('info', 'Aplicação pronta!');
});
