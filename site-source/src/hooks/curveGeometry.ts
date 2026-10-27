export type CurvePoint={x:number;y:number;nx:number;ny:number};
export function bendCurve(points:CurvePoint[],centre:number,amount:number){
 return points.map((p,i)=>{const t=i/(points.length-1),weight=Math.exp(-(((t-centre)/.105)**2))*Math.sin(Math.PI*t),v=(i===0||i===points.length-1)?0:amount*weight;return{x:p.x+p.nx*v,y:p.y+p.ny*v};});
}
export function smoothCurve(points:{x:number;y:number}[]){
 const n=(v:number)=>v.toFixed(2);let d=`M${n(points[0].x)} ${n(points[0].y)}`;
 for(let i=0;i<points.length-1;i++){const a=points[Math.max(0,i-1)],b=points[i],c=points[i+1],e=points[Math.min(points.length-1,i+2)];d+=`C${n(b.x+(c.x-a.x)/6)} ${n(b.y+(c.y-a.y)/6)} ${n(c.x-(e.x-b.x)/6)} ${n(c.y-(e.y-b.y)/6)} ${n(c.x)} ${n(c.y)}`;}
 return d;
}
export function nearestOnCurve(points:CurvePoint[],x:number,y:number){
 let distance=Infinity,centre=0;
 for(let i=0;i<points.length-1;i++){const a=points[i],b=points[i+1],dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((x-a.x)*dx+(y-a.y)*dy)/(dx*dx+dy*dy||1))),d=(x-a.x-t*dx)**2+(y-a.y-t*dy)**2;if(d<distance){distance=d;centre=(i+t)/(points.length-1);}}
 return{distance,centre};
}
