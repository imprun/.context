# STORY-14.6: Agent Delete Confirmation

## 1. 개요
**Epic**: EPIC-014 Agent 관리
**제목**: Agent 삭제 기능
**담당자**: AI Agent
**상태**: 🔲 미시작

## 2. 목적
Agent를 안전하게 삭제할 수 있는 확인 다이얼로그를 구현한다. 삭제 시 관련 토큰이 무효화되고 Agent 연결이 종료된다.

## 3. 현재 상태 분석

### 3.1. 백엔드 API (✅ 완료)
```
DELETE /api/v1/operator/agents/:id
```
- 구현 위치: `services/imprun-server/internal/api/v1/operator/agents.go`
- 기능: Agent 삭제 및 관련 토큰 무효화

### 3.2. 프론트엔드 (🔲 미구현)
- `useDeleteAgent` 훅은 구현됨 (`agent-api.ts`)
- 삭제 확인 다이얼로그 컴포넌트 없음
- UI에서 삭제 버튼 없음

## 4. 구현 상세

### 4.1. 삭제 다이얼로그 컴포넌트
**Path**: `web/src/features/agent/delete-agent/delete-agent-dialog.tsx`

```tsx
interface DeleteAgentDialogProps {
  agent: Agent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteAgentDialog({
  agent,
  open,
  onOpenChange,
  onSuccess,
}: DeleteAgentDialogProps) {
  const deleteAgent = useDeleteAgent();

  async function handleDelete() {
    if (!agent) return;

    try {
      await deleteAgent.mutateAsync(agent.id);
      toast.success(`Agent "${agent.name}" deleted successfully`);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to delete agent");
      console.error(error);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Agent</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete agent "{agent?.name}"?
            This action cannot be undone and will:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Immediately disconnect the agent</li>
              <li>Invalidate all tokens for this agent</li>
              <li>Remove the agent from the cluster</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteAgent.isPending ? "Deleting..." : "Delete Agent"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

### 4.2. UI 레이아웃
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Delete Agent                                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Are you sure you want to delete agent "agent-prod-01"?                     │
│  This action cannot be undone and will:                                     │
│                                                                             │
│  • Immediately disconnect the agent                                         │
│  • Invalidate all tokens for this agent                                     │
│  • Remove the agent from the cluster                                        │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                   [ Cancel ]  [ Delete ]    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.3. 삭제 버튼 추가 위치

#### Agent List Item (Cluster Agent List)
```tsx
<DropdownMenuItem
  className="text-destructive"
  onClick={() => setDeleteTarget(agent)}
>
  <Trash2 className="mr-2 h-4 w-4" />
  Delete Agent
</DropdownMenuItem>
```

#### Agent Detail Page
```tsx
<Button
  variant="outline"
  className="text-destructive hover:bg-destructive/10"
  onClick={() => setShowDeleteDialog(true)}
>
  <Trash2 className="mr-2 h-4 w-4" />
  Delete Agent
</Button>
```

### 4.4. Export 추가
**Path**: `web/src/features/agent/index.ts`

```typescript
export { DeleteAgentDialog } from "./delete-agent/delete-agent-dialog";
```

## 5. 수용 기준
- [ ] 삭제 버튼 클릭 시 확인 다이얼로그가 표시된다.
- [ ] 다이얼로그에 삭제 결과(연결 해제, 토큰 무효화 등)가 명시된다.
- [ ] "Cancel" 클릭 시 다이얼로그가 닫힌다.
- [ ] "Delete" 클릭 시 API 호출 후 삭제된다.
- [ ] 삭제 성공 시 토스트 메시지가 표시된다.
- [ ] Agent 목록에서 삭제된 Agent가 사라진다.
- [ ] Agent 상세 페이지에서 삭제 시 목록 페이지로 리다이렉트된다.

## 6. 기술 스택
- `@shadcn/alert-dialog`: 확인 다이얼로그
- `useDeleteAgent`: 삭제 mutation 훅
- `sonner`: 토스트 메시지

## 7. 참조 파일
- `web/src/features/agent/revoke-agent/revoke-agent-dialog.tsx` (다이얼로그 패턴)
- `web/src/entities/agent/api/agent-api.ts` (`useDeleteAgent`)

## 8. 비고
- RevokeAgentDialog와 유사한 패턴이지만, Revoke는 토큰만 무효화하고 Agent 자체는 유지
- Delete는 Agent 자체를 삭제하므로 더 강한 경고 메시지 필요
