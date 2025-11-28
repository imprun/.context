**Note**: 한국어로 답변하고, 간결하게 진행하세요.

---

EPIC 문서를 GitHub Issue로 동기화합니다.

**사용 시나리오**:
- EPIC 문서 생성 후
- EPIC 내용이 크게 업데이트된 경우
- 팀원들과 GitHub에서 EPIC을 공유하고 싶을 때

---

## 1단계: EPIC 번호 확인

사용자에게 동기화할 EPIC 번호를 질문합니다:

> 어떤 EPIC을 GitHub Issue로 동기화할까요?
>
> 예: EPIC-025

**AI 에이전트 작업**:
- `.context/{프로젝트}/epics/` 디렉토리에서 EPIC 파일 목록 확인
- 존재하는 EPIC 번호 제안

---

## 2단계: EPIC 문서 읽기

`.context/{프로젝트}/epics/EPIC-XXX-*.md` 파일을 읽습니다.

**확인 사항**:
- EPIC 제목
- Summary 섹션
- 전체 내용

---

## 3단계: GitHub Issue 형식 변환

EPIC 문서를 GitHub Issue markdown 형식으로 변환합니다.

**변환 규칙**:

### Issue 제목
```
EPIC-XXX: [Title]
```

### Issue 본문

```markdown
## Summary

[EPIC Summary 복사]

---

## Background

[Background 섹션 복사]

---

## User Flow

[Mermaid 다이어그램 포함]

---

## Implementation Details

[Implementation Details 섹션 요약]

**전체 EPIC 문서**: [.context 링크]

---

## Stories

- [ ] Story XXX.1: [Title]
- [ ] Story XXX.2: [Title]

**참고**: Story를 GitHub Issue로 동기화하려면 `/sync-stories-to-github EPIC-XXX`를 사용하세요.

---

## Labels

`epic`, `planning`

---

**자동 생성**: 이 Issue는 `.context/epics/EPIC-XXX-*.md`에서 자동 생성되었습니다.
```

---

## 4단계: 기존 Issue 확인

**중요**: 중복 생성 방지를 위해 기존 Issue 확인

```bash
# EPIC 제목으로 검색
gh issue list --search "EPIC-XXX" --state all
```

**분기**:
- **Issue 없음** → 5단계로 (새로 생성)
- **Issue 있음** → 사용자에게 질문:
  > GitHub Issue #25가 이미 존재합니다.
  >
  > 1. 업데이트 (기존 Issue 본문 교체)
  > 2. 새로 생성 (중복 허용)
  > 3. 취소
  >
  > 선택: (1/2/3)

---

## 5단계: GitHub Issue 생성

### 새 Issue 생성

```bash
gh issue create \
  --title "EPIC-XXX: [Title]" \
  --body "$(cat <<'EOF'
[변환된 Issue 본문]
EOF
)" \
  --label "epic,planning" \
  --assignee "@me"
```

**결과 확인**:
```bash
# 출력 예시:
# https://github.com/imprun/imp-gateway/issues/25
```

### 기존 Issue 업데이트 (사용자가 선택한 경우)

```bash
gh issue edit 25 \
  --body "$(cat <<'EOF'
[변환된 Issue 본문]
EOF
)"
```

---

## 6단계: EPIC 파일에 Issue 번호 기록

**EPIC 파일 상단에 GitHub Issue 링크 추가**:

```markdown
# EPIC-XXX: [Title]

**Status**: Draft | In Progress | Completed
**Owner**: [팀 또는 개발자 이름]
**Created**: YYYY-MM-DD
**Last Updated**: YYYY-MM-DD
**GitHub Issue**: [#25](https://github.com/imprun/imp-gateway/issues/25)

---
```

**AI 에이전트 작업**:
- EPIC 파일 읽기
- `**GitHub Issue**:` 라인이 이미 있는지 확인
- 없으면 `**Last Updated**:` 다음에 추가
- 있으면 Issue 번호 업데이트

---

## 7단계: .context 커밋

EPIC 파일 변경사항을 커밋합니다:

```bash
cd .context
git add {프로젝트}/epics/EPIC-XXX-*.md
git commit -m "docs({프로젝트}): EPIC-XXX GitHub Issue #25 동기화"
git push
```

---

## 8단계: 결과 보고

```
✅ EPIC-XXX GitHub Issue 동기화 완료

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 동기화 결과
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**EPIC**: EPIC-025: Tenant & User Management
**GitHub Issue**: #25
**URL**: https://github.com/imprun/imp-gateway/issues/25
**Labels**: epic, planning

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 다음 단계:
1. Story를 GitHub Issue로 동기화: `/sync-stories-to-github EPIC-025`
2. 팀원들에게 Issue 링크 공유
3. GitHub Projects에 추가 (선택)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 참고

### GitHub Issue 라벨

다음 라벨을 사용합니다:
- `epic`: EPIC Issue 표시
- `planning`: 계획 단계

**라벨이 없는 경우**:
```bash
# 라벨 생성
gh label create "epic" --description "Epic-level feature" --color "0052CC"
gh label create "planning" --description "Planning phase" --color "FBCA04"
```

### Issue 본문 길이 제한

GitHub Issue 본문이 너무 길면 요약만 포함하고 전체 내용은 `.context` 링크로 연결:

```markdown
## Implementation Details

[간략한 요약]

**전체 내용**: `.context/{프로젝트}/epics/EPIC-XXX-*.md` 파일 참조

---
```

### Mermaid 다이어그램

GitHub은 Mermaid를 지원하므로 다이어그램을 그대로 포함합니다.

**주의**: 다크 테마 색상이 GitHub 라이트 테마에서 보기 어려울 수 있으므로, Issue 본문에는 색상 클래스 정의를 제거하거나 간소화할 수 있습니다.

**옵션 1**: 색상 그대로 유지 (다크 테마 사용자 위주)
**옵션 2**: 색상 제거 (GitHub 기본 테마 사용)

---

### 동기화 방향 경고

**⚠️ 중요**: 동기화는 **일방향**입니다.

```
.context/epics/EPIC-XXX.md  →  GitHub Issue #25
         (원천)                    (복사본)
```

GitHub Issue에서 본문을 직접 수정하면 다음 동기화 시 덮어씌워집니다.

**팀원들에게 안내**:
> GitHub Issue는 읽기 전용입니다.
> 수정이 필요하면 `.context/epics/EPIC-XXX.md` 파일을 수정하고 다시 동기화하세요.

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
