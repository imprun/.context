**Note**: 한국어로 답변하고, 간결하게 진행하세요.

---

완료된 EPIC들을 기반으로 릴리즈 노트를 자동 생성합니다.

**사용 시나리오**:
- 배포 전 릴리즈 노트 작성
- 주간/월간 릴리즈 계획
- 팀 및 고객에게 변경사항 공유

---

## 1단계: 릴리즈 버전 확인

사용자에게 릴리즈 버전을 질문합니다:

> 어떤 버전의 릴리즈 노트를 생성할까요?
>
> 예: v0.1.0, v1.2.0

**버전 형식 검증**:
- Semantic Versioning (vX.Y.Z)
- 예: v0.1.0, v1.0.0, v2.3.1

---

## 2단계: 릴리즈 범위 확인

**AI 에이전트 작업**:
1. Git 태그 확인하여 이전 릴리즈 버전 파악
2. 사용자에게 릴리즈 범위 질문

```bash
# 이전 릴리즈 태그 확인
git tag --list 'v*' --sort=-version:refname | head -5

# 예: v0.0.9, v0.0.8, ...
```

**사용자에게 질문**:
> 이전 릴리즈 버전: v0.0.9
>
> v0.0.9 이후의 모든 변경사항을 포함하시겠습니까? (y/n)
>
> 또는 특정 EPIC만 포함: (예: EPIC-025, EPIC-026)

**분기**:
- **모든 변경사항** → 3단계로 (Git 커밋 히스토리 기반)
- **특정 EPIC만** → 4단계로 (EPIC 문서 기반)

---

## 3단계: Git 커밋 히스토리 분석 (모든 변경사항 포함 시)

```bash
# 이전 릴리즈 이후 커밋 확인
git log v0.0.9..HEAD --oneline

# EPIC 번호 추출 (커밋 메시지에서)
git log v0.0.9..HEAD --oneline | grep -oE 'EPIC-[0-9]+' | sort -u
```

**결과 예시**:
```
EPIC-024
EPIC-025
EPIC-026
```

---

## 4단계: 완료된 EPIC 문서 읽기

`.context/{프로젝트}/epics/` 디렉토리에서 완료된 EPIC들을 읽습니다.

**확인 사항**:
- EPIC 상태가 `Completed`인 것만 포함
- 또는 사용자가 지정한 EPIC만 포함

**각 EPIC 문서에서 추출**:
- EPIC 번호 및 제목
- Summary
- Stories 목록

---

## 5단계: progress.md에서 완료된 Story 확인

`.context/{프로젝트}/progress.md`를 읽어서 각 EPIC의 완료된 Story를 확인합니다.

**확인 사항**:
- Story 상태가 ✅ Completed인 것
- 100% 진행률

---

## 6단계: Git 커밋 통계 생성

```bash
# 커밋 개수
git rev-list v0.0.9..HEAD --count

# 변경 파일 개수 및 라인 수
git diff --shortstat v0.0.9..HEAD

# 기여자 목록
git shortlog -sn v0.0.9..HEAD
```

**결과 예시**:
```
커밋: 47개
파일 변경: 125 files changed, 8432 insertions(+), 2156 deletions(-)
기여자: 3명
```

---

## 7단계: 릴리즈 노트 생성

`.context/{프로젝트}/releases/` 디렉토리에 릴리즈 노트 파일을 생성합니다.

**파일명**: `v0.1.0.md`

### 릴리즈 노트 구조

