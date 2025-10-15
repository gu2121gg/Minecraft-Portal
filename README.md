# 🎮 Minecraft Portal - Versão Melhorada

Portal completo para servidores, mods, skins e notícias do Minecraft com autenticação Firebase e PWA.

## 🚀 Melhorias Implementadas

### 🔒 Segurança
- ✅ Configuração Firebase organizada em módulo separado
- ✅ Validação de senha com requisitos configuráveis
- ✅ Validação de email e username em tempo real
- ✅ Limite de tentativas de login (5 tentativas)
- ✅ Lockout temporário após múltiplas tentativas
- ✅ Timeout de sessão (1 hora)
- ✅ Persistência de autenticação configurada
- ✅ Envio de email de verificação no registro
- ✅ Sanitização de inputs para prevenir XSS

### ⚡ Performance
- ✅ Arquitetura modular (separação em múltiplos arquivos JS)
- ✅ Service Worker para cache offline
- ✅ PWA completo com manifest.json
- ✅ Lazy loading de vídeos otimizado
- ✅ Detecção de qualidade de conexão
- ✅ Cache adaptativo baseado na conexão
- ✅ Sistema de cache de dados (5 minutos)
- ✅ Debounce e throttle para eventos
- ✅ Página offline customizada

### 🎨 UX/UI
- ✅ Sistema de notificações melhorado com ícones
- ✅ Validação inline de formulários
- ✅ Feedback visual de erros e sucessos
- ✅ Menu do usuário com opção de logout
- ✅ Indicadores de carregamento
- ✅ Mensagens de erro mais descritivas
- ✅ Sistema de busca para servidores/mods/skins
- ✅ Sistema de favoritos persistente

### ♿ Acessibilidade
- ✅ Labels ARIA adicionados
- ✅ Roles semânticos (navigation, menu, menuitem)
- ✅ Aria-labels descritivos
- ✅ Aria-live para atualizações dinâmicas
- ✅ Autocomplete adequado nos inputs
- ✅ Suporte completo a navegação por teclado

### 🛠️ Funcionalidades Novas
- ✅ Sistema de logout funcional
- ✅ Persistência de "Lembrar de mim"
- ✅ Recuperação de senha implementada
- ✅ Dados dinâmicos do Firebase (servidores, mods, skins, notícias)
- ✅ Sistema de favoritos com persistência local
- ✅ Sistema de avaliações (ratings) para servidores
- ✅ Sistema de busca e filtros
- ✅ Copiar IP do servidor (clipboard API)
- ✅ Analytics de eventos
- ✅ Detecção online/offline
- ✅ Monitoramento de performance

### 📊 Código e Arquitetura
- ✅ Código organizado em módulos:
  - `config.js` - Configurações centralizadas
  - `utils.js` - Funções utilitárias
  - `auth.js` - Gerenciamento de autenticação
  - `video.js` - Gerenciamento de vídeos
  - `portal.js` - Gerenciamento do portal
  - `data.js` - Gerenciamento de dados Firebase
- ✅ Logger centralizado
- ✅ Tratamento de erros global
- ✅ Constantes nomeadas (sem magic numbers)
- ✅ Comentários descritivos
- ✅ Error boundaries

### 📱 Responsividade
- ✅ Header responsivo
- ✅ Menu mobile otimizado
- ✅ Busca responsiva
- ✅ Cards adaptáveis

## 📁 Estrutura de Arquivos

```
Minecraft/
├── assets/               # Mídia (vídeos, imagens, ícones)
├── js/                   # Módulos JavaScript
│   ├── config.js        # Configurações
│   ├── utils.js         # Utilitários
│   ├── auth.js          # Autenticação
│   ├── video.js         # Vídeos
│   ├── portal.js        # Portal
│   └── data.js          # Dados
├── index.html           # Página principal
├── style.css            # Estilos
├── firebase.js          # Configuração Firebase
├── script.js            # Script principal
├── sw.js                # Service Worker
├── manifest.json        # PWA Manifest
├── offline.html         # Página offline
└── README.md            # Este arquivo
```

## 🚀 Como Usar

### 1. Pré-requisitos
- Navegador moderno (Chrome, Firefox, Edge, Safari)
- Conexão com internet (funciona offline após primeira visita)
- Servidor web local ou hospedagem

### 2. Instalação

```bash
# Clone ou baixe o projeto
cd Minecraft

# Inicie um servidor web local
# Opção 1 - Python
python -m http.server 8000

# Opção 2 - Node.js
npx serve

# Opção 3 - PHP
php -S localhost:8000
```

### 3. Acessar
Abra o navegador em `http://localhost:8000`

### 4. Primeira Configuração

