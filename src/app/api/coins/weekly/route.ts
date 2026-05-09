import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { startOfWeek } from 'date-fns'
import type { Profile } from '@/types/database'

const WEEKLY_BONUS = 10000

export async function POST(_req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString().split('T')[0]

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const svc = (await createServiceClient()) as any

    const { data: existing } = await svc
      .from('weekly_coin_grants')
      .select('id')
      .eq('user_id', user.id)
      .eq('week_start', weekStart)
      .single()

    if (existing) {
      return NextResponse.json({ error: '今週はすでに受け取り済みです', alreadyGranted: true }, { status: 400 })
    }

    const { data: profileRaw } = await svc.from('profiles').select('coins').eq('id', user.id).single()
    const profile = profileRaw as Pick<Profile, 'coins'> | null
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    await svc.from('profiles').update({ coins: profile.coins + WEEKLY_BONUS }).eq('id', user.id)
    await svc.from('weekly_coin_grants').insert({ user_id: user.id, week_start: weekStart })
    await svc.from('coin_transactions').insert({
      from_user_id: null,
      to_user_id: user.id,
      amount: WEEKLY_BONUS,
      transaction_type: 'weekly_bonus',
      note: `週次ボーナス (${weekStart})`,
    })

    return NextResponse.json({ ok: true, amount: WEEKLY_BONUS })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
