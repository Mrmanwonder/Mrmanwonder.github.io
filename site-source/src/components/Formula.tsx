import {ScrollTrigger} from '../hooks/useMotion';
import {useEffect,useMemo} from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
export default function Formula({tex,inline=false}:{tex:string;inline?:boolean}){
 useEffect(()=>{ScrollTrigger.refresh(true);},[]);
 const html=useMemo(()=>katex.renderToString(tex,{displayMode:!inline,throwOnError:false,output:'htmlAndMathml'}),[tex,inline]);
 return <span className={'formula '+(inline?'inline':'')} dangerouslySetInnerHTML={{__html:html}}/>;
}
