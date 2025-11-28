# EPIC-023: ClientApp 관리

## 개요

| 항목 | 내용 |
|------|------|
| **Epic ID** | EPIC-023 |
| **제목** | ClientApp 관리 |
| **우선순위** | P0 |
| **예상 기간** | 1주 |
| **상태** | 🔲 미시작 |
| **의존성** | EPIC-022 (구독) |
| **GitHub Issue** | [#16](https://github.com/imprun/imp-gateway/issues/16) |

## 목표

Consumer가 애플리케이션(ClientApp)을 등록하고 관리할 수 있다.

## 배경

ClientApp은 Consumer가 API를 호출하는 실제 애플리케이션을 나타낸다. Consumer는 하나 이상의 ClientApp을 등록할 수 있으며, 각 ClientApp은 자체 Credential(API Key 또는 OAuth Client)을 가진다.

### 핵심 개념
- **ClientApp**: Consumer의 애플리케이션 등록 정보
- **Consumer**: ClientApp과 구독의 연결 (ClientApp + Subscription = Consumer)
- **Callback URLs**: OAuth2 인증 시 리다이렉트 URL
- **Allowed Origins**: CORS 허용 도메인

### 관계 구조
```
CustomerTenant
  └── ClientApp (여러 개)
        └── Consumer (여러 개, Subscription 연결)
              └── Credential (API Key / OAuth Client)
```

## 범위

### 포함
- ClientApp CRUD (생성, 조회, 수정, 삭제)
- ClientApp 목록 페이지
- ClientApp 상세 페이지
- Callback URL 관리
- Allowed Origins 관리
- ClientApp별 구독 연결 표시

### 제외
- OAuth2 Client 발급 (MVP는 API Key만)
- ClientApp 권한 세분화 (Post-MVP)

## 기술 요구사항

### 백엔드 API

```
GET    /api/v1/consumer/apps              # ClientApp 목록
POST   /api/v1/consumer/apps              # ClientApp 생성
GET    /api/v1/consumer/apps/:id          # ClientApp 상세
PUT    /api/v1/consumer/apps/:id          # ClientApp 수정
DELETE /api/v1/consumer/apps/:id          # ClientApp 삭제

# Consumer (ClientApp-Subscription 연결)
GET    /api/v1/consumer/apps/:id/consumers          # 앱의 Consumer 목록
POST   /api/v1/consumer/apps/:id/consumers          # Consumer 생성 (구독 연결)
DELETE /api/v1/consumer/apps/:id/consumers/:cid     # Consumer 연결 해제
```

### 데이터 모델

```typescript
interface ClientApp {
  id: string;
  customer_tenant_id: string;
  name: string;
  description?: string;
  callback_urls?: string[];
  allowed_origins?: string[];
  status: 'active' | 'inactive';
  labels?: Record<string, string>;
  created_at: string;
  updated_at: string;
}

interface Consumer {
  id: string;
  client_app_id: string;
  subscription_id: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;

  // Expanded
  subscription?: Subscription;
}

interface CreateClientAppRequest {
  name: string;
  description?: string;
  callback_urls?: string[];
  allowed_origins?: string[];
}

interface CreateConsumerRequest {
  subscription_id: string;
}
```

### FSD 구조

```
web/src/
├── entities/client-app/
│   ├── index.ts
│   ├── model/
│   │   └── types.ts
│   ├── api/
│   │   └── client-app-api.ts
│   └── ui/
│       ├── client-app-card.tsx
│       └── client-app-status-badge.tsx
├── entities/consumer/
│   ├── model/types.ts
│   ├── api/consumer-api.ts
│   └── ui/consumer-row.tsx
├── features/client-app/
│   ├── index.ts
│   ├── create/
│   │   └── ui/
│   │       └── create-client-app-form.tsx
│   ├── update/
│   │   └── ui/
│   │       └── update-client-app-form.tsx
│   ├── delete/
│   │   └── ui/
│   │       └── delete-client-app-dialog.tsx
│   └── connect-subscription/
│       └── ui/
│           └── connect-subscription-dialog.tsx
├── pages/consumer/
│   ├── apps-page.tsx
│   └── app-detail-page.tsx
└── app/consumer/
    ├── apps/
    │   ├── page.tsx
    │   └── [id]/
    │       └── page.tsx
```

## 스토리 분해

| Story | 제목 | 예상 | 우선순위 |
|-------|------|------|----------|
| 23.1 | ClientApp 엔티티 및 API 훅 구현 | 0.5일 | P0 |
| 23.2 | Consumer 엔티티 및 API 훅 구현 | 0.5일 | P0 |
| 23.3 | ClientApp 목록 페이지 구현 | 1일 | P0 |
| 23.4 | ClientApp 생성 폼 구현 | 1일 | P0 |
| 23.5 | ClientApp 상세 페이지 구현 | 1일| P0 |
| 23.6 | ClientApp에 구독 연결 기능 | 1일| P0 |

## 수용 기준

### 기능 요구사항
- [ ] ClientApp 목록을 조회할 수 있다
- [ ] 새 ClientApp을 생성할 수 있다
- [ ] ClientApp 상세 정보를 확인할 수 있다
- [ ] ClientApp을 수정할 수 있다
- [ ] ClientApp을 삭제할 수 있다
- [ ] ClientApp에 활성 구독을 연결할 수 있다
- [ ] ClientApp별 연결된 구독 목록을 확인할 수 있다
- [ ] ClientApp과 구독의 연결을 해제할 수 있다

### 비기능 요구사항
- [ ] URL 형식 유효성 검증 (callback_urls, allowed_origins)
- [ ] 삭제 시 연결된 Consumer 경고
- [ ] 로딩/에러 상태 표시

## UI/UX 가이드

### ClientApp 목록 페이지
- 카드 목록
  - 앱 이름
  - 설명 (truncated)
  - 상태 배지
  - 연결된 구독 수
  - "View Details" 버튼

### ClientApp 상세 페이지
- 기본 정보 섹션
  - 이름, 설명
  - Callback URLs 목록
  - Allowed Origins 목록
- 연결된 구독 섹션
  - Consumer 목록 테이블
  - "Connect Subscription" 버튼
  - 각 행에 "Disconnect" 버튼
- Credentials 섹션
  - "Go to Credentials" 링크 (EPIC-024)
- 액션: Edit, Delete

### ClientApp 생성/수정 폼
- 이름 (필수)
- 설명
- Callback URLs (동적 목록)
  - URL 입력 필드
  - 추가/삭제 버튼
- Allowed Origins (동적 목록)
  - Origin 입력 필드
  - 추가/삭제 버튼

### 구독 연결 다이얼로그
- 활성 구독 목록 (아직 연결 안 된 것만)
- Product/Plan 정보 표시
- 선택 및 "Connect" 버튼

## 참조

### 패턴 참조 파일
- `web/src/features/gateway/create/` - 동적 목록 폼 패턴
- `web/src/pages/operator/agent-detail-page.tsx` - 상세 페이지 패턴

### 백엔드 모델
- `services/imprun-server/internal/data/models/models.go` - ClientApp, Consumer

---

## 변경 이력

| 날짜 | 버전 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 2025-01-XX | 1.0 | 초기 작성 | - |
