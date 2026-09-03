import { Capacitor } from '@capacitor/core';

export interface FullServerConfig {
  backendHost: string;
  backendPort: string;
  frontendHost: string;
  frontendPort: string;
  dbHost: string;
  dbPort: string;
}

// LocalStorage Keys
export const STORAGE_KEY_BACKEND_HOST = 'kcp_backend_host';
export const STORAGE_KEY_BACKEND_PORT = 'kcp_backend_port';
export const STORAGE_KEY_FRONTEND_HOST = 'kcp_frontend_host';
export const STORAGE_KEY_FRONTEND_PORT = 'kcp_frontend_port';
export const STORAGE_KEY_DB_HOST = 'kcp_db_host';
export const STORAGE_KEY_DB_PORT = 'kcp_db_port';

// Legacy compatibility keys
export const STORAGE_KEY_HOST = 'kcp_server_host';
export const STORAGE_KEY_PORT = 'kcp_server_port';
export const STORAGE_KEY_OFFLINE_PREF = 'kcp_offline_mode_preferred';

// Default values
export const DEFAULT_BACKEND_HOST = '192.168.2.29';
export const DEFAULT_BACKEND_PORT = '5000';
export const DEFAULT_FRONTEND_HOST = '192.168.2.29';
export const DEFAULT_FRONTEND_PORT = '3000';
export const DEFAULT_DB_HOST = '192.168.2.209';
export const DEFAULT_DB_PORT = '6611';

/**
 * 기본 백엔드 서버 호스트 및 포트
 */
export function getDefaultBackendHost(): string {
  if (Capacitor.isNativePlatform()) {
    return DEFAULT_BACKEND_HOST;
  }
  if (typeof window !== 'undefined' && window.location.hostname) {
    return window.location.hostname;
  }
  return DEFAULT_BACKEND_HOST;
}

export function getDefaultBackendPort(): string {
  return DEFAULT_BACKEND_PORT;
}

/**
 * 기본 프론트엔드 서버 호스트 및 포트
 */
export function getDefaultFrontendHost(): string {
  if (typeof window !== 'undefined' && window.location.hostname) {
    return window.location.hostname;
  }
  return DEFAULT_FRONTEND_HOST;
}

export function getDefaultFrontendPort(): string {
  if (typeof window !== 'undefined' && window.location.port) {
    return window.location.port;
  }
  return DEFAULT_FRONTEND_PORT;
}

/**
 * 기본 DB 서버 호스트 및 포트
 */
export function getDefaultDbHost(): string {
  return DEFAULT_DB_HOST;
}

export function getDefaultDbPort(): string {
  return DEFAULT_DB_PORT;
}

// Legacy aliases for backwards compatibility
export const getDefaultServerHost = getDefaultBackendHost;
export const getDefaultServerPort = getDefaultBackendPort;

/**
 * 현재 저장된 백엔드 서버 정보 조회
 */
export function getBackendHost(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_BACKEND_HOST) || localStorage.getItem(STORAGE_KEY_HOST);
    if (saved && saved.trim()) return saved.trim();
  } catch { /* ignore */ }
  return getDefaultBackendHost();
}

export function getBackendPort(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_BACKEND_PORT) || localStorage.getItem(STORAGE_KEY_PORT);
    if (saved && saved.trim()) return saved.trim();
  } catch { /* ignore */ }
  return getDefaultBackendPort();
}

export const getServerHost = getBackendHost;
export const getServerPort = getBackendPort;

/**
 * 현재 저장된 프론트엔드 서버 정보 조회
 */
export function getFrontendHost(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_FRONTEND_HOST);
    if (saved && saved.trim()) return saved.trim();
  } catch { /* ignore */ }
  return getDefaultFrontendHost();
}

export function getFrontendPort(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_FRONTEND_PORT);
    if (saved && saved.trim()) return saved.trim();
  } catch { /* ignore */ }
  return getDefaultFrontendPort();
}

/**
 * 현재 저장된 DB 서버 정보 조회
 */
export function getDbHost(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_DB_HOST);
    if (saved && saved.trim()) return saved.trim();
  } catch { /* ignore */ }
  return getDefaultDbHost();
}

export function getDbPort(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_DB_PORT);
    if (saved && saved.trim()) return saved.trim();
  } catch { /* ignore */ }
  return getDefaultDbPort();
}

/**
 * 전체 서버 설정 가져오기
 */
export function getAllServerConfigs(): FullServerConfig {
  return {
    backendHost: getBackendHost(),
    backendPort: getBackendPort(),
    frontendHost: getFrontendHost(),
    frontendPort: getFrontendPort(),
    dbHost: getDbHost(),
    dbPort: getDbPort(),
  };
}

/**
 * 전체 서버 설정 일괄 저장 (접속테스트 통과 시 자동 저장)
 */
