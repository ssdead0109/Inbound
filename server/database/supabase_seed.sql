-- ==========================================================
-- SmartRack / Inbound - Supabase Initial Seed Data
-- 100건의 실제 ERP 납품서 전표 및 206개 품목 데이터 + 계정
-- 실행방법: Supabase SQL Editor에 붙여넣고 [Run] 실행
-- ==========================================================

BEGIN;

-- 1. 사용자 계정 시드
INSERT INTO public.tb_users (code, name, dept, role, is_admin, hide_price, password_hash, pda_pwd)
VALUES ('Admin', '관리자', '자재', '관리자', TRUE, FALSE, '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', 'kcp123!@')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  dept = EXCLUDED.dept,
  role = EXCLUDED.role,
  is_admin = EXCLUDED.is_admin,
  password_hash = EXCLUDED.password_hash,
  pda_pwd = EXCLUDED.pda_pwd;

-- 2. 납품확인서 전표 마스터 (100건)
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20080300002', '6060440531', '신우',
  '20080300002', '2020-08-04',
  'WAITING', 1,
  1, 0, 0,
  '이병훈', '경동 화성 양감 송산 110(010-2332-9396)',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20080300001', '00391', '중국／JINAN HUACHENWEIDA TRAD CO.,LTD(실린더)',
  '20080300001', '2020-09-03',
  'WAITING', 1,
  3, 0, 0,
  '김해성', '생산,A/S 재고 확보',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20073000003', '1408123163', '(주)대원하이텍',
  '20073000003', '2020-07-30',
  'WAITING', 1,
  4, 0, 0,
  '안성규', '고객직송 | 경동:일산동구문봉58 거성중기 010-9931-6345',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072900005', '1210943105', '제이에스비(JSB)',
  '20072900005', '2020-07-31',
  'WAITING', 6,
  38, 0, 0,
  '이병훈', '뉴질랜드 판매외',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072900003', '4275400116', '샤인테크',
  '20072900003', '2020-08-07',
  'WAITING', 2,
  20, 0, 0,
  '박중현', '사급소재, 4M MAST(화성-10EA) | 08월 생산계획 추가 | 착지 정보 : 경상남도 함안군 함안면 광정로 354 KCP중공업 2공장(조연실), 경기도 화성시 양감면 송산110영업소(박용건)',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072900002', '6088175677', '태광엠앤에스 주식회사',
  '20072900002', '2020-07-31',
  'WAITING', 2,
  20, 0, 0,
  '박중현', '6M MAST - 화성 | 08월 추가 생산계획',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072800018', '5038176139', '주식회사 창녕',
  '20072800018', '2020-08-10',
  'WAITING', 1,
  8, 0, 0,
  '김보라', '',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072800017', '5038176139', '주식회사 창녕',
  '20072800017', '2020-08-10',
  'WAITING', 1,
  14, 0, 0,
  '김보라', '8월부터 신규프로그램으로 전표처리바랍니다.',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072800010', '1098145190', '하베코리아주식회사',
  '20072800010', '2020-07-30',
  'WAITING', 1,
  6, 0, 0,
  '김보라', '',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072800009', '6092471332', '보성이피에스',
  '20072800009', '2020-07-30',
  'WAITING', 1,
  6, 0, 0,
  '김보라', 'KMV 공용 | 이규훈연구원 요청',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072800008', '6158141990', '하이파워유압(주)',
  '20072800008', '2020-07-29',
  'WAITING', 1,
  100, 0, 0,
  '김보라', '',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072800007', '6088122087', '(유)화진철강',
  '20072800007', '2020-07-28',
  'WAITING', 1,
  50, 0, 0,
  '김보라', '착지- 한일공업',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072800005', '5040146183', '일출산업사',
  '20072800005', '2020-08-28',
  'WAITING', 1,
  6, 0, 0,
  '김보라', '323~328',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072800004', '6092471332', '보성이피에스',
  '20072800004', '2020-07-31',
  'WAITING', 4,
  4, 0, 0,
  '김보라', 'M40R-550 씨원',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072800003', '1252006922', '하이콘테크',
  '20072800003', '2020-07-30',
  'WAITING', 5,
  5, 0, 0,
  '김보라', 'M32RZ-50 하도 (티렉스)',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072800002', '1252006922', '하이콘테크',
  '20072800002', '2020-07-30',
  'WAITING', 4,
  28, 0, 0,
  '김보라', 'M40Z 7대 하도 (씨원)',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072700023', '1252006922', '하이콘테크',
  '20072700023', '2020-07-28',
  'WAITING', 2,
  2, 0, 0,
  '이병훈', '출고택배로 보내주세요',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072700021', '5448601177', '(주)제이인더스트리코리아',
  '20072700021', '2020-07-30',
  'WAITING', 1,
  1200, 0, 0,
  '김보라', '200개/1박스- 티렉스',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072700020', '6092471332', '보성이피에스',
  '20072700020', '2020-08-07',
  'WAITING', 1,
  5, 0, 0,
  '김보라', 'KEY만 요청- KMV15,KMV13 | 박현우연구원 요청',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072700019', '6088175677', '태광엠앤에스 주식회사',
  '20072700019', '2020-07-30',
  'WAITING', 1,
  6, 0, 0,
  '김보라', '제작 쇼트하도- 현대 17T 씨원 요청',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072700018', '6074476979', '유성산업',
  '20072700018', '2020-07-31',
  'WAITING', 3,
  240, 0, 0,
  '김보라', 'KCP로고 없는 제품이라도 입고바랍니다 | 신규시스템으로 8월 전표처리바랍니다.',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072700013', '6088175677', '태광엠앤에스 주식회사',
  '20072700013', '2020-07-31',
  'WAITING', 4,
  43, 0, 0,
  '김보라', '2EA 제작하도 후 화성공장. 7EA는 KTP0706중 (020 213 200)TOP COVER 제품과 교환하여 셋트로 납품. 기존 것 폐기. | 강동욱연구원 요청',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072700012', '6088175677', '태광엠앤에스 주식회사',
  '20072700012', '2020-07-29',
  'WAITING', 1,
  4, 0, 0,
  '김보라', '절단,벤딩,제작,하도 후 함안본사 입고- 대우트럭(E5) - M55,M59용 | 김상병연구원 요청',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072700010', '6092471332', '보성이피에스',
  '20072700010', '2020-08-03',
  'WAITING', 1,
  1, 0, 0,
  '김보라', 'KSC1205-007 | 김재민연구원 요청',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072700009', '6348600146', '주식회사 서륭',
  '20072700009', '2020-07-28',
  'WAITING', 5,
  11, 0, 0,
  '김보라', 'M75-03',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072700008', '6088175677', '태광엠앤에스 주식회사',
  '20072700008', '2020-07-29',
  'WAITING', 2,
  120, 0, 0,
  '김보라', '절단 하도 본사- 케이엘 요청',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072700005', '6158121771', '케이지에스(주)',
  '20072700005', '2020-07-28',
  'WAITING', 1,
  10, 0, 0,
  '김보라', '화성공장 발주건과 함께 화성으로 발송바랍니다.',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072700003', '8465300149', '고운테크',
  '20072700003', '2020-07-30',
  'WAITING', 1,
  3, 0, 0,
  '김보라', '특장차 점검창용',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072700002', '6158141990', '하이파워유압(주)',
  '20072700002', '2020-08-10',
  'WAITING', 1,
  10, 0, 0,
  '김보라', 'M24 | 긴급요청드립니다.',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072700001', '1252006922', '하이콘테크',
  '20072700001', '2020-07-27',
  'WAITING', 1,
  2, 0, 0,
  '김형준', '',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072400028', '2118600472', '(주)에이치에스케이(HSK)',
  '20072400028', '2020-08-21',
  'WAITING', 1,
  20, 0, 0,
  '김보라', '덤프 실린더 브라켓',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072400027', '1508700096', '(주)에스에이치테크(SH TECH 신화테크)',
  '20072400027', '2020-07-30',
  'WAITING', 1,
  5, 0, 0,
  '김보라', '',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072400025', '6088175677', '태광엠앤에스 주식회사',
  '20072400025', '2020-07-29',
  'WAITING', 1,
  100, 0, 0,
  '김보라', '케이엘 요청',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072400024', '4108185262', '(주)케이비에이치',
  '20072400024', '2020-08-14',
  'WAITING', 1,
  10, 0, 0,
  '김보라', '센싱밸브 개선품 제작 | 김두민연구원 요청',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072400023', '6088607397', '(주)동방이엔지',
  '20072400023', '2020-08-12',
  'WAITING', 1,
  6, 0, 0,
  '김보라', '재고 확보용 | 김두민연구원 요청',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072400022', '6158141990', '하이파워유압(주)',
  '20072400022', '2020-08-12',
  'WAITING', 1,
  10, 0, 0,
  '김보라', '일본 송부용 및 재고 확보용 | 김두민연구원 요청',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072400021', '1508700096', '(주)에스에이치테크(SH TECH 신화테크)',
  '20072400021', '2020-08-01',
  'WAITING', 1,
  100, 0, 0,
  '김보라', '티렉스',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072400018', '6088175677', '태광엠앤에스 주식회사',
  '20072400018', '2020-07-29',
  'WAITING', 7,
  7, 0, 0,
  '박중현', '사급 소재 절단 후 함안 입고',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072400017', '1248170586', '알파곰마코리아주식회사',
  '20072400017', '2020-07-28',
  'WAITING', 1,
  3, 0, 0,
  '김보라', '',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072400016', '00391', '중국／JINAN HUACHENWEIDA TRAD CO.,LTD(실린더)',
  '20072400016', '2020-08-25',
  'WAITING', 1,
  10, 0, 0,
  '김보라', '',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072400015', '6092471332', '보성이피에스',
  '20072400015', '2020-07-30',
  'WAITING', 6,
  54, 0, 0,
  '김보라', '절단, 밴딩 후 화성 입고(잔재로 절단 요청)- 체크 방향 바깥쪽 (재고품) | 박중현연구원 요청',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072400014', '6088175677', '태광엠앤에스 주식회사',
  '20072400014', '2020-07-29',
  'WAITING', 2,
  4, 0, 0,
  '김보라', '절단, 벤딩, 하도, 함안공장 입고- M75 2단 붐 파이프 브라켓 | 김상병연구원 요청',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072400013', '6088175677', '태광엠앤에스 주식회사',
  '20072400013', '2020-07-29',
  'WAITING', 1,
  1, 0, 0,
  '김보라', '하도 본사- 판넬 흔들림 방지용 | 김성영연구원 요청',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072400007', '6068647433', '주식회사 엔스틸앤머터리얼즈',
  '20072400007', '2020-08-01',
  'WAITING', 1,
  500, 0, 0,
  '김보라', '',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072400006', '1508700096', '(주)에스에이치테크(SH TECH 신화테크)',
  '20072400006', '2020-08-07',
  'WAITING', 1,
  5, 0, 0,
  '김보라', '습건식',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072400004', '1248137613', '(주)신라정밀홀딩스',
  '20072400004', '2020-09-07',
  'WAITING', 1,
  4, 0, 0,
  '김보라', 'P1151 | 이병훈부장님 요청',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072300020', '6088175677', '태광엠앤에스 주식회사',
  '20072300020', '2020-07-27',
  'WAITING', 2,
  33, 0, 0,
  '박중현', '사급소재 절단 후 함안 입고(캐나다) | 개선 작업 요청합니다.',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072300015', '1508700096', '(주)에스에이치테크(SH TECH 신화테크)',
  '20072300015', '2020-08-01',
  'WAITING', 1,
  50, 0, 0,
  '김보라', '케이엘 | 08월 매출로 요청드립니다',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072300013', '1058125362', '(주)림스코',
  '20072300013', '2020-07-27',
  'WAITING', 1,
  9, 0, 0,
  '김보라', 'KTP0706(2축) 9대',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072300009', '1248724594', '(주)성환공구',
  '20072300009', '2020-07-24',
  'WAITING', 1,
  2, 0, 0,
  '김보라', '씨원,가람',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072300008', '6211086293', '미래테크',
  '20072300008', '2020-08-23',
  'WAITING', 3,
  30, 0, 0,
  '김보라', '생산용(납품 전 담당자와 통화 후 납품요망)',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072300002', '1408123163', '(주)대원하이텍',
  '20072300002', '2020-07-24',
  'WAITING', 1,
  2, 0, 0,
  '김보라', '7인치 청소창 엘보 마개용',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072300001', '6088175677', '태광엠앤에스 주식회사',
  '20072300001', '2020-07-29',
  'WAITING', 1,
  5, 0, 0,
  '김보라', '케이엘 요청 | 신명욱부장님 긴급요청드립니다.',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072200043', '6088607397', '(주)동방이엔지',
  '20072200043', '2020-08-14',
  'WAITING', 12,
  72, 0, 0,
  '박중현', 'M52Z(313~328) | 08월 생산계획',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072200042', '6088175677', '태광엠앤에스 주식회사',
  '20072200042', '2020-08-14',
  'WAITING', 3,
  12, 0, 0,
  '박중현', 'M41Z(031~033) - 함안 | 08월 생산계획',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072200029', '6092471332', '보성이피에스',
  '20072200029', '2020-08-14',
  'WAITING', 4,
  12, 0, 0,
  '김보라', '34~36',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072200027', '6088175677', '태광엠앤에스 주식회사',
  '20072200027', '2020-08-14',
  'WAITING', 3,
  12, 0, 0,
  '김보라', '34~36 | 제작발주입니다.',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072200026', '6088175677', '태광엠앤에스 주식회사',
  '20072200026', '2020-08-14',
  'WAITING', 13,
  96, 0, 0,
  '김보라', '31~33 | 제작발주입니다.',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072200025', '1508700096', '(주)에스에이치테크(SH TECH 신화테크)',
  '20072200025', '2020-08-14',
  'WAITING', 1,
  12, 0, 0,
  '김보라', 'M52Z6-323~328',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072200024', '1248137613', '(주)신라정밀홀딩스',
  '20072200024', '2020-09-01',
  'WAITING', 1,
  3, 0, 0,
  '김보라', 'M41Z-34~36',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072200023', '1248137613', '(주)신라정밀홀딩스',
  '20072200023', '2020-09-01',
  'WAITING', 2,
  9, 0, 0,
  '김보라', 'M41Z-31~33',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072200021', '6158141990', '하이파워유압(주)',
  '20072200021', '2020-07-29',
  'WAITING', 3,
  60, 0, 0,
  '김보라', '',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072200020', '6088175677', '태광엠앤에스 주식회사',
  '20072200020', '2020-07-31',
  'WAITING', 1,
  2, 0, 0,
  '김보라', '알루미늄-제작 후 화성공장 / SS400-제작하도후 화성공장 | 강동욱연구원 요청',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072200015', '1210943105', '제이에스비(JSB)',
  '20072200015', '2020-08-25',
  'WAITING', 1,
  3, 0, 0,
  '김보라', '34~36 | 8월 발주건부터 신규 프로그램으로 전표생성바랍니다.',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072200014', '1210943105', '제이에스비(JSB)',
  '20072200014', '2020-08-25',
  'WAITING', 2,
  9, 0, 0,
  '김보라', '31~33 | 8월 발주건부터 신규 프로그램으로 전표생성바랍니다.',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072200013', '5040146183', '일출산업사',
  '20072200013', '2020-07-29',
  'WAITING', 2,
  12, 0, 0,
  '김보라', '34~36 (화성) | 착지- 2공장',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072200008', '6211086293', '미래테크',
  '20072200008', '2020-08-25',
  'WAITING', 1,
  3, 0, 0,
  '김보라', '34~36',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072200007', '6211086293', '미래테크',
  '20072200007', '2020-08-25',
  'WAITING', 2,
  9, 0, 0,
  '김보라', '31~33',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072200004', '1508700096', '(주)에스에이치테크(SH TECH 신화테크)',
  '20072200004', '2020-08-01',
  'WAITING', 1,
  230, 0, 0,
  '김보라', '씨원 | 08월 매출로 요청드립니다',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072200003', '6158603327', '(주)제이케이엠',
  '20072200003', '2020-07-24',
  'WAITING', 1,
  5, 0, 0,
  '김보라', '',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072100023', '6092471332', '보성이피에스',
  '20072100023', '2020-07-31',
  'WAITING', 3,
  150, 0, 0,
  '김보라', '공용품 | 박현우연구원 요청',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072100006', '6348600146', '주식회사 서륭',
  '20072100006', '2020-07-23',
  'WAITING', 2,
  3, 0, 0,
  '이병훈', '캐나다 이중파이프 도색',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072100001', '1508700096', '(주)에스에이치테크(SH TECH 신화테크)',
  '20072100001', '2020-08-01',
  'WAITING', 2,
  236, 0, 0,
  '김보라', '씨원 | 08월 매출로 요청드립니다',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072000025', '6088119694', '남우공업(주)',
  '20072000025', '2020-08-20',
  'WAITING', 1,
  1, 0, 0,
  '김보라', 'KCP63-102호기 중고차 붐 파손건(방글라데시-김혁) | 도면확인 후 제작(도면 첨부)',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072000024', '6211086293', '미래테크',
  '20072000024', '2020-08-20',
  'WAITING', 1,
  1, 0, 0,
  '김보라', 'KCP63-102호기 중고차 붐 파손건(방글라데시-김혁)',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072000021', '00176', '캐나다／MIK TECH LTD.',
  '20072000021', '2020-07-21',
  'WAITING', 15,
  498, 0, 0,
  '이병훈', 'p1092',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072000020', '6088175677', '태광엠앤에스 주식회사',
  '20072000020', '2020-07-24',
  'WAITING', 1,
  6, 0, 0,
  '김보라', '씨원 요청',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072000016', '1210943105', '제이에스비(JSB)',
  '20072000016', '2020-08-17',
  'WAITING', 1,
  1, 0, 0,
  '이병훈', '59-102호기(방글라데시)',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072000012', '00391', '중국／JINAN HUACHENWEIDA TRAD CO.,LTD(실린더)',
  '20072000012', '2020-08-20',
  'WAITING', 2,
  2, 0, 0,
  '김해성', 'M30-231(체코) a/s사용 보충분-정우혁차장 요청',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072000007', '1438114528', '주식회사에이치원',
  '20072000007', '2020-07-22',
  'WAITING', 1,
  9, 0, 0,
  '김보라', 'KTP0706(2축) 9대',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20072000006', '6158141990', '하이파워유압(주)',
  '20072000006', '2020-07-24',
  'WAITING', 1,
  10, 0, 0,
  '김보라', 'KTP0706(2축) 9대 | 긴급요청드립니다.',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20071700030', '6158141990', '하이파워유압(주)',
  '20071700030', '2020-07-23',
  'WAITING', 1,
  5, 0, 0,
  '김보라', '티렉스 요청',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20071700009', '6092471332', '보성이피에스',
  '20071700009', '2020-07-30',
  'WAITING', 3,
  5, 0, 0,
  '김보라', 'KMV13-039,040 | 박현우연구원 요청',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20071600004', '00391', '중국／JINAN HUACHENWEIDA TRAD CO.,LTD(실린더)',
  '20071600004', '2020-08-16',
  'WAITING', 2,
  9, 0, 0,
  '김해성', '',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20071500024', '6092471332', '보성이피에스',
  '20071500024', '2020-07-21',
  'WAITING', 1,
  1, 0, 0,
  '김보라', 'KSC1205-007 | 김재민연구원 요청',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20071500023', '00391', '중국／JINAN HUACHENWEIDA TRAD CO.,LTD(실린더)',
  '20071500023', '2020-08-15',
  'WAITING', 1,
  1, 0, 0,
  '김해성', '베트남 a/s',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20071500022', '1248137613', '(주)신라정밀홀딩스',
  '20071500022', '2020-08-25',
  'WAITING', 1,
  3, 0, 0,
  '김보라', '재고',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20071500019', '4108185262', '(주)케이비에이치',
  '20071500019', '2020-08-05',
  'WAITING', 1,
  50, 0, 0,
  '김보라', '허이사님 요청 | 김두민연구원 요청',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20071500013', '00176', '캐나다／MIK TECH LTD.',
  '20071500013', '2020-08-31',
  'WAITING', 3,
  14, 0, 0,
  '김보라', 'A2(L25/25,J25/40,J25/40,J16/25,J10/16,O25/25)',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20071500002', '1358168945', '대창기계산업(주)',
  '20071500002', '2020-07-16',
  'WAITING', 1,
  25, 0, 0,
  '안성규', '스페인, 우즈벡 판매용 | 빠른 입고 요청드립니다',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20071400032', '6098601455', '건영기계(주)',
  '20071400032', '2020-07-30',
  'WAITING', 1,
  100, 0, 0,
  '김보라', '',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20071400030', '00176', '캐나다／MIK TECH LTD.',
  '20071400030', '2020-08-31',
  'WAITING', 3,
  120, 0, 0,
  '김보라', 'PSL 시티드 밸브 씰키트',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20071400016', '1358168945', '대창기계산업(주)',
  '20071400016', '2020-07-24',
  'WAITING', 1,
  1, 0, 0,
  '안성규', '',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20071400010', '1508700096', '(주)에스에이치테크(SH TECH 신화테크)',
  '20071400010', '2020-07-15',
  'WAITING', 1,
  300, 0, 0,
  '김보라', '신화테크 재고 사용분',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20071300023', '6211086293', '미래테크',
  '20071300023', '2020-07-15',
  'WAITING', 1,
  2, 0, 0,
  '김보라', '베트남 무상건(김영철부장)중국+국내 타입으로 납품요망',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20071300018', '1358168945', '대창기계산업(주)',
  '20071300018', '2020-07-16',
  'WAITING', 2,
  10, 0, 0,
  '김보라', '가람 요청',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20071300015', '1358168945', '대창기계산업(주)',
  '20071300015', '2020-07-15',
  'WAITING', 1,
  30, 0, 0,
  '김보라', '',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20070900028', '00391', '중국／JINAN HUACHENWEIDA TRAD CO.,LTD(실린더)',
  '20070900028', '2020-08-09',
  'WAITING', 1,
  10, 0, 0,
  '김해성', '',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20070900027', '6088607397', '(주)동방이엔지',
  '20070900027', '2020-07-09',
  'WAITING', 1,
  1, 0, 0,
  '김형준', '',
  '2026-09-03T07:22:17.254Z', '2026-09-03T07:22:17.254Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;
