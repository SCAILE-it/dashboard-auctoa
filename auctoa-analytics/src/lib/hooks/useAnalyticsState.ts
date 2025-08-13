"use client"

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCallback, useMemo } from 'react'
import type { 
  DateRange, 
  Granularity, 
  AnalyticsState,
  AnalyticsParams 
} from '@/types/controls'
import { 
  dateRangeToParams, 
  paramsToDateRange, 
  isValidGranularity,
  getDefaultPresets 
} from '@/types/controls'

/**
 * Hook for managing analytics state with URL persistence
 */
export function useAnalyticsState() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Get default date range (last 30 days)
  const defaultDateRange = useMemo(() => {
    return getDefaultPresets().find(p => p.id === 'last30days')?.getValue() || {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      to: new Date()
    }
  }, [])

  // Parse current state from URL
  const currentState = useMemo((): AnalyticsState => {
    const params: AnalyticsParams = {
      from: searchParams.get('from') || undefined,
      to: searchParams.get('to') || undefined,
      granularity: searchParams.get('granularity') || undefined
    }

    // Parse date range from URL or use default
    const dateRange = paramsToDateRange(params) || defaultDateRange

    // Parse granularity from URL or use default
    const granularity: Granularity = 
      params.granularity && isValidGranularity(params.granularity) 
        ? params.granularity 
        : 'day'

    return {
      dateRange,
      granularity
    }
  }, [searchParams, defaultDateRange])

  // Update URL with new state
  const updateState = useCallback((newState: Partial<AnalyticsState>) => {
    const current = new URLSearchParams(searchParams.toString())
    
    // Update date range if provided
    if (newState.dateRange) {
      const dateParams = dateRangeToParams(newState.dateRange)
      current.set('from', dateParams.from!)
      current.set('to', dateParams.to!)
    }

    // Update granularity if provided
    if (newState.granularity) {
      current.set('granularity', newState.granularity)
    }

    // Navigate with new params
    const newUrl = `${pathname}?${current.toString()}`
    router.push(newUrl, { scroll: false })
  }, [searchParams, pathname, router])

  // Convenience methods
  const setDateRange = useCallback((dateRange: DateRange) => {
    updateState({ dateRange })
  }, [updateState])

  const setGranularity = useCallback((granularity: Granularity) => {
    updateState({ granularity })
  }, [updateState])

  // Reset to defaults
  const resetState = useCallback(() => {
    updateState({
      dateRange: defaultDateRange,
      granularity: 'day'
    })
  }, [updateState, defaultDateRange])

  // Get URL for sharing current state
  const getShareableUrl = useCallback(() => {
    if (typeof window === 'undefined') return ''
    
    const url = new URL(window.location.href)
    const dateParams = dateRangeToParams(currentState.dateRange)
    url.searchParams.set('from', dateParams.from!)
    url.searchParams.set('to', dateParams.to!)
    url.searchParams.set('granularity', currentState.granularity)
    
    return url.toString()
  }, [currentState])

  return {
    // Current state
    dateRange: currentState.dateRange,
    granularity: currentState.granularity,
    
    // Update methods
    setDateRange,
    setGranularity,
    updateState,
    resetState,
    
    // Utilities
    getShareableUrl,
    
    // For backward compatibility
    state: currentState
  }
}

/**
 * Hook for getting analytics params in API format
 */
export function useAnalyticsParams() {
  const { dateRange, granularity } = useAnalyticsState()
  
  return useMemo(() => ({
    from: dateRange.from.toISOString().split('T')[0],
    to: dateRange.to.toISOString().split('T')[0],
    granularity
  }), [dateRange, granularity])
}