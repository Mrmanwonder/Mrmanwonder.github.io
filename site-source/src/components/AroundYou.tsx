import {useEffect,useRef,useState,type ReactNode} from 'react';
import {gsap,useMotion} from '../hooks/useMotion';
import Icon from './Icon';

/* Built around you: one phone showing the student's own Axon.
   Each promise swaps the phone to the real screen it describes. */
type Promise={id:string;title:string;detail:string;link:string;href:string;screen:()=>ReactNode};

const Status=()=><div className="hs-status" aria-hidden="true"><span>9:41</span><i className="hs-island"/><span className="hs-signal"><b/><b/><b/><b/></span></div>;
const Top=({back,title,sub}:{back?:boolean;title:string;sub?:string})=><div className="hs-top">{back&&<span className="hs-back" aria-hidden="true"><Icon name="chevron"/></span>}<div><strong>{title}</strong>{sub&&<small>{sub}</small>}</div></div>;

const promises:Promise[]=[
 {id:'papers',title:'Your papers, in one place.',detail:'Every marked paper you scan, with its questions, your answers and your teacher’s notes, kept together.',link:'Browse your papers',href:'#your-papers',screen:()=><>
  <Top title="Papers" sub="12 this term"/>
  <div className="hs-search"><Icon name="search"/>Search questions or answers</div>
  <div className="hs-chips"><span data-on="true">All</span><span>Physics</span><span>Maths</span><span>Biology</span></div>
  {[['Physics','Paper 4 · Forces','31','40','2 days ago'],['Mathematics','Paper 2 · Algebra','27','40','Last week'],['Biology','Paper 4 · Transport','22','30','3 weeks ago'],['Chemistry','Paper 2 · Reactions','35','40','Last month'],['Physics','Paper 2 · Waves','28','40','Last month']].map(([s,p,a,b,d])=>
   <div className="hs-paper" key={s+p}><span className="hs-thumb"><i/><i/><i/><em>{a}</em></span><div><strong>{s}</strong><small>{p}</small><small>{d}</small></div><b>{a}<small>/{b}</small></b></div>)}
 </>},
 {id:'review',title:'You check the reading.',detail:'Before anything is explained, you see what Axon read from your paper and fix anything it got wrong.',link:'See how scanning works',href:'#how-it-works',screen:()=><>
  <Top back title="Check the reading" sub="Physics · Question 3(b)"/>
  <div className="hs-scan"><span className="hs-scan-pen">F = 2.0 × 3.0<br/>F = 6</span><span className="hs-scan-ink">unit?</span><span className="hs-scan-mark">2</span><i className="hs-corner c1"/><i className="hs-corner c2"/><i className="hs-corner c3"/><i className="hs-corner c4"/></div>
  <div className="hs-field"><small>Your answer</small><span>F = 6</span><Icon name="check"/></div>
  <div className="hs-field"><small>Teacher’s mark</small><span>2 of 3</span><Icon name="check"/></div>
  <div className="hs-field is-edit"><small>Teacher’s note</small><span>unit?<i className="hs-caret"/></span></div>
  <div className="hs-pages"><span>Page 2 of 4</span><span>3 answers read</span><span>1 to check</span></div>
  <div className="hs-actions"><span className="hs-btn ghost">Fix a reading</span><span className="hs-btn">Looks right</span></div>
 </>},
 {id:'teacher',title:'Your teacher’s marks stay the source.',detail:'Axon explains the marks your teacher gave. It never re-marks your paper or disagrees with them.',link:'See a worked example',href:'#explore',screen:()=><>
  <Top back title="Question 3(b)" sub="Physics · Paper 4"/>
  <div className="hs-given"><span>Teacher’s mark</span><b>2 / 3</b><small>Unchanged</small></div>
  <div className="hs-work"><span className="hs-scan-pen">F = m × a = 2.0 × 3.0</span><span className="hs-scan-pen">F = 6 <em>unit?</em></span></div>
  <div className="hs-explain"><strong>Right method. One missing unit.</strong><p>Your working is correct. Force is measured in newtons, so the answer is <mark>6 N</mark>.</p></div>
  <div className="hs-tip"><Icon name="spark"/>Write the number and its unit together.</div>
  <div className="hs-actions"><span className="hs-btn ghost">Ask a question</span><span className="hs-btn">Practise this</span></div>
 </>},
 {id:'practice',title:'Room to try again.',detail:'Short questions on the idea behind each lost mark, so you can practise it before the next test.',link:'Try a question',href:'#practice',screen:()=><>
  <Top back title="Try again" sub="Resultant force · 2 of 3"/>
  <div className="hs-progress"><i data-on="true"/><i data-on="true"/><i/></div>
  <p className="hs-ask">A 1.5 kg ball accelerates at 4.0 m/s². Calculate the resultant force.</p>
  <div className="hs-answer"><span>F = 1.5 × 4.0 = 6 N</span><em><Icon name="check"/>Correct, with the unit</em></div>
  <div className="hs-tip good"><Icon name="spark"/>That’s the habit your teacher asked for.</div>
  <div className="hs-actions"><span className="hs-btn">Next question</span></div>
 </>},
 {id:'patterns',title:'Your patterns, your next step.',detail:'Axon looks across all your papers and shows what keeps costing you marks, and what to work on first.',link:'See your perspective',href:'#perspective',screen:()=><>
  <Top title="This term" sub="8 papers · Physics"/>
  <div className="hs-chart" aria-hidden="true">{[16,17,18,20,19,22,23,24].map((m,i)=><span key={i} style={{['--h' as string]:`${(m-12)/12*100}%`}}><i/><small>{m}</small></span>)}</div>
  <p className="hs-label">Marks out of 30, rising.</p>
  <div className="hs-pattern"><b>Missing units</b><span>5 marks · 3 papers</span><i style={{['--w' as string]:'72%'}}/></div>
  <div className="hs-pattern"><b>Naming forces</b><span>3 marks · 2 papers</span><i style={{['--w' as string]:'44%'}}/></div>
  <div className="hs-pattern"><b>Rearranging</b><span>1 mark · 1 paper</span><i style={{['--w' as string]:'16%'}}/></div>
 </>},
 {id:'guardian',title:'Your guardian holds the account.',detail:'A parent or guardian owns the account and gets a short weekly digest. No behavioural ads, and no profiling.',link:'Read about your privacy',href:'https://axonstudy.online/privacy',screen:()=><>
  <Top title="Weekly digest" sub="To your guardian, then you"/>
  <div className="hs-digest"><small>This week</small><strong>3 papers scanned. Units are improving.</strong><p>Marks on force questions rose from 2/3 to 3/3 after practice.</p></div>
  <div className="hs-toggle"><span>Account held by<b>Your guardian</b></span><Icon name="shield"/></div>
  <div className="hs-toggle"><span>Behavioural ads<b>None</b></span><Icon name="check"/></div>
  <div className="hs-toggle"><span>Profiling<b>None</b></span><Icon name="check"/></div>
  <p className="hs-note">Your guardian sees the digest first. You can read it after.</p>
 </>},
];

