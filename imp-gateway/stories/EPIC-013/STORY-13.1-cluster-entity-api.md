# STORY-13.1: Cluster Entity & API Implementation

## 1. 개요
**Epic**: EPIC-013 Cluster 관리
**제목**: Cluster 엔티티 및 API 훅 구현
**담당자**: Gemini Agent
**상태**: 🏃 진행중

## 2. 목적
프론트엔드에서 Cluster 데이터를 다루기 위한 타입 정의와 백엔드 API 통신을 위한 React Query 훅을 구현한다.

## 3. 구현 상세

### 3.1. Entities Layer
**Path**: `web/src/entities/cluster`

#### Model (`model/types.ts`)
- `Cluster` 인터페이스 정의
    - `id`, `name`, `region`, `status`
    - `agent_count`, `active_agent_count`
    - `metadata`, `description`
    - `created_at`, `updated_at`
- `ClusterStatus` 타입 정의 ('pending' | 'active' | 'inactive' | 'maintenance')

> **Note**: `environment`는 Cluster가 아닌 ProductPublish에서 관리합니다.
> Cluster는 물리적 인프라(어디에)를 나타내고, environment는 배포 설정(어떻게)을 나타내므로
> 하나의 Cluster에 여러 environment(dev/staging/prod)의 Product를 배포할 수 있습니다.

#### API (`api/cluster-api.ts`)
- `clusterKeys`: Query Key 팩토리
- `useClusters`: 목록 조회 (GET /api/v1/operator/clusters)
- `useCluster`: 상세 조회 (GET /api/v1/operator/clusters/:id)
- `useCreateCluster`: 생성 (POST /api/v1/operator/clusters)
- `useUpdateCluster`: 수정 (PUT /api/v1/operator/clusters/:id)
- `useDeleteCluster`: 삭제 (DELETE /api/v1/operator/clusters/:id)

## 4. 수용 기준
- [ ] `Cluster` 타입이 백엔드 API 응답과 일치해야 한다.
- [ ] `useClusters` 훅이 데이터를 정상적으로 가져와야 한다.
- [ ] API 에러 발생 시 적절한 에러 처리가 가능해야 한다.
