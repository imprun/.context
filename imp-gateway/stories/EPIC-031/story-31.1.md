# Story 31.1: Backend Tenant Type 정리

**Epic**: EPIC-031 - Tenant Type과 Role 시스템 정리
**Priority**: P0
**Status**: Not Started
**Estimate**: Medium

## User Story

**As a** Backend Developer
**I want** to clean up Tenant Type definitions to only support `provider` and `customer`
**So that** the system reflects the true business model without redundant types

## Context

현재 백엔드에는 4가지 Tenant Type이 정의되어 있지만 (`personal`, `provider`, `customer`, `organization`), 실제로는 `provider`와 `customer` 두 가지만 필요합니다. 이는 B2B API Marketplace 비즈니스 모델에 맞지 않는 불필요한 복잡성을 야기하고 있습니다.

`personal` 타입은 회원가입 후 tenant가 없는 상태를 방지하기 위해 성급하게 추가되었으며, `organization` 타입은 사용되지 않고 있습니다.

## Acceptance Criteria

### AC1: Type 상수 정의 업데이트
**Given** 백엔드 코드베이스에 Tenant Type 상수가 정의되어 있을 때
**When** Type 정의를 업데이트하면
**Then** `provider`와 `customer` 두 가지 타입만 허용되어야 함
**And** 모든 관련 상수 및 enum이 업데이트되어야 함

### AC2: Validation 로직 업데이트
**Given** Tenant 생성/수정 API가 존재할 때
**When** Type validation을 수행하면
**Then** `provider` 또는 `customer`만 허용되어야 함
**And** 다른 타입 입력 시 명확한 에러 메시지를 반환해야 함

### AC3: 회원가입 시 기본 Tenant 생성 로직 수정
**Given** 사용자가 회원가입을 완료했을 때
**When** 기본 Tenant가 자동 생성되면
**Then** Type이 `customer`로 설정되어야 함
**And** Tenant Name이 적절하게 생성되어야 함
**And** 사용자가 해당 Tenant의 `owner` role을 가져야 함

### AC4: Database Migration 준비
**Given** 기존 데이터에 `personal`과 `organization` 타입이 존재할 때
**When** Migration 스크립트를 작성하면
**Then** `personal` → `customer` 변환 로직이 포함되어야 함
**And** `organization` → `customer` 변환 로직이 포함되어야 함
**And** 변환 전후 데이터 검증 로직이 포함되어야 함

## Tasks

- [ ] `internal/data/models/models.go`의 Tenant Type 관련 주석 및 validation 업데이트
- [ ] Tenant Type 상수 정의 파일 생성 또는 업데이트 (예: `internal/constants/tenant.go`)
- [ ] `internal/data/repo/user_repo.go`의 `CreatePersonalTenantForUser` 함수를 `CreateDefaultCustomerTenant`로 이름 변경
- [ ] 기본 Tenant Type을 `customer`로 변경
- [ ] Tenant 생성 API Handler의 Type validation 로직 업데이트
- [ ] Tenant 수정 API Handler의 Type validation 로직 업데이트
- [ ] Database Migration 스크립트 작성 (`migrations/` 디렉토리)
- [ ] Migration 스크립트에 Rollback 로직 포함
- [ ] Unit Test 업데이트 (Tenant creation, validation)
- [ ] Integration Test 업데이트 (회원가입 플로우)

## Implementation Files

### Backend (Go)
- `services/imprun-server/internal/data/models/models.go` - Tenant model definition
- `services/imprun-server/internal/data/repo/user_repo.go` - User repository (CreatePersonalTenantForUser)
- `services/imprun-server/internal/data/repo/tenant_repo.go` - Tenant repository
- `services/imprun-server/internal/constants/tenant.go` - Tenant Type 상수 (생성 필요)
- `services/imprun-server/internal/app/handlers/tenant_handler.go` - Tenant CRUD handlers
- `services/imprun-server/migrations/` - Database migration scripts

### Tests
- `services/imprun-server/internal/data/repo/user_repo_test.go`
- `services/imprun-server/internal/data/repo/tenant_repo_test.go`
- `services/imprun-server/internal/app/handlers/tenant_handler_test.go`

## Dependencies

**Prerequisite**: None (독립적으로 시작 가능)

**Blocks**:
- Story 31.4 (Database Migration 실행) - Migration 스크립트가 준비되어야 실행 가능

**Parallel Execution Possible With**:
- Story 31.2 (Frontend Tenant Type 정리)
- Story 31.3 (Customer Portal Workspace Switcher)

## Technical Notes

### Type 정의 예시
```go
// internal/constants/tenant.go
package constants

const (
    TenantTypeProvider = "provider"
    TenantTypeCustomer = "customer"
)

var ValidTenantTypes = []string{
    TenantTypeProvider,
    TenantTypeCustomer,
}
```

### Validation 예시
```go
func ValidateTenantType(tenantType string) error {
    for _, valid := range constants.ValidTenantTypes {
        if tenantType == valid {
            return nil
        }
    }
    return fmt.Errorf("invalid tenant type: %s (allowed: provider, customer)", tenantType)
}
```

### Migration 스크립트 예시
```sql
-- migrations/YYYYMMDDHHMMSS_cleanup_tenant_types.up.sql
BEGIN;

-- Update personal to customer
UPDATE tenants
SET type = 'customer'
WHERE type = 'personal';

-- Update organization to customer
UPDATE tenants
SET type = 'customer'
WHERE type = 'organization';

-- Add constraint to only allow provider/customer
ALTER TABLE tenants
DROP CONSTRAINT IF EXISTS tenants_type_check;

ALTER TABLE tenants
ADD CONSTRAINT tenants_type_check
CHECK (type IN ('provider', 'customer'));

COMMIT;
```

## Test Plan

1. **Unit Tests**:
   - Tenant Type validation 함수 테스트
   - CreateDefaultCustomerTenant 함수 테스트
   - 잘못된 Type 입력 시 에러 반환 테스트

2. **Integration Tests**:
   - 회원가입 → 기본 customer tenant 생성 확인
   - Tenant 생성 API → Type validation 확인
   - Tenant 수정 API → Type validation 확인

3. **Migration Tests**:
   - Migration 실행 전후 데이터 일관성 확인
   - Rollback 스크립트 동작 확인

## Definition of Done

- [ ] Backend Type 정의가 `provider`, `customer` 두 가지만 포함
- [ ] 회원가입 시 `customer` 타입 Tenant 자동 생성
- [ ] Tenant API에서 다른 Type 입력 시 적절한 에러 반환
- [ ] Database Migration 스크립트 작성 완료 (up/down)
- [ ] 모든 Unit Test 통과
- [ ] 모든 Integration Test 통과
- [ ] Code Review 완료
- [ ] Story 31.4 실행 가능 상태 (Migration 준비 완료)
