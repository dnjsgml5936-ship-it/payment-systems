import { prisma } from './prisma'

export interface NotificationData {
  title: string
  message: string
  type: string
  data?: any
}

// 알림 생성 함수
export async function createNotification(
  userId: string,
  notification: NotificationData
) {
  return await prisma.notification.create({
    data: {
      userId,
      ...notification,
    }
  })
}

// 여러 사용자에게 알림 전송
export async function createNotifications(
  userIds: string[],
  notification: NotificationData
) {
  return await prisma.notification.createMany({
    data: userIds.map(userId => ({
      userId,
      ...notification,
    }))
  })
}

// 역할별 사용자 조회
export async function getUsersByRole(role: string) {
  return await prisma.user.findMany({
    where: { role: role as any },
    select: { id: true, name: true, email: true }
  })
}

// 정산결의서 제출 시 알림
export async function notifySettlementSubmitted(
  settlementId: string,
  authorName: string
) {
  const approvers = await getUsersByRole('REPRESENTATIVE')
  const viceApprovers = await getUsersByRole('VICE_REPRESENTATIVE')
  const allApprovers = [...approvers, ...viceApprovers]

  if (allApprovers.length > 0) {
    await createNotifications(
      allApprovers.map(user => user.id),
      {
        title: '새로운 정산결의서',
        message: `${authorName}님이 정산결의서를 제출했습니다.`,
        type: 'approval_request',
        data: { requestId: settlementId }
      }
    )
  }
}

// 결재 결과 알림
export async function notifyApprovalResult(
  settlementId: string,
  authorId: string,
  status: 'APPROVED' | 'REJECTED',
  comment?: string
) {
  const statusText = status === 'APPROVED' ? '승인' : '반려'
  const message = status === 'APPROVED' 
    ? `정산결의서가 승인되었습니다.`
    : `정산결의서가 반려되었습니다.${comment ? ` 사유: ${comment}` : ''}`

  await createNotification(authorId, {
    title: `정산결의서 ${statusText}`,
    message,
    type: 'approval_result',
    data: { requestId: settlementId, status }
  })
}

// 송금 준비 알림
export async function notifyPaymentReady(settlementId: string, authorName: string) {
  const accountants = await getUsersByRole('ACCOUNTANT')

  if (accountants.length > 0) {
    await createNotifications(
      accountants.map(user => user.id),
      {
        title: '송금 대기 정산결의서',
        message: `${authorName}님의 정산결의서가 승인되어 송금 처리가 필요합니다.`,
        type: 'payment_ready',
        data: { requestId: settlementId }
      }
    )
  }
}

// 송금 완료 알림
export async function notifyPaymentCompleted(settlementId: string, authorId: string) {
  await createNotification(authorId, {
    title: '송금 완료',
    message: `정산결의서의 송금이 완료되었습니다.`,
    type: 'payment_completed',
    data: { requestId: settlementId }
  })
}
