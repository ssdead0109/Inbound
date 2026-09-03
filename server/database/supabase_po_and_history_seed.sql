-- ==========================================================
-- SmartRack / ERP 발주내역(tb_purchase_orders) 및 입고완료내역 시드
-- 실행방법: Supabase 대시보드 -> SQL Editor에 붙여넣고 [Run] 실행
-- ==========================================================

BEGIN;

-- 1. 발주 내역 (tb_purchase_orders - 206개 발주 품목)
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20080300002_000573000_1', '20080300002', '2020-08-04', '2020-08-04',
  '6060440531', '신우', '화성부품영업창고',
  '000573000', 'S-VALVE', '200*180(COMMON USE)',
  'EA', 1, 1, 0,
  600000, 600000, '경동 화성 양감 송산 110(010-2332-9396)', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20080300001_403240000_1', '20080300001', '2020-09-03', '2020-09-03',
  '00391', '중국／JINAN HUACHENWEIDA TRAD CO.,LTD(실린더)', '함안공장',
  '403240000', 'BOOM CYLINDER SET', 'M40Z 5S',
  'EA', 3, 3, 0,
  7662000, 22986000, '생산,A/S 재고 확보', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20073000003_W123_1', '20073000003', '2020-07-30', '2020-07-30',
  '1408123163', '(주)대원하이텍', '화성부품영업창고',
  'W123', '베어링 후렌지 아세이', 'Ø60 유팩킹타입',
  'EA', 4, 4, 0,
  45000, 180000, '고객직송', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072900005_900270045_1', '20072900005', '2020-07-31', '2020-07-31',
  '1210943105', '제이에스비(JSB)', '함안공장',
  '900270045', 'DU-BUSH', '270*45',
  'EA', 10, 10, 0,
  5000, 50000, '뉴질랜드 판매외', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072900005_900280050_2', '20072900005', '2020-07-31', '2020-07-31',
  '1210943105', '제이에스비(JSB)', '함안공장',
  '900280050', 'DU-BUSH', '280*50',
  'EA', 10, 10, 0,
  5800, 58000, '뉴질랜드 판매외', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072900005_900100095_3', '20072900005', '2020-07-31', '2020-07-31',
  '1210943105', '제이에스비(JSB)', '함안공장',
  '900100095', 'DU-BUSH', '100*95',
  'EA', 6, 6, 0,
  3600, 21600, '뉴질랜드 판매외', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072900005_900090060_4', '20072900005', '2020-07-31', '2020-07-31',
  '1210943105', '제이에스비(JSB)', '함안공장',
  '900090060', 'DU-BUSH', '90*60',
  'EA', 4, 4, 0,
  2060, 8240, '뉴질랜드 판매외', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072900005_900070040_5', '20072900005', '2020-07-31', '2020-07-31',
  '1210943105', '제이에스비(JSB)', '함안공장',
  '900070040', 'DU-BUSH', '70*40',
  'EA', 4, 4, 0,
  1050, 4200, '뉴질랜드 판매외', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072900005_900060030_6', '20072900005', '2020-07-31', '2020-07-31',
  '1210943105', '제이에스비(JSB)', '함안공장',
  '900060030', 'DU-BUSH', '60*30',
  'EA', 4, 4, 0,
  710, 2840, '뉴질랜드 판매외', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072900003_PAY124_1', '20072900003', '2020-08-07', '2020-08-07',
  '4275400116', '샤인테크', '화성공장',
  'PAY124', '4M MAST 구조물 각인 명판', '8T*50*25',
  'EA', 10, 10, 0,
  2500, 25000, '08월 생산계획 추가', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072900003_PAY124_2', '20072900003', '2020-08-07', '2020-08-07',
  '4275400116', '샤인테크', '화성공장',
  'PAY124', '6M MAST 구조물 각인 명판', '8T*50*25',
  'EA', 10, 10, 0,
  2500, 25000, '08월 생산계획 추가', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072900002_PAY124_1', '20072900002', '2020-07-31', '2020-07-31',
  '6088175677', '태광엠앤에스 주식회사', '화성공장',
  'PAY124', '6M MAST FOR PLACING (절단, 밴딩, 후판 포함)', '6M MAST',
  'EA', 10, 10, 0,
  0, 0, '08월 추가 생산계획', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072900002_PAY124_2', '20072900002', '2020-07-31', '2020-07-31',
  '6088175677', '태광엠앤에스 주식회사', '화성공장',
  'PAY124', '4M MAST FOR PLACING (절단, 밴딩, 후판 포함)', '4M MAST',
  'EA', 10, 10, 0,
  0, 0, '08월 추가 생산계획', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072800018_000550010_1', '20072800018', '2020-08-10', '2020-08-10',
  '5038176139', '주식회사 창녕', '화성공장',
  '000550010', 'DELIVERY CYLINDER (230*2100)', 'M36(2320L)',
  'EA', 8, 8, 0,
  970000, 7760000, '', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072800017_000550010_1', '20072800017', '2020-08-10', '2020-08-10',
  '5038176139', '주식회사 창녕', '함안공장',
  '000550010', 'DELIVERY CYLINDER (230*2100)', 'M36(2320L)',
  'EA', 14, 14, 0,
  970000, 13580000, '8월부터 신규프로그램으로 전표처리바랍니다.', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072800010_001361170_1', '20072800010', '2020-07-30', '2020-07-30',
  '1098145190', '하베코리아주식회사', '화성공장',
  '001361170', 'BOOM OIL PUMP', 'SAP-017L-N-DL4-L35-S0S-000',
  'EA', 6, 6, 0,
  477000, 2862000, '', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072800009_MV101311010_1', '20072800009', '2020-07-30', '2020-07-30',
  '6092471332', '보성이피에스', '특장 자재창고-화성',
  'MV101311010', 'PIPE FOR ELECTRIC WIRE', 'ROUND TUBE STS304 50A(60.5)x1.5Tx6,000L',
  'EA', 6, 6, 0,
  0, 0, '이규훈연구원 요청', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072800008_000331200_1', '20072800008', '2020-07-29', '2020-07-29',
  '6158141990', '하이파워유압(주)', '함안공장',
  '000331200', 'OUTRIGGER CHECK VALVE (O/R 체크밸브)', 'O/R',
  'EA', 100, 100, 0,
  50000, 5000000, '', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072800007_W125_1', '20072800007', '2020-07-28', '2020-07-28',
  '6088122087', '(유)화진철강', '함안공장',
  'W125', '평철', '12*25*6M',
  'EA', 50, 50, 0,
  11328, 566400, '착지- 한일공업', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072800005_522230000_1', '20072800005', '2020-08-28', '2020-08-28',
  '5040146183', '일출산업사', '함안공장',
  '522230000', 'BOOM PIN SET', 'M52Z6S',
  'EA', 6, 6, 0,
  0, 0, '323~328', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072800004_000186150_1', '20072800004', '2020-07-31', '2020-07-31',
  '6092471332', '보성이피에스', '화성공장',
  '000186150', 'COVER FOR SIDE', 'M32-M40(R)-AL',
  'EA', 1, 1, 0,
  190000, 190000, 'M40R-550 씨원', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072800004_000186100_2', '20072800004', '2020-07-31', '2020-07-31',
  '6092471332', '보성이피에스', '화성공장',
  '000186100', 'COVER FOR SIDE', 'M32-M40(L)-AL',
  'EA', 1, 1, 0,
  190000, 190000, 'M40R-550 씨원', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072800004_002162120_3', '20072800004', '2020-07-31', '2020-07-31',
  '6092471332', '보성이피에스', '화성공장',
  '002162120', 'DECK T/B-R', 'M32,36,38,40-AL(2.5T 2467*492)',
  'EA', 1, 1, 0,
  73000, 73000, 'M40R-550 씨원', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072800004_002162130_4', '20072800004', '2020-07-31', '2020-07-31',
  '6092471332', '보성이피에스', '화성공장',
  '002162130', 'DECK T/B-L', 'M32,36,38,40-AL(2.5T 2467*492)',
  'EA', 1, 1, 0,
  73000, 73000, 'M40R-550 씨원', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072800003_001251400_1', '20072800003', '2020-07-30', '2020-07-30',
  '1252006922', '하이콘테크', '함안공장',
  '001251400', 'HEAT-TREATED BOOM PIPE (열처리 붐 파이프)', '5"*5T*1455',
  'EA', 1, 1, 0,
  69000, 69000, 'M32RZ-50 하도 (티렉스)', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072800003_001251500_2', '20072800003', '2020-07-30', '2020-07-30',
  '1252006922', '하이콘테크', '함안공장',
  '001251500', 'HEAT-TREATED BOOM PIPE (열처리 붐 파이프)', '5"*5T*1573',
  'EA', 1, 1, 0,
  72000, 72000, 'M32RZ-50 하도 (티렉스)', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072800003_001251100_3', '20072800003', '2020-07-30', '2020-07-30',
  '1252006922', '하이콘테크', '함안공장',
  '001251100', 'HEAT-TREATED BOOM PIPE (열처리 붐 파이프)', '5"*5T*1149',
  'EA', 1, 1, 0,
  60000, 60000, 'M32RZ-50 하도 (티렉스)', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072800003_001251300_4', '20072800003', '2020-07-30', '2020-07-30',
  '1252006922', '하이콘테크', '함안공장',
  '001251300', 'HEAT-TREATED BOOM PIPE (열처리 붐 파이프)', '5"*5T*1392',
  'EA', 1, 1, 0,
  66000, 66000, 'M32RZ-50 하도 (티렉스)', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072800003_001251400_5', '20072800003', '2020-07-30', '2020-07-30',
  '1252006922', '하이콘테크', '함안공장',
  '001251400', 'HEAT-TREATED BOOM PIPE (열처리 붐 파이프)', '5"*5T*1460',
  'EA', 1, 1, 0,
  69000, 69000, 'M32RZ-50 하도 (티렉스)', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072800002_001250300_1', '20072800002', '2020-07-30', '2020-07-30',
  '1252006922', '하이콘테크', '화성공장',
  '001250300', 'HEAT-TREATED BOOM PIPE (열처리 붐 파이프)', '5"*5T*370',
  'EA', 7, 7, 0,
  32000, 224000, 'M40Z 7대 하도 (씨원)', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072800002_001252200_2', '20072800002', '2020-07-30', '2020-07-30',
  '1252006922', '하이콘테크', '화성공장',
  '001252200', 'HEAT-TREATED BOOM PIPE (열처리 붐 파이프)', '5"*5T*2260',
  'EA', 7, 7, 0,
  97000, 679000, 'M40Z 7대 하도 (씨원)', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072800002_001250300_3', '20072800002', '2020-07-30', '2020-07-30',
  '1252006922', '하이콘테크', '화성공장',
  '001250300', 'HEAT-TREATED BOOM PIPE (열처리 붐 파이프)', '5"*5T*305',
  'EA', 7, 7, 0,
  32000, 224000, 'M40Z 7대 하도 (씨원)', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072800002_001250300_4', '20072800002', '2020-07-30', '2020-07-30',
  '1252006922', '하이콘테크', '화성공장',
  '001250300', 'HEAT-TREATED BOOM PIPE (열처리 붐 파이프)', '5"*5T*300',
  'EA', 7, 7, 0,
  32000, 224000, 'M40Z 7대 하도 (씨원)', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072700023_PAY125_1', '20072700023', '2020-07-28', '2020-07-28',
  '1252006922', '하이콘테크', '함안공장',
  'PAY125', '운송료', '화물',
  'EA', 1, 1, 0,
  10000, 10000, '출고택배로 보내주세요', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072700023_001250900_2', '20072700023', '2020-07-28', '2020-07-28',
  '1252006922', '하이콘테크', '함안공장',
  '001250900', 'HEAT-TREATED BOOM PIPE (열처리 붐 파이프)', '5"*5T*960',
  'EA', 1, 1, 0,
  56000, 56000, '출고택배로 보내주세요', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072700021_000270121_1', '20072700021', '2020-07-30', '2020-07-30',
  '5448601177', '(주)제이인더스트리코리아', '함안공장',
  '000270121', 'OIL PIPE CLAMP(SEAMLESS)', 'Ø12(RAIL TYPE)',
  'EA', 1200, 1200, 0,
  620, 744000, '200개/1박스- 티렉스', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072700020_W124_1', '20072700020', '2020-08-07', '2020-08-07',
  '6092471332', '보성이피에스', '특장 자재창고-화성',
  'W124', 'SHAFT FOR PULLEY(MV101720003) KEY', '',
  'EA', 5, 5, 0,
  0, 0, '박현우연구원 요청', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072700019_000800647_1', '20072700019', '2020-07-30', '2020-07-30',
  '6088175677', '태광엠앤에스 주식회사', '화성공장',
  '000800647', 'B.K.T FOR TAIL LIGHT(R.L)', '3.2T*165*483*W177(XCIENT)M55,M59',
  'EA', 6, 6, 0,
  64210, 385260, '제작 쇼트하도- 현대 17T 씨원 요청', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072700018_000720120_1', '20072700018', '2020-07-31', '2020-07-31',
  '6074476979', '유성산업', '화성공장',
  '000720120', 'PRESSURE GAUGE', '63-A-400BAR(PT)VIKA',
  'EA', 10, 10, 0,
  11000, 110000, '신규시스템으로 8월 전표처리바랍니다.', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072700018_000720125_2', '20072700018', '2020-07-31', '2020-07-31',
  '6074476979', '유성산업', '화성공장',
  '000720125', 'PRESSURE GAUGE', '63-D-100BAR(b-type)PF1/4(VIKA)',
  'EA', 30, 30, 0,
  12000, 360000, '신규시스템으로 8월 전표처리바랍니다.', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072700018_000720111_3', '20072700018', '2020-07-31', '2020-07-31',
  '6074476979', '유성산업', '화성공장',
  '000720111', 'PRESSURE GAUGE', '63-D-400BAR(b-type)PF1/4(VIKA)',
  'EA', 200, 200, 0,
  13000, 2600000, '신규시스템으로 8월 전표처리바랍니다.', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072700013_W124_1', '20072700013', '2020-07-31', '2020-07-31',
  '6088175677', '태광엠앤에스 주식회사', '화성공장',
  'W124', 'TOP COVER 제작', 'KTP0706(CAN)',
  'EA', 9, 9, 0,
  0, 0, '강동욱연구원 요청', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072700013_W124_2', '20072700013', '2020-07-31', '2020-07-31',
  '6088175677', '태광엠앤에스 주식회사', '화성공장',
  'W124', 'BKT FOR OIL COOLER', 'KTP0706(CAN)',
  'EA', 18, 18, 0,
  0, 0, '강동욱연구원 요청', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072700013_W124_3', '20072700013', '2020-07-31', '2020-07-31',
  '6088175677', '태광엠앤에스 주식회사', '화성공장',
  'W124', 'OIL COOLER, TOP COVER 수정', 'KTP0706(CAN)',
  'EA', 7, 7, 0,
  0, 0, '강동욱연구원 요청', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072700013_W124_4', '20072700013', '2020-07-31', '2020-07-31',
  '6088175677', '태광엠앤에스 주식회사', '화성공장',
  'W124', 'BKT FOR OIL PIPE', 'KTP0706(CAN)',
  'EA', 9, 9, 0,
  0, 0, '강동욱연구원 요청', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072700012_W124_1', '20072700012', '2020-07-29', '2020-07-29',
  '6088175677', '태광엠앤에스 주식회사', '함안공장',
  'W124', 'BKT FOR TAIL LIGHT', 'SS400 2.3T / 12T',
  'EA', 4, 4, 0,
  0, 0, '김상병연구원 요청', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072700010_W124_1', '20072700010', '2020-08-03', '2020-08-03',
  '6092471332', '보성이피에스', '특장 자재창고-화성',
  'W124', 'TOOL_BOX', 'TOOL_BOX',
  'EA', 1, 1, 0,
  0, 0, '김재민연구원 요청', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072700009_W126_1', '20072700009', '2020-07-28', '2020-07-28',
  '6348600146', '주식회사 서륭', '함안공장',
  'W126', '페인트', 'DU PONT RED NO762 (16L)',
  'EA', 3, 3, 0,
  203000, 609000, 'M75-03', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072700009_W126_2', '20072700009', '2020-07-28', '2020-07-28',
  '6348600146', '주식회사 서륭', '함안공장',
  'W126', '페인트', 'UT5570-RAL7035(LIGHT GREY) (4L)',
  'EA', 1, 1, 0,
  37000, 37000, 'M75-03', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072700009_W126_3', '20072700009', '2020-07-28', '2020-07-28',
  '6348600146', '주식회사 서륭', '함안공장',
  'W126', '페인트', 'UT5570-RAL2009 (16L)',
  'EA', 3, 3, 0,
  253000, 759000, 'M75-03', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072700009_W126_4', '20072700009', '2020-07-28', '2020-07-28',
  '6348600146', '주식회사 서륭', '함안공장',
  'W126', '페인트', 'UT5570-RAL7039 (4L)',
  'EA', 3, 3, 0,
  39000, 117000, 'M75-03', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072700009_W126_5', '20072700009', '2020-07-28', '2020-07-28',
  '6348600146', '주식회사 서륭', '함안공장',
  'W126', '페인트', 'UT5570-RAL7035(LIGHT GREY) (16L)',
  'EA', 1, 1, 0,
  135000, 135000, 'M75-03', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072700008_002160171_1', '20072700008', '2020-07-29', '2020-07-29',
  '6088175677', '태광엠앤에스 주식회사', '함안공장',
  '002160171', 'DECK PLATE(SMALL)', '3.2T*1219*741.9',
  'EA', 60, 60, 0,
  33980, 2038800, '절단 하도 본사- 케이엘 요청', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072700008_002160170_2', '20072700008', '2020-07-29', '2020-07-29',
  '6088175677', '태광엠앤에스 주식회사', '함안공장',
  '002160170', 'DECK PLATE(BIG)', '3.2T 1219*760.9',
  'EA', 60, 60, 0,
  35620, 2137200, '절단 하도 본사- 케이엘 요청', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072700005_W123_1', '20072700005', '2020-07-28', '2020-07-28',
  '6158121771', '케이지에스(주)', '특장 자재창고-화성',
  'W123', 'AIR CYLINDER', 'KS1-278-PS2-7',
  'EA', 10, 10, 0,
  20000, 200000, '화성공장 발주건과 함께 화성으로 발송바랍니다.', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072700003_W123_1', '20072700003', '2020-07-30', '2020-07-30',
  '8465300149', '고운테크', '특장 자재창고-화성',
  'W123', '듀라렉스화이트볼', '12CM*6EA',
  'EA', 3, 3, 0,
  14000, 42000, '특장차 점검창용', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072700002_002300200_1', '20072700002', '2020-08-10', '2020-08-10',
  '6158141990', '하이파워유압(주)', '화성공장',
  '002300200', 'O/R VERTICAL CYLINDER', 'M24~30Z5-7TON(Ø63*Ø80*-550ST)',
  'EA', 10, 10, 0,
  330000, 3300000, '긴급요청드립니다.', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072700001_001252700_1', '20072700001', '2020-07-27', '2020-07-27',
  '1252006922', '하이콘테크', '화성부품영업창고',
  '001252700', 'HEAT-TREATED BOOM PIPE (열처리 붐 파이프)', '5"*5T*2755',
  'EA', 2, 2, 0,
  116000, 232000, '', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072400028_MV101500004_1', '20072400028', '2020-08-21', '2020-08-21',
  '2118600472', '(주)에이치에스케이(HSK)', '특장 자재창고-화성',
  'MV101500004', 'CHASSIS BRACKET', 'HIVA FC/FE 129,149 (PN:01506035)',
  'EA', 20, 20, 0,
  168000, 3360000, '덤프 실린더 브라켓', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072400027_W123_1', '20072400027', '2020-07-30', '2020-07-30',
  '1508700096', '(주)에스에이치테크(SH TECH 신화테크)', '화성공장',
  'W123', '(차압계)DIFFERENTIAL PRESSURE METER', '100mm, ANALOG, 0~1000mmH2O, PT1/8"F',
  'EA', 5, 5, 0,
  55000, 275000, '', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072400025_000800541_1', '20072400025', '2020-07-29', '2020-07-29',
  '6088175677', '태광엠앤에스 주식회사', '함안공장',
  '000800541', 'PIPING B.K.T WATER PUMP', '25A(AG50*74MM)',
  'EA', 100, 100, 0,
  1690, 169000, '케이엘 요청', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072400024_W123_1', '20072400024', '2020-08-14', '2020-08-14',
  '4108185262', '(주)케이비에이치', '함안공장',
  'W123', 'SENSING VALVE', '65*95*45',
  'EA', 10, 10, 0,
  0, 0, '김두민연구원 요청', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072400023_100123000_1', '20072400023', '2020-08-12', '2020-08-12',
  '6088607397', '(주)동방이엔지', '함안공장',
  '100123000', 'BELL HOUSING FOR COMPRESSOR', 'Ø160*Ø205*230L(15hp 유압 Compressor + SMS-80)',
  'EA', 6, 6, 0,
  55000, 330000, '김두민연구원 요청', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072400022_000730110_1', '20072400022', '2020-08-12', '2020-08-12',
  '6158141990', '하이파워유압(주)', '함안공장',
  '000730110', 'BLOCK FOR COMPRESSOR', '90T*90*100 (NG10)',
  'EA', 10, 10, 0,
  0, 0, '김두민연구원 요청', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072400021_000251350_1', '20072400021', '2020-08-01', '2020-08-01',
  '1508700096', '(주)에스에이치테크(SH TECH 신화테크)', '함안공장',
  '000251350', 'COUPLING WITH BASE (고정 클램프)', '5″-forging(KCP)',
  'EA', 100, 100, 0,
  19000, 1900000, '티렉스', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072400018_PAY124_1', '20072400018', '2020-07-29', '2020-07-29',
  '6088175677', '태광엠앤에스 주식회사', '함안공장',
  'PAY124', 'M59Z(102호기) 1ST BOOM', '1ST BOOM',
  'EA', 1, 1, 0,
  0, 0, '사급 소재 절단 후 함안 입고', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072400018_PAY124_2', '20072400018', '2020-07-29', '2020-07-29',
  '6088175677', '태광엠앤에스 주식회사', '함안공장',
  'PAY124', 'M59Z(102호기) 4TH BOOM', '4TH BOOM',
  'EA', 1, 1, 0,
  0, 0, '사급 소재 절단 후 함안 입고', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072400018_PAY124_3', '20072400018', '2020-07-29', '2020-07-29',
  '6088175677', '태광엠앤에스 주식회사', '함안공장',
  'PAY124', 'M37Z(63호기) 2ND BOOM', '2ND BOOM',
  'EA', 1, 1, 0,
  0, 0, '사급 소재 절단 후 함안 입고', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072400018_PAY124_4', '20072400018', '2020-07-29', '2020-07-29',
  '6088175677', '태광엠앤에스 주식회사', '함안공장',
  'PAY124', 'M59Z(102호기) 5TH BOOM', '5TH BOOM',
  'EA', 1, 1, 0,
  0, 0, '사급 소재 절단 후 함안 입고', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072400018_PAY124_5', '20072400018', '2020-07-29', '2020-07-29',
  '6088175677', '태광엠앤에스 주식회사', '함안공장',
  'PAY124', 'M59Z(102호기) 2ND BOOM', '2ND BOOM',
  'EA', 1, 1, 0,
  0, 0, '사급 소재 절단 후 함안 입고', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072400018_PAY124_6', '20072400018', '2020-07-29', '2020-07-29',
  '6088175677', '태광엠앤에스 주식회사', '함안공장',
  'PAY124', 'M59Z(102호기) 3RD BOOM', '3RD BOOM',
  'EA', 1, 1, 0,
  0, 0, '사급 소재 절단 후 함안 입고', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072400018_PAY124_7', '20072400018', '2020-07-29', '2020-07-29',
  '6088175677', '태광엠앤에스 주식회사', '함안공장',
  'PAY124', 'M59Z(102호기) LINK SET', 'LINK SET',
  'EA', 1, 1, 0,
  0, 0, '사급 소재 절단 후 함안 입고', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072400017_FH123_1', '20072400017', '2020-07-28', '2020-07-28',
  '1248170586', '알파곰마코리아주식회사', '특장 자재창고-화성',
  'FH123', '내마모석션호스', '5*3CP/1W*4.3M',
  'EA', 3, 3, 0,
  330000, 990000, '', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072400016_MV101500003_1', '20072400016', '2020-08-25', '2020-08-25',
  '00391', '중국／JINAN HUACHENWEIDA TRAD CO.,LTD(실린더)', '특장 자재창고-화성',
  'MV101500003', 'HYD CYLINDER', 'HIVA FE149-3-3880-K1644 (PN:71535227)',
  'EA', 10, 10, 0,
  2800000, 28000000, '', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072400015_SC122310006_1', '20072400015', '2020-07-30', '2020-07-30',
  '6092471332', '보성이피에스', '특장 자재창고-화성',
  'SC122310006', 'BEACON BKT', 'STS201 3T',
  'EA', 10, 10, 0,
  0, 0, '박중현연구원 요청', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072400015_MV111310015_2', '20072400015', '2020-07-30', '2020-07-30',
  '6092471332', '보성이피에스', '특장 자재창고-화성',
  'MV111310015', 'BKT FOR SAFETY PARKING', 'STS304 3T',
  'EA', 10, 10, 0,
  0, 0, '박중현연구원 요청', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072400015_MV101312004_3', '20072400015', '2020-07-30', '2020-07-30',
  '6092471332', '보성이피에스', '특장 자재창고-화성',
  'MV101312004', 'COVER FOR CONTROL VALVE', 'STS304 2T(2B) 452*300*245',
  'EA', 4, 4, 0,
  0, 0, '박중현연구원 요청', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072400015_SC122320001_4', '20072400015', '2020-07-30', '2020-07-30',
  '6092471332', '보성이피에스', '특장 자재창고-화성',
  'SC122320001', 'U-BOLT BKT(80A)', 'SS400 4.5T',
  'EA', 10, 10, 0,
  0, 0, '박중현연구원 요청', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072400015_MV101110003_5', '20072400015', '2020-07-30', '2020-07-30',
  '6092471332', '보성이피에스', '특장 자재창고-화성',
  'MV101110003', 'AIR TANK BRACKET', 'SS400*6T',
  'EA', 10, 10, 0,
  0, 0, '박중현연구원 요청', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072400015_SC144310012_6', '20072400015', '2020-07-30', '2020-07-30',
  '6092471332', '보성이피에스', '특장 자재창고-화성',
  'SC144310012', 'REMOCON RECIVER BKT', 'STS304 3T',
  'EA', 10, 10, 0,
  0, 0, '박중현연구원 요청', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072400014_W124_1', '20072400014', '2020-07-29', '2020-07-29',
  '6088175677', '태광엠앤에스 주식회사', '함안공장',
  'W124', 'BKT FOR M75 2ST BOOM PIPE', 'SS400 8T',
  'EA', 2, 2, 0,
  0, 0, '김상병연구원 요청', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072400014_002160167_2', '20072400014', '2020-07-29', '2020-07-29',
  '6088175677', '태광엠앤에스 주식회사', '함안공장',
  '002160167', 'BKT FOR OIL COOLER(BIG TYPE)', '4.5T*774*410*169',
  'EA', 2, 2, 0,
  31640, 63280, '김상병연구원 요청', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072400013_W124_1', '20072400013', '2020-07-29', '2020-07-29',
  '6088175677', '태광엠앤에스 주식회사', '함안공장',
  'W124', 'PANNEL SUPPORT', '6T',
  'EA', 1, 1, 0,
  0, 0, '김성영연구원 요청', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072400007_000800204_1', '20072400007', '2020-08-01', '2020-08-01',
  '6068647433', '주식회사 엔스틸앤머터리얼즈', '화성공장',
  '000800204', 'SEAMLESS TUBE(ZIC)', 'Ø12X2.0T*6M',
  'EA', 500, 500, 0,
  12350, 6175000, '', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072400006_MV101780003_1', '20072400006', '2020-08-07', '2020-08-07',
  '1508700096', '(주)에스에이치테크(SH TECH 신화테크)', '특장 자재창고-화성',
  'MV101780003', 'CONTROL PANEL ASSY', '480W*600H*280D (24V,KOR)',
  'EA', 5, 5, 0,
  1386000, 6930000, '습건식', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072400004_000121100_1', '20072400004', '2020-09-07', '2020-09-07',
  '1248137613', '(주)신라정밀홀딩스', '함안공장',
  '000121100', 'SLEWING GEAR', '1155(SLBI 106T*I.DØ840)',
  'EA', 4, 4, 0,
  1450000, 5800000, '이병훈부장님 요청', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072300020_PAY124_1', '20072300020', '2020-07-27', '2020-07-27',
  '6088175677', '태광엠앤에스 주식회사', '함안공장',
  'PAY124', 'M52 BASE 수정부재', '20T*370*390',
  'EA', 24, 24, 0,
  0, 0, '개선 작업 요청합니다.', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072300020_PAY124_2', '20072300020', '2020-07-27', '2020-07-27',
  '6088175677', '태광엠앤에스 주식회사', '함안공장',
  'PAY124', 'M52Z 4TH BOOM 측면 보강 부재', '12T*1125*40',
  'EA', 9, 9, 0,
  0, 0, '개선 작업 요청합니다.', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072300015_000252090_1', '20072300015', '2020-08-01', '2020-08-01',
  '1508700096', '(주)에스에이치테크(SH TECH 신화테크)', '함안공장',
  '000252090', 'TWIN ELBOW', '5″X90˚ KCP',
  'EA', 50, 50, 0,
  75000, 3750000, '08월 매출로 요청드립니다', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072300013_020380150_1', '20072300013', '2020-07-27', '2020-07-27',
  '1058125362', '(주)림스코', '화성공장',
  '020380150', 'RETURN FILTER HOUSING ASSY', 'KTP60(MPFX4003AG3P25NBP01)',
  'EA', 9, 9, 0,
  100000, 900000, 'KTP0706(2축) 9대', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072300009_W123_1', '20072300009', '2020-07-24', '2020-07-24',
  '1248724594', '(주)성환공구', '화성공장',
  'W123', '락카', '사비 (30EA)',
  'EA', 2, 2, 0,
  53000, 106000, '씨원,가람', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072300008_000300121_1', '20072300008', '2020-08-23', '2020-08-23',
  '6211086293', '미래테크', '함안공장',
  '000300121', 'MAIN HYDRAULIC CYLINDER', 'Ø120XØ70X2100',
  'EA', 10, 10, 0,
  1298000, 12980000, '생산용(납품 전 담당자와 통화 후 납품요망)', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072300008_000300100_2', '20072300008', '2020-08-23', '2020-08-23',
  '6211086293', '미래테크', '함안공장',
  '000300100', 'MAIN HYDRAULIC CYLINDER', 'Ø130X2100',
  'EA', 10, 8, 2,
  1366000, 13660000, '생산용(납품 전 담당자와 통화 후 납품요망)', 'PARTIAL'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072300008_000300130_3', '20072300008', '2020-08-23', '2020-08-23',
  '6211086293', '미래테크', '함안공장',
  '000300130', 'MAIN HYDRAULIC CYLINDER', 'Ø140X2100',
  'EA', 10, 9, 1,
  1436000, 14360000, '생산용(납품 전 담당자와 통화 후 납품요망)', 'PARTIAL'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072300002_000521610_1', '20072300002', '2020-07-24', '2020-07-24',
  '1408123163', '(주)대원하이텍', '화성공장',
  '000521610', 'RID FOR TRANSITION DOOR', '5INCH',
  'EA', 2, 2, 0,
  23000, 46000, '7인치 청소창 엘보 마개용', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072300001_000191550_1', '20072300001', '2020-07-29', '2020-07-29',
  '6088175677', '태광엠앤에스 주식회사', '함안공장',
  '000191550', 'SUCTION PIPE', 'A20VLO190(12T)H406.4',
  'EA', 5, 5, 0,
  140000, 700000, '신명욱부장님 긴급요청드립니다.', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072200043_500140200_1', '20072200043', '2020-08-14', '2020-08-14',
  '6088607397', '(주)동방이엔지', '함안공장',
  '500140200', 'FRONT OUTRIGGER', '(L)-(OUT BOX)NM52~55',
  'EA', 6, 6, 0,
  750000, 4500000, '08월 생산계획', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072200043_500100000_2', '20072200043', '2020-08-14', '2020-08-14',
  '6088607397', '(주)동방이엔지', '함안공장',
  '500100000', 'TURNING BASE', 'M50(M48-II), NEW52',
  'EA', 6, 6, 0,
  8800000, 52800000, '08월 생산계획', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072200043_520142300_3', '20072200043', '2020-08-14', '2020-08-14',
  '6088607397', '(주)동방이엔지', '함안공장',
  '520142300', 'REAR OUTRIGGER', '(R)-O/R(15/03/31)-6500',
  'EA', 6, 6, 0,
  1746500, 10479000, '08월 생산계획', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072200043_500140250_4', '20072200043', '2020-08-14', '2020-08-14',
  '6088607397', '(주)동방이엔지', '함안공장',
  '500140250', 'FRONT OUTRIGGER', '(L)-(INNER BOX)NM52~55',
  'EA', 6, 6, 0,
  675000, 4050000, '08월 생산계획', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072200043_410140300_5', '20072200043', '2020-08-14', '2020-08-14',
  '6088607397', '(주)동방이엔지', '함안공장',
  '410140300', 'REAR OUTRIGGER', '(R)-5800L',
  'EA', 6, 6, 0,
  1347500, 8085000, '08월 생산계획', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072200043_410100000_6', '20072200043', '2020-08-14', '2020-08-14',
  '6088607397', '(주)동방이엔지', '함안공장',
  '410100000', 'TURNING BASE', 'M41(5)',
  'EA', 6, 6, 0,
  6800000, 40800000, '08월 생산계획', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072200043_500140150_7', '20072200043', '2020-08-14', '2020-08-14',
  '6088607397', '(주)동방이엔지', '함안공장',
  '500140150', 'FRONT OUTRIGGER', '(R)-(INNER BOX)NM52~55',
  'EA', 6, 6, 0,
  675000, 4050000, '08월 생산계획', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072200043_500140100_8', '20072200043', '2020-08-14', '2020-08-14',
  '6088607397', '(주)동방이엔지', '함안공장',
  '500140100', 'FRONT OUTRIGGER', '(R)-(OUT BOX)NM52~55',
  'EA', 6, 6, 0,
  750000, 4500000, '08월 생산계획', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072200043_410140100_9', '20072200043', '2020-08-14', '2020-08-14',
  '6088607397', '(주)동방이엔지', '함안공장',
  '410140100', 'FRONT OUTRIGGER', 'M41-(R)',
  'EA', 6, 6, 0,
  650000, 3900000, '08월 생산계획', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072200043_410140400_10', '20072200043', '2020-08-14', '2020-08-14',
  '6088607397', '(주)동방이엔지', '함안공장',
  '410140400', 'REAR OUTRIGGER', '(L)-5800L',
  'EA', 6, 6, 0,
  1347500, 8085000, '08월 생산계획', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072200043_520142400_11', '20072200043', '2020-08-14', '2020-08-14',
  '6088607397', '(주)동방이엔지', '함안공장',
  '520142400', 'REAR OUTRIGGER', '(L)-O/R(15/03/31)-6500',
  'EA', 6, 6, 0,
  1746500, 10479000, '08월 생산계획', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072200043_410140200_12', '20072200043', '2020-08-14', '2020-08-14',
  '6088607397', '(주)동방이엔지', '함안공장',
  '410140200', 'FRONT OUTRIGGER', 'M41-(L)',
  'EA', 6, 6, 0,
  650000, 3900000, '08월 생산계획', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072200042_PAY124_1', '20072200042', '2020-08-14', '2020-08-14',
  '6088175677', '태광엠앤에스 주식회사', '함안공장',
  'PAY124', 'BOOM BODY(LINK, TURNTABLE, 후판 포함)절단', 'M41Z(031~033)',
  'EA', 3, 3, 0,
  0, 0, '08월 생산계획', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072200042_PAY124_2', '20072200042', '2020-08-14', '2020-08-14',
  '6088175677', '태광엠앤에스 주식회사', '함안공장',
  'PAY124', 'BOOM BODY(LINK, TURNTABLE, 후판 포함)절단', 'M52Z(313~328)',
  'EA', 6, 6, 0,
  0, 0, '08월 생산계획', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072200042_PAY124_3', '20072200042', '2020-08-14', '2020-08-14',
  '6088175677', '태광엠앤에스 주식회사', '함안공장',
  'PAY124', 'BOOM BODY(LINK, TURNTABLE, 후판 포함)절단', 'M41Z(034~036)',
  'EA', 3, 3, 0,
  0, 0, '08월 생산계획', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072200029_410182100_1', '20072200029', '2020-08-14', '2020-08-14',
  '6092471332', '보성이피에스', '화성공장',
  '410182100', 'COVER FOR SIDE', 'M41(R)',
  'EA', 3, 3, 0,
  166700, 500100, '34~36', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072200029_410182200_2', '20072200029', '2020-08-14', '2020-08-14',
  '6092471332', '보성이피에스', '화성공장',
  '410182200', 'COVER FOR SIDE', 'M41(L)',
  'EA', 3, 3, 0,
  166700, 500100, '34~36', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072200029_410160130_3', '20072200029', '2020-08-14', '2020-08-14',
  '6092471332', '보성이피에스', '화성공장',
  '410160130', 'DECK T/B-L', 'M41Z 2.5T 2457*492(AL)',
  'EA', 3, 3, 0,
  73130, 219390, '34~36', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072200029_410160120_4', '20072200029', '2020-08-14', '2020-08-14',
  '6092471332', '보성이피에스', '화성공장',
  '410160120', 'DECK T/B-R', 'M41Z 2.5T 2457*492(AL)',
  'EA', 3, 3, 0,
  73130, 219390, '34~36', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072200027_410130100_1', '20072200027', '2020-08-14', '2020-08-14',
  '6088175677', '태광엠앤에스 주식회사', '화성공장',
  '410130100', 'BOOM SUPPORT', 'M41Z(FRONT)',
  'EA', 3, 3, 0,
  210000, 630000, '제작발주입니다.', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072200027_410130200_2', '20072200027', '2020-08-14', '2020-08-14',
  '6088175677', '태광엠앤에스 주식회사', '화성공장',
  '410130200', 'BOOM SUPPORT', 'M41Z(REAR)',
  'EA', 3, 3, 0,
  191000, 573000, '제작발주입니다.', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072200027_001180850_3', '20072200027', '2020-08-14', '2020-08-14',
  '6088175677', '태광엠앤에스 주식회사', '화성공장',
  '001180850', 'INSERT COVER', 'M20,32,36R,38,40R,Z5,42Z5(H：287.1)',
  'EA', 6, 6, 0,
  22060, 132360, '제작발주입니다.', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072200026_410130200_1', '20072200026', '2020-08-14', '2020-08-14',
  '6088175677', '태광엠앤에스 주식회사', '함안공장',
  '410130200', 'BOOM SUPPORT', 'M41Z(REAR)',
  'EA', 3, 3, 0,
  191000, 573000, '제작발주입니다.', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072200026_501140971_2', '20072200026', '2020-08-14', '2020-08-14',
  '6088175677', '태광엠앤에스 주식회사', '함안공장',
  '501140971', 'GUIDE FOR HOSE-1', 'M52,M55',
  'EA', 12, 12, 0,
  20030, 240360, '제작발주입니다.', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072200026_522130100_3', '20072200026', '2020-08-14', '2020-08-14',
  '6088175677', '태광엠앤에스 주식회사', '함안공장',
  '522130100', 'BOOM SUPPORT(REST)', '52Z6_FRONT',
  'EA', 6, 6, 0,
  186000, 1116000, '제작발주입니다.', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072200026_000802121_4', '20072200026', '2020-08-14', '2020-08-14',
  '6088175677', '태광엠앤에스 주식회사', '함안공장',
  '000802121', 'OUTREGGER STOPPER ASSY', '(R) 364L-45~55',
  'EA', 6, 6, 0,
  15220, 91320, '제작발주입니다.', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072200026_000802122_5', '20072200026', '2020-08-14', '2020-08-14',
  '6088175677', '태광엠앤에스 주식회사', '함안공장',
  '000802122', 'OUTREGGER STOPPER ASSY', '(L) 364L-45~55',
  'EA', 6, 6, 0,
  15220, 91320, '제작발주입니다.', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072200026_501140972_6', '20072200026', '2020-08-14', '2020-08-14',
  '6088175677', '태광엠앤에스 주식회사', '함안공장',
  '501140972', 'GUIDE FOR HOSE-2', 'M52,M55',
  'EA', 12, 12, 0,
  22060, 264720, '제작발주입니다.', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072200026_001180210_7', '20072200026', '2020-08-14', '2020-08-14',
  '6088175677', '태광엠앤에스 주식회사', '함안공장',
  '001180210', 'COVER FOR SLEWING GEAR', 'M45, M48, M50, M52 공용',
  'EA', 6, 6, 0,
  111000, 666000, '제작발주입니다.', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072200026_410130100_8', '20072200026', '2020-08-14', '2020-08-14',
  '6088175677', '태광엠앤에스 주식회사', '함안공장',
  '410130100', 'BOOM SUPPORT', 'M41Z(FRONT)',
  'EA', 3, 3, 0,
  210000, 630000, '제작발주입니다.', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072200026_522130200_9', '20072200026', '2020-08-14', '2020-08-14',
  '6088175677', '태광엠앤에스 주식회사', '함안공장',
  '522130200', 'BOOM SUPPORT(REST)', '52Z6_REAR',
  'EA', 6, 6, 0,
  350000, 2100000, '제작발주입니다.', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072200026_001180850_10', '20072200026', '2020-08-14', '2020-08-14',
  '6088175677', '태광엠앤에스 주식회사', '함안공장',
  '001180850', 'INSERT COVER', 'M20,32,36R,38,40R,Z5,42Z5(H：287.1)',
  'EA', 6, 6, 0,
  22060, 132360, '제작발주입니다.', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072200026_000172456_11', '20072200026', '2020-08-14', '2020-08-14',
  '6088175677', '태광엠앤에스 주식회사', '함안공장',
  '000172456', 'STEP(R.L포함)', 'STEEL(2STEP)408*190(M52RZ 일자크로스 프레임적용)',
  'EA', 6, 6, 0,
  326000, 1956000, '제작발주입니다.', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072200026_501140950_12', '20072200026', '2020-08-14', '2020-08-14',
  '6088175677', '태광엠앤에스 주식회사', '함안공장',
  '501140950', 'BKT FOR GUIDE HOSE', '',
  'EA', 12, 12, 0,
  13370, 160440, '제작발주입니다.', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072200026_001180855_13', '20072200026', '2020-08-14', '2020-08-14',
  '6088175677', '태광엠앤에스 주식회사', '함안공장',
  '001180855', 'INSERT COVER', 'M45,M48,M50,M52(H332)',
  'EA', 12, 12, 0,
  24080, 288960, '제작발주입니다.', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072200025_501140960_1', '20072200025', '2020-08-14', '2020-08-14',
  '1508700096', '(주)에스에이치테크(SH TECH 신화테크)', '함안공장',
  '501140960', 'WIRE FOR FRONT O／R', 'Ø8(M12-3320L*4EA, M12-5500L*4EA)',
  'EA', 12, 12, 0,
  274800, 3297600, 'M52Z6-323~328', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072200024_000121100_1', '20072200024', '2020-09-01', '2020-09-01',
  '1248137613', '(주)신라정밀홀딩스', '화성공장',
  '000121100', 'SLEWING GEAR', '1155(SLBI 106T*I.DØ840)',
  'EA', 3, 3, 0,
  1450000, 4350000, 'M41Z-34~36', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072200023_000121100_1', '20072200023', '2020-09-01', '2020-09-01',
  '1248137613', '(주)신라정밀홀딩스', '함안공장',
  '000121100', 'SLEWING GEAR', '1155(SLBI 106T*I.DØ840)',
  'EA', 3, 3, 0,
  1450000, 4350000, 'M41Z-31~33', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072200023_460126100_2', '20072200023', '2020-09-01', '2020-09-01',
  '1248137613', '(주)신라정밀홀딩스', '함안공장',
  '460126100', 'SLEWING GEAR', 'M52 SCM-1476(Ø1476*Ø1085*135T)',
  'EA', 6, 6, 0,
  3500000, 21000000, 'M41Z-31~33', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072200021_590140964_1', '20072200021', '2020-07-29', '2020-07-29',
  '6158141990', '하이파워유압(주)', '함안공장',
  '590140964', 'HOLDER FOR GUIDE BLOCK-1', 'M59-30T*35*127',
  'EA', 20, 20, 0,
  25000, 500000, '', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072200021_000322100_2', '20072200021', '2020-07-29', '2020-07-29',
  '6158141990', '하이파워유압(주)', '함안공장',
  '000322100', 'O/R MOTOR RELIEF VLAVE BLOCK', 'M59 (40T*80*76)',
  'EA', 20, 20, 0,
  35000, 700000, '', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072200021_590140965_3', '20072200021', '2020-07-29', '2020-07-29',
  '6158141990', '하이파워유압(주)', '함안공장',
  '590140965', 'HOLDER FOR GUIDE BLOCK-2', '35T*60*60',
  'EA', 20, 20, 0,
  25000, 500000, '', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072200020_W124_1', '20072200020', '2020-07-31', '2020-07-31',
  '6088175677', '태광엠앤에스 주식회사', '화성공장',
  'W124', '알루미늄 변경품', 'KTP1905',
  'EA', 2, 2, 0,
  0, 0, '강동욱연구원 요청', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072200015_410210100_1', '20072200015', '2020-08-25', '2020-08-25',
  '1210943105', '제이에스비(JSB)', '화성공장',
  '410210100', 'BOOM BUSH SET', 'M41Z 5S',
  'EA', 3, 3, 0,
  66060, 198180, '8월 발주건부터 신규 프로그램으로 전표생성바랍니다.', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072200014_410210100_1', '20072200014', '2020-08-25', '2020-08-25',
  '1210943105', '제이에스비(JSB)', '함안공장',
  '410210100', 'BOOM BUSH SET', 'M41Z 5S',
  'EA', 3, 3, 0,
  66060, 198180, '8월 발주건부터 신규 프로그램으로 전표생성바랍니다.', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072200014_521210100_2', '20072200014', '2020-08-25', '2020-08-25',
  '1210943105', '제이에스비(JSB)', '함안공장',
  '521210100', 'BOOM BUSH SET', 'M52Z6S(NEW)',
  'EA', 6, 6, 0,
  121190, 727140, '8월 발주건부터 신규 프로그램으로 전표생성바랍니다.', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072200013_W133_1', '20072200013', '2020-07-29', '2020-07-29',
  '5040146183', '일출산업사', '함안공장',
  'W133', 'BOOM BOSS SET', 'M41Z5(일부사내가공)',
  'EA', 6, 6, 0,
  374000, 2244000, '착지- 2공장', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072200013_W133_2', '20072200013', '2020-07-29', '2020-07-29',
  '5040146183', '일출산업사', '함안공장',
  'W133', 'BOOM BOSS SET', 'M52Z6(일부 사내가공)',
  'EA', 6, 6, 0,
  0, 0, '착지- 2공장', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072200008_410240000_1', '20072200008', '2020-08-25', '2020-08-25',
  '6211086293', '미래테크', '화성공장',
  '410240000', 'BOOM CYLINDER SET', 'M41Z 5S',
  'EA', 3, 3, 0,
  6634000, 19902000, '34~36', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072200007_410240000_1', '20072200007', '2020-08-25', '2020-08-25',
  '6211086293', '미래테크', '함안공장',
  '410240000', 'BOOM CYLINDER SET', 'M41Z 5S',
  'EA', 3, 3, 0,
  6634000, 19902000, '31~33', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072200007_521240000_2', '20072200007', '2020-08-25', '2020-08-25',
  '6211086293', '미래테크', '함안공장',
  '521240000', 'BOOM CYLINDER SET', 'M52Z6',
  'EA', 6, 6, 0,
  13138000, 78828000, '31~33', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072200004_000251320_1', '20072200004', '2020-08-01', '2020-08-01',
  '1508700096', '(주)에스에이치테크(SH TECH 신화테크)', '함안공장',
  '000251320', 'BOLT TYPE COUPLING (볼트 클램프)', '5″-forging(KCP)',
  'EA', 230, 230, 0,
  17000, 3910000, '08월 매출로 요청드립니다', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072200003_FH123_1', '20072200003', '2020-07-24', '2020-07-24',
  '6158603327', '(주)제이케이엠', '함안공장',
  'FH123', 'FLUID HOSE', '주유기호스1"X2500L',
  'EA', 5, 5, 0,
  66000, 330000, '', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072100023_W124_1', '20072100023', '2020-07-31', '2020-07-31',
  '6092471332', '보성이피에스', '특장 자재창고-화성',
  'W124', 'MV101110003 AIR TANK BRACKET 부재 #02 , #03', '',
  'EA', 50, 50, 0,
  0, 0, '박현우연구원 요청', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072100023_MV101720010_2', '20072100023', '2020-07-31', '2020-07-31',
  '6092471332', '보성이피에스', '특장 자재창고-화성',
  'MV101720010', 'ADJUSTNG STOPPER', '12T*60*35',
  'EA', 50, 50, 0,
  1700, 85000, '박현우연구원 요청', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072100023_MV101720009_3', '20072100023', '2020-07-31', '2020-07-31',
  '6092471332', '보성이피에스', '특장 자재창고-화성',
  'MV101720009', 'STOPPER', '10T*50*50',
  'EA', 50, 50, 0,
  670, 33500, '박현우연구원 요청', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072100006_W126_1', '20072100006', '2020-07-23', '2020-07-23',
  '6348600146', '주식회사 서륭', '함안공장',
  'W126', '페인트(4L)', '스피롤탄S형 메탈릭(910)-METAL.GREY(4L)',
  'EA', 1, 1, 0,
  0, 0, '캐나다 이중파이프 도색', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072100006_W126_2', '20072100006', '2020-07-23', '2020-07-23',
  '6348600146', '주식회사 서륭', '함안공장',
  'W126', '페인트(4L)', '아크릴우레탄KCP-VIPER.RED (4L)',
  'EA', 2, 2, 0,
  0, 0, '캐나다 이중파이프 도색', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072100001_000251320_1', '20072100001', '2020-08-01', '2020-08-01',
  '1508700096', '(주)에스에이치테크(SH TECH 신화테크)', '함안공장',
  '000251320', 'BOLT TYPE COUPLING (볼트 클램프)', '5″-forging(KCP)',
  'EA', 230, 230, 0,
  17000, 3910000, '08월 매출로 요청드립니다', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072100001_451140960_2', '20072100001', '2020-08-01', '2020-08-01',
  '1508700096', '(주)에스에이치테크(SH TECH 신화테크)', '함안공장',
  '451140960', 'WIRE FOR FRONT O／R', 'Ø8(M12：3160L:4EA, 5000L:4EA)',
  'EA', 6, 6, 0,
  223660, 1341960, '08월 매출로 요청드립니다', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072000025_590230000_1', '20072000025', '2020-08-20', '2020-08-20',
  '6088119694', '남우공업(주)', '함안공장',
  '590230000', 'BOOM PIN SET', 'M59Z',
  'EA', 1, 1, 0,
  3600000, 3600000, '도면확인 후 제작(도면 첨부)', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072000024_590240000_1', '20072000024', '2020-08-20', '2020-08-20',
  '6211086293', '미래테크', '화성공장',
  '590240000', 'BOOM CYLINDER SET - 5단', 'M59Z 5S(14／01)',
  'EA', 1, 1, 0,
  14582000, 14582000, 'KCP63-102호기 중고차 붐 파손건(방글라데시-김혁)', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072000021_FF123_1', '20072000021', '2020-07-21', '2020-07-21',
  '00176', '캐나다／MIK TECH LTD.', '함안공장',
  'FF123', 'FLUID FITTING', 'GE12LR1/2KEGCF',
  'EA', 30, 30, 0,
  0, 0, 'p1092', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072000021_000701300_2', '20072000021', '2020-07-21', '2020-07-21',
  '00176', '캐나다／MIK TECH LTD.', '함안공장',
  '000701300', 'ACCUMULATOR', 'SB330-4A1/112A',
  'EA', 4, 4, 0,
  370000, 1480000, 'p1092', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072000021_FF123_3', '20072000021', '2020-07-21', '2020-07-21',
  '00176', '캐나다／MIK TECH LTD.', '함안공장',
  'FF123', 'FLUID FITTING', 'VSTI 3/8EDCF',
  'EA', 30, 30, 0,
  0, 0, 'p1092', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072000021_FF123_4', '20072000021', '2020-07-21', '2020-07-21',
  '00176', '캐나다／MIK TECH LTD.', '함안공장',
  'FF123', 'FLUID FITTING', 'G12LCF',
  'EA', 100, 100, 0,
  0, 0, 'p1092', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072000021_FF123_5', '20072000021', '2020-07-21', '2020-07-21',
  '00176', '캐나다／MIK TECH LTD.', '함안공장',
  'FF123', 'FLUID FITTING', 'G08LCF',
  'EA', 50, 50, 0,
  0, 0, 'p1092', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072000021_FF123_6', '20072000021', '2020-07-21', '2020-07-21',
  '00176', '캐나다／MIK TECH LTD.', '함안공장',
  'FF123', 'FLUID FITTING', 'VSTI 3/4EDCF',
  'EA', 30, 30, 0,
  0, 0, 'p1092', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072000021_FF123_7', '20072000021', '2020-07-21', '2020-07-21',
  '00176', '캐나다／MIK TECH LTD.', '함안공장',
  'FF123', 'FLUID FITTING', 'VSTI 1 1/4EDCF',
  'EA', 5, 5, 0,
  0, 0, 'p1092', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072000021_FF123_8', '20072000021', '2020-07-21', '2020-07-21',
  '00176', '캐나다／MIK TECH LTD.', '함안공장',
  'FF123', 'FLUID FITTING', 'W15LCFX',
  'EA', 50, 50, 0,
  0, 0, 'p1092', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072000021_FF123_9', '20072000021', '2020-07-21', '2020-07-21',
  '00176', '캐나다／MIK TECH LTD.', '함안공장',
  'FF123', 'FLUID FITTING', 'GE12L 3/4UNF)',
  'EA', 20, 20, 0,
  0, 0, 'p1092', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072000021_FF123_10', '20072000021', '2020-07-21', '2020-07-21',
  '00176', '캐나다／MIK TECH LTD.', '함안공장',
  'FF123', 'FLUID FITTING', 'EGE08LR1/4ED',
  'EA', 50, 50, 0,
  0, 0, 'p1092', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072000021_FF123_11', '20072000021', '2020-07-21', '2020-07-21',
  '00176', '캐나다／MIK TECH LTD.', '함안공장',
  'FF123', 'FLUID FITTING', 'VSTI 1 1/2EDCF',
  'EA', 5, 5, 0,
  0, 0, 'p1092', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072000021_000990520_12', '20072000021', '2020-07-21', '2020-07-21',
  '00176', '캐나다／MIK TECH LTD.', '함안공장',
  '000990520', 'WATER RELIEF VALVE(신주)', '25A*10K',
  'EA', 10, 10, 0,
  18000, 180000, 'p1092', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072000021_FF123_13', '20072000021', '2020-07-21', '2020-07-21',
  '00176', '캐나다／MIK TECH LTD.', '함안공장',
  'FF123', 'FLUID FITTING', 'T08LCF',
  'EA', 100, 100, 0,
  0, 0, 'p1092', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072000021_000351350_14', '20072000021', '2020-07-21', '2020-07-21',
  '00176', '캐나다／MIK TECH LTD.', '함안공장',
  '000351350', 'FLANGE FOR P.T.O CASE (GREASE SEAL)', 'KCP (FD11PTO12)',
  'EA', 4, 4, 0,
  0, 0, 'p1092', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072000021_W123_15', '20072000021', '2020-07-21', '2020-07-21',
  '00176', '캐나다／MIK TECH LTD.', '함안공장',
  'W123', 'LID FOR AIR GREASE PUMP(사진참조)', 'CHP-88B(45：1)',
  'EA', 10, 10, 0,
  15000, 150000, 'p1092', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072000020_000193560_1', '20072000020', '2020-07-24', '2020-07-24',
  '6088175677', '태광엠앤에스 주식회사', '화성공장',
  '000193560', 'SUCTION PIPE', 'M34Z5-A20VLO190(12T)',
  'EA', 6, 6, 0,
  155000, 930000, '씨원 요청', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072000016_590210100_1', '20072000016', '2020-08-17', '2020-08-17',
  '1210943105', '제이에스비(JSB)', '화성공장',
  '590210100', 'BOOM BUSH SET', 'M59(14／01)',
  'EA', 1, 1, 0,
  136360, 136360, '59-102호기(방글라데시)', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072000012_300240400_1', '20072000012', '2020-08-20', '2020-08-20',
  '00391', '중국／JINAN HUACHENWEIDA TRAD CO.,LTD(실린더)', '화성공장',
  '300240400', '4th BOOM CYLINDER', 'Ø120*Ø65*ST920',
  'EA', 1, 1, 0,
  651000, 651000, 'M30-231(체코) a/s사용 보충분-정우혁차장 요청', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072000012_300240200_2', '20072000012', '2020-08-20', '2020-08-20',
  '00391', '중국／JINAN HUACHENWEIDA TRAD CO.,LTD(실린더)', '화성공장',
  '300240200', '2nd BOOM CYLINDER', 'Ø170*Ø100*ST1205',
  'EA', 1, 1, 0,
  1371000, 1371000, 'M30-231(체코) a/s사용 보충분-정우혁차장 요청', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072000007_000730070_1', '20072000007', '2020-07-22', '2020-07-22',
  '1438114528', '주식회사에이치원', '화성공장',
  '000730070', 'LOGIC COVER(17/06)', 'ONE BLOCK-55T*151*99',
  'EA', 9, 5, 4,
  71000, 639000, 'KTP0706(2축) 9대', 'PARTIAL'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20072000006_020730310_1', '20072000006', '2020-07-24', '2020-07-24',
  '6158141990', '하이파워유압(주)', '화성공장',
  '020730310', 'HEAD COVER BLOCK', 'KTP60(50*90*311) CAN',
  'EA', 10, 10, 0,
  65000, 650000, '긴급요청드립니다.', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20071700030_000730921_1', '20071700030', '2020-07-23', '2020-07-23',
  '6158141990', '하이파워유압(주)', '함안공장',
  '000730921', 'LOGIC COVER(2)-BDSV', 'ONE BLOCK＃32- 55T*107*170(2012/06)',
  'EA', 5, 3, 2,
  120000, 600000, '티렉스 요청', 'PARTIAL'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20071700009_MV101020025_1', '20071700009', '2020-07-30', '2020-07-30',
  '6092471332', '보성이피에스', '특장 자재창고-화성',
  'MV101020025', 'HANDRAIL FOR TANK BODY', 'SS400 3.2T, SQ PIPE 40*40*2.3T',
  'EA', 2, 2, 0,
  49720, 99440, '박현우연구원 요청', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20071700009_MV113310003_2', '20071700009', '2020-07-30', '2020-07-30',
  '6092471332', '보성이피에스', '특장 자재창고-화성',
  'MV113310003', 'BELT COVER ASSY', 'SS400 2.3T',
  'EA', 1, 1, 0,
  84810, 84810, '박현우연구원 요청', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20071700009_MV101163300_3', '20071700009', '2020-07-30', '2020-07-30',
  '6092471332', '보성이피에스', '특장 자재창고-화성',
  'MV101163300', 'ADAPTER FOR FILTER BOX', 'STS PIPE 300A, 90 ELBOW 300A, TEE 300Ax300A',
  'EA', 2, 2, 0,
  874350, 1748700, '박현우연구원 요청', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20071600004_370240000_1', '20071600004', '2020-08-16', '2020-08-16',
  '00391', '중국／JINAN HUACHENWEIDA TRAD CO.,LTD(실린더)', '함안공장',
  '370240000', 'BOOM CYLINDER SET', 'M37Z5',
  'EA', 3, 3, 0,
  5749000, 17247000, '', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20071600004_400240000_2', '20071600004', '2020-08-16', '2020-08-16',
  '00391', '중국／JINAN HUACHENWEIDA TRAD CO.,LTD(실린더)', '함안공장',
  '400240000', 'BOOM CYLINDER SET', 'M40R',
  'EA', 6, 6, 0,
  6737000, 40422000, '', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20071500024_SC144310018_1', '20071500024', '2020-07-21', '2020-07-21',
  '6092471332', '보성이피에스', '특장 자재창고-화성',
  'SC144310018', 'UNLOADING VALVE', 'SS400 6T, 3.2T',
  'EA', 1, 1, 0,
  0, 0, '김재민연구원 요청', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20071500023_370242300_1', '20071500023', '2020-08-15', '2020-08-15',
  '00391', '중국／JINAN HUACHENWEIDA TRAD CO.,LTD(실린더)', '함안공장',
  '370242300', '3rd BOOM CYLINDER-M37Z', 'Ø170*Ø100*1165ST',
  'EA', 1, 1, 0,
  1316000, 1316000, '베트남 a/s', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20071500022_000121100_1', '20071500022', '2020-08-25', '2020-08-25',
  '1248137613', '(주)신라정밀홀딩스', '화성공장',
  '000121100', 'SLEWING GEAR', '1155(SLBI 106T*I.DØ840)',
  'EA', 3, 3, 0,
  1450000, 4350000, '재고', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20071500019_000730510_1', '20071500019', '2020-08-05', '2020-08-05',
  '4108185262', '(주)케이비에이치', '함안공장',
  '000730510', 'COUNTER BALANCE VALVE(2)', '40T*60*90',
  'EA', 50, 50, 0,
  0, 0, '김두민연구원 요청', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20071500013_000371400_1', '20071500013', '2020-08-31', '2020-08-31',
  '00176', '캐나다／MIK TECH LTD.', '함안공장',
  '000371400', 'CONTROL VALVE FOR BOOM', '6SECTION-12V-PSL(M30R~M33R)',
  'EA', 6, 6, 0,
  0, 0, 'A2(L25/25,J25/40,J25/40,J16/25,J10/16,O25/25)', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20071500013_001372240_2', '20071500013', '2020-08-31', '2020-08-31',
  '00176', '캐나다／MIK TECH LTD.', '함안공장',
  '001372240', 'CONTROL VALVE FOR BOOM(VARIABLE TYPE)', '7SECTION-12V-PSVF(M48~M70)',
  'EA', 4, 4, 0,
  0, 0, 'A2(L25/25,J25/40,J25/40,J16/25,J10/16,O25/25)', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20071500013_000371420_3', '20071500013', '2020-08-31', '2020-08-31',
  '00176', '캐나다／MIK TECH LTD.', '함안공장',
  '000371420', 'CONTROL VALVE FOR BOOM', '6SECTION-12V-PSL(M18~M28)',
  'EA', 4, 4, 0,
  0, 0, 'A2(L25/25,J25/40,J25/40,J16/25,J10/16,O25/25)', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20071500002_000511050_1', '20071500002', '2020-07-16', '2020-07-16',
  '1358168945', '대창기계산업(주)', '화성부품영업창고',
  '000511050', 'SEAL HOUSING ASSY', 'SplineØ80 (With seal kit&thrust ring)',
  'EA', 25, 18, 7,
  110000, 2750000, '빠른 입고 요청드립니다', 'PARTIAL'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20071400032_000770430_1', '20071400032', '2020-07-30', '2020-07-30',
  '6098601455', '건영기계(주)', '화성공장',
  '000770430', 'DOOR LOCK-R', 'R041-D01-0(4-Ø6.5)',
  'EA', 100, 100, 0,
  12500, 1250000, '', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20071400030_OR123_1', '20071400030', '2020-08-31', '2020-08-31',
  '00176', '캐나다／MIK TECH LTD.', '함안공장',
  'OR123', 'SEAL KIT SEATED VALVE', '(PSL 3H1 ZM/D 380-2)EM21 DSE',
  'EA', 50, 50, 0,
  0, 0, 'PSL 시티드 밸브 씰키트', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20071400030_000370450_2', '20071400030', '2020-08-31', '2020-08-31',
  '00176', '캐나다／MIK TECH LTD.', '함안공장',
  '000370450', '2/2WAY(SEATED V/V)', '(PSL 3H1 ZM/D 380-2) EM21 DSE-G24',
  'EA', 10, 10, 0,
  0, 0, 'PSL 시티드 밸브 씰키트', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20071400030_000373201_3', '20071400030', '2020-08-31', '2020-08-31',
  '00176', '캐나다／MIK TECH LTD.', '함안공장',
  '000373201', 'COIL FOR BOOM CONTROL', 'PSLF-DC12',
  'EA', 60, 60, 0,
  0, 0, 'PSL 시티드 밸브 씰키트', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20071400016_000351200_1', '20071400016', '2020-07-24', '2020-07-24',
  '1358168945', '대창기계산업(주)', '화성부품영업창고',
  '000351200', 'REDUCTION GEAR BOX', 'M40(30T)',
  'EA', 1, 1, 0,
  2730000, 2730000, '', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20071400010_000252090_1', '20071400010', '2020-07-15', '2020-07-15',
  '1508700096', '(주)에스에이치테크(SH TECH 신화테크)', '함안공장',
  '000252090', 'TWIN ELBOW', '5″X90˚ KCP',
  'EA', 300, 50, 250,
  75000, 22500000, '신화테크 재고 사용분', 'PARTIAL'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20071300023_W123_1', '20071300023', '2020-07-15', '2020-07-15',
  '6211086293', '미래테크', '함안공장',
  'W123', 'SEAL KIT FOR ROD COVER', 'M40Z5-1ST',
  'EA', 2, 1, 1,
  0, 0, '베트남 무상건(김영철부장)중국+국내 타입으로 납품요망', 'PARTIAL'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20071300018_MV101720003_1', '20071300018', '2020-07-16', '2020-07-16',
  '1358168945', '대창기계산업(주)', '특장 자재창고-화성',
  'MV101720003', 'SHAFT FOR PULLEY', 'S45C Ø60*65*565L',
  'EA', 5, 5, 0,
  107000, 535000, '가람 요청', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20071300018_MV101720004_2', '20071300018', '2020-07-16', '2020-07-16',
  '1358168945', '대창기계산업(주)', '특장 자재창고-화성',
  'MV101720004', 'FLANGE FOR SHAFT', 'S45C*Ø150*67L(8-M12)',
  'EA', 5, 5, 0,
  66071, 330355, '가람 요청', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20071300015_000512700_1', '20071300015', '2020-07-15', '2020-07-15',
  '1358168945', '대창기계산업(주)', '화성부품영업창고',
  '000512700', 'AGITATOR SHAFT', 'KCP-Ø65*130L(OPEN)',
  'EA', 30, 30, 0,
  35000, 1050000, '', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20070900028_000300538_1', '20070900028', '2020-08-09', '2020-08-09',
  '00391', '중국／JINAN HUACHENWEIDA TRAD CO.,LTD(실린더)', '함안공장',
  '000300538', 'SWING CYLINDER FOR ROD EYE', 'M55',
  'EA', 10, 10, 0,
  0, 0, '', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20070900027_000502101_1', '20070900027', '2020-07-09', '2020-07-09',
  '6088607397', '(주)동방이엔지', '함안공장',
  '000502101', 'SCREEN FOR HOPPER(스크린)', 'SMALL(M30)',
  'EA', 1, 1, 0,
  120000, 120000, '', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;
