import { useState, useCallback, useRef } from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import './StickerBuilder.css';

// ── Constants ────────────────────────────────────────────────────────────────

const NAVY   = '#0A1628';
const ORANGE = '#FF6B35';
const BORDER = '#E5E2D9';
const CHECKOUT_API  = 'https://ikonic-stickers.YOUR-WORKER.workers.dev/checkout';
const NOTIFY_API    = '/api/sticker-notify';
const BASE_RATE    = 0.207;

const PRODUCT_TYPES = {
  diecut:  { name:'Die-Cut',  unit:'sticker', qtyUnit:'stickers', shapes:[{id:'contour',label:'Contour'},{id:'circle',label:'Circle'},{id:'square',label:'Square'},{id:'rect',label:'Rectangle'}], sizes:[{id:'2',w:2,h:2,label:'2"'},{id:'3',w:3,h:3,label:'3"'},{id:'4',w:4,h:4,label:'4"'},{id:'5',w:5,h:5,label:'5"'}], customSize:true,  materials:['vinyl','holographic','glitter'], finishes:['gloss','matte','satin'], qtyTiers:[25,50,100,250,500,1000], minOrder:15,  priceMult:1.00 },
  kisscut: { name:'Kiss-Cut', unit:'sticker', qtyUnit:'stickers', shapes:[{id:'square',label:'Square'},{id:'rect',label:'Rectangle'}], sizes:[{id:'2',w:2,h:2,label:'2"'},{id:'3',w:3,h:3,label:'3"'},{id:'4',w:4,h:4,label:'4"'},{id:'5',w:5,h:5,label:'5"'}], customSize:true,  materials:['vinyl','holographic','glitter'], finishes:['gloss','matte','satin'], qtyTiers:[25,50,100,250,500,1000], minOrder:15,  priceMult:0.92 },
  sheet:   { name:'Sheets',   unit:'sheet',   qtyUnit:'sheets',   shapes:[], sizes:[{id:'4x6',w:4,h:6,label:'4×6"'},{id:'5.5x8.5',w:5.5,h:8.5,label:'5.5×8.5"'},{id:'8.5x11',w:8.5,h:11,label:'8.5×11"'}], customSize:false, materials:['vinyl','holographic'], finishes:['gloss','matte'], qtyTiers:[10,25,50,100,250,500], minOrder:25,  priceMult:1.00 },
  bumper:  { name:'Bumper',   unit:'sticker', qtyUnit:'stickers', shapes:[], sizes:[{id:'3x10',w:3,h:10,label:'3×10"'},{id:'3x11.5',w:3,h:11.5,label:'3×11.5"'},{id:'4x12',w:4,h:12,label:'4×12"'}], customSize:false, materials:['vinyl'], finishes:['gloss'], qtyTiers:[25,50,100,250,500,1000], minOrder:25,  priceMult:1.10 },
  label:   { name:'Labels',   unit:'label',   qtyUnit:'labels',   shapes:[{id:'square',label:'Square'},{id:'rect',label:'Rectangle'},{id:'circle',label:'Circle'}], sizes:[{id:'1',w:1,h:1,label:'1"'},{id:'1.5',w:1.5,h:1.5,label:'1.5"'},{id:'2',w:2,h:2,label:'2"'},{id:'1x3',w:1,h:3,label:'1×3"'},{id:'2x3',w:2,h:3,label:'2×3"'}], customSize:true, materials:['vinyl'], finishes:['gloss','matte'], qtyTiers:[50,100,250,500,1000,2500], minOrder:20, priceMult:0.85 },
} as const;

type ProductType = keyof typeof PRODUCT_TYPES;

const MATERIAL_DEFS = {
  vinyl:       { label:'Premium Vinyl', desc:'5–7 yr outdoor', mult:1.00 },
  holographic: { label:'Holographic',   desc:'+50% · Rainbow', mult:1.50 },
  glitter:     { label:'Glitter',       desc:'+40% · Sparkle', mult:1.40 },
};
const FINISH_DEFS = {
  gloss: { label:'Gloss', mult:1.00 },
  matte: { label:'Matte', mult:1.05 },
  satin: { label:'Satin', mult:1.05 },
};

// ── Pricing helpers ──────────────────────────────────────────────────────────

