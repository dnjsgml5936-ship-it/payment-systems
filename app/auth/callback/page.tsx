'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('이메일 확인 중...')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const code = searchParams.get('code')
        
        if (code) {
          // 이메일 확인 코드를 세션으로 교환
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          
          if (error) {
            console.error('Auth callback error:', error)
            setStatus('error')
            setMessage('이메일 확인에 실패했습니다: ' + error.message)
            return
          }

          if (data.session) {
            setStatus('success')
            setMessage('이메일 확인이 완료되었습니다!')
            
            // 2초 후 대시보드로 이동
            setTimeout(() => {
              router.push('/dashboard')
            }, 2000)
          }
        } else {
          // 이미 로그인된 상태인지 확인
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session) {
            setStatus('success')
            setMessage('이미 로그인되어 있습니다!')
            setTimeout(() => {
              router.push('/dashboard')
            }, 2000)
          } else {
            setStatus('error')
            setMessage('인증 코드를 찾을 수 없습니다.')
          }
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        setStatus('error')
        setMessage('이메일 확인 중 오류가 발생했습니다.')
      }
    }

    handleAuthCallback()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center">
            {status === 'loading' && (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            )}
            {status === 'success' && (
              <div className="rounded-full h-12 w-12 bg-green-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            {status === 'error' && (
              <div className="rounded-full h-12 w-12 bg-red-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {status === 'loading' && '이메일 확인 중'}
            {status === 'success' && '확인 완료'}
            {status === 'error' && '오류 발생'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {message}
          </p>
          {status === 'error' && (
            <div className="mt-4">
              <button
                onClick={() => router.push('/auth/login')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                로그인 페이지로 이동
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
