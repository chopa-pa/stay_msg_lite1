-- 스테이솔숲 예약 문자 앱(stay_msg) Supabase 스키마 v1 (2026-10-26)
-- 원칙: 로그인한 사용자(쵸파파·쵸파맘)만 읽기/쓰기. 가입은 대시보드에서만(Allow new users 끔).

create extension if not exists pgcrypto;

-- 예약
create table if not exists reservations (
  id          text primary key,                       -- 앱 id 그대로(r1101 등) 또는 gen
  name        text not null,
  phone       text,
  checkin     date not null,
  checkout    date not null,
  guests      text,                                   -- "2명"
  price       text,                                   -- "200,000원" (앱 표기 그대로)
  room_id     text,
  channel     text,                                   -- 네이버예약 / 에어비앤비 / 인스타 DM / 전화 / 기타
  memo        text,
  status      text not null default 'confirmed',      -- confirmed / cancelled
  source_id   text,                                   -- 네이버 예약번호 / 에어비앤비 코드(봇 수집용, 중복 방지)
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create unique index if not exists reservations_source_uidx on reservations(source_id) where source_id is not null;
create index if not exists reservations_checkin_idx on reservations(checkin);

-- 문자 발송 기록 (앱 이력 + 봇 발송)
create table if not exists messages (
  id              text primary key,
  reservation_id  text references reservations(id) on delete set null,
  stage_id        text,         -- inquiry/prebook/booked/precheckin/checkedin/checkout
  stage_label     text,
  tpl_title       text,
  name            text,
  phone           text,
  body            text,
  sent_by         text not null default 'app',   -- app / bot
  status          text not null default 'sent',  -- sent / failed / preview
  sent_at         timestamptz not null default now()
);
create index if not exists messages_sent_idx on messages(sent_at desc);

-- 설정 묶음 (settings / templates / periods 등 JSON 통째)
create table if not exists app_settings (
  key         text primary key,     -- 'settings' | 'tpl' | 'periods'
  value       jsonb not null,
  updated_at  timestamptz not null default now()
);

-- updated_at 자동 갱신
create or replace function set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists reservations_upd on reservations;
create trigger reservations_upd before update on reservations for each row execute function set_updated_at();
drop trigger if exists app_settings_upd on app_settings;
create trigger app_settings_upd before update on app_settings for each row execute function set_updated_at();

-- RLS: 로그인 사용자 전부 허용(계정 2개뿐), 익명 차단
alter table reservations enable row level security;
alter table messages enable row level security;
alter table app_settings enable row level security;
drop policy if exists auth_all on reservations;  create policy auth_all on reservations  for all to authenticated using (true) with check (true);
drop policy if exists auth_all on messages;      create policy auth_all on messages      for all to authenticated using (true) with check (true);
drop policy if exists auth_all on app_settings;  create policy auth_all on app_settings  for all to authenticated using (true) with check (true);

-- v3.1.0 (2026-10-27, 코덱스 리뷰 P2-10): 확정 예약끼리 날짜 겹침 금지 + 날짜 순서 검사
create extension if not exists btree_gist;
alter table reservations drop constraint if exists reservations_dates_chk;
alter table reservations add constraint reservations_dates_chk check (checkout > checkin);
alter table reservations drop constraint if exists reservations_no_overlap;
alter table reservations add constraint reservations_no_overlap
  exclude using gist (coalesce(room_id,'') with =, daterange(checkin, checkout, '[)') with &&)
  where (status = 'confirmed');
