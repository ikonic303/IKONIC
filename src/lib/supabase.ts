import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client for the proof system (/proof/:token and /proof-manager).
 *
 * CHANGED 2026-07-21 (security audit). Two problems with the previous version:
 *
 * 1. The project ref and anon key were HARDCODED in a PUBLIC repository. An anon key is
 *    designed to ship in a browser bundle, so this is not a rotation emergency — but
 *    hardcoding it means the key cannot be rotated without a code change and a deploy,
 *    and it ties a public repo to a specific project forever. It now comes from env.
 *
 * 2. The hardcoded project (`gvypahxaefchjqdflxik.supabase.co`) NO LONGER EXISTS — DNS
 *    returns NXDOMAIN as of 2026-07-21. The deployed bundle contains no Supabase code at
 *    all, so nothing is broken in production today, but HEAD would have shipped a client
 *    pointed at a dead backend on the next deploy: every proof page failing at runtime.
 *
 * ⚠️ BEFORE RE-ENABLING THE PROOF SYSTEM — READ THIS.
 * `/proof/:token` is PUBLIC and UNAUTHENTICATED, and it does select/update on `proofs`
 * and insert on `annotations` as the anon role. Row Level Security is therefore the
 * ENTIRE security model. The `.eq('token', …)` filter in ProofClient.tsx is client-side
 * sugar — Postgres never sees it, so an RLS policy of `USING (true)` would let anyone
 * with the (public) anon key read every row: the full customer list, project names and
 * proof images, and approve someone else's artwork into production.
 *
 * So, on the new project, before pointing this at it:
 *   select * from pg_policies where tablename in ('proofs','annotations');
 * Every policy must be scoped by the token, not `true`. If token-scoped RLS is awkward,
 * move the client-facing path behind a Vercel function holding the service key instead.
 */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.warn(
    'Supabase is not configured — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. ' +
      'The proof pages will not work until it is.'
  );
}

// Constructed with empty strings when unconfigured so imports don't throw at module load;
// callers should check isSupabaseConfigured and show a clear message instead of failing
// with an opaque network error.
export const supabase = createClient(SUPABASE_URL ?? '', SUPABASE_ANON_KEY ?? '');
