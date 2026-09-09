/**
 * verify-films.ts — focused checks for the films-and-pricing compatibility logic.
 *
 * Run:  node scripts/verify-films.ts     (Node 22+, native TS + JSON modules)
 *
 * There is no test runner wired into this repo (see api/_lib/*.test.ts — they are
 * standalone node scripts too), so this follows the same pattern: independent
 * assertions, a printed tally, and a non-zero exit on any failure.
 *
 * It exercises the REAL engine (src/lib/filmCompatibility.ts) and also re-reads
 * film-page-data.json independently to cross-check the data it is fed.
 */

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  data,
  dataIntegrity,
  evaluateSelection,
  groupedRates,
  resolveGlassColumn,
  type CompatResult,
  type PaneValue,
  type CoatingValue,
  type SubstrateValue,
  type Selection,
} from '../src/lib/filmCompatibility.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const raw = JSON.parse(
  readFileSync(join(__dirname, '..', 'src', 'data', 'film-page-data.json'), 'utf8'),
) as typeof data;

let pass = 0;
let fail = 0;
const fails: string[] = [];

function ok(label: string, cond: boolean, detail = '') {
  if (cond) {
    pass++;
  } else {
    fail++;
    fails.push(`  FAIL  ${label}${detail ? ` — ${detail}` : ''}`);
  }
}

function isUnknown(r: CompatResult): boolean {
  return r.kind === 'unknown';
}
function isList(r: CompatResult): r is Extract<CompatResult, { kind: 'list' }> {
  return r.kind === 'list';
}

const sel = (over: Partial<Selection>): Selection => ({
  conditions: ['none'],
  pane: 'dual',
  coating: 'clear',
  substrate: 'annealed',
  ...over,
});

// ── 1. Data integrity: matches film-summary.txt exactly ─────────────────────
const di = dataIntegrity();
ok('36 films', di.films === 36, `got ${di.films}`);
ok('972 film-and-glass combinations', di.combos === 972 && di.cells === 972, `${di.combos}/${di.cells}`);
ok('624 Safe cells', di.safe === 624, `got ${di.safe}`);
ok('22 Use-caution cells', di.caution === 22, `got ${di.caution}`);
ok('326 Not-safe cells', di.notSafe === 326, `got ${di.notSafe}`);
ok('Not-safe ≈ one in three', Math.round(di.combos / di.notSafe) === 3, `${di.combos}/${di.notSafe}`);

// every ruling is exactly G/A/R, and per-film counts + arrays agree with the grid
for (const f of raw.films) {
  let s = 0;
  let a = 0;
  let r = 0;
  for (const c of raw.glass_columns) {
    for (const su of raw.substrates) {
      const v = f.rulings[c]?.[su];
      ok(`${f.film} ${c}/${su} is G/A/R`, v === 'G' || v === 'A' || v === 'R', String(v));
      if (v === 'G') s++;
      else if (v === 'A') a++;
      else if (v === 'R') r++;
    }
  }
  ok(
    `${f.film} counts match grid`,
    s === f.counts.safe && a === f.counts.use_caution && r === f.counts.not_safe,
    `grid ${s}/${a}/${r} vs counts ${f.counts.safe}/${f.counts.use_caution}/${f.counts.not_safe}`,
  );
  ok(
    `${f.film} safe/caution/notSafe arrays match grid`,
    s === f.safe.length && a === f.use_caution.length && r === f.not_safe.length,
    `grid ${s}/${a}/${r} vs arrays ${f.safe.length}/${f.use_caution.length}/${f.not_safe.length}`,
  );
}

// ── 2. 'X Series 7mil Clear' appears nowhere as a film ──────────────────────
ok(
  "'X Series 7mil Clear' is not a film",
  !raw.films.some((f) => /x series 7mil clear/i.test(f.film) || /x series 7mil clear/i.test(f.price_group)),
);
ok(
  "'X Series 7mil Clear' is listed as excluded",
  raw.excluded_from_page.some((x) => /X Series 7mil Clear/.test(x)),
);

