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
    dispatchEvent(new Event('birthday-garden-ready'));
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

  // Split words inside their original paragraphs without flattening line breaks.
  $$('.love-letter > p',loveLetter.parentNode).forEach(paragraph=>{
    const paragraphText=paragraph.textContent.trim().replace(/\s+/g,' ');
    const fragment=document.createDocumentFragment();
    paragraphText.split(' ').forEach((word,i,array)=>{
      const el=document.createElement('span');
      el.className='word';
      el.textContent=word;
      fragment.appendChild(el);
      if(i<array.length-1)fragment.append(' ');
    });
    paragraph.replaceChildren(fragment);
  });
  const scrubCanvas=$('#onlyUsCanvas');
  const scrubContext=scrubCanvas?.getContext('2d',{alpha:false});
  let lastPaintTime=-1, paintPending=false;
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

  async function loadScrub(){
    if(!onlyUsVideo || loadedScrub)return;
    loadedScrub=true;
    const source=onlyUsVideo.querySelector('source[data-src]');
    const url=source?.dataset.src;
    if(!url)return;
    try{
      // Complete download before seeking: never expose a half-buffered movie.
      const response=await fetch(url,{cache:'force-cache'});
      if(!response.ok)throw Error('Scrub download '+response.status);
      const blob=await response.blob();
      if(!blob.size)throw Error('Empty crowd film');
      if(source)source.remove();
      onlyUsVideo.src=URL.createObjectURL(blob);
      onlyUsVideo.preload='auto';
      onlyUsVideo.load();
    }catch(err){
      // Keep the pre-decoded static image on screen instead of a stalling video.
      console.warn('Crowd film could not be prepared',err);
    }
  }
  function paintScrubFrame(){
    if(!scrubContext || !scrubCanvas || !onlyUsVideo || onlyUsVideo.readyState<2)return;
    try{
      const w=Math.min(1920,onlyUsVideo.videoWidth||1280);
      const h=Math.max(1,Math.round(w*(onlyUsVideo.videoHeight||720)/(onlyUsVideo.videoWidth||1280)));
      if(scrubCanvas.width!==w || scrubCanvas.height!==h){
        scrubCanvas.width=w;scrubCanvas.height=h;
      }
      scrubContext.drawImage(onlyUsVideo,0,0,w,h);
      onlyUsMedia.classList.add('is-frame-ready');
      lastPaintTime=onlyUsVideo.currentTime;
    }catch(_){ /* The last complete frame stays on screen. */ }
  }
  function schedulePaint(){
    if(paintPending)return;
    paintPending=true;
    const draw=()=>{
      paintPending=false;
      paintScrubFrame();
      request();
    };
    if(typeof onlyUsVideo.requestVideoFrameCallback==='function'){
      let fallback=setTimeout(draw,160);
      onlyUsVideo.requestVideoFrameCallback(()=>{
        clearTimeout(fallback);draw();
      });
    }else requestAnimationFrame(draw);
  }
  if(onlyUsVideo){
    onlyUsVideo.pause();
    onlyUsVideo.addEventListener('loadedmetadata',()=>{
      onlyUsReady=true;
      onlyUsLastFrame=-1;
      request();
    });
    onlyUsVideo.addEventListener('loadeddata',schedulePaint);
    onlyUsVideo.addEventListener('seeked',schedulePaint);
    if('IntersectionObserver' in window){
      const prefetch=new IntersectionObserver(entries=>{
        if(entries.some(x=>x.isIntersecting)){
          loadScrub();prefetch.disconnect();
        }
      },{rootMargin:'1800px 0px'});
      prefetch.observe(onlyUs);
    }else{
      addEventListener('scroll',()=>{
        if(scrollY+innerHeight*2>onlyUs.offsetTop)loadScrub();
      },{passive:true});
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
    if(!onlyUsReady || onlyUsVideo.seeking || now-lastSeek<85)return;
    const fps=Number(onlyUsVideo.dataset.fps)||24;
    const frames=Number(onlyUsVideo.dataset.frames)||Math.max(1,Math.round(onlyUsVideo.duration*fps));
    const frame=Math.min(frames-1,Math.max(0,Math.round(filmProgress*(frames-1))));
    if(frame===onlyUsLastFrame)return;
    const target=Math.min(Math.max(0,onlyUsVideo.duration-.001),frame/fps);
    if(!Number.isFinite(target))return;
    onlyUsLastFrame=frame;
    lastSeek=now;
    if(Math.abs(onlyUsVideo.currentTime-target)>.018)onlyUsVideo.currentTime=target;
    else if(lastPaintTime<0)schedulePaint();
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
  // When the opening animation ends, begin preparing the bigger crowd film
  // during idle reading time; skip this background transfer on data saver.
  addEventListener('birthday-garden-ready',()=>{
    if(navigator.connection?.saveData)return;
    setTimeout(()=>{
      if('requestIdleCallback' in window){
        requestIdleCallback(loadScrub,{timeout:6000});
      }else loadScrub();
    },6500);
  },{once:true});
  measure();
  request();
})();

