import { revealNow } from '../../../common/reveal.js';
// Progressive enhancement: without JS, every original rank section is readable.
export default function initRankSelector() {
  const route = document.querySelector('.rank-route');
  const tabs = [...(route?.querySelectorAll('[data-rank-tab]') || [])];
  const panels = tabs.map(tab => document.getElementById(tab.dataset.rankTab));
  if (!tabs.length || panels.some(panel => !panel)) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width:720px)');
  let active = -1, animation = null;
  route.setAttribute('role','tablist');
  route.setAttribute('aria-label','ランクを選ぶ');
  const orient = () => route.setAttribute('aria-orientation',mobile.matches ? 'vertical' : 'horizontal');
  orient(); mobile.addEventListener?.('change',orient);
  tabs.forEach((tab,index) => {
    tab.id = `rank-tab-${tab.dataset.rankTab}`;
    tab.setAttribute('role','tab');
    tab.setAttribute('aria-controls',panels[index].id);
    tab.parentElement.setAttribute('role','presentation');
    panels[index].setAttribute('role','tabpanel');
    panels[index].setAttribute('aria-labelledby',tab.id);
    panels[index].tabIndex = 0;
  });
  function select(index,{focus = false,writeHash = false,animate = true} = {}) {
    if (index < 0 || index >= tabs.length) return;
    const changed = index !== active;
    animation?.cancel(); animation = null;
    active = index;
    tabs.forEach((tab,i) => {
      tab.setAttribute('aria-selected',String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      panels[i].hidden = i !== index;
    });
    revealNow(panels[index]);
    if (changed && animate && !reduced.matches && panels[index].animate) animation = panels[index].animate([{opacity:.2,transform:'translateY(9px)'},{opacity:1,transform:'translateY(0)'}],{duration:480,easing:'cubic-bezier(.22,.8,.22,1)'});
    if (focus) tabs[index].focus({preventScroll:true});
    if (writeHash) history.replaceState(history.state,'',`${location.pathname}${location.search}#${panels[index].id}`);
  }
  // Capture before the shared anchor-scrolling handler; switching panels must not
  // scroll through content which is about to be hidden.
  route.addEventListener('click',event => {
    const tab = event.target.closest('[data-rank-tab]');
    if (!tab || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault(); event.stopPropagation();
    select(tabs.indexOf(tab),{writeHash:true});
  },true);
  route.addEventListener('keydown',event => {
    const index = tabs.indexOf(event.target.closest('[data-rank-tab]'));
    if (index < 0) return;
    let target = index;
    if (['ArrowRight','ArrowDown'].includes(event.key)) target = (index + 1) % tabs.length;
    else if (['ArrowLeft','ArrowUp'].includes(event.key)) target = (index + tabs.length - 1) % tabs.length;
    else if (event.key === 'Home') target = 0;
    else if (event.key === 'End') target = tabs.length - 1;
    else return;
    event.preventDefault(); event.stopPropagation();
    select(target,{focus:true,writeHash:true});
  });
  const fromHash = () => tabs.findIndex(tab => `#${tab.dataset.rankTab}` === location.hash);
  addEventListener('hashchange',()=>{const index=fromHash();if(index>=0)select(index,{animate:false});});
  document.body.classList.add('has-rank-tabs');
  select(Math.max(0,fromHash()),{animate:false});
}
