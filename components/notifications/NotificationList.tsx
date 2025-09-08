'use client'

import { useState, useEffect } from 'react'
import { AuthUser } from '@/lib/auth'
import { Notification } from '@prisma/client'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import Button from '@/components/ui/Button'
import { Bell, Check, Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react'

interface NotificationListProps {
  user: AuthUser
}

export default function NotificationList({ user }: NotificationListProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/notifications')
      const data = await response.json()
      
      if (data.success) {
        setNotifications(data.data.notifications)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
      })

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notification =>
            notification.id === notificationId
              ? { ...notification, isRead: true }
              : notification
          )
        )
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'approval_request':
        return <Clock className="h-4 w-4 text-warning-500" />
      case 'approval_result':
        return <CheckCircle className="h-4 w-4 text-success-500" />
      case 'payment_ready':
        return <DollarSign className="h-4 w-4 text-primary-500" />
      case 'payment_completed':
        return <CheckCircle className="h-4 w-4 text-success-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'approval_request':
        return 'bg-warning-50 border-warning-200'
      case 'approval_result':
        return 'bg-success-50 border-success-200'
      case 'payment_ready':
        return 'bg-primary-50 border-primary-200'
      case 'payment_completed':
        return 'bg-success-50 border-success-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">알림</h1>
        <p className="mt-1 text-sm text-gray-500">
          시스템 알림을 확인하세요.
        </p>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">알림이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border ${
                notification.isRead 
                  ? 'bg-white border-gray-200' 
                  : `${getNotificationColor(notification.type)} border-l-4`
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-sm font-medium ${
                      notification.isRead ? 'text-gray-900' : 'text-gray-900'
                    }`}>
                      {notification.title}
                    </h3>
                    {!notification.isRead && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        읽음
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                      locale: ko
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
