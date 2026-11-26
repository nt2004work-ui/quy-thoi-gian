// Service worker: lưu sẵn "vỏ" ứng dụng để mở được khi không có mạng.
// KHÔNG lưu phản hồi của Supabase (dữ liệu luôn lấy mới từ máy chủ; bản đọc ngoại tuyến do app tự giữ).
// Đổi số VERSION mỗi khi sửa file trong danh sách để máy người dùng tải bản mới.
const VERSION = 'v4';
const CACHE = 'quy-thoi-gian-' + VERSION;
const SHELL = [
  './', './index.html', './manifest.webmanifest', './vendor/supabase.min.js',
  './icons/favicon.svg', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png',
  './fonts/be-vietnam-pro-latin-400-normal.woff2', './fonts/be-vietnam-pro-latin-500-normal.woff2', './fonts/be-vietnam-pro-latin-700-normal.woff2',
  './fonts/be-vietnam-pro-vietnamese-400-normal.woff2', './fonts/be-vietnam-pro-vietnamese-500-normal.woff2', './fonts/be-vietnam-pro-vietnamese-700-normal.woff2',
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return; // Supabase đi thẳng ra mạng
  if (req.mode === 'navigate') {
    // Ưu tiên bản mới từ mạng, mất mạng thì dùng bản đã lưu.
    e.respondWith(fetch(req).then(r => { caches.open(CACHE).then(c => c.put('./index.html', r.clone())); return r; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    if (r.ok) caches.open(CACHE).then(c => c.put(req, r.clone()));
    return r;
  })));
});
