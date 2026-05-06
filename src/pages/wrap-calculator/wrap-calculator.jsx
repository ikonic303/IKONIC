import { useState, useEffect, useRef } from "react";

const VEHICLES = {
  "Sedan / Coupe": { sqft: [50, 65], icon: "🚗" },
  "SUV / Crossover": { sqft: [60, 80], icon: "🚙" },
  "Pickup Truck": { sqft: [55, 75], icon: "🛻" },
  "Cargo Van": { sqft: [80, 120], icon: "🚐" },
  "Sprinter / Transit": { sqft: [120, 180], icon: "🚌" },
  "Box Truck (16–26ft)": { sqft: [180, 350], icon: "📦" },
  "Flatbed / Trailer": { sqft: [200, 400], icon: "🚛" },
  "Fleet Vehicle (per unit)": { sqft: [50, 120], icon: "🏢" },
};

const COVERAGE = {
  "Full Wrap": { multiplier: 1.0, label: "Complete coverage — maximum impact" },
  "Partial Wrap": { multiplier: 0.55, label: "Strategic panels — great ROI" },
  "Spot Graphics / Lettering": { multiplier: 0.25, label: "Logo, phone, essentials" },
};

const MATERIALS = {
  "Premium Cast Vinyl (3M / Avery)": { perSqFt: [8, 14], desc: "Industry gold standard — vibrant, durable, 7+ year life" },
  "Standard Calendered Vinyl": { perSqFt: [5, 9], desc: "Reliable quality — great for fleet & high-volume jobs" },
  "Reflective Vinyl": { perSqFt: [12, 18], desc: "Visible day & night — ideal for service vehicles" },
  "Chrome / Specialty Finish": { perSqFt: [16, 28], desc: "Head-turning metallic & specialty looks" },
};

