/**
 * SmartRack / Inbound - MSSQL Server Database Adapter
 * 사내 ERP MSSQL Server 실시간 연결 및 쿼리 실행 모듈
 */
import sql from 'mssql';
import dotenv from 'dotenv';
dotenv.config();

export interface MssqlConfig {
  server: string;
  port: number;
  user: string;
  password?: string;
  database: string;
  options?: {
    encrypt?: boolean;
    trustServerCertificate?: boolean;
  };
}

export const DEFAULT_MSSQL_CONFIG: MssqlConfig = {
  server: (process.env.MSSQL_SERVER || '192.168.2.209').replace(/^["']|["']$/g, ''),
  port: parseInt(process.env.MSSQL_PORT || '6611', 10),
  user: (process.env.MSSQL_USER || 'sa').replace(/^["']|["']$/g, ''),
  password: (process.env.MSSQL_PASSWORD || 'kcpdb16605#').replace(/^["']|["']$/g, ''),
  database: (process.env.MSSQL_DATABASE || 'System9').replace(/^["']|["']$/g, ''),
  options: {
    encrypt: process.env.MSSQL_ENCRYPT === 'true',
    trustServerCertificate: true,
  },
};

export class MssqlAdapter {
  private pool: sql.ConnectionPool | null = null;
  private isConnected = false;
  private config: MssqlConfig;
  private lastConnectAttemptTime = 0;
  private lastConnectFailed = false;
  private readonly FAIL_COOLDOWN_MS = 6000;

  constructor(config: MssqlConfig = DEFAULT_MSSQL_CONFIG) {
    this.config = config;
  }

  public async connect(force = false): Promise<boolean> {
    try {
      if (this.pool && this.isConnected) {
        return true;
      }

      const now = Date.now();
      if (!force && this.lastConnectFailed && (now - this.lastConnectAttemptTime < this.FAIL_COOLDOWN_MS)) {
        return false;
      }
      this.lastConnectAttemptTime = now;

      console.log(`[MSSQL] Connecting to ${this.config.server}:${this.config.port}/${this.config.database} (User: ${this.config.user})...`);
      
      const sqlConfig: sql.config = {
        server: this.config.server,
        port: this.config.port,
        user: this.config.user,
        password: this.config.password,
        database: this.config.database,
        options: {
          encrypt: this.config.options?.encrypt ?? false,
          trustServerCertificate: this.config.options?.trustServerCertificate ?? true,
        },
        connectionTimeout: 3000,
        requestTimeout: 10000,
        pool: {
          max: 10,
          min: 0,
          idleTimeoutMillis: 30000,
        },
      };

      this.pool = await new sql.ConnectionPool(sqlConfig).connect();
      this.isConnected = true;
      this.lastConnectFailed = false;
      console.log(`[MSSQL] ✅ Connected successfully to ${this.config.database}!`);
      return true;
    } catch (err: any) {
      console.error(`[MSSQL] ❌ Connection failed:`, err.message);
      this.isConnected = false;
      this.lastConnectFailed = true;
      this.pool = null;
      return false;
    }
  }

  public async query<T = any>(sqlQuery: string, params?: Record<string, any>): Promise<T[]> {
    if (!this.isConnected || !this.pool) {
      const ok = await this.connect();
      if (!ok) throw new Error('MSSQL 데이터베이스에 연결되어 있지 않습니다.');
    }

    const request = this.pool!.request();
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        request.input(key, value);
      }
    }

    const result = await request.query(sqlQuery);
    return result.recordset as T[];
  }

  public getStatus() {
    return {
      isConnected: this.isConnected,
      server: this.config.server,
      port: this.config.port,
      user: this.config.user,
      database: this.config.database,
    };
  }

  public async close() {
    if (this.pool) {
      await this.pool.close();
      this.pool = null;
      this.isConnected = false;
    }
  }
}

export const mssqlAdapter = new MssqlAdapter();
