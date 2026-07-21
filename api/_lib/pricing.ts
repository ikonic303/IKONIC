/**
 * SERVER-OWNED PRICING — the single source of truth for what a Print & Ship order costs.
 *
 * WHY THIS FILE EXISTS (2026-07-21 security audit): the price used to be computed in
 * src/pages/PrintAndShip.tsx and POSTed to /api/create-checkout-session, which passed it
 * to Square with only a `total > 0` check. A browser value is a REQUEST, never a FACT —
 * anyone could name their own price, or mint an arbitrary payment link on the live Ikonic
 * merchant account. The client may now only send a SPEC; the price is derived here.
 *
 * The maths below is a deliberate mirror of the original client calculation so customers
 * see no price change. If a rate changes, change it HERE and let the client read it — never
 * the other way round, or the two drift and the server silently starts refusing valid carts.
 */

export const ROLL_WIDTH_IN = 54;

export interface Material {
  id: string;
  name: string;
  rate: number;
  hasLam: boolean;
  lamRate: number;
}

export const MATERIALS: Material[] = [
  { id: 'avery', name: 'Avery 1105', rate: 36, hasLam: true, lamRate: 0 },
  { id: '3m_cal', name: '3M Calendered Film', rate: 30, hasLam: true, lamRate: 0 },
  { id: 'metallic', name: 'Metallic Film', rate: 108, hasLam: true, lamRate: 0 },
  { id: 'perf', name: 'Window Perf (One-Way Vision)', rate: 25, hasLam: false, lamRate: 7 },
];

export const LAM_OPTIONS = [
  { id: 'gloss', name: 'Gloss', mult: 1 },
  { id: 'satin', name: 'Satin', mult: 1 },
  { id: 'sparkle', name: 'Sparkle', mult: 3 },
  { id: 'none', name: 'No Laminate', mult: 1 },
];

export const DESIGN_FEE = 500;
export const AI_REWORK_FEE = 400;

/** Hard bounds. A real order cannot exceed these; anything outside is rejected, not clamped. */
const MAX_DIM_IN = 600; // 50 ft — longer than any roll we print in one piece
const MAX_QTY = 500;

/**
 * Absurdity backstop, NOT a business rule.
 *
 * Sized from the real price curve, not guessed: across realistic configurations
 * (panels up to 60"x180", qty up to 20) totals reach ~$62k at p99 and ~$98k for a
 * fully-loaded metallic/sparkle job with design + AI rework. An earlier $25,000 cap
 * would have rejected genuine orders — differential testing caught it. This ceiling
 * exists only to stop a nonsense figure reaching Square.
 *
 * ⚠️ BUSINESS DECISION FOR JOSH, deliberately not made here: whether self-serve online
 * checkout should accept a $90k order at all, or route anything above (say) $5k to a
 * phone call. Set CHECKOUT_MAX_USD in Vercel to enforce a lower threshold — the
 * rejection already tells the customer to call.
 */
const MAX_TOTAL_USD = Number(process.env.CHECKOUT_MAX_USD) || 100000;

export interface OrderSpec {
  material: string;
  lamination: string;
  widthIn: number;
  heightIn: number;
  qty: number;
  needDesign: boolean;
  aiRework: boolean;
  zip?: string;
}

export interface PricedOrder {
  linearFeet: number;
  printCost: number;
  designCost: number;
  aiCost: number;
  shipEst: number;
  total: number;
  description: string;
}

export function estimateShipping(linearFeet: number): number {
  return Math.round(28 + Math.min(linearFeet, 20) * 1.5);
}

/**
 * Validate a client-supplied spec and price it.
 * Throws on anything that isn't a well-formed, in-bounds order — callers should 400.
 */
export function priceOrder(raw: unknown): PricedOrder {
  if (!raw || typeof raw !== 'object') throw new Error('Missing order spec');
  const spec = raw as Record<string, unknown>;

  const material = MATERIALS.find((m) => m.id === spec.material);
  if (!material) throw new Error('Unknown material');

  const lam = LAM_OPTIONS.find((l) => l.id === spec.lamination);
  if (!lam) throw new Error('Unknown lamination option');

  const widthIn = Number(spec.widthIn);
  const heightIn = Number(spec.heightIn);
  const qty = Number(spec.qty);

  for (const [label, v, max] of [
    ['width', widthIn, MAX_DIM_IN],
    ['height', heightIn, MAX_DIM_IN],
    ['quantity', qty, MAX_QTY],
  ] as const) {
    if (!Number.isFinite(v) || v <= 0) throw new Error(`Invalid ${label}`);
    if (v > max) throw new Error(`${label} exceeds the maximum for an online order`);
  }
  if (!Number.isInteger(qty)) throw new Error('Invalid quantity');

  const needDesign = spec.needDesign === true;
  const aiRework = spec.aiRework === true;
  const zip = typeof spec.zip === 'string' && /^\d{5}$/.test(spec.zip) ? spec.zip : '';

  // ── mirror of the original client maths ────────────────────────────────────
  const dimA = Math.min(widthIn, heightIn);
  const dimB = Math.max(widthIn, heightIn);
  const across = Math.floor(ROLL_WIDTH_IN / dimA) || 1;
  const sets = Math.ceil(qty / across);
  const linearFeet = Math.ceil((sets * dimB / 12) * 100) / 100;

  let printCost: number;
  if (material.hasLam) {
    printCost = linearFeet * material.rate * lam.mult;
  } else if (spec.lamination === 'none') {
    printCost = linearFeet * material.rate;
  } else {
    printCost = (linearFeet * material.rate + linearFeet * material.lamRate) * lam.mult;
  }

  const designCost = needDesign ? DESIGN_FEE : 0;
  const aiCost = aiRework ? AI_REWORK_FEE : 0;
  const shipEst = zip ? estimateShipping(linearFeet) : 0;

  // Mirror the client's DOUBLE rounding exactly: it rounds to cents first, then to whole
  // dollars. Collapsing that to a single Math.round() differs by $1 on values landing near
  // x.4999 (caught by differential test — 7 cases in 3607). The customer must be charged
  // the figure they were shown, to the dollar.
  const toCents = Math.round((printCost + designCost + aiCost + shipEst) * 100) / 100;
  const total = Math.round(toCents);

  if (!Number.isFinite(total) || total <= 0) throw new Error('Could not price this order');
  if (total > MAX_TOTAL_USD) throw new Error('Order exceeds the online maximum — please call us');

  // Built server-side from validated values only. NEVER echo a client-supplied string here:
  // this becomes the Square line-item name, and a caller-controlled name is how an arbitrary
  // payment link ("Invoice #4471 — Roofing deposit") gets minted on our merchant account.
  const description =
    `${qty}x ${widthIn}"x${heightIn}" ${material.name}` +
    (spec.lamination !== 'none' ? ` + ${lam.name} Lam` : '');

  return {
    linearFeet: Math.round(linearFeet * 100) / 100,
    printCost: Math.round(printCost),
    designCost,
    aiCost,
    shipEst,
    total,
    description,
  };
}
