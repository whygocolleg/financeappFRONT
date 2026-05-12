import { fmt, animateAmount } from '../utils/format.js';
import { iconSVG, BACK_ICON } from '../utils/icons.js';

export function renderDetail(headerSlot, container, goal, actions) {
    const d   = goal.detail || {};
    const bp  = d.billing_period || {};
    const current = goal.current_amount || 0;

    headerSlot.innerHTML = `
        <div class="detail-header">
            <button class="btn-back" id="btn-back" aria-label="뒤로 가기">${BACK_ICON}</button>
            <span class="detail-header-title">${d.screen_title || goal.name}</span>
        </div>`;
    document.getElementById('btn-back').addEventListener('click', actions.navigateBack);

    const historyHTML = (d.saving_history || []).length > 0
        ? (d.saving_history || []).map(item => `
            <div class="list-item">
                <div class="item-left">
                    <div class="item-icon">${iconSVG(item.icon)}</div>
                    <div>
                        <p class="item-title">${item.category}<span class="count-badge">${item.save_count}회</span></p>
                        <p class="item-subtitle">총 절약 횟수</p>
                    </div>
                </div>
                <span class="item-amount">${fmt(item.total_saved)}</span>
            </div>`).join('')
        : `<div class="empty-state">
            <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="36" cy="36" r="32" fill="#EEF4FF"/>
                <path d="M36 20 C36 20 22 27 22 40 C22 47.7 28.3 53 36 53 C43.7 53 50 47.7 50 40 C50 27 36 20 36 20Z" stroke="#0066FF" stroke-width="1.8" fill="none" opacity="0.5"/>
                <path d="M28 38 L33 43 L44 32" stroke="#0066FF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p class="empty-title">아직 절약 내역이 없어요</p>
            <p class="empty-sub">예상소비 탭에서 절약완료를 눌러 시작하세요!</p>
           </div>`;

    const periodHTML = bp.end
        ? `<span class="pb-range">📅 ${bp.start} ~ ${bp.end}</span>`
        : `<span class="pb-range">📅 ${bp.start || '진행중'} ~</span>`;

    const pct = Math.min(100, Math.round((current / goal.target_amount) * 100));
    const remaining = Math.max(0, goal.target_amount - current);

    container.innerHTML = `
        <div class="savings-highlight">
            <p class="sh-label">이 목표의 누적 절약 금액</p>
            <p class="sh-amount" id="sh-amount-anim">0원</p>
            <div class="sh-progress-bar">
                <div class="sh-progress-fill" style="width:${pct}%"></div>
            </div>
            <div class="sh-progress-labels">
                <span>${pct}% 달성</span>
                <span>목표 ${fmt(goal.target_amount)}</span>
            </div>
            ${remaining > 0 ? `<p class="sh-sub">목표까지 ${fmt(remaining)} 남았어요 🎯</p>` : `<p class="sh-sub">🎉 목표를 달성했어요! 축하합니다!</p>`}
        </div>

        <h3 class="section-title">${d.history_section_title || '카테고리별 절약 내역'}</h3>
        <div class="period-bar">${periodHTML}</div>
        <div class="list-card">${historyHTML}</div>
    `;

    setTimeout(() => animateAmount('sh-amount-anim', current, 900), 100);
}
