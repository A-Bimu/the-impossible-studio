import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const read = async path => readFile(new URL('../' + path, import.meta.url), 'utf8');
test('daily journal lists both October projects', async () => {
  const journal = await read('daily/index.html');
  for(const path of ['2026-10-30-unfinished-museum/','2026-10-31-night-shift/']) {
    assert.ok(journal.includes('href="./' + path + '"'), path + ' is linked');
  }
});
test('unfinished museum has filter, search and print controls', async () => {
  const html = await read('daily/2026-10-30-unfinished-museum/index.html');
  for(const id of ['collection','search','detail','print','prev','next']) assert.match(html,new RegExp('id="' + id + '"'));
  assert.ok((html.match(/id:'0[1-6]'/g)||[]).length === 6);
  assert.ok(html.includes('dialog.showModal()'));
});
test('night shift has guest entry, availability and printable art', async () => {
  const html = await read('daily/2026-10-31-night-shift/index.html');
  for(const id of ['rooms','ledger','booking','form','reset','print']) assert.match(html,new RegExp('id="' + id + '"'));
  assert.ok(html.includes('new FormData('));
  assert.ok(html.includes('bookings.some('));
  assert.ok(html.includes('@media print'));
});
