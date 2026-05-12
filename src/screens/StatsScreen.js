import { fmt, animateAmount } from '../utils/format.js';

const CHART_COLORS = ['#0071e3','#5ac8fa','#34c759','#ff9500','#ff3b30','#af52de','#ff2d55','#ffcc00'];

let _chart = null;

export function renderStats(container, state) {
    const { data } = state;

    const catMap = {};
    data.goals.forEach(goal => {
        (goal.detail?.saving_history || []).forEach(item => {
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

    const totalSaved = data.goals.reduce((s, g) => s + (g.current_amount || 0), 0);
    const totalCount = cats.reduce((s, c) => s + c.save_count, 0);

    const categoryRowsHTML = cats.length > 0
        ? cats.map((c, i) => `
            <div class="stats-category-row">
                <span class="stats-dot" style="background:${CHART_COLORS[i % CHART_COLORS.length]}"></span>
                <span class="stats-cat-name">${c.name}</span>
                <span class="stats-cat-count">${c.save_count}회</span>
                <span class="stats-cat-amount">${fmt(c.total_saved)}</span>
            </div>`).join('')
        : '';

    const goalRowsHTML = data.goals.map(g => {
        const pct = Math.min(100, Math.round(((g.current_amount || 0) / g.target_amount) * 100));
        return `
        <div class="stats-goal-row">
            <div class="stats-goal-header">
                <span class="stats-goal-name">${g.name}</span>
                <span class="stats-goal-pct">${pct}%</span>
            </div>
            <div class="stats-goal-track">
                <div class="stats-goal-fill" style="width:${pct}%"></div>
            </div>
            <div class="stats-goal-amounts">
                <span>${fmt(g.current_amount || 0)} 저축</span>
                <span>목표 ${fmt(g.target_amount)}</span>
            </div>
        </div>`;
    }).join('');

    container.innerHTML = `
        <header class="home-header"><h1>절약 통계</h1></header>

        <div class="stats-total-card">
            <p class="stats-total-label">누적 절약 총액</p>
            <p class="stats-total-amount" id="stats-amount-anim">0원</p>
            <p class="stats-total-sub">총 ${totalCount}번 절약했어요!</p>
        </div>

        ${data.goals.length > 0 ? `
        <div class="card">
            <h3 class="section-title" style="margin-top:0">목표별 달성률</h3>
            ${goalRowsHTML}
        </div>` : ''}

        ${cats.length > 0 ? `
        <div class="card" style="margin-top:16px">
            <h3 class="section-title" style="margin-top:0">카테고리별 절약</h3>
            <div class="chart-wrapper">
                <canvas id="stats-chart" width="260" height="260"></canvas>
            </div>
            <div class="stats-category-list">${categoryRowsHTML}</div>
        </div>` : `
        <div class="empty-state" style="margin-top:24px">
            <p class="empty-icon">📊</p>
            <p class="empty-title">아직 절약 내역이 없어요</p>
            <p class="empty-sub">예상소비 탭에서 절약완료를 눌러보세요!</p>
        </div>`}
    `;

    animateAmount('stats-amount-anim', totalSaved, 900);

    if (cats.length > 0) {
        requestAnimationFrame(() => {
            if (_chart) { _chart.destroy(); _chart = null; }
            const canvas = document.getElementById('stats-chart');
            if (!canvas) return;
            _chart = new Chart(canvas.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: cats.map(c => c.name),
                    datasets: [{
                        data:            cats.map(c => c.total_saved),
                        backgroundColor: CHART_COLORS.slice(0, cats.length),
                        borderWidth:     2,
                        borderColor:     '#fff',
                    }],
                },
                options: {
                    cutout: '65%',
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: ctx => ` ${ctx.label}: ${Number(ctx.raw).toLocaleString('ko-KR')}원`,
                            },
                        },
                    },
                },
            });
        });
    }
}

export function destroyChart() {
    if (_chart) { _chart.destroy(); _chart = null; }
}
