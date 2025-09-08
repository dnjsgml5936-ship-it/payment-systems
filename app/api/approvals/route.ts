import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { UserRole } from '@/lib/auth'
import { getSettlements } from '@/lib/settlements-store'

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

export async function GET(request: NextRequest) {
  try {
    console.log('=== 승인 목록 조회 시작 ===')
    
    // 요청 헤더에서 Authorization 토큰 가져오기
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    console.log('승인 API 토큰 존재 여부:', !!token)

    if (!token) {
      console.log('승인 API 토큰이 없음')
      return NextResponse.json({ success: false, error: '인증 토큰이 없습니다.' }, { status: 401 })
    }

    // 토큰으로 사용자 인증
    console.log('승인 API 사용자 인증 시도 중...')
    const user = await authenticateUser(token)
    console.log('승인 API 인증된 사용자:', user)

    // 권한 확인
    if (![UserRole.REPRESENTATIVE, UserRole.VICE_REPRESENTATIVE, UserRole.ADMIN].includes(user.role as UserRole)) {
      console.log('승인 권한 없음:', user.role)
      return NextResponse.json({ success: false, error: '승인 권한이 없습니다.' }, { status: 403 })
    }
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    // 공유 저장소에서 데이터 가져오기
    let settlements = getSettlements()
    
    console.log('승인 API - 전체 정산결의서 수:', settlements.length)

    // 상태별 필터링
    if (status === 'pending') {
      settlements = settlements.filter(s => s.status === 'PENDING')
    } else if (status === 'approved') {
      settlements = settlements.filter(s => s.status === 'APPROVED')
    } else if (status === 'rejected') {
      settlements = settlements.filter(s => s.status === 'REJECTED')
    }

    // 페이지네이션
    const skip = (page - 1) * limit
    const paginatedSettlements = settlements.slice(skip, skip + limit)

    return NextResponse.json({
      success: true,
      data: {
        settlements: paginatedSettlements,
        pagination: {
          total: settlements.length,
          page,
          limit,
          totalPages: Math.ceil(settlements.length / limit)
        }
      }
    })
  } catch (error) {
    console.error('Get approvals error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
