// Hi-fi build of the wireframe demo. Each role gets its own static page:
//   admin/, npp/  → CMS-style (no browser chrome, colored sidebar, polished tables)
//   shop/, sales/ → Mini-app style (phone frame on soft canvas)
// Wireframe shell (screen rail, annotation toggles, pin/notes) is hidden;
// navigation between demo screens is exposed via a floating "Screens" pill.

const fs   = require('fs');
const path = require('path');
const zlib = require('zlib');

const SRC = path.join(__dirname, 'Idemitsu-Wireframe-HTML');
const OUT = __dirname;

function extract(bundleFile) {
  const html = fs.readFileSync(path.join(SRC, bundleFile), 'utf8');
  const tplMatch = html.match(/<script type="__bundler\/template">([\s\S]*?)<\/script>/);
  const template = JSON.parse(tplMatch[1]);
  const manMatch = html.match(/<script type="__bundler\/manifest">([\s\S]*?)<\/script>/);
  const manifest = JSON.parse(manMatch[1]);
  const userJs = [];
  for (const [, entry] of Object.entries(manifest)) {
    if (entry.mime !== 'application/javascript') continue;
    const buf = Buffer.from(entry.data, 'base64');
    userJs.push(entry.compressed ? zlib.gunzipSync(buf).toString('utf8') : buf.toString('utf8'));
  }
  return { template, userJs };
}

const pickFramework = arr => arr.find(s => /function WireApp\(/.test(s));
const pickScreens   = arr => arr.find(s => /_SCREENS\s*=/.test(s));

// 1. Kit CSS from index.html template (wireframe base)
const indexEx = extract('index.html');
const styleBlocks = [...indexEx.template.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]);
const kitCss = styleBlocks[0];      // wireframe primitives
const hubCss = styleBlocks[2] || ''; // hub-only

// 2. Framework JS (same in all role bundles)
const adminEx = extract('admin.html');
const wfJs = pickFramework(adminEx.userJs);

// 3. Hi-fi theme — layered on top of the wireframe kit
const hiFiCss = `
/* ============================================================
 * HI-FI THEME — overrides on top of the wireframe kit.
 *   • Refined neutral palette + product-grade depth/shadows
 *   • Drops low-fi affordances (X-cross image placeholders,
 *     amber annotation pins/notes, wireframe screen rail)
 *   • CMS mode: full-bleed CMS, browser chrome hidden
 *   • Mobile mode: phone frame centered on soft canvas
 * ============================================================ */
:root{
  --w-canvas:#EEF2F7; --w-paper:#FFFFFF;
  --w-line:#E5E7EB;   --w-line-2:#D1D5DB;
  --w-fill:#F1F5F9;   --w-fill-2:#E5E7EB; --w-fill-3:#F8FAFC;
  --w-bar:#E5E7EB;
  --w-ink:#0F172A; --w-ink-2:#475569; --w-ink-3:#94A3B8;
}
body{ background:var(--w-canvas); }

/* hide wireframe shell chrome (rail + topbar with toggles) */
.wf-rail, .wf-topbar { display:none !important; }
.wf-shell{ display:block !important; height:100vh; overflow:auto; }
.wf-main{ display:block; }
.wf-stage{ background:var(--w-canvas); overflow:visible; }
.wf-stage-pad{ padding:0; min-height:100vh; align-items:stretch; display:block; }

/* hide annotation system (pins, notes) */
.w-note, .w-pin { display:none !important; }

/* image placeholders — drop the X-cross diagonal pattern */
.w-img::before, .w-img::after { display:none; }
.w-img{
  background:linear-gradient(135deg, #F8FAFC, #E2E8F0);
  border:1px solid var(--w-line); color:#94A3B8;
}
.w-img > span{
  background:rgba(255,255,255,0.85); border-radius:6px;
  padding:3px 9px; font-weight:500; font-size:11px; color:#64748B;
}

/* icon placeholders — soft chip with subtle inner highlight */
.w-icon, .cms-side .ci, .w-botnav .gi{
  background:linear-gradient(135deg, #FFFFFF, #F1F5F9);
  border:1px solid var(--w-line);
  box-shadow:inset 0 -1px 0 rgba(0,0,0,0.02);
}

/* avatar — soft gradient ring */
.w-avatar{
  background:linear-gradient(135deg, #CBD5E1, #94A3B8);
  border:2px solid #FFFFFF;
  box-shadow:0 1px 3px rgba(0,0,0,0.08);
}

/* line text-bars */
.w-line{ background:var(--w-bar); }

/* cards & boxes */
.w-card{
  border:1px solid var(--w-line); border-radius:12px;
  box-shadow:0 1px 2px rgba(15,23,42,.04), 0 1px 1px rgba(15,23,42,.06);
}
.w-box{
  border:1px solid var(--w-line); border-radius:8px;
  box-shadow:0 1px 0 rgba(15,23,42,.03);
}

/* buttons */
.w-btn{
  border:none; background:var(--w-brand); color:#fff;
  box-shadow:0 1px 2px rgba(200,16,46,.15), 0 1px 3px rgba(200,16,46,.10);
  transition:transform .12s, box-shadow .12s, background .12s;
}
.w-btn:not(.disabled):hover{
  background:#B30E29; transform:translateY(-1px);
  box-shadow:0 4px 10px rgba(200,16,46,.28), 0 2px 4px rgba(200,16,46,.15);
}
.w-btn.ghost{
  background:#FFFFFF; color:var(--w-ink);
  border:1px solid var(--w-line-2);
  box-shadow:0 1px 2px rgba(15,23,42,.04);
}
.w-btn.ghost:not(.disabled):hover{
  background:#F8FAFC; border-color:#94A3B8;
  transform:translateY(-1px);
}
.w-btn.disabled{ background:#E5E7EB; color:#94A3B8; box-shadow:none; }

/* inputs */
.w-input{
  background:#FFFFFF; border:1px solid var(--w-line);
  transition:border-color .12s, box-shadow .12s;
}
.w-input:hover{ border-color:#94A3B8; }
.w-input:focus-within{ border-color:var(--w-brand); box-shadow:0 0 0 3px rgba(200,16,46,.12); }

/* chips */
.w-chip{
  background:#FFFFFF; border:1px solid var(--w-line); font-weight:500;
  transition:background .12s, border-color .12s;
}
.w-chip:hover{ background:#F8FAFC; border-color:#94A3B8; }
.w-chip.solid{
  background:rgba(200,16,46,.08); border-color:rgba(200,16,46,.18);
  color:var(--w-brand); font-weight:600;
}

/* badges (status pills) */
.w-badge{ background:#F1F5F9; border:1px solid #E2E8F0; color:#475569; font-weight:600; }
.w-badge.ok   { background:rgba(16,185,129,.08); border-color:rgba(16,185,129,.18); color:#047857; }
.w-badge.warn { background:rgba(245,158,11,.10); border-color:rgba(245,158,11,.22); color:#B45309; }
.w-badge.err  { background:rgba(239,68,68,.08);  border-color:rgba(239,68,68,.20); color:#B91C1C; }
.w-badge.ok .led   { background:#10B981; }
.w-badge.warn .led { background:#F59E0B; }
.w-badge.err .led  { background:#EF4444; }

/* tables */
.w-table th{
  background:#F8FAFC; color:#64748B; font-weight:600;
  font-size:11px; letter-spacing:.04em; text-transform:uppercase;
  border-bottom:1px solid var(--w-line);
}
.w-table td{ border-bottom:1px solid #F1F5F9; }
.w-table tr:hover td{ background:#F8FAFC; }

/* progress meter */
.w-meter{ background:#F1F5F9; border-radius:999px; }
.w-meter > i{ background:linear-gradient(90deg, var(--w-brand), #EF7D00); border-radius:999px; }
.w-meter.warn > i{ background:linear-gradient(90deg, #F59E0B, #FB923C); }
.w-meter.full > i{ background:linear-gradient(90deg, #EF4444, #DC2626); }

/* stat cards */
.w-stat{
  border:1px solid var(--w-line); border-radius:12px;
  box-shadow:0 1px 2px rgba(15,23,42,.04);
  padding:14px 16px;
}
.w-stat .num{ color:var(--w-ink); }
.w-stat .lbl{ color:#64748B; }

/* chart */
.w-chart{ background:#FFFFFF; border-color:var(--w-line); border-radius:10px; }
.w-chart .bar{
  background:linear-gradient(180deg, #FFB7C4, #C8102E);
  border-radius:4px 4px 0 0;
}

/* divider */
.divider{ background:#F1F5F9; }

/* ============================================================
 * MODE: CMS (admin, npp)
 * Drop the simulated browser chrome — real CMS fills viewport.
 * ============================================================ */
.hifi.mode-cms .w-browser{
  width:100% !important; border-radius:0;
  box-shadow:none; background:#FFFFFF;
}
.hifi.mode-cms .w-browser-bar{ display:none; }
.hifi.mode-cms .cms{ height:100vh; }
.hifi.mode-cms .cms-side{
  background:#FFFFFF; border-right:1px solid var(--w-line);
  padding:14px 8px;
}
.hifi.mode-cms .cms-side .logo{
  padding:6px 10px 14px;
  border-bottom:1px solid #F1F5F9;
  margin-bottom:6px;
}
.hifi.mode-cms .cms-side .logo .mk{
  background:linear-gradient(135deg, #C8102E, #8B0E22);
  box-shadow:0 2px 6px rgba(200,16,46,.25);
  border:none; border-radius:8px;
}
.hifi.mode-cms .cms-nav{
  padding:9px 11px; border-radius:8px; margin:1px 4px;
  transition:background .12s, color .12s;
}
.hifi.mode-cms .cms-nav:hover{ background:#F8FAFC; color:var(--w-ink); }
.hifi.mode-cms .cms-nav.active{
  background:rgba(200,16,46,.08); color:var(--w-brand);
  font-weight:600; box-shadow:none;
}
.hifi.mode-cms .cms-nav.active .ci{
  background:#FFFFFF; border-color:var(--w-brand);
  box-shadow:0 0 0 2px rgba(200,16,46,.15);
}
.hifi.mode-cms .cms-topbar{
  height:60px; padding:0 28px; background:#FFFFFF;
  box-shadow:0 1px 0 rgba(15,23,42,.04);
}
.hifi.mode-cms .cms-content{ padding:24px 28px 80px; background:#F8FAFC; }
.hifi.mode-cms .cms-pagetitle{
  font-size:22px; font-weight:700; color:var(--w-ink); letter-spacing:-.01em;
}

/* Login pages (centered card inside Browser, no Cms) — fill viewport */
.hifi.mode-cms .w-browser > div[style*="height:760"],
.hifi.mode-cms .w-browser > div[style*="height: 760"]{
  height:100vh !important;
}

/* ============================================================
 * MODE: MINI APP (shop, sales)
 * Phone frame on a soft branded canvas.
 * ============================================================ */
.hifi.mode-mobile .wf-stage-pad{
  display:flex; align-items:flex-start; justify-content:center;
  padding:32px 16px 80px; min-height:100vh;
  background:
    radial-gradient(ellipse 80% 60% at 50% 0%, #FDE2E5 0%, transparent 60%),
    linear-gradient(180deg, #EEF2F7, #E2E8F0);
}
.hifi.mode-mobile .w-phone{
  box-shadow:
    0 28px 70px rgba(15,23,42,.18),
    0 10px 24px rgba(15,23,42,.10);
}
/* Hide the dev notes (".tt — Trên web · desktop") that the npp loyalty
   web/mobile dual-view emits — those are wireframe annotations. */
.hifi.mode-cms .tt:first-child + .w-browser{ /* tighten spacing */ }

/* ============================================================
 * FLOATING SCREEN PICKER (demo navigation)
 * ============================================================ */
.hf-pick-btn{
  position:fixed; right:18px; bottom:18px; z-index:1000;
  display:inline-flex; align-items:center; gap:9px;
  padding:11px 18px; max-width:calc(100vw - 36px);
  background:#0F172A; color:#FFFFFF; border:none; border-radius:999px;
  font:600 13px/1 var(--w-font); cursor:pointer;
  box-shadow:0 8px 22px rgba(15,23,42,.28), 0 3px 6px rgba(15,23,42,.16);
  transition:transform .12s, box-shadow .12s;
}
.hf-pick-btn:hover{ transform:translateY(-1px); box-shadow:0 10px 26px rgba(15,23,42,.32), 0 4px 8px rgba(15,23,42,.18); }
.hf-pick-btn .hf-dot{
  width:8px; height:8px; background:#4ADE80; border-radius:50%;
  box-shadow:0 0 0 3px rgba(74,222,128,.25);
}
.hf-pick-btn .hf-meta{ opacity:.55; font-weight:500; font-size:11.5px; }
.hf-pick-panel{
  position:fixed; right:18px; bottom:72px; z-index:1000;
  width:330px; max-height:74vh;
  background:#FFFFFF; border:1px solid var(--w-line); border-radius:14px;
  box-shadow:0 24px 60px rgba(15,23,42,.22), 0 8px 20px rgba(15,23,42,.10);
  display:flex; flex-direction:column; overflow:hidden;
}
.hf-pick-head{
  display:flex; align-items:center; justify-content:space-between;
  padding:12px 14px; border-bottom:1px solid #F1F5F9;
}
.hf-pick-head b{ font-size:13px; font-weight:700; color:var(--w-ink); }
.hf-pick-head a{ font-size:12px; color:var(--w-ink-3); text-decoration:none; }
.hf-pick-head a:hover{ color:var(--w-brand); }
.hf-pick-list{ overflow-y:auto; padding:6px; }
.hf-pick-group{
  font-size:10.5px; font-weight:700; letter-spacing:.12em;
  text-transform:uppercase; color:var(--w-ink-3);
  padding:10px 10px 4px;
}
.hf-pick-item{
  display:flex; align-items:center; gap:10px; width:100%;
  padding:8px 10px; background:none; border:none; border-radius:7px;
  text-align:left; font:500 12.5px/1.35 var(--w-font);
  color:var(--w-ink-2); cursor:pointer;
  transition:background .12s, color .12s;
}
.hf-pick-item:hover{ background:#F8FAFC; color:var(--w-ink); }
.hf-pick-item.active{
  background:rgba(200,16,46,.08); color:var(--w-brand); font-weight:600;
}
.hf-pick-num{
  flex:none; width:22px; height:22px; border-radius:50%;
  background:#F1F5F9; border:1px solid var(--w-line);
  font-size:10.5px; font-weight:700;
  display:flex; align-items:center; justify-content:center;
  color:var(--w-ink-3);
}
.hf-pick-item.active .hf-pick-num{
  background:var(--w-brand); border-color:var(--w-brand); color:#FFFFFF;
}
`;

