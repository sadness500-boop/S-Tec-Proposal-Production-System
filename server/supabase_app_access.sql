-- =====================================================================
--  에스텍 통합 로그인 · 프로그램별 사용 권한 (app_access)
--  Designed & Developed by Rat Rae Choi
--
--  ● 어디에 실행하나요?  Attendance Management Software 가 쓰는 Supabase 프로젝트
--    (mnsuebexlzhvomxhrear) → 왼쪽 메뉴 SQL Editor → 이 파일 전체를 붙여넣고 Run.  한 번만 실행하면 됩니다.
--  ● 무엇을 하나요?  하나의 아이디(통합 로그인)로 쓰는 5개 프로그램마다 사용 권한을 따로 줍니다.
--      stcr = S-Tec Complaint Response System        stse = S-Tec short estimate
--      stso = S-Tec-Business-Site-Overview            stqs = S-Tec-Quotation-System
--      wbe  = Workload-Based Cost and Labor Estimation Method
--    (근태관리 프로그램은 기존 「관리 범위」를 그대로 씁니다 — 이 SQL은 근태관리에 영향을 주지 않습니다.)
--  ● 제작자·관리자는 모든 프로그램을 씁니다. 일반 사용자는 관리자 페이지 「🔐 프로그램별 권한」에서
--    프로그램마다 「사용 / 사용 안 함」, 사용기한, 담당 지사(관리 범위)를 지정해야 그 프로그램을 쓸 수 있습니다.
--  ● 다시 실행해도 안전합니다(이미 있는 표·권한은 지우지 않음).
-- =====================================================================

create table if not exists public.app_access (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  app        text not null check (app in ('stcr','stse','stso','stqs','wbe')),
  perm       text not null default 'none' check (perm in ('none','use')),
  expires_at date,                                   -- 이 프로그램 사용기한(이 날까지) · 비우면 계정 기한만 적용
  branches   text[] not null default '{}',           -- 관리 범위(담당 지사) · 비우면 전체
  updated_at timestamptz not null default now(),
  updated_by uuid,
  primary key (user_id, app)
);
alter table public.app_access enable row level security;
drop policy if exists app_access_read on public.app_access;
create policy app_access_read on public.app_access for select
  using (user_id = auth.uid() or public.is_admin());
-- 쓰기는 아래 관리자 함수로만 (직접 insert/update 정책 없음)

-- 1) 앱이 시작할 때 부르는 확인 함수 ------------------------------------------------
create or replace function public.app_check(p_app text) returns json
language plpgsql stable security definer set search_path = public as $$
declare pr public.profiles; a public.app_access;
begin
  if auth.uid() is null then return json_build_object('ok', false, 'reason', 'no_session'); end if;
  select * into pr from public.profiles where id = auth.uid();
  if not found then return json_build_object('ok', false, 'reason', 'no_profile'); end if;
  if pr.role in ('owner','admin') then
    return json_build_object('ok', true, 'perm', 'use', 'admin', true, 'branches', '{}'::text[]);
  end if;
  select * into a from public.app_access where user_id = pr.id and app = p_app;
  if not found or a.perm = 'none' then
    return json_build_object('ok', false, 'reason', 'no_app_access');
  end if;
  if a.expires_at is not null and a.expires_at < (now() at time zone 'Asia/Seoul')::date then
    return json_build_object('ok', false, 'reason', 'app_expired', 'expires_at', a.expires_at);
  end if;
  return json_build_object('ok', true, 'perm', a.perm, 'expires_at', a.expires_at, 'branches', a.branches);
end $$;

-- 2) 관리자: 사용자 × 프로그램 권한 목록 ---------------------------------------------
create or replace function public.admin_list_app_access() returns table (
  id uuid, email text, name text, dept text, role text, status text, expires_at date, apps jsonb
)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception '관리자만 볼 수 있습니다'; end if;
  return query
    select p.id, p.email, p.name, p.dept, p.role, p.status, p.expires_at,
           coalesce(jsonb_object_agg(a.app, jsonb_build_object('perm', a.perm, 'expires_at', a.expires_at, 'branches', a.branches))
                    filter (where a.app is not null), '{}'::jsonb)
      from public.profiles p
      left join public.app_access a on a.user_id = p.id
     group by p.id
     order by case p.role when 'owner' then 0 when 'admin' then 1 else 2 end, p.name, p.email;
end $$;

-- 3) 관리자: 권한 지정 -----------------------------------------------------------------
create or replace function public.admin_set_app_access(
  p_user uuid, p_app text, p_perm text, p_expires date default null, p_branches text[] default '{}'
) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception '관리자만 지정할 수 있습니다'; end if;
  insert into public.app_access (user_id, app, perm, expires_at, branches, updated_at, updated_by)
  values (p_user, p_app, p_perm, p_expires, coalesce(p_branches, '{}'), now(), auth.uid())
  on conflict (user_id, app) do update
    set perm = excluded.perm, expires_at = excluded.expires_at, branches = excluded.branches,
        updated_at = now(), updated_by = auth.uid();
  perform public._admin_log(p_user, 'app_access',
    p_app || ' → ' || case p_perm when 'use' then '사용' else '사용 안 함' end
    || coalesce(' · 기한 ' || p_expires::text, '')
    || case when coalesce(array_length(p_branches, 1), 0) > 0 then ' · 지사 ' || array_to_string(p_branches, ',') else '' end);
end $$;

revoke all on function public.app_check(text) from public, anon;
revoke all on function public.admin_list_app_access() from public, anon;
revoke all on function public.admin_set_app_access(uuid, text, text, date, text[]) from public, anon;
grant execute on function public.app_check(text) to authenticated;
grant execute on function public.admin_list_app_access() to authenticated;
grant execute on function public.admin_set_app_access(uuid, text, text, date, text[]) to authenticated;
