# Story 20.7: Policy Type Selector 및 Category UI

## 개요

| 항목 | 내용 |
|------|------|
| **Story ID** | 20.7 |
| **Epic** | EPIC-020 (Route & Policy 설정) |
| **우선순위** | P0 |
| **예상 공수** | 1일 |
| **상태** | 🔲 미시작 |
| **담당자** | - |

## 목표

Policy 생성 시 타입을 선택하고, 카테고리별로 분류된 Policy 목록을 관리하는 UI를 구현한다.

## 의존성

- Story 20.3 (Policy 엔티티)
- Story 20.4 (API Service 상세 탭)

## 요구사항

### 기능 요구사항

#### 1. Policy 목록 (`widgets/provider/service-policies-list/`)

**카테고리별 그룹화된 목록**
```
┌─────────────────────────────────────────────────────────────────────────┐
│ Policies                                             [+ Add Policy]     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ 🌐 CORS (1)                                                    [▼]     │
│ ┌─────────────────────────────────────────────────────────────────┐    │
│ │ ┌─────────────┐                                                  │    │
│ │ │ cors-policy │  Service scope  │  ● Enabled  │  [Edit] [×]     │    │
│ │ │ Allow: *    │                                                  │    │
│ │ └─────────────┘                                                  │    │
│ └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│ ⚡ Traffic Control (2)                                          [▼]     │
│ ┌─────────────────────────────────────────────────────────────────┐    │
│ │ ┌─────────────┐ ┌─────────────┐                                  │    │
│ │ │ rate-limit  │ │ timeout     │                                  │    │
│ │ │ 100/min     │ │ 30s         │                                  │    │
│ │ │ Route scope │ │ Service     │                                  │    │
│ │ │ ● Enabled   │ │ ● Enabled   │                                  │    │
│ │ └─────────────┘ └─────────────┘                                  │    │
│ └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│ 🔄 Transform (1)                                                [▼]     │
│ ┌─────────────────────────────────────────────────────────────────┐    │
│ │ ┌─────────────┐                                                  │    │
│ │ │ header-mod  │  Route scope  │  ● Enabled  │  [Edit] [×]       │    │
│ │ │ +2 headers  │                                                  │    │
│ │ └─────────────┘                                                  │    │
│ └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│ ────────────────────────────────────────────────────────────────────   │
│ ℹ️ 인증 정책 (JWT, API Key 등)은 Product Publish에서 설정됩니다.        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

- **카테고리별 접기/펼치기**
- **빠른 Enable/Disable 토글**
- **Policy 카드에 요약 정보 표시**

#### 2. Policy Type Selector (생성 Wizard Step 1)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Add Policy                                                     [×]     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Step 1: Select Policy Type                                             │
│  ────────────────────────────────────────────────────────────────────  │
│                                                                         │
│  🌐 CORS                                                                │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │ ○ CORS                                                          │    │
│  │   Configure Cross-Origin Resource Sharing headers               │    │
│  │   Allow browsers to make cross-origin requests                  │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ⚡ Traffic Control                                                      │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │ ○ Rate Limit                                                    │    │
│  │   Limit the number of requests per time period                  │    │
│  │   Protect backend from excessive traffic                        │    │
│  ├────────────────────────────────────────────────────────────────┤    │
│  │ ○ Retry                                                         │    │
│  │   Automatically retry failed requests                           │    │
│  │   Improve reliability for transient failures                    │    │
│  ├────────────────────────────────────────────────────────────────┤    │
│  │ ○ Timeout                                                       │    │
│  │   Set request and backend timeouts                              │    │
│  │   Prevent long-running requests                                 │    │
│  ├────────────────────────────────────────────────────────────────┤    │
│  │ ○ Circuit Breaker                                               │    │
│  │   Prevent cascading failures                                    │    │
│  │   Automatically stop requests to unhealthy backends             │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  🔄 Request/Response Transform                                          │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │ ● Header Modifier                                         ✓     │    │
│  │   Add, modify, or remove request/response headers               │    │
│  │   Common use: Add auth headers for external APIs                │    │
│  ├────────────────────────────────────────────────────────────────┤    │
│  │ ○ URL Rewrite                                                   │    │
│  │   Rewrite request URLs before forwarding                        │    │
│  │   Change path prefixes or hostnames                             │    │
│  ├────────────────────────────────────────────────────────────────┤    │
│  │ ○ Request Redirect                                              │    │
│  │   Redirect requests to different URLs                           │    │
│  │   Useful for URL migrations                                     │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ────────────────────────────────────────────────────────────────────  │
│  ℹ️ 인증 정책 (JWT, API Key 등)은 Product Publish에서 설정합니다.       │
│                                                                         │
│                                              [Cancel] [Next →]          │
└─────────────────────────────────────────────────────────────────────────┘
```

#### 3. Policy 카테고리 정의

