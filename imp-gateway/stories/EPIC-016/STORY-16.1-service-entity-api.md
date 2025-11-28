# STORY-16.1: API Service Entity & API Implementation

## 1. 개요
**Epic**: EPIC-016 API Service 관리
**제목**: API Service 엔티티 및 API 훅 구현
**담당자**: AI Agent
**상태**: 🔲 미시작

## 2. 목적
프론트엔드에서 API Service 데이터를 다루기 위한 타입 정의와 백엔드 API 통신을 위한 TanStack Query 훅을 구현한다.

## 3. 백엔드 API (✅ 완료)
**Path**: `services/imprun-server/internal/api/v1/provider/apiservices.go`

구현된 API 엔드포인트:
```
POST   /api/v1/provider/api-services          # 생성
GET    /api/v1/provider/api-services          # 목록 조회
GET    /api/v1/provider/api-services/:id      # 상세 조회
PUT    /api/v1/provider/api-services/:id      # 수정
DELETE /api/v1/provider/api-services/:id      # 삭제
```

## 4. 구현 상세

### 4.1. 디렉토리 구조
```
web/src/entities/service/
├── index.ts
├── model/
│   └── types.ts
├── api/
│   └── service-api.ts
└── ui/
    ├── service-status-badge.tsx
    └── service-card.tsx
```

### 4.2. 타입 정의
**Path**: `web/src/entities/service/model/types.ts`

```typescript
// API Service Status
export type ServiceStatus = 'active' | 'inactive';

// API Service Entity
export interface APIService {
  id: string;
  tenant_id: string;
  name: string;
  version?: string;
  description?: string;
  labels?: Record<string, string>;
  status: ServiceStatus;
  created_at: string;
  updated_at: string;
}

// List Response
export interface APIServiceListResponse {
  api_services: APIService[];
}

// Single Response
export interface APIServiceResponse {
  api_service: APIService;
}

// List Params
export interface APIServiceListParams {
  status?: ServiceStatus;
  search?: string;
  limit?: number;
  offset?: number;
}

// Create Request
export interface CreateAPIServiceRequest {
  name: string;
  version?: string;
  description?: string;
  labels?: Record<string, string>;
  status?: ServiceStatus;
}

// Update Request
export interface UpdateAPIServiceRequest {
  name?: string;
  version?: string;
  description?: string;
  labels?: Record<string, string>;
  status?: ServiceStatus;
}
```

### 4.3. API 훅
**Path**: `web/src/entities/service/api/service-api.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/client";

// Query Keys
export const serviceKeys = {
  all: ["services"] as const,
  lists: () => [...serviceKeys.all, "list"] as const,
  list: (params: APIServiceListParams) => [...serviceKeys.lists(), params] as const,
  details: () => [...serviceKeys.all, "detail"] as const,
  detail: (id: string) => [...serviceKeys.details(), id] as const,
};

// Query Hooks
export function useServices(params: APIServiceListParams = {}) {
  return useQuery({
    queryKey: serviceKeys.list(params),
    queryFn: () => fetchServices(params),
  });
}

export function useService(id: string) {
  return useQuery({
    queryKey: serviceKeys.detail(id),
    queryFn: () => fetchService(id),
    enabled: !!id,
  });
}

// Mutation Hooks
export function useCreateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateAPIServiceRequest & { id: string }) =>
      updateService(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: serviceKeys.detail(variables.id) });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
    },
  });
}
```

### 4.4. UI 컴포넌트

#### ServiceStatusBadge
```tsx
// web/src/entities/service/ui/service-status-badge.tsx
interface ServiceStatusBadgeProps {
  status: ServiceStatus;
}

export function ServiceStatusBadge({ status }: ServiceStatusBadgeProps) {
  const variants = {
    active: { label: "Active", className: "bg-green-500/10 text-green-600" },
    inactive: { label: "Inactive", className: "bg-gray-500/10 text-gray-600" },
  };
  // ...
}
```

### 4.5. Export
**Path**: `web/src/entities/service/index.ts`

```typescript
// Types
export type { APIService, ServiceStatus, APIServiceListParams } from "./model/types";

// API Hooks
export {
  serviceKeys,
  useServices,
  useService,
  useCreateService,
  useUpdateService,
  useDeleteService,
} from "./api/service-api";

// UI Components
export { ServiceStatusBadge } from "./ui/service-status-badge";
```

## 5. 수용 기준
- [ ] `APIService` 타입이 백엔드 API 응답과 일치해야 한다.
- [ ] `useServices` 훅이 목록 데이터를 정상적으로 가져와야 한다.
- [ ] `useService` 훅이 상세 데이터를 정상적으로 가져와야 한다.
- [ ] Mutation 훅들이 캐시 무효화를 올바르게 처리해야 한다.
- [ ] API 에러 발생 시 적절한 에러 처리가 가능해야 한다.

## 6. 참조 파일
- `web/src/entities/cluster/` - 엔티티 구조 패턴 참조
- `services/imprun-server/internal/api/v1/provider/apiservices.go` - 백엔드 API

## 7. 비고
- v2 아키텍처에서 `gateway_id`가 제거됨 → API Service는 독립적인 청사진
- Labels는 `Record<string, string>` 형태로 처리 (JSON)
