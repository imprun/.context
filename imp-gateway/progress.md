# Imp-Gateway 진행 상황

> **Single Source of Truth** - 모든 Task 완료 상태는 이 파일에서 관리합니다.

---

## 전체 진행률

| Epic | 제목 | Stories | 완료 Tasks | 전체 Tasks | 진행률 |
|------|------|---------|-----------|-----------|--------|
| EPIC-013 | Cluster Management | 6 | - | - | - |
| EPIC-014 | Agent Management | 7 | - | - | - |
| EPIC-015 | Fleet Dashboard | 4 | - | - | - |
| EPIC-016 | API Service Management | 5 | - | - | - |
| EPIC-017 | Product Management | 6 | - | - | ✅ 완료 |
| EPIC-018 | Gateway Template | 5 | - | - | - |
| EPIC-019 | ProductPublish | 7 | - | - | ✅ 완료 |
| EPIC-020 | Route & Policy | 10 | - | - | - |
| EPIC-025 | Tenant & User 관리 | - | - | - | ✅ 완료 |
| EPIC-026 | Audit Logs | 7 | - | - | ✅ 완료 |
| EPIC-027 | System Settings | - | - | - | ✅ 완료 |
| EPIC-029 | Workspace Members | 2 | - | - | - |
| EPIC-031 | Tenant Type & Role 정리 | 5 | 21 | 57 | 37% |

---

## 🏗️ In Progress

### EPIC-031: Tenant Type과 Role 시스템 정리

**목표**: Tenant Type을 `provider`와 `customer` 두 가지로 단순화하고, Customer Portal에 Workspace Switcher 추가

#### Stories 진행 상황

| Story | 제목 | 상태 | 완료 Tasks | 전체 Tasks |
|-------|------|------|-----------|-----------|
| 31.1 | Backend Tenant Type 정리 | ✅ Done | 10 | 10 |
| 31.2 | Frontend Tenant Type 정리 | ✅ Done | 11 | 11 |
| 31.3 | Customer Portal Workspace Switcher | Not Started | 0 | 11 |
| 31.4 | Database Migration 실행 | Ready | 0 | 10 |
| 31.5 | 문서 및 종합 테스트 | Not Started | 0 | 15 |

#### 전체 Task 체크리스트 (Single Source of Truth)

**Story 31.1: Backend Tenant Type 정리** (10 tasks) ✅
- [x] `internal/data/models/models.go`의 Tenant Type 관련 주석 업데이트
- [x] Tenant Type 상수 정의 파일 생성 (`internal/constants/tenant.go`)
- [x] `internal/data/repo/user_repo.go`의 `CreatePersonalTenantForUser` 함수를 `CreateDefaultCustomerTenant`로 이름 변경
- [x] 기본 Tenant Type을 `customer`로 변경 (auth.go, user_repo.go)
- [x] Tenant 생성 API Handler의 Type validation 로직 업데이트 (admin.go)
- [x] Admin API Handler 기본값을 `customer`로 변경
- [x] Database Migration 스크립트 작성 (`004_cleanup_tenant_types.up.sql`)
- [x] Migration 스크립트에 Rollback 로직 포함 (`004_cleanup_tenant_types.down.sql`)
- [x] Go 컴파일 테스트 통과
- [x] Migration 스크립트 준비 완료 (Story 31.4 실행 가능)

**Story 31.2: Frontend Tenant Type 정리** (11 tasks) ✅
- [x] `web/src/entities/operator-tenant/model/types.ts` TenantType 정의 업데이트
- [x] `web/src/shared/constants/tenant.ts` 상수 생성
- [x] `web/src/entities/operator-tenant/lib/constants.ts` TENANT_TYPES 업데이트
- [x] Tenant 생성 Form Zod Schema 업데이트
- [x] Type별 조건부 렌더링 로직 정리 (`provider-sidebar.tsx`, `workspace-avatar.tsx`, `workspace-settings-page.tsx`)
- [x] `web/src/entities/workspace/model/types.ts` WorkspaceType 정의 업데이트
- [x] Type 관련 유틸리티 함수 업데이트 (getWorkspaceIcon)
- [x] TanStack Query hooks에서 Type 관련 타입 에러 수정
- [x] Zod Schema에서 Type validation 업데이트
- [x] TypeScript 타입 체크 통과
- [x] 모든 personal/organization 참조 제거

**Story 31.3: Customer Portal Workspace Switcher** (11 tasks)
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

**Story 31.4: Database Migration 실행** (10 tasks)
- [ ] Story 31.1에서 작성한 Migration 스크립트 검토
- [ ] 테스트 환경에서 Migration 사전 검증 쿼리 실행
- [ ] 영향받는 tenant 수 확인 및 문서화
- [ ] 테스트 환경에서 Migration 실행 및 검증
- [ ] Rollback 스크립트 테스트
- [ ] Production 데이터베이스 백업
- [ ] Production에서 Migration 실행
- [ ] Migration 후 검증 쿼리 실행
- [ ] Migration 결과 문서화
- [ ] Migration 후 애플리케이션 동작 확인

