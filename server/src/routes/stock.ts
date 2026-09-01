import { Router, Request, Response } from 'express';
import { getItemById, updateItem, createLog } from '../db';
import { StockActionType, StockLog } from '../types';

const router = Router();

interface StockInOutRequest {
  itemId: string;
  type: StockActionType;
  quantity: number;
  manager: string;
  reason: string;
  date?: string;
}

// POST /api/stock/in-out - 단일 품목 입고/출고/재고조정 트랜잭션
router.post('/in-out', (req: Request, res: Response) => {
  try {
    const { itemId, type, quantity, manager, reason, date } = req.body as StockInOutRequest;

    if (!itemId || !type || quantity === undefined || quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid input parameters' });
    }

    const item = getItemById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const previousQty = item.quantity;
    let newQty = previousQty;

    if (type === 'IN') {
      newQty = previousQty + quantity;
    } else if (type === 'OUT') {
      if (previousQty < quantity) {
        return res.status(400).json({
          success: false,
          message: `재고 부족: 현재 재고(${previousQty})보다 출고 수량(${quantity})이 많습니다.`,
        });
      }
      newQty = previousQty - quantity;
    } else if (type === 'ADJUST') {
      newQty = quantity;
    }

    const now = date ? new Date(date).toISOString() : new Date().toISOString();

    // 1. Update item quantity
    const updatedItem = updateItem(itemId, { quantity: newQty });

    // 2. Create stock log
    const log: StockLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      itemId: item.id,
      itemCode: item.code,
      itemName: item.name,
      type,
      quantity,
      previousQty,
      newQty,
      manager: manager || '미지정',
      reason: reason || '',
      timestamp: now,
    };
    const createdLog = createLog(log);

    res.json({
      success: true,
      data: {
        item: updatedItem,
        log: createdLog,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

interface BatchStockOutItem {
  id: string;
  stockOutQty: number;
}

interface BatchStockOutRequest {
  items: BatchStockOutItem[];
  manager: string;
  reason: string;
  date?: string;
}

// POST /api/stock/batch-out - 다중 품목 일괄 출고 트랜잭션
router.post('/batch-out', (req: Request, res: Response) => {
  try {
    const { items, manager, reason, date } = req.body as BatchStockOutRequest;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: '출고할 품목 목록이 비어있습니다.' });
    }

    // 1. 사전 유효성 검사 (모든 품목의 재고 충분 여부)
    for (const entry of items) {
      const item = getItemById(entry.id);
      if (!item) {
        return res.status(404).json({ success: false, message: `품목 ID(${entry.id})를 찾을 수 없습니다.` });
      }
      if (entry.stockOutQty <= 0) {
        return res.status(400).json({ success: false, message: `품목(${item.name})의 출고 수량이 올바르지 않습니다.` });
      }
      if (item.quantity < entry.stockOutQty) {
        return res.status(400).json({
          success: false,
          message: `재고 부족 [${item.code}] ${item.name}: 현재고 ${item.quantity}, 요청 ${entry.stockOutQty}`,
        });
      }
    }

    const timestamp = date ? new Date(date).toISOString() : new Date().toISOString();
    const updatedItems = [];
    const createdLogs = [];

    // 2. 출고 실행 및 로그 생성
    for (const entry of items) {
      const item = getItemById(entry.id)!;
      const previousQty = item.quantity;
      const newQty = previousQty - entry.stockOutQty;

      const updated = updateItem(item.id, { quantity: newQty });
      if (updated) updatedItems.push(updated);

      const log: StockLog = {
        id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        itemId: item.id,
        itemCode: item.code,
        itemName: item.name,
        type: 'OUT',
        quantity: entry.stockOutQty,
        previousQty,
        newQty,
        manager: manager || '미지정',
        reason: reason || '일괄 불출',
        timestamp,
      };
      createdLogs.push(createLog(log));
    }

    res.json({
      success: true,
      data: {
        updatedCount: updatedItems.length,
        items: updatedItems,
        logs: createdLogs,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
