# Story 26.5: Audit Log Entity 및 API 연동

## 개요

| 항목 | 내용 |
|------|------|
| **Story ID** | 26.5 |
| **Epic** | EPIC-026 (System Audit Logs) |
| **제목** | Audit Log Entity 및 API 연동 |
| **예상 기간** | 0.5일 |
| **우선순위** | P2 |
| **상태** | 🔲 미시작 |
| **담당** | Frontend |
| **의존성** | Story 26.4 (Backend API) |
| **GitHub Issue** | [#28](https://github.com/imprun/imp-gateway/issues/28) |

## 목표

Audit Log 데이터를 조회하기 위한 TypeScript 타입, API 클라이언트, TanStack Query hooks를 구현한다.

## 구현 범위

### 파일 구조

```
web/src/entities/audit-log/
├── api/
│   └── audit-log-api.ts      # API 호출 + TanStack Query hooks
├── model/
│   └── types.ts              # AuditLog 타입 정의
├── lib/
│   └── constants.ts          # Action, Portal, ResourceType 상수
└── index.ts                  # Public exports
```

### 타입 정의 (`model/types.ts`)

```typescript
export interface AuditLog {
  id: string;

  // Tenant 정보
  tenant_id: string | null;
  tenant_name: string;

  // Actor 정보
  actor_id: string;
  actor_name: string;
  actor_email: string;
  actor_role: string;

  // Action 정보
  action: AuditAction;
  portal: Portal;

  // Resource 정보
  resource_type: ResourceType;
  resource_id: string;
  resource_name: string;

  // Request 정보
  ip_address: string;
  user_agent: string;
  request_method: string;
  request_path: string;

  // 변경 내용 (상세 조회 시에만)
  details?: AuditLogDetails;

  created_at: string;
}

export interface AuditLogDetails {
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  request?: Record<string, unknown>;
  response?: Record<string, unknown>;
}

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'DEPLOY'
  | 'PUBLISH'
  | 'WITHDRAW'
  | 'LOGIN'
  | 'LOGOUT'
  | 'APPROVE'
  | 'REJECT';

export type Portal = 'operator' | 'provider' | 'consumer' | 'admin';

export type ResourceType =
  | 'cluster'
  | 'agent'
  | 'api_service'
  | 'route'
  | 'backend'
  | 'policy'
  | 'product'
  | 'gateway'
  | 'plan'
  | 'product_publish'
  | 'customer'
  | 'subscription'
  | 'client_app'
  | 'consumer'
  | 'credential'
  | 'tenant'
  | 'user'
  | 'role';

export interface AuditLogFilter {
  portal?: Portal;
  action?: AuditAction;
  resource_type?: ResourceType;
  tenant_id?: string;
  actor_id?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogListResponse {
  data: AuditLog[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}
```

### 상수 정의 (`lib/constants.ts`)

```typescript
export const AUDIT_ACTIONS: { value: AuditAction; label: string }[] = [
  { value: 'CREATE', label: 'Create' },
  { value: 'UPDATE', label: 'Update' },
  { value: 'DELETE', label: 'Delete' },
  { value: 'DEPLOY', label: 'Deploy' },
  { value: 'PUBLISH', label: 'Publish' },
  { value: 'WITHDRAW', label: 'Withdraw' },
  { value: 'LOGIN', label: 'Login' },
  { value: 'LOGOUT', label: 'Logout' },
  { value: 'APPROVE', label: 'Approve' },
  { value: 'REJECT', label: 'Reject' },
];

export const PORTALS: { value: Portal; label: string }[] = [
  { value: 'operator', label: 'Operator' },
  { value: 'provider', label: 'Provider' },
  { value: 'consumer', label: 'Consumer' },
  { value: 'admin', label: 'Admin' },
];

export const RESOURCE_TYPES: { value: ResourceType; label: string }[] = [
  { value: 'cluster', label: 'Cluster' },
  { value: 'agent', label: 'Agent' },
  { value: 'api_service', label: 'API Service' },
  { value: 'route', label: 'Route' },
  { value: 'backend', label: 'Backend' },
  { value: 'policy', label: 'Policy' },
  { value: 'product', label: 'Product' },
  { value: 'gateway', label: 'Gateway' },
  { value: 'plan', label: 'Plan' },
  { value: 'product_publish', label: 'Product Publish' },
  { value: 'customer', label: 'Customer' },
  { value: 'subscription', label: 'Subscription' },
  { value: 'client_app', label: 'Client App' },
  { value: 'consumer', label: 'Consumer' },
  { value: 'credential', label: 'Credential' },
  { value: 'tenant', label: 'Tenant' },
  { value: 'user', label: 'User' },
  { value: 'role', label: 'Role' },
];
```

### API Hooks (`api/audit-log-api.ts`)

```typescript
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import type { AuditLog, AuditLogFilter, AuditLogListResponse } from '../model/types';

const AUDIT_LOG_KEYS = {
  all: ['audit-logs'] as const,
  list: (filter: AuditLogFilter) => [...AUDIT_LOG_KEYS.all, 'list', filter] as const,
  detail: (id: string) => [...AUDIT_LOG_KEYS.all, 'detail', id] as const,
};

export function useAuditLogs(filter: AuditLogFilter = {}) {
  return useQuery({
    queryKey: AUDIT_LOG_KEYS.list(filter),
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });

      const response = await apiClient.get<AuditLogListResponse>(
        `/api/v1/operator/audit-logs?${params.toString()}`
      );
      return response.data;
    },
  });
}

export function useAuditLog(id: string) {
  return useQuery({
    queryKey: AUDIT_LOG_KEYS.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<{ data: AuditLog }>(
        `/api/v1/operator/audit-logs/${id}`
      );
      return response.data.data;
    },
    enabled: !!id,
  });
}
```

### Public Exports (`index.ts`)

```typescript
// Types
export type {
  AuditLog,
  AuditLogDetails,
  AuditAction,
  Portal,
  ResourceType,
  AuditLogFilter,
  AuditLogListResponse,
} from './model/types';

// API Hooks
export { useAuditLogs, useAuditLog } from './api/audit-log-api';

// Constants
export { AUDIT_ACTIONS, PORTALS, RESOURCE_TYPES } from './lib/constants';
```

## 수용 기준

- [ ] `AuditLog` 인터페이스가 백엔드 응답과 일치해야 한다
- [ ] `useAuditLogs` 훅으로 필터링된 목록을 조회할 수 있어야 한다
- [ ] `useAuditLog` 훅으로 상세 정보를 조회할 수 있어야 한다
- [ ] TanStack Query 캐싱이 정상 동작해야 한다
- [ ] FSD 아키텍처를 준수하여 `entities/audit-log`에 위치해야 한다

## 참조

- [EPIC-026 FSD 구조](../../epics/EPIC-026-audit-logs.md#fsd-구조)
- [EPIC-026 데이터 모델 (TypeScript)](../../epics/EPIC-026-audit-logs.md#데이터-모델)