// 4. Custom shell — drops wireframe rail/topbar, adds floating picker.
const hiFiAppJs = `
function HiFiApp({ mode, role, title, sub, screens, defaultId }){
  const ids = screens.map(s => s.id);
  const first = defaultId || ids[0];
  const read = () => {
    const h = decodeURIComponent((location.hash||'').replace(/^#/,''));
    if(h && ids.includes(h)) return h;
    return first;
  };
  const [cur, setCur] = useState(read);
  const [open, setOpen] = useState(false);

  const go = useCallback((id) => {
    if(id === 'home'){ location.href = '../'; return; }
    if(!ids.includes(id)){ console.warn('no screen', id); return; }
    setCur(id);
    location.hash = encodeURIComponent(id);
    window.scrollTo(0,0);
  }, []);

  useEffect(() => { WF.go = go; }, [go]);
  useEffect(() => {
    // Reflect the current screen in the URL on first load so bookmarking
    // and link-sharing always show the explicit entry point (e.g. /npp/
    // → /npp/#npp-login). replaceState avoids a history entry + does NOT
    // fire hashchange, so listeners don't double-trigger.
    const currentHash = decodeURIComponent((location.hash||'').replace(/^#/,''));
    if (!currentHash && cur) {
      try { history.replaceState(null, '', '#' + encodeURIComponent(cur)); } catch (e) {}
    }
  }, []);
  useEffect(() => {
    const on = () => {
      const h = decodeURIComponent((location.hash||'').replace(/^#/,''));
      if(h && ids.includes(h)) setCur(h);
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);

  // group by .group field for the picker
  const groups = [];
  screens.forEach(s => {
    let g = groups.find(x => x.name === (s.group||''));
    if(!g){ g = { name:s.group||'', items:[] }; groups.push(g); }
    g.items.push(s);
  });

  const screen = screens.find(s => s.id === cur) || screens[0];
  const idx = screens.indexOf(screen) + 1;

  const hasBus = typeof LoyaltyState !== 'undefined';
  const hasToast = typeof LoyaltyToast === 'function';
  // Render the screen as a proper React component (not a function call) so
  // hooks inside it get their own per-screen state. The key forces an
  // unmount/remount on navigation — important for screens that compute
  // something fresh on mount (e.g. shop scan-success records a new scan).
  const ScreenComp = screen.render;

  return (
    <div className={cx('wf-shell hifi', 'mode-' + mode)}>
      <div className="wf-stage">
        <div className="wf-stage-pad"><ScreenComp key={screen.id} /></div>
      </div>

      <button className="hf-pick-btn" onClick={() => setOpen(o => !o)} title="Đổi màn demo">
        <span className="hf-dot" />
        <span>{screen.title}</span>
        <span className="hf-meta">· {idx}/{screens.length}</span>
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)}
            style={{position:'fixed', inset:0, zIndex:999, background:'transparent'}} />
          <div className="hf-pick-panel">
            <div className="hf-pick-head">
              <b>{role}</b>
              <div className="r g8" style={{alignItems:'center'}}>
                {hasBus && (
                  <button className="hf-reset-btn"
                    onClick={() => { LoyaltyState.reset(); }}
                    title="Reset demo points & history">↻ Reset demo</button>
                )}
                <a href="../">‹ Tất cả role</a>
              </div>
            </div>
            <div className="hf-pick-list">
              {groups.map((g, gi) => (
                <div key={gi}>
                  {g.name && <div className="hf-pick-group">{g.name}</div>}
                  {g.items.map(s => {
                    const n = screens.indexOf(s) + 1;
                    return (
                      <button key={s.id}
                        className={cx('hf-pick-item', s.id === cur && 'active')}
                        onClick={() => { go(s.id); setOpen(false); }}>
                        <span className="hf-pick-num">{n}</span>
                        <span>{s.title}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {hasToast && <LoyaltyToast />}
    </div>
  );
}
`;

// 5a. Shared scan UI — used by NPP (web-view) and Shop (mini-app).
//     CSS for dark scanner viewport with corner brackets + animated scanline,
//     plus illustration helpers (procedural fake-QR, Idemitsu oil bottle,
//     success/error badges).
const scanCss = `
/* hi-fi scanner viewport */
.hf-scanview{
  position:relative; width:100%; height:360px;
  background:radial-gradient(ellipse at center, #1F2937 0%, #0B1220 85%), #0B1220;
  border-radius:18px; overflow:hidden;
  display:flex; align-items:center; justify-content:center;
  box-shadow:inset 0 0 80px rgba(0,0,0,.55), 0 10px 30px rgba(15,23,42,.18);
}
.hf-scanview::before{
  content:''; position:absolute; inset:0; pointer-events:none;
  background:
    radial-gradient(ellipse at 20% 10%, rgba(99,102,241,.10), transparent 55%),
    radial-gradient(ellipse at 85% 90%, rgba(236,72,153,.08), transparent 55%);
}
.hf-scan-target{
  position:relative; width:min(220px, 60%); aspect-ratio:1;
}
.hf-scan-corner{
  position:absolute; width:28px; height:28px; border:3px solid #fff;
  filter:drop-shadow(0 0 6px rgba(255,255,255,.35));
}
.hf-scan-corner.tl{ top:-3px; left:-3px; border-right:none; border-bottom:none; border-radius:10px 0 0 0; }
.hf-scan-corner.tr{ top:-3px; right:-3px; border-left:none; border-bottom:none; border-radius:0 10px 0 0; }
.hf-scan-corner.bl{ bottom:-3px; left:-3px; border-right:none; border-top:none; border-radius:0 0 0 10px; }
.hf-scan-corner.br{ bottom:-3px; right:-3px; border-left:none; border-top:none; border-radius:0 0 10px 0; }
.hf-qr-wrap{
  position:absolute; inset:18px; background:#FFFFFF;
  border-radius:6px; padding:12px; overflow:hidden;
  box-shadow:0 8px 24px rgba(0,0,0,.4);
}
.hf-qr-wrap > svg{ display:block; width:100%; height:100%; }
.hf-scanline{
  position:absolute; left:8px; right:8px; height:2px;
  background:linear-gradient(90deg, transparent, #FF4757 20%, #FFB3BC 50%, #FF4757 80%, transparent);
  box-shadow:0 0 14px rgba(255,71,87,.85), 0 0 30px rgba(255,71,87,.4);
  animation:hf-scan 2s ease-in-out infinite;
  pointer-events:none; z-index:3;
}
@keyframes hf-scan{
  0%, 100% { top:4px; opacity:0; }
  10%, 90% { opacity:1; }
  50% { top:calc(100% - 6px); }
}
.hf-scan-hint{
  position:absolute; bottom:14px; left:50%; transform:translateX(-50%);
  display:inline-flex; align-items:center; gap:6px;
  background:rgba(15,23,42,.55); color:#fff; font:600 11px/1 var(--w-font);
  padding:7px 13px; border-radius:999px; backdrop-filter:blur(8px);
}
.hf-scan-hint .led{ width:6px; height:6px; border-radius:50%; background:#4ADE80; box-shadow:0 0 0 3px rgba(74,222,128,.25); }

/* success / error big badges */
.hf-badge{
  position:relative; width:120px; height:120px; flex:none;
}
.hf-badge .halo{
  position:absolute; inset:0; border-radius:50%;
  background:radial-gradient(circle, var(--c1) 0%, transparent 70%);
  opacity:.35;
}
.hf-badge .core{
  position:absolute; inset:18px; border-radius:50%;
  background:linear-gradient(135deg, var(--c0), var(--c1));
  display:flex; align-items:center; justify-content:center;
  box-shadow:0 14px 30px var(--c-shadow);
}
.hf-badge .spark{
  position:absolute; width:8px; height:8px; border-radius:50%;
  background:#FBBF24; box-shadow:0 0 10px rgba(251,191,36,.65);
}
.hf-badge.ok{ --c0:#34D399; --c1:#10B981; --c-shadow:rgba(16,185,129,.35); }
.hf-badge.err{ --c0:#FB7185; --c1:#EF4444; --c-shadow:rgba(239,68,68,.35); }

/* product card with bottle */
.hf-bottle{ display:block; flex:none; }

/* details mono key */
.hf-mono{ font-family:ui-monospace, "SF Mono", Menlo, Consolas, monospace; font-weight:600; }
`;

const scanIllusJs = `
/* ----- Hi-fi illustrations (shared by NPP + Shop scan screens) ----- */
function HfQrPattern(){
  const SIZE = 21;
  const cells = [];
  const finder = (sx, sy) => {
    for (let y=0; y<7; y++) for (let x=0; x<7; x++) {
      const v = (y===0||y===6||x===0||x===6) || (y>=2&&y<=4&&x>=2&&x<=4);
      if (v) cells.push([sx+x, sy+y]);
    }
  };
  finder(0, 0); finder(14, 0); finder(0, 14);
  // timing pattern
  for (let i=8; i<13; i++) {
    if (i % 2 === 0) { cells.push([i, 6]); cells.push([6, i]); }
  }
  // pseudo-random data modules (deterministic seed)
  let s = 42;
  const rng = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  for (let y=0; y<SIZE; y++) for (let x=0; x<SIZE; x++) {
    if ((x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12)) continue;
    if (x === 6 || y === 6) continue;
    if (rng() < 0.46) cells.push([x, y]);
  }
  return (
    <svg viewBox={\`0 0 \${SIZE} \${SIZE}\`} shapeRendering="crispEdges">
      <rect width={SIZE} height={SIZE} fill="#fff"/>
      {cells.map(([x,y], i) => <rect key={i} x={x} y={y} width="1" height="1" fill="#0F172A"/>)}
    </svg>
  );
}

function HfOilBottle({size = 56, label = 'Zepro'}){
  const id = 'hfob-' + label;
  return (
    <svg className="hf-bottle" viewBox="0 0 64 80" width={size} height={size * 80/64}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EF4444"/>
          <stop offset="60%" stopColor="#C8102E"/>
          <stop offset="100%" stopColor="#7A0A1C"/>
        </linearGradient>
      </defs>
      <rect x="22" y="4" width="20" height="9" fill="#1F2937" rx="2"/>
      <rect x="25" y="13" width="14" height="6" fill="#0F172A"/>
      <path d="M10 26 Q10 19 16 19 L48 19 Q54 19 54 26 L54 72 Q54 76 50 76 L14 76 Q10 76 10 72 Z" fill={\`url(#\${id})\`}/>
      <rect x="14" y="36" width="36" height="24" fill="rgba(255,255,255,.94)" rx="2"/>
      <text x="32" y="46" textAnchor="middle" fontSize="6.4" fontWeight="800" fill="#C8102E" fontFamily="Inter, sans-serif">IDEMITSU</text>
      <text x="32" y="55" textAnchor="middle" fontSize="5.4" fontWeight="700" fill="#0F172A" fontFamily="Inter, sans-serif">{label}</text>
      <rect x="13" y="22" width="3" height="50" fill="rgba(255,255,255,.18)" rx="1.5"/>
      <rect x="48" y="22" width="2" height="50" fill="rgba(0,0,0,.15)" rx="1"/>
    </svg>
  );
}

function HfSuccessBadge(){
  return (
    <div className="hf-badge ok">
      <div className="halo" />
      <div className="core">
        <svg viewBox="0 0 24 24" width="52%" height="52%" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 13l4 4L19 7"/>
        </svg>
      </div>
      <span className="spark" style={{top:'8%', left:'14%'}} />
      <span className="spark" style={{top:'12%', right:'8%', width:6, height:6}} />
      <span className="spark" style={{bottom:'10%', left:'6%', width:7, height:7}} />
      <span className="spark" style={{bottom:'14%', right:'14%'}} />
      <span className="spark" style={{top:'-2%', left:'48%', width:5, height:5}} />
    </div>
  );
}

function HfErrorBadge(){
  return (
    <div className="hf-badge err">
      <div className="halo" />
      <div className="core">
        <svg viewBox="0 0 24 24" width="52%" height="52%" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 6l12 12 M18 6l-12 12"/>
        </svg>
      </div>
    </div>
  );
}

`;

