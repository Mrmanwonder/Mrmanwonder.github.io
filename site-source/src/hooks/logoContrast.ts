export type LogoTone='light'|'dark';
export function toneForBackground(color:string):LogoTone|null{
 const match=color.match(/^rgba?\(([^)]+)\)$/);if(!match)return null;
 const values=match[1].trim().split(/[\s,\/]+/).map(Number);if(values.length<3||values.some(v=>!Number.isFinite(v))||(values[3]??1)<.5)return null;
 const [r,g,b]=values.slice(0,3).map(v=>{const c=v/255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;});
 return r*.2126+g*.7152+b*.0722<.179?'light':'dark';
}
export type LogoSurface={tone:LogoTone|null;coverage:number;depth:number;active:boolean};
export function chooseLogoTone(surfaces:LogoSurface[],current:LogoTone,fallback:LogoTone):LogoTone{
 let result=fallback,depth=-1,coverage=0;
 for(const surface of surfaces){if(!surface.active||!surface.tone||surface.coverage<(surface.tone===current ? .35 : .6))continue;if(surface.depth>depth||(surface.depth===depth&&surface.coverage>coverage)){result=surface.tone;depth=surface.depth;coverage=surface.coverage;}}
 return result;
}
