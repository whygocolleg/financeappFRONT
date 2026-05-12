/**
 * FinancialGoalCard - Web Component (Dark Glassmorphism Theme)
 *
 * Attributes:
 *   goal-name       : 목표 이름
 *   target-amount   : 목표 금액 (텍스트)
 *   progress        : 진행률 0~100
 */
class FinancialGoalCard extends HTMLElement {
    static get observedAttributes() {
        return ['goal-name', 'target-amount', 'progress'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback()        { this._render(); }
    attributeChangedCallback() { this._render(); }

    _render() {
        const goalName     = this.getAttribute('goal-name')     || '새로운 목표';
        const targetAmount = this.getAttribute('target-amount') || '0원';
        const progress     = Math.min(100, Math.max(0, Number(this.getAttribute('progress') ?? 0)));

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display",
                                 "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    -webkit-font-smoothing: antialiased;
                }

                .card {
                    position: relative;
                    background: rgba(255,255,255,0.035);
                    backdrop-filter: blur(24px) saturate(1.4);
                    -webkit-backdrop-filter: blur(24px) saturate(1.4);
                    border-radius: 20px;
                    padding: 26px 24px 22px;
                    border: 1px solid rgba(255,255,255,0.09);
                    box-shadow:
                        0 8px 32px rgba(0,0,0,0.45),
                        inset 0 1px 0 rgba(255,255,255,0.08);
                    overflow: hidden;
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    box-sizing: border-box;
                }

                /* 카드 내 배경 하이라이트 */
                .card::before {
                    content: '';
                    position: absolute;
                    top: -60px; right: -60px;
                    width: 200px; height: 200px;
                    background: radial-gradient(circle, rgba(79,172,254,0.08) 0%, transparent 60%);
                    pointer-events: none;
                }

                .card:hover {
                    transform: scale(1.015);
                    box-shadow:
                        0 12px 40px rgba(0,0,0,0.55),
                        0 0 30px rgba(79,172,254,0.10),
                        inset 0 1px 0 rgba(255,255,255,0.10);
                }

                .goal-label {
                    font-size: 10px;
                    font-weight: 700;
                    color: rgba(107,120,152,0.9);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin: 0 0 10px 0;
                }

                .goal-title {
                    font-size: 22px;
                    font-weight: 700;
                    color: #e8edf5;
                    letter-spacing: -0.5px;
                    margin: 0 0 6px 0;
                    line-height: 1.2;
                    /* 긴 텍스트 처리 */
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .goal-amount {
                    font-size: 28px;
                    font-weight: 800;
                    letter-spacing: -0.8px;
                    margin: 0 0 24px 0;
                    background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    filter: drop-shadow(0 0 12px rgba(79,172,254,0.35));
                }

                .progress-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 10px;
                }

                .progress-label {
                    font-size: 11px;
                    font-weight: 700;
                    color: rgba(107,120,152,0.8);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .progress-percentage {
                    font-size: 20px;
                    font-weight: 800;
                    color: #e8edf5;
                    letter-spacing: -0.5px;
                }

                .progress-bar {
                    height: 10px;
                    background: rgba(255,255,255,0.07);
                    border-radius: 5px;
                    overflow: hidden;
                    border: 1px solid rgba(255,255,255,0.05);
                }

                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg,
                        #0047cc 0%,
                        #4facfe 30%,
                        #00e5ff 60%,
                        #4facfe 80%,
                        #0047cc 100%
                    );
                    background-size: 300% 100%;
                    border-radius: 5px;
                    width: 0%;
                    transition: width 1.2s cubic-bezier(0.22, 1, 0.36, 1);
                    box-shadow: 0 0 12px rgba(79,172,254,0.5);
                    will-change: width, background-position, box-shadow;
                    animation: aurora 3.5s ease-in-out infinite;
                }

                @keyframes aurora {
                    0%   { background-position:   0% 50%; }
                    50%  { background-position: 100% 50%; }
                    100% { background-position:   0% 50%; }
                }

                /* ── 구간별 펄스 ── */
                .progress-fill.pulse-subtle {
                    animation: aurora 3.5s ease-in-out infinite,
                               glow-subtle 1.8s ease-in-out infinite;
                }
                @keyframes glow-subtle {
                    0%,100% { box-shadow: 0 0  8px rgba(79,172,254,0.40); }
                    50%     { box-shadow: 0 0 22px rgba(79,172,254,0.70); }
                }

                .progress-fill.pulse-clear {
                    animation: aurora 3.5s ease-in-out infinite,
                               glow-clear 1.1s ease-in-out infinite;
                }
                @keyframes glow-clear {
                    0%,100% { box-shadow: 0 0 10px rgba(79,172,254,0.50); }
                    50%     { box-shadow: 0 0 32px rgba(0,226,255,0.90); }
                }

                .progress-fill.pulse-peak {
                    animation: aurora 3.5s ease-in-out infinite,
                               glow-peak 0.7s ease-in-out infinite;
                }
                @keyframes glow-peak {
                    0%,100% { box-shadow: 0 0 14px rgba(79,172,254,0.60); }
                    50%     { box-shadow: 0 0 48px rgba(0,240,255,1.00); }
                }
            </style>

            <div class="card">
                <p class="goal-label">금융 목표</p>
                <h2 class="goal-title">${goalName}</h2>
                <p class="goal-amount">${targetAmount}</p>

                <div class="progress-container">
                    <div class="progress-header">
                        <span class="progress-label">달성률</span>
                        <span class="progress-percentage" id="pct-label">0%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" id="fill"></div>
                    </div>
                </div>
            </div>
        `;

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setTimeout(() => {
                    const fill  = this.shadowRoot.getElementById('fill');
                    const label = this.shadowRoot.getElementById('pct-label');
                    if (!fill || !label) return;

                    fill.style.width = `${progress}%`;

                    const DURATION    = 1200;
                    const start       = performance.now();
                    const easeOutExpo = t => t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
                    const PULSE       = ['pulse-subtle', 'pulse-clear', 'pulse-peak'];
                    const setPulse    = cls => {
                        PULSE.forEach(c => fill.classList.remove(c));
                        if (cls) fill.classList.add(cls);
                    };

                    const tick = now => {
                        const t   = Math.min((now - start) / DURATION, 1);
                        const cur = easeOutExpo(t) * progress;
                        label.textContent = Math.round(cur) + '%';

                        if      (cur >= 97) setPulse('pulse-peak');
                        else if (cur >= 90) setPulse('pulse-clear');
                        else if (cur >= 80) setPulse('pulse-subtle');
                        else                setPulse(null);

                        if (t < 1) requestAnimationFrame(tick);
                        else {
                            if      (progress >= 97) setPulse('pulse-peak');
                            else if (progress >= 90) setPulse('pulse-clear');
                            else if (progress >= 80) setPulse('pulse-subtle');
                            else                     setPulse(null);
                        }
                    };
                    requestAnimationFrame(tick);
                }, 80);
            });
        });
    }
}

customElements.define('financial-goal-card', FinancialGoalCard);
