# STORY-18.5: Gateway Update & Delete

## 1. Overview
**Epic**: EPIC-018 Gateway Template Management
**Title**: Gateway Update/Delete Feature Implementation
**Assignee**: AI Agent
**Status**: 🔲 Not Started
**Estimate**: 0.5 day
**Dependencies**: STORY-18.3, STORY-18.4

## 2. Purpose
Implement features to update and delete Gateway templates. The update form reuses the create form pattern, and deletion requires name confirmation.

## 3. Implementation Details

### 3.1. Route Structure
```
web/app/provider/gateways/[id]/
├── page.tsx                 # -> GatewayDetailPage (existing)
└── edit/
    └── page.tsx             # -> GatewayEditPage
```

### 3.2. Feature Structure
```
web/src/features/gateway/
├── index.ts                 # (update)
├── create-gateway/          # (existing)
│   ├── index.ts
│   ├── model/
│   │   └── create-gateway-schema.ts
│   └── ui/
│       ├── create-gateway-form.tsx
│       └── listener-editor.tsx
├── update-gateway/
│   ├── index.ts
│   └── ui/
│       └── update-gateway-form.tsx
└── delete-gateway/
    ├── index.ts
    └── ui/
        └── delete-gateway-dialog.tsx
```

### 3.3. Update Gateway Form
**Path**: `web/src/features/gateway/update-gateway/ui/update-gateway-form.tsx`

```tsx
"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { Label } from "@/shared/components/ui/label";
import { Separator } from "@/shared/components/ui/separator";
import { useUpdateGateway, type Gateway } from "@/entities/gateway";
import { LabelInput } from "@/shared/components/label-input";
import { ListenerEditor } from "../../create-gateway/ui/listener-editor";
import {
  createGatewaySchema,
  type CreateGatewayFormValues,
} from "../../create-gateway/model/create-gateway-schema";

const GATEWAY_CLASSES = [
  { value: "envoy-gateway", label: "Envoy Gateway" },
  { value: "istio", label: "Istio" },
  { value: "nginx", label: "NGINX" },
];

interface UpdateGatewayFormProps {
  gateway: Gateway;
  onSuccess?: (gateway: Gateway) => void;
  onCancel?: () => void;
}

export function UpdateGatewayForm({
  gateway,
  onSuccess,
  onCancel,
}: UpdateGatewayFormProps) {
  const updateGateway = useUpdateGateway();

  const form = useForm<CreateGatewayFormValues>({
    resolver: zodResolver(createGatewaySchema),
    defaultValues: {
      name: gateway.name,
      gateway_class: gateway.gateway_class || "envoy-gateway",
      listeners: gateway.listeners || [
        { name: "http", port: 80, protocol: "HTTP", hostname: "" },
      ],
      labels: gateway.labels || {},
    },
  });

  async function onSubmit(values: CreateGatewayFormValues) {
    try {
      const result = await updateGateway.mutateAsync({
        id: gateway.id,
        ...values,
      });
      toast.success("Gateway updated successfully");
      onSuccess?.(result);
    } catch (error) {
      toast.error("Failed to update Gateway");
      console.error(error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Basic Information</h3>

          {/* Name (read-only for edit) */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="api-gateway"
                    {...field}
                    disabled
                    className="bg-muted"
                  />
                </FormControl>
                <FormDescription>
                  Gateway name cannot be changed after creation
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* GatewayClass */}
          <FormField
            control={form.control}
            name="gateway_class"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gateway Class</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Gateway Class" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {GATEWAY_CLASSES.map((gc) => (
                      <SelectItem key={gc.value} value={gc.value}>
                        {gc.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Labels */}
          <FormField
            control={form.control}
            name="labels"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Labels</FormLabel>
                <FormControl>
                  <LabelInput
                    value={field.value || {}}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Listeners Section */}
        <div className="space-y-6">
          <ListenerEditor
            control={form.control}
            errors={form.formState.errors}
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={updateGateway.isPending}>
            {updateGateway.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

### 3.4. Update Feature Export
**Path**: `web/src/features/gateway/update-gateway/index.ts`

```typescript
export { UpdateGatewayForm } from "./ui/update-gateway-form";
```

### 3.5. Delete Gateway Dialog
**Path**: `web/src/features/gateway/delete-gateway/ui/delete-gateway-dialog.tsx`

```tsx
"use client";

import { useState } from "react";
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
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useDeleteGateway, type Gateway } from "@/entities/gateway";

