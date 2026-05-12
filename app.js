import { renderHome }         from './src/screens/HomeScreen.js';
import { renderTransactions } from './src/screens/TransactionsScreen.js';
import { renderStats, destroyChart } from './src/screens/StatsScreen.js';
import { renderDetail }       from './src/screens/DetailScreen.js';
import { renderSettings }     from './src/screens/SettingsScreen.js';
import { showToast }          from './src/components/Toast.js';
import { showModal, showAlert, showGoalSelector } from './src/components/Modal.js';
import { initData, getData, setCache, loadSettings, getSettings, saveSettings, clearSettings } from './src/store.js';
import { goalsApi }   from './src/api/goals.api.js';
import { spendingApi } from './src/api/spending.api.js';
import { skeletonHome, skeletonTransactions, skeletonStats } from './src/components/Skeleton.js';
import { STORAGE_KEY, SLIDE_DURATION } from './src/config.js';

let currentUser    = null;
let currentTab     = 'home';
let selectedGoalId = null;

const shell      = document.getElementById('app-shell');
const homeEl     = document.getElementById('home-content');
const transEl    = document.getElementById('transactions-content');
const statsEl    = document.getElementById('stats-content');
const settingsEl = document.getElementById('settings-content');

/* ── 상태 헬퍼 ──────────────────────────────────────── */
function getState() {
    return { data: getData(), settings: getSettings(), user: currentUser };
}

/* ── 화면 렌더링 ────────────────────────────────────── */
function refresh(screen) {
    const s = getState();
    if (screen === 'home')         renderHome(homeEl, s, actions);
    if (screen === 'transactions') renderTransactions(transEl, s, actions);
    if (screen === 'stats')        renderStats(statsEl, s);
    if (screen === 'settings')     renderSettings(settingsEl, s, actions);
}

/* ── 앱 초기화 (비동기) ─────────────────────────────── */
async function startApp() {
    loadSettings();

    // 데이터 로드 전 스켈레톤 즉시 렌더링
    homeEl.innerHTML         = skeletonHome();
    transEl.innerHTML        = skeletonTransactions();
    statsEl.innerHTML        = skeletonStats();

    try {
        await initData(window.mockData);
    } catch (e) {
        console.error('데이터 로드 실패:', e);
        showToast('데이터를 불러오지 못했어요. 잠시 후 다시 시도해주세요.', 'error');
        return;
    }

    history.replaceState({ screen: 'home' }, '', '');
    refresh('home');
    refresh('transactions');
    refresh('stats');
    refresh('settings');
}

/* ── 처리되지 않은 Promise 에러 글로벌 캐치 ─────────── */
window.addEventListener('unhandledrejection', e => {
    const msg = e.reason?.message;
    if (msg) showToast(msg, 'error');
    e.preventDefault();
});

/* ── 액션 ───────────────────────────────────────────── */
const actions = {
    navigateTo,
    navigateBack,
    switchTab,

    async addGoal({ name, target_amount, endDate }) {
        try {
            const goal = await goalsApi.create({ name, target_amount, endDate });
            setCache({ goals: [...getData().goals, goal] });
            refresh('home');
            showToast('새 목표가 추가됐어요! 🎯', 'success');
        } catch (e) {
            showToast(e.message || '목표 추가 중 오류가 발생했어요.', 'error');
        }
    },

    async deleteGoal(goalId) {
        const goal = getData().goals.find(g => g.id === goalId);
        if (!goal) return;
        const ok = await showModal({
            title:       `"${goal.name}"`,
            message:     '이 목표를 삭제하면 모든 절약 내역도 함께 사라져요.',
            confirmText: '삭제하기',
            cancelText:  '취소',
            type:        'danger',
            icon:        '🗑️',
        });
        if (!ok) return;
        try {
            await goalsApi.delete(goalId);
            setCache({ goals: getData().goals.filter(g => g.id !== goalId) });
            refresh('home');
            showToast('목표가 삭제됐어요.', 'warning');
        } catch (e) {
            showToast(e.message || '목표 삭제 중 오류가 발생했어요.', 'error');
        }
    },

    async saveSpending(spendingId) {
        const data = getData();
        const item = data.expected_spending.find(i => i.id === spendingId);
        if (!item) return;

        let goalId = null;
        if (data.goals.length === 0) {
            await showAlert({ title: '목표가 없어요', message: '홈 탭에서 목표를 먼저 추가해주세요.', icon: '🎯' });
            return;
        }
        if (data.goals.length === 1) {
            goalId = data.goals[0].id;
        } else {
            goalId = await showGoalSelector(data.goals);
            if (!goalId) return;
        }

        const goal    = data.goals.find(g => g.id === goalId);
        if (!goal) return;
        const prevPct = Math.floor(((goal.current_amount || 0) / goal.target_amount) * 100);

        try {
            // spending 삭제 → goal에 저축 기록 (sequential: 두 mock 모두 localStorage 접근)
            await spendingApi.delete(spendingId);
            const updatedGoal = await goalsApi.addSaving(goalId, {
                amount:   item.amount,
                category: item.category,
                icon:     item.icon,
            });

            setCache({
                goals:            getData().goals.map(g => g.id === goalId ? updatedGoal : g),
                expected_spending: getData().expected_spending.filter(i => i.id !== spendingId),
            });

            const newPct = Math.floor((updatedGoal.current_amount / updatedGoal.target_amount) * 100);
            if (prevPct < 100 && newPct >= 100)
                setTimeout(() => showToast(`"${goal.name}" 목표 달성! 축하합니다!`, 'success', 4000), 300);
            else if (prevPct < 80 && newPct >= 80)
                setTimeout(() => showToast(`"${goal.name}" 80% 달성! 거의 다 왔어요!`, 'info'), 300);
            else
                showToast(`${item.amount.toLocaleString('ko-KR')}원 절약 완료!`, 'success');

            refresh('transactions');
            refresh('home');
            if (currentTab === 'stats') refresh('stats');
            if (selectedGoalId === goalId) {
                renderDetail(
                    document.getElementById('detail-header-slot'),
                    document.getElementById('detail-content'),
                    updatedGoal,
                    actions
                );
            }
        } catch (e) {
            showToast(e.message || '저축 처리 중 오류가 발생했어요.', 'error');
        }
    },

    async deleteSpending(id) {
        try {
            await spendingApi.delete(id);
            setCache({ expected_spending: getData().expected_spending.filter(i => i.id !== id) });
            refresh('transactions');
            refresh('home');
        } catch (e) {
            showToast(e.message || '삭제 중 오류가 발생했어요.', 'error');
        }
    },

    async addSpending({ category, icon, time, period, amount }) {
        try {
            const item = await spendingApi.create({ category, icon, time, period, amount });
            setCache({ expected_spending: [...getData().expected_spending, item] });
            refresh('transactions');
            refresh('home');
            showToast('소비 항목이 추가됐어요.', 'info');
        } catch (e) {
            showToast(e.message || '항목 추가 중 오류가 발생했어요.', 'error');
        }
    },

    updateSettings(updates) {
        saveSettings(updates);
        refresh(currentTab);
    },

    async logout() {
        const ok = await showModal({
            title:       '로그아웃',
            message:     '정말 로그아웃 할까요?',
            confirmText: '로그아웃',
            cancelText:  '취소',
        });
        if (!ok) return;
        const { auth, signOut } = await import('./auth.js');
        await signOut(auth);
    },

    async resetData() {
        const ok = await showModal({
            title:       '데이터 초기화',
            message:     '모든 목표와 절약 내역이 삭제됩니다. 이 작업은 되돌릴 수 없어요.',
            confirmText: '초기화',
            cancelText:  '취소',
            type:        'danger',
            icon:        '⚠️',
        });
        if (!ok) return;
        localStorage.removeItem(STORAGE_KEY);
        clearSettings();
        await initData(window.mockData);
        loadSettings();
        refresh('home');
        refresh('transactions');
        refresh('stats');
        switchTab('home');
        showToast('데이터가 초기화됐어요.', 'warning');
    },
};

