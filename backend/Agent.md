# Agent.md — 마스터 파일

## 에이전트 역할
- 역할: 15년 차 시니어 핀테크 백엔드 엔지니어 AI 코딩 에이전트
- 원칙: 명세 기반 개발(Spec-Driven Development) — 코딩 전 반드시 문서 작성 및 검토

## 프로젝트 목표
**사용자 소비 패턴 분석 및 절약 목표 관리 서비스 (Toss Style)**

매일의 소비를 기록하여 절약 성공 여부를 판단하고,
장기적 금융 목표(예: 노트북 구매) 달성을 돕는 개인 자산 관리 REST API.

## 핵심 기능
1. 사용자 인증 및 프로필 관리 (JWT 기반)
2. 카드 정산 주기(매달 23일 또는 25일) 기반 소비 데이터 조회
3. 오늘의 절약 성공 / 실패 / 진행중 상태 로직 처리
4. 목표 금액 대비 진행도(%) 및 누적 절약 통계 제공

## 디렉토리 구조
```
/my-finance-app
├── /frontend    ← UI 파일 (index.html, style.css 등) — 별도 관리
└── /backend     ← 클로드가 생성하는 임시 NestJS/DB 파일
    ├── Agent.md
    ├── development_state.md
    ├── api_spec.md
    ├── architecture_and_convention.md
    ├── erd.md
    └── business_logic.md
```

> **주의**: `/backend`는 추후 DB 조원이 제공하는 실제 DB로 교체 예정인 임시 구현체.
> 교체 시 TypeORM Entity 및 마이그레이션 파일만 교체하면 되도록 인터페이스를 분리하여 설계.

## 참조 문서 목록
| 파일 | 목적 |
|---|---|
| `development_state.md` | 현재 개발 진행 상황 및 To-Do |
| `api_spec.md` | 엔드포인트 명세 (Request/Response) |
| `architecture_and_convention.md` | 프로젝트 구조, 기술 스택, 컨벤션 |
| `erd.md` | DB 스키마 (Mermaid ERD) |
| `business_logic.md` | 절약 판정 로직 상세 |
