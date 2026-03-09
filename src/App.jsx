import React, { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from "react";

const T = {
  bg0:"#09080C",bg1:"#0F0E13",bg2:"#161519",bg3:"#1D1B22",bg4:"#262329",
  b1:"rgba(255,255,255,0.05)",b2:"rgba(255,255,255,0.09)",b3:"rgba(255,255,255,0.16)",
  t1:"#EDE8E3",t2:"#A09A94",t3:"#60594F",t4:"#302B28",
  v:"#7C6EF5",vl:"rgba(124,110,245,0.10)",vg:"rgba(124,110,245,0.22)",
  g:"#34D399",gl:"rgba(52,211,153,0.10)",gg:"rgba(52,211,153,0.22)",
  a:"#F59E0B",al:"rgba(245,158,11,0.10)",ag:"rgba(245,158,11,0.22)",
  r:"#F87171",rl:"rgba(248,113,113,0.10)",rg:"rgba(248,113,113,0.22)",
  b:"#60C5F1",bl:"rgba(96,197,241,0.10)",bg_:"rgba(96,197,241,0.22)",
  p:"#C9A8F8",pl:"rgba(201,168,248,0.10)",
  o:"#FB923C",ol:"rgba(251,146,60,0.10)",
  fD:"'Fraunces',Georgia,serif",fU:"'Plus Jakarta Sans',system-ui,sans-serif",fM:"'JetBrains Mono','Courier New',monospace",
};
const TPAL=[
  {bg:"rgba(124,110,245,0.12)",tx:"#9B8EF8",bd:"rgba(124,110,245,0.28)"},
  {bg:"rgba(52,211,153,0.12)",tx:"#52DFA5",bd:"rgba(52,211,153,0.28)"},
  {bg:"rgba(245,158,11,0.12)",tx:"#F7B23B",bd:"rgba(245,158,11,0.28)"},
  {bg:"rgba(248,113,113,0.12)",tx:"#F98484",bd:"rgba(248,113,113,0.28)"},
  {bg:"rgba(96,197,241,0.12)",tx:"#74CEF3",bd:"rgba(96,197,241,0.28)"},
  {bg:"rgba(201,168,248,0.12)",tx:"#D3BAFF",bd:"rgba(201,168,248,0.28)"},
  {bg:"rgba(251,146,60,0.12)",tx:"#FCA95E",bd:"rgba(251,146,60,0.28)"},
  {bg:"rgba(74,222,128,0.12)",tx:"#67E494",bd:"rgba(74,222,128,0.28)"},
];

const uid=()=>Math.random().toString(36).slice(2,9)+Date.now().toString(36);
const NOW=new Date().toISOString().split("T")[0];
const fmtD=(d)=>{if(!d)return"";const diff=Math.round((new Date(d+"T00:00:00")-new Date(NOW+"T00:00:00"))/86400000);if(diff===0)return"Hoy";if(diff===1)return"Mañana";if(diff===-1)return"Ayer";if(diff<-1&&diff>-7)return"Hace "+Math.abs(diff)+"d";if(diff>1&&diff<8)return"En "+diff+"d";return new Date(d+"T12:00:00").toLocaleDateString("es-ES",{day:"numeric",month:"short"});};
const fmtFull=(d)=>d?new Date(d+"T12:00:00").toLocaleDateString("es-ES",{weekday:"long",day:"numeric",month:"long"}):"";
const fmtAgo=(iso)=>{if(!iso)return"";const s=Math.floor((Date.now()-new Date(iso))/1000);if(s<60)return"ahora";if(s<3600)return"hace "+Math.floor(s/60)+"min";if(s<86400)return"hace "+Math.floor(s/3600)+"h";return"hace "+Math.floor(s/86400)+"d";};
const tpalIdx=(name,pal)=>pal&&pal[name]!==undefined?pal[name]:name.split("").reduce((a,c)=>a+c.charCodeAt(0),0)%TPAL.length;
const wc=(t)=>t.trim().split(/\s+/).filter(Boolean).length;
const pad2=(n)=>String(n).padStart(2,"0");
const last30Days=()=>{const days=[];const d=new Date();for(let i=29;i>=0;i--){const dd=new Date(d);dd.setDate(dd.getDate()-i);days.push(dd.toISOString().split("T")[0]);}return days;};
const last7Days=()=>{const days=[];const d=new Date();for(let i=6;i>=0;i--){const dd=new Date(d);dd.setDate(dd.getDate()-i);days.push(dd.toISOString().split("T")[0]);}return days;};
const beep=(freq=880,dur=0.3)=>{try{const ctx=new(window.AudioContext||window.webkitAudioContext)();const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.value=freq;g.gain.setValueAtTime(0.2,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+dur);o.start();o.stop(ctx.currentTime+dur);}catch(e){}};

function renderMD(src){if(!src)return"";return src.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/^# (.+)$/gm,'<h1 class="md-h1">$1</h1>').replace(/^## (.+)$/gm,'<h2 class="md-h2">$1</h2>').replace(/^### (.+)$/gm,'<h3 class="md-h3">$1</h3>').replace(/\*\*(.+?)\*\*/g,'<strong class="md-b">$1</strong>').replace(/\*(.+?)\*/g,'<em class="md-i">$1</em>').replace(/`([^`\n]+)`/g,'<code class="md-c">$1</code>').replace(/^&gt; (.+)$/gm,'<blockquote class="md-bq">$1</blockquote>').replace(/^---$/gm,'<hr class="md-hr"/>').replace(/^- \[x\] (.+)$/gm,'<div class="md-ck done"><span class="md-cb done">✓</span><span>$1</span></div>').replace(/^- \[ \] (.+)$/gm,'<div class="md-ck"><span class="md-cb"></span><span>$1</span></div>').replace(/^- (.+)$/gm,'<div class="md-li"><span class="md-dot">◆</span><span>$1</span></div>').replace(/^(\d+)\. (.+)$/gm,'<div class="md-oli"><span class="md-num">$1.</span><span>$2</span></div>').replace(/\n/g,"<br/>");}

const NOTE_TEMPLATES=[
  {id:"blank",icon:"◻",name:"En blanco",body:""},
  {id:"meeting",icon:"🤝",name:"Reunión",body:"# Reunión — DATE\n\n## Asistentes\n- \n\n## Agenda\n- [ ] \n- [ ] \n\n## Decisiones\n\n## Próximos pasos\n- [ ] "},
  {id:"daily",icon:"☀",name:"Revisión diaria",body:"# Revisión — DATE\n\n## 3 prioridades de hoy\n1. \n2. \n3. \n\n## ¿Cómo me siento?\n\n## Intenciones\n\n## Reflexión del día\n"},
  {id:"project",icon:"🚀",name:"Proyecto",body:"# Proyecto: \n\n## Objetivo\n\n## Alcance\n\n## Tareas clave\n- [ ] \n- [ ] \n\n## Recursos\n\n## Notas\n"},
  {id:"book",icon:"📚",name:"Lectura",body:"# Libro: \n**Autor:**  \n**Fecha:**  \n\n## Ideas principales\n\n## Citas favoritas\n> \n\n## ¿Qué aplicaré?\n- \n"},
  {id:"weekly",icon:"📅",name:"Revisión semanal",body:"# Semana del DATE\n\n## ¿Qué salió bien?\n\n## ¿Qué mejorar?\n\n## Meta de la próxima semana\n\n## Hábitos esta semana\n- [ ] \n"},
  {id:"brainstorm",icon:"💡",name:"Brainstorm",body:"# Brainstorm: \n\n## Ideas sin filtro\n- \n- \n- \n\n## Ideas a explorar\n\n## Siguiente acción\n"},
];
const TASK_TEMPLATES=[
  {id:"quick",icon:"⚡",name:"Rápida",title:"",priority:"media",due:"",notes:""},
  {id:"proj",icon:"🚀",name:"Proyecto",title:"",priority:"alta",due:NOW,notes:"## Contexto\n\n## Criterios de éxito\n"},
  {id:"research",icon:"🔬",name:"Investigación",title:"Investigar: ",priority:"media",due:"",notes:"## Fuentes\n\n## Hallazgos\n\n## Conclusión\n"},
  {id:"review",icon:"👁",name:"Revisión",title:"Revisar: ",priority:"baja",due:"",notes:"## Puntos a revisar\n- \n"},
];

const WELCOME_BODY=["# Bienvenido a FlowSpace ✦","","Tu segundo cerebro. Escribe libremente, organiza con intención, ejecuta sin fricción.","","## Novedades en v3","","- **Pomodoro** — Temporizador con modo foco","- **Hábitos** — Rachas diarias con historial visual","- **Estadísticas** — Analíticas de productividad","- **Plantillas** — Para notas y tareas","- **Modo zen** — Escribe sin distracciones","- **Captura rápida** — Ctrl+Shift+Space","- **🌐 Importar URL** — Guarda cualquier artículo web como nota","- **💾 Guardado local** — Tus datos en tu máquina, solo tuyos","- **🌐 Importar URL** — Guarda cualquier artículo web como nota","","## Atajos","","- `Ctrl+K` — Paleta de comandos","- `Ctrl+N` — Nueva nota","- `Ctrl+T` — Nueva tarea","- `Ctrl+Shift+Space` — Captura rápida","","---","","*La simplicidad es la máxima sofisticación.*"].join("\n");

const INIT={
  _v:4,
  settings:{userName:"",pomodoroWork:25,pomodoroBreak:5,pomodoroLong:15,pomodoroSessions:4},
  notes:[
    {id:"n1",title:"Bienvenido a FlowSpace ✦",body:WELCOME_BODY,folder:"inicio",tags:["guía"],pinned:true,created:NOW,updated:new Date().toISOString(),deleted:false},
    {id:"n2",title:"Ideas y reflexiones",body:"# Ideas sueltas\n\n- Investigar herramientas de productividad\n- Leer sobre *deep work*\n- Mejorar la rutina matutina\n\n> *El movimiento crea motivación, no al revés.*",folder:"personal",tags:["ideas"],pinned:false,created:NOW,updated:new Date().toISOString(),deleted:false},
  ],
  tasks:[
    {id:"t1",title:"Explorar FlowSpace",done:false,priority:"alta",tags:["guía"],due:NOW,sub:[{id:"s1",t:"Leer la nota de bienvenida",d:false},{id:"s2",t:"Configurar tus hábitos",d:false},{id:"s3",t:"Probar el Pomodoro",d:false}],folder:"inicio",notes:"",created:NOW,doneAt:null},
    {id:"t2",title:"Definir metas de la semana",done:false,priority:"media",tags:[],due:"",sub:[],folder:"personal",notes:"",created:NOW,doneAt:null},
  ],
  folders:[
    {id:"inicio",name:"Inicio",icon:"⚡",color:T.v},
    {id:"personal",name:"Personal",icon:"🌿",color:T.g},
    {id:"trabajo",name:"Trabajo",icon:"💼",color:T.a},
    {id:"ideas",name:"Ideas",icon:"💡",color:T.p},
    {id:"diario",name:"Diario",icon:"📖",color:T.b},
  ],
  kanban:[
    {id:"kb1",name:"Por hacer",color:T.t3,cards:[{id:"k1",text:"Definir objetivos del trimestre",priority:"alta",created:NOW},{id:"k2",text:"Revisar presupuesto mensual",priority:"media",created:NOW}]},
    {id:"kb2",name:"En progreso",color:T.a,cards:[{id:"k3",text:"Diseñar sistema de organización",priority:"alta",created:NOW}]},
    {id:"kb3",name:"Revisión",color:T.v,cards:[]},
    {id:"kb4",name:"Completado",color:T.g,cards:[{id:"k4",text:"Configurar FlowSpace",priority:"baja",created:NOW}]},
  ],
  journal:[],
  habits:[
    {id:"h1",name:"Meditar",icon:"🧘",color:T.v,completions:[]},
    {id:"h2",name:"Ejercicio",icon:"🏃",color:T.g,completions:[]},
    {id:"h3",name:"Leer 30 min",icon:"📚",color:T.b,completions:[]},
    {id:"h4",name:"Sin redes sociales",icon:"📵",color:T.a,completions:[]},
  ],
  pomodoroLog:[],
  tags:["guía","ideas","trabajo","personal","urgente","lectura","proyecto","reflexión"],
  tagPal:{guía:0,ideas:2,trabajo:5,personal:1,urgente:3,lectura:4,proyecto:6,"reflexión":7},
};

const CSS=`
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;0,9..144,700;1,9..144,300;1,9..144,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}html,body,#root{height:100%;overflow:hidden;}
body{background:#09080C;color:#EDE8E3;}
::-webkit-scrollbar{width:4px;height:4px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:99px;}
input,textarea,select{font-family:'Plus Jakarta Sans',sans-serif;}input::placeholder,textarea::placeholder{color:#302B28;}select option{background:#161519;color:#EDE8E3;}
@keyframes slideIn{from{opacity:0;transform:translateX(12px);}to{opacity:1;transform:translateX(0);}}
@keyframes popIn{from{opacity:0;transform:scale(.94) translateY(-8px);}to{opacity:1;transform:scale(1) translateY(0);}}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
@keyframes zenIn{from{opacity:0;transform:scale(.98);}to{opacity:1;transform:scale(1);}}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.5;}}
@keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
@keyframes shimmer{0%{background-position:-200% 0;}100%{background-position:200% 0;}}
.md-h1{font-family:'Fraunces',serif;font-size:28px;font-weight:600;color:#EDE8E3;margin:20px 0 12px;letter-spacing:-.4px;line-height:1.25;}
.md-h2{font-family:'Fraunces',serif;font-size:20px;font-weight:600;color:#EDE8E3;margin:24px 0 10px;padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,0.07);}
.md-h3{font-size:16px;font-weight:700;color:#EDE8E3;margin:18px 0 6px;font-family:'Plus Jakarta Sans',sans-serif;}
.md-b{font-weight:700;color:#EDE8E3;}.md-i{font-style:italic;color:#A09A94;}
.md-c{background:#1D1B22;color:#34D399;padding:2px 7px;border-radius:5px;font-size:12.5px;font-family:'JetBrains Mono',monospace;}
.md-bq{border-left:3px solid #7C6EF5;padding:10px 16px;margin:12px 0;background:rgba(124,110,245,0.08);border-radius:0 10px 10px 0;display:block;color:#A09A94;font-style:italic;}
.md-hr{border:none;border-top:1px solid rgba(255,255,255,0.08);margin:20px 0;display:block;}
.md-ck{display:flex;align-items:flex-start;gap:9px;margin:5px 0;}.md-cb{width:15px;height:15px;border:2px solid rgba(255,255,255,0.16);border-radius:4px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;margin-top:2px;}.md-cb.done{background:#34D399;border-color:#34D399;color:#000;font-size:9px;font-weight:900;}.md-ck.done span:last-child{color:#60594F;text-decoration:line-through;}
.md-li,.md-oli{display:flex;align-items:flex-start;gap:9px;margin:4px 0;}.md-dot{color:#7C6EF5;font-size:7px;margin-top:6px;flex-shrink:0;}.md-num{color:#7C6EF5;font-size:11px;font-weight:700;min-width:18px;flex-shrink:0;font-family:'JetBrains Mono',monospace;margin-top:1px;}
.md-body br{display:block;margin:2px 0;}
`;

/* ── TOAST ── */
const ToastCtx=createContext(null);
function ToastProvider({children}){
  const[toasts,setToasts]=useState([]);
  const add=useCallback((msg,type="success")=>{const id=uid();setToasts(p=>[...p,{id,msg,type}]);setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),3200);},[]);
  const ICONS={success:"✓",error:"✕",info:"ℹ",warning:"⚠"};
  const COLS={success:T.g,error:T.r,info:T.b,warning:T.a};
  return(<ToastCtx.Provider value={add}>{children}<div style={{position:"fixed",bottom:22,right:22,zIndex:9999,display:"flex",flexDirection:"column",gap:8,pointerEvents:"none"}}>{toasts.map(t=>(<div key={t.id} style={{background:T.bg3,border:"1px solid "+COLS[t.type]+"44",borderLeft:"3px solid "+COLS[t.type],borderRadius:12,padding:"10px 16px",display:"flex",alignItems:"center",gap:10,fontFamily:T.fU,fontSize:13,color:T.t1,boxShadow:"0 8px 32px rgba(0,0,0,0.4)",animation:"slideIn .22s ease",pointerEvents:"auto",maxWidth:320}}><span style={{color:COLS[t.type],fontWeight:700,fontSize:12}}>{ICONS[t.type]}</span>{t.msg}</div>))}</div></ToastCtx.Provider>);
}
const useToast=()=>useContext(ToastCtx);

