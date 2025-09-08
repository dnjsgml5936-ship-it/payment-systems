'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthUser } from '@/lib/auth'
import Button from '@/components/ui/Button'
import StatusBadge from '@/components/ui/StatusBadge'
import { Eye, Edit, FileText, Calendar, DollarSign } from 'lucide-react'

interface SettlementItem {
  id: string
  description: string
  amount: number
  remarks?: string
  attachmentUrl?: string
}

interface Settlement {
  id: string
  title: string
  status: string
  totalAmount: number
  notes?: string
  items: SettlementItem[]
  createdAt: string
  updatedAt: string
}

interface MySettlementListProps {
  user: AuthUser
}

export default function MySettlementList({ user }: MySettlementListProps) {
  const router = useRouter()
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSettlements()
  }, [])

  // 페이지 포커스 시 데이터 새로고침
  useEffect(() => {
    const handleFocus = () => {
      fetchSettlements()
    }
    
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const fetchSettlements = async () => {
    try {
      setLoading(true)
      setError(null)

      // Supabase에서 세션 가져오기
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        throw new Error('인증 토큰이 없습니다.')
      }

      const response = await fetch('/api/settlements', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error('정산결의서 목록을 가져올 수 없습니다.')
      }

      const data = await response.json()
      
      if (data.success) {
        setSettlements(data.data.settlements)
      } else {
        throw new Error(data.error || '정산결의서 목록을 가져올 수 없습니다.')
      }
    } catch (error) {
      console.error('정산결의서 목록 가져오기 오류:', error)
      setError(error instanceof Error ? error.message : '오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'PAID':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '대기중'
      case 'APPROVED':
        return '승인됨'
      case 'REJECTED':
        return '거부됨'
      case 'PAID':
        return '지급완료'
      default:
        return status
    }
  }

  const handleViewDetail = (settlementId: string) => {
    router.push(`/settlements/${settlementId}`)
  }

  const handleEdit = (settlementId: string) => {
    router.push(`/settlements/${settlementId}/edit`)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">오류</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <Button onClick={fetchSettlements} variant="outline" size="sm">
                다시 시도
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">내 정산결의서</h1>
          <p className="mt-1 text-sm text-gray-500">
            제출한 정산결의서를 확인하고 관리할 수 있습니다.
          </p>
        </div>
        <Button onClick={() => router.push('/settlements/create')}>
          새 정산결의서 작성
        </Button>
      </div>

      {settlements.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">정산결의서가 없습니다</h3>
          <p className="mt-1 text-sm text-gray-500">
            아직 제출한 정산결의서가 없습니다.
          </p>
          <div className="mt-6">
            <Button onClick={() => router.push('/settlements/create')}>
              첫 정산결의서 작성하기
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {settlements.map((settlement) => (
              <li key={settlement.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {settlement.title}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(settlement.status)}`}>
                        {getStatusLabel(settlement.status)}
                      </span>
                    </div>
                    
                    <div className="mt-2 flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span>₩{settlement.totalAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{new Date(settlement.createdAt).toLocaleDateString('ko-KR')}</span>
                      </div>
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        <span>{settlement.items.length}개 항목</span>
                      </div>
                    </div>

                    {settlement.notes && (
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {settlement.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetail(settlement.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      상세보기
                    </Button>
                    {settlement.status === 'PENDING' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(settlement.id)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        수정
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
