"use client"

import * as React from "react"
import { Calendar, CalendarDays } from "lucide-react"

import { cn } from "@/lib/utils"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { Granularity, GranularityToggleProps } from "@/types/controls"
import { Labels } from "@/types/controls"

const granularityOptions = [
  {
    value: 'day' as Granularity,
    label: Labels.daily,
    icon: Calendar,
    description: 'Daily view of data'
  },
  {
    value: 'week' as Granularity,
    label: Labels.weekly,
    icon: CalendarDays,
    description: 'Weekly view of data'
  }
] as const

export function GranularityToggle({
  value,
  onChange,
  disabled = false,
  className
}: GranularityToggleProps) {
  const handleValueChange = (newValue: string) => {
    if (newValue && (newValue === 'day' || newValue === 'week')) {
      onChange(newValue as Granularity)
    }
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-sm font-medium text-muted-foreground">
        {Labels.granularity}:
      </span>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={handleValueChange}
        disabled={disabled}
        className="h-9"
        aria-label="Granularity toggle"
      >
        {granularityOptions.map((option) => {
          const IconComponent = option.icon
          return (
            <ToggleGroupItem
              key={option.value}
              value={option.value}
              size="sm"
              className={cn(
                "h-8 px-3 text-sm font-medium",
                "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
                "hover:bg-accent hover:text-accent-foreground",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                disabled && "cursor-not-allowed opacity-50"
              )}
              aria-label={option.description}
              title={option.description}
            >
              <IconComponent className="mr-1.5 h-3.5 w-3.5" />
              {option.label}
            </ToggleGroupItem>
          )
        })}
      </ToggleGroup>
    </div>
  )
}

// Additional helper component for minimal version (just the toggle without label)
export function GranularityToggleCompact({
  value,
  onChange,
  disabled = false,
  className
}: GranularityToggleProps) {
  const handleValueChange = (newValue: string) => {
    if (newValue && (newValue === 'day' || newValue === 'week')) {
      onChange(newValue as Granularity)
    }
  }

  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={handleValueChange}
      disabled={disabled}
      className={cn("h-9", className)}
      aria-label="Granularity toggle"
    >
      {granularityOptions.map((option) => {
        const IconComponent = option.icon
        return (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            size="sm"
            className={cn(
              "h-8 px-2.5 text-sm font-medium",
              "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
              "hover:bg-accent hover:text-accent-foreground",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              disabled && "cursor-not-allowed opacity-50"
            )}
            aria-label={option.description}
            title={option.description}
          >
            <IconComponent className="h-3.5 w-3.5" />
            <span className="sr-only">{option.label}</span>
          </ToggleGroupItem>
        )
      })}
    </ToggleGroup>
  )
}