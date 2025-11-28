# STORY-18.2: Gateway List Page

## 1. Overview
**Epic**: EPIC-018 Gateway Template Management
**Title**: Gateway List Page Implementation
**Assignee**: AI Agent
**Status**: 🔲 Not Started
**Estimate**: 1 day
**Dependencies**: STORY-18.1

## 2. Purpose
Implement a list page where Providers can view all Gateway templates and navigate to create new ones.

## 3. Implementation Details

### 3.1. Route Structure
```
web/app/provider/gateways/
├── page.tsx                 # -> GatewaysPage
└── layout.tsx               # (optional)
```

### 3.2. Page Component
**Path**: `web/src/pages/provider/gateways-page.tsx`

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, MoreHorizontal, Trash2, Eye, Network, Sparkles, ArrowRight } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  useGateways,
  GatewayStatusBadge,
  ListenerSummary,
  type Gateway,
  type GatewayStatus,
} from "@/entities/gateway";
import { DeleteGatewayDialog } from "@/features/gateway";
import { PageContainer } from "@/widgets/layout/page-container";

export function GatewaysPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteTarget, setDeleteTarget] = useState<Gateway | null>(null);

  const { data, isLoading, error } = useGateways({
    search: search || undefined,
    status: statusFilter !== "all" ? (statusFilter as GatewayStatus) : undefined,
  });

  const gateways = data?.gateways ?? [];

  if (error) {
    return (
      <PageContainer title="Gateways" description="Manage your Gateway templates">
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-destructive">Failed to load gateways. Please try again.</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Gateways"
      description="Manage Gateway templates for API traffic routing"
      action={
        <Button asChild>
          <Link href="/provider/gateways/new">
            <Plus className="mr-2 h-4 w-4" />
            New Gateway
          </Link>
        </Button>
      }
    >
      {/* Empty State */}
      {!isLoading && gateways.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="relative mb-8">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
              <Network className="h-12 w-12 text-primary" />
            </div>
            <div className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>

          <h3 className="text-2xl font-semibold tracking-tight mb-2">
            No Gateways Yet
          </h3>
          <p className="text-muted-foreground text-center max-w-md mb-8">
            Gateways define how traffic enters your API infrastructure.
            Create your first gateway to start routing API requests.
          </p>

          <Button asChild size="lg" className="gap-2">
            <Link href="/provider/gateways/new">
              <Plus className="h-5 w-5" />
              Create Your First Gateway
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 w-full max-w-2xl">
            {[
              { title: "Listeners", desc: "Define ports and protocols" },
              { title: "Routing", desc: "Connect to API Services" },
              { title: "Deployment", desc: "Deploy via ProductPublish" },
            ].map((item) => (
              <div
                key={item.title}
                className="flex flex-col items-center p-4 rounded-lg bg-muted/50 border border-border/50"
              >
                <span className="font-medium text-sm">{item.title}</span>
                <span className="text-xs text-muted-foreground text-center mt-1">
                  {item.desc}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="flex items-center gap-4 mb-4">
            <Input
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-[200px] lg:w-[300px]"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Gateway Class</TableHead>
                  <TableHead>Listeners</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  gateways.map((gateway) => (
                    <TableRow key={gateway.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/provider/gateways/${gateway.id}`}
                          className="hover:underline"
                        >
                          {gateway.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {gateway.gateway_class || "envoy-gateway"}
                      </TableCell>
                      <TableCell>
                        <ListenerSummary listeners={gateway.listeners || []} />
                      </TableCell>
                      <TableCell>
                        <GatewayStatusBadge status={gateway.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(gateway.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/provider/gateways/${gateway.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeleteTarget(gateway)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <DeleteGatewayDialog
        gateway={deleteTarget}
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      />
    </PageContainer>
  );
}
```

### 3.3. App Router Page
**Path**: `web/app/provider/gateways/page.tsx`

```tsx
import { GatewaysPage } from "@/pages/provider/gateways-page";

export default function Page() {
  return <GatewaysPage />;
}
```

### 3.4. Sidebar Menu Update
**Path**: `web/src/widgets/layout/provider-sidebar.tsx` (modify existing)

Add Gateways menu item:
```tsx
import { Network } from "lucide-react";

// Add to provider menu items
{
  title: "Gateways",
  href: "/provider/gateways",
  icon: Network,
}
```

### 3.5. Page Export Update
**Path**: `web/src/pages/provider/index.ts`

```typescript
// ... existing exports
export { GatewaysPage } from "./gateways-page";
```

### 3.6. UI Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Gateways                                              [ + New Gateway ]    │
│  Manage Gateway templates for API traffic routing                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [Search by name...        ] [All Status ▼]                                 │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Name          │ Gateway Class  │ Listeners        │ Status │ Created │   │
│  ├───────────────┼────────────────┼──────────────────┼────────┼─────────┤   │
│  │ api-gateway   │ envoy-gateway  │ 80/HTTP,443/HTTPS│ Active │ Jan 15  │ ⋮ │
│  │ internal-gw   │ envoy-gateway  │ 8080/HTTP        │Inactive│ Jan 10  │ ⋮ │
│  └───────────────┴────────────────┴──────────────────┴────────┴─────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 4. Acceptance Criteria
- [ ] Gateway list displays in table format
- [ ] Table columns: Name, Gateway Class, Listeners, Status, Created
- [ ] Listeners show compact format (e.g., "80/HTTP, 443/HTTPS")
- [ ] Clicking gateway name navigates to detail page
- [ ] "New Gateway" button navigates to create page
- [ ] Empty state displays when no gateways exist
- [ ] Loading skeleton displays during data fetch
- [ ] Error message displays on fetch failure
- [ ] Search filter works correctly
- [ ] Status filter works correctly
- [ ] Delete action opens confirmation dialog
- [ ] "Gateways" menu item added to sidebar

## 5. Reference Files
- `web/src/pages/provider/services-page.tsx` - List page pattern
- `web/src/widgets/layout/page-container.tsx` - Page container component
- `web/src/features/service/delete-service/` - Delete dialog pattern

## 6. Notes
- Uses `PageContainer` widget for consistent layout
- Inline empty state (not separate component) following existing pattern
- Filter/search included following services-page pattern
