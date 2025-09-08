'use client'

import { useState, useEffect } from 'react'
import { AuthUser, UserRole } from '@/lib/auth'

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
import StatusBadge from '@/components/ui/StatusBadge'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import { FileText, CheckCircle, DollarSign, Clock } from 'lucide-react'

interface DashboardContentProps {
  user: AuthUser
}

interface DashboardStats {
  totalSettlements: number
  pendingApprovals: number
  pendingPayments: number
  monthlyTotal: number
}

export default function DashboardContent({ user }: DashboardContentProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalSettlements: 0,
    pendingApprovals: 0,
    pendingPayments: 0,
    monthlyTotal: 0,
  })
  const [recentSettlements, setRecentSettlements] = useState<SettlementRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [user])

  const fetchDashboardData = async () => {
    try {
      // Supabase에서 세션 가져오기
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        console.error('No access token available')
        setLoading(false)
        return
      }

      const response = await fetch('/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        setStats(data.data.stats)
        setRecentSettlements(data.data.recentSettlements)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
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
      case 'PAID':
        return <DollarSign className="h-4 w-4 text-primary-500" />
      case 'REJECTED':
        return <FileText className="h-4 w-4 text-danger-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
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
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <p className="mt-1 text-sm text-gray-500">
          안녕하세요, {user.name}님! 오늘도 좋은 하루 되세요.
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    전체 정산결의서
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalSettlements}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {user.role === UserRole.REPRESENTATIVE || user.role === UserRole.VICE_REPRESENTATIVE || user.role === UserRole.ADMIN ? (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-warning-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      승인 대기
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.pendingApprovals}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {user.role === UserRole.ACCOUNTANT || user.role === UserRole.ADMIN ? (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-success-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      송금 대기
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.pendingPayments}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-6 w-6 text-primary-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    이번 달 총액
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ₩{stats.monthlyTotal.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 빠른 액션 */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">빠른 액션</h2>
        <div className="flex flex-wrap gap-3">
          {user.role === UserRole.EMPLOYEE && (
            <Link href="/settlements/create">
              <Button>새 정산결의서 작성</Button>
            </Link>
          )}
          {(user.role === UserRole.REPRESENTATIVE || user.role === UserRole.VICE_REPRESENTATIVE) && (
            <Link href="/approvals/pending">
              <Button variant="warning">승인 대기 문서</Button>
            </Link>
          )}
          {user.role === UserRole.ACCOUNTANT && (
            <Link href="/payments">
              <Button variant="success">송금 처리</Button>
            </Link>
          )}
        </div>
      </div>

      {/* 최근 정산결의서 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">최근 정산결의서</h2>
        </div>
        <div className="overflow-hidden">
          {recentSettlements.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              최근 정산결의서가 없습니다.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {recentSettlements.map((settlement) => (
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
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
