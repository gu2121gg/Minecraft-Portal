# 🗂️ Estrutura do Projeto

```
Minecraft/
│
├── 📄 index.html                   # Página principal (HTML)
├── 🎨 style.css                    # Estilos globais (CSS)
├── 🔧 firebase.js                  # Configuração Firebase
├── ⚙️ script.js                    # Script principal (integração)
│
├── 📁 js/                          # Módulos JavaScript
│   ├── config.js                   # ⚙️  Configurações centralizadas
│   ├── utils.js                    # 🛠️  Funções utilitárias
│   ├── auth.js                     # 🔐 Gerenciamento de autenticação
│   ├── video.js                    # 🎬 Gerenciamento de vídeos
│   ├── portal.js                   # 🏠 Gerenciamento do portal
│   └── data.js                     # 💾 Gerenciamento de dados Firebase
│
├── 📁 assets/                      # Mídia e recursos
│   ├── media1.mp4                  # Vídeo de loading
│   ├── media2.mp4                  # Vídeo principal 1
│   ├── media3.mp4                  # Vídeo principal 2
│   ├── media4.mp4                  # Vídeo principal 3
│   ├── media5.mp4                  # Vídeo principal 4
│   ├── icon-*.png                  # Ícones PWA (72px até 512px)
│   ├── poster*.jpg                 # Imagens de poster (opcional)
│   └── screenshot*.png             # Screenshots (opcional)
│
├── 🔧 PWA e Service Worker
│   ├── sw.js                       # Service Worker
│   ├── manifest.json               # PWA Manifest
│   └── offline.html                # Página offline
│
├── 🔥 Firebase
│   ├── firebase.json               # Configuração Hosting
│   ├── firebase.rules.json         # Regras de segurança Database
│   └── firebase-example-data.json  # Dados de exemplo para importar
│
├── 📚 Documentação
│   ├── README.md                   # 📖 Documentação completa
│   ├── QUICK_START.md              # 🚀 Guia de início rápido
│   ├── CHANGELOG.md                # 📝 Histórico de mudanças
│   ├── SUMMARY.md                  # 📋 Sumário das melhorias
│   └── PROJECT_STRUCTURE.md        # 🗂️  Este arquivo
│
├── ⚙️ Configuração
│   ├── package.json                # Configuração NPM
│   ├── .gitignore                  # Arquivos ignorados
│   └── script-old.js               # Backup do script antigo
│
└── 📊 Estrutura Firebase (nuvem)
    ├── users/                      # Dados de usuários
    ├── servers/                    # Lista de servidores
    ├── mods/                       # Lista de mods
    ├── skins/                      # Lista de skins
    └── news/                       # Notícias e updates
```

## 📊 Mapa de Dependências

```
index.html
    │
    ├── Carrega → style.css
    │
    ├── Carrega → Lucide Icons (CDN)
    │
    ├── Carrega → Firebase SDK (CDN)
    │   ├── firebase-app-compat.js
    │   ├── firebase-auth-compat.js
    │   └── firebase-database-compat.js
    │
    ├── Carrega → Módulos Locais
    │   ├── js/config.js        (configurações)
    │   ├── js/utils.js         (utilitários)
    │   ├── firebase.js         (init Firebase)
    │   ├── js/auth.js          (classe AuthManager)
    │   ├── js/video.js         (classe VideoManager)
    │   ├── js/data.js          (classe DataManager)
    │   ├── js/portal.js        (classe PortalManager)
    │   └── script.js           (integração)
    │
    └── Registra → sw.js (Service Worker)
```

## 🔄 Fluxo de Dados

```
Usuário
    ↓
[index.html] → Carrega recursos
    ↓
[script.js] → Inicializa app
    ↓
    ├── [AuthManager] → Gerencia login/logout
    │       ↓
    │   [Firebase Auth] → Autenticação
    │       ↓
    │   [Firebase Database] → Salva dados do usuário
    │
    ├── [VideoManager] → Controla vídeos de fundo
    │       ↓
    │   Detecta conexão → Ajusta qualidade
    │
    ├── [DataManager] → Busca dados
    │       ↓
    │   [Firebase Database] → servers, mods, skins, news
    │       ↓
    │   Cache local (5min) → Otimização
    │
    └── [PortalManager] → Renderiza interface
            ↓
        Busca, Favoritos, Navegação
            ↓
        localStorage → Persistência local
```

## 🎯 Arquivos por Responsabilidade

### 🎨 Interface (Frontend)
```
index.html          Estrutura HTML
style.css           Estilos e animações
```

