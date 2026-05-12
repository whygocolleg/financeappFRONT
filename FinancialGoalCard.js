/**
 * FinancialGoalCard - Web Component (Toss × Apple Light Theme)
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
                    -moz-osx-font-smoothing: grayscale;
                }

                .card {
                    position: relative;
                    background: #FFFFFF;
                    border-radius: 20px;
                    padding: 22px 20px 20px;
                    border: none;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.06), 0 0 0 0.5px rgba(60,60,67,0.08);
                    overflow: hidden;
                    transition: transform 0.25s ease, box-shadow 0.25s ease;
                    box-sizing: border-box;
                }

                .card:hover {
                    transform: scale(1.012);
                    box-shadow: 0 6px 24px rgba(0,0,0,0.10), 0 0 0 0.5px rgba(60,60,67,0.10);
                }

                /* 카드 상단 오른쪽 컬러 힌트 */
                .card::before {
                    content: '';
                    position: absolute;
                    top: -40px; right: -40px;
                    width: 140px; height: 140px;
                    background: radial-gradient(circle, rgba(0,102,255,0.06) 0%, transparent 65%);
                    pointer-events: none;
                }

                .goal-label {
                    font-size: 10px;
                    font-weight: 700;
                    color: #8E8E93;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin: 0 0 8px 0;
                }

                .goal-title {
                    font-size: 18px;
                    font-weight: 700;
                    color: #1A1A1F;
                    letter-spacing: -0.3px;
                    margin: 0 0 4px 0;
                    line-height: 1.25;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .goal-amount {
                    font-size: 24px;
                    font-weight: 800;
                    letter-spacing: -0.6px;
                    margin: 0 0 20px 0;
                    color: #0066FF;
                }

                .progress-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 8px;
                }

                .progress-label {
                    font-size: 11px;
                    font-weight: 600;
                    color: #8E8E93;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .progress-percentage {
                    font-size: 18px;
                    font-weight: 800;
                    color: #1A1A1F;
                    letter-spacing: -0.4px;
                }

                .progress-bar {
                    height: 8px;
                    background: rgba(0,102,255,0.08);
                    border-radius: 4px;
                    overflow: hidden;
                }

                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg,
                        #0047cc 0%,
                        #0066ff 25%,
                        #4facfe 55%,
                        #00e5ff 75%,
                        #0066ff 90%,
                        #0047cc 100%
                    );
                    background-size: 300% 100%;
                    border-radius: 4px;
                    width: 0%;
                    transition: width 1.2s cubic-bezier(0.22, 1, 0.36, 1);
                    box-shadow: 0 0 8px rgba(0,102,255,0.35);
                    will-change: width, background-position;
                    animation: aurora 3.5s ease-in-out infinite;
                }

                @keyframes aurora {
                    0%   { background-position:   0% 50%; }
                    50%  { background-position: 100% 50%; }
                    100% { background-position:   0% 50%; }
                }

                .progress-fill.pulse-subtle {
                    animation: aurora 3.5s ease-in-out infinite,
                               glow-subtle 1.8s ease-in-out infinite;
                }
                @keyframes glow-subtle {
                    0%,100% { box-shadow: 0 0 6px rgba(0,102,255,0.30); }
                    50%     { box-shadow: 0 0 18px rgba(0,102,255,0.55); }
                }

                .progress-fill.pulse-clear {
                    animation: aurora 3.5s ease-in-out infinite,
                               glow-clear 1.1s ease-in-out infinite;
                }
                @keyframes glow-clear {
                    0%,100% { box-shadow: 0 0 8px rgba(0,102,255,0.40); }
                    50%     { box-shadow: 0 0 26px rgba(0,150,255,0.75); }
                }

                .progress-fill.pulse-peak {
                    animation: aurora 3.5s ease-in-out infinite,
                               glow-peak 0.7s ease-in-out infinite;
                }
                @keyframes glow-peak {
                    0%,100% { box-shadow: 0 0 10px rgba(0,102,255,0.50); }
                    50%     { box-shadow: 0 0 36px rgba(0,180,255,0.90); }
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
