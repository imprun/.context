# Story 26.6: Audit Log 목록 페이지 (DataTable + 필터)

## 개요

| 항목 | 내용 |
|------|------|
| **Story ID** | 26.6 |
| **Epic** | EPIC-026 (System Audit Logs) |
| **제목** | Audit Log 목록 페이지 (DataTable + 필터) |
| **예상 기간** | 1.5일 |
| **우선순위** | P2 |
| **상태** | 🔲 미시작 |
| **담당** | Frontend |
| **의존성** | Story 26.5 |

## 목표

Operator가 시스템 내 모든 작업 이력을 조회하고 필터링할 수 있는 목록 페이지를 구현한다.

## 구현 범위

### 파일 구조

```
web/src/
├── pages/operator/
│   └── audit-logs-page.tsx           # 페이지 컴포넌트
├── widgets/operator/audit/
│   ├── index.ts
│   └── audit-log-table.tsx           # DataTable 위젯
├── features/audit-log/
│   ├── index.ts
│   └── ui/
│       └── audit-log-filters.tsx     # 필터 컴포넌트
└── app/operator/audit-logs/
    └── page.tsx                      # Next.js 라우트
```

### 라우트 등록

```
/operator/audit-logs → Audit Logs 페이지
```

### 페이지 레이아웃

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  System Audit Logs                                                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─ Filters ──────────────────────────────────────────────────────────────────┐ │
│  │                                                                             │ │
│  │  Portal: [All ▼]   Action: [All ▼]   Resource: [All ▼]   Tenant: [All ▼]  │ │
│  │                                                                             │ │
│  │  Date Range: [Last 7 days ▼]   Search: [________________]   [Reset]        │ │
│  │                                                                             │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  ┌─ DataTable ─────────────────────────────────────────────────────────────────┐ │
│  │ Time         │ Portal   │ Actor        │ Action │ Resource      │ Tenant   │ │
│  ├──────────────┼──────────┼──────────────┼────────┼───────────────┼──────────┤ │
│  │ 2 mins ago   │ provider │ john@acme    │ CREATE │ api_service   │ Acme Inc │ │
│  │ 5 mins ago   │ operator │ admin@imp    │ UPDATE │ cluster       │ -        │ │
│  │ ...          │ ...      │ ...          │ ...    │ ...           │ ...      │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  Showing 1-20 of 1,234 results                    [< Prev] [1] [2] [3] [Next >] │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 필터 컴포넌트 (`features/audit-log/ui/audit-log-filters.tsx`)

```typescript
interface AuditLogFiltersProps {
  filters: AuditLogFilter;
  onFilterChange: (filters: AuditLogFilter) => void;
  onReset: () => void;
}

export function AuditLogFilters({ filters, onFilterChange, onReset }: AuditLogFiltersProps) {
  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {/* Portal Select */}
          <Select
            value={filters.portal}
            onValueChange={(value) => onFilterChange({ ...filters, portal: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Portal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              {PORTALS.map((p) => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Action Select */}
          {/* Resource Type Select */}
          {/* Tenant Select */}
          {/* Date Range Picker */}
          {/* Search Input */}

          <Button variant="outline" onClick={onReset}>Reset</Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

### DataTable 컬럼

| Column | Field | Width | 설명 |
|--------|-------|-------|------|
| Time | created_at | 150px | 상대 시간 (formatDistanceToNow) |
| Portal | portal | 100px | Badge with color |
| Actor | actor_name, actor_email | 200px | 이름 + 이메일 |
| Action | action | 100px | Badge with color |
| Resource | resource_type, resource_name | 200px | 타입 + 이름 |
| Tenant | tenant_name | 150px | - 표시 if null |

### Badge 색상

#### Action Badge

```typescript
const actionVariants: Record<AuditAction, string> = {
  CREATE: 'bg-emerald-500',
  UPDATE: 'bg-blue-500',
  DELETE: 'bg-red-500',
  DEPLOY: 'bg-purple-500',
  PUBLISH: 'bg-cyan-500',
  WITHDRAW: 'bg-orange-500',
  LOGIN: 'bg-gray-500',
  LOGOUT: 'bg-gray-500',
  APPROVE: 'bg-emerald-500',
  REJECT: 'bg-red-500',
};
```

#### Portal Badge

```typescript
const portalVariants: Record<Portal, string> = {
  operator: 'bg-orange-500',
  provider: 'bg-blue-500',
  consumer: 'bg-emerald-500',
  admin: 'bg-red-500',
};
```

### 페이지 컴포넌트 (`pages/operator/audit-logs-page.tsx`)

```typescript
export function AuditLogsPage() {
  const [filters, setFilters] = useState<AuditLogFilter>({ page: 1, limit: 20 });
  const { data, isLoading } = useAuditLogs(filters);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">System Audit Logs</h1>
          <p className="text-muted-foreground">
            Track all actions across the system
          </p>
        </div>
      </div>

      <AuditLogFilters
        filters={filters}
        onFilterChange={setFilters}
        onReset={() => setFilters({ page: 1, limit: 20 })}
      />

      <AuditLogTable
        data={data?.data ?? []}
        isLoading={isLoading}
        onRowClick={(log) => setSelectedLogId(log.id)}
      />

      <Pagination
        total={data?.meta.total ?? 0}
        page={filters.page ?? 1}
        limit={filters.limit ?? 20}
        onPageChange={(page) => setFilters({ ...filters, page })}
      />

      {selectedLogId && (
        <AuditLogDetailModal
          id={selectedLogId}
          onClose={() => setSelectedLogId(null)}
        />
      )}
    </div>
  );
}
```

## 수용 기준

### 기능

- [ ] `/operator/audit-logs` 경로에서 페이지에 접근할 수 있다
- [ ] 최신순으로 로그가 표시된다
- [ ] Portal, Action, Resource Type, Tenant로 필터링할 수 있다
- [ ] 날짜 범위로 필터링할 수 있다
- [ ] 검색어로 Actor, Resource를 검색할 수 있다
- [ ] 페이지네이션이 정상 동작한다
- [ ] 행 클릭 시 상세 모달이 열린다

### UI/UX

- [ ] 로딩 상태가 표시된다 (Skeleton)
- [ ] 빈 상태가 적절히 표시된다
- [ ] Action, Portal Badge가 색상으로 구분된다
- [ ] 반응형 레이아웃이 적용된다

## 참조

- [EPIC-026 UI/UX 가이드](../../epics/EPIC-026-audit-logs.md#uiux-가이드)
- 기존 패턴: `pages/operator/clusters-page.tsx`
