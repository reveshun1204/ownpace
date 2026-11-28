import {createLineSession} from '../member/auth.js';
import {application} from '../config/application.js';
import {birthFields,bindBirth} from './rewards.js';
import {esc} from './store.js';
const $=s=>document.querySelector(s);
const nickname=$('#nickname'), status=$('#profile-status'), saveProfile=$('#save-profile'), list=$('#events');
const endpoint='https://buptdnjahvwauslaanyo.supabase.co/functions/v1/ownpace-api';
let activeName='', events=[], busy=false;
let view = 'booking';

function readView() {
  return new URLSearchParams(location.search).get('view') === 'my-booking'
    ? 'my-booking'
    : 'booking';
}

function updateView() {
  const isMyBooking = view === 'my-booking';

  $('#booking-heading').textContent =
    isMyBooking ? 'MY BOOKING' : 'UPCOMING GAMES';

  $('#show-booking').classList.toggle('is-active', !isMyBooking);
  $('#show-my-booking').classList.toggle('is-active', isMyBooking);

  $('#show-booking').setAttribute('aria-pressed', String(!isMyBooking));
  $('#show-my-booking').setAttribute('aria-pressed', String(isMyBooking));
}

function changeView(nextView) {
  if (busy) return;

  view = nextView;

  const url = new URL(location.href);

  if (view === 'my-booking') {
    url.searchParams.set('view', 'my-booking');
  } else {
    url.searchParams.delete('view');
  }

  history.replaceState(history.state, '', url.toString());

  render();
}