function qtyDiscount(qty: number, type: string) {
  if (type === 'sheet') {
    if (qty >= 500) return 0.32; if (qty >= 250) return 0.42; if (qty >= 100) return 0.57;
    if (qty >= 50)  return 0.72; if (qty >= 25)  return 0.87; return 1.0;
  }
  if (type === 'label') {
    if (qty >= 2500) return 0.11; if (qty >= 1000) return 0.16; if (qty >= 500) return 0.23;
    if (qty >= 250)  return 0.36; if (qty >= 100)  return 0.57; if (qty >= 50)  return 0.77; return 1.0;
  }
  if (qty >= 1000) return 0.16; if (qty >= 500) return 0.23; if (qty >= 250) return 0.38;
  if (qty >= 100)  return 0.58; if (qty >= 50)  return 0.74; if (qty >= 25)  return 0.88; return 1.0;
}

function shippingCost(subtotal: number, qty: number, type: string) {
  if (subtotal >= 75) return 0;
  if (type === 'bumper' && qty >= 100) return 14.99;
  if (qty >= 500) return 12.99;
  if (qty >= 100) return 7.99;
  return 4.99;
}

// ── Type icons ───────────────────────────────────────────────────────────────

function TypeIcon({ type }: { type: ProductType }) {
  const base = { position:'absolute' as const, inset:0, background:'white', border:'2px solid currentColor' };
  if (type === 'diecut')  return <div style={{ width:44,height:30,position:'relative',marginBottom:6 }}><div style={{...base,borderRadius:14}}/></div>;
  if (type === 'kisscut') return <div style={{ width:44,height:30,position:'relative',marginBottom:6 }}><div style={{...base,borderRadius:4}}/><div style={{position:'absolute',inset:6,border:'1.5px dashed currentColor',borderRadius:6}}/></div>;
  if (type === 'sheet')   return <div style={{ width:44,height:30,position:'relative',marginBottom:6 }}><div style={{...base,borderRadius:3,display:'grid',gridTemplateColumns:'1fr 1fr',gap:2,padding:3}}>{[0,1,2,3].map(i=><div key={i} style={{background:'currentColor',opacity:0.3,borderRadius:1}}/>)}</div></div>;
  if (type === 'bumper')  return <div style={{ width:44,height:14,position:'relative',marginBottom:6,marginTop:14 }}><div style={{...base,borderRadius:3}}/></div>;
  return <div style={{ width:30,height:30,position:'relative',marginBottom:6 }}><div style={{...base,borderRadius:'50%'}}/></div>;
}

// ── Sticker Preview ──────────────────────────────────────────────────────────

interface PreviewProps {
  type: ProductType; shape: string;
  sizeObj: { w: number; h: number };
  material: string; finish: string;
  dataURL: string | null; file: File | null; perSheet: number;
}

