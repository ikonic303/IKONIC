import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle, RefreshCw, MessageSquare, Loader2, Send, X } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface Proof {
  id: string;
  token: string;
  project_name: string;
  client_name: string;
  file_url: string;
  status: 'pending' | 'approved' | 'revision_requested';
}

interface Annotation {
  id: string;
  x_pct: number;
  y_pct: number;
  comment: string;
  author_name: string | null;
}

interface PendingPin { x: number; y: number; }


// The GHL webhook-trigger URL is a CREDENTIAL — for an inbound webhook, possession of
// the URL is authorisation. It used to be hardcoded here and fired from the browser, so
// it shipped in the public bundle and the public repo. It now lives server-side in
// GHL_PROOF_WEBHOOK_URL; see api/proof-webhook.ts.
async function fireWebhook(payload: object) {
  try {
    await fetch('/api/proof-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (_) { /* silent — a webhook failure must never block the client's approval */ }
}

export default function ProofClient() {
  const { token } = useParams<{ token: string }>();

  const [proof, setProof]           = useState<Proof | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [loading, setLoading]       = useState(true);
  const [notFound, setNotFound]     = useState(false);

  const [pendingPin, setPendingPin]   = useState<PendingPin | null>(null);
  const [pendingText, setPendingText] = useState('');
  const [authorName, setAuthorName]   = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const [actionDone, setActionDone]     = useState<'approved' | 'revision_requested' | null>(null);
  const [revisionNote, setRevisionNote] = useState('');
  const [showRevModal, setShowRevModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!token) { setNotFound(true); setLoading(false); return; }
    async function load() {
      const { data, error } = await supabase.from('proofs').select('*').eq('token', token).single();
      if (error || !data) { setNotFound(true); setLoading(false); return; }
      setProof(data as Proof);
      const { data: annos } = await supabase.from('annotations').select('*').eq('proof_id', data.id).order('created_at');
      setAnnotations((annos ?? []) as Annotation[]);
      setLoading(false);
    }
    load();
  }, [token]);

  function handleImageClick(e: React.MouseEvent<HTMLImageElement>) {
    if (actionDone) return;
    const rect = imgRef.current!.getBoundingClientRect();
    setPendingPin({
      x: ((e.clientX - rect.left) / rect.width)  * 100,
      y: ((e.clientY - rect.top)  / rect.height) * 100,
    });
    setPendingText('');
  }

  async function submitAnnotation() {
    if (!pendingPin || !pendingText.trim() || !proof) return;
    setSubmitting(true);
    const { data } = await supabase.from('annotations').insert({
      proof_id:    proof.id,
      x_pct:       pendingPin.x,
      y_pct:       pendingPin.y,
      comment:     pendingText.trim(),
      author_name: authorName.trim() || null,
    }).select().single();
    if (data) setAnnotations(prev => [...prev, data as Annotation]);
    setPendingPin(null);
    setPendingText('');
    setSubmitting(false);
  }

  async function handleAction(action: 'approved' | 'revision_requested', note?: string) {
    if (!proof) return;
    setActionLoading(true);
    await supabase.from('proofs').update({
      status:         action,
      revision_note:  note ?? null,
      revision_count: action === 'revision_requested' ? (proof as any).revision_count + 1 : undefined,
      updated_at:     new Date().toISOString(),
    }).eq('id', proof.id);
    await fireWebhook({
      event:            action === 'approved' ? 'proof_approved' : 'proof_revision',
      proof_id:         proof.id,
      project_name:     proof.project_name,
      client_name:      proof.client_name,
      token:            proof.token,
      revision_note:    note ?? null,
      annotations_count: annotations.length,
    });
    setActionDone(action);
    setShowRevModal(false);
    setActionLoading(false);
  }

  function downloadPDF() {
    if (!proof || !actionDone) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Proof Review Record', 20, 20);
    doc.setFontSize(12);
    doc.text(`Project: ${proof.project_name}`, 20, 35);
    doc.text(`Client: ${proof.client_name}`, 20, 45);
    doc.text(`Decision: ${actionDone === 'approved' ? 'APPROVED' : 'REVISION REQUESTED'}`, 20, 55);
    doc.text(`Date: ${new Date().toLocaleString()}`, 20, 65);
    if (annotations.length > 0) {
      doc.text('Annotations:', 20, 80);
      let y = 90;
      annotations.forEach((a, i) => {
        doc.text(`${i + 1}. ${a.comment}`, 25, y);
        y += 10;
      });
    }
    doc.save(`proof-review-${proof.project_name.replace(/\s+/g, '-')}.pdf`);
  }

  const OVERLAY: React.CSSProperties = { position: 'fixed', inset: 0, zIndex: 9999, background: '#0b0d10', overflow: 'auto' };

  if (loading) return createPortal(
    <div style={{ ...OVERLAY, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: '#a0a0b0' }}>
      <Loader2 className="w-5 h-5 animate-spin text-mint" /> Loading your proof…
    </div>, document.body
  );

  if (notFound || !proof) return createPortal(
    <div style={{ ...OVERLAY, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
      <div>
        <p className="text-4xl mb-4">🔍</p>
        <h1 className="font-display text-2xl font-bold text-offwhite mb-3">Proof Not Found</h1>
        <p className="text-offwhite-dark">This link may have expired or is invalid.</p>
      </div>
    </div>, document.body
  );

  if (actionDone) {
    const isApproved = actionDone === 'approved';
    return createPortal(
      <div style={{ ...OVERLAY, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="text-center max-w-md">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isApproved ? 'bg-mint/20' : 'bg-red-500/20'}`}>
            {isApproved ? <CheckCircle className="w-10 h-10 text-mint" /> : <RefreshCw className="w-10 h-10 text-red-400" />}
          </div>
          <h1 className="font-display text-3xl font-bold text-offwhite mb-3">
            {isApproved ? 'Proof Approved!' : 'Revision Requested'}
          </h1>
          <p className="text-offwhite-dark mb-2">
            {isApproved
              ? 'Your approval has been recorded. Our team will begin production.'
              : `Your feedback has been sent to the design team.`}
          </p>
          <p className="text-offwhite-dark/60 text-sm mb-8">Thank you, {proof.client_name}!</p>
          <button onClick={downloadPDF}
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-offwhite px-6 py-3 rounded-xl text-sm font-medium transition-all">
            Download PDF Record
          </button>
        </div>
      </div>, document.body
    );
  }

  return createPortal(
    <div style={OVERLAY}>
      {/* Header */}
      <header className="bg-charcoal-light border-b border-white/10 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <img src="/logo-ikonic.webp" alt="Ikonic" className="h-10" />
          <div className="text-right">
            <p className="text-offwhite font-semibold">{proof.project_name}</p>
            <p className="text-offwhite-dark text-xs">Review for {proof.client_name}</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Instructions */}
        <div className="bg-mint/10 border border-mint/20 rounded-xl p-4 mb-6 flex items-start gap-3">
          <MessageSquare className="w-5 h-5 text-mint shrink-0 mt-0.5" />
          <div>
            <p className="text-offwhite font-semibold text-sm">How to review your proof</p>
            <p className="text-offwhite-dark text-xs mt-1">
              Click anywhere on the design to leave a pinned comment. When done, click <strong className="text-offwhite">Approve</strong> or <strong className="text-offwhite">Request Revision</strong>.
            </p>
          </div>
        </div>

        {/* Image */}
        <div className="relative mb-6 rounded-2xl overflow-hidden border border-white/10 cursor-crosshair select-none">
          <img ref={imgRef} src={proof.file_url} alt={proof.project_name}
            className="w-full object-contain" onClick={handleImageClick} draggable={false} />
          {annotations.map((a, i) => (
            <div key={a.id}
              className="absolute w-7 h-7 bg-mint rounded-full flex items-center justify-center text-charcoal text-xs font-bold border-2 border-white shadow-lg -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{ left: `${a.x_pct}%`, top: `${a.y_pct}%` }}>
              {i + 1}
            </div>
          ))}
          {pendingPin && (
            <div className="absolute w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center text-charcoal text-xs font-bold border-2 border-white shadow-lg -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${pendingPin.x}%`, top: `${pendingPin.y}%` }}>?</div>
          )}
        </div>

        {/* Pending annotation input */}
        {pendingPin && (
          <div className="bg-charcoal-light border border-mint/30 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-offwhite font-semibold text-sm">Add comment</p>
              <button onClick={() => setPendingPin(null)}><X className="w-4 h-4 text-offwhite-dark hover:text-offwhite" /></button>
            </div>
            <input type="text" value={authorName} onChange={e => setAuthorName(e.target.value)}
              placeholder="Your name (optional)"
              className="w-full bg-charcoal border border-white/10 rounded-xl px-4 py-2 text-offwhite placeholder-offwhite-dark/40 focus:outline-none focus:border-mint transition-colors text-sm mb-2" />
            <div className="flex gap-2">
              <input type="text" value={pendingText} onChange={e => setPendingText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submitAnnotation()}
                placeholder="Describe the change here…"
                className="flex-1 bg-charcoal border border-white/10 rounded-xl px-4 py-2.5 text-offwhite placeholder-offwhite-dark/40 focus:outline-none focus:border-mint transition-colors text-sm"
                autoFocus />
              <button onClick={submitAnnotation} disabled={submitting || !pendingText.trim()}
                className="bg-mint hover:bg-mint-dark text-charcoal font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 text-sm disabled:opacity-40">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* Annotation list */}
        {annotations.length > 0 && (
          <div className="bg-charcoal-light border border-white/10 rounded-xl p-5 mb-6">
            <p className="text-xs font-semibold text-offwhite-dark uppercase tracking-widest mb-4">
              Your Comments ({annotations.length})
            </p>
            <div className="flex flex-col gap-3">
              {annotations.map((a, i) => (
                <div key={a.id} className="flex gap-3">
                  <div className="w-6 h-6 bg-mint rounded-full flex items-center justify-center text-charcoal text-xs font-bold shrink-0 mt-0.5">{i + 1}</div>
                  <div>
                    <p className="text-offwhite-dark text-sm">{a.comment}</p>
                    {a.author_name && <p className="text-offwhite-dark/50 text-xs">— {a.author_name}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={() => handleAction('approved')} disabled={actionLoading}
            className="flex-1 flex items-center justify-center gap-3 bg-mint hover:bg-mint-dark text-charcoal font-bold py-4 rounded-xl transition-all text-lg hover:-translate-y-0.5 hover:shadow-lg hover:shadow-mint/30 disabled:opacity-40">
            {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
            Approve This Proof
          </button>
          <button onClick={() => setShowRevModal(true)} disabled={actionLoading}
            className="flex-1 flex items-center justify-center gap-3 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-offwhite hover:text-red-400 font-bold py-4 rounded-xl transition-all text-lg disabled:opacity-40">
            <RefreshCw className="w-5 h-5" /> Request Revision
          </button>
        </div>

        {annotations.length > 0 && !pendingPin && (
          <p className="text-center text-offwhite-dark/60 text-xs mt-4">
            {annotations.length} comment{annotations.length !== 1 ? 's' : ''} will be sent with your decision.
          </p>
        )}
      </main>

      {/* Revision note modal */}
      {showRevModal && (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4">
          <div className="bg-charcoal-light border border-white/10 rounded-2xl w-full max-w-md p-6">
            <h3 className="font-display font-bold text-offwhite mb-2">Request Revision</h3>
            <p className="text-offwhite-dark text-sm mb-4">Add an overall note for the design team (optional — your pinned comments above will also be sent).</p>
            <textarea value={revisionNote} onChange={e => setRevisionNote(e.target.value)}
              placeholder="e.g. Please change the phone number and make the logo larger…"
              rows={4}
              className="w-full bg-charcoal border border-white/10 rounded-xl px-4 py-3 text-offwhite placeholder-offwhite-dark/40 focus:outline-none focus:border-mint transition-colors text-sm resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setShowRevModal(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-offwhite font-medium py-3 rounded-xl transition-all text-sm">
                Cancel
              </button>
              <button onClick={() => handleAction('revision_requested', revisionNote || undefined)} disabled={actionLoading}
                className="flex-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 font-bold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-40">
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Send Revision Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