// 5b. NPP-specific scan renders (use existing nLoy dual-view)
const nppScanJs = `
function nScanWebHiFi(){
  return nLoy('Quét QR sản phẩm', 1, 'npp-rewards',
    <div style={{padding:'20px 16px', display:'flex', flexDirection:'column', gap:18}}>
      <div className="r between wrap g8" style={{padding:'0 2px'}}>
        <div className="c g4">
          <div style={{fontSize:16, fontWeight:700, color:'#0F172A'}}>Quét tem QR sản phẩm</div>
          <span className="t11 muted">Zepro · Touring · Diesel — mỗi tem chỉ tích 1 lần</span>
        </div>
        <span className="w-badge ok"><i className="led" />Camera đã bật</span>
      </div>

      <div className="hf-scanview">
        <div className="hf-scan-target">
          <span className="hf-scan-corner tl" />
          <span className="hf-scan-corner tr" />
          <span className="hf-scan-corner bl" />
          <span className="hf-scan-corner br" />
          <div className="hf-qr-wrap">
            <HfQrPattern />
            <div className="hf-scanline" />
          </div>
        </div>
        <span className="hf-scan-hint"><span className="led" />Đặt tem QR vào khung</span>
      </div>

      <div className="w-card r g12" style={{padding:12, alignItems:'center'}}>
        <HfOilBottle size={44} label="Zepro" />
        <div className="grow c g4">
          <b className="t13">Tem QR nằm trên thân chai</b>
          <span className="t11 muted">Quét hợp lệ → cộng điểm sản phẩm cho cửa hàng và <b>cross-award</b> cho NPP.</span>
        </div>
      </div>

      <div className="r g10 wrap">
        <Btn block ghost to="npp-scan-web-upload-error">Mô phỏng · Mã lỗi</Btn>
        <Btn block to="npp-scan-web-success">Mô phỏng · Quét OK</Btn>
      </div>
    </div>
  );
}

function nScanWebSuccessHiFi(){
  return nLoy('Quét thành công', null, 'npp-scan-web',
    <div style={{padding:'24px 16px 28px', display:'flex', flexDirection:'column', gap:18, alignItems:'center'}}>
      <HfSuccessBadge />
      <div className="center-text">
        <div style={{fontSize:30, fontWeight:800, color:'#10B981', letterSpacing:'-.02em', lineHeight:1.1}}>+10 điểm</div>
        <div className="t12 muted" style={{marginTop:6}}>Đã ghi nhận vào tài khoản NPP</div>
      </div>

      <div className="w-card r g14" style={{padding:14, width:'100%', maxWidth:440, alignItems:'center'}}>
        <HfOilBottle size={56} label="Zepro" />
        <div className="grow c g6">
          <b className="t13">Idemitsu Zepro 0W-20</b>
          <span className="t11 muted">SKU · IDMT-B0098 · 1L</span>
          <div className="r g6"><span className="w-chip" style={{height:22, fontSize:11}}>Synthetic</span><span className="w-chip solid" style={{height:22, fontSize:11}}>+10 điểm</span></div>
        </div>
      </div>

      <div className="w-box c g10" style={{padding:14, width:'100%', maxWidth:440}}>
        <div className="r between t12"><span className="muted">Mã QR</span><b className="hf-mono">IDMT-B0098-0001a4</b></div>
        <div className="r between t12"><span className="muted">Thời gian</span><b>28/05 · 09:12</b></div>
        <Divider />
        <div className="r between t12"><span className="muted">Điểm sản phẩm</span><b style={{color:'#10B981'}}>+10 điểm</b></div>
        <div className="r between t12"><span className="muted">Cross-award NPP</span><b style={{color:'#10B981'}}>+1 điểm</b></div>
      </div>

      <div className="r g10" style={{width:'100%', maxWidth:440}}>
        <Btn block ghost to="npp-loy-history">Xem lịch sử</Btn>
        <Btn block to="npp-scan-web">Quét tiếp</Btn>
      </div>
    </div>
  );
}

function nScanWebUploadErrorHiFi(){
  return nLoy('Không hợp lệ', null, 'npp-scan-web',
    <div style={{padding:'24px 16px 28px', display:'flex', flexDirection:'column', gap:18, alignItems:'center'}}>
      <HfErrorBadge />
      <div className="center-text">
        <div style={{fontSize:20, fontWeight:700, color:'#DC2626'}}>Mã QR không hợp lệ</div>
        <div className="t12 muted" style={{marginTop:6, maxWidth:340}}>Tem này đã được tính điểm trước đó hoặc không thuộc sản phẩm Idemitsu.</div>
      </div>

      <div className="w-card c g10" style={{padding:14, width:'100%', maxWidth:440}}>
        <div className="t11 muted">Các trường hợp thường gặp</div>
        {[
          'Mã không thuộc sản phẩm Idemitsu',
          'Tem đã được quét trước đó (1 tem · 1 lần)',
          'Ảnh QR mờ / khung quét thiếu sáng',
        ].map((txt, i) => (
          <div key={i} className="r g10" style={{alignItems:'center'}}>
            <span style={{width:26, height:26, borderRadius:'50%', background:'#FEF3C7', color:'#B45309', display:'flex', alignItems:'center', justifyContent:'center', flex:'none', fontSize:13, fontWeight:700}}>!</span>
            <span className="t12">{txt}</span>
          </div>
        ))}
      </div>

      <div className="r g10" style={{width:'100%', maxWidth:440}}>
        <Btn block ghost to="npp-rewards">Về trang chủ</Btn>
        <Btn block to="npp-scan-web">Quét lại</Btn>
      </div>
    </div>
  );
}

/* mutate NPP_SCREENS so the picker + router pick up the new renders */
(function(){
  const map = { 'npp-scan-web':nScanWebHiFi, 'npp-scan-web-success':nScanWebSuccessHiFi, 'npp-scan-web-upload-error':nScanWebUploadErrorHiFi };
  for (const s of NPP_SCREENS) { if (map[s.id]) s.render = map[s.id]; }
})();
`;

// 5c. Shop-specific scan renders (Zalo Mini App style — single phone frame)
const shopScanJs = `
function sScanHiFi(){
  return SPhone({ title:null, nav:null, scroll:false, body:
    <div className="c" style={{height:'100%'}}>
      <div className="w-zalo-bar">
        <span className="muted" data-hot onClick={()=>WF.go('shop-home')} style={{fontSize:18, width:54}}>‹</span>
        <span className="ztitle">Quét QR sản phẩm</span>
        <span style={{width:54}}/>
      </div>
      <div style={{flex:1, padding:14, display:'flex', flexDirection:'column', gap:12, minHeight:0}}>
        <div className="hf-scanview" style={{height:'auto', flex:1, minHeight:260}}>
          <div className="hf-scan-target">
            <span className="hf-scan-corner tl" />
            <span className="hf-scan-corner tr" />
            <span className="hf-scan-corner bl" />
            <span className="hf-scan-corner br" />
            <div className="hf-qr-wrap">
              <HfQrPattern />
              <div className="hf-scanline" />
            </div>
          </div>
          <span className="hf-scan-hint"><span className="led"/>Đặt tem QR vào khung</span>
        </div>
        <div className="w-card r g10" style={{padding:10, alignItems:'center'}}>
          <HfOilBottle size={40} label="Zepro" />
          <div className="grow c g4">
            <b className="t12">Tem QR trên thân chai Idemitsu</b>
            <span className="t11 muted">Quét hợp lệ → cộng điểm vào tài khoản shop</span>
          </div>
        </div>
        <div className="r g10">
          <Btn block ghost to="shop-scan-error">Mô phỏng · Lỗi</Btn>
          <Btn block to="shop-scan-success">Mô phỏng · OK</Btn>
        </div>
      </div>
    </div>
  });
}

function sScanSuccessHiFi(){
  // Pick a random product, record the scan (emits to the loyalty bus so NPP
  // tab updates real-time), and use that data for display.
  const [scan] = useState(() => {
    const p = (typeof pickRandomProduct === 'function') ? pickRandomProduct() : { name:'Idemitsu Zepro 0W-20', sku:'IDMT-B0098', shopPts:10, nppPts:5 };
    const qr = (typeof mockQrFor === 'function') ? mockQrFor(p.sku) : p.sku + '-' + Math.random().toString(16).slice(2,8);
    if (typeof LoyaltyState !== 'undefined') {
      LoyaltyState.recordScan('shop-scan', p.name, qr, p.shopPts, p.nppPts);
    }
    return { ...p, qr, time: Date.now() };
  });
  const balance = (typeof LoyaltyState !== 'undefined') ? LoyaltyState.shopPoints : (5000 + scan.shopPts);
  const shortLabel = scan.name.replace(/^Idemitsu\\s+/, '').split(' ')[0];

  return SPhone({ title:null, nav:null, scroll:false, body:
    <div className="c" style={{height:'100%'}}>
      <div className="w-zalo-bar">
        <span style={{width:54}}/>
        <span className="ztitle">Thành công</span>
        <span className="muted" data-hot onClick={()=>WF.go('shop-home')} style={{fontSize:16, width:54, textAlign:'right', cursor:'pointer'}}>✕</span>
      </div>
      <div style={{flex:1, overflowY:'auto', padding:'20px 16px', display:'flex', flexDirection:'column', gap:14, alignItems:'center'}}>
        <HfSuccessBadge />
        <div className="center-text">
          <div style={{fontSize:30, fontWeight:800, color:'#10B981', letterSpacing:'-.02em', lineHeight:1.1}}>+{scan.shopPts} điểm</div>
          <div className="t12 muted" style={{marginTop:6}}>Đã cộng vào tài khoản · còn {fmtNum(balance)}</div>
        </div>

        <div className="w-card r g12" style={{padding:12, width:'100%', alignItems:'center'}}>
          <HfOilBottle size={48} label={shortLabel} />
          <div className="grow c g4">
            <b className="t13">{scan.name}</b>
            <span className="t11 muted">SKU · {scan.sku} · 1L</span>
            <div className="r g6">
              <span className="w-chip solid" style={{height:22, fontSize:11}}>Shop +{scan.shopPts}</span>
              <span className="w-chip" style={{height:22, fontSize:11, background:'#ECFDF5', borderColor:'#A7F3D0', color:'#047857'}}>NPP +{scan.nppPts}</span>
            </div>
          </div>
        </div>

        <div className="w-box fill-w c g10" style={{padding:14}}>
          <div className="r between t12"><span className="muted">Mã QR</span><b className="hf-mono">{scan.qr}</b></div>
          <div className="r between t12"><span className="muted">Thời gian</span><b>{formatHM(scan.time)}</b></div>
          <div className="r between t12"><span className="muted">Cross-award NPP</span><b style={{color:'#10B981'}}>+{scan.nppPts} điểm</b></div>
          <Divider/>
          <div className="r between t12"><span className="muted">Số dư shop hiện tại</span><b>{fmtNum(balance)} điểm</b></div>
        </div>
      </div>
      <div style={{padding:12, background:'#fff', borderTop:'1px solid #F1F5F9'}}>
        <div className="r g10">
          <Btn block ghost to="shop-history">Lịch sử</Btn>
          <Btn block to="shop-scan">Quét tiếp</Btn>
        </div>
      </div>
    </div>
  });
}

function sScanErrorHiFi(){
  return SPhone({ title:null, nav:null, scroll:false, body:
    <div className="c" style={{height:'100%'}}>
      <div className="w-zalo-bar">
        <span className="muted" data-hot onClick={()=>WF.go('shop-scan')} style={{fontSize:18, width:54, cursor:'pointer'}}>‹</span>
        <span className="ztitle">Không hợp lệ</span>
        <span style={{width:54}}/>
      </div>
      <div style={{flex:1, overflowY:'auto', padding:'20px 16px', display:'flex', flexDirection:'column', gap:14, alignItems:'center'}}>
        <HfErrorBadge />
        <div className="center-text">
          <div style={{fontSize:20, fontWeight:700, color:'#DC2626'}}>Mã QR đã được quét</div>
          <div className="t12 muted" style={{marginTop:6}}>Tem này đã tính điểm trước đó. Mỗi tem chỉ dùng một lần.</div>
        </div>

        <div className="w-card fill-w c g10" style={{padding:14}}>
          <div className="t11 muted">Các lỗi thường gặp</div>
          {[
            'Mã không thuộc sản phẩm Idemitsu',
            'Tem đã bị quét bởi shop khác',
            'Ảnh QR mờ / không đọc được',
          ].map((txt, i) => (
            <div key={i} className="r g10" style={{alignItems:'center'}}>
              <span style={{width:26, height:26, borderRadius:'50%', background:'#FEF3C7', color:'#B45309', display:'flex', alignItems:'center', justifyContent:'center', flex:'none', fontSize:13, fontWeight:700}}>!</span>
              <span className="t12">{txt}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{padding:12, background:'#fff', borderTop:'1px solid #F1F5F9'}}>
        <Btn block to="shop-scan">Quét lại</Btn>
      </div>
    </div>
  });
}

/* mutate SHOP_SCREENS so the picker + router pick up the new renders */
(function(){
  const map = { 'shop-scan':sScanHiFi, 'shop-scan-success':sScanSuccessHiFi, 'shop-scan-error':sScanErrorHiFi };
  for (const s of SHOP_SCREENS) { if (map[s.id]) s.render = map[s.id]; }
})();
`;

