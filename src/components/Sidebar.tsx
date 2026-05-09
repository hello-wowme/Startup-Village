'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { Profile } from '@/types/database'
import { CoinDisplay } from './CoinDisplay'
import { BlueBadge } from './BlueBadge'
import {
  Home, PenLine, Trophy, Building2, User, LayoutDashboard, Moon, Sun, LogOut, Coins
} from 'lucide-react'

const NAV = [
  { href: '/',         label: 'タイムライン', icon: Home },
  { href: '/post/new', label: '投稿する',     icon: PenLine },
  { href: '/ranking',  label: 'ランキング',   icon: Trophy },
  { href: '/company',  label: 'マイ会社',     icon: Building2 },
  { href: '/profile',  label: 'プロフィール', icon: User },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [dark, setDark] = useState(false)

  useEffect(() => {
    let sub: { unsubscribe: () => void } | null = null
    import('@/lib/supabase/client').then(({ createClient }) => {
      const supabase = createClient()
      const load = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setProfile(null); return }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await (supabase as any).from('profiles').select('*').eq('id', user.id).single()
        setProfile(data as Profile | null)
      }
      load()
      const { data: { subscription } } = supabase.auth.onAuthStateChange(load)
      sub = subscription
    })
    return () => sub?.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    const { createClient } = await import('@/lib/supabase/client')
    await createClient().auth.signOut()
    router.push('/')
    router.refresh()
  }

  const navItems = [
    ...NAV,
    ...(profile?.is_admin ? [{ href: '/admin', label: '管理画面', icon: LayoutDashboard }] : []),
  ]

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 flex flex-col bg-white border-r border-gray-100 z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#5148E5' }}>
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
              <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" opacity=".4"/>
              <path d="M9 9h6v6H9z"/>
            </svg>
          </div>
          <div className="leading-none">
            <p className="font-black text-base text-gray-900">Startup</p>
            <p className="text-xs font-medium text-gray-400">Village</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={active
                ? { background: '#5148E5', color: '#fff' }
                : { color: '#6B7280' }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = '#F3F4F6' }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = '' }}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-gray-100 p-4 space-y-3">
        {profile ? (
          <div className="flex items-center gap-3">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-9 h-9 rounded-full flex-shrink-0" />
            ) : (
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ background: '#5148E5' }}>
                {(profile.display_name || profile.username).charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <p className="text-sm font-bold text-gray-900 truncate">{profile.display_name || profile.username}</p>
                {profile.has_blue_badge && <BlueBadge size={13} />}
              </div>
              <CoinDisplay amount={profile.coins} size="sm" />
            </div>
            <button onClick={handleSignOut} className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0">
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 w-full text-white text-sm font-bold py-2.5 rounded-xl transition-all hover:opacity-90"
            style={{ background: '#5148E5' }}
          >
            <Coins size={15} />
            ログインして始める
          </Link>
        )}
      </div>
    </aside>
  )
}
