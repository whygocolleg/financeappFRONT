import { fmt } from '../utils/format.js';

export function renderSettings(container, state, actions) {
    const { settings, user } = state;
    const name    = settings.user_name || user?.displayName || user?.email?.split('@')[0] || '사용자';
    const email   = user?.email || '';
    const initial = (settings.user_name || name || '?')[0].toUpperCase();

    container.innerHTML = `
        <header class="home-header"><h1>설정</h1></header>

        <div class="settings-profile-card">
            <div class="profile-avatar">${initial}</div>
            <div class="profile-info">
                <p class="profile-name">${name}</p>
                ${email ? `<p class="profile-email">${email}</p>` : ''}
            </div>
        </div>

        <div class="settings-section">
            <p class="settings-section-title">예산 설정</p>
            <div class="settings-item settings-item--input">
                <label class="settings-item-label" for="set-budget">오늘 예산</label>
                <div class="settings-input-wrap">
                    <input type="text" id="set-budget" class="settings-input"
                        value="${(settings.today_budget || 0).toLocaleString('ko-KR')}"
                        placeholder="0">
                    <span class="settings-input-suffix">원</span>
                </div>
            </div>
            <div class="settings-item settings-item--row">
                <span class="settings-item-label">결제일</span>
                <div class="billing-day-toggle">
                    <button class="billing-day-btn${settings.billing_day === 23 ? ' active' : ''}" data-day="23">23일</button>
                    <button class="billing-day-btn${settings.billing_day === 25 ? ' active' : ''}" data-day="25">25일</button>
                </div>
            </div>
        </div>

        <div class="settings-section">
            <p class="settings-section-title">프로필</p>
            <div class="settings-item settings-item--input">
                <label class="settings-item-label" for="set-name">이름</label>
                <input type="text" id="set-name" class="settings-input settings-input--full"
                    value="${settings.user_name || ''}"
                    placeholder="표시할 이름을 입력하세요">
            </div>
        </div>

        <div class="settings-section">
            <p class="settings-section-title">계정</p>
            <button class="settings-btn settings-btn--logout" id="btn-settings-logout">로그아웃</button>
        </div>

        <div class="settings-section settings-section--danger">
            <p class="settings-section-title">위험 구역</p>
            <button class="settings-btn settings-btn--danger" id="btn-settings-reset">데이터 초기화</button>
            <p class="settings-danger-hint">모든 목표와 절약 내역이 삭제됩니다.</p>
        </div>
    `;

    /* 예산 입력 포맷 */
    const budgetInput = container.querySelector('#set-budget');
    budgetInput.addEventListener('input', e => {
        let v = e.target.value.replace(/[^0-9]/g, '');
        if (v) v = Number(v).toLocaleString('ko-KR');
        e.target.value = v;
    });
    budgetInput.addEventListener('change', () => {
        const val = Number(budgetInput.value.replace(/[^0-9]/g, '')) || 0;
        actions.updateSettings({ today_budget: val });
    });

    /* 이름 저장 */
    const nameInput = container.querySelector('#set-name');
    nameInput.addEventListener('change', () => {
        actions.updateSettings({ user_name: nameInput.value.trim() });
    });

    /* 결제일 토글 */
    container.querySelectorAll('.billing-day-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            container.querySelectorAll('.billing-day-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            actions.updateSettings({ billing_day: Number(btn.dataset.day) });
        });
    });

    /* 로그아웃 */
    container.querySelector('#btn-settings-logout').addEventListener('click', actions.logout);

    /* 데이터 초기화 */
    container.querySelector('#btn-settings-reset').addEventListener('click', actions.resetData);
}
