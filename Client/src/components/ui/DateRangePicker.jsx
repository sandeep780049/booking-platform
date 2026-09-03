"use client"

import { useState, useEffect } from "react"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "./button"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"

const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
]

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export default function DateRangePicker({ startDate, endDate, onChange, className }) {
    const [isOpen, setIsOpen] = useState(false)
    const [month, setMonth] = useState(new Date().getMonth())
    const [year, setYear] = useState(new Date().getFullYear())
    const [selectedStartDate, setSelectedStartDate] = useState(startDate || null)
    const [selectedEndDate, setSelectedEndDate] = useState(endDate || null)
    const [hoverDate, setHoverDate] = useState(null)

    useEffect(() => {
        if (startDate) {
            setSelectedStartDate(startDate)
            setMonth(startDate.getMonth())
            setYear(startDate.getFullYear())
        }
        if (endDate) {
            setSelectedEndDate(endDate)
        }
    }, [startDate, endDate])

    const getDaysInMonth = (month, year) => {
        return new Date(year, month + 1, 0).getDate()
    }

    const getFirstDayOfMonth = (month, year) => {
        return new Date(year, month, 1).getDay()
    }

    const handlePrevMonth = () => {
        if (month === 0) {
            setMonth(11)
            setYear(year - 1)
        } else {
            setMonth(month - 1)
        }
    }

    const handleNextMonth = () => {
        if (month === 11) {
            setMonth(0)
            setYear(year + 1)
        } else {
            setMonth(month + 1)
        }
    }   
    const handleDateClick = (date) => {
        // Prevent selecting past dates
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        if (date < today) {
            return
        }

        if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
            // Start new selection
            setSelectedStartDate(date)
            setSelectedEndDate(null)
        } else {
            // Complete selection
            if (date < selectedStartDate) {
                setSelectedEndDate(selectedStartDate)
                setSelectedStartDate(date)
            } else {
                setSelectedEndDate(date)
            }

            // If both dates are selected, call onChange
            if (selectedStartDate) {
                const finalStartDate = date < selectedStartDate ? date : selectedStartDate
                const finalEndDate = date < selectedStartDate ? selectedStartDate : date
                onChange(finalStartDate, finalEndDate)
                setIsOpen(false)
            }
        }
    }

    const handleMouseEnter = (date) => {
        if (selectedStartDate && !selectedEndDate) {
            setHoverDate(date)
        }
    }

    const handleMouseLeave = () => {
        setHoverDate(null)
    }

    const isDateInRange = (date) => {
        if (!selectedStartDate) return false
        if (!selectedEndDate && !hoverDate) return false

        const end = selectedEndDate || hoverDate
        return date > selectedStartDate && date < end
    }

    const isStartDate = (date) => {
        if (!selectedStartDate) return false
        return date.getTime() === selectedStartDate.getTime()
    }

    const isEndDate = (date) => {
        if (!selectedEndDate && !hoverDate) return false
        const end = selectedEndDate || hoverDate
        return date.getTime() === end.getTime()
    }

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(month, year)
        const firstDay = getFirstDayOfMonth(month, year)
        const days = []

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-9 w-9"></div>)
        }        // Add days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i)
            const isToday = new Date().toDateString() === date.toDateString()
            const isStart = isStartDate(date)
            const isEnd = isEndDate(date)
            const isInRange = isDateInRange(date)
            
            // Check if date is in the past
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const isPastDate = date < today

            days.push(
                <div
                    key={i}
                    className={`h-9 w-9 flex items-center justify-center rounded-md text-sm
            ${isPastDate ? "text-gray-300 cursor-not-allowed" : "cursor-pointer"}
            ${isToday ? "border border-gray-300" : ""}
            ${isStart || isEnd ? "bg-primary text-white" : ""}
            ${isInRange ? "bg-primary/20" : ""}
            ${!isStart && !isEnd && !isInRange && !isPastDate ? "hover:bg-gray-100" : ""}
          `}
                    onClick={() => !isPastDate && handleDateClick(date)}
                    onMouseEnter={() => !isPastDate && handleMouseEnter(date)}
                    onMouseLeave={handleMouseLeave}
                >
                    {i}
                </div>,
            )
        }

        return days
    }

    const formatDateRange = () => {
        if (!selectedStartDate) return "Select dates"

        const formatDate = (date) => {
            return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        }

        if (!selectedEndDate) return `From ${formatDate(selectedStartDate)}`

        return `${formatDate(selectedStartDate)} - ${formatDate(selectedEndDate)}`
    }    // Calculate duration in nights
    const calculateDurationInNights = () => {
        if (!selectedStartDate || !selectedEndDate) return 0

        const diffTime = Math.abs(selectedEndDate - selectedStartDate)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return Math.max(1, diffDays) // Minimum 1 night
    }

    return (
        <div className={className}>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal h-10">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>{formatDateRange()}</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-3">
                        <div className="flex items-center justify-between mb-2">
                            <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="font-medium">
                                {MONTHS[month]} {year}
                            </div>
                            <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {DAYS.map((day) => (
                                <div key={day} className="h-9 w-9 flex items-center justify-center text-xs text-muted-foreground">
                                    {day}
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>                        {selectedStartDate && (
                            <div className="mt-3 text-xs text-muted-foreground">
                                {selectedEndDate ? (
                                    <span>
                                        Duration: {calculateDurationInNights()} {calculateDurationInNights() === 1 ? "night" : "nights"}
                                    </span>
                                ) : (
                                    <span>Select check-out date</span>
                                )}
                            </div>
                        )}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}
