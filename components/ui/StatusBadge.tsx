import { clsx } from 'clsx'
import { SettlementStatus, ApprovalStatus } from '@prisma/client'

interface StatusBadgeProps {
  status: SettlementStatus | ApprovalStatus
  className?: string
}

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const getStatusConfig = (status: SettlementStatus | ApprovalStatus) => {
    switch (status) {
      case 'DRAFT':
        return { label: '임시저장', className: 'status-draft' }
      case 'PENDING':
        return { label: '승인대기', className: 'status-pending' }
      case 'APPROVED':
        return { label: '승인완료', className: 'status-approved' }
      case 'REJECTED':
        return { label: '반려', className: 'status-rejected' }
      case 'PAID':
        return { label: '송금완료', className: 'status-paid' }
      default:
        return { label: status, className: 'status-draft' }
    }
  }

  const config = getStatusConfig(status)

  return (
    <span className={clsx('status-badge', config.className, className)}>
      {config.label}
    </span>
  )
}

export default StatusBadge