INSERT INTO public.tb_purchase_orders (
  po_item_id, po_no, po_date, delivery_date, supplier_code, supplier_name,
  warehouse_name, item_code, item_name, item_spec, unit, po_qty, received_qty,
  remain_qty, unit_price, total_amount, remarks, status
) VALUES (
  'PO_20080400002_900060050_1', '20080400002', '2020-08-04', '2020-08-04',
  '1210943105', '제이에스비(JSB)', '화성부품영업창고',
  '900060050', 'DU-BUSH', '60*50',
  'EA', 20, 20, 0,
  1100, 22000, '당일 발송 요청드립니다', 'COMPLETED'
) ON CONFLICT (po_item_id) DO UPDATE SET
  received_qty = EXCLUDED.received_qty,
  remain_qty = EXCLUDED.remain_qty,
  status = EXCLUDED.status;

-- 2. 입고완료 내역 시드 (100건 중 45건을 COMPLETED 및 PARTIAL 상태로 갱신하여 [입고내역] 화면에 표시)
UPDATE public.tb_inbound_items SET
  received_qty = 0,
  item_status = 'CHECKED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20080300002-1';
UPDATE public.tb_inbound_slips SET
  status = 'PARTIAL',
  manager = '이병훈',
  inbound_date = '2026-09-02T09:30:00.000Z',
  total_received_qty = 0,
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE slip_no = '20080300002';
UPDATE public.tb_inbound_items SET
  received_qty = 3,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20080300001-1';
