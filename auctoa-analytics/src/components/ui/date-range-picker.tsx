"use client"

import * as React from "react"
import { CalendarIcon, ChevronDown } from "lucide-react"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { 
  DateRange, 
  DateRangePickerProps, 
  DateRangePreset
} from "@/types/controls"
import { getDefaultPresets } from "@/types/controls"

export function DateRangePicker({
  value,
  onChange,
  presets = getDefaultPresets(),
  placeholder = "Select date range",
  disabled = false,
  className
}: DateRangePickerProps) {
  const [isPresetOpen, setIsPresetOpen] = React.useState(false)
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)
  const [tempRange, setTempRange] = React.useState<DateRange | undefined>(value)

  // Handle preset selection
  const handlePresetSelect = (preset: DateRangePreset) => {
    const range = preset.getValue()
    onChange(range)
    setIsPresetOpen(false)
  }

  // Handle custom date selection
  const handleDateSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from && range?.to) {
      onChange({ from: range.from, to: range.to })
      setIsCalendarOpen(false)
    } else if (range?.from) {
      setTempRange({ from: range.from, to: range.to || range.from })
    } else {
      setTempRange(undefined)
    }
  }

  // Get current preset label if selected
  const getCurrentPresetLabel = () => {
    if (!value) return null
    
    return presets.find(preset => {
      const presetRange = preset.getValue()
      return presetRange.from.toDateString() === value.from.toDateString() && 
             presetRange.to.toDateString() === value.to.toDateString()
    })?.label
  }

  const currentPresetLabel = getCurrentPresetLabel()

  return (
    <div className={cn("flex gap-2", className)}>
      {/* Preset Selector */}
      <Popover open={isPresetOpen} onOpenChange={setIsPresetOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-9 px-3 justify-between min-w-[140px]",
              disabled && "cursor-not-allowed opacity-50"
            )}
            disabled={disabled}
            aria-label="Date range presets"
          >
            <span className="truncate">
              {currentPresetLabel || "Last 30 days"}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[180px] p-2" align="start">
          <div className="grid gap-1">
            {presets.map((preset) => (
              <Button
                key={preset.id}
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 justify-start text-left font-normal",
                  currentPresetLabel === preset.label && "bg-accent"
                )}
                onClick={() => handlePresetSelect(preset)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Date Range Display/Selector */}
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-9 px-3 justify-start min-w-[200px]",
              disabled && "cursor-not-allowed opacity-50"
            )}
            disabled={disabled}
            aria-label="Custom date range"
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
            <span className="truncate">
              {value?.from ? (
                value.to ? (
                  // Check if it's the same day (Today/Yesterday)
                  value.from.toDateString() === value.to.toDateString() ? (
                    format(value.from, "MMM d, yyyy")
                  ) : (
                    `${format(value.from, "MMM d")} — ${format(value.to, "MMM d")}`
                  )
                ) : (
                  format(value.from, "MMM d, yyyy")
                )
              ) : (
                placeholder
              )}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={value?.from}
              selected={tempRange || value ? { 
                from: (tempRange || value)?.from, 
                to: (tempRange || value)?.to 
              } : undefined}
              onSelect={handleDateSelect}
              numberOfMonths={2}
              className="rounded-md"
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium",
                nav: "space-x-1 flex items-center",
                nav_button: cn(
                  "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                ),
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: "h-8 w-8 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: cn(
                  "h-8 w-8 p-0 font-normal aria-selected:opacity-100"
                ),
                day_range_end: "day-range-end",
                day_selected:
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_today: "bg-accent text-accent-foreground",
                day_outside:
                  "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                day_disabled: "text-muted-foreground opacity-50",
                day_range_middle:
                  "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden: "invisible",
              }}
            />
            
            {/* Quick actions */}
            <div className="flex items-center justify-between gap-2 pt-3 border-t mt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const today = new Date()
                  handleDateSelect({ from: today, to: today })
                }}
                className="h-8 text-blue-600 hover:text-blue-700"
              >
                Today
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTempRange(undefined)
                  setIsCalendarOpen(false)
                }}
                className="h-8"
              >
                Clear
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}