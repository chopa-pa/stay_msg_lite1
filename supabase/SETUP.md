# Supabase 설정 순서 (쵸파파용, 2026-10-26)

## 1. 프로젝트 만들기
1. supabase.com → Start your project → GitHub(chopa-pa)로 로그인.
2. New project → Name `staysolsoop` → Database password 「Generate」 → Region **Northeast Asia (Seoul)** → Free → Create. 2분 대기.

## 2. 키 전달
- Project Settings(⚙) → API.
- **Project URL**, **anon public** → 봇(채팅)에 전달. 공개 키라 괜찮음.
- **service_role** → 채팅 금지. 맥 `~/.config/solsoop/supabase.env`의 `SUPABASE_SERVICE_KEY=` 뒤에 붙여넣기.

## 3. 표 만들기
- 왼쪽 SQL Editor → New query → `supabase/schema.sql` 내용 전체 붙여넣기 → Run. "Success" 확인.
  (봇이 service 키로 대신 실행할 수도 있음)

## 4. 로그인 계정
- Authentication → Providers → Email 켜짐 확인. 「Confirm email」 끔(초대 메일 안 받아도 되게).
- Authentication → Sign In / Up → 「Allow new users to sign up」 **끔**.
- Authentication → Users → Add user → Create new user → 이메일·비밀번호 입력(쵸파파 1명, 쵸파맘 1명). 「Auto Confirm User」 체크.

## 5. 앱 연결(봇)
- index.html의 `__SB_URL__`·`__SB_ANON__`을 실제 값으로 바꿔 push → msg.staysolsoop.kr 새로고침 → 로그인 화면.
- PC에서 로그인 → "서버가 비어 있습니다. 올릴까요?" → 확인(이 기기 데이터가 서버로 감). 다른 기기는 로그인만 하면 같은 데이터.
