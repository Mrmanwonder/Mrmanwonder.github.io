import {useEffect,type RefObject} from 'react';
import {chooseLogoTone,toneForBackground,type LogoTone} from './logoContrast';
/** Geometry and colors are cached; scrolling only updates intersection coverage. */
export function useAdaptiveLogo(ref:RefObject<HTMLAnchorElement|null>){
 useEffect(()=>{
  const logo=ref.current!,elements=Array.from(document.querySelectorAll<HTMLElement>('main section,footer,[data-header-tone],.mock-surface,.insight-card,.process-panel'));
  const surfaces=new Map<HTMLElement,{area:number;depth:number;tone:LogoTone|null}>();
  for(const element of elements){let depth=0,parent:Element|null=element;while(parent){depth++;parent=parent.parentElement;}surfaces.set(element,{area:0,depth,tone:null});}
  let observer:IntersectionObserver|null=null,frame=0,epoch=0,dead=false,area=1,fallback:LogoTone='dark';
  const update=()=>{
   const samples=Array.from(surfaces,([element,surface])=>({...surface,coverage:surface.area/area,active:!element.closest('[data-active="false"],[hidden],[aria-hidden="true"]')}));
   logo.dataset.tone=chooseLogoTone(samples,logo.dataset.tone==='light'?'light':'dark',fallback);
  };
  const configure=()=>{
   frame=0;if(dead)return;observer?.disconnect();const generation=++epoch,r=logo.getBoundingClientRect();area=Math.max(1,r.width*r.height);
   fallback=toneForBackground(getComputedStyle(document.body).backgroundColor)??toneForBackground(getComputedStyle(document.documentElement).backgroundColor)??'dark';
   const thresholds=new Set([0,1]);
   for(const [element,surface] of surfaces){
    const explicit=element.dataset.headerTone;surface.tone=explicit==='dark'?'light':explicit==='light'?'dark':toneForBackground(getComputedStyle(element).backgroundColor);
    const bounds=element.getBoundingClientRect(),total=bounds.width*bounds.height;
    surface.area=Math.max(0,Math.min(r.right,bounds.right)-Math.max(r.left,bounds.left))*Math.max(0,Math.min(r.bottom,bounds.bottom)-Math.max(r.top,bounds.top));
    if(total>0)for(const coverage of [.2,.35,.5,.6,.75,1])thresholds.add(Math.min(1,area/total*coverage));
   }
   const bottom=Math.max(0,window.innerHeight-r.bottom),right=Math.max(0,window.innerWidth-r.right);
   observer=new IntersectionObserver(entries=>{if(generation!==epoch)return;for(const entry of entries){const surface=surfaces.get(entry.target as HTMLElement);if(surface)surface.area=entry.isIntersecting?entry.intersectionRect.width*entry.intersectionRect.height:0;}update();},{rootMargin:`-${Math.max(0,r.top)}px -${right}px -${bottom}px -${Math.max(0,r.left)}px`,threshold:Array.from(thresholds).sort((a,b)=>a-b)});
   elements.forEach(element=>observer!.observe(element));update();
  };
  const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(configure);};
  const size=new ResizeObserver(schedule);[logo,...elements].forEach(element=>size.observe(element));window.addEventListener('resize',schedule,{passive:true});
  const theme=new MutationObserver(schedule);for(const element of [document.body,document.documentElement])theme.observe(element,{attributes:true,attributeFilter:['class','style','data-theme','data-mock-theme']});
  const active=new MutationObserver(update);document.querySelectorAll('.process-section').forEach(element=>active.observe(element,{subtree:true,attributes:true,attributeFilter:['data-active','aria-hidden']}));
  document.fonts.ready.then(()=>{if(!dead)schedule();});configure();
  return()=>{dead=true;epoch++;observer?.disconnect();size.disconnect();theme.disconnect();active.disconnect();cancelAnimationFrame(frame);window.removeEventListener('resize',schedule);};
 },[ref]);
}
