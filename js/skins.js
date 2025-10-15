// Módulo de Busca de Skins (estilo NameMC)
class SkinManager {
    constructor() {
        // Aguardar DOM estar pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    init() {
        // Tentar inicializar agora
        this.setupListeners();
        
        // Também tentar após um delay (caso o DOM ainda não esteja totalmente pronto)
        setTimeout(() => this.setupListeners(), 1000);
    }
    
    setupListeners() {
        const searchBtn = document.getElementById('search-username-btn');
        const usernameInput = document.getElementById('username-search');
        const resultContainer = document.getElementById('skin-search-result');
        
        if (!searchBtn || !usernameInput || !resultContainer) {
            console.warn('SkinManager: Elementos não encontrados ainda');
            return;
        }
        
        // Remover listeners antigos se existirem
        const newSearchBtn = searchBtn.cloneNode(true);
        searchBtn.parentNode.replaceChild(newSearchBtn, searchBtn);
        
        // Buscar ao clicar no botão
        newSearchBtn.addEventListener('click', () => this.searchSkin());
        
        // Buscar ao pressionar Enter
        usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchSkin();
            }
        });
        
        console.log('SkinManager: Listeners configurados com sucesso!');
    }
    
    async searchSkin() {
        console.log('SkinManager: Iniciando busca de skin...');
        
        const usernameInput = document.getElementById('username-search');
        const resultContainer = document.getElementById('skin-search-result');
        const searchBtn = document.getElementById('search-username-btn');
        
        if (!usernameInput || !resultContainer || !searchBtn) {
            console.error('SkinManager: Elementos não encontrados!');
            alert('Erro: Elementos não encontrados. Recarregue a página.');
            return;
        }
        
        const username = usernameInput.value.trim();
        console.log('SkinManager: Username digitado:', username);
        
        if (!username) {
            Utils.showNotification('Digite um username para buscar', 'warning');
            return;
        }
        
        // Validar username (Minecraft aceita 3-16 caracteres alfanuméricos e underscore)
        if (!/^[a-zA-Z0-9_]{3,16}$/.test(username)) {
            Utils.showNotification('Username inválido. Use apenas letras, números e underscore (3-16 caracteres)', 'error');
            return;
        }
        
        // Loading state
        searchBtn.disabled = true;
        searchBtn.innerHTML = '<i data-lucide="loader-2"></i> Buscando...';
        lucide.createIcons();
        
        try {
            // Buscar UUID do jogador na API Mojang
            const uuid = await this.getPlayerUUID(username);
            
            if (!uuid) {
                this.showError(resultContainer, 'Jogador não encontrado', 'Este username não existe no Minecraft.');
                return;
            }
            
            // Exibir resultado
            this.displaySkinResult(resultContainer, username, uuid);
            Utils.showNotification(`Skin de ${username} encontrada!`, 'success');
            
        } catch (error) {
            Utils.log('error', 'Erro ao buscar skin:', error);
            this.showError(resultContainer, 'Erro ao buscar', 'Tente novamente em alguns segundos.');
            Utils.showNotification('Erro ao buscar skin', 'error');
        } finally {
            // Restaurar botão
            searchBtn.disabled = false;
            searchBtn.innerHTML = '<i data-lucide="search"></i> Buscar';
            lucide.createIcons();
        }
    }
    
    async getPlayerUUID(username) {
        try {
            // Usar API alternativa sem CORS (PlayerDB API)
            const response = await fetch(`https://playerdb.co/api/player/minecraft/${username}`);
            
            if (!response.ok) {
                console.log('PlayerDB API retornou erro:', response.status);
                return null;
            }
            
            const data = await response.json();
            
            // PlayerDB retorna formato diferente
            if (data.success && data.data && data.data.player) {
                const uuid = data.data.player.id;
                console.log('UUID encontrado:', uuid);
                return uuid;
            }
            
            console.log('Jogador não encontrado no PlayerDB');
            return null;
            
        } catch (error) {
            Utils.log('error', 'Erro ao buscar UUID:', error);
            return null;
        }
    }
    
    displaySkinResult(container, username, uuid) {
        // Mostrar container
        container.classList.remove('hidden');
        
        // Remover hífens do UUID se necessário
        const cleanUuid = uuid.replace(/-/g, '');
        
        // URLs para as imagens da skin
        const avatarUrl = `${CONFIG.SKIN_API.CRAFATAR}${cleanUuid}?size=150&overlay`;
        const skinUrl3D = `https://crafatar.com/renders/body/${cleanUuid}?size=150&overlay`;
        const downloadUrl = `https://crafatar.com/skins/${cleanUuid}`;
        const namemcUrl = `https://namemc.com/profile/${username}`;
        
        console.log('Exibindo resultado para UUID:', cleanUuid);
        
        // HTML do resultado
        container.innerHTML = `
            <div class="skin-result-card">
                <div class="skin-result-preview">
                    <img src="${avatarUrl}" alt="Skin de ${username}" onerror="this.src='${CONFIG.SKIN_API.MINOTAR}${username}/150'">
                </div>
                <div class="skin-result-info">
                    <h3>${Utils.sanitizeInput(username)}</h3>
                    <p>UUID: ${uuid}</p>
                    <div class="skin-result-actions">
                        <a href="${downloadUrl}" download="${username}.png" class="skin-download-link">
                            <i data-lucide="download"></i>
                            Baixar Skin (.png)
                        </a>
                        <a href="${namemcUrl}" target="_blank" class="skin-download-link">
                            <i data-lucide="external-link"></i>
                            Ver no NameMC
                        </a>
                        <a href="${skinUrl3D}" target="_blank" class="skin-download-link">
                            <i data-lucide="eye"></i>
                            Visualizar 3D
                        </a>
                    </div>
                </div>
            </div>
        `;
        
        // Reinicializar ícones
        lucide.createIcons();
        
        // Scroll suave até o resultado
        container.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Animação de entrada
        container.style.opacity = '0';
        container.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            container.style.transition = 'all 0.5s ease';
            container.style.opacity = '1';
            container.style.transform = 'translateY(0)';
        }, 100);
    }
    
    showError(container, title, message) {
        container.classList.remove('hidden');
        
        container.innerHTML = `
            <div class="skin-error">
                <i data-lucide="alert-circle"></i>
                <h4>${title}</h4>
                <p>${message}</p>
            </div>
        `;
        
        lucide.createIcons();
        container.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Exportar
window.SkinManager = SkinManager;
