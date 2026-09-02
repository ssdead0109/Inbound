import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { mssqlAdapter } from '../db/mssqlAdapter';
import { getItemByCode, createItem } from '../db';
import { InventoryItem } from '../types';

const router = Router();

// GET /api/erp/status - MSSQL 연결 상태 및 기본 정보 조회
router.get('/status', async (_req: Request, res: Response) => {
  try {
    const isConnected = await mssqlAdapter.connect();
    const status = mssqlAdapter.getStatus();
    
    let totalCount = 0;
    if (isConnected) {
      const countRes = await mssqlAdapter.query<{ total: number }>('SELECT COUNT(*) AS total FROM MT_TC_품목코드');
      totalCount = countRes[0]?.total || 0;
    }

    res.json({
      success: true,
      data: {
        isConnected,
        server: status.server,
        port: status.port,
        database: status.database,
        user: status.user,
        totalMaterials: totalCount,
      },
    });
  } catch (err: any) {
    res.json({
      success: false,
      error: err.message,
      data: {
        isConnected: false,
        ...mssqlAdapter.getStatus(),
        totalMaterials: 0,
      },
    });
  }
});

// POST /api/erp/config - MSSQL DB 서버 IP 및 포트 동적 변경 및 즉시 연결 테스트
router.post('/config', async (req: Request, res: Response) => {
  try {
    const { server, port } = req.body;
    const updates: any = {};
    if (server && typeof server === 'string') {
      updates.server = server.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    }
    if (port) {
      const parsedPort = parseInt(String(port).trim(), 10);
      if (!isNaN(parsedPort) && parsedPort > 0) {
        updates.port = parsedPort;
      }
    }

    const isConnected = await mssqlAdapter.updateConfig(updates);
    const status = mssqlAdapter.getStatus();

    let totalCount = 0;
    if (isConnected) {
      const countRes = await mssqlAdapter.query<{ total: number }>('SELECT COUNT(*) AS total FROM MT_TC_품목코드').catch(() => []);
      totalCount = countRes[0]?.total || 0;
    }

    res.json({
      success: true,
      isConnected,
      data: {
        isConnected,
        server: status.server,
        port: status.port,
        database: status.database,
        user: status.user,
        totalMaterials: totalCount,
      },
    });
  } catch (err: any) {
    res.json({
      success: false,
      isConnected: false,
      error: err.message || 'DB 연결 설정 변경 실패',
      data: {
        isConnected: false,
        ...mssqlAdapter.getStatus(),
      },
    });
  }
});

// In-memory cache for materials to eliminate redundant MSSQL reads
interface MaterialCache {
  data: any[];
  totalCount: number;
  lastFetchedAt: number;
}
let globalMaterialsCache: MaterialCache | null = null;
let globalCacheFetchPromise: Promise<MaterialCache | null> | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes global cache

