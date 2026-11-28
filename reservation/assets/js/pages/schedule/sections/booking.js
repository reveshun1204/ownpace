import { initSection } from '../../../common/reveal.js';
import { fetchPublicEvents, eventCard } from '../../../public/events.js';
export default function init() {
  initSection('booking');
  const list = document.getElementById('public-games');
  if (!list) return;
  let loading = false;
  async function refresh() {
    if (loading) return;
    loading = true; list.setAttribute('aria-busy','true');
    list.innerHTML = '<p class="game-empty" role="status">開催日程を取得しています。</p>';
    try {
      const events = await fetchPublicEvents();
      list.innerHTML = events.length ? events.map(e=>`<article class="game-card">${eventCard(e,{scheduleLink:false})}</article>`).join('') : '<p class="game-empty" role="status">次回開催日程は調整中です。</p>';
    } catch {
      list.innerHTML = '<p class="game-empty" role="status">開催日程を取得できませんでした。</p><button type="button" class="button" data-events-retry>再取得する</button>';
    } finally { loading = false; list.setAttribute('aria-busy','false'); }
  }
  list.addEventListener('click',e=>{if(e.target.closest('[data-events-retry]'))refresh();});
  addEventListener('pageshow',e=>{if(e.persisted)refresh();});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState === 'visible')refresh();});
  refresh();
}
