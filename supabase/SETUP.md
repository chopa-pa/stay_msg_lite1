# Supabase 설정 (2026-10-27 봇이 완료)

## 현재 상태
- 프로젝트 `solsoop` (ref `yqzrxxepkxmxeukmsqeb`, Northeast Asia Seoul, Free), 조직 chopa-pa's Org. 대시보드 https://supabase.com/dashboard/project/yqzrxxepkxmxeukmsqeb
- `schema.sql` 실행 완료(reservations · messages · app_settings, RLS authenticated 전부). REST 확인: service 200, anon 200 빈 배열.
- Auth: 「Allow new users to sign up」 끔(가입 시도 → 422 signup_disabled 확인). Confirm email 켜짐(사용자는 admin API로 확인 상태로 만듦).
- 사용자 1: 쵸파파(gscmedc@gmail.com). 비밀번호는 맥 `~/.config/solsoop/supabase.env`의 `APP_USER1_PASSWORD`.
- 키: URL·anon은 index.html에 주입(커밋 eaf6aa5). service_role·DB 비밀번호·publishable 키는 `~/.config/solsoop/supabase.env`(맥만, 드라이브·깃 금지).

## 남은 일
- 쵸파맘 계정: 이메일 정해지면 봇이 admin API로 추가(아래 명령). 대시보드 Authentication → Users → Add user로도 가능(Auto Confirm 체크).
- PC에서 https://msg.staysolsoop.kr 로그인 → "서버가 비어 있습니다. 올릴까요?" 확인(PC 데이터가 서버로 감). 폰은 로그인만.

## 사용자 추가(봇용)
```sh
set -a; . ~/.config/solsoop/supabase.env; set +a
curl -X POST "$SUPABASE_URL/auth/v1/admin/users" -H "apikey: $SUPABASE_SERVICE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" -H "Content-Type: application/json" -d '{"email":"EMAIL","password":"PW","email_confirm":true}'
```
