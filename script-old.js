document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const loadingScreen = document.getElementById('loading-screen');
    const loginScreen = document.getElementById('login-screen');
    const mainContent = document.getElementById('main-content');
    const progressFill = document.querySelector('.progress-fill');
    const progressPercentage = document.querySelector('.progress-percentage');
    const loadingVideo = document.getElementById('loading-video');
    const loginVideo = document.getElementById('login-video');
    const mainVideos = document.querySelectorAll('.main-video');
    const prevBtn = document.getElementById('prev-video');
    const nextBtn = document.getElementById('next-video');
    const videoCounter = document.getElementById('video-counter');
    const videoLoadingIndicator = document.getElementById('video-loading');
    
    // Elementos do portal
    const navBtns = document.querySelectorAll('.nav-btn');
    const contentSections = document.querySelectorAll('.content-section');
    
    // Elementos do login
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const usernameInput = document.getElementById('username');
    const usernameGroup = document.getElementById('username-group');
    const authBtn = document.getElementById('auth-btn');
    const toggleModeBtn = document.getElementById('toggle-mode');
    const forgotPasswordLink = document.querySelector('.forgot-password');
    
    // Estado do formulário
    let isRegisterMode = false;
    
    // Controle de vídeos
    let currentVideoIndex = 0;
    const totalVideos = mainVideos.length;

    // Variáveis de controle
    let progress = 0;
    let loadingComplete = false;
    let resourcesLoaded = {
        dom: false,
        loadingVideo: false,
        firstMainVideo: false, // Apenas o primeiro vídeo principal
        css: false,
        fonts: false
    };
    
    // Controle de carregamento lazy
    let loadedVideos = new Set();
    let loadingVideos = new Set();
    
    // Detecção de qualidade de conexão
    let connectionQuality = 'high'; // high, medium, low
    
    function detectConnectionQuality() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            const effectiveType = connection.effectiveType;
            
            if (effectiveType === 'slow-2g' || effectiveType === '2g') {
                connectionQuality = 'low';
            } else if (effectiveType === '3g') {
                connectionQuality = 'medium';
            } else {
                connectionQuality = 'high';
            }
            
            console.log(`Qualidade de conexão detectada: ${connectionQuality} (${effectiveType})`);
        }
    }

    // Função para carregamento real baseado em recursos
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
                }, 300); // Transição mais rápida
            }
        }

        // DOM já carregado
        resourcesLoaded.dom = true;
        updateRealProgress();

        return updateRealProgress;
    }

    // Função para atualizar o progresso visual
    function updateProgress(percent) {
        progressFill.style.width = percent + '%';
        progressPercentage.textContent = Math.floor(percent) + '%';
    }

    // Função para completar o carregamento e mostrar login
    function completeLoading() {
        // Fade out da tela de carregamento
        loadingScreen.classList.add('fade-out');
        
        // Mostra a tela de login
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            loginScreen.classList.add('show');
            
            // Inicia o vídeo de login
            loginVideo.play().catch(error => {
                console.log('Autoplay do vídeo de login bloqueado:', error);
            });
        }, 1000);
    }
    
    // Função para completar o login e mostrar portal
    function completeLogin() {
        // Fade out da tela de login
        loginScreen.classList.remove('show');
        loginScreen.classList.add('hidden');
        
        // Mostra o conteúdo principal
        setTimeout(() => {
            mainContent.classList.remove('hidden');
            mainContent.classList.add('show');
            
            // Inicia o primeiro vídeo do portal
            playCurrentVideo();
        }, 1000);
    }

    // Função otimizada para carregar vídeos
    function preloadVideos(updateProgressCallback) {
        // Carrega o vídeo de carregamento (prioridade alta)
        loadingVideo.addEventListener('loadeddata', function() {
            resourcesLoaded.loadingVideo = true;
            updateProgressCallback();
        });

        loadingVideo.addEventListener('canplaythrough', function() {
            if (!resourcesLoaded.loadingVideo) {
                resourcesLoaded.loadingVideo = true;
                updateProgressCallback();
            }
        });

        // Carrega APENAS o primeiro vídeo principal durante o loading
        const firstVideo = mainVideos[0];
        
        firstVideo.addEventListener('loadeddata', function() {
            resourcesLoaded.firstMainVideo = true;
            loadedVideos.add(0);
            updateProgressCallback();
        });

        firstVideo.addEventListener('canplaythrough', function() {
            if (!resourcesLoaded.firstMainVideo) {
                resourcesLoaded.firstMainVideo = true;
                loadedVideos.add(0);
                updateProgressCallback();
            }
        });

        // Carrega apenas o primeiro vídeo
        firstVideo.load();
        
        if (firstVideo.readyState >= 3) {
            resourcesLoaded.firstMainVideo = true;
            loadedVideos.add(0);
            updateProgressCallback();
        }

        // Inicia carregamento do vídeo de loading
        loadingVideo.load();
        
        if (loadingVideo.readyState >= 3) {
            resourcesLoaded.loadingVideo = true;
            updateProgressCallback();
        }
    }

    // Função para lidar com erros de vídeo
    function handleVideoErrors() {
        loadingVideo.addEventListener('error', function() {
            console.warn('Erro ao carregar media1.mp4');
        });

        mainVideos.forEach((video, index) => {
            video.addEventListener('error', function() {
                console.warn(`Erro ao carregar media${index + 2}.mp4`);
            });
        });
    }

    // Função para garantir reprodução automática
    function ensureAutoplay() {
        // Para o vídeo de carregamento
        loadingVideo.play().catch(function(error) {
            console.log('Autoplay do vídeo de carregamento foi bloqueado:', error);
        });

        // Para os vídeos principais (será reproduzido quando aparecer)
        mainContent.addEventListener('transitionend', function() {
            if (mainContent.classList.contains('show')) {
                playCurrentVideo();
            }
        });
    }

    // Função para verificar carregamento de CSS e fontes
    function checkStylesAndFonts(updateProgressCallback) {
        // Verifica se CSS está carregado
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            resourcesLoaded.css = true;
            updateProgressCallback();
        } else {
            document.addEventListener('DOMContentLoaded', function() {
                resourcesLoaded.css = true;
                updateProgressCallback();
            });
        }

        // Verifica fontes (se houver)
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(function() {
                resourcesLoaded.fonts = true;
                updateProgressCallback();
            });
        } else {
            // Fallback para navegadores sem suporte a Font Loading API
            setTimeout(() => {
                resourcesLoaded.fonts = true;
                updateProgressCallback();
            }, 100);
        }
    }

    // Função de inicialização otimizada
    function initialize() {
        // Detecta qualidade da conexão
        detectConnectionQuality();
        
        // Inicia o tracking de carregamento real
        const updateProgressCallback = trackRealLoading();
        
        // Configura tratamento de erros
        handleVideoErrors();
        
        // Garante autoplay
        ensureAutoplay();
        
        // Verifica estilos e fontes
        checkStylesAndFonts(updateProgressCallback);
        
        // Pré-carrega os vídeos
        preloadVideos(updateProgressCallback);
        
        // Fallback de segurança adaptativo
        const fallbackTime = connectionQuality === 'low' ? 10000 : 
                            connectionQuality === 'medium' ? 7000 : 5000;
        
        setTimeout(() => {
            if (!loadingComplete) {
                Object.keys(resourcesLoaded).forEach(key => {
                    resourcesLoaded[key] = true;
                });
                updateProgressCallback();
            }
        }, fallbackTime);
    }

    // Adiciona listener para cliques (caso o usuário queira pular)
    document.addEventListener('click', function() {
        if (!loadingComplete) {
            progress = 100;
            updateProgress(100);
            setTimeout(completeLoading, 300);
            loadingComplete = true;
        }
    });

    // Controle por teclado unificado
    document.addEventListener('keydown', function(event) {
        // ESC para pular carregamento
        if (event.key === 'Escape' && !loadingComplete) {
            progress = 100;
            updateProgress(100);
            setTimeout(completeLoading, 300);
            loadingComplete = true;
            return;
        }
        
        // Controles de vídeo (apenas após carregamento)
        if (mainContent.classList.contains('show')) {
            if (event.key === 'ArrowRight') {
                nextVideo();
            } else if (event.key === 'ArrowLeft') {
                prevVideo();
            }
        }
    });

    // Função para carregar vídeo sob demanda com otimização de qualidade
    function loadVideoLazy(videoIndex, showIndicator = false) {
        if (loadedVideos.has(videoIndex) || loadingVideos.has(videoIndex)) {
            return Promise.resolve();
        }
        
        loadingVideos.add(videoIndex);
        const video = mainVideos[videoIndex];
        const source = video.querySelector('source');
        
        // Mostra indicador APENAS se solicitado E se o vídeo não está carregado
        if (showIndicator && !loadedVideos.has(videoIndex)) {
            videoLoadingIndicator.classList.remove('hidden');
            console.log(`Mostrando indicador para vídeo ${videoIndex + 1}`);
        }
        
        return new Promise((resolve) => {
            // Otimiza carregamento baseado na qualidade da conexão
            if (connectionQuality === 'low') {
                video.preload = 'metadata';
            } else if (connectionQuality === 'medium') {
                video.preload = 'metadata';
            } else {
                video.preload = 'auto';
            }
            
            // Carrega o vídeo
            if (source.dataset.src) {
                source.src = source.dataset.src;
                video.load();
            }
            
            const onLoaded = () => {
                loadedVideos.add(videoIndex);
                loadingVideos.delete(videoIndex);
                
                // Esconde indicador SEMPRE que um vídeo termina de carregar
                videoLoadingIndicator.classList.add('hidden');
                console.log(`Vídeo ${videoIndex + 1} carregado, escondendo indicador`);
                
                resolve();
            };
            
            // Para conexões lentas, aceita menos dados carregados
            const eventType = connectionQuality === 'low' ? 'loadstart' : 'loadeddata';
            video.addEventListener(eventType, onLoaded, { once: true });
            
            // Timeout adaptativo baseado na qualidade da conexão
            const timeout = connectionQuality === 'low' ? 15000 : 
                           connectionQuality === 'medium' ? 12000 : 8000;
            
            setTimeout(() => {
                if (!loadedVideos.has(videoIndex)) {
                    onLoaded();
                }
            }, timeout);
        });
    }
    
    // Função para pré-carregar próximo vídeo
    function preloadNextVideo() {
        const nextIndex = (currentVideoIndex + 1) % totalVideos;
        loadVideoLazy(nextIndex);
    }
    
    // Funções para controle de vídeos
    async function switchVideo(newIndex) {
        if (newIndex < 0 || newIndex >= totalVideos) return;
        
        // Desabilita botões durante carregamento
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        
        // Carrega o vídeo se necessário (mostra indicador apenas se realmente precisar carregar)
        const needsLoading = !loadedVideos.has(newIndex) && !loadingVideos.has(newIndex);
        if (needsLoading) {
            console.log(`Vídeo ${newIndex + 1} precisa ser carregado`);
        }
        await loadVideoLazy(newIndex, needsLoading);
        
        // Remove classe active do vídeo atual
        mainVideos[currentVideoIndex].classList.remove('active');
        
        // Atualiza índice
        currentVideoIndex = newIndex;
        
        // Adiciona classe active ao novo vídeo
        mainVideos[currentVideoIndex].classList.add('active');
        
        // Atualiza contador
        videoCounter.textContent = `${currentVideoIndex + 1} / ${totalVideos}`;
        
        // Reproduz o novo vídeo
        playCurrentVideo();
        
        // Reabilita botões
        prevBtn.disabled = false;
        nextBtn.disabled = false;
        
        // Pré-carrega o próximo vídeo em background
        setTimeout(preloadNextVideo, 2000);
    }
    
    function playCurrentVideo() {
        mainVideos[currentVideoIndex].play().catch(function(error) {
            console.log('Autoplay foi bloqueado:', error);
        });
    }
    
    function nextVideo() {
        const nextIndex = (currentVideoIndex + 1) % totalVideos;
        switchVideo(nextIndex);
    }
    
    function prevVideo() {
        const prevIndex = (currentVideoIndex - 1 + totalVideos) % totalVideos;
        switchVideo(prevIndex);
    }
    
    // Função para navegação entre seções
    function switchSection(sectionId) {
        console.log('Trocando para seção:', sectionId);
        
        // Remove active de todos os botões e seções
        navBtns.forEach(btn => btn.classList.remove('active'));
        contentSections.forEach(section => section.classList.remove('active'));
        
        // Ativa o botão e seção correspondentes
        const activeBtn = document.querySelector(`[data-section="${sectionId}"]`);
        const activeSection = document.getElementById(`${sectionId}-section`);
        
        console.log('Botão encontrado:', activeBtn);
        console.log('Seção encontrada:', activeSection);
        
        if (activeBtn && activeSection) {
            activeBtn.classList.add('active');
            activeSection.classList.add('active');
            console.log('Seção ativada:', sectionId);
        } else {
            console.error('Botão ou seção não encontrada para:', sectionId);
        }
    }
    
    // Event listeners para navegação
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const sectionId = btn.getAttribute('data-section');
            switchSection(sectionId);
        });
    });
    
    // Event listeners para controles de vídeo
    nextBtn.addEventListener('click', nextVideo);
    prevBtn.addEventListener('click', prevVideo);
    
    // Funcionalidades interativas do portal
    function setupPortalInteractions() {
        // Copiar IP do servidor ao clicar
        document.querySelectorAll('.server-ip').forEach(ipElement => {
            ipElement.addEventListener('click', () => {
                const ip = ipElement.textContent.replace('IP: ', '');
                navigator.clipboard.writeText(ip).then(() => {
                    showNotification('IP copiado para a área de transferência!');
                });
            });
            ipElement.style.cursor = 'pointer';
            ipElement.title = 'Clique para copiar o IP';
        });
        
        // Animação de download para skins
        document.querySelectorAll('.download-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                btn.textContent = 'Baixando...';
                btn.disabled = true;
                
                setTimeout(() => {
                    btn.textContent = '✓ Baixado';
                    setTimeout(() => {
                        btn.textContent = 'Baixar Skin';
                        btn.disabled = false;
                    }, 2000);
                }, 1500);
            });
        });
        
        // Efeito de hover nos cards
        document.querySelectorAll('.server-card, .mod-card, .skin-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });
    }
    
    // Sistema de notificações
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        const backgroundColor = type === 'error' ? 'rgba(244, 67, 54, 0.9)' : 'rgba(76, 175, 80, 0.9)';
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${backgroundColor};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 1000;
            backdrop-filter: blur(10px);
            animation: slideIn 0.3s ease;
            font-weight: bold;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // ===== SISTEMA DE LOGIN COM FIREBASE =====
    
    // Toggle entre login e registro
    toggleModeBtn.addEventListener('click', () => {
        isRegisterMode = !isRegisterMode;
        
        if (isRegisterMode) {
            usernameGroup.style.display = 'block';
            authBtn.querySelector('.btn-text').textContent = 'Criar Conta';
            toggleModeBtn.textContent = 'Já tem conta? Faça login';
        } else {
            usernameGroup.style.display = 'none';
            authBtn.querySelector('.btn-text').textContent = 'Entrar no Portal';
            toggleModeBtn.textContent = 'Não tem conta? Registre-se';
        }
    });
    
    // Event listener para o formulário de login/registro
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const username = usernameInput.value.trim();
        
        if (!email || !password) {
            showLoginError('Por favor, preencha todos os campos');
            return;
        }
        
        if (isRegisterMode && !username) {
            showLoginError('Por favor, escolha um nome de usuário');
            return;
        }
        
        // Mostra estado de carregamento
        authBtn.classList.add('loading');
        authBtn.disabled = true;
        
        try {
            let result;
            
            if (isRegisterMode) {
                // Registrar novo usuário
                result = await window.firebaseAuth.register(email, password, username);
                
                if (result.success) {
                    showLoginSuccess(`Conta criada com sucesso! Bem-vindo, ${username}!`);
                    setTimeout(() => {
                        completeLogin();
                    }, 1500);
                } else {
                    showLoginError(result.error || 'Erro ao criar conta');
                }
            } else {
                // Fazer login
                result = await window.firebaseAuth.login(email, password);
                
                if (result.success) {
                    const displayName = result.user.displayName || result.user.email;
                    showLoginSuccess(`Bem-vindo de volta, ${displayName}!`);
                    setTimeout(() => {
                        completeLogin();
                    }, 1000);
                } else {
                    showLoginError(result.error || 'Email ou senha incorretos');
                }
            }
        } catch (error) {
            console.error('Erro de autenticação:', error);
            showLoginError('Erro de conexão. Tente novamente.');
        } finally {
            authBtn.classList.remove('loading');
            authBtn.disabled = false;
        }
    });
    
    // Esqueceu a senha
    forgotPasswordLink.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        
        if (!email) {
            showLoginError('Digite seu email primeiro');
            return;
        }
        
        const result = await window.firebaseAuth.resetPassword(email);
        
        if (result.success) {
            showLoginSuccess('Email de recuperação enviado!');
        } else {
            showLoginError('Erro ao enviar email de recuperação');
        }
    });
    
    // Callbacks para mudança de estado de autenticação
    window.onUserLoggedIn = (user) => {
        console.log('Usuário autenticado:', user.email);
    };
    
    window.onUserLoggedOut = () => {
        console.log('Usuário deslogado');
        // Redirecionar para login se necessário
    };
    
    // Função para mostrar erro de login
    function showLoginError(message) {
        showNotification(message, 'error');
    }
    
    // Função para mostrar sucesso de login
    function showLoginSuccess(message) {
        showNotification(message, 'success');
    }
    
    // Troca automática de vídeo a cada 45 segundos
    setInterval(() => {
        if (mainContent.classList.contains('show')) {
            nextVideo();
        }
    }, 45000);
    

    // Inicia a aplicação
    initialize();
    
    // Garante que o indicador de carregamento esteja oculto inicialmente
    videoLoadingIndicator.classList.add('hidden');
    
    // Força a ativação da seção inicial
    setTimeout(() => {
        switchSection('home');
    }, 500);
    
    // Inicializa os ícones Lucide
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Configura interações do portal após carregamento
    setTimeout(() => {
        setupPortalInteractions();
        
        // Reinicializa ícones após setup
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }, 1000);
});
