/**
 * 이미지를 캔버스를 통해 리사이징 및 압축하여 Base64 문자열로 반환
 */
export async function compressAndFormatImage(
  file: File,
  maxWidth: number = 800,
  maxHeight: number = 800,
  quality: number = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }

        // 흰색 배경 채우기 (투명 PNG 처리)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('File read failed'));
    reader.readAsDataURL(file);
  });
}

/**
 * 기본 플레이스홀더 이미지 SVG 생성 (카테고리별)
 */
export function getCategoryBadgeColor(category: string): { bg: string; text: string; border: string } {
  switch (category) {
    case '전자부품':
    case '전기/전자':
      return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
    case '기계부품':
    case '기계/금구':
      return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    case '원자재':
    case '소재':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    case '공구류':
    case '지그/공구':
      return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
    case '소모품':
    case '포장재':
      return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
    case '완제품':
      return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' };
    default:
      return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' };
  }
}
