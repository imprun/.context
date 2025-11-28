# EPIC-024: Credential 관리

## 개요

| 항목 | 내용 |
|------|------|
| **Epic ID** | EPIC-024 |
| **제목** | Credential 관리 |
| **우선순위** | P0 |
| **예상 기간** | 1주 |
| **상태** | 🔲 미시작 |
| **의존성** | EPIC-023 (ClientApp) |
| **GitHub Issue** | [#17](https://github.com/imprun/imp-gateway/issues/17) |

## 목표

Consumer가 API Key를 발급받아 API를 호출할 수 있다.

## 배경

Credential은 Consumer가 API를 호출할 때 사용하는 인증 정보이다. MVP에서는 API Key만 지원하며, OAuth2 Client는 Post-MVP로 미룬다.

### 핵심 개념
- **API Key**: 문자열 기반 인증 토큰
- **Key Prefix**: API Key의 앞부분 (고유 식별용, 예: `imp_abc123`)
- **Key Hash**: 저장되는 해시 값 (원본은 발급 시 1회만 표시)
- **Consumer**: API Key는 Consumer(ClientApp + Subscription 연결)에 속함

### 보안 원칙
- API Key 원본은 발급 시 **1회만** 표시
- 저장 시 해시화
- 회전(Rotate) 시 새 Key 발급, 기존 Key 폐기

## 범위

### 포함
- API Key 발급
- Key 마스킹 표시 (prefix만)
- Key 복사 기능
- Key 회전 (Rotate)
- Key 폐기 (Revoke)
- Key 목록 표시

### 제외
- OAuth2 Client 발급 (Post-MVP)
- Key 만료 자동화 (Post-MVP)
- Key 사용량 통계 (Post-MVP)

## 기술 요구사항

### 백엔드 API

```
# API Key 관리
GET    /api/v1/consumer/consumers/:id/api-keys        # Key 목록
POST   /api/v1/consumer/consumers/:id/api-keys        # Key 발급
DELETE /api/v1/consumer/api-keys/:keyId               # Key 폐기
POST   /api/v1/consumer/api-keys/:keyId/rotate        # Key 회전
```

### 데이터 모델

```typescript
interface APIKey {
  id: string;
  consumer_id: string;
  key_prefix: string;        // 예: "imp_abc123"
  label?: string;
  expires_at?: string;
  revoked_at?: string;
  last_used_at?: string;
  status: 'active' | 'revoked' | 'expired';
  created_at: string;
  updated_at: string;
}

interface CreateAPIKeyRequest {
  label?: string;
  expires_at?: string;       // ISO 8601
}

interface CreateAPIKeyResponse {
  id: string;
  key: string;              // 원본 API Key (1회만 표시!)
  key_prefix: string;
  label?: string;
  expires_at?: string;
  created_at: string;
}

interface RotateAPIKeyResponse {
  id: string;
  key: string;              // 새 API Key
  key_prefix: string;
  old_key_revoked_at: string;
}
```

### FSD 구조

```
web/src/
├── entities/credential/
│   ├── index.ts
│   ├── model/
│   │   └── types.ts
│   ├── api/
│   │   └── credential-api.ts
│   └── ui/
│       ├── api-key-row.tsx
│       └── api-key-status-badge.tsx
├── features/credential/
│   ├── index.ts
│   ├── generate/
│   │   └── ui/
│   │       ├── generate-key-dialog.tsx
│   │       └── key-display-dialog.tsx   # 발급된 Key 표시
│   ├── rotate/
│   │   └── ui/
│   │       └── rotate-key-dialog.tsx
│   └── revoke/
│       └── ui/
│           └── revoke-key-dialog.tsx
├── widgets/consumer/
│   └── api-key-display/
│       └── index.tsx                    # Key 마스킹/복사 위젯
└── pages/consumer/
    └── credentials-page.tsx             # 또는 app-detail 내 탭
```

## 스토리 분해

| Story | 제목 | 예상 | 우선순위 |
|-------|------|------|----------|
| 24.1 | Credential 엔티티 및 API 훅 구현 | 0.5일 | P0 |
| 24.2 | API Key 목록 UI 구현 | 1일 | P0 |
| 24.3 | API Key 발급 기능 (1회 표시 포함) | 1.5일 | P0 |
| 24.4 | API Key 복사 기능 | 0.5일 | P0 |
| 24.5 | API Key 회전 기능 | 1일| P0 |
| 24.6 | API Key 폐기 기능 | 0.5일 | P0 |

## 수용 기준

### 기능 요구사항
- [ ] Consumer별 API Key 목록을 조회할 수 있다
- [ ] 새 API Key를 발급할 수 있다
- [ ] 발급된 API Key를 복사할 수 있다 (발급 시 1회만)
- [ ] API Key 목록에서 Key Prefix만 표시된다 (마스킹)
- [ ] API Key를 회전할 수 있다 (새 Key 발급 + 기존 폐기)
- [ ] API Key를 폐기할 수 있다
- [ ] 폐기된 Key는 목록에서 상태가 변경된다

### 비기능 요구사항
- [ ] 발급 시 Key 복사 전 닫기 경고
- [ ] 회전/폐기 시 확인 다이얼로그
- [ ] 클립보드 복사 성공 토스트

## UI/UX 가이드

### API Key 목록 (ClientApp 상세 내 또는 별도 페이지)
- 테이블 컬럼:
  - Key Prefix (마스킹: `imp_abc1...`)
  - Label
  - Status (active/revoked/expired)
  - Created At
  - Last Used At
  - Actions (Rotate, Revoke)
- 상단: "Generate New Key" 버튼

### API Key 발급 다이얼로그
1. 입력: Label (선택), Expiration (선택)
2. "Generate" 버튼
3. 발급 완료 화면:
   - **경고**: "이 Key는 다시 볼 수 없습니다!"
   - Key 전체 표시 (모노스페이스 폰트)
   - "Copy" 버튼
   - "I've copied the key" 체크박스 활성화 후 닫기 가능

### API Key 표시 위젯
```
┌─────────────────────────────────────────────┐
│ 🔑 imp_abc123...xyz789    [Copy] [Rotate]   │
│    Created: Jan 1, 2025   Status: Active    │
└─────────────────────────────────────────────┘
```

### 회전 다이얼로그
- 경고: "기존 Key는 즉시 폐기됩니다"
- "Rotate" 버튼
- 완료 후 새 Key 표시 (발급 화면과 동일)

### 폐기 다이얼로그
- 경고: "이 작업은 되돌릴 수 없습니다"
- Key Prefix 표시
- "Revoke" 버튼

## 보안 고려사항

1. **API Key 노출 방지**
   - 발급 시 1회만 표시
   - 서버는 해시만 저장
   - 목록에서는 prefix만 표시

2. **Key 회전 권장**
   - 주기적 회전 안내 (UI에서 힌트)
   - 회전 시 기존 Key 즉시 무효화

3. **감사 로그**
   - 발급/폐기/회전 이벤트 기록 (백엔드)

## 참조

### 패턴 참조 파일
- `web/src/features/agent/register/` - Token 표시 패턴

### 백엔드 모델
- `services/imprun-server/internal/data/models/models.go` - APIKey

---

## 변경 이력

| 날짜 | 버전 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 2025-01-XX | 1.0 | 초기 작성 | - |
