# Story 31.5: 문서 및 종합 테스트

**Epic**: EPIC-031 - Tenant Type과 Role 시스템 정리
**Priority**: P0
**Status**: Not Started
**Estimate**: Small

## User Story

**As a** Product Owner / Technical Writer
**I want** to update all documentation to reflect the simplified Tenant Type model
**So that** developers and users understand the new system and can reference accurate documentation

## Context

EPIC-031의 모든 구현이 완료된 후, 관련 문서를 업데이트하고 전체 시스템에 대한 종합 테스트를 수행합니다. 이는 변경사항이 올바르게 적용되었음을 보장하고, 향후 유지보수를 위한 정확한 문서를 제공합니다.

## Acceptance Criteria

### AC1: 제품 문서 업데이트
**Given** PRD 및 기술 문서가 존재할 때
**When** Tenant Type 관련 내용을 업데이트하면
**Then** `provider`와 `customer` 두 타입만 명시되어야 함
**And** `personal`과 `organization` 타입이 제거되어야 함
**And** 각 타입의 목적과 사용 사례가 명확히 설명되어야 함

### AC2: 개발자 문서 업데이트
**Given** README, API 문서, Architecture 문서가 존재할 때
**When** 문서를 업데이트하면
**Then** Tenant Type 열거형이 정확히 반영되어야 함
**And** Migration 가이드가 포함되어야 함 (필요 시)
**And** 코드 예시가 업데이트되어야 함

### AC3: Serena Memory 업데이트
**Given** `.context/imp-gateway/memory/` 디렉토리의 memory 파일이 존재할 때
**When** Tenant 관련 memory를 업데이트하면
**Then** `domain_model.md`에 올바른 Tenant Type이 반영되어야 함
**And** `auth_security.md`에 Role 관련 내용이 정확해야 함

### AC4: 종합 테스트 수행
**Given** 모든 Story (31.1~31.4)가 완료되었을 때
**When** 종합 테스트를 수행하면
**Then** 모든 Portal(Provider/Customer/Operator)이 정상 동작해야 함
**And** Tenant CRUD 기능이 정상 동작해야 함
**And** Workspace Switcher가 정상 동작해야 함
**And** 회원가입 플로우가 정상 동작해야 함

## Tasks

### 문서 업데이트
- [ ] `docs/prd.md` 읽기 및 Tenant Type 관련 섹션 업데이트
- [ ] `README.md` 업데이트 (Tenant Type 설명)
- [ ] `docs/architecture.md` 업데이트 (있는 경우)
- [ ] API 문서 업데이트 (Swagger/OpenAPI 있는 경우)
- [ ] `.context/imp-gateway/memory/domain_model.md` 업데이트
- [ ] `.context/imp-gateway/memory/auth_security.md` 검토 및 업데이트 (필요 시)

### 테스트
- [ ] E2E 테스트 스크립트 업데이트 (Tenant Type 관련)
- [ ] Provider Portal 전체 기능 테스트
- [ ] Customer Portal 전체 기능 테스트 (Workspace Switcher 포함)
- [ ] Operator Portal Tenant 관리 기능 테스트
- [ ] 회원가입 → 기본 customer tenant 생성 테스트
- [ ] Tenant 생성 시 Type validation 테스트
- [ ] Tenant 수정 시 Type validation 테스트
- [ ] Cross-browser 테스트 (Chrome, Firefox, Safari)

### 최종 검증
- [ ] TypeScript 타입 체크 (`npm run type-check`)
- [ ] ESLint 검사 (`npm run lint`)
- [ ] Backend 테스트 (`go test ./...`)
- [ ] Frontend 테스트 (`npm run test`)
- [ ] Code Review 최종 점검
- [ ] EPIC-031 체크리스트 완료 확인

## Implementation Files

### Documentation
- `docs/prd.md` - Product Requirements Document
- `README.md` - Project README
- `docs/architecture.md` - Architecture documentation (있는 경우)
- `docs/api.md` - API documentation (있는 경우)
- `.context/imp-gateway/memory/domain_model.md` - Domain model memory
- `.context/imp-gateway/memory/auth_security.md` - Auth/Security memory

### Test Files
- `services/imprun-server/**/*_test.go` - Backend tests
- `web/src/**/*.test.ts(x)` - Frontend component tests
- `web/e2e/**/*.spec.ts` - E2E tests (있는 경우)

## Dependencies

**Prerequisite**:
- ✅ Story 31.1 (Backend Tenant Type 정리) 완료
- ✅ Story 31.2 (Frontend Tenant Type 정리) 완료
- ✅ Story 31.3 (Customer Portal Workspace Switcher) 완료
- ✅ Story 31.4 (Database Migration 실행) 완료

**Blocks**: None (마지막 Story)

**Parallel Execution**: 불가 (모든 Story 완료 후 실행)

## Technical Notes