```markdown
# Release Notes: v0.1.0

**Release Date**: YYYY-MM-DD
**Previous Version**: v0.0.9
**Type**: Major | Minor | Patch

---

## Summary

[1-2문장 요약]

이번 릴리즈는 Tenant & User Management, Subscription Approval 기능을 포함합니다.

---

## What's New

### EPIC-025: Tenant & User Management

**Summary**: Operator가 Tenant 및 User를 관리할 수 있는 기능

**Completed Stories**:
- ✅ Story 25.1: Audit Log DB Schema
- ✅ Story 25.2: API Endpoints
- ✅ Story 25.3: Frontend UI

**Key Changes**:
- Tenant CRUD API (`/v1/operator/tenants`)
- User CRUD API (`/v1/operator/users`)
- Keycloak Realm 자동 생성
- Operator Dashboard 추가

**GitHub Issue**: [#25](https://github.com/imprun/imp-gateway/issues/25)

---

### EPIC-026: Subscription Approval Workflow

**Summary**: Provider가 Subscription 요청을 승인/거절할 수 있는 기능

**Completed Stories**:
- ✅ Story 26.1: DB Schema Extension
- ✅ Story 26.2: Approval API
- ✅ Story 26.3: Frontend Integration

**Key Changes**:
- Subscription 상태 관리 (`pending`, `approved`, `rejected`)
- Provider Dashboard 승인 폼
- 이메일 알림 (승인/거절 시)

**GitHub Issue**: [#30](https://github.com/imprun/imp-gateway/issues/30)

---

## Breaking Changes

**⚠️ 없음**

또는:

**⚠️ API 변경사항**:
- `POST /v1/provider/subscriptions/:id/approve` 엔드포인트 추가
- `Subscription` 모델에 `approved_at`, `rejected_at` 필드 추가

---

## Bug Fixes

- #35: Keycloak Realm 생성 실패 시 에러 처리 개선
- #42: Tenant 목록 페이지 무한 스크롤 버그 수정

---

## Technical Improvements

- Repository 패턴 도입 (Backend)
- TanStack Query 활용 (Frontend)
- Keycloak Admin API 통합

---

## Statistics

- **Commits**: 47
- **Files Changed**: 125 files
- **Insertions**: +8,432 lines
- **Deletions**: -2,156 lines
- **Contributors**: 3

---

## Contributors

- @junsik (32 commits)
- @developer2 (10 commits)
- @developer3 (5 commits)

---

## Migration Guide

### Database

```sql
-- Tenant 테이블 추가
CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  realm_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Subscription 테이블 확장
ALTER TABLE subscriptions ADD COLUMN approved_at TIMESTAMP;
ALTER TABLE subscriptions ADD COLUMN rejected_at TIMESTAMP;
```

### Environment Variables

```bash
# Keycloak Admin API
KEYCLOAK_ADMIN_URL=http://localhost:8080
KEYCLOAK_ADMIN_USER=admin
KEYCLOAK_ADMIN_PASSWORD=admin
```

---

## Upgrade Instructions

### Backend

```bash
# 1. DB 마이그레이션
npm run migrate

# 2. 서버 재시작
systemctl restart imprun-server
```

### Frontend

```bash
# 1. 의존성 업데이트
npm install

# 2. 빌드
npm run build

# 3. 배포
npm run deploy
```

---

## Known Issues

- Tenant 삭제 시 Keycloak Realm이 자동으로 삭제되지 않음 (#50)
- 대량 Subscription 승인 시 성능 이슈 (#51)

**해결 예정**: v0.2.0

---

## Next Release (v0.2.0)

**계획된 기능**:
- EPIC-027: System Settings Management
- EPIC-028: Audit Log Viewer

**예상 릴리즈**: YYYY-MM-DD

---

**전체 변경사항**: [GitHub v0.0.9...v0.1.0](https://github.com/imprun/imp-gateway/compare/v0.0.9...v0.1.0)
```

---

## 8단계: .context 커밋

릴리즈 노트 파일을 커밋합니다:

```bash
cd .context
git add {프로젝트}/releases/v0.1.0.md
git commit -m "docs({프로젝트}): 릴리즈 노트 v0.1.0 생성"
git push
```

---

## 9단계: GitHub Release 생성 제안

**사용자에게 질문**:
> GitHub Release를 생성하시겠습니까? (y/n)

**y 응답 시**:

```bash
# GitHub Release 생성 (Draft)
gh release create v0.1.0 \
  --title "Release v0.1.0" \
  --notes-file .context/{프로젝트}/releases/v0.1.0.md \
  --draft

# 출력:
# https://github.com/imprun/imp-gateway/releases/tag/v0.1.0
```

**Draft 생성 이유**:
- 릴리즈 노트 최종 검토
- 팀원들의 피드백 반영
- 배포 준비 완료 후 Publish

---

## 10단계: 결과 보고

