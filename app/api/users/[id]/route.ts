import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { UserRole } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id
    const { role } = await request.json()

    if (!role || !Object.values(UserRole).includes(role)) {
      return NextResponse.json({ success: false, error: '유효한 역할을 선택해주세요.' }, { status: 400 })
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

    // 사용자 메타데이터에서 역할 확인
    const userMetadata = authUser.user_metadata || {}
    const userRole = userMetadata.role || 'USER'

    // 관리자만 접근 가능
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ success: false, error: '관리자 권한이 필요합니다.' }, { status: 403 })
    }

    // Supabase Admin 클라이언트로 사용자 역할 업데이트
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // 기존 사용자 정보 가져오기
    const { data: { user: targetUser }, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(userId)

    if (getUserError || !targetUser) {
      console.error('Get target user error:', getUserError)
      return NextResponse.json({ success: false, error: '사용자를 찾을 수 없습니다.' }, { status: 404 })
    }

    // 사용자 메타데이터 업데이트
    const updatedMetadata = {
      ...targetUser.user_metadata,
      role: role
    }

    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        user_metadata: updatedMetadata
      }
    )

    if (updateError) {
      console.error('Update user error:', updateError)
      return NextResponse.json({ success: false, error: '사용자 역할 변경에 실패했습니다.' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updateData.user.id,
        email: updateData.user.email,
        name: updateData.user.user_metadata?.name || updateData.user.email?.split('@')[0] || '사용자',
        role: updateData.user.user_metadata?.role || 'USER'
      },
      message: '사용자 역할이 성공적으로 변경되었습니다.'
    })
  } catch (error) {
    console.error('Update user role API error:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