// 5d. Realtime cross-tab loyalty bus — shared by NPP and Shop.
//     • localStorage persists state; BroadcastChannel pushes events live;
//     • storage event handles browsers without BroadcastChannel.
//     • Shop scan → both shop & NPP points update; NPP tab sees it real-time.
const loyaltyBusJs = `
const { useRef } = React;

const LOY_KEY = 'idemitsu-loyalty-demo-v1';
const LOY_BUS = (typeof BroadcastChannel !== 'undefined') ? new BroadcastChannel(LOY_KEY) : null;
const LOY_BASELINE = { nppPoints: 9842, shopPoints: 5000 };

const LoyaltyState = {
  nppPoints: LOY_BASELINE.nppPoints,
  shopPoints: LOY_BASELINE.shopPoints,
  history: [],
  listeners: new Set(),

  load() {
    try {
      const s = JSON.parse(localStorage.getItem(LOY_KEY) || 'null');
      if (s) {
        if (typeof s.nppPoints === 'number') this.nppPoints = s.nppPoints;
        if (typeof s.shopPoints === 'number') this.shopPoints = s.shopPoints;
        if (Array.isArray(s.history)) this.history = s.history;
      }
    } catch (e) {}
  },
  save() {
    try {
      localStorage.setItem(LOY_KEY, JSON.stringify({
        nppPoints: this.nppPoints,
        shopPoints: this.shopPoints,
        history: this.history,
      }));
    } catch (e) {}
  },
  subscribe(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); },
  emit() { for (const fn of this.listeners) fn(this); },

  recordScan(source, product, qr, shopPts, nppPts) {
    const entry = { source, product, qr, time: Date.now(), shopPts, nppPts };
    this.shopPoints += shopPts;
    this.nppPoints  += nppPts;
    this.history.unshift(entry);
    if (this.history.length > 100) this.history.length = 100;
    this.save();
    this.emit();
    if (LOY_BUS) LOY_BUS.postMessage({ kind: 'scan', entry });
  },
  reset() {
    this.nppPoints = LOY_BASELINE.nppPoints;
    this.shopPoints = LOY_BASELINE.shopPoints;
    this.history = [];
    this.save();
    this.emit();
    if (LOY_BUS) LOY_BUS.postMessage({ kind: 'reset' });
  },
};
LoyaltyState.load();

if (LOY_BUS) {
  LOY_BUS.onmessage = (e) => {
    if (!e.data) return;
    if (e.data.kind === 'scan') {
      LoyaltyState.shopPoints += e.data.entry.shopPts;
      LoyaltyState.nppPoints  += e.data.entry.nppPts;
      LoyaltyState.history.unshift(e.data.entry);
      if (LoyaltyState.history.length > 100) LoyaltyState.history.length = 100;
      LoyaltyState.save();
      LoyaltyState.emit();
    } else if (e.data.kind === 'reset') {
      LoyaltyState.nppPoints  = LOY_BASELINE.nppPoints;
      LoyaltyState.shopPoints = LOY_BASELINE.shopPoints;
      LoyaltyState.history    = [];
      LoyaltyState.save();
      LoyaltyState.emit();
    }
  };
}
// Fallback for browsers without BroadcastChannel only — if both BC and
// storage event fire, we'd apply the same scan twice (BC += delta, then
// storage overwrites with saved value, which could double-count depending
// on event order).
if (!LOY_BUS) {
  window.addEventListener('storage', (ev) => {
    if (ev.key !== LOY_KEY || !ev.newValue) return;
    try {
      const s = JSON.parse(ev.newValue);
      LoyaltyState.nppPoints  = s.nppPoints;
      LoyaltyState.shopPoints = s.shopPoints;
      LoyaltyState.history    = s.history || [];
      LoyaltyState.emit();
    } catch (e) {}
  });
}

function useLoyaltyState() {
  const [, force] = useState(0);
  useEffect(() => LoyaltyState.subscribe(() => force(t => t + 1)), []);
  return LoyaltyState;
}

function useAnimatedNumber(target) {
  const [val, setVal] = useState(target);
  const rafRef = useRef(null);
  const startRef = useRef(target);
  useEffect(() => {
    if (val === target) { startRef.current = target; return; }
    const start = startRef.current;
    const delta = target - start;
    const dur = 700;
    const t0 = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(start + delta * eased));
      if (t < 1) rafRef.current = requestAnimationFrame(step);
      else startRef.current = target;
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target]);
  return val;
}

// Product catalog used by the demo. Shop:NPP ratio is 2:1 (NPP = 0.5 × shop).
const SCAN_PRODUCTS = [
  { name: 'Idemitsu Zepro 0W-20',  sku: 'IDMT-B0098', shopPts: 10, nppPts: 5 },
  { name: 'Idemitsu Touring 5W-30', sku: 'IDMT-B0102', shopPts: 8,  nppPts: 4 },
  { name: 'Idemitsu Diesel 15W-40', sku: 'IDMT-B0105', shopPts: 12, nppPts: 6 },
];
function pickRandomProduct() {
  return SCAN_PRODUCTS[Math.floor(Math.random() * SCAN_PRODUCTS.length)];
}
function mockQrFor(sku) {
  return sku + '-' + Math.random().toString(16).slice(2, 8);
}
function formatHM(ts) {
  const d = new Date(ts);
  return String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
}
// Reliable integer formatter — avoids Intl/locale quirks (some Chrome
// builds render '9.842' as '9.8420' under vi-VN with non-integer values).
function fmtNum(n) {
  return String(Math.round(Number(n) || 0)).replace(/\\B(?=(\\d{3})+(?!\\d))/g, '.');
}
`;

// 5e. NPP-only realtime overrides — toast + live Loyalty home + history.
const nppLoyaltyCss = `
/* live points hero */
.hf-points-hero{
  padding:20px 18px;
  background:linear-gradient(135deg, #FFF1F1 0%, #FFFFFF 70%);
  border:1px solid #FECDD3 !important;
  border-radius:14px;
  position:relative; overflow:hidden;
}
.hf-points-hero::before{
  content:''; position:absolute; right:-30px; top:-30px;
  width:140px; height:140px; border-radius:50%;
  background:radial-gradient(circle, rgba(200,16,46,.10), transparent 70%);
}
.hf-points-num{
  font-size:38px; font-weight:800; letter-spacing:-.02em;
  color:#C8102E; font-variant-numeric:tabular-nums; line-height:1.05;
}
.hf-points-num .delta{
  display:inline-block; margin-left:10px; vertical-align:middle;
  font-size:14px; font-weight:700; color:#10B981;
  padding:3px 9px; border-radius:999px; background:rgba(16,185,129,.12);
  animation:hf-delta 1.6s ease-out forwards;
}
@keyframes hf-delta {
  0%   { opacity:0; transform:translateY(-4px); }
  20%  { opacity:1; transform:translateY(0); }
  80%  { opacity:1; }
  100% { opacity:0; transform:translateY(-4px); }
}

/* demo banner */
.hf-demo-banner{
  display:flex; align-items:flex-start; gap:10px;
  padding:11px 14px; border-radius:10px;
  background:#FEF9E7; border:1px solid #FDE68A; color:#92400E;
  font-size:12.5px; line-height:1.5;
}
.hf-demo-banner a{ color:#C8102E; font-weight:600; text-decoration:none; border-bottom:1px solid currentColor; }
.hf-demo-banner .demo-reset{
  margin-left:auto; flex:none;
  font:600 11px/1 var(--w-font); padding:5px 10px;
  background:#FFFFFF; border:1px solid #FDE68A; border-radius:6px;
  color:#92400E; cursor:pointer; white-space:nowrap;
  transition:background .12s, border-color .12s;
}
.hf-demo-banner .demo-reset:hover{ background:#FEF3C7; border-color:#F59E0B; }

/* Mobile-scoped tweaks — loyalty page is rendered both in CMS browser
   chrome (820px max) and in the .w-phone mobile frame (~359px). The
   media-query approach won't trigger because the viewport is desktop,
   so we scope styles via the .w-phone ancestor selector. */
.w-phone .hf-points-hero{ padding:16px 14px; border-radius:12px; }
.w-phone .hf-points-num{ font-size:30px; }
.w-phone .hf-points-num .delta{
  display:block; margin-left:0; margin-top:6px;
}
.w-phone .hf-demo-banner{
  font-size:11.5px; padding:10px 12px; flex-wrap:wrap;
}
.w-phone .hf-demo-banner .demo-reset{
  margin-left:auto; margin-top:0; width:auto;
}
.w-phone .hf-row-new{ animation-duration:2.2s; }

/* new history row pulse */
.hf-row-new{ animation:hf-row-new 2.2s ease-out; }
@keyframes hf-row-new {
  0%   { background:#FFF9DB; box-shadow:inset 3px 0 0 #F59E0B; }
  60%  { background:#FFFCEB; box-shadow:inset 3px 0 0 rgba(245,158,11,.4); }
  100% { background:#FFFFFF; box-shadow:none; }
}

/* toast stack */
.hf-toast-stack{
  position:fixed; top:18px; right:18px; z-index:2000;
  display:flex; flex-direction:column; gap:10px; pointer-events:none;
  max-width:calc(100vw - 36px);
}
.hf-toast{
  pointer-events:auto;
  display:flex; align-items:center; gap:12px;
  padding:12px 14px;
  background:#FFFFFF; border:1px solid #E5E7EB; border-radius:12px;
  box-shadow:0 14px 32px rgba(15,23,42,.18), 0 4px 8px rgba(15,23,42,.08);
  min-width:300px; max-width:380px;
  animation:hf-toast-in .35s cubic-bezier(.34,1.4,.5,1);
}
.hf-toast.out{ animation:hf-toast-out .25s ease-in forwards; }
@keyframes hf-toast-in {
  from { opacity:0; transform:translateX(24px) scale(.96); }
  to   { opacity:1; transform:translateX(0) scale(1); }
}
@keyframes hf-toast-out {
  from { opacity:1; transform:translateX(0); }
  to   { opacity:0; transform:translateX(24px); }
}
.hf-toast-icon{
  width:42px; height:42px; border-radius:11px; flex:none;
  background:linear-gradient(135deg, #34D399, #10B981);
  display:flex; align-items:center; justify-content:center;
  box-shadow:0 6px 14px rgba(16,185,129,.35);
}
.hf-toast-body{ display:flex; flex-direction:column; gap:2px; min-width:0; flex:1; }
.hf-toast-body b{ font-size:13px; color:#0F172A; font-weight:700; }
.hf-toast-body span{ font-size:11.5px; color:#64748B; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.hf-toast-pts{
  margin-left:auto; font-size:20px; font-weight:800; color:#10B981;
  letter-spacing:-.02em; font-variant-numeric:tabular-nums; flex:none;
}

/* reset chip in picker */
.hf-reset-btn{
  font:600 11px/1 var(--w-font); padding:5px 10px;
  background:#F8FAFC; border:1px solid #E5E7EB; border-radius:6px;
  color:#64748B; cursor:pointer; transition:background .12s, border-color .12s;
}
.hf-reset-btn:hover{ background:#FEF2F2; border-color:#FECACA; color:#C8102E; }
`;

