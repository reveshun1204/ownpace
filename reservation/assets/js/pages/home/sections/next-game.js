import { initSection } from '../../../common/reveal.js';
import { fetchPublicEvents, eventCard } from '../../../public/events.js';
export default function init() {
  initSection('next-game');
  const card = document.getElementById('next-game-card');
  if (!card) return;
  let loading = false;
  async function refresh() {
    if (loading) return;
    loading = true;
    card.setAttribute('aria-busy','true');
    card.innerHTML = '<p class="game-empty" role="status">開催日程を取得しています。</p>';
    try {
      const [next] = await fetchPublicEvents();
      card.innerHTML = next ? eventCard(next) : '<p class="game-empty" role="status">次回開催日程は調整中です。</p><a class="text-link" href="schedule.html">開催日程を見る</a>';
    } catch {
      card.innerHTML = '<p class="game-empty" role="status">開催日程を取得できませんでした。</p><button type="button" class="button" data-events-retry>再取得する</button><a class="text-link" href="schedule.html">開催日程を見る</a>';
    } finally { loading = false; card.setAttribute('aria-busy','false'); }
  }
  card.addEventListener('click',e=>{if(e.target.closest('[data-events-retry]')) refresh();});
  addEventListener('pageshow', e=>{if(e.persisted) refresh();});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState === 'visible')refresh();});
  refresh();
}
