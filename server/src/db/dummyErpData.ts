import fs from 'fs';
import path from 'path';
import { InboundSlip, InboundItem } from '../types/inbound';

export interface DummyMaterial {
  code: string;
  name: string;
  spec: string;
  unit: string;
  unitPrice: number;
  safetyStock: number;
  basicStock: number;
  zone: string;
  category: string;
  supplierCode: string;
  supplierName: string;
  notes: string;
  updatedAt: string;
  whCode: string;
  whName: string;
  currentStock: number;
}

export interface DummyPurchaseOrder {
  poNo: string;
  poDate: string;
  deliveryDate: string;
  supplierCode: string;
  supplierName: string;
  warehouseName: string;
  itemCode: string;
  itemName: string;
  itemSpec: string;
  unit: string;
  poQty: number;
  receivedQty: number;
  remainQty: number;
  unitPrice: number;
  totalAmount: number;
  remarks: string;
  status: 'WAITING' | 'PARTIAL' | 'COMPLETED';
}

export const DUMMY_WAREHOUSES = [
  { code: 'ALL', name: '전체 창고', itemCount: 120 },
  { code: '101', name: '특장자재창고', itemCount: 52 },
  { code: '102', name: '함안자재창고', itemCount: 34 },
  { code: '103', name: '화성자재창고', itemCount: 22 },
  { code: '104', name: '본관 자재1창고', itemCount: 12 },
];

let cachedMaterials: DummyMaterial[] | null = null;

export function getDummyMaterials(): DummyMaterial[] {
  if (cachedMaterials && cachedMaterials.length > 0) {
    return cachedMaterials;
  }

  const materialsMap = new Map<string, DummyMaterial>();

  // 1. Load from server/data/inbound_slips.json if exists
  const slipsPath = path.resolve(process.cwd(), 'server/data/inbound_slips.json');
  if (fs.existsSync(slipsPath)) {
    try {
      const slipsRaw = fs.readFileSync(slipsPath, 'utf-8');
      const slips = JSON.parse(slipsRaw);
      const whNames = ['특장자재창고', '함안자재창고', '화성자재창고', '본관 자재1창고'];
      const whCodes = ['101', '102', '103', '104'];

      let idx = 0;
      for (const slip of slips) {
        const supName = slip.supplierName || '협력업체';
        const supCode = slip.supplierCode || 'SUP-001';
        for (const it of (slip.items || [])) {
          if (!it.itemCode) continue;
          const whIdx = idx % whNames.length;
          const code = String(it.itemCode).trim();
          if (!materialsMap.has(code)) {
            materialsMap.set(code, {
              code,
              name: it.itemName || '표준 부품',
              spec: it.spec || '표준 규격',
              unit: it.unit || 'EA',
              unitPrice: it.unitPrice || 12500,
              safetyStock: 10,
              basicStock: 50,
              zone: `Z-${String.fromCharCode(65 + (idx % 6))}`,
              category: '기계부품',
              supplierCode: supCode,
              supplierName: supName,
              notes: it.notes || 'ERP 실시간 연동 부품 (가상 더미 모드)',
              updatedAt: new Date().toISOString().slice(0, 10),
              whCode: whCodes[whIdx],
              whName: it.warehouse || whNames[whIdx],
              currentStock: Math.floor(Math.random() * 80 + 20),
            });
            idx++;
          }
        }
      }
    } catch (err) {
      console.warn('[DummyErp] Could not load items from inbound_slips.json:', err);
    }
  }

  // 2. Base Fallback Materials
  const baseItems: DummyMaterial[] = [
    {
      code: '000573000',
      name: 'S-VALVE (유압 밸브)',
      spec: '200*180(COMMON USE)',
      unit: 'EA',
      unitPrice: 85000,
      safetyStock: 5,
      basicStock: 25,
      zone: 'Z-A',
      category: '유압부품',
      supplierCode: 'SUP-SHIN',
      supplierName: '신우정공',
      notes: '특장차량 공용 유압 밸브',
      updatedAt: '2026-09-01',
      whCode: '101',
      whName: '특장자재창고',
      currentStock: 48,
    },
    {
      code: '900060050',
      name: 'DU-BUSH 60*50',
      spec: '60*50 부싱',
      unit: 'EA',
      unitPrice: 4500,
      safetyStock: 20,
      basicStock: 100,
      zone: 'Z-B',
      category: '기계부품',
      supplierCode: 'SUP-JSB',
      supplierName: '제이에스비(JSB)',
      notes: '고하중 부싱',
      updatedAt: '2026-09-02',
      whCode: '101',
      whName: '특장자재창고',
      currentStock: 120,
    },
    {
      code: '403240000',
      name: 'BOOM CYLINDER SET',
      spec: 'M40Z 5S',
      unit: 'SET',
      unitPrice: 420000,
      safetyStock: 2,
      basicStock: 8,
      zone: 'Z-C',
      category: '유압부품',
      supplierCode: 'SUP-JINAN',
      supplierName: '화천웨이다 실린더',
      notes: '붐대 유압 실린더 세트',
      updatedAt: '2026-08-28',
      whCode: '101',
      whName: '특장자재창고',
      currentStock: 14,
    },
    {
      code: 'W123',
      name: '베어링 후렌지 아세이',
      spec: 'Ø60 유팩킹타입',
      unit: 'EA',
      unitPrice: 32000,
      safetyStock: 10,
      basicStock: 40,
      zone: 'Z-D',
      category: '베어링',
      supplierCode: 'SUP-DAEWON',
      supplierName: '(주)대원하이텍',
      notes: '회전부 베어링 플랜지',
      updatedAt: '2026-09-02',
      whCode: '102',
      whName: '함안자재창고',
      currentStock: 65,
    },
    {
      code: 'ELEC-SENS-501',
      name: '적외선 광학 거리 센서 모듈',
      spec: 'VL53L1X ToF 4m Range',
      unit: 'EA',
      unitPrice: 18500,
      safetyStock: 15,
      basicStock: 60,
      zone: 'Z-E',
      category: '전장부품',
      supplierCode: 'SUP-KS01',
      supplierName: '(주)한국정밀센서',
      notes: '정밀 거리 측정 센서',
      updatedAt: '2026-09-02',
      whCode: '101',
      whName: '특장자재창고',
      currentStock: 150,
    },
    {
      code: 'MECH-BEAR-202',
      name: '고속 플랜지 볼베어링',
      spec: 'F695-2RS 5x13x4mm',
      unit: 'SET',
      unitPrice: 6200,
      safetyStock: 30,
      basicStock: 200,
      zone: 'Z-F',
      category: '베어링',
      supplierCode: 'SUP-KS01',
      supplierName: '(주)한국정밀센서',
      notes: '고속 정밀 볼베어링',
      updatedAt: '2026-09-02',
      whCode: '103',
      whName: '화성자재창고',
      currentStock: 300,
    },
  ];

  for (const item of baseItems) {
    if (!materialsMap.has(item.code)) {
      materialsMap.set(item.code, item);
    }
  }

  cachedMaterials = Array.from(materialsMap.values());
  return cachedMaterials;
}

