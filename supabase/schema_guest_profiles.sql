-- 손님(전화번호) 단위 메모·주의 표시(v1.26.0, 2026-11-14). 예약이 바뀌어도 같은 번호면 따라옴. phone = 숫자만
create table if not exists guest_profiles (
  phone       text primary key,
  memo        text,
  caution     boolean not null default false,   -- 주의 손님(새 예약 들어오면 앱 칩·봇 텔레그램 알림)
  updated_by  text,
  updated_at  timestamptz not null default now()
);
alter table guest_profiles enable row level security;
drop policy if exists auth_all on guest_profiles;
create policy auth_all on guest_profiles for all to authenticated using (true) with check (true);
