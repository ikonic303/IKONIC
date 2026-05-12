import { useState } from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import MatrixBackground from '../components/MatrixBackground';
import {
  LayoutDashboard, Rss, Send, BarChart2, Settings, Shield,
  TrendingUp, Share2, Bot, Check, Plus, Bell, LogOut,
  RefreshCw, Download, X, Pencil, ExternalLink, Users, Activity,
  Calendar, Eye, Flame, Heart, MessageCircle, Save, Database, Zap, ArrowRight, Sparkles
} from 'lucide-react';

type AppView = 'dashboard' | 'discovery' | 'autoposter' | 'analytics' | 'settings' | 'admin';

const features = [
  { icon: TrendingUp, title: 'Trend Discovery', description: "Our AI scans Reddit, HackerNews, and Twitter to find content that's guaranteed to perform well." },
  { icon: Share2, title: 'Auto-Posting', description: 'Connect your accounts once. Set your schedule, and let ViralBot handle the publishing automatically.' },
  { icon: Bot, title: 'AI Rewriting', description: 'Automatically rewrite viral posts in your own brand voice so your content always feels authentic.' },
];

const pricingPlans = [
  { name: 'Starter', subtitle: 'Perfect for trying out.', price: 'Free', period: '', features: ['1 Automation Rule', '10 Posts/day', 'Standard Support'], cta: 'Get Started', popular: false },
  { name: 'Pro', subtitle: 'For serious creators.', price: '$29', period: '/mo', features: ['10 Automation Rules', 'Unlimited Posts', 'AI Content Rewriting', 'Priority Support'], cta: 'Start 7-Day Trial', popular: true },
  { name: 'Enterprise', subtitle: 'For large agencies.', price: '$99', period: '/mo', features: ['30 Automation Rules', 'Custom Proxies', 'White-label Reports', '24/7 Phone Support'], cta: 'Get Started', popular: false },
];

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

