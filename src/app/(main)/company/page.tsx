import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CompanyClient } from './CompanyClient'

export const dynamic = 'force-dynamic'

export default async function CompanyPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('profiles').select('*').eq('id', session.user.id).single()

  if (!profile) redirect('/login')

  return <CompanyClient profile={profile} />
}