export default function AroundYou(){
 const ref=useRef<HTMLElement>(null),phone=useRef<HTMLDivElement>(null),[active,setActive]=useState(0),touched=useRef(false);
 const choose=(i:number)=>{touched.current=true;setActive(i);};

 /* Tour the promises while in view, until the visitor picks one. */
 useEffect(()=>{
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  let visible=false;const io=new IntersectionObserver(([e])=>{visible=e.isIntersecting&&e.intersectionRatio>.35;},{threshold:[0,.35,.6]});io.observe(ref.current!);
  const timer=setInterval(()=>{if(!touched.current&&visible&&!document.hidden)setActive(a=>(a+1)%promises.length);},5200);
  return()=>{clearInterval(timer);io.disconnect();};
 },[]);
 /* The phone leans a little toward the pointer. */
 useEffect(()=>{
  const root=ref.current!,el=phone.current!;if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const rx=gsap.quickTo(el,'rotationX',{duration:1,ease:'power3.out'}),ry=gsap.quickTo(el,'rotationY',{duration:1,ease:'power3.out'});
  const move=(e:PointerEvent)=>{if(e.pointerType!=='mouse')return;const r=root.getBoundingClientRect();ry(((e.clientX-r.left)/r.width-.5)*10);rx(-((e.clientY-r.top)/r.height-.5)*8);};
  const leave=()=>{rx(0);ry(0);};
  root.addEventListener('pointermove',move,{passive:true});root.addEventListener('pointerleave',leave);
  return()=>{root.removeEventListener('pointermove',move);root.removeEventListener('pointerleave',leave);};
 },[]);
 useMotion(()=>{
  const root=ref.current!;
  gsap.timeline({scrollTrigger:{trigger:root,start:'top 70%',once:true},defaults:{ease:'power3.out'}})
   .from('.hs-head > *',{y:22,opacity:0,duration:.8,stagger:.08,clearProps:'transform,opacity'})
   .from('.hs-device',{y:80,opacity:0,duration:1.2,ease:'expo.out',clearProps:'opacity'},.1)
   .from('.hs-item',{y:16,opacity:0,duration:.6,stagger:.06,clearProps:'transform,opacity'},.3);
  gsap.to('.hs-dots',{yPercent:-10,ease:'none',scrollTrigger:{trigger:root,start:'top bottom',end:'bottom top',scrub:.6}});
 },ref);

 const p=promises[active];
 return <section ref={ref} className="hand-scene" id="built-around-you" aria-labelledby="support-title">
  <div className="hs-head">
   <h2 id="support-title">Built around you.</h2>
   <p>Six things that stay true for every paper you scan.</p>
  </div>
  <div className="hs-body">
   <ol className="hs-list">
    {promises.map((item,i)=><li className="hs-item" key={item.id} data-on={i===active}>
     <button type="button" aria-pressed={i===active} aria-controls="hs-screen" onClick={()=>choose(i)}><span className="hs-n" aria-hidden="true"/>{item.title}</button>
     <div className="hs-detail" hidden={i!==active}><p>{item.detail}</p><a href={item.href}>{item.link}<Icon name="arrow"/></a></div>
    </li>)}
   </ol>
   <div className="hs-stage">
    <div className="hs-dots" aria-hidden="true"/>
    <div className="hs-device" ref={phone}>
     <div className="hs-frame">
      <div id="hs-screen" className="hs-screen" role="img" aria-label={`Axon on a phone: ${p.title}`}>
       <Status/>
       <div className="hs-view" key={p.id} aria-hidden="true">{p.screen()}</div>
       <div className="hs-home" aria-hidden="true"/>
      </div>
     </div>
    </div>
   </div>
  </div>
  <p className="hs-foot">For Cambridge International, CBSE and IB Diploma papers. Available subjects vary.</p>
 </section>;
}
