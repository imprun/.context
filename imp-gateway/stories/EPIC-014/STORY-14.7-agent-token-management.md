# STORY-14.7: Agent Token Management

## 1. 개요
**Epic**: EPIC-014 Agent 관리
**제목**: 토큰 재발급 기능
**담당자**: AI Agent
**상태**: ✅ 부분 완료

## 2. 목적
Agent 토큰 관리 기능(Rotate, Revoke, Regenerate)을 구현한다. 보안상 토큰 재발급이 필요하거나, 기존 토큰을 무효화해야 할 때 사용된다.

## 3. 토큰 관리 기능 분류

| 기능 | 설명 | API | 상태 |
|------|------|-----|------|
| **Rotate** | 새 토큰 발급 + Agent에 자동 전달 (연결된 경우) | `POST /agents/:id/tokens/rotate` | ✅ 완료 |
| **Revoke** | 모든 토큰 무효화 (Agent 즉시 연결 해제) | `POST /agents/:id/tokens/revoke` | ✅ 완료 |
| **Regenerate** | Pending Agent의 Install Token 재발급 | `POST /agents/:id/regenerate-token` | 🔲 미구현 |

## 4. 현재 구현 상태

### 4.1. Token Rotate (✅ 완료)
**위치**: `web/src/pages/operator/agent-detail-page.tsx`

```tsx
async function handleRotateToken() {
  try {
    const result = await rotateToken.mutateAsync(agentId);
    if (result.agent_notified) {
      toast.success("Token rotated and agent notified");
    } else {
      toast.success("Token rotated. Agent will use new token on next connection.");
    }
  } catch (error) {
    toast.error("Failed to rotate token");
  }
}
```

### 4.2. Token Revoke (✅ 완료)
**위치**: `web/src/features/agent/revoke-agent/revoke-agent-dialog.tsx`

- AlertDialog로 확인 후 실행
- 성공 시 Agent가 즉시 연결 해제됨

## 5. 추가 구현 필요 사항

### 5.1. Regenerate Token (Pending Agent용)
**목적**: 연결 대기 중인 Agent의 Install Token이 만료되었을 때 새로 발급

**Path**: `web/src/features/agent/regenerate-token/regenerate-token-dialog.tsx`

```tsx
interface RegenerateTokenDialogProps {
  agent: Agent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RegenerateTokenDialog({
  agent,
  open,
  onOpenChange,
}: RegenerateTokenDialogProps) {
  const [newToken, setNewToken] = useState<string | null>(null);

  async function handleRegenerate() {
    if (!agent) return;

    try {
      const result = await regenerateToken.mutateAsync(agent.id);
      setNewToken(result.install_token);
      toast.success("New install token generated");
    } catch (error) {
      toast.error("Failed to regenerate token");
    }
  }

  // 토큰 표시 UI (TokenDisplayModal 재사용)
}
```

### 5.2. UI 위치
Pending 상태 Agent에서만 "토큰 재발급" 버튼 표시:

```tsx
{agent.status === 'pending' && (
  <Button onClick={() => setShowRegenerateDialog(true)}>
    <RefreshCw className="mr-2 h-4 w-4" />
    Regenerate Token
  </Button>
)}
```

### 5.3. 백엔드 API 추가 (필요 시)
EPIC 문서에 정의된 API:
```
POST /api/v1/operator/agents/:id/regenerate-token
```

현재 백엔드에 이 엔드포인트가 없으면 추가 필요. 또는 `rotate` API를 재사용.

## 6. 수용 기준

### Token Rotate
- [x] Agent 상세 페이지에서 "Rotate Token" 버튼이 동작한다.
- [x] 성공 시 Agent 알림 여부에 따른 토스트 메시지가 표시된다.

### Token Revoke
- [x] 확인 다이얼로그가 표시된다.
- [x] 성공 시 Agent 상태가 변경된다 (disconnected).

### Token Regenerate (신규)
- [ ] Pending 상태 Agent에서만 "토큰 재발급" 버튼이 표시된다.
- [ ] 새 토큰이 TokenDisplayModal로 표시된다.
- [ ] 설치 스크립트가 새 토큰으로 업데이트된다.

## 7. 참조 파일
- `web/src/pages/operator/agent-detail-page.tsx`
- `web/src/features/agent/revoke-agent/revoke-agent-dialog.tsx`
- `web/src/entities/agent/api/agent-api.ts`
- `services/imprun-server/internal/api/v1/operator/agents.go`

## 8. 비고
- Rotate: 연결된 Agent의 보안 토큰 순환
- Revoke: 긴급 보안 차단 (Agent 즉시 연결 해제)
- Regenerate: Pending Agent의 만료된 Install Token 재발급
