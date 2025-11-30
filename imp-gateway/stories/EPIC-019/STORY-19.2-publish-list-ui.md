# STORY-19.2: Publish 목록 UI (Product 상세 내)

## 1. 개요
**Epic**: EPIC-019 ProductPublish 배포
**제목**: Publish 목록 UI (Product 상세 내)
**담당자**: AI Agent
**상태**: ✅ 완료

## 2. 목적
Product 상세 페이지 내에 배포 현황 섹션을 구현하고, 환경별 배포 목록을 표시한다.

## 3. 구현 상세

### 3.1. UI 와이어프레임
```
┌─ 배포 현황 ──────────────────────────────────────────────────┐
│                                                               │
│  3개 환경에 배포됨                        [ + 새 배포 생성 ] │
│                                                               │
│  ┌───────────────┬───────────────┬───────────────┐           │
│  │      DEV      │    STAGING    │     PROD      │           │
│  ├───────────────┼───────────────┼───────────────┤           │
│  │ kr-dev        │ kr-staging    │ kr-prod       │           │
│  │ ● PUBLISHED   │ ● PUBLISHED   │ ● PUBLISHED   │           │
│  │ auth: none    │ auth: apikey  │ auth: oauth2  │           │
│  │               │               │               │           │
│  │ [상세보기]    │ [상세보기]    │ [상세보기]    │           │
│  └───────────────┴───────────────┴───────────────┘           │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### 3.2. 컴포넌트 구조
- `PublishListSection` - Product 상세 내 배포 목록 섹션
- `PublishCard` - 개별 배포 카드
- `PublishStatusBadge` - 배포 상태 뱃지

### 3.3. 데이터 흐름
1. Product 상세 페이지에서 `usePublishes(productId)` 호출
2. 환경별로 그룹화하여 카드 형태로 표시
3. "새 배포 생성" 버튼 클릭 시 `/provider/products/:id/publish` 이동

## 4. 수용 기준
- [x] Product 상세 페이지에 배포 현황 섹션 표시
- [x] 환경별 배포 목록 카드 UI
- [x] 배포 없는 경우 빈 상태 메시지
- [x] "새 배포 생성" 버튼 (Product가 active 상태일 때만 활성화)
- [x] "상세보기" 클릭 시 배포 상세 페이지 이동

## 5. 참조 파일
- `web/src/pages/provider/product/product-detail-page.tsx`
- `web/src/entities/publish/ui/publish-card.tsx`
