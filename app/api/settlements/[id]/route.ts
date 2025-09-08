import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { UserRole } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const settlementId = params.id

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

    // 임시 데이터 (데이터베이스 연결 문제로 인해)
    // 실제로는 데이터베이스에서 정산결의서를 조회하고 권한을 확인해야 함
    const settlement = {
      id: settlementId,
      title: '샘플 정산결의서',
      status: 'PENDING',
      totalAmount: 150000,
      notes: '출장비 정산',
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    }

    return NextResponse.json({
      success: true,
      data: settlement
    })
  } catch (error) {
    console.error('Get settlement detail error:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
