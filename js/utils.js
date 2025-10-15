// Utilitários gerais
const Utils = {
    // Validação de email
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    // Validação de senha
    validatePassword(password) {
        const config = CONFIG.PASSWORD;
        const errors = [];
        
        if (password.length < config.MIN_LENGTH) {
            errors.push(`A senha deve ter no mínimo ${config.MIN_LENGTH} caracteres`);
        }
        
        if (config.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
            errors.push('A senha deve conter pelo menos uma letra maiúscula');
        }
        
        if (config.REQUIRE_NUMBER && !/\d/.test(password)) {
            errors.push('A senha deve conter pelo menos um número');
        }
        
        if (config.REQUIRE_SPECIAL && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('A senha deve conter pelo menos um caractere especial');
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    },
    
    // Validação de username
    validateUsername(username) {
        const config = CONFIG.USERNAME;
        const errors = [];
        
        if (username.length < config.MIN_LENGTH) {
            errors.push(`O nome de usuário deve ter no mínimo ${config.MIN_LENGTH} caracteres`);
        }
        
        if (username.length > config.MAX_LENGTH) {
            errors.push(`O nome de usuário deve ter no máximo ${config.MAX_LENGTH} caracteres`);
        }
        
        if (!config.PATTERN.test(username)) {
            errors.push('O nome de usuário deve conter apenas letras, números e underscore');
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    },
    
    // Sistema de notificações melhorado
    showNotification(message, type = 'success', duration = CONFIG.ANIMATION.NOTIFICATION_DURATION) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'polite');
        
        const icon = type === 'error' ? 'x-circle' : 
                    type === 'warning' ? 'alert-triangle' : 
                    type === 'info' ? 'info' : 'check-circle';
        
        notification.innerHTML = `
            <i data-lucide="${icon}"></i>
            <span>${message}</span>
        `;
        
        const backgroundColor = type === 'error' ? 'rgba(244, 67, 54, 0.95)' : 
                               type === 'warning' ? 'rgba(255, 152, 0, 0.95)' :
                               type === 'info' ? 'rgba(33, 150, 243, 0.95)' :
                               'rgba(76, 175, 80, 0.95)';
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${backgroundColor};
            color: white;
            padding: 15px 20px;
            border-radius: 12px;
            z-index: 10000;
            backdrop-filter: blur(10px);
            animation: slideIn 0.3s ease;
            font-weight: 500;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
            display: flex;
            align-items: center;
            gap: 10px;
            max-width: 400px;
        `;
        
        document.body.appendChild(notification);
        
        // Inicializa ícone Lucide
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, duration);
    },
    
    // Debounce para otimização de eventos
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Throttle para otimização de eventos
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // Logger centralizado
    log(level, message, data = null) {
        if (!CONFIG.IS_DEV && level === 'debug') return;
        
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
        
        switch(level) {
            case 'error':
                console.error(logMessage, data);
                break;
            case 'warn':
                console.warn(logMessage, data);
                break;
            case 'info':
                console.info(logMessage, data);
                break;
            default:
                console.log(logMessage, data);
        }
        
        // Em produção, poderia enviar para serviço de logging
        if (!CONFIG.IS_DEV && level === 'error') {
            // TODO: Enviar para Firebase Analytics ou Sentry
        }
    },
    
    // Sanitização de input
    sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    },
    
    // Formatação de data
    formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString('pt-BR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },
    
    // Formatação de número
    formatNumber(num) {
        return new Intl.NumberFormat('pt-BR').format(num);
    },
    
    // Copiar para clipboard
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            Utils.log('error', 'Erro ao copiar para clipboard', err);
            return false;
        }
    },
    
    // Detectar dispositivo móvel
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
    
    // Detectar conexão lenta
    isSlowConnection() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            return connection.effectiveType === 'slow-2g' || 
                   connection.effectiveType === '2g' ||
                   connection.saveData;
        }
        return false;
    },
    
    // Criar elemento com atributos
    createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        
        Object.keys(attributes).forEach(key => {
            if (key === 'class') {
                element.className = attributes[key];
            } else if (key === 'dataset') {
                Object.keys(attributes[key]).forEach(dataKey => {
                    element.dataset[dataKey] = attributes[key][dataKey];
                });
            } else {
                element.setAttribute(key, attributes[key]);
            }
        });
        
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else {
                element.appendChild(child);
            }
        });
        
        return element;
    }
};

// Exportar para uso global
window.Utils = Utils;
