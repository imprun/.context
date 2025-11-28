# Story 20.1: Route 엔티티 및 API 훅 구현

## 개요

| 항목 | 내용 |
|------|------|
| **Story ID** | 20.1 |
| **Epic** | EPIC-020 (Route & Policy 설정) |
| **우선순위** | P0 |
| **예상 공수** | 0.5일 |
| **상태** | 🔲 미시작 |
| **담당자** | - |

## 목표

Route 엔티티를 FSD 구조에 맞게 구현하고, TanStack Query 기반 API 훅을 제공한다.

## 배경

Route는 API Service 내에서 요청 경로 매칭 규칙을 정의한다. Backend와 연결되어 실제 트래픽 라우팅에 사용된다.

## 요구사항

### 기능 요구사항

1. **타입 정의** (`entities/route/model/types.ts`)
   - Route 인터페이스 정의
   - RouteStatus 타입 정의
   - CreateRouteRequest, UpdateRouteRequest 타입

2. **API 훅** (`entities/route/api/route-api.ts`)
   - `useRoutes(apiServiceId)`: 특정 API Service의 Route 목록 조회
   - `useRoute(id)`: 단일 Route 상세 조회
   - `useCreateRoute()`: Route 생성 뮤테이션
   - `useUpdateRoute()`: Route 수정 뮤테이션
   - `useDeleteRoute()`: Route 삭제 뮤테이션

3. **UI 컴포넌트** (`entities/route/ui/`)
   - RouteStatusBadge: Route 상태 표시 뱃지

### 비기능 요구사항

- 기존 service/cluster 엔티티 패턴을 따를 것
- 쿼리 키는 `['routes', apiServiceId]`, `['route', id]` 형태 사용
- 뮤테이션 성공 시 관련 쿼리 무효화

## 기술 상세

### 백엔드 API 엔드포인트

```
GET    /api/v1/provider/api-services/:serviceId/routes
POST   /api/v1/provider/api-services/:serviceId/routes
GET    /api/v1/provider/routes/:id
PUT    /api/v1/provider/routes/:id
DELETE /api/v1/provider/routes/:id
```

### 데이터 모델 (백엔드 참조)

```
Route {
  id: string
  api_service_id: string
  name: string
  hostnames?: string[]
  path_prefix?: string
  path_regex?: string
  methods?: string[]
  backend_id?: string
  priority: number
  tags?: Record<string, string>
  status: string
  spec?: Record<string, any>
  created_at: string
  updated_at: string
}
```

### FSD 구조

```
web/src/entities/route/
├── model/
│   └── types.ts
├── api/
│   └── route-api.ts
├── ui/
│   └── route-status-badge.tsx
└── index.ts
```

## 수용 기준

- [ ] Route 타입이 정의되어 있다
- [ ] 목록 조회 훅이 동작한다
- [ ] CRUD 뮤테이션이 동작한다
- [ ] 쿼리 무효화가 올바르게 처리된다
- [ ] RouteStatusBadge 컴포넌트가 렌더링된다

## 참조

- 패턴 참조: `web/src/entities/service/`
- 백엔드 API: `services/imprun-server/internal/api/v1/provider/routes.go`
- 모델: `services/imprun-server/internal/data/models/models.go` (Route 구조체)
