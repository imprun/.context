# STORY-13.2: Cluster List Page Implementation

## 1. 개요
**Epic**: EPIC-013 Cluster 관리
**제목**: Cluster 목록 페이지 구현
**담당자**: Gemini Agent
**상태**: 🏃 진행중

## 2. 목적
Operator가 등록된 모든 클러스터의 상태와 요약 정보를 한눈에 확인하고 관리할 수 있는 목록 페이지를 제공한다.

## 3. 구현 상세

### 3.1. Features Layer
**Path**: `web/src/features/cluster`

#### List UI (`ui/cluster-table.tsx`)
- TanStack Table 기반 데이터 테이블 구현
- **Columns**:
    - Name (클릭 시 상세 이동)
    - Region
    - Status (Badge 사용)
    - Agent Count (Active/Total)
    - Last Heartbeat
    - Actions (Edit, Delete)
- **Empty State**: 등록된 클러스터가 없을 때 안내 메시지와 등록 버튼 표시
- **Filters**: Status, Region 필터링 옵션

### 3.2. Pages Layer
**Path**: `web/src/pages/operator/clusters-page.tsx`
- `useClusters` 훅으로 데이터 로딩
- 로딩 상태 (Skeleton) 및 에러 상태 처리
- "Register Cluster" 버튼 배치 (-> `/operator/clusters/new`)
- `ClusterTable` 컴포넌트 렌더링

## 4. 수용 기준
- [ ] `/operator/clusters` 접속 시 클러스터 목록이 표시되어야 한다.
- [ ] 각 클러스터의 상태(Active/Inactive)가 시각적으로 구분되어야 한다.
- [ ] "Register Cluster" 버튼을 클릭하면 생성 페이지로 이동해야 한다.
