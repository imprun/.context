# STORY-14.1: Agent Entity & API Implementation

## 1. 개요
**Epic**: EPIC-014 Agent 관리
**제목**: Agent 엔티티 및 API 훅 구현
**담당자**: AI Agent
**상태**: ✅ 완료

## 2. 목적
프론트엔드에서 Agent 데이터를 다루기 위한 타입 정의와 백엔드 API 통신을 위한 React Query 훅을 구현한다.

## 3. 현재 상태 분석

### 3.1. 백엔드 API (✅ 완료)
**Path**: `services/imprun-server/internal/api/v1/operator/agents.go`

구현된 API 엔드포인트:
- `GET /api/v1/operator/agents` - Agent 목록 조회
- `GET /api/v1/operator/agents/:id` - Agent 상세 조회
- `DELETE /api/v1/operator/agents/:id` - Agent 삭제
- `POST /api/v1/operator/agents/:id/tokens/revoke` - 토큰 철회
- `POST /api/v1/operator/agents/:id/tokens/rotate` - 토큰 회전
- `GET /api/v1/operator/agents/:id/events` - Agent 이벤트 조회
- `GET /api/v1/operator/clusters/:id/agents` - 클러스터별 Agent 목록
- `POST /api/v1/operator/clusters/:id/agents` - Agent 등록

### 3.2. 프론트엔드 구현 (✅ 완료)

#### Model (`web/src/entities/agent/model/types.ts`)
- `Agent` 인터페이스
  - `id`, `cluster_id`, `operator_tenant_id`, `name`
  - `status`: AgentStatus ('pending' | 'connected' | 'disconnected' | 'blocked')
  - `version`, `ip_address`, `last_connected_at`
  - `created_at`, `updated_at`
- `AgentEvent` 인터페이스
  - `id`, `agent_id`, `type`, `ip_address`, `timestamp`
- Request/Response 타입들

#### API Hooks (`web/src/entities/agent/api/agent-api.ts`)
- `agentKeys`: Query Key 팩토리
- `useAgents(params)`: 전체 Agent 목록 조회
- `useAgentsByCluster(clusterId)`: 클러스터별 Agent 목록
- `useAgent(id)`: Agent 상세 조회
- `useAgentEvents(id)`: Agent 이벤트 조회
- `useRegisterAgent()`: Agent 등록
- `useUpdateAgent()`: Agent 수정
- `useDeleteAgent()`: Agent 삭제
- `useRevokeAgentTokens()`: 토큰 철회
- `useRotateAgentToken()`: 토큰 회전

#### UI Components (`web/src/entities/agent/ui/`)
- `AgentStatusBadge`: 상태별 배지 컴포넌트

## 4. 수용 기준
- [x] `Agent` 타입이 백엔드 API 응답과 일치해야 한다.
- [x] `useAgents`, `useAgent` 훅이 데이터를 정상적으로 가져와야 한다.
- [x] `useAgentsByCluster` 훅이 클러스터별 Agent를 조회해야 한다.
- [x] Mutation 훅들이 캐시 무효화를 올바르게 처리해야 한다.
- [x] API 에러 발생 시 적절한 에러 처리가 가능해야 한다.

## 5. 참조 파일
- `web/src/entities/agent/model/types.ts`
- `web/src/entities/agent/api/agent-api.ts`
- `web/src/entities/agent/ui/agent-status-badge.tsx`
- `web/src/entities/agent/index.ts`
- `services/imprun-server/internal/api/v1/operator/agents.go`

## 6. 비고
이 스토리는 기존 v1 작업에서 이미 구현되어 있어 추가 작업이 필요 없음.
AgentStatus 값이 EPIC 문서('pending' | 'active' | 'inactive')와 현재 구현('pending' | 'connected' | 'disconnected' | 'blocked')이 다르나, 현재 구현이 더 세분화되어 있으므로 유지.
