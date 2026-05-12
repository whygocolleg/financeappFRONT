// 각 화면의 실제 레이아웃과 동일한 형태의 shimmer 스켈레톤 반환

export function skeletonHome() {
    return `
        <header class="home-header">
            <div class="skel" style="height:26px;width:168px"></div>
        </header>

        <div class="skel" style="height:44px;border-radius:22px;margin-bottom:20px"></div>

        <div class="summary-row">
            <div class="summary-card">
                <div class="skel" style="height:12px;width:72px;margin-bottom:10px"></div>
                <div class="skel" style="height:24px;width:96px"></div>
            </div>
            <div class="summary-card">
                <div class="skel" style="height:12px;width:60px;margin-bottom:10px"></div>
                <div class="skel" style="height:24px;width:44px"></div>
            </div>
        </div>

        <div class="goals-section">
            <div class="skel" style="height:14px;width:130px;margin-bottom:16px;border-radius:6px"></div>
            <div class="skel" style="height:152px;border-radius:20px;margin-bottom:12px"></div>
            <div class="skel" style="height:152px;border-radius:20px;margin-bottom:12px"></div>
        </div>
    `;
}

export function skeletonTransactions() {
    const row = () => `
        <div style="display:flex;align-items:center;gap:12px;padding:16px 20px;border-bottom:0.5px solid rgba(60,60,67,0.08)">
            <div class="skel" style="width:40px;height:40px;border-radius:12px;flex-shrink:0"></div>
            <div style="flex:1">
                <div class="skel" style="height:14px;width:110px;margin-bottom:8px"></div>
                <div class="skel" style="height:12px;width:80px"></div>
            </div>
            <div class="skel" style="height:18px;width:64px"></div>
        </div>`;

    return `
        <header class="home-header">
            <div class="skel" style="height:26px;width:100px"></div>
        </header>

        <div class="skel" style="height:116px;border-radius:20px;margin-bottom:20px"></div>

        <div class="skel" style="height:14px;width:80px;margin-bottom:16px;border-radius:6px"></div>

        <div class="list-card" style="overflow:hidden">
            ${row()}${row()}${row()}
        </div>
    `;
}

export function skeletonStats() {
    const goalRow = () => `
        <div style="margin-bottom:18px">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px">
                <div class="skel" style="height:14px;width:110px"></div>
                <div class="skel" style="height:14px;width:38px"></div>
            </div>
            <div class="skel" style="height:8px;border-radius:4px"></div>
        </div>`;

    return `
        <header class="home-header">
            <div class="skel" style="height:26px;width:100px"></div>
        </header>

        <div class="skel" style="height:104px;border-radius:20px;margin-bottom:20px"></div>

        <div class="card">
            <div class="skel" style="height:14px;width:120px;margin-bottom:18px;border-radius:6px"></div>
            ${goalRow()}${goalRow()}
        </div>
    `;
}