UPDATE public.tb_inbound_slips SET
  status = 'COMPLETED',
  manager = '김해성',
  inbound_date = '2026-09-02T09:30:00.000Z',
  total_received_qty = 3,
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE slip_no = '20080300001';
UPDATE public.tb_inbound_items SET
  received_qty = 4,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20073000003-1';
UPDATE public.tb_inbound_slips SET
  status = 'COMPLETED',
  manager = '안성규',
  inbound_date = '2026-09-02T09:30:00.000Z',
  total_received_qty = 4,
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE slip_no = '20073000003';
UPDATE public.tb_inbound_items SET
  received_qty = 10,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072900005-1';
UPDATE public.tb_inbound_items SET
  received_qty = 10,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072900005-2';
UPDATE public.tb_inbound_items SET
  received_qty = 6,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072900005-3';
UPDATE public.tb_inbound_items SET
  received_qty = 4,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072900005-4';
UPDATE public.tb_inbound_items SET
  received_qty = 4,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072900005-5';
UPDATE public.tb_inbound_items SET
  received_qty = 4,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072900005-6';
UPDATE public.tb_inbound_slips SET
  status = 'COMPLETED',
  manager = '이병훈',
  inbound_date = '2026-09-02T09:30:00.000Z',
  total_received_qty = 38,
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE slip_no = '20072900005';
UPDATE public.tb_inbound_items SET
  received_qty = 10,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072900003-1';
