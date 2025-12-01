**Note**: 한국어로 답변하고, 간결하게 진행하세요.

---

새로운 EPIC 문서를 작성합니다. Serena Memory와 기존 분석을 바탕으로 EPIC을 생성합니다.

**💡 대화 맥락 유지**: 이 명령어를 호출하기 전에 이미 대화를 나눴다면, 그 맥락을 유지하면서 EPIC을 작성합니다. 새로운 대화로 시작하지 마세요.

---

## 사용 예시

### 예시 1: 대화 맥락이 있는 경우 ✅

```
사용자: "Tenant별 사용량 제한 기능이 필요해. PostgreSQL로 구현하고,
        Keycloak의 custom attribute를 활용하는 게 좋을 것 같아."

AI: "좋습니다. PostgreSQL 기반으로 tenant quota 관리하고,
     Keycloak custom attribute 연동하는 방식으로 진행하겠습니다..."

[여러 대화 진행...]

사용자: "/create-epic"

AI: "이전 대화를 정리하면:
     - 요구사항: Tenant별 사용량 제한 (quota) 기능
     - 기술 스택: PostgreSQL, Keycloak custom attribute
     - 제약사항: 실시간 모니터링 필요, 기존 tenant 영향 없어야 함

     이 내용을 바탕으로 EPIC을 작성하겠습니다.

     추가 확인:
     1. 우선순위는 P0/P1/P2 중 어느 것인가요?
     2. GitHub Issue가 있나요?"
```

### 예시 2: 새로운 대화로 시작 ⭐

```
사용자: "/create-epic"

AI: "새로운 EPIC을 작성하겠습니다.

     1. 어떤 기능을 구현하고 싶으신가요?
     2. 참고 문서가 있나요?
     3. 목표와 제약사항은?"
```

## 1단계: 대화 맥락 확인

### 기존 대화 맥락이 있는 경우

**AI 에이전트가 먼저 확인할 사항**:

1. **이전 대화에서 이미 논의된 내용이 있는지 확인**
   - 이미 기능 요구사항을 논의했는가?
   - 이미 아키텍처나 기술 스택을 논의했는가?
   - 이미 분석 문서를 참고했는가?

2. **맥락이 있다면 요약 먼저 제시**
   ```
   이전 대화를 정리하면:
   - [기능 요구사항 요약]
   - [기술적 결정사항 요약]
   - [참고 문서 요약]

   이 내용을 바탕으로 EPIC을 작성하겠습니다.
   추가로 확인할 사항이 있으면 말씀해주세요.
   ```

3. **부족한 정보만 질문**
   - 이미 논의된 내용은 다시 묻지 않기
   - EPIC 작성에 필요한 누락 정보만 추가 질문

### 새로운 대화로 시작하는 경우

**AI 에이전트 작업**:
1. Serena memories에서 현재 시스템 상태 파악
2. `.context/archive/{프로젝트}/serena-*.md` 최신 스냅샷 확인 (있는 경우)
3. 배경 지식으로 활용

**개발자에게 질문**:

1. **어떤 기능을 구현하고 싶으신가요?** (간단한 설명)
2. **참고 문서가 있나요?**
   - 분석 문서: `.context/archive/[분석].md`
   - GitHub Issue: Issue 번호
   - 참고 레포: URL
3. **목표와 제약사항**
   - 이번 EPIC에서 꼭 달성해야 할 것
   - 이번 EPIC의 범위 밖인 것

---

## 2단계: EPIC 번호 할당

### 자동 번호 결정

```bash
# 기존 EPIC 확인
ls .context/imp-gateway/epics/EPIC-*.md | tail -1
# → EPIC-030-*.md 발견

# 다음 번호: EPIC-031
```

**GitHub Issue 연동**:
- GitHub Issue가 있으면: Issue 번호와 일치 추천
- 없으면: 순차 번호 할당

**예시**:
- GitHub Issue #35 있음 → `EPIC-035-feature-name.md` 생성
- Issue 없음 → `EPIC-031-feature-name.md` 생성 (순차)

