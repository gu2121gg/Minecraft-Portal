// Módulo de Autenticação
class AuthManager {
    constructor() {
        this.loginAttempts = 0;
        this.lockoutUntil = null;
        this.sessionTimeout = null;
        this.currentUser = null;
        
        this.initElements();
        this.initEventListeners();
        this.checkRememberedUser();
    }
    
    initElements() {
        this.loginScreen = document.getElementById('login-screen');
        this.loginForm = document.getElementById('login-form');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.usernameInput = document.getElementById('username');
        this.usernameGroup = document.getElementById('username-group');
        this.authBtn = document.getElementById('auth-btn');
        this.toggleModeBtn = document.getElementById('toggle-mode');
        this.forgotPasswordLink = document.querySelector('.forgot-password');
        this.rememberCheckbox = document.getElementById('remember');
        this.isRegisterMode = false;
    }
    
    initEventListeners() {
        // Toggle entre login e registro
        this.toggleModeBtn.addEventListener('click', () => this.toggleMode());
        
        // Submit do formulário
        this.loginForm.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Esqueceu a senha
        this.forgotPasswordLink.addEventListener('click', (e) => this.handleForgotPassword(e));
        
        // Validação em tempo real
        this.emailInput.addEventListener('blur', () => this.validateEmailField());
        this.passwordInput.addEventListener('input', () => this.validatePasswordField());
        this.usernameInput.addEventListener('blur', () => this.validateUsernameField());
    }
    
    toggleMode() {
        this.isRegisterMode = !this.isRegisterMode;
        
        if (this.isRegisterMode) {
            this.usernameGroup.style.display = 'block';
            this.authBtn.querySelector('.btn-text').textContent = 'Criar Conta';
            this.toggleModeBtn.textContent = 'Já tem conta? Faça login';
        } else {
            this.usernameGroup.style.display = 'none';
            this.authBtn.querySelector('.btn-text').textContent = 'Entrar no Portal';
            this.toggleModeBtn.textContent = 'Não tem conta? Registre-se';
        }
        
        // Limpar erros
        this.clearFieldErrors();
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        // Verificar lockout
        if (this.isLockedOut()) {
            const remainingTime = Math.ceil((this.lockoutUntil - Date.now()) / 1000);
            Utils.showNotification(`Muitas tentativas. Tente novamente em ${remainingTime}s`, 'error');
            return;
        }
        
        const email = this.emailInput.value.trim();
        const password = this.passwordInput.value;
        const username = this.usernameInput.value.trim();
        
        // Validação
        if (!this.validateForm(email, password, username)) {
            return;
        }
        
        // Mostrar loading
        this.setLoadingState(true);
        
        try {
            let result;
            
            if (this.isRegisterMode) {
                result = await window.firebaseAuth.register(email, password, username);
                
                if (result.success) {
                    Utils.showNotification(`Conta criada com sucesso! Bem-vindo, ${username}!`, 'success');
                    this.loginAttempts = 0;
                    
                    // Salvar preferência de lembrar
                    if (this.rememberCheckbox.checked) {
                        this.rememberUser(email);
                    }
                    
                    setTimeout(() => {
                        this.completeLogin(result.user);
                    }, CONFIG.ANIMATION.REGISTER_SUCCESS_DELAY);
                } else {
                    this.handleAuthError(result.error);
                }
            } else {
                result = await window.firebaseAuth.login(email, password);
                
                if (result.success) {
                    const displayName = result.user.displayName || result.user.email;
                    Utils.showNotification(`Bem-vindo de volta, ${displayName}!`, 'success');
                    this.loginAttempts = 0;
                    
                    // Salvar preferência de lembrar
                    if (this.rememberCheckbox.checked) {
                        this.rememberUser(email);
                    } else {
                        this.forgetUser();
                    }
                    
                    setTimeout(() => {
                        this.completeLogin(result.user);
                    }, CONFIG.ANIMATION.LOGIN_SUCCESS_DELAY);
                } else {
                    this.loginAttempts++;
                    
                    if (this.loginAttempts >= CONFIG.SECURITY.MAX_LOGIN_ATTEMPTS) {
                        this.lockoutUntil = Date.now() + CONFIG.SECURITY.LOCKOUT_DURATION;
                        Utils.showNotification('Muitas tentativas de login. Conta temporariamente bloqueada.', 'error');
                    } else {
                        this.handleAuthError(result.error);
                    }
                }
            }
        } catch (error) {
            Utils.log('error', 'Erro de autenticação:', error);
            Utils.showNotification('Erro de conexão. Tente novamente.', 'error');
        } finally {
            this.setLoadingState(false);
        }
    }
    
    async handleForgotPassword(e) {
        e.preventDefault();
        
        const email = this.emailInput.value.trim();
        
        if (!email) {
            Utils.showNotification('Digite seu email primeiro', 'warning');
            this.emailInput.focus();
            return;
        }
        
        if (!Utils.validateEmail(email)) {
            Utils.showNotification('Email inválido', 'error');
            return;
        }
        
        const result = await window.firebaseAuth.resetPassword(email);
        
        if (result.success) {
            Utils.showNotification('Email de recuperação enviado! Verifique sua caixa de entrada.', 'success');
        } else {
            Utils.showNotification('Erro ao enviar email de recuperação', 'error');
        }
    }
    