export default function WrapCalculator() {
  const [vehicle, setVehicle] = useState("");
  const [coverage, setCoverage] = useState("");
  const [material, setMaterial] = useState("");
  const [step, setStep] = useState(1);
  const [showResult, setShowResult] = useState(false);
  const [mounted, setMounted] = useState(false);
  const resultRef = useRef(null);

  useEffect(() => {
    setTimeout(() => setMounted(true), 100);
  }, []);

  const calculate = () => {
    if (!vehicle || !coverage || !material) return null;
    const v = VEHICLES[vehicle];
    const c = COVERAGE[coverage];
    const m = MATERIALS[material];
    const low = Math.round(v.sqft[0] * c.multiplier * m.perSqFt[0]);
    const high = Math.round(v.sqft[1] * c.multiplier * m.perSqFt[1]);
    return { low, high };
  };

  const handleCalculate = () => {
    setShowResult(true);
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 200);
  };

  const reset = () => {
    setVehicle("");
    setCoverage("");
    setMaterial("");
    setStep(1);
    setShowResult(false);
  };

  const estimate = calculate();

  const impressionsLow = vehicle
    ? Math.round(VEHICLES[vehicle].sqft[0] * 500).toLocaleString()
    : "30,000";
  const impressionsHigh = vehicle
    ? Math.round(VEHICLES[vehicle].sqft[1] * 900).toLocaleString()
    : "70,000";

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0e1a",
      fontFamily: "'Outfit', sans-serif",
      color: "#e8e8e8",
      overflow: "hidden",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />

      {/* Ambient bg */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 80% 60% at 20% 10%, rgba(30,58,138,0.15), transparent), radial-gradient(ellipse 60% 50% at 80% 90%, rgba(30,58,138,0.08), transparent)",
      }} />

      {/* Noise texture */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", opacity: 0.03,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 720, margin: "0 auto", padding: "0 20px" }}>

        {/* Header */}
        <header style={{
          paddingTop: 48, paddingBottom: 40, textAlign: "center",
          opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(-20px)",
          transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 24,
          }}>
            <svg width="38" height="28" viewBox="0 0 38 28" fill="none">
              <path d="M0 28L12 4L19 16L26 4L38 28H32L26 16L19 28L12 16L6 28H0Z" fill="#3b82f6"/>
              <path d="M8 28L12 20L16 28H8Z" fill="#60a5fa" opacity="0.6"/>
              <path d="M22 28L26 20L30 28H22Z" fill="#60a5fa" opacity="0.6"/>
            </svg>
            <span style={{
              fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em",
              background: "linear-gradient(135deg, #e8e8e8, #9ca3af)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              ikonic
            </span>
          </div>

          <h1 style={{
            fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 900, letterSpacing: "-0.03em",
            lineHeight: 1.1, margin: "0 0 12px",
            background: "linear-gradient(135deg, #ffffff 0%, #94a3b8 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Wrap Quote Calculator
          </h1>
          <p style={{
            fontSize: 16, color: "#64748b", maxWidth: 480, margin: "0 auto", lineHeight: 1.6, fontWeight: 400,
          }}>
            Get a ballpark estimate for your commercial vehicle wrap in 30 seconds. Select your vehicle, coverage, and material below.
          </p>
        </header>

        {/* Step 1: Vehicle */}
        <Section
          num="01"
          title="Vehicle Type"
          delay={200}
          mounted={mounted}
          active={step >= 1}
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
            {Object.entries(VEHICLES).map(([name, data]) => (
              <OptionCard
                key={name}
                selected={vehicle === name}
                onClick={() => { setVehicle(name); setStep(Math.max(step, 2)); }}
                icon={data.icon}
                label={name}
                sub={null}
              />
            ))}
          </div>
        </Section>

        {/* Step 2: Coverage */}
        <Section
          num="02"
          title="Wrap Coverage"
          delay={400}
          mounted={mounted}
          active={step >= 2}
        >
          <div style={{ display: "grid", gap: 10 }}>
            {Object.entries(COVERAGE).map(([name, data]) => (
              <OptionBar
                key={name}
                selected={coverage === name}
                onClick={() => { setCoverage(name); setStep(Math.max(step, 3)); }}
                label={name}
                sub={data.label}
              />
            ))}
          </div>
        </Section>

        {/* Step 3: Material */}
        <Section
          num="03"
          title="Material"
          delay={600}
          mounted={mounted}
          active={step >= 3}
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
            {Object.entries(MATERIALS).map(([name, data]) => (
              <OptionBar
                key={name}
                selected={material === name}
                onClick={() => { setMaterial(name); }}
                label={name}
                sub={data.desc}
              />
            ))}
          </div>
        </Section>

        {/* Calculate button */}
        {vehicle && coverage && material && !showResult && (
          <div style={{ textAlign: "center", padding: "32px 0", animation: "fadeUp 0.5s ease" }}>
            <button
              onClick={handleCalculate}
              style={{
                background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                color: "#fff", border: "none", borderRadius: 12,
                padding: "18px 48px", fontSize: 17, fontWeight: 700,
                fontFamily: "inherit", cursor: "pointer", letterSpacing: "-0.01em",
                boxShadow: "0 0 40px rgba(59,130,246,0.3), 0 4px 20px rgba(0,0,0,0.3)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={e => { e.target.style.transform = "scale(1.04)"; e.target.style.boxShadow = "0 0 60px rgba(59,130,246,0.4), 0 8px 30px rgba(0,0,0,0.3)"; }}
              onMouseLeave={e => { e.target.style.transform = "scale(1)"; e.target.style.boxShadow = "0 0 40px rgba(59,130,246,0.3), 0 4px 20px rgba(0,0,0,0.3)"; }}
            >
              Get My Estimate →
            </button>
          </div>
        )}

        {/* Result */}
        {showResult && estimate && (
          <div ref={resultRef} style={{
            margin: "32px 0", padding: 0,
            animation: "fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
          }}>
            <div style={{
              background: "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(30,58,138,0.12))",
              border: "1px solid rgba(59,130,246,0.2)",
              borderRadius: 20, padding: "40px 32px", textAlign: "center",
              position: "relative", overflow: "hidden",
            }}>
              {/* Glow */}
              <div style={{
                position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)",
                width: 300, height: 120, background: "radial-gradient(ellipse, rgba(59,130,246,0.15), transparent)",
                pointerEvents: "none",
              }} />

              <div style={{
                fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em",
                color: "#3b82f6", marginBottom: 8,
              }}>
                Estimated Range
              </div>

              <div style={{
                fontSize: "clamp(36px, 7vw, 56px)", fontWeight: 900, letterSpacing: "-0.03em",
                background: "linear-gradient(135deg, #ffffff, #60a5fa)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                lineHeight: 1.1, marginBottom: 6,
              }}>
                ${estimate.low.toLocaleString()} – ${estimate.high.toLocaleString()}
              </div>

              <div style={{ fontSize: 14, color: "#64748b", marginBottom: 28 }}>
                for {coverage.toLowerCase()} on {vehicle.toLowerCase()}
              </div>

              {/* Stats row */}
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16,
                borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 24, marginBottom: 28,
              }}>
                <Stat label="Daily Impressions" value={`${impressionsLow}–${impressionsHigh}`} />
                <Stat label="Est. CPM" value="~$0.04" />
                <Stat label="Wrap Life" value="5–7 years" />
              </div>

              <div style={{
                background: "rgba(59,130,246,0.06)", borderRadius: 12, padding: "16px 20px",
                fontSize: 13, color: "#94a3b8", lineHeight: 1.6, marginBottom: 28,
                border: "1px solid rgba(59,130,246,0.08)",
              }}>
                This is a ballpark estimate. Final pricing depends on vehicle condition, design complexity, and turnaround. We'll give you an exact quote after a quick look at the vehicle.
              </div>

              {/* CTA */}
              <a
                href="tel:7206791230"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 10,
                  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                  color: "#fff", borderRadius: 12, padding: "16px 36px",
                  fontSize: 17, fontWeight: 700, textDecoration: "none",
                  fontFamily: "inherit", letterSpacing: "-0.01em",
                  boxShadow: "0 0 40px rgba(59,130,246,0.25), 0 4px 20px rgba(0,0,0,0.3)",
                  transition: "all 0.2s ease",
                }}
              >
                📞 Call (720) 679-1230
              </a>

              <div style={{ marginTop: 16 }}>
                <button
                  onClick={reset}
                  style={{
                    background: "none", border: "1px solid rgba(255,255,255,0.1)",
                    color: "#64748b", borderRadius: 8, padding: "10px 24px",
                    fontSize: 13, fontFamily: "inherit", cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={e => { e.target.style.borderColor = "rgba(255,255,255,0.2)"; e.target.style.color = "#94a3b8"; }}
                  onMouseLeave={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.color = "#64748b"; }}
                >
                  ↺ Start Over
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer style={{
          textAlign: "center", padding: "48px 0 32px",
          borderTop: "1px solid rgba(255,255,255,0.04)",
          marginTop: 40,
        }}>
          <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.8 }}>
            <span style={{ fontWeight: 600, color: "#4b5563" }}>ikonic Marketing 303</span>
            <br />
            Commercial Vehicle Wraps & Digital Marketing for Contractors
            <br />
            Denver Metro — Wheat Ridge, CO
            <br />
            <a href="tel:7206791230" style={{ color: "#3b82f6", textDecoration: "none" }}>(720) 679-1230</a>
          </div>
        </footer>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }
      `}</style>
    </div>
  );
}

function Section({ num, title, children, delay, mounted, active }) {
  return (
    <div style={{
      marginBottom: 28,
      opacity: mounted && active ? 1 : 0.25,
      transform: mounted ? "translateY(0)" : "translateY(20px)",
      transition: `all 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      pointerEvents: active ? "auto" : "none",
    }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 14 }}>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 600,
          color: "#3b82f6", opacity: 0.7,
        }}>
          {num}
        </span>
        <h2 style={{
          fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", color: "#e2e8f0",
        }}>
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

