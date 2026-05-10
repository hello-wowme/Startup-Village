import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CompanyClient } from './CompanyClient'

export const dynamic = 'force-dynamic'

export default async function CompanyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('profiles').select('*').eq('id', user.id).single()

  return <CompanyClient profile={profile} />
}
