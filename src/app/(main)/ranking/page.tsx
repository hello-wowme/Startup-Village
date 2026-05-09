import { createClient } from '@/lib/supabase/server'
import { BlueBadge } from '@/components/BlueBadge'
import { CoinDisplay } from '@/components/CoinDisplay'
import { Trophy, Medal } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function RankingPage() {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profilesRaw } = await (supabase as any)
    .from('profiles')
    .select('id, username, display_name, avatar_url, has_blue_badge, company_name, company_role, total_coins_received')
    .order('total_coins_received', { ascending: false })
    .limit(50)

  type RankProfile = Pick<import('@/types/database').Profile,
    'id' | 'username' | 'display_name' | 'avatar_url' | 'has_blue_badge' | 'company_name' | 'company_role' | 'total_coins_received'>
  const profiles = (profilesRaw ?? []) as RankProfile[]

  const rankMedals = ['🥇', '🥈', '🥉']

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Trophy size={26} style={{ color: '#5148E5' }} />
        <div>
          <h1 className="text-2xl font-black text-gray-900">ランキング</h1>
          <p className="text-sm text-gray-400 mt-0.5">受け取った応援コインの累計ランキング</p>
        </div>
      </div>
      <p className="text-xs text-gray-400 mb-4">※ 応援コインは現金化できません。シミュレーション用ポイントです。</p>
      <div className="space-y-3">
        {profiles.map((profile, i) => (
          <div key={profile.id} className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl px-5 py-4 hover:shadow-sm transition-all">
            <div className="w-10 text-center flex-shrink-0">
              {rankMedals[i] ? <span className="text-2xl">{rankMedals[i]}</span> : <span className="text-lg font-black text-gray-300">{i + 1}</span>}
            </div>
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-11 h-11 rounded-full ring-2 ring-gray-100 flex-shrink-0" />
            ) : (
              <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold" style={{ background: '#5148E5' }}>
                {(profile.display_name || profile.username).charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-gray-900 text-sm">{profile.display_name || profile.username}</span>
                {profile.has_blue_badge && <BlueBadge size={14} />}
              </div>
              {profile.company_name && <p className="text-xs text-gray-400">{profile.company_name}</p>}
            </div>
            <CoinDisplay amount={profile.total_coins_received} size="md" />
          </div>
        ))}
        {profiles.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Medal size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">まだランキングデータがありません</p>
          </div>
        )}
      </div>
    </div>
  )
}
