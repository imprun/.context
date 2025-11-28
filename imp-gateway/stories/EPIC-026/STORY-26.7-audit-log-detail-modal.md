# Story 26.7: Audit Log 상세 모달 (Diff 표시)

## 개요

| 항목 | 내용 |
|------|------|
| **Story ID** | 26.7 |
| **Epic** | EPIC-026 (System Audit Logs) |
| **제목** | Audit Log 상세 모달 (Diff 표시) |
| **예상 기간** | 1일 |
| **우선순위** | P2 |
| **상태** | 🔲 미시작 |
| **담당** | Frontend |
| **의존성** | Story 26.5, 26.6 |

## 목표

특정 감사 로그의 상세 정보와 변경 내용(Before/After Diff)을 확인할 수 있는 모달을 구현한다.

## 구현 범위

### 파일 구조

```
web/src/features/audit-log/
├── index.ts
└── ui/
    ├── audit-log-filters.tsx
    ├── audit-log-detail-modal.tsx    # 상세 모달
    └── json-diff-viewer.tsx          # JSON Diff 뷰어
```

### 모달 레이아웃

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  Audit Log Detail                                                        [X]    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─ Basic Information ─────────────────────────────────────────────────────────┐│
│  │                                                                             ││
│  │  Action:       [CREATE]           Portal:      [provider]                   ││
│  │  Resource:     api_service        Name:        Payment API                  ││
│  │  Tenant:       Acme Inc                                                     ││
│  │                                                                             ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                 │
│  ┌─ Actor Information ─────────────────────────────────────────────────────────┐│
│  │                                                                             ││
│  │  Name:         John Doe           Email:       john@acme.com                ││
│  │  Role:         api-developer      IP:          192.168.1.1                  ││
│  │  User Agent:   Mozilla/5.0 (Windows NT 10.0; Win64; x64) ...               ││
│  │                                                                             ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                 │
│  ┌─ Request Information ───────────────────────────────────────────────────────┐│
│  │                                                                             ││
│  │  Method:       PUT                Path:        /api/v1/provider/api-ser... ││
│  │  Timestamp:    2025-11-28 10:30:00 KST                                      ││
│  │                                                                             ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                 │
│  ┌─ Changes (Before / After) ──────────────────────────────────────────────────┐│
│  │  [Before] [After] [Diff]                                                    ││
│  │                                                                             ││
│  │  ┌─ Before ─────────────────────┐  ┌─ After ──────────────────────┐        ││
│  │  │ {                            │  │ {                             │        ││
│  │  │   "name": "Payment API",     │  │   "name": "Payment API v2",  │        ││
│  │  │   "status": "draft"          │  │   "status": "active"         │        ││
│  │  │ }                            │  │ }                             │        ││
│  │  └──────────────────────────────┘  └───────────────────────────────┘        ││
│  │                                                                             ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                 │
│                                                               [Close]           │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 상세 모달 컴포넌트

```typescript
interface AuditLogDetailModalProps {
  id: string;
  onClose: () => void;
}

export function AuditLogDetailModal({ id, onClose }: AuditLogDetailModalProps) {
  const { data: log, isLoading } = useAuditLog(id);

  if (isLoading) {
    return <Dialog open><DialogContent><Skeleton /></DialogContent></Dialog>;
  }

  if (!log) {
    return null;
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Audit Log Detail</DialogTitle>
        </DialogHeader>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-muted-foreground">Action</dt>
                <dd><ActionBadge action={log.action} /></dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Portal</dt>
                <dd><PortalBadge portal={log.portal} /></dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Resource Type</dt>
                <dd>{formatResourceType(log.resource_type)}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Resource Name</dt>
                <dd>{log.resource_name}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Tenant</dt>
                <dd>{log.tenant_name || '-'}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Actor Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Actor Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-muted-foreground">Name</dt>
                <dd>{log.actor_name}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Email</dt>
                <dd>{log.actor_email}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Role</dt>
                <dd>{log.actor_role}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">IP Address</dt>
                <dd>{log.ip_address}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-sm text-muted-foreground">User Agent</dt>
                <dd className="text-xs truncate">{log.user_agent}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Request Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Request Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-muted-foreground">Method</dt>
                <dd><Badge variant="outline">{log.request_method}</Badge></dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Path</dt>
                <dd className="text-xs font-mono truncate">{log.request_path}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Timestamp</dt>
                <dd>{format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss')}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Changes (Before/After) */}
        {log.details && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Changes</CardTitle>
            </CardHeader>
            <CardContent>
              <JsonDiffViewer
                before={log.details.before}
                after={log.details.after}
              />
            </CardContent>
          </Card>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### JSON Diff Viewer 컴포넌트

```typescript
interface JsonDiffViewerProps {
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
}

export function JsonDiffViewer({ before, after }: JsonDiffViewerProps) {
  const [viewMode, setViewMode] = useState<'side-by-side' | 'unified'>('side-by-side');

  return (
    <div>
      <Tabs value={viewMode} onValueChange={setViewMode}>
        <TabsList>
          <TabsTrigger value="side-by-side">Side by Side</TabsTrigger>
          <TabsTrigger value="unified">Unified</TabsTrigger>
        </TabsList>

        <TabsContent value="side-by-side">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-2 text-red-500">Before</h4>
              <pre className="bg-muted p-4 rounded text-xs overflow-auto max-h-64">
                {JSON.stringify(before, null, 2)}
              </pre>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2 text-green-500">After</h4>
              <pre className="bg-muted p-4 rounded text-xs overflow-auto max-h-64">
                {JSON.stringify(after, null, 2)}
              </pre>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="unified">
          {/* diff 라이브러리 사용 또는 커스텀 diff 구현 */}
          <DiffViewer before={before} after={after} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### 의존성 (선택)

Diff 시각화를 위해 라이브러리 사용 고려:

```bash
pnpm add react-diff-viewer-continued
# 또는
pnpm add jsondiffpatch
```

## 수용 기준

### 기능

- [ ] 목록에서 항목 클릭 시 모달이 열린다
- [ ] 모든 기본 정보가 표시된다 (Action, Portal, Resource, Actor, Request)
- [ ] details.before/after가 있으면 JSON 형태로 표시된다
- [ ] Side-by-Side 뷰로 Before/After를 비교할 수 있다
- [ ] 모달 닫기가 정상 동작한다

### UI/UX

- [ ] 로딩 상태가 표시된다
- [ ] JSON이 읽기 쉽게 포맷팅되어 표시된다
- [ ] 모달이 너무 길면 스크롤이 가능하다
- [ ] 반응형으로 작은 화면에서도 사용 가능하다

## 참조

- [EPIC-026 UI/UX 가이드](../../epics/EPIC-026-audit-logs.md#uiux-가이드)
- 기존 패턴: `features/cluster/ui/cluster-detail-modal.tsx`
