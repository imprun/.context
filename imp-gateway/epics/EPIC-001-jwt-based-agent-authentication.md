# EP-001: JWT 토큰 기반 Agent 인증 시스템

* Issue: TBD

## Background

Imprun Gateway는 API Gateway 설정 스냅샷을 Envoy Gateway CRD로 발행하는 Agent를 통해 동작합니다. Agent는 imprun-server에서 Gateway 설정을 가져와 Kubernetes 클러스터에 적용하는 중요한 역할을 수행합니다.

현재 Agent와 imprun-server 간 통신은 gRPC를 사용하며, **승인된 Agent만 설정 스냅샷에 접근**할 수 있도록 보안 메커니즘이 필요합니다. Agent는 특정 Gateway에 대한 권한만 가지며, 다른 Gateway의 설정에는 접근할 수 없어야 합니다.

이 문서는 JWT(JSON Web Token) 기반의 Agent 인증 시스템을 제안합니다.

## Motivation

### 보안 요구사항
1. **인증 (Authentication)**: Agent가 누구인지 확인
2. **인가 (Authorization)**: Agent가 특정 Gateway에 접근 권한이 있는지 확인
3. **재사용 방지**: 토큰 탈취 시 무한 재사용 방지
4. **토큰 갱신**: Agent 재시작 없이 토큰 업데이트
5. **토큰 폐기**: 보안 사고 시 즉시 토큰 무효화

### 기술적 동기
1. **표준 프로토콜**: gRPC 메타데이터를 활용한 표준 인증 방식
2. **운영 편의성**: 인증서 관리 복잡도 제거
3. **확장성**: 다중 Agent 관리 용이
4. **감사 추적**: 토큰 발급/갱신/폐기 이력 추적

## Goals

1. **JWT 토큰 기반 Agent 인증**: gRPC 메타데이터에 JWT 토큰 전송하여 인증
2. **이중 토큰 시스템**:
   - Install Token: 초기 설치용 일회성 토큰
   - Connection Token: 실제 연결용 영구 토큰
3. **Nonce 기반 토큰 재사용 방지**: DB에 nonce 저장하여 토큰 재사용 차단
4. **토큰 생명주기 관리**: 발급, 갱신, 폐기 전체 프로세스
5. **Gateway별 접근 제어**: Agent는 할당된 Gateway에만 접근
6. **감사 로그**: 모든 토큰 관련 이벤트 기록

## Non-Goals

1. **세밀한 권한 제어 (RBAC)**: 초기 버전에서는 Cluster 단위 접근만 관리
2. **토큰 자동 갱신**: 명시적 갱신 명령으로만 토큰 교체
3. **다중 Cluster 지원**: 1 Agent = 1 Cluster 정책 유지
4. **외부 인증 연동**: OAuth, OIDC 등 외부 인증은 향후 고려
5. **토큰 만료 시간**: 초기 버전에서는 무기한 토큰 사용 (nonce로 관리)

## Implementation Details

### 1. JWT 토큰 구조

Agent 인증에 사용되는 JWT 토큰은 다음 필드를 포함합니다:

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `sub` | string | ✅ | agentId (주체) |
| `iss` | string | ✅ | imprun-server 주소 (발행자) |
| `iat` | number | ✅ | 발행 시간 (Unix timestamp) |
| `nonce` | string | ✅ | 고유 일회용 값 (64자 hex, 32 bytes) |
| `version` | string | ✅ | 토큰 버전 "1.0.0" |
| `type` | string | ✅ | 토큰 타입: `"install"` 또는 `"connection"` |
| `clusterId` | string | ✅ | 할당된 Cluster ID |

**JWT Payload 예시**:
```json
{
  "sub": "agt_abc123",
  "iss": "api.imprun.dev",
  "iat": 1706184000,
  "nonce": "1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890",
  "version": "1.0.0",
  "type": "install",
  "clusterId": "cls_xyz789"
}
```

**토큰 타입**:
- **install**: 최초 설치 시 사용하는 일회성 토큰
  - Agent 설치 스크립트에 포함
  - 최초 연결 시 자동으로 connection 토큰으로 교체
  - DB에 nonce 저장하지 않음 (일회성)

- **connection**: 실제 연결에 사용하는 영구 토큰
  - Agent가 파일로 저장
  - DB에 nonce 저장하여 재사용 방지
  - 명시적 폐기 전까지 유효

**Nonce 역할**:
- 토큰 고유성 보장
- 토큰 재사용 공격 방지
- 토큰 폐기 메커니즘

### 2. Agent 등록 및 인증 프로세스

#### Phase 1: Agent 등록 (Web Console)

```
[User] → [Web Console] → [imprun-server]
```

1. 사용자가 Cluster에 Agent 등록 요청
2. imprun-server가 registration 토큰 생성 (웹 콘솔에서 발급, 30분 유효)
3. 사용자가 Kubernetes 클러스터에서 Agent 등록:
   ```bash
   imprun-agent register \
     --token "abc123..." \
     --cluster "cls_xyz789" \
     --server "https://api.imprun.dev" \
     --grpc "grpc.imprun.dev:443"
   ```
4. 등록 성공 시 `~/.imprun-agent/config.yaml`에 설정 저장

#### Phase 2: Agent 실행 및 gRPC 연결

```
[Agent] --gRPC--> [imprun-server]
```

1. Agent가 `imprun-agent run` 명령으로 시작
2. config.yaml에서 JWT 토큰 로드
3. gRPC 양방향 스트리밍으로 Server에 연결:
   ```protobuf
   message ConnectRequest {
     string agent_id = 1;
     string jwt_token = 2;
     string agent_version = 3;
     map<string, string> metadata = 4;  // cluster_id 포함
   }
   ```

4. Server가 토큰 검증:
   - JWT 서명 검증
   - 토큰 타입 확인 (install → connection 교체)
   - agentId와 clusterId 확인

5. Install 토큰인 경우 Connection 토큰으로 교체:
   ```protobuf
   message ReplaceTokenRequest {
     string new_connection_token = 1;
   }
   ```

#### Phase 3: 토큰 교체 및 저장

