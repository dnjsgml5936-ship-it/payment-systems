import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, requireAuth, UserRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SettlementStatus, ApprovalStatus } from '@prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ success: false, error: '인증이 필요합니다.' }, { status: 401 })
    }

    const settlement = await prisma.settlementRequest.findUnique({
      where: { id: params.id },
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

    if (!settlement) {
      return NextResponse.json({ success: false, error: '정산결의서를 찾을 수 없습니다.' }, { status: 404 })
    }

    // 권한 확인
    const canView = 
      user.role === UserRole.ADMIN ||
      settlement.authorId === user.id ||
      (user.role === UserRole.REPRESENTATIVE || user.role === UserRole.VICE_REPRESENTATIVE) ||
      user.role === UserRole.ACCOUNTANT

    if (!canView) {
      return NextResponse.json({ success: false, error: '접근 권한이 없습니다.' }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      data: settlement
    })
  } catch (error) {
    console.error('Get settlement error:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth([UserRole.REPRESENTATIVE, UserRole.VICE_REPRESENTATIVE, UserRole.ADMIN])
    
    const body = await request.json()
    const { status, comment } = body

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ success: false, error: '잘못된 상태입니다.' }, { status: 400 })
    }

    const settlement = await prisma.settlementRequest.findUnique({
      where: { id: params.id },
      include: { author: true }
    })

    if (!settlement) {
      return NextResponse.json({ success: false, error: '정산결의서를 찾을 수 없습니다.' }, { status: 404 })
    }

    if (settlement.status !== SettlementStatus.PENDING) {
      return NextResponse.json({ success: false, error: '이미 처리된 정산결의서입니다.' }, { status: 400 })
    }

    // 트랜잭션으로 승인/반려 처리
    const result = await prisma.$transaction(async (tx) => {
      // 승인/반려 기록 생성
      const approval = await tx.approval.create({
        data: {
          requestId: params.id,
          approverId: user.id,
          status: status as ApprovalStatus,
          comment,
          approvedAt: new Date(),
        }
      })

      // 정산결의서 상태 업데이트
      const updatedSettlement = await tx.settlementRequest.update({
        where: { id: params.id },
        data: {
          status: status === 'APPROVED' ? SettlementStatus.APPROVED : SettlementStatus.REJECTED,
        },
        include: {
          author: true,
          items: true,
          approvals: {
            include: { approver: true }
          }
        }
      })

      return { approval, settlement: updatedSettlement }
    })

    // 알림 생성
    const notificationData = {
      userId: settlement.authorId,
      title: status === 'APPROVED' ? '정산결의서 승인' : '정산결의서 반려',
      message: status === 'APPROVED' 
        ? `정산결의서가 승인되었습니다.`
        : `정산결의서가 반려되었습니다.${comment ? ` 사유: ${comment}` : ''}`,
      type: 'approval_result',
      data: { requestId: params.id, status }
    }

    await prisma.notification.create({
      data: notificationData
    })

    // 승인된 경우 경리에게 알림
    if (status === 'APPROVED') {
      const accountants = await prisma.user.findMany({
        where: { role: UserRole.ACCOUNTANT }
      })

      await prisma.notification.createMany({
        data: accountants.map(accountant => ({
          userId: accountant.id,
          title: '송금 대기 정산결의서',
          message: `${settlement.author.name}님의 정산결의서가 승인되어 송금 처리가 필요합니다.`,
          type: 'payment_ready',
          data: { requestId: params.id }
        }))
      })
    }

    return NextResponse.json({
      success: true,
      data: result.settlement,
      message: status === 'APPROVED' ? '정산결의서가 승인되었습니다.' : '정산결의서가 반려되었습니다.'
    })
  } catch (error) {
    console.error('Approval error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
