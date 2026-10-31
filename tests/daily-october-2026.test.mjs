import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const read = async path => readFile(new URL('../' + path, import.meta.url), 'utf8');
test('journal explains the two redesigned concepts and links them',async()=>{
const journal=await read('daily/index.html');
for(const path of ['2026-10-30-unfinished-museum/','2026-10-31-night-shift/'])assert.ok(journal.includes('href="./'+path+'"'));
assert.ok(journal.includes('HOTEL NOCTURNE'));
assert.ok(journal.includes('THE MUSEUM OF ALMOSTS'));
});
test('Museum of Almosts presents six illustrated exhibits and real navigation',async()=>{
const html=await read('daily/2026-10-30-unfinished-museum/index.html');
for(const id of ['grid','detail','detailArt','previous','next','print','close'])assert.ok(html.includes('id="'+id+'"'),id);
for(const type of ['clock','map','machine','queue','room','friday'])assert.ok(html.includes("type:'"+type+"'"));
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
