export function rippleStrength(distance:number,front:number,edge=1){const delta=(distance-front)/42;return Math.exp(-(delta*delta))*Math.max(0,Math.min(1,front/70))*edge;}
/** Compress toward the crest, preserving the radial order of neighboring dots. */
export function compressedDistance(distance:number,front:number,activation:number){return distance+(front-distance)*.64*Math.max(0,Math.min(1,activation));}
