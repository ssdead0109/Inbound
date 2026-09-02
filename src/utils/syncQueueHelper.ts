/**
 * SmartRack / Inbound - Offline Sync Queue Helper
 * 오프라인 입고 확정 트랜잭션 대기 큐 및 DB 복구 시 자동/수동 동기화 관리 모듈
 */

import {
  SyncQueueItem,
  enqueueSyncItem,
  getQueueItems,
  updateQueueItem,
  removeQueueItem,
  clearCompletedQueueItems,
  saveSlipToIndexedDb,
  getSlipByNoFromIndexedDb
} from './indexedDbHelper';
import { InboundReceivePayload, InboundSlip } from '../types/inbound';
import { processErpInboundReceive, fetchErpStatus, cancelErpInboundReceive } from '../api/erpApi';
import { processInboundReceive as processLocalReceive, cancelInboundSlipApi } from '../api/inbound';
import { soundHelper } from './soundHelper';

export const SYNC_QUEUE_CHANGE_EVENT = 'smartrack:sync-queue-changed';

export function notifyQueueChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(SYNC_QUEUE_CHANGE_EVENT));
  }
}

export function subscribeToQueueChanges(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(SYNC_QUEUE_CHANGE_EVENT, callback);
  return () => window.removeEventListener(SYNC_QUEUE_CHANGE_EVENT, callback);
}

let isSyncingInProgress = false;

export function isQueueSyncing(): boolean {
  return isSyncingInProgress;
}

/**
 * 오프라인 상태에서 입고 확정 시:
 * 1. 로컬 SmartRack 재고에 즉시 반영
 * 2. IndexedDB 대기 큐(sync_queue)에 안전하게 Enqueue
 * 3. 로컬 캐시 전표 상태를 SYNC_PENDING으로 갱신
 */
