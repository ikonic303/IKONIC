// ─────────────────────────────────────────────────────────────────────────────
// Stripe deposit helper for the AI Website Generator.
//
// The generator is gated behind a $250 deposit that is credited toward the
// website build. This module creates the Checkout Session and, critically,
// verifies a session server-side before any AI generation is allowed.
//
// Not a Vercel function (under api/_lib) — imported by the endpoints.
// ─────────────────────────────────────────────────────────────────────────────
import Stripe from 'stripe';

/** $250 deposit, in cents. Credited toward the website build. */
export const DEPOSIT_AMOUNT_CENTS = 25000;
export const DEPOSIT_CURRENCY = 'usd';

/** Marker stamped on deposit sessions so a random paid Stripe session can't unlock the tool. */
export const DEPOSIT_PURPOSE = 'ai-website-deposit';

let client: Stripe | null = null;

/** Lazily construct the Stripe client. Throws if the secret key is missing. */
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY not configured');
  // apiVersion is optional in stripe-node v22 (defaults to the account's version).
  if (!client) client = new Stripe(key);
  return client;
}

export interface CreateDepositArgs {
  origin: string;
  budgetTier: string;
  email?: string;
  /** Extra metadata to carry through checkout (e.g. a lead id). Values must be strings. */
  metadata?: Record<string, string>;
}

/** Create a Checkout Session for the $250 deposit and return its hosted URL. */
export async function createDepositSession(args: CreateDepositArgs): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  return stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: DEPOSIT_CURRENCY,
          unit_amount: DEPOSIT_AMOUNT_CENTS,
          product_data: {
            name: 'Website Build Deposit',
            description: 'Starts your project and goes straight toward your website build.',
          },
        },
      },
    ],
    customer_email: args.email || undefined,
    metadata: {
      purpose: DEPOSIT_PURPOSE,
      budgetTier: args.budgetTier,
      ...(args.metadata || {}),
    },
    success_url: `${args.origin}/ai-website-generator?deposit=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${args.origin}/ai-website-generator?deposit=cancelled`,
  });
}

export type DepositVerifyReason =
  | 'missing_id'
  | 'not_found'
  | 'unpaid'
  | 'wrong_amount'
  | 'wrong_currency'
  | 'wrong_purpose';

export interface DepositVerifyResult {
  ok: boolean;
  reason?: DepositVerifyReason;
  session?: Stripe.Checkout.Session;
}

/**
 * Verify a Stripe Checkout Session server-side. Confirms it exists, is paid,
 * is exactly the $250 deposit, in USD, and carries our deposit-purpose marker.
 * Never trusts client-supplied amounts.
 */
export async function verifyDepositSession(sessionId: string | undefined): Promise<DepositVerifyResult> {
  if (!sessionId || typeof sessionId !== 'string') return { ok: false, reason: 'missing_id' };

  const stripe = getStripe();
  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return { ok: false, reason: 'not_found' };
  }

  if (!session) return { ok: false, reason: 'not_found' };
  if (session.payment_status !== 'paid') return { ok: false, reason: 'unpaid' };
  if (session.amount_total !== DEPOSIT_AMOUNT_CENTS) return { ok: false, reason: 'wrong_amount' };
  if (session.currency !== DEPOSIT_CURRENCY) return { ok: false, reason: 'wrong_currency' };
  if (session.metadata?.purpose !== DEPOSIT_PURPOSE) return { ok: false, reason: 'wrong_purpose' };

  return { ok: true, session };
}
