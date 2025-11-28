**Note**: 한국어로 답변하고, 간결하게 진행하세요.

---

`progress.md`의 Task 완료 상태를 GitHub Issues의 Tasklist로 동기화합니다.

**사용 시나리오**:
- `/daily-end` 후 진행 상황을 팀에 공유
- 주간보고 전 GitHub Projects 진행률 업데이트
- 팀원들이 GitHub에서 최신 진행 상황 확인 필요

---

## 1단계: progress.md 읽기

`.context/{프로젝트}/progress.md` 파일을 읽습니다.

**확인 사항**:
- 현재 진행 중인 EPIC
- 각 Story의 Task 완료 상태
- Story별 진행률

**예시**:
```markdown
## Task Details

### Story 25.2: API Endpoints

**Backend**
- [x] Task 1: DB 스키마 정의
- [x] Task 2: Repository 메서드 구현
- [x] Task 3: API 핸들러 작성
- [ ] Task 4: 유닛 테스트
- [ ] Task 5: 통합 테스트

**Frontend**
- (Story 25.2 완료 후 시작)
```

---

## 2단계: Story별 GitHub Issue 번호 확인

각 Story 파일에서 GitHub Issue 번호를 읽습니다:

```bash
# Story 파일 읽기
cat .context/{프로젝트}/stories/EPIC-XXX/story-XXX.Y.md | grep "GitHub Issue"

# 예: **GitHub Issue**: [#27](https://github.com/imprun/imp-gateway/issues/27)
```

**매핑 생성**:
```javascript
{
  "Story 25.1": 26,
  "Story 25.2": 27,
  "Story 25.3": 28
}
```

**분기**:
- **모든 Story에 GitHub Issue 있음** → 3단계로
- **GitHub Issue 없는 Story 있음** → 사용자에게 알림:
  > Story 25.3의 GitHub Issue가 없습니다.
  > 먼저 `/sync-stories-to-github EPIC-025`를 실행하세요.
  >
  > 또는 Story 25.3를 건너뛰고 계속하시겠습니까? (y/n)

---

## 3단계: 각 Story Issue의 현재 Tasklist 읽기

GitHub Issue의 현재 본문을 읽어서 Tasklist 섹션을 확인합니다:

```bash
# Issue 본문 읽기
gh issue view 27 --json body --jq '.body'
```

**Tasklist 섹션 추출**:
```markdown
## Tasks

### Backend
- [ ] Task 1: DB 스키마 정의
- [ ] Task 2: Repository 메서드 구현
- [ ] Task 3: API 핸들러 작성
- [ ] Task 4: 유닛 테스트
- [ ] Task 5: 통합 테스트

### Frontend
- (Story 25.2 완료 후 시작)
```

---

## 4단계: progress.md와 GitHub Issue 비교

**AI 에이전트 작업**:
1. progress.md의 Task 체크박스 상태 파싱
2. GitHub Issue의 Task 체크박스 상태 파싱
3. 차이점 식별

**예시**:
```
progress.md:
- [x] Task 1: DB 스키마 정의
- [x] Task 2: Repository 메서드 구현
- [x] Task 3: API 핸들러 작성
- [ ] Task 4: 유닛 테스트
- [ ] Task 5: 통합 테스트

GitHub Issue #27:
- [ ] Task 1: DB 스키마 정의
- [ ] Task 2: Repository 메서드 구현
- [ ] Task 3: API 핸들러 작성
- [ ] Task 4: 유닛 테스트
- [ ] Task 5: 통합 테스트

→ Task 1-3이 progress.md에서는 완료되었으나 GitHub에는 반영 안 됨
```

---

## 5단계: GitHub Issue 본문 업데이트

**Tasklist 섹션만 업데이트**합니다 (전체 Issue 본문은 유지).

**알고리즘**:
1. 기존 Issue 본문 읽기
2. `## Tasks` 섹션 찾기
3. `## Tasks`부터 다음 `##` 섹션 직전까지를 progress.md의 Task 체크박스로 교체
4. 업데이트된 본문으로 Issue 수정

**예시**:
```bash
# Issue 본문 업데이트
gh issue edit 27 --body "$(cat <<'EOF'
**EPIC**: EPIC-025 - Tenant & User Management (#25)

---

## User Story

**As a** Provider,
**I want** Subscription API endpoints,
**So that** I can manage subscriptions.

---

## Acceptance Criteria

...

---

## Tasks

### Backend
- [x] Task 1: DB 스키마 정의
- [x] Task 2: Repository 메서드 구현
- [x] Task 3: API 핸들러 작성
- [ ] Task 4: 유닛 테스트
- [ ] Task 5: 통합 테스트

### Frontend
- (Story 25.2 완료 후 시작)

---

## Technical Notes

...
EOF
)"
```

---

## 6단계: 동기화 결과 확인

각 Story Issue를 업데이트한 후, 결과를 확인합니다:

```bash
# Issue 확인
gh issue view 27
```

**GitHub Tasklist 진행률 확인**:
- GitHub UI에서 자동으로 "3 of 5 tasks" 진행률 표시됨

