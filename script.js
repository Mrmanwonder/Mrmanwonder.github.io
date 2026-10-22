// Exact garden gating. Do not infer animation progress from iframe load time.
(() => {
  'use strict';
  const root=document.documentElement;
  const heroFrame=document.querySelector('.exact-hero-frame');
  if(!root || !heroFrame){root?.classList.remove('intro-locked');return}
  if('scrollRestoration' in history)history.scrollRestoration='manual';
  scrollTo(0,0);

  let ready=false, begun=false, finished=false, unlocked=false, broken=false;
  const gate=document.createElement('div');
  gate.className='intro-gate intro-gate--interactive';
  gate.id='introGate';
  gate.setAttribute('aria-live','polite');
  gate.innerHTML='<strong id="introGateLabel">the garden is waking up…</strong><span class="intro-gate__track" aria-hidden="true"><i id="introGateFill"></i></span><button class="intro-gate__begin" id="gardenBegin" type="button" hidden disabled>tap to begin <span aria-hidden="true">↗</span></button>';
  document.body.appendChild(gate);
  const label=gate.querySelector('#introGateLabel');
  const fill=gate.querySelector('#introGateFill');
  const button=gate.querySelector('#gardenBegin');

  const lockedKeys=new Set(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' ','Spacebar']);
  const wheel=e=>{if(!unlocked)e.preventDefault()};
  const touch=e=>{if(!unlocked)e.preventDefault()};
  const key=e=>{if(!unlocked && lockedKeys.has(e.key) && e.target!==button)e.preventDefault()};
  const top=()=>{if(!unlocked && scrollY)scrollTo(0,0)};
  addEventListener('wheel',wheel,{passive:false});
  addEventListener('touchmove',touch,{passive:false});
  addEventListener('keydown',key);
  addEventListener('scroll',top,{passive:true});

  function unlock(){
    if(unlocked || !finished)return;
    unlocked=true;
    fill.style.transform='scaleX(1)';
    label.textContent='the story is ready ↓';
    button.hidden=true;
    gate.classList.add('is-ready');
    root.classList.remove('intro-locked');
    removeEventListener('wheel',wheel);
    removeEventListener('touchmove',touch);
    removeEventListener('keydown',key);
    removeEventListener('scroll',top);
    setTimeout(()=>{
      gate.classList.add('is-leaving');
      setTimeout(()=>gate.remove(),650);
    },440);
  }
  button.addEventListener('click',()=>{
    if(!ready && !broken)return;
    if(broken){finished=true;unlock();return}
    if(begun)return;
    begun=true;
    button.hidden=true;
    label.textContent='the garden is growing…';
    // A real user gesture starts Bloom and the canvas bloom together.
    window.bloomSoundtrack?.play?.();
    heroFrame.contentWindow?.postMessage({type:'garden-begin'},location.origin);
  });

  const acceptMessage=event=>{
    if(event.source!==heroFrame.contentWindow || event.origin!==location.origin)return;
    const {type,progress}=event.data||{};
    if(type==='garden-bridge-attached'){
      heroFrame.contentWindow.postMessage({type:'garden-status-request'},location.origin);
    }else if(type==='garden-ready'){
      ready=true;
      if(!begun){
        label.textContent='a little something for you';
        button.hidden=false;button.disabled=false;
      }
    }else if(type==='garden-started'){
      begun=true;
      button.hidden=true;
      label.textContent='the garden is growing…';
    }else if(type==='garden-progress'){
      if(begun)fill.style.transform='scaleX('+Math.min(1,Math.max(0,Number(progress)||0))+')';
    }else if(type==='garden-finished'){
      finished=true;unlock();
    }else if(type==='garden-error'){
      broken=true;
      label.textContent='the flowers need another moment';
      button.textContent='continue the story ↗';
      button.hidden=false;button.disabled=false;
    }
  };
  addEventListener('message',acceptMessage);

  function connectBridge(){
    try{
      const doc=heroFrame.contentDocument;
      if(!doc)throw Error('Garden iframe cannot be accessed');
      if(doc.querySelector('script[data-garden-bridge]'))return;
      const script=doc.createElement('script');
      script.src='garden-bridge.js';
      script.dataset.gardenBridge='true';
      script.onerror=()=>{
        broken=true;
        label.textContent='the garden could not finish loading';
        button.textContent='continue the story ↗';
        button.hidden=false;button.disabled=false;
      };
      doc.head.appendChild(script);
    }catch(_){
      broken=true;
      label.textContent='the garden could not finish loading';
      button.textContent='continue the story ↗';
      button.hidden=false;button.disabled=false;
    }
  }
  if('IntersectionObserver' in window){
    const gardenView=new IntersectionObserver(entries=>{
      const visible=entries.some(e=>e.isIntersecting);
      heroFrame.contentWindow?.postMessage({type:'garden-visibility',visible},location.origin);
    },{threshold:.01});
    gardenView.observe(heroFrame);
  }
  heroFrame.addEventListener('load',connectBridge);
  try{if(heroFrame.contentDocument?.readyState==='complete')queueMicrotask(connectBridge)}catch(_){}
  heroFrame.addEventListener('error',()=>{
    broken=true;
    button.hidden=false;button.disabled=false;
    button.textContent='continue the story ↗';
  });
})();

