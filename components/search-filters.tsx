"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, Filter } from "lucide-react"
import type { Event } from "@/app/page"

interface SearchFiltersProps {
  events: Event[]
  onFilteredEvents: (events: Event[]) => void
  onExport: () => void
}

export function SearchFilters({ events, onFilteredEvents, onExport }: SearchFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")

  useEffect(() => {
    let filtered = [...events]

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(term) ||
          event.notes.toLowerCase().includes(term) ||
          event.category.toLowerCase().includes(term),
      )
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((event) => event.category === categoryFilter)
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.date)

        switch (dateFilter) {
          case "today":
            return eventDate.getTime() === today.getTime()
          case "week":
            const weekStart = new Date(today)
            weekStart.setDate(today.getDate() - today.getDay())
            const weekEnd = new Date(weekStart)
            weekEnd.setDate(weekStart.getDate() + 6)
            return eventDate >= weekStart && eventDate <= weekEnd
          case "month":
            return eventDate.getMonth() === today.getMonth() && eventDate.getFullYear() === today.getFullYear()
          case "last30":
            const thirtyDaysAgo = new Date(today)
            thirtyDaysAgo.setDate(today.getDate() - 30)
            return eventDate >= thirtyDaysAgo && eventDate <= today
          default:
            return true
        }
      })
    }

    onFilteredEvents(filtered)
  }, [events, searchTerm, categoryFilter, dateFilter, onFilteredEvents])

  const clearFilters = () => {
    setSearchTerm("")
    setCategoryFilter("all")
    setDateFilter("all")
  }

  const hasActiveFilters = searchTerm.trim() || categoryFilter !== "all" || dateFilter !== "all"

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, notas o categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Export Button */}
        <Button onClick={onExport} variant="outline" className="flex items-center gap-2 bg-transparent">
          <Download className="h-4 w-4" />
          Exportar Excel
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        {/* Category Filter */}
        <div className="flex-1">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              <SelectItem value="Alumnos">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  Alumnos
                </span>
              </SelectItem>
              <SelectItem value="Docentes">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  Docentes
                </span>
              </SelectItem>
              <SelectItem value="Presentaciones">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  Presentaciones
                </span>
              </SelectItem>
              <SelectItem value="Otros">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                  Otros
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Filter */}
        <div className="flex-1">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por fecha" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las fechas</SelectItem>
              <SelectItem value="today">Hoy</SelectItem>
              <SelectItem value="week">Esta semana</SelectItem>
              <SelectItem value="month">Este mes</SelectItem>
              <SelectItem value="last30">Últimos 30 días</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button onClick={clearFilters} variant="outline" className="flex items-center gap-2 bg-transparent">
            <Filter className="h-4 w-4" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        {hasActiveFilters && (
          <>
            Mostrando {events.length} de {events.length} eventos
          </>
        )}
      </div>
    </div>
  )
}