UPDATE public.tb_inbound_items SET
  received_qty = 10,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072900003-2';
UPDATE public.tb_inbound_slips SET
  status = 'COMPLETED',
  manager = '박중현',
  inbound_date = '2026-09-02T09:30:00.000Z',
  total_received_qty = 20,
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE slip_no = '20072900003';
UPDATE public.tb_inbound_items SET
  received_qty = 5,
  item_status = 'CHECKED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072900002-1';
UPDATE public.tb_inbound_items SET
  received_qty = 5,
  item_status = 'CHECKED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072900002-2';
UPDATE public.tb_inbound_slips SET
  status = 'PARTIAL',
  manager = '박중현',
  inbound_date = '2026-09-02T09:30:00.000Z',
  total_received_qty = 10,
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE slip_no = '20072900002';
UPDATE public.tb_inbound_items SET
  received_qty = 8,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072800018-1';
UPDATE public.tb_inbound_slips SET
  status = 'COMPLETED',
  manager = '김보라',
  inbound_date = '2026-09-02T09:30:00.000Z',
  total_received_qty = 8,
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE slip_no = '20072800018';
UPDATE public.tb_inbound_items SET
  received_qty = 14,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072800017-1';
UPDATE public.tb_inbound_slips SET
  status = 'COMPLETED',
  manager = '김보라',
  inbound_date = '2026-09-02T09:30:00.000Z',
  total_received_qty = 14,
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE slip_no = '20072800017';
UPDATE public.tb_inbound_items SET
  received_qty = 6,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072800010-1';
