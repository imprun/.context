**Note**: 한국어로 답변하고, Serena MCP를 최대한 활용하여 토큰을 절약하세요.

어제 작업을 이어받아 오늘 개발을 시작합니다.

## 1단계: 진행상황 파악

1. **컨텍스트 문서 읽기**
   - `.context/{프로젝트}/progress.md` 읽기 (Story 진행률 + 일일 로그)
   - 진행 중인 Story 파일 읽기 (`.context/{프로젝트}/stories/EPIC-*/story-*.md`)
   - `.context/daily/` 에서 가장 최근 파일 확인 (있는 경우)
   - 어제 완료한 작업과 오늘 P0 목표 파악

2. **Git 상태 확인**
   - `git status` 로 uncommitted 변경사항 확인
   - `git log --oneline -5` 로 최근 커밋 확인
   - `git diff --name-only HEAD~1..HEAD` 로 최근 변경 파일 목록

## 2단계: 코드 컨텍스트 복구 (Serena MCP 우선)

**중요**: 코드 파일을 읽을 때는 **반드시 Serena MCP 도구를 우선 사용**하세요.

### Serena MCP가 활성화된 경우

1. **변경된 파일 심볼 개요**
   - Git에서 변경된 파일들에 대해 `mcp__serena__get_symbols_overview` 사용
   - 파일 전체를 읽지 말고 **심볼 목록만** 먼저 확인

2. **주요 심볼 본문 읽기** (필요 시에만)
   - 진행 중인 작업과 관련된 심볼만 `mcp__serena__find_symbol` 으로 읽기
   - `include_body=true`는 최소한으로만 사용

3. **관련 심볼 탐색**
   - 작업 중인 함수/클래스의 참조를 `mcp__serena__find_referencing_symbols`로 확인
   - 영향 범위 파악

**예시**:
```
변경 파일: services/imprun-server/internal/api/v1/provider/subscriptions.go
→ get_symbols_overview로 함수 목록만 확인
→ 진행 중인 "ApproveSubscription" 함수만 find_symbol로 읽기
→ 전체 파일 Read는 피함 (토큰 절약)
```

### Serena MCP가 없는 경우

- Git diff 출력과 progress.md만으로 상태 파악
- **코드 파일은 읽지 않음** (토큰 낭비 방지)
- 필요하면 개발자에게 "어떤 파일 작업 중이셨나요?" 질문

## 3단계: 오늘 계획 제안

- **어제 미완료 작업 우선**
- **새로운 P0 목표 제시**
- **팀원 확인 필요사항 리마인드** (progress.md에 있는 경우)

## 출력 형식

간결하게 보고하고, 바로 작업을 시작할 수 있도록 준비하세요.

**예시**:
```
📋 어제 진행 상황
- Story 1.1 완료 (6/6 tasks) ✅
- Story 1.2 시작 (0/4 tasks)

📝 최근 커밋
- feat: Add subscription approval API
- test: Add subscription repo unit tests

🔍 작업 중인 코드 (Serena 분석)
- subscriptions.go: ApproveSubscription, RejectSubscription 함수
- subscription_repo.go: ListByProviderTenant 메서드

🎯 오늘 목표 (P0)
- [ ] Story 1.2: Dashboard Stats API 시작
- [ ] GET /v1/provider/dashboard/stats 엔드포인트 구현

⚠️ 확인 필요
- 없음
```