export async function queueInboundReceive(
  payload: InboundReceivePayload,
  operator: string,
  slipData?: InboundSlip
): Promise<{ queueItem: SyncQueueItem; localSlip: InboundSlip }> {
  const now = new Date().toISOString();
  const queueId = `sync-inb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  // 1. Local SmartRack storage update (로컬 재고 및 로그 우선 반영)
  let updatedLocalSlip: InboundSlip;
  try {
    const localRes = await processLocalReceive(payload);
    updatedLocalSlip = localRes.slip;
  } catch (localErr) {
    // If local server receive endpoint was unreachable, construct slip state directly
    if (slipData) {
      updatedLocalSlip = {
        ...slipData,
        status: 'COMPLETED',
        inboundDate: now,
        updatedAt: now,
        memo: payload.memo || slipData.memo || '오프라인 현장 입고',
      };
    } else {
      updatedLocalSlip = {
        slipNo: payload.slipNo,
        supplierCode: 'SUP-ERP',
        supplierName: 'ERP 입고 거래처',
        deliveryDate: now.slice(0, 10),
        status: 'COMPLETED',
        totalItems: payload.items.length,
        totalOrderedQty: payload.items.reduce((s, it) => s + it.receivedQty, 0),
        totalReceivedQty: payload.items.reduce((s, it) => s + it.receivedQty, 0),
        totalDefectQty: payload.items.reduce((s, it) => s + (it.defectQty || 0), 0),
        manager: operator,
        items: [],
        createdAt: now,
        updatedAt: now,
        inboundDate: now,
      };
    }
  }

  // 2. Cache updated slip to IndexedDB
  await saveSlipToIndexedDb(updatedLocalSlip);

  // 3. Create Queue Item
  const totalQty = payload.items.reduce((sum, it) => sum + (it.receivedQty || 0), 0);
  const queueItem: SyncQueueItem = {
    id: queueId,
    type: 'INBOUND_RECEIVE',
    slipNo: payload.slipNo,
    title: `[입고확정] 전표 ${payload.slipNo} (${payload.items.length}개 품목, ${totalQty}개)`,
    payload,
    createdAt: now,
    status: 'PENDING',
    retryCount: 0,
    operator,
  };

  await enqueueSyncItem(queueItem);
  notifyQueueChanged();

  return { queueItem, localSlip: updatedLocalSlip };
}

/**
 * 대기 큐 전체 동기화 실행 (순차 처리)
 */
export async function processSyncQueue(): Promise<{
  total: number;
  succeeded: number;
  failed: number;
  remaining: number;
}> {
  if (isSyncingInProgress) {
    const currentItems = await getQueueItems();
    return {
      total: currentItems.length,
      succeeded: 0,
      failed: 0,
      remaining: currentItems.filter((i) => i.status === 'PENDING' || i.status === 'FAILED').length,
    };
  }

  // Check if ERP MSSQL is reachable
  try {
    const status = await fetchErpStatus();
    if (!status?.isConnected) {
      const items = await getQueueItems();
      const pendingCount = items.filter((i) => i.status !== 'SUCCESS').length;
      return { total: items.length, succeeded: 0, failed: 0, remaining: pendingCount };
    }
  } catch {
    const items = await getQueueItems();
    return { total: items.length, succeeded: 0, failed: 0, remaining: items.length };
  }

  isSyncingInProgress = true;
  notifyQueueChanged();
  let succeeded = 0;
  let failed = 0;

  try {
    const allItems = await getQueueItems();
    const pendingItems = allItems.filter((it) => it.status === 'PENDING' || it.status === 'FAILED');

    for (const item of pendingItems) {
      item.status = 'SYNCING';
      await updateQueueItem(item);
      notifyQueueChanged();

      try {
        if (item.type === 'INBOUND_RECEIVE') {
          // Process MSSQL MT_T_입출고 insert
          await processErpInboundReceive(item.payload);

          // Mark slip as completed in IndexedDB
          const cachedSlip = await getSlipByNoFromIndexedDb(item.slipNo);
          if (cachedSlip) {
            cachedSlip.status = 'COMPLETED';
            cachedSlip.updatedAt = new Date().toISOString();
            await saveSlipToIndexedDb(cachedSlip);
          }

          item.status = 'SUCCESS';
          item.errorMessage = undefined;
          await updateQueueItem(item);
          succeeded++;
        }
      } catch (err: any) {
        console.error(`[SyncQueue] Failed syncing ${item.id}:`, err);
        item.retryCount = (item.retryCount || 0) + 1;
        item.status = 'FAILED';
        item.errorMessage = err.message || 'ERP 입고 처리 실패';
        await updateQueueItem(item);
        failed++;
      }

      notifyQueueChanged();
    }

    // Auto clean up completed items after slight delay
    setTimeout(() => {
      clearCompletedQueueItems().then(() => notifyQueueChanged()).catch(() => {});
    }, 3000);

    const remainingItems = await getQueueItems();
    const remaining = remainingItems.filter((i) => i.status !== 'SUCCESS').length;

    if (succeeded > 0) {
      soundHelper.playSuccessChime();
    }

    return {
      total: pendingItems.length,
      succeeded,
      failed,
      remaining,
    };
  } finally {
    isSyncingInProgress = false;
    notifyQueueChanged();
  }
}

/**
 * 개별 대기 큐 항목 단건 재시도
 */
export async function retrySingleQueueItem(id: string): Promise<boolean> {
  const items = await getQueueItems();
  const target = items.find((it) => it.id === id);
  if (!target) return false;

  isSyncingInProgress = true;
  target.status = 'SYNCING';
  await updateQueueItem(target);
  notifyQueueChanged();

  try {
    if (target.type === 'INBOUND_RECEIVE') {
      await processErpInboundReceive(target.payload);
      target.status = 'SUCCESS';
      target.errorMessage = undefined;
      await updateQueueItem(target);
      soundHelper.playSuccessChime();
      return true;
    }
    return false;
  } catch (err: any) {
    target.status = 'FAILED';
    target.errorMessage = err.message || '재시도 실패';
    target.retryCount = (target.retryCount || 0) + 1;
    await updateQueueItem(target);
    soundHelper.playErrorBuzzer();
    return false;
  } finally {
    isSyncingInProgress = false;
    notifyQueueChanged();
  }
}

/**
 * 대기 큐 항목 삭제 (연관된 전표의 입고 처리도 자동 취소 및 재고 원복)
 */
export async function deleteQueueItemById(id: string): Promise<void> {
  try {
    const queue = await getQueueItems();
    const target = queue.find((it) => it.id === id);
    if (target && target.slipNo) {
      // 연관 전표 입고 취소 및 로컬 재고 롤백
      await cancelInboundReceipt(target.slipNo, false);
    }
  } catch (err) {
    console.warn('Failed reverting slip during queue delete:', err);
  }

  await removeQueueItem(id);
  notifyQueueChanged();
}

/**
 * 입고 확정 전표 취소 처리:
 * 1) 대기 큐(sync_queue)에 있는 경우 큐에서 제거
 * 2) 로컬 서버 재고 롤백 및 전표 WAITING 복구 API 호출
 * 3) ERP 실시간 전표인 경우 ERP 취소 API 호출
 * 4) IndexedDB 전표 캐시를 WAITING 상태로 롤백
 * 5) 전역 새로고침 이벤트 트리거
 */
export async function cancelInboundReceipt(
  slipNo: string,
  isErp?: boolean
): Promise<{ success: boolean; message: string }> {
  const cleanSlipNo = (slipNo || '').trim();
  if (!cleanSlipNo) return { success: false, message: '전표번호가 유효하지 않습니다.' };

  // 1. 대기 큐에서 제거
  try {
    const queue = await getQueueItems();
    const matchedItems = queue.filter((it) => it.slipNo === cleanSlipNo);
    for (const item of matchedItems) {
      await removeQueueItem(item.id);
    }
  } catch (qErr) {
    console.warn('Failed clearing from queue:', qErr);
  }

  // 2. 로컬 서버 취소 API 호출 (로컬 재고 롤백)
  try {
    await cancelInboundSlipApi(cleanSlipNo);
  } catch (localErr) {
    console.warn('Local cancel API call failed (continuing with offline fallback):', localErr);
  }

  // 3. ERP 취소 API 호출 (ERP 전표인 경우)
  if (isErp) {
    try {
      await cancelErpInboundReceive(cleanSlipNo);
    } catch (erpErr) {
      console.warn('ERP cancel API call failed:', erpErr);
    }
  }

  // 4. IndexedDB 전표 상태 복구
  try {
    const slip = await getSlipByNoFromIndexedDb(cleanSlipNo);
    if (slip) {
      slip.status = 'WAITING';
      slip.totalReceivedQty = 0;
      slip.totalDefectQty = 0;
      slip.inboundDate = undefined;
      slip.updatedAt = new Date().toISOString();
      slip.items.forEach((it) => {
        it.status = 'WAITING';
        it.receivedQty = 0;
        it.defectQty = 0;
        it.defectReason = undefined;
      });
      await saveSlipToIndexedDb(slip);
    }
  } catch (idbErr) {
    console.warn('IndexedDB slip rollback failed:', idbErr);
  }

  // 5. 알림 및 전역 갱신 이벤트 트리거
  notifyQueueChanged();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('app:refresh-data'));
  }

  return {
    success: true,
    message: `납품확인서 [${cleanSlipNo}]의 입고 처리가 취소되고 입고 대기 목록으로 복원되었습니다.`,
  };
}

/**
 * 미처리 대기 작업 수 조회
 */
export async function getPendingQueueCount(): Promise<number> {
  try {
    const items = await getQueueItems();
    return items.filter((it) => it.status === 'PENDING' || it.status === 'FAILED').length;
  } catch {
    return 0;
  }
}
