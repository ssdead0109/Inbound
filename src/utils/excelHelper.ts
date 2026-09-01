import * as XLSX from 'xlsx';
import { InventoryItem } from '../types/inventory';

export interface ParsedExcelRow {
  id: string;
  code: string;
  name: string;
  spec: string;
  category: string;
  warehouse?: string;     // 명시적 창고명 (예: 특장자재창고-화성)
  rackLocation: string;   // 랙 세부위치 또는 결합 문자열 (예: A-01-1, 미입력)
  quantity: number;
  unit: string;
  safetyStock: number;
  price: number;
  supplier: string;
  notes: string;
  raw?: Record<string, any>;
  rowIndex: number;
  isPrinted?: boolean;
  lastPrintedAt?: string;
  selected?: boolean;
  printCount?: number;
}

export interface DuplicateAnalysisItem {
  rowIndex: number;
  imported: ParsedExcelRow;
  existing?: InventoryItem;
  duplicateType: 'EXACT_CODE' | 'NAME_AND_RACK' | 'WITHIN_FILE';
  action: 'skip' | 'overwrite' | 'add_qty';
}

export interface ExcelImportAnalysis {
  totalRows: number;
  validNewCount: number;
  duplicateCount: number;
  invalidCount: number;
  allParsedRows: ParsedExcelRow[];
  newRows: ParsedExcelRow[];
  duplicates: DuplicateAnalysisItem[];
  invalidRows: { rowIndex: number; raw: Record<string, any>; reason: string }[];
  sheetNames?: string[];
  currentSheet?: string;
}

export interface ParsedLocation {
  warehouse: string;
  rack: string;
  isUnassigned: boolean;
  displayString: string;
}

/**
 * 랙 코드 패턴 검사기:
 * 예: A-01-1, B-02, 01-02-1, 1-2-3, A1-2, R-01, 12-4, AA-01, A01, RACK-01, 랙-A, ZONE-1, 선반-2, BIN-3
 */
export function isRackCode(token: string): boolean {
  if (!token || token.trim() === '') return false;
  const t = token.trim();
  if (t === '미입력' || t === '미지정' || t === '-') return true;

  // 창고, 사업장, 공장 등 명시적 장소 명칭이 포함된 경우 랙 번호가 아님
  if (
    t.includes('창고') ||
    t.includes('공장') ||
    t.includes('화성') ||
    t.includes('특장') ||
    t.includes('사업장') ||
    t.includes('센터') ||
    t.includes('본관') ||
    t.includes('사업부') ||
    t.includes('지점') ||
    t.includes('야적장') ||
    t.includes('보관소')
  ) {
    return false;
  }

  // 순수 랙 번호 패턴
  if (/^[A-Za-z]?\d{1,4}[-_]\d{1,4}([-_]\d{1,4})?$/i.test(t)) return true;
  if (/^[A-Za-z]{1,3}[-_]?\d{1,4}([-_]\d{1,4})?$/i.test(t)) return true;
  if (/^(RACK|랙|ZONE|존|BIN|빈|선반|열|행|단)[-_ ]?[A-Za-z0-9\-_]+$/i.test(t)) return true;
  if (/^[A-Z]\d+$/i.test(t)) return true; // e.g. A01, B12

  return false;
}

/**
 * 공급처명에서 업체코드(예: "(C00123)", "SUP-001 ", "[10234]")는 제외하고 순수 업체명만 깔끔하게 정제
 */
export function cleanSupplierDisplayName(supplier?: string): string {
  if (!supplier || supplier.trim() === '') return '';
  let str = supplier.trim();

  // 1. 괄호로 묶인 코드 제거: (C00123), [10023], (SUP-001)
  str = str.replace(/\([A-Za-z0-9_\-\.]{2,20}\)/g, '').replace(/\[[A-Za-z0-9_\-\.]{2,20}\]/g, '').trim();

  // 2. 접두사 코드 제거: "C00123 ", "SUP-001 ", "10023 ", "V-001 " 등
  str = str.replace(/^[A-Za-z0-9_\-\.]{2,15}\s*[\s\-\/\:_]\s*/, '').trim();

  // 3. 접미사 코드 제거: " - C00123", " _ 10023"
  str = str.replace(/[\s\-\/\:_]+[A-Za-z0-9_\-\.]{2,15}$/, '').trim();

  return str || supplier.trim();
}

/**
 * 창고 및 랙위치 분리 표준 헬퍼 (창고명 완벽 보존 & 미입력 자동 감지)
 * 예: "특장자재창고-화성" -> 창고: "특장자재창고-화성", 랙: "미입력"
 * 예: "특장 자재창고 - 화성" -> 창고: "특장 자재창고 - 화성", 랙: "미입력"
 * 예: "특장자재창고-화성 A-01-1" -> 창고: "특장자재창고-화성", 랙: "A-01-1"
 */
