# api_spec.md — API 명세서

- Base URL: `http://localhost:3000/api`
- 인증: `Authorization: Bearer <JWT>` (인증 필요 엔드포인트에 표기)
- 공통 에러 응답:
  ```json
  { "statusCode": 400, "message": "에러 설명", "error": "Bad Request" }
  ```

---

## 1. Auth (인증)

### POST /api/auth/signup — 회원가입
**Request Body**
```json
{
  "email": "user@example.com",
  "password": "string (min 8자)",
  "name": "홍길동"
}
```
**Response 201**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "홍길동",
  "createdAt": "2026-04-07T00:00:00.000Z"
}
```

---

### POST /api/auth/signin — 로그인
**Request Body**
```json
{
  "email": "user@example.com",
  "password": "string"
}
```
**Response 200**
```json
{
  "accessToken": "jwt_token_string"
}
```

---

## 2. Goals (금융 목표)

> 모든 Goals 엔드포인트는 JWT 인증 필요.

### GET /api/goals — 내 목표 목록 및 진행도
**Response 200**
```json
[
  {
    "id": "uuid",
    "title": "새로운 노트북 구매",
    "targetAmount": 1500000,
    "currentAmount": 450000,
    "progressPercent": 30,
    "startDate": "2026-01-01",
    "endDate": "2026-12-31",
    "daysLeft": 269
  }
]
```

---

### POST /api/goals — 신규 목표 설정
**Request Body**
```json
{
  "title": "새로운 노트북 구매",
  "targetAmount": 1500000,
  "startDate": "2026-01-01",
  "endDate": "2026-12-31"
}
```
**Response 201**
```json
{
  "id": "uuid",
  "title": "새로운 노트북 구매",
  "targetAmount": 1500000,
  "currentAmount": 0,
  "progressPercent": 0,
  "startDate": "2026-01-01",
  "endDate": "2026-12-31"
}
```

---

### GET /api/goals/{id} — 목표 상세 및 누적 절약 통계
**Response 200**
```json
{
  "id": "uuid",
  "title": "새로운 노트북 구매",
  "targetAmount": 1500000,
  "currentAmount": 450000,
  "progressPercent": 30,
  "startDate": "2026-01-01",
  "endDate": "2026-12-31",
  "daysLeft": 269,
  "savingStats": {
    "totalSavedDays": 45,
    "successDays": 30,
    "failDays": 10,
    "pendingDays": 5,
    "successRate": 66.7
  }
}
```

---

## 3. Spending (소비 내역)

> 모든 Spending 엔드포인트는 JWT 인증 필요.

### GET /api/spending/today — 오늘의 소비 현황 및 절약 상태 뱃지
**Response 200**
```json
{
  "date": "2026-04-07",
  "status": "pending",
  "badge": {
    "label": "진행중",
    "color": "yellow"
  },
  "totalSpentToday": 12000,
  "dailyBudget": 30000,
  "remainingBudget": 18000,
  "spendings": [
    {
      "id": "uuid",
      "category": "커피",
      "amount": 5000,
      "spentAt": "2026-04-07T09:30:00.000Z"
    },
    {
      "id": "uuid",
      "category": "식비",
      "amount": 7000,
      "spentAt": "2026-04-07T12:00:00.000Z"
    }
  ]
}
```

> **badge status 기준** (미결 — 사용자 확인 필요):
> - `success`: 하루 예산 내 지출 완료 (자정 이후 확정)
> - `fail`: 하루 예산 초과
> - `pending`: 당일 자정 이전 (진행중)

---

### POST /api/spending — 소비 내역 추가
**Request Body**
```json
{
  "category": "커피",
  "amount": 5000,
  "spentAt": "2026-04-07T09:30:00.000Z"
}
```
**Response 201**
```json
{
  "id": "uuid",
  "category": "커피",
  "amount": 5000,
  "spentAt": "2026-04-07T09:30:00.000Z",
  "status": "pending"
}
```

---

### GET /api/spending/analytics — 정산 주기별 카테고리 통계 (차트용)
**Query Parameters**
| 파라미터 | 타입 | 설명 |
|---|---|---|
| `cycleDate` | string (YYYY-MM-DD) | 조회 기준일 (해당 정산 주기 자동 산출), 기본값: 오늘 |

**Response 200**
```json
{
  "cycleStart": "2026-03-25",
  "cycleEnd": "2026-04-24",
  "totalSpent": 380000,
  "byCategory": [
    { "category": "식비", "amount": 150000, "percent": 39.5 },
    { "category": "커피", "amount": 80000, "percent": 21.1 },
    { "category": "교통비", "amount": 60000, "percent": 15.8 },
    { "category": "기타", "amount": 90000, "percent": 23.7 }
  ],
  "dailyTrend": [
    { "date": "2026-03-25", "amount": 15000 },
    { "date": "2026-03-26", "amount": 22000 }
  ]
}
```
