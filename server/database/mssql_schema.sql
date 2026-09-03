-- ==========================================================
-- SmartRack / Inbound ERP System - MSSQL Server DDL Script
-- 용도: 사내 ERP MSSQL Server 연동을 위한 납품확인서 및 입고 테이블 정의
-- ==========================================================

-- 1. 납품확인서 마스터 테이블 (TB_INBOUND_SLIPS)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TB_INBOUND_SLIPS')
BEGIN
    CREATE TABLE TB_INBOUND_SLIPS (
        SLIP_NO NVARCHAR(50) NOT NULL PRIMARY KEY,            -- 납품확인서 전표번호 (예: DN-20260831-001)
        SUPPLIER_CODE NVARCHAR(50) NOT NULL,                  -- 공급업체 코드 (예: SUP-DH01)
        SUPPLIER_NAME NVARCHAR(150) NOT NULL,                 -- 공급업체명 (예: (주)대한정밀전자)
        PO_NUMBER NVARCHAR(50) NULL,                          -- 사내 발주번호 (예: PO-20260825-01)
        DELIVERY_DATE DATE NOT NULL,                          -- 납품일자 (YYYY-MM-DD)
        STATUS NVARCHAR(20) NOT NULL DEFAULT 'WAITING',       -- 상태: WAITING, INSPECTING, COMPLETED, PARTIAL, HOLD, CANCELLED
        TOTAL_ITEMS INT NOT NULL DEFAULT 0,                   -- 총 품목 건수
        TOTAL_ORDER_QTY DECIMAL(18, 4) NOT NULL DEFAULT 0,    -- 총 납품 발주수량
        TOTAL_RECEIVED_QTY DECIMAL(18, 4) NOT NULL DEFAULT 0, -- 총 실입고 수량
        TOTAL_DEFECT_QTY DECIMAL(18, 4) NOT NULL DEFAULT 0,   -- 총 불량 수량
        MANAGER NVARCHAR(50) NULL,                            -- 입고 검수 담당자명
        INBOUND_DATE DATETIME2 NULL,                          -- 입고 완료 일시
        MEMO NVARCHAR(500) NULL,                              -- 비고 / 특이사항
        CREATED_AT DATETIME2 NOT NULL DEFAULT GETDATE(),      -- 생성일시
        UPDATED_AT DATETIME2 NOT NULL DEFAULT GETDATE()       -- 수정일시
    );

    CREATE INDEX IX_INBOUND_SLIPS_DATE ON TB_INBOUND_SLIPS(DELIVERY_DATE, STATUS);
    CREATE INDEX IX_INBOUND_SLIPS_SUPPLIER ON TB_INBOUND_SLIPS(SUPPLIER_CODE);
END
GO

-- 2. 납품확인서 상세 품목 테이블 (TB_INBOUND_ITEMS)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TB_INBOUND_ITEMS')
BEGIN
    CREATE TABLE TB_INBOUND_ITEMS (
        ROW_ID NVARCHAR(50) NOT NULL PRIMARY KEY,             -- 행 고유 식별자
        SLIP_NO NVARCHAR(50) NOT NULL,                        -- 납품확인서 전표번호 (FK)
        ITEM_CODE NVARCHAR(50) NOT NULL,                      -- 자재 품목코드 (SKU)
        ITEM_NAME NVARCHAR(200) NOT NULL,                     -- 품목명
        SPEC NVARCHAR(200) NULL,                              -- 규격 / 사양
        UNIT NVARCHAR(20) NOT NULL DEFAULT 'EA',              -- 단위 (EA, BOX, SET, KG 등)
        ORDER_QTY DECIMAL(18, 4) NOT NULL DEFAULT 0,          -- 납품/발주 요청 수량
        RECEIVED_QTY DECIMAL(18, 4) NOT NULL DEFAULT 0,       -- 실입고 수량
        DEFECT_QTY DECIMAL(18, 4) NOT NULL DEFAULT 0,         -- 불량 수량
        DEFECT_REASON NVARCHAR(200) NULL,                     -- 불량 사유
        WAREHOUSE NVARCHAR(100) NOT NULL DEFAULT '특장자재창고', -- 입고 창고
        UNIT_PRICE DECIMAL(18, 2) NULL DEFAULT 0,             -- 입고 단가
        ITEM_STATUS NVARCHAR(20) NOT NULL DEFAULT 'WAITING',  -- 상태: WAITING, CHECKED, COMPLETED, DEFECT
        BARCODE NVARCHAR(100) NULL,                           -- QR/바코드 문자열
        NOTES NVARCHAR(300) NULL,                             -- 비고
        CREATED_AT DATETIME2 NOT NULL DEFAULT GETDATE(),
        UPDATED_AT DATETIME2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_INBOUND_ITEMS_SLIP FOREIGN KEY (SLIP_NO) REFERENCES TB_INBOUND_SLIPS(SLIP_NO) ON DELETE CASCADE
    );

    CREATE INDEX IX_INBOUND_ITEMS_SLIP_NO ON TB_INBOUND_ITEMS(SLIP_NO);
    CREATE INDEX IX_INBOUND_ITEMS_CODE ON TB_INBOUND_ITEMS(ITEM_CODE);
