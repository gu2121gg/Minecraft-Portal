// Configuração do Firebase (usando CONFIG do arquivo config.js)
const firebaseConfig = window.CONFIG ? window.CONFIG.FIREBASE : {
    apiKey: "AIzaSyDPI1Rc_rRBlV9a50shZ5OnddJfSh1Q9W8",
    authDomain: "gspixel-a9207.firebaseapp.com",
    databaseURL: "https://gspixel-a9207-default-rtdb.firebaseio.com",
    projectId: "gspixel-a9207",
    storageBucket: "gspixel-a9207.firebasestorage.app",
    messagingSenderId: "819334339760",
    appId: "1:819334339760:web:cdeaa73ad61f48586c6f75"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Configurar persistência
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .catch((error) => {
        console.error('Erro ao configurar persistência:', error);
    });

// Referências aos serviços
const auth = firebase.auth();
const database = firebase.database();

// Função para registrar novo usuário
async function registerUser(email, password, username) {
    try {
        // Criar usuário no Authentication
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Enviar email de verificação
        await user.sendEmailVerification({
            url: window.location.origin,
            handleCodeInApp: false
        }).catch(err => console.warn('Erro ao enviar email de verificação:', err));
        
        // Salvar dados adicionais no Database
        await database.ref('users/' + user.uid).set({
            username: username,
            email: email,
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            role: 'player',
            emailVerified: false,
            stats: {
                loginCount: 0,
                lastLogin: null,
                favorites: {},
                ratings: {}
            },
            profile: {
                avatar: null,
                bio: ''
            }
        });
        
        // Atualizar perfil do usuário
        await user.updateProfile({
            displayName: username
        });
        
        return { success: true, user: user };
    } catch (error) {
        console.error('Erro ao registrar:', error);
        return { success: false, error: error.message };
    }
}

// Função para fazer login
async function loginUser(email, password) {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Atualizar estatísticas de login
        const userRef = database.ref('users/' + user.uid);
        const snapshot = await userRef.once('value');
        const userData = snapshot.val();
        
        if (userData) {
            await userRef.update({
                'stats/loginCount': (userData.stats?.loginCount || 0) + 1,
                'stats/lastLogin': firebase.database.ServerValue.TIMESTAMP,
                'emailVerified': user.emailVerified
            });
        }
        
        return { success: true, user: user };
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        return { success: false, error: error.message };
    }
}

// Função para fazer logout
async function logoutUser() {
    try {
        await auth.signOut();
        return { success: true };
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
        return { success: false, error: error.message };
    }
}

// Função para resetar senha
async function resetPassword(email) {
    try {
        await auth.sendPasswordResetEmail(email);
        return { success: true };
    } catch (error) {
        console.error('Erro ao resetar senha:', error);
        return { success: false, error: error.message };
    }
}

// Observador de estado de autenticação
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log('Usuário logado:', user.displayName || user.email);
        
        // Atualizar última visita
        const userRef = database.ref('users/' + user.uid);
        userRef.update({
            'stats/lastSeen': firebase.database.ServerValue.TIMESTAMP
        }).catch(err => console.warn('Erro ao atualizar lastSeen:', err));
        
        // Usuário está logado
        if (window.onUserLoggedIn) {
            window.onUserLoggedIn(user);
        }
    } else {
        console.log('Usuário não está logado');
        // Usuário não está logado
        if (window.onUserLoggedOut) {
            window.onUserLoggedOut();
        }
    }
});

// Função para obter dados do usuário
async function getUserData(uid) {
    try {
        const snapshot = await database.ref('users/' + uid).once('value');
        return snapshot.val();
    } catch (error) {
        console.error('Erro ao obter dados do usuário:', error);
        return null;
    }
}

// Função para atualizar dados do usuário
async function updateUserData(uid, updates) {
    try {
        await database.ref('users/' + uid).update(updates);
        return { success: true };
    } catch (error) {
        console.error('Erro ao atualizar dados:', error);
        return { success: false, error: error.message };
    }
}

// Exportar funções para uso global
window.firebaseAuth = {
    register: registerUser,
    login: loginUser,
    logout: logoutUser,
    resetPassword: resetPassword,
    getUserData: getUserData,
    updateUserData: updateUserData,
    getCurrentUser: () => auth.currentUser
};
