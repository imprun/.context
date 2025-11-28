# EPIC-010: 프로젝트 기반 설정

## 개요

| 항목 | 내용 |
|------|------|
| **Epic ID** | EPIC-010 |
| **제목** | 프로젝트 기반 설정 |
| **우선순위** | P0 |
| **예상 기간** | 1주 |
| **상태** | ✅ 완료 |
| **의존성** | 없음 |
| **GitHub Issue** | [#3](https://github.com/imprun/imp-gateway/issues/3) |

## 목표

Next.js 16 기반의 FSD(Feature-Sliced Design) 아키텍처와 shadcn/ui를 활용한 프론트엔드 프로젝트 기반을 구축한다.

## 배경

Imp-Gateway v2 프론트엔드는 세 가지 독립 포털(Operator, Provider, Consumer)을 지원해야 한다. 확장성과 유지보수성을 위해 FSD 아키텍처를 채택하고, 일관된 UI를 위해 shadcn/ui 컴포넌트 시스템을 사용한다.

## 완료된 범위

### 기술 스택 설정
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript 5.x
- **UI**: shadcn/ui + Tailwind CSS 4.x
- **State**: TanStack Query 5.x
- **Form**: React Hook Form + Zod
- **Icons**: Lucide React

### FSD 디렉토리 구조
```
web/
├── app/                    # Next.js App Router (라우팅 진입점)
│   ├── layout.tsx          # 루트 레이아웃
│   ├── page.tsx            # 홈 페이지
│   ├── operator/           # Operator 포털 라우트
│   ├── provider/           # Provider 포털 라우트
│   ├── consumer/           # Consumer 포털 라우트
│   └── auth/               # 인증 라우트
└── src/
    ├── app/                # FSD Layer 1: 전역 프로세스 (App-wide)
    ├── pages/              # FSD Layer 2: 페이지 조립 (Composition)
    ├── widgets/            # FSD Layer 3: 독립 UI 블록
    ├── features/           # FSD Layer 4: 사용자 기능 단위
    ├── entities/           # FSD Layer 5: 비즈니스 도메인
    └── shared/             # FSD Layer 6: 공용 유틸리티
        ├── api/            # API 클라이언트
        ├── components/     # 공용 UI 컴포넌트
        │   └── ui/         # shadcn/ui 컴포넌트
        ├── config/         # 환경 설정
        ├── hooks/          # 공용 훅
        └── lib/            # 유틸리티
```

### 개발 환경
```bash
pnpm dev          # Turbopack 개발 서버 (port 3000)
pnpm build        # Production 빌드
pnpm lint         # ESLint
pnpm type-check   # TypeScript 체크
```

## 구현된 파일

### 프로젝트 설정
- `web/package.json` - 의존성 정의
- `web/tsconfig.json` - TypeScript 설정
- `web/tailwind.config.ts` - Tailwind 설정
- `web/components.json` - shadcn/ui 설정

### 공용 모듈
- `web/src/shared/api/client.ts` - Axios 클라이언트 (인터셉터 포함)
- `web/src/shared/config/env.ts` - 환경 변수 관리
- `web/src/shared/lib/utils.ts` - 유틸리티 함수 (cn 등)

### shadcn/ui 컴포넌트
- `web/src/shared/components/ui/` - 버튼, 카드, 테이블, 폼 등 기본 컴포넌트

## 수용 기준 (완료)

- [x] Next.js 15 App Router 프로젝트 초기화
- [x] FSD 디렉토리 구조 설정
- [x] TypeScript strict 모드 활성화
- [x] Tailwind CSS 4.x 설정
- [x] shadcn/ui 초기화 및 기본 컴포넌트 추가
- [x] TanStack Query Provider 설정
- [x] Axios 클라이언트 및 인터셉터 구현
- [x] 환경 변수 관리 체계 구축
- [x] ESLint + Prettier 설정

## 기술적 결정 사항

### Next.js 16 선택 이유
- App Router의 서버 컴포넌트 지원
- Turbopack으로 빠른 개발 환경
- React 19 호환

### FSD 아키텍처 선택 이유
- 레이어별 명확한 책임 분리
- 피처 단위 독립성 보장
- 대규모 프로젝트 확장성

### FSD + Next.js App Router 통합
> 참조: [Feature-Sliced Design - With Next.js](https://feature-sliced.github.io/documentation/docs/guides/tech/with-nextjs)

Next.js App Router와 FSD를 함께 사용할 때 **폴더 충돌 문제**가 발생한다. Next.js의 `app/` 폴더는 라우팅 전용이고, FSD의 `app/` 레이어는 전역 프로세스용이기 때문이다.

**해결 방식**:
```
web/
├── app/                    # Next.js 라우팅 (프로젝트 루트에 유지)
│   └── example/page.tsx    # src/pages에서 재내보내기만 수행
└── src/                    # FSD 레이어들
    ├── app/                # FSD app 레이어 (전역 프로세스)
    ├── pages/              # FSD pages 레이어 (페이지 컴포넌트)
    └── ...
```

**핵심 원칙**:
1. `web/app/` - Next.js 라우팅 전용 (page.tsx, layout.tsx만)
2. `web/src/pages/` - 실제 페이지 UI 컴포넌트 정의
3. `web/app/*/page.tsx`에서 `src/pages/`의 컴포넌트를 import하여 렌더링
4. FSD의 평탄한 슬라이스 구조 유지

### shadcn/ui 선택 이유
- 복사-붙여넣기 방식으로 완전한 커스터마이징 가능
- Radix UI 기반 접근성 보장
- Tailwind CSS와 자연스러운 통합

---

## 변경 이력

| 날짜 | 버전 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 2025-11-26 | 1.0 | 초기 구현 완료 | - |
| 2025-11-27 | 1.1 | 에픽 문서 작성 | - |