const nppLoyaltyJs = `
function LoyaltyToast() {
  const [toasts, setToasts] = useState([]);
  const lastLenRef = useRef(LoyaltyState.history.length);
  useEffect(() => {
    lastLenRef.current = LoyaltyState.history.length;
    return LoyaltyState.subscribe((s) => {
      const delta = s.history.length - lastLenRef.current;
      lastLenRef.current = s.history.length;
      if (delta <= 0) return;
      const fresh = s.history.slice(0, delta).filter(e => e.source === 'shop-scan');
      for (const e of fresh) {
        const id = Math.random().toString(36).slice(2);
        setToasts(prev => [...prev, { id, e, out: false }]);
        setTimeout(() => {
          setToasts(prev => prev.map(t => t.id === id ? { ...t, out: true } : t));
          setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 250);
        }, 4500);
      }
    });
  }, []);
  return (
    <div className="hf-toast-stack">
      {toasts.map(({id, e, out}) => (
        <div key={id} className={cx('hf-toast', out && 'out')}>
          <div className="hf-toast-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
          </div>
          <div className="hf-toast-body">
            <b>Cross-award nhận được</b>
            <span>Shop vừa quét {e.product}</span>
          </div>
          <span className="hf-toast-pts">+{e.nppPts}</span>
        </div>
      ))}
    </div>
  );
}

function NppRewardsBody() {
  const state = useLoyaltyState();
  const pts = useAnimatedNumber(state.nppPoints);
  const lastDeltaRef = useRef({ ts: 0, val: 0 });
  // Capture latest cross-award delta for the badge
  const lastShopScan = state.history.find(e => e.source === 'shop-scan');
  if (lastShopScan && lastShopScan.time !== lastDeltaRef.current.ts) {
    lastDeltaRef.current = { ts: lastShopScan.time, val: lastShopScan.nppPts };
  }
  const showDelta = lastDeltaRef.current.ts > 0
    && lastDeltaRef.current.val > 0
    && (Date.now() - lastDeltaRef.current.ts) < 2000;

  const recent = state.history.slice(0, 5);

  return (
    <div style={{padding:16, display:'flex', flexDirection:'column', gap:16}}>
      <div className="hf-points-hero">
        <div className="c g6" style={{position:'relative', zIndex:1}}>
          <span className="t11 muted" style={{textTransform:'uppercase', letterSpacing:'.08em'}}>Điểm khả dụng · NPP Miền Bắc 01</span>
          <div className="hf-points-num">
            {fmtNum(pts)}
            {showDelta && <span className="delta" key={lastDeltaRef.current.ts}>+{lastDeltaRef.current.val} cross-award</span>}
          </div>
          <span className="t11 muted">Tự động cộng khi <b>Repair Shop quét QR</b> sản phẩm Idemitsu · cross-award 50%</span>
        </div>
      </div>

      <Btn lg block to="npp-scan-web" style={{height:48}}>◎ Quét QR tích điểm (NPP tự quét)</Btn>

      <div className="c g10">
        <div className="r between">
          <div className="h3">Hoạt động gần đây</div>
          <span className="t12 muted" data-hot onClick={() => WF.go('npp-loy-history')} style={{cursor:'pointer'}}>Xem tất cả ›</span>
        </div>

        {recent.length === 0 && (
          <div className="w-box c g8" style={{padding:'22px 16px', alignItems:'center', textAlign:'center'}}>
            <span style={{fontSize:26, opacity:.5}}>📡</span>
            <span className="t12 muted">Chưa có hoạt động. Mở <b>/shop/</b> và quét QR để xem real-time.</span>
          </div>
        )}

        {recent.map((e, i) => {
          const isShop = e.source === 'shop-scan';
          const isFresh = (Date.now() - e.time) < 2500;
          return (
            <div key={e.time + '-' + i} className={cx('w-box r g12', isFresh && i === 0 && 'hf-row-new')} style={{padding:'12px 13px'}}>
              <span style={{width:38, height:38, borderRadius:9, background: isShop ? 'linear-gradient(135deg,#FEE2E2,#FECACA)' : 'linear-gradient(135deg,#DCFCE7,#BBF7D0)', display:'flex', alignItems:'center', justifyContent:'center', flex:'none', fontSize:17}}>
                {isShop ? '🏪' : '🏢'}
              </span>
              <div className="grow c g4" style={{minWidth:0}}>
                <b className="t13" style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{isShop ? 'Shop quét' : 'NPP tự quét'} · {e.product}</b>
                <span className="t11 muted hf-mono" style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{e.qr} · {formatHM(e.time)}</span>
              </div>
              <b className="t13" style={{color:'#10B981', flex:'none'}}>+{e.nppPts}</b>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function nRewardsHiFi() {
  return nLoy('Trang chủ', 0, null, <NppRewardsBody />, null);
}

function NppLoyHistoryBody() {
  const state = useLoyaltyState();
  const [f, setF] = useState('all');

  // Live entries on top, then static demo seed entries
  const live = state.history.map(e => ({
    title: e.source === 'shop-scan' ? 'Shop quét · ' + e.product : 'NPP tự quét · ' + e.product,
    detail: e.qr,
    pts: '+' + e.nppPts,
    time: formatHM(e.time),
    tag: e.source === 'shop-scan' ? 'Cross-award' : 'NPP quét',
    cat: e.source === 'shop-scan' ? 'shop' : 'npp',
    live: true,
    time_raw: e.time,
  }));
  const seed = [
    {title:'Quy đổi cashback kỳ T4/2026', detail:'Chiết khấu cuối tháng theo chính sách', pts:'-186.200', time:'01/05 00:00', tag:'Cashback', cat:'cashback'},
    {title:'NPP tự quét', detail:'Touring 5W-30 · IDMT-B0102-03f9c1', pts:'+8', time:'27/05 10:22', tag:'NPP quét', cat:'npp'},
  ];
  const all = [...live, ...seed];
  const list = all.filter(r => f === 'all' || r.cat === f);
  const cats = [['all','Tất cả'],['npp','NPP tự quét'],['shop','Shop quét'],['cashback','Quy đổi cashback']];

  return (
    <div style={{padding:16, display:'flex', flexDirection:'column', gap:14}}>
      <div className="r g8 wrap">
        {cats.map(c => (
          <Chip key={c[0]} solid={f===c[0]} onClick={() => setF(c[0])} style={{cursor:'pointer'}}>{c[1]}</Chip>
        ))}
      </div>
      <div className="r g10 wrap">
        <div className="w-box grow c g4" style={{padding:'10px 13px', minWidth:120}}>
          <span className="t11 muted">Số dư hiện tại</span>
          <b className="t13">{fmtNum(state.nppPoints)} điểm</b>
        </div>
        <div className="w-box grow c g4" style={{padding:'10px 13px', minWidth:120}}>
          <span className="t11 muted">+ NPP tự quét</span>
          <b className="t13" style={{color:'#10B981'}}>+{fmtNum(state.history.filter(e=>e.source!=='shop-scan').reduce((a,e)=>a+e.nppPts,0))}</b>
        </div>
        <div className="w-box grow c g4" style={{padding:'10px 13px', minWidth:120}}>
          <span className="t11 muted">+ Cross-award (shop quét)</span>
          <b className="t13" style={{color:'#10B981'}}>+{fmtNum(state.history.filter(e=>e.source==='shop-scan').reduce((a,e)=>a+e.nppPts,0))}</b>
        </div>
      </div>
      {list.map((r, i) => {
        const isErr = r.pts.startsWith('-');
        const isFresh = r.live && r.time_raw && (Date.now() - r.time_raw) < 2500;
        return (
          <div key={i} className={cx('w-box r g12', isFresh && 'hf-row-new')} style={{padding:'12px 13px'}}>
            <span style={{width:36, height:36, borderRadius:9, background: r.cat==='shop' ? 'linear-gradient(135deg,#FEE2E2,#FECACA)' : r.cat==='cashback' ? 'linear-gradient(135deg,#FEF3C7,#FDE68A)' : 'linear-gradient(135deg,#DCFCE7,#BBF7D0)', display:'flex', alignItems:'center', justifyContent:'center', flex:'none', fontSize:16}}>
              {r.cat==='shop' ? '🏪' : r.cat==='cashback' ? '💰' : '🏢'}
            </span>
            <div className="grow c g4" style={{minWidth:0}}>
              <b className="t13" style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{r.title}</b>
              <span className="t11 muted hf-mono" style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{r.detail}</span>
              <div className="r g8" style={{alignItems:'center'}}>
                <Chip style={{height:20, fontSize:10.5}}>{r.tag}</Chip>
                <span className="t11 muted">{r.time}</span>
              </div>
            </div>
            <b className="t13" style={{color: isErr ? '#DC2626' : '#10B981', flex:'none'}}>{r.pts}</b>
          </div>
        );
      })}
      {list.length === 0 && (
        <div className="center-text muted t12" style={{padding:'24px 0'}}>Không có giao dịch phù hợp bộ lọc.</div>
      )}
    </div>
  );
}

function nLoyHistoryHiFi() {
  return nLoy('Lịch sử điểm', 2, 'npp-rewards', <NppLoyHistoryBody />, null);
}

/* ----- Live loyalty chrome wrappers -----
   The original loyWeb / loyMobile hard-code "9.842" in the header pill.
   We replace them with components that subscribe to LoyaltyState so the
   pill updates real-time when shop scans arrive. Same structure as the
   wireframe original (it IS the CMS opened in browser / responsive on
   mobile) — only the points value becomes live. */
function LoyalChromeWeb({ title, active, back, body }) {
  const state = useLoyaltyState();
  return (
    <div className="c g8" style={{alignItems:'center'}}>
      <span className="tt">Trên web · desktop (mở trong CMS)</span>
      <Browser url="loyalty.idemitsu.vn/npp">
        <div style={{background:'#fff', height:720, display:'flex', flexDirection:'column'}}>
          <div className="r between" style={{padding:'0 20px', height:58, borderBottom:'1px solid var(--w-line)', flex:'none'}}>
            <div className="r g10">
              <span className="w-icon" style={{width:26, height:26, borderRadius:7}} />
              <b>Loyalty Idemitsu</b>
            </div>
            <div className="r" style={{gap:4, height:'100%'}}>
              {NPP_LOY_NAV.map((n, i) => (
                <span key={i} data-hot onClick={() => WF.go(n.to)}
                  className={i === active ? 't13' : 't13 muted'}
                  style={{display:'flex', alignItems:'center', padding:'0 12px', height:'100%', fontWeight: i === active ? 700 : 500, cursor:'pointer', borderBottom: i === active ? '2px solid var(--w-ink)' : '2px solid transparent'}}>
                  {n.label}
                </span>
              ))}
            </div>
            <div className="r g10">
              <span className="w-chip solid">◆ {fmtNum(state.nppPoints)} điểm</span>
              <span className="w-avatar" style={{width:30, height:30}} />
            </div>
          </div>
          <div className="r between" style={{padding:'7px 20px', borderBottom:'1px solid var(--w-line)', background:'var(--w-fill-3)', flex:'none'}}>
            {back
              ? <span className="r g6 t12 muted" data-hot onClick={() => WF.go(back)} style={{cursor:'pointer'}}><span>‹</span> Quay lại</span>
              : <span className="r g6 t12 muted" data-hot onClick={() => WF.go('npp-shop-list')} style={{cursor:'pointer'}}><span>‹</span> Thoát về CMS</span>}
            <span className="t11 muted">{title}</span>
          </div>
          <div style={{flex:1, overflowY:'auto'}}>
            <div style={{maxWidth:820, margin:'0 auto'}}>{body}</div>
          </div>
        </div>
      </Browser>
    </div>
  );
}

function LoyalChromeMobile({ title, active, back, body }) {
  const state = useLoyaltyState();
  return (
    <div className="c g8" style={{alignItems:'center'}}>
      <span className="tt">Responsive · mobile browser (cùng URL, layout thu gọn)</span>
      <Phone noStatus>
        <div style={{display:'flex', flexDirection:'column', height:740}}>
          {/* Mobile browser address bar */}
          <div className="r g8" style={{height:36, padding:'0 12px', background:'#E9E9EC', borderBottom:'1px solid var(--w-line)', flex:'none'}}>
            <span className="w-icon" style={{width:14, height:14, borderRadius:'50%', flex:'none'}} />
            <div className="grow r" style={{height:22, background:'#fff', borderRadius:11, padding:'0 10px', alignItems:'center'}}>
              <span className="t11 muted">loyalty.idemitsu.vn</span>
            </div>
            <span className="muted t12">⟳</span>
          </div>
          {/* CMS top header — same brand + points pill, just stacked */}
          <div className="r between" style={{padding:'8px 12px', borderBottom:'1px solid var(--w-line)', flex:'none', background:'#fff'}}>
            <div className="r g8" style={{minWidth:0}}>
              {back
                ? <span data-hot onClick={() => WF.go(back)} style={{fontSize:18, color:'var(--w-ink-2)', cursor:'pointer', flex:'none'}}>‹</span>
                : <span className="w-icon" style={{width:24, height:24, borderRadius:6, flex:'none'}} />}
              <div className="c g2" style={{minWidth:0}}>
                <b className="t13" style={{lineHeight:1.15}}>{back ? title : 'Loyalty Idemitsu'}</b>
                {!back && <span className="t11 muted" style={{lineHeight:1}}>NPP Miền Bắc 01</span>}
              </div>
            </div>
            <span className="w-chip solid" style={{height:24, fontSize:11.5, flex:'none'}}>◆ {fmtNum(state.nppPoints)}</span>
          </div>
          {/* Content */}
          <div style={{flex:1, overflowY:'auto'}}>{body}</div>
          {/* Bottom tab bar — responsive pattern: desktop top-nav → mobile bottom-nav */}
          {active != null && <BotNav active={active} items={NPP_LOY_NAV.map((n, i) => i === active ? n.label : { label: n.label, to: n.to })} />}
        </div>
      </Phone>
    </div>
  );
}

/* ----- Loyalty now renders inside the CMS shell -----
 * Previously nLoy() returned a standalone Browser + Phone dual view
 * which dropped the NPP_NAV sidebar. We replace nLoy with nLoyCms so
 * Loyalty screens (Trang chủ / Quét QR / Lịch sử điểm) keep the CMS
 * menu visible — the dual-preview is gone; the loyalty page just
 * lives inside the CMS content area like any other CMS section.
 * Inner tab nav stays for navigating between the 3 loyalty pages. */
function nLoyCms(title, active, back, body) {
  const state = useLoyaltyState();
  const pts = (typeof fmtNum === 'function') ? fmtNum(state.nppPoints) : String(state.nppPoints);
  return (
    <Browser url="reward-hub.gotit.vn/npp" wide>
      <Cms
        nav={NPP_NAV}
        active="loy"
        title={title}
        breadcrumb={
          <><Hot to="npp-rewards"><span data-hot style={{color:'var(--w-ink-2)', cursor:'pointer'}}>Loyalty</span></Hot> · <b>{title}</b></>
        }
        topRight={<span className="w-chip solid" style={{height:26, fontSize:12, padding:'0 12px'}}>◆ {pts} điểm</span>}
      >
        {/* Inner sub-nav (3 loyalty tabs) — hidden on sub-screens where active=null */}
        {active != null && (
          <div className="r" style={{borderBottom:'1px solid var(--w-line)', marginBottom:18, marginTop:-12, gap:0}}>
            {NPP_LOY_NAV.map((n, i) => (
              <span key={i} data-hot onClick={() => WF.go(n.to)}
                style={{
                  padding:'12px 18px', cursor:'pointer',
                  fontSize:13, fontWeight: i === active ? 700 : 500,
                  color: i === active ? 'var(--w-ink)' : 'var(--w-ink-3)',
                  borderBottom: i === active ? '2px solid var(--w-brand)' : '2px solid transparent',
                  marginBottom:-1, transition:'color .12s, border-color .12s'
                }}>
                {n.label}
              </span>
            ))}
          </div>
        )}

        {/* Sub-screens: show back link instead of tabs */}
        {active == null && back && (
          <div className="r g6" style={{marginBottom:14, marginTop:-8}}>
            <span data-hot onClick={() => WF.go(back)}
              style={{cursor:'pointer', fontSize:13, color:'var(--w-ink-2)'}}>
              ‹ Quay lại
            </span>
          </div>
        )}

        <div>{body}</div>
      </Cms>
    </Browser>
  );
}
nLoy = nLoyCms;

/* mutate NPP_SCREENS to use live versions */
(function(){
  const map = { 'npp-rewards': nRewardsHiFi, 'npp-loy-history': nLoyHistoryHiFi };
  for (const s of NPP_SCREENS) { if (map[s.id]) s.render = map[s.id]; }
})();
`;

