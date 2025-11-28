# Story 26.4: Audit Log 조회 API + 접근 제어

## 개요

| 항목 | 내용 |
|------|------|
| **Story ID** | 26.4 |
| **Epic** | EPIC-026 (System Audit Logs) |
| **제목** | Audit Log 조회 API + 접근 제어 |
| **예상 기간** | 1일 |
| **우선순위** | P2 |
| **상태** | 🔲 미시작 |
| **담당** | Backend |
| **의존성** | Story 26.1, 26.2, 26.3 |

## 목표

Operator Portal에서 Audit Log를 조회할 수 있는 API와 system-admin 역할만 접근할 수 있는 권한 체크를 구현한다.

## 구현 범위

### 파일 구조

```
services/imprun-server/internal/
├── api/
│   └── v1/
│       └── operator/
│           └── audit_log.go      # Handler
├── services/
│   └── audit_service.go          # 조회 메서드 추가
└── middleware/
    └── role_check.go             # Role 체크 미들웨어
```

### API 엔드포인트

```
GET    /api/v1/operator/audit-logs        # 목록 조회
GET    /api/v1/operator/audit-logs/:id    # 상세 조회
```

### 목록 조회 API

#### Request

```
GET /api/v1/operator/audit-logs?portal=provider&action=DELETE&tenant_id=xxx&page=1&limit=20
```

| Parameter | Type | Description |
|-----------|------|-------------|
| portal | string | 필터: operator, provider, consumer, admin |
| action | string | 필터: CREATE, UPDATE, DELETE, DEPLOY, ... |
| resource_type | string | 필터: cluster, api_service, product, ... |
| tenant_id | uuid | 필터: 특정 Tenant |
| actor_id | uuid | 필터: 특정 Actor |
| start_date | datetime | 필터: 시작 일시 |
| end_date | datetime | 필터: 종료 일시 |
| search | string | 검색: actor_name, resource_name |
| page | int | 페이지 번호 (default: 1) |
| limit | int | 페이지 크기 (default: 20, max: 100) |

#### Response

```json
{
  "data": [
    {
      "id": "uuid",
      "tenant_id": "uuid",
      "tenant_name": "Acme Inc",
      "actor_id": "uuid",
      "actor_name": "John Doe",
      "actor_email": "john@acme.com",
      "actor_role": "api-developer",
      "action": "CREATE",
      "portal": "provider",
      "resource_type": "api_service",
      "resource_id": "uuid",
      "resource_name": "Payment API",
      "ip_address": "192.168.1.1",
      "request_method": "POST",
      "request_path": "/api/v1/provider/api-services",
      "created_at": "2025-11-28T10:30:00Z"
    }
  ],
  "meta": {
    "total": 1234,
    "page": 1,
    "limit": 20,
    "total_pages": 62
  }
}
```

### 상세 조회 API

#### Request

```
GET /api/v1/operator/audit-logs/:id
```

#### Response

```json
{
  "data": {
    "id": "uuid",
    "tenant_id": "uuid",
    "tenant_name": "Acme Inc",
    "actor_id": "uuid",
    "actor_name": "John Doe",
    "actor_email": "john@acme.com",
    "actor_role": "api-developer",
    "action": "UPDATE",
    "portal": "provider",
    "resource_type": "api_service",
    "resource_id": "uuid",
    "resource_name": "Payment API",
    "ip_address": "192.168.1.1",
    "user_agent": "Mozilla/5.0 ...",
    "request_method": "PUT",
    "request_path": "/api/v1/provider/api-services/uuid",
    "details": {
      "before": {
        "name": "Payment API",
        "status": "draft"
      },
      "after": {
        "name": "Payment API v2",
        "status": "active"
      }
    },
    "created_at": "2025-11-28T10:30:00Z"
  }
}
```

### 접근 제어

#### Role 체크 미들웨어

```go
func RequireSystemAdmin() gin.HandlerFunc {
    return func(c *gin.Context) {
        claims := c.MustGet("claims").(*auth.Claims)

        if claims.Role != "system-admin" {
            c.JSON(http.StatusForbidden, gin.H{
                "error": "Access denied. system-admin role required.",
            })
            c.Abort()
            return
        }

        c.Next()
    }
}
```

#### 라우트 등록

```go
auditGroup := operator.Group("/audit-logs")
auditGroup.Use(middleware.RequireSystemAdmin())
{
    auditGroup.GET("", handler.ListAuditLogs)
    auditGroup.GET("/:id", handler.GetAuditLog)
}
```

### Handler 구현

```go
func (h *AuditLogHandler) ListAuditLogs(c *gin.Context) {
    var filter AuditLogFilter
    if err := c.ShouldBindQuery(&filter); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    logs, total, err := h.auditService.ListAuditLogs(filter)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "data": logs,
        "meta": gin.H{
            "total":       total,
            "page":        filter.Page,
            "limit":       filter.Limit,
            "total_pages": (total + filter.Limit - 1) / filter.Limit,
        },
    })
}
```

## 수용 기준

### 기능

- [ ] 목록 조회 API가 페이지네이션을 지원해야 한다
- [ ] Portal, Action, Resource Type, Tenant로 필터링할 수 있어야 한다
- [ ] 날짜 범위로 필터링할 수 있어야 한다
- [ ] 상세 조회 시 details (before/after)가 포함되어야 한다

### 보안

- [ ] system-admin 역할만 API에 접근할 수 있어야 한다
- [ ] 다른 역할로 접근 시 403 Forbidden이 반환되어야 한다

### 성능

- [ ] 인덱스를 활용하여 대량 데이터에서도 빠른 조회가 가능해야 한다

## 참조

- [EPIC-026 백엔드 API](../../epics/EPIC-026-audit-logs.md#백엔드-api)
- [EPIC-026 접근 제어](../../epics/EPIC-026-audit-logs.md#접근-제어)