    validateForm(email, password, username) {
        let isValid = true;
        
        // Validar email
        if (!email) {
            this.showFieldError(this.emailInput, 'Email é obrigatório');
            isValid = false;
        } else if (!Utils.validateEmail(email)) {
            this.showFieldError(this.emailInput, 'Email inválido');
            isValid = false;
        }
        
        // Validar senha
        if (!password) {
            this.showFieldError(this.passwordInput, 'Senha é obrigatória');
            isValid = false;
        } else {
            const passwordValidation = Utils.validatePassword(password);
            if (!passwordValidation.valid) {
                this.showFieldError(this.passwordInput, passwordValidation.errors[0]);
                isValid = false;
            }
        }
        
        // Validar username (apenas no registro)
        if (this.isRegisterMode) {
            if (!username) {
                this.showFieldError(this.usernameInput, 'Nome de usuário é obrigatório');
                isValid = false;
            } else {
                const usernameValidation = Utils.validateUsername(username);
                if (!usernameValidation.valid) {
                    this.showFieldError(this.usernameInput, usernameValidation.errors[0]);
                    isValid = false;
                }
            }
        }
        
        return isValid;
    }
    
    validateEmailField() {
        const email = this.emailInput.value.trim();
        if (email && !Utils.validateEmail(email)) {
            this.showFieldError(this.emailInput, 'Email inválido');
            return false;
        } else {
            this.clearFieldError(this.emailInput);
            return true;
        }
    }
    
    validatePasswordField() {
        const password = this.passwordInput.value;
        if (password) {
            const validation = Utils.validatePassword(password);
            if (!validation.valid) {
                this.showFieldError(this.passwordInput, validation.errors[0]);
                return false;
            } else {
                this.clearFieldError(this.passwordInput);
                return true;
            }
        }
        return true;
    }
    
    validateUsernameField() {
        const username = this.usernameInput.value.trim();
        if (username) {
            const validation = Utils.validateUsername(username);
            if (!validation.valid) {
                this.showFieldError(this.usernameInput, validation.errors[0]);
                return false;
            } else {
                this.clearFieldError(this.usernameInput);
                return true;
            }
        }
        return true;
    }
    
    showFieldError(field, message) {
        const parent = field.parentElement;
        
        // Remove erro anterior
        const existingError = parent.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Adiciona novo erro
        const error = document.createElement('span');
        error.className = 'field-error';
        error.textContent = message;
        error.style.cssText = `
            color: #f44336;
            font-size: 12px;
            margin-top: 5px;
            display: block;
        `;
        
        parent.appendChild(error);
        field.style.borderColor = '#f44336';
    }
    
    clearFieldError(field) {
        const parent = field.parentElement;
        const error = parent.querySelector('.field-error');
        if (error) {
            error.remove();
        }
        field.style.borderColor = '';
    }
    
    clearFieldErrors() {
        [this.emailInput, this.passwordInput, this.usernameInput].forEach(field => {
            this.clearFieldError(field);
        });
    }
    
    handleAuthError(errorMessage) {
        let message = 'Erro ao autenticar';
        
        if (errorMessage.includes('email-already-in-use')) {
            message = 'Este email já está em uso';
        } else if (errorMessage.includes('user-not-found')) {
            message = 'Usuário não encontrado';
        } else if (errorMessage.includes('wrong-password')) {
            message = 'Senha incorreta';
        } else if (errorMessage.includes('weak-password')) {
            message = 'Senha muito fraca';
        } else if (errorMessage.includes('invalid-email')) {
            message = 'Email inválido';
        } else if (errorMessage.includes('too-many-requests')) {
            message = 'Muitas tentativas. Tente mais tarde.';
        }
        
        Utils.showNotification(message, 'error');
    }
    
    setLoadingState(loading) {
        if (loading) {
            this.authBtn.classList.add('loading');
            this.authBtn.disabled = true;
        } else {
            this.authBtn.classList.remove('loading');
            this.authBtn.disabled = false;
        }
    }
    
    isLockedOut() {
        return this.lockoutUntil && Date.now() < this.lockoutUntil;
    }
    
    rememberUser(email) {
        localStorage.setItem('rememberedEmail', email);
    }
    
    forgetUser() {
        localStorage.removeItem('rememberedEmail');
    }
    
    checkRememberedUser() {
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            this.emailInput.value = rememberedEmail;
            this.rememberCheckbox.checked = true;
        }
    }
    
    completeLogin(user) {
        this.currentUser = user;
        
        // Configurar timeout de sessão
        this.resetSessionTimeout();
        
        // Fade out da tela de login
        this.loginScreen.classList.remove('show');
        this.loginScreen.classList.add('hidden');
        
        // Mostrar conteúdo principal
        setTimeout(() => {
            if (window.portalManager) {
                window.portalManager.show();
            }
        }, CONFIG.ANIMATION.FADE_OUT);
    }
    
    resetSessionTimeout() {
        if (this.sessionTimeout) {
            clearTimeout(this.sessionTimeout);
        }
        
        this.sessionTimeout = setTimeout(() => {
            this.logout();
            Utils.showNotification('Sessão expirada. Faça login novamente.', 'warning');
        }, CONFIG.SECURITY.SESSION_TIMEOUT);
    }
    
    async logout() {
        const result = await window.firebaseAuth.logout();
        
        if (result.success) {
            this.currentUser = null;
            
            if (this.sessionTimeout) {
                clearTimeout(this.sessionTimeout);
            }
            
            // Voltar para tela de login
            if (window.portalManager) {
                window.portalManager.hide();
            }
            
            setTimeout(() => {
                this.loginScreen.classList.remove('hidden');
                this.loginScreen.classList.add('show');
            }, CONFIG.ANIMATION.FADE_OUT);
            
            Utils.showNotification('Logout realizado com sucesso', 'success');
        }
    }
    
    getCurrentUser() {
        return this.currentUser;
    }
}

// Exportar
window.AuthManager = AuthManager;
