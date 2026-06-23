import { useState, useEffect, useCallback } from "react";

function createSupabaseClient(url, anonKey) {
  const h = { apikey: anonKey, Authorization: `Bearer ${anonKey}`, "Content-Type": "application/json", Prefer: "return=representation" };
  const base = `${url}/rest/v1`;
  const req = async (path, opts = {}) => {
    try {
      const r = await fetch(`${base}${path}`, { ...opts, headers: h });
      let data = null;
      try { data = await r.json(); } catch(_) {}
      return { data: Array.isArray(data) ? data : data ? [data] : [], error: r.ok ? null : data, status: r.status };
    } catch(e) { return { data: [], error: { message: e.message }, status: 0 }; }
  };
  const storageBase = `${url}/storage/v1`;
  const storageH = { apikey: anonKey, Authorization: `Bearer ${anonKey}` };

  return {
    from: t => ({
      select: (q="") => req(`/${t}?select=*${q}`),
      insert: row => req(`/${t}`, { method: "POST", body: JSON.stringify(row) }),
      update: (id, row) => req(`/${t}?id=eq.${id}`, { method: "PATCH", body: JSON.stringify(row) }),
      delete: id => req(`/${t}?id=eq.${id}`, { method: "DELETE" }),
      filter: (col, val) => req(`/${t}?select=*&${col}=eq.${encodeURIComponent(val)}`),
    }),
    storage: {
      upload: async (bucket, path, file) => {
        try {
          const uploadUrl = `${storageBase}/object/${bucket}/${path}`;
          console.log("[Logo] Uploading to:", uploadUrl, "type:", file.type, "size:", file.size);
          const r = await fetch(uploadUrl, {
            method: "POST",
            headers: {
              apikey: anonKey,
              Authorization: `Bearer ${anonKey}`,
              "Content-Type": file.type,
              "x-upsert": "true",
            },
            body: file,
          });
          const responseText = await r.text();
          console.log("[Logo] POST response status:", r.status, "body:", responseText);
          if (r.ok) {
            let data = {};
            try { data = JSON.parse(responseText); } catch(_){}
            return { data, error: null };
          }
          // Try PUT
          console.log("[Logo] POST failed, trying PUT...");
          const r2 = await fetch(uploadUrl, {
            method: "PUT",
            headers: {
              apikey: anonKey,
              Authorization: `Bearer ${anonKey}`,
              "Content-Type": file.type,
              "x-upsert": "true",
            },
            body: file,
          });
          const responseText2 = await r2.text();
          console.log("[Logo] PUT response status:", r2.status, "body:", responseText2);
          let data2 = {};
          try { data2 = JSON.parse(responseText2); } catch(_){}
          if (!r2.ok) return { data: null, error: { message: `Upload failed: ${r2.status} ${responseText2}` } };
          return { data: data2, error: null };
        } catch(e) {
          console.log("[Logo] Upload exception:", e.message);
          return { data: null, error: { message: e.message } };
        }
      },
      getPublicUrl: (bucket, path) => {
        const publicUrl = `${url}/storage/v1/object/public/${bucket}/${path}`;
        console.log("[Logo] Public URL:", publicUrl);
        return publicUrl;
      },
    },
  };
}

const SETUP_SQL = `-- Run in Supabase SQL Editor
CREATE TABLE IF NOT EXISTS cc_cards (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL, bank text, last4 text, network text,
  points_balance bigint DEFAULT 0, opening_balance bigint DEFAULT 0,
  points_currency text DEFAULT 'pts', inr_per_point numeric DEFAULT 0,
  stmt_date int, annual_fee numeric DEFAULT 0, color text DEFAULT '#4f46e5',
  created_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS loyalty_programs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL, category text, points_balance bigint DEFAULT 0,
  opening_balance bigint DEFAULT 0, inr_per_point numeric DEFAULT 0,
  expiry_date date, expiry_rule text, tier text, color text DEFAULT '#7c3aed',
  created_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS transfer_partners (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  from_program text NOT NULL, to_program text NOT NULL,
  ratio_from numeric DEFAULT 1, ratio_to numeric DEFAULT 1,
  min_transfer int, max_monthly int, transfer_time text, notes text,
  created_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS vouchers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  program text NOT NULL, description text, value text,
  expiry_date date, redeemed boolean DEFAULT false, notes text,
  created_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS point_transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  program_name text NOT NULL, program_type text NOT NULL,
  points bigint NOT NULL, description text, txn_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);
-- Add new columns if upgrading existing tables
ALTER TABLE cc_cards ADD COLUMN IF NOT EXISTS opening_balance bigint DEFAULT 0;
ALTER TABLE cc_cards ADD COLUMN IF NOT EXISTS inr_per_point numeric DEFAULT 0;
ALTER TABLE loyalty_programs ADD COLUMN IF NOT EXISTS opening_balance bigint DEFAULT 0;
ALTER TABLE loyalty_programs ADD COLUMN IF NOT EXISTS inr_per_point numeric DEFAULT 0;
ALTER TABLE point_transactions ADD COLUMN IF NOT EXISTS amount numeric DEFAULT 0;
ALTER TABLE point_transactions ADD COLUMN IF NOT EXISTS txn_type text DEFAULT 'debit';
ALTER TABLE cc_cards ADD COLUMN IF NOT EXISTS logo_url text DEFAULT NULL;
ALTER TABLE loyalty_programs ADD COLUMN IF NOT EXISTS logo_url text DEFAULT NULL;
CREATE TABLE IF NOT EXISTS transfer_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  from_program text NOT NULL,
  to_program text NOT NULL,
  points_sent bigint NOT NULL,
  points_received bigint NOT NULL,
  bonus_miles bigint DEFAULT 0,
  ratio_from numeric DEFAULT 1,
  ratio_to numeric DEFAULT 1,
  transfer_date date NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);`;

// ── Theme: monochrome + gold ─────────────────────────────────────────────────
const bg    = "#fafaf9";         // near-white
const surf  = "#ffffff";         // white
const surf2 = "#f4f4f2";         // light gray surface
const surf3 = "#edede9";         // hover
const bdr   = "#e8e8e4";         // light border
const bdr2  = "#d4d4cf";         // stronger border
const txt   = "#111110";         // near-black
const mut   = "#a0a09a";         // muted gray
const mut2  = "#6b6b66";         // secondary
const acc   = "#c49a3c";         // gold
const acc2  = "#9a7c2e";         // darker gold
const grn   = "#1a7a4a";         // muted green (sparingly)
const red   = "#c13333";         // muted red (sparingly)
const gold  = "#c49a3c";         // gold alias

const inp = {
  width:"100%", padding:"10px 14px",
  background:surf, border:`1.5px solid ${bdr}`,
  borderRadius:8, color:txt, fontSize:13,
  outline:"none", boxSizing:"border-box", marginBottom:12,
  transition:"border-color 0.15s",
  fontFamily:"inherit",
};
const pbtn = { display:"inline-flex", alignItems:"center", gap:7, padding:"9px 18px", borderRadius:8, border:`1.5px solid ${txt}`, cursor:"pointer", fontSize:13, fontWeight:600, background:txt, color:"#fff", letterSpacing:"0.01em" };
const gbtn = { ...pbtn, background:surf, color:mut2, border:`1.5px solid ${bdr}` };
const dbtn = { ...pbtn, background:surf, color:red, border:`1.5px solid ${bdr}` };
const sbtn = { ...pbtn, background:surf, color:grn, border:`1.5px solid ${bdr}` };

function lbl(t) {
  return <div style={{fontSize:11,color:mut,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:5}}>{t}</div>;
}

function inrFmt(v) {
  if (v >= 100000) return "₹" + (v/100000).toFixed(1) + "L";
  if (v >= 1000) return "₹" + (v/1000).toFixed(1) + "K";
  return "₹" + Math.round(v).toLocaleString("en-IN");
}
function ordinal(n) {
  const s = ["th","st","nd","rd"], v = n % 100;
  return n + (s[(v-20)%10] || s[v] || s[0]);
}
function progLabel(name, last4OrNum) {
  if (!last4OrNum) return name;
  return `${name} (${last4OrNum})`;
}

// ── Logo components ───────────────────────────────────────────────────────────
function LogoCircle({ url, name, color="#b5862a", size=40 }) {
  const [imgErr, setImgErr] = useState(false);
  const initials = (name||"?").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  const showImg = url && url.length > 10 && !imgErr;
  return (
    <div style={{width:size,height:size,borderRadius:size*0.28,overflow:"hidden",flexShrink:0,border:`1.5px solid ${showImg?bdr:color+"33"}`,background:showImg?surf2:color+"15",display:"flex",alignItems:"center",justifyContent:"center"}}>
      {showImg ? (
        <img
          src={url}
          alt={name||""}
          style={{width:"100%",height:"100%",objectFit:"contain",padding:size*0.07,display:"block"}}
          onError={(e)=>{ console.log("[Logo] Image failed to load:", url, e.type); setImgErr(true); }}
          onLoad={()=>console.log("[Logo] Image loaded OK:", url)}
        />
      ) : (
        <span style={{fontSize:size*0.33,fontWeight:700,color,lineHeight:1,userSelect:"none"}}>{initials}</span>
      )}
    </div>
  );
}

function LogoUpload({ current, onUpload, size=56 }) {
  const fileRef = useState(null);
  const inputRef = { current: null };
  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return alert("Please upload an image file (PNG, JPG, SVG)");
    if (file.size > 2000000) return alert("Image must be under 2MB");
    const reader = new FileReader();
    reader.onload = (e) => onUpload(file, e.target.result);
    reader.onerror = () => alert("Could not read file");
    reader.readAsDataURL(file);
  };
  const triggerInput = () => {
    const el = document.querySelector(".pv-logo-input:not([data-used])");
    if (el) el.click();
  };
  return (
    <div>
      <div style={{fontSize:11,color:mut,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:8}}>Logo (optional)</div>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:size,height:size,borderRadius:14,border:`2px dashed ${bdr2}`,background:surf2,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",cursor:"pointer",flexShrink:0}}
          onClick={e=>{e.currentTarget.nextElementSibling?.querySelector("input")?.click()}}>
          {current
            ? <img src={current} alt="logo" style={{width:"100%",height:"100%",objectFit:"contain"}}/>
            : <span style={{fontSize:22}}>🖼️</span>
          }
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <label style={{...gbtn,padding:"7px 14px",fontSize:12,cursor:"pointer"}}>
              {current ? "Change Logo" : "Upload Logo"}
              <input type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>
            </label>
            {current && <button type="button" style={{...dbtn,padding:"7px 14px",fontSize:12}} onClick={()=>onUpload(null,null)}>Remove</button>}
          </div>
          <div style={{fontSize:11,color:mut}}>PNG, JPG · min 32×32px · max 2MB</div>
        </div>
      </div>
    </div>
  );
}

function SearchBar({ value, onChange, placeholder="Search…" }) {
  return (
    <div style={{position:"relative",marginBottom:20}}>
      <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:mut,fontSize:14}}>🔍</span>
      <input
        style={{...inp,paddingLeft:36,marginBottom:0,background:surf,border:`1.5px solid ${bdr}`}}
        placeholder={placeholder}
        value={value}
        onChange={e=>onChange(e.target.value)}
      />
    </div>
  );
}

