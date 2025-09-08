import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ success: false, error: '인증이 필요합니다.' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where: { userId: user.id } })
    ])

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Get notifications error:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ success: false, error: '인증이 필요합니다.' }, { status: 401 })
    }

    const body = await request.json()
    const { title, message, type, data, userIds } = body

    if (!title || !message || !type) {
      return NextResponse.json({ success: false, error: '필수 정보를 모두 입력해주세요.' }, { status: 400 })
    }

    // 특정 사용자들에게 알림 전송
    if (userIds && Array.isArray(userIds)) {
      const notifications = await prisma.notification.createMany({
        data: userIds.map((userId: string) => ({
          userId,
          title,
          message,
          type,
          data,
        }))
      })

      return NextResponse.json({
        success: true,
        data: { count: notifications.count },
        message: '알림이 전송되었습니다.'
      })
    }

    // 모든 사용자에게 알림 전송
    const allUsers = await prisma.user.findMany({
      select: { id: true }
    })

    const notifications = await prisma.notification.createMany({
      data: allUsers.map(user => ({
        userId: user.id,
        title,
        message,
        type,
        data,
      }))
    })

    return NextResponse.json({
      success: true,
      data: { count: notifications.count },
      message: '알림이 전송되었습니다.'
    })
  } catch (error) {
    console.error('Create notification error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
