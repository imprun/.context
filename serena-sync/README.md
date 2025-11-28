# Serena MCP 연동

Serena MCP의 분석 결과를 `.context/archive/`에 보관하는 도구입니다.

---

## Serena MCP란?

**Serena MCP**는 Claude Code가 코드베이스를 분석하여 자동으로 프로젝트 지식을 생성하는 도구입니다.

### 분석 결과 저장 위치

```
../.serena/memories/
├── project-overview.md       # 프로젝트 전체 개요
├── auth-architecture.md      # 인증 아키텍처 분석
├── api-design-patterns.md    # API 설계 패턴
└── ...
```

### Serena가 생성하는 메모리 종류

- **프로젝트 개요**: 전체 구조, 주요 모듈, 기술 스택
- **아키텍처 분석**: 시스템 아키텍처, 컴포넌트 관계
- **설계 패턴**: 사용된 디자인 패턴, 코드 스타일
- **API 문서**: 엔드포인트 목록, 요청/응답 형식

---

## 왜 보관하나요?

### 문제점

Serena의 `.serena/memories/` 파일은:
- **휘발성**: 새로운 분석 시 덮어씌워짐
- **로컬 전용**: 팀원과 공유 불가
- **버전 관리 없음**: Git으로 추적되지 않음

### 해결책

`.context/archive/{프로젝트}/`에 보관하여:
- ✅ **영구 보관**: 과거 시스템 상태 스냅샷
- ✅ **팀 공유**: Git 커밋으로 팀원과 공유
- ✅ **시간별 추적**: 아키텍처 변화 추적 가능

---

## 사용 방법

### 1. 대화형 모드 (권장)

```bash
cd .context
node serena-sync/sync-memory.js
```

**출력**:
```
📋 5개 파일 발견:

  1. project-overview.md (2025-11-29, 12.3KB)
  2. auth-architecture.md (2025-11-28, 8.1KB)
  3. api-design-patterns.md (2025-11-27, 5.2KB)
  4. repository-pattern.md (2025-11-26, 4.1KB)
  5. frontend-structure.md (2025-11-25, 6.8KB)

보관할 파일 번호를 입력하세요 (예: 1,3,5 또는 all):
```

**입력 예시**:
```
1,2
```

**결과**:
```
✅ 보관: serena-2025-11-29-project-overview.md
✅ 보관: serena-2025-11-29-auth-architecture.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 보관 완료
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 새로 보관: 2개
⏭️  건너뜀: 0개

대상 디렉토리: .context/archive/imp-gateway/
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 2. 자동 모드

최근 7일 이내 파일을 자동으로 보관:

```bash
cd .context
node serena-sync/sync-memory.js --auto
```

**출력**:
```
📋 최근 7일 이내 파일 3개를 보관합니다:

  - project-overview.md (2025-11-29)
  - auth-architecture.md (2025-11-28)
  - api-design-patterns.md (2025-11-27)

✅ 보관: serena-2025-11-29-project-overview.md
✅ 보관: serena-2025-11-29-auth-architecture.md
✅ 보관: serena-2025-11-29-api-design-patterns.md
```

---

## 보관된 파일 구조

```
.context/archive/imp-gateway/
├── serena-2025-11-29-project-overview.md
├── serena-2025-11-29-auth-architecture.md
├── serena-2025-11-28-api-design-patterns.md
└── serena-2025-11-27-repository-pattern.md
```

**파일명 형식**: `serena-YYYY-MM-DD-{원본파일명}.md`

---

## 언제 보관하나요?

### 권장 보관 시점

1. **주간보고 전** (매주 금요일)
   ```bash
   cd .context
   node serena-sync/sync-memory.js --auto
   /weekly-report
   ```

2. **중요한 아키텍처 변경 전후**
   ```bash
   # Before: 대규모 리팩토링 전
   node serena-sync/sync-memory.js

   # ... 리팩토링 작업 ...

   # After: 리팩토링 후
   node serena-sync/sync-memory.js
   ```

3. **EPIC 시작 전**
   ```bash
   # 현재 시스템 상태 스냅샷
   node serena-sync/sync-memory.js

   /create-epic
   # → EPIC 문서의 Background에 현재 시스템 상태 참조
   ```

4. **릴리즈 전**
   ```bash
   node serena-sync/sync-memory.js --auto
   /generate-release-notes v0.1.0
   ```

### 보관 주기

- **정기**: 매주 금요일 (자동 모드)
- **수시**: 중요 변경 전후 (대화형 모드)

---

## Git 커밋

보관 후 반드시 Git 커밋 및 푸시:

```bash
cd .context
git add archive/{프로젝트}/
git commit -m "docs: Serena 메모리 보관 (2025-11-29)"
git push
```

**중요**: 팀원들과 공유하고 백업을 위해 반드시 push!

---

## 보관된 파일 활용

### EPIC 생성 시

```markdown
## Background