interface DeleteGatewayDialogProps {
  gateway: Gateway | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteGatewayDialog({
  gateway,
  open,
  onOpenChange,
  onSuccess,
}: DeleteGatewayDialogProps) {
  const [confirmName, setConfirmName] = useState("");
  const deleteGateway = useDeleteGateway();

  const isConfirmValid = gateway && confirmName === gateway.name;

  async function handleDelete() {
    if (!gateway) return;

    try {
      await deleteGateway.mutateAsync(gateway.id);
      toast.success(`Gateway "${gateway.name}" deleted successfully`);
      setConfirmName("");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to delete Gateway");
      console.error(error);
    }
  }

  function handleOpenChange(newOpen: boolean) {
    if (!newOpen) {
      setConfirmName("");
    }
    onOpenChange(newOpen);
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Gateway</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>
                Are you sure you want to delete the Gateway{" "}
                <span className="font-semibold text-foreground">
                  "{gateway?.name}"
                </span>
                ?
              </div>
              <div>
                This action cannot be undone. All settings associated with this
                Gateway template will be permanently removed.
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2 py-4">
          <Label htmlFor="confirm-name">
            Type{" "}
            <span className="font-semibold">{gateway?.name}</span> to confirm
            deletion
          </Label>
          <Input
            id="confirm-name"
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            placeholder={gateway?.name}
            autoComplete="off"
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={!isConfirmValid || deleteGateway.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteGateway.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

### 3.6. Delete Feature Export
**Path**: `web/src/features/gateway/delete-gateway/index.ts`

```typescript
export { DeleteGatewayDialog } from "./ui/delete-gateway-dialog";
```

### 3.7. Gateway Edit Page
**Path**: `web/src/pages/provider/gateway-edit-page.tsx`

```tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Network } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useGateway } from "@/entities/gateway";
import { UpdateGatewayForm } from "@/features/gateway";
import { PageContainer } from "@/widgets/layout/page-container";

interface GatewayEditPageProps {
  gatewayId: string;
}

export function GatewayEditPage({ gatewayId }: GatewayEditPageProps) {
  const router = useRouter();
  const { data: gateway, isLoading, error } = useGateway(gatewayId);

  if (isLoading) {
    return (
      <PageContainer>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-96 w-full" />
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    );
  }

  if (error || !gateway) {
    return (
      <PageContainer>
        <div className="space-y-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4">
            <p className="text-destructive">
              Gateway not found or failed to load.
            </p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild className="-ml-2">
            <Link href={`/provider/gateways/${gatewayId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Network className="h-5 w-5 text-muted-foreground" />
          <span>Edit Gateway</span>
        </div>
      }
      description={gateway.name}
    >
      <Card>
        <CardHeader>
          <CardTitle>Gateway Configuration</CardTitle>
          <CardDescription>
            Update the Gateway settings and listeners
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UpdateGatewayForm
            gateway={gateway}
            onSuccess={() => {
              router.push(`/provider/gateways/${gatewayId}`);
            }}
            onCancel={() => router.back()}
          />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
```

### 3.8. App Router Edit Page
**Path**: `web/app/provider/gateways/[id]/edit/page.tsx`

```tsx
import { GatewayEditPage } from "@/pages/provider/gateway-edit-page";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <GatewayEditPage gatewayId={id} />;
}
```

### 3.9. Feature Export Update
**Path**: `web/src/features/gateway/index.ts`

```typescript
// Create
export { CreateGatewayForm } from "./create-gateway/ui/create-gateway-form";
export { ListenerEditor } from "./create-gateway/ui/listener-editor";

// Update
export { UpdateGatewayForm } from "./update-gateway/ui/update-gateway-form";

// Delete
export { DeleteGatewayDialog } from "./delete-gateway/ui/delete-gateway-dialog";
```

### 3.10. Page Export Update
**Path**: `web/src/pages/provider/index.ts`

```typescript
// ... existing exports

// Gateways (EPIC-018)
export { GatewaysPage } from "./gateways-page";
export { GatewayCreatePage } from "./gateway-create-page";
export { GatewayDetailPage } from "./gateway-detail-page";
export { GatewayEditPage } from "./gateway-edit-page";
```

### 3.11. Delete Confirmation Dialog UI

```
┌─────────────────────────────────────────────────────────────┐
│  Delete Gateway                                        [X]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Are you sure you want to delete the Gateway "api-gateway"? │
│                                                             │
│  This action cannot be undone. All settings associated with │
│  this Gateway template will be permanently removed.         │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Type api-gateway to confirm deletion                 │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ api-gateway                                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│                            [ Cancel ]  [ Delete ]           │
│                                        (disabled until      │
│                                         name matches)       │
└─────────────────────────────────────────────────────────────┘
```

## 4. Acceptance Criteria

### Update Feature
- [ ] Edit page pre-fills form with existing Gateway data
- [ ] Gateway name is displayed but not editable (read-only field)
- [ ] GatewayClass, labels can be modified
- [ ] Listeners can be added/removed/modified
- [ ] Validation works the same as create form
- [ ] "Save Changes" button calls update API
- [ ] Navigates to detail page on success
- [ ] Shows error toast on failure
- [ ] "Cancel" returns to detail page

### Delete Feature
- [ ] Delete button opens confirmation dialog
- [ ] Delete button is disabled until exact Gateway name is entered
- [ ] Navigates to list page on successful deletion
- [ ] Shows error toast on failure
- [ ] Dialog resets confirmation input when closed

## 5. Reference Files
- `web/src/features/service/update-service/` - Update form pattern
- `web/src/features/service/delete-service/` - Delete dialog pattern
- `web/src/pages/provider/service-edit-page.tsx` - Edit page pattern

## 6. Notes
- ListenerEditor component is shared between create/update forms
- Name confirmation prevents accidental deletion of important resources
- Warning for deleting Gateway used by ProductPublish will be implemented in EPIC-019
