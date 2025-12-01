# Story 31.2: Frontend Tenant Type 정리

**Epic**: EPIC-031 - Tenant Type과 Role 시스템 정리
**Priority**: P0
**Status**: Not Started
**Estimate**: Medium

## User Story

**As a** Frontend Developer
**I want** to update all frontend components to only use `provider` and `customer` Tenant Types
**So that** the UI reflects the simplified business model and prevents invalid type selections

## Context

현재 프론트엔드 코드베이스에는 4가지 Tenant Type (`personal`, `provider`, `customer`, `organization`)이 정의되어 있지만, 백엔드 정리 후에는 `provider`와 `customer` 두 가지만 사용해야 합니다.

영향받는 컴포넌트:
- Tenant Type 선택 Form/Dropdown
- Tenant 관리 페이지
- Type별 조건부 렌더링 로직
- Type 상수 및 유틸리티 함수

## Acceptance Criteria

### AC1: Type 정의 업데이트
**Given** 프론트엔드 TypeScript 타입 정의가 존재할 때
**When** TenantType을 업데이트하면
**Then** `"provider" | "customer"` 두 가지 타입만 허용되어야 함
**And** 모든 관련 파일에서 타입 에러가 발생하지 않아야 함

### AC2: Form Validation 업데이트
**Given** Tenant 생성/수정 Form이 존재할 때
**When** Type 선택 드롭다운을 렌더링하면
**Then** `provider`와 `customer` 옵션만 표시되어야 함
**And** Form validation이 두 타입만 허용해야 함

### AC3: 조건부 렌더링 로직 정리
**Given** Type에 따라 다른 UI를 표시하는 컴포넌트가 있을 때
**When** Type을 체크하면
**Then** `personal`과 `organization` 관련 분기가 제거되어야 함
**And** `provider`와 `customer` 분기만 유지되어야 함

### AC4: 상수 및 유틸리티 함수 업데이트
**Given** Tenant Type 관련 상수/함수가 있을 때
**When** 상수를 업데이트하면
**Then** `TENANT_TYPES` 배열에 두 가지 타입만 포함되어야 함
**And** Type 변환/포맷팅 함수가 두 타입만 처리해야 함

## Tasks

- [ ] `web/src/entities/operator-tenant/model/types.ts` TenantType 정의 업데이트
- [ ] `web/src/shared/constants/tenant.ts` 상수 업데이트 (또는 생성)
- [ ] Tenant 생성 Form 컴포넌트 업데이트
- [ ] Tenant 수정 Form 컴포넌트 업데이트
- [ ] Tenant Type 드롭다운/선택 컴포넌트 업데이트
- [ ] Type별 조건부 렌더링 로직 검색 및 정리
- [ ] Type 관련 유틸리티 함수 업데이트 (getTenantTypeLabel 등)
- [ ] TanStack Query hooks에서 Type 관련 타입 에러 수정
- [ ] Zod Schema에서 Type validation 업데이트
- [ ] Storybook stories 업데이트 (있는 경우)
- [ ] Type 관련 모든 TODO/FIXME 주석 정리

## Implementation Files

### Frontend (TypeScript/React)
- `web/src/entities/operator-tenant/model/types.ts` - Tenant Type 정의
- `web/src/shared/constants/tenant.ts` - Tenant 관련 상수 (생성 필요)
- `web/src/features/operator-tenant-create/` - Tenant 생성 Feature
- `web/src/features/operator-tenant-edit/` - Tenant 수정 Feature
- `web/src/widgets/operator-tenant-form/` - Tenant Form Widget (있는 경우)
- `web/src/entities/operator-tenant/api/` - API hooks (TanStack Query)

### UI Components
- Provider Portal: `web/app/provider/` (영향 최소)
- Customer Portal: `web/app/customer/` (영향 최소)
- Operator Portal: `web/app/operator/tenants/` (주요 영향)

