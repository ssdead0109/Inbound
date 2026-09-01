import fs from 'fs';
import path from 'path';
import { InboundSlip, InboundItem, InboundReceivePayload, InboundStats } from '../types/inbound';
import { getItemByCode, updateItem, createItem, createLog, getAllItems } from '../db';
import { StockLog } from '../types';

const DATA_DIR = path.resolve(process.cwd(), 'server/data');
const INBOUND_FILE = path.join(DATA_DIR, 'inbound_slips.json');

// Realistic Sample Delivery Notes (납품확인서 초기 샘플 - 랙 정보 제거)
export const INITIAL_INBOUND_SLIPS: InboundSlip[] = [
  {
    slipNo: 'DN-20260831-001',
    supplierCode: 'SUP-DH01',
    supplierName: '(주)대한정밀전자',
    poNumber: 'PO-20260825-01',
    deliveryDate: '2026-08-31',
    status: 'WAITING',
    totalItems: 3,
    totalOrderedQty: 350,
    totalReceivedQty: 0,
    totalDefectQty: 0,
    memo: '1차 생산라인 투입용 긴급 납품 건',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    items: [
      {
        id: 'item-dn1-1',
        itemCode: 'ELEC-MCU-001',
        itemName: 'ESP32-S3 마이크로컨트롤러',
        spec: 'SMD-32 3.3V Dual Core',
        unit: 'EA',
        orderQty: 100,
        receivedQty: 100,
        defectQty: 0,
        warehouse: '특장자재창고',
        unitPrice: 4500,
        status: 'WAITING',
        barcode: 'ELEC-MCU-001-100',
        notes: '릴(Reel) 포장 상태 양호',
      },
      {
        id: 'item-dn1-2',
        itemCode: 'ELEC-SEN-002',
        itemName: '온습도 정밀 센서 모듈',
        spec: 'SHT40 I2C Interface',
        unit: 'EA',
        orderQty: 200,
        receivedQty: 200,
        defectQty: 0,
        warehouse: '특장자재창고',
        unitPrice: 2800,
        status: 'WAITING',
        barcode: 'ELEC-SEN-002-200',
      },
      {
        id: 'item-dn1-3',
        itemCode: 'ELEC-PWR-003',
        itemName: 'DC-DC 강압 스텝다운 모듈',
        spec: 'LM2596 3A Output 5V',
        unit: 'EA',
        orderQty: 50,
        receivedQty: 50,
        defectQty: 0,
        warehouse: '특장자재창고',
        unitPrice: 1600,
        status: 'WAITING',
        barcode: 'ELEC-PWR-003-50',
      },
    ],
  },
  {
    slipNo: 'DN-20260831-002',
    supplierCode: 'SUP-HL02',
    supplierName: '(주)한라테크 기계사업부',
    poNumber: 'PO-20260826-04',
    deliveryDate: '2026-08-31',
    status: 'INSPECTING',
    totalItems: 2,
    totalOrderedQty: 120,
    totalReceivedQty: 60,
    totalDefectQty: 2,
    manager: '홍길동 (자재과장)',
    memo: 'CNC 가공 부품 치수 전수 검수 진행 요망',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
    items: [
      {
        id: 'item-dn2-1',
        itemCode: 'MECH-BRK-001',
        itemName: '알루미늄 모터 마운트 브라켓',
        spec: 'AL6061-T6 아노다이징 블랙',
        unit: 'EA',
        orderQty: 60,
        receivedQty: 60,
        defectQty: 0,
        warehouse: '특장자재창고',
        unitPrice: 12500,
        status: 'CHECKED',
        barcode: 'MECH-BRK-001-60',
      },
      {
        id: 'item-dn2-2',
        itemCode: 'MECH-SHAFT-002',
        itemName: '정밀 리니어 가이드 샤프트',
        spec: 'SFU1605-400mm 연마급',
        unit: 'SET',
        orderQty: 60,
        receivedQty: 58,
        defectQty: 2,
        defectReason: '단면 스크래치 및 휨 불량 2건',
        warehouse: '특장자재창고',
        unitPrice: 38000,
        status: 'DEFECT',
        barcode: 'MECH-SHAFT-002-60',
      },
    ],
  },
  {
    slipNo: 'DN-20260831-003',
    supplierCode: 'SUP-SK03',
    supplierName: '삼경와이어 하네스텍',
    poNumber: 'PO-20260828-09',
    deliveryDate: '2026-08-31',
    status: 'WAITING',
    totalItems: 4,
    totalOrderedQty: 800,
    totalReceivedQty: 0,
    totalDefectQty: 0,
    memo: '제어반용 메인 배선 하네스 납품 건',
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    items: [
      {
        id: 'item-dn3-1',
        itemCode: 'WIRE-HAR-001',
        itemName: '메인 컨트롤러 배선 하네스',
        spec: 'UL1007 20AWG 24Pin 800mm',
        unit: 'SET',
        orderQty: 200,
        receivedQty: 200,
        defectQty: 0,
        warehouse: '특장자재창고',
        unitPrice: 6500,
        status: 'WAITING',
      },
      {
        id: 'item-dn3-2',
        itemCode: 'WIRE-CAN-002',
        itemName: 'CAN 통신 트위스트 페어 케이블',
        spec: '2-Wire Shielded 120Ohm 1.5m',
        unit: 'SET',
        orderQty: 300,
        receivedQty: 300,
        defectQty: 0,
        warehouse: '특장자재창고',
        unitPrice: 4200,
        status: 'WAITING',
      },
      {
        id: 'item-dn3-3',
        itemCode: 'WIRE-PWR-003',
        itemName: '배터리 고전류 파워 케이블',
        spec: '8AWG 100A 내열 실리콘',
        unit: 'M',
        orderQty: 200,
        receivedQty: 200,
        defectQty: 0,
        warehouse: '특장자재창고',
        unitPrice: 3100,
        status: 'WAITING',
      },
      {
        id: 'item-dn3-4',
        itemCode: 'WIRE-CON-004',
        itemName: '방수 방진 커넥터 세트',
        spec: 'IP67 Deutsch 6Pin',
        unit: 'SET',
        orderQty: 100,
        receivedQty: 100,
        defectQty: 0,
        warehouse: '특장자재창고',
        unitPrice: 5800,
        status: 'WAITING',
      },
    ],
  },
  {
    slipNo: 'DN-20260830-004',
    supplierCode: 'SUP-DH01',
    supplierName: '(주)대한정밀전자',
    poNumber: 'PO-20260820-02',
    deliveryDate: '2026-08-30',
    status: 'COMPLETED',
    totalItems: 2,
    totalOrderedQty: 500,
    totalReceivedQty: 500,
    totalDefectQty: 0,
    manager: '이영희 (수입검수원)',
    inboundDate: '2026-08-30T16:45:00.000Z',
    memo: '입고 검수 전량 완료',
    createdAt: '2026-08-30T14:10:00.000Z',
    updatedAt: '2026-08-30T16:45:00.000Z',
    items: [
      {
        id: 'item-dn4-1',
        itemCode: 'ELEC-RES-001',
        itemName: '정밀 칩 저항 10K Ohm 1%',
        spec: 'SMD 0805 Reel',
        unit: 'BOX',
        orderQty: 200,
        receivedQty: 200,
        defectQty: 0,
        warehouse: '특장자재창고',
        unitPrice: 1200,
        status: 'COMPLETED',
      },
      {
        id: 'item-dn4-2',
        itemCode: 'ELEC-CAP-002',
        itemName: '적층 세라믹 커패시터 10uF 50V',
        spec: 'SMD 1206 X7R',
        unit: 'BOX',
        orderQty: 300,
        receivedQty: 300,
        defectQty: 0,
        warehouse: '특장자재창고',
        unitPrice: 1800,
        status: 'COMPLETED',
      },
    ],
  },
  {
    slipNo: 'DN-20260829-005',
    supplierCode: 'SUP-PB05',
    supplierName: '평화패킹산업',
    poNumber: 'PO-20260819-01',
    deliveryDate: '2026-08-29',
    status: 'COMPLETED',
    totalItems: 1,
    totalOrderedQty: 1000,
    totalReceivedQty: 1000,
    totalDefectQty: 0,
    manager: '홍길동 (자재과장)',
    inboundDate: '2026-08-29T11:20:00.000Z',
    memo: 'O-Ring 고무 패킹 정합 입고 완료',
    createdAt: '2026-08-29T09:30:00.000Z',
    updatedAt: '2026-08-29T11:20:00.000Z',
    items: [
      {
        id: 'item-dn5-1',
        itemCode: 'PACK-ORING-001',
        itemName: '내유성 NBR O-링 P24',
        spec: 'ID 23.7mm x W 3.5mm 70 Shore',
        unit: 'EA',
        orderQty: 1000,
        receivedQty: 1000,
        defectQty: 0,
        warehouse: '특장자재창고',
        unitPrice: 250,
        status: 'COMPLETED',
      },
    ],
  },
];