---

## 3단계: EPIC 문서 작성

### 파일 생성

**경로**: `.context/imp-gateway/epics/EPIC-[번호]-[기능명].md`

**파일명 규칙**:
- `EPIC-031-tenant-user-management.md`
- `EPIC-032-audit-logs.md`
- 영문 소문자, 하이픈으로 구분

### 필수 섹션

#### 1. 제목 및 메타데이터

```markdown
# EPIC-031: Tenant & User Management

**Status**: 🏗️ In Progress
**Priority**: P0 / P1 / P2
**Owner**: [이름 or TBD]
**Created**: YYYY-MM-DD
**GitHub Issue**: [#35](https://github.com/org/repo/issues/35) (있는 경우)

---
```

#### 2. Background (배경)

**이전 대화 맥락과 Serena Memory를 모두 활용**:

```markdown
## Background

### 현재 시스템 상태
> 💡 **이전 대화 맥락**: [이미 논의된 현재 상태 요약]
> 💡 **Serena Memory 기반**: `.serena/memories/project-overview.md` 참조

[Serena가 파악한 현재 시스템 상태 + 대화에서 확인된 내용]
- 현재 인증: JWT 기반, Keycloak 연동
- 사용자 모델: 단일 테넌트
- 제약사항: 멀티테넌시 미지원

### 문제점

[현재 시스템의 문제점 또는 부족한 점]
- 이전 대화에서 논의된 문제점 포함
- Serena Memory에서 파악된 제약사항 포함

### 관련 분석

[참고 문서 링크]
- [대화에서 언급된 분석 문서]
- [Keycloak 분석](../archive/keycloak-analysis.md)
- [GitHub Issue #35](https://github.com/org/repo/issues/35)
```

**💡 팁**:
- 이전 대화에서 이미 시스템 상태를 논의했다면, 그 내용을 우선 활용
- Serena Memory는 보완적 정보로 사용
- 대화와 Memory가 충돌하면 사용자에게 확인 요청

#### 3. Motivation (동기)

```markdown
## Motivation

**As a** System Administrator,
**I want** multi-tenant user management,
**So that** multiple organizations can use the platform independently.

### 기대 효과

- 고객사별 격리된 사용자 관리
- SaaS 비즈니스 모델 지원
- 운영 비용 절감 (인스턴스당 → 테넌트당)
```

#### 4. Goals & Non-Goals

```markdown
## Goals

측정 가능한 목표:
- [ ] Tenant CRUD API 구현
- [ ] User-Tenant 매핑 모델 설계
- [ ] Keycloak 멀티테넌시 통합
- [ ] Operator Portal에서 Tenant/User 관리 UI

## Non-Goals

이번 EPIC 범위 밖:
- ❌ Tenant별 과금 시스템 (EPIC-032에서 다룸)
- ❌ Tenant별 리소스 쿼터 (향후 EPIC)
- ❌ 기존 사용자 마이그레이션 (수동 스크립트로 대응)
```

#### 5. User Flow Diagram (Mermaid)

**중요**: 사용자 흐름을 시각화하여 개발자가 쉽게 이해할 수 있도록 합니다.

