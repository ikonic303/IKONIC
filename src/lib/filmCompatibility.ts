/**
 * filmCompatibility.ts — pure logic for the /window-tint/films-and-pricing page.
 *
 * WHAT THIS IS
 * A rate card + a glass-compatibility FILTER. It is NOT a quote engine. There is
 * deliberately no square-footage input, no computed project total, no travel-fee
 * math, and no price schema. It answers one question: "given the glass a homeowner
 * can describe, which exact films does the manufacturer's chart approve?"
 *
 * SOURCE OF TRUTH
 * Every compatibility ruling and every price comes from ../data/film-page-data.json,
 * which was transcribed from Edge Film Technologies' "Architectural Film to Glass
 * Chart". Nothing in this file hard-codes a ruling — we only read, map, and group.
 *
 * RULING UNIT vs PRICE UNIT
 * A ruling is per EXACT film (VLT number). A price is per GROUP. Two films that
 * share a price ("Ultra View 5/15/25/35" all cost $11/sq ft) can have different
 * rulings on the same glass, so compatibility results are always rendered per exact
 * film and never collapsed to a price group.
 */

import filmPageData from '../data/film-page-data.json' with { type: 'json' };

// ── Types ────────────────────────────────────────────────────────────────────

export type Ruling = 'G' | 'A' | 'R';
export type StatusLabel = 'Safe' | 'Use caution' | 'Not safe';
export type FilmCategory = 'solar' | 'security' | 'antigraffiti' | 'decorative';

export interface Film {
  film: string;
  price_group: string;
  category: FilmCategory;
  price_per_sqft: number;
  sealant_per_lineal_ft: number | null;
  exterior: boolean;
  note: string | null;
  safety_block: string | null;
  counts: { safe: number; use_caution: number; not_safe: number };
  safe: string[];
  use_caution: string[];
  not_safe: string[];
  rulings: Record<string, Record<string, Ruling>>;
}

export interface Restriction {
  id: number;
  edge_words: string;
  applies: string;
  max_sqft_per_pane?: number;
  max_thickness_in?: number;
  max_sqft?: number;
}

export interface FilmPageData {
  legend: Record<Ruling, string>;
  glass_columns: string[];
  substrates: string[];
  restrictions: Restriction[];
  unknown_glass: string[];
  job_minimum: number;
  minimum_before_travel: boolean;
  excluded_from_page: string[];
  films: Film[];
}

export const data = filmPageData as unknown as FilmPageData;

// ── Filter question option values ────────────────────────────────────────────
// These strings are UI copy, not compatibility data. Every question includes an
// explicit "I don't know" — selecting it anywhere returns UNKNOWN, never a list.

export type ConditionValue = 'none' | 'wired' | 'crack' | 'chip' | 'fogged' | 'existing-film';
export type PaneValue = 'single' | 'dual' | 'triple' | 'unknown';
export type CoatingValue = 'clear' | 'lowe2' | 'lowe3' | 'both' | 'tinted' | 'unknown';
export type SubstrateValue = 'annealed' | 'laminated' | 'tempered' | 'unknown';

export interface FilterOption<T extends string> {
  value: T;
  label: string;
  hint?: string;
}

export const CONDITION_OPTIONS: FilterOption<ConditionValue>[] = [
  { value: 'none', label: 'None of these' },
  {
    value: 'wired',
    label: 'Wired glass',
    hint: 'A fine wire mesh embedded in the glass, common in older doors and stairwells.',
  },
  { value: 'crack', label: 'An existing crack' },
  { value: 'chip', label: 'A chip or bullseye' },
  {
    value: 'fogged',
    label: 'Fogging or moisture between the panes',
    hint: 'A hazy or wet look inside a sealed double-pane unit — the seal has failed.',
  },
  { value: 'existing-film', label: 'Window film already on it' },
];

export const PANE_OPTIONS: FilterOption<PaneValue>[] = [
  { value: 'single', label: 'Single pane', hint: 'One layer of glass. Common in homes built before the 1990s.' },
  { value: 'dual', label: 'Dual pane', hint: 'Two layers of glass with a sealed air gap. The most common today.' },
  { value: 'triple', label: 'Triple pane', hint: 'Three layers of glass. Usually newer, high-efficiency windows.' },
  { value: 'unknown', label: "I don't know" },
];