let inboundCache: InboundSlip[] = [];

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function initInboundDatabase() {
  ensureDataDir();
  if (fs.existsSync(INBOUND_FILE)) {
    try {
      const raw = fs.readFileSync(INBOUND_FILE, 'utf-8');
      inboundCache = JSON.parse(raw);
      console.log(`[Inbound DB] Loaded ${inboundCache.length} inbound slips from file.`);
    } catch (err) {
      console.error('[Inbound DB] Failed reading file, resetting to sample slips:', err);
      inboundCache = [...INITIAL_INBOUND_SLIPS];
      saveInboundToDisk();
    }
  } else {
    console.log(`[Inbound DB] Initializing with ${INITIAL_INBOUND_SLIPS.length} sample inbound slips...`);
    inboundCache = [...INITIAL_INBOUND_SLIPS];
    saveInboundToDisk();
  }
}

export function saveInboundToDisk(): void {
  ensureDataDir();
  try {
    fs.writeFileSync(INBOUND_FILE, JSON.stringify(inboundCache, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Inbound DB] Failed saving to disk:', err);
  }
}

// Inbound Slip Queries
export function getAllInboundSlips(filter?: {
  status?: string;
  startDate?: string;
  endDate?: string;
  supplier?: string;
  query?: string;
}): InboundSlip[] {
  let list = [...inboundCache];

  if (filter) {
    if (filter.status && filter.status !== 'ALL') {
      list = list.filter((s) => s.status === filter.status);
    }
    if (filter.supplier) {
      const q = filter.supplier.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.supplierName.toLowerCase().includes(q) ||
          s.supplierCode.toLowerCase().includes(q)
      );
    }
    if (filter.startDate) {
      list = list.filter((s) => s.deliveryDate >= filter.startDate!);
    }
    if (filter.endDate) {
      list = list.filter((s) => s.deliveryDate <= filter.endDate!);
    }
    if (filter.query) {
      const q = filter.query.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.slipNo.toLowerCase().includes(q) ||
          (s.poNumber && s.poNumber.toLowerCase().includes(q)) ||
          s.supplierName.toLowerCase().includes(q) ||
          s.items.some(
            (it) =>
              it.itemCode.toLowerCase().includes(q) ||
              it.itemName.toLowerCase().includes(q)
          )
      );
    }
  }

  // Sort by updatedAt descending
  return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function getInboundSlipByNo(slipNo: string): InboundSlip | undefined {
  const clean = slipNo.trim().toUpperCase();
  return inboundCache.find(
    (s) =>
      s.slipNo.toUpperCase() === clean ||
      (s.poNumber && s.poNumber.toUpperCase() === clean)
  );
}

