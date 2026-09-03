import express from 'express';
import {
  getQrToken,
  createOrGetQrToken,
  batchGetOrCreateTokens,
  deactivateQrToken,
  QrType,
} from '../db/qrTokenDb';

const router = express.Router();

/**
 * GET /api/qr/:token
 * Look up token details (Type, targetId, metadata)
 */
router.get('/:token', (req, res) => {
  const { token } = req.params;
  const record = getQrToken(token);

  if (!record) {
    return res.status(404).json({
      success: false,
      error: `존재하지 않거나 만료된 QR 토큰입니다: [${token}]`,
    });
  }

  res.json({
    success: true,
    data: record,
  });
});

/**
 * POST /api/qr/token
 * Generate or get existing token for type + targetId
 */
router.post('/token', (req, res) => {
  const { type, targetId, metadata } = req.body;

  if (!type || !targetId) {
    return res.status(400).json({
      success: false,
      error: 'type과 targetId는 필수 항목입니다.',
    });
  }

  const validTypes: QrType[] = ['INBOUND', 'ITEM', 'RACK', 'VEHICLE', 'WORK_ORDER'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({
      success: false,
      error: `유효하지 않은 QR 타입입니다: ${type}. (지원: ${validTypes.join(', ')})`,
    });
  }

  const record = createOrGetQrToken(type, targetId, metadata);
  res.json({
    success: true,
    data: record,
  });
});

/**
 * POST /api/qr/batch
 * Batch generate or get tokens
 */
router.post('/batch', (req, res) => {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'items 배열이 비어있습니다.',
    });
  }

  const records = batchGetOrCreateTokens(items);
  res.json({
    success: true,
    data: records,
  });
});

/**
 * DELETE /api/qr/:token
 * Deactivate token
 */
router.delete('/:token', (req, res) => {
  const { token } = req.params;
  const success = deactivateQrToken(token);

  if (!success) {
    return res.status(404).json({
      success: false,
      error: '토큰을 찾을 수 없습니다.',
    });
  }

  res.json({
    success: true,
    message: `토큰 [${token}]이(가) 비활성화되었습니다.`,
  });
});

export default router;
