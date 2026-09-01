# SmartRack UI Design System Guide (`design.md`)

본 문서는 **SmartRack QR 자재 입고 시스템**의 일관된 사용자 경험(UX)과 시각적 완성도(UI)를 유지하기 위한 표준 디자인 가이드라인입니다. 향후 추가 및 수정되는 모든 컴포넌트와 화면은 반드시 본 가이드를 준수해야 합니다.

---

## 1. 테마 및 색상 시스템 (Light Theme Palette)

SmartRack은 공장 및 자재창고 현장의 조명 환경과 가독성을 고려하여 **정갈하고 화사한 밝은 톤(Bright Light Theme)**을 기본 테마로 사용합니다.

### 1.1 배경 및 표면 (Background & Surfaces)
- **전체 앱 배경 (App Background)**: `bg-slate-50` (`#f8fafc`)
- **카드 및 모달 컨테이너 (Card / Modal Background)**: `bg-white` (`#ffffff`)
- **보조 영역 / 헤더 / 입력창 배경**: `bg-slate-100/70` (`#f1f5f9`) 또는 `bg-slate-50`
- **호버 표면 (Hover State)**: `hover:bg-slate-50` 또는 `hover:bg-slate-100`

### 1.2 테두리 및 구분선 (Borders & Dividers)
- **기본 테두리 (Default Border)**: `border border-slate-200`
- **은은한 구분선 (Subtle Divider)**: `border-slate-100`
- **포커스 / 활성화 테두리**: `border-indigo-500 ring-2 ring-indigo-500/20`

### 1.3 텍스트 컬러 (Text Colors)
- **제목 / 주 텍스트 (Primary Text)**: `text-slate-900` (`#0f172a`, `font-bold` 또는 `font-semibold`)
- **본문 / 보조 텍스트 (Secondary Text)**: `text-slate-600` (`#475569`)
- **메타 정보 / 힌트 (Muted Text)**: `text-slate-400` (`#94a3b8`)
- **강조 / 브랜드 텍스트**: `text-indigo-600` (`#4f46e5`)
- **코드 / SKU / 단가**: `font-mono text-indigo-700` 또는 `font-mono text-slate-800`

### 1.4 상태 및 피드백 컬러 (Status & Feedback)
모든 상태 뱃지는 **연한 파스텔 배경 + 진한 텍스트 + 은은한 테두리** 조합을 적용합니다:
- **완료 / 정상 (Success)**: `bg-emerald-50 text-emerald-700 border border-emerald-200`
- **대기 / 주의 (Warning)**: `bg-amber-50 text-amber-800 border border-amber-200`
- **진행중 / 정보 (Info)**: `bg-blue-50 text-blue-700 border border-blue-200`
- **불량 / 파손 (Danger)**: `bg-rose-50 text-rose-700 border border-rose-200`
- **기본 / 미지정 (Neutral)**: `bg-slate-100 text-slate-700 border border-slate-200`

---

## 2. 타이포그래피 계층 (Typography Scale Hierarchy)

글자 크기는 형태별로 명확하게 통일하며, 임의의 폰트 크기 사용을 지양합니다.

| 용도 | Tailwind 클래스 | 폰트 굵기 | 주요 사용 위치 |
| :--- | :--- | :--- | :--- |
| **페이지 대제목** | `text-lg sm:text-xl` | `font-bold` | 상단 로고, 모달 타이틀, 전표 헤더 번호 |
| **섹션 / 카드 제목** | `text-sm sm:text-base` | `font-bold` | 검수 품목 리스트 헤더, 스캐너 카드 타이틀 |
| **본문 / 주요 품목명** | `text-xs sm:text-sm` | `font-semibold` | 품목명, 공급업체명, 핵심 통계 수치 |
| **보조 설명 / 메타** | `text-xs` | `font-normal` | 규격, 단위, 발주일자, 메모, 안내 문구 |
| **배지 / 마이크로 라벨** | `text-[11px]` | `font-bold` | 진행 상태 뱃지, 태그, 스텝 번호 |
| **품목코드 / 바코드** | `text-xs font-mono` | `font-bold` | 품목코드(SKU), 전표번호, 수량 카운터 |

---

## 3. 컴포넌트 표준 규격 (Component Standards)

### 3.1 버튼 규격 (Button Standards)
- **Primary Button (주요 액션 - 입고 확정, QR 스캔 등)**:
  - `bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer`
- **Success Button (전량 일괄 완료 등)**:
  - `bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer`
- **Secondary Button (보조 액션 - 목록, 닫기 등)**:
  - `bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-300 px-3.5 py-2 rounded-xl transition-all cursor-pointer`
- **Ghost / Icon Button**:
  - `p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors`
- **모바일 최소 터치 영역**: 버튼의 높이는 최소 `40px` 이상 유지 (`py-2` 이상).

### 3.2 카드 및 모달 (Card & Modal Container)
- **기본 카드**: `bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs`
- **모달 창**: `bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden`
- **모달 백드롭 (Backdrop)**: `bg-slate-900/50 backdrop-blur-xs`

### 3.3 입력창 (Input & Textarea)
- `bg-white text-slate-900 placeholder-slate-400 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all`

---

## 4. 모바일 반응형 레이아웃 원칙 (Mobile-First Layout Rules)

1. **수평 깨짐 방지**:
   - 모바일 화면(폭 < 640px)에서는 테이블 구조 대신 **유연한 카드 리스트 형태**로 자동 전환.
   - 가로 너비 고정 픽셀(예: `w-[600px]`) 사용을 금지하고 `w-full max-w-5xl`과 유연한 패딩(`px-3 sm:px-6`) 적용.
2. **긴 텍스트 줄바꿈/말줄임 (`truncate` / `break-words`)**:
   - 품목명, 공급처명 등 긴 문자열에는 반드시 `truncate` 또는 `line-clamp-1`과 `min-w-0`를 적용하여 부모 컨테이너가 찌그러지지 않도록 보호.
3. **모바일 하단 고정 탭 / 액션 바**:
   - 모바일 화면에서는 하단 네비게이션 및 확정 버튼 바를 `fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200`으로 고정하여 한 손 조작성 확보.

---

## 5. 랙(Rack) 기능 배제 원칙

- 프로그램 내에서 랙 위치, 랙 슬롯 바코드, 랙 조회 모달, 랙 관련 용어는 일체 표시하지 않으며, 순수 **납품확인서 전표 검수 및 자재 재고 입고처리**에만 집중합니다.
