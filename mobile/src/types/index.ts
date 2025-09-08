export interface User {
  id: string;
  email: string;
  name: string;
  role: 'EMPLOYEE' | 'REPRESENTATIVE' | 'VICE_REPRESENTATIVE' | 'ACCOUNTANT' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

export interface SettlementItem {
  id: string;
  requestId: string;
  description: string;
  amount: number;
  remarks?: string;
  attachmentUrl?: string;
}

export interface SettlementRequest {
  id: string;
  title: string;
  authorId: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';
  totalAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  author: User;
  items: SettlementItem[];
  approvals: Approval[];
  payment?: Payment;
}

export interface Approval {
  id: string;
  requestId: string;
  approverId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  comment?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  approver: User;
}

export interface Payment {
  id: string;
  requestId: string;
  processedBy: string;
  bankName: string;
  accountNumber: string;
  paymentDate: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
  processor: User;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  data?: any;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
