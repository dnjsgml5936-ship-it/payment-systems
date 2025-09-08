import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { UserRole } from '@/lib/auth'

// 임시 메모리 저장소 (실제로는 데이터베이스 사용)
let approvalsStore: any[] = []

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const settlementId = params.id
    const { action, comment } = await request.json() // action: 'approve' | 'reject'

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ success: false, error: '유효한 액션을 선택해주세요.' }, { status: 400 })
    }

    // 요청 헤더에서 Authorization 토큰 가져오기
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ success: false, error: '인증 토큰이 없습니다.' }, { status: 401 })
    }

    // Supabase 클라이언트 생성 (토큰으로 인증)
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

    // 토큰으로 사용자 정보 가져오기
    const { data: { user: authUser }, error } = await supabase.auth.getUser(token)

    if (error || !authUser) {
      console.error('Get user error:', error)
      return NextResponse.json({ success: false, error: '인증이 필요합니다.' }, { status: 401 })
    }

    // 사용자 메타데이터에서 정보 가져오기
    const userMetadata = authUser.user_metadata || {}
    const user = {
      id: authUser.id,
      email: authUser.email,
      name: userMetadata.name || authUser.email?.split('@')[0] || '사용자',
      role: userMetadata.role || 'USER'
    }

    // 권한 확인
    if (![UserRole.REPRESENTATIVE, UserRole.VICE_REPRESENTATIVE, UserRole.ADMIN].includes(user.role as UserRole)) {
      return NextResponse.json({ success: false, error: '승인 권한이 없습니다.' }, { status: 403 })
    }

    // 도장 이미지 경로 결정
    let stampImage = null
    if (user.name === '이아현') {
      stampImage = '/images/이아현.png'
    } else if (user.name === '김민수') {
      stampImage = '/images/김민수.png'
    }

    // 승인/거부 기록 생성
    const approval = {
      id: `approval_${Date.now()}`,
      settlementId,
      approverId: user.id,
      approver: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      action: action === 'approve' ? 'APPROVED' : 'REJECTED',
      comment: comment || '',
      stampImage,
      createdAt: new Date().toISOString()
    }

    // 메모리 저장소에 추가
    approvalsStore.push(approval)

    // 정산결의서 상태 업데이트 (실제로는 데이터베이스에서 업데이트)
    const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED'

    return NextResponse.json({
      success: true,
      data: {
        approval,
        settlementStatus: newStatus
      },
      message: action === 'approve' ? '승인되었습니다.' : '거부되었습니다.'
    })
  } catch (error) {
    console.error('Approval API error:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