function OptionCard({ selected, onClick, icon, label, sub }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: selected
          ? "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(59,130,246,0.06))"
          : hovered
          ? "rgba(255,255,255,0.03)"
          : "rgba(255,255,255,0.015)",
        border: selected ? "1px solid rgba(59,130,246,0.4)" : "1px solid rgba(255,255,255,0.06)",
        borderRadius: 14, padding: "18px 16px", cursor: "pointer",
        textAlign: "left", fontFamily: "inherit",
        transition: "all 0.2s ease",
        transform: selected ? "scale(1.02)" : "scale(1)",
      }}
    >
      <div style={{ fontSize: 26, marginBottom: 8 }}>{icon}</div>
      <div style={{
        fontSize: 14, fontWeight: 600, color: selected ? "#e2e8f0" : "#94a3b8",
        marginBottom: 2, letterSpacing: "-0.01em",
      }}>
        {label}
      </div>
      {sub && <div style={{
        fontSize: 12, color: "#4b5563",
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        {sub}
      </div>}
    </button>
  );
}

function OptionBar({ selected, onClick, label, sub, pct }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: selected
          ? "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(59,130,246,0.06))"
          : hovered
          ? "rgba(255,255,255,0.03)"
          : "rgba(255,255,255,0.015)",
        border: selected ? "1px solid rgba(59,130,246,0.4)" : "1px solid rgba(255,255,255,0.06)",
        borderRadius: 14, padding: "16px 20px", cursor: "pointer",
        textAlign: "left", fontFamily: "inherit",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
        transition: "all 0.2s ease",
      }}
    >
      <div>
        <div style={{
          fontSize: 14, fontWeight: 600, color: selected ? "#e2e8f0" : "#94a3b8",
          letterSpacing: "-0.01em", marginBottom: 2,
        }}>
          {label}
        </div>
        <div style={{ fontSize: 12, color: "#4b5563" }}>{sub}</div>
      </div>
      {pct !== undefined && (
        <div style={{
          fontSize: 12, fontWeight: 600, color: "#3b82f6",
          fontFamily: "'JetBrains Mono', monospace",
          opacity: 0.7, flexShrink: 0,
        }}>
          {pct}%
        </div>
      )}
      {selected && (
        <div style={{
          width: 22, height: 22, borderRadius: "50%",
          background: "linear-gradient(135deg, #3b82f6, #2563eb)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, fontSize: 13, color: "#fff",
        }}>
          ✓
        </div>
      )}
    </button>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div style={{
        fontSize: "clamp(16px, 3vw, 20px)", fontWeight: 800, color: "#e2e8f0",
        letterSpacing: "-0.02em", fontFamily: "'JetBrains Mono', monospace",
      }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: "#4b5563", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {label}
      </div>
    </div>
  );
}
