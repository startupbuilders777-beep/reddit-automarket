import { NextResponse } from 'next/server'
import Stripe from 'stripe'

// Initialize Stripe with secret key (use env var in production)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-12-18.acacia',
})

// Price IDs mapping - in production, these would come from your Stripe dashboard
const PRICE_IDS: Record<string, string> = {
  'price_pro_monthly': process.env.STRIPE_PRO_PRICE_ID || 'price_pro_placeholder',
  'price_enterprise_monthly': process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise_placeholder',
}

// Success and cancel URLs
const SUCCESS_URL = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing/success?session_id={CHECKOUT_SESSION_ID}`
const CANCEL_URL = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing`

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { priceId } = body

    // Validate price ID
    if (!priceId || !PRICE_IDS[priceId]) {
      return NextResponse.json(
        { error: 'Invalid price ID' },
        { status: 400 }
      )
    }

    // Check if Stripe is properly configured
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey || stripeSecretKey === 'sk_test_placeholder') {
      // Development mode - return a mock URL or redirect for demo
      console.warn('Stripe not configured - running in demo mode')
      
      // For demo purposes, return a mock success
      return NextResponse.json({
        url: `${SUCCESS_URL.replace('?session_id={CHECKOUT_SESSION_ID}', '')}?demo=true&price=${priceId}`,
        demo: true,
      })
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: PRICE_IDS[priceId],
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: SUCCESS_URL,
      cancel_url: CANCEL_URL,
      allow_promotion_codes: true,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    
    // Return a user-friendly error
    return NextResponse.json(
      { error: 'Failed to create checkout session. Please try again.' },
      { status: 500 }
    )
  }
}
