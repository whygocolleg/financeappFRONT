# architecture_and_convention.md — 아키텍처 및 컨벤션

## 기술 스택
| 항목 | 선택 |
|---|---|
| Framework | NestJS (v10+) |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | TypeORM |
| 인증 | JWT (`@nestjs/jwt`, `passport-jwt`) |
| 환경변수 | `@nestjs/config` + `.env` |
| 유효성 검사 | `class-validator`, `class-transformer` |
| API 테스트 | REST Client / Postman |

---

## 서버 설정
```
포트: 3000
Global Prefix: /api
CORS 허용 출처:
  - http://localhost:5173  (React Vite 개발 서버)
  - Stitch Preview URL
```

---

## 프로젝트 디렉토리 구조
```
backend/
├── src/
│   ├── main.ts                  ← 서버 진입점 (port, prefix, CORS)
│   ├── app.module.ts            ← 루트 모듈
│   │
│   ├── auth/                    ← 인증 모듈
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── dto/
│   │   │   ├── signup.dto.ts
│   │   │   └── signin.dto.ts
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts
│   │   └── strategies/
│   │       └── jwt.strategy.ts
│   │
│   ├── users/                   ← 사용자 도메인
│   │   ├── users.module.ts
│   │   ├── users.service.ts
│   │   └── entities/
│   │       └── user.entity.ts
│   │
│   ├── goals/                   ← 금융 목표 모듈
│   │   ├── goals.module.ts
│   │   ├── goals.controller.ts
│   │   ├── goals.service.ts
│   │   ├── dto/
│   │   │   └── create-goal.dto.ts
│   │   └── entities/
│   │       └── saving-goal.entity.ts
│   │
│   ├── spending/                ← 소비 내역 모듈
│   │   ├── spending.module.ts
│   │   ├── spending.controller.ts
│   │   ├── spending.service.ts
│   │   ├── dto/
│   │   │   └── create-spending.dto.ts
│   │   ├── entities/
│   │   │   └── daily-spending.entity.ts
│   │   └── utils/
│   │       └── billing-cycle.util.ts  ← 정산 주기 계산 유틸
│   │
│   └── common/                  ← 공통 모듈
│       ├── filters/
│       │   └── http-exception.filter.ts
│       └── decorators/
│           └── current-user.decorator.ts
│
├── .env
├── .env.example
└── package.json
```

---

## 레이어 역할 분리 원칙

| 레이어 | 역할 | 금지 사항 |
|---|---|---|
| **Controller** | 엔드포인트 정의, DTO 바인딩, Service 호출, 응답 반환 | 비즈니스 로직 금지 |
| **Service** | 모든 비즈니스 로직 (정산 주기 계산, 절약 판정, 통계 집계) | DB 직접 쿼리 금지 |
| **Repository (TypeORM)** | DB 쿼리 및 Entity CRUD | 비즈니스 로직 금지 |
| **DTO** | Request 데이터 유효성 검사 (`class-validator`) | — |
| **Entity** | TypeORM DB 스키마 정의 | — |

---

## 코딩 컨벤션

### 네이밍
- 파일: `kebab-case` (예: `billing-cycle.util.ts`)
- 클래스: `PascalCase` (예: `SpendingService`)
- 변수/함수: `camelCase` (예: `getCurrentBillingCycle`)
- DB 컬럼: `snake_case` (TypeORM `@Column({ name: 'spent_at' })`)
- 상수: `UPPER_SNAKE_CASE` (예: `DEFAULT_BILLING_DAY`)

### DTO 규칙
- 모든 Request Body는 DTO 클래스로 정의
- `@IsNotEmpty()`, `@IsEmail()`, `@IsDateString()` 등 class-validator 데코레이터 필수
- `ValidationPipe`를 글로벌로 등록 (`whitelist: true`, `forbidNonWhitelisted: true`)

### Entity 규칙
- PK: UUID (`@PrimaryGeneratedColumn('uuid')`)
- 날짜 필드: `timestamptz` (타임존 포함) 사용 권장
- `created_at`, `updated_at` 공통 컬럼 추가 (`@CreateDateColumn`, `@UpdateDateColumn`)

### API 응답 규칙
- 금액(amount): 원화 기준 `bigint` → 응답은 `number` (JavaScript safe integer 범위 내)
- 날짜: ISO 8601 형식 (`2026-04-07T00:00:00.000Z`)
- 목록 응답: 배열 직접 반환 (래퍼 객체 없음)
- 에러: NestJS 기본 HttpException 포맷 유지

---

## 환경변수 (.env)
```
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=finance_app

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d

# Billing Cycle (정산 기준일 — 미결)
# BILLING_DAY=25
```

---

## 보안 규칙
- 비밀번호: `bcrypt` 해싱 (saltRounds: 10)
- JWT Secret: `.env`에서만 관리, 코드 하드코딩 금지
- SQL Injection: TypeORM QueryBuilder 사용 시 파라미터 바인딩 필수
- 민감 정보: 응답에서 `password` 필드 제외 (`@Exclude()`)
