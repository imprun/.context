# STORY-18.3: Gateway Create Form with Listener Editor

## 1. Overview
**Epic**: EPIC-018 Gateway Template Management
**Title**: Gateway Create Form with Listener Editor
**Assignee**: AI Agent
**Status**: 🔲 Not Started
**Estimate**: 1.5 days
**Dependencies**: STORY-18.1

## 2. Purpose
Implement a form to create new Gateway templates with a dynamic Listener editor. Uses react-hook-form + zod for validation.

## 3. Implementation Details

### 3.1. Route Structure
```
web/app/provider/gateways/new/
└── page.tsx                 # -> GatewayCreatePage
```

### 3.2. Feature Structure
```
web/src/features/gateway/
├── index.ts
├── create-gateway/
│   ├── index.ts
│   ├── create-gateway-schema.ts
│   ├── create-gateway-form.tsx
│   └── listener-editor.tsx
├── delete-gateway/
│   └── ...
└── lib/
    └── constants.ts
```

### 3.3. Zod Schema
**Path**: `web/src/features/gateway/create-gateway/create-gateway-schema.ts`

```typescript
import { z } from "zod";

// Listener Schema
export const listenerSchema = z.object({
  name: z
    .string()
    .min(1, "Listener name is required")
    .max(63, "Name must be 63 characters or less")
    .regex(
      /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/,
      "Only lowercase letters, numbers, and hyphens allowed"
    ),
  port: z
    .number({ required_error: "Port is required" })
    .min(1, "Port must be at least 1")
    .max(65535, "Port must be at most 65535"),
  protocol: z.enum(["HTTP", "HTTPS", "TCP", "TLS"], {
    required_error: "Please select a protocol",
  }),
  hostname: z
    .string()
    .max(253, "Hostname must be 253 characters or less")
    .optional()
    .or(z.literal("")),
});

// Gateway Schema
export const createGatewaySchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(63, "Name must be 63 characters or less")
    .regex(
      /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/,
      "Only lowercase letters, numbers, and hyphens allowed (RFC 1123 DNS label)"
    ),
  gateway_class: z.string().default("envoy-gateway"),
  listeners: z
    .array(listenerSchema)
    .min(1, "At least one listener is required")
    .refine(
      (listeners) => {
        const ports = listeners.map((l) => l.port);
        return new Set(ports).size === ports.length;
      },
      { message: "Listener ports must be unique" }
    ),
  labels: z.record(z.string()).optional(),
  status: z.enum(["active", "inactive"]).default("inactive"),
});

export type ListenerFormValues = z.infer<typeof listenerSchema>;
export type CreateGatewayFormValues = z.infer<typeof createGatewaySchema>;
```

### 3.4. Constants
**Path**: `web/src/features/gateway/lib/constants.ts`

```typescript
export const GATEWAY_PROTOCOLS = [
  { value: "HTTP", label: "HTTP", description: "Plain HTTP traffic" },
  { value: "HTTPS", label: "HTTPS", description: "TLS-terminated HTTPS traffic" },
  { value: "TCP", label: "TCP", description: "Raw TCP traffic" },
  { value: "TLS", label: "TLS", description: "TLS passthrough traffic" },
] as const;

export const GATEWAY_CLASSES = [
  { value: "envoy-gateway", label: "Envoy Gateway", description: "Default Envoy Gateway controller" },
] as const;

export const DEFAULT_LISTENER = {
  name: "http",
  port: 80,
  protocol: "HTTP" as const,
  hostname: "",
};
```

### 3.5. Listener Editor Component
**Path**: `web/src/features/gateway/create-gateway/listener-editor.tsx`

