# STORY-16.4: API Service Detail Page

## 1. 개요
**Epic**: EPIC-016 API Service 관리
**제목**: API Service 상세 페이지 구현 (Routes/Backends/Policies 목록 읽기 전용)
**담당자**: AI Agent
**상태**: 🔲 미시작

## 2. 목적
API Service의 상세 정보와 연결된 Routes/Backends/Policies 목록을 읽기 전용으로 표시하는 페이지를 구현한다.

## 3. 구현 상세

### 3.1. 라우트 구조
```
web/app/provider/services/[id]/
├── page.tsx                 # -> ServiceDetailPage
└── edit/
    └── page.tsx             # -> EditServicePage (Story 16.5)
```

### 3.2. 페이지 컴포넌트
**Path**: `web/src/pages/provider/service/service-detail-page.tsx`

```tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit, Trash2, Plus } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";

import { useService, ServiceStatusBadge } from "@/entities/service";
import { DeleteServiceDialog } from "@/features/service";

interface ServiceDetailPageProps {
  serviceId: string;
}

export function ServiceDetailPage({ serviceId }: ServiceDetailPageProps) {
  const router = useRouter();
  const { data: service, isLoading, error } = useService(serviceId);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // TODO: Routes, Backends, Policies 조회 훅 (EPIC-020에서 구현)
  // const { data: routes } = useRoutesByService(serviceId);
  // const { data: backends } = useBackendsByService(serviceId);
  // const { data: policies } = usePoliciesByService(serviceId);

  if (isLoading) {
    return <ServiceDetailSkeleton />;
  }

  if (error || !service) {
    return <ServiceDetailError onBack={() => router.back()} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/provider/services">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{service.name}</h1>
              <ServiceStatusBadge status={service.status} />
            </div>
            <p className="text-muted-foreground">
              {service.version && `v${service.version} • `}
              Created {formatDate(service.created_at)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/provider/services/${serviceId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              수정
            </Link>
          </Button>
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            삭제
          </Button>
        </div>
      </div>

      {/* Basic Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InfoRow label="ID" value={service.id} mono />
          <InfoRow label="이름" value={service.name} />
          <InfoRow label="버전" value={service.version || "-"} />
          <InfoRow label="설명" value={service.description || "-"} />
          <InfoRow label="상태" value={<ServiceStatusBadge status={service.status} />} />
          {service.labels && Object.keys(service.labels).length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">라벨</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(service.labels).map(([key, value]) => (
                  <Badge key={key} variant="outline">
                    {key}: {value}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Routes Section - Read Only */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Routes (0)</CardTitle>
            <CardDescription>API 경로 매핑</CardDescription>
          </div>
          <Button variant="outline" size="sm" disabled>
            <Plus className="mr-2 h-4 w-4" />
            추가
          </Button>
        </CardHeader>
        <CardContent>
          <EmptyPlaceholder message="Routes가 없습니다. EPIC-020에서 추가 기능 구현 예정" />
        </CardContent>
      </Card>

      {/* Backends Section - Read Only */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Backends (0)</CardTitle>
            <CardDescription>업스트림 서버 설정</CardDescription>
          </div>
          <Button variant="outline" size="sm" disabled>
            <Plus className="mr-2 h-4 w-4" />
            추가
          </Button>
        </CardHeader>
        <CardContent>
          <EmptyPlaceholder message="Backends가 없습니다. EPIC-020에서 추가 기능 구현 예정" />
        </CardContent>
      </Card>

      {/* Policies Section - Read Only */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Policies (0)</CardTitle>
            <CardDescription>적용된 정책</CardDescription>
          </div>
          <Button variant="outline" size="sm" disabled>
            <Plus className="mr-2 h-4 w-4" />
            추가
          </Button>
        </CardHeader>
        <CardContent>
          <EmptyPlaceholder message="Policies가 없습니다. EPIC-020에서 추가 기능 구현 예정" />
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <DeleteServiceDialog
        service={service}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onSuccess={() => router.push("/provider/services")}
      />
    </div>
  );
}
```

