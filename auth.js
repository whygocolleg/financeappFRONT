import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, onIdTokenChanged } from "./firebase.js";
import { setToken, clearToken, setTokenRefresher } from './src/api/client.js';
import { USE_BACKEND, AUTH_MODE } from './src/config.js';

const authScreen = document.getElementById('auth-screen');
const appShell   = document.getElementById('app-shell');
const bottomNav  = document.getElementById('bottom-nav');
const tabLogin   = document.getElementById('tab-login');
const tabSignup  = document.getElementById('tab-signup');
const submitBtn  = document.getElementById('auth-submit');
const btnText    = document.getElementById('auth-btn-text');
const spinner    = document.getElementById('auth-spinner');
const errorMsg   = document.getElementById('auth-error');
const nameGroup  = document.getElementById('auth-name-group');

let isLoginMode = true;

function setLoading(loading) {
    submitBtn.disabled     = loading;
    btnText.style.display  = loading ? 'none' : '';
    spinner.style.display  = loading ? '' : 'none';
}

tabLogin.addEventListener('click', () => {
    isLoginMode = true;
    tabLogin.classList.add('active');
    tabSignup.classList.remove('active');
    btnText.textContent = '로그인';
    nameGroup.style.display = 'none';
    errorMsg.textContent = '';
    document.getElementById('auth-password').autocomplete = 'current-password';
});

tabSignup.addEventListener('click', () => {
    isLoginMode = false;
    tabSignup.classList.add('active');
    tabLogin.classList.remove('active');
    btnText.textContent = '회원가입';
    nameGroup.style.display = '';
    errorMsg.textContent = '';
    document.getElementById('auth-password').autocomplete = 'new-password';
});

submitBtn.addEventListener('click', async () => {
    const email    = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    const name     = document.getElementById('auth-name')?.value.trim() || '';
    errorMsg.textContent = '';

    if (!email || !password) {
        errorMsg.textContent = '이메일과 비밀번호를 입력해주세요.';
        return;
    }
    if (!isLoginMode && !name) {
        errorMsg.textContent = '이름을 입력해주세요.';
        return;
    }

    setLoading(true);
    try {
        if (isLoginMode) {
            await signInWithEmailAndPassword(auth, email, password);
        } else {
            const cred = await createUserWithEmailAndPassword(auth, email, password);
            if (name && cred.user) {
                const { updateProfile } = await import("https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js");
                await updateProfile(cred.user, { displayName: name }).catch(() => {});
            }
        }
    } catch (e) {
        errorMsg.textContent = parseError(e.code);
    } finally {
        setLoading(false);
    }
});

/* Enter 키 제출 */
document.getElementById('auth-form').addEventListener('keydown', e => {
    if (e.key === 'Enter') submitBtn.click();
});

/* ── 토큰 파이프라인 (USE_BACKEND + firebase 모드) ────────────────────────
 *
 * onIdTokenChanged는 onAuthStateChanged와 동일하게 로그인/로그아웃 시 발화하며,
 * 추가로 Firebase가 1시간마다 ID 토큰을 자동 갱신할 때도 발화합니다.
 * 이를 이용해 항상 최신 토큰이 client.js에 유지되도록 합니다.
 *
 * custom-jwt 방식으로 전환 시:
 *   1. AUTH_MODE = 'custom-jwt' 로 변경 (src/config.js)
 *   2. submitBtn 핸들러에서 Firebase 대신 backendAuthApi.signin() 호출
 *   3. 이 블록은 더 이상 실행되지 않음
 */
if (USE_BACKEND && AUTH_MODE === 'firebase') {
    // 401 발생 시 client.js가 호출할 토큰 갱신 함수 등록
    setTokenRefresher(() => auth.currentUser?.getIdToken(true) ?? Promise.resolve(null));

    onIdTokenChanged(auth, async user => {
        if (user) {
            const token = await user.getIdToken();
            setToken(token);
        } else {
            clearToken();
        }
    });
}

/* ── 인증 상태 → UI 표시/숨김 ─────────────────────────────────────────── */
onAuthStateChanged(auth, user => {
    if (user) {
        authScreen.style.display = 'none';
        appShell.style.display   = '';
        bottomNav.style.display  = '';
        if (window.__setCurrentUser) window.__setCurrentUser(user);
    } else {
        authScreen.style.display = '';
        appShell.style.display   = 'none';
        bottomNav.style.display  = 'none';
        if (window.__setCurrentUser) window.__setCurrentUser(null);
    }
});

function parseError(code) {
    const map = {
        'auth/invalid-email':        '이메일 형식이 올바르지 않아요.',
        'auth/user-not-found':       '등록된 이메일이 없어요.',
        'auth/wrong-password':       '비밀번호가 틀렸어요.',
        'auth/email-already-in-use': '이미 사용 중인 이메일이에요.',
        'auth/weak-password':        '비밀번호는 6자리 이상이어야 해요.',
        'auth/invalid-credential':   '이메일 또는 비밀번호가 틀렸어요.',
        'auth/too-many-requests':    '너무 많이 시도했어요. 잠시 후 다시 해주세요.',
    };
    return map[code] || '오류가 발생했어요. 다시 시도해주세요.';
}

export { auth, signOut };
