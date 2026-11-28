// Public metadata only. Member APIs and tokens never enter this module.
const endpoint = 'https://buptdnjahvwauslaanyo.supabase.co/functions/v1/ownpace-public-events';
export const bookingUrl = 'https://liff.line.me/2012769580-NXiNF8IB';
export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function normalizeEvents(input, now = Date.now()) {
  if (!Array.isArray(input)) throw new Error('開催日程の形式が不正です');
  return input.flatMap(raw => {
    if (!raw || !['open','closed'].includes(raw.status)) return [];
    const start = Date.parse(raw.starts_at), end = Date.parse(raw.ends_at);
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) throw new Error('開催日時の形式が不正です');
    if (end <= now) return [];
    if (!Number.isSafeInteger(raw.capacity) || raw.capacity < 1 || !Number.isSafeInteger(raw.fee) || raw.fee < 0 || !Number.isSafeInteger(raw.confirmed_count) || raw.confirmed_count < 0 || typeof raw.venue !== 'string' || typeof raw.id !== 'string') throw new Error('開催情報の形式が不正です');
    // Deliberately whitelist public fields. Never carry participants or member IDs through.
    return [{id:raw.id,title:typeof raw.title === 'string' ? raw.title : '',venue:raw.venue,starts_at:raw.starts_at,ends_at:raw.ends_at,capacity:raw.capacity,fee:raw.fee,status:raw.status,confirmed_count:raw.confirmed_count,remaining:Math.max(0,raw.capacity - raw.confirmed_count)}];
  }).sort((a,b) => Date.parse(a.starts_at) - Date.parse(b.starts_at) || a.id.localeCompare(b.id));
}
export async function fetchPublicEvents() {
  const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(endpoint,{method:'GET',cache:'no-store',credentials:'omit',signal:controller.signal,headers:{Accept:'application/json'}});
    if (!response.ok) throw new Error('開催日程を取得できませんでした。');
    const data = await response.json();
    if (data.success !== true) throw new Error('開催日程を取得できませんでした。');
    return normalizeEvents(data.events);
  } finally { clearTimeout(timeout); }
}
const dateParts = new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit',weekday:'short'});
const time = new Intl.DateTimeFormat('ja-JP',{timeZone:'Asia/Tokyo',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
export function eventCard(event,{scheduleLink = true} = {}) {
  const e = normalizeEvents([event])[0];
  if (!e) return '';
  const date = Object.fromEntries(dateParts.formatToParts(new Date(e.starts_at)).map(p=>[p.type,p.value]));
  const full = e.remaining === 0, open = e.status === 'open';
  const message = !open ? '参加予約の受付は終了しました。' : full ? '現在満員です。キャンセル待ちを受け付けています。' : '現在、参加予約を受け付けています。';
  return `<p class="game-date">${date.year}.${date.month}.${date.day}<small>${date.weekday.toUpperCase()}</small></p><p class="game-time">${time.format(new Date(e.starts_at))} — ${time.format(new Date(e.ends_at))}</p><p class="game-venue">${escapeHtml(e.venue)}</p>${e.title && e.title !== e.venue ? `<p class="game-court">${escapeHtml(e.title)}</p>` : ''}<dl class="game-meta"><div><dt>参加費 / 1回</dt><dd>${e.fee.toLocaleString('ja-JP')}円</dd></div><div><dt>定員</dt><dd>${e.capacity}名</dd></div><div><dt>残席</dt><dd>${e.remaining}名</dd></div></dl><p class="game-status">${message}</p><div class="button-row">${open ? `<a class="button button--solid" href="${bookingUrl}" data-cta="reservation">${full ? 'キャンセル待ちで参加予約へ' : '参加予約へ'}</a>` : '<span class="button button--disabled" aria-disabled="true">受付終了</span>'}${scheduleLink ? '<a class="text-link" href="schedule.html" data-cta="schedule">開催日程を見る</a>' : ''}</div>`;
}
