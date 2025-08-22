"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { EventTooltip } from "./event-tooltip"
import type { Event } from "@/app/page"

interface CalendarViewProps {
  events: Event[]
  onEventClick: (event: Event) => void
}

export function CalendarView({ events, onEventClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const monthNames = [
    "ENERO",
    "FEBRERO",
    "MARZO",
    "ABRIL",
    "MAYO",
    "JUNIO",
    "JULIO",
    "AGOSTO",
    "SEPTIEMBRE",
    "OCTUBRE",
    "NOVIEMBRE",
    "DICIEMBRE",
  ]

  const dayNames = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

  const getPreviousMonth = (date: Date) => {
    const prev = new Date(date)
    prev.setMonth(date.getMonth() - 1)
    return prev
  }

  const getNextMonth = (date: Date) => {
    const next = new Date(date)
    next.setMonth(date.getMonth() + 1)
    return next
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    // Adjust for Monday start (0 = Sunday, 1 = Monday, etc.)
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const getEventsForDate = (date: Date | null) => {
    if (!date) return []
    const dateString = date.toISOString().split("T")[0]
    console.log("[v0] Looking for events on date:", dateString)
    const filteredEvents = events.filter((event) => {
      const eventDate = event.date.split("T")[0] // Extract date part from ISO string
      console.log("[v0] Comparing:", dateString, "with event date:", eventDate)
      return eventDate === dateString
    })
    console.log("[v0] Found events for", dateString, ":", filteredEvents)
    return filteredEvents
  }

  const getCategoryClass = (category: string) => {
    switch (category) {
      case "Alumnos":
        return "bg-emerald-100 text-emerald-800 border border-emerald-200"
      case "Docentes":
        return "bg-blue-100 text-blue-800 border border-blue-200"
      case "Presentaciones":
        return "bg-orange-100 text-orange-800 border border-orange-200"
      case "Otros":
        return "bg-gray-100 text-gray-800 border border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200"
    }
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const days = getDaysInMonth(currentDate)
  const prevMonth = getPreviousMonth(currentDate)
  const nextMonth = getNextMonth(currentDate)
  const prevDays = getDaysInMonth(prevMonth)
  const nextDays = getDaysInMonth(nextMonth)

  const MiniCalendar = ({ date, title }: { date: Date; title: string }) => {
    const miniDays = getDaysInMonth(date)
    return (
      <div className="w-48">
        <h3 className="text-sm font-medium text-center mb-2 text-gray-600">{title}</h3>
        <div className="grid grid-cols-7 gap-px text-xs">
          {["L", "M", "X", "J", "V", "S", "D"].map((day) => (
            <div key={day} className="text-center p-1 text-gray-500 font-medium">
              {day}
            </div>
          ))}
          {miniDays.map((day, index) => (
            <div key={index} className={`text-center p-1 ${day ? "text-gray-700" : "text-gray-300"}`}>
              {day ? day.getDate() : ""}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <MiniCalendar date={prevMonth} title={`${monthNames[prevMonth.getMonth()]} ${prevMonth.getFullYear()}`} />

        <div className="text-center">
          <div className="flex items-center justify-center gap-4 mb-2">
            <Button variant="ghost" size="sm" onClick={() => navigateMonth("prev")}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-4xl font-bold">{monthNames[currentDate.getMonth()]}</h1>
            <Button variant="ghost" size="sm" onClick={() => navigateMonth("next")}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          <div className="text-4xl font-bold text-red-600">{currentDate.getFullYear()}</div>
        </div>

        <MiniCalendar date={nextMonth} title={`${monthNames[nextMonth.getMonth()]} ${nextMonth.getFullYear()}`} />
      </div>

      <Card className="overflow-hidden">
        {/* Day Names Header */}
        <div className="grid grid-cols-7 bg-slate-700 text-white">
          {dayNames.map((day) => (
            <div key={day} className="p-4 text-center font-medium">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const dayEvents = getEventsForDate(day)
            const isToday = day && day.toDateString() === new Date().toDateString()

            return (
              <div
                key={index}
                className={`min-h-[120px] p-2 border-r border-b border-gray-200 bg-white ${
                  isToday ? "bg-blue-50" : ""
                }`}
              >
                {day && (
                  <>
                    <div className={`text-lg font-bold mb-2 ${isToday ? "text-blue-600" : "text-gray-900"}`}>
                      {day.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.map((event, eventIndex) => (
                        <EventTooltip key={eventIndex} event={event}>
                          <div
                            className={`text-xs p-1.5 rounded cursor-pointer hover:opacity-80 transition-opacity ${getCategoryClass(event.category)}`}
                            onClick={() => onEventClick(event)}
                          >
                            <div className="font-medium">
                              {event.title.length > 20 ? `${event.title.substring(0, 20)}...` : event.title}
                            </div>
                          </div>
                        </EventTooltip>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
