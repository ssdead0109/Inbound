import { Router, Request, Response } from 'express';
import { getAllLogs, createLog, deleteLog } from '../db';
import { StockLog } from '../types';

const router = Router();

// GET /api/logs - 입출고 이력 목록 조회 (필터링 지원)
router.get('/', (req: Request, res: Response) => {
  try {
    const { itemId, itemCode, type } = req.query;
    let logs = getAllLogs();

    if (itemId && typeof itemId === 'string') {
      logs = logs.filter((l) => l.itemId === itemId);
    }
    if (itemCode && typeof itemCode === 'string') {
      const clean = itemCode.trim().toLowerCase();
      logs = logs.filter((l) => l.itemCode.toLowerCase() === clean);
    }
    if (type && typeof type === 'string' && type !== 'ALL') {
      logs = logs.filter((l) => l.type === type);
    }

    res.json({ success: true, count: logs.length, data: logs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/logs - 신규 이력 추가
router.post('/', (req: Request, res: Response) => {
  try {
    const body = req.body as Partial<StockLog>;
    if (!body.itemId || !body.itemCode || !body.type || body.quantity === undefined) {
      return res.status(400).json({ success: false, message: 'Invalid log payload' });
    }

    const newLog: StockLog = {
      id: body.id || `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      itemId: body.itemId,
      itemCode: body.itemCode,
      itemName: body.itemName || '',
      type: body.type,
      quantity: Number(body.quantity),
      previousQty: Number(body.previousQty) || 0,
      newQty: Number(body.newQty) || 0,
      manager: body.manager || '담당자 미지정',
      reason: body.reason || '',
      timestamp: body.timestamp || new Date().toISOString(),
    };

    const created = createLog(newLog);
    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/logs/:id - 이력 삭제
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const success = deleteLog(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Log not found' });
    }
    res.json({ success: true, message: 'Log deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
