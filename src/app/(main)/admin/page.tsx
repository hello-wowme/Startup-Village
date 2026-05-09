import { createClient } from '@/lib/supabase/server'
import { BlueBadge } from '@/components/BlueBadge'
import { CoinDisplay } from '@/components/CoinDisplay'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Users, FileText, CreditCard, TrendingUp } from 'lucide-react'
import type { Profile, PostWithProfile } from '@/types/database'

export const dynamic = 'force-dynamic'

type PaymentRow = {
  id: string; user_id: string; stripe_session_id: string; amount: number
  coins_granted: number; payment_type: string; status: string; created_at: string
  stripe_payment_intent_id: string | null; profiles: { username: string } | null
}

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const db = supabase as any
  const { data: me } = await db.from('profiles').select('*').eq('id', user.id).single()
  if (!me?.is_admin) redirect('/')

  const [{ data: usersRaw }, { data: postsRaw }, { data: paymentsRaw }] = await Promise.all([
    db.from('profiles').select('*').order('created_at', { ascending: false }).limit(50),
    db.from('posts').select('*, profiles(username, display_name)').order('created_at', { ascending: false }).limit(50),
    db.from('stripe_payments').select('*, profiles(username)').order('created_at', { ascending: false }).limit(50),
  ])

  const users = (usersRaw ?? []) as Profile[]
  const posts = (postsRaw ?? []) as PostWithProfile[]
  const payments = (paymentsRaw ?? []) as PaymentRow[]

  const stats = [
    { label: '総ユーザー数', value: users.length, icon: Users, color: '#5148E5' },
    { label: '総投稿数', value: posts.length, icon: FileText, color: '#10B981' },
    { label: 'ブルーバッジ', value: users.filter(u => u.has_blue_badge).length, icon: CreditCard, color: '#3B82F6' },
    { label: '決済完了', value: payments.filter(p => p.status === 'completed').length, icon: TrendingUp, color: '#F59E0B' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-gray-900">管理画面</h1>
        <p className="text-sm text-gray-400 mt-1">サービス全体の管理</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: color + '20' }}>
                <Icon size={16} style={{ color }} />
              </div>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
            <p className="text-2xl font-black text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Users */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Users size={16} style={{ color: '#5148E5' }} />
          <h2 className="font-black text-gray-900">ユーザー一覧</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-xs text-gray-500 font-semibold">
                <th className="text-left px-5 py-3">ユーザー</th>
                <th className="text-left px-5 py-3">会社</th>
                <th className="text-right px-5 py-3">残高</th>
                <th className="text-center px-5 py-3">バッジ</th>
                <th className="text-right px-5 py-3">登録日</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      {u.avatar_url && <img src={u.avatar_url} alt="" className="w-7 h-7 rounded-full" />}
                      <span className="font-medium text-gray-900">{u.display_name || u.username}</span>
                      {u.has_blue_badge && <BlueBadge size={13} />}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-400">{u.company_name || '-'}</td>
                  <td className="px-5 py-3 text-right"><CoinDisplay amount={u.coins} size="sm" /></td>
                  <td className="px-5 py-3 text-center">{u.has_blue_badge ? '✓' : '-'}</td>
                  <td className="px-5 py-3 text-right text-gray-400 text-xs">{format(new Date(u.created_at), 'M/d', { locale: ja })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Posts */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <FileText size={16} style={{ color: '#5148E5' }} />
          <h2 className="font-black text-gray-900">投稿一覧</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-xs text-gray-500 font-semibold">
                <th className="text-left px-5 py-3">タイトル</th>
                <th className="text-left px-5 py-3">投稿者</th>
                <th className="text-center px-5 py-3">AI</th>
                <th className="text-right px-5 py-3">コイン</th>
                <th className="text-right px-5 py-3">日時</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(p => (
                <tr key={p.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                  <td className="px-5 py-3 font-medium text-gray-900 max-w-xs truncate">{p.title}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{(p.profiles as any)?.display_name || (p.profiles as any)?.username}</td>
                  <td className="px-5 py-3 text-center text-xs font-bold" style={{ color: '#5148E5' }}>{p.ai_score ?? '-'}</td>
                  <td className="px-5 py-3 text-right"><CoinDisplay amount={p.coins_received} size="sm" /></td>
                  <td className="px-5 py-3 text-right text-gray-400 text-xs">{format(new Date(p.created_at), 'M/d', { locale: ja })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payments */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <CreditCard size={16} style={{ color: '#5148E5' }} />
          <h2 className="font-black text-gray-900">決済履歴</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-xs text-gray-500 font-semibold">
                <th className="text-left px-5 py-3">ユーザー</th>
                <th className="text-left px-5 py-3">種別</th>
                <th className="text-right px-5 py-3">金額</th>
                <th className="text-right px-5 py-3">付与コイン</th>
                <th className="text-center px-5 py-3">状態</th>
                <th className="text-right px-5 py-3">日時</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                  <td className="px-5 py-3 text-gray-500 text-xs">{p.profiles?.username}</td>
                  <td className="px-5 py-3 font-medium text-gray-900 text-xs">{p.payment_type === 'blue_badge' ? 'ブルーバッジ' : p.payment_type}</td>
                  <td className="px-5 py-3 text-right text-gray-900 font-medium">¥{p.amount.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right"><CoinDisplay amount={p.coins_granted} size="sm" /></td>
                  <td className="px-5 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${p.status === 'completed' ? 'bg-green-100 text-green-700' : p.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {p.status === 'completed' ? '完了' : p.status === 'pending' ? '保留' : '失敗'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-gray-400 text-xs">{format(new Date(p.created_at), 'M/d', { locale: ja })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
