import { NextRequest, NextResponse } from 'next/server'
import { getStripe, BLUE_BADGE_COINS_BONUS } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/server'
import Stripe from 'stripe'
import type { Profile } from '@/types/database'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  const stripe = getStripe()
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (e) {
    console.error('Webhook signature failed:', e)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.user_id
    const paymentType = session.metadata?.payment_type

    if (!userId) return NextResponse.json({ ok: true })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const svc = (await createServiceClient()) as any

    if (paymentType === 'blue_badge') {
      const { data: profileRaw } = await svc.from('profiles').select('coins').eq('id', userId).single()
      const profile = profileRaw as Pick<Profile, 'coins'> | null
      if (profile) {
        await svc.from('profiles').update({
          has_blue_badge: true,
          coins: profile.coins + BLUE_BADGE_COINS_BONUS,
        }).eq('id', userId)

        await svc.from('coin_transactions').insert({
          from_user_id: null,
          to_user_id: userId,
          amount: BLUE_BADGE_COINS_BONUS,
          transaction_type: 'purchase_bonus',
          note: 'ブルーバッジ購入ボーナス',
        })
      }

      await svc.from('stripe_payments')
        .update({ status: 'completed', stripe_payment_intent_id: session.payment_intent as string })
        .eq('stripe_session_id', session.id)
    }
  }

  return NextResponse.json({ ok: true })
}