### 3.3. UI 레이아웃

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ← Payment API                        ● Active          [ 수정 ]  [ 삭제 ] │
│    v1.0.0 • Created 2025-01-15                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─ 기본 정보 ────────────────────────────────────────────────────────────┐ │
│  │                                                                         │ │
│  │  ID      abc123-def456-ghi789                                          │ │
│  │  이름    Payment API                                                   │ │
│  │  버전    1.0.0                                                         │ │
│  │  설명    결제 처리를 위한 REST API                                     │ │
│  │  상태    ● Active                                                      │ │
│  │  라벨    ┌─────────────┐ ┌─────────────────┐                          │ │
│  │          │ env: prod   │ │ team: payment   │                          │ │
│  │          └─────────────┘ └─────────────────┘                          │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  ┌─ Routes (3) ─────────────────────────────────────────────── [+ 추가] ─┐ │
│  │                                                                         │ │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │ │
│  │  │ Method  │ Path           │ Backend          │ Plugins           │   │ │
│  │  ├─────────┼────────────────┼──────────────────┼───────────────────┤   │ │
│  │  │ GET     │ /payments      │ payment-backend  │ rate-limit, auth  │   │ │
│  │  │ POST    │ /payments      │ payment-backend  │ auth              │   │ │
│  │  │ GET     │ /payments/:id  │ payment-backend  │ auth              │   │ │
│  │  └─────────┴────────────────┴──────────────────┴───────────────────┘   │ │
│  │                                                                         │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌─ Backends (1) ───────────────────────────────────────────── [+ 추가] ─┐ │
│  │                                                                         │ │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │ │
│  │  │ Name               │ Endpoint                        │ Status   │   │ │
│  │  ├────────────────────┼─────────────────────────────────┼──────────┤   │ │
│  │  │ payment-backend    │ https://api.internal:8080       │ ● Active │   │ │
│  │  └────────────────────┴─────────────────────────────────┴──────────┘   │ │
│  │                                                                         │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌─ Policies (2) ───────────────────────────────────────────── [+ 추가] ─┐ │
│  │                                                                         │ │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │ │
│  │  │ Type               │ Config                          │ Status   │   │ │
│  │  ├────────────────────┼─────────────────────────────────┼──────────┤   │ │
│  │  │ rate-limit         │ 100 req/min                     │ Enabled  │   │ │
│  │  │ jwt-auth           │ issuer: auth.example.com        │ Enabled  │   │ │
│  │  └────────────────────┴─────────────────────────────────┴──────────┘   │ │
│  │                                                                         │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.4. InfoRow 컴포넌트
```tsx
interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}

function InfoRow({ label, value, mono }: InfoRowProps) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-4">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className={`text-sm ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}
```

## 4. App Router 연결
**Path**: `web/app/provider/services/[id]/page.tsx`

```tsx
import { ServiceDetailPage } from "@/pages/provider/service";

interface PageProps {
  params: { id: string };
}

export default function Page({ params }: PageProps) {
  return <ServiceDetailPage serviceId={params.id} />;
}
```

## 5. 수용 기준
- [ ] API Service 기본 정보가 표시된다.
- [ ] 라벨이 Badge로 표시된다.
- [ ] Routes/Backends/Policies 섹션이 표시된다 (빈 상태).
- [ ] "수정" 클릭 시 수정 페이지로 이동한다.
- [ ] "삭제" 클릭 시 삭제 확인 다이얼로그가 표시된다.
- [ ] "+ 추가" 버튼은 disabled 상태로 표시된다 (EPIC-020에서 활성화).
- [ ] 로딩 중 스켈레톤 UI가 표시된다.
- [ ] 에러 시 적절한 에러 UI가 표시된다.

## 6. 참조 파일
- `web/src/pages/operator/cluster-detail-page.tsx` - 상세 페이지 패턴
- `web/src/pages/operator/agent-detail-page.tsx` - 상세 페이지 패턴

## 7. 비고
- Routes/Backends/Policies CRUD는 **EPIC-020**에서 구현
- 본 스토리에서는 빈 섹션 + disabled 버튼으로 준비만 해둠
- 추후 EPIC-020 완료 시 실제 데이터와 CRUD 기능 연결
