import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
const root = new URL('../', import.meta.url).pathname;
const list = [...sw.match(/PRECACHE = \[([\s\S]*?)\]/)[1].matchAll(/'([^']+)'/g)].map(m => m[1]);

test('every precache entry exists on disk', () => {
  for (const f of list) assert.ok(existsSync(root + (f === './' ? 'index.html' : f)), f);
});
test('every tracked app file is precached', () => {
  const tracked = execFileSync('git', ['ls-files', 'src', 'vendor', 'index.html', 'styles.css', 'manifest.webmanifest'], { cwd: root, encoding: 'utf8' }).split('\n').filter(Boolean);
  for (const f of tracked) assert.ok(list.includes(f), `missing from PRECACHE: ${f}`);
});