### PRD 업데이트 예시
```markdown
<!-- docs/prd.md -->

## Tenant Types

Imp-Gateway는 두 가지 Tenant Type을 지원합니다:

1. **Provider (공급자)**
   - API를 개발하고 판매하는 주체
   - Product, API Definition, Deployment 관리
   - 일반적으로 기업의 내부 팀원

2. **Customer (고객)**
   - API를 구매하고 사용하는 주체
   - Subscription, Usage 관리
   - 일반적으로 외부 파트너 회사

각 사용자는 여러 Tenant에 속할 수 있으며, Provider와 Customer 역할을 동시에 수행할 수 있습니다.
```

### Domain Model Memory 업데이트 예시
```markdown
<!-- .context/imp-gateway/memory/domain_model.md -->

## Tenant

Tenant는 Imp-Gateway의 기본 격리 단위입니다.

### Attributes
- `id`: UUID
- `name`: 표시 이름
- `slug`: URL-friendly 식별자
- `type`: "provider" | "customer"
- `status`: "active" | "inactive"

### Type 설명
- **provider**: API 제공자 (판매자)
- **customer**: API 소비자 (구매자)

### 비즈니스 규칙
- 사용자는 여러 Tenant에 속할 수 있음 (Membership를 통해)
- 회원가입 시 기본 customer tenant 자동 생성
- 한 사용자가 provider와 customer 역할 동시 수행 가능
```

### 종합 테스트 체크리스트

**Provider Portal**:
- [ ] 로그인
- [ ] Workspace Switcher 동작
- [ ] Product 생성/수정/삭제
- [ ] API Definition 관리
- [ ] Deployment 관리

**Customer Portal**:
- [ ] 로그인
- [ ] Workspace Switcher 동작 (NEW!)
- [ ] Product 구독
- [ ] Usage 확인
- [ ] Billing 확인

**Operator Portal**:
- [ ] 시스템 관리자 로그인
- [ ] Tenant 목록 조회
- [ ] Tenant 생성 (provider/customer만 선택 가능)
- [ ] Tenant 수정 (Type validation)
- [ ] Tenant 삭제
- [ ] 잘못된 Type 입력 시 에러 메시지

**회원가입 플로우**:
- [ ] 새 사용자 회원가입
- [ ] 자동으로 customer tenant 생성 확인
- [ ] Tenant owner role 확인
- [ ] Customer Portal 접근 가능 확인

## Test Plan

### 1. Documentation Review
- [ ] PRD 업데이트 내용 검토
- [ ] README 업데이트 내용 검토
- [ ] Memory 파일 업데이트 내용 검토
- [ ] 문서 간 일관성 확인

### 2. Automated Tests
- [ ] Backend Unit Tests 실행 및 통과 확인
- [ ] Backend Integration Tests 실행 및 통과 확인
- [ ] Frontend Component Tests 실행 및 통과 확인
- [ ] E2E Tests 실행 및 통과 확인

### 3. Manual Functional Tests
- [ ] Provider Portal 전체 기능 테스트
- [ ] Customer Portal 전체 기능 테스트
- [ ] Operator Portal 전체 기능 테스트
- [ ] 회원가입 플로우 테스트

### 4. Regression Tests
- [ ] 기존 기능이 영향받지 않았는지 확인
- [ ] API 호환성 확인
- [ ] Database 일관성 확인

### 5. Final Checks
- [ ] TypeScript 타입 체크 통과
- [ ] ESLint 검사 통과
- [ ] 모든 TODO 완료 확인
- [ ] Code Review 최종 승인

## Definition of Done

- [ ] 모든 문서가 새로운 Tenant Type 모델을 반영함
- [ ] PRD, README, Memory 파일 업데이트 완료
- [ ] 모든 Automated Tests 통과
- [ ] Provider/Customer/Operator Portal 전체 기능 테스트 통과
- [ ] 회원가입 플로우 정상 동작 확인
- [ ] Regression Tests 통과 (기존 기능 정상)
- [ ] Code Review 최종 승인
- [ ] EPIC-031 완료 선언 가능
- [ ] progress.md에 EPIC-031 완료로 표시

## Post-Completion Tasks

EPIC-031 완료 후:
1. 팀에 변경사항 공지
2. 사용자 매뉴얼 업데이트 (필요 시)
3. Release Notes 작성
4. 모니터링 대시보드 확인 (에러율, 성능)
5. 사용자 피드백 수집 계획

## Notes

- 이 Story는 EPIC-031의 마지막 단계로, 모든 기술적 변경이 완료된 후 수행됩니다.
- 문서 업데이트와 테스트는 병렬로 진행 가능합니다.
- 종합 테스트에서 발견된 이슈는 즉시 수정하고 재테스트해야 합니다.
- EPIC 완료 후에도 모니터링을 통해 잠재적 이슈를 조기 발견해야 합니다.
