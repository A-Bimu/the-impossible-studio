import assert from 'node:assert/strict';
import { test } from 'node:test';
import { addDays, startOfWeek, toISODate, overlaps, canBook, statsFor, seedRecords, SERVICES } from './app.mjs';

test('week navigation uses Monday first, including month/year boundaries', () => {
  assert.equal(startOfWeek('2026-10-28'),'2026-10-26');
  assert.equal(startOfWeek('2027-01-01'),'2026-12-28');
  assert.equal(addDays('2026-12-31',1),'2027-01-01');
  assert.equal(toISODate(new Date(2026,9,28)),'2026-10-28');
});

test('fictional seed data has known services and valid non-overlapping times', () => {
  const records=seedRecords('2026-10-28');
  assert.equal(records.length,5);
  for(const item of records){
    assert.ok(SERVICES.some(service=>service.id===item.service));
    assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(item.date));
  }
  for(let i=0;i<records.length;i++)for(let j=i+1;j<records.length;j++)assert.equal(overlaps(records[i],records[j]),false);
});

test('rejects overlapping services, including different start times', () => {
  const existing=[{id:'a',date:'2026-10-28',time:'11:00',service:'ritual',status:'booked'}];
  assert.equal(canBook(existing,{id:'b',date:'2026-10-28',time:'11:00',service:'facial',status:'booked'}),false);
  assert.equal(canBook(existing,{id:'b',date:'2026-10-28',time:'12:00',service:'facial',status:'booked'}),false);
  assert.equal(canBook(existing,{id:'b',date:'2026-10-28',time:'10:00',service:'facial',status:'booked'}),true);
  assert.equal(canBook(existing,{id:'b',date:'2026-10-29',time:'11:00',service:'facial',status:'booked'}),true);
});

test('allows rebooking cancelled slots and rejects sessions beyond closing', () => {
  const cancelled=[{id:'a',date:'2026-10-28',time:'09:00',service:'massage',status:'cancelled'}];
  assert.equal(canBook(cancelled,{id:'b',date:'2026-10-28',time:'09:00',service:'facial',status:'booked'}),true);
  assert.equal(canBook([],{id:'b',date:'2026-10-28',time:'16:00',service:'ritual',status:'booked'}),false);
  assert.equal(canBook([],{id:'b',date:'2026-10-28',time:'16:00',service:'massage',status:'booked'}),true);
  assert.equal(canBook([],{id:'b',date:'2026-10-28',time:'18:00',service:'massage',status:'booked'}),false);
});

test('daily metrics exclude cancellations and never call scheduled value revenue', () => {
  const date='2026-10-28';
  const records=[
    {id:'a',date,time:'09:00',service:'facial',status:'completed'},
    {id:'b',date,time:'11:00',service:'massage',status:'booked'},
    {id:'c',date,time:'13:00',service:'ritual',status:'cancelled'}
  ];
  assert.deepEqual(statsFor(records,date),{bookings:2,completed:1,value:8300,available:6});
  assert.deepEqual(statsFor(records,'2026-10-29'),{bookings:0,completed:0,value:0,available:8});
});
