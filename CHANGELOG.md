# Changelog

Todas as mudanças notáveis neste projeto serão documentadas aqui.

## [2.0.0] - 2025-10-15

### 🎉 Adicionado
- **Arquitetura Modular:** Separação do código em módulos (config, utils, auth, video, portal, data)
- **PWA:** Suporte completo a Progressive Web App com Service Worker
- **Sistema de Favoritos:** Marque e salve itens favoritos
- **Sistema de Busca:** Busca em tempo real para servidores, mods e skins
- **Menu do Usuário:** Menu dropdown com informações e logout
- **Validação em Tempo Real:** Validação inline de formulários
- **Sistema de Ratings:** Avalie servidores (preparado para futuro)
- **Dados Dinâmicos:** Integração completa com Firebase Realtime Database
- **Página Offline:** Página customizada para quando está sem conexão
- **Analytics:** Preparado para Firebase Analytics
- **Notificações Melhoradas:** Sistema de notificações com ícones e tipos

### 🔒 Segurança
- Validação de senha configurável
- Limite de tentativas de login (5 tentativas)
- Lockout temporário (5 minutos)
- Timeout de sessão (1 hora)
- Sanitização de inputs
- Verificação de email no registro
- Persistência segura de autenticação

### ⚡ Performance
- Lazy loading otimizado de vídeos
- Detecção de qualidade de conexão
- Cache adaptativo
- Service Worker para cache offline
- Debounce e throttle em eventos
- Sistema de cache de dados (5 minutos)
- Monitoramento de performance

### ♿ Acessibilidade
- Labels ARIA completos
- Roles semânticos
- Navegação por teclado
- Autocomplete adequado
- Indicadores de estado (aria-live)

### 🎨 UI/UX
- Feedback visual aprimorado
- Mensagens de erro descritivas
- Loading states
- Animações suaves
- Campo de busca em cada seção
- Botões de ação nos cards (favoritar, download)
- Sistema de ratings visual

### 🛠️ Código
- Logger centralizado
- Tratamento de erros global
- Configurações centralizadas
- Constantes nomeadas
- Código documentado
- Error boundaries
- Utilitários reutilizáveis

### 📱 Responsividade
- Header adaptável
- Menu mobile
- Cards responsivos
- Busca responsiva

## [1.0.0] - 2024-10-15

### Versão Inicial
- Tela de carregamento com progresso
- Sistema de login/registro com Firebase
- Portal com navegação entre seções
- Múltiplos vídeos de fundo
- Servidores, mods, skins e notícias (estáticos)
- Controles de vídeo
- Animações e transições
