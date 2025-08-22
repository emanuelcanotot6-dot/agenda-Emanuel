"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import type { Event } from "@/app/page"

interface EventTooltipProps {
  event: Event
  children: React.ReactNode
}

export function EventTooltip({ event, children }: EventTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    })
    setIsVisible(true)
  }

  const handleMouseLeave = () => {
    setIsVisible(false)
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Alumnos":
        return "border-emerald-500 bg-emerald-50"
      case "Docentes":
        return "border-blue-500 bg-blue-50"
      case "Presentaciones":
        return "border-orange-500 bg-orange-50"
      case "Otros":
        return "border-gray-500 bg-gray-50"
      default:
        return "border-gray-500 bg-gray-50"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <>
      <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="relative">
        {children}
      </div>

      {isVisible && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: position.x,
            top: position.y,
            transform: "translate(-50%, -100%)",
          }}
        >
          <Card className={`p-4 shadow-lg border-2 max-w-sm ${getCategoryColor(event.category)}`}>
            <div className="space-y-2">
              <div className="font-bold text-lg text-gray-900">{event.title}</div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Categoría:</span> {event.category}
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Fecha:</span> {formatDate(event.date)}
              </div>
              {event.notes && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Notas:</span> {event.notes}
                </div>
              )}
            </div>
            {/* Tooltip arrow */}
            <div
              className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent ${
                event.category === "Alumnos"
                  ? "border-t-emerald-500"
                  : event.category === "Docentes"
                    ? "border-t-blue-500"
                    : event.category === "Presentaciones"
                      ? "border-t-orange-500"
                      : "border-t-gray-500"
              }`}
            />
          </Card>
        </div>
      )}
    </>
  )
}
