# STORY-14.4: Cluster Detail Agent List Section

## 1. 개요
**Epic**: EPIC-014 Agent 관리
**제목**: Cluster 상세 내 Agent 목록 표시
**담당자**: AI Agent
**상태**: 🔄 리팩토링 필요

## 2. 목적
Cluster 상세 페이지에 해당 클러스터에 연결된 Agent 목록 섹션을 추가하여, Agent 관리를 클러스터 컨텍스트에서 수행할 수 있도록 한다.

## 3. 현재 상태 vs EPIC 설계

### 현재 구현
- **Agent 목록**: 독립 페이지 (`/operator/agents`)
- **Cluster 상세**: Agent 섹션 없음
- **파일**: `web/src/pages/operator/agents-page.tsx` (독립)

### EPIC 설계 (목표)
- **Agent 목록**: Cluster 상세 페이지 내 섹션
- **Cluster 상세**: "연결된 Agents" 섹션 포함
- **UX**: Cluster → Agent 자연스러운 계층 구조

## 4. 구현 상세

### 4.1. Widget 컴포넌트 생성
**Path**: `web/src/widgets/operator/cluster-agent-list.tsx`

```tsx
interface ClusterAgentListProps {
  clusterId: string;
  clusterName: string;
}

export function ClusterAgentList({
  clusterId,
  clusterName,
}: ClusterAgentListProps) {
  const { data, isLoading } = useAgentsByCluster(clusterId);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Agent | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>연결된 Agents ({data?.length ?? 0})</CardTitle>
        <Button onClick={() => setShowRegisterDialog(true)}>
          Agent 등록
        </Button>
      </CardHeader>
      <CardContent>
        {/* Agent list items */}
      </CardContent>

      <RegisterAgentDialog
        clusterId={clusterId}
        clusterName={clusterName}
        open={showRegisterDialog}
        onOpenChange={setShowRegisterDialog}
      />

      <DeleteAgentDialog
        agent={deleteTarget}
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      />
    </Card>
  );
}
```

### 4.2. UI 레이아웃
```
┌─ 연결된 Agents (3) ──────────────────────────────────── [ Agent 등록 ] ─┐
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ ● agent-prod-01                                           Active   │ │
│  │   Version: 1.2.0 | IP: 10.0.1.15 | Last: 2 min ago                │ │
│  │                                                    [상세] [삭제]   │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ ○ agent-prod-02                                          Pending   │ │
│  │   등록됨: 5 min ago | 연결 대기 중...                              │ │
│  │                                           [토큰 재발급] [삭제]     │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  Agent가 없습니다. Agent를 등록하여 클러스터를 활성화하세요.            │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### 4.3. Agent List Item 컴포넌트
**Path**: `web/src/entities/agent/ui/agent-list-item.tsx`

```tsx
interface AgentListItemProps {
  agent: Agent;
  onViewDetail: () => void;
  onDelete: () => void;
  onRegenerateToken?: () => void;
}

export function AgentListItem({
  agent,
  onViewDetail,
  onDelete,
  onRegenerateToken,
}: AgentListItemProps) {
  const isPending = agent.status === 'pending';

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-3">
        <AgentStatusIndicator status={agent.status} />
        <div>
          <p className="font-medium">{agent.name}</p>
          <p className="text-sm text-muted-foreground">
            {isPending
              ? `등록됨: ${formatRelativeTime(agent.created_at)} | 연결 대기 중...`
              : `Version: ${agent.version} | IP: ${agent.ip_address} | Last: ${formatRelativeTime(agent.last_connected_at)}`
            }
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <AgentStatusBadge status={agent.status} />
        <DropdownMenu>
          {/* 상세, 토큰 재발급(pending만), 삭제 메뉴 */}
        </DropdownMenu>
      </div>
    </div>
  );
}
```

### 4.4. Cluster 상세 페이지 수정
**Path**: `web/src/pages/operator/cluster-detail-page.tsx`

기존 Cluster 상세 페이지에 `ClusterAgentList` 위젯 추가:

```tsx
export function ClusterDetailPage({ clusterId }: Props) {
  // ... existing code

  return (
    <div className="space-y-6">
      {/* Cluster Info Card */}
      <ClusterInfoCard cluster={cluster} />

      {/* Agent List Section - NEW */}
      <ClusterAgentList
        clusterId={clusterId}
        clusterName={cluster.name}
      />

      {/* Other sections... */}
    </div>
  );
}
```

## 5. 수용 기준
- [ ] Cluster 상세 페이지에 "연결된 Agents" 섹션이 표시된다.
- [ ] 해당 클러스터의 Agent만 필터링되어 표시된다.
- [ ] "Agent 등록" 버튼 클릭 시 등록 다이얼로그가 열린다.
- [ ] Agent 상태(Active/Inactive/Pending)가 시각적으로 구분된다.
- [ ] "상세" 클릭 시 Agent 상세 페이지로 이동한다.
- [ ] Agent 목록이 30초마다 자동 갱신된다.
- [ ] Agent가 없을 때 적절한 빈 상태 UI가 표시된다.

## 6. 기술 스택
- `useAgentsByCluster`: 클러스터별 Agent 조회 훅
- `@shadcn/card`: 카드 컴포넌트
- `@shadcn/dropdown-menu`: 액션 메뉴

## 7. 참조 파일
- `web/src/pages/operator/agents-page.tsx` (기존 Agent 목록 UI 참조)
- `web/src/pages/operator/cluster-detail-page.tsx` (수정 대상)
- `web/src/entities/agent/api/agent-api.ts` (`useAgentsByCluster`)

## 8. 비고
- 기존 독립 Agent 목록 페이지 (`/operator/agents`)는 전체 Agent 조회용으로 유지 가능
- 또는 EPIC 설계대로 완전히 Cluster 컨텍스트로 이동하고 독립 페이지 제거 검토
