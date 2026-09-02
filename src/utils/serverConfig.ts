import { Capacitor } from '@capacitor/core';

export interface ServerConfig {
  host: string;
  port: string;
}

const STORAGE_KEY_HOST = 'kcp_server_host';
const STORAGE_KEY_PORT = 'kcp_server_port';
const STORAGE_KEY_OFFLINE_PREF = 'kcp_offline_mode_preferred';

/**
 * 기본 서버 호스트 확인
 */
export function getDefaultServerHost(): string {
  if (Capacitor.isNativePlatform()) {
    // 안드로이드/iOS 네이티브 앱 기본 사내 백엔드 서버 IP
    return '192.168.2.29';
  }
  if (typeof window !== 'undefined') {
    return window.location.hostname || '192.168.2.29';
  }
  return '192.168.2.29';
}

/**
 * 기본 서버 포트 확인
 */
export function getDefaultServerPort(): string {
  // 백엔드 Express 서버 포트는 5000
  return '5000';
}

/**
 * 저장된 서버 호스트 반환
 */
export function getServerHost(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_HOST);
    if (saved && saved.trim()) return saved.trim();
  } catch {
    // ignore
  }
  return getDefaultServerHost();
}

/**
 * 저장된 서버 포트 반환
 */
export function getServerPort(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_PORT);
    if (saved && saved.trim()) return saved.trim();
  } catch {
    // ignore
  }
  return getDefaultServerPort();
}

/**
 * 서버 호스트 및 포트 설정 저장
 */
export function setServerConfig(host: string, port: string): void {
  try {
    const cleanHost = host.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    const cleanPort = port.trim();
    localStorage.setItem(STORAGE_KEY_HOST, cleanHost);
    localStorage.setItem(STORAGE_KEY_PORT, cleanPort);
    window.dispatchEvent(new CustomEvent('kcp:server-config-changed', {
      detail: { host: cleanHost, port: cleanPort }
    }));
  } catch (e) {
    console.warn('[serverConfig] Failed to save server config:', e);
  }
}

/**
 * 서버 설정 초기화
 */
export function resetServerConfig(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_HOST);
    localStorage.removeItem(STORAGE_KEY_PORT);
    window.dispatchEvent(new CustomEvent('kcp:server-config-changed'));
  } catch {
    // ignore
  }
}

/**
 * 오프라인 선호 모드 상태 조회 및 설정
 */
export function isOfflineModePreferred(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY_OFFLINE_PREF) === 'true';
  } catch {
    return false;
  }
}

export function setOfflineModePreferred(isOffline: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY_OFFLINE_PREF, isOffline ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent('kcp:offline-mode-changed', { detail: isOffline }));
  } catch {
    // ignore
  }
}

/**
 * API 호출용 서버 베이스 URL 계산
 * - 브라우저 개발 모드(port 3005)이면서 커스텀 호스트가 지정되지 않은 경우: Vite Proxy('/api') 활용 위해 '' 반환
 * - 커스텀 IP/호스트가 지정되었거나 Capacitor 모바일 환경인 경우: 'http://호스트:포트' 반환
 */
export function getServerBaseUrl(): string {
  const isNative = Capacitor.isNativePlatform();
  const savedHost = localStorage.getItem(STORAGE_KEY_HOST)?.trim();
  const savedPort = localStorage.getItem(STORAGE_KEY_PORT)?.trim();

  // 사용자가 명시적으로 서버 주소나 포트를 설정했거나 모바일 네이티브 환경인 경우
  if (savedHost || savedPort || isNative) {
    const host = savedHost || getDefaultServerHost();
    const port = savedPort || getDefaultServerPort();
    return `http://${host}:${port}`;
  }

  // 브라우저 환경에서 별도 커스텀 설정이 없으면 현재 origin 및 vite proxy 활용
  return '';
}

/**
 * 지정된 호스트와 포트로 서버 연결 테스트 (Ping)
 */
export async function testServerConnection(
  host: string,
  port: string
): Promise<{ success: boolean; latencyMs: number; error?: string; isErpConnected?: boolean }> {
  const cleanHost = host.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  const cleanPort = port.trim();
  const targetUrl = `http://${cleanHost}:${cleanPort}/api/erp/status`;

  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    const res = await fetch(targetUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;

    if (!res.ok) {
      return {
        success: false,
        latencyMs,
        error: `서버가 HTTP ${res.status} 오류를 반환했습니다.`,
      };
    }

    const data = await res.json().catch(() => ({}));
    return {
      success: true,
      latencyMs,
      isErpConnected: Boolean(data?.data?.isConnected),
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;
    if (err.name === 'AbortError') {
      return {
        success: false,
        latencyMs,
        error: '접속 시간 초과 (3.5초 내에 서버 응답 없음)',
      };
    }
    return {
      success: false,
      latencyMs,
      error: err.message || '서버에 연결할 수 없습니다. IP와 포트를 확인해주세요.',
    };
  }
}