export const COATING_OPTIONS: FilterOption<CoatingValue>[] = [
  { value: 'clear', label: 'Clear / uncoated', hint: 'Plain glass with no low-emissivity (Low-E) coating.' },
  { value: 'lowe2', label: 'Low-E on surface #2' },
  { value: 'lowe3', label: 'Low-E on surface #3' },
  { value: 'both', label: 'Low-E on two surfaces' },
  { value: 'tinted', label: 'Factory-tinted (grey/bronze/green in the glass itself)' },
  {
    value: 'unknown',
    label: "I don't know",
    hint: 'Low-E coatings are invisible. If a window sticker or invoice doesn’t say, choose this.',
  },
];

export const SUBSTRATE_OPTIONS: FilterOption<SubstrateValue>[] = [
  { value: 'annealed', label: 'Annealed (standard)', hint: 'Ordinary float glass. The default unless a window is marked otherwise.' },
  { value: 'laminated', label: 'Laminated', hint: 'Two glass layers bonded to a plastic interlayer — stays together when broken.' },
  {
    value: 'tempered',
    label: 'Tempered',
    hint: 'Heat-treated safety glass. Usually has a small etched stamp in a bottom corner. Not sure? Select "I don’t know."',
  },
  { value: 'unknown', label: "I don't know" },
];

// ── Glass-column mapping ─────────────────────────────────────────────────────
// The chart has 9 glass columns. A homeowner's answers only map cleanly to some
// of them. Anything without an exact column returns null -> UNKNOWN -> on-site
// assessment. We never guess a column.

const SUBSTRATE_LABEL: Record<Exclude<SubstrateValue, 'unknown'>, string> = {
  annealed: 'Annealed',
  laminated: 'Laminated',
  tempered: 'Tempered',
};

const COLUMN_MAP: Record<string, string> = {
  'single:clear': 'Single Pane',
  'single:tinted': 'Tinted Single Pane',
  'dual:clear': 'Clear Dual Pane',
  'dual:lowe2': 'Low-E #2 Surface Dual Pane',
  'dual:lowe3': 'Low-E #3 Surface Dual Pane',
  'dual:both': 'Low-E Surface #2 and #3 Double Pane',
  'triple:clear': 'Clear Triple Pane',
  'triple:lowe2': 'Low-E #2 Surface Triple Pane',
  // Intentionally absent, all -> null -> UNKNOWN:
  //  single + any Low-E   : the chart has no Low-E single-pane column.
  //  dual/triple + tinted : "Tinted DUAL/TRIPLE pane has no column on this chart" (film-summary.txt).
  //  triple + lowe3       : no #3-only triple column.
  //  triple + both        : the only 2-surface triple column is "#2 and #5"; we will not
  //                         assume a homeowner's "two surfaces" means that exact build.
};

export function resolveGlassColumn(pane: PaneValue, coating: CoatingValue): string | null {
  if (pane === 'unknown' || coating === 'unknown') return null;
  return COLUMN_MAP[`${pane}:${coating}`] ?? null;
}

// ── Result shapes ───────────────────────────────────────────────────────────

export interface FilmResult {
  film: string;
  priceGroup: string;
  category: FilmCategory;
  pricePerSqft: number;
  priceLabel: string;
  ruling: Ruling;
  status: StatusLabel;
  sealantNote: string | null;
  note: string | null;
  safetyBlock: string | null;
}

export type CompatResult =
  | { kind: 'unknown'; headline: string; message: string }
  | {
      kind: 'list';
      glassColumn: string;
      substrate: string;
      safe: FilmResult[];
      caution: FilmResult[];
      notSafe: FilmResult[];
      restrictions: RestrictionNote[];
    };

export interface RestrictionNote {
  text: string;
  source: 'manufacturer' | 'ikonic';
}

export interface Selection {
  conditions: ConditionValue[];
  pane: PaneValue;
  coating: CoatingValue;
  substrate: SubstrateValue;
}

const STATUS_LABEL: Record<Ruling, StatusLabel> = { G: 'Safe', A: 'Use caution', R: 'Not safe' };

const UNKNOWN_HEADLINE = "We’ll check this one on site";
// Exact approved copy for the "I don't know" path:
const UNKNOWN_IDK_MESSAGE =
  "That’s the normal answer—most people don’t know. We’ll identify your glass on site, free, before we quote.";

const CONDITION_PHRASE: Record<Exclude<ConditionValue, 'none'>, string> = {
  wired: 'wired (mesh) glass',
  crack: 'an existing crack',
  chip: 'a chip or bullseye',
  fogged: 'a failed seal (fogging between the panes)',
  'existing-film': 'film already applied',
};

