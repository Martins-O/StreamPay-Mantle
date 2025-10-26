'use client'

import { useState, useEffect } from 'react'
import { useUserStreams } from '@/hooks/useStreamData'
import { StreamCard } from './StreamCard'

export function StreamDashboard() {
  const { senderStreams, recipientStreams, isLoading } = useUserStreams()
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('sent')
  const [refreshKey, setRefreshKey] = useState(0)

  const handleStreamUpdate = () => {
    setRefreshKey(prev => prev + 1)
  }

  const currentStreams = activeTab === 'sent' ? senderStreams : recipientStreams

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          <button
            onClick={() => setActiveTab('sent')}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'sent'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Sent Streams ({senderStreams.length})
          </button>
          <button
            onClick={() => setActiveTab('received')}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'received'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Received Streams ({recipientStreams.length})
          </button>
        </nav>
      </div>

      {/* Stream Grid */}
      <div className="p-6">
        {currentStreams.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {activeTab === 'sent' ? 'sent' : 'received'} streams
            </h3>
            <p className="text-gray-500">
              {activeTab === 'sent'
                ? 'Create your first stream to get started'
                : 'You will see streams sent to you here'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {currentStreams.map((streamId) => (
              <StreamCard
                key={`${streamId}-${refreshKey}`}
                streamId={streamId}
                type={activeTab === 'sent' ? 'sender' : 'recipient'}
                onUpdate={handleStreamUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}