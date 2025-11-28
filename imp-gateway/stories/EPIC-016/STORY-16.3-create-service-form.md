# STORY-16.3: Create API Service Form

## 1. 개요
**Epic**: EPIC-016 API Service 관리
**제목**: API Service 생성 폼 구현
**담당자**: AI Agent
**상태**: 🔲 미시작

## 2. 목적
새 API Service를 생성하는 폼 페이지를 구현한다. react-hook-form + zod를 사용한 유효성 검증을 포함한다.

## 3. 구현 상세

### 3.1. 라우트 구조
```
web/app/provider/services/new/
└── page.tsx                 # -> CreateServicePage
```

### 3.2. 페이지 컴포넌트
**Path**: `web/src/pages/provider/service/create-service-page.tsx`

```tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { CreateServiceForm } from "@/features/service";

export function CreateServicePage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/provider/services">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">새 API Service</h1>
          <p className="text-muted-foreground">API Service를 생성합니다</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
          <CardDescription>
            API Service의 기본 정보를 입력하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateServiceForm
            onSuccess={(service) => {
              router.push(`/provider/services/${service.id}`);
            }}
            onCancel={() => router.back()}
          />
        </CardContent>
      </Card>
    </div>
  );
}
```

### 3.3. 폼 컴포넌트
**Path**: `web/src/features/service/create/ui/create-service-form.tsx`

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createServiceSchema, type CreateServiceFormValues } from "../model/create-service-schema";
import { useCreateService, type APIService } from "@/entities/service";
import { LabelInput } from "./label-input";

interface CreateServiceFormProps {
  onSuccess?: (service: APIService) => void;
  onCancel?: () => void;
}