```markdown
## User Flow Diagram

### Tenant 생성 흐름

\`\`\`mermaid
flowchart TD
    Start([Operator 로그인]):::darkNode --> Dashboard[Dashboard 접근]:::darkNode
    Dashboard --> TenantList[Tenant 목록 페이지]:::darkNode
    TenantList --> CreateBtn[새 Tenant 생성 버튼 클릭]:::darkNode
    CreateBtn --> Form[Tenant 정보 입력 폼]:::darkNode

    Form --> Validate{입력 검증}:::darkDecision
    Validate -->|실패| Form
    Validate -->|성공| CreateAPI[POST /v1/operator/tenants]:::darkAPI

    CreateAPI --> DBCreate[DB에 Tenant 생성]:::darkDB
    DBCreate --> KeycloakCreate[Keycloak Realm 생성]:::darkExternal

    KeycloakCreate --> Success{성공?}:::darkDecision
    Success -->|실패| Rollback[DB Rollback]:::darkError
    Rollback --> ErrorMsg[에러 메시지 표시]:::darkError
    Success -->|성공| Complete[Tenant 생성 완료]:::darkSuccess
    Complete --> TenantDetail[Tenant 상세 페이지로 이동]:::darkNode

    classDef darkNode fill:#2d2d2d,stroke:#4a9eff,stroke-width:2px,color:#e0e0e0
    classDef darkDecision fill:#2d2d2d,stroke:#ffb86c,stroke-width:2px,color:#e0e0e0
    classDef darkAPI fill:#1e3a5f,stroke:#4a9eff,stroke-width:2px,color:#e0e0e0
    classDef darkDB fill:#2d1e3a,stroke:#bd93f9,stroke-width:2px,color:#e0e0e0
    classDef darkExternal fill:#3a2d1e,stroke:#50fa7b,stroke-width:2px,color:#e0e0e0
    classDef darkSuccess fill:#1e3a2d,stroke:#50fa7b,stroke-width:3px,color:#e0e0e0
    classDef darkError fill:#3a1e1e,stroke:#ff5555,stroke-width:2px,color:#e0e0e0
\`\`\`

### User 추가 흐름

\`\`\`mermaid
flowchart TD
    Start([Tenant 상세 페이지]):::darkNode --> UserTab[Users 탭 선택]:::darkNode
    UserTab --> UserList[해당 Tenant의 User 목록]:::darkNode
    UserList --> AddBtn[Add User 버튼]:::darkNode

    AddBtn --> UserForm[User 정보 입력]:::darkNode
    UserForm --> ValidateUser{검증}:::darkDecision
    ValidateUser -->|실패| UserForm
    ValidateUser -->|성공| CreateUserAPI[POST /v1/operator/tenants/:id/users]:::darkAPI

    CreateUserAPI --> KeycloakUser[Keycloak에 User 생성]:::darkExternal
    KeycloakUser --> DBUser[DB에 User 레코드 생성]:::darkDB
    DBUser --> SendEmail[환영 이메일 발송]:::darkExternal
    SendEmail --> Done[User 추가 완료]:::darkSuccess

    classDef darkNode fill:#2d2d2d,stroke:#4a9eff,stroke-width:2px,color:#e0e0e0
    classDef darkDecision fill:#2d2d2d,stroke:#ffb86c,stroke-width:2px,color:#e0e0e0
    classDef darkAPI fill:#1e3a5f,stroke:#4a9eff,stroke-width:2px,color:#e0e0e0
    classDef darkDB fill:#2d1e3a,stroke:#bd93f9,stroke-width:2px,color:#e0e0e0
    classDef darkExternal fill:#3a2d1e,stroke:#50fa7b,stroke-width:2px,color:#e0e0e0
    classDef darkSuccess fill:#1e3a2d,stroke:#50fa7b,stroke-width:3px,color:#e0e0e0
\`\`\`
```

**다크 테마 색상 가이드**:
- `darkNode`: 일반 단계 (회색 배경, 파란 테두리)
- `darkDecision`: 의사결정 (회색 배경, 주황 테두리)
- `darkAPI`: API 호출 (진한 파란 배경, 파란 테두리)
- `darkDB`: 데이터베이스 (진한 보라 배경, 보라 테두리)
- `darkExternal`: 외부 시스템 (진한 초록 배경, 초록 테두리)
- `darkSuccess`: 성공 상태 (진한 초록 배경, 두꺼운 초록 테두리)
- `darkError`: 에러 상태 (진한 빨강 배경, 빨강 테두리)

#### 6. System Architecture Diagram (선택)

복잡한 시스템 변경이 있을 경우 아키텍처 다이어그램 추가:

