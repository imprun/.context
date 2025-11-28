**Note**: 한국어로 답변하고, 간결하게 진행하세요.

---

오늘 작업을 정리하고 내일을 위해 상태를 저장합니다.

---

## 1단계: 자동 분석 (질문 없이 먼저 진행)

1. **Git 상태 분석**
   - `git status`로 변경된 파일 확인
   - `git log --oneline --since="8 hours ago"`로 오늘 커밋 확인

2. **진행 중인 Story 파악**
   - `.context/{프로젝트}/progress.md` 읽기
   - 🏗️ In Progress 상태인 Story 확인

3. **Serena Memory 업데이트 확인 (선택)**
   - `.serena/memories/` 폴더 변경사항 확인
   - 오늘 Serena가 업데이트한 분석이 있으면 언급

---

## 2단계: 개발자에게 간단히 질문

> 오늘 완료한 Task가 있나요? (Story 번호와 Task 번호만 알려주세요)
> 예: "Story 1.2의 Task 3, 4 완료" 또는 "없음"

---

## 3단계: progress.md만 업데이트

**⚠️ Story 파일은 수정하지 않습니다.** (이중 관리 방지)

`.context/{프로젝트}/progress.md`만 업데이트:
- 전체 진행률 테이블의 완료 Tasks 수, 진행률 갱신
- Task 체크리스트에서 `[ ]` → `[x]` 변경
- 일일 로그에 오늘 날짜 섹션 추가 (1-2줄)

**일일 로그 형식**:
```markdown
### YYYY-MM-DD (요일)
- Story X.X: Task N, M 완료 (진행률: Z%)
- [간단한 메모나 이슈 기록]
```

---

## 4단계: Serena Memory 보관 제안 (선택)

오늘 중요한 아키텍처 변경이나 리팩토링이 있었다면:

> 💡 Serena가 오늘 `[파일명].md`를 업데이트했습니다.
> `.context/archive/{프로젝트}/`로 보관하시겠습니까?
>
> ```bash
> cd .context
> node serena-sync/sync-memory.js
> ```

---

## 5단계: GitHub 동기화 제안 (선택)

Task 완료사항을 GitHub Issues에도 반영:

```bash
# progress.md의 체크박스를 GitHub Issue 체크박스로 동기화
/sync-progress-to-github
```

**결과**:
- GitHub Issue의 Tasklist 체크박스가 자동으로 업데이트됨
- 팀원들이 진행 상황을 GitHub Projects에서 확인 가능

---

## 6단계: 간결한 보고

다음 형식으로 짧게 보고:

```
📋 오늘 진행
- Story X.X: N개 Task 완료 (Z% → W%)

🎯 내일 우선순위
- Story X.X 계속 (N개 Task 남음)

💾 Uncommitted 변경사항
- [있으면 파일 개수 표시, 커밋 제안]
```

---

## 7단계: Uncommitted 변경사항 처리

`git status`로 uncommitted 변경사항이 있으면:

```
⚠️ Uncommitted 변경사항: N개 파일

커밋하시겠습니까? (y/n)
```

**y 응답 시**:
- 변경사항을 분석하여 커밋 메시지 작성 후 커밋 실행
- `.context/{프로젝트}/progress.md` 변경사항도 함께 커밋

**n 응답 시**: 스킵

---

## 다음 작업

내일 작업 시작:
```bash
/daily-start
```

주간보고 작성 (금요일):
```bash
/weekly-report
```