UPDATE public.tb_inbound_slips SET
  status = 'COMPLETED',
  manager = '김보라',
  inbound_date = '2026-09-02T09:30:00.000Z',
  total_received_qty = 6,
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE slip_no = '20072800010';
UPDATE public.tb_inbound_items SET
  received_qty = 6,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072800009-1';
UPDATE public.tb_inbound_slips SET
  status = 'COMPLETED',
  manager = '김보라',
  inbound_date = '2026-09-02T09:30:00.000Z',
  total_received_qty = 6,
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE slip_no = '20072800009';
UPDATE public.tb_inbound_items SET
  received_qty = 50,
  item_status = 'CHECKED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072800008-1';
UPDATE public.tb_inbound_slips SET
  status = 'PARTIAL',
  manager = '김보라',
  inbound_date = '2026-09-02T09:30:00.000Z',
  total_received_qty = 50,
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE slip_no = '20072800008';
UPDATE public.tb_inbound_items SET
  received_qty = 50,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072800007-1';
UPDATE public.tb_inbound_slips SET
  status = 'COMPLETED',
  manager = '김보라',
  inbound_date = '2026-09-02T09:30:00.000Z',
  total_received_qty = 50,
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE slip_no = '20072800007';
UPDATE public.tb_inbound_items SET
  received_qty = 6,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072800005-1';
