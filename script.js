
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
  let pageLoaded = document.readyState === 'complete';
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


(() => {
  'use strict';
  const $=(s,r=document)=>r.querySelector(s); const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const progress=$('#pageProgress'); const flight=$('#petalFlight'); const petalStage=$('#petalStage');
  const onlyUs=$('#onlyUs'), onlyUsStage=$('#onlyUsStage'), onlyUsMedia=$('#onlyUsMedia'), onlyUsVideo=$('#onlyUsVideo');
  const secret=$('#secretButton'), secretMessage=$('#secretMessage'); const loveLetter=$('#loveLetter');

  const text=loveLetter.textContent.trim().replace(/\s+/g,' '); loveLetter.textContent=''; const frag=document.createDocumentFragment();
  text.split(' ').forEach((w,i,a)=>{const s=document.createElement('span');s.className='word';s.textContent=w;frag.append(s);if(i<a.length-1)frag.append(' ')}); loveLetter.append(frag);
  const words=$$('.word',loveLetter); let wordY=[];
  function measureWords(){wordY=words.map(w=>w.getBoundingClientRect().top+scrollY)}

  const revealEls=$$('.reveal');
  if('IntersectionObserver' in window&&!reduced){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target)}}),{threshold:.08,rootMargin:'0px 0px -7% 0px'}); revealEls.forEach(e=>io.observe(e));} else revealEls.forEach(e=>e.classList.add('is-visible'));

  let metrics={flightStart:0,flightTravel:1,onlyUsStart:0,onlyUsTravel:1,pageTravel:1}; let raf=0;
  let onlyUsReady=false; let onlyUsLastFrame=-1;
  function measure(){metrics.flightStart=flight.offsetTop;metrics.flightTravel=Math.max(1,flight.offsetHeight-innerHeight);if(onlyUs){metrics.onlyUsStart=onlyUs.offsetTop;metrics.onlyUsTravel=Math.max(1,onlyUs.offsetHeight-innerHeight)}metrics.pageTravel=Math.max(1,document.documentElement.scrollHeight-innerHeight);measureWords()}
  function clamp(v,a=0,b=1){return Math.min(b,Math.max(a,v))}
  function smoothstep(v){v=clamp(v);return v*v*(3-2*v)}
  function render(){
    raf=0;
    const y=scrollY;
    progress.style.transform=`scaleX(${clamp(y/metrics.pageTravel)})`;

    const fp=clamp((y-metrics.flightStart)/metrics.flightTravel);
    petalStage.style.setProperty('--flight',fp.toFixed(4));

    if(onlyUs && onlyUsMedia){
      const raw=clamp((y-metrics.onlyUsStart)/metrics.onlyUsTravel);
      const filmProgress=clamp((raw-.015)/.885);
      const zoomProgress=smoothstep((raw-.56)/.44);
      const zoom=1+zoomProgress*.145;
      const shift=-zoomProgress*.7;
      onlyUsMedia.style.setProperty('--only-us-zoom',zoom.toFixed(4));
      onlyUsMedia.style.setProperty('--only-us-shift',`${shift.toFixed(3)}%`);

      if(onlyUsReady && !reduced){
        const fps=Number(onlyUsVideo.dataset.fps)||24;
        const frames=Number(onlyUsVideo.dataset.frames)||Math.max(1,Math.round(onlyUsVideo.duration*fps));
        const frame=Math.min(frames-1,Math.max(0,Math.round(filmProgress*(frames-1))));
        if(frame!==onlyUsLastFrame){
          onlyUsLastFrame=frame;
          const target=Math.min(Math.max(0,onlyUsVideo.duration-.001),frame/fps);
          if(Number.isFinite(target) && Math.abs(onlyUsVideo.currentTime-target)>.008) onlyUsVideo.currentTime=target;
        }
      }
    }

    const line=y+innerHeight*.66; const band=155; let last=-1;
    for(let i=0;i<words.length;i++){
      const p=clamp((line-wordY[i])/band);
      words[i].style.opacity=(.12+.88*p).toFixed(3);
      words[i].style.transform=`translateY(${(1-p)*2}px)`;
      words[i].style.color=p>.5?'#44535a':'rgba(68,83,90,.2)';
      if(p>.62) last=i;
    }
    if(last>=0) words[last].style.color='#8d7182';
  }
  function request(){if(!raf)raf=requestAnimationFrame(render)}

  if(onlyUsVideo){
    onlyUsVideo.pause();
    onlyUsVideo.addEventListener('loadedmetadata',()=>{
      onlyUsReady=true;
      onlyUsLastFrame=-1;
      onlyUsVideo.currentTime=0;
      measure();request();
    },{once:true});
    onlyUsVideo.addEventListener('canplay',()=>{onlyUsReady=true;request()},{once:true});
    onlyUsVideo.load();
  }
  addEventListener('scroll',request,{passive:true});addEventListener('resize',()=>{measure();request()},{passive:true});addEventListener('load',()=>{measure();render()},{once:true});
  if(document.fonts?.ready) document.fonts.ready.then(()=>{measure();render()});
  secret?.addEventListener('click',()=>secretMessage?.classList.toggle('is-visible'));
  measure();render();
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


