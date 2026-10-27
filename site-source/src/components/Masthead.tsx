import {useEffect,useRef,useState,type ReactNode} from 'react';
import {SplitText} from 'gsap/SplitText';
import {gsap,useMotion} from '../hooks/useMotion';
import Icon from './Icon';
import MarkField from './MarkField';
import {appURL} from './Content';
gsap.registerPlugin(SplitText);

/* Four marked papers. Blue is the student's pen, red is only ever the teacher's ink. */
type Paper={id:string;subject:string;paper:string;score:string;question:string;lines:string[];ink:string;inkAt:number;
 lost:string;title:string;body:string;next:string};
const papers:Paper[]=[
 {id:'maths',subject:'Maths',paper:'Paper 2 · Algebra',score:'27/40',question:'Solve (2x − 3)/(x + 1) = x − 2.',lines:['2x − 3 = x² − x − 2','0 = x² − 3x − 5'],ink:'sign?',inkAt:1,
  lost:'Question 6 · 3 of 5 marks lost',title:'Keep the sign. Then solve.',body:'−2 + 3 is +1, not −5. The equation is x² − 3x + 1 = 0, so x = (3 ± √5) / 2. Your method was right from there.',next:'Two sign-check questions are waiting for you.'},
 {id:'physics',subject:'Physics',paper:'Paper 4 · Forces',score:'31/40',question:'A 2.0 kg trolley accelerates at 3.0 m/s². Find the resultant force.',lines:['F = m × a = 2.0 × 3.0','F = 6'],ink:'unit?',inkAt:1,
  lost:'Question 3(b) · 1 of 3 marks lost',title:'Right method. One missing unit.',body:'Your working is correct. Your teacher is asking what the 6 measures: force is in newtons, so the answer is 6 N.',next:'Write the number and its unit together, every time.'},
 {id:'biology',subject:'Biology',paper:'Paper 4 · Transport',score:'22/30',question:'Explain why low oxygen reduces mineral uptake by root hair cells.',lines:['Without oxygen the roots','cannot take in minerals.'],ink:'why?',inkAt:1,
  lost:'Question 2 · 2 of 3 marks lost',title:'Follow the energy.',body:'Less oxygen means less aerobic respiration, so less ATP. Active transport needs ATP to move ions against their gradient.',next:'Say the mechanism, not just the result.'},
 {id:'chemistry',subject:'Chemistry',paper:'Paper 2 · Reactions',score:'35/40',question:'Write the balanced equation for hydrogen burning in oxygen.',lines:['2H₂ + O₂ → H₂O'],ink:'balance',inkAt:0,
  lost:'Question 5 · 1 of 2 marks lost',title:'Count the atoms on both sides.',body:'Four hydrogen atoms go in, so four must come out: 2H₂ + O₂ → 2H₂O. The products were right; the numbers were not.',next:'Check each element once before moving on.'},
];

function Sheet({p,i,active,onPick}:{p:Paper;i:number;active:boolean;onPick:(id:string)=>void}){
 return <button type="button" className="fan-sheet" data-i={i} data-active={active} aria-pressed={active} aria-label={`${p.subject} paper, ${p.score}. Show what Axon says`} onClick={()=>onPick(p.id)}>
  <span className="fs-head"><span><b>{p.subject}</b><small>{p.paper}</small></span><span className="fs-score">{p.score}<svg viewBox="0 0 120 60" aria-hidden="true"><path d="M70 6C34 3 6 15 7 32c1 18 33 25 60 23 30-2 48-13 46-28C111 12 90 4 62 6"/></svg></span></span>
  <span className="fs-q">{p.question}</span>
  {p.lines.map((l,n)=><span className="fs-line" key={n}>{l}{n===p.inkAt&&<em className="fs-ink">{p.ink}</em>}</span>)}
  <span className="fs-rule"/><span className="fs-rule short"/>
 </button>;
}

