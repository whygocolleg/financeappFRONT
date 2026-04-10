# business_logic.md — 비즈니스 로직

> 핀테크 도메인 핵심 로직. 코딩 전 반드시 사용자 확인 필요 항목 포함.

---

## 1. 정산 주기 계산 (Billing Cycle)

### 개요
카드 정산일 기준으로 한 달의 소비 구간을 산출한다.

### 로직 (가정: 정산일 = 25일)
```
이번 달 25일 기준:
  cycleStart = 전월 25일
  cycleEnd   = 이번 달 24일

예) 2026-04-07 기준, 정산일 25일
  → cycleStart = 2026-03-25
  → cycleEnd   = 2026-04-24
```

### 미결 사항
- [ ] 기준일이 23일인지 25일인지? 또는 사용자별로 다른지?
- [ ] 기준일이 월말(28/29/30/31일)인 달에 대한 예외 처리 방식?

---

## 2. 오늘의 절약 상태 판정 (Daily Status)

### 상태 정의
| status | 조건 | 뱃지 색상 |
|---|---|---|
| `pending` | 오늘 자정(00:00) 이전 | 노란색 |
| `success` | 하루 지출 ≤ dailyBudget (자정 이후 확정) | 초록색 |
| `fail` | 하루 지출 > dailyBudget | 빨간색 |

### dailyBudget 산출 방식 (미결)
- **안 A**: 사용자가 직접 하루 예산을 설정
- **안 B**: `남은 목표 절약액 ÷ 남은 날수`로 자동 계산
- **안 C**: 이전 정산 주기 평균 지출 기반 자동 추천

> 현재 어떤 방식인지 확인 필요.

### 판정 흐름
```
오늘 총 지출 = DAILY_SPENDING에서 spent_at이 오늘 날짜인 레코드 amount 합산
현재 시각이 자정 이전? → pending
오늘 총 지출 > dailyBudget? → fail
그렇지 않으면? → success
```

---

## 3. 목표 진행도 계산

```
progressPercent = (currentAmount / targetAmount) * 100
daysLeft = endDate - 오늘 날짜 (일 수)
```

### current_amount 누적 방식 (미결)
- **안 A**: success 판정된 날, `(dailyBudget - 실제지출)`을 자동으로 current_amount에 누적
- **안 B**: 사용자가 직접 저금액을 입력 
- **안 C**: 목표와 spending이 독립적으로 관리되고, 통계만 연결

---

## 4. 정산 주기별 카테고리 통계

```
대상 기간: cycleStart ~ cycleEnd (정산 주기 계산 결과)
집계: category별 amount 합산
비율: (category 합계 / 전체 합계) * 100
일별 트렌드: spent_at 날짜 기준 일별 amount 합산
```