UPDATE public.tb_inbound_slips SET
  status = 'COMPLETED',
  manager = '김보라',
  inbound_date = '2026-09-02T09:30:00.000Z',
  total_received_qty = 6,
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE slip_no = '20072800005';
UPDATE public.tb_inbound_items SET
  received_qty = 1,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072800004-1';
UPDATE public.tb_inbound_items SET
  received_qty = 1,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072800004-2';
UPDATE public.tb_inbound_items SET
  received_qty = 1,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072800004-3';
UPDATE public.tb_inbound_items SET
  received_qty = 1,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072800004-4';
UPDATE public.tb_inbound_slips SET
  status = 'COMPLETED',
  manager = '김보라',
  inbound_date = '2026-09-02T09:30:00.000Z',
  total_received_qty = 4,
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE slip_no = '20072800004';
UPDATE public.tb_inbound_items SET
  received_qty = 1,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072800003-1';
UPDATE public.tb_inbound_items SET
  received_qty = 1,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072800003-2';
UPDATE public.tb_inbound_items SET
  received_qty = 1,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072800003-3';
UPDATE public.tb_inbound_items SET
  received_qty = 1,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072800003-4';
UPDATE public.tb_inbound_items SET
  received_qty = 1,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072800003-5';
UPDATE public.tb_inbound_slips SET
  status = 'COMPLETED',
  manager = '김보라',
  inbound_date = '2026-09-02T09:30:00.000Z',
  total_received_qty = 5,
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE slip_no = '20072800003';
UPDATE public.tb_inbound_items SET
  received_qty = 3,
  item_status = 'CHECKED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072800002-1';
