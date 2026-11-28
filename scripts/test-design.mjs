import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const root = new URL('../', import.meta.url);
const read = file => readFile(new URL(file, root));
const html = async file => (await read(file)).toString();
// This visual release must not change authentication, rewards, or backend contracts.
const protectedFiles = JSON.parse(await html('scripts/design-protected-files.json'));
for (const [file, expected] of Object.entries(protectedFiles)) {
  assert.equal(createHash('sha256').update(await read(file)).digest('hex'), expected, `${file}: protected contract changed`);
}
const seen = new Set();
for (const page of ['schedule', 'rules', 'rank', 'report']) {
  const source = await html(`${page}.html`);
  const asset = `assets/img/headings/${page}.webp`;
  assert(source.includes(asset), `${page}: dedicated heading asset missing`);
  const bytes = await read(asset);
  assert.equal(bytes.subarray(8,12).toString(), 'WEBP');
  seen.add(createHash('sha256').update(bytes).digest('hex'));
  assert(source.includes('final-cta'), `${page}: final invitation missing`);
}
assert.equal(seen.size, 4, 'headings must use different illustrations');
const rank = await html('rank.html');
assert.equal([...rank.matchAll(/data-rank-tab=/g)].length, 5, 'all five ranks selectable');
// Initial HTML remains readable without the enhancement script.
for (const name of ['rookie','regular','allstar','legend','goat']) {
  assert(new RegExp(`<section[^>]*id="${name}"`).test(rank), `rank ${name} missing`);
  const png = await read(`assets/img/rank/emblems/rank-${name}.png`);
  assert.equal(png.readUInt32BE(16),1024);
  assert.equal(png.readUInt32BE(20),1024);
  assert.equal(png[25],6, 'rank logo must retain RGBA transparency');
}
for (const team of ['a','b','c']) {
  const svg = await html(`assets/img/rules/teams/team-${team}.svg`);
  assert(svg.includes('viewBox="0 0 240 150"'));
  assert.equal([...svg.matchAll(/<circle\b/g)].length,4, 'three people and one ball');
}
const booking = await html('reservation/index.html');
for (const id of ['registered-member','profile-fields','welcome-name','member-nav']) {
  assert(booking.includes(`id="${id}"`), `booking state region ${id} missing`);
}
console.log(`OK design assets, progressive rank content, booking states and ${Object.keys(protectedFiles).length} protected contracts.`);