/* ── 탭 전환 ────────────────────────────────────────── */
function switchTab(tab) {
    if (currentTab === tab) return;
    if (currentTab === 'stats') destroyChart();
    currentTab = tab;

    shell.classList.remove('show-transactions', 'show-stats', 'show-settings');
    if (tab === 'transactions') shell.classList.add('show-transactions');
    if (tab === 'stats')        shell.classList.add('show-stats');
    if (tab === 'settings')     shell.classList.add('show-settings');

    refresh(tab);

    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.toggle('active', el.dataset.tab === tab);
    });
}

/* ── 상세 화면 라우팅 ───────────────────────────────── */
function navigateTo(screenName, goalId) {
    if (screenName !== 'detail') return;
    selectedGoalId = goalId;
    const goal = getData().goals.find(g => g.id === goalId);
    if (!goal) return;

    renderDetail(
        document.getElementById('detail-header-slot'),
        document.getElementById('detail-content'),
        goal,
        actions
    );
    history.pushState({ screen: 'detail', goalId, prevTab: currentTab }, '', '');
    shell.classList.add('transitioning', 'show-detail');
    document.getElementById('screen-detail').scrollTop = 0;
    setTimeout(() => shell.classList.remove('transitioning'), SLIDE_DURATION);
}

function navigateBack() { history.back(); }

window.addEventListener('popstate', e => {
    const state = e.state;
    if (!state || state.screen === 'home') {
        shell.classList.add('transitioning');
        shell.classList.remove('show-detail');
        setTimeout(() => shell.classList.remove('transitioning'), SLIDE_DURATION);
    } else if (state.screen === 'detail') {
        selectedGoalId = state.goalId;
        const goal = getData().goals.find(g => g.id === state.goalId);
        if (!goal) return;
        renderDetail(
            document.getElementById('detail-header-slot'),
            document.getElementById('detail-content'),
            goal,
            actions
        );
        shell.classList.add('transitioning', 'show-detail');
        document.getElementById('screen-detail').scrollTop = 0;
        setTimeout(() => shell.classList.remove('transitioning'), SLIDE_DURATION);
    }
});

/* ── 네비게이션 이벤트 ──────────────────────────────── */
document.getElementById('nav-home').addEventListener('click',         () => switchTab('home'));
document.getElementById('nav-transactions').addEventListener('click', () => switchTab('transactions'));
document.getElementById('nav-stats').addEventListener('click',        () => switchTab('stats'));
document.getElementById('nav-settings').addEventListener('click',     () => switchTab('settings'));

/* ── auth.js 브릿지 ─────────────────────────────────── */
window.__setCurrentUser = function(user) {
    currentUser = user;
    if (user) {
        startApp().catch(err => {
            console.error('앱 초기화 실패:', err);
            showToast('앱 초기화 중 오류가 발생했어요.', 'error');
        });
    }
};
