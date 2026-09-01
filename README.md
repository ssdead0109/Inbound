# 🏭 SmartRack (스마트 랙 & 재고 관리 시스템)

Node.js/Express 백엔드(REST API)와 React Vite 프론트엔드로 구성된 산업용 스마트 재고/랙 관리 시스템입니다.

---

## 🛠️ 기술 스택 & 아키텍처

- **프론트엔드 (Frontend)**: React 19, TypeScript, Vite, TailwindCSS, Lucide Icons, html5-qrcode, qrcode.react, SheetJS (XLSX)
- **백엔드 (Backend)**: Node.js, Express, TypeScript, tsx
- **데이터 영속화 (Storage)**: 서버 사이드 JSON 파일 스토리지 (`server/data/`) 및 고속 인메모리 캐시

```
SmartRack/
├── server/                     # 백엔드 Express REST API 서버
│   ├── src/
│   │   ├── index.ts            # 서버 엔트리포인트 (포트 5000)
│   │   ├── db.ts               # 데이터베이스 영속화 모듈
│   │   ├── types.ts            # 서버 타입 정의
│   │   ├── sampleData.ts       # 초기 5,000건 표준 샘플 데이터
│   │   └── routes/             # REST API 라우트
│   │       ├── items.ts        # 재고 품목 CRUD API
│   │       ├── logs.ts         # 입출고 이력 관리 API
│   │       ├── stock.ts        # 입출고 / 일괄 출고 트랜잭션 API
│   │       └── config.ts       # 라벨 인쇄 설정 API
│   └── data/                   # JSON 영속화 데이터 저장 폴더
├── src/                        # 프론트엔드 React Vite 클라이언트
│   ├── api/                    # 백엔드 통신 API 클라이언트 계층
│   ├── components/             # UI 컴포넌트
│   ├── utils/                  # 엑셀, QR, 이미지 헬퍼 유틸
│   └── App.tsx                 # 메인 애플리케이션 컴포넌트
├── vite.config.ts              # API 프록시 (/api -> localhost:5000)
└── package.json                # 통합 빌드 & 실행 스크립트
```

---

## 🚀 실행 방법 (Quick Start)

### 1. 패키지 설치
```bash
npm install
```

### 2. 개발 모드 실행 (백엔드 + 프론트엔드 동시 실행)
```bash
npm run dev
```
- **프론트엔드 접속**: [http://localhost:3000](http://localhost:3000)
- **백엔드 REST API**: [http://localhost:5000](http://localhost:5000)
- **백엔드 헬스체크**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

### 개별 실행 명령어
- `npm run dev:server` : 백엔드 Express 서버만 실행
- `npm run dev:client` : 프론트엔드 Vite 개발 서버만 실행
- `npm run build` : 프론트엔드 프로덕션 빌드
- `npm run lint` : TypeScript 타입 검사 (`tsc --noEmit`)