1. Agent가 새 토큰을 `config.yaml`에 저장 (atomic write)
2. Agent가 서버에 토큰 교체 완료 응답:
   ```protobuf
   message TokenReplacedResponse {
     bool success = 1;
     string error_message = 2;
   }
   ```
3. Server가 DB에 nonce 저장

#### Phase 4: 정상 운영

1. Agent가 30초 간격으로 Heartbeat 전송
2. Server가 Deploy/Revoke 등 명령 전송
3. 연결 끊김 시 5초 간격으로 자동 재연결

### 3. gRPC 메타데이터 인증

#### 메타데이터 키

gRPC 메타데이터에서 사용하는 키: `imp-agent-token`

#### Agent (Client) 측

```go
// Golang implementation
import (
    "context"
    "google.golang.org/grpc/metadata"
)

func (a *Agent) Connect(ctx context.Context) error {
    // 메타데이터에 토큰 추가
    ctx = metadata.AppendToOutgoingContext(
        ctx,
        "imp-agent-token",
        a.token,  // JWT string
    )

    // Connect RPC 호출
    stream, err := a.client.Connect(ctx, &pb.AgentInfo{
        Id:        a.id,
        Version:   a.version,
        PublicKey: a.publicKey,
    })

    if err != nil {
        return err
    }

    // Command 수신 루프
    go a.handleCommands(stream)
    return nil
}
```

#### Server 측 인증 로직

서버는 gRPC interceptor 또는 middleware를 통해 다음 단계로 토큰을 검증합니다:

**인증 흐름**:

1. **메타데이터 추출**
   - gRPC 메타데이터에서 `imp-agent-token` 키 값 읽기
   - 토큰이 없으면 `Unauthenticated` 에러 반환

2. **JWT 서명 검증**
   - JWT 라이브러리를 사용하여 토큰 서명 검증
   - 서버의 비밀키로 서명 확인
   - 만료 시간(exp) 검증 (설정된 경우)
   - 검증 실패 시 `Unauthenticated` 에러 반환

3. **Payload 파싱 및 검증**
   - JWT payload에서 `sub`, `iss`, `nonce`, `type` 필드 추출
   - `iss`가 서버 자신의 주소와 일치하는지 확인
   - `type`이 `install` 또는 `connection`인지 확인

4. **Agent 조회**
   - 데이터베이스에서 `sub`(agentId)로 Agent 레코드 조회
   - Agent가 존재하지 않으면 `NotFound` 에러 반환

5. **Nonce 검증** (connection 토큰인 경우)
   - `token.type === "connection"`이면:
     - 데이터베이스에 저장된 Agent의 nonce 값과 토큰의 nonce 비교
     - 불일치 시 `Unauthenticated` 에러 반환 (재생 공격 방지)
   - Install 토큰은 일회용이므로 nonce 검증 생략

6. **컨텍스트에 인증 정보 저장**
   - 요청 컨텍스트에 검증된 Agent 정보 저장
   - 이후 gRPC handler에서 `context.agent` 또는 `context.agentToken`으로 접근 가능

**에러 처리**:

| 에러 상황 | gRPC Status Code | 설명 |
|----------|-----------------|------|
| 토큰 누락 | `UNAUTHENTICATED` | `imp-agent-token` 메타데이터 없음 |
| 서명 검증 실패 | `UNAUTHENTICATED` | JWT 서명이 유효하지 않음 |
| Agent 없음 | `NOT_FOUND` | 해당 agentId의 Agent가 DB에 없음 |
| Nonce 불일치 | `UNAUTHENTICATED` | Connection 토큰의 nonce가 DB와 다름 |
| 기타 검증 실패 | `UNAUTHENTICATED` | JWT 파싱 오류, 필수 필드 누락 등 |

### 4. API 변경

#### REST API (Web Console ↔ imprun-server)

**1. Agent 등록**

```http
POST /v1/gateways/{gatewayId}/agents
Content-Type: application/json

Request Body:
{
  "name": "string (optional, default: agent-{random})"
}

Response: 201 Created
{
  "agentId": "string",
  "name": "string",
  "installToken": "string (JWT)",
  "installScript": "string (bash script with token embedded)",
  "createdAt": "string (ISO 8601)"
}
```

**2. Agent 목록 조회**

```http
GET /v1/gateways/{gatewayId}/agents

Response: 200 OK
{
  "agents": [
    {
      "id": "string",
      "name": "string",
      "status": "pending | connected | disconnected",
      "version": "string",
      "lastConnectedAt": "string (ISO 8601)",
      "createdAt": "string (ISO 8601)"
    }
  ]
}
```

**3. Agent 상세 조회**

```http
GET /v1/agents/{agentId}

Response: 200 OK
{
  "id": "string",
  "name": "string",
  "gatewayId": "string",
  "status": "string",
  "version": "string",
  "publicKey": "string",
  "lastConnectedAt": "string (ISO 8601)",
  "createdAt": "string (ISO 8601)",
  "token": {
    "nonce": "string (64-char hex)",
    "createdAt": "string (ISO 8601)"
  }
}
```

**4. Agent 토큰 재발급**

```http
POST /v1/agents/{agentId}/tokens/regenerate

Response: 200 OK
{
  "agentId": "string",
  "newToken": "string (JWT)"
}
```

**5. Agent 토큰 폐기** (Agent 강제 종료)

```http
POST /v1/agents/{agentId}/tokens/revoke

Response: 200 OK
{
  "success": true
}
```

**6. Agent 삭제**

```http
DELETE /v1/agents/{agentId}

Response: 200 OK
{
  "success": true
}
```

#### gRPC API (Agent ↔ imprun-server)

