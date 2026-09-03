import React, { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  Printer,
  Calendar,
  Building2,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { InboundSlip } from '../../types/inbound';
import { fetchErpPrintData } from '../../api/erpApi';
import { registerBackHandler } from '../../utils/backHandler';
import { generateInboundQRValue } from '../../utils/qrHelper';

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
  const [erpSlip, setErpSlip] = useState<InboundSlip | null>(null);
  const [isErpLoading, setIsErpLoading] = useState(false);

  // Load ERP MMB202_Print data in background
  const loadErpData = useCallback(async (targetSlipNo: string, code: string) => {
    try {
      setIsErpLoading(true);
      const res = await fetchErpPrintData(targetSlipNo, 101, code);
      if (res.success && res.slip) {
        setErpSlip(res.slip);
      }
    } catch {
      // Fallback silently to slip data
    } finally {
      setIsErpLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && slip) {
      const code = slip.supplierCode && slip.supplierCode !== 'SUP-ERP' && slip.supplierCode !== 'SUP-NEW'
        ? slip.supplierCode
        : '34661';
      loadErpData(slip.slipNo, code);
    } else {
      setErpSlip(null);
    }
  }, [isOpen, slip, loadErpData]);

  // Register Back Handler: Close print modal on smartphone back button
  useEffect(() => {
    if (!isOpen) return;
    return registerBackHandler('printModal', 100, () => {
      onClose();
      return true;
    });
  }, [isOpen, onClose]);

  // Toggle body class for print isolation
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('is-print-modal-active');
      return () => {
        document.body.classList.remove('is-print-modal-active');
      };
    }
  }, [isOpen]);

  if (!isOpen || !slip) return null;

  const handlePrint = () => {
    window.print();
  };

  const displaySlip = erpSlip || slip;

  return (
    <div className="printable-slip-modal fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:static print:inset-auto print:p-0 print:m-0 print:bg-white print:overflow-visible">
      
      {/* Modal Container */}
      <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden print:border-0 print:shadow-none print:max-w-none print:w-full">
        
        {/* Header - Hidden on print */}
        <div className="px-5 py-3.5 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 print:hidden">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center shrink-0 shadow-2xs">
              <Printer className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 truncate">
                입고 전표 인쇄
              </h3>
              <p className="text-xs text-slate-500 font-normal truncate">
                전표번호: <strong className="font-mono text-indigo-600 font-bold">{displaySlip.slipNo}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1.5 cursor-pointer transition-all active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>인쇄</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body with Smartphone Responsive Horizontal Pan Wrapper */}
        <div className="p-2.5 sm:p-6 overflow-y-auto flex-1 bg-slate-100/70 print:bg-white print:p-0">
          
          <div className="w-full overflow-x-auto pb-2">
            {/* A4 Style Inbound Receipt Container (모바일에서도 규격/테이블이 찌그러지지 않도록 min-w 부여) */}
            <div className="bg-white text-slate-900 p-4 sm:p-8 rounded-2xl shadow-xs min-w-[620px] print:min-w-0 print:w-full mx-auto border border-slate-200 print:border-0 print:shadow-none print:p-0">
              
              {/* Header Title & QR */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-3 sm:pb-4 mb-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950">
                    입 고 전 표
                  </h1>
                  <p className="text-xs text-slate-600 font-mono mt-1">
                    전표번호: <strong>{displaySlip.slipNo}</strong> | 사업장: <strong>(주)KCP</strong>
                  </p>
                </div>

                <div className="p-1.5 bg-white border border-slate-300 rounded-lg shrink-0 flex flex-col items-center">
                  <QRCodeSVG value={generateInboundQRValue(displaySlip.slipNo)} size={60} level="M" marginSize={2} />
                  <span className="text-[8px] font-mono text-slate-500 mt-0.5 font-bold">QR 입고검수</span>
                </div>
              </div>

              {/* Meta Table */}
              <table className="w-full text-xs mb-4 border-collapse border border-slate-300">
                <tbody>
                  <tr className="border-b border-slate-300">
                    <th className="bg-slate-100 p-2 text-left w-24 border-r border-slate-300 font-bold whitespace-nowrap">공급(납품)처</th>
                    <td className="p-2 border-r border-slate-300 font-bold">
                      {displaySlip.supplierName} {displaySlip.supplierCode ? `(${displaySlip.supplierCode})` : ''}
                    </td>
                    <th className="bg-slate-100 p-2 text-left w-24 border-r border-slate-300 font-bold whitespace-nowrap">납품일자</th>
                    <td className="p-2 font-mono whitespace-nowrap">{displaySlip.deliveryDate}</td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <th className="bg-slate-100 p-2 text-left border-r border-slate-300 font-bold whitespace-nowrap">발주/관리번호</th>
                    <td className="p-2 border-r border-slate-300 font-mono">{displaySlip.poNumber || displaySlip.slipNo}</td>
                    <th className="bg-slate-100 p-2 text-left border-r border-slate-300 font-bold whitespace-nowrap">입고일시</th>
                    <td className="p-2 font-mono whitespace-nowrap">
                      {displaySlip.inboundDate ? new Date(displaySlip.inboundDate).toLocaleString() : new Date().toLocaleDateString()}
                    </td>
                  </tr>
                  <tr>
                    <th className="bg-slate-100 p-2 text-left border-r border-slate-300 font-bold whitespace-nowrap">검수/담당자</th>
                    <td className="p-2 border-r border-slate-300 font-bold">{displaySlip.manager || '자재과'}</td>
                    <th className="bg-slate-100 p-2 text-left border-r border-slate-300 font-bold whitespace-nowrap">처리상태</th>
                    <td className="p-2 font-bold text-emerald-700 whitespace-nowrap">
                      {displaySlip.status === 'COMPLETED' ? '입고 완료' : '검수중'}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Items Table - 깨짐 방지: 규격/품목명 break-keep 및 적정 컬럼폭 지정 */}
              <table className="w-full text-xs border-collapse border border-slate-300 mb-4">
                <thead className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800">
                  <tr>
                    <th className="p-2 border-r border-slate-300 text-center w-10 whitespace-nowrap">No</th>
                    <th className="p-2 border-r border-slate-300 text-left w-28 whitespace-nowrap">품목코드</th>
                    <th className="p-2 border-r border-slate-300 text-left min-w-[160px]">품목명 / 규격</th>
                    <th className="p-2 border-r border-slate-300 text-right w-16 whitespace-nowrap">발주량</th>
                    <th className="p-2 border-r border-slate-300 text-right w-20 whitespace-nowrap">입고수량</th>
                    <th className="p-2 border-r border-slate-300 text-right w-24 whitespace-nowrap">단가</th>
                    <th className="p-2 text-center w-16 whitespace-nowrap">상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {displaySlip.items.map((it, idx) => (
                    <tr key={it.id || idx} className="border-b border-slate-200">
                      <td className="p-2 border-r border-slate-300 text-center font-mono">{idx + 1}</td>
                      <td className="p-2 border-r border-slate-300 font-mono font-bold whitespace-nowrap">{it.itemCode}</td>
                      <td className="p-2 border-r border-slate-300">
                        <p className="font-bold text-slate-900 break-keep">{it.itemName}</p>
                        {it.spec && (
                          <p className="text-[11px] text-slate-600 font-mono mt-0.5 break-keep">
                            {it.spec}
                          </p>
                        )}
                      </td>
                      <td className="p-2 border-r border-slate-300 text-right font-mono whitespace-nowrap">{it.orderQty.toLocaleString()}</td>
                      <td className="p-2 border-r border-slate-300 text-right font-mono font-bold text-emerald-700 whitespace-nowrap">
                        {it.receivedQty.toLocaleString()} {it.unit}
                      </td>
                      <td className="p-2 border-r border-slate-300 text-right font-mono text-slate-700 whitespace-nowrap">
                        {it.unitPrice ? `${it.unitPrice.toLocaleString()}원` : '-'}
                      </td>
                      <td className="p-2 text-center font-bold text-[10px] whitespace-nowrap">
                        {it.defectQty > 0 ? (
                          <span className="text-rose-600">불량({it.defectQty})</span>
                        ) : (
                          <span className="text-emerald-700">정상</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold border-t border-slate-300">
                    <td colSpan={3} className="p-2 text-center border-r border-slate-300">합 계</td>
                    <td className="p-2 text-right border-r border-slate-300 font-mono whitespace-nowrap">
                      {displaySlip.items.reduce((s, i) => s + i.orderQty, 0).toLocaleString()}
                    </td>
                    <td className="p-2 text-right border-r border-slate-300 font-mono text-emerald-700 whitespace-nowrap">
                      {displaySlip.items.reduce((s, i) => s + i.receivedQty, 0).toLocaleString()}
                    </td>
                    <td colSpan={2} className="p-2 text-center text-slate-600 whitespace-nowrap">
                      총 {displaySlip.items.length}개 품목
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* Signatures */}
              <div className="flex justify-between items-end pt-4 border-t border-slate-300 text-xs">
                <div>
                  <p className="text-slate-600 text-[11px]">위 물품의 입고 검수를 완료하였음을 확인합니다.</p>
                  <p className="text-slate-400 text-[10px] mt-0.5">KCP 자재관리(WMA) 입고확인 시스템</p>
                </div>
                <div className="flex space-x-6 text-center shrink-0">
                  <div className="w-24 border-b border-slate-400 pb-1">
                    <span className="text-2xs text-slate-500 block">납품자</span>
                    <span className="font-bold truncate block">{displaySlip.supplierName.slice(0, 8)}</span>
                  </div>
                  <div className="w-24 border-b border-slate-400 pb-1">
                    <span className="text-2xs text-slate-500 block">입고 검수자</span>
                    <span className="font-bold">{displaySlip.manager || '자재과장'} (인)</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Footer - Hidden on print */}
        <div className="px-5 py-3 sm:px-6 sm:py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between print:hidden">
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
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1.5 cursor-pointer transition-all active:scale-98"
          >
            <Printer className="w-4 h-4" />
            <span>인쇄</span>
          </button>
        </div>

      </div>
    </div>
  );
};
