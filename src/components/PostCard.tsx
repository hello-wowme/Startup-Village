'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import { useState } from 'react'
import type { PostWithProfile } from '@/types/database'
import { BlueBadge } from './BlueBadge'
import { MessageCircle, Sparkles, Building2 } from 'lucide-react'
import { DeletePostButton } from './DeletePostButton'
import { SupportButton } from './SupportButton'

interface PostCardProps {
  post: PostWithProfile
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  'IT・テクノロジー': { bg: '#EEF0FF', text: '#5148E5' },
  'フード・飲食':     { bg: '#FFF3E0', text: '#E65100' },
  'ヘルスケア':       { bg: '#E8F5E9', text: '#2E7D32' },
  'エンタメ':         { bg: '#FCE4EC', text: '#C2185B' },
  '教育':             { bg: '#E3F2FD', text: '#1565C0' },
  'FinTech':          { bg: '#F3E5F5', text: '#6A1B9A' },
  'EC・小売':         { bg: '#FFF8E1', text: '#F57F17' },
  'サービス業':       { bg: '#E0F7FA', text: '#00695C' },
  'ものづくり':       { bg: '#EFEBE9', text: '#4E342E' },
  'その他':           { bg: '#F5F5F5', text: '#616161' },
}

export function PostCard({ post }: PostCardProps) {
  const profile = post.profiles
  const catColor = CATEGORY_COLORS[post.category] ?? CATEGORY_COLORS['その他']
  const [coinsReceived, setCoinsReceived] = useState(post.coins_received)

  return (
    <Link href={`/post/${post.id}`} className="block group">
      <article className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-gray-200 hover:shadow-md transition-all duration-200">
        {/* Author row */}
        <div className="flex items-start gap-3 mb-3" onClick={e => e.stopPropagation()}>
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-10 h-10 rounded-full flex-shrink-0 ring-2 ring-gray-100" />
          ) : (
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm" style={{ background: '#5148E5' }}>
              {(profile.display_name || profile.username).charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-gray-900 text-sm">{profile.display_name || profile.username}</span>
              {profile.has_blue_badge && <BlueBadge size={15} />}
            </div>
            <div className="flex items-center gap-1">
              {profile.twitter_handle ? (
                <a
                  href={`https://x.com/${profile.twitter_handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="text-xs text-gray-400 hover:text-blue-500 hover:underline transition-colors"
                >
                  @{profile.twitter_handle}
                </a>
              ) : (
                <span className="text-gray-400 text-xs">@{profile.username}</span>
              )}
            </div>
            {profile.company_name && (
              <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                <Building2 size={11} />
                <span>{profile.company_name}</span>
                {profile.company_role && <span>・{profile.company_role}</span>}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span
              className="text-xs px-2.5 py-0.5 rounded-full font-medium"
              style={{ background: catColor.bg, color: catColor.text }}
            >
              {post.category}
            </span>
            <span className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ja })}
            </span>
            <DeletePostButton postId={post.id} postUserId={post.user_id} />
          </div>
        </div>

        {/* Content */}
        <h2 className="text-gray-900 font-bold text-base mb-1.5 group-hover:text-[#5148E5] transition-colors">{post.title}</h2>
        <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed">{post.content}</p>

        {/* AI Score */}
        {post.ai_score !== null && (
          <div className="mt-3 flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: '#EEF0FF' }}>
            <Sparkles size={14} style={{ color: '#5148E5' }} className="flex-shrink-0" />
            <span className="text-xs font-semibold" style={{ color: '#5148E5' }}>AI評価</span>
            <div className="flex-1 h-1.5 bg-white rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${post.ai_score}%`, background: 'linear-gradient(90deg, #5148E5, #818CF8)' }}
              />
            </div>
            <span className="text-xs font-black" style={{ color: '#5148E5' }}>{post.ai_score}点</span>
          </div>
        )}

        {/* Stats + Support */}
        <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <MessageCircle size={13} />
            {post.comments_count}件
          </span>
          {/* 応援コイン総額 */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl" style={{ background: '#FFFBEB' }}>
            <span className="text-sm">🪙</span>
            <span className="font-black text-sm" style={{ color: '#B45309' }}>
              {coinsReceived.toLocaleString()}
            </span>
            <span className="text-xs text-amber-500 font-medium">応援</span>
          </div>
          <div className="ml-auto">
            <SupportButton
              postId={post.id}
              postUserId={post.user_id}
              onCoinSent={(amount) => setCoinsReceived(prev => prev + amount)}
            />
          </div>
        </div>
      </article>
    </Link>
  )
}
