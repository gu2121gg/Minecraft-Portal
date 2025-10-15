# 🚀 Guia de Início Rápido

## ⚡ Em 5 Minutos

### 1. Configurar Firebase (2 min)

#### Passo 1: Criar Projeto
1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Clique em "Adicionar projeto"
3. Nomeie como "Minecraft Portal"
4. Desative Google Analytics (opcional)
5. Clique em "Criar projeto"

#### Passo 2: Ativar Autenticação
1. No menu lateral, clique em "Authentication"
2. Clique em "Começar"
3. Ative "Email/senha"
4. Salve

#### Passo 3: Ativar Database
1. No menu lateral, clique em "Realtime Database"
2. Clique em "Criar banco de dados"
3. Selecione localização (us-central1)
4. Inicie em "modo de teste"
5. Clique em "Ativar"

#### Passo 4: Configurar Regras de Segurança
Cole estas regras no Database:
```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid || auth != null",
        ".write": "$uid === auth.uid"
      }
    },
    "servers": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "mods": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "skins": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "news": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

#### Passo 5: Importar Dados de Exemplo
1. No Realtime Database, clique nos três pontos (⋮)
2. Selecione "Importar JSON"
3. Escolha o arquivo `firebase-example-data.json`
4. Clique em "Importar"

#### Passo 6: Copiar Credenciais
1. Vá em "Configurações do projeto" (ícone de engrenagem)
2. Role até "Seus aplicativos"
3. Clique no ícone web `</>`
4. Registre o app como "Minecraft Portal Web"
5. **NÃO** marque Firebase Hosting
6. Copie as credenciais mostradas

#### Passo 7: Atualizar Configuração
Cole as credenciais em `js/config.js`:
```javascript
FIREBASE: {
    apiKey: "SUA_API_KEY_AQUI",
    authDomain: "SEU_PROJECT.firebaseapp.com",
    databaseURL: "https://SEU_PROJECT.firebaseio.com",
    projectId: "SEU_PROJECT_ID",
    storageBucket: "SEU_PROJECT.appspot.com",
    messagingSenderId: "SEU_SENDER_ID",
    appId: "SEU_APP_ID"
}
```

### 2. Iniciar Servidor Local (1 min)

#### Opção A: Python (Mais simples)
```bash
cd Minecraft
python -m http.server 8000
```

#### Opção B: Node.js
```bash
npx serve -p 8000
```

#### Opção C: PHP
```bash
php -S localhost:8000
```

#### Opção D: VS Code Live Server
1. Instale extensão "Live Server"
2. Clique com botão direito em `index.html`
3. Selecione "Open with Live Server"

### 3. Testar (2 min)

1. **Abra o navegador:** `http://localhost:8000`

2. **Aguarde o carregamento** (ou clique para pular)

3. **Crie uma conta:**
   - Email: teste@exemplo.com
   - Senha: 123456 (ou qualquer senha com 6+ caracteres)
   - Username: TestUser

4. **Explore as funcionalidades:**
   - ✅ Navegue entre as seções
   - ✅ Busque por servidores/mods/skins
   - ✅ Marque favoritos (ícone de coração)
   - ✅ Copie IP de servidor (clique no IP)
   - ✅ Teste o menu do usuário (ícone superior direito)
   - ✅ Faça logout e login novamente

5. **Teste PWA (Opcional):**
   - Chrome: Procure ícone de instalação na barra de endereço
   - Clique para instalar como app

## 🎯 Próximos Passos

### Personalização Básica

#### 1. Alterar Cores
Edite `style.css` (linha ~1):
```css
:root {
    --primary: #4CAF50;     /* Verde principal */
    --secondary: #8BC34A;   /* Verde secundário */
}
```

#### 2. Trocar Vídeos
Substitua em `assets/`:
- `media1.mp4` (tela de loading)
- `media2.mp4` até `media5.mp4` (vídeos principais)

**Dica:** Mantenha vídeos com ~10-20 segundos e <5MB cada

#### 3. Adicionar Seus Dados

**Via Firebase Console:**
1. Acesse Realtime Database
2. Clique em `servers/` para adicionar novo servidor
3. Use a estrutura:
```json
{
  "name": "Meu Servidor",
  "ip": "meu.servidor.com",
  "players": 50,
  "maxPlayers": 100,
  "online": true,
  "tags": ["Survival", "PvE"],
  "rating": 0
}
```

**Ou via código:**
No console do navegador (F12):
```javascript
// Adicionar servidor
dataManager.addServer({
    name: "Meu Servidor",
    ip: "meu.servidor.com",
    players: 50,
    maxPlayers: 100,
    online: true,
    tags: ["Survival"],
    rating: 4.5
});
```

### Configurações Avançadas

