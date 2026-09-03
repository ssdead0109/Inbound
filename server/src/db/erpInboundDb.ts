import { mssqlAdapter } from './mssqlAdapter';
import { InboundSlip, InboundItem, InboundReceivePayload } from '../types/inbound';
import { getItemByCode, updateItem, createItem, createLog } from '../db';
import { upsertInboundSlips, getAllInboundSlips, getInboundSlipByNo, cancelInboundReceiving } from './inboundDb';
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
 * 사내 ERP MSSQL '미입고현황' 및 'MMB100+MMB150'에서 미입고 전표 목록 조회 (2단계 폴백 & 오프라인 캐시 보존)
 */
export async function getErpPendingSlips(query?: string, limit: number = 50): Promise<InboundSlip[]> {
  const isConnected = await mssqlAdapter.connect();
  if (!isConnected) {
    // 오프라인 폴백: 로컬 디스크 캐시에서 대기 전표 반환
    const cached = getAllInboundSlips({ query });
    return cached.filter((s) => s.status === 'WAITING' || s.status === 'INSPECTING' || s.status === 'HOLD');
  }

  const likeQ = query ? `%${query.trim()}%` : '%';
  let slips: InboundSlip[] = [];

  // 1단계: '미입고현황' 테이블 조회
  try {
    const sql1 = `
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
      WHERE (@query = '' OR slip_no LIKE @likeQ OR 거래처명 LIKE @likeQ OR 품목명 LIKE @likeQ OR 품목코드 LIKE @likeQ OR 창고명 LIKE @likeQ)
      ORDER BY slip_no DESC, po_seq ASC
    `;

    const rows = await mssqlAdapter.query<ErpPendingRow>(sql1, {
      query: query || '',
      likeQ,
    });

    if (rows && rows.length > 0) {
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
          receivedQty: janQty,
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

      slips = Array.from(slipMap.values()).slice(0, limit);
    }
  } catch (e) {
    console.warn('[ERP Pending] 미입고현황 테이블 조회 실패, MMB100/150 발주 원장으로 자동 대체:', e);
  }

  // 2단계 폴백: 영림원 공식 발주 테이블 MMB100 + MMB150 (미입고 잔량 > 0)
  if (slips.length === 0) {
    try {
      const sql2 = `
        SELECT TOP (${limit * 5})
          RTRIM(H.po_no) AS poNo,
          CONVERT(VARCHAR(10), H.po_dt, 120) AS poDate,
          CONVERT(VARCHAR(10), ISNULL(D.dlv_dt, H.dlv_dt), 120) AS deliveryDate,
          RTRIM(H.cust_cd) AS supplierCode,
          RTRIM(ISNULL(V.cust_nm, H.cust_cd)) AS supplierName,
          RTRIM(ISNULL(W.wh_nm, '특장자재창고')) AS warehouseName,
          RTRIM(ISNULL(M.itm_cd, '')) AS itemCode,
          RTRIM(ISNULL(M.itm_nm, ISNULL(D.itm_dsc, ''))) AS itemName,
          RTRIM(ISNULL(M.spec, ISNULL(D.spec_dsc, ''))) AS itemSpec,
          RTRIM(ISNULL(M.um_bc, 'EA')) AS unit,
          ISNULL(D.po_qty, 0) AS poQty,
          ISNULL(D.in_qty, 0) AS inQty,
          (ISNULL(D.po_qty, 0) - ISNULL(D.in_qty, 0)) AS remainQty,
          ISNULL(D.po_up, 0) AS unitPrice,
          RTRIM(ISNULL(D.rmks, ISNULL(H.rmks, ''))) AS remarks,
          ISNULL(D.po_seq, 1) AS poSeq
        FROM MMB100 H
        INNER JOIN MMB150 D ON D.po_no = H.po_no
        LEFT JOIN DMA100 M ON M.itm_id = D.itm_id
        LEFT JOIN BCV100 V ON V.cust_cd = H.cust_cd
        LEFT JOIN BCW100 W ON W.wh_cd = ISNULL(D.in_wh, H.in_wh)
        WHERE (ISNULL(D.po_qty, 0) - ISNULL(D.in_qty, 0)) > 0
          AND (@query = '' OR H.po_no LIKE @likeQ OR V.cust_nm LIKE @likeQ OR M.itm_cd LIKE @likeQ OR M.itm_nm LIKE @likeQ)
        ORDER BY H.po_no DESC, D.po_seq ASC
      `;

      const poRows = await mssqlAdapter.query<any>(sql2, { query: query || '', likeQ });
      if (poRows && poRows.length > 0) {
        const poMap = new Map<string, InboundSlip>();

        for (const row of poRows) {
          const poNo = row.poNo;
          if (!poNo) continue;

          if (!poMap.has(poNo)) {
            poMap.set(poNo, {
              slipNo: poNo,
              supplierCode: row.supplierCode || 'SUP-ERP',
              supplierName: row.supplierName || 'ERP 등록 거래처',
              poNumber: poNo,
              deliveryDate: row.deliveryDate || new Date().toISOString().substring(0, 10),
              status: row.inQty > 0 ? 'INSPECTING' : 'WAITING',
              totalItems: 0,
              totalOrderedQty: 0,
              totalReceivedQty: row.inQty || 0,
              totalDefectQty: 0,
              manager: '자재담당',
              memo: row.remarks || '',
              items: [],
              createdAt: row.poDate || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }

          const slip = poMap.get(poNo)!;
          const poQty = Number(row.poQty) || 1;
          const remainQty = Number(row.remainQty) || poQty;

          slip.items.push({
            id: `erp-po-item-${poNo}-${row.poSeq}`,
            itemCode: row.itemCode || `MAT-${row.poSeq}`,
            itemName: row.itemName || '미상 품목',
            spec: row.itemSpec || '',
            unit: row.unit || 'EA',
            orderQty: poQty,
            receivedQty: remainQty,
            defectQty: 0,
            warehouse: row.warehouseName || '특장자재창고',
            unitPrice: Number(row.unitPrice) || 0,
            status: 'WAITING',
            barcode: `${row.itemCode || poNo}-${remainQty}`,
            notes: row.remarks || '',
          });

          slip.totalItems++;
          slip.totalOrderedQty += poQty;
        }

        slips = Array.from(poMap.values()).slice(0, limit);
      }
    } catch (e2) {
      console.warn('[ERP Pending] MMB100/150 발주 테이블 조회 실패:', e2);
    }
  }

  // 3단계: 조회된 전표가 있으면 로컬 디스크 캐시에 영구 보존
  if (slips.length > 0) {
    upsertInboundSlips(slips);
    return slips;
  }

  // 4단계: DB에 전표가 없으면 로컬 캐시에서 반환
  // DB가 연결된 상태면 더미데이터는 일체 반환하지 않고 실제 로컬 전표만 반환
  const isRealDb = mssqlAdapter.getStatus().isConnected && !mssqlAdapter.isDummyMode;
  const diskCached = getAllInboundSlips({ query, excludeDummy: isRealDb });
  return diskCached.filter((s) => s.status === 'WAITING' || s.status === 'INSPECTING' || s.status === 'HOLD');
}

/**
 * 전표번호로 사내 ERP 단건 미입고 전표 조회 (QR 스캔 시 실시간 매칭)
 */
export async function getErpSlipByNo(slipNo: string): Promise<InboundSlip | null> {
  const cleanNo = (slipNo || '').trim();
  if (!cleanNo) return null;

  const isConnected = await mssqlAdapter.connect();
  if (!isConnected) {
    return getInboundSlipByNo(cleanNo) || null;
  }

  // 1. 미입고현황에서 단건 조회
  try {
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
    if (rows && rows.length > 0) {
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
          barcode: `${row.품목코드 || first.slip_no}-${janQty}`,
          notes: row.비고1 || '',
        });

        slip.totalOrderedQty += poQty;
      }

      return slip;
    }
  } catch (e) {
    console.warn('[ERP SlipByNo] 미입고현황 단건 조회 실패:', e);
  }

  // 2. MMB100 + MMB150에서 단건 조회
  try {
    const poSql = `
      SELECT
        RTRIM(H.po_no) AS poNo,
        CONVERT(VARCHAR(10), H.po_dt, 120) AS poDate,
        CONVERT(VARCHAR(10), ISNULL(D.dlv_dt, H.dlv_dt), 120) AS deliveryDate,
        RTRIM(H.cust_cd) AS supplierCode,
        RTRIM(ISNULL(V.cust_nm, H.cust_cd)) AS supplierName,
        RTRIM(ISNULL(W.wh_nm, '특장자재창고')) AS warehouseName,
        RTRIM(ISNULL(M.itm_cd, '')) AS itemCode,
        RTRIM(ISNULL(M.itm_nm, ISNULL(D.itm_dsc, ''))) AS itemName,
        RTRIM(ISNULL(M.spec, ISNULL(D.spec_dsc, ''))) AS itemSpec,
        RTRIM(ISNULL(M.um_bc, 'EA')) AS unit,
        ISNULL(D.po_qty, 0) AS poQty,
        ISNULL(D.in_qty, 0) AS inQty,
        (ISNULL(D.po_qty, 0) - ISNULL(D.in_qty, 0)) AS remainQty,
        ISNULL(D.po_up, 0) AS unitPrice,
        RTRIM(ISNULL(D.rmks, ISNULL(H.rmks, ''))) AS remarks,
        ISNULL(D.po_seq, 1) AS poSeq
      FROM MMB100 H
      INNER JOIN MMB150 D ON D.po_no = H.po_no
      LEFT JOIN DMA100 M ON M.itm_id = D.itm_id
      LEFT JOIN BCV100 V ON V.cust_cd = H.cust_cd
      LEFT JOIN BCW100 W ON W.wh_cd = ISNULL(D.in_wh, H.in_wh)
      WHERE H.po_no = @cleanNo
      ORDER BY D.po_seq ASC
    `;

    const poRows = await mssqlAdapter.query<any>(poSql, { cleanNo });
    if (poRows && poRows.length > 0) {
      const first = poRows[0];
      const slip: InboundSlip = {
        slipNo: first.poNo,
        supplierCode: first.supplierCode || 'SUP-ERP',
        supplierName: first.supplierName || 'ERP 등록 거래처',
        poNumber: first.poNo,
        deliveryDate: first.deliveryDate || new Date().toISOString().substring(0, 10),
        status: first.inQty > 0 ? 'INSPECTING' : 'WAITING',
        totalItems: poRows.length,
        totalOrderedQty: 0,
        totalReceivedQty: 0,
        totalDefectQty: 0,
        manager: '자재담당',
        memo: first.remarks || '',
        items: [],
        createdAt: first.poDate || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      for (const row of poRows) {
        const poQty = Number(row.poQty) || 1;
        const remainQty = Number(row.remainQty) || poQty;

        slip.items.push({
          id: `erp-po-item-${first.poNo}-${row.poSeq}`,
          itemCode: row.itemCode || `MAT-${row.poSeq}`,
          itemName: row.itemName || '미상 품목',
          spec: row.itemSpec || '',
          unit: row.unit || 'EA',
          orderQty: poQty,
          receivedQty: remainQty,
          defectQty: 0,
          warehouse: row.warehouseName || '특장자재창고',
          unitPrice: Number(row.unitPrice) || 0,
          status: 'WAITING',
          barcode: `${row.itemCode || first.poNo}-${remainQty}`,
          notes: row.remarks || '',
        });

        slip.totalOrderedQty += poQty;
      }

      return slip;
    }
  } catch (e2) {
    console.warn('[ERP SlipByNo] MMB100/150 단건 조회 실패:', e2);
  }

  // 3. 로컬 디스크 캐시 확인
  return getInboundSlipByNo(cleanNo) || null;
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

/**
 * 사내 ERP 입고 확정 취소:
 * 1) MSSQL 'MT_T_입출고' 테이블에서 해당 전표번호 레코드 DELETE
 * 2) 스마트랙 로컬 재고 및 전표 상태 원복
 */
export async function cancelErpInboundReceive(slipNo: string): Promise<{
  success: boolean;
  message: string;
}> {
  const cleanSlipNo = (slipNo || '').trim();
  if (!cleanSlipNo) {
    return { success: false, message: '전표번호가 유효하지 않습니다.' };
  }

  // 1. Local inbound cancel first (reverts local stock & resets slip in cache)
  cancelInboundReceiving(cleanSlipNo);

  // 2. If MSSQL connected, delete records from MT_T_입출고
  const isConnected = await mssqlAdapter.connect();
  if (isConnected) {
    try {
      const deleteSql = `
        DELETE FROM MT_T_입출고
        WHERE 전표번호 = @cleanSlipNo AND 구분 = '입고';
      `;
      await mssqlAdapter.query(deleteSql, { cleanSlipNo });
    } catch (err) {
      console.warn('[ERP Cancel] MT_T_입출고 레코드 삭제 실패 (로컬 취소는 완료됨):', err);
    }
  }

  return {
    success: true,
    message: `전표 [${cleanSlipNo}]의 입고 처리가 정상적으로 취소되었습니다.`,
  };
}

export interface ErpPrintResult {
  success: boolean;
  slip: InboundSlip;
  rawRows: any[];
  executedQuery: string;
  source: 'MMB202_PRINT' | 'FALLBACK_PENDING' | 'LOCAL';
  message: string;
}

/**
 * 사내 ERP 입하증 출력 전용 Stored Procedure (MMB202_Print) 호출 및 정규화
 * SQL 실행: EXEC MMB202_Print N'260803012', 101, N'34661'
 */
export async function getErpInboundPrintData(
  slipNo: string,
  companyCode: number = 101,
  subCode: string = '34661'
): Promise<ErpPrintResult> {
  const cleanSlipNo = slipNo.trim();
  const cleanSubCode = (subCode || '34661').trim();
  const execSql = `EXEC MMB202_Print @cleanSlipNo, @companyCode, @cleanSubCode`;
  const executedQueryStr = `EXEC MMB202_Print N'${cleanSlipNo}', ${companyCode}, N'${cleanSubCode}'`;

  try {
    const isConnected = await mssqlAdapter.connect();
    if (isConnected) {
      const rows = await mssqlAdapter.query<any>(execSql, {
        cleanSlipNo,
        companyCode,
        cleanSubCode,
      });

      if (rows && rows.length > 0) {
        const first = rows[0];
        const supplierName =
          first.거래처명 || first.cust_nm || first.CUST_NM || first.공급처명 || first.상호 || '사내 ERP 거래처';
        const supplierCode = first.거래처코드 || first.cust_cd || first.CUST_CD || cleanSubCode;
        const deliveryDate =
          first.납기일자 || first.일자 || first.입하일자 || first.io_dt || first.IO_DT || new Date().toISOString().slice(0, 10);
        const poNumber = first.발주번호 || first.po_no || first.PO_NO || cleanSlipNo;
        const manager = first.담당자명 || first.emp_nm || first.EMP_NM || '자재과';

        const items: InboundItem[] = rows.map((r, idx) => {
          const itemCode = r.품목코드 || r.item_cd || r.ITEM_CD || `MAT-${idx + 1}`;
          const itemName = r.품목명 || r.item_nm || r.ITEM_NM || '품목';
          const spec = r.규격 || r.규격명 || r.spec || r.SPEC || '';
          const unit = r.최소단위 || r.단위 || r.unit || r.UNIT || 'EA';
          const orderQty = Number(r.발주수량 || r.PO_QTY || r.po_qty || r.수량 || r.qty || r.QTY || 1);
          const receivedQty = Number(r.입고수량 || r.입하수량 || r.in_qty || r.IN_QTY || r.수량 || r.qty || orderQty);
          const unitPrice = Number(r.단가 || r.danga || r.DANGA || r.price || r.PRICE || 0);
          const warehouse = r.창고명 || r.wh_nm || r.WH_NM || '특장자재창고';

          return {
            id: `erp-print-item-${cleanSlipNo}-${idx + 1}`,
            itemCode: String(itemCode).trim(),
            itemName: String(itemName).trim(),
            spec: String(spec).trim(),
            unit: String(unit).trim(),
            orderQty,
            receivedQty,
            defectQty: 0,
            warehouse: String(warehouse).trim(),
            unitPrice,
            status: 'WAITING' as const,
            barcode: r.바코드 || r.barcode || `${String(itemCode).trim()}-${receivedQty}`,
            notes: r.비고 || r.rmks || r.RMKS || '',
          };
        });

        const totalOrderedQty = items.reduce((sum, it) => sum + it.orderQty, 0);
        const totalReceivedQty = items.reduce((sum, it) => sum + it.receivedQty, 0);

        const slip: InboundSlip = {
          slipNo: cleanSlipNo,
          supplierCode: String(supplierCode).trim(),
          supplierName: String(supplierName).trim(),
          poNumber: String(poNumber).trim(),
          deliveryDate: String(deliveryDate).includes('/')
            ? `20${String(deliveryDate).replace(/\//g, '-')}`
            : String(deliveryDate),
          status: 'COMPLETED',
          totalItems: items.length,
          totalOrderedQty,
          totalReceivedQty,
          totalDefectQty: 0,
          manager: String(manager).trim(),
          memo: `ERP MMB202_Print 연동 입하증 (회사: ${companyCode}, 거래처: ${cleanSubCode})`,
          items,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        return {
          success: true,
          slip,
          rawRows: rows,
          executedQuery: executedQueryStr,
          source: 'MMB202_PRINT',
          message: `ERP MMB202_Print 프로시저로부터 ${rows.length}건의 입하증 품목 데이터를 성공적으로 조회했습니다.`,
        };
      }
    }
  } catch (spErr: any) {
    console.warn(`[MMB202_Print SP execution warning: ${spErr.message}], falling back to pending table or local slip.`);
  }

  // Fallback: search 미입고현황 or constructed slip
  const fallbackSlip = await getErpSlipByNo(cleanSlipNo);
  if (fallbackSlip) {
    return {
      success: true,
      slip: fallbackSlip,
      rawRows: [],
      executedQuery: executedQueryStr,
      source: 'FALLBACK_PENDING',
      message: 'MMB202_Print 프로시저 연결 또는 실행이 지연되어 사내 미입고현황 데이터로 대체 조회되었습니다.',
    };
  }

  throw new Error(`전표 [${cleanSlipNo}]에 대한 입하증 데이터를 사내 ERP(MMB202_Print)에서 찾을 수 없습니다.`);
}

/**
 * 사내 ERP MSSQL 'MT_T_입출고' 테이블에서 실제 입고 완료 내역 조회
 */
export async function getErpInboundHistory(limit: number = 100): Promise<InboundSlip[]> {
  const isConnected = await mssqlAdapter.connect();
  if (!isConnected) {
    throw new Error('ERP MSSQL 서버에 연결할 수 없습니다.');
  }

  const sql = `
    SELECT TOP (${limit * 5})
      RTRIM(ISNULL(T.전표번호, '')) AS slipNo,
      ISNULL(T.일련번호, 1) AS seq,
      RTRIM(ISNULL(T.구분, '')) AS type,
      RTRIM(ISNULL(T.세부구분, '')) AS subType,
      ISNULL(T.날짜, '') AS date,
      RTRIM(ISNULL(T.품목코드, '')) AS itemCode,
      RTRIM(ISNULL(T.품목명, '')) AS itemName,
      RTRIM(ISNULL(T.규격, '')) AS spec,
      RTRIM(ISNULL(T.최소단위, 'EA')) AS unit,
      ISNULL(T.입고수량, 0) AS inQty,
      ISNULL(T.출고수량, 0) AS outQty,
      ISNULL(T.수량, 0) AS totalQty,
      ISNULL(T.단가, 0) AS unitPrice,
      ISNULL(T.합계, 0) AS totalAmount,
      RTRIM(ISNULL(T.거래처코드, '')) AS supplierCode,
      RTRIM(ISNULL(C.거래처명, '')) AS supplierName,
      RTRIM(ISNULL(T.창고코드, '001')) AS warehouseCode,
      RTRIM(ISNULL(T.비고, '')) AS memo,
      RTRIM(ISNULL(T.담당자코드, '')) AS managerCode
    FROM MT_T_입출고 T
    LEFT JOIN MT_TC_거래처코드 C ON T.거래처코드 = C.거래처코드
    WHERE T.구분 = '입고' OR T.입고수량 > 0
    ORDER BY T.날짜 DESC, T.일련번호 DESC
  `;

  const rows = await mssqlAdapter.query<any>(sql);

  const slipMap = new Map<string, InboundSlip>();

  for (const row of rows) {
    const slipNo = row.slipNo || `IN-${row.date}-${row.seq}`;
    const qty = Number(row.inQty || row.totalQty || 0);
    const unitPrice = Number(row.unitPrice || 0);

    const item: InboundItem = {
      id: `erp-hist-${slipNo}-${row.seq}`,
      itemCode: row.itemCode,
      itemName: row.itemName,
      spec: row.spec || '',
      unit: row.unit || 'EA',
      orderQty: qty,
      receivedQty: qty,
      defectQty: 0,
      warehouse: row.warehouseCode || '화성공장',
      unitPrice,
      status: 'COMPLETED',
      barcode: `${row.itemCode}-${qty}`,
      notes: row.memo || '',
    };

    if (!slipMap.has(slipNo)) {
      slipMap.set(slipNo, {
        slipNo,
        supplierCode: row.supplierCode,
        supplierName: row.supplierName || '사내입고',
        poNumber: slipNo,
        deliveryDate: row.date,
        status: 'COMPLETED',
        totalItems: 1,
        totalOrderedQty: qty,
        totalReceivedQty: qty,
        totalDefectQty: 0,
        manager: row.managerCode || '자재담당',
        memo: row.memo || '사내 ERP(MT_T_입출고) 실시간 입고 내역',
        items: [item],
        createdAt: row.date ? new Date(row.date).toISOString() : new Date().toISOString(),
        updatedAt: row.date ? new Date(row.date).toISOString() : new Date().toISOString(),
        inboundDate: row.date ? new Date(row.date).toISOString() : new Date().toISOString(),
      });
    } else {
      const existing = slipMap.get(slipNo)!;
      existing.items.push(item);
      existing.totalItems = existing.items.length;
      existing.totalOrderedQty += qty;
      existing.totalReceivedQty += qty;
    }

    if (slipMap.size >= limit) {
      break;
    }
  }

  const results = Array.from(slipMap.values());
  if (results.length > 0) {
    return results;
  }

  // 실제 로컬 및 사내 처리 완료 전표만 반환
  const localCompleted = getAllInboundSlips({ status: 'COMPLETED' });
  return localCompleted.slice(0, limit);
}
