import { createClient } from '@/lib/supabase/server'
import { PostDetail } from '@/components/PostDetail'
import { notFound } from 'next/navigation'
import type { PostWithProfile, CommentWithProfile } from '@/types/database'

export const dynamic = 'force-dynamic'

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data: post } = await db.from('posts').select('*, profiles(*)').eq('id', id).single()
  if (!post) notFound()

  const { data: comments } = await db.from('comments').select('*, profiles(*)').eq('post_id', id).order('created_at', { ascending: true })

  const { data: { user } } = await supabase.auth.getUser()
  let currentProfile = null
  if (user) {
    const { data } = await db.from('profiles').select('*').eq('id', user.id).single()
    currentProfile = data
  }

  return (
    <div>
      <PostDetail
        post={post as PostWithProfile}
        comments={(comments ?? []) as CommentWithProfile[]}
        currentProfile={currentProfile}
      />
    </div>
  )
}
