'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthUser } from '@/lib/auth'
import Button from '@/components/ui/Button'
import StatusBadge from '@/components/ui/StatusBadge'
import { ArrowLeft, Edit, FileText, Calendar, DollarSign, User, MessageSquare } from 'lucide-react'

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
  author?: {
    id: string
    name: string
    email: string
  }
}

interface SettlementDetailProps {
  settlementId: string
  user: AuthUser
}

export default function SettlementDetail({ settlementId, user }: SettlementDetailProps) {
  const router = useRouter()
  const [settlement, setSettlement] = useState<Settlement | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSettlement()
  }, [settlementId])

  const fetchSettlement = async () => {
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

      const response = await fetch(`/api/settlements/${settlementId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error('정산결의서를 가져올 수 없습니다.')
      }

      const data = await response.json()
      
      if (data.success) {
        setSettlement(data.data)
      } else {
        throw new Error(data.error || '정산결의서를 가져올 수 없습니다.')
      }
    } catch (error) {
      console.error('정산결의서 가져오기 오류:', error)
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

  const handleEdit = () => {
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
              <Button onClick={fetchSettlement} variant="outline" size="sm">
                다시 시도
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!settlement) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">정산결의서를 찾을 수 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            뒤로가기
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{settlement.title}</h1>
            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{new Date(settlement.createdAt).toLocaleDateString('ko-KR')}</span>
              </div>
              {settlement.author && (
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  <span>{settlement.author.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(settlement.status)}`}>
            {getStatusLabel(settlement.status)}
          </span>
          {settlement.status === 'PENDING' && settlement.authorId === user.id && (
            <Button onClick={handleEdit} variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-1" />
              수정
            </Button>
          )}
        </div>
      </div>

      {/* 기본 정보 */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">기본 정보</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">제목</label>
            <p className="mt-1 text-sm text-gray-900">{settlement.title}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">총 금액</label>
            <p className="mt-1 text-lg font-semibold text-primary-600">
              ₩{settlement.totalAmount.toLocaleString()}
            </p>
          </div>
          {settlement.notes && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">비고</label>
              <p className="mt-1 text-sm text-gray-900">{settlement.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* 정산 내역 */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">정산 내역</h2>
        <div className="space-y-4">
          {settlement.items.map((item, index) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700">항목 {index + 1}</h3>
                <span className="text-sm font-semibold text-gray-900">
                  ₩{item.amount.toLocaleString()}
                </span>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-500">항목명</label>
                  <p className="text-sm text-gray-900">{item.description}</p>
                </div>
                {item.remarks && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500">비고</label>
                    <p className="text-sm text-gray-900">{item.remarks}</p>
                  </div>
                )}
                {item.attachmentUrl && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500">첨부파일</label>
                    <div className="flex items-center mt-1">
                      <FileText className="h-4 w-4 text-gray-400 mr-2" />
                      <a
                        href={item.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-600 hover:text-primary-500"
                      >
                        첨부파일 보기
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 승인/결제 내역 (향후 구현) */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">처리 내역</h2>
        <div className="text-center py-8 text-gray-500">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm">아직 처리 내역이 없습니다.</p>
        </div>
      </div>
    </div>
  )
}
