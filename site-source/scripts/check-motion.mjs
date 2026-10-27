import assert from 'node:assert/strict';
import {Window} from 'happy-dom';
import {createServer} from 'vite';
const server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom'});
try{
 const {toneForBackground,chooseLogoTone}=await server.ssrLoadModule('/src/hooks/logoContrast.ts');
 assert.equal(toneForBackground('rgb(255, 255, 255)'),'dark');assert.equal(toneForBackground('rgb(21, 21, 23)'),'light');assert.equal(toneForBackground('rgba(0, 0, 0, 0)'),null);assert.equal(toneForBackground('rgb(15 16 18 / 0.9)'),'light');
 const background={tone:'dark',coverage:1,depth:1,active:true},card={tone:'light',coverage:.59,depth:3,active:true};
 assert.equal(chooseLogoTone([background,card],'dark','dark'),'dark');card.coverage=.61;assert.equal(chooseLogoTone([background,card],'dark','dark'),'light');card.coverage=.4;assert.equal(chooseLogoTone([background,card],'light','dark'),'light');card.coverage=.3;assert.equal(chooseLogoTone([background,card],'light','dark'),'dark');card.coverage=1;card.active=false;assert.equal(chooseLogoTone([background,card],'light','dark'),'dark');card.active=true;
 assert.equal(chooseLogoTone([background,card,{tone:'dark',coverage:1,depth:4,active:true}],'light','dark'),'dark');card.tone=toneForBackground('rgb(255, 255, 255)');assert.equal(chooseLogoTone([background,card],'light','dark'),'dark');
 console.log('PASS: logo contrast follows light/dark themes, ignores inactive panels, honors foreground surfaces and avoids boundary flicker');
 const {rippleStrength,compressedDistance}=await server.ssrLoadModule('/src/hooks/ripplePhysics.ts');
 const original=[180,190,200,210,220],clustered=original.map(distance=>compressedDistance(distance,200,rippleStrength(distance,200)));
 assert.ok(clustered[2]-clustered[1]<5);assert.ok(clustered[3]-clustered[2]<5);assert.equal(clustered[2],200);
 assert.equal(compressedDistance(500,200,rippleStrength(500,200)),500);assert.equal(compressedDistance(210,200,rippleStrength(210,200,0)),210);
 for(const front of [0,50,200,600]){let previous=-1;for(let distance=0;distance<=1000;distance++){const moved=compressedDistance(distance,front,rippleStrength(distance,front));assert.ok(Number.isFinite(moved)&&moved>=previous);previous=moved;}}
 console.log('PASS: active-dot spacing contracts by over half at the crest, quiet dots stay fixed, and dot order remains stable throughout the wave');
 const {paintRadar}=await server.ssrLoadModule('/src/hooks/radarGeometry.ts');const win=new Window();const svg=win.document.createElementNS('http://www.w3.org/2000/svg','svg'),shape=win.document.createElementNS(svg.namespaceURI,'polygon'),dots=Array.from({length:6},()=>win.document.createElementNS(svg.namespaceURI,'circle'));
 for(const t of [0,.01,.2,.49,.8,1]){paintRadar(shape,dots,[4,5,3,4,2,6],[t,t*.8,t*.6,t*.9,t,t*.7]);const points=shape.getAttribute('points').split(' ').map(p=>p.split(',').map(Number));points.forEach(([x,y],i)=>{assert.equal(Number(dots[i].getAttribute('cx')),x);assert.equal(Number(dots[i].getAttribute('cy')),y);});}
 console.log('PASS: radar polygon and all six dots share exact coordinates at every sampled transition state');
 const {learnerConnections}=await server.ssrLoadModule('/src/hooks/learnerConnections.ts');
 for(const width of [284,350,600,720]){
  const stacked=width<550,cards=Array.from({length:6},(_,i)=>({left:stacked?32:i%2===0?0:(width+44)/2,top:200+(stacked?i:Math.floor(i/2))*153,width:stacked?width-32:(width-44)/2,height:130+(i%2)*10,anchorY:33}));
  const hub={x:width/2,y:175},mode=stacked?'stacked':'paired',geometry=learnerConnections(width,hub,cards,mode);assert.equal(geometry.branches.length,6);assert.ok(geometry.trunk.startsWith(`M${width/2} 175`));
  geometry.branches.forEach((d,i)=>{const endpoint=d.match(/L([\d.]+) ([\d.]+)$/),card=cards[i];assert.equal(Number(endpoint[2]),card.top+33);assert.equal(Number(endpoint[1]),stacked?card.left:i%2===0?card.left+card.width:card.left);assert.ok(!d.includes('NaN'));});
 }
 const desktop=learnerConnections(1100,{x:550,y:320},[{left:0,top:40,width:260,height:180,anchorY:30},{left:840,top:50,width:260,height:150,anchorY:30}],'desktop');assert.equal(desktop.trunk,'');assert.match(desktop.branches[0],/260 130$/);assert.match(desktop.branches[1],/840 125$/);
 console.log('PASS: compact connection branches meet all six cards at their icon rows across phone and tablet widths');
 const {bendCurve,smoothCurve,nearestOnCurve}=await server.ssrLoadModule('/src/hooks/curveGeometry.ts');
 const line=Array.from({length:81},(_,i)=>({x:i*10,y:100,nx:0,ny:1}));
 for(const amount of [0,1,12,-12,24]){const bent=bendCurve(line,.5,amount);assert.deepEqual(bent[0],{x:0,y:100});assert.deepEqual(bent[80],{x:800,y:100});assert.equal(bent[40].y,100+amount);assert.ok(bent.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)));assert.ok(Math.abs(bent[5].y-100)<.001);assert.ok(!smoothCurve(bent).includes('NaN'));}
 const nearest=nearestOnCurve(line,400,102);assert.equal(nearest.centre,.5);assert.equal(nearest.distance,4);
 console.log('PASS: footer deformation stays local, holds both endpoints, and selects the nearest curve position');
 const {bindViewportReveal}=await server.ssrLoadModule('/src/hooks/viewportReveal.ts');let callback,replays=0,resets=0;
 const previousObserver=globalThis.IntersectionObserver,previousDocument=globalThis.document;
 globalThis.document=win.document;globalThis.IntersectionObserver=class{constructor(fn){callback=fn;}observe(){}disconnect(){}};
 const stop=bindViewportReveal(svg,{pause:at=>{if(at===0)resets++;},restart:()=>replays++,play(){},progress:()=>1});
 const visible=(on,top)=>callback([{isIntersecting:on,rootBounds:{height:1000},boundingClientRect:{top}}]);visible(false,1200);visible(true,800);assert.equal(replays,0);visible(true,240);assert.equal(replays,1);visible(false,1200);visible(true,240);assert.equal(replays,2);assert.equal(resets,2);stop();globalThis.IntersectionObserver=previousObserver;globalThis.document=previousDocument;
 console.log('PASS: footer waits for arrival and replays after leaving the viewport');
 const fs=await import('node:fs/promises'),path=await import('node:path');const achievements=JSON.parse(await fs.readFile('src/achievements.json','utf8'));assert.equal(achievements.length,23);assert.equal(new Set(achievements.map(a=>a.id)).size,23);for(const a of achievements){assert.ok(a.unlock&&a.description);await fs.access(path.join('public',a.image));}
 await fs.access('public/assets/scanner-demo.mp4');
 console.log('PASS: 23 supplied achievements and the looping scanner recording');
 win.happyDOM.abort();
}finally{await server.close();}
