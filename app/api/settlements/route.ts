import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { UserRole } from '@/lib/auth'
import { settlementsStore, addSettlement, getSettlements } from '@/lib/settlements-store'

// 토큰으로 사용자 인증하는 헬퍼 함수
async function authenticateUser(token: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    }
  )

  const { data: { user: authUser }, error } = await supabase.auth.getUser(token)

  if (error || !authUser) {
    throw new Error('인증이 필요합니다.')
  }

  const userMetadata = authUser.user_metadata || {}
  return {
    id: authUser.id,
    email: authUser.email,
    name: userMetadata.name || authUser.email?.split('@')[0] || '사용자',
    role: userMetadata.role || 'USER'
  }
}

// 저장소는 lib/settlements-store.ts에서 가져옴

export async function POST(request: NextRequest) {
  try {
    console.log('=== 정산결의서 제출 시작 ===')
    
    // 요청 헤더에서 Authorization 토큰 가져오기
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    console.log('토큰 존재 여부:', !!token)
    console.log('토큰 길이:', token?.length || 0)

    if (!token) {
      console.log('토큰이 없음')
      return NextResponse.json({ success: false, error: '인증 토큰이 없습니다.' }, { status: 401 })
    }

    // 토큰으로 사용자 인증
    console.log('사용자 인증 시도 중...')
    const user = await authenticateUser(token)
    console.log('인증된 사용자:', user)

    // 권한 확인
    if (![UserRole.EMPLOYEE, UserRole.ADMIN].includes(user.role as UserRole)) {
      console.log('권한 없음:', user.role)
      return NextResponse.json({ success: false, error: '접근 권한이 없습니다.' }, { status: 403 })
    }
    
    const body = await request.json()
    const { title, items, notes, totalAmount } = body
    
    console.log('요청 데이터:', { title, items, notes, totalAmount })

    // 임시 정산결의서 생성 (데이터베이스 연결 문제로 인해)
    const settlement = {
      id: `settlement_${Date.now()}`,
      title,
      authorId: user.id,
      author: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      status: 'PENDING',
      totalAmount,
      notes,
      items: items.map((item: any, index: number) => ({
        id: `item_${Date.now()}_${index}`,
        description: item.description,
        amount: item.amount,
        remarks: item.remarks,
        attachmentUrl: item.attachment,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // 메모리 저장소에 추가
    addSettlement(settlement)
    
    console.log('새 정산결의서 추가됨:', settlement)
    console.log('현재 저장소 크기:', settlementsStore.length)
    console.log('=== 정산결의서 제출 완료 ===')

    return NextResponse.json({
      success: true,
      data: settlement,
      message: '정산결의서가 제출되었습니다.'
    })
  } catch (error) {
    console.error('Create settlement error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('=== 정산결의서 목록 조회 시작 ===')
    
    // 요청 헤더에서 Authorization 토큰 가져오기
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    console.log('GET 요청 토큰 존재 여부:', !!token)

    if (!token) {
      console.log('GET 요청 토큰이 없음')
      return NextResponse.json({ success: false, error: '인증 토큰이 없습니다.' }, { status: 401 })
    }

    // 토큰으로 사용자 인증
    console.log('GET 요청 사용자 인증 시도 중...')
    const user = await authenticateUser(token)
    console.log('GET 요청 인증된 사용자:', user)

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    // 메모리 저장소에서 데이터 가져오기
    let settlements = getSettlements()
    
    console.log('전체 정산결의서 수:', settlements.length)
    console.log('현재 사용자 ID:', user.id)
    console.log('현재 사용자 역할:', user.role)

    // 사용자별 필터링 (직원은 자신의 정산결의서만, 관리자는 모든 정산결의서)
    if (user.role === 'EMPLOYEE') {
      settlements = settlements.filter(settlement => settlement.authorId === user.id)
      console.log('필터링 후 정산결의서 수:', settlements.length)
    }

    // 상태별 필터링
    if (status) {
      settlements = settlements.filter(settlement => settlement.status === status)
    }

    // 페이지네이션
    const skip = (page - 1) * limit
    const paginatedSettlements = settlements.slice(skip, skip + limit)

    // author 정보 추가 (실제 작성자 정보 유지)
    const settlementsWithAuthor = paginatedSettlements.map(settlement => ({
      ...settlement,
      author: settlement.author || {
        id: settlement.authorId,
        name: '작성자',
        email: 'unknown@example.com'
      }
    }))

    return NextResponse.json({
      success: true,
      data: {
        settlements: settlementsWithAuthor,
        pagination: {
          total: settlements.length,
          page,
          limit,
          totalPages: Math.ceil(settlements.length / limit)
        }
      }
    })
  } catch (error) {
    console.error('Get settlements error:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