## Dependencies

**Prerequisite**: None (독립적으로 시작 가능)

**Blocks**:
- Story 31.4 (Database Migration 실행) - Frontend 타입 정리 후 Migration 실행 권장

**Parallel Execution Possible With**:
- Story 31.1 (Backend Tenant Type 정리)
- Story 31.3 (Customer Portal Workspace Switcher)

## Technical Notes

### Type 정의 예시
```typescript
// web/src/entities/operator-tenant/model/types.ts
export type TenantType = "provider" | "customer";

export const TENANT_TYPES = ["provider", "customer"] as const;
```

### 상수 파일 예시
```typescript
// web/src/shared/constants/tenant.ts
export const TENANT_TYPE = {
  PROVIDER: "provider",
  CUSTOMER: "customer",
} as const;

export const TENANT_TYPE_LABELS: Record<TenantType, string> = {
  provider: "공급자",
  customer: "고객",
};

export const TENANT_TYPE_OPTIONS = [
  { value: "provider", label: "공급자" },
  { value: "customer", label: "고객" },
] as const;
```

### Zod Schema 예시
```typescript
// web/src/features/operator-tenant-create/model/schema.ts
import { z } from "zod";

export const tenantFormSchema = z.object({
  name: z.string().min(1, "테넌트 이름은 필수입니다"),
  type: z.enum(["provider", "customer"], {
    errorMap: () => ({ message: "공급자 또는 고객을 선택해주세요" }),
  }),
  slug: z.string().min(1, "슬러그는 필수입니다"),
  status: z.enum(["active", "inactive"]),
});
```

### Form 컴포넌트 예시
```typescript
// web/src/features/operator-tenant-create/ui/tenant-type-select.tsx
import { TENANT_TYPE_OPTIONS } from "@/shared/constants/tenant";

export function TenantTypeSelect() {
  return (
    <Select name="type">
      <SelectTrigger>
        <SelectValue placeholder="테넌트 타입 선택" />
      </SelectTrigger>
      <SelectContent>
        {TENANT_TYPE_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

## Test Plan

1. **Type Checking**:
   - `npm run type-check` 실행하여 TypeScript 에러 없음 확인
   - 모든 TenantType 사용처에서 타입 안정성 확인

2. **Component Tests**:
   - Tenant 생성 Form 렌더링 테스트
   - Type 드롭다운에 두 옵션만 표시되는지 확인
   - Form 제출 시 validation 테스트

3. **Integration Tests**:
   - Operator Portal에서 Tenant 생성 플로우 E2E 테스트
   - Tenant 수정 플로우 E2E 테스트

4. **Manual Testing**:
   - Provider Portal에서 Tenant 관련 UI 정상 동작 확인
   - Customer Portal에서 Tenant 관련 UI 정상 동작 확인
   - Operator Portal에서 Tenant CRUD 정상 동작 확인

## Files to Search/Update

검색 패턴으로 영향받는 파일 찾기:
```bash
# Type 정의 사용처 찾기
grep -r "TenantType" web/src/

# personal/organization 문자열 찾기
grep -r "personal\|organization" web/src/ --include="*.ts" --include="*.tsx"

# Type 조건부 로직 찾기
grep -r "type === \"personal\"" web/src/
grep -r "type === \"organization\"" web/src/
```

## Definition of Done

- [ ] `TenantType`이 `"provider" | "customer"`로 정의됨
- [ ] 모든 Tenant Form에서 두 가지 옵션만 표시
- [ ] `personal`, `organization` 관련 조건부 로직 모두 제거
- [ ] TypeScript 타입 체크 통과 (`npm run type-check`)
- [ ] ESLint 검사 통과
- [ ] 모든 Component Test 통과
- [ ] E2E Test 통과 (Tenant CRUD)
- [ ] Code Review 완료
- [ ] Story 31.4 실행 가능 상태 (Frontend 준비 완료)
