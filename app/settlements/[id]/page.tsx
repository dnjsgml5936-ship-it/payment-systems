'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getCurrentUser, AuthUser } from '@/lib/auth'
import Layout from '@/components/layout/Layout'
import SettlementDetail from '@/components/settlements/SettlementDetail'

export default function SettlementDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('정산결의서 상세: 인증 확인 시작')
        const currentUser = await getCurrentUser()
        console.log('정산결의서 상세: 사용자 정보:', currentUser)

        if (!currentUser) {
          console.log('정산결의서 상세: 사용자 없음, 로그인 페이지로 이동')
          router.push('/auth/login')
          return
        }

        console.log('정산결의서 상세: 사용자 인증 성공')
        setUser(currentUser)
      } catch (error) {
        console.error('정산결의서 상세: 인증 확인 오류:', error)
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
      <SettlementDetail settlementId={params.id as string} user={user} />
    </Layout>
  )
}