```protobuf
syntax = "proto3";

package imprun.agent.v1;

// Agent Service
service AgentService {
  // Agent 연결 (bidirectional stream)
  rpc Connect(AgentInfo) returns (stream AgentCommand);

  // 토큰 교체 완료 알림
  rpc TokenReplaced(Empty) returns (Empty);

  // Gateway 설정 스냅샷 가져오기
  rpc GetGatewaySnapshot(GetGatewaySnapshotRequest)
      returns (GatewaySnapshot);

  // 상태 보고
  rpc ReportStatus(AgentStatus) returns (Empty);
}

// Messages
message AgentInfo {
  string id = 1;
  string version = 2;
  string public_key = 3;  // RSA public key (PEM format)
}

message AgentCommand {
  oneof command {
    ReplaceTokenRequest replace_token = 1;
    CloseConnectionRequest close = 2;
    UpdateAgentRequest update = 3;
  }
}

message ReplaceTokenRequest {
  string token = 1;  // new JWT token
}

message CloseConnectionRequest {
  CloseReason reason = 1;
}

enum CloseReason {
  CLOSE_REASON_UNSPECIFIED = 0;
  SHUTDOWN = 1;           // graceful shutdown
  REVOKE_TOKEN = 2;       // token revoked
  UPDATE_REQUIRED = 3;    // agent update needed
}

message UpdateAgentRequest {
  string version = 1;     // target version
  string image_url = 2;   // container image
}

message GetGatewaySnapshotRequest {
  string gateway_id = 1;
}

message GatewaySnapshot {
  string gateway_id = 1;
  string version = 2;     // snapshot version
  bytes data = 3;         // serialized configuration
  int64 timestamp = 4;    // Unix timestamp
}

message AgentStatus {
  string agent_id = 1;
  string status = 2;      // "healthy", "degraded", "unhealthy"
  string message = 3;
  map<string, string> metrics = 4;
}

message Empty {}
```

### 5. 데이터 모델

#### Agent 엔티티

Agent는 Gateway에 연결되는 클라이언트를 나타냅니다.

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| `id` | UUID | ✅ | auto-generated | Agent 고유 ID |
| `name` | string | ✅ | `agent-{random}` | Agent 표시 이름 |
| `gatewayId` | UUID | ✅ | - | 소속 Gateway ID |
| `status` | AgentStatus | ✅ | `PENDING` | 현재 상태 |
| `version` | string | ❌ | null | Agent 버전 (예: "1.0.0") |
| `publicKey` | string | ❌ | null | RSA public key (PEM 형식) |
| `lastConnectedAt` | timestamp | ❌ | null | 마지막 연결 시각 |
| `createdAt` | timestamp | ✅ | now | 생성 시각 |
| `createdBy` | string | ✅ | - | 생성자 (userId) |
| `updatedAt` | timestamp | ✅ | now | 수정 시각 |

**관계**:
- `token`: AgentToken (1:1, cascade delete)
- `gateway`: Gateway (N:1, cascade delete)
- `events`: AgentEvent[] (1:N, cascade delete)

**인덱스**:
- `gatewayId` (조회 성능)
- `status` (필터링 성능)

#### AgentToken 엔티티

Agent의 현재 활성 connection 토큰 정보를 저장합니다.

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| `agentId` | UUID | ✅ | - | Agent ID (Primary Key) |
| `nonce` | string(64) | ✅ | - | 토큰의 nonce 값 (64자 hex) |
| `createdAt` | timestamp | ✅ | now | 토큰 생성 시각 |
| `createdBy` | string | ✅ | - | 토큰 발급자 (userId) |
| `updatedAt` | timestamp | ✅ | now | 토큰 갱신 시각 |

**관계**:
- `agent`: Agent (1:1, cascade delete)

**비고**:
- Install 토큰은 일회용이므로 저장하지 않음
- Connection 토큰만 DB에 저장하여 nonce 검증에 사용

#### AgentEvent 엔티티

Agent의 생명주기 이벤트를 저장합니다.

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| `id` | UUID | ✅ | auto-generated | Event 고유 ID |
| `agentId` | UUID | ✅ | - | 대상 Agent ID |
| `eventType` | AgentEventType | ✅ | - | 이벤트 타입 |
| `message` | string | ❌ | null | 이벤트 메시지 |
| `metadata` | JSON | ❌ | null | 추가 이벤트 데이터 |
| `createdAt` | timestamp | ✅ | now | 이벤트 발생 시각 |
| `createdBy` | string | ❌ | null | 이벤트 생성자 (userId or system) |

**관계**:
- `agent`: Agent (N:1, cascade delete)

**인덱스**:
- `agentId` (Agent별 이벤트 조회)
- `eventType` (이벤트 타입별 필터링)
- `createdAt` (시간순 정렬)

#### AgentStatus (Enum)

| 값 | 설명 |
|----|------|
| `PENDING` | 등록되었으나 아직 연결되지 않음 |
| `CONNECTED` | 현재 활성 연결 상태 |
| `DISCONNECTED` | 과거에 연결되었으나 현재 오프라인 |
| `REVOKED` | 토큰이 폐기됨, 재연결 불가 |

#### AgentEventType (Enum)

| 값 | 설명 |
|----|------|
| `REGISTERED` | Agent 생성 |
| `CONNECTED` | Agent 연결 |
| `DISCONNECTED` | Agent 연결 해제 |
| `TOKEN_ISSUED` | 새 토큰 발급 |
| `TOKEN_REPLACED` | 토큰 교체 성공 |
| `TOKEN_REVOKED` | 토큰 폐기 |
| `UPDATE_STARTED` | Agent 업데이트 시작 |
| `UPDATE_COMPLETED` | Agent 업데이트 완료 |
| `UPDATE_FAILED` | Agent 업데이트 실패 |
| `ERROR` | 일반 오류 |

### 6. Backend 아키텍처

이 섹션은 서버 측 구현에 필요한 컴포넌트와 비즈니스 로직을 언어 중립적으로 설명합니다.

#### 6.1 컴포넌트 구조

**AgentTokenService**: JWT 토큰 생성 및 검증
- **책임**:
  - Install/Connection 토큰 생성
  - JWT 서명 검증
  - Nonce 생성 (32 bytes = 64자 hex)
- **주요 메서드**:
  - `generateToken(agentId, gatewayId, type)`: JWT 생성 및 서명
  - `verifyToken(signedToken)`: JWT 서명 및 만료 검증
  - `decodeToken(signedToken)`: JWT payload 파싱 (검증 없이)

**AgentService**: Agent 생명주기 관리
- **책임**:
  - Agent 등록, 조회, 삭제
  - 연결 상태 관리
  - 토큰 재발급/폐기
  - 이벤트 기록
