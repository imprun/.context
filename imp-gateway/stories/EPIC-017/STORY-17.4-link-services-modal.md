# STORY-17.4: API Service 연결 모달 구현

## 1. 개요
**Epic**: EPIC-017 Product 관리
**제목**: API Service 연결 모달 구현
**담당자**: AI Agent
**상태**: 🔲 미시작

## 2. 목적
Product에 API Service를 연결/해제할 수 있는 모달을 구현한다. 이것은 EPIC-017의 **핵심 기능**이다.

## 3. 기능 개요

```mermaid
flowchart LR
    subgraph Product["Product 상세"]
        P1["Payment API v2.0"]
        P2["연결된 Services: 2개"]
    end

    subgraph Modal["LinkServicesModal"]
        M1[Service 검색]
        M2[체크박스 선택]
        M3[Add Services 버튼]
    end

    subgraph Result["결과"]
        R1["api_services 업데이트"]
        R2["캐시 무효화"]
        R3["UI 갱신"]
    end

    Product -->|Add 버튼 클릭| Modal
    Modal -->|확인| Result
    Result -->|자동 갱신| Product
```

## 4. 전제 조건

### EPIC-016 (API Service) 필요 항목
- [ ] `useServices(params)` 훅 - Service 목록 조회
- [ ] `APIService` 타입 정의

**만약 EPIC-016이 미완료라면:** 간단한 mock 데이터로 UI만 구현하고, 추후 연동

## 5. 구현 상세

### 5.1. 디렉토리 구조

```mermaid
flowchart TB
    subgraph Features["features/product/"]
        LS["link-services/ ← 신규"]
        CP[create-product/]
        UP[update-product/]
        DP[delete-product/]
    end

    subgraph LinkServices["link-services/"]
        LSI[index.ts]
        LSU["ui/"]
        LSM[link-services-modal.tsx]
        LSS[service-selector.tsx]
    end

    LS --> LSI
    LS --> LSU
    LSU --> LSM
    LSU --> LSS

    style LS fill:#90EE90
    style LSM fill:#90EE90
    style LSS fill:#90EE90
```

### 5.2. UI 구조
```
┌─────────────────────────────────────────────────────────────┐
│ Add API Services to "Payment API"                    [×]    │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐    │
│ │ 🔍 Search services...                                │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                             │
│ ┌───┬────────────────────────┬──────────┬────────────────┐ │
│ │ ☑ │ Payment Service        │ v1.0     │ (이미 연결됨)  │ │
│ │ ☐ │ Notification Service   │ v2.0     │                │ │
│ │ ☐ │ Report Service         │ v1.0     │                │ │
│ └───┴────────────────────────┴──────────┴────────────────┘ │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                         [Cancel]  [Add 1 Service]           │
└─────────────────────────────────────────────────────────────┘
```

### 5.3. 컴포넌트 Props
```typescript
interface LinkServicesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
  linkedServiceIds: string[];
  onSuccess?: () => void;
}
```

### 5.4. 인터랙션 상태 다이어그램

```mermaid
stateDiagram-v2
    [*] --> 기본: 모달 열림

    state "Service 항목" as ServiceItem {
        기본 --> 선택됨: 체크박스 클릭
        선택됨 --> 기본: 체크박스 해제
        이미연결 --> 이미연결: 클릭 불가
    }

    state "검색" as Search {
        전체목록 --> 필터링됨: 검색어 입력
        필터링됨 --> 빈결과: 매칭 없음
        필터링됨 --> 전체목록: 검색어 삭제
    }

    선택됨 --> 확인다이얼로그: Add 버튼 (Active Product일 때)
    선택됨 --> 저장중: Add 버튼 (Draft Product)
    확인다이얼로그 --> 저장중: 확인
    저장중 --> [*]: 성공
```

| 상태 | 설명 |
|------|------|
| 기본 | 연결되지 않은 Service는 체크 해제, 클릭 가능 |
| 이미 연결됨 | 체크됨 + 비활성화 (row 회색 처리) |
| 선택됨 | 체크됨 + 파란색 하이라이트 |
| 빈 검색 결과 | "No services found" 메시지 |

### 5.5. 데이터 흐름

```mermaid
sequenceDiagram
    participant U as User
    participant M as Modal
    participant H as useUpdateProduct
    participant Q as TanStack Query
    participant A as API

    U->>M: Service 선택 후 Add 클릭
    M->>H: mutate({ api_services: [...existing, ...selected] })
    H->>A: PATCH /api/v1/provider/products/:id
    A-->>H: Updated Product
    H->>Q: invalidateQueries(productKeys.detail(id))
    Q->>Q: 상세 페이지 캐시 무효화
    H-->>M: onSuccess 콜백
    M->>M: 모달 닫기
    M-->>U: 토스트: "N Services added"
```

### 5.6. 경고 처리
Product가 active 상태일 때 Services를 변경하면 확인 다이얼로그:
> "이 Product는 이미 활성화되어 있습니다.
> Services를 변경하면 기존 배포에 영향을 줄 수 있습니다."

## 6. 수용 기준
- [ ] "Add Service" 클릭 시 모달 열기
- [ ] 사용 가능한 API Service 목록 표시
- [ ] 검색으로 Service 필터링 (디바운스 300ms)
- [ ] 체크박스로 다중 선택
- [ ] 이미 연결된 Service는 체크됨 + 비활성화 표시
- [ ] 선택된 개수 표시 ("Add N Services" 버튼)
- [ ] 확인 시 `useUpdateProduct` 호출
- [ ] 성공/실패 토스트 메시지
- [ ] 로딩 상태 표시
- [ ] 빈 검색 결과 처리

## 7. 참조 파일
- `web/src/features/cluster/` - Feature 구조 패턴
- `@/shared/components/ui/dialog` - 모달 컴포넌트
- `@/shared/components/ui/checkbox` - 체크박스 컴포넌트
- `web/src/entities/service/` - EPIC-016 Service 엔티티

## 8. 비고
- Service 제거 기능은 STORY-17.3 상세 페이지에서 직접 구현
