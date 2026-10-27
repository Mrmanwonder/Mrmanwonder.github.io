import {useEffect,useRef,useState} from 'react';
import {SplitText} from 'gsap/SplitText';
import {gsap,useMotion} from '../hooks/useMotion';
import Icon from './Icon';
import {appURL} from './Content';
gsap.registerPlugin(SplitText);

/* Each teacher mark on the paper, and what Axon says about it. */
type Note={id:string;ink:string;title:string;body:string;next:string;lost:string};
const notes:Note[]=[
 {id:'unit',ink:'unit?',lost:'Question 3(b) · 1 of 3 marks lost',title:'Right method. One missing unit.',
  body:'Your working is correct: F = ma = 2.0 × 3.0 = 6. Your teacher is asking what the 6 measures. Force is measured in newtons, so the answer is 6 N.',
  next:'Write the number and its unit together, every time.'},
 {id:'force',ink:'which force?',lost:'Question 4 · 1 of 2 marks lost',title:'Name the force that grows.',
  body:'“Friction” is too general for this mark. Air resistance increases with speed, so the resultant force falls, and the acceleration falls with it.',
  next:'Three short questions on resultant force are ready for you.'},
 {id:'total',ink:'31/40',lost:'Whole paper · 9 marks lost',title:'Nine marks lost. One habit behind five.',
  body:'Five of the nine marks went on wording: missing units and forces not named precisely. That is one habit to fix, not nine new topics.',
  next:'Your weekly summary will show whether the habit is changing.'},
];

function Mark({note,active,onPick,className,children}:{note:Note;active:boolean;onPick:(id:string)=>void;className:string;children:React.ReactNode}){
 return <button type="button" className={'ink-mark '+className} aria-pressed={active} aria-controls="masthead-note" aria-label={`Teacher wrote “${note.ink}”. Show Axon’s explanation`} onClick={()=>onPick(note.id)}>{children}</button>;
}
const Tick=({d='M2 12 8 18 22 3'}:{d?:string})=><svg className="ink-stroke tick" viewBox="0 0 24 21" aria-hidden="true"><path d={d}/></svg>;

