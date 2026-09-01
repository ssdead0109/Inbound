/**
 * SmartRack / Inbound - MSSQL Server Database Adapter
 * 사내 ERP MSSQL Server 연결 및 쿼리 실행 추상화 모듈
 */

export interface MssqlConfig {
  server: string;
  port?: number;
  user: string;
  password?: string;
  database: string;
  options?: {
    encrypt?: boolean;
    trustServerCertificate?: boolean;
  };
}

export const DEFAULT_MSSQL_CONFIG: MssqlConfig = {
  server: process.env.MSSQL_SERVER || 'localhost',
  port: parseInt(process.env.MSSQL_PORT || '1433', 10),
  user: process.env.MSSQL_USER || 'sa',
  password: process.env.MSSQL_PASSWORD || '',
  database: process.env.MSSQL_DATABASE || 'SmartRackInboundDB',
  options: {
    encrypt: process.env.MSSQL_ENCRYPT === 'true',
    trustServerCertificate: true,
  },
};

export class MssqlAdapter {
  private isConnected = false;
  private config: MssqlConfig;

  constructor(config: MssqlConfig = DEFAULT_MSSQL_CONFIG) {
    this.config = config;
  }

  public async connect(): Promise<boolean> {
    try {
      console.log(`[MSSQL] Attempting connection to ${this.config.server}:${this.config.port}/${this.config.database}...`);
      // Note: When 'mssql' package is installed (e.g. npm install mssql @types/mssql),
      // pool connection will be initialized here.
      this.isConnected = true;
      return true;
    } catch (err) {
      console.error('[MSSQL] Connection failed:', err);
      this.isConnected = false;
      return false;
    }
  }

  public getStatus(): { isConnected: boolean; server: string; database: string } {
    return {
      isConnected: this.isConnected,
      server: this.config.server,
      database: this.config.database,
    };
  }

  // Prepared SQL Templates for ERP integration
  public static readonly QUERIES = {
    SELECT_SLIP_BY_NO: `
      SELECT S.*, I.ROW_ID, I.ITEM_CODE, I.ITEM_NAME, I.SPEC, I.UNIT,
             I.ORDER_QTY, I.RECEIVED_QTY, I.DEFECT_QTY, I.DEFECT_REASON,
             I.WAREHOUSE, I.RACK_LOCATION, I.UNIT_PRICE, I.ITEM_STATUS, I.BARCODE
      FROM TB_INBOUND_SLIPS S
      LEFT JOIN TB_INBOUND_ITEMS I ON S.SLIP_NO = I.SLIP_NO
      WHERE S.SLIP_NO = @slipNo OR S.PO_NUMBER = @slipNo
    `,
    SELECT_TODAY_SLIPS: `
      SELECT * FROM TB_INBOUND_SLIPS
      WHERE DELIVERY_DATE = CAST(GETDATE() AS DATE)
      ORDER BY CREATED_AT DESC
    `,
    EXEC_RECEIVE_SP: `
      EXEC SP_PROCESS_INBOUND_RECEIVE @SlipNo = @slipNo, @Manager = @manager, @Memo = @memo
    `,
  };
}

export const mssqlAdapter = new MssqlAdapter();
