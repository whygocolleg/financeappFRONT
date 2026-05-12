let _activeToast = null;
let _timer = null;

export function showToast(msg, type = 'success', duration = 3000) {
    if (_activeToast) {
        clearTimeout(_timer);
        _activeToast.remove();
        _activeToast = null;
    }
    const el = document.createElement('div');
    el.className = `toast toast--${type}`;
    el.textContent = msg;
    document.body.appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('toast--show')));
    _activeToast = el;
    _timer = setTimeout(() => {
        el.classList.remove('toast--show');
        setTimeout(() => { el.remove(); _activeToast = null; }, 300);
    }, duration);
}