```
✅ 릴리즈 노트 생성 완료

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Release v0.1.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**릴리즈 노트**: `.context/{프로젝트}/releases/v0.1.0.md`

**포함된 EPIC**:
- EPIC-025: Tenant & User Management
- EPIC-026: Subscription Approval Workflow

**통계**:
- 커밋: 47개
- 파일 변경: 125개
- 코드 추가: +8,432줄
- 기여자: 3명

**GitHub Release**: https://github.com/imprun/imp-gateway/releases/tag/v0.1.0 (Draft)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 다음 단계:
1. 릴리즈 노트 검토 및 수정
2. GitHub Release Draft 확인
3. 배포 준비 완료 후 Release Publish
4. 팀에 릴리즈 노트 공유

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 참고

### Semantic Versioning

버전 번호 형식: `vMAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes (API 호환성 깨짐)
- **MINOR**: 새 기능 추가 (하위 호환)
- **PATCH**: 버그 수정 (하위 호환)

**예시**:
- v0.1.0 → v0.2.0: 새 기능 추가
- v0.2.0 → v0.2.1: 버그 수정
- v0.2.1 → v1.0.0: Breaking change

### 릴리즈 타입

| 타입 | 설명 | 예시 |
|------|------|------|
| **Major** | Breaking changes, 메이저 기능 | v1.0.0 |
| **Minor** | 새 기능, EPIC 완료 | v0.1.0 |
| **Patch** | 버그 수정, 마이너 개선 | v0.0.1 |

### Breaking Changes 표시

**중요**: Breaking changes는 반드시 명시해야 합니다.

```markdown
## Breaking Changes

**⚠️ API 변경사항**:
- `GET /v1/subscriptions` 응답 형식 변경
  - Before: `{ subscriptions: [...] }`
  - After: `{ data: [...], meta: {...} }`

**마이그레이션 가이드**:
```javascript
// Before
const { subscriptions } = await api.getSubscriptions();

// After
const { data: subscriptions } = await api.getSubscriptions();
```
```

### Git 태그 생성

릴리즈 노트 생성 후 Git 태그를 추가합니다:

```bash
# Annotated tag 생성
git tag -a v0.1.0 -m "Release v0.1.0"

# 태그 푸시
git push origin v0.1.0
```

### GitHub Release Draft vs Publish

**Draft**:
- 팀 내부 검토용
- 외부에 공개되지 않음
- 릴리즈 노트 수정 가능

**Publish**:
- 외부에 공개
- GitHub Releases 페이지에 표시
- 이메일 알림 (Watch하는 사용자)

**권장 워크플로우**:
```bash
# 1. Draft 생성
gh release create v0.1.0 --draft

# 2. 팀 검토 및 수정

# 3. Publish
gh release edit v0.1.0 --draft=false
```

### 자동 릴리즈 노트 vs 수동 작성

**자동 생성 장점**:
- EPIC/Story 기반 구조화
- progress.md와 일관성
- 빠른 생성

**수동 보완 필요**:
- Summary 요약 (AI가 초안 제공, 사용자 검토)
- Breaking Changes 상세 설명
- Migration Guide
- Known Issues

**권장**:
- AI 에이전트가 초안 생성
- 사용자가 검토 및 보완

### Changelog와의 차이

| 항목 | Release Notes | CHANGELOG.md |
|------|---------------|--------------|
| **대상** | 사용자, 고객 | 개발자 |
| **내용** | 비즈니스 가치 강조 | 기술적 변경 상세 |
| **형식** | 마크다운 (풍부한 설명) | Keep a Changelog 형식 |
| **위치** | `.context/releases/` | 레포지토리 루트 |

**필요 시 CHANGELOG.md도 생성**:
```markdown
# Changelog

## [0.1.0] - 2025-11-29

### Added
- Tenant & User Management (EPIC-025)
- Subscription Approval Workflow (EPIC-026)

### Fixed
- Keycloak Realm creation error handling (#35)
- Tenant list infinite scroll bug (#42)
```

### 멀티 프로젝트 릴리즈

**여러 프로젝트를 동시에 릴리즈하는 경우**:

```bash
# imp-gateway v0.1.0
/generate-release-notes v0.1.0

# imprun-agent v0.2.0
/generate-release-notes v0.2.0

# 조직 전체 릴리즈 노트
# .context/weekly/release-2025-11-29.md
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