$('#show-booking').onclick = () => changeView('booking');
$('#show-my-booking').onclick = () => changeView('my-booking');
const session=createLineSession({liffId:application.reservationLiffId,onAuthRequired:mode=>{
 activeName='';events=[];list.replaceChildren();list.hidden=true;$('#profile-panel').hidden=true;$('#member-nav').hidden=true;setProfileState('anonymous');
 $('#login-panel').hidden=false;const button=$('#line-login');button.hidden=mode==='client';button.textContent='LINEでログイン';
 $('#login-status').textContent=mode==='client'?'認証を更新するには、予約用LIFFをLINEから開き直してください。':'LINEでログインしてください。';
}});
const api=(action,fields={})=>session.request(action,fields);
const dateFormat=new Intl.DateTimeFormat('ja-JP',{timeZone:'Asia/Tokyo',month:'long',day:'numeric',weekday:'short'});
const timeFormat=new Intl.DateTimeFormat('ja-JP',{timeZone:'Asia/Tokyo',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
function setProfileState(state){
 document.body.dataset.authState=state;
 if(state!=='registered'){$('#member-nav').hidden=true;$('#booking-heading').hidden=true;list.hidden=true;}
 $('#login-panel').hidden=state==='registered'||state==='unregistered';
 $('#profile-panel').hidden=state!=='registered'&&state!=='unregistered';
 $('#profile-fields').hidden=state!=='unregistered';
 $('#registered-member').hidden=state!=='registered';
}
function registered(name){
 activeName=name;setProfileState('registered');$('#welcome-name').textContent=name;
 $('#member-nav').hidden=false;$('#booking-heading').hidden=false;list.hidden=false;
 $('#birth-initial').hidden=true;nickname.value=name;nickname.disabled=true;saveProfile.disabled=true;
 status.textContent='';
}
function render(){
 updateView();

 const visibleEvents = view === 'my-booking'
   ? events.filter(e =>
       e.my_status === 'confirmed' ||
       e.my_status === 'waitlisted'
     )
   : events;

 list.innerHTML=visibleEvents.map(e=>{
 const full=e.remaining<=0, mine=e.my_status, closed=e.status!=='open';
 return `<article class="card"><div class="between"><p class="eyebrow">GAME DAY</p><span class="pill ${full?'full':''}">${closed?'受付停止':full?'満員 / WAITLIST':'受付中'}</span></div><h2>${esc(dateFormat.format(new Date(e.starts_at)))}</h2><p class="muted">${esc(timeFormat.format(new Date(e.starts_at)))}–${esc(timeFormat.format(new Date(e.ends_at)))}<br>${esc(e.venue)}<br>参加費 ¥${Number(e.fee).toLocaleString()}</p><div class="between"><strong>参加 ${Number(e.confirmed_count)} / ${Number(e.capacity)}人</strong><span class="status">残り ${Number(e.remaining)}枠</span></div><div class="bar"><span style="width:${Math.max(0,Math.min(100,e.confirmed_count/e.capacity*100))}%"></span></div><details><summary>参加者一覧（${Number(e.confirmed_count)}人）</summary><div class="names">${e.participants.length?e.participants.map(p=>`<span class="name">${esc(p.nickname)}</span>`).join(''):'<span class="muted">まだ参加者はいません</span>'}</div></details>${e.waiting_count?`<p class="muted">キャンセル待ち：${Number(e.waiting_count)}人</p>`:''}${mine?`<p class="status">あなたの状態：${mine==='confirmed'?'参加確定':'キャンセル待ち（'+Number(e.my_waiting_position)+'番目）'}</p>`:''}<div class="actions"><button class="btn ${mine?'danger':''}" data-action="${mine?'cancel':'book'}" data-event="${esc(e.id)}" ${busy||!activeName||(!mine&&closed)?'disabled':''}>${mine?'予約をキャンセル':full?'キャンセル待ちに登録':'この日程を予約する'}</button></div></article>`;
 }).join('') || (
  view === 'my-booking'
    ? '<div class="empty">現在予約中の日程はありません。</div>'
    : '<div class="empty">現在公開中の開催日はありません。</div>'
);
}
async function refresh(){events=(await api('events')).events;render();}
$('#line-login').onclick=()=>{try{session.login();}catch(e){$('#login-status').textContent=e.message;}};
async function init(){
 if(location.hash==='#my-page'){location.replace('../mypage/');return;}
try{
  if(!await session.start())return;
  view = readView();
  updateView();
  const p=await api('profile');
  if(p.registered){registered(p.nickname);await refresh();return;}
  setProfileState('unregistered');nickname.value=(p.displayName||'').slice(0,24);nickname.disabled=false;
  $('#birth-initial').hidden=false;$('#birth-initial').innerHTML=birthFields();const readBirth=bindBirth($('#birth-initial'));
  saveProfile.disabled=false;status.textContent='初回の表示名を確認してください';
  saveProfile.onclick=async()=>{
   const name=nickname.value.trim();if(!name||name.length>24){status.textContent='名前を1〜24文字で入力してください。';return;}
   let birth;try{birth=readBirth();}catch(e){status.textContent=e.message;return;}
   saveProfile.disabled=true;nickname.disabled=true;
   try{const r=await api('register',{nickname:name,...birth});registered(r.nickname);await refresh();}
   catch(e){status.textContent=e.message;if(!activeName){nickname.disabled=false;saveProfile.disabled=false;}}
  };
 }catch(e){
  if(activeName){status.textContent=e.message;list.textContent='開催日程を取得できませんでした。';}
  else{setProfileState('error');$('#login-status').textContent=e.message;$('#line-login').hidden=session.isInClient;}
 }
}
list.addEventListener('click',async ev=>{const btn=ev.target.closest('[data-action]');if(!btn||busy||!activeName)return;const action=btn.dataset.action;if(!confirm(action==='cancel'?'この予約をキャンセルしますか？':'この日程で参加予約しますか？ 満員時はキャンセル待ちになります。'))return;busy=true;list.querySelectorAll('button').forEach(b=>b.disabled=true);btn.textContent=action==='book'?'予約処理中…':'キャンセル処理中…';let done=false;try{const r=await api(action,{eventId:btn.dataset.event});done=true;status.textContent=r.status==='confirmed'?'参加予約が確定しました':r.status==='waitlisted'?'キャンセル待ちに登録しました':'予約をキャンセルしました';await refresh();}catch{status.textContent=done?'処理は完了しましたが、一覧を更新できません。開き直してください。':'処理結果を確認できません。予約状況を確認してください。';try{await refresh();}catch{list.textContent='予約状況を取得できません。ページを開き直してください。';events=[];}}finally{busy=false;if(events.length)render();}});

init();
