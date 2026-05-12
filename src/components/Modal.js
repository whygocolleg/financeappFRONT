let _resolveModal = null;

function getOrCreateOverlay() {
    let overlay = document.getElementById('modal-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'modal-overlay';
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal-sheet" id="modal-sheet">
                <div class="modal-handle"></div>
                <div class="modal-icon" id="modal-icon"></div>
                <p class="modal-title" id="modal-title"></p>
                <p class="modal-message" id="modal-message"></p>
                <div class="modal-actions" id="modal-actions"></div>
            </div>
        `;
        document.body.appendChild(overlay);
    }
    return overlay;
}

export function showModal({ title, message, confirmText = '확인', cancelText = '취소', type = 'default', icon = '' }) {
    return new Promise(resolve => {
        _resolveModal = resolve;
        const overlay = getOrCreateOverlay();

        document.getElementById('modal-icon').innerHTML = icon;
        document.getElementById('modal-icon').style.display = icon ? 'flex' : 'none';
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-message').textContent = message || '';
        document.getElementById('modal-message').style.display = message ? '' : 'none';

        const actions = document.getElementById('modal-actions');
        actions.innerHTML = `
            ${cancelText ? `<button class="modal-btn modal-btn--cancel" id="modal-cancel">${cancelText}</button>` : ''}
            <button class="modal-btn modal-btn--confirm modal-btn--${type}" id="modal-confirm">${confirmText}</button>
        `;

        overlay.classList.add('modal-overlay--show');
        requestAnimationFrame(() => {
            document.getElementById('modal-sheet').classList.add('modal-sheet--show');
        });

        document.getElementById('modal-confirm').onclick = () => closeModal(true);
        const cancelBtn = document.getElementById('modal-cancel');
        if (cancelBtn) cancelBtn.onclick = () => closeModal(false);
        overlay.onclick = e => { if (e.target === overlay) closeModal(false); };
    });
}

export function showAlert({ title, message, confirmText = '확인', icon = '' }) {
    return showModal({ title, message, confirmText, cancelText: '', icon });
}

function closeModal(result) {
    const overlay = document.getElementById('modal-overlay');
    const sheet = document.getElementById('modal-sheet');
    if (!overlay) return;
    sheet.classList.remove('modal-sheet--show');
    overlay.classList.remove('modal-overlay--show');
    setTimeout(() => {
        overlay.style.display = 'none';
        overlay.style.display = '';
    }, 300);
    if (_resolveModal) {
        _resolveModal(result);
        _resolveModal = null;
    }
}

export function showGoalSelector(goals) {
    return new Promise(resolve => {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay modal-overlay--show';
        overlay.innerHTML = `
            <div class="modal-sheet modal-sheet--show goal-selector-sheet">
                <div class="modal-handle"></div>
                <p class="modal-title">어느 목표에 절약할까요?</p>
                <div class="goal-selector-list">
                    ${goals.map(g => {
                        const pct = Math.min(100, Math.round(((g.current_amount || 0) / g.target_amount) * 100));
                        return `
                        <button class="goal-selector-item" data-id="${g.id}">
                            <div class="goal-selector-info">
                                <span class="goal-selector-name">${g.name}</span>
                                <span class="goal-selector-pct">${pct}% 달성</span>
                            </div>
                            <div class="goal-selector-bar">
                                <div class="goal-selector-fill" style="width:${pct}%"></div>
                            </div>
                        </button>`;
                    }).join('')}
                </div>
                <button class="modal-btn modal-btn--cancel" id="goal-sel-cancel">취소</button>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.querySelectorAll('.goal-selector-item').forEach(btn => {
            btn.onclick = () => {
                overlay.remove();
                resolve(Number(btn.dataset.id));
            };
        });
        document.getElementById('goal-sel-cancel').onclick = () => { overlay.remove(); resolve(null); };
        overlay.onclick = e => { if (e.target === overlay) { overlay.remove(); resolve(null); } };
    });
}
