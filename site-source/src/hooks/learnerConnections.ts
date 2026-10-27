export type LearnerBox={left:number;top:number;width:number;height:number;anchorY:number};
export type LearnerLayout='desktop'|'paired'|'stacked';
/** Work in the composition's CSS pixels, independently of animation transforms. */
export function learnerConnections(width:number,hub:{x:number;y:number},cards:LearnerBox[],layout:LearnerLayout){
 const n=(v:number)=>Math.round(v*100)/100;
 if(layout==='desktop')return{trunk:'',branches:cards.map(card=>{const left=card.left+card.width/2<width/2,x=left?card.left+card.width:card.left,y=card.top+card.height/2,sx=width/2+(left?-76:76),sy=hub.y,bend=(sx+x)/2;return`M${n(sx)} ${n(sy)} C${n(bend)} ${n(sy)},${n(bend)} ${n(y)},${n(x)} ${n(y)}`;})};
 const rail=layout==='stacked'?10:width/2,ys=cards.map(card=>card.top+card.anchorY),last=Math.max(hub.y,...ys);
 const trunk=layout==='stacked'?`M${n(hub.x)} ${n(hub.y)} C${n(hub.x)} ${n(hub.y+24)},${rail} ${n(hub.y+6)},${rail} ${n(hub.y+40)} L${rail} ${n(last)}`:`M${n(hub.x)} ${n(hub.y)} L${n(rail)} ${n(last)}`;
 const branches=cards.map((card,i)=>{const left=card.left+card.width/2<rail,x=layout==='stacked'?card.left:left?card.left+card.width:card.left,y=ys[i],direction=x<rail?-1:1,bend=Math.min(12,Math.abs(x-rail)/2);return`M${n(rail)} ${n(y-14)} Q${n(rail)} ${n(y)},${n(rail+direction*bend)} ${n(y)} L${n(x)} ${n(y)}`;});
 return{trunk,branches};
}
