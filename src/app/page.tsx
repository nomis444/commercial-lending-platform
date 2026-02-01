import Link from 'next/link'

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Commercial Lending Made Simple
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Connect borrowers with investors through our transparent, easy-to-use platform. 
          Experience the future of commercial lending with real-time tracking and streamlined processes.
        </p>
        <div className="space-x-4">
          <Link 
            href="/apply"
            className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-lg text-lg inline-block"
          >
            Apply for a Loan
          </Link>
          <Link 
            href="/signup"
            className="border border-primary-600 text-primary-600 hover:bg-primary-50 font-bold py-3 px-8 rounded-lg text-lg inline-block"
          >
            Become an Investor
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            For Borrowers
          </h3>
          <p className="text-gray-600">
            Simple application process with transparent terms and real-time tracking
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            For Investors
          </h3>
          <p className="text-gray-600">
            Access vetted loan opportunities with detailed performance analytics
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Transparency
          </h3>
          <p className="text-gray-600">
            Full visibility into the lending process from application to funding
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Technology
          </h3>
          <p className="text-gray-600">
            Modern platform built for speed, security, and scalability
          </p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 rounded-lg p-8 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">
          Ready to Get Started?
        </h2>
        <p className="text-xl mb-6 opacity-90">
          Join thousands of borrowers and investors who trust our platform
        </p>
        <Link 
          href="/apply"
          className="bg-white text-primary-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg text-lg inline-block"
        >
          Start Your Application
        </Link>
      </div>
    </div>
  )
}