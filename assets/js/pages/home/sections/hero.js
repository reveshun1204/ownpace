import { initSection } from '../../../common/reveal.js';
export default async function init() {
  initSection('hero');
  const hero=document.getElementById('hero'),hint=hero?.querySelector('.hero-scroll');
  if(!hero)return;
  let dismissed=false;
  const update=()=>{if(dismissed||scrollY<24)return;dismissed=true;hint?.classList.add('is-dismissed');if(hint){hint.tabIndex=-1;hint.setAttribute('aria-hidden','true');}removeEventListener('scroll',update);};
  addEventListener('scroll',update,{passive:true});update();
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  if('IntersectionObserver' in window)new IntersectionObserver(entries=>{hero.classList.toggle('is-outside',!entries[0].isIntersecting);},{threshold:0}).observe(hero);
  try{
   const [{gsap},{ScrollTrigger}]=await Promise.all([import('gsap'),import('gsap/ScrollTrigger')]);gsap.registerPlugin(ScrollTrigger);
   const media=gsap.matchMedia();
   media.add({motion:'(prefers-reduced-motion: no-preference)',phone:'(max-width:720px)'},ctx=>{
    if(!ctx.conditions.motion)return;
    const photo=hero.querySelector('.editorial-hero-photo');
    let wrapper=photo?.parentElement;
    if(photo&&!wrapper.classList.contains('hero-parallax')){wrapper=document.createElement('div');wrapper.className='hero-parallax';photo.before(wrapper);wrapper.append(photo);}
    const line=document.createElement('span');line.className='hero-draw-line';line.setAttribute('aria-hidden','true');hero.querySelector('.hero-content')?.append(line);
    gsap.fromTo(hero.querySelectorAll('h1 span'),{opacity:0,y:35},{opacity:1,y:0,duration:1.25,stagger:.17,ease:'power3.out',clearProps:'opacity,transform'});
    gsap.fromTo(hero.querySelectorAll('.hero-kicker,.hero-jp'),{opacity:0,y:16},{opacity:1,y:0,duration:1.1,stagger:.18,delay:.28,ease:'power2.out',clearProps:'opacity,transform'});
    gsap.fromTo(line,{scaleX:0},{scaleX:1,duration:1.5,delay:.5,ease:'power2.inOut'});
    if(wrapper)gsap.to(wrapper,{yPercent:ctx.conditions.phone?3:8,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:.7}});
    const caption=hero.querySelector('.hero-caption');if(caption)gsap.to(caption,{x:-35,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:1}});
    return ()=>line.remove();
   });
  }catch{/* CSS and normal text stay usable when the optional animation cannot load. */}
}