export default function Masthead(){
 const ref=useRef<HTMLElement>(null),[active,setActive]=useState('unit'),touched=useRef(false);
 const note=notes.find(n=>n.id===active)!;
 const pick=(id:string)=>{touched.current=true;setActive(id);};

 useEffect(()=>{const header=document.querySelector('.header');const on=()=>header?.classList.toggle('is-scrolled',scrollY>innerHeight*.6);on();addEventListener('scroll',on,{passive:true});return()=>removeEventListener('scroll',on);},[]);

 /* Gentle tour of the three marks until the visitor chooses one. */
 useEffect(()=>{
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  let visible=true;const io=new IntersectionObserver(([e])=>{visible=e.isIntersecting;});io.observe(ref.current!);
  const timer=setInterval(()=>{if(touched.current||!visible||document.hidden)return;setActive(a=>notes[(notes.findIndex(n=>n.id===a)+1)%notes.length].id);},6500);
  return()=>{clearInterval(timer);io.disconnect();};
 },[]);

 useMotion(()=>{
  const root=ref.current!,title=root.querySelector<HTMLElement>('.masthead-title')!;let split:SplitText|undefined,cancelled=false;
  gsap.set(title,{autoAlpha:0});
  document.fonts.ready.then(()=>{if(cancelled)return;
   split=SplitText.create(title,{type:'lines',mask:'lines',linesClass:'masthead-line'});
   gsap.set(title,{autoAlpha:1});
   gsap.fromTo(split.lines,{yPercent:110},{yPercent:0,duration:.95,stagger:.11,ease:'power4.out',force3D:true});
  });
  const strokes=root.querySelectorAll<SVGPathElement|SVGEllipseElement>('.ink-stroke path,.ink-stroke ellipse');
  strokes.forEach(s=>{const l=(s as SVGGeometryElement).getTotalLength();gsap.set(s,{strokeDasharray:l,strokeDashoffset:l});});
  const tl=gsap.timeline({defaults:{ease:'power3.out'}});
  tl.from('.masthead-copy > p, .masthead-actions, .masthead-fact',{y:18,opacity:0,duration:.7,stagger:.08,clearProps:'transform,opacity'},.35)
   .from('.exam-sheet',{y:40,rotate:-4,opacity:0,duration:1.1,ease:'expo.out',clearProps:'opacity'},.15)
   .from('.student-ink',{opacity:0,duration:.5,stagger:.12,clearProps:'opacity'},.7)
   .to(strokes,{strokeDashoffset:0,duration:.38,stagger:.14,ease:'power1.inOut'},1.15)
   .from('.ink-word',{opacity:0,scale:.9,duration:.35,stagger:.14,clearProps:'opacity,transform'},1.35)
   .from('.axon-note',{y:24,opacity:0,duration:.8,clearProps:'transform,opacity'},2.05);
  /* The paper drifts very slightly with the scroll. */
  gsap.to('.exam-sheet',{yPercent:-6,rotate:-.4,ease:'none',scrollTrigger:{trigger:root,start:'top top',end:'bottom top',scrub:.6}});
  return()=>{cancelled=true;split?.revert();};
 },ref);

 return <section id="top" className="masthead" ref={ref} aria-labelledby="masthead-title">
  <div className="masthead-copy">
   <h1 id="masthead-title" className="masthead-title">Your marks.<br/>Your next move.</h1>
   <p>Scan a paper your teacher has marked. Axon explains each lost mark, right beside their ink.</p>
   <div className="masthead-actions">
    <a className="masthead-button" href={appURL}>Explore Axon<Icon name="arrow"/></a>
    <a className="masthead-link" href="#how-it-works">See how it works<Icon name="down"/></a>
   </div>
   <p className="masthead-fact">Scanning and explanations are free, for every paper.</p>
  </div>

  <div className="masthead-stage">
   <figure className="exam-sheet" data-ui aria-label="A marked physics paper. Tap a red mark to read Axon’s explanation.">
    <header className="sheet-head">
     <div><strong>Physics</strong><span>Paper 4 · Forces and motion</span></div>
     <Mark note={notes[2]} active={active==='total'} onPick={pick} className="score">
      <span className="ink-word">31<i>/</i>40</span>
      <svg className="ink-stroke ring" viewBox="0 0 120 64" aria-hidden="true"><path d="M70 6C34 3 6 15 7 33c1 19 33 27 60 25 30-2 48-14 46-29C111 13 90 4 62 6"/></svg>
     </Mark>
    </header>

    <div className="sheet-q">
     <p className="q-text"><b>3 (b)</b> A 2.0 kg trolley accelerates at 3.0 m/s². Calculate the resultant force acting on it.<span className="q-marks">[3]</span></p>
     <div className="answer">
      <span className="student-ink">F = m × a</span><Tick/>
      <span className="student-ink">F = 2.0 × 3.0</span><Tick/>
      <span className="student-ink last">F = 6 <Mark note={notes[0]} active={active==='unit'} onPick={pick} className="margin-note"><span className="ink-word">unit?</span></Mark></span>
     </div>
     <span className="margin-score ink-word" aria-label="2 marks of 3">2</span>
    </div>

    <div className="sheet-q">
     <p className="q-text"><b>4</b> Explain why the trolley’s acceleration decreases as its speed increases.<span className="q-marks">[2]</span></p>
     <div className="answer">
      <span className="student-ink">The <Mark note={notes[1]} active={active==='force'} onPick={pick} className="underline-note"><span className="underlined">friction</span><svg className="ink-stroke squiggle" viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true"><path d="M1 6c10-5 18 4 28 0s18-4 28 0 18 4 28 0 10-3 14-1"/></svg><span className="ink-word">which force?</span></Mark> gets bigger</span>
      <span className="student-ink">as it goes faster.</span><Tick d="M2 12 8 18 22 3"/>
     </div>
     <span className="margin-score ink-word" aria-label="1 mark of 2">1</span>
    </div>
   </figure>

   <aside id="masthead-note" className="axon-note" aria-live="polite" key={note.id}>
    <p className="note-quote">Your teacher wrote <q>{note.ink}</q></p>
    <h2>{note.title}</h2>
    <p className="note-body">{note.body}</p>
    <p className="note-next"><Icon name="spark"/>{note.next}</p>
    <div className="note-foot"><span>{note.lost}</span><span className="note-pager" aria-hidden="true">{notes.map(n=><i key={n.id} data-on={n.id===active}/>)}</span></div>
   </aside>
  </div>
 </section>;
}
