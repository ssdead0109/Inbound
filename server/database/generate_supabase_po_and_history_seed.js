import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), 'server/data');
const OUT_PO_SQL = path.resolve(process.cwd(), 'server/database/supabase_po_and_history_seed.sql');

function escapeSql(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val;
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  const str = String(val).replace(/'/g, "''");
  return `'${str}'`;
}

function run() {
  const slipsFile = path.join(DATA_DIR, 'inbound_slips.json');
  let slips = [];
  if (fs.existsSync(slipsFile)) {
    slips = JSON.parse(fs.readFileSync(slipsFile, 'utf8'));
  }

  let sql = `-- ==========================================================
-- SmartRack / ERP 발주내역(tb_purchase_orders) 및 입고완료내역 시드
-- 실행방법: Supabase 대시보드 -> SQL Editor에 붙여넣고 [Run] 실행
-- ==========================================================

BEGIN;

-- 1. 발주 내역 (tb_purchase_orders - 206개 발주 품목)
`;

  let poCount = 0;
  for (const s of slips) {
    if (!Array.isArray(s.items)) continue;
    const poNo = s.poNumber || s.slipNo;
    const poDate = s.deliveryDate ? s.deliveryDate : '2026-08-15';
    const deliveryDate = s.deliveryDate || poDate;
    const supplierCode = s.supplierCode || '';
    const supplierName = s.supplierName || '';

    for (let idx = 0; idx < s.items.length; idx++) {
      const it = s.items[idx];
      const poItemId = `PO_${poNo}_${it.itemCode}_${idx + 1}`;
      const poQty = Number(it.orderQty || 1);
      const receivedQty = Number(it.receivedQty || 0);
      const remainQty = Math.max(0, poQty - receivedQty);
      const unitPrice = Number(it.unitPrice || 0);
      const totalAmount = poQty * unitPrice;
      const remarks = it.notes || s.memo || '';
      const status = receivedQty >= poQty && poQty > 0 ? 'COMPLETED' : receivedQty > 0 ? 'PARTIAL' : 'WAITING';

      sql += `INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  ${escapeSql(poItemId)}, ${escapeSql(poNo)}, ${escapeSql(poDate)}, ${escapeSql(deliveryDate)},
  ${escapeSql(supplierCode)}, ${escapeSql(supplierName)}, ${escapeSql(it.warehouse || '특장자재창고')},
  ${escapeSql(it.itemCode)}, ${escapeSql(it.itemName)}, ${escapeSql(it.spec || '')},
  ${escapeSql(it.unit || 'EA')}, ${poQty}, ${receivedQty}, ${remainQty},
  ${unitPrice}, ${totalAmount}, ${escapeSql(remarks)}, ${escapeSql(status)}
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;\n`;
      poCount++;
    }
  }

  sql += `\n-- 2. 입고완료 내역 시드 (100건 중 45건을 COMPLETED 및 PARTIAL 상태로 갱신하여 [입고내역] 화면에 표시)\n`;

  // Update 45 slips to COMPLETED or PARTIAL
  for (let i = 0; i < Math.min(slips.length, 45); i++) {
    const s = slips[i];
    const isCompleted = i % 5 !== 0; // 80% COMPLETED, 20% PARTIAL
    const slipStatus = isCompleted ? 'COMPLETED' : 'PARTIAL';
    const manager = s.manager || (i % 2 === 0 ? '이병훈' : '안성규');
    const inboundDate = '2026-09-02T09:30:00.000Z';

    let totalRec = 0;
    if (Array.isArray(s.items)) {
      for (const it of s.items) {
        const orderQty = Number(it.orderQty || 1);
        const recQty = isCompleted ? orderQty : Math.floor(orderQty / 2);
        totalRec += recQty;

        sql += `UPDATE public.tb_inbound_items SET
  received_qty = ${recQty},
  item_status = ${isCompleted ? "'COMPLETED'" : "'CHECKED'"},
  updated_at = ${escapeSql(inboundDate)}
WHERE row_id = ${escapeSql(it.id)};\n`;
      }
    }

    sql += `UPDATE public.tb_inbound_slips SET
  status = ${escapeSql(slipStatus)},
  manager = ${escapeSql(manager)},
  inbound_date = ${escapeSql(inboundDate)},
  total_received_qty = ${totalRec},
  updated_at = ${escapeSql(inboundDate)}
WHERE slip_no = ${escapeSql(s.slipNo)};\n`;
  }

  sql += `\nCOMMIT;\n`;

  fs.writeFileSync(OUT_PO_SQL, sql, 'utf8');
  console.log(`[PO & History Seed Generator] Generated ${OUT_PO_SQL} (${poCount} PO items)`);
}

run();