// 5f. Repair Shop mini-app redesign — Idemitsu brand palette + Got It loyalty template
const shopRedesignCss = `
/* ===== Repair Shop UI · Idemitsu brand + premium-member template =====
 *  • Hero: brown→gold gradient (premium "Hội viên vàng" vibe)
 *  • CTAs / accent: Idemitsu red
 *  • Cards: clean white with subtle product framing
 * ============================================================ */

/* Premium hero block (home + profile) */
.shop-hero, .shop-profile-hero{
  position:relative; overflow:hidden;
  color:#fff;
  background:
    radial-gradient(ellipse 80% 60% at 85% 15%, rgba(252,211,77,.45) 0%, transparent 55%),
    radial-gradient(ellipse 70% 50% at 15% 85%, rgba(220,38,38,.22) 0%, transparent 55%),
    linear-gradient(135deg, #261609 0%, #5C3416 30%, #9C5C12 65%, #C57A1B 100%);
  border-radius:0 0 26px 26px;
}
.shop-hero::before, .shop-profile-hero::before{
  content:''; position:absolute; inset:0; pointer-events:none;
  background:
    radial-gradient(circle at 90% 0%, rgba(255,213,128,.35), transparent 40%),
    repeating-linear-gradient(135deg, transparent 0, transparent 6px, rgba(255,255,255,.018) 6px, rgba(255,255,255,.018) 7px);
}
.shop-hero > *, .shop-profile-hero > *{ position:relative; z-index:1; }

/* Got It logo chip */
.shop-got-it{
  display:inline-flex; align-items:baseline;
  padding:5px 10px;
  background:rgba(0,0,0,.28);
  border-radius:8px;
  backdrop-filter:blur(8px);
  font-style:italic; letter-spacing:-.02em;
}
.shop-got-it .got{ color:#FCD34D; font-weight:800; font-size:16px; }
.shop-got-it .it{ color:#fff; font-weight:800; font-size:16px; margin-left:1px; }

/* Avatar circle */
.shop-avatar-sm, .shop-avatar-lg{
  border-radius:50%; overflow:hidden; flex:none;
  background:linear-gradient(135deg, #FCD34D, #F59E0B);
  border:2px solid rgba(255,255,255,.6);
  box-shadow:0 3px 8px rgba(0,0,0,.25);
}
.shop-avatar-sm{ width:32px; height:32px; }
.shop-avatar-lg{ width:64px; height:64px; }

/* Gold "Hội viên vàng" tier pill */
.shop-tier-pill{
  display:inline-flex; align-items:center; gap:5px;
  padding:3px 10px;
  background:linear-gradient(135deg, #FCD34D, #F59E0B);
  color:#7C2D12; font-size:10.5px; font-weight:800;
  border-radius:999px; letter-spacing:.05em;
  box-shadow:0 2px 6px rgba(245,158,11,.45), inset 0 1px 0 rgba(255,255,255,.4);
  align-self:flex-start; white-space:nowrap;
}
.shop-tier-pill svg{ flex:none; }

/* "Nhập mã" overlapping card */
.shop-input-card{
  background:#fff; color:#0F172A;
  border-radius:14px; padding:14px;
  box-shadow:0 6px 20px rgba(0,0,0,.18), 0 2px 6px rgba(0,0,0,.08);
}
.shop-input-card .field-input{
  flex:1; height:44px; padding:0 14px;
  background:#F8FAFC; border:1px solid #E2E8F0;
  border-radius:12px; color:#94A3B8; font-size:13px;
  display:flex; align-items:center;
}
.shop-input-card .submit-btn{
  width:44px; height:44px; flex:none;
  border-radius:50%; border:none;
  background:linear-gradient(135deg, #FBBF24, #F59E0B);
  color:#fff; cursor:pointer;
  box-shadow:0 4px 10px rgba(245,158,11,.4), inset 0 1px 0 rgba(255,255,255,.2);
  display:flex; align-items:center; justify-content:center;
  transition:transform .12s, box-shadow .12s;
}
.shop-input-card .submit-btn:hover{ transform:translateY(-1px); }

/* Promo banner with dark "premium product" look */
.shop-promo-banner{
  position:relative; height:170px; border-radius:14px; overflow:hidden;
  background:
    radial-gradient(ellipse 70% 50% at 30% 50%, rgba(120,80,40,.6), transparent 65%),
    linear-gradient(135deg, #1F2937 0%, #0F172A 80%);
  display:flex; align-items:center; justify-content:center;
  box-shadow:0 6px 18px rgba(15,23,42,.18);
}
.shop-promo-banner .promo-text{
  position:absolute; left:18px; bottom:24px; z-index:2; color:#fff;
}
.shop-promo-banner .promo-text .label{
  font-size:22px; font-weight:800; letter-spacing:-.02em; line-height:1.1;
  background:linear-gradient(135deg, #fff, #CBD5E1);
  -webkit-background-clip:text; -webkit-text-fill-color:transparent;
}
.shop-promo-banner .promo-text .tag{
  font-size:11px; color:rgba(255,255,255,.65); margin-top:4px; letter-spacing:.01em;
}
.shop-promo-banner .promo-device{
  position:absolute; right:22px; top:50%; transform:translateY(-50%);
  display:flex; align-items:center; justify-content:center;
}
.shop-promo-banner .promo-dots{
  position:absolute; bottom:10px; left:0; right:0;
  display:flex; gap:6px; justify-content:center;
}
.shop-promo-banner .promo-dots i{
  width:6px; height:6px; border-radius:50%;
  background:rgba(255,255,255,.35);
}
.shop-promo-banner .promo-dots i.on{
  width:18px; border-radius:3px; background:rgba(255,255,255,.95);
}

/* Product card (grid items) */
.shop-product-card{
  padding:0; overflow:hidden; cursor:pointer;
  transition:transform .14s, box-shadow .14s;
  display:flex; flex-direction:column;
}
.shop-product-card:hover{
  transform:translateY(-3px);
  box-shadow:0 10px 22px rgba(200,16,46,.15), 0 3px 6px rgba(15,23,42,.08);
}
.shop-product-img{
  position:relative; aspect-ratio:1; border-radius:12px 12px 0 0; overflow:hidden;
}
.shop-product-brand{
  position:absolute; top:8px; left:8px;
  padding:3px 9px;
  background:rgba(255,255,255,.95);
  border-radius:6px;
  font-size:10px; font-weight:700; color:#0F172A;
  box-shadow:0 1px 3px rgba(0,0,0,.12);
  letter-spacing:.02em;
}
.shop-product-info{
  padding:10px 12px 12px;
  display:flex; flex-direction:column; gap:6px;
  background:#fff; flex:1; min-height:72px;
}
.shop-product-name{
  font-size:12px; line-height:1.35; color:#1F2937;
  display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;
  overflow:hidden; min-height:32px;
}
.shop-product-pts{
  font-size:13px; font-weight:700; color:#C8102E;
  margin-top:auto;
}

/* Profile contact rows */
.shop-profile-contact{
  display:flex; align-items:center; gap:8px;
  color:rgba(255,255,255,.95); font-size:12px;
}
.shop-profile-contact svg{
  flex:none; opacity:.9;
}

/* Section titles in profile */
.w-phone .tt{ color:#94A3B8; letter-spacing:.12em; font-size:10.5px; font-weight:700; }

/* List rows in mini app */
.w-phone .w-box[data-hot]{
  transition:background .12s;
}
.w-phone .w-box[data-hot]:hover{ background:#FFF5F6; }

/* ===== Original mini-app polish (zalo bar, bot nav, etc) ===== */

/* Zalo mini-app top bar polish */
.w-phone .w-zalo-bar{ background:#fff; box-shadow:0 1px 0 rgba(15,23,42,.04); }
.w-phone .w-zalo-bar .ztitle{ font-weight:700; color:#0F172A; letter-spacing:-.005em; }

/* Bottom nav active state → Idemitsu red */
.w-phone .w-botnav{ background:#fff; border-top:1px solid #F1F5F9; box-shadow:0 -1px 0 rgba(15,23,42,.03); }
.w-phone .w-botnav .nav-i{ color:#94A3B8; transition:color .12s; }
.w-phone .w-botnav .nav-i.active{ color:#C8102E; font-weight:600; }
.w-phone .w-botnav .nav-i svg{ transition:transform .12s; }
.w-phone .w-botnav .nav-i.active svg{ transform:scale(1.08); }
.w-phone .w-botnav .nav-i .gi{ background:transparent; border-color:transparent; }

/* Cards polish */
.w-phone .w-card{
  border:1px solid #F1F5F9;
  box-shadow:0 1px 2px rgba(15,23,42,.04), 0 1px 1px rgba(15,23,42,.06);
}
.w-phone .w-box{ border-color:#F1F5F9; }
.w-phone .w-card[data-hot]{ transition:transform .12s, box-shadow .12s; }
.w-phone .w-card[data-hot]:hover{
  transform:translateY(-2px);
  box-shadow:0 8px 18px rgba(200,16,46,.12), 0 2px 6px rgba(15,23,42,.08);
}

/* Buttons — Idemitsu gradient red */
.w-phone .w-btn{
  background:linear-gradient(180deg, #DA1B3A, #C8102E);
  border:none; color:#fff;
  box-shadow:0 3px 8px rgba(200,16,46,.30), inset 0 1px 0 rgba(255,255,255,.12);
}
.w-phone .w-btn:not(.disabled):hover{
  background:linear-gradient(180deg, #C8102E, #A30E22);
  box-shadow:0 5px 12px rgba(200,16,46,.4), inset 0 1px 0 rgba(255,255,255,.12);
  transform:translateY(-1px);
}
.w-phone .w-btn.ghost{
  background:#fff; color:#0F172A; border:1px solid #E2E8F0;
  box-shadow:0 1px 2px rgba(15,23,42,.04);
}
.w-phone .w-btn.ghost:not(.disabled):hover{
  background:#FFF5F6; border-color:#FECDD3; color:#C8102E;
}
.w-phone .w-btn.disabled{
  background:#F1F5F9; color:#94A3B8; box-shadow:none;
}

/* Chip solid → Idemitsu gradient pill */
.w-phone .w-chip.solid{
  background:linear-gradient(135deg, #C8102E, #A30E22);
  color:#fff; border:none;
  box-shadow:0 2px 6px rgba(200,16,46,.25);
  font-weight:600;
}
.w-phone .w-chip{
  background:#fff; border:1px solid #E2E8F0; color:#475569;
  transition:background .12s, border-color .12s, color .12s;
}
.w-phone .w-chip:not(.solid):hover{
  background:#FFF5F6; border-color:#FECDD3; color:#C8102E;
}

/* Search-style inputs */
.w-phone .w-input{
  background:#F8FAFC;
  border:1px solid #E2E8F0;
  border-radius:12px;
}
.w-phone .w-input:focus-within{
  background:#fff;
  border-color:#C8102E;
  box-shadow:0 0 0 3px rgba(200,16,46,.12);
}

/* Status badges polish */
.w-phone .w-badge{
  font-weight:600; padding:3px 10px;
  border-radius:999px;
}

/* Lines in lists */
.w-phone .w-line{ background:#F1F5F9; }

/* Section headings tighter */
.w-phone .h3{ letter-spacing:-.01em; color:#0F172A; }
.w-phone .tt{ color:#94A3B8; letter-spacing:.12em; font-size:10.5px; }
`;

