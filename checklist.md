# pro 요금 기능 → lite1 이식 체크리스트 (v2.4.0)

## 1. 데이터 모델
- [x] room 필드 확장: `ph`(공휴일요금) `base`(기준인원) `max`(최대인원) `extraFee`(초과 1인/박) `discN` `discType` `discVal` `disc2nd` `sp`(기간별 요금 맵)
- [x] settings 옵션요금: `childOn` `childFee` `dogOn` `dogFee` `dogPerNight` `bbqOn` `bbqFee`
- [x] `SK_PER` 신규 키 + periods 배열 load/save
- [x] migrateSettings에서 신규 필드 기본값 채움

## 2. 요금 엔진 (pro에서 이식)
- [x] `getDatesBetween(ci,co)`
- [x] `getDayType(room,ds)` — 기간(성수기>준성수기>특별>할인) > 공휴일 > 주말(금·토) > 주중
- [x] `calcStay(room,ci,co,guests,child,dog,bbq)` — 일별 합산 + 연박할인 + 옵션요금 → {total,nights,lines}
- [x] 명세 HTML 렌더러 (lite 디자인 토큰)

## 3. 숙소 프로필 UI
- [x] 호실 편집기: 공휴일 요금·기준/최대인원·추가인원 요금·연박할인 필드
- [x] 호실 편집기: 등록된 기간별 요금 입력 (기간 있을 때만 노출)
- [x] "특별 기간" 카드: 4종(성수기/준성수기/특별/할인) CRUD
- [x] "옵션 요금" 카드: 아동/강아지/바베큐 on-off + 금액
- [x] saveRoom/saveRoomSingle/addRoom에 신규 필드 반영

## 4. 요금 계산 페이지
- [x] `page-price` 신규 + 사이드바/하단네비 "요금" 항목
- [x] 호실 선택 + 날짜범위(openDatePicker 재사용) + 인원 + 아동/강아지/바베큐 카운터
- [x] 명세 카드 출력

## 5. 예약 폼 연동
- [x] addResvModal에 자동 계산 — 호실+날짜 선택 시 ar_price 자동 채움 + 명세 표시

## 6. 릴리스
- [x] APP_VERSION v2.3.8 → v2.4.0
- [x] sw.js CACHE_NAME bump
- [x] node --check 문법 검증
- [x] 브라우저 QA (요금 계산 시나리오)
- [x] 도움말(guide) 페이지에 요금 기능 설명 추가
- [x] 커밋 → "업로드 할까요?" 질문 후 push

## 후속 (이번 범위 제외)
- 대시보드 캘린더에 기간 배경색 표시
- 요금계산 결과 → 문자 작성 {결제금액} 바로 넣기 버튼

# 스테이솔숲 맞춤 다듬기 (v2.5.0, 2026-10-26)

## 1. 기본값 = 솔숲
- [x] STAGES 기본 템플릿 6단계 → 솔숲 통일 문자(입금안내·예약확정·입실안내·퇴실안내 + 문의 답변 초안 + 바비큐 안내)
- [x] 변수 추가 `{박수}`(퇴실−입실 일수) · `{인원}`("2인" 표기, 기존 alias 제거)
- [x] HOLIDAYS 2026·2027 대체공휴일 보강(3/2·5/25·8/17·10/5, 2027 2/9·8/16·10/4·10/11·12/27)

## 2. 기능
- [x] 호실 요금: 공휴일 적용 방식 `phMode` (both=당일+전날 / eve=전날만 / day=당일만), getDayTypeFor 반영, 대시보드 달력 "전날" 라벨
- [x] 예약: 채널(`channel`: 네이버예약/에어비앤비/인스타 DM/전화/기타) + 메모(`memo`) — 모달 입력·수정·목록 표시

## 3. 데이터
- [x] 가져오기 json `솔숲_설정_2026-10-26.json` — 숙소·객실 1·옵션요금·템플릿·예약 3건(황은하 11-01 네이버, 김진이 11-02 네이버, 염정민 11-07 DM). 계좌는 비움(쵸파파 직접)

## 4. 릴리스
- [x] APP_VERSION v2.5.0, sw.js CACHE_NAME v79
- [x] `node --check` + 브라우저 QA(요금 계산 12/24·12/31·설 연휴, 가져오기, 예약 채널 표시)
- [x] 도움말에 공휴일 전날·채널 한 줄
- [ ] 커밋 → push는 쵸파파 승인 뒤 (remote 토큰 제거 포함)
