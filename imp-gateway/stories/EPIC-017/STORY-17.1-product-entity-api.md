# STORY-17.1: Product Entity FSD 패턴 재개발

## 1. 개요
**Epic**: EPIC-017 Product 관리
**제목**: Product 엔티티 FSD 패턴 재개발
**담당자**: AI Agent
**상태**: 🔲 미시작

## 2. 목적
기존 Product 엔티티를 FSD 패턴과 TanStack Query 기반으로 재개발한다.

## 3. 변경 개요

```mermaid
flowchart LR
    subgraph AS-IS["AS-IS (현재)"]
        A1[productApi.list] --> A2[useState]
        A1 --> A3[useEffect]
        A2 --> A4[수동 상태 관리]
    end

    subgraph TO-BE["TO-BE (목표)"]
        B1[useProducts] --> B2[TanStack Query]
        B2 --> B3[자동 캐싱]
        B2 --> B4[자동 재요청]
        B2 --> B5[쿼리 무효화]
    end

    AS-IS -.->|재개발| TO-BE
```

## 4. 현재 코드 분석 (AS-IS)

### 4.1. 구조 비교

```mermaid
flowchart TB
    subgraph Current["현재 Product 구조 ❌"]
        P1[product-api.ts]
        P1 --> P2["직접 API 호출<br/>async/await"]
        P1 --> P3["Query Hooks 없음"]
        P1 --> P4["Query Keys 없음"]
    end

    subgraph Reference["참조: Cluster 구조 ✅"]
        C1[cluster-api.ts]
        C1 --> C2["clusterKeys 팩토리"]
        C1 --> C3["useClusters 훅"]
        C1 --> C4["useCreateCluster 뮤테이션"]
    end
```

### 4.2. 문제점
```
entities/product/
├── api/
│   └── product-api.ts    ← 직접 API 호출, Query hooks 없음
├── model/
│   └── types.ts          ← OK
├── ui/
│   └── product-card.tsx  ← 부분적으로 사용 가능
└── index.ts              ← export * (안티패턴)
```

- TanStack Query 미사용 → 캐싱, 재요청 관리 불가
- Query Keys 없음 → 무효화 관리 불가
- `export *` 사용 → 명시적이지 않음
- Cluster 등 다른 Entity와 패턴 불일치

## 5. 구현 상세 (TO-BE)

### 5.1. 디렉토리 구조

```mermaid
flowchart TB
    subgraph Entity["entities/product/"]
        I[index.ts] --> M[model/types.ts]
        I --> A[api/product-api.ts]
        I --> U1[ui/product-card.tsx]
        I --> U2[ui/product-status-badge.tsx]

        A --> QK[productKeys]
        A --> QH[Query Hooks]
        A --> MH[Mutation Hooks]
    end

    style U2 fill:#90EE90
    style QK fill:#90EE90
    style QH fill:#90EE90
    style MH fill:#90EE90
```

### 5.2. Query Keys 구조

```mermaid
flowchart TD
    subgraph Keys["productKeys"]
        ALL["all: ['products']"]
        ALL --> LISTS["lists(): [...all, 'list']"]
        LISTS --> LIST["list(params): [...lists(), params]"]
        ALL --> DETAILS["details(): [...all, 'detail']"]
        DETAILS --> DETAIL["detail(id): [...details(), id]"]
    end
```

### 5.3. 데이터 흐름

```mermaid
sequenceDiagram
    participant C as Component
    participant H as useProducts Hook
    participant Q as TanStack Query
    participant A as API

    C->>H: useProducts({ status: 'active' })
    H->>Q: queryKey: productKeys.list(params)

    alt 캐시 있음
        Q-->>H: 캐시된 데이터 반환
    else 캐시 없음
        Q->>A: GET /api/v1/provider/products
        A-->>Q: ProductListResult
        Q->>Q: 캐시 저장
        Q-->>H: 데이터 반환
    end

    H-->>C: { data, isLoading, error }
```

### 5.4. 뮤테이션 & 캐시 무효화

```mermaid
sequenceDiagram
    participant C as Component
    participant M as useCreateProduct
    participant Q as TanStack Query
    participant A as API

    C->>M: mutate(newProduct)
    M->>A: POST /api/v1/provider/products
    A-->>M: Created Product
    M->>Q: invalidateQueries(productKeys.lists())
    Q->>Q: 목록 캐시 무효화
    Q->>A: 자동 재요청 (백그라운드)
    M-->>C: onSuccess 콜백
```

## 6. 수용 기준
- [ ] `productKeys` Query Keys 팩토리 구현
- [ ] `useProducts(params)` 목록 조회 훅 구현
- [ ] `useProduct(id)` 단일 조회 훅 구현
- [ ] `useCreateProduct()` 생성 뮤테이션 구현
- [ ] `useUpdateProduct()` 수정 뮤테이션 구현
- [ ] `useDeleteProduct()` 삭제 뮤테이션 구현
- [ ] 뮤테이션 성공 시 쿼리 무효화 처리
- [ ] `ProductStatusBadge` 컴포넌트 신규 생성
- [ ] `index.ts` 명시적 named exports로 변경

## 7. 참조 파일
- `web/src/entities/cluster/api/cluster-api.ts` - Query hooks 패턴
- `web/src/entities/cluster/index.ts` - Export 패턴
- `web/src/entities/service/` - EPIC-016 Service 엔티티

## 8. 비고
- 기존 `product-api.ts`의 API 함수들은 내부 함수로 변환
- 기존 사용처(pages)는 STORY-17.2에서 함께 수정
