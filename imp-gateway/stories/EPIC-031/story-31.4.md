# Story 31.4: Database Migration 실행

**Epic**: EPIC-031 - Tenant Type과 Role 시스템 정리
**Priority**: P0
**Status**: Not Started
**Estimate**: Small

## User Story

**As a** DevOps Engineer / Backend Developer
**I want** to safely migrate existing `personal` and `organization` tenants to `customer` type
**So that** the database reflects the simplified Tenant Type model without data loss

## Context

Story 31.1에서 작성한 Database Migration 스크립트를 실제 환경에 적용합니다. 기존 데이터 중 `personal`과 `organization` 타입의 tenant를 모두 `customer` 타입으로 변환합니다.

**Migration 목표**:
- 모든 `personal` tenant → `customer` tenant
- 모든 `organization` tenant → `customer` tenant
- Tenant Type에 CHECK constraint 추가 (provider/customer만 허용)
- Rollback 가능성 보장

## Acceptance Criteria

### AC1: Migration 사전 검증
**Given** Migration 스크립트가 준비되었을 때
**When** 사전 검증을 수행하면
**Then** 영향받는 tenant 수를 정확히 파악해야 함
**And** Migration으로 인한 데이터 손실이 없음을 확인해야 함
**And** 관련 Foreign Key 관계가 문제없음을 확인해야 함

### AC2: Migration 실행
**Given** 사전 검증이 완료되었을 때
**When** Migration을 실행하면
**Then** 모든 `personal` tenant가 `customer`로 변환되어야 함
**And** 모든 `organization` tenant가 `customer`로 변환되어야 함
**And** Transaction 내에서 실행되어 실패 시 Rollback되어야 함

### AC3: Migration 후 검증
**Given** Migration이 완료되었을 때
**When** 데이터를 검증하면
**Then** `personal` 또는 `organization` 타입의 tenant가 없어야 함
**And** 변환된 tenant 수가 예상과 일치해야 함
**And** 모든 Membership, Product 등 관련 데이터가 정상이어야 함

### AC4: Rollback 테스트
**Given** Migration Rollback 스크립트가 있을 때
**When** 테스트 환경에서 Rollback을 실행하면
**Then** 데이터가 Migration 이전 상태로 복구되어야 함
**And** CHECK constraint가 제거되어야 함

## Tasks

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

## Implementation Files

### Database Migrations
- `services/imprun-server/migrations/YYYYMMDDHHMMSS_cleanup_tenant_types.up.sql` - Migration script
- `services/imprun-server/migrations/YYYYMMDDHHMMSS_cleanup_tenant_types.down.sql` - Rollback script

### Migration Tool
- Go-migrate 또는 프로젝트에서 사용하는 Migration 도구

## Dependencies

**Prerequisite**:
- ✅ Story 31.1 (Backend Tenant Type 정리) - Migration 스크립트 작성 완료
- ✅ Story 31.2 (Frontend Tenant Type 정리) - Frontend 코드 업데이트 완료 (권장)

**Blocks**:
- Story 31.5 (문서 및 테스트) - Migration 완료 후 최종 테스트 가능

**Parallel Execution**: 불가 (순차 실행 필요)

## Technical Notes

### Migration 사전 검증 쿼리
```sql
-- 영향받는 tenant 수 확인
SELECT type, COUNT(*) as count
FROM tenants
WHERE type IN ('personal', 'organization')
GROUP BY type;

-- 영향받는 tenant 목록 (샘플)
SELECT id, name, type, status, created_at
FROM tenants
WHERE type IN ('personal', 'organization')
ORDER BY created_at DESC
LIMIT 10;

-- 관련 Membership 확인
SELECT t.type, COUNT(m.id) as membership_count
FROM tenants t
LEFT JOIN memberships m ON m.tenant_id = t.id
WHERE t.type IN ('personal', 'organization')
GROUP BY t.type;
```

### Migration 스크립트 (from Story 31.1)
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

