import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  Printer,
  Building2,
  Calendar,
  FileSpreadsheet
} from 'lucide-react';
import { InboundSlip } from '../../types/inbound';

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

  if (!isOpen || !slip) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      
      {/* Modal Container */}
      <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden print:border-0 print:shadow-none print:max-w-none print:w-full">
        
        {/* Header - Hidden on print */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                입고 확인서 및 바코드 라벨 인쇄
              </h3>
              <p className="text-xs text-slate-500 font-normal">
                전표번호: <strong className="font-mono text-indigo-600 font-bold">{slip.slipNo}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="bg-white p-1 rounded-xl border border-slate-200 flex space-x-1 text-xs">
              <button
                type="button"
                onClick={() => setPrintMode('RECEIPT')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  printMode === 'RECEIPT' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                입고확인증 (A4)
              </button>
              <button
                type="button"
                onClick={() => setPrintMode('ITEM_LABELS')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  printMode === 'ITEM_LABELS' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
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

        {/* Printable Document Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50 print:bg-white print:p-0">
          
          {printMode === 'RECEIPT' ? (
            /* A4 Style Inbound Receipt */
            <div className="bg-white text-slate-900 p-8 rounded-2xl shadow-xs max-w-2xl mx-auto border border-slate-200 print:border-0 print:shadow-none print:p-0">
              
              {/* Header Title */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4 mb-6">
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-950">
                    자 재 입 고 확 인 증
                  </h1>
                  <p className="text-xs text-slate-600 font-mono mt-0.5">
                    전표번호: {slip.slipNo}
                  </p>
                </div>

                <div className="p-1 bg-white border border-slate-300 rounded-lg">
                  <QRCodeSVG value={slip.slipNo} size={64} level="M" />
                </div>
              </div>

              {/* Meta Table */}
              <table className="w-full text-xs mb-6 border-collapse border border-slate-300">
                <tbody>
                  <tr className="border-b border-slate-300">
                    <th className="bg-slate-100 p-2 text-left w-24 border-r border-slate-300 font-bold">납품처명</th>
                    <td className="p-2 border-r border-slate-300 font-bold">{slip.supplierName}</td>
                    <th className="bg-slate-100 p-2 text-left w-24 border-r border-slate-300 font-bold">납품일자</th>
                    <td className="p-2 font-mono">{slip.deliveryDate}</td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <th className="bg-slate-100 p-2 text-left border-r border-slate-300 font-bold">발주번호</th>
                    <td className="p-2 border-r border-slate-300 font-mono">{slip.poNumber || '-'}</td>
                    <th className="bg-slate-100 p-2 text-left border-r border-slate-300 font-bold">입고일시</th>
                    <td className="p-2 font-mono">
                      {slip.inboundDate ? new Date(slip.inboundDate).toLocaleString() : '검수중'}
                    </td>
                  </tr>
                  <tr>
                    <th className="bg-slate-100 p-2 text-left border-r border-slate-300 font-bold">검수담당</th>
                    <td className="p-2 border-r border-slate-300 font-bold">{slip.manager || '자재과'}</td>
                    <th className="bg-slate-100 p-2 text-left border-r border-slate-300 font-bold">처리상태</th>
                    <td className="p-2 font-bold text-emerald-700">
                      {slip.status === 'COMPLETED' ? '전량 입고 완료' : '부분 입고'}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Items Table (Rack Column Removed) */}
              <table className="w-full text-xs border-collapse border border-slate-300 mb-6">
                <thead className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800">
                  <tr>
                    <th className="p-2 border-r border-slate-300 text-center w-10">No</th>
                    <th className="p-2 border-r border-slate-300 text-left">품목코드</th>
                    <th className="p-2 border-r border-slate-300 text-left">품목명 / 규격</th>
                    <th className="p-2 border-r border-slate-300 text-right w-20">발주량</th>
                    <th className="p-2 border-r border-slate-300 text-right w-20">입고량</th>
                    <th className="p-2 text-center w-20">상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {slip.items.map((it, idx) => (
                    <tr key={it.id} className="border-b border-slate-200">
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
                      {slip.items.reduce((s, i) => s + i.orderQty, 0)}
                    </td>
                    <td className="p-2 text-right border-r border-slate-300 font-mono text-emerald-700">
                      {slip.items.reduce((s, i) => s + i.receivedQty, 0)}
                    </td>
                    <td className="p-2 text-center text-slate-600">
                      총 {slip.items.length}개 품목
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* Signatures */}
              <div className="flex justify-between items-end pt-6 border-t border-slate-300 text-xs">
                <div>
                  <p className="text-slate-600 text-[11px]">위 물품의 입고 검수를 완료하였음을 확인합니다.</p>
                  <p className="text-slate-400 text-[10px] mt-1">SmartRack QR 자재 입고 관리 시스템</p>
                </div>
                <div className="flex space-x-6 text-center">
                  <div className="w-24 border-b border-slate-400 pb-1">
                    <span className="text-2xs text-slate-500 block">납품자</span>
                    <span className="font-bold">{slip.supplierName.slice(0, 6)}</span>
                  </div>
                  <div className="w-24 border-b border-slate-400 pb-1">
                    <span className="text-2xs text-slate-500 block">입고 검수자</span>
                    <span className="font-bold">{slip.manager || '홍길동'} (인)</span>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            /* Item Barcode Labels */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {slip.items.map((it) => (
                <div
                  key={it.id}
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
                    <p className="text-[11px] text-slate-600">
                      수량: <strong className="font-mono text-slate-900">{it.receivedQty} {it.unit}</strong> • {slip.deliveryDate}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {slip.supplierName}
                    </p>
                  </div>

                  <div className="p-1 bg-white border border-slate-200 rounded shrink-0">
                    <QRCodeSVG
                      value={`${it.itemCode}|${it.receivedQty}|${slip.slipNo}`}
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
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>프린터 인쇄</span>
          </button>
        </div>

      </div>
    </div>
  );
};