function SortBar({ options, value, onChange }) {
  return (
    <div style={{display:"flex",gap:6,marginBottom:20,flexWrap:"wrap"}}>
      {options.map(o=>(
        <button key={o.value} onClick={()=>onChange(o.value)}
          style={{padding:"5px 12px",borderRadius:10,border:`1.5px solid ${value===o.value?acc:bdr}`,cursor:"pointer",fontSize:12,fontWeight:value===o.value?700:400,background:value===o.value?acc+"10":"transparent",color:value===o.value?acc:mut,transition:"all 0.15s"}}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Modal({ show, onClose, title, children }) {
  if (!show) return null;
  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{position:"fixed",inset:0,background:"rgba(26,26,46,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,padding:20,backdropFilter:"blur(4px)"}}>
      <div style={{background:surf,border:`1.5px solid ${bdr}`,borderRadius:10,padding:28,width:"100%",maxWidth:480,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(26,26,46,0.15)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
          <span style={{fontSize:17,fontWeight:700,color:txt}}>{title}</span>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:mut,fontSize:22,lineHeight:1,padding:"0 4px"}}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function BackBtn({ onClick }) {
  return <button onClick={onClick} style={{...gbtn,padding:"7px 14px",fontSize:12,marginBottom:20}}>← Back</button>;
}

function StatBox({ label, value, sub, color=txt }) {
  return (
    <div style={{background:surf2,borderRadius:10,padding:"12px 16px",flex:1,minWidth:110,border:`1px solid ${bdr}`}}>
      <div style={{fontSize:10,color:mut,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:5,fontWeight:600}}>{label}</div>
      <div style={{fontSize:20,fontWeight:700,color,letterSpacing:"-0.02em"}}>{value}</div>
      {sub&&<div style={{fontSize:11,color:mut,marginTop:2}}>{sub}</div>}
    </div>
  );
}

// ── Setup ─────────────────────────────────────────────────────────────────────
function Setup({ onDone }) {
  const [url,setUrl]=useState(""); const [key,setKey]=useState(""); const [msg,setMsg]=useState("");
  const go = async () => {
    if(!url||!key) return setMsg("Both fields required");
    const u=url.trim().replace(/\/+$/,"").replace(/\/rest\/v1\/?$/,"");
    const k=key.trim();
    try { const r=await fetch(`${u}/rest/v1/cc_cards?select=id&limit=1`,{headers:{apikey:k,Authorization:`Bearer ${k}`}}); if(r.status===401||r.status===403) return setMsg("Invalid key"); } catch(_){}
    localStorage.setItem("pv_u",u); localStorage.setItem("pv_k",k);
    onDone(createSupabaseClient(u,k));
  };
  return (
    <div style={{minHeight:"100vh",background:`linear-gradient(135deg, ${bg} 0%, #ede8f5 100%)`,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"Inter,system-ui,sans-serif",color:txt}}>
      <div style={{maxWidth:420,width:"100%"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontSize:32,fontWeight:900,color:acc,letterSpacing:"-0.04em"}}>PointsVault</div>
          <div style={{fontSize:14,color:mut,marginTop:6}}>Your loyalty &amp; cards dashboard</div>
        </div>
        <div style={{background:surf,border:`1.5px solid ${bdr}`,borderRadius:10,padding:28,boxShadow:"0 8px 32px rgba(79,70,229,0.08)"}}>
          {lbl("Supabase Project URL")}<input style={inp} placeholder="https://xxxx.supabase.co" value={url} onChange={e=>setUrl(e.target.value)}/>
          {lbl("Anon Public Key")}<input style={inp} type="password" placeholder="eyJ..." value={key} onChange={e=>setKey(e.target.value)}/>
          {msg&&<div style={{color:red,fontSize:12,marginBottom:12,padding:"8px 12px",background:"#fef2f2",borderRadius:8}}>{msg}</div>}
          <button style={{...pbtn,width:"100%",justifyContent:"center",padding:"11px 16px"}} onClick={go}>Connect →</button>
        </div>
      </div>
    </div>
  );
}

// ── Add Transfer Partner Modal ────────────────────────────────────────────────
function AddPartnerModal({ show, onClose, db, defaultFrom, cards, loyalties, onSaved }) {
  const empty={from_type:"card",from_program:defaultFrom||"",to_type:"loyalty",to_program:"",ratio_from:"1",ratio_to:"1",min_transfer:"",max_monthly:"",transfer_time:"",notes:""};
  const [f,setF]=useState(empty);
  const up=k=>e=>setF(p=>({...p,[k]:e.target.value}));
  useEffect(()=>{ if(show) setF({...empty,from_program:defaultFrom||""}); },[show,defaultFrom]);
  const optionsFor=type=>type==="card"?cards.map(c=>c.name):loyalties.map(l=>l.name);
  const save=async()=>{
    if(!f.from_program||!f.to_program) return alert("Select both programs");
    const p={from_program:f.from_program,to_program:f.to_program,ratio_from:parseFloat(f.ratio_from)||1,ratio_to:parseFloat(f.ratio_to)||1,min_transfer:parseInt(f.min_transfer)||null,max_monthly:parseInt(f.max_monthly)||null,transfer_time:f.transfer_time,notes:f.notes};
    const {error}=await db.from("transfer_partners").insert(p);
    if(error) return alert("Error: "+JSON.stringify(error));
    onSaved(); onClose();
  };
  return (
    <Modal show={show} onClose={onClose} title="Add Transfer Partner">
      <div style={{background:acc+"08",border:`1.5px solid ${acc}22`,borderRadius:12,padding:14,marginBottom:14}}>
        <div style={{fontSize:11,color:acc,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:10}}>From</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Type")}<select style={inp} value={f.from_type} onChange={e=>setF(p=>({...p,from_type:e.target.value,from_program:""}))}><option value="card">Credit Card</option><option value="loyalty">Loyalty Program</option></select></div>
          <div>{lbl("Program")}<select style={inp} value={f.from_program} onChange={up("from_program")}><option value="">— select —</option>{optionsFor(f.from_type).map(o=><option key={o} value={o}>{o}</option>)}</select></div>
        </div>
      </div>
      <div style={{background:grn+"08",border:`1.5px solid ${grn}22`,borderRadius:12,padding:14,marginBottom:14}}>
        <div style={{fontSize:11,color:grn,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:10}}>To</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Type")}<select style={inp} value={f.to_type} onChange={e=>setF(p=>({...p,to_type:e.target.value,to_program:""}))}><option value="card">Credit Card</option><option value="loyalty">Loyalty Program</option></select></div>
          <div>{lbl("Program")}<select style={inp} value={f.to_program} onChange={up("to_program")}><option value="">— select —</option>{optionsFor(f.to_type).map(o=><option key={o} value={o}>{o}</option>)}</select></div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div>{lbl("Ratio From")}<input style={inp} type="number" step="0.1" value={f.ratio_from} onChange={up("ratio_from")}/></div>
        <div>{lbl("Ratio To")}<input style={inp} type="number" step="0.1" value={f.ratio_to} onChange={up("ratio_to")}/></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div>{lbl("Min Transfer")}<input style={inp} type="number" placeholder="1000" value={f.min_transfer} onChange={up("min_transfer")}/></div>
        <div>{lbl("Max / Month")}<input style={inp} type="number" placeholder="none" value={f.max_monthly} onChange={up("max_monthly")}/></div>
      </div>
      {lbl("Transfer Time")}<input style={inp} placeholder="Instant / 3-5 days" value={f.transfer_time} onChange={up("transfer_time")}/>
      {lbl("Notes")}<input style={inp} placeholder="Any conditions..." value={f.notes} onChange={up("notes")}/>
      <button style={{...pbtn,width:"100%",justifyContent:"center",marginTop:4}} onClick={save}>Add Partner</button>
    </Modal>
  );
}

// ── Points History Table ──────────────────────────────────────────────────────
function PointsTable({ txns, openingBalance }) {
  if (!txns || txns.length===0) return (
    <div style={{textAlign:"center",padding:"30px 20px",color:mut,fontSize:13}}>
      No transactions yet. Use "+ Add Transaction" to record points.
    </div>
  );
  const sorted=[...txns].sort((a,b)=>new Date(a.txn_date)-new Date(b.txn_date)||new Date(a.created_at)-new Date(b.created_at));
  let bal=openingBalance||0;
  const rows=sorted.map(t=>{ const open=bal; bal+=t.points; return {...t,opening:open,closing:bal}; });
  const display=rows.reverse();
  return (
    <div style={{overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
        <thead>
          <tr style={{color:mut,fontSize:11,textTransform:"uppercase",letterSpacing:"0.06em",borderBottom:`2px solid ${bdr}`}}>
            {["Date","Description","Points","Opening","Closing"].map(h=>(
              <th key={h} style={{textAlign:h==="Date"||h==="Description"?"left":"right",padding:"8px 12px",fontWeight:700,whiteSpace:"nowrap"}}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {display.map(t=>(
            <tr key={t.id} style={{borderBottom:`1px solid ${bdr}`}}>
              <td style={{padding:"10px 12px",color:mut,whiteSpace:"nowrap"}}>{new Date(t.txn_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</td>
              <td style={{padding:"10px 12px",color:txt}}>{t.description||"—"}</td>
              <td style={{padding:"10px 12px",textAlign:"right",fontWeight:700,color:t.points>0?grn:red}}>{t.points>0?"+":""}{t.points.toLocaleString()}</td>
              <td style={{padding:"10px 12px",textAlign:"right",color:mut}}>{t.opening.toLocaleString()}</td>
              <td style={{padding:"10px 12px",textAlign:"right",color:txt,fontWeight:600}}>{t.closing.toLocaleString()}</td>
            </tr>
          ))}
          <tr style={{borderTop:`2px solid ${bdr}`,background:surf2}}>
            <td style={{padding:"10px 12px",color:mut}} colSpan={2}><em style={{color:mut2,fontSize:12,fontWeight:600}}>Opening Balance</em></td>
            <td/><td/>
            <td style={{padding:"10px 12px",textAlign:"right",fontWeight:700,color:acc}}>{(openingBalance||0).toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ── Card Detail ───────────────────────────────────────────────────────────────
function CardDetail({ card:initialCard, db, onBack, onDelete, allCards, allLoyalties }) {
  const [card,setCard]=useState(initialCard);
  const [txns,setTxns]=useState([]); const [partners,setPartners]=useState([]);
  const [busy,setBusy]=useState(true);
  const [showTxn,setShowTxn]=useState(false);
  const [showPartner,setShowPartner]=useState(false);
  const [showEdit,setShowEdit]=useState(false);
  const tf={description:"",points:"",txn_date:new Date().toISOString().split("T")[0],type:"earn"};
  const [f,setF]=useState(tf);
  const up=k=>e=>setF(p=>({...p,[k]:e.target.value}));
  const nets=["Visa","Mastercard","Amex","Diners","RuPay","Other"];
  const nc={Visa:"#1a1f71",Mastercard:"#dc2626",Amex:"#0066b3",Diners:"#2c2c8c",RuPay:"#ea580c",Other:acc};
  const [ef,setEf]=useState({});
  const eup=k=>e=>setEf(p=>({...p,[k]:e.target.value}));

  const load=async()=>{
    setBusy(true);
    const [t,p]=await Promise.all([db.from("point_transactions").filter("program_name",card.name),db.from("transfer_partners").filter("from_program",card.name)]);
    const txnData = t.data||[];
    setTxns(txnData.sort((a,b)=>new Date(b.txn_date)-new Date(a.txn_date)));
    setPartners(p.data||[]);
    // Sync balance: opening_balance + sum of all transactions
    const txnSum = txnData.reduce((a,tx)=>a+tx.points,0);
    const correctBalance = (card.opening_balance||0) + txnSum;
    if (correctBalance !== (card.points_balance||0)) {
      await db.from("cc_cards").update(card.id, { points_balance: correctBalance });
      setCard(c=>({...c, points_balance: correctBalance}));
    }
    setBusy(false);
  };
  useEffect(()=>{ load(); },[]);

  const saveTxn=async()=>{
    if(!f.points) return alert("Enter points");
    const pts=f.type==="redeem"?-Math.abs(parseInt(f.points)):Math.abs(parseInt(f.points));
    const {error}=await db.from("point_transactions").insert({program_name:card.name,program_type:"card",points:pts,description:f.description,txn_date:f.txn_date});
    if(error) return alert("Error: "+JSON.stringify(error));
    const newBal=(card.points_balance||0)+pts;
    await db.from("cc_cards").update(card.id,{points_balance:newBal});
    setCard(c=>({...c,points_balance:newBal}));
    setShowTxn(false); setF(tf); load();
  };

  const [editLogoFile,setEditLogoFile]=useState(null);
  const [editLogoPreview,setEditLogoPreview]=useState(null);

  const saveEdit=async()=>{
    if(!ef.name?.trim()) return alert("Name required");
    const newOpening=parseInt(ef.opening_balance)||0;
    const txnSum=txns.reduce((a,t)=>a+t.points,0);
    const newBalance=newOpening+txnSum;
    let logo_url=card.logo_url||null;
    if(editLogoFile){
      const path=`cards/${card.id}-${Date.now()}.${editLogoFile.name.split(".").pop()}`;
      console.log("[Logo] CC edit - uploading:", editLogoFile.name, editLogoFile.type, editLogoFile.size);
      const {error:ue}=await db.storage.upload("logos",path,editLogoFile);
      if(ue){
        console.error("[Logo] CC upload error:", ue);
        alert("Logo upload failed: " + (ue.message||JSON.stringify(ue)) + "\n\nCheck: 1) Supabase Storage bucket 'logos' exists  2) Bucket is set to PUBLIC");
      } else {
        logo_url=db.storage.getPublicUrl("logos",path);
        console.log("[Logo] CC upload success, url:", logo_url);
      }
    } else if(editLogoPreview===null && card.logo_url) {
      logo_url=null;
    }
    const p={
      name:ef.name.trim(), bank:ef.bank, last4:ef.last4, network:ef.network,
      color:ef.color, points_currency:ef.points_currency,
      inr_per_point:parseFloat(ef.inr_per_point)||0,
      annual_fee:parseFloat(ef.annual_fee)||0,
      stmt_date:parseInt(ef.stmt_date)||null,
      opening_balance:newOpening,
      points_balance:newBalance,
      logo_url,
    };
    const {error}=await db.from("cc_cards").update(card.id,p);
    if(error) return alert("Error: "+JSON.stringify(error));
    setCard(c=>({...c,...p})); setEditLogoFile(null); setEditLogoPreview(null); setShowEdit(false);
  };

  const delCard=async()=>{ if(!confirm("Delete this card?")) return; await db.from("cc_cards").delete(card.id); onDelete(); };
  const delPartner=async id=>{ if(confirm("Remove partner?")){ await db.from("transfer_partners").delete(id); load(); } };

  const txnSum=txns.reduce((a,t)=>a+t.points,0);
  const openingBalance=card.opening_balance||0;
  const inrVal=(card.points_balance||0)*(card.inr_per_point||0);

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
        <BackBtn onClick={onBack}/>
        <div style={{display:"flex",gap:8}}>
          <button style={{...gbtn,padding:"7px 12px",fontSize:12}} onClick={()=>{ setEf({name:card.name,bank:card.bank||"",last4:card.last4||"",network:card.network||"Visa",points_currency:card.points_currency||"pts",inr_per_point:String(card.inr_per_point||""),stmt_date:String(card.stmt_date||""),annual_fee:String(card.annual_fee||""),color:card.color||"#4f46e5",opening_balance:String(card.opening_balance||"")}); setShowEdit(true); }}>✎ Edit</button>
          <button style={{...dbtn,padding:"7px 12px",fontSize:12}} onClick={delCard}>Delete</button>
        </div>
      </div>

      <div style={{background:surf,border:`1.5px solid ${bdr}`,borderRadius:14,padding:"22px 24px",borderTop:`4px solid ${card.color||acc}`,marginBottom:20,boxShadow:"0 4px 16px rgba(0,0,0,0.06)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
          <div style={{display:"flex",gap:14,alignItems:"center"}}>
            <LogoCircle url={card.logo_url} name={card.name} color={card.color||acc} size={52}/>
            <div>
              <div style={{fontSize:24,fontWeight:900,color:txt,letterSpacing:"-0.03em"}}>{card.name}</div>
              <div style={{fontSize:13,color:mut,marginTop:3}}>{card.bank}{card.last4?` ···· ${card.last4}`:""} · <span style={{fontWeight:500}}>{card.network}</span></div>
            </div>
          </div>
          <button style={pbtn} onClick={()=>{ setF(tf); setShowTxn(true); }}>+ Add Transaction</button>
        </div>
        <div style={{display:"flex",gap:12,marginTop:18,flexWrap:"wrap"}}>
          <StatBox label="Current Balance" value={(card.points_balance||0).toLocaleString()+" "+(card.points_currency||"pts")} color={txt}/>
          {card.inr_per_point>0&&<StatBox label="Approx INR Value" value={inrFmt(inrVal)} sub={`₹${card.inr_per_point}/pt`} color={grn}/>}
          {card.stmt_date&&<StatBox label="Statement Date" value={ordinal(card.stmt_date)} color={acc}/>}
          {card.annual_fee>0&&<StatBox label="Annual Fee" value={"₹"+Number(card.annual_fee).toLocaleString()} color={red}/>}
        </div>
      </div>

      <div style={{background:surf,border:`1.5px solid ${bdr}`,borderRadius:14,padding:"18px 22px",marginBottom:20,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:700,color:mut,textTransform:"uppercase",letterSpacing:"0.08em"}}>Transfer Partners</div>
          <button style={{...gbtn,padding:"6px 12px",fontSize:12}} onClick={()=>setShowPartner(true)}>+ Add Partner</button>
        </div>
        {partners.length===0?<div style={{color:mut,fontSize:13}}>No partners configured yet</div>:(
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {partners.map(p=>(
              <div key={p.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",background:surf2,borderRadius:10,border:`1.5px solid ${bdr}`,flexWrap:"wrap",gap:8}}>
                <div style={{fontSize:14,fontWeight:600,color:txt}}>{p.to_program}</div>
                <div style={{display:"flex",gap:14,alignItems:"center",flexWrap:"wrap"}}>
                  <div style={{textAlign:"center"}}><div style={{fontSize:14,fontWeight:800,color:acc}}>{p.ratio_from}:{p.ratio_to}</div><div style={{fontSize:10,color:mut,textTransform:"uppercase"}}>Ratio</div></div>
                  {p.min_transfer&&<div style={{textAlign:"center"}}><div style={{fontSize:12,color:txt,fontWeight:600}}>{Number(p.min_transfer).toLocaleString()}</div><div style={{fontSize:10,color:mut,textTransform:"uppercase"}}>Min</div></div>}
                  {p.transfer_time&&<div style={{textAlign:"center"}}><div style={{fontSize:12,color:grn,fontWeight:600}}>{p.transfer_time}</div><div style={{fontSize:10,color:mut,textTransform:"uppercase"}}>Time</div></div>}
                  <button style={{...dbtn,padding:"4px 8px",fontSize:11}} onClick={()=>delPartner(p.id)}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{background:surf,border:`1.5px solid ${bdr}`,borderRadius:14,padding:"18px 22px",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
        <div style={{fontSize:11,fontWeight:700,color:mut,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:14}}>Points History</div>
        {busy?<div style={{color:mut,padding:20,textAlign:"center"}}>Loading…</div>:<PointsTable txns={txns} openingBalance={openingBalance}/>}
      </div>

      <Modal show={showTxn} onClose={()=>setShowTxn(false)} title="Add Transaction">
        {lbl("Type")}<select style={inp} value={f.type} onChange={up("type")}><option value="earn">Earn (+ points)</option><option value="redeem">Redeem (- points)</option><option value="adjust">Manual Adjustment</option></select>
        {lbl("Points")}<input style={inp} type="number" placeholder="1000" value={f.points} onChange={up("points")}/>
        {lbl("Description")}<input style={inp} placeholder="Grocery spend, Welcome bonus..." value={f.description} onChange={up("description")}/>
        {lbl("Date")}<input style={inp} type="date" value={f.txn_date} onChange={up("txn_date")}/>
        <button style={{...pbtn,width:"100%",justifyContent:"center",marginTop:4}} onClick={saveTxn}>Save Transaction</button>
      </Modal>

      <Modal show={showEdit} onClose={()=>{ setShowEdit(false); setEditLogoFile(null); setEditLogoPreview(null); }} title="Edit Card">
        <div style={{marginBottom:16}}>
          <LogoUpload
            current={editLogoPreview !== null ? editLogoPreview : card.logo_url}
            onUpload={(file,preview)=>{ setEditLogoFile(file); setEditLogoPreview(preview); }}
          />
        </div>
        {lbl("Card Name *")}<input style={inp} value={ef.name||""} onChange={eup("name")}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Bank")}<input style={inp} value={ef.bank||""} onChange={eup("bank")}/></div>
          <div>{lbl("Last 4")}<input style={inp} maxLength={4} value={ef.last4||""} onChange={eup("last4")}/></div>
        </div>
        {lbl("Network")}<select style={inp} value={ef.network||"Visa"} onChange={eup("network")}>{nets.map(n=><option key={n}>{n}</option>)}</select>
        <div style={{background:"#fefce8",border:"1.5px solid #fde68a",borderRadius:10,padding:"10px 14px",marginBottom:12}}>
          <div style={{fontSize:11,color:"#92400e",fontWeight:700,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.06em"}}>⚠ Opening Balance</div>
          <div style={{fontSize:12,color:"#78350f",marginBottom:8}}>Editing this rewrites the opening balance only — it does not affect recorded transactions.</div>
          {lbl("Points Opening Balance")}<input style={inp} type="number" value={ef.opening_balance||""} onChange={eup("opening_balance")}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Points Unit")}<input style={inp} value={ef.points_currency||""} onChange={eup("points_currency")}/></div>
          <div>{lbl("INR per Point")}<input style={inp} type="number" step="0.01" placeholder="0.25" value={ef.inr_per_point||""} onChange={eup("inr_per_point")}/></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Statement Date")}<input style={inp} type="number" value={ef.stmt_date||""} onChange={eup("stmt_date")}/></div>
          <div>{lbl("Annual Fee ₹")}<input style={inp} type="number" value={ef.annual_fee||""} onChange={eup("annual_fee")}/></div>
        </div>
        <button style={{...pbtn,width:"100%",justifyContent:"center",marginTop:4}} onClick={saveEdit}>Save Changes</button>
      </Modal>

      <AddPartnerModal show={showPartner} onClose={()=>setShowPartner(false)} db={db} defaultFrom={card.name} cards={allCards} loyalties={allLoyalties} onSaved={load}/>
    </div>
  );
}

// ── LP Detail ─────────────────────────────────────────────────────────────────
function LPDetail({ prog:initialProg, db, onBack, onDelete, allCards, allLoyalties }) {
  const [prog,setProg]=useState(initialProg);
  const [txns,setTxns]=useState([]); const [partners,setPartners]=useState([]);
  const [busy,setBusy]=useState(true);
  const [showTxn,setShowTxn]=useState(false);
  const [showPartner,setShowPartner]=useState(false);
  const [showEdit,setShowEdit]=useState(false);
  const tf={description:"",points:"",txn_date:new Date().toISOString().split("T")[0],type:"earn"};
  const [f,setF]=useState(tf);
  const up=k=>e=>setF(p=>({...p,[k]:e.target.value}));
  const cats=["Airline","Hotel","Retail","Dining","Fuel","Other"];
  const cc={Airline:acc,Hotel:acc,Retail:acc,Dining:acc,Fuel:acc,Other:acc};
  const [ef,setEf]=useState({});
  const eup=k=>e=>setEf(p=>({...p,[k]:e.target.value}));

  const load=async()=>{
    setBusy(true);
    const [t,p]=await Promise.all([db.from("point_transactions").filter("program_name",prog.name),db.from("transfer_partners").filter("from_program",prog.name)]);
    const txnData = t.data||[];
    setTxns(txnData.sort((a,b)=>new Date(b.txn_date)-new Date(a.txn_date)));
    setPartners(p.data||[]);
    // Sync balance
    const txnSum = txnData.reduce((a,tx)=>a+tx.points,0);
    const correctBalance = (prog.opening_balance||0) + txnSum;
    if (correctBalance !== (prog.points_balance||0)) {
      await db.from("loyalty_programs").update(prog.id, { points_balance: correctBalance });
      setProg(x=>({...x, points_balance: correctBalance}));
    }
    setBusy(false);
  };
  useEffect(()=>{ load(); },[]);

  const saveTxn=async()=>{
    if(!f.points) return alert("Enter points");
    const pts=f.type==="redeem"?-Math.abs(parseInt(f.points)):Math.abs(parseInt(f.points));
    const {error}=await db.from("point_transactions").insert({program_name:prog.name,program_type:"loyalty",points:pts,description:f.description,txn_date:f.txn_date});
    if(error) return alert("Error: "+JSON.stringify(error));
    const newBal=(prog.points_balance||0)+pts;
    await db.from("loyalty_programs").update(prog.id,{points_balance:newBal});
    setProg(p=>({...p,points_balance:newBal}));
    setShowTxn(false); setF(tf); load();
  };

  const [editLogoFile,setEditLogoFile]=useState(null);
  const [editLogoPreview,setEditLogoPreview]=useState(null);

  const saveEdit=async()=>{
    if(!ef.name?.trim()) return alert("Name required");
    const newOpening=parseInt(ef.opening_balance)||0;
    const txnSum=txns.reduce((a,t)=>a+t.points,0);
    const newBalance=newOpening+txnSum;
    let logo_url=prog.logo_url||null;
    if(editLogoFile){
      const path=`loyalty/${prog.id}-${Date.now()}.${editLogoFile.name.split(".").pop()}`;
      console.log("[Logo] LP edit - uploading file:", editLogoFile.name, editLogoFile.type, editLogoFile.size);
      const {error:ue}=await db.storage.upload("logos",path,editLogoFile);
      if(ue){
        console.error("[Logo] LP edit upload error:", ue);
        alert("Logo upload failed: " + (ue.message||JSON.stringify(ue)) + "\n\nCheck: 1) Supabase Storage bucket 'logos' exists  2) Bucket is set to PUBLIC");
      } else {
        logo_url=db.storage.getPublicUrl("logos",path);
        console.log("[Logo] LP edit upload success, url:", logo_url);
      }
    } else if(editLogoPreview===null && prog.logo_url){
      logo_url=null;
    }
    const p={name:ef.name.trim(),category:ef.category,tier:ef.tier,color:acc,expiry_date:ef.expiry_date||null,expiry_rule:ef.expiry_rule,inr_per_point:parseFloat(ef.inr_per_point)||0,opening_balance:newOpening,points_balance:newBalance,logo_url,loyalty_number:ef.loyalty_number||null};
    const {error}=await db.from("loyalty_programs").update(prog.id,p);
    if(error) return alert("Error: "+JSON.stringify(error));
    setProg(x=>({...x,...p})); setEditLogoFile(null); setEditLogoPreview(null); setShowEdit(false);
  };

  const delProg=async()=>{ if(!confirm("Delete this program?")) return; await db.from("loyalty_programs").delete(prog.id); onDelete(); };
  const delPartner=async id=>{ if(confirm("Remove partner?")){ await db.from("transfer_partners").delete(id); load(); } };

  const openingBalance=prog.opening_balance||0;
  const inrVal=(prog.points_balance||0)*(prog.inr_per_point||0);
  const days=d=>d?Math.round((new Date(d)-new Date())/86400000):null;
  const d=days(prog.expiry_date); const exp=d!==null&&d<60;

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
        <BackBtn onClick={onBack}/>
        <div style={{display:"flex",gap:8}}>
          <button style={{...gbtn,padding:"7px 12px",fontSize:12}} onClick={()=>{ setEf({name:prog.name,category:prog.category||"Airline",tier:prog.tier||"",color:prog.color||"#7c3aed",expiry_date:prog.expiry_date||"",expiry_rule:prog.expiry_rule||"",inr_per_point:String(prog.inr_per_point||""),opening_balance:String(prog.opening_balance||"")}); setShowEdit(true); }}>✎ Edit</button>
          <button style={{...dbtn,padding:"7px 12px",fontSize:12}} onClick={delProg}>Delete</button>
        </div>
      </div>

      <div style={{background:surf,border:`1.5px solid ${bdr}`,borderRadius:14,padding:"22px 24px",borderTop:`4px solid ${prog.color||acc2}`,marginBottom:20,boxShadow:"0 4px 16px rgba(0,0,0,0.06)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
          <div style={{display:"flex",gap:14,alignItems:"center"}}>
            <LogoCircle url={prog.logo_url} name={prog.name} color={prog.color||acc2} size={52}/>
            <div>
              <div style={{fontSize:24,fontWeight:900,color:txt,letterSpacing:"-0.03em"}}>{prog.name}</div>
              <div style={{fontSize:13,color:mut,marginTop:3}}>
                <span style={{fontWeight:500,color:mut}}>{prog.category}</span>
                {prog.tier&&<span> · {prog.tier}</span>}
                {prog.loyalty_number&&<span style={{color:mut}}> · #{prog.loyalty_number}</span>}
              </div>
            </div>
          </div>
          <button style={pbtn} onClick={()=>{ setF(tf); setShowTxn(true); }}>+ Add Transaction</button>
        </div>
        <div style={{display:"flex",gap:12,marginTop:18,flexWrap:"wrap"}}>
          <StatBox label="Current Balance" value={(prog.points_balance||0).toLocaleString()+" pts"} color={txt}/>
          {prog.inr_per_point>0&&<StatBox label="Approx INR Value" value={inrFmt(inrVal)} sub={`₹${prog.inr_per_point}/pt`} color={grn}/>}
          {prog.expiry_date&&<StatBox label="Expiry" value={d!==null?`${d}d left`:"—"} color={exp?red:acc}/>}
        </div>
        {prog.expiry_rule&&<div style={{fontSize:12,color:mut,marginTop:10}}>{prog.expiry_rule}</div>}
      </div>

      <div style={{background:surf,border:`1.5px solid ${bdr}`,borderRadius:14,padding:"18px 22px",marginBottom:20,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:700,color:mut,textTransform:"uppercase",letterSpacing:"0.08em"}}>Transfer Partners</div>
          <button style={{...gbtn,padding:"6px 12px",fontSize:12}} onClick={()=>setShowPartner(true)}>+ Add Partner</button>
        </div>
        {partners.length===0?<div style={{color:mut,fontSize:13}}>No partners configured yet</div>:(
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {partners.map(p=>(
              <div key={p.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",background:surf2,borderRadius:10,border:`1.5px solid ${bdr}`,flexWrap:"wrap",gap:8}}>
                <div style={{fontSize:14,fontWeight:600,color:txt}}>{p.to_program}</div>
                <div style={{display:"flex",gap:14,alignItems:"center",flexWrap:"wrap"}}>
                  <div style={{textAlign:"center"}}><div style={{fontSize:14,fontWeight:800,color:acc}}>{p.ratio_from}:{p.ratio_to}</div><div style={{fontSize:10,color:mut,textTransform:"uppercase"}}>Ratio</div></div>
                  {p.min_transfer&&<div style={{textAlign:"center"}}><div style={{fontSize:12,fontWeight:600,color:txt}}>{Number(p.min_transfer).toLocaleString()}</div><div style={{fontSize:10,color:mut,textTransform:"uppercase"}}>Min</div></div>}
                  {p.transfer_time&&<div style={{textAlign:"center"}}><div style={{fontSize:12,fontWeight:600,color:grn}}>{p.transfer_time}</div><div style={{fontSize:10,color:mut,textTransform:"uppercase"}}>Time</div></div>}
                  <button style={{...dbtn,padding:"4px 8px",fontSize:11}} onClick={()=>delPartner(p.id)}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{background:surf,border:`1.5px solid ${bdr}`,borderRadius:14,padding:"18px 22px",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
        <div style={{fontSize:11,fontWeight:700,color:mut,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:14}}>Points History</div>
        {busy?<div style={{color:mut,padding:20,textAlign:"center"}}>Loading…</div>:<PointsTable txns={txns} openingBalance={openingBalance}/>}
      </div>

      <Modal show={showTxn} onClose={()=>setShowTxn(false)} title="Add Transaction">
        {lbl("Type")}<select style={inp} value={f.type} onChange={up("type")}><option value="earn">Earn (+ points)</option><option value="redeem">Redeem (- points)</option><option value="adjust">Manual Adjustment</option></select>
        {lbl("Points")}<input style={inp} type="number" placeholder="1000" value={f.points} onChange={up("points")}/>
        {lbl("Description")}<input style={inp} placeholder="Flight booking, Hotel stay..." value={f.description} onChange={up("description")}/>
        {lbl("Date")}<input style={inp} type="date" value={f.txn_date} onChange={up("txn_date")}/>
        <button style={{...pbtn,width:"100%",justifyContent:"center",marginTop:4}} onClick={saveTxn}>Save Transaction</button>
      </Modal>

      <Modal show={showEdit} onClose={()=>{ setShowEdit(false); setEditLogoFile(null); setEditLogoPreview(null); }} title="Edit Program">
        <div style={{marginBottom:16}}>
          <LogoUpload
            current={editLogoPreview !== null ? editLogoPreview : prog.logo_url}
            onUpload={(file,preview)=>{ setEditLogoFile(file); setEditLogoPreview(preview); }}
          />
        </div>
        {lbl("Program Name *")}<input style={inp} value={ef.name||""} onChange={eup("name")}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Category")}<select style={inp} value={ef.category||"Airline"} onChange={eup("category")}>{cats.map(c=><option key={c}>{c}</option>)}</select></div>
          <div>{lbl("Tier")}<input style={inp} value={ef.tier||""} onChange={eup("tier")}/></div>
        </div>
        <div style={{background:"#fefce8",border:"1.5px solid #fde68a",borderRadius:10,padding:"10px 14px",marginBottom:12}}>
          <div style={{fontSize:11,color:"#92400e",fontWeight:700,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.06em"}}>⚠ Opening Balance</div>
          <div style={{fontSize:12,color:"#78350f",marginBottom:8}}>Editing this rewrites the opening balance only — does not affect recorded transactions.</div>
          {lbl("Points Opening Balance")}<input style={inp} type="number" value={ef.opening_balance||""} onChange={eup("opening_balance")}/>
        </div>
        {lbl("INR per Point")}<input style={inp} type="number" step="0.01" placeholder="0.50" value={ef.inr_per_point||""} onChange={eup("inr_per_point")}/>
        {lbl("Loyalty / Membership Number")}<input style={inp} placeholder="XXXX-XXXX-XXXX" value={ef.loyalty_number||""} onChange={eup("loyalty_number")}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Expiry Date")}<input style={inp} type="date" value={ef.expiry_date||""} onChange={eup("expiry_date")}/></div>
          <div style={{display:"flex",flexDirection:"column"}}>{lbl("Expiry Rule")}<input style={inp} value={ef.expiry_rule||""} onChange={eup("expiry_rule")}/></div>
        </div>
        <button style={{...pbtn,width:"100%",justifyContent:"center",marginTop:4}} onClick={saveEdit}>Save Changes</button>
      </Modal>

      <AddPartnerModal show={showPartner} onClose={()=>setShowPartner(false)} db={db} defaultFrom={prog.name} cards={allCards} loyalties={allLoyalties} onSaved={load}/>
    </div>
  );
}

// ── CC Chart Section ──────────────────────────────────────────────────────────
function CCChartSection({ rows, acc, surf, surf2, bdr, bdr2, txt, mut, grn, nc }) {
  const [view, setView] = useState("bank");
  const [hideZero, setHideZero] = useState(true);
  const views = [
    {id:"bank",   label:"By Bank"},
    {id:"card",   label:"By Card"},
    {id:"network",label:"By Network"},
    {id:"inr",    label:"By INR Value"},
  ];

  const buildData = () => {
    const map = {};
    rows.forEach(c => {
      let key, val;
      if (view === "bank")    { key = c.bank || "Other"; val = c.points_balance || 0; }
      if (view === "card")    { key = c.name; val = c.points_balance || 0; }
      if (view === "network") { key = c.network || "Other"; val = c.points_balance || 0; }
      if (view === "inr")     { key = c.name; val = (c.points_balance||0)*(c.inr_per_point||0); }
      if (key) map[key] = (map[key]||0) + val;
    });
    return Object.entries(map).sort((a,b)=>b[1]-a[1]);
  };

  const data = buildData();
  const max = data[0]?.[1] || 1;
  const isInr = view === "inr";
  const barColors = ["#b5862a","#1d4ed8","#059669","#ea580c","#dc2626","#8b5cf6","#0891b2","#64748b"];

  if (data.length === 0) return null;
  return (
    <div style={{background:surf,border:`1px solid ${bdr}`,borderRadius:14,padding:"18px 22px",marginBottom:20,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}>
        <div style={{fontSize:11,fontWeight:700,color:mut,letterSpacing:"0.1em",textTransform:"uppercase"}}>Distribution</div>
        <div style={{display:"flex",gap:4,alignItems:"center",flexWrap:"wrap"}}>
          {views.map(v=>(
            <button key={v.id} onClick={()=>setView(v.id)} style={{padding:"4px 10px",borderRadius:10,border:`1px solid ${view===v.id?acc:bdr}`,cursor:"pointer",fontSize:11,fontWeight:view===v.id?600:400,background:view===v.id?acc+"10":"transparent",color:view===v.id?acc:mut,transition:"all 0.15s"}}>
              {v.label}
            </button>
          ))}
          <label style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer",fontSize:11,color:mut,marginLeft:4}}>
            <input type="checkbox" checked={hideZero} onChange={e=>setHideZero(e.target.checked)} style={{accentColor:acc,cursor:"pointer"}}/>
            Hide zero
          </label>
        </div>
      </div>
      {data.filter(([,v])=>!hideZero||v>0).map(([label,val],i)=>(
        <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${bdr}`}}>
          <div style={{fontSize:13,fontWeight:500,color:txt}}>{label}</div>
          <div style={{fontSize:13,fontWeight:600,color:isInr?grn:txt}}>{isInr ? inrFmt(val) : val.toLocaleString("en-IN")}</div>
        </div>
      ))}
    </div>
  );
}

// ── LP Chart Section ──────────────────────────────────────────────────────────
function LPChartSection({ rows, acc, acc2, surf, surf2, bdr, bdr2, txt, mut, grn }) {
  const [view, setView] = useState("category");
  const [hideZero, setHideZero] = useState(true);
  const catColors2 = {Airline:acc,Hotel:acc,Retail:acc,Dining:acc,Fuel:acc,Other:acc};
  const cats = ["Airline","Hotel","Retail","Dining","Fuel","Other"];
  const barColors = ["#b5862a","#1d4ed8","#059669","#ea580c","#dc2626","#8b5cf6","#0891b2","#64748b"];

  const catViews = cats.filter(c=>rows.some(l=>l.category===c));
  const views = [
    {id:"category", label:"By Category"},
    {id:"program",  label:"By Program"},
    {id:"inr",      label:"By INR Value"},
    ...catViews.map(c=>({id:`cat_${c}`, label:c+" only"})),
  ];

  const buildData = () => {
    let filtered = rows;
    if (view.startsWith("cat_")) filtered = rows.filter(l=>l.category===view.slice(4));
    const map = {};
    filtered.forEach(l => {
      let key, val;
      if (view === "category")        { key = l.category||"Other"; val = l.points_balance||0; }
      else if (view === "program")    { key = l.name; val = l.points_balance||0; }
      else if (view === "inr")        { key = l.name; val = (l.points_balance||0)*(l.inr_per_point||0); }
      else                            { key = l.name; val = l.points_balance||0; }
      if (key) map[key] = (map[key]||0) + val;
    });
    return Object.entries(map).sort((a,b)=>b[1]-a[1]);
  };

  const data = buildData();
  const max = data[0]?.[1] || 1;
  const isInr = view === "inr";

  if (data.length === 0) return (
    <div style={{background:surf,border:`1px solid ${bdr}`,borderRadius:14,padding:"18px 22px",marginBottom:20,color:mut,fontSize:13,textAlign:"center"}}>
      No programs in this category yet
    </div>
  );

  const getColor = (label, i) => {
    if (view === "category") return catColors2[label] || barColors[i % barColors.length];
    return barColors[i % barColors.length];
  };

  return (
    <div style={{background:surf,border:`1px solid ${bdr}`,borderRadius:14,padding:"18px 22px",marginBottom:20,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}>
        <div style={{fontSize:11,fontWeight:700,color:mut,letterSpacing:"0.1em",textTransform:"uppercase"}}>Distribution</div>
        <div style={{display:"flex",gap:4,flexWrap:"wrap",alignItems:"center"}}>
          {views.map(v=>(
            <button key={v.id} onClick={()=>setView(v.id)} style={{padding:"4px 10px",borderRadius:10,border:`1px solid ${view===v.id?acc:bdr}`,cursor:"pointer",fontSize:11,fontWeight:view===v.id?600:400,background:view===v.id?acc+"10":"transparent",color:view===v.id?acc:mut,transition:"all 0.15s"}}>
              {v.label}
            </button>
          ))}
          <label style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer",fontSize:11,color:mut,marginLeft:4}}>
            <input type="checkbox" checked={hideZero} onChange={e=>setHideZero(e.target.checked)} style={{accentColor:acc,cursor:"pointer"}}/>
            Hide zero
          </label>
        </div>
      </div>
      {data.filter(([,v])=>!hideZero||v>0).map(([label,val],i)=>(
        <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${bdr}`}}>
          <div style={{fontSize:13,fontWeight:500,color:txt}}>{label}</div>
          <div style={{fontSize:13,fontWeight:600,color:isInr?grn:txt}}>{isInr ? inrFmt(val) : val.toLocaleString("en-IN")}</div>
        </div>
      ))}
    </div>
  );
}


// ── Cards List ────────────────────────────────────────────────────────────────
function Cards({ db }) {
  const [rows,setRows]=useState([]); const [loyalties,setLoyalties]=useState([]);
  const [busy,setBusy]=useState(true); const [show,setShow]=useState(false);
  const [detail,setDetail]=useState(null); const [msg,setMsg]=useState("");
  const [search,setSearch]=useState(""); const [sort,setSort]=useState("name");
  const [logoFile,setLogoFile]=useState(null); const [logoPreview,setLogoPreview]=useState(null);
  const empty={name:"",bank:"",last4:"",network:"Visa",opening_balance:"",points_currency:"pts",inr_per_point:"",stmt_date:"",annual_fee:""};
  const [f,setF]=useState(empty);
  const up=k=>e=>setF(p=>({...p,[k]:e.target.value}));
  const nets=["Visa","Mastercard","Amex","Diners","RuPay","Other"];
  const nc={Visa:"#1a1f71",Mastercard:"#dc2626",Amex:"#0066b3",Diners:"#2c2c8c",RuPay:"#ea580c",Other:acc};

  const load=async()=>{ setBusy(true); setMsg(""); const [{data:c,error},{data:l}]=await Promise.all([db.from("cc_cards").select(),db.from("loyalty_programs").select()]); if(error) setMsg(JSON.stringify(error)); setRows(c||[]); setLoyalties(l||[]); setBusy(false); };
  useEffect(()=>{ load(); },[]);

  if(detail) return <CardDetail card={detail} db={db} onBack={()=>{ setDetail(null); load(); }} onDelete={()=>{ setDetail(null); load(); }} allCards={rows} allLoyalties={loyalties}/>;

  const save=async()=>{
    if(!f.name.trim()) return alert("Card name required");
    const ob=parseInt(f.opening_balance)||0;
    let logo_url=null;
    if(logoFile){
      const path=`cards/${Date.now()}-${logoFile.name.replace(/[^a-zA-Z0-9.-]/g,"-")}`;
      const {error:ue, status}=await db.storage.upload("logos",path,logoFile);
      if(ue) console.error("Logo upload error:",ue,"status:",status);
      else logo_url=db.storage.getPublicUrl("logos",path);
    }
    const p={name:f.name.trim(),bank:f.bank,last4:f.last4,network:f.network,color:acc,points_currency:f.points_currency,inr_per_point:parseFloat(f.inr_per_point)||0,points_balance:ob,opening_balance:ob,annual_fee:parseFloat(f.annual_fee)||0,stmt_date:parseInt(f.stmt_date)||null,logo_url};
    const {error}=await db.from("cc_cards").insert(p);
    if(error) return alert("Error: "+JSON.stringify(error));
    setLogoFile(null); setLogoPreview(null); setShow(false); load();
  };

  const filtered=rows
    .filter(c=>c.name.toLowerCase().includes(search.toLowerCase())||(c.bank||"").toLowerCase().includes(search.toLowerCase()))
    .sort((a,b)=>sort==="balance"?(b.points_balance||0)-(a.points_balance||0):sort==="bank"?(a.bank||"").localeCompare(b.bank||""):a.name.localeCompare(b.name));

  const total=rows.reduce((a,c)=>a+(c.points_balance||0),0);
  const totalInr=rows.reduce((a,c)=>a+(c.points_balance||0)*(c.inr_per_point||0),0);

  // Summary stats
  const bankMap2 = {};
  rows.forEach(c=>{ const b=c.bank||"Other"; bankMap2[b]=(bankMap2[b]||0)+(c.points_balance||0); });
  const banks2 = Object.entries(bankMap2).sort((a,b)=>b[1]-a[1]);
  const maxBank2 = banks2[0]?.[1]||1;
  const netMap = {};
  rows.forEach(c=>{ const n=c.network||"Other"; netMap[n]=(netMap[n]||0)+(c.points_balance||0); });
  const nc2={Visa:"#1a1f71",Mastercard:"#dc2626",Amex:"#0066b3",Diners:"#2c2c8c",RuPay:"#ea580c",Other:acc};

  return (
    <div>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28}}>
        <div>
          <div style={{fontSize:30,fontWeight:800,color:txt,letterSpacing:"-0.04em",lineHeight:1.1}}>Credit Cards</div>
          <div style={{fontSize:14,color:mut,marginTop:6}}>{rows.length} cards · {total.toLocaleString("en-IN")} pts{totalInr>0?` · ${inrFmt(totalInr)} est. value`:""}</div>
        </div>
        <button style={pbtn} onClick={()=>{ setF({...empty}); setShow(true); }}>+ Add Card</button>
      </div>

      {/* Stat row */}
      {rows.length>0&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:12,marginBottom:24}}>
        <div style={{background:txt,borderRadius:12,padding:"16px 18px",color:"#fff"}}>
          <div style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.5)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>Total Points</div>
          <div style={{fontSize:24,fontWeight:800,letterSpacing:"-0.03em"}}>{total.toLocaleString("en-IN")}</div>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.45)",marginTop:4}}>{rows.length} cards</div>
        </div>
        {totalInr>0&&<div style={{background:surf,border:`1.5px solid ${bdr}`,borderRadius:12,padding:"16px 18px",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
          <div style={{fontSize:10,fontWeight:600,color:mut,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>Est. Value</div>
          <div style={{fontSize:24,fontWeight:800,color:grn,letterSpacing:"-0.03em"}}>{inrFmt(totalInr)}</div>
          <div style={{fontSize:11,color:mut,marginTop:4}}>across all cards</div>
        </div>}
        {banks2[0]&&<div style={{background:surf,border:`1.5px solid ${bdr}`,borderRadius:12,padding:"16px 18px",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
          <div style={{fontSize:10,fontWeight:600,color:mut,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>Top Bank</div>
          <div style={{fontSize:16,fontWeight:800,color:txt,letterSpacing:"-0.02em"}}>{banks2[0][0]}</div>
          <div style={{fontSize:11,color:acc,marginTop:4,fontWeight:600}}>{banks2[0][1].toLocaleString("en-IN")} pts</div>
        </div>}
      </div>}

      {/* CC chart with dropdown */}
      {rows.length>0&&<CCChartSection rows={rows} acc={acc} surf={surf} surf2={surf2} bdr={bdr} bdr2={bdr2} txt={txt} mut={mut} grn={grn} nc={nc}/>}

      <SearchBar value={search} onChange={setSearch} placeholder="Search by name or bank…"/>
      <SortBar options={[{value:"name",label:"Name A–Z"},{value:"bank",label:"Bank"},{value:"balance",label:"Points ↓"}]} value={sort} onChange={setSort}/>
      {msg&&<div style={{color:red,fontSize:12,padding:"10px 14px",background:"#fef2f2",borderRadius:8,marginBottom:16}}>{msg}</div>}
      {busy?<div style={{color:mut,padding:40,textAlign:"center"}}>Loading…</div>:filtered.length===0?(
        <div style={{textAlign:"center",padding:60,color:mut}}><div style={{fontSize:32,marginBottom:10}}>🃏</div><div>{search?"No cards match your search":"No cards yet — click Add Card"}</div></div>
      ):(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:16}}>
          {filtered.map(c=>{
            const inrVal=(c.points_balance||0)*(c.inr_per_point||0);
            return (
              <div key={c.id} onClick={()=>setDetail(c)}
                style={{background:surf,border:`1px solid ${bdr}`,borderRadius:14,padding:"16px 18px",cursor:"pointer",position:"relative",boxShadow:"0 1px 4px rgba(0,0,0,0.04)",transition:"all 0.2s"}}
                onMouseEnter={e=>{ e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,0.08)"; e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.borderColor=c.color||acc; }}
                onMouseLeave={e=>{ e.currentTarget.style.boxShadow="0 1px 4px rgba(0,0,0,0.04)"; e.currentTarget.style.transform="none"; e.currentTarget.style.borderColor=bdr; }}>
                {/* color accent bar */}
                <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:acc,borderRadius:"14px 14px 0 0"}}/>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,marginTop:4}}>
                  <div style={{display:"flex",gap:10,alignItems:"center"}}>
                    <LogoCircle url={c.logo_url} name={c.name} color={c.color||acc} size={34}/>
                    <div>
                      <div style={{fontSize:14,fontWeight:600,color:txt,letterSpacing:"-0.01em"}}>{c.name}</div>
                      <div style={{fontSize:11,color:mut,marginTop:1}}>{c.bank}{c.last4?` ···· ${c.last4}`:""}</div>
                    </div>
                  </div>
                  <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:10,background:(nc[c.network]||acc)+"15",color:nc[c.network]||acc,letterSpacing:"0.04em"}}>{c.network}</span>
                </div>
                <div style={{marginBottom:12}}>
                  <div style={{fontSize:22,fontWeight:700,color:txt,letterSpacing:"-0.02em",lineHeight:1}}>{(c.points_balance||0).toLocaleString("en-IN")}</div>
                  <div style={{fontSize:10,color:mut,textTransform:"uppercase",letterSpacing:"0.08em",marginTop:3}}>{c.points_currency||"pts"}</div>
                </div>
                {c.inr_per_point>0&&<div style={{fontSize:12,fontWeight:600,color:grn,marginBottom:10}}>{inrFmt(inrVal)}</div>}
                <div style={{display:"flex",gap:12,fontSize:11,color:mut,borderTop:`1px solid ${bdr}`,paddingTop:10,justifyContent:"space-between"}}>
                  <div style={{display:"flex",gap:12}}>
                    {c.stmt_date&&<span>Stmt {ordinal(c.stmt_date)}</span>}
                    {c.annual_fee>0&&<span>₹{Number(c.annual_fee).toLocaleString()} fee</span>}
                  </div>
                  <span style={{color:acc,fontWeight:500}}>View →</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <Modal show={show} onClose={()=>{ setShow(false); setLogoFile(null); setLogoPreview(null); }} title="Add Credit Card">
        <div style={{marginBottom:16}}>
          <LogoUpload current={logoPreview} onUpload={(file,preview)=>{ setLogoFile(file); setLogoPreview(preview); }}/>
        </div>
        {lbl("Card Name *")}<input style={inp} placeholder="HDFC Infinia" value={f.name} onChange={up("name")}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Bank")}<input style={inp} placeholder="HDFC" value={f.bank} onChange={up("bank")}/></div>
          <div>{lbl("Last 4 Digits")}<input style={inp} placeholder="4242" maxLength={4} value={f.last4} onChange={up("last4")}/></div>
        </div>
        {lbl("Network")}<select style={inp} value={f.network} onChange={up("network")}>{nets.map(n=><option key={n}>{n}</option>)}</select>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Points Opening Balance")}<input style={inp} type="number" placeholder="0" value={f.opening_balance} onChange={up("opening_balance")}/></div>
          <div>{lbl("Points Unit")}<input style={inp} placeholder="pts / miles" value={f.points_currency} onChange={up("points_currency")}/></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("INR per Point")}<input style={inp} type="number" step="0.01" placeholder="0.25" value={f.inr_per_point} onChange={up("inr_per_point")}/></div>
          <div>{lbl("Statement Date")}<input style={inp} type="number" placeholder="15" value={f.stmt_date} onChange={up("stmt_date")}/></div>
        </div>
        {lbl("Annual Fee ₹")}<input style={inp} type="number" placeholder="0" value={f.annual_fee} onChange={up("annual_fee")}/>
        <button style={{...pbtn,width:"100%",justifyContent:"center",marginTop:4}} onClick={save}>Add Card</button>
      </Modal>
    </div>
  );
}

// ── Loyalty List ──────────────────────────────────────────────────────────────
function Loyalty({ db }) {
  const [rows,setRows]=useState([]); const [cards,setCards]=useState([]);
  const [busy,setBusy]=useState(true); const [show,setShow]=useState(false);
  const [detail,setDetail]=useState(null);
  const [search,setSearch]=useState(""); const [sort,setSort]=useState("name");
  const [logoFile,setLogoFile]=useState(null); const [logoPreview,setLogoPreview]=useState(null);
  const empty={name:"",category:"Airline",opening_balance:"",inr_per_point:"",expiry_date:"",expiry_rule:"",tier:"",loyalty_number:""};
  const [f,setF]=useState(empty);
  const up=k=>e=>setF(p=>({...p,[k]:e.target.value}));
  const cats=["Airline","Hotel","Retail","Dining","Fuel","Other"];
  const cc={Airline:acc,Hotel:acc,Retail:acc,Dining:acc,Fuel:acc,Other:acc};

  const load=async()=>{ setBusy(true); const [{data:l},{data:c}]=await Promise.all([db.from("loyalty_programs").select(),db.from("cc_cards").select()]); setRows(l||[]); setCards(c||[]); setBusy(false); };
  useEffect(()=>{ load(); },[]);

  if(detail) return <LPDetail prog={detail} db={db} onBack={()=>{ setDetail(null); load(); }} onDelete={()=>{ setDetail(null); load(); }} allCards={cards} allLoyalties={rows}/>;

  const save=async()=>{
    if(!f.name.trim()) return alert("Program name required");
    const ob=parseInt(f.opening_balance)||0;
    let logo_url=null;
    if(logoFile){
      const path=`loyalty/${Date.now()}-${logoFile.name.replace(/[^a-zA-Z0-9.-]/g,"-")}`;
      const {error:ue, status}=await db.storage.upload("logos",path,logoFile);
      if(ue) console.error("Logo upload error:",ue,"status:",status);
      else logo_url=db.storage.getPublicUrl("logos",path);
    }
    const p={name:f.name.trim(),category:f.category,tier:f.tier,color:acc,expiry_date:f.expiry_date||null,expiry_rule:f.expiry_rule,inr_per_point:parseFloat(f.inr_per_point)||0,points_balance:ob,opening_balance:ob,logo_url,loyalty_number:f.loyalty_number||null};
    const {error}=await db.from("loyalty_programs").insert(p);
    if(error) return alert("Error: "+JSON.stringify(error));
    setLogoFile(null); setLogoPreview(null); setShow(false); load();
  };

  const days=d=>d?Math.round((new Date(d)-new Date())/86400000):null;

  const filtered=rows
    .filter(p=>p.name.toLowerCase().includes(search.toLowerCase())||(p.category||"").toLowerCase().includes(search.toLowerCase())||(p.tier||"").toLowerCase().includes(search.toLowerCase()))
    .sort((a,b)=>sort==="balance"?(b.points_balance||0)-(a.points_balance||0):sort==="category"?(a.category||"").localeCompare(b.category||""):a.name.localeCompare(b.name));

  const totalInr=rows.reduce((a,p)=>a+(p.points_balance||0)*(p.inr_per_point||0),0);

  // Category breakdown
  const catBreak = {};
  rows.forEach(l=>{ const c=l.category||"Other"; catBreak[c]=(catBreak[c]||0)+(l.points_balance||0); });
  const catList = Object.entries(catBreak).sort((a,b)=>b[1]-a[1]);
  const maxCat = catList[0]?.[1]||1;
  const catColors2 = {Airline:acc,Hotel:acc,Retail:acc,Dining:acc,Fuel:acc,Other:acc};
  const totalLPts = rows.reduce((a,l)=>a+(l.points_balance||0),0);
  const exp30 = rows.filter(l=>{ if(!l.expiry_date) return false; const d=Math.round((new Date(l.expiry_date)-new Date())/86400000); return d>=0&&d<=30; });
  const exp90 = rows.filter(l=>{ if(!l.expiry_date) return false; const d=Math.round((new Date(l.expiry_date)-new Date())/86400000); return d>=0&&d<=90; });

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28}}>
        <div>
          <div style={{fontSize:30,fontWeight:800,color:txt,letterSpacing:"-0.04em",lineHeight:1.1}}>Loyalty Programs</div>
          <div style={{fontSize:14,color:mut,marginTop:6}}>{rows.length} programs{totalInr>0?` · ${inrFmt(totalInr)} est. value`:""}</div>
        </div>
        <button style={pbtn} onClick={()=>{ setF({...empty}); setShow(true); }}>+ Add Program</button>
      </div>

      {/* Stat row */}
      {rows.length>0&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:12,marginBottom:24}}>
        <div style={{background:acc,borderRadius:12,padding:"16px 18px",color:"#fff"}}>
          <div style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.6)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>Total Points</div>
          <div style={{fontSize:24,fontWeight:800,letterSpacing:"-0.03em"}}>{totalLPts.toLocaleString("en-IN")}</div>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.5)",marginTop:4}}>{rows.length} programs</div>
        </div>
        {totalInr>0&&<div style={{background:surf,border:`1.5px solid ${bdr}`,borderRadius:12,padding:"16px 18px",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
          <div style={{fontSize:10,fontWeight:600,color:mut,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>Est. Value</div>
          <div style={{fontSize:24,fontWeight:800,color:grn,letterSpacing:"-0.03em"}}>{inrFmt(totalInr)}</div>
          <div style={{fontSize:11,color:mut,marginTop:4}}>across all programs</div>
        </div>}
        {exp30.length>0&&<div style={{background:"#fffbeb",border:"1.5px solid #fde68a",borderRadius:12,padding:"16px 18px"}}>
          <div style={{fontSize:10,fontWeight:600,color:"#92400e",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>Expiring Soon</div>
          <div style={{fontSize:24,fontWeight:800,color:red,letterSpacing:"-0.03em"}}>{exp30.length}</div>
          <div style={{fontSize:11,color:"#b45309",marginTop:4}}>within 30 days</div>
        </div>}
        {exp90.length>0&&exp30.length===0&&<div style={{background:surf,border:`1.5px solid ${bdr}`,borderRadius:12,padding:"16px 18px",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
          <div style={{fontSize:10,fontWeight:600,color:mut,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>Expiring (90d)</div>
          <div style={{fontSize:24,fontWeight:800,color:gold,letterSpacing:"-0.03em"}}>{exp90.length}</div>
          <div style={{fontSize:11,color:mut,marginTop:4}}>programs</div>
        </div>}
      </div>}

      {/* LP chart with dropdown */}
      {rows.length>0&&<LPChartSection rows={rows} acc={acc} acc2={acc2} surf={surf} surf2={surf2} bdr={bdr} bdr2={bdr2} txt={txt} mut={mut} grn={grn}/>}

      <SearchBar value={search} onChange={setSearch} placeholder="Search by name, category or tier…"/>
      <SortBar options={[{value:"name",label:"Name A–Z"},{value:"category",label:"Category"},{value:"balance",label:"Points ↓"}]} value={sort} onChange={setSort}/>
      {busy?<div style={{color:mut,padding:40,textAlign:"center"}}>Loading…</div>:filtered.length===0?(
        <div style={{textAlign:"center",padding:60,color:mut}}><div style={{fontSize:32,marginBottom:10}}>⭐</div><div>{search?"No programs match your search":"No programs yet"}</div></div>
      ):(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:16}}>
          {filtered.map(p=>{ const d=days(p.expiry_date); const exp=d!==null&&d<60; const inrVal=(p.points_balance||0)*(p.inr_per_point||0); return (
            <div key={p.id} onClick={()=>setDetail(p)}
              style={{background:surf,border:`1px solid ${bdr}`,borderRadius:14,padding:"16px 18px",cursor:"pointer",position:"relative",boxShadow:"0 1px 4px rgba(0,0,0,0.04)",transition:"all 0.2s"}}
              onMouseEnter={e=>{ e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,0.08)"; e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.borderColor=p.color||acc2; }}
              onMouseLeave={e=>{ e.currentTarget.style.boxShadow="0 1px 4px rgba(0,0,0,0.04)"; e.currentTarget.style.transform="none"; e.currentTarget.style.borderColor=bdr; }}>
              <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:acc,borderRadius:"14px 14px 0 0"}}/>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,marginTop:4}}>
                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                  <LogoCircle url={p.logo_url} name={p.name} color={p.color||acc2} size={34}/>
                  <div>
                    <div style={{fontSize:14,fontWeight:600,color:txt,letterSpacing:"-0.01em"}}>{p.name}</div>
                    <div style={{fontSize:11,color:mut,marginTop:1}}>{p.tier&&<span style={{fontWeight:600,color:acc}}>{p.tier}</span>}{p.tier&&p.loyalty_number&&" · "}{p.loyalty_number&&<span>#{p.loyalty_number}</span>}</div>
                  </div>
                </div>
                <span style={{fontSize:10,fontWeight:500,padding:"2px 8px",borderRadius:10,background:surf2,color:mut,border:`1px solid ${bdr}`,letterSpacing:"0.04em"}}>{p.category}</span>
              </div>
              <div style={{marginBottom:10}}>
                <div style={{fontSize:22,fontWeight:700,color:txt,letterSpacing:"-0.02em",lineHeight:1}}>{(p.points_balance||0).toLocaleString("en-IN")}</div>
                <div style={{fontSize:10,color:mut,textTransform:"uppercase",letterSpacing:"0.08em",marginTop:3}}>points</div>
              </div>
              {p.inr_per_point>0&&<div style={{fontSize:12,fontWeight:600,color:grn,marginBottom:8}}>{inrFmt(inrVal)}</div>}
              <div style={{borderTop:`1px solid ${bdr}`,paddingTop:8,marginTop:4,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                {p.expiry_date
                  ? <div style={{fontSize:11,color:exp?"#c13333":mut}}>{exp?"⚠ ":""}{d>0?`${d}d left`:"Expired"} · {new Date(p.expiry_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</div>
                  : <div/>
                }
                <div style={{fontSize:11,color:acc2,fontWeight:500}}>View →</div>
              </div>
            </div>
          );})}
        </div>
      )}
      <Modal show={show} onClose={()=>{ setShow(false); setLogoFile(null); setLogoPreview(null); }} title="Add Loyalty Program">
        <div style={{marginBottom:16}}>
          <LogoUpload current={logoPreview} onUpload={(file,preview)=>{ setLogoFile(file); setLogoPreview(preview); }}/>
        </div>
        {lbl("Program Name *")}<input style={inp} placeholder="Air India Flying Returns" value={f.name} onChange={up("name")}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Category")}<select style={inp} value={f.category} onChange={up("category")}>{cats.map(c=><option key={c}>{c}</option>)}</select></div>
          <div>{lbl("Tier / Status")}<input style={inp} placeholder="Gold" value={f.tier} onChange={up("tier")}/></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Points Opening Balance")}<input style={inp} type="number" placeholder="0" value={f.opening_balance} onChange={up("opening_balance")}/></div>
          <div>{lbl("INR per Point")}<input style={inp} type="number" step="0.01" placeholder="0.50" value={f.inr_per_point} onChange={up("inr_per_point")}/></div>
        </div>
        {lbl("Expiry Date")}<input style={inp} type="date" value={f.expiry_date||""} onChange={up("expiry_date")}/>
        {lbl("Expiry Rule")}<input style={inp} placeholder="Points expire 3 years from earn date" value={f.expiry_rule} onChange={up("expiry_rule")}/>
        {lbl("Loyalty / Membership Number")}<input style={inp} placeholder="XXXX-XXXX-XXXX" value={f.loyalty_number||""} onChange={up("loyalty_number")}/>
        <button style={{...pbtn,width:"100%",justifyContent:"center",marginTop:4}} onClick={save}>Add Program</button>
      </Modal>
    </div>
  );
}

// ── Transfer Points ───────────────────────────────────────────────────────────
function TransferPoints({ db }) {
  const [cards,setCards]=useState([]); const [loyalties,setLoyalties]=useState([]);
  const [allPartners,setAllPartners]=useState([]);
  const [busy,setBusy]=useState(true);
  // from state
  const [fromType,setFromType]=useState("card");
  const [from,setFrom]=useState("");
  // to state
  const [toType,setToType]=useState("loyalty");
  const [to,setTo]=useState("");
  const [pts,setPts]=useState(""); const [bonusMiles,setBonusMiles]=useState("");
  const [txnDate,setTxnDate]=useState(new Date().toISOString().split("T")[0]);
  const [notes,setNotes]=useState(""); const [done,setDone]=useState(null);

  const loadAll=useCallback(async()=>{
    setBusy(true);
    const [c,l,p]=await Promise.all([db.from("cc_cards").select(),db.from("loyalty_programs").select(),db.from("transfer_partners").select()]);
    setCards(c.data||[]); setLoyalties(l.data||[]); setAllPartners(p.data||[]);
    setBusy(false);
  },[db]);
  useEffect(()=>{ loadAll(); },[loadAll]);

  const programsOfType = (type) => type==="card"
    ? cards.map(c=>({name:c.name,type:"card",balance:c.points_balance||0,id:c.id,logo_url:c.logo_url,last4:c.last4}))
    : loyalties.map(l=>({name:l.name,type:"loyalty",balance:l.points_balance||0,id:l.id,logo_url:l.logo_url,loyalty_number:l.loyalty_number}));

  const allPrograms=[...cards.map(c=>({name:c.name,type:"card",balance:c.points_balance||0,id:c.id})),...loyalties.map(l=>({name:l.name,type:"loyalty",balance:l.points_balance||0,id:l.id}))];

  // Which programs (of fromType) can transfer somewhere given current 'to' selection
  const fromPrograms = programsOfType(fromType).filter(p => {
    if (to) return allPartners.some(r=>r.from_program===p.name&&r.to_program===to);
    return allPartners.some(r=>r.from_program===p.name);
  });

  // Which programs (of toType) can be transferred to from current 'from' selection
  // Also show ratio next to name when from is selected
  const toPrograms = programsOfType(toType).filter(p => {
    if (from) return allPartners.some(r=>r.from_program===from&&r.to_program===p.name);
    return allPartners.some(r=>r.to_program===p.name);
  });

  const partner = from&&to ? allPartners.find(p=>p.from_program===from&&p.to_program===to) : null;
  const sentPts=parseInt(pts)||0;
  const bonusPts=parseInt(bonusMiles)||0;
  const ratioReceived=partner&&sentPts?Math.floor(sentPts*(partner.ratio_to/partner.ratio_from)):0;
  const totalReceived=ratioReceived+bonusPts;
  const fromProg=allPrograms.find(p=>p.name===from);
  const toProg=allPrograms.find(p=>p.name===to);

  const handleFromType = (t) => { setFromType(t); setFrom(""); };
  const handleToType   = (t) => { setToType(t);   setTo(""); };
  const handleFrom = (name) => {
    setFrom(name);
    if (to) {
      const valid = allPartners.filter(p=>p.from_program===name).map(p=>p.to_program);
      if (!valid.includes(to)) setTo("");
    }
  };
  const handleTo = (name) => {
    setTo(name);
    if (from) {
      const valid = allPartners.filter(p=>p.to_program===name).map(p=>p.from_program);
      if (!valid.includes(from)) setFrom("");
    }
  };

  // Get ratio for a specific to-program when from is selected
  const getRatio = (toName) => {
    if (!from) return null;
    const p = allPartners.find(r=>r.from_program===from&&r.to_program===toName);
    return p ? `${p.ratio_from}:${p.ratio_to}` : null;
  };
  // Get ratio for a specific from-program when to is selected
  const getFromRatio = (fromName) => {
    if (!to) return null;
    const p = allPartners.find(r=>r.from_program===fromName&&r.to_program===to);
    return p ? `${p.ratio_from}:${p.ratio_to}` : null;
  };

  const subLabel = (prog) => {
    if (prog.type==="card" && prog.last4) return ` ···· ${prog.last4}`;
    if (prog.type==="loyalty" && prog.loyalty_number) return ` #${prog.loyalty_number}`;
    return "";
  };

  const doTransfer=async()=>{
    if(!from||!to||!pts) return alert("Fill From, To and Points");
    if(!partner) return alert("No transfer route found for this pair");
    if(sentPts<=0) return alert("Enter valid points");
    if(partner.min_transfer&&sentPts<partner.min_transfer) return alert(`Minimum transfer is ${partner.min_transfer.toLocaleString()} pts`);
    if(fromProg&&sentPts>fromProg.balance) return alert(`Insufficient points. Available: ${fromProg.balance.toLocaleString()}`);
    const fromObj=fromProg.type==="card"?cards.find(c=>c.name===from):loyalties.find(l=>l.name===from);
    const toObj=toProg.type==="card"?cards.find(c=>c.name===to):loyalties.find(l=>l.name===to);
    const tbl_from=fromProg.type==="card"?"cc_cards":"loyalty_programs";
    const tbl_to=toProg.type==="card"?"cc_cards":"loyalty_programs";
    await db.from(tbl_from).update(fromObj.id,{points_balance:(fromObj.points_balance||0)-sentPts});
    await db.from(tbl_to).update(toObj.id,{points_balance:(toObj.points_balance||0)+totalReceived});
    await db.from("point_transactions").insert({program_name:from,program_type:fromProg.type,points:-sentPts,description:`Transfer to ${to}${notes?` — ${notes}`:""}`,txn_date:txnDate});
    await db.from("point_transactions").insert({program_name:to,program_type:toProg.type,points:totalReceived,description:`Transfer from ${from}${bonusPts?` (+${bonusPts} bonus)`:""}${notes?` — ${notes}`:""}`,txn_date:txnDate});
    await db.from("transfer_log").insert({from_program:from,to_program:to,points_sent:sentPts,points_received:ratioReceived,bonus_miles:bonusPts,ratio_from:partner.ratio_from,ratio_to:partner.ratio_to,transfer_date:txnDate,notes:notes||null});
    setDone({from,to,sent:sentPts,received:ratioReceived,bonus:bonusPts,total:totalReceived});
    setFrom(""); setTo(""); setPts(""); setBonusMiles(""); setNotes("");
    await loadAll();
  };

  if(busy) return <div style={{color:mut,padding:40,textAlign:"center"}}>Loading…</div>;

  const typeBtn = (active, label, onClick) => (
    <button onClick={onClick} style={{flex:1,padding:"8px",borderRadius:8,border:`1.5px solid ${active?txt:bdr}`,cursor:"pointer",fontSize:12,fontWeight:active?600:400,background:active?txt:"transparent",color:active?"#fff":mut,transition:"all 0.15s"}}>
      {label}
    </button>
  );

  return (
    <div>
      <div style={{fontSize:22,fontWeight:800,color:txt,letterSpacing:"-0.02em",marginBottom:6}}>Transfer Points</div>
      <div style={{fontSize:13,color:mut,marginBottom:24}}>Move points between your cards and programs</div>
      {done&&(
        <div style={{background:surf2,border:`1px solid ${bdr}`,borderRadius:12,padding:"14px 18px",marginBottom:20}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}>
            <div>
              <div style={{fontSize:13,color:grn,fontWeight:700,marginBottom:4}}>✓ Transfer complete!</div>
              <div style={{fontSize:13,color:txt}}>{done.sent.toLocaleString()} pts from <strong>{done.from}</strong></div>
              <div style={{fontSize:13,color:txt,marginTop:2}}>→ {done.received.toLocaleString()} pts{done.bonus>0?<span style={{color:grn}}> + {done.bonus.toLocaleString()} bonus = <strong>{done.total.toLocaleString()}</strong></span>:""} to <strong>{done.to}</strong></div>
            </div>
            <button onClick={()=>setDone(null)} style={{background:"none",border:"none",cursor:"pointer",color:mut,fontSize:20}}>×</button>
          </div>
        </div>
      )}
      <div style={{background:surf,border:`1px solid ${bdr}`,borderRadius:14,padding:24,maxWidth:580,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>

        {/* ── FROM ── */}
        <div style={{background:surf2,borderRadius:10,padding:"16px 16px 12px",marginBottom:16,border:`1px solid ${bdr}`}}>
          <div style={{fontSize:10,fontWeight:700,color:mut,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:12}}>From</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div>
              {lbl("Type")}
              <div style={{display:"flex",gap:6}}>
                {typeBtn(fromType==="card","Credit Card",()=>handleFromType("card"))}
                {typeBtn(fromType==="loyalty","Loyalty Prog",()=>handleFromType("loyalty"))}
              </div>
            </div>
            <div>
              {lbl("Program")}
              <select style={inp} value={from} onChange={e=>handleFrom(e.target.value)}>
                <option value="">— select —</option>
                {fromPrograms.map(p=>{
                  const ratio = getFromRatio(p.name);
                  return (
                    <option key={p.name} value={p.name}>
                      {p.name}{subLabel(p)} · {p.balance.toLocaleString()} pts{ratio?` [${ratio}]`:""}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
          {fromProg&&<div style={{fontSize:12,color:mut,marginTop:2}}>Available: <span style={{fontWeight:600,color:txt}}>{fromProg.balance.toLocaleString()} pts</span></div>}
          {!from&&to&&<div style={{fontSize:11,color:acc,marginTop:4}}>Showing programs that can transfer to {to}</div>}
        </div>

        {/* ── TO ── */}
        <div style={{background:surf2,borderRadius:10,padding:"16px 16px 12px",marginBottom:16,border:`1px solid ${bdr}`}}>
          <div style={{fontSize:10,fontWeight:700,color:mut,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:12}}>To</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div>
              {lbl("Type")}
              <div style={{display:"flex",gap:6}}>
                {typeBtn(toType==="card","Credit Card",()=>handleToType("card"))}
                {typeBtn(toType==="loyalty","Loyalty Prog",()=>handleToType("loyalty"))}
              </div>
            </div>
            <div>
              {lbl("Program")}
              <select style={inp} value={to} onChange={e=>handleTo(e.target.value)}>
                <option value="">— select —</option>
                {toPrograms.map(p=>{
                  const ratio = getRatio(p.name);
                  return (
                    <option key={p.name} value={p.name}>
                      {p.name}{subLabel(p)} · {p.balance.toLocaleString()} pts{ratio?` [${ratio}]`:""}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
          {toProg&&<div style={{fontSize:12,color:mut,marginTop:2}}>Current: <span style={{fontWeight:600,color:txt}}>{toProg.balance.toLocaleString()} pts</span></div>}
          {!to&&from&&<div style={{fontSize:11,color:acc,marginTop:4}}>Showing programs {from} can transfer to</div>}
        </div>

        {/* ── Partner info ── */}
        {partner&&(
          <div style={{background:acc+"08",border:`1px solid ${acc}30`,borderRadius:10,padding:"12px 16px",marginBottom:16}}>
            <div style={{display:"flex",gap:20,flexWrap:"wrap",alignItems:"flex-end"}}>
              <div><div style={{fontSize:10,color:mut,textTransform:"uppercase",fontWeight:600,marginBottom:3}}>Ratio</div><div style={{fontSize:22,fontWeight:800,color:acc,letterSpacing:"-0.02em"}}>{partner.ratio_from}:{partner.ratio_to}</div></div>
              {partner.min_transfer&&<div><div style={{fontSize:10,color:mut,textTransform:"uppercase",fontWeight:600,marginBottom:3}}>Min Transfer</div><div style={{fontSize:16,fontWeight:700,color:txt}}>{partner.min_transfer.toLocaleString()}</div></div>}
              {partner.max_monthly&&<div><div style={{fontSize:10,color:mut,textTransform:"uppercase",fontWeight:600,marginBottom:3}}>Max/Month</div><div style={{fontSize:16,fontWeight:700,color:txt}}>{partner.max_monthly.toLocaleString()}</div></div>}
              {partner.transfer_time&&<div><div style={{fontSize:10,color:mut,textTransform:"uppercase",fontWeight:600,marginBottom:3}}>Transfer Time</div><div style={{fontSize:16,fontWeight:700,color:grn}}>{partner.transfer_time}</div></div>}
            </div>
          </div>
        )}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Points to Transfer")}<input style={inp} type="number" placeholder="Enter points" value={pts} onChange={e=>setPts(e.target.value)} disabled={!partner}/></div>
          <div>{lbl("Bonus Miles (optional)")}<input style={inp} type="number" placeholder="0" value={bonusMiles} onChange={e=>setBonusMiles(e.target.value)} disabled={!partner}/></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Transfer Date")}<input style={inp} type="date" value={txnDate} onChange={e=>setTxnDate(e.target.value)}/></div>
          <div>{lbl("Notes")}<input style={inp} placeholder="Promo code, ref…" value={notes} onChange={e=>setNotes(e.target.value)}/></div>
        </div>
        {partner&&sentPts>0&&(
          <div style={{background:"#ecfdf5",border:`1.5px solid #6ee7b7`,borderRadius:12,padding:"14px 16px",marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
              <div><div style={{fontSize:10,color:mut,textTransform:"uppercase",fontWeight:700,marginBottom:4}}>You Send</div><div style={{fontSize:24,fontWeight:900,color:red}}>{sentPts.toLocaleString()} pts</div></div>
              <div style={{fontSize:22,color:mut}}>→</div>
              <div>
                <div style={{fontSize:10,color:mut,textTransform:"uppercase",fontWeight:700,marginBottom:4}}>They Receive</div>
                <div style={{fontSize:24,fontWeight:900,color:grn}}>{totalReceived.toLocaleString()} pts</div>
                {bonusPts>0&&<div style={{fontSize:11,color:mut,marginTop:2}}>{ratioReceived.toLocaleString()} ratio + {bonusPts.toLocaleString()} bonus</div>}
              </div>
            </div>
          </div>
        )}
        <button style={{...pbtn,width:"100%",justifyContent:"center",opacity:(!from||!to||!pts)?0.5:1,padding:"11px 16px"}} onClick={doTransfer}>
          Transfer Points →
        </button>
      </div>
    </div>
  );
}

// ── Transfer Partners Setup ───────────────────────────────────────────────────
function Transfers({ db }) {
  const [rows,setRows]=useState([]); const [busy,setBusy]=useState(true);
  const [show,setShow]=useState(false); const [edit,setEdit]=useState(null);
  const [cards,setCards]=useState([]); const [loyalties,setLoyalties]=useState([]);
  const [search,setSearch]=useState(""); const [sort,setSort]=useState("from");
  const empty={from_type:"card",from_program:"",to_type:"loyalty",to_program:"",ratio_from:"1",ratio_to:"1",min_transfer:"",max_monthly:"",transfer_time:"",notes:""};
  const [f,setF]=useState(empty);
  const up=k=>e=>setF(p=>({...p,[k]:e.target.value}));

  const load=async()=>{ setBusy(true); const [t,c,l]=await Promise.all([db.from("transfer_partners").select(),db.from("cc_cards").select(),db.from("loyalty_programs").select()]); setRows(t.data||[]); setCards(c.data||[]); setLoyalties(l.data||[]); setBusy(false); };
  useEffect(()=>{ load(); },[]);

  const optionsFor=type=>type==="card"?cards.map(c=>c.name):loyalties.map(l=>l.name);
  const openEdit=r=>{ setEdit(r); const fromIsCard=cards.some(c=>c.name===r.from_program); const toIsCard=cards.some(c=>c.name===r.to_program); setF({from_type:fromIsCard?"card":"loyalty",from_program:r.from_program||"",to_type:toIsCard?"card":"loyalty",to_program:r.to_program||"",ratio_from:String(r.ratio_from||1),ratio_to:String(r.ratio_to||1),min_transfer:String(r.min_transfer||""),max_monthly:String(r.max_monthly||""),transfer_time:r.transfer_time||"",notes:r.notes||""}); setShow(true); };
  const save=async()=>{
    if(!f.from_program||!f.to_program) return alert("Select both programs");
    const p={from_program:f.from_program,to_program:f.to_program,ratio_from:parseFloat(f.ratio_from)||1,ratio_to:parseFloat(f.ratio_to)||1,min_transfer:parseInt(f.min_transfer)||null,max_monthly:parseInt(f.max_monthly)||null,transfer_time:f.transfer_time,notes:f.notes};
    const {error}=edit?await db.from("transfer_partners").update(edit.id,p):await db.from("transfer_partners").insert(p);
    if(error) return alert("Error: "+JSON.stringify(error));
    setShow(false); setEdit(null); load();
  };
  const del=async id=>{ if(confirm("Delete?")){ await db.from("transfer_partners").delete(id); load(); } };

  const filtered=rows
    .filter(r=>r.from_program.toLowerCase().includes(search.toLowerCase())||r.to_program.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b)=>sort==="to"?a.to_program.localeCompare(b.to_program):sort==="ratio"?(b.ratio_to/b.ratio_from)-(a.ratio_to/a.ratio_from):a.from_program.localeCompare(b.from_program));

  const grouped=filtered.reduce((a,r)=>{ (a[r.from_program]=a[r.from_program]||[]).push(r); return a; },{});

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div><div style={{fontSize:22,fontWeight:800,color:txt,letterSpacing:"-0.02em"}}>Transfer Partners</div><div style={{fontSize:13,color:mut,marginTop:3}}>{rows.length} routes configured</div></div>
        <button style={pbtn} onClick={()=>{ setEdit(null); setF({...empty}); setShow(true); }}>+ Add Route</button>
      </div>
      <SearchBar value={search} onChange={setSearch} placeholder="Search by program name…"/>
      <SortBar options={[{value:"from",label:"From A–Z"},{value:"to",label:"To A–Z"},{value:"ratio",label:"Best Ratio"}]} value={sort} onChange={setSort}/>
      {busy?<div style={{color:mut,padding:40,textAlign:"center"}}>Loading…</div>:filtered.length===0?(
        <div style={{textAlign:"center",padding:60,color:mut}}><div style={{fontSize:32,marginBottom:10}}>↔️</div><div>{search?"No routes match your search":"No transfer routes yet"}</div></div>
      ):Object.entries(grouped).map(([from,routes])=>(
        <div key={from} style={{background:surf,border:`1.5px solid ${bdr}`,borderRadius:12,padding:"18px 20px",marginBottom:16,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
          <div style={{fontSize:11,fontWeight:700,color:acc,marginBottom:12,textTransform:"uppercase",letterSpacing:"0.07em"}}>{from}</div>
          {routes.map(r=>(
            <div key={r.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",background:surf2,borderRadius:10,border:`1.5px solid ${bdr}`,marginBottom:8,flexWrap:"wrap",gap:8}}>
              <div><div style={{fontSize:14,fontWeight:600,color:txt}}>{r.to_program}</div>{r.notes&&<div style={{fontSize:11,color:mut}}>{r.notes}</div>}</div>
              <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                <div style={{textAlign:"center"}}><div style={{fontSize:15,fontWeight:800,color:acc}}>{r.ratio_from}:{r.ratio_to}</div><div style={{fontSize:10,color:mut,textTransform:"uppercase"}}>Ratio</div></div>
                {r.min_transfer&&<div style={{textAlign:"center"}}><div style={{fontSize:13,fontWeight:600,color:txt}}>{Number(r.min_transfer).toLocaleString()}</div><div style={{fontSize:10,color:mut,textTransform:"uppercase"}}>Min</div></div>}
                {r.transfer_time&&<div style={{textAlign:"center"}}><div style={{fontSize:13,fontWeight:600,color:grn}}>{r.transfer_time}</div><div style={{fontSize:10,color:mut,textTransform:"uppercase"}}>Time</div></div>}
                <div style={{display:"flex",gap:4}}>
                  <button style={{...gbtn,padding:"5px 8px",fontSize:12}} onClick={()=>openEdit(r)}>✎</button>
                  <button style={{...dbtn,padding:"5px 8px",fontSize:12}} onClick={()=>del(r.id)}>✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
      <Modal show={show} onClose={()=>{ setShow(false); setEdit(null); }} title={edit?"Edit Route":"Add Transfer Route"}>
        <div style={{background:acc+"08",border:`1.5px solid ${acc}22`,borderRadius:12,padding:14,marginBottom:14}}>
          <div style={{fontSize:11,color:acc,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:10}}>From</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div>{lbl("Type")}<select style={inp} value={f.from_type} onChange={e=>setF(p=>({...p,from_type:e.target.value,from_program:""}))}><option value="card">Credit Card</option><option value="loyalty">Loyalty Program</option></select></div>
            <div>{lbl("Program")}<select style={inp} value={f.from_program} onChange={up("from_program")}><option value="">— select —</option>{optionsFor(f.from_type).map(o=><option key={o} value={o}>{o}</option>)}</select></div>
          </div>
        </div>
        <div style={{background:grn+"08",border:`1.5px solid ${grn}22`,borderRadius:12,padding:14,marginBottom:14}}>
          <div style={{fontSize:11,color:grn,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:10}}>To</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div>{lbl("Type")}<select style={inp} value={f.to_type} onChange={e=>setF(p=>({...p,to_type:e.target.value,to_program:""}))}><option value="card">Credit Card</option><option value="loyalty">Loyalty Program</option></select></div>
            <div>{lbl("Program")}<select style={inp} value={f.to_program} onChange={up("to_program")}><option value="">— select —</option>{optionsFor(f.to_type).map(o=><option key={o} value={o}>{o}</option>)}</select></div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Ratio From")}<input style={inp} type="number" step="0.1" value={f.ratio_from} onChange={up("ratio_from")}/></div>
          <div>{lbl("Ratio To")}<input style={inp} type="number" step="0.1" value={f.ratio_to} onChange={up("ratio_to")}/></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Min Transfer")}<input style={inp} type="number" placeholder="1000" value={f.min_transfer} onChange={up("min_transfer")}/></div>
          <div>{lbl("Max / Month")}<input style={inp} type="number" placeholder="none" value={f.max_monthly} onChange={up("max_monthly")}/></div>
        </div>
        {lbl("Transfer Time")}<input style={inp} placeholder="Instant / 3-5 days" value={f.transfer_time} onChange={up("transfer_time")}/>
        {lbl("Notes")}<input style={inp} placeholder="Any conditions..." value={f.notes} onChange={up("notes")}/>
        <button style={{...pbtn,width:"100%",justifyContent:"center",marginTop:4}} onClick={save}>{edit?"Save Changes":"Add Route"}</button>
      </Modal>
    </div>
  );
}

// ── VoucherSecret ─────────────────────────────────────────────────────────────
function VoucherSecret({ label, value, accent, surf2, isPin=false }) {
  const [visible, setVisible] = useState(false);
  return (
    <div style={{fontSize:11,marginBottom:4,display:"flex",alignItems:"center",gap:6}}>
      <span style={{color:mut}}>{label}:</span>
      <span style={{fontFamily:"monospace",fontWeight:600,color:visible?accent:mut,background:visible?accent+"10":surf2,padding:"1px 6px",borderRadius:4,letterSpacing:"0.08em",minWidth:60,display:"inline-block"}}>
        {visible ? value : "•".repeat(Math.min(value.length,8))}
      </span>
      <button onClick={()=>setVisible(v=>!v)} style={{background:"none",border:"none",cursor:"pointer",color:mut,fontSize:13,padding:"0 2px",lineHeight:1}} title={visible?"Hide":"Show"}>
        {visible ? "🙈" : "👁"}
      </button>
    </div>
  );
}


// ── Vouchers ──────────────────────────────────────────────────────────────────
function Vouchers({ db }) {
  const [rows,setRows]=useState([]); const [busy,setBusy]=useState(true);
  const [show,setShow]=useState(false); const [edit,setEdit]=useState(null);
  const [filter,setFilter]=useState("active");
  const empty={program:"",description:"",value:"",expiry_date:"",redeemed:false,notes:"",voucher_code:"",voucher_pin:"",received_from:""};
  const [f,setF]=useState(empty);
  const up=k=>e=>setF(p=>({...p,[k]:e.target.value}));
  const load=async()=>{ setBusy(true); const {data}=await db.from("vouchers").select(); setRows(data||[]); setBusy(false); };
  useEffect(()=>{ load(); },[]);
  const openEdit=r=>{ setEdit(r); setF({program:r.program||"",description:r.description||"",value:r.value||"",expiry_date:r.expiry_date||"",redeemed:r.redeemed||false,notes:r.notes||"",voucher_code:r.voucher_code||"",voucher_pin:r.voucher_pin||"",received_from:r.received_from||""}); setShow(true); };
  const save=async()=>{
    if(!f.program.trim()) return alert("Program name required");
    const {error}=edit?await db.from("vouchers").update(edit.id,{...f,expiry_date:f.expiry_date||null}):await db.from("vouchers").insert({...f,expiry_date:f.expiry_date||null});
    if(error) return alert("Error: "+JSON.stringify(error));
    setShow(false); setEdit(null); load();
  };
  const del=async id=>{ if(confirm("Delete?")){ await db.from("vouchers").delete(id); load(); } };
  const toggle=async v=>{ await db.from("vouchers").update(v.id,{redeemed:!v.redeemed}); load(); };
  const days=d=>d?Math.round((new Date(d)-new Date())/86400000):null;
  const shown=rows.filter(v=>filter==="all"?true:filter==="active"?!v.redeemed:v.redeemed);
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24,flexWrap:"wrap",gap:10}}>
        <div><div style={{fontSize:22,fontWeight:800,color:txt,letterSpacing:"-0.02em"}}>Vouchers</div><div style={{fontSize:13,color:mut,marginTop:3}}>{rows.filter(v=>!v.redeemed).length} active · {rows.filter(v=>v.redeemed).length} redeemed</div></div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {["active","redeemed","all"].map(t=><button key={t} onClick={()=>setFilter(t)} style={{padding:"7px 12px",borderRadius:10,border:`1.5px solid ${filter===t?acc:bdr}`,cursor:"pointer",fontSize:12,fontWeight:filter===t?700:400,background:filter===t?acc+"10":"transparent",color:filter===t?acc:mut,textTransform:"capitalize"}}>{t}</button>)}
          <button style={pbtn} onClick={()=>{ setEdit(null); setF({...empty}); setShow(true); }}>+ Add</button>
        </div>
      </div>
      {busy?<div style={{color:mut,padding:40,textAlign:"center"}}>Loading…</div>:shown.length===0?(
        <div style={{textAlign:"center",padding:60,color:mut}}><div style={{fontSize:32,marginBottom:10}}>🎟️</div><div>No vouchers here</div></div>
      ):(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:16}}>
          {shown.map(v=>{ const d=days(v.expiry_date); const exp=d!==null&&d<30&&!v.redeemed; return (
            <div key={v.id} style={{background:surf,border:`1px solid ${v.redeemed?bdr:exp?"#fde68a":bdr}`,borderRadius:14,padding:"16px 18px",opacity:v.redeemed?0.55:1,boxShadow:"0 1px 4px rgba(0,0,0,0.04)",position:"relative",overflow:"hidden"}}>
              {/* top accent */}
              <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:v.redeemed?bdr2:exp?"#f59e0b":grn,borderRadius:"14px 14px 0 0"}}/>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginTop:4,marginBottom:10}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,color:txt,letterSpacing:"-0.01em"}}>{v.program}</div>
                  {v.description&&<div style={{fontSize:11,color:mut,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v.description}</div>}
                </div>
                <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:10,background:v.redeemed?surf2:exp?"#fef3c7":`${grn}15`,color:v.redeemed?mut:exp?"#92400e":grn,marginLeft:8,flexShrink:0,letterSpacing:"0.04em"}}>
                  {v.redeemed?"USED":exp?"EXPIRING":"ACTIVE"}
                </span>
              </div>
              {v.value&&<div style={{fontSize:18,fontWeight:700,color:txt,letterSpacing:"-0.02em",marginBottom:8}}>{v.value}</div>}
              {v.expiry_date&&<div style={{fontSize:11,color:exp?red:mut,marginBottom:10}}>
                Expires {new Date(v.expiry_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                {d!==null&&<span style={{fontWeight:600}}> · {d>0?`${d}d left`:"Expired"}</span>}
              </div>}
              {v.received_from&&<div style={{fontSize:11,color:mut,marginBottom:4}}>From: <span style={{color:txt,fontWeight:500}}>{v.received_from}</span></div>}
              {v.voucher_code&&<VoucherSecret label="Code" value={v.voucher_code} accent={acc} surf2={surf2}/>}
              {v.voucher_pin&&<VoucherSecret label="PIN" value={v.voucher_pin} accent={acc} surf2={surf2} isPin/>}
              {v.notes&&<div style={{fontSize:11,color:mut,marginBottom:10,fontStyle:"italic"}}>{v.notes}</div>}
              <div style={{display:"flex",gap:6,borderTop:`1px solid ${bdr}`,paddingTop:10,alignItems:"center"}}>
                <button onClick={()=>toggle(v)} style={{padding:"5px 12px",borderRadius:8,border:`1px solid ${bdr}`,cursor:"pointer",fontSize:11,fontWeight:600,background:v.redeemed?surf2:txt,color:v.redeemed?mut:"#fff",letterSpacing:"0.02em",transition:"all 0.15s"}}>{v.redeemed?"Restore":"Mark Used"}</button>
                <button style={{...gbtn,padding:"5px 8px",fontSize:11}} onClick={()=>openEdit(v)}>✎</button>
                <button style={{...dbtn,padding:"5px 8px",fontSize:11}} onClick={()=>del(v.id)}>✕</button>
              </div>
            </div>
          );})}
        </div>
      )}
      <Modal show={show} onClose={()=>{ setShow(false); setEdit(null); }} title={edit?"Edit Voucher":"Add Voucher"}>
        {lbl("Program / Issuer *")}<input style={inp} placeholder="Marriott Bonvoy" value={f.program} onChange={up("program")}/>
        {lbl("Description")}<input style={inp} placeholder="Free night award" value={f.description} onChange={up("description")}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Value")}<input style={inp} placeholder="₹5,000 / 1 Night" value={f.value} onChange={up("value")}/></div>
          <div>{lbl("Expiry Date")}<input style={inp} type="date" value={f.expiry_date||""} onChange={up("expiry_date")}/></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Voucher Code")}<input style={inp} placeholder="ABC123XYZ" value={f.voucher_code||""} onChange={up("voucher_code")}/></div>
          <div>{lbl("Voucher PIN")}<input style={inp} placeholder="1234" value={f.voucher_pin||""} onChange={up("voucher_pin")}/></div>
        </div>
        {lbl("Received From")}<input style={inp} placeholder="SmartBuy, Infinia CC, GrabDeals..." value={f.received_from||""} onChange={up("received_from")}/>
        {lbl("Notes")}<input style={inp} placeholder="Conditions, notes..." value={f.notes} onChange={up("notes")}/>
        <button style={{...pbtn,width:"100%",justifyContent:"center",marginTop:4}} onClick={save}>{edit?"Save Changes":"Add Voucher"}</button>
      </Modal>
    </div>
  );
}

// ── Settings ──────────────────────────────────────────────────────────────────
function Settings({ onDisconnect }) {
  const [resetting, setResetting] = useState(false);
  const resetAll = async () => {
    const conf = window.prompt("This will permanently delete ALL data — cards, programs, vouchers, transactions and transfers.\n\nType DELETE to confirm:");
    if (conf !== "DELETE") return;
    setResetting(true);
    const u = localStorage.getItem("pv_u");
    const k = localStorage.getItem("pv_k");
    const h = { apikey:k, Authorization:`Bearer ${k}`, "Content-Type":"application/json" };
    for (const t of ["point_transactions","transfer_log","transfer_partners","vouchers","cc_cards","loyalty_programs"]) {
      await fetch(`${u}/rest/v1/${t}?created_at=gte.2000-01-01`, { method:"DELETE", headers:h }).catch(()=>{});
    }
    setResetting(false);
    alert("All data deleted.");
    window.location.reload();
  };
  return (
    <div>
      <div style={{fontSize:22,fontWeight:800,color:txt,letterSpacing:"-0.02em",marginBottom:24}}>Settings</div>
      <div style={{maxWidth:520}}>
        <div style={{background:surf,border:`1.5px solid ${bdr}`,borderRadius:12,padding:"20px 22px",marginBottom:16,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
          <div style={{fontSize:11,fontWeight:700,color:acc,marginBottom:12,textTransform:"uppercase",letterSpacing:"0.07em"}}>Database Connection</div>
          <div style={{fontSize:12,color:mut,marginBottom:4}}>Connected to</div>
          <div style={{fontSize:12,color:txt,fontFamily:"monospace",background:surf2,padding:"8px 12px",borderRadius:8,marginBottom:16,wordBreak:"break-all",border:`1.5px solid ${bdr}`}}>{localStorage.getItem("pv_u")}</div>
          <button style={dbtn} onClick={()=>{ localStorage.removeItem("pv_u"); localStorage.removeItem("pv_k"); onDisconnect(); }}>Disconnect</button>
        </div>
        <div style={{background:"#fef2f2",border:"1.5px solid #fecaca",borderRadius:12,padding:"20px 22px",marginBottom:16}}>
          <div style={{fontSize:11,fontWeight:700,color:red,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.07em"}}>Danger Zone</div>
          <div style={{fontSize:13,color:mut,marginBottom:16}}>Permanently delete all data and reset PointsVault to blank. Cannot be undone.</div>
          <button style={{...dbtn,background:red,color:"#fff",opacity:resetting?0.6:1}} onClick={resetting?undefined:resetAll}>{resetting?"Deleting…":"🗑 Reset All Data"}</button>
        </div>
        <div style={{background:surf,border:`1.5px solid ${bdr}`,borderRadius:12,padding:"20px 22px",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
          <div style={{fontSize:11,fontWeight:700,color:acc,marginBottom:10,textTransform:"uppercase",letterSpacing:"0.07em"}}>Setup SQL</div>
          <div style={{fontSize:12,color:mut,marginBottom:10}}>Run in Supabase → SQL Editor. Includes ALTER statements for existing tables.</div>
          <pre style={{fontSize:10,color:mut,background:surf2,padding:14,borderRadius:10,overflowX:"auto",lineHeight:1.7,margin:0,whiteSpace:"pre-wrap",border:`1.5px solid ${bdr}`}}>{SETUP_SQL}</pre>
        </div>
      </div>
    </div>
  );
}

// ── Statement Import ──────────────────────────────────────────────────────────
function StatementImport({ db }) {
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState("");
  const [mode, setMode] = useState("pdf");
  const [status, setStatus] = useState("idle");
  const [parsed, setParsed] = useState([]);
  const [selected, setSelected] = useState({});
  const [error, setError] = useState("");
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("pv_claude_key") || "");
  const [dragOver, setDragOver] = useState(false);
  const [importedCount, setImportedCount] = useState(0);

  useEffect(() => { db.from("cc_cards").select().then(r => setCards(r.data || [])); }, []);

  const saveApiKey = (k) => { setApiKey(k); localStorage.setItem("pv_claude_key", k); };

  // ── PDF via Claude API ──────────────────────────────────────────────────────
  const parsePDF = async (file) => {
    if (!apiKey) return setError("Enter your Claude API key in the field above first.");
    if (!selectedCard) return setError("Select a credit card first.");
    setStatus("parsing"); setError(""); setParsed([]);

    const base64 = await new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result.split(",")[1]);
      r.onerror = rej;
      r.readAsDataURL(file);
    });

    const prompt = `You are a bank statement parser. Extract ALL transactions from this credit card statement PDF.
Return ONLY a JSON array, no markdown, no explanation. Each item must have exactly these fields:
- date: string in YYYY-MM-DD format
- description: merchant/transaction name (string)
- amount: number (INR amount, always positive)
- type: "debit" or "credit" (debit = spend/purchase, credit = payment/refund/cashback)
- points: number (reward points earned for this transaction, 0 if not shown)

If points are not shown in the statement, set points to 0.
Return only the JSON array starting with [ and ending with ].`;

    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 4096,
          messages: [{
            role: "user",
            content: [
              { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } },
              { type: "text", text: prompt }
            ]
          }]
        })
      });

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error?.message || "Claude API error");
      }

      const data = await resp.json();
      const raw = data.content.map(b => b.text || "").join("");
      const clean = raw.replace(/```json|```/g, "").trim();
      const txns = JSON.parse(clean);
      const withId = txns.map((t, i) => ({ ...t, _id: i }));
      setParsed(withId);
      setSelected(Object.fromEntries(withId.map(t => [t._id, true])));
      setStatus("preview");
    } catch (e) {
      setError("Parse failed: " + e.message);
      setStatus("idle");
    }
  };

  // ── CSV parser ──────────────────────────────────────────────────────────────
  const parseCSV = (file) => {
    if (!selectedCard) return setError("Select a credit card first.");
    setStatus("parsing"); setError("");
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.trim().split("\n").map(l => l.split(",").map(c => c.trim().replace(/^"|"$/g, "")));
        if (lines.length < 2) throw new Error("CSV appears empty");

        const headers = lines[0].map(h => h.toLowerCase());
        const dateIdx = headers.findIndex(h => h.includes("date"));
        const descIdx = headers.findIndex(h => h.includes("desc") || h.includes("narrat") || h.includes("particular") || h.includes("merchant"));
        const amtIdx  = headers.findIndex(h => h.includes("amount") || h.includes("debit") || h.includes("withdrawal"));
        const crIdx   = headers.findIndex(h => h.includes("credit") || h.includes("deposit"));
        const ptsIdx  = headers.findIndex(h => h.includes("point") || h.includes("reward"));

        if (dateIdx === -1 || descIdx === -1) throw new Error("Could not find Date or Description columns. Headers found: " + headers.join(", "));

        const txns = lines.slice(1).filter(r => r.length > 1 && r[dateIdx]).map((r, i) => {
          const rawDate = r[dateIdx] || "";
          // Try to parse various date formats
          let date = rawDate;
          const parts = rawDate.split(/[-\/]/);
          if (parts.length === 3) {
            // DD-MM-YYYY or DD/MM/YYYY
            if (parts[0].length <= 2 && parseInt(parts[0]) <= 31) {
              date = `${parts[2].length === 2 ? "20" + parts[2] : parts[2]}-${parts[1].padStart(2,"0")}-${parts[0].padStart(2,"0")}`;
            }
          }
          const debit  = parseFloat((r[amtIdx] || "0").replace(/[^0-9.]/g, "")) || 0;
          const credit = crIdx >= 0 ? parseFloat((r[crIdx] || "0").replace(/[^0-9.]/g, "")) || 0 : 0;
          const amount = debit > 0 ? debit : credit;
          const type   = credit > 0 && debit === 0 ? "credit" : "debit";
          const points = ptsIdx >= 0 ? parseFloat((r[ptsIdx] || "0").replace(/[^0-9.]/g, "")) || 0 : 0;
          return { _id: i, date, description: r[descIdx] || "—", amount, type, points };
        }).filter(t => t.amount > 0);

        setParsed(txns);
        setSelected(Object.fromEntries(txns.map(t => [t._id, true])));
        setStatus("preview");
      } catch (err) {
        setError("CSV parse error: " + err.message);
        setStatus("idle");
      }
    };
    reader.readAsText(file);
  };

  const handleFile = (file) => {
    if (!file) return;
    if (mode === "pdf" && file.type === "application/pdf") parsePDF(file);
    else if (mode === "csv" && (file.name.endsWith(".csv") || file.type === "text/csv")) parseCSV(file);
    else setError(`Please upload a ${mode.toUpperCase()} file.`);
  };

  // ── Import confirmed transactions ───────────────────────────────────────────
  const doImport = async () => {
    const card = cards.find(c => c.name === selectedCard);
    if (!card) return;
    setStatus("importing");
    const toImport = parsed.filter(t => selected[t._id]);
    let ptsDelta = 0;

    for (const t of toImport) {
      const pts = t.points || 0;
      const desc = `${t.description} — ₹${t.amount.toLocaleString("en-IN")} ${t.type === "credit" ? "(credit)" : ""}`;
      await db.from("point_transactions").insert({
        program_name: selectedCard,
        program_type: "card",
        points: pts,
        description: desc,
        txn_date: t.date,
      });
      ptsDelta += pts;
    }

    if (ptsDelta > 0) {
      const newBal = (card.points_balance || 0) + ptsDelta;
      await db.from("cc_cards").update(card.id, { points_balance: newBal });
    }

    setImportedCount(toImport.length);
    setStatus("done");
  };

  const reset = () => { setStatus("idle"); setParsed([]); setSelected({}); setError(""); setImportedCount(0); };
  const toggleAll = (val) => setSelected(Object.fromEntries(parsed.map(t => [t._id, val])));
  const selCount = Object.values(selected).filter(Boolean).length;

  return (
    <div>
      <div style={{fontSize:22,fontWeight:800,color:txt,letterSpacing:"-0.02em",marginBottom:6}}>Import Statement</div>
      <div style={{fontSize:13,color:mut,marginBottom:24}}>Import transactions from a PDF or CSV bank statement</div>

      {/* Done state */}
      {status === "done" && (
        <div style={{background:"#ecfdf5",border:`1.5px solid #6ee7b7`,borderRadius:14,padding:"20px 24px",maxWidth:560}}>
          <div style={{fontSize:18,fontWeight:800,color:grn,marginBottom:8}}>✓ Import complete!</div>
          <div style={{fontSize:14,color:txt,marginBottom:16}}>{importedCount} transactions imported into <strong>{selectedCard}</strong>.</div>
          <button style={pbtn} onClick={reset}>Import Another Statement</button>
        </div>
      )}

      {status !== "done" && (
        <div style={{maxWidth:680}}>

          {/* Step 1 — Card + Mode */}
          <div style={{background:surf,border:`1.5px solid ${bdr}`,borderRadius:12,padding:"20px 22px",marginBottom:16,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
            <div style={{fontSize:12,fontWeight:700,color:acc,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:14}}>Step 1 — Select Card &amp; Format</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:0}}>
              <div>
                {lbl("Credit Card")}
                <select style={inp} value={selectedCard} onChange={e=>setSelectedCard(e.target.value)}>
                  <option value="">— select card —</option>
                  {cards.map(c=><option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div>
                {lbl("Import Format")}
                <div style={{display:"flex",gap:8}}>
                  {["pdf","csv"].map(m=>(
                    <button key={m} onClick={()=>{ setMode(m); reset(); }} style={{flex:1,padding:"9px",borderRadius:8,border:`1.5px solid ${mode===m?acc:bdr}`,cursor:"pointer",fontSize:13,fontWeight:mode===m?700:400,background:mode===m?acc+"10":"transparent",color:mode===m?acc:mut,textTransform:"uppercase",letterSpacing:"0.05em"}}>
                      {m === "pdf" ? "📄 PDF" : "📊 CSV"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 — Claude API key (PDF only) */}
          {mode === "pdf" && (
            <div style={{background:surf,border:`1.5px solid ${bdr}`,borderRadius:12,padding:"20px 22px",marginBottom:16,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
              <div style={{fontSize:12,fontWeight:700,color:acc,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:14}}>Step 2 — Claude API Key</div>
              <div style={{fontSize:12,color:mut,marginBottom:10}}>
                Your key is saved locally in the browser. Get one free at <a href="https://console.anthropic.com" target="_blank" rel="noreferrer" style={{color:acc}}>console.anthropic.com</a>
              </div>
              {lbl("Anthropic API Key")}
              <input style={inp} type="password" placeholder="sk-ant-..." value={apiKey} onChange={e=>saveApiKey(e.target.value)}/>
              <div style={{fontSize:11,color:mut,marginTop:-8}}>Stored only in your browser localStorage — never sent to any server except Anthropic.</div>
            </div>
          )}

          {/* Step 3 — Upload */}
          {status === "idle" && (
            <div style={{background:surf,border:`1.5px solid ${bdr}`,borderRadius:12,padding:"20px 22px",marginBottom:16,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
              <div style={{fontSize:12,fontWeight:700,color:acc,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:14}}>
                {mode === "pdf" ? "Step 3" : "Step 2"} — Upload File
              </div>
              {mode === "csv" && (
                <div style={{fontSize:12,color:mut,marginBottom:12,padding:"10px 14px",background:acc+"08",borderRadius:8,border:`1px solid ${acc}22`}}>
                  💡 Most banks offer CSV/Excel download from net banking. The file should have columns for Date, Description, and Amount. Points column is optional.
                </div>
              )}
              <div
                onDragOver={e=>{ e.preventDefault(); setDragOver(true); }}
                onDragLeave={()=>setDragOver(false)}
                onDrop={e=>{ e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
                style={{border:`2px dashed ${dragOver?acc:bdr}`,borderRadius:12,padding:"36px 20px",textAlign:"center",background:dragOver?acc+"06":surf2,transition:"all 0.15s",cursor:"pointer"}}
                onClick={()=>document.getElementById("stmt-file-input").click()}
              >
                <div style={{fontSize:32,marginBottom:10}}>{mode==="pdf"?"📄":"📊"}</div>
                <div style={{fontSize:14,fontWeight:600,color:txt,marginBottom:6}}>
                  Drop your {mode.toUpperCase()} here or click to browse
                </div>
                <div style={{fontSize:12,color:mut}}>
                  {mode==="pdf"?"Any Indian bank statement PDF — Claude will extract all transactions automatically":"CSV file with Date, Description, Amount columns"}
                </div>
                <input id="stmt-file-input" type="file" accept={mode==="pdf"?".pdf":".csv,.txt"} style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>
              </div>
              {error && <div style={{color:red,fontSize:12,marginTop:12,padding:"10px 14px",background:"#fef2f2",borderRadius:8,border:`1px solid #fecaca`}}>{error}</div>}
            </div>
          )}

          {/* Parsing spinner */}
          {status === "parsing" && (
            <div style={{background:surf,border:`1.5px solid ${bdr}`,borderRadius:12,padding:"40px 22px",textAlign:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
              <div style={{fontSize:28,marginBottom:12}}>⏳</div>
              <div style={{fontSize:15,fontWeight:700,color:txt,marginBottom:6}}>
                {mode==="pdf"?"Claude is reading your statement…":"Parsing CSV…"}
              </div>
              <div style={{fontSize:13,color:mut}}>
                {mode==="pdf"?"This takes 10–30 seconds depending on statement length":"Just a moment…"}
              </div>
            </div>
          )}

          {/* Preview */}
          {status === "preview" && (
            <div style={{background:surf,border:`1.5px solid ${bdr}`,borderRadius:12,padding:"20px 22px",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:8}}>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:txt}}>{parsed.length} transactions found</div>
                  <div style={{fontSize:12,color:mut,marginTop:2}}>{selCount} selected for import · Deselect any you want to skip</div>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button style={{...gbtn,padding:"6px 12px",fontSize:12}} onClick={()=>toggleAll(true)}>Select All</button>
                  <button style={{...gbtn,padding:"6px 12px",fontSize:12}} onClick={()=>toggleAll(false)}>Deselect All</button>
                  <button style={{...gbtn,padding:"6px 12px",fontSize:12}} onClick={reset}>← Back</button>
                </div>
              </div>

              <div style={{overflowX:"auto",marginBottom:16}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                  <thead>
                    <tr style={{color:mut,fontSize:11,textTransform:"uppercase",letterSpacing:"0.06em",borderBottom:`2px solid ${bdr}`}}>
                      <th style={{padding:"8px 10px",textAlign:"center",width:36}}>✓</th>
                      <th style={{padding:"8px 10px",textAlign:"left"}}>Date</th>
                      <th style={{padding:"8px 10px",textAlign:"left"}}>Description</th>
                      <th style={{padding:"8px 10px",textAlign:"right"}}>Amount</th>
                      <th style={{padding:"8px 10px",textAlign:"center"}}>Type</th>
                      <th style={{padding:"8px 10px",textAlign:"right"}}>Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.map(t=>(
                      <tr key={t._id} style={{borderBottom:`1px solid ${bdr}`,opacity:selected[t._id]?1:0.4,cursor:"pointer"}} onClick={()=>setSelected(s=>({...s,[t._id]:!s[t._id]}))}>
                        <td style={{padding:"9px 10px",textAlign:"center"}}>
                          <input type="checkbox" checked={!!selected[t._id]} onChange={()=>{}} style={{cursor:"pointer",accentColor:acc}}/>
                        </td>
                        <td style={{padding:"9px 10px",color:mut,whiteSpace:"nowrap"}}>{t.date}</td>
                        <td style={{padding:"9px 10px",color:txt,maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.description}</td>
                        <td style={{padding:"9px 10px",textAlign:"right",fontWeight:600,color:txt}}>₹{Number(t.amount).toLocaleString("en-IN")}</td>
                        <td style={{padding:"9px 10px",textAlign:"center"}}>
                          <span style={{fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:10,background:t.type==="credit"?grn+"18":red+"12",color:t.type==="credit"?grn:red}}>{t.type}</span>
                        </td>
                        <td style={{padding:"9px 10px",textAlign:"right",color:t.points>0?acc:mut,fontWeight:t.points>0?700:400}}>{t.points>0?"+"+t.points:"-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {error && <div style={{color:red,fontSize:12,marginBottom:12,padding:"10px 14px",background:"#fef2f2",borderRadius:8}}>{error}</div>}

              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:12,borderTop:`1px solid ${bdr}`,flexWrap:"wrap",gap:8}}>
                <div style={{fontSize:13,color:mut}}>
                  Total spend: <strong style={{color:txt}}>₹{parsed.filter(t=>t.type==="debit"&&selected[t._id]).reduce((a,t)=>a+t.amount,0).toLocaleString("en-IN")}</strong>
                  {parsed.some(t=>t.points>0) && <span> · Points: <strong style={{color:acc}}>{parsed.filter(t=>selected[t._id]).reduce((a,t)=>a+(t.points||0),0).toLocaleString()}</strong></span>}
                </div>
                <button style={{...pbtn,padding:"10px 20px",opacity:selCount===0?0.5:1}} onClick={selCount>0?doImport:undefined}>
                  Import {selCount} Transactions →
                </button>
              </div>
            </div>
          )}

          {status === "importing" && (
            <div style={{background:surf,border:`1.5px solid ${bdr}`,borderRadius:12,padding:"40px 22px",textAlign:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
              <div style={{fontSize:28,marginBottom:12}}>💾</div>
              <div style={{fontSize:15,fontWeight:700,color:txt}}>Saving transactions…</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Transfer History ──────────────────────────────────────────────────────────
function TransferHistory({ db }) {
  const [logs, setLogs] = useState([]);
  const [busy, setBusy] = useState(true);
  const [err, setErr] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("date");
  const [detail, setDetail] = useState(null);

  const load = async () => {
    setBusy(true); setErr("");
    try {
      const { data, error } = await db.from("transfer_log").select();
      if (error) {
        // Table may not exist yet
        if (error.code === "42P01" || (error.message||"").includes("does not exist")) {
          setErr("Transfer log table not found. Please run the Setup SQL from Settings to create it.");
        } else {
          setErr("Error loading transfers: " + JSON.stringify(error));
        }
        setLogs([]);
      } else {
        setLogs((data || []).sort((a, b) => new Date(b.transfer_date) - new Date(a.transfer_date)));
      }
    } catch(e) {
      setErr("Failed to load: " + e.message);
      setLogs([]);
    }
    setBusy(false);
  };
  useEffect(() => { load(); }, []);

  const del = async (id) => {
    if (!confirm("Delete this transfer record? This does not reverse the point balances.")) return;
    await db.from("transfer_log").delete(id);
    load();
  };

  const filtered = logs
    .filter(l =>
      l.from_program.toLowerCase().includes(search.toLowerCase()) ||
      l.to_program.toLowerCase().includes(search.toLowerCase()) ||
      (l.notes || "").toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === "sent") return b.points_sent - a.points_sent;
      if (sort === "received") return b.points_received - a.points_received;
      if (sort === "from") return a.from_program.localeCompare(b.from_program);
      return new Date(b.transfer_date) - new Date(a.transfer_date);
    });

  const totalSent = filtered.reduce((a, l) => a + (l.points_sent || 0), 0);
  const totalReceived = filtered.reduce((a, l) => a + (l.points_received || 0) + (l.bonus_miles || 0), 0);
  const totalBonus = filtered.reduce((a, l) => a + (l.bonus_miles || 0), 0);

  return (
    <div>
      <div style={{fontSize:30,fontWeight:800,color:txt,letterSpacing:"-0.04em",lineHeight:1.1,marginBottom:6}}>Transfer History</div>
      <div style={{fontSize:14,color:mut,marginBottom:24}}>All point transfers across your cards and programs</div>
      {err&&<div style={{color:red,fontSize:12,padding:"10px 14px",background:"#fef2f2",borderRadius:8,marginBottom:16}}>{err}</div>}

      {/* Summary stats */}
      {logs.length > 0 && (
        <div style={{display:"flex",gap:12,marginBottom:24,flexWrap:"wrap"}}>
          <StatBox label="Total Transfers" value={logs.length.toString()} color={acc}/>
          <StatBox label="Total Sent" value={totalSent.toLocaleString()} color={red}/>
          <StatBox label="Total Received" value={totalReceived.toLocaleString()} color={grn}/>
          {totalBonus > 0 && <StatBox label="Bonus Miles Earned" value={totalBonus.toLocaleString()} color={acc2}/>}
        </div>
      )}

      <SearchBar value={search} onChange={setSearch} placeholder="Search by program or notes..."/>
      <SortBar
        options={[
          {value:"date", label:"Date ↓"},
          {value:"from", label:"From A–Z"},
          {value:"sent", label:"Points Sent ↓"},
          {value:"received", label:"Points Received ↓"},
        ]}
        value={sort}
        onChange={setSort}
      />

      {busy ? <div style={{color:mut,padding:40,textAlign:"center"}}>Loading...</div>
      : logs.length === 0 ? (
        <div style={{textAlign:"center",padding:60,color:mut}}>
          <div style={{fontSize:32,marginBottom:10}}>↔️</div>
          <div>No transfers yet. Use Transfer Points to move points between programs.</div>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{textAlign:"center",padding:40,color:mut}}>No transfers match your search.</div>
      ) : (
        <div style={{background:surf,border:`1.5px solid ${bdr}`,borderRadius:12,boxShadow:"0 2px 8px rgba(0,0,0,0.04)",overflow:"hidden"}}>
          {/* Desktop table */}
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead>
                <tr style={{background:surf2,color:mut,fontSize:11,textTransform:"uppercase",letterSpacing:"0.06em",borderBottom:`2px solid ${bdr}`}}>
                  <th style={{padding:"10px 16px",textAlign:"left",fontWeight:700}}>Date</th>
                  <th style={{padding:"10px 16px",textAlign:"left",fontWeight:700}}>From</th>
                  <th style={{padding:"10px 16px",textAlign:"left",fontWeight:700}}>To</th>
                  <th style={{padding:"10px 16px",textAlign:"right",fontWeight:700}}>Sent</th>
                  <th style={{padding:"10px 16px",textAlign:"right",fontWeight:700}}>Ratio</th>
                  <th style={{padding:"10px 16px",textAlign:"right",fontWeight:700}}>Received</th>
                  <th style={{padding:"10px 16px",textAlign:"right",fontWeight:700}}>Bonus</th>
                  <th style={{padding:"10px 16px",textAlign:"left",fontWeight:700}}>Notes</th>
                  <th style={{padding:"10px 16px",textAlign:"center",fontWeight:700}}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l, idx) => {
                  const totalRec = (l.points_received || 0) + (l.bonus_miles || 0);
                  const efficiency = l.points_sent > 0 ? ((totalRec / l.points_sent) * 100).toFixed(0) : 0;
                  return (
                    <tr key={l.id} style={{borderBottom:`1px solid ${bdr}`,cursor:"pointer"}} onClick={()=>setDetail(detail?.id===l.id?null:l)}>
                      <td style={{padding:"12px 16px",color:mut,whiteSpace:"nowrap"}}>
                        {new Date(l.transfer_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                      </td>
                      <td style={{padding:"12px 16px"}}>
                        <div style={{fontWeight:600,color:txt}}>{l.from_program}</div>
                      </td>
                      <td style={{padding:"12px 16px"}}>
                        <div style={{fontWeight:600,color:txt}}>{l.to_program}</div>
                      </td>
                      <td style={{padding:"12px 16px",textAlign:"right",fontWeight:700,color:red}}>
                        {(l.points_sent||0).toLocaleString()}
                      </td>
                      <td style={{padding:"12px 16px",textAlign:"right"}}>
                        <span style={{fontSize:12,fontWeight:700,color:acc,background:acc+"10",padding:"2px 8px",borderRadius:20}}>
                          {l.ratio_from}:{l.ratio_to}
                        </span>
                      </td>
                      <td style={{padding:"12px 16px",textAlign:"right",fontWeight:700,color:grn}}>
                        {(l.points_received||0).toLocaleString()}
                      </td>
                      <td style={{padding:"12px 16px",textAlign:"right"}}>
                        {l.bonus_miles > 0
                          ? <span style={{fontWeight:700,color:acc2}}>+{l.bonus_miles.toLocaleString()}</span>
                          : <span style={{color:mut}}>—</span>
                        }
                      </td>
                      <td style={{padding:"12px 16px",color:mut,fontSize:12}}>{l.notes||"—"}</td>
                      <td style={{padding:"12px 16px",textAlign:"center"}}>
                        <button style={{...dbtn,padding:"4px 8px",fontSize:11}} onClick={e=>{e.stopPropagation();del(l.id);}}>✕</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Expanded detail row */}
          {detail && (
            <div style={{background:surf2,borderTop:`2px solid ${bdr}`,padding:"16px 20px"}}>
              <div style={{fontSize:12,fontWeight:700,color:acc,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:12}}>Transfer Detail</div>
              <div style={{display:"flex",gap:24,flexWrap:"wrap",alignItems:"flex-start"}}>
                <div style={{flex:1,minWidth:200}}>
                  <div style={{fontSize:13,color:mut,marginBottom:4}}>Flow</div>
                  <div style={{fontSize:15,fontWeight:700,color:txt}}>
                    {detail.from_program} → {detail.to_program}
                  </div>
                  <div style={{fontSize:12,color:mut,marginTop:2}}>
                    {new Date(detail.transfer_date).toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
                  </div>
                </div>
                <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
                  <div style={{textAlign:"center",background:surf,borderRadius:10,padding:"10px 16px",border:`1.5px solid ${bdr}`}}>
                    <div style={{fontSize:10,color:mut,textTransform:"uppercase",fontWeight:700,marginBottom:4}}>Sent</div>
                    <div style={{fontSize:20,fontWeight:900,color:red}}>{(detail.points_sent||0).toLocaleString()}</div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",fontSize:18,color:mut}}>→</div>
                  <div style={{textAlign:"center",background:surf,borderRadius:10,padding:"10px 16px",border:`1.5px solid ${bdr}`}}>
                    <div style={{fontSize:10,color:mut,textTransform:"uppercase",fontWeight:700,marginBottom:4}}>Ratio Pts</div>
                    <div style={{fontSize:20,fontWeight:900,color:grn}}>{(detail.points_received||0).toLocaleString()}</div>
                  </div>
                  {detail.bonus_miles > 0 && <>
                    <div style={{display:"flex",alignItems:"center",fontSize:18,color:mut}}>+</div>
                    <div style={{textAlign:"center",background:surf,borderRadius:10,padding:"10px 16px",border:`1.5px solid ${acc}33`}}>
                      <div style={{fontSize:10,color:acc2,textTransform:"uppercase",fontWeight:700,marginBottom:4}}>Bonus Miles</div>
                      <div style={{fontSize:20,fontWeight:900,color:acc2}}>{detail.bonus_miles.toLocaleString()}</div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",fontSize:18,color:mut}}>=</div>
                    <div style={{textAlign:"center",background:surf,borderRadius:10,padding:"10px 16px",border:`1.5px solid ${grn}44`}}>
                      <div style={{fontSize:10,color:grn,textTransform:"uppercase",fontWeight:700,marginBottom:4}}>Total Received</div>
                      <div style={{fontSize:20,fontWeight:900,color:grn}}>{((detail.points_received||0)+(detail.bonus_miles||0)).toLocaleString()}</div>
                    </div>
                  </>}
                </div>
                {detail.notes && (
                  <div style={{flex:1,minWidth:150}}>
                    <div style={{fontSize:13,color:mut,marginBottom:4}}>Notes</div>
                    <div style={{fontSize:13,color:txt}}>{detail.notes}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


// ── Portfolio Bar Chart (overview) ───────────────────────────────────────────
function PortfolioChart({ cards, loyalties, surf, surf2, bdr, bdr2, txt, mut, acc, acc2, grn, s }) {
  const [view, setView] = useState("points");
  const [search, setSearch] = useState("");
  const [sortDir, setSortDir] = useState("desc");
  const [hideZero, setHideZero] = useState(true);

  const catColors = {Airline:"#1d4ed8",Hotel:"#b45309",Retail:"#059669",Dining:"#ea580c",Fuel:"#dc2626",Other:acc2};
  const ncColors  = {Visa:"#1a1f71",Mastercard:"#dc2626",Amex:"#0066b3",Diners:"#2c2c8c",RuPay:"#ea580c",Other:acc};
  const barColors = ["#b5862a","#1d4ed8","#059669","#ea580c","#dc2626","#8b5cf6","#0891b2","#64748b","#7c3aed","#0f766e"];

  const views = [
    {id:"points", label:"By Points"},
    {id:"inr",    label:"By INR Value"},
    {id:"bank",   label:"By Bank"},
    {id:"cat",    label:"By Category"},
  ];

  const buildData = () => {
    const all = [
      ...cards.map(c=>({
        name: c.name, type:"card", bank: c.bank||"Other",
        cat: "CC", color: acc,
        logo_url: c.logo_url,
        sub: c.last4 ? `···· ${c.last4}` : (c.bank||""),
        points: c.points_balance||0,
        inr: (c.points_balance||0)*(c.inr_per_point||0),
      })),
      ...loyalties.map(l=>({
        name: l.name, type:"loyalty", bank: "—",
        cat: l.category||"Other", color: acc,
        logo_url: l.logo_url,
        sub: l.loyalty_number ? `#${l.loyalty_number}` : (l.category||""),
        points: l.points_balance||0,
        inr: (l.points_balance||0)*(l.inr_per_point||0),
      })),
    ];

    if (view === "bank") {
      const map = {};
      cards.forEach(c=>{ const b=c.bank||"Other"; map[b]=(map[b]||0)+(c.points_balance||0); });
      return Object.entries(map)
        .map(([name,points],i)=>({name,points,inr:0,color:barColors[i%barColors.length]}))
        .sort((a,b)=>sortDir==="desc"?b.points-a.points:a.points-b.points)
        .filter(d=>d.name.toLowerCase().includes(search.toLowerCase()));
    }
    if (view === "cat") {
      const map = {};
      // CC cards go into "Credit Cards" bucket
      cards.forEach(c=>{ map["Credit Cards"]=(map["Credit Cards"]||0)+(c.points_balance||0); });
      loyalties.forEach(l=>{ const c=l.category||"Other"; map[c]=(map[c]||0)+(l.points_balance||0); });
      const catCol = {...catColors, "Credit Cards": acc};
      return Object.entries(map)
        .map(([name,points])=>({name,points,inr:0,color:catCol[name]||acc2}))
        .sort((a,b)=>sortDir==="desc"?b.points-a.points:a.points-b.points)
        .filter(d=>d.name.toLowerCase().includes(search.toLowerCase()));
    }
    // points or inr — show all individual programs/cards
    const sorted = [...all]
      .filter(d=>d.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a,b)=>sortDir==="desc"?(b[view]||0)-(a[view]||0):(a[view]||0)-(b[view]||0));
    return sorted;
  };

  const data = buildData();
  const maxVal = data[0]?.[view==="inr"?"inr":"points"] || 1;

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}>
        <div style={s}>Portfolio Distribution</div>
        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
          {views.map(v=>(
            <button key={v.id} onClick={()=>setView(v.id)} style={{padding:"4px 10px",borderRadius:10,border:`1px solid ${view===v.id?acc:bdr}`,cursor:"pointer",fontSize:11,fontWeight:view===v.id?600:400,background:view===v.id?acc+"10":"transparent",color:view===v.id?acc:mut,transition:"all 0.15s"}}>
              {v.label}
            </button>
          ))}
        </div>
      </div>
      {/* Search + sort row */}
      <div style={{display:"flex",gap:8,marginBottom:14,alignItems:"center"}}>
        <div style={{position:"relative",flex:1}}>
          <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:mut,fontSize:12}}>🔍</span>
          <input
            style={{width:"100%",padding:"7px 10px 7px 30px",borderRadius:8,border:`1px solid ${bdr}`,background:surf2,color:txt,fontSize:12,outline:"none",boxSizing:"border-box"}}
            placeholder="Search..."
            value={search}
            onChange={e=>setSearch(e.target.value)}
          />
        </div>
        <button onClick={()=>setSortDir(d=>d==="desc"?"asc":"desc")} style={{padding:"7px 12px",borderRadius:8,border:`1px solid ${bdr}`,background:surf2,color:mut,cursor:"pointer",fontSize:11,fontWeight:500,flexShrink:0}}>
          {sortDir==="desc"?"↓ High→Low":"↑ Low→High"}
        </button>
        <label style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer",fontSize:11,color:mut,flexShrink:0}}>
          <input type="checkbox" checked={hideZero} onChange={e=>setHideZero(e.target.checked)} style={{accentColor:acc,cursor:"pointer"}}/>
          Hide zero
        </label>
      </div>

      {(hideZero?data.filter(d=>(view==="inr"?d.inr:d.points)>0):data).length === 0 ? (
        <div style={{color:mut,fontSize:13,textAlign:"center",padding:"20px 0"}}>No data yet</div>
      ) : (hideZero?data.filter(d=>(view==="inr"?d.inr:d.points)>0):data).slice(0, 12).map((d,i)=>{
        const val = view==="inr" ? d.inr : d.points;
        return (
          <div key={d.name+i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${bdr}`,gap:10}}>
            <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0,flex:1}}>
              <LogoCircle url={d.logo_url} name={d.name} color={acc} size={28}/>
              <div style={{minWidth:0}}>
                <div style={{fontSize:13,fontWeight:500,color:txt,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.name}</div>
                {d.sub&&<div style={{fontSize:11,color:mut}}>{d.sub}</div>}
              </div>
              {d.type&&<span style={{fontSize:10,padding:"1px 7px",borderRadius:10,background:surf2,color:mut,border:`1px solid ${bdr}`,flexShrink:0,fontWeight:500,letterSpacing:"0.04em"}}>{d.type==="card"?"CC":"LP"}</span>}
            </div>
            <div style={{fontSize:13,fontWeight:600,color:view==="inr"?grn:txt,flexShrink:0}}>
              {view==="inr" ? inrFmt(d.inr) : (d.points||0).toLocaleString("en-IN")}
            </div>
          </div>
        );
      })}
      {data.length > 12 && <div style={{fontSize:11,color:mut,textAlign:"center",marginTop:8}}>Showing top 12 of {data.length}</div>}
    </div>
  );
}


// ── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ db, onNavigate }) {
  const [cards, setCards] = useState([]);
  const [loyalties, setLoyalties] = useState([]);
  const [txns, setTxns] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    (async () => {
      setBusy(true);
      const [c, l, t, v, tr] = await Promise.all([
        db.from("cc_cards").select(),
        db.from("loyalty_programs").select(),
        db.from("point_transactions").select(),
        db.from("vouchers").select(),
        db.from("transfer_log").select(),
      ]);
      setCards(c.data || []);
      setLoyalties(l.data || []);
      setTxns((t.data || []).sort((a, b) => new Date(b.txn_date) - new Date(a.txn_date)));
      setVouchers(v.data || []);
      setTransfers(tr.data || []);
      setBusy(false);
    })();
  }, []);

  // ── computed values ─────────────────────────────────────────────────────────
  const totalCardPts = cards.reduce((a, c) => a + (c.points_balance || 0), 0);
  const totalLoyalPts = loyalties.reduce((a, l) => a + (l.points_balance || 0), 0);
  const totalPts = totalCardPts + totalLoyalPts;

  const cardInr = cards.reduce((a, c) => a + (c.points_balance || 0) * (c.inr_per_point || 0), 0);
  const loyalInr = loyalties.reduce((a, l) => a + (l.points_balance || 0) * (l.inr_per_point || 0), 0);
  const totalInr = cardInr + loyalInr;

  const activeVouchers = vouchers.filter(v => !v.redeemed).length;

  const now = new Date();
  const expiring30 = loyalties.filter(l => {
    if (!l.expiry_date) return false;
    const d = Math.round((new Date(l.expiry_date) - now) / 86400000);
    return d >= 0 && d <= 30;
  });
  const expiring90 = loyalties.filter(l => {
    if (!l.expiry_date) return false;
    const d = Math.round((new Date(l.expiry_date) - now) / 86400000);
    return d >= 0 && d <= 90;
  });

  // Bank comparison
  const bankMap = {};
  cards.forEach(c => {
    const bank = c.bank || "Other";
    bankMap[bank] = (bankMap[bank] || 0) + (c.points_balance || 0);
  });
  const banks = Object.entries(bankMap).sort((a, b) => b[1] - a[1]);
  const topBank = banks[0];
  const maxBankPts = banks[0]?.[1] || 1;

  // Category breakdown for loyalty
  const catMap = {};
  loyalties.forEach(l => {
    const cat = l.category || "Other";
    catMap[cat] = (catMap[cat] || 0) + (l.points_balance || 0);
  });
  const catColors = { Airline:acc, Hotel:acc, Retail:acc, Dining:acc, Fuel:acc, Other:acc };

  // Recent transactions (last 6)
  const recentTxns = txns.slice(0, 6);

  // Portfolio split for donut (cards vs loyalty)
  const donutData = [
    { label: "Credit Cards", value: totalCardPts, color: "#1a1410" },
    { label: "Loyalty", value: totalLoyalPts, color: "#b5862a" },
  ];

  // Simple SVG donut chart
  const DonutChart = ({ data, size = 140 }) => {
    const total = data.reduce((a, d) => a + d.value, 0);
    if (total === 0) return (
      <svg width={size} height={size} viewBox="0 0 140 140">
        <circle cx="70" cy="70" r="52" fill="none" stroke="#e8e3da" strokeWidth="18"/>
      </svg>
    );
    const r = 52; const cx = 70; const cy = 70;
    const circumference = 2 * Math.PI * r;
    let offset = 0;
    const segments = data.map(d => {
      const pct = d.value / total;
      const dash = pct * circumference;
      const seg = { ...d, dash, offset, pct };
      offset += dash;
      return seg;
    });
    return (
      <svg width={size} height={size} viewBox="0 0 140 140" style={{transform:"rotate(-90deg)"}}>
        {segments.map((s, i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={s.color} strokeWidth="18"
            strokeDasharray={`${s.dash} ${circumference - s.dash}`}
            strokeDashoffset={-s.offset}
            strokeLinecap="round"
          />
        ))}
      </svg>
    );
  };

  // Simple SVG area sparkline
  const Sparkline = ({ values, color, height=50, width=160 }) => {
    if (!values || values.length < 2) return null;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    const pts = values.map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 8) - 4;
      return `${x},${y}`;
    });
    const areaPath = `M${pts[0]} ${pts.map((p, i) => i === 0 ? "" : `L${p}`).join(" ")} L${width},${height} L0,${height} Z`;
    const linePath = `M${pts.join(" L")}`;
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id="spkgrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#spkgrad)"/>
        <path d={linePath} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    );
  };

  // Build monthly txn totals for sparkline (last 6 months)
  const monthlyTotals = (() => {
    const map = {};
    txns.forEach(t => {
      const m = t.txn_date?.slice(0, 7);
      if (m) map[m] = (map[m] || 0) + (t.points > 0 ? t.points : 0);
    });
    const months = Object.keys(map).sort().slice(-6);
    return months.map(m => map[m] || 0);
  })();

  const s = { // section header style
    fontSize: 11, fontWeight: 700, color: mut, letterSpacing: "0.1em",
    textTransform: "uppercase", marginBottom: 16,
  };

  const card = (children, style = {}) => (
    <div style={{
      background: surf, borderRadius: 18, border: `1.5px solid ${bdr}`,
      padding: "22px 24px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)",
      ...style
    }}>{children}</div>
  );

  if (busy) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"60vh",flexDirection:"column",gap:12}}>
      <div style={{fontSize:28}}>⏳</div>
      <div style={{color:mut,fontSize:14}}>Loading your portfolio…</div>
    </div>
  );

  return (
    <div style={{fontFamily:"'Inter',system-ui,sans-serif"}}>

      {/* ── Header ── */}
      <div style={{marginBottom:32}}>
        <div style={{fontSize:30,fontWeight:800,color:txt,letterSpacing:"-0.04em",lineHeight:1.1}}>Overview</div>
        <div style={{fontSize:14,color:mut,marginTop:6}}>Your points, miles &amp; rewards at a glance</div>
      </div>

      {/* ── Top stat row ── */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:14,marginBottom:24}}>

        {/* CC Rewards */}
        <div style={{background:txt,borderRadius:14,padding:"20px 22px",color:"#fff",position:"relative",overflow:"hidden"}}>
          <div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.5)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>CC Rewards</div>
          <div style={{fontSize:28,fontWeight:800,letterSpacing:"-0.03em",lineHeight:1}}>{totalCardPts.toLocaleString("en-IN")}</div>
          <div style={{fontSize:12,color:"rgba(255,255,255,0.45)",marginTop:6}}>{cards.length} active cards</div>
          {cardInr > 0 && <div style={{fontSize:13,color:gold,marginTop:4,fontWeight:600}}>{inrFmt(cardInr)}</div>}
          <button onClick={()=>onNavigate("cards")} style={{marginTop:10,background:"rgba(255,255,255,0.15)",border:"none",cursor:"pointer",fontSize:11,color:"#fff",fontWeight:600,padding:"4px 10px",borderRadius:6,letterSpacing:"0.04em"}}>View All →</button>
          <div style={{position:"absolute",right:16,top:16,opacity:0.08,fontSize:48}}>💳</div>
        </div>

        {/* Loyalty Points */}
        <div style={{background:acc,borderRadius:14,padding:"20px 22px",color:"#fff",position:"relative",overflow:"hidden"}}>
          <div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.6)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>Loyalty Points</div>
          <div style={{fontSize:28,fontWeight:800,letterSpacing:"-0.03em",lineHeight:1}}>{totalLoyalPts.toLocaleString("en-IN")}</div>
          <div style={{fontSize:12,color:"rgba(255,255,255,0.5)",marginTop:6}}>{loyalties.length} programs</div>
          {loyalInr > 0 && <div style={{fontSize:13,color:"#fff",marginTop:4,fontWeight:600,opacity:0.9}}>{inrFmt(loyalInr)}</div>}
          <button onClick={()=>onNavigate("loyalty")} style={{marginTop:10,background:"rgba(255,255,255,0.2)",border:"none",cursor:"pointer",fontSize:11,color:"#fff",fontWeight:600,padding:"4px 10px",borderRadius:6,letterSpacing:"0.04em"}}>View All →</button>
          <div style={{position:"absolute",right:16,top:16,opacity:0.15,fontSize:48}}>⭐</div>
        </div>

        {/* Portfolio Value */}
        <div style={{background:surf,border:`1.5px solid ${bdr}`,borderRadius:14,padding:"20px 22px",position:"relative",overflow:"hidden",boxShadow:"0 2px 12px rgba(0,0,0,0.05)"}}>
          <div style={{fontSize:11,fontWeight:600,color:mut,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>Portfolio Value</div>
          <div style={{fontSize:28,fontWeight:800,letterSpacing:"-0.03em",color:txt,lineHeight:1}}>{totalInr > 0 ? inrFmt(totalInr) : "—"}</div>
          <div style={{fontSize:12,color:mut,marginTop:6}}>{totalPts.toLocaleString("en-IN")} total points</div>
          {monthlyTotals.length >= 2 && <div style={{position:"absolute",bottom:12,right:12}}><Sparkline values={monthlyTotals} color={grn}/></div>}
        </div>

        {/* Vouchers */}
        <div style={{background:surf,border:`1.5px solid ${bdr}`,borderRadius:14,padding:"20px 22px",boxShadow:"0 2px 12px rgba(0,0,0,0.05)"}}>
          <div style={{fontSize:11,fontWeight:600,color:mut,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>Vouchers</div>
          <div style={{fontSize:28,fontWeight:800,letterSpacing:"-0.03em",color:txt,lineHeight:1}}>{activeVouchers}</div>
          <div style={{fontSize:12,color:mut,marginTop:6}}>active vouchers</div>
          <button onClick={()=>onNavigate("vouchers")} style={{marginTop:10,background:"rgba(0,0,0,0.06)",border:"none",cursor:"pointer",fontSize:11,color:txt,fontWeight:600,padding:"4px 10px",borderRadius:6,letterSpacing:"0.04em"}}>View All →</button>
        </div>
      </div>

      {/* ── Alerts ── */}
      {expiring30.length > 0 && (
        <div style={{background:"#fffbeb",border:`1.5px solid #fde68a`,borderRadius:14,padding:"14px 18px",marginBottom:20,display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
          <span style={{fontSize:18}}>⚠️</span>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:700,color:"#92400e"}}>Points expiring in 30 days</div>
            <div style={{fontSize:12,color:"#b45309",marginTop:2}}>{expiring30.map(l=>`${l.name} (${l.points_balance?.toLocaleString()} pts)`).join(" · ")}</div>
          </div>
          <button onClick={()=>onNavigate("loyalty")} style={{...gbtn,fontSize:12,padding:"6px 14px"}}>View Programs</button>
        </div>
      )}

      {/* ── Middle row: Donut + Bank Comparison ── */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>

        {/* Portfolio Breakdown donut */}
        {card(
          <div>
            <div style={s}>Portfolio Breakdown</div>
            <div style={{display:"flex",alignItems:"center",gap:24}}>
              <div style={{position:"relative",flexShrink:0}}>
                <DonutChart data={donutData} size={140}/>
                <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                  <div style={{fontSize:16,fontWeight:800,color:txt}}>{totalPts > 0 ? (totalPts >= 1000 ? (totalPts/1000).toFixed(0)+"K" : totalPts) : "0"}</div>
                  <div style={{fontSize:9,color:mut,textTransform:"uppercase",letterSpacing:"0.08em"}}>Total pts</div>
                </div>
              </div>
              <div style={{flex:1}}>
                {donutData.map((d, i) => (
                  <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:10,height:10,borderRadius:3,background:d.color,flexShrink:0}}/>
                      <div style={{fontSize:12,color:mut2}}>{d.label}</div>
                    </div>
                    <div style={{fontSize:13,fontWeight:700,color:txt}}>{d.value.toLocaleString("en-IN")}</div>
                  </div>
                ))}
                {totalInr > 0 && (
                  <div style={{marginTop:14,paddingTop:12,borderTop:`1px solid ${bdr}`}}>
                    <div style={{fontSize:11,color:mut,textTransform:"uppercase",letterSpacing:"0.08em"}}>Est. INR Value</div>
                    <div style={{fontSize:18,fontWeight:800,color:grn,marginTop:2}}>{inrFmt(totalInr)}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Portfolio Bar Chart */}
        {card(<PortfolioChart cards={cards} loyalties={loyalties} surf={surf} surf2={surf2} bdr={bdr} bdr2={bdr2} txt={txt} mut={mut} acc={acc} acc2={acc2} grn={grn} s={s}/>)}
      </div>

      {/* ── Bottom row: Loyalty Programs + Credit Cards ── */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>

        {/* Loyalty Programs */}
        {card(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <div style={s}>Loyalty Programs</div>
              <button onClick={()=>onNavigate("loyalty")} style={{background:"none",border:"none",cursor:"pointer",fontSize:11,color:acc,fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase",padding:0}}>View All →</button>
            </div>
            <div style={{fontSize:12,color:mut,marginBottom:16}}>{loyalties.length} programs{loyalInr>0?` · ${inrFmt(loyalInr)} est. value`:""}</div>
            {loyalties.length === 0 ? (
              <div style={{color:mut,fontSize:13,textAlign:"center",padding:"20px 0"}}>No loyalty programs yet</div>
            ) : [...loyalties].sort((a,b)=>(b.points_balance||0)-(a.points_balance||0)).slice(0,5).map(l => {
              const inrVal = (l.points_balance||0)*(l.inr_per_point||0);
              const days = l.expiry_date ? Math.round((new Date(l.expiry_date)-now)/86400000) : null;
              const expiring = days !== null && days <= 90;
              return (
                <div key={l.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:`1px solid ${bdr}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <LogoCircle url={l.logo_url} name={l.name} color={l.color||acc2} size={36}/>
                    <div>
                      <div style={{fontSize:13,fontWeight:600,color:txt}}>{l.name}</div>
                      <div style={{fontSize:11,color:mut,marginTop:1}}>
                        {l.tier&&<span style={{fontWeight:600,color:acc}}>{l.tier} · </span>}
                        {expiring&&<span style={{color:red}}>⚠ {days}d · </span>}
                        {l.category}
                        {l.loyalty_number&&<span> · #{l.loyalty_number}</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:14,fontWeight:700,color:txt}}>{(l.points_balance||0).toLocaleString("en-IN")}</div>
                    {inrVal>0&&<div style={{fontSize:11,color:grn,marginTop:1}}>{inrFmt(inrVal)}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Credit Cards */}
        {card(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <div style={s}>Credit Cards</div>
              <button onClick={()=>onNavigate("cards")} style={{background:"none",border:"none",cursor:"pointer",fontSize:11,color:acc,fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase",padding:0}}>View All →</button>
            </div>
            <div style={{fontSize:12,color:mut,marginBottom:16}}>{cards.length} cards{cardInr>0?` · ${inrFmt(cardInr)} est. value`:""}</div>
            {cards.length === 0 ? (
              <div style={{color:mut,fontSize:13,textAlign:"center",padding:"20px 0"}}>No cards yet</div>
            ) : [...cards].sort((a,b)=>(b.points_balance||0)-(a.points_balance||0)).slice(0,5).map(c => {
              const inrVal = (c.points_balance||0)*(c.inr_per_point||0);
              const nc2 = {Visa:"#1a1f71",Mastercard:"#dc2626",Amex:"#0066b3",Diners:"#2c2c8c",RuPay:"#ea580c",Other:acc};
              return (
                <div key={c.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:`1px solid ${bdr}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <LogoCircle url={c.logo_url} name={c.name} color={c.color||acc} size={36}/>
                    <div>
                      <div style={{fontSize:13,fontWeight:600,color:txt}}>{c.name}{c.last4&&<span style={{color:mut,fontWeight:400}}> ···· {c.last4}</span>}</div>
                      <div style={{fontSize:11,color:mut,marginTop:1,display:"flex",gap:6,alignItems:"center"}}>
                        <span style={{fontSize:10,fontWeight:500,padding:"1px 6px",borderRadius:10,background:surf2,color:mut,border:`1px solid ${bdr}`}}>{c.network}</span>
                        {c.bank&&<span>{c.bank}</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:14,fontWeight:700,color:txt}}>{(c.points_balance||0).toLocaleString("en-IN")}</div>
                    {inrVal>0&&<div style={{fontSize:11,color:grn,marginTop:1}}>{inrFmt(inrVal)}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Expiring in 90 days ── */}
      {expiring90.length > 0 && card(
        <div>
          <div style={s}>Expiring Points — Next 90 Days</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12}}>
            {expiring90.map(l => {
              const days = Math.round((new Date(l.expiry_date) - now) / 86400000);
              const urgency = days <= 30 ? red : days <= 60 ? gold : mut2;
              return (
                <div key={l.id} style={{background:surf2,borderRadius:12,padding:"14px 16px",border:`1.5px solid ${days<=30?red+"33":bdr}`}}>
                  <div style={{fontSize:13,fontWeight:600,color:txt,marginBottom:4}}>{l.name}</div>
                  <div style={{fontSize:20,fontWeight:800,color:txt}}>{(l.points_balance||0).toLocaleString("en-IN")}</div>
                  <div style={{fontSize:11,color:urgency,marginTop:4,fontWeight:600}}>Expires in {days} days</div>
                  <div style={{fontSize:10,color:mut,marginTop:2}}>{new Date(l.expiry_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</div>
                </div>
              );
            })}
          </div>
        </div>
      , {marginBottom:16})}

      {/* ── Transfer activity ── */}
      {card(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div style={s}>Recent Transfers</div>
            <button onClick={()=>onNavigate("history")} style={{background:"none",border:"none",cursor:"pointer",fontSize:11,color:acc,fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase",padding:0}}>View All →</button>
          </div>
          {transfers.length===0 ? (
            <div style={{color:mut,fontSize:13,textAlign:"center",padding:"20px 0"}}>No transfers yet. Use Transfer Points to move points between programs.</div>
          ) : (
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead>
                  <tr style={{color:mut,fontSize:10,textTransform:"uppercase",letterSpacing:"0.08em",borderBottom:`1.5px solid ${bdr}`}}>
                    {["Date","From","To","Sent","Received"].map(h=>(
                      <th key={h} style={{padding:"6px 12px",textAlign:h==="Sent"||h==="Received"?"right":"left",fontWeight:700}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...transfers].sort((a,b)=>new Date(b.transfer_date)-new Date(a.transfer_date)).slice(0,5).map(t=>(
                    <tr key={t.id} style={{borderBottom:`1px solid ${bdr}`}}>
                      <td style={{padding:"10px 12px",color:mut,whiteSpace:"nowrap"}}>{new Date(t.transfer_date).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</td>
                      <td style={{padding:"10px 12px",fontWeight:500,color:txt}}>{t.from_program}</td>
                      <td style={{padding:"10px 12px",fontWeight:500,color:txt}}>{t.to_program}</td>
                      <td style={{padding:"10px 12px",textAlign:"right",fontWeight:600,color:red}}>{(t.points_sent||0).toLocaleString()}</td>
                      <td style={{padding:"10px 12px",textAlign:"right",fontWeight:600,color:grn}}>{((t.points_received||0)+(t.bonus_miles||0)).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      , {marginBottom:16})}

    </div>
  );
}


// ── Shell ─────────────────────────────────────────────────────────────────────
const TABS=[
  {id:"dashboard", label:"Overview",           icon:"◈"},
  {id:"cards",     label:"Credit Cards",      icon:"💳"},
  {id:"loyalty",   label:"Loyalty Programs",  icon:"⭐"},
  {id:"transfers", label:"Transfer Partners", icon:"⚙️"},
  {id:"transfer",  label:"Transfer Points",   icon:"↔️"},
  {id:"vouchers",  label:"Vouchers",          icon:"🎟️"},
  {id:"settings",  label:"Settings",          icon:"🔧"},
  {id:"import",    label:"Import Statement",   icon:"📥"},
  {id:"history",   label:"Transfer History",   icon:"📋"},
];

export default function App() {
  const [db,setDb]=useState(null);
  const [tab,setTab]=useState("dashboard");
  const [menuOpen,setMenuOpen]=useState(false);

  useEffect(()=>{
    const u=localStorage.getItem("pv_u"),k=localStorage.getItem("pv_k");
    if(u&&k) setDb(createSupabaseClient(u,k));
  },[]);

  if(!db) return <Setup onDone={setDb}/>;
  const cur=TABS.find(t=>t.id===tab);

  return (
    <div style={{minHeight:"100vh",background:bg,color:txt,fontFamily:"'Inter',system-ui,sans-serif",fontSize:14}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        body { font-family: 'Inter', system-ui, sans-serif !important; background: #f8f6f2; }
        @media(max-width:640px){.desk-nav{display:none!important}.mob-hdr{display:flex!important}.main-wrap{margin-left:0!important;padding:16px!important;padding-top:68px!important}}
        @media(min-width:641px){.mob-hdr{display:none!important}}
        input:focus, select:focus { border-color: ${acc} !important; box-shadow: 0 0 0 3px ${acc}30; outline: none; }
        input, select, button { font-family: inherit; }
        tr:hover td { background: ${surf2}; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${bdr2}; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: ${mut}; }
      `}</style>

      {/* Desktop sidebar */}
      <nav className="desk-nav" style={{position:"fixed",top:0,left:0,bottom:0,width:220,background:surf,borderRight:`1.5px solid ${bdr}`,display:"flex",flexDirection:"column",zIndex:10,boxShadow:`2px 0 12px rgba(0,0,0,0.06)`}}>
        <div style={{padding:"28px 24px 24px",borderBottom:`1.5px solid ${bdr}`}}>
          <div style={{fontSize:17,fontWeight:800,color:txt,letterSpacing:"-0.03em"}}>PointsVault</div>
          <div style={{fontSize:10,color:mut,marginTop:4,letterSpacing:"0.12em",textTransform:"uppercase"}}>Rewards Tracker</div>
        </div>
        <div style={{flex:1,paddingTop:8,overflowY:"auto"}}>
          {TABS.map(t=>(
            <div key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 24px",cursor:"pointer",fontSize:12,fontWeight:tab===t.id?600:400,color:tab===t.id?txt:mut,background:tab===t.id?surf2:"transparent",borderLeft:tab===t.id?`2px solid ${acc}`:"2px solid transparent",transition:"all 0.15s",letterSpacing:"0.01em"}}>
              <span style={{fontSize:14,opacity:tab===t.id?1:0.5}}>{t.icon}</span>{t.label}
            </div>
          ))}
        </div>
        <div style={{padding:"16px 24px 24px",borderTop:`1px solid ${bdr}`}}>
          <div style={{fontSize:10,color:mut,letterSpacing:"0.08em",textTransform:"uppercase"}}>Synced · Supabase</div>
        </div>
      </nav>

      {/* Mobile header */}
      <div className="mob-hdr" style={{display:"none",position:"fixed",top:0,left:0,right:0,height:56,background:surf,borderBottom:`1.5px solid ${bdr}`,alignItems:"center",justifyContent:"space-between",padding:"0 16px",zIndex:100,boxShadow:`0 2px 8px rgba(0,0,0,0.06)`}}>
        <div style={{fontSize:15,fontWeight:800,color:txt,letterSpacing:"-0.02em"}}>PointsVault</div>
        <div style={{fontSize:13,color:acc,fontWeight:700}}>{cur?.icon} {cur?.label}</div>
        <button onClick={()=>setMenuOpen(o=>!o)} style={{background:"none",border:"none",cursor:"pointer",color:txt,fontSize:22,padding:"0 4px"}}>☰</button>
      </div>
      {menuOpen&&(
        <div style={{position:"fixed",top:56,left:0,right:0,background:surf,borderBottom:`1.5px solid ${bdr}`,zIndex:99,boxShadow:"0 4px 16px rgba(0,0,0,0.1)"}}>
          {TABS.map(t=><div key={t.id} onClick={()=>{ setTab(t.id); setMenuOpen(false); }} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 20px",cursor:"pointer",fontSize:14,fontWeight:tab===t.id?700:400,color:tab===t.id?acc:mut,background:tab===t.id?acc+"08":"transparent",borderBottom:`1px solid ${bdr}`}}><span>{t.icon}</span>{t.label}</div>)}
        </div>
      )}

      {/* Main content */}
      <main className="main-wrap" style={{marginLeft:220,padding:"36px 40px 80px",minHeight:"100vh",background:bg}}>
        {tab==="dashboard" && <Dashboard db={db} onNavigate={setTab}/>}
        {tab==="cards"     && <Cards db={db}/>}
        {tab==="loyalty"   && <Loyalty db={db}/>}
        {tab==="transfers" && <Transfers db={db}/>}
        {tab==="transfer"  && <TransferPoints db={db}/>}
        {tab==="vouchers"  && <Vouchers db={db}/>}
        {tab==="settings"  && <Settings onDisconnect={()=>setDb(null)} db={db}/>}
        {tab==="import"    && <StatementImport db={db}/>}
        {tab==="history"   && <TransferHistory db={db}/>}
      </main>
    </div>
  );
}
