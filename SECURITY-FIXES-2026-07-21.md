# Security fixes — 2026-07-21

Branch: `security/hardening-2026-07-21` · 5 commits · 27 files · +1198 / −176

Every fix below was verified by executing it, not by reading it. Two of the defects were
confirmed live against production before being fixed.

---

## How to review and push

```bash
cd /path/to/your/IKONIC          # your own clone
git remote add fix /home/josh/.claude/jobs/b421e99c/tmp/IKONIC   # or apply the patch file
git fetch fix security/hardening-2026-07-21
git checkout -b security/hardening-2026-07-21 fix/security/hardening-2026-07-21

git log --oneline master..HEAD   # 5 commits
git diff master...HEAD           # full diff

npm install                      # picks up engines + overrides, drops one devDep
npm run build                    # must pass: tsc -b && vite build && prerender
git push -u origin security/hardening-2026-07-21
```

Open a PR rather than pushing to `master` — Vercel will build a preview so you can click
through Print & Ship, the blog and a proof link before it reaches the live domain.

**If you want containment only, right now:** cherry-pick the first commit alone
(`9c1d763`). It 503s the checkout endpoint and nothing else. Everything after it is the
real fix.

---

## ⚠️ Five things only you can do — the code changes do NOT cover these

1. **Set the new env vars in Vercel** (all documented in `.env.example`):
   `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `GHL_PROOF_WEBHOOK_URL`.
   Without the Supabase pair the proof pages stay non-functional — which is the current
   state anyway, since the old project no longer exists.

2. **Create a NEW GHL webhook trigger and DELETE the old one.** The trigger
   `…/webhook-trigger/23d15f93-…` has been public since 2026-04-16, in both the JS bundle
   and the git history of a public repo. Moving it server-side stops *future* exposure;
   it does not un-publish it. Anyone who saved it can still fire it. Check what workflow
   sits behind it first — if that workflow sends SMS or email, treat this as urgent.

3. **Before reviving the proof system, verify Supabase RLS.** `/proof/:token` is public
   and unauthenticated and does select/update as the anon role, so RLS is the *entire*
   security model. The `.eq('token', …)` filter is client-side sugar Postgres never sees.
   Run: `select * from pg_policies where tablename in ('proofs','annotations');`
   Any policy using `true` means anyone with the (public) anon key can read your whole
   customer list and approve artwork into production.

4. **Run `npm audit` once from a networked machine.** My advisory data stops at Jan 2026,
   and `openai`, `@google/genai`, `stripe`, `resend`, `@supabase/supabase-js`, `zod`,
   `react` and `vite` all post-date that. This is the one gap the audit could not close.

5. **Confirm the Vercel Node runtime is 22.x.** `engines` is now pinned in
   `package.json`, but the project setting in the dashboard wins.

---

## What changed, and why

### CRITICAL — anyone could mint Square payment links on your live merchant account
`api/create-checkout-session.ts`

The handler read `total`, `description` and `successUrl` from the request body with only
a `total > 0` check. The price was computed in the browser and trusted verbatim.

That is not merely a discount bug. Any stranger could `POST` a payment link for **any
amount with any description** — `{"total":4500,"description":"Invoice #4471 — Roofing
deposit"}` — use it to defraud a third party, and the money would land in your Square
account. Chargebacks, fraud review, possible account freeze. `successUrl` was unvalidated
too, so the real Square checkout page was an open redirect.

**Fixed:** the client now sends a *spec*; `api/_lib/pricing.ts` owns the price table,
derives the total, builds the Square line-item name itself, and pins the redirect to
`SITE_ORIGIN`. Rate limited. Square errors are logged, not returned.

**Verified:** `api/_lib/pricing.test.ts` differentially tests the server against the
original client formula — **3,607 orders, 0 mismatches**; 9 malformed specs rejected.
That test caught two bugs in my own fix before they shipped: a $25k cap that would have
rejected genuine $60k+ jobs, and a $1 drift because the client double-rounds.

### CRITICAL (confirmed live) — one GET pinned a lambda for 60 seconds
`api/blog.ts`

`ROUTES[action]` was a raw property lookup, so `?action=constructor` (or `toString`,
`valueOf`, …) resolved to an `Object.prototype` member, passed the `if (!route)` check,
was invoked as a handler, and never sent a response.

**Confirmed against production before the fix:** `GET /api/blog?action=constructor` hung
for 65 seconds and returned zero bytes. A few hundred parallel requests would have
exhausted your function concurrency and taken the blog down for the cost of a shell loop.

**Fixed:** gated on `hasOwnProperty`. 8 prototype vectors closed, 5/5 real routes intact.

### CRITICAL — a free public LLM proxy billed to your Gemini key
`api/_lib/blog/generate-post.ts` — **deleted**

No auth, no rate limit, no size cap, publicly routed, and the caller's `topic` was
interpolated straight into the prompt. A 4.5 MB body is roughly a million input tokens
*per request*. Its only callers were the ViralBot mockup pages.

**Fixed:** endpoint, route and rewrite deleted. ViralBot routes unrouted in the same
commit — it also stored user passwords in **plaintext** in `localStorage` behind a
client-side-only trial gate. The page files remain in `src/pages/` if you ever revive it;
auth must be rebuilt on Supabase Auth first.

### HIGH — every rate limit in the codebase was bypassable
`api/_lib/guard.ts`

`clientIp()` read the **first** `x-forwarded-for` element — the attacker-controlled
position, since proxies *append*. A random XFF per request gave every request its own
bucket, silently defeating the 3/hour limit on the Gemini endpoint that exists purely to
stop an unbounded bill. Compounding it: when KV was configured but erroring the limiter
fell back to per-instance memory (no limit at all under Vercel's per-request instances),
and `memHits.clear()` at 5,000 keys wiped *everyone's* counters at once.

**Fixed:** prefers the platform-set `x-vercel-forwarded-for` / `x-real-ip`, else the last
XFF hop. Fails **closed** when KV errors, as the file's own header always claimed. Evicts
only expired entries.

### HIGH — `POST` to the reviews endpoint billed Google on every call
`api/google-reviews.ts`

No method check at all. `s-maxage` only caches GET/HEAD, so every POST bypassed the CDN
and made a live Place Details call including the `reviews` field — Google's most
expensive Places SKU (~$17/1,000). An unauthenticated loop was a five-figure bill.

**Fixed:** GET/HEAD only, rate limited, upstream status no longer echoed.

### HIGH — open mail relay into your business inbox
`api/sticker-notify.ts`

Unauthenticated and unlimited. Every customer/product field was interpolated into the
email **unescaped**, so a caller could author the entire message — a convincing "ACTION
REQUIRED" invoice arriving from your own site — with an arbitrary attachment. Looping it
burned the Resend quota that carries your generator lead emails. Lost leads, not just
spam. `order:{}` also crashed outside the try block.

**Fixed:** rate limited, every field escaped and length-capped, payload shape validated,
attachments size- and type-restricted with path components stripped. Verified against
injection payloads, malformed money fields and path-traversal filenames.

### HIGH — stored XSS in the blog
`api/_lib/sanitize-html.ts` (new), `api/_lib/blog/blog-post.ts`

Blog HTML is scraped from GoHighLevel and was "cleaned" by regex-stripping `<script>`,
`<style>`, `<nav>`, `<header>`, `<footer>` — then rendered via `dangerouslySetInnerHTML`
and baked into the prerendered static shells. That removes *elements* but leaves every
*attribute* vector: `<img src=x onerror=…>`, `<svg onload=…>`, `<iframe>`, `javascript:`
hrefs, `<form action=…>` all survived. Anyone able to author a GHL post — a staff
account, a compromised session — got arbitrary JS on the `ikonic303.com` origin.

**Fixed:** allowlist sanitizer, no new dependency. Applied at both content choke points
so the live page and the prerendered shells are covered from one place.
**Verified:** 38/38 XSS vectors neutralised, 10/10 legitimate blog constructs preserved.

Also fixed JSON-LD injection in `scripts/prerender-routes.mjs`: `JSON.stringify` does not
escape `/`, so a GHL title containing `</script>` broke out and executed *before React
mounted* and for JS-disabled crawlers.

### MEDIUM — one $250 deposit could buy unlimited generations
`api/generate-website.ts`, `api/_lib/guard.ts`

The token was read at the top of the handler and deleted ~40s later, after Gemini
returned. Concurrent requests with one paid token all saw `status:'paid'` before any
delete landed. **Verified: 10 concurrent requests → 10 generations before the fix, 1
after.**

**Fixed:** atomic `SET NX` claim, with the claim released on generation failure so a
paying customer can retry immediately rather than waiting out the TTL — a detail that
matters because you don't do refunds.

### MEDIUM — a link scanner could publish your blog posts
`api/_lib/blog/publish-blog.ts`

It published on **GET**, so any mail-client link scanner or URL prefetcher that touched a
publish link in your inbox published the post silently. POST-only would have broken the
emailed link, so GET now renders a confirm page and only POST publishes. Scanners issue
GET and change nothing.

`auto-blog-generate` and `unpublish` also accepted `?secret=CRON_SECRET`, which lands in
access logs, browser history and `Referer`. Header-only now, compared with
`timingSafeEqual`. Vercel cron supplies the header itself, so the cron is unaffected.

### MEDIUM — no security headers at all
`vercel.json` had no `headers` block. Added `nosniff`, `X-Frame-Options: DENY`,
`Referrer-Policy`, `Permissions-Policy`, and a CSP in **Report-Only** mode.

The CSP is deliberately not enforcing yet: the site loads Meta Pixel, the GHL chat
widget, a GHL form embed and Google Fonts, all of which inject inline script/style. Ship
it, watch for violations, tune, then rename the key to `Content-Security-Policy`. Turning
it on blind would break the site.

### Also
- `src/lib/supabase.ts`: hardcoded project ref + anon key in a **public repo**, pointed at
  a project that returns NXDOMAIN. Now env-based, with the RLS requirement documented.
- `api/proof-webhook.ts` (new): the GHL webhook now relays server-side with an allowlisted
  event set and length-capped fields.
- `package.json`: `engines` pinned to Node 22 (nothing pinned it; Node 20 went EOL
  2026-04-30), `overrides` for `path-to-regexp` CVE-2024-45296 and `undici`
  CVE-2025-22150, removed the unreferenced `kimi-plugin-inspect-react`.
- `robots.txt`: disallow `/proof-manager` and `/proof/` — discovery hygiene, not a control.

---

## Deliberately not done

- **Public price book — you accepted this.** Wrap prices, the $15/sqft basis, the sticker
  base rate and the discount ladder remain readable in the bundle; the calculators earn
  their keep as lead generators. Recorded as a deliberate exception to the
  no-public-pricing rule (which still applies to social, GBP and artwork).
- **Git history rewrite — not needed.** All 192 commits across 17 branches were swept:
  no vendor API key was ever committed. The `zi8cPaIE` `.gitignore` entry is clean — no
  file by that name ever existed in any of 876 blobs.
- **`.git` exposure — ruled out.** `/.git/config` returns 200, but the body is the SPA
  "Page Not Found" shell. It's a soft-404, not a breach.
- **Six named testimonials** in `src/sections/TestimonialsSection.tsx` carry specific
  metrics. If those aren't real, consented customers that's FTC exposure — a business
  question for you, not a security bug, so I left them alone.

## Verify after deploy

| Check | Expected |
|---|---|
| `GET /api/blog?action=constructor` | `400` immediately (was: 65s hang) |
| `POST /api/create-checkout-session {"spec":{...}}` with a tampered price | price ignored; Square amount matches the spec |
| `POST /api/google-reviews` | `405`; `GET` twice → `x-vercel-cache: HIT` |
| 6 rapid posts to a guarded endpoint, each with a different `X-Forwarded-For` | still `429` |
| `curl -I https://ikonic303.com` | new headers present |
| A blog post containing `<img src=x onerror=...>` | renders inert in both the React page and the prerendered shell |
| 3 concurrent generations, one paid token | exactly one succeeds |
| `/print-ship` | completes a real test order end to end |