export function saveAllServerConfigs(config: FullServerConfig): void {
  try {
    const cleanBHost = config.backendHost.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    const cleanBPort = config.backendPort.trim();
    const cleanFHost = config.frontendHost.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    const cleanFPort = config.frontendPort.trim();
    const cleanDbHost = config.dbHost.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    const cleanDbPort = config.dbPort.trim();

    localStorage.setItem(STORAGE_KEY_BACKEND_HOST, cleanBHost);
    localStorage.setItem(STORAGE_KEY_BACKEND_PORT, cleanBPort);
    localStorage.setItem(STORAGE_KEY_HOST, cleanBHost);
    localStorage.setItem(STORAGE_KEY_PORT, cleanBPort);

    localStorage.setItem(STORAGE_KEY_FRONTEND_HOST, cleanFHost);
    localStorage.setItem(STORAGE_KEY_FRONTEND_PORT, cleanFPort);

    localStorage.setItem(STORAGE_KEY_DB_HOST, cleanDbHost);
    localStorage.setItem(STORAGE_KEY_DB_PORT, cleanDbPort);

    window.dispatchEvent(new CustomEvent('kcp:server-config-changed', {
      detail: {
        backendHost: cleanBHost,
        backendPort: cleanBPort,
        frontendHost: cleanFHost,
        frontendPort: cleanFPort,
        dbHost: cleanDbHost,
        dbPort: cleanDbPort,
      }
    }));
  } catch (e) {
    console.warn('[serverConfig] Failed to save all server configs:', e);
  }
}

/**
 * 단일 백엔드 서버 설정 저장 (호환성 유지)
 */
export function setServerConfig(host: string, port: string): void {
  const curr = getAllServerConfigs();
  saveAllServerConfigs({
    ...curr,
    backendHost: host,
    backendPort: port,
  });
}

/**
 * 전체 서버 설정 기본값으로 리셋
 */
export function resetAllServerConfigs(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_BACKEND_HOST);
    localStorage.removeItem(STORAGE_KEY_BACKEND_PORT);
    localStorage.removeItem(STORAGE_KEY_HOST);
    localStorage.removeItem(STORAGE_KEY_PORT);
    localStorage.removeItem(STORAGE_KEY_FRONTEND_HOST);
    localStorage.removeItem(STORAGE_KEY_FRONTEND_PORT);
    localStorage.removeItem(STORAGE_KEY_DB_HOST);
    localStorage.removeItem(STORAGE_KEY_DB_PORT);

    window.dispatchEvent(new CustomEvent('kcp:server-config-changed'));
  } catch (e) {
    console.warn('[serverConfig] Failed to reset server configs:', e);
  }
}

export const resetServerConfig = resetAllServerConfigs;

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
 */
export function getServerBaseUrl(): string {
  const isNative = Capacitor.isNativePlatform();
  const savedHost = localStorage.getItem(STORAGE_KEY_BACKEND_HOST)?.trim() || localStorage.getItem(STORAGE_KEY_HOST)?.trim();
  const savedPort = localStorage.getItem(STORAGE_KEY_BACKEND_PORT)?.trim() || localStorage.getItem(STORAGE_KEY_PORT)?.trim();

  if (savedHost || savedPort || isNative) {
    const host = savedHost || getDefaultBackendHost();
    const port = savedPort || getDefaultBackendPort();
    return `http://${host}:${port}`;
  }

  return '';
}

/**
 * 1. 백엔드 서버 통신 테스트 (Ping)
 */
export async function testBackendConnection(
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
      error: err.message || '백엔드 서버에 연결할 수 없습니다. IP와 포트를 확인해주세요.',
    };
  }
}

export const testServerConnection = testBackendConnection;

/**
 * 2. 프론트엔드 서버 통신 테스트 (HTTP Ping)
 */
export async function testFrontendConnection(
  host: string,
  port: string
): Promise<{ success: boolean; latencyMs: number; error?: string }> {
  const cleanHost = host.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  const cleanPort = port.trim();
  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    await fetch(`http://${cleanHost}:${cleanPort}/`, {
      method: 'GET',
      mode: 'no-cors',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return {
      success: true,
      latencyMs: Date.now() - startTime,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;
    if (err.name === 'AbortError') {
      return { success: false, latencyMs, error: '접속 시간 초과 (3초)' };
    }
    return { success: false, latencyMs, error: '프론트엔드 서버 응답 없음' };
  }
}

/**
 * 3. DB 서버 통신 테스트 (백엔드 POST /api/erp/config 통하여 실시간 MSSQL 접속 검증)
 */
export async function testDbConnection(
  backendHost: string,
  backendPort: string,
  dbHost: string,
  dbPort: string
): Promise<{ success: boolean; isConnected: boolean; latencyMs: number; error?: string }> {
  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const cleanBHost = backendHost.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    const cleanBPort = backendPort.trim();
    const cleanDbHost = dbHost.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    const cleanDbPort = parseInt(dbPort.trim(), 10) || 6611;

    const res = await fetch(`http://${cleanBHost}:${cleanBPort}/api/erp/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ server: cleanDbHost, port: cleanDbPort }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;
    const json = await res.json().catch(() => ({}));

    if (json.isConnected && !json.isDummyMode) {
      return {
        success: true,
        isConnected: true,
        latencyMs,
      };
    } else {
      return {
        success: false,
        isConnected: false,
        latencyMs,
        error: json.error || `DB 서버(${cleanDbHost}:${cleanDbPort})에 접속할 수 없습니다. (실서버 응답 없음 / 포트 닫힘)`,
      };
    }
  } catch (err: any) {
    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;
    if (err.name === 'AbortError') {
      return { success: false, isConnected: false, latencyMs, error: 'DB 연결 테스트 시간 초과' };
    }
    return { success: false, isConnected: false, latencyMs, error: err.message || '백엔드를 통한 DB 연결 실패' };
  }
}
