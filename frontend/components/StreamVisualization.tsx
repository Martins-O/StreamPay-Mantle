'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { formatTokenAmount } from '@/lib/utils'

interface StreamVisualizationProps {
  totalAmount: bigint
  ratePerSecond: bigint
  startTime: bigint
  duration: number
  isActive: boolean
}

export function StreamVisualization({
  totalAmount,
  ratePerSecond,
  startTime,
  duration,
  isActive
}: StreamVisualizationProps) {
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000))
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive])

  useEffect(() => {
    // Generate chart data points
    const points = []
    const startTimeNum = Number(startTime)
    const endTime = startTimeNum + duration
    const step = Math.max(duration / 50, 60) // At least 1 minute steps, max 50 points

    for (let time = startTimeNum; time <= endTime; time += step) {
      const elapsed = time - startTimeNum
      const streamedAmount = (Number(ratePerSecond) * elapsed) / 1e6 // Convert to human readable
      const isCurrent = time <= currentTime && time >= startTimeNum

      points.push({
        time: time,
        timeLabel: new Date(time * 1000).toLocaleTimeString(),
        amount: Math.min(streamedAmount, Number(totalAmount) / 1e6),
        isCurrent,
        isComplete: time >= endTime
      })
    }

    // Add current time point if stream is active
    if (isActive && currentTime >= startTimeNum && currentTime <= endTime) {
      const elapsed = currentTime - startTimeNum
      const currentAmount = (Number(ratePerSecond) * elapsed) / 1e6

      points.push({
        time: currentTime,
        timeLabel: 'Now',
        amount: Math.min(currentAmount, Number(totalAmount) / 1e6),
        isCurrent: true,
        isComplete: false
      })

      points.sort((a, b) => a.time - b.time)
    }

    setChartData(points)
  }, [totalAmount, ratePerSecond, startTime, duration, currentTime, isActive])

  const formatXAxis = (value: number) => {
    return new Date(value * 1000).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm text-gray-600">
            {new Date(label * 1000).toLocaleString()}
          </p>
          <p className="text-lg font-semibold text-blue-600">
            {payload[0].value.toFixed(6)} mUSDT
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Stream Flow Visualization</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Streamed</span>
          </div>
          {isActive && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Live</span>
            </div>
          )}
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="time"
              tickFormatter={formatXAxis}
              interval="preserveStartEnd"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${value.toFixed(2)}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <defs>
              <linearGradient id="streamGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#3B82F6"
              strokeWidth={3}
              fill="url(#streamGradient)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Stream Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {formatTokenAmount(totalAmount, 6)}
          </div>
          <div className="text-sm text-gray-500">Total Amount</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {formatTokenAmount(ratePerSecond, 6)}
          </div>
          <div className="text-sm text-gray-500">Per Second</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {Math.floor(duration / 3600)}h {Math.floor((duration % 3600) / 60)}m
          </div>
          <div className="text-sm text-gray-500">Duration</div>
        </div>
      </div>
    </div>
  )
}