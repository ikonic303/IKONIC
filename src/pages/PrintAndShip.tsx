import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navigation from '../components/Navigation';
import MatrixBackground from '../components/MatrixBackground';
import Footer from '../components/Footer';
import PageSEO from '../components/PageSEO';

// ── Internal pricing (not shown to client) ────────────────────────────────────
const _ROLL_W = 54;
const MATERIALS = [
  { id: 'avery',    name: 'Avery 1105',                   rate: 36,  hasLam: true,  lamRate: 0 },
  { id: '3m_cal',   name: '3M Calendered Film',           rate: 30,  hasLam: true,  lamRate: 0 },
  { id: 'metallic', name: 'Metallic Film',                rate: 108, hasLam: true,  lamRate: 0 },
  { id: 'perf',     name: 'Window Perf (One-Way Vision)', rate: 25,  hasLam: false, lamRate: 7 },
];
const LAM_OPTIONS = [
  { id: 'gloss',   name: 'Gloss',   desc: 'Standard high-gloss finish',              mult: 1 },
  { id: 'satin',   name: 'Satin',   desc: 'Smooth matte-sheen finish',               mult: 1 },
  { id: 'sparkle', name: 'Sparkle', desc: 'Metallic flake overlay — premium finish', mult: 3 },
];
const _DESIGN = 500;
const _AI_REWORK = 400;

// ── Sub-components ────────────────────────────────────────────────────────────

function Label({ text }: { text: string }) {
  return <div style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 8, letterSpacing: '-.01em' }}>{text}</div>;
}

function InputField({ value, onChange, placeholder, type = 'text' }: { value: string; onChange: (v: string) => void; placeholder: string; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%', background: 'rgba(255,255,255,.03)',
        border: '1px solid rgba(255,255,255,.08)', borderRadius: 10,
        padding: '12px 14px', color: '#e2e8f0', fontSize: 15,
        fontFamily: "'Outfit',sans-serif", outline: 'none', transition: 'border .2s ease',
      }}
    />
  );
}

function QtyBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,.03)',
      border: '1px solid rgba(255,255,255,.1)', color: '#94a3b8', fontSize: 20,
      fontFamily: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center',
      justifyContent: 'center', transition: 'all .2s ease',
    }}>{children}</button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
      <span style={{ fontSize: 13, color: '#94a3b8' }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', fontFamily: "'JetBrains Mono',monospace" }}>{value}</span>
    </div>
  );
}

function Check() {
  return (
    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#fff', flexShrink: 0 }}>✓</div>
  );
}

function getCardStyle(mounted: boolean, delay: number): React.CSSProperties {
  return {
    background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)',
    borderRadius: 20, padding: '28px 24px', marginBottom: 16,
    opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)',
    transition: `all .7s cubic-bezier(.16,1,.3,1) ${delay}ms`,
  };
}

function getOptStyle(selected: boolean): React.CSSProperties {
  return {
    background: selected ? 'linear-gradient(135deg,rgba(59,130,246,.12),rgba(59,130,246,.06))' : 'rgba(255,255,255,.015)',
    border: selected ? '1px solid rgba(59,130,246,.4)' : '1px solid rgba(255,255,255,.06)',
    borderRadius: 12, padding: '14px 16px', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
    transition: 'all .2s ease', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    width: '100%',
  };
}