function describeConditions(flags: ConditionValue[]): string {
  const phrases = flags
    .filter((f): f is Exclude<ConditionValue, 'none'> => f !== 'none')
    .map((f) => CONDITION_PHRASE[f]);
  if (phrases.length === 1) return phrases[0];
  if (phrases.length === 2) return `${phrases[0]} or ${phrases[1]}`;
  return `${phrases.slice(0, -1).join(', ')}, or ${phrases[phrases.length - 1]}`;
}

function priceLabel(f: Film): string {
  return `$${f.price_per_sqft}/sq ft`;
}

function sealantNote(f: Film): string | null {
  if (!f.sealant_per_lineal_ft) return null;
  if (f.category === 'security') {
    return `Security film — add $${f.sealant_per_lineal_ft} per lineal foot for edge sealing.`;
  }
  if (f.exterior) {
    return `Exterior film — add $${f.sealant_per_lineal_ft} per lineal foot for edge sealing.`;
  }
  return null;
}

function toFilmResult(f: Film, ruling: Ruling): FilmResult {
  return {
    film: f.film,
    priceGroup: f.price_group,
    category: f.category,
    pricePerSqft: f.price_per_sqft,
    priceLabel: priceLabel(f),
    ruling,
    status: STATUS_LABEL[ruling],
    sealantNote: sealantNote(f),
    note: f.note,
    safetyBlock: f.safety_block,
  };
}

function byPriceThenName(a: FilmResult, b: FilmResult): number {
  return a.pricePerSqft - b.pricePerSqft || a.film.localeCompare(b.film);
}

// Manufacturer restrictions are DISPLAYED alongside a result, never applied to
// change a ruling here — the page collects no measurements. They can only ever
// make a real-world verdict more restrictive, never less; surfacing them keeps
// that caveat in front of the reader.
function restrictionsFor(pane: Exclude<PaneValue, 'unknown'>): RestrictionNote[] {
  const notes: RestrictionNote[] = [];
  for (const r of data.restrictions) {
    if (r.applies === 'single' && pane !== 'single') continue;
    if (r.applies === 'dual' && pane !== 'dual') continue;
    notes.push({ text: r.edge_words, source: 'manufacturer' });
  }
  if (pane === 'triple') {
    notes.push({
      text:
        'ikonic applies the same 40-square-foot-per-pane cap to triple-pane glass as a conservative in-house rule. This is our rule, not the film manufacturer’s.',
      source: 'ikonic',
    });
  }
  return notes;
}

// ── The evaluator ───────────────────────────────────────────────────────────

export function evaluateSelection(sel: Selection): CompatResult {
  // 1. Window-condition gate. Any flagged condition -> on-site assessment, no list.
  const flagged = sel.conditions.filter((c) => c !== 'none');
  if (flagged.length > 0) {
    return {
      kind: 'unknown',
      headline: UNKNOWN_HEADLINE,
      message: `Glass with ${describeConditions(
        flagged,
      )} has to be looked at in person before we can name a film. We do that on site, free, before any quote.`,
    };
  }

  // 2. Any "I don't know" -> the approved reassurance message, no list.
  if (sel.pane === 'unknown' || sel.coating === 'unknown' || sel.substrate === 'unknown') {
    return { kind: 'unknown', headline: UNKNOWN_HEADLINE, message: UNKNOWN_IDK_MESSAGE };
  }

  // 3. Map the answers to an exact chart column. No column -> no guess, no list.
  const column = resolveGlassColumn(sel.pane, sel.coating);
  if (column === null) {
    return {
      kind: 'unknown',
      headline: UNKNOWN_HEADLINE,
      message:
        'That glass build isn’t on the manufacturer’s chart, so we won’t guess at it. We’ll identify it on site, free, before we quote.',
    };
  }

  // 4. Fully-supported combo: split every EXACT film by its own ruling.
  const substrate = SUBSTRATE_LABEL[sel.substrate];
  const safe: FilmResult[] = [];
  const caution: FilmResult[] = [];
  const notSafe: FilmResult[] = [];

  for (const f of data.films) {
    const ruling = f.rulings[column]?.[substrate];
    if (ruling === 'G') safe.push(toFilmResult(f, 'G'));
    else if (ruling === 'A') caution.push(toFilmResult(f, 'A'));
    else if (ruling === 'R') notSafe.push(toFilmResult(f, 'R'));
  }

  safe.sort(byPriceThenName);
  caution.sort(byPriceThenName);
  notSafe.sort(byPriceThenName);

  return {
    kind: 'list',
    glassColumn: column,
    substrate,
    safe,
    caution,
    notSafe,
    restrictions: restrictionsFor(sel.pane),
  };
}