| 카테고리 | 아이콘 | Policy Types | 설명 |
|---------|--------|--------------|------|
| **CORS** | 🌐 | cors | CORS 헤더 설정 |
| **Traffic Control** | ⚡ | rate-limit, retry, timeout, circuit-breaker | 트래픽 제어 |
| **Transform** | 🔄 | header-modifier, url-rewrite, request-redirect | 요청/응답 변환 |
| **Security** | 🔒 | (Product Publish에서 설정) | 인증/인가 |

#### 4. Policy Registry (메타데이터)

```typescript
// features/policy/lib/policy-registry.ts

export const POLICY_REGISTRY: PolicyTypeDefinition[] = [
  // CORS
  {
    type: 'cors',
    name: 'CORS',
    category: 'cors',
    icon: '🌐',
    description: 'Configure Cross-Origin Resource Sharing headers',
    longDescription: 'Allow browsers to make cross-origin requests',
    envoyType: 'SecurityPolicy.cors',
    defaultSpec: {
      allow_origins: ['*'],
      allow_methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allow_headers: ['Content-Type', 'Authorization'],
      max_age: 3600,
    },
  },

  // Traffic Control
  {
    type: 'rate-limit',
    name: 'Rate Limit',
    category: 'traffic',
    icon: '⚡',
    description: 'Limit the number of requests per time period',
    longDescription: 'Protect backend from excessive traffic',
    envoyType: 'BackendTrafficPolicy.rateLimit',
    defaultSpec: {
      requests_per_unit: 100,
      unit: 'minute',
    },
  },
  {
    type: 'retry',
    name: 'Retry',
    category: 'traffic',
    icon: '🔄',
    description: 'Automatically retry failed requests',
    longDescription: 'Improve reliability for transient failures',
    envoyType: 'BackendTrafficPolicy.retry',
    defaultSpec: {
      num_retries: 3,
      retry_on: ['5xx', 'reset', 'connect-failure'],
      per_try_timeout: '10s',
    },
  },
  {
    type: 'timeout',
    name: 'Timeout',
    category: 'traffic',
    icon: '⏱️',
    description: 'Set request and backend timeouts',
    longDescription: 'Prevent long-running requests',
    envoyType: 'BackendTrafficPolicy.timeout',
    defaultSpec: {
      request_timeout: '30s',
      idle_timeout: '60s',
    },
  },
  {
    type: 'circuit-breaker',
    name: 'Circuit Breaker',
    category: 'traffic',
    icon: '⚡',
    description: 'Prevent cascading failures',
    longDescription: 'Automatically stop requests to unhealthy backends',
    envoyType: 'BackendTrafficPolicy.circuitBreaker',
    defaultSpec: {
      max_connections: 1024,
      max_pending_requests: 1024,
      max_retries: 3,
    },
  },

  // Transform
  {
    type: 'header-modifier',
    name: 'Header Modifier',
    category: 'transform',
    icon: '🔄',
    description: 'Add, modify, or remove request/response headers',
    longDescription: 'Common use: Add auth headers for external APIs',
    envoyType: 'HTTPRoute.filters.RequestHeaderModifier',
    defaultSpec: {
      add: [],
      set: [],
      remove: [],
    },
    useCaseTemplates: [
      {
        name: 'OpenAI',
        spec: {
          add: [
            { name: 'Authorization', value: 'Bearer sk-xxx' },
            { name: 'OpenAI-Organization', value: 'org-xxx' },
          ],
        },
      },
      {
        name: 'Stripe',
        spec: {
          add: [
            { name: 'Authorization', value: 'Bearer sk_xxx' },
          ],
        },
      },
      {
        name: 'AWS API Gateway',
        spec: {
          add: [
            { name: 'x-api-key', value: 'xxx' },
          ],
        },
      },
    ],
  },
  {
    type: 'url-rewrite',
    name: 'URL Rewrite',
    category: 'transform',
    icon: '🔗',
    description: 'Rewrite request URLs before forwarding',
    longDescription: 'Change path prefixes or hostnames',
    envoyType: 'HTTPRoute.filters.URLRewrite',
    defaultSpec: {
      hostname: '',
      path: {
        type: 'ReplacePrefixMatch',
        value: '/',
      },
    },
  },
  {
    type: 'request-redirect',
    name: 'Request Redirect',
    category: 'transform',
    icon: '↪️',
    description: 'Redirect requests to different URLs',
    longDescription: 'Useful for URL migrations',
    envoyType: 'HTTPRoute.filters.RequestRedirect',
    defaultSpec: {
      scheme: 'https',
      hostname: '',
      port: 443,
      status_code: 301,
    },
  },
];

// 카테고리 정의
export const POLICY_CATEGORIES = {
  cors: { name: 'CORS', icon: '🌐', order: 1 },
  traffic: { name: 'Traffic Control', icon: '⚡', order: 2 },
  transform: { name: 'Transform', icon: '🔄', order: 3 },
  security: { name: 'Security', icon: '🔒', order: 4, disabled: true, disabledReason: 'Product Publish에서 설정' },
};
```

