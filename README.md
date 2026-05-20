# KoMES Design System

한의원 EMR(전자의무기록) 시스템 **KoMES**의 UI 디자인 시스템 및 프로토타입.

> 화면별 기능·동작 규칙은 [SPEC.md](SPEC.md)(기능 명세) 참고.

---

## 개요

- **빌드 도구 없음** — React 18 + Babel Standalone을 CDN으로 로드, JSX를 브라우저에서 직접 트랜스파일
- **단일 파일 배포** — `index.standalone.html` 하나로 모든 컴포넌트 포함
- **디자인 토큰** — `colors_and_type.css` 단일 소스 CSS 변수 시스템 (색상·타이포·그림자·반경)
- **색상 테마** — Jade(기본) / Navy / Pink — `[data-color]` 어트리뷰트 기반 전환
- **명암 테마** — 라이트 / 다크 / 시스템 자동 — `[data-theme]` 어트리뷰트 기반 전환
- **아이콘** — Lucide Icons (CDN)
- **폰트** — Noto Serif KR · Noto Sans KR · JetBrains Mono (Google Fonts)

---

## 실행 방법

### 로컬 서버 (개발)
```bash
python3 -m http.server 8080   # 또는  npx serve .
```
브라우저에서 `http://localhost:8080` 접속. `index.html`이 각 JSX/CSS를 외부 파일로 로드합니다.

> 캐시 무력화를 위해 `index.html`의 스크립트 태그에 `?v=N` 쿼리를 사용합니다. 파일을 수정하면 해당 버전을 올린 뒤 하드 리프레시하세요.

### Standalone (파일 직접 열기)
`index.standalone.html` — 서버 없이 브라우저에서 바로 열 수 있는 단일 파일. 모든 JSX + CSS가 인라인으로 포함됨.

### GitHub Pages
`https://gtore94.github.io/KoMES-design-system/`

---

## 화면 구성

좌측 사이드바(`Components.jsx`의 `Sidebar`)는 다음 그룹으로 구성됩니다.

| 그룹 | 메뉴 | nav key | 파일 |
|------|------|---------|------|
| **진료** | 진료 현황 | `patients` | `PatientListScreen.jsx` |
| | 진료 차트 | `chart` | `PatientChartScreen.jsx` (처방 시 `PrescriptionScreen.jsx`) |
| | 환자 관리 | `registry` | `PatientManagementScreen.jsx` |
| | 예약 관리 | `schedule` | `ScheduleScreen.jsx` |
| | 수납 | `payment` | `PaymentScreen.jsx` |
| | 서식 발급 | `forms` | `MedicalFormScreen.jsx` |
| **청구** | 보험 청구 | `claim` | `InsuranceClaimScreen.jsx` |
| | 수금 관리 | `collect` | `CollectionsScreen.jsx` |
| **처방** | 처방 관리 | `prescriptions` | `PrescriptionManagementScreen.jsx` |
| | 약재 재고 | `inventory` | `HerbInventoryScreen.jsx` |
| **비품/운영** | 소모품 | `supplies` | `SuppliesScreen.jsx` |
| | 발주 이력 | `orders` | `PurchaseOrderHistoryScreen.jsx` |
| **분석** | 대시보드 | `stats` | `dashboardScreen.jsx` |
| | AI 분석 | `ai` | `AiAnalysisScreen.jsx` |
| **조직** | 병원 관리 | `clinic` | `ClinicManagementScreen.jsx` |
| (하단) | 차트 설정 | `settings` | `SettingsScreen.jsx` |

라우팅은 `index.html`의 `App.renderMain()`이 `nav` 값으로 분기합니다.

---

## 경영 대시보드 (`stats`)

`dashboardScreen.jsx`가 상단에서 레이아웃 변형을 토글합니다.

- **Brief** (`dashboardBrief.jsx`) — 임원 브리핑형
- **Dense** (`dashboardDense.jsx`) — 정보 밀집형
- **Story** (`dashboardStory.jsx`) — 스토리 시각형

공통 차트 프리미티브는 `dashboardCharts.jsx`(Sparkline·LineChart·Donut·HBar·BarChart·RegionDistribution 등), 카드류는 `dashboardCards.jsx`(Card·KPITile·AIInsightCard·AlertBanner 등), 시드 데이터는 `dashboardData.jsx`(`DASH`)에 있습니다.

- **지역별 환자 분포** — 지도(타일맵 choropleth) ↔ 막대 토글, 구 클릭 시 동별 드릴다운
- **상단 알림 배너** CTA는 보험 청구/수금 관리 화면으로 이동

**AI 분석**(`AiAnalysisScreen.jsx`)은 `DASH` 데이터를 재가공한 리포트(요약·핵심 지표·매출 흐름·인사이트·강점/리스크·권장 액션) 형태입니다.

---

## 병원 관리 (`clinic`)

`ClinicManagementScreen.jsx`가 좌측 서브탭 + 우측 섹션을 렌더합니다.

- 섹션 정의·시드 데이터: `clinicData.jsx` (`SECTIONS`, 권한 `permFor`)
- 섹션 본문 컴포넌트: `ClinicSections.jsx`
- 공통 파트(SectionCard·DataTable·Field 등): `ClinicManagementParts.jsx`
- 편집/추가 모달 + 전역 토스트: `ClinicEditModals.jsx`
- 진료시간 편집 모달: `HoursEditModal.jsx`
- 알림 센터(규칙·히스토리·로그): `AlertCenterModal.jsx` + 데이터 `alertRulesData.jsx`