```tsx
"use client";

import { useFieldArray, Control, Controller, UseFormSetValue } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { GATEWAY_PROTOCOLS, DEFAULT_LISTENER } from "../lib/constants";
import type { CreateGatewayFormValues } from "./create-gateway-schema";

interface ListenerEditorProps {
  control: Control<CreateGatewayFormValues>;
  setValue: UseFormSetValue<CreateGatewayFormValues>;
  errors: Record<string, any>;
}

export function ListenerEditor({ control, setValue, errors }: ListenerEditorProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "listeners",
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Listeners</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append(DEFAULT_LISTENER)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Listener
        </Button>
      </div>

      {errors.listeners?.root && (
        <p className="text-sm text-destructive">{errors.listeners.root.message}</p>
      )}

      {fields.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="text-muted-foreground mb-4">No listeners configured</p>
            <Button
              type="button"
              variant="outline"
              onClick={() => append(DEFAULT_LISTENER)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Listener
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {fields.map((field, index) => (
          <Card key={field.id}>
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  Listener #{index + 1}
                </CardTitle>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {/* Name */}
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Controller
                    control={control}
                    name={`listeners.${index}.name`}
                    render={({ field }) => (
                      <Input {...field} placeholder="http" />
                    )}
                  />
                  {errors.listeners?.[index]?.name && (
                    <p className="text-sm text-destructive">
                      {errors.listeners[index].name.message}
                    </p>
                  )}
                </div>

                {/* Port */}
                <div className="space-y-2">
                  <Label>Port *</Label>
                  <Controller
                    control={control}
                    name={`listeners.${index}.port`}
                    render={({ field }) => (
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        placeholder="80"
                      />
                    )}
                  />
                  {errors.listeners?.[index]?.port && (
                    <p className="text-sm text-destructive">
                      {errors.listeners[index].port.message}
                    </p>
                  )}
                </div>

                {/* Protocol */}
                <div className="space-y-2">
                  <Label>Protocol *</Label>
                  <Controller
                    control={control}
                    name={`listeners.${index}.protocol`}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {GATEWAY_PROTOCOLS.map((protocol) => (
                            <SelectItem key={protocol.value} value={protocol.value}>
                              {protocol.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.listeners?.[index]?.protocol && (
                    <p className="text-sm text-destructive">
                      {errors.listeners[index].protocol.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Hostname */}
              <div className="space-y-2">
                <Label>Hostname (optional)</Label>
                <Controller
                  control={control}
                  name={`listeners.${index}.hostname`}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="api.example.com or *.example.com"
                    />
                  )}
                />
                <p className="text-xs text-muted-foreground">
                  Only process traffic for this hostname. Wildcards (*.example.com) supported.
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

### 3.6. Create Gateway Form
**Path**: `web/src/features/gateway/create-gateway/create-gateway-form.tsx`

```tsx
"use client";

import { useForm } from "react-hook-form";
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
import { useCreateGateway, type Gateway } from "@/entities/gateway";
import { LabelInput } from "@/shared/components/label-input";
import { ListenerEditor } from "./listener-editor";
import {
  createGatewaySchema,
  type CreateGatewayFormValues,
} from "./create-gateway-schema";
import { GATEWAY_CLASSES, DEFAULT_LISTENER } from "../lib/constants";

interface CreateGatewayFormProps {
  onSuccess?: (gateway: Gateway) => void;
  onCancel?: () => void;
}

