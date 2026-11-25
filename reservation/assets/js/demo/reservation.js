import {esc} from './store.js';
const $=s=>document.querySelector(s);
const nickname=$('#nickname'), status=$('#profile-status'), saveProfile=$('#save-profile'), list=$('#events');
const endpoint='https://buptdnjahvwauslaanyo.supabase.co/functions/v1/ownpace-api';
let activeName='', events=[], busy=false;
async function api(action, fields={}) {
  const idToken=window.liff.getIDToken();
  if(!idToken) throw new Error('LINE login required');
  const res=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,idToken,...fields}),cache:'no-store',signal:AbortSignal.timeout(20000)});
  const data=await res.json();
  if(!res.ok||data.success!==true) throw new Error(data.error||'Request failed');
  return data;
}
const dateFormat=new Intl.DateTimeFormat('ja-JP',{timeZone:'Asia/Tokyo',month:'long',day:'numeric',weekday:'short'});
const timeFormat=new Intl.DateTimeFormat('ja-JP',{timeZone:'Asia/Tokyo',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
function registered(name){activeName=name;nickname.value=name;nickname.disabled=true;saveProfile.disabled=true;saveProfile.textContent='登録済み';status.textContent=`「${name}」で利用中（サーバー認証成功）`;}
function render(){list.innerHTML=events.map(e=>{
 const full=e.remaining<=0, mine=e.my_status, closed=e.status!=='open';
 return `<article class="card"><div class="between"><p class="eyebrow">GAME DAY</p><span class="pill ${full?'full':''}">${closed?'受付停止':full?'満員 / WAITLIST':'受付中'}</span></div><h2>${esc(dateFormat.format(new Date(e.starts_at)))}</h2><p class="muted">${esc(timeFormat.format(new Date(e.starts_at)))}–${esc(timeFormat.format(new Date(e.ends_at)))}<br>${esc(e.venue)}<br>参加費 ¥${Number(e.fee).toLocaleString()}</p><div class="between"><strong>参加 ${Number(e.confirmed_count)} / ${Number(e.capacity)}人</strong><span class="status">残り ${Number(e.remaining)}枠</span></div><div class="bar"><span style="width:${Math.max(0,Math.min(100,e.confirmed_count/e.capacity*100))}%"></span></div><details><summary>参加者一覧（${Number(e.confirmed_count)}人）</summary><div class="names">${e.participants.length?e.participants.map(p=>`<span class="name">${esc(p.nickname)}</span>`).join(''):'<span class="muted">まだ参加者はいません</span>'}</div></details>${e.waiting_count?`<p class="muted">キャンセル待ち：${Number(e.waiting_count)}人</p>`:''}${mine?`<p class="status">あなたの状態：${mine==='confirmed'?'参加確定':'キャンセル待ち（'+Number(e.my_waiting_position)+'番目）'}</p>`:''}<div class="actions"><button class="btn ${mine?'danger':''}" data-action="${mine?'cancel':'book'}" data-event="${esc(e.id)}" ${busy||!activeName||(!mine&&closed)?'disabled':''}>${mine?'予約をキャンセル':full?'キャンセル待ちに登録':'この日程を予約する'}</button></div></article>`;
 }).join('')||'<div class="empty">現在公開中の開催日はありません。</div>';}
async function refresh(){events=(await api('events')).events;render();}
async function init(){status.textContent='LINE認証を確認しています…';list.textContent='開催日程を読み込み中…';try{
 await window.liff.init({liffId:'2012769580-NXiNF8IB'});
 if(!window.liff.isLoggedIn()){status.textContent='LINEログインが必要です';list.textContent='LINEログイン後に開催日を表示します。';saveProfile.disabled=false;saveProfile.textContent='LINEでログイン';saveProfile.onclick=()=>window.liff.login();return;}
 const p=await api('profile');
 if(p.registered) registered(p.nickname);else{nickname.value=(p.displayName||'').slice(0,24);nickname.disabled=false;saveProfile.disabled=false;status.textContent='初回の表示名を確認してください';saveProfile.onclick=async()=>{const name=nickname.value.trim();if(!name||name.length>24)return;saveProfile.disabled=true;nickname.disabled=true;status.textContent='登録中…';try{const r=await api('register',{nickname:name});registered(r.nickname);render();}catch{status.textContent='登録結果を確認できません。再度お試しください。';nickname.disabled=false;saveProfile.disabled=false;}};}
 await refresh();
 }catch{status.textContent='認証または通信に失敗しました。LINEから開き直してください。';list.textContent='開催日程を取得できませんでした。';}}
list.addEventListener('click',async ev=>{const btn=ev.target.closest('[data-action]');if(!btn||busy||!activeName)return;const action=btn.dataset.action;if(action==='cancel'&&!confirm('この予約をキャンセルしますか？'))return;busy=true;list.querySelectorAll('button').forEach(b=>b.disabled=true);btn.textContent=action==='book'?'予約処理中…':'キャンセル処理中…';let done=false;try{const r=await api(action,{eventId:btn.dataset.event});done=true;status.textContent=r.status==='confirmed'?'参加予約が確定しました':r.status==='waitlisted'?'キャンセル待ちに登録しました':'予約をキャンセルしました';await refresh();}catch{status.textContent=done?'処理は完了しましたが、一覧を更新できません。開き直してください。':'処理結果を確認できません。予約状況を確認してください。';try{await refresh();}catch{list.textContent='予約状況を取得できません。ページを開き直してください。';events=[];}}finally{busy=false;if(events.length)render();}});
init();
