import {useEffect,useRef} from 'react';
import {gsap,ScrollTrigger,useMotion} from '../hooks/useMotion';
import {learnerConnections,type LearnerLayout} from '../hooks/learnerConnections';
import Icon from './Icon';
const benefits=[
 {id:'papers',icon:'paper',title:['Your papers.','In one place.'],detail:'Find your questions and answers.',href:'#your-papers'},
 {id:'review',icon:'scan',title:['You check','the reading.'],detail:'Review your scan. Correct what needs it.',href:'#how-it-works'},
 {id:'teacher',icon:'check',title:["Your teacher’s marks.",'Always the source.'],detail:'Explained. Never changed.',href:'#explore'},
 {id:'practice',icon:'spark',title:['Room to','try again.'],detail:'Practise the idea behind a lost mark.',href:'#practice'},
 {id:'patterns',icon:'search',title:['Your patterns.','Your next step.'],detail:'See what repeats across your papers.',href:'#perspective'},
 {id:'guardian',icon:'shield',title:['Your guardian.','Holding the account.'],detail:'Read about your privacy.',href:'https://axonstudy.online/privacy'}
];
export default function AroundYou(){
 const ref=useRef<HTMLElement>(null);
 useEffect(()=>{
  const host=ref.current!.querySelector<HTMLElement>('.learner-composition')!,svg=host.querySelector('svg')!,centre=host.querySelector<HTMLElement>('.learner-centre')!,cards=Array.from(host.querySelectorAll<HTMLElement>('.learner-note')),paths=svg.querySelectorAll('.learner-branch'),trunk=svg.querySelector('.learner-trunk')!;
  let frame=0,disposed=false;
  const layout=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{
   const width=host.clientWidth,height=host.clientHeight;if(!width||!height)return;
   const mode:LearnerLayout=matchMedia('(max-width:640px)').matches?'stacked':matchMedia('(max-width:1000px)').matches?'paired':'desktop';
   const hub={x:centre.offsetLeft+centre.offsetWidth/2,y:mode==='desktop'?height*.48:centre.offsetTop+centre.offsetHeight-10};
   const boxes=cards.map(card=>{const icon=card.querySelector<HTMLElement>('.learner-symbol')!;return{left:card.offsetLeft,top:card.offsetTop,width:card.offsetWidth,height:card.offsetHeight,anchorY:icon.offsetTop+icon.offsetHeight/2};});
   const geometry=learnerConnections(width,hub,boxes,mode);svg.setAttribute('viewBox',`0 0 ${width} ${height}`);trunk.setAttribute('d',geometry.trunk);paths.forEach((path,i)=>path.setAttribute('d',geometry.branches[i]));
  });};
  const observer=new ResizeObserver(layout);[host,centre,...cards].forEach(el=>observer.observe(el));layout();document.fonts.ready.then(()=>{if(!disposed){layout();ScrollTrigger.refresh();}});
  return()=>{disposed=true;observer.disconnect();cancelAnimationFrame(frame);};
 },[]);
 useMotion(()=>{
  const host=ref.current!,cards=Array.from(host.querySelectorAll<HTMLElement>('.learner-note')),branches=host.querySelectorAll('.learner-branch'),mm=gsap.matchMedia();
  mm.add('(min-width:1001px)',()=>{
   const tl=gsap.timeline({scrollTrigger:{trigger:host,start:'top 75%',end:'top 8%',scrub:.65}});
   tl.from('.learner-centre',{scale:.87,opacity:0,duration:.7,ease:'power2.out'})
    .from(branches,{strokeDashoffset:1,stagger:.13,duration:.8},.2)
    .from(cards,{y:24,opacity:0,stagger:.16,duration:.6},.4);
  });
  mm.add('(max-width:1000px)',()=>{
   gsap.from('.learner-centre',{y:14,opacity:0,duration:.7,ease:'power3.out',clearProps:'opacity,transform',scrollTrigger:{trigger:'.learner-centre',start:'top 90%',once:true}});
   gsap.fromTo('.learner-trunk',{strokeDashoffset:1},{strokeDashoffset:0,ease:'none',scrollTrigger:{trigger:'.learner-composition',start:'top 70%',end:'bottom 85%',scrub:.35}});
   cards.forEach((card,i)=>{
    gsap.timeline({scrollTrigger:{trigger:card,start:'top 94%',once:true}})
     .fromTo(branches[i],{strokeDashoffset:1},{strokeDashoffset:0,duration:.5,ease:'power2.out'},0)
     .from(card,{y:16,opacity:0,duration:.65,ease:'power3.out',clearProps:'opacity,transform'},.05);
   });
  });return()=>mm.revert();
 },ref);
 return <section ref={ref} className="principles support-scene" id="built-around-you" aria-labelledby="support-title"><div className="support-top"><span className="eyebrow">BUILT AROUND YOU</span><span>Your learning stays yours.</span></div><div className="learner-composition"><svg className="learner-connections" viewBox="0 0 1100 660" aria-hidden="true"><path className="learner-trunk" pathLength="1"/>{benefits.map(item=><path key={item.id} className="learner-branch" pathLength="1"/>)}</svg><div className="learner-centre"><h2 id="support-title">You<span>.</span></h2><span className="learner-caption">Read. Retry. Reconnect.</span></div>{benefits.map(item=><article key={item.id} className={'learner-note note-'+item.id}><span className="learner-symbol" aria-hidden="true"><Icon name={item.icon}/></span><h3>{item.title[0]}<br/>{item.title[1]}</h3><p><a href={item.href}>{item.detail}<Icon className="learner-link-arrow" name="arrow"/></a></p></article>)}</div><div className="learner-bottom"><span>Cambridge International · CBSE · IB Diploma</span><span>Available subjects vary.</span></div></section>;
}
