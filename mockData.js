/**
 * mockData.js
 *
 * 백엔드 연동 전 사용하는 목 데이터입니다.
 * src/config.js 의 USE_BACKEND = true 로 전환하면 이 데이터 대신
 * 실제 API 응답이 사용됩니다.
 *
 * ─── 백엔드 담당자 전달 메모 ─────────────────────────────────────────
 *  이 파일의 구조가 API 응답 JSON 의 기준 형식입니다.
 *  각 goal 에는 current_amount (현재 저축액) 필드가 필수입니다.
 *  field 이름과 타입을 동일하게 맞춰주세요.
 * ─────────────────────────────────────────────────────────────────────
 */
const mockData = {

    page_title: "나의 금융 현황",

    today_status:   'pending',
    today_spending: 19500,
    today_budget:   30000,

    expected_spending: [
        { id: 1, category: "커피",     time: "09:30", period: "오전", amount: 4500,  icon: "coffee"    },
        { id: 2, category: "점심 식사", time: "12:30", period: "오후", amount: 13000, icon: "food"      },
        { id: 3, category: "교통비",   time: "18:00", period: "오후", amount: 3000,  icon: "transport" },
    ],

    goals: [
        {
            id:             1,
            name:           "새로운 노트북 구매",
            target_amount:  3000000,
            current_amount: 390250,
            endDate:        "2026-07-31",
            detail: {
                screen_title:          "노트북 구매 목표 상세",
                history_section_title: "카테고리별 절약 내역",
                billing_period: { start: "2026.02.23", end: "2026.03.22", total_save_count: 45 },
                saving_history: [
                    { id: 1, category: "커피",     icon: "coffee",    save_count: 45, total_saved: 20250  },
                    { id: 2, category: "점심 식사", icon: "food",      save_count: 12, total_saved: 156000 },
                    { id: 3, category: "교통비",   icon: "transport", save_count: 30, total_saved: 90000  },
                    { id: 4, category: "쇼핑",     icon: "shopping",  save_count:  8, total_saved: 124000 },
                ],
            },
        },
        {
            id:             2,
            name:           "유럽 여행 자금",
            target_amount:  5000000,
            current_amount: 113000,
            endDate:        "2026-12-31",
            detail: {
                screen_title:          "유럽 여행 목표 상세",
                history_section_title: "카테고리별 절약 내역",
                billing_period: { start: "2026.02.23", end: "2026.03.22", total_save_count: 20 },
                saving_history: [
                    { id: 1, category: "커피",     icon: "coffee", save_count: 20, total_saved: 9000   },
                    { id: 2, category: "점심 식사", icon: "food",   save_count:  8, total_saved: 104000 },
                ],
            },
        },
        {
            id:             3,
            name:           "비상금 마련",
            target_amount:  2000000,
            current_amount: 500000,
            detail: {
                screen_title:          "비상금 목표 상세",
                history_section_title: "카테고리별 절약 내역",
                billing_period: { start: "2026.02.23", end: "", total_save_count: 10 },
                saving_history: [
                    { id: 1, category: "쇼핑",   icon: "shopping",  save_count: 5, total_saved: 300000 },
                    { id: 2, category: "교통비", icon: "transport", save_count: 5, total_saved: 200000 },
                ],
            },
        },
    ],
};
