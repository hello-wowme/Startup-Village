'use client'

export const dynamic = 'force-dynamic'

import { Rocket } from 'lucide-react'

export default function LoginPage() {
  const handleTwitterLogin = async () => {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'twitter',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #5148E5 0%, #818CF8 100%)' }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center p-12 text-white">
        <div className="max-w-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Rocket size={24} className="text-white" />
            </div>
            <span className="text-2xl font-black">Startup Village</span>
          </div>
          <h2 className="text-3xl font-black mb-4 leading-tight">
            あなたの起業アイデアを<br />世界に届けよう
          </h2>
          <ul className="space-y-3 text-white/80 text-sm">
            {[
              '💡 起業アイデアを投稿してフィードバックをもらう',
              '🤖 AIがあなたの事業を詳しく評価',
              '🪙 応援コインで仲間のアイデアを応援',
              '🏆 ランキングでトップを目指せ',
            ].map((t) => (
              <li key={t} className="flex items-start gap-2">{t}</li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-white/50">
            ※応援コインは現金化できません。シミュレーション用ポイントです。
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: '#EEF0FF' }}>
                <Rocket size={28} style={{ color: '#5148E5' }} />
              </div>
              <h1 className="text-xl font-black text-gray-900">Startup Villageへようこそ</h1>
              <p className="text-sm text-gray-400 mt-1">ログインして起業の旅を始めよう</p>
            </div>

            <button
              onClick={handleTwitterLogin}
              className="group w-full flex items-center justify-center gap-3 bg-black text-white font-bold py-3.5 px-4 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-xl hover:scale-[1.03] active:scale-[0.98]"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 fill-white transition-transform duration-300 group-hover:rotate-12"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.26 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span className="transition-all duration-200 group-hover:tracking-wide">
                X（Twitter）でログイン
              </span>
            </button>

            <p className="text-xs text-gray-400 text-center mt-5">
              ログインすることで
              <a href="/terms" className="underline">利用規約</a>・
              <a href="/privacy" className="underline">プライバシーポリシー</a>
              に同意したものとみなします。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
