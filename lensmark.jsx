import { useState, useEffect, useRef } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   LENSMARK — Visual Refinement Pass
   Architecture: identical to v1  |  Aesthetics: luxury elevation
   ───────────────────────────────────────────────────────────────────────────── */

// ── DESIGN TOKENS ─────────────────────────────────────────────────────────────
const T = {
  // Backgrounds — layered depth
  void:        "#0C0D0F",   // deepest bg
  charcoal:    "#111214",   // primary bg
  graphite:    "#1A1B1F",   // surface
  graphiteMid: "#1F2025",   // raised surface
  graphiteHigh:"#252629",   // elevated surface
  rim:         "#2E3035",   // borders, dividers

  // Text
  ivory:       "#F5F1EA",   // primary text
  stone:       "#C4BEB5",   // secondary text
  flint:       "#8C857C",   // tertiary / captions
  ember:       "#554F49",   // disabled / faint

  // Accent — champagne gold family, used with restraint
  champagne:   "#B89A5D",   // primary accent
  brass:       "#8D734A",   // accent dim
  gilt:        "#D4B97A",   // accent highlight (hover)
  goldFaint:   "#B89A5D18", // gold wash bg

  // Semantic
  emerald:     "#2E7D5E",
  emeraldFaint:"#2E7D5E18",
  crimson:     "#8B2E2E",
};

// ── GLOBAL STYLES ─────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html { -webkit-text-size-adjust: 100%; }

  body {
    font-family: 'Inter', system-ui, sans-serif;
    background: ${T.charcoal};
    color: ${T.ivory};
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
  }

  input, textarea, select, button {
    font-family: 'Inter', system-ui, sans-serif;
    outline: none;
    -webkit-appearance: none;
  }

  button { cursor: pointer; }

  ::-webkit-scrollbar { width: 3px; height: 3px; }
  ::-webkit-scrollbar-track { background: ${T.charcoal}; }
  ::-webkit-scrollbar-thumb { background: ${T.rim}; border-radius: 2px; }

  ::selection { background: ${T.brass}; color: ${T.ivory}; }

  .serif  { font-family: 'Playfair Display', Georgia, serif; }
  .mono   { font-family: 'JetBrains Mono', monospace; }
  .sans   { font-family: 'Inter', system-ui, sans-serif; }

  /* ── Keyframes ── */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes toastRise {
    from { opacity: 0; transform: translateX(-50%) translateY(12px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
  @keyframes shimmerGold {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.5; }
  }

  .anim-fadeUp  { animation: fadeUp  0.45s cubic-bezier(0.16,1,0.3,1) both; }
  .anim-fadeIn  { animation: fadeIn  0.35s ease both; }
  .anim-slideUp { animation: slideUp 0.4s  cubic-bezier(0.16,1,0.3,1) both; }

  /* Gold shimmer — wordmark only */
  .gold-shimmer {
    background: linear-gradient(
      90deg,
      ${T.champagne} 0%,
      ${T.gilt}      40%,
      ${T.champagne} 60%,
      ${T.brass}     100%
    );
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmerGold 4s linear infinite;
  }

  /* Premium surface mixin */
  .surface {
    background: ${T.graphite};
    border: 1px solid ${T.rim};
  }
  .surface-raised {
    background: ${T.graphiteMid};
    border: 1px solid ${T.rim};
  }
  .surface-high {
    background: ${T.graphiteHigh};
    border: 1px solid rgba(255,255,255,0.06);
  }

  /* Focus ring */
  input:focus-visible, button:focus-visible {
    outline: 1px solid ${T.champagne}60;
    outline-offset: 2px;
  }

  /* Thin scrollbar for filter rows */
  .scroll-row::-webkit-scrollbar { display: none; }
  .scroll-row { scrollbar-width: none; }

  /* Mobile bottom nav blur */
  .nav-bar {
    position: fixed;
    bottom: 0; left: 0; right: 0;
    z-index: 100;
    background: rgba(17,18,20,0.92);
    backdrop-filter: blur(20px) saturate(1.4);
    -webkit-backdrop-filter: blur(20px) saturate(1.4);
    border-top: 1px solid ${T.rim};
    padding: 6px 0 max(6px, env(safe-area-inset-bottom));
  }

  /* Top bar blur */
  .top-bar {
    position: sticky;
    top: 0;
    z-index: 50;
    background: rgba(17,18,20,0.88);
    backdrop-filter: blur(24px) saturate(1.4);
    -webkit-backdrop-filter: blur(24px) saturate(1.4);
    border-bottom: 1px solid ${T.rim};
  }
`;

/* ─────────────────────────────────────────────────────────────────────────────
   PHOTO FIELD — Premium simulated photograph
   Higher contrast tonal compositions, film-like grain
   ───────────────────────────────────────────────────────────────────────────── */
const palettes = [
  { base:"#1C1A16", mid:"#2E2820", hi:"#4A3E2E", accent:"#6B5A3E" },
  { base:"#141720", mid:"#1E2235", hi:"#2A3050", accent:"#3A4570" },
  { base:"#181816", mid:"#28261E", hi:"#3C3828", accent:"#524E3A" },
  { base:"#1A1618", mid:"#2A2028", hi:"#3E2E3A", accent:"#584050" },
  { base:"#141A14", mid:"#1E2A1C", hi:"#2C3C28", accent:"#3E5236" },
  { base:"#1E1814", mid:"#30261E", hi:"#463A28", accent:"#5E4E36" },
];

const PhotoField = ({ seed = 0, aspect = "4/3", children, dim = false, overlay = false }) => {
  const p = palettes[seed % palettes.length];
  return (
    <div style={{ position:"relative", aspectRatio: aspect, background: p.base, overflow:"hidden", width:"100%" }}>
      {/* Primary tonal wash */}
      <div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse 70% 60% at 38% 45%, ${p.hi} 0%, ${p.mid} 45%, transparent 100%)`, opacity:0.9 }} />
      {/* Secondary accent */}
      <div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse 50% 55% at 72% 62%, ${p.accent} 0%, transparent 70%)`, opacity:0.45 }} />
      {/* Vignette */}
      <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 90% 90% at 50% 50%, transparent 50%, rgba(0,0,0,0.55) 100%)" }} />
      {/* Film grain */}
      <div style={{ position:"absolute", inset:0, opacity:0.08, mixBlendMode:"overlay",
        backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23g)' opacity='1'/%3E%3C/svg%3E")`,
        backgroundSize:"300px" }} />
      {/* Subtle top bar */}
      <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:`linear-gradient(90deg, transparent, ${p.accent}40, transparent)` }} />
      {dim   && <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.3)" }} />}
      {overlay && <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)" }} />}
      {children && <div style={{ position:"absolute", inset:0 }}>{children}</div>}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   LUMINANCE RING — Premium SVG trust ring
   ───────────────────────────────────────────────────────────────────────────── */
