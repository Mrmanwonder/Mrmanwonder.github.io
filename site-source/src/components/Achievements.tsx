import {useEffect,useRef,useState} from 'react';
import achievements from '../achievements.json';
import {gsap,useMotion} from '../hooks/useMotion';
import Icon from './Icon';

/* Recognition, not points: the 23 badges as seven paths of progress,
   shown for one example student eight papers into a term. */
type Badge=typeof achievements[number];
const earned=new Set([1,2,3,4,7,8,10,11,14,18,20,21]);
const paths=Array.from(new Set(achievements.map(a=>a.category))).map(name=>({name,badges:achievements.filter(a=>a.category===name),hue:achievements.find(a=>a.category===name)!.hue}));
const shortName:Record<string,string>={'Review & Reflection':'Review and reflection','Exploration & Coverage':'Exploration','Recovery & Resilience':'Coming back','Paper & Question Milestones':'Papers reviewed'};

export default function Achievements(){
 const ref=useRef<HTMLElement>(null),art=useRef<HTMLDivElement>(null),[selected,setSelected]=useState<Badge>(achievements.find(a=>a.id===11)!);
 const done=earned.has(selected.id),path=paths.find(p=>p.name===selected.category)!;
 const next=path.badges.find(b=>!earned.has(b.id));

 /* The featured badge turns toward the pointer, like an object you can pick up. */
 useEffect(()=>{
  const el=art.current!,root=ref.current!;if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const rx=gsap.quickTo(el,'rotationX',{duration:.8,ease:'power3.out'}),ry=gsap.quickTo(el,'rotationY',{duration:.8,ease:'power3.out'});
  const move=(e:PointerEvent)=>{if(e.pointerType!=='mouse')return;const r=el.getBoundingClientRect(),x=(e.clientX-(r.left+r.width/2))/innerWidth,y=(e.clientY-(r.top+r.height/2))/innerHeight;ry(Math.max(-22,Math.min(22,x*60)));rx(Math.max(-18,Math.min(18,-y*50)));};
  const leave=()=>{rx(0);ry(0);};
  root.addEventListener('pointermove',move,{passive:true});root.addEventListener('pointerleave',leave);
  return()=>{root.removeEventListener('pointermove',move);root.removeEventListener('pointerleave',leave);};
 },[]);
 useEffect(()=>{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const t=gsap.fromTo(art.current!.querySelector('img'),{scale:.86,rotation:-8,opacity:.4},{scale:1,rotation:0,opacity:1,duration:.75,ease:'back.out(1.4)',clearProps:'transform,opacity'});return()=>{t.kill();};},[selected]);
 useMotion(()=>{
  const root=ref.current!;
  gsap.timeline({scrollTrigger:{trigger:root,start:'top 72%',once:true},defaults:{ease:'power3.out'}})
   .from('.bg-head > *',{y:20,opacity:0,duration:.8,stagger:.08,clearProps:'transform,opacity'})
   .from('.bg-feature',{y:40,opacity:0,duration:1,clearProps:'transform,opacity'},.1);
  root.querySelectorAll<HTMLElement>('.bg-path').forEach((row,i)=>{
   gsap.timeline({scrollTrigger:{trigger:row,start:'top 92%',once:true}})
    .from(row.querySelectorAll('.bg-badge'),{scale:.6,opacity:0,duration:.6,stagger:.07,ease:'back.out(1.6)',clearProps:'transform,opacity'},i*.02)
    .from(row.querySelector('.bg-track-fill'),{scaleX:0,duration:.9,ease:'power2.out',clearProps:'transform'},.15);
  });
 },ref);

 return <section className="badges-scene" id="achievements" ref={ref} aria-labelledby="achievements-title">
  <div className="bg-head">
   <h2 id="achievements-title">Small steps,<br/>worth noticing.</h2>
   <p>Axon recognises the habits that win marks back: reviewing, trying again, coming back after a hard paper. No points. No leaderboards.</p>
  </div>

  <div className="bg-feature" style={{['--hue' as string]:selected.hue}} aria-live="polite">
   <div className="bg-art" ref={art}><img src={selected.image} alt={selected.title+' badge'} width="264" height="288" data-earned={done}/></div>
   <div className="bg-copy">
    <p className="bg-meta">{selected.category} · {selected.tier} of {selected.tiers_in_category}</p>
    <h3>{selected.title}</h3>
    <p className="bg-desc">{selected.description}</p>
    <p className="bg-unlock" data-earned={done}><Icon name={done?'check':'clock'}/><span>{done?'Earned. ':'Still to come. '}{selected.unlock}</span></p>
    {done&&next&&<button type="button" className="bg-next" onClick={()=>setSelected(next)}>Next on this path: {next.title}<Icon name="arrow"/></button>}
   </div>
  </div>

  <div className="bg-paths">
   {paths.map(p=>{const got=p.badges.filter(b=>earned.has(b.id)).length;return <div className="bg-path" key={p.name} style={{['--hue' as string]:p.hue,['--fill' as string]:`${p.badges.length>1?Math.max(0,(got-1)/(p.badges.length-1))*100:0}%`}}>
    <div className="bg-path-head"><h3>{shortName[p.name]||p.name}</h3><span>{got} of {p.badges.length}</span></div>
    <ol className="bg-row" style={{['--n' as string]:p.badges.length}}>
     <span className="bg-track" aria-hidden="true"><i className="bg-track-fill"/></span>
     {p.badges.map(b=><li key={b.id}><button type="button" className="bg-badge" data-earned={earned.has(b.id)} aria-pressed={selected.id===b.id} aria-label={`${b.title}, ${earned.has(b.id)?'earned':'still to come'}`} onClick={()=>setSelected(b)}><img src={b.image} alt="" width="80" height="88" loading="lazy" decoding="async"/></button><span className="bg-name">{b.title}</span></li>)}
    </ol>
   </div>;})}
  </div>
  <p className="bg-foot">Shown for one example student, eight papers into a term. Your own progress lives in your account.</p>
 </section>;
}
