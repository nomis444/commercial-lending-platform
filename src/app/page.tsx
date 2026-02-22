import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#282929] to-[#404142]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,107,53,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(139,92,246,0.1),transparent_50%)]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Revenue Advances
              <span className="block text-electric-500 italic" style={{ fontStyle: 'italic', transform: 'skewX(-10deg)' }}>
                Built for Speed
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
              Get the funding your business needs in hours, not weeks. No collateral. No complexity. Just fast, transparent capital.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/apply"
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all transform hover:scale-105 shadow-lg"
              >
                Get Funded Now
              </Link>
              <a 
                href="#products"
                className="bg-charcoal-800 hover:bg-charcoal-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all border border-gray-700"
              >
                View Products
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-charcoal-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-charcoal-700/50 p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-electric-500 mb-2">$5K - $200K</div>
              <div className="text-gray-400">Funding Range</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-500 mb-2">Same Day</div>
              <div className="text-gray-400">Funding Available</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-500 mb-2">25% APR</div>
              <div className="text-gray-400">Starting Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Choose Your Funding
          </h2>
          <p className="text-xl text-gray-400">
            Flexible options designed for businesses at every stage
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Instant Revenue Advance */}
          <div className="bg-charcoal-800/60 backdrop-blur-sm rounded-2xl border-2 border-charcoal-700 hover:border-electric-500 transition-all duration-300 overflow-hidden group shadow-xl hover:shadow-2xl hover:shadow-electric-500/20 transform hover:-translate-y-1">
            <div className="h-2 bg-gradient-to-r from-electric-500 to-electric-600"></div>
            <div className="p-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-electric-500/10 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-electric-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Instant</h3>
                <div className="text-4xl font-bold text-electric-500 mb-2">$5K - $8K</div>
                <p className="text-gray-400">Lightning-fast approval</p>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-start text-gray-300">
                  <svg className="w-5 h-5 text-electric-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Instant approval decision</span>
                </div>
                <div className="flex items-start text-gray-300">
                  <svg className="w-5 h-5 text-electric-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Minimal documentation</span>
                </div>
                <div className="flex items-start text-gray-300">
                  <svg className="w-5 h-5 text-electric-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Same-day funding</span>
                </div>
                <div className="flex items-start text-gray-300">
                  <svg className="w-5 h-5 text-electric-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>No collateral required</span>
                </div>
                <div className="flex items-start text-gray-300">
                  <svg className="w-5 h-5 text-electric-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Starting at 25% APR</span>
                </div>
              </div>

              <Link 
                href="/apply?product=instant"
                className="block w-full bg-electric-500 hover:bg-electric-600 text-white font-bold py-3 px-6 rounded-lg text-center transition-colors"
              >
                Apply Now
              </Link>
            </div>
          </div>

          {/* Standard Revenue Advance - MOST POPULAR */}
          <div className="bg-charcoal-800/60 backdrop-blur-sm rounded-2xl border-2 border-orange-500 hover:border-orange-400 transition-all duration-300 overflow-hidden group relative transform md:scale-105 shadow-2xl hover:shadow-orange-500/30 hover:-translate-y-1">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-1.5 rounded-full text-sm font-bold shadow-lg">
                MOST POPULAR
              </span>
            </div>
            <div className="h-2 bg-gradient-to-r from-orange-500 to-orange-600"></div>
            <div className="p-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500/10 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Standard</h3>
                <div className="text-4xl font-bold text-orange-500 mb-2">$10K - $50K</div>
                <p className="text-gray-400">Perfect for growing businesses</p>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-start text-gray-300">
                  <svg className="w-5 h-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Same-day to 48-hour funding</span>
                </div>
                <div className="flex items-start text-gray-300">
                  <svg className="w-5 h-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Competitive rates</span>
                </div>
                <div className="flex items-start text-gray-300">
                  <svg className="w-5 h-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Flexible repayment terms</span>
                </div>
                <div className="flex items-start text-gray-300">
                  <svg className="w-5 h-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Full application review</span>
                </div>
                <div className="flex items-start text-gray-300">
                  <svg className="w-5 h-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Starting at 25% APR</span>
                </div>
              </div>

              <Link 
                href="/apply?product=standard"
                className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg text-center transition-colors"
              >
                Apply Now
              </Link>
            </div>
          </div>

          {/* Premium Revenue Advance */}
          <div className="bg-charcoal-800/60 backdrop-blur-sm rounded-2xl border-2 border-charcoal-700 hover:border-purple-500 transition-all duration-300 overflow-hidden group shadow-xl hover:shadow-2xl hover:shadow-purple-500/20 transform hover:-translate-y-1">
            <div className="h-2 bg-gradient-to-r from-purple-500 to-purple-600"></div>
            <div className="p-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/10 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Premium</h3>
                <div className="text-4xl font-bold text-purple-500 mb-2">$55K - $200K</div>
                <p className="text-gray-400">For established enterprises</p>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-start text-gray-300">
                  <svg className="w-5 h-5 text-purple-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Same-day to 48-hour funding</span>
                </div>
                <div className="flex items-start text-gray-300">
                  <svg className="w-5 h-5 text-purple-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Largest funding amounts</span>
                </div>
                <div className="flex items-start text-gray-300">
                  <svg className="w-5 h-5 text-purple-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Extended repayment options</span>
                </div>
                <div className="flex items-start text-gray-300">
                  <svg className="w-5 h-5 text-purple-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Dedicated account manager</span>
                </div>
                <div className="flex items-start text-gray-300">
                  <svg className="w-5 h-5 text-purple-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Starting at 25% APR</span>
                </div>
              </div>

              <Link 
                href="/apply?product=premium"
                className="block w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg text-center transition-colors"
              >
                Apply Now
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Choose MidPoint Access
            </h2>
            <p className="text-xl text-gray-400">
              Fast, transparent, and built for modern businesses
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-charcoal-900/50 backdrop-blur-sm rounded-xl p-8 border border-charcoal-700/50 hover:border-orange-500 transition-all shadow-lg hover:shadow-xl hover:shadow-orange-500/10 transform hover:-translate-y-1">
              <div className="w-14 h-14 bg-orange-500/10 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Lightning Fast
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Get approved in minutes and funded the same day. No waiting weeks for traditional bank approvals.
              </p>
            </div>

            <div className="bg-charcoal-900/50 backdrop-blur-sm rounded-xl p-8 border border-charcoal-700/50 hover:border-electric-500 transition-all shadow-lg hover:shadow-xl hover:shadow-electric-500/10 transform hover:-translate-y-1">
              <div className="w-14 h-14 bg-electric-500/10 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-electric-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Fully Transparent
              </h3>
              <p className="text-gray-400 leading-relaxed">
                No hidden fees or surprises. See exactly what you'll pay before you commit with our upfront pricing.
              </p>
            </div>

            <div className="bg-charcoal-900/50 backdrop-blur-sm rounded-xl p-8 border border-charcoal-700/50 hover:border-purple-500 transition-all shadow-lg hover:shadow-xl hover:shadow-purple-500/10 transform hover:-translate-y-1">
              <div className="w-14 h-14 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Simple & Secure
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Bank-level security with a simple application process. Track everything in real-time from your dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-orange-500 to-purple-500 rounded-2xl p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-20"></div>
          <div className="relative">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of businesses that have accelerated their growth with MidPoint Access
            </p>
            <Link 
              href="/apply"
              className="inline-block bg-white text-orange-600 hover:bg-gray-100 font-bold py-4 px-10 rounded-lg text-xl transition-all transform hover:scale-105 shadow-xl"
            >
              Apply in Minutes
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
