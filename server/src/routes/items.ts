import { Router, Request, Response } from 'express';
import {
  getAllItems,
  getItemById,
  getItemByCode,
  createItem,
  updateItem,
  deleteItem,
  deleteItemsBatch,
  bulkUpsertItems,
  resetItemsToSample,
} from '../db';
import { InventoryItem } from '../types';

const router = Router();

// GET /api/items - 전체 품목 조회 또는 검색
router.get('/', (req: Request, res: Response) => {
  try {
    const { category, search, lowStock } = req.query;
    let items = getAllItems();

    if (category && category !== 'ALL') {
      items = items.filter((it) => it.category === category);
    }

    if (lowStock === 'true') {
      items = items.filter((it) => it.quantity <= it.safetyStock);
    }

    if (search && typeof search === 'string') {
      const q = search.trim().toLowerCase();
      items = items.filter(
        (it) =>
          it.code.toLowerCase().includes(q) ||
          it.name.toLowerCase().includes(q) ||
          (it.spec && it.spec.toLowerCase().includes(q)) ||
          (it.rackLocation && it.rackLocation.toLowerCase().includes(q)) ||
          (it.supplier && it.supplier.toLowerCase().includes(q)) ||
          (it.warehouse && it.warehouse.toLowerCase().includes(q))
      );
    }

    res.json({ success: true, count: items.length, data: items });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/items/find - 코드로 품목 단건 조회 (QR 스캔 딥링크용)
router.get('/find', (req: Request, res: Response) => {
  try {
    const { code, id } = req.query;
    if (id && typeof id === 'string') {
      const item = getItemById(id);
      if (item) return res.json({ success: true, data: item });
    }
    if (code && typeof code === 'string') {
      const item = getItemByCode(code);
      if (item) return res.json({ success: true, data: item });
    }
    return res.status(404).json({ success: false, message: 'Item not found' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/items/:id - ID로 단건 조회
router.get('/:id', (req: Request, res: Response) => {
  try {
    const item = getItemById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    res.json({ success: true, data: item });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/items - 신규 품목 등록
router.post('/', (req: Request, res: Response) => {
  try {
    const body = req.body as Partial<InventoryItem>;
    if (!body.code || !body.name) {
      return res.status(400).json({ success: false, message: 'Code and Name are required' });
    }

    const existing = getItemByCode(body.code);
    if (existing) {
      return res.status(409).json({ success: false, message: `중복된 품목코드(${body.code})가 이미 존재합니다.` });
    }

    const now = new Date().toISOString();
    const newItem: InventoryItem = {
      id: body.id || `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      code: body.code.trim().toUpperCase(),
      name: body.name.trim(),
      spec: body.spec || '',
      category: body.category || '기타',
      warehouse: body.warehouse || '미지정',
      rackLocation: body.rackLocation || '미입력',
      quantity: Number(body.quantity) || 0,
      unit: body.unit || 'EA',
      safetyStock: Number(body.safetyStock) || 0,
      price: Number(body.price) || 0,
      supplier: body.supplier || '',
      image: body.image,
      notes: body.notes || '',
      createdAt: body.createdAt || now,
      updatedAt: now,
      printCount: Number(body.printCount) || 0,
      isPrinted: !!body.isPrinted,
      lastPrintedAt: body.lastPrintedAt,
    };

    const created = createItem(newItem);
    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/items/:id - 품목 정보 수정
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body as Partial<InventoryItem>;

    // 만약 품목코드를 수정하는 경우 다른 품목과의 중복 여부 확인
    if (updates.code) {
      const existing = getItemByCode(updates.code);
      if (existing && existing.id !== id) {
        return res.status(409).json({ success: false, message: `이미 사용 중인 품목코드(${updates.code})입니다.` });
      }
    }

    const updated = updateItem(id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/items/:id - 단일 품목 삭제
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const success = deleteItem(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    res.json({ success: true, message: 'Item deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/items/batch-delete - 품목 일괄 삭제
router.post('/batch-delete', (req: Request, res: Response) => {
  try {
    const { ids } = req.body as { ids: string[] };
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or empty IDs array' });
    }

    const deletedCount = deleteItemsBatch(ids);
    res.json({ success: true, deletedCount });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/items/bulk - 대량 등록 / 엑셀 임포트
router.post('/bulk', (req: Request, res: Response) => {
  try {
    const { items, mode } = req.body as { items: InventoryItem[]; mode?: 'overwrite' | 'skip' | 'add_qty' };
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Items array is required' });
    }

    const result = bulkUpsertItems(items, mode || 'overwrite');
    res.json({ success: true, ...result, total: getAllItems().length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/items/reset-sample - 5,000건 샘플 데이터로 리셋
router.post('/reset-sample', (_req: Request, res: Response) => {
  try {
    const items = resetItemsToSample();
    res.json({ success: true, count: items.length, data: items });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
