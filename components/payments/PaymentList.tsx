'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AuthUser } from '@/lib/auth'
import { SettlementRequest } from '@prisma/client'
import StatusBadge from '@/components/ui/StatusBadge'
import Button from '@/components/ui/Button'
import { DollarSign, Eye, Clock } from 'lucide-react'

interface PaymentListProps {
  user: AuthUser
}

export default function PaymentList({ user }: PaymentListProps) {
  const [settlements, setSettlements] = useState<SettlementRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSettlements()
  }, [])

  const fetchSettlements = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/payments')
      const data = await response.json()
      
      if (data.success) {
        setSettlements(data.data.settlements)
      }
    } catch (error) {
      console.error('Failed to fetch settlements:', error)
    } finally {
      setLoading(false)
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
        <h1 className="text-2xl font-bold text-gray-900">송금 처리</h1>
        <p className="mt-1 text-sm text-gray-500">
          승인된 정산결의서의 송금을 처리하세요.
        </p>
      </div>

      {/* 송금 대기 통계 */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Clock className="h-8 w-8 text-warning-400" />
          </div>
          <div className="ml-5">
            <h3 className="text-lg font-medium text-gray-900">송금 대기</h3>
            <p className="text-2xl font-bold text-warning-600">
              {settlements.filter(s => !s.payment).length}건
            </p>
          </div>
        </div>
      </div>

      {/* 정산결의서 목록 */}
      <div className="bg-white shadow rounded-lg">
        {settlements.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            송금 처리할 정산결의서가 없습니다.
          </div>
        ) : (
          <div className="overflow-hidden">
            <div className="divide-y divide-gray-200">
              {settlements.map((settlement) => (
                <div key={settlement.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <DollarSign className="h-5 w-5 text-primary-500" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {settlement.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {settlement.author.name} • {new Date(settlement.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          {settlement.items.length}개 항목
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-medium text-gray-900">
                        ₩{Number(settlement.totalAmount).toLocaleString()}
                      </span>
                      <StatusBadge status={settlement.status} />
                      <div className="flex space-x-2">
                        <Link href={`/payments/${settlement.id}`}>
                          <Button variant="secondary" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            상세보기
                          </Button>
                        </Link>
                        {!settlement.payment && (
                          <Link href={`/payments/${settlement.id}/process`}>
                            <Button variant="success" size="sm">
                              <DollarSign className="h-4 w-4 mr-1" />
                              송금처리
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
