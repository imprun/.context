# STORY-19.3: Publish 생성 위자드 - 클러스터/Gateway 선택

## 1. 개요
**Epic**: EPIC-019 ProductPublish 배포
**제목**: Publish 생성 위자드 - 클러스터/Gateway 선택
**담당자**: AI Agent
**상태**: ✅ 완료

## 2. 목적
배포 생성 위자드의 1~2단계를 구현한다:
- Step 1: 배포 대상 클러스터 선택
- Step 2: Gateway 템플릿 선택

## 3. 구현 상세

### 3.1. 위자드 단계 (3단계)
```
①──────●──────②──────○──────③
Cluster      Gateway      Settings
```

### 3.2. Step 1: 클러스터 선택
```
┌──────────────────────────────────────────────────────────────┐
│ ◉ kr-prod-cluster                                   ● Active │
│   Seoul, Korea • 3 Agents • Last sync: 2 min ago            │
└──────────────────────────────────────────────────────────────┘
```

- 연결된(connected) 클러스터만 표시
- 클러스터 상태, Agent 수, 마지막 동기화 시간 표시

### 3.3. Step 2: Gateway 선택
```
┌──────────────────────────────────────────────────────────────┐
│ ◉ prod-gateway                                               │
│   HTTPS (8443) • kong:3.0                                    │
└──────────────────────────────────────────────────────────────┘
```

- 선택된 클러스터에 연결된 Gateway 목록 표시
- Gateway 프로토콜, 포트, 버전 표시

### 3.4. 컴포넌트 구조
```
features/publish/create/ui/
├── cluster-select-step.tsx
├── gateway-select-step.tsx
└── config-step.tsx
```

## 4. 수용 기준
- [x] 클러스터 목록 조회 및 선택 UI
- [x] 선택된 클러스터 기반 Gateway 필터링
- [x] 클러스터 선택 시 Gateway 선택 초기화
- [x] 이전/다음 단계 네비게이션
- [x] 선택 완료 전 다음 버튼 비활성화

## 5. 참조 파일
- `web/src/entities/cluster/` - 클러스터 API
- `web/src/entities/gateway/` - Gateway API
