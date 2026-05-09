'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { POST_CATEGORIES } from '@/types/database'
import { Loader2, Send } from 'lucide-react'

export default function NewPostPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', category: 'IT・テクノロジー' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { data, error } = await (supabase as any).from('posts').insert({ user_id: user.id, ...form }).select('id').single()
    setLoading(false)
    if (!error && data) router.push(`/post/${data.id}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">投稿する</h1>
        <p className="text-sm text-gray-400 mt-1">あなたの起業アイデアをシェアしよう</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 block">カテゴリ</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:border-transparent">
              {POST_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 block">事業タイトル <span className="text-red-400">*</span></label>
            <input required maxLength={100} type="text" value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="例：AIを使った農業効率化サービス"
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:border-transparent" />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 block">事業内容 <span className="text-red-400">*</span></label>
            <textarea required rows={8} maxLength={2000} value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
              placeholder="どんな課題を解決するのか、ターゲット顧客、収益モデルなどを書いてみましょう..."
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:border-transparent resize-none" />
            <p className="text-xs text-gray-400 text-right mt-1">{form.content.length}/2000</p>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={loading}
              className="text-white font-bold px-8 py-3 rounded-xl flex items-center gap-2 hover:opacity-90 disabled:opacity-60"
              style={{ background: '#5148E5' }}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}投稿する
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