(() => {
  'use strict';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const progress=$('#pageProgress'), flight=$('#petalFlight'), petalStage=$('#petalStage');
  const onlyUs=$('#onlyUs'), onlyUsMedia=$('#onlyUsMedia'), onlyUsVideo=$('#onlyUsVideo');
  const loveLetter=$('#loveLetter');
  const secret=$('#secretButton'), secretMessage=$('#secretMessage');

  const letterText=loveLetter.textContent.trim().replace(/\s+/g,' ');
  const fragment=document.createDocumentFragment();
  loveLetter.textContent='';
  letterText.split(' ').forEach((word,i,array)=>{
    const el=document.createElement('span');
    el.className='word';
    el.textContent=word;
    fragment.appendChild(el);
    if(i<array.length-1)fragment.append(' ');
  });
  loveLetter.append(fragment);
  const words=$$('.word',loveLetter);
  let wordY=[], wordValues=new Int8Array(words.length);
  wordValues.fill(-1);

  if('IntersectionObserver' in window&&!reduced){
    const io=new IntersectionObserver(entries=>{
      for(const e of entries){
        if(e.isIntersecting){
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      }
    },{threshold:.07,rootMargin:'0px 0px -5% 0px'});
    $$('.reveal').forEach(el=>io.observe(el));
  }else{
    $$('.reveal').forEach(el=>el.classList.add('is-visible'));
  }

  let pageTravel=1,flightStart=0,flightTravel=1,onlyUsStart=0,onlyUsTravel=1,letterTop=0,letterEnd=0;
  let onlyUsReady=false, onlyUsLastFrame=-1, videoRequest=0, scrollRaf=0, loadedScrub=false;
  let lastSeek=0;
  const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n));
  const smoothstep=n=>{const x=clamp(n);return x*x*(3-2*x)};

  function measure(){
    const height=innerHeight;
    flightStart=flight.offsetTop;
    flightTravel=Math.max(1,flight.offsetHeight-height);
    if(onlyUs){
      onlyUsStart=onlyUs.offsetTop;
      onlyUsTravel=Math.max(1,onlyUs.offsetHeight-height);
    }
    pageTravel=Math.max(1,document.documentElement.scrollHeight-height);
    const bounds=loveLetter.getBoundingClientRect();
    letterTop=bounds.top+scrollY;
    letterEnd=letterTop+bounds.height;
    wordY=words.map(el=>el.getBoundingClientRect().top+scrollY);
    wordValues.fill(-1);
  }

  function updateLetter(y){
    // Bring back the original continuous, scroll-linked word-by-word reveal.
    // Word positions are measured on layout changes, never per scroll frame.
    if(y+innerHeight<letterTop-innerHeight*.3 || y>letterEnd+innerHeight*.3)return;
    const line=y+innerHeight*.66,band=155;
    let last=-1;
    for(let i=0;i<words.length;i++){
      const p=clamp((line-wordY[i])/band);
      const el=words[i];
      const opacity=.12+.88*p;
      el.style.opacity=opacity.toFixed(3);
      el.style.transform=p>=1?'none':'translateY('+((1-p)*2).toFixed(2)+'px)';
      el.style.color=p>.5?'#44535a':'rgba(68,83,90,.2)';
      if(p>.62)last=i;
    }
    if(last>=0)words[last].style.color='#8d7182';
  }

  function loadScrub(){
    if(!onlyUsVideo || loadedScrub)return;
    loadedScrub=true;
    const source=onlyUsVideo.querySelector('source[data-src]');
    if(source){source.src=source.dataset.src;source.removeAttribute('data-src');}
    onlyUsVideo.preload='metadata';
    onlyUsVideo.load();
  }
  if(onlyUsVideo){
    onlyUsVideo.pause();
    onlyUsVideo.addEventListener('loadedmetadata',()=>{
      onlyUsReady=true;
      onlyUsLastFrame=-1;
      request();
    });
    onlyUsVideo.addEventListener('seeked',request);
    if('IntersectionObserver' in window){
      const prefetch=new IntersectionObserver(entries=>{
        if(entries.some(x=>x.isIntersecting)){loadScrub();prefetch.disconnect();}
      },{rootMargin:'150% 0px'});
      prefetch.observe(onlyUs);
    }else{
      addEventListener('scroll',()=>{if(scrollY+innerHeight*2>onlyUs.offsetTop)loadScrub();},{passive:true});
    }
  }
  function updateScrub(y,now){
    if(!onlyUsMedia||!onlyUs||reduced)return;
    if(y+innerHeight*1.1<onlyUsStart || y>onlyUsStart+onlyUs.offsetHeight+innerHeight*.3)return;
    const raw=clamp((y-onlyUsStart)/onlyUsTravel);
    const filmProgress=clamp((raw-.015)/.885);
    const zp=smoothstep((raw-.56)/.44);
    onlyUsMedia.style.setProperty('--only-us-zoom',(1+zp*.145).toFixed(4));
    onlyUsMedia.style.setProperty('--only-us-shift',(-zp*.7).toFixed(3)+'%');
    if(!onlyUsReady || onlyUsVideo.seeking || now-lastSeek<80)return;
    const fps=Number(onlyUsVideo.dataset.fps)||24;
    const frames=Number(onlyUsVideo.dataset.frames)||Math.max(1,Math.round(onlyUsVideo.duration*fps));
    const frame=Math.min(frames-1,Math.max(0,Math.round(filmProgress*(frames-1))));
    if(frame===onlyUsLastFrame)return;
    const target=Math.min(Math.max(0,onlyUsVideo.duration-.001),frame/fps);
    if(!Number.isFinite(target))return;
    onlyUsLastFrame=frame;
    lastSeek=now;
    if(Math.abs(onlyUsVideo.currentTime-target)>.018)onlyUsVideo.currentTime=target;
  }
  function render(now=performance.now()){
    scrollRaf=0;
    const y=scrollY;
    progress.style.transform='scaleX('+clamp(y/pageTravel).toFixed(4)+')';
    if(y+innerHeight>flightStart && y<flightStart+flight.offsetHeight){
      petalStage.style.setProperty('--flight',clamp((y-flightStart)/flightTravel).toFixed(4));
    }
    updateScrub(y,now);
    updateLetter(y);
  }
  function request(){if(!scrollRaf)scrollRaf=requestAnimationFrame(render);}
  addEventListener('scroll',request,{passive:true});
  addEventListener('resize',()=>{measure();request();},{passive:true});
  addEventListener('load',()=>{measure();request();},{once:true});
  if(document.fonts?.ready)document.fonts.ready.then(()=>{measure();request()});
  secret?.addEventListener('click',()=>secretMessage?.classList.toggle('is-visible'));
  measure();
  request();
})();

