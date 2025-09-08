'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { AuthUser } from '@/lib/auth'
import { SettlementRequest } from '@prisma/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import { ArrowLeft, DollarSign, FileText } from 'lucide-react'

interface PaymentProcessFormProps {
  user: AuthUser
  requestId: string
}

const paymentSchema = z.object({
  bankName: z.string().min(1, '은행명을 입력해주세요'),
  accountNumber: z.string().min(1, '계좌번호를 입력해주세요'),
  paymentDate: z.string().min(1, '송금일자를 선택해주세요'),
  note: z.string().optional(),
})

type PaymentFormData = z.infer<typeof paymentSchema>

export default function PaymentProcessForm({ user, requestId }: PaymentProcessFormProps) {
  const router = useRouter()
  const [settlement, setSettlement] = useState<SettlementRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      bankName: '',
      accountNumber: '',
      paymentDate: new Date().toISOString().split('T')[0],
      note: '',
    },
  })

  useEffect(() => {
    fetchSettlement()
  }, [requestId])

  const fetchSettlement = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/approvals/${requestId}`)
      const data = await response.json()
      
      if (data.success) {
        setSettlement(data.data)
        
        // 이미 송금 처리된 경우
        if (data.data.payment) {
          toast.error('이미 송금 처리된 정산결의서입니다.')
          router.push('/payments')
          return
        }
        
        // 승인되지 않은 경우
        if (data.data.status !== 'APPROVED') {
          toast.error('승인된 정산결의서만 송금 처리할 수 있습니다.')
          router.push('/payments')
          return
        }
      } else {
        toast.error(data.error || '정산결의서를 불러올 수 없습니다.')
        router.push('/payments')
      }
    } catch (error) {
      console.error('Failed to fetch settlement:', error)
      toast.error('정산결의서를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: PaymentFormData) => {
    setSubmitting(true)
    try {
      const response = await fetch(`/api/payments/${requestId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(result.message)
        router.push('/payments')
      } else {
        toast.error(result.error || '송금 처리에 실패했습니다.')
      }
    } catch (error) {
      toast.error('송금 처리 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!settlement) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">정산결의서를 찾을 수 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          뒤로가기
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">송금 처리</h1>
          <p className="text-sm text-gray-500">
            {settlement.title} - {settlement.author.name}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 정산결의서 상세 */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-lg font-medium text-gray-900 mb-4">정산 내역</h2>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>항목명</th>
                    <th>금액</th>
                    <th>비고</th>
                    <th>첨부파일</th>
                  </tr>
                </thead>
                <tbody>
                  {settlement.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.description}</td>
                      <td className="font-medium">₩{Number(item.amount).toLocaleString()}</td>
                      <td>{item.remarks || '-'}</td>
                      <td>
                        {item.attachmentUrl ? (
                          <a
                            href={item.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-primary-600 hover:text-primary-500"
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            파일보기
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-900">총 금액</span>
                <span className="text-2xl font-bold text-primary-600">
                  ₩{Number(settlement.totalAmount).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {settlement.notes && (
            <div className="card">
              <h2 className="text-lg font-medium text-gray-900 mb-4">비고</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{settlement.notes}</p>
            </div>
          )}
        </div>

        {/* 송금 처리 폼 */}
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">송금 정보</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              {...register('bankName')}
              label="은행명"
              placeholder="예: 국민은행, 신한은행"
              error={errors.bankName?.message}
            />
            
            <Input
              {...register('accountNumber')}
              label="계좌번호"
              placeholder="계좌번호를 입력하세요"
              error={errors.accountNumber?.message}
            />
            
            <Input
              {...register('paymentDate')}
              label="송금일자"
              type="date"
              error={errors.paymentDate?.message}
            />
            
            <Textarea
              {...register('note')}
              label="처리 메모"
              placeholder="송금 처리 관련 메모"
              error={errors.note?.message}
            />

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => router.back()}
              >
                취소
              </Button>
              <Button
                type="submit"
                variant="success"
                className="flex-1"
                loading={submitting}
                disabled={submitting}
              >
                <DollarSign className="h-4 w-4 mr-1" />
                송금완료
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
