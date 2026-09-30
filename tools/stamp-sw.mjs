// Stamps sw.js with a VERSION derived from the contents of every precached file, so a deploy that
// changes any app file always changes the cache name. Run: npm run stamp
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);

export function precacheList(sw) {
  return [...sw.match(/PRECACHE = \[([\s\S]*?)\]/)[1].matchAll(/'([^']+)'/g)].map(m => m[1]);
}

export function computeVersion(rootUrl = root) {
  const sw = readFileSync(new URL('sw.js', rootUrl), 'utf8');
  const files = [...new Set(precacheList(sw).map(f => (f === './' ? 'index.html' : f)))].sort();
  const h = createHash('sha256');
  for (const f of files) { h.update(f + '\0'); h.update(readFileSync(new URL(f, rootUrl))); h.update('\0'); }
  return 'v' + h.digest('hex').slice(0, 10);
}

export function currentVersion(rootUrl = root) {
  return readFileSync(new URL('sw.js', rootUrl), 'utf8').match(/const VERSION = '([^']*)'/)[1];
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const file = new URL('sw.js', root);
  const v = computeVersion();
  const src = readFileSync(file, 'utf8');
  writeFileSync(file, src.replace(/const VERSION = '[^']*';/, `const VERSION = '${v}';`));
  console.log('sw.js VERSION =', v);
}