END
GO

-- 3. 자재 마스터 및 현재 재고 테이블 (TB_INVENTORY_ITEMS)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TB_INVENTORY_ITEMS')
BEGIN
    CREATE TABLE TB_INVENTORY_ITEMS (
        ITEM_ID NVARCHAR(50) NOT NULL PRIMARY KEY,
        ITEM_CODE NVARCHAR(50) NOT NULL UNIQUE,               -- 품목코드
        ITEM_NAME NVARCHAR(200) NOT NULL,                     -- 품목명
        SPEC NVARCHAR(200) NULL,                              -- 규격
        CATEGORY NVARCHAR(50) NOT NULL DEFAULT '일반자재',
        WAREHOUSE NVARCHAR(100) NOT NULL DEFAULT '특장자재창고',
        QUANTITY DECIMAL(18, 4) NOT NULL DEFAULT 0,           -- 현재고
        UNIT NVARCHAR(20) NOT NULL DEFAULT 'EA',
        SAFETY_STOCK DECIMAL(18, 4) NOT NULL DEFAULT 0,       -- 안전재고
        PRICE DECIMAL(18, 2) NOT NULL DEFAULT 0,              -- 단가
        SUPPLIER NVARCHAR(150) NULL,                          -- 기본공급처
        IMAGE_URL NVARCHAR(MAX) NULL,
        NOTES NVARCHAR(500) NULL,
        CREATED_AT DATETIME2 NOT NULL DEFAULT GETDATE(),
        UPDATED_AT DATETIME2 NOT NULL DEFAULT GETDATE()
    );
END
GO

-- 4. 재고 수불 로그 테이블 (TB_STOCK_LOGS)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TB_STOCK_LOGS')
BEGIN
    CREATE TABLE TB_STOCK_LOGS (
        LOG_ID NVARCHAR(50) NOT NULL PRIMARY KEY,
        ITEM_ID NVARCHAR(50) NOT NULL,
        ITEM_CODE NVARCHAR(50) NOT NULL,
        ITEM_NAME NVARCHAR(200) NOT NULL,
        ACTION_TYPE NVARCHAR(20) NOT NULL,                    -- IN(입고), OUT(출고), ADJUST(조정)
        QUANTITY DECIMAL(18, 4) NOT NULL,                     -- 변동 수량
        PREVIOUS_QTY DECIMAL(18, 4) NOT NULL,                 -- 변동 전 수량
        NEW_QTY DECIMAL(18, 4) NOT NULL,                      -- 변동 후 수량
        MANAGER NVARCHAR(50) NOT NULL,                        -- 담당자
        REASON NVARCHAR(300) NOT NULL,                        -- 사유 / 전표번호
        LOG_TIMESTAMP DATETIME2 NOT NULL DEFAULT GETDATE()
    );

    CREATE INDEX IX_STOCK_LOGS_ITEM_CODE ON TB_STOCK_LOGS(ITEM_CODE, LOG_TIMESTAMP DESC);
END
GO