- **상태 관리**:
  - 활성 Agent의 Command Stream 관리 (in-memory map)
  - Agent 연결/해제 시 상태 업데이트

**AgentController**: gRPC 엔드포인트
- **책임**:
  - gRPC 요청 처리
  - 인증 미들웨어 적용
  - AgentService 호출 및 응답 반환

#### 6.2 핵심 비즈니스 로직

##### 1) Agent 등록 (REST API)

```
입력: gatewayId, userId, name (optional)
출력: agentId, name, installToken, installScript

로직:
1. Agent 엔티티 생성 (상태: PENDING)
2. Install 토큰 생성 (type: "install")
3. AgentEvent 기록 (REGISTERED)
4. 설치 스크립트 생성 (Kubernetes 매니페스트 포함)
5. 응답 반환
```

##### 2) Agent 연결 처리 (gRPC Connect)

```
입력: AgentInfo, JWT 토큰 (메타데이터)
출력: Command Stream (gRPC bidirectional stream)

로직:
1. JWT 토큰 검증 (gRPC interceptor에서 수행)
2. 토큰 타입 확인
   a) Install 토큰인 경우:
      - Connection 토큰 생성
      - Command Stream 생성 및 저장 (in-memory)
      - ReplaceTokenRequest 명령 전송
      - AgentEvent 기록 (CONNECTED)
      - Stream 반환
   b) Connection 토큰인 경우:
      - Nonce 검증 (DB와 비교)
      - Agent 상태 업데이트 (CONNECTED, version, publicKey, lastConnectedAt)
      - Command Stream 생성 및 저장
      - AgentEvent 기록 (CONNECTED)
      - Stream 반환
```

##### 3) 토큰 교체 완료 알림 (gRPC TokenReplaced)

```
입력: Empty (토큰은 메타데이터에서 추출)
출력: Empty

로직:
1. JWT 토큰에서 agentId, nonce 추출
2. AgentToken 엔티티 Upsert:
   - 존재하면: nonce 업데이트
   - 없으면: 새 레코드 생성
3. AgentEvent 기록 (TOKEN_REPLACED)
```

##### 4) 토큰 재발급 (REST API)

```
입력: agentId, userId
출력: newToken (JWT string)

로직:
1. Agent 조회
2. 새 Connection 토큰 생성
3. Agent가 현재 활성 상태인 경우:
   - Command Stream에 ReplaceTokenRequest 전송
4. AgentEvent 기록 (TOKEN_ISSUED)
5. 새 토큰 반환
```

##### 5) 토큰 폐기 (REST API)

```
입력: agentId, userId
출력: success

로직:
1. Agent 상태를 REVOKED로 변경
2. AgentToken 삭제 (DB)
3. Agent가 현재 활성 상태인 경우:
   - Command Stream에 CloseConnectionRequest 전송 (reason: REVOKE_TOKEN)
   - Stream 종료 및 제거
4. AgentEvent 기록 (TOKEN_REVOKED)
```

##### 6) Agent 연결 해제 처리

```
입력: agentId
출력: void

로직:
1. Agent 상태를 DISCONNECTED로 변경
2. Command Stream 제거 (in-memory)
3. AgentEvent 기록 (DISCONNECTED)
```

#### 6.3 설치 스크립트 생성

Agent 등록 시 Kubernetes 설치 스크립트를 생성하여 반환합니다.

**포함 리소스**:
- Namespace: `imprun-system`
- Secret: Install 토큰 저장
- Deployment: Agent 컨테이너 실행
- ServiceAccount + ClusterRole + ClusterRoleBinding: Kubernetes API 권한

**환경 변수**:
- `AGENT_ID`: Agent 고유 ID
- `GATEWAY_ID`: 연결할 Gateway ID
- `IMP_INSTALL_TOKEN`: Install 토큰 (Secret에서 주입)
- `IMP_SERVER_URL`: imprun-server gRPC 주소

#### 6.4 상태 관리 전략

**In-Memory State**:
- `activeAgents: Map<agentId, CommandStream>`: 현재 연결된 Agent의 Command Stream
- Agent 연결 시 추가, 연결 해제 시 제거
- 서버 재시작 시 모든 Agent가 재연결 필요

**Database State**:
- Agent 엔티티: 영구 상태 (PENDING, CONNECTED, DISCONNECTED, REVOKED)
- AgentToken 엔티티: Connection 토큰의 nonce (재생 공격 방지)
- AgentEvent 엔티티: 모든 생명주기 이벤트

**이벤트 기록**:
모든 중요 작업 시 AgentEvent 생성:
- REGISTERED, CONNECTED, DISCONNECTED
- TOKEN_ISSUED, TOKEN_REPLACED, TOKEN_REVOKED
- UPDATE_STARTED, UPDATE_COMPLETED, UPDATE_FAILED
- ERROR

### 7. Agent 구현 (Golang)

#### 디렉토리 구조

```
cmd/agent/
  main.go
pkg/agent/
  agent.go           // Agent main logic
  config/
    config.go        // Configuration
  grpc/
    client.go        // gRPC client
    connection.go    // Connection management
    handler.go       // Command handler
  token/
    store.go         // Token storage
    validator.go     // Token validation
  kubernetes/
    client.go        // K8s client
    applier.go       // CRD applier
```

#### Agent Main Logic

