"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Event } from "@/app/page"

interface EventFormProps {
  event?: Event | null
  onSave: (event: Omit<Event, "id">) => void
  onCancel: () => void
}

export function EventForm({ event, onSave, onCancel }: EventFormProps) {
  const [formData, setFormData] = useState({
    date: "",
    title: "",
    category: "Otros" as Event["category"],
    notes: "",
  })

  useEffect(() => {
    if (event) {
      setFormData({
        date: event.date,
        title: event.title,
        category: event.category,
        notes: event.notes,
      })
    } else {
      setFormData({
        date: new Date().toISOString().split("T")[0],
        title: "",
        category: "Otros",
        notes: "",
      })
    }
  }, [event])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.date) return

    onSave({
      date: formData.date,
      title: formData.title.trim(),
      category: formData.category,
      notes: formData.notes.trim(),
      createdAt: new Date().toISOString(),
    })
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Alumnos":
        return "text-green-600"
      case "Docentes":
        return "text-blue-600"
      case "Presentaciones":
        return "text-orange-600"
      case "Otros":
        return "text-gray-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">{event ? "Editar Evento" : "Nuevo Evento"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="date">Fecha</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Título del evento"
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Categoría</Label>
            <Select
              value={formData.category}
              onValueChange={(value: Event["category"]) => setFormData((prev) => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
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

          <div>
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Notas adicionales..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1 bg-secondary hover:bg-secondary/90">
              {event ? "Actualizar" : "Guardar"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