| 그룹 | 섹션 (`id`) |
|------|------|
| 기본 | 한의원 기본 정보 `identity` · 진료 시간·휴진일 `hours` |
| 운영 | 진료실·베드 `rooms` · 장비 관리 `equipment` · 치료재 관리 `materials` · 보험 임의처방 `rx` · 처방 사전 `rxdict` · 기타 비급여 `nonbenefit` · 보험 수가 `fees` · 보험약 사용설정 `insmeds` · 상용 혈자리 설정 `acupoints` · 첩약 시범사업 설정 `cheopset` · 첩약 시범사업 사용설정 `cheopuse` · 진료 과목·수가표 `menu` |
| 법적 정보 | 면허·자격 `license` · 보험 연동 `insurance` |
| 재무 | 결제·세금 `billing` |
| 조직 | 분원 관리 `branch` · 직원 관리 `staff` (`StaffManagementScreen.jsx`) |
| 브랜딩 | 로고·서식 브랜딩 `brand` |
| 시스템 | 백업·데이터 `backup` |

권한은 `원장`/`데스크`에 따라 편집/읽기/잠금으로 차등 표시(상단 "목업 전용" 토글로 미리보기). 활성 알림이 있으면 알림 센터 버튼에 빨간 점이 표시됩니다.

---

## 전역 이름 규칙 (중요)

빌드 도구가 없어 **모든 `*.jsx`가 하나의 전역 스코프를 공유**합니다. 서로 다른 파일에 같은 이름의 top-level `function`/`const`가 있으면 **나중에 로드된 정의가 먼저 것을 덮어써** 조용한 버그가 납니다(예: 직원 목록이 대시보드 행으로 렌더되어 `₩NaN만` 표시).

- **공용 컴포넌트는 `Components.jsx`** 한 곳에만 정의.
- **화면 전용 헬퍼는 고유 접두사**를 붙입니다 — `NP*`(NewPatient), `Chart*`, `Rx*`, `Collect*`, `Form*`, `SR*`(NewStaff) 등.
- 새 컴포넌트/상수를 추가하면 충돌 검사를 돌리세요:

```bash
python3 check-collisions.py
```

`build-standalone.py`는 빌드 전에 이 검사를 자동 실행하며, 충돌이 있으면 빌드를 중단합니다.

**커밋 시 자동 차단** — `.githooks/pre-commit`이 커밋마다 충돌 검사를 실행합니다. 새로 클론한 경우 한 번만 활성화하세요:

```bash
git config core.hooksPath .githooks
# (또는 cp .githooks/pre-commit .git/hooks/pre-commit)
```
검사를 건너뛰고 커밋하려면 `git commit --no-verify`.

---

## 공통 인프라

- **토스트 피드백** — `ClinicEditModals.jsx`의 `showToast(msg, opts)` / `toastProgress(시작, 완료)`. `<ClinicToaster />`는 `index.html`의 `App` 루트에 1회 마운트되어 전 화면에서 동작합니다. CSV·내보내기·인쇄 등 액션 버튼이 이를 사용합니다.
- **설정/테마** — `SettingsScreen.jsx`(차트 설정: 외관·단축키). 테마 적용 헬퍼 `applyTheme`/`applyColor`는 `localStorage`에 저장되어 새로고침 후에도 유지.

---

## 파일 구조

```
index.html               # 개발용 (JSX 파일 외부 로드 + App 라우터)
index.standalone.html    # 배포용 (모든 JSX + CSS 인라인 포함)
build-standalone.py      # standalone 빌드 스크립트
colors_and_type.css      # 디자인 토큰 단일 소스 (색상 팔레트·테마·타이포·그림자)

Components.jsx           # 공통 컴포넌트 (Button·Badge·Icon·Input·TopBar·Sidebar)
*Screen.jsx              # 각 화면 컴포넌트
*Modal.jsx               # 모달 컴포넌트
Clinic*.jsx              # 병원 관리 (Screen·Sections·Parts·EditModals)
dashboard*.jsx           # 경영 대시보드 (Screen·Brief/Dense/Story·Charts·Cards·Data)
*Data.jsx / *data.jsx    # 시드 데이터 (clinicData·dashboardData·herbData·staffData 등)
```

---

## 테마

### 색상 테마 추가
`colors_and_type.css`에 `[data-color="newtheme"]` 블록을 추가:

```css
[data-color="newtheme"] {
  --jade-500: /* 새 주색 */;
}
[data-theme="dark"][data-color="newtheme"] {
  --bg-page: /* 다크 배경 */;
}
```

그 다음 `SettingsScreen.jsx`의 `COLOR_PREVIEWS`에 항목을 추가합니다.

### 명암 테마
`<html>`의 `[data-theme="dark"]`로 다크모드 전환. 차트 설정 화면에서 라이트/다크/시스템 자동 선택, `localStorage` 유지.

---

## Standalone 빌드

```bash
python3 build-standalone.py
```
`index.html`의 외부 JSX·CSS 참조를 모두 인라인으로 삽입해 `index.standalone.html`을 생성합니다.
