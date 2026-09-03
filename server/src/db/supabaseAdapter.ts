import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { InboundSlip, InboundItem, InboundReceivePayload } from '../types/inbound';

dotenv.config();

let supabase: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  const url = process.env.SUPABASE_URL?.trim();
  const key = (process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)?.trim();
  return Boolean(url && key);
}

export function getSupabaseClient(): SupabaseClient | null {
  if (supabase) return supabase;
  const url = process.env.SUPABASE_URL?.trim();
  const key = (process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)?.trim();

  if (!url || !key) {
    return null;
  }

  try {
    supabase = createClient(url, key, {
      auth: { persistSession: false },
    });
    console.log(`[Supabase] Client initialized successfully (${url})`);
    return supabase;
  } catch (err) {
    console.error('[Supabase] Failed to initialize client:', err);
    return null;
  }
}

/**
 * Fetch all slips from Supabase
 */
export async function fetchSlipsFromSupabase(query?: string): Promise<InboundSlip[]> {
  const client = getSupabaseClient();
  if (!client) return [];

  try {
    let slipQuery = client
      .from('tb_inbound_slips')
      .select('*')
      .order('created_at', { ascending: false });

    if (query && query.trim()) {
      const q = query.trim();
      slipQuery = slipQuery.or(`slip_no.ilike.%${q}%,supplier_name.ilike.%${q}%,memo.ilike.%${q}%`);
    }

    const { data: slipsData, error: slipsError } = await slipQuery;
    if (slipsError) {
      console.error('[Supabase] Error fetching slips:', slipsError);
      return [];
    }

    if (!slipsData || slipsData.length === 0) return [];

    const slipNos = slipsData.map((s) => s.slip_no);
    const { data: itemsData, error: itemsError } = await client
      .from('tb_inbound_items')
      .select('*')
      .in('slip_no', slipNos);

    if (itemsError) {
      console.error('[Supabase] Error fetching items:', itemsError);
    }

    const itemsMap = new Map<string, InboundItem[]>();
    if (Array.isArray(itemsData)) {
      for (const row of itemsData) {
        const item: InboundItem = {
          id: row.row_id,
          itemCode: row.item_code,
          itemName: row.item_name,
          spec: row.spec || '',
          unit: row.unit || 'EA',
          orderQty: Number(row.order_qty || 0),
          receivedQty: Number(row.received_qty || 0),
          defectQty: Number(row.defect_qty || 0),
          defectReason: row.defect_reason || '',
          warehouse: row.warehouse || '특장자재창고',
          unitPrice: Number(row.unit_price || 0),
          status: row.item_status || 'WAITING',
          barcode: row.barcode || row.item_code,
          notes: row.notes || '',
        };
        const list = itemsMap.get(row.slip_no) || [];
        list.push(item);
        itemsMap.set(row.slip_no, list);
      }
    }

    return slipsData.map((s) => ({
      slipNo: s.slip_no,
      supplierCode: s.supplier_code || '',
      supplierName: s.supplier_name || '',
      poNumber: s.po_number || s.slip_no,
      deliveryDate: s.delivery_date || '',
      status: s.status || 'WAITING',
      totalItems: Number(s.total_items || 0),
      totalOrderedQty: Number(s.total_order_qty || 0),
      totalReceivedQty: Number(s.total_received_qty || 0),
      totalDefectQty: Number(s.total_defect_qty || 0),
      manager: s.manager || '',
      inboundDate: s.inbound_date || undefined,
      memo: s.memo || '',
      items: itemsMap.get(s.slip_no) || [],
      createdAt: s.created_at,
      updatedAt: s.updated_at,
    }));
  } catch (err) {
    console.error('[Supabase] Exception fetching slips:', err);
    return [];
  }
}

/**
 * Fetch single slip by slipNo from Supabase
 */