/* ── CONFIRM ── */
const ConfirmCtx=createContext(null);
function ConfirmProvider({children}){
  const[state,setState]=useState(null);
  const confirm=useCallback((opts)=>new Promise(res=>setState({...opts,res})),[]);
  const close=(val)=>{state?.res(val);setState(null);};
  return(<ConfirmCtx.Provider value={confirm}>{children}{state&&(<div onClick={()=>close(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:8000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(4px)"}}><div onClick={e=>e.stopPropagation()} style={{background:T.bg2,border:"1px solid "+T.b2,borderRadius:18,padding:28,maxWidth:380,width:"100%",boxShadow:"0 32px 80px rgba(0,0,0,0.5)",animation:"popIn .2s ease"}}>{state.icon&&<div style={{fontSize:32,marginBottom:14,textAlign:"center"}}>{state.icon}</div>}<h3 style={{margin:"0 0 8px",fontFamily:T.fD,fontSize:20,fontWeight:600,color:T.t1,textAlign:"center",fontStyle:"italic"}}>{state.title||"¿Estás seguro?"}</h3>{state.body&&<p style={{margin:"0 0 22px",color:T.t2,fontSize:14,lineHeight:1.6,textAlign:"center",fontFamily:T.fU}}>{state.body}</p>}<div style={{display:"flex",gap:10}}><button onClick={()=>close(false)} style={{flex:1,background:T.bg4,border:"1px solid "+T.b2,color:T.t2,borderRadius:10,padding:"10px 0",cursor:"pointer",fontSize:14,fontFamily:T.fU,fontWeight:600}}>{state.cancel||"Cancelar"}</button><button onClick={()=>close(true)} style={{flex:1,background:state.danger?T.r:T.v,border:"none",color:"#fff",borderRadius:10,padding:"10px 0",cursor:"pointer",fontSize:14,fontFamily:T.fU,fontWeight:700}}>{state.ok||"Confirmar"}</button></div></div></div>)}</ConfirmCtx.Provider>);
}
const useConfirm=()=>useContext(ConfirmCtx);

/* ── ATOMS ── */
function TagChip({name,pal,small,onRemove}){const p=TPAL[tpalIdx(name,pal)]||TPAL[0];return(<span style={{display:"inline-flex",alignItems:"center",gap:3,background:p.bg,color:p.tx,border:"1px solid "+p.bd,borderRadius:99,padding:small?"1px 8px":"3px 10px",fontSize:small?10:11,fontWeight:600,letterSpacing:.3,whiteSpace:"nowrap",fontFamily:T.fM}}>{"#"+name}{onRemove&&<span onClick={e=>{e.stopPropagation();onRemove();}} style={{cursor:"pointer",opacity:.7,fontSize:14,lineHeight:1,marginLeft:1}}>×</span>}</span>);}
function PriChip({p,small}){const m={alta:{c:T.r,l:"↑ Alta"},media:{c:T.a,l:"→ Media"},baja:{c:T.g,l:"↓ Baja"}};const s=m[p]||m.media;return <span style={{background:s.c+"22",color:s.c,border:"1px solid "+s.c+"44",borderRadius:99,padding:small?"1px 8px":"2px 10px",fontSize:small?10:11,fontWeight:700,fontFamily:T.fM}}>{s.l}</span>;}
function Ring({value=0,size=44,stroke=3.5,color=T.v,children}){const r=(size-stroke*2)/2,circ=2*Math.PI*r,off=circ*(1-Math.min(100,Math.max(0,value))/100);return(<div style={{position:"relative",width:size,height:size,flexShrink:0}}><svg width={size} height={size} style={{transform:"rotate(-90deg)",position:"absolute",top:0,left:0}}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke}/><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round" style={{transition:"stroke-dashoffset .7s cubic-bezier(.4,0,.2,1)"}}/></svg>{children&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>{children}</div>}</div>);}
function EmptyState({icon,title,body,action,actionLabel}){return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",padding:"60px 20px",textAlign:"center",gap:12}}><div style={{fontSize:48,opacity:.18,marginBottom:4}}>{icon}</div><div style={{fontFamily:T.fD,fontSize:20,fontWeight:600,color:T.t2,fontStyle:"italic"}}>{title}</div>{body&&<div style={{color:T.t3,fontSize:13,lineHeight:1.6,maxWidth:300,fontFamily:T.fU}}>{body}</div>}{action&&<button onClick={action} style={{marginTop:8,background:T.v,border:"none",color:"#fff",borderRadius:10,padding:"9px 20px",cursor:"pointer",fontSize:13,fontFamily:T.fU,fontWeight:700}}>{actionLabel||"Empezar"}</button>}</div>);}

/* ── TEMPLATE PICKER ── */
function TemplatePicker({mode="note",onPick,onClose}){
  const templates=mode==="note"?NOTE_TEMPLATES:TASK_TEMPLATES;
  return(<div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:900,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(5px)"}}><div onClick={e=>e.stopPropagation()} style={{background:T.bg2,border:"1px solid "+T.b2,borderRadius:20,padding:24,width:"100%",maxWidth:520,boxShadow:"0 32px 80px rgba(0,0,0,0.5)",animation:"popIn .2s ease"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}><h3 style={{margin:0,fontFamily:T.fD,fontSize:20,fontWeight:600,color:T.t1,fontStyle:"italic"}}>Elige una plantilla</h3><button onClick={onClose} style={{background:T.bg4,border:"none",borderRadius:8,width:30,height:30,cursor:"pointer",color:T.t3,fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button></div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:8}}>{templates.map(tpl=>(<button key={tpl.id} onClick={()=>{onPick(tpl);onClose();}} style={{background:T.bg3,border:"1px solid "+T.b1,borderRadius:12,padding:"14px 12px",cursor:"pointer",textAlign:"left",transition:"all .15s",display:"flex",flexDirection:"column",gap:6}} onMouseEnter={e=>{e.currentTarget.style.border="1px solid "+T.v;e.currentTarget.style.background=T.vl;}} onMouseLeave={e=>{e.currentTarget.style.border="1px solid "+T.b1;e.currentTarget.style.background=T.bg3;}}><span style={{fontSize:22}}>{tpl.icon}</span><span style={{color:T.t1,fontSize:12,fontWeight:600,fontFamily:T.fU}}>{tpl.name}</span></button>))}</div></div></div>);
}

/* ── QUICK CAPTURE ── */
function QuickCapture({data,save,nav,onClose,toast}){
  const[mode,setMode]=useState("note");
  const[title,setTitle]=useState("");
  const[body,setBody]=useState("");
  const[priority,setPriority]=useState("media");
  const[due,setDue]=useState("");
  const ref=useRef(null);
  useEffect(()=>{setTimeout(()=>ref.current?.focus(),80);},[]);
  const submit=()=>{
    if(!title.trim())return;
    if(mode==="note"){save({...data,notes:[{id:uid(),title:title.trim(),body,folder:"inicio",tags:[],pinned:false,created:NOW,updated:new Date().toISOString(),deleted:false},...data.notes]});toast("Nota añadida ✓");}
    else{save({...data,tasks:[{id:uid(),title:title.trim(),done:false,priority,due,sub:[],tags:[],folder:"inicio",notes:"",created:NOW,doneAt:null},...data.tasks]});toast("Tarea añadida ✓");}
    onClose();
  };
  const PC={alta:T.r,media:T.a,baja:T.g};
  return(<div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:9000,display:"flex",alignItems:"flex-end",justifyContent:"center",padding:"0 16px 80px",backdropFilter:"blur(4px)"}}><div onClick={e=>e.stopPropagation()} style={{background:T.bg2,border:"1px solid "+T.b2,borderRadius:20,padding:20,width:"100%",maxWidth:520,boxShadow:"0 -16px 60px rgba(0,0,0,0.5)",animation:"popIn .22s ease"}}><div style={{display:"flex",gap:4,marginBottom:14,background:T.bg3,borderRadius:10,padding:3}}>{["note","task"].map(m=>(<button key={m} onClick={()=>setMode(m)} style={{flex:1,background:mode===m?T.bg4:"transparent",border:"none",color:mode===m?T.t1:T.t3,borderRadius:8,padding:"7px 0",cursor:"pointer",fontSize:12,fontFamily:T.fU,fontWeight:600,transition:"all .15s"}}>{m==="note"?"◈ Nota":"◉ Tarea"}</button>))}</div><input ref={ref} value={title} onChange={e=>setTitle(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")submit();if(e.key==="Escape")onClose();}} placeholder={mode==="note"?"Título de la nota...":"¿Qué hay que hacer?"} style={{width:"100%",background:T.bg3,border:"1px solid "+T.b2,borderRadius:11,padding:"12px 15px",color:T.t1,fontSize:15,fontFamily:T.fU,outline:"none",boxSizing:"border-box",marginBottom:10}}/>{mode==="note"?(<textarea value={body} onChange={e=>setBody(e.target.value)} rows={3} placeholder="Contenido (opcional)..." style={{width:"100%",background:T.bg3,border:"1px solid "+T.b1,borderRadius:10,padding:"10px 13px",color:T.t1,fontSize:13,fontFamily:T.fU,resize:"none",outline:"none",boxSizing:"border-box",marginBottom:10}}/>):(<div style={{display:"flex",gap:8,marginBottom:12}}><div style={{flex:1}}><div style={{color:T.t4,fontSize:10,textTransform:"uppercase",fontFamily:T.fM,fontWeight:700,marginBottom:5,letterSpacing:.8}}>Prioridad</div><div style={{display:"flex",gap:4}}>{["alta","media","baja"].map(p=>(<button key={p} onClick={()=>setPriority(p)} style={{flex:1,background:priority===p?PC[p]+"22":"transparent",border:"1px solid "+(priority===p?PC[p]:T.b2),color:priority===p?PC[p]:T.t3,borderRadius:7,padding:"5px 0",cursor:"pointer",fontSize:10,fontWeight:600,fontFamily:T.fU,transition:"all .15s"}}>{p}</button>))}</div></div><div style={{flex:1}}><div style={{color:T.t4,fontSize:10,textTransform:"uppercase",fontFamily:T.fM,fontWeight:700,marginBottom:5,letterSpacing:.8}}>Fecha</div><input type="date" value={due} onChange={e=>setDue(e.target.value)} style={{width:"100%",background:T.bg3,border:"1px solid "+T.b2,borderRadius:8,padding:"7px 9px",color:T.t1,fontSize:11,outline:"none",boxSizing:"border-box"}}/></div></div>)}<div style={{display:"flex",gap:8}}><button onClick={submit} style={{flex:1,background:T.v,border:"none",color:"#fff",borderRadius:10,padding:11,cursor:"pointer",fontWeight:700,fontSize:14,fontFamily:T.fU}}>Añadir {mode==="note"?"nota":"tarea"} →</button><button onClick={onClose} style={{background:T.bg3,border:"1px solid "+T.b1,color:T.t3,borderRadius:10,padding:"11px 14px",cursor:"pointer",fontSize:13}}>✕</button></div><div style={{textAlign:"center",marginTop:8,color:T.t4,fontSize:10,fontFamily:T.fM}}>Enter guardar · Esc cerrar</div></div></div>);
}

/* ── IMPORT URL MODAL ── */
function ImportURLModal({data,save,nav,onClose,toast}){
  const[url,setUrl]=useState("");
  const[loading,setLoading]=useState(false);
  const[err,setErr]=useState("");
  const[preview,setPreview]=useState(null);
  const ref=useRef(null);
  useEffect(()=>{setTimeout(()=>ref.current?.focus(),80);},[]);

  const doImport=async()=>{
    if(!url.trim())return;
    setLoading(true);setErr("");setPreview(null);
    try{
      const result=await importURL(url.trim());
      setPreview(result);
    }catch(e){setErr(e.message);}
    finally{setLoading(false);}
  };

  const saveNote=()=>{
    if(!preview)return;
    const n={id:uid(),title:preview.title,body:preview.body,folder:"inicio",tags:["importado"],pinned:false,created:NOW,updated:new Date().toISOString(),deleted:false};
    save({...data,notes:[n,...data.notes],tags:data.tags.includes("importado")?data.tags:[...data.tags,"importado"]});
    toast("Artículo importado como nota ✓");
    nav("note/"+n.id);
    onClose();
  };

  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:9000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(6px)"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:T.bg2,border:"1px solid "+T.b2,borderRadius:20,padding:24,width:"100%",maxWidth:560,boxShadow:"0 32px 80px rgba(0,0,0,0.6)",animation:"popIn .22s ease",maxHeight:"80vh",display:"flex",flexDirection:"column"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div><h3 style={{margin:0,fontFamily:T.fD,fontSize:20,fontWeight:600,color:T.t1,fontStyle:"italic"}}>🌐 Importar URL</h3><div style={{color:T.t4,fontSize:11,marginTop:3,fontFamily:T.fM}}>Extrae el texto completo · corre en tu navegador · no pasa por nuestros servidores</div></div>
          <button onClick={onClose} style={{background:T.bg4,border:"none",borderRadius:8,width:30,height:30,cursor:"pointer",color:T.t3,fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>×</button>
        </div>
        <div style={{display:"flex",gap:8,marginBottom:14}}>
          <input ref={ref} value={url} onChange={e=>setUrl(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doImport()} placeholder="https://medium.com/... · nytimes.com/... · cualquier artículo" style={{flex:1,background:T.bg3,border:"1px solid "+T.b2,borderRadius:10,padding:"10px 14px",color:T.t1,fontSize:13,fontFamily:T.fU,outline:"none"}}/>
          <button onClick={doImport} disabled={loading||!url.trim()} style={{background:loading?T.bg4:T.v,border:"none",color:loading?T.t4:"#fff",borderRadius:10,padding:"10px 16px",cursor:loading?"not-allowed":"pointer",fontSize:13,fontWeight:700,fontFamily:T.fU,flexShrink:0,display:"flex",alignItems:"center",gap:6}}>
            {loading?<><span style={{display:"inline-block",width:12,height:12,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:T.v,borderRadius:99,animation:"spin .7s linear infinite"}}/>Importando...</>:"Importar →"}
          </button>
        </div>
        {err&&<div style={{background:T.rl,border:"1px solid "+T.rg,borderRadius:10,padding:"10px 14px",color:T.r,fontSize:13,fontFamily:T.fU,marginBottom:12}}>{err}</div>}
        {preview&&(
          <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column",gap:10}}>
            <div style={{background:T.bg3,border:"1px solid "+T.gg,borderRadius:12,padding:"14px 16px"}}>
              <div style={{color:T.g,fontSize:10,textTransform:"uppercase",fontFamily:T.fM,letterSpacing:1,marginBottom:6}}>✓ Importado desde {preview.domain}</div>
              <div style={{fontFamily:T.fD,fontSize:16,fontWeight:600,color:T.t1,marginBottom:4,fontStyle:"italic"}}>{preview.title}</div>
              <div style={{color:T.t3,fontSize:11,fontFamily:T.fM}}>{preview.wordCount.toLocaleString()} palabras · ~{Math.ceil(preview.wordCount/200)} min lectura</div>
            </div>
            <div style={{flex:1,overflow:"auto",background:T.bg1,borderRadius:12,padding:"14px 16px",border:"1px solid "+T.b1}}>
              <div style={{color:T.t3,fontSize:12,lineHeight:1.7,fontFamily:T.fU,whiteSpace:"pre-wrap"}}>{preview.body.slice(0,600)}...</div>
            </div>
            <button onClick={saveNote} style={{background:T.g,border:"none",color:"#000",borderRadius:11,padding:"12px",cursor:"pointer",fontWeight:700,fontSize:14,fontFamily:T.fU}}>✓ Guardar como nota</button>
          </div>
        )}
        {!preview&&!loading&&<div style={{color:T.t4,fontSize:12,fontFamily:T.fU,textAlign:"center",padding:"20px 0",lineHeight:1.8}}>Funciona con Medium, Substack, NYT, Wikipedia, blogs...<br/>El contenido solo se guarda en tu cuenta.</div>}
      </div>
    </div>
  );
}


const NAV=[{id:"home",icon:"⌂",label:"Inicio"},{id:"notes",icon:"◈",label:"Notas"},{id:"tasks",icon:"◉",label:"Tareas"},{id:"kanban",icon:"▦",label:"Kanban"},{id:"calendar",icon:"◫",label:"Calendario"},{id:"journal",icon:"◪",label:"Diario"},{id:"habits",icon:"◐",label:"Hábitos"},{id:"pomodoro",icon:"⏱",label:"Pomodoro"},{id:"stats",icon:"◻",label:"Estadísticas"},{id:"tags",icon:"◇",label:"Etiquetas"}];

function Sidebar({view,nav,data,save,open,toast,confirm}){
  const[addF,setAddF]=useState(false);
  const[fname,setFname]=useState("");
  const notesByFolder=useMemo(()=>{const m={};data.folders.forEach(f=>{m[f.id]=data.notes.filter(n=>n.folder===f.id&&!n.deleted).length;});return m;},[data.notes,data.folders]);
  const overdue=useMemo(()=>data.tasks.filter(t=>!t.done&&t.due&&t.due<NOW).length,[data.tasks]);
  const taskBadge=overdue+data.tasks.filter(t=>!t.done&&t.due===NOW).length;
  const habitsDoneToday=data.habits.filter(h=>h.completions.includes(NOW)).length;
  const addFolder=()=>{if(!fname.trim())return;const icons=["📁","🗂","📌","🔖","⭐","🎯","🧩","🌀","🔬","🎨"];const colors=[T.v,T.g,T.a,T.p,T.b,T.r,T.o,"#4ADE80","#E879F9","#06B6D4"];save({...data,folders:[...data.folders,{id:"f_"+uid(),name:fname.trim(),icon:icons[data.folders.length%10],color:colors[data.folders.length%10]}]});setFname("");setAddF(false);toast("Carpeta creada");};
  const delFolder=async(fid)=>{const ok=await confirm({title:"Eliminar carpeta",body:"Las notas se moverán a Inicio.",danger:true,ok:"Eliminar",icon:"📁"});if(!ok)return;save({...data,folders:data.folders.filter(f=>f.id!==fid),notes:data.notes.map(n=>n.folder===fid?{...n,folder:"inicio"}:n)});toast("Carpeta eliminada","info");};
  const nb=(style)=>({width:"100%",display:"flex",alignItems:"center",gap:9,padding:"7px 10px",background:"transparent",border:"none",borderRadius:8,cursor:"pointer",textAlign:"left",fontFamily:T.fU,fontSize:13,fontWeight:500,transition:"background .12s, color .12s",marginBottom:1,...style});
  return(
    <div style={{width:open?228:0,minWidth:open?228:0,height:"100vh",background:T.bg1,borderRight:"1px solid "+T.b1,display:"flex",flexDirection:"column",overflow:"hidden",transition:"all .28s cubic-bezier(.4,0,.2,1)",flexShrink:0}}>
      <div style={{padding:"16px 14px 14px",borderBottom:"1px solid "+T.b1,display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
        <div style={{width:32,height:32,borderRadius:9,background:"linear-gradient(135deg,#7C6EF5,#C9A8F8)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>✦</div>
        <div><div style={{fontFamily:T.fD,fontWeight:600,fontSize:16,color:T.t1,letterSpacing:-.2,fontStyle:"italic"}}>FlowSpace</div><div style={{fontSize:9,color:T.t4,letterSpacing:1.5,textTransform:"uppercase",fontFamily:T.fM}}>v3.0</div></div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"10px 8px"}}>
        <div style={{marginBottom:14}}>
          {NAV.map(item=>{const active=view===item.id||view.startsWith(item.id+"/");return(<button key={item.id} onClick={()=>nav(item.id)} style={nb({background:active?T.vl:"transparent",color:active?T.v:T.t2,fontWeight:active?600:500})}><span style={{fontSize:14,width:18,textAlign:"center",flexShrink:0,color:active?T.v:T.t3}}>{item.icon}</span><span style={{flex:1}}>{item.label}</span>{item.id==="tasks"&&taskBadge>0&&<span style={{background:overdue>0?T.rl:T.al,color:overdue>0?T.r:T.a,borderRadius:99,padding:"1px 6px",fontSize:9,fontFamily:T.fM,fontWeight:700}}>{taskBadge}</span>}{item.id==="habits"&&<span style={{color:habitsDoneToday===data.habits.length&&data.habits.length>0?T.g:T.t4,fontSize:10,fontFamily:T.fM}}>{habitsDoneToday}/{data.habits.length}</span>}</button>);})}
        </div>
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"2px 10px 8px"}}><span style={{color:T.t4,fontSize:9,letterSpacing:1.8,textTransform:"uppercase",fontWeight:700,fontFamily:T.fM}}>Carpetas</span><button onClick={()=>setAddF(true)} style={{background:"none",border:"none",color:T.t4,cursor:"pointer",fontSize:18,lineHeight:1,padding:"0 2px"}} onMouseEnter={e=>e.currentTarget.style.color=T.v} onMouseLeave={e=>e.currentTarget.style.color=T.t4}>+</button></div>
          {data.folders.map(f=>{const active=view==="folder/"+f.id;const builtin=["inicio","personal","trabajo","ideas","diario"].includes(f.id);return(<div key={f.id} style={{display:"flex",alignItems:"center",position:"relative"}}><button onClick={()=>nav("folder/"+f.id)} style={nb({background:active?T.bg3:"transparent",color:active?T.t1:T.t2,fontSize:12})}><span style={{color:f.color,fontSize:13,flexShrink:0}}>{f.icon}</span><span style={{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{f.name}</span><span style={{color:T.t4,fontSize:10,fontFamily:T.fM}}>{notesByFolder[f.id]||0}</span></button>{!builtin&&<button onClick={()=>delFolder(f.id)} style={{position:"absolute",right:4,background:"none",border:"none",color:T.r,cursor:"pointer",fontSize:11,opacity:0,padding:"3px 5px",transition:"opacity .15s"}} onMouseEnter={e=>e.currentTarget.style.opacity="1"} onMouseLeave={e=>e.currentTarget.style.opacity="0"}>✕</button>}</div>);})}
          {addF&&(<div style={{padding:"4px 6px",display:"flex",gap:4}}><input autoFocus value={fname} onChange={e=>setFname(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")addFolder();if(e.key==="Escape"){setAddF(false);setFname("");}}} placeholder="Nombre..." style={{flex:1,background:T.bg3,border:"1px solid "+T.b2,borderRadius:7,padding:"5px 9px",color:T.t1,fontSize:12,fontFamily:T.fU,outline:"none"}}/><button onClick={addFolder} style={{background:T.v,border:"none",borderRadius:7,color:"#fff",cursor:"pointer",padding:"5px 10px",fontSize:11,fontWeight:700}}>✓</button><button onClick={()=>{setAddF(false);setFname("");}} style={{background:T.bg4,border:"none",borderRadius:7,color:T.t3,cursor:"pointer",padding:"5px 9px",fontSize:11}}>✕</button></div>)}
        </div>
      </div>
      <div style={{padding:"8px",borderTop:"1px solid "+T.b1,flexShrink:0}}>
        <button onClick={()=>nav("trash")} style={nb({color:view==="trash"?T.r:T.t3,fontSize:12,background:view==="trash"?T.rl:"transparent"})}><span>🗑</span> Papelera{data.notes.filter(n=>n.deleted).length>0&&<span style={{marginLeft:"auto",background:T.rl,color:T.r,borderRadius:99,padding:"0px 6px",fontSize:9,fontFamily:T.fM}}>{data.notes.filter(n=>n.deleted).length}</span>}</button>
        <button onClick={()=>nav("settings")} style={nb({color:view==="settings"?T.v:T.t3,fontSize:12,background:view==="settings"?T.vl:"transparent"})}><span>⚙</span> Ajustes</button>
      </div>
    </div>
  );
}

function Home({data,nav}){
  const h=new Date().getHours();
  const greet=h<5?"Buenas noches":h<12?"Buenos días":h<18?"Buenas tardes":"Buenas noches";
  const name=data.settings?.userName;
  const stats=useMemo(()=>{const t=data.tasks,n=data.notes.filter(x=>!x.deleted);const done=t.filter(x=>x.done).length,pct=t.length>0?Math.round(done/t.length*100):0;return{done,pct,over:t.filter(x=>!x.done&&x.due&&x.due<NOW).length,today:t.filter(x=>!x.done&&x.due===NOW).length,total:t.length,pending:t.filter(x=>!x.done).length,notes:n.length};},[data.tasks,data.notes]);
  const streak=useMemo(()=>{let s=0;const d=new Date();for(let i=0;i<365;i++){const ds=d.toISOString().split("T")[0];if(data.journal.find(j=>j.date===ds)){s++;d.setDate(d.getDate()-1);}else break;}return s;},[data.journal]);
  const habitsDone=data.habits.filter(h=>h.completions.includes(NOW)).length;
  const dueItems=useMemo(()=>data.tasks.filter(t=>!t.done&&t.due&&t.due<=NOW).sort((a,b)=>a.due.localeCompare(b.due)),[data.tasks]);
  const pinned=useMemo(()=>data.notes.filter(n=>n.pinned&&!n.deleted),[data.notes]);
  const recent=useMemo(()=>data.notes.filter(n=>!n.deleted).slice(0,6),[data.notes]);
  const card={background:T.bg2,border:"1px solid "+T.b1,borderRadius:14,padding:18,transition:"all .2s",cursor:"pointer"};
  const hov=(c)=>({onMouseEnter:e=>{e.currentTarget.style.border="1px solid "+c+"50";e.currentTarget.style.transform="translateY(-2px)";},onMouseLeave:e=>{e.currentTarget.style.border="1px solid "+T.b1;e.currentTarget.style.transform="none";}});
  return(
    <div style={{overflow:"auto",height:"100%",padding:"28px 28px 60px",animation:"fadeUp .3s ease"}}>
      <div style={{marginBottom:32}}><div style={{fontFamily:T.fD,fontSize:32,fontWeight:600,color:T.t1,letterSpacing:-.5,lineHeight:1.1,fontStyle:"italic",marginBottom:6}}>{greet}{name?", "+name:""} ✦</div><div style={{color:T.t3,fontSize:13,fontFamily:T.fU}}>{fmtFull(NOW)}</div></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10,marginBottom:22}}>
        {[{l:"Pendientes",v:stats.pending,c:T.v,i:"◉",a:()=>nav("tasks")},{l:"Vencidas",v:stats.over,c:stats.over>0?T.r:T.t3,i:"⚠",a:()=>nav("tasks")},{l:"Hoy",v:stats.today,c:T.a,i:"◫",a:()=>nav("tasks")},{l:"Hábitos",v:habitsDone+"/"+data.habits.length,c:habitsDone===data.habits.length&&data.habits.length>0?T.g:T.b,i:"◐",a:()=>nav("habits")},{l:"Notas",v:stats.notes,c:T.b,i:"◈",a:()=>nav("notes")}].map(s=>(<div key={s.l} onClick={s.a} style={{...card,position:"relative",overflow:"hidden"}} {...hov(s.c)}><div style={{position:"absolute",top:-8,right:-8,fontSize:40,opacity:.04}}>{s.i}</div><div style={{color:s.c,fontSize:10,fontWeight:700,textTransform:"uppercase",fontFamily:T.fM,letterSpacing:.6,marginBottom:10}}>{s.i} {s.l}</div><div style={{fontFamily:T.fD,fontSize:36,fontWeight:600,color:s.c,lineHeight:1,fontStyle:"italic"}}>{s.v}</div></div>))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:22}}>
        <div onClick={()=>nav("tasks")} style={card} onMouseEnter={e=>{e.currentTarget.style.border="1px solid "+T.vg;e.currentTarget.style.transform="translateY(-1px)";}} onMouseLeave={e=>{e.currentTarget.style.border="1px solid "+T.b1;e.currentTarget.style.transform="none;";}}>
          <div style={{color:T.t3,fontSize:10,textTransform:"uppercase",fontFamily:T.fM,letterSpacing:1.2,marginBottom:12}}>◉ Progreso</div>
          <div style={{display:"flex",alignItems:"center",gap:12}}><Ring value={stats.pct} size={52} stroke={4.5} color={T.v}><span style={{fontFamily:T.fM,fontSize:10,fontWeight:700,color:T.v}}>{stats.pct}%</span></Ring><div><div style={{fontFamily:T.fD,fontSize:28,fontWeight:600,color:T.t1,lineHeight:1,fontStyle:"italic"}}>{stats.done}</div><div style={{color:T.t3,fontSize:11,marginTop:2,fontFamily:T.fU}}>de {stats.total}</div></div></div>
        </div>
        <div onClick={()=>nav("journal")} style={{...card,background:"linear-gradient(135deg,"+T.bg2+","+T.bl+")",border:"1px solid "+T.bg_}} onMouseEnter={e=>{e.currentTarget.style.border="1px solid "+T.b+"80";e.currentTarget.style.transform="translateY(-1px)";}} onMouseLeave={e=>{e.currentTarget.style.border="1px solid "+T.bg_;e.currentTarget.style.transform="none";}}>
          <div style={{color:T.b,fontSize:10,textTransform:"uppercase",fontFamily:T.fM,letterSpacing:1.2,marginBottom:10}}>◪ Diario</div>
          <div style={{fontFamily:T.fD,fontSize:32,fontWeight:600,color:T.t1,lineHeight:1,fontStyle:"italic",marginBottom:4}}>{streak}<span style={{fontSize:18}}> 🔥</span></div>
          <div style={{color:T.t2,fontSize:12,fontFamily:T.fU}}>{data.journal.find(j=>j.date===NOW)?"Escrito hoy ✓":"Sin entrada hoy"}</div>
        </div>
        <div onClick={()=>nav("habits")} style={{...card,background:"linear-gradient(135deg,"+T.bg2+",rgba(52,211,153,0.06))",border:"1px solid rgba(52,211,153,0.18)"}} onMouseEnter={e=>{e.currentTarget.style.border="1px solid "+T.g+"80";e.currentTarget.style.transform="translateY(-1px)";}} onMouseLeave={e=>{e.currentTarget.style.border="1px solid rgba(52,211,153,0.18)";e.currentTarget.style.transform="none";}}>
          <div style={{color:T.g,fontSize:10,textTransform:"uppercase",fontFamily:T.fM,letterSpacing:1.2,marginBottom:10}}>◐ Hábitos hoy</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{data.habits.map(h=>{const done=h.completions.includes(NOW);return <div key={h.id} title={h.name} style={{width:30,height:30,borderRadius:8,background:done?h.color+"22":"transparent",border:"1px solid "+(done?h.color+"60":T.b1),display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,transition:"all .2s"}}>{done?h.icon:<span style={{opacity:.3}}>{h.icon}</span>}</div>;})}</div>
        </div>
      </div>
      {dueItems.length>0&&<div style={{marginBottom:22}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><div style={{color:T.t2,fontSize:13,fontWeight:600,fontFamily:T.fU}}>{stats.over>0?"⚠ Atención requerida":"📅 Vencen hoy"}</div><button onClick={()=>nav("tasks")} style={{background:"none",border:"none",color:T.v,cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:T.fU}}>Ver todas →</button></div>{dueItems.slice(0,4).map(t=>(<div key={t.id} style={{background:T.bg2,border:"1px solid "+(t.due<NOW?T.rg:T.ag),borderRadius:10,padding:"10px 14px",marginBottom:6,display:"flex",alignItems:"center",gap:10}}><div style={{width:15,height:15,borderRadius:4,border:"2px solid "+T.b3,flexShrink:0}}/><span style={{color:T.t1,fontSize:13,flex:1,fontFamily:T.fU}}>{t.title}</span><span style={{color:t.due<NOW?T.r:T.a,fontSize:11,fontFamily:T.fM}}>{fmtD(t.due)}</span><PriChip p={t.priority} small/></div>))}</div>}
      {pinned.length>0&&<div style={{marginBottom:22}}><div style={{color:T.t3,fontSize:10,textTransform:"uppercase",fontFamily:T.fM,letterSpacing:1.8,marginBottom:10}}>📌 Fijadas</div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:8}}>{pinned.map(n=>(<div key={n.id} onClick={()=>nav("note/"+n.id)} style={{background:T.bg2,border:"1px solid "+T.vg,borderRadius:13,padding:"15px 17px",cursor:"pointer",transition:"all .15s"}} onMouseEnter={e=>{e.currentTarget.style.border="1px solid "+T.v+"70";e.currentTarget.style.transform="translateY(-2px)";}} onMouseLeave={e=>{e.currentTarget.style.border="1px solid "+T.vg;e.currentTarget.style.transform="none";}}><div style={{fontFamily:T.fD,fontSize:14,fontWeight:600,color:T.t1,marginBottom:6,fontStyle:"italic"}}>{n.title}</div><div style={{color:T.t3,fontSize:12,lineHeight:1.6,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden",fontFamily:T.fU}}>{n.body.replace(/[#*`>\-\[\]]/g,"").trim().slice(0,100)}</div></div>))}</div></div>}
      <div style={{color:T.t3,fontSize:10,textTransform:"uppercase",fontFamily:T.fM,letterSpacing:1.8,marginBottom:10}}>◈ Recientes</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:8}}>
        {recent.map(n=>(<div key={n.id} onClick={()=>nav("note/"+n.id)} style={{background:T.bg2,border:"1px solid "+T.b1,borderRadius:13,padding:"15px 17px",cursor:"pointer",transition:"all .15s"}} onMouseEnter={e=>{e.currentTarget.style.border="1px solid "+T.b2;e.currentTarget.style.transform="translateY(-1px)";}} onMouseLeave={e=>{e.currentTarget.style.border="1px solid "+T.b1;e.currentTarget.style.transform="none";}}><div style={{fontFamily:T.fD,fontSize:14,fontWeight:600,color:T.t1,marginBottom:5,fontStyle:"italic"}}>{n.title}</div><div style={{color:T.t3,fontSize:12,lineHeight:1.6,marginBottom:10,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden",fontFamily:T.fU}}>{n.body.replace(/[#*`>\-\[\]]/g,"").trim().slice(0,100)}</div><div style={{display:"flex",gap:4,flexWrap:"wrap",alignItems:"center"}}>{n.tags.slice(0,2).map(t=><TagChip key={t} name={t} pal={data.tagPal} small/>)}<span style={{color:T.t4,fontSize:10,marginLeft:"auto",fontFamily:T.fM}}>{fmtAgo(n.updated)}</span></div></div>))}
        <div onClick={()=>nav("note/new")} style={{background:"transparent",border:"1px dashed "+T.b2,borderRadius:13,padding:"15px 17px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:T.t4,fontSize:13,fontFamily:T.fU,transition:"all .15s",minHeight:90}} onMouseEnter={e=>{e.currentTarget.style.border="1px dashed "+T.v;e.currentTarget.style.color=T.v;}} onMouseLeave={e=>{e.currentTarget.style.border="1px dashed "+T.b2;e.currentTarget.style.color=T.t4;}}>+ Nueva nota</div>
      </div>
    </div>
  );
}

function ZenMode({title,body,onTitle,onBody,onClose}){
  const ref=useRef(null);
  useEffect(()=>{ref.current?.focus();},[]);
  useEffect(()=>{const h=(e)=>{if(e.key==="Escape")onClose();};window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);},[]);
  return(<div style={{position:"fixed",inset:0,background:"#07060A",zIndex:8500,display:"flex",flexDirection:"column",alignItems:"center",padding:"8vh 0 60px",animation:"zenIn .3s ease"}}><div style={{position:"absolute",top:20,right:20}}><button onClick={onClose} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.3)",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:11,fontFamily:T.fM,transition:"all .2s"}} onMouseEnter={e=>e.currentTarget.style.color="rgba(255,255,255,0.7)"} onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.3)"}>ESC · Salir del modo zen</button></div><div style={{width:"100%",maxWidth:660,padding:"0 32px",display:"flex",flexDirection:"column",flex:1}}><input value={title} onChange={e=>onTitle(e.target.value)} placeholder="Título..." style={{width:"100%",background:"none",border:"none",color:"rgba(255,255,255,0.85)",fontSize:38,fontFamily:T.fD,fontWeight:600,outline:"none",letterSpacing:-.6,lineHeight:1.2,marginBottom:28,fontStyle:"italic"}}/><textarea ref={ref} value={body} onChange={e=>onBody(e.target.value)} placeholder={"Escribe sin distracciones...\n\nTodo desaparece. Solo tú y tus palabras."} style={{flex:1,width:"100%",background:"none",border:"none",color:"rgba(255,255,255,0.7)",fontSize:17,fontFamily:T.fU,lineHeight:2,resize:"none",outline:"none",boxSizing:"border-box"}}/></div><div style={{position:"absolute",bottom:24,left:"50%",transform:"translateX(-50%)",color:"rgba(255,255,255,0.15)",fontSize:11,fontFamily:T.fM,textAlign:"center"}}>{wc(body)} palabras</div></div>);
}

function NoteEditor({noteId,data,save,nav,toast}){
  const existing=noteId!=="new"?data.notes.find(n=>n.id===noteId):null;
  const[title,setTitle]=useState(existing?.title||"");
  const[body,setBody]=useState(existing?.body||"");
  const[folder,setFolder]=useState(existing?.folder||"inicio");
  const[tags,setTags]=useState(existing?.tags||[]);
  const[pinned,setPinned]=useState(existing?.pinned||false);
  const[tagIn,setTagIn]=useState("");
  const[preview,setPreview]=useState(false);
  const[zen,setZen]=useState(false);
  const[savedAt,setSavedAt]=useState(existing?new Date().toISOString():null);
  const[showTpl,setShowTpl]=useState(!existing);
  const taRef=useRef(null);
  const doSave=useCallback(()=>{if(!title.trim())return;const iso=new Date().toISOString();const n={id:existing?.id||uid(),title:title.trim(),body,folder,tags,pinned,created:existing?.created||NOW,updated:iso,deleted:false};if(existing){save({...data,notes:data.notes.map(x=>x.id===n.id?n:x)});}else{save({...data,notes:[n,...data.notes]});nav("note/"+n.id);}setSavedAt(iso);},[title,body,folder,tags,pinned,existing,data]);
  useEffect(()=>{const t=setTimeout(doSave,1000);return()=>clearTimeout(t);},[title,body,folder,tags,pinned]);
  const fmt=(before,after="")=>{const el=taRef.current;if(!el)return;const s=el.selectionStart,e=el.selectionEnd,sel=body.slice(s,e);const nb=body.slice(0,s)+before+sel+after+body.slice(e);setBody(nb);setTimeout(()=>{el.focus();el.setSelectionRange(s+before.length,e+before.length);},0);};
  const addTag=(t)=>{const tg=t.trim().toLowerCase().replace(/\s+/g,"-");if(!tg||tags.includes(tg))return;setTags([...tags,tg]);if(!data.tags.includes(tg))save({...data,tags:[...data.tags,tg]});setTagIn("");};
  const exportNote=()=>{const blob=new Blob(["# "+title+"\n\n"+body],{type:"text/markdown"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=title.replace(/[^a-zA-Z0-9]/g,"-")+".md";a.click();toast("Nota exportada como .md");};
  const applyTemplate=(tpl)=>{if(tpl.id==="blank")return;setBody(tpl.body.replace(/DATE/g,NOW));setTimeout(()=>taRef.current?.focus(),100);};
  const TB=[{icon:"H1",fn:()=>fmt("# ")},{icon:"H2",fn:()=>fmt("## ")},{icon:"H3",fn:()=>fmt("### ")},null,{icon:"B",fn:()=>fmt("**","**"),s:{fontWeight:900}},{icon:"I",fn:()=>fmt("*","*"),s:{fontStyle:"italic"}},{icon:"Code",fn:()=>fmt("`","`"),s:{fontFamily:T.fM,fontSize:10}},null,{icon:"[ ]",fn:()=>fmt("- [ ] ")},{icon:"❝",fn:()=>fmt("> ")},{icon:"•",fn:()=>fmt("- ")},{icon:"—",fn:()=>fmt("\n---\n")}];
  const btnBase={background:"none",border:"none",color:T.t3,borderRadius:6,padding:"5px 8px",cursor:"pointer",fontSize:11,fontFamily:T.fM,fontWeight:700,transition:"all .1s"};
  const sBtn={background:"none",border:"1px solid "+T.b1,color:T.t3,borderRadius:7,padding:"4px 9px",cursor:"pointer",fontSize:11,fontFamily:T.fU,transition:"all .15s"};
  return(
    <>
      {zen&&<ZenMode title={title} body={body} onTitle={setTitle} onBody={setBody} onClose={()=>setZen(false)}/>}
      {showTpl&&noteId==="new"&&<TemplatePicker mode="note" onClose={()=>setShowTpl(false)} onPick={(tpl)=>{applyTemplate(tpl);setShowTpl(false);}}/>}
      <div style={{display:"flex",flexDirection:"column",height:"100%",background:T.bg0,animation:"fadeUp .25s ease"}}>
        <div style={{background:T.bg1,borderBottom:"1px solid "+T.b1,padding:"7px 16px",display:"flex",alignItems:"center",gap:2,flexWrap:"wrap",flexShrink:0}}>
          {TB.map((t,i)=>t===null?<div key={i} style={{width:1,height:16,background:T.b2,margin:"0 4px"}}/>:<button key={i} onClick={t.fn} style={{...btnBase,...(t.s||{})}} onMouseEnter={e=>{e.currentTarget.style.background=T.bg3;e.currentTarget.style.color=T.t1;}} onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.color=T.t3;}}>{t.icon}</button>)}
          <div style={{flex:1}}/>
          <span style={{color:T.t4,fontSize:10,fontFamily:T.fM,marginRight:6}}>{wc(body)}p{savedAt&&<span style={{color:T.g}}> · guardado {fmtAgo(savedAt)}</span>}</span>
          <button onClick={()=>setShowTpl(true)} style={{...sBtn,marginRight:2}} onMouseEnter={e=>{e.currentTarget.style.color=T.v;e.currentTarget.style.border="1px solid "+T.v;}} onMouseLeave={e=>{e.currentTarget.style.color=T.t3;e.currentTarget.style.border="1px solid "+T.b1;}}>⊞ Plantilla</button>
          <button onClick={()=>setPinned(!pinned)} style={{background:"none",border:"none",color:pinned?T.a:T.t4,cursor:"pointer",fontSize:14,padding:"0 5px"}}>📌</button>
          <button onClick={()=>setZen(true)} style={{...sBtn,marginRight:4}} onMouseEnter={e=>{e.currentTarget.style.color=T.p;e.currentTarget.style.border="1px solid "+T.p;}} onMouseLeave={e=>{e.currentTarget.style.color=T.t3;e.currentTarget.style.border="1px solid "+T.b1;}}>◎ Zen</button>
          <button onClick={()=>setPreview(!preview)} style={{background:preview?T.vl:"none",border:"1px solid "+(preview?T.v:T.b1),color:preview?T.v:T.t3,borderRadius:7,padding:"4px 12px",cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:T.fU}}>{preview?"✏ Editar":"◉ Preview"}</button>
          <button onClick={exportNote} style={{...sBtn,marginLeft:2}} onMouseEnter={e=>e.currentTarget.style.color=T.t1} onMouseLeave={e=>e.currentTarget.style.color=T.t3}>↓ .md</button>
        </div>
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          <div style={{padding:"22px 36px 0",borderBottom:"1px solid "+T.b1,flexShrink:0}}>
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Sin título..." style={{width:"100%",background:"none",border:"none",color:T.t1,fontSize:34,fontFamily:T.fD,fontWeight:600,outline:"none",letterSpacing:-.6,lineHeight:1.2,marginBottom:14,fontStyle:"italic"}}/>
            <div style={{display:"flex",gap:10,alignItems:"center",paddingBottom:12,flexWrap:"wrap"}}>
              <select value={folder} onChange={e=>setFolder(e.target.value)} style={{background:T.bg3,border:"1px solid "+T.b2,color:T.t2,borderRadius:8,padding:"5px 10px",fontSize:12,fontFamily:T.fU,outline:"none"}}>{data.folders.map(f=><option key={f.id} value={f.id}>{f.icon} {f.name}</option>)}</select>
              <div style={{display:"flex",gap:4,flexWrap:"wrap",alignItems:"center"}}>{tags.map(t=><TagChip key={t} name={t} pal={data.tagPal} small onRemove={()=>setTags(tags.filter(x=>x!==t))}/>)}<input value={tagIn} onChange={e=>setTagIn(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"||e.key===","){e.preventDefault();addTag(tagIn);}}} placeholder="+ etiqueta" style={{background:"none",border:"none",color:T.t3,fontSize:11,outline:"none",width:72,fontFamily:T.fM}}/></div>
              <span style={{color:T.t4,fontSize:10,marginLeft:"auto",fontFamily:T.fM}}>{existing?.created||NOW}</span>
            </div>
          </div>
          <div style={{flex:1,overflow:"auto",padding:"20px 36px 40px"}}>
            {preview?<div className="md-body" style={{color:T.t2,fontSize:15,lineHeight:1.9,maxWidth:700}} dangerouslySetInnerHTML={{__html:renderMD(body)}}/>:<textarea ref={taRef} value={body} onChange={e=>setBody(e.target.value)} placeholder={"Empieza a escribir...\n\nSoporta Markdown completo."} style={{width:"100%",minHeight:"100%",background:"none",border:"none",color:T.t1,fontSize:15,fontFamily:T.fU,lineHeight:1.85,resize:"none",outline:"none",boxSizing:"border-box"}}/>}
          </div>
        </div>
      </div>
    </>
  );
}

function NotesList({data,save,nav,folderId,tagFilter,trash=false,toast,confirm}){
  const[sort,setSort]=useState("updated");const[grid,setGrid]=useState(true);const[search,setSearch]=useState("");const[showImport,setShowImport]=useState(false);
  const notes=useMemo(()=>{let n=trash?data.notes.filter(x=>x.deleted):data.notes.filter(x=>!x.deleted);if(folderId)n=n.filter(x=>x.folder===folderId);if(tagFilter)n=n.filter(x=>x.tags?.includes(tagFilter));if(search){const q=search.toLowerCase();n=n.filter(x=>x.title.toLowerCase().includes(q)||x.body.toLowerCase().includes(q));}return[...n].sort((a,b)=>{if(!trash){if(a.pinned&&!b.pinned)return-1;if(!a.pinned&&b.pinned)return 1;}if(sort==="title")return a.title.localeCompare(b.title);return b.updated.localeCompare(a.updated);});},[data.notes,folderId,tagFilter,search,sort,trash]);
  const folder=folderId?data.folders.find(f=>f.id===folderId):null;
  const delNote=async(n)=>{if(trash){const ok=await confirm({title:"Eliminar definitivamente",body:"No se puede deshacer.",danger:true,ok:"Eliminar para siempre",icon:"⚠️"});if(!ok)return;save({...data,notes:data.notes.filter(x=>x.id!==n.id)});toast("Nota eliminada","info");}else{save({...data,notes:data.notes.map(x=>x.id===n.id?{...x,deleted:true}:x)});toast("Movida a papelera","info");}};
  const restoreNote=(id)=>{save({...data,notes:data.notes.map(x=>x.id===id?{...x,deleted:false}:x)});toast("Nota restaurada ✓");};
  const emptyTrash=async()=>{const ok=await confirm({title:"Vaciar papelera",body:data.notes.filter(n=>n.deleted).length+" notas se eliminarán.",danger:true,ok:"Vaciar",icon:"🗑"});if(!ok)return;save({...data,notes:data.notes.filter(n=>!n.deleted)});toast("Papelera vaciada","info");};
  const head=trash?"🗑 Papelera":folder?folder.icon+" "+folder.name:tagFilter?"#"+tagFilter:"◈ Notas";
  return(
    <div style={{display:"flex",flexDirection:"column",height:"100%",animation:"fadeUp .25s ease"}}>
      {showImport&&<ImportURLModal data={data} save={save} nav={nav} onClose={()=>setShowImport(false)} toast={toast}/>}
      <div style={{padding:"16px 20px 12px",borderBottom:"1px solid "+T.b1,flexShrink:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><div><h2 style={{fontFamily:T.fD,fontSize:22,fontWeight:600,color:T.t1,margin:0,fontStyle:"italic"}}>{head}</h2><div style={{color:T.t4,fontSize:11,marginTop:2,fontFamily:T.fM}}>{notes.length} nota{notes.length!==1?"s":""}</div></div><div style={{display:"flex",gap:6,alignItems:"center"}}>{trash&&data.notes.filter(n=>n.deleted).length>0&&<button onClick={emptyTrash} style={{background:T.rl,border:"1px solid "+T.rg,color:T.r,borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:12,fontFamily:T.fU,fontWeight:600}}>Vaciar papelera</button>}<select value={sort} onChange={e=>setSort(e.target.value)} style={{background:T.bg3,border:"1px solid "+T.b2,color:T.t2,borderRadius:8,padding:"5px 10px",fontSize:12,fontFamily:T.fU,outline:"none"}}><option value="updated">Recientes</option><option value="title">A–Z</option></select><button onClick={()=>setGrid(v=>!v)} style={{background:T.bg3,border:"1px solid "+T.b1,color:T.t2,borderRadius:8,padding:"5px 10px",cursor:"pointer",fontSize:14}}>{grid?"☰":"▦"}</button>{!trash&&<button onClick={()=>setShowImport(true)} style={{background:T.bg3,border:"1px solid "+T.b2,color:T.b,borderRadius:9,padding:"7px 12px",cursor:"pointer",fontSize:12,fontFamily:T.fU,fontWeight:600}} onMouseEnter={e=>{e.currentTarget.style.border="1px solid "+T.b;e.currentTarget.style.color=T.b;}} onMouseLeave={e=>{e.currentTarget.style.border="1px solid "+T.b2;e.currentTarget.style.color=T.b;}}>🌐 URL</button>}{!trash&&<button onClick={()=>nav("note/new")} style={{background:T.v,border:"none",color:"#fff",borderRadius:9,padding:"7px 14px",cursor:"pointer",fontSize:12,fontFamily:T.fU,fontWeight:700}}>+ Nueva nota</button>}</div></div>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar..." style={{width:"100%",background:T.bg3,border:"1px solid "+T.b2,borderRadius:9,padding:"8px 13px",fontSize:13,color:T.t1,fontFamily:T.fU,outline:"none",boxSizing:"border-box"}}/>
      </div>
      <div style={{flex:1,overflow:"auto",padding:14}}>
        {notes.length===0?<EmptyState icon={trash?"🗑":"◈"} title={trash?"Papelera vacía":search?"Sin resultados":"Sin notas"} body={trash?"Las notas eliminadas aparecerán aquí.":search?"Prueba otro término.":"Crea tu primera nota."} action={!trash&&!search?()=>nav("note/new"):null} actionLabel="Nueva nota"/>
        :grid?(<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:10}}>{notes.map(n=>(<div key={n.id} onClick={()=>!trash&&nav("note/"+n.id)} style={{background:T.bg2,border:"1px solid "+(n.pinned?T.vg:T.b1),borderRadius:13,padding:16,cursor:trash?"default":"pointer",transition:"all .15s",position:"relative"}} onMouseEnter={e=>{if(!trash){e.currentTarget.style.border="1px solid "+T.b3;e.currentTarget.style.transform="translateY(-2px)";}}} onMouseLeave={e=>{e.currentTarget.style.border="1px solid "+(n.pinned?T.vg:T.b1);e.currentTarget.style.transform="none";}}>{n.pinned&&!trash&&<span style={{position:"absolute",top:10,right:10,fontSize:10,opacity:.5}}>📌</span>}<div style={{fontFamily:T.fD,fontSize:14,fontWeight:600,color:T.t1,marginBottom:6,paddingRight:20,lineHeight:1.3,fontStyle:"italic"}}>{n.title}</div><div style={{color:T.t3,fontSize:12,lineHeight:1.65,marginBottom:10,display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden",fontFamily:T.fU}}>{n.body.replace(/[#*`>\-\[\]]/g,"").trim().slice(0,140)}</div><div style={{display:"flex",gap:4,flexWrap:"wrap",alignItems:"center"}}>{n.tags.slice(0,2).map(t=><TagChip key={t} name={t} pal={data.tagPal} small/>)}<div style={{display:"flex",gap:5,marginLeft:"auto",alignItems:"center"}}>{trash?(<><button onClick={()=>restoreNote(n.id)} style={{background:T.gl,border:"none",color:T.g,borderRadius:5,padding:"2px 8px",cursor:"pointer",fontSize:10,fontWeight:600}}>↩ Restaurar</button><button onClick={()=>delNote(n)} style={{background:"none",border:"none",color:T.t4,cursor:"pointer",fontSize:12,opacity:.6}} onMouseEnter={e=>{e.currentTarget.style.color=T.r;e.currentTarget.style.opacity="1";}} onMouseLeave={e=>{e.currentTarget.style.color=T.t4;e.currentTarget.style.opacity=".6";}}>✕</button></>):(<><span style={{color:T.t4,fontSize:10,fontFamily:T.fM}}>{fmtAgo(n.updated)}</span><button onClick={e=>{e.stopPropagation();delNote(n);}} style={{background:"none",border:"none",color:T.t4,cursor:"pointer",fontSize:13,opacity:.3,transition:"all .15s"}} onMouseEnter={e=>{e.currentTarget.style.color=T.r;e.currentTarget.style.opacity="1";}} onMouseLeave={e=>{e.currentTarget.style.color=T.t4;e.currentTarget.style.opacity=".3";}}>🗑</button></>)}</div></div></div>))}</div>)
        :(<div>{notes.map(n=>(<div key={n.id} onClick={()=>!trash&&nav("note/"+n.id)} style={{background:T.bg2,border:"1px solid "+T.b1,borderRadius:10,padding:"12px 16px",marginBottom:6,cursor:trash?"default":"pointer",transition:"all .15s",display:"flex",alignItems:"center",gap:12}} onMouseEnter={e=>{if(!trash)e.currentTarget.style.border="1px solid "+T.b2;}} onMouseLeave={e=>e.currentTarget.style.border="1px solid "+T.b1}>{n.pinned&&!trash&&<span style={{fontSize:11,opacity:.5}}>📌</span>}<div style={{flex:1,minWidth:0}}><div style={{fontFamily:T.fD,fontSize:14,fontWeight:600,color:T.t1,fontStyle:"italic"}}>{n.title}</div><div style={{display:"flex",gap:4,marginTop:4,flexWrap:"wrap"}}>{n.tags.slice(0,3).map(t=><TagChip key={t} name={t} pal={data.tagPal} small/>)}</div></div><span style={{color:T.t4,fontSize:11,fontFamily:T.fM,flexShrink:0}}>{fmtAgo(n.updated)}</span>{trash?<button onClick={()=>restoreNote(n.id)} style={{background:T.gl,border:"none",color:T.g,borderRadius:6,padding:"3px 9px",cursor:"pointer",fontSize:11,fontWeight:600}}>↩</button>:<button onClick={e=>{e.stopPropagation();delNote(n);}} style={{background:"none",border:"none",color:T.t4,cursor:"pointer",fontSize:14,opacity:.3,transition:"all .15s"}} onMouseEnter={e=>{e.currentTarget.style.color=T.r;e.currentTarget.style.opacity="1";}} onMouseLeave={e=>{e.currentTarget.style.color=T.t4;e.currentTarget.style.opacity=".3";}}>🗑</button>}</div>))}</div>)}
      </div>
    </div>
  );
}

function Tasks({data,save,toast,confirm}){
  const[filter,setFilter]=useState("pending");const[search,setSearch]=useState("");const[modal,setModal]=useState(false);const[showTpl,setShowTpl]=useState(false);const[form,setForm]=useState({title:"",priority:"media",due:"",folder:"inicio",notes:""});const[expanded,setExp]=useState(null);const[subIn,setSubIn]=useState({});
  const PC={alta:T.r,media:T.a,baja:T.g};
  const counts=useMemo(()=>({all:data.tasks.length,pending:data.tasks.filter(t=>!t.done).length,today:data.tasks.filter(t=>!t.done&&t.due===NOW).length,overdue:data.tasks.filter(t=>!t.done&&t.due&&t.due<NOW).length,done:data.tasks.filter(t=>t.done).length}),[data.tasks]);
  const filtered=useMemo(()=>{let t=[...data.tasks];if(filter==="today")t=t.filter(x=>x.due===NOW&&!x.done);if(filter==="overdue")t=t.filter(x=>x.due&&x.due<NOW&&!x.done);if(filter==="pending")t=t.filter(x=>!x.done);if(filter==="done")t=t.filter(x=>x.done);if(search){const q=search.toLowerCase();t=t.filter(x=>x.title.toLowerCase().includes(q));}return t.sort((a,b)=>{if(a.done!==b.done)return a.done?1:-1;const o={alta:0,media:1,baja:2};return(o[a.priority]||1)-(o[b.priority]||1);});},[data.tasks,filter,search]);
  const toggle=(id)=>save({...data,tasks:data.tasks.map(t=>t.id===id?{...t,done:!t.done,doneAt:!t.done?new Date().toISOString():null}:t)});
  const del=async(id,title)=>{const ok=await confirm({title:"Eliminar tarea",body:'"'+title+'"',danger:true,ok:"Eliminar",icon:"🗑"});if(!ok)return;save({...data,tasks:data.tasks.filter(t=>t.id!==id)});toast("Tarea eliminada","info");};
  const addSub=(tid,text)=>{if(!text.trim())return;save({...data,tasks:data.tasks.map(t=>t.id===tid?{...t,sub:[...(t.sub||[]),{id:uid(),t:text.trim(),d:false}]}:t)});setSubIn(p=>({...p,[tid]:""}));};
  const togSub=(tid,sid)=>save({...data,tasks:data.tasks.map(t=>t.id===tid?{...t,sub:t.sub.map(s=>s.id===sid?{...s,d:!s.d}:s)}:t)});
  const delSub=(tid,sid)=>save({...data,tasks:data.tasks.map(t=>t.id===tid?{...t,sub:t.sub.filter(s=>s.id!==sid)}:t)});
  const addTask=()=>{if(!form.title.trim())return;save({...data,tasks:[{id:uid(),...form,done:false,sub:[],tags:[],created:NOW,doneAt:null},...data.tasks]});setModal(false);setForm({title:"",priority:"media",due:"",folder:"inicio",notes:""});toast("Tarea creada ✓");};
  const FILTERS=[["pending","Pendientes",counts.pending,false],["today","Hoy",counts.today,false],["overdue","Vencidas",counts.overdue,true],["done","Completadas",counts.done,false],["all","Todas",counts.all,false]];
  return(
    <div style={{display:"flex",flexDirection:"column",height:"100%",animation:"fadeUp .25s ease"}}>
      {showTpl&&<TemplatePicker mode="task" onClose={()=>setShowTpl(false)} onPick={(tpl)=>{setForm({...form,title:tpl.title,priority:tpl.priority,due:tpl.due||"",notes:tpl.notes||""});setShowTpl(false);setModal(true);}}/>}
      <div style={{padding:"16px 20px 12px",borderBottom:"1px solid "+T.b1,flexShrink:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><h2 style={{fontFamily:T.fD,fontSize:22,fontWeight:600,color:T.t1,margin:0,fontStyle:"italic"}}>◉ Tareas</h2><div style={{display:"flex",gap:6}}><button onClick={()=>setShowTpl(true)} style={{background:T.bg3,border:"1px solid "+T.b2,color:T.t2,borderRadius:9,padding:"7px 12px",cursor:"pointer",fontSize:12,fontFamily:T.fU,fontWeight:600}} onMouseEnter={e=>{e.currentTarget.style.color=T.v;e.currentTarget.style.border="1px solid "+T.v;}} onMouseLeave={e=>{e.currentTarget.style.color=T.t2;e.currentTarget.style.border="1px solid "+T.b2;}}>⊞ Plantilla</button><button onClick={()=>setModal(true)} style={{background:T.v,border:"none",color:"#fff",borderRadius:9,padding:"8px 16px",cursor:"pointer",fontSize:13,fontFamily:T.fU,fontWeight:700}}>+ Nueva tarea</button></div></div>
        <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:12}}>{FILTERS.map(([id,lb,ct,urgent])=>(<button key={id} onClick={()=>setFilter(id)} style={{background:filter===id?T.vl:"transparent",border:"1px solid "+(filter===id?T.v:T.b1),color:filter===id?T.v:T.t3,borderRadius:99,padding:"4px 12px",cursor:"pointer",fontSize:12,fontWeight:filter===id?600:400,fontFamily:T.fU,display:"flex",alignItems:"center",gap:5,transition:"all .15s"}}>{lb}{ct>0&&<span style={{background:urgent?T.rl:T.b1,color:urgent?T.r:T.t4,borderRadius:99,padding:"0 5px",fontSize:10,fontFamily:T.fM}}>{ct}</span>}</button>))}</div>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar tarea..." style={{width:"100%",background:T.bg3,border:"1px solid "+T.b2,borderRadius:9,padding:"8px 13px",fontSize:13,color:T.t1,fontFamily:T.fU,outline:"none",boxSizing:"border-box"}}/>
      </div>
      <div style={{flex:1,overflow:"auto",padding:"12px 14px"}}>
        {filtered.length===0?<EmptyState icon="◉" title={filter==="done"?"Sin completadas aún":"Todo en orden"} action={filter==="pending"?()=>setModal(true):null} actionLabel="Nueva tarea"/>
        :filtered.map(t=>{const subDone=(t.sub||[]).filter(s=>s.d).length,subTotal=(t.sub||[]).length,isExp=expanded===t.id,over=t.due&&t.due<NOW&&!t.done,isToday=t.due===NOW&&!t.done;return(
          <div key={t.id} style={{background:T.bg2,border:"1px solid "+(over?T.rg:isToday?T.ag:T.b1),borderRadius:12,marginBottom:7,overflow:"hidden"}}>
            <div style={{padding:"11px 14px",display:"flex",alignItems:"flex-start",gap:10}}>
              <button onClick={()=>toggle(t.id)} style={{width:19,height:19,borderRadius:5,border:"2px solid "+(t.done?T.g:PC[t.priority]||T.b3),background:t.done?T.g:"transparent",cursor:"pointer",flexShrink:0,marginTop:1,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}}>{t.done&&<span style={{color:"#000",fontSize:9,fontWeight:900}}>✓</span>}</button>
              <div style={{flex:1,minWidth:0}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}><span style={{color:t.done?T.t3:T.t1,fontSize:14,fontWeight:500,textDecoration:t.done?"line-through":"none",lineHeight:1.4,fontFamily:T.fU}}>{t.title}</span><div style={{display:"flex",gap:4,flexShrink:0,alignItems:"center"}}>{over&&<span style={{background:T.rl,color:T.r,borderRadius:4,padding:"1px 6px",fontSize:10,fontWeight:700,fontFamily:T.fM}}>Vencida</span>}{isToday&&<span style={{background:T.al,color:T.a,borderRadius:4,padding:"1px 6px",fontSize:10,fontWeight:700,fontFamily:T.fM}}>Hoy</span>}<PriChip p={t.priority} small/></div></div><div style={{display:"flex",gap:6,marginTop:5,flexWrap:"wrap",alignItems:"center"}}>{t.tags?.map(tg=><TagChip key={tg} name={tg} pal={data.tagPal} small/>)}{t.due&&<span style={{color:over?T.r:T.t3,fontSize:11,fontFamily:T.fM}}>📅 {fmtD(t.due)}</span>}{subTotal>0&&<div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:40,height:3,background:T.b1,borderRadius:99,overflow:"hidden"}}><div style={{width:(subDone/subTotal*100)+"%",height:"100%",background:T.g,borderRadius:99,transition:"width .3s"}}/></div><span style={{color:T.t4,fontSize:10,fontFamily:T.fM}}>{subDone}/{subTotal}</span></div>}{t.done&&t.doneAt&&<span style={{color:T.g,fontSize:10,fontFamily:T.fM}}>✓ {fmtAgo(t.doneAt)}</span>}</div></div>
              <div style={{display:"flex",gap:4}}><button onClick={()=>setExp(isExp?null:t.id)} style={{background:T.bg3,border:"none",color:T.t3,borderRadius:6,padding:"3px 8px",cursor:"pointer",fontSize:11,fontFamily:T.fM}}>{isExp?"▲":"▼"}</button><button onClick={()=>del(t.id,t.title)} style={{background:"none",border:"none",color:T.t4,cursor:"pointer",fontSize:13,opacity:.35,transition:"all .15s"}} onMouseEnter={e=>{e.currentTarget.style.color=T.r;e.currentTarget.style.opacity="1";}} onMouseLeave={e=>{e.currentTarget.style.color=T.t4;e.currentTarget.style.opacity=".35";}}>✕</button></div>
            </div>
            {isExp&&(<div style={{borderTop:"1px solid "+T.b1,padding:"14px 14px",background:T.bg1}}><div style={{marginBottom:14}}><div style={{color:T.t4,fontSize:10,textTransform:"uppercase",fontFamily:T.fM,fontWeight:700,marginBottom:6,letterSpacing:.8}}>Notas</div><textarea defaultValue={t.notes} onBlur={e=>save({...data,tasks:data.tasks.map(x=>x.id===t.id?{...x,notes:e.target.value}:x)})} placeholder="Añade contexto..." style={{width:"100%",background:T.bg3,border:"1px solid "+T.b2,borderRadius:8,padding:"8px 10px",color:T.t1,fontSize:12,resize:"none",minHeight:60,fontFamily:T.fU,outline:"none",boxSizing:"border-box"}}/></div><div><div style={{color:T.t4,fontSize:10,textTransform:"uppercase",fontFamily:T.fM,fontWeight:700,marginBottom:8,letterSpacing:.8}}>Subtareas</div>{(t.sub||[]).map(s=>(<div key={s.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}><button onClick={()=>togSub(t.id,s.id)} style={{width:15,height:15,borderRadius:3,border:"2px solid "+(s.d?T.g:T.b3),background:s.d?T.g:"transparent",cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>{s.d&&<span style={{color:"#000",fontSize:8,fontWeight:900}}>✓</span>}</button><span style={{fontSize:13,color:s.d?T.t3:T.t2,textDecoration:s.d?"line-through":"none",flex:1,fontFamily:T.fU}}>{s.t}</span><button onClick={()=>delSub(t.id,s.id)} style={{background:"none",border:"none",color:T.t4,cursor:"pointer",fontSize:12,opacity:.3}} onMouseEnter={e=>{e.currentTarget.style.color=T.r;e.currentTarget.style.opacity="1";}} onMouseLeave={e=>{e.currentTarget.style.color=T.t4;e.currentTarget.style.opacity=".3";}}>✕</button></div>))}<input value={subIn[t.id]||""} onChange={e=>setSubIn(p=>({...p,[t.id]:e.target.value}))} onKeyDown={e=>{if(e.key==="Enter"&&subIn[t.id]?.trim())addSub(t.id,subIn[t.id]);}} placeholder="+ Añadir subtarea..." style={{width:"100%",background:"transparent",border:"1px dashed "+T.b2,borderRadius:7,padding:"5px 10px",color:T.t2,fontSize:12,fontFamily:T.fU,outline:"none",boxSizing:"border-box",marginTop:4}}/></div></div>)}
          </div>
        );})}
      </div>
      {modal&&(<div onClick={()=>setModal(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:900,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(5px)"}}><div onClick={e=>e.stopPropagation()} style={{background:T.bg2,border:"1px solid "+T.b2,borderRadius:20,padding:28,width:"100%",maxWidth:460,boxShadow:"0 32px 80px rgba(0,0,0,0.5)",animation:"popIn .2s ease"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}><h3 style={{margin:0,fontFamily:T.fD,fontSize:20,fontWeight:600,color:T.t1,fontStyle:"italic"}}>Nueva tarea</h3><button onClick={()=>setModal(false)} style={{background:T.bg4,border:"none",borderRadius:8,width:30,height:30,cursor:"pointer",color:T.t3,fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button></div><input autoFocus value={form.title} onChange={e=>setForm({...form,title:e.target.value})} onKeyDown={e=>e.key==="Enter"&&addTask()} placeholder="¿Qué hay que hacer?" style={{width:"100%",background:T.bg3,border:"1px solid "+T.b2,borderRadius:11,padding:"12px 15px",color:T.t1,fontSize:15,fontFamily:T.fU,outline:"none",boxSizing:"border-box",marginBottom:16}}/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:16}}><div><div style={{color:T.t4,fontSize:10,textTransform:"uppercase",fontFamily:T.fM,fontWeight:700,marginBottom:7,letterSpacing:.8}}>Prioridad</div><div style={{display:"flex",gap:5}}>{["alta","media","baja"].map(p=>(<button key={p} onClick={()=>setForm({...form,priority:p})} style={{flex:1,background:form.priority===p?PC[p]+"22":"transparent",border:"1px solid "+(form.priority===p?PC[p]:T.b2),color:form.priority===p?PC[p]:T.t3,borderRadius:8,padding:"7px 0",cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:T.fU,transition:"all .15s"}}>{p}</button>))}</div></div><div><div style={{color:T.t4,fontSize:10,textTransform:"uppercase",fontFamily:T.fM,fontWeight:700,marginBottom:7,letterSpacing:.8}}>Fecha límite</div><input type="date" value={form.due} onChange={e=>setForm({...form,due:e.target.value})} style={{width:"100%",background:T.bg3,border:"1px solid "+T.b2,borderRadius:9,padding:"8px 10px",color:T.t1,fontSize:12,outline:"none",boxSizing:"border-box"}}/></div></div><div style={{marginBottom:18}}><div style={{color:T.t4,fontSize:10,textTransform:"uppercase",fontFamily:T.fM,fontWeight:700,marginBottom:7,letterSpacing:.8}}>Carpeta</div><select value={form.folder} onChange={e=>setForm({...form,folder:e.target.value})} style={{width:"100%",background:T.bg3,border:"1px solid "+T.b2,borderRadius:9,padding:"9px 12px",color:T.t1,fontSize:13,fontFamily:T.fU,outline:"none"}}>{data.folders.map(f=><option key={f.id} value={f.id}>{f.icon} {f.name}</option>)}</select></div><button onClick={addTask} style={{width:"100%",background:T.v,border:"none",color:"#fff",borderRadius:11,padding:12,cursor:"pointer",fontWeight:700,fontSize:15,fontFamily:T.fU}}>Crear tarea</button></div></div>)}
    </div>
  );
}

function Kanban({data,save,toast,confirm}){
  const[dragging,setDragging]=useState(null);const[over,setOver]=useState(null);const[addCard,setAddCard]=useState(null);const[cardText,setCardText]=useState("");const[addCol,setAddCol]=useState(false);const[colName,setColName]=useState("");
  const upd=(k)=>save({...data,kanban:k});
  const doAddCard=(colId)=>{if(!cardText.trim())return;upd(data.kanban.map(c=>c.id===colId?{...c,cards:[...c.cards,{id:uid(),text:cardText.trim(),priority:"media",created:NOW}]}:c));setCardText("");setAddCard(null);toast("Tarjeta añadida");};
  const delCard=async(colId,cardId,text)=>{const ok=await confirm({title:"Eliminar tarjeta",body:'"'+text+'"',danger:true,ok:"Eliminar"});if(!ok)return;upd(data.kanban.map(c=>c.id===colId?{...c,cards:c.cards.filter(x=>x.id!==cardId)}:c));toast("Eliminada","info");};
  const drop=(toId)=>{if(!dragging)return;const{cardId,fromColId}=dragging;if(fromColId===toId){setDragging(null);setOver(null);return;}let card;const nk=data.kanban.map(c=>{if(c.id===fromColId){card=c.cards.find(x=>x.id===cardId);return{...c,cards:c.cards.filter(x=>x.id!==cardId)};}return c;}).map(c=>c.id===toId&&card?{...c,cards:[...c.cards,card]}:c);upd(nk);setDragging(null);setOver(null);toast("Tarjeta movida");};
  return(
    <div style={{display:"flex",flexDirection:"column",height:"100%",animation:"fadeUp .25s ease"}}>
      <div style={{padding:"16px 20px 14px",borderBottom:"1px solid "+T.b1,flexShrink:0}}><h2 style={{fontFamily:T.fD,fontSize:22,fontWeight:600,color:T.t1,margin:0,fontStyle:"italic"}}>▦ Kanban</h2></div>
      <div style={{flex:1,overflow:"auto",padding:16,display:"flex",gap:12,alignItems:"flex-start"}}>
        {data.kanban.map(col=>(<div key={col.id} onDragOver={e=>{e.preventDefault();setOver(col.id);}} onDragLeave={()=>setOver(null)} onDrop={()=>drop(col.id)} style={{minWidth:236,width:236,flexShrink:0,background:over===col.id?T.bg4:T.bg2,border:"1px solid "+(over===col.id?col.color+"60":T.b1),borderRadius:14,overflow:"hidden",transition:"all .2s"}}><div style={{padding:"12px 14px 10px",borderBottom:"1px solid "+T.b1,display:"flex",alignItems:"center",gap:8}}><div style={{width:9,height:9,borderRadius:99,background:col.color,flexShrink:0}}/><span style={{fontFamily:T.fU,fontWeight:700,fontSize:13,color:T.t1,flex:1}}>{col.name}</span><span style={{color:T.t4,fontSize:10,fontFamily:T.fM,background:T.bg3,borderRadius:99,padding:"1px 7px"}}>{col.cards.length}</span></div><div style={{padding:"10px 10px 6px",minHeight:40}}>{col.cards.map(card=>(<div key={card.id} draggable onDragStart={()=>setDragging({cardId:card.id,fromColId:col.id})} style={{background:T.bg3,border:"1px solid "+T.b1,borderRadius:10,padding:"11px 13px",marginBottom:7,cursor:"grab",userSelect:"none",transition:"all .15s"}} onMouseEnter={e=>{e.currentTarget.style.border="1px solid "+T.b2;e.currentTarget.style.transform="rotate(-0.4deg) translateY(-1px)";}} onMouseLeave={e=>{e.currentTarget.style.border="1px solid "+T.b1;e.currentTarget.style.transform="none";}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:5}}><span style={{color:T.t1,fontSize:13,lineHeight:1.45,flex:1,fontFamily:T.fU}}>{card.text}</span><button onClick={()=>delCard(col.id,card.id,card.text)} style={{background:"none",border:"none",color:T.t4,cursor:"pointer",fontSize:13,opacity:.3,flexShrink:0}} onMouseEnter={e=>{e.currentTarget.style.color=T.r;e.currentTarget.style.opacity="1";}} onMouseLeave={e=>{e.currentTarget.style.color=T.t4;e.currentTarget.style.opacity=".3";}}>✕</button></div><div style={{marginTop:7,display:"flex",gap:4,alignItems:"center"}}>{card.priority&&card.priority!=="media"&&<PriChip p={card.priority} small/>}<span style={{color:T.t4,fontSize:10,fontFamily:T.fM,marginLeft:"auto"}}>{fmtD(card.created)}</span></div></div>))}</div>{addCard===col.id?(<div style={{padding:"0 10px 10px"}}><textarea autoFocus value={cardText} onChange={e=>setCardText(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();doAddCard(col.id);}if(e.key==="Escape"){setAddCard(null);setCardText("");}}} placeholder="Título..." style={{width:"100%",background:T.bg4,border:"1px solid "+T.v,borderRadius:8,padding:"8px 10px",color:T.t1,fontSize:13,resize:"none",minHeight:60,fontFamily:T.fU,outline:"none",boxSizing:"border-box"}}/><div style={{display:"flex",gap:5,marginTop:6}}><button onClick={()=>doAddCard(col.id)} style={{background:T.v,border:"none",color:"#fff",borderRadius:7,padding:"5px 12px",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:T.fU}}>Añadir</button><button onClick={()=>{setAddCard(null);setCardText("");}} style={{background:"none",border:"1px solid "+T.b1,color:T.t3,borderRadius:7,padding:"5px 10px",cursor:"pointer",fontSize:12,fontFamily:T.fU}}>Cancelar</button></div></div>):(<button onClick={()=>setAddCard(col.id)} style={{width:"100%",background:"transparent",border:"none",color:T.t4,padding:"8px 14px 12px",cursor:"pointer",fontSize:12,textAlign:"left",fontFamily:T.fU}} onMouseEnter={e=>e.currentTarget.style.color=T.t2} onMouseLeave={e=>e.currentTarget.style.color=T.t4}>+ Añadir tarjeta</button>)}</div>))}
        {addCol?(<div style={{minWidth:200,background:T.bg2,border:"1px solid "+T.b2,borderRadius:14,padding:14,flexShrink:0}}><input autoFocus value={colName} onChange={e=>setColName(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")doAddCol();if(e.key==="Escape"){setAddCol(false);setColName("");}}} placeholder="Nombre..." style={{width:"100%",background:T.bg3,border:"1px solid "+T.b2,borderRadius:8,padding:"8px 10px",color:T.t1,fontSize:13,fontFamily:T.fU,outline:"none",boxSizing:"border-box",marginBottom:8}}/><div style={{display:"flex",gap:5}}><button onClick={()=>{if(!colName.trim())return;const cols=[T.t3,T.a,T.v,T.g,T.r,T.b,T.p,T.o];upd([...data.kanban,{id:"kb_"+uid(),name:colName.trim(),color:cols[data.kanban.length%cols.length],cards:[]}]);setColName("");setAddCol(false);toast("Columna añadida");}} style={{background:T.v,border:"none",color:"#fff",borderRadius:7,padding:"6px 12px",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:T.fU}}>Crear</button><button onClick={()=>{setAddCol(false);setColName("");}} style={{background:"none",border:"1px solid "+T.b1,color:T.t3,borderRadius:7,padding:"6px 10px",cursor:"pointer",fontSize:12,fontFamily:T.fU}}>Cancelar</button></div></div>):(<button onClick={()=>setAddCol(true)} style={{minWidth:180,background:"transparent",border:"1px dashed "+T.b2,color:T.t4,borderRadius:14,padding:"14px 20px",cursor:"pointer",fontSize:12,whiteSpace:"nowrap",flexShrink:0,alignSelf:"flex-start",fontFamily:T.fU,transition:"all .15s"}} onMouseEnter={e=>{e.currentTarget.style.border="1px dashed "+T.v;e.currentTarget.style.color=T.v;}} onMouseLeave={e=>{e.currentTarget.style.border="1px dashed "+T.b2;e.currentTarget.style.color=T.t4;}}>+ Nueva columna</button>)}
      </div>
    </div>
  );
}

function CalendarView({data}){
  const[cur,setCur]=useState(new Date());const[sel,setSel]=useState(NOW);
  const y=cur.getFullYear(),m=cur.getMonth(),fd=new Date(y,m,1).getDay(),offset=fd===0?6:fd-1,dims=new Date(y,m+1,0).getDate();
  const MN=["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const tasksByDay=useMemo(()=>{const m2={};data.tasks.forEach(t=>{if(t.due){if(!m2[t.due])m2[t.due]=[];m2[t.due].push(t);}});return m2;},[data.tasks]);
  const selTasks=tasksByDay[sel]||[];
  return(
    <div style={{display:"flex",height:"100%",overflow:"hidden",animation:"fadeUp .25s ease"}}>
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",borderRight:"1px solid "+T.b1}}>
        <div style={{padding:"16px 20px 14px",borderBottom:"1px solid "+T.b1,display:"flex",alignItems:"center",gap:12,flexShrink:0}}><h2 style={{fontFamily:T.fD,fontSize:22,fontWeight:600,color:T.t1,margin:0,flex:1,fontStyle:"italic"}}>◫ Calendario</h2><button onClick={()=>setCur(new Date(y,m-1,1))} style={{background:T.bg3,border:"1px solid "+T.b1,color:T.t2,borderRadius:8,width:30,height:30,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button><span style={{fontFamily:T.fU,fontWeight:700,fontSize:14,color:T.t1,minWidth:130,textAlign:"center"}}>{MN[m]} {y}</span><button onClick={()=>setCur(new Date(y,m+1,1))} style={{background:T.bg3,border:"1px solid "+T.b1,color:T.t2,borderRadius:8,width:30,height:30,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>›</button></div>
        <div style={{flex:1,overflow:"auto",padding:"14px 14px 20px"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:6}}>{["L","M","X","J","V","S","D"].map(d=><div key={d} style={{textAlign:"center",color:T.t4,fontSize:10,fontWeight:700,padding:"3px 0",fontFamily:T.fM,letterSpacing:.5}}>{d}</div>)}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
            {Array.from({length:offset}).map((_,i)=><div key={"e"+i}/>)}
            {Array.from({length:dims}).map((_,i)=>{const day=i+1,ds=y+"-"+pad2(m+1)+"-"+pad2(day),ts=tasksByDay[ds]||[],isT=ds===NOW,isSel=ds===sel;return(<div key={day} onClick={()=>setSel(ds)} style={{background:isSel?T.v:isT?T.vl:T.bg2,border:"1px solid "+(isSel?T.v:isT?T.vg:T.b1),borderRadius:9,padding:"7px 4px",cursor:"pointer",textAlign:"center",transition:"all .15s",minHeight:48}} onMouseEnter={e=>{if(!isSel)e.currentTarget.style.border="1px solid "+T.b3;}} onMouseLeave={e=>e.currentTarget.style.border="1px solid "+(isSel?T.v:isT?T.vg:T.b1)}><div style={{fontSize:12,fontWeight:isT||isSel?700:400,color:isSel?"#fff":isT?T.v:T.t2,marginBottom:3,fontFamily:T.fU}}>{day}</div><div style={{display:"flex",gap:2,justifyContent:"center"}}>{ts.slice(0,4).map((t,ti)=><div key={ti} style={{width:5,height:5,borderRadius:99,background:isSel?"rgba(255,255,255,.6)":t.done?T.g:t.due<NOW?T.r:T.a}}/>)}</div></div>);})}
          </div>
        </div>
      </div>
      <div style={{width:264,overflow:"auto",padding:"16px 14px"}}><div style={{fontFamily:T.fD,fontSize:15,fontWeight:600,color:T.t1,marginBottom:14,fontStyle:"italic"}}>{fmtFull(sel)}</div>{selTasks.length===0?<div style={{color:T.t4,fontSize:12,textAlign:"center",padding:"30px 0",fontFamily:T.fU}}>Sin tareas</div>:selTasks.map(t=>(<div key={t.id} style={{background:T.bg2,border:"1px solid "+(t.due<NOW&&!t.done?T.rg:T.b1),borderRadius:10,padding:"10px 12px",marginBottom:7}}><div style={{display:"flex",alignItems:"center",gap:7}}><div style={{width:14,height:14,borderRadius:4,border:"2px solid "+(t.done?T.g:T.b3),background:t.done?T.g:"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>{t.done&&<span style={{color:"#000",fontSize:8,fontWeight:900}}>✓</span>}</div><span style={{color:t.done?T.t3:T.t1,fontSize:12,flex:1,fontFamily:T.fU,textDecoration:t.done?"line-through":"none"}}>{t.title}</span></div><div style={{marginTop:6,display:"flex",gap:4}}><PriChip p={t.priority} small/></div></div>))}</div>
    </div>
  );
}

const JP=["¿Qué fue lo mejor de hoy?","¿Qué harías diferente?","¿Por qué estás agradecido/a?","¿Qué aprendiste hoy?","¿Qué quieres mejorar mañana?","Describe tu día en una palabra:","¿Cómo te sentiste contigo mismo/a?","¿Qué te sorprendió hoy?","¿Qué conversación fue importante?","¿Qué dejaste sin hacer y por qué?"];
const MOODS=[{e:"😞",v:1,l:"Mal"},{e:"😔",v:2,l:"Regular"},{e:"😐",v:3,l:"Neutro"},{e:"🙂",v:4,l:"Bien"},{e:"😄",v:5,l:"Genial"}];

function Journal({data,save,toast}){
  const[sel,setSel]=useState(NOW);const[editing,setEditing]=useState(false);const[draft,setDraft]=useState("");const[pidx,setPidx]=useState(()=>Math.floor(Math.random()*JP.length));
  const entry=data.journal.find(j=>j.date===sel);
  const streak=useMemo(()=>{let s=0;const d=new Date();for(let i=0;i<365;i++){const ds=d.toISOString().split("T")[0];if(data.journal.find(j=>j.date===ds)){s++;d.setDate(d.getDate()-1);}else break;}return s;},[data.journal]);
  const saveEntry=(body,mood)=>{const others=data.journal.filter(j=>j.date!==sel);const ent={date:sel,body:body??entry?.body??"",mood:mood??entry?.mood??null,updated:new Date().toISOString()};save({...data,journal:[...others,ent].sort((a,b)=>b.date.localeCompare(a.date))});setEditing(false);toast("Entrada guardada ✓");};
  const history=useMemo(()=>{const items=[];const d=new Date();for(let i=0;i<30;i++){const ds=d.toISOString().split("T")[0];items.push({date:ds,entry:data.journal.find(j=>j.date===ds)});d.setDate(d.getDate()-1);}return items;},[data.journal]);
  return(
    <div style={{display:"flex",height:"100%",overflow:"hidden",animation:"fadeUp .25s ease"}}>
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{padding:"16px 24px 14px",borderBottom:"1px solid "+T.b1,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}><div><h2 style={{fontFamily:T.fD,fontSize:22,fontWeight:600,color:T.t1,margin:0,fontStyle:"italic"}}>◪ Diario</h2><div style={{color:T.t4,fontSize:11,marginTop:2,fontFamily:T.fM}}>{streak>0?"🔥 "+streak+" días de racha":"Empieza tu racha hoy"}</div></div><div style={{display:"flex",gap:8,alignItems:"center"}}>{entry?.mood&&<span style={{fontSize:22}}>{MOODS[entry.mood-1]?.e}</span>}{!editing?<button onClick={()=>{setDraft(entry?.body||"");setEditing(true);}} style={{background:T.bl,border:"1px solid "+T.bg_,color:T.b,borderRadius:9,padding:"7px 16px",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:T.fU}}>{entry?"✏ Editar":"✦ Escribir"}</button>:<button onClick={()=>saveEntry(draft)} style={{background:T.b,border:"none",color:"#000",borderRadius:9,padding:"7px 16px",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:T.fU}}>Guardar</button>}</div></div>
        <div style={{flex:1,overflow:"auto",padding:"22px 28px"}}><div style={{maxWidth:700,margin:"0 auto"}}>
          <div style={{fontFamily:T.fD,fontSize:20,fontWeight:600,color:T.t1,marginBottom:6,fontStyle:"italic"}}>{fmtFull(sel)}</div>
          {sel===NOW&&!entry?.body&&!editing&&(<div style={{background:"linear-gradient(135deg,"+T.bg2+","+T.bl+")",border:"1px solid "+T.bg_,borderRadius:14,padding:"16px 18px",marginBottom:20,display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{color:T.b,fontSize:10,textTransform:"uppercase",fontFamily:T.fM,letterSpacing:1,marginBottom:4}}>Prompt del día</div><div style={{color:T.t1,fontSize:14,fontStyle:"italic",fontFamily:T.fD,fontWeight:600}}>"{JP[pidx]}"</div></div><button onClick={()=>setPidx((pidx+1)%JP.length)} style={{background:"none",border:"none",color:T.b,cursor:"pointer",fontSize:20,flexShrink:0}}>↺</button></div>)}
          {editing?(<div><div style={{color:T.t4,fontSize:12,fontStyle:"italic",marginBottom:10,fontFamily:T.fD}}>💡 {JP[pidx]}</div><textarea value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Escribe tu entrada..." style={{width:"100%",background:T.bg2,border:"1px solid "+T.b2,borderRadius:14,padding:"18px 20px",color:T.t1,fontSize:15,resize:"none",minHeight:220,fontFamily:T.fU,lineHeight:1.85,outline:"none",boxSizing:"border-box"}} autoFocus/><div style={{marginTop:16}}><div style={{color:T.t3,fontSize:10,textTransform:"uppercase",fontFamily:T.fM,letterSpacing:1,marginBottom:10}}>¿Cómo te sientes?</div><div style={{display:"flex",gap:8}}>{MOODS.map(mm=>(<button key={mm.v} onClick={()=>saveEntry(draft,mm.v)} title={mm.l} style={{flex:1,background:T.bg2,border:"2px solid "+T.b1,borderRadius:11,padding:"10px 6px",cursor:"pointer",fontSize:24,transition:"all .15s",display:"flex",flexDirection:"column",alignItems:"center",gap:4}} onMouseEnter={e=>{e.currentTarget.style.border="2px solid "+T.b;e.currentTarget.style.transform="scale(1.05)";}} onMouseLeave={e=>{e.currentTarget.style.border="2px solid "+T.b1;e.currentTarget.style.transform="none";}}>{mm.e}<span style={{fontSize:9,color:T.t4,fontFamily:T.fM}}>{mm.l}</span></button>))}</div></div></div>)
          :entry?.body?(<div style={{background:T.bg2,border:"1px solid "+T.b1,borderRadius:14,padding:"22px 24px"}}><div className="md-body" style={{color:T.t2,fontSize:15,lineHeight:1.9}} dangerouslySetInnerHTML={{__html:renderMD(entry.body)}}/></div>)
          :<div style={{color:T.t4,fontSize:14,fontStyle:"italic",textAlign:"center",padding:"50px 0",fontFamily:T.fD}}>Sin entrada para este día</div>}
        </div></div>
      </div>
      <div style={{width:214,borderLeft:"1px solid "+T.b1,overflow:"auto",padding:"14px 10px",flexShrink:0}}>
        <div style={{color:T.t4,fontSize:9,textTransform:"uppercase",letterSpacing:1.8,fontFamily:T.fM,marginBottom:12,paddingLeft:4}}>Últimos 30 días</div>
        {history.map(item=>{const isSel=sel===item.date;return(<div key={item.date} onClick={()=>{setSel(item.date);setEditing(false);}} style={{padding:"8px 10px",borderRadius:8,cursor:"pointer",marginBottom:2,background:isSel?T.bg3:"transparent",border:"1px solid "+(isSel?T.b2:"transparent"),transition:"all .12s"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{color:isSel?T.t1:T.t2,fontSize:12,fontWeight:isSel?600:400,fontFamily:T.fU}}>{item.date===NOW?"Hoy":new Date(item.date+"T12:00:00").toLocaleDateString("es-ES",{day:"numeric",month:"short"})}</div><div style={{display:"flex",alignItems:"center",gap:4}}>{item.entry?.mood&&<span style={{fontSize:13}}>{MOODS[item.entry.mood-1]?.e}</span>}{item.entry&&<div style={{width:6,height:6,borderRadius:99,background:T.g}}/>}</div></div>{item.entry?.body&&<div style={{color:T.t4,fontSize:10,marginTop:2,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis",fontFamily:T.fU}}>{item.entry.body.replace(/[#*`>\-\[\]]/g,"").slice(0,28)}</div>}</div>);})}
      </div>
    </div>
  );
}

function Habits({data,save,toast,confirm}){
  const[addModal,setAddModal]=useState(false);
  const[form,setForm]=useState({name:"",icon:"✦",color:T.v});
  const days30=useMemo(()=>last30Days(),[]);
  const ICONS=["✦","🧘","🏃","📚","💧","🥗","💊","🛌","✍","🎯","💪","🧠","🌅","🚶","🎸","🌿","☀","🏊","🍎","📵"];
  const COLORS=[T.v,T.g,T.a,T.b,T.p,T.r,T.o,"#4ADE80","#E879F9","#06B6D4"];
  const calcStreak=(c)=>{let s=0;const d=new Date();for(let i=0;i<365;i++){const ds=d.toISOString().split("T")[0];if(c.includes(ds)){s++;d.setDate(d.getDate()-1);}else break;}return s;};
  const toggleHabit=(hid)=>{save({...data,habits:data.habits.map(h=>{if(h.id!==hid)return h;const has=h.completions.includes(NOW);return{...h,completions:has?h.completions.filter(d=>d!==NOW):[...h.completions,NOW]};})});};
  const addHabit=()=>{if(!form.name.trim())return;save({...data,habits:[...data.habits,{id:"h_"+uid(),name:form.name.trim(),icon:form.icon,color:form.color,completions:[]}]});setForm({name:"",icon:"✦",color:T.v});setAddModal(false);toast("Hábito añadido ✓");};
  const delHabit=async(hid,name)=>{const ok=await confirm({title:"Eliminar hábito",body:'"'+name+'" y su historial.',danger:true,ok:"Eliminar"});if(!ok)return;save({...data,habits:data.habits.filter(h=>h.id!==hid)});toast("Hábito eliminado","info");};
  const doneTodayCount=data.habits.filter(h=>h.completions.includes(NOW)).length;
  return(
    <div style={{display:"flex",flexDirection:"column",height:"100%",animation:"fadeUp .25s ease"}}>
      <div style={{padding:"16px 22px 14px",borderBottom:"1px solid "+T.b1,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}><div><h2 style={{fontFamily:T.fD,fontSize:22,fontWeight:600,color:T.t1,margin:0,fontStyle:"italic"}}>◐ Hábitos</h2><div style={{color:T.t4,fontSize:11,marginTop:2,fontFamily:T.fM}}>{doneTodayCount}/{data.habits.length} completados hoy · {NOW}</div></div><button onClick={()=>setAddModal(true)} style={{background:T.v,border:"none",color:"#fff",borderRadius:9,padding:"8px 16px",cursor:"pointer",fontSize:13,fontFamily:T.fU,fontWeight:700}}>+ Nuevo hábito</button></div>
      <div style={{flex:1,overflow:"auto",padding:"16px 20px"}}>
        {data.habits.length===0?<EmptyState icon="◐" title="Sin hábitos" body="Añade hábitos y haz seguimiento diario con rachas visuales." action={()=>setAddModal(true)} actionLabel="Crear hábito"/>
        :data.habits.map(h=>{const doneToday=h.completions.includes(NOW),streak=calcStreak(h.completions),rate30=days30.filter(d=>h.completions.includes(d)).length;return(
          <div key={h.id} style={{background:T.bg2,border:"1px solid "+(doneToday?h.color+"40":T.b1),borderRadius:16,padding:"16px 20px",marginBottom:10,transition:"all .2s"}}>
            <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
              <button onClick={()=>toggleHabit(h.id)} style={{width:48,height:48,borderRadius:14,background:doneToday?h.color+"22":"transparent",border:"2px solid "+(doneToday?h.color:T.b2),cursor:"pointer",fontSize:22,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s",flexShrink:0}} onMouseEnter={e=>e.currentTarget.style.border="2px solid "+h.color} onMouseLeave={e=>e.currentTarget.style.border="2px solid "+(doneToday?h.color:T.b2)}>{doneToday?<span style={{fontSize:22}}>{h.icon}</span>:<span style={{opacity:.4}}>{h.icon}</span>}</button>
              <div style={{flex:1}}><div style={{fontFamily:T.fU,fontWeight:700,fontSize:16,color:T.t1,marginBottom:3}}>{h.name}</div><div style={{display:"flex",gap:14,flexWrap:"wrap"}}><span style={{color:streak>0?T.a:T.t4,fontSize:12,fontFamily:T.fM}}>{streak>0?"🔥 "+streak+" días":"Sin racha"}</span><span style={{color:T.t3,fontSize:11,fontFamily:T.fM}}>{rate30}/30 este mes</span><span style={{color:doneToday?T.g:T.t4,fontSize:11,fontFamily:T.fU,fontWeight:600}}>{doneToday?"✓ Hecho hoy":"Pendiente"}</span></div></div>
              <Ring value={Math.round(rate30/30*100)} size={42} stroke={3.5} color={h.color}><span style={{fontSize:9,fontFamily:T.fM,color:h.color,fontWeight:700}}>{Math.round(rate30/30*100)}%</span></Ring>
              <button onClick={()=>delHabit(h.id,h.name)} style={{background:"none",border:"none",color:T.t4,cursor:"pointer",fontSize:14,opacity:.25,flexShrink:0,transition:"all .15s"}} onMouseEnter={e=>{e.currentTarget.style.color=T.r;e.currentTarget.style.opacity="1";}} onMouseLeave={e=>{e.currentTarget.style.color=T.t4;e.currentTarget.style.opacity=".25";}}>✕</button>
            </div>
            <div style={{display:"flex",gap:3}}>
              {days30.map(d=>{const done=h.completions.includes(d),isToday=d===NOW;return(<div key={d} title={d} onClick={()=>{const has=h.completions.includes(d);save({...data,habits:data.habits.map(x=>x.id===h.id?{...x,completions:has?x.completions.filter(c=>c!==d):[...x.completions,d]}:x)});}} style={{flex:1,height:8,borderRadius:3,background:done?h.color:T.bg4,border:isToday?"1px solid "+h.color+"80":"none",transition:"background .2s",cursor:"pointer",minWidth:0}}/>);})}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:5}}><span style={{color:T.t4,fontSize:9,fontFamily:T.fM}}>30 días atrás</span><span style={{color:T.t4,fontSize:9,fontFamily:T.fM}}>hoy</span></div>
          </div>
        );})}
      </div>
      {addModal&&(<div onClick={()=>setAddModal(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:900,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(5px)"}}><div onClick={e=>e.stopPropagation()} style={{background:T.bg2,border:"1px solid "+T.b2,borderRadius:20,padding:28,width:"100%",maxWidth:440,boxShadow:"0 32px 80px rgba(0,0,0,0.5)",animation:"popIn .2s ease"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}><h3 style={{margin:0,fontFamily:T.fD,fontSize:20,fontWeight:600,color:T.t1,fontStyle:"italic"}}>Nuevo hábito</h3><button onClick={()=>setAddModal(false)} style={{background:T.bg4,border:"none",borderRadius:8,width:30,height:30,cursor:"pointer",color:T.t3,fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button></div><div style={{marginBottom:14}}><div style={{color:T.t4,fontSize:10,textTransform:"uppercase",fontFamily:T.fM,fontWeight:700,marginBottom:7,letterSpacing:.8}}>Nombre</div><input autoFocus value={form.name} onChange={e=>setForm({...form,name:e.target.value})} onKeyDown={e=>e.key==="Enter"&&addHabit()} placeholder="Ej. Meditar, Ejercicio..." style={{width:"100%",background:T.bg3,border:"1px solid "+T.b2,borderRadius:10,padding:"10px 13px",color:T.t1,fontSize:14,fontFamily:T.fU,outline:"none",boxSizing:"border-box"}}/></div><div style={{marginBottom:16}}><div style={{color:T.t4,fontSize:10,textTransform:"uppercase",fontFamily:T.fM,fontWeight:700,marginBottom:8,letterSpacing:.8}}>Icono</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{ICONS.map(ic=>(<button key={ic} onClick={()=>setForm({...form,icon:ic})} style={{width:36,height:36,borderRadius:9,background:form.icon===ic?T.bg4:"transparent",border:"1px solid "+(form.icon===ic?T.v:T.b1),cursor:"pointer",fontSize:18,transition:"all .15s"}}>{ic}</button>))}</div></div><div style={{marginBottom:20}}><div style={{color:T.t4,fontSize:10,textTransform:"uppercase",fontFamily:T.fM,fontWeight:700,marginBottom:8,letterSpacing:.8}}>Color</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{COLORS.map(c=>(<button key={c} onClick={()=>setForm({...form,color:c})} style={{width:28,height:28,borderRadius:8,background:c,border:"2px solid "+(form.color===c?"#fff":"transparent"),cursor:"pointer",transition:"all .15s"}}/>))}</div></div><button onClick={addHabit} style={{width:"100%",background:form.color,border:"none",color:"#fff",borderRadius:11,padding:12,cursor:"pointer",fontWeight:700,fontSize:15,fontFamily:T.fU}}>Crear hábito {form.icon}</button></div></div>)}
    </div>
  );
}

function Pomodoro({data,save,toast}){
  const cfg=data.settings;
  const WORK=cfg.pomodoroWork*60,SHORT=cfg.pomodoroBreak*60,LONG=cfg.pomodoroLong*60,SESSIONS=cfg.pomodoroSessions;
  const[phase,setPhase]=useState("work");
  const[time,setTime]=useState(WORK);
  const[running,setRunning]=useState(false);
  const[session,setSession]=useState(1);
  const[focus,setFocus]=useState(false);
  const intRef=useRef(null);
  const totalTime=phase==="work"?WORK:phase==="short"?SHORT:LONG;
  const pct=Math.round((totalTime-time)/totalTime*100);

  const reset=(ph)=>{clearInterval(intRef.current);setRunning(false);const t=ph==="work"?WORK:ph==="short"?SHORT:LONG;setPhase(ph);setTime(t);};

  const phaseRef=useRef("work");
  const sessionRef=useRef(1);
  useEffect(()=>{phaseRef.current=phase;},[phase]);
  useEffect(()=>{sessionRef.current=session;},[session]);

  const tick=useCallback(()=>{
    setTime(prev=>{
      if(prev>1)return prev-1;
      // will handle transition outside setState
      return 0;
    });
  },[]);

  useEffect(()=>{
    if(time===0&&running){
      clearInterval(intRef.current);
      setRunning(false);
      beep(880,0.4);
      const curPhase=phaseRef.current;
      const curSession=sessionRef.current;
      if(curPhase==="work"){
        const nextSession=curSession+1;
        const isLong=nextSession>SESSIONS;
        save({...data,pomodoroLog:[...data.pomodoroLog,{date:NOW,type:"work",at:new Date().toISOString()}]});
        toast(isLong?"🏆 Bloque completado — descansa bien":"✓ Pomodoro completado — descansa");
        if(isLong){setSession(1);setPhase("long");setTime(LONG);}
        else{setSession(nextSession);setPhase("short");setTime(SHORT);}
      } else {
        toast("▶ ¡A trabajar! Nuevo pomodoro");
        setPhase("work");
        setTime(WORK);
      }
    }
  },[time,running]);


  useEffect(()=>{
    if(running){intRef.current=setInterval(tick,1000);}
    else clearInterval(intRef.current);
    return()=>clearInterval(intRef.current);
  },[running,tick]);

  useEffect(()=>{reset("work");},[cfg.pomodoroWork,cfg.pomodoroBreak,cfg.pomodoroLong]);

  const mins=Math.floor(time/60),secs=time%60;
  const phaseColor=phase==="work"?T.r:T.g;
  const phaseLabel=phase==="work"?"Trabajo":phase==="short"?"Descanso corto":"Descanso largo";
  const todaySessions=data.pomodoroLog.filter(l=>l.date===NOW&&l.type==="work").length;

  return(
    <div style={{display:"flex",flexDirection:"column",height:"100%",animation:"fadeUp .25s ease",overflow:"auto"}}>
      {focus&&(
        <div style={{position:"fixed",inset:0,background:"rgba(7,6,10,0.96)",zIndex:8500,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",animation:"zenIn .3s ease"}}>
          <button onClick={()=>setFocus(false)} style={{position:"absolute",top:20,right:20,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.3)",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:11,fontFamily:T.fM}} onMouseEnter={e=>e.currentTarget.style.color="rgba(255,255,255,0.7)"} onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.3)"}>ESC · Salir del modo foco</button>
          <div style={{marginBottom:20,color:"rgba(255,255,255,0.3)",fontSize:11,textTransform:"uppercase",letterSpacing:2,fontFamily:T.fM}}>{phaseLabel} · Sesión {session}/{SESSIONS}</div>
          <Ring value={pct} size={260} stroke={6} color={phaseColor}>
            <div style={{textAlign:"center"}}>
              <div style={{fontFamily:T.fD,fontSize:64,fontWeight:600,color:"rgba(255,255,255,0.9)",letterSpacing:-2,fontStyle:"italic",animation:running?"pulse 2s ease infinite":"none"}}>{pad2(mins)}:{pad2(secs)}</div>
              <div style={{color:"rgba(255,255,255,0.25)",fontSize:12,marginTop:4,fontFamily:T.fU}}>{phaseLabel}</div>
            </div>
          </Ring>
          <div style={{display:"flex",gap:14,marginTop:32}}>
            <button onClick={()=>setRunning(v=>!v)} style={{background:running?phaseColor+"22":"rgba(255,255,255,0.08)",border:"1px solid "+(running?phaseColor+"60":"rgba(255,255,255,0.12)"),color:running?phaseColor:"rgba(255,255,255,0.7)",borderRadius:14,padding:"14px 36px",cursor:"pointer",fontSize:18,fontFamily:T.fU,fontWeight:700,transition:"all .2s"}}>{running?"⏸ Pausar":"▶ Iniciar"}</button>
            <button onClick={()=>reset(phase)} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.4)",borderRadius:14,padding:"14px 22px",cursor:"pointer",fontSize:16,fontFamily:T.fU,transition:"all .2s"}}>↺ Reset</button>
          </div>
        </div>
      )}
      <div style={{padding:"16px 22px 14px",borderBottom:"1px solid "+T.b1,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <div><h2 style={{fontFamily:T.fD,fontSize:22,fontWeight:600,color:T.t1,margin:0,fontStyle:"italic"}}>⏱ Pomodoro</h2><div style={{color:T.t4,fontSize:11,marginTop:2,fontFamily:T.fM}}>{todaySessions} sesiones completadas hoy</div></div>
        <button onClick={()=>setFocus(true)} style={{background:T.vl,border:"1px solid "+T.vg,color:T.v,borderRadius:9,padding:"7px 16px",cursor:"pointer",fontSize:12,fontFamily:T.fU,fontWeight:700}}>◎ Modo foco</button>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32,gap:28}}>
        <div style={{display:"flex",gap:8}}>
          {["work","short","long"].map(ph=>{const labels={work:"Trabajo",short:"Descanso",long:"Largo"};const cols={work:T.r,short:T.g,long:T.b};return(<button key={ph} onClick={()=>reset(ph)} style={{background:phase===ph?cols[ph]+"22":"transparent",border:"1px solid "+(phase===ph?cols[ph]:T.b2),color:phase===ph?cols[ph]:T.t3,borderRadius:99,padding:"5px 16px",cursor:"pointer",fontSize:12,fontFamily:T.fU,fontWeight:phase===ph?700:400,transition:"all .15s"}}>{labels[ph]}</button>);})}
        </div>
        <Ring value={pct} size={240} stroke={5} color={phaseColor}>
          <div style={{textAlign:"center"}}>
            <div style={{fontFamily:T.fD,fontSize:58,fontWeight:600,color:T.t1,letterSpacing:-2,fontStyle:"italic",animation:running?"pulse 2s ease infinite":"none"}}>{pad2(mins)}:{pad2(secs)}</div>
            <div style={{color:T.t3,fontSize:12,marginTop:4,fontFamily:T.fU}}>{phaseLabel}</div>
          </div>
        </Ring>
        <div style={{display:"flex",gap:12}}>
          <button onClick={()=>setRunning(v=>!v)} style={{background:running?phaseColor+"22":T.bg3,border:"1px solid "+(running?phaseColor+"60":T.b2),color:running?phaseColor:T.t1,borderRadius:13,padding:"13px 36px",cursor:"pointer",fontSize:17,fontFamily:T.fU,fontWeight:700,transition:"all .2s"}}>{running?"⏸ Pausar":"▶ Iniciar"}</button>
          <button onClick={()=>reset(phase)} style={{background:T.bg3,border:"1px solid "+T.b1,color:T.t3,borderRadius:13,padding:"13px 18px",cursor:"pointer",fontSize:16,fontFamily:T.fU,transition:"all .2s"}}>↺</button>
        </div>
        <div style={{display:"flex",gap:8}}>
          {Array.from({length:SESSIONS}).map((_,i)=>(<div key={i} style={{width:10,height:10,borderRadius:99,background:i<session-1?phaseColor:T.bg4,border:"1px solid "+(i<session?phaseColor+"60":T.b2),transition:"all .3s"}}/>))}
        </div>
        <div style={{color:T.t3,fontSize:12,fontFamily:T.fM}}>Sesión {session} de {SESSIONS}</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"center",marginTop:8}}>{Array.from({length:todaySessions}).map((_,i)=>(<div key={i} style={{width:8,height:8,borderRadius:99,background:T.r+"90",transition:"all .3s"}}/>))}{todaySessions===0&&<div style={{color:T.t4,fontSize:12,fontFamily:T.fU}}>Sin sesiones hoy — ¡comienza tu primera!</div>}</div>
      </div>
    </div>
  );
}

function Stats({data}){
  const days7=useMemo(()=>last7Days(),[]);
  const days30=useMemo(()=>last30Days(),[]);
  const tasksDoneByDay=useMemo(()=>{const m={};days30.forEach(d=>{m[d]=data.tasks.filter(t=>t.doneAt&&t.doneAt.startsWith(d)).length;});return m;},[data.tasks,days30]);
  const notesByDay=useMemo(()=>{const m={};days30.forEach(d=>{m[d]=data.notes.filter(n=>n.created===d&&!n.deleted).length;});return m;},[data.notes,days30]);
  const pomByDay=useMemo(()=>{const m={};days30.forEach(d=>{m[d]=data.pomodoroLog.filter(l=>l.date===d&&l.type==="work").length;});return m;},[data.pomodoroLog,days30]);
  const totalDone=data.tasks.filter(t=>t.done).length;
  const totalNotes=data.notes.filter(n=>!n.deleted).length;
  const totalPom=data.pomodoroLog.filter(l=>l.type==="work").length;
  const journalStreak=useMemo(()=>{let s=0;const d=new Date();for(let i=0;i<365;i++){const ds=d.toISOString().split("T")[0];if(data.journal.find(j=>j.date===ds)){s++;d.setDate(d.getDate()-1);}else break;}return s;},[data.journal]);
  const bestHabit=useMemo(()=>{if(!data.habits.length)return null;return data.habits.reduce((best,h)=>{const streak=()=>{let s=0;const d=new Date();for(let i=0;i<365;i++){const ds=d.toISOString().split("T")[0];if(h.completions.includes(ds)){s++;d.setDate(d.getDate()-1);}else break;}return s;};const s=streak();return s>best.streak?{name:h.name,icon:h.icon,streak:s}:best;},{name:"",icon:"",streak:0});},[data.habits]);
  const maxTasks=Math.max(1,...Object.values(tasksDoneByDay));
  const maxPom=Math.max(1,...Object.values(pomByDay));

  const card={background:T.bg2,border:"1px solid "+T.b1,borderRadius:14,padding:20};
  return(
    <div style={{overflow:"auto",height:"100%",padding:"24px 24px 60px",animation:"fadeUp .25s ease"}}>
      <h2 style={{fontFamily:T.fD,fontSize:22,fontWeight:600,color:T.t1,margin:"0 0 24px",fontStyle:"italic"}}>◻ Estadísticas</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10,marginBottom:22}}>
        {[{l:"Tareas completadas",v:totalDone,c:T.v,i:"◉"},{l:"Notas creadas",v:totalNotes,c:T.b,i:"◈"},{l:"Pomodoros",v:totalPom,c:T.r,i:"⏱"},{l:"Racha diario",v:journalStreak+"d",c:T.a,i:"🔥"},{l:"Hábitos activos",v:data.habits.length,c:T.g,i:"◐"}].map(s=>(<div key={s.l} style={{...card,position:"relative",overflow:"hidden"}}><div style={{position:"absolute",top:-6,right:-6,fontSize:36,opacity:.05}}>{s.i}</div><div style={{color:s.c,fontSize:10,fontWeight:700,textTransform:"uppercase",fontFamily:T.fM,letterSpacing:.5,marginBottom:8}}>{s.l}</div><div style={{fontFamily:T.fD,fontSize:38,fontWeight:600,color:s.c,lineHeight:1,fontStyle:"italic"}}>{s.v}</div></div>))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
        <div style={card}>
          <div style={{color:T.t3,fontSize:10,textTransform:"uppercase",fontFamily:T.fM,letterSpacing:1.2,marginBottom:16}}>◉ Tareas completadas · últimos 30 días</div>
          <div style={{display:"flex",alignItems:"flex-end",gap:3,height:80}}>
            {days30.map(d=>{const v=tasksDoneByDay[d]||0;const pct=Math.max(v>0?8:0,Math.round(v/maxTasks*100));const isT=d===NOW;return(<div key={d} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}} title={d+": "+v}><div style={{width:"100%",background:isT?T.v:v>0?T.v+"80":T.bg4,borderRadius:"3px 3px 0 0",height:pct+"%",minHeight:v>0?4:2,transition:"height .5s ease",border:isT?"1px solid "+T.v:"none"}}/></div>);})}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}><span style={{color:T.t4,fontSize:9,fontFamily:T.fM}}>30d atrás</span><span style={{color:T.t4,fontSize:9,fontFamily:T.fM}}>hoy</span></div>
        </div>
        <div style={card}>
          <div style={{color:T.t3,fontSize:10,textTransform:"uppercase",fontFamily:T.fM,letterSpacing:1.2,marginBottom:16}}>⏱ Pomodoros · últimos 30 días</div>
          <div style={{display:"flex",alignItems:"flex-end",gap:3,height:80}}>
            {days30.map(d=>{const v=pomByDay[d]||0;const pct=Math.max(v>0?8:0,Math.round(v/maxPom*100));const isT=d===NOW;return(<div key={d} style={{flex:1}} title={d+": "+v}><div style={{width:"100%",background:isT?T.r:v>0?T.r+"70":T.bg4,borderRadius:"3px 3px 0 0",height:pct+"%",minHeight:v>0?4:2,transition:"height .5s ease"}}/></div>);})}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}><span style={{color:T.t4,fontSize:9,fontFamily:T.fM}}>30d atrás</span><span style={{color:T.t4,fontSize:9,fontFamily:T.fM}}>hoy</span></div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
        <div style={card}>
          <div style={{color:T.t3,fontSize:10,textTransform:"uppercase",fontFamily:T.fM,letterSpacing:1.2,marginBottom:14}}>◐ Hábitos esta semana</div>
          {data.habits.length===0?<div style={{color:T.t4,fontSize:13,fontFamily:T.fU}}>Sin hábitos configurados</div>:data.habits.map(h=>{const done7=days7.filter(d=>h.completions.includes(d)).length;return(<div key={h.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}><span style={{fontSize:16,flexShrink:0}}>{h.icon}</span><div style={{flex:1}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{color:T.t1,fontSize:12,fontFamily:T.fU,fontWeight:500}}>{h.name}</span><span style={{color:T.t3,fontSize:11,fontFamily:T.fM}}>{done7}/7</span></div><div style={{background:T.bg4,borderRadius:99,height:5,overflow:"hidden"}}><div style={{width:Math.round(done7/7*100)+"%",height:"100%",background:h.color,borderRadius:99,transition:"width .5s ease"}}/></div></div></div>);})}
        </div>
        <div style={card}>
          <div style={{color:T.t3,fontSize:10,textTransform:"uppercase",fontFamily:T.fM,letterSpacing:1.2,marginBottom:14}}>◪ Diario · últimos 30 días</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:6}}>{["L","M","X","J","V","S","D"].map(d=><div key={d} style={{textAlign:"center",color:T.t4,fontSize:9,fontFamily:T.fM}}>{d}</div>)}</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
            {days30.map(d=>{const has=data.journal.find(j=>j.date===d);const isT=d===NOW;const mood=has?.mood;const MC={1:T.r,2:T.o,3:T.t3,4:T.b,5:T.g};return(<div key={d} title={d+(has?(" · "+MOODS[has.mood-1]?.l):"")} style={{width:16,height:16,borderRadius:4,background:has?(MC[mood]||T.v)+"80":T.bg4,border:isT?"1px solid "+T.v:"none",transition:"background .2s"}}/>);})}
          </div>
          <div style={{marginTop:10,color:T.t4,fontSize:11,fontFamily:T.fU}}>{data.journal.filter(j=>days30.includes(j.date)).length} entradas en 30 días</div>
          {bestHabit&&bestHabit.streak>0&&<div style={{marginTop:16,background:T.ag,borderRadius:10,padding:"10px 14px",display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:20}}>{bestHabit.icon}</span><div><div style={{color:T.a,fontSize:11,fontWeight:700,fontFamily:T.fU}}>{bestHabit.name}</div><div style={{color:T.t2,fontSize:11,fontFamily:T.fM}}>🔥 Mejor racha: {bestHabit.streak} días</div></div></div>}
        </div>
      </div>

      <div style={card}>
        <div style={{color:T.t3,fontSize:10,textTransform:"uppercase",fontFamily:T.fM,letterSpacing:1.2,marginBottom:16}}>◉ Distribución de tareas por prioridad</div>
        <div style={{display:"flex",gap:20,alignItems:"center",flexWrap:"wrap"}}>
          {["alta","media","baja"].map(p=>{const PC={alta:T.r,media:T.a,baja:T.g};const labels={alta:"Alta",media:"Media",baja:"Baja"};const total=data.tasks.filter(t=>t.priority===p).length;const done=data.tasks.filter(t=>t.priority===p&&t.done).length;const pct=total>0?Math.round(done/total*100):0;return(<div key={p} style={{display:"flex",alignItems:"center",gap:12,flex:1,minWidth:160}}><Ring value={pct} size={56} stroke={5} color={PC[p]}><span style={{fontFamily:T.fM,fontSize:11,fontWeight:700,color:PC[p]}}>{pct}%</span></Ring><div><div style={{color:PC[p],fontSize:12,fontWeight:700,fontFamily:T.fU,marginBottom:2}}>Prioridad {labels[p]}</div><div style={{color:T.t3,fontSize:11,fontFamily:T.fM}}>{done}/{total} completadas</div></div></div>);})}
        </div>
      </div>
    </div>
  );
}

function Tags({data,save,nav,toast,confirm}){
  const[newTag,setNewTag]=useState("");
  const counts=useMemo(()=>{const m={};data.tags.forEach(t=>{m[t]={notes:data.notes.filter(n=>n.tags?.includes(t)&&!n.deleted).length,tasks:data.tasks.filter(x=>x.tags?.includes(t)).length};});return m;},[data]);
  const add=()=>{const t=newTag.trim().toLowerCase().replace(/\s+/g,"-");if(!t||data.tags.includes(t))return;save({...data,tags:[...data.tags,t]});setNewTag("");toast("Etiqueta añadida");};
  const del=async(tag)=>{const ok=await confirm({title:"Eliminar etiqueta",body:'"#'+tag+'" se eliminará de notas y tareas.',danger:true,ok:"Eliminar"});if(!ok)return;save({...data,tags:data.tags.filter(t=>t!==tag),notes:data.notes.map(n=>({...n,tags:(n.tags||[]).filter(t=>t!==tag)})),tasks:data.tasks.map(t=>({...t,tags:(t.tags||[]).filter(x=>x!==tag)}))});toast("Etiqueta eliminada","info");};
  return(
    <div style={{display:"flex",flexDirection:"column",height:"100%",animation:"fadeUp .25s ease"}}>
      <div style={{padding:"16px 20px 14px",borderBottom:"1px solid "+T.b1,display:"flex",alignItems:"center",gap:10,flexShrink:0}}><h2 style={{fontFamily:T.fD,fontSize:22,fontWeight:600,color:T.t1,margin:0,flex:1,fontStyle:"italic"}}>◇ Etiquetas</h2><input value={newTag} onChange={e=>setNewTag(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} placeholder="Nueva etiqueta..." style={{background:T.bg3,border:"1px solid "+T.b2,borderRadius:9,padding:"7px 12px",color:T.t1,fontSize:13,fontFamily:T.fU,outline:"none",width:160}}/><button onClick={add} style={{background:T.v,border:"none",color:"#fff",borderRadius:8,padding:"8px 14px",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:T.fU}}>+ Añadir</button></div>
      <div style={{flex:1,overflow:"auto",padding:20}}>{data.tags.length===0?<EmptyState icon="◇" title="Sin etiquetas" body="Crea etiquetas para organizar tus notas y tareas."/>:<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10}}>{data.tags.map(t=>(<div key={t} style={{background:T.bg2,border:"1px solid "+T.b1,borderRadius:13,padding:"15px 16px",transition:"all .15s"}} onMouseEnter={e=>e.currentTarget.style.border="1px solid "+T.b2} onMouseLeave={e=>e.currentTarget.style.border="1px solid "+T.b1}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}><TagChip name={t} pal={data.tagPal}/><button onClick={()=>del(t)} style={{background:"none",border:"none",color:T.t4,cursor:"pointer",fontSize:13,opacity:.3,transition:"all .15s"}} onMouseEnter={e=>{e.currentTarget.style.color=T.r;e.currentTarget.style.opacity="1";}} onMouseLeave={e=>{e.currentTarget.style.color=T.t4;e.currentTarget.style.opacity=".3";}}>✕</button></div><div style={{display:"flex",gap:12}}><button onClick={()=>nav("notes/tag/"+t)} style={{background:"none",border:"none",color:T.t3,cursor:"pointer",fontSize:12,fontFamily:T.fU,padding:0,transition:"color .15s"}} onMouseEnter={e=>e.currentTarget.style.color=T.t1} onMouseLeave={e=>e.currentTarget.style.color=T.t3}>◈ {counts[t]?.notes||0} nota{(counts[t]?.notes||0)!==1?"s":""}</button><span style={{color:T.t3,fontSize:12,fontFamily:T.fU}}>◉ {counts[t]?.tasks||0}</span></div></div>))}</div>}</div>
    </div>
  );
}

function Settings({data,save,toast,confirm}){
  const cfg=data.settings||{};
  const upd=(k,v)=>save({...data,settings:{...cfg,[k]:v}});
  const exportData=()=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="flowspace-backup-"+NOW+".json";a.click();toast("Datos exportados ✓");};
  const importData=()=>{const input=document.createElement("input");input.type="file";input.accept=".json";input.onchange=(e)=>{const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=async(ev)=>{try{const imported=JSON.parse(ev.target.result);if(!imported.notes||!imported.tasks)throw new Error("inválido");const ok=await confirm({title:"Importar datos",body:"Reemplazará todos tus datos actuales.",ok:"Importar",icon:"📂"});if(ok){save(imported);toast("Datos importados ✓");}}catch{toast("Archivo inválido","error");}};reader.readAsText(file);};input.click();};
  const clearAll=async()=>{const ok=await confirm({title:"Borrar todo",body:"TODOS tus datos serán eliminados permanentemente.",danger:true,ok:"Borrar todo",icon:"⚠️"});if(ok){save(INIT);toast("Datos borrados","info");}};
  const stats=[[" ◈ Notas",data.notes.filter(n=>!n.deleted).length],["◉ Tareas",data.tasks.length],["✓ Completadas",data.tasks.filter(t=>t.done).length],["◪ Entradas diario",data.journal.length],["◐ Hábitos",data.habits.length],["⏱ Pomodoros",data.pomodoroLog.length],["◇ Etiquetas",data.tags.length],["📁 Carpetas",data.folders.length]];
  const fieldStyle={width:"100%",maxWidth:280,background:T.bg3,border:"1px solid "+T.b2,borderRadius:9,padding:"9px 12px",color:T.t1,fontSize:13,fontFamily:T.fU,outline:"none",boxSizing:"border-box"};
  const numStyle={...fieldStyle,maxWidth:80};
  return(
    <div style={{overflow:"auto",height:"100%",padding:"28px",animation:"fadeUp .25s ease"}}>
      <h2 style={{fontFamily:T.fD,fontSize:26,fontWeight:600,color:T.t1,margin:"0 0 28px",fontStyle:"italic"}}>⚙ Ajustes</h2>
      <div style={{background:T.bg2,border:"1px solid "+T.b1,borderRadius:16,padding:22,marginBottom:16}}>
        <div style={{color:T.t4,fontSize:10,textTransform:"uppercase",fontFamily:T.fM,letterSpacing:1.5,marginBottom:12,fontWeight:700}}>Perfil</div>
        <label style={{color:T.t3,fontSize:12,fontFamily:T.fU,display:"block",marginBottom:6}}>Tu nombre</label>
        <input value={cfg.userName||""} onChange={e=>upd("userName",e.target.value)} placeholder="¿Cómo te llamas?" style={fieldStyle}/>
      </div>
      <div style={{background:T.bg2,border:"1px solid "+T.b1,borderRadius:16,padding:22,marginBottom:16}}>
        <div style={{color:T.t4,fontSize:10,textTransform:"uppercase",fontFamily:T.fM,letterSpacing:1.5,marginBottom:14,fontWeight:700}}>⏱ Temporizador Pomodoro</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:14}}>
          {[["Trabajo (min)","pomodoroWork",25],["Descanso corto","pomodoroBreak",5],["Descanso largo","pomodoroLong",15],["Sesiones antes del descanso largo","pomodoroSessions",4]].map(([label,key,def])=>(<div key={key}><label style={{color:T.t3,fontSize:12,fontFamily:T.fU,display:"block",marginBottom:6}}>{label}</label><input type="number" min={1} max={99} value={cfg[key]??def} onChange={e=>upd(key,parseInt(e.target.value)||def)} style={numStyle}/></div>))}
        </div>
      </div>
      <div style={{background:T.bg2,border:"1px solid "+T.b1,borderRadius:16,padding:22,marginBottom:16}}>
        <div style={{color:T.t4,fontSize:10,textTransform:"uppercase",fontFamily:T.fM,letterSpacing:1.5,marginBottom:14,fontWeight:700}}>Datos</div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          <button onClick={exportData} style={{background:T.gl,border:"1px solid "+T.gg,color:T.g,borderRadius:9,padding:"10px 18px",cursor:"pointer",fontSize:13,fontFamily:T.fU,fontWeight:600}}>↓ Exportar backup</button>
          <button onClick={importData} style={{background:T.vl,border:"1px solid "+T.vg,color:T.v,borderRadius:9,padding:"10px 18px",cursor:"pointer",fontSize:13,fontFamily:T.fU,fontWeight:600}}>↑ Importar backup</button>
        </div>
        <div style={{color:T.t4,fontSize:11,marginTop:10,fontFamily:T.fU}}>Los backups se guardan como JSON y pueden restaurarse en cualquier momento.</div>
      </div>
      <div style={{background:T.bg2,border:"1px solid "+T.b1,borderRadius:16,padding:22,marginBottom:16}}>
        <div style={{color:T.t4,fontSize:10,textTransform:"uppercase",fontFamily:T.fM,letterSpacing:1.5,marginBottom:12,fontWeight:700}}>Estadísticas generales</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:2}}>{stats.map(([l,v])=>(<div key={l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid "+T.b1}}><span style={{color:T.t2,fontSize:13,fontFamily:T.fU}}>{l}</span><span style={{color:T.v,fontWeight:700,fontSize:13,fontFamily:T.fM}}>{v}</span></div>))}</div>
      </div>
      <div style={{background:T.bg2,border:"1px solid "+T.rg,borderRadius:16,padding:22}}>
        <div style={{color:T.r,fontSize:10,textTransform:"uppercase",fontFamily:T.fM,letterSpacing:1.5,marginBottom:10,fontWeight:700}}>Zona peligrosa</div>
        <p style={{color:T.t3,fontSize:13,fontFamily:T.fU,marginBottom:14,lineHeight:1.6}}>Borra permanentemente todos tus datos. Esta acción no se puede deshacer.</p>
        <button onClick={clearAll} style={{background:T.rl,border:"1px solid "+T.rg,color:T.r,borderRadius:9,padding:"9px 18px",cursor:"pointer",fontSize:13,fontFamily:T.fU,fontWeight:600}}>⚠ Borrar todos los datos</button>
      </div>
    </div>
  );
}

function CmdPalette({data,nav,onClose}){
  const[q,setQ]=useState("");const[sel,setSel]=useState(0);const ref=useRef(null);
  useEffect(()=>{ref.current?.focus();},[]);
  const BASE=[{icon:"⌂",l:"Inicio",a:()=>nav("home")},{icon:"◈",l:"Notas",a:()=>nav("notes")},{icon:"◉",l:"Tareas",a:()=>nav("tasks")},{icon:"▦",l:"Kanban",a:()=>nav("kanban")},{icon:"◫",l:"Calendario",a:()=>nav("calendar")},{icon:"◪",l:"Diario",a:()=>nav("journal")},{icon:"◐",l:"Hábitos",a:()=>nav("habits")},{icon:"⏱",l:"Pomodoro",a:()=>nav("pomodoro")},{icon:"◻",l:"Estadísticas",a:()=>nav("stats")},{icon:"◇",l:"Etiquetas",a:()=>nav("tags")},{icon:"⚙",l:"Ajustes",a:()=>nav("settings")},{icon:"✦",l:"Nueva nota",a:()=>nav("note/new"),sub:"Ctrl+N"},{icon:"✦",l:"Nueva tarea",a:()=>nav("tasks"),sub:"Ctrl+T"}];
  const results=useMemo(()=>{if(!q.trim())return BASE;const lq=q.toLowerCase();return[...BASE.filter(c=>c.l.toLowerCase().includes(lq)),...data.notes.filter(n=>!n.deleted&&(n.title.toLowerCase().includes(lq)||n.body.toLowerCase().includes(lq))).slice(0,6).map(n=>({icon:"◈",l:n.title,a:()=>nav("note/"+n.id),sub:n.body.replace(/[#*`>\-\[\]]/g,"").slice(0,50),dim:true})),...data.tasks.filter(t=>t.title.toLowerCase().includes(lq)).slice(0,4).map(t=>({icon:"◉",l:t.title,a:()=>nav("tasks"),sub:t.due?"📅 "+fmtD(t.due):"",dim:true}))];},[q,data]);
  useEffect(()=>setSel(0),[q]);
  const handleKey=(e)=>{if(e.key==="ArrowDown"){e.preventDefault();setSel(s=>Math.min(s+1,results.length-1));}if(e.key==="ArrowUp"){e.preventDefault();setSel(s=>Math.max(s-1,0));}if(e.key==="Enter"&&results[sel]){results[sel].a();onClose();}if(e.key==="Escape")onClose();};
  return(<div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:1000,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"10vh 16px 0",backdropFilter:"blur(6px)"}}><div onClick={e=>e.stopPropagation()} style={{background:T.bg2,border:"1px solid "+T.b2,borderRadius:18,width:"100%",maxWidth:540,boxShadow:"0 32px 96px rgba(0,0,0,0.6)",overflow:"hidden",animation:"popIn .18s ease"}}><div style={{display:"flex",alignItems:"center",gap:10,padding:"14px 18px",borderBottom:"1px solid "+T.b1}}><span style={{color:T.t4,fontSize:16}}>✦</span><input ref={ref} value={q} onChange={e=>setQ(e.target.value)} onKeyDown={handleKey} placeholder="Buscar notas, tareas, navegar a..." style={{flex:1,background:"none",border:"none",color:T.t1,fontSize:15,fontFamily:T.fU,outline:"none"}}/><button onClick={onClose} style={{background:T.bg3,border:"1px solid "+T.b1,color:T.t4,borderRadius:5,padding:"2px 8px",fontSize:10,fontFamily:T.fM,cursor:"pointer"}}>ESC</button></div><div style={{maxHeight:380,overflow:"auto"}}>{results.length===0?<div style={{padding:"28px",textAlign:"center",color:T.t4,fontSize:13,fontFamily:T.fU}}>Sin resultados</div>:results.map((r,i)=>(<button key={i} onClick={()=>{r.a();onClose();}} style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"11px 18px",background:sel===i?T.vl:"none",border:"none",borderLeft:"3px solid "+(sel===i?T.v:"transparent"),color:sel===i?T.v:T.t2,cursor:"pointer",textAlign:"left",fontFamily:T.fU,fontSize:14,transition:"background .1s"}} onMouseEnter={()=>setSel(i)}><span style={{fontSize:15,width:20,textAlign:"center",flexShrink:0,color:sel===i?T.v:T.t4}}>{r.icon}</span><div style={{flex:1,minWidth:0}}><div style={{color:sel===i?T.v:T.t1}}>{r.l}</div>{r.sub&&<div style={{color:T.t4,fontSize:11,marginTop:1,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{r.sub}</div>}</div>{sel===i&&<span style={{color:T.t4,fontSize:11,fontFamily:T.fM,flexShrink:0}}>↵</span>}</button>))}</div><div style={{padding:"8px 18px",borderTop:"1px solid "+T.b1,display:"flex",gap:14,color:T.t4,fontSize:10,fontFamily:T.fM}}><span>↑↓ navegar</span><span>↵ abrir</span><span>ESC cerrar</span></div></div></div>);
}

function getBreadcrumb(view,data){
  if(view==="home")return"⌂ Inicio";if(view==="notes")return"◈ Notas";
  if(view.startsWith("note/")){const n=data.notes.find(x=>x.id===view.slice(5));return"◈ "+(n?n.title:"Nueva nota");}
  if(view==="tasks")return"◉ Tareas";if(view==="kanban")return"▦ Kanban";if(view==="calendar")return"◫ Calendario";if(view==="journal")return"◪ Diario";if(view==="habits")return"◐ Hábitos";if(view==="pomodoro")return"⏱ Pomodoro";if(view==="stats")return"◻ Estadísticas";if(view==="tags")return"◇ Etiquetas";if(view==="settings")return"⚙ Ajustes";if(view==="trash")return"🗑 Papelera";
  if(view.startsWith("folder/")){const f=data.folders.find(x=>x.id===view.slice(7));return"📁 "+(f?f.name:"");}
  if(view.startsWith("notes/tag/"))return"#"+view.slice(10);
  return view;
}


// ── LOCAL API STORAGE ─────────────────────────────────────────────────────
// Saves data to ~/.flowspace/data.json via the local Express server
const api = {
  async load() {
    try {
      const res = await fetch('/api/data')
      const { data } = await res.json()
      return data
    } catch (e) {
      console.warn('Could not load data from server:', e)
      return null
    }
  },
  async save(data) {
    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      })
    } catch (e) {
      console.warn('Could not save data:', e)
    }
  }
}

export default function App() {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <FlowSpaceLocal />
      </ConfirmProvider>
    </ToastProvider>
  )
}

function FlowSpaceLocal() {
  const [data, setData] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [view, setView] = useState('home')
  const [side, setSide] = useState(true)
  const [cmd, setCmd] = useState(false)
  const [capture, setCapture] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const toast = useToast()
  const confirm = useConfirm()
  const saveTimer = useRef(null)

  // Load data on mount
  useEffect(() => {
    api.load().then(saved => {
      setData(saved || INIT)
      setLoaded(true)
    })
  }, [])

  // Save function — updates state + persists to disk (debounced 800ms)
  const save = useCallback((newData) => {
    setData(newData)
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      api.save(newData)
    }, 800)
  }, [])

  const nav = useCallback((v) => { setView(v); setCmd(false); setCapture(false) }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const h = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setCmd(v => !v) }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') { e.preventDefault(); nav('note/new') }
      if ((e.ctrlKey || e.metaKey) && e.key === 't') { e.preventDefault(); nav('tasks') }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === ' ') { e.preventDefault(); setCapture(v => !v) }
      if (e.key === 'Escape') { setCmd(false); setCapture(false); setShowImport(false) }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [nav])

  if (!loaded) return (
    <div style={{ height: '100vh', background: T.bg0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <style>{CSS}</style>
      <div style={{ width: 40, height: 40, border: '3px solid rgba(124,110,245,0.2)', borderTopColor: '#7C6EF5', borderRadius: 99, animation: 'spin .7s linear infinite' }} />
      <div style={{ color: T.t4, fontSize: 12, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Cargando FlowSpace...</div>
    </div>
  )

  const props = { data, save, nav, toast, confirm }

  const renderView = () => {
    if (view === 'home') return <Home {...props} />
    if (view === 'notes') return <NotesList {...props} />
    if (view.startsWith('note/')) return <NoteEditor noteId={view.slice(5)} {...props} />
    if (view.startsWith('folder/')) return <NotesList {...props} folderId={view.slice(7)} />
    if (view.startsWith('notes/tag/')) return <NotesList {...props} tagFilter={view.slice(10)} />
    if (view === 'trash') return <NotesList {...props} trash />
    if (view === 'tasks') return <Tasks {...props} />
    if (view === 'kanban') return <Kanban {...props} />
    if (view === 'calendar') return <CalendarView {...props} />
    if (view === 'journal') return <Journal {...props} />
    if (view === 'habits') return <Habits {...props} />
    if (view === 'pomodoro') return <Pomodoro {...props} />
    if (view === 'stats') return <Stats {...props} />
    if (view === 'tags') return <Tags {...props} />
    if (view === 'settings') return <Settings {...props} />
    return <Home {...props} />
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: T.bg0, fontFamily: T.fU, color: T.t1 }}>
      <style>{CSS}</style>
      {cmd && <CmdPalette data={data} nav={nav} onClose={() => setCmd(false)} />}
      {capture && <QuickCapture data={data} save={save} nav={nav} onClose={() => setCapture(false)} toast={toast} />}
      {showImport && <ImportURLModal data={data} save={save} nav={nav} onClose={() => setShowImport(false)} toast={toast} />}
      <Sidebar view={view} nav={nav} data={data} save={save} open={side} toast={toast} confirm={confirm} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Topbar */}
        <div style={{ height: 46, background: T.bg1, borderBottom: '1px solid ' + T.b1, display: 'flex', alignItems: 'center', padding: '0 14px', gap: 8, flexShrink: 0 }}>
          <button onClick={() => setSide(v => !v)} style={{ background: 'none', border: '1px solid ' + T.b1, color: T.t3, borderRadius: 7, width: 28, height: 28, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>☰</button>
          <div style={{ color: T.t3, fontSize: 13, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{getBreadcrumb(view, data)}</div>
          <div style={{ padding: '3px 10px', borderRadius: 6, background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.22)', color: T.g, fontSize: 10, fontFamily: T.fM }}>● Local</div>
          <button onClick={() => setShowImport(true)} style={{ background: T.bg3, border: '1px solid ' + T.b1, color: T.b, borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontSize: 12, fontFamily: T.fU }}>🌐 URL</button>
          <button onClick={() => setCapture(true)} style={{ background: T.bg3, border: '1px solid ' + T.b1, color: T.t3, borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontSize: 12, fontFamily: T.fU }}>⚡ Capturar</button>
          <button onClick={() => setCmd(true)} style={{ background: T.bg3, border: '1px solid ' + T.b1, color: T.t3, borderRadius: 8, padding: '4px 12px', cursor: 'pointer', fontSize: 12, fontFamily: T.fU, display: 'flex', alignItems: 'center', gap: 6 }}>✦ Buscar<span style={{ background: T.bg4, border: '1px solid ' + T.b1, color: T.t4, borderRadius: 4, padding: '1px 5px', fontSize: 9, fontFamily: T.fM }}>⌘K</span></button>
          <button onClick={() => nav('note/new')} style={{ background: T.v, border: 'none', color: '#fff', borderRadius: 9, padding: '6px 14px', cursor: 'pointer', fontSize: 12, fontFamily: T.fU, fontWeight: 700, flexShrink: 0 }}>✦ Nota</button>
        </div>
        <div key={view} style={{ flex: 1, overflow: 'hidden', animation: 'fadeUp .24s ease' }}>{renderView()}</div>
      </div>
    </div>
  )
}
