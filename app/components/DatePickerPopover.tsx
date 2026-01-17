"use client"

import { useState } from "react"
import { DayPicker } from "react-day-picker"
import { format } from "date-fns"
import { Calendar } from "lucide-react"
import "react-day-picker/dist/style.css"

interface DatePickerPopoverProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function DatePickerPopover({ value, onChange, placeholder = "Select date" }: DatePickerPopoverProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const parseDate = (dateStr: string) => {
    if (!dateStr) return new Date()
    const [day, month, year] = dateStr.split('/').map(Number)
    return new Date(year, month - 1, day)
  }

  const handleDayClick = (day: Date) => {
    const formatted = format(day, 'dd/MM/yyyy')
    onChange(formatted)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          readOnly
          className="flex-1 px-3 py-2 border border-[#e5e7eb] rounded-lg text-sm focus:outline-none focus:border-[#2d6a4f] cursor-pointer bg-white"
          onClick={() => setIsOpen(!isOpen)}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-[#f8f9fa] rounded-lg transition-colors"
        >
          <Calendar className="w-5 h-5 text-[#2d6a4f]" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-[#e5e7eb] rounded-lg shadow-lg p-4 z-50">
          <DayPicker
            mode="single"
            selected={parseDate(value)}
            onDayClick={handleDayClick}
            disabled={(date) => date > new Date()}
            className="text-sm"
          />
          <button
            onClick={() => setIsOpen(false)}
            className="mt-3 w-full px-3 py-2 text-sm bg-[#f8f9fa] hover:bg-[#e8eef5] rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      )}
    </div>
  )
}