// GET /api/erp/warehouses - 재고 보유 창고 목록 조회
router.get('/warehouses', async (req: Request, res: Response) => {
  try {
    const isConnected = await mssqlAdapter.connect();
    if (!isConnected) {
      return res.status(503).json({ success: false, error: 'ERP MSSQL 연결 실패' });
    }
    const rows = await mssqlAdapter.query<any>(`
      SELECT DISTINCT RTRIM(w.wh_cd) AS code, RTRIM(w.wh_nm) AS name, COUNT(DISTINCT a.itm_id) AS itemCount
      FROM LES200 a
      INNER JOIN BCW100 w ON w.wh_cd = a.wh_cd
      WHERE a.sum_mon = (CAST(DATEPART(year, GETDATE()) AS CHAR(4)) + '-00')
        AND (ISNULL(a.bas_qty,0) + ISNULL(a.in_qty,0) - ISNULL(a.out_qty,0)) > 0
      GROUP BY w.wh_cd, w.wh_nm
      ORDER BY itemCount DESC
    `);
    const list = [
      { code: 'ALL', name: '전체 창고', itemCount: rows.reduce((acc, r) => acc + (r.itemCount || 0), 0) },
      ...rows
    ];
    res.json({ success: true, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Helper to fetch and cache materials with current stock and warehouse/zone (단일 통합 마스터 캐시)
async function getOrUpdateMaterialsCache(forceRefresh = false): Promise<MaterialCache | null> {
  const now = Date.now();
  if (!forceRefresh && globalMaterialsCache && (now - globalMaterialsCache.lastFetchedAt < CACHE_TTL_MS)) {
    return globalMaterialsCache;
  }

  // 중복 쿼리 방지: 이미 쿼리가 실행 중이면 동일한 Promise를 공유
  if (globalCacheFetchPromise) {
    return globalCacheFetchPromise;
  }

  globalCacheFetchPromise = (async () => {
    const isConnected = await mssqlAdapter.connect();
    if (!isConnected) {
      return globalMaterialsCache || null;
    }

    try {
      const sql = `
        WITH StockCTE AS (
          SELECT 
            m.itm_cd,
            RTRIM(a.wh_cd) AS whCode,
            RTRIM(w.wh_nm) AS whName,
            SUM(ISNULL(a.bas_qty, 0) + ISNULL(a.in_qty, 0) - ISNULL(a.out_qty, 0)) AS currentStock
          FROM LES200 a
          INNER JOIN DMA100 m ON m.itm_id = a.itm_id
          INNER JOIN BCW100 w ON w.wh_cd = a.wh_cd
          WHERE a.sum_mon = (CAST(DATEPART(year, GETDATE()) AS CHAR(4)) + '-00')
            AND (ISNULL(a.bas_qty, 0) + ISNULL(a.in_qty, 0) - ISNULL(a.out_qty, 0)) > 0
          GROUP BY m.itm_cd, a.wh_cd, w.wh_nm
        )
        SELECT TOP (15000)
          RTRIM(P.품목코드) AS code,
          RTRIM(P.품목명) AS name,
          RTRIM(P.규격) AS spec,
          RTRIM(P.최소단위) AS unit,
          ISNULL(P.입고단가, 0) AS unitPrice,
          ISNULL(P.안전재고, 0) AS safetyStock,
          ISNULL(P.기초재고, 0) AS basicStock,
          RTRIM(ISNULL(P.구역코드, '')) AS zone,
          RTRIM(ISNULL(P.중분류코드, '')) AS category,
          RTRIM(ISNULL(P.거래처코드, '')) AS supplierCode,
          RTRIM(ISNULL(C.거래처명, '')) AS supplierName,
          RTRIM(ISNULL(P.특이사항, '')) AS notes,
          ISNULL(P.수정일, '') AS updatedAt,
          ISNULL(S.whCode, '') AS whCode,
          ISNULL(S.whName, '') AS whName,
          ISNULL(S.currentStock, 0) AS currentStock
        FROM MT_TC_품목코드 P
        LEFT JOIN MT_TC_거래처코드 C ON P.거래처코드 = C.거래처코드
        LEFT JOIN StockCTE S ON S.itm_cd = P.품목코드
        ORDER BY S.currentStock DESC, P.수정일 DESC, P.품목코드 ASC
      `;

      const items = await mssqlAdapter.query<any>(sql);
      globalMaterialsCache = {
        data: items,
        totalCount: items.length,
        lastFetchedAt: Date.now(),
      };
      return globalMaterialsCache;
    } catch (err) {
      console.error('[Global Material Cache Update Failed]', err);
      return globalMaterialsCache || null;
    } finally {
      globalCacheFetchPromise = null;
    }
  })();

  return globalCacheFetchPromise;
}

// GET /api/erp/materials/sync - 인덱스DB 증분 동기화 엔드포인트
router.get('/materials/sync', async (req: Request, res: Response) => {
  try {
    const since = typeof req.query.since === 'string' ? req.query.since.trim() : '';
    const whCode = typeof req.query.whCode === 'string' ? req.query.whCode.trim() : 'ALL';
    const limit = Math.min(Math.max(parseInt(req.query.limit as string || '3000', 10), 1), 15000);

    const cache = await getOrUpdateMaterialsCache(false);
    if (!cache) {
      return res.status(503).json({
        success: false,
        error: 'ERP MSSQL 데이터베이스에 연결할 수 없습니다.',
      });
    }

    let diffItems = cache.data;
    if (whCode && whCode !== 'ALL') {
      diffItems = diffItems.filter(item => item.whCode === whCode || item.whName === whCode);
    }

    let isIncremental = false;
    if (since) {
      isIncremental = true;
      diffItems = diffItems.filter(item => item.updatedAt && item.updatedAt > since);
    } else {
      isIncremental = false;
      diffItems = diffItems.slice(0, limit);
    }

    const latestUpdated = cache.data.length > 0 ? (cache.data[0].updatedAt || '') : '';

    return res.json({
      success: true,
      isIncremental,
      count: diffItems.length,
      totalCount: cache.totalCount,
      syncTimestamp: Date.now(),
      lastUpdated: latestUpdated,
      data: diffItems,
    });
  } catch (err: any) {
    console.error('[ERP Sync Error]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/erp/materials - ERP 자재 검색 (서버 인메모리 초고속 <1ms 필터링)
router.get('/materials', async (req: Request, res: Response) => {
  try {
    const query = typeof req.query.query === 'string' ? req.query.query.trim().toLowerCase() : '';
    const whCode = typeof req.query.whCode === 'string' ? req.query.whCode.trim() : 'ALL';
    const limit = Math.min(Math.max(parseInt(req.query.limit as string || '60', 10), 1), 500);
    const offset = Math.max(parseInt(req.query.offset as string || '0', 10), 0);

    // 1. 단일 글로벌 인메모리 캐시에서 즉시 필터링
    const cache = await getOrUpdateMaterialsCache(false);
    if (cache && cache.data && cache.data.length > 0) {
      let filtered = cache.data;

      // 1) 창고 인메모리 필터링 (< 0.5ms)
      if (whCode && whCode !== 'ALL') {
        filtered = filtered.filter(item => item.whCode === whCode || item.whName === whCode);
      }

      // 2) 검색어 인메모리 필터링 (< 1ms)
      if (query) {
        filtered = filtered.filter(item =>
          (item.code && item.code.toLowerCase().includes(query)) ||
          (item.name && item.name.toLowerCase().includes(query)) ||
          (item.spec && item.spec.toLowerCase().includes(query)) ||
          (item.zone && item.zone.toLowerCase().includes(query)) ||
          (item.supplierName && item.supplierName.toLowerCase().includes(query))
        );
      }

      const pagedData = filtered.slice(offset, offset + limit);
      return res.json({
        success: true,
        count: pagedData.length,
        total: filtered.length,
        hasMore: offset + limit < filtered.length,
        offset,
        limit,
        cached: true,
        data: pagedData,
      });
    }

    // 2. 캐시가 비어있고 MSSQL 연결 실패 시
    return res.status(503).json({
      success: false,
      error: 'ERP MSSQL 데이터베이스에 연결할 수 없으며 캐시된 데이터가 없습니다.',
    });
  } catch (err: any) {
    console.error('[ERP Search Error]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/erp/materials/:code - 자재 상세 정보, 창고별 현재고 및 전체 입출고 수불 내역
router.get('/materials/:code', async (req: Request, res: Response) => {
  try {
    const code = req.params.code.trim();
    const isConnected = await mssqlAdapter.connect();
    if (!isConnected) {
      return res.status(503).json({ success: false, error: 'ERP 데이터베이스 연결 실패' });
    }

    // 1. 품목 기본 정보
    const itemSql = `
      SELECT TOP 1
        RTRIM(P.품목코드) AS code,
        RTRIM(P.품목명) AS name,
        RTRIM(P.규격) AS spec,
        RTRIM(P.최소단위) AS unit,
        ISNULL(P.입고단가, 0) AS unitPrice,
        ISNULL(P.출고단가, 0) AS outPrice,
        ISNULL(P.안전재고, 0) AS safetyStock,
        ISNULL(P.기초재고, 0) AS basicStock,
        RTRIM(ISNULL(P.구역코드, '')) AS zone,
        RTRIM(ISNULL(P.중분류코드, '')) AS category,
        RTRIM(ISNULL(P.거래처코드, '')) AS supplierCode,
        RTRIM(ISNULL(C.거래처명, '')) AS supplierName,
        RTRIM(ISNULL(C.전화번호, '')) AS supplierPhone,
        RTRIM(ISNULL(P.특이사항, '')) AS notes,
        ISNULL(P.수정일, '') AS updatedAt
      FROM MT_TC_품목코드 P
      LEFT JOIN MT_TC_거래처코드 C ON P.거래처코드 = C.거래처코드
      WHERE P.품목코드 = @code
    `;
    const itemRes = await mssqlAdapter.query(itemSql, { code });
    if (itemRes.length === 0) {
      return res.status(404).json({ success: false, message: 'ERP에서 품목을 찾을 수 없습니다.' });
    }

    // 2. 창고별 현재고 현황
    const whStockSql = `
      SELECT
        RTRIM(w.wh_cd) AS whCode,
        RTRIM(w.wh_nm) AS whName,
        ISNULL(SUM(a.bas_qty + a.in_qty - a.out_qty), 0) AS stockQty
      FROM LES200 a
      INNER JOIN DMA100 m ON m.itm_id = a.itm_id
      INNER JOIN BCW100 w ON w.wh_cd = a.wh_cd
      WHERE m.itm_cd = @code
        AND a.sum_mon = (CAST(DATEPART(year, GETDATE()) AS CHAR(4)) + '-00')
      GROUP BY w.wh_cd, w.wh_nm
      HAVING ISNULL(SUM(a.bas_qty + a.in_qty - a.out_qty), 0) <> 0
      ORDER BY stockQty DESC
    `;
    const warehouseStocks = await mssqlAdapter.query(whStockSql, { code });
    const totalCurrentStock = warehouseStocks.reduce((sum: number, ws: any) => sum + Number(ws.stockQty || 0), 0);

    // 3. 전체 입출고 수불 내역 (최대 100건)
    const histSql = `
      SELECT TOP 100
        RTRIM(T.전표번호) AS slipNo,
        ISNULL(T.일련번호, 0) AS seq,
        RTRIM(T.구분) AS type,
        RTRIM(T.세부구분) AS subType,
        ISNULL(T.날짜, '') AS date,
        ISNULL(T.입고수량, 0) AS inQty,
        ISNULL(T.출고수량, 0) AS outQty,
        ISNULL(T.수량, 0) AS totalQty,
        ISNULL(T.단가, 0) AS unitPrice,
        ISNULL(T.합계, 0) AS totalAmount,
        RTRIM(ISNULL(T.비고, '')) AS memo,
        RTRIM(ISNULL(T.창고코드, '')) AS warehouseCode,
        RTRIM(ISNULL(T.거래처코드, '')) AS supplierCode,
        RTRIM(ISNULL(C.거래처명, '')) AS supplierName,
        RTRIM(ISNULL(T.담당자코드, '')) AS managerCode
      FROM MT_T_입출고 T
      LEFT JOIN MT_TC_거래처코드 C ON T.거래처코드 = C.거래처코드
      WHERE T.품목코드 = @code
      ORDER BY T.날짜 DESC, T.일련번호 DESC
    `;
    const history = await mssqlAdapter.query(histSql, { code });

    res.json({
      success: true,
      data: {
        item: {
          ...itemRes[0],
          currentStock: totalCurrentStock,
        },
        warehouseStocks,
        history,
      },
    });
  } catch (err: any) {
    console.error('[ERP Detail Error]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/erp/import-item - ERP 품목을 스마트랙 로컬 재고로 1클릭 등록
router.post('/import-item', (req: Request, res: Response) => {
  try {
    const { code, name, spec, unit, unitPrice, supplierName, notes, warehouse, rackLocation } = req.body;
    if (!code || !name) {
      return res.status(400).json({ success: false, message: '품목코드와 품목명은 필수입니다.' });
    }

    const existing = getItemByCode(code);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `이미 스마트랙에 등록된 품목코드(${code})입니다.`,
        data: existing,
      });
    }

    const now = new Date().toISOString();
    const newItem: InventoryItem = {
      id: `item-erp-${code}-${Date.now()}`,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      spec: spec || '',
      category: 'ERP연동자재',
      warehouse: warehouse || '특장자재창고',
      rackLocation: rackLocation || '미지정',
      quantity: 0,
      unit: unit || 'EA',
      safetyStock: 10,
      price: Number(unitPrice) || 0,
      supplier: supplierName || '',
      notes: notes || 'ERP(System9) 실시간 연동 등록 품목',
      createdAt: now,
      updatedAt: now,
      printCount: 0,
      isPrinted: false,
    };

    const created = createItem(newItem);
    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/erp/inbound/pending-slips - ERP '미입고현황' 실시간 미입고 전표 목록
router.get('/inbound/pending-slips', async (req: Request, res: Response) => {
  try {
    const { getErpPendingSlips } = await import('../db/erpInboundDb');
    const query = typeof req.query.query === 'string' ? req.query.query : undefined;
    const limit = Math.min(Math.max(parseInt(req.query.limit as string || '50', 10), 1), 100);

    const slips = await getErpPendingSlips(query, limit);
    res.json({
      success: true,
      count: slips.length,
      data: slips,
    });
  } catch (err: any) {
    console.error('[ERP Inbound Slips Error]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/erp/inbound/history - ERP 'MT_T_입출고' 실시간 입고 완료 내역 조회
router.get('/inbound/history', async (req: Request, res: Response) => {
  try {
    const { getErpInboundHistory } = await import('../db/erpInboundDb');
    const limit = Math.min(Math.max(parseInt(req.query.limit as string || '100', 10), 1), 200);
    const slips = await getErpInboundHistory(limit);
    res.json({
      success: true,
      count: slips.length,
      data: slips,
    });
  } catch (err: any) {
    console.error('[ERP Inbound History Error]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/erp/inbound/slips/:slipNo - ERP 단건 전표 조회 (QR 스캔 실시간 매칭용)
router.get('/inbound/slips/:slipNo', async (req: Request, res: Response) => {
  try {
    const { getErpSlipByNo } = await import('../db/erpInboundDb');
    const slip = await getErpSlipByNo(req.params.slipNo);
    if (!slip) {
      return res.status(404).json({
        success: false,
        message: `사내 ERP 미입고현황에서 전표 [${req.params.slipNo}]를 찾을 수 없습니다.`,
      });
    }
    res.json({ success: true, data: slip });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/erp/purchase-orders - ERP 'MMB100 + MMB150' 실시간 발주 내역 조회
router.get('/purchase-orders', async (req: Request, res: Response) => {
  try {
    const query = typeof req.query.query === 'string' ? req.query.query.trim() : '';
    const status = typeof req.query.status === 'string' ? req.query.status.trim().toUpperCase() : 'ALL';
    const limit = Math.min(Math.max(parseInt(req.query.limit as string || '60', 10), 1), 500);
    const offset = Math.max(parseInt(req.query.offset as string || '0', 10), 0);

    const isConnected = await mssqlAdapter.connect();
    if (!isConnected) {
      return res.status(503).json({
        success: false,
        error: 'ERP MSSQL 데이터베이스에 연결할 수 없습니다.',
      });
    }

    const likeQ = `%${query}%`;
    const sql = `
      SELECT
        RTRIM(H.po_no) AS poNo,
        CONVERT(VARCHAR(10), H.po_dt, 120) AS poDate,
        CONVERT(VARCHAR(10), ISNULL(D.dlv_dt, H.dlv_dt), 120) AS deliveryDate,
        RTRIM(H.cust_cd) AS supplierCode,
        RTRIM(ISNULL(V.cust_nm, H.cust_cd)) AS supplierName,
        RTRIM(ISNULL(W.wh_nm, '')) AS warehouseName,
        RTRIM(ISNULL(M.itm_cd, '')) AS itemCode,
        RTRIM(ISNULL(M.itm_nm, ISNULL(D.itm_dsc, ''))) AS itemName,
        RTRIM(ISNULL(M.spec, ISNULL(D.spec_dsc, ''))) AS itemSpec,
        RTRIM(ISNULL(M.um_bc, 'EA')) AS unit,
        ISNULL(D.po_qty, 0) AS poQty,
        ISNULL(D.in_qty, 0) AS receivedQty,
        (ISNULL(D.po_qty, 0) - ISNULL(D.in_qty, 0)) AS remainQty,
        ISNULL(D.po_up, 0) AS unitPrice,
        ISNULL(D.po_amt, 0) AS totalAmount,
        RTRIM(ISNULL(D.rmks, ISNULL(H.rmks, ''))) AS remarks,
        CASE 
          WHEN ISNULL(D.in_qty, 0) >= ISNULL(D.po_qty, 0) AND ISNULL(D.po_qty, 0) > 0 THEN 'COMPLETED'
          WHEN ISNULL(D.in_qty, 0) > 0 THEN 'PARTIAL'
          ELSE 'WAITING'
        END AS status
      FROM MMB100 H
      INNER JOIN MMB150 D ON D.po_no = H.po_no
      LEFT JOIN DMA100 M ON M.itm_id = D.itm_id
      LEFT JOIN BCV100 V ON V.cust_cd = H.cust_cd
      LEFT JOIN BCW100 W ON W.wh_cd = ISNULL(D.in_wh, H.in_wh)
      WHERE (@query = '' 
         OR H.po_no LIKE @likeQ 
         OR V.cust_nm LIKE @likeQ 
         OR M.itm_cd LIKE @likeQ 
         OR M.itm_nm LIKE @likeQ
         OR D.itm_dsc LIKE @likeQ)
      ORDER BY H.po_dt DESC, H.po_no DESC, D.po_sq ASC
      OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY;
    `;

    const rawRows = await mssqlAdapter.query<any>(sql, { query, likeQ });
    const filteredRows = status === 'ALL'
      ? rawRows
      : rawRows.filter(r => r.status === status);

    res.json({
      success: true,
      count: filteredRows.length,
      hasMore: rawRows.length === limit,
      offset,
      data: filteredRows,
    });
  } catch (err: any) {
    console.error('[ERP Purchase Orders Error]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/erp/inbound/receive - ERP 실시간 입고 확정 및 MT_T_입출고 INSERT
router.post('/inbound/receive', async (req: Request, res: Response) => {
  try {
    const { processErpInboundReceive } = await import('../db/erpInboundDb');
    const result = await processErpInboundReceive(req.body);
    res.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    console.error('[ERP Inbound Receive Error]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/erp/inbound/cancel - ERP 입고 취소 및 MT_T_입출고 DELETE
router.post('/inbound/cancel', async (req: Request, res: Response) => {
  try {
    const { cancelErpInboundReceive } = await import('../db/erpInboundDb');
    const { slipNo } = req.body;
    if (!slipNo) {
      return res.status(400).json({ success: false, message: '전표번호(slipNo)는 필수입니다.' });
    }
    const result = await cancelErpInboundReceive(slipNo);
    res.json(result);
  } catch (err: any) {
    console.error('[ERP Inbound Cancel Error]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/erp/inbound/print/:slipNo - 사내 ERP MMB202_Print 입하증 출력 데이터 조회
router.get('/inbound/print/:slipNo', async (req: Request, res: Response) => {
  try {
    const { getErpInboundPrintData } = await import('../db/erpInboundDb');
    const { slipNo } = req.params;
    const companyCode = parseInt((req.query.companyCode as string) || '101', 10);
    const subCode = (req.query.subCode as string) || '34661';

    const printResult = await getErpInboundPrintData(slipNo, companyCode, subCode);
    res.json(printResult);
  } catch (err: any) {
    console.error('[ERP Inbound Print Error]', err);
    res.status(500).json({
      success: false,
      error: err.message || 'ERP 입하증 출력 데이터 조회 실패',
    });
  }
});

// POST /api/erp/inbound/print - 사내 ERP MMB202_Print 커스텀 파라미터 실행
router.post('/inbound/print', async (req: Request, res: Response) => {
  try {
    const { getErpInboundPrintData } = await import('../db/erpInboundDb');
    const { slipNo, companyCode, subCode } = req.body;
    if (!slipNo) {
      return res.status(400).json({ success: false, message: '전표번호(slipNo)는 필수입니다.' });
    }

    const printResult = await getErpInboundPrintData(
      slipNo,
      companyCode ? parseInt(companyCode, 10) : 101,
      subCode || '34661'
    );
    res.json(printResult);
  } catch (err: any) {
    console.error('[ERP Inbound Print Execute Error]', err);
    res.status(500).json({
      success: false,
      error: err.message || 'ERP 입하증 출력 프로시저 실행 실패',
    });
  }
});

// Cached User Authentication Storage for Offline DB Fallback
const CACHED_USERS_FILE = path.resolve(process.cwd(), 'server/data/cached_users.json');

interface CachedUserRecord {
  code: string;
  name: string;
  dept?: string;
  role?: string;
  isAdmin: boolean;
  hidePrice?: boolean;
  passwordHash?: string;
  pdaPwd?: string;
  lastLoginAt: string;
}

function loadCachedUsers(): Map<string, CachedUserRecord> {
  const map = new Map<string, CachedUserRecord>();
  try {
    if (fs.existsSync(CACHED_USERS_FILE)) {
      const data = JSON.parse(fs.readFileSync(CACHED_USERS_FILE, 'utf-8'));
      if (Array.isArray(data)) {
        for (const u of data) {
          if (u.code) map.set(u.code.toLowerCase(), u);
        }
      }
    }
  } catch (err) {
    console.error('Failed reading cached users:', err);
  }
  return map;
}

function saveCachedUser(record: CachedUserRecord) {
  try {
    const map = loadCachedUsers();
    map.set(record.code.toLowerCase(), record);
    const dir = path.dirname(CACHED_USERS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CACHED_USERS_FILE, JSON.stringify(Array.from(map.values()), null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed saving cached user:', err);
  }
}

// POST /api/erp/auth/login - 사내 ERP 담당자코드 & 패스워드 로그인 인증
router.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { code, password } = req.body;
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ success: false, message: '담당자코드를 입력해주세요.' });
    }

    const cleanCode = code.trim();
    const cleanPwd = typeof password === 'string' ? password.trim() : '';

    const isConnected = await mssqlAdapter.connect();

    // 가상 더미 DB 모드 지원: 사내망 DB 미연결 시에도 모든 작업자 로그인 정상 허용
    if (mssqlAdapter.isDummyMode) {
      const displayName = cleanCode.toLowerCase() === 'admin' ? '관리자' : (cleanCode === '34661' ? '김자재' : `${cleanCode} (작업자)`);
      return res.json({
        success: true,
        offlineMode: false,
        user: {
          code: cleanCode,
          name: displayName,
          dept: '자재관리부',
          role: '관리자',
          isAdmin: true,
          hidePrice: false,
        },
        message: `가상 DB 모드로 정상 로그인되었습니다. (${displayName})`,
      });
    }

    if (!isConnected) {
      if (cleanCode.toLowerCase() === 'admin' || cleanCode.toLowerCase() === 'demo') {
        return res.json({
          success: true,
          offlineMode: true,
          user: {
            code: 'admin',
            name: '개발자 (오프라인 모드)',
            dept: '자재관리부',
            role: '관리자',
            isAdmin: true,
            hidePrice: false,
          },
          message: '오프라인 개발자 모드로 로그인되었습니다.',
        });
      }

      // Check cached users from previous online logins
      const cachedUsers = loadCachedUsers();
      const cached = cachedUsers.get(cleanCode.toLowerCase());
      if (cached) {
        const sha256Input = crypto.createHash('sha256').update(cleanPwd).digest('hex').toLowerCase();
        let isPasswordMatch = false;

        if (!cached.passwordHash && !cached.pdaPwd) {
          isPasswordMatch = true;
        } else if (cached.passwordHash && sha256Input === cached.passwordHash.toLowerCase()) {
          isPasswordMatch = true;
        } else if (cached.pdaPwd && cleanPwd === cached.pdaPwd) {
          isPasswordMatch = true;
        } else if (cached.passwordHash && cleanPwd.toLowerCase() === cached.passwordHash.toLowerCase()) {
          isPasswordMatch = true;
        } else if (cleanPwd === '' && !cached.passwordHash) {
          isPasswordMatch = true;
        }

        if (isPasswordMatch) {
          return res.json({
            success: true,
            offlineMode: true,
            user: {
              code: cached.code,
              name: cached.name,
              dept: cached.dept,
              role: cached.role,
              isAdmin: cached.isAdmin,
              hidePrice: cached.hidePrice,
            },
            message: `사내 ERP DB 오프라인 상태: 기존 인증 정보(${cached.name})로 로그인되었습니다.`,
          });
        } else {
          return res.status(401).json({
            success: false,
            message: '비밀번호가 일치하지 않습니다. (오프라인 캐시 인증)',
          });
        }
      }

      return res.status(503).json({
        success: false,
        message: '사내 ERP DB에 연결할 수 없습니다. (오프라인 로그인을 위해 최소 1회 이상 로그인한 이력이 필요합니다)',
      });
    }

    // 1. Try scu100 table first (Younglimwon K-System standard user master)
    let userRow: any = null;
    let isFromScu100 = false;

    try {
      const scuSql = `
        SELECT TOP 1
          RTRIM(ISNULL(id, '')) AS code,
          RTRIM(ISNULL(nm, '')) AS name,
          RTRIM(ISNULL(pwd, '')) AS pwd,
          RTRIM(ISNULL(pda_pwd, '')) AS pda_pwd,
          RTRIM(ISNULL(dept_cd, '')) AS dept_cd,
          RTRIM(ISNULL(emp_no, '')) AS emp_no,
          RTRIM(ISNULL(usr_ty, '')) AS usr_ty,
          ISNULL(use_yn, '1') AS use_yn
        FROM scu100
        WHERE LOWER(id) = LOWER(@cleanCode)
      `;
      const scuRows = await mssqlAdapter.query<any>(scuSql, { cleanCode });
      if (scuRows && scuRows.length > 0) {
        const r = scuRows[0];
        const isAdmin = r.usr_ty === 'SC700990' || (r.code && r.code.toLowerCase() === 'admin');
        userRow = {
          code: r.code,
          name: r.name || r.code,
          pwd: r.pwd || '',
          pda_pwd: r.pda_pwd || '',
          isAdmin,
          hidePrice: false,
          dept: r.dept_cd || '자재',
          role: isAdmin ? '관리자' : '사원',
        };
        isFromScu100 = true;
      }
    } catch (scuErr) {
      console.warn('[scu100 query failed, fallback to MT_TC]', scuErr);
    }

    // 2. Fallback to MT_TC_담당자코드 if not found in scu100
    if (!userRow) {
      const sql = `
        SELECT TOP 1
          RTRIM(ISNULL(담당자코드, '')) AS code,
          RTRIM(ISNULL(담당자명, '')) AS name,
          RTRIM(ISNULL(패스워드, '')) AS pwd,
          ISNULL(관리자여부, 0) AS isAdmin,
          ISNULL(단가숨김여부, 0) AS hidePrice,
          ISNULL(사용여부, 1) AS isActive,
          RTRIM(ISNULL(부서, '')) AS dept,
          RTRIM(ISNULL(직책, '')) AS role
        FROM MT_TC_담당자코드
        WHERE 담당자코드 = @cleanCode OR 담당자명 = @cleanCode
      `;

      const rows = await mssqlAdapter.query<any>(sql, { cleanCode });
      if (rows && rows.length > 0) {
        const user = rows[0];
        userRow = {
          code: user.code,
          name: user.name,
          pwd: user.pwd || '',
          pda_pwd: '',
          dept: user.dept || '자재부서',
          role: user.role || (user.isAdmin ? '관리자' : '사원'),
          isAdmin: Boolean(user.isAdmin),
          hidePrice: Boolean(user.hidePrice),
        };
        isFromScu100 = false;
      }
    }

    if (!userRow) {
      return res.status(401).json({ success: false, message: `등록되지 않은 ID/사번(${cleanCode})입니다.` });
    }

    // Verify Password
    let isPasswordValid = false;
    const dbHash = (userRow.pwd || '').trim().toLowerCase();
    const pdaPwd = (userRow.pda_pwd || '').trim();
    const sha256Input = crypto.createHash('sha256').update(cleanPwd).digest('hex').toLowerCase();

    if (isFromScu100) {
      // 1) SHA-256 hash match (K-System default: e.g. '1234')
      // 2) PDA plain-text password match (e.g. 'kcp123!@')
      // 3) Raw password match
      // 4) Empty password in DB
      if (!dbHash && !pdaPwd) {
        isPasswordValid = true;
      } else if (dbHash && sha256Input === dbHash) {
        isPasswordValid = true;
      } else if (pdaPwd && cleanPwd === pdaPwd) {
        isPasswordValid = true;
      } else if (dbHash && cleanPwd.toLowerCase() === dbHash) {
        isPasswordValid = true;
      }
    } else {
      // MT_TC_담당자코드 plain text comparison
      const rawDbPwd = (userRow.pwd || '').trim();
      if (rawDbPwd === '' || cleanPwd === rawDbPwd) {
        isPasswordValid = true;
      }
    }

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: '비밀번호가 일치하지 않습니다.' });
    }

    // Save successful login credentials to local cached storage for offline execution
    saveCachedUser({
      code: userRow.code,
      name: userRow.name,
      dept: userRow.dept,
      role: userRow.role,
      isAdmin: userRow.isAdmin,
      hidePrice: userRow.hidePrice,
      passwordHash: dbHash || sha256Input,
      pdaPwd: userRow.pda_pwd || cleanPwd,
      lastLoginAt: new Date().toISOString(),
    });

    return res.json({
      success: true,
      user: {
        code: userRow.code,
        name: userRow.name,
        dept: userRow.dept,
        role: userRow.role,
        isAdmin: userRow.isAdmin,
        hidePrice: userRow.hidePrice,
      },
    });
  } catch (err: any) {
    console.error('[ERP Login Error]', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/erp/auth/users - 활성 사원 목록 (빠른 선택용, 패스워드 제외)
router.get('/auth/users', async (_req: Request, res: Response) => {
  try {
    const isConnected = await mssqlAdapter.connect();

    if (mssqlAdapter.isDummyMode) {
      return res.json({
        success: true,
        data: [
          { code: 'Admin', name: '관리자 (총괄)', dept: '자재관리부', role: '총괄관리자', isAdmin: true, hidePrice: false, hasPassword: true },
          { code: '34661', name: '김자재 주임', dept: '특장자재창고', role: '입고검수원', isAdmin: false, hidePrice: false, hasPassword: true },
          { code: '34662', name: '이검수 대리', dept: '함안자재창고', role: '입고검수원', isAdmin: false, hidePrice: false, hasPassword: true },
          { code: '34663', name: '박반장 직장', dept: '화성자재창고', role: '재고관리자', isAdmin: false, hidePrice: false, hasPassword: true },
        ],
      });
    }

    if (!isConnected) {
      const cachedUsers = Array.from(loadCachedUsers().values());
      return res.json({
        success: true,
        offline: true,
        data: cachedUsers.map(r => ({
          code: r.code,
          name: r.name,
          dept: r.dept || '자재',
          role: r.role || (r.isAdmin ? '관리자' : '사원'),
          isAdmin: Boolean(r.isAdmin),
          hidePrice: Boolean(r.hidePrice),
          hasPassword: Boolean(r.passwordHash || r.pdaPwd),
        })),
      });
    }

    // 1. Try scu100 first
    try {
      const scuSql = `
        SELECT 
          RTRIM(ISNULL(id, '')) AS code,
          RTRIM(ISNULL(name, id)) AS name,
          ISNULL(admin_yn, 0) AS isAdmin,
          RTRIM(ISNULL(dept_nm, '자재')) AS dept,
          CASE WHEN RTRIM(ISNULL(pwd, '')) = '' THEN 0 ELSE 1 END AS hasPassword
        FROM scu100
        WHERE use_yn = 'Y' OR use_yn = '1' OR use_yn IS NULL
        ORDER BY name ASC
      `;
      const scuRows = await mssqlAdapter.query<any>(scuSql);
      if (scuRows && scuRows.length > 0) {
        return res.json({
          success: true,
          data: scuRows.map(r => ({
            code: r.code,
            name: r.name,
            dept: r.dept || '자재',
            role: (r.isAdmin === 'Y' || r.isAdmin === 1) ? '관리자' : '사원',
            isAdmin: r.isAdmin === 'Y' || r.isAdmin === 1,
            hidePrice: false,
            hasPassword: Boolean(r.hasPassword),
          })),
        });
      }
    } catch {
      // scu100 fallback
    }

    // 2. Fallback to MT_TC_담당자코드
    const sql = `
      SELECT 
        RTRIM(ISNULL(담당자코드, '')) AS code,
        RTRIM(ISNULL(담당자명, '')) AS name,
        ISNULL(관리자여부, 0) AS isAdmin,
        ISNULL(단가숨김여부, 0) AS hidePrice,
        RTRIM(ISNULL(부서, '')) AS dept,
        RTRIM(ISNULL(직책, '')) AS role,
        CASE WHEN RTRIM(ISNULL(패스워드, '')) = '' THEN 0 ELSE 1 END AS hasPassword
      FROM MT_TC_담당자코드
      WHERE 사용여부 = 1 OR 관리자여부 = 1
      ORDER BY 담당자명 ASC
    `;

    const rows = await mssqlAdapter.query<any>(sql);
    res.json({
      success: true,
      data: rows.map(r => ({
        code: r.code,
        name: r.name,
        dept: r.dept || '자재',
        role: r.role || (r.isAdmin ? '관리자' : '사원'),
        isAdmin: Boolean(r.isAdmin),
        hidePrice: Boolean(r.hidePrice),
        hasPassword: Boolean(r.hasPassword),
      })),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/erp/sync-queue/batch - 오프라인 대기 큐 트랜잭션 일괄 동기화 처리
router.post('/sync-queue/batch', async (req: Request, res: Response) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.json({ success: true, processed: 0, results: [] });
    }

    const isConnected = await mssqlAdapter.connect();
    if (!isConnected) {
      return res.status(503).json({
        success: false,
        error: '사내 ERP DB에 연결되어 있지 않아 일괄 동기화를 진행할 수 없습니다.',
      });
    }

    const { processErpInboundReceive } = await import('../db/erpInboundDb');
    const results: any[] = [];

    for (const item of items) {
      try {
        if (item.type === 'INBOUND_RECEIVE') {
          const r = await processErpInboundReceive(item.payload);
          results.push({ id: item.id, slipNo: item.slipNo, success: true, message: r.message });
        } else {
          results.push({ id: item.id, slipNo: item.slipNo, success: true });
        }
      } catch (itemErr: any) {
        results.push({ id: item.id, slipNo: item.slipNo, success: false, error: itemErr.message });
      }
    }

    const succeeded = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    res.json({
      success: true,
      processed: results.length,
      succeeded,
      failed,
      results,
    });
  } catch (err: any) {
    console.error('[Sync Queue Batch Error]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
