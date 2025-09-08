import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, requireAuth, UserRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SettlementStatus } from '@prisma/client'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth([UserRole.ACCOUNTANT, UserRole.ADMIN])
    
    const body = await request.json()
    const { bankName, accountNumber, paymentDate, note } = body

    if (!bankName || !accountNumber || !paymentDate) {
      return NextResponse.json({ success: false, error: '필수 정보를 모두 입력해주세요.' }, { status: 400 })
    }

    const settlement = await prisma.settlementRequest.findUnique({
      where: { id: params.id },
      include: { author: true }
    })

    if (!settlement) {
      return NextResponse.json({ success: false, error: '정산결의서를 찾을 수 없습니다.' }, { status: 404 })
    }

    if (settlement.status !== SettlementStatus.APPROVED) {
      return NextResponse.json({ success: false, error: '승인된 정산결의서만 송금 처리할 수 있습니다.' }, { status: 400 })
    }

    // 이미 송금 처리된 경우
    const existingPayment = await prisma.payment.findUnique({
      where: { requestId: params.id }
    })

    if (existingPayment) {
      return NextResponse.json({ success: false, error: '이미 송금 처리된 정산결의서입니다.' }, { status: 400 })
    }

    // 트랜잭션으로 송금 처리
    const result = await prisma.$transaction(async (tx) => {
      // 송금 기록 생성
      const payment = await tx.payment.create({
        data: {
          requestId: params.id,
          processedBy: user.id,
          bankName,
          accountNumber,
          paymentDate: new Date(paymentDate),
          note,
        }
      })

      // 정산결의서 상태를 송금완료로 업데이트
      const updatedSettlement = await tx.settlementRequest.update({
        where: { id: params.id },
        data: {
          status: SettlementStatus.PAID,
        },
        include: {
          author: true,
          items: true,
          approvals: {
            include: { approver: true }
          },
          payment: {
            include: { processor: true }
          }
        }
      })

      return { payment, settlement: updatedSettlement }
    })

    // 작성자에게 송금완료 알림
    await prisma.notification.create({
      data: {
        userId: settlement.authorId,
        title: '송금 완료',
        message: `정산결의서의 송금이 완료되었습니다.`,
        type: 'payment_completed',
        data: { requestId: params.id }
      }
    })

    return NextResponse.json({
      success: true,
      data: result.settlement,
      message: '송금 처리가 완료되었습니다.'
    })
  } catch (error) {
    console.error('Payment processing error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
