'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, AuthUser, UserRole } from '@/lib/auth'
import Layout from '@/components/layout/Layout'
import UserList from '@/components/users/UserList'

export default function UsersPage() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('사용자관리: 인증 확인 시작')
        const currentUser = await getCurrentUser()
        console.log('사용자관리: 사용자 정보:', currentUser)

        if (!currentUser) {
          console.log('사용자관리: 사용자 없음, 로그인 페이지로 이동')
          router.push('/auth/login')
          return
        }

        // 권한 확인 (관리자만 접근 가능)
        if (currentUser.role !== UserRole.ADMIN) {
          console.log('사용자관리: 권한 없음, 대시보드로 이동')
          router.push('/dashboard')
          return
        }

        console.log('사용자관리: 사용자 인증 성공')
        setUser(currentUser)
      } catch (error) {
        console.error('사용자관리: 인증 확인 오류:', error)
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
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">사용자 관리</h1>
        </div>
        
        <UserList />
      </div>
    </Layout>
  )
}
