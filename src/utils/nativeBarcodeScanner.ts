import { Capacitor } from '@capacitor/core';

export interface NativeScanResult {
  hasScanned: boolean;
  content?: string;
  isCancelled?: boolean;
  error?: string;
}

/**
 * Capacitor 네이티브 하이브리드 앱 환경에서 Google ML Kit 바코드/QR 스캐너를 호출하는 브릿지 인터페이스
 * - 플러그인이 설치되어 있고 사용 가능할 때 실시간 고속 오버레이 스캔 실행
 * - 플러그인이 미설치되어 있거나 웹 브라우저 환경인 경우 안전하게 hasScanned: false 반환하여 html5-qrcode로 Fallback 유도
 */
export async function scanWithNativeBarcodeScanner(): Promise<NativeScanResult> {
  // 1. 웹 브라우저 환경이면 즉시 Fallback
  if (!Capacitor.isNativePlatform()) {
    return { hasScanned: false };
  }

  try {
    // 2. BarcodeScanner 플러그인 등록 여부 확인
    const capacitorPlugins = (Capacitor as any).Plugins || {};
    let BarcodeScanner = capacitorPlugins.BarcodeScanner;

    if (!BarcodeScanner && Capacitor.isPluginAvailable('BarcodeScanner')) {
      BarcodeScanner = (window as any).BarcodeScanner || capacitorPlugins.BarcodeScanner;
    }

    // 동적 import 시도 (빌드 시 번들에 없더라도 안전하게 무시)
    if (!BarcodeScanner) {
      try {
        const mlkitModule = await (Function('return import("@capacitor-mlkit/barcode-scanning")')() as Promise<any>);
        if (mlkitModule && mlkitModule.BarcodeScanner) {
          BarcodeScanner = mlkitModule.BarcodeScanner;
        }
      } catch {
        // 모듈 미설치 시 정상적인 무시
      }
    }

    if (!BarcodeScanner) {
      console.log('[NativeScanner] @capacitor-mlkit/barcode-scanning 플러그인이 감지되지 않아 LiveScannerModal로 Fallback합니다.');
      return { hasScanned: false };
    }

    // 3. 기기 지원 여부 체크
    if (typeof BarcodeScanner.isSupported === 'function') {
      const isSupportedRes = await BarcodeScanner.isSupported();
      if (!isSupportedRes?.supported) {
        console.warn('[NativeScanner] 기기에서 BarcodeScanner를 지원하지 않습니다.');
        return { hasScanned: false };
      }
    }

    // 4. Android Google Barcode Scanner 모듈 설치 여부 확인
    if (typeof BarcodeScanner.isGoogleBarcodeScannerModuleAvailable === 'function') {
      const { available } = await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
      if (!available && typeof BarcodeScanner.installGoogleBarcodeScannerModule === 'function') {
        console.log('[NativeScanner] Google Barcode Scanner 모듈을 다운로드합니다...');
        await BarcodeScanner.installGoogleBarcodeScannerModule();
      }
    }

    // 5. 카메라 권한 확인 및 요청
    if (typeof BarcodeScanner.checkPermissions === 'function') {
      const permStatus = await BarcodeScanner.checkPermissions();
      if (permStatus.camera !== 'granted') {
        const reqStatus = await BarcodeScanner.requestPermissions();
        if (reqStatus.camera !== 'granted') {
          return { hasScanned: false, error: '카메라 권한이 거부되었습니다.' };
        }
      }
    }

    // 6. 실시간 ML Kit 바코드/QR 스캔 실행
    if (typeof BarcodeScanner.scan === 'function') {
      const result = await BarcodeScanner.scan({
        formats: ['QR_CODE', 'CODE_128', 'CODE_39', 'EAN_13'],
      });

      const barcodes = result?.barcodes || [];
      if (barcodes.length > 0 && barcodes[0]?.rawValue) {
        return {
          hasScanned: true,
          content: barcodes[0].rawValue.trim(),
        };
      }
      if (result?.rawValue) {
        return {
          hasScanned: true,
          content: String(result.rawValue).trim(),
        };
      }
    }

    return { hasScanned: false };
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    // 사용자가 스캔 창을 닫거나 취소한 경우
    if (
      errMsg.toLowerCase().includes('cancel') ||
      errMsg.toLowerCase().includes('dismiss') ||
      errMsg.toLowerCase().includes('closed')
    ) {
      return { hasScanned: false, isCancelled: true };
    }

    console.warn('[NativeScanner] ML Kit 바코드 스캐닝 실행 중 예외 발생, LiveScannerModal로 전환합니다:', err);
    return { hasScanned: false, error: errMsg };
  }
}
