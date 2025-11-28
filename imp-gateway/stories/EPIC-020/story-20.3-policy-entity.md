# Story 20.3: Policy 엔티티 및 API 훅 구현

## 개요

| 항목 | 내용 |
|------|------|
| **Story ID** | 20.3 |
| **Epic** | EPIC-020 (Route & Policy 설정) |
| **우선순위** | P0 |
| **예상 공수** | 0.5일 |
| **상태** | 🔲 미시작 |
| **담당자** | - |

## 목표

Policy 엔티티를 FSD 구조에 맞게 구현하고, TanStack Query 기반 API 훅을 제공한다.

## 배경

Policy는 트래픽 정책(rate-limit, CORS, auth, timeout, retry 등)을 정의한다. Route 또는 Gateway에 적용할 수 있다.

## 요구사항

### 기능 요구사항

1. **타입 정의** (`entities/policy/model/types.ts`)
   - Policy 인터페이스 정의
   - PolicyType enum ('rate-limit' | 'cors' | 'auth' | 'timeout' | 'retry' | 'custom')
   - PolicyTargetKind ('HTTPRoute' | 'Gateway')
   - CreatePolicyRequest, UpdatePolicyRequest 타입

2. **API 훅** (`entities/policy/api/policy-api.ts`)
   - `usePolicies(apiServiceId)`: 특정 API Service의 Policy 목록 조회
   - `usePolicy(id)`: 단일 Policy 상세 조회
   - `useCreatePolicy()`: Policy 생성 뮤테이션
   - `useUpdatePolicy()`: Policy 수정 뮤테이션
   - `useDeletePolicy()`: Policy 삭제 뮤테이션

3. **UI 컴포넌트** (`entities/policy/ui/`)
   - PolicyTypeBadge: Policy 타입별 색상 뱃지
   - PolicyEnabledIndicator: 활성화 상태 표시

### 비기능 요구사항

- 기존 엔티티 패턴을 따를 것
- Policy spec은 JSON 형태로 저장됨
- 쿼리 키는 `['policies', apiServiceId]`, `['policy', id]` 형태 사용

## 기술 상세

### 백엔드 API 엔드포인트

```
GET    /api/v1/provider/api-services/:serviceId/policies
POST   /api/v1/provider/api-services/:serviceId/policies
GET    /api/v1/provider/policies/:id
PUT    /api/v1/provider/policies/:id
DELETE /api/v1/provider/policies/:id
```

### 데이터 모델 (백엔드 참조)

```
Policy {
  id: string
  api_service_id: string
  name: string
  type: 'rate-limit' | 'cors' | 'auth' | 'timeout' | 'retry' | 'custom'
  target_kind: 'HTTPRoute' | 'Gateway'
  target_ref: string
  spec: Record<string, any>  // Policy 타입별 JSON 설정
  version?: string
  enabled: boolean
  created_at: string
  updated_at: string
}
```

### Policy 타입별 spec 예시

```json
// rate-limit
{
  "requests_per_second": 100,
  "burst": 50
}

// cors
{
  "allowed_origins": ["*"],
  "allowed_methods": ["GET", "POST"],
  "allowed_headers": ["Content-Type"],
  "max_age": 3600
}

// timeout
{
  "request_timeout": "30s",
  "idle_timeout": "60s"
}
```

### FSD 구조

```
web/src/entities/policy/
├── model/
│   └── types.ts
├── api/
│   └── policy-api.ts
├── ui/
│   ├── policy-type-badge.tsx
│   └── policy-enabled-indicator.tsx
└── index.ts
```

## 수용 기준

- [ ] Policy 타입 및 관련 타입이 정의되어 있다
- [ ] 목록 조회 훅이 동작한다
- [ ] CRUD 뮤테이션이 동작한다
- [ ] 쿼리 무효화가 올바르게 처리된다
- [ ] UI 컴포넌트가 렌더링된다

## 참조

- 패턴 참조: `web/src/entities/service/`
- 백엔드 API: `services/imprun-server/internal/api/v1/provider/policies.go`
- 모델: `services/imprun-server/internal/data/models/models.go` (Policy 구조체)
