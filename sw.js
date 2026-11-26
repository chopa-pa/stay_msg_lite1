const CACHE_NAME = 'stay_msg_lite1-v196';
const ASSETS = ['./index.html', './manifest.json', './icon-192.png', './icon-512.png', './favicon-32.png'];
// 서버 연결 모듈(supabase-js)은 앱 캐시와 따로 둠(v1.28.0) → 앱 버전을 올려도 안 지워져, 인터넷이 약해도 앱이 서버와 이어짐. 주소는 index.html의 script와 같아야 함
const CDN_CACHE = 'stay_msg_cdn-v1';
const CDN_ASSETS = ['https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1/dist/umd/supabase.min.js'];

self.addEventListener('install', e => {
  e.waitUntil(Promise.all([
    caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)),
    caches.open(CDN_CACHE).then(c => Promise.all(CDN_ASSETS.map(u => c.match(u).then(hit => hit || c.add(new Request(u, { mode: 'cors' })))))).catch(() => {})   // 못 받아도 설치는 계속
  ]));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE_NAME && k !== CDN_CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if(e.request.mode === 'navigate'){
    // HTML은 항상 네트워크 우선 → 최신 버전 보장
    e.respondWith(
      fetch(e.request).then(res => {
        if(res.ok){ const clone = res.clone(); e.waitUntil(caches.open(CACHE_NAME).then(c => c.put(e.request, clone))); }   // 오류 페이지는 저장하지 않음
        return res;
      }).catch(() => caches.match(e.request))
    );
  } else if(CDN_ASSETS.includes(e.request.url)){
    // 주소에 버전이 박혀 있어 내용이 안 바뀜 → 저장본 우선. 정상 응답(res.ok)만 저장(불투명·오류 응답은 저장하지 않음)
    e.respondWith(caches.match(e.request).then(c => c || fetch(e.request).then(res => {
      if(res.ok){ const clone = res.clone(); e.waitUntil(caches.open(CDN_CACHE).then(k => k.put(e.request, clone))); }
      return res;
    })));
  } else {
    e.respondWith(caches.match(e.request).then(c => c || fetch(e.request)));
  }
});
