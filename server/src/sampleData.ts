import { InventoryItem, StockLog } from './types';

const CATEGORY_DEFINITIONS = [
  {
    category: '전자부품',
    codePrefix: 'ELEC',
    items: [
      { name: 'SMPS 산업용 전원공급장치', specs: ['24V DC / 10A / DIN-Rail', '12V DC / 5A / 소형', '48V DC / 20A / 고용량', '24V DC / 2.5A / 초슬림', '5V DC / 10A / 정밀'], unit: 'EA', priceBase: 38000, supplier: '명지전자(주)' },
      { name: 'STM32 MCU 제어보드', specs: ['ARM Cortex-M4 168MHz 512KB', 'ARM Cortex-M7 480MHz 2MB', 'Cortex-M0+ 초저전력 64KB', 'Dual-Core H743ZI 고성능'], unit: 'EA', priceBase: 18500, supplier: '케이텍컴포넌트' },
      { name: '오토닉스 광전센서 포토센서', specs: ['투수광형 10m 감지거리 NPN', '직접반사형 300mm PNP', '미러반사형 3m 내유형 M18', '초소형 앰프내장형 50mm'], unit: 'EA', priceBase: 24000, supplier: '오토닉스정밀' },
      { name: '산업용 SSR 무접점 릴레이', specs: ['단상 AC 240V / 40A 방열판일체', '3상 AC 480V / 50A 제로크로스', 'DC 입력 4-32V / 출력 10A'], unit: 'EA', priceBase: 15500, supplier: '삼원액트(주)' },
      { name: 'AC 서보 모터 드라이버', specs: ['750W 200V EtherCAT 지원', '400W 펄스열/아날로그 제어', '1.5kW 3상 380V 앱솔루트', '200W 초소형 플랜지 40mm'], unit: 'SET', priceBase: 320000, supplier: '효성메카텍' },
      { name: '디지털 로터리 엔코더', specs: ['분해능 1024 P/R 라인드라이버', '분해능 2048 P/R 오픈컬렉터', '앱솔루트 16비트 SSI 출력'], unit: 'EA', priceBase: 65000, supplier: '한일기전' },
      { name: '산업용 인버터 VFD', specs: ['3상 220V 0.75kW 벡터제어', '3상 380V 2.2kW 중부하용', '단상 220V 0.4kW 컴팩트'], unit: 'EA', priceBase: 195000, supplier: '명지전자(주)' },
      { name: 'DIN-Rail 터미널 블록 단자대', specs: ['스프링클램프 2.5sq 2선식', '스크류방식 4sq 피닉스호환', '접지형 PE단자 2.5sq 녹/황'], unit: 'BOX', priceBase: 12000, supplier: '삼원액트(주)' },
    ],
  },
  {
    category: '기계부품',
    codePrefix: 'MECH',
    items: [
      { name: '고정밀 깊은홈 볼베어링', specs: ['6204ZZ (내경20x외경47x폭14mm)', '6002ZZ (내경15x외경32x폭9mm)', '6205-2RS (고무실드 양면)', '608ZZ 미니어처 8x22x7mm'], unit: 'EA', priceBase: 4200, supplier: '삼우베어링정밀' },
      { name: 'NEMA 23/24 스텝모터', specs: ['토크 1.8Nm / 축경 6.35mm / 2.8A', '토크 2.5Nm / 브레이크 일체형', '토크 0.9Nm / 슬림형 42mm각'], unit: 'EA', priceBase: 46000, supplier: '동양모터스' },
      { name: 'LM 가이드 블록 & 레일', specs: ['HGH20CA 볼타입 레일길이 500mm', 'HGW15CC 플랜지형 와이드 600mm', 'MGN12H 소형 미니어처 300mm'], unit: 'SET', priceBase: 88000, supplier: '효성메카텍' },
      { name: '정밀 볼스크류', specs: ['외경 16mm / 리드 5mm / C7 정밀도', '외경 20mm / 리드 10mm / 연삭 C5', '외경 12mm / 리드 4mm 초소형'], unit: 'SET', priceBase: 145000, supplier: '효성메카텍' },
      { name: '타이밍 풀리 & 벨트 세트', specs: ['HTD-3M 30T / 축경 8mm / 폭 15mm', 'GT2 20T / 보어 5mm (벨트 2M)', 'HTD-5M 40T / 테이퍼 락 부시'], unit: 'SET', priceBase: 18000, supplier: '동양모터스' },
      { name: '플렉시블 죠 커플링', specs: ['외경 30mm x 길이 40mm (d1=8, d2=10)', '외경 40mm 우레탄 스파이더 (d1=12, d2=14)', '디스크 커플링 제로백래시'], unit: 'EA', priceBase: 16500, supplier: '삼우베어링정밀' },
      { name: '리니어 부싱 & 샤프트', specs: ['LM20UU 내경 20mm 하우징일체', 'SUJ2 고주파열처리 연마봉 20x500mm', 'SBR20 오픈형 지지대 일체형'], unit: 'EA', priceBase: 22000, supplier: '삼우베어링정밀' },
    ],
  },
  {
    category: '원자재',
    codePrefix: 'RAW',
    items: [
      { name: '알루미늄 압출 프로파일', specs: ['4040 실버 8홀 슬롯 (길이 2000mm)', '2020 블랙 아노다이징 (길이 1500mm)', '3030 고강도 6홀 슬롯 (길이 2000mm)', '4080 중하중 더블슬롯 (길이 1000mm)'], unit: '본', priceBase: 22000, supplier: '대성알루미늄' },
      { name: 'SUS304 육각렌치볼트', specs: ['M5 x 20mm (100EA/Box)', 'M4 x 12mm (100EA/Box)', 'M6 x 25mm (100EA/Box)', 'M8 x 35mm (50EA/Box)', 'M3 x 10mm (200EA/Box)'], unit: 'BOX', priceBase: 7500, supplier: '태광화스너' },
      { name: 'SUS304 스프링와셔/평와셔', specs: ['M5 평와셔 (500EA/팩)', 'M6 스프링와셔 (500EA/팩)', 'M8 일체형 세트와셔 (200EA)'], unit: 'PACK', priceBase: 4500, supplier: '태광화스너' },
      { name: 'MC 나일론 가공 판재', specs: ['두께 20mm x 300 x 300mm 블루', '두께 10mm x 500 x 500mm 내마모', '봉재 외경 50mm x 길이 1000mm'], unit: '장', priceBase: 35000, supplier: '대성알루미늄' },
      { name: '투명 아크릴 PC 보호커버판', specs: ['두께 5mm x 600 x 900mm 정전기방지', '두께 3mm x 500 x 500mm 레이저커팅', '두께 8mm 고강도 폴리카보네이트'], unit: '장', priceBase: 28000, supplier: '대성알루미늄' },
      { name: '무산소동 순동 부스바', specs: ['폭 30mm x 두께 5mm x 길이 1000mm', '폭 20mm x 두께 3mm 도금완료', '폭 50mm x 두께 10mm 대전류용'], unit: '본', priceBase: 42000, supplier: '대성알루미늄' },
    ],
  },
  {
    category: '유공압부품',
    codePrefix: 'PNEU',
    items: [
      { name: 'SMC형 솔레노이드 밸브', specs: ['5포트 2위치 DC24V 단동형', '5포트 2위치 복동형 AC220V', '3포트 소형 매니폴드 일체형 4연'], unit: 'EA', priceBase: 32000, supplier: '신영유공압' },
      { name: '복동 에어 실린더', specs: ['보어 32mm x 스트로크 100mm 쿠션내장', '컴팩트 박형 실린더 25x50mm 오토스위치홈', '가이드 실린더 20x75mm 2축'], unit: 'EA', priceBase: 54000, supplier: 'SMC코리아' },
      { name: '원터치 피팅 커넥터', specs: ['수나사 엘보 6mm-PT1/8 (10EA/Pack)', '스트레이트 8mm-PT1/4 (10EA)', 'Y형 분기피팅 6mm (10EA)'], unit: 'PACK', priceBase: 9500, supplier: '신영유공압' },
      { name: '에어 필터 레귤레이터 F.R.L', specs: ['모듈러 1/4인치 압력계/브라켓 포함', '고유량 1/2인치 자동드레인', '소형 미스트세퍼레이터 1/8'], unit: 'SET', priceBase: 48000, supplier: 'SMC코리아' },
      { name: '우레탄 에어호스 튜브', specs: ['외경 6mm x 내경 4mm (100m/Roll) 투명블루', '외경 8mm x 내경 5.5mm (100m) 블랙', '내열 스파크방지 난연튜브 6mm'], unit: 'ROLL', priceBase: 34000, supplier: '신영유공압' },
    ],
  },
  {
    category: '공구/설비',
    codePrefix: 'TOOL',
    items: [
      { name: '초경 엔드밀 & 드릴 비트', specs: ['TiAlN 코팅 4날 6mm (HRC65)', '알루미늄 전용 2날 8mm 고경면', '초경 센터드릴 3mm x 60도'], unit: 'EA', priceBase: 14500, supplier: '한국야금(주)' },
      { name: '디지털 버니어 캘리퍼스', specs: ['측정범위 0-150mm 분해능 0.01mm 방수', '0-200mm 솔라형 카바이드 팁', '디지털 깊이게이지 150mm'], unit: 'EA', priceBase: 68000, supplier: '보쉬렉스로스코리아' },
      { name: '온도조절 정전기방지 인두기', specs: ['90W 고주파 가열형 스테이션', 'T12 일체형 팁 350℃ 급속가열', '납흡입 디솔더링 건 일체형'], unit: 'SET', priceBase: 125000, supplier: '보쉬렉스로스코리아' },
      { name: '토크렌치 & 비트세트', specs: ['프리셋 토크 0.5-5.0Nm (1/4인치)', '디지털 토크렌치 10-60Nm 알람기능', '육각/별비트 24종 S2강'], unit: 'SET', priceBase: 89000, supplier: '한국야금(주)' },
      { name: '공압 에어 타카 & 건', specs: ['초경량 에어더스터 롱노즐 100mm', '에어 임팩트렌치 1/2인치 트윈해머', '방음형 에어 블로우건'], unit: 'EA', priceBase: 29000, supplier: '보쉬렉스로스코리아' },
    ],
  },
  {
    category: '소모품',
    codePrefix: 'CONS',
    items: [
      { name: '대전방지 ESD 캡톤 테이프', specs: ['폭 20mm x 길이 33m 내열 260℃', '폭 10mm x 길이 33m 골드', '폭 50mm 절연 마스킹용'], unit: 'ROLL', priceBase: 6800, supplier: '현대테이프' },
      { name: '산업용 록타이트 나사고정제', specs: ['243 중강도 탈착가능 (50ml)', '271 고강도 영구고정 (50ml)', '263 고강도/내유성 (50ml)'], unit: 'EA', priceBase: 16500, supplier: '현대테이프' },
      { name: '크린룸 저발진 와이퍼', specs: ['9x9인치 폴리에스터 (150장/팩)', '극세사 프리미엄 초음파컷팅', '정전기방지 롤 와이퍼 300m'], unit: 'PACK', priceBase: 11000, supplier: '현대테이프' },
      { name: '방열 실리콘 그리스 써멀', specs: ['열전도율 4.5W/mK 주사기형 (30g)', '방열패드 100x100x1.0mm 시트', 'LED 방열용 2액형 실란트'], unit: 'EA', priceBase: 8500, supplier: '현대테이프' },
      { name: '방청 윤활 방습 스프레이', specs: ['WD-40 450ml 스마트스트로', '식품등급 그리스 스프레이 NSF H1', '몰리브덴 고하중 윤활제 400ml'], unit: 'EA', priceBase: 5200, supplier: '현대테이프' },
      { name: '나일론 케이블타이', specs: ['폭 4.8mm x 길이 250mm 블랙 (100EA)', '폭 3.6mm x 길이 150mm (1000EA/봉)', '매직 벨크로 타이 20mm x 5m'], unit: 'PACK', priceBase: 4200, supplier: '현대테이프' },
    ],
  },
  {
    category: '배선/커넥터',
    codePrefix: 'WIRE',
    items: [
      { name: '산업용 방수 원형 커넥터', specs: ['M12 4핀 A코드 수나사 암소켓', 'M8 3핀 센서 직결형 몰딩케이블 2M', 'M12 8핀 X코드 기가비트 이더넷'], unit: 'EA', priceBase: 12500, supplier: '삼원액트(주)' },
      { name: '로봇용 고굴곡 케이블', specs: ['0.5sq x 4C 차폐 실드 100m', '0.75sq x 8C 가동형 오일내성', '0.3sq x 12C 신호용 트위스트페어'], unit: 'ROLL', priceBase: 115000, supplier: '한일기전' },
      { name: '페룰 단자 압착 슬리브', specs: ['0.75sq 화이트 절연 (1000EA/Box)', '1.5sq 블랙 절연 (1000EA/Box)', '2.5sq 블루 절연 (500EA/Box)', '4.0sq 그레이 단자 (200EA)'], unit: 'BOX', priceBase: 8800, supplier: '삼원액트(주)' },
      { name: '산업용 RJ45 패치코드', specs: ['CAT.6A 이중차폐 SSTP 3M 내유', 'CAT.6 초유연 로봇케이블 5M', '방수 캡형 패널마운트 커플러'], unit: 'EA', priceBase: 9200, supplier: '케이텍컴포넌트' },
    ],
  },
  {
    category: '화학/케미컬',
    codePrefix: 'CHEM',
    items: [
      { name: '초고순도 IPA 이소프로필알코올', specs: ['99.9% 세정용 4L 캔', '정밀전자세정 스프레이 450ml', '무수 알코올 20L 말통'], unit: '통', priceBase: 17500, supplier: '현대테이프' },
      { name: '산업용 구조용 에폭시 접착제', specs: ['DP-460 50ml 듀얼카트리지 2:1', '5분 급속경화 투명 에폭시 200g', '금속보수제 스틸퍼티 500g'], unit: 'SET', priceBase: 26000, supplier: '현대테이프' },
      { name: 'PCB 우레탄 방습 절연코팅제', specs: ['투명 절연 스프레이 400ml UV체크', '고온 실리콘 콘포멀 코팅 1L', '수분/염분 방지 특수 피막제'], unit: 'EA', priceBase: 14000, supplier: '현대테이프' },
    ],
  },
];