function StickerPreview({ type, shape, sizeObj, material, finish, dataURL, file, perSheet }: PreviewProps) {
  const matCls = material === 'holographic' ? 'sb-holo-bg' : material === 'glitter' ? 'sb-glitter-bg' : '';
  const finCls = finish === 'gloss' ? 'sb-gloss' : finish === 'satin' ? 'sb-satin' : '';

  const matStyle: React.CSSProperties =
    material === 'holographic' ? { opacity: file ? 0.45 : 1, mixBlendMode: file ? 'overlay' : 'normal' } :
    material === 'glitter'     ? { opacity: file ? 0.40 : 1, mixBlendMode: file ? 'screen'  : 'normal' } :
    { opacity: 0 };

  const artwork =
    dataURL ? <img src={dataURL} className="w-full h-full object-contain p-3" alt="artwork" /> :
    file    ? <div className="text-center"><div className="text-4xl mb-2">📄</div><div className="text-sm font-semibold truncate px-2 max-w-[200px]">{file.name}</div><div className="text-xs text-gray-500 mt-1">Vector file ready</div></div> :
              <div className="text-center" style={{color:'#6B7280'}}><div className="text-5xl mb-2">↑</div><div className="text-sm font-semibold" style={{color:'#374151'}}>Upload your artwork</div><div className="text-xs">PNG · JPG · SVG · PDF</div></div>;

  if (type === 'sheet') {
    const ratio  = sizeObj.h / sizeObj.w;
    const sheetW = ratio > 1.2 ? 240 : 320;
    const sheetH = sheetW * ratio;
    const cols   = perSheet === 4 ? 2 : perSheet === 9 ? 3 : perSheet === 12 ? 3 : 4;
    const rows   = Math.ceil(perSheet / cols);
    return (
      <div style={{ background:'white', boxShadow:'0 30px 60px rgba(10,22,40,0.25)', padding:14, borderRadius:4, display:'grid', width:sheetW, height:sheetH, gridTemplateColumns:`repeat(${cols},1fr)`, gridTemplateRows:`repeat(${rows},1fr)`, gap:8 }}>
        {Array.from({ length: perSheet }).map((_, i) => (
          <div key={i} className="sb-sheet-cell">
            {dataURL ? <img src={dataURL} style={{ width:'100%',height:'100%',objectFit:'contain',padding:2 }} alt="" /> : file ? <span>📄</span> : <span style={{ fontSize:10,color:'#a0a0b0' }}>↑</span>}
          </div>
        ))}
      </div>
    );
  }

  if (type === 'bumper') {
    const w = 380, h = w / (sizeObj.h / sizeObj.w);
    return (
      <div className="sb-shadow relative flex items-center justify-center" style={{ width:w, height:h, borderRadius:6 }}>
        <div className={`absolute inset-0 ${matCls}`} style={{ ...matStyle, borderRadius:6 }} />
        <div className="absolute inset-0 flex items-center justify-center text-center px-4 z-10">{artwork}</div>
        <div className={`absolute inset-0 pointer-events-none z-20 ${finCls}`} style={{ borderRadius:6 }} />
      </div>
    );
  }

  if (type === 'kisscut') {
    const isRect = shape === 'rect';
    return (
      <div style={{ background:'white', boxShadow:'0 30px 60px rgba(10,22,40,0.25)', borderRadius:4, padding:24, width:isRect?360:280, height:isRect?220:280, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ position:'relative', width:'100%', height:'100%', borderRadius:8, overflow:'hidden', border:'1.5px dashed #d1d5db' }}>
          <div className={`absolute inset-0 ${matCls}`} style={matStyle} />
          <div className="absolute inset-0 flex items-center justify-center text-center p-3 z-10">{artwork}</div>
          <div className={`absolute inset-0 pointer-events-none z-20 ${finCls}`} />
        </div>
      </div>
    );
  }

  // Die-cut / Label
  let w = 280, h = 280, br = '14px';
  if (shape === 'circle') br = '50%';
  else if (shape === 'square') br = '8px';
  else if (shape === 'rect') { w = 340; h = 200; br = '8px'; }
  if (type === 'label') {
    w = 220; h = Math.round(220 * (sizeObj.h / sizeObj.w));
    if (shape === 'circle') { h = w; br = '50%'; }
    else if (shape === 'square') { h = w; br = '6px'; }
    else br = '6px';
  }
  return (
    <div className="sb-shadow relative flex items-center justify-center" style={{ width:w, height:h, borderRadius:br }}>
      <div className={`absolute inset-0 ${matCls}`} style={{ ...matStyle, borderRadius:br }} />
      <div className="absolute inset-0 flex items-center justify-center text-center p-4 z-10">{artwork}</div>
      <div className={`absolute inset-0 pointer-events-none z-20 ${finCls}`} style={{ borderRadius:br }} />
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function StickerBuilder() {
  const [type,      setType]      = useState<ProductType>('diecut');
  const [file,      setFile]      = useState<File | null>(null);
  const [dataURL,   setDataURL]   = useState<string | null>(null);
  const [shape,     setShape]     = useState('contour');
  const [size,      setSize]      = useState('3');
  const [customW,   setCustomW]   = useState<number | null>(null);
  const [customH,   setCustomH]   = useState<number | null>(null);
  const [material,  setMaterial]  = useState('vinyl');
  const [finish,    setFinish]    = useState('gloss');
  const [qty,       setQty]       = useState(50);
  const [perSheet,  setPerSheet]  = useState(9);
  const [dropActive,setDropActive]= useState(false);
  const [showModal, setShowModal] = useState(false);
  const [custEmail, setCustEmail] = useState('');
  const [custFirst, setCustFirst] = useState('');
  const [custLast,  setCustLast]  = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting,setSubmitting]= useState(false);
  const [pulseKey,  setPulseKey]  = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cfg     = PRODUCT_TYPES[type];
  const sizeObj = cfg.sizes.find(s => s.id === size) || cfg.sizes[0];

  // ── Pricing ────────────────────────────────────────────────────────────────
  const sqIn = (() => {
    if (type === 'sheet') return sizeObj.w * sizeObj.h;
    const w = customW || sizeObj.w, h = customH || sizeObj.h;
    if (shape === 'circle') return Math.PI * (w/2) * (h/2);
    if (shape === 'rect' && w === h && !customH) return w * (w * 0.6);
    return w * h;
  })();
  const matMult    = MATERIAL_DEFS[material as keyof typeof MATERIAL_DEFS]?.mult ?? 1;
  const finMult    = FINISH_DEFS[finish as keyof typeof FINISH_DEFS]?.mult ?? 1;
  const fullPrice  = BASE_RATE * sqIn * matMult * finMult * cfg.priceMult;
  const qtyMult    = qtyDiscount(qty, type);
  const perPiece   = fullPrice * qtyMult;
  let   subtotal   = perPiece * qty;
  const minApplied = subtotal < cfg.minOrder;
  if (minApplied) subtotal = cfg.minOrder;
  const shipping   = shippingCost(subtotal, qty, type);
  const total      = subtotal + shipping;
  const savings    = qtyMult < 1 && !minApplied ? { amount: (fullPrice * qty - subtotal).toFixed(2), pct: Math.round((1 - qtyMult) * 100) } : null;

  const dW = customW || sizeObj.w;
  const dH = customH || (shape === 'rect' && !customH ? parseFloat((sizeObj.w * 0.6).toFixed(1)) : sizeObj.h);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const bump = () => setPulseKey(k => k + 1);

  const changeType = (t: ProductType) => {
    const c = PRODUCT_TYPES[t];
    setType(t); setShape(c.shapes[0]?.id ?? ''); setSize(c.sizes[0].id);
    setCustomW(null); setCustomH(null);
    if (!c.materials.includes(material as any)) setMaterial(c.materials[0]);
    if (!c.finishes.includes(finish as any))    setFinish(c.finishes[0]);
    if (!(c.qtyTiers as unknown as number[]).includes(qty)) setQty(c.qtyTiers[1] ?? c.qtyTiers[0]);
    bump();
  };

  const handleFile = useCallback((f: File) => {
    setFile(f);
    if (f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = ev => setDataURL(ev.target?.result as string);
      reader.readAsDataURL(f);
    } else { setDataURL(null); }
    bump();
  }, []);

  const toBase64 = (f: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = () => resolve((reader.result as string).split(',')[1] ?? '');
      reader.onerror = reject;
      reader.readAsDataURL(f);
    });

  const handleSubmit = async () => {
    if (!custEmail || !custFirst) { setFormError('Email and first name required.'); return; }
    if (!file) { setFormError('Please upload your artwork first.'); return; }
    setSubmitting(true); setFormError('');
    const w = customW || sizeObj.w, h = customH || sizeObj.h;
    const order = {
      customer: { email: custEmail, firstName: custFirst, lastName: custLast, phone: custPhone },
      product: { type: cfg.name, typeId: type, shape, size: `${w}x${h}"`, material: MATERIAL_DEFS[material as keyof typeof MATERIAL_DEFS].label, finish: FINISH_DEFS[finish as keyof typeof FINISH_DEFS].label, quantity: qty, perSheet: type === 'sheet' ? perSheet : null },
      pricing: { subtotal, shipping, total },
    };
    const formData = new FormData();
    formData.append('artwork', file);
    formData.append('order', JSON.stringify(order));
    try {
      // Send artwork + order to shared email in parallel with checkout
      const [fileBase64] = await Promise.all([toBase64(file)]);
      fetch(NOTIFY_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order, fileBase64, fileName: file.name, fileType: file.type }),
      }).catch(() => { /* silent — don't block checkout */ });

      const res  = await fetch(CHECKOUT_API, { method:'POST', body: formData });
      if (!res.ok) throw new Error('Checkout failed');
      const data = await res.json();
      if (data.checkoutUrl) window.location.href = data.checkoutUrl;
      else throw new Error(data.error || 'No checkout URL');
    } catch (err: any) {
      setFormError(`Something went wrong: ${err.message}. Please call 720.679.1230.`);
      setSubmitting(false);
    }
  };

  // ── Step numbers ───────────────────────────────────────────────────────────
  let n = 3;
  const shapeN    = cfg.shapes.length > 0 ? n++ : null;
  const sizeN     = n++;
  const perSheetN = type === 'sheet' ? n++ : null;
  const materialN = n++;
  const finishN   = n++;
  const qtyN      = n++;

  // ── Specs ─────────────────────────────────────────────────────────────────
  const specs = [
    { label:'Type',     value: cfg.name },
    { label:'Shape',    value: cfg.shapes.find(s => s.id === shape)?.label || '—' },
    { label:'Size',     value: `${dW}×${dH}"` },
    { label:'Material', value: MATERIAL_DEFS[material as keyof typeof MATERIAL_DEFS]?.label || '—' },
    { label:'Finish',   value: FINISH_DEFS[finish as keyof typeof FINISH_DEFS]?.label || '—' },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="sb-wrap" style={{ position: 'relative', zIndex: 10 }}>
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-28 pb-6 grid grid-cols-1 lg:grid-cols-5 gap-6" style={{ minHeight: 'calc(100vh - 64px)' }}>

        {/* ── Preview Panel ─────────────────────────────────────────────── */}
        <section className="lg:col-span-3 lg:sticky lg:top-20 lg:self-start">
          <div className="sb-preview-bg rounded-2xl p-6 md:p-12 flex items-center justify-center"
            style={{ minHeight:480, border:`1px solid ${BORDER}` }}>
            <StickerPreview type={type} shape={shape} sizeObj={sizeObj} material={material} finish={finish} dataURL={dataURL} file={file} perSheet={perSheet} />
          </div>

          {/* Specs strip */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2 text-center">
            {specs.map(s => (
              <div key={s.label} className="bg-white/10 rounded-lg p-3" style={{ border:`1px solid rgba(255,255,255,0.12)` }}>
                <div className="sb-label mb-1">{s.label}</div>
                <div className="text-sm font-bold">{s.value}</div>
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div className="mt-4 bg-white/10 rounded-xl p-4 space-y-1" style={{ border:`1px solid rgba(255,255,255,0.1)` }}>
            {['Printed in Denver on premium 7-year vinyl','Waterproof, dishwasher-safe, UV-resistant','Free design review before print'].map(t => (
              <div key={t} className="flex items-center gap-2 text-xs text-white/70">
                <span className="text-green-600 font-bold">✓</span> {t}
              </div>
            ))}
          </div>
        </section>

        {/* ── Options Panel ─────────────────────────────────────────────── */}
        <section className="lg:col-span-2 space-y-5">
          <div>
            <h1 className="sb-display text-3xl md:text-4xl mb-1">BUILD YOUR STICKER</h1>
            <p className="text-sm text-white/60">Live pricing · 3–5 day turnaround</p>
          </div>

          {/* 1. Type */}
          <div>
            <div className="sb-label mb-2">1 — Product Type</div>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
              {(Object.keys(PRODUCT_TYPES) as ProductType[]).map(t => (
                <button key={t} onClick={() => changeType(t)} className={`sb-type-card${type===t?' active':''}`}>
                  <TypeIcon type={t} />
                  <div className="text-xs font-bold">{PRODUCT_TYPES[t].name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Artwork */}
          <div>
            <div className="sb-label mb-2">2 — Your Artwork</div>
            <label
              className={`sb-opt rounded-lg p-4 flex items-center justify-between cursor-pointer${dropActive?' sb-drop-active':''}`}
              onDragEnter={() => setDropActive(true)}
              onDragOver={e => { e.preventDefault(); setDropActive(true); }}
              onDragLeave={() => setDropActive(false)}
              onDrop={e => { e.preventDefault(); setDropActive(false); const f=e.dataTransfer.files[0]; if(f) handleFile(f); }}
            >
              <div>
                <div className="text-sm font-semibold">{file ? file.name : 'Drop file or click to upload'}</div>
                <div className="text-xs text-gray-500 mt-0.5">300 DPI minimum · Up to 50MB</div>
              </div>
              <span className="text-2xl">📁</span>
              <input ref={fileInputRef} type="file" className="hidden" accept="image/*,.pdf,.svg,.ai"
                onChange={e => { const f=e.target.files?.[0]; if(f) handleFile(f); }} />
            </label>
          </div>

          {/* Shape */}
          {cfg.shapes.length > 0 && (
            <div>
              <div className="sb-label mb-2">{shapeN} — Shape</div>
              <div className="grid gap-2" style={{ gridTemplateColumns:`repeat(${Math.min(cfg.shapes.length,4)},1fr)` }}>
                {cfg.shapes.map(s => (
                  <button key={s.id} onClick={() => { setShape(s.id); bump(); }}
                    className={`sb-opt rounded-lg p-3 text-xs font-semibold${shape===s.id?' active':''}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size */}
          <div>
            <div className="sb-label mb-2">{sizeN} — {type==='sheet' ? 'Sheet Size' : 'Size'}</div>
            <div className="grid gap-2" style={{ gridTemplateColumns:`repeat(${Math.min(cfg.sizes.length,5)},1fr)` }}>
              {cfg.sizes.map(s => (
                <button key={s.id} onClick={() => { setSize(s.id); setCustomW(null); setCustomH(null); bump(); }}
                  className={`sb-opt rounded-lg py-3 text-xs font-semibold${size===s.id?' active':''}`}>
                  {s.label}
                </button>
              ))}
            </div>
            {cfg.customSize && (
              <details className="mt-2">
                <summary className="text-xs text-white/60 cursor-pointer" style={{ color:'#a0a0b0' }}>+ Custom size</summary>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <input type="number" placeholder="Width (in)" step="0.5" min="1" max="24" value={customW ?? ''}
                    onChange={e => { setCustomW(parseFloat(e.target.value)||null); bump(); }}
                    className="rounded-lg p-2 text-sm" style={{ border:`2px solid rgba(255,255,255,0.15)`, background:'rgba(255,255,255,0.08)', color:'white' }} />
                  <input type="number" placeholder="Height (in)" step="0.5" min="1" max="48" value={customH ?? ''}
                    onChange={e => { setCustomH(parseFloat(e.target.value)||null); bump(); }}
                    className="rounded-lg p-2 text-sm" style={{ border:`2px solid rgba(255,255,255,0.15)`, background:'rgba(255,255,255,0.08)', color:'white' }} />
                </div>
              </details>
            )}
          </div>

          {/* Per Sheet */}
          {type === 'sheet' && (
            <div>
              <div className="sb-label mb-2">{perSheetN} — Stickers per Sheet</div>
              <div className="grid grid-cols-4 gap-2">
                {[4,9,12,20].map(n => (
                  <button key={n} onClick={() => { setPerSheet(n); bump(); }}
                    className={`sb-opt rounded-lg py-3 text-xs font-semibold${perSheet===n?' active':''}`}>{n}</button>
                ))}
              </div>
            </div>
          )}

          {/* Material */}
          <div>
            <div className="sb-label mb-2">{materialN} — Material</div>
            <div className="grid grid-cols-2 gap-2">
              {cfg.materials.map(m => {
                const d = MATERIAL_DEFS[m as keyof typeof MATERIAL_DEFS];
                return (
                  <button key={m} onClick={() => { setMaterial(m); bump(); }}
                    className={`sb-opt rounded-lg p-3 text-left${material===m?' active':''}`}>
                    <div className="text-xs font-bold">{d.label}</div>
                    <div className="text-[10px] opacity-70 mt-0.5">{d.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Finish */}
          <div>
            <div className="sb-label mb-2">{finishN} — Finish</div>
            <div className="grid gap-2" style={{ gridTemplateColumns:`repeat(${cfg.finishes.length},1fr)` }}>
              {cfg.finishes.map(f => (
                <button key={f} onClick={() => { setFinish(f); bump(); }}
                  className={`sb-opt rounded-lg p-3 text-xs font-semibold${finish===f?' active':''}`}>
                  {FINISH_DEFS[f as keyof typeof FINISH_DEFS].label}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <div className="sb-label mb-2">{qtyN} — Quantity <span className="opacity-60">({cfg.qtyUnit})</span></div>
            <div className="grid grid-cols-3 gap-2">
              {cfg.qtyTiers.map(q => (
                <button key={q} onClick={() => { setQty(q); bump(); }}
                  className={`sb-opt rounded-lg py-3 text-xs font-semibold${qty===q?' active':''}`}>
                  {q.toLocaleString()}
                </button>
              ))}
            </div>
            <details className="mt-2">
              <summary className="text-xs cursor-pointer" style={{ color:'#a0a0b0' }}>+ Custom quantity</summary>
              <input type="number" placeholder="Enter quantity" min="10"
                className="rounded-lg p-2 text-sm w-full mt-2" style={{ border:`2px solid rgba(255,255,255,0.15)`, background:'rgba(255,255,255,0.08)', color:'white' }}
                onChange={e => { const v=parseInt(e.target.value); if(v>=10){setQty(v);bump();} }} />
            </details>
          </div>

          {/* Price summary */}
          <div className="rounded-2xl p-5 space-y-3 text-white" style={{ background: NAVY }}>
            <div className="flex justify-between items-baseline">
              <span className="sb-label" style={{ color:'#a0a0b0' }}>Per {cfg.unit}</span>
              <span className="font-bold">${perPiece.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="sb-label" style={{ color:'#a0a0b0' }}>Subtotal</span>
              <span className="font-bold">${subtotal.toFixed(2)} <span className="text-xs font-normal" style={{ color:'#a0a0b0' }}>({qty.toLocaleString()} {cfg.qtyUnit})</span></span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="sb-label" style={{ color:'#a0a0b0' }}>Shipping (3–5 days)</span>
              <span className="font-bold">{shipping===0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
            </div>
            {savings && <div className="text-xs font-bold" style={{ color:'#4ade80' }}>↓ You save ${savings.amount} ({savings.pct}% bulk discount)</div>}
            <div className="border-t border-gray-700 pt-3 flex justify-between items-baseline">
              <span className="sb-display text-lg">TOTAL</span>
              <span key={pulseKey} className="sb-display text-3xl sb-pulse" style={{ color: ORANGE }}>
                ${total.toFixed(2)}
              </span>
            </div>
            <div className="text-[10px]" style={{ color:'#a0a0b0' }}>Sales tax calculated at Square checkout · Free shipping on orders $75+</div>
          </div>

          <button disabled={!file} onClick={() => setShowModal(true)}
            className="sb-cta sb-display w-full py-4 rounded-xl text-lg">
            CHECKOUT WITH SQUARE
          </button>
          <p className={`text-xs text-center ${file ? 'font-semibold' : ''}`} style={{ color: file ? '#15803d' : '#6B7280' }}>
            {file ? '✓ Ready to checkout' : 'Upload artwork to enable checkout'}
          </p>
        </section>
      </div>

      {/* ── Checkout Modal ──────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background:'rgba(10,22,40,0.85)', backdropFilter:'blur(8px)' }}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
            <button onClick={() => setShowModal(false)}
              className="absolute top-3 right-4 text-2xl text-white/50 hover:text-gray-700">×</button>
            <h2 className="sb-display text-2xl mb-1">ALMOST THERE</h2>
            <p className="text-sm text-white/60 mb-5">We'll email a proof before printing.</p>
            <div className="space-y-3">
              <div>
                <label className="sb-label block mb-1">Email *</label>
                <input type="email" value={custEmail} onChange={e=>setCustEmail(e.target.value)}
                  placeholder="you@business.com" className="w-full rounded-lg p-3 text-sm" style={{ border:`2px solid rgba(255,255,255,0.15)`, background:'rgba(255,255,255,0.08)', color:'white' }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="sb-label block mb-1">First name *</label>
                  <input type="text" value={custFirst} onChange={e=>setCustFirst(e.target.value)}
                    className="w-full rounded-lg p-3 text-sm" style={{ border:`2px solid rgba(255,255,255,0.15)`, background:'rgba(255,255,255,0.08)', color:'white' }} />
                </div>
                <div>
                  <label className="sb-label block mb-1">Last name</label>
                  <input type="text" value={custLast} onChange={e=>setCustLast(e.target.value)}
                    className="w-full rounded-lg p-3 text-sm" style={{ border:`2px solid rgba(255,255,255,0.15)`, background:'rgba(255,255,255,0.08)', color:'white' }} />
                </div>
              </div>
              <div>
                <label className="sb-label block mb-1">Phone</label>
                <input type="tel" value={custPhone} onChange={e=>setCustPhone(e.target.value)}
                  placeholder="(720) 555-1234" className="w-full rounded-lg p-3 text-sm" style={{ border:`2px solid rgba(255,255,255,0.15)`, background:'rgba(255,255,255,0.08)', color:'white' }} />
              </div>
            </div>
            {formError && <p className="text-sm text-red-600 mt-3">{formError}</p>}
            <button onClick={handleSubmit} disabled={submitting}
              className="sb-cta sb-display w-full py-4 rounded-xl text-base mt-3">
              {submitting ? 'PROCESSING...' : 'CONTINUE TO PAYMENT →'}
            </button>
            <p className="text-[10px] text-gray-500 text-center mt-3">
              Shipping address &amp; payment collected on the next page (Square).
            </p>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
