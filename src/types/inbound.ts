export type InboundStatus = 'WAITING' | 'INSPECTING' | 'COMPLETED' | 'PARTIAL' | 'HOLD' | 'CANCELLED';
export type InboundItemStatus = 'WAITING' | 'CHECKED' | 'DEFECT' | 'COMPLETED';

export interface InboundItem {
  id: string;             // 고유 행 ID
  itemCode: string;       // 품목코드 / SKU
  itemName: string;       // 품목명
  spec: string;           // 규격 / 사양
  unit: string;           // 단위 (EA, BOX, SET, KG 등)
  orderQty: number;       // 발주 / 납품요청 수량
  receivedQty: number;    // 실제 검수/입고 수량
  defectQty: number;      // 불량 / 파손 수량
  defectReason?: string;  // 불량 사유
  warehouse?: string;     // 입고 창고
  unitPrice?: number;     // 단가 (원)
  status: InboundItemStatus;
  barcode?: string;       // 개별 바코드
  notes?: string;         // 비고
}

export interface InboundSlip {
  slipNo: string;             // 납품확인서 전표번호 (예: DN-20260831-001)
  supplierCode: string;       // 납품업체 코드
  supplierName: string;       // 납품업체명
  poNumber?: string;          // 발주번호
  deliveryDate: string;       // 납품일자 (YYYY-MM-DD)
  status: InboundStatus;      // 처리 상태
  totalItems: number;         // 총 품목 수
  totalOrderedQty: number;    // 총 발주/납품 수량
  totalReceivedQty: number;   // 총 실입고 수량
  totalDefectQty: number;     // 총 불량 수량
  manager?: string;           // 자재과 입고 담당자
  inboundDate?: string;       // 입고 확정 일시 (ISO string)
  memo?: string;              // 특이사항 / 메모
  photos?: string[];          // 현장 입고 및 검수 사진 (Base64 data URL)
  items: InboundItem[];       // 품목 목록
  createdAt: string;          // 생성일시
  updatedAt: string;          // 수정일시
}

export interface InboundReceiveItemPayload {
  id: string;
  itemCode: string;
  receivedQty: number;
  defectQty?: number;
  defectReason?: string;
  warehouse?: string;
}

export interface InboundReceivePayload {
  slipNo: string;
  items: InboundReceiveItemPayload[];
  manager: string;
  warehouse?: string;
  memo?: string;
  photos?: string[];
  completeAll?: boolean;
}

export interface InboundStats {
  todayTotalSlips: number;
  todayCompletedSlips: number;
  todayPendingSlips: number;
  todayTotalReceivedQty: number;
  totalDefectsToday: number;
}

export type InboundViewTab = 'SCANNER' | 'RECEIVING' | 'PENDING' | 'HISTORY';
