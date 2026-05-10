import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileClient } from './ProfileClient'
import type { PostWithProfile } from '@/types/database'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('profiles').select('*').eq('id', user.id).single()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: posts } = await (supabase as any)
    .from('posts').select('*, profiles(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  return <ProfileClient profile={profile} posts={(posts ?? []) as PostWithProfile[]} />
}
