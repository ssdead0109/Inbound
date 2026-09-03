/**
 * SmartRack 다중 키워드 AND 검색 헬퍼 (Multi-keyword AND Search Helper)
 * 
 * 사용자가 공백으로 구분하여 입력한 모든 검색어(토큰)가
 * 대상 텍스트(또는 필드 배열) 안에 전부 포함되어 있는지(AND 조건) 확인합니다.
 * 
 * 예: query = "elbow twin"
 * target = ["000123", "ELBOW 90", "TWIN 60"]
 * -> "elbow" 포함됨 AND "twin" 포함됨 => true!
 */

export function matchesMultiKeyword(
  query: string,
  targetFields: (string | number | undefined | null)[]
): boolean {
  if (!query || !query.trim()) return true;

  // 공백 기준으로 단어 토큰 분리 (소문자화)
  const tokens = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  if (tokens.length === 0) return true;

  // 대상 필드들을 하나의 통합 검색 문자열로 결합 (소문자화)
  const combinedText = targetFields
    .filter((f) => f !== undefined && f !== null)
    .join(' ')
    .toLowerCase();

  // 모든 토큰이 통합 검색 문자열에 포함되어야 함 (AND 조건)
  return tokens.every((token) => combinedText.includes(token));
}

/**
 * 단일 문자열 대상 다중 키워드 AND 매칭
 */
export function matchesMultiKeywordString(query: string, text: string): boolean {
  if (!query || !query.trim()) return true;
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;
  const lowerText = text.toLowerCase();
  return tokens.every((token) => lowerText.includes(token));
}
