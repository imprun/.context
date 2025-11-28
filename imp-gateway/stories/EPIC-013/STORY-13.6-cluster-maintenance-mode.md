# STORY-13.6: Cluster Maintenance Mode Implementation

## 1. 개요
**Epic**: EPIC-013 Cluster 관리
**제목**: Cluster 유지보수 모드 구현
**담당자**: Gemini Agent
**상태**: 🏃 진행중

## 2. 목적
클러스터 점검이나 업그레이드 작업을 위해 클러스터를 '유지보수(Maintenance)' 상태로 전환하여 새로운 배포를 차단한다.

## 3. 구현 상세

### 3.1. API
- `POST /api/v1/operator/clusters/:id/maintenance` (Enable/Disable)

### 3.2. UI
- 상세 페이지 헤더에 "Maintenance Mode" 토글 스위치 또는 버튼 제공
- 상태 변경 시 확인 모달 ("새로운 배포가 차단됩니다" 경고)
- 상태 뱃지: `Maintenance` (Yellow/Orange)

## 4. 수용 기준
- [ ] 유지보수 모드 활성화 시 상태가 `maintenance`로 변경되어야 한다.
- [ ] 유지보수 모드에서는 UI상에서 배포 관련 작업이 비활성화되거나 경고가 표시되어야 한다 (연관 기능).