-- 5. 입고 확정 처리 Stored Procedure (SP_PROCESS_INBOUND_RECEIVE)
CREATE OR ALTER PROCEDURE SP_PROCESS_INBOUND_RECEIVE
    @SlipNo NVARCHAR(50),
    @Manager NVARCHAR(50),
    @Memo NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;

    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM TB_INBOUND_SLIPS WHERE SLIP_NO = @SlipNo)
        BEGIN
            RAISERROR(N'납품확인서 전표 [%s]를 찾을 수 없습니다.', 16, 1, @SlipNo);
        END

        DECLARE @Now DATETIME2 = GETDATE();

        DECLARE @ItemCode NVARCHAR(50), @ReceivedQty DECIMAL(18, 4), @DefectQty DECIMAL(18, 4);
        DECLARE @ItemId NVARCHAR(50), @ItemName NVARCHAR(200), @PrevQty DECIMAL(18, 4), @NewQty DECIMAL(18, 4);

        DECLARE item_cursor CURSOR FOR
            SELECT ITEM_CODE, RECEIVED_QTY, DEFECT_QTY
            FROM TB_INBOUND_ITEMS
            WHERE SLIP_NO = @SlipNo AND RECEIVED_QTY > 0;

        OPEN item_cursor;
        FETCH NEXT FROM item_cursor INTO @ItemCode, @ReceivedQty, @DefectQty;

        WHILE @@FETCH_STATUS = 0
        BEGIN
            SELECT @ItemId = ITEM_ID, @ItemName = ITEM_NAME, @PrevQty = QUANTITY
            FROM TB_INVENTORY_ITEMS
            WHERE ITEM_CODE = @ItemCode;

            IF @ItemId IS NOT NULL
            BEGIN
                SET @NewQty = @PrevQty + @ReceivedQty;

                UPDATE TB_INVENTORY_ITEMS
                SET QUANTITY = @NewQty,
                    UPDATED_AT = @Now
                WHERE ITEM_ID = @ItemId;

                INSERT INTO TB_STOCK_LOGS (
                    LOG_ID, ITEM_ID, ITEM_CODE, ITEM_NAME, ACTION_TYPE,
                    QUANTITY, PREVIOUS_QTY, NEW_QTY, MANAGER, REASON, LOG_TIMESTAMP
                ) VALUES (
                    NEWID(), @ItemId, @ItemCode, @ItemName, 'IN',
                    @ReceivedQty, @PrevQty, @NewQty, @Manager,
                    CONCAT(N'납품확인서 입고 [전표: ', @SlipNo, N']'), @Now
                );
            END

            FETCH NEXT FROM item_cursor INTO @ItemCode, @ReceivedQty, @DefectQty;
        END

        CLOSE item_cursor;
        DEALLOCATE item_cursor;

        UPDATE TB_INBOUND_SLIPS
        SET STATUS = 'COMPLETED',
            MANAGER = @Manager,
            INBOUND_DATE = @Now,
            MEMO = ISNULL(@Memo, MEMO),
            UPDATED_AT = @Now
        WHERE SLIP_NO = @SlipNo;

        COMMIT TRANSACTION;
        SELECT 1 AS SUCCESS, N'입고 확정 처리가 완료되었습니다.' AS MESSAGE;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

-- 4. QR 단축 토큰 관리 테이블 (TB_QR_TOKENS)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TB_QR_TOKENS')
BEGIN
    CREATE TABLE TB_QR_TOKENS (
        TOKEN NVARCHAR(20) NOT NULL PRIMARY KEY,              -- 랜덤 영숫자 토큰 (예: A83K29, K7mP2x9Q)
        QR_TYPE NVARCHAR(30) NOT NULL,                        -- INBOUND, ITEM, RACK, VEHICLE, WORK_ORDER
        TARGET_ID NVARCHAR(100) NOT NULL,                     -- 대상 ID (전표번호, 품목코드, 랙위치 등)
        ACTIVE BIT NOT NULL DEFAULT 1,                        -- 활성화 여부
        METADATA_JSON NVARCHAR(MAX) NULL,                     -- 부가 속성 (JSON)
        CREATED_AT DATETIME2 NOT NULL DEFAULT GETDATE(),      -- 생성일시
        UPDATED_AT DATETIME2 NOT NULL DEFAULT GETDATE()       -- 수정일시
    );

    CREATE UNIQUE INDEX UQ_QR_TOKENS_TARGET ON TB_QR_TOKENS(QR_TYPE, TARGET_ID) WHERE ACTIVE = 1;
    CREATE INDEX IX_QR_TOKENS_TYPE ON TB_QR_TOKENS(QR_TYPE);
END
GO

