# 동기화 계층 모의 테스트 (v3.1.0, 2026-10-27)
`sync_mock_supabase.js`를 `Page.addScriptToEvaluateOnNewDocument`로 주입하고 `*supabase-js*` CDN을 차단하면 `window.supabase`가 메모리 DB 모의 클라이언트가 됨.
절차: `python3 -m http.server 8765` → ego-browser로 `http://127.0.0.1:8765/index.html` 열기 → page.evaluate에서 시나리오 A~H(저장 경로·편집 중 보호·삭제 실패 재시도·pull 중 저장·status 보존·이력 트림·로그아웃) 확인. 10-27 18개 PASS.
실서버 로그인은 봇이 하지 않음(쵸파파 PC/폰에서 확인).
