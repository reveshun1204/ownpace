import { initSection } from '../../../common/reveal.js';
export default function init() {
  initSection('hero');
  const hint = document.querySelector('.hero-scroll');
  if (!hint) return;
  let dismissed = false;
  const update = () => {
    if (dismissed || scrollY < 24) return;
    dismissed = true;
    hint.classList.add('is-dismissed');
    hint.tabIndex = -1;
    hint.setAttribute('aria-hidden','true');
    removeEventListener('scroll', update);
  };
  addEventListener('scroll',update,{passive:true});
  update();
}
