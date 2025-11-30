# STORY-19.4: Publish 생성 위자드 - 환경/인증 설정

## 1. 개요
**Epic**: EPIC-019 ProductPublish 배포
**제목**: Publish 생성 위자드 - 환경/인증 설정
**담당자**: AI Agent
**상태**: ✅ 완료

## 2. 목적
배포 생성 위자드의 3단계(Settings)를 구현한다:
- 환경(dev/stage/prod) 선택
- 인증 모드(none/api-key/oauth2) 설정
- 가시성(public/private) 및 승인 필요 여부 설정

> **변경 사항**: 이전에 있던 "API Service 선택" 단계가 제거됨.
> Product에 연결된 모든 서비스가 자동으로 배포됩니다.

## 3. 구현 상세

### 3.1. 설정 UI
```
┌─ Environment ────────────────────────────────────────────────┐
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │ Development │ │   Staging   │ │ ▣Production │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
└──────────────────────────────────────────────────────────────┘

┌─ Authentication Mode ────────────────────────────────────────┐
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │    None     │ │   API Key   │ │ ▣ OAuth 2.0 │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
│                                                              │
│  OAuth 2.0 설정                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Issuer URL: [ https://auth.example.com/realms/api    ] │ │
│  │ Audience:   [ payment-api                            ] │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘

┌─ Visibility & Access Control ────────────────────────────────┐
│  공개 범위:  ◉ Public (누구나 구독 가능)                     │
│              ○ Private (초대된 Consumer만)                   │
│                                                              │
│  구독 승인:  [✓] 구독 신청 시 관리자 승인 필요               │
└──────────────────────────────────────────────────────────────┘
```

### 3.2. 컴포넌트
- `ConfigStep` - 설정 단계 컴포넌트
  - Environment 선택 (radio group)
  - Auth Mode 선택 (radio group)
  - OAuth2 Config (조건부 표시)
  - Visibility 토글
  - Approval Required 체크박스

### 3.3. 배포 생성 요청
```typescript
const request = {
  productId,
  cluster_id: wizardState.clusterId,
  gateway_id: wizardState.gatewayId,
  api_services: product.api_services, // Product의 모든 서비스 (자동)
  environment: wizardState.environment,
  auth_mode: wizardState.authMode,
  auth_config: wizardState.authConfig,
  visibility: wizardState.visibility,
  approval_required: wizardState.approvalRequired,
  hostname_base: wizardState.hostnameBase,
};
```

## 4. 수용 기준
- [x] 환경 선택 UI (dev/stage/prod)
- [x] 인증 모드 선택 UI
- [x] OAuth2 선택 시 추가 설정 필드 표시
- [x] 가시성 토글 (public/private)
- [x] 승인 필요 체크박스
- [x] 배포 생성 버튼 클릭 시 API 호출
- [x] 성공 시 배포 상세 페이지로 이동

## 5. 참조 파일
- `web/src/features/publish/create/ui/config-step.tsx`
- `web/src/pages/provider/publish/publish-create-page.tsx`
