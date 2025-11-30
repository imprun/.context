# STORY-19.1: Publish 엔티티 및 API 훅 구현

## 1. 개요
**Epic**: EPIC-019 ProductPublish 배포
**제목**: Publish 엔티티 및 API 훅 구현
**담당자**: AI Agent
**상태**: ✅ 완료

## 2. 목적
ProductPublish 엔티티의 타입 정의와 TanStack Query 기반 API 훅을 구현한다.

## 3. 구현 상세

### 3.1. 디렉토리 구조
```
web/src/entities/publish/
├── index.ts
├── model/
│   └── types.ts
├── api/
│   └── publish-api.ts
└── ui/
    ├── publish-status-badge.tsx
    ├── publish-card.tsx
    └── publish-timeline.tsx
```

### 3.2. 타입 정의
```typescript
type PublishEnvironment = 'dev' | 'stage' | 'prod';
type AuthMode = 'api-key' | 'oauth2' | 'none';
type PublishVisibility = 'public' | 'private';
type PublishStatus = 'draft' | 'published' | 'withdrawn';

interface ProductPublish {
  id: string;
  product_id: string;
  provider_tenant_id: string;
  gateway_id: string;
  cluster_id: string;
  environment: PublishEnvironment;
  hostname_base: string;
  api_services: string[];
  route_ids: string[];
  auth_mode: AuthMode;
  auth_config?: Record<string, unknown>;
  visibility: PublishVisibility;
  approval_required: boolean;
  status: PublishStatus;
  published_at?: string;
  published_by?: string;
  withdrawn_at?: string;
  withdrawn_by?: string;
  created_at: string;
  updated_at: string;
}
```

### 3.3. Query Hooks
- `usePublishes(productId, params)` - 배포 목록 조회
- `usePublish(id)` - 배포 상세 조회
- `useCreatePublish()` - 배포 생성 뮤테이션
- `useExecutePublish()` - 배포 실행 뮤테이션
- `useWithdrawPublish()` - 배포 철회 뮤테이션
- `useDeletePublish()` - 배포 삭제 뮤테이션

## 4. 수용 기준
- [x] ProductPublish 타입 정의
- [x] publishKeys Query Keys 팩토리 구현
- [x] usePublishes 목록 조회 훅 구현
- [x] usePublish 상세 조회 훅 구현
- [x] 뮤테이션 훅들 구현
- [x] PublishStatusBadge 컴포넌트 구현

## 5. 참조 파일
- `web/src/entities/product/` - Product 엔티티 패턴
- `web/src/entities/cluster/` - Cluster 엔티티 패턴
