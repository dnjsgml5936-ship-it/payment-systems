'use client'

import { useEffect, useState } from 'react'
import { UserRole } from '@/lib/auth'
import Button from '@/components/ui/Button'
import StatusBadge from '@/components/ui/StatusBadge'

interface User {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: string
  lastLoginAt?: string
  isActive: boolean
}

export default function UserList() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
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

      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error('사용자 목록을 가져올 수 없습니다.')
      }

      const data = await response.json()
      
      if (data.success) {
        setUsers(data.data)
      } else {
        throw new Error(data.error || '사용자 목록을 가져올 수 없습니다.')
      }
    } catch (error) {
      console.error('사용자 목록 가져오기 오류:', error)
      setError(error instanceof Error ? error.message : '오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        throw new Error('인증 토큰이 없습니다.')
      }

      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ role: newRole })
      })

      if (!response.ok) {
        throw new Error('사용자 역할 변경에 실패했습니다.')
      }

      // 사용자 목록 새로고침
      fetchUsers()
    } catch (error) {
      console.error('사용자 역할 변경 오류:', error)
      alert(error instanceof Error ? error.message : '오류가 발생했습니다.')
    }
  }

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'bg-red-100 text-red-800'
      case UserRole.REPRESENTATIVE:
        return 'bg-purple-100 text-purple-800'
      case UserRole.VICE_REPRESENTATIVE:
        return 'bg-blue-100 text-blue-800'
      case UserRole.ACCOUNTANT:
        return 'bg-green-100 text-green-800'
      case UserRole.EMPLOYEE:
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return '관리자'
      case UserRole.REPRESENTATIVE:
        return '대표'
      case UserRole.VICE_REPRESENTATIVE:
        return '부대표'
      case UserRole.ACCOUNTANT:
        return '회계'
      case UserRole.EMPLOYEE:
        return '직원'
      default:
        return '사용자'
    }
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
              <Button onClick={fetchUsers} variant="outline" size="sm">
                다시 시도
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">사용자 목록</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          시스템에 등록된 모든 사용자를 관리할 수 있습니다.
        </p>
      </div>
      
      {users.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">등록된 사용자가 없습니다.</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {users.map((user) => (
            <li key={user.id} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {user.name.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <p className="text-xs text-gray-400">
                      가입일: {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                      {user.lastLoginAt && (
                        <span className="ml-2">
                          최근 로그인: {new Date(user.lastLoginAt).toLocaleDateString('ko-KR')}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <StatusBadge 
                    status={user.isActive ? 'active' : 'inactive'}
                    text={user.isActive ? '활성' : '비활성'}
                  />
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                    className="text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value={UserRole.EMPLOYEE}>직원</option>
                    <option value={UserRole.ACCOUNTANT}>회계</option>
                    <option value={UserRole.VICE_REPRESENTATIVE}>부대표</option>
                    <option value={UserRole.REPRESENTATIVE}>대표</option>
                    <option value={UserRole.ADMIN}>관리자</option>
                  </select>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
