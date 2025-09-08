import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, requireAuth, UserRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SettlementStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth([UserRole.ACCOUNTANT, UserRole.ADMIN])
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const skip = (page - 1) * limit

    const where: any = {
      status: SettlementStatus.APPROVED, // 승인된 것만
    }

    const [settlements, total] = await Promise.all([
      prisma.settlementRequest.findMany({
        where,
        include: {
          author: true,
          items: true,
          approvals: {
            include: { approver: true }
          },
          payment: {
            include: { processor: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.settlementRequest.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        settlements,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Get payments error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
