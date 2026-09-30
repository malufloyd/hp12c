// VERSION is stamped automatically from the precached files' contents: run `npm run stamp` before every deploy
// (tests fail when it is stale).
const VERSION = 'v9fc8454040';
const CACHE = `hp12c-${VERSION}`;
const PRECACHE = [
  './',
  'index.html',
  'styles.css',
  'manifest.webmanifest',
  'src/display.js',
  'src/engine/alg.js',
  'src/engine/all-ops.js',
  'src/engine/bonds.js',
  'src/engine/calculator.js',
  'src/engine/cashflow.js',
  'src/engine/clear.js',
  'src/engine/dates.js',
  'src/engine/depreciation.js',
  'src/engine/finance.js',
  'src/engine/keys.js',
  'src/engine/mathfn.js',
  'src/engine/number.js',
  'src/engine/ops-basic.js',
  'src/engine/power.js',
  'src/engine/program.js',
  'src/engine/resolve.js',
  'src/engine/solve.js',
  'src/engine/state.js',
  'src/engine/stats.js',
  'src/main.js',
  'src/storage.js',
  'src/ui/calculator-view.js',
  'src/ui/geometry.js',
  'src/ui/input.js',
  'src/ui/lcd.js',
  'src/ui/sound.js',
  'vendor/decimal.mjs',
  'icons/icon-180.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).catch(() =>
    e.request.mode === 'navigate' ? caches.match('./index.html') : Response.error())));
});
