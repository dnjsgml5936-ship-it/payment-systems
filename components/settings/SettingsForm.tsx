'use client'

import { useState } from 'react'
import { AuthUser } from '@/lib/auth'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { toast } from 'react-hot-toast'

interface SettingsFormData {
  name: string
  email: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
  language: string
  timezone: string
}

interface SettingsFormProps {
  user: AuthUser
}

export default function SettingsForm({ user }: SettingsFormProps) {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'preferences'>('profile')
  
  const [formData, setFormData] = useState<SettingsFormData>({
    name: user.name,
    email: user.email,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    language: 'ko',
    timezone: 'Asia/Seoul'
  })

  const handleInputChange = (field: keyof SettingsFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNotificationChange = (field: keyof SettingsFormData['notifications'], value: boolean) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value
      }
    }))
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
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

      const response = await fetch('/api/settings/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          name: formData.name
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '프로필 업데이트에 실패했습니다.')
      }

      toast.success('프로필이 성공적으로 업데이트되었습니다.')
    } catch (error) {
      console.error('프로필 업데이트 오류:', error)
      toast.error(error instanceof Error ? error.message : '프로필 업데이트에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (formData.newPassword !== formData.confirmPassword) {
        throw new Error('새 비밀번호가 일치하지 않습니다.')
      }

      if (formData.newPassword.length < 6) {
        throw new Error('비밀번호는 최소 6자 이상이어야 합니다.')
      }

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

      const response = await fetch('/api/settings/password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '비밀번호 변경에 실패했습니다.')
      }

      toast.success('비밀번호가 성공적으로 변경되었습니다.')
      
      // 폼 초기화
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))
    } catch (error) {
      console.error('비밀번호 변경 오류:', error)
      toast.error(error instanceof Error ? error.message : '비밀번호 변경에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
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

      const response = await fetch('/api/settings/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          notifications: formData.notifications
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '알림 설정 업데이트에 실패했습니다.')
      }

      toast.success('알림 설정이 성공적으로 업데이트되었습니다.')
    } catch (error) {
      console.error('알림 설정 업데이트 오류:', error)
      toast.error(error instanceof Error ? error.message : '알림 설정 업데이트에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handlePreferencesUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
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

      const response = await fetch('/api/settings/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          language: formData.language,
          timezone: formData.timezone
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '환경설정 업데이트에 실패했습니다.')
      }

      toast.success('환경설정이 성공적으로 업데이트되었습니다.')
    } catch (error) {
      console.error('환경설정 업데이트 오류:', error)
      toast.error(error instanceof Error ? error.message : '환경설정 업데이트에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'profile', name: '프로필', icon: '👤' },
    { id: 'security', name: '보안', icon: '🔒' },
    { id: 'notifications', name: '알림', icon: '🔔' },
    { id: 'preferences', name: '환경설정', icon: '⚙️' }
  ] as const

  return (
    <div className="bg-white shadow rounded-lg">
      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {/* 프로필 탭 */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">프로필 정보</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    이름
                  </label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    이메일
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="mt-1 bg-gray-50"
                  />
                  <p className="mt-1 text-sm text-gray-500">이메일은 변경할 수 없습니다.</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" loading={loading}>
                프로필 업데이트
              </Button>
            </div>
          </form>
        )}

        {/* 보안 탭 */}
        {activeTab === 'security' && (
          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">비밀번호 변경</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                    현재 비밀번호
                  </label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                    새 비밀번호
                  </label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    새 비밀번호 확인
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" loading={loading}>
                비밀번호 변경
              </Button>
            </div>
          </form>
        )}

        {/* 알림 탭 */}
        {activeTab === 'notifications' && (
          <form onSubmit={handleNotificationUpdate} className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">알림 설정</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">이메일 알림</label>
                    <p className="text-sm text-gray-500">이메일로 알림을 받습니다.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.notifications.email}
                    onChange={(e) => handleNotificationChange('email', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">푸시 알림</label>
                    <p className="text-sm text-gray-500">브라우저 푸시 알림을 받습니다.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.notifications.push}
                    onChange={(e) => handleNotificationChange('push', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">SMS 알림</label>
                    <p className="text-sm text-gray-500">SMS로 알림을 받습니다.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.notifications.sms}
                    onChange={(e) => handleNotificationChange('sms', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" loading={loading}>
                알림 설정 저장
              </Button>
            </div>
          </form>
        )}

        {/* 환경설정 탭 */}
        {activeTab === 'preferences' && (
          <form onSubmit={handlePreferencesUpdate} className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">환경설정</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                    언어
                  </label>
                  <Select
                    id="language"
                    value={formData.language}
                    onChange={(e) => handleInputChange('language', e.target.value)}
                    className="mt-1"
                  >
                    <option value="ko">한국어</option>
                    <option value="en">English</option>
                    <option value="ja">日本語</option>
                  </Select>
                </div>
                <div>
                  <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                    시간대
                  </label>
                  <Select
                    id="timezone"
                    value={formData.timezone}
                    onChange={(e) => handleInputChange('timezone', e.target.value)}
                    className="mt-1"
                  >
                    <option value="Asia/Seoul">한국 표준시 (KST)</option>
                    <option value="UTC">협정 세계시 (UTC)</option>
                    <option value="America/New_York">미국 동부 시간 (EST)</option>
                    <option value="Europe/London">영국 시간 (GMT)</option>
                  </Select>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" loading={loading}>
                환경설정 저장
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
