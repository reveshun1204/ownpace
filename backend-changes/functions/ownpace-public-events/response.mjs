// Independently whitelist the RPC output. No personal fields are forwarded.
const PUBLIC_STATUSES = new Set(['open', 'closed']);
export function sanitizePublicEvents(payload, now = Date.now()) {
  if (!payload || !Array.isArray(payload.events) || typeof payload.has_more !== 'boolean') {
    throw new Error('Invalid public event result');
  }
  if (payload.events.length > 200) throw new Error('Public event result exceeds limit');
  const events = payload.events.map(row => {
    const start = Date.parse(row.starts_at), end = Date.parse(row.ends_at);
    if (typeof row.id !== 'string' || !row.id || typeof row.venue !== 'string' ||
      !(row.title == null || typeof row.title === 'string') ||
      !PUBLIC_STATUSES.has(row.status) || !Number.isFinite(start) || !Number.isFinite(end) || end <= start ||
      !Number.isSafeInteger(row.capacity) || row.capacity < 1 ||
      !Number.isSafeInteger(row.fee) || row.fee < 0 ||
      !Number.isSafeInteger(row.confirmed_count) || row.confirmed_count < 0) {
      throw new Error('Invalid public event row');
    }
    return {
      id: row.id, title: row.title || '', venue: row.venue,
      starts_at: new Date(start).toISOString(), ends_at: new Date(end).toISOString(),
      capacity: row.capacity, fee: row.fee, status: row.status,
      confirmed_count: row.confirmed_count,
      remaining: Math.max(0, row.capacity - row.confirmed_count),
    };
  }).filter(row => Date.parse(row.ends_at) > now)
    .sort((a, b) => Date.parse(a.starts_at) - Date.parse(b.starts_at) || a.id.localeCompare(b.id));
  return { success: true, events, has_more: payload.has_more };
}
