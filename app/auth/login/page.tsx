'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { signIn } from '@/lib/auth'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

const loginSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력해주세요'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true)
    try {
      console.log('로그인 시도:', data.email)
      const result = await signIn(data.email, data.password)
      console.log('로그인 결과:', result)
      
      // 세션이 제대로 설정되었는지 확인
      if (!result.session || !result.user) {
        throw new Error('로그인 세션을 생성할 수 없습니다.')
      }
      
      console.log('세션 확인:', result.session.access_token ? '토큰 있음' : '토큰 없음')
      
      toast.success('로그인되었습니다.')
      
      // 세션 설정 후 잠시 대기
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 대시보드로 이동
      router.push('/dashboard')
      
    } catch (error) {
      console.error('로그인 오류:', error)
      toast.error(error instanceof Error ? error.message : '로그인에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            정산결의서 시스템
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            계정에 로그인하세요
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input
              {...register('email')}
              label="이메일"
              type="email"
              autoComplete="email"
              error={errors.email?.message}
            />
            <Input
              {...register('password')}
              label="비밀번호"
              type="password"
              autoComplete="current-password"
              error={errors.password?.message}
            />
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              loading={loading}
              disabled={loading}
            >
              로그인
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              계정이 없으신가요?{' '}
              <a
                href="/auth/register"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                회원가입
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
