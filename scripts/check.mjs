import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import assert from 'node:assert/strict';
const root=resolve(import.meta.dirname,'..');
const dist=resolve(root,'dist');
const pages=['index.html','schedule.html','rules.html','rank.html','report.html','reservation/index.html','admin/index.html'];
const exists=async p=>{try{return(await stat(p)).isFile()}catch{return false}};
const localFile=async path=>{try{if((await stat(path)).isDirectory())return resolve(path,'index.html')}catch{}return path};
for(const file of pages){
 const html=await readFile(resolve(dist,file),'utf8');
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(ids.length,new Set(ids).size,`${file}: duplicate IDs`);
 for(const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)){
  const value=match[1].replaceAll('&amp;','&');
  if(value.startsWith('#')){assert(!value.slice(1)||ids.includes(value.slice(1)),`${file}: missing anchor ${value}`);continue;}
  if(/^[a-z]+:/i.test(value))continue;
  const parsed=new URL(value,'https://local.test/'+file);
  const path=decodeURIComponent(parsed.pathname.slice(1)),fragment=parsed.hash.slice(1);
  const targetFile=await localFile(resolve(dist,path));
  assert(await exists(targetFile),`${file}: missing asset ${value}`);
  if(fragment&&targetFile.endsWith('.html')){const target=await readFile(targetFile,'utf8');assert(target.includes(`id="${fragment}"`),`${file}: invalid cross-page anchor ${value}`)}
 }
 assert(html.includes('name="description"'),`${file}: description missing`);
 console.log('OK',file,'IDs, assets, links, metadata');
}
const home=await readFile(resolve(dist,'index.html'),'utf8');
assert.equal([...home.matchAll(/data-story-scene/g)].length,5,'five pinned scenes');
assert.equal([...home.matchAll(/class="faq-question"/g)].length,12,'12 FAQ items');
assert.equal([...home.matchAll(/aria-expanded="false"\s+aria-controls="answer-/g)].length,12,'FAQ starts closed');
assert(home.indexOf('id="final-cta"')>home.indexOf('id="faq"'),'final CTA is last');
const schedule=await readFile(resolve(dist,'schedule.html'),'utf8');
assert(schedule.includes('mode=MONTH')&&schedule.includes('Asia%2FTokyo'),'JST initial month');
const rank=await readFile(resolve(dist,'rank.html'),'utf8');
for(const name of ['REGULAR','ALLSTAR','LEGEND','GOAT'])assert(rank.includes(name),'rank '+name);
assert(!/誕生|無料|特典|クーポン/.test(rank),'rank benefits must stay hidden');
const report=await readFile(resolve(dist,'report.html'),'utf8');
assert(report.includes('準備中'),'empty activity report');
assert(!report.includes('<picture'),'no synthetic activity images in REPORT');
console.log('OK HOME scene/FAQ structure, calendar settings, ranks and honest report empty state.');