export function createInboundSlip(slip: InboundSlip): InboundSlip {
  // Check if slipNo already exists
  const existingIdx = inboundCache.findIndex((s) => s.slipNo === slip.slipNo);
  if (existingIdx >= 0) {
    inboundCache[existingIdx] = {
      ...inboundCache[existingIdx],
      ...slip,
      updatedAt: new Date().toISOString(),
    };
  } else {
    inboundCache.unshift(slip);
  }
  saveInboundToDisk();
  return slip;
}

export function updateInboundSlipStatus(slipNo: string, status: InboundSlip['status'], memo?: string): InboundSlip | null {
  const slip = getInboundSlipByNo(slipNo);
  if (!slip) return null;

  slip.status = status;
  if (memo) slip.memo = memo;
  slip.updatedAt = new Date().toISOString();
  saveInboundToDisk();
  return slip;
}

// Inbound Receiving Processing Transaction (입고 확정 트랜잭션 - 랙 로직 배제)
export function processInboundReceiving(payload: InboundReceivePayload): {
  success: boolean;
  slip?: InboundSlip;
  updatedStockCount: number;
  logs: StockLog[];
  message?: string;
} {
  const { slipNo, items: receivedItems, manager, memo, completeAll } = payload;
  const slip = getInboundSlipByNo(slipNo);

  if (!slip) {
    return {
      success: false,
      updatedStockCount: 0,
      logs: [],
      message: `납품확인서 [${slipNo}]를 찾을 수 없습니다.`,
    };
  }

  const now = new Date().toISOString();
  const createdLogs: StockLog[] = [];
  let updatedStockCount = 0;
  let totalReceivedSum = 0;
  let totalDefectSum = 0;

  // 1. Process each item in the delivery slip
  for (const receivedItem of receivedItems) {
    const slipItem = slip.items.find((it) => it.id === receivedItem.id || it.itemCode === receivedItem.itemCode);
    if (!slipItem) continue;

    const actualQty = completeAll ? slipItem.orderQty : Math.max(0, receivedItem.receivedQty ?? slipItem.orderQty);
    const defectQty = receivedItem.defectQty ?? 0;
    const defectReason = receivedItem.defectReason || '';
    const warehouse = receivedItem.warehouse || slipItem.warehouse;

    slipItem.receivedQty = actualQty;
    slipItem.defectQty = defectQty;
    slipItem.defectReason = defectReason;
    slipItem.warehouse = warehouse;

    if (defectQty > 0) {
      slipItem.status = 'DEFECT';
    } else if (actualQty >= slipItem.orderQty) {
      slipItem.status = 'COMPLETED';
    } else {
      slipItem.status = 'CHECKED';
    }

    totalReceivedSum += actualQty;
    totalDefectSum += defectQty;

    // 2. Increase Inventory Stock in Main System (실제 자재창고 재고 수량 가산)
    if (actualQty > 0) {
      let invItem = getItemByCode(slipItem.itemCode);
      let prevQty = 0;
      let newQty = actualQty;

      if (invItem) {
        prevQty = invItem.quantity;
        newQty = prevQty + actualQty;

        updateItem(invItem.id, {
          quantity: newQty,
          warehouse: warehouse || invItem.warehouse,
        });
      } else {
        // Auto-register new item into master if not existing
        invItem = createItem({
          id: `item-inb-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          code: slipItem.itemCode,
          name: slipItem.itemName,
          spec: slipItem.spec || '',
          category: '납품자재',
          warehouse: warehouse || '특장자재창고',
          rackLocation: '미지정',
          quantity: actualQty,
          unit: slipItem.unit || 'EA',
          safetyStock: 10,
          price: slipItem.unitPrice || 0,
          supplier: slip.supplierName,
          createdAt: now,
          updatedAt: now,
        });
      }
      updatedStockCount++;

      // 3. Create Stock IN Transaction Log
      const log: StockLog = {
        id: `log-inbound-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        itemId: invItem.id,
        itemCode: invItem.code,
        itemName: invItem.name,
        type: 'IN',
        quantity: actualQty,
        previousQty: prevQty,
        newQty: newQty,
        manager: manager || '자재과 담당자',
        reason: `납품확인서 입고 [전표: ${slip.slipNo}, 거래처: ${slip.supplierName}]${defectQty > 0 ? ` (불량 ${defectQty}${slipItem.unit} 별도)` : ''}`,
        timestamp: now,
      };
      createdLogs.push(createLog(log));
    }
  }

  // 4. Update Slip Overall Status
  slip.totalReceivedQty = totalReceivedSum;
  slip.totalDefectQty = totalDefectSum;
  slip.manager = manager || slip.manager || '자재과';
  slip.inboundDate = now;
  slip.updatedAt = now;
  if (memo) slip.memo = memo;
  if (payload.photos && payload.photos.length > 0) {
    slip.photos = payload.photos;
  }

  if (totalReceivedSum >= slip.totalOrderedQty && totalDefectSum === 0) {
    slip.status = 'COMPLETED';
  } else if (totalReceivedSum > 0 || totalDefectSum > 0) {
    slip.status = 'PARTIAL';
  }

  saveInboundToDisk();

  return {
    success: true,
    slip,
    updatedStockCount,
    logs: createdLogs,
    message: `납품확인서 [${slip.slipNo}] 입고 처리가 완료되었습니다. (재고 ${updatedStockCount}건 반영)`,
  };
}

export const DEFAULT_WAREHOUSES: string[] = [
  '특장자재창고',
  '본관 자재1창고',
  '본관 자재2창고',
  '외주 가공자재창고',
  '원자재 야적장',
];

export function getWarehouses(): string[] {
  return DEFAULT_WAREHOUSES;
}

export function getInboundStats(): InboundStats {
  const todayStr = new Date().toISOString().slice(0, 10);
  const todaySlips = inboundCache.filter((s) => s.deliveryDate === todayStr || (s.inboundDate && s.inboundDate.startsWith(todayStr)));

  const completed = todaySlips.filter((s) => s.status === 'COMPLETED').length;
  const pending = todaySlips.filter((s) => s.status === 'WAITING' || s.status === 'INSPECTING').length;
  const todayTotalReceivedQty = todaySlips.reduce((acc, s) => acc + (s.totalReceivedQty || 0), 0);
  const totalDefectsToday = todaySlips.reduce((acc, s) => acc + (s.totalDefectQty || 0), 0);

  return {
    todayTotalSlips: todaySlips.length,
    todayCompletedSlips: completed,
    todayPendingSlips: pending,
    todayTotalReceivedQty,
    totalDefectsToday,
  };
}
