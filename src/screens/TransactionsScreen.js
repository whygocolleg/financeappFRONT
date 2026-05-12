import { fmt } from '../utils/format.js';
import { iconSVG, TRASH_ICON, PLUS_ICON, ICON_OPTIONS } from '../utils/icons.js';

export function renderTransactions(container, state, actions) {
    const { data, settings } = state;
    const budget   = settings.today_budget || 0;
    const spent    = data.today_spending   || 0;
    const total    = data.expected_spending.reduce((s, i) => s + i.amount, 0);
    const combined = spent + total;
    const isOver   = budget > 0 && combined > budget;
    const pct      = budget > 0 ? Math.min(100, Math.round((combined / budget) * 100)) : 0;

    const budgetBarHTML = `
        <div class="budget-bar-card${isOver ? ' budget-bar-card--over' : ''}">
            <div class="budget-bar-header">
                <span class="budget-bar-label">오늘 예산 사용률</span>
                <span class="budget-bar-pct${isOver ? ' over' : ''}">${budget > 0 ? pct + '%' : '예산 미설정'}</span>
            </div>
            ${budget > 0 ? `
            <div class="budget-bar-track">
                <div class="budget-bar-fill${isOver ? ' over' : ''}" style="width:${pct}%"></div>
            </div>
            <div class="budget-bar-amounts">
                <span>예상 지출 ${fmt(combined)}</span>
                <span>예산 ${fmt(budget)}</span>
            </div>
            ${isOver ? `<div class="budget-warning">⚠️ 예산을 ${fmt(combined - budget)} 초과 예정!</div>` : ''}
            ` : `<p class="budget-unset-hint"><a href="#" id="go-to-settings">설정에서 예산을 등록하세요 →</a></p>`}
        </div>`;

    const spendingHTML = data.expected_spending.length > 0
        ? `<div class="list-card">${data.expected_spending.map(item => `
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
            </div>`).join('')}
        </div>`
        : `<div class="empty-state"><p class="empty-icon">🎉</p><p class="empty-title">모두 절약했어요!</p><p class="empty-sub">오늘 예상 소비를 전부 절약했어요.</p></div>`;

    const iconOptions = ICON_OPTIONS.map(o =>
        `<option value="${o.value}">${o.label}</option>`
    ).join('');

    container.innerHTML = `
        <header class="home-header">
            <h1>예상 소비</h1>
        </header>

        ${budgetBarHTML}

        <h3 class="section-title">소비 내역</h3>
        ${spendingHTML}

        <button class="btn-add-goal" id="btn-add-spending">
            ${PLUS_ICON} 소비 항목 추가하기
        </button>

        <div class="add-spending-form add-goal-form" id="add-spending-form" style="display:none">
            <p class="form-title">소비 항목 추가 📋</p>
            <input type="text"   id="sp-category" class="form-input" placeholder="카테고리 (예: 카페라떼)" autocomplete="off">
            <div class="form-input-error" id="err-sp-category"></div>
            <select id="sp-icon" class="form-input form-select">${iconOptions}</select>
            <label class="form-label">예상 시간</label>
            <input type="time" id="sp-time" class="form-input" value="12:00">
            <input type="text" id="sp-amount" class="form-input" placeholder="금액 (원)" autocomplete="off">
            <div class="form-input-error" id="err-sp-amount"></div>
            <div class="form-actions">
                <button class="btn-cancel"  id="sp-cancel">취소</button>
                <button class="btn-confirm" id="sp-confirm">추가</button>
            </div>
        </div>
    `;

    /* 설정으로 이동 */
    const settingsLink = container.querySelector('#go-to-settings');
    if (settingsLink) settingsLink.addEventListener('click', e => { e.preventDefault(); actions.switchTab('settings'); });

    /* 절약완료 */
    container.querySelectorAll('.btn-save').forEach(btn => {
        btn.addEventListener('click', async e => {
            e.stopPropagation();
            if (btn.disabled) return;
            btn.disabled = true;
            btn.classList.add('btn-loading');
            await actions.saveSpending(Number(btn.dataset.id));
            if (btn.isConnected) {
                btn.disabled = false;
                btn.classList.remove('btn-loading');
            }
        });
    });

    /* 소비 삭제 */
    container.querySelectorAll('.btn-del-spending').forEach(btn => {
        btn.addEventListener('click', async e => {
            e.stopPropagation();
            if (btn.disabled) return;
            btn.disabled = true;
            await actions.deleteSpending(Number(btn.dataset.id));
        });
    });

    /* 추가 폼 */
    const addBtn  = container.querySelector('#btn-add-spending');
    const formDiv = container.querySelector('#add-spending-form');

    addBtn.addEventListener('click', () => {
        addBtn.style.display = 'none';
        formDiv.style.display = 'block';
        container.querySelector('#sp-category').focus();
    });

    container.querySelector('#sp-cancel').addEventListener('click', () => {
        addBtn.style.display = 'flex';
        formDiv.style.display = 'none';
        clearSpendingForm(container);
    });

    container.querySelector('#sp-amount').addEventListener('input', e => {
        let v = e.target.value.replace(/[^0-9]/g, '');
        if (v) v = Number(v).toLocaleString('ko-KR');
        e.target.value = v;
    });

    container.querySelector('#sp-confirm').addEventListener('click', async () => {
        const category = container.querySelector('#sp-category').value.trim();
        const icon     = container.querySelector('#sp-icon').value;
        const timeVal  = container.querySelector('#sp-time').value || '12:00';
        const amtStr   = container.querySelector('#sp-amount').value;
        const amount   = Number(amtStr.replace(/[^0-9]/g, ''));

        let ok = true;
        if (!category) {
            container.querySelector('#err-sp-category').textContent = '카테고리를 입력해주세요.';
            ok = false;
        } else {
            container.querySelector('#err-sp-category').textContent = '';
        }
        if (!amount || amount <= 0) {
            container.querySelector('#err-sp-amount').textContent = '올바른 금액을 입력해주세요.';
            ok = false;
        } else {
            container.querySelector('#err-sp-amount').textContent = '';
        }
        if (!ok) return;

        const [hh] = timeVal.split(':').map(Number);
        const period = hh < 12 ? '오전' : '오후';
        const displayHour = hh % 12 || 12;
        const displayTime = `${displayHour}:${timeVal.split(':')[1]}`;

        const btn = container.querySelector('#sp-confirm');
        btn.disabled = true;
        btn.classList.add('btn-loading');
        await actions.addSpending({ category, icon, time: displayTime, period, amount });
        if (btn.isConnected) {
            btn.disabled = false;
            btn.classList.remove('btn-loading');
        }
    });
}

function clearSpendingForm(container) {
    ['#sp-category', '#sp-amount'].forEach(s => {
        const el = container.querySelector(s);
        if (el) el.value = '';
    });
    ['#err-sp-category', '#err-sp-amount'].forEach(s => {
        const el = container.querySelector(s);
        if (el) el.textContent = '';
    });
}