#### 5. Policy 빠른 토글 기능

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────────────────┐    │
│ │ ⚡ rate-limit                                                    │    │
│ │ 100 req/min │ Route: get-users                                   │    │
│ │                                                                  │    │
│ │ [● Enabled ─────────○ Disabled]        [Edit] [Delete]          │    │
│ └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

- 토글 클릭 시 즉시 활성화/비활성화
- 낙관적 업데이트
- 실패 시 롤백 + 에러 토스트

### 비기능 요구사항

- Policy Registry는 정적 데이터로 관리
- 타입 선택 시 기본 템플릿 자동 로드
- 카테고리별 접기 상태 localStorage 저장
- 빠른 토글은 낙관적 업데이트

## 기술 상세

### Policy Type Definition

```typescript
interface PolicyTypeDefinition {
  type: string;                    // 'rate-limit', 'cors', etc.
  name: string;                    // Display name
  category: PolicyCategory;        // 'cors' | 'traffic' | 'transform'
  icon: string;                    // Emoji icon
  description: string;             // Short description
  longDescription: string;         // Detailed description
  envoyType: string;               // Envoy Gateway type reference
  defaultSpec: Record<string, any>; // Default configuration
  useCaseTemplates?: UseCaseTemplate[]; // Preset templates
}

interface UseCaseTemplate {
  name: string;
  spec: Record<string, any>;
}

type PolicyCategory = 'cors' | 'traffic' | 'transform' | 'security';
```

### FSD 구조

```
web/src/
├── entities/policy/
│   ├── model/types.ts           # Policy 타입 정의
│   ├── api/policy-api.ts        # API 훅
│   └── ui/
│       ├── policy-card.tsx
│       ├── policy-category-badge.tsx
│       ├── policy-scope-indicator.tsx
│       └── policy-quick-toggle.tsx
│
├── features/policy/
│   ├── lib/
│   │   ├── policy-registry.ts   # Policy 타입 메타데이터
│   │   ├── policy-categories.ts # 카테고리 정의
│   │   └── policy-utils.ts      # 유틸리티 함수
│   │
│   ├── create-policy/
│   │   ├── ui/
│   │   │   ├── policy-type-selector.tsx    # Step 1: 타입 선택
│   │   │   ├── policy-type-card.tsx        # 개별 타입 카드
│   │   │   └── policy-category-group.tsx   # 카테고리별 그룹
│   │   └── index.ts
│   │
│   ├── toggle-policy/
│   │   ├── ui/
│   │   │   └── toggle-policy-switch.tsx
│   │   └── index.ts
│   │
│   └── index.ts
│
└── widgets/provider/
    └── service-policies-list/
        ├── ui/
        │   ├── policies-list.tsx
        │   ├── policies-by-category.tsx
        │   └── policy-list-item.tsx
        └── index.ts
```

### API 훅 (Toggle)

```typescript
// features/policy/toggle-policy/api/use-toggle-policy.ts
export function useTogglePolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      return apiClient.patch(`/policies/${id}`, { enabled });
    },
    onMutate: async ({ id, enabled }) => {
      // 낙관적 업데이트
      await queryClient.cancelQueries({ queryKey: ['policies'] });
      const previousPolicies = queryClient.getQueryData(['policies']);

      queryClient.setQueryData(['policies'], (old: Policy[]) =>
        old.map((p) => (p.id === id ? { ...p, enabled } : p))
      );

      return { previousPolicies };
    },
    onError: (err, _, context) => {
      // 롤백
      queryClient.setQueryData(['policies'], context?.previousPolicies);
      toast.error('Failed to toggle policy');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
    },
  });
}
```

## 수용 기준

### Policy 목록
- [ ] Policy 목록이 카테고리별로 그룹화되어 표시된다
- [ ] 각 카테고리를 접고 펼 수 있다
- [ ] Policy 카드에 타입, scope, enabled 상태가 표시된다
- [ ] 인증 정책 안내 메시지가 표시된다

### Policy Type Selector
- [ ] 모든 Policy 타입이 카테고리별로 표시된다
- [ ] 각 타입에 이름, 설명, 아이콘이 표시된다
- [ ] 타입 선택 시 다음 단계로 진행된다
- [ ] 인증 정책 카테고리가 비활성화되어 있다

### Policy 빠른 토글
- [ ] 토글 클릭 시 즉시 UI가 업데이트된다 (낙관적)
- [ ] API 실패 시 롤백되고 에러 토스트가 표시된다

### Policy Registry
- [ ] 모든 Policy 타입에 기본 템플릿이 정의되어 있다
- [ ] Header Modifier에 외부 API 프리셋이 포함되어 있다

## 참조

- EPIC-020 Policy 목록: Rate Limit, Retry, Timeout, Circuit Breaker, CORS, Header Modifier, URL Rewrite
- 패턴 참조: shadcn/ui Accordion (카테고리 접기/펼치기)
- 패턴 참조: shadcn/ui RadioGroup (타입 선택)
