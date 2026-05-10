'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BlueBadge } from '@/components/BlueBadge'
import { PostCard } from '@/components/PostCard'
import type { Profile, PostWithProfile } from '@/types/database'
import { Loader2, Pencil, LogOut, BadgeCheck, Save, X, Gift, FileText, Coins, Award } from 'lucide-react'

export function ProfileClient({ profile: initialProfile, posts }: { profile: Profile; posts: PostWithProfile[] }) {
  const router = useRouter()
  const [profile, setProfile] = useState(initialProfile)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [badgeLoading, setBadgeLoading] = useState(false)
  const [weeklyLoading, setWeeklyLoading] = useState(false)
  const [form, setForm] = useState({
    display_name: profile.display_name || '',
    bio: profile.bio || '',
    company_name: profile.company_name || '',
    company_role: profile.company_role || '',
    company_description: profile.company_description || '',
  })

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { createClient } = await import('@/lib/supabase/client')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (createClient() as any).from('profiles').update(form).eq('id', profile.id)
    setProfile({ ...profile, ...form })
    setSaving(false)
    setEditing(false)
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
    if (data.ok) {
      alert(`${data.amount.toLocaleString()}コインを受け取りました！`)
      setProfile(p => ({ ...p, coins: p.coins + data.amount }))
    } else {
      alert(data.error || 'エラーが発生しました')
    }
  }

  const handleSignOut = async () => {
    const { createClient } = await import('@/lib/supabase/client')
    await createClient().auth.signOut()
    router.push('/')
    router.refresh()
  }

  const displayName = profile.display_name || profile.username || ''
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900">プロフィール</h1>
        {!editing && (
          <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
            <Pencil size={14} />編集
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-28" style={{ background: 'linear-gradient(135deg, #5148E5 0%, #38BDF8 100%)' }} />
        <div className="px-6 pb-6">
          <div className="-mt-10 mb-4">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-20 h-20 rounded-full border-4 border-white shadow-md" />
            ) : (
              <div className="w-20 h-20 rounded-full border-4 border-white shadow-md flex items-center justify-center text-2xl font-black text-white" style={{ background: '#5148E5' }}>
                {initial}
              </div>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleSave} className="space-y-3">
              {[
                { key: 'display_name', label: '表示名', placeholder: '田中太郎' },
                { key: 'bio', label: '自己紹介', placeholder: '連続起業家。テック×農業に注目中。' },
                { key: 'company_name', label: '会社名', placeholder: '株式会社テックファーム' },
                { key: 'company_role', label: '役職', placeholder: '代表取締役' },
                { key: 'company_description', label: '事業内容', placeholder: 'AIを活用した農業効率化...' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1 block">{label}</label>
                  <input type="text" value={form[key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent" />
                </div>
              ))}
              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 text-white font-bold py-2.5 rounded-xl hover:opacity-90 transition-all" style={{ background: '#5148E5' }}>
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}保存する
                </button>
                <button type="button" onClick={() => setEditing(false)} className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50">
                  <X size={15} />
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-black text-gray-900">{displayName}</h2>
                {profile.has_blue_badge && <BlueBadge size={18} />}
              </div>
              <p className="text-sm text-gray-400">@{profile.username}</p>
              {profile.bio && <p className="text-sm text-gray-600 mt-2 leading-relaxed">{profile.bio}</p>}
              {profile.company_name && (
                <p className="text-sm text-gray-500 mt-1.5">🏢 {profile.company_name}{profile.company_role ? ` · ${profile.company_role}` : ''}</p>
              )}
            </>
          )}
        </div>

        {!editing && (
          <div className="grid grid-cols-3 gap-3 px-6 pb-6">
            <div className="rounded-xl p-3 text-center" style={{ background: '#FFF8E1' }}>
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Coins size={14} className="text-amber-500" />
                <span className="text-base font-black text-amber-600">{(profile.coins ?? 0).toLocaleString()}</span>
              </div>
              <p className="text-xs text-amber-600 font-medium">所持コイン</p>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: '#EEF0FF' }}>
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Award size={14} style={{ color: '#5148E5' }} />
                <span className="text-base font-black" style={{ color: '#5148E5' }}>{(profile.total_coins_received ?? 0).toLocaleString()}</span>
              </div>
              <p className="text-xs font-medium" style={{ color: '#5148E5' }}>累計獲得</p>
            </div>
            <div className="rounded-xl p-3 text-center bg-gray-50">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <FileText size={14} className="text-gray-500" />
                <span className="text-base font-black text-gray-700">{posts.length}</span>
              </div>
              <p className="text-xs text-gray-500 font-medium">投稿数</p>
            </div>
          </div>
        )}
      </div>

      {!editing && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
          <h3 className="text-sm font-black text-gray-500 uppercase tracking-wide">特典・アクション</h3>
          <button onClick={handleWeeklyCoins} disabled={weeklyLoading}
            className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: '#FFF8E1', color: '#92400E' }}>
            <span className="flex items-center gap-2">
              <Gift size={18} className="text-amber-500" />週次ボーナスを受け取る
            </span>
            {weeklyLoading ? <Loader2 size={16} className="animate-spin text-amber-500" /> : <span className="text-amber-500 font-black">+10,000 🪙</span>}
          </button>

          {profile.has_blue_badge ? (
            <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl" style={{ background: '#EEF0FF' }}>
              <BlueBadge size={18} />
              <div>
                <p className="font-bold text-sm" style={{ color: '#5148E5' }}>ブルーバッジ認証済み</p>
                <p className="text-xs text-gray-400">プロフィールに認証マークが表示されています</p>
              </div>
            </div>
          ) : (
            <button onClick={handleBlueBadge} disabled={badgeLoading}
              className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-all"
              style={{ background: '#EEF0FF' }}>
              <span className="flex items-center gap-2">
                <BadgeCheck size={18} style={{ color: '#5148E5' }} />
                <span style={{ color: '#3730A3' }}>ブルーバッジを取得</span>
              </span>
              {badgeLoading ? <Loader2 size={16} className="animate-spin" style={{ color: '#5148E5' }} /> : <span className="text-xs font-black" style={{ color: '#5148E5' }}>¥980 + 50,000🪙</span>}
            </button>
          )}
        </div>
      )}

      {!editing && (
        <div>
          <h3 className="text-lg font-black text-gray-900 mb-3">投稿一覧 <span className="text-sm font-medium text-gray-400">({posts.length}件)</span></h3>
          {posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map(post => <PostCard key={post.id} post={post} />)}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <div className="text-4xl mb-3">📝</div>
              <p className="text-gray-500 font-medium text-sm">まだ投稿がありません</p>
              <a href="/post/new" className="inline-block mt-3 px-4 py-2 rounded-xl text-sm font-bold text-white hover:opacity-90" style={{ background: '#5148E5' }}>
                最初の投稿をする
              </a>
            </div>
          )}
        </div>
      )}

      {!editing && (
        <div className="pb-4">
          <button onClick={handleSignOut} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-100 text-red-400 text-sm font-semibold hover:bg-red-50 transition-all">
            <LogOut size={15} />ログアウト
          </button>
          <p className="text-xs text-gray-400 mt-4">⚠️ 応援コインは現金化できません。シミュレーション用ポイントです。</p>
        </div>
      )}
    </div>
  )
}
