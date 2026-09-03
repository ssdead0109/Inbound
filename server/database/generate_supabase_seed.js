import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), 'server/data');
const OUT_SQL = path.resolve(process.cwd(), 'server/database/supabase_seed.sql');

function escapeSql(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val;
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  const str = String(val).replace(/'/g, "''");
  return `'${str}'`;
}

function run() {
  const slipsFile = path.join(DATA_DIR, 'inbound_slips.json');
  const usersFile = path.join(DATA_DIR, 'cached_users.json');

  let slips = [];
  if (fs.existsSync(slipsFile)) {
    slips = JSON.parse(fs.readFileSync(slipsFile, 'utf8'));
  }

  let users = [];
  if (fs.existsSync(usersFile)) {
    users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
  }

  let sql = `-- ==========================================================
-- SmartRack / Inbound - Supabase Initial Seed Data
-- 100건의 실제 ERP 납품서 전표 및 206개 품목 데이터 + 계정
-- 실행방법: Supabase SQL Editor에 붙여넣고 [Run] 실행
-- ==========================================================

BEGIN;

-- 1. 사용자 계정 시드
`;

  for (const u of users) {
    sql += `INSERT INTO public.tb_users (code, name, dept, role, is_admin, hide_price, password_hash, pda_pwd)
VALUES (${escapeSql(u.code)}, ${escapeSql(u.name)}, ${escapeSql(u.dept)}, ${escapeSql(u.role)}, ${u.isAdmin ? 'TRUE' : 'FALSE'}, ${u.hidePrice ? 'TRUE' : 'FALSE'}, ${escapeSql(u.passwordHash)}, ${escapeSql(u.pdaPwd)})
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  dept = EXCLUDED.dept,
  role = EXCLUDED.role,
  is_admin = EXCLUDED.is_admin,
  password_hash = EXCLUDED.password_hash,
  pda_pwd = EXCLUDED.pda_pwd;\n`;
  }

  sql += `\n-- 2. 납품확인서 전표 마스터 (100건)\n`;

  for (const s of slips) {
    sql += `INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  ${escapeSql(s.slipNo)}, ${escapeSql(s.supplierCode || '')}, ${escapeSql(s.supplierName || '')},
  ${escapeSql(s.poNumber || s.slipNo)}, ${s.deliveryDate ? escapeSql(s.deliveryDate) : 'NULL'},
  ${escapeSql(s.status || 'WAITING')}, ${s.totalItems || (s.items?.length || 0)},
  ${s.totalOrderedQty || 0}, ${s.totalReceivedQty || 0}, ${s.totalDefectQty || 0},
  ${escapeSql(s.manager || '')}, ${escapeSql(s.memo || '')},
  ${escapeSql(s.createdAt || new Date().toISOString())}, ${escapeSql(s.updatedAt || new Date().toISOString())}
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;\n`;
  }

  sql += `\n-- 3. 납품서 상세 품목 (206건)\n`;

  for (const s of slips) {
    if (!Array.isArray(s.items)) continue;
    for (const it of s.items) {
      sql += `INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  ${escapeSql(it.id)}, ${escapeSql(s.slipNo)}, ${escapeSql(it.itemCode)}, ${escapeSql(it.itemName)},
  ${escapeSql(it.spec || '')}, ${escapeSql(it.unit || 'EA')}, ${it.orderQty || 0}, ${it.receivedQty || 0},
  ${it.defectQty || 0}, ${escapeSql(it.defectReason || '')}, ${escapeSql(it.warehouse || '특장자재창고')},
  ${it.unitPrice || 0}, ${escapeSql(it.status || 'WAITING')}, ${escapeSql(it.barcode || it.itemCode)},
  ${escapeSql(it.notes || '')}, ${escapeSql(it.createdAt || s.createdAt || new Date().toISOString())},
  ${escapeSql(it.updatedAt || s.updatedAt || new Date().toISOString())}
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;\n`;
    }
  }

  sql += `\nCOMMIT;\n`;

  fs.writeFileSync(OUT_SQL, sql, 'utf8');
  console.log(`[Seed Generator] Generated ${OUT_SQL} (${slips.length} slips, users: ${users.length})`);
}

run();
