import {useEffect,useId,useRef,useState,type CSSProperties,type KeyboardEvent} from 'react';
import {createPortal} from 'react-dom';
import Icon from './Icon';
type Option={value:string;label:string};
export default function Dropdown({label,value,options,onChange,invalid=false}:{label:string;value:string;options:Option[];onChange:(value:string)=>void;invalid?:boolean}){
 const id=useId(),trigger=useRef<HTMLButtonElement>(null),menu=useRef<HTMLDivElement>(null),[open,setOpen]=useState(false),[active,setActive]=useState(0),[pos,setPos]=useState<CSSProperties>({}),typeahead=useRef({text:'',time:0});
 const selected=options.findIndex(o=>o.value===value);
 useEffect(()=>{if(!open)return;const position=()=>{const r=trigger.current!.getBoundingClientRect(),width=Math.min(Math.max(176,r.width),innerWidth-24),below=innerHeight-r.bottom-16,up=below<170&&r.top>below;setPos({left:Math.max(12,Math.min(r.left,innerWidth-width-12)),width,maxHeight:Math.min(280,up?r.top-24:below),...(up?{bottom:innerHeight-r.top+7}:{top:r.bottom+7})});};position();
 const outside=(e:PointerEvent)=>{if(!menu.current?.contains(e.target as Node)&&!trigger.current?.contains(e.target as Node))setOpen(false);};
 document.addEventListener('pointerdown',outside);window.addEventListener('resize',position);window.addEventListener('scroll',position,true);
 return()=>{document.removeEventListener('pointerdown',outside);window.removeEventListener('resize',position);window.removeEventListener('scroll',position,true);};
 },[open]);
 useEffect(()=>{if(open)menu.current?.querySelectorAll<HTMLButtonElement>('[role=option]')[active]?.focus({preventScroll:true});},[open,active]);
 const show=()=>{setActive(Math.max(0,selected));setOpen(true);};
 function key(e:KeyboardEvent){let next:number|undefined;if(e.key==='ArrowDown')next=(active+1)%options.length;if(e.key==='ArrowUp')next=(active-1+options.length)%options.length;if(e.key==='Home')next=0;if(e.key==='End')next=options.length-1;
 if(next!==undefined){e.preventDefault();setActive(next);}else if(e.key==='Escape'){e.preventDefault();setOpen(false);trigger.current?.focus();}else if(e.key==='Tab'){setOpen(false);trigger.current?.focus();}else if(e.key.length===1&&e.key!==' '){const now=Date.now();typeahead.current={text:(now-typeahead.current.time>600?'':typeahead.current.text)+e.key.toLowerCase(),time:now};const found=options.findIndex(o=>o.label.toLowerCase().startsWith(typeahead.current.text));if(found>=0)setActive(found);}}
 return <><button ref={trigger} type="button" className={'dropdown-trigger'+(selected>0?' filtered':'')} aria-label={label+': '+(options[selected]?.label||'Select')} aria-haspopup="listbox" aria-expanded={open} aria-controls={id} aria-invalid={invalid||undefined} onClick={()=>open?setOpen(false):show()} onKeyDown={e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();show();}}}><span>{options[selected]?.label||'Select'}</span><Icon name="chevron"/></button>
 {open&&createPortal(<div ref={menu} className="dropdown-menu" role="listbox" aria-label={label} id={id} style={pos} onKeyDown={key}>{options.map((o,i)=><button key={o.value} type="button" role="option" aria-selected={o.value===value} tabIndex={i===active?0:-1} className="dropdown-option" onClick={()=>{onChange(o.value);setOpen(false);trigger.current?.focus();}}>{o.label}{o.value===value&&<Icon name="check"/>}</button>)}</div>,document.body)}</>;
}