export function parseWarehouseAndRack(locationStr?: string, explicitWarehouse?: string): ParsedLocation {
  const cleanExplicitWh = (explicitWarehouse || '').trim();
  const cleanLoc = (locationStr || '').trim();

  // 1. 명시적 창고명이 전달된 경우 (엑셀의 '창고' 컬럼 또는 품목 warehouse 필드)
  if (cleanExplicitWh && cleanExplicitWh !== '미입력' && cleanExplicitWh !== '-') {
    const wh = cleanExplicitWh;
    let rk = cleanLoc;

    if (!rk || rk === '미입력' || rk === '미지정' || rk === '-' || rk === wh) {
      rk = '미입력';
    } else if (rk.startsWith(wh)) {
      rk = rk.substring(wh.length).trim() || '미입력';
    } else if (rk.includes(wh)) {
      rk = rk.replace(wh, '').replace(/^[\s\/\-_:]+/, '').trim() || '미입력';
    }

    const isUnassigned = !rk || rk === '미입력' || rk === '미지정';
    return {
      warehouse: wh,
      rack: isUnassigned ? '미입력' : rk,
      isUnassigned,
      displayString: isUnassigned ? wh : `${wh} ${rk}`,
    };
  }

  // 2. 위치 문자열이 없거나 미입력인 경우
  if (!cleanLoc || cleanLoc === '미입력' || cleanLoc === '미지정' || cleanLoc === '-') {
    return { warehouse: '-', rack: '미입력', isUnassigned: true, displayString: '미입력' };
  }

  const str = cleanLoc;

  // 3. 단일 토큰 순수 랙 번호인 경우 (예: "A-01-1")
  if (isRackCode(str) && !str.includes(' ')) {
    return { warehouse: '-', rack: str, isUnassigned: false, displayString: str };
  }

  // 4. 공백이나 슬래시로 구분된 복합 문자열인 경우
  // 마지막 토큰이 랙 코드 패턴인지 검사
  if (str.includes(' ') || str.includes('/')) {
    const parts = str.split(/[\s\/]+/).filter(Boolean);
    if (parts.length >= 2) {
      const lastToken = parts[parts.length - 1];
      if (isRackCode(lastToken)) {
        const wh = parts.slice(0, parts.length - 1).join(' ').replace(/[\s\-_/]+$/, '').trim();
        const rk = lastToken.trim();
        const isUnassigned = !rk || rk === '미입력' || rk === '미지정';
        return {
          warehouse: wh || '-',
          rack: isUnassigned ? '미입력' : rk,
          isUnassigned,
          displayString: isUnassigned ? wh : `${wh} ${rk}`,
        };
      }
    }
  }

  // 5. 기본: 창고명 그대로 유지하고 랙위치는 '미입력'
  return {
    warehouse: str,
    rack: '미입력',
    isUnassigned: true,
    displayString: str,
  };
}

/**
 * 품목의 다중 보관 위치를 모두 파싱하여 반환 (콤마, 세미콜론, 줄바꿈 등으로 연결된 다중 위치 완벽 지원)
 */
export function parseItemLocations(itemOrRackLocation?: string | InventoryItem, fallbackWarehouse?: string): ParsedLocation[] {
  let locStr = '';
  let whFallback = fallbackWarehouse || '';

  if (!itemOrRackLocation) {
    return [{ warehouse: whFallback || '미입력', rack: '미입력', isUnassigned: true, displayString: '미입력' }];
  }

  if (typeof itemOrRackLocation === 'object') {
    locStr = itemOrRackLocation.rackLocation || '';
    whFallback = itemOrRackLocation.warehouse || fallbackWarehouse || '';
  } else {
    locStr = itemOrRackLocation;
  }

  if (!locStr || locStr.trim() === '' || locStr === '미입력' || locStr === '미지정' || locStr === '-') {
    const wh = whFallback && whFallback !== '-' && whFallback !== '미입력' ? whFallback : '미입력';
    return [{ warehouse: wh, rack: '미입력', isUnassigned: true, displayString: wh === '미입력' ? '미입력' : wh }];
  }

  // 콤마, 세미콜론, 줄바꿈으로 분리
  const subTokens = locStr.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean);

  if (subTokens.length === 0) {
    const parsed = parseWarehouseAndRack(locStr, whFallback);
    return [parsed];
  }

  const results: ParsedLocation[] = [];
  for (const token of subTokens) {
    const parsed = parseWarehouseAndRack(token, whFallback);
    results.push(parsed);
  }

  return results.length > 0 ? results : [{ warehouse: '미입력', rack: '미입력', isUnassigned: true, displayString: '미입력' }];
}


/**
 * 다양한 헤더 명칭(한글/영문/특수문자 포함)을 표준 필드명으로 정규화
 * 사용자 엑셀 서식: [NO | 창고 | 품목코드 | 품목명 | 규격 | 등급 | 단위 | 기초 | 입고 | 출고 | 재고 | 실사재고 | 구매단가 | 금액 | 안전재고 | 구매처코드 | 구매처]
 */
