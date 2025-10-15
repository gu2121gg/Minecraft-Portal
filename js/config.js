// Configurações da aplicação
const CONFIG = {
    // Tempos de carregamento (em ms)
    LOADING: {
        FALLBACK_HIGH: 5000,
        FALLBACK_MEDIUM: 7000,
        FALLBACK_LOW: 10000,
        VIDEO_TIMEOUT_HIGH: 8000,
        VIDEO_TIMEOUT_MEDIUM: 12000,
        VIDEO_TIMEOUT_LOW: 15000,
        PRELOAD_DELAY: 2000
    },
    
    // Tempos de animação
    ANIMATION: {
        FADE_OUT: 1000,
        TRANSITION: 300,
        LOGIN_SUCCESS_DELAY: 1000,
        REGISTER_SUCCESS_DELAY: 1500,
        NOTIFICATION_DURATION: 3000,
        VIDEO_AUTO_SWITCH: 45000
    },
    
    // Validação de senha
    PASSWORD: {
        MIN_LENGTH: 6,
        REQUIRE_UPPERCASE: false,
        REQUIRE_NUMBER: false,
        REQUIRE_SPECIAL: false
    },
    
    // Validação de username
    USERNAME: {
        MIN_LENGTH: 3,
        MAX_LENGTH: 20,
        PATTERN: /^[a-zA-Z0-9_]+$/
    },
    
    // Segurança
    SECURITY: {
        MAX_LOGIN_ATTEMPTS: 5,
        LOCKOUT_DURATION: 300000, // 5 minutos
        SESSION_TIMEOUT: 3600000 // 1 hora
    },
    
    // Qualidade de conexão
    CONNECTION_QUALITY: {
        HIGH: 'high',
        MEDIUM: 'medium',
        LOW: 'low'
    },
    
    // Cache
    CACHE: {
        NAME: 'minecraft-portal-v1',
        VERSION: '1.0.0'
    },
    
    // Firebase (usar variáveis de ambiente em produção)
    FIREBASE: {
        apiKey: "AIzaSyDPI1Rc_rRBlV9a50shZ5OnddJfSh1Q9W8",
        authDomain: "gspixel-a9207.firebaseapp.com",
        databaseURL: "https://gspixel-a9207-default-rtdb.firebaseio.com",
        projectId: "gspixel-a9207",
        storageBucket: "gspixel-a9207.firebasestorage.app",
        messagingSenderId: "819334339760",
        appId: "1:819334339760:web:cdeaa73ad61f48586c6f75"
    },
    
    // Tema de cores
    THEME: {
        PRIMARY: '#ffffff',
        SECONDARY: '#e0e0e0',
        ACCENT: '#333333',
        BACKGROUND: '#000000'
    },
    
    // Paths de vídeos
    VIDEOS: {
        LOADING: 'assets/media1.mp4',
        LOGIN: 'assets/media2.mp4',
        MAIN: [
            'assets/media2.mp4',
            'assets/media3.mp4',
            'assets/media4.mp4',
            'assets/media5.mp4'
        ]
    },
    
    // API para buscar skins (Minecraft)
    SKIN_API: {
        MOJANG: 'https://api.mojang.com/users/profiles/minecraft/',
        CRAFATAR: 'https://crafatar.com/avatars/',
        MINOTAR: 'https://minotar.net/avatar/'
    },
    
    // Paths de imagens fallback (posters)
    POSTERS: {
        LOADING: 'assets/poster1.jpg',
        LOGIN: 'assets/poster2.jpg',
        MAIN: [
            'assets/poster2.jpg',
            'assets/poster3.jpg',
            'assets/poster4.jpg',
            'assets/poster5.jpg'
        ]
    }
};

// Detectar se está em ambiente de desenvolvimento
CONFIG.IS_DEV = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Exportar configuração
window.CONFIG = CONFIG;
