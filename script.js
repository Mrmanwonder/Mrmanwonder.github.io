
// V23 — opening garden gate.
// Keep the viewer on the hero until its 22-second bloom is complete and the page is loaded.
(() => {
  'use strict';

  const root = document.documentElement;
  const heroFrame = document.querySelector('.exact-hero-frame');
  if (!root || !heroFrame) {
    root?.classList.remove('intro-locked');
    return;
  }

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const BLOOM_MS = reduced ? 650 : 22500;
  let bloomStarted = false;
  let bloomFinished = false;
  let pageLoaded = true; // Hero iframe load starts the clock; other pages are lazy.
  let startTime = 0;
  let animationFrame = 0;
  let unlocked = false;

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  scrollTo(0, 0);

  const gate = document.createElement('div');
  gate.className = 'intro-gate';
  gate.id = 'introGate';
  gate.setAttribute('role', 'status');
  gate.setAttribute('aria-live', 'polite');
  gate.innerHTML = `
    <strong id="introGateLabel">the garden is waking up…</strong>
    <span class="intro-gate__track" aria-hidden="true"><i id="introGateFill"></i></span>
  `;
  document.body.appendChild(gate);

  const label = gate.querySelector('#introGateLabel');
  const fill = gate.querySelector('#introGateFill');

  const blockedKeys = new Set([
    'ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' ','Spacebar'
  ]);

  const blockWheel = event => {
    if (!unlocked) event.preventDefault();
  };
  const blockTouch = event => {
    if (!unlocked) event.preventDefault();
  };
  const blockKeys = event => {
    if (!unlocked && blockedKeys.has(event.key)) event.preventDefault();
  };
  const holdTop = () => {
    if (!unlocked && scrollY !== 0) scrollTo(0, 0);
  };

  addEventListener('wheel', blockWheel, {passive:false});
  addEventListener('touchmove', blockTouch, {passive:false});
  addEventListener('keydown', blockKeys);
  addEventListener('scroll', holdTop, {passive:true});

  function cleanupGuards(){
    removeEventListener('wheel', blockWheel);
    removeEventListener('touchmove', blockTouch);
    removeEventListener('keydown', blockKeys);
    removeEventListener('scroll', holdTop);
  }

  function unlock(){
    if (unlocked || !bloomFinished || !pageLoaded) return;
    unlocked = true;
    cancelAnimationFrame(animationFrame);
    fill.style.transform = 'scaleX(1)';
    label.textContent = 'the story is ready  ↓';
    gate.classList.add('is-ready');
    scrollTo(0, 0);

    setTimeout(() => {
      root.classList.remove('intro-locked');
      cleanupGuards();
      gate.classList.add('is-leaving');
      setTimeout(() => gate.remove(), 700);
    }, reduced ? 100 : 650);
  }

  function tick(now){
    if (!startTime) startTime = now;
    const p = Math.min(1, (now - startTime) / BLOOM_MS);
    fill.style.transform = `scaleX(${p.toFixed(4)})`;

    if (p >= 1) {
      bloomFinished = true;
      unlock();
      return;
    }
    animationFrame = requestAnimationFrame(tick);
  }

  function beginBloomClock(){
    if (bloomStarted) return;
    bloomStarted = true;
    startTime = 0;
    animationFrame = requestAnimationFrame(tick);
  }

  // The hero's own animation reaches its fully-bloomed rest state at 22 seconds.
  heroFrame.addEventListener('load', beginBloomClock, {once:true});

  // Cached same-origin iframe may already be complete before this deferred script attaches.
  try {
    if (heroFrame.contentDocument?.readyState === 'complete') {
      queueMicrotask(beginBloomClock);
    }
  } catch (_) {}

  // Last-resort safeguard against a cached iframe load event being missed.
  setTimeout(beginBloomClock, 1200);

  if (!pageLoaded) {
    addEventListener('load', () => {
      pageLoaded = true;
      unlock();
    }, {once:true});
  }

  // If the page was already complete when this script ran.
  if (pageLoaded) unlock();
})();


// Light scroll engine: render only visible scenes and request video when approaching.
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
    // The letter is the only expensive per-word scroll animation.
    if(y+innerHeight<letterTop-innerHeight*.3 || y>letterEnd+innerHeight*.3)return;
    const line=y+innerHeight*.67,band=160;
    let last=-1;
    for(let i=0;i<words.length;i++){
      const n=clamp((line-wordY[i])/band);
      const quant=Math.round(n*18);
      if(quant!==wordValues[i]){
        wordValues[i]=quant;
        const value=quant/18;
        const el=words[i];
        el.style.opacity=(.13+.87*value).toFixed(2);
        el.style.transform=value<.99?'translateY(1px)':'none';
        el.style.color=value>.5?'#44535a':'rgba(68,83,90,.2)';
      }
      if(n>.62)last=i;
    }
    // Avoid permanently recoloring a previously active word.
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


