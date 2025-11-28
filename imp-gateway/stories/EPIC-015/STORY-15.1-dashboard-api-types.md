# STORY-15.1: Dashboard API & Types

## 1. 개요
**Epic**: EPIC-015 Fleet Dashboard
**제목**: Dashboard API 및 타입 정의
**담당자**: AI Agent
**상태**: ✅ 완료

## 2. 목적
Fleet Dashboard에 필요한 통계 데이터를 제공하는 백엔드 API와 프론트엔드 타입/훅을 구현한다.

## 3. 현재 상태 (✅ 완료)

### 3.1. 백엔드 API
**Path**: `services/imprun-server/internal/api/v1/operator/dashboard.go`

구현된 엔드포인트:
```
GET /api/v1/operator/dashboard/stats
```

응답 데이터:
```go
type OperatorDashboardStats struct {
    TotalClusters      int64            `json:"total_clusters"`
    ActiveClusters     int64            `json:"active_clusters"`
    TotalAgents        int64            `json:"total_agents"`
    ConnectedAgents    int64            `json:"connected_agents"`
    DisconnectedAgents int64            `json:"disconnected_agents"`
    RecentEvents       []AgentEventInfo `json:"recent_events"`
}
```

### 3.2. 프론트엔드 타입
**Path**: `web/src/entities/dashboard/model/types.ts`

```typescript
interface DashboardAgentEvent {
  id: string;
  agent_id: string;
  type: string;
  timestamp: string;
  ip_address?: string;
}

interface OperatorDashboardStats {
  total_clusters: number;
  active_clusters: number;
  total_agents: number;
  connected_agents: number;
  disconnected_agents: number;
  recent_events: DashboardAgentEvent[];
}
```

### 3.3. API 훅
**Path**: `web/src/entities/dashboard/api/dashboard-api.ts`

```typescript
export function useOperatorDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.operatorStats(),
    queryFn: fetchOperatorStats,
    refetchInterval: 60000, // 60초 자동 새로고침
  });
}
```

## 4. EPIC 설계 대비 차이점

| 항목 | EPIC 설계 | 현재 구현 | 비고 |
|------|----------|----------|------|
| Entity 이름 | `fleet-dashboard` | `dashboard` | 현재 operator만 있으므로 OK |
| API 경로 | `/dashboard/summary` | `/dashboard/stats` | 동일 기능 |
| 타입명 | `FleetSummary` | `OperatorDashboardStats` | 현재 구현이 더 명확 |
| 이벤트 API | `/dashboard/events` | stats에 포함 | 간소화된 구조 |

## 5. 수용 기준
- [x] Dashboard API가 클러스터/에이전트 통계를 반환한다.
- [x] 최근 이벤트 목록이 포함된다.
- [x] `useOperatorDashboardStats` 훅이 데이터를 조회한다.
- [x] 60초 간격으로 자동 새로고침된다.

## 6. 참조 파일
- `services/imprun-server/internal/api/v1/operator/dashboard.go`
- `web/src/entities/dashboard/model/types.ts`
- `web/src/entities/dashboard/api/dashboard-api.ts`
- `web/src/entities/dashboard/index.ts`

## 7. 비고
이 스토리는 기존 EPIC-003 Story 2.3 작업에서 완료됨.
EPIC-015로 별도 문서화하여 Fleet Dashboard 기능을 명확히 추적.