const WAREHOUSES = [
  '메인물류창고',
  'A동 원자재창고',
  'B동 전장조립창고',
  'C동 기계가공창고',
  '제2생산공장 자재실',
  '외부위탁보관소',
];

const RACK_ZONES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'R', 'S', 'T'];

export function generate5000DummyItems(): InventoryItem[] {
  const items: InventoryItem[] = [];
  const totalCount = 5000;

  for (let i = 1; i <= totalCount; i++) {
    const catGroupIndex = (i - 1) % CATEGORY_DEFINITIONS.length;
    const catGroup = CATEGORY_DEFINITIONS[catGroupIndex];
    
    const itemTypeIndex = Math.floor((i - 1) / CATEGORY_DEFINITIONS.length) % catGroup.items.length;
    const template = catGroup.items[itemTypeIndex];
    
    const specIndex = (i + itemTypeIndex) % template.specs.length;
    const chosenSpec = template.specs[specIndex];

    const numPadded = String(i).padStart(4, '0');
    const code = `${catGroup.codePrefix}-${String(itemTypeIndex + 1).padStart(2, '0')}-${numPadded}`;
    
    const variantNum = Math.floor((i - 1) / (CATEGORY_DEFINITIONS.length * catGroup.items.length)) + 1;
    const name = variantNum > 1 ? `${template.name} Ver.${variantNum}` : template.name;

    let warehouse = '';
    let rackLocation = '';
    
    if (i % 12 === 0) {
      warehouse = '미입력';
      rackLocation = '미입력';
    } else {
      const whIndex = (i * 7) % WAREHOUSES.length;
      warehouse = WAREHOUSES[whIndex];
      const zone = RACK_ZONES[(i * 3) % RACK_ZONES.length];
      const bay = String(((i * 5) % 15) + 1).padStart(2, '0');
      const level = String(((i * 2) % 6) + 1).padStart(2, '0');
      rackLocation = `${warehouse} ${zone}-${bay}-${level}`;
    }

    const safetyStock = (i % 6 + 1) * 5;
    let quantity = ((i * 17) % 180) + 1;
    if (i % 10 === 0) {
      quantity = Math.max(0, Math.floor(safetyStock * 0.5));
    }

    const priceVariance = ((i % 10) - 5) * 500;
    const price = Math.max(1000, template.priceBase + priceVariance);

    const isPrinted = i % 3 !== 0;
    const printCount = isPrinted ? (i % 4) + 1 : 0;

    const dayOffset = (i % 180);
    const dateObj = new Date(2026, 7, 18);
    dateObj.setDate(dateObj.getDate() - dayOffset);
    const dateIso = dateObj.toISOString();

    const notesList = [
      '2026년도 정기 승인 규격품. 랙 라벨 부착 요망',
      '신속 입출고 대상. 안전재고 기준 엄수',
      'CE/UL 국제 규격 인증 완료. 습기 취약 보관',
      '협력업체 분기별 직납 품목. 바코드 검수 완료',
      '생산 1라인 주력 소모 자재. 긴급 재고 확보',
      '출고 시 선입선출(FIFO) 규칙 준수 품목',
      '정밀 검사 완료품. 정전기 방지 포장 유지',
    ];
    const notes = notesList[i % notesList.length];

    items.push({
      id: `item-${numPadded}`,
      code,
      name,
      spec: chosenSpec,
      category: catGroup.category,
      warehouse,
      rackLocation,
      quantity,
      unit: template.unit,
      safetyStock,
      price,
      supplier: template.supplier,
      notes,
      createdAt: dateIso,
      updatedAt: dateIso,
      printCount,
      isPrinted,
      lastPrintedAt: isPrinted ? dateIso : undefined,
    });
  }

  return items;
}

