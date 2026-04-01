/**
 * mockData.js
 *
 * DB 연동 전 사용하는 가짜 데이터입니다.
 * 나중에 서버에서 JSON을 받아오면 이 객체를 교체(또는 fetch 결과로 덮어쓰기)하면
 * renderApp()이 다시 호출되어 화면 전체가 즉시 반영됩니다.
 *
 * ─── DB 담당자 전달 메모 ──────────────────────────────────────────────
 *  이 파일의 mockData 객체를 API 응답 JSON으로 교체만 해주세요.
 *  필드 이름과 타입을 동일하게 유지해주시면 됩니다.
 * ──────────────────────────────────────────────────────────────────────
 */
const mockData = {

    /* ── 홈 대시보드 (Home Dashboard) ── */

    /** 페이지 헤더 제목 */
    page_title: "나의 금융 현황",

    /**
     * 오늘의 절약 상태 배지
     *
     * today_status : 'success' | 'fail' | 'pending'
     *   - 'success' : 초록 배지 "오늘의 절약 성공!"
     *   - 'fail'    : 빨간 배지 "예산 초과! 주의하세요"
     *   - 'pending' : 진행중 배지 (파란 fluid 그라디언트)
     *
     * ── DB 연동 포인트 ──────────────────────────────────────────
     * DB에서 today_spending / today_budget 을 받아오면
     * computeStatus() 가 자동으로 'fail' 로 판단합니다.
     * today_status 는 수동 override 또는 기본값으로만 사용하세요.
     * ────────────────────────────────────────────────────────────
     */
    today_status: 'pending',     // 'success' | 'fail' | 'pending'
    today_spending: 19500,       // 오늘 실제 소비액 (원) — DB에서 채워줄 값
    today_budget:   30000,       // 오늘 예산 (원)       — DB에서 채워줄 값

    /** 금융 목표 카드 */
    user_goal: "새로운 노트북 구매",
    goal_amount: 3000000,       // 목표 금액 (원)
    current_saving: 1950000,    // 현재 저축액 (원)

    /** 예상 소비 목록 섹션 */
    spending_section_title: "예상 소비 목록",
    expected_spending: [
        {
            id: 1,
            category: "커피",
            time: "09:30",
            period: "오전",
            amount: 4500,
            icon: "coffee"      // 아이콘 키: "coffee" | "food" | "transport" | "shopping" | "etc"
        },
        {
            id: 2,
            category: "점심 식사",
            time: "12:30",
            period: "오후",
            amount: 13000,
            icon: "food"
        },
        {
            id: 3,
            category: "교통비",
            time: "18:00",
            period: "오후",
            amount: 3000,
            icon: "transport"
        }
    ],

    /* ── 목표 상세 화면 (Goal Detail Screen) ── */

    goal_detail: {
        /** 화면 상단 제목 */
        screen_title: "노트북 구매 목표 상세",

        /** 누적 절약 총액 (원) */
        total_saved: 1950000,

        /** 카테고리별 절약 내역 섹션 제목 */
        history_section_title: "카테고리별 절약 내역",

        /**
         * 카테고리별 절약 내역 목록
         *  - save_count  : 해당 카테고리에서 절약한 총 횟수
         *  - total_saved : 해당 카테고리 누적 절약 금액 (원)
         */
        /**
         * 조회 기간 (Billing Cycle)
         *  - start / end       : 카드 결제일 기준 주기 시작·종료일 (표시용 문자열)
         *  - total_save_count  : 이번 주기 내 전체 절약 횟수
         *
         * ── DB 연동 포인트 ──────────────────────────────────────────
         * 사용자의 카드 결제일에 따라 start/end 를 계산한 뒤
         * 이 세 필드만 API 응답으로 교체하면 화면이 자동 반영됩니다.
         * ────────────────────────────────────────────────────────────
         */
        billing_period: {
            start:            "2026.02.23",   // 주기 시작일
            end:              "2026.03.22",   // 주기 종료일
            total_save_count: 45              // 이번 주기 총 절약 횟수
        },

        saving_history: [
            {
                id: 1,
                category: "커피",
                icon: "coffee",
                save_count: 45,
                total_saved: 20250
            },
            {
                id: 2,
                category: "점심 식사",
                icon: "food",
                save_count: 12,
                total_saved: 156000
            },
            {
                id: 3,
                category: "교통비",
                icon: "transport",
                save_count: 30,
                total_saved: 90000
            },
            {
                id: 4,
                category: "쇼핑",
                icon: "shopping",
                save_count: 8,
                total_saved: 124000
            }
        ]
    }
};
