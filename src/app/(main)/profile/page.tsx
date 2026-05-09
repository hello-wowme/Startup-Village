'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BlueBadge } from '@/components/BlueBadge'
import type { Profile } from '@/types/database'
import { Loader2, Pencil, LogOut, BadgeCheck, Save, X } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [badgeLoading, setBadgeLoading] = useState(false)
  const [form, setForm] = useState({ display_name: '', bio: '', company_name: '', company_role: '', company_description: '' })

  const load = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any).from('profiles').select('*').eq('id', user.id).single()
      const p = data as Profile | null
      if (p) {
        setProfile(p)
        setForm({ display_name: p.display_name || '', bio: p.bio || '', company_name: p.company_name || '', company_role: p.company_role || '', company_description: p.company_description || '' })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('profiles').update(form).eq('id', user.id)
    setSaving(false)
    setEditing(false)
    load()
  }

  const handleBlueBadge = async () => {
    setBadgeLoading(true)
    const res = await fetch('/api/stripe/checkout', { method: 'POST' })
    const data = await res.json()
    setBadgeLoading(false)
    if (data.url) window.location.href = data.url
    else alert(data.error || 'エラーが発生しました')
  }

  const handleSignOut = async () => {
    const { createClient } = await import('@/lib/supabase/client')
    await createClient().auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="animate-spin" style={{ color: '#5148E5' }} size={32} />
    </div>
  )

  const displayName = profile?.display_name || profile?.username || ''
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-gray-900">プロフィール</h1>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
          >
            <Pencil size={14} />編集
          </button>
        )}
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
        {/* Banner */}
        <div className="h-28" style={{ background: 'linear-gradient(135deg, #5148E5 0%, #38BDF8 100%)' }} />

        {/* Avatar + info */}
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-10 mb-4">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-20 h-20 rounded-full border-4 border-white shadow-md flex-shrink-0" />
            ) : (
              <div className="w-20 h-20 rounded-full border-4 border-white shadow-md flex-shrink-0 flex items-center justify-center text-2xl font-black text-white" style={{ background: '#5148E5' }}>
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
                  <input
                    type="text"
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent"
                  />
                </div>
              ))}
              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 text-white font-bold py-2.5 rounded-xl hover:opacity-90 transition-all" style={{ background: '#5148E5' }}>
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}保存する
                </button>
                <button type="button" onClick={() => setEditing(false)} className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-all">
                  <X size={15} />
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-black text-gray-900">{displayName}</h2>
                {profile?.has_blue_badge && <BlueBadge size={18} />}
              </div>
              <p className="text-sm text-gray-400 mb-1">@{profile?.username}</p>
              {profile?.bio && <p className="text-sm text-gray-600 mt-2">{profile.bio}</p>}
              {profile?.company_name && (
                <p className="text-sm text-gray-500 mt-1">🏢 {profile.company_name}{profile.company_role ? ` · ${profile.company_role}` : ''}</p>
              )}
            </>
          )}
        </div>

        {/* Stats */}
        {!editing && (
          <div className="grid grid-cols-2 gap-3 px-6 pb-6">
            <div className="rounded-xl p-4" style={{ background: '#FFF8E1' }}>
              <p className="text-xs font-semibold text-amber-600 mb-1">所持コイン</p>
              <div className="flex items-center gap-1.5">
                <span className="text-lg">🪙</span>
                <span className="text-xl font-black text-amber-600">{(profile?.coins ?? 0).toLocaleString()}</span>
              </div>
            </div>
            <div className="rounded-xl p-4" style={{ background: '#EEF0FF' }}>
              <p className="text-xs font-semibold mb-1" style={{ color: '#5148E5' }}>累計獲得コイン</p>
              <div className="flex items-center gap-1.5">
                <span className="text-lg">🏅</span>
                <span className="text-xl font-black" style={{ color: '#5148E5' }}>{(profile?.total_coins_received ?? 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Blue badge */}
        {!editing && (
          <div className="px-6 pb-6">
            {profile?.has_blue_badge ? (
              <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: '#EEF0FF' }}>
                <BlueBadge size={20} />
                <div>
                  <p className="font-bold text-sm" style={{ color: '#5148E5' }}>ブルーバッジ認証済み</p>
                  <p className="text-xs text-gray-400">プロフィールに認証マークが表示されています</p>
                </div>
              </div>
            ) : (
              <button
                onClick={handleBlueBadge}
                disabled={badgeLoading}
                className="w-full p-4 rounded-xl text-left hover:opacity-90 transition-all disabled:opacity-50"
                style={{ background: '#EEF0FF' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BadgeCheck size={20} style={{ color: '#5148E5' }} />
                    <div>
                      <p className="font-bold text-sm" style={{ color: '#5148E5' }}>ブルーバッジ</p>
                      <p className="text-xs text-gray-400">ブルーバッジを取得すると、プロフィールに認証マークが表示され、追加で50,000コインが付与されます。</p>
                      <p className="text-xs text-gray-300 mt-0.5">※ Stripe課金機能はBuilder+プランで利用可能です</p>
                    </div>
                  </div>
                  <span className="text-xs font-black ml-3 flex-shrink-0" style={{ color: '#5148E5' }}>¥980</span>
                </div>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Logout */}
      {!editing && (
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-100 text-red-400 text-sm font-semibold hover:bg-red-50 transition-all"
        >
          <LogOut size={15} />ログアウト
        </button>
      )}

      <p className="text-xs text-gray-400 text-center mt-6">
        ⚠️ 応援コインは現金化できません。シミュレーション用ポイントです。
      </p>
    </div>
  )
}
