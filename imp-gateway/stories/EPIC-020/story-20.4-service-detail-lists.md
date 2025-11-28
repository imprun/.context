# Story 20.4: API Service 상세 내 Route/Backend/Policy 목록

## 개요

| 항목 | 내용 |
|------|------|
| **Story ID** | 20.4 |
| **Epic** | EPIC-020 (Route & Policy 설정) |
| **우선순위** | P0 |
| **예상 공수** | 1일 |
| **상태** | 🔲 미시작 |
| **담당자** | - |

## 목표

기존 API Service 상세 페이지에 Route, Backend, Policy 목록을 탭으로 구성하여 표시한다.

## 배경

EPIC-016에서 구현된 API Service 상세 페이지에 Routes, Backends, Policies 섹션이 준비되어 있다. 본 스토리에서 실제 데이터를 조회하여 목록으로 표시한다.

## 의존성

- Story 20.1 (Route 엔티티)
- Story 20.2 (Backend 엔티티)
- Story 20.3 (Policy 엔티티)

## 요구사항

### 기능 요구사항

1. **탭 구조 개선**
   - Overview, Routes, Backends, Policies 4개 탭
   - URL 쿼리 파라미터로 탭 상태 유지 (`?tab=routes`)

2. **Routes 탭**
   - Route 목록 테이블
   - 컬럼: Name, Path, Methods, Backend, Priority, Status
   - "Add Route" 버튼 (Story 20.5에서 연결)
   - 각 행에 Edit/Delete 액션

3. **Backends 탭**
   - Backend 목록 테이블
   - 컬럼: Name, Scheme, Endpoints, Status
   - "Add Backend" 버튼 (Story 20.6에서 연결)
   - 각 행에 Edit/Delete 액션

4. **Policies 탭**
   - Policy 목록 카드 뷰 또는 테이블
   - 컬럼: Name, Type, Target, Enabled
   - "Add Policy" 버튼 (Story 20.7에서 연결)
   - 각 행에 Edit/Delete 액션

### 비기능 요구사항

- 각 탭 진입 시 해당 데이터만 로드 (lazy loading)
- 로딩 상태 표시 (Skeleton)
- 빈 목록일 때 Empty state 표시

## 기술 상세

### UI 구조

```
ServiceDetailPage
├── Header (Service Name, Status, Actions)
├── Tabs
│   ├── Overview (기존 기본 정보)
│   ├── Routes
│   │   ├── AddRouteButton
│   │   └── RoutesTable
│   ├── Backends
│   │   ├── AddBackendButton
│   │   └── BackendsTable
│   └── Policies
│       ├── AddPolicyButton
│       └── PoliciesTable
```

### 탭 URL 상태 관리

```
/provider/services/:id              -> Overview 탭
/provider/services/:id?tab=routes   -> Routes 탭
/provider/services/:id?tab=backends -> Backends 탭
/provider/services/:id?tab=policies -> Policies 탭
```

### 컴포넌트 위치

```
web/src/
├── widgets/provider/
│   ├── service-routes-table/
│   │   └── index.tsx
│   ├── service-backends-table/
│   │   └── index.tsx
│   └── service-policies-table/
│       └── index.tsx
└── pages/provider/
    └── service-detail-page.tsx (수정)
```

## 수용 기준

- [ ] 4개 탭이 정상 동작한다
- [ ] 각 탭에서 해당 목록이 표시된다
- [ ] URL 쿼리로 탭 상태가 유지된다
- [ ] 로딩/에러/빈 상태가 처리된다
- [ ] Add 버튼이 표시된다 (비활성화 상태 가능)

## 참조

- 기존 페이지: `web/src/pages/provider/service-detail-page.tsx`
- 탭 컴포넌트: shadcn/ui Tabs
- 테이블 패턴: `web/src/pages/provider/services-page.tsx`
