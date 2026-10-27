import {useEffect,useRef,useState} from 'react';
import achievements from '../achievements.json';
import {gsap,ScrollTrigger,useMotion} from '../hooks/useMotion';
import Dropdown from './Dropdown';
import Icon from './Icon';
export default function Achievements(){
 const ref=useRef<HTMLElement>(null),badge=useRef<HTMLImageElement>(null),[category,setCategory]=useState('all'),[expanded,setExpanded]=useState(false),[selected,setSelected]=useState(achievements[0]);
 const categories=Array.from(new Set(achievements.map(a=>a.category)));
 const filtered=achievements.filter(a=>category==='all'||a.category===category),shown=expanded?filtered:filtered.slice(0,8);
 useMotion(()=>{gsap.from('.achievement-heading,.achievement-feature',{opacity:0,y:20,duration:.7,stagger:.1,clearProps:'opacity,transform',scrollTrigger:{trigger:ref.current,start:'top 80%',once:true}});},ref);
 useEffect(()=>{ScrollTrigger.refresh(true);},[expanded,category]);
 useEffect(()=>{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const tween=gsap.fromTo(badge.current,{scale:.88,rotation:-5,opacity:.5},{scale:1,rotation:0,opacity:1,duration:.7,ease:'back.out(1.3)',clearProps:'transform,opacity'});return()=>{tween.kill();};},[selected]);
 return <section className="achievements-section section-pad" id="achievements" ref={ref} aria-labelledby="achievements-title">
 <div className="achievement-heading"><div><span className="eyebrow">EVERY CONNECTION COUNTS</span><h2 id="achievements-title">Small steps.<br/>Worth noticing.</h2></div><p>Review. Reflect. Try again.<br/>Recognise the habits you build.</p></div>
 <div className="achievement-layout"><div className="achievement-feature" style={{'--badge-hue':selected.hue} as React.CSSProperties}>
 <div className="achievement-glow" aria-hidden="true"/><img ref={badge} src={selected.image} alt={selected.title+' achievement badge'} width="264" height="288" loading="lazy" decoding="async"/>
 <span className="achievement-category">{selected.category} <span>· {selected.tier} / {selected.tiers_in_category}</span></span><h3>{selected.title}</h3><p>{selected.description}</p><div className="achievement-unlock"><Icon name="check"/><span>{selected.unlock}</span></div>
 </div><div className="achievement-catalogue"><div className="achievement-toolbar"><span>{filtered.length} achievements to explore</span><Dropdown label="Achievement category" value={category} onChange={value=>{setCategory(value);setExpanded(false);setSelected(achievements.find(item=>value==='all'||item.category===value)||achievements[0]);}} options={[{value:'all',label:'All achievements'},...categories.map(value=>({value,label:value}))]}/></div>
 <ul className="achievement-list" aria-label="Axon achievements">{shown.map(item=><li key={item.id}><button type="button" aria-pressed={selected.id===item.id} onClick={()=>setSelected(item)}><img src={item.image} alt="" width="80" height="88" loading="lazy" decoding="async"/><span>{item.title}</span><small>{item.category}</small></button></li>)}</ul>
 {filtered.length>8&&<button className="achievement-more" onClick={()=>setExpanded(value=>!value)} aria-expanded={expanded}>{expanded?'Show fewer':'Explore all '+filtered.length+' achievements'}<Icon name={expanded?'up':'down'}/></button>}
 <p className="achievement-note">A preview of Axon’s achievements. Your progress lives in your account.</p>
 </div></div></section>;
}
