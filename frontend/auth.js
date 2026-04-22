import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "./firebase.js";

const authScreen = document.getElementById('auth-screen');
const appShell   = document.getElementById('app-shell');
const bottomNav  = document.getElementById('bottom-nav');
const tabLogin   = document.getElementById('tab-login');
const tabSignup  = document.getElementById('tab-signup');
const submitBtn  = document.getElementById('auth-submit');
const errorMsg   = document.getElementById('auth-error');

let isLoginMode = true;

tabLogin.addEventListener('click', () => {
    isLoginMode = true;
    tabLogin.classList.add('active');
    tabSignup.classList.remove('active');
    submitBtn.textContent = '로그인';
    errorMsg.textContent = '';
});

tabSignup.addEventListener('click', () => {
    isLoginMode = false;
    tabSignup.classList.add('active');
    tabLogin.classList.remove('active');
    submitBtn.textContent = '회원가입';
    errorMsg.textContent = '';
});

submitBtn.addEventListener('click', async () => {
    const email    = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    errorMsg.textContent = '';

    if (!email || !password) {
        errorMsg.textContent = '이메일과 비밀번호를 입력해주세요.';
        return;
    }

    try {
        if (isLoginMode) {
            await signInWithEmailAndPassword(auth, email, password);
        } else {
            await createUserWithEmailAndPassword(auth, email, password);
        }
    } catch (e) {
        errorMsg.textContent = parseError(e.code);
    }
});

onAuthStateChanged(auth, user => {
    if (user) {
        authScreen.style.display = 'none';
        appShell.style.display   = '';
        bottomNav.style.display  = '';
    } else {
        authScreen.style.display = '';
        appShell.style.display   = 'none';
        bottomNav.style.display  = 'none';
    }
});

function parseError(code) {
    switch (code) {
        case 'auth/invalid-email':           return '이메일 형식이 올바르지 않아요.';
        case 'auth/user-not-found':          return '등록된 이메일이 없어요.';
        case 'auth/wrong-password':          return '비밀번호가 틀렸어요.';
        case 'auth/email-already-in-use':    return '이미 사용 중인 이메일이에요.';
        case 'auth/weak-password':           return '비밀번호는 6자리 이상이어야 해요.';
        case 'auth/invalid-credential':      return '이메일 또는 비밀번호가 틀렸어요.';
        default:                             return '오류가 발생했어요. 다시 시도해주세요.';
    }
}

export { auth, signOut };