export async function fetchSlipByNoFromSupabase(slipNo: string): Promise<InboundSlip | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data: s, error: slipError } = await client
      .from('tb_inbound_slips')
      .select('*')
      .eq('slip_no', slipNo.trim())
      .single();

    if (slipError || !s) return null;

    const { data: itemsData } = await client
      .from('tb_inbound_items')
      .select('*')
      .eq('slip_no', slipNo.trim());

    const items: InboundItem[] = Array.isArray(itemsData)
      ? itemsData.map((row) => ({
          id: row.row_id,
          itemCode: row.item_code,
          itemName: row.item_name,
          spec: row.spec || '',
          unit: row.unit || 'EA',
          orderQty: Number(row.order_qty || 0),
          receivedQty: Number(row.received_qty || 0),
          defectQty: Number(row.defect_qty || 0),
          defectReason: row.defect_reason || '',
          warehouse: row.warehouse || '특장자재창고',
          unitPrice: Number(row.unit_price || 0),
          status: row.item_status || 'WAITING',
          barcode: row.barcode || row.item_code,
          notes: row.notes || '',
        }))
      : [];

    return {
      slipNo: s.slip_no,
      supplierCode: s.supplier_code || '',
      supplierName: s.supplier_name || '',
      poNumber: s.po_number || s.slip_no,
      deliveryDate: s.delivery_date || '',
      status: s.status || 'WAITING',
      totalItems: Number(s.total_items || items.length),
      totalOrderedQty: Number(s.total_order_qty || 0),
      totalReceivedQty: Number(s.total_received_qty || 0),
      totalDefectQty: Number(s.total_defect_qty || 0),
      manager: s.manager || '',
      inboundDate: s.inbound_date || undefined,
      memo: s.memo || '',
      items,
      createdAt: s.created_at,
      updatedAt: s.updated_at,
    };
  } catch (err) {
    console.error('[Supabase] Error fetching slip by no:', err);
    return null;
  }
}

/**
 * Upsert slip into Supabase
 */
export async function upsertSlipToSupabase(slip: InboundSlip): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error: slipErr } = await client.from('tb_inbound_slips').upsert(
      {
        slip_no: slip.slipNo,
        supplier_code: slip.supplierCode,
        supplier_name: slip.supplierName,
        po_number: slip.poNumber,
        delivery_date: slip.deliveryDate || null,
        status: slip.status,
        total_items: slip.totalItems,
        total_order_qty: slip.totalOrderedQty,
        total_received_qty: slip.totalReceivedQty,
        total_defect_qty: slip.totalDefectQty,
        manager: slip.manager || null,
        inbound_date: slip.inboundDate || null,
        memo: slip.memo || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'slip_no' }
    );

    if (slipErr) {
      console.error('[Supabase] Error upserting slip:', slipErr);
      return false;
    }

    if (Array.isArray(slip.items) && slip.items.length > 0) {
      const itemsPayload = slip.items.map((it) => ({
        row_id: it.id,
        slip_no: slip.slipNo,
        item_code: it.itemCode,
        item_name: it.itemName,
        spec: it.spec || '',
        unit: it.unit || 'EA',
        order_qty: it.orderQty,
        received_qty: it.receivedQty,
        defect_qty: it.defectQty,
        defect_reason: it.defectReason || '',
        warehouse: it.warehouse || '특장자재창고',
        unit_price: it.unitPrice || 0,
        item_status: it.status || 'WAITING',
        barcode: it.barcode || it.itemCode,
        notes: it.notes || '',
        updated_at: new Date().toISOString(),
      }));

      const { error: itemsErr } = await client
        .from('tb_inbound_items')
        .upsert(itemsPayload, { onConflict: 'row_id' });

      if (itemsErr) {
        console.error('[Supabase] Error upserting items:', itemsErr);
      }
    }

    return true;
  } catch (err) {
    console.error('[Supabase] Exception upserting slip:', err);
    return false;
  }
}

/**
 * Process inbound receiving in Supabase
 */
export async function processInboundReceiveInSupabase(
  payload: InboundReceivePayload
): Promise<InboundSlip | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const slip = await fetchSlipByNoFromSupabase(payload.slipNo);
    if (!slip) return null;

    let totalRec = 0;
    let totalDef = 0;
    const now = new Date().toISOString();

    for (const it of payload.items) {
      const defQty = it.defectQty || 0;
      totalRec += it.receivedQty;
      totalDef += defQty;

      await client
        .from('tb_inbound_items')
        .update({
          received_qty: it.receivedQty,
          defect_qty: defQty,
          defect_reason: it.defectReason || '',
          warehouse: it.warehouse,
          item_status: defQty > 0 && it.receivedQty === 0 ? 'DEFECT' : 'COMPLETED',
          updated_at: now,
        })
        .eq('row_id', it.id);

      // Log stock movement
      await client.from('tb_stock_logs').insert({
        log_id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        item_code: it.itemCode,
        action_type: 'IN',
        quantity: it.receivedQty,
        manager: payload.manager,
        reason: `입고 검수 [전표: ${payload.slipNo}]`,
        log_timestamp: now,
      });
    }

    const nextStatus = totalDef > 0 && totalRec === 0 ? 'HOLD' : 'COMPLETED';

    await client
      .from('tb_inbound_slips')
      .update({
        status: nextStatus,
        manager: payload.manager,
        inbound_date: now,
        total_received_qty: totalRec,
        total_defect_qty: totalDef,
        memo: payload.memo ? `${slip.memo || ''} [${payload.memo}]`.trim() : slip.memo,
        updated_at: now,
      })
      .eq('slip_no', payload.slipNo);

    return await fetchSlipByNoFromSupabase(payload.slipNo);
  } catch (err) {
    console.error('[Supabase] Receive processing error:', err);
    return null;
  }
}