/**
 * 사내 ERP 실시간 발주 내역 (MMB100+MMB150) 풍부한 더미 데이터 생성
 */
export function getDummyPurchaseOrders(
  query: string = '',
  status: string = 'ALL',
  limit: number = 60,
  offset: number = 0
): { rows: DummyPurchaseOrder[]; total: number } {
  const baseOrders: DummyPurchaseOrder[] = [
    {
      poNo: 'PO-20260902-001',
      poDate: '2026-09-02',
      deliveryDate: '2026-09-05',
      supplierCode: '1210943105',
      supplierName: '제이에스비(JSB)',
      warehouseName: '특장자재창고',
      itemCode: '900060050',
      itemName: 'DU-BUSH',
      itemSpec: '60*50 부싱 고하중용',
      unit: 'EA',
      poQty: 100,
      receivedQty: 0,
      remainQty: 100,
      unitPrice: 4500,
      totalAmount: 450000,
      remarks: '9월 1차 긴급 발주 건',
      status: 'WAITING',
    },
    {
      poNo: 'PO-20260902-002',
      poDate: '2026-09-02',
      deliveryDate: '2026-09-06',
      supplierCode: 'SUP-KS01',
      supplierName: '(주)한국정밀센서',
      warehouseName: '특장자재창고',
      itemCode: 'ELEC-SENS-501',
      itemName: '적외선 광학 거리 센서 모듈',
      itemSpec: 'VL53L1X ToF 4m Range',
      unit: 'EA',
      poQty: 150,
      receivedQty: 50,
      remainQty: 100,
      unitPrice: 18500,
      totalAmount: 2775000,
      remarks: '차량 충돌방지 센서용 (분할 납품)',
      status: 'PARTIAL',
    },
    {
      poNo: 'PO-20260902-003',
      poDate: '2026-09-02',
      deliveryDate: '2026-09-07',
      supplierCode: 'SUP-KS01',
      supplierName: '(주)한국정밀센서',
      warehouseName: '화성자재창고',
      itemCode: 'MECH-BEAR-202',
      itemName: '고속 플랜지 볼베어링',
      itemSpec: 'F695-2RS 5x13x4mm',
      unit: 'SET',
      poQty: 300,
      receivedQty: 0,
      remainQty: 300,
      unitPrice: 6200,
      totalAmount: 1860000,
      remarks: '정밀 구동계 베어링',
      status: 'WAITING',
    },
    {
      poNo: 'PO-20260901-001',
      poDate: '2026-09-01',
      deliveryDate: '2026-09-04',
      supplierCode: '6060440531',
      supplierName: '신우정공',
      warehouseName: '특장자재창고',
      itemCode: '000573000',
      itemName: 'S-VALVE (유압 메인 밸브)',
      itemSpec: '200*180(COMMON USE)',
      unit: 'EA',
      poQty: 25,
      receivedQty: 25,
      remainQty: 0,
      unitPrice: 85000,
      totalAmount: 2125000,
      remarks: '납품 및 검수 완료 건',
      status: 'COMPLETED',
    },
    {
      poNo: 'PO-20260901-002',
      poDate: '2026-09-01',
      deliveryDate: '2026-09-05',
      supplierCode: '1358168945',
      supplierName: '대창기계산업(주)',
      warehouseName: '함안자재창고',
      itemCode: '000351200',
      itemName: 'REDUCTION GEAR BOX (감속기어박스)',
      itemSpec: 'M40(30T)',
      unit: 'EA',
      poQty: 8,
      receivedQty: 4,
      remainQty: 4,
      unitPrice: 2730000,
      totalAmount: 21840000,
      remarks: '대형 펌프카 붐대 회전용',
      status: 'PARTIAL',
    },
    {
      poNo: 'PO-20260831-005',
      poDate: '2026-08-31',
      deliveryDate: '2026-09-03',
      supplierCode: 'SUP-DAEWON',
      supplierName: '(주)대원하이텍',
      warehouseName: '함안자재창고',
      itemCode: 'W123',
      itemName: '베어링 후렌지 아세이',
      itemSpec: 'Ø60 유팩킹타입',
      unit: 'EA',
      poQty: 60,
      receivedQty: 60,
      remainQty: 0,
      unitPrice: 32000,
      totalAmount: 1920000,
      remarks: '정기 소모품 입고완료',
      status: 'COMPLETED',
    },
    {
      poNo: 'PO-20260830-012',
      poDate: '2026-08-30',
      deliveryDate: '2026-09-08',
      supplierCode: '00391',
      supplierName: '화천웨이다 실린더',
      warehouseName: '특장자재창고',
      itemCode: '403240000',
      itemName: 'BOOM CYLINDER SET',
      itemSpec: 'M40Z 5S',
      unit: 'SET',
      poQty: 10,
      receivedQty: 0,
      remainQty: 10,
      unitPrice: 420000,
      totalAmount: 4200000,
      remarks: '수입 통관 후 화성 입고 예정',
      status: 'WAITING',
    },
    {
      poNo: 'PO-20260829-003',
      poDate: '2026-08-29',
      deliveryDate: '2026-09-02',
      supplierCode: '1508700096',
      supplierName: '(주)에스에이치테크',
      warehouseName: '함안자재창고',
      itemCode: '000252090',
      itemName: 'TWIN ELBOW (배관 엘보)',
      itemSpec: '5″X90˚ KCP',
      unit: 'EA',
      poQty: 200,
      receivedQty: 200,
      remainQty: 0,
      unitPrice: 75000,
      totalAmount: 15000000,
      remarks: '콘크리트 펌프 이송 배관',
      status: 'COMPLETED',
    },
    {
      poNo: 'PO-20260828-007',
      poDate: '2026-08-28',
      deliveryDate: '2026-09-04',
      supplierCode: '1358168945',
      supplierName: '대창기계산업(주)',
      warehouseName: '화성자재창고',
      itemCode: '000512700',
      itemName: 'AGITATOR SHAFT (교반기 축)',
      itemSpec: 'KCP-Ø65*130L(OPEN)',
      unit: 'EA',
      poQty: 40,
      receivedQty: 20,
      remainQty: 20,
      unitPrice: 35000,
      totalAmount: 1400000,
      remarks: '호퍼 내부 교반 모듈',
      status: 'PARTIAL',
    },
    {
      poNo: 'PO-20260827-010',
      poDate: '2026-08-27',
      deliveryDate: '2026-09-06',
      supplierCode: '6088607397',
      supplierName: '(주)동방이엔지',
      warehouseName: '함안자재창고',
      itemCode: '000502101',
      itemName: 'SCREEN FOR HOPPER(스크린)',
      itemSpec: 'SMALL(M30)',
      unit: 'EA',
      poQty: 15,
      receivedQty: 0,
      remainQty: 15,
      unitPrice: 120000,
      totalAmount: 1800000,
      remarks: '호퍼 거름망 제작 건',
      status: 'WAITING',
    },
    {
      poNo: 'PO-20260825-004',
      poDate: '2026-08-25',
      deliveryDate: '2026-09-01',
      supplierCode: '1210943105',
      supplierName: '제이에스비(JSB)',
      warehouseName: '특장자재창고',
      itemCode: '900270045',
      itemName: 'DU-BUSH 270*45',
      itemSpec: '270*45 대형 특수 부싱',
      unit: 'EA',
      poQty: 50,
      receivedQty: 50,
      remainQty: 0,
      unitPrice: 12000,
      totalAmount: 600000,
      remarks: '정상 입고 완료',
      status: 'COMPLETED',
    },
    {
      poNo: 'PO-20260824-008',
      poDate: '2026-08-24',
      deliveryDate: '2026-09-03',
      supplierCode: '6211086293',
      supplierName: '미래테크',
      warehouseName: '함안자재창고',
      itemCode: 'W123-SEAL',
      itemName: 'SEAL KIT FOR ROD COVER',
      itemSpec: 'M40Z5-1ST 고압 씰',
      unit: 'SET',
      poQty: 30,
      receivedQty: 0,
      remainQty: 30,
      unitPrice: 45000,
      totalAmount: 1350000,
      remarks: '실린더 수리용 씰 키트',
      status: 'WAITING',
    },
  ];

  let filtered = baseOrders;

  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    filtered = filtered.filter(
      (o) =>
        o.poNo.toLowerCase().includes(q) ||
        o.supplierName.toLowerCase().includes(q) ||
        o.itemCode.toLowerCase().includes(q) ||
        o.itemName.toLowerCase().includes(q) ||
        o.warehouseName.toLowerCase().includes(q)
    );
  }

  if (status && status !== 'ALL') {
    filtered = filtered.filter((o) => o.status === status);
  }

  const paged = filtered.slice(offset, offset + limit);
  return { rows: paged, total: filtered.length };
}

