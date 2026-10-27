import {useEffect,useRef,useState} from 'react';
export default function Mockup({active=true}:{active?:boolean}){
 const ref=useRef<HTMLVideoElement>(null),[ready,setReady]=useState(false),[failed,setFailed]=useState(false),[blocked,setBlocked]=useState(false),[reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
 useEffect(()=>{const video=ref.current!,preference=matchMedia('(prefers-reduced-motion: reduce)');let visible=false;
 const sync=()=>{if(visible&&active&&!document.hidden&&!preference.matches){void video.play().then(()=>setBlocked(false)).catch(error=>{if(error.name==='NotAllowedError')setBlocked(true);});}else video.pause();};
 const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();},{threshold:.1});observer.observe(video);document.addEventListener('visibilitychange',sync);const change=()=>{setReduced(preference.matches);sync();};preference.addEventListener('change',change);
 return()=>{observer.disconnect();preference.removeEventListener('change',change);document.removeEventListener('visibilitychange',sync);video.pause();};},[active]);
 return <div className="mockup-host"><video ref={ref} src="/assets/scanner-demo.mp4" poster="/assets/scanner-poster.jpg" preload="metadata" muted playsInline loop aria-label="Axon scanner recording a teacher-marked paper" onCanPlay={()=>setReady(true)} onError={()=>setFailed(true)}/>{!ready&&!failed&&!reduced&&<span className="mockup-status" role="status">Loading the scanner</span>}{(blocked||failed||(reduced&&!ready))&&<button className="mockup-play" onClick={()=>{setFailed(false);if(failed)ref.current?.load();void ref.current?.play().then(()=>setBlocked(false)).catch(()=>setBlocked(true));}}>{failed?'Retry video':'Play scanner demo'}</button>}</div>;
}
