import { sanitizeHtml } from "./sanitize-html.ts";

const VECTORS = [
  `<img src=x onerror=alert(1)>`,
  `<IMG SRC=x ONERROR=alert(1)>`,
  `<img src="x" onerror="alert(1)">`,
  `<svg onload=alert(1)>`,
  `<svg><script>alert(1)</script></svg>`,
  `<iframe src="javascript:alert(1)"></iframe>`,
  `<a href="javascript:alert(1)">click</a>`,
  `<a href="JaVaScRiPt:alert(1)">click</a>`,
  `<a href="java&#115;cript:alert(1)">click</a>`,
  `<a href="java\tscript:alert(1)">click</a>`,
  `<a href="&#106;avascript:alert(1)">x</a>`,
  `<a href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">x</a>`,
  `<a href="vbscript:msgbox(1)">x</a>`,
  `<body onload=alert(1)>`,
  `<div style="background:url(javascript:alert(1))">x</div>`,
  `<form action="https://evil"><input name=x></form>`,
  `<object data="evil.swf"></object>`,
  `<embed src="evil.swf">`,
  `<script>alert(1)</script>`,
  `<scr<script>ipt>alert(1)</script>`,
  `<img src=x onerror=alert(1)//`,
  `<<SCRIPT>alert(1);//<</SCRIPT>`,
  `<img """><script>alert(1)</script>">`,
  `<input onfocus=alert(1) autofocus>`,
  `<video><source onerror=alert(1)>`,
  `<math><mi xlink:href="javascript:alert(1)">x</mi></math>`,
  `<table background="javascript:alert(1)">`,
  `<div onmouseover="alert(1)">hover</div>`,
  `<a href="#" onclick="alert(1)">x</a>`,
  `<meta http-equiv="refresh" content="0;url=javascript:alert(1)">`,
  `<base href="https://evil/">`,
  `<link rel=stylesheet href="evil.css">`,
  `<img srcset="x" onerror=alert(1)>`,
  `<button formaction="javascript:alert(1)">x</button>`,
  `<template><script>alert(1)</script></template>`,
  `<noscript><p title="</noscript><img src=x onerror=alert(1)>">`,
  `<style>@import"evil.css";</style>`,
  `<div><!--<img src=x onerror=alert(1)>--></div>`,
];

// Only a REAL tag can execute. Escaped output (&lt;img onerror=…) is inert text, so
// every pattern here requires a literal "<" that survived sanitisation.
const DANGER = /<\s*(script|iframe|object|embed|form|svg|style|meta|base|link|input|button)\b|<[^>]*\son[a-z]+\s*=|<[^>]*(javascript|vbscript):|<[^>]*data:text\/html/i;

let fail = 0;
console.log("=== XSS VECTORS (output must contain no executable construct) ===");
for (const v of VECTORS) {
  const out = sanitizeHtml(v);
  const bad = DANGER.test(out);
  if (bad) { console.log(`  FAIL  ${v.slice(0,55)}\n        -> ${out.slice(0,90)}`); fail++; }
}
console.log(`  ${VECTORS.length - fail}/${VECTORS.length} neutralised`);

console.log("\n=== LEGITIMATE BLOG CONTENT (must survive) ===");
const KEEP: [string, RegExp][] = [
  [`<p>Hello <strong>world</strong> and <em>friends</em>.</p>`, /<p>Hello <strong>world<\/strong>/],
  [`<h2>Heading</h2><p>Body copy.</p>`, /<h2>Heading<\/h2>/],
  [`<a href="https://ikonic303.com">Visit</a>`, /<a href="https:\/\/ikonic303\.com"[^>]*>Visit<\/a>/],
  [`<img src="https://cdn.example/x.jpg" alt="A wrap">`, /<img src="https:\/\/cdn\.example\/x\.jpg" alt="A wrap" \/>/],
  [`<ul><li>One</li><li>Two</li></ul>`, /<ul><li>One<\/li><li>Two<\/li><\/ul>/],
  [`<blockquote>Quoted</blockquote>`, /<blockquote>Quoted<\/blockquote>/],
  [`<a href="/services">Relative</a>`, /href="\/services"/],
  [`<a href="mailto:info@ikonicmarketing303.com">Mail</a>`, /mailto:/],
  [`<table><tr><td colspan="2">Cell</td></tr></table>`, /<td colspan="2">Cell<\/td>/],
  [`<p>Ampersand &amp; entity</p>`, /&amp;/],
];
for (const [inp, want] of KEEP) {
  const out = sanitizeHtml(inp);
  if (!want.test(out)) { console.log(`  FAIL  ${inp}\n        -> ${out}`); fail++; }
}
console.log(`  ${KEEP.length}/${KEEP.length} checked`);

console.log("\n=== external links get rel=noopener ===");
const a = sanitizeHtml(`<a href="https://evil.com">x</a>`);
console.log("  ", a);
if (!/rel="noopener noreferrer nofollow"/.test(a)) fail++;

console.log("\n=== unknown tags unwrap, text preserved ===");
const u = sanitizeHtml(`<marquee>keep this text</marquee><custom-el>and this</custom-el>`);
console.log("  ", u);
if (!/keep this text/.test(u) || !/and this/.test(u)) fail++;

console.log(`\nRESULT: ${fail === 0 ? "ALL GOOD" : fail + " FAILURES"}`);