```markdown
## System Architecture

\`\`\`mermaid
graph TB
    subgraph Frontend["🖥️ Frontend (React)"]
        OperatorUI[Operator Portal]:::darkNode
        TenantPages[Tenant Management Pages]:::darkNode
        UserPages[User Management Pages]:::darkNode
    end

    subgraph Backend["⚙️ Backend (Go)"]
        API[API Server]:::darkAPI
        TenantService[Tenant Service]:::darkNode
        UserService[User Service]:::darkNode
        AuthMiddleware[Auth Middleware]:::darkNode
    end

    subgraph Database["💾 Database"]
        PostgreSQL[(PostgreSQL)]:::darkDB
        TenantsTable[tenants 테이블]:::darkDB
        UsersTable[users 테이블]:::darkDB
    end

    subgraph External["🌐 External Systems"]
        Keycloak[Keycloak]:::darkExternal
        EmailService[Email Service]:::darkExternal
    end

    OperatorUI --> TenantPages
    OperatorUI --> UserPages
    TenantPages --> API
    UserPages --> API

    API --> AuthMiddleware
    AuthMiddleware --> TenantService
    AuthMiddleware --> UserService

    TenantService --> PostgreSQL
    UserService --> PostgreSQL
    PostgreSQL --> TenantsTable
    PostgreSQL --> UsersTable

    TenantService --> Keycloak
    UserService --> Keycloak
    UserService --> EmailService

    classDef darkNode fill:#2d2d2d,stroke:#4a9eff,stroke-width:2px,color:#e0e0e0
    classDef darkAPI fill:#1e3a5f,stroke:#4a9eff,stroke-width:2px,color:#e0e0e0
    classDef darkDB fill:#2d1e3a,stroke:#bd93f9,stroke-width:2px,color:#e0e0e0
    classDef darkExternal fill:#3a2d1e,stroke:#50fa7b,stroke-width:2px,color:#e0e0e0
\`\`\`
```

#### 7. Data Model Diagram (선택)

데이터베이스 변경이 있을 경우:

```markdown
## Data Model

\`\`\`mermaid
erDiagram
    Tenant ||--o{ User : has
    Tenant ||--o{ Subscription : has
    User ||--o{ Role : has

    Tenant {
        uuid id PK
        string name
        string slug UK
        jsonb settings
        timestamp created_at
        timestamp updated_at
    }

    User {
        uuid id PK
        uuid tenant_id FK
        string email UK
        string keycloak_id UK
        string status
        timestamp created_at
    }

    Subscription {
        uuid id PK
        uuid tenant_id FK
        uuid plan_id FK
        string status
        timestamp expires_at
    }

    Role {
        uuid id PK
        uuid user_id FK
        string role_name
        jsonb permissions
    }
\`\`\`
```

#### 8. Implementation Details

**💡 이전 대화에서 논의된 기술적 결정사항을 우선 반영**:

```markdown
## Implementation Details

> 💡 **이전 대화 기반**: [이미 논의된 기술 스택, 아키텍처 결정사항 요약]

### Backend (Go)

**API Endpoints**:
- `POST /v1/operator/tenants` - Create tenant
- `GET /v1/operator/tenants` - List tenants
- `POST /v1/operator/tenants/{id}/users` - Add user

**Database Changes**:
- `tenants` 테이블 추가
- `users.tenant_id` 외래키 추가
- 마이그레이션: `migrations/XXX_add_tenants.sql`

**Services**:
- `services/tenant_service.go` - Tenant 비즈니스 로직
- `middleware/tenant_context.go` - 요청 컨텍스트에 Tenant 주입

### Frontend (React + TypeScript)

**Pages**:
- `/operator/tenants` - Tenant 목록
- `/operator/tenants/:id` - Tenant 상세
- `/operator/users` - User 관리

**State Management**:
- `entities/tenant/` - Tenant entity
- `features/tenant-management/` - Feature slice

### Infrastructure

- Keycloak Realm 생성 로직 추가
- Database migration 스크립트

**💡 대화에서 논의된 특별 고려사항**:
- [예: 성능 최적화 요구사항]
- [예: 보안 제약사항]
- [예: 기존 시스템과의 호환성]
```