// V21 — robust site-wide Bloom soundtrack.
(() => {
  'use strict';
  const audio = document.querySelector('#siteSoundtrack');
  const control = document.querySelector('#soundtrackControl');
  const heroFrame = document.querySelector('.exact-hero-frame');
  if (!audio || !control) return;

  const mark = control.querySelector('.soundtrack-control__mark');
  const textStrong = control.querySelector('.soundtrack-control__text strong');
  let fadeFrame = 0;
  let started = false;
  const targetVolume = 0.24;
  let stoppedForFinale = false;

  audio.volume = 0;

  function setUi(state) {
    const playing = state === 'playing';
    control.setAttribute('aria-pressed', String(playing));
    control.classList.toggle('is-playing', playing);
    control.classList.toggle('is-unavailable', state === 'missing');
    mark.textContent = playing ? 'Ⅱ' : '♪';

    if (state === 'missing') {
      control.setAttribute('aria-label', 'Bloom audio file not found');
      control.title = 'Put bloom.mp3 beside index.html or in assets/audio/';
      if (textStrong) textStrong.textContent = 'Add bloom.mp3';
    } else {
      control.setAttribute('aria-label', `${playing ? 'Pause' : 'Play'} Bloom by The Paper Kites`);
      control.title = '';
      if (textStrong) textStrong.textContent = 'Bloom';
    }
  }

  function fadeTo(target, duration = 1200, done) {
    cancelAnimationFrame(fadeFrame);
    const from = audio.volume;
    const t0 = performance.now();
    const tick = now => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      audio.volume = Math.max(0, Math.min(1, from + (target - from) * eased));
      if (p < 1) fadeFrame = requestAnimationFrame(tick);
      else if (done) done();
    };
    fadeFrame = requestAnimationFrame(tick);
  }

  async function playBloom() {
    if (stoppedForFinale) return false;
    if (!audio.paused) return true;
    try {
      await audio.play();
      started = true;
      setUi('playing');
      fadeTo(targetVolume, 2200);
      return true;
    } catch (err) {
      // If the browser blocked autoplay, keep the visible button ready for a real tap.
      setUi(audio.error ? 'missing' : 'paused');
      return false;
    }
  }

  function pauseBloom() {
    if (audio.paused) return;
    fadeTo(0, 450, () => {
      audio.pause();
      setUi('paused');
    });
  }

  control.addEventListener('click', async () => {
    if (audio.paused) await playBloom();
    else pauseBloom();
  });

  // Works even when hero.html is treated as a different local-file origin.
  window.addEventListener('message', event => {
    if (!event.data || event.data.type !== 'bloom-user-intent') return;
    playBloom();
  });

  audio.addEventListener('canplay', () => {
    if (!started && audio.paused) setUi('paused');
  });

  audio.addEventListener('error', () => setUi('missing'));
  audio.addEventListener('play', () => setUi('playing'));
  audio.addEventListener('pause', () => { if (!audio.error) setUi('paused'); });

  function stopForFinale() {
    stoppedForFinale = true;
    cancelAnimationFrame(fadeFrame);
    audio.volume = 0;
    audio.pause();
    setUi('paused');
    control.hidden = true;
    control.disabled = true;
  }

  window.bloomSoundtrack = {
    audio,
    play: playBloom,
    pause: pauseBloom,
    fadeTo,
    stopForFinale,
    get started(){ return started; }
  };

  setUi('paused');
})();


