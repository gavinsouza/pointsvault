import { useState, useEffect } from "react";

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
      select: () => req(`/${t}?select=*`),
      insert: row => req(`/${t}`, { method: "POST", body: JSON.stringify(row) }),
      update: (id, row) => req(`/${t}?id=eq.${id}`, { method: "PATCH", body: JSON.stringify(row) }),
      delete: id => req(`/${t}?id=eq.${id}`, { method: "DELETE" }),
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
);`;

const bg = "#0a0e1a", surf = "#111827", bdr = "#1e2540", txt = "#e8eaf0", mut = "#4a5280", acc = "#6366f1";
const inp = { width:"100%", padding:"9px 12px", background:bg, border:"1px solid #2a3050", borderRadius:8, color:txt, fontSize:13, outline:"none", boxSizing:"border-box", colorScheme:"dark", marginBottom:12 };
const pbtn = { display:"inline-flex", alignItems:"center", gap:6, padding:"9px 16px", borderRadius:8, border:"none", cursor:"pointer", fontSize:13, fontWeight:500, background:acc, color:"#fff" };
const gbtn = { ...pbtn, background:"rgba(255,255,255,0.05)", color:"#a5b4fc" };
const dbtn = { ...pbtn, background:"rgba(239,68,68,0.12)", color:"#f87171" };

function Modal({ show, onClose, title, children }) {
  if (!show) return null;
  return (
    <div onClick={e => e.target===e.currentTarget && onClose()} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.9)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:9999, padding:20 }}>
      <div style={{ background:surf, border:`1px solid ${bdr}`, borderRadius:16, padding:24, width:"100%", maxWidth:460, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 40px 80px rgba(0,0,0,0.9)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <span style={{ fontSize:16, fontWeight:700, color:"#fff" }}>{title}</span>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:mut, fontSize:22, lineHeight:1, padding:"0 4px" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function lbl(text) {
  return <div style={{ fontSize:11, color:mut, fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:5 }}>{text}</div>;
}

// ── Setup ──────────────────────────────────────────────────────────────────────
function Setup({ onDone }) {
  const [url, setUrl] = useState(""); const [key, setKey] = useState(""); const [msg, setMsg] = useState("");
  const go = async () => {
    if (!url||!key) return setMsg("Both fields required");
    const u = url.trim().replace(/\/+$/,"").replace(/\/rest\/v1\/?$/,"");
    const k = key.trim();
    try {
      const r = await fetch(`${u}/rest/v1/cc_cards?select=id&limit=1`, { headers:{ apikey:k, Authorization:`Bearer ${k}` }});
      if (r.status===401||r.status===403) return setMsg("Invalid key");
    } catch(_) {}
    localStorage.setItem("pv_u", u); localStorage.setItem("pv_k", k);
    onDone(createSupabaseClient(u, k));
  };
  return (
    <div style={{ minHeight:"100vh", background:bg, display:"flex", alignItems:"center", justifyContent:"center", padding:20, fontFamily:"Inter,system-ui,sans-serif", color:txt }}>
      <div style={{ maxWidth:420, width:"100%" }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ fontSize:26, fontWeight:800, color:"#fff" }}>PointsVault</div>
          <div style={{ fontSize:13, color:mut, marginTop:5 }}>Connect your Supabase database</div>
        </div>
        <div style={{ background:surf, border:`1px solid ${bdr}`, borderRadius:14, padding:24 }}>
          {lbl("Supabase Project URL")}
          <input style={inp} placeholder="https://xxxx.supabase.co" value={url} onChange={e=>setUrl(e.target.value)} />
          {lbl("Anon Public Key")}
          <input style={inp} type="password" placeholder="eyJ..." value={key} onChange={e=>setKey(e.target.value)} />
          {msg && <div style={{ color:"#f87171", fontSize:12, marginBottom:10 }}>{msg}</div>}
          <button style={{ ...pbtn, width:"100%", justifyContent:"center" }} onClick={go}>Connect</button>
        </div>
      </div>
    </div>
  );
}

// ── Cards ──────────────────────────────────────────────────────────────────────
function Cards({ db }) {
  const [rows, setRows] = useState([]); const [busy, setBusy] = useState(true);
  const [show, setShow] = useState(false); const [edit, setEdit] = useState(null);
  const [msg, setMsg] = useState("");
  const empty = { name:"", bank:"", last4:"", network:"Visa", points_balance:"", points_currency:"pts", stmt_date:"", annual_fee:"", color:"#6366f1" };
  const [f, setF] = useState(empty);
  const up = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  const nets = ["Visa","Mastercard","Amex","Diners","RuPay","Other"];
  const nc = { Visa:"#1a1f71", Mastercard:"#eb001b", Amex:"#006fcf", Diners:"#2c2c8c", RuPay:"#ff6600", Other:acc };

  const load = async () => { setBusy(true); setMsg(""); const {data,error} = await db.from("cc_cards").select(); if(error) setMsg(JSON.stringify(error)); setRows(data); setBusy(false); };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEdit(null); setF({...empty}); setShow(true); };
  const openEdit = r => { setEdit(r); setF({ name:r.name||"", bank:r.bank||"", last4:r.last4||"", network:r.network||"Visa", points_balance:String(r.points_balance||""), points_currency:r.points_currency||"pts", stmt_date:String(r.stmt_date||""), annual_fee:String(r.annual_fee||""), color:r.color||"#6366f1" }); setShow(true); };

  const save = async () => {
    if (!f.name.trim()) return alert("Card name is required");
    const p = { name:f.name.trim(), bank:f.bank, last4:f.last4, network:f.network, color:f.color, points_currency:f.points_currency, points_balance:parseInt(f.points_balance)||0, annual_fee:parseFloat(f.annual_fee)||0, stmt_date:parseInt(f.stmt_date)||null };
    const {error} = edit ? await db.from("cc_cards").update(edit.id, p) : await db.from("cc_cards").insert(p);
    if (error) return alert("Error: "+JSON.stringify(error));
    setShow(false); load();
  };

  const del = async id => { if(confirm("Delete?")) { await db.from("cc_cards").delete(id); load(); } };
  const total = rows.reduce((a,c)=>a+(c.points_balance||0),0);

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div>
          <div style={{ fontSize:22, fontWeight:700, color:"#fff" }}>Credit Cards</div>
          <div style={{ fontSize:12, color:mut, marginTop:3 }}>{rows.length} cards · {total.toLocaleString()} pts</div>
        </div>
        <button style={pbtn} onClick={openAdd}>+ Add Card</button>
      </div>
      {msg && <div style={{ color:"#f87171", fontSize:12, padding:"10px 14px", background:"rgba(239,68,68,0.08)", borderRadius:8, marginBottom:16 }}>{msg}</div>}
      {busy ? <div style={{ color:mut, padding:40, textAlign:"center" }}>Loading…</div> : rows.length===0 ? (
        <div style={{ textAlign:"center", padding:60, color:"#2e3560" }}><div style={{ fontSize:32, marginBottom:10 }}>◈</div><div>No cards yet — click Add Card</div></div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:16 }}>
          {rows.map(c => (
            <div key={c.id} style={{ background:surf, border:`1px solid ${bdr}`, borderRadius:14, padding:"18px 20px", borderTop:`3px solid ${c.color||acc}`, position:"relative" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                <div>
                  <div style={{ fontSize:15, fontWeight:700, color:"#fff" }}>{c.name}</div>
                  <div style={{ fontSize:12, color:mut }}>{c.bank}{c.last4?` ···· ${c.last4}`:""}</div>
                </div>
                <span style={{ fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:20, background:(nc[c.network]||acc)+"22", color:nc[c.network]||acc }}>{c.network}</span>
              </div>
              <div style={{ fontSize:24, fontWeight:800, color:"#fff", letterSpacing:"-0.03em" }}>{(c.points_balance||0).toLocaleString()}</div>
              <div style={{ fontSize:11, color:mut, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10 }}>{c.points_currency||"pts"}</div>
              <div style={{ display:"flex", gap:14, fontSize:12, color:mut, borderTop:`1px solid ${bdr}`, paddingTop:10 }}>
                {c.stmt_date&&<span>Stmt: {c.stmt_date}th</span>}
                {c.annual_fee>0&&<span>Fee: ₹{Number(c.annual_fee).toLocaleString()}</span>}
              </div>
              <div style={{ position:"absolute", top:12, right:12, display:"flex", gap:4 }}>
                <button style={{ ...gbtn, padding:"5px 8px" }} onClick={()=>openEdit(c)}>✎</button>
                <button style={{ ...dbtn, padding:"5px 8px" }} onClick={()=>del(c.id)}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal show={show} onClose={()=>setShow(false)} title={edit?"Edit Card":"Add Card"}>
        {lbl("Card Name *")}<input style={inp} placeholder="HDFC Infinia" value={f.name} onChange={up("name")} />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div>{lbl("Bank")}<input style={inp} placeholder="HDFC" value={f.bank} onChange={up("bank")} /></div>
          <div>{lbl("Last 4")}<input style={inp} placeholder="4242" maxLength={4} value={f.last4} onChange={up("last4")} /></div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div>{lbl("Network")}<select style={inp} value={f.network} onChange={up("network")}>{nets.map(n=><option key={n}>{n}</option>)}</select></div>
          <div>{lbl("Color")}<input style={{ ...inp, padding:"5px 8px", cursor:"pointer" }} type="color" value={f.color} onChange={up("color")} /></div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div>{lbl("Points Balance")}<input style={inp} type="number" placeholder="0" value={f.points_balance} onChange={up("points_balance")} /></div>
          <div>{lbl("Points Unit")}<input style={inp} placeholder="pts / miles" value={f.points_currency} onChange={up("points_currency")} /></div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div>{lbl("Statement Date")}<input style={inp} type="number" placeholder="15" value={f.stmt_date} onChange={up("stmt_date")} /></div>
          <div>{lbl("Annual Fee ₹")}<input style={inp} type="number" placeholder="0" value={f.annual_fee} onChange={up("annual_fee")} /></div>
        </div>
        <button style={{ ...pbtn, width:"100%", justifyContent:"center", marginTop:4 }} onClick={save}>{edit?"Save Changes":"Add Card"}</button>
      </Modal>
    </div>
  );
}

// ── Loyalty ────────────────────────────────────────────────────────────────────
function Loyalty({ db }) {
  const [rows, setRows] = useState([]); const [busy, setBusy] = useState(true);
  const [show, setShow] = useState(false); const [edit, setEdit] = useState(null);
  const empty = { name:"", category:"Airline", points_balance:"", expiry_date:"", expiry_rule:"", tier:"", color:"#8b5cf6" };
  const [f, setF] = useState(empty);
  const up = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  const cats = ["Airline","Hotel","Retail","Dining","Fuel","Other"];
  const cc = { Airline:"#3b82f6", Hotel:"#f59e0b", Retail:"#10b981", Dining:"#f97316", Fuel:"#ef4444", Other:"#8b5cf6" };

  const load = async () => { setBusy(true); const {data} = await db.from("loyalty_programs").select(); setRows(data); setBusy(false); };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEdit(null); setF({...empty}); setShow(true); };
  const openEdit = r => { setEdit(r); setF({ name:r.name||"", category:r.category||"Airline", points_balance:String(r.points_balance||""), expiry_date:r.expiry_date||"", expiry_rule:r.expiry_rule||"", tier:r.tier||"", color:r.color||"#8b5cf6" }); setShow(true); };

  const save = async () => {
    if (!f.name.trim()) return alert("Program name required");
    const p = { name:f.name.trim(), category:f.category, tier:f.tier, color:f.color, expiry_date:f.expiry_date||null, expiry_rule:f.expiry_rule, points_balance:parseInt(f.points_balance)||0 };
    const {error} = edit ? await db.from("loyalty_programs").update(edit.id,p) : await db.from("loyalty_programs").insert(p);
    if (error) return alert("Error: "+JSON.stringify(error));
    setShow(false); load();
  };

  const del = async id => { if(confirm("Delete?")) { await db.from("loyalty_programs").delete(id); load(); } };
  const days = d => d ? Math.round((new Date(d)-new Date())/86400000) : null;

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div>
          <div style={{ fontSize:22, fontWeight:700, color:"#fff" }}>Loyalty Programs</div>
          <div style={{ fontSize:12, color:mut, marginTop:3 }}>{rows.length} programs</div>
        </div>
        <button style={pbtn} onClick={openAdd}>+ Add Program</button>
      </div>
      {busy ? <div style={{ color:mut, padding:40, textAlign:"center" }}>Loading…</div> : rows.length===0 ? (
        <div style={{ textAlign:"center", padding:60, color:"#2e3560" }}><div style={{ fontSize:32, marginBottom:10 }}>◈</div><div>No programs yet</div></div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:16 }}>
          {rows.map(p => {
            const d = days(p.expiry_date); const exp = d!==null&&d<60;
            return (
              <div key={p.id} style={{ background:surf, border:`1px solid ${bdr}`, borderRadius:14, padding:"18px 20px", borderTop:`3px solid ${p.color||"#8b5cf6"}`, position:"relative" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                  <div>
                    <div style={{ fontSize:15, fontWeight:700, color:"#fff" }}>{p.name}</div>
                    {p.tier&&<div style={{ fontSize:12, color:"#a78bfa" }}>{p.tier}</div>}
                  </div>
                  <span style={{ fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:20, background:(cc[p.category]||"#8b5cf6")+"22", color:cc[p.category]||"#8b5cf6" }}>{p.category}</span>
                </div>
                <div style={{ fontSize:24, fontWeight:800, color:"#fff", letterSpacing:"-0.03em" }}>{(p.points_balance||0).toLocaleString()}</div>
                <div style={{ fontSize:11, color:mut, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:8 }}>points</div>
                {p.expiry_date&&<div style={{ fontSize:12, color:exp?"#f87171":mut, borderTop:`1px solid ${bdr}`, paddingTop:8 }}>
                  {exp?"⚠ ":""}Expires {new Date(p.expiry_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                  {d!==null&&<span> · {d>0?`${d}d`:"Expired"}</span>}
                </div>}
                <div style={{ position:"absolute", top:12, right:12, display:"flex", gap:4 }}>
                  <button style={{ ...gbtn, padding:"5px 8px" }} onClick={()=>openEdit(p)}>✎</button>
                  <button style={{ ...dbtn, padding:"5px 8px" }} onClick={()=>del(p.id)}>✕</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <Modal show={show} onClose={()=>setShow(false)} title={edit?"Edit Program":"Add Program"}>
        {lbl("Program Name *")}<input style={inp} placeholder="Air India Flying Returns" value={f.name} onChange={up("name")} />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div>{lbl("Category")}<select style={inp} value={f.category} onChange={up("category")}>{cats.map(c=><option key={c}>{c}</option>)}</select></div>
          <div>{lbl("Tier")}<input style={inp} placeholder="Gold" value={f.tier} onChange={up("tier")} /></div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div>{lbl("Points Balance")}<input style={inp} type="number" placeholder="0" value={f.points_balance} onChange={up("points_balance")} /></div>
          <div>{lbl("Expiry Date")}<input style={inp} type="date" value={f.expiry_date||""} onChange={up("expiry_date")} /></div>
        </div>
        {lbl("Expiry Rule")}<input style={inp} placeholder="Points expire 3 years from earn" value={f.expiry_rule} onChange={up("expiry_rule")} />
        {lbl("Color")}<input style={{ ...inp, padding:"5px 8px", cursor:"pointer" }} type="color" value={f.color} onChange={up("color")} />
        <button style={{ ...pbtn, width:"100%", justifyContent:"center", marginTop:4 }} onClick={save}>{edit?"Save Changes":"Add Program"}</button>
      </Modal>
    </div>
  );
}

// ── Transfers ──────────────────────────────────────────────────────────────────
function Transfers({ db }) {
  const [rows, setRows] = useState([]); const [busy, setBusy] = useState(true);
  const [show, setShow] = useState(false); const [edit, setEdit] = useState(null);
  const [cards, setCards] = useState([]);
  const [loyalties, setLoyalties] = useState([]);
  const empty = { from_type:"card", from_program:"", to_type:"loyalty", to_program:"", ratio_from:"1", ratio_to:"1", min_transfer:"1000", max_monthly:"", transfer_time:"", notes:"" };
  const [f, setF] = useState(empty);
  const up = k => e => setF(p => ({ ...p, [k]: e.target.value }));

  const load = async () => {
    setBusy(true);
    const [t, c, l] = await Promise.all([
      db.from("transfer_partners").select(),
      db.from("cc_cards").select(),
      db.from("loyalty_programs").select(),
    ]);
    setRows(t.data); setCards(c.data); setLoyalties(l.data);
    setBusy(false);
  };
  useEffect(() => { load(); }, []);

  // Options for each type
  const optionsFor = type => {
    if (type === "card") return cards.map(c => c.name);
    if (type === "loyalty") return loyalties.map(l => l.name);
    return [];
  };

  const openAdd = () => { setEdit(null); setF({...empty}); setShow(true); };
  const openEdit = r => {
    // Try to detect type from existing data
    const fromIsCard = cards.some(c => c.name === r.from_program);
    const toIsCard = cards.some(c => c.name === r.to_program);
    setEdit(r);
    setF({ from_type:fromIsCard?"card":"loyalty", from_program:r.from_program||"", to_type:toIsCard?"card":"loyalty", to_program:r.to_program||"", ratio_from:String(r.ratio_from||1), ratio_to:String(r.ratio_to||1), min_transfer:String(r.min_transfer||""), max_monthly:String(r.max_monthly||""), transfer_time:r.transfer_time||"", notes:r.notes||"" });
    setShow(true);
  };

  const save = async () => {
    if (!f.from_program||!f.to_program) return alert("Please select both programs");
    const p = { from_program:f.from_program, to_program:f.to_program, ratio_from:parseFloat(f.ratio_from)||1, ratio_to:parseFloat(f.ratio_to)||1, min_transfer:parseInt(f.min_transfer)||null, max_monthly:parseInt(f.max_monthly)||null, transfer_time:f.transfer_time, notes:f.notes };
    const {error} = edit ? await db.from("transfer_partners").update(edit.id,p) : await db.from("transfer_partners").insert(p);
    if (error) return alert("Error: "+JSON.stringify(error));
    setShow(false); load();
  };

  const del = async id => { if(confirm("Delete?")) { await db.from("transfer_partners").delete(id); load(); } };
  const grouped = rows.reduce((a,r)=>{ (a[r.from_program]=a[r.from_program]||[]).push(r); return a; }, {});

  const fromOpts = optionsFor(f.from_type);
  const toOpts = optionsFor(f.to_type);

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div>
          <div style={{ fontSize:22, fontWeight:700, color:"#fff" }}>Transfer Partners</div>
          <div style={{ fontSize:12, color:mut, marginTop:3 }}>{rows.length} routes</div>
        </div>
        <button style={pbtn} onClick={openAdd}>+ Add Route</button>
      </div>
      {busy ? <div style={{ color:mut, padding:40, textAlign:"center" }}>Loading…</div> : rows.length===0 ? (
        <div style={{ textAlign:"center", padding:60, color:"#2e3560" }}><div style={{ fontSize:32, marginBottom:10 }}>◈</div><div>No transfer routes yet</div></div>
      ) : Object.entries(grouped).map(([from,routes]) => (
        <div key={from} style={{ background:surf, border:`1px solid ${bdr}`, borderRadius:14, padding:"18px 20px", marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#a5b4fc", marginBottom:12, textTransform:"uppercase", letterSpacing:"0.06em" }}>{from}</div>
          {routes.map(r => (
            <div key={r.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", background:bg, borderRadius:10, border:`1px solid ${bdr}`, marginBottom:8, flexWrap:"wrap", gap:8 }}>
              <div>
                <div style={{ fontSize:14, fontWeight:600, color:"#fff" }}>{r.to_program}</div>
                {r.notes&&<div style={{ fontSize:11, color:mut }}>{r.notes}</div>}
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                <div style={{ textAlign:"center" }}><div style={{ fontSize:15, fontWeight:800, color:"#fff" }}>{r.ratio_from}:{r.ratio_to}</div><div style={{ fontSize:10, color:mut }}>RATIO</div></div>
                {r.min_transfer&&<div style={{ textAlign:"center" }}><div style={{ fontSize:13, fontWeight:600, color:"#a5b4fc" }}>{Number(r.min_transfer).toLocaleString()}</div><div style={{ fontSize:10, color:mut }}>MIN</div></div>}
                {r.transfer_time&&<div style={{ textAlign:"center" }}><div style={{ fontSize:13, fontWeight:600, color:"#34d399" }}>{r.transfer_time}</div><div style={{ fontSize:10, color:mut }}>TIME</div></div>}
                <div style={{ display:"flex", gap:4 }}>
                  <button style={{ ...gbtn, padding:"5px 8px" }} onClick={()=>openEdit(r)}>✎</button>
                  <button style={{ ...dbtn, padding:"5px 8px" }} onClick={()=>del(r.id)}>✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}

      <Modal show={show} onClose={()=>setShow(false)} title={edit?"Edit Route":"Add Transfer Route"}>
        {/* FROM */}
        <div style={{ background:"rgba(99,102,241,0.06)", border:"1px solid rgba(99,102,241,0.15)", borderRadius:10, padding:14, marginBottom:14 }}>
          <div style={{ fontSize:11, color:acc, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10 }}>From</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div>
              {lbl("Type")}
              <select style={inp} value={f.from_type} onChange={e => setF(p => ({ ...p, from_type:e.target.value, from_program:"" }))}>
                <option value="card">Credit Card</option>
                <option value="loyalty">Loyalty Program</option>
              </select>
            </div>
            <div>
              {lbl("Program")}
              <select style={inp} value={f.from_program} onChange={up("from_program")}>
                <option value="">— select —</option>
                {fromOpts.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* TO */}
        <div style={{ background:"rgba(52,211,153,0.06)", border:"1px solid rgba(52,211,153,0.15)", borderRadius:10, padding:14, marginBottom:14 }}>
          <div style={{ fontSize:11, color:"#34d399", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10 }}>To</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div>
              {lbl("Type")}
              <select style={inp} value={f.to_type} onChange={e => setF(p => ({ ...p, to_type:e.target.value, to_program:"" }))}>
                <option value="card">Credit Card</option>
                <option value="loyalty">Loyalty Program</option>
              </select>
            </div>
            <div>
              {lbl("Program")}
              <select style={inp} value={f.to_program} onChange={up("to_program")}>
                <option value="">— select —</option>
                {toOpts.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Details */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div>{lbl("Ratio From")}<input style={inp} type="number" step="0.1" value={f.ratio_from} onChange={up("ratio_from")} /></div>
          <div>{lbl("Ratio To")}<input style={inp} type="number" step="0.1" value={f.ratio_to} onChange={up("ratio_to")} /></div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div>{lbl("Min Transfer")}<input style={inp} type="number" placeholder="1000" value={f.min_transfer} onChange={up("min_transfer")} /></div>
          <div>{lbl("Max / Month")}<input style={inp} type="number" placeholder="none" value={f.max_monthly} onChange={up("max_monthly")} /></div>
        </div>
        {lbl("Transfer Time")}<input style={inp} placeholder="Instant / 3-5 days" value={f.transfer_time} onChange={up("transfer_time")} />
        {lbl("Notes")}<input style={inp} placeholder="Any conditions..." value={f.notes} onChange={up("notes")} />
        <button style={{ ...pbtn, width:"100%", justifyContent:"center", marginTop:4 }} onClick={save}>{edit?"Save Changes":"Add Route"}</button>
      </Modal>
    </div>
  );
}

// ── Vouchers ───────────────────────────────────────────────────────────────────
function Vouchers({ db }) {
  const [rows, setRows] = useState([]); const [busy, setBusy] = useState(true);
  const [show, setShow] = useState(false); const [edit, setEdit] = useState(null);
  const [filter, setFilter] = useState("active");
  const empty = { program:"", description:"", value:"", expiry_date:"", redeemed:false, notes:"" };
  const [f, setF] = useState(empty);
  const up = k => e => setF(p => ({ ...p, [k]: e.target.value }));

  const load = async () => { setBusy(true); const {data} = await db.from("vouchers").select(); setRows(data); setBusy(false); };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEdit(null); setF({...empty}); setShow(true); };
  const openEdit = r => { setEdit(r); setF({ program:r.program||"", description:r.description||"", value:r.value||"", expiry_date:r.expiry_date||"", redeemed:r.redeemed||false, notes:r.notes||"" }); setShow(true); };

  const save = async () => {
    if (!f.program.trim()) return alert("Program name required");
    const {error} = edit ? await db.from("vouchers").update(edit.id,{...f,expiry_date:f.expiry_date||null}) : await db.from("vouchers").insert({...f,expiry_date:f.expiry_date||null});
    if (error) return alert("Error: "+JSON.stringify(error));
    setShow(false); load();
  };

  const del = async id => { if(confirm("Delete?")) { await db.from("vouchers").delete(id); load(); } };
  const toggle = async v => { await db.from("vouchers").update(v.id,{redeemed:!v.redeemed}); load(); };
  const days = d => d ? Math.round((new Date(d)-new Date())/86400000) : null;
  const shown = rows.filter(v => filter==="all"?true:filter==="active"?!v.redeemed:v.redeemed);

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24, flexWrap:"wrap", gap:10 }}>
        <div>
          <div style={{ fontSize:22, fontWeight:700, color:"#fff" }}>Vouchers</div>
          <div style={{ fontSize:12, color:mut, marginTop:3 }}>{rows.filter(v=>!v.redeemed).length} active · {rows.filter(v=>v.redeemed).length} redeemed</div>
        </div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {["active","redeemed","all"].map(t=>(
            <button key={t} onClick={()=>setFilter(t)} style={{ padding:"7px 12px", borderRadius:8, border:"none", cursor:"pointer", fontSize:12, fontWeight:500, background:filter===t?acc:"rgba(255,255,255,0.05)", color:filter===t?"#fff":"#a5b4fc", textTransform:"capitalize" }}>{t}</button>
          ))}
          <button style={pbtn} onClick={openAdd}>+ Add</button>
        </div>
      </div>
      {busy ? <div style={{ color:mut, padding:40, textAlign:"center" }}>Loading…</div> : shown.length===0 ? (
        <div style={{ textAlign:"center", padding:60, color:"#2e3560" }}><div style={{ fontSize:32, marginBottom:10 }}>◈</div><div>No vouchers here</div></div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:16 }}>
          {shown.map(v => {
            const d = days(v.expiry_date); const exp = d!==null&&d<30&&!v.redeemed;
            return (
              <div key={v.id} style={{ background:surf, border:`1px solid ${bdr}`, borderRadius:14, padding:"18px 20px", opacity:v.redeemed?0.55:1 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                  <span style={{ fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:20, background:v.redeemed?"#4a528022":"#34d39922", color:v.redeemed?mut:"#34d399" }}>{v.redeemed?"Redeemed":"Active"}</span>
                  {exp&&<span style={{ fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:20, background:"#f9731622", color:"#f97316" }}>Expiring soon</span>}
                </div>
                <div style={{ fontSize:15, fontWeight:700, color:"#fff", marginBottom:2 }}>{v.program}</div>
                {v.description&&<div style={{ fontSize:13, color:"#8890b0", marginBottom:6 }}>{v.description}</div>}
                {v.value&&<div style={{ fontSize:20, fontWeight:800, color:"#34d399", marginBottom:6 }}>{v.value}</div>}
                {v.expiry_date&&<div style={{ fontSize:12, color:exp?"#f87171":mut, marginBottom:10 }}>
                  Expires {new Date(v.expiry_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                  {d!==null&&<span> · {d>0?`${d}d`:"Expired"}</span>}
                </div>}
                <div style={{ display:"flex", gap:6 }}>
                  <button onClick={()=>toggle(v)} style={{ padding:"6px 12px", borderRadius:8, border:"none", cursor:"pointer", fontSize:12, fontWeight:500, background:v.redeemed?"rgba(255,255,255,0.05)":acc, color:v.redeemed?"#a5b4fc":"#fff" }}>{v.redeemed?"Mark Active":"Mark Redeemed"}</button>
                  <button style={{ ...gbtn, padding:"5px 8px" }} onClick={()=>openEdit(v)}>✎</button>
                  <button style={{ ...dbtn, padding:"5px 8px" }} onClick={()=>del(v.id)}>✕</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <Modal show={show} onClose={()=>setShow(false)} title={edit?"Edit Voucher":"Add Voucher"}>
        {lbl("Program / Issuer *")}<input style={inp} placeholder="Marriott Bonvoy" value={f.program} onChange={up("program")} />
        {lbl("Description")}<input style={inp} placeholder="Free night award" value={f.description} onChange={up("description")} />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div>{lbl("Value")}<input style={inp} placeholder="₹5,000 / 1 Night" value={f.value} onChange={up("value")} /></div>
          <div>{lbl("Expiry Date")}<input style={inp} type="date" value={f.expiry_date||""} onChange={up("expiry_date")} /></div>
        </div>
        {lbl("Notes")}<input style={inp} placeholder="Conditions, notes..." value={f.notes} onChange={up("notes")} />
        <button style={{ ...pbtn, width:"100%", justifyContent:"center", marginTop:4 }} onClick={save}>{edit?"Save Changes":"Add Voucher"}</button>
      </Modal>
    </div>
  );
}

// ── Settings ───────────────────────────────────────────────────────────────────
function Settings({ onDisconnect }) {
  return (
    <div>
      <div style={{ fontSize:22, fontWeight:700, color:"#fff", marginBottom:24 }}>Settings</div>
      <div style={{ maxWidth:500 }}>
        <div style={{ background:surf, border:`1px solid ${bdr}`, borderRadius:14, padding:"20px 22px", marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#a5b4fc", marginBottom:12, textTransform:"uppercase", letterSpacing:"0.06em" }}>Database</div>
          <div style={{ fontSize:12, color:mut, marginBottom:4 }}>Connected to</div>
          <div style={{ fontSize:12, color:txt, fontFamily:"monospace", background:bg, padding:"8px 12px", borderRadius:8, marginBottom:16, wordBreak:"break-all" }}>{localStorage.getItem("pv_u")}</div>
          <button style={dbtn} onClick={()=>{ localStorage.removeItem("pv_u"); localStorage.removeItem("pv_k"); onDisconnect(); }}>Disconnect</button>
        </div>
        <div style={{ background:surf, border:`1px solid ${bdr}`, borderRadius:14, padding:"20px 22px" }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#a5b4fc", marginBottom:10, textTransform:"uppercase", letterSpacing:"0.06em" }}>Setup SQL</div>
          <div style={{ fontSize:11, color:mut, marginBottom:8 }}>Run in Supabase → SQL Editor to create tables:</div>
          <pre style={{ fontSize:10, color:"#5a6490", background:bg, padding:14, borderRadius:8, overflowX:"auto", lineHeight:1.7, margin:0, whiteSpace:"pre-wrap" }}>{SETUP_SQL}</pre>
        </div>
      </div>
    </div>
  );
}

// ── Shell ──────────────────────────────────────────────────────────────────────
const TABS = [
  { id:"cards",     label:"Credit Cards",      icon:"💳" },
  { id:"loyalty",   label:"Loyalty Programs",  icon:"⭐" },
  { id:"transfers", label:"Transfers",          icon:"↔️" },
  { id:"vouchers",  label:"Vouchers",           icon:"🎟️" },
  { id:"settings",  label:"Settings",           icon:"⚙️" },
];

export default function App() {
  const [db, setDb] = useState(null);
  const [tab, setTab] = useState("cards");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const u = localStorage.getItem("pv_u"), k = localStorage.getItem("pv_k");
    if (u&&k) setDb(createSupabaseClient(u,k));
  }, []);

  if (!db) return <Setup onDone={setDb} />;

  const currentTab = TABS.find(t => t.id === tab);

  return (
    <div style={{ minHeight:"100vh", background:bg, color:txt, fontFamily:"Inter,system-ui,sans-serif", fontSize:14 }}>

      {/* ── Desktop sidebar ── */}
      <style>{`@media (max-width: 640px) { .desktop-nav { display: none !important; } .mobile-header { display: flex !important; } .main-content { margin-left: 0 !important; padding: 16px !important; padding-top: 64px !important; } } @media (min-width: 641px) { .mobile-header { display: none !important; } }`}</style>

      <nav className="desktop-nav" style={{ position:"fixed", top:0, left:0, bottom:0, width:200, background:"#0d1120", borderRight:`1px solid ${bdr}`, display:"flex", flexDirection:"column", zIndex:10 }}>
        <div style={{ padding:"22px 18px 18px", borderBottom:`1px solid ${bdr}` }}>
          <div style={{ fontSize:15, fontWeight:700, color:"#fff" }}>PointsVault</div>
          <div style={{ fontSize:10, color:mut, textTransform:"uppercase", letterSpacing:"0.08em", marginTop:2 }}>Loyalty & Cards</div>
        </div>
        <div style={{ flex:1, paddingTop:8 }}>
          {TABS.map(t => (
            <div key={t.id} onClick={()=>setTab(t.id)} style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 18px", cursor:"pointer", fontSize:13, fontWeight:tab===t.id?600:400, color:tab===t.id?"#a5b4fc":"#3a4260", background:tab===t.id?"rgba(99,102,241,0.08)":"transparent", borderLeft:tab===t.id?`2px solid ${acc}`:"2px solid transparent" }}>
              <span>{t.icon}</span>{t.label}
            </div>
          ))}
        </div>
        <div style={{ padding:"0 18px 20px", fontSize:10, color:"#2e3560", textTransform:"uppercase", letterSpacing:"0.06em" }}>Synced · Supabase</div>
      </nav>

      {/* ── Mobile header ── */}
      <div className="mobile-header" style={{ display:"none", position:"fixed", top:0, left:0, right:0, height:56, background:"#0d1120", borderBottom:`1px solid ${bdr}`, alignItems:"center", justifyContent:"space-between", padding:"0 16px", zIndex:100 }}>
        <div style={{ fontSize:14, fontWeight:700, color:"#fff" }}>PointsVault</div>
        <div style={{ fontSize:13, color:"#a5b4fc", fontWeight:600 }}>{currentTab?.icon} {currentTab?.label}</div>
        <button onClick={()=>setMenuOpen(o=>!o)} style={{ background:"none", border:"none", cursor:"pointer", color:txt, fontSize:22, padding:"0 4px" }}>☰</button>
      </div>

      {/* ── Mobile dropdown menu ── */}
      {menuOpen && (
        <div style={{ position:"fixed", top:56, left:0, right:0, background:"#0d1120", borderBottom:`1px solid ${bdr}`, zIndex:99 }}>
          {TABS.map(t => (
            <div key={t.id} onClick={()=>{ setTab(t.id); setMenuOpen(false); }} style={{ display:"flex", alignItems:"center", gap:12, padding:"13px 20px", cursor:"pointer", fontSize:14, fontWeight:tab===t.id?600:400, color:tab===t.id?"#a5b4fc":"#8890b0", background:tab===t.id?"rgba(99,102,241,0.08)":"transparent", borderBottom:`1px solid ${bdr}` }}>
              <span>{t.icon}</span>{t.label}
            </div>
          ))}
        </div>
      )}

      {/* ── Main content ── */}
      <main className="main-content" style={{ marginLeft:200, padding:"32px 32px 60px", minHeight:"100vh" }}>
        {tab==="cards"     && <Cards db={db} />}
        {tab==="loyalty"   && <Loyalty db={db} />}
        {tab==="transfers" && <Transfers db={db} />}
        {tab==="vouchers"  && <Vouchers db={db} />}
        {tab==="settings"  && <Settings onDisconnect={()=>setDb(null)} />}
      </main>
    </div>
  );
}
