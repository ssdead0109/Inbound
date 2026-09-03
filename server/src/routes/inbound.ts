import { Router, Request, Response } from 'express';
import {
  getAllInboundSlips,
  getInboundSlipByNo,
  getInboundSlipsWithSupabaseFallback,
  getInboundSlipByNoAsync,
  createInboundSlip,
  updateInboundSlipStatus,
  processInboundReceiving,
  cancelInboundReceiving,
  getInboundStats,
  getWarehouses,
  INITIAL_INBOUND_SLIPS,
  saveInboundToDisk,
} from '../db/inboundDb';
import { InboundReceivePayload, InboundSlip } from '../types/inbound';
import { mssqlAdapter } from '../db/mssqlAdapter';

const router = Router();

// GET /api/inbound/warehouses - 입고 가능 창고 목록 조회
router.get('/warehouses', (_req: Request, res: Response) => {
  try {
    const warehouses = getWarehouses();
    res.json({ success: true, data: warehouses });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/inbound/stats - 입고 대시보드 통계
router.get('/stats', (_req: Request, res: Response) => {
  try {
    const isDbConnected = mssqlAdapter.getStatus().isConnected && !mssqlAdapter.isDummyMode;
    const stats = getInboundStats(isDbConnected);
    res.json({ success: true, data: stats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/inbound/slips - 납품확인서 목록 조회 & 필터
router.get('/slips', async (req: Request, res: Response) => {
  try {
    const { status, startDate, endDate, supplier, query, includeDummy } = req.query;
    const isDbConnected = mssqlAdapter.getStatus().isConnected && !mssqlAdapter.isDummyMode;
    const excludeDummy = isDbConnected && includeDummy !== 'true';

    const slips = await getInboundSlipsWithSupabaseFallback({
      status: status as string,
      startDate: startDate as string,
      endDate: endDate as string,
      supplier: supplier as string,
      query: query as string,
    });
    res.json({ success: true, count: slips.length, data: slips });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/inbound/slips/:slipNo - 단일 납품확인서 상세 조회 (QR 스캔 시 호출)
router.get('/slips/:slipNo', async (req: Request, res: Response) => {
  try {
    const { slipNo } = req.params;
    const slip = await getInboundSlipByNoAsync(slipNo);

    if (!slip) {
      return res.status(404).json({
        success: false,
        message: `납품확인서 [${slipNo}]를 찾을 수 없습니다. ERP 등록 여부를 확인해주세요.`,
      });
    }

    res.json({ success: true, data: slip });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/inbound/receive - 입고 검수 및 확정 트랜잭션
router.post('/receive', (req: Request, res: Response) => {
  try {
    const payload = req.body as InboundReceivePayload;

    if (!payload.slipNo || !Array.isArray(payload.items)) {
      return res.status(400).json({
        success: false,
        message: '전표번호(slipNo)와 검수 품목 목록(items)은 필수입니다.',
      });
    }

    const result = processInboundReceiving(payload);
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      message: result.message,
      data: {
        slip: result.slip,
        updatedStockCount: result.updatedStockCount,
        logs: result.logs,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/inbound/slips/:slipNo/cancel - 입고 확정 취소 및 재고 롤백
router.post('/slips/:slipNo/cancel', (req: Request, res: Response) => {
  try {
    const { slipNo } = req.params;
    const result = cancelInboundReceiving(slipNo);
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/inbound/slips - 신규 납품확인서 등록 / 시뮬레이터 전표 생성
router.post('/slips', (req: Request, res: Response) => {
  try {
    const slipData = req.body as Partial<InboundSlip>;

    if (!slipData.slipNo || !slipData.supplierName || !Array.isArray(slipData.items)) {
      return res.status(400).json({
        success: false,
        message: '전표번호, 공급처명, 품목 목록은 필수 입력 항목입니다.',
      });
    }

    const totalOrderedQty = slipData.items.reduce((sum, it) => sum + (it.orderQty || 0), 0);
    const newSlip: InboundSlip = {
      slipNo: slipData.slipNo.trim(),
      supplierCode: slipData.supplierCode || 'SUP-NEW',
      supplierName: slipData.supplierName.trim(),
      poNumber: slipData.poNumber,
      deliveryDate: slipData.deliveryDate || new Date().toISOString().slice(0, 10),
      status: slipData.status || 'WAITING',
      totalItems: slipData.items.length,
      totalOrderedQty,
      totalReceivedQty: 0,
      totalDefectQty: 0,
      memo: slipData.memo || '',
      items: slipData.items.map((it, idx) => ({
        id: it.id || `item-${Date.now()}-${idx}`,
        itemCode: it.itemCode.trim(),
        itemName: it.itemName.trim(),
        spec: it.spec || '',
        unit: it.unit || 'EA',
        orderQty: it.orderQty || 1,
        receivedQty: it.receivedQty || it.orderQty || 1,
        defectQty: 0,
        warehouse: it.warehouse || '특장자재창고',
        unitPrice: it.unitPrice || 0,
        status: 'WAITING',
        barcode: it.barcode || it.itemCode,
        notes: it.notes || '',
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const created = createInboundSlip(newSlip);
    res.json({
      success: true,
      message: `납품확인서 [${created.slipNo}]가 성공적으로 등록되었습니다.`,
      data: created,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/inbound/slips/:slipNo/status - 상태 변경 (보류/취소/검수중)
router.put('/slips/:slipNo/status', (req: Request, res: Response) => {
  try {
    const { slipNo } = req.params;
    const { status, memo } = req.body;

    const updated = updateInboundSlipStatus(slipNo, status, memo);
    if (!updated) {
      return res.status(404).json({ success: false, message: '납품확인서를 찾을 수 없습니다.' });
    }

    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/inbound/mssql/status - MSSQL 서버 연동 상태 확인
router.get('/mssql/status', (_req: Request, res: Response) => {
  const status = mssqlAdapter.getStatus();
  res.json({ success: true, data: status });
});

// POST /api/inbound/reset-samples - 초기 샘플 데이터 복원
router.post('/reset-samples', (_req: Request, res: Response) => {
  try {
    const fresh = JSON.parse(JSON.stringify(INITIAL_INBOUND_SLIPS));
    // Overwrite cache
    fresh.forEach((s: InboundSlip) => createInboundSlip(s));
    res.json({ success: true, message: '샘플 납품확인서 데이터가 초기화되었습니다.', data: fresh });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
