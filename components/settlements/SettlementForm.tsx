'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import { Plus, Trash2, Upload, FileText } from 'lucide-react'

const settlementSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요'),
  items: z.array(
    z.object({
      description: z.string().min(1, '항목명을 입력해주세요'),
      amount: z.number().min(1, '금액을 입력해주세요'),
      remarks: z.string().optional(),
      attachment: z.any().optional(),
    })
  ).min(1, '최소 하나의 항목을 추가해주세요'),
  notes: z.string().optional(),
})

type SettlementFormData = z.infer<typeof settlementSchema>

export default function SettlementForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<{ [key: number]: boolean }>({})

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SettlementFormData>({
    resolver: zodResolver(settlementSchema),
    defaultValues: {
      title: '',
      items: [{ description: '', amount: 0, remarks: '', attachment: null }],
      notes: '',
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })

  const watchedItems = watch('items')
  const totalAmount = watchedItems.reduce((sum, item) => sum + (item.amount || 0), 0)

  const handleFileUpload = async (file: File, index: number) => {
    setUploadingFiles(prev => ({ ...prev, [index]: true }))
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      const data = await response.json()
      
      if (data.success) {
        setValue(`items.${index}.attachment`, data.data.url)
        toast.success('파일이 업로드되었습니다.')
      } else {
        toast.error('파일 업로드에 실패했습니다.')
      }
    } catch (error) {
      toast.error('파일 업로드 중 오류가 발생했습니다.')
    } finally {
      setUploadingFiles(prev => ({ ...prev, [index]: false }))
    }
  }

  const onSubmit = async (data: SettlementFormData) => {
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

      const response = await fetch('/api/settlements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          ...data,
          totalAmount,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('정산결의서가 제출되었습니다.')
        // 페이지 새로고침을 위해 잠시 대기 후 이동
        setTimeout(() => {
          router.push('/settlements/my')
          router.refresh()
        }, 1000)
      } else {
        toast.error(result.error || '제출에 실패했습니다.')
      }
    } catch (error) {
      console.error('정산결의서 제출 오류:', error)
      toast.error(error instanceof Error ? error.message : '제출 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">정산결의서 작성</h1>
        <p className="mt-1 text-sm text-gray-500">
          정산내역을 입력하고 결재를 요청하세요.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">기본 정보</h2>
          <div className="space-y-4">
            <Input
              {...register('title')}
              label="제목"
              placeholder="정산결의서 제목을 입력하세요"
              error={errors.title?.message}
            />
            <Textarea
              {...register('notes')}
              label="비고"
              placeholder="추가 설명이 있다면 입력하세요"
              error={errors.notes?.message}
            />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">정산 내역</h2>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => append({ description: '', amount: 0, remarks: '', attachment: null })}
            >
              <Plus className="h-4 w-4 mr-1" />
              항목 추가
            </Button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-700">항목 {index + 1}</h3>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    {...register(`items.${index}.description`)}
                    label="항목명"
                    placeholder="예: 교통비, 식비, 숙박비"
                    error={errors.items?.[index]?.description?.message}
                  />
                  <Input
                    {...register(`items.${index}.amount`, { valueAsNumber: true })}
                    label="금액"
                    type="number"
                    placeholder="0"
                    error={errors.items?.[index]?.amount?.message}
                  />
                </div>

                <div className="mt-4">
                  <Textarea
                    {...register(`items.${index}.remarks`)}
                    label="비고"
                    placeholder="추가 설명"
                    error={errors.items?.[index]?.remarks?.message}
                  />
                </div>

                <div className="mt-4">
                  <label className="label">첨부파일</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          handleFileUpload(file, index)
                        }
                      }}
                      className="hidden"
                      id={`file-${index}`}
                    />
                    <label
                      htmlFor={`file-${index}`}
                      className="flex items-center px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {uploadingFiles[index] ? '업로드 중...' : '파일 선택'}
                    </label>
                    {watchedItems[index]?.attachment && (
                      <div className="flex items-center text-sm text-success-600">
                        <FileText className="h-4 w-4 mr-1" />
                        파일 업로드 완료
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-900">총 금액</span>
              <span className="text-2xl font-bold text-primary-600">
                ₩{totalAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            취소
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={loading || totalAmount === 0}
          >
            제출하기
          </Button>
        </div>
      </form>
    </div>
  )
}
