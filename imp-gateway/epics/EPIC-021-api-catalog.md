# EPIC-021: API 카탈로그

## 개요

| 항목 | 내용 |
|------|------|
| **Epic ID** | EPIC-021 |
| **제목** | API 카탈로그 |
| **우선순위** | P0 |
| **예상 기간** | 1주 |
| **상태** | 🔲 미시작 |
| **의존성** | EPIC-019 (배포된 Product 필요) |

## 목표

Consumer가 배포된 API Product를 탐색하고 상세 정보를 확인할 수 있다.

## 배경

API 카탈로그는 Consumer Portal의 핵심 기능으로, 배포된(PUBLISHED) Product를 마켓플레이스 형태로 제공한다. Consumer는 카탈로그를 통해 API를 탐색하고, 구독할 Product를 선택한다.

### 핵심 개념
- **카탈로그**: 배포된 ProductPublish 목록
- **Visibility**: public은 모든 Consumer에게 표시, private는 특정 조건 필요
- **Product 상세**: Product 정보, Plan 목록, API 설명

## 범위

### 포함
- 카탈로그 목록 페이지 (카드 그리드)
- 검색 (Product 이름, 설명)
- 필터 (카테고리, 태그)
- Product 상세 페이지
- Plan 정보 표시
- API 설명/문서 표시

### 제외
- OpenAPI 문서 뷰어 (Post-MVP)
- Try-it-out 기능 (Post-MVP)
- 카테고리 관리 (Post-MVP)

## 기술 요구사항

### 백엔드 API

```
# Consumer용 카탈로그 API
GET    /api/v1/consumer/catalog                   # 카탈로그 목록
GET    /api/v1/consumer/catalog/:publishId        # Product 상세 (ProductPublish 기준)
GET    /api/v1/consumer/catalog/:publishId/plans  # Plan 목록
```

### 데이터 모델

```typescript
interface CatalogItem {
  id: string;                    // ProductPublish ID
  product_id: string;
  product_name: string;
  product_description?: string;
  provider_name: string;
  environment: string;
  hostname_base: string;
  visibility: 'public' | 'private';
  plans: Plan[];
  tags?: string[];
  published_at: string;
}

interface Plan {
  id: string;
  name: string;
  description?: string;
  pricing_model: 'free' | 'flat' | 'usage';
  rate_limit?: {
    requests: number;
    period: string;
  };
  price?: {
    amount: number;
    currency: string;
    billing_cycle: string;
  };
}
```

### FSD 구조

```
web/src/
├── entities/catalog/
│   ├── index.ts
│   ├── model/
│   │   └── types.ts
│   ├── api/
│   │   └── catalog-api.ts
│   └── ui/
│       └── catalog-item-card.tsx
├── features/catalog/
│   ├── index.ts
│   ├── search/
│   │   └── ui/
│   │       └── catalog-search.tsx
│   └── filter/
│       └── ui/
│           └── catalog-filter.tsx
├── widgets/consumer/
│   ├── catalog-grid/
│   │   └── index.tsx
│   └── product-card/
│       └── index.tsx
├── pages/consumer/
│   ├── catalog-page.tsx
│   └── product-detail-page.tsx
└── app/consumer/
    ├── catalog/
    │   └── page.tsx
    └── products/
        └── [id]/
            └── page.tsx
```

## 스토리 분해

| Story | 제목 | 예상 | 우선순위 |
|-------|------|------|----------|
| 21.1 | Catalog 엔티티 및 API 훅 구현 | 0.5일 | P0 |
| 21.2 | 카탈로그 목록 페이지 (카드 그리드) | 1일 | P0 |
| 21.3 | 카탈로그 검색 기능 | 0.5일 | P0 |
| 21.4 | 카탈로그 필터 기능 | 0.5일 | P1 |
| 21.5 | Product 상세 페이지 구현 | 1.5일 | P0 |
| 21.6 | Plan 선택 UI | 1일 | P0 |

## 수용 기준

### 기능 요구사항
- [ ] 배포된 Product 목록을 카드 그리드로 볼 수 있다
- [ ] Product를 이름/설명으로 검색할 수 있다
- [ ] Product 상세 정보를 확인할 수 있다
- [ ] Product의 Plan 목록을 확인할 수 있다
- [ ] Plan별 가격/제한 정보를 확인할 수 있다
- [ ] Product 상세에서 구독 신청으로 이동할 수 있다

### 비기능 요구사항
- [ ] 무한 스크롤 또는 페이지네이션
- [ ] 반응형 그리드 레이아웃
- [ ] 빈 상태 처리 (카탈로그가 비어있을 때)

## UI/UX 가이드

### 카탈로그 목록 페이지
- 상단: 검색 바
- 사이드바/상단: 필터 (카테고리, 태그)
- 본문: 카드 그리드 (3-4열 반응형)

### Product 카드
- Product 이름 (대제목)
- Provider 이름
- 짧은 설명 (2줄 제한)
- 태그 배지
- "View Details" 버튼

### Product 상세 페이지
- Hero 섹션: Product 이름, Provider, 설명
- Plan 선택 섹션:
  - Plan 카드 목록 (가격, 제한 표시)
  - "Subscribe" 버튼 (각 Plan)
- API 정보 섹션:
  - Base URL
  - 포함된 API Service 목록

## 참조

### 패턴 참조 파일
- `web/src/pages/operator/clusters-page.tsx` - 목록 페이지 패턴

### 백엔드 API
- Consumer API 구현 필요 (신규)

---

## 변경 이력

| 날짜 | 버전 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 2025-01-XX | 1.0 | 초기 작성 | - |
