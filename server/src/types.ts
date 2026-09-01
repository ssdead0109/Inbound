export interface InventoryItem {
  id: string;
  code: string;           // 품목코드 / SKU (고유 키)
  name: string;           // 품목명
  spec: string;           // 규격 / 사양 / 모델명
  category: string;       // 분류 (전자부품, 원자재, 소모품 등)
  warehouse?: string;     // 창고명 (예: 특장자재창고-화성, 본관창고, 제1창고)
  rackLocation: string;   // 랙/보관위치 (예: A-01-2, B-04-1, 미입력)
  quantity: number;       // 현재 재고 수량
  unit: string;           // 단위 (EA, BOX, SET, KG, M 등)
  safetyStock: number;    // 안전재고 / 최소보유량
  price: number;          // 단가 (원)
  supplier: string;       // 공급처 / 제조사
  image?: string;         // 사진 Data URL (Base64)
  notes?: string;         // 비고 / 메모
  createdAt: string;      // 생성일시
  updatedAt: string;      // 수정일시
  printCount?: number;    // 라벨 출력 매수
  isPrinted?: boolean;    // 라벨 출력 완료 여부
  lastPrintedAt?: string; // 최근 라벨 출력 일시
}

export type StockActionType = 'IN' | 'OUT' | 'ADJUST';

export interface StockLog {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  type: StockActionType;
  quantity: number;
  previousQty: number;
  newQty: number;
  manager: string;
  reason: string;
  timestamp: string;
}

export interface LabelPrintConfig {
  presetId?: string;
  widthMm: number;        // 가로 mm
  heightMm: number;       // 세로 mm
  cols?: number;
  rows?: number;
  marginTopMm?: number;
  marginLeftMm?: number;
  gapXMm?: number;
  gapYMm?: number;
  layout: 'portrait' | 'landscape';
  showNotes: boolean;
  showPhoto?: boolean;
  showLocationBadge: boolean;
  showPrice: boolean;
  showSupplier: boolean;
  showBorderCutGuide: boolean;
  showDate: boolean;
  showItemCodeBarcode: boolean;
  showCompanyName?: boolean;
  companyName: string;
  fontSize: 'small' | 'medium' | 'large';
  qrIncludeDetails: boolean;
}
