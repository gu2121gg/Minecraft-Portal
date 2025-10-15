// Módulo de Gerenciamento de Dados
class DataManager {
    constructor() {
        this.database = firebase.database();
        this.cache = {
            servers: null,
            mods: null,
            skins: null,
            news: null
        };
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutos
        this.lastFetch = {};
    }
    
    // Servidores
    async getServers() {
        if (this.isCacheValid('servers')) {
            return this.cache.servers;
        }
        
        try {
            const snapshot = await this.database.ref('servers').once('value');
            const data = snapshot.val();
            
            if (data) {
                this.cache.servers = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                }));
            } else {
                // Dados fallback
                this.cache.servers = this.getDefaultServers();
            }
            
            this.lastFetch.servers = Date.now();
            return this.cache.servers;
            
        } catch (error) {
            Utils.log('error', 'Erro ao buscar servidores:', error);
            return this.getDefaultServers();
        }
    }
    
    async addServer(serverData) {
        try {
            const newServerRef = this.database.ref('servers').push();
            await newServerRef.set({
                ...serverData,
                createdAt: firebase.database.ServerValue.TIMESTAMP,
                createdBy: firebase.auth().currentUser?.uid
            });
            
            // Invalidar cache
            this.cache.servers = null;
            
            return { success: true, id: newServerRef.key };
        } catch (error) {
            Utils.log('error', 'Erro ao adicionar servidor:', error);
            return { success: false, error: error.message };
        }
    }
    
    async updateServerRating(serverId, rating) {
        try {
            const userId = firebase.auth().currentUser?.uid;
            if (!userId) return { success: false, error: 'Usuário não autenticado' };
            
            await this.database.ref(`servers/${serverId}/ratings/${userId}`).set(rating);
            
            // Recalcular média
            const ratingsSnapshot = await this.database.ref(`servers/${serverId}/ratings`).once('value');
            const ratings = ratingsSnapshot.val();
            
            if (ratings) {
                const values = Object.values(ratings);
                const average = values.reduce((a, b) => a + b, 0) / values.length;
                
                await this.database.ref(`servers/${serverId}/rating`).set(average);
            }
            
            // Invalidar cache
            this.cache.servers = null;
            
            return { success: true };
        } catch (error) {
            Utils.log('error', 'Erro ao atualizar rating:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Mods
    async getMods() {
        if (this.isCacheValid('mods')) {
            return this.cache.mods;
        }
        
        try {
            const snapshot = await this.database.ref('mods').once('value');
            const data = snapshot.val();
            
            if (data) {
                this.cache.mods = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                }));
            } else {
                this.cache.mods = this.getDefaultMods();
            }
            
            this.lastFetch.mods = Date.now();
            return this.cache.mods;
            
        } catch (error) {
            Utils.log('error', 'Erro ao buscar mods:', error);
            return this.getDefaultMods();
        }
    }
    
    // Skins
    async getSkins() {
        if (this.isCacheValid('skins')) {
            return this.cache.skins;
        }
        
        try {
            const snapshot = await this.database.ref('skins').once('value');
            const data = snapshot.val();
            
            if (data) {
                this.cache.skins = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                }));
            } else {
                this.cache.skins = this.getDefaultSkins();
            }
            
            this.lastFetch.skins = Date.now();
            return this.cache.skins;
            
        } catch (error) {
            Utils.log('error', 'Erro ao buscar skins:', error);
            return this.getDefaultSkins();
        }
    }
    
    // Notícias
    async getNews() {
        if (this.isCacheValid('news')) {
            return this.cache.news;
        }
        
        try {
            const snapshot = await this.database.ref('news').orderByChild('date').limitToLast(10).once('value');
            const data = snapshot.val();
            
            if (data) {
                this.cache.news = Object.keys(data)
                    .map(key => ({
                        id: key,
                        ...data[key]
                    }))
                    .sort((a, b) => b.date - a.date);
            } else {
                this.cache.news = this.getDefaultNews();
            }
            
            this.lastFetch.news = Date.now();
            return this.cache.news;
            
        } catch (error) {
            Utils.log('error', 'Erro ao buscar notícias:', error);
            return this.getDefaultNews();
        }
    }
    
    // Utilitários
    isCacheValid(key) {
        return this.cache[key] && 
               this.lastFetch[key] && 
               (Date.now() - this.lastFetch[key]) < this.cacheExpiry;
    }
    
    invalidateCache(key = null) {
        if (key) {
            this.cache[key] = null;
            delete this.lastFetch[key];
        } else {
            this.cache = { servers: null, mods: null, skins: null, news: null };
            this.lastFetch = {};
        }
    }
    
    // Dados padrão (fallback)
    getDefaultServers() {
        return [
            {
                id: '1',
                name: 'SkyBlock Paradise',
                ip: 'skyblock.minecraft.com',
                players: 245,
                maxPlayers: 500,
                online: true,
                tags: ['SkyBlock', 'Economia'],
                rating: 4.5
            },
            {
                id: '2',
                name: 'PvP Arena Pro',
                ip: 'pvp.minecraft.com',
                players: 189,
                maxPlayers: 300,
                online: true,
                tags: ['PvP', 'Competitivo'],
                rating: 4.2
            },
            {
                id: '3',
                name: 'Creative World',
                ip: 'creative.minecraft.com',
                players: 156,
                maxPlayers: 400,
                online: true,
                tags: ['Creative', 'Construção'],
                rating: 4.7
            }
        ];
    }
    
    getDefaultMods() {
        return [
            {
                id: '1',
                name: 'OptiFine',
                description: 'Melhora performance e adiciona shaders',
                downloads: 2500000,
                version: 'v1.20.4'
            },
            {
                id: '2',
                name: 'JEI (Just Enough Items)',
                description: 'Visualize receitas e itens facilmente',
                downloads: 1800000,
                version: 'v1.20.4'
            },
            {
                id: '3',
                name: "Biomes O' Plenty",
                description: 'Adiciona novos biomas ao mundo',
                downloads: 1200000,
                version: 'v1.20.4'
            }
        ];
    }
    
    getDefaultSkins() {
        return [
            {
                id: '1',
                name: 'Ninja Warrior',
                description: 'Skin de ninja com armadura',
                icon: 'user'
            },
            {
                id: '2',
                name: 'Wizard Master',
                description: 'Mago poderoso com cajado',
                icon: 'zap'
            },
            {
                id: '3',
                name: 'Knight Defender',
                description: 'Cavaleiro com armadura dourada',
                icon: 'sword'
            }
        ];
    }
    
    getDefaultNews() {
        return [
            {
                id: '1',
                title: 'Minecraft 1.21 - The Tricky Trials',
                summary: 'Nova atualização traz novos blocos, mobs e mecânicas de jogo...',
                date: new Date('2024-10-15').getTime()
            },
            {
                id: '2',
                title: 'Novo Servidor PvP Aberto',
                summary: 'Servidor dedicado a batalhas épicas com sistema de ranking...',
                date: new Date('2024-10-12').getTime()
            },
            {
                id: '3',
                title: 'Concurso de Construção',
                summary: 'Participe do maior concurso de construção do ano...',
                date: new Date('2024-10-10').getTime()
            }
        ];
    }
}

// Exportar
window.DataManager = DataManager;
