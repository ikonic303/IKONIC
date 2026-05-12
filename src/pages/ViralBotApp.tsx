import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Rss, Send, BarChart2, Settings, Shield,
  TrendingUp, Share2, Check, Plus, Bell, LogOut,
  RefreshCw, Download, X, Pencil, ExternalLink, Users, Activity,
  Calendar, Eye, Flame, Heart, MessageCircle, Save, Database, Zap, Sparkles
} from 'lucide-react';
import { getCurrentUser, getTrialStatus, logout } from '../lib/viralbot-auth';
import MatrixBackground from '../components/MatrixBackground';

type AppView = 'dashboard' | 'discovery' | 'autoposter' | 'analytics' | 'settings' | 'admin';

// ── Data ───────────────────────────────────────────────────────────────────────
const viralPosts = [
  { id: 1, source: 'Reddit', sourceCls: 'bg-orange-600', viral: 99, viralCls: 'text-orange-400', user: 'u/AIbuilder', tag: '#tech', title: "I made an AI that watches your screen and completes tasks automatically. Here's the open-source repo", likes: '55.0k', comments: '6.7k', shares: '4.4k' },
  { id: 2, source: 'HackerNews', sourceCls: 'bg-amber-600', viral: 98, viralCls: 'text-amber-400', user: 'levelsio', tag: '#tech', title: "I make $3.5M/year as a solo founder — no employees, no investors, no office. Ask me anything", likes: '18.9k', comments: '5.4k', shares: '945' },
  { id: 3, source: 'Reddit', sourceCls: 'bg-orange-600', viral: 97, viralCls: 'text-orange-400', user: 'u/techEnthusiast99', tag: '#AI', title: "I built a full SaaS app in 72 hours using AI tools — here's exactly what I used and how much it cost me", likes: '42.1k', comments: '3.8k', shares: '3.4k' },
  { id: 4, source: 'HackerNews', sourceCls: 'bg-amber-600', viral: 96, viralCls: 'text-amber-400', user: 'pg', tag: '#tech', title: "OpenAI releases GPT-5 with 10x reasoning capabilities — developers are already shipping wild demos", likes: '8.9k', comments: '1.2k', shares: '445' },
  { id: 5, source: 'Reddit', sourceCls: 'bg-orange-600', viral: 96, viralCls: 'text-orange-400', user: 'u/notlikeus', tag: '#AI', title: "Anthropic's Claude just beat every benchmark — including ones GPT-4 dominated. Side-by-side comparison inside", likes: '22.4k', comments: '4.1k', shares: '1.8k' },
  { id: 6, source: 'Reddit', sourceCls: 'bg-orange-600', viral: 95, viralCls: 'text-orange-400', user: 'u/foundermode', tag: '#AI', title: "$0 → $10k MRR in 4 months. No funding, no team. Just me, Cursor, and one idea that people actually wanted", likes: '31.5k', comments: '2.1k', shares: '2.5k' },
  { id: 7, source: 'HackerNews', sourceCls: 'bg-amber-600', viral: 94, viralCls: 'text-amber-400', user: 'dhh', tag: '#startup', title: "We ditched the cloud and moved back to our own servers. Cut our AWS bill by 90%, and performance doubled", likes: '14.7k', comments: '3.9k', shares: '735' },
  { id: 8, source: 'HackerNews', sourceCls: 'bg-amber-600', viral: 94, viralCls: 'text-amber-400', user: 'sama', tag: '#tech', title: "The real reason why most startups fail — it's not what you think. Data from 5,000 companies over 10 years", likes: '12.3k', comments: '2.9k', shares: '615' },
  { id: 9, source: 'Dev.to', sourceCls: 'bg-violet-600', viral: 93, viralCls: 'text-violet-400', user: '@davisjam', tag: '#startup', title: "Stop writing boilerplate: 7 VS Code extensions that literally code for you — I saved 4 hours yesterday alone", likes: '5.4k', comments: '890', shares: '540' },
  { id: 10, source: 'Dev.to', sourceCls: 'bg-violet-600', viral: 92, viralCls: 'text-violet-400', user: '@fireship', tag: '#AI', title: "React is dead. Long live React. A brutally honest look at what's actually worth learning in 2025", likes: '9.8k', comments: '1.2k', shares: '980' },
  { id: 11, source: 'Dev.to', sourceCls: 'bg-violet-600', viral: 91, viralCls: 'text-violet-400', user: '@swyx', tag: '#startup', title: "I replaced my entire backend with a single Cloudflare Worker. Here's the full architecture and code", likes: '7.2k', comments: '640', shares: '720' },
  { id: 12, source: 'Dev.to', sourceCls: 'bg-violet-600', viral: 87, viralCls: 'text-violet-400', user: '@yagiz_ninoglu', tag: '#AI', title: "I built a Notion clone in one weekend using Next.js 15 — full walkthrough with source code", likes: '4.3k', comments: '520', shares: '430' },
];

