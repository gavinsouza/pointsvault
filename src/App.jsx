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
  return {
    from: t => ({
      select: (q="") => req(`/${t}?select=*${q}`),
      insert: row => req(`/${t}`, { method: "POST", body: JSON.stringify(row) }),
      update: (id, row) => req(`/${t}?id=eq.${id}`, { method: "PATCH", body: JSON.stringify(row) }),
      delete: id => req(`/${t}?id=eq.${id}`, { method: "DELETE" }),
      filter: (col, val) => req(`/${t}?select=*&${col}=eq.${encodeURIComponent(val)}`),
    })
  };
}

const SETUP_SQL = `CREATE TABLE IF NOT EXISTS cc_cards (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL, bank text, last4 text, network text,
  points_balance bigint DEFAULT 0, points_currency text DEFAULT 'pts',
  stmt_date int, annual_fee numeric DEFAULT 0, color text DEFAULT '#6366f1',
  created_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS loyalty_programs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL, category text, points_balance bigint DEFAULT 0,
  expiry_date date, expiry_rule text, tier text, color text DEFAULT '#8b5cf6',
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
);`;

const bg="#0a0e1a", surf="#111827", bdr="#1e2540", txt="#e8eaf0", mut="#4a5280", acc="#6366f1";
const inp={ width:"100%", padding:"9px 12px", background:bg, border:"1px solid #2a3050", borderRadius:8, color:txt, fontSize:13, outline:"none", boxSizing:"border-box", colorScheme:"dark", marginBottom:12 };
const pbtn={ display:"inline-flex", alignItems:"center", gap:6, padding:"9px 16px", borderRadius:8, border:"none", cursor:"pointer", fontSize:13, fontWeight:500, background:acc, color:"#fff" };
const gbtn={ ...pbtn, background:"rgba(255,255,255,0.05)", color:"#a5b4fc" };
const dbtn={ ...pbtn, background:"rgba(239,68,68,0.12)", color:"#f87171" };

function lbl(t){ return <div style={{fontSize:11,color:mut,fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:5}}>{t}</div>; }