```go
// pkg/agent/agent.go
package agent

import (
    "context"
    "fmt"
    "time"

    "github.com/imprun/agent/pkg/agent/config"
    "github.com/imprun/agent/pkg/agent/grpc"
    "github.com/imprun/agent/pkg/agent/kubernetes"
    "github.com/imprun/agent/pkg/agent/token"
    "github.com/rs/zerolog/log"
)

type Agent struct {
    cfg         *config.Config
    tokenStore  *token.Store
    grpcClient  *grpc.Client
    k8sClient   *kubernetes.Client
}

func New(cfg *config.Config) (*Agent, error) {
    // Token Store 초기화
    tokenStore, err := token.NewStore(cfg.DataDir)
    if err != nil {
        return nil, fmt.Errorf("failed to init token store: %w", err)
    }

    // Kubernetes Client 초기화
    k8sClient, err := kubernetes.NewClient()
    if err != nil {
        return nil, fmt.Errorf("failed to init k8s client: %w", err)
    }

    return &Agent{
        cfg:        cfg,
        tokenStore: tokenStore,
        k8sClient:  k8sClient,
    }, nil
}

func (a *Agent) Run(ctx context.Context) error {
    // 토큰 로드
    agentToken, err := a.loadToken()
    if err != nil {
        return fmt.Errorf("failed to load token: %w", err)
    }

    // gRPC Client 생성
    a.grpcClient = grpc.NewClient(
        a.cfg.ServerURL,
        agentToken,
        a.tokenStore,
        a,
    )

    // 연결 시작
    log.Info().
        Str("server", a.cfg.ServerURL).
        Str("agentId", a.cfg.AgentID).
        Msg("Starting agent connection")

    return a.grpcClient.Connect(ctx)
}

func (a *Agent) loadToken() (string, error) {
    // 1. Connection 토큰 확인
    connectionToken, err := a.tokenStore.GetConnectionToken()
    if err != nil {
        return "", fmt.Errorf("failed to get connection token: %w", err)
    }

    if connectionToken != "" {
        log.Info().Msg("Using stored connection token")
        return connectionToken, nil
    }

    // 2. Install 토큰 확인
    installToken := a.cfg.InstallToken
    if installToken == "" {
        return "", fmt.Errorf("no connection token or install token found")
    }

    log.Info().Msg("Using install token for initial connection")
    return installToken, nil
}

// Command Handlers
func (a *Agent) HandleReplaceToken(token string) error {
    log.Info().Msg("Replacing agent token")

    if err := a.tokenStore.SaveConnectionToken(token); err != nil {
        return fmt.Errorf("failed to save token: %w", err)
    }

    // gRPC Client 토큰 업데이트
    a.grpcClient.UpdateToken(token)

    // 서버에 확인 전송
    if err := a.grpcClient.NotifyTokenReplaced(); err != nil {
        return fmt.Errorf("failed to notify token replacement: %w", err)
    }

    log.Info().Msg("Token replaced successfully")
    return nil
}

func (a *Agent) HandleClose(reason string) error {
    log.Info().Str("reason", reason).Msg("Connection close requested")

    if reason == "REVOKE_TOKEN" {
        // 토큰 삭제
        if err := a.tokenStore.DeleteConnectionToken(); err != nil {
            log.Error().Err(err).Msg("Failed to delete token")
        }
    }

    return nil
}

func (a *Agent) HandleUpdate(version, imageURL string) error {
    log.Info().
        Str("version", version).
        Str("image", imageURL).
        Msg("Agent update requested")

    // Self-update logic (Kubernetes Deployment update)
    return a.k8sClient.UpdateDeployment(
        "imprun-system",
        "imprun-agent",
        imageURL,
    )
}
```

#### gRPC Client

```go
// pkg/agent/grpc/client.go
package grpc

import (
    "context"
    "fmt"
    "io"
    "time"

    "google.golang.org/grpc"
    "google.golang.org/grpc/credentials/insecure"
    "google.golang.org/grpc/metadata"
    "github.com/rs/zerolog/log"

    pb "github.com/imprun/agent/proto/agent/v1"
)

const (
    MetadataKeyToken = "imp-agent-token"
    ReconnectDelay   = 5 * time.Second
)

type Client struct {
    serverURL   string
    token       string
    tokenStore  TokenStore
    agent       AgentHandler
    conn        *grpc.ClientConn
    client      pb.AgentServiceClient
}

type TokenStore interface {
    SaveConnectionToken(token string) error
    DeleteConnectionToken() error
}

type AgentHandler interface {
    HandleReplaceToken(token string) error
    HandleClose(reason string) error
    HandleUpdate(version, imageURL string) error
}

func NewClient(
    serverURL string,
    token string,
    tokenStore TokenStore,
    agent AgentHandler,
) *Client {
    return &Client{
        serverURL:  serverURL,
        token:      token,
        tokenStore: tokenStore,
        agent:      agent,
    }
}

func (c *Client) Connect(ctx context.Context) error {
    for {
        if err := c.connectOnce(ctx); err != nil {
            log.Error().Err(err).Msg("Connection failed, retrying...")

            select {
            case <-ctx.Done():
                return ctx.Err()
            case <-time.After(ReconnectDelay):
                continue
            }
        }

        // Connection closed gracefully
        return nil
    }
}

func (c *Client) connectOnce(ctx context.Context) error {
    // gRPC 연결 생성
    conn, err := grpc.Dial(
        c.serverURL,
        grpc.WithTransportCredentials(insecure.NewCredentials()),
    )
    if err != nil {
        return fmt.Errorf("failed to dial: %w", err)
    }
    defer conn.Close()

    c.conn = conn
    c.client = pb.NewAgentServiceClient(conn)

    // 메타데이터에 토큰 추가
    ctx = metadata.AppendToOutgoingContext(
        ctx,
        MetadataKeyToken,
        c.token,
    )

    // Connect RPC 호출
    stream, err := c.client.Connect(ctx, &pb.AgentInfo{
        Id:        os.Getenv("AGENT_ID"),
        Version:   version.Get(),
        PublicKey: "", // TODO: generate RSA key
    })
    if err != nil {
        return fmt.Errorf("failed to connect: %w", err)
    }

    log.Info().Msg("Connected to server")

    // Command 수신 루프
    for {
        cmd, err := stream.Recv()
        if err == io.EOF {
            log.Info().Msg("Stream closed by server")
            return nil
        }
        if err != nil {
            return fmt.Errorf("stream error: %w", err)
        }

        if err := c.handleCommand(ctx, cmd); err != nil {
            log.Error().Err(err).Msg("Failed to handle command")
        }
    }
}

func (c *Client) handleCommand(
    ctx context.Context,
    cmd *pb.AgentCommand,
) error {
    switch cmd.GetCommand().(type) {
    case *pb.AgentCommand_ReplaceToken:
        req := cmd.GetReplaceToken()
        return c.agent.HandleReplaceToken(req.Token)

    case *pb.AgentCommand_Close:
        req := cmd.GetClose()
        return c.agent.HandleClose(req.Reason.String())

    case *pb.AgentCommand_Update:
        req := cmd.GetUpdate()
        return c.agent.HandleUpdate(req.Version, req.ImageUrl)

    default:
        log.Warn().Msg("Unknown command received")
    }

    return nil
}

func (c *Client) UpdateToken(token string) {
    c.token = token
}

func (c *Client) NotifyTokenReplaced() error {
    ctx := metadata.AppendToOutgoingContext(
        context.Background(),
        MetadataKeyToken,
        c.token,
    )

    _, err := c.client.TokenReplaced(ctx, &pb.Empty{})
    return err
}

func (c *Client) GetGatewaySnapshot(
    ctx context.Context,
    gatewayID string,
) (*pb.GatewaySnapshot, error) {
    ctx = metadata.AppendToOutgoingContext(
        ctx,
        MetadataKeyToken,
        c.token,
    )

    return c.client.GetGatewaySnapshot(ctx, &pb.GetGatewaySnapshotRequest{
        GatewayId: gatewayID,
    })
}

func (c *Client) ReportStatus(
    ctx context.Context,
    status, message string,
    metrics map[string]string,
) error {
    ctx = metadata.AppendToOutgoingContext(
        ctx,
        MetadataKeyToken,
        c.token,
    )

    _, err := c.client.ReportStatus(ctx, &pb.AgentStatus{
        AgentId: os.Getenv("AGENT_ID"),
        Status:  status,
        Message: message,
        Metrics: metrics,
    })

    return err
}
```

