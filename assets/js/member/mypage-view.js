import {createLineSession} from './auth.js';
import {application} from '../config/application.js';
import {rankProgress,rankImage} from './rank.js';
import {playRankUp} from './celebration.js';
import {birthFields,bindBirth,rewardName} from '../demo/rewards.js';
import {esc} from '../demo/store.js';
export const eventDate=e=>new Intl.DateTimeFormat('ja-JP',{timeZone:'Asia/Tokyo',year:'numeric',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(e.starts_at));
const today=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tokyo'}).format(new Date());
export function couponMarkup(data){
 if(!Array.isArray(data.rewards)||!Array.isArray(data.active_redemptions))return '<p>特典情報を取得できませんでした。利用可能枚数は受付でご確認ください。</p>';
 if(data.rewards.some(r=>!Number.isSafeInteger(r.remaining)||r.remaining<0||!Number.isSafeInteger(r.quantity)||r.quantity<0||typeof r.available!=='boolean'))return '<p>特典情報を取得できませんでした。受付でご確認ください。</p>';
 const available=data.rewards.filter(r=>r.available===true&&(!r.expires_on||r.expires_on>=today())&&r.reward_type!=='birthday');
 const total=available.reduce((n,r)=>n+Math.max(0,Math.trunc(Number(r.remaining)||0)),0);
 const cards=data.rewards.map(r=>{
  const expired=r.expires_on&&r.expires_on<today(),used=Number(r.remaining)===0;
  const state=expired?'期限切れ':r.available?'利用可能':used?'使用済み':'利用条件対象外';
  return `<article class="coupon" data-state="${expired?'expired':r.available?'available':'inactive'}"><p class="member-label">${esc(rewardName(r))}</p><h3>${r.reward_type==='birthday'?'BIRTHDAY GAME':'FREE GAME'}</h3><p class="coupon-quantity">${Math.max(0,Math.trunc(Number(r.remaining)||0))}<span> / ${Math.max(0,Math.trunc(Number(r.quantity)||0))}枚</span></p><p>${state}</p><p class="member-note">${r.expires_on?'有効期限 '+esc(r.expires_on):'有効期限なし'}</p></article>`;
 }).join('');
 const n=Number(data.attendance_count),locked=[{min:5,name:'REGULAR / 誕生月特典'},{min:10,name:'ALLSTAR'},{min:25,name:'LEGEND'},{min:50,name:'GOAT'}].filter(r=>n<r.min).map(r=>`<p class="coupon-locked">${r.name}<span>未解放</span></p>`).join('');
 return `<p class="coupon-total">利用できるランク無料券 <strong>${total}</strong>枚</p><div class="coupon-list">${cards||'<p>獲得済み特典はありません。</p>'}</div>${locked}<details><summary>特典利用履歴</summary>${data.active_redemptions.map(u=>`<p>${esc(rewardName(data.rewards.find(r=>r.id===u.reward_id)||{}))} / ${esc(new Date(u.redeemed_at).toLocaleDateString('ja-JP',{timeZone:'Asia/Tokyo'}))} / 使用済み</p>`).join('')||'<p>利用履歴はありません。</p>'}</details>`;
}
export async function initMypage({liffId=application.mypageLiffId,sdk=globalThis.liff,fetcher=globalThis.fetch}={}){
 const $=s=>document.querySelector(s),view=$('#member-view'),message=$('#member-status'),login=$('#line-login');
 let page=0,busy=false,first=true,animationFrame=0,stopCelebration=()=>{},observer=null;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 reduced.addEventListener?.('change',()=>{if(reduced.matches)stopCelebration();});
 const session=createLineSession({liffId,sdk,fetcher,onAuthRequired:mode=>{
  view.hidden=true;$('#login-panel').hidden=false;login.hidden=mode==='client';
  $('#login-status').textContent=mode==='client'?'認証を更新するにはMY PAGEをLINEから開き直してください。':'会員情報を見るにはLINEでログインしてください。';
  if(mode==='client'&&liffId){$('#client-reopen').hidden=false;$('#client-reopen').href=`https://liff.line.me/${liffId}`;}
 }});
 login.onclick=()=>{try{session.login();}catch(e){$('#login-status').textContent=e.message;}};
 function counter(count){
  cancelAnimationFrame(animationFrame);const el=$('#attendance-count');
  if(reduced.matches||!first){el.textContent=count;return;}
  const start=performance.now();function frame(now){const t=Math.min(1,(now-start)/950);el.textContent=Math.round(count*(1-Math.pow(1-t,3)));if(t<1)animationFrame=requestAnimationFrame(frame);}animationFrame=requestAnimationFrame(frame);
 }
 async function load(target=0){
  if(busy)return;busy=true;$('#history-prev').disabled=true;$('#history-next').disabled=true;message.textContent='参加記録を取得しています。';
  try{
   const data=await session.request('my_page',{page:target});
   if(!data.member||!Number.isSafeInteger(data.attendance_count)||data.attendance_count<0||!Array.isArray(data.history)||!Array.isArray(data.reservations))throw new Error('会員情報を取得できませんでした。');
   page=target;const info=rankProgress(data.attendance_count),m=data.member;
   view.hidden=false;$('#login-panel').hidden=true;document.body.dataset.rank=info.rank.name.toLowerCase();
   document.body.style.setProperty('--rank-color',info.rank.color);$('#rank-title').textContent=info.rank.name;
   $('#member-name').textContent=m.nickname;$('#rank-image').src=rankImage(info.rank.name);$('#rank-image').alt=`${info.rank.name}のランクロゴ`;
   $('#rank-ring').setAttribute('role','img');$('#rank-ring').setAttribute('aria-label',`${info.rank.name}、${info.count}回参加、次のランクまで${info.remaining}回`);
   $('#rank-ring').style.setProperty('--progress',String(info.progress*100));$('#next-progress').style.width=`${info.progress*100}%`;
   $('#rank-next-label').textContent=info.next?`NEXT / ${info.next.name}`:'HIGHEST RANK';
   $('#next-rank-title').textContent=info.next?.name||'GOAT. AND BEYOND.';
   $('#rank-remaining').textContent=info.next?`次のランクまで、あと${info.remaining}回。`:'最高ランクに到達しました。ここからも、自分のペースで。';counter(info.count);
   $('#coupons').innerHTML=couponMarkup(data);
   $('#my-bookings').innerHTML=data.reservations.map(r=>r.events?`<article><p class="member-label">${r.status==='confirmed'?'参加確定':'キャンセル待ち'}</p><h3>${esc(r.events.venue)}</h3><p>${esc(eventDate(r.events))}</p></article>`:'').join('')||'<p>現在予約中の開催日はありません。</p>';
   $('#history-list').innerHTML=data.history.map(r=>`<li><time>${esc(r.events?eventDate(r.events):'開催情報なし')}</time><h3>${esc(r.events?.venue||'記録済みの開催')}</h3><p>${esc(({paid:'支払済',unpaid:'未払い',free:'無料'})[r.payment_status]||'')} / ${Number(r.paid_amount)||0}円</p></li>`).join('')||'<li>参加の記録は、ここから。</li>';
   $('#history-page').textContent=String(page+1);$('#history-prev').disabled=page===0;$('#history-next').disabled=!data.hasMore;
   $('#profile').innerHTML=`<dl><div><dt>NICKNAME</dt><dd>${esc(m.nickname)}</dd></div><div><dt>BIRTHDAY</dt><dd>${m.birthday_month?`${Number(m.birthday_month)}月${Number(m.birthday_day)}日`:'未登録'}</dd></div></dl>${m.birthday_month?'<p class="member-note">登録情報の変更は管理者へご相談ください。</p>':`<form id="birthday-form"><p>誕生日は初回のみ登録できます（任意）。</p>${birthFields()}<button class="member-button" type="submit">誕生日を登録する</button><p role="status"></p></form>`}`;
   const f=$('#birthday-form');if(f){const read=bindBirth(f);f.onsubmit=async e=>{
    e.preventDefault();if(busy)return;const button=f.querySelector('button'),status=f.querySelector('[role=status]');
    try{const birth=read();if(!birth.birthday_month){status.textContent='月と日を選択してください。';return;}if(!confirm('登録後はご自身で変更できません。登録しますか？'))return;
     busy=true;button.disabled=true;await session.request('register_birthday',birth);busy=false;await load(page);
    }catch(e){status.textContent=e.message;}finally{busy=false;button.disabled=false;}
   };}
   observer?.disconnect();
   if(!reduced.matches&&'IntersectionObserver' in window){
    observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('is-shown');observer.unobserve(entry.target);}},{threshold:.12});
    for(const el of document.querySelectorAll('.coupon,.member-history li')){el.setAttribute('data-enter','');observer.observe(el);}
   }
   message.textContent='';
   if(first){
    // Server claim: baseline on first visit, atomic once across all devices. Never client-local rank history.
    try{const state=await session.requestTo(application.memberStateApi,'claim');
     if(state.celebrate&&state.attendance_count===info.count&&state.to_rank===info.index)stopCelebration=playRankUp({host:$('#rank-up'),from:state.from_rank,to:state.to_rank,reduced:reduced.matches});
    }catch(e){if(e.kind==='auth')throw e;message.textContent='参加記録は取得できました。昇格演出の同期はまだ利用できません。';}
    first=false;
   }
  }catch(e){message.textContent=e.message;if(e.kind==='auth')view.hidden=true;}
  finally{busy=false;}
 }
 $('#history-prev').onclick=()=>load(Math.max(0,page-1));$('#history-next').onclick=()=>load(page+1);
 try{
  if(!await session.start())return;
  const p=await session.request('profile');
  if(!p.registered){$('#login-status').textContent='最初に予約ページからニックネームを登録してください。';login.hidden=true;return;}
  await load();
 }catch(e){$('#login-status').textContent=e.message;login.hidden=e.kind==='config'||session.isInClient;}
}
