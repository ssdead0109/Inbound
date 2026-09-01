import { Router, Request, Response } from 'express';
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

// GET /api/erp/materials - ERP 자재 실시간 검색
router.get('/materials', async (req: Request, res: Response) => {
  try {
    const query = typeof req.query.query === 'string' ? req.query.query.trim() : '';
    const limit = Math.min(Math.max(parseInt(req.query.limit as string || '50', 10), 1), 200);

    const isConnected = await mssqlAdapter.connect();
    if (!isConnected) {
      return res.status(503).json({
        success: false,
        error: 'ERP MSSQL 데이터베이스에 연결할 수 없습니다.',
      });
    }

    const likeQ = `%${query}%`;
    const sql = `
      SELECT TOP (${limit})
        RTRIM(P.품목코드) AS code,
        RTRIM(P.품목명) AS name,
        RTRIM(P.규격) AS spec,
        RTRIM(P.최소단위) AS unit,
        ISNULL(P.입고단가, 0) AS unitPrice,
        ISNULL(P.안전재고, 0) AS safetyStock,
        RTRIM(ISNULL(P.중분류코드, '')) AS category,
        RTRIM(ISNULL(P.거래처코드, '')) AS supplierCode,
        RTRIM(ISNULL(C.거래처명, '')) AS supplierName,
        RTRIM(ISNULL(P.특이사항, '')) AS notes,
        ISNULL(P.수정일, '') AS updatedAt
      FROM MT_TC_품목코드 P
      LEFT JOIN MT_TC_거래처코드 C ON P.거래처코드 = C.거래처코드
      WHERE (@query = '' OR P.품목명 LIKE @likeQ OR P.품목코드 LIKE @likeQ OR P.규격 LIKE @likeQ OR C.거래처명 LIKE @likeQ)
      ORDER BY P.수정일 DESC, P.품목코드 ASC
    `;

    const items = await mssqlAdapter.query(sql, { query, likeQ });

    res.json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (err: any) {
    console.error('[ERP Search Error]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/erp/materials/:code - 자재 상세 정보 및 최근 입출고 수불 내역
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

    // 2. 최근 입출고 이력 (15건)
    const histSql = `
      SELECT TOP 15
        RTRIM(전표번호) AS slipNo,
        RTRIM(구분) AS type,
        RTRIM(세부구분) AS subType,
        ISNULL(날짜, '') AS date,
        ISNULL(입고수량, 0) AS inQty,
        ISNULL(출고수량, 0) AS outQty,
        ISNULL(수량, 0) AS totalQty,
        ISNULL(단가, 0) AS unitPrice,
        RTRIM(ISNULL(비고, '')) AS memo,
        RTRIM(ISNULL(거래처코드, '')) AS supplierCode
      FROM MT_T_입출고
      WHERE 품목코드 = @code
      ORDER BY 날짜 DESC, 일련번호 DESC
    `;
    const history = await mssqlAdapter.query(histSql, { code });

    res.json({
      success: true,
      data: {
        item: itemRes[0],
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

export default router;
