# pro 요금 기능 이식 — 컨텍스트 노트

## 배경
- stay_msg_pro(초창기 앱)를 스테이 솔숲에 붙이려다 방향 전환 — lite1(신형·디자인 완성)에 pro의 요금 엔진만 이식하고 pro는 은퇴.
- pro 쪽엔 산청 문구 제거 커밋(aa306ec)만 남김.

## 결정 사항
1. **옵션요금 단순화** — pro의 dog_max(마릿수 제한)·bbq_billing(포함/별도)·child_fee_on 세분화를 버리고 아동/강아지/바베큐 각각 on-off + 금액만. 이유: lite 철학이 단순화. 강아지는 박당/회당 선택(`dogPerNight`)만 유지 — 실요금 차이가 커서.
2. **기간 요금 위치** — pro는 period 자체에도 price가 있고 room.specialPrices가 오버라이드하는 2단 구조. lite는 room.sp(호실별 기간요금)만 사용, 미설정 시 기본 주중/주말 요금 fallback. 이유: 단일 소스가 이해 쉬움.
3. **periods는 새 storage 키** `stay_msg_lite1_periods_v1` — settings에 안 넣음. 이유: 내보내기/가져오기(exportData) 키 목록에 추가 필요 (확인할 것).
4. **요금 우선순위** — pro와 동일: 기간(성수기>준성수기>특별>할인) > 공휴일(room.ph 설정 시) > 주말(금·토) > 주중. HOLIDAYS 테이블은 lite에 이미 있음(2028년까지).
5. **날짜 선택** — lite의 범용 `openDatePicker(ciId,coId,btnId)` 재사용. 새 달력 안 만듦.
6. **변수 체계 불변** — {주중요금}{주말요금} 외 신규 변수 추가 안 함. 요금 계산 결과는 {결제금액}에 수동/자동 입력되는 흐름.
7. **버전 v2.4.0** — 새 기능(MINOR). push는 사용자 확인 후.

## 이식 원본 참조 (pro index.html)
- getDayType: pro 1177행 / calcNights: 1228행 / buildBreakdownHtml: 1299행
- 연박할인: disc_nights(N박 이상)·disc_type(pct|amt)·disc_val·disc_from_2nd(2박째부터)

# 스테이솔숲 맞춤 다듬기 — 컨텍스트 노트 (2026-10-26)

## 배경
- 10-26 쵸파파 "라이트를 지금 현재 상황에 맞게 다듬어 볼까" — 네이버·에어비앤비·DM 예약 문자를 앱 하나로 관리. pro는 은퇴 유지.
- 문구 기준은 Drive `70_문서/2026-10-24_예약안내-문자/`(10-26 전 채널 통일판)과 `문구_마스터.txt`.

## 결정
1. **기본 템플릿을 솔숲 문장으로 교체** — 새 설치에서도 바로 쓰이게. 단계당 1개(ensureSingleBaseTpl 구조 유지). 문의 답변·바비큐 안내는 봇 초안 → 쵸파파 검토 대상.
2. **`{박수}`·`{인원}` 변수** — 확정 문자 "1박/2인" 표기 때문. `{인원}`은 기존 alias({인원}→{인원수}="2명")를 떼고 "2인"으로 별도 계산. 기존 사용자 템플릿에 {인원}이 있으면 표기가 명→인으로 바뀜(허용).
3. **공휴일 전날 요금** — 숙박 요금은 밤 기준이라 표준은 전날 밤. 솔숲 10-24 결정은 당일+전날. 호실 옵션 `phMode`로 세 가지 다 지원, 기본 both. 공휴일 요금 미입력이면 무시(기존 동작).
4. **예약 채널·메모** — 네이버/에어비앤비 예약은 앱이 못 가져오니 손으로 넣되, 어디서 온 예약인지와 바비큐·반려견 같은 메모가 필요. 작성 탭 "예약 저장"에는 채널 칸 없음(기본 '기타'), 예약 관리 모달에서만 입력.
5. **계좌는 json에 안 넣음** — 쵸파파가 앱 설정에서 직접 입력(기록 최소화 원칙). 현관 비번은 `{전화뒷자리}*` 규칙 문자열만.
6. 버전 v2.5.0(MINOR: 새 필드·변수). push는 승인 뒤. remote URL에 토큰이 박혀 있어 제거 권고(폐기는 GitHub에서 쵸파파).

## 구현 메모 (10-26)
- 편집은 스크립트(`lite_edit.py`, 세션 스크래치)로 문자열 치환 + assert — 치환 지점: STAGES 블록 전체, VAR_LIST/VAR_ALIAS/applyVars, HOLIDAYS 배열, getDayTypeFor(+nextDay 헬퍼), migrateSettings, 호실 편집기(ri_phmode_), _readRoomPricing, renderDashCal 라벨, addResvModal HTML(ar_channel/ar_memo), openAddResvModal/editResv/submitAddResv, renderReservations, CSS .tag-ch, 도움말 li, APP_VERSION. sw.js v79.
- QA(로컬 http.server + ego-browser, 가져오기 json 실제 업로드): 12/24·12/31·2027-02-05·2027-10-10 → "공휴일 전날 230,000", 12/25 → "공휴일", 11-06~08 2박 → 주말 460,000−30,000, 반려견 1회 20,000·바비큐 20,000 합산 OK. phMode eve면 25일 밤은 주말로 떨어짐(의도). 확정 문자 치환 "1박/2인", 입실안내 "현관비번: 1222*", 주소·wifi 치환 OK. 예약 목록 채널 태그 3개·메모 표시, 12월 대시보드 "공휴일 전날" 라벨 2개(24·31).
- 가져오기 json은 Drive `90_참고/2026-04-20_스테이메시지-앱자료/솔숲_설정_2026-10-26.json`. tpl.customs={}라 폰에 있던 사용자 추가 템플릿은 지워짐(솔숲 전용 전환이라 허용). 계좌 비움.
- 다음(2·3단계)은 별도 프로젝트: 구글 시트 저장소 + 맥 봇(10분 폴링 수집, 알리고 발송, 채널 날짜 마감). 라이트는 그때 시트 백엔드로 바꾸거나 입력 전용으로 축소.
- 10-26 17:0x v2.5.1: 쵸파파 요금 규칙 확정 "다음 날 쉬는 밤이면 주말 요금" → phMode 기본 'eve'(선택지 순서도 전날 밤만 먼저), 문의 템플릿 "금·토·공휴일 전날". json도 eve. sw v80.

