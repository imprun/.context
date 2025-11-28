# Story 26.1: Audit Log DB 스키마 및 모델 정의

## 개요

| 항목 | 내용 |
|------|------|
| **Story ID** | 26.1 |
| **Epic** | EPIC-026 (System Audit Logs) |
| **제목** | Audit Log DB 스키마 및 모델 정의 |
| **예상 기간** | 0.5일 |
| **우선순위** | P2 |
| **상태** | 🔲 미시작 |
| **담당** | Backend |
| **GitHub Issue** | [#24](https://github.com/imprun/imp-gateway/issues/24) |

## 목표

Audit Log를 저장하기 위한 DB 스키마와 Go 모델을 정의한다.

## 구현 범위

### 파일 구조

```
services/imprun-server/internal/
├── models/
│   └── audit_log.go          # AuditLog 모델
└── database/
    └── migrations/           # (필요시) 마이그레이션 파일
```

### Go 모델 정의 (`models/audit_log.go`)

```go
package models

import (
    "time"
    "github.com/google/uuid"
    "gorm.io/datatypes"
)

type AuditLog struct {
    ID uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`

    // Tenant 정보 (멀티테넌트 지원)
    TenantID   *uuid.UUID `gorm:"type:uuid;index"`
    TenantName string

    // Actor 정보
    ActorID    uuid.UUID `gorm:"type:uuid;index"`
    ActorName  string
    ActorEmail string
    ActorRole  string

    // Action 정보
    Action string `gorm:"index"` // CREATE, UPDATE, DELETE, DEPLOY, LOGIN, LOGOUT
    Portal string `gorm:"index"` // operator, provider, consumer, admin

    // Resource 정보
    ResourceType string    `gorm:"index"`
    ResourceID   uuid.UUID `gorm:"type:uuid;index"`
    ResourceName string

    // Request 정보
    IPAddress     string
    UserAgent     string
    RequestMethod string
    RequestPath   string

    // 변경 내용 (JSON)
    Details datatypes.JSON

    // Metadata
    CreatedAt time.Time `gorm:"index;autoCreateTime"`
}

func (AuditLog) TableName() string {
    return "audit_logs"
}
```

### DB 스키마 (참고용)

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Tenant 정보
    tenant_id UUID,
    tenant_name VARCHAR(255),

    -- Actor 정보
    actor_id UUID NOT NULL,
    actor_name VARCHAR(255) NOT NULL,
    actor_email VARCHAR(255),
    actor_role VARCHAR(100),

    -- Action 정보
    action VARCHAR(50) NOT NULL,
    portal VARCHAR(50) NOT NULL,

    -- Resource 정보
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID NOT NULL,
    resource_name VARCHAR(255),

    -- Request 정보
    ip_address VARCHAR(45),
    user_agent TEXT,
    request_method VARCHAR(10),
    request_path TEXT,

    -- 변경 내용
    details JSONB,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스는 Story 26.2에서 생성
```

### AutoMigrate 등록

`database/database.go`의 AutoMigrate 목록에 `AuditLog` 추가:

```go
db.AutoMigrate(
    // ... existing models ...
    &models.AuditLog{},
)
```

## 수용 기준

- [ ] `AuditLog` Go 모델이 정의되어야 한다
- [ ] 모든 필수 필드가 포함되어야 한다 (tenant_id, actor_*, action, portal, resource_*, details, created_at)
- [ ] GORM AutoMigrate로 테이블이 생성되어야 한다
- [ ] Details 필드가 JSONB 타입으로 저장되어야 한다

## 참조

- [EPIC-026 데이터 모델](../../epics/EPIC-026-audit-logs.md#데이터-모델)
