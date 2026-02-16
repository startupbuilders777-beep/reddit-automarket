import Link from 'next/link'
import { MessageSquare, TrendingUp, Zap, BarChart3 } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-900 to-gray-800 text-white py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Automate Your Reddit Marketing
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            AI-powered tool that finds relevant posts and generates contextual comments 
            to grow your app's visibility. Save 20+ hours/week.
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/pricing" 
              className="bg-reddit hover:bg-redditDark text-white px-8 py-3 rounded-lg font-semibold transition"
            >
              View Pricing
            </Link>
            <Link 
              href="#features" 
              className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold transition"
            >
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<MessageSquare className="w-8 h-8" />}
              title="Find Posts"
              description="Automatically search Reddit for posts matching your keywords and target subreddits."
            />
            <FeatureCard 
              icon={<Zap className="w-8 h-8" />}
              title="Generate Comments"
              description="AI creates contextual, helpful comments that don't feel like spam."
            />
            <FeatureCard 
              icon={<TrendingUp className="w-8 h-8" />}
              title="Post Automatically"
              description="Schedule and post comments while respecting Reddit's rate limits."
            />
            <FeatureCard 
              icon={<BarChart3 className="w-8 h-8" />}
              title="Track Results"
              description="Monitor engagement, upvotes, and conversions from your campaigns."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Automate Your Reddit Marketing?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of marketers saving 20+ hours per week with AI-powered Reddit automation.
          </p>
          <Link 
            href="/pricing" 
            className="bg-reddit hover:bg-redditDark text-white px-8 py-3 rounded-lg font-semibold transition inline-block"
          >
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="container mx-auto px-4 text-center">
          <p>© 2026 RedditAutoMarket. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
      <div className="text-reddit mb-4 flex justify-center">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
