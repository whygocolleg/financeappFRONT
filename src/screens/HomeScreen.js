import { fmt, getDday } from '../utils/format.js';
import { iconSVG, TRASH_ICON, PLUS_ICON } from '../utils/icons.js';

export function renderHome(container, state, actions) {
    const { data, settings } = state;

    function computeStatus() {
        if (data.today_spending > (settings.today_budget || 0)) return 'fail';
        return data.today_status || 'pending';
    }

    function badgeHTML(status) {
        const CHECK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
        const WARN  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
        const cfg = {
            success: { cls: 'badge--success', icon: CHECK, text: '오늘의 절약 성공!' },
            fail:    { cls: 'badge--fail',    icon: WARN,  text: '예산 초과! 주의하세요' },
            pending: { cls: 'badge--pending', icon: '',    text: '오늘도 절약 도전중' },
        };
        const c = cfg[status] || cfg.pending;
        return `<div class="badge ${c.cls}">${c.icon}${c.text}</div>`;
    }

    const goalsHTML = data.goals.map(goal => {
        const current  = goal.current_amount || 0;
        const progress = Math.min(100, Math.round((current / goal.target_amount) * 100));
        const dday     = getDday(goal.endDate);
        const remaining = Math.max(0, goal.target_amount - current);

        let ddayHTML = '';
        if (dday !== null) {
            let cls, label;
            if      (dday < 0)   { cls = 'dday--over'; label = `D+${Math.abs(dday)} 기간 종료`; }
            else if (dday === 0) { cls = 'dday--soon'; label = 'D-DAY 오늘이 마지막!'; }
            else if (dday <= 7)  { cls = 'dday--soon'; label = `D-${dday} · ${dday}일 남음`; }
            else                 { cls = 'dday--ok';   label = `D-${dday} · ${dday}일 남음`; }
            if (dday > 0 && remaining > 0)
                label += ` · 하루 ${fmt(Math.ceil(remaining / dday))} 절약`;
            ddayHTML = `<div class="dday-row"><span class="dday-badge ${cls}">${label}</span></div>`;
        }

        return `
        <div class="goal-card-outer">
            <div class="goal-card-wrapper" data-goal-id="${goal.id}" role="button" tabindex="0" aria-label="${goal.name} 상세 보기">
                <financial-goal-card
                    goal-name="${goal.name}"
                    target-amount="${fmt(goal.target_amount)}"
                    progress="${progress}">
                </financial-goal-card>
            </div>
            <button class="btn-delete-goal" data-goal-id="${goal.id}" aria-label="목표 삭제">${TRASH_ICON}</button>
            ${ddayHTML}
        </div>`;
    }).join('');

    container.innerHTML = `
        <header class="home-header">
            <h1>${data.page_title || '나의 금융 현황'}</h1>
        </header>

        ${badgeHTML(computeStatus())}

        <div class="summary-row">
            <div class="summary-card">
                <p class="summary-label">총 절약 금액</p>
                <p class="summary-amount">${fmt(data.goals.reduce((s, g) => s + (g.current_amount || 0), 0))}</p>
            </div>
            <div class="summary-card">
                <p class="summary-label">진행중 목표</p>
                <p class="summary-amount">${data.goals.length}개</p>
            </div>
        </div>

        <div class="goals-section">
            <h3 class="section-title">나의 목표 진행도</h3>
            <div class="goals-list" id="goals-list">
                ${goalsHTML || `
                <div class="empty-state">
                    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="36" cy="36" r="32" fill="#EEF4FF"/>
                        <circle cx="36" cy="36" r="20" stroke="#0066FF" stroke-width="1.5" stroke-dasharray="4 3" fill="none" opacity="0.35"/>
                        <circle cx="36" cy="36" r="11" stroke="#0066FF" stroke-width="2" fill="none"/>
                        <circle cx="36" cy="36" r="4" fill="#0066FF"/>
                        <line x1="36" y1="4" x2="36" y2="13" stroke="#AACCFF" stroke-width="2" stroke-linecap="round"/>
                        <line x1="36" y1="59" x2="36" y2="68" stroke="#AACCFF" stroke-width="2" stroke-linecap="round"/>
                        <line x1="4" y1="36" x2="13" y2="36" stroke="#AACCFF" stroke-width="2" stroke-linecap="round"/>
                        <line x1="59" y1="36" x2="68" y2="36" stroke="#AACCFF" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    <p class="empty-title">목표가 없어요</p>
                    <p class="empty-sub">아래 버튼으로 첫 목표를 추가해 보세요!</p>
                </div>`}
            </div>
            <button class="btn-add-goal" id="btn-add-goal">
                ${PLUS_ICON} 새로운 목표 추가하기
            </button>
            <div class="add-goal-form" id="add-goal-form" style="display:none">
                <p class="form-title">새로운 목표 시작하기 🚀</p>
                <input type="text"   id="new-goal-name"     class="form-input" placeholder="목표 이름 (예: 유럽 여행)" autocomplete="off">
                <div class="form-input-error" id="err-goal-name"></div>
                <input type="text"   id="new-goal-amount"   class="form-input" placeholder="목표 금액 (예: 1,000,000)" autocomplete="off">
                <div class="form-input-error" id="err-goal-amount"></div>
                <label class="form-label">목표 마감일 (선택)</label>
                <input type="date"   id="new-goal-end-date" class="form-input">
                <div class="form-actions">
                    <button class="btn-cancel"  id="btn-cancel-goal">취소</button>
                    <button class="btn-confirm" id="btn-confirm-goal">추가하기</button>
                </div>
            </div>
        </div>
    `;

    /* 카드 클릭 */
    container.querySelectorAll('.goal-card-wrapper').forEach(w => {
        const id = Number(w.dataset.goalId);
        w.addEventListener('click',   () => actions.navigateTo('detail', id));
        w.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') actions.navigateTo('detail', id); });
    });

    /* 목표 삭제 */
    container.querySelectorAll('.btn-delete-goal').forEach(btn => {
        btn.addEventListener('click', e => { e.stopPropagation(); actions.deleteGoal(Number(btn.dataset.goalId)); });
    });

    /* 목표 추가 폼 토글 */
    const addBtn  = container.querySelector('#btn-add-goal');
    const formDiv = container.querySelector('#add-goal-form');

    addBtn.addEventListener('click', () => {
        addBtn.style.display = 'none';
        formDiv.style.display = 'block';
        container.querySelector('#new-goal-name').focus();
    });

    container.querySelector('#btn-cancel-goal').addEventListener('click', () => {
        addBtn.style.display = 'flex';
        formDiv.style.display = 'none';
        clearGoalForm(container);
    });

    container.querySelector('#new-goal-amount').addEventListener('input', e => {
        let v = e.target.value.replace(/[^0-9]/g, '');
        if (v) v = Number(v).toLocaleString('ko-KR');
        e.target.value = v;
    });

    container.querySelector('#btn-confirm-goal').addEventListener('click', async () => {
        const name    = container.querySelector('#new-goal-name').value.trim();
        const amtStr  = container.querySelector('#new-goal-amount').value;
        const endDate = container.querySelector('#new-goal-end-date').value || '';
        const amount  = Number(amtStr.replace(/[^0-9]/g, ''));

        let ok = true;
        if (!name) {
            container.querySelector('#err-goal-name').textContent = '목표 이름을 입력해주세요.';
            ok = false;
        } else {
            container.querySelector('#err-goal-name').textContent = '';
        }
        if (!amount || amount <= 0) {
            container.querySelector('#err-goal-amount').textContent = '올바른 금액을 입력해주세요.';
            ok = false;
        } else {
            container.querySelector('#err-goal-amount').textContent = '';
        }
        if (!ok) return;

        const btn = container.querySelector('#btn-confirm-goal');
        btn.disabled = true;
        btn.classList.add('btn-loading');
        await actions.addGoal({ name, target_amount: amount, endDate });
        if (btn.isConnected) {
            btn.disabled = false;
            btn.classList.remove('btn-loading');
        }
    });
}

function clearGoalForm(container) {
    ['#new-goal-name', '#new-goal-amount', '#new-goal-end-date'].forEach(s => {
        const el = container.querySelector(s);
        if (el) el.value = '';
    });
    ['#err-goal-name', '#err-goal-amount'].forEach(s => {
        const el = container.querySelector(s);
        if (el) el.textContent = '';
    });
}