// Reliable, non-blocking Eyes finale — intent-aware snap + muted autoplay.
// Crucially, continued DOWNWARD wheel momentum must not cancel the snap.
(() => {
  'use strict';
  const footer=document.getElementById('finale');
  const video=document.getElementById('eyesFinaleVideo');
  const after=document.getElementById('finaleAfter');
  const replay=document.getElementById('eyesReplay');
  const audioHint=document.getElementById('eyesEnableAudio');
  if(!footer || !video || !after || !replay) return;

  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const source=video.querySelector('source[data-src]');
  let state='idle', sourceLoaded=false, videoUsable=false;
  let armed=true, scrollRaf=0, snapRaf=0, timer=0, stallTimer=0;
  let snapAbort=null, pointerRaf=0, lastScrollY=scrollY;
  const clearTimers=()=>{clearTimeout(timer);clearTimeout(stallTimer);};

  function loadFilm(){
    if(sourceLoaded)return;
    sourceLoaded=true;
    video.muted=true;                    // reliable autoplay on mobile and desktop
    video.defaultMuted=true;
    video.setAttribute('muted','');
    if(source){
      source.src=source.dataset.src;
      source.removeAttribute('data-src');
    }
    video.preload='auto';
    video.load();
  }

  function stopBloom(){
    if(window.bloomSoundtrack?.stopForFinale){
      window.bloomSoundtrack.stopForFinale();
      return;
    }
    const song=document.getElementById('siteSoundtrack');
    if(song){song.volume=0;song.pause();}
    const control=document.getElementById('soundtrackControl');
    if(control)control.hidden=true;
  }

  function showFooter(){
    if(state==='complete')return;
    state='complete';
    clearTimers();
    video.pause();
    footer.classList.remove('is-entering','is-playing','is-holding');
    footer.classList.add('is-complete');
    after.inert=false;
    after.setAttribute('aria-hidden','false');
    replay.hidden=!videoUsable;
    audioHint.hidden=true;
  }
  function finished(){
    if(state==='complete' || state==='holding')return;
    state='holding';
    clearTimers();
    footer.classList.add('is-holding');
    // Preserve the actual last frame for two complete seconds.
    timer=setTimeout(showFooter,2000);
  }
  function fallback(){
    // Even a slow/missing video cannot leave the viewer on an empty ending.
    showFooter();
  }

  // A short native-feeling eased scroll. Momentum *toward* the finale doesn't
  // interrupt it; intentional movement BACK UP can, and scrolling is never locked.
  function moveIntoPlace(){
    const destination=Math.round(scrollY+footer.getBoundingClientRect().top);
    const start=scrollY;
    const delta=destination-start;
    if(reduced || Math.abs(delta)<3){
      scrollTo({top:destination,behavior:'auto'});
      return Promise.resolve(true);
    }
    return new Promise(resolve=>{
      let done=false;
      const duration=520, began=performance.now();
      const root=document.documentElement;
      const previous=root.style.scrollBehavior;
      root.style.scrollBehavior='auto';
      const cancel=()=>{
        if(done)return;
        done=true;
        cancelAnimationFrame(snapRaf);
        root.style.scrollBehavior=previous;
        removeEventListener('wheel',onWheel);
        removeEventListener('keydown',onKey);
        removeEventListener('touchstart',onTouchStart);
        removeEventListener('touchmove',onTouchMove);
        snapAbort=null;
        resolve(false);
      };
      const onWheel=e=>{if(e.deltaY<-5)cancel();};
      const onKey=e=>{if(['ArrowUp','PageUp','Home'].includes(e.key))cancel();};
      let touchY=0;
      const onTouchStart=e=>{touchY=e.touches?.[0]?.clientY||0;};
      const onTouchMove=e=>{
        const y=e.touches?.[0]?.clientY;
        if(typeof y==='number' && y-touchY>12)cancel();
      };
      snapAbort=cancel;
      addEventListener('wheel',onWheel,{passive:true});
      addEventListener('keydown',onKey,{passive:true});
      addEventListener('touchstart',onTouchStart,{passive:true});
      addEventListener('touchmove',onTouchMove,{passive:true});
      const frame=now=>{
        if(done)return;
        const p=Math.min(1,(now-began)/duration);
        const eased=p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;
        scrollTo(0,start+delta*eased);
        if(p<1){snapRaf=requestAnimationFrame(frame);return;}
        done=true;
        root.style.scrollBehavior=previous;
        removeEventListener('wheel',onWheel);
        removeEventListener('keydown',onKey);
        removeEventListener('touchstart',onTouchStart);
        removeEventListener('touchmove',onTouchMove);
        snapAbort=null;
        resolve(true);
      };
      snapRaf=requestAnimationFrame(frame);
    });
  }

  async function begin(replaying=false){
    if(state!=='idle' && !(replaying && state==='complete'))return;
    state='snapping';
    armed=false;
    clearTimers();
    footer.classList.remove('is-complete','is-playing','is-holding','is-entering');
    after.inert=true;
    after.setAttribute('aria-hidden','true');
    replay.hidden=true;
    audioHint.hidden=true;
    stopBloom();
    loadFilm();

    const reached=await moveIntoPlace();
    if(!reached){
      state='idle';
      // Re-arm only after leaving the footer; don't fight the user's scroll.
      return;
    }
    state='opening';
    if(reduced && !replaying){showFooter();return;}
    try {video.pause();video.currentTime=0;}catch(_){}
    // Begin fading in the real video frame before commencing playback.
    footer.classList.add('is-entering');
    await new Promise(r=>setTimeout(r,430));
    if(state!=='opening')return;

    state='playing';
    footer.classList.add('is-playing');
    video.muted=true;
    // HTML muted+playsinline is compatible with scroll-triggered autoplay.
    clearTimers();
    timer=setTimeout(()=>{
      if(state==='playing' && video.currentTime<.12)fallback();
    },12500);
    try{
      const promise=video.play();
      if(promise && typeof promise.catch==='function')await promise;
      if(state==='playing')audioHint.hidden=false; // Optional tap to enable film audio.
    }catch(err){
      fallback();
    }
  }

  video.addEventListener('loadedmetadata',()=>{
    videoUsable=Number.isFinite(video.duration) && video.duration>0;
    if(videoUsable)footer.classList.add('has-video');
  });
  video.addEventListener('ended',finished);
  video.addEventListener('error',()=>{
    if(state==='opening'||state==='playing'||state==='holding')fallback();
  });
  source?.addEventListener('error',()=>{
    if(state==='opening'||state==='playing'||state==='holding')fallback();
  });
  video.addEventListener('timeupdate',()=>{
    if(video.currentTime>.12 && state==='playing')clearTimeout(timer);
    if(!video.paused)clearTimeout(stallTimer);
  });
  video.addEventListener('waiting',()=>{
    if(state!=='playing')return;
    clearTimeout(stallTimer);
    stallTimer=setTimeout(fallback,16000);
  });
  video.addEventListener('playing',()=>clearTimeout(stallTimer));

  replay.addEventListener('click',e=>{
    e.preventDefault();
    begin(true);
  });
  audioHint.addEventListener('click',async e=>{
    e.preventDefault();
    try {
      video.muted=false;video.removeAttribute('muted');
      await video.play();
      audioHint.hidden=true;
    }catch(_){video.muted=true;}
  });

  // Download close to the finale, without delaying the initial garden.
  if('IntersectionObserver' in window){
    const preload=new IntersectionObserver(entries=>{
      if(entries.some(e=>e.isIntersecting)){
        loadFilm();
        preload.disconnect();
      }
    },{rootMargin:'1100px 0px'});
    preload.observe(footer);
  }

  function checkEntry(){
    scrollRaf=0;
    const y=scrollY;
    const rect=footer.getBoundingClientRect();
    const entering=rect.top<=innerHeight*.92 && rect.bottom>0;
    const approachingDown=y>=lastScrollY-2;
    lastScrollY=y;
    if(rect.top>innerHeight*.97 && state==='idle')armed=true;
    if(state==='idle' && armed && entering && approachingDown){
      begin();
    }
    // Visitors can return to previous sections at any time. Pause video
    // offscreen and resume it if they return before the film has ended.
    if(state==='playing'){
      if(rect.bottom<0 || rect.top>innerHeight){
        if(!video.paused)video.pause();
      }else if(video.paused && video.currentTime>.05 &&
          Number.isFinite(video.duration) && video.currentTime<video.duration-.05){
        video.play().catch(()=>{});
      }
    }
  }
  const requestCheck=()=>{
    if(!scrollRaf)scrollRaf=requestAnimationFrame(checkEntry);
  };
  addEventListener('scroll',requestCheck,{passive:true});
  addEventListener('resize',requestCheck,{passive:true});
  addEventListener('pageshow',requestCheck);
  // Let initial page restoration settle before checking direct footer links.
  requestAnimationFrame(requestCheck);

  // The interactive footer light moves on the compositor, not through costly
  // full-page gradient repaints.
  after.addEventListener('pointermove',e=>{
    if(state!=='complete' || e.pointerType==='touch')return;
    const rect=after.getBoundingClientRect();
    const x=(e.clientX-rect.left).toFixed(1)+'px';
    const y=(e.clientY-rect.top).toFixed(1)+'px';
    if(pointerRaf)cancelAnimationFrame(pointerRaf);
    pointerRaf=requestAnimationFrame(()=>{
      after.style.setProperty('--glow-x',x);
      after.style.setProperty('--glow-y',y);
      pointerRaf=0;
    });
  },{passive:true});
  after.addEventListener('pointerleave',()=>{
    after.style.removeProperty('--glow-x');
    after.style.removeProperty('--glow-y');
  });
})();
