import { useEffect, useMemo, useState } from 'react';
import { UserPlus, Users, Crown, Shield, Trophy, AlertCircle, Link as LinkIcon } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

 type Friend = {
  id: string;
  code: string;
  name: string;
  disciplineScore: number;
  badges: string[];
  premium?: boolean;
};

function genCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = 'RG-';
  for (let i = 0; i < 8; i++) s += alphabet[Math.floor(Math.random()*alphabet.length)];
  return s;
}

export default function Friends() {
  const location = useLocation() as any;
  const [friends, setFriends] = useState<Friend[]>([]);
  const [myCode, setMyCode] = useState('');
  const [addCode, setAddCode] = useState('');
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState<Friend | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<any | null>(null);
  const { addToast } = useToast();

  const premiumStatus = useMemo(() => {
    try { return localStorage.getItem('premium_status') || 'none'; } catch { return 'none'; }
  }, []);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('friends') || '[]');
      setFriends(Array.isArray(saved) ? saved : []);
      let code = localStorage.getItem('invite_code');
      if (!code) { code = genCode(); localStorage.setItem('invite_code', code); }
      setMyCode(code);
    } catch {}
    if (location?.state?.addedCode) {
      // show the code in the input briefly
      setAddCode(location.state.addedCode);
      // clear state so it doesn't persist on back/forward
      history.replaceState({}, '');
    }
  }, []);

  const addFriend = async () => {
    const code = addCode.trim().toUpperCase();
    if (!/^RG-[A-Z0-9]{6,8}$/.test(code)) { addToast('warning', 'Invalid code format (use RG-XXXXXX or RG-XXXXXXXX)'); return; }
    if (friends.some(f => f.code === code)) { addToast('info', 'Already following this code.'); return; }

    // Attempt referral redemption via Supabase Edge Function (optional)
    try {
      setAdding(true);
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.functions.invoke('redeemReferral', {
          body: { code }
        });
        if (!error && data) {
          const expires = data.premium_expires_at ? new Date(data.premium_expires_at) : null;
          if (expires) {
            addToast('success', `Trial extended by 7 days. Expires ${expires.toLocaleDateString()}.`);
            try {
              localStorage.setItem('premium_expires_at', expires.toISOString());
              try { window.dispatchEvent(new CustomEvent('rg:premium-change')); } catch {}
            } catch {}
          } else {
            addToast('success', 'Friend added.');
          }
        } else if (error) {
          // Show server message if provided
          const msg = (error as any)?.message || 'Could not redeem code, added as friend only.';
          addToast('warning', msg);
        }
      }
    } catch (e: any) {
      addToast('warning', 'Referral service unavailable. Added as friend only.');
    }

    // Always add friend locally so following works regardless of redemption
    const f: Friend = {
      id: `${Date.now()}`,
      code,
      name: `Trader ${code.slice(-3)}`,
      disciplineScore: Math.floor(60 + Math.random()*35),
      badges: Math.random() > 0.5 ? ['Streak', 'Mindset'] : ['Risk Aware'],
      premium: Math.random() > 0.7
    };
    const next = [f, ...friends];
    setFriends(next);
    try { localStorage.setItem('friends', JSON.stringify(next)); } catch {}
    setAddCode('');
    setAdding(false);
  };

  const removeFriend = (id: string) => {
    if (!confirm('Remove this friend?')) return;
    const next = friends.filter(f => f.id !== id);
    setFriends(next);
    try { localStorage.setItem('friends', JSON.stringify(next)); } catch {}
    setSelected(null);
  };

  const canViewDeep = premiumStatus === 'premium';

  // Helper to load or synthesize friend trades
  const getFriendTrades = (friendId: string) => {
    try {
      const raw = localStorage.getItem(`friend_trades_${friendId}`);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) return arr;
      }
    } catch {}
    // synthesize 5 demo trades deterministically from id
    const seed = Number(friendId) || Date.now();
    const rnd = (n: number) => Math.abs(Math.sin(seed + n));
    const syms = ['AAPL','TSLA','NVDA','AMD','META','MSFT'];
    const out = Array.from({ length: 5 }).map((_, i) => {
      const type = rnd(i) > 0.5 ? 'Long' : 'Short';
      const entry = Number((100 + rnd(i+1) * 200).toFixed(2));
      // move 1-5% in favorable/unfavorable direction
      const movePct = (rnd(i+2) * 0.08 - 0.04); // -4%..+4%
      const exit = Number((type === 'Long' ? entry * (1 + movePct) : entry * (1 - movePct)).toFixed(2));
      const size = Math.round(10 + rnd(i+3) * 190);
      const pnl = Number(((type === 'Long' ? (exit - entry) : (entry - exit)) * size).toFixed(2));
      const date = new Date(Date.now() - i * 86400000).toISOString().slice(0,10);
      const stop = Number((entry * (type === 'Long' ? 0.98 : 1.02)).toFixed(2));
      const target = Number((entry * (type === 'Long' ? 1.03 : 0.97)).toFixed(2));
      return {
        id: `${friendId}-${i}`,
        date,
        symbol: syms[i % syms.length],
        type,
        entry,
        exit,
        size,
        pnl,
        emotion: ['Confident','FOMO','Fear','Neutral'][Math.floor(rnd(i+4)*4)],
        notes: 'Shared summary not available',
        ruleCompliant: rnd(i+5) > 0.2,
        target,
        stop,
        tags: ['breakout','trend','risk','momentum'].slice(0, 1 + Math.floor(rnd(i+6)*3))
      };
    });
    try { localStorage.setItem(`friend_trades_${friendId}`, JSON.stringify(out)); } catch {}
    return out;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center"><Users className="h-6 w-6 text-blue-600"/></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Friends</h1>
              <p className="text-gray-600">Add friends by invite code and view profiles</p>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Your Invite Code: <span className="font-mono font-semibold text-gray-900 bg-gray-100 rounded px-2 py-1">{myCode}</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {location?.state?.addedCode && (
            <div className="md:col-span-3 mb-2">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
                Friend with code <span className="font-mono font-semibold">{location.state.addedCode}</span> added.
              </div>
            </div>
          )}
          <div className="md:col-span-1">
            <div className="p-4 rounded-xl border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">Add Friend by Code</label>
              <div className="flex gap-2">
                <input
                  value={addCode}
                  onChange={e=>setAddCode(e.target.value)}
                  onKeyDown={(e)=>{ if (e.key==='Enter') { e.preventDefault(); addFriend(); } }}
                  placeholder="RG-ABC12345"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                />
                <button
                  type="button"
                  onClick={addFriend}
                  disabled={adding}
                  className={`px-3 py-2 rounded-lg flex items-center gap-2 ${adding? 'bg-blue-300 cursor-not-allowed':'bg-blue-600 hover:bg-blue-700 text-white'}`}
                >
                  <UserPlus className="h-4 w-4"/> {adding? 'Adding...':'Add'}
                </button>
              </div>
              {!isSupabaseConfigured() && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded mt-2 px-2 py-1">
                  Supabase not configured in this environment. Adding will only follow locally without trial extension.
                </p>
              )}
              <p className="text-xs text-gray-500 mt-2">Ask your friend to share their code. Your code is shown above.</p>
            </div>

            <div className="mt-4 p-4 rounded-xl border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">Invite Link</label>
              <button
                onClick={() => {
                  try {
                    const url = `${window.location.origin}/invite/${myCode}`;
                    navigator.clipboard.writeText(url);
                    addToast('success', 'Invite link copied to clipboard.');
                  } catch {
                    addToast('warning', 'Could not copy to clipboard.');
                  }
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
              >
                <LinkIcon className="h-4 w-4"/> Copy Invite Link
              </button>
            </div>

            {premiumStatus !== 'premium' && (
              <div className="mt-4 p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-sm flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5"/>
                <div>
                  Viewing full profiles is a Premium feature. You'll see a limited summary until you upgrade.
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <h3 className="font-semibold text-gray-900 mb-3">Friend List</h3>
            {friends.length === 0 && <p className="text-sm text-gray-500">No friends yet. Add one with a code.</p>}
            <div className="grid sm:grid-cols-2 gap-4">
              {friends.map(f => (
                <button key={f.id} onClick={()=>{ setSelected(f); setLoadingProfile(true); setTimeout(()=>setLoadingProfile(false), 400); }} className="text-left p-4 rounded-xl border border-gray-200 hover:border-gray-300 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">{f.name.slice(0,1)}</div>
                      <div>
                        <p className="font-semibold text-gray-900">{f.name}</p>
                        <p className="text-xs text-gray-500">Code: {f.code}</p>
                      </div>
                    </div>
                    {f.premium && <Crown className="h-5 w-5 text-purple-500"/>}
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-sm">
                    <div className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-200">Discipline {f.disciplineScore}%</div>
                    <div className="flex items-center gap-1 text-gray-600"><Trophy className="h-4 w-4"/> {f.badges.length} badges</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 grid place-items-center text-xl">{selected.name.slice(0,1)}</div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{selected.name}</h4>
                  <p className="text-sm text-gray-600">Discipline Score: {selected.disciplineScore}%</p>
                </div>
              </div>
              <button onClick={()=>setSelected(null)} className="p-2 rounded-lg hover:bg-gray-100">✕</button>
            </div>

            {!canViewDeep && (
              <div className="p-4 rounded-xl border border-purple-200 bg-purple-50 text-purple-800 flex items-start gap-2 mb-4">
                <Shield className="h-4 w-4 mt-0.5"/>
                <div>
                  Full profile (journal, rules, analytics) is a Premium feature. You’re seeing a limited summary.
                  <div className="mt-2">
                    <a href="/premium" className="inline-block px-3 py-1 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700">Upgrade to view full profile</a>
                  </div>
                </div>
              </div>
            )}

            {loadingProfile ? (
              <div className="grid md:grid-cols-3 gap-4 animate-pulse">
                <div className="md:col-span-1">
                  <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {Array.from({length:3}).map((_,i)=>(<div key={i} className="h-6 w-16 bg-gray-200 rounded" />))}
                  </div>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <div className="h-4 w-28 bg-gray-200 rounded" />
                  {Array.from({length:3}).map((_,i)=>(<div key={i} className="h-3 w-full bg-gray-200 rounded" />))}
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <p className="text-sm text-gray-600">Badges</p>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {selected.badges.map((b, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full border border-gray-200 bg-gray-50 text-xs">{b}</span>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">Recent Summary</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-800 mt-1">
                    <li>Weekly PnL: {Math.random() > 0.5 ? '+' : '-'}${Math.floor(Math.random()*1500)}</li>
                    <li>Average R:R: 1:{(1 + Math.random()*1.5).toFixed(2)}</li>
                    <li>Top Tags: risk, momentum, breakout</li>
                  </ul>
                </div>

                {/* Recent Trades */}
                <div className="md:col-span-3">
                  <div className="mt-4 p-4 rounded-xl border border-gray-200 bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-semibold text-gray-900">Recent Trades</h5>
                      {!canViewDeep && (
                        <a href="/premium" className="text-xs text-purple-700 hover:underline">Unlock details</a>
                      )}
                    </div>
                    {(() => {
                      const trades = getFriendTrades(selected.id);
                      const wins = trades.filter((t:any)=> (t.pnl||0) > 0).length;
                      const avg = trades.length ? Math.round(trades.reduce((s:any,t:any)=>s+(t.pnl||0),0)/trades.length) : 0;
                      return (
                        <>
                          <div className="mb-3 flex items-center gap-3 text-xs">
                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">Trades {trades.length}</span>
                            <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-800 border border-green-200">Win {Math.round((wins/Math.max(1,trades.length))*100)}%</span>
                            <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">Avg P&L ${avg}</span>
                          </div>
                          <div className="divide-y divide-gray-100">
                            {trades.map((t:any)=> (
                              <div key={t.id} className="py-2 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`w-2.5 h-2.5 rounded-full ${t.pnl>0?'bg-green-500':t.pnl<0?'bg-red-500':'bg-gray-400'}`}></div>
                                  <div>
                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                                      <span>{t.symbol}</span>
                                      <span className={`px-2 py-0.5 rounded-full text-[11px] border ${t.type==='Long'?'bg-emerald-100 text-emerald-800 border-emerald-200':'bg-sky-100 text-sky-800 border-sky-200'}`}>{t.type}</span>
                                    </div>
                                    <p className="text-xs text-gray-500">{t.date}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className={`text-sm font-semibold ${t.pnl>0?'text-green-600':t.pnl<0?'text-red-600':'text-gray-600'}`}>{t.pnl>0?'+':''}${Number(t.pnl||0).toFixed(2)}</span>
                                  {canViewDeep ? (
                                    <button onClick={()=>setSelectedTrade(t)} className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50">View</button>
                                  ) : (
                                    <span className="text-[11px] text-gray-400">Details locked</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between">
              <button onClick={()=>removeFriend(selected.id)} className="px-3 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 text-sm">Remove Friend</button>
              <button onClick={()=>setSelected(null)} className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Trade Details Modal (Premium only) */}
      {selected && selectedTrade && canViewDeep && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-bold text-gray-900">{selectedTrade.symbol} — {selectedTrade.type}</h4>
              <button onClick={()=>setSelectedTrade(null)} className="p-2 rounded hover:bg-gray-100">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Date:</span> <span className="font-medium">{selectedTrade.date}</span></div>
              <div><span className="text-gray-500">Size:</span> <span className="font-medium">{selectedTrade.size} shares</span></div>
              <div><span className="text-gray-500">Entry:</span> <span className="font-medium">${selectedTrade.entry}</span></div>
              <div><span className="text-gray-500">Exit:</span> <span className="font-medium">${selectedTrade.exit}</span></div>
              <div><span className="text-gray-500">Target:</span> <span className="font-medium">${selectedTrade.target}</span></div>
              <div><span className="text-gray-500">Stop:</span> <span className="font-medium">${selectedTrade.stop}</span></div>
              <div><span className="text-gray-500">Emotion:</span> <span className="font-medium">{selectedTrade.emotion}</span></div>
              <div><span className="text-gray-500">Compliance:</span> <span className="font-medium">{selectedTrade.ruleCompliant? 'Yes':'No'}</span></div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              {(() => {
                const risk = selectedTrade.type==='Long' ? (selectedTrade.entry - selectedTrade.stop) : (selectedTrade.stop - selectedTrade.entry);
                const reward = selectedTrade.type==='Long' ? (selectedTrade.target - selectedTrade.entry) : (selectedTrade.entry - selectedTrade.target);
                const rr = (risk>0 && reward>0) ? (reward/risk) : null;
                const pct = (selectedTrade.type==='Long' ? ((selectedTrade.exit - selectedTrade.entry)/selectedTrade.entry*100) : ((selectedTrade.entry - selectedTrade.exit)/selectedTrade.entry*100));
                return (
                  <div className="flex items-center gap-3 text-sm">
                    <span className={`px-2 py-0.5 rounded-full border ${selectedTrade.pnl>0?'bg-green-100 text-green-800 border-green-200':'bg-red-100 text-red-800 border-red-200'}`}>{selectedTrade.pnl>0?'Win':'Loss'}</span>
                    <span className="text-gray-700 font-medium">{pct.toFixed(2)}%</span>
                    {rr && <span className="text-gray-700 font-medium">R:R 1:{rr.toFixed(2)}</span>}
                  </div>
                );
              })()}
              <span className={`font-bold ${selectedTrade.pnl>0?'text-green-600':'text-red-600'}`}>{selectedTrade.pnl>0?'+':''}${Number(selectedTrade.pnl||0).toFixed(2)}</span>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">Tags:</p>
              <div className="mt-1 flex gap-2 flex-wrap">
                {(selectedTrade.tags||[]).map((t:string, i:number)=>(<span key={i} className="px-2 py-0.5 rounded-full border border-gray-200 bg-gray-50 text-xs">{t}</span>))}
              </div>
            </div>
            <div className="mt-6 text-right">
              <button onClick={()=>setSelectedTrade(null)} className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
