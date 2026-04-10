/**
 * FinancialGoalCard - Web Component
 *
 * Attributes:
 *   goal-name       : 목표 이름         (default: "새로운 노트북 구매")
 *   target-amount   : 목표 금액 (텍스트) (default: "3,000,000원")
 *   progress        : 진행률 0~100      (default: 65)
 */
class FinancialGoalCard extends HTMLElement {
    static get observedAttributes() {
        return ['goal-name', 'target-amount', 'progress'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this._render();
    }

    attributeChangedCallback() {
        this._render();
    }

    _render() {
        const goalName     = this.getAttribute('goal-name')     || '새로운 노트북 구매';
        const targetAmount = this.getAttribute('target-amount') || '3,000,000원';
        const progress     = Math.min(100, Math.max(0, Number(this.getAttribute('progress') ?? 65)));

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text",
                                 "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    -webkit-font-smoothing: antialiased;
                }

                .card {
                    background-color: #ffffff;
                    border-radius: 24px;
                    padding: 28px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
                    border: 1px solid rgba(0, 0, 0, 0.06);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    box-sizing: border-box;
                }

                .card:hover {
                    transform: scale(1.02);
                    box-shadow: 0 14px 40px rgba(0, 0, 0, 0.08);
                }

                .goal-label {
                    font-size: 13px;
                    font-weight: 600;
                    color: #86868b;
                    text-transform: uppercase;
                    letter-spacing: 0.6px;
                    margin: 0 0 8px 0;
                }

                .goal-title {
                    font-size: 24px;
                    font-weight: 700;
                    color: #1d1d1f;
                    letter-spacing: -0.5px;
                    margin: 0 0 6px 0;
                }

                .goal-amount {
                    font-size: 34px;
                    font-weight: 800;
                    color: #0071e3;
                    letter-spacing: -1px;
                    margin: 0 0 28px 0;
                }

                .progress-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 10px;
                }

                .progress-label {
                    font-size: 14px;
                    font-weight: 600;
                    color: #86868b;
                }

                .progress-percentage {
                    font-size: 20px;
                    font-weight: 700;
                    color: #1d1d1f;
                }

                .progress-bar {
                    height: 12px;
                    background-color: #e5e5ea;
                    border-radius: 6px;
                    overflow: hidden;
                }

                .progress-fill {
                    height: 100%;
                    /* ── fluid aurora gradient (dark→bright→dark) ── */
                    background: linear-gradient(90deg,
                        #003fad 0%,
                        #0071e3 20%,
                        #34aadc 45%,
                        #00d4ff 60%,
                        #0071e3 80%,
                        #003fad 100%
                    );
                    background-size: 300% 100%;
                    border-radius: 6px;
                    width: 0%;
                    transition: width 1.2s cubic-bezier(0.22, 1, 0.36, 1);
                    box-shadow: 0 0 10px rgba(0, 113, 227, 0.35);
                    will-change: width, background-position, box-shadow;
                    animation: fluid 3.5s ease-in-out infinite;
                }
                /* fluid: ocean/aurora wave */
                @keyframes fluid {
                    0%   { background-position:   0% 50%; }
                    50%  { background-position: 100% 50%; }
                    100% { background-position:   0% 50%; }
                }

                /* ── 구간 1 (0~80%): fluid ── */

                /* ── 구간 2 (80~90%): + 미세 글로우 ── */
                .progress-fill.pulse-subtle {
                    animation: fluid 3.5s ease-in-out infinite,
                               glow-subtle 1.8s ease-in-out infinite;
                }
                @keyframes glow-subtle {
                    0%, 100% { box-shadow: 0 0  8px rgba(0, 113, 227, 0.30); }
                       50%   { box-shadow: 0 0 20px rgba(0, 113, 227, 0.58); }
                }

                /* ── 구간 3 (90~97%): + 심장박동 글로우 ── */
                .progress-fill.pulse-clear {
                    animation: fluid 3.5s ease-in-out infinite,
                               glow-clear 1.1s ease-in-out infinite;
                }
                @keyframes glow-clear {
                    0%, 100% { box-shadow: 0 0  8px rgba(0, 113, 227, 0.35); }
                       50%   { box-shadow: 0 0 28px rgba(0, 113, 227, 0.85); }
                }

                /* ── 구간 4 (97~100%): + 긴장감 최고조 글로우 ── */
                .progress-fill.pulse-peak {
                    animation: fluid 3.5s ease-in-out infinite,
                               glow-peak 0.7s ease-in-out infinite;
                }
                @keyframes glow-peak {
                    0%, 100% { box-shadow: 0 0 12px rgba(0, 113, 227, 0.45); }
                       50%   { box-shadow: 0 0 40px rgba(0, 200, 255, 1.00); }
                }
            </style>

            <div class="card">
                <p class="goal-label">사용자 금융 목표</p>
                <h2 class="goal-title">${goalName}</h2>
                <p class="goal-amount">${targetAmount}</p>

                <div class="progress-container">
                    <div class="progress-header">
                        <span class="progress-label">진행도</span>
                        <span class="progress-percentage" id="pct-label">0%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" id="fill"></div>
                    </div>
                </div>
            </div>
        `;

        /*
         * 애니메이션 전략:
         * double-rAF + setTimeout(80ms) 으로 브라우저가 width:0% 를 페인트한 뒤
         * width 를 목표치로 변경 → CSS transition 이 항상 0% → target% 로 보임.
         *
         * tick 루프 안에서 현재 eased 진행률을 계산해
         * 구간에 따라 pulse 클래스를 실시간으로 교체:
         *   0  ~ 80% : 클래스 없음  (안정 구간)
         *  80 ~ 90%  : pulse-subtle (미세 글로우 리듬)
         *  90 ~ 97%  : pulse-clear  (심장박동 + scale)
         *  97 ~ 100% : pulse-peak   (긴장감 최고조)
         */
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setTimeout(() => {
                    const fill  = this.shadowRoot.getElementById('fill');
                    const label = this.shadowRoot.getElementById('pct-label');
                    if (!fill || !label) return;

                    /* CSS width 트랜지션 시작 */
                    fill.style.width = `${progress}%`;

                    const DURATION = 1200; // CSS transition 과 동일
                    const start    = performance.now();

                    /* easeOutExpo: 처음엔 빠르게, 끝에서 부드럽게 감속 */
                    const easeOutExpo = (t) =>
                        t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);

                    /* 펄스 클래스 교체 헬퍼 */
                    const PULSE_CLASSES = ['pulse-subtle', 'pulse-clear', 'pulse-peak'];
                    const setPulse = (cls) => {
                        PULSE_CLASSES.forEach(c => fill.classList.remove(c));
                        if (cls) fill.classList.add(cls);
                    };

                    const tick = (now) => {
                        const t          = Math.min((now - start) / DURATION, 1);
                        const eased      = easeOutExpo(t);
                        const currentPct = eased * progress;

                        /* ── 숫자 카운트업 ── */
                        label.textContent = Math.round(currentPct) + '%';

                        /* ── 구간별 펄스 클래스 교체 ── */
                        if      (currentPct >= 97) setPulse('pulse-peak');
                        else if (currentPct >= 90) setPulse('pulse-clear');
                        else if (currentPct >= 80) setPulse('pulse-subtle');
                        else                       setPulse(null);

                        if (t < 1) {
                            requestAnimationFrame(tick);
                        } else {
                            /* 완료: 목표치가 97 이상이면 peak 유지, 아니면 pulse 제거 */
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
