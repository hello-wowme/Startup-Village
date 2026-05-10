import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileClient } from './ProfileClient'
import type { PostWithProfile } from '@/types/database'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const [{ data: profile }, { data: posts }] = await Promise.all([
    db.from('profiles').select('*').eq('id', session.user.id).single(),
    db.from('posts').select('*, profiles(*)').eq('user_id', session.user.id).order('created_at', { ascending: false }).limit(10),
  ])

  if (!profile) redirect('/login')

  return <ProfileClient profile={profile} posts={(posts ?? []) as PostWithProfile[]} />
}
