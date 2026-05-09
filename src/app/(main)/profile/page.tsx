'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BlueBadge } from '@/components/BlueBadge'
import { CoinDisplay } from '@/components/CoinDisplay'
import type { Profile } from '@/types/database'
import { Loader2, BadgeCheck, Save, Gift, User } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [badgeLoading, setBadgeLoading] = useState(false)
  const [weeklyLoading, setWeeklyLoading] = useState(false)
  const [form, setForm] = useState({ display_name: '', bio: '' })

  useEffect(() => {
    const load = async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await (supabase as any).from('profiles').select('*').eq('id', user.id).single()
      if (data) { setProfile(data); setForm({ display_name: data.display_name || '', bio: data.bio || '' }) }
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) await (supabase as any).from('profiles').update(form).eq('id', user.id)
    setSaving(false); alert('保存しました')
  }

  const handleBlueBadge = async () => {
    setBadgeLoading(true)
    const res = await fetch('/api/stripe/checkout', { method: 'POST' })
    const data = await res.json()
    setBadgeLoading(false)
    if (data.url) window.location.href = data.url
    else alert(data.error || 'エラーが発生しました')
  }

  const handleWeeklyCoins = async () => {
    setWeeklyLoading(true)
    const res = await fetch('/api/coins/weekly', { method: 'POST' })
    const data = await res.json()
    setWeeklyLoading(false)
    if (data.ok) { alert(`${data.amount.toLocaleString()}コインを受け取りました！`); window.location.reload() }
    else alert(data.error || 'エラーが発生しました')
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin" style={{ color: '#5148E5' }} size={28} /></div>

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">プロフィール</h1>
        <p className="text-sm text-gray-400 mt-1">アカウント情報を管理する</p>
      </div>

      {/* User card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="" className="w-16 h-16 rounded-2xl" />
        ) : (
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-xl" style={{ background: '#5148E5' }}>
            {(profile?.display_name || profile?.username || '?').charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-black text-gray-900 text-lg">{profile?.display_name || profile?.username}</p>
            {profile?.has_blue_badge && <BlueBadge size={18} />}
          </div>
          <p className="text-gray-400 text-sm">@{profile?.username}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400 mb-0.5">残高</p>
          <CoinDisplay amount={profile?.coins ?? 0} size="lg" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm text-center">
          <p className="text-xs text-gray-400 mb-1">コイン残高</p>
          <CoinDisplay amount={profile?.coins ?? 0} size="lg" />
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm text-center">
          <p className="text-xs text-gray-400 mb-1">受け取った総コイン</p>
          <CoinDisplay amount={profile?.total_coins_received ?? 0} size="lg" />
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3">
        <h2 className="text-sm font-black text-gray-500 uppercase tracking-wide">特典・課金</h2>
        <button onClick={handleWeeklyCoins} disabled={weeklyLoading}
          className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 disabled:opacity-50"
          style={{ background: '#FFF8E1', color: '#92400E' }}>
          <span className="flex items-center gap-2"><Gift size={18} className="text-amber-500" />週次ボーナスを受け取る</span>
          <span className="text-amber-500 font-black">+10,000 🪙</span>
        </button>
        {!profile?.has_blue_badge ? (
          <button onClick={handleBlueBadge} disabled={badgeLoading}
            className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: '#EEF0FF', color: '#3730A3' }}>
            <span className="flex items-center gap-2"><BadgeCheck size={18} style={{ color: '#5148E5' }} />ブルーバッジを取得</span>
            <span className="text-xs font-black" style={{ color: '#5148E5' }}>¥980 + 50,000🪙</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 px-4 py-3.5 rounded-xl text-sm font-bold" style={{ background: '#EEF0FF', color: '#5148E5' }}>
            <BlueBadge size={16} />ブルーバッジ認証済み ✓
          </div>
        )}
      </div>

      {/* Edit form */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <h2 className="font-black text-gray-900 mb-4">プロフィール編集</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">表示名</label>
            <input type="text" value={form.display_name} onChange={e => setForm({ ...form, display_name: e.target.value })}
              placeholder="田中太郎"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:border-transparent" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">自己紹介</label>
            <input type="text" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })}
              placeholder="連続起業家。テック×農業に注目中。"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:border-transparent" />
          </div>
          <button type="submit" disabled={saving}
            className="w-full text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60"
            style={{ background: '#5148E5' }}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}保存する
          </button>
        </form>
      </div>
      <p className="text-xs text-gray-400 text-center">⚠️ 応援コインは現金化できません。実際の投資・出資ではありません。</p>
    </div>
  )
}
