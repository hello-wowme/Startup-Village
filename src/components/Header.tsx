'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { Profile } from '@/types/database'
import { BlueBadge } from './BlueBadge'
import { CoinDisplay } from './CoinDisplay'
import { Trophy, LogOut, User, LayoutDashboard, Rocket, ChevronDown } from 'lucide-react'

export function Header() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    let sub: { unsubscribe: () => void } | null = null
    import('@/lib/supabase/client').then(({ createClient }) => {
      const supabase = createClient()
      const fetchProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setProfile(null); return }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await (supabase as any).from('profiles').select('*').eq('id', user.id).single()
        setProfile(data as Profile | null)
      }
      fetchProfile()
      const { data: { subscription } } = supabase.auth.onAuthStateChange(() => fetchProfile())
      sub = subscription
    })
    return () => sub?.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-black text-lg">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#5148E5' }}>
            <Rocket className="text-white" size={16} />
          </div>
          <span style={{ color: '#5148E5' }}>Startup</span>
          <span className="text-gray-900">Village</span>
        </Link>

        <nav className="flex items-center gap-3">
          <Link
            href="/ranking"
            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors px-2 py-1"
          >
            <Trophy size={16} />
            <span className="hidden sm:inline">ランキング</span>
          </Link>

          {profile ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 border border-gray-200 rounded-full pl-2 pr-3 py-1.5 hover:border-gray-300 hover:bg-gray-50 transition-all"
              >
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-6 h-6 rounded-full" />
                ) : (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: '#5148E5' }}>
                    {(profile.display_name || profile.username).charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-medium text-gray-800 max-w-20 truncate">{profile.display_name || profile.username}</span>
                {profile.has_blue_badge && <BlueBadge size={14} />}
                <CoinDisplay amount={profile.coins} size="sm" />
                <ChevronDown size={14} className="text-gray-400" />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-20">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-xs text-gray-400">コイン残高</p>
                      <CoinDisplay amount={profile.coins} size="md" />
                    </div>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      <User size={15} className="text-gray-400" />プロフィール
                    </Link>
                    {profile.is_admin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setMenuOpen(false)}
                      >
                        <LayoutDashboard size={15} className="text-gray-400" />管理画面
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={15} />ログアウト
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="text-white text-sm font-bold px-4 py-2 rounded-full transition-all hover:opacity-90 shadow-sm"
              style={{ background: '#5148E5' }}
            >
              ログイン
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