INSERT INTO public.tb_inbound_slips (
  slip_no, supplier_code, supplier_name, po_number, delivery_date, status,
  total_items, total_order_qty, total_received_qty, total_defect_qty, manager, memo, created_at, updated_at
) VALUES (
  '20080400002', '1210943105', '제이에스비(JSB)',
  '20080400002', '2020-08-04',
  'WAITING', 1,
  20, 0, 0,
  '안성규', '당일 발송 요청드립니다',
  '2026-09-03T07:58:01.780Z', '2026-09-03T07:58:01.780Z'
) ON CONFLICT (slip_no) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  delivery_date = EXCLUDED.delivery_date,
  status = EXCLUDED.status,
  total_items = EXCLUDED.total_items,
  total_order_qty = EXCLUDED.total_order_qty,
  memo = EXCLUDED.memo;

-- 3. 납품서 상세 품목 (206건)
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20080300002-1', '20080300002', '000573000', 'S-VALVE',
  '200*180(COMMON USE)', 'EA', 1, 1,
  0, '', '화성부품영업창고',
  600000, 'WAITING', '000573000-1',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20080300001-1', '20080300001', '403240000', 'BOOM CYLINDER SET',
  'M40Z 5S', 'EA', 3, 3,
  0, '', '함안공장',
  7662000, 'WAITING', '403240000-3',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20073000003-1', '20073000003', 'W123', '베어링 후렌지 아세이',
  'Ø60 유팩킹타입', 'EA', 4, 4,
  0, '', '화성부품영업창고',
  45000, 'WAITING', 'W123-4',
  '고객직송', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072900005-1', '20072900005', '900270045', 'DU-BUSH',
  '270*45', 'EA', 10, 10,
  0, '', '함안공장',
  5000, 'WAITING', '900270045-10',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072900005-2', '20072900005', '900280050', 'DU-BUSH',
  '280*50', 'EA', 10, 10,
  0, '', '함안공장',
  5800, 'WAITING', '900280050-10',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072900005-3', '20072900005', '900100095', 'DU-BUSH',
  '100*95', 'EA', 6, 6,
  0, '', '함안공장',
  3600, 'WAITING', '900100095-6',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072900005-4', '20072900005', '900090060', 'DU-BUSH',
  '90*60', 'EA', 4, 4,
  0, '', '함안공장',
  2060, 'WAITING', '900090060-4',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072900005-5', '20072900005', '900070040', 'DU-BUSH',
  '70*40', 'EA', 4, 4,
  0, '', '함안공장',
  1050, 'WAITING', '900070040-4',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072900005-6', '20072900005', '900060030', 'DU-BUSH',
  '60*30', 'EA', 4, 4,
  0, '', '함안공장',
  710, 'WAITING', '900060030-4',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072900003-1', '20072900003', 'PAY124', '4M MAST 구조물 각인 명판',
  '8T*50*25', 'EA', 10, 10,
  0, '', '화성공장',
  2500, 'WAITING', 'PAY124-10',
  '08월 생산계획 추가', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072900003-2', '20072900003', 'PAY124', '6M MAST 구조물 각인 명판',
  '8T*50*25', 'EA', 10, 10,
  0, '', '화성공장',
  2500, 'WAITING', 'PAY124-10',
  '08월 생산계획 추가', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072900002-1', '20072900002', 'PAY124', '6M MAST FOR PLACING (절단, 밴딩, 후판 포함)',
  '6M MAST', 'EA', 10, 10,
  0, '', '화성공장',
  0, 'WAITING', 'PAY124-10',
  '08월 추가 생산계획', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072900002-2', '20072900002', 'PAY124', '4M MAST FOR PLACING (절단, 밴딩, 후판 포함)',
  '4M MAST', 'EA', 10, 10,
  0, '', '화성공장',
  0, 'WAITING', 'PAY124-10',
  '08월 추가 생산계획', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072800018-1', '20072800018', '000550010', 'DELIVERY CYLINDER (230*2100)',
  'M36(2320L)', 'EA', 8, 8,
  0, '', '화성공장',
  970000, 'WAITING', '000550010-8',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072800017-1', '20072800017', '000550010', 'DELIVERY CYLINDER (230*2100)',
  'M36(2320L)', 'EA', 14, 14,
  0, '', '함안공장',
  970000, 'WAITING', '000550010-14',
  '8월부터 신규프로그램으로 전표처리바랍니다.', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072800010-1', '20072800010', '001361170', 'BOOM OIL PUMP',
  'SAP-017L-N-DL4-L35-S0S-000', 'EA', 6, 6,
  0, '', '화성공장',
  477000, 'WAITING', '001361170-6',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072800009-1', '20072800009', 'MV101311010', 'PIPE FOR ELECTRIC WIRE',
  'ROUND TUBE STS304 50A(60.5)x1.5Tx6,000L', 'EA', 6, 6,
  0, '', '특장 자재창고-화성',
  0, 'WAITING', 'MV101311010-6',
  '이규훈연구원 요청', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072800008-1', '20072800008', '000331200', 'OUTRIGGER CHECK VALVE (O/R 체크밸브)',
  'O/R', 'EA', 100, 100,
  0, '', '함안공장',
  50000, 'WAITING', '000331200-100',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072800007-1', '20072800007', 'W125', '평철',
  '12*25*6M', 'EA', 50, 50,
  0, '', '함안공장',
  11328, 'WAITING', 'W125-50',
  '착지- 한일공업', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072800005-1', '20072800005', '522230000', 'BOOM PIN SET',
  'M52Z6S', 'EA', 6, 6,
  0, '', '함안공장',
  0, 'WAITING', '522230000-6',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072800004-1', '20072800004', '000186150', 'COVER FOR SIDE',
  'M32-M40(R)-AL', 'EA', 1, 1,
  0, '', '화성공장',
  190000, 'WAITING', '000186150-1',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072800004-2', '20072800004', '000186100', 'COVER FOR SIDE',
  'M32-M40(L)-AL', 'EA', 1, 1,
  0, '', '화성공장',
  190000, 'WAITING', '000186100-1',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072800004-3', '20072800004', '002162120', 'DECK T/B-R',
  'M32,36,38,40-AL(2.5T 2467*492)', 'EA', 1, 1,
  0, '', '화성공장',
  73000, 'WAITING', '002162120-1',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072800004-4', '20072800004', '002162130', 'DECK T/B-L',
  'M32,36,38,40-AL(2.5T 2467*492)', 'EA', 1, 1,
  0, '', '화성공장',
  73000, 'WAITING', '002162130-1',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072800003-1', '20072800003', '001251400', 'HEAT-TREATED BOOM PIPE (열처리 붐 파이프)',
  '5"*5T*1455', 'EA', 1, 1,
  0, '', '함안공장',
  69000, 'WAITING', '001251400-1',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072800003-2', '20072800003', '001251500', 'HEAT-TREATED BOOM PIPE (열처리 붐 파이프)',
  '5"*5T*1573', 'EA', 1, 1,
  0, '', '함안공장',
  72000, 'WAITING', '001251500-1',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072800003-3', '20072800003', '001251100', 'HEAT-TREATED BOOM PIPE (열처리 붐 파이프)',
  '5"*5T*1149', 'EA', 1, 1,
  0, '', '함안공장',
  60000, 'WAITING', '001251100-1',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072800003-4', '20072800003', '001251300', 'HEAT-TREATED BOOM PIPE (열처리 붐 파이프)',
  '5"*5T*1392', 'EA', 1, 1,
  0, '', '함안공장',
  66000, 'WAITING', '001251300-1',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072800003-5', '20072800003', '001251400', 'HEAT-TREATED BOOM PIPE (열처리 붐 파이프)',
  '5"*5T*1460', 'EA', 1, 1,
  0, '', '함안공장',
  69000, 'WAITING', '001251400-1',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072800002-1', '20072800002', '001250300', 'HEAT-TREATED BOOM PIPE (열처리 붐 파이프)',
  '5"*5T*370', 'EA', 7, 7,
  0, '', '화성공장',
  32000, 'WAITING', '001250300-7',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072800002-2', '20072800002', '001252200', 'HEAT-TREATED BOOM PIPE (열처리 붐 파이프)',
  '5"*5T*2260', 'EA', 7, 7,
  0, '', '화성공장',
  97000, 'WAITING', '001252200-7',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072800002-3', '20072800002', '001250300', 'HEAT-TREATED BOOM PIPE (열처리 붐 파이프)',
  '5"*5T*305', 'EA', 7, 7,
  0, '', '화성공장',
  32000, 'WAITING', '001250300-7',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072800002-4', '20072800002', '001250300', 'HEAT-TREATED BOOM PIPE (열처리 붐 파이프)',
  '5"*5T*300', 'EA', 7, 7,
  0, '', '화성공장',
  32000, 'WAITING', '001250300-7',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072700023-1', '20072700023', 'PAY125', '운송료',
  '화물', 'EA', 1, 1,
  0, '', '함안공장',
  10000, 'WAITING', 'PAY125-1',
  '출고택배로 보내주세요', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072700023-2', '20072700023', '001250900', 'HEAT-TREATED BOOM PIPE (열처리 붐 파이프)',
  '5"*5T*960', 'EA', 1, 1,
  0, '', '함안공장',
  56000, 'WAITING', '001250900-1',
  '출고택배로 보내주세요', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072700021-1', '20072700021', '000270121', 'OIL PIPE CLAMP(SEAMLESS)',
  'Ø12(RAIL TYPE)', 'EA', 1200, 1200,
  0, '', '함안공장',
  620, 'WAITING', '000270121-1200',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072700020-1', '20072700020', 'W124', 'SHAFT FOR PULLEY(MV101720003) KEY',
  '', 'EA', 5, 5,
  0, '', '특장 자재창고-화성',
  0, 'WAITING', 'W124-5',
  '박현우연구원 요청', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072700019-1', '20072700019', '000800647', 'B.K.T FOR TAIL LIGHT(R.L)',
  '3.2T*165*483*W177(XCIENT)M55,M59', 'EA', 6, 6,
  0, '', '화성공장',
  64210, 'WAITING', '000800647-6',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072700018-1', '20072700018', '000720120', 'PRESSURE GAUGE',
  '63-A-400BAR(PT)VIKA', 'EA', 10, 10,
  0, '', '화성공장',
  11000, 'WAITING', '000720120-10',
  '신규시스템으로 8월 전표처리바랍니다.', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072700018-2', '20072700018', '000720125', 'PRESSURE GAUGE',
  '63-D-100BAR(b-type)PF1/4(VIKA)', 'EA', 30, 30,
  0, '', '화성공장',
  12000, 'WAITING', '000720125-30',
  '신규시스템으로 8월 전표처리바랍니다.', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072700018-3', '20072700018', '000720111', 'PRESSURE GAUGE',
  '63-D-400BAR(b-type)PF1/4(VIKA)', 'EA', 200, 200,
  0, '', '화성공장',
  13000, 'WAITING', '000720111-200',
  '신규시스템으로 8월 전표처리바랍니다.', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072700013-1', '20072700013', 'W124', 'TOP COVER 제작',
  'KTP0706(CAN)', 'EA', 9, 9,
  0, '', '화성공장',
  0, 'WAITING', 'W124-9',
  '강동욱연구원 요청', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072700013-2', '20072700013', 'W124', 'BKT FOR OIL COOLER',
  'KTP0706(CAN)', 'EA', 18, 18,
  0, '', '화성공장',
  0, 'WAITING', 'W124-18',
  '강동욱연구원 요청', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072700013-3', '20072700013', 'W124', 'OIL COOLER, TOP COVER 수정',
  'KTP0706(CAN)', 'EA', 7, 7,
  0, '', '화성공장',
  0, 'WAITING', 'W124-7',
  '강동욱연구원 요청', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072700013-4', '20072700013', 'W124', 'BKT FOR OIL PIPE',
  'KTP0706(CAN)', 'EA', 9, 9,
  0, '', '화성공장',
  0, 'WAITING', 'W124-9',
  '강동욱연구원 요청', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072700012-1', '20072700012', 'W124', 'BKT FOR TAIL LIGHT',
  'SS400 2.3T / 12T', 'EA', 4, 4,
  0, '', '함안공장',
  0, 'WAITING', 'W124-4',
  '김상병연구원 요청', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072700010-1', '20072700010', 'W124', 'TOOL_BOX',
  'TOOL_BOX', 'EA', 1, 1,
  0, '', '특장 자재창고-화성',
  0, 'WAITING', 'W124-1',
  '김재민연구원 요청', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072700009-1', '20072700009', 'W126', '페인트',
  'DU PONT RED NO762 (16L)', 'EA', 3, 3,
  0, '', '함안공장',
  203000, 'WAITING', 'W126-3',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072700009-2', '20072700009', 'W126', '페인트',
  'UT5570-RAL7035(LIGHT GREY) (4L)', 'EA', 1, 1,
  0, '', '함안공장',
  37000, 'WAITING', 'W126-1',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072700009-3', '20072700009', 'W126', '페인트',
  'UT5570-RAL2009 (16L)', 'EA', 3, 3,
  0, '', '함안공장',
  253000, 'WAITING', 'W126-3',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072700009-4', '20072700009', 'W126', '페인트',
  'UT5570-RAL7039 (4L)', 'EA', 3, 3,
  0, '', '함안공장',
  39000, 'WAITING', 'W126-3',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072700009-5', '20072700009', 'W126', '페인트',
  'UT5570-RAL7035(LIGHT GREY) (16L)', 'EA', 1, 1,
  0, '', '함안공장',
  135000, 'WAITING', 'W126-1',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072700008-1', '20072700008', '002160171', 'DECK PLATE(SMALL)',
  '3.2T*1219*741.9', 'EA', 60, 60,
  0, '', '함안공장',
  33980, 'WAITING', '002160171-60',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072700008-2', '20072700008', '002160170', 'DECK PLATE(BIG)',
  '3.2T 1219*760.9', 'EA', 60, 60,
  0, '', '함안공장',
  35620, 'WAITING', '002160170-60',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072700005-1', '20072700005', 'W123', 'AIR CYLINDER',
  'KS1-278-PS2-7', 'EA', 10, 10,
  0, '', '특장 자재창고-화성',
  20000, 'WAITING', 'W123-10',
  '화성공장 발주건과 함께 화성으로 발송바랍니다.', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072700003-1', '20072700003', 'W123', '듀라렉스화이트볼',
  '12CM*6EA', 'EA', 3, 3,
  0, '', '특장 자재창고-화성',
  14000, 'WAITING', 'W123-3',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072700002-1', '20072700002', '002300200', 'O/R VERTICAL CYLINDER',
  'M24~30Z5-7TON(Ø63*Ø80*-550ST)', 'EA', 10, 10,
  0, '', '화성공장',
  330000, 'WAITING', '002300200-10',
  '긴급요청드립니다.', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072700001-1', '20072700001', '001252700', 'HEAT-TREATED BOOM PIPE (열처리 붐 파이프)',
  '5"*5T*2755', 'EA', 2, 2,
  0, '', '화성부품영업창고',
  116000, 'WAITING', '001252700-2',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072400028-1', '20072400028', 'MV101500004', 'CHASSIS BRACKET',
  'HIVA FC/FE 129,149 (PN:01506035)', 'EA', 20, 20,
  0, '', '특장 자재창고-화성',
  168000, 'WAITING', 'MV101500004-20',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072400027-1', '20072400027', 'W123', '(차압계)DIFFERENTIAL PRESSURE METER',
  '100mm, ANALOG, 0~1000mmH2O, PT1/8"F', 'EA', 5, 5,
  0, '', '화성공장',
  55000, 'WAITING', 'W123-5',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072400025-1', '20072400025', '000800541', 'PIPING B.K.T WATER PUMP',
  '25A(AG50*74MM)', 'EA', 100, 100,
  0, '', '함안공장',
  1690, 'WAITING', '000800541-100',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072400024-1', '20072400024', 'W123', 'SENSING VALVE',
  '65*95*45', 'EA', 10, 10,
  0, '', '함안공장',
  0, 'WAITING', 'W123-10',
  '김두민연구원 요청', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072400023-1', '20072400023', '100123000', 'BELL HOUSING FOR COMPRESSOR',
  'Ø160*Ø205*230L(15hp 유압 Compressor + SMS-80)', 'EA', 6, 6,
  0, '', '함안공장',
  55000, 'WAITING', '100123000-6',
  '김두민연구원 요청', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072400022-1', '20072400022', '000730110', 'BLOCK FOR COMPRESSOR',
  '90T*90*100 (NG10)', 'EA', 10, 10,
  0, '', '함안공장',
  0, 'WAITING', '000730110-10',
  '김두민연구원 요청', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072400021-1', '20072400021', '000251350', 'COUPLING WITH BASE (고정 클램프)',
  '5″-forging(KCP)', 'EA', 100, 100,
  0, '', '함안공장',
  19000, 'WAITING', '000251350-100',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072400018-1', '20072400018', 'PAY124', 'M59Z(102호기) 1ST BOOM',
  '1ST BOOM', 'EA', 1, 1,
  0, '', '함안공장',
  0, 'WAITING', 'PAY124-1',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072400018-2', '20072400018', 'PAY124', 'M59Z(102호기) 4TH BOOM',
  '4TH BOOM', 'EA', 1, 1,
  0, '', '함안공장',
  0, 'WAITING', 'PAY124-1',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072400018-3', '20072400018', 'PAY124', 'M37Z(63호기) 2ND BOOM',
  '2ND BOOM', 'EA', 1, 1,
  0, '', '함안공장',
  0, 'WAITING', 'PAY124-1',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072400018-4', '20072400018', 'PAY124', 'M59Z(102호기) 5TH BOOM',
  '5TH BOOM', 'EA', 1, 1,
  0, '', '함안공장',
  0, 'WAITING', 'PAY124-1',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072400018-5', '20072400018', 'PAY124', 'M59Z(102호기) 2ND BOOM',
  '2ND BOOM', 'EA', 1, 1,
  0, '', '함안공장',
  0, 'WAITING', 'PAY124-1',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072400018-6', '20072400018', 'PAY124', 'M59Z(102호기) 3RD BOOM',
  '3RD BOOM', 'EA', 1, 1,
  0, '', '함안공장',
  0, 'WAITING', 'PAY124-1',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072400018-7', '20072400018', 'PAY124', 'M59Z(102호기) LINK SET',
  'LINK SET', 'EA', 1, 1,
  0, '', '함안공장',
  0, 'WAITING', 'PAY124-1',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072400017-1', '20072400017', 'FH123', '내마모석션호스',
  '5*3CP/1W*4.3M', 'EA', 3, 3,
  0, '', '특장 자재창고-화성',
  330000, 'WAITING', 'FH123-3',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072400016-1', '20072400016', 'MV101500003', 'HYD CYLINDER',
  'HIVA FE149-3-3880-K1644 (PN:71535227)', 'EA', 10, 10,
  0, '', '특장 자재창고-화성',
  2800000, 'WAITING', 'MV101500003-10',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072400015-1', '20072400015', 'SC122310006', 'BEACON BKT',
  'STS201 3T', 'EA', 10, 10,
  0, '', '특장 자재창고-화성',
  0, 'WAITING', 'SC122310006-10',
  '박중현연구원 요청', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072400015-2', '20072400015', 'MV111310015', 'BKT FOR SAFETY PARKING',
  'STS304 3T', 'EA', 10, 10,
  0, '', '특장 자재창고-화성',
  0, 'WAITING', 'MV111310015-10',
  '박중현연구원 요청', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072400015-3', '20072400015', 'MV101312004', 'COVER FOR CONTROL VALVE',
  'STS304 2T(2B) 452*300*245', 'EA', 4, 4,
  0, '', '특장 자재창고-화성',
  0, 'WAITING', 'MV101312004-4',
  '박중현연구원 요청', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072400015-4', '20072400015', 'SC122320001', 'U-BOLT BKT(80A)',
  'SS400 4.5T', 'EA', 10, 10,
  0, '', '특장 자재창고-화성',
  0, 'WAITING', 'SC122320001-10',
  '박중현연구원 요청', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072400015-5', '20072400015', 'MV101110003', 'AIR TANK BRACKET',
  'SS400*6T', 'EA', 10, 10,
  0, '', '특장 자재창고-화성',
  0, 'WAITING', 'MV101110003-10',
  '박중현연구원 요청', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072400015-6', '20072400015', 'SC144310012', 'REMOCON RECIVER BKT',
  'STS304 3T', 'EA', 10, 10,
  0, '', '특장 자재창고-화성',
  0, 'WAITING', 'SC144310012-10',
  '박중현연구원 요청', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072400014-1', '20072400014', 'W124', 'BKT FOR M75 2ST BOOM PIPE',
  'SS400 8T', 'EA', 2, 2,
  0, '', '함안공장',
  0, 'WAITING', 'W124-2',
  '김상병연구원 요청', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072400014-2', '20072400014', '002160167', 'BKT FOR OIL COOLER(BIG TYPE)',
  '4.5T*774*410*169', 'EA', 2, 2,
  0, '', '함안공장',
  31640, 'WAITING', '002160167-2',
  '김상병연구원 요청', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072400013-1', '20072400013', 'W124', 'PANNEL SUPPORT',
  '6T', 'EA', 1, 1,
  0, '', '함안공장',
  0, 'WAITING', 'W124-1',
  '김성영연구원 요청', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072400007-1', '20072400007', '000800204', 'SEAMLESS TUBE(ZIC)',
  'Ø12X2.0T*6M', 'EA', 500, 500,
  0, '', '화성공장',
  12350, 'WAITING', '000800204-500',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072400006-1', '20072400006', 'MV101780003', 'CONTROL PANEL ASSY',
  '480W*600H*280D (24V,KOR)', 'EA', 5, 5,
  0, '', '특장 자재창고-화성',
  1386000, 'WAITING', 'MV101780003-5',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072400004-1', '20072400004', '000121100', 'SLEWING GEAR',
  '1155(SLBI 106T*I.DØ840)', 'EA', 4, 4,
  0, '', '함안공장',
  1450000, 'WAITING', '000121100-4',
  '이병훈부장님 요청', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072300020-1', '20072300020', 'PAY124', 'M52 BASE 수정부재',
  '20T*370*390', 'EA', 24, 24,
  0, '', '함안공장',
  0, 'WAITING', 'PAY124-24',
  '개선 작업 요청합니다.', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072300020-2', '20072300020', 'PAY124', 'M52Z 4TH BOOM 측면 보강 부재',
  '12T*1125*40', 'EA', 9, 9,
  0, '', '함안공장',
  0, 'WAITING', 'PAY124-9',
  '개선 작업 요청합니다.', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072300015-1', '20072300015', '000252090', 'TWIN ELBOW',
  '5″X90˚ KCP', 'EA', 50, 50,
  0, '', '함안공장',
  75000, 'WAITING', '000252090-50',
  '08월 매출로 요청드립니다', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072300013-1', '20072300013', '020380150', 'RETURN FILTER HOUSING ASSY',
  'KTP60(MPFX4003AG3P25NBP01)', 'EA', 9, 9,
  0, '', '화성공장',
  100000, 'WAITING', '020380150-9',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072300009-1', '20072300009', 'W123', '락카',
  '사비 (30EA)', 'EA', 2, 2,
  0, '', '화성공장',
  53000, 'WAITING', 'W123-2',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072300008-1', '20072300008', '000300121', 'MAIN HYDRAULIC CYLINDER',
  'Ø120XØ70X2100', 'EA', 10, 10,
  0, '', '함안공장',
  1298000, 'WAITING', '000300121-10',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072300008-2', '20072300008', '000300100', 'MAIN HYDRAULIC CYLINDER',
  'Ø130X2100', 'EA', 10, 8,
  0, '', '함안공장',
  1366000, 'WAITING', '000300100-8',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072300008-3', '20072300008', '000300130', 'MAIN HYDRAULIC CYLINDER',
  'Ø140X2100', 'EA', 10, 9,
  0, '', '함안공장',
  1436000, 'WAITING', '000300130-9',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072300002-1', '20072300002', '000521610', 'RID FOR TRANSITION DOOR',
  '5INCH', 'EA', 2, 2,
  0, '', '화성공장',
  23000, 'WAITING', '000521610-2',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072300001-1', '20072300001', '000191550', 'SUCTION PIPE',
  'A20VLO190(12T)H406.4', 'EA', 5, 5,
  0, '', '함안공장',
  140000, 'WAITING', '000191550-5',
  '신명욱부장님 긴급요청드립니다.', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072200043-1', '20072200043', '500140200', 'FRONT OUTRIGGER',
  '(L)-(OUT BOX)NM52~55', 'EA', 6, 6,
  0, '', '함안공장',
  750000, 'WAITING', '500140200-6',
  '08월 생산계획', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072200043-2', '20072200043', '500100000', 'TURNING BASE',
  'M50(M48-II), NEW52', 'EA', 6, 6,
  0, '', '함안공장',
  8800000, 'WAITING', '500100000-6',
  '08월 생산계획', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072200043-3', '20072200043', '520142300', 'REAR OUTRIGGER',
  '(R)-O/R(15/03/31)-6500', 'EA', 6, 6,
  0, '', '함안공장',
  1746500, 'WAITING', '520142300-6',
  '08월 생산계획', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072200043-4', '20072200043', '500140250', 'FRONT OUTRIGGER',
  '(L)-(INNER BOX)NM52~55', 'EA', 6, 6,
  0, '', '함안공장',
  675000, 'WAITING', '500140250-6',
  '08월 생산계획', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072200043-5', '20072200043', '410140300', 'REAR OUTRIGGER',
  '(R)-5800L', 'EA', 6, 6,
  0, '', '함안공장',
  1347500, 'WAITING', '410140300-6',
  '08월 생산계획', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072200043-6', '20072200043', '410100000', 'TURNING BASE',
  'M41(5)', 'EA', 6, 6,
  0, '', '함안공장',
  6800000, 'WAITING', '410100000-6',
  '08월 생산계획', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072200043-7', '20072200043', '500140150', 'FRONT OUTRIGGER',
  '(R)-(INNER BOX)NM52~55', 'EA', 6, 6,
  0, '', '함안공장',
  675000, 'WAITING', '500140150-6',
  '08월 생산계획', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072200043-8', '20072200043', '500140100', 'FRONT OUTRIGGER',
  '(R)-(OUT BOX)NM52~55', 'EA', 6, 6,
  0, '', '함안공장',
  750000, 'WAITING', '500140100-6',
  '08월 생산계획', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072200043-9', '20072200043', '410140100', 'FRONT OUTRIGGER',
  'M41-(R)', 'EA', 6, 6,
  0, '', '함안공장',
  650000, 'WAITING', '410140100-6',
  '08월 생산계획', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072200043-10', '20072200043', '410140400', 'REAR OUTRIGGER',
  '(L)-5800L', 'EA', 6, 6,
  0, '', '함안공장',
  1347500, 'WAITING', '410140400-6',
  '08월 생산계획', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072200043-11', '20072200043', '520142400', 'REAR OUTRIGGER',
  '(L)-O/R(15/03/31)-6500', 'EA', 6, 6,
  0, '', '함안공장',
  1746500, 'WAITING', '520142400-6',
  '08월 생산계획', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072200043-12', '20072200043', '410140200', 'FRONT OUTRIGGER',
  'M41-(L)', 'EA', 6, 6,
  0, '', '함안공장',
  650000, 'WAITING', '410140200-6',
  '08월 생산계획', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072200042-1', '20072200042', 'PAY124', 'BOOM BODY(LINK, TURNTABLE, 후판 포함)절단',
  'M41Z(031~033)', 'EA', 3, 3,
  0, '', '함안공장',
  0, 'WAITING', 'PAY124-3',
  '08월 생산계획', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072200042-2', '20072200042', 'PAY124', 'BOOM BODY(LINK, TURNTABLE, 후판 포함)절단',
  'M52Z(313~328)', 'EA', 6, 6,
  0, '', '함안공장',
  0, 'WAITING', 'PAY124-6',
  '08월 생산계획', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072200042-3', '20072200042', 'PAY124', 'BOOM BODY(LINK, TURNTABLE, 후판 포함)절단',
  'M41Z(034~036)', 'EA', 3, 3,
  0, '', '함안공장',
  0, 'WAITING', 'PAY124-3',
  '08월 생산계획', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072200029-1', '20072200029', '410182100', 'COVER FOR SIDE',
  'M41(R)', 'EA', 3, 3,
  0, '', '화성공장',
  166700, 'WAITING', '410182100-3',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072200029-2', '20072200029', '410182200', 'COVER FOR SIDE',
  'M41(L)', 'EA', 3, 3,
  0, '', '화성공장',
  166700, 'WAITING', '410182200-3',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072200029-3', '20072200029', '410160130', 'DECK T/B-L',
  'M41Z 2.5T 2457*492(AL)', 'EA', 3, 3,
  0, '', '화성공장',
  73130, 'WAITING', '410160130-3',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072200029-4', '20072200029', '410160120', 'DECK T/B-R',
  'M41Z 2.5T 2457*492(AL)', 'EA', 3, 3,
  0, '', '화성공장',
  73130, 'WAITING', '410160120-3',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072200027-1', '20072200027', '410130100', 'BOOM SUPPORT',
  'M41Z(FRONT)', 'EA', 3, 3,
  0, '', '화성공장',
  210000, 'WAITING', '410130100-3',
  '제작발주입니다.', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072200027-2', '20072200027', '410130200', 'BOOM SUPPORT',
  'M41Z(REAR)', 'EA', 3, 3,
  0, '', '화성공장',
  191000, 'WAITING', '410130200-3',
  '제작발주입니다.', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072200027-3', '20072200027', '001180850', 'INSERT COVER',
  'M20,32,36R,38,40R,Z5,42Z5(H：287.1)', 'EA', 6, 6,
  0, '', '화성공장',
  22060, 'WAITING', '001180850-6',
  '제작발주입니다.', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072200026-1', '20072200026', '410130200', 'BOOM SUPPORT',
  'M41Z(REAR)', 'EA', 3, 3,
  0, '', '함안공장',
  191000, 'WAITING', '410130200-3',
  '제작발주입니다.', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072200026-2', '20072200026', '501140971', 'GUIDE FOR HOSE-1',
  'M52,M55', 'EA', 12, 12,
  0, '', '함안공장',
  20030, 'WAITING', '501140971-12',
  '제작발주입니다.', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072200026-3', '20072200026', '522130100', 'BOOM SUPPORT(REST)',
  '52Z6_FRONT', 'EA', 6, 6,
  0, '', '함안공장',
  186000, 'WAITING', '522130100-6',
  '제작발주입니다.', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072200026-4', '20072200026', '000802121', 'OUTREGGER STOPPER ASSY',
  '(R) 364L-45~55', 'EA', 6, 6,
  0, '', '함안공장',
  15220, 'WAITING', '000802121-6',
  '제작발주입니다.', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072200026-5', '20072200026', '000802122', 'OUTREGGER STOPPER ASSY',
  '(L) 364L-45~55', 'EA', 6, 6,
  0, '', '함안공장',
  15220, 'WAITING', '000802122-6',
  '제작발주입니다.', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072200026-6', '20072200026', '501140972', 'GUIDE FOR HOSE-2',
  'M52,M55', 'EA', 12, 12,
  0, '', '함안공장',
  22060, 'WAITING', '501140972-12',
  '제작발주입니다.', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072200026-7', '20072200026', '001180210', 'COVER FOR SLEWING GEAR',
  'M45, M48, M50, M52 공용', 'EA', 6, 6,
  0, '', '함안공장',
  111000, 'WAITING', '001180210-6',
  '제작발주입니다.', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072200026-8', '20072200026', '410130100', 'BOOM SUPPORT',
  'M41Z(FRONT)', 'EA', 3, 3,
  0, '', '함안공장',
  210000, 'WAITING', '410130100-3',
  '제작발주입니다.', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072200026-9', '20072200026', '522130200', 'BOOM SUPPORT(REST)',
  '52Z6_REAR', 'EA', 6, 6,
  0, '', '함안공장',
  350000, 'WAITING', '522130200-6',
  '제작발주입니다.', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072200026-10', '20072200026', '001180850', 'INSERT COVER',
  'M20,32,36R,38,40R,Z5,42Z5(H：287.1)', 'EA', 6, 6,
  0, '', '함안공장',
  22060, 'WAITING', '001180850-6',
  '제작발주입니다.', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072200026-11', '20072200026', '000172456', 'STEP(R.L포함)',
  'STEEL(2STEP)408*190(M52RZ 일자크로스 프레임적용)', 'EA', 6, 6,
  0, '', '함안공장',
  326000, 'WAITING', '000172456-6',
  '제작발주입니다.', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072200026-12', '20072200026', '501140950', 'BKT FOR GUIDE HOSE',
  '', 'EA', 12, 12,
  0, '', '함안공장',
  13370, 'WAITING', '501140950-12',
  '제작발주입니다.', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072200026-13', '20072200026', '001180855', 'INSERT COVER',
  'M45,M48,M50,M52(H332)', 'EA', 12, 12,
  0, '', '함안공장',
  24080, 'WAITING', '001180855-12',
  '제작발주입니다.', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072200025-1', '20072200025', '501140960', 'WIRE FOR FRONT O／R',
  'Ø8(M12-3320L*4EA, M12-5500L*4EA)', 'EA', 12, 12,
  0, '', '함안공장',
  274800, 'WAITING', '501140960-12',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072200024-1', '20072200024', '000121100', 'SLEWING GEAR',
  '1155(SLBI 106T*I.DØ840)', 'EA', 3, 3,
  0, '', '화성공장',
  1450000, 'WAITING', '000121100-3',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072200023-1', '20072200023', '000121100', 'SLEWING GEAR',
  '1155(SLBI 106T*I.DØ840)', 'EA', 3, 3,
  0, '', '함안공장',
  1450000, 'WAITING', '000121100-3',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072200023-2', '20072200023', '460126100', 'SLEWING GEAR',
  'M52 SCM-1476(Ø1476*Ø1085*135T)', 'EA', 6, 6,
  0, '', '함안공장',
  3500000, 'WAITING', '460126100-6',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072200021-1', '20072200021', '590140964', 'HOLDER FOR GUIDE BLOCK-1',
  'M59-30T*35*127', 'EA', 20, 20,
  0, '', '함안공장',
  25000, 'WAITING', '590140964-20',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072200021-2', '20072200021', '000322100', 'O/R MOTOR RELIEF VLAVE BLOCK',
  'M59 (40T*80*76)', 'EA', 20, 20,
  0, '', '함안공장',
  35000, 'WAITING', '000322100-20',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072200021-3', '20072200021', '590140965', 'HOLDER FOR GUIDE BLOCK-2',
  '35T*60*60', 'EA', 20, 20,
  0, '', '함안공장',
  25000, 'WAITING', '590140965-20',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072200020-1', '20072200020', 'W124', '알루미늄 변경품',
  'KTP1905', 'EA', 2, 2,
  0, '', '화성공장',
  0, 'WAITING', 'W124-2',
  '강동욱연구원 요청', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072200015-1', '20072200015', '410210100', 'BOOM BUSH SET',
  'M41Z 5S', 'EA', 3, 3,
  0, '', '화성공장',
  66060, 'WAITING', '410210100-3',
  '8월 발주건부터 신규 프로그램으로 전표생성바랍니다.', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072200014-1', '20072200014', '410210100', 'BOOM BUSH SET',
  'M41Z 5S', 'EA', 3, 3,
  0, '', '함안공장',
  66060, 'WAITING', '410210100-3',
  '8월 발주건부터 신규 프로그램으로 전표생성바랍니다.', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072200014-2', '20072200014', '521210100', 'BOOM BUSH SET',
  'M52Z6S(NEW)', 'EA', 6, 6,
  0, '', '함안공장',
  121190, 'WAITING', '521210100-6',
  '8월 발주건부터 신규 프로그램으로 전표생성바랍니다.', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072200013-1', '20072200013', 'W133', 'BOOM BOSS SET',
  'M41Z5(일부사내가공)', 'EA', 6, 6,
  0, '', '함안공장',
  374000, 'WAITING', 'W133-6',
  '착지- 2공장', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072200013-2', '20072200013', 'W133', 'BOOM BOSS SET',
  'M52Z6(일부 사내가공)', 'EA', 6, 6,
  0, '', '함안공장',
  0, 'WAITING', 'W133-6',
  '착지- 2공장', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072200008-1', '20072200008', '410240000', 'BOOM CYLINDER SET',
  'M41Z 5S', 'EA', 3, 3,
  0, '', '화성공장',
  6634000, 'WAITING', '410240000-3',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072200007-1', '20072200007', '410240000', 'BOOM CYLINDER SET',
  'M41Z 5S', 'EA', 3, 3,
  0, '', '함안공장',
  6634000, 'WAITING', '410240000-3',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072200007-2', '20072200007', '521240000', 'BOOM CYLINDER SET',
  'M52Z6', 'EA', 6, 6,
  0, '', '함안공장',
  13138000, 'WAITING', '521240000-6',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072200004-1', '20072200004', '000251320', 'BOLT TYPE COUPLING (볼트 클램프)',
  '5″-forging(KCP)', 'EA', 230, 230,
  0, '', '함안공장',
  17000, 'WAITING', '000251320-230',
  '08월 매출로 요청드립니다', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072200003-1', '20072200003', 'FH123', 'FLUID HOSE',
  '주유기호스1"X2500L', 'EA', 5, 5,
  0, '', '함안공장',
  66000, 'WAITING', 'FH123-5',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072100023-1', '20072100023', 'W124', 'MV101110003 AIR TANK BRACKET 부재 #02 , #03',
  '', 'EA', 50, 50,
  0, '', '특장 자재창고-화성',
  0, 'WAITING', 'W124-50',
  '박현우연구원 요청', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072100023-2', '20072100023', 'MV101720010', 'ADJUSTNG STOPPER',
  '12T*60*35', 'EA', 50, 50,
  0, '', '특장 자재창고-화성',
  1700, 'WAITING', 'MV101720010-50',
  '박현우연구원 요청', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072100023-3', '20072100023', 'MV101720009', 'STOPPER',
  '10T*50*50', 'EA', 50, 50,
  0, '', '특장 자재창고-화성',
  670, 'WAITING', 'MV101720009-50',
  '박현우연구원 요청', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072100006-1', '20072100006', 'W126', '페인트(4L)',
  '스피롤탄S형 메탈릭(910)-METAL.GREY(4L)', 'EA', 1, 1,
  0, '', '함안공장',
  0, 'WAITING', 'W126-1',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072100006-2', '20072100006', 'W126', '페인트(4L)',
  '아크릴우레탄KCP-VIPER.RED (4L)', 'EA', 2, 2,
  0, '', '함안공장',
  0, 'WAITING', 'W126-2',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072100001-1', '20072100001', '000251320', 'BOLT TYPE COUPLING (볼트 클램프)',
  '5″-forging(KCP)', 'EA', 230, 230,
  0, '', '함안공장',
  17000, 'WAITING', '000251320-230',
  '08월 매출로 요청드립니다', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072100001-2', '20072100001', '451140960', 'WIRE FOR FRONT O／R',
  'Ø8(M12：3160L:4EA, 5000L:4EA)', 'EA', 6, 6,
  0, '', '함안공장',
  223660, 'WAITING', '451140960-6',
  '08월 매출로 요청드립니다', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072000025-1', '20072000025', '590230000', 'BOOM PIN SET',
  'M59Z', 'EA', 1, 1,
  0, '', '함안공장',
  3600000, 'WAITING', '590230000-1',
  '도면확인 후 제작(도면 첨부)', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072000024-1', '20072000024', '590240000', 'BOOM CYLINDER SET - 5단',
  'M59Z 5S(14／01)', 'EA', 1, 1,
  0, '', '화성공장',
  14582000, 'WAITING', '590240000-1',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072000021-1', '20072000021', 'FF123', 'FLUID FITTING',
  'GE12LR1/2KEGCF', 'EA', 30, 30,
  0, '', '함안공장',
  0, 'WAITING', 'FF123-30',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072000021-2', '20072000021', '000701300', 'ACCUMULATOR',
  'SB330-4A1/112A', 'EA', 4, 4,
  0, '', '함안공장',
  370000, 'WAITING', '000701300-4',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072000021-3', '20072000021', 'FF123', 'FLUID FITTING',
  'VSTI 3/8EDCF', 'EA', 30, 30,
  0, '', '함안공장',
  0, 'WAITING', 'FF123-30',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072000021-4', '20072000021', 'FF123', 'FLUID FITTING',
  'G12LCF', 'EA', 100, 100,
  0, '', '함안공장',
  0, 'WAITING', 'FF123-100',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072000021-5', '20072000021', 'FF123', 'FLUID FITTING',
  'G08LCF', 'EA', 50, 50,
  0, '', '함안공장',
  0, 'WAITING', 'FF123-50',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072000021-6', '20072000021', 'FF123', 'FLUID FITTING',
  'VSTI 3/4EDCF', 'EA', 30, 30,
  0, '', '함안공장',
  0, 'WAITING', 'FF123-30',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072000021-7', '20072000021', 'FF123', 'FLUID FITTING',
  'VSTI 1 1/4EDCF', 'EA', 5, 5,
  0, '', '함안공장',
  0, 'WAITING', 'FF123-5',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072000021-8', '20072000021', 'FF123', 'FLUID FITTING',
  'W15LCFX', 'EA', 50, 50,
  0, '', '함안공장',
  0, 'WAITING', 'FF123-50',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072000021-9', '20072000021', 'FF123', 'FLUID FITTING',
  'GE12L 3/4UNF)', 'EA', 20, 20,
  0, '', '함안공장',
  0, 'WAITING', 'FF123-20',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072000021-10', '20072000021', 'FF123', 'FLUID FITTING',
  'EGE08LR1/4ED', 'EA', 50, 50,
  0, '', '함안공장',
  0, 'WAITING', 'FF123-50',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072000021-11', '20072000021', 'FF123', 'FLUID FITTING',
  'VSTI 1 1/2EDCF', 'EA', 5, 5,
  0, '', '함안공장',
  0, 'WAITING', 'FF123-5',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072000021-12', '20072000021', '000990520', 'WATER RELIEF VALVE(신주)',
  '25A*10K', 'EA', 10, 10,
  0, '', '함안공장',
  18000, 'WAITING', '000990520-10',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072000021-13', '20072000021', 'FF123', 'FLUID FITTING',
  'T08LCF', 'EA', 100, 100,
  0, '', '함안공장',
  0, 'WAITING', 'FF123-100',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072000021-14', '20072000021', '000351350', 'FLANGE FOR P.T.O CASE (GREASE SEAL)',
  'KCP (FD11PTO12)', 'EA', 4, 4,
  0, '', '함안공장',
  0, 'WAITING', '000351350-4',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072000021-15', '20072000021', 'W123', 'LID FOR AIR GREASE PUMP(사진참조)',
  'CHP-88B(45：1)', 'EA', 10, 10,
  0, '', '함안공장',
  15000, 'WAITING', 'W123-10',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072000020-1', '20072000020', '000193560', 'SUCTION PIPE',
  'M34Z5-A20VLO190(12T)', 'EA', 6, 6,
  0, '', '화성공장',
  155000, 'WAITING', '000193560-6',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072000016-1', '20072000016', '590210100', 'BOOM BUSH SET',
  'M59(14／01)', 'EA', 1, 1,
  0, '', '화성공장',
  136360, 'WAITING', '590210100-1',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072000012-1', '20072000012', '300240400', '4th BOOM CYLINDER',
  'Ø120*Ø65*ST920', 'EA', 1, 1,
  0, '', '화성공장',
  651000, 'WAITING', '300240400-1',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072000012-2', '20072000012', '300240200', '2nd BOOM CYLINDER',
  'Ø170*Ø100*ST1205', 'EA', 1, 1,
  0, '', '화성공장',
  1371000, 'WAITING', '300240200-1',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072000007-1', '20072000007', '000730070', 'LOGIC COVER(17/06)',
  'ONE BLOCK-55T*151*99', 'EA', 9, 5,
  0, '', '화성공장',
  71000, 'WAITING', '000730070-5',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20072000006-1', '20072000006', '020730310', 'HEAD COVER BLOCK',
  'KTP60(50*90*311) CAN', 'EA', 10, 10,
  0, '', '화성공장',
  65000, 'WAITING', '020730310-10',
  '긴급요청드립니다.', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20071700030-1', '20071700030', '000730921', 'LOGIC COVER(2)-BDSV',
  'ONE BLOCK＃32- 55T*107*170(2012/06)', 'EA', 5, 3,
  0, '', '함안공장',
  120000, 'WAITING', '000730921-3',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20071700009-1', '20071700009', 'MV101020025', 'HANDRAIL FOR TANK BODY',
  'SS400 3.2T, SQ PIPE 40*40*2.3T', 'EA', 2, 2,
  0, '', '특장 자재창고-화성',
  49720, 'WAITING', 'MV101020025-2',
  '박현우연구원 요청', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20071700009-2', '20071700009', 'MV113310003', 'BELT COVER ASSY',
  'SS400 2.3T', 'EA', 1, 1,
  0, '', '특장 자재창고-화성',
  84810, 'WAITING', 'MV113310003-1',
  '박현우연구원 요청', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20071700009-3', '20071700009', 'MV101163300', 'ADAPTER FOR FILTER BOX',
  'STS PIPE 300A, 90 ELBOW 300A, TEE 300Ax300A', 'EA', 2, 2,
  0, '', '특장 자재창고-화성',
  874350, 'WAITING', 'MV101163300-2',
  '박현우연구원 요청', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20071600004-1', '20071600004', '370240000', 'BOOM CYLINDER SET',
  'M37Z5', 'EA', 3, 3,
  0, '', '함안공장',
  5749000, 'WAITING', '370240000-3',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20071600004-2', '20071600004', '400240000', 'BOOM CYLINDER SET',
  'M40R', 'EA', 6, 6,
  0, '', '함안공장',
  6737000, 'WAITING', '400240000-6',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20071500024-1', '20071500024', 'SC144310018', 'UNLOADING VALVE',
  'SS400 6T, 3.2T', 'EA', 1, 1,
  0, '', '특장 자재창고-화성',
  0, 'WAITING', 'SC144310018-1',
  '김재민연구원 요청', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20071500023-1', '20071500023', '370242300', '3rd BOOM CYLINDER-M37Z',
  'Ø170*Ø100*1165ST', 'EA', 1, 1,
  0, '', '함안공장',
  1316000, 'WAITING', '370242300-1',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20071500022-1', '20071500022', '000121100', 'SLEWING GEAR',
  '1155(SLBI 106T*I.DØ840)', 'EA', 3, 3,
  0, '', '화성공장',
  1450000, 'WAITING', '000121100-3',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20071500019-1', '20071500019', '000730510', 'COUNTER BALANCE VALVE(2)',
  '40T*60*90', 'EA', 50, 50,
  0, '', '함안공장',
  0, 'WAITING', '000730510-50',
  '김두민연구원 요청', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20071500013-1', '20071500013', '000371400', 'CONTROL VALVE FOR BOOM',
  '6SECTION-12V-PSL(M30R~M33R)', 'EA', 6, 6,
  0, '', '함안공장',
  0, 'WAITING', '000371400-6',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20071500013-2', '20071500013', '001372240', 'CONTROL VALVE FOR BOOM(VARIABLE TYPE)',
  '7SECTION-12V-PSVF(M48~M70)', 'EA', 4, 4,
  0, '', '함안공장',
  0, 'WAITING', '001372240-4',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20071500013-3', '20071500013', '000371420', 'CONTROL VALVE FOR BOOM',
  '6SECTION-12V-PSL(M18~M28)', 'EA', 4, 4,
  0, '', '함안공장',
  0, 'WAITING', '000371420-4',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20071500002-1', '20071500002', '000511050', 'SEAL HOUSING ASSY',
  'SplineØ80 (With seal kit&thrust ring)', 'EA', 25, 18,
  0, '', '화성부품영업창고',
  110000, 'WAITING', '000511050-18',
  '빠른 입고 요청드립니다', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20071400032-1', '20071400032', '000770430', 'DOOR LOCK-R',
  'R041-D01-0(4-Ø6.5)', 'EA', 100, 100,
  0, '', '화성공장',
  12500, 'WAITING', '000770430-100',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20071400030-1', '20071400030', 'OR123', 'SEAL KIT SEATED VALVE',
  '(PSL 3H1 ZM/D 380-2)EM21 DSE', 'EA', 50, 50,
  0, '', '함안공장',
  0, 'WAITING', 'OR123-50',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20071400030-2', '20071400030', '000370450', '2/2WAY(SEATED V/V)',
  '(PSL 3H1 ZM/D 380-2) EM21 DSE-G24', 'EA', 10, 10,
  0, '', '함안공장',
  0, 'WAITING', '000370450-10',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20071400030-3', '20071400030', '000373201', 'COIL FOR BOOM CONTROL',
  'PSLF-DC12', 'EA', 60, 60,
  0, '', '함안공장',
  0, 'WAITING', '000373201-60',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20071400016-1', '20071400016', '000351200', 'REDUCTION GEAR BOX',
  'M40(30T)', 'EA', 1, 1,
  0, '', '화성부품영업창고',
  2730000, 'WAITING', '000351200-1',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20071400010-1', '20071400010', '000252090', 'TWIN ELBOW',
  '5″X90˚ KCP', 'EA', 300, 50,
  0, '', '함안공장',
  75000, 'WAITING', '000252090-50',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20071300023-1', '20071300023', 'W123', 'SEAL KIT FOR ROD COVER',
  'M40Z5-1ST', 'EA', 2, 1,
  0, '', '함안공장',
  0, 'WAITING', 'W123-1',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20071300018-1', '20071300018', 'MV101720003', 'SHAFT FOR PULLEY',
  'S45C Ø60*65*565L', 'EA', 5, 5,
  0, '', '특장 자재창고-화성',
  107000, 'WAITING', 'MV101720003-5',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20071300018-2', '20071300018', 'MV101720004', 'FLANGE FOR SHAFT',
  'S45C*Ø150*67L(8-M12)', 'EA', 5, 5,
  0, '', '특장 자재창고-화성',
  66071, 'WAITING', 'MV101720004-5',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20071300015-1', '20071300015', '000512700', 'AGITATOR SHAFT',
  'KCP-Ø65*130L(OPEN)', 'EA', 30, 30,
  0, '', '화성부품영업창고',
  35000, 'WAITING', '000512700-30',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20070900028-1', '20070900028', '000300538', 'SWING CYLINDER FOR ROD EYE',
  'M55', 'EA', 10, 10,
  0, '', '함안공장',
  0, 'WAITING', '000300538-10',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20070900027-1', '20070900027', '000502101', 'SCREEN FOR HOPPER(스크린)',
  'SMALL(M30)', 'EA', 1, 1,
  0, '', '함안공장',
  120000, 'WAITING', '000502101-1',
  '', '2026-09-03T07:22:17.254Z',
  '2026-09-03T07:22:17.254Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;
INSERT INTO public.tb_inbound_items (
  row_id, slip_no, item_code, item_name, spec, unit, order_qty, received_qty,
  defect_qty, defect_reason, warehouse, unit_price, item_status, barcode, notes, created_at, updated_at
) VALUES (
  'erp-item-20080400002-1', '20080400002', '900060050', 'DU-BUSH',
  '60*50', 'EA', 20, 20,
  0, '', '화성부품영업창고',
  1100, 'WAITING', '900060050-20',
  '당일 발송 요청드립니다', '2026-09-03T07:58:01.780Z',
  '2026-09-03T07:58:01.780Z'
) ON CONFLICT (row_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  spec = EXCLUDED.spec,
  order_qty = EXCLUDED.order_qty,
  received_qty = EXCLUDED.received_qty,
  warehouse = EXCLUDED.warehouse,
  unit_price = EXCLUDED.unit_price,
  item_status = EXCLUDED.item_status;

COMMIT;