// Cinematic eyes ending. The story snaps to this final full-screen film,
// Bloom stops, and the original footer text appears only after the film ends.
(() => {
  'use strict';
  const footer = document.querySelector('#finale');
  const film = document.querySelector('#eyesFinaleVideo');
  const after = document.querySelector('#finaleAfter');
  const replay = document.querySelector('#eyesReplay');
  const enableAudio = document.querySelector('#eyesEnableAudio');
  if (!footer || !film || !after || !replay) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let activated = false;
  let completed = false;
  let running = false;
  let videoFailed = false;
  let checkTimer = null;

  // Avoid queuing all 17 seconds of frames on initial page load.
  film.pause();
  film.setAttribute('preload','metadata');

  const keys = new Set(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' ','Spacebar']);
  const holdWheel = e => { if(running && e.cancelable) e.preventDefault(); };
  const holdTouch = e => { if(running && e.cancelable) e.preventDefault(); };
  const holdKeys = e => {
    if(!running) return;
    if(e.key === 'Escape') { complete(); return; }
    if(keys.has(e.key) && e.cancelable) e.preventDefault();
  };
  const holdPosition = () => {
    if(!running) return;
    const top = footer.getBoundingClientRect().top + scrollY;
    if(Math.abs(top-scrollY)>6) scrollTo({top,behavior:'auto'});
  };
  function guardScroll() {
    running = true;
    addEventListener('wheel',holdWheel,{passive:false});
    addEventListener('touchmove',holdTouch,{passive:false});
    addEventListener('keydown',holdKeys);
    addEventListener('scroll',holdPosition,{passive:true});
  }
  function releaseScroll() {
    running = false;
    removeEventListener('wheel',holdWheel);
    removeEventListener('touchmove',holdTouch);
    removeEventListener('keydown',holdKeys);
    removeEventListener('scroll',holdPosition);
  }
  function stopBloom() {
    if(window.bloomSoundtrack && window.bloomSoundtrack.stopForFinale) {
      window.bloomSoundtrack.stopForFinale();
    } else {
      const song = document.querySelector('#siteSoundtrack');
      if(song) { song.pause(); song.volume=0; }
      const musicControl = document.querySelector('#soundtrackControl');
      if(musicControl) musicControl.hidden=true;
    }
  }
  function snap() {
    const top=footer.getBoundingClientRect().top + scrollY;
    scrollTo({top:Math.round(top),behavior:'auto'});
  }
  function concealFooter() {
    after.setAttribute('aria-hidden','true');
    after.inert = true;
    replay.hidden = true;
    enableAudio.hidden = true;
    footer.classList.remove('is-complete');
  }
  function complete() {
    if(completed) return;
    completed = true;
    clearTimeout(checkTimer);
    releaseScroll();
    film.pause();
    enableAudio.hidden = true;
    footer.classList.add('is-complete');
    after.inert = false;
    after.setAttribute('aria-hidden','false');
    replay.hidden = videoFailed; // Do not offer replay when the source is missing.
  }
  function fail() {
    videoFailed = true;
    if(activated) complete();
  }
  async function playClip() {
    try {
      film.muted = false;
      await film.play();
    } catch(e) {
      // Some browsers disallow unmuted playback from a scroll event.
      // A muted fallback ensures that the film can still play automatically.
      try {
        film.muted = true;
        await film.play();
        enableAudio.hidden = false;
      } catch(_) {
        fail();
      }
    }
  }
  async function begin(replaying=false) {
    if(activated && !replaying) return;
    activated = true;
    completed = false;
    videoFailed = false;
    concealFooter();
    stopBloom();
    snap();
    footer.classList.add('is-active');
    if(reduced && !replaying) { complete(); return; }
    try { film.pause(); film.currentTime=0; } catch(_) {}
    guardScroll();
    // Arm the watchdog before awaiting play(): a pending media promise can otherwise
    // leave the page locked on an unreliable connection.
    clearTimeout(checkTimer);
    checkTimer=setTimeout(()=>{
      if(!completed && film.currentTime<.2) fail();
    },12000);
    await playClip();
  }

  film.addEventListener('ended',complete);
  film.addEventListener('error',fail);
  let stallTimer=null;
  film.addEventListener('waiting',()=>{
    clearTimeout(stallTimer);
    if(activated && !completed) stallTimer=setTimeout(()=>{ if(!completed) fail(); },18000);
  });
  film.addEventListener('playing',()=>clearTimeout(stallTimer));
  film.addEventListener('timeupdate',()=>{ if(!film.paused) clearTimeout(stallTimer); });
  film.querySelector('source')?.addEventListener('error',fail);
  replay.addEventListener('click',e => {e.preventDefault();begin(true);});
  enableAudio.addEventListener('click',async e => {
    e.preventDefault();
    try { film.muted=false; await film.play(); enableAudio.hidden=true; }
    catch(_) { film.muted=true; }
  });

  // A small intersection is enough: immediately align the film with the viewport.
  // The event fires once as the visitor scrolls down from the previous section.
  if('IntersectionObserver' in window){
    const io=new IntersectionObserver(entries => {
      if(!activated && entries.some(e=>e.isIntersecting)){
        io.disconnect();
        begin();
      }
    },{threshold:.12});
    io.observe(footer);
  } else {
    addEventListener('scroll',()=>{
      if(!activated && footer.getBoundingClientRect().top<innerHeight*.9)begin();
    },{passive:true});
  }
})();