---

## 7단계: 결과 보고

```
✅ progress.md → GitHub Issues 동기화 완료

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 동기화 결과
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**EPIC**: EPIC-025: Tenant & User Management

| Story | GitHub Issue | 변경 전 | 변경 후 |
|-------|--------------|---------|---------|
| Story 25.1 | #26 | 6/6 (100%) | 6/6 (100%) | ✅ 변경 없음 |
| Story 25.2 | #27 | 0/5 (0%) | 3/5 (60%) | 🔄 업데이트됨 |
| Story 25.3 | #28 | 0/4 (0%) | 0/4 (0%) | ✅ 변경 없음 |

**총 3개** Issue 중 **1개** 업데이트됨

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 팀원들이 GitHub에서 최신 진행 상황을 확인할 수 있습니다.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 참고

### GitHub Tasklist 진행률

GitHub은 Issue 본문의 Task 체크박스를 자동으로 인식합니다:

```markdown
## Tasks

- [x] Task 1
- [x] Task 2
- [ ] Task 3
```

**GitHub UI 표시**:
```
Story 25.2: API Endpoints  #27
  2 of 3 tasks
```

### 동기화 방향

**⚠️ 중요**: 동기화는 **일방향**입니다.

```
.context/progress.md  →  GitHub Issue Tasklist
      (원천)                (복사본)
```

**GitHub Issue에서 직접 체크박스를 클릭하면**:
- 다음 `/sync-progress-to-github` 실행 시 덮어씌워집니다
- 팀원들에게 경고:
  > Task 완료는 `.context/progress.md`에서 관리합니다.
  > GitHub Issue 체크박스를 직접 클릭하지 마세요.

### Task 설명 매칭 전략

**문제**: progress.md의 Task 설명과 GitHub Issue의 Task 설명이 약간 다를 수 있음

**예시**:
```
progress.md:
- [x] Task 1: DB 스키마 정의

GitHub Issue:
- [ ] Task 1: Database schema design
```

**해결 방법**:
1. **Task 번호 기반 매칭** (권장):
   - "Task 1", "Task 2" 등의 번호로 매칭
   - 설명은 무시

2. **정확한 설명 매칭**:
   - 설명이 정확히 일치하는 경우만 매칭
   - 불일치 시 경고

**구현 예시** (번호 기반):
```javascript
const progressTasks = parseTasksFromProgressMd(); // ["Task 1", "Task 2", ...]
const githubTasks = parseTasksFromGitHub(); // ["Task 1", "Task 2", ...]

// 번호만 추출하여 매칭
progressTasks.forEach((task, index) => {
  githubTasks[index].checked = task.checked;
});
```

### 여러 EPIC 동시 동기화

**모든 EPIC을 한번에 동기화**:

```bash
# 1. 모든 EPIC 폴더 확인
ls .context/{프로젝트}/stories/

# 2. 각 EPIC별로 동기화
for epic in EPIC-*; do
  /sync-progress-to-github $epic
done
```

**사용자에게 질문**:
> 모든 EPIC을 동기화하시겠습니까? (y/n)
>
> 또는 특정 EPIC만: (예: EPIC-025)

### GitHub Projects 연동

**GitHub Projects를 사용하는 경우**, Tasklist 진행률이 자동으로 반영됩니다:

```
EPIC-025: Tenant & User Management
  ├─ Story 25.1 (100% ✅)
  ├─ Story 25.2 (60% 🔄)
  └─ Story 25.3 (0% ⏳)
```

### 충돌 방지

**동시 편집 시나리오**:
- 개발자 A: progress.md에서 Task 1 완료
- 개발자 B: GitHub Issue에서 Task 2 체크박스 클릭

**해결**:
- progress.md가 항상 우선 (Single Source of Truth)
- `/sync-progress-to-github` 실행 시 개발자 B의 변경은 덮어씌워짐
- **예방**: 팀에 동기화 정책 공유

### 에러 처리

**Issue 번호 없는 Story**:
```
⚠️ 경고: Story 25.3의 GitHub Issue가 없습니다.

다음 중 선택하세요:
1. Story 25.3 건너뛰기
2. 모든 Story를 GitHub Issue로 먼저 동기화 (/sync-stories-to-github)
3. 취소

선택: (1/2/3)
```

**GitHub API 에러**:
```bash
# rate limit 확인
gh api rate_limit

# 에러 발생 시 재시도
sleep 60
```

**Task 개수 불일치**:
```
⚠️ 경고: Story 25.2의 Task 개수가 일치하지 않습니다.

progress.md: 5 tasks
GitHub Issue #27: 4 tasks

전체 Issue 본문을 다시 생성하시겠습니까? (y/n)
```

### gh CLI 인증

`gh` CLI가 설치되어 있고 인증되어 있어야 합니다:

```bash
# gh CLI 버전 확인
gh --version

# 인증 (필요 시)
gh auth login
```

**에러 발생 시**:
- `gh` 미설치: 설치 안내
- 인증 만료: `gh auth login` 재실행 안내
