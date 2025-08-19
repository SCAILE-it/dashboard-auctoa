"use client"

import { Suspense } from 'react'

// Simple loading fallback for analytics state
function AnalyticsStateLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
      <div className="h-8 bg-gray-100 rounded w-48"></div>
    </div>
  )
}

/**
 * Wrapper component to provide Suspense boundary for useSearchParams
 */
export function AnalyticsStateProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<AnalyticsStateLoading />}>
      {children}
    </Suspense>
  )
}
