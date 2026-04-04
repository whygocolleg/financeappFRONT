/* ════════════════════════════════════════════════════════════════
   localStorage 영속화
════════════════════════════════════════════════════════════════ */
const STORAGE_KEY = 'financeData';

function loadData() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            /* 구버전 데이터(goals 배열 없음) 마이그레이션 */
            if (!parsed.goals) {
                parsed.goals = mockData.goals;
                saveData(parsed);
            }
            return parsed;
        }
    } catch (e) { /* 파싱 실패 시 mockData 로 폴백 */ }
    saveData(mockData);
    return mockData;
}

function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/* 앱 전체에서 공유하는 단일 상태 객체 */
let appData = loadData();

/* 현재 상세 화면에서 보고 있는 목표 id */
let selectedGoalId = null;

/* 다음 목표 id 생성용 (최대 id + 1) */
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
   1. renderHome(data)   — 홈 대시보드 렌더링
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

    /* 목표 카드 목록 */
    const goalsHTML = data.goals.map(goal => {
        const progress = Math.round((goal.current_saving / goal.target_amount) * 100);
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

    document.getElementById('home-content').innerHTML = `
        <header class="home-header">
            <h1>${data.page_title}</h1>
        </header>

        ${badgeHTML}

        <div class="goals-section">
            <div class="goals-list" id="goals-list">
                ${goalsHTML}
            </div>
            <button class="btn-add-goal" id="btn-add-goal">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                     stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                새로운 목표 추가하기
            </button>
        </div>

        <h3 class="section-title">${data.spending_section_title}</h3>
        <div class="list-card">
            ${spendingHTML || emptyHTML}
        </div>
    `;

    /* 카드 클릭 → 상세 화면 이동 */
    document.querySelectorAll('.goal-card-wrapper').forEach(wrapper => {
        const goalId = Number(wrapper.dataset.goalId);
        wrapper.addEventListener('click', () => navigateTo('detail', goalId));
        wrapper.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') navigateTo('detail', goalId);
        });
    });

    /* 🗑️ 삭제 버튼 이벤트 */
    document.querySelectorAll('.btn-delete-goal').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            const goalId = Number(btn.dataset.goalId);
            onDeleteGoal(goalId);
        });
    });

    /* ➕ 목표 추가 버튼 이벤트 */
    document.getElementById('btn-add-goal').addEventListener('click', onAddGoal);

    /* 💸 절약완료 버튼 이벤트 */
    document.querySelectorAll('.btn-save').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            const id = Number(btn.dataset.id);
            onSave(id);
        });
    });
}

/* ════════════════════════════════════════════════════════════════
   목표 추가
════════════════════════════════════════════════════════════════ */
function onAddGoal() {
    const name = prompt('새 목표 이름을 입력해 주세요 (예: 새 스마트폰 구매)');
    if (!name || !name.trim()) return;

    const amountStr = prompt('목표 금액을 숫자로 입력해 주세요 (원, 예: 1500000)');
    if (!amountStr) return;
    const amount = Number(amountStr.replace(/,/g, ''));
    if (isNaN(amount) || amount <= 0) {
        alert('올바른 금액을 입력해 주세요.');
        return;
    }

    const newGoal = {
        id: nextGoalId(),
        name: name.trim(),
        target_amount: amount,
        current_saving: 0,
        detail: {
            screen_title: `${name.trim()} 상세`,
            history_section_title: "카테고리별 절약 내역",
            billing_period: {
                start: new Date().toLocaleDateString('ko-KR').replace(/\./g, '.').replace(/ /g, ''),
                end: '',
                total_save_count: 0
            },
            saving_history: []
        }
    };

    appData.goals.push(newGoal);
    saveData(appData);
    renderHome(appData);
}

/* ════════════════════════════════════════════════════════════════
   목표 삭제
════════════════════════════════════════════════════════════════ */
function onDeleteGoal(goalId) {
    const goal = appData.goals.find(g => g.id === goalId);
    if (!goal) return;
    if (!confirm(`"${goal.name}" 목표를 정말 삭제할까요?\n이 작업은 되돌릴 수 없습니다.`)) return;

    appData.goals = appData.goals.filter(g => g.id !== goalId);
    saveData(appData);
    renderHome(appData);
}

/* ════════════════════════════════════════════════════════════════
   절약완료 처리
════════════════════════════════════════════════════════════════ */
function onSave(id) {
    appData.expected_spending = appData.expected_spending.filter(item => item.id !== id);
    saveData(appData);
    renderHome(appData);
}

/* ════════════════════════════════════════════════════════════════
   2. renderDetail(goal)   — 목표 상세 화면 렌더링
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
   3. 라우터 — 슬라이드 전환
════════════════════════════════════════════════════════════════ */
const shell = document.getElementById('app-shell');
const SLIDE_MS = 380;

function navigateTo(screenName, goalId) {
    if (screenName === 'detail') {
        selectedGoalId = goalId;
        const goal = appData.goals.find(g => g.id === goalId);
        if (!goal) return;
        renderDetail(goal);

        shell.classList.add('transitioning');
        shell.classList.add('show-detail');
        document.getElementById('screen-detail').scrollTop = 0;
        setTimeout(() => {
            shell.classList.remove('transitioning');
            animateAmount('sh-amount-anim', goal.current_saving, 900);
        }, SLIDE_MS);
    }
}

function navigateBack() {
    shell.classList.add('transitioning');
    shell.classList.remove('show-detail');
    setTimeout(() => shell.classList.remove('transitioning'), SLIDE_MS);
}

/* ════════════════════════════════════════════════════════════════
   4. 유틸 — 숫자 카운트업 애니메이션
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
   5. 초기 렌더링
   DB 연동 시: fetch('/api/dashboard').then(r=>r.json()).then(init);
════════════════════════════════════════════════════════════════ */
function init(data) {
    renderHome(data);
}

init(appData);

/* 테스트용: 초기화 버튼 */
const resetBtn = document.createElement('button');
resetBtn.innerText = "♻️ 데이터 초기화";
resetBtn.style.cssText = "position:fixed; bottom:20px; right:20px; z-index:9999; padding:8px 12px; border-radius:8px; border:none; background:#ff4757; color:white; font-weight:bold; cursor:pointer;";
resetBtn.onclick = () => {
    localStorage.removeItem('financeData');
    location.reload();
};
document.body.appendChild(resetBtn);
