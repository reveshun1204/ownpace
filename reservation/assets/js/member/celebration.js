import {ranks,rankImage} from './rank.js';
export function playRankUp({host,from,to,reduced=false}){
 if(reduced||!host||!ranks[from]||!ranks[to]||to<=from)return ()=>{};
 // Non-modal; user can keep scrolling/using the page. Server already claimed once.
 host.hidden=false;host.dataset.rank=ranks[to].name.toLowerCase();
 const before=host.querySelector('[data-before]'),after=host.querySelector('[data-after]');
 before.src=rankImage(ranks[from].name);before.alt=ranks[from].name;
 after.src=rankImage(ranks[to].name);after.alt=ranks[to].name;
 host.querySelector('[data-up-title]').textContent=`${ranks[to].name} / RANK UP`;
 const benefits={REGULAR:'誕生月特典が解放されました。',ALLSTAR:'ALLSTARに到達しました。特典の実際の利用状況は下のMY COUPONSでご確認ください。',LEGEND:'LEGENDに到達しました。特典の実際の利用状況は下のMY COUPONSでご確認ください。',GOAT:'GOATに到達しました。特典の実際の利用状況は下のMY COUPONSでご確認ください。'};
 host.querySelector('[data-up-benefit]').textContent=benefits[ranks[to].name]||'';
 host.classList.add('is-playing');
 let timer;const stop=()=>{clearTimeout(timer);host.classList.remove('is-playing');host.hidden=true;};
 host.querySelector('button').onclick=stop;timer=setTimeout(stop,3800);return stop;
}
