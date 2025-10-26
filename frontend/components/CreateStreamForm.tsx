'use client'

import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseTokenAmount } from '@/lib/utils'
import { CONTRACTS, STREAM_MANAGER_ABI } from '@/lib/contracts'

interface CreateStreamFormProps {
  onSuccess?: () => void
}

export function CreateStreamForm({ onSuccess }: CreateStreamFormProps) {
  const { address } = useAccount()
  const [formData, setFormData] = useState({
    recipient: '',
    amount: '',
    duration: '',
    durationType: 'hours' as 'hours' | 'days' | 'minutes'
  })

  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!address) return

    try {
      const durationInSeconds = calculateDurationInSeconds(
        parseInt(formData.duration),
        formData.durationType
      )

      writeContract({
        abi: STREAM_MANAGER_ABI,
        address: CONTRACTS.STREAM_MANAGER,
        functionName: 'createStream',
        args: [
          formData.recipient as `0x${string}`,
          CONTRACTS.MOCK_USDT,
          parseTokenAmount(formData.amount, 6),
          BigInt(durationInSeconds)
        ],
      })

      if (onSuccess) {
        onSuccess()
      }

      // Reset form
      setFormData({
        recipient: '',
        amount: '',
        duration: '',
        durationType: 'hours'
      })
    } catch (error) {
      console.error('Error creating stream:', error)
    }
  }

  const calculateDurationInSeconds = (value: number, type: string): number => {
    switch (type) {
      case 'minutes': return value * 60
      case 'hours': return value * 3600
      case 'days': return value * 86400
      default: return value * 3600
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Create New Stream</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recipient Address
          </label>
          <input
            type="text"
            value={formData.recipient}
            onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
            placeholder="0x..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Amount (mUSDT)
          </label>
          <input
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="1000"
            step="0.000001"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stream Duration
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="24"
              min="1"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <select
              value={formData.durationType}
              onChange={(e) => setFormData({ ...formData, durationType: e.target.value as any })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="minutes">Minutes</option>
              <option value="hours">Hours</option>
              <option value="days">Days</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending || isConfirming || !address}
          className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
        >
          {isPending || isConfirming ? 'Creating Stream...' : 'Create Stream'}
        </button>
      </form>

      {hash && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            Transaction submitted! Hash: {hash.slice(0, 10)}...
          </p>
        </div>
      )}
    </div>
  )
}