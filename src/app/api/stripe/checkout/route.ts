import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getStripe, BLUE_BADGE_PRICE, BLUE_BADGE_COINS_BONUS } from '@/lib/stripe'
import type { Profile } from '@/types/database'

export async function POST(_req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any
    const { data: profileRaw } = await db.from('profiles').select('*').eq('id', user.id).single()
    const profile = profileRaw as Profile | null
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    if (profile.has_blue_badge) {
      return NextResponse.json({ error: 'すでにブルーバッジを取得済みです' }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const stripe = getStripe()
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'jpy',
            unit_amount: BLUE_BADGE_PRICE,
            product_data: {
              name: 'ブルーバッジ',
              description: `認証バッジ + ${BLUE_BADGE_COINS_BONUS.toLocaleString()}応援コイン付与`,
              images: [],
            },
          },
        },
      ],
      customer_email: user.email,
      metadata: {
        user_id: user.id,
        payment_type: 'blue_badge',
        coins_bonus: BLUE_BADGE_COINS_BONUS.toString(),
      },
      success_url: `${appUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/payment/cancel`,
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const svc = (await createServiceClient()) as any
    await svc.from('stripe_payments').insert({
      user_id: user.id,
      stripe_session_id: session.id,
      amount: BLUE_BADGE_PRICE,
      coins_granted: BLUE_BADGE_COINS_BONUS,
      payment_type: 'blue_badge',
      status: 'pending',
    })

    return NextResponse.json({ url: session.url })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
