import { useState, useEffect, useCallback } from "react";

function createClient(url, key) {
  const h = { apikey:key, Authorization:`Bearer ${key}`, "Content-Type":"application/json", Prefer:"return=representation" };
  const base = `${url}/rest/v1`;
  const req = async (path, opts={}) => {
    try {
      const r = await fetch(`${base}${path}`, {...opts, headers:h});
      let data = null;
      try { data = await r.json(); } catch(_) {}
      return { data: Array.isArray(data)?data:data?[data]:[], error: r.ok?null:data };
    } catch(e) { return { data:[], error:{message:e.message} }; }
  };
  return {
    from: t => ({
      select: (q="") => req(`/${t}?select=*${q}`),
      insert: row => req(`/${t}`, {method:"POST", body:JSON.stringify(row)}),
      update: (id,row) => req(`/${t}?id=eq.${id}`, {method:"PATCH", body:JSON.stringify(row)}),
      delete: id => req(`/${t}?id=eq.${id}`, {method:"DELETE"}),
      filter: (col,val) => req(`/${t}?select=*&${col}=eq.${encodeURIComponent(val)}`),
    }),
    storage: {
      upload: async (bucket, path, file) => {
        try {
          const r = await fetch(`${url}/storage/v1/object/${bucket}/${path}`, {
            method:"POST", body:file,
            headers:{apikey:key, Authorization:`Bearer ${key}`, "Content-Type":file.type, "x-upsert":"true"}
          });
          const txt = await r.text();
          let d={}; try{d=JSON.parse(txt);}catch(_){}
          if(r.ok) return {data:d,error:null};
          const r2 = await fetch(`${url}/storage/v1/object/${bucket}/${path}`, {
            method:"PUT", body:file,
            headers:{apikey:key, Authorization:`Bearer ${key}`, "Content-Type":file.type, "x-upsert":"true"}
          });
          const txt2=await r2.text(); let d2={}; try{d2=JSON.parse(txt2);}catch(_){}
          return r2.ok?{data:d2,error:null}:{data:null,error:{message:`${r2.status}: ${txt2}`}};
        } catch(e) { return {data:null,error:{message:e.message}}; }
      },
      getPublicUrl: (bucket,path) => `${url}/storage/v1/object/public/${bucket}/${path}`,
    },
  };
}

const bg="#fafaf9", surf="#ffffff", surf2="#f4f4f2", surf3="#edede9";
const bdr="#e8e8e4", bdr2="#d4d4cf";
const txt="#111110", mut="#a0a09a", mut2="#6b6b66";
const acc="#c49a3c", grn="#1a7a4a", red="#c13333";

const inp={width:"100%",padding:"9px 12px",background:surf,border:`1.5px solid ${bdr}`,borderRadius:8,color:txt,fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:12,fontFamily:"inherit"};
const pbtn={display:"inline-flex",alignItems:"center",gap:6,padding:"9px 18px",borderRadius:8,border:`1.5px solid ${txt}`,cursor:"pointer",fontSize:13,fontWeight:600,background:txt,color:"#fff",letterSpacing:"0.01em"};
const gbtn={...pbtn,background:surf,color:mut2,border:`1.5px solid ${bdr}`};
const dbtn={...pbtn,background:surf,color:red,border:`1.5px solid ${bdr}`};

function lbl(t){return <div style={{fontSize:11,color:mut,fontWeight:600,letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:5}}>{t}</div>;}
function inrFmt(v){if(v>=100000)return"₹"+(v/100000).toFixed(1)+"L";if(v>=1000)return"₹"+(v/1000).toFixed(1)+"K";return"₹"+Math.round(v).toLocaleString("en-IN");}
function ordinal(n){const s=["th","st","nd","rd"],v=n%100;return n+(s[(v-20)%10]||s[v]||s[0]);}

