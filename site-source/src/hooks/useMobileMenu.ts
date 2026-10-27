import {useLayoutEffect,useRef,type RefObject} from 'react';
import {gsap} from './useMotion';

/** A single reversible timeline keeps rapid direction changes continuous. */
export function useMobileMenu(ref:RefObject<HTMLElement|null>,open:boolean){
 const requested=useRef(open),control=useRef<(()=>void)|null>(null);requested.current=open;
 useLayoutEffect(()=>{
  const nav=ref.current!,links=Array.from(nav.querySelectorAll('a'));
  const mobile=matchMedia('(max-width:800px)'),reduce=matchMedia('(prefers-reduced-motion: reduce)');
  let ctx:gsap.Context|undefined,timeline:gsap.core.Timeline|undefined;
  function sync(){
   const expanded=requested.current;
   nav.inert=mobile.matches&&!expanded;
   if(mobile.matches)nav.setAttribute('aria-hidden',String(!expanded));else nav.removeAttribute('aria-hidden');
   if(!mobile.matches)return;
   if(reduce.matches){gsap.set(nav,{autoAlpha:expanded?1:0,y:0,scale:1});gsap.set(links,{opacity:1,y:0});}
   else if(expanded)timeline?.play();else timeline?.reverse();
  }
  function build(){
   ctx?.revert();timeline=undefined;gsap.set([nav,...links],{clearProps:'opacity,visibility,transform'});
   ctx=gsap.context(()=>{
    if(mobile.matches&&!reduce.matches){
     timeline=gsap.timeline({paused:true,defaults:{ease:'power3.out',easeReverse:'power3.out'}})
      .fromTo(nav,{autoAlpha:0,y:-10,scale:.98},{autoAlpha:1,y:0,scale:1,duration:.42,force3D:true},0)
      .fromTo(links,{opacity:0,y:14},{opacity:1,y:0,duration:.36,stagger:.055,force3D:true},.08);
    }
   },nav);sync();
  }
  control.current=sync;mobile.addEventListener('change',build);reduce.addEventListener('change',build);build();
  return()=>{control.current=null;mobile.removeEventListener('change',build);reduce.removeEventListener('change',build);ctx?.revert();gsap.set([nav,...links],{clearProps:'opacity,visibility,transform'});nav.inert=false;nav.removeAttribute('aria-hidden');};
 },[ref]);
 useLayoutEffect(()=>{control.current?.();},[open]);
}
