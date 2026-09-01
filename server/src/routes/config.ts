import { Router, Request, Response } from 'express';
import { getLabelConfig, updateLabelConfig } from '../db';
import { LabelPrintConfig } from '../types';

const router = Router();

// GET /api/config/label - 라벨 설정 조회
router.get('/label', (_req: Request, res: Response) => {
  try {
    const config = getLabelConfig();
    res.json({ success: true, data: config });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/config/label - 라벨 설정 업데이트
router.post('/label', (req: Request, res: Response) => {
  try {
    const newConfig = req.body as LabelPrintConfig;
    const updated = updateLabelConfig(newConfig);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
