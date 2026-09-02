import React, { useState, useEffect } from 'react';
import {
  CloudUpload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  X,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Play
} from 'lucide-react';
import { SyncQueueItem, getQueueItems, clearCompletedQueueItems } from '../../utils/indexedDbHelper';
import {
  processSyncQueue,
  retrySingleQueueItem,
  deleteQueueItemById,
  subscribeToQueueChanges
} from '../../utils/syncQueueHelper';
import { fetchErpStatus, ErpStatus } from '../../api/erpApi';

interface InboundSyncQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const InboundSyncQueueModal: React.FC<InboundSyncQueueModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [items, setItems] = useState<SyncQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [erpStatus, setErpStatus] = useState<ErpStatus | null>(null);

  const loadQueue = async () => {
    try {
      setIsLoading(true);
      const queue = await getQueueItems();
      setItems(queue);
    } catch (err) {
      console.error('Failed loading sync queue:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const checkStatus = async () => {
    try {
      const status = await fetchErpStatus();
      setErpStatus(status);
    } catch {
      setErpStatus(null);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadQueue();
      checkStatus();
    }
  }, [isOpen]);

  useEffect(() => {
    const unsub = subscribeToQueueChanges(() => {
      loadQueue();
    });
    return unsub;
  }, []);

  if (!isOpen) return null;

  const handleSyncAll = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const res = await processSyncQueue();
      if (res.succeeded > 0) {
        onShowToast(`${res.succeeded}건의 대기 작업이 ERP에 성공적으로 동기화되었습니다!`, 'success');
      } else if (res.failed > 0) {
        onShowToast(`일부 작업 동기화 실패 (${res.failed}건). 네트워크 또는 DB 상태를 확인해주세요.`, 'error');
      } else if (res.remaining > 0) {
        onShowToast('ERP DB에 연결할 수 없어 동기화를 진행하지 못했습니다.', 'info');
      } else {
        onShowToast('동기화할 대기 작업이 없습니다.', 'info');
      }
      await loadQueue();
      await checkStatus();
    } catch (err: any) {
      onShowToast(err.message || '동기화 중 오류 발생', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRetrySingle = async (id: string) => {
    try {
      const success = await retrySingleQueueItem(id);
      if (success) {
        onShowToast('작업이 ERP에 성공적으로 동기화되었습니다!', 'success');
      } else {
        onShowToast('동기화 실패. DB 연결 상태를 확인해주세요.', 'error');
      }
      await loadQueue();
    } catch (err: any) {
      onShowToast(err.message || '재시도 실패', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('이 대기 작업을 목록에서 삭제하시겠습니까?')) return;
    try {
      await deleteQueueItemById(id);
      onShowToast('대기 작업이 삭제되었습니다.', 'info');
      await loadQueue();
    } catch (err: any) {
      onShowToast(err.message || '삭제 실패', 'error');
    }
  };

  const handleClearCompleted = async () => {
    try {
      const count = await clearCompletedQueueItems();
      onShowToast(`${count}건의 완료 내역을 정리했습니다.`, 'info');
      await loadQueue();
    } catch (err: any) {
      onShowToast(err.message || '정리 실패', 'error');
    }
  };

  const pendingCount = items.filter((i) => i.status === 'PENDING').length;
  const failedCount = items.filter((i) => i.status === 'FAILED').length;
  const completedCount = items.filter((i) => i.status === 'SUCCESS').length;
  const isOnline = Boolean(erpStatus?.isConnected);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col border border-slate-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
              <CloudUpload className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  오프라인 동기화 대기 큐
                </h3>
                {isOnline ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    ERP 온라인
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    ERP 오프라인
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                네트워크/DB 미연결 시 로컬에 저장된 입고 확정 작업을 관리합니다
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-3 gap-2 shrink-0">
          <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900">
            <div className="text-[11px] font-semibold text-amber-700 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>동기화 대기</span>
            </div>
            <div className="text-lg font-black font-mono mt-0.5">{pendingCount}건</div>
          </div>

          <div className="p-3 rounded-2xl bg-rose-50/80 border border-rose-200/80 text-rose-900">
            <div className="text-[11px] font-semibold text-rose-700 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>동기화 실패</span>
            </div>
            <div className="text-lg font-black font-mono mt-0.5">{failedCount}건</div>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-900">
            <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>동기화 완료</span>
            </div>
            <div className="text-lg font-black font-mono mt-0.5">{completedCount}건</div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-2 shrink-0 pt-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSyncAll}
              disabled={isSyncing || (pendingCount === 0 && failedCount === 0)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? '동기화 처리 중...' : '지금 전체 동기화 실행'}</span>
            </button>

            {completedCount > 0 && (
              <button
                type="button"
                onClick={handleClearCompleted}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                완료 내역 정리
              </button>
            )}
          </div>

          <span className="text-[11px] text-slate-400 font-mono">
            총 {items.length}건
          </span>
        </div>

        {/* Items List (Scrollable) */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[180px]">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500/70" />
              <div className="text-sm font-bold text-slate-700">대기 중인 동기화 작업이 없습니다</div>
              <p className="text-xs text-slate-400 max-w-xs">
                모든 현장 입고 확인 데이터가 사내 ERP MSSQL 데이터베이스에 실시간으로 반영되었습니다.
              </p>
            </div>
          ) : (
            items.map((item) => {
              const formattedTime = item.createdAt
                ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                : '';

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    item.status === 'SUCCESS'
                      ? 'bg-emerald-50/40 border-emerald-200 text-slate-800'
                      : item.status === 'FAILED'
                      ? 'bg-rose-50/50 border-rose-200 text-slate-800'
                      : item.status === 'SYNCING'
                      ? 'bg-blue-50/50 border-blue-200 text-slate-800 animate-pulse'
                      : 'bg-white border-slate-200 text-slate-800 shadow-2xs hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                          {item.slipNo}
                        </span>

                        {item.status === 'PENDING' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            대기중
                          </span>
                        )}

                        {item.status === 'SYNCING' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                            <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                            동기화중
                          </span>
                        )}

                        {item.status === 'SUCCESS' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            동기화 완료
                          </span>
                        )}

                        {item.status === 'FAILED' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                            <AlertCircle className="w-2.5 h-2.5" />
                            실패 (재시도 {item.retryCount}회)
                          </span>
                        )}

                        <span className="text-[11px] text-slate-400">
                          {formattedTime}
                        </span>
                      </div>

                      <div className="text-xs font-bold text-slate-900 truncate">
                        {item.title}
                      </div>

                      {item.operator && (
                        <div className="text-[11px] text-slate-500">
                          작업자: <span className="font-semibold text-slate-700">{item.operator}</span>
                        </div>
                      )}

                      {item.errorMessage && (
                        <div className="text-[11px] text-rose-600 bg-rose-100/60 p-1.5 rounded-lg font-mono">
                          오류: {item.errorMessage}
                        </div>
                      )}
                    </div>

                    {/* Single Item Action Buttons */}
                    <div className="flex items-center space-x-1 shrink-0">
                      {item.status !== 'SUCCESS' && (
                        <button
                          type="button"
                          onClick={() => handleRetrySingle(item.id)}
                          title="이 작업 즉시 동기화"
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer border border-indigo-200"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        title="대기 큐에서 삭제"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 shrink-0">
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>DB 연결 복구 시 백그라운드에서 자동 순차 동기화됩니다.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            닫기
          </button>
        </div>

      </div>
    </div>
  );
};
