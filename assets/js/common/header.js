// Navigation and MENU share one fixed header without ever appearing together.
export function initHeader() {
  const header = document.querySelector('.site-header');
  const nav = header?.querySelector('.header-links');
  const menuButton = header?.querySelector('.menu-open');
  const toggle = document.getElementById('motion-toggle');
  const desktop = header?.querySelector('.header-controls');
  const menu = document.querySelector('.menu-shell');
  if (!header || !nav || !menuButton) return;
  const compactWidth = matchMedia('(max-width:1100px)');
  let frame = 0;
  function update() {
    frame = 0;
    const hero = document.getElementById('hero');
    const compact = compactWidth.matches || scrollY > Math.max(120,(hero?.offsetHeight || innerHeight) * .65);
    header.classList.toggle('is-compact',compact);
    nav.inert = compact;
    nav.setAttribute('aria-hidden',String(compact));
    menuButton.tabIndex = compact ? 0 : -1;
    if (toggle && desktop && menu) (compactWidth.matches ? menu : desktop).prepend(toggle);
  }
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',schedule,{passive:true});
  compactWidth.addEventListener?.('change',update);
  update();
}
