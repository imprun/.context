# Story 26.2: 불변성 트리거 및 인덱스 설정

## 개요

| 항목 | 내용 |
|------|------|
| **Story ID** | 26.2 |
| **Epic** | EPIC-026 (System Audit Logs) |
| **제목** | 불변성 트리거 및 인덱스 설정 |
| **예상 기간** | 0.25일 |
| **우선순위** | P2 |
| **상태** | 🔲 미시작 |
| **담당** | Backend |
| **의존성** | Story 26.1 |
| **GitHub Issue** | [#25](https://github.com/imprun/imp-gateway/issues/25) |

## 목표

Audit Log의 불변성을 보장하는 DB 트리거와 조회 성능을 위한 인덱스를 설정한다.

## 구현 범위

### 불변성 트리거 (UPDATE/DELETE 방지)

```sql
-- PostgreSQL: UPDATE/DELETE 방지 트리거
CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit logs cannot be modified or deleted';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_log_immutable
    BEFORE UPDATE OR DELETE ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION prevent_audit_log_modification();
```

### 인덱스 설정

```sql
-- 조회 성능을 위한 인덱스
CREATE INDEX idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_portal ON audit_logs(portal);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_resource_id ON audit_logs(resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- 복합 인덱스 (자주 사용되는 필터 조합)
CREATE INDEX idx_audit_logs_portal_action ON audit_logs(portal, action);
CREATE INDEX idx_audit_logs_tenant_created ON audit_logs(tenant_id, created_at DESC);
```

### 마이그레이션 파일

`services/imprun-server/internal/database/migrations/` 에 마이그레이션 파일 생성:

```
YYYYMMDDHHMMSS_create_audit_log_trigger.sql
```

또는 GORM의 `db.Exec()`를 사용하여 초기화 시 실행.

## 구현 방법

### 옵션 1: SQL 마이그레이션 파일

별도 SQL 파일로 관리하여 `migrate` 도구 사용

### 옵션 2: GORM Exec (권장)

AutoMigrate 후 트리거/인덱스 생성:

```go
func SetupAuditLogConstraints(db *gorm.DB) error {
    // 트리거 생성 (이미 존재하면 무시)
    triggerSQL := `
    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_log_immutable') THEN
            CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
            RETURNS TRIGGER AS $func$
            BEGIN
                RAISE EXCEPTION 'Audit logs cannot be modified or deleted';
            END;
            $func$ LANGUAGE plpgsql;

            CREATE TRIGGER audit_log_immutable
                BEFORE UPDATE OR DELETE ON audit_logs
                FOR EACH ROW
                EXECUTE FUNCTION prevent_audit_log_modification();
        END IF;
    END
    $$;
    `
    return db.Exec(triggerSQL).Error
}
```

## 수용 기준

- [ ] UPDATE 쿼리 실행 시 에러가 발생해야 한다
- [ ] DELETE 쿼리 실행 시 에러가 발생해야 한다
- [ ] INSERT는 정상 동작해야 한다
- [ ] 인덱스가 생성되어 조회 성능이 확보되어야 한다
- [ ] 서버 재시작 시 트리거가 중복 생성되지 않아야 한다

## 테스트

```go
func TestAuditLogImmutability(t *testing.T) {
    // INSERT 성공
    log := models.AuditLog{...}
    err := db.Create(&log).Error
    assert.NoError(t, err)

    // UPDATE 실패
    err = db.Model(&log).Update("action", "MODIFIED").Error
    assert.Error(t, err)
    assert.Contains(t, err.Error(), "cannot be modified")

    // DELETE 실패
    err = db.Delete(&log).Error
    assert.Error(t, err)
    assert.Contains(t, err.Error(), "cannot be modified")
}
```

## 참조

- [EPIC-026 보안 요구사항](../../epics/EPIC-026-audit-logs.md#보안-요구사항)
