import {processStartEvent} from '../hooks/useSectionNavigation';
import {useEffect,useRef,useState,lazy,Suspense,type ReactNode} from 'react';
const MathRenderer=lazy(()=>import('./Formula'));
import {gsap,ScrollTrigger,useMotion} from '../hooks/useMotion';
import Icon from './Icon';
import Dropdown from './Dropdown';
import DotField from './DotField';
import {SplitText} from 'gsap/SplitText';
import {useAdaptiveLogo} from '../hooks/useAdaptiveLogo';
import {useMobileMenu} from '../hooks/useMobileMenu';
const Mockup=lazy(()=>import('./Mockup'));
gsap.registerPlugin(SplitText);
export const appURL='https://axonstudy.online/app';
export function Button({children='Explore Axon',href=appURL}:{children?:ReactNode;href?:string}){return <a className="primary-button" href={href}>{children}<Icon name="arrow"/></a>;}
export function ThemeButton({dark,toggle}:{dark:boolean;toggle:()=>void}){return <button className="theme-button" type="button" onClick={toggle} title="Change preview appearance" aria-label={'Switch mockups to '+(dark?'light':'dark')+' appearance'} aria-pressed={dark}><Icon name={dark?'moon':'sun'}/></button>;}
export function Formula(props:{tex:string;inline?:boolean}){
 const ref=useRef<HTMLSpanElement>(null),[visible,setVisible]=useState(false);
 useEffect(()=>{const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){setVisible(true);observer.disconnect();}},{rootMargin:'250px'});observer.observe(ref.current!);return()=>observer.disconnect();},[]);
 return <span ref={ref} className="formula-slot">{visible?<Suspense fallback={<span className="math-placeholder" aria-label="Loading equation"/>}><MathRenderer {...props}/></Suspense>:<span className="math-placeholder" aria-label="Equation"/>}</span>;
}
export function Header(){
 const [open,setOpen]=useState(false),brand=useRef<HTMLAnchorElement>(null),nav=useRef<HTMLElement>(null),menu=useRef<HTMLButtonElement>(null);useAdaptiveLogo(brand);useMobileMenu(nav,open);
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key==='Escape'&&menu.current?.getAttribute('aria-expanded')==='true'){setOpen(false);menu.current?.focus();}};document.addEventListener('keydown',key);return()=>document.removeEventListener('keydown',key);},[]);
 return <header className="header"><a ref={brand} href="#top" className="brand" aria-label="Axon home"><img className="lockup-dark" src="/assets/lockup.svg" width="153" height="30" alt="Axon"/><img className="lockup-light" src="/assets/lockup.svg" width="153" height="30" alt="" aria-hidden="true"/></a><nav ref={nav} id="main-navigation" className={open?'open':''} aria-label="Main navigation"><a href="#how-it-works" onClick={()=>setOpen(false)}>How it works</a><a href="#perspective" onClick={()=>setOpen(false)}>Your perspective</a><a href="#your-papers" onClick={()=>setOpen(false)}>Your papers</a></nav><Button/><button ref={menu} className="menu-button" aria-controls="main-navigation" aria-label={open?'Close navigation':'Open navigation'} aria-expanded={open} onClick={()=>setOpen(v=>!v)}><Icon name="menu"/></button></header>;
}
export function Hero(){
 const ref=useRef<HTMLElement>(null);
 useMotion(()=>{
  const title=ref.current!.querySelector<HTMLElement>('.hero-title')!;let split:SplitText|undefined,cancelled=false;
  gsap.set(title,{autoAlpha:0});
  document.fonts.ready.then(()=>{if(cancelled)return;
   split=SplitText.create(title,{type:'lines',mask:'lines',autoSplit:true,linesClass:'hero-reveal-line',onSplit:self=>{
    self.masks.forEach(mask=>{const el=mask as HTMLElement;el.style.padding='.16em .1em';el.style.margin='-.16em -.1em';});
    return gsap.fromTo(self.lines,{yPercent:115},{yPercent:0,duration:.9,stagger:.13,ease:'power4.out',force3D:true,onComplete:()=>{self.masks.forEach(mask=>(mask as HTMLElement).style.overflow='visible');}});
   }});gsap.set(title,{autoAlpha:1});
  });
  const entrance=gsap.timeline({defaults:{ease:'power3.out'}});
  entrance.from('.hero-copy>p',{y:12,opacity:0,duration:.7,clearProps:'transform,opacity'},.2)
   .from('.hero-sequence>div',{y:14,opacity:0,duration:.7,stagger:.08,clearProps:'transform,opacity'},.4)
   .from('.dot-field',{opacity:0,duration:1,clearProps:'opacity'},0);
  return()=>{cancelled=true;split?.revert();title.style.removeProperty('opacity');title.style.removeProperty('visibility');};
 },ref);
 return <section id="top" className="hero" data-header-tone="dark" ref={ref}><DotField/><div className="hero-copy"><h1 className="hero-title">Your marks.<br/>Your next move.</h1><p>Turn your teacher’s feedback into understanding.</p><div className="hero-actions"><Button/><a className="text-link hero-secondary" href="#how-it-works">How it works <Icon name="down"/></a></div></div><div className="hero-sequence">{[['scan','Scan','Bring your marked paper.'],['paper','Review','Confirm what was read.'],['spark','Understand','Find your next step.']].map(([icon,title,sub])=><div key={title}><Icon name={icon}/><div><strong>{title}</strong><p>{sub}</p></div></div>)}</div></section>;
}
export function Slogan(){
 const ref=useRef<HTMLElement>(null);
 useMotion(()=>{
  const track=ref.current!.querySelector<HTMLElement>('.slogan-track')!,mm=gsap.matchMedia();
  mm.add('(min-width:801px)',()=>{gsap.fromTo(track,{x:()=>-innerWidth*.04},{x:()=>-Math.min(innerWidth*.32,440),force3D:true,ease:'none',scrollTrigger:{trigger:ref.current,start:'top bottom',end:'bottom top',scrub:.28,invalidateOnRefresh:true}});});
  mm.add('(max-width:800px)',()=>{
   let loop:gsap.core.Tween|undefined,visible=false,disposed=false,width=0;
   const sync=()=>{if(visible&&!document.hidden)loop?.play();else loop?.pause();};
   const measure=()=>{const next=track.firstElementChild!.getBoundingClientRect().width;if(Math.abs(next-width)<1)return;const phase=loop?.progress()??0;width=next;loop?.kill();gsap.set(track,{x:0});loop=gsap.to(track,{x:-width,duration:width/42,repeat:-1,ease:'none',paused:true,force3D:true}).progress(phase);sync();};
   const size=new ResizeObserver(measure);size.observe(track.firstElementChild!);
   const observer=new IntersectionObserver(([e])=>{visible=e.isIntersecting;sync();});observer.observe(ref.current!);
   document.addEventListener('visibilitychange',sync);measure();document.fonts.ready.then(()=>{if(!disposed)measure();});
   return()=>{disposed=true;size.disconnect();observer.disconnect();document.removeEventListener('visibilitychange',sync);loop?.kill();};
  });return()=>mm.revert();
 },ref);
 return <section ref={ref} className="slogan" data-header-tone="dark" aria-label="Understand the feedback. Know what to revisit."><div className="slogan-track" aria-hidden="true">{[0,1,2].map(n=><span key={n}>Understand the feedback.<Icon name="spark"/>Know what to revisit.<Icon name="spark"/></span>)}</div></section>;
}
export function Process({dark,toggle}:{dark:boolean;toggle:()=>void}){
 const ref=useRef<HTMLElement>(null),flow=useRef<ScrollTrigger|null>(null),[active,setActive]=useState(0),[mount,setMount]=useState(false);
 useEffect(()=>{const observer=new IntersectionObserver(e=>{if(e.some(x=>x.isIntersecting)){setMount(true);observer.disconnect();}},{rootMargin:'400px'});observer.observe(ref.current!);return()=>observer.disconnect();},[]);
 useEffect(()=>{const mm=gsap.matchMedia();mm.add({motion:'(prefers-reduced-motion:no-preference)',desktop:'(min-width:900px) and (min-height:650px)'},context=>{
  if(!context.conditions?.motion)return;const desktop=Boolean(context.conditions.desktop);
  const ctx=gsap.context(()=>{const panels=ref.current!.querySelectorAll<HTMLElement>('.process-panel');let previous=-1;
   gsap.set(panels,{opacity:0,y:0});gsap.set(panels[0],{opacity:1});
   const tl=gsap.timeline({scrollTrigger:{id:'paper-process',trigger:ref.current,start:'top top',end:desktop?()=>'+='+innerHeight*2.2:'bottom 25%',pin:desktop,scrub:.25,invalidateOnRefresh:true},onUpdate:()=>{const step=tl.time()<1.15?0:tl.time()<2.1?1:2;if(step!==previous){previous=step;setActive(step);}}});
   tl.to({},{duration:1},0)
    .to(panels[0],{opacity:0,duration:.22,ease:'none'},1.05).fromTo(panels[1],{opacity:0,y:18},{opacity:1,y:0,duration:.3,ease:'power2.out'},1.05)
    .to(panels[1],{opacity:0,y:-12,duration:.22,ease:'none'},2).fromTo(panels[2],{opacity:0,y:18},{opacity:1,y:0,duration:.3,ease:'power2.out'},2).to({},{duration:.7},2.3);
   flow.current=tl.scrollTrigger!;
  },ref);return()=>{flow.current=null;ctx.revert();};
 });return()=>mm.revert();},[]);
 useEffect(()=>{const restart=()=>{flow.current?.getTween()?.progress(1);flow.current?.animation?.progress(0);setActive(0);};window.addEventListener(processStartEvent,restart);return()=>window.removeEventListener(processStartEvent,restart);},[]);
 const steps=[['Bring your paper.','Scan the exam your teacher has already marked.'],['Check the reading.','Confirm your answers and the marks Axon reads.'],['Understand the feedback.','Connect each note to the working behind it.']];
 function select(i:number){if(flow.current)window.scrollTo({top:flow.current.start+([.12,.52,.88][i])*(flow.current.end-flow.current.start),behavior:'smooth'});else setActive(i);}
 return <section ref={ref} id="how-it-works" className="process-section section-pad"><div className="section-heading"><span className="eyebrow">FROM PAPER TO PERSPECTIVE</span><h2>Your paper.<br/>One clear next step.</h2></div><div className="process-layout"><div className="process-steps">{steps.map(([title,sub],i)=><button type="button" key={title} className={i===active?'active':''} onClick={()=>select(i)} aria-pressed={i===active}><span className="step-number">0{i+1}</span><div><h3>{title}</h3><p>{sub}</p></div><Icon name="arrow"/></button>)}</div><div className="process-stage mock-surface">
 <div className="process-panel scan-panel" data-header-tone="dark" data-active={active===0} aria-hidden={active!==0} inert={active!==0}>{mount?<Suspense fallback={<div className="mockup-host"/>}><Mockup active={active===0}/></Suspense>:<div className="mockup-host"/>}</div>
 <div className="process-panel review-panel" data-active={active===1} aria-hidden={active!==1} inert={active!==1}><div className="mock-top"><span>REVIEW YOUR PAPER</span><ThemeButton dark={dark} toggle={toggle}/></div><div className="review-head"><span className="subject-badge">Physics</span><span>Question 04</span></div><h3>Calculate the resultant force.</h3><div className="review-working"><Formula tex={'\\begin{aligned} F&=ma\\\\ &=2\\times3\\\\ &=6 \\end{aligned}'}/><span className="teacher-ink">unit?</span></div><div className="review-row"><span>Teacher’s mark</span><b>2 / 3</b></div><div className="review-row"><span>Teacher’s note</span><b>Unit missing</b></div><span className="review-footer"><Icon name="paper"/>Check the source. Confirm the reading.</span></div>
 <div className="process-panel meaning-panel" data-active={active===2} aria-hidden={active!==2} inert={active!==2}><div className="mock-top"><span>UNDERSTAND THE DETAIL</span><ThemeButton dark={dark} toggle={toggle}/></div><div className="meaning-content"><span className="subject-badge">From your teacher’s feedback</span><h3>Right method.<br/>One missing detail.</h3><Formula tex={'F=2\\times3=\\boxed{6\\,\\mathrm{N}}'}/><p>The value is correct. The unit tells us what it measures.</p><div className="connection-note"><Icon name="link"/><span>Keep the number and its unit together.</span></div></div></div>
 </div></div></section>;
}
type Subject='physics'|'maths'|'biology';
const papers=[{id:'physics' as Subject,title:'Forces & motion',subject:'Physics',days:6,type:'school',question:'Calculate the resultant force.',answer:'F = 2 × 3 = 6',note:'Unit missing',marks:'2 / 3',search:'newtons force acceleration missing unit'},{id:'maths' as Subject,title:'Algebra & equations',subject:'Maths',days:42,type:'past',question:'Solve the equation exactly.',answer:'0 = x² − 3x − 5',note:'Check the constant term',marks:'2 / 5',search:'quadratic signs constant solutions'},{id:'biology' as Subject,title:'Transport in plants',subject:'Biology',days:75,type:'school',question:'Explain mineral ion uptake.',answer:'Without oxygen, roots cannot take in minerals.',note:'Link ATP to active transport',marks:'1 / 3',search:'root hair oxygen respiration ATP active transport'}];
export function Papers({dark,toggle}:{dark:boolean;toggle:()=>void}){
 const [query,setQuery]=useState(''),[subject,setSubject]=useState('all'),[date,setDate]=useState('all'),[type,setType]=useState('all'),[sort,setSort]=useState('recent'),[selected,setSelected]=useState<Subject>('physics');
 const shown=papers.filter(p=>(subject==='all'||p.id===subject)&&(date==='all'||p.days<=+date)&&(type==='all'||p.type===type)&&(p.title+' '+p.subject+' '+p.answer+' '+p.search).toLowerCase().includes(query.toLowerCase())).sort((a,b)=>sort==='subject'?a.subject.localeCompare(b.subject):sort==='oldest'?b.days-a.days:a.days-b.days);
 const root=useRef<HTMLElement>(null),example=useRef<HTMLDivElement>(null);
 useMotion(()=>{gsap.from('.paper-card',{y:30,opacity:0,stagger:.08,duration:.8,clearProps:'opacity,transform',scrollTrigger:{trigger:root.current,start:'top 80%',once:true}});},root);
 function choose(s:Subject){setSelected(s);example.current?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'});}
 return <section className="papers-section section-pad" id="your-papers" ref={root}><div className="section-heading horizontal"><div><span className="eyebrow">KEEP THE CONNECTIONS</span><h2>Every paper.<br/>More to understand.</h2></div><p>Your questions, answers and feedback.<br/>Always together.</p></div>
 <div className="paper-library mock-surface"><div className="library-toolbar"><label className="search-field"><Icon name="search"/><input aria-label="Search papers and answers" placeholder="Search papers, questions or your answers" value={query} onChange={e=>setQuery(e.target.value)}/>{query&&<button type="button" aria-label="Clear search" onClick={()=>setQuery('')}>×</button>}</label><ThemeButton dark={dark} toggle={toggle}/></div><div className="library-filters"><Dropdown label="Subject" value={subject} onChange={setSubject} options={[{value:'all',label:'All subjects'},...papers.map(p=>({value:p.id,label:p.subject}))]}/><Dropdown label="Date" value={date} onChange={setDate} options={[{value:'all',label:'Any date'},{value:'30',label:'Last 30 days'},{value:'90',label:'Last 90 days'}]}/><Dropdown label="Paper type" value={type} onChange={setType} options={[{value:'all',label:'All types'},{value:'school',label:'School test'},{value:'past',label:'Past paper'}]}/><span className="paper-count" aria-live="polite">{shown.length} {shown.length===1?'paper':'papers'}</span><Dropdown label="Sort papers" value={sort} onChange={setSort} options={[{value:'recent',label:'Most recent'},{value:'oldest',label:'Oldest first'},{value:'subject',label:'Subject A–Z'}]}/></div>
 <div className="paper-shelf">{shown.map(p=><button className="paper-card" key={p.id} onClick={()=>choose(p.id)}><div className="paper-mini"><div className="paper-mini-top"><span>{p.subject}</span><Icon name="paper"/></div><div className="paper-rule"/><span className="paper-question">{p.question}</span><div className="paper-answer">{p.answer}</div><span className="paper-annotation">{p.note}</span><div className="paper-mini-bottom"><span>Teacher’s mark</span><b>{p.marks}</b></div></div><div className="paper-card-label"><div><h3>{p.title}</h3><p>{p.type==='school'?'School test':'Past paper'} · {p.days} days ago</p></div><Icon name="arrow"/></div></button>)}</div>{!shown.length&&<p className="library-empty">No papers match those filters.</p>}</div>
 <div className="worked-example" id="explore" ref={example}><div className="example-tabs" role="tablist" aria-label="Worked example subject">{papers.map((p,i)=><button role="tab" aria-selected={selected===p.id} aria-controls="worked-panel" id={'tab-'+p.id} key={p.id} tabIndex={selected===p.id?0:-1} onKeyDown={e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const n=e.key==='Home'?0:e.key==='End'?papers.length-1:(i+(e.key==='ArrowRight'?1:-1)+papers.length)%papers.length;setSelected(papers[n].id);document.getElementById('tab-'+papers[n].id)?.focus();}}} onClick={()=>setSelected(p.id)}>{p.subject}</button>)}</div><div className="example-layout" id="worked-panel" role="tabpanel" aria-labelledby={'tab-'+selected} key={selected}><div className="example-source mock-surface"><div className="mock-top"><span>YOUR WORK</span><ThemeButton dark={dark} toggle={toggle}/></div><span className="subject-badge">{papers.find(p=>p.id===selected)!.subject}</span><h3>{selected==='maths'?'Solve the equation. Give both exact solutions.':selected==='biology'?'Explain why a lack of oxygen can reduce mineral ion uptake by root hair cells.':'Calculate the force on a 2 kg object accelerating at 3 m/s².'}</h3>{selected==='maths'?<><Formula tex={'\\frac{2x-3}{x+1}=x-2,\\quad x\\ne-1'}/><div className="student-answer"><Formula tex={'\\begin{aligned}2x-3&=x^2-x-2\\\\0&=x^2-3x-5\\end{aligned}'}/></div></>:selected==='physics'?<div className="student-answer"><Formula tex={'F=ma=2\\times3=6'}/></div>:<div className="student-answer"><p>“Without oxygen, the roots cannot take in minerals.”</p></div>}<div className="teacher-note"><span>TEACHER’S NOTE</span><p>“{papers.find(p=>p.id===selected)!.note}”</p></div></div>
 <div className="example-explanation"><span className="eyebrow">UNDERSTAND THE FEEDBACK</span><h3>{selected==='maths'?<>Keep the sign.<br/>Then solve.</>:selected==='biology'?<>Follow the energy.<br/>Explain the mechanism.</>:<>The value is right.<br/>Keep the unit.</>}</h3>{selected==='maths'?<div className="math-steps"><Formula tex={'\\begin{aligned}2x-3&=(x-2)(x+1)\\\\2x-3&=x^2-x-2\\\\0&=x^2-3x+1\\\\x&=\\frac{3\\pm\\sqrt{(-3)^2-4(1)(1)}}{2}\\\\x&=\\boxed{\\frac{3\\pm\\sqrt5}{2}}\\end{aligned}'}/><div className="important-detail"><Formula tex={'-2+3=\\color{#1f63d6}{+1},\\qquad x\\ne-1'}/></div></div>:selected==='biology'?<><p>Less oxygen limits aerobic respiration, reducing ATP production.</p><div className="biology-flow"><span>Less oxygen</span><Icon name="down"/><span>Less ATP available</span><Icon name="down"/><strong>Less active transport</strong></div><p className="important-detail">ATP powers the movement of mineral ions against their concentration gradient.</p></>:<><Formula tex={'F=ma=2\\times3=\\boxed{6\\,\\mathrm{N}}'}/><p>Your method and value are correct. <mark>Force is measured in newtons.</mark></p><div className="connection-note"><Icon name="link"/><span>Method. Value. Unit.<br/>Keep all three connected.</span></div></>}</div></div></div>
 </section>;
}
