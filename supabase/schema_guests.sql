-- 고객 관리(v1.4.0, 2026-10-28): 예약 1건마다 손으로 표시하는 항목. 이름·전화·숙박일은 reservations에서 읽고 여기엔 체크값만.
create table if not exists guest_notes (
  reservation_id text primary key references reservations(id) on delete cascade,
  dog         boolean,                                  -- 반려견 동반(null이면 예약 메모로 판단)
  bbq         boolean,                                  -- 바비큐 이용(null이면 예약 메모로 판단. 11-15 not null default false에서 바꿈)
  review      boolean not null default false,           -- 리뷰 작성
  note        text,
  updated_by  text,
  updated_at  timestamptz not null default now()
);
alter table guest_notes enable row level security;
drop policy if exists auth_all on guest_notes;
create policy auth_all on guest_notes for all to authenticated using (true) with check (true);
-- 2026-11-15 이미 만든 표에 적용한 변경(v1.27.3: 누른 칸만 저장 → 누르지 않은 칸은 null = 메모로 자동 판단)
alter table guest_notes alter column bbq drop not null;
alter table guest_notes alter column bbq drop default;