#### Token Store

```go
// pkg/agent/token/store.go
package token

import (
    "fmt"
    "os"
    "path/filepath"
)

const (
    TokenFileName = "connection-token.jwt"
    FileMode      = 0600
)

type Store struct {
    dataDir   string
    tokenPath string
}

func NewStore(dataDir string) (*Store, error) {
    // 데이터 디렉토리 생성
    if err := os.MkdirAll(dataDir, 0700); err != nil {
        return nil, fmt.Errorf("failed to create data dir: %w", err)
    }

    return &Store{
        dataDir:   dataDir,
        tokenPath: filepath.Join(dataDir, TokenFileName),
    }, nil
}

func (s *Store) GetConnectionToken() (string, error) {
    data, err := os.ReadFile(s.tokenPath)
    if err != nil {
        if os.IsNotExist(err) {
            return "", nil
        }
        return "", fmt.Errorf("failed to read token: %w", err)
    }

    return string(data), nil
}

func (s *Store) SaveConnectionToken(token string) error {
    if err := os.WriteFile(s.tokenPath, []byte(token), FileMode); err != nil {
        return fmt.Errorf("failed to write token: %w", err)
    }

    return nil
}

func (s *Store) DeleteConnectionToken() error {
    if err := os.Remove(s.tokenPath); err != nil {
        if !os.IsNotExist(err) {
            return fmt.Errorf("failed to delete token: %w", err)
        }
    }

    return nil
}
```

#### Configuration

```go
// pkg/agent/config/config.go
package config

import (
    "fmt"
    "os"
)

type Config struct {
    AgentID      string
    GatewayID    string
    ServerURL    string
    InstallToken string
    DataDir      string
}

func Load() (*Config, error) {
    cfg := &Config{
        AgentID:      getEnv("AGENT_ID", ""),
        GatewayID:    getEnv("GATEWAY_ID", ""),
        ServerURL:    getEnv("IMP_SERVER_URL", "api.imprun.dev:443"),
        InstallToken: getEnv("IMP_INSTALL_TOKEN", ""),
        DataDir:      getEnv("IMP_DATA_DIR", "/var/lib/imprun-agent"),
    }

    if cfg.AgentID == "" {
        return nil, fmt.Errorf("AGENT_ID is required")
    }

    if cfg.GatewayID == "" {
        return nil, fmt.Errorf("GATEWAY_ID is required")
    }

    return cfg, nil
}

func getEnv(key, defaultValue string) string {
    if value := os.Getenv(key); value != "" {
        return value
    }
    return defaultValue
}
```

#### Main Entry Point

```go
// cmd/agent/main.go
package main

import (
    "context"
    "os"
    "os/signal"
    "syscall"

    "github.com/imprun/agent/pkg/agent"
    "github.com/imprun/agent/pkg/agent/config"
    "github.com/rs/zerolog"
    "github.com/rs/zerolog/log"
)

func main() {
    // Logger 초기화
    zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
    log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})

    // Config 로드
    cfg, err := config.Load()
    if err != nil {
        log.Fatal().Err(err).Msg("Failed to load config")
    }

    // Agent 생성
    agent, err := agent.New(cfg)
    if err != nil {
        log.Fatal().Err(err).Msg("Failed to create agent")
    }

    // Context with signal handling
    ctx, cancel := context.WithCancel(context.Background())
    defer cancel()

    sigCh := make(chan os.Signal, 1)
    signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)

    go func() {
        <-sigCh
        log.Info().Msg("Shutting down...")
        cancel()
    }()

    // Agent 실행
    if err := agent.Run(ctx); err != nil {
        log.Fatal().Err(err).Msg("Agent failed")
    }
}
```

### Test Plan

#### Unit Tests

**1. AgentTokenService 테스트**

- **토큰 생성 검증**
  - Given: agentId, gatewayId, type (install/connection)
  - When: generateToken() 호출
  - Then:
    - JWT 토큰이 반환됨
    - Payload에 sub, gatewayId, type, nonce 포함
    - nonce는 64자 hex (32 bytes)

- **유효한 토큰 검증**
  - Given: 올바르게 생성된 JWT 토큰
  - When: verifyToken() 호출
  - Then: 서명 검증 성공, payload 반환

- **잘못된 토큰 거부**
  - Given: 잘못된 형식의 JWT 토큰
  - When: verifyToken() 호출
  - Then: 검증 실패 에러 발생

**2. AgentAuthGuard (인증 미들웨어) 테스트**

- **유효한 Connection 토큰 허용**
  - Given: DB에 저장된 nonce와 일치하는 connection 토큰
  - When: 인증 미들웨어 실행
  - Then: 인증 성공

