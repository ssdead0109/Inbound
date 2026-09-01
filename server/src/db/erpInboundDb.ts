import { mssqlAdapter } from './mssqlAdapter';
import { InboundSlip, InboundItem, InboundReceivePayload } from '../types/inbound';
import { getItemByCode, updateItem, createItem, createLog } from '../db';
import { StockLog } from '../types';

export interface ErpPendingRow {
  일자1: string;
  일자2: string;
  F3: string;
  slip_no: string;
  po_seq: number;
  거래처코드: string;
  거래처명: string;
  품목코드: string;
  품목명: string;
  규격명: string;
  발주수량: string;
  PO_QTY: string;
  JAN_QTY: number;
  단가: number;
  금액: number;
  부가세: number;
  합계: number;
  공장코드: string;
  창고코드: string;
  창고명: string;
  납기일자: string;
  D_ID: number;
  담당자명: string;
  적요: string;
  참조: string;
  비고1: string;
  비고2: string;
  비고3: string;
}

/**
 * 사내 ERP MSSQL '미입고현황' 테이블에서 미입고 전표 목록 조회 (전표 단위로 그룹화)
 */
export async function getErpPendingSlips(query?: string, limit: number = 50): Promise<InboundSlip[]> {
  const isConnected = await mssqlAdapter.connect();
  if (!isConnected) {
    throw new Error('ERP MSSQL 서버에 연결할 수 없습니다.');
  }

  const likeQ = query ? `%${query.trim()}%` : '%';
  const sql = `
    SELECT TOP (${limit * 5})
      RTRIM(ISNULL(slip_no, '')) AS slip_no,
      ISNULL(po_seq, 1) AS po_seq,
      RTRIM(ISNULL(거래처코드, '')) AS 거래처코드,
      RTRIM(ISNULL(거래처명, '')) AS 거래처명,
      RTRIM(ISNULL(품목코드, '')) AS 품목코드,
      RTRIM(ISNULL(품목명, '')) AS 품목명,
      RTRIM(ISNULL(규격명, '')) AS 규격명,
      ISNULL(PO_QTY, '0') AS PO_QTY,
      ISNULL(JAN_QTY, 0) AS JAN_QTY,
      ISNULL(단가, 0) AS 단가,
      ISNULL(금액, 0) AS 금액,
      RTRIM(ISNULL(창고코드, '001')) AS 창고코드,
      RTRIM(ISNULL(창고명, '화성공장')) AS 창고명,
      RTRIM(ISNULL(납기일자, '')) AS 납기일자,
      RTRIM(ISNULL(담당자명, '')) AS 담당자명,
      RTRIM(ISNULL(적요, '')) AS 적요,
      RTRIM(ISNULL(비고1, '')) AS 비고1,
      RTRIM(ISNULL(비고2, '')) AS 비고2
    FROM 미입고현황
    WHERE (@query = '' OR slip_no LIKE @likeQ OR 거래처명 LIKE @likeQ OR 품목명 LIKE @likeQ OR 품목코드 LIKE @likeQ)
    ORDER BY slip_no DESC, po_seq ASC
  `;

  const rows = await mssqlAdapter.query<ErpPendingRow>(sql, {
    query: query || '',
    likeQ,
  });

  // Group by slip_no
  const slipMap = new Map<string, InboundSlip>();

  for (const row of rows) {
    if (!row.slip_no) continue;
    const slipNo = row.slip_no;

    if (!slipMap.has(slipNo)) {
      slipMap.set(slipNo, {
        slipNo,
        supplierCode: row.거래처코드 || 'SUP-ERP',
        supplierName: row.거래처명 || 'ERP 등록 거래처',
        poNumber: slipNo,
        deliveryDate: row.납기일자 ? `20${row.납기일자.replace(/\//g, '-')}` : new Date().toISOString().substring(0, 10),
        status: 'WAITING',
        totalItems: 0,
        totalOrderedQty: 0,
        totalReceivedQty: 0,
        totalDefectQty: 0,
        manager: row.담당자명 || '자재담당',
        memo: [row.적요, row.비고1, row.비고2].filter(Boolean).join(' | '),
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    const slip = slipMap.get(slipNo)!;
    const poQty = Number(row.PO_QTY) || Number(row.JAN_QTY) || 1;
    const janQty = Number(row.JAN_QTY) || poQty;

    const item: InboundItem = {
      id: `erp-item-${slipNo}-${row.po_seq}`,
      itemCode: row.품목코드 || `MAT-${row.po_seq}`,
      itemName: row.품목명 || '미상 품목',
      spec: row.규격명 || '',
      unit: 'EA',
      orderQty: poQty,
      receivedQty: janQty, // Default expected receiving qty is remaining qty
      defectQty: 0,
      warehouse: row.창고명 || '특장자재창고',
      unitPrice: row.단가 || 0,
      status: 'WAITING',
      barcode: `${row.품목코드 || slipNo}-${janQty}`,
      notes: row.비고1 || '',
    };

    slip.items.push(item);
    slip.totalItems++;
    slip.totalOrderedQty += poQty;
  }

  return Array.from(slipMap.values()).slice(0, limit);
}

/**
 * 전표번호로 사내 ERP 단건 미입고 전표 조회 (QR 스캔 시 실시간 매칭)
 */
export async function getErpSlipByNo(slipNo: string): Promise<InboundSlip | null> {
  const isConnected = await mssqlAdapter.connect();
  if (!isConnected) return null;

  const cleanNo = slipNo.trim();
  const sql = `
    SELECT
      RTRIM(ISNULL(slip_no, '')) AS slip_no,
      ISNULL(po_seq, 1) AS po_seq,
      RTRIM(ISNULL(거래처코드, '')) AS 거래처코드,
      RTRIM(ISNULL(거래처명, '')) AS 거래처명,
      RTRIM(ISNULL(품목코드, '')) AS 품목코드,
      RTRIM(ISNULL(품목명, '')) AS 품목명,
      RTRIM(ISNULL(규격명, '')) AS 규격명,
      ISNULL(PO_QTY, '0') AS PO_QTY,
      ISNULL(JAN_QTY, 0) AS JAN_QTY,
      ISNULL(단가, 0) AS 단가,
      ISNULL(금액, 0) AS 금액,
      RTRIM(ISNULL(창고코드, '001')) AS 창고코드,
      RTRIM(ISNULL(창고명, '화성공장')) AS 창고명,
      RTRIM(ISNULL(납기일자, '')) AS 납기일자,
      RTRIM(ISNULL(담당자명, '')) AS 담당자명,
      RTRIM(ISNULL(적요, '')) AS 적요,
      RTRIM(ISNULL(비고1, '')) AS 비고1,
      RTRIM(ISNULL(비고2, '')) AS 비고2
    FROM 미입고현황
    WHERE slip_no = @cleanNo OR slip_no LIKE '%' + @cleanNo + '%'
    ORDER BY po_seq ASC
  `;

  const rows = await mssqlAdapter.query<ErpPendingRow>(sql, { cleanNo });
  if (rows.length === 0) return null;

  const first = rows[0];
  const slip: InboundSlip = {
    slipNo: first.slip_no,
    supplierCode: first.거래처코드 || 'SUP-ERP',
    supplierName: first.거래처명 || '사내 ERP 거래처',
    poNumber: first.slip_no,
    deliveryDate: first.납기일자 ? `20${first.납기일자.replace(/\//g, '-')}` : new Date().toISOString().substring(0, 10),
    status: 'WAITING',
    totalItems: rows.length,
    totalOrderedQty: 0,
    totalReceivedQty: 0,
    totalDefectQty: 0,
    manager: first.담당자명 || '자재과',
    memo: [first.적요, first.비고1, first.비고2].filter(Boolean).join(' | '),
    items: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  for (const row of rows) {
    const poQty = Number(row.PO_QTY) || Number(row.JAN_QTY) || 1;
    const janQty = Number(row.JAN_QTY) || poQty;

    slip.items.push({
      id: `erp-item-${first.slip_no}-${row.po_seq}`,
      itemCode: row.품목코드,
      itemName: row.품목명,
      spec: row.규격명 || '',
      unit: 'EA',
      orderQty: poQty,
      receivedQty: janQty,
      defectQty: 0,
      warehouse: row.창고명 || '특장자재창고',
      unitPrice: row.단가 || 0,
      status: 'WAITING',
      barcode: `${row.품목코드}-${janQty}`,
      notes: row.비고1 || '',
    });
    slip.totalOrderedQty += poQty;
  }

  return slip;
}

/**
 * 사내 ERP 실시간 입고 처리:
 * 1) MSSQL 'MT_T_입출고' 테이블에 입고(수불) 트랜잭션 레코드 INSERT
 * 2) 스마트랙 로컬 재고 및 로그 동시 가산/기록
 */
export async function processErpInboundReceive(payload: InboundReceivePayload): Promise<{
  success: boolean;
  insertedCount: number;
  slip: InboundSlip;
  logs: StockLog[];
  message: string;
}> {
  const isConnected = await mssqlAdapter.connect();
  if (!isConnected) {
    throw new Error('ERP MSSQL 서버 연결 실패');
  }

  const { slipNo, items: receivedItems, manager, memo, warehouse: targetWh, completeAll } = payload;
  const now = new Date();
  const dateStr = now.toISOString().substring(0, 10);
  const yearMonth = dateStr.substring(0, 7);
  const nowIso = now.toISOString();

  // 1. Fetch ERP slip details
  let slip = await getErpSlipByNo(slipNo);
  if (!slip) {
    // If not found in 미입고현황, construct virtual slip from payload
    slip = {
      slipNo,
      supplierCode: 'SUP-ERP',
      supplierName: 'ERP 납품업체',
      deliveryDate: dateStr,
      status: 'INSPECTING',
      totalItems: receivedItems.length,
      totalOrderedQty: 0,
      totalReceivedQty: 0,
      totalDefectQty: 0,
      manager: manager || '자재담당자',
      items: [],
      createdAt: nowIso,
      updatedAt: nowIso,
    };
  }

  const createdLogs: StockLog[] = [];
  let insertedCount = 0;
  let totalReceivedSum = 0;
  let totalDefectSum = 0;

  for (let idx = 0; idx < receivedItems.length; idx++) {
    const rItem = receivedItems[idx];
    const slipItem = slip.items.find(it => it.itemCode === rItem.itemCode || it.id === rItem.id) || {
      id: rItem.id,
      itemCode: rItem.itemCode,
      itemName: rItem.itemCode,
      spec: '',
      unit: 'EA',
      orderQty: rItem.receivedQty,
      receivedQty: rItem.receivedQty,
      defectQty: rItem.defectQty || 0,
      warehouse: rItem.warehouse || targetWh || '특장자재창고',
      unitPrice: 0,
      status: 'COMPLETED' as const,
    };

    const actualQty = completeAll ? slipItem.orderQty : Math.max(0, rItem.receivedQty ?? slipItem.orderQty);
    const defectQty = rItem.defectQty || 0;
    const warehouse = rItem.warehouse || targetWh || slipItem.warehouse || '특장자재창고';
    const whCode = warehouse.includes('001') || warehouse.includes('특장') ? '001' : '002';
    const unitPrice = slipItem.unitPrice || 0;
    const supplyPrice = actualQty * unitPrice;
    const vat = Math.round(supplyPrice * 0.1);
    const totalPrice = supplyPrice + vat;

    if (actualQty > 0) {
      // 2. INSERT into MSSQL MT_T_입출고
      const insertSql = `
        DECLARE @NextSeq DECIMAL(18, 0);
        SELECT @NextSeq = ISNULL(MAX(일련번호), 0) + 1 FROM MT_T_입출고;

        INSERT INTO MT_T_입출고 (
          일련번호, 순번, 전표번호, 구분, 세부구분, 날짜, 년월, 모델코드, 거래처코드,
          품목코드, 품목명, 규격, 품목비고, 최소단위, 입고수량, 출고수량, 수량_내수,
          수량_수출, 수량, 단가, 공급가, 부가세, 합계, 현금, 외상수금, 계좌, 상계,
          카드, 에누리, 수불여부, 비고, 입출고선택, 어음, 어음번호, 미수금, 미지급금,
          외상, 영업사원코드, 유형코드, 매입매출전표번호, 명세서발행, 계산서발행,
          QC완료, 재고이동여부, 재고반영제외, 수출여부, 수정일, 회사코드, 담당자코드,
          납기일자, 발주키, AS발생원인, 대품여부, 대품처리완료, 입출고키, 관계키,
          QC키, 처리날짜, 처리년월, 처리수량, 대품전표, 매입구분, 창고코드, 입력원가,
          원가금액, 할인제외
        ) VALUES (
          @NextSeq, @seq, @slipNo, '입고', '입고', @dateStr, @yearMonth, '', @supplierCode,
          @itemCode, @itemName, @spec, '', @unit, @actualQty, 0, @actualQty,
          0, @actualQty, @unitPrice, @supplyPrice, @vat, @totalPrice, 0, 0, 0, 0,
          0, 0, 1, @itemMemo, 1, 0, '', 0, 0,
          0, '', '', '', 0, 0,
          1, 0, 0, 0, CONVERT(VARCHAR(19), GETDATE(), 120), '101', @managerCode,
          @dateStr, 0, '', 0, 0, @NextSeq, 0,
          0, '', '', 0, 0, '입고', @whCode, 0,
          0, 0
        );
      `;

      await mssqlAdapter.query(insertSql, {
        seq: idx + 1,
        slipNo: slip.slipNo.substring(0, 20),
        dateStr,
        yearMonth,
        supplierCode: (slip.supplierCode || 'SUP').substring(0, 10),
        itemCode: slipItem.itemCode.substring(0, 30),
        itemName: slipItem.itemName.substring(0, 100),
        spec: (slipItem.spec || '').substring(0, 100),
        unit: (slipItem.unit || 'EA').substring(0, 10),
        actualQty,
        unitPrice,
        supplyPrice,
        vat,
        totalPrice,
        itemMemo: (memo || 'SmartRack 실시간 QR 입고').substring(0, 100),
        managerCode: (manager || 'admin').substring(0, 10),
        whCode: whCode.substring(0, 3),
      });

      insertedCount++;

      // 3. Update Local SmartRack Inventory
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
        invItem = createItem({
          id: `item-erp-inb-${Date.now()}-${idx}`,
          code: slipItem.itemCode,
          name: slipItem.itemName,
          spec: slipItem.spec || '',
          category: 'ERP입고자재',
          warehouse: warehouse || '특장자재창고',
          rackLocation: '미지정',
          quantity: actualQty,
          unit: slipItem.unit || 'EA',
          safetyStock: 10,
          price: unitPrice,
          supplier: slip.supplierName,
          createdAt: nowIso,
          updatedAt: nowIso,
        });
      }

      // 4. Create Local Stock IN Log
      const log: StockLog = {
        id: `log-erp-inb-${Date.now()}-${idx}`,
        itemId: invItem.id,
        itemCode: invItem.code,
        itemName: invItem.name,
        type: 'IN',
        quantity: actualQty,
        previousQty: prevQty,
        newQty: newQty,
        manager: manager || '자재과 담당자',
        reason: `ERP(MSSQL) 입고확정 [전표: ${slip.slipNo}, 거래처: ${slip.supplierName}]${defectQty > 0 ? ` (불량 ${defectQty}${slipItem.unit})` : ''}`,
        timestamp: nowIso,
      };
      createdLogs.push(createLog(log));
    }

    slipItem.receivedQty = actualQty;
    slipItem.defectQty = defectQty;
    slipItem.warehouse = warehouse;
    slipItem.status = defectQty > 0 ? 'DEFECT' : 'COMPLETED';

    totalReceivedSum += actualQty;
    totalDefectSum += defectQty;
  }

  slip.totalReceivedQty = totalReceivedSum;
  slip.totalDefectQty = totalDefectSum;
  slip.manager = manager || '자재과';
  slip.status = 'COMPLETED';
  slip.inboundDate = nowIso;
  slip.updatedAt = nowIso;
  if (memo) slip.memo = memo;
  if (payload.photos) slip.photos = payload.photos;

  return {
    success: true,
    insertedCount,
    slip,
    logs: createdLogs,
    message: `ERP MSSQL MT_T_입출고 테이블에 ${insertedCount}건의 입고 레코드가 성공적으로 등록되었습니다!`,
  };
}