export function CreateGatewayForm({ onSuccess, onCancel }: CreateGatewayFormProps) {
  const createGateway = useCreateGateway();

  const form = useForm<CreateGatewayFormValues>({
    resolver: zodResolver(createGatewaySchema),
    defaultValues: {
      name: "",
      gateway_class: "envoy-gateway",
      listeners: [DEFAULT_LISTENER],
      labels: {},
      status: "inactive",
    },
  });

  async function onSubmit(values: CreateGatewayFormValues) {
    try {
      const gateway = await createGateway.mutateAsync(values);
      toast.success("Gateway created successfully");
      onSuccess?.(gateway);
    } catch (error) {
      toast.error("Failed to create gateway");
      console.error(error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Info Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Basic Information</h3>

          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name *</FormLabel>
                <FormControl>
                  <Input placeholder="api-gateway" {...field} />
                </FormControl>
                <FormDescription>
                  RFC 1123 DNS label: lowercase letters, numbers, and hyphens only
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                <FormDescription>
                  Controller implementation that manages the Gateway
                </FormDescription>
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
                  <LabelInput value={field.value || {}} onChange={field.onChange} />
                </FormControl>
                <FormDescription>
                  Add metadata as key-value pairs (e.g., env, team)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Status */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex gap-6"
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
        </div>

        <Separator />

        {/* Listeners Section */}
        <div className="space-y-6">
          <ListenerEditor
            control={form.control}
            setValue={form.setValue}
            errors={form.formState.errors}
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={createGateway.isPending}>
            {createGateway.isPending ? "Creating..." : "Create"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

### 3.7. Page Component
**Path**: `web/src/pages/provider/gateway-create-page.tsx`

```tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { CreateGatewayForm } from "@/features/gateway";

export function GatewayCreatePage() {
  const router = useRouter();

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/provider/gateways">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">New Gateway</h1>
          <p className="text-muted-foreground">Create a new Gateway template</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gateway Configuration</CardTitle>
          <CardDescription>
            Configure basic information and listeners for the Gateway
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateGatewayForm
            onSuccess={(gateway) => {
              router.push(`/provider/gateways/${gateway.id}`);
            }}
            onCancel={() => router.back()}
          />
        </CardContent>
      </Card>
    </div>
  );
}
```

### 3.8. App Router Page
**Path**: `web/app/provider/gateways/new/page.tsx`

```tsx
import { GatewayCreatePage } from "@/pages/provider/gateway-create-page";

export default function Page() {
  return <GatewayCreatePage />;
}
```

### 3.9. Feature Export
**Path**: `web/src/features/gateway/create-gateway/index.ts`

```typescript
export { CreateGatewayForm } from "./create-gateway-form";
export { createGatewaySchema, type CreateGatewayFormValues } from "./create-gateway-schema";
```

### 3.10. UI Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ← New Gateway                                                              │
│    Create a new Gateway template                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─ Gateway Configuration ──────────────────────────────────────────────┐   │
│  │  Configure basic information and listeners for the Gateway           │   │
│  │                                                                       │   │
│  │  ── Basic Information ─────────────────────────────────────────────   │   │
│  │                                                                       │   │
│  │  Name *                                                               │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │   │
│  │  │ api-gateway                                                      │ │   │
│  │  └─────────────────────────────────────────────────────────────────┘ │   │
│  │  RFC 1123 DNS label: lowercase letters, numbers, and hyphens only   │   │
│  │                                                                       │   │
│  │  Gateway Class                                                        │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │   │
│  │  │ Envoy Gateway                                                 ▼ │ │   │
│  │  └─────────────────────────────────────────────────────────────────┘ │   │
│  │                                                                       │   │
│  │  Labels                                                               │   │
│  │  ┌────────────────┐ ┌────────────────┐                               │   │
│  │  │ env: prod  [x] │ │ tier: ext  [x] │                               │   │
│  │  └────────────────┘ └────────────────┘                               │   │
│  │  ┌──────────┐ ┌───────────────────────┐ [+]                          │   │
│  │  │ Key      │ │ Value                 │                              │   │
│  │  └──────────┘ └───────────────────────┘                              │   │
│  │                                                                       │   │
│  │  Status                                                               │   │
│  │  ○ Active   ● Inactive                                               │   │
│  │                                                                       │   │
│  │  ──────────────────────────────────────────────────────────────────   │   │
│  │                                                                       │   │
│  │  Listeners                                          [+ Add Listener]  │   │
│  │                                                                       │   │
│  │  ┌─ Listener #1 ─────────────────────────────────────────────[🗑]─┐  │   │
│  │  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │  │   │
│  │  │  │ Name *      │ │ Port *      │ │ Protocol *  │              │  │   │
│  │  │  │ http        │ │ 80          │ │ HTTP      ▼ │              │  │   │
│  │  │  └─────────────┘ └─────────────┘ └─────────────┘              │  │   │
│  │  │                                                                │  │   │
│  │  │  Hostname (optional)                                           │  │   │
│  │  │  ┌───────────────────────────────────────────────────────────┐│  │   │
│  │  │  │ api.example.com                                            ││  │   │
│  │  │  └───────────────────────────────────────────────────────────┘│  │   │
│  │  │  Only process traffic for this hostname. Wildcards supported.  │  │   │
│  │  └────────────────────────────────────────────────────────────────┘  │   │
│  │                                                                       │   │
│  │                                           [ Cancel ]  [ Create ]      │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 4. Acceptance Criteria
- [ ] Gateway name is required and follows RFC 1123 DNS label rules
- [ ] GatewayClass can be selected (default: envoy-gateway)
- [ ] Labels can be dynamically added/removed
- [ ] Status (Active/Inactive) can be selected
- [ ] Listeners can be dynamically added/removed
- [ ] At least one Listener is required (validation works)
- [ ] Duplicate Listener ports show error message
- [ ] Protocol (HTTP/HTTPS/TCP/TLS) can be selected
- [ ] Hostname can be optionally entered
- [ ] "Create" button calls API
- [ ] Success navigates to detail page
- [ ] Failure shows error toast
- [ ] "Cancel" returns to list page

## 5. Reference Files
- `web/src/features/service/create-service/` - Create form pattern
- `web/src/features/route/create-route/` - Form with dynamic fields
- `web/src/shared/components/label-input.tsx` - Label input component

## 6. Notes
- TLS configuration UI is Post-MVP; MVP uses basic structure only
- useFieldArray manages Listener array
- Default Listener "http" (80/HTTP) is pre-added
- Controller component used for Select in useFieldArray
