'use client'

import { useState, useEffect, useRef } from 'react'
import { Coins, Loader2, X } from 'lucide-react'

interface Props {
  postId: string
  postUserId: string
  onCoinSent?: (amount: number) => void
}

export function SupportButton({ postId, postUserId, onCoinSent }: Props) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [myCoins, setMyCoins] = useState<number>(0)
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sentAmount, setSentAmount] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    import('@/lib/supabase/client').then(({ createClient }) => {
      const supabase = createClient()
      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          setCurrentUserId(session.user.id)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data } = await (supabase as any)
            .from('profiles')
            .select('coins')
            .eq('id', session.user.id)
            .single()
          if (data) setMyCoins(data.coins ?? 0)
        } else {
          setCurrentUserId(null)
        }
      })
    })
  }, [])

  // 自分の投稿 or 未ログインは表示しない
  if (!currentUserId || currentUserId === postUserId) return null

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setOpen(true)
    setAmount('')
    setError(null)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setOpen(false)
  }

  const handleSend = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const num = parseInt(amount)
    if (!num || num <= 0) { setError('金額を入力してください'); return }
    if (num > myCoins) { setError('コインが不足しています'); return }
    setLoading(true)
    setError(null)
    const res = await fetch('/api/coins/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, toUserId: postUserId, amount: num }),
    })
    setLoading(false)
    if (res.ok) {
      setOpen(false)
      setMyCoins(prev => prev - num)
      setSentAmount(num)
      onCoinSent?.(num)
      setTimeout(() => setSentAmount(null), 3000)
    } else {
      const data = await res.json()
      setError(data.error || 'エラーが発生しました')
    }
  }

  return (
    <div className="relative" onClick={e => e.stopPropagation()}>
      {!open ? (
        sentAmount ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border" style={{ background: '#F0FDF4', color: '#15803D', borderColor: '#BBF7D0' }}>
            🪙 +{sentAmount.toLocaleString()} 送りました！
          </div>
        ) : (
        <button
          onClick={handleOpen}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:opacity-90 border"
          style={{ background: '#FFF8E1', color: '#B45309', borderColor: '#FDE68A' }}
        >
          <Coins size={13} />
          応援する
        </button>
        )
      ) : (
        <div
          className="absolute bottom-8 right-0 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 z-50"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-700">応援コインを送る</span>
            <button onClick={handleClose} className="text-gray-300 hover:text-gray-500">
              <X size={13} />
            </button>
          </div>
          <p className="text-xs text-gray-400 mb-2">残高: 🪙 {myCoins.toLocaleString()}</p>
          <div className="flex gap-1.5 mb-2">
            {[100, 500, 1000].map(v => (
              <button
                key={v}
                onClick={e => { e.stopPropagation(); setAmount(String(v)) }}
                className="flex-1 py-1 rounded-lg text-xs font-bold transition-all"
                style={amount === String(v)
                  ? { background: '#F59E0B', color: '#fff' }
                  : { background: '#FFF8E1', color: '#92400E' }}
              >
                {v.toLocaleString()}
              </button>
            ))}
          </div>
          <input
            ref={inputRef}
            type="number"
            min={1}
            max={myCoins}
            value={amount}
            onChange={e => setAmount(e.target.value)}
            onClick={e => e.stopPropagation()}
            placeholder="金額を入力"
            className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-2 mb-2"
            style={{ '--tw-ring-color': '#F59E0B' } as React.CSSProperties}
          />
          {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
          <button
            onClick={handleSend}
            disabled={loading}
            className="w-full py-1.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1 disabled:opacity-50"
            style={{ background: '#F59E0B' }}
          >
            {loading ? <Loader2 size={12} className="animate-spin" /> : <Coins size={12} />}
            {loading ? '送信中...' : '送る'}
          </button>
        </div>
      )}
    </div>
  )
}
