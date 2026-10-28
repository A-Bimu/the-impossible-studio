import assert from 'node:assert/strict';
import { test } from 'node:test';
import { addDays, startOfWeek, toISODate, overlaps, canBook, statsFor, seedRecords, SERVICES, validDate, validStoredRecord, validStoredSchedule, dateForCalendarKey } from './app.mjs';

test('week navigation uses Monday first, including month/year boundaries', () => {
  assert.equal(startOfWeek('2026-10-28'),'2026-10-26');
  assert.equal(startOfWeek('2027-01-01'),'2026-12-28');
  assert.equal(addDays('2026-12-31',1),'2027-01-01');
  assert.equal(toISODate(new Date(2026,9,28)),'2026-10-28');
});

test('calendar keyboard navigation crosses week and year boundaries correctly', () => {
  assert.equal(dateForCalendarKey('2026-10-28','ArrowLeft'),'2026-10-27');
  assert.equal(dateForCalendarKey('2026-10-28','ArrowRight'),'2026-10-29');
  assert.equal(dateForCalendarKey('2026-12-30','ArrowDown'),'2027-01-06');
  assert.equal(dateForCalendarKey('2027-01-01','ArrowUp'),'2026-12-25');
  assert.equal(dateForCalendarKey('2027-01-01','Home'),'2026-12-28');
  assert.equal(dateForCalendarKey('2027-01-01','End'),'2027-01-03');
  assert.equal(dateForCalendarKey('2027-01-01','Enter'),null);
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

test('rejects impossible dates and corrupt persisted demo records', () => {
  assert.equal(validDate('2028-02-29'),true);
  for(const bad of ['2026-02-29','2026-02-31','2026-13-01','2026-00-01','0000-01-01','not-a-date']) {
    assert.equal(validDate(bad),false,bad);
    assert.equal(canBook([],{id:'b',date:bad,time:'10:00',service:'facial',status:'booked'}),false,bad);
  }
  const good={id:'a',guest:'Demo guest',date:'2026-10-28',time:'16:00',service:'massage',status:'booked'};
  assert.equal(validStoredRecord(good),true);
  assert.equal(validStoredRecord({...good,time:'17:00'}),false);
  assert.equal(validStoredRecord({...good,time:'16:00',service:'ritual'}),false);
  assert.equal(validStoredRecord({...good,date:'2026-02-31'}),false);
  assert.equal(validStoredRecord({...good,guest:'   '}),false);
  assert.equal(validStoredRecord({...good,status:'unknown'}),false);
});

test('saved schedule rejects duplicate IDs and conflicting active bookings', () => {
  const date='2026-10-28';
  const records=seedRecords(date);
  assert.equal(validStoredSchedule(records),true);
  assert.equal(validStoredSchedule(null),false);
  assert.equal(validStoredSchedule([null]),false);
  assert.equal(validStoredSchedule([...records,{...records[0],date:'2026-10-29'}]),false,'duplicate id');
  assert.equal(validStoredSchedule([...records,{...records[0],id:'another-id'}]),false,'overlapping active booking');
  assert.equal(validStoredSchedule([...records,{...records[0],id:'cancelled-id',status:'cancelled'}]),true,'cancelled records do not block time');
  assert.equal(validStoredSchedule([...records,{...records[0],id:'complete-id',status:'completed'}]),false,'completed appointments still occupy time');
});
