'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AuthUser } from '@/lib/auth'
import { SettlementRequest, SettlementStatus } from '@prisma/client'
import StatusBadge from '@/components/ui/StatusBadge'
import Button from '@/components/ui/Button'
import { Eye, CheckCircle, XCircle, Clock } from 'lucide-react'

interface ApprovalListProps {
  user: AuthUser
}

export default function ApprovalList({ user }: ApprovalListProps) {
  const [settlements, setSettlements] = useState<SettlementRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending')

  useEffect(() => {
    fetchSettlements()
  }, [activeTab])

  const fetchSettlements = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/approvals?status=${activeTab}`)
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

  const getStatusIcon = (status: SettlementStatus) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4 text-warning-500" />
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4 text-success-500" />
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-danger-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const tabs = [
    { key: 'pending', label: '승인 대기', count: 0 },
    { key: 'approved', label: '승인 완료', count: 0 },
    { key: 'rejected', label: '반려', count: 0 },
  ]

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
        <h1 className="text-2xl font-bold text-gray-900">결재 관리</h1>
        <p className="mt-1 text-sm text-gray-500">
          정산결의서를 검토하고 승인 또는 반려하세요.
        </p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* 정산결의서 목록 */}
      <div className="bg-white shadow rounded-lg">
        {settlements.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {activeTab === 'pending' && '승인 대기 중인 정산결의서가 없습니다.'}
            {activeTab === 'approved' && '승인된 정산결의서가 없습니다.'}
            {activeTab === 'rejected' && '반려된 정산결의서가 없습니다.'}
          </div>
        ) : (
          <div className="overflow-hidden">
            <div className="divide-y divide-gray-200">
              {settlements.map((settlement) => (
                <div key={settlement.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(settlement.status)}
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
                      <Link href={`/approvals/${settlement.id}`}>
                        <Button variant="secondary" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          상세보기
                        </Button>
                      </Link>
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