### 🧠 Lógica (JavaScript)
```
js/config.js        Configurações globais
js/utils.js         Funções auxiliares
js/auth.js          Sistema de autenticação
js/video.js         Controle de vídeos
js/portal.js        Interface do portal
js/data.js          Comunicação com Firebase
script.js           Orquestração geral
```

### 🔥 Backend (Firebase)
```
firebase.js             Inicialização
firebase.rules.json     Regras de segurança
firebase-example-data   Dados de exemplo
```

### 📱 PWA
```
sw.js               Service Worker
manifest.json       Configuração PWA
offline.html        Página offline
```

### 📚 Documentação
```
README.md           Guia completo
QUICK_START.md      Início rápido
CHANGELOG.md        Histórico
SUMMARY.md          Resumo
PROJECT_STRUCTURE.md Este arquivo
```

## 📏 Tamanho dos Arquivos

| Tipo | Arquivos | Tamanho Total | % |
|------|----------|---------------|---|
| JavaScript | 8 arquivos | ~90 KB | 40% |
| CSS | 1 arquivo | ~25 KB | 11% |
| HTML | 3 arquivos | ~20 KB | 9% |
| Documentação | 5 arquivos | ~35 KB | 16% |
| Config | 5 arquivos | ~15 KB | 7% |
| Assets | Variável | ~5-50 MB | 17% |

**Total (sem assets):** ~185 KB  
**Total (com assets):** ~5-50 MB

## 🔍 Como Encontrar

### "Onde está a configuração de X?"
```
Senha/Segurança    → js/config.js
Firebase           → firebase.js + js/config.js
Cores/Estilos      → style.css
Textos estáticos   → index.html
```

### "Onde modifico a lógica de X?"
```
Login/Logout       → js/auth.js
Vídeos             → js/video.js
Navegação          → js/portal.js
Dados              → js/data.js
Validações         → js/utils.js
```

### "Onde adiciono novos X?"
```
Servidor           → Firebase Database → servers/
Mod                → Firebase Database → mods/
Skin               → Firebase Database → skins/
Notícia            → Firebase Database → news/
```

## 🚀 Ordem de Carregamento

1. **HTML** - `index.html` carrega
2. **CSS** - `style.css` aplica estilos
3. **CDN** - Lucide Icons + Firebase SDK
4. **Config** - `js/config.js` define constantes
5. **Utils** - `js/utils.js` define utilidades
6. **Firebase** - `firebase.js` inicializa
7. **Módulos** - auth, video, data, portal
8. **Main** - `script.js` orquestra tudo
9. **SW** - Service Worker registrado
10. **PWA** - Manifest carregado

## 🔧 Personalização Rápida

### Mudar cores → `style.css`
```css
/* Linha ~1 */
--primary-color: #4CAF50;
--secondary-color: #8BC34A;
```

### Ajustar segurança → `js/config.js`
```javascript
// Linha ~30
PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true
}
```

### Trocar vídeos → `assets/`
```
Substituir: media1.mp4, media2.mp4, etc.
```

### Modificar dados → Firebase Console
```
Realtime Database → Editar diretamente
```

## 📦 Arquivos Opcionais

Podem ser removidos sem quebrar a aplicação:

- ❌ `README.md`, `QUICK_START.md`, etc. (documentação)
- ❌ `firebase-example-data.json` (apenas para importação inicial)
- ❌ `package.json` (se não usar npm)
- ❌ `script-old.js` (backup)
- ❌ `.gitignore` (se não usar Git)

## 📋 Checklist de Arquivos Necessários

### ✅ Essenciais (não remover)
```
✓ index.html
✓ style.css
✓ firebase.js
✓ script.js
✓ js/config.js
✓ js/utils.js
✓ js/auth.js
✓ js/video.js
✓ js/portal.js
✓ js/data.js
✓ sw.js
✓ manifest.json
```

### ⚠️ Recomendados
```
✓ offline.html
✓ firebase.json
✓ firebase.rules.json
✓ assets/ (vídeos e ícones)
```

### 📚 Opcionais
```
? README.md
? QUICK_START.md
? package.json
? .gitignore
```

## 🎯 Arquivos para Deploy

Ao fazer deploy para produção, inclua:

```
✅ index.html
✅ style.css
✅ firebase.js
✅ script.js
✅ js/ (todos os módulos)
✅ sw.js
✅ manifest.json
✅ offline.html
✅ assets/ (mídia)
✅ firebase.json (se usar Firebase Hosting)

❌ README.md (não necessário)
❌ package.json (não necessário)
❌ firebase-example-data.json (apenas local)
❌ script-old.js (backup)
❌ *.md (documentação)
```

---

**Estrutura organizada para fácil manutenção e escalabilidade! 🚀**
