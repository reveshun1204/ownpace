import assert from 'node:assert/strict';
import {upcoming, count, rebalance, get, save} from '../assets/js/demo/store.js';
const event={id:'test',date:'2027-02-17',end:'22:00',capacity:2};
assert(upcoming(event,Date.parse('2027-02-17T21:59:59+09:00')));
assert(!upcoming(event,Date.parse('2027-02-17T22:00:00+09:00')));
assert(upcoming({...event,end:'00:30'},Date.parse('2027-02-16T15:15:00Z')),'JST midnight must not use UTC date');
assert(!upcoming({...event,date:'invalid'}));
const data={events:[event],members:[],bookings:[
 {id:'a',eventId:'test',status:'confirmed',createdAt:1},
 {id:'c',eventId:'test',status:'waiting',createdAt:3},
 {id:'b',eventId:'test',status:'waiting',createdAt:2},
 {id:'other',eventId:'different',status:'confirmed',createdAt:0}
]};
assert.equal(count(data,'test'),1);
rebalance(data,'test');
assert.equal(count(data,'test'),2);
assert.equal(data.bookings.find(b=>b.id==='b').status,'confirmed','earliest waiting booking gets the released seat');
assert.equal(data.bookings.find(b=>b.id==='c').status,'waiting','capacity must not be exceeded');
rebalance(data,'test');assert.equal(count(data,'test'),2);
let stored=null,updates=0,alerts=0;
globalThis.localStorage={getItem:()=>stored,setItem:(_k,v)=>{stored=v}};
globalThis.window={dispatchEvent:()=>updates++};globalThis.alert=()=>alerts++;
assert(save(data));assert.deepEqual(get(),data);assert.equal(updates,1);
globalThis.localStorage.setItem=()=>{throw new Error('QuotaExceeded')};
assert.equal(save(data),false);assert.equal(updates,1);assert.equal(alerts,1);
stored='broken JSON';assert(Array.isArray(get().events));
console.log('OK JST end-time cutoff, FIFO waitlist, capacity, persistence and storage failure.');
