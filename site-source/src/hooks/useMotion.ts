import {useLayoutEffect, type RefObject} from 'react';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ignoreMobileResize:true});
export {gsap,ScrollTrigger};
export function useMotion(setup:()=>void,scope:RefObject<HTMLElement|null>,deps:unknown[]=[]){
 useLayoutEffect(()=>{const mm=gsap.matchMedia();mm.add('(prefers-reduced-motion: no-preference)',()=>{const ctx=gsap.context(setup,scope);return()=>ctx.revert();});return()=>mm.revert();},deps);
}