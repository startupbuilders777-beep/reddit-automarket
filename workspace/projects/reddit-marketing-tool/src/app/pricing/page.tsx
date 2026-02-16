'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, X } from 'lucide-react'

type PricingTier = {
  name: string
  price: string
  description: string
  features: string[]
  excludedFeatures: string[]
  priceId: string | null
  cta: string
  popular?: boolean
}

const pricingTiers: PricingTier[] = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for testing and small campaigns',
    features: [
      '1 Reddit Account',
      '1 Campaign',
      '50 comments/month',
      'Basic analytics',
      'Community support',
    ],
    excludedFeatures: [
      'AI comment generation',
      'Advanced templates',
      'Priority support',
      'White-label',
    ],
    priceId: null,
    cta: 'Get Started Free',
  },
  {
    name: 'Pro',
    price: '$79',
    description: 'Best for growing businesses',
    features: [
      '5 Reddit Accounts',
      'Unlimited Campaigns',
      '2,500 comments/month',
      'Advanced analytics',
      'AI comment generation',
      'Custom templates',
      'Priority email support',
    ],
    excludedFeatures: [
      'White-label',
    ],
    priceId: 'price_pro_monthly',
    cta: 'Start Pro Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '$199',
    description: 'For agencies and large teams',
    features: [
      'Unlimited Reddit Accounts',
      'Unlimited Campaigns',
      'Unlimited comments',
      'White-label solution',
      'Dedicated account manager',
      'Custom integrations',
      '24/7 phone support',
      'SLA guarantee',
    ],
    excludedFeatures: [],
    priceId: 'price_enterprise_monthly',
    cta: 'Contact Sales',
  },
]

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)

  const handleCheckout = async (priceId: string) => {
    setLoading(priceId)
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        console.error('No checkout URL returned')
        alert('Failed to create checkout session. Please try again.')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-reddit">
              RedditAutoMarket
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/#features" className="text-gray-600 hover:text-gray-900">
                Features
              </Link>
              <Link href="/pricing" className="text-gray-900 font-medium">
                Pricing
              </Link>
              <Link 
                href="/api/auth/signin" 
                className="bg-reddit hover:bg-redditDark text-white px-4 py-2 rounded-lg font-medium transition"
              >
                Sign In
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-gray-900 to-gray-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Choose the plan that fits your needs. Upgrade or downgrade anytime.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 -mt-10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`bg-white rounded-2xl shadow-lg ${
                  tier.popular ? 'ring-2 ring-reddit scale-105 z-10' : 'border border-gray-200'
                }`}
              >
                {tier.popular && (
                  <div className="bg-reddit text-white text-center py-2 rounded-t-2xl font-medium">
                    Most Popular
                  </div>
                )}
                <div className="p-8">
                  <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                  <p className="text-gray-500 text-sm mb-4">{tier.description}</p>
                  
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    {tier.price !== '$0' && (
                      <span className="text-gray-500">/month</span>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                    {tier.excludedFeatures.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <X className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-400">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {tier.priceId ? (
                    <button
                      onClick={() => handleCheckout(tier.priceId!)}
                      disabled={loading === tier.priceId}
                      className={`w-full py-3 rounded-lg font-semibold transition ${
                        tier.popular
                          ? 'bg-reddit hover:bg-redditDark text-white'
                          : 'bg-gray-900 hover:bg-gray-800 text-white'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {loading === tier.priceId ? 'Processing...' : tier.cta}
                    </button>
                  ) : (
                    <Link
                      href="/api/auth/signin"
                      className={`block w-full text-center py-3 rounded-lg font-semibold transition ${
                        tier.popular
                          ? 'bg-reddit hover:bg-redditDark text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                      }`}
                    >
                      {tier.cta}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <FAQItem
              question="Can I cancel my subscription anytime?"
              answer="Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period."
            />
            <FAQItem
              question="What payment methods do you accept?"
              answer="We accept all major credit cards (Visa, Mastercard, American Express) through our secure payment processor, Stripe."
            />
            <FAQItem
              question="Is there a free trial?"
              answer="Yes! Our Free plan lets you test the platform with limited features. Pro plans come with a 14-day free trial."
            />
            <FAQItem
              question="What happens if I exceed my comment limit?"
              answer="You'll be notified when you approach your limit. You can upgrade your plan or wait until the next billing cycle."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="container mx-auto px-4 text-center">
          <p>© 2026 RedditAutoMarket. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="border-b border-gray-200 pb-6">
      <h3 className="text-lg font-semibold mb-2">{question}</h3>
      <p className="text-gray-600">{answer}</p>
    </div>
  )
}
