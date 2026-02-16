import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export default function PricingSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center p-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">Welcome to RedditAutoMarket!</h1>
        <p className="text-gray-600 mb-8 max-w-md">
          Your subscription has been activated successfully. You can now start automating your Reddit marketing campaigns.
        </p>
        <div className="flex gap-4 justify-center">
          <Link 
            href="/dashboard" 
            className="bg-reddit hover:bg-redditDark text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            Go to Dashboard
          </Link>
          <Link 
            href="/dashboard/campaigns" 
            className="bg-gray-200 hover:bg-gray-300 text-gray-900 px-6 py-3 rounded-lg font-semibold transition"
          >
            Create Your First Campaign
          </Link>
        </div>
      </div>
    </div>
  )
}