// ── Toggle helper ──────────────────────────────────────────────────────────────
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative rounded-full flex-shrink-0 transition-colors ${on ? 'bg-purple-600' : 'bg-zinc-600'}`}
      style={{ width: 40, height: 22 }}
    >
      <span
        className="absolute top-[3px] w-4 h-4 bg-white rounded-full transition-transform"
        style={{ transform: on ? 'translateX(22px)' : 'translateX(3px)' }}
      />
    </button>
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
      <div className="flex bg-zinc-800 rounded-xl p-1 mb-6 w-fit gap-1">
        {(['generate', 'rules'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${tab === t ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}>
            {t === 'generate' ? <><Sparkles className="w-3.5 h-3.5" />Generate Post</> : <><Zap className="w-3.5 h-3.5" />Automation Rules</>}
          </button>
        ))}
      </div>

      {tab === 'generate' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Inputs */}
          <div className="space-y-4">
            <div className="bg-zinc-800 border border-white/10 rounded-xl p-4">
              <p className="text-xs font-semibold text-white mb-3">Post Details</p>
              <div className="mb-3">
                <label className="text-xs text-gray-400 block mb-1">Topic or Keyword</label>
                <textarea value={topic} onChange={e => setTopic(e.target.value)} rows={3}
                  placeholder="e.g. GoHighLevel CRM tips, 5-star Google reviews for local businesses..."
                  className="w-full bg-zinc-700 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-purple-500/50 resize-none" />
              </div>
              <div className="mb-3">
                <label className="text-xs text-gray-400 block mb-1.5">Tone</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {['Professional', 'Casual', 'Viral', 'Educational'].map(t => (
                    <button key={t} onClick={() => setTone(t.toLowerCase())}
                      className={`py-1.5 rounded-lg text-xs font-medium border transition-colors ${tone === t.toLowerCase() ? 'bg-purple-600/20 border-purple-500/50 text-purple-300' : 'border-white/10 text-gray-400 hover:text-white'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1.5">Post To</label>
                <div className="flex flex-wrap gap-1.5">
                  {platforms.map(p => (
                    <button key={p} onClick={() => togglePlatform(p)}
                      className={`py-1 px-2.5 rounded-lg text-xs font-medium border transition-colors ${selectedPlatforms.includes(p) ? 'bg-purple-600/20 border-purple-500/50 text-purple-300' : 'border-white/10 text-gray-400 hover:text-white'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-zinc-800 border border-white/10 rounded-xl p-4">
              <p className="text-xs font-semibold text-white mb-3">When to Post</p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {(['now', 'schedule'] as const).map(pt => (
                  <button key={pt} onClick={() => setPostType(pt)}
                    className={`py-2 rounded-lg text-xs font-medium border transition-colors ${postType === pt ? 'bg-purple-600/20 border-purple-500/50 text-purple-300' : 'border-white/10 text-gray-400 hover:text-white'}`}>
                    {pt === 'now' ? 'Post Now' : 'Schedule'}
                  </button>
                ))}
              </div>
              {postType === 'schedule' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Date</label>
                    <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)}
                      className="w-full bg-zinc-700 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-purple-500/50" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Time</label>
                    <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)}
                      className="w-full bg-zinc-700 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-purple-500/50" />
                  </div>
                </div>
              )}
            </div>

            <button onClick={handleGenerate} disabled={!topic.trim() || generating || !selectedPlatforms.length}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold py-2.5 rounded-xl transition-colors">
              {generating ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" />Generating...</> : <><Sparkles className="w-3.5 h-3.5" />Generate Posts</>}
            </button>
          </div>

          {/* Preview */}
          <div>
            {!generating && !Object.keys(generated).length && (
              <div className="bg-zinc-800 border border-white/10 rounded-xl flex flex-col items-center justify-center h-48 text-center">
                <Sparkles className="w-7 h-7 text-gray-600 mb-2" />
                <p className="text-gray-500 text-xs">Generated posts appear here</p>
              </div>
            )}
            {generating && (
              <div className="bg-zinc-800 border border-white/10 rounded-xl flex flex-col items-center justify-center h-48 text-center">
                <RefreshCw className="w-7 h-7 text-purple-400 animate-spin mb-2" />
                <p className="text-gray-300 text-xs">AI is writing your posts...</p>
              </div>
            )}
            {!generating && Object.keys(generated).length > 0 && (
              <div className="space-y-3">
                {Object.entries(generated).map(([platform, content]) => (
                  <div key={platform} className="bg-zinc-800 border border-white/10 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-purple-400">{platform}</span>
                      <span className="text-[10px] text-gray-500">{(content as string).length} chars</span>
                    </div>
                    <textarea value={content as string} rows={3}
                      onChange={e => setGenerated(prev => ({ ...prev, [platform]: e.target.value }))}
                      className="w-full bg-zinc-700 border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white outline-none focus:border-purple-500/50 resize-none" />
                  </div>
                ))}
                <button onClick={handlePost} disabled={posting}
                  className={`w-full flex items-center justify-center gap-2 text-xs font-semibold py-2.5 rounded-xl transition-colors ${posted ? 'bg-green-600 text-white' : 'bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white'}`}>
                  {posting ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" />Posting...</>
                    : posted ? <><Check className="w-3.5 h-3.5" />Posted!</>
                    : postType === 'now'
                      ? <><Send className="w-3.5 h-3.5" />Post Now to {selectedPlatforms.length} Platform{selectedPlatforms.length !== 1 ? 's' : ''}</>
                      : <><Calendar className="w-3.5 h-3.5" />Schedule Post</>}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'rules' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-400 text-xs">Automatically post viral content based on keywords and schedules.</p>
            <button className="flex items-center gap-1.5 text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg transition-colors">
              <Plus className="w-3.5 h-3.5" /> Create Rule
            </button>
          </div>
          <div className="flex items-center justify-center h-48 bg-zinc-800 border border-white/10 rounded-xl text-gray-600 text-xs">
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
        {/* Follower Growth */}
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
        {/* Engagement by Platform */}
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
            <rect x="80" y="148" width="7" height="7" fill="#7C3AED" rx="1" />
            <text x="91" y="155" fill="#9ca3af" fontSize="8">Likes</text>
            <rect x="122" y="148" width="7" height="7" fill="#A855F7" rx="1" />
            <text x="133" y="155" fill="#9ca3af" fontSize="8">Comments</text>
            <rect x="183" y="148" width="7" height="7" fill="#6366F1" rx="1" />
            <text x="194" y="155" fill="#9ca3af" fontSize="8">Shares</text>
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
        {/* Account Details */}
        <section>
          <h2 className="font-semibold text-white mb-0.5">Account Details</h2>
          <p className="text-gray-500 text-xs mb-3">Update your personal information.</p>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Full Name</label>
              <input defaultValue="Alex Carter" className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-purple-500/50" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Email Address</label>
              <input defaultValue="alex@example.com" className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-purple-500/50" />
            </div>
          </div>
        </section>

        {/* Admin Controls */}
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

        {/* Social Media Integrations */}
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

        {/* Global Preferences */}
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

        {/* Database Connection */}
        <section>
          <div className="flex items-center gap-2 mb-0.5">
            <Database className="w-4 h-4 text-purple-400" />
            <h2 className="font-semibold text-purple-400">Database Connection (Supabase)</h2>
          </div>
          <p className="text-gray-500 text-xs mb-3">Connect to your own Supabase PostgreSQL database to store user and post data.</p>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Supabase Project URL</label>
              <input defaultValue="https://zqperoznmyngczxnbqhn.supabase.co" className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-purple-500/50" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Supabase Anon Key</label>
              <input type="password" defaultValue="placeholder-anon-key" className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-purple-500/50" />
            </div>
            <button className="w-full flex items-center justify-center gap-1.5 border border-purple-500/40 text-purple-400 text-sm py-2 rounded-lg hover:bg-purple-500/10 transition-colors">
              <Database className="w-3.5 h-3.5" /> Save Database Connection
            </button>
          </div>
        </section>

        {/* Subscription Plan */}
        <section>
          <h2 className="font-semibold text-white mb-0.5">Subscription Plan</h2>
          <p className="text-gray-500 text-xs mb-3">Manage your current plan and usage.</p>
          <div className="bg-purple-600/10 border border-purple-500/30 rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-white">Enterprise Plan</span>
                <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full">Active</span>
              </div>
              <p className="text-xs text-gray-400">$99/month • 30 Automation Rules • Custom Proxies</p>
            </div>
            <div className="flex gap-2 flex-shrink-0 ml-4">
              <button className="text-xs text-gray-400 hover:text-white border border-white/10 px-3 py-1.5 rounded-lg transition-colors">Cancel Plan</button>
              <button className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg transition-colors">Change Plan</button>
            </div>
          </div>
        </section>

        {/* Payment Methods */}
        <section>
          <h2 className="font-semibold text-white mb-0.5">Payment Methods</h2>
          <p className="text-gray-500 text-xs mb-3">Manage your saved credit cards and billing options.</p>
          <div className="bg-zinc-900 border border-white/10 rounded-xl p-4 text-center">
            <p className="text-gray-500 text-sm mb-3">No payment methods saved.</p>
            <button className="inline-flex items-center gap-1.5 text-sm text-white border border-white/20 px-4 py-2 rounded-lg hover:border-white/40 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add Payment Method
            </button>
          </div>
        </section>

        {/* Billing History */}
        <section>
          <h2 className="font-semibold text-white mb-0.5">Billing History</h2>
          <p className="text-gray-500 text-xs mb-3">View your past invoices and payment history.</p>
          <div className="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10">
                <tr>
                  {['Date', 'Amount', 'Status', 'Invoice'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs text-gray-500 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-600 text-sm">No billing history available.</td>
                </tr>
              </tbody>
            </table>
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

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function ViralBot() {
  const [activeView, setActiveView] = useState<AppView>('dashboard');

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

  return (
    <div className="relative bg-charcoal min-h-screen">
      <MatrixBackground />
      <Navigation />

      {/* ── Hero ── */}
      <section className="pt-32 pb-20 px-[6vw] bg-black/70 relative z-10 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 border border-purple-500/40 rounded-full px-4 py-1.5 text-sm text-purple-300 mb-8">
            <Zap className="w-3.5 h-3.5" />
            AI-Powered Social Media Automation
          </div>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Automate your{' '}
            <span className="text-purple-500">viral<br />growth</span>{' '}
            on autopilot.
          </h1>
          <p className="text-lg text-gray-400 max-w-xl mx-auto mb-10">
            ViralBot finds trending content in your niche and automatically posts it to your social media accounts. Grow your audience while you sleep.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/viral-bot/auth"
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </a>
            <a href="#viral-bot-demo"
              className="inline-flex items-center gap-2 border border-white/20 hover:border-white/40 text-white px-6 py-3 rounded-lg transition-colors">
              View Demo
            </a>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 px-[6vw] bg-zinc-950/70 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">Everything you need to go viral</h2>
          <p className="text-gray-400 mb-12">Powerful tools designed for serious content creators and brands.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-zinc-900 border border-white/10 rounded-xl p-6 text-left">
                <div className="w-10 h-10 bg-purple-600/20 border border-purple-500/30 rounded-lg flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-20 px-[6vw] bg-black/70 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">Simple, transparent pricing</h2>
          <p className="text-gray-400 mb-12">Start for free, upgrade when you go viral.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {pricingPlans.map((plan, i) => (
              <div key={i} className={`bg-zinc-900 border rounded-xl p-6 text-left relative ${plan.popular ? 'border-purple-500' : 'border-white/10'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Most Popular</span>
                  </div>
                )}
                <p className={`font-semibold text-lg mb-1 ${plan.popular ? 'text-purple-400' : 'text-white'}`}>{plan.name}</p>
                <p className="text-gray-400 text-sm mb-4">{plan.subtitle}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  {plan.period && <span className="text-gray-400">{plan.period}</span>}
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feat, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-300">
                      <Zap className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />{feat}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-colors ${plan.popular ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'border border-white/20 hover:border-white/40 text-white'}`}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── App Demo ── */}
      <section id="viral-bot-demo" className="py-16 px-[6vw] bg-zinc-950/70 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold text-white mb-3">See ViralBot in action</h2>
            <p className="text-gray-400">Explore the full platform — dashboard, discovery feed, analytics, and more.</p>
          </div>

          <div className="bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden">
            {/* App top bar */}
            <div className="bg-zinc-900 border-b border-white/10 px-5 py-2.5 flex items-center justify-between">
              <p className="text-gray-400 text-xs">
                Welcome back, your bot has found <span className="text-white font-medium">12 new viral posts</span> today.
              </p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-green-400">Bot Active</span>
                </div>
                <Bell className="w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Sidebar + Content */}
            <div className="flex" style={{ minHeight: 580 }}>
              {/* Sidebar */}
              <div className="w-48 bg-zinc-900 border-r border-white/10 flex flex-col py-5 px-3 flex-shrink-0">
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
                      <p className="text-[10px] text-gray-300 truncate">admin@viralb...</p>
                      <p className="text-[10px] text-purple-400">Enterprise Plan</p>
                    </div>
                    <LogOut className="w-3 h-3 text-gray-500 ml-auto flex-shrink-0" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-auto bg-zinc-950 p-5">
                {activeView === 'dashboard' && <DashboardView />}
                {activeView === 'discovery' && <DiscoveryFeedView />}
                {activeView === 'autoposter' && <AutoPosterView />}
                {activeView === 'analytics' && <AnalyticsView />}
                {activeView === 'settings' && <SettingsView />}
                {activeView === 'admin' && <AdminPanelView />}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