/**
 * 사내 ERP 실시간 입고 완료 이력 (MT_T_입출고) 풍부한 더미 데이터 생성
 */
export function getDummyInboundHistory(): InboundSlip[] {
  return [
    {
      slipNo: 'IN-20260902-001',
      supplierCode: '6060440531',
      supplierName: '신우정공',
      poNumber: 'PO-20260901-001',
      deliveryDate: '2026-09-02',
      inboundDate: '2026-09-02T09:35:00.000Z',
      status: 'COMPLETED',
      totalItems: 1,
      totalOrderedQty: 25,
      totalReceivedQty: 25,
      totalDefectQty: 0,
      manager: '김자재 주임',
      memo: '모바일 실시간 QR 스캔 검수 완료 (정상 입고)',
      items: [
        {
          id: 'hist-item-01',
          itemCode: '000573000',
          itemName: 'S-VALVE (유압 밸브)',
          spec: '200*180(COMMON USE)',
          unit: 'EA',
          orderQty: 25,
          receivedQty: 25,
          defectQty: 0,
          warehouse: '특장자재창고',
          unitPrice: 85000,
          status: 'COMPLETED',
          barcode: '000573000-25',
          notes: '외관 및 치수 합격',
        },
      ],
      createdAt: '2026-09-02T09:35:00.000Z',
      updatedAt: '2026-09-02T09:35:00.000Z',
    },
    {
      slipNo: 'IN-20260902-002',
      supplierCode: 'SUP-DAEWON',
      supplierName: '(주)대원하이텍',
      poNumber: 'PO-20260831-005',
      deliveryDate: '2026-09-02',
      inboundDate: '2026-09-02T10:12:00.000Z',
      status: 'COMPLETED',
      totalItems: 1,
      totalOrderedQty: 60,
      totalReceivedQty: 60,
      totalDefectQty: 0,
      manager: '이검수 대리',
      memo: 'PDA 바코드 검수 완료',
      items: [
        {
          id: 'hist-item-02',
          itemCode: 'W123',
          itemName: '베어링 후렌지 아세이',
          spec: 'Ø60 유팩킹타입',
          unit: 'EA',
          orderQty: 60,
          receivedQty: 60,
          defectQty: 0,
          warehouse: '함안자재창고',
          unitPrice: 32000,
          status: 'COMPLETED',
          barcode: 'W123-60',
          notes: '유격 검사 양호',
        },
      ],
      createdAt: '2026-09-02T10:12:00.000Z',
      updatedAt: '2026-09-02T10:12:00.000Z',
    },
    {
      slipNo: 'IN-20260901-003',
      supplierCode: '1508700096',
      supplierName: '(주)에스에이치테크',
      poNumber: 'PO-20260829-003',
      deliveryDate: '2026-09-01',
      inboundDate: '2026-09-01T14:20:00.000Z',
      status: 'COMPLETED',
      totalItems: 1,
      totalOrderedQty: 200,
      totalReceivedQty: 200,
      totalDefectQty: 0,
      manager: '김자재 주임',
      memo: '정기 벌크 배관 입고',
      items: [
        {
          id: 'hist-item-03',
          itemCode: '000252090',
          itemName: 'TWIN ELBOW (배관 엘보)',
          spec: '5″X90˚ KCP',
          unit: 'EA',
          orderQty: 200,
          receivedQty: 200,
          defectQty: 0,
          warehouse: '함안자재창고',
          unitPrice: 75000,
          status: 'COMPLETED',
          barcode: '000252090-200',
          notes: '도장 상태 양호',
        },
      ],
      createdAt: '2026-09-01T14:20:00.000Z',
      updatedAt: '2026-09-01T14:20:00.000Z',
    },
    {
      slipNo: 'IN-20260901-004',
      supplierCode: '1210943105',
      supplierName: '제이에스비(JSB)',
      poNumber: 'PO-20260825-004',
      deliveryDate: '2026-09-01',
      inboundDate: '2026-09-01T16:45:00.000Z',
      status: 'COMPLETED',
      totalItems: 1,
      totalOrderedQty: 50,
      totalReceivedQty: 48,
      totalDefectQty: 2,
      manager: '박반장 직장',
      memo: '일부 외관 스크래치 불량 (2EA 반품 처리)',
      items: [
        {
          id: 'hist-item-04',
          itemCode: '900270045',
          itemName: 'DU-BUSH 270*45',
          spec: '270*45 대형 특수 부싱',
          unit: 'EA',
          orderQty: 50,
          receivedQty: 48,
          defectQty: 2,
          warehouse: '특장자재창고',
          unitPrice: 12000,
          status: 'COMPLETED',
          barcode: '900270045-48',
          notes: '스크래치 2건 불량 보고 완료',
        },
      ],
      createdAt: '2026-09-01T16:45:00.000Z',
      updatedAt: '2026-09-01T16:45:00.000Z',
    },
    {
      slipNo: 'IN-20260831-007',
      supplierCode: 'SUP-KS01',
      supplierName: '(주)한국정밀센서',
      poNumber: 'PO-20260820-001',
      deliveryDate: '2026-08-31',
      inboundDate: '2026-08-31T11:00:00.000Z',
      status: 'COMPLETED',
      totalItems: 2,
      totalOrderedQty: 200,
      totalReceivedQty: 200,
      totalDefectQty: 0,
      manager: '관리자',
      memo: '전자 센서류 정기 검수 완료',
      items: [
        {
          id: 'hist-item-05',
          itemCode: 'ELEC-SENS-501',
          itemName: '적외선 광학 거리 센서 모듈',
          spec: 'VL53L1X ToF 4m Range',
          unit: 'EA',
          orderQty: 100,
          receivedQty: 100,
          defectQty: 0,
          warehouse: '특장자재창고',
          unitPrice: 18500,
          status: 'COMPLETED',
          barcode: 'ELEC-SENS-501-100',
          notes: '전압 테스트 통과',
        },
        {
          id: 'hist-item-06',
          itemCode: 'MECH-BEAR-202',
          itemName: '고속 플랜지 볼베어링',
          spec: 'F695-2RS 5x13x4mm',
          unit: 'SET',
          orderQty: 100,
          receivedQty: 100,
          defectQty: 0,
          warehouse: '화성자재창고',
          unitPrice: 6200,
          status: 'COMPLETED',
          barcode: 'MECH-BEAR-202-100',
          notes: '회전 정밀도 합격',
        },
      ],
      createdAt: '2026-08-31T11:00:00.000Z',
      updatedAt: '2026-08-31T11:00:00.000Z',
    },
  ];
}
