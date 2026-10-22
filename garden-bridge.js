/* Garden lifecycle bridge.
   Loaded into the same-origin hero iframe by the parent page after the hero HTML.
   Uses the garden's own decoded/ready flag and elapsed simulation time. */
(() => {
  'use strict';
  const note=document.getElementById('load-note');
  if(!note || window.__gardenBridgeInstalled)return;
  window.__gardenBridgeInstalled=true;
  let prepared=false, running=false, finished=false, timer=0, wantsStart=false;
  const report=(type,progress=0)=>{
    try{parent.postMessage({type,progress},location.origin)}catch(_){}
  };
  const runtimeReady=()=>{
    try{return ready===true}catch(_){return false}
  };
  function checkFinished(){
    if(!running || finished)return;
    try{
      const value=Math.min(1,Math.max(0,elapsed/REST_TIME));
      report('garden-progress',value);
      if(elapsed>=REST_TIME){
        finished=true;clearInterval(timer);
        report('garden-finished',1);
      }
    }catch(_){}
  }
  function start(){
    if(running||!prepared){wantsStart=true;return}
    wantsStart=false;running=true;finished=false;
    try{
      elapsed=0;
      resetInteraction();
      setPaused(false);
      report('garden-started',0);
      if(reduced.matches){
        elapsed=REST_TIME;draw();
        checkFinished();
      }else{
        timer=setInterval(checkFinished,180);
      }
    }catch(_){
      report('garden-error',0);
    }
  }
  function preparedNow(){
    if(prepared||!runtimeReady())return;
    prepared=true;
    try{
      setPaused(true); // Stop the hero's automatic frame loop before first drawn bloom.
      elapsed=0;draw(); // Actual pristine starting state, not an external clock guess.
    }catch(_){}
    report('garden-ready',0);
    if(wantsStart)start();
  }
  const observer=new MutationObserver(()=>{
    if(runtimeReady()){preparedNow();observer.disconnect();}
    else if(note.textContent.includes('could not load')){
      report('garden-error',0);observer.disconnect();
    }
  });
  observer.observe(note,{childList:true,characterData:true,subtree:true,attributes:true});
  preparedNow();
  if(!prepared && note.textContent.includes('could not load'))report('garden-error',0);
  addEventListener('message',event=>{
    if(event.source!==parent||event.origin!==location.origin)return;
    if(event.data?.type==='garden-begin')start();
    if(event.data?.type==='garden-visibility' && finished){
      try{setPaused(!event.data.visible)}catch(_){}
    }
    if(event.data?.type==='garden-status-request'){
      if(prepared)report('garden-ready',0);
      if(running)report('garden-started',Math.min(1,elapsed/REST_TIME));
      if(finished)report('garden-finished',1);
    }
  });
  // A cached iframe can finish loading before the parent's message listener.
  report('garden-bridge-attached',0);
})();
