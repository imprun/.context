**Note**: 한국어로 답변하고, 간결하게 진행하세요.

---

progress.md를 Story 파일 및 코드 변경사항과 동기화합니다.

---

## 사용 시나리오

- 코드 변경 후 progress.md를 업데이트하지 않았을 때
- 주간보고 전 정확한 진행률 확인 시
- GitHub Issues 동기화 전 최신 상태 반영

---

## 1단계: 코드 변경사항 파악

### Git 분석

```bash
# 변경된 파일 목록
git diff --name-only HEAD

# 최근 커밋 확인
git log --oneline -5
```

### Serena MCP 활용 (코드 심볼 분석)

**중요**: 변경된 파일을 전체 읽지 말고 Serena MCP로 심볼 개요만 확인:

```
변경된 파일이 많을 경우:
→ mcp__serena__get_symbols_overview로 심볼 목록만 확인
→ 어떤 기능이 구현되었는지 파악
→ progress.md의 Task와 매칭
```

**예시**:
```
변경 파일: services/imprun-server/internal/api/v1/provider/subscriptions.go
→ get_symbols_overview 결과: ApproveSubscription, RejectSubscription 함수 추가
→ progress.md에서 "Subscription 승인/거절 API 구현" Task 찾기
→ 완료로 체크 제안
```

---

## 2단계: progress.md 읽기

`.context/{프로젝트}/progress.md` 읽기:
- 현재 진행 중인 EPIC 확인
- 🏗️ In Progress 상태인 Story 확인
- 미완료 Task 목록 파악

---

## 3단계: Task 완료 매칭

코드 변경사항과 progress.md Task를 비교하여 완료 제안:

**AI 에이전트 작업**:
1. Git diff의 변경 파일과 progress.md Task 설명 비교
2. Serena 심볼 분석으로 구현된 기능 파악
3. 완료 가능성이 높은 Task 제안

**개발자에게 질문**:
> 다음 Task들이 완료된 것으로 보입니다. 체크하시겠습니까?
>
> - [ ] Story 1.2: Task 3 - Subscription 승인/거절 API 구현
> - [ ] Story 1.2: Task 4 - Repository 메서드 추가
>
> (y/n 또는 Task 번호 선택)

---

## 4단계: progress.md 업데이트

**⚠️ Story 파일은 수정하지 않습니다.** (이중 관리 방지)

`.context/{프로젝트}/progress.md`만 업데이트:
- Task 체크박스: `[ ]` → `[x]`
- 전체 진행률 테이블 갱신:
  - 완료 Tasks 수 증가
  - 진행률 퍼센트 재계산
  - Story 상태 업데이트 (100% 시 ✅ Completed)

---

## 5단계: 결과 보고

```
📊 진행률 동기화 완료

| Story | 변경 전 | 변경 후 |
|-------|---------|---------|
| Story 1.2 | 2/6 (33%) | 4/6 (67%) |

총 진행률: 12/20 (60%)

💡 다음 단계:
- /daily-end: 일일 로그 업데이트
- /sync-progress-to-github: GitHub Issues에도 반영
```

---

## 6단계: GitHub 동기화 제안 (선택)

progress.md 업데이트 후 GitHub Issues에도 반영:

```bash
/sync-progress-to-github
```

**결과**:
- GitHub Issue의 Tasklist 체크박스가 자동으로 업데이트됨
- 팀원들이 GitHub Projects에서 진행 상황 확인 가능

---

## 참고

**이 명령어와 /daily-end의 차이**:
- `/sync-progress`: 코드 변경사항 기반으로 자동 매칭 (Git + Serena)
- `/daily-end`: 개발자가 직접 완료한 Task 번호 알려줌

**언제 사용하나요?**:
- `/sync-progress`: 코드 많이 작성 후, 어떤 Task가 완료됐는지 파악하고 싶을 때
- `/daily-end`: 오늘 작업 마무리하며 간단히 체크할 때
