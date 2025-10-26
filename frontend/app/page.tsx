'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { WalletConnect } from '@/components/WalletConnect'
import { CreateStreamForm } from '@/components/CreateStreamForm'
import { StreamDashboard } from '@/components/StreamDashboard'

export default function Home() {
  const { address, isConnected } = useAccount()
  const [refreshKey, setRefreshKey] = useState(0)

  const handleStreamCreated = () => {
    setRefreshKey(prev => prev + 1)
  }

  if (!isConnected) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to StreamPay Mantle
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Real-time payment streaming on Mantle L2. Stream tokens continuously to any address.
          </p>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <WalletConnect />
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Real-time Streaming</h3>
              <p className="text-sm text-gray-600">Tokens flow continuously to recipients</p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Low Cost</h3>
              <p className="text-sm text-gray-600">Built on Mantle L2 for minimal fees</p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Programmable</h3>
              <p className="text-sm text-gray-600">Cancel anytime or claim whenever</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header with wallet info */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Manage your payment streams</p>
        </div>
        <WalletConnect />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Stream Form */}
        <div className="lg:col-span-1">
          <CreateStreamForm onSuccess={handleStreamCreated} />
        </div>

        {/* Stream Dashboard */}
        <div className="lg:col-span-2">
          <StreamDashboard key={refreshKey} />
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Getting Started</h3>
        <div className="text-blue-800 space-y-2">
          <p>1. Make sure you're connected to Mantle Testnet</p>
          <p>2. Get some test tokens from the mock USDT contract</p>
          <p>3. Approve the StreamManager contract to spend your tokens</p>
          <p>4. Create a stream by entering recipient address, amount, and duration</p>
          <p>5. Watch your tokens flow in real-time!</p>
        </div>
      </div>
    </div>
  )
}