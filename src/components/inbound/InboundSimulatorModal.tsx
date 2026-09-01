import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  Plus,
  Trash2,
  Sparkles,
  QrCode,
  Copy,
  Check
} from 'lucide-react';
import { InboundSlip } from '../../types/inbound';

interface InboundSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterSlip: (slip: Partial<InboundSlip>) => Promise<void>;
  onDirectInspect: (slipNo: string) => void;
}

export const InboundSimulatorModal: React.FC<InboundSimulatorModalProps> = ({
  isOpen,
  onClose,
  onRegisterSlip,
  onDirectInspect,
}) => {
  const [slipNo, setSlipNo] = useState(`DN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-00${Math.floor(Math.random() * 90 + 10)}`);
  const [supplierName, setSupplierName] = useState('(주)한국정밀센서');
  const [supplierCode, setSupplierCode] = useState('SUP-KS01');
  const [poNumber, setPoNumber] = useState(`PO-202608-${Math.floor(Math.random() * 900 + 100)}`);
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().slice(0, 10));
  const [memo, setMemo] = useState('정기 납품 검수 건');
  const [copied, setCopied] = useState(false);

  const [items, setItems] = useState<Array<{
    itemCode: string;
    itemName: string;
    spec: string;
    unit: string;
    orderQty: number;
  }>>([
    {
      itemCode: 'ELEC-SENS-501',
      itemName: '적외선 광학 거리 센서 모듈',
      spec: 'VL53L1X ToF 4m Range',
      unit: 'EA',
      orderQty: 150,
    },
    {
      itemCode: 'MECH-BEAR-202',
      itemName: '고속 플랜지 볼베어링',
      spec: 'F695-2RS 5x13x4mm',
      unit: 'SET',
      orderQty: 300,
    },
  ]);

  const [qrFormat, setQrFormat] = useState<'SLIP_KEY' | 'JSON' | 'DELIMITED'>('JSON');

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        itemCode: `ITEM-NEW-${items.length + 1}`,
        itemName: `신규 자재 품목 ${items.length + 1}`,
        spec: '표준 규격',
        unit: 'EA',
        orderQty: 50,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Generate QR Value based on format (No Rack references)
  const getQrValue = () => {
    if (qrFormat === 'SLIP_KEY') {
      return slipNo;
    }
    if (qrFormat === 'JSON') {
      return JSON.stringify({
        slipNo,
        supplierName,
        supplierCode,
        poNumber,
        deliveryDate,
        items: items.map((it) => ({
          itemCode: it.itemCode,
          itemName: it.itemName,
          spec: it.spec,
          unit: it.unit,
          qty: it.orderQty,
        })),
      });
    }
    // Delimited
    const itemsPart = items.map((it) => `${it.itemCode}:${it.itemName}:${it.orderQty}`).join(';');
    return `${slipNo}|${supplierName}|${deliveryDate}|${itemsPart}`;
  };

  const qrValue = getQrValue();

  const handleCopyQr = () => {
    navigator.clipboard.writeText(qrValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveAndInspect = async () => {
    const totalOrderedQty = items.reduce((sum, i) => sum + i.orderQty, 0);
    const newSlip: Partial<InboundSlip> = {
      slipNo,
      supplierName,
      supplierCode,
      poNumber,
      deliveryDate,
      status: 'WAITING',
      totalItems: items.length,
      totalOrderedQty,
      totalReceivedQty: 0,
      totalDefectQty: 0,
      memo,
      items: items.map((it, idx) => ({
        id: `sim-item-${Date.now()}-${idx}`,
        itemCode: it.itemCode,
        itemName: it.itemName,
        spec: it.spec,
        unit: it.unit,
        orderQty: it.orderQty,
        receivedQty: it.orderQty,
        defectQty: 0,
        warehouse: '특장자재창고',
        status: 'WAITING',
      })),
    };

    await onRegisterSlip(newSlip);
    onDirectInspect(slipNo);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900">
                납품확인서 QR 생성 및 테스트 시뮬레이터
              </h3>
              <p className="text-xs text-slate-500 font-normal">
                ERP 연동 전 납품서를 생성하고 A4 인쇄 또는 화면 스캔으로 테스트합니다
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Delivery Note Form */}
            <div className="lg:col-span-7 space-y-4">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-700 block mb-1 font-bold">납품전표번호</label>
                  <input
                    type="text"
                    value={slipNo}
                    onChange={(e) => setSlipNo(e.target.value)}
                    className="w-full px-3 py-2 bg-white text-slate-900 font-mono font-bold text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-700 block mb-1 font-bold">납품업체명</label>
                  <input
                    type="text"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    className="w-full px-3 py-2 bg-white text-slate-900 font-bold text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-700 block mb-1 font-bold">사내 발주번호</label>
                  <input
                    type="text"
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-white text-slate-900 font-mono text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-700 block mb-1 font-bold">납품일자</label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white text-slate-900 font-mono text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900">납품 품목 목록 ({items.length}건)</label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> 품목 추가
                  </button>
                </div>

                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {items.map((it, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2 text-xs"
                    >
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={it.itemCode}
                            onChange={(e) => {
                              const updated = [...items];
                              updated[idx].itemCode = e.target.value;
                              setItems(updated);
                            }}
                            placeholder="품목코드"
                            className="w-32 px-2 py-1 bg-white text-indigo-700 font-mono font-bold text-xs rounded-lg border border-slate-300"
                          />
                          <input
                            type="text"
                            value={it.itemName}
                            onChange={(e) => {
                              const updated = [...items];
                              updated[idx].itemName = e.target.value;
                              setItems(updated);
                            }}
                            placeholder="품목명"
                            className="flex-1 px-2 py-1 bg-white text-slate-900 font-bold text-xs rounded-lg border border-slate-300"
                          />
                        </div>

                        <div className="flex items-center space-x-2 text-xs">
                          <span className="text-slate-500">수량:</span>
                          <input
                            type="number"
                            min="1"
                            value={it.orderQty}
                            onChange={(e) => {
                              const updated = [...items];
                              updated[idx].orderQty = parseInt(e.target.value, 10) || 1;
                              setItems(updated);
                            }}
                            className="w-20 px-2 py-1 bg-white text-slate-900 font-mono font-bold rounded-lg border border-slate-300"
                          />
                          <span className="text-slate-600 font-bold">{it.unit}</span>
                        </div>
                      </div>

                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: High-Res QR Code Preview & Format Choice */}
            <div className="lg:col-span-5 flex flex-col items-center justify-between bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 text-center">
              
              <div>
                <div className="flex items-center justify-center space-x-2 text-xs font-bold mb-3">
                  <span className="text-slate-600">QR 데이터 포맷:</span>
                  <div className="bg-white p-1 rounded-xl border border-slate-200 flex space-x-1">
                    <button
                      type="button"
                      onClick={() => setQrFormat('JSON')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        qrFormat === 'JSON' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      JSON
                    </button>
                    <button
                      type="button"
                      onClick={() => setQrFormat('SLIP_KEY')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        qrFormat === 'SLIP_KEY' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      전표번호
                    </button>
                    <button
                      type="button"
                      onClick={() => setQrFormat('DELIMITED')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        qrFormat === 'DELIMITED' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      구분자
                    </button>
                  </div>
                </div>

                {/* Printable A4 Form Style Preview Box */}
                <div className="bg-white text-slate-900 p-5 rounded-2xl shadow-xs flex flex-col items-center justify-center space-y-3 max-w-[280px] mx-auto border border-slate-200">
                  <div className="border-b-2 border-slate-900 pb-1 w-full text-center">
                    <h4 className="font-extrabold text-sm tracking-wider">납 품 확 인 서</h4>
                    <p className="text-xs text-slate-600 font-mono">{slipNo}</p>
                  </div>

                  <div className="p-2 bg-white rounded-xl shadow-inner border border-slate-200">
                    <QRCodeSVG
                      value={qrValue}
                      size={170}
                      level="M"
                      includeMargin={false}
                    />
                  </div>

                  <div className="w-full text-left text-xs space-y-0.5 border-t border-slate-200 pt-2 font-normal">
                    <p><strong className="text-slate-900">공급처:</strong> {supplierName}</p>
                    <p><strong className="text-slate-900">납품일:</strong> {deliveryDate}</p>
                    <p><strong className="text-slate-900">총품목:</strong> {items.length}종 ({items.reduce((s, i) => s + i.orderQty, 0)} EA)</p>
                  </div>
                </div>
              </div>

              <div className="w-full space-y-2">
                <button
                  type="button"
                  onClick={handleCopyQr}
                  className="w-full py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'QR 텍스트 복사 완료!' : 'QR 원본 문자열 복사'}</span>
                </button>
                <p className="text-xs text-slate-500 font-normal">
                  💡 스마트폰 카메라로 위 화면의 QR을 직접 비춰보세요!
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 cursor-pointer"
          >
            닫기
          </button>

          <button
            type="button"
            onClick={handleSaveAndInspect}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1.5 cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            <span>전표 등록 후 바로 검수 진행</span>
          </button>
        </div>

      </div>
    </div>
  );
};