const shopRedesignJs = `
/* ----- Repair Shop UI redesign · Idemitsu palette -----
 * Reassign Illus + CatIcon so every shop screen picks up the new
 * gradients/visuals without rewriting render functions. */

function ShopIllus({kind='gift', h, w, r=10, style}){
  // Idemitsu-anchored gradients (red dominant) + amber for voucher accent +
  // product-style kinds (phone/audio/thermos/charger) for the rewards grid.
  const grads = {
    banner:  ['#FF8A3D', '#C8102E'],   // brand: orange → red
    oil:     ['#DC1B3A', '#7A0A1C'],   // bright → deep red
    gift:    ['#E11D48', '#881337'],   // rose-red
    voucher: ['#F59E0B', '#B45309'],   // amber accent
    qr:      ['#1E293B', '#0F172A'],   // slate (voucher code bg)
    phone:   ['#1F2937', '#0F172A'],   // dark — phone product
    audio:   ['#475569', '#1E293B'],   // medium slate — earbuds
    thermos: ['#7C2D12', '#451A03'],   // warm brown — bottle/thermos
    charger: ['#D946EF', '#86198F'],   // purple — accessories
  };
  const icons = {
    oil:     'M9 2h6v3l2 2v13a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V7l2-2V2Z M9 11h6',
    gift:    'M3 8h18v4H3V8Zm1 4h16v9H4v-9Zm8-9c2 0 3 2 0 5-3-3-2-5 0-5Zm0 0v18',
    voucher: 'M3 7h18v4a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4V7Zm7 0v13',
    banner:  'M4 5h16v10H4z M4 19h16 M8 11l3-3 2 2 3-4',
    qr:      'M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h2v2h-2z M18 18h2v2h-2z',
    phone:   'M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z M10 18h4',
    audio:   'M4 11a8 8 0 0 1 16 0v4a2 2 0 0 1-2 2h-1v-7h3 M4 11v4a2 2 0 0 0 2 2h1v-7H4',
    thermos: 'M9 2h6v4a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2z M8 9h8v11a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V9z M8 14h8',
    charger: 'M9 7V3 M15 7V3 M7 7h10v5a5 5 0 0 1-5 5 5 5 0 0 1-5-5V7z M12 17v4',
  };
  const g = grads[kind] || grads.gift;
  const iconSize = Math.min(((h || 80) * 0.42), 60);
  return (
    <div style={{
      position:'relative', display:'flex', alignItems:'center', justifyContent:'center',
      height:h, width:w||'100%', borderRadius:r, overflow:'hidden',
      background: 'linear-gradient(135deg, ' + g[0] + ', ' + g[1] + ')',
      ...style
    }}>
      {/* Top-right highlight */}
      <div style={{
        position:'absolute', right:'-25%', top:'-35%', width:'90%', height:'90%',
        background:'radial-gradient(circle, rgba(255,255,255,.22), transparent 60%)',
        pointerEvents:'none'
      }} />
      {/* Bottom-left shadow lobe */}
      <div style={{
        position:'absolute', left:'-15%', bottom:'-25%', width:'70%', height:'70%',
        background:'radial-gradient(circle, rgba(0,0,0,.20), transparent 70%)',
        pointerEvents:'none'
      }} />
      {/* Icon */}
      <svg viewBox="0 0 24 24" width={iconSize} height={iconSize}
           fill="none" stroke="rgba(255,255,255,.96)"
           strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round"
           style={{position:'relative', zIndex:1, filter:'drop-shadow(0 3px 6px rgba(0,0,0,.22))'}}>
        <path d={icons[kind] || icons.gift}/>
      </svg>
    </div>
  );
}
Illus = ShopIllus;

// Polished category icon — Idemitsu-anchored, unified design language
const SHOP_CAT_DEF = {
  'Tất cả':      { color:'#C8102E', d:'M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z' },
  'Mới':         { color:'#EF7D00', d:'M12 3l2.5 5 5.5.8-4 3.9 1 5.5L12 21l-5-2.8 1-5.5-4-3.9 5.5-.8z' },
  'Cafe & Bánh': { color:'#92400E', d:'M4 8h13v5a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z M17 9h2a2 2 0 0 1 0 4h-2 M7 3v2 M11 3v2' },
  'Tiện ích':    { color:'#0F172A', d:'M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z M9 12l2 2 4-4' },
  'Thực phẩm':   { color:'#DC2626', d:'M6 2v8a3 3 0 0 0 6 0V2 M9 2v20 M17 2c-2 1-3 3-3 6v4h3z M17 12v10' },
};
function ShopCatIcon({label, active}){
  const def = SHOP_CAT_DEF[label] || SHOP_CAT_DEF['Tất cả'];
  const bg = active
    ? 'linear-gradient(135deg, ' + def.color + ', ' + def.color + 'b8)'
    : '#FFF1F2';
  const shadow = active
    ? '0 6px 14px ' + def.color + '55, inset 0 1px 0 rgba(255,255,255,.2)'
    : 'inset 0 0 0 1px #FECDD3';
  return (
    <span style={{
      width:50, height:50, borderRadius:14,
      display:'flex', alignItems:'center', justifyContent:'center', flex:'none',
      background: bg, boxShadow: shadow,
    }}>
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none"
           stroke={active ? '#fff' : def.color}
           strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d={def.d}/>
      </svg>
    </span>
  );
}
CatIcon = ShopCatIcon;

/* ----- Shop Home redesign (Got It loyalty template) ----- */
function PromoDevice() {
  // Stylized phone silhouette for the dark promo banner
  return (
    <svg viewBox="0 0 80 160" width="80" height="160" style={{filter:'drop-shadow(0 8px 18px rgba(0,0,0,.5))'}}>
      <defs>
        <linearGradient id="promo-phone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#475569"/>
          <stop offset="100%" stopColor="#1F2937"/>
        </linearGradient>
        <linearGradient id="promo-screen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1E293B"/>
          <stop offset="100%" stopColor="#0F172A"/>
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="76" height="156" rx="16" fill="url(#promo-phone)" stroke="#94A3B8" strokeWidth=".5"/>
      <rect x="6" y="6" width="68" height="148" rx="12" fill="url(#promo-screen)"/>
      <rect x="30" y="10" width="20" height="3" rx="1.5" fill="#0F172A"/>
      <circle cx="42" cy="76" r="14" fill="#1E293B" stroke="#374151" strokeWidth="1"/>
      <circle cx="42" cy="76" r="9" fill="#0F172A"/>
      <circle cx="42" cy="76" r="5" fill="#475569" opacity=".7"/>
      <circle cx="56" cy="62" r="3" fill="#1E293B" stroke="#374151" strokeWidth=".5"/>
    </svg>
  );
}

const SHOP_TIER_STAR = (
  <svg viewBox="0 0 24 24" width="11" height="11" fill="#7C2D12" stroke="none">
    <path d="M12 2l2.5 6.3 6.7.5-5.1 4.4 1.6 6.5L12 16.8 6.3 19.7l1.6-6.5L2.8 8.8l6.7-.5z"/>
  </svg>
);

function sHomeHiFi() {
  const state = (typeof LoyaltyState !== 'undefined') ? useLoyaltyState() : null;
  const points = state ? state.shopPoints : 5000;
  const cats = ['Tất cả','Mới','Cafe & Bánh','Tiện ích','Thực phẩm'];
  const products = [
    { brand:'Anker',       name:'Sạc nhanh Anker tím 65W',          pts:1000, kind:'charger' },
    { brand:'Samsung',     name:'Tai nghe không dây Galaxy Buds',    pts:1000, kind:'audio'   },
    { brand:'Apple',       name:'iPhone 17 Pro Max cam vũ trụ 256GB',pts:5000, kind:'phone'   },
    { brand:'Lock & Lock', name:'Combo 3 bình giữ nhiệt thời thượng',pts:1500, kind:'thermos' },
  ];
  const fmtPts = (n) => (typeof fmtNum === 'function' ? fmtNum(n) : String(n));

  return SPhone({ title:null, nav:0, scroll:true, body:
    <div className="c" style={{padding:0, background:'#FAFAFA'}}>
      {/* Hero */}
      <div className="shop-hero" style={{paddingTop:18, paddingBottom:20}}>
        <div className="r between start" style={{padding:'0 16px'}}>
          <div className="c g8" style={{minWidth:0, flex:1}}>
            <b style={{color:'#fff', fontSize:16, letterSpacing:.15, lineHeight:1.25}}>Sửa xe Hùng Anh</b>
            <span className="shop-tier-pill">{SHOP_TIER_STAR}<span>HỘI VIÊN VÀNG</span></span>
          </div>
          <span className="shop-avatar-sm" style={{width:40, height:40}}>
            <svg viewBox="0 0 40 40" width="40" height="40">
              <circle cx="20" cy="16" r="7" fill="rgba(255,255,255,.6)"/>
              <path d="M5 38 C 5 28 12 24 20 24 C 28 24 35 28 35 38 L 35 40 L 5 40 Z" fill="rgba(255,255,255,.6)"/>
            </svg>
          </span>
        </div>

        <div className="r between" style={{padding:'14px 16px 0', alignItems:'flex-end'}}>
          <div className="c g4">
            <div style={{color:'#fff', fontSize:42, fontWeight:800, lineHeight:1, letterSpacing:'-.02em'}}>
              {fmtPts(points)} <span style={{fontSize:18, fontWeight:600, opacity:.85}}>điểm</span>
            </div>
            <span style={{color:'rgba(255,255,255,.75)', fontSize:11.5}}>HSD: 31/12/2026</span>
          </div>
          <span data-hot onClick={() => WF.go('shop-history')}
                style={{color:'#fff', fontSize:12, fontWeight:500, opacity:.95, cursor:'pointer'}}>
            Lịch sử điểm ›
          </span>
        </div>
      </div>

      <div style={{padding:'24px 16px 20px', display:'flex', flexDirection:'column', gap:22}}>
        {/* Khuyến mãi cực lớn */}
        <div className="c g10">
          <div className="h3">Khuyến mãi cực lớn</div>
          <div className="shop-promo-banner">
            <div className="promo-device"><PromoDevice/></div>
            <div className="promo-text">
              <div className="label">iPhone 16 Pro</div>
              <div className="tag">Đổi điểm · ưu đãi cuối tháng</div>
            </div>
            <div className="promo-dots"><i className="on"/><i/><i/><i/></div>
          </div>
        </div>

        {/* Danh mục quà tặng */}
        <div className="c g12">
          <div className="r between">
            <div className="h3">Danh mục quà tặng</div>
            <span data-hot onClick={() => WF.go('shop-rewards')} className="muted" style={{cursor:'pointer', fontSize:18}}>›</span>
          </div>
          <div className="r g14" style={{overflowX:'auto', paddingBottom:4, marginInline:-4, paddingInline:4}}>
            {cats.map((c, i) => (
              <div key={i} className="c g6" style={{alignItems:'center', minWidth:62, flex:'none', cursor:'pointer'}}
                   data-hot onClick={() => WF.go('shop-rewards')}>
                <CatIcon label={c} active={i===0}/>
                <span className="t11 center-text" style={{lineHeight:1.25, color:'#475569'}}>{c}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quà nổi bật */}
        <div className="c g12">
          <div className="r between">
            <div className="h3">Quà nổi bật</div>
            <span data-hot onClick={() => WF.go('shop-rewards')} className="t12 muted" style={{cursor:'pointer'}}>Xem tất cả ›</span>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
            {products.map((p, i) => (
              <div key={i} className="w-card shop-product-card" data-hot onClick={() => WF.go('shop-reward-detail')}>
                <div className="shop-product-img">
                  <Illus kind={p.kind} h={140} r={0}/>
                  <span className="shop-product-brand">{p.brand}</span>
                </div>
                <div className="shop-product-info">
                  <span className="shop-product-name">{p.name}</span>
                  <span className="shop-product-pts">{fmtPts(p.pts)} điểm</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  });
}
SHOP_SCREENS.find(s => s.id === 'shop-home').render = sHomeHiFi;

/* ----- Shop Profile redesign (template-based) ----- */
function sProfileHiFi() {
  return SPhone({ title:null, nav:4, scroll:true, body:
    <div className="c" style={{padding:0, background:'#FAFAFA', minHeight:'100%'}}>
      {/* Profile hero */}
      <div className="shop-profile-hero" style={{paddingBottom:20}}>
        <div className="r g14 start" style={{padding:'20px 16px 8px'}}>
          <span className="shop-avatar-lg">
            <svg viewBox="0 0 64 64" width="64" height="64">
              <circle cx="32" cy="26" r="11" fill="rgba(255,255,255,.65)"/>
              <path d="M10 60 C 10 46 20 41 32 41 C 44 41 54 46 54 60 L 54 64 L 10 64 Z" fill="rgba(255,255,255,.65)"/>
            </svg>
          </span>
          <div className="grow c g8" style={{minWidth:0}}>
            <div className="r between" style={{alignItems:'flex-start'}}>
              <b style={{color:'#fff', fontSize:13.5, textTransform:'uppercase', letterSpacing:.4, lineHeight:1.25}}>
                Sửa xe Hùng Anh
              </b>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="rgba(255,255,255,.85)"
                   strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flex:'none', cursor:'pointer'}}>
                <path d="M12 20h9 M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
              </svg>
            </div>
            <span className="shop-tier-pill">{SHOP_TIER_STAR}<span>HỘI VIÊN VÀNG</span></span>
            <div className="c g4" style={{marginTop:6}}>
              <div className="shop-profile-contact">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/></svg>
                <span>0901 234 567</span>
              </div>
              <div className="shop-profile-contact">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l9 4v6c0 5-3.7 9-9 10-5.3-1-9-5-9-10V6z"/></svg>
                <span>Cầu Giấy, Hà Nội · NPP Miền Bắc 01</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div style={{padding:'20px 16px 24px', display:'flex', flexDirection:'column', gap:22}}>
        <div className="c g10">
          <div className="tt">Điểm</div>
          <div className="w-box r between" style={{padding:14, background:'#fff', cursor:'pointer'}}
               data-hot onClick={() => WF.go('shop-history')}>
            <span className="t13">Lịch sử điểm</span>
            <span className="muted">›</span>
          </div>
        </div>

        <div className="c g10">
          <div className="tt">Thông tin</div>
          <div className="w-box c" style={{background:'#fff'}}>
            <div className="r between" style={{padding:14, cursor:'pointer'}} data-hot onClick={() => {}}>
              <span className="t13">Điều khoản & Điều kiện</span><span className="muted">›</span>
            </div>
            <Divider/>
            <div className="r between" style={{padding:14, cursor:'pointer'}} data-hot onClick={() => {}}>
              <span className="t13">Chính sách bảo mật</span><span className="muted">›</span>
            </div>
          </div>
        </div>

        <div className="c g10">
          <div className="tt">Cài đặt</div>
          <div className="w-box r between" style={{padding:14, background:'#fff', cursor:'pointer'}} data-hot onClick={() => {}}>
            <span className="t13">Ngôn ngữ</span>
            <span className="r g8" style={{alignItems:'center'}}>
              <span className="t12 muted">English</span>
              <span className="muted">›</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  });
}
SHOP_SCREENS.find(s => s.id === 'shop-profile').render = sProfileHiFi;

/* ----- Shop permission: gate "Đồng ý & tiếp tục" on both checkboxes ----- */
function PermCheckbox({checked}) {
  return (
    <span style={{
      width:22, height:22, flex:'none', borderRadius:6,
      border: checked ? 'none' : '1.5px solid #CBD5E1',
      background: checked ? 'linear-gradient(135deg, #DA1B3A, #C8102E)' : '#fff',
      display:'flex', alignItems:'center', justifyContent:'center',
      transition: 'background .12s, border .12s',
      boxShadow: checked ? '0 2px 6px rgba(200,16,46,.30)' : 'none',
    }}>
      {checked && (
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none"
             stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 13l4 4L19 7"/>
        </svg>
      )}
    </span>
  );
}

function sPermissionHiFi() {
  const [name, setName] = useState(false);
  const [phone, setPhone] = useState(false);
  const enabled = name && phone;
  return (
    <div className="c g16" style={{alignItems:'center'}}>
      <Phone>
        <Screen scroll={false}>
          <ZaloBar title="Loyalty Idemitsu" />
          <div className="w-screen-body" style={{display:'flex', flexDirection:'column', justifyContent:'flex-end'}}>
            <div className="grow" style={{display:'flex', alignItems:'center', justifyContent:'center'}}>
              <div className="c g10" style={{alignItems:'center'}}>
                <span style={{width:64, height:64, borderRadius:16, background:'linear-gradient(135deg, #FF8A3D, #C8102E)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 8px 20px rgba(200,16,46,.28)'}}>
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z"/>
                    <path d="M9 12l2 2 4-4"/>
                  </svg>
                </span>
                <div className="h3" style={{marginTop:4}}>Loyalty Idemitsu</div>
                <span className="t11 muted">Phiên bản 1.0 · Got It</span>
              </div>
            </div>
            <div className="w-card" style={{borderRadius:'18px 18px 0 0', padding:20, boxShadow:'0 -4px 24px rgba(0,0,0,.10)'}}>
              <div className="h3" style={{marginBottom:6}}>Cho phép truy cập</div>
              <div className="t12 muted" style={{marginBottom:16}}>Mini App muốn sử dụng thông tin Zalo của bạn:</div>
              <div className="c g12" style={{marginBottom:18}}>
                <label className="r g12" style={{cursor:'pointer', alignItems:'center', userSelect:'none'}}
                       onClick={() => setName(v => !v)}>
                  <PermCheckbox checked={name} />
                  <span className="t13" style={{color:'#0F172A'}}>Tên hiển thị Zalo</span>
                </label>
                <label className="r g12" style={{cursor:'pointer', alignItems:'center', userSelect:'none'}}
                       onClick={() => setPhone(v => !v)}>
                  <PermCheckbox checked={phone} />
                  <span className="t13" style={{color:'#0F172A'}}>Số điện thoại</span>
                </label>
              </div>
              <div className="c g10">
                {enabled
                  ? <Btn block to="shop-home">Đồng ý &amp; tiếp tục</Btn>
                  : <Btn block disabled>Đồng ý &amp; tiếp tục</Btn>}
                <Btn block ghost>Từ chối</Btn>
              </div>
            </div>
          </div>
        </Screen>
      </Phone>
    </div>
  );
}
SHOP_SCREENS.find(s => s.id === 'shop-permission').render = sPermissionHiFi;
`;