function Modal({show,onClose,title,children,wide=false}){
  if(!show) return null;
  return(
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{position:"fixed",inset:0,background:"rgba(17,17,16,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,padding:20,backdropFilter:"blur(3px)"}}>
      <div style={{background:surf,border:`1.5px solid ${bdr}`,borderRadius:14,padding:24,width:"100%",maxWidth:wide?640:480,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 16px 48px rgba(17,17,16,0.12)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <span style={{fontSize:16,fontWeight:700,color:txt}}>{title}</span>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:mut,fontSize:20,lineHeight:1,padding:"0 4px"}}>x</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Card({children,style={}}){
  return <div style={{background:surf,border:`1px solid ${bdr}`,borderRadius:12,padding:"18px 20px",boxShadow:"0 1px 3px rgba(0,0,0,0.04)",...style}}>{children}</div>;
}

function Hdr({title,sub,action}){
  return(
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}}>
      <div>
        <div style={{fontSize:26,fontWeight:800,color:txt,letterSpacing:"-0.03em"}}>{title}</div>
        {sub&&<div style={{fontSize:13,color:mut,marginTop:4}}>{sub}</div>}
      </div>
      {action}
    </div>
  );
}

function LogoCircle({url,name,size=40}){
  const [err,setErr]=useState(false);
  const init=(name||"?").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  if(url&&url.length>10&&!err) return(
    <div style={{width:size,height:size,borderRadius:size*0.22,overflow:"hidden",flexShrink:0,border:`1px solid ${bdr}`,background:surf2}}>
      <img src={url} alt={name||""} style={{width:"100%",height:"100%",objectFit:"contain",padding:size*0.08,display:"block"}} onError={()=>setErr(true)}/>
    </div>
  );
  return(
    <div style={{width:size,height:size,borderRadius:size*0.22,background:acc+"18",border:`1.5px solid ${acc}33`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
      <span style={{fontSize:size*0.32,fontWeight:700,color:acc,lineHeight:1}}>{init}</span>
    </div>
  );
}

function LogoUpload({current,onUpload}){
  const handleFile=f=>{
    if(!f) return;
    if(!f.type.startsWith("image/")) return alert("Please upload an image file");
    if(f.size>2000000) return alert("Max 2MB");
    const r=new FileReader(); r.onload=e=>onUpload(f,e.target.result); r.readAsDataURL(f);
  };
  return(
    <div style={{marginBottom:12}}>
      {lbl("Logo (optional)")}
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:52,height:52,borderRadius:10,border:`2px dashed ${bdr2}`,background:surf2,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0}}>
          {current?<img src={current} style={{width:"100%",height:"100%",objectFit:"contain"}}/>:<span style={{fontSize:20}}>img</span>}
        </div>
        <label style={{...gbtn,padding:"6px 14px",fontSize:12,cursor:"pointer"}}>
          {current?"Change":"Upload"} Logo
          <input type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>
        </label>
        {current&&<button style={{...dbtn,padding:"6px 12px",fontSize:12}} onClick={()=>onUpload(null,null)}>Remove</button>}
      </div>
    </div>
  );
}

function Empty({icon="o",msg}){
  return <div style={{textAlign:"center",padding:"48px 20px",color:mut}}><div style={{fontSize:28,marginBottom:8}}>{icon}</div><div style={{fontSize:13}}>{msg}</div></div>;
}

// Setup
function Setup({onDone}){
  const [url,setUrl]=useState(""); const [key,setKey]=useState(""); const [msg,setMsg]=useState("");
  const go=async()=>{
    if(!url||!key) return setMsg("Both fields required");
    const u=url.trim().replace(/\/+$/,"").replace(/\/rest\/v1\/?$/,""), k=key.trim();
    try{const r=await fetch(`${u}/rest/v1/owners?select=id&limit=1`,{headers:{apikey:k,Authorization:`Bearer ${k}`}});if(r.status===401||r.status===403) return setMsg("Invalid key");}catch(_){}
    localStorage.setItem("pv_u",u); localStorage.setItem("pv_k",k); onDone(createClient(u,k));
  };
  return(
    <div style={{minHeight:"100vh",background:`linear-gradient(135deg,${bg},#f0ede8)`,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"Inter,system-ui,sans-serif"}}>
      <div style={{maxWidth:420,width:"100%"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontSize:28,fontWeight:900,color:txt,letterSpacing:"-0.04em"}}>PointsVault</div>
          <div style={{fontSize:13,color:mut,marginTop:6}}>Your loyalty and rewards dashboard</div>
        </div>
        <Card style={{padding:28}}>
          {lbl("Supabase Project URL")}<input style={inp} placeholder="https://xxxx.supabase.co" value={url} onChange={e=>setUrl(e.target.value)}/>
          {lbl("Anon Public Key")}<input style={inp} type="password" placeholder="eyJ..." value={key} onChange={e=>setKey(e.target.value)}/>
          {msg&&<div style={{color:red,fontSize:12,marginBottom:12,padding:"8px 12px",background:"#fef2f2",borderRadius:8}}>{msg}</div>}
          <button style={{...pbtn,width:"100%",justifyContent:"center",padding:"11px"}} onClick={go}>Connect</button>
        </Card>
      </div>
    </div>
  );
}

// Overview
function Overview({db,owners,onNavigate}){
  const [cards,setCards]=useState([]);
  const [progs,setProgs]=useState([]);
  const [mc,setMc]=useState([]);
  const [mp,setMp]=useState([]);
  const [transfers,setTransfers]=useState([]);
  const [vouchers,setVouchers]=useState([]);
  const [busy,setBusy]=useState(true);
  const [ownerF,setOwnerF]=useState("all");
  const [catF,setCatF]=useState("all");

  useEffect(()=>{
    (async()=>{
      setBusy(true);
      const [c,p,mca,mpa,tr,v]=await Promise.all([
        db.from("my_cards").select(),db.from("my_programs").select(),
        db.from("master_cards").select(),db.from("master_programs").select(),
        db.from("transfer_log").select(),db.from("vouchers").select(),
      ]);
      setCards(c.data||[]); setProgs(p.data||[]);
      setMc(mca.data||[]); setMp(mpa.data||[]);
      setTransfers((tr.data||[]).sort((a,b)=>new Date(b.transfer_date)-new Date(a.transfer_date)));
      setVouchers(v.data||[]);
      setBusy(false);
    })();
  },[]);

  const gmc=id=>mc.find(m=>m.id===id);
  const gmp=id=>mp.find(m=>m.id===id);
  const own=id=>owners.find(o=>o.id===id)?.name||"";

  const fCards=cards.filter(c=>{
    if(ownerF!=="all"&&c.owner_id!==ownerF) return false;
    if(catF!=="all"&&catF!=="cc") return false;
    return true;
  });
  const fProgs=progs.filter(p=>{
    if(ownerF!=="all"&&p.owner_id!==ownerF) return false;
    const m=gmp(p.master_id);
    if(catF==="cc") return false;
    if(catF!=="all"&&m?.category!==catF) return false;
    return true;
  });

  const tCP=fCards.reduce((a,c)=>a+(c.points_balance||0),0);
  const tPP=fProgs.reduce((a,p)=>a+(p.points_balance||0),0);
  const cInr=fCards.reduce((a,c)=>a+(c.points_balance||0)*(gmc(c.master_id)?.inr_per_point||0),0);
  const pInr=fProgs.reduce((a,p)=>a+(p.points_balance||0)*(gmp(p.master_id)?.inr_per_point||0),0);
  const tInr=cInr+pInr;
  const actV=vouchers.filter(v=>!v.redeemed&&(ownerF==="all"||v.owner_id===ownerF)).length;

  if(busy) return <div style={{color:mut,padding:60,textAlign:"center"}}>Loading...</div>;

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24,flexWrap:"wrap",gap:12}}>
        <div>
          <div style={{fontSize:26,fontWeight:800,color:txt,letterSpacing:"-0.03em"}}>Overview</div>
          <div style={{fontSize:13,color:mut,marginTop:4}}>Your points and rewards at a glance</div>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <select style={{...inp,marginBottom:0,width:"auto",fontSize:12,padding:"6px 10px"}} value={ownerF} onChange={e=>setOwnerF(e.target.value)}>
            <option value="all">All Owners</option>
            {owners.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
          <select style={{...inp,marginBottom:0,width:"auto",fontSize:12,padding:"6px 10px"}} value={catF} onChange={e=>setCatF(e.target.value)}>
            <option value="all">All Categories</option>
            <option value="cc">Credit Cards</option>
            {["Airline","Hotel","Retail","Dining","Fuel","Other"].map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:12,marginBottom:24}}>
        <div style={{background:txt,borderRadius:12,padding:"18px 20px",color:"#fff",position:"relative",overflow:"hidden"}}>
          <div style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.5)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>CC Rewards</div>
          <div style={{fontSize:26,fontWeight:800,letterSpacing:"-0.03em"}}>{tCP.toLocaleString("en-IN")}</div>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.45)",marginTop:4}}>{fCards.length} cards{cInr>0&&" | "+inrFmt(cInr)}</div>
          <button onClick={()=>onNavigate("my-cards")} style={{marginTop:10,background:"rgba(255,255,255,0.15)",border:"none",cursor:"pointer",fontSize:11,color:"#fff",fontWeight:600,padding:"4px 10px",borderRadius:6}}>View All</button>
        </div>
        <div style={{background:acc,borderRadius:12,padding:"18px 20px",color:"#fff",position:"relative",overflow:"hidden"}}>
          <div style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.6)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>Loyalty Points</div>
          <div style={{fontSize:26,fontWeight:800,letterSpacing:"-0.03em"}}>{tPP.toLocaleString("en-IN")}</div>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.6)",marginTop:4}}>{fProgs.length} programs{pInr>0&&" | "+inrFmt(pInr)}</div>
          <button onClick={()=>onNavigate("my-programs")} style={{marginTop:10,background:"rgba(255,255,255,0.2)",border:"none",cursor:"pointer",fontSize:11,color:"#fff",fontWeight:600,padding:"4px 10px",borderRadius:6}}>View All</button>
        </div>
        <Card>
          <div style={{fontSize:10,fontWeight:600,color:mut,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>Portfolio Value</div>
          <div style={{fontSize:26,fontWeight:800,color:tInr>0?grn:txt,letterSpacing:"-0.03em"}}>{tInr>0?inrFmt(tInr):"--"}</div>
          <div style={{fontSize:11,color:mut,marginTop:4}}>{(tCP+tPP).toLocaleString("en-IN")} total pts</div>
        </Card>
        <Card>
          <div style={{fontSize:10,fontWeight:600,color:mut,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>Vouchers</div>
          <div style={{fontSize:26,fontWeight:800,color:txt,letterSpacing:"-0.03em"}}>{actV}</div>
          <div style={{fontSize:11,color:mut,marginTop:4}}>active</div>
          <button onClick={()=>onNavigate("vouchers")} style={{marginTop:10,background:surf2,border:"none",cursor:"pointer",fontSize:11,color:mut2,fontWeight:600,padding:"4px 10px",borderRadius:6}}>View All</button>
        </Card>
      </div>

      {fProgs.filter(p=>{ const d=p.expiry_date?Math.round((new Date(p.expiry_date)-new Date())/86400000):null; return d!==null&&d<=30; }).map(p=>{
        const m=gmp(p.master_id); const d=Math.round((new Date(p.expiry_date)-new Date())/86400000);
        return(<div key={p.id} style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:10,padding:"12px 16px",marginBottom:12,display:"flex",gap:10,alignItems:"center"}}>
          <span>Warning</span>
          <div style={{fontSize:13,color:"#92400e"}}><strong>{p.nickname||m?.name}</strong> - {(p.points_balance||0).toLocaleString()} pts expiring in <strong>{d} days</strong></div>
        </div>);
      })}

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:700,color:mut,textTransform:"uppercase",letterSpacing:"0.08em"}}>Loyalty Programs</div>
            <button onClick={()=>onNavigate("my-programs")} style={{background:"none",border:"none",cursor:"pointer",fontSize:11,color:acc,fontWeight:600,padding:0}}>View All</button>
          </div>
          {fProgs.length===0?<div style={{color:mut,fontSize:13,textAlign:"center",padding:"16px 0"}}>No programs yet</div>:
            [...fProgs].sort((a,b)=>(b.points_balance||0)-(a.points_balance||0)).slice(0,5).map(p=>{
              const m=gmp(p.master_id); const iv=(p.points_balance||0)*(m?.inr_per_point||0);
              return(<div key={p.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 0",borderBottom:`1px solid ${bdr}`}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <LogoCircle url={m?.logo_url} name={m?.name} size={36}/>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:txt}}>{p.nickname||m?.name}</div>
                    <div style={{fontSize:11,color:mut}}>{own(p.owner_id)}{p.tier&&" | "+p.tier}</div>
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:13,fontWeight:700,color:txt}}>{(p.points_balance||0).toLocaleString("en-IN")}</div>
                  {iv>0&&<div style={{fontSize:11,color:grn}}>{inrFmt(iv)}</div>}
                </div>
              </div>);
            })
          }
        </Card>
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:700,color:mut,textTransform:"uppercase",letterSpacing:"0.08em"}}>Credit Cards</div>
            <button onClick={()=>onNavigate("my-cards")} style={{background:"none",border:"none",cursor:"pointer",fontSize:11,color:acc,fontWeight:600,padding:0}}>View All</button>
          </div>
          {fCards.length===0?<div style={{color:mut,fontSize:13,textAlign:"center",padding:"16px 0"}}>No cards yet</div>:
            [...fCards].sort((a,b)=>(b.points_balance||0)-(a.points_balance||0)).slice(0,5).map(c=>{
              const m=gmc(c.master_id); const iv=(c.points_balance||0)*(m?.inr_per_point||0);
              return(<div key={c.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 0",borderBottom:`1px solid ${bdr}`}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <LogoCircle url={m?.logo_url} name={m?.name} size={36}/>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:txt}}>{c.nickname||m?.name}{c.last4&&<span style={{color:mut,fontWeight:400}}> .... {c.last4}</span>}</div>
                    <div style={{fontSize:11,color:mut}}>{own(c.owner_id)}{m?.network&&" | "+m.network}</div>
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:13,fontWeight:700,color:txt}}>{(c.points_balance||0).toLocaleString("en-IN")}</div>
                  {iv>0&&<div style={{fontSize:11,color:grn}}>{inrFmt(iv)}</div>}
                </div>
              </div>);
            })
          }
        </Card>
      </div>

      {transfers.length>0&&(
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:700,color:mut,textTransform:"uppercase",letterSpacing:"0.08em"}}>Recent Transfers</div>
            <button onClick={()=>onNavigate("transfer-history")} style={{background:"none",border:"none",cursor:"pointer",fontSize:11,color:acc,fontWeight:600,padding:0}}>View All</button>
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr style={{color:mut,fontSize:10,textTransform:"uppercase",letterSpacing:"0.07em",borderBottom:`1.5px solid ${bdr}`}}>
                {["Date","From","To","Sent","Received"].map(h=><th key={h} style={{padding:"6px 10px",textAlign:h==="Sent"||h==="Received"?"right":"left",fontWeight:600}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {transfers.slice(0,5).map(t=>(
                  <tr key={t.id} style={{borderBottom:`1px solid ${bdr}`}}>
                    <td style={{padding:"9px 10px",color:mut,whiteSpace:"nowrap"}}>{new Date(t.transfer_date).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</td>
                    <td style={{padding:"9px 10px",color:txt,fontWeight:500}}>{t.from_name||"--"}</td>
                    <td style={{padding:"9px 10px",color:txt,fontWeight:500}}>{t.to_name||"--"}</td>
                    <td style={{padding:"9px 10px",textAlign:"right",fontWeight:600,color:red}}>{(t.points_sent||0).toLocaleString()}</td>
                    <td style={{padding:"9px 10px",textAlign:"right",fontWeight:600,color:grn}}>{((t.points_received||0)+(t.bonus_miles||0)).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

// Catalog
function Catalog({db}){
  const [tab,setTab]=useState("cards");
  const [mCards,setMCards]=useState([]);
  const [mProgs,setMProgs]=useState([]);
  const [mParts,setMParts]=useState([]);
  const [busy,setBusy]=useState(true);
  const [showCard,setShowCard]=useState(false);
  const [showProg,setShowProg]=useState(false);
  const [showPart,setShowPart]=useState(false);
  const [editItem,setEditItem]=useState(null);
  const [logoFile,setLogoFile]=useState(null);
  const [logoPrev,setLogoPrev]=useState(null);
  const eCard={name:"",bank:"",network:"Visa",points_currency:"pts",inr_per_point:"",annual_fee:""};
  const eProg={name:"",category:"Airline",inr_per_point:"",expiry_rule:""};
  const ePart={from_id:"",from_type:"card",to_id:"",to_type:"program",ratio_from:"1",ratio_to:"1",min_transfer:"",max_monthly:"",transfer_time:"",notes:""};
  const [fC,setFC]=useState(eCard);
  const [fP,setFP]=useState(eProg);
  const [fPt,setFPt]=useState(ePart);
  const ucC=k=>e=>setFC(p=>({...p,[k]:e.target.value}));
  const ucP=k=>e=>setFP(p=>({...p,[k]:e.target.value}));
  const ucPt=k=>e=>setFPt(p=>({...p,[k]:e.target.value}));
  const nets=["Visa","Mastercard","Amex","Diners","RuPay","Other"];
  const cats=["Airline","Hotel","Retail","Dining","Fuel","Other"];

  const load=useCallback(async()=>{
    setBusy(true);
    const [a,b,c]=await Promise.all([db.from("master_cards").select(),db.from("master_programs").select(),db.from("master_partners").select()]);
    setMCards(a.data||[]); setMProgs(b.data||[]); setMParts(c.data||[]);
    setBusy(false);
  },[db]);
  useEffect(()=>{load();},[load]);

  const upLogo=async(type,id)=>{
    if(!logoFile) return null;
    const path=`${type}/${id}-${Date.now()}.${logoFile.name.split(".").pop()}`;
    const {error,data}=await db.storage.upload("logos",path,logoFile);
    if(error){alert("Logo upload failed: "+error.message);return null;}
    return db.storage.getPublicUrl("logos",path);
  };

  const saveCard=async()=>{
    if(!fC.name.trim()) return alert("Name required");
    const p={name:fC.name.trim(),bank:fC.bank,network:fC.network,points_currency:fC.points_currency,inr_per_point:parseFloat(fC.inr_per_point)||0,annual_fee:parseFloat(fC.annual_fee)||0};
    if(editItem){
      let logo_url=editItem.logo_url;
      if(logoFile){const u=await upLogo("cards",editItem.id);if(u) logo_url=u;}
      else if(logoPrev===null) logo_url=null;
      await db.from("master_cards").update(editItem.id,{...p,logo_url});
    } else {
      const {data}=await db.from("master_cards").insert(p);
      if(data&&data[0]&&logoFile){const u=await upLogo("cards",data[0].id);if(u) await db.from("master_cards").update(data[0].id,{logo_url:u});}
    }
    setShowCard(false);setEditItem(null);setLogoFile(null);setLogoPrev(null);load();
  };

  const saveProg=async()=>{
    if(!fP.name.trim()) return alert("Name required");
    const p={name:fP.name.trim(),category:fP.category,inr_per_point:parseFloat(fP.inr_per_point)||0,expiry_rule:fP.expiry_rule};
    if(editItem){
      let logo_url=editItem.logo_url;
      if(logoFile){const u=await upLogo("programs",editItem.id);if(u) logo_url=u;}
      else if(logoPrev===null) logo_url=null;
      await db.from("master_programs").update(editItem.id,{...p,logo_url});
    } else {
      const {data}=await db.from("master_programs").insert(p);
      if(data&&data[0]&&logoFile){const u=await upLogo("programs",data[0].id);if(u) await db.from("master_programs").update(data[0].id,{logo_url:u});}
    }
    setShowProg(false);setEditItem(null);setLogoFile(null);setLogoPrev(null);load();
  };

  const savePart=async()=>{
    if(!fPt.from_id||!fPt.to_id) return alert("Select both programs");
    const p={from_id:fPt.from_id,from_type:fPt.from_type,to_id:fPt.to_id,to_type:fPt.to_type,ratio_from:parseFloat(fPt.ratio_from)||1,ratio_to:parseFloat(fPt.ratio_to)||1,min_transfer:parseInt(fPt.min_transfer)||null,max_monthly:parseInt(fPt.max_monthly)||null,transfer_time:fPt.transfer_time,notes:fPt.notes};
    if(editItem) await db.from("master_partners").update(editItem.id,p);
    else await db.from("master_partners").insert(p);
    setShowPart(false);setEditItem(null);load();
  };

  const delCard=async id=>{if(confirm("Delete?")){await db.from("master_cards").delete(id);load();}};
  const delProg=async id=>{if(confirm("Delete?")){await db.from("master_programs").delete(id);load();}};
  const delPart=async id=>{if(confirm("Delete?")){await db.from("master_partners").delete(id);load();}};
  const gName=(type,id)=>type==="card"?mCards.find(m=>m.id===id)?.name||"--":mProgs.find(m=>m.id===id)?.name||"--";
  const gLogo=(type,id)=>type==="card"?mCards.find(m=>m.id===id)?.logo_url:mProgs.find(m=>m.id===id)?.logo_url;
  const tb=t=>({padding:"8px 16px",borderRadius:8,border:`1px solid ${tab===t?txt:bdr}`,cursor:"pointer",fontSize:12,fontWeight:tab===t?600:400,background:tab===t?txt:"transparent",color:tab===t?"#fff":mut2,transition:"all 0.15s"});

  return(
    <div>
      <Hdr title="Catalog" sub="Master cards, programs and transfer partners"/>
      <div style={{display:"flex",gap:8,marginBottom:24}}>
        <button style={tb("cards")} onClick={()=>setTab("cards")}>Master Cards</button>
        <button style={tb("programs")} onClick={()=>setTab("programs")}>Master Programs</button>
        <button style={tb("partners")} onClick={()=>setTab("partners")}>Transfer Partners</button>
      </div>
      {busy?<div style={{color:mut,textAlign:"center",padding:40}}>Loading...</div>:(
        <>
        {tab==="cards"&&(
          <div>
            <div style={{display:"flex",justifyContent:"flex-end",marginBottom:16}}>
              <button style={pbtn} onClick={()=>{setEditItem(null);setFC(eCard);setLogoFile(null);setLogoPrev(null);setShowCard(true);}}>+ Add Master Card</button>
            </div>
            {mCards.length===0?<Empty icon="CC" msg="No master cards yet"/>:(
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
                {mCards.map(c=>(
                  <Card key={c.id} style={{borderTop:`2px solid ${acc}`,position:"relative"}}>
                    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                      <LogoCircle url={c.logo_url} name={c.name} size={44}/>
                      <div>
                        <div style={{fontSize:15,fontWeight:700,color:txt}}>{c.name}</div>
                        <div style={{fontSize:12,color:mut}}>{c.bank&&c.bank+" | "}{c.network}</div>
                      </div>
                    </div>
                    <div style={{fontSize:12,color:mut}}>{c.points_currency||"pts"}{c.inr_per_point>0&&" | Rs"+c.inr_per_point+"/pt"}{c.annual_fee>0&&" | Rs"+Number(c.annual_fee).toLocaleString()+" fee"}</div>
                    <div style={{position:"absolute",top:12,right:12,display:"flex",gap:4}}>
                      <button style={{...gbtn,padding:"4px 8px",fontSize:11}} onClick={()=>{setEditItem(c);setFC({name:c.name,bank:c.bank||"",network:c.network||"Visa",points_currency:c.points_currency||"pts",inr_per_point:String(c.inr_per_point||""),annual_fee:String(c.annual_fee||"")});setLogoFile(null);setLogoPrev(c.logo_url);setShowCard(true);}}>Edit</button>
                      <button style={{...dbtn,padding:"4px 8px",fontSize:11}} onClick={()=>delCard(c.id)}>Del</button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
        {tab==="programs"&&(
          <div>
            <div style={{display:"flex",justifyContent:"flex-end",marginBottom:16}}>
              <button style={pbtn} onClick={()=>{setEditItem(null);setFP(eProg);setLogoFile(null);setLogoPrev(null);setShowProg(true);}}>+ Add Master Program</button>
            </div>
            {mProgs.length===0?<Empty icon="LP" msg="No master programs yet"/>:(
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
                {mProgs.map(p=>(
                  <Card key={p.id} style={{borderTop:`2px solid ${acc}`,position:"relative"}}>
                    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                      <LogoCircle url={p.logo_url} name={p.name} size={44}/>
                      <div>
                        <div style={{fontSize:15,fontWeight:700,color:txt}}>{p.name}</div>
                        <div style={{fontSize:12,color:mut}}>{p.category}</div>
                      </div>
                    </div>
                    <div style={{fontSize:12,color:mut}}>{p.inr_per_point>0&&"Rs"+p.inr_per_point+"/pt"}{p.expiry_rule&&" | "+p.expiry_rule}</div>
                    <div style={{position:"absolute",top:12,right:12,display:"flex",gap:4}}>
                      <button style={{...gbtn,padding:"4px 8px",fontSize:11}} onClick={()=>{setEditItem(p);setFP({name:p.name,category:p.category||"Airline",inr_per_point:String(p.inr_per_point||""),expiry_rule:p.expiry_rule||""});setLogoFile(null);setLogoPrev(p.logo_url);setShowProg(true);}}>Edit</button>
                      <button style={{...dbtn,padding:"4px 8px",fontSize:11}} onClick={()=>delProg(p.id)}>Del</button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
        {tab==="partners"&&(
          <div>
            <div style={{display:"flex",justifyContent:"flex-end",marginBottom:16}}>
              <button style={pbtn} onClick={()=>{setEditItem(null);setFPt(ePart);setShowPart(true);}}>+ Add Route</button>
            </div>
            {mParts.length===0?<Empty icon="->-" msg="No transfer routes yet"/>:(
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {mParts.map(p=>(
                  <Card key={p.id}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <LogoCircle url={gLogo(p.from_type,p.from_id)} name={gName(p.from_type,p.from_id)} size={36}/>
                        <div>
                          <div style={{fontSize:13,fontWeight:600,color:txt}}>{gName(p.from_type,p.from_id)}</div>
                          <div style={{fontSize:11,color:mut}}>{p.from_type==="card"?"Credit Card":"Loyalty Program"}</div>
                        </div>
                        <div style={{fontSize:16,color:mut,padding:"0 6px"}}>{"→"}</div>
                        <LogoCircle url={gLogo(p.to_type,p.to_id)} name={gName(p.to_type,p.to_id)} size={36}/>
                        <div>
                          <div style={{fontSize:13,fontWeight:600,color:txt}}>{gName(p.to_type,p.to_id)}</div>
                          <div style={{fontSize:11,color:mut}}>{p.to_type==="card"?"Credit Card":"Loyalty Program"}</div>
                        </div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:14}}>
                        <div style={{textAlign:"center"}}><div style={{fontSize:16,fontWeight:800,color:acc}}>{p.ratio_from}:{p.ratio_to}</div><div style={{fontSize:10,color:mut,textTransform:"uppercase"}}>Ratio</div></div>
                        {p.min_transfer&&<div style={{textAlign:"center"}}><div style={{fontSize:13,fontWeight:600,color:txt}}>{Number(p.min_transfer).toLocaleString()}</div><div style={{fontSize:10,color:mut,textTransform:"uppercase"}}>Min</div></div>}
                        {p.transfer_time&&<div style={{textAlign:"center"}}><div style={{fontSize:13,fontWeight:600,color:grn}}>{p.transfer_time}</div><div style={{fontSize:10,color:mut,textTransform:"uppercase"}}>Time</div></div>}
                        <div style={{display:"flex",gap:4}}>
                          <button style={{...gbtn,padding:"5px 8px",fontSize:11}} onClick={()=>{setEditItem(p);setFPt({from_id:p.from_id,from_type:p.from_type,to_id:p.to_id,to_type:p.to_type,ratio_from:String(p.ratio_from||1),ratio_to:String(p.ratio_to||1),min_transfer:String(p.min_transfer||""),max_monthly:String(p.max_monthly||""),transfer_time:p.transfer_time||"",notes:p.notes||""});setShowPart(true);}}>Edit</button>
                          <button style={{...dbtn,padding:"5px 8px",fontSize:11}} onClick={()=>delPart(p.id)}>Del</button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
        </>
      )}

      <Modal show={showCard} onClose={()=>{setShowCard(false);setEditItem(null);setLogoFile(null);setLogoPrev(null);}} title={editItem?"Edit Master Card":"Add Master Card"}>
        <LogoUpload current={logoPrev} onUpload={(f,p)=>{setLogoFile(f);setLogoPrev(p);}}/>
        {lbl("Card Name *")}<input style={inp} placeholder="HDFC Infinia" value={fC.name} onChange={ucC("name")}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Bank")}<input style={inp} placeholder="HDFC" value={fC.bank} onChange={ucC("bank")}/></div>
          <div>{lbl("Network")}<select style={inp} value={fC.network} onChange={ucC("network")}>{nets.map(n=><option key={n}>{n}</option>)}</select></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Points Unit")}<input style={inp} placeholder="pts / miles" value={fC.points_currency} onChange={ucC("points_currency")}/></div>
          <div>{lbl("INR per Point")}<input style={inp} type="number" step="0.01" placeholder="0.25" value={fC.inr_per_point} onChange={ucC("inr_per_point")}/></div>
        </div>
        {lbl("Annual Fee (Rs)")}<input style={inp} type="number" placeholder="0" value={fC.annual_fee} onChange={ucC("annual_fee")}/>
        <button style={{...pbtn,width:"100%",justifyContent:"center",marginTop:4}} onClick={saveCard}>{editItem?"Save Changes":"Add Card"}</button>
      </Modal>

      <Modal show={showProg} onClose={()=>{setShowProg(false);setEditItem(null);setLogoFile(null);setLogoPrev(null);}} title={editItem?"Edit Master Program":"Add Master Program"}>
        <LogoUpload current={logoPrev} onUpload={(f,p)=>{setLogoFile(f);setLogoPrev(p);}}/>
        {lbl("Program Name *")}<input style={inp} placeholder="Air India Flying Returns" value={fP.name} onChange={ucP("name")}/>
        {lbl("Category")}<select style={inp} value={fP.category} onChange={ucP("category")}>{cats.map(c=><option key={c}>{c}</option>)}</select>
        {lbl("INR per Point")}<input style={inp} type="number" step="0.01" placeholder="0.50" value={fP.inr_per_point} onChange={ucP("inr_per_point")}/>
        {lbl("Expiry Rule")}<input style={inp} placeholder="Points expire 3 years from earn date" value={fP.expiry_rule} onChange={ucP("expiry_rule")}/>
        <button style={{...pbtn,width:"100%",justifyContent:"center",marginTop:4}} onClick={saveProg}>{editItem?"Save Changes":"Add Program"}</button>
      </Modal>

      <Modal show={showPart} onClose={()=>{setShowPart(false);setEditItem(null);}} title={editItem?"Edit Route":"Add Transfer Route"} wide>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
          <div style={{background:acc+"08",border:`1px solid ${acc}22`,borderRadius:10,padding:14}}>
            <div style={{fontSize:10,color:acc,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>From</div>
            {lbl("Type")}<select style={inp} value={fPt.from_type} onChange={e=>setFPt(p=>({...p,from_type:e.target.value,from_id:""}))}>
              <option value="card">Credit Card</option><option value="program">Loyalty Program</option>
            </select>
            {lbl("Program")}<select style={inp} value={fPt.from_id} onChange={ucPt("from_id")}>
              <option value="">-- select --</option>
              {(fPt.from_type==="card"?mCards:mProgs).map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div style={{background:grn+"08",border:`1px solid ${grn}22`,borderRadius:10,padding:14}}>
            <div style={{fontSize:10,color:grn,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>To</div>
            {lbl("Type")}<select style={inp} value={fPt.to_type} onChange={e=>setFPt(p=>({...p,to_type:e.target.value,to_id:""}))}>
              <option value="card">Credit Card</option><option value="program">Loyalty Program</option>
            </select>
            {lbl("Program")}<select style={inp} value={fPt.to_id} onChange={ucPt("to_id")}>
              <option value="">-- select --</option>
              {(fPt.to_type==="card"?mCards:mProgs).map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Ratio From")}<input style={inp} type="number" step="0.1" value={fPt.ratio_from} onChange={ucPt("ratio_from")}/></div>
          <div>{lbl("Ratio To")}<input style={inp} type="number" step="0.1" value={fPt.ratio_to} onChange={ucPt("ratio_to")}/></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Min Transfer")}<input style={inp} type="number" placeholder="1000" value={fPt.min_transfer} onChange={ucPt("min_transfer")}/></div>
          <div>{lbl("Max / Month")}<input style={inp} type="number" placeholder="none" value={fPt.max_monthly} onChange={ucPt("max_monthly")}/></div>
        </div>
        {lbl("Transfer Time")}<input style={inp} placeholder="Instant / 3-5 days" value={fPt.transfer_time} onChange={ucPt("transfer_time")}/>
        {lbl("Notes")}<input style={inp} placeholder="Any conditions" value={fPt.notes} onChange={ucPt("notes")}/>
        <button style={{...pbtn,width:"100%",justifyContent:"center",marginTop:4}} onClick={savePart}>{editItem?"Save Changes":"Add Route"}</button>
      </Modal>
    </div>
  );
}

// MyCards
function MyCards({db,owners}){
  const [cards,setCards]=useState([]);
  const [mCards,setMCards]=useState([]);
  const [busy,setBusy]=useState(true);
  const [show,setShow]=useState(false);
  const [detail,setDetail]=useState(null);
  const [search,setSearch]=useState("");
  const [ownerF,setOwnerF]=useState("all");
  const eF={master_id:"",owner_id:"",nickname:"",last4:"",opening_balance:"",stmt_date:"",card_expiry:"",fee_override:false,fee_override_value:""};
  const [f,setF]=useState(eF);
  const up=k=>e=>setF(p=>({...p,[k]:e.target.value}));

  const load=useCallback(async()=>{
    setBusy(true);
    const [c,m]=await Promise.all([db.from("my_cards").select(),db.from("master_cards").select()]);
    setCards(c.data||[]); setMCards(m.data||[]);
    setBusy(false);
  },[db]);
  useEffect(()=>{load();},[load]);

  if(detail){
    const master=mCards.find(m=>m.id===detail.master_id);
    const owner=owners.find(o=>o.id===detail.owner_id);
    return <CardDetail card={detail} master={master} owner={owner} db={db} mCards={mCards} owners={owners} onBack={()=>{setDetail(null);load();}} onDelete={()=>{setDetail(null);load();}}/>;
  }

  const save=async()=>{
    if(!f.master_id) return alert("Select a master card");
    if(!f.owner_id) return alert("Select an owner");
    const ob=parseInt(f.opening_balance)||0;
    const p={master_id:f.master_id,owner_id:f.owner_id,nickname:f.nickname,last4:f.last4,opening_balance:ob,points_balance:ob,stmt_date:parseInt(f.stmt_date)||null,card_expiry:f.card_expiry||null,fee_override:f.fee_override,fee_override_value:f.fee_override?parseFloat(f.fee_override_value)||0:null};
    await db.from("my_cards").insert(p);
    setShow(false); load();
  };

  const filtered=cards
    .filter(c=>ownerF==="all"||c.owner_id===ownerF)
    .filter(c=>{const m=mCards.find(x=>x.id===c.master_id);return(c.nickname||m?.name||"").toLowerCase().includes(search.toLowerCase())||(c.last4||"").includes(search);});

  const total=filtered.reduce((a,c)=>a+(c.points_balance||0),0);
  const totalInr=filtered.reduce((a,c)=>{const m=mCards.find(x=>x.id===c.master_id);return a+(c.points_balance||0)*(m?.inr_per_point||0);},0);

  return(
    <div>
      <Hdr title="My Cards" sub={`${filtered.length} cards · ${total.toLocaleString("en-IN")} pts${totalInr>0?" · "+inrFmt(totalInr):""}`}
        action={<button style={pbtn} onClick={()=>{setF(eF);setShow(true);}}>+ Add Card</button>}/>
      <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
        <div style={{position:"relative",flex:1,minWidth:160}}>
          <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:mut,fontSize:13}}>S</span>
          <input style={{...inp,marginBottom:0,paddingLeft:28}} placeholder="Search cards..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <select style={{...inp,marginBottom:0,width:"auto",padding:"9px 12px"}} value={ownerF} onChange={e=>setOwnerF(e.target.value)}>
          <option value="all">All Owners</option>
          {owners.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
      </div>
      {busy?<div style={{color:mut,textAlign:"center",padding:40}}>Loading...</div>:filtered.length===0?<Empty icon="CC" msg={search?"No cards match":"No cards yet"}/>:(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:14}}>
          {filtered.map(c=>{
            const m=mCards.find(x=>x.id===c.master_id);
            const owner=owners.find(o=>o.id===c.owner_id);
            const iv=(c.points_balance||0)*(m?.inr_per_point||0);
            const fee=c.fee_override?c.fee_override_value:m?.annual_fee;
            return(
              <div key={c.id} onClick={()=>setDetail(c)} style={{background:surf,border:`1px solid ${bdr}`,borderRadius:12,padding:"16px 18px",cursor:"pointer",position:"relative",boxShadow:"0 1px 3px rgba(0,0,0,0.04)",transition:"all 0.2s",borderTop:`2px solid ${acc}`}}
                onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 6px 20px rgba(0,0,0,0.08)";e.currentTarget.style.transform="translateY(-2px)";}}
                onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,0.04)";e.currentTarget.style.transform="none";}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                  <LogoCircle url={m?.logo_url} name={m?.name} size={44}/>
                  <div style={{minWidth:0}}>
                    <div style={{fontSize:14,fontWeight:600,color:txt,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.nickname||m?.name}{c.last4&&<span style={{color:mut,fontWeight:400}}> .... {c.last4}</span>}</div>
                    <div style={{fontSize:11,color:mut}}>{owner?.name||"--"} · {m?.network||""}</div>
                  </div>
                </div>
                <div style={{fontSize:22,fontWeight:700,color:txt,letterSpacing:"-0.02em"}}>{(c.points_balance||0).toLocaleString("en-IN")}</div>
                <div style={{fontSize:10,color:mut,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6}}>{m?.points_currency||"pts"}</div>
                {iv>0&&<div style={{fontSize:12,fontWeight:600,color:grn,marginBottom:6}}>{inrFmt(iv)}</div>}
                <div style={{display:"flex",justifyContent:"space-between",borderTop:`1px solid ${bdr}`,paddingTop:8,fontSize:11,color:mut}}>
                  <span>{c.stmt_date&&"Stmt: "+ordinal(c.stmt_date)}</span>
                  <span>{fee>0&&"Rs"+Number(fee).toLocaleString()+" fee"}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <Modal show={show} onClose={()=>setShow(false)} title="Add Card">
        {lbl("Master Card *")}<select style={inp} value={f.master_id} onChange={up("master_id")}>
          <option value="">-- select master card --</option>
          {mCards.map(m=><option key={m.id} value={m.id}>{m.name} ({m.bank||m.network})</option>)}
        </select>
        {lbl("Owner *")}<select style={inp} value={f.owner_id} onChange={up("owner_id")}>
          <option value="">-- select owner --</option>
          {owners.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
        {lbl("Nickname (optional)")}<input style={inp} placeholder="Dad's Infinia..." value={f.nickname} onChange={up("nickname")}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Last 4 Digits")}<input style={inp} placeholder="4242" maxLength={4} value={f.last4} onChange={up("last4")}/></div>
          <div>{lbl("Statement Date")}<input style={inp} type="number" placeholder="15" value={f.stmt_date} onChange={up("stmt_date")}/></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Opening Balance")}<input style={inp} type="number" placeholder="0" value={f.opening_balance} onChange={up("opening_balance")}/></div>
          <div>{lbl("Card Expiry")}<input style={inp} placeholder="MM/YY" value={f.card_expiry} onChange={up("card_expiry")}/></div>
        </div>
        <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",marginBottom:12,fontSize:13,color:txt}}>
          <input type="checkbox" checked={f.fee_override} onChange={e=>setF(p=>({...p,fee_override:e.target.checked}))} style={{accentColor:acc,cursor:"pointer"}}/>
          Override annual fee (e.g. LTF waiver)
        </label>
        {f.fee_override&&<>{lbl("Override Fee (Rs)")}<input style={inp} type="number" placeholder="0" value={f.fee_override_value} onChange={up("fee_override_value")}/></>}
        <button style={{...pbtn,width:"100%",justifyContent:"center",marginTop:4}} onClick={save}>Add Card</button>
      </Modal>
    </div>
  );
}

// CardDetail
function CardDetail({card:initCard,master,owner,db,mCards,owners,onBack,onDelete}){
  const [card,setCard]=useState(initCard);
  const [txns,setTxns]=useState([]);
  const [partners,setPartners]=useState([]);
  const [mProgs,setMProgs]=useState([]);
  const [busy,setBusy]=useState(true);
  const [showTxn,setShowTxn]=useState(false);
  const [showEdit,setShowEdit]=useState(false);
  const tf={description:"",points:"",txn_date:new Date().toISOString().split("T")[0],type:"earn"};
  const [f,setF]=useState(tf);
  const up=k=>e=>setF(p=>({...p,[k]:e.target.value}));
  const [ef,setEf]=useState({});
  const eup=k=>e=>setEf(p=>({...p,[k]:e.target.value}));

  const load=useCallback(async()=>{
    setBusy(true);
    const [t,par,mp]=await Promise.all([
      db.from("point_transactions").filter("entity_id",card.id),
      db.from("master_partners").filter("from_id",master?.id||"x"),
      db.from("master_programs").select(),
    ]);
    const td=t.data||[];
    setTxns(td.sort((a,b)=>new Date(b.txn_date)-new Date(a.txn_date)));
    setPartners(par.data||[]);
    setMProgs(mp.data||[]);
    const sum=td.reduce((a,t)=>a+t.points,0);
    const correct=(card.opening_balance||0)+sum;
    if(correct!==(card.points_balance||0)){
      await db.from("my_cards").update(card.id,{points_balance:correct});
      setCard(c=>({...c,points_balance:correct}));
    }
    setBusy(false);
  },[card.id,master?.id]);
  useEffect(()=>{load();},[load]);

  const saveTxn=async()=>{
    if(!f.points) return alert("Enter points");
    const pts=f.type==="redeem"?-Math.abs(parseInt(f.points)):Math.abs(parseInt(f.points));
    await db.from("point_transactions").insert({entity_type:"card",entity_id:card.id,points:pts,description:f.description,txn_date:f.txn_date});
    const nb=(card.points_balance||0)+pts;
    await db.from("my_cards").update(card.id,{points_balance:nb});
    setCard(c=>({...c,points_balance:nb}));
    setShowTxn(false);setF(tf);load();
  };

  const saveEdit=async()=>{
    if(!ef.owner_id) return alert("Select owner");
    const sum=txns.reduce((a,t)=>a+t.points,0);
    const nOp=parseInt(ef.opening_balance)||0;
    const nBal=nOp+sum;
    const p={owner_id:ef.owner_id,nickname:ef.nickname,last4:ef.last4,stmt_date:parseInt(ef.stmt_date)||null,card_expiry:ef.card_expiry||null,opening_balance:nOp,points_balance:nBal,fee_override:ef.fee_override,fee_override_value:ef.fee_override?parseFloat(ef.fee_override_value)||0:null};
    await db.from("my_cards").update(card.id,p);
    setCard(c=>({...c,...p}));setShowEdit(false);
  };

  const del=async()=>{if(!confirm("Delete this card and all transactions?")) return;await db.from("my_cards").delete(card.id);onDelete();};
  const gName=(type,id)=>type==="card"?mCards.find(m=>m.id===id)?.name||"--":mProgs.find(m=>m.id===id)?.name||"--";
  const gLogo=(type,id)=>type==="card"?mCards.find(m=>m.id===id)?.logo_url:mProgs.find(m=>m.id===id)?.logo_url;
  const ob=card.opening_balance||0;
  const iv=(card.points_balance||0)*(master?.inr_per_point||0);
  const fee=card.fee_override?card.fee_override_value:master?.annual_fee;
  const sorted=[...txns].sort((a,b)=>new Date(a.txn_date)-new Date(b.txn_date));
  let bal=ob; const rows=sorted.map(t=>{const op=bal;bal+=t.points;return{...t,opening:op,closing:bal};}); const disp=rows.reverse();

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
        <button onClick={onBack} style={{...gbtn,padding:"6px 14px",fontSize:12,marginBottom:20}}>Back</button>
        <div style={{display:"flex",gap:8,marginBottom:20}}>
          <button style={{...gbtn,padding:"6px 12px",fontSize:12}} onClick={()=>{setEf({owner_id:card.owner_id,nickname:card.nickname||"",last4:card.last4||"",stmt_date:String(card.stmt_date||""),card_expiry:card.card_expiry||"",opening_balance:String(card.opening_balance||""),fee_override:card.fee_override||false,fee_override_value:String(card.fee_override_value||"")});setShowEdit(true);}}>Edit</button>
          <button style={{...dbtn,padding:"6px 12px",fontSize:12}} onClick={del}>Delete</button>
        </div>
      </div>
      <Card style={{borderTop:`3px solid ${acc}`,marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
          <div style={{display:"flex",gap:14,alignItems:"center"}}>
            <LogoCircle url={master?.logo_url} name={master?.name} size={56}/>
            <div>
              <div style={{fontSize:22,fontWeight:800,color:txt,letterSpacing:"-0.02em"}}>{card.nickname||master?.name}</div>
              <div style={{fontSize:13,color:mut,marginTop:2}}>{card.last4&&".... "+card.last4+" · "}{owner?.name||"--"} · {master?.bank||""} {master?.network||""}</div>
            </div>
          </div>
          <button style={pbtn} onClick={()=>{setF(tf);setShowTxn(true);}}>+ Add Transaction</button>
        </div>
        <div style={{display:"flex",gap:10,marginTop:16,flexWrap:"wrap"}}>
          {[
            {label:"Balance",value:(card.points_balance||0).toLocaleString("en-IN")+" "+(master?.points_currency||"pts")},
            iv>0&&{label:"INR Value",value:inrFmt(iv),color:grn},
            card.stmt_date&&{label:"Statement",value:ordinal(card.stmt_date)},
            fee>0&&{label:"Annual Fee",value:"Rs"+Number(fee).toLocaleString("en-IN"),color:red},
          ].filter(Boolean).map((s,i)=>(
            <div key={i} style={{background:surf2,borderRadius:8,padding:"10px 14px",minWidth:100,border:`1px solid ${bdr}`}}>
              <div style={{fontSize:10,color:mut,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:4,fontWeight:600}}>{s.label}</div>
              <div style={{fontSize:16,fontWeight:700,color:s.color||txt}}>{s.value}</div>
            </div>
          ))}
        </div>
      </Card>
      {partners.length>0&&(
        <Card style={{marginBottom:16}}>
          <div style={{fontSize:11,fontWeight:700,color:mut,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:12}}>Transfer Partners</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {partners.map(p=>(
              <div key={p.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 12px",background:surf2,borderRadius:8,border:`1px solid ${bdr}`,flexWrap:"wrap",gap:8}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <LogoCircle url={gLogo(p.to_type,p.to_id)} name={gName(p.to_type,p.to_id)} size={32}/>
                  <div style={{fontSize:13,fontWeight:600,color:txt}}>{gName(p.to_type,p.to_id)}</div>
                </div>
                <div style={{display:"flex",gap:14,alignItems:"center"}}>
                  <div style={{textAlign:"center"}}><div style={{fontSize:14,fontWeight:800,color:acc}}>{p.ratio_from}:{p.ratio_to}</div><div style={{fontSize:9,color:mut,textTransform:"uppercase"}}>Ratio</div></div>
                  {p.min_transfer&&<div style={{textAlign:"center"}}><div style={{fontSize:12,fontWeight:600,color:txt}}>{Number(p.min_transfer).toLocaleString()}</div><div style={{fontSize:9,color:mut,textTransform:"uppercase"}}>Min</div></div>}
                  {p.transfer_time&&<div style={{textAlign:"center"}}><div style={{fontSize:12,fontWeight:600,color:grn}}>{p.transfer_time}</div><div style={{fontSize:9,color:mut,textTransform:"uppercase"}}>Time</div></div>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      <Card>
        <div style={{fontSize:11,fontWeight:700,color:mut,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:14}}>Points History</div>
        {busy?<div style={{color:mut,textAlign:"center",padding:20}}>Loading...</div>:txns.length===0?<Empty msg="No transactions yet"/>:(
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr style={{color:mut,fontSize:10,textTransform:"uppercase",letterSpacing:"0.06em",borderBottom:`2px solid ${bdr}`}}>
                {["Date","Description","Points","Opening","Closing"].map(h=><th key={h} style={{padding:"7px 10px",textAlign:h==="Date"||h==="Description"?"left":"right",fontWeight:600}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {disp.map(t=>(
                  <tr key={t.id} style={{borderBottom:`1px solid ${bdr}`}}>
                    <td style={{padding:"9px 10px",color:mut,whiteSpace:"nowrap"}}>{new Date(t.txn_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</td>
                    <td style={{padding:"9px 10px",color:txt}}>{t.description||"--"}</td>
                    <td style={{padding:"9px 10px",textAlign:"right",fontWeight:600,color:t.points>0?grn:red}}>{t.points>0?"+":""}{t.points.toLocaleString()}</td>
                    <td style={{padding:"9px 10px",textAlign:"right",color:mut}}>{t.opening.toLocaleString()}</td>
                    <td style={{padding:"9px 10px",textAlign:"right",fontWeight:600,color:txt}}>{t.closing.toLocaleString()}</td>
                  </tr>
                ))}
                <tr style={{background:surf2,borderTop:`2px solid ${bdr}`}}>
                  <td colSpan={2} style={{padding:"9px 10px"}}><em style={{fontSize:12,color:mut,fontWeight:600}}>Opening Balance</em></td>
                  <td/><td/>
                  <td style={{padding:"9px 10px",textAlign:"right",fontWeight:700,color:acc}}>{ob.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <Modal show={showTxn} onClose={()=>setShowTxn(false)} title="Add Transaction">
        {lbl("Type")}<select style={inp} value={f.type} onChange={up("type")}><option value="earn">Earn (+ points)</option><option value="redeem">Redeem (- points)</option><option value="adjust">Adjustment</option></select>
        {lbl("Points")}<input style={inp} type="number" placeholder="1000" value={f.points} onChange={up("points")}/>
        {lbl("Description")}<input style={inp} placeholder="Grocery spend, bonus..." value={f.description} onChange={up("description")}/>
        {lbl("Date")}<input style={inp} type="date" value={f.txn_date} onChange={up("txn_date")}/>
        <button style={{...pbtn,width:"100%",justifyContent:"center",marginTop:4}} onClick={saveTxn}>Save Transaction</button>
      </Modal>
      <Modal show={showEdit} onClose={()=>setShowEdit(false)} title="Edit Card">
        {lbl("Owner")}<select style={inp} value={ef.owner_id||""} onChange={eup("owner_id")}><option value="">-- select --</option>{owners.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select>
        {lbl("Nickname")}<input style={inp} value={ef.nickname||""} onChange={eup("nickname")}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Last 4")}<input style={inp} maxLength={4} value={ef.last4||""} onChange={eup("last4")}/></div>
          <div>{lbl("Statement Date")}<input style={inp} type="number" value={ef.stmt_date||""} onChange={eup("stmt_date")}/></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Card Expiry")}<input style={inp} placeholder="MM/YY" value={ef.card_expiry||""} onChange={eup("card_expiry")}/></div>
          <div>{lbl("Opening Balance")}<input style={inp} type="number" value={ef.opening_balance||""} onChange={eup("opening_balance")}/></div>
        </div>
        <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",marginBottom:12,fontSize:13,color:txt}}>
          <input type="checkbox" checked={ef.fee_override||false} onChange={e=>setEf(p=>({...p,fee_override:e.target.checked}))} style={{accentColor:acc}}/>
          Override annual fee
        </label>
        {ef.fee_override&&<>{lbl("Override Fee (Rs)")}<input style={inp} type="number" value={ef.fee_override_value||""} onChange={eup("fee_override_value")}/></>}
        <button style={{...pbtn,width:"100%",justifyContent:"center",marginTop:4}} onClick={saveEdit}>Save Changes</button>
      </Modal>
    </div>
  );
}

// MyPrograms
function MyPrograms({db,owners}){
  const [progs,setProgs]=useState([]);
  const [mProgs,setMProgs]=useState([]);
  const [busy,setBusy]=useState(true);
  const [show,setShow]=useState(false);
  const [detail,setDetail]=useState(null);
  const [search,setSearch]=useState("");
  const [ownerF,setOwnerF]=useState("all");
  const eF={master_id:"",owner_id:"",nickname:"",membership_number:"",tier:"",opening_balance:"",expiry_date:""};
  const [f,setF]=useState(eF);
  const up=k=>e=>setF(p=>({...p,[k]:e.target.value}));

  const load=useCallback(async()=>{
    setBusy(true);
    const [p,m]=await Promise.all([db.from("my_programs").select(),db.from("master_programs").select()]);
    setProgs(p.data||[]); setMProgs(m.data||[]);
    setBusy(false);
  },[db]);
  useEffect(()=>{load();},[load]);

  if(detail){
    const master=mProgs.find(m=>m.id===detail.master_id);
    const owner=owners.find(o=>o.id===detail.owner_id);
    return <ProgDetail prog={detail} master={master} owner={owner} db={db} mProgs={mProgs} mCards={[]} owners={owners} onBack={()=>{setDetail(null);load();}} onDelete={()=>{setDetail(null);load();}}/>;
  }

  const save=async()=>{
    if(!f.master_id) return alert("Select a master program");
    if(!f.owner_id) return alert("Select an owner");
    const ob=parseInt(f.opening_balance)||0;
    await db.from("my_programs").insert({master_id:f.master_id,owner_id:f.owner_id,nickname:f.nickname,membership_number:f.membership_number,tier:f.tier,opening_balance:ob,points_balance:ob,expiry_date:f.expiry_date||null});
    setShow(false);load();
  };

  const filtered=progs
    .filter(p=>ownerF==="all"||p.owner_id===ownerF)
    .filter(p=>{const m=mProgs.find(x=>x.id===p.master_id);return(p.nickname||m?.name||"").toLowerCase().includes(search.toLowerCase())||(p.membership_number||"").includes(search);});

  const totalInr=filtered.reduce((a,p)=>{const m=mProgs.find(x=>x.id===p.master_id);return a+(p.points_balance||0)*(m?.inr_per_point||0);},0);

  return(
    <div>
      <Hdr title="My Programs" sub={`${filtered.length} programs${totalInr>0?" · "+inrFmt(totalInr)+" est. value":""}`}
        action={<button style={pbtn} onClick={()=>{setF(eF);setShow(true);}}>+ Add Program</button>}/>
      <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
        <div style={{position:"relative",flex:1,minWidth:160}}>
          <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:mut,fontSize:13}}>S</span>
          <input style={{...inp,marginBottom:0,paddingLeft:28}} placeholder="Search programs..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <select style={{...inp,marginBottom:0,width:"auto",padding:"9px 12px"}} value={ownerF} onChange={e=>setOwnerF(e.target.value)}>
          <option value="all">All Owners</option>
          {owners.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
      </div>
      {busy?<div style={{color:mut,textAlign:"center",padding:40}}>Loading...</div>:filtered.length===0?<Empty icon="LP" msg={search?"No programs match":"No programs yet"}/>:(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:14}}>
          {filtered.map(p=>{
            const m=mProgs.find(x=>x.id===p.master_id);
            const owner=owners.find(o=>o.id===p.owner_id);
            const iv=(p.points_balance||0)*(m?.inr_per_point||0);
            const days=p.expiry_date?Math.round((new Date(p.expiry_date)-new Date())/86400000):null;
            const exp=days!==null&&days<=60;
            return(
              <div key={p.id} onClick={()=>setDetail(p)} style={{background:surf,border:`1px solid ${bdr}`,borderRadius:12,padding:"16px 18px",cursor:"pointer",position:"relative",boxShadow:"0 1px 3px rgba(0,0,0,0.04)",transition:"all 0.2s",borderTop:`2px solid ${acc}`}}
                onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 6px 20px rgba(0,0,0,0.08)";e.currentTarget.style.transform="translateY(-2px)";}}
                onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,0.04)";e.currentTarget.style.transform="none";}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                  <LogoCircle url={m?.logo_url} name={m?.name} size={44}/>
                  <div style={{minWidth:0}}>
                    <div style={{fontSize:14,fontWeight:600,color:txt,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.nickname||m?.name}</div>
                    <div style={{fontSize:11,color:mut}}>{owner?.name||"--"}{p.membership_number&&" | #"+p.membership_number}</div>
                  </div>
                </div>
                <div style={{fontSize:22,fontWeight:700,color:txt,letterSpacing:"-0.02em"}}>{(p.points_balance||0).toLocaleString("en-IN")}</div>
                <div style={{fontSize:10,color:mut,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6}}>points</div>
                {iv>0&&<div style={{fontSize:12,fontWeight:600,color:grn,marginBottom:6}}>{inrFmt(iv)}</div>}
                {p.expiry_date&&<div style={{fontSize:11,color:exp?red:mut,borderTop:`1px solid ${bdr}`,paddingTop:8}}>{exp?"! ":""}{days>0?days+"d left":"Expired"} · {new Date(p.expiry_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</div>}
                <div style={{position:"absolute",bottom:11,right:14,fontSize:11,color:acc,fontWeight:500}}>View</div>
              </div>
            );
          })}
        </div>
      )}
      <Modal show={show} onClose={()=>setShow(false)} title="Add Program">
        {lbl("Master Program *")}<select style={inp} value={f.master_id} onChange={up("master_id")}>
          <option value="">-- select master program --</option>
          {mProgs.map(m=><option key={m.id} value={m.id}>{m.name} ({m.category})</option>)}
        </select>
        {lbl("Owner *")}<select style={inp} value={f.owner_id} onChange={up("owner_id")}>
          <option value="">-- select owner --</option>
          {owners.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
        {lbl("Nickname (optional)")}<input style={inp} placeholder="My Air India..." value={f.nickname} onChange={up("nickname")}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Membership Number")}<input style={inp} placeholder="XXXX-XXXX" value={f.membership_number} onChange={up("membership_number")}/></div>
          <div>{lbl("Tier")}<input style={inp} placeholder="Gold, Platinum..." value={f.tier} onChange={up("tier")}/></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Opening Balance")}<input style={inp} type="number" placeholder="0" value={f.opening_balance} onChange={up("opening_balance")}/></div>
          <div>{lbl("Expiry Date")}<input style={{...inp,colorScheme:"light"}} type="date" value={f.expiry_date||""} onChange={up("expiry_date")}/></div>
        </div>
        <button style={{...pbtn,width:"100%",justifyContent:"center",marginTop:4}} onClick={save}>Add Program</button>
      </Modal>
    </div>
  );
}

// ProgDetail
function ProgDetail({prog:initProg,master,owner,db,mProgs,mCards,owners,onBack,onDelete}){
  const [prog,setProg]=useState(initProg);
  const [txns,setTxns]=useState([]);
  const [partners,setPartners]=useState([]);
  const [busy,setBusy]=useState(true);
  const [showTxn,setShowTxn]=useState(false);
  const [showEdit,setShowEdit]=useState(false);
  const tf={description:"",points:"",txn_date:new Date().toISOString().split("T")[0],type:"earn"};
  const [f,setF]=useState(tf);
  const up=k=>e=>setF(p=>({...p,[k]:e.target.value}));
  const [ef,setEf]=useState({});
  const eup=k=>e=>setEf(p=>({...p,[k]:e.target.value}));

  const load=useCallback(async()=>{
    setBusy(true);
    const [t,par]=await Promise.all([
      db.from("point_transactions").filter("entity_id",prog.id),
      db.from("master_partners").filter("from_id",master?.id||"x"),
    ]);
    const td=t.data||[];
    setTxns(td.sort((a,b)=>new Date(b.txn_date)-new Date(a.txn_date)));
    setPartners(par.data||[]);
    const sum=td.reduce((a,t)=>a+t.points,0);
    const correct=(prog.opening_balance||0)+sum;
    if(correct!==(prog.points_balance||0)){
      await db.from("my_programs").update(prog.id,{points_balance:correct});
      setProg(p=>({...p,points_balance:correct}));
    }
    setBusy(false);
  },[prog.id,master?.id]);
  useEffect(()=>{load();},[load]);

  const saveTxn=async()=>{
    if(!f.points) return alert("Enter points");
    const pts=f.type==="redeem"?-Math.abs(parseInt(f.points)):Math.abs(parseInt(f.points));
    await db.from("point_transactions").insert({entity_type:"program",entity_id:prog.id,points:pts,description:f.description,txn_date:f.txn_date});
    const nb=(prog.points_balance||0)+pts;
    await db.from("my_programs").update(prog.id,{points_balance:nb});
    setProg(p=>({...p,points_balance:nb}));
    setShowTxn(false);setF(tf);load();
  };

  const saveEdit=async()=>{
    const sum=txns.reduce((a,t)=>a+t.points,0);
    const nOp=parseInt(ef.opening_balance)||0;
    const p={owner_id:ef.owner_id,nickname:ef.nickname,membership_number:ef.membership_number,tier:ef.tier,opening_balance:nOp,points_balance:nOp+sum,expiry_date:ef.expiry_date||null};
    await db.from("my_programs").update(prog.id,p);
    setProg(x=>({...x,...p}));setShowEdit(false);
  };

  const del=async()=>{if(!confirm("Delete this program?")) return;await db.from("my_programs").delete(prog.id);onDelete();};
  const gName=(type,id)=>type==="card"?mCards.find(m=>m.id===id)?.name||"--":mProgs.find(m=>m.id===id)?.name||"--";
  const gLogo=(type,id)=>type==="card"?mCards.find(m=>m.id===id)?.logo_url:mProgs.find(m=>m.id===id)?.logo_url;
  const ob=prog.opening_balance||0;
  const iv=(prog.points_balance||0)*(master?.inr_per_point||0);
  const days=prog.expiry_date?Math.round((new Date(prog.expiry_date)-new Date())/86400000):null;
  const exp=days!==null&&days<=60;
  const sorted=[...txns].sort((a,b)=>new Date(a.txn_date)-new Date(b.txn_date));
  let bal=ob; const rows=sorted.map(t=>{const op=bal;bal+=t.points;return{...t,opening:op,closing:bal};}); const disp=rows.reverse();

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
        <button onClick={onBack} style={{...gbtn,padding:"6px 14px",fontSize:12,marginBottom:20}}>Back</button>
        <div style={{display:"flex",gap:8,marginBottom:20}}>
          <button style={{...gbtn,padding:"6px 12px",fontSize:12}} onClick={()=>{setEf({owner_id:prog.owner_id,nickname:prog.nickname||"",membership_number:prog.membership_number||"",tier:prog.tier||"",opening_balance:String(prog.opening_balance||""),expiry_date:prog.expiry_date||""});setShowEdit(true);}}>Edit</button>
          <button style={{...dbtn,padding:"6px 12px",fontSize:12}} onClick={del}>Delete</button>
        </div>
      </div>
      <Card style={{borderTop:`3px solid ${acc}`,marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
          <div style={{display:"flex",gap:14,alignItems:"center"}}>
            <LogoCircle url={master?.logo_url} name={master?.name} size={56}/>
            <div>
              <div style={{fontSize:22,fontWeight:800,color:txt,letterSpacing:"-0.02em"}}>{prog.nickname||master?.name}</div>
              <div style={{fontSize:13,color:mut,marginTop:2}}>{owner?.name||"--"} · {master?.category||""}{prog.tier&&" · "+prog.tier}{prog.membership_number&&" · #"+prog.membership_number}</div>
            </div>
          </div>
          <button style={pbtn} onClick={()=>{setF(tf);setShowTxn(true);}}>+ Add Transaction</button>
        </div>
        <div style={{display:"flex",gap:10,marginTop:16,flexWrap:"wrap"}}>
          {[
            {label:"Balance",value:(prog.points_balance||0).toLocaleString("en-IN")+" pts"},
            iv>0&&{label:"INR Value",value:inrFmt(iv),color:grn},
            days!==null&&{label:"Expiry",value:days>0?days+"d left":"Expired",color:exp?red:mut},
          ].filter(Boolean).map((s,i)=>(
            <div key={i} style={{background:surf2,borderRadius:8,padding:"10px 14px",minWidth:100,border:`1px solid ${bdr}`}}>
              <div style={{fontSize:10,color:mut,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:4,fontWeight:600}}>{s.label}</div>
              <div style={{fontSize:16,fontWeight:700,color:s.color||txt}}>{s.value}</div>
            </div>
          ))}
        </div>
        {master?.expiry_rule&&<div style={{fontSize:12,color:mut,marginTop:10}}>{master.expiry_rule}</div>}
      </Card>
      {partners.length>0&&(
        <Card style={{marginBottom:16}}>
          <div style={{fontSize:11,fontWeight:700,color:mut,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:12}}>Transfer Partners</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {partners.map(p=>(
              <div key={p.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 12px",background:surf2,borderRadius:8,border:`1px solid ${bdr}`,flexWrap:"wrap",gap:8}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <LogoCircle url={gLogo(p.to_type,p.to_id)} name={gName(p.to_type,p.to_id)} size={32}/>
                  <div style={{fontSize:13,fontWeight:600,color:txt}}>{gName(p.to_type,p.to_id)}</div>
                </div>
                <div style={{display:"flex",gap:14,alignItems:"center"}}>
                  <div style={{textAlign:"center"}}><div style={{fontSize:14,fontWeight:800,color:acc}}>{p.ratio_from}:{p.ratio_to}</div><div style={{fontSize:9,color:mut,textTransform:"uppercase"}}>Ratio</div></div>
                  {p.min_transfer&&<div style={{textAlign:"center"}}><div style={{fontSize:12,fontWeight:600,color:txt}}>{Number(p.min_transfer).toLocaleString()}</div><div style={{fontSize:9,color:mut,textTransform:"uppercase"}}>Min</div></div>}
                  {p.transfer_time&&<div style={{textAlign:"center"}}><div style={{fontSize:12,fontWeight:600,color:grn}}>{p.transfer_time}</div><div style={{fontSize:9,color:mut,textTransform:"uppercase"}}>Time</div></div>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      <Card>
        <div style={{fontSize:11,fontWeight:700,color:mut,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:14}}>Points History</div>
        {busy?<div style={{color:mut,textAlign:"center",padding:20}}>Loading...</div>:txns.length===0?<Empty msg="No transactions yet"/>:(
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr style={{color:mut,fontSize:10,textTransform:"uppercase",letterSpacing:"0.06em",borderBottom:`2px solid ${bdr}`}}>
                {["Date","Description","Points","Opening","Closing"].map(h=><th key={h} style={{padding:"7px 10px",textAlign:h==="Date"||h==="Description"?"left":"right",fontWeight:600}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {disp.map(t=>(
                  <tr key={t.id} style={{borderBottom:`1px solid ${bdr}`}}>
                    <td style={{padding:"9px 10px",color:mut,whiteSpace:"nowrap"}}>{new Date(t.txn_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</td>
                    <td style={{padding:"9px 10px",color:txt}}>{t.description||"--"}</td>
                    <td style={{padding:"9px 10px",textAlign:"right",fontWeight:600,color:t.points>0?grn:red}}>{t.points>0?"+":""}{t.points.toLocaleString()}</td>
                    <td style={{padding:"9px 10px",textAlign:"right",color:mut}}>{t.opening.toLocaleString()}</td>
                    <td style={{padding:"9px 10px",textAlign:"right",fontWeight:600,color:txt}}>{t.closing.toLocaleString()}</td>
                  </tr>
                ))}
                <tr style={{background:surf2,borderTop:`2px solid ${bdr}`}}>
                  <td colSpan={2} style={{padding:"9px 10px"}}><em style={{fontSize:12,color:mut,fontWeight:600}}>Opening Balance</em></td>
                  <td/><td/>
                  <td style={{padding:"9px 10px",textAlign:"right",fontWeight:700,color:acc}}>{ob.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <Modal show={showTxn} onClose={()=>setShowTxn(false)} title="Add Transaction">
        {lbl("Type")}<select style={inp} value={f.type} onChange={up("type")}><option value="earn">Earn (+ points)</option><option value="redeem">Redeem (- points)</option><option value="adjust">Adjustment</option></select>
        {lbl("Points")}<input style={inp} type="number" placeholder="1000" value={f.points} onChange={up("points")}/>
        {lbl("Description")}<input style={inp} placeholder="Flight booking, hotel..." value={f.description} onChange={up("description")}/>
        {lbl("Date")}<input style={inp} type="date" value={f.txn_date} onChange={up("txn_date")}/>
        <button style={{...pbtn,width:"100%",justifyContent:"center",marginTop:4}} onClick={saveTxn}>Save Transaction</button>
      </Modal>
      <Modal show={showEdit} onClose={()=>setShowEdit(false)} title="Edit Program">
        {lbl("Owner")}<select style={inp} value={ef.owner_id||""} onChange={eup("owner_id")}><option value="">-- select --</option>{owners.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select>
        {lbl("Nickname")}<input style={inp} value={ef.nickname||""} onChange={eup("nickname")}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Membership Number")}<input style={inp} value={ef.membership_number||""} onChange={eup("membership_number")}/></div>
          <div>{lbl("Tier")}<input style={inp} value={ef.tier||""} onChange={eup("tier")}/></div>
        </div>
        {lbl("Opening Balance")}<input style={inp} type="number" value={ef.opening_balance||""} onChange={eup("opening_balance")}/>
        {lbl("Expiry Date")}<input style={{...inp,colorScheme:"light"}} type="date" value={ef.expiry_date||""} onChange={eup("expiry_date")}/>
        <button style={{...pbtn,width:"100%",justifyContent:"center",marginTop:4}} onClick={saveEdit}>Save Changes</button>
      </Modal>
    </div>
  );
}

// TransferPoints
function TransferPoints({db,owners}){
  const [myCards,setMyCards]=useState([]);
  const [myProgs,setMyProgs]=useState([]);
  const [mCards,setMCards]=useState([]);
  const [mProgs,setMProgs]=useState([]);
  const [partners,setPartners]=useState([]);
  const [busy,setBusy]=useState(true);
  const [ownerF,setOwnerF]=useState("all");
  const [crossOwner,setCrossOwner]=useState(false);
  const [fromType,setFromType]=useState("card");
  const [fromId,setFromId]=useState("");
  const [toType,setToType]=useState("program");
  const [toId,setToId]=useState("");
  const [pts,setPts]=useState("");
  const [bonus,setBonus]=useState("");
  const [txnDate,setTxnDate]=useState(new Date().toISOString().split("T")[0]);
  const [notes,setNotes]=useState("");
  const [done,setDone]=useState(null);

  const loadAll=useCallback(async()=>{
    setBusy(true);
    const [a,b,c,d,e]=await Promise.all([db.from("my_cards").select(),db.from("my_programs").select(),db.from("master_cards").select(),db.from("master_programs").select(),db.from("master_partners").select()]);
    setMyCards(a.data||[]); setMyProgs(b.data||[]); setMCards(c.data||[]); setMProgs(d.data||[]); setPartners(e.data||[]);
    setBusy(false);
  },[db]);
  useEffect(()=>{loadAll();},[loadAll]);

  const gMaster=(type,masterId)=>type==="card"?mCards.find(m=>m.id===masterId):mProgs.find(m=>m.id===masterId);
  const own=id=>owners.find(o=>o.id===id)?.name||"";

  const fromEnt=fromType==="card"?myCards:myProgs;
  const fFiltered=fromEnt.filter(e=>{
    if(ownerF!=="all"&&!crossOwner&&e.owner_id!==ownerF) return false;
    const m=gMaster(fromType,e.master_id);
    return partners.some(p=>p.from_id===m?.id&&p.from_type===fromType);
  });

  const fromEntity=fromType==="card"?myCards.find(c=>c.id===fromId):myProgs.find(p=>p.id===fromId);
  const fromMaster=fromEntity?gMaster(fromType,fromEntity.master_id):null;
  const validParts=fromMaster?partners.filter(p=>p.from_id===fromMaster.id&&p.from_type===fromType):[];

  const toEnt=toType==="card"?myCards:myProgs;
  const tFiltered=toEnt.filter(e=>{
    const m=gMaster(toType,e.master_id);
    if(!validParts.some(p=>p.to_id===m?.id&&p.to_type===toType)) return false;
    if(!crossOwner&&fromEntity&&e.owner_id!==fromEntity.owner_id) return false;
    return true;
  });

  const toEntity=toType==="card"?myCards.find(c=>c.id===toId):myProgs.find(p=>p.id===toId);
  const toMaster=toEntity?gMaster(toType,toEntity.master_id):null;
  const partner=fromMaster&&toMaster?validParts.find(p=>p.to_id===toMaster.id&&p.to_type===toType):null;

  const sentPts=parseInt(pts)||0;
  const bonusPts=parseInt(bonus)||0;
  const ratioRec=partner&&sentPts?Math.floor(sentPts*(partner.ratio_to/partner.ratio_from)):0;
  const totalRec=ratioRec+bonusPts;

  const getRatio=(type,entId)=>{
    const e=type==="card"?myCards.find(c=>c.id===entId):myProgs.find(p=>p.id===entId);
    if(!e||!fromMaster) return null;
    const m=gMaster(type,e.master_id);
    const par=validParts.find(p=>p.to_id===m?.id&&p.to_type===type);
    return par?par.ratio_from+":"+par.ratio_to:null;
  };

  const doTransfer=async()=>{
    if(!fromId||!toId||!pts) return alert("Fill all fields");
    if(!partner) return alert("No transfer route found");
    if(sentPts<=0) return alert("Enter valid points");
    if(partner.min_transfer&&sentPts<partner.min_transfer) return alert("Minimum: "+partner.min_transfer.toLocaleString()+" pts");
    if(fromEntity&&sentPts>(fromEntity.points_balance||0)) return alert("Insufficient. Available: "+(fromEntity.points_balance||0).toLocaleString());
    const fTbl=fromType==="card"?"my_cards":"my_programs";
    const tTbl=toType==="card"?"my_cards":"my_programs";
    const fName=fromEntity?.nickname||fromMaster?.name||"--";
    const tName=toEntity?.nickname||toMaster?.name||"--";
    await db.from(fTbl).update(fromEntity.id,{points_balance:(fromEntity.points_balance||0)-sentPts});
    await db.from(tTbl).update(toEntity.id,{points_balance:(toEntity.points_balance||0)+totalRec});
    await db.from("point_transactions").insert({entity_type:fromType,entity_id:fromEntity.id,points:-sentPts,description:"Transfer to "+tName+(notes?" - "+notes:""),txn_date:txnDate});
    await db.from("point_transactions").insert({entity_type:toType,entity_id:toEntity.id,points:totalRec,description:"Transfer from "+fName+(bonusPts?" (+"+bonusPts+" bonus)":"")+(notes?" - "+notes:""),txn_date:txnDate});
    await db.from("transfer_log").insert({from_type:fromType,from_id:fromEntity.id,from_owner_id:fromEntity.owner_id,to_type:toType,to_id:toEntity.id,to_owner_id:toEntity.owner_id,points_sent:sentPts,points_received:ratioRec,bonus_miles:bonusPts,ratio_from:partner.ratio_from,ratio_to:partner.ratio_to,transfer_date:txnDate,cross_owner:fromEntity.owner_id!==toEntity.owner_id,notes:notes||null,from_name:fName,to_name:tName});
    setDone({fName,tName,sent:sentPts,received:ratioRec,bonus:bonusPts,total:totalRec,crossOwner:fromEntity.owner_id!==toEntity.owner_id});
    setFromId(""); setToId(""); setPts(""); setBonus(""); setNotes("");
    await loadAll();
  };

  const tBtn=(active,label,onClick)=>(
    <button onClick={onClick} style={{flex:1,padding:"7px",borderRadius:7,border:`1.5px solid ${active?txt:bdr}`,cursor:"pointer",fontSize:12,fontWeight:active?600:400,background:active?txt:"transparent",color:active?"#fff":mut,transition:"all 0.15s"}}>{label}</button>
  );

  if(busy) return <div style={{color:mut,padding:60,textAlign:"center"}}>Loading...</div>;

  return(
    <div>
      <Hdr title="Transfer Points" sub="Move points between your cards and programs"/>
      {done&&(
        <div style={{background:surf2,border:`1px solid ${bdr}`,borderRadius:10,padding:"14px 18px",marginBottom:20}}>
          <div style={{display:"flex",justifyContent:"space-between",gap:8}}>
            <div>
              <div style={{fontSize:13,color:grn,fontWeight:700,marginBottom:4}}>Transfer complete!{done.crossOwner&&" (cross-owner)"}</div>
              <div style={{fontSize:13,color:txt}}>{done.sent.toLocaleString()} pts from <strong>{done.fName}</strong></div>
              <div style={{fontSize:13,color:txt,marginTop:2}}>to {done.received.toLocaleString()} pts{done.bonus>0&&<span style={{color:grn}}> + {done.bonus.toLocaleString()} bonus = <strong>{done.total.toLocaleString()}</strong></span>} in <strong>{done.tName}</strong></div>
            </div>
            <button onClick={()=>setDone(null)} style={{background:"none",border:"none",cursor:"pointer",color:mut,fontSize:20}}>x</button>
          </div>
        </div>
      )}
      <div style={{background:surf,border:`1px solid ${bdr}`,borderRadius:12,padding:24,maxWidth:600,boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
        <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:20,flexWrap:"wrap"}}>
          <select style={{...inp,marginBottom:0,flex:1,fontSize:12,padding:"7px 10px"}} value={ownerF} onChange={e=>{setOwnerF(e.target.value);setFromId("");setToId("");}}>
            <option value="all">All Owners</option>
            {owners.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
          <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:12,color:mut2,flexShrink:0}}>
            <input type="checkbox" checked={crossOwner} onChange={e=>{setCrossOwner(e.target.checked);setToId("");}} style={{accentColor:acc}}/>
            Allow cross-owner transfer
          </label>
        </div>
        {crossOwner&&<div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:8,padding:"8px 12px",marginBottom:16,fontSize:12,color:"#92400e"}}>Cross-owner transfer enabled</div>}
        <div style={{background:surf2,borderRadius:10,padding:"14px",marginBottom:14,border:`1px solid ${bdr}`}}>
          <div style={{fontSize:10,fontWeight:700,color:mut,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:10}}>From</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div>{lbl("Type")}<div style={{display:"flex",gap:6}}>{tBtn(fromType==="card","Credit Card",()=>{setFromType("card");setFromId("");setToId("");})}{tBtn(fromType==="program","Loyalty",()=>{setFromType("program");setFromId("");setToId("");})}</div></div>
            <div>{lbl("Program")}<select style={inp} value={fromId} onChange={e=>{setFromId(e.target.value);setToId("");}}>
              <option value="">-- select --</option>
              {fFiltered.map(e=>{const m=gMaster(fromType,e.master_id);return<option key={e.id} value={e.id}>{e.nickname||m?.name}{e.last4?" .... "+e.last4:e.membership_number?" #"+e.membership_number:""} | {own(e.owner_id)} | {(e.points_balance||0).toLocaleString()} pts</option>;})}
            </select></div>
          </div>
          {fromEntity&&<div style={{fontSize:12,color:mut}}>Available: <strong style={{color:txt}}>{(fromEntity.points_balance||0).toLocaleString()} pts</strong></div>}
        </div>
        <div style={{background:surf2,borderRadius:10,padding:"14px",marginBottom:16,border:`1px solid ${bdr}`}}>
          <div style={{fontSize:10,fontWeight:700,color:mut,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:10}}>To</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div>{lbl("Type")}<div style={{display:"flex",gap:6}}>{tBtn(toType==="card","Credit Card",()=>{setToType("card");setToId("");})}{tBtn(toType==="program","Loyalty",()=>{setToType("program");setToId("");})}</div></div>
            <div>{lbl("Program")}<select style={inp} value={toId} onChange={e=>setToId(e.target.value)} disabled={!fromId}>
              <option value="">-- select --</option>
              {tFiltered.map(e=>{const m=gMaster(toType,e.master_id);const ratio=getRatio(toType,e.id);return<option key={e.id} value={e.id}>{e.nickname||m?.name}{e.last4?" .... "+e.last4:e.membership_number?" #"+e.membership_number:""} | {own(e.owner_id)}{ratio?" ["+ratio+"]":""} | {(e.points_balance||0).toLocaleString()} pts</option>;})}
            </select></div>
          </div>
          {!fromId&&<div style={{fontSize:11,color:mut}}>Select source first</div>}
          {toEntity&&<div style={{fontSize:12,color:mut}}>Current: <strong style={{color:txt}}>{(toEntity.points_balance||0).toLocaleString()} pts</strong></div>}
        </div>
        {partner&&(
          <div style={{background:acc+"08",border:`1px solid ${acc}22`,borderRadius:10,padding:"12px 16px",marginBottom:16}}>
            <div style={{display:"flex",gap:20,flexWrap:"wrap",alignItems:"flex-end"}}>
              <div><div style={{fontSize:10,color:mut,textTransform:"uppercase",fontWeight:600,marginBottom:2}}>Ratio</div><div style={{fontSize:20,fontWeight:800,color:acc}}>{partner.ratio_from}:{partner.ratio_to}</div></div>
              {partner.min_transfer&&<div><div style={{fontSize:10,color:mut,textTransform:"uppercase",fontWeight:600,marginBottom:2}}>Min</div><div style={{fontSize:15,fontWeight:700,color:txt}}>{partner.min_transfer.toLocaleString()}</div></div>}
              {partner.max_monthly&&<div><div style={{fontSize:10,color:mut,textTransform:"uppercase",fontWeight:600,marginBottom:2}}>Max/mo</div><div style={{fontSize:15,fontWeight:700,color:txt}}>{partner.max_monthly.toLocaleString()}</div></div>}
              {partner.transfer_time&&<div><div style={{fontSize:10,color:mut,textTransform:"uppercase",fontWeight:600,marginBottom:2}}>Time</div><div style={{fontSize:15,fontWeight:700,color:grn}}>{partner.transfer_time}</div></div>}
            </div>
          </div>
        )}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Points to Transfer")}<input style={inp} type="number" placeholder="Enter points" value={pts} onChange={e=>setPts(e.target.value)} disabled={!partner}/></div>
          <div>{lbl("Bonus Miles (optional)")}<input style={inp} type="number" placeholder="0" value={bonus} onChange={e=>setBonus(e.target.value)} disabled={!partner}/></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Transfer Date")}<input style={inp} type="date" value={txnDate} onChange={e=>setTxnDate(e.target.value)}/></div>
          <div>{lbl("Notes")}<input style={inp} placeholder="Promo, ref..." value={notes} onChange={e=>setNotes(e.target.value)}/></div>
        </div>
        {partner&&sentPts>0&&(
          <div style={{background:surf2,border:`1px solid ${bdr}`,borderRadius:10,padding:"14px 16px",marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
              <div><div style={{fontSize:10,color:mut,textTransform:"uppercase",fontWeight:600,marginBottom:3}}>You Send</div><div style={{fontSize:22,fontWeight:800,color:red}}>{sentPts.toLocaleString()} pts</div></div>
              <div style={{fontSize:20,color:mut}}>to</div>
              <div>
                <div style={{fontSize:10,color:mut,textTransform:"uppercase",fontWeight:600,marginBottom:3}}>They Receive</div>
                <div style={{fontSize:22,fontWeight:800,color:grn}}>{totalRec.toLocaleString()} pts</div>
                {bonusPts>0&&<div style={{fontSize:11,color:mut}}>{ratioRec.toLocaleString()} ratio + {bonusPts.toLocaleString()} bonus</div>}
              </div>
            </div>
          </div>
        )}
        <button style={{...pbtn,width:"100%",justifyContent:"center",padding:"11px",opacity:(!fromId||!toId||!pts)?0.5:1}} onClick={doTransfer}>Transfer Points</button>
      </div>
    </div>
  );
}

// TransferHistory
function TransferHistory({db,owners}){
  const [logs,setLogs]=useState([]);
  const [busy,setBusy]=useState(true);
  const [err,setErr]=useState("");
  const [search,setSearch]=useState("");
  const [sort,setSort]=useState("date");
  const [detail,setDetail]=useState(null);

  const load=useCallback(async()=>{
    setBusy(true);setErr("");
    try{
      const {data,error}=await db.from("transfer_log").select();
      if(error){setErr("Error: "+JSON.stringify(error));setLogs([]);}
      else setLogs((data||[]).sort((a,b)=>new Date(b.transfer_date)-new Date(a.transfer_date)));
    }catch(e){setErr(e.message);}
    setBusy(false);
  },[db]);
  useEffect(()=>{load();},[load]);

  const del=async id=>{if(!confirm("Delete this record?")) return;await db.from("transfer_log").delete(id);load();};

  const filtered=logs
    .filter(l=>(l.from_name||"").toLowerCase().includes(search.toLowerCase())||(l.to_name||"").toLowerCase().includes(search.toLowerCase())||(l.notes||"").toLowerCase().includes(search.toLowerCase()))
    .sort((a,b)=>sort==="sent"?b.points_sent-a.points_sent:sort==="received"?b.points_received-a.points_received:new Date(b.transfer_date)-new Date(a.transfer_date));

  const tSent=filtered.reduce((a,l)=>a+(l.points_sent||0),0);
  const tRec=filtered.reduce((a,l)=>a+(l.points_received||0)+(l.bonus_miles||0),0);

  return(
    <div>
      <Hdr title="Transfer History" sub="All point transfers"/>
      {err&&<div style={{color:red,fontSize:12,padding:"10px 14px",background:"#fef2f2",borderRadius:8,marginBottom:16}}>{err}</div>}
      {logs.length>0&&(
        <div style={{display:"flex",gap:12,marginBottom:20,flexWrap:"wrap"}}>
          {[{label:"Total Transfers",value:String(logs.length)},{label:"Total Sent",value:tSent.toLocaleString(),color:red},{label:"Total Received",value:tRec.toLocaleString(),color:grn}].map((s,i)=>(
            <div key={i} style={{background:surf,border:`1px solid ${bdr}`,borderRadius:10,padding:"12px 16px",minWidth:120}}>
              <div style={{fontSize:10,color:mut,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:4,fontWeight:600}}>{s.label}</div>
              <div style={{fontSize:20,fontWeight:700,color:s.color||txt}}>{s.value}</div>
            </div>
          ))}
        </div>
      )}
      <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
        <div style={{position:"relative",flex:1,minWidth:160}}>
          <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:mut,fontSize:13}}>S</span>
          <input style={{...inp,marginBottom:0,paddingLeft:28}} placeholder="Search transfers..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <select style={{...inp,marginBottom:0,width:"auto",padding:"9px 12px"}} value={sort} onChange={e=>setSort(e.target.value)}>
          <option value="date">Date</option><option value="sent">Sent</option><option value="received">Received</option>
        </select>
      </div>
      {busy?<div style={{color:mut,textAlign:"center",padding:40}}>Loading...</div>:filtered.length===0?<Empty icon="->" msg="No transfers yet"/>:(
        <Card>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr style={{color:mut,fontSize:10,textTransform:"uppercase",letterSpacing:"0.07em",borderBottom:`2px solid ${bdr}`}}>
                {["Date","From","To","Sent","Ratio","Received","Bonus",""].map(h=><th key={h} style={{padding:"8px 12px",textAlign:h==="Sent"||h==="Received"||h==="Bonus"?"right":"left",fontWeight:600}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {filtered.map(l=>(
                  <tr key={l.id} style={{borderBottom:`1px solid ${bdr}`,cursor:"pointer"}} onClick={()=>setDetail(detail?.id===l.id?null:l)}>
                    <td style={{padding:"10px 12px",color:mut,whiteSpace:"nowrap"}}>{new Date(l.transfer_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}{l.cross_owner&&<span style={{marginLeft:6,fontSize:10,color:acc,fontWeight:600}}>cross</span>}</td>
                    <td style={{padding:"10px 12px",fontWeight:500,color:txt}}>{l.from_name||"--"}</td>
                    <td style={{padding:"10px 12px",fontWeight:500,color:txt}}>{l.to_name||"--"}</td>
                    <td style={{padding:"10px 12px",textAlign:"right",fontWeight:600,color:red}}>{(l.points_sent||0).toLocaleString()}</td>
                    <td style={{padding:"10px 12px",textAlign:"center"}}><span style={{fontSize:11,fontWeight:700,color:acc,background:acc+"12",padding:"2px 7px",borderRadius:20}}>{l.ratio_from}:{l.ratio_to}</span></td>
                    <td style={{padding:"10px 12px",textAlign:"right",fontWeight:600,color:grn}}>{(l.points_received||0).toLocaleString()}</td>
                    <td style={{padding:"10px 12px",textAlign:"right",color:l.bonus_miles>0?acc:mut}}>{l.bonus_miles>0?"+"+l.bonus_miles.toLocaleString():"--"}</td>
                    <td style={{padding:"10px 12px",textAlign:"center"}}><button style={{...dbtn,padding:"3px 7px",fontSize:11}} onClick={e=>{e.stopPropagation();del(l.id);}}>x</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {detail&&(
            <div style={{background:surf2,borderTop:`1px solid ${bdr}`,padding:"12px 16px"}}>
              <div style={{display:"flex",gap:20,flexWrap:"wrap",fontSize:13}}>
                <div><span style={{color:mut,fontSize:11}}>Date: </span>{new Date(detail.transfer_date).toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>
                {detail.notes&&<div><span style={{color:mut,fontSize:11}}>Notes: </span>{detail.notes}</div>}
                <div><span style={{color:mut,fontSize:11}}>Total received: </span><strong style={{color:grn}}>{((detail.points_received||0)+(detail.bonus_miles||0)).toLocaleString()}</strong></div>
                {detail.cross_owner&&<div style={{color:acc,fontWeight:600}}>Cross-owner transfer</div>}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

// Vouchers
function Vouchers({db,owners}){
  const [rows,setRows]=useState([]);
  const [busy,setBusy]=useState(true);
  const [show,setShow]=useState(false);
  const [edit,setEdit]=useState(null);
  const [filter,setFilter]=useState("active");
  const [ownerF,setOwnerF]=useState("all");
  const eF={owner_id:"",program:"",description:"",value:"",expiry_date:"",redeemed:false,voucher_code:"",voucher_pin:"",received_from:"",notes:""};
  const [f,setF]=useState(eF);
  const up=k=>e=>setF(p=>({...p,[k]:e.target.value}));
  const load=useCallback(async()=>{setBusy(true);const {data}=await db.from("vouchers").select();setRows(data||[]);setBusy(false);},[db]);
  useEffect(()=>{load();},[load]);
  const openEdit=r=>{setEdit(r);setF({owner_id:r.owner_id||"",program:r.program||"",description:r.description||"",value:r.value||"",expiry_date:r.expiry_date||"",redeemed:r.redeemed||false,voucher_code:r.voucher_code||"",voucher_pin:r.voucher_pin||"",received_from:r.received_from||"",notes:r.notes||""});setShow(true);};
  const save=async()=>{
    if(!f.program.trim()) return alert("Program required");
    if(!f.owner_id) return alert("Select an owner");
    const p={...f,expiry_date:f.expiry_date||null};
    if(edit) await db.from("vouchers").update(edit.id,p);
    else await db.from("vouchers").insert(p);
    setShow(false);setEdit(null);load();
  };
  const del=async id=>{if(confirm("Delete?")){await db.from("vouchers").delete(id);load();}};
  const toggle=async v=>{await db.from("vouchers").update(v.id,{redeemed:!v.redeemed});load();};
  const days=d=>d?Math.round((new Date(d)-new Date())/86400000):null;
  const shown=rows.filter(v=>{
    if(ownerF!=="all"&&v.owner_id!==ownerF) return false;
    if(filter==="active") return !v.redeemed;
    if(filter==="redeemed") return v.redeemed;
    return true;
  });

  function Secret({label,value}){
    const [vis,setVis]=useState(false);
    return(
      <div style={{fontSize:11,marginBottom:4,display:"flex",alignItems:"center",gap:6}}>
        <span style={{color:mut}}>{label}:</span>
        <span style={{fontFamily:"monospace",fontWeight:600,color:vis?acc:mut,background:surf2,padding:"1px 6px",borderRadius:4,minWidth:50,display:"inline-block"}}>{vis?value:"*".repeat(Math.min(value.length,8))}</span>
        <button onClick={()=>setVis(v=>!v)} style={{background:"none",border:"none",cursor:"pointer",color:mut,fontSize:13,padding:"0 2px"}}>{vis?"hide":"show"}</button>
      </div>
    );
  }

  return(
    <div>
      <Hdr title="Vouchers" sub={rows.filter(v=>!v.redeemed).length+" active · "+rows.filter(v=>v.redeemed).length+" redeemed"}
        action={<button style={pbtn} onClick={()=>{setEdit(null);setF(eF);setShow(true);}}>+ Add Voucher</button>}/>
      <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
        {["active","redeemed","all"].map(t=><button key={t} onClick={()=>setFilter(t)} style={{padding:"6px 14px",borderRadius:20,border:`1px solid ${filter===t?txt:bdr}`,cursor:"pointer",fontSize:12,fontWeight:filter===t?600:400,background:filter===t?txt:"transparent",color:filter===t?"#fff":mut2,textTransform:"capitalize"}}>{t}</button>)}
        <select style={{...inp,marginBottom:0,width:"auto",padding:"6px 10px",fontSize:12}} value={ownerF} onChange={e=>setOwnerF(e.target.value)}>
          <option value="all">All Owners</option>
          {owners.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
      </div>
      {busy?<div style={{color:mut,textAlign:"center",padding:40}}>Loading...</div>:shown.length===0?<Empty icon="V" msg="No vouchers here"/>:(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:14}}>
          {shown.map(v=>{
            const d=days(v.expiry_date); const exp=d!==null&&d<30&&!v.redeemed;
            const owner=owners.find(o=>o.id===v.owner_id);
            return(
              <div key={v.id} style={{background:surf,border:`1px solid ${exp?"#fde68a":bdr}`,borderRadius:12,padding:"16px 18px",opacity:v.redeemed?0.55:1,position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:v.redeemed?bdr2:exp?acc:grn,borderRadius:"12px 12px 0 0"}}/>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginTop:4,marginBottom:10}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600,color:txt}}>{v.program}</div>
                    {v.description&&<div style={{fontSize:11,color:mut,marginTop:1}}>{v.description}</div>}
                  </div>
                  <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:20,background:v.redeemed?surf2:exp?"#fef3c7":grn+"12",color:v.redeemed?mut:exp?"#92400e":grn,marginLeft:8,flexShrink:0,letterSpacing:"0.04em"}}>{v.redeemed?"USED":exp?"EXPIRING":"ACTIVE"}</span>
                </div>
                {owner&&<div style={{fontSize:11,color:mut,marginBottom:6}}>Owner: <span style={{color:txt,fontWeight:500}}>{owner.name}</span></div>}
                {v.value&&<div style={{fontSize:18,fontWeight:700,color:txt,marginBottom:6}}>{v.value}</div>}
                {v.received_from&&<div style={{fontSize:11,color:mut,marginBottom:4}}>From: <span style={{color:txt,fontWeight:500}}>{v.received_from}</span></div>}
                {v.voucher_code&&<Secret label="Code" value={v.voucher_code}/>}
                {v.voucher_pin&&<Secret label="PIN" value={v.voucher_pin}/>}
                {v.expiry_date&&<div style={{fontSize:11,color:exp?red:mut,marginBottom:8}}>Exp {new Date(v.expiry_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}{d!==null&&<span style={{fontWeight:exp?600:400}}> · {d>0?d+"d":"Expired"}</span>}</div>}
                {v.notes&&<div style={{fontSize:11,color:mut,fontStyle:"italic",marginBottom:8}}>{v.notes}</div>}
                <div style={{display:"flex",gap:6,borderTop:`1px solid ${bdr}`,paddingTop:10}}>
                  <button onClick={()=>toggle(v)} style={{...pbtn,padding:"5px 12px",fontSize:11,background:v.redeemed?surf:txt,color:v.redeemed?mut:"#fff",border:`1.5px solid ${v.redeemed?bdr:txt}`}}>{v.redeemed?"Restore":"Mark Used"}</button>
                  <button style={{...gbtn,padding:"5px 8px",fontSize:11}} onClick={()=>openEdit(v)}>Edit</button>
                  <button style={{...dbtn,padding:"5px 8px",fontSize:11}} onClick={()=>del(v.id)}>Del</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <Modal show={show} onClose={()=>{setShow(false);setEdit(null);}} title={edit?"Edit Voucher":"Add Voucher"}>
        {lbl("Owner *")}<select style={inp} value={f.owner_id} onChange={up("owner_id")}><option value="">-- select owner --</option>{owners.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select>
        {lbl("Program / Issuer *")}<input style={inp} placeholder="Marriott Bonvoy..." value={f.program} onChange={up("program")}/>
        {lbl("Description")}<input style={inp} placeholder="Free night award" value={f.description} onChange={up("description")}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Value")}<input style={inp} placeholder="Rs 5000 / 1 Night" value={f.value} onChange={up("value")}/></div>
          <div>{lbl("Expiry Date")}<input style={{...inp,colorScheme:"light"}} type="date" value={f.expiry_date||""} onChange={up("expiry_date")}/></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Voucher Code")}<input style={inp} placeholder="ABC123" value={f.voucher_code} onChange={up("voucher_code")}/></div>
          <div>{lbl("Voucher PIN")}<input style={inp} placeholder="1234" value={f.voucher_pin} onChange={up("voucher_pin")}/></div>
        </div>
        {lbl("Received From")}<input style={inp} placeholder="SmartBuy, Infinia CC..." value={f.received_from} onChange={up("received_from")}/>
        {lbl("Notes")}<input style={inp} placeholder="Conditions, notes..." value={f.notes} onChange={up("notes")}/>
        <button style={{...pbtn,width:"100%",justifyContent:"center",marginTop:4}} onClick={save}>{edit?"Save Changes":"Add Voucher"}</button>
      </Modal>
    </div>
  );
}

// Settings
function Settings({db,owners,reloadOwners,onDisconnect}){
  const [showAdd,setShowAdd]=useState(false);
  const [newOwner,setNewOwner]=useState("");
  const [resetting,setResetting]=useState(false);

  const addOwner=async()=>{
    if(!newOwner.trim()) return;
    await db.from("owners").insert({name:newOwner.trim()});
    setNewOwner("");setShowAdd(false);reloadOwners();
  };

  const delOwner=async owner=>{
    const [c,p,v]=await Promise.all([db.from("my_cards").filter("owner_id",owner.id),db.from("my_programs").filter("owner_id",owner.id),db.from("vouchers").filter("owner_id",owner.id)]);
    const n=(c.data||[]).length+(p.data||[]).length+(v.data||[]).length;
    if(n>0) return alert("Cannot delete \""+owner.name+"\" - they have "+n+" linked cards, programs or vouchers. Reassign or delete those first.");
    if(!confirm("Delete owner \""+owner.name+"\"?")) return;
    await db.from("owners").delete(owner.id);
    reloadOwners();
  };

  const resetAll=async()=>{
    const conf=window.prompt("This will permanently delete ALL data.\n\nType DELETE to confirm:");
    if(conf!=="DELETE") return;
    setResetting(true);
    const u=localStorage.getItem("pv_u"),k=localStorage.getItem("pv_k");
    const h={apikey:k,Authorization:"Bearer "+k,"Content-Type":"application/json"};
    for(const t of ["point_transactions","transfer_log","vouchers","my_cards","my_programs","master_partners","master_cards","master_programs","owners"]){
      await fetch(u+"/rest/v1/"+t+"?created_at=gte.2000-01-01",{method:"DELETE",headers:h}).catch(()=>{});
    }
    setResetting(false);
    alert("All data deleted.");window.location.reload();
  };

  return(
    <div>
      <Hdr title="Settings"/>
      <div style={{maxWidth:520}}>
        <Card style={{marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div style={{fontSize:11,fontWeight:700,color:mut,textTransform:"uppercase",letterSpacing:"0.08em"}}>Owners</div>
            <button style={{...gbtn,padding:"6px 14px",fontSize:12}} onClick={()=>setShowAdd(true)}>+ Add Owner</button>
          </div>
          {owners.length===0?<div style={{color:mut,fontSize:13}}>No owners yet</div>:owners.map(o=>(
            <div key={o.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:`1px solid ${bdr}`}}>
              <div style={{fontSize:14,fontWeight:600,color:txt}}>{o.name}</div>
              <button style={{...dbtn,padding:"4px 10px",fontSize:12}} onClick={()=>delOwner(o)}>Delete</button>
            </div>
          ))}
        </Card>
        <Card style={{marginBottom:16}}>
          <div style={{fontSize:11,fontWeight:700,color:mut,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:12}}>Database Connection</div>
          <div style={{fontSize:12,color:mut,marginBottom:4}}>Connected to</div>
          <div style={{fontSize:12,color:txt,fontFamily:"monospace",background:surf2,padding:"8px 12px",borderRadius:8,marginBottom:16,wordBreak:"break-all",border:`1px solid ${bdr}`}}>{localStorage.getItem("pv_u")}</div>
          <button style={dbtn} onClick={()=>{localStorage.removeItem("pv_u");localStorage.removeItem("pv_k");onDisconnect();}}>Disconnect</button>
        </Card>
        <div style={{background:"#fef2f2",border:"1.5px solid #fecaca",borderRadius:12,padding:"18px 20px"}}>
          <div style={{fontSize:11,fontWeight:700,color:red,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.08em"}}>Danger Zone</div>
          <div style={{fontSize:13,color:mut,marginBottom:14}}>Permanently delete all data and reset PointsVault to blank.</div>
          <button style={{...dbtn,background:red,color:"#fff",border:"none",opacity:resetting?0.6:1}} onClick={resetting?undefined:resetAll}>{resetting?"Deleting...":"Reset All Data"}</button>
        </div>
      </div>
      <Modal show={showAdd} onClose={()=>setShowAdd(false)} title="Add Owner">
        {lbl("Name")}<input style={inp} placeholder="Gavin, Wife, Kids..." value={newOwner} onChange={e=>setNewOwner(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addOwner()}/>
        <button style={{...pbtn,width:"100%",justifyContent:"center"}} onClick={addOwner}>Add Owner</button>
      </Modal>
    </div>
  );
}

// Shell
const TABS=[
  {id:"overview",         label:"Overview",         icon:"o"},
  {id:"catalog",          label:"Catalog",          icon:"C"},
  {id:"my-cards",         label:"My Cards",         icon:"cc"},
  {id:"my-programs",      label:"My Programs",      icon:"lp"},
  {id:"transfer",         label:"Transfer Points",  icon:"->"},
  {id:"transfer-history", label:"Transfer History", icon:"h"},
  {id:"vouchers",         label:"Vouchers",         icon:"v"},
  {id:"settings",         label:"Settings",         icon:"s"},
];

export default function App(){
  const [db,setDb]=useState(null);
  const [tab,setTab]=useState("overview");
  const [menuOpen,setMenuOpen]=useState(false);
  const [owners,setOwners]=useState([]);

  useEffect(()=>{
    const u=localStorage.getItem("pv_u"),k=localStorage.getItem("pv_k");
    if(u&&k){const c=createClient(u,k);setDb(c);loadOwners(c);}
  },[]);

  const loadOwners=async client=>{
    const {data}=await (client||db).from("owners").select();
    setOwners(data||[]);
  };

  if(!db) return <Setup onDone={c=>{setDb(c);loadOwners(c);}}/>;

  return(
    <div style={{minHeight:"100vh",background:bg,color:txt,fontFamily:"'Inter',system-ui,sans-serif",fontSize:14}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;}
        body{background:${bg};font-family:'Inter',system-ui,sans-serif;}
        @media(max-width:640px){.desk-nav{display:none!important}.mob-hdr{display:flex!important}.main-wrap{margin-left:0!important;padding:16px!important;padding-top:68px!important}}
        @media(min-width:641px){.mob-hdr{display:none!important}}
        input:focus,select:focus{border-color:${acc}!important;box-shadow:0 0 0 3px ${acc}20;}
        input,select,button{font-family:inherit;}
        tr:hover td{background:${surf2};}
        ::-webkit-scrollbar{width:4px;height:4px;}
        ::-webkit-scrollbar-thumb{background:${bdr2};border-radius:10px;}
      `}</style>
      <nav className="desk-nav" style={{position:"fixed",top:0,left:0,bottom:0,width:216,background:surf,borderRight:`1px solid ${bdr}`,display:"flex",flexDirection:"column",zIndex:10,boxShadow:"1px 0 8px rgba(0,0,0,0.04)"}}>
        <div style={{padding:"24px 20px 20px",borderBottom:`1px solid ${bdr}`}}>
          <div style={{fontSize:17,fontWeight:800,color:txt,letterSpacing:"-0.03em"}}>PointsVault</div>
          <div style={{fontSize:10,color:mut,marginTop:3,letterSpacing:"0.1em",textTransform:"uppercase"}}>Rewards Tracker</div>
        </div>
        <div style={{flex:1,paddingTop:8,overflowY:"auto"}}>
          {TABS.map(t=>(
            <div key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",alignItems:"center",gap:9,padding:"10px 20px",cursor:"pointer",fontSize:12,fontWeight:tab===t.id?600:400,color:tab===t.id?txt:mut,background:tab===t.id?surf2:"transparent",borderLeft:tab===t.id?`2px solid ${acc}`:"2px solid transparent",transition:"all 0.12s"}}>
              {t.label}
            </div>
          ))}
        </div>
        <div style={{padding:"12px 20px 20px",borderTop:`1px solid ${bdr}`}}>
          <div style={{fontSize:10,color:mut,letterSpacing:"0.08em",textTransform:"uppercase"}}>Synced with Supabase</div>
        </div>
      </nav>
      <div className="mob-hdr" style={{display:"none",position:"fixed",top:0,left:0,right:0,height:56,background:surf,borderBottom:`1px solid ${bdr}`,alignItems:"center",justifyContent:"space-between",padding:"0 16px",zIndex:100}}>
        <div style={{fontSize:15,fontWeight:800,color:txt}}>PointsVault</div>
        <button onClick={()=>setMenuOpen(o=>!o)} style={{background:"none",border:"none",cursor:"pointer",color:txt,fontSize:22,padding:"0 4px"}}>menu</button>
      </div>
      {menuOpen&&(
        <div style={{position:"fixed",top:56,left:0,right:0,background:surf,borderBottom:`1px solid ${bdr}`,zIndex:99,boxShadow:"0 4px 16px rgba(0,0,0,0.08)"}}>
          {TABS.map(t=><div key={t.id} onClick={()=>{setTab(t.id);setMenuOpen(false);}} style={{padding:"12px 20px",cursor:"pointer",fontSize:13,fontWeight:tab===t.id?600:400,color:tab===t.id?txt:mut,background:tab===t.id?surf2:"transparent",borderBottom:`1px solid ${bdr}`}}>{t.label}</div>)}
        </div>
      )}
      <main className="main-wrap" style={{marginLeft:216,padding:"32px 36px 80px",minHeight:"100vh"}}>
        {tab==="overview"         &&<Overview db={db} owners={owners} onNavigate={setTab}/>}
        {tab==="catalog"          &&<Catalog db={db}/>}
        {tab==="my-cards"         &&<MyCards db={db} owners={owners}/>}
        {tab==="my-programs"      &&<MyPrograms db={db} owners={owners}/>}
        {tab==="transfer"         &&<TransferPoints db={db} owners={owners}/>}
        {tab==="transfer-history" &&<TransferHistory db={db} owners={owners}/>}
        {tab==="vouchers"         &&<Vouchers db={db} owners={owners}/>}
        {tab==="settings"         &&<Settings db={db} owners={owners} reloadOwners={()=>loadOwners()} onDisconnect={()=>setDb(null)}/>}
      </main>
    </div>
  );
}
