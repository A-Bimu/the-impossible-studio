import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8');
test('journal preserves approved Hotel Nocturne and excludes rejected concepts',async()=>{
 const journal=await read('daily/index.html');
 assert.ok(journal.includes('HOTEL NOCTURNE'));
 assert.ok(journal.includes('href="./2026-10-31-night-shift/"'));
 for(const name of ['CUTSCENE','AFTERFORM','NO SIGNAL','THE DEPARTMENT OF DELAY']) assert.ok(!journal.includes(name));
});
test('Hotel Nocturne still has a guest-facing booking experience',async()=>{
 const html=await read('daily/2026-10-31-night-shift/index.html');
 for(const id of ['searchForm','roomGrid','checkin','checkout','guests','reservation','reservationForm','guestName','guestEmail','confirmation'])assert.ok(html.includes('id="'+id+'"'),id);
 assert.ok(html.includes('room.price*nights'));
 assert.ok(html.includes('dialog.showModal()'));
});
