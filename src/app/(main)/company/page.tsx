'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Profile } from '@/types/database'
import { Loader2, Save, Building2 } from 'lucide-react'

const INDUSTRIES = ['テクノロジー','フード・飲食','ヘルスケア','エンタメ','教育','FinTech','EC・小売','サービス業','ものづくり','その他']

export default function CompanyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ company_name: '', company_role: '', company_description: '', industry: 'テクノロジー' })

  useEffect(() => {
    const load = async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await (supabase as any).from('profiles').select('*').eq('id', user.id).single()
      if (data) setForm({
        company_name: data.company_name || '',
        company_role: data.company_role || '',
        company_description: data.company_description || '',
        industry: 'テクノロジー',
      })
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) await (supabase as any).from('profiles').update({
      company_name: form.company_name,
      company_role: form.company_role,
      company_description: form.company_description,
    }).eq('id', user.id)
    setSaving(false)
    alert('保存しました')
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin" style={{ color: '#5148E5' }} size={28} /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">マイ会社</h1>
        <p className="text-sm text-gray-400 mt-1">仮想会社プロフィール</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 block">会社名 <span className="text-red-400">*</span></label>
            <input required type="text" value={form.company_name}
              onChange={e => setForm({ ...form, company_name: e.target.value })}
              placeholder="例: スタートアップ株式会社"
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#5148E5' } as React.CSSProperties} />
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 block">代表者名 <span className="text-red-400">*</span></label>
            <input required type="text" value={form.company_role}
              onChange={e => setForm({ ...form, company_role: e.target.value })}
              placeholder="例: 山田太郎"
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:border-transparent" />
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 block">業種</label>
            <select value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:border-transparent appearance-none">
              {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 block">事業内容 <span className="text-red-400">*</span></label>
            <textarea required rows={5} value={form.company_description}
              onChange={e => setForm({ ...form, company_description: e.target.value })}
              placeholder="事業内容を詳しく記入してください..."
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:border-transparent resize-none" />
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={saving}
              className="text-white font-bold px-8 py-3 rounded-xl flex items-center gap-2 hover:opacity-90 disabled:opacity-60"
              style={{ background: '#5148E5' }}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}保存する
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