#### 9. API Sequence Diagram (선택)

API 흐름이 복잡할 경우:

```markdown
## API Sequence

\`\`\`mermaid
sequenceDiagram
    participant UI as Operator UI
    participant API as API Server
    participant DB as PostgreSQL
    participant KC as Keycloak

    UI->>+API: POST /v1/operator/tenants<br/>{name, slug, settings}

    API->>API: Validate input
    API->>+DB: BEGIN TRANSACTION
    API->>DB: INSERT INTO tenants
    DB-->>-API: tenant_id

    API->>+KC: Create Realm (tenant_slug)
    KC-->>-API: realm_id

    alt Keycloak 생성 성공
        API->>+DB: COMMIT
        DB-->>-API: OK
        API-->>UI: 201 Created<br/>{id, name, ...}
    else Keycloak 생성 실패
        API->>+DB: ROLLBACK
        DB-->>-API: OK
        API-->>UI: 500 Error<br/>{error: "Keycloak creation failed"}
    end
\`\`\`
```

#### 10. Test Plan

```markdown
## Test Plan

### Unit Tests
- Tenant CRUD repository 테스트
- User-Tenant 매핑 검증

### Integration Tests
- Keycloak Realm 생성 E2E
- API 엔드포인트 전체 시나리오

### Manual Tests
- Operator Portal UI 동작 확인
- 멀티테넌트 격리 검증
```

### 선택 섹션 (필요 시)

```markdown
## Alternatives

**Option A**: PostgreSQL Row-Level Security 사용
- 장점: DB 레벨 격리
- 단점: 복잡도 증가

**Option B**: 별도 DB 인스턴스 (선택한 방안)
- 장점: 완전한 격리
- 단점: 운영 오버헤드

## Open Questions

- [ ] Tenant 삭제 시 데이터 보관 정책?
- [ ] Tenant당 최대 User 수 제한?
```

---

## 4단계: 작성 원칙

### 🔗 대화 맥락 최대한 활용

**AI 에이전트 주의사항**:
1. **이전 대화 내용을 최우선 활용**
   - 이미 논의된 요구사항, 기술 스택, 제약사항을 EPIC에 직접 반영
   - 사용자가 이미 말한 내용을 다시 묻지 않기
   - 대화 중 언급된 분석 문서, 코드, 이슈 등을 모두 참조에 포함

2. **맥락 요약으로 시작**
   ```
   이전 대화 내용을 정리하여 EPIC에 반영하겠습니다:
   - 요구사항: [...]
   - 기술적 결정: [...]
   - 제약사항: [...]

   추가로 필요한 정보: [...]
   ```

3. **부족한 정보만 질문**
   - EPIC 작성에 꼭 필요하지만 대화에서 빠진 내용만 추가 질문
   - 우선순위, Owner, 일정 등 메타데이터는 마지막에 확인

### ⚠️ "Merge early and iterate"

- **최소 완성**: Background, Motivation, Goals만 작성해도 OK
- **PR 먼저**: 완벽하게 작성 후 PR이 아니라, 초안 PR 후 리뷰로 개선
- **미결 표시**: 논의 중인 섹션은 `<<[UNRESOLVED]>> ... <<[/UNRESOLVED]>>` 사용
- **대화 맥락 표시**: 이전 대화에서 나온 내용은 `> 💡 **이전 대화 기반**: [...]` 로 명시

### 📝 What, not How

- **EPIC**: "무엇을 왜" (비즈니스 가치, 요구사항)
- **Story**: "구체적 What" (API 엔드포인트, UI 화면)
- **Code**: "How" (함수 이름, 라이브러리)

**잘못된 예**:
```markdown
## Implementation
- `jwt.sign()` 호출하여 토큰 생성
- `bcrypt.hash()` 로 비밀번호 해싱
```