UPDATE public.tb_inbound_items SET
  received_qty = 3,
  item_status = 'CHECKED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072800002-2';
UPDATE public.tb_inbound_items SET
  received_qty = 3,
  item_status = 'CHECKED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072800002-3';
UPDATE public.tb_inbound_items SET
  received_qty = 3,
  item_status = 'CHECKED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072800002-4';
UPDATE public.tb_inbound_slips SET
  status = 'PARTIAL',
  manager = '김보라',
  inbound_date = '2026-09-02T09:30:00.000Z',
  total_received_qty = 12,
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE slip_no = '20072800002';
UPDATE public.tb_inbound_items SET
  received_qty = 1,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072700023-1';
UPDATE public.tb_inbound_items SET
  received_qty = 1,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072700023-2';
UPDATE public.tb_inbound_slips SET
  status = 'COMPLETED',
  manager = '이병훈',
  inbound_date = '2026-09-02T09:30:00.000Z',
  total_received_qty = 2,
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE slip_no = '20072700023';
UPDATE public.tb_inbound_items SET
  received_qty = 1200,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072700021-1';
UPDATE public.tb_inbound_slips SET
  status = 'COMPLETED',
  manager = '김보라',
  inbound_date = '2026-09-02T09:30:00.000Z',
  total_received_qty = 1200,
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE slip_no = '20072700021';
UPDATE public.tb_inbound_items SET
  received_qty = 5,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072700020-1';
