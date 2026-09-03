import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), 'server/data');
const OUT_SQL = path.resolve(process.cwd(), 'server/database/supabase_items_seed.sql');

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

  const itemsMap = new Map();

  // 1. Extract real ERP materials from 100 slips
  for (const s of slips) {
    if (!Array.isArray(s.items)) continue;
    for (const it of s.items) {
      if (!it.itemCode || itemsMap.has(it.itemCode)) continue;
      itemsMap.set(it.itemCode, {
        id: `item-${it.itemCode}`,
        code: it.itemCode,
        name: it.itemName,
        spec: it.spec || '',
        category: it.itemName.includes('CYLINDER') ? '실린더' : it.itemName.includes('VALVE') ? '밸브' : '일반부품',
        warehouse: it.warehouse || '화성부품영업창고',
        rackLocation: 'A-01-01',
        quantity: it.orderQty || 10,
        unit: it.unit || 'EA',
        safetyStock: 5,
        price: it.unitPrice || 0,
        supplier: s.supplierName || '',
        notes: s.memo || '',
      });
    }
  }

  let sql = `-- ==========================================================
-- SmartRack / ERP Materials Master Initial Seed Data (tb_items)
-- 142건의 실제 ERP 자재 마스터 품목 데이터 (코드, 품명, 규격, 단가, 창고)
-- 실행방법: Supabase 대시보드 -> SQL Editor에 붙여넣고 [Run] 실행
-- ==========================================================

BEGIN;

`;

  for (const it of itemsMap.values()) {
    sql += `INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  ${escapeSql(it.id)}, ${escapeSql(it.code)}, ${escapeSql(it.name)}, ${escapeSql(it.spec)},
  ${escapeSql(it.category)}, ${escapeSql(it.warehouse)}, ${escapeSql(it.rackLocation)}, ${it.quantity},
  ${escapeSql(it.unit)}, ${it.safetyStock}, ${it.price}, ${escapeSql(it.supplier)}, ${escapeSql(it.notes)}
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;\n`;
  }

  sql += `\nCOMMIT;\n`;

  fs.writeFileSync(OUT_SQL, sql, 'utf8');
  console.log(`[Item Seed Generator] Generated ${OUT_SQL} with ${itemsMap.size} real materials.`);
}

run();
