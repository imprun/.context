**Note**: 한국어로 답변하고, 간결하게 진행하세요.

---

EPIC의 모든 Story를 GitHub Issues로 동기화합니다.

**사용 시나리오**:
- `/start-epic`으로 Story 파일 생성 후
- Story 내용이 크게 업데이트된 경우
- 팀원들에게 Story 할당을 위해

---

## 1단계: EPIC 번호 확인

사용자에게 동기화할 EPIC 번호를 질문합니다:

> 어떤 EPIC의 Story들을 GitHub Issue로 동기화할까요?
>
> 예: EPIC-025

**AI 에이전트 작업**:
- `.context/{프로젝트}/stories/` 디렉토리에서 EPIC 폴더 목록 확인
- 존재하는 EPIC 번호 제안

---

## 2단계: Story 파일 목록 확인

`.context/{프로젝트}/stories/EPIC-XXX/` 디렉토리의 모든 Story 파일을 읽습니다.

```bash
ls .context/{프로젝트}/stories/EPIC-XXX/
# 예: story-25.1.md, story-25.2.md, story-25.3.md
```

**확인 사항**:
- Story 개수
- 각 Story의 제목과 상태

---

## 3단계: EPIC Issue 확인

EPIC의 GitHub Issue 번호를 확인합니다:

```bash
# EPIC 파일 읽기
cat .context/{프로젝트}/epics/EPIC-XXX-*.md | grep "GitHub Issue"

# 예: **GitHub Issue**: [#25](https://github.com/imprun/imp-gateway/issues/25)
```

**분기**:
- **EPIC Issue 있음** → 4단계로 (Story를 Sub-issue로 생성)
- **EPIC Issue 없음** → 사용자에게 알림:
  > EPIC-XXX의 GitHub Issue가 없습니다.
  > 먼저 `/sync-epic-to-github EPIC-XXX`를 실행하세요.

---

## 4단계: Story를 GitHub Issue로 변환

각 Story 파일을 GitHub Issue markdown 형식으로 변환합니다.

**변환 규칙**:

### Issue 제목
```
Story XXX.Y: [Title]
```

### Issue 본문

```markdown
**EPIC**: EPIC-XXX - [EPIC Title] (#25)

---

## User Story

**As a** [사용자 역할],
**I want** [기능],
**So that** [가치/이유].

---

## Acceptance Criteria

**Given** [전제 조건]
**When** [행동]
**Then** [예상 결과]

---

## Tasks

### Backend
- [ ] Task 1: DB 스키마 정의
- [ ] Task 2: Repository 메서드 구현
- [ ] Task 3: API 핸들러 작성
- [ ] Task 4: 유닛 테스트

### Frontend
- [ ] Task 5: API 타입 정의
- [ ] Task 6: TanStack Query hooks
- [ ] Task 7: UI 컴포넌트
- [ ] Task 8: 통합 테스트

---

## Technical Notes

[Technical Notes 섹션 복사]

**전체 Story 문서**: `.context/{프로젝트}/stories/EPIC-XXX/story-XXX.Y.md`

---

## Dependencies

- Story XXX.1 완료 후 시작 가능

---

## Labels

`story`, `EPIC-XXX`

---

**자동 생성**: 이 Issue는 `.context/stories/EPIC-XXX/story-XXX.Y.md`에서 자동 생성되었습니다.
```

---

## 5단계: 기존 Issue 확인 (각 Story마다)

**중요**: 중복 생성 방지를 위해 기존 Issue 확인

```bash
# Story 제목으로 검색
gh issue list --search "Story 25.1" --state all
```

**분기**:
- **Issue 없음** → 6단계로 (새로 생성)
- **Issue 있음** → 사용자에게 질문:
  > GitHub Issue #26이 이미 존재합니다 (Story 25.1).
  >
  > 1. 업데이트 (기존 Issue 본문 교체)
  > 2. 건너뛰기
  > 3. 모두 취소
  >
  > 선택: (1/2/3)

---

## 6단계: GitHub Issues 생성

### 새 Issue 생성 (각 Story마다)

```bash
gh issue create \
  --title "Story 25.1: Audit Log DB Schema" \
  --body "$(cat <<'EOF'
[변환된 Issue 본문]
EOF
)" \
  --label "story,EPIC-025" \
  --assignee "@me"
```

**결과 확인**:
```bash
# 출력 예시:
# https://github.com/imprun/imp-gateway/issues/26
# https://github.com/imprun/imp-gateway/issues/27
# https://github.com/imprun/imp-gateway/issues/28
```

### Sub-issue로 연결 (선택)

**GitHub Projects를 사용하는 경우**, Story Issue를 EPIC Issue의 Sub-issue로 연결:

