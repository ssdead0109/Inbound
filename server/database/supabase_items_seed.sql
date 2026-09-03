-- ==========================================================
-- SmartRack / ERP Materials Master Initial Seed Data (tb_items)
-- 142건의 실제 ERP 자재 마스터 품목 데이터 (코드, 품명, 규격, 단가, 창고)
-- 실행방법: Supabase 대시보드 -> SQL Editor에 붙여넣고 [Run] 실행
-- ==========================================================

BEGIN;

INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-000573000', '000573000', 'S-VALVE', '200*180(COMMON USE)',
  '밸브', '화성부품영업창고', 'A-01-01', 1,
  'EA', 5, 600000, '신우', '경동 화성 양감 송산 110(010-2332-9396)'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-403240000', '403240000', 'BOOM CYLINDER SET', 'M40Z 5S',
  '실린더', '함안공장', 'A-01-01', 3,
  'EA', 5, 7662000, '중국／JINAN HUACHENWEIDA TRAD CO.,LTD(실린더)', '생산,A/S 재고 확보'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-W123', 'W123', '베어링 후렌지 아세이', 'Ø60 유팩킹타입',
  '일반부품', '화성부품영업창고', 'A-01-01', 4,
  'EA', 5, 45000, '(주)대원하이텍', '고객직송 | 경동:일산동구문봉58 거성중기 010-9931-6345'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-900270045', '900270045', 'DU-BUSH', '270*45',
  '일반부품', '함안공장', 'A-01-01', 10,
  'EA', 5, 5000, '제이에스비(JSB)', '뉴질랜드 판매외'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-900280050', '900280050', 'DU-BUSH', '280*50',
  '일반부품', '함안공장', 'A-01-01', 10,
  'EA', 5, 5800, '제이에스비(JSB)', '뉴질랜드 판매외'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-900100095', '900100095', 'DU-BUSH', '100*95',
  '일반부품', '함안공장', 'A-01-01', 6,
  'EA', 5, 3600, '제이에스비(JSB)', '뉴질랜드 판매외'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-900090060', '900090060', 'DU-BUSH', '90*60',
  '일반부품', '함안공장', 'A-01-01', 4,
  'EA', 5, 2060, '제이에스비(JSB)', '뉴질랜드 판매외'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-900070040', '900070040', 'DU-BUSH', '70*40',
  '일반부품', '함안공장', 'A-01-01', 4,
  'EA', 5, 1050, '제이에스비(JSB)', '뉴질랜드 판매외'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-900060030', '900060030', 'DU-BUSH', '60*30',
  '일반부품', '함안공장', 'A-01-01', 4,
  'EA', 5, 710, '제이에스비(JSB)', '뉴질랜드 판매외'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-PAY124', 'PAY124', '4M MAST 구조물 각인 명판', '8T*50*25',
  '일반부품', '화성공장', 'A-01-01', 10,
  'EA', 5, 2500, '샤인테크', '사급소재, 4M MAST(화성-10EA) | 08월 생산계획 추가 | 착지 정보 : 경상남도 함안군 함안면 광정로 354 KCP중공업 2공장(조연실), 경기도 화성시 양감면 송산110영업소(박용건)'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-000550010', '000550010', 'DELIVERY CYLINDER (230*2100)', 'M36(2320L)',
  '실린더', '화성공장', 'A-01-01', 8,
  'EA', 5, 970000, '주식회사 창녕', ''
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-001361170', '001361170', 'BOOM OIL PUMP', 'SAP-017L-N-DL4-L35-S0S-000',
  '일반부품', '화성공장', 'A-01-01', 6,
  'EA', 5, 477000, '하베코리아주식회사', ''
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-MV101311010', 'MV101311010', 'PIPE FOR ELECTRIC WIRE', 'ROUND TUBE STS304 50A(60.5)x1.5Tx6,000L',
  '일반부품', '특장 자재창고-화성', 'A-01-01', 6,
  'EA', 5, 0, '보성이피에스', 'KMV 공용 | 이규훈연구원 요청'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-000331200', '000331200', 'OUTRIGGER CHECK VALVE (O/R 체크밸브)', 'O/R',
  '밸브', '함안공장', 'A-01-01', 100,
  'EA', 5, 50000, '하이파워유압(주)', ''
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-W125', 'W125', '평철', '12*25*6M',
  '일반부품', '함안공장', 'A-01-01', 50,
  'EA', 5, 11328, '(유)화진철강', '착지- 한일공업'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-522230000', '522230000', 'BOOM PIN SET', 'M52Z6S',
  '일반부품', '함안공장', 'A-01-01', 6,
  'EA', 5, 0, '일출산업사', '323~328'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-000186150', '000186150', 'COVER FOR SIDE', 'M32-M40(R)-AL',
  '일반부품', '화성공장', 'A-01-01', 1,
  'EA', 5, 190000, '보성이피에스', 'M40R-550 씨원'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-000186100', '000186100', 'COVER FOR SIDE', 'M32-M40(L)-AL',
  '일반부품', '화성공장', 'A-01-01', 1,
  'EA', 5, 190000, '보성이피에스', 'M40R-550 씨원'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-002162120', '002162120', 'DECK T/B-R', 'M32,36,38,40-AL(2.5T 2467*492)',
  '일반부품', '화성공장', 'A-01-01', 1,
  'EA', 5, 73000, '보성이피에스', 'M40R-550 씨원'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-002162130', '002162130', 'DECK T/B-L', 'M32,36,38,40-AL(2.5T 2467*492)',
  '일반부품', '화성공장', 'A-01-01', 1,
  'EA', 5, 73000, '보성이피에스', 'M40R-550 씨원'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-001251400', '001251400', 'HEAT-TREATED BOOM PIPE (열처리 붐 파이프)', '5"*5T*1455',
  '일반부품', '함안공장', 'A-01-01', 1,
  'EA', 5, 69000, '하이콘테크', 'M32RZ-50 하도 (티렉스)'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-001251500', '001251500', 'HEAT-TREATED BOOM PIPE (열처리 붐 파이프)', '5"*5T*1573',
  '일반부품', '함안공장', 'A-01-01', 1,
  'EA', 5, 72000, '하이콘테크', 'M32RZ-50 하도 (티렉스)'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-001251100', '001251100', 'HEAT-TREATED BOOM PIPE (열처리 붐 파이프)', '5"*5T*1149',
  '일반부품', '함안공장', 'A-01-01', 1,
  'EA', 5, 60000, '하이콘테크', 'M32RZ-50 하도 (티렉스)'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-001251300', '001251300', 'HEAT-TREATED BOOM PIPE (열처리 붐 파이프)', '5"*5T*1392',
  '일반부품', '함안공장', 'A-01-01', 1,
  'EA', 5, 66000, '하이콘테크', 'M32RZ-50 하도 (티렉스)'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-001250300', '001250300', 'HEAT-TREATED BOOM PIPE (열처리 붐 파이프)', '5"*5T*370',
  '일반부품', '화성공장', 'A-01-01', 7,
  'EA', 5, 32000, '하이콘테크', 'M40Z 7대 하도 (씨원)'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-001252200', '001252200', 'HEAT-TREATED BOOM PIPE (열처리 붐 파이프)', '5"*5T*2260',
  '일반부품', '화성공장', 'A-01-01', 7,
  'EA', 5, 97000, '하이콘테크', 'M40Z 7대 하도 (씨원)'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-PAY125', 'PAY125', '운송료', '화물',
  '일반부품', '함안공장', 'A-01-01', 1,
  'EA', 5, 10000, '하이콘테크', '출고택배로 보내주세요'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-001250900', '001250900', 'HEAT-TREATED BOOM PIPE (열처리 붐 파이프)', '5"*5T*960',
  '일반부품', '함안공장', 'A-01-01', 1,
  'EA', 5, 56000, '하이콘테크', '출고택배로 보내주세요'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-000270121', '000270121', 'OIL PIPE CLAMP(SEAMLESS)', 'Ø12(RAIL TYPE)',
  '일반부품', '함안공장', 'A-01-01', 1200,
  'EA', 5, 620, '(주)제이인더스트리코리아', '200개/1박스- 티렉스'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-W124', 'W124', 'SHAFT FOR PULLEY(MV101720003) KEY', '',
  '일반부품', '특장 자재창고-화성', 'A-01-01', 5,
  'EA', 5, 0, '보성이피에스', 'KEY만 요청- KMV15,KMV13 | 박현우연구원 요청'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-000800647', '000800647', 'B.K.T FOR TAIL LIGHT(R.L)', '3.2T*165*483*W177(XCIENT)M55,M59',
  '일반부품', '화성공장', 'A-01-01', 6,
  'EA', 5, 64210, '태광엠앤에스 주식회사', '제작 쇼트하도- 현대 17T 씨원 요청'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-000720120', '000720120', 'PRESSURE GAUGE', '63-A-400BAR(PT)VIKA',
  '일반부품', '화성공장', 'A-01-01', 10,
  'EA', 5, 11000, '유성산업', 'KCP로고 없는 제품이라도 입고바랍니다 | 신규시스템으로 8월 전표처리바랍니다.'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-000720125', '000720125', 'PRESSURE GAUGE', '63-D-100BAR(b-type)PF1/4(VIKA)',
  '일반부품', '화성공장', 'A-01-01', 30,
  'EA', 5, 12000, '유성산업', 'KCP로고 없는 제품이라도 입고바랍니다 | 신규시스템으로 8월 전표처리바랍니다.'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-000720111', '000720111', 'PRESSURE GAUGE', '63-D-400BAR(b-type)PF1/4(VIKA)',
  '일반부품', '화성공장', 'A-01-01', 200,
  'EA', 5, 13000, '유성산업', 'KCP로고 없는 제품이라도 입고바랍니다 | 신규시스템으로 8월 전표처리바랍니다.'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-W126', 'W126', '페인트', 'DU PONT RED NO762 (16L)',
  '일반부품', '함안공장', 'A-01-01', 3,
  'EA', 5, 203000, '주식회사 서륭', 'M75-03'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-002160171', '002160171', 'DECK PLATE(SMALL)', '3.2T*1219*741.9',
  '일반부품', '함안공장', 'A-01-01', 60,
  'EA', 5, 33980, '태광엠앤에스 주식회사', '절단 하도 본사- 케이엘 요청'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-002160170', '002160170', 'DECK PLATE(BIG)', '3.2T 1219*760.9',
  '일반부품', '함안공장', 'A-01-01', 60,
  'EA', 5, 35620, '태광엠앤에스 주식회사', '절단 하도 본사- 케이엘 요청'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-002300200', '002300200', 'O/R VERTICAL CYLINDER', 'M24~30Z5-7TON(Ø63*Ø80*-550ST)',
  '실린더', '화성공장', 'A-01-01', 10,
  'EA', 5, 330000, '하이파워유압(주)', 'M24 | 긴급요청드립니다.'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-001252700', '001252700', 'HEAT-TREATED BOOM PIPE (열처리 붐 파이프)', '5"*5T*2755',
  '일반부품', '화성부품영업창고', 'A-01-01', 2,
  'EA', 5, 116000, '하이콘테크', ''
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-MV101500004', 'MV101500004', 'CHASSIS BRACKET', 'HIVA FC/FE 129,149 (PN:01506035)',
  '일반부품', '특장 자재창고-화성', 'A-01-01', 20,
  'EA', 5, 168000, '(주)에이치에스케이(HSK)', '덤프 실린더 브라켓'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-000800541', '000800541', 'PIPING B.K.T WATER PUMP', '25A(AG50*74MM)',
  '일반부품', '함안공장', 'A-01-01', 100,
  'EA', 5, 1690, '태광엠앤에스 주식회사', '케이엘 요청'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-100123000', '100123000', 'BELL HOUSING FOR COMPRESSOR', 'Ø160*Ø205*230L(15hp 유압 Compressor + SMS-80)',
  '일반부품', '함안공장', 'A-01-01', 6,
  'EA', 5, 55000, '(주)동방이엔지', '재고 확보용 | 김두민연구원 요청'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-000730110', '000730110', 'BLOCK FOR COMPRESSOR', '90T*90*100 (NG10)',
  '일반부품', '함안공장', 'A-01-01', 10,
  'EA', 5, 0, '하이파워유압(주)', '일본 송부용 및 재고 확보용 | 김두민연구원 요청'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-000251350', '000251350', 'COUPLING WITH BASE (고정 클램프)', '5″-forging(KCP)',
  '일반부품', '함안공장', 'A-01-01', 100,
  'EA', 5, 19000, '(주)에스에이치테크(SH TECH 신화테크)', '티렉스'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-FH123', 'FH123', '내마모석션호스', '5*3CP/1W*4.3M',
  '일반부품', '특장 자재창고-화성', 'A-01-01', 3,
  'EA', 5, 330000, '알파곰마코리아주식회사', ''
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-MV101500003', 'MV101500003', 'HYD CYLINDER', 'HIVA FE149-3-3880-K1644 (PN:71535227)',
  '실린더', '특장 자재창고-화성', 'A-01-01', 10,
  'EA', 5, 2800000, '중국／JINAN HUACHENWEIDA TRAD CO.,LTD(실린더)', ''
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-SC122310006', 'SC122310006', 'BEACON BKT', 'STS201 3T',
  '일반부품', '특장 자재창고-화성', 'A-01-01', 10,
  'EA', 5, 0, '보성이피에스', '절단, 밴딩 후 화성 입고(잔재로 절단 요청)- 체크 방향 바깥쪽 (재고품) | 박중현연구원 요청'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-MV111310015', 'MV111310015', 'BKT FOR SAFETY PARKING', 'STS304 3T',
  '일반부품', '특장 자재창고-화성', 'A-01-01', 10,
  'EA', 5, 0, '보성이피에스', '절단, 밴딩 후 화성 입고(잔재로 절단 요청)- 체크 방향 바깥쪽 (재고품) | 박중현연구원 요청'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-MV101312004', 'MV101312004', 'COVER FOR CONTROL VALVE', 'STS304 2T(2B) 452*300*245',
  '밸브', '특장 자재창고-화성', 'A-01-01', 4,
  'EA', 5, 0, '보성이피에스', '절단, 밴딩 후 화성 입고(잔재로 절단 요청)- 체크 방향 바깥쪽 (재고품) | 박중현연구원 요청'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-SC122320001', 'SC122320001', 'U-BOLT BKT(80A)', 'SS400 4.5T',
  '일반부품', '특장 자재창고-화성', 'A-01-01', 10,
  'EA', 5, 0, '보성이피에스', '절단, 밴딩 후 화성 입고(잔재로 절단 요청)- 체크 방향 바깥쪽 (재고품) | 박중현연구원 요청'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-MV101110003', 'MV101110003', 'AIR TANK BRACKET', 'SS400*6T',
  '일반부품', '특장 자재창고-화성', 'A-01-01', 10,
  'EA', 5, 0, '보성이피에스', '절단, 밴딩 후 화성 입고(잔재로 절단 요청)- 체크 방향 바깥쪽 (재고품) | 박중현연구원 요청'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-SC144310012', 'SC144310012', 'REMOCON RECIVER BKT', 'STS304 3T',
  '일반부품', '특장 자재창고-화성', 'A-01-01', 10,
  'EA', 5, 0, '보성이피에스', '절단, 밴딩 후 화성 입고(잔재로 절단 요청)- 체크 방향 바깥쪽 (재고품) | 박중현연구원 요청'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-002160167', '002160167', 'BKT FOR OIL COOLER(BIG TYPE)', '4.5T*774*410*169',
  '일반부품', '함안공장', 'A-01-01', 2,
  'EA', 5, 31640, '태광엠앤에스 주식회사', '절단, 벤딩, 하도, 함안공장 입고- M75 2단 붐 파이프 브라켓 | 김상병연구원 요청'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-000800204', '000800204', 'SEAMLESS TUBE(ZIC)', 'Ø12X2.0T*6M',
  '일반부품', '화성공장', 'A-01-01', 500,
  'EA', 5, 12350, '주식회사 엔스틸앤머터리얼즈', ''
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-MV101780003', 'MV101780003', 'CONTROL PANEL ASSY', '480W*600H*280D (24V,KOR)',
  '일반부품', '특장 자재창고-화성', 'A-01-01', 5,
  'EA', 5, 1386000, '(주)에스에이치테크(SH TECH 신화테크)', '습건식'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-000121100', '000121100', 'SLEWING GEAR', '1155(SLBI 106T*I.DØ840)',
  '일반부품', '함안공장', 'A-01-01', 4,
  'EA', 5, 1450000, '(주)신라정밀홀딩스', 'P1151 | 이병훈부장님 요청'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-000252090', '000252090', 'TWIN ELBOW', '5″X90˚ KCP',
  '일반부품', '함안공장', 'A-01-01', 50,
  'EA', 5, 75000, '(주)에스에이치테크(SH TECH 신화테크)', '케이엘 | 08월 매출로 요청드립니다'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-020380150', '020380150', 'RETURN FILTER HOUSING ASSY', 'KTP60(MPFX4003AG3P25NBP01)',
  '일반부품', '화성공장', 'A-01-01', 9,
  'EA', 5, 100000, '(주)림스코', 'KTP0706(2축) 9대'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-000300121', '000300121', 'MAIN HYDRAULIC CYLINDER', 'Ø120XØ70X2100',
  '실린더', '함안공장', 'A-01-01', 10,
  'EA', 5, 1298000, '미래테크', '생산용(납품 전 담당자와 통화 후 납품요망)'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-000300100', '000300100', 'MAIN HYDRAULIC CYLINDER', 'Ø130X2100',
  '실린더', '함안공장', 'A-01-01', 10,
  'EA', 5, 1366000, '미래테크', '생산용(납품 전 담당자와 통화 후 납품요망)'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-000300130', '000300130', 'MAIN HYDRAULIC CYLINDER', 'Ø140X2100',
  '실린더', '함안공장', 'A-01-01', 10,
  'EA', 5, 1436000, '미래테크', '생산용(납품 전 담당자와 통화 후 납품요망)'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-000521610', '000521610', 'RID FOR TRANSITION DOOR', '5INCH',
  '일반부품', '화성공장', 'A-01-01', 2,
  'EA', 5, 23000, '(주)대원하이텍', '7인치 청소창 엘보 마개용'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-000191550', '000191550', 'SUCTION PIPE', 'A20VLO190(12T)H406.4',
  '일반부품', '함안공장', 'A-01-01', 5,
  'EA', 5, 140000, '태광엠앤에스 주식회사', '케이엘 요청 | 신명욱부장님 긴급요청드립니다.'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-500140200', '500140200', 'FRONT OUTRIGGER', '(L)-(OUT BOX)NM52~55',
  '일반부품', '함안공장', 'A-01-01', 6,
  'EA', 5, 750000, '(주)동방이엔지', 'M52Z(313~328) | 08월 생산계획'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-500100000', '500100000', 'TURNING BASE', 'M50(M48-II), NEW52',
  '일반부품', '함안공장', 'A-01-01', 6,
  'EA', 5, 8800000, '(주)동방이엔지', 'M52Z(313~328) | 08월 생산계획'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-520142300', '520142300', 'REAR OUTRIGGER', '(R)-O/R(15/03/31)-6500',
  '일반부품', '함안공장', 'A-01-01', 6,
  'EA', 5, 1746500, '(주)동방이엔지', 'M52Z(313~328) | 08월 생산계획'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-500140250', '500140250', 'FRONT OUTRIGGER', '(L)-(INNER BOX)NM52~55',
  '일반부품', '함안공장', 'A-01-01', 6,
  'EA', 5, 675000, '(주)동방이엔지', 'M52Z(313~328) | 08월 생산계획'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-410140300', '410140300', 'REAR OUTRIGGER', '(R)-5800L',
  '일반부품', '함안공장', 'A-01-01', 6,
  'EA', 5, 1347500, '(주)동방이엔지', 'M52Z(313~328) | 08월 생산계획'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-410100000', '410100000', 'TURNING BASE', 'M41(5)',
  '일반부품', '함안공장', 'A-01-01', 6,
  'EA', 5, 6800000, '(주)동방이엔지', 'M52Z(313~328) | 08월 생산계획'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-500140150', '500140150', 'FRONT OUTRIGGER', '(R)-(INNER BOX)NM52~55',
  '일반부품', '함안공장', 'A-01-01', 6,
  'EA', 5, 675000, '(주)동방이엔지', 'M52Z(313~328) | 08월 생산계획'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-500140100', '500140100', 'FRONT OUTRIGGER', '(R)-(OUT BOX)NM52~55',
  '일반부품', '함안공장', 'A-01-01', 6,
  'EA', 5, 750000, '(주)동방이엔지', 'M52Z(313~328) | 08월 생산계획'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-410140100', '410140100', 'FRONT OUTRIGGER', 'M41-(R)',
  '일반부품', '함안공장', 'A-01-01', 6,
  'EA', 5, 650000, '(주)동방이엔지', 'M52Z(313~328) | 08월 생산계획'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-410140400', '410140400', 'REAR OUTRIGGER', '(L)-5800L',
  '일반부품', '함안공장', 'A-01-01', 6,
  'EA', 5, 1347500, '(주)동방이엔지', 'M52Z(313~328) | 08월 생산계획'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-520142400', '520142400', 'REAR OUTRIGGER', '(L)-O/R(15/03/31)-6500',
  '일반부품', '함안공장', 'A-01-01', 6,
  'EA', 5, 1746500, '(주)동방이엔지', 'M52Z(313~328) | 08월 생산계획'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-410140200', '410140200', 'FRONT OUTRIGGER', 'M41-(L)',
  '일반부품', '함안공장', 'A-01-01', 6,
  'EA', 5, 650000, '(주)동방이엔지', 'M52Z(313~328) | 08월 생산계획'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-410182100', '410182100', 'COVER FOR SIDE', 'M41(R)',
  '일반부품', '화성공장', 'A-01-01', 3,
  'EA', 5, 166700, '보성이피에스', '34~36'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-410182200', '410182200', 'COVER FOR SIDE', 'M41(L)',
  '일반부품', '화성공장', 'A-01-01', 3,
  'EA', 5, 166700, '보성이피에스', '34~36'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-410160130', '410160130', 'DECK T/B-L', 'M41Z 2.5T 2457*492(AL)',
  '일반부품', '화성공장', 'A-01-01', 3,
  'EA', 5, 73130, '보성이피에스', '34~36'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-410160120', '410160120', 'DECK T/B-R', 'M41Z 2.5T 2457*492(AL)',
  '일반부품', '화성공장', 'A-01-01', 3,
  'EA', 5, 73130, '보성이피에스', '34~36'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-410130100', '410130100', 'BOOM SUPPORT', 'M41Z(FRONT)',
  '일반부품', '화성공장', 'A-01-01', 3,
  'EA', 5, 210000, '태광엠앤에스 주식회사', '34~36 | 제작발주입니다.'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-410130200', '410130200', 'BOOM SUPPORT', 'M41Z(REAR)',
  '일반부품', '화성공장', 'A-01-01', 3,
  'EA', 5, 191000, '태광엠앤에스 주식회사', '34~36 | 제작발주입니다.'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-001180850', '001180850', 'INSERT COVER', 'M20,32,36R,38,40R,Z5,42Z5(H：287.1)',
  '일반부품', '화성공장', 'A-01-01', 6,
  'EA', 5, 22060, '태광엠앤에스 주식회사', '34~36 | 제작발주입니다.'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-501140971', '501140971', 'GUIDE FOR HOSE-1', 'M52,M55',
  '일반부품', '함안공장', 'A-01-01', 12,
  'EA', 5, 20030, '태광엠앤에스 주식회사', '31~33 | 제작발주입니다.'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-522130100', '522130100', 'BOOM SUPPORT(REST)', '52Z6_FRONT',
  '일반부품', '함안공장', 'A-01-01', 6,
  'EA', 5, 186000, '태광엠앤에스 주식회사', '31~33 | 제작발주입니다.'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-000802121', '000802121', 'OUTREGGER STOPPER ASSY', '(R) 364L-45~55',
  '일반부품', '함안공장', 'A-01-01', 6,
  'EA', 5, 15220, '태광엠앤에스 주식회사', '31~33 | 제작발주입니다.'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-000802122', '000802122', 'OUTREGGER STOPPER ASSY', '(L) 364L-45~55',
  '일반부품', '함안공장', 'A-01-01', 6,
  'EA', 5, 15220, '태광엠앤에스 주식회사', '31~33 | 제작발주입니다.'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-501140972', '501140972', 'GUIDE FOR HOSE-2', 'M52,M55',
  '일반부품', '함안공장', 'A-01-01', 12,
  'EA', 5, 22060, '태광엠앤에스 주식회사', '31~33 | 제작발주입니다.'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-001180210', '001180210', 'COVER FOR SLEWING GEAR', 'M45, M48, M50, M52 공용',
  '일반부품', '함안공장', 'A-01-01', 6,
  'EA', 5, 111000, '태광엠앤에스 주식회사', '31~33 | 제작발주입니다.'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-522130200', '522130200', 'BOOM SUPPORT(REST)', '52Z6_REAR',
  '일반부품', '함안공장', 'A-01-01', 6,
  'EA', 5, 350000, '태광엠앤에스 주식회사', '31~33 | 제작발주입니다.'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-000172456', '000172456', 'STEP(R.L포함)', 'STEEL(2STEP)408*190(M52RZ 일자크로스 프레임적용)',
  '일반부품', '함안공장', 'A-01-01', 6,
  'EA', 5, 326000, '태광엠앤에스 주식회사', '31~33 | 제작발주입니다.'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-501140950', '501140950', 'BKT FOR GUIDE HOSE', '',
  '일반부품', '함안공장', 'A-01-01', 12,
  'EA', 5, 13370, '태광엠앤에스 주식회사', '31~33 | 제작발주입니다.'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-001180855', '001180855', 'INSERT COVER', 'M45,M48,M50,M52(H332)',
  '일반부품', '함안공장', 'A-01-01', 12,
  'EA', 5, 24080, '태광엠앤에스 주식회사', '31~33 | 제작발주입니다.'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-501140960', '501140960', 'WIRE FOR FRONT O／R', 'Ø8(M12-3320L*4EA, M12-5500L*4EA)',
  '일반부품', '함안공장', 'A-01-01', 12,
  'EA', 5, 274800, '(주)에스에이치테크(SH TECH 신화테크)', 'M52Z6-323~328'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-460126100', '460126100', 'SLEWING GEAR', 'M52 SCM-1476(Ø1476*Ø1085*135T)',
  '일반부품', '함안공장', 'A-01-01', 6,
  'EA', 5, 3500000, '(주)신라정밀홀딩스', 'M41Z-31~33'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-590140964', '590140964', 'HOLDER FOR GUIDE BLOCK-1', 'M59-30T*35*127',
  '일반부품', '함안공장', 'A-01-01', 20,
  'EA', 5, 25000, '하이파워유압(주)', ''
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-000322100', '000322100', 'O/R MOTOR RELIEF VLAVE BLOCK', 'M59 (40T*80*76)',
  '일반부품', '함안공장', 'A-01-01', 20,
  'EA', 5, 35000, '하이파워유압(주)', ''
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-590140965', '590140965', 'HOLDER FOR GUIDE BLOCK-2', '35T*60*60',
  '일반부품', '함안공장', 'A-01-01', 20,
  'EA', 5, 25000, '하이파워유압(주)', ''
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-410210100', '410210100', 'BOOM BUSH SET', 'M41Z 5S',
  '일반부품', '화성공장', 'A-01-01', 3,
  'EA', 5, 66060, '제이에스비(JSB)', '34~36 | 8월 발주건부터 신규 프로그램으로 전표생성바랍니다.'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-521210100', '521210100', 'BOOM BUSH SET', 'M52Z6S(NEW)',
  '일반부품', '함안공장', 'A-01-01', 6,
  'EA', 5, 121190, '제이에스비(JSB)', '31~33 | 8월 발주건부터 신규 프로그램으로 전표생성바랍니다.'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-W133', 'W133', 'BOOM BOSS SET', 'M41Z5(일부사내가공)',
  '일반부품', '함안공장', 'A-01-01', 6,
  'EA', 5, 374000, '일출산업사', '34~36 (화성) | 착지- 2공장'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-410240000', '410240000', 'BOOM CYLINDER SET', 'M41Z 5S',
  '실린더', '화성공장', 'A-01-01', 3,
  'EA', 5, 6634000, '미래테크', '34~36'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-521240000', '521240000', 'BOOM CYLINDER SET', 'M52Z6',
  '실린더', '함안공장', 'A-01-01', 6,
  'EA', 5, 13138000, '미래테크', '31~33'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-000251320', '000251320', 'BOLT TYPE COUPLING (볼트 클램프)', '5″-forging(KCP)',
  '일반부품', '함안공장', 'A-01-01', 230,
  'EA', 5, 17000, '(주)에스에이치테크(SH TECH 신화테크)', '씨원 | 08월 매출로 요청드립니다'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-MV101720010', 'MV101720010', 'ADJUSTNG STOPPER', '12T*60*35',
  '일반부품', '특장 자재창고-화성', 'A-01-01', 50,
  'EA', 5, 1700, '보성이피에스', '공용품 | 박현우연구원 요청'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-MV101720009', 'MV101720009', 'STOPPER', '10T*50*50',
  '일반부품', '특장 자재창고-화성', 'A-01-01', 50,
  'EA', 5, 670, '보성이피에스', '공용품 | 박현우연구원 요청'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-451140960', '451140960', 'WIRE FOR FRONT O／R', 'Ø8(M12：3160L:4EA, 5000L:4EA)',
  '일반부품', '함안공장', 'A-01-01', 6,
  'EA', 5, 223660, '(주)에스에이치테크(SH TECH 신화테크)', '씨원 | 08월 매출로 요청드립니다'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-590230000', '590230000', 'BOOM PIN SET', 'M59Z',
  '일반부품', '함안공장', 'A-01-01', 1,
  'EA', 5, 3600000, '남우공업(주)', 'KCP63-102호기 중고차 붐 파손건(방글라데시-김혁) | 도면확인 후 제작(도면 첨부)'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-590240000', '590240000', 'BOOM CYLINDER SET - 5단', 'M59Z 5S(14／01)',
  '실린더', '화성공장', 'A-01-01', 1,
  'EA', 5, 14582000, '미래테크', 'KCP63-102호기 중고차 붐 파손건(방글라데시-김혁)'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-FF123', 'FF123', 'FLUID FITTING', 'GE12LR1/2KEGCF',
  '일반부품', '함안공장', 'A-01-01', 30,
  'EA', 5, 0, '캐나다／MIK TECH LTD.', 'p1092'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-000701300', '000701300', 'ACCUMULATOR', 'SB330-4A1/112A',
  '일반부품', '함안공장', 'A-01-01', 4,
  'EA', 5, 370000, '캐나다／MIK TECH LTD.', 'p1092'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-000990520', '000990520', 'WATER RELIEF VALVE(신주)', '25A*10K',
  '밸브', '함안공장', 'A-01-01', 10,
  'EA', 5, 18000, '캐나다／MIK TECH LTD.', 'p1092'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-000351350', '000351350', 'FLANGE FOR P.T.O CASE (GREASE SEAL)', 'KCP (FD11PTO12)',
  '일반부품', '함안공장', 'A-01-01', 4,
  'EA', 5, 0, '캐나다／MIK TECH LTD.', 'p1092'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-000193560', '000193560', 'SUCTION PIPE', 'M34Z5-A20VLO190(12T)',
  '일반부품', '화성공장', 'A-01-01', 6,
  'EA', 5, 155000, '태광엠앤에스 주식회사', '씨원 요청'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-590210100', '590210100', 'BOOM BUSH SET', 'M59(14／01)',
  '일반부품', '화성공장', 'A-01-01', 1,
  'EA', 5, 136360, '제이에스비(JSB)', '59-102호기(방글라데시)'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-300240400', '300240400', '4th BOOM CYLINDER', 'Ø120*Ø65*ST920',
  '실린더', '화성공장', 'A-01-01', 1,
  'EA', 5, 651000, '중국／JINAN HUACHENWEIDA TRAD CO.,LTD(실린더)', 'M30-231(체코) a/s사용 보충분-정우혁차장 요청'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-300240200', '300240200', '2nd BOOM CYLINDER', 'Ø170*Ø100*ST1205',
  '실린더', '화성공장', 'A-01-01', 1,
  'EA', 5, 1371000, '중국／JINAN HUACHENWEIDA TRAD CO.,LTD(실린더)', 'M30-231(체코) a/s사용 보충분-정우혁차장 요청'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-000730070', '000730070', 'LOGIC COVER(17/06)', 'ONE BLOCK-55T*151*99',
  '일반부품', '화성공장', 'A-01-01', 9,
  'EA', 5, 71000, '주식회사에이치원', 'KTP0706(2축) 9대'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-020730310', '020730310', 'HEAD COVER BLOCK', 'KTP60(50*90*311) CAN',
  '일반부품', '화성공장', 'A-01-01', 10,
  'EA', 5, 65000, '하이파워유압(주)', 'KTP0706(2축) 9대 | 긴급요청드립니다.'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-000730921', '000730921', 'LOGIC COVER(2)-BDSV', 'ONE BLOCK＃32- 55T*107*170(2012/06)',
  '일반부품', '함안공장', 'A-01-01', 5,
  'EA', 5, 120000, '하이파워유압(주)', '티렉스 요청'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-MV101020025', 'MV101020025', 'HANDRAIL FOR TANK BODY', 'SS400 3.2T, SQ PIPE 40*40*2.3T',
  '일반부품', '특장 자재창고-화성', 'A-01-01', 2,
  'EA', 5, 49720, '보성이피에스', 'KMV13-039,040 | 박현우연구원 요청'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-MV113310003', 'MV113310003', 'BELT COVER ASSY', 'SS400 2.3T',
  '일반부품', '특장 자재창고-화성', 'A-01-01', 1,
  'EA', 5, 84810, '보성이피에스', 'KMV13-039,040 | 박현우연구원 요청'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-MV101163300', 'MV101163300', 'ADAPTER FOR FILTER BOX', 'STS PIPE 300A, 90 ELBOW 300A, TEE 300Ax300A',
  '일반부품', '특장 자재창고-화성', 'A-01-01', 2,
  'EA', 5, 874350, '보성이피에스', 'KMV13-039,040 | 박현우연구원 요청'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-370240000', '370240000', 'BOOM CYLINDER SET', 'M37Z5',
  '실린더', '함안공장', 'A-01-01', 3,
  'EA', 5, 5749000, '중국／JINAN HUACHENWEIDA TRAD CO.,LTD(실린더)', ''
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-400240000', '400240000', 'BOOM CYLINDER SET', 'M40R',
  '실린더', '함안공장', 'A-01-01', 6,
  'EA', 5, 6737000, '중국／JINAN HUACHENWEIDA TRAD CO.,LTD(실린더)', ''
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-SC144310018', 'SC144310018', 'UNLOADING VALVE', 'SS400 6T, 3.2T',
  '밸브', '특장 자재창고-화성', 'A-01-01', 1,
  'EA', 5, 0, '보성이피에스', 'KSC1205-007 | 김재민연구원 요청'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-370242300', '370242300', '3rd BOOM CYLINDER-M37Z', 'Ø170*Ø100*1165ST',
  '실린더', '함안공장', 'A-01-01', 1,
  'EA', 5, 1316000, '중국／JINAN HUACHENWEIDA TRAD CO.,LTD(실린더)', '베트남 a/s'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-000730510', '000730510', 'COUNTER BALANCE VALVE(2)', '40T*60*90',
  '밸브', '함안공장', 'A-01-01', 50,
  'EA', 5, 0, '(주)케이비에이치', '허이사님 요청 | 김두민연구원 요청'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-000371400', '000371400', 'CONTROL VALVE FOR BOOM', '6SECTION-12V-PSL(M30R~M33R)',
  '밸브', '함안공장', 'A-01-01', 6,
  'EA', 5, 0, '캐나다／MIK TECH LTD.', 'A2(L25/25,J25/40,J25/40,J16/25,J10/16,O25/25)'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-001372240', '001372240', 'CONTROL VALVE FOR BOOM(VARIABLE TYPE)', '7SECTION-12V-PSVF(M48~M70)',
  '밸브', '함안공장', 'A-01-01', 4,
  'EA', 5, 0, '캐나다／MIK TECH LTD.', 'A2(L25/25,J25/40,J25/40,J16/25,J10/16,O25/25)'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-000371420', '000371420', 'CONTROL VALVE FOR BOOM', '6SECTION-12V-PSL(M18~M28)',
  '밸브', '함안공장', 'A-01-01', 4,
  'EA', 5, 0, '캐나다／MIK TECH LTD.', 'A2(L25/25,J25/40,J25/40,J16/25,J10/16,O25/25)'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-000511050', '000511050', 'SEAL HOUSING ASSY', 'SplineØ80 (With seal kit&thrust ring)',
  '일반부품', '화성부품영업창고', 'A-01-01', 25,
  'EA', 5, 110000, '대창기계산업(주)', '스페인, 우즈벡 판매용 | 빠른 입고 요청드립니다'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-000770430', '000770430', 'DOOR LOCK-R', 'R041-D01-0(4-Ø6.5)',
  '일반부품', '화성공장', 'A-01-01', 100,
  'EA', 5, 12500, '건영기계(주)', ''
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-OR123', 'OR123', 'SEAL KIT SEATED VALVE', '(PSL 3H1 ZM/D 380-2)EM21 DSE',
  '밸브', '함안공장', 'A-01-01', 50,
  'EA', 5, 0, '캐나다／MIK TECH LTD.', 'PSL 시티드 밸브 씰키트'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-000370450', '000370450', '2/2WAY(SEATED V/V)', '(PSL 3H1 ZM/D 380-2) EM21 DSE-G24',
  '일반부품', '함안공장', 'A-01-01', 10,
  'EA', 5, 0, '캐나다／MIK TECH LTD.', 'PSL 시티드 밸브 씰키트'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-000373201', '000373201', 'COIL FOR BOOM CONTROL', 'PSLF-DC12',
  '일반부품', '함안공장', 'A-01-01', 60,
  'EA', 5, 0, '캐나다／MIK TECH LTD.', 'PSL 시티드 밸브 씰키트'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-000351200', '000351200', 'REDUCTION GEAR BOX', 'M40(30T)',
  '일반부품', '화성부품영업창고', 'A-01-01', 1,
  'EA', 5, 2730000, '대창기계산업(주)', ''
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-MV101720003', 'MV101720003', 'SHAFT FOR PULLEY', 'S45C Ø60*65*565L',
  '일반부품', '특장 자재창고-화성', 'A-01-01', 5,
  'EA', 5, 107000, '대창기계산업(주)', '가람 요청'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-MV101720004', 'MV101720004', 'FLANGE FOR SHAFT', 'S45C*Ø150*67L(8-M12)',
  '일반부품', '특장 자재창고-화성', 'A-01-01', 5,
  'EA', 5, 66071, '대창기계산업(주)', '가람 요청'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-000512700', '000512700', 'AGITATOR SHAFT', 'KCP-Ø65*130L(OPEN)',
  '일반부품', '화성부품영업창고', 'A-01-01', 30,
  'EA', 5, 35000, '대창기계산업(주)', ''
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-000300538', '000300538', 'SWING CYLINDER FOR ROD EYE', 'M55',
  '실린더', '함안공장', 'A-01-01', 10,
  'EA', 5, 0, '중국／JINAN HUACHENWEIDA TRAD CO.,LTD(실린더)', ''
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-000502101', '000502101', 'SCREEN FOR HOPPER(스크린)', 'SMALL(M30)',
  '일반부품', '함안공장', 'A-01-01', 1,
  'EA', 5, 120000, '(주)동방이엔지', ''
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;
INSERT INTO public.tb_items (
  id, code, name, spec, category, warehouse, rack_location, quantity, unit, safety_stock, price, supplier, notes
) VALUES (
  'item-900060050', '900060050', 'DU-BUSH', '60*50',
  '일반부품', '화성부품영업창고', 'A-01-01', 20,
  'EA', 5, 1100, '제이에스비(JSB)', '당일 발송 요청드립니다'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  spec = EXCLUDED.spec,
  category = EXCLUDED.category,
  warehouse = EXCLUDED.warehouse,
  price = EXCLUDED.price,
  supplier = EXCLUDED.supplier;

COMMIT;
