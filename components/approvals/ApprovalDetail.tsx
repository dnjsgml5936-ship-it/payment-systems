'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { AuthUser } from '@/lib/auth'
import { SettlementRequest, ApprovalStatus } from '@prisma/client'
import StatusBadge from '@/components/ui/StatusBadge'
import Button from '@/components/ui/Button'
import Textarea from '@/components/ui/Textarea'
import { ArrowLeft, CheckCircle, XCircle, FileText, Download } from 'lucide-react'

interface ApprovalDetailProps {
  user: AuthUser
  requestId: string
}

const approvalSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  comment: z.string().optional(),
})

type ApprovalFormData = z.infer<typeof approvalSchema>

export default function ApprovalDetail({ user, requestId }: ApprovalDetailProps) {
  const router = useRouter()
  const [settlement, setSettlement] = useState<SettlementRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ApprovalFormData>({
    resolver: zodResolver(approvalSchema),
    defaultValues: {
      status: 'APPROVED',
      comment: '',
    },
  })

  const watchedStatus = watch('status')

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
      } else {
        toast.error(data.error || '정산결의서를 불러올 수 없습니다.')
        router.push('/approvals/pending')
      }
    } catch (error) {
      console.error('Failed to fetch settlement:', error)
      toast.error('정산결의서를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: ApprovalFormData) => {
    setSubmitting(true)
    try {
      const response = await fetch(`/api/approvals/${requestId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(result.message)
        router.push('/approvals/pending')
      } else {
        toast.error(result.error || '처리에 실패했습니다.')
      }
    } catch (error) {
      toast.error('처리 중 오류가 발생했습니다.')
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

  const canApprove = (user.role === 'REPRESENTATIVE' || user.role === 'VICE_REPRESENTATIVE' || user.role === 'ADMIN') && 
                     settlement.status === 'PENDING'

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
          <h1 className="text-2xl font-bold text-gray-900">{settlement.title}</h1>
          <p className="text-sm text-gray-500">
            {settlement.author.name} • {new Date(settlement.createdAt).toLocaleDateString()}
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

          {/* 승인 이력 */}
          {settlement.approvals.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-medium text-gray-900 mb-4">승인 이력</h2>
              <div className="space-y-3">
                {settlement.approvals.map((approval) => (
                  <div key={approval.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{approval.approver.name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(approval.createdAt).toLocaleString()}
                      </p>
                      {approval.comment && (
                        <p className="text-sm text-gray-700 mt-1">{approval.comment}</p>
                      )}
                    </div>
                    <StatusBadge status={approval.status} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 승인/반려 폼 */}
        {canApprove && (
          <div className="card">
            <h2 className="text-lg font-medium text-gray-900 mb-4">결재 처리</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">결재 결과</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      {...register('status')}
                      type="radio"
                      value="APPROVED"
                      className="mr-2"
                    />
                    <CheckCircle className="h-4 w-4 mr-1 text-success-500" />
                    <span className="text-success-700">승인</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      {...register('status')}
                      type="radio"
                      value="REJECTED"
                      className="mr-2"
                    />
                    <XCircle className="h-4 w-4 mr-1 text-danger-500" />
                    <span className="text-danger-700">반려</span>
                  </label>
                </div>
              </div>

              <Textarea
                {...register('comment')}
                label={watchedStatus === 'REJECTED' ? '반려 사유' : '비고'}
                placeholder={
                  watchedStatus === 'REJECTED' 
                    ? '반려 사유를 입력하세요' 
                    : '추가 의견이 있다면 입력하세요'
                }
                error={errors.comment?.message}
              />

              <div className="flex space-x-3">
                <Button
                  type="submit"
                  variant={watchedStatus === 'APPROVED' ? 'success' : 'danger'}
                  className="flex-1"
                  loading={submitting}
                  disabled={submitting}
                >
                  {watchedStatus === 'APPROVED' ? '승인하기' : '반려하기'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* 현재 상태 표시 */}
        {!canApprove && (
          <div className="card">
            <h2 className="text-lg font-medium text-gray-900 mb-4">현재 상태</h2>
            <div className="text-center">
              <StatusBadge status={settlement.status} />
              <p className="text-sm text-gray-500 mt-2">
                {settlement.status === 'PENDING' && '승인 대기 중입니다.'}
                {settlement.status === 'APPROVED' && '승인되었습니다.'}
                {settlement.status === 'REJECTED' && '반려되었습니다.'}
                {settlement.status === 'PAID' && '송금이 완료되었습니다.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
