export const radarPoint=(i:number,value:number):[number,number]=>{const angle=-Math.PI/2+i*Math.PI/3;return [150+Math.cos(angle)*75*value/6,116+Math.sin(angle)*75*value/6];};
export function radarVertices(levels:number[],progress:number[]){return levels.map((value,i)=>radarPoint(i,value*Math.max(0,Math.min(1,progress[i]??0))));}
export function paintRadar(polygon:SVGPolygonElement,dots:SVGCircleElement[],levels:number[],progress:number[]){
 const vertices=radarVertices(levels,progress);
 polygon.setAttribute('points',vertices.map(([x,y])=>`${x},${y}`).join(' '));
 vertices.forEach(([x,y],i)=>{dots[i]?.setAttribute('cx',String(x));dots[i]?.setAttribute('cy',String(y));});
}
