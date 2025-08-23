"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ActivityIcon, FileTextIcon, MessageCircleIcon, ShareIcon, EditIcon, TrashIcon } from "lucide-react"
import type { ActivityLog } from "@/lib/types"

interface ActivityPanelProps {
  activities: ActivityLog[]
  limit?: number
}

export function ActivityPanel({ activities, limit = 10 }: ActivityPanelProps) {
  const recentActivities = activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit)

  const getActivityIcon = (action: ActivityLog["action"]) => {
    switch (action) {
      case "created":
        return <FileTextIcon className="h-4 w-4 text-green-600" />
      case "updated":
        return <EditIcon className="h-4 w-4 text-blue-600" />
      case "deleted":
        return <TrashIcon className="h-4 w-4 text-red-600" />
      case "commented":
        return <MessageCircleIcon className="h-4 w-4 text-orange-600" />
      case "shared":
        return <ShareIcon className="h-4 w-4 text-purple-600" />
      default:
        return <ActivityIcon className="h-4 w-4" />
    }
  }

  const getActivityText = (activity: ActivityLog) => {
    switch (activity.action) {
      case "created":
        return `creó la página "${activity.pageTitle}"`
      case "updated":
        return `editó la página "${activity.pageTitle}"`
      case "deleted":
        return `eliminó la página "${activity.pageTitle}"`
      case "commented":
        return `comentó en "${activity.pageTitle}"`
      case "shared":
        return `compartió "${activity.pageTitle}"`
      default:
        return `realizó una acción en "${activity.pageTitle}"`
    }
  }

  const getRelativeTime = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Ahora"
    if (minutes < 60) return `Hace ${minutes}m`
    if (hours < 24) return `Hace ${hours}h`
    return `Hace ${days}d`
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <ActivityIcon className="h-4 w-4" />
          Actividad reciente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentActivities.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <ActivityIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay actividad reciente</p>
          </div>
        ) : (
          recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-2 rounded hover:bg-muted/50">
              <div className="mt-0.5">{getActivityIcon(activity.action)}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm">
                  <span className="font-medium">{activity.userName}</span>{" "}
                  <span className="text-muted-foreground">{getActivityText(activity)}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {getRelativeTime(activity.timestamp)}
                  </Badge>
                  {activity.details && <span className="text-xs text-muted-foreground">{activity.details}</span>}
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
