import fs from 'fs';
import path from 'path';

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