// ── 3. Pricing groups vs per-film rulings ───────────────────────────────────
const rows = groupedRates();
for (const row of rows) {
  const members = raw.films.filter((f) => f.price_group === row.priceGroup);
  ok(`${row.priceGroup}: one price across the group`, new Set(members.map((m) => m.price_per_sqft)).size === 1);
}
// a group whose members have DIFFERENT rulings must still produce separate rows
const uv = evaluateSelection(sel({ pane: 'triple', coating: 'clear', substrate: 'annealed' }));
if (isList(uv)) {
  const uv5 = [...uv.safe, ...uv.caution, ...uv.notSafe].find((x) => x.film === 'Ultra View 5');
  const uv25 = [...uv.safe, ...uv.caution, ...uv.notSafe].find((x) => x.film === 'Ultra View 25');
  ok('Ultra View 5 and 25 share a price', uv5?.priceLabel === uv25?.priceLabel && uv5?.priceLabel === '$11/sq ft');
  ok(
    'Ultra View 5 and 25 get DIFFERENT rulings on Clear Triple Pane / Annealed',
    uv5?.ruling === 'G' && uv25?.ruling === 'R',
    `uv5=${uv5?.ruling} uv25=${uv25?.ruling}`,
  );
} else {
  ok('Ultra View split case produced a list', false, uv.kind);
}
// every exact film — including its VLT number — gets its own row
if (isList(uv)) {
  const allRows = [...uv.safe, ...uv.caution, ...uv.notSafe];
  ok('every one of the 36 films has its own result row', allRows.length === 36, `got ${allRows.length}`);
  ok('rows are per exact film name (no dedupe by price)', new Set(allRows.map((r) => r.film)).size === 36);
}

// ── 4. Every "I don't know" returns UNKNOWN, never a list ───────────────────
ok("pane = I don't know -> unknown", isUnknown(evaluateSelection(sel({ pane: 'unknown' }))));
ok("coating = I don't know -> unknown", isUnknown(evaluateSelection(sel({ coating: 'unknown' }))));
ok("substrate = I don't know -> unknown", isUnknown(evaluateSelection(sel({ substrate: 'unknown' }))));
const idk = evaluateSelection(sel({ substrate: 'unknown' }));
ok(
  "I don't know uses the approved reassurance copy",
  idk.kind === 'unknown' && idk.message.startsWith('That’s the normal answer—most people don’t know.'),
  idk.kind === 'unknown' ? idk.message : idk.kind,
);

// ── 5. Unsupported glass conditions return UNKNOWN, never a list ─────────────
for (const c of ['wired', 'crack', 'chip', 'fogged', 'existing-film'] as const) {
  ok(`condition "${c}" -> unknown`, isUnknown(evaluateSelection(sel({ conditions: [c] }))));
}
// tinted dual / tinted triple have no chart column -> unknown
ok('tinted dual pane -> unknown', isUnknown(evaluateSelection(sel({ pane: 'dual', coating: 'tinted' }))));
ok('tinted triple pane -> unknown', isUnknown(evaluateSelection(sel({ pane: 'triple', coating: 'tinted' }))));
// single pane + Low-E has no chart column -> unknown
ok('single pane + Low-E #2 -> unknown', isUnknown(evaluateSelection(sel({ pane: 'single', coating: 'lowe2' }))));
// triple + #3 / triple + both are not assumed -> unknown
ok('triple pane + Low-E #3 -> unknown', isUnknown(evaluateSelection(sel({ pane: 'triple', coating: 'lowe3' }))));
ok('triple pane + two Low-E surfaces -> unknown', isUnknown(evaluateSelection(sel({ pane: 'triple', coating: 'both' }))));

// a "none of these" + fully-known combo DOES return a list
ok('fully-known combo returns a list', isList(evaluateSelection(sel({}))));

