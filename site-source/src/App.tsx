import {useSectionNavigation} from './hooks/useSectionNavigation';
import {useEffect,useState} from 'react';
import Masthead from './components/Masthead';
import {Header,Slogan,Process,Papers} from './components/Content';
import Analytics from './components/Analytics';
import Practice from './components/Practice';
import Achievements from './components/Achievements';
import {AroundYou,FAQ,Footer} from './components/Endings';
import {gsap,ScrollTrigger} from './hooks/useMotion';
export default function App(){
 const [dark,setDark]=useState(false);useSectionNavigation();
 useEffect(()=>{document.body.dataset.mockTheme=dark?'dark':'light';},[dark]);
 useEffect(()=>{const refresh=()=>ScrollTrigger.refresh();document.fonts.ready.then(refresh);window.addEventListener('load',refresh,{once:true});return()=>window.removeEventListener('load',refresh);},[]);
 useEffect(()=>{const mm=gsap.matchMedia();mm.add('(prefers-reduced-motion: no-preference) and (min-width:900px)',()=>{
  [['.papers-section .section-heading',-22],['.practice-intro',-24]].forEach(([selector,y])=>{const el=document.querySelector(selector as string);if(el)gsap.fromTo(el,{y:16},{y,force3D:true,ease:'none',scrollTrigger:{trigger:el.parentElement,start:'top bottom',end:'bottom top',scrub:.9}});});
 });return()=>mm.revert();},[]);
 const toggle=()=>setDark(v=>!v);
 return <><a className="skip-link" href="#how-it-works">Skip to how Axon works</a><Header/><main><Masthead/><Slogan/><Process dark={dark} toggle={toggle}/><Papers dark={dark} toggle={toggle}/><Analytics/><Practice dark={dark} toggle={toggle}/><Achievements/><AroundYou/><FAQ/></main><Footer/></>;
}
