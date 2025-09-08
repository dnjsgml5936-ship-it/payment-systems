'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { signUp } from '@/lib/auth'
import { UserRole } from '@prisma/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

const registerSchema = z.object({
  name: z.string().min(2, '이름은 최소 2자 이상이어야 합니다'),
  email: z.string().email('올바른 이메일 주소를 입력해주세요'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
  confirmPassword: z.string(),
  role: z.nativeEnum(UserRole),
}).refine((data) => data.password === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['confirmPassword'],
})

type RegisterFormData = z.infer<typeof registerSchema>

const roleOptions = [
  { value: UserRole.EMPLOYEE, label: '직원' },
  { value: UserRole.REPRESENTATIVE, label: '대표' },
  { value: UserRole.VICE_REPRESENTATIVE, label: '부대표' },
  { value: UserRole.ACCOUNTANT, label: '경리' },
  { value: UserRole.ADMIN, label: '관리자' },
]

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true)
    try {
      // 개발 환경에서 이메일 확인 없이 회원가입
      const response = await fetch('/api/auth/signup-dev', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          name: data.name,
          role: data.role,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '회원가입에 실패했습니다.')
      }

      toast.success('회원가입이 완료되었습니다!')
      router.push('/auth/login')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '회원가입에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            회원가입
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            새 계정을 생성하세요
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input
              {...register('name')}
              label="이름"
              type="text"
              autoComplete="name"
              error={errors.name?.message}
            />
            <Input
              {...register('email')}
              label="이메일"
              type="email"
              autoComplete="email"
              error={errors.email?.message}
            />
            <Select
              {...register('role')}
              label="역할"
              options={roleOptions}
              error={errors.role?.message}
            />
            <Input
              {...register('password')}
              label="비밀번호"
              type="password"
              autoComplete="new-password"
              error={errors.password?.message}
            />
            <Input
              {...register('confirmPassword')}
              label="비밀번호 확인"
              type="password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
            />
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              loading={loading}
              disabled={loading}
            >
              회원가입
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              이미 계정이 있으신가요?{' '}
              <a
                href="/auth/login"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                로그인
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