export default function Masthead(){
 const ref=useRef<HTMLElement>(null),[active,setActive]=useState('physics'),touched=useRef(false);
 const note=papers.find(p=>p.id===active)!;
 const pick=(id:string)=>{touched.current=true;setActive(id);};

 useEffect(()=>{const header=document.querySelector('.header');const on=()=>header?.classList.toggle('is-scrolled',scrollY>innerHeight*.6);on();addEventListener('scroll',on,{passive:true});return()=>removeEventListener('scroll',on);},[]);
 useEffect(()=>{
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  let visible=true;const io=new IntersectionObserver(([e])=>{visible=e.isIntersecting;});io.observe(ref.current!);
  const timer=setInterval(()=>{if(touched.current||!visible||document.hidden)return;setActive(a=>papers[(papers.findIndex(p=>p.id===a)+1)%papers.length].id);},6000);
  return()=>{clearInterval(timer);io.disconnect();};
 },[]);
 /* The fan leans gently toward the pointer. */
 useEffect(()=>{
  const root=ref.current!,fan=root.querySelector<HTMLElement>('.fan')!;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const qx=gsap.quickTo(fan,'rotationY',{duration:.9,ease:'power3.out'}),qy=gsap.quickTo(fan,'rotationX',{duration:.9,ease:'power3.out'});
  const move=(e:PointerEvent)=>{if(e.pointerType!=='mouse')return;const x=e.clientX/innerWidth-.5,y=e.clientY/innerHeight-.5;qx(x*7);qy(-y*5);};
  root.addEventListener('pointermove',move,{passive:true});return()=>root.removeEventListener('pointermove',move);
 },[]);

 useMotion(()=>{
  const root=ref.current!,title=root.querySelector<HTMLElement>('.masthead-title')!;let split:SplitText|undefined,cancelled=false;
  gsap.set(title,{autoAlpha:0});
  document.fonts.ready.then(()=>{if(cancelled)return;
   split=SplitText.create(title,{type:'lines,words',mask:'lines',linesClass:'masthead-line'});gsap.set(title,{autoAlpha:1});
   gsap.fromTo(split.words,{yPercent:115},{yPercent:0,duration:1,stagger:.06,ease:'power4.out',force3D:true});
  });
  gsap.timeline({defaults:{ease:'power3.out'}})
   .from('.masthead-sub, .masthead-actions',{y:16,opacity:0,duration:.7,stagger:.08,clearProps:'transform,opacity'},.45)
   .from('.fan-sheet',{y:240,opacity:0,duration:1.2,stagger:.09,ease:'expo.out',clearProps:'opacity,y'},.55)
   .from('.axon-note',{y:30,opacity:0,duration:.8,clearProps:'transform,opacity'},1.3);
  gsap.to('.fan',{yPercent:-6,ease:'none',scrollTrigger:{trigger:root,start:'top top',end:'bottom top',scrub:.6}});
  return()=>{cancelled=true;split?.revert();};
 },ref);

 return <section id="top" className="masthead" ref={ref} aria-labelledby="masthead-title">
  <MarkField/>
  <div className="masthead-copy">
   <h1 id="masthead-title" className="masthead-title">Every lost mark,<br/>finally explained.</h1>
   <p className="masthead-sub">Scan the paper your teacher marked. Axon reads their ink and shows you why each mark went, and what to do next.</p>
   <div className="masthead-actions">
    <a className="masthead-button" href={appURL}>Explore Axon<Icon name="arrow"/></a>
    <a className="masthead-link" href="#how-it-works">See how it works<Icon name="down"/></a>
   </div>
  </div>

  <div className="masthead-stage">
   <div className="fan" role="group" aria-label="Four marked papers. Choose one to read Axon’s explanation.">
    {papers.map((p,i)=><Sheet key={p.id} p={p} i={i} active={p.id===active} onPick={pick}/>)}
   </div>
   <Note note={note}><span className="note-pager" aria-hidden="true">{papers.map(p=><i key={p.id} data-on={p.id===active}/>)}</span></Note>
  </div>
 </section>;
}

function Note({note,children}:{note:Paper;children:ReactNode}){
 return <aside className="axon-note" aria-live="polite" key={note.id}>
  <p className="note-quote">Your teacher wrote <q>{note.ink}</q></p>
  <h2>{note.title}</h2>
  <p className="note-body">{note.body}</p>
  <p className="note-next"><Icon name="spark"/>{note.next}</p>
  <div className="note-foot"><span>{note.lost}</span>{children}</div>
 </aside>;
}
