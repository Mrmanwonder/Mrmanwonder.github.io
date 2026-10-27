import {heroPalette} from '../heroPalette';
import {rippleStrength,compressedDistance} from '../hooks/ripplePhysics';
import {useEffect,useRef} from 'react';
import {gsap} from '../hooks/useMotion';
const waveColors=[heroPalette.accentRGB,heroPalette.crestRGB];
type Dot={x:number;y:number;r:number;distance:number;edge:number;tone:number;band:number;nx:number;ny:number;px:number;py:number;strength:number};
export default function DotField(){
 const root=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const field=root.current!,host=field.parentElement!,[base,ambient,canvas]=Array.from(field.querySelectorAll('canvas'));
  const bg=base.getContext('2d')!,glow=ambient.getContext('2d')!,ctx=canvas.getContext('2d')!;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  let width=0,height=0,frame=0,resizeFrame=0,visible=false,rect:DOMRect|null=null,wave:gsap.core.Tween|undefined;
  let points:Dot[]=[],radial:Dot[]=[],trail:{x:number;y:number;t:number}[]=[],last:{x:number;y:number}|null=null;
  const pulse={radius:0};
  const lower=(distance:number)=>{let l=0,r=radial.length;while(l<r){const m=(l+r)>>>1;if(radial[m].distance<distance)l=m+1;else r=m;}return l;};
  function drawWave(){
   glow.clearRect(0,0,width,height);if(!visible||document.hidden)return;
   const radius=pulse.radius,start=lower(radius-90),end=lower(radius+90),colors=waveColors;
   for(let i=start;i<end;i++){const p=radial[i],strength=rippleStrength(p.distance,radius,p.edge),shift=compressedDistance(p.distance,radius,strength)-p.distance;p.strength=strength;p.px=p.x+p.nx*shift;p.py=p.y+p.ny*shift;p.band=strength<.035?-1:Math.min(3,Math.floor(strength*4));}
   for(let tone=0;tone<2;tone++){
    glow.beginPath();for(let i=start;i<end;i++){const p=radial[i];if(p.tone!==tone||p.strength<.45)continue;const r=p.r+p.strength*2;glow.moveTo(p.px+r,p.py);glow.arc(p.px,p.py,r,0,Math.PI*2);}glow.fillStyle=`rgba(${colors[tone]},.055)`;glow.fill();
   }
   for(let tone=0;tone<2;tone++)for(let band=0;band<4;band++){
    glow.beginPath();for(let i=start;i<end;i++){const p=radial[i];if(p.tone!==tone||p.band!==band)continue;const r=p.r+p.strength*.75;glow.moveTo(p.px+r,p.py);glow.arc(p.px,p.py,r,0,Math.PI*2);}
    glow.fillStyle=`rgba(${colors[tone]},${.18+band*.22})`;glow.fill();
   }
  }
  function sync(){const running=visible&&!document.hidden&&!reduce.matches;field.dataset.paused=String(!running);if(running)wave?.play();else{wave?.pause();stopTrail();if(visible&&!document.hidden&&reduce.matches){wave?.progress(.42);drawWave();}else glow.clearRect(0,0,width,height);}}
  function paint(){
   if(width===host.clientWidth&&height===host.clientHeight)return;
   width=host.clientWidth;height=host.clientHeight;if(!width||!height)return;
   const phase=wave?.progress()??0;wave?.kill();stopTrail();const dpr=Math.min(devicePixelRatio||1,1.25);
   for(const c of [base,ambient,canvas]){c.width=Math.round(width*dpr);c.height=Math.round(height*dpr);c.getContext('2d')!.setTransform(dpr,0,0,dpr,0,0);}
   points=[];const gap=Math.max(13,Math.sqrt(width*height/7000)),cx=width/2,cy=height/2;
   for(let y=gap/2;y<height;y+=gap)for(let x=gap/2;x<width;x+=gap){
    const distance=Math.hypot(x-cx,y-cy),edge=Math.max(0,Math.min(1,x/55,(width-x)/55,y/70,(height-y)/70));
    const texture=(Math.sin(distance/45)+1)/2,r=(.65+texture*.55)*edge;
    const mix=Math.min(1,Math.max(0,(x/width-.25)/.5)),tone=((Math.round(x/gap)*17+Math.round(y/gap)*29)%23)/23<mix?1:0;
    points.push({x,y,r,distance,edge,tone,band:-1,nx:distance?(x-cx)/distance:0,ny:distance?(y-cy)/distance:0,px:x,py:y,strength:0});bg.beginPath();bg.fillStyle=`rgba(148,155,174,${(.025+texture*.02)*edge})`;bg.arc(x,y,r,0,Math.PI*2);bg.fill();
   }
   radial=[...points].sort((a,b)=>a.distance-b.distance);
   pulse.radius=0;wave=gsap.to(pulse,{radius:Math.hypot(cx,cy)+90,duration:7.8,repeat:-1,repeatDelay:.9,ease:'none',paused:true,onUpdate:drawWave}).progress(phase);sync();
  }
  function stopTrail(){cancelAnimationFrame(frame);frame=0;trail=[];last=null;rect=null;ctx.clearRect(0,0,width,height);}
  function draw(now:number){frame=0;ctx.clearRect(0,0,width,height);if(!visible||document.hidden||reduce.matches)return;trail=trail.filter(p=>now-p.t<650);if(!trail.length)return;
   let minX=width,maxX=0,minY=height,maxY=0;for(const t of trail){minX=Math.min(minX,t.x-36);maxX=Math.max(maxX,t.x+36);minY=Math.min(minY,t.y-36);maxY=Math.max(maxY,t.y+36);}
   for(const p of points){if(p.x<minX||p.x>maxX||p.y<minY||p.y>maxY)continue;let amount=0,tx=p.x,ty=p.y;for(const t of trail){const d=(t.x-p.x)**2+(t.y-p.y)**2;if(d<1300){const next=Math.exp(-d/300)*(1-(now-t.t)/650)**2;if(next>amount){amount=next;tx=t.x;ty=t.y;}}}if(amount>.025){const pull=amount*.5;ctx.beginPath();ctx.fillStyle=`rgba(${heroPalette.crestRGB},${amount*.7})`;ctx.arc(p.x+(tx-p.x)*pull,p.y+(ty-p.y)*pull,p.r+amount*.55,0,Math.PI*2);ctx.fill();}}
   frame=requestAnimationFrame(draw);
  }
  const enter=()=>{rect=host.getBoundingClientRect();};
  const move=(event:PointerEvent)=>{if(!visible||reduce.matches||event.pointerType!=='mouse')return;if(!rect)enter();const x=event.clientX-rect!.left,y=event.clientY-rect!.top,t=performance.now();if(last){const steps=Math.min(8,Math.ceil(Math.hypot(x-last.x,y-last.y)/10));for(let i=1;i<=steps;i++)trail.push({x:last.x+(x-last.x)*i/steps,y:last.y+(y-last.y)*i/steps,t});}else trail.push({x,y,t});last={x,y};trail=trail.slice(-22);if(!frame)frame=requestAnimationFrame(draw);};
  const leave=()=>{last=null;rect=null;};
  const resize=new ResizeObserver(()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(paint);});resize.observe(host);
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting&&entry.intersectionRatio>.1;sync();},{threshold:[0,.1]});observer.observe(host);
  host.addEventListener('pointerenter',enter);host.addEventListener('pointermove',move,{passive:true});host.addEventListener('pointerleave',leave);window.addEventListener('scroll',stopTrail,{passive:true});document.addEventListener('visibilitychange',sync);reduce.addEventListener('change',sync);paint();
  return()=>{wave?.kill();stopTrail();cancelAnimationFrame(resizeFrame);resize.disconnect();observer.disconnect();host.removeEventListener('pointerenter',enter);host.removeEventListener('pointermove',move);host.removeEventListener('pointerleave',leave);window.removeEventListener('scroll',stopTrail);document.removeEventListener('visibilitychange',sync);reduce.removeEventListener('change',sync);};
 },[]);
 return <div className="dot-field" ref={root} aria-hidden="true"><canvas/><canvas className="dot-ambient"/><canvas/></div>;
}