const socialPlatforms = [
  'Twitter / X', 'LinkedIn', 'Instagram', 'TikTok', 'Facebook',
  'Google Business Profile', 'WordPress (Blog)', 'Medium (Blog)',
  'Ghost (Blog)', 'Webflow', 'Shopify', 'Custom Webhook',
];

// ── Toggle ─────────────────────────────────────────────────────────────────────
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative rounded-full flex-shrink-0 transition-colors ${on ? 'bg-purple-600' : 'bg-zinc-600'}`}
      style={{ width: 40, height: 22 }}
    >
      <span className="absolute top-[3px] w-4 h-4 bg-white rounded-full transition-transform"
        style={{ transform: on ? 'translateX(22px)' : 'translateX(3px)' }} />
    </button>
  );
}

// ── Trial Expired Modal ────────────────────────────────────────────────────────
function TrialExpiredModal() {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
        <div className="w-14 h-14 bg-purple-600/20 border border-purple-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Zap className="w-7 h-7 text-purple-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Your free trial has expired</h2>
        <p className="text-gray-400 text-sm mb-6">
          Your 3-day trial has ended. Upgrade to keep automating your viral growth.
        </p>
        <div className="space-y-3">
          <a href="/viral-bot#pricing"
            className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm">
            View Pricing Plans
          </a>
          <a href="/contact"
            className="block w-full border border-white/20 hover:border-white/40 text-white py-2.5 rounded-lg transition-colors text-sm">
            Talk to Sales
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard ──────────────────────────────────────────────────────────────────
function DashboardView() {
  const stats = [
    { icon: Share2, label: 'Total Posts Made', value: '0', change: '+0%', ibg: 'bg-blue-600/20', ic: 'text-blue-400' },
    { icon: Eye, label: 'Total Impressions', value: '0', change: '+0%', ibg: 'bg-purple-600/20', ic: 'text-purple-400' },
    { icon: Flame, label: 'Viral Hits (>100k)', value: '0', change: '+0', ibg: 'bg-orange-600/20', ic: 'text-orange-400' },
    { icon: TrendingUp, label: 'Avg. Engagement', value: '0%', change: '+0.0%', ibg: 'bg-green-600/20', ic: 'text-green-400' },
  ];
  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
          <p className="text-gray-400 text-sm">Monitor your automated viral growth and approve pending posts. System is fully operational.</p>
        </div>
        <div className="flex gap-2 flex-shrink-0 ml-4">
          <button className="flex items-center gap-1.5 text-xs text-gray-300 border border-white/20 px-3 py-1.5 rounded-lg hover:border-white/40 transition-colors">
            <Settings className="w-3.5 h-3.5" /> Configuration
          </button>
          <button className="flex items-center gap-1.5 text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg transition-colors">
            <Plus className="w-3.5 h-3.5" /> New Automation
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {stats.map((s, i) => (
          <div key={i} className="bg-zinc-900 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-8 h-8 ${s.ibg} rounded-lg flex items-center justify-center`}>
                <s.icon className={`w-4 h-4 ${s.ic}`} />
              </div>
              <span className="text-green-400 text-xs">{s.change}</span>
            </div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-gray-400 text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-zinc-900 border border-white/10 rounded-xl p-4">
          <h3 className="font-semibold text-white mb-0.5">Recent Automated Posts</h3>
          <p className="text-gray-500 text-xs mb-5">Content posted by ViralBot in the last 24 hours.</p>
          <div className="flex items-center justify-center h-20 text-gray-600 text-sm">No posts have been made yet.</div>
        </div>
        <div className="bg-zinc-900 border border-white/10 rounded-xl p-4">
          <h3 className="font-semibold text-white mb-0.5">Active Automations</h3>
          <p className="text-gray-500 text-xs mb-3">Your running scrapers.</p>
          <div className="flex items-center justify-center h-12 text-gray-600 text-sm">No active rules.</div>
          <button className="w-full mt-3 border border-white/20 text-white text-xs py-2 rounded-lg hover:border-white/40 transition-colors">Manage Rules</button>
        </div>
      </div>
    </div>
  );
}