// ── Rate-card helpers (Section 2) ───────────────────────────────────────────

export interface RateRow {
  priceGroup: string;
  films: string[];
  category: FilmCategory;
  pricePerSqft: number;
  priceLabel: string;
  sealantPerLinealFt: number | null;
  exterior: boolean;
  note: string | null;
  safetyBlock: string | null;
}

export function groupedRates(): RateRow[] {
  const order: string[] = [];
  const byGroup = new Map<string, RateRow>();
  for (const f of data.films) {
    let row = byGroup.get(f.price_group);
    if (!row) {
      row = {
        priceGroup: f.price_group,
        films: [],
        category: f.category,
        pricePerSqft: f.price_per_sqft,
        priceLabel: `$${f.price_per_sqft}/sq ft`,
        sealantPerLinealFt: f.sealant_per_lineal_ft,
        exterior: f.exterior,
        note: f.note,
        safetyBlock: f.safety_block,
      };
      byGroup.set(f.price_group, row);
      order.push(f.price_group);
    }
    row.films.push(f.film);
    if (!row.note && f.note) row.note = f.note;
    if (!row.safetyBlock && f.safety_block) row.safetyBlock = f.safety_block;
  }
  return order.map((g) => byGroup.get(g)!);
}

export function securityRateRows(): RateRow[] {
  return groupedRates().filter((r) => r.category === 'security');
}

export function primaryRateRows(): RateRow[] {
  return groupedRates().filter((r) => r.category !== 'security');
}

// ── Static policy + reference copy ──────────────────────────────────────────
// Pricing conditions and restriction wording. Not compatibility rulings; the
// dollar figures that can be read from the data are read from the data.

const EXT_SEALANT = data.films.find((f) => f.exterior)?.sealant_per_lineal_ft ?? 2;
const SEC_SEALANT = data.films.find((f) => f.category === 'security')?.sealant_per_lineal_ft ?? 4;

export const RATE_CONDITIONS: string[] = [
  `$${data.job_minimum} job minimum.`,
  `Exterior and X-Series films require edge sealing at $${EXT_SEALANT} per lineal foot.`,
  `Security film edge sealing is $${SEC_SEALANT} per lineal foot.`,
  `No film is ever charged both edge-sealing rates.`,
  `Glass that cannot be safely reached from the floor is quoted separately after an on-site assessment.`,
  `Travel may apply outside the Denver metro. It’s itemized in your written quote.`,
];

// Exact approved wording for the Blackout callout.
export const BLACKOUT_WARNING =
  'Blackout is approved only on tempered single-pane glass. It is not interchangeable with Frost or Whiteout.';

export const MANUFACTURER_RESTRICTIONS: RestrictionNote[] = [
  ...data.restrictions.map((r): RestrictionNote => ({ text: r.edge_words, source: 'manufacturer' })),
  {
    text:
      'ikonic applies the manufacturer’s 40-square-foot dual-pane cap to triple-pane glass too, as a conservative in-house rule.',
    source: 'ikonic',
  },
];

// Conditions that always route to an on-site assessment and never return a film
// list — surfaced in the UI so the reader knows why the filter stops.
export const ON_SITE_ONLY_CONDITIONS: string[] = [
  'Wired glass',
  'Factory-tinted double- or triple-pane glass',
  'An existing crack or chip',
  'A fogged or failed sealed unit',
  'Glass that already has window film on it',
];

// ── Data integrity (used by scripts/verify-films.ts) ────────────────────────

export function dataIntegrity() {
  const { glass_columns, substrates, films } = data;
  let safe = 0;
  let caution = 0;
  let notSafe = 0;
  let cells = 0;
  for (const f of films) {
    for (const c of glass_columns) {
      for (const s of substrates) {
        const v = f.rulings[c]?.[s];
        cells++;
        if (v === 'G') safe++;
        else if (v === 'A') caution++;
        else if (v === 'R') notSafe++;
      }
    }
  }
  return {
    films: films.length,
    cells,
    safe,
    caution,
    notSafe,
    combos: films.length * glass_columns.length * substrates.length,
  };
}