// 5g. Per-role config
const ROLE_CFG = {
  admin: { mode:'cms',    label:'Admin · Got It',     title:'Admin CMS',     sub:'Tạo NPP · Tích điểm · Quản trị',  constName:'ADMIN_SCREENS', defaultId:'login',       extraCss:'',                                  extraJs:'' },
  npp:   { mode:'cms',    label:'NPP · Nhà phân phối',title:'NPP CMS',       sub:'Whitelist · Loyalty · Cashback', constName:'NPP_SCREENS',   defaultId:'npp-login',   extraCss:scanCss + nppLoyaltyCss,             extraJs:scanIllusJs + loyaltyBusJs + nppScanJs + nppLoyaltyJs },
  shop:  { mode:'mobile', label:'Repair Shop',        title:'Zalo Mini App', sub:'Tích điểm · Đổi quà',            constName:'SHOP_SCREENS',  defaultId:'shop-invite', extraCss:scanCss + shopRedesignCss,           extraJs:scanIllusJs + loyaltyBusJs + shopScanJs + shopRedesignJs },
  sales: { mode:'mobile', label:'Sales · Phase 2',    title:'App Sales',     sub:'Field · Check-in · Báo cáo',     constName:'SALES_SCREENS', defaultId:'sales-login', extraCss:'',                                  extraJs:'' },
};

function htmlHead(titleStr, descStr){
  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${titleStr}</title>
<meta name="description" content="${descStr}">
<meta name="theme-color" content="#C8102E">
<meta property="og:title" content="${titleStr}">
<meta property="og:description" content="${descStr}">
<meta property="og:type" content="website">
<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 fill=%22%23C8102E%22/><text x=%2250%22 y=%2266%22 font-size=%2244%22 font-family=%22Inter,sans-serif%22 font-weight=%22700%22 fill=%22%23fff%22 text-anchor=%22middle%22>IL</text></svg>">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">`;
}

// 6. Build each role HTML
for (const [roleKey, cfg] of Object.entries(ROLE_CFG)) {
  const ex = extract(roleKey + '.html');
  let screensJs = pickScreens(ex.userJs);

  // NPP visit-log: drop the "Check-in theo tuần" + "Cửa hàng được thăm nhiều"
  // cards. Match from the wrapper div to the </Card></div> that closes the
  // second card, anchored by the unique heading text.
  if (roleKey === 'npp') {
    screensJs = screensJs.replace(
      /\s*<div className="r g16 start" style=\{\{marginTop:18\}\}>[\s\S]*?Cửa hàng được thăm nhiều[\s\S]*?<\/Card>\s*<\/div>/,
      ''
    );
    // Strip "Điều chỉnh · quét trùng…" rows from the original (now-replaced)
    // history + rewards seed data — keeps the bundle clean.
    screensJs = screensJs.replace(/^\s*\['Điều chỉnh[^\n]*\n/gm, '');
  }
  // Shop: unify all "Nguyễn Hoàng Ngọc Tâm" references with the demo shop's
  // owner name (sGiftPhysical's "Người nhận" still uses the original).
  if (roleKey === 'shop') {
    screensJs = screensJs.replace(/Nguyễn Hoàng Ngọc Tâm/g, 'Anh Nguyễn Văn Hùng');
  }

  const titleStr = `${cfg.label} — Idemitsu Loyalty`;
  const descStr  = `${cfg.title} · ${cfg.sub}`;

  const html = `${htmlHead(titleStr, descStr)}
<style>${kitCss}</style>
<style>${hiFiCss}</style>
${cfg.extraCss ? `<style>${cfg.extraCss}</style>` : ''}
</head>
<body>
<div id="root"></div>

<script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/@babel/standalone@7.24.7/babel.min.js"></script>

<script type="text/babel" data-presets="env,react">
/* ============================================================
 * ${cfg.label} — Idemitsu Loyalty (hi-fi from wireframe Phase 1)
 *   mode: ${cfg.mode}
 * ============================================================ */

${wfJs}

${screensJs}

${cfg.extraJs || ''}

${hiFiAppJs}

ReactDOM.createRoot(document.getElementById('root')).render(
  <HiFiApp
    mode=${JSON.stringify(cfg.mode)}
    role=${JSON.stringify(cfg.label)}
    title=${JSON.stringify(cfg.title)}
    sub=${JSON.stringify(cfg.sub)}
    screens={${cfg.constName}}
    defaultId=${JSON.stringify(cfg.defaultId)}
  />
);
</script>
</body>
</html>
`;

  const outDir = path.join(OUT, roleKey);
  fs.mkdirSync(outDir, { recursive:true });
  fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');
  console.log(`  ${roleKey}/index.html · ${cfg.mode} · ${html.length} bytes`);
}

// 7. Root index.html — keep hub but link to role folders
const bodyMatch = indexEx.template.match(/<body>([\s\S]*?)<\/body>/);
let hubMarkup = bodyMatch[1].trim()
  .replace(/href="admin\.html"/g, 'href="admin/"')
  .replace(/href="npp\.html"/g,   'href="npp/"')
  .replace(/href="shop\.html"/g,  'href="shop/"')
  .replace(/href="sales\.html"/g, 'href="sales/"');

const rootHtml = `${htmlHead('Idemitsu Loyalty — Demo', 'Got It × Idemitsu · 4 role · /admin · /npp · /shop · /sales')}
<style>${kitCss}</style>
<style>${hubCss}</style>
</head>
<body>
${hubMarkup}
</body>
</html>
`;
fs.writeFileSync(path.join(OUT, 'index.html'), rootHtml, 'utf8');
console.log(`  index.html (root) · ${rootHtml.length} bytes`);