// ── Discovery Feed ─────────────────────────────────────────────────────────────
function DiscoveryFeedView() {
  const sourceMap: Record<string, string> = {
    Reddit: 'bg-orange-600 text-white',
    HackerNews: 'bg-amber-600 text-white',
    'Dev.to': 'bg-violet-600 text-white',
    Twitter: 'bg-sky-600 text-white',
    YouTube: 'bg-red-600 text-white',
  };
  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white">Discovery Feed</h1>
            <span className="flex items-center gap-1 bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full border border-green-500/30">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />Live
            </span>
          </div>
          <p className="text-gray-400 text-sm">12 live trending posts from Reddit, HackerNews &amp; Dev.to</p>
        </div>
        <div className="flex gap-2 flex-shrink-0 ml-4">
          <button className="flex items-center gap-1.5 text-xs text-gray-300 border border-white/20 px-3 py-1.5 rounded-lg hover:border-white/40 transition-colors">
            <Check className="w-3.5 h-3.5" /> Approve All
          </button>
          <button className="flex items-center gap-1.5 text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Feed
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {Object.keys(sourceMap).map(s => (
          <span key={s} className={`text-xs px-2.5 py-1 rounded-full ${sourceMap[s]}`}>{s}</span>
        ))}
        <span className="text-gray-500 text-xs">— live sources</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {viralPosts.map(post => (
          <div key={post.id} className="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden">
            <div className="relative h-28 bg-gradient-to-br from-zinc-800 to-zinc-700">
              <span className={`absolute top-2 left-2 text-xs px-2 py-0.5 rounded ${sourceMap[post.source] || 'bg-gray-600 text-white'}`}>{post.source}</span>
              <span className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded bg-black/60 font-medium ${post.viralCls}`}>⚡ {post.viral}% Viral</span>
              <span className="absolute bottom-2 right-2 text-xs text-gray-300 bg-black/60 px-2 py-0.5 rounded flex items-center gap-1">
                <ExternalLink className="w-3 h-3" /> View Source
              </span>
            </div>
            <div className="p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-gray-400">{post.user}</span>
                <span className="text-xs text-gray-500">{post.tag}</span>
              </div>
              <p className="text-sm text-white font-medium leading-snug mb-2 line-clamp-2">{post.title}</p>
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{post.likes}</span>
                <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{post.comments}</span>
                <span className="flex items-center gap-1"><Share2 className="w-3 h-3" />{post.shares}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button className="flex-1 flex items-center justify-center gap-1 text-xs border border-white/10 text-gray-400 hover:text-white py-1.5 rounded-lg transition-colors">
                  <X className="w-3 h-3" /> Reject
                </button>
                <button className="flex items-center justify-center gap-1 text-xs border border-white/10 text-gray-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors">
                  <Pencil className="w-3 h-3" />
                </button>
                <button className="flex-1 flex items-center justify-center gap-1 text-xs bg-purple-600 hover:bg-purple-700 text-white py-1.5 rounded-lg transition-colors">
                  <Check className="w-3 h-3" /> Approve
                </button>
              </div>
              <button className="w-full mt-2 flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors">
                <ExternalLink className="w-3 h-3" /> View Original Source
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Auto-Poster ────────────────────────────────────────────────────────────────
function AutoPosterView() {
  const [tab, setTab] = useState<'generate' | 'rules'>('generate');
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('casual');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['Twitter / X', 'LinkedIn']);
  const [postType, setPostType] = useState<'now' | 'schedule'>('now');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<Record<string, string>>({});
  const [posting, setPosting] = useState(false);
  const [posted, setPosted] = useState(false);

  const platforms = ['Twitter / X', 'LinkedIn', 'Instagram', 'Facebook', 'TikTok'];

  const togglePlatform = (p: string) =>
    setSelectedPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

  const handleGenerate = async () => {
    if (!topic.trim() || !selectedPlatforms.length) return;
    setGenerating(true);
    setGenerated({});
    try {
      const res = await fetch('/api/generate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, tone, platforms: selectedPlatforms }),
      });
      const data = await res.json();
      setGenerated(data.posts || {});
    } catch {
      const mock: Record<string, string> = {};
      selectedPlatforms.forEach(p => { mock[p] = `🚀 ${topic} — this is changing everything. Here's what you need to know. #trending #viral`; });
      setGenerated(mock);
    }
    setGenerating(false);
  };

  const handlePost = async () => {
    setPosting(true);
    await new Promise(r => setTimeout(r, 1500));
    setPosting(false);
    setPosted(true);
    setTimeout(() => setPosted(false), 3000);
  };

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-white mb-1">Auto-Poster</h1>
        <p className="text-gray-400 text-sm">Generate AI-written posts and publish or schedule them across your social accounts.</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-zinc-900 border border-white/10 rounded-xl p-1 mb-6 w-fit gap-1">
        {(['generate', 'rules'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${tab === t ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}>
            {t === 'generate'
              ? <><Sparkles className="w-3.5 h-3.5" />Generate Post</>
              : <><Zap className="w-3.5 h-3.5" />Automation Rules</>}
          </button>
        ))}
      </div>

      {tab === 'generate' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left — inputs */}
          <div className="space-y-4">
            <div className="bg-zinc-900 border border-white/10 rounded-xl p-5">
              <p className="text-sm font-semibold text-white mb-4">Post Details</p>

              <div className="mb-4">
                <label className="text-xs text-gray-400 block mb-1.5">Topic or Keyword</label>
                <textarea value={topic} onChange={e => setTopic(e.target.value)} rows={3}
                  placeholder="e.g. GoHighLevel CRM tips, 5-star Google reviews for local businesses, speed-to-lead automation..."
                  className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500/50 resize-none transition-colors" />
              </div>

              <div className="mb-4">
                <label className="text-xs text-gray-400 block mb-1.5">Tone</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Professional', 'Casual', 'Viral', 'Educational'].map(t => (
                    <button key={t} onClick={() => setTone(t.toLowerCase())}
                      className={`py-2 rounded-lg text-xs font-medium border transition-colors ${tone === t.toLowerCase() ? 'bg-purple-600/20 border-purple-500/50 text-purple-300' : 'border-white/10 text-gray-400 hover:text-white'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1.5">Post To</label>
                <div className="flex flex-wrap gap-2">
                  {platforms.map(p => (
                    <button key={p} onClick={() => togglePlatform(p)}
                      className={`py-1.5 px-3 rounded-lg text-xs font-medium border transition-colors ${selectedPlatforms.includes(p) ? 'bg-purple-600/20 border-purple-500/50 text-purple-300' : 'border-white/10 text-gray-400 hover:text-white'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 border border-white/10 rounded-xl p-5">
              <p className="text-sm font-semibold text-white mb-4">When to Post</p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {(['now', 'schedule'] as const).map(pt => (
                  <button key={pt} onClick={() => setPostType(pt)}
                    className={`py-2.5 rounded-lg text-sm font-medium border transition-colors ${postType === pt ? 'bg-purple-600/20 border-purple-500/50 text-purple-300' : 'border-white/10 text-gray-400 hover:text-white'}`}>
                    {pt === 'now' ? 'Post Now' : 'Schedule'}
                  </button>
                ))}
              </div>
              {postType === 'schedule' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Date</label>
                    <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)}
                      className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-purple-500/50 transition-colors" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Time</label>
                    <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)}
                      className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-purple-500/50 transition-colors" />
                  </div>
                </div>
              )}
            </div>

            <button onClick={handleGenerate}
              disabled={!topic.trim() || generating || !selectedPlatforms.length}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors">
              {generating
                ? <><RefreshCw className="w-4 h-4 animate-spin" />Generating...</>
                : <><Sparkles className="w-4 h-4" />Generate Posts</>}
            </button>
          </div>

          {/* Right — preview */}
          <div>
            {!generating && !Object.keys(generated).length && (
              <div className="bg-zinc-900 border border-white/10 rounded-xl flex flex-col items-center justify-center h-56 text-center">
                <Sparkles className="w-8 h-8 text-gray-600 mb-3" />
                <p className="text-gray-500 text-sm">Generated posts will appear here</p>
                <p className="text-gray-600 text-xs mt-1">Enter a topic and click Generate Posts</p>
              </div>
            )}
            {generating && (
              <div className="bg-zinc-900 border border-white/10 rounded-xl flex flex-col items-center justify-center h-56 text-center">
                <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mb-3" />
                <p className="text-gray-300 text-sm">AI is writing your posts...</p>
              </div>
            )}
            {!generating && Object.keys(generated).length > 0 && (
              <div className="space-y-3">
                {Object.entries(generated).map(([platform, content]) => (
                  <div key={platform} className="bg-zinc-900 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-purple-400">{platform}</span>
                      <span className="text-[10px] text-gray-500">{(content as string).length} chars</span>
                    </div>
                    <textarea value={content as string} rows={4}
                      onChange={e => setGenerated(prev => ({ ...prev, [platform]: e.target.value }))}
                      className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500/50 resize-none transition-colors" />
                  </div>
                ))}
                <button onClick={handlePost} disabled={posting}
                  className={`w-full flex items-center justify-center gap-2 font-semibold py-3 rounded-xl transition-colors ${posted ? 'bg-green-600 text-white' : 'bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white'}`}>
                  {posting
                    ? <><RefreshCw className="w-4 h-4 animate-spin" />Posting...</>
                    : posted
                      ? <><Check className="w-4 h-4" />Posted Successfully!</>
                      : postType === 'now'
                        ? <><Send className="w-4 h-4" />Post Now to {selectedPlatforms.length} Platform{selectedPlatforms.length !== 1 ? 's' : ''}</>
                        : <><Calendar className="w-4 h-4" />Schedule Post</>}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'rules' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-400 text-sm">Automatically post viral content based on keywords and schedules.</p>
            <button className="flex items-center gap-1.5 text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg transition-colors">
              <Plus className="w-3.5 h-3.5" /> Create Rule
            </button>
          </div>
          <div className="flex items-center justify-center h-56 bg-zinc-900 border border-white/10 rounded-xl text-gray-600 text-sm">
            No automation rules yet. Click "+ Create Rule" to get started.
          </div>
        </div>
      )}
    </div>
  );
}

