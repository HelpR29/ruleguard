import React, { useEffect, useMemo, useState } from 'react';
import { UserPlus, Users, Crown, Shield, Trophy, AlertCircle } from 'lucide-react';

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
  for (let i = 0; i < 6; i++) s += alphabet[Math.floor(Math.random()*alphabet.length)];
  return s;
}

export default function Friends() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [myCode, setMyCode] = useState('');
  const [addCode, setAddCode] = useState('');
  const [selected, setSelected] = useState<Friend | null>(null);

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
  }, []);

  const addFriend = () => {
    const code = addCode.trim().toUpperCase();
    if (!/^RG-[A-Z0-9]{6}$/.test(code)) return;
    if (friends.some(f => f.code === code)) return;
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
  };

  const removeFriend = (id: string) => {
    const next = friends.filter(f => f.id !== id);
    setFriends(next);
    try { localStorage.setItem('friends', JSON.stringify(next)); } catch {}
    setSelected(null);
  };

  const canViewDeep = premiumStatus === 'premium';

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
          <div className="md:col-span-1">
            <div className="p-4 rounded-xl border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">Add Friend by Code</label>
              <div className="flex gap-2">
                <input value={addCode} onChange={e=>setAddCode(e.target.value)} placeholder="RG-ABC123" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg" />
                <button onClick={addFriend} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"><UserPlus className="h-4 w-4"/> Add</button>
              </div>
              <p className="text-xs text-gray-500 mt-2">Ask your friend to share their code. Your code is shown above.</p>
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
                <button key={f.id} onClick={()=>setSelected(f)} className="text-left p-4 rounded-xl border border-gray-200 hover:border-gray-300 bg-white">
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
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button onClick={()=>removeFriend(selected.id)} className="px-3 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 text-sm">Remove Friend</button>
              <button onClick={()=>setSelected(null)} className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
