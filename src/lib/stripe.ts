import Stripe from 'stripe'

export function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-04-22.dahlia',
  })
}

export const BLUE_BADGE_PRICE = 980 // 円
export const BLUE_BADGE_COINS_BONUS = 50000
