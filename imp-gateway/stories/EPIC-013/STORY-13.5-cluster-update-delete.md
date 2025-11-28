# STORY-13.5: Cluster Update & Delete Implementation

## 1. 개요
**Epic**: EPIC-013 Cluster 관리
**제목**: Cluster 수정 및 삭제 기능 구현
**담당자**: Gemini Agent
**상태**: 🏃 진행중

## 2. 목적
기존 클러스터의 정보를 수정하거나, 더 이상 사용하지 않는 클러스터를 삭제하는 기능을 제공한다.

## 3. 구현 상세

### 3.1. Features Layer
**Path**: `web/src/features/cluster`

#### Update Form (`update-cluster/ui/update-cluster-form.tsx`)
- 생성 폼(`CreateClusterForm`) 재사용 또는 별도 구현
- 기존 데이터 프리필(Pre-fill)
- 수정 가능한 필드: Description, Metadata (Name, Region, Env는 변경 불가 정책 확인 필요)

#### Delete Dialog (`delete-cluster/ui/delete-cluster-dialog.tsx`)
- **Safety Check**: 연결된 활성 Agent가 있거나 배포된 Product가 있는 경우 경고 표시
- 삭제 확인 입력 (e.g., "Type cluster name to confirm")

### 3.2. Integration
- 상세 페이지 및 목록 페이지의 Action 메뉴에 연동

## 4. 수용 기준
- [ ] 수정 사항이 정상적으로 반영되어야 한다.
- [ ] 삭제 시 연결된 리소스가 있을 경우 경고를 표시해야 한다.
- [ ] 삭제 완료 후 목록 페이지로 이동해야 한다.
