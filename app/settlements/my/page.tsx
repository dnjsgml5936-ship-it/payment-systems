'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, AuthUser, UserRole } from '@/lib/auth'
import Layout from '@/components/layout/Layout'
import Button from '@/components/ui/Button'
import StatusBadge from '@/components/ui/StatusBadge'
import Link from 'next/link'
import { FileText, Plus, Eye, Edit } from 'lucide-react'

export enum SettlementStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAID = 'PAID'
}

export interface SettlementRequest {
  id: string
  title: string
  totalAmount: number
  status: SettlementStatus
  createdAt: Date
  author: {
    name: string
  }
}

export default function MySettlementsPage() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [settlements, setSettlements] = useState<SettlementRequest[]>([])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser()
        
        if (!currentUser) {
          router.push('/auth/login')
          return
        }

        // 권한 확인 (직원과 관리자만 접근 가능)
        if (![UserRole.EMPLOYEE, UserRole.ADMIN].includes(currentUser.role)) {
          router.push('/dashboard')
          return
        }
        
        setUser(currentUser)
        fetchMySettlements()
      } catch (error) {
        console.error('내 정산결의서 페이지: 인증 확인 오류:', error)
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const fetchMySettlements = async () => {
    try {
      // 임시 데이터 (실제로는 API에서 가져와야 함)
      const mockSettlements: SettlementRequest[] = [
        {
          id: '1',
          title: '2024년 1월 업무비 정산',
          totalAmount: 150000,
          status: SettlementStatus.PENDING,
          createdAt: new Date('2024-01-15'),
          author: { name: '홍길동' }
        },
        {
          id: '2',
          title: '출장비 정산',
          totalAmount: 85000,
          status: SettlementStatus.APPROVED,
          createdAt: new Date('2024-01-10'),
          author: { name: '홍길동' }
        },
        {
          id: '3',
          title: '회식비 정산',
          totalAmount: 120000,
          status: SettlementStatus.PAID,
          createdAt: new Date('2024-01-05'),
          author: { name: '홍길동' }
        }
      ]
      
      setSettlements(mockSettlements)
    } catch (error) {
      console.error('정산결의서 목록 조회 오류:', error)
    }
  }

  const getStatusIcon = (status: SettlementStatus) => {
    switch (status) {
      case SettlementStatus.PENDING:
        return <FileText className="h-4 w-4 text-warning-500" />
      case SettlementStatus.APPROVED:
        return <FileText className="h-4 w-4 text-success-500" />
      case SettlementStatus.PAID:
        return <FileText className="h-4 w-4 text-primary-500" />
      case SettlementStatus.REJECTED:
        return <FileText className="h-4 w-4 text-danger-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

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
          <div>
            <h1 className="text-2xl font-bold text-gray-900">내 정산결의서</h1>
            <p className="mt-1 text-sm text-gray-500">
              작성한 정산결의서를 확인하고 관리할 수 있습니다.
            </p>
          </div>
          <Link href="/settlements/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              새 정산결의서 작성
            </Button>
          </Link>
        </div>

        {/* 정산결의서 목록 */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">정산결의서 목록</h2>
          </div>
          <div className="overflow-hidden">
            {settlements.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium mb-2">정산결의서가 없습니다</p>
                <p className="text-sm mb-4">새로운 정산결의서를 작성해보세요.</p>
                <Link href="/settlements/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    정산결의서 작성하기
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {settlements.map((settlement) => (
                  <div key={settlement.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(settlement.status)}
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            {settlement.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {settlement.author.name} • {new Date(settlement.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-900">
                          ₩{Number(settlement.totalAmount).toLocaleString()}
                        </span>
                        <StatusBadge status={settlement.status} />
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {settlement.status === SettlementStatus.PENDING && (
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
