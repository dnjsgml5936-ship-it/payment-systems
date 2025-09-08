'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, AuthUser, UserRole } from '@/lib/auth'
import Layout from '@/components/layout/Layout'
import SettlementForm from '@/components/settlements/SettlementForm'

export default function CreateSettlementPage() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('정산결의서 작성: 인증 확인 시작')
        const currentUser = await getCurrentUser()
        console.log('정산결의서 작성: 사용자 정보:', currentUser)
        
        if (!currentUser) {
          console.log('정산결의서 작성: 사용자 없음, 로그인 페이지로 이동')
          router.push('/auth/login')
          return
        }

        // 권한 확인
        if (![UserRole.EMPLOYEE, UserRole.ADMIN].includes(currentUser.role)) {
          console.log('정산결의서 작성: 권한 없음, 대시보드로 이동')
          router.push('/dashboard')
          return
        }
        
        console.log('정산결의서 작성: 사용자 인증 성공')
        setUser(currentUser)
      } catch (error) {
        console.error('정산결의서 작성: 인증 확인 오류:', error)
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
      <SettlementForm />
    </Layout>
  )
}