// Defer nonessential images, then reveal the whole decoded image in one frame.
(() => {
  'use strict';
  const root=document.documentElement;
  const images=[...document.querySelectorAll(
    '.memory__frame img,.doodle-interlude__card img,.whimsy__art img,.only-us-scroll__still'
  )];
  const done=img=>{
    if(img.dataset.ready==='true')return;
    img.dataset.ready='true';
  };
  function decode(img){
    if(img.dataset.ready==='true')return;
    if(img.complete && img.naturalWidth){
      const p=typeof img.decode==='function'?img.decode():Promise.resolve();
      Promise.resolve(p).then(()=>done(img),()=>done(img));
      return;
    }
    if(img.complete && !img.naturalWidth)return;
    img.addEventListener('load',()=>decode(img),{once:true});
  }
  for(const img of images){
    decode(img);
    img.addEventListener('error',()=>{img.dataset.error='true'},{once:true});
  }
  if('IntersectionObserver' in window){
    const io=new IntersectionObserver(entries=>{
      for(const e of entries){
        if(!e.isIntersecting)continue;
        const img=e.target;
        img.loading='eager';
        img.fetchPriority='high';
        decode(img);
        io.unobserve(img);
      }
    },{rootMargin:'900px 0px'});
    images.forEach(img=>io.observe(img));
  }
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


// The last moment: only a fully downloaded, decoded Eyes film is ever shown.
// Natural scroll is retained; replay uses its click gesture to request audio.
(() => {
  'use strict';
  const footer=document.getElementById('finale');
  const video=document.getElementById('eyesFinaleVideo');
  const after=document.getElementById('finaleAfter');
  const replay=document.getElementById('eyesReplay');
  const audioHint=document.getElementById('eyesEnableAudio');
  if(!footer||!video||!after||!replay||!audioHint)return;
  const status=document.getElementById('eyesPreparing');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mediaSource=video.querySelector('source[data-src]');
  const file=mediaSource?.dataset.src||'Eyes.mp4';
  let state='idle',armed=true,scrollRaf=0,snapRaf=0;
  let bufferedPromise=null,completeVideo=false,loadFailed=false;
  let holdTimer=0,playWatchdog=0,scrollAbort=null,lightRaf=0;
  let lastScroll=scrollY;
  const timers=()=>{
    clearTimeout(holdTimer);
    clearTimeout(playWatchdog);
  };

  function stopBloom(){
    if(window.bloomSoundtrack?.stopForFinale)window.bloomSoundtrack.stopForFinale();
    else{
      const song=document.getElementById('siteSoundtrack');
      if(song){song.volume=0;song.pause();}
      const control=document.getElementById('soundtrackControl');
      if(control)control.hidden=true;
    }
  }
  function showLetter(){
    if(state==='complete')return;
    state='complete';
    timers();
    video.pause();
    footer.classList.remove('is-preparing','is-entering','is-playing','is-holding');
    footer.classList.add('is-complete');
    after.inert=false;
    after.setAttribute('aria-hidden','false');
    replay.hidden=!completeVideo;
    audioHint.hidden=true;
  }
  function filmEnded(){
    if(state!=='playing')return;
    state='holding';
    timers();
    footer.classList.remove('is-playing');
    footer.classList.add('is-holding');
    holdTimer=setTimeout(showLetter,2000);
  }

  function preparedVideo(){
    if(bufferedPromise)return bufferedPromise;
    bufferedPromise=(async()=>{
      // Fetch the ENTIRE file before revealing the first frame. This prevents
      // streaming network stalls and partial progressive video playback.
      const response=await fetch(file,{cache:'force-cache',priority:'low'});
      if(!response.ok)throw Error('Eyes response '+response.status);
      const blob=await response.blob();
      if(blob.size<4096)throw Error('Incomplete Eyes media');
      const local=URL.createObjectURL(blob);
      if(mediaSource)mediaSource.remove();
      video.preload='auto';
      video.src=local;
      video.load();
      await new Promise((resolve,reject)=>{
        if(video.readyState>=2 && video.videoWidth>0){resolve();return;}
        let timeout=0;
        const cleanup=()=>{
          clearTimeout(timeout);
          video.removeEventListener('loadeddata',ready);
          video.removeEventListener('error',fail);
        };
        const ready=()=>{cleanup();resolve();};
        const fail=()=>{cleanup();reject(new Error('Eyes could not decode'));};
        video.addEventListener('loadeddata',ready,{once:true});
        video.addEventListener('error',fail,{once:true});
        timeout=setTimeout(fail,25000);
      });
      if(video.videoWidth<=0)throw Error('No Eyes video frame');
      completeVideo=true;
      footer.classList.add('has-video');
      return true;
    })().catch(err=>{
      loadFailed=true;
      bufferedPromise=null;
      console.warn('Eyes film preparation failed',err);
      throw err;
    });
    return bufferedPromise;
  }

  // Fetch when the garden finishes, when a visitor approaches the finale, or on replay.
  addEventListener('birthday-garden-ready',()=>{
    setTimeout(()=>{if(!bufferedPromise)preparedVideo().catch(()=>{});},2200);
  },{once:true});
  if('IntersectionObserver' in window){
    const near=new IntersectionObserver(entries=>{
      if(entries.some(e=>e.isIntersecting)){
        preparedVideo().catch(()=>{});
        near.disconnect();
      }
    },{rootMargin:'1900px 0px'});
    near.observe(footer);
  }

  function easedSnap(){
    const destination=Math.max(0,Math.round(footer.getBoundingClientRect().top+scrollY+1));
    const from=scrollY;
    const distance=destination-from;
    if(reduced || Math.abs(distance)<3){
      const root=document.documentElement,old=root.style.scrollBehavior;
      root.style.scrollBehavior='auto';
      scrollTo(0,destination);
      root.style.scrollBehavior=old;
      return Promise.resolve(true);
    }
    return new Promise(resolve=>{
      const root=document.documentElement,old=root.style.scrollBehavior;
      root.style.scrollBehavior='auto';
      let done=false;
      const started=performance.now(),duration=510;
      function cleanup(){
        root.style.scrollBehavior=old;
        removeEventListener('wheel',wheel);
        removeEventListener('keydown',key);
        removeEventListener('touchstart',touchStart);
        removeEventListener('touchmove',touchMove);
        scrollAbort=null;
      }
      function finish(ok){
        if(done)return;
        done=true;cancelAnimationFrame(snapRaf);cleanup();resolve(ok);
      }
      const wheel=e=>{if(e.deltaY<-7)finish(false)};
      const key=e=>{if(['ArrowUp','PageUp','Home'].includes(e.key))finish(false)};
      let initialTouchY=0;
      const touchStart=e=>{initialTouchY=e.touches?.[0]?.clientY||0};
      const touchMove=e=>{
        const v=e.touches?.[0]?.clientY;
        if(typeof v==='number' && v-initialTouchY>12)finish(false);
      };
      scrollAbort=()=>finish(false);
      addEventListener('wheel',wheel,{passive:true});
      addEventListener('keydown',key,{passive:true});
      addEventListener('touchstart',touchStart,{passive:true});
      addEventListener('touchmove',touchMove,{passive:true});
      function frame(now){
        if(done)return;
        const p=Math.min(1,(now-started)/duration);
        const eased=p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;
        scrollTo(0,from+distance*eased);
        if(p<1)snapRaf=requestAnimationFrame(frame);
        else finish(true);
      }
      snapRaf=requestAnimationFrame(frame);
    });
  }

  async function playAutomatic(){
    // First attempt WITH sound, because the user already tapped the garden.
    // If browser policy forbids it, fall back to muted autoplay instead of
    // blocking the film; the unobtrusive audio control remains available.
    video.defaultMuted=false;
    video.muted=false;
    video.removeAttribute('muted');
    try{
      await video.play();
      audioHint.hidden=true;
      return;
    }catch(err){
      if(state!=='playing')return;
      video.muted=true;
      video.setAttribute('muted','');
      try{
        await video.play();
        audioHint.hidden=false;
      }catch(_){
        showLetter();
      }
    }
  }

  async function enter(){
    if(state!=='idle')return;
    state='snapping';
    armed=false;
    stopBloom();
    footer.classList.remove('is-complete','is-holding','is-playing','is-entering');
    after.inert=true;
    after.setAttribute('aria-hidden','true');
    replay.hidden=true;
    audioHint.hidden=true;
    const snapped=await easedSnap();
    if(!snapped){state='idle';return;}
    state='preparing';
    footer.classList.add('is-preparing');
    if(status)status.textContent='a quiet moment, almost ready…';
    let okay=false;
    try{
      okay=await preparedVideo();
    }catch(_){if(state==='preparing'){showLetter();}return;}
    if(state!=='preparing'||!okay)return;
    footer.classList.remove('is-preparing');
    if(reduced){showLetter();return;}
    try{video.pause();video.currentTime=0;}catch(_){}
    state='opening';
    footer.classList.add('is-entering');
    await new Promise(resolve=>setTimeout(resolve,420));
    if(state!=='opening')return;
    state='playing';
    footer.classList.add('is-playing');
    playWatchdog=setTimeout(()=>{
      if(state==='playing'&&video.currentTime<.13)showLetter();
    },12000);
    playAutomatic();
  }

  // A replay click grants a fresh user activation. Start unmuted playback
  // synchronously inside that event before any awaited scroll or timeout.
  function replayFilm(){
    if(!completeVideo || state!=='complete')return;
    timers();
    state='playing';
    after.inert=true;
    after.setAttribute('aria-hidden','true');
    footer.classList.remove('is-complete','is-preparing','is-holding');
    footer.classList.add('is-entering','is-playing');
    replay.hidden=true;
    audioHint.hidden=true;
    video.pause();
    try{video.currentTime=0;}catch(_){}
    video.defaultMuted=false;
    video.muted=false;
    video.removeAttribute('muted');
    const attempt=video.play();
    if(attempt&&typeof attempt.catch==='function'){
      attempt.catch(async()=>{
        video.muted=true;
        video.setAttribute('muted','');
        try{await video.play();audioHint.hidden=false;}
        catch(_){showLetter();}
      });
    }
  }

  video.addEventListener('ended',filmEnded);
  video.addEventListener('timeupdate',()=>{
    if(state==='playing'&&video.currentTime>.15)clearTimeout(playWatchdog);
  });
  video.addEventListener('error',()=>{if(['opening','playing','preparing'].includes(state))showLetter()});
  video.addEventListener('stalled',()=>{if(state==='playing')console.warn('Local Eyes decoding stalled')});
  replay.addEventListener('click',e=>{e.preventDefault();replayFilm()});
  audioHint.addEventListener('click',e=>{
    e.preventDefault();
    video.defaultMuted=false;
    video.muted=false;
    video.removeAttribute('muted');
    video.play().then(()=>{audioHint.hidden=true}).catch(()=>{
      video.muted=true;video.setAttribute('muted','');
    });
  });

  function checkEntry(){
    scrollRaf=0;
    const y=scrollY,rect=footer.getBoundingClientRect();
    const enters=rect.top<innerHeight*.88 && rect.bottom>0;
    const descending=y>=lastScroll-2;
    lastScroll=y;
    if(rect.top>innerHeight*.98 && state==='idle')armed=true;
    if(state==='idle'&&armed&&enters&&descending)enter();
    // No scroll trap. Leaving the film simply pauses it.
    if(state==='playing'){
      const offscreen=rect.bottom<0||rect.top>innerHeight;
      if(offscreen&&!video.paused)video.pause();
      else if(!offscreen&&video.paused&&video.currentTime>.05 &&
              video.currentTime<video.duration-.05){
        video.play().catch(()=>{});
      }
    }
  }
  const requestCheck=()=>{if(!scrollRaf)scrollRaf=requestAnimationFrame(checkEntry)};
  addEventListener('scroll',requestCheck,{passive:true});
  addEventListener('resize',requestCheck,{passive:true});
  addEventListener('pageshow',requestCheck);
  requestAnimationFrame(requestCheck);

  // One transform per pointer animation frame for a tiny, subtle blue light.
  after.addEventListener('pointermove',e=>{
    if(state!=='complete'||e.pointerType==='touch')return;
    const rect=after.getBoundingClientRect();
    const x=(e.clientX-rect.left).toFixed(1)+'px';
    const y=(e.clientY-rect.top).toFixed(1)+'px';
    if(lightRaf)cancelAnimationFrame(lightRaf);
    lightRaf=requestAnimationFrame(()=>{
      after.style.setProperty('--glow-x',x);
      after.style.setProperty('--glow-y',y);
      lightRaf=0;
    });
  },{passive:true});
  after.addEventListener('pointerleave',()=>{
    after.style.removeProperty('--glow-x');
    after.style.removeProperty('--glow-y');
  });
})();