export function normalizeHeader(key: string): string {
  if (!key) return '';
  const cleaned = String(key)
    .trim()
    .toLowerCase()
    .replace(/[\s_\-\(\)\[\]\{\}\/\.\\\*\:\'\"]/g, '');

  // 0. 순번 / NO (품목코드와 구분)
  if (['no', '순번', '번호', 'row', 'num', 'number'].includes(cleaned)) {
    return 'rowNo';
  }

  // 1. 코드 / 품목코드 / SKU
  if ([
    '품목코드', '품번코드', '자재코드', '부품코드', '관리번호', '품번', '코드', 
    '물품코드', '바코드', '자재번호', '제품코드', '식별번호', '아이템코드', '품목번호',
    'code', 'itemcode', 'itemno', 'partno', 'partnumber', 'modelno', 'sku', 
    'barcode', 'serial', 'skuid', 'id'
  ].includes(cleaned)) {
    return 'code';
  }

  // 2. 품목명 / 품명
  if ([
    '품목명', '품명', '제품명', '이름', '품목', '물품명', '자재명', '자재명칭', 
    '부품명', '단품명', '항목', '품명및규격', '상품명', '품목내역', '자재', '품명규격',
    'name', 'itemname', 'item', 'title', 'description', 'product', 'productname', 
    'material', 'goodsname'
  ].includes(cleaned)) {
    return 'name';
  }

  // 3. 규격 / 사양
  if ([
    '규격', '사양', '규격사양', '규격및사양', '모델명', '사이즈', '치수', '형번', 
    '용량', '규격/사양', '모델', '치수사양', '형식',
    'spec', 'specification', 'specs', 'model', 'size', 'dimension', 'type'
  ].includes(cleaned)) {
    return 'spec';
  }

  // 4. 분류 / 등급 / 카테고리
  if ([
    '등급', '품목등급', '자재등급', '분류', '카테고리', '구분', '대분류', '중분류', '소분류', 
    '품목구분', '자재구분', '종류', '군', '그룹', 'grade',
    'category', 'group', 'class', 'classification', 'section'
  ].includes(cleaned)) {
    return 'category';
  }

  // 5-1. 창고 (Warehouse) - 랙위치와 명확히 분리
  if ([
    '창고', '보관창고', '창고명', '창고구분', '창고위치', '사업장', '공장', '창고명칭', '보관장소', 'warehouse', 'wh'
  ].includes(cleaned)) {
    return 'warehouse';
  }

  // 5-2. 랙위치 / 보관위치 (Rack Location)
  if ([
    '랙위치', '랙', '보관위치', '로케이션', '구역', '선반', '적치위치', 
    '보관랙', '보관구역', '랙번호', '로케이션번호', '보관함',
    'racklocation', 'rack', 'bin', 'zone', 'area', 'shelf', 'rackno', 'loc'
  ].includes(cleaned)) {
    return 'rack';
  }

  // 6. 단위
  if ([
    '단위', '수량단위', '포장단위', '단위(ea)', '단위명',
    'unit', 'uom'
  ].includes(cleaned)) {
    return 'unit';
  }

  // 7. 재고 / 현재고 / 장부재고
  if ([
    '재고', '현재고', '장부재고', '수량', '수량재고', '재고량', '현재수량', '현보유량', 
    '수량(ea)', '재고수량', '보유수량', '수량ea', '개수',
    'quantity', 'qty', 'stock', 'amount', 'count', 'currentstock', 'onhand', 'stockqty'
  ].includes(cleaned)) {
    return 'quantity';
  }

  // 8. 실사재고 / 실재고
  if ([
    '실사재고', '실재고', '실사수량', '실사', '실재고량', '실보유량',
    'actualstock', 'physicalstock', 'realstock', 'actualqty'
  ].includes(cleaned)) {
    return 'actualStock';
  }

  // 9. 기초 / 기초재고
  if ([
    '기초', '기초재고', '전기이월', '이월재고', '기초수량',
    'initialstock', 'beginningstock', 'initqty'
  ].includes(cleaned)) {
    return 'initialStock';
  }

  // 10. 입고
  if ([
    '입고', '입고수량', '입고량', '당기입고', '총입고',
    'inqty', 'incoming', 'receipt'
  ].includes(cleaned)) {
    return 'inQty';
  }

  // 11. 출고
  if ([
    '출고', '출고수량', '출고량', '당기출고', '총출고',
    'outqty', 'outgoing', 'issue'
  ].includes(cleaned)) {
    return 'outQty';
  }

  // 12. 구매단가 / 단가 / 가격
  if ([
    '구매단가', '매입단가', '단가', '가격', '매입가', '출고단가', '단가(원)', '취득단가', 
    '구입단가', '원가', '소비자가',
    'price', 'unitprice', 'cost', 'unitcost', 'purchaseprice', 'buyprice'
  ].includes(cleaned)) {
    return 'price';
  }

  // 13. 금액 / 재고금액 / 총액
  if ([
    '금액', '재고금액', '총금액', '합계금액', '평가금액', '재고평가액', '금액(원)',
    'totalamount', 'totalprice', 'stockvalue'
  ].includes(cleaned)) {
    return 'totalAmount';
  }

  // 14. 안전재고 / 최소재고
  if ([
    '안전재고', '최소재고', '적정재고', '안전재고량', '최소수량', '최소보유량', '적정수량',
    'safetystock', 'minstock', 'minqty', 'safetylevel'
  ].includes(cleaned)) {
    return 'safetyStock';
  }

  // 15. 구매처코드 / 거래처코드
  if ([
    '구매처코드', '거래처코드', '공급처코드', '매입처코드', '협력사코드', '업체코드',
    'suppliercode', 'vendorcode'
  ].includes(cleaned)) {
    return 'supplierCode';
  }

  // 16. 구매처 / 공급처 / 거래처 / 제조사 / 입고업체
  if ([
    '입고업체', '입고처', '구매처', '공급처', '제조사', '거래처', '공급업체', '구입처', '매입처', '협력사', 
    '납품업체', '제작사', 'maker',
    'supplier', 'vendor', 'manufacturer', 'company'
  ].includes(cleaned)) {
    return 'supplier';
  }

  // 17. 비고 / 메모
  if ([
    '비고', '메모', '특이사항', '비고사항', '참조', '기타', '설명', '비고란',
    'notes', 'note', 'remark', 'remarks', 'memo', 'comment', 'description2'
  ].includes(cleaned)) {
    return 'notes';
  }

  return key;
}

/**
 * 숫자 필드 안전 변환 (쉼표, 통화기호, 단위 텍스트 등 제거)
 */
function cleanNumeric(val: any): number {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const str = String(val).replace(/[^\d.\-]/g, '');
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

/**
 * 스마트 엑셀 파싱: 상단 타이틀 행 무시 및 최적의 헤더 행 자동 감지
 */
export async function parseExcelFileSmart(
  file: File,
  targetSheetName?: string
): Promise<{ rawRows: Record<string, any>[]; sheetNames: string[]; currentSheet: string }> {
  const data = await file.arrayBuffer();
  // Read with fallback codepage options for Korean CSVs/workbooks
  const workbook = XLSX.read(data, { 
    type: 'array',
    cellDates: true,
    cellNF: false,
    cellText: true,
  });

  const sheetNames = workbook.SheetNames || [];
  if (sheetNames.length === 0) {
    throw new Error('엑셀 파일에 시트(Sheet)가 존재하지 않습니다.');
  }

  const currentSheet = targetSheetName && sheetNames.includes(targetSheetName)
    ? targetSheetName
    : sheetNames[0];

  const worksheet = workbook.Sheets[currentSheet];
  if (!worksheet) {
    throw new Error(`시트 '${currentSheet}'를 읽을 수 없습니다.`);
  }

  // Read entire sheet as a 2D matrix (Array of Arrays)
  const aoa = XLSX.utils.sheet_to_json<any[]>(worksheet, { 
    header: 1, 
    defval: '', 
    blankrows: false 
  });

  if (!aoa || aoa.length === 0) {
    return { rawRows: [], sheetNames, currentSheet };
  }

  // Find the row that best matches known inventory headers (inspect first 20 rows)
  let bestHeaderRowIndex = 0;
  let maxMatchCount = -1;

  const maxScanRows = Math.min(20, aoa.length);
  for (let r = 0; r < maxScanRows; r++) {
    const row = aoa[r];
    if (!Array.isArray(row)) continue;

    let matchCount = 0;
    row.forEach((cell) => {
      if (cell !== null && cell !== undefined && String(cell).trim() !== '') {
        const norm = normalizeHeader(String(cell));
        if ([
          'code', 'name', 'spec', 'category', 'warehouse', 'rack', 'quantity', 
          'actualStock', 'unit', 'safetyStock', 'price', 'supplier', 'notes'
        ].includes(norm)) {
          matchCount += 3; // Strong header match
        } else if (['rowNo', 'initialStock', 'inQty', 'outQty', 'totalAmount', 'supplierCode'].includes(norm)) {
          matchCount += 2;
        } else if (norm !== String(cell)) {
          matchCount += 1;
        }
      }
    });

    if (matchCount > maxMatchCount) {
      maxMatchCount = matchCount;
      bestHeaderRowIndex = r;
    }
  }

  // Extract headers
  const headerRow = (aoa[bestHeaderRowIndex] || []).map((h, i) => 
    h !== null && h !== undefined && String(h).trim() !== '' 
      ? String(h).trim() 
      : `Column_${i + 1}`
  );

  const rawRows: Record<string, any>[] = [];

  for (let r = bestHeaderRowIndex + 1; r < aoa.length; r++) {
    const rowData = aoa[r];
    if (!Array.isArray(rowData)) continue;

    // Check if the whole row is empty
    const hasAnyValue = rowData.some(
      (cell) => cell !== null && cell !== undefined && String(cell).trim() !== ''
    );
    if (!hasAnyValue) continue;

    const rowObj: Record<string, any> = {};
    headerRow.forEach((colName, colIdx) => {
      const val = rowData[colIdx];
      rowObj[colName] = val !== null && val !== undefined ? val : '';
    });

    // Also store positional indices for fallback
    rowObj['__aoa_row'] = rowData;
    rowObj['__original_row_index'] = r + 1;
    rawRows.push(rowObj);
  }

  return { rawRows, sheetNames, currentSheet };
}

/**
 * 텍스트/클립보드 (TSV / CSV) 파싱 지원
 */
export function parsePastedText(text: string): Record<string, any>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];

  // Detect delimiter (Tab or Comma or Semicolon)
  const firstLine = lines[0];
  const tabCount = (firstLine.match(/\t/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  const delimiter = tabCount >= commaCount ? '\t' : ',';

  const rows = lines.map((line) => {
    if (delimiter === '\t') {
      return line.split('\t').map((c) => c.trim().replace(/^["']|["']$/g, ''));
    }
    // Simple CSV split (handling basic quotes)
    const result: string[] = [];
    let cur = '';
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        inQuote = !inQuote;
      } else if (c === ',' && !inQuote) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += c;
      }
    }
    result.push(cur.trim());
    return result;
  });

  if (rows.length === 0) return [];

  // Check if first row is header
  const headers = rows[0].map((h, i) => h || `Column_${i + 1}`);
  const rawRows: Record<string, any>[] = [];

  for (let r = 1; r < rows.length; r++) {
    const rowData = rows[r];
    const hasAny = rowData.some((c) => c !== '');
    if (!hasAny) continue;

    const rowObj: Record<string, any> = {};
    headers.forEach((colName, colIdx) => {
      rowObj[colName] = rowData[colIdx] || '';
    });
    rowObj['__original_row_index'] = r + 1;
    rawRows.push(rowObj);
  }

  return rawRows;
}

/**
 * 엑셀 파일 기본 파싱 함수 (이전 호환용)
 */
export async function parseExcelFile(file: File): Promise<Record<string, any>[]> {
  const result = await parseExcelFileSmart(file);
  return result.rawRows;
}

/**
 * 엑셀 데이터 분석 및 유효성/중복 검증 (극도로 관대하고 유연한 파싱)
 */
export function analyzeExcelData(
  rawRows: Record<string, any>[],
  existingItems: InventoryItem[],
  sheetNames: string[] = [],
  currentSheet: string = ''
): ExcelImportAnalysis {
  const allParsedRows: ParsedExcelRow[] = [];
  const invalidRows: { rowIndex: number; raw: Record<string, any>; reason: string }[] = [];

  rawRows.forEach((row, idx) => {
    const rowNum = row['__original_row_index'] || idx + 2;
    const normalized: Record<string, any> = {};

    Object.keys(row).forEach((key) => {
      if (key.startsWith('__')) return;
      const standardKey = normalizeHeader(key);
      normalized[standardKey] = row[key];
    });

    let rawCode = String(normalized.code || '').trim();
    let rawName = String(normalized.name || '').trim();
    let rawSpec = String(normalized.spec || '').trim();
    let rawCategory = String(normalized.category || '').trim();
    let rawWarehouse = String(normalized.warehouse || '').trim();
    let rawRack = String(normalized.rack || '').trim();
    let rawUnit = String(normalized.unit || '').trim();
    let rawSupplier = String(normalized.supplier || '').trim();
    let rawSupplierCode = String(normalized.supplierCode || '').trim();
    let rawNotes = String(normalized.notes || '').trim();

    // Fallback: If no recognized name, check other text columns in the row
    if (!rawName) {
      if (rawCode) {
        rawName = rawCode;
      } else if (rawSpec) {
        rawName = rawSpec;
      } else {
        // Look for any non-empty column value
        const entries = Object.entries(row).filter(
          ([k, v]) => !k.startsWith('__') && v !== null && v !== undefined && String(v).trim() !== ''
        );
        if (entries.length > 0) {
          rawName = String(entries[0][1]).trim();
        }
      }
    }

    // If still absolutely no text found, skip or record invalid
    if (!rawName) {
      invalidRows.push({
        rowIndex: rowNum,
        raw: row,
        reason: '품목 정보를 식별할 수 있는 데이터가 없습니다.',
      });
      return;
    }

    // If code is still missing, auto-generate standard item code
    if (!rawCode) {
      rawCode = `ITEM-${Date.now().toString().slice(-4)}-${String(idx + 1).padStart(3, '0')}`;
    }

    // Supplier formatting: 업체명 우선 보존, 코드와 결합하지 않음
    let finalSupplier = rawSupplier;
    if (!finalSupplier && rawSupplierCode) {
      finalSupplier = rawSupplierCode;
    }

    // Category / Grade formatting
    if (!rawCategory) {
      rawCategory = 'A등급';
    }

    // 🌟 Warehouse & Rack location mapping:
    // 1) 엑셀에 창고 컬럼(rawWarehouse)이 있는 경우: 창고명 그대로 유지, 랙위치는 랙컬럼 값(없으면 '미입력')
    // 2) 랙위치만 있는 경우: parseWarehouseAndRack으로 안전하게 분리
    let parsedWh = '';
    let parsedRk = '미입력';

    if (rawWarehouse) {
      const loc = parseWarehouseAndRack(rawRack, rawWarehouse);
      parsedWh = loc.warehouse;
      parsedRk = loc.rack;
    } else if (rawRack) {
      const loc = parseWarehouseAndRack(rawRack);
      parsedWh = loc.warehouse !== '-' ? loc.warehouse : '본관창고';
      parsedRk = loc.rack;
    } else {
      parsedWh = '본관창고';
      parsedRk = '미입력';
    }

    const combinedRackLocation = parsedRk && parsedRk !== '미입력'
      ? `${parsedWh} ${parsedRk}`
      : parsedWh;

    // Default unit
    if (!rawUnit) {
      rawUnit = 'EA';
    }

    // Determine quantity: prioritize 실사재고 if provided, then 재고, then 기초
    let quantity = 0;
    if (normalized.actualStock !== undefined && normalized.actualStock !== null && String(normalized.actualStock).trim() !== '') {
      quantity = cleanNumeric(normalized.actualStock);
    } else if (normalized.quantity !== undefined && normalized.quantity !== null && String(normalized.quantity).trim() !== '') {
      quantity = cleanNumeric(normalized.quantity);
    } else if (normalized.initialStock !== undefined && normalized.initialStock !== null && String(normalized.initialStock).trim() !== '') {
      quantity = cleanNumeric(normalized.initialStock);
    }

    const safetyStock = cleanNumeric(normalized.safetyStock);
    const price = cleanNumeric(normalized.price);

    // Build extra notes from in/out if available
    const extraNotes: string[] = [];
    if (rawNotes) extraNotes.push(rawNotes);
    if (normalized.inQty) extraNotes.push(`입고: ${normalized.inQty}`);
    if (normalized.outQty) extraNotes.push(`출고: ${normalized.outQty}`);
    const finalNotes = extraNotes.join(' | ');

    const parsedRow: ParsedExcelRow = {
      id: `excel-row-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      code: rawCode,
      name: rawName,
      spec: rawSpec,
      category: rawCategory,
      warehouse: parsedWh,
      rackLocation: combinedRackLocation,
      quantity,
      unit: rawUnit,
      safetyStock,
      price,
      supplier: finalSupplier,
      notes: finalNotes,
      raw: row,
      rowIndex: rowNum,
      isPrinted: false,
      selected: true,
      printCount: 1,
    };

    allParsedRows.push(parsedRow);
  });

  const analyzed = analyzeParsedRows(allParsedRows, existingItems, invalidRows);
  return {
    ...analyzed,
    sheetNames,
    currentSheet,
  };
}

/**
 * 파싱/수정된 행 목록을 기반으로 중복 및 상태 재분석
 * 🌟 규칙: 중복된 품목은 기본 제외하되, 입고업체(supplier)가 다른 경우에는 신규 품목으로 추가 허용!
 */
export function analyzeParsedRows(
  rows: ParsedExcelRow[],
  existingItems: InventoryItem[],
  invalidRows: { rowIndex: number; raw: Record<string, any>; reason: string }[] = []
): ExcelImportAnalysis {
  const newRows: ParsedExcelRow[] = [];
  const duplicates: DuplicateAnalysisItem[] = [];

  const existingByCode = new Map<string, InventoryItem>();
  const existingByNameRack = new Map<string, InventoryItem>();

  existingItems.forEach((item) => {
    if (item.code) existingByCode.set(item.code.trim().toUpperCase(), item);
    const key = `${(item.name || '').trim().toLowerCase()}_${(item.rackLocation || '').trim().toLowerCase()}`;
    existingByNameRack.set(key, item);
  });

  const seenInFileKeys = new Set<string>();

  const isSameSupplier = (s1?: string, s2?: string): boolean => {
    const str1 = (s1 || '').trim().toLowerCase();
    const str2 = (s2 || '').trim().toLowerCase();
    return str1 === str2;
  };

  rows.forEach((parsedRow) => {
    const codeUpper = (parsedRow.code || '').trim().toUpperCase();
    const nameRackKey = `${(parsedRow.name || '').trim().toLowerCase()}_${(parsedRow.rackLocation || '').trim().toLowerCase()}`;
    const rowSupplier = (parsedRow.supplier || '').trim().toLowerCase();

    // 1. Check duplicate with existing DB by Code
    if (codeUpper && existingByCode.has(codeUpper)) {
      const existingMatch = existingByCode.get(codeUpper)!;
      // 입고업체가 동일한 경우에만 중복으로 처리 (입고업체가 다르면 신규 추가)
      if (isSameSupplier(existingMatch.supplier, parsedRow.supplier)) {
        duplicates.push({
          rowIndex: parsedRow.rowIndex,
          imported: parsedRow,
          existing: existingMatch,
          duplicateType: 'EXACT_CODE',
          action: 'skip',
        });
        return;
      }
    }

    // 2. Check duplicate with existing DB by Name + Rack
    if (existingByNameRack.has(nameRackKey)) {
      const existingMatch = existingByNameRack.get(nameRackKey)!;
      // 입고업체가 동일한 경우에만 중복으로 처리
      if (isSameSupplier(existingMatch.supplier, parsedRow.supplier)) {
        duplicates.push({
          rowIndex: parsedRow.rowIndex,
          imported: parsedRow,
          existing: existingMatch,
          duplicateType: 'NAME_AND_RACK',
          action: 'skip',
        });
        return;
      }
    }

    // 3. Check duplicate within the same Excel file (Code + Supplier)
    const fileKey = `${codeUpper}_${rowSupplier}`;
    if (codeUpper && seenInFileKeys.has(fileKey)) {
      duplicates.push({
        rowIndex: parsedRow.rowIndex,
        imported: parsedRow,
        existing: undefined,
        duplicateType: 'WITHIN_FILE',
        action: 'skip',
      });
      return;
    }

    if (codeUpper) {
      seenInFileKeys.add(fileKey);
    }
    newRows.push(parsedRow);
  });

  return {
    totalRows: rows.length + invalidRows.length,
    validNewCount: newRows.length,
    duplicateCount: duplicates.length,
    invalidCount: invalidRows.length,
    allParsedRows: rows,
    newRows,
    duplicates,
    invalidRows,
  };
}

/**
 * 엑셀 표준 템플릿 다운로드 생성 (사용자 양식 100% 일치)
 */
export function downloadExcelTemplate(): void {
  const headers = [
    'NO',
    '창고',
    '품목코드',
    '품목명',
    '규격',
    '등급',
    '단위',
    '기초',
    '입고',
    '출고',
    '재고',
    '실사재고',
    '구매단가',
    '금액',
    '안전재고',
    '구매처코드',
    '구매처',
  ];

  const sampleRows = [
    [
      1,
      '특장자재창고-화성',
      'ELEC-PS-001',
      'SMPS 산업용 전원공급장치 24V 10A',
      '24V DC / 240W / DIN-Rail',
      'A등급',
      'EA',
      50,
      10,
      15,
      45,
      45,
      38500,
      1732500,
      10,
      'SUP-001',
      '명지전자(주)',
    ],
    [
      2,
      '제1창고 A-02-1',
      'MECH-BL-6204',
      '고정밀 깊은홈 볼베어링 6204ZZ',
      '20x47x14mm',
      'A등급',
      'EA',
      100,
      50,
      30,
      120,
      120,
      4200,
      504000,
      30,
      'SUP-002',
      '삼우베어링정밀',
    ],
    [
      3,
      'B동-02-4',
      'RAW-BOLT-M5',
      'SUS304 렌치볼트 M5 x 20mm',
      '스테인리스 304 (100EA/Box)',
      'B등급',
      'BOX',
      90,
      20,
      25,
      85,
      85,
      7500,
      637500,
      20,
      'SUP-003',
      '태광화스너',
    ],
    [
      4,
      '본관창고 C-01-2',
      'PNEU-CY-01',
      '복동 에어 실린더 CDM2B20-50Z',
      '내경 20mm x 행정 50mm',
      'A등급',
      'EA',
      20,
      5,
      7,
      18,
      18,
      28000,
      504000,
      5,
      'SUP-004',
      '한국SMC',
    ],
    [
      5,
      '특장자재창고-화성 A-03-2',
      'SEN-PROX-01',
      '원주형 근접센서 PR18-8DN',
      '검출거리 8mm / NPN NO / M18',
      'A등급',
      'EA',
      40,
      10,
      15,
      35,
      35,
      14500,
      507500,
      10,
      'SUP-005',
      '오토닉스',
    ],
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);

  // Set column widths
  ws['!cols'] = [
    { wch: 6 },  // NO
    { wch: 20 }, // 창고
    { wch: 18 }, // 품목코드
    { wch: 32 }, // 품목명
    { wch: 26 }, // 규격
    { wch: 10 }, // 등급
    { wch: 8 },  // 단위
    { wch: 8 },  // 기초
    { wch: 8 },  // 입고
    { wch: 8 },  // 출고
    { wch: 8 },  // 재고
    { wch: 10 }, // 실사재고
    { wch: 12 }, // 구매단가
    { wch: 14 }, // 금액
    { wch: 10 }, // 안전재고
    { wch: 12 }, // 구매처코드
    { wch: 18 }, // 구매처
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '재고마스터');
  XLSX.writeFile(wb, 'SmartRack_표준_재고등록_양식.xlsx');
}

/**
 * 엑셀 샘플 목데이터 반환
 */
export function getMockExcelData(): ParsedExcelRow[] {
  return [
    {
      id: `mock-1-${Date.now()}`,
      code: 'ELEC-PS-24V',
      name: 'SMPS 산업용 전원공급장치 24V 10A',
      spec: '24V DC / 240W / DIN-Rail',
      category: 'A등급',
      warehouse: '특장자재창고-화성',
      rackLocation: '특장자재창고-화성',
      quantity: 45,
      unit: 'EA',
      safetyStock: 10,
      price: 38500,
      supplier: '명지전자(주)',
      notes: '초도 입고 완료',
      rowIndex: 2,
      isPrinted: false,
      selected: true,
      printCount: 1,
    },
    {
      id: `mock-2-${Date.now()}`,
      code: 'MECH-BL-6204',
      name: '고정밀 깊은홈 볼베어링 6204ZZ',
      spec: '20x47x14mm',
      category: 'A등급',
      warehouse: '제1창고',
      rackLocation: '제1창고 A-02-1',
      quantity: 120,
      unit: 'EA',
      safetyStock: 30,
      price: 4200,
      supplier: '삼우베어링정밀',
      notes: '정기 점검 부품',
      rowIndex: 3,
      isPrinted: false,
      selected: true,
      printCount: 1,
    },
    {
      id: `mock-3-${Date.now()}`,
      code: 'RAW-BOLT-M5',
      name: 'SUS304 렌치볼트 M5 x 20mm',
      spec: '스테인리스 304 (100EA/Box)',
      category: 'B등급',
      warehouse: 'B동',
      rackLocation: 'B동-02-4',
      quantity: 85,
      unit: 'BOX',
      safetyStock: 20,
      price: 7500,
      supplier: '태광화스너',
      notes: '규격 규격품',
      rowIndex: 4,
      isPrinted: false,
      selected: true,
      printCount: 1,
    },
    {
      id: `mock-4-${Date.now()}`,
      code: 'PNEU-CY-01',
      name: '복동 에어 실린더 CDM2B20-50Z',
      spec: '내경 20mm x 행정 50mm',
      category: 'A등급',
      warehouse: '본관창고',
      rackLocation: '본관창고 C-01-2',
      quantity: 18,
      unit: 'EA',
      safetyStock: 5,
      price: 28000,
      supplier: '한국SMC',
      notes: '',
      rowIndex: 5,
      isPrinted: false,
      selected: true,
      printCount: 1,
    },
    {
      id: `mock-5-${Date.now()}`,
      code: 'SEN-PROX-01',
      name: '원주형 근접센서 PR18-8DN',
      spec: '검출거리 8mm / NPN NO / M18',
      category: 'A등급',
      warehouse: '특장자재창고-화성',
      rackLocation: '특장자재창고-화성 A-03-2',
      quantity: 35,
      unit: 'EA',
      safetyStock: 10,
      price: 14500,
      supplier: '오토닉스',
      notes: '자동화 라인 적용',
      rowIndex: 6,
      isPrinted: false,
      selected: true,
      printCount: 1,
    },
  ];
}

/**
 * 현재 재고 목록 엑셀 파일 내보내기 다운로드
 */
export function exportItemsToExcel(items: InventoryItem[], filename?: string): void {
  const headers = [
    'NO',
    '창고',
    '품목코드',
    '품목명',
    '규격',
    '등급',
    '단위',
    '현재고',
    '구매단가',
    '재고금액',
    '안전재고',
    '입고업체',
    '비고',
    '최종수정일',
  ];

  const rows = items.map((item, idx) => {
    const { warehouse, rack } = parseWarehouseAndRack(item.rackLocation, item.warehouse);
    const locationDisplay = rack && rack !== '미입력' ? `${warehouse} ${rack}` : warehouse;

    return [
      idx + 1,
      locationDisplay || '미입력',
      item.code || '',
      item.name || '',
      item.spec || '',
      item.category || '일반',
      item.unit || 'EA',
      item.quantity || 0,
      item.price || 0,
      (item.quantity || 0) * (item.price || 0),
      item.safetyStock || 0,
      item.supplier || '',
      item.notes || '',
      item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('ko-KR') : '',
    ];
  });

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 22 },
    { wch: 18 },
    { wch: 32 },
    { wch: 26 },
    { wch: 10 },
    { wch: 8 },
    { wch: 10 },
    { wch: 12 },
    { wch: 14 },
    { wch: 10 },
    { wch: 20 },
    { wch: 24 },
    { wch: 14 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '재고현황');
  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const finalFilename = filename || `스마트랙_재고현황_${dateStr}.xlsx`;
  XLSX.writeFile(wb, finalFilename.endsWith('.xlsx') ? finalFilename : `${finalFilename}.xlsx`);
}