# 2단계 Supabase — 컨텍스트 노트 (2026-10-26 밤)

## 왜 Supabase(시트 아님)
PC 주력 + 폰 + 맥 봇 세 곳에서 같은 예약을 읽고 씀. 손님 전화번호라 로그인·RLS 필요. 홈페이지(Next.js) 백엔드로 재사용. 시트는 Apps Script URL 하나로 열려 보안이 약하고 나중에 또 옮겨야 함.

## 설계 결정
1. **표는 3개만**: reservations(앱 필드 그대로 + status/source_id), messages(발송 이력, 봇도 씀), app_settings(settings·tpl·periods를 jsonb 통째). guests 별도 표 없음 — 예약에서 파생(자동완성은 예약 이름·전화로).
2. **가격·인원은 문자열 그대로**("200,000원", "2명") — 앱 코드가 그 포맷에 의존, 바꾸면 리팩터 커짐. 계산은 parseNum.
3. **동기화 방식 = 캐시 write-through**: 기존 코드의 localStorage를 캐시로 두고, 로그인 뒤 서버 → 캐시 채움, save* 뒤에 서버 upsert. 화면·함수 거의 안 건드림. 충돌은 "마지막 저장 우선"(사용자 둘뿐).
4. **인증**: 이메일+비밀번호 2계정, 가입 차단. anon 키는 공개 키라 코드에 박아도 됨(RLS가 지킴). service_role 키는 봇 전용, 맥 env만.
5. **봇 중복 방지**: source_id(네이버 예약번호/에어비앤비 코드) unique.

## 2026-10-27 Supabase 프로젝트 봇이 직접 생성
- 쵸파파 "니가 해봐라" → ego-browser(공간 35, 이미 로그인된 크롬 프로필)로 chopa-pa's Org에 `solsoop` 프로젝트 생성(Seoul, Free, Data API 켬, 자동 RLS 켬). 기존 프로젝트 1개는 gscmedc.org 허브(tqekuhtofvgzycstwdbz).
- 폼 주의: 프로젝트명 fill이 기존값 뒤에 붙어 `staysolsoopsolsoop`가 됨 → focus+⌘A+type으로 교체. 지역은 「Need a specific region?」 눌러 listboxoption "Northeast Asia (Seoul)" 선택.
- 키: 새 방식 publishable(sb_publishable_…)과 레거시 anon/service_role JWT 둘 다 있음. 앱은 supabase-js 2.49.1이라 **레거시 anon JWT** 주입(publishable 키 호환은 더 새 버전 필요). secret 키(sb_secret_)는 Reveal 버튼이 DOM 재생성돼 못 읽음 — 필요 없음(service_role로 충분).
- SQL Editor: Monaco에 keyboard.paste로 붙이고 ⌘↵ → "Potential issue detected"(drop … if exists 때문) 모달 → Run query. innerText로는 가상화 때문에 확인 불가 → REST로 테이블 존재 확인(service 200, anon 200 []).
- Auth 설정 페이지 URL은 `/auth/providers`(sign-in-up은 404). Allow new users 스위치 id `_r_42_-form-item` → 끔 → Save changes → 새로고침 false 확인 → signup API 422 `signup_disabled`.
- 사용자는 admin API(`/auth/v1/admin/users`, email_confirm true)로 생성, 비밀번호 로그인 → access_token → RLS 읽기 200 확인. 비밀번호는 env 파일에만(APP_USER1_PASSWORD). 쵸파맘 이메일 미정.
- push 거부: GitHub가 Pages 도메인 재저장 때 CNAME 삭제·재생성 커밋 2개 만듦(개행만 차이) → rebase 후 push. 배포 60초 뒤 msg.staysolsoop.kr에 새 URL 반영 확인.
- 10-27 쵸파파 "gscmedc 계정은 내 계정이 아니야"(사회적협동조합 계정, Claude Code 로그인용일 뿐) → 삭제하고 lottopet@gmail.com(쵸파파)·leechopa01@gmail.com(쵸파맘) 2명 생성, 각각 로그인·읽기 200 확인. 이메일은 식별자일 뿐 메일 안 감. 계정 지도는 메모리 stay-solsoop-team 참고.
- 10-27 쵸파파 "쵸파맘 계정도 그거 아냐" → leechopa01 삭제, 쵸파맘은 솔숲 공용 staysolsoop@gmail.com으로 생성(식별자일 뿐). 메모리의 'leechopa01=쵸파맘' 표기 틀림 → 수정.
- 10-27 쵸파맘 계정 확정 withzoo2018@gmail.com(쵸파파 제공) → staysolsoop 삭제, 재생성·로그인 확인.
