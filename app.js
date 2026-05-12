import { renderHome }         from './src/screens/HomeScreen.js';
import { renderTransactions } from './src/screens/TransactionsScreen.js';
import { renderStats, destroyChart } from './src/screens/StatsScreen.js';
import { renderDetail }       from './src/screens/DetailScreen.js';
import { renderSettings }     from './src/screens/SettingsScreen.js';
import { showToast }          from './src/components/Toast.js';
import { showModal, showAlert, showGoalSelector } from './src/components/Modal.js';
import { loadData, getData, setData, loadSettings, getSettings, saveSettings, resetAll } from './src/store.js';
import { SLIDE_DURATION }     from './src/config.js';

/* ── 초기화 ─────────────────────────────────────────────── */
const appData    = loadData(window.mockData);
const appSettings = loadSettings();
let currentUser  = null;
let currentTab   = 'home';
let selectedGoalId = null;

const shell    = document.getElementById('app-shell');
const homeEl   = document.getElementById('home-content');
const transEl  = document.getElementById('transactions-content');
const statsEl  = document.getElementById('stats-content');
const settingsEl = document.getElementById('settings-content');

/* ── 상태 헬퍼 ──────────────────────────────────────────── */
function getState() {
    return { data: getData(), settings: getSettings(), user: currentUser };
}

function nextGoalId() {
    return getData().goals.reduce((max, g) => Math.max(max, g.id), 0) + 1;
}
function nextSpendingId() {
    return getData().expected_spending.reduce((max, i) => Math.max(max, i.id), 0) + 1;
}

/* ── 액션 ───────────────────────────────────────────────── */
const actions = {
    navigateTo,
    navigateBack,
    switchTab,

    async addGoal({ name, target_amount, endDate }) {
        const data = getData();
        data.goals.push({
            id:             nextGoalId(),
            name,
            target_amount,
            current_amount: 0,
            endDate:        endDate || '',
            detail: {
                screen_title:         `${name} 상세`,
                history_section_title: '카테고리별 절약 내역',
                billing_period:       { start: new Date().toLocaleDateString('ko-KR').replace(/ /g, ''), end: '', total_save_count: 0 },
                saving_history:       [],
            },
        });
        setData({ goals: data.goals });
        refresh('home');
        showToast('새 목표가 추가됐어요! 🎯', 'success');
    },

    async deleteGoal(goalId) {
        const data = getData();
        const goal = data.goals.find(g => g.id === goalId);
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
        setData({ goals: data.goals.filter(g => g.id !== goalId) });
        refresh('home');
        showToast('목표가 삭제됐어요.', 'warning');
    },

    async saveSpending(spendingId) {
        const data  = getData();
        const item  = data.expected_spending.find(i => i.id === spendingId);
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

        const goal = data.goals.find(g => g.id === goalId);
        if (!goal) return;

        const prevPct = Math.floor(((goal.current_amount || 0) / goal.target_amount) * 100);

        goal.current_amount = (goal.current_amount || 0) + item.amount;
        data.expected_spending = data.expected_spending.filter(i => i.id !== spendingId);

        const history = goal.detail.saving_history;
        const existing = history.find(h => h.category === item.category);
        if (existing) {
            existing.save_count   += 1;
            existing.total_saved  += item.amount;
        } else {
            history.push({ id: history.length + 1, category: item.category, icon: item.icon || 'etc', save_count: 1, total_saved: item.amount });
        }

        setData({ goals: data.goals, expected_spending: data.expected_spending });

        const newPct = Math.floor((goal.current_amount / goal.target_amount) * 100);
        if (prevPct < 100 && newPct >= 100)
            setTimeout(() => showToast(`🎉 "${goal.name}" 목표 달성! 축하합니다!`, 'success', 4000), 300);
        else if (prevPct < 80 && newPct >= 80)
            setTimeout(() => showToast(`💪 "${goal.name}" 80% 달성! 거의 다 왔어요!`, 'info'), 300);
        else
            showToast(`💸 ${item.amount.toLocaleString('ko-KR')}원 절약 완료!`, 'success');

        refresh('transactions');
        refresh('home');
        if (currentTab === 'stats') refresh('stats');
        if (selectedGoalId === goalId) {
            const updatedGoal = getData().goals.find(g => g.id === goalId);
            if (updatedGoal) renderDetail(
                document.getElementById('detail-header-slot'),
                document.getElementById('detail-content'),
                updatedGoal,
                actions
            );
        }
    },

    async deleteSpending(id) {
        const data = getData();
        setData({ expected_spending: data.expected_spending.filter(i => i.id !== id) });
        refresh('transactions');
        refresh('home');
    },

    async addSpending({ category, icon, time, period, amount }) {
        const data = getData();
        data.expected_spending.push({ id: nextSpendingId(), category, icon, time, period, amount });
        setData({ expected_spending: data.expected_spending });
        refresh('transactions');
        refresh('home');
        showToast('소비 항목이 추가됐어요.', 'info');
    },

    updateSettings(updates) {
        saveSettings(updates);
        refresh(currentTab);
    },

    async logout() {
        const ok = await showModal({ title: '로그아웃', message: '정말 로그아웃 할까요?', confirmText: '로그아웃', cancelText: '취소' });
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
        resetAll(window.mockData);
        refresh('home');
        refresh('transactions');
        refresh('stats');
        switchTab('home');
        showToast('데이터가 초기화됐어요.', 'warning');
    },
};

/* ── 화면 렌더링 ────────────────────────────────────────── */
function refresh(screen) {
    const s = getState();
    if (screen === 'home')         renderHome(homeEl, s, actions);
    if (screen === 'transactions') renderTransactions(transEl, s, actions);
    if (screen === 'stats')        renderStats(statsEl, s);
    if (screen === 'settings')     renderSettings(settingsEl, s, actions);
}

/* ── 탭 전환 ────────────────────────────────────────────── */
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

/* ── 상세 화면 라우팅 ───────────────────────────────────── */
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

function navigateBack() {
    history.back();
}

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

/* ── 네비게이션 이벤트 ──────────────────────────────────── */
document.getElementById('nav-home').addEventListener('click',         () => switchTab('home'));
document.getElementById('nav-transactions').addEventListener('click', () => switchTab('transactions'));
document.getElementById('nav-stats').addEventListener('click',        () => switchTab('stats'));
document.getElementById('nav-settings').addEventListener('click',     () => switchTab('settings'));

/* ── 외부에서 user 주입 (auth.js 가 호출) ──────────────── */
window.__setCurrentUser = function(user) {
    currentUser = user;
};

/* ── 최초 렌더링 ────────────────────────────────────────── */
history.replaceState({ screen: 'home' }, '', '');
refresh('home');
refresh('transactions');
refresh('stats');
refresh('settings');
