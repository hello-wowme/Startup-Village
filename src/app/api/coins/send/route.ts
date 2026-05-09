import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import type { Profile, Post } from '@/types/database'

export async function POST(req: NextRequest) {
  try {
    const { postId, toUserId, amount } = await req.json()
    if (!postId || !toUserId || !amount || amount <= 0) {
      return NextResponse.json({ error: '不正なリクエストです' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
    if (user.id === toUserId) return NextResponse.json({ error: '自分の投稿には送れません' }, { status: 400 })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any
    const { data: fromProfileRaw } = await db.from('profiles').select('coins').eq('id', user.id).single()
    const fromProfile = fromProfileRaw as Pick<Profile, 'coins'> | null
    if (!fromProfile || fromProfile.coins < amount) {
      return NextResponse.json({ error: 'コインが不足しています' }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const svc = (await createServiceClient()) as any

    await svc.from('profiles').update({ coins: fromProfile.coins - amount }).eq('id', user.id)

    const { data: toProfileRaw } = await svc.from('profiles').select('coins, total_coins_received').eq('id', toUserId).single()
    const toProfile = toProfileRaw as Pick<Profile, 'coins' | 'total_coins_received'> | null
    if (toProfile) {
      await svc.from('profiles').update({
        coins: toProfile.coins + amount,
        total_coins_received: toProfile.total_coins_received + amount,
      }).eq('id', toUserId)
    }

    const { data: postRaw } = await svc.from('posts').select('coins_received').eq('id', postId).single()
    const post = postRaw as Pick<Post, 'coins_received'> | null
    if (post) {
      await svc.from('posts').update({ coins_received: post.coins_received + amount }).eq('id', postId)
    }

    await svc.from('coin_transactions').insert({
      from_user_id: user.id,
      to_user_id: toUserId,
      post_id: postId,
      amount,
      transaction_type: 'send',
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
