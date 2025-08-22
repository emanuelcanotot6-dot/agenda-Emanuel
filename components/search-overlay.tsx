"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, X, ExternalLink, Calendar, FileText } from "lucide-react"
import type { Event } from "@/app/page"

interface SearchOverlayProps {
  events: Event[]
  isOpen: boolean
  onClose: () => void
}

interface SearchResult {
  event: Event
  matchType: "title" | "notes" | "category"
  matchText: string
}

export function SearchOverlay({ events, isOpen, onClose }: SearchOverlayProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null)
  const [relatedEvents, setRelatedEvents] = useState<Event[]>([])
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Focus search input when overlay opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  // Real-time search as user types
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([])
      setSelectedResult(null)
      setRelatedEvents([])
      return
    }

    const term = searchTerm.toLowerCase()
    const results: SearchResult[] = []

    events.forEach((event) => {
      // Search in title
      if (event.title.toLowerCase().includes(term)) {
        results.push({
          event,
          matchType: "title",
          matchText: event.title,
        })
      }
      // Search in notes
      else if (event.notes.toLowerCase().includes(term)) {
        results.push({
          event,
          matchType: "notes",
          matchText: event.notes,
        })
      }
      // Search in category
      else if (event.category.toLowerCase().includes(term)) {
        results.push({
          event,
          matchType: "category",
          matchText: event.category,
        })
      }
    })

    setSearchResults(results)
  }, [searchTerm, events])

  // Find related events when a result is selected
  const handleResultSelect = (result: SearchResult) => {
    setSelectedResult(result)

    // Find related events based on category and similar keywords
    const related = events.filter((event) => {
      if (event.id === result.event.id) return false

      // Same category
      if (event.category === result.event.category) return true

      // Similar keywords in title or notes
      const keywords = result.event.title
        .toLowerCase()
        .split(" ")
        .concat(result.event.notes.toLowerCase().split(" "))
        .filter((word) => word.length > 3)

      return keywords.some(
        (keyword) => event.title.toLowerCase().includes(keyword) || event.notes.toLowerCase().includes(keyword),
      )
    })

    setRelatedEvents(related)
  }

  // Handle right-click to open in new tab
  const handleEventRightClick = (event: Event, e: React.MouseEvent) => {
    e.preventDefault()
    // Create a URL with event details as query params
    const eventUrl = `${window.location.origin}?eventId=${event.id}&date=${event.date}&title=${encodeURIComponent(event.title)}`
    window.open(eventUrl, "_blank")
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Alumnos":
        return "bg-green-100 text-green-800 border-green-200"
      case "Docentes":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Presentaciones":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "Otros":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getMatchIcon = (matchType: string) => {
    switch (matchType) {
      case "title":
        return <FileText className="h-3 w-3" />
      case "notes":
        return <FileText className="h-3 w-3" />
      case "category":
        return <Calendar className="h-3 w-3" />
      default:
        return <Search className="h-3 w-3" />
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20">
      <Card className="w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Búsqueda Avanzada</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder="Buscar eventos por título, notas o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-base"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex h-96">
          {/* Search Results */}
          <div className="w-1/2 border-r overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Resultados ({searchResults.length})</h3>

              {searchResults.length === 0 && searchTerm && (
                <p className="text-sm text-muted-foreground">No se encontraron resultados</p>
              )}

              {searchResults.map((result, index) => (
                <div
                  key={`${result.event.id}-${index}`}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors mb-2 ${
                    selectedResult?.event.id === result.event.id ? "bg-primary/10 border-primary" : "hover:bg-muted/50"
                  }`}
                  onClick={() => handleResultSelect(result)}
                  onContextMenu={(e) => handleEventRightClick(result.event, e)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getMatchIcon(result.matchType)}
                        <h4 className="text-sm font-medium truncate">{result.event.title}</h4>
                        <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className={`text-xs ${getCategoryColor(result.event.category)}`}>
                          {result.event.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(result.event.date).toLocaleDateString("es-ES")}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{result.event.notes}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Event Details and Related */}
          <div className="w-1/2 overflow-y-auto">
            {selectedResult ? (
              <div className="p-4">
                {/* Selected Event Details */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Evento Seleccionado</h3>
                  <Card className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h4 className="font-semibold">{selectedResult.event.title}</h4>
                      <ExternalLink
                        className="h-4 w-4 text-muted-foreground cursor-pointer"
                        onClick={(e) => handleEventRightClick(selectedResult.event, e as any)}
                      />
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={getCategoryColor(selectedResult.event.category)}>
                        {selectedResult.event.category}
                      </Badge>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(selectedResult.event.date).toLocaleDateString("es-ES")}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedResult.event.notes}</p>
                  </Card>
                </div>

                {/* Related Events */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Eventos Relacionados ({relatedEvents.length})
                  </h3>

                  {relatedEvents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No hay eventos relacionados</p>
                  ) : (
                    <div className="space-y-2">
                      {relatedEvents.slice(0, 5).map((event) => (
                        <Card
                          key={event.id}
                          className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                          onContextMenu={(e) => handleEventRightClick(event, e)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h5 className="text-sm font-medium truncate">{event.title}</h5>
                                <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                              </div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className={`text-xs ${getCategoryColor(event.category)}`}>
                                  {event.category}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(event.date).toLocaleDateString("es-ES")}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-1">{event.notes}</p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Selecciona un resultado para ver detalles</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-muted/30">
          <p className="text-xs text-muted-foreground">
            💡 Tip: Haz clic derecho en cualquier evento para abrirlo en una nueva pestaña
          </p>
        </div>
      </Card>
    </div>
  )
}
