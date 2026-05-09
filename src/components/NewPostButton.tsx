'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { POST_CATEGORIES } from '@/types/database'
import { PlusCircle, X, Loader2, Lightbulb } from 'lucide-react'

export function NewPostButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', category: 'IT・テクノロジー' })

  useEffect(() => {
    import('@/lib/supabase/client').then(({ createClient }) => {
      createClient().auth.getUser().then(({ data: { user } }) => setLoggedIn(!!user))
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('posts').insert({
      user_id: user.id,
      title: form.title,
      content: form.content,
      category: form.category,
    })
    setLoading(false)
    if (!error) {
      setOpen(false)
      setForm({ title: '', content: '', category: 'IT・テクノロジー' })
      router.refresh()
    }
  }

  if (!loggedIn) {
    return (
      <div
        onClick={() => router.push('/login')}
        className="mb-5 flex items-center gap-3 bg-gray-50 border border-dashed border-gray-200 rounded-2xl px-4 py-3 text-gray-400 text-sm cursor-pointer hover:border-gray-300 hover:bg-gray-100 transition-all"
      >
        <Lightbulb size={18} className="text-gray-300" />
        起業アイデアを投稿する...
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="mb-5 w-full flex items-center gap-3 border-2 border-dashed rounded-2xl px-4 py-3 text-sm font-medium transition-all"
        style={{ borderColor: '#C7C4F8', color: '#5148E5', background: '#EEF0FF' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#E0DFFE' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#EEF0FF' }}
      >
        <PlusCircle size={18} />
        起業アイデアを投稿する...
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white border border-gray-100 rounded-3xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-gray-900 font-black text-xl">アイデアを投稿</h2>
                <p className="text-xs text-gray-400 mt-0.5">あなたの起業アイデアをシェアしよう</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full p-1.5">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wide">カテゴリ</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': '#5148E5' } as React.CSSProperties}
                >
                  {POST_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wide">事業タイトル</label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                  placeholder="例：AIを使った農業効率化サービス"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wide">事業内容</label>
                <textarea
                  required
                  rows={5}
                  maxLength={2000}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:border-transparent resize-none"
                  placeholder="どんな課題を解決するのか、どうやって収益化するのかを書いてみましょう..."
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full text-white font-bold py-3 rounded-xl transition-all hover:opacity-90 flex items-center justify-center gap-2 shadow-sm"
                style={{ background: '#5148E5' }}
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                投稿する
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
