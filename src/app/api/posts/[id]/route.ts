import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '未認証' }, { status: 401 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: post } = await (supabase as any).from('posts').select('user_id').eq('id', id).single()
  if (!post) return NextResponse.json({ error: '投稿が見つかりません' }, { status: 404 })
  if (post.user_id !== user.id) return NextResponse.json({ error: '権限がありません' }, { status: 403 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from('posts').delete().eq('id', id)
  return NextResponse.json({ ok: true })
}
