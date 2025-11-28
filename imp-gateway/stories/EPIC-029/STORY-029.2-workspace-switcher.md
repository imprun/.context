# Story 29.2: Workspace Switcher 개선

## 개요

| 항목 | 내용 |
|------|------|
| **Story ID** | 29.2 |
| **Epic** | EPIC-029 (Workspace Management) |
| **제목** | Workspace Switcher 개선 (mock → API 데이터) |
| **예상 기간** | 0.5일 |
| **우선순위** | P0 |
| **상태** | ✅ 완료 |

## 목표

하드코딩된 mock 데이터 대신 `/auth/me` API에서 가져온 실제 워크스페이스 목록을 표시한다.

## 변경 사항

### 파일 변경

| 파일 | 변경 내용 |
|------|----------|
| `widgets/layout/provider-sidebar.tsx` | mock 데이터 → `useWorkspaces()`, `useCurrentWorkspace()` 사용 |

### 주요 변경점

1. **워크스페이스 훅 사용**
   - `useWorkspaces()`: 전체 워크스페이스 목록
   - `useCurrentWorkspace()`: 현재 활성 워크스페이스

2. **워크스페이스 전환**
   - `switchWorkspace()`: sessionStorage 업데이트 + 페이지 새로고침

3. **로딩 상태 처리**
   - `Skeleton` 컴포넌트로 로딩 중 표시

4. **UI 개선**
   - 워크스페이스 타입별 아이콘 (personal: Home, provider: Building2)
   - 역할 뱃지 표시 (`WorkspaceRoleBadge`)
   - 현재 선택된 워크스페이스에 체크 아이콘

5. **네비게이션 메뉴 업데이트**
   - Settings > Team → Settings > Workspace, Members 변경

## 코드 예시

```typescript
// 워크스페이스 데이터 가져오기
const { data: workspaces, isLoading } = useWorkspaces();
const { data: currentWorkspace } = useCurrentWorkspace();

// 워크스페이스 전환
const handleWorkspaceChange = (workspace: Workspace) => {
  if (workspace.slug !== currentWorkspace?.slug) {
    switchWorkspace(workspace);
  }
};
```

## 수용 기준

- [x] 워크스페이스 드롭다운이 `/auth/me`에서 가져온 목록을 표시한다
- [x] 현재 활성 워크스페이스에 체크 아이콘이 표시된다
- [x] 워크스페이스 타입(personal/provider)에 따라 다른 아이콘을 표시한다
- [x] 워크스페이스 역할이 뱃지로 표시된다
- [x] 로딩 중일 때 스켈레톤을 표시한다
- [x] 워크스페이스 전환 시 페이지가 새로고침된다

## 변경 이력

| 날짜 | 버전 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 2025-11-28 | 1.0 | 초기 작성 및 완료 | Claude |