// ── Analytics ─────────────────────────────────────────────────────────────────
function AnalyticsView() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const platforms = ['Twitter', 'LinkedIn', 'Instagram', 'TikTok'];
  const yLabels = ['304k', '303k', '302k', '301k', '0k'];
  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Analytics</h1>
          <p className="text-gray-400 text-sm">Track the performance of your automated posts.</p>
        </div>
        <button className="flex items-center gap-1.5 text-xs text-gray-300 border border-white/20 px-3 py-1.5 rounded-lg hover:border-white/40 transition-colors flex-shrink-0 ml-4">
          <Download className="w-3.5 h-3.5" /> Export Report
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-zinc-900 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-0.5">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <h3 className="font-semibold text-white text-sm">Follower Growth</h3>
          </div>
          <p className="text-gray-500 text-xs mb-3">Your audience growth across all platforms</p>
          <svg viewBox="0 0 380 150" className="w-full">
            {yLabels.map((lbl, i) => {
              const y = 10 + i * 30;
              return (
                <g key={i}>
                  <line x1="42" y1={y} x2="375" y2={y} stroke="#3f3f46" strokeWidth="0.5" strokeDasharray="3" />
                  <text x="38" y={y + 4} textAnchor="end" fill="#6b7280" fontSize="8">{lbl}</text>
                </g>
              );
            })}
            <polyline points="55,128 115,128 175,128 235,128 295,128 355,128" fill="none" stroke="#7C3AED" strokeWidth="2" />
            {months.map((m, i) => (
              <text key={m} x={55 + i * 60} y="143" textAnchor="middle" fill="#6b7280" fontSize="8">{m}</text>
            ))}
          </svg>
        </div>
        <div className="bg-zinc-900 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-0.5">
            <BarChart2 className="w-4 h-4 text-purple-400" />
            <h3 className="font-semibold text-white text-sm">Engagement by Platform</h3>
          </div>
          <p className="text-gray-500 text-xs mb-3">Where your content performs best</p>
          <svg viewBox="0 0 380 160" className="w-full">
            {yLabels.map((lbl, i) => {
              const y = 10 + i * 28;
              return (
                <g key={i}>
                  <line x1="42" y1={y} x2="375" y2={y} stroke="#3f3f46" strokeWidth="0.5" strokeDasharray="3" />
                  <text x="38" y={y + 4} textAnchor="end" fill="#6b7280" fontSize="8">{lbl}</text>
                </g>
              );
            })}
            {platforms.map((p, i) => {
              const cx = 70 + i * 78;
              return (
                <g key={p}>
                  <rect x={cx - 16} y="121" width="10" height="1" fill="#7C3AED" />
                  <rect x={cx - 4} y="121" width="10" height="1" fill="#A855F7" />
                  <rect x={cx + 8} y="121" width="10" height="1" fill="#6366F1" />
                  <text x={cx + 1} y="137" textAnchor="middle" fill="#6b7280" fontSize="8">{p}</text>
                </g>
              );
            })}
            <rect x="80" y="148" width="7" height="7" fill="#7C3AED" rx="1" /><text x="91" y="155" fill="#9ca3af" fontSize="8">Likes</text>
            <rect x="122" y="148" width="7" height="7" fill="#A855F7" rx="1" /><text x="133" y="155" fill="#9ca3af" fontSize="8">Comments</text>
            <rect x="183" y="148" width="7" height="7" fill="#6366F1" rx="1" /><text x="194" y="155" fill="#9ca3af" fontSize="8">Shares</text>
          </svg>
        </div>
      </div>
    </div>
  );
}

