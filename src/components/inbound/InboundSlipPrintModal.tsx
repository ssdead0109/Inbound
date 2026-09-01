import React, { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  Printer,
  Building2,
  Calendar,
  FileSpreadsheet,
  Database,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { InboundSlip } from '../../types/inbound';
import { fetchErpPrintData } from '../../api/erpApi';

interface InboundSlipPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  slip: InboundSlip | null;
}

export const InboundSlipPrintModal: React.FC<InboundSlipPrintModalProps> = ({
  isOpen,
  onClose,
  slip,
}) => {
  const [printMode, setPrintMode] = useState<'RECEIPT' | 'ITEM_LABELS'>('RECEIPT');
  const [dataSource, setDataSource] = useState<'ERP_MMB202' | 'LOCAL'>('ERP_MMB202');
  const [erpSlip, setErpSlip] = useState<InboundSlip | null>(null);
  const [isErpLoading, setIsErpLoading] = useState(false);
  const [erpError, setErpError] = useState<string | null>(null);
  const [executedQuery, setExecutedQuery] = useState<string | null>(null);
  const [subCode, setSubCode] = useState<string>('34661');

  // Load ERP MMB202_Print data
  const loadErpData = useCallback(async (targetSlipNo: string, code: string) => {
    try {
      setIsErpLoading(true);
      setErpError(null);
      const res = await fetchErpPrintData(targetSlipNo, 101, code);
      if (res.success && res.slip) {
        setErpSlip(res.slip);
        setExecutedQuery(res.executedQuery || `EXEC MMB202_Print N'${targetSlipNo}', 101, N'${code}'`);
        setDataSource('ERP_MMB202');
      }
    } catch (err: any) {
      console.warn('ERP MMB202_Print fetch failed, fallback to local:', err.message);
      setErpError(err.message || 'ERP 입하증 조회 실패');
      setDataSource('LOCAL');
    } finally {
      setIsErpLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && slip) {
      const code = slip.supplierCode && slip.supplierCode !== 'SUP-ERP' && slip.supplierCode !== 'SUP-NEW'
        ? slip.supplierCode
        : '34661';
      setSubCode(code);
      loadErpData(slip.slipNo, code);
    } else {
      setErpSlip(null);
      setErpError(null);
      setExecutedQuery(null);
    }
  }, [isOpen, slip, loadErpData]);

  if (!isOpen || !slip) return null;

  const handlePrint = () => {
    window.print();
  };

  const displaySlip = (dataSource === 'ERP_MMB202' && erpSlip) ? erpSlip : slip;
  const isErpActive = dataSource === 'ERP_MMB202' && Boolean(erpSlip);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      
      {/* Modal Container */}
      <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden print:border-0 print:shadow-none print:max-w-none print:w-full">
        
        {/* Header - Hidden on print */}
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center shrink-0 shadow-2xs">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base text-slate-900">
                  입하증(입고확인서) 및 라벨 인쇄
                </h3>
                {isErpActive && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                    <Database className="w-3 h-3" /> MMB202_Print 연동
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-normal">
                전표번호: <strong className="font-mono text-indigo-600 font-bold">{displaySlip.slipNo}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-auto">
            {/* Print Mode Switch */}
            <div className="bg-white p-1 rounded-xl border border-slate-200 flex space-x-1 text-xs">
              <button
                type="button"
                onClick={() => setPrintMode('RECEIPT')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  printMode === 'RECEIPT' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                입하증 (A4)
              </button>
              <button
                type="button"
                onClick={() => setPrintMode('ITEM_LABELS')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  printMode === 'ITEM_LABELS' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                자재 품목 라벨
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Data Source Selector & SP Execution Bar - Hidden on print */}
        <div className="px-6 py-2.5 bg-slate-100/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs print:hidden">
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <span className="text-slate-500 font-semibold">데이터 소스:</span>
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
              <button
                type="button"
                onClick={() => setDataSource('ERP_MMB202')}
                disabled={!erpSlip && !isErpLoading}
                className={`px-2.5 py-1 rounded-md font-bold transition-all text-2xs cursor-pointer flex items-center gap-1 ${
                  dataSource === 'ERP_MMB202'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 disabled:opacity-50'
                }`}
              >
                <Database className="w-3 h-3" />
                <span>ERP 공식 (MMB202_Print)</span>
              </button>
              <button
                type="button"
                onClick={() => setDataSource('LOCAL')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all text-2xs cursor-pointer ${
                  dataSource === 'LOCAL'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                로컬 전표 데이터
              </button>
            </div>

            <button
              type="button"
              onClick={() => loadErpData(slip.slipNo, subCode)}
              disabled={isErpLoading}
              className="px-2 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-md font-semibold text-2xs flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
              title="ERP 데이터 재조회"
            >
              <RefreshCw className={`w-3 h-3 ${isErpLoading ? 'animate-spin text-indigo-600' : ''}`} />
              <span>{isErpLoading ? '조회중...' : 'ERP 재조회'}</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 truncate max-w-[280px] sm:max-w-none">
              {executedQuery || `EXEC MMB202_Print N'${displaySlip.slipNo}', 101, N'${subCode}'`}
            </span>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50 print:bg-white print:p-0">
          
          {printMode === 'RECEIPT' ? (
            /* A4 Style Inbound Receipt (자재 입하증) */
            <div className="bg-white text-slate-900 p-8 rounded-2xl shadow-xs max-w-2xl mx-auto border border-slate-200 print:border-0 print:shadow-none print:p-0">
              
              {/* Header Title */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4 mb-5">
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-2xl font-black tracking-tight text-slate-950">
                      자 재 입 하 증
                    </h1>
                    {isErpActive && (
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 print:border-slate-400 print:text-slate-800">
                        [ERP 연동: MMB202_Print]
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 font-mono mt-1">
                    전표번호: <strong>{displaySlip.slipNo}</strong> | 회사코드: <strong>101</strong>
                  </p>
                </div>

                <div className="p-1 bg-white border border-slate-300 rounded-lg">
                  <QRCodeSVG value={displaySlip.slipNo} size={64} level="M" />
                </div>
              </div>

              {/* Meta Table */}
              <table className="w-full text-xs mb-5 border-collapse border border-slate-300">
                <tbody>
                  <tr className="border-b border-slate-300">
                    <th className="bg-slate-100 p-2 text-left w-24 border-r border-slate-300 font-bold">공급(납품)처</th>
                    <td className="p-2 border-r border-slate-300 font-bold">
                      {displaySlip.supplierName} {displaySlip.supplierCode ? `(${displaySlip.supplierCode})` : ''}
                    </td>
                    <th className="bg-slate-100 p-2 text-left w-24 border-r border-slate-300 font-bold">납품일자</th>
                    <td className="p-2 font-mono">{displaySlip.deliveryDate}</td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <th className="bg-slate-100 p-2 text-left border-r border-slate-300 font-bold">발주/관리번호</th>
                    <td className="p-2 border-r border-slate-300 font-mono">{displaySlip.poNumber || displaySlip.slipNo}</td>
                    <th className="bg-slate-100 p-2 text-left border-r border-slate-300 font-bold">입고일시</th>
                    <td className="p-2 font-mono">
                      {displaySlip.inboundDate ? new Date(displaySlip.inboundDate).toLocaleString() : new Date().toLocaleDateString()}
                    </td>
                  </tr>
                  <tr>
                    <th className="bg-slate-100 p-2 text-left border-r border-slate-300 font-bold">검수/담당자</th>
                    <td className="p-2 border-r border-slate-300 font-bold">{displaySlip.manager || '자재과'}</td>
                    <th className="bg-slate-100 p-2 text-left border-r border-slate-300 font-bold">처리상태</th>
                    <td className="p-2 font-bold text-emerald-700">
                      {displaySlip.status === 'COMPLETED' ? '입하/입고 완료' : '검수중'}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Items Table */}
              <table className="w-full text-xs border-collapse border border-slate-300 mb-5">
                <thead className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800">
                  <tr>
                    <th className="p-2 border-r border-slate-300 text-center w-10">No</th>
                    <th className="p-2 border-r border-slate-300 text-left">품목코드</th>
                    <th className="p-2 border-r border-slate-300 text-left">품목명 / 규격</th>
                    <th className="p-2 border-r border-slate-300 text-right w-16">발주량</th>
                    <th className="p-2 border-r border-slate-300 text-right w-20">입하수량</th>
                    <th className="p-2 border-r border-slate-300 text-right w-20">단가</th>
                    <th className="p-2 text-center w-16">상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {displaySlip.items.map((it, idx) => (
                    <tr key={it.id || idx} className="border-b border-slate-200">
                      <td className="p-2 border-r border-slate-300 text-center font-mono">{idx + 1}</td>
                      <td className="p-2 border-r border-slate-300 font-mono font-bold">{it.itemCode}</td>
                      <td className="p-2 border-r border-slate-300">
                        <p className="font-bold">{it.itemName}</p>
                        {it.spec && <p className="text-[10px] text-slate-500">{it.spec}</p>}
                      </td>
                      <td className="p-2 border-r border-slate-300 text-right font-mono">{it.orderQty}</td>
                      <td className="p-2 border-r border-slate-300 text-right font-mono font-bold text-emerald-700">
                        {it.receivedQty} {it.unit}
                      </td>
                      <td className="p-2 border-r border-slate-300 text-right font-mono text-slate-700">
                        {it.unitPrice ? `${it.unitPrice.toLocaleString()}원` : '-'}
                      </td>
                      <td className="p-2 text-center font-bold text-[10px]">
                        {it.defectQty > 0 ? `불량(${it.defectQty})` : '정상'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold">
                    <td colSpan={3} className="p-2 text-center border-r border-slate-300">합 계</td>
                    <td className="p-2 text-right border-r border-slate-300 font-mono">
                      {displaySlip.items.reduce((s, i) => s + i.orderQty, 0)}
                    </td>
                    <td className="p-2 text-right border-r border-slate-300 font-mono text-emerald-700">
                      {displaySlip.items.reduce((s, i) => s + i.receivedQty, 0)}
                    </td>
                    <td colSpan={2} className="p-2 text-center text-slate-600">
                      총 {displaySlip.items.length}개 품목
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* Signatures */}
              <div className="flex justify-between items-end pt-5 border-t border-slate-300 text-xs">
                <div>
                  <p className="text-slate-600 text-[11px]">위 물품의 입하 및 입고 검수를 완료하였음을 확인합니다.</p>
                  <p className="text-slate-400 text-[10px] mt-0.5">SmartRack ERP Inbound 연동 시스템 (MMB202_Print)</p>
                </div>
                <div className="flex space-x-6 text-center">
                  <div className="w-24 border-b border-slate-400 pb-1">
                    <span className="text-2xs text-slate-500 block">납품자</span>
                    <span className="font-bold">{displaySlip.supplierName.slice(0, 8)}</span>
                  </div>
                  <div className="w-24 border-b border-slate-400 pb-1">
                    <span className="text-2xs text-slate-500 block">입고 검수자</span>
                    <span className="font-bold">{displaySlip.manager || '자재과장'} (인)</span>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            /* Item Barcode Labels */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {displaySlip.items.map((it, idx) => (
                <div
                  key={it.id || idx}
                  className="bg-white text-slate-900 p-4 rounded-xl border border-slate-300 flex items-center justify-between shadow-xs"
                >
                  <div className="space-y-1 flex-1 pr-2">
                    <div className="flex items-center space-x-1.5">
                      <span className="bg-slate-900 text-white font-mono font-bold text-xs px-2 py-0.5 rounded">
                        {it.itemCode}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-900 line-clamp-1">
                      {it.itemName}
                    </h4>
                    {it.spec && <p className="text-[10px] text-slate-500 line-clamp-1">{it.spec}</p>}
                    <p className="text-[11px] text-slate-600">
                      수량: <strong className="font-mono text-slate-900">{it.receivedQty} {it.unit}</strong> • {displaySlip.deliveryDate}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {displaySlip.supplierName}
                    </p>
                  </div>

                  <div className="p-1 bg-white border border-slate-200 rounded shrink-0">
                    <QRCodeSVG
                      value={`${it.itemCode}|${it.receivedQty}|${displaySlip.slipNo}`}
                      size={60}
                      level="M"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Footer - Hidden on print */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 cursor-pointer"
          >
            닫기
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1.5 cursor-pointer transition-all active:scale-98"
          >
            <Printer className="w-4 h-4" />
            <span>프린터 인쇄</span>
          </button>
        </div>

      </div>
    </div>
  );
};