```bash
# EPIC Issue에 Story Issue 링크 추가
gh issue comment 25 --body "## Stories

- [ ] Story 25.1: Audit Log DB Schema (#26)
- [ ] Story 25.2: API Endpoints (#27)
- [ ] Story 25.3: Frontend UI (#28)"
```

**또는** EPIC Issue 본문을 직접 업데이트:

```bash
gh issue edit 25 --body "$(cat <<'EOF'
[기존 EPIC 본문]

---

## Stories

- [ ] Story 25.1: Audit Log DB Schema (#26)
- [ ] Story 25.2: API Endpoints (#27)
- [ ] Story 25.3: Frontend UI (#28)
EOF
)"
```

---

## 7단계: Story 파일에 Issue 번호 기록

**각 Story 파일 상단에 GitHub Issue 링크 추가**:

```markdown
# Story 25.1: Audit Log DB Schema

**EPIC**: EPIC-025
**Status**: ⏳ Pending | 🏗️ In Progress | ✅ Completed
**Priority**: P0 | P1 | P2
**Estimate**: X days
**GitHub Issue**: [#26](https://github.com/imprun/imp-gateway/issues/26)

---
```

**AI 에이전트 작업**:
- 각 Story 파일 읽기
- `**GitHub Issue**:` 라인이 이미 있는지 확인
- 없으면 `**Estimate**:` 다음에 추가
- 있으면 Issue 번호 업데이트

---

## 8단계: .context 커밋

Story 파일 변경사항을 커밋합니다:

```bash
cd .context
git add {프로젝트}/stories/EPIC-XXX/
git commit -m "docs({프로젝트}): EPIC-XXX Stories GitHub Issues 동기화"
git push
```

---

## 9단계: 결과 보고

```
✅ EPIC-025 Stories GitHub Issues 동기화 완료

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 동기화 결과
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**EPIC**: EPIC-025: Tenant & User Management (#25)

**Stories**:
- Story 25.1: Audit Log DB Schema (#26)
- Story 25.2: API Endpoints (#27)
- Story 25.3: Frontend UI (#28)

**총 3개** Story가 GitHub Issues로 동기화되었습니다.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 다음 단계:
1. GitHub Projects에 Issues 추가
2. 팀원들에게 Story 할당
3. 작업 시작 후 `/sync-progress-to-github`로 진행 상황 동기화

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 참고

### GitHub Issue 라벨

다음 라벨을 사용합니다:
- `story`: Story Issue 표시
- `EPIC-XXX`: EPIC별 그룹화

**라벨이 없는 경우**:
```bash
# 라벨 생성
gh label create "story" --description "User story" --color "5319E7"
gh label create "EPIC-025" --description "EPIC-025 related" --color "D4C5F9"
```

### Story 우선순위 라벨 (선택)

Story의 Priority에 따라 추가 라벨 부여:

```bash
# P0 (긴급)
gh issue edit 26 --add-label "priority:P0"

# P1 (높음)
gh issue edit 27 --add-label "priority:P1"

# P2 (보통)
gh issue edit 28 --add-label "priority:P2"
```

### GitHub Projects 연동 (선택)

**GitHub Projects를 사용하는 경우**, Story Issues를 프로젝트에 추가:

```bash
# 프로젝트 번호 확인
gh project list

# Issue를 프로젝트에 추가
gh project item-add 1 --owner imprun --url https://github.com/imprun/imp-gateway/issues/26
```

### Tasklist 체크박스

Story Issue 본문의 Task 체크박스는 GitHub Tasklist 기능을 활용합니다:

```markdown
## Tasks

- [ ] Task 1: DB 스키마 정의
- [ ] Task 2: Repository 메서드 구현
```

**Tasklist 진행률**:
- GitHub Issue 화면에서 자동으로 "2 of 8 tasks" 진행률 표시
- `/sync-progress-to-github`로 체크박스 상태 동기화

### 동기화 방향 경고

**⚠️ 중요**: 동기화는 **일방향**입니다.

```
.context/stories/EPIC-XXX/  →  GitHub Issues #26-28
         (원천)                    (복사본)
```

GitHub Issue에서 본문이나 Task 체크박스를 직접 수정하면 다음 동기화 시 덮어씌워집니다.

**팀원들에게 안내**:
> GitHub Issue는 읽기 전용입니다.
> Task 완료는 `/sync-progress-to-github`를 통해 `.context/progress.md`에서 동기화됩니다.
> Story 내용 수정이 필요하면 `.context/stories/EPIC-XXX/story-X.Y.md` 파일을 수정하세요.

### 대량 생성 시 주의사항

**Story가 10개 이상인 경우**:
- GitHub API rate limit 주의
- 각 Issue 생성 간 1초 대기 권장:
  ```bash
  sleep 1
  ```

**진행 상황 표시**:
```
📝 Story 1/10 생성 중... (#26)
📝 Story 2/10 생성 중... (#27)
...
```

---

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
