# STORY-16.5: API Service Update & Delete

## 1. 개요
**Epic**: EPIC-016 API Service 관리
**제목**: API Service 수정/삭제 기능 구현
**담당자**: AI Agent
**상태**: 🔲 미시작

## 2. 목적
API Service를 수정하는 폼 페이지와 삭제 확인 다이얼로그를 구현한다.

## 3. 구현 상세

### 3.1. 수정 페이지

#### 라우트
```
web/app/provider/services/[id]/edit/
└── page.tsx                 # -> EditServicePage
```

#### 페이지 컴포넌트
**Path**: `web/src/pages/provider/service/edit-service-page.tsx`

```tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useService } from "@/entities/service";
import { UpdateServiceForm } from "@/features/service";

interface EditServicePageProps {
  serviceId: string;
}

export function EditServicePage({ serviceId }: EditServicePageProps) {
  const router = useRouter();
  const { data: service, isLoading, error } = useService(serviceId);

  if (isLoading) {
    return <EditServiceSkeleton />;
  }

  if (error || !service) {
    return <EditServiceError onBack={() => router.back()} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/provider/services/${serviceId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{service.name} 수정</h1>
          <p className="text-muted-foreground">API Service 정보를 수정합니다</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
          <CardDescription>
            API Service의 정보를 수정하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UpdateServiceForm
            service={service}
            onSuccess={() => {
              router.push(`/provider/services/${serviceId}`);
            }}
            onCancel={() => router.back()}
          />
        </CardContent>
      </Card>
    </div>
  );
}
```

#### 수정 폼 컴포넌트
**Path**: `web/src/features/service/update/ui/update-service-form.tsx`

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { updateServiceSchema, type UpdateServiceFormValues } from "../model/update-service-schema";
import { useUpdateService, type APIService } from "@/entities/service";

interface UpdateServiceFormProps {
  service: APIService;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function UpdateServiceForm({ service, onSuccess, onCancel }: UpdateServiceFormProps) {
  const updateService = useUpdateService();
  const form = useForm<UpdateServiceFormValues>({
    resolver: zodResolver(updateServiceSchema),
    defaultValues: {
      name: service.name,
      version: service.version || "",
      description: service.description || "",
      labels: service.labels || {},
      status: service.status,
    },
  });

  async function onSubmit(values: UpdateServiceFormValues) {
    try {
      await updateService.mutateAsync({
        id: service.id,
        ...values,
      });
      toast.success("API Service가 수정되었습니다");
      onSuccess?.();
    } catch (error) {
      toast.error("API Service 수정에 실패했습니다");
      console.error(error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Same fields as CreateServiceForm */}
        {/* Name, Version, Description, Labels, Status */}

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            취소
          </Button>
          <Button type="submit" disabled={updateService.isPending}>
            {updateService.isPending ? "저장 중..." : "저장"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

### 3.2. 삭제 다이얼로그

**Path**: `web/src/features/service/delete/ui/delete-service-dialog.tsx`

```tsx
"use client";

import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { useDeleteService, type APIService } from "@/entities/service";

interface DeleteServiceDialogProps {
  service: APIService | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteServiceDialog({
  service,
  open,
  onOpenChange,
  onSuccess,
}: DeleteServiceDialogProps) {
  const deleteService = useDeleteService();

  async function handleDelete() {
    if (!service) return;

    try {
      await deleteService.mutateAsync(service.id);
      toast.success(`"${service.name}" API Service가 삭제되었습니다`);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error("API Service 삭제에 실패했습니다");
      console.error(error);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>API Service 삭제</AlertDialogTitle>
          <AlertDialogDescription>
            정말로 <strong>&quot;{service?.name}&quot;</strong> API Service를 삭제하시겠습니까?
            <br /><br />
            이 작업은 되돌릴 수 없으며, 다음 항목이 함께 삭제됩니다:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>연결된 모든 Routes</li>
              <li>연결된 모든 Backends</li>
              <li>연결된 모든 Policies</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteService.isPending ? "삭제 중..." : "삭제"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

### 3.3. UI 레이아웃 - 삭제 다이얼로그

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  API Service 삭제                                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  정말로 "Payment API" API Service를 삭제하시겠습니까?                       │
│                                                                             │
│  이 작업은 되돌릴 수 없으며, 다음 항목이 함께 삭제됩니다:                   │
│                                                                             │
│  • 연결된 모든 Routes                                                       │
│  • 연결된 모든 Backends                                                     │
│  • 연결된 모든 Policies                                                     │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                   [ 취소 ]  [ 삭제 ]       │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.4. Features Export 업데이트
**Path**: `web/src/features/service/index.ts`

```typescript
// Create
export { CreateServiceForm } from "./create/ui/create-service-form";

// Update
export { UpdateServiceForm } from "./update/ui/update-service-form";

// Delete
export { DeleteServiceDialog } from "./delete/ui/delete-service-dialog";
```

## 4. App Router 연결
**Path**: `web/app/provider/services/[id]/edit/page.tsx`

```tsx
import { EditServicePage } from "@/pages/provider/service";

interface PageProps {
  params: { id: string };
}

export default function Page({ params }: PageProps) {
  return <EditServicePage serviceId={params.id} />;
}
```

## 5. 수용 기준

### 수정 기능
- [ ] 기존 API Service 정보가 폼에 채워져 있다.
- [ ] 모든 필드를 수정할 수 있다.
- [ ] "저장" 클릭 시 API가 호출된다.
- [ ] 성공 시 상세 페이지로 이동하고 토스트가 표시된다.
- [ ] 실패 시 에러 토스트가 표시된다.
- [ ] "취소" 클릭 시 상세 페이지로 돌아간다.

### 삭제 기능
- [ ] 삭제 확인 다이얼로그가 표시된다.
- [ ] 다이얼로그에 삭제될 항목 경고가 표시된다.
- [ ] "삭제" 클릭 시 API가 호출된다.
- [ ] 성공 시 목록 페이지로 이동하고 토스트가 표시된다.
- [ ] 실패 시 에러 토스트가 표시된다.
- [ ] "취소" 클릭 시 다이얼로그가 닫힌다.

## 6. 참조 파일
- `web/src/features/cluster/update-cluster/` - 수정 폼 패턴
- `web/src/features/agent/revoke-agent/revoke-agent-dialog.tsx` - 다이얼로그 패턴

## 7. 비고
- 삭제 시 연결된 Routes/Backends/Policies도 함께 삭제됨 (백엔드 CASCADE)
- Product에 연결된 API Service 삭제 시 Product에서 연결이 해제되는지 확인 필요
