# 🚀 Guia de Deploy - Minecraft Portal

## 📋 Pré-requisitos

- [ ] Node.js instalado (v14+)
- [ ] Conta Firebase criada
- [ ] Projeto Firebase configurado
- [ ] Firebase CLI instalado

## 🔧 Configuração Inicial

### 1. Instalar Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Login no Firebase

```bash
firebase login
```

### 3. Inicializar Projeto

```bash
cd c:\Users\Gu2121gg\Desktop\Minecraft
firebase init
```

Selecione:
- [x] Hosting
- [x] Realtime Database

### 4. Configurar firebase.json

O arquivo já está configurado. Verifique:

```json
{
  "hosting": {
    "public": ".",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"]
  }
}
```

## 🔥 Deploy para Firebase Hosting

### Deploy Completo

```bash
firebase deploy
```

### Deploy Apenas Hosting

```bash
firebase deploy --only hosting
```

### Deploy Apenas Database Rules

```bash
firebase deploy --only database
```

## 🌐 Outros Provedores

### Netlify

#### Via CLI
```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=.
```

#### Via Interface
1. Acesse [netlify.com](https://netlify.com)
2. Drag & drop a pasta do projeto
3. Configure build settings:
   - Base directory: `/`
   - Build command: (vazio)
   - Publish directory: `.`

### Vercel

```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### GitHub Pages

1. Criar repositório no GitHub
2. Push do projeto
3. Settings > Pages
4. Source: main branch / root

### Servidor Próprio

#### Apache

```apache
# .htaccess
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Cache
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 1 week"
  ExpiresByType application/javascript "access plus 1 week"
  ExpiresByType image/png "access plus 1 month"
  ExpiresByType image/jpg "access plus 1 month"
  ExpiresByType video/mp4 "access plus 1 month"
</IfModule>
```

#### Nginx

```nginx
server {
    listen 80;
    server_name seudominio.com;
    root /var/www/minecraft-portal;
    index index.html;

    # Gzip
    gzip on;
    gzip_types text/css application/javascript image/svg+xml;

    # Cache
    location ~* \.(css|js)$ {
        expires 7d;
        add_header Cache-Control "public, immutable";
    }

    location ~* \.(jpg|jpeg|png|gif|mp4)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Service Worker sem cache
    location = /sw.js {
        expires off;
        add_header Cache-Control "no-cache";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## ✅ Checklist Pré-Deploy

### Configuração
- [ ] Firebase credentials em `js/config.js`
- [ ] Database rules aplicadas
- [ ] Authentication ativado
- [ ] Dados de exemplo importados

### Assets
- [ ] Vídeos otimizados (<5MB cada)
- [ ] Ícones PWA adicionados
- [ ] Imagens comprimidas
- [ ] Fontes incluídas (se houver)

### Código
- [ ] Console logs removidos (produção)
- [ ] Analytics configurado
- [ ] URLs de API corretas
- [ ] Variáveis de ambiente (se aplicável)

### SEO
- [ ] Meta tags preenchidas
- [ ] Open Graph tags
- [ ] Sitemap.xml criado
- [ ] robots.txt configurado

### Segurança
- [ ] HTTPS ativado
- [ ] Firebase rules configuradas
- [ ] Credenciais protegidas
- [ ] CSP headers (se possível)

### Performance
- [ ] Minificação (opcional)
- [ ] Compressão Gzip
- [ ] Cache headers
- [ ] Service Worker testado

### Testes
- [ ] Funciona em Chrome
- [ ] Funciona em Firefox
- [ ] Funciona em Safari
- [ ] Funciona em Edge
- [ ] Funciona em mobile
- [ ] PWA instalável
- [ ] Funciona offline

## 🔍 Teste Pré-Deploy Local

```bash
# Testar com Firebase Emulator
firebase serve

# Ou com servidor simples
python -m http.server 8000

# Testar PWA localmente
# Chrome DevTools > Application > Service Workers
# Lighthouse > Run audit
```

## 📊 Pós-Deploy

### Verificações

1. **Acesse o site**
   - URL funciona?
   - HTTPS ativo?
   - Certificado válido?

2. **Teste funcionalidades**
   - Login/Registro
   - Navegação
   - Busca
   - Favoritos
   - Vídeos

3. **PWA**
   - Prompt de instalação aparece?
   - Ícone correto?
   - Funciona offline?

4. **Performance**
   - Lighthouse score >90?
   - Carregamento <3s?
   - Sem erros no console?

### Monitoramento

```javascript
// Já configurado em script.js

// Analytics
if (window.analytics) {
    window.analytics.logEvent('page_view');
}

// Error tracking
window.addEventListener('error', (e) => {
    // Erros são logados automaticamente
});

// Performance
window.addEventListener('load', () => {
    // Métricas são coletadas automaticamente
});
```

## 🐛 Troubleshooting

### Service Worker não registra
```javascript
// Verificar em Chrome DevTools > Application
// Limpar e re-registrar:
navigator.serviceWorker.getRegistrations()
    .then(regs => regs.forEach(reg => reg.unregister()));
```

### Firebase não conecta
1. Verifique credenciais em `js/config.js`
2. Confirme domínio autorizado no Firebase Console
3. Verifique console do navegador

### Vídeos não carregam
1. Confirme arquivos em `assets/`
2. Verifique MIME types no servidor
3. Teste com vídeos menores

### PWA não instala
1. Verifique HTTPS
2. Confirme manifest.json válido
3. Verifique ícones 192x192 e 512x512

## 📈 Otimizações Pós-Deploy

### CDN (Recomendado)

```javascript
// Usar CDN para assets estáticos
const CDN_URL = 'https://cdn.seudominio.com';

// Em index.html
<video src="${CDN_URL}/assets/media1.mp4">
```

### Compressão de Vídeos

```bash
# FFmpeg - Reduzir tamanho mantendo qualidade
ffmpeg -i input.mp4 -vcodec libx264 -crf 28 -preset slow output.mp4

# WebM (melhor compressão)
ffmpeg -i input.mp4 -c:v libvpx-vp9 -crf 30 -b:v 0 output.webm
```

### Lazy Loading Agressivo

```javascript
// Em js/config.js
LOADING: {
    PRELOAD_DELAY: 5000  // Aumentar delay
}
```

### Analytics Avançado

```javascript
// Firebase Analytics
firebase.analytics().logEvent('custom_event', {
    category: 'engagement',
    action: 'scroll',
    label: 'homepage'
});
```

## 🔒 Segurança Pós-Deploy

### Headers de Segurança

```nginx
# Nginx
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
add_header Referrer-Policy "strict-origin-when-cross-origin";

# CSP (Content Security Policy)
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.gstatic.com https://unpkg.com; style-src 'self' 'unsafe-inline';";
```

### Firebase Rules Produção

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "servers": {
      ".read": "auth != null",
      ".write": "auth != null && root.child('users/' + auth.uid + '/role').val() === 'admin'"
    }
  }
}
```

## 📱 App Stores (Futuro)

### Google Play (TWA)

1. Usar Bubblewrap
```bash
npm install -g @bubblewrap/cli
bubblewrap init --manifest https://seusite.com/manifest.json
bubblewrap build
```

### Apple App Store

Usar serviço como [PWABuilder](https://www.pwabuilder.com)

## 📊 Monitoramento Recomendado

### Serviços
- 📈 Google Analytics / Firebase Analytics
- 🐛 Sentry (error tracking)
- ⚡ Firebase Performance
- 📊 Google Search Console
- 🔍 Lighthouse CI

### Métricas Importantes
- Page views
- User engagement
- Error rate
- Performance score
- SEO ranking

## 💰 Custos Estimados

### Firebase (Free Tier)
- ✅ Hosting: 10GB/mês
- ✅ Database: 1GB
- ✅ Authentication: ilimitado
- ✅ SSL: incluído

### Netlify (Free Tier)
- ✅ Hosting: 100GB/mês
- ✅ SSL: incluído
- ✅ CDN: global

### Vercel (Free Tier)
- ✅ Hosting: 100GB/mês
- ✅ SSL: incluído
- ✅ Serverless: incluído

## 🎯 Próximos Passos

1. **Semana 1:** Deploy e teste
2. **Semana 2:** Monitoramento e ajustes
3. **Mês 1:** Analytics e otimizações
4. **Mês 2+:** Novas features

---

## 📞 Comandos Rápidos

```bash
# Deploy Firebase
firebase deploy

# Preview local
firebase serve

# Limpar cache
firebase hosting:channel:delete preview

# Ver logs
firebase functions:log

# Rollback
firebase hosting:clone SOURCE_SITE_ID:SOURCE_CHANNEL DEST_SITE_ID:live
```

---

**Seu projeto está pronto para deploy! 🚀**

Para suporte, consulte a [documentação oficial do Firebase](https://firebase.google.com/docs).
