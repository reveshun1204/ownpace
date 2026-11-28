import assert from 'node:assert/strict';
import { sanitizePublicEvents } from '../functions/ownpace-public-events/response.mjs';
const now = Date.parse('2026-11-28T15:00:00Z');
const event = {
  id:'example', title:'競技場 1/2B面',venue:'ももち体育館',
  starts_at:'2026-11-29T19:00:00+09:00',ends_at:'2026-11-29T21:00:00+09:00',
  capacity:18,fee:300,status:'open',confirmed_count:12,remaining:999,
  participants:[{nickname:'PRIVATE'}],line_user_id:'PRIVATE',birthday_month:12,
};
const result=sanitizePublicEvents({events:[event],has_more:false},now);
assert.equal(result.events[0].remaining,6);
assert(!JSON.stringify(result).includes('PRIVATE'));
assert.deepEqual(Object.keys(result.events[0]).sort(),['id','title','venue','starts_at','ends_at','capacity','fee','status','confirmed_count','remaining'].sort());
assert.equal(sanitizePublicEvents({events:[{...event,confirmed_count:20}],has_more:false},now).events[0].remaining,0);
assert.equal(sanitizePublicEvents({events:[event],has_more:false},Date.parse(event.ends_at)).events.length,0);
assert.throws(()=>sanitizePublicEvents({events:[{...event,status:'draft'}],has_more:false},now));
assert.throws(()=>sanitizePublicEvents({events:[{...event,status:'cancelled'}],has_more:false},now));
assert.throws(()=>sanitizePublicEvents({events:[{...event,confirmed_count:-1}],has_more:false},now));
assert.throws(()=>sanitizePublicEvents({events:[{...event,starts_at:'bad'}],has_more:false},now));
assert.throws(()=>sanitizePublicEvents({events:Array(201).fill(event),has_more:false},now));
const reversed=[{...event,id:'later',starts_at:'2026-12-01T19:00:00+09:00',ends_at:'2026-12-01T21:00:00+09:00'},event];
assert.equal(sanitizePublicEvents({events:reversed,has_more:true},now).events[0].id,'example');
console.log('OK public event whitelist, exact safe remaining, end boundary, statuses, limits and sort.');