function Modal({ show, onClose, title, children }) {
  if (!show) return null;
  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.9)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,padding:20}}>
      <div style={{background:surf,border:`1px solid ${bdr}`,borderRadius:16,padding:24,width:"100%",maxWidth:480,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 40px 80px rgba(0,0,0,0.9)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <span style={{fontSize:16,fontWeight:700,color:"#fff"}}>{title}</span>
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

function StatBox({ label, value, color="#a5b4fc" }) {
  return (
    <div style={{background:bg,border:`1px solid ${bdr}`,borderRadius:12,padding:"12px 16px",flex:1,minWidth:110}}>
      <div style={{fontSize:10,color:mut,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:5}}>{label}</div>
      <div style={{fontSize:20,fontWeight:800,color,letterSpacing:"-0.02em"}}>{value}</div>
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
    <div style={{minHeight:"100vh",background:bg,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"Inter,system-ui,sans-serif",color:txt}}>
      <div style={{maxWidth:420,width:"100%"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:26,fontWeight:800,color:"#fff"}}>PointsVault</div>
          <div style={{fontSize:13,color:mut,marginTop:5}}>Connect your Supabase database</div>
        </div>
        <div style={{background:surf,border:`1px solid ${bdr}`,borderRadius:14,padding:24}}>
          {lbl("Supabase Project URL")}<input style={inp} placeholder="https://xxxx.supabase.co" value={url} onChange={e=>setUrl(e.target.value)}/>
          {lbl("Anon Public Key")}<input style={inp} type="password" placeholder="eyJ..." value={key} onChange={e=>setKey(e.target.value)}/>
          {msg&&<div style={{color:"#f87171",fontSize:12,marginBottom:10}}>{msg}</div>}
          <button style={{...pbtn,width:"100%",justifyContent:"center"}} onClick={go}>Connect</button>
        </div>
      </div>
    </div>
  );
}

// ── Add Transfer Partner Modal (reusable) ─────────────────────────────────────
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
      <div style={{background:"rgba(99,102,241,0.06)",border:"1px solid rgba(99,102,241,0.15)",borderRadius:10,padding:14,marginBottom:14}}>
        <div style={{fontSize:11,color:acc,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>From</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Type")}<select style={inp} value={f.from_type} onChange={e=>setF(p=>({...p,from_type:e.target.value,from_program:""}))}><option value="card">Credit Card</option><option value="loyalty">Loyalty Program</option></select></div>
          <div>{lbl("Program")}<select style={inp} value={f.from_program} onChange={up("from_program")}><option value="">— select —</option>{optionsFor(f.from_type).map(o=><option key={o} value={o}>{o}</option>)}</select></div>
        </div>
      </div>
      <div style={{background:"rgba(52,211,153,0.06)",border:"1px solid rgba(52,211,153,0.15)",borderRadius:10,padding:14,marginBottom:14}}>
        <div style={{fontSize:11,color:"#34d399",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>To</div>
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

// ── Points History Table (shared) ─────────────────────────────────────────────
function PointsTable({ txns, openingBalance }) {
  if (!txns || txns.length===0) return <div style={{color:mut,fontSize:13,textAlign:"center",padding:20}}>No transactions yet</div>;

  // Sort ascending to compute running balance, then reverse for display
  const sorted = [...txns].sort((a,b)=>new Date(a.txn_date)-new Date(b.txn_date) || new Date(a.created_at)-new Date(b.created_at));
  let bal = openingBalance || 0;
  const rows = sorted.map(t=>{ const open=bal; bal+=t.points; return {...t,opening:open,closing:bal}; });
  const display = rows.reverse();

  return (
    <div style={{overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
        <thead>
          <tr style={{color:mut,fontSize:11,textTransform:"uppercase",letterSpacing:"0.05em"}}>
            {["Date","Description","Points","Opening","Closing"].map(h=>(
              <th key={h} style={{textAlign:h==="Date"||h==="Description"?"left":"right",padding:"8px 12px",borderBottom:`1px solid ${bdr}`,whiteSpace:"nowrap"}}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Opening balance row */}
          <tr style={{borderBottom:`1px solid ${bdr}`,background:"rgba(99,102,241,0.05)"}}>
            <td style={{padding:"10px 12px",color:mut}} colSpan={2}><em style={{color:acc,fontSize:12}}>Opening Balance</em></td>
            <td style={{padding:"10px 12px",textAlign:"right"}}></td>
            <td style={{padding:"10px 12px",textAlign:"right"}}></td>
            <td style={{padding:"10px 12px",textAlign:"right",fontWeight:700,color:acc}}>{(openingBalance||0).toLocaleString()}</td>
          </tr>
          {display.map(t=>(
            <tr key={t.id} style={{borderBottom:`1px solid ${bdr}`}}>
              <td style={{padding:"10px 12px",color:mut,whiteSpace:"nowrap"}}>{new Date(t.txn_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</td>
              <td style={{padding:"10px 12px",color:txt}}>{t.description||"—"}</td>
              <td style={{padding:"10px 12px",textAlign:"right",fontWeight:600,color:t.points>0?"#34d399":"#f87171"}}>{t.points>0?"+":""}{t.points.toLocaleString()}</td>
              <td style={{padding:"10px 12px",textAlign:"right",color:mut}}>{t.opening.toLocaleString()}</td>
              <td style={{padding:"10px 12px",textAlign:"right",color:"#fff",fontWeight:600}}>{t.closing.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Card Detail ───────────────────────────────────────────────────────────────
function CardDetail({ card: initialCard, db, onBack, onEdit, onDelete, allCards, allLoyalties }) {
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
  const nc={Visa:"#1a1f71",Mastercard:"#eb001b",Amex:"#006fcf",Diners:"#2c2c8c",RuPay:"#ff6600",Other:acc};
  const [ef,setEf]=useState({});
  const eup=k=>e=>setEf(p=>({...p,[k]:e.target.value}));

  const load=async()=>{
    setBusy(true);
    const [t,p]=await Promise.all([db.from("point_transactions").filter("program_name",card.name),db.from("transfer_partners").filter("from_program",card.name)]);
    setTxns((t.data||[]).sort((a,b)=>new Date(b.txn_date)-new Date(a.txn_date)));
    setPartners(p.data||[]);
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

  const saveEdit=async()=>{
    if(!ef.name?.trim()) return alert("Name required");
    const p={name:ef.name.trim(),bank:ef.bank,last4:ef.last4,network:ef.network,color:ef.color,points_currency:ef.points_currency,points_balance:parseInt(ef.points_balance)||0,annual_fee:parseFloat(ef.annual_fee)||0,stmt_date:parseInt(ef.stmt_date)||null};
    const {error}=await db.from("cc_cards").update(card.id,p);
    if(error) return alert("Error: "+JSON.stringify(error));
    setCard(c=>({...c,...p})); setShowEdit(false);
  };

  const delCard=async()=>{
    if(!confirm("Delete this card and all its transactions?")) return;
    await db.from("cc_cards").delete(card.id);
    onDelete();
  };

  const delPartner=async id=>{ if(confirm("Remove partner?")){ await db.from("transfer_partners").delete(id); load(); } };

  // compute opening balance = sum of all txns before earliest (i.e. the initial balance set)
  // We treat opening balance as card.points_balance minus all txns
  const txnSum = txns.reduce((a,t)=>a+t.points,0);
  const openingBalance = (card.points_balance||0) - txnSum;

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
        <BackBtn onClick={onBack}/>
        <div style={{display:"flex",gap:8}}>
          <button style={{...gbtn,padding:"7px 12px",fontSize:12}} onClick={()=>{ setEf({name:card.name,bank:card.bank||"",last4:card.last4||"",network:card.network||"Visa",points_balance:String(card.points_balance||""),points_currency:card.points_currency||"pts",stmt_date:String(card.stmt_date||""),annual_fee:String(card.annual_fee||""),color:card.color||"#6366f1"}); setShowEdit(true); }}>✎ Edit</button>
          <button style={{...dbtn,padding:"7px 12px",fontSize:12}} onClick={delCard}>Delete</button>
        </div>
      </div>

      {/* Header */}
      <div style={{background:surf,border:`1px solid ${bdr}`,borderRadius:14,padding:"20px 22px",borderTop:`4px solid ${card.color||acc}`,marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
          <div>
            <div style={{fontSize:22,fontWeight:800,color:"#fff"}}>{card.name}</div>
            <div style={{fontSize:13,color:mut,marginTop:3}}>{card.bank}{card.last4?` ···· ${card.last4}`:""} · <span style={{color:nc[card.network]||acc}}>{card.network}</span></div>
          </div>
          <button style={pbtn} onClick={()=>{ setF(tf); setShowTxn(true); }}>+ Add Transaction</button>
        </div>
        <div style={{display:"flex",gap:12,marginTop:16,flexWrap:"wrap"}}>
          <StatBox label="Current Balance" value={(card.points_balance||0).toLocaleString()+" "+(card.points_currency||"pts")} color="#fff"/>
          {card.stmt_date&&<StatBox label="Statement Date" value={card.stmt_date+"th"}/>}
          {card.annual_fee>0&&<StatBox label="Annual Fee" value={"₹"+Number(card.annual_fee).toLocaleString()} color="#f87171"/>}
        </div>
      </div>

      {/* Transfer Partners */}
      <div style={{background:surf,border:`1px solid ${bdr}`,borderRadius:14,padding:"18px 20px",marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontSize:13,fontWeight:700,color:"#a5b4fc",textTransform:"uppercase",letterSpacing:"0.06em"}}>Transfer Partners</div>
          <button style={{...gbtn,padding:"6px 12px",fontSize:12}} onClick={()=>setShowPartner(true)}>+ Add Partner</button>
        </div>
        {partners.length===0?<div style={{color:mut,fontSize:13}}>No partners yet</div>:(
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {partners.map(p=>(
              <div key={p.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",background:bg,borderRadius:10,border:`1px solid ${bdr}`,flexWrap:"wrap",gap:8}}>
                <div style={{fontSize:14,fontWeight:600,color:"#fff"}}>{p.to_program}</div>
                <div style={{display:"flex",gap:14,alignItems:"center",flexWrap:"wrap"}}>
                  <div style={{textAlign:"center"}}><div style={{fontSize:14,fontWeight:800,color:"#fff"}}>{p.ratio_from}:{p.ratio_to}</div><div style={{fontSize:10,color:mut}}>RATIO</div></div>
                  {p.min_transfer&&<div style={{textAlign:"center"}}><div style={{fontSize:12,color:"#a5b4fc"}}>{Number(p.min_transfer).toLocaleString()}</div><div style={{fontSize:10,color:mut}}>MIN</div></div>}
                  {p.transfer_time&&<div style={{textAlign:"center"}}><div style={{fontSize:12,color:"#34d399"}}>{p.transfer_time}</div><div style={{fontSize:10,color:mut}}>TIME</div></div>}
                  <button style={{...dbtn,padding:"4px 8px",fontSize:11}} onClick={()=>delPartner(p.id)}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transactions */}
      <div style={{background:surf,border:`1px solid ${bdr}`,borderRadius:14,padding:"18px 20px"}}>
        <div style={{fontSize:13,fontWeight:700,color:"#a5b4fc",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:14}}>Points History</div>
        {busy?<div style={{color:mut,padding:20,textAlign:"center"}}>Loading…</div>:<PointsTable txns={txns} openingBalance={openingBalance}/>}
      </div>

      {/* Add Transaction Modal */}
      <Modal show={showTxn} onClose={()=>setShowTxn(false)} title="Add Transaction">
        {lbl("Type")}<select style={inp} value={f.type} onChange={up("type")}><option value="earn">Earn (+ points)</option><option value="redeem">Redeem (- points)</option><option value="adjust">Manual Adjustment</option></select>
        {lbl("Points")}<input style={inp} type="number" placeholder="1000" value={f.points} onChange={up("points")}/>
        {lbl("Description")}<input style={inp} placeholder="Grocery spend, Welcome bonus..." value={f.description} onChange={up("description")}/>
        {lbl("Date")}<input style={inp} type="date" value={f.txn_date} onChange={up("txn_date")}/>
        <button style={{...pbtn,width:"100%",justifyContent:"center",marginTop:4}} onClick={saveTxn}>Save Transaction</button>
      </Modal>

      {/* Edit Card Modal */}
      <Modal show={showEdit} onClose={()=>setShowEdit(false)} title="Edit Card">
        {lbl("Card Name *")}<input style={inp} value={ef.name||""} onChange={eup("name")}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Bank")}<input style={inp} value={ef.bank||""} onChange={eup("bank")}/></div>
          <div>{lbl("Last 4")}<input style={inp} maxLength={4} value={ef.last4||""} onChange={eup("last4")}/></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Network")}<select style={inp} value={ef.network||"Visa"} onChange={eup("network")}>{nets.map(n=><option key={n}>{n}</option>)}</select></div>
          <div>{lbl("Color")}<input style={{...inp,padding:"5px 8px",cursor:"pointer"}} type="color" value={ef.color||"#6366f1"} onChange={eup("color")}/></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Points Balance")}<input style={inp} type="number" value={ef.points_balance||""} onChange={eup("points_balance")}/></div>
          <div>{lbl("Points Unit")}<input style={inp} value={ef.points_currency||""} onChange={eup("points_currency")}/></div>
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
function LPDetail({ prog: initialProg, db, onBack, onDelete, allCards, allLoyalties }) {
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
  const cc={Airline:"#3b82f6",Hotel:"#f59e0b",Retail:"#10b981",Dining:"#f97316",Fuel:"#ef4444",Other:"#8b5cf6"};
  const [ef,setEf]=useState({});
  const eup=k=>e=>setEf(p=>({...p,[k]:e.target.value}));

  const load=async()=>{
    setBusy(true);
    const [t,p]=await Promise.all([db.from("point_transactions").filter("program_name",prog.name),db.from("transfer_partners").filter("from_program",prog.name)]);
    setTxns((t.data||[]).sort((a,b)=>new Date(b.txn_date)-new Date(a.txn_date)));
    setPartners(p.data||[]);
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

  const saveEdit=async()=>{
    if(!ef.name?.trim()) return alert("Name required");
    const p={name:ef.name.trim(),category:ef.category,tier:ef.tier,color:ef.color,expiry_date:ef.expiry_date||null,expiry_rule:ef.expiry_rule,points_balance:parseInt(ef.points_balance)||0};
    const {error}=await db.from("loyalty_programs").update(prog.id,p);
    if(error) return alert("Error: "+JSON.stringify(error));
    setProg(x=>({...x,...p})); setShowEdit(false);
  };

  const delProg=async()=>{ if(!confirm("Delete this program?")) return; await db.from("loyalty_programs").delete(prog.id); onDelete(); };
  const delPartner=async id=>{ if(confirm("Remove partner?")){ await db.from("transfer_partners").delete(id); load(); } };

  const txnSum=txns.reduce((a,t)=>a+t.points,0);
  const openingBalance=(prog.points_balance||0)-txnSum;
  const days=d=>d?Math.round((new Date(d)-new Date())/86400000):null;
  const d=days(prog.expiry_date); const exp=d!==null&&d<60;

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
        <BackBtn onClick={onBack}/>
        <div style={{display:"flex",gap:8}}>
          <button style={{...gbtn,padding:"7px 12px",fontSize:12}} onClick={()=>{ setEf({name:prog.name,category:prog.category||"Airline",points_balance:String(prog.points_balance||""),expiry_date:prog.expiry_date||"",expiry_rule:prog.expiry_rule||"",tier:prog.tier||"",color:prog.color||"#8b5cf6"}); setShowEdit(true); }}>✎ Edit</button>
          <button style={{...dbtn,padding:"7px 12px",fontSize:12}} onClick={delProg}>Delete</button>
        </div>
      </div>

      <div style={{background:surf,border:`1px solid ${bdr}`,borderRadius:14,padding:"20px 22px",borderTop:`4px solid ${prog.color||"#8b5cf6"}`,marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
          <div>
            <div style={{fontSize:22,fontWeight:800,color:"#fff"}}>{prog.name}</div>
            <div style={{fontSize:13,color:mut,marginTop:3}}><span style={{color:cc[prog.category]||"#8b5cf6"}}>{prog.category}</span>{prog.tier&&<span style={{color:"#a78bfa"}}> · {prog.tier}</span>}</div>
          </div>
          <button style={pbtn} onClick={()=>{ setF(tf); setShowTxn(true); }}>+ Add Transaction</button>
        </div>
        <div style={{display:"flex",gap:12,marginTop:16,flexWrap:"wrap"}}>
          <StatBox label="Current Balance" value={(prog.points_balance||0).toLocaleString()+" pts"} color="#fff"/>
          {prog.expiry_date&&<StatBox label="Expiry" value={d!==null?`${d}d left`:"—"} color={exp?"#f87171":"#a5b4fc"}/>}
        </div>
        {prog.expiry_rule&&<div style={{fontSize:12,color:mut,marginTop:10}}>{prog.expiry_rule}</div>}
      </div>

      <div style={{background:surf,border:`1px solid ${bdr}`,borderRadius:14,padding:"18px 20px",marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontSize:13,fontWeight:700,color:"#a5b4fc",textTransform:"uppercase",letterSpacing:"0.06em"}}>Transfer Partners</div>
          <button style={{...gbtn,padding:"6px 12px",fontSize:12}} onClick={()=>setShowPartner(true)}>+ Add Partner</button>
        </div>
        {partners.length===0?<div style={{color:mut,fontSize:13}}>No partners yet</div>:(
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {partners.map(p=>(
              <div key={p.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",background:bg,borderRadius:10,border:`1px solid ${bdr}`,flexWrap:"wrap",gap:8}}>
                <div style={{fontSize:14,fontWeight:600,color:"#fff"}}>{p.to_program}</div>
                <div style={{display:"flex",gap:14,alignItems:"center",flexWrap:"wrap"}}>
                  <div style={{textAlign:"center"}}><div style={{fontSize:14,fontWeight:800,color:"#fff"}}>{p.ratio_from}:{p.ratio_to}</div><div style={{fontSize:10,color:mut}}>RATIO</div></div>
                  {p.min_transfer&&<div style={{textAlign:"center"}}><div style={{fontSize:12,color:"#a5b4fc"}}>{Number(p.min_transfer).toLocaleString()}</div><div style={{fontSize:10,color:mut}}>MIN</div></div>}
                  {p.transfer_time&&<div style={{textAlign:"center"}}><div style={{fontSize:12,color:"#34d399"}}>{p.transfer_time}</div><div style={{fontSize:10,color:mut}}>TIME</div></div>}
                  <button style={{...dbtn,padding:"4px 8px",fontSize:11}} onClick={()=>delPartner(p.id)}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{background:surf,border:`1px solid ${bdr}`,borderRadius:14,padding:"18px 20px"}}>
        <div style={{fontSize:13,fontWeight:700,color:"#a5b4fc",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:14}}>Points History</div>
        {busy?<div style={{color:mut,padding:20,textAlign:"center"}}>Loading…</div>:<PointsTable txns={txns} openingBalance={openingBalance}/>}
      </div>

      <Modal show={showTxn} onClose={()=>setShowTxn(false)} title="Add Transaction">
        {lbl("Type")}<select style={inp} value={f.type} onChange={up("type")}><option value="earn">Earn (+ points)</option><option value="redeem">Redeem (- points)</option><option value="adjust">Manual Adjustment</option></select>
        {lbl("Points")}<input style={inp} type="number" placeholder="1000" value={f.points} onChange={up("points")}/>
        {lbl("Description")}<input style={inp} placeholder="Flight booking, Hotel stay..." value={f.description} onChange={up("description")}/>
        {lbl("Date")}<input style={inp} type="date" value={f.txn_date} onChange={up("txn_date")}/>
        <button style={{...pbtn,width:"100%",justifyContent:"center",marginTop:4}} onClick={saveTxn}>Save Transaction</button>
      </Modal>

      <Modal show={showEdit} onClose={()=>setShowEdit(false)} title="Edit Program">
        {lbl("Program Name *")}<input style={inp} value={ef.name||""} onChange={eup("name")}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Category")}<select style={inp} value={ef.category||"Airline"} onChange={eup("category")}>{cats.map(c=><option key={c}>{c}</option>)}</select></div>
          <div>{lbl("Tier")}<input style={inp} value={ef.tier||""} onChange={eup("tier")}/></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Points Balance")}<input style={inp} type="number" value={ef.points_balance||""} onChange={eup("points_balance")}/></div>
          <div>{lbl("Expiry Date")}<input style={inp} type="date" value={ef.expiry_date||""} onChange={eup("expiry_date")}/></div>
        </div>
        {lbl("Expiry Rule")}<input style={inp} value={ef.expiry_rule||""} onChange={eup("expiry_rule")}/>
        {lbl("Color")}<input style={{...inp,padding:"5px 8px",cursor:"pointer"}} type="color" value={ef.color||"#8b5cf6"} onChange={eup("color")}/>
        <button style={{...pbtn,width:"100%",justifyContent:"center",marginTop:4}} onClick={saveEdit}>Save Changes</button>
      </Modal>

      <AddPartnerModal show={showPartner} onClose={()=>setShowPartner(false)} db={db} defaultFrom={prog.name} cards={allCards} loyalties={allLoyalties} onSaved={load}/>
    </div>
  );
}

// ── Cards List ────────────────────────────────────────────────────────────────
function Cards({ db }) {
  const [rows,setRows]=useState([]); const [loyalties,setLoyalties]=useState([]);
  const [busy,setBusy]=useState(true);
  const [show,setShow]=useState(false);
  const [detail,setDetail]=useState(null);
  const [msg,setMsg]=useState("");
  const empty={name:"",bank:"",last4:"",network:"Visa",points_balance:"",points_currency:"pts",stmt_date:"",annual_fee:"",color:"#6366f1"};
  const [f,setF]=useState(empty);
  const up=k=>e=>setF(p=>({...p,[k]:e.target.value}));
  const nets=["Visa","Mastercard","Amex","Diners","RuPay","Other"];
  const nc={Visa:"#1a1f71",Mastercard:"#eb001b",Amex:"#006fcf",Diners:"#2c2c8c",RuPay:"#ff6600",Other:acc};

  const load=async()=>{ setBusy(true); setMsg(""); const [{data:c,error},{data:l}]=await Promise.all([db.from("cc_cards").select(),db.from("loyalty_programs").select()]); if(error) setMsg(JSON.stringify(error)); setRows(c||[]); setLoyalties(l||[]); setBusy(false); };
  useEffect(()=>{ load(); },[]);

  if(detail) return <CardDetail card={detail} db={db} onBack={()=>{ setDetail(null); load(); }} onDelete={()=>{ setDetail(null); load(); }} allCards={rows} allLoyalties={loyalties}/>;

  const save=async()=>{
    if(!f.name.trim()) return alert("Card name required");
    const p={name:f.name.trim(),bank:f.bank,last4:f.last4,network:f.network,color:f.color,points_currency:f.points_currency,points_balance:parseInt(f.points_balance)||0,annual_fee:parseFloat(f.annual_fee)||0,stmt_date:parseInt(f.stmt_date)||null};
    const {error}=await db.from("cc_cards").insert(p);
    if(error) return alert("Error: "+JSON.stringify(error));
    setShow(false); load();
  };

  const total=rows.reduce((a,c)=>a+(c.points_balance||0),0);

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
        <div><div style={{fontSize:22,fontWeight:700,color:"#fff"}}>Credit Cards</div><div style={{fontSize:12,color:mut,marginTop:3}}>{rows.length} cards · {total.toLocaleString()} pts</div></div>
        <button style={pbtn} onClick={()=>{ setF({...empty}); setShow(true); }}>+ Add Card</button>
      </div>
      {msg&&<div style={{color:"#f87171",fontSize:12,padding:"10px 14px",background:"rgba(239,68,68,0.08)",borderRadius:8,marginBottom:16}}>{msg}</div>}
      {busy?<div style={{color:mut,padding:40,textAlign:"center"}}>Loading…</div>:rows.length===0?(
        <div style={{textAlign:"center",padding:60,color:"#2e3560"}}><div style={{fontSize:32,marginBottom:10}}>◈</div><div>No cards yet — click Add Card</div></div>
      ):(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:16}}>
          {rows.map(c=>(
            <div key={c.id} onClick={()=>setDetail(c)} style={{background:surf,border:`1px solid ${bdr}`,borderRadius:14,padding:"18px 20px",borderTop:`3px solid ${c.color||acc}`,cursor:"pointer",position:"relative"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                <div><div style={{fontSize:15,fontWeight:700,color:"#fff"}}>{c.name}</div><div style={{fontSize:12,color:mut}}>{c.bank}{c.last4?` ···· ${c.last4}`:""}</div></div>
                <span style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:20,background:(nc[c.network]||acc)+"22",color:nc[c.network]||acc}}>{c.network}</span>
              </div>
              <div style={{fontSize:24,fontWeight:800,color:"#fff",letterSpacing:"-0.03em"}}>{(c.points_balance||0).toLocaleString()}</div>
              <div style={{fontSize:11,color:mut,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>{c.points_currency||"pts"}</div>
              <div style={{display:"flex",gap:14,fontSize:12,color:mut,borderTop:`1px solid ${bdr}`,paddingTop:10}}>
                {c.stmt_date&&<span>Stmt: {c.stmt_date}th</span>}
                {c.annual_fee>0&&<span>Fee: ₹{Number(c.annual_fee).toLocaleString()}</span>}
              </div>
              <div style={{position:"absolute",bottom:12,right:14,fontSize:11,color:acc}}>View →</div>
            </div>
          ))}
        </div>
      )}
      <Modal show={show} onClose={()=>setShow(false)} title="Add Card">
        {lbl("Card Name *")}<input style={inp} placeholder="HDFC Infinia" value={f.name} onChange={up("name")}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Bank")}<input style={inp} placeholder="HDFC" value={f.bank} onChange={up("bank")}/></div>
          <div>{lbl("Last 4")}<input style={inp} placeholder="4242" maxLength={4} value={f.last4} onChange={up("last4")}/></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Network")}<select style={inp} value={f.network} onChange={up("network")}>{nets.map(n=><option key={n}>{n}</option>)}</select></div>
          <div>{lbl("Color")}<input style={{...inp,padding:"5px 8px",cursor:"pointer"}} type="color" value={f.color} onChange={up("color")}/></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Points Balance")}<input style={inp} type="number" placeholder="0" value={f.points_balance} onChange={up("points_balance")}/></div>
          <div>{lbl("Points Unit")}<input style={inp} placeholder="pts / miles" value={f.points_currency} onChange={up("points_currency")}/></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Statement Date")}<input style={inp} type="number" placeholder="15" value={f.stmt_date} onChange={up("stmt_date")}/></div>
          <div>{lbl("Annual Fee ₹")}<input style={inp} type="number" placeholder="0" value={f.annual_fee} onChange={up("annual_fee")}/></div>
        </div>
        <button style={{...pbtn,width:"100%",justifyContent:"center",marginTop:4}} onClick={save}>Add Card</button>
      </Modal>
    </div>
  );
}

// ── Loyalty List ──────────────────────────────────────────────────────────────
function Loyalty({ db }) {
  const [rows,setRows]=useState([]); const [cards,setCards]=useState([]);
  const [busy,setBusy]=useState(true);
  const [show,setShow]=useState(false);
  const [detail,setDetail]=useState(null);
  const empty={name:"",category:"Airline",points_balance:"",expiry_date:"",expiry_rule:"",tier:"",color:"#8b5cf6"};
  const [f,setF]=useState(empty);
  const up=k=>e=>setF(p=>({...p,[k]:e.target.value}));
  const cats=["Airline","Hotel","Retail","Dining","Fuel","Other"];
  const cc={Airline:"#3b82f6",Hotel:"#f59e0b",Retail:"#10b981",Dining:"#f97316",Fuel:"#ef4444",Other:"#8b5cf6"};

  const load=async()=>{ setBusy(true); const [{data:l},{data:c}]=await Promise.all([db.from("loyalty_programs").select(),db.from("cc_cards").select()]); setRows(l||[]); setCards(c||[]); setBusy(false); };
  useEffect(()=>{ load(); },[]);

  if(detail) return <LPDetail prog={detail} db={db} onBack={()=>{ setDetail(null); load(); }} onDelete={()=>{ setDetail(null); load(); }} allCards={cards} allLoyalties={rows}/>;

  const save=async()=>{
    if(!f.name.trim()) return alert("Program name required");
    const p={name:f.name.trim(),category:f.category,tier:f.tier,color:f.color,expiry_date:f.expiry_date||null,expiry_rule:f.expiry_rule,points_balance:parseInt(f.points_balance)||0};
    const {error}=await db.from("loyalty_programs").insert(p);
    if(error) return alert("Error: "+JSON.stringify(error));
    setShow(false); load();
  };

  const days=d=>d?Math.round((new Date(d)-new Date())/86400000):null;

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
        <div><div style={{fontSize:22,fontWeight:700,color:"#fff"}}>Loyalty Programs</div><div style={{fontSize:12,color:mut,marginTop:3}}>{rows.length} programs</div></div>
        <button style={pbtn} onClick={()=>{ setF({...empty}); setShow(true); }}>+ Add Program</button>
      </div>
      {busy?<div style={{color:mut,padding:40,textAlign:"center"}}>Loading…</div>:rows.length===0?(
        <div style={{textAlign:"center",padding:60,color:"#2e3560"}}><div style={{fontSize:32,marginBottom:10}}>◈</div><div>No programs yet</div></div>
      ):(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:16}}>
          {rows.map(p=>{ const d=days(p.expiry_date); const exp=d!==null&&d<60; return (
            <div key={p.id} onClick={()=>setDetail(p)} style={{background:surf,border:`1px solid ${bdr}`,borderRadius:14,padding:"18px 20px",borderTop:`3px solid ${p.color||"#8b5cf6"}`,cursor:"pointer",position:"relative"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                <div><div style={{fontSize:15,fontWeight:700,color:"#fff"}}>{p.name}</div>{p.tier&&<div style={{fontSize:12,color:"#a78bfa"}}>{p.tier}</div>}</div>
                <span style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:20,background:(cc[p.category]||"#8b5cf6")+"22",color:cc[p.category]||"#8b5cf6"}}>{p.category}</span>
              </div>
              <div style={{fontSize:24,fontWeight:800,color:"#fff",letterSpacing:"-0.03em"}}>{(p.points_balance||0).toLocaleString()}</div>
              <div style={{fontSize:11,color:mut,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>points</div>
              {p.expiry_date&&<div style={{fontSize:12,color:exp?"#f87171":mut,borderTop:`1px solid ${bdr}`,paddingTop:8}}>{exp?"⚠ ":""}Expires {new Date(p.expiry_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}{d!==null&&<span> · {d>0?`${d}d`:"Expired"}</span>}</div>}
              <div style={{position:"absolute",bottom:12,right:14,fontSize:11,color:"#8b5cf6"}}>View →</div>
            </div>
          );})}
        </div>
      )}
      <Modal show={show} onClose={()=>setShow(false)} title="Add Program">
        {lbl("Program Name *")}<input style={inp} placeholder="Air India Flying Returns" value={f.name} onChange={up("name")}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Category")}<select style={inp} value={f.category} onChange={up("category")}>{cats.map(c=><option key={c}>{c}</option>)}</select></div>
          <div>{lbl("Tier")}<input style={inp} placeholder="Gold" value={f.tier} onChange={up("tier")}/></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Points Balance")}<input style={inp} type="number" placeholder="0" value={f.points_balance} onChange={up("points_balance")}/></div>
          <div>{lbl("Expiry Date")}<input style={inp} type="date" value={f.expiry_date||""} onChange={up("expiry_date")}/></div>
        </div>
        {lbl("Expiry Rule")}<input style={inp} placeholder="Points expire 3 years from earn" value={f.expiry_rule} onChange={up("expiry_rule")}/>
        {lbl("Color")}<input style={{...inp,padding:"5px 8px",cursor:"pointer"}} type="color" value={f.color} onChange={up("color")}/>
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
  const [from,setFrom]=useState(""); const [to,setTo]=useState("");
  const [pts,setPts]=useState(""); const [bonusMiles,setBonusMiles]=useState("");
  const [txnDate,setTxnDate]=useState(new Date().toISOString().split("T")[0]);
  const [notes,setNotes]=useState("");
  const [done,setDone]=useState(null);

  const loadAll=useCallback(async()=>{
    setBusy(true);
    const [c,l,p]=await Promise.all([db.from("cc_cards").select(),db.from("loyalty_programs").select(),db.from("transfer_partners").select()]);
    setCards(c.data||[]); setLoyalties(l.data||[]); setAllPartners(p.data||[]);
    setBusy(false);
  },[db]);

  useEffect(()=>{ loadAll(); },[loadAll]);

  const allPrograms=[
    ...cards.map(c=>({name:c.name,type:"card",balance:c.points_balance||0,id:c.id})),
    ...loyalties.map(l=>({name:l.name,type:"loyalty",balance:l.points_balance||0,id:l.id})),
  ];

  // Programs that have at least one transfer route going out
  const validFromNames = [...new Set(allPartners.map(p=>p.from_program))];
  // Programs that have at least one transfer route coming in
  const validToNames = [...new Set(allPartners.map(p=>p.to_program))];

  // When from is selected → to options = partners where from_program === from
  const toOptions = from ? allPartners.filter(p=>p.from_program===from).map(p=>p.to_program) : validToNames;
  // When to is selected → from options = partners where to_program === to
  const fromOptions = to ? allPartners.filter(p=>p.to_program===to).map(p=>p.from_program) : validFromNames;

  const partner = from&&to ? allPartners.find(p=>p.from_program===from&&p.to_program===to) : null;
  const sentPts = parseInt(pts)||0;
  const bonusPts = parseInt(bonusMiles)||0;
  const ratioReceived = partner&&sentPts ? Math.floor(sentPts*(partner.ratio_to/partner.ratio_from)) : 0;
  const totalReceived = ratioReceived + bonusPts;

  const fromProg = allPrograms.find(p=>p.name===from);
  const toProg = allPrograms.find(p=>p.name===to);

  const doTransfer=async()=>{
    if(!from||!to||!pts) return alert("Fill From, To and Points");
    if(!partner) return alert("No transfer route found for this pair");
    if(sentPts<=0) return alert("Enter valid points");
    if(partner.min_transfer&&sentPts<partner.min_transfer) return alert(`Minimum transfer is ${partner.min_transfer.toLocaleString()} pts`);
    if(fromProg&&sentPts>(fromProg.balance)) return alert(`Insufficient points. Available: ${fromProg.balance.toLocaleString()}`);

    const fromObj=fromProg.type==="card"?cards.find(c=>c.name===from):loyalties.find(l=>l.name===from);
    const toObj=toProg.type==="card"?cards.find(c=>c.name===to):loyalties.find(l=>l.name===to);
    const tbl_from=fromProg.type==="card"?"cc_cards":"loyalty_programs";
    const tbl_to=toProg.type==="card"?"cc_cards":"loyalty_programs";
    const desc_from=`Transfer to ${to}${notes?` — ${notes}`:""}`;
    const desc_to=`Transfer from ${from}${bonusPts?` (+${bonusPts} bonus)`:""}${notes?` — ${notes}`:""}`;

    await db.from(tbl_from).update(fromObj.id,{points_balance:(fromObj.points_balance||0)-sentPts});
    await db.from(tbl_to).update(toObj.id,{points_balance:(toObj.points_balance||0)+totalReceived});
    await db.from("point_transactions").insert({program_name:from,program_type:fromProg.type,points:-sentPts,description:desc_from,txn_date:txnDate});
    await db.from("point_transactions").insert({program_name:to,program_type:toProg.type,points:totalReceived,description:desc_to,txn_date:txnDate});

    setDone({from,to,sent:sentPts,received:ratioReceived,bonus:bonusPts,total:totalReceived});
    setFrom(""); setTo(""); setPts(""); setBonusMiles(""); setNotes("");
    // Reload live balances
    await loadAll();
  };

  if(busy) return <div style={{color:mut,padding:40,textAlign:"center"}}>Loading…</div>;

  return (
    <div>
      <div style={{fontSize:22,fontWeight:700,color:"#fff",marginBottom:6}}>Transfer Points</div>
      <div style={{fontSize:12,color:mut,marginBottom:24}}>Transfer points between your cards and programs</div>

      {done&&(
        <div style={{background:"rgba(52,211,153,0.08)",border:"1px solid rgba(52,211,153,0.25)",borderRadius:12,padding:"14px 18px",marginBottom:20}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}>
            <div>
              <div style={{fontSize:13,color:"#34d399",fontWeight:700,marginBottom:4}}>✓ Transfer complete!</div>
              <div style={{fontSize:13,color:txt}}>{done.sent.toLocaleString()} pts from <strong>{done.from}</strong></div>
              <div style={{fontSize:13,color:txt,marginTop:2}}>→ {done.received.toLocaleString()} pts{done.bonus>0?<span style={{color:"#34d399"}}> + {done.bonus.toLocaleString()} bonus = <strong>{done.total.toLocaleString()}</strong></span>:""} to <strong>{done.to}</strong></div>
            </div>
            <button onClick={()=>setDone(null)} style={{background:"none",border:"none",cursor:"pointer",color:mut,fontSize:20}}>×</button>
          </div>
        </div>
      )}

      <div style={{background:surf,border:`1px solid ${bdr}`,borderRadius:14,padding:"22px",maxWidth:580}}>

        {/* FROM */}
        <div style={{marginBottom:18}}>
          <div style={{fontSize:11,color:acc,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>From</div>
          {lbl("Program")}
          <select style={inp} value={from} onChange={e=>{ setFrom(e.target.value); if(to){ const valid=allPartners.filter(p=>p.from_program===e.target.value).map(p=>p.to_program); if(!valid.includes(to)) setTo(""); } }}>
            <option value="">— select source —</option>
            {allPrograms.filter(p=>to ? fromOptions.includes(p.name) : validFromNames.includes(p.name)).map(p=>(
              <option key={p.name} value={p.name}>{p.name} ({p.balance.toLocaleString()} pts)</option>
            ))}
          </select>
          {fromProg&&<div style={{fontSize:12,color:mut,marginTop:-8,marginBottom:8}}>Available: <span style={{color:"#fff",fontWeight:600}}>{fromProg.balance.toLocaleString()} pts</span></div>}
        </div>

        {/* TO */}
        <div style={{marginBottom:18}}>
          <div style={{fontSize:11,color:"#34d399",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>To</div>
          {lbl("Program")}
          <select style={inp} value={to} onChange={e=>{ setTo(e.target.value); if(from){ const valid=allPartners.filter(p=>p.to_program===e.target.value).map(p=>p.from_program); if(!valid.includes(from)) setFrom(""); } }}>
            <option value="">— select destination —</option>
            {allPrograms.filter(p=>from ? toOptions.includes(p.name) : validToNames.includes(p.name)).map(p=>(
              <option key={p.name} value={p.name}>{p.name} ({p.balance.toLocaleString()} pts)</option>
            ))}
          </select>
          {toProg&&<div style={{fontSize:12,color:mut,marginTop:-8,marginBottom:8}}>Current: <span style={{color:"#fff",fontWeight:600}}>{toProg.balance.toLocaleString()} pts</span></div>}
        </div>

        {/* Partner info */}
        {partner&&(
          <div style={{background:"rgba(99,102,241,0.07)",border:"1px solid rgba(99,102,241,0.2)",borderRadius:10,padding:"12px 16px",marginBottom:18}}>
            <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
              <div><div style={{fontSize:10,color:mut,textTransform:"uppercase"}}>Ratio</div><div style={{fontSize:18,fontWeight:800,color:"#fff"}}>{partner.ratio_from}:{partner.ratio_to}</div></div>
              {partner.min_transfer&&<div><div style={{fontSize:10,color:mut,textTransform:"uppercase"}}>Min</div><div style={{fontSize:18,fontWeight:800,color:"#a5b4fc"}}>{partner.min_transfer.toLocaleString()}</div></div>}
              {partner.max_monthly&&<div><div style={{fontSize:10,color:mut,textTransform:"uppercase"}}>Max/mo</div><div style={{fontSize:18,fontWeight:800,color:"#a5b4fc"}}>{partner.max_monthly.toLocaleString()}</div></div>}
              {partner.transfer_time&&<div><div style={{fontSize:10,color:mut,textTransform:"uppercase"}}>Time</div><div style={{fontSize:18,fontWeight:800,color:"#34d399"}}>{partner.transfer_time}</div></div>}
            </div>
          </div>
        )}

        {/* Transfer details */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Points to Transfer")}<input style={inp} type="number" placeholder="Enter points" value={pts} onChange={e=>setPts(e.target.value)} disabled={!partner}/></div>
          <div>{lbl("Bonus Miles (optional)")}<input style={inp} type="number" placeholder="0" value={bonusMiles} onChange={e=>setBonusMiles(e.target.value)} disabled={!partner}/></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Transfer Date")}<input style={inp} type="date" value={txnDate} onChange={e=>setTxnDate(e.target.value)}/></div>
          <div>{lbl("Notes")}<input style={inp} placeholder="Promotion code, ref..." value={notes} onChange={e=>setNotes(e.target.value)}/></div>
        </div>

        {/* Live calculation */}
        {partner&&sentPts>0&&(
          <div style={{background:"rgba(52,211,153,0.07)",border:"1px solid rgba(52,211,153,0.2)",borderRadius:10,padding:"14px 16px",marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
              <div><div style={{fontSize:10,color:mut,textTransform:"uppercase",marginBottom:4}}>You Send</div><div style={{fontSize:22,fontWeight:800,color:"#f87171"}}>{sentPts.toLocaleString()} pts</div></div>
              <div style={{fontSize:22,color:mut}}>→</div>
              <div>
                <div style={{fontSize:10,color:mut,textTransform:"uppercase",marginBottom:4}}>They Receive</div>
                <div style={{fontSize:22,fontWeight:800,color:"#34d399"}}>{totalReceived.toLocaleString()} pts</div>
                {bonusPts>0&&<div style={{fontSize:11,color:mut,marginTop:2}}>{ratioReceived.toLocaleString()} ratio + {bonusPts.toLocaleString()} bonus</div>}
              </div>
            </div>
          </div>
        )}

        <button style={{...pbtn,width:"100%",justifyContent:"center",opacity:(!from||!to||!pts)?0.5:1}} onClick={doTransfer}>
          Transfer Points
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
  const grouped=rows.reduce((a,r)=>{ (a[r.from_program]=a[r.from_program]||[]).push(r); return a; },{});

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
        <div><div style={{fontSize:22,fontWeight:700,color:"#fff"}}>Transfer Partners</div><div style={{fontSize:12,color:mut,marginTop:3}}>{rows.length} routes configured</div></div>
        <button style={pbtn} onClick={()=>{ setEdit(null); setF({...empty}); setShow(true); }}>+ Add Route</button>
      </div>
      {busy?<div style={{color:mut,padding:40,textAlign:"center"}}>Loading…</div>:rows.length===0?(
        <div style={{textAlign:"center",padding:60,color:"#2e3560"}}><div style={{fontSize:32,marginBottom:10}}>◈</div><div>No transfer routes yet</div></div>
      ):Object.entries(grouped).map(([from,routes])=>(
        <div key={from} style={{background:surf,border:`1px solid ${bdr}`,borderRadius:14,padding:"18px 20px",marginBottom:16}}>
          <div style={{fontSize:11,fontWeight:700,color:"#a5b4fc",marginBottom:12,textTransform:"uppercase",letterSpacing:"0.06em"}}>{from}</div>
          {routes.map(r=>(
            <div key={r.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",background:bg,borderRadius:10,border:`1px solid ${bdr}`,marginBottom:8,flexWrap:"wrap",gap:8}}>
              <div><div style={{fontSize:14,fontWeight:600,color:"#fff"}}>{r.to_program}</div>{r.notes&&<div style={{fontSize:11,color:mut}}>{r.notes}</div>}</div>
              <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                <div style={{textAlign:"center"}}><div style={{fontSize:15,fontWeight:800,color:"#fff"}}>{r.ratio_from}:{r.ratio_to}</div><div style={{fontSize:10,color:mut}}>RATIO</div></div>
                {r.min_transfer&&<div style={{textAlign:"center"}}><div style={{fontSize:13,color:"#a5b4fc"}}>{Number(r.min_transfer).toLocaleString()}</div><div style={{fontSize:10,color:mut}}>MIN</div></div>}
                {r.transfer_time&&<div style={{textAlign:"center"}}><div style={{fontSize:13,color:"#34d399"}}>{r.transfer_time}</div><div style={{fontSize:10,color:mut}}>TIME</div></div>}
                <div style={{display:"flex",gap:4}}>
                  <button style={{...gbtn,padding:"5px 8px"}} onClick={()=>openEdit(r)}>✎</button>
                  <button style={{...dbtn,padding:"5px 8px"}} onClick={()=>del(r.id)}>✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
      <Modal show={show} onClose={()=>{ setShow(false); setEdit(null); }} title={edit?"Edit Route":"Add Transfer Route"}>
        <div style={{background:"rgba(99,102,241,0.06)",border:"1px solid rgba(99,102,241,0.15)",borderRadius:10,padding:14,marginBottom:14}}>
          <div style={{fontSize:11,color:acc,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>From</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div>{lbl("Type")}<select style={inp} value={f.from_type} onChange={e=>setF(p=>({...p,from_type:e.target.value,from_program:""}))}><option value="card">Credit Card</option><option value="loyalty">Loyalty Program</option></select></div>
            <div>{lbl("Program")}<select style={inp} value={f.from_program} onChange={up("from_program")}><option value="">— select —</option>{optionsFor(f.from_type).map(o=><option key={o} value={o}>{o}</option>)}</select></div>
          </div>
        </div>
        <div style={{background:"rgba(52,211,153,0.06)",border:"1px solid rgba(52,211,153,0.15)",borderRadius:10,padding:14,marginBottom:14}}>
          <div style={{fontSize:11,color:"#34d399",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>To</div>
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

// ── Vouchers ──────────────────────────────────────────────────────────────────
function Vouchers({ db }) {
  const [rows,setRows]=useState([]); const [busy,setBusy]=useState(true);
  const [show,setShow]=useState(false); const [edit,setEdit]=useState(null);
  const [filter,setFilter]=useState("active");
  const empty={program:"",description:"",value:"",expiry_date:"",redeemed:false,notes:""};
  const [f,setF]=useState(empty);
  const up=k=>e=>setF(p=>({...p,[k]:e.target.value}));
  const load=async()=>{ setBusy(true); const {data}=await db.from("vouchers").select(); setRows(data||[]); setBusy(false); };
  useEffect(()=>{ load(); },[]);
  const openEdit=r=>{ setEdit(r); setF({program:r.program||"",description:r.description||"",value:r.value||"",expiry_date:r.expiry_date||"",redeemed:r.redeemed||false,notes:r.notes||""}); setShow(true); };
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
        <div><div style={{fontSize:22,fontWeight:700,color:"#fff"}}>Vouchers</div><div style={{fontSize:12,color:mut,marginTop:3}}>{rows.filter(v=>!v.redeemed).length} active · {rows.filter(v=>v.redeemed).length} redeemed</div></div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {["active","redeemed","all"].map(t=><button key={t} onClick={()=>setFilter(t)} style={{padding:"7px 12px",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:500,background:filter===t?acc:"rgba(255,255,255,0.05)",color:filter===t?"#fff":"#a5b4fc",textTransform:"capitalize"}}>{t}</button>)}
          <button style={pbtn} onClick={()=>{ setEdit(null); setF({...empty}); setShow(true); }}>+ Add</button>
        </div>
      </div>
      {busy?<div style={{color:mut,padding:40,textAlign:"center"}}>Loading…</div>:shown.length===0?(
        <div style={{textAlign:"center",padding:60,color:"#2e3560"}}><div style={{fontSize:32,marginBottom:10}}>◈</div><div>No vouchers here</div></div>
      ):(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:16}}>
          {shown.map(v=>{ const d=days(v.expiry_date); const exp=d!==null&&d<30&&!v.redeemed; return (
            <div key={v.id} style={{background:surf,border:`1px solid ${bdr}`,borderRadius:14,padding:"18px 20px",opacity:v.redeemed?0.55:1}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                <span style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:20,background:v.redeemed?"#4a528022":"#34d39922",color:v.redeemed?mut:"#34d399"}}>{v.redeemed?"Redeemed":"Active"}</span>
                {exp&&<span style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:20,background:"#f9731622",color:"#f97316"}}>Expiring soon</span>}
              </div>
              <div style={{fontSize:15,fontWeight:700,color:"#fff",marginBottom:2}}>{v.program}</div>
              {v.description&&<div style={{fontSize:13,color:"#8890b0",marginBottom:6}}>{v.description}</div>}
              {v.value&&<div style={{fontSize:20,fontWeight:800,color:"#34d399",marginBottom:6}}>{v.value}</div>}
              {v.expiry_date&&<div style={{fontSize:12,color:exp?"#f87171":mut,marginBottom:10}}>Expires {new Date(v.expiry_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}{d!==null&&<span> · {d>0?`${d}d`:"Expired"}</span>}</div>}
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>toggle(v)} style={{padding:"6px 12px",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:500,background:v.redeemed?"rgba(255,255,255,0.05)":acc,color:v.redeemed?"#a5b4fc":"#fff"}}>{v.redeemed?"Mark Active":"Mark Redeemed"}</button>
                <button style={{...gbtn,padding:"5px 8px"}} onClick={()=>openEdit(v)}>✎</button>
                <button style={{...dbtn,padding:"5px 8px"}} onClick={()=>del(v.id)}>✕</button>
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
        {lbl("Notes")}<input style={inp} placeholder="Conditions, notes..." value={f.notes} onChange={up("notes")}/>
        <button style={{...pbtn,width:"100%",justifyContent:"center",marginTop:4}} onClick={save}>{edit?"Save Changes":"Add Voucher"}</button>
      </Modal>
    </div>
  );
}

// ── Settings ──────────────────────────────────────────────────────────────────
function Settings({ onDisconnect }) {
  return (
    <div>
      <div style={{fontSize:22,fontWeight:700,color:"#fff",marginBottom:24}}>Settings</div>
      <div style={{maxWidth:500}}>
        <div style={{background:surf,border:`1px solid ${bdr}`,borderRadius:14,padding:"20px 22px",marginBottom:16}}>
          <div style={{fontSize:11,fontWeight:700,color:"#a5b4fc",marginBottom:12,textTransform:"uppercase",letterSpacing:"0.06em"}}>Database</div>
          <div style={{fontSize:12,color:mut,marginBottom:4}}>Connected to</div>
          <div style={{fontSize:12,color:txt,fontFamily:"monospace",background:bg,padding:"8px 12px",borderRadius:8,marginBottom:16,wordBreak:"break-all"}}>{localStorage.getItem("pv_u")}</div>
          <button style={dbtn} onClick={()=>{ localStorage.removeItem("pv_u"); localStorage.removeItem("pv_k"); onDisconnect(); }}>Disconnect</button>
        </div>
        <div style={{background:surf,border:`1px solid ${bdr}`,borderRadius:14,padding:"20px 22px"}}>
          <div style={{fontSize:11,fontWeight:700,color:"#a5b4fc",marginBottom:10,textTransform:"uppercase",letterSpacing:"0.06em"}}>Setup SQL</div>
          <div style={{fontSize:11,color:mut,marginBottom:8}}>Run in Supabase → SQL Editor:</div>
          <pre style={{fontSize:10,color:"#5a6490",background:bg,padding:14,borderRadius:8,overflowX:"auto",lineHeight:1.7,margin:0,whiteSpace:"pre-wrap"}}>{SETUP_SQL}</pre>
        </div>
      </div>
    </div>
  );
}

// ── Shell ─────────────────────────────────────────────────────────────────────
const TABS=[
  {id:"cards",     label:"Credit Cards",      icon:"💳"},
  {id:"loyalty",   label:"Loyalty Programs",  icon:"⭐"},
  {id:"transfers", label:"Transfer Partners", icon:"⚙️"},
  {id:"transfer",  label:"Transfer Points",   icon:"↔️"},
  {id:"vouchers",  label:"Vouchers",          icon:"🎟️"},
  {id:"settings",  label:"Settings",          icon:"🔧"},
];

export default function App() {
  const [db,setDb]=useState(null);
  const [tab,setTab]=useState("cards");
  const [menuOpen,setMenuOpen]=useState(false);

  useEffect(()=>{
    const u=localStorage.getItem("pv_u"),k=localStorage.getItem("pv_k");
    if(u&&k) setDb(createSupabaseClient(u,k));
  },[]);

  if(!db) return <Setup onDone={setDb}/>;
  const cur=TABS.find(t=>t.id===tab);

  return (
    <div style={{minHeight:"100vh",background:bg,color:txt,fontFamily:"Inter,system-ui,sans-serif",fontSize:14}}>
      <style>{`
        @media(max-width:640px){.desk-nav{display:none!important}.mob-hdr{display:flex!important}.main-wrap{margin-left:0!important;padding:16px!important;padding-top:68px!important}}
        @media(min-width:641px){.mob-hdr{display:none!important}}
        tr:hover td{background:rgba(255,255,255,0.02)}
      `}</style>
      <nav className="desk-nav" style={{position:"fixed",top:0,left:0,bottom:0,width:210,background:"#0d1120",borderRight:`1px solid ${bdr}`,display:"flex",flexDirection:"column",zIndex:10}}>
        <div style={{padding:"22px 18px 18px",borderBottom:`1px solid ${bdr}`}}><div style={{fontSize:15,fontWeight:700,color:"#fff"}}>PointsVault</div><div style={{fontSize:10,color:mut,textTransform:"uppercase",letterSpacing:"0.08em",marginTop:2}}>Loyalty & Cards</div></div>
        <div style={{flex:1,paddingTop:8,overflowY:"auto"}}>
          {TABS.map(t=>(
            <div key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 18px",cursor:"pointer",fontSize:13,fontWeight:tab===t.id?600:400,color:tab===t.id?"#a5b4fc":"#3a4260",background:tab===t.id?"rgba(99,102,241,0.08)":"transparent",borderLeft:tab===t.id?`2px solid ${acc}`:"2px solid transparent"}}>
              <span style={{fontSize:15}}>{t.icon}</span>{t.label}
            </div>
          ))}
        </div>
        <div style={{padding:"0 18px 20px",fontSize:10,color:"#2e3560",textTransform:"uppercase",letterSpacing:"0.06em"}}>Synced · Supabase</div>
      </nav>
      <div className="mob-hdr" style={{display:"none",position:"fixed",top:0,left:0,right:0,height:56,background:"#0d1120",borderBottom:`1px solid ${bdr}`,alignItems:"center",justifyContent:"space-between",padding:"0 16px",zIndex:100}}>
        <div style={{fontSize:14,fontWeight:700,color:"#fff"}}>PointsVault</div>
        <div style={{fontSize:13,color:"#a5b4fc",fontWeight:600}}>{cur?.icon} {cur?.label}</div>
        <button onClick={()=>setMenuOpen(o=>!o)} style={{background:"none",border:"none",cursor:"pointer",color:txt,fontSize:22,padding:"0 4px"}}>☰</button>
      </div>
      {menuOpen&&<div style={{position:"fixed",top:56,left:0,right:0,background:"#0d1120",borderBottom:`1px solid ${bdr}`,zIndex:99}}>
        {TABS.map(t=><div key={t.id} onClick={()=>{ setTab(t.id); setMenuOpen(false); }} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 20px",cursor:"pointer",fontSize:14,fontWeight:tab===t.id?600:400,color:tab===t.id?"#a5b4fc":"#8890b0",background:tab===t.id?"rgba(99,102,241,0.08)":"transparent",borderBottom:`1px solid ${bdr}`}}><span>{t.icon}</span>{t.label}</div>)}
      </div>}
      <main className="main-wrap" style={{marginLeft:210,padding:"32px 32px 60px",minHeight:"100vh"}}>
        {tab==="cards"     && <Cards db={db}/>}
        {tab==="loyalty"   && <Loyalty db={db}/>}
        {tab==="transfers" && <Transfers db={db}/>}
        {tab==="transfer"  && <TransferPoints db={db}/>}
        {tab==="vouchers"  && <Vouchers db={db}/>}
        {tab==="settings"  && <Settings onDisconnect={()=>setDb(null)}/>}
      </main>
    </div>
  );
}
