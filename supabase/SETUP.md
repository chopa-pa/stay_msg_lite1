# Supabase 설정 (2026-10-27 봇이 완료)

## 현재 상태
- 프로젝트 `solsoop` (ref `yqzrxxepkxmxeukmsqeb`, Northeast Asia Seoul, Free), 조직 chopa-pa's Org. 대시보드 https://supabase.com/dashboard/project/yqzrxxepkxmxeukmsqeb
- `schema.sql` 실행 완료(reservations · messages · app_settings, RLS authenticated 전부). REST 확인: service 200, anon 200 빈 배열.
- Auth: 「Allow new users to sign up」 끔(가입 시도 → 422 signup_disabled 확인). Confirm email 켜짐(사용자는 admin API로 확인 상태로 만듦).
- 사용자 2: 쵸파파 lottopet@gmail.com(`APP_USER1_*`), 쵸파맘 staysolsoop@gmail.com(솔숲 공용 지메일, `APP_USER2_*`). 비밀번호는 맥 `~/.config/solsoop/supabase.env`. (처음 만든 gscmedc@gmail.com은 조합 계정이라 삭제, 10-27)
- 키: URL·anon은 index.html에 주입(커밋 eaf6aa5). service_role·DB 비밀번호·publishable 키는 `~/.config/solsoop/supabase.env`(맥만, 드라이브·깃 금지).

## 남은 일
- PC에서 https://msg.staysolsoop.kr 로그인 → "서버가 비어 있습니다. 올릴까요?" 확인(PC 데이터가 서버로 감). 폰은 로그인만.

## 사용자 추가(봇용)
```sh
set -a; . ~/.config/solsoop/supabase.env; set +a
curl -X POST "$SUPABASE_URL/auth/v1/admin/users" -H "apikey: $SUPABASE_SERVICE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" -H "Content-Type: application/json" -d '{"email":"EMAIL","password":"PW","email_confirm":true}'
```
