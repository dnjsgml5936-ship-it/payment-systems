// 정산결의서 임시 저장소 (실제로는 데이터베이스 사용)
export let settlementsStore: any[] = [
  {
    id: 'settlement_1',
    title: '2024년 1월 출장비 정산',
    status: 'PENDING',
    totalAmount: 150000,
    notes: '서울 출장 관련 비용',
    items: [
      {
        id: 'item_1',
        description: '교통비',
        amount: 50000,
        remarks: '택시비',
        attachmentUrl: null
      },
      {
        id: 'item_2',
        description: '식비',
        amount: 80000,
        remarks: '점심, 저녁',
        attachmentUrl: null
      },
      {
        id: 'item_3',
        description: '숙박비',
        amount: 20000,
        remarks: '1박',
        attachmentUrl: null
      }
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    authorId: 'temp_user_id',
    author: {
      id: 'temp_user_id',
      name: '직원1',
      email: 'employee1@company.com'
    },
    approvals: []
  },
  {
    id: 'settlement_2',
    title: '회의비 정산',
    status: 'APPROVED',
    totalAmount: 75000,
    notes: '월간 팀 회의 관련 비용',
    items: [
      {
        id: 'item_4',
        description: '회의실 대여료',
        amount: 50000,
        remarks: '2시간 대여',
        attachmentUrl: null
      },
      {
        id: 'item_5',
        description: '간식비',
        amount: 25000,
        remarks: '커피, 쿠키',
        attachmentUrl: null
      }
    ],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
    authorId: 'temp_user_id',
    author: {
      id: 'temp_user_id',
      name: '직원2',
      email: 'employee2@company.com'
    },
    approvals: []
  }
]

export function addSettlement(settlement: any) {
  settlementsStore.unshift(settlement)
}

export function getSettlements() {
  return [...settlementsStore]
}

export function updateSettlement(id: string, updates: any) {
  const index = settlementsStore.findIndex(s => s.id === id)
  if (index !== -1) {
    settlementsStore[index] = { ...settlementsStore[index], ...updates }
    return settlementsStore[index]
  }
  return null
}