// Eye-film finale: scroll freely in either direction; never trap gestures.
(() => {
  'use strict';
  const footer=document.querySelector('#finale');
  const video=document.querySelector('#eyesFinaleVideo');
  const after=document.querySelector('#finaleAfter');
  const replay=document.querySelector('#eyesReplay');
  const audioHint=document.querySelector('#eyesEnableAudio');
  if(!footer||!video||!after||!replay)return;

  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let started=false, ended=false, sourceLoaded=false, watchdog=0, stallWatch=0;
  const clearWatches=()=>{clearTimeout(watchdog);clearTimeout(stallWatch);};
  const source=video.querySelector('source[data-src]');

  function stopBloom(){
    if(window.bloomSoundtrack?.stopForFinale){
      window.bloomSoundtrack.stopForFinale();
    }else{
      const music=document.querySelector('#siteSoundtrack');
      if(music){music.pause();music.volume=0;}
      const control=document.querySelector('#soundtrackControl');
      if(control)control.hidden=true;
    }
  }
  function showMessage(){
    if(ended)return;
    ended=true;
    clearWatches();
    video.pause();
    footer.classList.add('is-complete');
    after.inert=false;
    after.setAttribute('aria-hidden','false');
    replay.hidden=!sourceLoaded;
    audioHint.hidden=true;
  }
  function loadVideo(){
    if(sourceLoaded)return;
    sourceLoaded=true;
    if(source){source.src=source.dataset.src;source.removeAttribute('data-src');}
    video.preload='auto';
    video.load();
  }
  async function play(){
    clearWatches();
    // Browser policies may reject audio autoplay. Play muted if necessary.
    try{
      video.muted=false;
      await video.play();
    }catch(_){
      try{
        video.muted=true;
        await video.play();
        audioHint.hidden=false;
      }catch(_2){
        showMessage();
        return;
      }
    }
    watchdog=setTimeout(()=>{
      if(!ended && video.currentTime<.2)showMessage();
    },10000);
  }
  function alignFinale(){
    // Set scroll-behavior temporarily to auto, even if the site uses smooth scroll.
    const root=document.documentElement;
    const original=root.style.scrollBehavior;
    root.style.scrollBehavior='auto';
    window.scrollTo(0,Math.round(footer.getBoundingClientRect().top+scrollY));
    root.style.scrollBehavior=original;
  }
  function start(isReplay=false){
    if(started&&!isReplay)return;
    started=true;
    ended=false;
    footer.classList.remove('is-complete');
    after.inert=true;
    after.setAttribute('aria-hidden','true');
    replay.hidden=true;
    audioHint.hidden=true;
    stopBloom();
    loadVideo();
    alignFinale();
    if(reduced&&!isReplay){showMessage();return;}
    try{video.pause();video.currentTime=0;}catch(_){}
    // Watchdog is armed before awaiting play; media errors never trap navigation.
    watchdog=setTimeout(()=>{if(!ended&&video.currentTime<.2)showMessage();},11000);
    play();
  }

  video.addEventListener('ended',showMessage);
  video.addEventListener('error',showMessage);
  source?.addEventListener('error',()=>{if(started)showMessage()});
  video.addEventListener('waiting',()=>{
    clearTimeout(stallWatch);
    if(started&&!ended)stallWatch=setTimeout(showMessage,13000);
  });
  video.addEventListener('playing',()=>clearTimeout(stallWatch));
  video.addEventListener('timeupdate',()=>clearTimeout(stallWatch));
  replay.addEventListener('click',e=>{e.preventDefault();start(true)});
  audioHint.addEventListener('click',async e=>{
    e.preventDefault();
    try{video.muted=false;await video.play();audioHint.hidden=true}
    catch(_){video.muted=true}
  });

  if('IntersectionObserver' in window){
    const io=new IntersectionObserver(entries=>{
      if(!started&&entries.some(e=>e.isIntersecting)){
        io.disconnect();
        start();
      }
    },{threshold:.08});
    io.observe(footer);
  }else{
    addEventListener('scroll',()=>{
      if(!started&&footer.getBoundingClientRect().top<innerHeight*.9)start();
    },{passive:true});
  }

  // Going back to a previous chapter must always be possible.
  // Pause the film offscreen; resume if the viewer returns before it has finished.
  if('IntersectionObserver' in window){
    const visibility=new IntersectionObserver(entries=>{
      for(const entry of entries){
        if(!started||ended)continue;
        if(!entry.isIntersecting&&!video.paused)video.pause();
        else if(entry.isIntersecting&&video.paused&&video.currentTime>0){
          video.play().catch(()=>{});
        }
      }
    },{threshold:.01});
    visibility.observe(footer);
  }
})();
