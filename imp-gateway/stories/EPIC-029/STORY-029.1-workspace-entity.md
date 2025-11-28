# Story 29.1: Workspace 엔티티 및 API 연동

## 개요

| 항목 | 내용 |
|------|------|
| **Story ID** | 29.1 |
| **Epic** | EPIC-029 (Workspace Management) |
| **제목** | Workspace 엔티티 및 API 연동 |
| **예상 기간** | 0.5일 |
| **우선순위** | P0 |
| **상태** | 🔄 진행중 |

## 목표

`/auth/me` API 응답을 TanStack Query로 캐싱하고, 워크스페이스 데이터를 전역에서 접근 가능하게 한다.

## 구현 범위

### 파일 구조

```
web/src/entities/workspace/
├── api/
│   └── workspace-api.ts      # API 호출 + TanStack Query hooks
├── model/
│   └── types.ts              # Workspace, WorkspaceRole 타입
├── ui/
│   ├── workspace-avatar.tsx  # 워크스페이스 아바타 (이니셜)
│   └── workspace-role-badge.tsx # 역할 뱃지
└── index.ts                  # Public exports
```

### 타입 정의 (`model/types.ts`)

```typescript
// 워크스페이스 역할
export type WorkspaceRole = 'owner' | 'admin' | 'developer' | 'viewer' | 'billing';

// 워크스페이스 타입
export type WorkspaceType = 'personal' | 'provider' | 'customer';

// 워크스페이스 (from /auth/me)
export interface Workspace {
  id: string;
  slug: string;
  name: string;
  type: WorkspaceType;
  role: WorkspaceRole;  // 현재 사용자의 역할
}

// AuthMe 응답
export interface AuthMeData {
  user: {
    id: string;
    email: string;
    display_name?: string;
    name?: string;
    username?: string;
    system_roles?: string[];
  };
  tenants: Workspace[];
  active_tenant: {
    id: string;
    slug: string;
    name: string;
  } | null;
}
```

### API Hooks (`api/workspace-api.ts`)

| Hook | 설명 |
|------|------|
| `useAuthMe()` | 현재 사용자 + 워크스페이스 목록 |
| `useWorkspaces()` | 워크스페이스 목록만 (useAuthMe에서 추출) |
| `useCurrentWorkspace()` | 현재 활성 워크스페이스 |

## 수용 기준

- [ ] `useAuthMe()` 훅이 인증된 사용자의 정보와 워크스페이스 목록을 반환한다
- [ ] 5분간 캐시하여 불필요한 API 호출을 방지한다
- [ ] `sessionStorage.active_tenant` 값을 기반으로 현재 워크스페이스를 결정한다
- [ ] 워크스페이스가 없을 때 적절한 fallback 처리를 한다
- [ ] FSD 아키텍처를 준수한다

## 기술 스택

- TanStack Query v5
- TypeScript
- React

## 변경 이력

| 날짜 | 버전 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 2025-11-28 | 1.0 | 초기 작성 | Claude |