**Story 31.5: 문서 및 종합 테스트** (15 tasks)
- [ ] `docs/prd.md` 읽기 및 Tenant Type 관련 섹션 업데이트
- [ ] `README.md` 업데이트 (Tenant Type 설명)
- [ ] `docs/architecture.md` 업데이트 (있는 경우)
- [ ] API 문서 업데이트 (Swagger/OpenAPI 있는 경우)
- [ ] `.context/imp-gateway/memory/domain_model.md` 업데이트
- [ ] `.context/imp-gateway/memory/auth_security.md` 검토 및 업데이트 (필요 시)
- [ ] E2E 테스트 스크립트 업데이트 (Tenant Type 관련)
- [ ] Provider Portal 전체 기능 테스트
- [ ] Customer Portal 전체 기능 테스트 (Workspace Switcher 포함)
- [ ] Operator Portal Tenant 관리 기능 테스트
- [ ] 회원가입 → 기본 customer tenant 생성 테스트
- [ ] Tenant 생성 시 Type validation 테스트
- [ ] Tenant 수정 시 Type validation 테스트
- [ ] Cross-browser 테스트 (Chrome, Firefox, Safari)
- [ ] EPIC-031 체크리스트 완료 확인

#### Dependencies

```
Story 31.1 (Backend) ──┐
                       ├──> Story 31.4 (Migration)
Story 31.2 (Frontend) ─┘

Story 31.3 (Workspace Switcher) - 독립

Story 31.1, 31.2, 31.3, 31.4 ──> Story 31.5 (문서/테스트)
```

- Story 31.1과 31.2는 병렬 실행 가능
- Story 31.3는 독립적으로 실행 가능
- Story 31.4는 31.1 완료 후 실행 (Migration 스크립트 준비 필요)
- Story 31.5는 모든 Story 완료 후 실행

#### 참조 문서
- EPIC 문서: [`.context/imp-gateway/epics/EPIC-031-tenant-role-cleanup.md`](.context/imp-gateway/epics/EPIC-031-tenant-role-cleanup.md)
- Story 파일: `.context/imp-gateway/stories/EPIC-031/story-31.{1-5}.md`

---

## ✅ 최근 완료

### EPIC-019: ProductPublish
- 2025-12-01 완료 (PR #31 머지)
- Story 19.1~19.7: Publish 엔티티, 위자드, 상세페이지, 액션, 타임라인

### EPIC-017: Product Management
- 2025-12-01 완료 (PR #31 머지)
- Story 17.1~17.6: Product API hooks, 목록/상세 페이지, 서비스 연결, 상태관리

### EPIC-027: System Settings
- 2024-11-29 완료 (커밋: `44a139f`)

### EPIC-026: Audit Logs
- 2024-11-29 완료 (커밋: `0c49896`)

### EPIC-025: Tenant & User 관리
- 2024-11-29 완료 (커밋: `91b06fd`)

---

## 일일 로그

### 2025-12-01 (월)
- EPIC-017: Product Management 전체 완료 (6 Stories)
- EPIC-019: ProductPublish 전체 완료 (7 Stories)
- PR #31 생성 및 머지
- 버그 수정: useProductPublishes 쿼리 키 메모이제이션
- **EPIC-031 시작**: Tenant Type과 Role 시스템 정리
  - EPIC 문서 작성 완료 (Background, Goals, Implementation)
  - 5개 Story 파일 생성 (31.1~31.5)
  - progress.md에 EPIC-031 섹션 추가 (전체 57개 tasks)
  - **Story 31.2 완료**: Frontend Tenant Type 정리 (11/11 tasks)
    - TenantType: `"provider" | "customer"`로 단순화
    - 상수 파일 생성 (`tenant.ts`)
    - Form, Zod Schema, 조건부 렌더링 모두 업데이트
    - TypeScript 타입 체크 통과 ✅
  - **Story 31.1 완료**: Backend Tenant Type 정리 (10/10 tasks)
    - Tenant 상수 파일 생성 (`constants/tenant.go`)
    - `CreateDefaultCustomerTenant` 함수로 이름 변경
    - Admin API validation: `oneof=provider customer`
    - Migration 스크립트 작성 (004_cleanup_tenant_types)
    - Go 컴파일 테스트 통과 ✅

### 2024-11-29 (금)
- EPIC-025: Tenant & User 관리 구현 완료
- EPIC-026: Audit Logs 구현 완료 (infinite render loop 버그 수정 포함)
- EPIC-027: System Settings 구현 완료
- 기타: API 응답 형식 표준화, imp-agent → imprun-agent 리네이밍
- Claude 명령어 및 AGENTS.md 추가, .context 서브모듈 통합

---

## 📋 백로그

다음 작업 후보:
- EPIC-028: Usage Analytics
- EPIC-029: Workspace Members
- EPIC-030: Account Settings

---

## 📅 다음 작업

EPIC-031 Story 실행 순서:
1. Story 31.1 (Backend) + Story 31.2 (Frontend) + Story 31.3 (Workspace Switcher) - 병렬 실행 가능
2. Story 31.4 (Migration) - 31.1 완료 후 실행
3. Story 31.5 (문서/테스트) - 모든 Story 완료 후 실행

---

*마지막 업데이트: 2025-12-01*
