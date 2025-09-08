'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/auth'
import { AuthUser } from '@/lib/auth'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'

interface HeaderProps {
  user: AuthUser
}

export default function Header({ user }: HeaderProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSignOut = async () => {
    setLoading(true)
    try {
      await signOut()
      toast.success('로그아웃되었습니다.')
      router.push('/auth/login')
    } catch (error) {
      toast.error('로그아웃에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'EMPLOYEE': return '직원'
      case 'REPRESENTATIVE': return '대표'
      case 'VICE_REPRESENTATIVE': return '부대표'
      case 'ACCOUNTANT': return '경리'
      case 'ADMIN': return '관리자'
      default: return role
    }
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              정산결의서 시스템
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-700">
              <span className="font-medium">{user.name}</span>
              <span className="ml-2 text-gray-500">({getRoleLabel(user.role)})</span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSignOut}
              loading={loading}
            >
              로그아웃
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