function getToggleStyle(active: boolean): React.CSSProperties {
  return {
    flex: 1, background: active ? 'linear-gradient(135deg,rgba(59,130,246,.12),rgba(59,130,246,.06))' : 'rgba(255,255,255,.015)',
    border: active ? '1px solid rgba(59,130,246,.4)' : '1px solid rgba(255,255,255,.06)',
    borderRadius: 10, padding: '12px 14px', cursor: 'pointer', fontFamily: 'inherit',
    fontSize: 13, fontWeight: 600, color: active ? '#e2e8f0' : '#64748b', transition: 'all .2s ease',
  };
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function PrintAndShip() {
  const [searchParams] = useSearchParams();

  const [w, setW]                     = useState('');
  const [h, setH]                     = useState('');
  const [mat, setMat]                 = useState('');
  const [lamType, setLamType]         = useState('gloss');
  const [qty, setQty]                 = useState(1);
  const [needDesign, setNeedDesign]   = useState(false);
  const [aiRework, setAiRework]       = useState(false);
  const [vehicleInfo, setVehicleInfo] = useState('');
  const [notes, setNotes]             = useState('');
  const [files, setFiles]             = useState<File[]>([]);
  const [zip, setZip]                 = useState('');
  const [showResult, setShowResult]   = useState(false);
  const [mounted, setMounted]         = useState(false);
  const [paying, setPaying]           = useState(false);
  const [payError, setPayError]       = useState('');
  const resultRef = useRef<HTMLDivElement>(null);

  // Payment status from Square redirect
  const paymentStatus = searchParams.get('payment'); // 'success' | 'cancelled'

  useEffect(() => { document.title = 'Print & Ship — Ikonic'; }, []);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 100); return () => clearTimeout(t); }, []);

  const selectedMat = MATERIALS.find(m => m.id === mat);
  const selectedLam = LAM_OPTIONS.find(l => l.id === lamType);

  const calculate = () => {
    if (!w || !h || !mat || !lamType) return null;
    const pw = parseFloat(w);
    const ph = parseFloat(h);
    if (isNaN(pw) || isNaN(ph) || pw <= 0 || ph <= 0) return null;

    const dimA = Math.min(pw, ph);
    const dimB = Math.max(pw, ph);
    const across = Math.floor(_ROLL_W / dimA) || 1;
    const sets = Math.ceil(qty / across);
    const linearFeet = Math.ceil((sets * dimB / 12) * 100) / 100;

    const m = MATERIALS.find(x => x.id === mat)!;
    const lam = LAM_OPTIONS.find(x => x.id === lamType)!;
    let printCost: number;

    if (m.hasLam) {
      printCost = linearFeet * m.rate * lam.mult;
    } else {
      if (lamType === 'none') {
        printCost = linearFeet * m.rate;
      } else {
        printCost = (linearFeet * m.rate + linearFeet * m.lamRate) * lam.mult;
      }
    }

    const designCost = needDesign ? _DESIGN : 0;
    const aiCost = aiRework ? _AI_REWORK : 0;
    const shipEst = zip ? estimateShipping(linearFeet) : null;
    const total = Math.round((printCost + designCost + aiCost + (shipEst || 0)) * 100) / 100;

    return {
      linearFeet: Math.round(linearFeet * 100) / 100,
      printCost:  Math.round(printCost),
      designCost,
      aiCost,
      shipEst,
      total: Math.round(total),
    };
  };

  const estimateShipping = (lf: number) => {
    return Math.round(28 + Math.min(lf, 20) * 1.5);
  };

  const handleCalc = () => {
    setShowResult(true);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 200);
  };

  const reset = () => {
    setW(''); setH(''); setMat(''); setLamType('gloss'); setQty(1);
    setNeedDesign(false); setAiRework(false); setVehicleInfo(''); setNotes('');
    setFiles([]); setZip(''); setShowResult(false); setPayError('');
  };

  const handlePayNow = async () => {
    if (!est) return;
    setPaying(true);
    setPayError('');
    try {
      // Send the SPEC, not the price. The server re-derives the total from its own
      // table (api/_lib/pricing.ts) — a number from the browser is a request, not a
      // fact, and trusting it previously let anyone name their own price. The estimate
      // shown above is display-only; the server's figure is what Square charges.
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spec: {
            material: mat,
            lamination: lamType,
            widthIn: parseFloat(w),
            heightIn: parseFloat(h),
            qty,
            needDesign,
            aiRework,
            zip,
          },
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setPayError(data.error || 'Could not start checkout. Please call us.');
      }
    } catch {
      setPayError('Could not connect to payment server. Please call us.');
    } finally {
      setPaying(false);
    }
  };

  const est = calculate();
  const ready = w && h && mat && lamType && parseFloat(w) > 0 && parseFloat(h) > 0;

  return (
    <div className="relative min-h-screen bg-charcoal">
      <PageSEO
        title="Print & Ship Vinyl Wraps Denver | ikonic303"
        description="Order custom-printed vinyl wraps and have them shipped directly to you. Professional print quality for vehicle wraps, banners, and signage. Serving Denver and Colorado."
        canonical="/print-ship"
      />
      <MatrixBackground />
      <Navigation />

      <div style={{ position: 'relative', zIndex: 10, maxWidth: 600, margin: '0 auto', padding: '112px 20px 80px', fontFamily: "'Outfit', sans-serif", color: '#e8e8e8' }}>

        {/* Payment Status Banner */}
        {paymentStatus === 'success' && (
          <div style={{ background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.3)', borderRadius: 14, padding: '18px 22px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 28 }}>✅</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#10b981' }}>Payment received — thank you!</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>We'll review your order and reach out shortly to confirm details and get your files.</div>
            </div>
          </div>
        )}
        {paymentStatus === 'cancelled' && (
          <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 14, padding: '18px 22px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 28 }}>↩️</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#ef4444' }}>Payment cancelled</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>No charge was made. You can try again below or give us a call.</div>
            </div>
          </div>
        )}

        {/* Header */}
        <header style={{
          paddingBottom: 32, textAlign: 'center',
          opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(-20px)',
          transition: 'all .8s cubic-bezier(.16,1,.3,1)',
        }}>
          <h1 style={{ fontSize: 'clamp(26px,5vw,38px)', fontWeight: 900, letterSpacing: '-.03em', lineHeight: 1.1, margin: '0 0 10px', background: 'linear-gradient(135deg,#fff,#94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Print &amp; Ship
          </h1>
          <p style={{ fontSize: 15, color: '#64748b', maxWidth: 420, margin: '0 auto', lineHeight: 1.5 }}>
            Enter your print dimensions, pick your material, and get an instant quote. We print at 54" wide and ship nationwide via USPS.
          </p>
        </header>

        {/* Card 1: Dimensions & Quantity */}
        <div style={getCardStyle(mounted, 200)}>
          <Label text="Print Dimensions (inches)" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'center', marginBottom: parseFloat(w) > 53 ? 8 : 24 }}>
            <InputField value={w} onChange={v => { if (v === '' || parseFloat(v) <= 54) { setW(v); setShowResult(false); } else setW('54'); }} placeholder="Width (max 54)" type="number" />
            <span style={{ color: '#4b5563', fontSize: 14, fontWeight: 600 }}>×</span>
            <InputField value={h} onChange={v => { setH(v); setShowResult(false); }} placeholder="Height" type="number" />
          </div>
          {parseFloat(w) > 53 && (
            <div style={{ fontSize: 12, color: '#3b82f6', marginBottom: 24 }}>Max print width is 54" — our roll width</div>
          )}

          <Label text="Quantity" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <QtyBtn onClick={() => setQty(q => Math.max(1, q - 1))}>−</QtyBtn>
            <span style={{ fontSize: 24, fontWeight: 800, color: '#e2e8f0', fontFamily: "'JetBrains Mono',monospace", minWidth: 36, textAlign: 'center' }}>{qty}</span>
            <QtyBtn onClick={() => setQty(q => q + 1)}>+</QtyBtn>
          </div>
        </div>

        {/* Card 2: Substrate */}
        <div style={getCardStyle(mounted, 300)}>
          <Label text="Substrate" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {MATERIALS.map(m => (
              <button key={m.id} onClick={() => { setMat(m.id); if (m.id === 'perf') setLamType('none'); else if (lamType === 'none') setLamType('gloss'); setShowResult(false); }} style={getOptStyle(mat === m.id)}>
                <div style={{ fontSize: 14, fontWeight: 600, color: mat === m.id ? '#e2e8f0' : '#94a3b8' }}>{m.name}</div>
                {mat === m.id && <Check />}
              </button>
            ))}
          </div>
        </div>

        {/* Card 3: Lamination */}
        <div style={getCardStyle(mounted, 400)}>
          <Label text="Lamination" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {mat === 'perf' && (
              <button onClick={() => { setLamType('none'); setShowResult(false); }} style={getOptStyle(lamType === 'none')}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: lamType === 'none' ? '#e2e8f0' : '#94a3b8' }}>No Lamination</div>
                  <div style={{ fontSize: 12, color: '#4b5563' }}>Print only — no protective layer</div>
                </div>
                {lamType === 'none' && <Check />}
              </button>
            )}
            {LAM_OPTIONS.map(l => (
              <button key={l.id} onClick={() => { setLamType(l.id); setShowResult(false); }} style={getOptStyle(lamType === l.id)}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: lamType === l.id ? '#e2e8f0' : '#94a3b8' }}>{l.name}</div>
                  <div style={{ fontSize: 12, color: '#4b5563' }}>{l.desc}</div>
                </div>
                {lamType === l.id && <Check />}
              </button>
            ))}
          </div>
        </div>

        {/* Card 4: Design, AI, Vehicle, Files, Notes, Zip */}
        <div style={getCardStyle(mounted, 500)}>

          {/* Design */}
          <Label text="Need Design Work?" />
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {[{ val: false, label: 'No — I have artwork' }, { val: true, label: 'Yes — design for me' }].map(opt => (
              <button key={String(opt.val)} onClick={() => { setNeedDesign(opt.val); setShowResult(false); }} style={getToggleStyle(needDesign === opt.val)}>
                {opt.label}
              </button>
            ))}
          </div>

          {/* AI Art */}
          <Label text="Is your artwork AI-generated?" />
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {[{ val: false, label: 'No' }, { val: true, label: 'Yes' }].map(opt => (
              <button key={String(opt.val)} onClick={() => { setAiRework(opt.val); setShowResult(false); }} style={getToggleStyle(aiRework === opt.val)}>
                {opt.label}
              </button>
            ))}
          </div>

          {/* Vehicle Info */}
          <Label text="Vehicle Info (year / make / model)" />
          <InputField value={vehicleInfo} onChange={setVehicleInfo} placeholder="e.g. 2024 Ford Transit 250 High Roof" />
          <div style={{ height: 24 }} />

          {/* File Upload */}
          <Label text="Upload Artwork / Source Files" />
          <div
            style={{
              border: '1px dashed rgba(255,255,255,.1)', borderRadius: 12, padding: '24px 16px',
              textAlign: 'center', marginBottom: 24, cursor: 'pointer', transition: 'all .2s ease',
              background: files.length > 0 ? 'rgba(59,130,246,.04)' : 'transparent',
            }}
            onClick={() => document.getElementById('fileInput')?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]); }}
          >
            <input
              id="fileInput" type="file" multiple style={{ display: 'none' }}
              onChange={e => { if (e.target.files) setFiles(prev => [...prev, ...Array.from(e.target.files!)]); }}
            />
            {files.length === 0 ? (
              <div>
                <div style={{ fontSize: 28, marginBottom: 8 }}>📁</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>Drag &amp; drop files here or tap to browse</div>
                <div style={{ fontSize: 11, color: '#374151', marginTop: 4 }}>AI, PDF, PNG, JPG, PSD, SVG accepted</div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 13, color: '#3b82f6', fontWeight: 600, marginBottom: 6 }}>{files.length} file{files.length > 1 ? 's' : ''} selected</div>
                {files.map((f, i) => <div key={i} style={{ fontSize: 12, color: '#94a3b8' }}>{f.name}</div>)}
                <div style={{ fontSize: 11, color: '#4b5563', marginTop: 8 }}>Tap to add more</div>
              </div>
            )}
          </div>

          {/* Notes */}
          <Label text="Notes (optional)" />
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Special instructions, colors, placement details..."
            rows={3}
            style={{
              width: '100%', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)',
              borderRadius: 10, padding: '12px 14px', color: '#e2e8f0', fontSize: 14,
              fontFamily: 'inherit', resize: 'vertical', outline: 'none', marginBottom: 24,
            }}
          />

          {/* Zip */}
          <Label text="Shipping Zip Code" />
          <InputField value={zip} onChange={v => { setZip(v); setShowResult(false); }} placeholder="e.g. 80033" />

          {/* Calculate Button */}
          {ready && !showResult && (
            <div style={{ textAlign: 'center', paddingTop: 24 }}>
              <button
                onClick={handleCalc}
                style={{
                  background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: '#fff', border: 'none',
                  borderRadius: 12, padding: '16px 44px', fontSize: 16, fontWeight: 700,
                  fontFamily: 'inherit', cursor: 'pointer', letterSpacing: '-.01em',
                  boxShadow: '0 0 40px rgba(59,130,246,.3),0 4px 20px rgba(0,0,0,.3)', transition: 'all .2s ease',
                }}
              >Get My Quote →</button>
            </div>
          )}
        </div>

        {/* Result */}
        {showResult && est && (
          <div ref={resultRef} style={{ marginBottom: 32, animation: 'fadeUp .6s cubic-bezier(.16,1,.3,1)' }}>
            <div style={{
              background: 'linear-gradient(135deg,rgba(59,130,246,.08),rgba(30,58,138,.12))',
              border: '1px solid rgba(59,130,246,.2)', borderRadius: 20, padding: '36px 28px',
              textAlign: 'center', position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)', width: 300, height: 120, background: 'radial-gradient(ellipse,rgba(59,130,246,.15),transparent)', pointerEvents: 'none' }} />

              <div style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.12em', color: '#3b82f6', marginBottom: 8 }}>Estimated Total</div>
              <div style={{ fontSize: 'clamp(36px,7vw,52px)', fontWeight: 900, letterSpacing: '-.03em', background: 'linear-gradient(135deg,#fff,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.1, marginBottom: 20 }}>
                ${est.total.toLocaleString()}
              </div>

              <div style={{ textAlign: 'left', marginBottom: 24 }}>
                <Row label={`Printing — ${est.linearFeet} lf · ${selectedMat?.name}${lamType !== 'none' ? ` + ${selectedLam?.name} Lam` : ''}`} value={`$${est.printCost.toLocaleString()}`} />
                {est.designCost > 0 && <Row label="Custom Design" value={`$${est.designCost.toLocaleString()}`} />}
                {est.aiCost > 0 && <Row label="AI Art Rework" value={`$${est.aiCost.toLocaleString()}`} />}
                {est.shipEst !== null
                  ? <Row label="Estimated Shipping (USPS Priority)" value={`~$${est.shipEst}`} />
                  : <Row label="Shipping" value="Enter zip code above to estimate" />
                }
              </div>

              <div style={{
                background: 'rgba(59,130,246,.06)', borderRadius: 12, padding: '14px 18px',
                fontSize: 13, color: '#94a3b8', lineHeight: 1.6, marginBottom: 24,
                border: '1px solid rgba(59,130,246,.08)', textAlign: 'left',
              }}>
                This is an estimate. Final pricing confirmed after we review your files and specs. Shipping cost will be added at time of order if not estimated above.
              </div>

              {/* Pay Now */}
              <button
                onClick={handlePayNow}
                disabled={paying}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  background: paying ? 'rgba(16,185,129,.4)' : 'linear-gradient(135deg,#10b981,#059669)',
                  color: '#fff', border: 'none', borderRadius: 12, padding: '16px 36px',
                  fontSize: 16, fontWeight: 700, fontFamily: 'inherit', cursor: paying ? 'not-allowed' : 'pointer',
                  boxShadow: '0 0 40px rgba(16,185,129,.3),0 4px 20px rgba(0,0,0,.3)',
                  transition: 'all .2s ease', marginBottom: 12, width: '100%', justifyContent: 'center',
                }}
              >
                {paying ? '⏳ Redirecting to checkout…' : `💳 Pay Now — $${est.total.toLocaleString()}`}
              </button>

              {payError && (
                <div style={{ fontSize: 13, color: '#ef4444', marginBottom: 12, background: 'rgba(239,68,68,.08)', borderRadius: 8, padding: '10px 14px', border: '1px solid rgba(239,68,68,.2)' }}>
                  {payError}
                </div>
              )}

              <div style={{ fontSize: 12, color: '#4b5563', marginBottom: 20 }}>
                Secure checkout · All major cards accepted
              </div>

              <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,.06)', marginBottom: 18 }} />

              <a href="tel:7206791230" style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                background: 'rgba(59,130,246,.1)', color: '#93c5fd', border: '1px solid rgba(59,130,246,.2)',
                borderRadius: 12, padding: '12px 28px', fontSize: 14, fontWeight: 600,
                textDecoration: 'none', fontFamily: 'inherit',
              }}>📞 Prefer to call? (720) 679-1230</a>

              <div style={{ marginTop: 14 }}>
                <button onClick={reset} style={{
                  background: 'none', border: '1px solid rgba(255,255,255,.1)', color: '#64748b',
                  borderRadius: 8, padding: '10px 22px', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer',
                }}>↺ Start Over</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />

      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        input::-webkit-outer-spin-button,input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
        input[type=number]{-moz-appearance:textfield}
        textarea:focus,input:focus{border-color:rgba(59,130,246,.4)!important;outline:none}
      `}</style>
    </div>
  );
}
