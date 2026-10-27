export type RevealPlayback={pause:(position?:number)=>unknown;restart:()=>unknown;play:()=>unknown;progress:()=>number};
export function bindViewportReveal(element:Element,reveal:RevealPlayback){
 let entered=false;const observer=new IntersectionObserver(([entry])=>{if(!entry.isIntersecting){entered=false;reveal.pause(0);return;}const height=entry.rootBounds?.height||window.innerHeight;if(entry.boundingClientRect.top<=height*.25&&!entered){entered=true;reveal.restart();}},{threshold:Array.from({length:21},(_,i)=>i/20)});observer.observe(element);
 const visibility=()=>{if(document.hidden)reveal.pause();else if(entered&&reveal.progress()<1)reveal.play();};document.addEventListener('visibilitychange',visibility);return()=>{observer.disconnect();document.removeEventListener('visibilitychange',visibility);};
}