const LuminanceRing = ({ score, size = 48, children }) => {
  const r  = size / 2 - 3;
  const c  = size / 2;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = score >= 85 ? T.gilt : score >= 68 ? T.champagne : score >= 50 ? T.flint : T.ember;
  return (
    <div style={{ position:"relative", width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ position:"absolute", inset:0, transform:"rotate(-90deg)" }}>
        <circle cx={c} cy={c} r={r} fill="none" stroke={`${color}20`} strokeWidth={2} />
        <circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth={2}
          strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
          style={{ filter:`drop-shadow(0 0 3px ${color}60)` }} />
      </svg>
      <div style={{ position:"absolute", inset:3, borderRadius:"50%", overflow:"hidden", background:T.graphite }}>
        {children}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   CREATOR AVATAR
   ───────────────────────────────────────────────────────────────────────────── */
const CreatorAvatar = ({ name="?", username="", size=48, luminance=60 }) => {
  const initials = name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  const hue = username.split("").reduce((a,c)=>a+c.charCodeAt(0),0) % 360;
  return (
    <LuminanceRing score={luminance} size={size}>
      <div style={{
        width:"100%", height:"100%", borderRadius:"50%",
        background:`linear-gradient(135deg, hsl(${hue},28%,16%) 0%, hsl(${hue},20%,22%) 100%)`,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize: size * 0.3, fontWeight:500, letterSpacing:"-0.02em",
        color:`hsl(${hue},45%,68%)`, fontFamily:"'Inter',sans-serif",
      }}>{initials}</div>
    </LuminanceRing>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   MOCK DATA
   ───────────────────────────────────────────────────────────────────────────── */
const FRAMES = [
  { id:1, title:"Morning Fog Over the Valley", creator:"Elara Voss",     username:"elaravoss",   date:"12 Jun", time:"06:14", year:"2025", vault:"Golden Hour",    luminance:87, seed:0, aspect:"4/3",  tags:["landscape","fog"],        views:1240, appreciations:89  },
  { id:2, title:"Steel & Glass at Dusk",        creator:"Remi Nakashima", username:"remi_n",       date:"11 Jun", time:"19:47", year:"2025", vault:"Urban Geometry", luminance:72, seed:1, aspect:"2/3",  tags:["architecture","urban"],   views:856,  appreciations:63  },
  { id:3, title:"The Solitary Pine",            creator:"Cass Deloria",   username:"cassdeloria", date:"10 Jun", time:"14:22", year:"2025", vault:"Into the Wild",  luminance:64, seed:2, aspect:"1/1",  tags:["nature","minimal"],       views:430,  appreciations:41  },
  { id:4, title:"Neon Rain",                   creator:"Yuki Strand",    username:"yukistrand",  date:"09 Jun", time:"22:08", year:"2025", vault:"After Dark",     luminance:91, seed:3, aspect:"4/3",  tags:["night","rain"],           views:2180, appreciations:178 },
  { id:5, title:"Salt Flats Horizon",          creator:"Omar Jerez",     username:"omarjerez",   date:"08 Jun", time:"11:03", year:"2025", vault:"Vast Spaces",    luminance:55, seed:4, aspect:"4/3",  tags:["desert","minimal"],       views:612,  appreciations:52  },
  { id:6, title:"Portrait in Blue Light",      creator:"Elara Voss",     username:"elaravoss",   date:"07 Jun", time:"16:35", year:"2025", vault:"Faces",          luminance:87, seed:5, aspect:"2/3",  tags:["portrait","studio"],      views:1890, appreciations:143 },
  { id:7, title:"Cobblestone Alley, Lisbon",   creator:"Remi Nakashima", username:"remi_n",       date:"06 Jun", time:"09:15", year:"2025", vault:"Old World",      luminance:72, seed:2, aspect:"1/1",  tags:["travel","street"],        views:774,  appreciations:69  },
  { id:8, title:"The Weight of Water",         creator:"Cass Deloria",   username:"cassdeloria", date:"05 Jun", time:"07:50", year:"2025", vault:"Into the Wild",  luminance:64, seed:0, aspect:"4/3",  tags:["water","abstract"],       views:310,  appreciations:28  },
];

const VAULTS = [
  { id:1, title:"Golden Hour",    creator:"Elara Voss",     username:"elaravoss",   count:24, seed:0, description:"When the world turns amber and time slows." },
  { id:2, title:"Urban Geometry", creator:"Remi Nakashima", username:"remi_n",       count:18, seed:1, description:"Cities understood as abstract sculpture."    },
  { id:3, title:"After Dark",     creator:"Yuki Strand",    username:"yukistrand",  count:41, seed:3, description:"Neon, rain, solitude, and borrowed light."    },
  { id:4, title:"Vast Spaces",    creator:"Omar Jerez",     username:"omarjerez",   count:9,  seed:4, description:"The silence of empty horizons."              },
];

const CREATORS = [
  { id:1, name:"Elara Voss",     username:"elaravoss",   luminance:87, frames:124, vaults:8,  debut:false, rising:false, bio:"Light is the only truth. Landscape & portrait photographer, Swiss Alps." },
  { id:2, name:"Remi Nakashima", username:"remi_n",       luminance:72, frames:67,  vaults:5,  debut:false, rising:true,  bio:"Urban geometry and the poetry of forgotten spaces. Tokyo → everywhere." },
  { id:3, name:"Cass Deloria",   username:"cassdeloria", luminance:64, frames:31,  vaults:3,  debut:true,  rising:false, bio:"New here. Still learning the language of the forest."                  },
  { id:4, name:"Yuki Strand",    username:"yukistrand",  luminance:91, frames:289, vaults:12, debut:false, rising:false, bio:"Night is where colour breathes. Long-exposure & street photography."   },
  { id:5, name:"Omar Jerez",     username:"omarjerez",   luminance:55, frames:18,  vaults:2,  debut:true,  rising:true,  bio:"Chasing silence in wide-open places. Desert minimalism."               },
];

/* ─────────────────────────────────────────────────────────────────────────────
   UTILITIES
   ───────────────────────────────────────────────────────────────────────────── */
const lumColor = s => s>=85 ? T.gilt : s>=68 ? T.champagne : s>=50 ? T.flint : T.ember;
const lumLabel = s => s>=90?"Radiant":s>=75?"Illuminated":s>=60?"Emerging":s>=40?"Kindling":"Spark";

/* ─────────────────────────────────────────────────────────────────────────────
   PRIMITIVE COMPONENTS
   ───────────────────────────────────────────────────────────────────────────── */

// ── Toast ──
const Toast = ({ message, type="info", onDone }) => {
  useEffect(() => { const t = setTimeout(onDone, 3400); return ()=>clearTimeout(t); }, []);
  const accent = type==="success"?T.emerald:type==="error"?T.crimson:T.champagne;
  return (
    <div style={{
      position:"fixed", bottom:76, left:"50%",
      zIndex:9000,
      background:T.graphiteHigh,
      border:`1px solid ${accent}30`,
      borderRadius:10, padding:"11px 18px",
      display:"flex", alignItems:"center", gap:10,
      boxShadow:`0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px ${accent}15, inset 0 1px 0 rgba(255,255,255,0.04)`,
      animation:"toastRise 0.35s cubic-bezier(0.16,1,0.3,1) both",
      whiteSpace:"nowrap", maxWidth:"calc(100vw - 32px)",
    }}>
      <div style={{ width:6, height:6, borderRadius:"50%", background:accent, boxShadow:`0 0 6px ${accent}` }} />
      <span style={{ fontSize:12.5, color:T.ivory, fontWeight:400, letterSpacing:"0.01em" }}>{message}</span>
    </div>
  );
};

// ── Button ──
const Btn = ({ children, onClick, variant="primary", size="md", disabled=false, full=false, style={} }) => {
  const [hov, setHov] = useState(false);
  const [prs, setPrs] = useState(false);

  const base = {
    display:"inline-flex", alignItems:"center", justifyContent:"center", gap:7,
    border:"none", cursor:disabled?"not-allowed":"pointer",
    fontFamily:"'Inter',sans-serif", fontWeight:500,
    transition:"all 0.18s cubic-bezier(0.16,1,0.3,1)",
    userSelect:"none", letterSpacing:"0.025em",
    borderRadius: size==="sm"?7:size==="lg"?11:9,
    fontSize: size==="sm"?11.5:size==="lg"?14:12.5,
    padding: size==="sm"?"7px 15px":size==="lg"?"14px 30px":"10px 20px",
    opacity: disabled?0.42:1,
    transform: prs?"scale(0.96)":hov?"scale(1.015)":"scale(1)",
    width: full?"100%":"auto",
  };

  const variants = {
    primary: {
      background: hov
        ? `linear-gradient(135deg, ${T.gilt} 0%, ${T.champagne} 100%)`
        : `linear-gradient(135deg, ${T.champagne} 0%, ${T.brass} 100%)`,
      color: "#0C0D0F",
      boxShadow: hov
        ? `0 4px 20px ${T.champagne}35, inset 0 1px 0 rgba(255,255,255,0.2)`
        : `0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.12)`,
    },
    ghost: {
      background: hov ? "rgba(255,255,255,0.05)" : "transparent",
      color: hov ? T.ivory : T.stone,
      boxShadow: `inset 0 0 0 1px ${hov?T.flint:T.rim}`,
    },
    subtle: {
      background: hov ? T.graphiteHigh : T.graphiteMid,
      color: hov ? T.stone : T.flint,
      boxShadow: hov ? `0 2px 8px rgba(0,0,0,0.3)` : "none",
    },
    danger: {
      background: hov ? "#A33535" : T.crimson,
      color: T.ivory,
      boxShadow: `0 2px 8px rgba(0,0,0,0.4)`,
    },
  };

  return (
    <button
      onClick={disabled?undefined:onClick}
      onMouseEnter={()=>setHov(true)}
      onMouseLeave={()=>{setHov(false);setPrs(false);}}
      onMouseDown={()=>setPrs(true)}
      onMouseUp={()=>setPrs(false)}
      onTouchStart={()=>setPrs(true)}
      onTouchEnd={()=>setPrs(false)}
      style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  );
};

// ── Text Input ──
const Input = ({ label, type="text", value, onChange, placeholder, mono=false, hint, autoFocus=false }) => {
  const [foc, setFoc] = useState(false);
  return (
    <div style={{ marginBottom:20 }}>
      {label && (
        <label style={{
          display:"block",
          fontFamily:"'JetBrains Mono',monospace",
          fontSize:9.5, letterSpacing:"0.14em", textTransform:"uppercase",
          color: foc?T.champagne:T.flint, marginBottom:7,
          transition:"color 0.2s",
        }}>{label}</label>
      )}
      <input
        type={type} value={value}
        onChange={e=>onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onFocus={()=>setFoc(true)}
        onBlur={()=>setFoc(false)}
        style={{
          width:"100%", padding:"12px 14px",
          background: foc ? T.graphiteMid : T.graphite,
          border:`1px solid ${foc?T.champagne+"50":T.rim}`,
          borderRadius:8,
          fontSize: mono?13:14,
          fontFamily: mono?"'JetBrains Mono',monospace":"'Inter',sans-serif",
          fontWeight:300,
          color:T.ivory,
          transition:"all 0.2s",
          boxShadow: foc?`0 0 0 3px ${T.champagne}10, inset 0 1px 0 rgba(255,255,255,0.03)`
                        :`inset 0 1px 0 rgba(255,255,255,0.02)`,
        }}
      />
      {hint && <p style={{ marginTop:5, fontSize:11, color:T.ember, fontWeight:300 }}>{hint}</p>}
    </div>
  );
};

// ── OTP Input ──
const OTPInput = ({ value, onChange }) => {
  const refs = [useRef(),useRef(),useRef(),useRef(),useRef(),useRef()];
  const digits = (value+"      ").slice(0,6).split("");
  const set = (i,v) => {
    const d = v.replace(/\D/g,"");
    if(!d) return;
    const arr=[...digits]; arr[i]=d[0];
    onChange(arr.join("").trim());
    if(i<5) refs[i+1].current?.focus();
  };
  return (
    <div style={{ display:"flex", gap:9 }}>
      {[0,1,2,3,4,5].map(i=>(
        <div key={i} style={{ flex:1 }}>
          <input ref={refs[i]} maxLength={1} value={digits[i]?.trim()||""}
            onChange={e=>set(i,e.target.value)}
            onKeyDown={e=>e.key==="Backspace"&&!digits[i]?.trim()&&i>0&&refs[i-1].current?.focus()}
            style={{
              width:"100%", height:54, textAlign:"center",
              fontSize:22, fontFamily:"'Playfair Display',serif", fontWeight:500,
              color:T.gilt,
              background: digits[i]?.trim() ? T.graphiteMid : T.graphite,
              border:`1px solid ${digits[i]?.trim()?T.champagne+"60":T.rim}`,
              borderRadius:8, outline:"none",
              boxShadow: digits[i]?.trim() ? `0 0 0 2px ${T.champagne}12` : "none",
              transition:"all 0.18s",
            }} />
        </div>
      ))}
    </div>
  );
};

// ── Section Pill Filters ──
const PillRow = ({ options, active, onChange }) => (
  <div className="scroll-row" style={{ display:"flex", gap:7, overflowX:"auto", paddingBottom:2 }}>
    {options.map(o=>{
      const on = active===o.id;
      return (
        <button key={o.id} onClick={()=>onChange(o.id)} style={{
          flexShrink:0, padding:"6px 14px", borderRadius:20,
          background: on
            ? `linear-gradient(135deg, ${T.champagne} 0%, ${T.brass} 100%)`
            : T.graphite,
          color: on ? "#0C0D0F" : T.flint,
          border:`1px solid ${on?"transparent":T.rim}`,
          fontSize:11.5, fontWeight:on?500:400, cursor:"pointer",
          fontFamily:"'Inter',sans-serif", letterSpacing:"0.02em",
          boxShadow: on?`0 2px 12px ${T.champagne}25`:"none",
          transition:"all 0.18s",
        }}>{o.label}</button>
      );
    })}
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   FRAME CARD — Premium photo card
   ───────────────────────────────────────────────────────────────────────────── */
const FrameCard = ({ frame, onClick }) => {
  const [hov, setHov] = useState(false);
  const isPortrait = frame.aspect==="2/3";
  return (
    <div
      onClick={()=>onClick&&onClick(frame)}
      onMouseEnter={()=>setHov(true)}
      onMouseLeave={()=>setHov(false)}
      style={{
        borderRadius:11, overflow:"hidden", cursor:"pointer",
        gridRowEnd: isPortrait?"span 2":"span 1",
        background: T.graphite,
        border:`1px solid ${hov?T.champagne+"30":T.rim}`,
        transition:"transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s, border-color 0.2s",
        transform: hov?"translateY(-3px)":"translateY(0)",
        boxShadow: hov
          ? `0 16px 48px rgba(0,0,0,0.55), 0 4px 16px rgba(0,0,0,0.3), 0 0 0 1px ${T.champagne}18`
          : `0 2px 8px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)`,
      }}>
      {/* Photo */}
      <div style={{ position:"relative" }}>
        <PhotoField seed={frame.seed} aspect={frame.aspect} overlay>
          {/* Vault badge */}
          <div style={{
            position:"absolute", top:8, left:8,
            background:"rgba(12,13,15,0.72)",
            backdropFilter:"blur(8px)", borderRadius:5,
            padding:"3px 8px",
            opacity:hov?1:0, transition:"opacity 0.2s",
          }}>
            <span style={{ fontSize:9.5, color:T.stone, fontFamily:"'JetBrains Mono',monospace", letterSpacing:"0.04em" }}>{frame.vault}</span>
          </div>
          {/* Appreciations */}
          <div style={{
            position:"absolute", top:8, right:8,
            background:"rgba(12,13,15,0.72)",
            backdropFilter:"blur(8px)", borderRadius:5,
            padding:"3px 8px", display:"flex", alignItems:"center", gap:4,
            opacity:hov?1:0, transition:"opacity 0.2s",
          }}>
            <svg width={9} height={9} viewBox="0 0 24 24" fill={T.champagne}><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            <span style={{ fontSize:9.5, color:T.champagne, fontFamily:"'JetBrains Mono',monospace", fontWeight:500 }}>{frame.appreciations}</span>
          </div>
          {/* Title overlay on portrait cards */}
          {isPortrait && (
            <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"16px 12px 12px", background:"linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)" }}>
              <p className="serif" style={{ fontSize:12, fontStyle:"italic", color:T.ivory, lineHeight:1.3, marginBottom:5 }}>{frame.title}</p>
              <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                <CreatorAvatar name={frame.creator} username={frame.username} size={16} luminance={frame.luminance} />
                <span style={{ fontSize:9.5, color:T.stone, letterSpacing:"0.02em" }}>{frame.username}</span>
              </div>
            </div>
          )}
        </PhotoField>
        {/* Bottom accent line */}
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:1, background:`linear-gradient(90deg, ${T.champagne}60, transparent)`, opacity: hov?1:0, transition:"opacity 0.2s" }} />
      </div>

      {/* Meta — landscape cards only */}
      {!isPortrait && (
        <div style={{ padding:"10px 11px 11px" }}>
          <p className="serif" style={{ fontSize:12.5, fontStyle:"italic", color:T.ivory, lineHeight:1.3, marginBottom:7 }}>{frame.title}</p>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <CreatorAvatar name={frame.creator} username={frame.username} size={18} luminance={frame.luminance} />
              <span style={{ fontSize:10.5, color:T.stone, fontWeight:400 }}>{frame.username}</span>
            </div>
            <span className="mono" style={{ fontSize:9, color:T.ember, letterSpacing:"0.04em" }}>{frame.date} · {frame.time}</span>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   VAULT CARD
   ───────────────────────────────────────────────────────────────────────────── */
const VaultCard = ({ vault, onClick }) => {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={()=>onClick&&onClick(vault)}
      onMouseEnter={()=>setHov(true)}
      onMouseLeave={()=>setHov(false)}
      style={{
        borderRadius:11, overflow:"hidden", cursor:"pointer",
        background:T.graphite,
        border:`1px solid ${hov?T.champagne+"35":T.rim}`,
        transition:"all 0.25s cubic-bezier(0.16,1,0.3,1)",
        transform: hov?"translateY(-2px)":"translateY(0)",
        boxShadow: hov
          ? `0 12px 36px rgba(0,0,0,0.5), 0 0 0 1px ${T.champagne}15`
          : `0 2px 8px rgba(0,0,0,0.25)`,
      }}>
      {/* Cover photograph */}
      <PhotoField seed={vault.seed} aspect="3/2" dim>
        <div style={{ position:"absolute", top:9, right:9, background:"rgba(12,13,15,0.7)", backdropFilter:"blur(6px)", borderRadius:5, padding:"2px 8px" }}>
          <span className="mono" style={{ fontSize:9.5, color:T.champagne, letterSpacing:"0.05em", fontWeight:500 }}>{vault.count} frames</span>
        </div>
      </PhotoField>

      {/* Info */}
      <div style={{ padding:"13px 13px 14px" }}>
        <p className="serif" style={{ fontSize:15, fontWeight:500, color:T.ivory, marginBottom:4, letterSpacing:"-0.01em" }}>{vault.title}</p>
        <p style={{ fontSize:11, color:T.flint, marginBottom:10, lineHeight:1.45 }}>{vault.description}</p>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <CreatorAvatar name={vault.creator} username={vault.username} size={16} luminance={62} />
          <span style={{ fontSize:10, color:T.ember }}>by {vault.creator}</span>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   CREATOR CARD
   ───────────────────────────────────────────────────────────────────────────── */
const CreatorCard = ({ creator, onClick }) => {
  const [hov, setHov] = useState(false);
  const lc = lumColor(creator.luminance);
  return (
    <div
      onClick={()=>onClick&&onClick(creator)}
      onMouseEnter={()=>setHov(true)}
      onMouseLeave={()=>setHov(false)}
      style={{
        borderRadius:11, padding:"16px 15px",
        background: hov?T.graphiteMid:T.graphite,
        border:`1px solid ${hov?T.champagne+"28":T.rim}`,
        transition:"all 0.22s cubic-bezier(0.16,1,0.3,1)",
        cursor:"pointer",
        transform: hov?"translateY(-2px)":"translateY(0)",
        boxShadow: hov?`0 10px 32px rgba(0,0,0,0.45)`:`0 1px 4px rgba(0,0,0,0.2)`,
      }}>
      {/* Header row */}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
        <CreatorAvatar name={creator.name} username={creator.username} size={50} luminance={creator.luminance} />
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:2 }}>
            <span className="serif" style={{ fontSize:15, fontWeight:500, color:T.ivory, letterSpacing:"-0.01em" }}>{creator.name}</span>
            {creator.debut && (
              <span style={{ fontSize:8.5, background:T.emeraldFaint, color:T.emerald, border:`1px solid ${T.emerald}30`, borderRadius:4, padding:"1.5px 6px", fontWeight:600, letterSpacing:"0.07em", textTransform:"uppercase" }}>Debut</span>
            )}
            {creator.rising && (
              <span style={{ fontSize:8.5, background:T.goldFaint, color:T.champagne, border:`1px solid ${T.champagne}30`, borderRadius:4, padding:"1.5px 6px", fontWeight:600, letterSpacing:"0.07em", textTransform:"uppercase" }}>Rising</span>
            )}
          </div>
          <span className="mono" style={{ fontSize:10, color:T.ember }}>@{creator.username}</span>
        </div>
      </div>

      <p style={{ fontSize:11.5, color:T.flint, lineHeight:1.55, marginBottom:13 }}>{creator.bio}</p>

      {/* Stats row */}
      <div style={{
        display:"flex", gap:0,
        background:T.graphiteHigh, borderRadius:8,
        border:`1px solid ${T.rim}`,
        overflow:"hidden",
      }}>
        {[
          { label:"Frames",    value:creator.frames  },
          { label:"Vaults",    value:creator.vaults  },
          { label:"Luminance", value:creator.luminance, color:lc },
        ].map((s,i)=>(
          <div key={s.label} style={{
            flex:1, textAlign:"center", padding:"9px 6px",
            borderLeft: i>0?`1px solid ${T.rim}`:"none",
          }}>
            <p className="mono" style={{ fontSize:15, fontWeight:500, color:s.color||T.ivory, lineHeight:1, marginBottom:3 }}>{s.value}</p>
            <p style={{ fontSize:8.5, color:T.ember, letterSpacing:"0.07em", textTransform:"uppercase" }}>{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   FRAME DETAIL MODAL
   ───────────────────────────────────────────────────────────────────────────── */
const FrameModal = ({ frame, onClose }) => {
  if(!frame) return null;
  return (
    <div className="anim-fadeIn" style={{
      position:"fixed", inset:0, zIndex:500,
      background:"rgba(8,9,11,0.95)",
      backdropFilter:"blur(12px)",
      display:"flex", flexDirection:"column", overflowY:"auto",
    }}>
      {/* Header */}
      <div style={{ padding:"14px 18px 0", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
        <button onClick={onClose} style={{
          display:"flex", alignItems:"center", gap:6,
          background:T.graphite, border:`1px solid ${T.rim}`,
          borderRadius:7, padding:"6px 13px",
          fontSize:11.5, color:T.stone, fontWeight:400, cursor:"pointer",
        }}>← Back</button>
        <span className="mono" style={{ fontSize:9, color:T.ember, letterSpacing:"0.14em", textTransform:"uppercase" }}>Frame</span>
        <div style={{ width:68 }} />
      </div>

      {/* Photo — large */}
      <div style={{ padding:"16px 18px 0", flexShrink:0 }}>
        <div style={{ borderRadius:12, overflow:"hidden", boxShadow:"0 16px 64px rgba(0,0,0,0.7)" }}>
          <PhotoField seed={frame.seed} aspect={frame.aspect} overlay>
            <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"20px 16px" }}>
              <p className="serif" style={{ fontSize:20, fontStyle:"italic", color:T.ivory, lineHeight:1.2, marginBottom:8 }}>{frame.title}</p>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                {frame.tags.map(t=>(
                  <span key={t} style={{ fontSize:9.5, color:T.stone, background:"rgba(255,255,255,0.08)", borderRadius:4, padding:"2px 7px", fontFamily:"'JetBrains Mono',monospace", letterSpacing:"0.04em" }}>#{t}</span>
                ))}
              </div>
            </div>
          </PhotoField>
        </div>
      </div>

      {/* Details panel */}
      <div style={{ padding:"16px 18px 40px" }}>
        <div style={{
          background:T.graphite, border:`1px solid ${T.rim}`, borderRadius:12,
          boxShadow:"0 4px 24px rgba(0,0,0,0.3)",
          overflow:"hidden",
        }}>
          {/* Creator row */}
          <div style={{ padding:"14px 16px", display:"flex", alignItems:"center", gap:11, borderBottom:`1px solid ${T.rim}` }}>
            <CreatorAvatar name={frame.creator} username={frame.username} size={44} luminance={frame.luminance} />
            <div style={{ flex:1 }}>
              <p style={{ fontSize:14, fontWeight:500, color:T.ivory, marginBottom:2 }}>{frame.creator}</p>
              <span className="mono" style={{ fontSize:10, color:T.ember }}>@{frame.username}</span>
            </div>
            <div style={{ textAlign:"right" }}>
              <p style={{ fontSize:11, color:lumColor(frame.luminance), fontWeight:500, letterSpacing:"0.03em" }}>{lumLabel(frame.luminance)}</p>
              <span className="mono" style={{ fontSize:9.5, color:T.ember }}>{frame.luminance} luminance</span>
            </div>
          </div>

          {/* Stamp row */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", borderBottom:`1px solid ${T.rim}` }}>
            {[{l:"Date",v:frame.date},{l:"Time",v:frame.time},{l:"Year",v:frame.year}].map((m,i)=>(
              <div key={m.l} style={{
                padding:"12px 0", textAlign:"center",
                borderLeft: i>0?`1px solid ${T.rim}`:"none",
              }}>
                <p className="mono" style={{ fontSize:13, fontWeight:500, color:T.ivory, marginBottom:3 }}>{m.v}</p>
                <p style={{ fontSize:8.5, color:T.ember, letterSpacing:"0.1em", textTransform:"uppercase" }}>{m.l}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display:"flex", gap:1 }}>
            <button style={{
              flex:1, padding:"13px 0",
              background:"transparent", border:"none",
              display:"flex", alignItems:"center", justifyContent:"center", gap:7,
              cursor:"pointer",
              borderRight:`1px solid ${T.rim}`,
            }}>
              <svg width={13} height={13} viewBox="0 0 24 24" fill={T.champagne}><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              <span style={{ fontSize:12, color:T.champagne, fontWeight:500 }}>{frame.appreciations} Appreciate</span>
            </button>
            <button style={{
              flex:1, padding:"13px 0",
              background:"transparent", border:"none",
              display:"flex", alignItems:"center", justifyContent:"center", gap:7,
              cursor:"pointer",
            }}>
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={T.flint} strokeWidth={2}><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>
              <span style={{ fontSize:12, color:T.flint }}>Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   UPLOAD MODAL
   ───────────────────────────────────────────────────────────────────────────── */
const UploadModal = ({ onClose, onDone }) => {
  const [step,    setStep]    = useState(1);
  const [title,   setTitle]   = useState("");
  const [vault,   setVault]   = useState("");
  const [tags,    setTags]    = useState("");
  const [source,  setSource]  = useState(null);
  const [loading, setLoading] = useState(false);

  const now = new Date();
  const stamp = {
    date: now.toLocaleDateString("en-GB",{day:"numeric",month:"short"}),
    time: now.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"}),
    year: now.getFullYear().toString(),
  };

  const publish = () => {
    if(!title) return;
    setLoading(true);
    setTimeout(()=>{ setLoading(false); setStep(3); setTimeout(()=>{ onDone(); onClose(); },1800); },1200);
  };

  return (
    <div className="anim-fadeIn" style={{
      position:"fixed", inset:0, zIndex:500,
      background:"rgba(8,9,11,0.94)",
      backdropFilter:"blur(12px)",
      display:"flex", flexDirection:"column", overflowY:"auto",
    }}>
      {/* Header */}
      <div style={{
        padding:"14px 18px 0", display:"flex",
        alignItems:"center", justifyContent:"space-between", flexShrink:0,
      }}>
        <button onClick={step===3?undefined:onClose} style={{
          background:T.graphite, border:`1px solid ${T.rim}`,
          borderRadius:7, padding:"6px 13px",
          fontSize:11.5, color:T.stone, fontWeight:400, cursor:"pointer",
          opacity:step===3?0:1,
        }}>Cancel</button>
        <span className="mono" style={{ fontSize:9, color:T.ember, letterSpacing:"0.14em", textTransform:"uppercase" }}>Add Frame</span>
        <div style={{ width:68 }} />
      </div>

      <div style={{ flex:1, padding:"28px 20px 40px", maxWidth:440, margin:"0 auto", width:"100%" }}>

        {/* Step 1 — Source */}
        {step===1 && (
          <div className="anim-slideUp">
            <h2 className="serif" style={{ fontSize:28, fontStyle:"italic", marginBottom:6 }}>Choose source</h2>
            <p style={{ fontSize:13, color:T.flint, marginBottom:28 }}>Where is your photograph coming from?</p>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {[
                {icon:"🖼", label:"Device gallery", sub:"Pick from your photo library"},
                {icon:"📷", label:"Camera",         sub:"Capture right now"},
              ].map(s=>(
                <button key={s.label} onClick={()=>{ setSource(s.label); setStep(2); }} style={{
                  display:"flex", alignItems:"center", gap:14,
                  padding:"16px 16px",
                  background:T.graphite, border:`1px solid ${T.rim}`,
                  borderRadius:11, cursor:"pointer", textAlign:"left",
                  transition:"all 0.18s",
                }}>
                  <span style={{ fontSize:26 }}>{s.icon}</span>
                  <div>
                    <p style={{ fontSize:14, fontWeight:500, color:T.ivory, marginBottom:2 }}>{s.label}</p>
                    <p style={{ fontSize:11.5, color:T.flint }}>{s.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 — Details */}
        {step===2 && (
          <div className="anim-slideUp">
            <h2 className="serif" style={{ fontSize:28, fontStyle:"italic", marginBottom:6 }}>Frame details</h2>
            <p style={{ fontSize:12, color:T.flint, marginBottom:22 }}>Source: {source}</p>

            {/* Preview */}
            <div style={{ borderRadius:11, overflow:"hidden", marginBottom:18, boxShadow:"0 8px 32px rgba(0,0,0,0.5)" }}>
              <PhotoField seed={Math.floor(Math.random()*6)} aspect="4/3" />
            </div>

            {/* Auto-stamp */}
            <div style={{
              background:T.graphite, border:`1px solid ${T.rim}`,
              borderRadius:9, padding:"12px 14px", marginBottom:20,
              display:"flex", alignItems:"center", justifyContent:"space-between",
            }}>
              <div style={{ display:"flex", gap:18 }}>
                {[{l:"Date",v:stamp.date},{l:"Time",v:stamp.time},{l:"Year",v:stamp.year}].map(m=>(
                  <div key={m.l}>
                    <p className="mono" style={{ fontSize:12, color:T.champagne, fontWeight:500, marginBottom:2 }}>{m.v}</p>
                    <p style={{ fontSize:8.5, color:T.ember, letterSpacing:"0.09em", textTransform:"uppercase" }}>{m.l}</p>
                  </div>
                ))}
              </div>
              <span style={{ fontSize:9, color:T.emerald, fontFamily:"'JetBrains Mono',monospace", letterSpacing:"0.08em", textTransform:"uppercase", fontWeight:500 }}>Auto-stamped</span>
            </div>

            <Input label="Frame title" value={title} onChange={setTitle} placeholder="Give this frame a title" autoFocus />

            <div style={{ marginBottom:20 }}>
              <label style={{ display:"block", fontFamily:"'JetBrains Mono',monospace", fontSize:9.5, letterSpacing:"0.14em", textTransform:"uppercase", color:T.flint, marginBottom:7 }}>Add to vault</label>
              <select value={vault} onChange={e=>setVault(e.target.value)} style={{
                width:"100%", padding:"12px 14px",
                background:T.graphite, border:`1px solid ${T.rim}`,
                borderRadius:8, fontSize:13.5, color:vault?T.ivory:T.ember,
                fontFamily:"'Inter',sans-serif", cursor:"pointer",
                boxShadow:"inset 0 1px 0 rgba(255,255,255,0.02)",
              }}>
                <option value="">No vault — add later</option>
                {VAULTS.filter(v=>v.username==="elaravoss").map(v=><option key={v.id} value={v.title}>{v.title}</option>)}
              </select>
            </div>

            <Input label="Tags (comma-separated)" value={tags} onChange={setTags} placeholder="landscape, morning, fog" mono />

            <div style={{ marginTop:6 }}>
              <Btn onClick={publish} disabled={loading||!title} full size="lg">
                {loading?<><span style={{ display:"inline-block", width:14, height:14, border:`2px solid transparent`, borderTopColor:"#0C0D0F", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} /></>:"Publish Frame"}
              </Btn>
            </div>
          </div>
        )}

        {/* Step 3 — Confirmation */}
        {step===3 && (
          <div className="anim-slideUp" style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:320, textAlign:"center" }}>
            <div style={{
              width:64, height:64, borderRadius:"50%",
              background:`radial-gradient(circle, ${T.champagne}18 0%, transparent 70%)`,
              border:`1.5px solid ${T.champagne}50`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:24, marginBottom:24,
              boxShadow:`0 0 32px ${T.champagne}20`,
            }}>✦</div>
            <h2 className="serif" style={{ fontSize:26, fontStyle:"italic", marginBottom:10 }}>Frame published.</h2>
            <p style={{ fontSize:13, color:T.flint }}>Your work is now part of the Mosaic.</p>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   SPLASH SCREEN
   ───────────────────────────────────────────────────────────────────────────── */
const SplashScreen = ({ onEnter }) => {
  const [vis, setVis] = useState(false);
  useEffect(()=>{ const t=setTimeout(()=>setVis(true),80); return()=>clearTimeout(t); },[]);

  return (
    <div style={{
      minHeight:"100vh",
      background:`radial-gradient(ellipse at 50% 0%, #1A1B1F 0%, ${T.charcoal} 60%)`,
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      padding:"32px 24px",
      opacity:vis?1:0, transition:"opacity 0.7s ease",
    }}>
      {/* Logo mark */}
      <div style={{ marginBottom:36, position:"relative" }}>
        {/* Outer ring */}
        <div style={{
          width:76, height:76, borderRadius:"50%",
          border:`1px solid ${T.champagne}40`,
          display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow:`0 0 40px ${T.champagne}12, inset 0 0 20px rgba(0,0,0,0.4)`,
        }}>
          {/* Inner ring */}
          <div style={{
            width:54, height:54, borderRadius:"50%",
            border:`1px solid ${T.champagne}25`,
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            {/* Core */}
            <div style={{
              width:20, height:20, borderRadius:"50%",
              background:`radial-gradient(circle, ${T.gilt} 0%, ${T.brass} 100%)`,
              boxShadow:`0 0 16px ${T.champagne}50`,
            }} />
          </div>
        </div>
        {/* Rotating orbit */}
        <div style={{
          position:"absolute", top:"50%", left:"50%",
          width:76, height:76, marginLeft:-38, marginTop:-38,
          borderRadius:"50%",
          border:`1px dashed ${T.champagne}18`,
          animation:"spin 24s linear infinite",
        }} />
      </div>

      {/* Wordmark */}
      <h1 className="serif gold-shimmer" style={{ fontSize:44, fontWeight:600, letterSpacing:"-0.02em", lineHeight:1, marginBottom:6 }}>
        Lensmark
      </h1>
      <p style={{
        fontFamily:"'JetBrains Mono',monospace",
        fontSize:9.5, color:T.flint, letterSpacing:"0.22em",
        textTransform:"uppercase", marginBottom:20,
      }}>Photography · Identity · Trust</p>
      <p style={{ fontSize:13.5, color:T.flint, maxWidth:290, textAlign:"center", lineHeight:1.65, marginBottom:48 }}>
        A platform where every frame carries its maker's mark — and trust is earned, never purchased.
      </p>

      {/* CTAs */}
      <div style={{ display:"flex", flexDirection:"column", gap:11, width:"100%", maxWidth:320 }}>
        <Btn onClick={()=>onEnter("register")} variant="primary" size="lg" full>Begin your journey</Btn>
        <Btn onClick={()=>onEnter("login")}    variant="ghost"   size="lg" full>Sign in</Btn>
        <Btn onClick={()=>onEnter("main")}     variant="subtle"  size="sm" full style={{ marginTop:4 }}>
          Explore without signing in →
        </Btn>
      </div>

      <p className="mono" style={{ fontSize:9, color:T.ember, marginTop:44, letterSpacing:"0.1em", lineHeight:1.7, textAlign:"center", textTransform:"uppercase" }}>
        Trust is computed.  Quality is curated.<br/>Identity is yours.
      </p>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   REGISTER SCREEN
   ───────────────────────────────────────────────────────────────────────────── */
const RegisterScreen = ({ onSuccess, onNav }) => {
  const [step,     setStep]     = useState(1);
  const [email,    setEmail]    = useState("");
  const [otp,      setOtp]      = useState("");
  const [name,     setName]     = useState("");
  const [username, setUsername] = useState("");
  const [loading,  setLoading]  = useState(false);

  const sendCode = () => {
    if(!email.includes("@")) return;
    setLoading(true); setTimeout(()=>{ setLoading(false); setStep(2); },1200);
  };
  const verify = () => {
    if(otp.length<6) return;
    setLoading(true); setTimeout(()=>{ setLoading(false); setStep(3); },1000);
  };
  const finish = () => {
    if(!name||!username) return;
    setLoading(true); setTimeout(()=>{ setLoading(false); onSuccess({name,username,email}); },1200);
  };

  return (
    <div style={{ minHeight:"100vh", background:T.charcoal }}>
      {/* Progress header */}
      <div style={{ padding:"18px 20px 0", display:"flex", alignItems:"center", gap:12 }}>
        <button onClick={()=>step>1?setStep(s=>s-1):onNav("splash")} style={{
          background:T.graphite, border:`1px solid ${T.rim}`,
          borderRadius:7, padding:"6px 13px",
          fontSize:11.5, color:T.stone, cursor:"pointer",
        }}>←</button>
        <div style={{ flex:1 }} />
        <div style={{ display:"flex", gap:5 }}>
          {[1,2,3].map(s=>(
            <div key={s} style={{
              width:s===step?22:6, height:4, borderRadius:2,
              background: s<=step
                ? `linear-gradient(90deg,${T.champagne},${T.brass})`
                : T.rim,
              transition:"all 0.3s cubic-bezier(0.16,1,0.3,1)",
              boxShadow: s<=step?`0 0 6px ${T.champagne}40`:"none",
            }} />
          ))}
        </div>
      </div>

      <div style={{ padding:"36px 24px", maxWidth:400, margin:"0 auto" }}>
        {step===1 && (
          <div className="anim-fadeUp">
            <h2 className="serif" style={{ fontSize:30, fontStyle:"italic", marginBottom:8, letterSpacing:"-0.01em" }}>Your journey starts here.</h2>
            <p style={{ fontSize:13.5, color:T.flint, marginBottom:36 }}>We'll send a verification code to your email.</p>
            <Input label="Email address" type="email" value={email} onChange={setEmail} placeholder="you@example.com" autoFocus />
            <Btn onClick={sendCode} disabled={loading||!email.includes("@")} full size="lg" style={{ marginTop:4 }}>
              {loading?"Sending code…":"Send verification code"}
            </Btn>
            <p style={{ textAlign:"center", fontSize:12, color:T.ember, marginTop:24 }}>
              Already a member?{" "}
              <button onClick={()=>onNav("login")} style={{ background:"none", border:"none", color:T.champagne, cursor:"pointer", fontSize:12, fontFamily:"'Inter',sans-serif" }}>Sign in</button>
            </p>
          </div>
        )}

        {step===2 && (
          <div className="anim-fadeUp">
            <h2 className="serif" style={{ fontSize:30, fontStyle:"italic", marginBottom:8, letterSpacing:"-0.01em" }}>Check your inbox.</h2>
            <p style={{ fontSize:13, color:T.flint, marginBottom:6 }}>We sent a 6-digit code to</p>
            <p className="mono" style={{ fontSize:13.5, color:T.gilt, marginBottom:32 }}>{email}</p>
            <OTPInput value={otp} onChange={setOtp} />
            <div style={{ marginTop:24 }}>
              <Btn onClick={verify} disabled={loading||otp.length<6} full size="lg">
                {loading?"Verifying…":"Verify code"}
              </Btn>
            </div>
            <button onClick={()=>setStep(1)} style={{ display:"block", margin:"16px auto 0", background:"none", border:"none", color:T.flint, fontSize:12, cursor:"pointer" }}>
              Use a different email
            </button>
          </div>
        )}

        {step===3 && (
          <div className="anim-fadeUp">
            <h2 className="serif" style={{ fontSize:30, fontStyle:"italic", marginBottom:8, letterSpacing:"-0.01em" }}>Claim your Imprint.</h2>
            <p style={{ fontSize:13, color:T.flint, marginBottom:32, lineHeight:1.6 }}>Your Imprint is your identity on Lensmark. Choose wisely — it's how the community will know you.</p>
            <Input label="Full name" value={name} onChange={setName} placeholder="Your name as you'd like it shown" />
            <Input label="Username" value={username} onChange={v=>setUsername(v.toLowerCase().replace(/\s/g,""))} placeholder="your.mark" mono hint="Letters, numbers, dots and underscores only." />
            <Btn onClick={finish} disabled={loading||!name||!username} full size="lg" style={{ marginTop:4 }}>
              {loading?"Creating your Imprint…":"Create my Imprint"}
            </Btn>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   LOGIN SCREEN
   ───────────────────────────────────────────────────────────────────────────── */
const LoginScreen = ({ onSuccess, onNav }) => {
  const [step,    setStep]    = useState(1);
  const [email,   setEmail]   = useState("");
  const [otp,     setOtp]     = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div style={{ minHeight:"100vh", background:T.charcoal }}>
      <div style={{ padding:"18px 20px 0" }}>
        <button onClick={()=>step>1?setStep(1):onNav("splash")} style={{
          background:T.graphite, border:`1px solid ${T.rim}`,
          borderRadius:7, padding:"6px 13px",
          fontSize:11.5, color:T.stone, cursor:"pointer",
        }}>←</button>
      </div>
      <div style={{ padding:"36px 24px", maxWidth:400, margin:"0 auto" }}>
        {step===1 ? (
          <div className="anim-fadeUp">
            <h2 className="serif" style={{ fontSize:30, fontStyle:"italic", marginBottom:8 }}>Welcome back.</h2>
            <p style={{ fontSize:13.5, color:T.flint, marginBottom:36 }}>Enter your email and we'll send a sign-in code.</p>
            <Input label="Email address" type="email" value={email} onChange={setEmail} placeholder="you@example.com" autoFocus />
            <Btn onClick={()=>{ setLoading(true); setTimeout(()=>{ setLoading(false); setStep(2); },1000); }} disabled={loading||!email.includes("@")} full size="lg" style={{ marginTop:4 }}>
              {loading?"Sending…":"Send sign-in code"}
            </Btn>
            <div style={{ margin:"24px 0", display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ flex:1, height:1, background:T.rim }} />
              <span style={{ fontSize:11, color:T.ember }}>or</span>
              <div style={{ flex:1, height:1, background:T.rim }} />
            </div>
            <Btn onClick={()=>onNav("forgot")} variant="ghost" full>Reset access via email link</Btn>
            <p style={{ textAlign:"center", fontSize:12, color:T.ember, marginTop:24 }}>
              New to Lensmark?{" "}
              <button onClick={()=>onNav("register")} style={{ background:"none", border:"none", color:T.champagne, cursor:"pointer", fontSize:12 }}>Create an Imprint</button>
            </p>
          </div>
        ) : (
          <div className="anim-fadeUp">
            <h2 className="serif" style={{ fontSize:30, fontStyle:"italic", marginBottom:8 }}>Enter your code.</h2>
            <p style={{ fontSize:13, color:T.flint, marginBottom:6 }}>Sent to</p>
            <p className="mono" style={{ fontSize:13.5, color:T.gilt, marginBottom:32 }}>{email}</p>
            <OTPInput value={otp} onChange={setOtp} />
            <div style={{ marginTop:24 }}>
              <Btn onClick={()=>{ setLoading(true); setTimeout(()=>{ setLoading(false); onSuccess({name:"Elara Voss",username:"elaravoss",email}); },900); }} disabled={loading||otp.length<6} full size="lg">
                {loading?"Signing in…":"Sign in"}
              </Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   FORGOT SCREEN
   ───────────────────────────────────────────────────────────────────────────── */
const ForgotScreen = ({ onNav }) => {
  const [email,   setEmail]   = useState("");
  const [sent,    setSent]    = useState(false);
  const [loading, setLoading] = useState(false);
  return (
    <div style={{ minHeight:"100vh", background:T.charcoal }}>
      <div style={{ padding:"18px 20px 0" }}>
        <button onClick={()=>onNav("login")} style={{ background:T.graphite, border:`1px solid ${T.rim}`, borderRadius:7, padding:"6px 13px", fontSize:11.5, color:T.stone, cursor:"pointer" }}>←</button>
      </div>
      <div style={{ padding:"36px 24px", maxWidth:400, margin:"0 auto" }}>
        {!sent ? (
          <div className="anim-fadeUp">
            <h2 className="serif" style={{ fontSize:30, fontStyle:"italic", marginBottom:8 }}>Reset your access.</h2>
            <p style={{ fontSize:13.5, color:T.flint, marginBottom:36 }}>We'll send a recovery link to your registered email.</p>
            <Input label="Email address" type="email" value={email} onChange={setEmail} placeholder="you@example.com" autoFocus />
            <Btn onClick={()=>{ setLoading(true); setTimeout(()=>{ setLoading(false); setSent(true); },1000); }} disabled={loading||!email.includes("@")} full size="lg" style={{ marginTop:4 }}>
              {loading?"Sending…":"Send recovery link"}
            </Btn>
          </div>
        ) : (
          <div className="anim-fadeUp" style={{ textAlign:"center", paddingTop:20 }}>
            <div style={{
              width:64, height:64, borderRadius:"50%",
              background:T.emeraldFaint, border:`1.5px solid ${T.emerald}40`,
              display:"flex", alignItems:"center", justifyContent:"center",
              margin:"0 auto 24px", fontSize:26, color:T.emerald,
              boxShadow:`0 0 24px ${T.emerald}15`,
            }}>✓</div>
            <h2 className="serif" style={{ fontSize:26, fontStyle:"italic", marginBottom:10 }}>Check your inbox.</h2>
            <p style={{ fontSize:13, color:T.flint, marginBottom:32, lineHeight:1.6 }}>
              A recovery link was sent to <span style={{ color:T.gilt }}>{email}</span>. It expires in 15 minutes.
            </p>
            <Btn onClick={()=>onNav("login")} variant="ghost">Back to sign in</Btn>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   MOSAIC TAB
   ───────────────────────────────────────────────────────────────────────────── */
const MosaicTab = ({ onFrameOpen }) => {
  const [filter, setFilter] = useState("all");
  const filters = [
    {id:"all",label:"All"},{id:"recent",label:"Recent"},
    {id:"rising",label:"Rising"},{id:"debut",label:"Debut"},
    {id:"hidden",label:"Hidden Gems"},
  ];
  const shown = filter==="debut" ? FRAMES.filter(f=>CREATORS.find(c=>c.username===f.username)?.debut)
    : filter==="rising" ? FRAMES.filter(f=>CREATORS.find(c=>c.username===f.username)?.rising) : FRAMES;

  return (
    <div style={{ paddingBottom:80 }}>
      {/* Section header */}
      <div style={{ padding:"22px 18px 14px" }}>
        <div style={{ display:"flex", alignItems:"baseline", gap:10, marginBottom:3 }}>
          <h1 className="serif" style={{ fontSize:28, fontWeight:600, letterSpacing:"-0.02em", fontStyle:"italic" }}>Mosaic</h1>
          <span className="mono" style={{ fontSize:9, color:T.flint, letterSpacing:"0.16em", textTransform:"uppercase" }}>Discovery</span>
        </div>
        <p style={{ fontSize:12, color:T.flint }}>New voices. Hidden light. Rising talent.</p>
      </div>

      {/* Filter pills */}
      <div style={{ padding:"0 18px 16px" }}>
        <PillRow options={filters} active={filter} onChange={setFilter} />
      </div>

      {/* Debut notice */}
      {filter==="all" && (
        <div style={{
          margin:"0 18px 16px",
          padding:"13px 14px",
          background:`linear-gradient(135deg, ${T.emeraldFaint}, ${T.graphite})`,
          borderRadius:11, border:`1px solid ${T.emerald}25`,
          display:"flex", alignItems:"center", gap:12,
        }}>
          <div style={{
            width:34, height:34, borderRadius:"50%",
            background:T.emeraldFaint, border:`1px solid ${T.emerald}30`,
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, flexShrink:0,
          }}>✦</div>
          <div>
            <p className="mono" style={{ fontSize:9, color:T.emerald, letterSpacing:"0.1em", fontWeight:500, textTransform:"uppercase", marginBottom:3 }}>2 Debut creators this week</p>
            <p style={{ fontSize:11, color:T.flint }}>Cass Deloria and Omar Jerez made their first uploads.</p>
          </div>
        </div>
      )}

      {/* Masonry grid */}
      <div style={{ padding:"0 18px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, gridAutoRows:"150px" }}>
        {shown.map(f=><FrameCard key={f.id} frame={f} onClick={onFrameOpen} />)}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   VAULTS TAB
   ───────────────────────────────────────────────────────────────────────────── */
const VaultsTab = () => {
  return (
    <div style={{ paddingBottom:80 }}>
      <div style={{ padding:"22px 18px 16px" }}>
        <div style={{ display:"flex", alignItems:"baseline", gap:10, marginBottom:3 }}>
          <h1 className="serif" style={{ fontSize:28, fontWeight:600, letterSpacing:"-0.02em", fontStyle:"italic" }}>Vaults</h1>
          <span className="mono" style={{ fontSize:9, color:T.flint, letterSpacing:"0.16em", textTransform:"uppercase" }}>Collections</span>
        </div>
        <p style={{ fontSize:12, color:T.flint }}>Curated galleries from the Lensmark community.</p>
      </div>

      {/* Featured vault */}
      <div style={{ margin:"0 18px 18px" }}>
        <div style={{
          borderRadius:13, overflow:"hidden",
          border:`1px solid ${T.rim}`,
          boxShadow:"0 8px 32px rgba(0,0,0,0.5)",
        }}>
          <PhotoField seed={3} aspect="16/7" overlay>
            <div style={{ position:"absolute", top:10, left:12 }}>
              <span className="mono" style={{ fontSize:9, color:T.champagne, letterSpacing:"0.14em", textTransform:"uppercase",
                background:"rgba(12,13,15,0.7)", borderRadius:5, padding:"3px 8px" }}>Featured Vault</span>
            </div>
            <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"20px 16px" }}>
              <p className="serif" style={{ fontSize:22, fontStyle:"italic", color:T.ivory, marginBottom:6 }}>After Dark</p>
              <p style={{ fontSize:11.5, color:"rgba(245,241,234,0.65)", marginBottom:10 }}>Neon, rain, solitude, and light. 41 frames by Yuki Strand.</p>
              <Btn size="sm" variant="ghost" style={{ borderColor:"rgba(255,255,255,0.2)", color:T.ivory, fontSize:11 }}>Explore vault →</Btn>
            </div>
          </PhotoField>
        </div>
      </div>

      {/* Grid */}
      <div style={{ padding:"0 18px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {VAULTS.map(v=><VaultCard key={v.id} vault={v} />)}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   CREATORS TAB
   ───────────────────────────────────────────────────────────────────────────── */
const CreatorsTab = () => {
  const [view, setView] = useState("all");
  const shown = view==="debut" ? CREATORS.filter(c=>c.debut)
    : view==="rising" ? CREATORS.filter(c=>c.rising) : CREATORS;

  return (
    <div style={{ paddingBottom:80 }}>
      <div style={{ padding:"22px 18px 16px" }}>
        <div style={{ display:"flex", alignItems:"baseline", gap:10, marginBottom:3 }}>
          <h1 className="serif" style={{ fontSize:28, fontWeight:600, letterSpacing:"-0.02em", fontStyle:"italic" }}>Creators</h1>
          <span className="mono" style={{ fontSize:9, color:T.flint, letterSpacing:"0.16em", textTransform:"uppercase" }}>Community</span>
        </div>
        <p style={{ fontSize:12, color:T.flint, marginBottom:16 }}>The makers behind every frame.</p>
        <PillRow options={[{id:"all",label:"All"},{id:"rising",label:"Rising"},{id:"debut",label:"Debut"}]} active={view} onChange={setView} />
      </div>
      <div style={{ padding:"0 18px", display:"flex", flexDirection:"column", gap:10 }}>
        {shown.map(c=><CreatorCard key={c.id} creator={c} />)}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   IMPRINT TAB
   ───────────────────────────────────────────────────────────────────────────── */
const ImprintTab = ({ user, onUpload }) => {
  const creator = CREATORS.find(c=>c.username===(user?.username||"elaravoss")) || CREATORS[0];
  const myFrames = FRAMES.filter(f=>f.username===(user?.username||"elaravoss"));
  const [sec, setSec] = useState("frames");

  const trustFactors = [
    {label:"Verified email",              done:true,  weight:15},
    {label:"Account age (6+ months)",     done:true,  weight:20},
    {label:"Positive interactions",       done:true,  weight:25},
    {label:"Upload consistency",          done:true,  weight:20},
    {label:"Community participation",     done:false, weight:20},
  ];

  return (
    <div style={{ paddingBottom:80 }}>
      {/* Hero */}
      <div style={{ background:`linear-gradient(180deg, ${T.graphite} 0%, ${T.charcoal} 100%)`, padding:"28px 18px 20px" }}>
        <div style={{ display:"flex", alignItems:"flex-start", gap:14, marginBottom:20 }}>
          <CreatorAvatar name={user?.name||"Elara Voss"} username={user?.username||"elaravoss"} size={72} luminance={creator.luminance} />
          <div style={{ flex:1, minWidth:0 }}>
            <h2 className="serif" style={{ fontSize:22, fontWeight:600, fontStyle:"italic", letterSpacing:"-0.01em", marginBottom:3 }}>{user?.name||"Elara Voss"}</h2>
            <p className="mono" style={{ fontSize:10, color:T.ember, marginBottom:9 }}>@{user?.username||"elaravoss"}</p>
            <p style={{ fontSize:12.5, color:T.flint, lineHeight:1.55 }}>{creator.bio}</p>
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display:"grid", gridTemplateColumns:"1fr 1fr 1fr",
          background:T.graphiteMid, borderRadius:10,
          border:`1px solid ${T.rim}`,
          overflow:"hidden",
        }}>
          {[
            {label:"Frames",    value:creator.frames},
            {label:"Vaults",    value:creator.vaults},
            {label:"Luminance", value:creator.luminance, color:lumColor(creator.luminance), sub:lumLabel(creator.luminance)},
          ].map((s,i)=>(
            <div key={s.label} style={{
              padding:"12px 0", textAlign:"center",
              borderLeft:i>0?`1px solid ${T.rim}`:"none",
            }}>
              <p className="mono" style={{ fontSize:18, fontWeight:500, color:s.color||T.ivory, lineHeight:1, marginBottom:3 }}>{s.value}</p>
              <p style={{ fontSize:8.5, color:T.ember, letterSpacing:"0.08em", textTransform:"uppercase" }}>{s.sub||s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Upload CTA */}
      <div style={{
        margin:"14px 18px 0",
        padding:"14px 16px",
        background:T.graphite, border:`1px solid ${T.champagne}18`,
        borderRadius:11,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        boxShadow:`inset 0 1px 0 rgba(255,255,255,0.03)`,
      }}>
        <div>
          <p style={{ fontSize:13.5, fontWeight:500, color:T.ivory, marginBottom:2 }}>Add a new frame</p>
          <p style={{ fontSize:11, color:T.flint }}>From your gallery or camera</p>
        </div>
        <Btn onClick={onUpload} variant="primary" size="sm">+ Upload</Btn>
      </div>

      {/* Section tabs */}
      <div style={{ display:"flex", borderBottom:`1px solid ${T.rim}`, margin:"16px 0 0" }}>
        {["frames","vaults","trust"].map(s=>(
          <button key={s} onClick={()=>setSec(s)} style={{
            flex:1, padding:"13px 0",
            background:"none", border:"none",
            color: sec===s ? T.champagne : T.flint,
            fontSize:11, fontWeight:500, letterSpacing:"0.08em",
            cursor:"pointer", textTransform:"capitalize",
            borderBottom:`2px solid ${sec===s?T.champagne:"transparent"}`,
            transition:"all 0.18s",
            fontFamily:"'Inter',sans-serif",
          }}>{s.charAt(0).toUpperCase()+s.slice(1)}</button>
        ))}
      </div>

      {/* Frames */}
      {sec==="frames" && (
        <div style={{ padding:"14px 18px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, gridAutoRows:"150px" }}>
          {myFrames.map(f=><FrameCard key={f.id} frame={f} />)}
          {myFrames.length===0 && (
            <div style={{ gridColumn:"1/-1", textAlign:"center", padding:48, color:T.flint, fontSize:13 }}>
              No frames yet. Upload your first.
            </div>
          )}
        </div>
      )}

      {/* Vaults */}
      {sec==="vaults" && (
        <div style={{ padding:"14px 18px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {VAULTS.filter(v=>v.username===(user?.username||"elaravoss")).map(v=><VaultCard key={v.id} vault={v} />)}
          <div style={{
            background:T.graphite, border:`1px dashed ${T.rim}`,
            borderRadius:11, padding:20,
            display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:7, cursor:"pointer",
            transition:"background 0.18s",
          }}>
            <span style={{ fontSize:22, color:T.flint }}>+</span>
            <span style={{ fontSize:11, color:T.flint }}>New vault</span>
          </div>
        </div>
      )}

      {/* Trust */}
      {sec==="trust" && (
        <div style={{ padding:"16px 18px" }}>
          {/* Score card */}
          <div style={{
            background:T.graphite, borderRadius:12,
            border:`1px solid ${T.rim}`,
            overflow:"hidden", marginBottom:14,
            boxShadow:`0 4px 20px rgba(0,0,0,0.3)`,
          }}>
            {/* Header */}
            <div style={{ padding:"16px 16px 0", display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
              <div>
                <h3 className="serif" style={{ fontSize:20, fontStyle:"italic", marginBottom:3 }}>Luminance Score</h3>
                <p style={{ fontSize:11, color:T.flint }}>Computed. Not purchased.</p>
              </div>
              <div style={{ textAlign:"right" }}>
                <p className="mono" style={{ fontSize:34, fontWeight:500, color:lumColor(creator.luminance), lineHeight:1 }}>{creator.luminance}</p>
                <p style={{ fontSize:10, color:lumColor(creator.luminance), fontWeight:500, marginTop:3 }}>{lumLabel(creator.luminance)}</p>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ margin:"0 16px 16px", height:3, background:T.rim, borderRadius:2, overflow:"hidden" }}>
              <div style={{
                height:"100%", width:`${creator.luminance}%`,
                background:`linear-gradient(90deg, ${T.brass}, ${T.gilt})`,
                borderRadius:2,
                boxShadow:`0 0 8px ${T.champagne}50`,
                transition:"width 1s cubic-bezier(0.16,1,0.3,1)",
              }} />
            </div>

            {/* Factors */}
            <div style={{ borderTop:`1px solid ${T.rim}` }}>
              {trustFactors.map((tf,i)=>(
                <div key={tf.label} style={{
                  display:"flex", alignItems:"center", gap:12,
                  padding:"12px 16px",
                  borderBottom: i<trustFactors.length-1?`1px solid ${T.rim}`:"none",
                }}>
                  <div style={{
                    width:18, height:18, borderRadius:"50%", flexShrink:0,
                    background: tf.done?T.emeraldFaint:T.graphiteHigh,
                    border:`1.5px solid ${tf.done?T.emerald:T.rim}`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    boxShadow: tf.done?`0 0 8px ${T.emerald}25`:"none",
                  }}>
                    {tf.done && <span style={{ fontSize:9, color:T.emerald, fontWeight:600 }}>✓</span>}
                  </div>
                  <p style={{ flex:1, fontSize:12.5, color:tf.done?T.ivory:T.flint, fontWeight:tf.done?400:300 }}>{tf.label}</p>
                  <span className="mono" style={{ fontSize:10, color:tf.done?T.champagne:T.rim, fontWeight:500 }}>+{tf.weight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Info note */}
          <div style={{
            padding:"13px 14px",
            background:T.goldFaint,
            borderRadius:10, border:`1px solid ${T.champagne}18`,
          }}>
            <p style={{ fontSize:11.5, color:T.stone, lineHeight:1.65 }}>
              <span style={{ color:T.champagne, fontWeight:500 }}>Luminance Score</span> is Lensmark's trust system. It rewards authentic participation — consistent uploading, quality engagement, and community contribution. It cannot be bought, boosted, or gamed.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   ACCOUNT TAB
   ───────────────────────────────────────────────────────────────────────────── */
const AccountTab = ({ user, onLogout }) => {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [privateMode, setPrivateMode] = useState(false);

  const Toggle = ({ value, onChange }) => (
    <div onClick={()=>onChange(!value)} style={{
      width:42, height:24, borderRadius:12, flexShrink:0,
      background: value
        ? `linear-gradient(135deg, ${T.champagne}, ${T.brass})`
        : T.graphiteHigh,
      border:`1px solid ${value?T.champagne+"50":T.rim}`,
      position:"relative", cursor:"pointer",
      transition:"all 0.2s",
      boxShadow: value?`0 2px 8px ${T.champagne}25`:"none",
    }}>
      <div style={{
        position:"absolute", top:3,
        left: value?21:3,
        width:16, height:16, borderRadius:"50%",
        background: value?"#0C0D0F":T.flint,
        transition:"left 0.2s cubic-bezier(0.16,1,0.3,1)",
        boxShadow:"0 1px 3px rgba(0,0,0,0.4)",
      }} />
    </div>
  );

  const SectionLabel = ({children}) => (
    <p className="mono" style={{ fontSize:9, color:T.ember, letterSpacing:"0.14em", textTransform:"uppercase", padding:"0 18px", marginBottom:6 }}>{children}</p>
  );

  const SettingRow = ({ label, sub, right, onClick, danger, last=false }) => (
    <div onClick={onClick} style={{
      display:"flex", alignItems:"center",
      padding:"14px 18px",
      borderBottom: last?`none`:`1px solid ${T.rim}`,
      cursor:onClick?"pointer":"default",
      transition:"background 0.15s",
    }}>
      <div style={{ flex:1 }}>
        <p style={{ fontSize:13.5, color:danger?"#C05050":T.ivory, fontWeight:400, marginBottom:sub?2:0 }}>{label}</p>
        {sub && <p style={{ fontSize:11, color:T.ember }}>{sub}</p>}
      </div>
      {right}
    </div>
  );

  const Card = ({children}) => (
    <div style={{
      margin:"0 18px 16px",
      background:T.graphite, borderRadius:12,
      border:`1px solid ${T.rim}`,
      overflow:"hidden",
      boxShadow:"0 2px 8px rgba(0,0,0,0.2)",
    }}>{children}</div>
  );

  return (
    <div style={{ paddingBottom:80 }}>
      {/* Header */}
      <div style={{ padding:"24px 18px 20px", display:"flex", alignItems:"center", gap:14 }}>
        <CreatorAvatar name={user?.name||"Elara Voss"} username={user?.username||"elaravoss"} size={58} luminance={87} />
        <div>
          <h2 className="serif" style={{ fontSize:21, fontStyle:"italic", fontWeight:500, letterSpacing:"-0.01em" }}>{user?.name||"Elara Voss"}</h2>
          <p className="mono" style={{ fontSize:10, color:T.ember, marginBottom:2 }}>@{user?.username||"elaravoss"}</p>
          <p style={{ fontSize:11.5, color:T.flint }}>{user?.email||"elara@example.com"}</p>
        </div>
      </div>

      <SectionLabel>Identity</SectionLabel>
      <Card>
        <SettingRow label="Edit Imprint" sub="Name, username, bio" right={<span style={{ color:T.flint, fontSize:16 }}>›</span>} onClick={()=>{}} />
        <SettingRow label="Email address" sub={user?.email||"elara@example.com"} right={<span className="mono" style={{ fontSize:9, color:T.emerald, fontWeight:600, letterSpacing:"0.08em" }}>VERIFIED</span>} last />
      </Card>

      <SectionLabel>Preferences</SectionLabel>
      <Card>
        <SettingRow label="Email notifications" sub="Appreciations and milestones" right={<Toggle value={emailNotifs} onChange={setEmailNotifs} />} />
        <SettingRow label="Private Imprint" sub="Only you can see your frames" right={<Toggle value={privateMode} onChange={setPrivateMode} />} last />
      </Card>

      <SectionLabel>About</SectionLabel>
      <Card>
        <SettingRow label="Luminance Score" sub="How trust is calculated" right={<span style={{ color:T.flint, fontSize:16 }}>›</span>} onClick={()=>{}} />
        <SettingRow label="Community guidelines" right={<span style={{ color:T.flint, fontSize:16 }}>›</span>} onClick={()=>{}} />
        <SettingRow label="Privacy policy" right={<span style={{ color:T.flint, fontSize:16 }}>›</span>} onClick={()=>{}} />
        <SettingRow label="Lensmark v1.0.0" sub="Built for photographers" last />
      </Card>

      <SectionLabel>Session</SectionLabel>
      <Card>
        <SettingRow label="Sign out" danger onClick={onLogout} right={<span style={{ color:"#C05050", fontSize:16 }}>›</span>} last />
      </Card>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   NAV BAR
   ───────────────────────────────────────────────────────────────────────────── */
const NavBar = ({ active, onTab }) => {
  const tabs = [
    { id:"mosaic",   icon:"⊞", label:"Mosaic"   },
    { id:"vaults",   icon:"🗂", label:"Vaults"   },
    { id:"creators", icon:"◎", label:"Creators" },
    { id:"imprint",  icon:"◈", label:"Imprint"  },
    { id:"account",  icon:"◉", label:"Account"  },
  ];
  return (
    <div className="nav-bar">
      <div style={{ display:"flex", maxWidth:520, margin:"0 auto" }}>
        {tabs.map(t => {
          const on = active===t.id;
          return (
            <button key={t.id} onClick={()=>onTab(t.id)} style={{
              flex:1, background:"none", border:"none",
              color: on ? T.champagne : T.flint,
              fontSize:8.5, fontWeight:on?600:400,
              letterSpacing:"0.05em", cursor:"pointer",
              padding:"6px 0 2px",
              display:"flex", flexDirection:"column", alignItems:"center", gap:4,
              transition:"color 0.18s",
              fontFamily:"'Inter',sans-serif",
            }}>
              <span style={{
                fontSize:19, lineHeight:1,
                filter: on?`drop-shadow(0 0 6px ${T.champagne}80)`:"none",
                transition:"filter 0.2s",
              }}>{t.icon}</span>
              <span style={{ textTransform:"uppercase" }}>{t.label}</span>
              {on && <div style={{ width:16, height:2, borderRadius:1, background:`linear-gradient(90deg,${T.champagne},${T.brass})`, marginTop:1 }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN APP
   ───────────────────────────────────────────────────────────────────────────── */
const MainApp = ({ user, onLogout }) => {
  const [tab,         setTab]         = useState("mosaic");
  const [frameModal,  setFrameModal]  = useState(null);
  const [uploadOpen,  setUploadOpen]  = useState(false);
  const [toast,       setToast]       = useState(null);

  const showToast = (msg, type="info") => setToast({msg,type,id:Date.now()});

  return (
    <div style={{ maxWidth:520, margin:"0 auto", position:"relative", minHeight:"100vh", background:T.charcoal }}>
      {/* Top bar */}
      <div className="top-bar" style={{ height:50, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 18px" }}>
        <span className="serif gold-shimmer" style={{ fontSize:19, fontWeight:700, letterSpacing:"-0.02em" }}>Lensmark</span>
        <button onClick={()=>setUploadOpen(true)} style={{
          background:`linear-gradient(135deg, ${T.champagne}, ${T.brass})`,
          border:"none", borderRadius:8,
          padding:"6px 14px", fontSize:11.5, fontWeight:600,
          color:"#0C0D0F", cursor:"pointer",
          letterSpacing:"0.02em",
          boxShadow:`0 2px 10px ${T.champagne}30, inset 0 1px 0 rgba(255,255,255,0.18)`,
        }}>+ Frame</button>
      </div>

      {/* Tab content */}
      <div key={tab} className="anim-fadeUp">
        {tab==="mosaic"   && <MosaicTab   onFrameOpen={setFrameModal} />}
        {tab==="vaults"   && <VaultsTab   />}
        {tab==="creators" && <CreatorsTab />}
        {tab==="imprint"  && <ImprintTab  user={user} onUpload={()=>setUploadOpen(true)} />}
        {tab==="account"  && <AccountTab  user={user} onLogout={onLogout} />}
      </div>

      <NavBar active={tab} onTab={setTab} />

      {frameModal  && <FrameModal frame={frameModal} onClose={()=>setFrameModal(null)} />}
      {uploadOpen  && <UploadModal onClose={()=>setUploadOpen(false)} onDone={()=>showToast("Frame published to the Mosaic!","success")} />}
      {toast       && <Toast key={toast.id} message={toast.msg} type={toast.type} onDone={()=>setToast(null)} />}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   ROOT
   ───────────────────────────────────────────────────────────────────────────── */
export default function Lensmark() {
  const [screen, setScreen] = useState("splash");
  const [user,   setUser]   = useState(null);

  const nav = s => {
    if(s==="main") { setUser({name:"Elara Voss",username:"elaravoss",email:"elara@example.com"}); setScreen("main"); return; }
    setScreen(s);
  };
  const handleAuth = u => { setUser(u); setScreen("main"); };

  return (
    <>
      <style>{CSS}</style>
      {screen==="splash"   && <SplashScreen   onEnter={nav} />}
      {screen==="register" && <RegisterScreen onSuccess={handleAuth} onNav={nav} />}
      {screen==="login"    && <LoginScreen    onSuccess={handleAuth} onNav={nav} />}
      {screen==="forgot"   && <ForgotScreen   onNav={nav} />}
      {screen==="main"     && <MainApp        user={user} onLogout={()=>{ setUser(null); setScreen("splash"); }} />}
    </>
  );
}
