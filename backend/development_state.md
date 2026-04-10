# development_state.md — 개발 진행 상황

## 현재 단계
**Phase 0: 명세 작성 단계** (코드 작성 미시작)

## 상태 범례
- [ ] 미시작
- [~] 진행중
- [x] 완료

---

## Phase 0 — 명세 및 설계 (현재)
- [x] 프로젝트 요구사항 분석
- [x] ERD 초안 검토 (Mermaid 기반)
- [x] Agent.md 작성
- [x] development_state.md 작성
- [x] api_spec.md 작성
- [x] architecture_and_convention.md 작성
- [ ] erd.md 작성
- [ ] business_logic.md 작성
- [ ] 설계 미결 사항 확인 및 질문 (→ 사용자 답변 대기)

---

## Phase 1 — 프로젝트 초기 세팅
- [ ] NestJS 프로젝트 생성 (`nest new backend`)
- [ ] 의존성 설치 (TypeORM, PostgreSQL, JWT, class-validator 등)
- [ ] `.env` 및 `@nestjs/config` 설정
- [ ] 글로벌 prefix `/api`, 포트 3000, CORS 설정

## Phase 2 — 도메인 모듈 개발
- [ ] `auth` 모듈 (회원가입, 로그인, JWT Guard)
- [ ] `users` 모듈 (User Entity, Repository)
- [ ] `goals` 모듈 (SavingGoal Entity, CRUD, 진행도 계산)
- [ ] `spending` 모듈 (DailySpending Entity, 절약 판정 로직, 정산 주기 분석)

## Phase 3 — 비즈니스 로직 구현
- [ ] 정산 주기 계산 유틸 (매달 23일/25일 기준 기간 산출)
- [ ] 오늘의 절약 상태 판정 (success / fail / pending)
- [ ] 카테고리별 통계 집계 (차트용 데이터)
- [ ] 목표 진행도(%) 계산

## Phase 4 — 검증 및 마무리
- [ ] DTO Validation (`class-validator`)
- [ ] 에러 핸들링 (Global Exception Filter)
- [ ] API 테스트 (E2E 또는 수동)
- [ ] README 작성

---

## 미결 사항 (질문 목록)
> 사용자 답변 대기 중 — 코드 작성 블로킹

1. **정산 주기 기준일**: 23일 / 25일 중 어느 날을 기본값으로 할지, 또는 사용자별로 설정 가능하게 할지?
2. **절약 판정 기준**: 오늘의 소비가 "성공/실패/진행중"이 되는 기준 금액 또는 조건이 무엇인지?
3. **인증 방식 세부 사항**: JWT Access Token만 사용할지, Refresh Token도 구현할지?
