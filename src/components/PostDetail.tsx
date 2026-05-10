'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow, format } from 'date-fns'
import { ja } from 'date-fns/locale'
import type { PostWithProfile, CommentWithProfile, Profile } from '@/types/database'
import { BlueBadge } from './BlueBadge'
import { CoinDisplay } from './CoinDisplay'
import { MessageCircle, Building2, ArrowLeft, Send, Loader2, Coins } from 'lucide-react'
import Link from 'next/link'

const COIN_OPTIONS = [100, 500, 1000, 5000]

interface Props {
  post: PostWithProfile
  comments: CommentWithProfile[]
  currentProfile: Profile | null
}

export function PostDetail({ post, comments: initialComments, currentProfile }: Props) {
  const router = useRouter()
  const [comments, setComments] = useState(initialComments)
  const [commentText, setCommentText] = useState('')
  const [commentLoading, setCommentLoading] = useState(false)
  const [selectedCoin, setSelectedCoin] = useState(100)
  const [coinLoading, setCoinLoading] = useState(false)
  const profile = post.profiles

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentProfile || !commentText.trim()) return
    setCommentLoading(true)
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('comments')
      .insert({ post_id: post.id, user_id: currentProfile.id, content: commentText.trim() })
      .select('*, profiles(*)')
      .single()
    setCommentLoading(false)
    if (!error && data) {
      setComments([...comments, data as CommentWithProfile])
      setCommentText('')
    }
  }

  const handleSendCoin = async () => {
    if (!currentProfile) { router.push('/login'); return }
    if (currentProfile.id === post.user_id) return
    if (currentProfile.coins < selectedCoin) { alert('コインが不足しています'); return }
    setCoinLoading(true)
    const res = await fetch('/api/coins/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId: post.id, toUserId: post.user_id, amount: selectedCoin }),
    })
    setCoinLoading(false)
    if (res.ok) {
      alert(`${selectedCoin.toLocaleString()}コイン送りました！`)
      router.refresh()
    } else {
      const err = await res.json()
      alert(err.error || 'エラーが発生しました')
    }
  }


  return (
    <div className="space-y-5">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors" style={{ color: '#5148E5' }}>
        <ArrowLeft size={15} />タイムラインへ戻る
      </Link>

      {/* Post */}
      <article className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start gap-3 mb-4">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-12 h-12 rounded-full ring-2 ring-gray-100" />
          ) : (
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ background: '#5148E5' }}>
              {(profile.display_name || profile.username).charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-gray-900">{profile.display_name || profile.username}</span>
              {profile.has_blue_badge && <BlueBadge size={16} />}
            </div>
            {profile.company_name && (
              <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                <Building2 size={11} />{profile.company_name}{profile.company_role && ` ・ ${profile.company_role}`}
              </div>
            )}
            <p className="text-xs text-gray-400 mt-0.5">
              {format(new Date(post.created_at), 'yyyy年M月d日 HH:mm', { locale: ja })}
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: '#EEF0FF', color: '#5148E5' }}>
            {post.category}
          </span>
        </div>

        <h1 className="text-xl font-black text-gray-900 mb-3">{post.title}</h1>
        <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{post.content}</p>

        <div className="mt-4 flex items-center gap-4 text-sm text-gray-400 pt-4 border-t border-gray-50">
          <span className="flex items-center gap-1"><MessageCircle size={15} />{comments.length}件のコメント</span>
          <CoinDisplay amount={post.coins_received} size="sm" />
        </div>
      </article>

      {/* Send Coin */}
      {currentProfile && currentProfile.id !== post.user_id && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-amber-50">
              <Coins size={16} className="text-amber-500" />
            </div>
            <h2 className="font-black text-gray-900">応援コインを送る</h2>
          </div>
          <p className="text-xs text-gray-400 mb-4">※現金化不可・シミュレーション用ポイント</p>

          <div className="flex gap-2 flex-wrap mb-4">
            {COIN_OPTIONS.map((amount) => (
              <button
                key={amount}
                onClick={() => setSelectedCoin(amount)}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                style={selectedCoin === amount
                  ? { background: '#F59E0B', color: '#fff' }
                  : { background: '#FFF8E1', color: '#92400E' }}
              >
                🪙 {amount.toLocaleString()}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">残高: <CoinDisplay amount={currentProfile.coins} size="sm" /></span>
            <button
              onClick={handleSendCoin}
              disabled={coinLoading || currentProfile.coins < selectedCoin}
              className="font-black text-sm px-5 py-2.5 rounded-xl transition-all hover:opacity-90 flex items-center gap-1.5 disabled:opacity-40"
              style={{ background: '#F59E0B', color: '#fff' }}
            >
              {coinLoading ? <Loader2 size={15} className="animate-spin" /> : <Coins size={15} />}
              {selectedCoin.toLocaleString()}コイン送る
            </button>
          </div>
        </div>
      )}

      {/* Comments */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle size={18} className="text-gray-400" />
          <h2 className="font-black text-gray-900">コメント</h2>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{comments.length}</span>
        </div>

        <div className="space-y-4 mb-4">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              {c.profiles.avatar_url ? (
                <img src={c.profiles.avatar_url} alt="" className="w-8 h-8 rounded-full flex-shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold" style={{ background: '#5148E5' }}>
                  {(c.profiles.display_name || c.profiles.username).charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 bg-gray-50 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-sm font-bold text-gray-900">{c.profiles.display_name || c.profiles.username}</span>
                  {c.profiles.has_blue_badge && <BlueBadge size={13} />}
                  <span className="text-xs text-gray-400 ml-auto">
                    {formatDistanceToNow(new Date(c.created_at), { addSuffix: true, locale: ja })}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{c.content}</p>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-4">まだコメントはありません</p>
          )}
        </div>

        {currentProfile ? (
          <form onSubmit={handleComment} className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="コメントを入力..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#5148E5' } as React.CSSProperties}
            />
            <button
              type="submit"
              disabled={commentLoading || !commentText.trim()}
              className="text-white px-4 py-2.5 rounded-xl transition-all hover:opacity-90 disabled:opacity-40"
              style={{ background: '#5148E5' }}
            >
              {commentLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </form>
        ) : (
          <Link href="/login" className="block text-center text-sm font-bold py-3 rounded-xl" style={{ color: '#5148E5', background: '#EEF0FF' }}>
            ログインしてコメントする
          </Link>
        )}
      </div>
    </div>
  )
}
