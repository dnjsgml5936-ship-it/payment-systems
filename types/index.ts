import { UserRole, SettlementStatus, ApprovalStatus } from '@prisma/client'

export type { UserRole, SettlementStatus, ApprovalStatus }

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export interface SettlementRequest {
  id: string
  title: string
  authorId: string
  status: SettlementStatus
  totalAmount: number
  notes?: string
  createdAt: Date
  updatedAt: Date
  author: User
  items: SettlementItem[]
  approvals: Approval[]
  payment?: Payment
}

export interface SettlementItem {
  id: string
  requestId: string
  description: string
  amount: number
  remarks?: string
  attachmentUrl?: string
}

export interface Approval {
  id: string
  requestId: string
  approverId: string
  status: ApprovalStatus
  comment?: string
  approvedAt?: Date
  createdAt: Date
  updatedAt: Date
  approver: User
}

export interface Payment {
  id: string
  requestId: string
  processedBy: string
  bankName: string
  accountNumber: string
  paymentDate: Date
  note?: string
  createdAt: Date
  updatedAt: Date
  processor: User
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: string
  isRead: boolean
  data?: any
  createdAt: Date
}

// Form types
export interface SettlementFormData {
  title: string
  items: {
    description: string
    amount: number
    remarks?: string
    attachment?: File
  }[]
  notes?: string
}

export interface ApprovalFormData {
  status: ApprovalStatus
  comment?: string
}

export interface PaymentFormData {
  bankName: string
  accountNumber: string
  paymentDate: Date
  note?: string
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
