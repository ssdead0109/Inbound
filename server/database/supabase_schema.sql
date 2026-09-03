-- ==========================================================
-- SmartRack / Inbound ERP System - Supabase (PostgreSQL) DDL
-- 용도: Supabase 클라우드 데이터베이스 스키마 정의 및 RLS 설정
-- 실행방법: Supabase 대시보드 -> SQL Editor에 붙여넣고 [Run] 실행
-- ==========================================================

-- 1. 납품확인서 마스터 테이블 (tb_inbound_slips)
CREATE TABLE IF NOT EXISTS public.tb_inbound_slips (
    slip_no TEXT NOT NULL PRIMARY KEY,                    -- 납품확인서 전표번호 (예: 20080300002)
    supplier_code TEXT NOT NULL DEFAULT '',               -- 공급업체 코드
    supplier_name TEXT NOT NULL DEFAULT '',               -- 공급업체명
    po_number TEXT,                                       -- 사내 발주번호
    delivery_date DATE,                                   -- 납품일자 (YYYY-MM-DD)
    status TEXT NOT NULL DEFAULT 'WAITING',               -- WAITING, INSPECTING, COMPLETED, PARTIAL, HOLD, CANCELLED
    total_items INT NOT NULL DEFAULT 0,                   -- 총 품목 건수
    total_order_qty NUMERIC(18, 4) NOT NULL DEFAULT 0,    -- 총 발주수량
    total_received_qty NUMERIC(18, 4) NOT NULL DEFAULT 0, -- 총 실입고 수량
    total_defect_qty NUMERIC(18, 4) NOT NULL DEFAULT 0,   -- 총 불량 수량
    manager TEXT,                                         -- 입고 검수 담당자명
    inbound_date TIMESTAMPTZ,                             -- 입고 완료 일시
    memo TEXT,                                            -- 비고 / 특이사항
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_inbound_slips_date ON public.tb_inbound_slips(delivery_date, status);
CREATE INDEX IF NOT EXISTS ix_inbound_slips_supplier ON public.tb_inbound_slips(supplier_name);

-- 2. 납품확인서 상세 품목 테이블 (tb_inbound_items)
CREATE TABLE IF NOT EXISTS public.tb_inbound_items (
    row_id TEXT NOT NULL PRIMARY KEY,                     -- 행 고유 식별자
    slip_no TEXT NOT NULL REFERENCES public.tb_inbound_slips(slip_no) ON DELETE CASCADE,
    item_code TEXT NOT NULL,                              -- 자재 품목코드 (SKU)
    item_name TEXT NOT NULL,                              -- 품목명
    spec TEXT DEFAULT '',                                 -- 규격 / 사양
    unit TEXT NOT NULL DEFAULT 'EA',                      -- 단위
    order_qty NUMERIC(18, 4) NOT NULL DEFAULT 0,          -- 납품/발주 요청 수량
    received_qty NUMERIC(18, 4) NOT NULL DEFAULT 0,       -- 실입고 수량
    defect_qty NUMERIC(18, 4) NOT NULL DEFAULT 0,         -- 불량 수량
    defect_reason TEXT,                                   -- 불량 사유
    warehouse TEXT NOT NULL DEFAULT '특장자재창고',         -- 입고 창고
    unit_price NUMERIC(18, 2) DEFAULT 0,                  -- 입고 단가
    item_status TEXT NOT NULL DEFAULT 'WAITING',          -- WAITING, CHECKED, COMPLETED, DEFECT
    barcode TEXT,                                         -- QR/바코드 문자열
    notes TEXT,                                           -- 비고
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_inbound_items_slip ON public.tb_inbound_items(slip_no);
CREATE INDEX IF NOT EXISTS ix_inbound_items_code ON public.tb_inbound_items(item_code);

-- 3. QR 단축 토큰 관리 테이블 (tb_qr_tokens)
CREATE TABLE IF NOT EXISTS public.tb_qr_tokens (
    token TEXT NOT NULL PRIMARY KEY,                      -- 6~8자리 난수 토큰 (예: A83K29, Fxecvx)
    qr_type TEXT NOT NULL,                                -- INBOUND, ITEM, RACK, VEHICLE, WORK_ORDER
    target_id TEXT NOT NULL,                              -- 전표번호, 품목코드, 랙슬롯코드
    active BOOLEAN NOT NULL DEFAULT TRUE,                 -- 활성화 여부
    metadata_json JSONB DEFAULT '{}'::jsonb,              -- 부가 속성 (JSON)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_qr_tokens_target ON public.tb_qr_tokens(qr_type, target_id);

-- 4. 사용자 계정 테이블 (tb_users)
CREATE TABLE IF NOT EXISTS public.tb_users (
    code TEXT NOT NULL PRIMARY KEY,                       -- 사원/계정 코드 (예: Admin)
    name TEXT NOT NULL,                                   -- 이름
    dept TEXT,                                            -- 부서
    role TEXT,                                            -- 직책/역할
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,              -- 관리자 여부
    hide_price BOOLEAN NOT NULL DEFAULT FALSE,            -- 단가 숨김 여부
    password_hash TEXT,                                   -- 비밀번호 해시
    pda_pwd TEXT,                                         -- PDA 간편 비밀번호
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. 재고 수불 로그 테이블 (tb_stock_logs)
CREATE TABLE IF NOT EXISTS public.tb_stock_logs (
    log_id TEXT NOT NULL PRIMARY KEY,                     -- 로그 고유 UUID
    item_id TEXT,                                         -- 품목 ID
    item_code TEXT NOT NULL,                              -- 품목코드
    item_name TEXT,                                       -- 품목명
    action_type TEXT NOT NULL,                            -- IN, OUT, ADJUST, RELOCATE
    quantity NUMERIC(18, 4) NOT NULL DEFAULT 0,           -- 변동 수량
    previous_qty NUMERIC(18, 4) DEFAULT 0,                -- 이전 수량
    new_qty NUMERIC(18, 4) DEFAULT 0,                     -- 변동 후 수량
    manager TEXT,                                         -- 담당자
    reason TEXT,                                          -- 사유
    log_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_stock_logs_item ON public.tb_stock_logs(item_code, log_timestamp);

-- 6. 자재 마스터 테이블 (tb_items)
CREATE TABLE IF NOT EXISTS public.tb_items (
    id TEXT NOT NULL PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    spec TEXT DEFAULT '',
    category TEXT DEFAULT '일반',
    warehouse TEXT,
    rack_location TEXT DEFAULT '미입력',
    quantity NUMERIC(18, 4) NOT NULL DEFAULT 0,
    unit TEXT NOT NULL DEFAULT 'EA',
    safety_stock NUMERIC(18, 4) DEFAULT 5,
    price NUMERIC(18, 2) DEFAULT 0,
    supplier TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_items_code ON public.tb_items(code);
CREATE INDEX IF NOT EXISTS ix_items_name ON public.tb_items(name);

-- ==========================================================
-- RLS (Row Level Security) 설정: API Key를 통한 읽기/쓰기 허용
-- ==========================================================
ALTER TABLE public.tb_inbound_slips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tb_inbound_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tb_qr_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tb_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tb_stock_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tb_items ENABLE ROW LEVEL SECURITY;

-- 테스트 및 웹/모바일 앱 연동을 위한 전체 읽기/쓰기 허용 정책 (Anon / Authenticated)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public Full Access tb_inbound_slips" ON public.tb_inbound_slips;
    CREATE POLICY "Public Full Access tb_inbound_slips" ON public.tb_inbound_slips FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public Full Access tb_inbound_items" ON public.tb_inbound_items;
    CREATE POLICY "Public Full Access tb_inbound_items" ON public.tb_inbound_items FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public Full Access tb_qr_tokens" ON public.tb_qr_tokens;
    CREATE POLICY "Public Full Access tb_qr_tokens" ON public.tb_qr_tokens FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public Full Access tb_users" ON public.tb_users;
    CREATE POLICY "Public Full Access tb_users" ON public.tb_users FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public Full Access tb_stock_logs" ON public.tb_stock_logs;
    CREATE POLICY "Public Full Access tb_stock_logs" ON public.tb_stock_logs FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public Full Access tb_items" ON public.tb_items;
    CREATE POLICY "Public Full Access tb_items" ON public.tb_items FOR ALL USING (true) WITH CHECK (true);
END $$;
