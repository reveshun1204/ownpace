const subtitles={
 'OWN PACEについて':'DISCOVER OUR CULTURE','開催日程を見る':'UPCOMING GAMES','参加予約へ':'BOOK YOUR NEXT GAME',
 'キャンセル待ちで参加予約へ':'JOIN THE WAITLIST','参加ルールを見る':'BEFORE YOU PLAY','ランク制度を見る':'YOUR NEXT CHAPTER',
 'ランクを見る':'EXPLORE YOUR RANK','活動レポートへ':'ON & OFF THE COURT','次回の参加予約へ':'BOOK YOUR NEXT GAME',
 '開催日程・参加方法を見る':'FIND YOUR NEXT GAME','MY PAGEを見る':'YOUR OWN RECORD',
};
export function initEditorialCtas(root=document){
 root.querySelectorAll('a.button').forEach(a=>{
  if(a.querySelector('.cta-copy')){a.classList.add('editorial-cta');return;}
  const label=a.textContent.trim().replace(/\s+/g,' ');const english=subtitles[label]||'DISCOVER MORE';
  const copy=document.createElement('span');copy.className='cta-copy';
  const small=document.createElement('small'),strong=document.createElement('strong');small.textContent=english;strong.textContent=label;copy.append(small,strong);
  const arrow=document.createElement('span');arrow.className='cta-arrow';arrow.setAttribute('aria-hidden','true');arrow.textContent='→';
  a.replaceChildren(copy,arrow);a.classList.add('editorial-cta');
 });
}

export function observeEditorialCtas(){
 const observer=new MutationObserver(()=>initEditorialCtas());
 observer.observe(document.body,{childList:true,subtree:true});
 return observer;
}