- **Nonce 불일치 토큰 거부**
  - Given: DB의 nonce와 다른 connection 토큰
  - When: 인증 미들웨어 실행
  - Then: Unauthenticated 에러

- **Install 토큰 허용 (Nonce 검증 생략)**
  - Given: type이 "install"인 토큰
  - When: 인증 미들웨어 실행
  - Then: nonce 검증 없이 인증 성공

**3. AgentService 테스트**

- **Agent 등록 및 Install 토큰 생성**
  - Given: gatewayId, userId
  - When: registerAgent() 호출
  - Then:
    - Agent 엔티티 생성됨
    - Install 토큰 반환됨
    - 설치 스크립트에 토큰 포함됨

- **Install 토큰 연결 시 교체 명령 전송**
  - Given: Install 토큰으로 Connect
  - When: handleConnect() 호출
  - Then:
    - Connection 토큰 생성
    - ReplaceTokenRequest 명령 전송

- **토큰 교체 완료 처리**
  - Given: TokenReplaced 알림
  - When: handleTokenReplaced() 호출
  - Then: DB에 nonce 저장됨

- **토큰 폐기 및 연결 종료**
  - Given: 활성 Agent
  - When: revokeToken() 호출
  - Then:
    - Agent 상태 REVOKED
    - Token 삭제됨
    - CloseConnectionRequest 명령 전송

#### Integration Tests

**1. 전체 Agent 등록 플로우**

시나리오: Agent 등록부터 재연결까지의 전체 프로세스 검증

1. **Agent 등록** (REST API)
   - Given: gatewayId
   - When: POST /v1/gateways/{gatewayId}/agents
   - Then: agentId, installToken 반환

2. **Install 토큰으로 연결**
   - Given: install token
   - When: gRPC Connect() 호출
   - Then: Command Stream 생성됨

3. **토큰 교체 명령 수신**
   - When: Stream에서 첫 번째 command 읽기
   - Then: ReplaceTokenRequest 수신됨

4. **토큰 교체 알림**
   - Given: 새로 받은 connection token
   - When: gRPC TokenReplaced() 호출
   - Then: 성공 응답

5. **DB nonce 검증**
   - When: DB에서 Agent 조회
   - Then: token.nonce가 저장되어 있음

6. **Connection 토큰으로 재연결**
   - Given: connection token
   - When: gRPC Connect() 호출
   - Then: 재연결 성공

**2. 토큰 폐기 플로우**

시나리오: 토큰 폐기 시 연결 종료 및 재연결 실패 검증

1. **Agent 연결**
   - Given: connection token
   - When: Agent 연결됨
   - Then: Command Stream 활성

2. **토큰 폐기** (REST API)
   - Given: agentId
   - When: POST /v1/agents/{agentId}/tokens/revoke
   - Then: 성공 응답

3. **종료 명령 수신**
   - When: Stream에서 command 읽기
   - Then: CloseConnectionRequest (reason: REVOKE_TOKEN) 수신

4. **재연결 실패 검증**
   - Given: 폐기된 토큰
   - When: gRPC Connect() 재시도
   - Then: Unauthenticated 에러

#### E2E Tests (Golang)

```go
// pkg/agent/e2e/agent_test.go
package e2e

import (
    "context"
    "testing"
    "time"

    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/require"
)

func TestAgentLifecycle(t *testing.T) {
    ctx := context.Background()

    // 1. Setup: Register agent and get install token
    resp := registerAgent(t, "gateway-1")
    installToken := resp.InstallToken

    // 2. Start agent with install token
    agent := startAgent(t, installToken)
    defer agent.Stop()

    // 3. Wait for connection
    require.Eventually(t, func() bool {
        return agent.IsConnected()
    }, 10*time.Second, 100*time.Millisecond)

    // 4. Verify connection token saved
    token, err := agent.GetStoredToken()
    require.NoError(t, err)
    assert.NotEmpty(t, token)
    assert.NotEqual(t, installToken, token)

    // 5. Restart agent (should use connection token)
    agent.Stop()
    agent2 := startAgent(t, "")  // No install token
    defer agent2.Stop()

    require.Eventually(t, func() bool {
        return agent2.IsConnected()
    }, 10*time.Second, 100*time.Millisecond)

    // 6. Test token revocation
    revokeAgentToken(t, resp.AgentID)

    require.Eventually(t, func() bool {
        return !agent2.IsConnected()
    }, 5*time.Second, 100*time.Millisecond)

    // 7. Verify stored token deleted
    token, err = agent2.GetStoredToken()
    require.NoError(t, err)
    assert.Empty(t, token)
}

func TestAgentGatewaySnapshot(t *testing.T) {
    ctx := context.Background()

    // 1. Setup agent
    agent := setupConnectedAgent(t, "gateway-1")
    defer agent.Stop()

    // 2. Request gateway snapshot
    snapshot, err := agent.GetGatewaySnapshot(ctx, "gateway-1")
    require.NoError(t, err)
    assert.Equal(t, "gateway-1", snapshot.GatewayId)
    assert.NotEmpty(t, snapshot.Data)

    // 3. Verify cannot access other gateway
    _, err = agent.GetGatewaySnapshot(ctx, "gateway-2")
    assert.Error(t, err)
    assert.Contains(t, err.Error(), "not authorized")
}
```

## Alternatives

### 1. mTLS (Mutual TLS) 인증

**설명**: 클라이언트와 서버가 모두 인증서를 사용하여 상호 인증

**Pros**:
- 매우 강력한 보안
- 표준 TLS 프로토콜 사용
- 토큰 관리 불필요

**Cons**:
- 인증서 관리 복잡도 높음
- 인증서 발급/갱신 인프라 필요
- 별도 포트 필요 (포트 관리 복잡)
- Agent 업데이트 시 인증서 동기화 어려움
- 클러스터별 인증서 관리 부담

**선택하지 않은 이유**: 운영 복잡도가 높고, 토큰 기반 방식이 더 유연함

### 2. API Key 인증

**설명**: 단순한 API Key를 gRPC 메타데이터에 전송

