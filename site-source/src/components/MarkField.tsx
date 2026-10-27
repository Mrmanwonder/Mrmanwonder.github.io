import {useEffect,useRef} from 'react';
import {paperMarks} from '../data';

/* A dot-matrix landscape whose horizon is a student's marks across eight papers.
   Dots grow denser below the crest, like halftone. Colour runs cool to warm as the marks rise. */
const lightStops=[[84,116,240],[150,118,232],[255,150,104]],darkStops=[[118,146,255],[176,150,245],[255,176,132]];
const mix=(a:number[],b:number[],t:number)=>a.map((v,i)=>Math.round(v+(b[i]-v)*t));
const ramp=(stops:number[][],t:number)=>t<.5?mix(stops[0],stops[1],t*2):mix(stops[1],stops[2],(t-.5)*2);
function crest(points:number[],t:number){ /* Catmull-Rom through the marks */
 const n=points.length-1,f=t*n,i=Math.min(n-1,Math.floor(f)),u=f-i;
 const p0=points[Math.max(0,i-1)],p1=points[i],p2=points[i+1],p3=points[Math.min(n,i+2)];
 return .5*((2*p1)+(-p0+p2)*u+(2*p0-5*p1+4*p2-p3)*u*u+(-p0+3*p1-3*p2+p3)*u*u*u);
}
export default function MarkField(){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  const canvas=ref.current!,ctx=canvas.getContext('2d')!,host=canvas.parentElement!;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)'),dark=matchMedia('(prefers-color-scheme: dark)');
  let w=0,h=0,copy={x:0,y:0,rx:1,ry:1},raf=0,visible=true,start=performance.now(),pointer:{x:number;y:number}|null=null;
  const lo=Math.min(...paperMarks)-3,hi=Math.max(...paperMarks)+1,norm=paperMarks.map(m=>(m-lo)/(hi-lo));
  function size(){const r=host.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);w=r.width;h=r.height;canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);const c=host.querySelector('.masthead-copy')?.getBoundingClientRect();if(c)copy={x:c.left-r.left+c.width/2,y:c.top-r.top+c.height/2,rx:c.width*.62,ry:c.height*.68};}
  function draw(now:number){
   raf=0;ctx.clearRect(0,0,w,h);
   const gap=w<600?9:12,stops=dark.matches?darkStops:lightStops,still=reduce.matches;
   const grow=still?1:Math.min(1,(now-start)/1700),eased=1-Math.pow(1-grow,3),breath=still?0:Math.sin(now/1400);
   const narrow=w<700,top=h*(narrow?.4:.3),bottom=h*(narrow?.62:.68); /* the crest rises from lower left to upper right */
   for(let x=gap/2;x<w;x+=gap){
    const t=x/w,cy=bottom-(bottom-top)*crest(norm,t)*(.15+.85*eased)+breath*2*Math.sin(t*6),col=ramp(stops,t);
    for(let y=gap/2;y<h;y+=gap){
     const depth=(y-cy)/(h-top);
     let r:number,a:number;
     if(depth<0){if(depth<-.08)continue;r=.7;a=.14;} /* faint texture just above the crest */
     else{r=Math.min(gap*.42,1+depth*gap*.9);a=Math.min(.95,(dark.matches?.5:.56)+depth*.8);if(depth<.03){r+=.6;a=1;}}
     if(t>grow+.02)continue;
     const ex=(x-copy.x)/copy.rx,ey=(y-copy.y)/copy.ry,e=ex*ex+ey*ey;if(e<1)continue;if(e<1.6)a*=(e-1)/.6;
     if(pointer){const d=Math.hypot(pointer.x-x,pointer.y-y);if(d<90){const k=1-d/90;r+=k*1.6;a=Math.min(1,a+k*.3);}}
     ctx.beginPath();ctx.fillStyle=`rgba(${col[0]},${col[1]},${col[2]},${a})`;ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
    }
   }
   if(grow>.98&&!narrow)for(const [t,label] of [[.06,`Paper 1 · ${paperMarks[0]}/30`],[.94,`Paper ${paperMarks.length} · ${paperMarks[paperMarks.length-1]}/30`]] as [number,string][]){
    const x=t*w,y=bottom-(bottom-top)*crest(norm,t);ctx.font='600 12px Onest, system-ui, sans-serif';ctx.fillStyle=dark.matches?'#eeeeeb':'#13151a';ctx.textAlign=t<.5?'left':'right';ctx.fillText(label,x+(t<.5?-6:6),y-18);
   }
   if(!still&&visible&&!document.hidden)raf=requestAnimationFrame(draw);
  }
  const kick=()=>{if(!raf)raf=requestAnimationFrame(draw);};
  const move=(e:PointerEvent)=>{if(e.pointerType!=='mouse')return;const r=canvas.getBoundingClientRect();pointer={x:e.clientX-r.left,y:e.clientY-r.top};};
  const leave=()=>{pointer=null;};
  const ro=new ResizeObserver(()=>{size();kick();});ro.observe(host);
  const io=new IntersectionObserver(([e])=>{visible=e.isIntersecting;kick();});io.observe(host);
  const vis=()=>kick();
  host.addEventListener('pointermove',move,{passive:true});host.addEventListener('pointerleave',leave);document.addEventListener('visibilitychange',vis);dark.addEventListener('change',vis);reduce.addEventListener('change',vis);
  size();kick();
  return()=>{cancelAnimationFrame(raf);ro.disconnect();io.disconnect();host.removeEventListener('pointermove',move);host.removeEventListener('pointerleave',leave);document.removeEventListener('visibilitychange',vis);dark.removeEventListener('change',vis);reduce.removeEventListener('change',vis);};
 },[]);
 return <canvas className="mark-field" ref={ref} aria-hidden="true"/>;
}
