import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // 新規ユーザーのprofileをSupabaseに保存（既存は無視）
        const svc = await createServiceClient()
        const meta = user.user_metadata
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (svc as any).from('profiles').upsert({
          id: user.id,
          username: meta.user_name || meta.preferred_username || `user_${user.id.slice(0, 8)}`,
          display_name: meta.full_name || meta.name || null,
          avatar_url: meta.avatar_url || meta.picture || null,
          twitter_handle: meta.user_name || null,
          coins: 10000,
        }, { onConflict: 'id', ignoreDuplicates: true })
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
