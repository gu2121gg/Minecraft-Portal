// Service Worker para PWA
const CACHE_NAME = 'minecraft-portal-v1';
const DYNAMIC_CACHE = 'minecraft-portal-dynamic-v1';

// Recursos para cache offline
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/js/config.js',
    '/js/utils.js',
    '/js/auth.js',
    '/js/video.js',
    '/js/portal.js',
    '/js/data.js',
    '/firebase.js',
    '/script.js',
    '/manifest.json'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
    console.log('[SW] Instalando Service Worker...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Fazendo cache dos assets estáticos');
                return cache.addAll(STATIC_ASSETS.map(url => new Request(url, {cache: 'reload'})));
            })
            .catch((error) => {
                console.error('[SW] Erro ao fazer cache:', error);
            })
    );
    
    self.skipWaiting();
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
    console.log('[SW] Ativando Service Worker...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => name !== CACHE_NAME && name !== DYNAMIC_CACHE)
                        .map((name) => {
                            console.log('[SW] Removendo cache antigo:', name);
                            return caches.delete(name);
                        })
                );
            })
    );
    
    return self.clients.claim();
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Ignorar requisições de extensões do navegador
    if (url.protocol === 'chrome-extension:') {
        return;
    }
    
    // Ignorar requisições para Firebase e APIs externas
    if (url.origin.includes('firebase') || 
        url.origin.includes('googleapis') ||
        url.origin.includes('gstatic')) {
        return;
    }
    
    // Estratégia: Network First para HTML, Cache First para outros assets
    if (request.method === 'GET') {
        if (request.headers.get('accept').includes('text/html')) {
            event.respondWith(networkFirstStrategy(request));
        } else {
            event.respondWith(cacheFirstStrategy(request));
        }
    }
});

// Estratégia: Cache First
async function cacheFirstStrategy(request) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        
        // Cachear resposta válida
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('[SW] Fetch falhou:', error);
        
        // Retornar página offline se disponível
        const offlinePage = await caches.match('/offline.html');
        if (offlinePage) {
            return offlinePage;
        }
        
        throw error;
    }
}

// Estratégia: Network First
async function networkFirstStrategy(request) {
    try {
        const networkResponse = await fetch(request);
        
        // Cachear resposta
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, networkResponse.clone());
        
        return networkResponse;
    } catch (error) {
        console.log('[SW] Network falhou, tentando cache');
        
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Retornar página offline
        const offlinePage = await caches.match('/offline.html');
        if (offlinePage) {
            return offlinePage;
        }
        
        throw error;
    }
}

// Mensagens do cliente
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => caches.delete(name))
            );
        }).then(() => {
            event.ports[0].postMessage({ success: true });
        });
    }
});

// Sincronização em background (opcional)
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-data') {
        event.waitUntil(syncData());
    }
});

async function syncData() {
    console.log('[SW] Sincronizando dados em background...');
    // Implementar lógica de sincronização se necessário
}

// Notificações Push (opcional)
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'Nova notificação do Minecraft Portal',
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        vibrate: [200, 100, 200]
    };
    
    event.waitUntil(
        self.registration.showNotification('Minecraft Portal', options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow('/')
    );
});
