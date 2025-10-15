// Módulo do Portal Minecraft
class PortalManager {
    constructor() {
        this.currentSection = 'home';
        this.favorites = new Set();
        this.searchQuery = '';
        
        this.initElements();
        this.initEventListeners();
        this.loadFavorites();
    }
    
    initElements() {
        this.mainContent = document.getElementById('main-content');
        this.navBtns = document.querySelectorAll('.nav-btn');
        this.contentSections = document.querySelectorAll('.content-section');
        this.userMenuBtn = document.getElementById('user-menu-btn');
        this.userMenu = document.getElementById('user-menu');
    }
    
    initEventListeners() {
        // Navegação
        this.navBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const sectionId = btn.getAttribute('data-section');
                this.switchSection(sectionId);
            });
        });
        
        // Menu do usuário
        if (this.userMenuBtn) {
            this.userMenuBtn.addEventListener('click', () => this.toggleUserMenu());
        }
        
        // Fechar menu ao clicar fora
        document.addEventListener('click', (e) => {
            if (this.userMenu && !this.userMenu.contains(e.target) && e.target !== this.userMenuBtn) {
                this.userMenu.classList.remove('show');
            }
        });
        
        // Busca
        const searchInputs = document.querySelectorAll('.search-input');
        searchInputs.forEach(input => {
            input.addEventListener('input', Utils.debounce((e) => {
                this.handleSearch(e.target.value);
            }, 300));
        });
    }
    
    switchSection(sectionId) {
        Utils.log('info', `Trocando para seção: ${sectionId}`);
        
        // Remover active
        this.navBtns.forEach(btn => btn.classList.remove('active'));
        this.contentSections.forEach(section => section.classList.remove('active'));
        
        // Ativar seção
        const activeBtn = document.querySelector(`[data-section="${sectionId}"]`);
        const activeSection = document.getElementById(`${sectionId}-section`);
        
        if (activeBtn && activeSection) {
            activeBtn.classList.add('active');
            activeSection.classList.add('active');
            this.currentSection = sectionId;
            
            // Analytics
            if (window.analytics) {
                window.analytics.logEvent('section_view', { section: sectionId });
            }
        }
    }
    
    show() {
        this.mainContent.classList.remove('hidden');
        this.mainContent.classList.add('show');
        
        // Iniciar vídeo
        if (window.videoManager) {
            window.videoManager.playCurrentVideo();
            window.videoManager.startAutoSwitch();
        }
        
        // Carregar dados
        this.loadData();
        
        // Reinicializar SkinManager após mostrar o portal
        setTimeout(() => {
            if (window.skinManager) {
                window.skinManager.setupListeners();
            }
            
            // Reinicializar ícones
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }, 1000);
    }
    
    hide() {
        this.mainContent.classList.remove('show');
        this.mainContent.classList.add('hidden');
        
        if (window.videoManager) {
            window.videoManager.stopAutoSwitch();
            window.videoManager.pauseAll();
        }
    }
    
    toggleUserMenu() {
        this.userMenu.classList.toggle('show');
    }
    
    async loadData() {
        try {
            // Carregar servidores
            const servers = await window.dataManager.getServers();
            this.renderServers(servers);
            
            // Carregar mods
            const mods = await window.dataManager.getMods();
            this.renderMods(mods);
            
            // Carregar skins
            const skins = await window.dataManager.getSkins();
            this.renderSkins(skins);
            
            // Carregar notícias
            const news = await window.dataManager.getNews();
            this.renderNews(news);
            
        } catch (error) {
            Utils.log('error', 'Erro ao carregar dados:', error);
        }
    }
    
    renderServers(servers) {
        const container = document.querySelector('#servers-section .cards-grid');
        if (!container) return;
        
        container.innerHTML = '';
        
        servers.forEach(server => {
            const card = this.createServerCard(server);
            container.appendChild(card);
        });
        
        // Reinicializar ícones
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    createServerCard(server) {
        const isFavorite = this.favorites.has(`server-${server.id}`);
        
        const card = Utils.createElement('div', {
            class: 'server-card',
            dataset: { id: server.id }
        });
        
        card.innerHTML = `
            <div class="card-header">
                <h3>${Utils.sanitizeInput(server.name)}</h3>
                <span class="status ${server.online ? 'online' : 'offline'}">
                    ● ${server.online ? 'Online' : 'Offline'}
                </span>
            </div>
            <p class="server-ip" title="Clique para copiar">${Utils.sanitizeInput(server.ip)}</p>
            <p class="server-players">
                <i data-lucide="users"></i> 
                ${server.players}/${server.maxPlayers} jogadores
            </p>
            <div class="server-tags">
                ${server.tags.map(tag => `<span class="tag">${Utils.sanitizeInput(tag)}</span>`).join('')}
            </div>
            <div class="card-actions">
                <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-id="${server.id}" data-type="server">
                    <i data-lucide="${isFavorite ? 'heart' : 'heart'}"></i>
                    ${isFavorite ? 'Favoritado' : 'Favoritar'}
                </button>
                ${server.rating ? `
                    <div class="rating">
                        <i data-lucide="star"></i>
                        <span>${server.rating.toFixed(1)}</span>
                    </div>
                ` : ''}
            </div>
        `;
        
        // Event listeners
        const ipElement = card.querySelector('.server-ip');
        ipElement.addEventListener('click', async () => {
            const success = await Utils.copyToClipboard(server.ip);
            if (success) {
                Utils.showNotification('IP copiado para a área de transferência!', 'success');
            }
        });
        
        const favoriteBtn = card.querySelector('.favorite-btn');
        favoriteBtn.addEventListener('click', () => this.toggleFavorite('server', server.id, favoriteBtn));
        
        // Hover effects
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
        
        return card;
    }
    
    renderMods(mods) {
        const container = document.querySelector('#mods-section .cards-grid');
        if (!container) return;
        
        container.innerHTML = '';
        
        mods.forEach(mod => {
            const card = this.createModCard(mod);
            container.appendChild(card);
        });
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    createModCard(mod) {
        const isFavorite = this.favorites.has(`mod-${mod.id}`);
        
        const card = Utils.createElement('div', {
            class: 'mod-card',
            dataset: { id: mod.id }
        });
        
        card.innerHTML = `
            <h3>${Utils.sanitizeInput(mod.name)}</h3>
            <p>${Utils.sanitizeInput(mod.description)}</p>
            <div class="mod-info">
                <span class="downloads">
                    <i data-lucide="download"></i> ${Utils.formatNumber(mod.downloads)} downloads
                </span>
                <span class="version">${Utils.sanitizeInput(mod.version)}</span>
            </div>
            <div class="card-actions">
                <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-id="${mod.id}" data-type="mod">
                    <i data-lucide="${isFavorite ? 'heart' : 'heart'}"></i>
                    ${isFavorite ? 'Favoritado' : 'Favoritar'}
                </button>
                <button class="download-mod-btn" data-id="${mod.id}">
                    <i data-lucide="download"></i> Download
                </button>
            </div>
        `;
        
        const favoriteBtn = card.querySelector('.favorite-btn');
        favoriteBtn.addEventListener('click', () => this.toggleFavorite('mod', mod.id, favoriteBtn));
        
        const downloadBtn = card.querySelector('.download-mod-btn');
        downloadBtn.addEventListener('click', () => this.handleModDownload(mod));
        
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
        
        return card;
    }
    
    renderSkins(skins) {
        const container = document.querySelector('#skins-section .cards-grid');
        if (!container) return;
        
        container.innerHTML = '';
        
        skins.forEach(skin => {
            const card = this.createSkinCard(skin);
            container.appendChild(card);
        });
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    createSkinCard(skin) {
        const isFavorite = this.favorites.has(`skin-${skin.id}`);
        
        const card = Utils.createElement('div', {
            class: 'skin-card',
            dataset: { id: skin.id }
        });
        
        card.innerHTML = `
            <div class="skin-preview">
                ${skin.imageUrl ? 
                    `<img src="${skin.imageUrl}" alt="${Utils.sanitizeInput(skin.name)}" loading="lazy">` :
                    `<i data-lucide="${skin.icon || 'user'}" class="skin-icon"></i>`
                }
            </div>
            <h3>${Utils.sanitizeInput(skin.name)}</h3>
            <p>${Utils.sanitizeInput(skin.description)}</p>
            <div class="card-actions">
                <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-id="${skin.id}" data-type="skin">
                    <i data-lucide="${isFavorite ? 'heart' : 'heart'}"></i>
                </button>
                <button class="download-btn" data-id="${skin.id}">
                    Baixar Skin
                </button>
            </div>
        `;
        
        const favoriteBtn = card.querySelector('.favorite-btn');
        favoriteBtn.addEventListener('click', () => this.toggleFavorite('skin', skin.id, favoriteBtn));
        
        const downloadBtn = card.querySelector('.download-btn');
        downloadBtn.addEventListener('click', () => this.handleSkinDownload(skin, downloadBtn));
        
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
        
        return card;
    }
    
    renderNews(newsItems) {
        const container = document.querySelector('#news-section .news-list');
        if (!container) return;
        
        container.innerHTML = '';
        
        newsItems.forEach(item => {
            const newsCard = this.createNewsCard(item);
            container.appendChild(newsCard);
        });
    }
    
    createNewsCard(item) {
        const article = Utils.createElement('article', { class: 'news-item' });
        
        article.innerHTML = `
            <div class="news-date">${Utils.formatDate(item.date)}</div>
            <h3>${Utils.sanitizeInput(item.title)}</h3>
            <p>${Utils.sanitizeInput(item.summary)}</p>
            ${item.link ? `<a href="${item.link}" target="_blank" class="read-more">Ler mais →</a>` : ''}
        `;
        
        return article;
    }
    
    toggleFavorite(type, id, button) {
        const key = `${type}-${id}`;
        
        if (this.favorites.has(key)) {
            this.favorites.delete(key);
            button.classList.remove('active');
            button.innerHTML = `<i data-lucide="heart"></i> Favoritar`;
            Utils.showNotification('Removido dos favoritos', 'info');
        } else {
            this.favorites.add(key);
            button.classList.add('active');
            button.innerHTML = `<i data-lucide="heart"></i> Favoritado`;
            Utils.showNotification('Adicionado aos favoritos!', 'success');
        }
        
        // Salvar favoritos
        this.saveFavorites();
        
        // Reinicializar ícones
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        // Analytics
        if (window.analytics) {
            window.analytics.logEvent('favorite_toggle', { type, id, favorited: this.favorites.has(key) });
        }
    }
    
    saveFavorites() {
        localStorage.setItem('favorites', JSON.stringify([...this.favorites]));
    }
    
    loadFavorites() {
        const saved = localStorage.getItem('favorites');
        if (saved) {
            this.favorites = new Set(JSON.parse(saved));
        }
    }
    
    handleModDownload(mod) {
        Utils.showNotification(`Iniciando download de ${mod.name}...`, 'info');
        
        // Simular download (em produção, seria um link real)
        setTimeout(() => {
            Utils.showNotification(`${mod.name} baixado com sucesso!`, 'success');
        }, 1500);
        
        // Analytics
        if (window.analytics) {
            window.analytics.logEvent('mod_download', { mod_id: mod.id, mod_name: mod.name });
        }
    }
    
    handleSkinDownload(skin, button) {
        button.textContent = 'Baixando...';
        button.disabled = true;
        
        setTimeout(() => {
            button.textContent = '✓ Baixado';
            setTimeout(() => {
                button.textContent = 'Baixar Skin';
                button.disabled = false;
            }, 2000);
        }, 1500);
        
        // Analytics
        if (window.analytics) {
            window.analytics.logEvent('skin_download', { skin_id: skin.id, skin_name: skin.name });
        }
    }
    
    handleSearch(query) {
        this.searchQuery = query.toLowerCase();
        Utils.log('info', `Buscando: ${query}`);
        
        // Filtrar cards baseado na seção atual
        const section = document.getElementById(`${this.currentSection}-section`);
        if (!section) return;
        
        const cards = section.querySelectorAll('.server-card, .mod-card, .skin-card, .news-item');
        
        cards.forEach(card => {
            const text = card.textContent.toLowerCase();
            if (text.includes(this.searchQuery)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    }
}

// Exportar
window.PortalManager = PortalManager;