export const INITIAL_ITEMS: InventoryItem[] = generate5000DummyItems();

export const INITIAL_LOGS: StockLog[] = [
  {
    id: 'log-001',
    itemId: 'item-0001',
    itemCode: 'ELEC-01-0001',
    itemName: 'SMPS 산업용 전원공급장치',
    type: 'IN',
    quantity: 50,
    previousQty: 25,
    newQty: 75,
    manager: '김철수 대리',
    reason: '정기 대량 입고 검수 완료',
    timestamp: '2026-08-17T14:30:00Z',
  },
  {
    id: 'log-002',
    itemId: 'item-0002',
    itemCode: 'MECH-01-0002',
    itemName: '고정밀 깊은홈 볼베어링',
    type: 'OUT',
    quantity: 12,
    previousQty: 48,
    newQty: 36,
    manager: '이영희 과장',
    reason: '생산라인 2공정 정기 불출',
    timestamp: '2026-08-17T16:20:00Z',
  },
  {
    id: 'log-003',
    itemId: 'item-0003',
    itemCode: 'RAW-01-0003',
    itemName: '알루미늄 압출 프로파일',
    type: 'IN',
    quantity: 30,
    previousQty: 15,
    newQty: 45,
    manager: '박지훈 주임',
    reason: '신규 프레임 조립용 입고',
    timestamp: '2026-08-18T08:00:00Z',
  },
];