### Rollback 스크립트
```sql
-- migrations/YYYYMMDDHHMMSS_cleanup_tenant_types.down.sql
BEGIN;

-- Remove constraint
ALTER TABLE tenants
DROP CONSTRAINT IF EXISTS tenants_type_check;

-- Note: We cannot accurately restore personal/organization types
-- This rollback is mainly for removing the constraint
-- Manual intervention may be needed to restore specific tenant types

COMMIT;
```

### Migration 후 검증 쿼리
```sql
-- Type 분포 확인
SELECT type, COUNT(*) as count
FROM tenants
GROUP BY type
ORDER BY type;

-- personal/organization 타입이 남아있는지 확인
SELECT COUNT(*) as remaining_old_types
FROM tenants
WHERE type IN ('personal', 'organization');
-- Expected: 0

-- Constraint 확인
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'tenants_type_check';
```

## Migration Execution Plan

### Phase 1: 사전 검증 (테스트 환경)
1. 테스트 DB에 최신 Production 데이터 복사
2. 사전 검증 쿼리 실행 및 결과 문서화
3. Migration 스크립트 실행
4. 검증 쿼리로 결과 확인
5. 애플리케이션 동작 테스트
6. Rollback 스크립트 실행 및 검증

### Phase 2: Production 준비
1. Production 데이터베이스 전체 백업
2. Migration 실행 계획 수립 (점검 시간 설정)
3. Rollback 계획 수립
4. 관련 팀에 Migration 일정 공지

### Phase 3: Production 실행
1. 애플리케이션 점검 모드 전환 (선택사항)
2. Production에서 사전 검증 쿼리 실행
3. Migration 스크립트 실행
4. 검증 쿼리로 결과 확인
5. 애플리케이션 재시작 (필요 시)
6. 기능 테스트 수행
7. 점검 모드 해제 (선택사항)
8. Migration 결과 문서화

## Test Plan

1. **테스트 환경 검증**:
   - [ ] Migration 실행 전 tenant 수 확인
   - [ ] Migration 실행
   - [ ] Migration 후 tenant 수 확인 (동일해야 함)
   - [ ] Type 분포 확인 (provider/customer만 존재)
   - [ ] Membership 관계 정상 확인
   - [ ] 애플리케이션 로그인/기능 테스트

2. **Rollback 검증**:
   - [ ] Rollback 스크립트 실행
   - [ ] Constraint 제거 확인
   - [ ] 데이터 일관성 확인

3. **Production 검증**:
   - [ ] 백업 완료 확인
   - [ ] Migration 실행
   - [ ] 검증 쿼리 실행
   - [ ] 애플리케이션 기능 테스트
   - [ ] 사용자 로그인 테스트
   - [ ] Tenant 생성/수정 테스트

## Risk Mitigation

1. **데이터 손실 위험**:
   - 완전한 백업 수행
   - Transaction 내 실행으로 실패 시 자동 Rollback
   - 테스트 환경에서 충분한 검증

2. **다운타임 위험**:
   - Migration은 빠르게 실행될 것으로 예상 (UPDATE 쿼리 2개)
   - 필요 시 점검 시간 설정
   - Rollback 계획 준비

3. **애플리케이션 에러 위험**:
   - Story 31.1, 31.2 완료 후 실행 (코드 준비 완료 상태)
   - 배포와 Migration 순서 조율
   - 기능 테스트 시나리오 준비

## Definition of Done

- [ ] 테스트 환경에서 Migration 성공 및 검증 완료
- [ ] Rollback 테스트 성공
- [ ] Production 데이터베이스 백업 완료
- [ ] Production에서 Migration 실행 완료
- [ ] 모든 tenant가 `provider` 또는 `customer` 타입
- [ ] CHECK constraint 정상 적용
- [ ] 애플리케이션 기능 테스트 통과
- [ ] Migration 결과 문서화 (영향받은 tenant 수, 실행 시간 등)
- [ ] Story 31.5 (문서 및 테스트) 실행 가능 상태
