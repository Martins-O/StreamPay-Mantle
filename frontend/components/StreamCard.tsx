'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useStreamData } from '@/hooks/useStreamData'
import { formatTokenAmount, formatAddress, calculateStreamedAmount, timeUntilNextSecond } from '@/lib/utils'
import { CONTRACTS, STREAM_MANAGER_ABI } from '@/lib/contracts'

interface StreamCardProps {
  streamId: bigint
  type: 'sender' | 'recipient'
  onUpdate?: () => void
}

export function StreamCard({ streamId, type, onUpdate }: StreamCardProps) {
  const { address } = useAccount()
  const { stream, streamableAmount, refetchAmount } = useStreamData(streamId)
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000))
  const [animatedAmount, setAnimatedAmount] = useState('0.000000')

  const { writeContract: claim, data: claimHash, isPending: claimPending } = useWriteContract()
  const { writeContract: cancel, data: cancelHash, isPending: cancelPending } = useWriteContract()

  const { isLoading: claimConfirming } = useWaitForTransactionReceipt({ hash: claimHash })
  const { isLoading: cancelConfirming } = useWaitForTransactionReceipt({ hash: cancelHash })

  // Real-time updates
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(Math.floor(Date.now() / 1000))
      refetchAmount()
    }

    // Initial update
    updateTime()

    // Set up interval that syncs with the next second
    const timeToNextSecond = timeUntilNextSecond()
    const timeout = setTimeout(() => {
      updateTime()
      const interval = setInterval(updateTime, 1000)
      return () => clearInterval(interval)
    }, timeToNextSecond)

    return () => clearTimeout(timeout)
  }, [refetchAmount])

  // Animate the streamable amount
  useEffect(() => {
    if (stream && streamableAmount !== undefined) {
      const currentStreamableAmount = formatTokenAmount(streamableAmount, 6)

      // Calculate real-time amount based on current time
      const realTimeAmount = calculateStreamedAmount(
        stream.totalAmount,
        stream.startTime,
        BigInt(Number(stream.totalAmount) / Number(stream.ratePerSecond)),
        currentTime
      )

      const claimedAmount = stream.totalAmount - streamableAmount
      const totalStreamedAmount = realTimeAmount - claimedAmount

      if (totalStreamedAmount > 0) {
        setAnimatedAmount(formatTokenAmount(totalStreamedAmount, 6))
      } else {
        setAnimatedAmount(currentStreamableAmount)
      }
    }
  }, [stream, streamableAmount, currentTime])

  const handleClaim = async () => {
    if (!address || !stream || type !== 'recipient') return

    try {
      claim({
        abi: STREAM_MANAGER_ABI,
        address: CONTRACTS.STREAM_MANAGER,
        functionName: 'claim',
        args: [streamId],
      })

      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('Error claiming stream:', error)
    }
  }

  const handleCancel = async () => {
    if (!address || !stream || type !== 'sender') return

    try {
      cancel({
        abi: STREAM_MANAGER_ABI,
        address: CONTRACTS.STREAM_MANAGER,
        functionName: 'cancelStream',
        args: [streamId],
      })

      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('Error canceling stream:', error)
    }
  }

  if (!stream) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
      </div>
    )
  }

  const progress = stream.startTime && stream.ratePerSecond
    ? Math.min((currentTime - Number(stream.startTime)) / (Number(stream.totalAmount) / Number(stream.ratePerSecond)), 1)
    : 0

  const isActive = stream.isActive
  const canClaim = type === 'recipient' && streamableAmount && streamableAmount > 0n
  const canCancel = type === 'sender' && isActive

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Stream #{streamId.toString()}
          </h3>
          <p className="text-sm text-gray-500">
            {type === 'sender' ? 'To' : 'From'}: {formatAddress(
              type === 'sender' ? stream.recipient : stream.sender
            )}
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          isActive
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {isActive ? 'Active' : 'Completed'}
        </div>
      </div>

      {/* Animated Amount Display */}
      <div className="mb-6">
        <div className="text-3xl font-bold text-blue-600 mb-2 font-mono">
          {animatedAmount} <span className="text-lg text-gray-500">mUSDT</span>
        </div>
        <div className="text-sm text-gray-500">
          Total: {formatTokenAmount(stream.totalAmount, 6)} mUSDT
        </div>
      </div>

      {/* Progress Bar with Animation */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Progress</span>
          <span>{Math.round(progress * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000 ease-out relative"
            style={{ width: `${Math.max(progress * 100, 0)}%` }}
          >
            {/* Flowing animation */}
            {isActive && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 stream-animation"></div>
            )}
          </div>
        </div>
      </div>

      {/* Stream Rate */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600">
          <span className="font-medium">Rate:</span> {formatTokenAmount(stream.ratePerSecond, 6)} mUSDT/second
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        {canClaim && (
          <button
            onClick={handleClaim}
            disabled={claimPending || claimConfirming}
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
          >
            {claimPending || claimConfirming ? 'Claiming...' : 'Claim'}
          </button>
        )}

        {canCancel && (
          <button
            onClick={handleCancel}
            disabled={cancelPending || cancelConfirming}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
          >
            {cancelPending || cancelConfirming ? 'Canceling...' : 'Cancel'}
          </button>
        )}
      </div>

      {/* Transaction Status */}
      {(claimHash || cancelHash) && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            Transaction submitted! Hash: {(claimHash || cancelHash)?.slice(0, 10)}...
          </p>
        </div>
      )}
    </div>
  )
}