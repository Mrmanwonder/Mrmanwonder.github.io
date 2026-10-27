import {bendCurve,smoothCurve,nearestOnCurve,type CurvePoint} from '../hooks/curveGeometry';
import {bindViewportReveal} from '../hooks/viewportReveal';
import {useEffect,useId,useRef,useState} from 'react';
import {gsap,ScrollTrigger,useMotion} from '../hooks/useMotion';
import Icon from './Icon';

export {default as AroundYou} from './AroundYou';
const groups=[
 {title:'Getting started',questions:[
 ['What exactly does Axon do?','Axon connects a paper your teacher has marked with your answers and their feedback, helping you understand where marks were lost and what to revisit.'],
 ['What do I need to start?','A paper your teacher has already marked. Scan it, then check that the questions, answers and marks were read correctly.'],
 ['Who is Axon for?','Secondary students, roughly ages 13–17. A parent or guardian creates and holds the account.'],
 ['Which curricula are included?','Axon includes Cambridge International, CBSE and IB Diploma contexts. Available subjects and papers depend on what is configured in the app.']
 ]},
 {title:'Your marked paper',questions:[
 ['Does Axon mark my paper?','No. Your teacher’s marks are the source. Axon never assigns, replaces or changes them.'],
 ['What if the scan gets something wrong?','Compare the reading with your original paper. Review and correct unclear questions, answers or marks before using the explanation.'],
 ['Can an explanation be wrong?','Yes. AI can make mistakes. Check explanations against your paper and teacher’s feedback, and ask your teacher when something is unclear.'],
 ['Does Axon replace my teacher?','No. It helps you revisit feedback between lessons. Your teacher remains the person to ask about marking decisions and anything you do not understand.']
 ]},
 {title:'What comes next',questions:[
 ['What can I practise?','Revisit the questions and ideas behind lost marks. Practice checks your understanding without changing the marks on your original paper.'],
 ['What do the analytics show?','Patterns across your checked papers: the topics, skills and reasons associated with lost marks. They are starting points for revision, not a judgement of your ability.'],
 ['Are these examples my real results?','No. The papers, charts and practice on this page use illustrative data. Your own results belong in your Axon account.'],
 ['Who holds the account?','A parent or guardian holds the account for the student. Read Axon’s privacy policy for details about how personal information is handled.']
 ]}
];
function FAQItem({question,answer,account=false}:{question:string;answer:string;account?:boolean}){
 const [open,setOpen]=useState(false),ref=useRef<HTMLDivElement>(null),id=useId();
 useEffect(()=>{const el=ref.current!;if(matchMedia('(prefers-reduced-motion: reduce)').matches){el.style.height=open?'auto':'0px';el.style.opacity=open?'1':'0';ScrollTrigger.refresh();return;}
 const tween=gsap.to(el,{height:open?el.scrollHeight:0,opacity:open?1:0,duration:open?.38:.28,ease:'power3.inOut',onComplete:()=>{if(open)el.style.height='auto';ScrollTrigger.refresh();}});return()=>{tween.kill();};},[open]);
 useEffect(()=>{if(!account)return;const check=()=>{if(window.location.hash==='#accounts-question'){setOpen(true);document.getElementById('accounts-question')?.querySelector('button')?.focus({preventScroll:true});}};check();window.addEventListener('hashchange',check);return()=>window.removeEventListener('hashchange',check)},[account]);
 return <article id={account?'accounts-question':undefined} className={'faq-item '+(open?'open':'')}><h4><button aria-expanded={open} aria-controls={id} onClick={()=>setOpen(v=>!v)}>{question}<Icon name="plus"/></button></h4><div id={id} ref={ref} className="faq-answer" aria-hidden={!open}><p>{answer}</p></div></article>;
}
export function FAQ(){
 const ref=useRef<HTMLElement>(null);
 useMotion(()=>{gsap.from('.question-group',{y:20,opacity:0,duration:.7,stagger:.1,clearProps:'transform,opacity',scrollTrigger:{trigger:'.question-groups',start:'top 85%',once:true}})},ref);
 return <section ref={ref} className="questions-section section-pad" id="questions"><div className="questions-heading"><div><span className="eyebrow">GOOD QUESTIONS</span><h2>A little more clarity.</h2></div><a href="mailto:support@axonstudy.online">Something else on your mind?<span>Ask us<Icon name="arrow"/></span></a></div><div className="question-groups">{groups.map(group=><div className="question-group" key={group.title}><h3>{group.title}</h3>{group.questions.map(([question,answer])=><FAQItem key={question} question={question} answer={answer} account={question==='Who holds the account?'}/>)}</div>)}</div></section>;
}
export function Footer(){
 const ref=useRef<HTMLElement>(null);
 useMotion(()=>{
 const footer=ref.current!,paths=Array.from(footer.querySelectorAll<SVGPathElement>('.footer-thread'));
 const originals=paths.map(path=>path.getAttribute('d')!);
 paths.forEach(path=>{const length=path.getTotalLength();gsap.set(path,{strokeDasharray:length,strokeDashoffset:length});});
 const reveal=gsap.timeline({paused:true});
 reveal.from('.connection-art',{opacity:0,duration:.18},0)
 .to(paths,{strokeDashoffset:0,duration:.65,stagger:.008,ease:'power2.out'},0)
 .from('.footer-wordmark',{yPercent:12,opacity:0,duration:.6,ease:'power3.out'},.08)
 .from('.footer-invitation,.footer-top,.footer-bottom',{y:10,opacity:0,duration:.5,stagger:.04,ease:'power3.out'},.06);
 const stopReveal=bindViewportReveal(footer,reveal);
 const svg=footer.querySelector<SVGSVGElement>('.connection-art')!;
 const rings=new Map<number,gsap.core.Timeline>(),voices=new Map<number,{amount:number;centre:number}>();
 const samples=paths.map(path=>{const length=path.getTotalLength();return Array.from({length:81},(_,i):CurvePoint=>{const at=length*i/80,p=path.getPointAtLength(at),a=path.getPointAtLength(Math.max(0,at-1)),b=path.getPointAtLength(Math.min(length,at+1)),dx=b.x-a.x,dy=b.y-a.y,m=Math.hypot(dx,dy)||1;return{x:p.x,y:p.y,nx:-dy/m,ny:dx/m};});});
 const hits=paths.map(path=>{const hit=path.cloneNode(false) as SVGPathElement;hit.setAttribute('class','footer-hit');hit.setAttribute('vector-effect','non-scaling-stroke');hit.removeAttribute('style');svg.append(hit);return hit;});
 let frame=0,event:PointerEvent|null=null,lastIndex=-1,lastCentre=0,lastTime=0,inView=false;
 const reset=()=>{rings.forEach(t=>t.kill());rings.clear();voices.clear();paths.forEach((p,i)=>p.setAttribute('d',originals[i]));lastIndex=-1;};
 const observer=new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;if(!inView)reset();});observer.observe(footer);
 const render=()=>{
  frame=0;if(!event||!inView||reveal.progress()<.99||reveal.isActive())return;
  const matrix=svg.getScreenCTM();if(!matrix)return;
  const point=new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse());
  let index=-1,centre=0,distance=Infinity;
  samples.forEach((sample,i)=>{const nearest=nearestOnCurve(sample,point.x,point.y);if(nearest.distance<distance){distance=nearest.distance;centre=nearest.centre;index=i;}});
  const now=performance.now();if(index===lastIndex&&(Math.abs(centre-lastCentre)<.055||now-lastTime<100))return;
  const normal=samples[index][Math.round(centre*80)];
  const direction=event.movementX*normal.nx+event.movementY*normal.ny;
  const amplitude=(direction<0?-1:1)*Math.min(24,12+Math.abs(direction)*.5);
  lastIndex=index;lastCentre=centre;lastTime=now;rings.get(index)?.kill();
  const state=voices.get(index)??{amount:0,centre};voices.set(index,state);const path=paths[index],sample=samples[index];
  const paint=()=>path.setAttribute('d',smoothCurve(bendCurve(sample,state.centre,state.amount)));
  const ring=gsap.timeline({onComplete:()=>{path.setAttribute('d',originals[index]);rings.delete(index);voices.delete(index);}});
  ring.to(state,{centre,amount:amplitude,duration:.12,ease:'power2.out',onUpdate:paint})
   .to(state,{amount:0,duration:1.05,ease:'elastic.out(1,.28)',onUpdate:paint});rings.set(index,ring);
 };
 const move=(e:PointerEvent)=>{if(e.pointerType!=='mouse')return;if(!(e.target instanceof Element)||!e.target.classList.contains('footer-hit')){lastIndex=-1;return;}event=e;if(!frame)frame=requestAnimationFrame(render);};
 svg.addEventListener('pointermove',move,{passive:true});
 return()=>{stopReveal();observer.disconnect();cancelAnimationFrame(frame);svg.removeEventListener('pointermove',move);reset();hits.forEach(hit=>hit.remove());};
 },ref);
 return <footer ref={ref} className="art-footer" id="footer"><div className="footer-art" aria-hidden="true"><svg className="connection-art" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="thread-colour" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#bed2ff"/><stop offset=".5" stopColor="#3a86ff"/><stop offset="1" stopColor="#b2a7e7"/></linearGradient></defs><path className="footer-thread" d="M -120 220 C 240 720, 410 -160, 720 300 S 1180 930, 1570 120"/><path className="footer-thread" d="M -120 232 C 240 725, 410 -144, 720 310 S 1180 924, 1570 134"/><path className="footer-thread" d="M -120 244 C 240 730, 410 -128, 720 320 S 1180 918, 1570 148"/><path className="footer-thread" d="M -120 256 C 240 735, 410 -112, 720 330 S 1180 912, 1570 162"/><path className="footer-thread" d="M -120 268 C 240 740, 410 -96, 720 340 S 1180 906, 1570 176"/><path className="footer-thread" d="M -120 280 C 240 745, 410 -80, 720 350 S 1180 900, 1570 190"/><path className="footer-thread" d="M -120 292 C 240 750, 410 -64, 720 360 S 1180 894, 1570 204"/><path className="footer-thread" d="M -120 304 C 240 755, 410 -48, 720 370 S 1180 888, 1570 218"/><path className="footer-thread" d="M -120 316 C 240 760, 410 -32, 720 380 S 1180 882, 1570 232"/><path className="footer-thread" d="M -120 328 C 240 765, 410 -16, 720 390 S 1180 876, 1570 246"/><path className="footer-thread" d="M -120 340 C 240 770, 410 0, 720 400 S 1180 870, 1570 260"/><path className="footer-thread" d="M -120 352 C 240 775, 410 16, 720 410 S 1180 864, 1570 274"/><path className="footer-thread" d="M -120 364 C 240 780, 410 32, 720 420 S 1180 858, 1570 288"/><path className="footer-thread" d="M -120 376 C 240 785, 410 48, 720 430 S 1180 852, 1570 302"/><path className="footer-thread" d="M -120 388 C 240 790, 410 64, 720 440 S 1180 846, 1570 316"/><path className="footer-thread" d="M -120 400 C 240 795, 410 80, 720 450 S 1180 840, 1570 330"/><path className="footer-thread" d="M -120 412 C 240 800, 410 96, 720 460 S 1180 834, 1570 344"/><path className="footer-thread" d="M -120 424 C 240 805, 410 112, 720 470 S 1180 828, 1570 358"/></svg></div><div className="footer-top"><span>FROM MARKS TO MEANING</span></div><div className="footer-centre"><div className="footer-invitation"><h2>Make the<br/>connection.</h2><a className="footer-cta" href="https://axonstudy.online/app">Open Axon <span aria-hidden="true">↗</span></a></div><div className="footer-wordmark" aria-hidden="true">Axon<span>®</span></div></div><div className="footer-bottom"><p>Made for the moment<br/>the feedback makes sense.</p><nav aria-label="Legal and contact"><a href="https://axonstudy.online/privacy">Privacy</a><a href="https://axonstudy.online/terms">Terms</a><a href="https://axonstudy.online/cookies">Cookies</a><a href="mailto:support@axonstudy.online">Say hello ↗</a></nav><div><span>© 2026 Axon</span><a href="#top">Back to top ↑</a></div></div></footer>;
}
