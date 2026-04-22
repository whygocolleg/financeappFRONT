/* ════════════════════════════════════════════════════════════════
   localStorage 영속화
════════════════════════════════════════════════════════════════ */
const STORAGE_KEY = 'financeData';

function loadData() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (!parsed.goals) {
                parsed.goals = mockData.goals;
                saveData(parsed);
            }
            return parsed;
        }
    } catch (e) {}
    saveData(mockData);
    return mockData;
}

function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

let appData = loadData();
let selectedGoalId = null;

/* 현재 탭: 'home' | 'transactions' */
let currentTab = 'home';

function nextGoalId() {
    return appData.goals.reduce((max, g) => Math.max(max, g.id), 0) + 1;
}

/* ════════════════════════════════════════════════════════════════
   utils
════════════════════════════════════════════════════════════════ */
function fmt(n) { return n.toLocaleString('ko-KR') + '원'; }

function iconSVG(key) {
    const map = {
        coffee: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
            <line x1="6" y1="1" x2="6" y2="4"/>
            <line x1="10" y1="1" x2="10" y2="4"/>
            <line x1="14" y1="1" x2="14" y2="4"/>
        </svg>`,
        food: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
            <path d="M7 2v20"/>
            <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
        </svg>`,
        transport: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="7" width="20" height="15" rx="2" ry="2"/>
            <polyline points="17 12 22 12 22 16 17 16"/>
            <circle cx="9" cy="11" r="2"/>
        </svg>`,
        shopping: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>`,
        etc: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>`
    };
    return map[key] || map.etc;
}

const TRASH_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
    stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/>
    <path d="M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
</svg>`;

/* ════════════════════════════════════════════════════════════════
   1. renderHome — 홈: 목표 진행도
════════════════════════════════════════════════════════════════ */
function renderHome(data) {
    function computeStatus(data) {
        if (data.today_spending > data.today_budget) return 'fail';
        return data.today_status || 'pending';
    }

    function renderBadge(status) {
        const CHECK_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/></svg>`;
        const WARN_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0
                1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
        const configs = {
            success: { cls: 'badge--success', icon: CHECK_ICON, text: '오늘의 절약 성공!' },
            fail:    { cls: 'badge--fail',    icon: WARN_ICON,  text: '예산 초과! 주의하세요' },
            pending: { cls: 'badge--pending', icon: '',          text: '진행중...' },
        };
        const c = configs[status] || configs.pending;
        return `<div class="badge ${c.cls}">${c.icon}${c.text}</div>`;
    }

    const status    = computeStatus(data);
    const badgeHTML = renderBadge(status);

    const goalsHTML = data.goals.map(goal => {
        const progress = Math.min(100, Math.round((data.total_saving / goal.target_amount) * 100));
        return `
        <div class="goal-card-outer">
            <div class="goal-card-wrapper" data-goal-id="${goal.id}" role="button"
                 tabindex="0" aria-label="${goal.name} 상세 보기">
                <financial-goal-card
                    goal-name="${goal.name}"
                    target-amount="${fmt(goal.target_amount)}"
                    progress="${progress}">
                </financial-goal-card>
            </div>
            <button class="btn-delete-goal" data-goal-id="${goal.id}" aria-label="목표 삭제">
                ${TRASH_ICON}
            </button>
        </div>
        `;
    }).join('');

    const addGoalFormHTML = `
        <div class="add-goal-form" id="add-goal-form" style="display: none;">
            <p class="form-title">새로운 목표 시작하기 🚀</p>
            <input type="text" id="new-goal-name" class="form-input" placeholder="목표 이름 (예: 유럽 여행)" autocomplete="off">
            <input type="text" id="new-goal-amount" class="form-input" placeholder="목표 금액 (숫자만)" autocomplete="off">
            <div class="form-actions">
                <button class="btn-cancel" id="btn-cancel-goal">취소</button>
                <button class="btn-confirm" id="btn-confirm-goal">추가하기</button>
            </div>
        </div>
    `;

    document.getElementById('home-content').innerHTML = `
        <header class="home-header">
            <h1>${data.page_title}</h1>
            <button class="btn-logout" id="btn-logout">로그아웃</button>
        </header>

        ${badgeHTML}

        <div class="goals-section">
            <h3 class="section-title">나의 목표 진행도</h3>
            <div class="goals-list" id="goals-list">
                ${goalsHTML || '<p class="spending-empty">아직 목표가 없어요. 새 목표를 추가해 보세요! 🎯</p>'}
            </div>
            <button class="btn-add-goal" id="btn-add-goal">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                     stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                새로운 목표 추가하기
            </button>
            ${addGoalFormHTML}
        </div>
    `;

    /* 카드 클릭 → 상세 */
    document.querySelectorAll('.goal-card-wrapper').forEach(wrapper => {
        const goalId = Number(wrapper.dataset.goalId);
        wrapper.addEventListener('click', () => navigateTo('detail', goalId));
        wrapper.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') navigateTo('detail', goalId);
        });
    });

    /* 삭제 버튼 */
    document.querySelectorAll('.btn-delete-goal').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            onDeleteGoal(Number(btn.dataset.goalId));
        });
    });

    /* 로그아웃 */
    document.getElementById('btn-logout').addEventListener('click', async () => {
        const { auth, signOut } = await import('./auth.js');
        await signOut(auth);
    });

    /* 목표 추가 폼 */
    const addBtn = document.getElementById('btn-add-goal');
    const formDiv = document.getElementById('add-goal-form');

    addBtn.addEventListener('click', () => {
        addBtn.style.display = 'none';
        formDiv.style.display = 'block';
        document.getElementById('new-goal-name').focus();
    });

    document.getElementById('btn-cancel-goal').addEventListener('click', () => {
        addBtn.style.display = 'flex';
        formDiv.style.display = 'none';
        document.getElementById('new-goal-name').value = '';
        document.getElementById('new-goal-amount').value = '';
    });

    document.getElementById('btn-confirm-goal').addEventListener('click', () => {
        const nameInput = document.getElementById('new-goal-name').value;
        const amountStr = document.getElementById('new-goal-amount').value;
        const amount = Number(amountStr.replace(/[^0-9]/g, ''));

        if (!nameInput.trim()) { alert('목표 이름을 입력해주세요.'); return; }
        if (!amount || amount <= 0) { alert('올바른 목표 금액을 입력해주세요.'); return; }

        appData.goals.push({
            id: nextGoalId(),
            name: nameInput.trim(),
            target_amount: amount,
            detail: {
                screen_title: `${nameInput.trim()} 상세`,
                history_section_title: "카테고리별 절약 내역",
                billing_period: {
                    start: new Date().toLocaleDateString('ko-KR').replace(/ /g, ''),
                    end: '',
                    total_save_count: 0
                },
                saving_history: []
            }
        });
        saveData(appData);
        renderHome(appData);
    });

    document.getElementById('new-goal-amount').addEventListener('input', e => {
        let val = e.target.value.replace(/[^0-9]/g, '');
        if (val) val = Number(val).toLocaleString('ko-KR');
        e.target.value = val;
    });
}

/* ════════════════════════════════════════════════════════════════
   2. renderTransactions — 예상소비 탭
════════════════════════════════════════════════════════════════ */
function renderTransactions(data) {
    const total = data.expected_spending.reduce((sum, item) => sum + item.amount, 0);

    const spendingHTML = data.expected_spending.map(item => `
        <div class="list-item" data-id="${item.id}">
            <div class="item-left">
                <div class="item-icon">${iconSVG(item.icon)}</div>
                <div>
                    <p class="item-title">${item.category}</p>
                    <p class="item-subtitle">${item.period} ${item.time} 예상</p>
                </div>
            </div>
            <div class="item-right">
                <span class="item-amount">${fmt(item.amount)}</span>
                <button class="btn-save" data-id="${item.id}" data-amount="${item.amount}">
                    💸 절약완료
                </button>
            </div>
        </div>
    `).join('');

    const emptyHTML = `<p class="spending-empty">오늘 예상 소비를 모두 절약했어요! 🎉</p>`;

    document.getElementById('transactions-content').innerHTML = `
        <header class="home-header">
            <h1>예상 소비 목록</h1>
        </header>

        ${data.expected_spending.length > 0 ? `
        <div class="spending-summary-card">
            <p class="ss-label">오늘 예상 총 지출</p>
            <p class="ss-amount">${fmt(total)}</p>
            <p class="ss-sub">총 ${data.expected_spending.length}건의 예상 소비</p>
        </div>
        ` : ''}

        <h3 class="section-title">소비 내역</h3>
        <div class="list-card">
            ${spendingHTML || emptyHTML}
        </div>
    `;

    document.querySelectorAll('.btn-save').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            onSave(Number(btn.dataset.id));
        });
    });
}

/* ════════════════════════════════════════════════════════════════
   목표 삭제 / 절약완료
════════════════════════════════════════════════════════════════ */
function onDeleteGoal(goalId) {
    const goal = appData.goals.find(g => g.id === goalId);
    if (!goal) return;
    if (!confirm(`"${goal.name}" 목표를 정말 삭제할까요?\n이 작업은 되돌릴 수 없습니다.`)) return;
    appData.goals = appData.goals.filter(g => g.id !== goalId);
    saveData(appData);
    renderHome(appData);
}

function onSave(id) {
    const item = appData.expected_spending.find(i => i.id === id);
    if (!item) return;
    appData.total_saving = (appData.total_saving || 0) + item.amount;
    appData.expected_spending = appData.expected_spending.filter(i => i.id !== id);

    // 모든 목표의 카테고리별 절약 내역에 반영
    appData.goals.forEach(goal => {
        const history = goal.detail.saving_history;
        const existing = history.find(h => h.category === item.category);
        if (existing) {
            existing.save_count += 1;
            existing.total_saved += item.amount;
        } else {
            history.push({
                id: history.length + 1,
                category: item.category,
                icon: item.icon || 'etc',
                save_count: 1,
                total_saved: item.amount
            });
        }
    });

    saveData(appData);
    renderTransactions(appData);
    renderHome(appData);

    // 상세 화면이 열려 있으면 즉시 갱신
    if (selectedGoalId != null) {
        const goal = appData.goals.find(g => g.id === selectedGoalId);
        if (goal) renderDetail(goal);
    }
}

/* ════════════════════════════════════════════════════════════════
   3. renderDetail — 목표 상세 화면
════════════════════════════════════════════════════════════════ */
function renderDetail(goal) {
    const d  = goal.detail;
    const bp = d.billing_period;

    document.getElementById('detail-header-slot').innerHTML = `
        <div class="detail-header">
            <button class="btn-back" id="btn-back" aria-label="뒤로 가기">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2.5"
                     stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="15 18 9 12 15 6"/>
                </svg>
            </button>
            <span class="detail-header-title">${d.screen_title}</span>
        </div>
    `;
    document.getElementById('btn-back').addEventListener('click', navigateBack);

    const historyHTML = d.saving_history.length > 0
        ? d.saving_history.map(item => `
            <div class="list-item">
                <div class="item-left">
                    <div class="item-icon">${iconSVG(item.icon)}</div>
                    <div>
                        <p class="item-title">
                            ${item.category}
                            <span class="count-badge">${item.save_count}회</span>
                        </p>
                        <p class="item-subtitle">총 절약 횟수</p>
                    </div>
                </div>
                <span class="item-amount">${fmt(item.total_saved)}</span>
            </div>
        `).join('')
        : `<p class="spending-empty">아직 절약 내역이 없어요. 절약을 시작해 보세요! 💪</p>`;

    const periodHTML = bp.end
        ? `<span class="pb-range">📅 ${bp.start} ~ ${bp.end}</span>`
        : `<span class="pb-range">📅 ${bp.start} ~</span>`;

    document.getElementById('detail-content').innerHTML = `
        <div class="savings-highlight">
            <p class="sh-label">누적 절약 금액</p>
            <p class="sh-amount" id="sh-amount-anim">0원</p>
            <p class="sh-sub">지금까지 총 절약한 금액이에요 🎯</p>
        </div>
        <h3 class="section-title">${d.history_section_title}</h3>
        <div class="period-bar">
            ${periodHTML}
        </div>
        <div class="list-card">${historyHTML}</div>
    `;
}

/* ════════════════════════════════════════════════════════════════
   4. 탭 전환 — 하단 네비게이션
════════════════════════════════════════════════════════════════ */
function switchTab(tab) {
    if (currentTab === tab) return;
    currentTab = tab;

    const shell = document.getElementById('app-shell');

    /* 탭 화면 전환 */
    if (tab === 'home') {
        shell.classList.remove('show-transactions');
        renderHome(appData);
    } else if (tab === 'transactions') {
        shell.classList.add('show-transactions');
        renderTransactions(appData);
    }

    /* 네비 활성 상태 */
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.tab === tab);
    });
}

document.getElementById('nav-home').addEventListener('click', () => switchTab('home'));
document.getElementById('nav-transactions').addEventListener('click', () => switchTab('transactions'));

/* ════════════════════════════════════════════════════════════════
   5. 라우터 — 상세 슬라이드 전환
════════════════════════════════════════════════════════════════ */
const shell = document.getElementById('app-shell');
const SLIDE_MS = 380;

function navigateTo(screenName, goalId) {
    if (screenName === 'detail') {
        selectedGoalId = goalId;
        const goal = appData.goals.find(g => g.id === goalId);
        if (!goal) return;
        renderDetail(goal);
        history.pushState({ screen: 'detail', goalId, prevTab: currentTab }, '', '');

        shell.classList.add('transitioning', 'show-detail');
        document.getElementById('screen-detail').scrollTop = 0;
        setTimeout(() => {
            shell.classList.remove('transitioning');
            animateAmount('sh-amount-anim', appData.total_saving, 900);
        }, SLIDE_MS);
    }
}

function navigateBack() {
    history.back();
}

window.addEventListener('popstate', (e) => {
    const state = e.state;
    if (!state || state.screen === 'home') {
        shell.classList.add('transitioning');
        shell.classList.remove('show-detail');
        setTimeout(() => shell.classList.remove('transitioning'), SLIDE_MS);
    } else if (state.screen === 'detail') {
        const goal = appData.goals.find(g => g.id === state.goalId);
        if (!goal) return;
        selectedGoalId = state.goalId;
        renderDetail(goal);
        shell.classList.add('transitioning', 'show-detail');
        document.getElementById('screen-detail').scrollTop = 0;
        setTimeout(() => {
            shell.classList.remove('transitioning');
            animateAmount('sh-amount-anim', appData.total_saving, 900);
        }, SLIDE_MS);
    }
});

/* ════════════════════════════════════════════════════════════════
   6. 숫자 카운트업 애니메이션
════════════════════════════════════════════════════════════════ */
function animateAmount(elId, target, duration) {
    const el = document.getElementById(elId);
    if (!el) return;
    const start = performance.now();
    const ease  = t => t < 1 ? 1 - Math.pow(2, -10 * t) : 1;
    const tick  = now => {
        const t = Math.min((now - start) / duration, 1);
        el.textContent = Math.round(ease(t) * target).toLocaleString('ko-KR') + '원';
        if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
}

/* ════════════════════════════════════════════════════════════════
   7. 초기 렌더링
════════════════════════════════════════════════════════════════ */
function init(data) {
    history.replaceState({ screen: 'home' }, '', '');
    renderHome(data);
    renderTransactions(data);
}

init(appData);

/* 테스트용: 초기화 버튼 */
const resetBtn = document.createElement('button');
resetBtn.innerText = "♻️ 데이터 초기화";
resetBtn.style.cssText = "position:fixed; bottom:76px; right:20px; z-index:9999; padding:8px 12px; border-radius:8px; border:none; background:#ff4757; color:white; font-weight:bold; cursor:pointer;";
resetBtn.onclick = () => { localStorage.removeItem('financeData'); location.reload(); };
document.body.appendChild(resetBtn);