#### Firebase (Recomendado para produção)
1. Crie um projeto no [Firebase Console](https://console.firebase.google.com)
2. Ative Authentication (Email/Password)
3. Ative Realtime Database
4. Copie as credenciais para `js/config.js`

#### Segurança de Credenciais
**IMPORTANTE:** Em produção, use variáveis de ambiente:
```javascript
// Exemplo usando variáveis de ambiente
FIREBASE: {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    // ...
}
```

## 🎯 Funcionalidades Principais

### Autenticação
- **Registro:** Crie conta com email, senha e username
- **Login:** Entre com email e senha
- **Logout:** Botão no menu do usuário
- **Recuperação:** Link "Esqueceu a senha?"
- **Persistência:** Checkbox "Lembrar de mim"
- **Sessão:** Timeout automático após 1 hora

### Portal
- **Navegação:** 5 seções (Início, Servidores, Mods, Skins, Notícias)
- **Busca:** Campo de busca em cada seção
- **Favoritos:** Marque itens favoritos (persistente)
- **Vídeos:** 4 vídeos de fundo com navegação
- **Auto-switch:** Vídeos trocam a cada 45 segundos

### Dados Dinâmicos
Todos os dados são carregados do Firebase:
- Servidores (nome, IP, players, status, tags, ratings)
- Mods (nome, descrição, downloads, versão)
- Skins (nome, descrição, imagem)
- Notícias (título, conteúdo, data)

## 🔧 Configurações

### `js/config.js`
Altere conforme necessário:
```javascript
CONFIG = {
    PASSWORD: {
        MIN_LENGTH: 6,              // Tamanho mínimo da senha
        REQUIRE_UPPERCASE: false,   // Exigir maiúscula
        REQUIRE_NUMBER: false,      // Exigir número
        REQUIRE_SPECIAL: false      // Exigir caractere especial
    },
    SECURITY: {
        MAX_LOGIN_ATTEMPTS: 5,      // Máximo de tentativas
        LOCKOUT_DURATION: 300000,   // 5 minutos
        SESSION_TIMEOUT: 3600000    // 1 hora
    },
    // ... outras configurações
}
```

## 📊 Firebase Database Structure

```json
{
  "users": {
    "userId": {
      "username": "string",
      "email": "string",
      "createdAt": "timestamp",
      "role": "player",
      "emailVerified": "boolean",
      "stats": {
        "loginCount": "number",
        "lastLogin": "timestamp",
        "favorites": {},
        "ratings": {}
      },
      "profile": {
        "avatar": "string",
        "bio": "string"
      }
    }
  },
  "servers": {
    "serverId": {
      "name": "string",
      "ip": "string",
      "players": "number",
      "maxPlayers": "number",
      "online": "boolean",
      "tags": ["array"],
      "rating": "number",
      "ratings": {
        "userId": "number"
      }
    }
  },
  "mods": {
    "modId": {
      "name": "string",
      "description": "string",
      "downloads": "number",
      "version": "string"
    }
  },
  "skins": {
    "skinId": {
      "name": "string",
      "description": "string",
      "icon": "string",
      "imageUrl": "string"
    }
  },
  "news": {
    "newsId": {
      "title": "string",
      "summary": "string",
      "date": "timestamp",
      "link": "string"
    }
  }
}
```

## 🎨 Customização

### Cores
Edite `style.css` para alterar o tema:
```css
:root {
    --primary-color: #4CAF50;
    --secondary-color: #8BC34A;
    --background: #000000;
}
```

### Vídeos
Substitua os vídeos em `assets/`:
- `media1.mp4` - Tela de carregamento
- `media2.mp4` - Login e vídeo principal 1
- `media3.mp4` - Vídeo principal 2
- `media4.mp4` - Vídeo principal 3
- `media5.mp4` - Vídeo principal 4

### Ícones PWA
Adicione ícones em `assets/`:
- `icon-72.png` até `icon-512.png`

## 🐛 Debug

### Modo Desenvolvimento
O sistema detecta automaticamente se está em localhost e ativa logs detalhados.

### Console Logs
```javascript
Utils.log('info', 'Mensagem informativa');
Utils.log('warn', 'Aviso');
Utils.log('error', 'Erro', errorObject);
Utils.log('debug', 'Debug (apenas em dev)');
```

## 📈 Performance Tips

1. **Vídeos:** Comprima vídeos com FFmpeg
   ```bash
   ffmpeg -i input.mp4 -vcodec libx264 -crf 28 output.mp4
   ```

2. **Imagens:** Use WebP quando possível
   ```bash
   cwebp input.png -o output.webp
   ```

3. **Cache:** O Service Worker cacheia automaticamente

4. **CDN:** Em produção, use CDN para assets estáticos

## 🔐 Segurança em Produção

1. **Firebase Rules:** Configure regras de segurança
   ```json
   {
     "rules": {
       "users": {
         "$uid": {
           ".read": "$uid === auth.uid",
           ".write": "$uid === auth.uid"
         }
       }
     }
   }
   ```

2. **HTTPS:** Sempre use HTTPS em produção

3. **Environment Variables:** Não commite credenciais

4. **CSP Headers:** Configure Content Security Policy

## 📝 To-Do Futuro

- [ ] Sistema de comentários
- [ ] Chat em tempo real
- [ ] Notificações push
- [ ] Upload de skins customizadas
- [ ] Sistema de ranking de jogadores
- [ ] Integração com APIs de status de servidor
- [ ] Temas customizáveis (dark/light)
- [ ] Múltiplos idiomas (i18n)

## 📄 Licença

Este projeto é open source e pode ser usado livremente.

## 👨‍💻 Desenvolvido com
- Vanilla JavaScript (ES6+)
- Firebase (Auth + Realtime Database)
- Lucide Icons
- Service Workers / PWA
- CSS3 com animações

## 🤝 Contribuições

Contribuições são bem-vindas! Sinta-se livre para abrir issues ou pull requests.

---

**Versão:** 2.0.0
**Última atualização:** 2025