// ── 6. Blackout is approved only where the JSON explicitly allows ───────────
const blackoutJson = raw.films.find((f) => f.film === 'Blackout')!;
const blackoutSafe = new Set(blackoutJson.safe);
ok(
  'Blackout JSON: safe only on tempered single-pane',
  blackoutSafe.size === 2 &&
    blackoutSafe.has('Single Pane / Tempered') &&
    blackoutSafe.has('Tinted Single Pane / Tempered'),
  [...blackoutSafe].join(', '),
);
function blackoutRuling(r: CompatResult): string | undefined {
  if (!isList(r)) return undefined;
  return [...r.safe, ...r.caution, ...r.notSafe].find((x) => x.film === 'Blackout')?.ruling;
}
ok('Blackout Safe on single + clear + tempered', blackoutRuling(evaluateSelection(sel({ pane: 'single', coating: 'clear', substrate: 'tempered' }))) === 'G');
ok('Blackout Safe on tinted single + tempered', blackoutRuling(evaluateSelection(sel({ pane: 'single', coating: 'tinted', substrate: 'tempered' }))) === 'G');
ok('Blackout Not safe on single + clear + annealed', blackoutRuling(evaluateSelection(sel({ pane: 'single', coating: 'clear', substrate: 'annealed' }))) === 'R');
ok('Blackout Not safe on dual + clear + tempered', blackoutRuling(evaluateSelection(sel({ pane: 'dual', coating: 'clear', substrate: 'tempered' }))) === 'R');

// ── 7. Sealant charges: exclusive, and match category ──────────────────────
for (const f of raw.films) {
  if (f.exterior) ok(`${f.film}: exterior sealant is $2/lineal ft`, f.sealant_per_lineal_ft === 2, String(f.sealant_per_lineal_ft));
  if (f.category === 'security') ok(`${f.film}: security sealant is $4/lineal ft`, f.sealant_per_lineal_ft === 4, String(f.sealant_per_lineal_ft));
  ok(`${f.film}: not both exterior AND security`, !(f.exterior && f.category === 'security'));
}
// a caution row on an exterior film still carries exactly one sealant note
if (isList(uv)) {
  const extRow = [...uv.safe, ...uv.caution, ...uv.notSafe].find((r) => r.film === 'Ext Pristine 70');
  ok('Ext Pristine 70 result carries the $2 exterior sealant note', !!extRow?.sealantNote && extRow.sealantNote.includes('$2'));
}

// ── 8. Glass-column mapping table ──────────────────────────────────────────
const MAP_CASES: [PaneValue, CoatingValue, string | null][] = [
  ['single', 'clear', 'Single Pane'],
  ['single', 'tinted', 'Tinted Single Pane'],
  ['single', 'lowe2', null],
  ['dual', 'clear', 'Clear Dual Pane'],
  ['dual', 'lowe2', 'Low-E #2 Surface Dual Pane'],
  ['dual', 'lowe3', 'Low-E #3 Surface Dual Pane'],
  ['dual', 'both', 'Low-E Surface #2 and #3 Double Pane'],
  ['dual', 'tinted', null],
  ['triple', 'clear', 'Clear Triple Pane'],
  ['triple', 'lowe2', 'Low-E #2 Surface Triple Pane'],
  ['triple', 'lowe3', null],
  ['triple', 'both', null],
  ['unknown', 'clear', null],
];
for (const [p, c, want] of MAP_CASES) {
  const got = resolveGlassColumn(p, c);
  ok(`map ${p}+${c} -> ${want ?? 'UNKNOWN'}`, got === want, `got ${got}`);
  if (want) ok(`  ...and "${want}" is a real chart column`, raw.glass_columns.includes(want));
}

// substrate coverage: every non-unknown substrate answer resolves to a real column value
for (const s of ['annealed', 'laminated', 'tempered'] as SubstrateValue[]) {
  const r = evaluateSelection(sel({ substrate: s }));
  ok(`substrate ${s} yields a list on a known combo`, isList(r));
}

// ── Done ──────────────────────────────────────────────────────────────────
console.log(`\nfilm compatibility checks: ${pass} passed, ${fail} failed`);
if (fail) {
  console.log(fails.join('\n'));
  process.exit(1);
}
console.log('ALL GOOD');