/**
 * Fetch ERP material masters from Supabase (tb_items with fallback to tb_inbound_items)
 */
export async function fetchMaterialsFromSupabase(): Promise<any[]> {
  const client = getSupabaseClient();
  if (!client) return [];

  try {
    // 1. Try fetching from tb_items
    const { data: items, error: itemsErr } = await client
      .from('tb_items')
      .select('*')
      .order('code', { ascending: true });

    if (!itemsErr && Array.isArray(items) && items.length > 0) {
      return items.map((it) => ({
        code: it.code,
        name: it.name,
        spec: it.spec || '',
        unit: it.unit || 'EA',
        unitPrice: Number(it.price || 0),
        safetyStock: Number(it.safety_stock || 0),
        currentStock: Number(it.quantity || 0),
        whCode: it.warehouse || '특장자재창고',
        whName: it.warehouse || '특장자재창고',
        zone: it.rack_location || 'A-01-01',
        supplierName: it.supplier || '',
      }));
    }

    // 2. Fallback: extract distinct materials from tb_inbound_items
    const { data: inItems } = await client
      .from('tb_inbound_items')
      .select('item_code, item_name, spec, unit, unit_price, warehouse')
      .limit(500);

    if (Array.isArray(inItems) && inItems.length > 0) {
      const map = new Map<string, any>();
      for (const it of inItems) {
        if (!it.item_code || map.has(it.item_code)) continue;
        map.set(it.item_code, {
          code: it.item_code,
          name: it.item_name,
          spec: it.spec || '',
          unit: it.unit || 'EA',
          unitPrice: Number(it.unit_price || 0),
          safetyStock: 5,
          currentStock: 10,
          whCode: it.warehouse || '특장자재창고',
          whName: it.warehouse || '특장자재창고',
          zone: 'A-01-01',
          supplierName: '',
        });
      }
      return Array.from(map.values());
    }

    return [];
  } catch (err) {
    console.error('[Supabase] Error fetching materials:', err);
    return [];
  }
}

/**
 * Fetch ERP purchase orders from Supabase (tb_purchase_orders)
 */
export async function fetchPurchaseOrdersFromSupabase(
  query: string = '',
  status: string = 'ALL',
  limit: number = 60,
  offset: number = 0
): Promise<{ rows: any[]; total: number }> {
  const client = getSupabaseClient();
  if (!client) return { rows: [], total: 0 };

  try {
    let q = client
      .from('tb_purchase_orders')
      .select('*', { count: 'exact' })
      .order('po_no', { ascending: false });

    if (status && status !== 'ALL') {
      q = q.eq('status', status);
    }

    if (query && query.trim()) {
      const kw = query.trim();
      q = q.or(
        `po_no.ilike.%${kw}%,supplier_name.ilike.%${kw}%,item_name.ilike.%${kw}%,item_code.ilike.%${kw}%`
      );
    }

    q = q.range(offset, offset + limit - 1);

    const { data, count, error } = await q;
    if (error) {
      console.error('[Supabase] Error fetching purchase orders:', error);
      return { rows: [], total: 0 };
    }

    const rows = (data || []).map((r) => ({
      poNo: r.po_no,
      poDate: r.po_date || '',
      deliveryDate: r.delivery_date || '',
      supplierCode: r.supplier_code || '',
      supplierName: r.supplier_name || '',
      warehouseName: r.warehouse_name || '',
      itemCode: r.item_code,
      itemName: r.item_name,
      itemSpec: r.item_spec || '',
      unit: r.unit || 'EA',
      poQty: Number(r.po_qty || 0),
      receivedQty: Number(r.received_qty || 0),
      remainQty: Number(r.remain_qty || 0),
      unitPrice: Number(r.unit_price || 0),
      totalAmount: Number(r.total_amount || 0),
      remarks: r.remarks || '',
      status: r.status || 'WAITING',
    }));

    return { rows, total: count || rows.length };
  } catch (err) {
    console.error('[Supabase] Exception fetching purchase orders:', err);
    return { rows: [], total: 0 };
  }
}

