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

function getDday(endDateStr) {
    if (!endDateStr) return null;
    const end = new Date(endDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    return Math.ceil((end - today) / 86400000);
}

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
        const dday = getDday(goal.endDate);
        let ddayHTML = '';
        if (dday !== null) {
            let cls, label;
            if (dday < 0)       { cls = 'dday--over'; label = `D+${Math.abs(dday)} 기간 종료`; }
            else if (dday === 0){ cls = 'dday--soon'; label = 'D-DAY 오늘이 마지막!'; }
            else if (dday <= 7) { cls = 'dday--soon'; label = `D-${dday} · ${dday}일 남았어요`; }
            else                { cls = 'dday--ok';   label = `D-${dday} · ${dday}일 남았어요`; }
            const remaining = Math.max(0, goal.target_amount - data.total_saving);
            if (dday > 0 && remaining > 0) label += ` · 하루 ${fmt(Math.ceil(remaining / dday))} 절약`;
            ddayHTML = `<div class="dday-row"><span class="dday-badge ${cls}">${label}</span></div>`;
        }
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
            ${ddayHTML}
        </div>
        `;
    }).join('');

    const addGoalFormHTML = `
        <div class="add-goal-form" id="add-goal-form" style="display: none;">
            <p class="form-title">새로운 목표 시작하기 🚀</p>
            <input type="text" id="new-goal-name" class="form-input" placeholder="목표 이름 (예: 유럽 여행)" autocomplete="off">
            <input type="text" id="new-goal-amount" class="form-input" placeholder="목표 금액 (숫자만)" autocomplete="off">
            <input type="date" id="new-goal-end-date" class="form-input">
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
        const endDate   = document.getElementById('new-goal-end-date').value || '';
        const amount = Number(amountStr.replace(/[^0-9]/g, ''));

        if (!nameInput.trim()) { alert('목표 이름을 입력해주세요.'); return; }
        if (!amount || amount <= 0) { alert('올바른 목표 금액을 입력해주세요.'); return; }

        appData.goals.push({
            id: nextGoalId(),
            name: nameInput.trim(),
            target_amount: amount,
            endDate: endDate,
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
function nextSpendingId() {
    return appData.expected_spending.reduce((max, i) => Math.max(max, i.id), 0) + 1;
}

function renderTransactions(data) {
    const total    = data.expected_spending.reduce((sum, item) => sum + item.amount, 0);
    const budget   = data.today_budget   || 0;
    const spent    = data.today_spending || 0;
    const combined = spent + total;
    const isOver   = budget > 0 && combined > budget;
    const pct      = budget > 0 ? Math.min(100, Math.round((combined / budget) * 100)) : 0;

    const budgetBarHTML = budget > 0 ? `
        <div class="budget-bar-card${isOver ? ' budget-bar-card--over' : ''}">
            <div class="budget-bar-header">
                <span class="budget-bar-label">오늘 예산 사용률</span>
                <span class="budget-bar-pct${isOver ? ' over' : ''}">${pct}%</span>
            </div>
            <div class="budget-bar-track">
                <div class="budget-bar-fill${isOver ? ' over' : ''}" style="width:${pct}%"></div>
            </div>
            <div class="budget-bar-amounts">
                <span>실제 소비 ${fmt(spent)}</span>
                <span>예산 ${fmt(budget)}</span>
            </div>
            ${isOver ? `<div class="budget-warning">⚠️ 예산을 ${fmt(combined - budget)} 초과했어요!</div>` : ''}
        </div>
    ` : '';

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
                <div class="item-right-actions">
                    <button class="btn-save" data-id="${item.id}">💸 절약완료</button>
                    <button class="btn-del-spending" data-id="${item.id}" aria-label="삭제">${TRASH_ICON}</button>
                </div>
            </div>
        </div>
    `).join('');

    const emptyHTML = `<p class="spending-empty">오늘 예상 소비를 모두 절약했어요! 🎉</p>`;

    const addFormHTML = `
        <div class="add-spending-form" id="add-spending-form" style="display:none">
            <p class="form-title">소비 항목 추가 📋</p>
            <input type="text" id="sp-category" class="form-input" placeholder="카테고리 (예: 카페라떼)" autocomplete="off">
            <select id="sp-icon" class="form-input form-select">
                <option value="coffee">☕ 커피</option>
                <option value="food">🍱 식사</option>
                <option value="transport">🚌 교통</option>
                <option value="shopping">🛍 쇼핑</option>
                <option value="etc">📦 기타</option>
            </select>
            <input type="time" id="sp-time" class="form-input" value="12:00">
            <input type="text" id="sp-amount" class="form-input" placeholder="금액 (원)" autocomplete="off">
            <div class="form-actions">
                <button class="btn-cancel" id="sp-cancel">취소</button>
                <button class="btn-confirm" id="sp-confirm">추가</button>
            </div>
        </div>
    `;

    document.getElementById('transactions-content').innerHTML = `
        <header class="home-header">
            <h1>예상 소비 목록</h1>
        </header>

        ${budgetBarHTML}

        <h3 class="section-title">소비 내역</h3>
        <div class="list-card">
            ${spendingHTML || emptyHTML}
        </div>

        <button class="btn-add-goal" id="btn-add-spending">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                 stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            소비 항목 추가하기
        </button>
        ${addFormHTML}
    `;

    /* 절약완료 */
    document.querySelectorAll('.btn-save').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            onSave(Number(btn.dataset.id));
        });
    });

    /* 소비 항목 삭제 */
    document.querySelectorAll('.btn-del-spending').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            const id = Number(btn.dataset.id);
            appData.expected_spending = appData.expected_spending.filter(i => i.id !== id);
            saveData(appData);
            renderTransactions(appData);
            renderHome(appData);
        });
    });

    /* 소비 항목 추가 폼 토글 */
    const addBtn  = document.getElementById('btn-add-spending');
    const formDiv = document.getElementById('add-spending-form');

    addBtn.addEventListener('click', () => {
        addBtn.style.display = 'none';
        formDiv.style.display = 'block';
        document.getElementById('sp-category').focus();
    });

    document.getElementById('sp-cancel').addEventListener('click', () => {
        addBtn.style.display = 'flex';
        formDiv.style.display = 'none';
        document.getElementById('sp-category').value = '';
        document.getElementById('sp-amount').value   = '';
    });

    document.getElementById('sp-amount').addEventListener('input', e => {
        let val = e.target.value.replace(/[^0-9]/g, '');
        if (val) val = Number(val).toLocaleString('ko-KR');
        e.target.value = val;
    });

    document.getElementById('sp-confirm').addEventListener('click', () => {
        const category = document.getElementById('sp-category').value.trim();
        const icon     = document.getElementById('sp-icon').value;
        const timeVal  = document.getElementById('sp-time').value || '12:00';
        const amountStr = document.getElementById('sp-amount').value;
        const amount = Number(amountStr.replace(/[^0-9]/g, ''));

        if (!category) { alert('카테고리를 입력해주세요.'); return; }
        if (!amount || amount <= 0) { alert('올바른 금액을 입력해주세요.'); return; }

        const [hh] = timeVal.split(':').map(Number);
        const period = hh < 12 ? '오전' : '오후';
        const displayHour = hh % 12 || 12;
        const displayTime = `${displayHour}:${timeVal.split(':')[1]}`;

        appData.expected_spending.push({
            id:       nextSpendingId(),
            category,
            icon,
            time:     displayTime,
            period,
            amount
        });
        appData.today_spending = (appData.today_spending || 0);
        saveData(appData);
        renderTransactions(appData);
        renderHome(appData);
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
    const prevSaving = appData.total_saving || 0;
    appData.total_saving = prevSaving + item.amount;
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

    // 마일스톤 알림 (80%, 100%)
    appData.goals.forEach(goal => {
        const prevPct = Math.floor((prevSaving / goal.target_amount) * 100);
        const newPct  = Math.floor((appData.total_saving / goal.target_amount) * 100);
        if (prevPct < 100 && newPct >= 100) {
            setTimeout(() => showToast(`🎉 "${goal.name}" 목표 달성! 축하합니다!`, 'success'), 400);
        } else if (prevPct < 80 && newPct >= 80) {
            setTimeout(() => showToast(`💪 "${goal.name}" 80% 달성! 거의 다 왔어요!`, 'info'), 400);
        }
    });

    renderTransactions(appData);
    renderHome(appData);
    if (currentTab === 'stats') renderStats(appData);

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
   4. 통계 화면
════════════════════════════════════════════════════════════════ */
let statsChart = null;

function renderStats(data) {
    /* 모든 목표의 saving_history를 카테고리별로 합산 */
    const catMap = {};
    data.goals.forEach(goal => {
        goal.detail.saving_history.forEach(item => {
            if (!catMap[item.category]) {
                catMap[item.category] = { icon: item.icon, save_count: 0, total_saved: 0 };
            }
            catMap[item.category].save_count  += item.save_count;
            catMap[item.category].total_saved += item.total_saved;
        });
    });

    const cats = Object.entries(catMap)
        .map(([name, v]) => ({ name, ...v }))
        .sort((a, b) => b.total_saved - a.total_saved);

    const totalSaved = data.total_saving || 0;
    const totalCount = cats.reduce((s, c) => s + c.save_count, 0);

    const CHART_COLORS = ['#0071e3','#5ac8fa','#34c759','#ff9500','#ff3b30','#af52de','#ff2d55'];

    const categoryRowsHTML = cats.length > 0
        ? cats.map((c, i) => `
            <div class="stats-category-row">
                <span class="stats-dot" style="background:${CHART_COLORS[i % CHART_COLORS.length]}"></span>
                <span class="stats-cat-name">${c.name}</span>
                <span class="stats-cat-count">${c.save_count}회</span>
                <span class="stats-cat-amount">${fmt(c.total_saved)}</span>
            </div>
        `).join('')
        : `<p class="chart-empty">아직 절약 내역이 없어요. 절약을 시작해 보세요! 💪</p>`;

    document.getElementById('stats-content').innerHTML = `
        <header class="home-header">
            <h1>절약 통계</h1>
        </header>
        <div class="stats-total-card">
            <p class="stats-total-label">누적 절약 총액</p>
            <p class="stats-total-amount" id="stats-amount-anim">0원</p>
            <p class="stats-total-sub">총 ${totalCount}번 절약했어요!</p>
        </div>
        ${cats.length > 0 ? `
        <div class="card">
            <h3 class="section-title" style="margin-top:0">카테고리별 절약</h3>
            <div class="chart-wrapper">
                <canvas id="stats-chart" width="260" height="260"></canvas>
            </div>
            ${categoryRowsHTML}
        </div>
        ` : `<div class="card">${categoryRowsHTML}</div>`}
    `;

    animateAmount('stats-amount-anim', totalSaved, 900);

    if (cats.length > 0) {
        if (statsChart) { statsChart.destroy(); statsChart = null; }
        const ctx = document.getElementById('stats-chart').getContext('2d');
        statsChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: cats.map(c => c.name),
                datasets: [{
                    data: cats.map(c => c.total_saved),
                    backgroundColor: CHART_COLORS.slice(0, cats.length),
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                cutout: '65%',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: ctx => ` ${ctx.label}: ${Number(ctx.raw).toLocaleString('ko-KR')}원`
                        }
                    }
                }
            }
        });
    }
}

/* ════════════════════════════════════════════════════════════════
   5. 탭 전환 — 하단 네비게이션
════════════════════════════════════════════════════════════════ */
function switchTab(tab) {
    if (currentTab === tab) return;
    currentTab = tab;

    const shell = document.getElementById('app-shell');

    shell.classList.remove('show-transactions', 'show-stats');

    if (tab === 'home') {
        renderHome(appData);
    } else if (tab === 'transactions') {
        shell.classList.add('show-transactions');
        renderTransactions(appData);
    } else if (tab === 'stats') {
        shell.classList.add('show-stats');
        renderStats(appData);
    }

    /* 네비 활성 상태 */
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.tab === tab);
    });
}

document.getElementById('nav-home').addEventListener('click', () => switchTab('home'));
document.getElementById('nav-transactions').addEventListener('click', () => switchTab('transactions'));
document.getElementById('nav-stats').addEventListener('click', () => switchTab('stats'));

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
   토스트 알림
════════════════════════════════════════════════════════════════ */
function showToast(msg, type = 'success') {
    document.querySelectorAll('.toast').forEach(t => t.remove());
    const el = document.createElement('div');
    el.className = `toast toast--${type}`;
    el.textContent = msg;
    document.body.appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('toast--show')));
    setTimeout(() => {
        el.classList.remove('toast--show');
        setTimeout(() => el.remove(), 300);
    }, 3000);
}

/* ════════════════════════════════════════════════════════════════
   7. 초기 렌더링
════════════════════════════════════════════════════════════════ */
function init(data) {
    history.replaceState({ screen: 'home' }, '', '');
    renderHome(data);
    renderTransactions(data);
    renderStats(data);
}

init(appData);

/* 테스트용: 초기화 버튼 */
const resetBtn = document.createElement('button');
resetBtn.innerText = "♻️ 데이터 초기화";
resetBtn.style.cssText = "position:fixed; bottom:76px; right:20px; z-index:9999; padding:8px 12px; border-radius:8px; border:none; background:#ff4757; color:white; font-weight:bold; cursor:pointer;";
resetBtn.onclick = () => { localStorage.removeItem('financeData'); location.reload(); };
document.body.appendChild(resetBtn);
