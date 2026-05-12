export function fmt(n) {
    return Number(n || 0).toLocaleString('ko-KR') + '원';
}

export function fmtShort(n) {
    const num = Number(n || 0);
    if (num >= 100000000) return (num / 100000000).toFixed(1).replace(/\.0$/, '') + '억원';
    if (num >= 10000) return (num / 10000).toFixed(1).replace(/\.0$/, '') + '만원';
    return num.toLocaleString('ko-KR') + '원';
}

export function getDday(endDateStr) {
    if (!endDateStr) return null;
    const end = new Date(endDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    return Math.ceil((end - today) / 86400000);
}

export function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export function animateAmount(elId, target, duration = 900) {
    const el = document.getElementById(elId);
    if (!el) return;
    const start = performance.now();
    const ease = t => t < 1 ? 1 - Math.pow(2, -10 * t) : 1;
    const tick = now => {
        const t = Math.min((now - start) / duration, 1);
        el.textContent = Math.round(ease(t) * target).toLocaleString('ko-KR') + '원';
        if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
}
