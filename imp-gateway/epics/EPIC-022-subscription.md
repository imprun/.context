# EPIC-022: 구독 관리

## 개요

| 항목 | 내용 |
|------|------|
| **Epic ID** | EPIC-022 |
| **제목** | 구독 관리 |
| **우선순위** | P0 |
| **예상 기간** | 1주 |
| **상태** | 🔲 미시작 |
| **의존성** | EPIC-021 (API 카탈로그) |
| **GitHub Issue** | [#15](https://github.com/imprun/imp-gateway/issues/15) |

## 목표

Consumer가 API를 구독하고 구독 상태를 관리할 수 있다.

## 배경

구독(Subscription)은 Consumer와 ProductPublish 간의 관계를 나타낸다. Consumer는 카탈로그에서 원하는 Product의 Plan을 선택하여 구독 신청을 하고, 승인 후 API를 사용할 수 있다.

### 구독 상태 흐름
```
PENDING → APPROVED → ACTIVE
        ↘ REJECTED
ACTIVE → SUSPENDED → ACTIVE
       ↘ CANCELLED
```

### MVP 간소화
- 자동 승인 (approval_required=false인 경우)
- 수동 승인 워크플로우는 Post-MVP (EPIC-027)

## 범위

### 포함
- 구독 신청 (Plan 선택)
- 내 구독 목록 페이지
- 구독 상세 페이지
- 구독 상태 관리 (취소)
- 구독 승인 대기 표시

### 제외
- Provider 측 승인/거부 UI (EPIC-027)
- 구독 일시정지 (Post-MVP)
- 구독 업그레이드/다운그레이드 (Post-MVP)

## 기술 요구사항

### 백엔드 API

```
# Consumer용 구독 API
GET    /api/v1/consumer/subscriptions              # 내 구독 목록
POST   /api/v1/consumer/subscriptions              # 구독 신청
GET    /api/v1/consumer/subscriptions/:id          # 구독 상세
DELETE /api/v1/consumer/subscriptions/:id          # 구독 취소
```

### 데이터 모델

```typescript
type SubscriptionStatus =
  | 'pending'      // 승인 대기
  | 'approved'     // 승인됨 (아직 활성화 전)
  | 'active'       // 활성
  | 'suspended'    // 일시정지
  | 'cancelled'    // 취소됨
  | 'rejected';    // 거부됨

interface Subscription {
  id: string;
  customer_tenant_id: string;
  product_publish_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  auto_approved: boolean;
  started_at: string;
  ended_at?: string;
  billing_profile?: Record<string, any>;
  metadata?: Record<string, any>;
  approved_at?: string;
  approved_by?: string;
  rejected_at?: string;
  rejected_by?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;

  // Expanded relations
  product_publish?: CatalogItem;
  plan?: Plan;
}

interface CreateSubscriptionRequest {
  product_publish_id: string;
  plan_id: string;
}
```

### FSD 구조

```
web/src/
├── entities/subscription/
│   ├── index.ts
│   ├── model/
│   │   └── types.ts
│   ├── api/
│   │   └── subscription-api.ts
│   └── ui/
│       ├── subscription-card.tsx
│       └── subscription-status-badge.tsx
├── features/subscription/
│   ├── index.ts
│   ├── subscribe/
│   │   └── ui/
│   │       └── subscribe-form.tsx
│   └── cancel/
│       └── ui/
│           └── cancel-subscription-dialog.tsx
├── pages/consumer/
│   ├── subscriptions-page.tsx
│   └── subscription-detail-page.tsx
└── app/consumer/
    ├── subscriptions/
    │   ├── page.tsx
    │   └── [id]/
    │       └── page.tsx
```

## 스토리 분해

| Story | 제목 | 예상 | 우선순위 |
|-------|------|------|----------|
| 22.1 | Subscription 엔티티 및 API 훅 구현 | 0.5일 | P0 |
| 22.2 | 구독 신청 폼 구현 | 1일 | P0 |
| 22.3 | 내 구독 목록 페이지 구현 | 1일 | P0 |
| 22.4 | 구독 상세 페이지 구현 | 1일 | P0 |
| 22.5 | 구독 취소 기능 구현 | 0.5일 | P0 |
| 22.6 | 구독 상태 실시간 표시 | 1일| P1 |

## 수용 기준

### 기능 요구사항
- [ ] Product 상세에서 Plan을 선택하여 구독 신청할 수 있다
- [ ] 내 구독 목록을 조회할 수 있다
- [ ] 구독 상세 정보를 확인할 수 있다 (Product, Plan, 상태)
- [ ] 활성 구독을 취소할 수 있다
- [ ] 승인 대기 중인 구독의 상태를 확인할 수 있다
- [ ] 자동 승인 구독은 즉시 활성화된다

### 비기능 요구사항
- [ ] 구독 취소 시 확인 다이얼로그
- [ ] 상태별 색상 구분 (active=green, pending=yellow, cancelled=gray)
- [ ] 로딩/에러 상태 표시

## UI/UX 가이드

### 구독 신청 (Product 상세에서)
1. Plan 카드 클릭 또는 "Subscribe" 버튼
2. 확인 다이얼로그:
   - 선택한 Plan 정보 요약
   - 가격/제한 정보
   - "Confirm" / "Cancel" 버튼
3. 성공 시 내 구독 목록으로 이동

### 내 구독 목록 페이지
- 탭: All / Active / Pending / Cancelled
- 카드 목록:
  - Product 이름
  - Plan 이름
  - 상태 배지
  - 시작일
  - "View Details" 버튼

### 구독 상세 페이지
- 상단: 상태 배지 (큰 크기)
- Product 정보 섹션
- Plan 정보 섹션
- 구독 정보:
  - 시작일
  - 종료일 (있으면)
  - 승인일/승인자
- 액션: Cancel 버튼 (active 상태만)

## 참조

### 패턴 참조 파일
- `web/src/pages/operator/agent-detail-page.tsx` - 상세 페이지 패턴

### 백엔드 API
- `services/imprun-server/internal/api/v1/provider/subscriptions.go` (Consumer용 확장 필요)

---

## 변경 이력

| 날짜 | 버전 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 2025-01-XX | 1.0 | 초기 작성 | - |
