# STORY-13.3: Cluster Create Form Implementation

## 1. 개요
**Epic**: EPIC-013 Cluster 관리
**제목**: Cluster 생성 폼 구현
**담당자**: Gemini Agent
**상태**: 🏃 진행중

## 2. 목적
Operator가 새로운 Kubernetes 클러스터를 시스템에 등록하기 위한 입력 폼을 제공한다.

## 3. 구현 상세

### 3.1. Features Layer
**Path**: `web/src/features/cluster`

#### Create Form (`create-cluster/ui/create-cluster-form.tsx`)
- `react-hook-form` + `zod` 사용
- **Fields**:
    - Name (Required, Unique check, lowercase alphanumeric with hyphens)
    - Description (Optional)
    - Region (Select: kr-central, us-east, etc.)
    - Metadata (Key-Value Dynamic Fields)
- **Validation**: 필수 값 체크, 이름 형식 체크 (Kubernetes naming convention)

> **Note**: Environment 필드는 Cluster에 포함되지 않습니다.
> Environment(dev/staging/prod)는 ProductPublish 시점에 선택합니다.

### 3.2. Pages Layer
**Path**: `web/src/pages/operator/cluster-create-page.tsx`
- `CreateClusterForm` 래핑
- `useCreateCluster` 훅 연동
- 성공 시 상세 페이지 또는 목록으로 리다이렉션 (`router.push`)
- 취소 시 목록으로 이동

## 4. 수용 기준
- [ ] 필수 필드 누락 시 폼 제출이 차단되고 에러 메시지가 표시되어야 한다.
- [ ] 등록 성공 시 적절한 피드백(Toast)과 함께 페이지 이동이 되어야 한다.
