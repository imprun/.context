# STORY-19.5: Publish 상세 페이지 및 상태 표시

## 1. 개요
**Epic**: EPIC-019 ProductPublish 배포
**제목**: Publish 상세 페이지 및 상태 표시
**담당자**: AI Agent
**상태**: ✅ 완료

## 2. 목적
배포 상세 정보를 보여주는 페이지를 구현한다.

## 3. 구현 상세

### 3.1. 라우트
- `/provider/products/:productId/publishes/:publishId`

### 3.2. UI 와이어프레임
```
┌─────────────────────────────────────────────────────────────────┐
│  ← 배포 목록     Payment API - Production 배포                  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  🚀                                                      │   │
│  │  Payment API v2.0 → kr-prod-cluster                     │   │
│  │                                                          │   │
│  │  ┌─────────────┐   Environment: prod                    │   │
│  │  │ ● PUBLISHED │   Auth Mode: OAuth 2.0                 │   │
│  │  └─────────────┘   Published: 2025-01-20 14:30 by admin │   │
│  │                                                          │   │
│  │                         [ 철회하기 ]  [ 설정 변경 ]      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ═══════════════════════════════════════════════════════════   │
│                                                                 │
│  ┌─ 배포 정보 ────────────────────────────────────────────┐    │
│  │  클러스터: kr-prod-cluster                              │    │
│  │  Gateway: prod-gateway                                  │    │
│  │  Hostname: api.example.com                              │    │
│  │  Visibility: Public | Approval Required: Yes            │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─ API Services (3) ─────────────────────────────────────┐    │
│  │  • Billing Service (v1.0)                               │    │
│  │  • Invoice Service (v2.0)                               │    │
│  │  • Refund Service (v1.0)                                │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3. 상태별 액션 버튼
| 상태 | 가능한 액션 |
|------|-------------|
| DRAFT | 배포 실행, 삭제 |
| PUBLISHED | 철회 |
| WITHDRAWN | 재배포, 삭제 |

## 4. 수용 기준
- [x] 배포 상세 정보 표시 (클러스터, Gateway, 환경, 인증)
- [x] 상태 뱃지 표시
- [x] 연결된 API Services 목록 표시
- [x] 상태별 액션 버튼 조건부 표시
- [x] 뒤로가기 시 Product 상세로 이동

## 5. 참조 파일
- `web/src/pages/provider/publish/publish-detail-page.tsx`
- `web/src/entities/publish/api/publish-api.ts`