### 현재 시스템 상태

> 📊 **Serena Memory 기반**: `.context/archive/imp-gateway/serena-2025-11-29-project-overview.md`

현재 시스템은 3-tier 아키텍처로 구성되어 있으며...
```

### 주간보고 시

```markdown
### Serena 분석 요약

> 📊 **Serena Memory 기반**: `.context/archive/imp-gateway/serena-2025-11-29-*.md`

- 이번 주 아키텍처 변경: Repository 패턴 도입
- 새로운 패턴: Service 계층 분리
```

### 아키텍처 변화 추적

```bash
# 지난주 vs 이번주 비교
diff .context/archive/imp-gateway/serena-2025-11-22-project-overview.md \
     .context/archive/imp-gateway/serena-2025-11-29-project-overview.md
```

---

## 문제 해결

### Serena memory 디렉토리를 찾을 수 없습니다

**증상**:
```
❌ Serena memory 디렉토리를 찾을 수 없습니다: ../.serena/memories
```

**원인**: Serena MCP 미설치 또는 메모리 미생성

**해결**:
1. Serena MCP 설치 확인: https://github.com/oraios/serena
2. Claude Code에서 Serena MCP 활성화 확인
3. 프로젝트 분석 실행:
   ```bash
   # Claude Code에서
   mcp__serena__get_symbols_overview(...)
   ```

### 파일이 없습니다

**증상**:
```
⚠️ Serena memory 파일이 없습니다.
```

**원인**: Serena가 아직 프로젝트를 분석하지 않음

**해결**:
Claude Code에서 Serena MCP 도구를 사용하여 프로젝트 분석:
```
mcp__serena__get_symbols_overview("services/imprun-server/internal/api/...")
```

몇 번 사용하면 `.serena/memories/` 폴더에 메모리 파일이 생성됩니다.

### 중복 파일

**증상**:
```
⏭️  건너뜀: serena-2025-11-29-project-overview.md (동일)
```

**설명**: 같은 날짜에 동일한 내용으로 이미 보관된 파일입니다.

**해결**: 정상 동작입니다. 내용이 다르면 자동으로 업데이트됩니다.

---

## 고급 사용법

### 특정 파일만 보관

```bash
# 대화형 모드에서 파일 번호 선택
node serena-sync/sync-memory.js
# 입력: 1,3,5
```

### 모든 파일 보관

```bash
# 대화형 모드에서 'all' 입력
node serena-sync/sync-memory.js
# 입력: all
```

### 자동화 (Cron)

매주 금요일 자동 보관:

```bash
# crontab -e
0 18 * * 5 cd /path/to/.context && node serena-sync/sync-memory.js --auto
```

### NPM 스크립트로 실행

`.context/package.json`에 스크립트 추가:

```json
{
  "scripts": {
    "serena:sync": "node serena-sync/sync-memory.js",
    "serena:auto": "node serena-sync/sync-memory.js --auto"
  }
}
```

**사용**:
```bash
npm run serena:sync  # 대화형 모드
npm run serena:auto  # 자동 모드
```

---

## 참고

### Serena MCP 도구

Claude Code에서 사용 가능한 Serena MCP 도구:

| 도구 | 용도 |
|------|------|
| `get_symbols_overview` | 파일의 심볼 목록 |
| `find_symbol` | 특정 심볼 본문 |
| `find_referencing_symbols` | 심볼 참조 찾기 |
| `search_for_pattern` | 패턴 검색 |

### 메모리 파일 크기

- 작은 프로젝트: 수 KB ~ 수십 KB
- 중간 프로젝트: 수십 KB ~ 수백 KB
- 큰 프로젝트: 수백 KB ~ 수 MB

**권장**: 파일 크기가 1MB 이상이면 대화형 모드로 필요한 파일만 선택

### 보관 용량

`.context/archive/` 디렉토리 크기 관리:

```bash
# 용량 확인
du -sh .context/archive/

# 오래된 파일 정리 (6개월 이상)
find .context/archive/ -name "serena-*.md" -mtime +180 -delete
```

---

**마지막 업데이트**: 2025-11-29
**버전**: 1.0.0
**관리**: Imprun 조직
