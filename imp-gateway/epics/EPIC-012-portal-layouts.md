# EPIC-012: 포털 레이아웃

## 개요

| 항목 | 내용 |
|------|------|
| **Epic ID** | EPIC-012 |
| **제목** | 포털 레이아웃 |
| **우선순위** | P0 |
| **예상 기간** | 1주 |
| **상태** | ✅ 완료 |
| **의존성** | EPIC-010 (프로젝트 기반), EPIC-011 (인증) |

## 목표

Operator, Provider, Consumer 세 가지 포털의 공통 레이아웃(사이드바, 헤더, 브레드크럼)을 구현한다.

## 배경

Imp-Gateway는 역할별로 분리된 세 가지 포털을 제공한다:
- **Operator Portal**: 클러스터/에이전트 관리 (SRE/운영자)
- **Provider Portal**: API Service/Product 관리 (API 제공자)
- **Consumer Portal**: 카탈로그 탐색/구독 (API 소비자)

각 포털은 동일한 레이아웃 구조를 공유하되, 네비게이션 메뉴만 다르다.

## 구현 상태 요약

| 포털 | 레이아웃 | 사이드바 | 페이지 구현 |
|------|---------|---------|------------|
| **Operator** | ✅ | ✅ | ✅ Dashboard, Clusters, Agents |
| **Provider** | ✅ | ✅ | ✅ Dashboard, Products |
| **Consumer** | ✅ | ✅ | ⚠️ Dashboard만 (나머지 후속 에픽) |

> **Note**: Consumer 포털의 Marketplace, Subscriptions, Credentials 등 실제 페이지는 Phase 3 에픽(EPIC-021~024)에서 구현 예정

## 설계

### 레이아웃 구조

```
┌──────────────┬──────────────────────────────────────┐
│              │          Site Header                 │
│              ├──────────────────────────────────────┤
│   Sidebar    │          Breadcrumbs                 │
│   (포털별)   ├──────────────────────────────────────┤
│              │                                      │
│              │          Page Content                │
│              │                                      │
└──────────────┴──────────────────────────────────────┘
```

- **Sidebar**: 화면 좌측 전체 높이 차지, 포털별 네비게이션
- **Site Header**: 우측 컨텐츠 영역 상단 (사이드바 토글, 사용자 메뉴)
- **Breadcrumbs**: 현재 위치 표시
- **Page Content**: 실제 페이지 렌더링 영역

### 포털별 네비게이션 메뉴

| 포털 | 메뉴 항목 |
|------|----------|
| **Operator** | Dashboard, Clusters, Agents, Settings |
| **Provider** | Dashboard, Products, API Services, Gateways, Deployments |
| **Consumer** | Catalog, My Subscriptions, My Apps, Credentials |

### 헤더 구성 요소
- 사이드바 토글 버튼 (접기/펼치기)
- 브레드크럼 네비게이션
- 사용자 메뉴 (프로필, 로그아웃)

## 파일 구조

### 레이아웃 위젯 (`web/src/widgets/layout/`)
| 파일 | 역할 |
|------|------|
| `operator-sidebar.tsx` | Operator 포털 사이드바 |
| `provider-sidebar.tsx` | Provider 포털 사이드바 |
| `consumer-sidebar.tsx` | Consumer 포털 사이드바 |
| `portal-header.tsx` | 포털 공통 헤더 |
| `tenant-switcher.tsx` | 테넌트 전환 (Provider용) |

### App Router 레이아웃 (`web/app/`)
| 파일 | 역할 |
|------|------|
| `operator/layout.tsx` | Operator 포털 레이아웃 |
| `provider/layout.tsx` | Provider 포털 레이아웃 |
| `consumer/layout.tsx` | Consumer 포털 레이아웃 |

### 공용 컴포넌트 (`web/src/shared/components/`)
| 파일 | 역할 |
|------|------|
| `site-header.tsx` | 사이트 헤더 |
| `breadcrumbs.tsx` | 브레드크럼 네비게이션 |
| `nav-main.tsx` | 메인 네비게이션 |
| `nav-user.tsx` | 사용자 네비게이션 |
| `ui/sidebar.tsx` | shadcn 사이드바 컴포넌트 |
| `ui/sheet.tsx` | 모바일 사이드바 |

## 컴포넌트 설계

### 포털 레이아웃 구조
```tsx
<SidebarProvider>
  <PortalSidebar />           {/* 좌측 전체 높이 */}
  <SidebarInset>              {/* 우측 컨텐츠 영역 */}
    <SiteHeader />
    <Breadcrumbs />
    {children}
  </SidebarInset>
</SidebarProvider>
```

### 사이드바 구조
```tsx
<Sidebar>
  <SidebarHeader>
    <Logo />
    <TenantSwitcher />        {/* Provider만 */}
  </SidebarHeader>
  <SidebarContent>
    <NavMain items={menuItems} />
  </SidebarContent>
  <SidebarFooter>
    <NavUser />
  </SidebarFooter>
</Sidebar>
```

## 수용 기준

### 레이아웃 시스템 (✅ 완료)
- [x] SidebarProvider 기반 레이아웃 시스템 구현
- [x] 반응형 사이드바 (모바일 Sheet)
- [x] 사이드바 접기/펼치기 기능
- [x] 브레드크럼 네비게이션
- [x] 사용자 메뉴 (useAuth 연동)

### Operator 포털 (✅ 완료)
- [x] 사이드바 및 레이아웃
- [x] Dashboard 페이지
- [x] Clusters 목록/상세/생성 페이지
- [x] Agents 목록/상세/등록 페이지

### Provider 포털 (✅ 완료)
- [x] 사이드바 및 레이아웃
- [x] Dashboard 페이지
- [x] Products 목록/상세/생성/수정 페이지
- [x] 테넌트 전환 UI

### Consumer 포털 (⚠️ 레이아웃만 완료)
- [x] 사이드바 및 레이아웃
- [x] Dashboard 페이지 (플레이스홀더)
- [ ] Marketplace 페이지 → EPIC-021
- [ ] Subscriptions 페이지 → EPIC-022
- [ ] Credentials 페이지 → EPIC-023

## UI/UX 특징

### 반응형 디자인
- **Desktop**: 고정 사이드바 (접기 가능)
- **Mobile**: Sheet 형태의 오버레이 사이드바

### 사이드바 상태
- 열림/닫힘 상태 localStorage 저장
- 아이콘 모드 지원 (접힌 상태)

### 네비게이션 하이라이트
- 현재 경로에 따른 활성 메뉴 표시
- 중첩 라우트 지원

## 기술적 결정 사항

### shadcn/ui Sidebar 컴포넌트 사용
- 접근성 (ARIA) 지원
- 키보드 네비게이션
- 애니메이션 및 전환 효과

### App Router 레이아웃 활용
- 포털별 독립 레이아웃
- 중첩 레이아웃으로 공통 요소 재사용
- 서버 컴포넌트로 초기 렌더링 최적화

---

## 변경 이력

| 날짜 | 버전 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 2025-11-26 | 1.0 | 초기 구현 완료 | - |
| 2025-11-27 | 1.1 | 에픽 문서 작성 | - |
| 2025-11-27 | 1.2 | 포털별 실제 구현 상태 반영 | - |
