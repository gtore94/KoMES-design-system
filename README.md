# KoMES Design System

한의원 EMR(전자의무기록) 시스템 **KoMES**의 UI 디자인 시스템 및 프로토타입.

---

## 개요

- **빌드 도구 없음** — React 18 + Babel Standalone을 CDN으로 로드, JSX를 브라우저에서 직접 트랜스파일
- **단일 파일 배포** — `index.standalone.html` 하나로 모든 컴포넌트 포함
- **디자인 토큰** — CSS 변수 기반 색상·타이포·그림자·반경 시스템 (라이트 / 다크 테마)
- **아이콘** — Lucide Icons (CDN)
- **폰트** — Noto Serif KR · Noto Sans KR · JetBrains Mono (Google Fonts)

---

## 실행 방법

### 로컬 서버 (개발)
```bash
# 파이썬 내장 서버
python3 -m http.server 8080
# 또는
npx serve .
```
브라우저에서 `http://localhost:8080` 접속

### Standalone (파일 직접 열기)
```
index.standalone.html
```
서버 없이 브라우저에서 바로 열 수 있는 단일 파일. 모든 JSX가 인라인으로 포함됨.

### GitHub Pages
`https://gtore94.github.io/KoMES-design-system/`

---

## 화면 구성

| 메뉴 | 파일 | 설명 |
|------|------|------|
| 진료 현황 | `PatientListScreen.jsx` | 당일 접수 · 대기 · 진료 현황, 신규 환자 등록 |
| 진료 차트 | `PatientChartScreen.jsx` | 환자 차트, 자보 바, 예약 추가 |
| 환자 관리 | `PatientManagementScreen.jsx` | 전체 환자 등록부, 관계도 |
| 예약 관리 | `ScheduleScreen.jsx` | 주간 예약 캘린더 |
| 수납 | `PaymentScreen.jsx` | 결제 및 환불 |
| 보험 청구 | `InsuranceClaimScreen.jsx` | 건강보험·한약·자보 청구 |
| 서식 발급 | `MedicalFormScreen.jsx` | 진단서·상해진단서·의뢰서·확인서·세부내역서 등 8종 A4 미리보기 |
| 약재 재고 | `HerbInventoryScreen.jsx` | 약재 입출고·조정 |
| 소모품 | `SuppliesScreen.jsx` | 소모품 재고·조정 |
| 발주 이력 | `PurchaseOrderHistoryScreen.jsx` | 발주 관리 및 초안 작성 |
| 처방 관리 | `PrescriptionScreen.jsx` | 한약·침구 처방 |
| 직원 관리 | `StaffManagementScreen.jsx` | 직원 등록·수정·권한 관리 |
| 설정 | `SettingsScreen.jsx` | 테마(라이트/다크/자동)·밀도·글자 크기 |

---

## 파일 구조

```
index.html               # 개발용 (JSX 파일 외부 로드)
index.standalone.html    # 배포용 (모든 JSX 인라인 포함)
Components.jsx           # 공통 컴포넌트 (Button, Badge, Icon, TopBar 등)
LeftRail.jsx             # 사이드바 네비게이션
*Screen.jsx              # 각 화면 컴포넌트
*Modal.jsx               # 모달 컴포넌트
*Data.jsx / *data.jsx    # 시드 데이터
```

---

## 테마

`[data-theme="dark"]` attribute를 `<html>`에 적용해 다크모드 전환.
설정 화면에서 라이트 / 다크 / 시스템 자동 선택 가능. `localStorage`에 저장되어 새로고침 후에도 유지.

---

## Standalone 빌드

`index.html`의 외부 JSX 참조를 모두 인라인으로 삽입해 standalone 재생성:

```bash
python3 << 'EOF'
import re

with open("index.html") as f: html = f.read()
head_end = html.index('<script type="text/babel" src=')
head = html[:head_end].replace("KoMES — UI Kit", "KoMES — UI Kit (Standalone)")
last = html.rindex('<script type="text/babel">')
app_script = html[last:html.index('</script>', last) + len('</script>')]

jsx_files = [
    "Components.jsx","LeftRail.jsx","NewPatientModal.jsx","ChartActingPanel.jsx",
    "PatientListScreen.jsx","PatientManagementScreen.jsx","PatientChartScreen.jsx",
    "PrescriptionScreen.jsx","ScheduleScreen.jsx","PaymentScreen.jsx",
    "herbData.jsx","HerbInventoryParts.jsx","HerbRegistrationModal.jsx",
    "HerbAdjustmentScreen.jsx","HerbInventoryScreen.jsx",
    "suppliesData.jsx","SuppliesParts.jsx","SupplyRegistrationModal.jsx",
    "SupplyAdjustmentScreen.jsx","SuppliesScreen.jsx",
    "purchaseOrdersData.jsx","PurchaseOrderHistoryScreen.jsx",
    "PurchaseOrderDraftScreen.jsx","RecommendationSettingsModal.jsx",
    "claimData.jsx","ClaimSidebar.jsx","ClaimList.jsx",
    "ClaimSubmissionFlow.jsx","InsuranceClaimScreen.jsx",
    "PatientPickerData.jsx","PatientPickerModal.jsx","MedicalFormScreen.jsx",
    "PatientInstructionData.jsx","PatientInstructionModal.jsx",
    "staffData.jsx","NewStaffModal.jsx","StaffManagementScreen.jsx","SettingsScreen.jsx",
]

out = [head, "\n"]
for f in jsx_files:
    out.append(f'<script type="text/babel">\n{open(f).read()}\n</script>\n\n')
out.append(app_script + "\n</body>\n</html>\n")

with open("index.standalone.html", "w") as f: f.write("".join(out))
print("Done")
EOF
```
