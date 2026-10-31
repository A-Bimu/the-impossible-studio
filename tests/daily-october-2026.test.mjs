import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const read = async path => readFile(new URL('../' + path, import.meta.url), 'utf8');
test('journal explains the two redesigned concepts and links them',async()=>{
const journal=await read('daily/index.html');
for(const path of ['2026-10-30-unfinished-museum/','2026-10-31-night-shift/'])assert.ok(journal.includes('href="./'+path+'"'));
assert.ok(journal.includes('HOTEL NOCTURNE'));
assert.ok(journal.includes('THE DEPARTMENT OF DELAY'));
});
test('Department of Delay presents six original graphic posters and working navigation',async()=>{
const html=await read('daily/2026-10-30-unfinished-museum/index.html');
for(const id of ['grid','detail','symbol','prev','next','print','close'])assert.ok(html.includes('id="'+id+'"'),id);
assert.ok((html.match(/\['0[1-6]'/g)||[]).length===6);
assert.ok(html.includes('dialog.showModal()'));
assert.ok(html.includes('aria-label'));
});
test('Hotel Nocturne is a guest-facing booking experience with demo confirmation',async()=>{
const html=await read('daily/2026-10-31-night-shift/index.html');
for(const id of ['searchForm','roomGrid','checkin','checkout','guests','reservation','reservationForm','guestName','guestEmail','confirmation'])assert.ok(html.includes('id="'+id+'"'),id);
assert.ok(!html.includes('id="ledger"'),'old staff ledger must be removed');
assert.ok(html.includes('room.price*nights'));
assert.ok(html.includes('no payment'));
assert.ok(html.includes('dialog.showModal()'));
});