**올바른 예**:
```markdown
## Implementation
- JWT 기반 인증 토큰 발급
- 비밀번호 안전한 해싱 (bcrypt 또는 argon2)
```

### 🎨 Mermaid 다이어그램 작성 가이드

**필수 다이어그램**:
- User Flow: 사용자 관점의 흐름 (항상 포함)
- System Architecture: 시스템 구조 변경이 있을 경우
- Data Model: DB 스키마 변경이 있을 경우
- API Sequence: 복잡한 API 흐름이 있을 경우

**다크 테마 색상 팔레트**:
```css
classDef darkNode fill:#2d2d2d,stroke:#4a9eff,stroke-width:2px,color:#e0e0e0
classDef darkDecision fill:#2d2d2d,stroke:#ffb86c,stroke-width:2px,color:#e0e0e0
classDef darkAPI fill:#1e3a5f,stroke:#4a9eff,stroke-width:2px,color:#e0e0e0
classDef darkDB fill:#2d1e3a,stroke:#bd93f9,stroke-width:2px,color:#e0e0e0
classDef darkExternal fill:#3a2d1e,stroke:#50fa7b,stroke-width:2px,color:#e0e0e0
classDef darkSuccess fill:#1e3a2d,stroke:#50fa7b,stroke-width:3px,color:#e0e0e0
classDef darkError fill:#3a1e1e,stroke:#ff5555,stroke-width:2px,color:#e0e0e0
```

**팁**:
- 노드에 이모지 사용 가능: `[🔒 Auth Middleware]`
- subgraph로 그룹핑: Frontend, Backend, Database 등
- 화살표 라벨로 설명 추가: `API -->|성공| Success`

---

## 5단계: Serena Memory 업데이트 (선택)

EPIC 작성 후 Serena에게 요약 요청:

```
Serena, 방금 작성한 EPIC-031을 분석하여 프로젝트 개요를 업데이트해주세요.
```

Serena가 자동으로 `.serena/memories/`를 업데이트하여 다음 EPIC 작성 시 참고 가능.

---

## 6단계: 결과 요약 및 다음 단계

### 생성 완료

**파일 경로**:
```
.context/imp-gateway/epics/EPIC-031-tenant-user-management.md
```

### 커밋

```bash
cd .context
git add imp-gateway/epics/EPIC-031-*.md
git commit -m "docs(imp-gateway): add EPIC-031 Tenant & User Management"
git push
```

### 다음 단계

1. **GitHub Issue 연동** (없으면):
   ```bash
   /sync-epic-to-github EPIC-031
   ```
   → GitHub Issue #31 생성, EPIC 문서 링크 자동 포함

2. **Story 분해**:
   ```bash
   /start-epic EPIC-031
   ```
   → Story 파일 생성, progress.md 초기화

3. **팀 리뷰**:
   - EPIC 문서 PR 생성
   - 팀원 리뷰 후 병합
   - 리뷰 피드백 반영하여 EPIC 개선

---

## 참고 자료

### 관련 문서 (자동 링크)

- `CLAUDE.md`: AI 에이전트 지침
- `README.md`: .context 사용법
- `serena-sync/README.md`: Serena 연동 가이드

### EPIC 템플릿

- `.context/imp-gateway/epics/template.md` (있는 경우)
- 기존 EPIC 파일 참고 (`.context/imp-gateway/epics/EPIC-*.md`)

### Serena Memories

- `.serena/memories/project-overview.md`: 전체 구조
- `.context/archive/{프로젝트}/serena-*.md`: 과거 스냅샷

### Mermaid 참고 자료

- [Mermaid 공식 문서](https://mermaid.js.org/)
- [Flowchart 가이드](https://mermaid.js.org/syntax/flowchart.html)
- [Sequence Diagram](https://mermaid.js.org/syntax/sequenceDiagram.html)
- [ER Diagram](https://mermaid.js.org/syntax/entityRelationshipDiagram.html)