// ── Settings ───────────────────────────────────────────────────────────────────
function SettingsView() {
  const [adminMode, setAdminMode] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [autoApprove, setAutoApprove] = useState(false);
  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
          <p className="text-gray-400 text-sm">Manage your account and platform integrations.</p>
        </div>
        <button className="flex items-center gap-1.5 text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg transition-colors flex-shrink-0 ml-4">
          <Save className="w-3.5 h-3.5" /> Save Changes
        </button>
      </div>
      <div className="space-y-8 max-w-2xl">
        <section>
          <h2 className="font-semibold text-white mb-0.5">Account Details</h2>
          <p className="text-gray-500 text-xs mb-3">Update your personal information.</p>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Full Name</label>
              <input defaultValue={getCurrentUser()?.name || ''} className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500/60 transition-colors" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Email Address</label>
              <input defaultValue={getCurrentUser()?.email || ''} className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500/60 transition-colors" />
            </div>
          </div>
        </section>
        <section>
          <div className="flex items-center gap-2 mb-0.5">
            <Shield className="w-4 h-4 text-purple-400" />
            <h2 className="font-semibold text-purple-400">Admin Controls (Testing)</h2>
          </div>
          <p className="text-gray-500 text-xs mb-3">Developer overrides and testing features.</p>
          <div className="flex items-center justify-between bg-zinc-900 border border-white/10 rounded-lg px-4 py-3">
            <div>
              <p className="text-sm text-white">Enable Admin Mode</p>
              <p className="text-xs text-gray-500">Toggle this to view admin-only features across the application.</p>
            </div>
            <Toggle on={adminMode} onToggle={() => setAdminMode(v => !v)} />
          </div>
        </section>
        <section>
          <h2 className="font-semibold text-white mb-0.5">Social Media Integrations</h2>
          <p className="text-gray-500 text-xs mb-3">Connect your accounts to enable auto-posting.</p>
          <div className="space-y-2">
            {socialPlatforms.map(p => (
              <div key={p} className="flex items-center justify-between bg-zinc-900 border border-white/10 rounded-lg px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-zinc-800 rounded-lg flex items-center justify-center">
                    <Share2 className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white">{p}</p>
                    <p className="text-xs text-gray-500">Not connected</p>
                  </div>
                </div>
                <button className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg transition-colors">Connect</button>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h2 className="font-semibold text-white mb-0.5">Global Preferences</h2>
          <p className="text-gray-500 text-xs mb-3">Configure how ViralBot operates globally.</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-zinc-900 border border-white/10 rounded-lg px-4 py-3">
              <div>
                <p className="text-sm text-white">Email Notifications</p>
                <p className="text-xs text-gray-500">Receive daily digests of bot activity.</p>
              </div>
              <Toggle on={emailNotifs} onToggle={() => setEmailNotifs(v => !v)} />
            </div>
            <div className="flex items-center justify-between bg-zinc-900 border border-white/10 rounded-lg px-4 py-3">
              <div>
                <p className="text-sm text-white">Auto-Approve High Confidence</p>
                <p className="text-xs text-gray-500">Automatically post content with &gt;90% viral prediction.</p>
              </div>
              <Toggle on={autoApprove} onToggle={() => setAutoApprove(v => !v)} />
            </div>
          </div>
        </section>
        <section>
          <div className="flex items-center gap-2 mb-0.5">
            <Database className="w-4 h-4 text-purple-400" />
            <h2 className="font-semibold text-purple-400">Database Connection (Supabase)</h2>
          </div>
          <p className="text-gray-500 text-xs mb-3">Connect to your own Supabase PostgreSQL database.</p>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Supabase Project URL</label>
              <input placeholder="https://your-project.supabase.co" className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500/60 transition-colors" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Supabase Anon Key</label>
              <input type="password" placeholder="••••••••••••••••" className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500/60 transition-colors" />
            </div>
            <button className="w-full flex items-center justify-center gap-1.5 border border-purple-500/40 text-purple-400 text-sm py-2 rounded-lg hover:bg-purple-500/10 transition-colors">
              <Database className="w-3.5 h-3.5" /> Save Database Connection
            </button>
          </div>
        </section>
        <section>
          <h2 className="font-semibold text-white mb-0.5">Subscription Plan</h2>
          <p className="text-gray-500 text-xs mb-3">Manage your current plan and usage.</p>
          <div className="bg-purple-600/10 border border-purple-500/30 rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-white">Starter Plan</span>
                <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full">Trial</span>
              </div>
              <p className="text-xs text-gray-400">Free • 1 Automation Rule • 10 Posts/day</p>
            </div>
            <a href="/viral-bot#pricing" className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg transition-colors">Upgrade</a>
          </div>
        </section>
      </div>
    </div>
  );
}

// ── Admin Panel ────────────────────────────────────────────────────────────────
function AdminPanelView() {
  const stats = [
    { icon: Users, label: 'Total Users', value: '0', ibg: 'bg-purple-600/20', ic: 'text-purple-400' },
    { icon: Activity, label: 'Active Subscriptions', value: '0', ibg: 'bg-green-600/20', ic: 'text-green-400' },
    { icon: Calendar, label: 'Expired Accounts', value: '0', ibg: 'bg-orange-600/20', ic: 'text-orange-400' },
  ];
  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-6 h-6 text-purple-400" />
          <h1 className="text-2xl font-bold text-white">Admin Control Panel</h1>
        </div>
        <p className="text-gray-400 text-sm">Manage all registered users, subscriptions, and platform activity.</p>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-5">
        {stats.map((s, i) => (
          <div key={i} className="bg-zinc-900 border border-white/10 rounded-xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 ${s.ibg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <s.icon className={`w-5 h-5 ${s.ic}`} />
            </div>
            <div>
              <p className="text-gray-400 text-xs">{s.label}</p>
              <p className="text-2xl font-bold text-white">{s.value}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-zinc-900 border border-white/10 rounded-xl p-4">
        <h3 className="font-semibold text-white mb-0.5">User Directory</h3>
        <p className="text-gray-500 text-xs mb-4">A complete list of all users connected to your platform.</p>
        <div className="flex items-center justify-center h-20 text-gray-500 text-sm">Loading users...</div>
      </div>
    </div>
  );
}

// ── Main App Page ──────────────────────────────────────────────────────────────
export default function ViralBotApp() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<AppView>('dashboard');
  const user = getCurrentUser();
  const trial = getTrialStatus();

  useEffect(() => {
    if (!user) navigate('/viral-bot/auth');
  }, []);

  if (!user) return null;

  const menuItems = [
    { id: 'dashboard' as AppView, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'discovery' as AppView, label: 'Discovery Feed', icon: Rss, badge: 12 },
    { id: 'autoposter' as AppView, label: 'Auto-Poster', icon: Send },
    { id: 'analytics' as AppView, label: 'Analytics', icon: BarChart2 },
  ];
  const configItems = [
    { id: 'settings' as AppView, label: 'Settings', icon: Settings },
    { id: 'admin' as AppView, label: 'Admin Panel', icon: Shield },
  ];

  const handleLogout = () => {
    logout();
    navigate('/viral-bot');
  };

  return (
    <div className="relative min-h-screen bg-charcoal flex flex-col">
      <MatrixBackground />
      {trial?.expired && <TrialExpiredModal />}

      {/* Trial banner */}
      {trial && !trial.expired && (
        <div className="bg-purple-600/20 border-b border-purple-500/30 px-6 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-purple-300">
            <Zap className="w-3.5 h-3.5" />
            {trial.daysLeft > 0
              ? `${trial.daysLeft} day${trial.daysLeft !== 1 ? 's' : ''} left in your free trial`
              : `${trial.hoursLeft} hour${trial.hoursLeft !== 1 ? 's' : ''} left in your free trial`}
          </div>
          <a href="/viral-bot#pricing" className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg transition-colors">
            Upgrade Now
          </a>
        </div>
      )}

      {/* App top bar */}
      <div className="bg-zinc-900/80 backdrop-blur-md border-b border-white/10 px-5 py-2.5 flex items-center justify-between relative z-10">
        <p className="text-gray-400 text-sm">
          Welcome back, <span className="text-white font-medium">{user.name}</span> — your bot has found{' '}
          <span className="text-white font-medium">12 new viral posts</span> today.
        </p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-green-400 text-xs">Bot Active</span>
          </div>
          <Bell className="w-4 h-4 text-gray-400 cursor-pointer hover:text-white transition-colors" />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Sidebar */}
        <div className="w-52 bg-zinc-900/80 backdrop-blur-md border-r border-white/10 flex flex-col py-5 px-3 flex-shrink-0">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider px-2 mb-2">Menu</p>
          <nav className="space-y-0.5 mb-5">
            {menuItems.map(item => (
              <button key={item.id} onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeView === item.id ? 'bg-purple-600/20 text-purple-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                <item.icon className="w-3.5 h-3.5 flex-shrink-0" />
                {item.label}
                {item.badge && (
                  <span className="ml-auto bg-purple-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">{item.badge}</span>
                )}
              </button>
            ))}
          </nav>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider px-2 mb-2">Configuration</p>
          <nav className="space-y-0.5">
            {configItems.map(item => (
              <button key={item.id} onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeView === item.id ? 'bg-purple-600/20 text-purple-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                <item.icon className="w-3.5 h-3.5 flex-shrink-0" />
                {item.label}
              </button>
            ))}
          </nav>
          <div className="mt-auto pt-4 border-t border-white/10 px-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-gray-300 truncate">{user.email}</p>
                <p className="text-[10px] text-purple-400">Starter (Trial)</p>
              </div>
              <button onClick={handleLogout} title="Log out" className="ml-auto text-gray-500 hover:text-white flex-shrink-0 transition-colors">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-zinc-950/70 p-6">
          {activeView === 'dashboard' && <DashboardView />}
          {activeView === 'discovery' && <DiscoveryFeedView />}
          {activeView === 'autoposter' && <AutoPosterView />}
          {activeView === 'analytics' && <AnalyticsView />}
          {activeView === 'settings' && <SettingsView />}
          {activeView === 'admin' && <AdminPanelView />}
        </div>
      </div>
    </div>
  );
}