**Pros**:
- 구현 단순
- 토큰 생성/검증 오버헤드 없음
- 빠른 성능

**Cons**:
- 보안 수준 낮음 (서명 없음)
- 토큰 탈취 시 쉽게 재사용 가능
- 만료 시간 관리 어려움
- 감사 추적 어려움

**선택하지 않은 이유**: 보안 요구사항 충족 불가

### 3. OAuth 2.0 / OIDC

**설명**: 표준 OAuth 2.0 프로토콜 사용

**Pros**:
- 업계 표준
- 토큰 갱신 메커니즘 내장
- 세밀한 권한 제어 (Scope)

**Cons**:
- 구현 복잡도 높음
- Authorization Server 필요
- Machine-to-Machine 인증에 오버킬
- gRPC 메타데이터에 맞추기 어려움

**선택하지 않은 이유**: 현재 요구사항에 비해 과도하게 복잡

### 4. Shared Secret

**설명**: Agent와 Server가 사전 공유된 비밀키 사용

**Pros**:
- 구현 매우 단순
- 성능 우수

**Cons**:
- 키 배포 문제
- 키 갱신 어려움
- Agent별 키 관리 불가 (모든 Agent가 동일 키 공유)
- 보안 사고 시 전체 키 교체 필요

**선택하지 않은 이유**: 확장성과 보안 관리 어려움

## Open Questions

### Q1: 토큰 만료 시간 정책

**현재**: 무기한 토큰 (nonce로 관리)

**논의 필요**:
- 토큰에 만료 시간(exp)을 추가할 것인가?
- 만료 전 자동 갱신 메커니즘이 필요한가?
- 만료된 토큰으로 재연결 시 자동으로 새 토큰 발급할 것인가?

**제안**: 초기 버전에서는 무기한 토큰 사용, 향후 필요시 만료 시간 추가

### Q2: Agent Public Key 활용

**현재**: AgentInfo에 publicKey 필드 존재하지만 미사용

**논의 필요**:
- Public Key로 무엇을 암호화/검증할 것인가?
- Gateway Snapshot을 암호화하여 전송할 것인가?
- Signed Command를 도입할 것인가?

**제안**: 초기 버전에서는 미사용, 향후 민감 데이터 암호화 필요시 활용

### Q3: Multi-Gateway Agent 지원

**현재**: 1 Agent = 1 Gateway

**논의 필요**:
- 하나의 Agent가 여러 Gateway를 관리할 수 있어야 하는가?
- 토큰에 Gateway 목록을 포함할 것인가?
- API Gateway 서비스별로 별도 Agent를 배포하는 것이 맞는가?

**제안**: 초기에는 1:1 정책 유지, 운영 경험 후 Multi-Gateway 지원 여부 결정

### Q4: Token Rotation 정책

**현재**: 명시적 재발급 요청 시에만 토큰 교체

**논의 필요**:
- 주기적 자동 토큰 교체가 필요한가?
- 교체 주기는 얼마로 할 것인가?
- 교체 중 다운타임은 어떻게 방지할 것인가?

**제안**: 초기에는 수동 교체만 지원, 보안 정책에 따라 자동 교체 도입

### Q5: Agent 상태 모니터링

**현재**: `ReportStatus` RPC로 상태 보고

**논의 필요**:
- Agent가 어떤 메트릭을 보고해야 하는가?
- 상태 보고 주기는 얼마로 할 것인가?
- 이상 상태 감지 시 자동 대응 메커니즘이 필요한가?

**제안**: 기본 헬스체크부터 시작, 점진적으로 메트릭 추가

## Answered Questions

### Q: Install 토큰의 유효 기간은?

**A**: Install 토큰은 일회성이므로 명시적인 만료 시간 없음. 최초 연결 시 자동으로 connection 토큰으로 교체되며, DB에 nonce가 저장되지 않으므로 재사용 불가.

### Q: Agent가 오프라인 상태에서 토큰이 폐기되면?

**A**: Agent 재연결 시 nonce 불일치로 인증 실패. Agent는 토큰 파일을 삭제하고 사용자에게 새 install 토큰으로 재등록 요청.

### Q: 여러 Agent가 동일한 install 토큰을 사용하면?

**A**: Install 토큰에는 agentId가 포함되어 있어 동일 토큰으로 여러 Agent 등록 불가. 각 Agent는 고유한 install 토큰 필요.

### Q: JWT Secret Key 관리는?

**A**: imprun-server의 환경변수(`JWT_SECRET`)로 관리. Kubernetes Secret으로 저장하고 Pod에 주입. 키 교체 시 기존 연결된 Agent는 재연결 시 실패하므로, 마이그레이션 계획 필요.

---

## Implementation Status

### 완료된 구현 (v2.0.0)

| 컴포넌트 | 상태 | 위치 |
|---------|------|------|
| Agent CLI | ✅ 완료 | `services/imprun-agent/cmd/imprun-agent/main.go` |
| Config 관리 | ✅ 완료 | `services/imprun-agent/internal/config/config.go` |
| gRPC Client | ✅ 완료 | `services/imprun-agent/internal/grpc/client.go` |
| Server 등록 | ✅ 완료 | `services/imprun-agent/internal/server/client.go` |

### 현재 구현과 문서 차이점

이 EPIC 문서는 초기 설계 문서이며, 실제 구현은 다음과 같이 진행되었습니다:

1. **Cluster 기반**: `gatewayId` 대신 `clusterId` 사용 (1 Agent = 1 Cluster)
2. **CLI 기반 등록**: 환경변수 대신 CLI 플래그 우선 (`--server`, `--grpc`, `--cluster`, `--token`)
3. **Config 통합**: 토큰을 별도 파일이 아닌 `config.yaml`에 통합 저장
4. **환경변수명**: `IMPRUN_SERVER`, `IMPRUN_GRPC`, `IMPRUN_CLUSTER`, `IMPRUN_TOKEN`

### 참고 문서

- **PRD (제품 요구사항)**: `docs/agent-spec.md`
- **구현 코드**: `services/imprun-agent/` 디렉토리

---

**Last Updated**: 2025-11-26
**Status**: Implemented (v2.0.0)
**Authors**: @junsik (via Claude)
