"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Calendar } from "lucide-react"
import type { Event } from "@/app/page"

interface EventHistoryProps {
  events: Event[]
  onEdit: (event: Event) => void
  onDelete: (eventId: string) => void
}

export function EventHistory({ events, onEdit, onDelete }: EventHistoryProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Alumnos":
        return "bg-green-500 hover:bg-green-600"
      case "Docentes":
        return "bg-blue-500 hover:bg-blue-600"
      case "Presentaciones":
        return "bg-orange-500 hover:bg-orange-600"
      case "Otros":
        return "bg-gray-500 hover:bg-gray-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const sortedEvents = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">No hay eventos para mostrar</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Eventos ({events.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Fecha</th>
                    <th className="text-left py-2 px-4">Título</th>
                    <th className="text-left py-2 px-4">Categoría</th>
                    <th className="text-left py-2 px-4">Notas</th>
                    <th className="text-center py-2 px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedEvents.map((event) => (
                    <tr key={event.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 text-sm">{formatDate(event.date)}</td>
                      <td className="py-3 px-4 font-medium">{event.title}</td>
                      <td className="py-3 px-4">
                        <Badge className={`${getCategoryColor(event.category)} text-white`}>{event.category}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground max-w-xs">
                        {event.notes
                          ? event.notes.length > 50
                            ? `${event.notes.substring(0, 50)}...`
                            : event.notes
                          : "-"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => onEdit(event)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => onDelete(event.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {sortedEvents.map((event) => (
              <Card key={event.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">{event.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{formatDate(event.date)}</p>
                  </div>
                  <Badge className={`${getCategoryColor(event.category)} text-white text-xs`}>{event.category}</Badge>
                </div>

                {event.notes && <p className="text-sm text-muted-foreground mb-3">{event.notes}</p>}

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => onEdit(event)} className="flex-1">
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onDelete(event.id)} className="flex-1">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Eliminar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
