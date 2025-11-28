# Story 26.3: Audit Middleware 구현 (자동 로깅)

## 개요

| 항목 | 내용 |
|------|------|
| **Story ID** | 26.3 |
| **Epic** | EPIC-026 (System Audit Logs) |
| **제목** | Audit Middleware 구현 (자동 로깅) |
| **예상 기간** | 1.5일 |
| **우선순위** | P2 |
| **상태** | 🔲 미시작 |
| **담당** | Backend |
| **의존성** | Story 26.1, 26.2 |

## 목표

모든 포털의 API 요청(POST/PUT/PATCH/DELETE)을 자동으로 Audit Log에 기록하는 Gin Middleware를 구현한다.

## 구현 범위

### 파일 구조

```
services/imprun-server/internal/
├── middleware/
│   └── audit.go              # Audit Middleware
├── services/
│   └── audit_service.go      # Audit Log 저장 서비스
└── api/
    └── v1/
        └── router.go         # Middleware 등록
```

### Audit Middleware (`middleware/audit.go`)

```go
package middleware

import (
    "bytes"
    "io"
    "github.com/gin-gonic/gin"
)

type AuditMiddleware struct {
    auditService *services.AuditService
}

func NewAuditMiddleware(auditService *services.AuditService) *AuditMiddleware {
    return &AuditMiddleware{auditService: auditService}
}

func (m *AuditMiddleware) Handle() gin.HandlerFunc {
    return func(c *gin.Context) {
        // GET 요청은 감사 대상 아님
        if c.Request.Method == "GET" {
            c.Next()
            return
        }

        // Request Body 캡처 (Before)
        var requestBody []byte
        if c.Request.Body != nil {
            requestBody, _ = io.ReadAll(c.Request.Body)
            c.Request.Body = io.NopCloser(bytes.NewBuffer(requestBody))
        }

        // Response Writer 래핑 (After 캡처용)
        rw := &responseWriter{ResponseWriter: c.Writer, body: &bytes.Buffer{}}
        c.Writer = rw

        // 요청 처리
        c.Next()

        // 비동기로 Audit Log 저장
        go m.auditService.LogAsync(AuditLogInput{
            Context:      c,
            RequestBody:  requestBody,
            ResponseBody: rw.body.Bytes(),
            StatusCode:   rw.statusCode,
        })
    }
}

type responseWriter struct {
    gin.ResponseWriter
    body       *bytes.Buffer
    statusCode int
}

func (rw *responseWriter) Write(b []byte) (int, error) {
    rw.body.Write(b)
    return rw.ResponseWriter.Write(b)
}

func (rw *responseWriter) WriteHeader(code int) {
    rw.statusCode = code
    rw.ResponseWriter.WriteHeader(code)
}
```

### Audit Service (`services/audit_service.go`)

```go
package services

import (
    "context"
    "encoding/json"
    "github.com/gin-gonic/gin"
    "gorm.io/gorm"
)

type AuditService struct {
    db       *gorm.DB
    logChan  chan *models.AuditLog
}

func NewAuditService(db *gorm.DB) *AuditService {
    s := &AuditService{
        db:      db,
        logChan: make(chan *models.AuditLog, 1000), // 버퍼링
    }
    go s.processLogs() // 백그라운드 워커
    return s
}

func (s *AuditService) LogAsync(input AuditLogInput) {
    log := s.buildAuditLog(input)
    if log != nil {
        select {
        case s.logChan <- log:
        default:
            // 채널이 가득 차면 동기 저장
            s.db.Create(log)
        }
    }
}

func (s *AuditService) processLogs() {
    for log := range s.logChan {
        s.db.Create(log)
    }
}

func (s *AuditService) buildAuditLog(input AuditLogInput) *models.AuditLog {
    c := input.Context

    // 실패한 요청은 기록하지 않음 (선택)
    if input.StatusCode >= 400 {
        return nil
    }

    // Actor 정보 추출 (JWT Claims에서)
    claims := c.MustGet("claims").(*auth.Claims)

    // Portal 추출 (URL 경로에서)
    portal := extractPortal(c.Request.URL.Path)

    // Resource 정보 추출
    resourceType, resourceID := extractResource(c)

    // Action 결정
    action := determineAction(c.Request.Method, c.Request.URL.Path)

    // Details 구성
    details := map[string]interface{}{
        "request":  json.RawMessage(input.RequestBody),
        "response": json.RawMessage(input.ResponseBody),
    }

    return &models.AuditLog{
        TenantID:      claims.TenantID,
        TenantName:    claims.TenantName,
        ActorID:       claims.UserID,
        ActorName:     claims.Name,
        ActorEmail:    claims.Email,
        ActorRole:     claims.Role,
        Action:        action,
        Portal:        portal,
        ResourceType:  resourceType,
        ResourceID:    resourceID,
        ResourceName:  extractResourceName(input.ResponseBody),
        IPAddress:     c.ClientIP(),
        UserAgent:     c.Request.UserAgent(),
        RequestMethod: c.Request.Method,
        RequestPath:   c.Request.URL.Path,
        Details:       datatypes.JSON(mustMarshal(details)),
    }
}

func extractPortal(path string) string {
    // /api/v1/operator/... -> operator
    // /api/v1/provider/... -> provider
    parts := strings.Split(path, "/")
    if len(parts) >= 4 {
        return parts[3]
    }
    return "unknown"
}

func determineAction(method, path string) string {
    switch method {
    case "POST":
        if strings.Contains(path, "publish") {
            return "PUBLISH"
        }
        return "CREATE"
    case "PUT", "PATCH":
        return "UPDATE"
    case "DELETE":
        return "DELETE"
    default:
        return method
    }
}
```

### Middleware 등록 (`api/v1/router.go`)

```go
func SetupRoutes(r *gin.Engine, ...) {
    auditMiddleware := middleware.NewAuditMiddleware(auditService)

    // 모든 API에 적용
    api := r.Group("/api/v1")
    api.Use(auditMiddleware.Handle())

    // ... 라우트 등록
}
```

## 감사 대상 API

| Method | 감사 여부 | Action |
|--------|----------|--------|
| GET | ❌ | - |
| POST | ✅ | CREATE / PUBLISH |
| PUT | ✅ | UPDATE |
| PATCH | ✅ | UPDATE |
| DELETE | ✅ | DELETE |

## 비기능 요구사항

- **비동기 처리**: goroutine + channel로 API 응답 시간에 영향 없음
- **버퍼링**: 1000개 버퍼로 burst 처리
- **Fallback**: 버퍼 초과 시 동기 저장

## 수용 기준

- [ ] POST/PUT/PATCH/DELETE 요청이 자동으로 기록되어야 한다
- [ ] GET 요청은 기록되지 않아야 한다
- [ ] API 응답 시간이 Audit 로깅으로 인해 증가하지 않아야 한다
- [ ] Actor 정보가 JWT Claims에서 정확히 추출되어야 한다
- [ ] Portal 정보가 URL 경로에서 정확히 추출되어야 한다
- [ ] Request/Response Body가 Details에 저장되어야 한다

## 참조

- [EPIC-026 감사 대상 작업](../../epics/EPIC-026-audit-logs.md#감사-대상-작업)
