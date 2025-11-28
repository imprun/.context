# STORY-18.4: Gateway Detail Page

## 1. Overview
**Epic**: EPIC-018 Gateway Template Management
**Title**: Gateway Detail Page Implementation
**Assignee**: AI Agent
**Status**: 🔲 Not Started
**Estimate**: 1 day
**Dependencies**: STORY-18.1

## 2. Purpose
Implement a detail page to view Gateway template information and its Listeners. Provide Edit/Delete buttons for navigation to respective features.

## 3. Implementation Details

### 3.1. Route Structure
```
web/app/provider/gateways/[id]/
└── page.tsx                 # -> GatewayDetailPage
```

### 3.2. Page Component
**Path**: `web/src/pages/provider/gateway-detail-page.tsx`

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2, Network, Calendar, Tag } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Separator } from "@/shared/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { useGateway, GatewayStatusBadge } from "@/entities/gateway";
import { DeleteGatewayDialog } from "@/features/gateway";
import { PageContainer } from "@/widgets/layout/page-container";

interface GatewayDetailPageProps {
  gatewayId: string;
}

export function GatewayDetailPage({ gatewayId }: GatewayDetailPageProps) {
  const router = useRouter();
  const { data: gateway, isLoading, error } = useGateway(gatewayId);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-48 w-full" />
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

  const labels = gateway.labels || {};
  const listeners = gateway.listeners || [];

  return (
    <PageContainer
      title={
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild className="-ml-2">
            <Link href="/provider/gateways">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Network className="h-5 w-5 text-muted-foreground" />
          <span>{gateway.name}</span>
          <GatewayStatusBadge status={gateway.status} />
        </div>
      }
      description="Gateway template details"
      action={
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/provider/gateways/${gateway.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Gateway configuration details</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <dt className="text-sm text-muted-foreground">Gateway Class</dt>
                <dd className="font-medium">
                  {gateway.gateway_class || "envoy-gateway"}
                </dd>
              </div>
              <div className="space-y-1">
                <dt className="text-sm text-muted-foreground">Status</dt>
                <dd>
                  <GatewayStatusBadge status={gateway.status} />
                </dd>
              </div>
              <div className="space-y-1">
                <dt className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Created
                </dt>
                <dd className="font-medium">
                  {new Date(gateway.created_at).toLocaleString()}
                </dd>
              </div>
              <div className="space-y-1">
                <dt className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Updated
                </dt>
                <dd className="font-medium">
                  {new Date(gateway.updated_at).toLocaleString()}
                </dd>
              </div>
            </dl>

            {/* Labels */}
            {Object.keys(labels).length > 0 && (
              <>
                <Separator className="my-6" />
                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Labels
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(labels).map(([key, value]) => (
                      <Badge key={key} variant="secondary">
                        {key}: {value}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Listeners */}
        <Card>
          <CardHeader>
            <CardTitle>Listeners ({listeners.length})</CardTitle>
            <CardDescription>
              Port and protocol configuration for this Gateway
            </CardDescription>
          </CardHeader>
          <CardContent>
            {listeners.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No listeners configured
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Port</TableHead>
                    <TableHead>Protocol</TableHead>
                    <TableHead>Hostname</TableHead>
                    <TableHead>TLS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listeners.map((listener) => (
                    <TableRow key={listener.name}>
                      <TableCell className="font-medium">{listener.name}</TableCell>
                      <TableCell>{listener.port}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{listener.protocol}</Badge>
                      </TableCell>
                      <TableCell>
                        {listener.hostname || (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {listener.tls ? (
                          <Badge variant="secondary">{listener.tls.mode}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* ProductPublish Usage (Implemented in EPIC-019) */}
        <Card>
          <CardHeader>
            <CardTitle>Deployment Status</CardTitle>
            <CardDescription>
              ProductPublish instances using this Gateway
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>ProductPublish feature coming soon</p>
              <p className="text-xs mt-1">(EPIC-019)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <DeleteGatewayDialog
        gateway={gateway}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onSuccess={() => router.push("/provider/gateways")}
      />
    </PageContainer>
  );
}
```

### 3.3. App Router Page
**Path**: `web/app/provider/gateways/[id]/page.tsx`

```tsx
import { GatewayDetailPage } from "@/pages/provider/gateway-detail-page";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <GatewayDetailPage gatewayId={id} />;
}
```

### 3.4. Page Export Update
**Path**: `web/src/pages/provider/index.ts`

```typescript
// ... existing exports

// Gateways (EPIC-018)
export { GatewaysPage } from "./gateways-page";
export { GatewayCreatePage } from "./gateway-create-page";
export { GatewayDetailPage } from "./gateway-detail-page";
```

### 3.5. UI Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ← 🌐 api-gateway                             ● Active    [Edit]  [Delete]  │
│      Gateway template details                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─ Basic Information ──────────────────────────────────────────────────┐   │
│  │  Gateway configuration details                                        │   │
│  │                                                                       │   │
│  │  Gateway Class              Status                                    │   │
│  │  envoy-gateway              ● Active                                  │   │
│  │                                                                       │   │
│  │  📅 Created                 📅 Updated                                │   │
│  │  2024-01-15 10:30:00        2024-01-20 14:45:00                       │   │
│  │                                                                       │   │
│  │  ─────────────────────────────────────────────────────────────────    │   │
│  │                                                                       │   │
│  │  🏷️ Labels                                                            │   │
│  │  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐       │   │
│  │  │ env: prod        │ │ tier: external   │ │ team: platform   │       │   │
│  │  └──────────────────┘ └──────────────────┘ └──────────────────┘       │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─ Listeners (2) ───────────────────────────────────────────────────────┐  │
│  │  Port and protocol configuration for this Gateway                      │  │
│  │                                                                        │  │
│  │  ┌──────────┬──────┬──────────┬─────────────────────┬─────────────┐   │  │
│  │  │ Name     │ Port │ Protocol │ Hostname            │ TLS         │   │  │
│  │  ├──────────┼──────┼──────────┼─────────────────────┼─────────────┤   │  │
│  │  │ http     │ 80   │ HTTP     │ api.example.com     │ -           │   │  │
│  │  │ https    │ 443  │ HTTPS    │ api.example.com     │ Terminate   │   │  │
│  │  └──────────┴──────┴──────────┴─────────────────────┴─────────────┘   │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─ Deployment Status ───────────────────────────────────────────────────┐  │
│  │  ProductPublish instances using this Gateway                           │  │
│  │                                                                        │  │
│  │                ProductPublish feature coming soon                      │  │
│  │                              (EPIC-019)                                │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 4. Acceptance Criteria
- [ ] Gateway basic info (name, GatewayClass, status, created/updated) is displayed
- [ ] Labels are displayed as Badges
- [ ] Listeners are displayed in table format
- [ ] Listener table columns: Name, Port, Protocol, Hostname, TLS
- [ ] TLS mode (Terminate/Passthrough) is displayed when TLS is configured
- [ ] "Edit" button navigates to edit page
- [ ] "Delete" button opens confirmation dialog
- [ ] Appropriate error message is displayed for non-existent Gateway
- [ ] Loading skeleton is displayed during fetch
- [ ] ProductPublish section shows EPIC-019 placeholder message

## 5. Reference Files
- `web/src/pages/provider/service-detail-page.tsx` - Detail page pattern
- `web/src/widgets/layout/page-container.tsx` - PageContainer component

## 6. Notes
- ProductPublish list will be implemented in EPIC-019
- TLS detailed info display is Post-MVP
- Delete dialog is implemented in STORY-18.5
