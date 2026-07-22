import { priceOrder } from "./pricing.ts";

// ── independent transcription of the ORIGINAL client math (PrintAndShip.tsx, pre-fix) ──
const _ROLL_W = 54;
const MATERIALS = [
  { id: 'avery', name: 'Avery 1105', rate: 36, hasLam: true, lamRate: 0 },
  { id: '3m_cal', name: '3M Calendered Film', rate: 30, hasLam: true, lamRate: 0 },
  { id: 'metallic', name: 'Metallic Film', rate: 108, hasLam: true, lamRate: 0 },
  { id: 'perf', name: 'Window Perf (One-Way Vision)', rate: 25, hasLam: false, lamRate: 7 },
];
const LAM = [
  { id: 'gloss', mult: 1 }, { id: 'satin', mult: 1 }, { id: 'sparkle', mult: 3 }, { id: 'none', mult: 1 },
];
const _DESIGN = 500, _AI = 400;
const estShip = (lf: number) => Math.round(28 + Math.min(lf, 20) * 1.5);

function clientTotal(w: number, h: number, qty: number, mat: string, lamType: string, needDesign: boolean, ai: boolean, zip: string) {
  const dimA = Math.min(w, h), dimB = Math.max(w, h);
  const across = Math.floor(_ROLL_W / dimA) || 1;
  const sets = Math.ceil(qty / across);
  const linearFeet = Math.ceil((sets * dimB / 12) * 100) / 100;
  const m = MATERIALS.find(x => x.id === mat)!, l = LAM.find(x => x.id === lamType)!;
  let printCost: number;
  if (m.hasLam) printCost = linearFeet * m.rate * l.mult;
  else if (lamType === 'none') printCost = linearFeet * m.rate;
  else printCost = (linearFeet * m.rate + linearFeet * m.lamRate) * l.mult;
  const shipEst = zip ? estShip(linearFeet) : 0;
  const total = Math.round((printCost + (needDesign ? _DESIGN : 0) + (ai ? _AI : 0) + shipEst) * 100) / 100;
  return Math.round(total);
}

let n = 0, bad = 0;
const mats = MATERIALS.map(m => m.id), lams = LAM.map(l => l.id);
for (let i = 0; i < 4000; i++) {
  const w = 1 + (i * 7) % 200, h = 1 + (i * 13) % 300, qty = 1 + (i * 3) % 40;
  const mat = mats[i % mats.length], lamType = lams[i % lams.length];
  const needDesign = i % 3 === 0, ai = i % 5 === 0, zip = i % 2 === 0 ? '80033' : '';
  const want = clientTotal(w, h, qty, mat, lamType, needDesign, ai, zip);
  if (want > 100000) continue; // above the absurdity backstop — expected reject, not a mismatch
  const got = priceOrder({ material: mat, lamination: lamType, widthIn: w, heightIn: h, qty, needDesign, aiRework: ai, zip }).total;
  n++;
  if (got !== want) { bad++; if (bad <= 5) console.log(`  MISMATCH w=${w} h=${h} q=${qty} ${mat}/${lamType} design=${needDesign} ai=${ai} zip=${!!zip} -> server ${got}, client ${want}`); }
}
console.log(`\nchecked ${n} orders, ${bad} mismatches`);

console.log("\n=== rejection tests (all must THROW) ===");
const bads: [string, any][] = [
  ["negative total", { material:'avery', lamination:'gloss', widthIn:-5, heightIn:10, qty:1 }],
  ["zero qty", { material:'avery', lamination:'gloss', widthIn:10, heightIn:10, qty:0 }],
  ["unknown material", { material:'gold', lamination:'gloss', widthIn:10, heightIn:10, qty:1 }],
  ["unknown lam", { material:'avery', lamination:'diamond', widthIn:10, heightIn:10, qty:1 }],
  ["NaN width", { material:'avery', lamination:'gloss', widthIn:'abc', heightIn:10, qty:1 }],
  ["oversize", { material:'metallic', lamination:'sparkle', widthIn:599, heightIn:599, qty:500 }],
  ["fractional qty", { material:'avery', lamination:'gloss', widthIn:10, heightIn:10, qty:1.5 }],
  ["null spec", null],
  ["Infinity", { material:'avery', lamination:'gloss', widthIn:Infinity, heightIn:10, qty:1 }],
];
let rfail = 0;
for (const [label, spec] of bads) {
  try { const r = priceOrder(spec); console.log(`  FAIL ${label} -> accepted, total ${r.total}`); rfail++; }
  catch (e: any) { console.log(`  ok   ${label} -> rejected (${e.message})`); }
}
console.log(`\nRESULT: ${bad === 0 && rfail === 0 ? "ALL GOOD" : "PROBLEMS"}`);