UPDATE public.tb_inbound_slips SET
  status = 'COMPLETED',
  manager = '김보라',
  inbound_date = '2026-09-02T09:30:00.000Z',
  total_received_qty = 5,
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE slip_no = '20072700020';
UPDATE public.tb_inbound_items SET
  received_qty = 6,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072700019-1';
UPDATE public.tb_inbound_slips SET
  status = 'COMPLETED',
  manager = '김보라',
  inbound_date = '2026-09-02T09:30:00.000Z',
  total_received_qty = 6,
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE slip_no = '20072700019';
UPDATE public.tb_inbound_items SET
  received_qty = 5,
  item_status = 'CHECKED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072700018-1';
UPDATE public.tb_inbound_items SET
  received_qty = 15,
  item_status = 'CHECKED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072700018-2';
UPDATE public.tb_inbound_items SET
  received_qty = 100,
  item_status = 'CHECKED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072700018-3';
UPDATE public.tb_inbound_slips SET
  status = 'PARTIAL',
  manager = '김보라',
  inbound_date = '2026-09-02T09:30:00.000Z',
  total_received_qty = 120,
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE slip_no = '20072700018';
UPDATE public.tb_inbound_items SET
  received_qty = 9,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072700013-1';
UPDATE public.tb_inbound_items SET
  received_qty = 18,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072700013-2';
UPDATE public.tb_inbound_items SET
  received_qty = 7,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072700013-3';
UPDATE public.tb_inbound_items SET
  received_qty = 9,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072700013-4';
UPDATE public.tb_inbound_slips SET
  status = 'COMPLETED',
  manager = '김보라',
  inbound_date = '2026-09-02T09:30:00.000Z',
  total_received_qty = 43,
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE slip_no = '20072700013';
UPDATE public.tb_inbound_items SET
  received_qty = 4,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072700012-1';
UPDATE public.tb_inbound_slips SET
  status = 'COMPLETED',
  manager = '김보라',
  inbound_date = '2026-09-02T09:30:00.000Z',
  total_received_qty = 4,
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE slip_no = '20072700012';
UPDATE public.tb_inbound_items SET
  received_qty = 1,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072700010-1';
UPDATE public.tb_inbound_slips SET
  status = 'COMPLETED',
  manager = '김보라',
  inbound_date = '2026-09-02T09:30:00.000Z',
  total_received_qty = 1,
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE slip_no = '20072700010';
UPDATE public.tb_inbound_items SET
  received_qty = 3,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072700009-1';
UPDATE public.tb_inbound_items SET
  received_qty = 1,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072700009-2';
UPDATE public.tb_inbound_items SET
  received_qty = 3,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072700009-3';
UPDATE public.tb_inbound_items SET
  received_qty = 3,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072700009-4';
UPDATE public.tb_inbound_items SET
  received_qty = 1,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072700009-5';
UPDATE public.tb_inbound_slips SET
  status = 'COMPLETED',
  manager = '김보라',
  inbound_date = '2026-09-02T09:30:00.000Z',
  total_received_qty = 11,
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE slip_no = '20072700009';
UPDATE public.tb_inbound_items SET
  received_qty = 30,
  item_status = 'CHECKED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072700008-1';
UPDATE public.tb_inbound_items SET
  received_qty = 30,
  item_status = 'CHECKED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072700008-2';
UPDATE public.tb_inbound_slips SET
  status = 'PARTIAL',
  manager = '김보라',
  inbound_date = '2026-09-02T09:30:00.000Z',
  total_received_qty = 60,
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE slip_no = '20072700008';
UPDATE public.tb_inbound_items SET
  received_qty = 10,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072700005-1';
UPDATE public.tb_inbound_slips SET
  status = 'COMPLETED',
  manager = '김보라',
  inbound_date = '2026-09-02T09:30:00.000Z',
  total_received_qty = 10,
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE slip_no = '20072700005';
UPDATE public.tb_inbound_items SET
  received_qty = 3,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072700003-1';
UPDATE public.tb_inbound_slips SET
  status = 'COMPLETED',
  manager = '김보라',
  inbound_date = '2026-09-02T09:30:00.000Z',
  total_received_qty = 3,
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE slip_no = '20072700003';
UPDATE public.tb_inbound_items SET
  received_qty = 10,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072700002-1';
UPDATE public.tb_inbound_slips SET
  status = 'COMPLETED',
  manager = '김보라',
  inbound_date = '2026-09-02T09:30:00.000Z',
  total_received_qty = 10,
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE slip_no = '20072700002';
UPDATE public.tb_inbound_items SET
  received_qty = 2,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072700001-1';
UPDATE public.tb_inbound_slips SET
  status = 'COMPLETED',
  manager = '김형준',
  inbound_date = '2026-09-02T09:30:00.000Z',
  total_received_qty = 2,
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE slip_no = '20072700001';
UPDATE public.tb_inbound_items SET
  received_qty = 10,
  item_status = 'CHECKED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072400028-1';
UPDATE public.tb_inbound_slips SET
  status = 'PARTIAL',
  manager = '김보라',
  inbound_date = '2026-09-02T09:30:00.000Z',
  total_received_qty = 10,
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE slip_no = '20072400028';
UPDATE public.tb_inbound_items SET
  received_qty = 5,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072400027-1';
UPDATE public.tb_inbound_slips SET
  status = 'COMPLETED',
  manager = '김보라',
  inbound_date = '2026-09-02T09:30:00.000Z',
  total_received_qty = 5,
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE slip_no = '20072400027';
UPDATE public.tb_inbound_items SET
  received_qty = 100,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072400025-1';
UPDATE public.tb_inbound_slips SET
  status = 'COMPLETED',
  manager = '김보라',
  inbound_date = '2026-09-02T09:30:00.000Z',
  total_received_qty = 100,
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE slip_no = '20072400025';
UPDATE public.tb_inbound_items SET
  received_qty = 10,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072400024-1';
UPDATE public.tb_inbound_slips SET
  status = 'COMPLETED',
  manager = '김보라',
  inbound_date = '2026-09-02T09:30:00.000Z',
  total_received_qty = 10,
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE slip_no = '20072400024';
UPDATE public.tb_inbound_items SET
  received_qty = 6,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072400023-1';
UPDATE public.tb_inbound_slips SET
  status = 'COMPLETED',
  manager = '김보라',
  inbound_date = '2026-09-02T09:30:00.000Z',
  total_received_qty = 6,
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE slip_no = '20072400023';
UPDATE public.tb_inbound_items SET
  received_qty = 5,
  item_status = 'CHECKED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072400022-1';
UPDATE public.tb_inbound_slips SET
  status = 'PARTIAL',
  manager = '김보라',
  inbound_date = '2026-09-02T09:30:00.000Z',
  total_received_qty = 5,
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE slip_no = '20072400022';
UPDATE public.tb_inbound_items SET
  received_qty = 100,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072400021-1';
UPDATE public.tb_inbound_slips SET
  status = 'COMPLETED',
  manager = '김보라',
  inbound_date = '2026-09-02T09:30:00.000Z',
  total_received_qty = 100,
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE slip_no = '20072400021';
UPDATE public.tb_inbound_items SET
  received_qty = 1,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072400018-1';
UPDATE public.tb_inbound_items SET
  received_qty = 1,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072400018-2';
UPDATE public.tb_inbound_items SET
  received_qty = 1,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072400018-3';
UPDATE public.tb_inbound_items SET
  received_qty = 1,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072400018-4';
UPDATE public.tb_inbound_items SET
  received_qty = 1,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072400018-5';
UPDATE public.tb_inbound_items SET
  received_qty = 1,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072400018-6';
UPDATE public.tb_inbound_items SET
  received_qty = 1,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072400018-7';
UPDATE public.tb_inbound_slips SET
  status = 'COMPLETED',
  manager = '박중현',
  inbound_date = '2026-09-02T09:30:00.000Z',
  total_received_qty = 7,
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE slip_no = '20072400018';
UPDATE public.tb_inbound_items SET
  received_qty = 3,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072400017-1';
UPDATE public.tb_inbound_slips SET
  status = 'COMPLETED',
  manager = '김보라',
  inbound_date = '2026-09-02T09:30:00.000Z',
  total_received_qty = 3,
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE slip_no = '20072400017';
UPDATE public.tb_inbound_items SET
  received_qty = 10,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072400016-1';
UPDATE public.tb_inbound_slips SET
  status = 'COMPLETED',
  manager = '김보라',
  inbound_date = '2026-09-02T09:30:00.000Z',
  total_received_qty = 10,
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE slip_no = '20072400016';
UPDATE public.tb_inbound_items SET
  received_qty = 5,
  item_status = 'CHECKED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072400015-1';
UPDATE public.tb_inbound_items SET
  received_qty = 5,
  item_status = 'CHECKED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072400015-2';
UPDATE public.tb_inbound_items SET
  received_qty = 2,
  item_status = 'CHECKED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072400015-3';
UPDATE public.tb_inbound_items SET
  received_qty = 5,
  item_status = 'CHECKED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072400015-4';
UPDATE public.tb_inbound_items SET
  received_qty = 5,
  item_status = 'CHECKED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072400015-5';
UPDATE public.tb_inbound_items SET
  received_qty = 5,
  item_status = 'CHECKED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072400015-6';
UPDATE public.tb_inbound_slips SET
  status = 'PARTIAL',
  manager = '김보라',
  inbound_date = '2026-09-02T09:30:00.000Z',
  total_received_qty = 27,
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE slip_no = '20072400015';
UPDATE public.tb_inbound_items SET
  received_qty = 2,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072400014-1';
UPDATE public.tb_inbound_items SET
  received_qty = 2,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072400014-2';
UPDATE public.tb_inbound_slips SET
  status = 'COMPLETED',
  manager = '김보라',
  inbound_date = '2026-09-02T09:30:00.000Z',
  total_received_qty = 4,
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE slip_no = '20072400014';
UPDATE public.tb_inbound_items SET
  received_qty = 1,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072400013-1';
UPDATE public.tb_inbound_slips SET
  status = 'COMPLETED',
  manager = '김보라',
  inbound_date = '2026-09-02T09:30:00.000Z',
  total_received_qty = 1,
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE slip_no = '20072400013';
UPDATE public.tb_inbound_items SET
  received_qty = 500,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072400007-1';
UPDATE public.tb_inbound_slips SET
  status = 'COMPLETED',
  manager = '김보라',
  inbound_date = '2026-09-02T09:30:00.000Z',
  total_received_qty = 500,
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE slip_no = '20072400007';
UPDATE public.tb_inbound_items SET
  received_qty = 5,
  item_status = 'COMPLETED',
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE row_id = 'erp-item-20072400006-1';
UPDATE public.tb_inbound_slips SET
  status = 'COMPLETED',
  manager = '김보라',
  inbound_date = '2026-09-02T09:30:00.000Z',
  total_received_qty = 5,
  updated_at = '2026-09-02T09:30:00.000Z'
WHERE slip_no = '20072400006';

COMMIT;
