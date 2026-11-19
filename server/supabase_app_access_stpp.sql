-- =====================================================================
--  S-Tec Proposal Production System(에스텍 제안서 제작시스템) — 통합 로그인 서버에 'stpp' 등록
--  Designed & Developed by Rat Rae Choi
--
--  ● 어디에 실행하나요?  통합 로그인 Supabase 프로젝트(mnsuebexlzhvomxhrear) → SQL Editor → 이 파일 전체 붙여넣기 → Run (한 번만)
--  ● 무엇을 하나요?
--    1) 통합관리 시스템의 「프로그램 등록부」(program_registry)에 제안서 제작시스템(stpp)을 9번째로 추가 → 메인 화면 메뉴 카드 표시
--    2) 프로그램별 권한(app_access)에서 stpp 를 지정할 수 있게 함
--       (등록부 방식이면 등록만으로 허용 / 예전 허용목록 방식이면 목록 제한을 형식 검사로 교체)
--  ● 견적 연동 자료는 기존 여러 기기 동기화(user_data) 표의 'stec_proposal_inbox' 항목을 그대로 씁니다 — 새 표가 필요 없습니다.
--  ● 기존 자료는 지우지 않습니다. 다시 실행해도 안전합니다.
-- =====================================================================
do $$
declare c record;
begin
  if to_regclass('public.program_registry') is not null then
    insert into public.program_registry (code, name, full_name, url, icon, color, sort, uses_access, version, note)
    values ('stpp', '제안서 제작시스템', 'S-Tec Proposal Production System',
            'https://sadness500-boop.github.io/S-Tec-Proposal-Production-System/', 'assets/apps/stpp.png', '#0E5C4A', 90, true, '1.0.0',
            '견적 3종 연동 · 업종·산업별 제안서 Word·PPT·PDF')
    on conflict (code) do update set url = excluded.url, icon = excluded.icon, full_name = excluded.full_name, note = excluded.note;
  end if;
  if to_regclass('public.app_access') is not null then
    for c in select conname from pg_constraint
             where conrelid = 'public.app_access'::regclass and contype = 'c'
               and pg_get_constraintdef(oid) ilike '%(app = ANY%'
    loop
      execute format('alter table public.app_access drop constraint %I', c.conname);
    end loop;
  end if;
end $$;

-- 확인: 아래 결과에 stpp 한 줄이 보이면 완료
select code, name, url, sort from public.program_registry where code = 'stpp';
