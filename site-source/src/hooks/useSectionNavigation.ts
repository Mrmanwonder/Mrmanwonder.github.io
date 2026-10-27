import {useEffect} from 'react';
import {gsap,ScrollTrigger} from './useMotion';
import {ScrollToPlugin} from 'gsap/ScrollToPlugin';
gsap.registerPlugin(ScrollToPlugin);
export const processStartEvent='axon:process-start';
export function sectionScrollPosition(section:HTMLElement,pinnedStart?:number){return Math.max(0,section.id==='how-it-works'&&pinnedStart!==undefined?pinnedStart:window.scrollY+section.getBoundingClientRect().top);}
/** Native anchors measure a pinned element at its current, fixed position. */
export function bindSectionNavigation(){
 let tween:gsap.core.Tween|undefined,frame=0,disposed=false;
 const resolve=(hash:string)=>{let id:string;try{id=decodeURIComponent(hash.slice(1));}catch{return null;}const el=document.getElementById(id);return el instanceof HTMLElement&&el.matches('section,footer,main')?el:null;};
 const navigate=(hash:string,animated:boolean,focus:boolean)=>{
  const section=resolve(hash);if(!section)return false;tween?.kill();
  const pin=section.id==='how-it-works'?ScrollTrigger.getById('paper-process'):undefined,target=sectionScrollPosition(section,pin?.pin?pin.start:undefined);
  const root=document.documentElement,previous=root.style.scrollBehavior;root.style.scrollBehavior='auto';
  const restore=()=>{root.style.scrollBehavior=previous;};
  const finish=()=>{
   tween=undefined;restore();ScrollTrigger.update();
   if(section.id==='how-it-works')window.dispatchEvent(new Event(processStartEvent));
   if(focus){if(!section.hasAttribute('tabindex'))section.setAttribute('tabindex','-1');section.focus({preventScroll:true});}
  };
  if(!animated||matchMedia('(prefers-reduced-motion: reduce)').matches||Math.abs(window.scrollY-target)<2){window.scrollTo({top:target,behavior:'instant'});finish();}
  else tween=gsap.to(window,{scrollTo:{y:target,autoKill:true},duration:.55+Math.min(.65,Math.abs(window.scrollY-target)/7000),ease:'power3.inOut',onComplete:finish,onInterrupt:restore});
  return true;
 };
 const click=(event:MouseEvent)=>{
  if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const link=(event.target instanceof Element?event.target.closest<HTMLAnchorElement>('a[href^="#"]'):null);
  if(!link||link.hasAttribute('download')||(link.target&&link.target!=='_self'))return;
  const hash=link.getAttribute('href')!;if(!resolve(hash))return;event.preventDefault();
  if(window.location.hash!==hash)window.history.pushState(window.history.state,'',hash);navigate(hash,true,true);
 };
 const hashchange=()=>navigate(window.location.hash,false,false);
 document.addEventListener('click',click);window.addEventListener('hashchange',hashchange);
 if(resolve(window.location.hash))document.fonts.ready.then(()=>{if(!disposed)frame=requestAnimationFrame(()=>{ScrollTrigger.refresh();hashchange();});});
 return()=>{disposed=true;cancelAnimationFrame(frame);tween?.kill();document.removeEventListener('click',click);window.removeEventListener('hashchange',hashchange);};
}
export function useSectionNavigation(){useEffect(bindSectionNavigation,[]);}
