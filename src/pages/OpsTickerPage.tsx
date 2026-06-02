'use client';

import { useState } from 'react';

interface Event {
  id: string;
  ts: string;
  agent: string;
  severity: 'critical' | 'high' | 'info';
  channel: string;
  title: string;
  body: string;
  sms_sent: boolean;
}

interface Feed {
  updated: string;
  events: Event[];
}

const rel = (ts: string) => {
  const s = Math.max(0, (Date.now() - new Date(ts).getTime()) / 1000);
  if (s < 60) return Math.floor(s) + 's ago';
  if (s < 3600) return Math.floor(s / 60) + 'm ago';
  if (s < 86400) return Math.floor(s / 3600) + 'h ago';
  return Math.floor(s / 86400) + 'd ago';
};

const esc = (x: string) => (x || '').replace(/[&<>]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;'}[c] || c));

export default function OpsTickerPage() {
  const [auth, setAuth] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'info'>('all');
  const [feed, setFeed] = useState<Event[]>([]);
  const [updated, setUpdated] = useState('');

  const tryGate = () => {
    const b64 = btoa('ikonic:' + password);
    fetch('/api/ops-feed', {
      headers: { Authorization: 'Basic ' + b64 },
      cache: 'no-store',
    })
      .then(r => {
        if (r.ok) {
          setAuth(true);
          setError('');
          load();
          setInterval(load, 5000);
        } else {
          setError('Wrong password');
        }
      })
      .catch(() => setError('Connection failed'));
  };

  const load = async () => {
    try {
      const b64 = btoa('ikonic:' + password);
      const r = await fetch('/api/ops-feed?t=' + Date.now(), {
        headers: { Authorization: 'Basic ' + b64 },
        cache: 'no-store',
      });
      if (r.ok) {
        const d = (await r.json()) as Feed;
        setFeed((d.events || []).slice().sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime()));
        setUpdated(new Date(d.updated || Date.now()).toLocaleTimeString());
      }
    } catch (e) {
      /* keep last good render */
    }
  };

  if (!auth) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: 'var(--bg, #0b0e0d)' }}>
        <style>{`
          :root { --bg:#0b0e0d; --panel:#121715; --line:#1f2a26; --mint:#1ED88F; --txt:#e8efec; --muted:#7d8c86; }
          * { box-sizing: border-box; }
          body { background: var(--bg); color: var(--txt); }
        `}</style>
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-sm uppercase tracking-widest" style={{ color: 'var(--mint)' }}>Ikonic · Ops</h1>
          <div className="border p-7 rounded-2xl" style={{ borderColor: 'var(--line)', background: 'var(--panel)', width: '300px' }}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && tryGate()}
              autoFocus
              className="w-full p-3 rounded-lg border mb-3"
              style={{ borderColor: 'var(--line)', background: '#0b0e0d', color: 'var(--txt)' }}
            />
            <button
              onClick={tryGate}
              className="w-full p-3 rounded-lg font-bold uppercase tracking-wide"
              style={{ background: 'var(--mint)', color: '#06120c' }}
            >
              Enter
            </button>
            <div className="text-red-400 text-xs mt-3 min-h-4 text-center">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  const filtered = feed.filter(e => filter === 'all' || e.severity === filter);

  return (
    <div style={{ background: 'var(--bg, #0b0e0d)', color: 'var(--txt, #e8efec)', minHeight: '100vh', fontFamily: 'system-ui' }}>
      <style>{`
        :root { --bg:#0b0e0d; --panel:#121715; --line:#1f2a26; --mint:#1ED88F; --txt:#e8efec; --muted:#7d8c86;
                --crit:#ff4d4d; --high:#ffb020; --info:#5fd0ff; }
        .ev { background: var(--panel); border: 1px solid var(--line); border-left: 3px solid var(--line);
              border-radius: 12px; padding: 14px 16px; margin: 10px 0; animation: in 0.35s ease; }
        @keyframes in { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; } }
        .ev.s-critical { border-left-color: var(--crit); } .ev.s-high { border-left-color: var(--high); } .ev.s-info { border-left-color: var(--info); }
        .sev { font-size: 10px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; padding: 3px 8px; border-radius: 6px; }
        .s-critical .sev { background: #ff4d4d22; color: var(--crit); } .s-high .sev { background: #ffb02022; color: var(--high); } .s-info .sev { background: #5fd0ff18; color: var(--info); }
        .agent { font-size: 12px; color: var(--mint); font-weight: 600; }
        .badge { display: inline-block; margin-top: 8px; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; color: var(--high);
                 border: 1px solid #ffb02055; border-radius: 6px; padding: 2px 7px; }
        .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--mint); animation: pulse 1.8s infinite; }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 #1ED88F88; } 70% { box-shadow: 0 0 0 9px #1ED88F00; } }
      `}</style>

      <header className="sticky top-0 flex items-center gap-3 p-3.5 border-b" style={{ background: 'linear-gradient(#0b0e0dee,#0b0e0dcc)', backdropFilter: 'blur(8px)', borderColor: 'var(--line)' }}>
        <span className="font-bold uppercase tracking-wide">IKONIC <span style={{ color: 'var(--mint)' }}>OPS</span></span>
        <span className="flex items-center gap-2 text-xs uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
          <span className="dot" />
          Live
        </span>
        <div className="flex-1" />
        <div className="flex gap-2">
          {(['all', 'critical', 'high', 'info'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="text-xs uppercase tracking-widest px-3 py-1.5 rounded-full border"
              style={{
                color: filter === f ? '#06120c' : 'var(--muted)',
                background: filter === f ? 'var(--mint)' : 'var(--panel)',
                borderColor: filter === f ? 'var(--mint)' : 'var(--line)',
                fontWeight: filter === f ? '700' : '400',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 pb-20">
        {!filtered.length ? (
          <div style={{ color: 'var(--muted)', textAlign: 'center', padding: '60px 0' }}>No events.</div>
        ) : (
          filtered.map(e => (
            <div key={e.id} className={`ev s-${e.severity}`}>
              <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                <span className="sev">{esc(e.severity)}</span>
                <span className="agent">{esc(e.agent)}</span>
                <span style={{ marginLeft: 'auto', color: 'var(--muted)', fontSize: '12px' }} title={esc(e.ts)}>
                  {rel(e.ts)}
                </span>
              </div>
              <div className="font-bold mb-1">{esc(e.title)}</div>
              <div style={{ color: '#c3cec9', fontSize: '14px' }}>{esc(e.body)}</div>
              {e.sms_sent && <span className="badge">also texted 630</span>}
            </div>
          ))
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 text-center text-xs p-2" style={{ color: 'var(--muted)', background: '#0b0e0dcc', borderTop: '1px solid var(--line)' }}>
        Updated <span>{updated}</span> · auto-refresh 5s · unguessable link + password
      </footer>
    </div>
  );
}
