# STORY-13.4: Cluster Detail Page Implementation

## 1. 개요
**Epic**: EPIC-013 Cluster 관리
**제목**: Cluster 상세 페이지 구현
**담당자**: Gemini Agent
**상태**: 🏃 진행중

## 2. 목적
특정 클러스터의 상세 정보, 연결된 Agent 현황, 배포된 Product 목록 등을 확인하고 관리 기능을 제공한다.

## 3. 구현 상세

### 3.1. Pages Layer
**Path**: `web/src/pages/operator/cluster-detail-page.tsx`
- `useCluster` 훅으로 상세 데이터 로딩 (`id` from params)
- **Header**:
    - 클러스터 이름, ID, 상태 뱃지
    - Action Buttons: Maintenance Mode Toggle, Edit, Delete
- **Content (Tabs)**:
    - **Overview**: 기본 정보 (Region, Description, Metadata, CreatedAt)
    - **Agents**: 연결된 Agent 목록 (Agent Entity 활용)
    - **Deployments**: 배포된 ProductPublish 목록 (environment별 그룹핑 표시)

### 3.2. Entities Layer (Extension)
- `Cluster` 타입에 `agents` 필드 포함 여부 확인 및 처리

### 3.3. UI Components
- **Breadcrumb**: Clusters > {Cluster Name}
- **Loading State**: Skeleton UI 적용
- **Error State**: 404 Not Found 또는 에러 메시지 표시

## 4. 수용 기준
- [ ] `/operator/clusters/:id` 접속 시 해당 클러스터 정보가 표시되어야 한다.
- [ ] 존재하지 않는 ID 접근 시 404 또는 에러 페이지를 표시해야 한다.
- [ ] 연결된 Agent 목록이 올바르게 표시되어야 한다.
- [ ] Deployments 탭에서 배포된 ProductPublish 목록이 environment별로 구분되어 표시되어야 한다.
