**Note**: 한국어로 답변하고, 간결하게 진행하세요.

---

**⚠️ 선택적 명령어**: 이 명령어는 개발자 선택사항입니다.

현재 브랜치의 작업 상태를 빠르게 파악합니다.

**사용 시나리오**:
- Claude Code의 자동 요약(auto compact) 후 컨텍스트가 잘못 요약되었을 때
- `/clear` 후 컨텍스트가 사라졌을 때
- 다른 브랜치에서 돌아왔을 때
- 오랜 시간 후 작업을 재개할 때

**참고**:
- Claude Code가 버전업되면서 auto compact가 개선되면 이 명령어는 불필요해질 수 있습니다.
- 대부분의 경우 `/daily-start`로 충분할 수 있습니다.

---

## 1단계: Git 상태 확인

```bash
# 현재 브랜치 및 변경 파일
git status

# main 브랜치 대비 변경 파일 목록
git diff --name-only main...HEAD

# 최근 커밋 5개
git log --oneline -5
```

---

## 2단계: progress.md 읽기

`.context/{프로젝트}/progress.md` 읽기:
- 현재 진행 중인 EPIC 확인
- 🏗️ In Progress 상태인 Story 확인
- 최근 일일 로그 확인 (마지막 3일)

**출력 예시**:
```
📋 현재 작업 상태

**EPIC-025**: Tenant & User Management (60% 완료)
- Story 25.1: Audit Log DB Schema ✅ 완료
- Story 25.2: API Endpoints 🏗️ 진행중 (3/5 tasks)
- Story 25.3: Frontend UI ⏳ 대기중
```

---

## 3단계: Serena 기반 코드 컨텍스트 (선택)

**중요**: 변경된 파일이 많을 경우, Serena MCP로 빠르게 개요 파악:

```
변경 파일 10개 이하:
→ 파일 목록만 표시

변경 파일 10개 초과:
→ mcp__serena__get_symbols_overview로 주요 파일만 심볼 개요 확인
→ 어떤 모듈/컴포넌트가 변경되었는지 요약
```

**예시**:
```
🔍 변경된 코드 (Serena 분석)

**Backend (Go)**:
- internal/api/v1/operator/tenants.go: CreateTenant, ListTenants 함수
- internal/data/repo/tenant_repo.go: Repository 메서드

**Frontend (React)**:
- web/src/pages/operator/tenants-page.tsx: Tenants 목록 페이지
- web/src/entities/operator-tenant/: Tenant entity 추가
```

---

## 4단계: 다음 작업 제안

**AI 에이전트 작업**:
1. progress.md의 미완료 Task 파악
2. 우선순위(P0) 및 의존성 고려
3. 다음에 할 작업 3가지 제안

**출력 예시**:
```
🎯 다음 작업 제안

**우선순위 P0**:
1. Story 25.2: Task 4 - Tenant 삭제 API 구현
2. Story 25.2: Task 5 - 유닛 테스트 작성

**우선순위 P1** (Story 25.2 완료 후):
3. Story 25.3: Frontend Tenant 목록 UI 시작
```

---

## 5단계: 간결한 요약

모든 정보를 한눈에 볼 수 있도록 요약:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 작업 상황 캐치업
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**현재 브랜치**: feature/tenant-user-management
**진행 중인 EPIC**: EPIC-025 (60% 완료)
**진행 중인 Story**: Story 25.2 - API Endpoints (3/5 tasks)

**최근 커밋** (3개):
- feat: add tenant create API
- test: add tenant repo unit tests
- refactor: extract tenant service

**변경 파일**: 15개 (Backend 8개, Frontend 7개)

**다음 작업**:
- [ ] Story 25.2: Task 4 - Tenant 삭제 API
- [ ] Story 25.2: Task 5 - 유닛 테스트

**마지막 업데이트**: YYYY-MM-DD (2일 전)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 6단계: Serena Memory 참고 (선택)

오랜만에 작업을 재개하는 경우, Serena 최신 분석 확인 제안:

> 💡 Serena의 최신 프로젝트 분석을 확인하시겠습니까?
>
> `.serena/memories/project-overview.md` - 전체 구조
> `.context/archive/{프로젝트}/serena-*.md` - 과거 스냅샷
>
> (y/n)

**y 응답 시**:
- Serena memory 파일 읽기
- 주요 아키텍처 변경사항 요약 (있는 경우)

---

## 참고

**이 명령어의 목적**:
- `/daily-start`보다 더 빠르고 간결함
- 컨텍스트 손실 시 즉시 복구
- 5분 안에 현재 상태 파악

**다른 명령어와의 비교**:
- `/catchup`: 빠른 상태 확인 (2-3분)
- `/daily-start`: 상세한 컨텍스트 복구 + 계획 수립 (5-10분)
- `/sync-progress`: progress.md와 코드 동기화 (작업 후)
