"use client"

import { useState, useEffect } from "react"
import { CalendarView } from "@/components/calendar-view"
import { EventForm } from "@/components/event-form"
import { EventHistory } from "@/components/event-history"
import { SearchFilters } from "@/components/search-filters"
import { SearchOverlay } from "@/components/search-overlay"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Calendar, List, Plus, Search } from "lucide-react"

// API URL configuration
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://script.google.com/macros/s/AKfycbyd3RiZ43IKQl5hJ76-rI3mBCmfV8LcOS3b21tvqCzwtWeeLqbH1JWK9vNKqzcqeql8gg/exec"

export interface Event {
  id: string
  date: string
  title: string
  category: "Alumnos" | "Docentes" | "Presentaciones" | "Otros"
  notes: string
  createdAt?: string
}

const mockEvents: Event[] = [
  {
    id: "1",
    date: "2025-01-15",
    title: "Reunión de Docentes",
    category: "Docentes",
    notes: "Reunión mensual del equipo docente",
    createdAt: "2025-01-10",
  },
  {
    id: "2",
    date: "2025-01-20",
    title: "Presentación Final",
    category: "Presentaciones",
    notes: "Presentación de proyectos de fin de curso",
    createdAt: "2025-01-12",
  },
  {
    id: "3",
    date: "2025-01-25",
    title: "Taller para Alumnos",
    category: "Alumnos",
    notes: "Taller de habilidades digitales",
    createdAt: "2025-01-14",
  },
]

export default function CalendarApp() {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [currentView, setCurrentView] = useState<"calendar" | "list">("calendar")
  const [showEventForm, setShowEventForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [isApiAvailable, setIsApiAvailable] = useState(false)
  const [showSearchOverlay, setShowSearchOverlay] = useState(false)
  const { toast } = useToast()

  // Load events on component mount
  useEffect(() => {
    loadEvents()
  }, [])

  // Update filtered events when events change
  useEffect(() => {
    setFilteredEvents(events)
  }, [events])

  const loadEvents = async () => {
    try {
      setLoading(true)
      console.log("[v0] Loading events, API_URL:", API_URL)

      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      })

      console.log("[v0] API response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] API response data:", data)
        const eventsArray = Array.isArray(data) ? data : data.events || []
        setEvents(eventsArray)
        setIsApiAvailable(true)

        toast({
          title: "✅ Conectado",
          description: "Datos cargados desde Google Drive",
          variant: "default",
        })
      } else {
        throw new Error(`API responded with status: ${response.status}`)
      }
    } catch (error) {
      console.error("[v0] Error loading events:", error)
      console.log("[v0] Falling back to mock data")

      setEvents(mockEvents)
      setIsApiAvailable(false)

      toast({
        title: "Modo Offline",
        description: "No se pudo conectar con Google Drive. Usando datos locales.",
        variant: "default",
      })
    } finally {
      setLoading(false)
    }
  }

  const saveEvent = async (eventData: Omit<Event, "id">) => {
    try {
      if (!isApiAvailable) {
        const newEvent: Event = {
          ...eventData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString().split("T")[0],
        }

        if (editingEvent) {
          setEvents((prev) => prev.map((e) => (e.id === editingEvent.id ? { ...newEvent, id: editingEvent.id } : e)))
        } else {
          setEvents((prev) => [...prev, newEvent])
        }

        setShowEventForm(false)
        setEditingEvent(null)
        toast({
          title: "✅ Guardado Localmente",
          description: `Evento ${editingEvent ? "actualizado" : "creado"} en modo offline`,
        })
        return
      }

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "add",
          date: eventData.date,
          title: eventData.title,
          category: eventData.category,
          notes: eventData.notes,
        }),
      })

      if (response.ok) {
        await loadEvents()
        setShowEventForm(false)
        setEditingEvent(null)
        toast({
          title: "✅ Éxito",
          description: `Evento ${editingEvent ? "actualizado" : "guardado"} en Drive`,
        })
      } else {
        throw new Error("Failed to save event")
      }
    } catch (error) {
      console.error("[v0] Error saving event:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el evento",
        variant: "destructive",
      })
    }
  }

  const deleteEvent = async (eventId: string) => {
    try {
      if (!isApiAvailable) {
        setEvents((prev) => prev.filter((e) => e.id !== eventId))
        toast({
          title: "✅ Eliminado",
          description: "Evento eliminado localmente",
        })
        return
      }

      const response = await fetch(`${API_URL}?action=deleteEvent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "deleteEvent",
          eventId,
        }),
      })

      if (response.ok) {
        await loadEvents()
        toast({
          title: "✅ Eliminado",
          description: "Evento eliminado correctamente",
        })
      } else {
        throw new Error("Failed to delete event")
      }
    } catch (error) {
      console.error("[v0] Error deleting event:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el evento",
        variant: "destructive",
      })
    }
  }

  const exportToExcel = async () => {
    try {
      if (!isApiAvailable) {
        toast({
          title: "Función no disponible",
          description: "La exportación requiere conexión con Google Drive",
          variant: "default",
        })
        return
      }

      const response = await fetch(`${API_URL}?action=exportExcel`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "eventos-calendario.xlsx"
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({
          title: "✅ Exportado",
          description: "Archivo Excel descargado correctamente",
        })
      } else {
        throw new Error("Failed to export")
      }
    } catch (error) {
      console.error("[v0] Error exporting:", error)
      toast({
        title: "Error",
        description: "No se pudo exportar el archivo",
        variant: "destructive",
      })
    }
  }

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event)
    setShowEventForm(true)
  }

  const handleNewEvent = () => {
    setEditingEvent(null)
    setShowEventForm(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando eventos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Calendario de Eventos</h1>
            <p className="text-muted-foreground">Gestiona tus eventos académicos</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={currentView === "calendar" ? "default" : "outline"}
              onClick={() => setCurrentView("calendar")}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Calendario
            </Button>
            <Button
              variant={currentView === "list" ? "default" : "outline"}
              onClick={() => setCurrentView("list")}
              className="flex items-center gap-2"
            >
              <List className="h-4 w-4" />
              Lista
            </Button>
            <Button variant="outline" onClick={() => setShowSearchOverlay(true)} className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Buscar
            </Button>
            <Button onClick={handleNewEvent} className="flex items-center gap-2 bg-secondary hover:bg-secondary/90">
              <Plus className="h-4 w-4" />
              Nuevo Evento
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="p-4 mb-6">
          <SearchFilters events={events} onFilteredEvents={setFilteredEvents} onExport={exportToExcel} />
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar/List View */}
          <div className="lg:col-span-2">
            {currentView === "calendar" ? (
              <CalendarView events={filteredEvents} onEventClick={handleEditEvent} />
            ) : (
              <EventHistory events={filteredEvents} onEdit={handleEditEvent} onDelete={deleteEvent} />
            )}
          </div>

          {/* Event Form */}
          <div className="lg:col-span-1">
            {showEventForm && (
              <EventForm
                event={editingEvent}
                onSave={saveEvent}
                onCancel={() => {
                  setShowEventForm(false)
                  setEditingEvent(null)
                }}
              />
            )}
          </div>
        </div>
      </div>

      <SearchOverlay events={events} isOpen={showSearchOverlay} onClose={() => setShowSearchOverlay(false)} />
    </div>
  )
}
