# Story 20.2: Backend 엔티티 및 API 훅 구현

## 개요

| 항목 | 내용 |
|------|------|
| **Story ID** | 20.2 |
| **Epic** | EPIC-020 (Route & Policy 설정) |
| **우선순위** | P0 |
| **예상 공수** | 0.5일 |
| **상태** | 🔲 미시작 |
| **담당자** | - |

## 목표

Backend 엔티티를 FSD 구조에 맞게 구현하고, TanStack Query 기반 API 훅을 제공한다.

## 배경

Backend는 실제 upstream 서버 정보를 정의한다. Route가 Backend를 참조하여 트래픽을 전달한다.

## 요구사항

### 기능 요구사항

1. **타입 정의** (`entities/backend/model/types.ts`)
   - Backend 인터페이스 정의
   - BackendEndpoint 타입 (host, port)
   - BackendScheme 타입 (http/https/grpc)
   - CreateBackendRequest, UpdateBackendRequest 타입

2. **API 훅** (`entities/backend/api/backend-api.ts`)
   - `useBackends(apiServiceId)`: 특정 API Service의 Backend 목록 조회
   - `useBackend(id)`: 단일 Backend 상세 조회
   - `useCreateBackend()`: Backend 생성 뮤테이션
   - `useUpdateBackend()`: Backend 수정 뮤테이션
   - `useDeleteBackend()`: Backend 삭제 뮤테이션

3. **UI 컴포넌트** (`entities/backend/ui/`)
   - BackendStatusBadge: Backend 상태 표시 뱃지
   - BackendSchemeTag: Scheme (http/https/grpc) 표시 태그

### 비기능 요구사항

- 기존 엔티티 패턴을 따를 것
- 쿼리 키는 `['backends', apiServiceId]`, `['backend', id]` 형태 사용

## 기술 상세

### 백엔드 API 엔드포인트

```
GET    /api/v1/provider/api-services/:serviceId/backends
POST   /api/v1/provider/api-services/:serviceId/backends
GET    /api/v1/provider/backends/:id
PUT    /api/v1/provider/backends/:id
DELETE /api/v1/provider/backends/:id
```

### 데이터 모델 (백엔드 참조)

```
Backend {
  id: string
  api_service_id: string
  name: string
  scheme: 'http' | 'https' | 'grpc'
  endpoints: BackendEndpoint[]  // JSON array
  lb_policy?: string
  timeout_ms?: number
  retry_policy?: object
  health_check?: object
  tls?: object
  status: string
  created_at: string
  updated_at: string
}

BackendEndpoint {
  host: string
  port: number
}
```

### FSD 구조

```
web/src/entities/backend/
├── model/
│   └── types.ts
├── api/
│   └── backend-api.ts
├── ui/
│   ├── backend-status-badge.tsx
│   └── backend-scheme-tag.tsx
└── index.ts
```

## 수용 기준

- [ ] Backend 및 BackendEndpoint 타입이 정의되어 있다
- [ ] 목록 조회 훅이 동작한다
- [ ] CRUD 뮤테이션이 동작한다
- [ ] 쿼리 무효화가 올바르게 처리된다
- [ ] UI 컴포넌트가 렌더링된다

## 참조

- 패턴 참조: `web/src/entities/service/`
- 백엔드 API: `services/imprun-server/internal/api/v1/provider/backends.go`
- 모델: `services/imprun-server/internal/data/models/models.go` (Backend 구조체)