#### 1. Ajustar Segurança de Senha
`js/config.js`:
```javascript
PASSWORD: {
    MIN_LENGTH: 8,              // 8 caracteres mínimo
    REQUIRE_UPPERCASE: true,    // Exigir maiúscula
    REQUIRE_NUMBER: true,       // Exigir número
    REQUIRE_SPECIAL: true       // Exigir especial (@#$%)
}
```

#### 2. Alterar Timeout de Sessão
```javascript
SECURITY: {
    SESSION_TIMEOUT: 7200000    // 2 horas (em ms)
}
```

#### 3. Alterar Tempo de Auto-Switch de Vídeos
```javascript
ANIMATION: {
    VIDEO_AUTO_SWITCH: 60000    // 1 minuto (em ms)
}
```

## 🐛 Troubleshooting

### Problema: "Firebase não está definido"
**Solução:** Verifique se está usando servidor web (não abrindo arquivo diretamente)

### Problema: Vídeos não carregam
**Solução:** 
1. Verifique se arquivos existem em `assets/`
2. Verifique console do navegador (F12)
3. Teste com vídeos menores

### Problema: Login não funciona
**Solução:**
1. Verifique credenciais Firebase em `js/config.js`
2. Confirme que Authentication está ativado
3. Verifique console para erros

### Problema: Dados não aparecem
**Solução:**
1. Verifique se importou `firebase-example-data.json`
2. Verifique regras de segurança do Database
3. Abra console (F12) e procure por erros

### Problema: Service Worker não registra
**Solução:**
1. Use HTTPS ou localhost
2. Verifique console para erros
3. Limpe cache: DevTools > Application > Clear storage

## 📝 Checklist de Funcionalidades

Teste tudo funciona:

### Autenticação
- [ ] Criar conta nova
- [ ] Receber email de verificação (verifique spam)
- [ ] Fazer login
- [ ] "Lembrar de mim" funciona
- [ ] Recuperar senha
- [ ] Fazer logout
- [ ] Timeout de sessão (após 1h)

### Portal
- [ ] Navegação entre seções
- [ ] Busca funciona em cada seção
- [ ] Marcar/desmarcar favoritos
- [ ] Favoritos persistem após recarregar
- [ ] Copiar IP do servidor
- [ ] Download de mods/skins (simulado)
- [ ] Menu do usuário abre/fecha
- [ ] Informações do usuário aparecem

### Vídeos
- [ ] Vídeo de loading toca
- [ ] Vídeo de login toca
- [ ] Vídeos principais trocam
- [ ] Botões prev/next funcionam
- [ ] Teclas ← → funcionam
- [ ] Auto-switch funciona (45s)
- [ ] Contador atualiza

### PWA
- [ ] Ícone de instalação aparece
- [ ] App instala como PWA
- [ ] Funciona offline (após primeira visita)
- [ ] Página offline aparece sem conexão

### Performance
- [ ] Carregamento inicial <3s
- [ ] Navegação suave
- [ ] Sem travamentos
- [ ] Console sem erros críticos

## 🎓 Recursos de Aprendizado

### Documentação
- [Firebase Docs](https://firebase.google.com/docs)
- [PWA Guide](https://web.dev/progressive-web-apps/)
- [Lucide Icons](https://lucide.dev)

### Tutoriais Recomendados
- Firebase Authentication: [Link](https://firebase.google.com/docs/auth/web/start)
- Firebase Database: [Link](https://firebase.google.com/docs/database/web/start)
- Service Workers: [Link](https://web.dev/service-workers-101/)

## ✅ Pronto para Produção?

Antes de colocar online:

1. **Segurança:**
   - [ ] Mover credenciais Firebase para variáveis de ambiente
   - [ ] Configurar regras de segurança adequadas
   - [ ] Ativar verificação de email obrigatória
   - [ ] Configurar domínios autorizados no Firebase

2. **Performance:**
   - [ ] Comprimir vídeos
   - [ ] Otimizar imagens
   - [ ] Minificar JS/CSS
   - [ ] Configurar CDN

3. **SEO:**
   - [ ] Adicionar meta tags
   - [ ] Criar sitemap.xml
   - [ ] Configurar robots.txt
   - [ ] Adicionar Open Graph tags

4. **Monitoramento:**
   - [ ] Ativar Firebase Analytics
   - [ ] Configurar Error Tracking (Sentry)
   - [ ] Monitorar performance

## 🆘 Precisa de Ajuda?

- Verifique `README.md` para documentação completa
- Veja `CHANGELOG.md` para histórico de mudanças
- Abra issue no GitHub (se aplicável)
- Revise console do navegador (F12) para erros

---

**Tempo estimado total:** 5-10 minutos
**Dificuldade:** Fácil
**Pré-requisitos:** Navegador moderno + Python/Node.js
