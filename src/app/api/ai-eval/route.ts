import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { evaluateBusiness } from '@/lib/anthropic'

export async function POST(req: NextRequest) {
  try {
    const { postId } = await req.json()
    if (!postId) return NextResponse.json({ error: 'postId required' }, { status: 400 })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: postRaw } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single()
    if (!postRaw) return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    const post = postRaw as import('@/types/database').Post

    if (post.ai_score !== null) {
      return NextResponse.json({ score: post.ai_score, feedback: post.ai_feedback })
    }

    const { score, feedback } = await evaluateBusiness(post.title, post.content)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('posts') as any).update({
      ai_score: score,
      ai_feedback: feedback,
      ai_evaluated_at: new Date().toISOString(),
    }).eq('id', postId)

    return NextResponse.json({ score, feedback })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
