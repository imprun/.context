# STORY-18.1: Gateway Entity & API Implementation

## 1. Overview
**Epic**: EPIC-018 Gateway Template Management
**Title**: Gateway Entity and API Hooks Implementation
**Assignee**: AI Agent
**Status**: 🔲 Not Started
**Estimate**: 0.5 day

## 2. Purpose
Implement type definitions for Gateway template data and TanStack Query hooks for backend API communication.

## 3. Backend API (✅ Completed)
**Path**: `services/imprun-server/internal/api/v1/provider/gateways.go`

Implemented API endpoints:
```
POST   /api/v1/provider/gateways          # Create
GET    /api/v1/provider/gateways          # List
GET    /api/v1/provider/gateways/:id      # Get
PUT    /api/v1/provider/gateways/:id      # Update
DELETE /api/v1/provider/gateways/:id      # Delete
```

## 4. Implementation Details

### 4.1. Directory Structure
```
web/src/entities/gateway/
├── index.ts
├── model/
│   └── types.ts
├── api/
│   └── gateway-api.ts
└── ui/
    ├── gateway-status-badge.tsx
    └── listener-summary.tsx
```

### 4.2. Type Definitions
**Path**: `web/src/entities/gateway/model/types.ts`

```typescript
// Gateway Status
export type GatewayStatus = "active" | "inactive";

// Gateway Protocol
export type GatewayProtocol = "HTTP" | "HTTPS" | "TCP" | "TLS";

// Gateway Listener
export interface GatewayListener {
  name: string;
  port: number;
  protocol: GatewayProtocol;
  hostname?: string;
  tls?: Record<string, unknown>;  // MVP: simplified, detailed in Post-MVP
  allowedRoutes?: Record<string, unknown>;
}

// Gateway Entity
export interface Gateway {
  id: string;
  tenant_id: string;
  name: string;
  gateway_class: string;  // default: "envoy-gateway"
  listeners: GatewayListener[];
  labels?: Record<string, string>;
  status: GatewayStatus;
  created_at: string;
  updated_at: string;
}

// List Response (wrapped in ApiResponse.data)
export interface GatewayListResponse {
  gateways: Gateway[];
}

// Single Response (wrapped in ApiResponse.data)
export interface GatewayResponse {
  gateway: Gateway;
}

// List Params
export interface GatewayListParams {
  status?: GatewayStatus;
  search?: string;
  limit?: number;
  offset?: number;
}

// Create Request
export interface CreateGatewayRequest {
  name: string;
  gateway_class?: string;
  listeners: GatewayListener[];
  labels?: Record<string, string>;
  status?: GatewayStatus;
}

// Update Request
export interface UpdateGatewayRequest {
  name?: string;
  gateway_class?: string;
  listeners?: GatewayListener[];
  labels?: Record<string, string>;
  status?: GatewayStatus;
}
```

### 4.3. API Hooks
**Path**: `web/src/entities/gateway/api/gateway-api.ts`

```typescript
/**
 * Gateway API Client
 * EPIC-018: Gateway Template Management
 *
 * TanStack Query hooks for Gateway API
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/client";
import type { ApiResponse } from "@/shared/api/types";
import type {
  Gateway,
  GatewayListResponse,
  GatewayResponse,
  GatewayListParams,
  CreateGatewayRequest,
  UpdateGatewayRequest,
} from "../model/types";

// Query Keys
export const gatewayKeys = {
  all: ["gateways"] as const,
  lists: () => [...gatewayKeys.all, "list"] as const,
  list: (params: GatewayListParams) => [...gatewayKeys.lists(), params] as const,
  details: () => [...gatewayKeys.all, "detail"] as const,
  detail: (id: string) => [...gatewayKeys.details(), id] as const,
};

// API Functions
async function fetchGateways(params: GatewayListParams): Promise<GatewayListResponse> {
  const { data } = await apiClient.get<ApiResponse<GatewayListResponse>>(
    "/provider/gateways",
    {
      params: {
        status: params.status,
        search: params.search,
        limit: params.limit ?? 20,
        offset: params.offset ?? 0,
      },
    }
  );
  return data.data;
}

async function fetchGateway(id: string): Promise<Gateway> {
  const { data } = await apiClient.get<ApiResponse<GatewayResponse>>(
    `/provider/gateways/${id}`
  );
  return data.data.gateway;
}

async function createGateway(request: CreateGatewayRequest): Promise<Gateway> {
  const { data } = await apiClient.post<ApiResponse<GatewayResponse>>(
    "/provider/gateways",
    request
  );
  return data.data.gateway;
}

async function updateGateway(
  id: string,
  request: UpdateGatewayRequest
): Promise<Gateway> {
  const { data } = await apiClient.put<ApiResponse<GatewayResponse>>(
    `/provider/gateways/${id}`,
    request
  );
  return data.data.gateway;
}

async function deleteGateway(id: string): Promise<void> {
  await apiClient.delete<ApiResponse<void>>(`/provider/gateways/${id}`);
}

// Query Hooks
export function useGateways(params: GatewayListParams = {}) {
  return useQuery({
    queryKey: gatewayKeys.list(params),
    queryFn: () => fetchGateways(params),
  });
}

export function useGateway(id: string) {
  return useQuery({
    queryKey: gatewayKeys.detail(id),
    queryFn: () => fetchGateway(id),
    enabled: !!id,
  });
}

// Mutation Hooks
export function useCreateGateway() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGateway,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gatewayKeys.lists() });
    },
  });
}

export function useUpdateGateway() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...request }: UpdateGatewayRequest & { id: string }) =>
      updateGateway(id, request),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: gatewayKeys.lists() });
      queryClient.setQueryData(gatewayKeys.detail(variables.id), data);
    },
  });
}

export function useDeleteGateway() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteGateway,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gatewayKeys.lists() });
    },
  });
}
```

