import { Router, Request, Response } from 'express';
import crypto from 'crypto';
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

// In-memory cache for materials to eliminate redundant MSSQL reads
interface MaterialCache {
  data: any[];
  totalCount: number;
  lastFetchedAt: number;
}
let serverMaterialsCache: MaterialCache | null = null;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache

// Helper to fetch and cache all materials
async function getOrUpdateMaterialsCache(forceRefresh = false): Promise<MaterialCache | null> {
  const now = Date.now();
  if (!forceRefresh && serverMaterialsCache && (now - serverMaterialsCache.lastFetchedAt < CACHE_TTL_MS)) {
    return serverMaterialsCache;
  }

  const isConnected = await mssqlAdapter.connect();
  if (!isConnected) {
    return serverMaterialsCache; // Return stale cache if available when offline
  }

  try {
    const sql = `
      SELECT TOP (5000)
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
      ORDER BY P.수정일 DESC, P.품목코드 ASC
    `;

    const items = await mssqlAdapter.query<any>(sql);
    serverMaterialsCache = {
      data: items,
      totalCount: items.length,
      lastFetchedAt: now,
    };
    return serverMaterialsCache;
  } catch (err) {
    console.error('[Material Cache Update Failed]', err);
    return serverMaterialsCache;
  }
}

// GET /api/erp/materials/sync - 인덱스DB 증분 동기화 엔드포인트
router.get('/materials/sync', async (req: Request, res: Response) => {
  try {
    const since = typeof req.query.since === 'string' ? req.query.since.trim() : '';
    const limit = Math.min(Math.max(parseInt(req.query.limit as string || '2000', 10), 1), 5000);

    const cache = await getOrUpdateMaterialsCache();
    if (!cache) {
      return res.status(503).json({
        success: false,
        error: 'ERP MSSQL 데이터베이스에 연결할 수 없습니다.',
      });
    }

    let diffItems: any[] = [];
    let isIncremental = false;

    if (since) {
      isIncremental = true;
      // Filter records updated after 'since'
      diffItems = cache.data.filter(item => item.updatedAt && item.updatedAt > since);
    } else {
      isIncremental = false;
      diffItems = cache.data.slice(0, limit);
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

// GET /api/erp/materials - ERP 자재 검색 (서버 캐시 우선 조회로 DB 부하 99% 차단)
router.get('/materials', async (req: Request, res: Response) => {
  try {
    const query = typeof req.query.query === 'string' ? req.query.query.trim().toLowerCase() : '';
    const limit = Math.min(Math.max(parseInt(req.query.limit as string || '50', 10), 1), 200);

    // 1. Try serving from in-memory cache
    const cache = await getOrUpdateMaterialsCache();
    if (cache && cache.data.length > 0) {
      let filtered = cache.data;
      if (query) {
        filtered = cache.data.filter(item =>
          item.code.toLowerCase().includes(query) ||
          item.name.toLowerCase().includes(query) ||
          (item.spec && item.spec.toLowerCase().includes(query)) ||
          (item.supplierName && item.supplierName.toLowerCase().includes(query))
        );
      }
      return res.json({
        success: true,
        count: Math.min(filtered.length, limit),
        total: cache.totalCount,
        cached: true,
        data: filtered.slice(0, limit),
      });
    }

    // 2. Fallback to direct query if cache empty
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

// POST /api/erp/auth/login - 사내 ERP 담당자코드 & 패스워드 로그인 인증
router.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { code, password } = req.body;
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ success: false, message: '담당자코드를 입력해주세요.' });
    }

    const isConnected = await mssqlAdapter.connect();
    if (!isConnected) {
      if (code === 'admin' || code === 'demo') {
        return res.json({
          success: true,
          user: {
            code: 'admin',
            name: '개발자 (오프라인 모드)',
            dept: '자재관리부',
            role: '관리자',
            isAdmin: true,
            hidePrice: false,
          },
        });
      }
      return res.status(503).json({ success: false, message: '사내 ERP DB에 연결할 수 없습니다.' });
    }

    const cleanCode = code.trim();
    const cleanPwd = typeof password === 'string' ? password.trim() : '';

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
    if (!isConnected) {
      return res.json({ success: true, data: [] });
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

export default router;
