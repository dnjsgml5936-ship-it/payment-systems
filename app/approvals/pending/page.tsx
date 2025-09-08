'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, AuthUser, UserRole } from '@/lib/auth'
import Layout from '@/components/layout/Layout'
import ApprovalList from '@/components/approvals/ApprovalList'

export default function PendingApprovalsPage() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser()
        
        if (!currentUser) {
          router.push('/auth/login')
          return
        }

        // 권한 확인
        if (![UserRole.REPRESENTATIVE, UserRole.VICE_REPRESENTATIVE, UserRole.ADMIN].includes(currentUser.role)) {
          router.push('/dashboard')
          return
        }
        
        setUser(currentUser)
      } catch (error) {
        console.error('승인 대기 페이지: 인증 확인 오류:', error)
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <Layout user={user}>
      <ApprovalList user={user} />
    </Layout>
  )
}
