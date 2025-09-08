import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import Layout from '@/components/layout/Layout'
import NotificationList from '@/components/notifications/NotificationList'

export default async function NotificationsPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  return (
    <Layout user={user}>
      <NotificationList user={user} />
    </Layout>
  )
}
