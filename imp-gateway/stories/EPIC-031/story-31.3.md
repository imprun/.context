# Story 31.3: Customer Portal Workspace Switcher 추가

**Epic**: EPIC-031 - Tenant Type과 Role 시스템 정리
**Priority**: P0
**Status**: Not Started
**Estimate**: Small

## User Story

**As a** Customer Portal 사용자
**I want** to switch between multiple customer tenants easily
**So that** I can manage multiple customer workspaces without navigating to different pages

## Context

현재 Provider Portal에는 Workspace Switcher가 구현되어 있지만, Customer Portal에는 없습니다. Customer도 여러 tenant에 속할 수 있는 멀티테넌시 모델이므로, Customer Portal에도 동일한 Workspace Switcher가 필요합니다.

**현재 상태**:
- Provider Portal (`web/src/widgets/layout/provider-sidebar.tsx`): ✅ Workspace Switcher 있음
- Customer Portal (`web/src/widgets/layout/consumer-sidebar.tsx`): ❌ Workspace Switcher 없음
- Operator Portal (`web/src/widgets/layout/operator-sidebar.tsx`): ✅ 올바르게 없음 (시스템 관리자)

## Acceptance Criteria

### AC1: Workspace Switcher UI 추가
**Given** Customer Portal sidebar가 렌더링될 때
**When** 사용자가 sidebar를 확인하면
**Then** 현재 workspace 이름과 전환 버튼이 표시되어야 함
**And** Provider Portal의 Workspace Switcher와 동일한 UI/UX여야 함

### AC2: Workspace 목록 표시
**Given** 사용자가 여러 customer tenant에 속해 있을 때
**When** Workspace Switcher를 클릭하면
**Then** 사용자가 속한 모든 customer tenant 목록이 표시되어야 함
**And** 현재 활성 workspace가 시각적으로 구분되어야 함

### AC3: Workspace 전환 기능
**Given** Workspace 목록이 표시되었을 때
**When** 사용자가 다른 workspace를 선택하면
**Then** 선택한 workspace로 context가 전환되어야 함
**And** URL이 새 workspace slug를 반영해야 함
**And** 페이지가 새로고침되거나 필요한 데이터가 refetch되어야 함

### AC4: 로딩 및 에러 처리
**Given** Workspace 데이터를 가져올 때
**When** 로딩 중이거나 에러가 발생하면
**Then** 적절한 로딩 표시 또는 에러 메시지가 표시되어야 함
**And** 에러 시에도 기본 sidebar 기능은 유지되어야 함

## Tasks

- [ ] `web/src/widgets/layout/consumer-sidebar.tsx` 파일 읽기
- [ ] `web/src/widgets/layout/provider-sidebar.tsx`에서 Workspace Switcher 구현 참조
- [ ] `useWorkspaces` hook 또는 workspace 관련 API hook 확인
- [ ] `consumer-sidebar.tsx`에 Workspace Switcher 컴포넌트 추가
- [ ] Workspace 전환 로직 구현 (`switchWorkspace` 함수)
- [ ] 현재 workspace 표시 로직 추가
- [ ] 로딩 상태 처리
- [ ] 에러 상태 처리
- [ ] UI 스타일링 (Provider Portal과 일관성 유지)
- [ ] Component Test 작성
- [ ] E2E Test 작성 (여러 tenant가 있는 사용자 시나리오)

## Implementation Files

### Frontend (TypeScript/React)
- `web/src/widgets/layout/consumer-sidebar.tsx` - Customer Portal Sidebar (메인 수정 파일)
- `web/src/widgets/layout/provider-sidebar.tsx` - Provider Portal Sidebar (참조)
- `web/src/shared/api/workspace.ts` - Workspace API hooks (참조/수정)
- `web/src/shared/lib/workspace.ts` - Workspace 유틸리티 (참조/수정)

### Related Hooks/APIs
- `useWorkspaces` - 사용자가 속한 workspace 목록 가져오기
- `useCurrentWorkspace` - 현재 활성 workspace 가져오기
- `useSwitchWorkspace` - Workspace 전환 mutation

## Dependencies

**Prerequisite**: None (독립적으로 시작 가능)

**Blocks**: None