export function CreateServiceForm({ onSuccess, onCancel }: CreateServiceFormProps) {
  const createService = useCreateService();
  const form = useForm<CreateServiceFormValues>({
    resolver: zodResolver(createServiceSchema),
    defaultValues: {
      name: "",
      version: "",
      description: "",
      labels: {},
      status: "inactive",
    },
  });

  async function onSubmit(values: CreateServiceFormValues) {
    try {
      const result = await createService.mutateAsync(values);
      toast.success("API Service가 생성되었습니다");
      onSuccess?.(result.api_service);
    } catch (error) {
      toast.error("API Service 생성에 실패했습니다");
      console.error(error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Name Field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이름 *</FormLabel>
              <FormControl>
                <Input placeholder="Payment API" {...field} />
              </FormControl>
              <FormDescription>
                영문, 숫자, 하이픈만 사용 가능합니다
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Version Field */}
        <FormField
          control={form.control}
          name="version"
          render={({ field }) => (
            <FormItem>
              <FormLabel>버전</FormLabel>
              <FormControl>
                <Input placeholder="1.0.0" {...field} />
              </FormControl>
              <FormDescription>
                Semantic Versioning 권장 (예: 1.0.0)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description Field */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>설명</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="API Service에 대한 설명을 입력하세요"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Labels Field */}
        <FormField
          control={form.control}
          name="labels"
          render={({ field }) => (
            <FormItem>
              <FormLabel>라벨</FormLabel>
              <FormControl>
                <LabelInput
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormDescription>
                키-값 쌍으로 라벨을 추가하세요
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status Field */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>상태</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="active" id="active" />
                    <Label htmlFor="active">Active</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="inactive" id="inactive" />
                    <Label htmlFor="inactive">Inactive</Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Buttons */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            취소
          </Button>
          <Button type="submit" disabled={createService.isPending}>
            {createService.isPending ? "생성 중..." : "생성"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

### 3.4. Zod 스키마
**Path**: `web/src/features/service/create/model/create-service-schema.ts`

```typescript
import { z } from "zod";

export const createServiceSchema = z.object({
  name: z
    .string()
    .min(2, "이름은 2자 이상이어야 합니다")
    .max(100, "이름은 100자 이하여야 합니다")
    .regex(
      /^[a-zA-Z0-9-]+$/,
      "영문, 숫자, 하이픈만 사용할 수 있습니다"
    ),
  version: z
    .string()
    .max(50, "버전은 50자 이하여야 합니다")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .max(500, "설명은 500자 이하여야 합니다")
    .optional()
    .or(z.literal("")),
  labels: z.record(z.string()).optional(),
  status: z.enum(["active", "inactive"]).default("inactive"),
});

export type CreateServiceFormValues = z.infer<typeof createServiceSchema>;
```

### 3.5. Label Input 컴포넌트
**Path**: `web/src/features/service/create/ui/label-input.tsx`

```tsx
"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";

interface LabelInputProps {
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
}

export function LabelInput({ value = {}, onChange }: LabelInputProps) {
  const [key, setKey] = useState("");
  const [val, setVal] = useState("");

  function addLabel() {
    if (key && val) {
      onChange({ ...value, [key]: val });
      setKey("");
      setVal("");
    }
  }

  function removeLabel(k: string) {
    const { [k]: _, ...rest } = value;
    onChange(rest);
  }

  return (
    <div className="space-y-3">
      {/* Current Labels */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(value).map(([k, v]) => (
          <Badge key={k} variant="secondary" className="gap-1">
            {k}: {v}
            <button onClick={() => removeLabel(k)} className="hover:text-destructive">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>

      {/* Add New Label */}
      <div className="flex gap-2">
        <Input
          placeholder="Key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="w-32"
        />
        <Input
          placeholder="Value"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          className="flex-1"
        />
        <Button type="button" variant="outline" size="icon" onClick={addLabel}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
```

### 3.6. UI 레이아웃

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ← 새 API Service                                                           │
│    API Service를 생성합니다                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─ 기본 정보 ────────────────────────────────────────────────────────────┐ │
│  │  API Service의 기본 정보를 입력하세요                                  │ │
│  │                                                                         │ │
│  │  이름 *                                                                 │ │
│  │  ┌───────────────────────────────────────────────────────────────────┐ │ │
│  │  │ Payment API                                                        │ │ │
│  │  └───────────────────────────────────────────────────────────────────┘ │ │
│  │  영문, 숫자, 하이픈만 사용 가능합니다                                   │ │
│  │                                                                         │ │
│  │  버전                                                                   │ │
│  │  ┌───────────────────────────────────────────────────────────────────┐ │ │
│  │  │ 1.0.0                                                              │ │ │
│  │  └───────────────────────────────────────────────────────────────────┘ │ │
│  │  Semantic Versioning 권장 (예: 1.0.0)                                  │ │
│  │                                                                         │ │
│  │  설명                                                                   │ │
│  │  ┌───────────────────────────────────────────────────────────────────┐ │ │
│  │  │ 결제 처리를 위한 REST API                                          │ │ │
│  │  │                                                                    │ │ │
│  │  └───────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                         │ │
│  │  라벨                                                                   │ │
│  │  ┌──────────────────┐ ┌──────────────────┐                             │ │
│  │  │ env: prod    [x] │ │ team: payment [x]│                             │ │
│  │  └──────────────────┘ └──────────────────┘                             │ │
│  │  ┌────────────┐ ┌─────────────────────────┐ [+]                        │ │
│  │  │ Key        │ │ Value                   │                            │ │
│  │  └────────────┘ └─────────────────────────┘                            │ │
│  │                                                                         │ │
│  │  상태                                                                   │ │
│  │  ○ Active   ● Inactive                                                 │ │
│  │                                                                         │ │
│  │                                             [ 취소 ]  [ 생성 ]          │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 4. 수용 기준
- [ ] 이름 필드가 필수이며 유효성 검증이 동작한다.
- [ ] 버전, 설명 필드가 선택적으로 입력 가능하다.
- [ ] 라벨을 동적으로 추가/삭제할 수 있다.
- [ ] 상태(Active/Inactive)를 선택할 수 있다.
- [ ] "생성" 버튼 클릭 시 API가 호출된다.
- [ ] 성공 시 상세 페이지로 이동한다.
- [ ] 실패 시 에러 토스트가 표시된다.
- [ ] "취소" 클릭 시 목록 페이지로 돌아간다.

## 5. 참조 파일
- `web/src/features/cluster/create-cluster/` - 생성 폼 패턴
- `web/src/features/agent/register-agent/register-agent-form.tsx` - 폼 패턴

## 6. 비고
- 생성 후 Routes/Backends/Policies는 상세 페이지에서 추가 (EPIC-020)
- 기본 상태는 "inactive"로 설정하여 안전하게 시작