### 4.4. UI Components

#### GatewayStatusBadge
**Path**: `web/src/entities/gateway/ui/gateway-status-badge.tsx`

```tsx
import { Badge } from "@/shared/components/ui/badge";
import type { GatewayStatus } from "../model/types";

interface GatewayStatusBadgeProps {
  status: GatewayStatus;
}

export function GatewayStatusBadge({ status }: GatewayStatusBadgeProps) {
  const variants: Record<GatewayStatus, { label: string; className: string }> = {
    active: {
      label: "Active",
      className: "bg-green-500/10 text-green-600 border-green-500/20",
    },
    inactive: {
      label: "Inactive",
      className: "bg-gray-500/10 text-gray-600 border-gray-500/20",
    },
  };

  const { label, className } = variants[status];

  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}
```

#### ListenerSummary
**Path**: `web/src/entities/gateway/ui/listener-summary.tsx`

```tsx
import type { GatewayListener } from "../model/types";

interface ListenerSummaryProps {
  listeners: GatewayListener[];
}

/**
 * Compact display for table cells: "80/HTTP, 443/HTTPS"
 */
export function ListenerSummary({ listeners }: ListenerSummaryProps) {
  if (!listeners || listeners.length === 0) {
    return <span className="text-muted-foreground">-</span>;
  }

  return (
    <span className="text-sm text-muted-foreground">
      {listeners.map((l) => `${l.port}/${l.protocol}`).join(", ")}
    </span>
  );
}
```

### 4.5. Export
**Path**: `web/src/entities/gateway/index.ts`

```typescript
// Types
export type {
  Gateway,
  GatewayStatus,
  GatewayProtocol,
  GatewayListener,
  GatewayListParams,
  GatewayListResponse,
  GatewayResponse,
  CreateGatewayRequest,
  UpdateGatewayRequest,
} from "./model/types";

// API Hooks
export {
  gatewayKeys,
  useGateways,
  useGateway,
  useCreateGateway,
  useUpdateGateway,
  useDeleteGateway,
} from "./api/gateway-api";

// UI Components
export { GatewayStatusBadge } from "./ui/gateway-status-badge";
export { ListenerSummary } from "./ui/listener-summary";
```

## 5. Acceptance Criteria
- [ ] `Gateway` type matches backend API response structure
- [ ] `GatewayListener` type supports protocols (HTTP/HTTPS/TCP/TLS)
- [ ] `useGateways` hook fetches list data correctly
- [ ] `useGateway` hook fetches detail data correctly
- [ ] Mutation hooks handle cache invalidation properly
- [ ] `useUpdateGateway` uses `setQueryData` for optimistic update
- [ ] API errors are handled appropriately
- [ ] `ListenerSummary` component displays compact format

## 6. Reference Files
- `web/src/entities/service/api/service-api.ts` - API pattern reference
- `web/src/entities/cluster/api/cluster-api.ts` - API pattern reference
- `web/src/shared/api/types.ts` - ApiResponse type
- `services/imprun-server/internal/api/v1/provider/gateways.go` - Backend API

## 7. Notes
- Gateway is an Envoy Gateway-based config template; actual deployment happens in ProductPublish
- Listeners are stored as JSON array in backend, parsed as array in frontend
- TLS detailed config is Post-MVP; use `Record<string, unknown>` for now