**Parallel Execution Possible With**:
- Story 31.1 (Backend Tenant Type 정리)
- Story 31.2 (Frontend Tenant Type 정리)
- Story 31.4 (Database Migration 실행)

## Technical Notes

### Provider Sidebar 참조 코드 위치
```typescript
// web/src/widgets/layout/provider-sidebar.tsx (참조용)
const { data: workspaces, isLoading: workspacesLoading } = useWorkspaces();
const { data: currentWorkspace } = useCurrentWorkspace();

const handleWorkspaceChange = (workspace: Workspace) => {
  if (workspace.slug !== currentWorkspace?.slug) {
    switchWorkspace(workspace);
  }
};
```

### 구현 예시 (Consumer Sidebar에 추가)
```typescript
// web/src/widgets/layout/consumer-sidebar.tsx
"use client";

import { SidebarMenu, SidebarMenuItem } from "@/shared/components/ui/sidebar";
import { useWorkspaces, useCurrentWorkspace, useSwitchWorkspace } from "@/shared/api/workspace";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function ConsumerSidebar() {
  const { data: workspaces, isLoading: workspacesLoading } = useWorkspaces();
  const { data: currentWorkspace } = useCurrentWorkspace();
  const { mutate: switchWorkspace } = useSwitchWorkspace();

  const handleWorkspaceChange = (workspace: Workspace) => {
    if (workspace.slug !== currentWorkspace?.slug) {
      switchWorkspace(workspace);
    }
  };

  return (
    <Sidebar>
      <SidebarHeader>
        {/* Workspace Switcher */}
        {workspacesLoading ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <WorkspaceSwitcher
            workspaces={workspaces ?? []}
            currentWorkspace={currentWorkspace}
            onWorkspaceChange={handleWorkspaceChange}
          />
        )}
      </SidebarHeader>

      {/* ... 기존 sidebar content ... */}
    </Sidebar>
  );
}
```

### Workspace Switcher 컴포넌트 재사용
Provider Portal에서 이미 Workspace Switcher 컴포넌트가 구현되어 있다면, 이를 공유 컴포넌트로 추출하여 재사용:

```typescript
// web/src/shared/components/workspace-switcher.tsx (새로 생성)
export function WorkspaceSwitcher({
  workspaces,
  currentWorkspace,
  onWorkspaceChange,
}: WorkspaceSwitcherProps) {
  // Provider sidebar에서 추출한 로직
}
```

## Test Plan

1. **Component Tests**:
   - Workspace Switcher가 렌더링되는지 확인
   - Workspace 목록이 올바르게 표시되는지 확인
   - 현재 workspace가 하이라이트되는지 확인
   - 로딩 상태가 올바르게 표시되는지 확인

2. **Integration Tests**:
   - Workspace 전환 시 API가 호출되는지 확인
   - Workspace 전환 후 URL이 변경되는지 확인
   - Workspace 전환 후 데이터가 refetch되는지 확인

3. **E2E Tests**:
   - 여러 customer tenant에 속한 사용자로 로그인
   - Customer Portal에서 Workspace Switcher 확인
   - Workspace 전환 후 올바른 데이터 표시 확인

4. **Manual Testing**:
   - 단일 customer tenant 사용자: Switcher 표시 확인
   - 여러 customer tenant 사용자: Switcher로 전환 가능 확인
   - Provider Portal과 UI 일관성 확인

## Definition of Done

- [ ] Customer Portal Sidebar에 Workspace Switcher 추가됨
- [ ] Workspace 목록이 올바르게 표시됨
- [ ] Workspace 전환 기능이 정상 작동함
- [ ] 로딩 및 에러 상태가 적절히 처리됨
- [ ] Provider Portal과 UI/UX 일관성 유지
- [ ] Component Test 작성 및 통과
- [ ] E2E Test 작성 및 통과
- [ ] Code Review 완료
- [ ] 사용자 매뉴얼/문서 업데이트 (필요 시)

## Notes

- Provider Portal의 Workspace Switcher 구현을 최대한 참조하여 일관성 유지
- Workspace Switcher 컴포넌트를 공유 컴포넌트로 추출하면 코드 중복 제거 가능
- Customer Portal의 다른 페이지들도 workspace context를 올바르게 사용하는지 확인 필요
